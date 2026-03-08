from pathlib import Path
import re
import sys

# Removed dist from SKIP_DIRS temporarily to check if it was matching there (it shouldn't be)
SKIP_DIRS = {'.git', 'node_modules', '.next', 'out', '.turbo'} 
SKIP_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.pdf', '.zip'}
HTTP_PATTERN = re.compile(r"http://(?!localhost)")

def should_skip(path: Path) -> bool:
    # On Windows, path.parts might function differently depending on how path is constructed
    # Convert to string and split to be safe? 
    # But pathlib handles this usually.
    if any(part in SKIP_DIRS for part in path.parts):
        return True
    if path.suffix.lower() in SKIP_EXTENSIONS:
        return True
    return False


def main() -> None:
    root = Path('.')
    print(f"Scanning from {root.absolute()}")
    changed = []

    # Scan all files from root
    files_checked = 0
    for file_path in root.rglob('*'):
        if file_path.is_dir() or should_skip(file_path):
            continue
        
        files_checked += 1
        try:
            data = file_path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
            
        # Match count before replace
        matches = len(HTTP_PATTERN.findall(data))
        if matches > 0:
            print(f"Found {matches} matches in {file_path}")
            
        new_data, replacements = HTTP_PATTERN.subn('https://', data)
        if replacements:
            file_path.write_text(new_data, encoding='utf-8')
            changed.append((file_path, replacements))

    print(f"Scanned {files_checked} files in src/")
    print(f"Updated {len(changed)} files")
    for path, count in changed:
        print(f"{path}: {count}")


if __name__ == '__main__':
    main()
