const fs = require('fs');
const path = require('path');

const normalize = (str) => {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')      // normalize spaces
    .trim();
};

const matchChurches = (extractedChurches, dbChurches, aliases) => {
  const matched = [];
  const unmatched = [];

  extractedChurches.forEach(pdfChurch => {
    let match = null;

    const pdfName = pdfChurch.name || '';
    const pdfParish = pdfChurch.parish || '';
    
    const possibleNames = [pdfName, pdfParish];
    if (aliases[pdfName]) possibleNames.push(aliases[pdfName]);
    if (aliases[pdfParish]) possibleNames.push(aliases[pdfParish]);

    for (const nameToMatch of possibleNames) {
      if (!nameToMatch) continue;
      
      const normPDF = normalize(nameToMatch);
      
      // 1. Exact or normalized exact match
      match = dbChurches.find(c => normalize(c.name) === normPDF || normalize(c.address).includes(normPDF));
      if (match) break;
      
      // 2. Contains match
      match = dbChurches.find(c => {
         const normDB = normalize(c.name);
         return normDB.includes(normPDF) || normPDF.includes(normDB);
      });
      if (match) break;
    }

    if (match) {
      // Merge timings
      const updatedChurch = { ...match };
      
      // Convert old array strings to new object format if they aren't already
      if (!updatedChurch.massTimings) updatedChurch.massTimings = {};
      if (!updatedChurch.massTimings.sunday || typeof updatedChurch.massTimings.sunday[0] === 'string') {
          updatedChurch.massTimings.sunday = [];
      }
      if (!updatedChurch.massTimings.weekday || typeof updatedChurch.massTimings.weekday[0] === 'string') {
          updatedChurch.massTimings.weekday = [];
      }
      if (!updatedChurch.massTimings.saturday || typeof updatedChurch.massTimings.saturday[0] === 'string') {
          updatedChurch.massTimings.saturday = [];
      }

      // Overwrite timings with PDF ones since PDF is the source of truth
      updatedChurch.massTimings.sunday = pdfChurch.massTimings.sunday || [];
      
      if (pdfChurch.massTimings.weekday && pdfChurch.massTimings.weekday.length > 0) {
         updatedChurch.massTimings.weekday = pdfChurch.massTimings.weekday;
      }
      if (pdfChurch.massTimings.saturday && pdfChurch.massTimings.saturday.length > 0) {
         updatedChurch.massTimings.saturday = pdfChurch.massTimings.saturday;
      }

      // Ensure languages are collected correctly
      const newLangs = new Set(updatedChurch.languages || []);
      pdfChurch.massTimings.sunday.forEach(timing => {
         timing.languages.forEach(l => newLangs.add(l));
      });
      updatedChurch.languages = Array.from(newLangs);

      matched.push({
        pdfRecord: pdfChurch,
        dbRecord: match,
        updatedRecord: updatedChurch
      });
    } else {
      unmatched.push(pdfChurch);
    }
  });

  return { matched, unmatched };
};

module.exports = { matchChurches };
