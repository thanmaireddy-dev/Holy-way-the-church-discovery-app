import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase (using exact config from src/firebase/config.js)
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

const importData = async () => {
  try {
    const seedFilePath = path.join(__dirname, '../src/data/catholicChurchesSeed.json');
    const rawData = fs.readFileSync(seedFilePath, 'utf8');
    const churches = JSON.parse(rawData);

    const churchesCol = collection(db, 'churches');
    let importedCount = 0;

    for (const church of churches) {
      const { id, ...data } = church;
      // Overwrite the createdAt and updatedAt with server timestamps
      const churchData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = id ? doc(churchesCol, id) : doc(churchesCol);
      await setDoc(docRef, churchData);
      console.log(`Imported: ${church.name}`);
      importedCount++;
    }

    console.log(`Successfully imported ${importedCount} churches.`);
    process.exit(0);
  } catch (error) {
    console.error("Error importing churches: ", error);
    process.exit(1);
  }
};

importData();
