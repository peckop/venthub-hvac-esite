import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\.agents\\\\sub_orch_m1\\\\parsed_schema.json', 'utf-8');
const data = JSON.parse(content);

let count = 0;
let tableCounts = {};
for (const [table, pols] of Object.entries(data.policies)) {
  count += pols.length;
  tableCounts[table] = pols.length;
}

console.log(`Total policies in parsed migrations JSON: ${count}`);
console.log(tableCounts);
