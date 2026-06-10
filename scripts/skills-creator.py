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
        
    # Generate 12 diverse should_trigger queries using natural language paraphrases.
    # Covers: direct Turkish commands, English equivalents, indirect requests,
    # question forms, and contextual triggers from the skill's trigger list.
    # Avoids mechanical prefixes like 'run X', 'execute X', 'start X task'.
    st_templates = [
        # Direct triggers (Turkish) — use actual trigger phrases first
        lambda n, ts: ts[0] if len(ts) > 0 else f"{n} oluştur",
        lambda n, ts: ts[1] if len(ts) > 1 else f"{n} yap",
        lambda n, ts: ts[2] if len(ts) > 2 else f"yeni {n} ekle",
        # English equivalents
        lambda n, ts: f"create a new {n}",
        lambda n, ts: f"scaffold a {n} module",
        # Indirect requests
        lambda n, ts: f"I need a new {n} for this project",
        lambda n, ts: f"can you add a {n} plugin?",
        # Question forms (mixed language)
        lambda n, ts: f"how do I set up {n}?",
        lambda n, ts: f"{n} nasıl yapılır?",
        # Contextual / action-oriented
        lambda n, ts: f"{n} için yeni bir modül ekle",
        lambda n, ts: f"{n} modülü oluşturmam lazım",
        lambda n, ts: f"build me a {n} capability",
    ]

    st_queries = [tmpl(name, triggers) for tmpl in st_templates]
    st_queries = list(dict.fromkeys(st_queries))  # deduplicate preserving order
    st_queries = st_queries[:12]
    
    # Generate 8 skill-specific should_not_trigger queries.
    # Uses category-based near-miss negatives for inter-skill discrimination,
    # plus skill-name-derived negatives (related entity, wrong action).
    category_negatives = {
        "orchestration": [
            "run unit tests", "fix typescript error",
            "deploy to vercel", "query the database",
            "style the sidebar component", "translate text to English",
        ],
        "intelligence": [
            "commit changes", "create component",
            "run build", "format markdown table",
            "add RLS policy", "scan PDF catalog",
        ],
        "guards": [
            "search notebooks", "orchestrate agents",
            "run enterprise audit", "import catalog data",
            "generate typography scale", "deploy edge function",
        ],
        "audit": [
            "create new skill", "translate text",
            "style component", "scaffold module",
            "run performance trace", "sync notebooks",
        ],
        "utils": [
            "analyze performance", "query database",
            "design UI layout", "run lighthouse audit",
            "orchestrate multi-agent sprint", "import HVAC catalog",
        ],
    }

    # Fallback generic negatives for unknown categories
    generic_negatives = [
        "reset the whole database machine",
        "how to install node.js on windows",
        "set font size to 16px",
        "generate an image of a cat",
    ]

    # Pick 4 category-based near-miss negatives + 4 contextual/generic negatives
    cat_negs = category_negatives.get(category, generic_negatives * 2)[:4]
    contextual_negs = [
        f"delete {name}",           # related entity, wrong action
        f"debug {name} error",      # related entity, wrong action
        "format this code",         # generic unrelated
        "run the development server",  # generic unrelated
    ]
    snt_queries = cat_negs + contextual_negs

    evals_data = {
        "should_trigger": st_queries,
        "should_not_trigger": snt_queries,
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
