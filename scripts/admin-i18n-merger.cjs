const fs = require('fs');
const path = require('path');

if (process.argv.length < 3) {
  console.error('Usage: node admin-i18n-merger.cjs <deltas.json>');
  process.exit(1);
}

const deltasPath = path.resolve(process.argv[2]);
if (!fs.existsSync(deltasPath)) {
  console.error(`Deltas file not found: ${deltasPath}`);
  process.exit(1);
}

const deltas = JSON.parse(fs.readFileSync(deltasPath, 'utf8'));
const repoRoot = path.resolve(__dirname, '..');

function setNestedValue(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current) || typeof current[part] !== 'object' || current[part] === null) {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function stringify(obj, indent = '  ') {
  if (typeof obj === 'string') {
    return `'${obj.replace(/'/g, "\\'")}'`;
  }
  if (typeof obj !== 'object' || obj === null) {
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return `[\n` + obj.map(item => `${indent}  ${stringify(item, indent + '  ')}`).join(',\n') + `\n${indent}]`;
  }
  
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  
  let res = '{\n';
  for (const [key, val] of entries) {
    const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
    res += `${indent}  ${formattedKey}: ${stringify(val, indent + '  ')},\n`;
  }
  res += `${indent}}`;
  return res;
}

function mergeKeys(moduleName, lang, deltaObj) {
  const filePath = path.join(repoRoot, 'src/i18n/dictionaries/admin', `${moduleName}.${lang}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the object definition
  const objRegex = new RegExp(`export\\s+const\\s+${moduleName}\\s*=\\s*(\\{[\\s\\S]*\\});?`);
  const match = content.match(objRegex);
  if (!match) {
    console.error(`Could not parse object definition for "${moduleName}" in ${filePath}`);
    return;
  }
  
  const objStr = match[1];
  let obj = {};
  try {
    obj = eval(`(${objStr})`);
  } catch (e) {
    console.error(`Failed to eval object for "${moduleName}" in ${filePath}:`, e);
    return;
  }
  
  let mergedCount = 0;
  for (const [key, val] of Object.entries(deltaObj)) {
    // Check if the key already exists inside the nested path
    const parts = key.split('.');
    let exists = true;
    let curr = obj;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        exists = false;
        break;
      }
    }
    
    if (exists && typeof curr === 'string') {
      console.log(`[SKIPPED] Key "${key}" already exists in ${moduleName}.${lang}.ts`);
      continue;
    }
    
    setNestedValue(obj, key, val);
    mergedCount++;
  }
  
  if (mergedCount > 0) {
    const stringified = `export const ${moduleName} = ${stringify(obj, '')};\n`;
    // Replace the entire object definition
    const newContent = content.replace(objRegex, stringified.trim());
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[MERGED] Added/updated ${mergedCount} keys in ${moduleName}.${lang}.ts`);
  } else {
    console.log(`[NO CHANGES] All keys already exist in ${moduleName}.${lang}.ts`);
  }
}

// Group deltas by module
const grouped = {};
for (const item of deltas) {
  if (!item.module || !item.key) {
    console.warn(`[WARN] Invalid delta item skipped: ${JSON.stringify(item)}`);
    continue;
  }
  const moduleName = item.module.startsWith('admin.') ? item.module.slice(6) : item.module;
  grouped[moduleName] ??= { tr: {}, en: {} };
  grouped[moduleName].tr[item.key] = item.tr || '';
  grouped[moduleName].en[item.key] = item.en || '';
}

// Apply merges
for (const [moduleName, langs] of Object.entries(grouped)) {
  mergeKeys(moduleName, 'tr', langs.tr);
  mergeKeys(moduleName, 'en', langs.en);
}

console.log('Central i18n merge completed successfully.');
