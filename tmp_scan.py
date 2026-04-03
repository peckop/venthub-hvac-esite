import os, re
import json

patterns = {
    'Hardcoded internal href': r'href=[\'\"`]\/[^\'\"`]*[\'\"`]',
    'Raw a tag for internal routing': r'<a\s+[^>]*href=[\'\"`]\/[^\'\"`]*[\'\"`]',
    'router.push with hardcoded string': r'router\.push\([\'\"`]\/[^\'\"`]*[\'\"`]\)',
    'window.location assignment': r'window\.location\.(?:href|assign|replace)\s*=\s*[\'\"`]\/[^\'\"`]*[\'\"`]',
    'UUID leakage (slug || id)': r'slug\s*\|\|\s*[a-zA-Z0-9_]*id|id\s*\|\|\s*[a-zA-Z0-9_]*slug',
    'Hardcoded API routes': r'fetch\([\'\"`]\/api\/[^\'\"`]*[\'\"`]\)',
}

results = {k: [] for k in patterns}
ignore_dirs = ['node_modules', '.next', 'dist', '.git', 'tmp']

for root, dirs, files in os.walk('src'):
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                try:
                    content = file.read()
                except Exception:
                    continue
                
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    for name, pat in patterns.items():
                        if re.search(pat, line):
                            # Exclude typical safe ones like href="/" or '/images/'
                            clean_line = line.strip()
                            if '/images/' in clean_line or '/icons/' in clean_line or '/favicon' in line or '/fonts' in line:
                                continue
                            if re.search(r'href=[\'\"`]\/[\'\"`]', line): # exact matches for href="/"
                                continue
                            
                            results[name].append(f'{path}:{i+1} : {clean_line}')

with open('scan_results.json', 'w', encoding='utf-8') as out:
    json.dump(results, out, indent=2, ensure_ascii=False)

print('Scan complete.')
