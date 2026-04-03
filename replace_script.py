import os, re

target = 'href="/products"'
replacement = 'href={Routes.products()}'

for root, _, files in os.walk('src'):
    for f in files:
        if f.endswith('.tsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            if target in content:
                print(f'Fixing {path}')
                content = content.replace(target, replacement)
                if 'import { Routes }' not in content:
                    import_statement = "import { Routes } from '@/utils/routes';\n"
                    match = re.search(r'^import .*\n', content, re.MULTILINE)
                    if match:
                        idx = match.start()
                        content = content[:idx] + import_statement + content[idx:]
                    else:
                        content = import_statement + content
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
print('Done!')
