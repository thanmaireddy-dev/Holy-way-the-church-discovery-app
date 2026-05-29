import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Load local JSON fallback data
const localChurches = require('../data/catholic_churches.json');

export const getChurches = async () => {
  try {
    const churchesCol = collection(db, 'churches');
    const churchSnapshot = await getDocs(churchesCol);
    const churchList = churchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (churchList.length === 0) {
      console.warn("Firestore 'churches' collection is empty. Returning local JSON data.");
      return localChurches;
    }
    
    return churchList;
  } catch (error) {
    console.warn("Failed to fetch from Firestore. Using local JSON data.", error);
    return localChurches;
  }
};

export const submitCorrection = async (churchId, correctionData) => {
  try {
    const suggestionsCol = collection(db, 'suggestions');
    await addDoc(suggestionsCol, {
      churchId,
      ...correctionData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Failed to submit correction to Firestore", error);
    // Even if offline/failed, we return false or mock success depending on requirements.
    // For now we log it and return false.
    return false;
  }
};
