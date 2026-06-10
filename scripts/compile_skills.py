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

def main():
    repo_root = get_repo_root()
    skills_dir = repo_root / ".agent" / "skills"
    manifest_path = repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"
    output_file = repo_root / "docs" / "venthub_skills_master.md"
    
    print(f"[Skills Compiler] Repository root: {repo_root}")
    print(f"[Skills Compiler] Skills directory: {skills_dir}")
    print(f"[Skills Compiler] Manifest output path: {manifest_path}")
    print(f"[Skills Compiler] Master doc path: {output_file}")
    
    if not skills_dir.exists():
        print(f"[Error] Skills directory does not exist: {skills_dir}")
        return
        
    compiled_skills = []
    
    # Base manifest structure
    manifest = {
        "name": "venthub-core",
        "version": "1.0.0",
        "description": "VentHub Core Developer & Quality Plugin - LLM Ajanları için Entegre Geliştirme ve Kalite Rehberleri",
        "rules": {
            "evidence_required": True,
            "prerequisite_check": True,
            "critical_asset_protection": True
        },
        "skills": {
            "orchestration": [],
            "intelligence": [],
            "guards": [],
            "audit": [],
            "utils": []
        }
    }
    
    # Iterate through all skill directories
    for skill_path in sorted(skills_dir.iterdir()):
        if skill_path.is_dir():
            skill_md_path = skill_path / "SKILL.md"
            if skill_md_path.exists():
                print(f"[Found] {skill_md_path.relative_to(repo_root)}")
                with open(skill_md_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Split YAML frontmatter
                parts = content.split("---")
                if len(parts) >= 3 and content.strip().startswith("---"):
                    frontmatter_text = parts[1]
                    body_text = "---".join(parts[2:]).strip()
                    try:
                        metadata_yaml = yaml.safe_load(frontmatter_text) or {}
                    except Exception as e:
                        print(f"  [Error] Failed to parse frontmatter for {skill_path.name}: {e}")
                        continue
                else:
                    body_text = content.strip()
                    metadata_yaml = {}
                
                name = metadata_yaml.get("name", skill_path.name)
                description = metadata_yaml.get("description", "")
                category = metadata_yaml.get("category", "utils")
                metadata = metadata_yaml.get("metadata", {})
                
                depends_on = metadata_yaml.get("depends_on", [])
                next_steps = metadata_yaml.get("next_steps", [])
                run_last = metadata_yaml.get("run_last", False)
                exclusions = metadata_yaml.get("exclusions", [])
                
                # Check if category is valid, if not default to 'utils'
                if category not in manifest["skills"]:
                    print(f"  [Warning] Category '{category}' for skill '{name}' is invalid, defaulting to 'utils'")
                    category = "utils"
                
                # Add to manifest list
                skill_rel_path = str(skill_md_path.relative_to(repo_root)).replace("\\", "/")
                
                manifest_entry = {
                    "name": name,
                    "path": skill_rel_path,
                    "description": description,
                    "triggers_on": metadata.get("triggers", []),
                    "inputs": metadata.get("inputs", []),
                    "outputs": metadata.get("outputs", []),
                    "depends_on": depends_on,
                    "next_steps": next_steps,
                    "run_last": run_last,
                    "exclusions": exclusions,
                    "commands": metadata.get("commands", {})
                }
                
                # Include optional recovery and prerequisites
                if "recovery" in metadata:
                    manifest_entry["recovery"] = metadata["recovery"]
                if "prerequisites" in metadata:
                    manifest_entry["prerequisites"] = metadata["prerequisites"]
                    
                manifest["skills"][category].append(manifest_entry)
                
                compiled_skills.append({
                    "name": name,
                    "description": description,
                    "body": body_text,
                    "dir_name": skill_path.name,
                    "depends_on": depends_on,
                    "next_steps": next_steps,
                    "run_last": run_last,
                    "exclusions": exclusions
                })
                
    # Sort manifest entries by name in each category
    for category in manifest["skills"]:
        manifest["skills"][category].sort(key=lambda x: x["name"].lower())
        
    # Write manifest.yaml
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w", encoding="utf-8") as f:
        # Save as standard YAML
        yaml.dump(manifest, f, allow_unicode=True, sort_keys=False, default_flow_style=False)
    print(f"[Success] Wrote manifest.yaml with {len(compiled_skills)} skills registered.")
    
    # Sort compiled skills list for master markdown
    compiled_skills.sort(key=lambda x: x["name"].lower())
    
    # Build master markdown
    master_content = []
    master_content.append("# VentHub Enterprise Agent Skills Master\n")
    master_content.append("This document compiles the core operational skills, guardrails, and validation protocols used by autonomous agents in the VentHub HVAC enterprise project.\n")
    master_content.append("Generated automatically from local modular skills under `.agent/skills/`.\n")
    
    # Generate Mermaid Flow Diagram
    master_content.append("## Yetenek Bağımlılık Grafı (Mermaid Dependency Graph)\n")
    master_content.append("```mermaid")
    master_content.append("graph TD")
    for skill in compiled_skills:
        name = skill["name"]
        for dep in skill.get("depends_on", []):
            master_content.append(f"    {dep} --> {name}")
    master_content.append("```\n")
    
    master_content.append("---\n")
    
    for idx, skill in enumerate(compiled_skills, 1):
        master_content.append(f"## {idx}. Yetenek: {skill['name']}")
        if skill['description']:
            master_content.append(f"> **Açıklama:** {skill['description']}\n")
        master_content.append(f"**Klasör Yolu:** `.agent/skills/{skill['dir_name']}/`\n")
        master_content.append(skill['body'])
        master_content.append("\n---\n")
        
    # Write to output file
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(master_content))
        
    print(f"[Success] Compiled {len(compiled_skills)} skills into {output_file.relative_to(repo_root)}")

if __name__ == "__main__":
    main()
