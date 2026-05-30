import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let tablesSection1 = new Set();
let tablesSection2 = new Set();
let tablesSection6 = new Set();

const systemTables = ['create', 'if', 'any', 'email', 'function', 'pdp'];

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentSection = trimmed;
  }
  
  if (currentSection.includes('1. TABLOLAR')) {
    if (trimmed.startsWith('### ')) {
      const table = trimmed.replace('###', '').trim().toLowerCase();
      if (!systemTables.includes(table)) {
        tablesSection1.add(table);
      }
    }
  }
  
  if (currentSection.includes('2. RLS POLICY\'LER')) {
    if (trimmed.startsWith('### ')) {
      const table = trimmed.replace('###', '').trim().toLowerCase();
      if (!systemTables.includes(table)) {
        tablesSection2.add(table);
      }
    }
  }
  
  if (currentSection.includes('6. INDEKSLER')) {
    if (trimmed.startsWith('|') && !trimmed.includes('Tablo |') && !trimmed.includes('---|---')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length > 2) {
        // In section 6, Table is in parts[2] (indexName in the previous run, let's clean up)
        const table = parts[2].toLowerCase();
        if (table && table !== 'tablo' && !systemTables.includes(table)) {
          tablesSection6.add(table);
        }
      }
    }
  }
}

console.log("=== Unique Tables Section 1 (TABLOLAR) ===");
console.log(Array.from(tablesSection1).sort());
console.log(`Count: ${tablesSection1.size}`);

console.log("\n=== Unique Tables Section 2 (RLS POLICY'LER) ===");
console.log(Array.from(tablesSection2).sort());
console.log(`Count: ${tablesSection2.size}`);

console.log("\n=== Unique Tables Section 6 (INDEKSLER) ===");
console.log(Array.from(tablesSection6).sort());
console.log(`Count: ${tablesSection6.size}`);

// Merge all sets
const allTables = new Set([...tablesSection1, ...tablesSection2, ...tablesSection6]);
console.log(`\n=== Total Consolidated Tables from Master Doc ===`);
console.log(Array.from(allTables).sort());
console.log(`Consolidated Count: ${allTables.size}`);
