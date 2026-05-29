const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../src/data/catholic_churches.json');
const outputPath = path.join(__dirname, '../src/data/catholicChurchesSeed.json');

const rawData = fs.readFileSync(inputPath, 'utf8');
const churches = JSON.parse(rawData);

const generateSearchKeywords = (church) => {
  const keywords = new Set();
  
  const processStr = (str) => {
    if (!str) return;
    str.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').forEach(word => {
      if (word.length > 2) keywords.add(word);
    });
  };

  processStr(church.name);
  if (church.name) keywords.add(church.name.toLowerCase());
  processStr(church.churchType);
  processStr(church.city);
  processStr(church.address);
  
  return Array.from(keywords);
};

const transformed = churches.map(church => {
  return {
    id: church.id || "",
    name: church.name || "",
    churchType: church.churchType || "",
    denomination: "Catholic",
    city: church.city || "",
    address: church.address || "",
    description: church.description || "",
    patron: church.patron || "",
    feastDay: church.feastDay || "",
    parishPriest: church.parishPriest || "",
    phone: church.phone || "",
    website: church.website || "",
    mapsUrl: church.googleMapsQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.googleMapsQuery)}` : "",
    latitude: church.latitude || null,
    longitude: church.longitude || null,
    languages: church.languages || [],
    massTimings: {
      sunday: church.massTimings?.sunday || [],
      weekday: church.massTimings?.weekday || [],
      saturday: church.massTimings?.saturday || []
    },
    imageUrls: [],
    status: "active",
    searchKeywords: generateSearchKeywords(church),
    createdAt: "",
    updatedAt: ""
  };
});

fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf8');
console.log(`Successfully transformed ${transformed.length} churches to ${outputPath}`);
