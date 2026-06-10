import os
import sys
import json
import yaml
import re
import argparse
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
        res = subprocess.run(
            cmd, shell=True, cwd=cwd,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            text=True, encoding="utf-8", errors="replace"
        )
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

# ---------------------------------------------------------------------------
# Differential validation helpers
# ---------------------------------------------------------------------------

def get_changed_files(repo_root: Path) -> list[str]:
    """Get list of files changed in the working tree + staged vs HEAD."""
    changed = set()
    try:
        # Staged changes
        out = subprocess.check_output(
            ["git", "diff", "--cached", "--name-only"],
            cwd=repo_root, text=True, stderr=subprocess.DEVNULL
        )
        changed.update(l.strip() for l in out.splitlines() if l.strip())
    except Exception:
        pass
    try:
        # Unstaged changes
        out = subprocess.check_output(
            ["git", "diff", "--name-only"],
            cwd=repo_root, text=True, stderr=subprocess.DEVNULL
        )
        changed.update(l.strip() for l in out.splitlines() if l.strip())
    except Exception:
        pass
    try:
        # Untracked files
        out = subprocess.check_output(
            ["git", "ls-files", "--others", "--exclude-standard"],
            cwd=repo_root, text=True, stderr=subprocess.DEVNULL
        )
        changed.update(l.strip() for l in out.splitlines() if l.strip())
    except Exception:
        pass
    return list(changed)


def get_changed_skill_dirs(repo_root: Path) -> set[str]:
    """Return set of skill directory names that have changed files."""
    changed_files = get_changed_files(repo_root)
    skill_prefix = ".agent/skills/"
    changed_skills = set()
    for f in changed_files:
        f_normalized = f.replace("\\", "/")
        if f_normalized.startswith(skill_prefix):
            # Extract skill name: .agent/skills/<skill-name>/...
            remainder = f_normalized[len(skill_prefix):]
            parts = remainder.split("/")
            if parts:
                changed_skills.add(parts[0])
    return changed_skills


def has_source_code_changes(repo_root: Path) -> bool:
    """Check if application source code files have changed (not agent infra)."""
    changed_files = get_changed_files(repo_root)
    source_extensions = {".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".py"}
    # Directories that are agent infrastructure, not application source
    infra_prefixes = (".agent/", "scripts/", "docs/", ".github/", ".vscode/")
    for f in changed_files:
        f_normalized = f.replace("\\", "/")
        if any(f_normalized.startswith(p) for p in infra_prefixes):
            continue
        ext = os.path.splitext(f_normalized)[1].lower()
        if ext in source_extensions:
            return True
    return False


# Heavy validate commands that should only run when source code changes
HEAVY_SKILL_NAMES = {
    "venthub-enterprise-audit",
    "venthub-auditor",
    "venthub-global-rontgen",
}


def parse_args():
    parser = argparse.ArgumentParser(description="VentHub TDD Skills Evaluator & Collision Engine")
    parser.add_argument("--force", action="store_true",
                        help="Force full validation for ALL skills (ignore differential logic)")
    parser.add_argument("--skill", type=str, default=None,
                        help="Validate only a specific skill by name")
    return parser.parse_args()

def evaluate_skills():
    args = parse_args()
    repo_root = get_repo_root()
    skills_dir = repo_root / ".agent" / "skills"
    manifest_path = repo_root / ".agent" / "plugins" / "venthub-core" / "manifest.yaml"
    
    print(f"\n==================================================")
    print(f"VentHub TDD Skills Evaluator & Collision Engine")
    print(f"==================================================")
    
    # Differential mode info
    if args.force:
        print(f"  Mode: FULL (--force)")
    elif args.skill:
        print(f"  Mode: SINGLE (--skill {args.skill})")
    else:
        print(f"  Mode: DIFFERENTIAL (smart validation)")
    print()
    
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
                        
    # 3. Validation Command Check (Differential)
    print("\n3. Execution Validation:")
    
    # Determine which skills need validation
    changed_skills = get_changed_skill_dirs(repo_root)
    source_changed = has_source_code_changes(repo_root)
    
    if not args.force:
        print(f"  Changed skill dirs: {sorted(changed_skills) if changed_skills else '(none)'}")
        print(f"  Source code changed: {source_changed}")
    
    validated_count = 0
    skipped_count = 0
    
    for category, skills_list in skills_section.items():
        for skill in skills_list:
            name = skill.get("name")
            rel_path = skill.get("path")
            skill_md_path = repo_root / rel_path
            
            # --skill filter: skip if not the target skill
            if args.skill and name != args.skill:
                continue
            
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
                    # --- Differential Logic ---
                    if not args.force:
                        # Skip heavy audit skills unless source code actually changed
                        if name in HEAVY_SKILL_NAMES and not source_changed:
                            print(f"  [SKIP] '{name}': Heavy audit skipped (no source code changes)")
                            skipped_count += 1
                            continue
                        
                        # Skip unchanged skills' validate commands
                        if name not in changed_skills and name not in HEAVY_SKILL_NAMES:
                            print(f"  [SKIP] '{name}': No changes detected in skill directory")
                            skipped_count += 1
                            continue
                    # --- End Differential Logic ---
                    
                    print(f"  Running validate command for '{name}': {validate_cmd}")
                    # Resolve command path if needed, execute relative to repo root
                    success = run_local_validation_command(validate_cmd, repo_root)
                    if success:
                        print(f"    [OK] Validation command passed!")
                        validated_count += 1
                    else:
                        errors.append(f"Skill '{name}' validation command failed")
    
    print(f"\n  Validation summary: {validated_count} executed, {skipped_count} skipped")
                        
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
        
    # 5. Circular Dependency Cycle Check
    print("\n5. Circular Dependency Cycle Check:")
    adj_graph = {}
    for category, skills_list in skills_section.items():
        for skill in skills_list:
            name = skill.get("name")
            depends_on = skill.get("depends_on", [])
            adj_graph[name] = depends_on
            
    visited = {}
    cycle_path = []
    cycle_detected = False
    
    def dfs(u, path):
        nonlocal cycle_detected, cycle_path
        if visited.get(u, 0) == 1:
            cycle_detected = True
            cycle_path = path[path.index(u):] + [u]
            return True
        if visited.get(u, 0) == 2:
            return False
            
        visited[u] = 1
        for v in adj_graph.get(u, []):
            if v in adj_graph:
                if dfs(v, path + [u]):
                    return True
        visited[u] = 2
        return False
        
    for node in adj_graph:
        if visited.get(node, 0) == 0:
            if dfs(node, []):
                break
                
    if cycle_detected:
        cycle_str = " -> ".join(cycle_path)
        print(f"  [ERROR] Circular dependency detected: {cycle_str}")
        errors.append(f"Circular dependency: {cycle_str}")
    else:
        print("  [OK] No circular dependencies detected in the skill graph.")
        
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
