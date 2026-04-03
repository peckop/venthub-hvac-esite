import os, re

try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False

registry_root = 'registry'
tasks = []
SKIP_FILES = {'brainstorm.md', 'plan.md', 'review.md', 'strategy.md'}

for dirpath, dirnames, filenames in os.walk(registry_root):
    parts = dirpath.replace('\\', '/')
    if not any(x in parts for x in ['/active/', '/backlog/', '/completed/']):
        continue
    if '_legacy' in parts:
        continue
    for fn in filenames:
        if not fn.endswith('.md') or fn in SKIP_FILES:
            continue
        full = os.path.join(dirpath, fn)
        try:
            content = open(full, encoding='utf-8').read()
        except Exception:
            try:
                content = open(full, encoding='cp1254').read()
            except Exception:
                content = ''
        fm = {}
        m = re.match(r'---\s*\n(.*?)\n---', content, re.DOTALL)
        if m and HAS_YAML:
            try:
                fm = yaml.safe_load(m.group(1)) or {}
            except Exception:
                pass
        elif m:
            # manual parse
            for line in m.group(1).splitlines():
                if ':' in line:
                    k, _, v = line.partition(':')
                    fm[k.strip()] = v.strip().strip('"')

        path_parts = parts.split('/')
        project = next((p for p in path_parts if p.startswith('P0')), '?')
        bucket = next((p for p in path_parts if p in ['active', 'backlog', 'completed']), '?')
        folder = os.path.basename(dirpath)

        tasks.append({
            'project': project,
            'bucket': bucket,
            'folder': folder,
            'file': fn,
            'id': str(fm.get('id', folder[:3])),
            'title': str(fm.get('title', folder)),
            'status': str(fm.get('status', 'Unknown')),
            'progress': str(fm.get('progress', '')),
        })

tasks.sort(key=lambda x: (x['project'], x['bucket'], x['id']))
for t in tasks:
    bucket_label = t['bucket'].upper().ljust(9)
    status_label = t['status'].ljust(12)
    print(f"[{t['project']}][{bucket_label}] {t['id'].rjust(3)} | {status_label} {t['progress'].rjust(4)} | {t['title']}")

print(f"\nToplam: {len(tasks)} gorev")
