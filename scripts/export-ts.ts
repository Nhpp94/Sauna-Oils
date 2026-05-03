import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { OILS } from '../data/oils';
import { BLENDS } from '../data/blends';
import { INCENSE } from '../data/incense';

const outDir = join(__dirname, 'output');
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, 'oils.json'),    JSON.stringify(OILS,    null, 2));
writeFileSync(join(outDir, 'blends.json'),  JSON.stringify(BLENDS,  null, 2));
writeFileSync(join(outDir, 'incense.json'), JSON.stringify(INCENSE, null, 2));

console.log('Exported to scripts/output/');
console.log(`  oils.json    — ${OILS.length} oils`);
console.log(`  blends.json  — ${BLENDS.length} blends`);
console.log(`  incense.json — ${INCENSE.length} incense`);
