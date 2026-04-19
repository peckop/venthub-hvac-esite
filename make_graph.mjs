import madge from 'madge';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

function walk(dir) {
    let results = [];
    const list = readdirSync(dir);
    list.forEach(function(file) {
        file = join(dir, file);
        const stat = statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('__tests__')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src');
process.stdout.write(`Found ${files.length} ts/tsx files.\n`);

madge(files, {
    baseDir: '.',
    tsConfig: 'tsconfig.json'
}).then((res) => {
    writeFileSync('.agent/project_graph.json', JSON.stringify(res.obj(), null, 2));
    process.stdout.write('Graph written to .agent/project_graph.json\n');
}).catch((err) => {
    console.error('Madge error:', err);
});
