import os
import sys
from pathlib import Path

# Print all paths to check
print("Current Working Directory:", os.getcwd())

# Import and debug
from corpus_callosum.cli.project_config import load_docs_config, _load_yaml_simple, CONFIG_FILENAME
repo_root = os.path.abspath('.')
config_path = Path(repo_root) / CONFIG_FILENAME

print("Config file path:", config_path)
print("Config file exists:", config_path.exists())
if config_path.exists():
    print("Raw Content of .cc_docs.yaml:")
    print(config_path.read_text(encoding='utf-8'))

config = _load_yaml_simple(config_path)
print("Parsed config via _load_yaml_simple directly:")
print(config)

loaded_config = load_docs_config(Path(repo_root), Path(repo_root).name)
print("Loaded config via load_docs_config:")
print(loaded_config)

from corpus_callosum.cli.docs_tree import main
sys.argv = ['cc', '--nlm-sync']
print("Running docs_tree main...")
main()
