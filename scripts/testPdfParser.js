const path = require('path');
const { parsePDF } = require('../src/services/importPipeline/pdfParser');

async function test() {
    const pdfPath = path.join(__dirname, '../src/data/Parish-mass-timings-2026.pdf');
    try {
        const churches = await parsePDF(pdfPath);
        console.log(JSON.stringify(churches.slice(0, 5), null, 2));
    } catch(err) {
        console.error(err);
    }
}
test();
