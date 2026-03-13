import os
import re

def migrate_images(directory):
    # Regex to find standard <img> tags
    # Handles simple <img src="..." alt="..." /> patterns
    img_pattern = re.compile(r'<img\s+([^>]*?)src=\{([^}]+)\}([^>]*?)\/?>', re.IGNORECASE)
    img_static_pattern = re.compile(r'<img\s+([^>]*?)src="([^"]+?)"([^>]*?)\/?>', re.IGNORECASE)
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.jsx')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                
                # 1. Check if we already have VentImage import
                has_import = 'import { VentImage }' in content or 'import VentImage' in content
                
                # 2. Replace dynamic src images: <img src={...} />
                if img_pattern.search(content):
                    new_content = img_pattern.sub(r'<VentImage \1src={\2}\3 />', new_content)
                
                # 3. Replace static src images: <img src="..." />
                if img_static_pattern.search(content):
                    new_content = img_static_pattern.sub(r'<VentImage \1src="\2"\3 />', new_content)
                
                # 4. Add import if content was changed and import is missing
                if new_content != content and not has_import:
                    # Try to find a good place for import (after React or existing UI components)
                    if "import React" in new_content:
                        new_content = new_content.replace("import React", "import { VentImage } from '@/components/ui/VentImage'\nimport React", 1)
                    else:
                        new_content = "import { VentImage } from '@/components/ui/VentImage'\n" + new_content
                
                if new_content != content:
                    print(f"Migrating: {path}")
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    migrate_images('src')
    print("Migration completed.")
