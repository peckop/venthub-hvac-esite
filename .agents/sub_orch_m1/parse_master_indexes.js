import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let indexes = [];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentSection = trimmed;
  }
  
  if (currentSection.includes('6. INDEKSLER')) {
    if (trimmed.startsWith('|') && !trimmed.includes('Tablo |') && !trimmed.includes('---|---')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length > 2) {
        const table = parts[1];
        const indexName = parts[2];
        const columns = parts[3];
        if (table && indexName) {
          indexes.push({ table, indexName, columns });
        }
      }
    }
  }
}

console.log(`Extracted ${indexes.length} indexes:`);
console.log(indexes);

const tablesWithIndexes = Array.from(new Set(indexes.map(i => i.table))).sort();
console.log(`\nUnique tables with indexes:`, tablesWithIndexes);
