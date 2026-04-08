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

    def detect_project_by_path(self, cwd: str) -> str:
        """Finds the registered project that completely or partially matches the current working directory."""
        cwd_path = Path(cwd).resolve()
        best_match = None
        best_len = 0
        
        for name, data in self.registry["projects"].items():
            try:
                proj_root = Path(data["workspace_root"]).resolve()
                if cwd_path == proj_root or proj_root in cwd_path.parents:
                    match_len = len(str(proj_root))
                    if match_len > best_len:
                        best_len = match_len
                        best_match = name
            except Exception:
                pass
                
        return best_match

    def list_projects(self) -> dict:
        return self.registry["projects"]

    def _get_project_data(self, name: str):
        return self.registry["projects"].get(name)

    def _ensure_schema(self, db_path: str):
        """Creates memory_nodes table and status/last_accessed_at columns if missing."""
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        conn = sqlite3.connect(db_path)
        try:
            conn.execute("""CREATE TABLE IF NOT EXISTS memory_nodes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                source_type TEXT DEFAULT 'doc',
                source_path TEXT,
                domain TEXT DEFAULT 'general',
                embedding BLOB,
                embedding_model TEXT,
                is_valid INTEGER DEFAULT 1,
                hit_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'active',
                last_accessed_at TIMESTAMP
            )""")
            # Ensure status column exists (for old DBs)
            try:
                conn.execute("SELECT status FROM memory_nodes LIMIT 1")
            except sqlite3.OperationalError:
                conn.execute("ALTER TABLE memory_nodes ADD COLUMN status TEXT DEFAULT 'active'")
                conn.execute("ALTER TABLE memory_nodes ADD COLUMN last_accessed_at TIMESTAMP")
                conn.execute("UPDATE memory_nodes SET status = CASE WHEN is_valid = 1 THEN 'active' ELSE 'archived' END")
            conn.commit()
        finally:
            conn.close()

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
            query_sql = "SELECT id, content, source_type, source_path, domain, embedding, created_at, hit_count FROM memory_nodes WHERE status = 'active'"
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
        self._ensure_schema(db_path)
        conn = sqlite3.connect(db_path)
        try:
            cursor = conn.execute(
                "INSERT INTO memory_nodes (content, source_type, source_path, domain, embedding, embedding_model, status, is_valid) VALUES (?, ?, ?, ?, ?, ?, 'active', 1)",
                (content, source_type, 'mcp_proactive_memory', domain, blob, 'qwen/qwen3-embedding-8b')
            )
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()

    def cluster_memories(self, active_project: str, max_clusters: int, open_router_key: str = None) -> str:
        """Finds highly similar active nodes and consolidates them into a macro-memory."""
        if not open_router_key: return "API Key gerekli."
        proj_data = self._get_project_data(active_project)
        if not proj_data: return "Proje bulunamadı."
        
        db_path = proj_data["db_path"]
        self._ensure_schema(db_path)
        conn = sqlite3.connect(db_path)
        try:
            # Get all active nodes
            cursor = conn.execute("SELECT id, content, embedding FROM memory_nodes WHERE status = 'active'")
            nodes = cursor.fetchall()
            
            client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=open_router_key)
            consolidated_count = 0
            processed = set()
            
            for i, n1 in enumerate(nodes):
                if n1[0] in processed: continue
                emb1 = np.frombuffer(n1[2], dtype=np.float32)
                
                cluster_nodes = [n1]
                for j, n2 in enumerate(nodes[i+1:]):
                    if n2[0] in processed: continue
                    emb2 = np.frombuffer(n2[2], dtype=np.float32)
                    sim = cosine_similarity(emb1, emb2)
                    
                    if sim > 0.92: # Extremely similar logic
                        cluster_nodes.append(n2)
                        processed.add(n2[0])
                        
                if len(cluster_nodes) > 1:
                    processed.add(n1[0])
                    # LLM consolidation
                    contents = "\n- ".join([n[1] for n in cluster_nodes])
                    prompt = f"Aşağıdaki bilgileri tek bir net mühendislik belleği (macro-memory) olarak birleştir. Orijinal gürültüyü at, yazılım gerçeklerini ve bağlamı koru:\n- {contents}"
                    try:
                        resp = client.chat.completions.create(
                            model="google/gemini-2.5-flash",
                            messages=[{"role": "user", "content": prompt}],
                            temperature=0.1
                        )
                        macro_content = resp.choices[0].message.content.strip()
                        
                        # Generate new embedding
                        emb_resp = client.embeddings.create(model=EMBEDDING_MODEL, input=macro_content)
                        new_embedding = np.array(emb_resp.data[0].embedding, dtype=np.float32).tobytes()
                        
                        # Archive old nodes
                        for n in cluster_nodes:
                            conn.execute("UPDATE memory_nodes SET status = 'archived', is_valid = 0 WHERE id = ?", (n[0],))
                            
                        # Insert MACRO node
                        conn.execute("INSERT INTO memory_nodes (content, source_type, source_path, domain, embedding, embedding_model, status, is_valid, hit_count) VALUES (?, ?, ?, ?, ?, ?, 'active', 1, ?)", 
                                     (f"[MACRO] {macro_content}", "plan", "memory_cluster.py", "general", new_embedding, EMBEDDING_MODEL, len(cluster_nodes)))
                        
                        consolidated_count += 1
                        if max_clusters and consolidated_count >= max_clusters:
                            break
                    except Exception as e:
                        print("Clustering error:", e)
                        
            conn.commit()
            return f"{consolidated_count} adet MACRO-MEMORY (Konsolidasyon bloğu) başarıyla üretildi. Benzer eski türevler arşivlendi."
        finally:
            conn.close()

    def reindex_memories(self, active_project: str) -> str:
        """Physically deletes archived nodes and runs VACUUM."""
        proj_data = self._get_project_data(active_project)
        if not proj_data: return "Proje bulunamadı."
        
        db_path = proj_data["db_path"]
        conn = sqlite3.connect(db_path, isolation_level=None)
        try:
            cursor = conn.execute("DELETE FROM memory_nodes WHERE status = 'archived' OR is_valid = 0")
            deleted_count = cursor.rowcount
            conn.execute("VACUUM")
            return f"Re-indexing tamamlandı. {deleted_count} adet silinmiş/arşivlenmiş kayıt Vektör DB üzerinden %100 temizlendi (VACUUM çalıştırıldı)."
        finally:
            conn.close()
