import fs from 'fs';

const content = fs.readFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\docs\\\\database_schema_master.md', 'utf-8');
const lines = content.split('\n');

let currentSection = '';
let views = new Set();

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed.startsWith('## ')) {
    currentSection = trimmed;
  }
  
  if (currentSection.includes('4. VIEW\'LAR')) {
    if (trimmed.startsWith('### ')) {
      views.add(trimmed.replace('###', '').trim().toLowerCase());
    }
  }
}

console.log("=== Views in Master Doc ===");
console.log(Array.from(views).sort());
console.log(`Total Views: ${views.size}`);
