import numpy as np
import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from sqlite_vector_store import SQLiteVectorStore

# Load environment variables
load_dotenv(".env.local")

# We will use Gemini Flash or generic LLM for the summarization tasks via OpenRouter
# since OpenRouter API key is available and used for embeddings.
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
# Defaulting to an efficient/flash model for memory deduplication
LLM_MODEL = "google/gemini-2.5-flash" 

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Calculates cosine similarity between two vectors."""
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(dot_product / (norm1 * norm2))

class MemoryClusterer:
    def __init__(self, db: SQLiteVectorStore, threshold: float = 0.95):
        self.db = db
        self.threshold = threshold

    def _call_llm_consolidation(self, existing_summary: str, new_information: str) -> str:
        """Uses LLM to consolidate memories if they are extremely similar."""
        system_prompt = "You are an expert memory consolidation assistant. You must merge existing architectural facts with new facts. Keep only what is true and relevant. Output ONLY the consolidated factual string, nothing else."
        user_prompt = f"Existing Memory: {existing_summary}\n\nNew Information: {new_information}\n\nConsolidate into a single concise memory:"
        
        try:
            response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.1
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"LLM Consolidation Error: {e}")
            # FIX #3: None döndür—çağıran taraf 'skip' action'a dönüştüreceği için
            # metin/vektör desenkronizasyonu engellenir.
            return None

    def validate_and_deduplicate(self, new_content: str, new_embedding: np.ndarray) -> dict:
        """
        Yeni vektörü mevcut hafıza vektörleriyle karşılaştırır.
        Benzerlik >= 0.95 ise LLM ile konsolidasyon dener.
        Döndürülen dict:
          { "action": "add" | "update" | "skip", "update_id": int|None, "final_content": str }
        FIX #3: LLM çökerse 'skip' döndürülür.
        Böylece mevcut node'a dokunulmaz; metin/vektör desenkronizasyonu engellenir.
        """
        existing_nodes = self.db.get_all_valid_nodes()

        for node in existing_nodes:
            # unpacking new schema: id, content, source_type, source_path, domain, embedding
            node_id = node[0]
            existing_content = node[1]
            existing_emb_blob = node[5]

            existing_embedding = self.db.deserialize_embedding(existing_emb_blob)
            sim = cosine_similarity(new_embedding, existing_embedding)

            if sim >= self.threshold:
                print(f"[Cluster] Similarity {sim:.3f} >= threshold. Consolidating Node {node_id}...")
                consolidated_content = self._call_llm_consolidation(existing_content, new_content)

                # FIX #3: LLM çöktüyse None döner — desync'i önlemek için 'skip' yap
                if consolidated_content is None:
                    print(f"[Cluster] LLM failed for Node {node_id} — skipping to prevent desync.")
                    return {"action": "skip", "update_id": node_id, "final_content": ""}

                return {
                    "action": "update",
                    "update_id": node_id,
                    "final_content": consolidated_content,
                }

        return {"action": "add", "update_id": None, "final_content": new_content}
