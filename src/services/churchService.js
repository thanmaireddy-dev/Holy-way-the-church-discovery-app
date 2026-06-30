import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

// Load local JSON fallback data
const localChurches = require('../data/catholic_churches.json');

/**
 * Sanitizes a field value that may contain placeholder strings like "To be updated".
 * Returns null for empty or placeholder values so the UI can gracefully hide them.
 */
const sanitizeField = (value, fallback = null) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (
      trimmed === '' ||
      trimmed.toLowerCase() === 'to be updated' ||
      trimmed === '-'
    ) {
      return fallback;
    }
    return trimmed;
  }
  return value;
};

const parseTimings = (t) => {
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') {
    return t.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

/**
 * Normalizes a Firestore church document into the shape expected by the app.
 * Handles:
 *  - Case-insensitive field lookups (e.g., Name vs name)
 *  - imageUrl, image, and imageUrls properties smoothly
 *  - String and array variants of mass timings
 */
const normalizeChurch = (id, rawData) => {
  // Helper to get field case-insensitively
  const getField = (key) => {
    if (!rawData) return undefined;
    if (rawData[key] !== undefined) return rawData[key];
    const keys = Object.keys(rawData);
    const lowerKey = key.toLowerCase();
    const match = keys.find(k => k.toLowerCase() === lowerKey);
    return match ? rawData[match] : undefined;
  };

  const data = {
    name: getField('name'),
    city: getField('city'),
    address: getField('address'),
    denomination: getField('denomination'),
    churchType: getField('churchType'),
    description: getField('description'),
    archdiocese: getField('archdiocese'),
    phone: getField('phone'),
    website: getField('website'),
    mapsUrl: getField('mapsUrl'),
    googleMapsQuery: getField('googleMapsQuery'),
    parishPriest: getField('parishPriest'),
    patron: getField('patron'),
    feastDay: getField('feastDay'),
    latitude: getField('latitude'),
    longitude: getField('longitude'),
    imageUrls: getField('imageUrls'),
    imageUrl: getField('imageUrl'),
    image: getField('image'),
    massTimings: getField('massTimings'),
    status: getField('status'),
    languages: getField('languages'),
    events: getField('events'),
    searchKeywords: getField('searchKeywords'),
  };

  // Resolve the image: prefer first real HTTP url, otherwise derive from churchType
  let image = null;
  
  if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
    const firstUrl = data.imageUrls.find(
      (u) => typeof u === 'string' && u.startsWith('http')
    );
    if (firstUrl) {
      image = firstUrl;
    }
  }
  
  if (!image && typeof data.imageUrl === 'string' && data.imageUrl.startsWith('http')) {
    image = data.imageUrl;
  }
  if (!image && typeof data.image === 'string' && data.image.startsWith('http')) {
    image = data.image;
  }
  
  if (!image) {
    // Fallback to local bundled asset based on churchType
    const typeKey = (data.churchType || 'parish').toLowerCase();
    image = ['basilica', 'cathedral', 'shrine', 'parish', 'church_interior', 'church_exterior'].includes(typeKey)
      ? typeKey
      : 'parish';
  }

  // Resolve the google maps query (Firestore may have either or both fields)
  const googleMapsQuery =
    sanitizeField(data.googleMapsQuery) ||
    sanitizeField(data.mapsUrl) ||
    `${data.name || ''} ${data.city || ''}`.trim();

  // Normalise massTimings — guarantee the shape { sunday: [], weekday: [], saturday: [] }
  const rawTimings = data.massTimings || {};
  
  const getTiming = (obj, day) => {
    if (!obj) return [];
    if (obj[day] !== undefined) return obj[day];
    const capDay = day.charAt(0).toUpperCase() + day.slice(1);
    if (obj[capDay] !== undefined) return obj[capDay];
    return [];
  };

  const massTimings = {
    sunday: parseTimings(getTiming(rawTimings, 'sunday')),
    weekday: parseTimings(getTiming(rawTimings, 'weekday')),
    saturday: parseTimings(getTiming(rawTimings, 'saturday')),
  };

  let imageUrls = Array.isArray(data.imageUrls) ? data.imageUrls : [];
  if (imageUrls.length === 0) {
    if (typeof data.imageUrl === 'string' && data.imageUrl.startsWith('http')) imageUrls.push(data.imageUrl);
    else if (typeof data.image === 'string' && data.image.startsWith('http')) imageUrls.push(data.image);
  }

  let languages = Array.isArray(data.languages) ? data.languages : (typeof data.languages === 'string' ? data.languages.split(',').map(s=>s.trim()).filter(Boolean) : []);

  return {
    id,
    // Core identifiers — never undefined so filters don't crash
    name: sanitizeField(data.name, 'Unknown Church'),
    city: sanitizeField(data.city, ''),
    address: sanitizeField(data.address, ''),
    denomination: sanitizeField(data.denomination, ''),
    churchType: sanitizeField(data.churchType, null),
    // Descriptive
    description: sanitizeField(data.description, null),
    archdiocese: sanitizeField(data.archdiocese, null),
    // Contact
    phone: sanitizeField(data.phone, null),
    website: sanitizeField(data.website, null),
    mapsUrl: sanitizeField(data.mapsUrl, null),
    googleMapsQuery,
    // People
    parishPriest: sanitizeField(data.parishPriest, null),
    patron: sanitizeField(data.patron, null),
    feastDay: sanitizeField(data.feastDay, null),
    // Location
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    // Media
    imageUrls,
    image, // resolved image key or URL string
    // Timings & status
    massTimings,
    status: sanitizeField(data.status, 'active'),
    // Extra
    languages,
    events: Array.isArray(data.events) ? data.events : [],
    searchKeywords: Array.isArray(data.searchKeywords) ? data.searchKeywords : [],
  };
};

export const getChurches = async () => {
  try {
    console.log("[churchService] Fetching from Firestore collection: 'churches'");
    const churchesCol = collection(db, 'churches');
    const churchSnapshot = await getDocs(churchesCol);

    console.log(`[churchService] churchSnapshot received. empty: ${churchSnapshot.empty}, size: ${churchSnapshot.size}`);

    if (churchSnapshot.empty) {
      console.warn("Firestore 'churches' collection is empty. (Returning empty array)");
      return [];
    }

    const churchList = [];
    churchSnapshot.docs.forEach((doc) => {
      const rawData = doc.data();
      console.log(`[churchService] Raw document ${doc.id} before normalization:`, rawData);
      try {
        const normalized = normalizeChurch(doc.id, rawData);
        console.log(`[churchService] Normalized document ${doc.id}:`, normalized);
        churchList.push(normalized);
      } catch (err) {
        console.error(`[churchService] Error normalizing church doc ${doc.id}:`, err);
      }
    });

    console.log(`[churchService] Successfully processed ${churchList.length} churches from Firestore.`);
    return churchList;
  } catch (error) {
    console.error('[churchService] Failed to fetch from Firestore. REAL ERROR:', error);
    // REMOVED THE SILENT FALLBACK TO LOCAL JSON
    // We throw the error so the UI handles it explicitly (e.g. showing an error state) instead of masking it.
    throw error;
  }
};

export const submitCorrection = async (churchId, correctionData) => {
  try {
    const suggestionsCol = collection(db, 'suggestions');
    await addDoc(suggestionsCol, {
      churchId,
      ...correctionData,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to submit correction to Firestore', error);
    return false;
  }
};

