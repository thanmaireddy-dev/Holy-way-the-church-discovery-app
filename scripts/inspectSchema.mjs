import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

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

const main = async () => {
  const churchesCol = collection(db, 'churches');
  const allDocs = await getDocs(churchesCol);
  
  let oldChurch = null;
  let newChurch = null;
  
  allDocs.forEach(doc => {
    const data = doc.data();
    if (data.name === "St. Mary's Basilica") {
      oldChurch = data;
    }
    if (data.name === "Shrine Of Our Lady Of Grace" || data.name === "St. Joseph's Church") {
      newChurch = data;
    }
  });

  fs.writeFileSync('schema_inspection.json', JSON.stringify({ oldChurch, newChurch }, null, 2));
  console.log('Inspection complete.');
  process.exit(0);
};

main().catch(console.error);
