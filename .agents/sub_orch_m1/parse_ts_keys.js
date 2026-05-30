import fs from 'fs';

const tsFilePath = 'c:\\\\Users\\\\alize\\\\venthub-hvac\\\\src\\\\types\\\\database.types.ts';
const content = fs.readFileSync(tsFilePath, 'utf-8');

// We find public: { Tables: {
const startIdx = content.indexOf('Tables: {');
if (startIdx === -1) {
  console.log("Could not find Tables definition");
  process.exit(1);
}

// Let's parse table names by matching keys followed by :{ on lines that are indented by 6 spaces (or we can count brackets)
let index = startIdx + 'Tables: {'.length;
let bracketCount = 1;
let currentWord = '';
let tables = [];

// Let's traverse character by character to find the keys at level 1 inside Tables: { ... }
while (index < content.length && bracketCount > 0) {
  const char = content[index];
  if (char === '{') {
    bracketCount++;
  } else if (char === '}') {
    bracketCount--;
  } else if (bracketCount === 1) {
    // We are at the root level of Tables: {
    // Let's accumulate characters to find table names
    currentWord += char;
  }
  index++;
}

// Now parse keys from the root level string
// Root level string contains things like:
//   admin_audit_log: { ... }
//   cart_items: { ... }
// Let's use regex on currentWord to extract names
const tableKeys = [];
const lines = currentWord.split('\n');
for (const line of lines) {
  const match = line.trim().match(/^([a-zA-Z0-9_]+):\s*\{/);
  if (match) {
    tableKeys.push(match[1]);
  }
}

console.log("=== Active Tables in DB Types ===");
console.log(JSON.stringify(tableKeys.sort(), null, 2));
console.log(`Total Tables: ${tableKeys.length}`);
fs.writeFileSync('c:\\\\Users\\\\alize\\\\venthub-hvac\\\\.agents\\\\sub_orch_m1\\\\tables_from_ts.json', JSON.stringify(tableKeys.sort(), null, 2));
