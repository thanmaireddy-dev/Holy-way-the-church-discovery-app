import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration from config.js
const firebaseConfig = {
  apiKey: "AIzaSyACSmOPb8_An_eyflC1bfhFGQuYRsY2cCg",
  authDomain: "holy-way-9800e.firebaseapp.com",
  projectId: "holy-way-9800e",
  storageBucket: "holy-way-9800e.firebasestorage.app",
  messagingSenderId: "311183152434",
  appId: "1:311183152434:web:ae5b654af53354d2e3332b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getUniqueLanguages = (massTimings) => {
  const langs = new Set();
  const processArray = (arr) => {
    if (!arr) return;
    arr.forEach(timing => {
      if (timing.languages) {
        timing.languages.forEach(l => langs.add(l));
      }
    });
  };
  if (massTimings) {
    processArray(massTimings.sunday);
    processArray(massTimings.weekday);
    processArray(massTimings.saturday);
  }
  return Array.from(langs);
};

const main = async () => {
  const reportPathRaw = path.join(__dirname, '../src/data/importValidationReport.json');
  const validationReport = JSON.parse(fs.readFileSync(reportPathRaw, 'utf8'));
  const unmatchedChurches = validationReport.unmatchedChurches || [];

  console.log('Fetching existing churches from Firestore...');
  const churchesCol = collection(db, 'churches');
  const snapshot = await getDocs(churchesCol);
  const firestoreChurches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const report = {
    inserted: [],
    skippedDuplicates: [],
    validationFailures: []
  };

  const manualReview = [];

  for (const church of unmatchedChurches) {
    const rawName = church.name ? church.name.trim() : '';

    // Data Quality Safeguards
    const lowerName = rawName.toLowerCase();
    const isSuspicious = 
      lowerName.includes(')') || 
      lowerName.includes('(') || 
      lowerName.includes('sunday') || 
      lowerName.includes('november') || 
      lowerName.includes('feast') ||
      lowerName.length > 50 || 
      lowerName.length < 3;

    if (isSuspicious) {
      manualReview.push({
        reason: "Suspicious naming artifacts detected",
        rawRecord: church
      });
      report.validationFailures.push(rawName);
      continue;
    }

    const normName = normalize(rawName);

    // Duplicate Check against Firestore
    const isDuplicate = firestoreChurches.some(fc => normalize(fc.name) === normName);
    if (isDuplicate) {
      report.skippedDuplicates.push(rawName);
      continue;
    }

    // Determine churchType
    let type = "Parish";
    if (lowerName.includes("basilica")) type = "Basilica";
    else if (lowerName.includes("cathedral")) type = "Cathedral";
    else if (lowerName.includes("shrine")) type = "Shrine";

    const city = church.parish ? church.parish.trim() : "Hyderabad";
    
    // Construct schema payload exactly matching existing churches
    const payload = {
      name: rawName,
      churchType: type,
      denomination: "Catholic",
      archdiocese: "Archdiocese of Hyderabad",
      city: city,
      address: "To be updated",
      description: "To be updated",
      languages: getUniqueLanguages(church.massTimings),
      massTimings: church.massTimings,
      feastDay: "To be updated",
      patron: "To be updated",
      parishPriest: "To be updated",
      phone: "To be updated",
      website: "To be updated",
      mapsUrl: "To be updated",
      googleMapsQuery: `${rawName} ${city}`,
      latitude: null,
      longitude: null,
      imageUrls: [] // Blank array fallback for elegant placeholder
    };

    try {
      console.log(`Inserting ${rawName}...`);
      const docRef = await addDoc(collection(db, 'churches'), payload);
      report.inserted.push({
        id: docRef.id,
        name: rawName
      });
      // Add to our local array to prevent inserting duplicates within the same run if they exist
      firestoreChurches.push({ id: docRef.id, ...payload });
    } catch (err) {
      console.error(`Failed to insert ${rawName}:`, err);
      report.validationFailures.push({ name: rawName, error: err.message });
    }
  }

  const finalReportPath = path.join(__dirname, '../src/data/churchImportReport.json');
  fs.writeFileSync(finalReportPath, JSON.stringify(report, null, 2));

  if (manualReview.length > 0) {
    const reviewPath = path.join(__dirname, '../src/data/manualReviewRequired.json');
    fs.writeFileSync(reviewPath, JSON.stringify(manualReview, null, 2));
    console.log(`\nSaved ${manualReview.length} suspicious records to manualReviewRequired.json`);
  }

  console.log(`\n=== IMPORT COMPLETION REPORT ===`);
  console.log(`Successfully Inserted: ${report.inserted.length}`);
  console.log(`Skipped Duplicates: ${report.skippedDuplicates.length}`);
  console.log(`Quality Rejections / Failures: ${report.validationFailures.length}`);
  console.log(`\nFull report written to src/data/churchImportReport.json`);
  
  process.exit(0);
};

main().catch(err => {
  console.error("Critical error during import:", err);
  process.exit(1);
});
