import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let currentTable = '';
let tablePolicies = {};

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentSection = trimmed;
    currentTable = '';
  }
  
  if (currentSection.includes('2. RLS POLICY\'LER')) {
    if (trimmed.startsWith('### ')) {
      currentTable = trimmed.replace('###', '').trim();
      tablePolicies[currentTable] = [];
    } else if (currentTable && trimmed.startsWith('|') && !trimmed.includes('Policy | Islem') && !trimmed.includes('---|---')) {
      const parts = trimmed.split('|').map(p => p.trim());
      if (parts.length > 2) {
        const policyName = parts[1];
        const islem = parts[2];
        const rol = parts[3];
        const kosul = parts[4];
        if (policyName && islem && rol) {
          tablePolicies[currentTable].push({
            policyName,
            islem,
            rol,
            kosul
          });
        }
      }
    }
  }
}

console.log("=== Active Tables and Policies in RLS Section ===");
let totalPolicies = 0;
for (const [table, pols] of Object.entries(tablePolicies)) {
  if (pols.length > 0) {
    console.log(`Table: ${table} (${pols.length} policies)`);
    totalPolicies += pols.length;
    for (const p of pols) {
      console.log(`  - [${p.islem}] "${p.policyName}" TO "${p.rol}" USING "${p.kosul}"`);
    }
  }
}
console.log(`\nTotal Policies Found: ${totalPolicies}`);
