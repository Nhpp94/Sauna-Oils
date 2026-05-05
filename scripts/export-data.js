#!/usr/bin/env node
// Run with: node scripts/export-data.js
// Outputs oils.json, blends.json, incense.json to scripts/output/
// Upload those files to the URLs in constants/remoteConfig.ts

const path = require('path');
const fs = require('fs');

// Use ts-node/esm or require with a transpiler — simpler: just re-export as JSON manually
// Since the data files are TypeScript, this script is a guide for manual export.

const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

console.log('To export your data as JSON, run one of these options:\n');
console.log('Option A — with ts-node:');
console.log('  npx ts-node -e "const {OILS}=require(\'./data/oils\'); require(\'fs\').writeFileSync(\'scripts/output/oils.json\', JSON.stringify(OILS, null, 2))"');
console.log('');
console.log('Option B — with tsx:');
console.log('  npx tsx scripts/export-ts.ts');
console.log('');
console.log('Option C — copy from TypeScript manually and save as JSON.');
console.log('\nThen upload the output/ files to your host and update constants/remoteConfig.ts with the URLs.');
