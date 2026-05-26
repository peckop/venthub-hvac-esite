import os
import sys
from pathlib import Path

repo_root = os.path.abspath('.')
print("repo_root:", repo_root)

from pathlib import Path as _Path
from corpus_callosum.cli.project_config import load_docs_config, _load_yaml_simple, CONFIG_FILENAME

_config = load_docs_config(_Path(repo_root), _Path(repo_root).name)
source_roots = _config.get("source_dirs", [])
print("source_dirs:", source_roots)

extra_masters = _config.get('extra_masters', [])
print("extra_masters in _config:", extra_masters)

for em in extra_masters:
    print("processing em:", em)
    if isinstance(em, dict) and em.get('source_dirs'):
        em_sd = em['source_dirs']
        if isinstance(em_sd, str):
            em_sd = [em_sd]
        for sd in em_sd:
            if sd not in source_roots:
                source_roots.append(sd)
print("source_dirs (extra dahil):", source_roots)
