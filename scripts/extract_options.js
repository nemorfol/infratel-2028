const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

// Input file
const csvFilePath = path.join(__dirname, '..', 'csv', 'merge-csv.com__68a0b347dfd9b.csv');

// Output directories and files
const outputRoot = path.join(__dirname, '..', 'public', 'data');
const comuniDir = path.join(outputRoot, 'comuni');
const stradeDir = path.join(outputRoot, 'strade');
const regioProvFile = path.join(outputRoot, 'regioni_province.json');

// Clean up previous run
if (fs.existsSync(outputRoot)) {
    console.log('Cleaning up previous data files...');
    fs.rmSync(outputRoot, { recursive: true, force: true });
}
fs.mkdirSync(comuniDir, { recursive: true });
fs.mkdirSync(stradeDir, { recursive: true });

// In-memory data structures
const regioProv = {};
const provinceComuni = {};
const comuneStradeECivici = {}; // New structure: { comKey: { strada: [{civico, barrato}] } }

let header = [];
let colIndices = {};
let rowCounter = 0;

console.log('Starting final data extraction including street numbers and "barrato" status. This will take several minutes...');

const fileStream = fs.createReadStream(csvFilePath);

const toSafeFilename = (str) => str.toUpperCase().replace(/[^A-Z0-9_\-]/g, '_');

Papa.parse(fileStream, {
    step: function(row) {
        if (rowCounter === 3) { // Header row
            header = row.data;
            colIndices = {
                regione: header.indexOf('regione'),
                provincia: header.indexOf('provincia'),
                comune: header.indexOf('comune'),
                strada: header.indexOf('strada'),
                civico: header.indexOf('civico'),
                barrato: header.indexOf('barrato'), // Added barrato
            };
            if (Object.values(colIndices).some(v => v === -1)) {
                console.error("FATAL ERROR: Could not find required columns in header.", colIndices);
                fileStream.destroy();
                return;
            }
        } else if (rowCounter > 3) {
            const record = row.data;
            const regione = record[colIndices.regione];
            const provincia = record[colIndices.provincia];
            const comune = record[colIndices.comune];
            const strada = record[colIndices.strada];
            const civico = record[colIndices.civico];
            const barrato = record[colIndices.barrato] || null; // Get barrato, default to null

            // Populate Regioni -> Province
            if (regione && provincia) {
                if (!regioProv[regione]) regioProv[regione] = new Set();
                regioProv[regione].add(provincia);
            }

            // Populate Province -> Comuni
            if (provincia && comune) {
                const provKey = toSafeFilename(provincia);
                if (!provinceComuni[provKey]) provinceComuni[provKey] = new Set();
                provinceComuni[provKey].add(comune);
            }

            // Populate Comune -> Strade -> Civici
            if (provincia && comune && strada && civico) {
                const comKey = toSafeFilename(`${provincia}_${comune}`);
                if (!comuneStradeECivici[comKey]) comuneStradeECivici[comKey] = {};
                if (!comuneStradeECivici[comKey][strada]) comuneStradeECivici[comKey][strada] = [];
                comuneStradeECivici[comKey][strada].push({ civico, barrato });
            }
        }
        rowCounter++;
        if(rowCounter % 200000 === 0) console.log(`Processed ${rowCounter} rows...`);
    },
    complete: function() {
        console.log(`Total rows processed: ${rowCounter}. Writing files...`);
        
        // 1. Write regioni_province.json
        const regioProvSorted = {};
        Object.keys(regioProv).sort().forEach(r => { regioProvSorted[r] = Array.from(regioProv[r]).sort(); });
        fs.writeFileSync(regioProvFile, JSON.stringify(regioProvSorted, null, 2));
        console.log(`Successfully wrote ${regioProvFile}`);

        // 2. Write comuni files
        Object.keys(provinceComuni).forEach(provKey => {
            const comuniSorted = Array.from(provinceComuni[provKey]).sort();
            fs.writeFileSync(path.join(comuniDir, `${provKey}.json`), JSON.stringify(comuniSorted, null, 2));
        });
        console.log(`Successfully wrote ${Object.keys(provinceComuni).length} comuni files.`);

        // 3. Write strade+civici files
        Object.keys(comuneStradeECivici).forEach(comKey => {
            const stradeData = comuneStradeECivici[comKey];
            const stradeDataSorted = {};
            Object.keys(stradeData).sort().forEach(strada => {
                // Sort civici objects based on the civico property
                stradeDataSorted[strada] = stradeData[strada].sort((a, b) => {
                    return a.civico.localeCompare(b.civico, undefined, { numeric: true, sensitivity: 'base' });
                });
            });
            fs.writeFileSync(path.join(stradeDir, `${comKey}.json`), JSON.stringify(stradeDataSorted, null, 2));
        });
        console.log(`Successfully wrote ${Object.keys(comuneStradeECivici).length} strade/civici files.`);
        
        console.log('\n--- DATA EXTRACTION COMPLETE! ---');
    },
    error: function(error) {
        console.error('An error occurred during parsing:', error.message);
    }
});
