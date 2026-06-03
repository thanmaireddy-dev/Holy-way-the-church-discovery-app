const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, '../src/data/Parish-mass-timings-2026.pdf');
const dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
    const outputPath = path.join(__dirname, 'pdf_raw_text.txt');
    fs.writeFileSync(outputPath, data.text);
    console.log(`Extracted ${data.numpages} pages of text to pdf_raw_text.txt`);
}).catch(err => {
    console.error('Error parsing PDF:', err);
});
