import fs from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
  const q = query(churchesCol, where('denomination', '==', 'Catholic'));
  const snapshot = await getDocs(q);
  const churches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  fs.writeFileSync('current_catholic_parishes.json', JSON.stringify(churches, null, 2));
  console.log(`Fetched ${churches.length} Catholic parishes.`);
  process.exit(0);
};

main().catch(console.error);
