import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let currentTable = '';
let policies = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.startsWith('## ')) {
    currentSection = line;
    currentTable = '';
  }
  
  if (currentSection.includes('2. RLS POLICY\'LER')) {
    if (line.startsWith('### ')) {
      currentTable = line.replace('###', '').trim();
    } else if (currentTable && line.startsWith('|') && !line.includes('Policy | Islem') && !line.includes('---|---')) {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length > 4) {
        const policyName = parts[1];
        const islem = parts[2];
        const rol = parts[3];
        const kosul = parts[4];
        
        if (policyName && islem && rol) {
          policies.push({
            table: currentTable,
            policyName,
            action: islem,
            role: rol,
            condition: kosul,
            lineNum: i + 1
          });
        }
      }
    }
  }
}

console.log(`Successfully extracted ${policies.length} policies from Master Doc!`);

// Group policies by table
let grouped = {};
for (const p of policies) {
  if (!grouped[p.table]) {
    grouped[p.table] = [];
  }
  grouped[p.table].push(p);
}

// Log summary by table
console.log("\n=== Policy Count by Table ===");
let total = 0;
for (const [table, list] of Object.entries(grouped)) {
  console.log(`- ${table}: ${list.length} policies`);
  total += list.length;
}
console.log(`Total policies in summary: ${total}`);

// Write grouped policies to JSON
fs.writeFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\.agents\\\\sub_orch_m1\\\\parsed_policies.json', JSON.stringify(grouped, null, 2));
