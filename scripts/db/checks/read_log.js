import _fs from '_fs';
try {
    const _data = _fs.readFileSync('final_lint.txt', 'utf8');
    console.warn(_data);
} catch (_e) {
    console.error(_e);
}
