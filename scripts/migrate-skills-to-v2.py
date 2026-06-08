import os
import yaml
from pathlib import Path

def get_repo_root() -> Path:
    # Get top level git directory
    import subprocess
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return Path(output.strip())
    except Exception:
        return Path(__file__).resolve().parent.parent

def migrate_skills():
    repo_root = get_repo_root()
    manifest_path = repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"
    
    if not manifest_path.exists():
        print(f"[Error] manifest.yaml not found at {manifest_path}")
        return
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_data = yaml.safe_load(f)
        
    skills_section = manifest_data.get("skills", {})
    
    total_migrated = 0
    
    # Standard unrelated queries for should_not_trigger
    standard_negative_queries = [
        "reset the whole database machine",
        "how to install node.js on windows",
        "send an email to my manager",
        "what is the weather in Istanbul"
    ]
    
    for category, skills_list in skills_section.items():
        print(f"\nProcessing category: {category}")
        for skill_entry in skills_list:
            name = skill_entry.get("name")
            rel_path = skill_entry.get("path")
            
            # Resolve absolute path to the SKILL.md file
            skill_md_path = repo_root / rel_path
            
            if not skill_md_path.exists():
                print(f"  [Warning] SKILL.md not found at {skill_md_path}")
                continue
                
            print(f"  Migrating skill: {name} ({rel_path})")
            
            # Read current content of SKILL.md
            with open(skill_md_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Parse YAML frontmatter
            parts = content.split("---")
            if len(parts) >= 3 and content.strip().startswith("---"):
                frontmatter_text = parts[1]
                body_text = "---".join(parts[2:]).strip()
                try:
                    frontmatter_data = yaml.safe_load(frontmatter_text) or {}
                except Exception as e:
                    print(f"    [Error] Failed to parse frontmatter for {name}: {e}")
                    continue
            else:
                body_text = content.strip()
                frontmatter_data = {}
                
            # Enrich frontmatter with manifest metadata
            frontmatter_data["name"] = name
            frontmatter_data["category"] = category
            if "description" not in frontmatter_data or not frontmatter_data["description"]:
                frontmatter_data["description"] = skill_entry.get("description", "")
                
            # Build metadata block
            metadata = frontmatter_data.get("metadata", {})
            if not isinstance(metadata, dict):
                metadata = {}
                
            metadata["triggers"] = skill_entry.get("triggers_on", [])
            metadata["inputs"] = skill_entry.get("inputs", [])
            metadata["outputs"] = skill_entry.get("outputs", [])
            
            if "recovery" in skill_entry:
                metadata["recovery"] = skill_entry["recovery"]
                
            if "prerequisites" in skill_entry:
                metadata["prerequisites"] = skill_entry["prerequisites"]
                
            frontmatter_data["metadata"] = metadata
            
            # Reconstruct SKILL.md
            # Use safe_dump but ensure we output clean yaml formatting
            new_frontmatter = yaml.dump(frontmatter_data, allow_unicode=True, sort_keys=False, default_flow_style=False)
            
            new_content = f"---\n{new_frontmatter}---\n\n{body_text}\n"
            
            with open(skill_md_path, "w", encoding="utf-8") as f:
                f.write(new_content)
                
            # Create evals directory next to SKILL.md
            skill_dir = skill_md_path.parent
            evals_dir = skill_dir / "evals"
            evals_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate baseline evals.json
            triggers = skill_entry.get("triggers_on", [])
            should_trigger_queries = []
            for t in triggers:
                should_trigger_queries.append(t)
                should_trigger_queries.append(f"run {t}")
                should_trigger_queries.append(f"can you execute {t}?")
                
            # Keep it concise but representative
            should_trigger_queries = list(set(should_trigger_queries))[:6]
            
            evals_data = {
                "should_trigger": should_trigger_queries,
                "should_not_trigger": standard_negative_queries
            }
            
            evals_json_path = evals_dir / "evals.json"
            with open(evals_json_path, "w", encoding="utf-8") as f:
                import json
                json.dump(evals_data, f, indent=2, ensure_ascii=False)
                
            total_migrated += 1
            print(f"    [OK] Successfully migrated and wrote evals.json")
            
    print(f"\n[Success] Migrated {total_migrated} skills to V2 format.")

if __name__ == "__main__":
    migrate_skills()
