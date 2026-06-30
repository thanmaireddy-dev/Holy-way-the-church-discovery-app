import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

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
  const isDryRun = process.argv.includes('--dry-run');
  if (isDryRun) {
    console.log("=== DRY RUN MODE: No changes will be written to the database ===");
  }

  const churchesCol = collection(db, 'churches');
  const allDocs = await getDocs(churchesCol);
  
  let batch = writeBatch(db);
  let batchCount = 0;
  let totalUpdated = 0;

  for (const docSnapshot of allDocs.docs) {
    const data = docSnapshot.data();
    
    // We identify "newly imported parishes" by checking if they lack the required massTimings object 
    // or description. Actually, checking massTimings is a very safe bet.
    // However, let's just apply the default schema properties to ANY document that is missing them.
    // This perfectly standardizes the schema without modifying existing accurate data.
    
    const updates = {};
    let needsUpdate = false;

    if (data.description === undefined) { updates.description = ""; needsUpdate = true; }
    if (data.imageUrls === undefined) { updates.imageUrls = []; needsUpdate = true; }
    if (data.languages === undefined) { updates.languages = []; needsUpdate = true; }
    if (data.latitude === undefined) { updates.latitude = null; needsUpdate = true; }
    if (data.longitude === undefined) { updates.longitude = null; needsUpdate = true; }
    if (data.googleMapsQuery === undefined) { updates.googleMapsQuery = ""; needsUpdate = true; }
    if (data.mapsUrl === undefined) { updates.mapsUrl = ""; needsUpdate = true; }
    if (data.phone === undefined) { updates.phone = ""; needsUpdate = true; }
    if (data.website === undefined) { updates.website = ""; needsUpdate = true; }
    if (data.searchKeywords === undefined) { updates.searchKeywords = []; needsUpdate = true; }
    if (data.status === undefined) { updates.status = "active"; needsUpdate = true; }
    
    if (data.massTimings === undefined) {
      updates.massTimings = { sunday: [], weekday: [], saturday: [] };
      needsUpdate = true;
    }

    if (data.createdAt === undefined) {
      updates.createdAt = serverTimestamp();
      needsUpdate = true;
    }

    // Always touch updatedAt for standardized documents if we are modifying them
    if (needsUpdate) {
      updates.updatedAt = serverTimestamp();
    }

    if (needsUpdate) {
      totalUpdated++;
      const docRef = doc(db, 'churches', docSnapshot.id);
      
      if (!isDryRun) {
        batch.update(docRef, updates);
        batchCount++;

        // Firestore batches support up to 500 operations
        if (batchCount >= 450) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} updates.`);
          batch = writeBatch(db);
          batchCount = 0;
        }
      } else {
        // Output dry run log for the first few items
        if (totalUpdated <= 3) {
          console.log(`\n[DRY RUN] Would update: ${data.name || docSnapshot.id}`);
          console.log(`Updates:`, updates);
        }
      }
    }
  }

  if (!isDryRun && batchCount > 0) {
    await batch.commit();
    console.log(`Committed final batch of ${batchCount} updates.`);
  }

  console.log(`\nProcess Complete. Total documents identified for update: ${totalUpdated}`);
  process.exit(0);
};

main().catch(console.error);
