import os
import json
import yaml
import re
from pathlib import Path
import subprocess

def get_repo_root() -> Path:
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return Path(output.strip())
    except Exception:
        return Path(__file__).resolve().parent.parent

def run_local_validation_command(cmd: str, cwd: Path) -> bool:
    try:
        # Run command and capture output
        res = subprocess.run(cmd, shell=True, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0:
            return True
        else:
            print(f"      [Validation Error] Command '{cmd}' failed with code {res.returncode}")
            print(f"      Stdout: {res.stdout.strip()}")
            print(f"      Stderr: {res.stderr.strip()}")
            return False
    except Exception as e:
        print(f"      [Exception] Failed to execute validation command: {e}")
        return False

def evaluate_skills():
    repo_root = get_repo_root()
    skills_dir = repo_root / ".agent" / "skills"
    manifest_path = repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"
    
    print(f"\n==================================================")
    print(f"VentHub TDD Skills Evaluator & Collision Engine")
    print(f"==================================================\n")
    
    if not manifest_path.exists():
        print(f"[ERROR] manifest.yaml not found at {manifest_path}. Please run compile_skills.py first.")
        return False
        
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_data = yaml.safe_load(f)
        
    skills_section = manifest_data.get("skills", {})
    
    all_skills = []
    trigger_map = {} # trigger_word -> list of skill names
    errors = []
    warnings = []
    
    # 1. Gather all skills and check for duplicates/collisions
    for category, skills_list in skills_section.items():
        for skill in skills_list:
            name = skill.get("name")
            path = skill.get("path")
            triggers = skill.get("triggers_on", [])
            recovery = skill.get("recovery", {})
            
            all_skills.append(skill)
            
            # Check triggers for collisions
            for t in triggers:
                t_lower = t.lower().strip()
                if t_lower in trigger_map:
                    trigger_map[t_lower].append(name)
                else:
                    trigger_map[t_lower] = [name]
                    
    # Report collisions
    print("1. Collision Detection:")
    collisions_found = False
    for trigger, skills in trigger_map.items():
        if len(skills) > 1:
            print(f"  [COLLISION] Trigger '{trigger}' is registered by multiple skills: {skills}")
            errors.append(f"Collision: Trigger '{trigger}' registered by {skills}")
            collisions_found = True
            
    if not collisions_found:
        print("  [OK] No trigger collisions detected! Every skill has unique triggers.")
        
    # 2. Schema and Evals Coverage check
    print("\n2. Evals & Coverage Analysis:")
    
    for category, skills_list in skills_section.items():
        for skill in skills_list:
            name = skill.get("name")
            rel_path = skill.get("path")
            skill_md_path = repo_root / rel_path
            skill_dir = skill_md_path.parent
            evals_file = skill_dir / "evals" / "evals.json"
            
            print(f"\n  Checking skill: {name} ({category})")
            
            # Check if evals.json exists
            if not evals_file.exists():
                print(f"    [ERROR] evals.json is missing!")
                errors.append(f"Skill '{name}' is missing evals.json")
                continue
                
            try:
                with open(evals_file, "r", encoding="utf-8") as f:
                    evals_data = json.load(f)
            except Exception as e:
                print(f"    [ERROR] Failed to parse evals.json: {e}")
                errors.append(f"Skill '{name}' has malformed evals.json: {e}")
                continue
                
            should_trigger = evals_data.get("should_trigger", [])
            should_not_trigger = evals_data.get("should_not_trigger", [])
            
            # 12/8 Train/Test Split validation
            split_status = "VERIFIED" if len(should_trigger) >= 12 and len(should_not_trigger) >= 8 else "INCOMPLETE"
            print(f"    - Evals count: should_trigger={len(should_trigger)}, should_not_trigger={len(should_not_trigger)} (12/8 Train/Test Split: {split_status})")
            
            if split_status == "INCOMPLETE":
                warnings.append(f"Skill '{name}': Evals dataset is below target 12/8 split (has should={len(should_trigger)}, should_not={len(should_not_trigger)})")
            
            # Coverage Test: Check if queries in should_trigger actually match the triggers of this skill
            triggers = skill.get("triggers_on", [])
            triggers_lower = [t.lower().strip() for t in triggers]
            
            for query in should_trigger:
                query_lower = query.lower().strip()
                matched = False
                for t in triggers_lower:
                    # Match if query contains the trigger, or trigger is in query
                    if t in query_lower or query_lower in t:
                        matched = True
                        break
                if not matched:
                    print(f"    [WARNING] should_trigger query '{query}' does not match any of the registered triggers: {triggers}")
                    warnings.append(f"Skill '{name}': query '{query}' does not match triggers")
                    
            # Negative Test: Check that should_not_trigger queries do not match any triggers
            for query in should_not_trigger:
                query_lower = query.lower().strip()
                for t in triggers_lower:
                    if t in query_lower and len(t) > 2: # Ignore very short triggers to prevent false alarms
                        print(f"    [ERROR] should_not_trigger query '{query}' matches registered trigger '{t}'!")
                        errors.append(f"Skill '{name}': negative query '{query}' matched trigger '{t}'")
                        
    # 3. Validation Command Check
    print("\n3. Execution Validation:")
    for category, skills_list in skills_section.items():
        for skill in skills_list:
            name = skill.get("name")
            rel_path = skill.get("path")
            skill_md_path = repo_root / rel_path
            
            # Check SKILL.md for validate command in metadata
            with open(skill_md_path, "r", encoding="utf-8") as f:
                content = f.read()
            parts = content.split("---")
            if len(parts) >= 3 and content.strip().startswith("---"):
                try:
                    metadata_yaml = yaml.safe_load(parts[1]) or {}
                except Exception:
                    continue
                metadata = metadata_yaml.get("metadata", {})
                commands = metadata.get("commands", {})
                validate_cmd = commands.get("validate")
                
                if validate_cmd:
                    print(f"  Running validate command for '{name}': {validate_cmd}")
                    # Resolve command path if needed, execute relative to repo root
                    success = run_local_validation_command(validate_cmd, repo_root)
                    if success:
                        print(f"    [OK] Validation command passed!")
                    else:
                        errors.append(f"Skill '{name}' validation command failed")
                        
    # 4. Semantic Similarity (Offline Description Check)
    print("\n4. Semantic Similarity Analysis:")
    similarity_warnings = 0
    for i in range(len(all_skills)):
        for j in range(i + 1, len(all_skills)):
            skill_a = all_skills[i]
            skill_b = all_skills[j]
            name_a = skill_a.get("name")
            name_b = skill_b.get("name")
            desc_a = skill_a.get("description", "")
            desc_b = skill_b.get("description", "")
            
            # Simple tokenization: lowercase and extract words
            words_a = set(re.findall(r'\w+', desc_a.lower()))
            words_b = set(re.findall(r'\w+', desc_b.lower()))
            
            if not words_a or not words_b:
                continue
                
            intersection = words_a.intersection(words_b)
            union = words_a.union(words_b)
            similarity = len(intersection) / len(union)
            
            if similarity > 0.60:
                warning_msg = f"[WARNING] Semantic similarity detected between {name_a} and {name_b}"
                print(warning_msg)
                warnings.append(warning_msg)
                similarity_warnings += 1
                
    if similarity_warnings == 0:
        print("  [OK] No semantic similarity collision detected between skill descriptions.")
        
    print(f"\n==================================================")
    print(f"Summary of Evaluation:")
    print(f"  Errors: {len(errors)}")
    print(f"  Warnings: {len(warnings)}")
    print(f"==================================================")
    
    if len(errors) > 0:
        print("\n[FAIL] EVALUATION FAILED: Please resolve the errors listed above.")
        for err in errors:
            print(f"  - {err}")
        return False
    else:
        print("\n[PASS] EVALUATION PASSED! All skills are verified, non-colliding, and well-covered.")
        return True

if __name__ == "__main__":
    evaluate_skills()
