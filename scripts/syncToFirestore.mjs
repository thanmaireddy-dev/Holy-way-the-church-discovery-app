import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

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

const countTimings = (massTimings) => {
  if (!massTimings) return 0;
  let count = 0;
  if (Array.isArray(massTimings.sunday)) count += massTimings.sunday.length;
  if (Array.isArray(massTimings.weekday)) count += massTimings.weekday.length;
  if (Array.isArray(massTimings.saturday)) count += massTimings.saturday.length;
  return count;
};

const main = async () => {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');

  const massTimingsPath = path.join(__dirname, '../src/data/massTimings.json');
  const extractedData = JSON.parse(fs.readFileSync(massTimingsPath, 'utf8'));
  
  const reportPathRaw = path.join(__dirname, '../src/data/importValidationReport.json');
  const validationReport = JSON.parse(fs.readFileSync(reportPathRaw, 'utf8'));

  console.log('Fetching churches from Firestore...');
  const churchesCol = collection(db, 'churches');
  const snapshot = await getDocs(churchesCol);
  const firestoreChurches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const report = {
    successfullyUpdated: [],
    skipped: [],
    unmatched: validationReport.unmatchedChurches || [],
    failures: []
  };

  for (const extractedRecord of extractedData) {
    const churchName = extractedRecord.name;
    const normTarget = normalize(churchName);
    
    // Find the corresponding record in Firestore
    const fsMatch = firestoreChurches.find(c => {
      return normalize(c.name) === normTarget && c.denomination === 'Catholic';
    });

    if (fsMatch) {
      const existingCount = countTimings(fsMatch.massTimings);
      const newCount = countTimings(extractedRecord.massTimings);
      
      const payload = {
        massTimings: extractedRecord.massTimings
      };

      try {
        if (!isDryRun) {
          console.log(`Updating ${churchName} (Doc ID: ${fsMatch.id})...`);
          const docRef = doc(db, 'churches', fsMatch.id);
          await updateDoc(docRef, payload);
          console.log(`Successfully updated ${churchName}.`);
        }
        
        report.successfullyUpdated.push({
          churchName: churchName,
          firestoreDocId: fsMatch.id,
          existingTimingCount: existingCount,
          newTimingCount: newCount,
          fieldsUpdated: Object.keys(payload)
        });
      } catch (err) {
        console.error(`Failed to update ${churchName}:`, err);
        report.failures.push({
          churchName,
          firestoreDocId: fsMatch.id,
          error: err.message
        });
      }
    } else {
      console.warn(`Firestore match not found for: ${churchName} (Ensure it exists and denomination is Catholic)`);
      report.skipped.push({
         churchName,
         reason: "Not found in Firestore or denomination is not Catholic"
      });
    }
  }

  const reportPath = path.join(__dirname, '../src/data/massTimingUpdateReport.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n=== FINAL SYNCHRONIZATION REPORT ===`);
  console.log(`Total Churches Updated: ${report.successfullyUpdated.length}`);
  console.log(`Total Churches Skipped: ${report.skipped.length}`);
  console.log(`Total Unmatched Churches: ${report.unmatched.length}`);
  console.log(`Total Failures: ${report.failures.length}`);
  console.log(`\nFull details written to src/data/massTimingUpdateReport.json`);
  
  // Exit cleanly
  process.exit(0);
};

main().catch(err => {
  console.error("Error during execution:", err);
  process.exit(1);
});
