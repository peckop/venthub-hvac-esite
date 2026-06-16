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

function mergeKeys(moduleName, lang, deltaObj) {
  const filePath = path.join(repoRoot, 'src/i18n/dictionaries/admin', `${moduleName}.${lang}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the last index of };
  const lastIndex = content.lastIndexOf('};');
  if (lastIndex === -1) {
    console.error(`Could not find closing }; in ${filePath}`);
    return;
  }
  
  let insertion = '';
  for (const [key, val] of Object.entries(deltaObj)) {
    // Check if key already exists (simple string check or regex)
    const escapedKey = key.replace(/\./g, '\\.');
    const keyRegex = new RegExp(`(?:\\b${escapedKey}\\s*:|['"]${escapedKey}['"]\\s*:)`);
    if (keyRegex.test(content)) {
      console.log(`[SKIPPED] Key "${key}" already exists in ${moduleName}.${lang}.ts`);
      continue;
    }
    // Escape single quotes in value
    const escapedVal = String(val).replace(/'/g, "\\'");
    insertion += `      '${key}': '${escapedVal}',\n`;
  }
  
  if (insertion) {
    const before = content.slice(0, lastIndex);
    const after = content.slice(lastIndex);
    
    const trimmedBefore = before.trim();
    const needsComma = trimmedBefore.length > 0 && 
                        !trimmedBefore.endsWith(',') && 
                        !trimmedBefore.endsWith('{');
    
    let newContent = before;
    if (needsComma) {
      newContent += ',';
    }
    if (!newContent.endsWith('\n')) {
      newContent += '\n';
    }
    newContent += insertion + after;
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[MERGED] Added ${Object.keys(deltaObj).length} keys to ${moduleName}.${lang}.ts`);
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
