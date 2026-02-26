import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dir = path.join(__dirname, 'src', 'views', 'admin');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let total = 0;
let nonStandard = 0;
let output = '';

for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
        if (line.includes('<button')) {
            total++;
            if (!line.includes('adminButtonPrimaryClass') && !line.includes('adminButtonSecondaryClass')) {
                nonStandard++;
                output += `${f}:${idx + 1}: ${line.trim()}\n`;
            }
        }
    });
}
output += `\nTotal buttons: ${total}, Non-standard: ${nonStandard}\n`;
fs.writeFileSync(path.join(__dirname, 'buttons_utf8.log'), output, 'utf-8');
