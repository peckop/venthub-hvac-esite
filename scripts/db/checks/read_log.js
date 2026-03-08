
const fs = require('fs');
try {
    const data = fs.readFileSync('final_lint.txt', 'utf8');
    console.log(data); // Print everything, let the tool truncate if needed, but at least we get head
} catch (e) {
    console.error(e);
}
