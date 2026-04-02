import os
import re

def extract_keys_from_tr_ts(filepath):
    keys = set()
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r'([a-zA-Z0-9_]+)\s*:', content)
    for m in matches:
        keys.add(m)
    return list(keys)

def scan_dead_keys(keys, src_dir):
    usage_counts = {k: 0 for k in keys}
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                if 'tr.ts' in file or 'en.ts' in file: 
                    continue
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        text = f.read()
                        for k in keys:
                            if k in text:
                                usage_counts[k] += 1
                except Exception:
                    pass
    
    return [k for k, v in usage_counts.items() if v == 0]

if __name__ == '__main__':
    keys = extract_keys_from_tr_ts('c:/Users/alize/venthub-hvac/src/i18n/dictionaries/tr.ts')
    dead = scan_dead_keys(keys, 'c:/Users/alize/venthub-hvac/src')
    with open('i18n_dead_keys.txt', 'w', encoding='utf-8') as f:
        for k in dead:
            f.write(k + '\n')
    print(f"Total keys: {len(keys)}, Dead keys: {len(dead)}")
