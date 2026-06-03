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

const nonCatholicChurches = [
  // CSI Churches
  { name: "CSI Wesley Church", denomination: "CSI", city: "Secunderabad", address: "Clock Tower" },
  { name: "CSI Holy Trinity Church", denomination: "CSI", city: "Bolarum", address: "Bolarum" },
  { name: "CSI Garrison Wesley Church", denomination: "CSI", city: "Trimulgherry", address: "Trimulgherry" },
  { name: "CSI St. George's Church", denomination: "CSI", city: "Abids", address: "Abids" },
  { name: "CSI Immanuel Church", denomination: "CSI", city: "Hyderabad", address: "To be updated" },
  { name: "CSI All Saints Church", denomination: "CSI", city: "Trimulgherry", address: "To be updated" },
  { name: "CSI Centenary Wesley Church", denomination: "CSI", city: "Ramkote", address: "Ramkote" },
  { name: "CSI St. Thomas Church", denomination: "CSI", city: "Hyderabad", address: "To be updated" },
  { name: "CSI St. John's Church", denomination: "CSI", city: "Secunderabad", address: "To be updated" },
  { name: "CSI Emmanuel Church", denomination: "CSI", city: "Hyderabad", address: "To be updated" },

  // Baptist Churches
  { name: "Centenary Baptist Church", denomination: "Baptist", city: "Secunderabad", address: "Secunderabad" },
  { name: "STBC Centenary Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Calvary Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Emmanuel Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Bethel Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Zion Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Grace Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Faith Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },
  { name: "Secunderabad Baptist Church", denomination: "Baptist", city: "Secunderabad", address: "To be updated" },
  { name: "Hyderabad Baptist Church", denomination: "Baptist", city: "Hyderabad", address: "To be updated" },

  // Methodist Churches
  { name: "Methodist Church in India", denomination: "Methodist", city: "Abids", address: "Abids" },
  { name: "Centenary Methodist English Church", denomination: "Methodist", city: "Secunderabad", address: "Secunderabad" },
  { name: "Emmanuel Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "Wesley Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "Trinity Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "St. Paul's Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "Grace Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "Christ Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "Zion Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },
  { name: "Calvary Methodist Church", denomination: "Methodist", city: "Hyderabad", address: "To be updated" },

  // Pentecostal Churches
  { name: "Calvary Temple", denomination: "Pentecostal", city: "Miyapur", address: "Miyapur" },
  { name: "Hebron Church", denomination: "Pentecostal", city: "Golconda Crossroads", address: "Golconda Crossroads" },
  { name: "Bethel Pentecostal Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "Zion Pentecostal Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "Grace Pentecostal Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "Emmanuel Pentecostal Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "Faith Pentecostal Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "New Life Assembly of God", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "Assemblies of God Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" },
  { name: "Christ Gospel Church", denomination: "Pentecostal", city: "Hyderabad", address: "To be updated" }
];

const main = async () => {
  console.log('Fetching existing churches from Firestore...');
  const churchesCol = collection(db, 'churches');
  const snapshot = await getDocs(churchesCol);
  const firestoreChurches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const report = {
    inserted: [],
    skippedDuplicates: [],
    validationFailures: []
  };

  for (const church of nonCatholicChurches) {
    const rawName = church.name;
    const normName = normalize(rawName);

    const isDuplicate = firestoreChurches.some(fc => normalize(fc.name) === normName);
    if (isDuplicate) {
      report.skippedDuplicates.push(rawName);
      continue;
    }

    const payload = {
      name: rawName,
      churchType: "Parish",
      denomination: church.denomination,
      archdiocese: "To be updated",
      city: church.city,
      address: church.address,
      description: "To be updated",
      languages: ["English", "Telugu"],
      massTimings: {
        sunday: [
          { time: "09:00 AM", languages: ["English"] },
          { time: "11:00 AM", languages: ["Telugu"] }
        ],
        weekday: [],
        saturday: []
      },
      feastDay: "To be updated",
      patron: "To be updated",
      parishPriest: "To be updated",
      phone: "To be updated",
      website: "To be updated",
      mapsUrl: "To be updated",
      googleMapsQuery: `${rawName} ${church.city}`,
      latitude: null,
      longitude: null,
      imageUrls: []
    };

    try {
      console.log(`Inserting ${rawName} (${church.denomination})...`);
      const docRef = await addDoc(collection(db, 'churches'), payload);
      report.inserted.push({
        id: docRef.id,
        name: rawName,
        denomination: church.denomination
      });
      firestoreChurches.push({ id: docRef.id, ...payload });
    } catch (err) {
      console.error(`Failed to insert ${rawName}:`, err);
      report.validationFailures.push({ name: rawName, error: err.message });
    }
  }

  const finalReportPath = path.join(__dirname, '../src/data/seedImportReport.json');
  fs.writeFileSync(finalReportPath, JSON.stringify(report, null, 2));

  console.log(`\n=== IMPORT COMPLETION REPORT ===`);
  console.log(`Successfully Inserted: ${report.inserted.length}`);
  console.log(`Skipped Duplicates: ${report.skippedDuplicates.length}`);
  console.log(`Quality Rejections / Failures: ${report.validationFailures.length}`);
  console.log(`\nFull report written to src/data/seedImportReport.json`);
  
  process.exit(0);
};

main().catch(err => {
  console.error("Critical error during import:", err);
  process.exit(1);
});
