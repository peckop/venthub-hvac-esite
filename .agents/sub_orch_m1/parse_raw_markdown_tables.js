import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let currentHeading = '';
let headingsMap = {};

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentSection = trimmed;
    currentHeading = '';
  }
  if (currentSection.includes('2. RLS POLICY\'LER')) {
    if (trimmed.startsWith('### ')) {
      currentHeading = trimmed.replace('###', '').trim();
      headingsMap[currentHeading] = [];
    } else if (currentHeading) {
      headingsMap[currentHeading].push(line);
    }
  }
}

for (const [heading, linesList] of Object.entries(headingsMap)) {
  const tableLines = linesList.filter(l => l.trim().startsWith('|'));
  console.log(`Heading: "${heading}" has ${linesList.length} lines, of which ${tableLines.length} are table rows.`);
}
