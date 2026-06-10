import os
import json
import yaml
import sys
import argparse
import subprocess
import re
from pathlib import Path

def get_repo_root() -> Path:
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return Path(output.strip())
    except Exception:
        return Path(__file__).resolve().parent.parent

def run_script(script_name: str, cwd: Path) -> bool:
    try:
        res = subprocess.run([sys.executable, str(cwd / script_name)], cwd=cwd)
        return res.returncode == 0
    except Exception as e:
        print(f"[Error] Failed to execute {script_name}: {e}")
        return False

def validate_kebab_case(name: str) -> bool:
    return bool(re.match(r"^[a-z0-9\-]+$", name))

def main():
    repo_root = get_repo_root()
    skills_dir = repo_root / ".agent" / "skills"
    
    print("\n==================================================")
    print("VentHub Otonom Agent Skills Creator CLI")
    print("==================================================\n")
    
    parser = argparse.ArgumentParser(description="Create a new VentHub modular agent skill.")
    parser.add_argument("--name", help="Name of the skill (kebab-case)")
    parser.add_argument("--description", help="Description of what the skill does")
    parser.add_argument("--category", choices=["orchestration", "intelligence", "guards", "audit", "utils"], help="Category of the skill")
    parser.add_argument("--triggers", help="Comma-separated trigger keywords")
    parser.add_argument("--inputs", help="Comma-separated input documents/assets")
    parser.add_argument("--outputs", help="Comma-separated output documents/assets")
    parser.add_argument("--recovery-pattern", help="Optional error pattern that triggers recovery")
    parser.add_argument("--recovery-cmd", help="Optional command to run on recovery trigger")
    
    args = parser.parse_args()
    
    # Interactive mode if arguments are missing
    if not args.name:
        try:
            name = input("Yetenek Adi (kebab-case, e.g. sentry-fixer): ").strip().lower()
            import re
            while not name or not validate_kebab_case(name):
                print("[Error] Name must be kebab-case (lowercase, numbers, and dashes only).")
                name = input("Yetenek Adi: ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            print("\nAborted.")
            sys.exit(1)
    else:
        name = args.name.lower().strip()
        import re
        if not validate_kebab_case(name):
            print(f"[Error] Name '{name}' is not valid kebab-case.")
            sys.exit(1)
            
    skill_dest_dir = skills_dir / name
    if skill_dest_dir.exists():
        print(f"[Error] A skill with name '{name}' already exists at {skill_dest_dir}.")
        sys.exit(1)
        
    if not args.description:
        description = input("Yetenek Aciklamasi: ").strip()
    else:
        description = args.description.strip()
        
    if not args.category:
        print("Kategoriler: [orchestration, intelligence, guards, audit, utils]")
        category = input("Kategori: ").strip().lower()
        while category not in ["orchestration", "intelligence", "guards", "audit", "utils"]:
            print("[Error] Invalid category.")
            category = input("Kategori: ").strip().lower()
    else:
        category = args.category.strip().lower()
        
    if not args.triggers:
        triggers_input = input("Tetikleyici Kelimeler (virgulle ayirin): ").strip()
        triggers = [t.strip() for t in triggers_input.split(",") if t.strip()]
    else:
        triggers = [t.strip() for t in args.triggers.split(",") if t.strip()]
        
    if not args.inputs:
        inputs_input = input("Girdiler (virgulle ayirin, ornek: project-dna.yaml): ").strip()
        inputs = [i.strip() for i in inputs_input.split(",") if i.strip()]
    else:
        inputs = [i.strip() for i in args.inputs.split(",") if i.strip()]
        
    if not args.outputs:
        outputs_input = input("Ciktilar (virgulle ayirin): ").strip()
        outputs = [o.strip() for o in outputs_input.split(",") if o.strip()]
    else:
        outputs = [o.strip() for o in args.outputs.split(",") if o.strip()]
        
    recovery = {}
    if args.recovery_pattern and args.recovery_cmd:
        recovery = {args.recovery_pattern: args.recovery_cmd}
    elif not args.recovery_pattern:
        try:
            has_rec = input("Hata Kurtarma (Recovery) eklemek ister misiniz? (y/n): ").strip().lower()
            if has_rec == 'y':
                pattern = input("Hata Arama Deseni (pattern, ornek: AuthExpired): ").strip()
                cmd = input("Kurtarma Komutu (command): ").strip()
                if pattern and cmd:
                    recovery = {pattern: cmd}
        except (KeyboardInterrupt, EOFError):
            pass
            
    # Create directories
    skill_dest_dir.mkdir(parents=True, exist_ok=False)
    scripts_dir = skill_dest_dir / "scripts"
    references_dir = skill_dest_dir / "references"
    evals_dir = skill_dest_dir / "evals"
    
    scripts_dir.mkdir(exist_ok=True)
    references_dir.mkdir(exist_ok=True)
    evals_dir.mkdir(exist_ok=True)
    
    # Write SKILL.md
    skill_md_path = skill_dest_dir / "SKILL.md"
    
    frontmatter = {
        "name": name,
        "description": description,
        "category": category,
        "metadata": {
            "triggers": triggers,
            "inputs": inputs,
            "outputs": outputs
        }
    }
    
    if recovery:
        frontmatter["metadata"]["recovery"] = recovery
        
    yaml_text = yaml.dump(frontmatter, allow_unicode=True, sort_keys=False, default_flow_style=False)
    
    skill_body = f"""# {name.replace('-', ' ').title()} Skill

## When to Use
Describe when the agent should use this skill.

## Instructions
1. Step one
2. Step two
"""
    
    with open(skill_md_path, "w", encoding="utf-8") as f:
        f.write(f"---\n{yaml_text}---\n\n{skill_body}")
        
    # Generate 12 should_trigger queries
    st_queries = []
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
    
    # Generate 8 should_not_trigger queries
    snt_queries = [
        "reset the whole database machine",
        "how to install node.js on windows",
        "set font size to 16px",
        "Vitest birim testlerini çalıştır",
        "create a new branch in git",
        "format this text as a markdown table",
        "generate an image of a cat",
        "deploy the current project code to staging"
    ]
    
    evals_data = {
        "should_trigger": st_queries,
        "should_not_trigger": snt_queries
    }
    
    with open(evals_dir / "evals.json", "w", encoding="utf-8") as f:
        json.dump(evals_data, f, indent=2, ensure_ascii=False)
        
    print(f"\n[OK] Created new skill folder and files at: {skill_dest_dir.relative_to(repo_root)}")
    
    # Compile
    print("\nCompiling skills and updating manifest...")
    compile_success = run_script("scripts/compile_skills.py", repo_root)
    
    # Evaluate
    if compile_success:
        print("\nEvaluating new skill against evaluation gates...")
        run_script("scripts/skills-evaluator.py", repo_root)
        
    print("\nSkill creation complete!")

if __name__ == "__main__":
    main()
