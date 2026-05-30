import fs from 'fs';

const tsFilePath = 'c:\\\\Users\\\\alize\\\\venthub-hvac\\\\src\\\\types\\\\database.types.ts';
const content = fs.readFileSync(tsFilePath, 'utf-8');

// We want to find the Tables object within public
// Let's find: "Tables: {" inside "public: {"
const publicMatch = content.match(/public:\s*\{\s*Tables:\s*\{([\s\S]*?)\n\s*\}\s*Views:/);

if (!publicMatch) {
  console.log("Could not find public.Tables structure");
  process.exit(1);
}

const tablesBlock = publicMatch[1];
const tableRegex = /^\s*([a-zA-Z0-9_]+):\s*\{/gm;
let match;
let tables = [];

while ((match = tableRegex.exec(tablesBlock)) !== null) {
  tables.push(match[1]);
}

console.log("=== Tables in Database Types (TS) ===");
console.log(JSON.stringify(tables.sort(), null, 2));
console.log(`Total Tables: ${tables.length}`);
