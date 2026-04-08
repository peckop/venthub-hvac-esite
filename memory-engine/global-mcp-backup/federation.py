import os
import json
import sqlite3
import numpy as np
import math
from pathlib import Path
from datetime import datetime
from openai import OpenAI

EMBEDDING_MODEL = os.getenv("LLM_EMBEDDING_MODEL", "qwen/qwen3-embedding-8b")

# We use the same scoring logic globally.
def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot_product / (norm1 * norm2))

def calculate_recency_decay(created_at: str, half_life_days: float = 30.0) -> tuple[float, float]:
    try:
        dt = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
        now = datetime.utcnow()
        age_days = (now - dt).total_seconds() / (24 * 3600)
        lam = math.log(2) / half_life_days
        return math.exp(-lam * age_days), age_days
    except Exception:
        return 1.0, 0.0

SOURCE_WEIGHTS = {
    "skill": 1.5,
    "plan": 1.3,
    "doc": 1.1,
    "log": 0.8
}

class MemoryFederation:
    def __init__(self, registry_path: str):
        self.registry_path = Path(registry_path)
        self.registry = self._load_registry()

    def _load_registry(self):
        if not self.registry_path.exists():
             return {"projects": {}, "default_project": None}
        with open(self.registry_path, "r", encoding="utf-8") as f:
             return json.load(f)
             
    def _save_registry(self):
        with open(self.registry_path, "w", encoding="utf-8") as f:
             json.dump(self.registry, f, indent=2)

    def register_project(self, name: str, db_path: str, workspace_root: str, env_file: str):
        self.registry["projects"][name] = {
            "db_path": db_path,
            "workspace_root": workspace_root,
            "env_file": env_file,
            "registered_at": datetime.utcnow().strftime("%Y-%m-%d")
        }
        if not self.registry.get("default_project"):
            self.registry["default_project"] = name
        self._save_registry()
        return f"Project '{name}' registered successfully."

    def list_projects(self) -> dict:
        return self.registry["projects"]

    def _get_project_data(self, name: str):
        return self.registry["projects"].get(name)
        
    def _execute_readonly_query(self, db_path: str, query: str, params=()):
        if not os.path.exists(db_path):
             return []
        conn = sqlite3.connect(f"file:{db_path}?mode=ro", uri=True)
        try:
            cursor = conn.execute(query, params)
            return cursor.fetchall()
        finally:
            conn.close()

    def search(self, query: str, active_project: str, cross_project: bool = False, domain_hint: str = None, open_router_key: str = None) -> list:
        if not open_router_key:
            return []
            
        client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=open_router_key)
        resp = client.embeddings.create(model=EMBEDDING_MODEL, input=query)
        query_embedding = np.array(resp.data[0].embedding, dtype=np.float32)

        results = []
        
        projects_to_search = [active_project]
        if cross_project:
            projects_to_search = list(self.registry["projects"].keys())

        for proj in projects_to_search:
            proj_data = self._get_project_data(proj)
            if not proj_data: continue
            
            db_path = proj_data["db_path"]
            query_sql = "SELECT id, content, source_type, source_path, domain, embedding, created_at, hit_count FROM memory_nodes WHERE is_valid = 1"
            nodes = self._execute_readonly_query(db_path, query_sql)
            
            for node in nodes:
                node_id, content, source_type, source_path, node_domain, embedding_blob, created_at, hit_count = node
                node_embedding = np.frombuffer(embedding_blob, dtype=np.float32)
                
                similarity = cosine_similarity(query_embedding, node_embedding)
                decay_mult, age_days = calculate_recency_decay(created_at)
                weight = SOURCE_WEIGHTS.get(source_type, 1.0)
                
                # Active DB gets full weight, federated gets 0.5 penalty
                proj_multiplier = 1.0 if proj == active_project else 0.5
                
                domain_multiplier = 1.0
                if domain_hint:
                     if node_domain == domain_hint:
                          domain_multiplier = 1.0
                     else:
                          domain_multiplier = 0.3
                
                final_score = similarity * weight * decay_mult * proj_multiplier * domain_multiplier
                
                if final_score > 0.4:
                    results.append({
                        "project": proj,
                        "id": node_id,
                        "score": final_score,
                        "age": age_days,
                        "source": source_type.upper(),
                        "domain": node_domain,
                        "content": content
                    })
                    
        results.sort(key=lambda x: x["score"], reverse=True)
        return results

    def remember(self, active_project: str, content: str, source_type: str, domain: str, open_router_key: str = None) -> int:
        proj_data = self._get_project_data(active_project)
        if not proj_data or not open_router_key:
            return -1
            
        client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=open_router_key)
        resp = client.embeddings.create(model="qwen/qwen3-embedding-8b", input=content)
        embedding = np.array(resp.data[0].embedding, dtype=np.float32)
        blob = embedding.tobytes()
        
        db_path = proj_data["db_path"]
        conn = sqlite3.connect(db_path)
        try:
            cursor = conn.execute(
                "INSERT INTO memory_nodes (content, source_type, source_path, domain, embedding, embedding_model) VALUES (?, ?, ?, ?, ?, ?)",
                (content, source_type, 'mcp_proactive_memory', domain, blob, 'qwen/qwen3-embedding-8b') # using the model defined in user .env.local LLM_EMBEDDING_MODEL
            )
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()
