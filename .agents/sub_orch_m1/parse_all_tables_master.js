import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let headings = new Set();
let currentSection = '';

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentSection = trimmed;
  }
  if (trimmed.startsWith('### ')) {
    const heading = trimmed.replace('###', '').trim();
    headings.add(heading);
  }
}

console.log("=== All Headings in database_schema_master.md ===");
console.log(Array.from(headings).sort());
