import fs from 'fs';

const masterDocPath = 'c:\\Users\\alize\\venthub-hvac\\docs\\database_schema_master.md';
const content = fs.readFileSync(masterDocPath, 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let tables = [];
let policies = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('## ')) {
    currentSection = line;
  }
  
  if (currentSection.includes('1. TABLOLAR') && line.startsWith('### ')) {
    const tableName = line.replace('###', '').trim();
    if (!tables.includes(tableName)) {
      tables.push(tableName);
    }
  }
  
  // Let's also look at policies
  if (currentSection.includes('2. RLS POLICY\'LER')) {
    // If the line contains a policy or is part of a markdown table listing policies
    // The policies are in markdown tables. Let's extract lines that have policy details.
    if (line.startsWith('|') && !line.includes('Policy | Islem') && !line.includes('---|---')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length > 2) {
        const policyName = parts[1];
        const islem = parts[2];
        const rol = parts[3];
        const kosul = parts[4];
        if (policyName && islem && rol) {
          policies.push({
            policyName,
            islem,
            rol,
            kosul,
            lineNum: i + 1
          });
        }
      }
    }
  }
}

console.log("=== Active Tables in Master Doc ===");
console.log(tables);
console.log(`Total Tables: ${tables.length}`);

console.log(`\n=== RLS Policies in Master Doc (First 20) ===`);
console.log(policies.slice(0, 20));
console.log(`Total Policies Extracted: ${policies.length}`);

// Write JSON output
fs.writeFileSync('c:\\Users\\alize\\venthub-hvac\\.agents\\sub_orch_m1\\parsed_master.json', JSON.stringify({ tables, policies }, null, 2));
