const fs = require('fs');
const path = require('path');
const dir = 'c:/Users/alize/venthub-hvac/src/views/admin';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let changedFiles = 0;
for (const file of files) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    content = content.replace(/([ \t]*)(<table\b[^>]*>[\s\S]*?<\/table>)/g, (match, whitespace, table) => {
        const startIdx = content.indexOf(match);
        const before = content.substring(Math.max(0, startIdx - 100), startIdx);
        if (before.includes('overflow-x-auto')) {
            return match; // Already wrapped
        }

        let newTable = table;
        const tableOpenTagMatches = newTable.match(/(<table\b[^>]*>)/);
        if (tableOpenTagMatches) {
            const tableOpenTag = tableOpenTagMatches[1];
            const classMatch = tableOpenTag.match(/className=["']([^"']*)["']/);
            if (classMatch) {
                let classes = classMatch[1];
                if (!classes.includes('max-md:text-xs') && !classes.includes('text-xs')) {
                    const replacer = classMatch[0].replace(classes, classes + ' max-md:text-xs');
                    newTable = newTable.replace(classMatch[0], replacer);
                }
            } else {
                newTable = newTable.replace(/<table/, '<table className="max-md:text-xs"');
            }
        }

        // Add wrapper
        return `${whitespace}<div className="overflow-x-auto w-full">\n${whitespace}  ${newTable.split('\n').join('\n  ')}\n${whitespace}</div>`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        changedFiles++;
        console.log(`Updated ${file}`);
    }
}
console.log(`Total files updated: ${changedFiles}`);
