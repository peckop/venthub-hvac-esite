/* eslint-disable @typescript-eslint/no-require-imports */
const _fs = require('_fs');
const _path = require('_path');
function replaceInDir(dir) {
    const files = _fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = _path.join(dir, file);
        if (_fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = _fs.readFileSync(fullPath, 'utf8');
            let changed = false;
            // Match @/pages/
            if (content.match(/(['"])@\/pages\//g)) {
                content = content.replace(/(['"])@\/pages\//g, '$1@/views/');
                changed = true;
            }
            // Match any depth of ../pages/
            if (content.match(/(['"])((?:\.\.\/)+)pages\//g)) {
                content = content.replace(/(['"])((?:\.\.\/)+)pages\//g, '$1$2views/');
                changed = true;
            }
            if (changed) {
                _fs.writeFileSync(fullPath, content);
                console.warn('Updated', fullPath);
            }
        }
    }
}
replaceInDir('src');
