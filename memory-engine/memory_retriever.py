import os
import argparse
import numpy as np
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
from pathlib import Path
import math
from sqlite_vector_store import SQLiteVectorStore

# .env.local dosyası memory-engine klasörünün yanında veya workspace root'ta olabilir
_engine_dir = Path(__file__).parent.absolute()
load_dotenv(_engine_dir / ".env.local")
# Workspace root fallback (.env.local)
_workspace_root = _engine_dir.parent
load_dotenv(_workspace_root / ".env.local")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
EMBEDDING_MODEL = os.getenv("LLM_EMBEDDING_MODEL", "qwen/qwen3-embedding-8b")
MAX_CONTEXT_TOKENS = 2000  # hard-limit for context injection (~8000 chars)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

SOURCE_WEIGHTS = {
    "skill": 1.5,
    "plan": 1.3,
    "doc": 1.1,
    "log": 0.8
}

def generate_embedding(text: str) -> np.ndarray:
    try:
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return np.array(response.data[0].embedding, dtype=np.float32)
    except Exception as e:
        print(f"Embedding Generation Error: {e}")
        return np.zeros(1024, dtype=np.float32)

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot_product / (norm1 * norm2))

def calculate_recency_decay(created_at: str, half_life_days: float = 30.0) -> tuple[float, float]:
    """
    Computes an exponential decay multiplier based on the age of the node.
    Returns: (decay_multiplier, age_in_days)
    """
    try:
        # SQLite returns 'YYYY-MM-DD HH:MM:SS'
        dt = datetime.strptime(created_at, "%Y-%m-%d %H:%M:%S")
        now = datetime.utcnow()
        age_days = (now - dt).total_seconds() / (24 * 3600)
        
        # λ = ln(2) / half_life
        lam = math.log(2) / half_life_days
        multiplier = math.exp(-lam * age_days)
        return multiplier, age_days
    except Exception:
        return 1.0, 0.0

class MemoryRetriever:
    def __init__(self):
        self.db = SQLiteVectorStore()

    def search(self, query: str, limit_results: int = 20, domain_hint: str = None) -> str:
        query_embedding = generate_embedding(query)
        nodes = self.db.get_all_valid_nodes()
        
        scored_nodes = []
        for node in nodes:
            # unpacking updated schema
            node_id, content, source_type, source_path, node_domain, embedding_blob, created_at, hit_count = node
            
            node_embedding = self.db.deserialize_embedding(embedding_blob)
            similarity = cosine_similarity(query_embedding, node_embedding)
            
            # Recency Decay Opus logic
            decay_mult, age_days = calculate_recency_decay(created_at)
            
            # Source Authority weight
            weight = SOURCE_WEIGHTS.get(source_type, 1.0)
            
            # Domain Inhibition
            domain_multiplier = 1.0
            if domain_hint:
                if node_domain == domain_hint:
                    domain_multiplier = 1.0
                else:
                    domain_multiplier = 0.3 # Active inhibition
            
            # Physics-based scoring
            final_score = similarity * weight * decay_mult * domain_multiplier
            
            if final_score > 0.4: # Baseline noise cutoff
                scored_nodes.append({
                    "id": node_id,
                    "score": final_score,
                    "similarity": similarity,
                    "age": age_days,
                    "source": source_type.upper(),
                    "domain": node_domain,
                    "content": content
                })
                
        # Sort by highest final score
        scored_nodes.sort(key=lambda x: x["score"], reverse=True)
        
        # Distill output within Budget and Structured Array
        total_chars = 0
        char_limit = MAX_CONTEXT_TOKENS * 4 # rough approx
        
        output_lines = ["--- MEMORY CONTEXT ---"]
        
        for n in scored_nodes:
            self.db.increment_hit_count(n["id"]) # Log hit
            
            # Opus / Sonnet Structured Format
            # [PLAN:frontend/2.3d | score:0.91] SQLite WAL mode tercih edildi.
            age_str = f"{n['age']:.1f}d"
            block = f"[{n['source']}:{n['domain']}/{age_str} | score:{n['score']:.2f}] {n['content'].strip()}"
            
            if total_chars + len(block) > char_limit:
                output_lines.append("[!] Token budget reached. Context truncated.")
                break
                
            output_lines.append(block)
            total_chars += len(block)
            
            # Limit array size manually just in case
            if len(output_lines) - 1 >= limit_results:
                break
                
        output_lines.append("---")
        return "\n".join(output_lines)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Memory Retriever Query Command")
    parser.add_argument("query", type=str, help="Question or context required")
    parser.add_argument("--domain", type=str, help="Domain hint to filter/inhibit results", default=None)
    args = parser.parse_args()

    retriever = MemoryRetriever()
    print(retriever.search(args.query, domain_hint=args.domain))
