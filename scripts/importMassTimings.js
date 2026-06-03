const fs = require('fs');
const path = require('path');
const { parsePDF } = require('../src/services/importPipeline/pdfParser');
const { validateChurches } = require('../src/services/importPipeline/validator');
const { matchChurches } = require('../src/services/importPipeline/churchMatcher');

const main = async () => {
  const pdfPath = path.join(__dirname, '../src/data/Parish-mass-timings-2026.pdf');
  const dbPath = path.join(__dirname, '../src/data/catholic_churches.json');
  const aliasesPath = path.join(__dirname, '../src/data/churchAliases.json');
  const outMassTimings = path.join(__dirname, '../src/data/massTimings.json');
  const outReport = path.join(__dirname, '../src/data/importValidationReport.json');

  console.log('1. Parsing PDF...');
  const extractedChurches = await parsePDF(pdfPath);
  console.log(`Extracted ${extractedChurches.length} church entries.`);

  console.log('2. Validating extracted data...');
  const validationResult = validateChurches(extractedChurches);
  console.log(`Validation: ${validationResult.valid.length} valid, ${validationResult.errors.length} errors.`);

  console.log('3. Matching against database...');
  const dbChurches = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const aliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf8'));
  
  const matchResult = matchChurches(validationResult.valid, dbChurches, aliases);
  console.log(`Matched: ${matchResult.matched.length}, Unmatched: ${matchResult.unmatched.length}`);

  // Generate massTimings.json containing all updated records
  const updatedRecords = matchResult.matched.map(m => m.updatedRecord);
  fs.writeFileSync(outMassTimings, JSON.stringify(updatedRecords, null, 2));
  console.log(`Wrote ${updatedRecords.length} records to massTimings.json`);

  // Generate validation report
  const report = {
    summary: {
      totalExtracted: extractedChurches.length,
      valid: validationResult.valid.length,
      validationErrors: validationResult.errors.length,
      matched: matchResult.matched.length,
      unmatched: matchResult.unmatched.length
    },
    validationErrors: validationResult.errors,
    unmatchedChurches: matchResult.unmatched,
    matchedPreview: matchResult.matched.map(m => ({
      pdfName: m.pdfRecord.name || m.pdfRecord.parish,
      dbName: m.dbRecord.name,
      timingsUpdated: m.updatedRecord.massTimings.sunday.length
    }))
  };

  fs.writeFileSync(outReport, JSON.stringify(report, null, 2));
  console.log(`Wrote importValidationReport.json`);
};

main().catch(err => console.error(err));
