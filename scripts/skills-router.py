import os
import sys
import json
import argparse
import re
import numpy as np
import yaml
from pathlib import Path
import tokenizers
import onnxruntime as ort

def get_repo_root() -> Path:
    import subprocess
    try:
        output = subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True)
        return Path(output.strip())
    except Exception:
        return Path(__file__).resolve().parent.parent

def load_skills(skills_dir: Path):
    skills_list = []
    if not skills_dir.exists():
        print(f"Skills directory does not exist: {skills_dir}", file=sys.stderr)
        return skills_list
        
    for skill_path in sorted(skills_dir.iterdir()):
        if skill_path.is_dir():
            skill_md_path = skill_path / "SKILL.md"
            if skill_md_path.exists():
                with open(skill_md_path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                parts = content.split("---")
                if len(parts) >= 3 and content.strip().startswith("---"):
                    frontmatter_text = parts[1]
                    try:
                        frontmatter = yaml.safe_load(frontmatter_text) or {}
                    except Exception as e:
                        print(f"Error parsing frontmatter for {skill_path.name}: {e}", file=sys.stderr)
                        continue
                else:
                    continue
                
                name = frontmatter.get("name", skill_path.name)
                description = frontmatter.get("description", "")
                depends_on = frontmatter.get("depends_on", [])
                next_steps = frontmatter.get("next_steps", [])
                run_last = frontmatter.get("run_last", False)
                exclusions = frontmatter.get("exclusions", [])
                
                # Load triggers
                metadata = frontmatter.get("metadata", {})
                triggers = metadata.get("triggers", [])
                if not triggers and "triggers" in frontmatter:
                    triggers = frontmatter.get("triggers", [])
                
                skills_list.append({
                    "name": name,
                    "description": description,
                    "depends_on": depends_on,
                    "next_steps": next_steps,
                    "run_last": run_last,
                    "exclusions": exclusions,
                    "triggers": triggers
                })
    return skills_list

def main():
    parser = argparse.ArgumentParser(description="Route query to modular agent skills.")
    parser.add_argument("--query", required=True, help="User query string")
    args = parser.parse_args()
    
    repo_root = get_repo_root()
    skills_dir = repo_root / ".agent" / "skills"
    model_path = repo_root / ".agent" / "cache" / "onnx" / "model.onnx"
    tokenizer_path = repo_root / ".agent" / "cache" / "onnx" / "tokenizer.json"
    
    # Load skills
    skills = load_skills(skills_dir)
    if not skills:
        print(json.dumps({"status": "CONVERSATIONAL"}))
        return
        
    # Load Tokenizer
    tokenizer = tokenizers.Tokenizer.from_file(str(tokenizer_path))
    tokenizer.enable_padding(pad_id=0, pad_token="[PAD]")
    tokenizer.enable_truncation(max_length=512)
    
    # Encode all descriptions and query
    texts = [args.query] + [s["description"] for s in skills]
    encodings = tokenizer.encode_batch(texts)
    
    input_ids = np.array([e.ids for e in encodings], dtype=np.int64)
    attention_mask = np.array([e.attention_mask for e in encodings], dtype=np.int64)
    token_type_ids = np.array([e.type_ids for e in encodings], dtype=np.int64)
    
    # Load ONNX Model Session
    session = ort.InferenceSession(str(model_path))
    
    # Run inference
    ort_inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "token_type_ids": token_type_ids
    }
    ort_outputs = session.run(["last_hidden_state"], ort_inputs)
    token_embeddings = ort_outputs[0] # Shape: (batch_size, seq_len, 384)
    
    # Perform mean pooling
    input_mask_expanded = np.expand_dims(attention_mask, axis=-1)
    sum_embeddings = np.sum(token_embeddings * input_mask_expanded, axis=1)
    sum_mask = np.sum(input_mask_expanded, axis=1)
    sum_mask = np.clip(sum_mask, a_min=1e-9, a_max=None)
    sentence_embeddings = sum_embeddings / sum_mask # Shape: (batch_size, 384)
    
    # Calculate Cosine Similarity
    norms = np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)
    norms = np.clip(norms, a_min=1e-9, a_max=None)
    normalized_embeddings = sentence_embeddings / norms
    
    query_embedding = normalized_embeddings[0]
    skill_embeddings = normalized_embeddings[1:]
    
    similarities = np.dot(skill_embeddings, query_embedding) # Shape: (28,)
    
    # DEV_KEYWORDS list to filter out general conversational queries
    DEV_KEYWORDS = {
        # Turkish
        "kod", "test", "hata", "commit", "veritabanı", "veritabani", "db", "git", "dosya", "plan",
        "yetenek", "hedef", "sprint", "mimar", "denetim", "rapor", "çeviri", "ceviri", "dil", "ekran",
        "tasarım", "tasarim", "renk", "yönlendir", "yonlendir", "derle", "tarama", "temizle", "bağımlılık",
        "sayfa", "ekran", "yaz", "ekle", "sil", "güncelle", "guncelle", "düzenle", "duzenle", "çalıştır",
        "calistir", "kontrol", "oku", "import", "export", "veri", "tablo", "sorgu", "analiz", "enjekte", "optimize",
        # English/Tech
        "code", "test", "error", "bug", "fix", "commit", "database", "git", "file", "plan", "prd",
        "issue", "sprint", "architecture", "audit", "report", "translation", "i18n", "ui", "ux",
        "design", "color", "route", "router", "compile", "scan", "clean", "dependency", "dependencies",
        "supabase", "rls", "policy", "migration", "migrate", "nextjs", "next", "react", "tailwind",
        "css", "performance", "lighthouse", "fallow", "knip", "lint", "eslint", "type-check", "tsc",
        "build", "production", "composition", "compound", "font", "typography", "readability",
        "composition", "composed", "Composition", "diff", "review", "multiagent", "multi-agent",
        "agent", "agents", "teamwork", "preview", "director", "orion", "cli", "notebook", "notebooklm",
        "sync", "navigator"
    }
    
    query_lower = args.query.lower().strip()
    
    # Replace Turkish synonyms for robust matching
    SYNONYMS = {
        "performans": "performance",
        "denetim": "audit",
        "kontrol": "check",
        "hata": "error",
        "bağımlılık": "dependency",
        "bagimlilik": "dependency",
        "dil": "i18n",
        "çeviri": "translation",
        "ceviri": "translation",
        "tasarım": "design",
        "tasarim": "design",
        "yetenek": "skill",
        "sorgu": "query",
        "veritabanı": "database",
        "veritabani": "database",
        "analiz": "audit",
    }
    for tr, eng in SYNONYMS.items():
        query_lower = query_lower.replace(tr, eng)
        
    # Basic tokenization
    query_tokens = set(re.findall(r'\w+', query_lower))
    
    # Check if there's any trigger match or dev keyword overlap
    any_trigger_match = False
    has_dev_keyword = len(query_tokens.intersection(DEV_KEYWORDS)) > 0
    
    # Map back to skill objects and apply boosts
    for idx, s in enumerate(skills):
        cosine_sim = float(similarities[idx])
        boost = 0.0
        
        # Trigger matching
        trigger_matched = False
        for trigger in s.get("triggers", []):
            trig_lower = trigger.lower().strip()
            if trig_lower in query_lower:
                trigger_matched = True
                break
                
            # Word-by-word matching
            trig_words = [w for w in re.findall(r'\w+', trig_lower) if len(w) >= 1]
            matched_words = [w for w in trig_words if w in query_lower]
            if len(matched_words) == len(trig_words) and trig_words:
                trigger_matched = True
                break
                
        # Name matching
        if s["name"].replace("-", " ") in query_lower or s["name"] in query_lower:
            trigger_matched = True
            
        if trigger_matched:
            boost += 0.45
            any_trigger_match = True
            
        s["score"] = cosine_sim + boost
        s["raw_score"] = cosine_sim

    # If it has neither dev keyword overlap nor any trigger match, it is conversational
    if not has_dev_keyword and not any_trigger_match:
        print(json.dumps({"status": "CONVERSATIONAL"}))
        return
        
    max_score = float(np.max([s["score"] for s in skills]))
    if max_score < 0.25:
        print(json.dumps({"status": "CONVERSATIONAL"}))
        return
        
    # Filter candidates with stricter threshold:
    # Must have a trigger match or name match, OR have raw similarity >= 0.50
    candidates = []
    for s in skills:
        has_trigger = s["score"] > s["raw_score"]
        if has_trigger or s["raw_score"] >= 0.50:
            candidates.append(s)
            
    # Filter by exclusions
    # Priority based on score (descending)
    candidates_sorted = sorted(candidates, key=lambda x: x["score"], reverse=True)
    excluded_names = set()
    for c in candidates_sorted:
        if c["name"] in excluded_names:
            continue
        for excl in c["exclusions"]:
            excluded_names.add(excl)
            
    directly_matched = [c["name"] for c in candidates_sorted if c["name"] not in excluded_names]
    
    if not directly_matched:
        print(json.dumps({"status": "CONVERSATIONAL"}))
        return
        
    # Transitively resolve all dependencies to build the full routing set
    final_active_set = set()
    def add_with_dependencies(skill_name):
        if skill_name in final_active_set:
            return
        final_active_set.add(skill_name)
        s_obj = next((s for s in skills if s["name"] == skill_name), None)
        if s_obj:
            for dep in s_obj.get("depends_on", []):
                add_with_dependencies(dep)
                
    for name in directly_matched:
        add_with_dependencies(name)
        
    active_candidates = [s for s in skills if s["name"] in final_active_set]
    
    # Topological sorting (using depends_on/run_last)
    nodes = [c["name"] for c in active_candidates]
    adj = {node: [] for node in nodes}
    in_degree = {node: 0 for node in nodes}
    
    for c in active_candidates:
        u = c["name"]
        # depends_on
        for dep in c["depends_on"]:
            if dep in adj:
                if u not in adj[dep]:
                    adj[dep].append(u)
                    in_degree[u] += 1
        # run_last
        if c["run_last"]:
            for other_c in active_candidates:
                v = other_c["name"]
                if v != u and not other_c["run_last"]:
                    if u not in adj[v]:
                        adj[v].append(u)
                        in_degree[u] += 1
                        
    # Kahn's algorithm
    queue = [node for node in nodes if in_degree[node] == 0]
    queue.sort(key=lambda name: next(c["score"] for c in active_candidates if c["name"] == name), reverse=True)
    
    ordered = []
    while queue:
        queue.sort(key=lambda name: next(c["score"] for c in active_candidates if c["name"] == name), reverse=True)
        curr = queue.pop(0)
        ordered.append(curr)
        for neighbor in adj[curr]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
                
    if len(ordered) < len(nodes):
        # Fallback for cycles
        missing = [n for n in nodes if n not in ordered]
        ordered.extend(missing)
        
    print(json.dumps({
        "status": "MATCHED",
        "path": ordered
    }))

if __name__ == "__main__":
    main()
