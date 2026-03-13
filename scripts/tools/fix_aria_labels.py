import os
import re
import argparse

# ARIA Label mapping for common icons
ICON_TO_ARIA = {
    'ChevronLeft': 'Önceki',
    'ChevronRight': 'Sonraki',
    'X': 'Kapat',
    'XCircle': 'Kapat',
    'Menu': 'Menüyü Aç',
    'AlignLeft': 'Menüyü Aç',
    'Search': 'Ara',
    'ShoppingCart': 'Sepet',
    'Heart': 'Favorilere Ekle',
    'Share2': 'Paylaş',
    'Trash2': 'Sil',
    'Edit': 'Düzenle',
    'Pencil': 'Düzenle',
    'Plus': 'Ekle',
    'Minus': 'Çıkar',
    'Filter': 'Filtrele',
    'SortDesc': 'Sırala',
    'ChevronDown': 'Genişlet',
    'ChevronUp': 'Daralt',
}

# Regex to find buttons without aria-label
# This matches <button ...> where aria-label is NOT present
BUTTON_WITHOUT_ARIA_REGEX = re.compile(r'<button((?![^>]*aria-label)[^>]*)>', re.IGNORECASE)

# Regex to check if button content is just an icon
# Matches things like <button ...><IconName ... /></button>
# Or <button ...>  <IconName />  </button>
ICON_CONTENT_REGEX = re.compile(r'>\s*<([A-Z][a-zA-Z0-9]+)\s*[^>]*?/>\s*</button>', re.DOTALL)

def process_file(file_path, apply_changes=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    changes_made = 0
    log = []

    # Find all buttons
    for match in BUTTON_WITHOUT_ARIA_REGEX.finditer(content):
        full_tag = match.group(0)
        attrs = match.group(1)
        
        # Check if this button is part of a larger string (to avoid false positives in comments/strings)
        # For simplicity, we assume if it's in a .tsx file it's likely JSX
        
        # Look ahead for content
        end_pos = match.end()
        remaining = content[end_pos:]
        
        icon_match = ICON_CONTENT_REGEX.search(content[match.start():])
        if icon_match and icon_match.start() == len(full_tag) - 1: # Immediate content
            icon_name = icon_match.group(1)
            aria_label = ICON_TO_ARIA.get(icon_name)
            
            if aria_label:
                # Add aria-label
                new_tag = f'<button{attrs} aria-label="{aria_label}">'
                # We need to be careful with replacement to not break the file
                # Using a safe replacement strategy
                old_with_content = content[match.start():match.start() + len(full_tag) + icon_match.end() - len(full_tag)]
                new_with_content = new_tag + icon_match.group(0)[1:] # keep the content
                
                # Check if we already found this specific instance to replace
                if old_with_content in new_content:
                    new_content = new_content.replace(old_with_content, new_with_content, 1)
                    changes_made += 1
                    log.append(f"Fixed button with icon {icon_name} -> {aria_label}")

    if changes_made > 0:
        if apply_changes:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
        return changes_made, log
    return 0, []

def main():
    parser = argparse.ArgumentParser(description='Auto-fix missing aria-labels on icon buttons.')
    parser.add_argument('--apply', action='store_true', help='Apply changes to files')
    parser.add_argument('--dry-run', action='store_true', help='Only report changes')
    args = parser.parse_args()

    src_dir = 'src'
    total_fixed = 0
    files_touched = 0

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.tsx'):
                file_path = os.path.join(root, file)
                count, logs = process_file(file_path, apply_changes=args.apply)
                if count > 0:
                    total_fixed += count
                    files_touched += 1
                    print(f"[{'APPLIED' if args.apply else 'DRY-RUN'}] {file_path}: {count} changes")
                    for l in logs:
                        print(f"  - {l}")

    print(f"\nSummary: {total_fixed} buttons fixed across {files_touched} files.")
    if not args.apply:
        print("Run with --apply to save changes.")

if __name__ == "__main__":
    main()
