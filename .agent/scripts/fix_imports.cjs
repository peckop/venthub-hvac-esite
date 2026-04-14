const fs = require('fs');

const logContent = fs.readFileSync('.agent/scripts/tsc_errors.log', 'utf8');
const lines = logContent.split('\n');

const fixMap = {};

// Adjusted regex to handle the single/double quotes properly
const regex = /^(.*?)\((\d+),\d+\): error TS2614: Module .*? has no exported member '(.*?)'\. Did you mean to use 'import .*? from .*?' instead\?/;

for (const line of lines) {
  const match = line.match(regex);
  if (match) {
    const file = match[1];
    const lineNum = parseInt(match[2], 10) - 1; // 0-indexed
    const name = match[3];

    if (!fixMap[file]) {
      fixMap[file] = [];
    }
    fixMap[file].push({ name, lineNum });
  }
}

let fixedFiles = 0;
for (const [file, fixes] of Object.entries(fixMap)) {
  if (fs.existsSync(file)) {
    let contentLines = fs.readFileSync(file, 'utf8').split('\n');
    let changed = false;

    for (const fix of fixes) {
      const { name, lineNum } = fix;
      const currentLine = contentLines[lineNum];
      
      if (currentLine.includes(`import { ${name} }`)) {
        contentLines[lineNum] = currentLine.replace(`import { ${name} }`, `import ${name}`);
        changed = true;
      } else if (currentLine.includes(`import {${name}}`)) {
        contentLines[lineNum] = currentLine.replace(`import {${name}}`, `import ${name}`);
        changed = true;
      } else if (currentLine.includes(`{ ${name} }`)) {
        contentLines[lineNum] = currentLine.replace(`{ ${name} }`, name);
        changed = true;
      } else if (currentLine.includes(`{${name}}`)) {
        contentLines[lineNum] = currentLine.replace(`{${name}}`, name);
        changed = true;
      } else {
        const re = new RegExp(`\\{\\s*${name}\\s*\\}`);
        if(re.test(currentLine)) {
            contentLines[lineNum] = currentLine.replace(re, name);
            changed = true;
        }
      }
    }

    if (changed) {
      fs.writeFileSync(file, contentLines.join('\n'), 'utf8');
      console.log(`Fixed imports in ${file}`);
      fixedFiles++;
    } else {
      console.log(`Failed to find match in ${file} for some lines.`);
    }
  }
}

console.log(`Total files fixed for imports: ${fixedFiles}`);
