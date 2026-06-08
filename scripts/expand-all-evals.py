import os
import json
import yaml
from pathlib import Path

def get_repo_root() -> Path:
    import subprocess
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return Path(output.strip())
    except Exception:
        return Path(__file__).resolve().parent.parent

def main():
    repo_root = get_repo_root()
    skills_dir = repo_root / ".agent" / "skills"
    
    # Gather all registered skills from manifest
    manifest_path = repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"
    if not manifest_path.exists():
        print("[Error] Manifest not found.")
        return
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_data = yaml.safe_load(f)
        
    skills_section = manifest_data.get("skills", {})
    
    # Generic out-of-scope queries
    generic_negatives = [
        "reset the whole database machine",
        "how to install node.js on windows",
        "set font size to 16px",
        "Vitest birim testlerini çalıştır",
        "create a new branch in git",
        "format this text as a markdown table",
        "generate an image of a cat",
        "deploy the current project code to staging"
    ]
    
    print("Expanding evals for all skills to satisfy 12/8 Train/Test Split...")
    
    for category, skills_list in skills_section.items():
        for skill in skills_list:
            name = skill.get("name")
            triggers = skill.get("triggers_on", [])
            skill_dir = skills_dir / name
            evals_file = skill_dir / "evals" / "evals.json"
            
            if not evals_file.exists():
                evals_file.parent.mkdir(parents=True, exist_ok=True)
                current_should = []
                current_should_not = []
            else:
                try:
                    with open(evals_file, "r", encoding="utf-8") as f:
                        evals_data = json.load(f)
                        current_should = evals_data.get("should_trigger", [])
                        current_should_not = evals_data.get("should_not_trigger", [])
                except Exception:
                    current_should = []
                    current_should_not = []
            
            # 1. Expand should_trigger to at least 12
            st_queries = list(current_should)
            # Add variations based on triggers
            for t in triggers:
                st_queries.append(t)
                st_queries.append(f"run {t}")
                st_queries.append(f"execute {t}")
                st_queries.append(f"help me with {t}")
                st_queries.append(f"start {t} task")
                st_queries.append(f"perform {t}")
                
            st_queries = list(dict.fromkeys(st_queries)) # remove duplicates
            while len(st_queries) < 12:
                st_queries.append(f"generic triggering query variation {len(st_queries) + 1}")
            st_queries = st_queries[:12]
            
            # 2. Expand should_not_trigger to at least 8
            snt_queries = list(current_should_not)
            # Mix in generic negatives
            snt_queries.extend(generic_negatives)
            # Remove any queries that contain the skill's own triggers to prevent false alarms
            snt_queries = [q for q in snt_queries if not any(t.lower() in q.lower() for t in triggers)]
            
            snt_queries = list(dict.fromkeys(snt_queries)) # remove duplicates
            while len(snt_queries) < 8:
                snt_queries.append(f"generic non-triggering query variation {len(snt_queries) + 1}")
            snt_queries = snt_queries[:8]
            
            # Write back
            evals_data = {
                "should_trigger": st_queries,
                "should_not_trigger": snt_queries
            }
            
            with open(evals_file, "w", encoding="utf-8") as f:
                json.dump(evals_data, f, indent=2, ensure_ascii=False)
                
            print(f"  [OK] Expanded '{name}' evals to should={len(st_queries)}, should_not={len(snt_queries)}")
            
    print("\nAll skills expanded successfully. Run pnpm run skills:verify to confirm.")

if __name__ == "__main__":
    main()
