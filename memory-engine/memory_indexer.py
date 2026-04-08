import os
import json
import argparse
from pathlib import Path
# FIX #1: ProcessPoolExecutor -> ThreadPoolExecutor
# SQLite bağlantısı (self.db.conn) işlemler (processes) arasında Pickle edilemez.
# ThreadPoolExecutor GIL nedeniyle CPU-bound işlerde yavaş olsa da buradaki
# darboğaz CPU değil, I/O (disk okuma) ve Ağ (API çağrısı) işlemleridir.
# Bu nedenle ThreadPoolExecutor doğru ve güvenli seçimdir.
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from openai import OpenAI
import numpy as np

from sqlite_vector_store import SQLiteVectorStore
from memory_cluster import MemoryClusterer

# .env.local dosyası memory-engine klasörünün yanında veya workspace root'ta olabilir
_engine_dir = Path(__file__).parent.absolute()
load_dotenv(_engine_dir / ".env.local")
# Workspace root fallback (.env.local)
_workspace_root = _engine_dir.parent
load_dotenv(_workspace_root / ".env.local")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
EMBEDDING_MODEL = "qwen3-embedding-8b"
LLM_MODEL = "google/gemini-2.5-flash"

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)


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


def extract_narrative(text: str) -> str:
    """Log dosyalarından ham gürültüyü temizleyip mimari kararları çıkarır."""
    system_prompt = (
        "Extract bullet points of hard architectural decisions, completed tasks, "
        "and rigid facts from this log. Discard pleasantries and noise."
    )
    try:
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text[:15000]},
            ],
            temperature=0.0,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Narrative Extraction Error: {e}")
        return text[:1000]  # Fallback: ilk 1000 karakter


def determine_source_type(file_path: Path) -> str:
    path_str = str(file_path).lower()
    if "skill.md" in path_str:
        return "skill"
    if "registry" in path_str and path_str.endswith(".md"):
        return "plan"
    if "logs" in path_str and path_str.endswith("overview.txt"):
        return "log"
    return "doc"


def determine_domain(file_path: Path) -> str:
    path_str = str(file_path).lower()
    
    if any(k in path_str for k in ["supabase", "rls", "migration", "database", "schema"]):
        return "database"
    if any(k in path_str for k in ["component", "ui", "tailwind", "css", "views"]):
        return "frontend"
    if any(k in path_str for k in ["registry", "task", "plan", "workflow"]):
        return "planning"
    if "skill" in path_str:
        return "skill"
        
    return "general"


class MemoryIndexer:
    def __init__(self, workspace_root: str):
        self.workspace_root = Path(workspace_root)
        self.db = SQLiteVectorStore()
        self.clusterer = MemoryClusterer(self.db)

        engine_dir = Path(__file__).parent.absolute()
        self.hash_path = engine_dir / "data" / "memory_hashes.json"
        self.hash_path.parent.mkdir(parents=True, exist_ok=True)
        self.hashes = self._load_hashes()

    def _load_hashes(self) -> dict:
        if self.hash_path.exists():
            with open(self.hash_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def _save_hashes(self):
        with open(self.hash_path, "w", encoding="utf-8") as f:
            json.dump(self.hashes, f, indent=2)

    def process_file(self, file_path: Path) -> dict:
        """Tek bir dosyayı işler: hash kontrolü, embedding üretimi, depolama."""
        try:
            mtime = os.path.getmtime(file_path)
            str_path = str(file_path)

            # Delta Check: değişmemişse atla
            if str_path in self.hashes and self.hashes[str_path] == mtime:
                return {"status": "skipped", "path": str_path}

            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()

            source_type = determine_source_type(file_path)
            domain = determine_domain(file_path)

            # Gürültü filtresi: çok kısa dosyaları atla
            if len(content) < 80:
                self.hashes[str_path] = mtime
                return {"status": "skipped_too_short"}

            # Log dosyaları için Narrative Extraction
            if source_type == "log":
                content = extract_narrative(content)

            # Vektör üret
            embedding = generate_embedding(content)

            # Kümeleme ve tekrar önleme
            cluster_result = self.clusterer.validate_and_deduplicate(content, embedding)

            if cluster_result["action"] == "add":
                node_id = self.db.add_node(
                    content=cluster_result["final_content"],
                    source_type=source_type,
                    source_path=str_path,
                    embedding=embedding,
                    model=EMBEDDING_MODEL,
                    domain=domain
                )
                print(f"[Added] Node {node_id} <- {file_path.name} ({source_type} | {domain})")

            elif cluster_result["action"] == "update":
                update_id = cluster_result["update_id"]
                self.db.soft_delete_node(update_id)
                self.db.add_node(
                    content=cluster_result["final_content"],
                    source_type=source_type,
                    source_path=str_path,
                    embedding=embedding,
                    model=EMBEDDING_MODEL,
                    domain=domain
                )
                print(f"[Consolidated] Node {update_id} -> new node <- {file_path.name} ({domain})")

            elif cluster_result["action"] == "skip":
                # FIX #3: LLM çöktüyse metin/vektör desenkronizasyonunu önlemek için
                # mevcut node'a dokunmuyoruz. Bu dosya bir sonraki delta'da tekrar denenecek.
                print(f"[Skip/LLM-Error] {file_path.name} — node unchanged to avoid desync.")
                return {"status": "skipped_llm_error", "path": str_path}

            self.hashes[str_path] = mtime
            return {"status": "success", "path": str_path}

        except Exception as e:
            print(f"[Error] {file_path}: {e}")
            self.db.queue_pending("FAIL_DURING_PROCESS", "unknown", str(file_path))
            return {"status": "error", "path": str(file_path), "error": str(e)}

    def bootstrap(self):
        """İlk kez çalıştırıldığında tüm kayıt, skill ve log dosyalarını hafızaya alır."""
        targets = []

        skill_dir = self.workspace_root / ".agent" / "skills"
        if skill_dir.exists():
            targets.extend(list(skill_dir.rglob("SKILL.md")))

        reg_dir = self.workspace_root / "registry"
        if reg_dir.exists():
            targets.extend(list(reg_dir.rglob("*.md")))

        brain_dir = self.workspace_root / ".gemini" / "antigravity" / "brain"
        if brain_dir.exists():
            targets.extend(list(brain_dir.rglob("overview.txt")))

        print(f"Bootstrapping {len(targets)} files...")

        # FIX #1: ThreadPoolExecutor — SQLite bağlantısı aynı süreçte thread'ler arası güvenli
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = {executor.submit(self.process_file, p): p for p in targets}
            for future in as_completed(futures):
                future.result()  # Exception'ları yüzeye çıkar

        self._save_hashes()
        self.db.close()
        print("Bootstrap completed.")

    # FIX #2: --file argümanı ile delta indexleme (manage_registry kancası için)
    def index_single_file(self, file_path: str):
        """
        manage_registry.py'nin `complete` kancası tarafından çağrılır.
        Tek bir dosyayı vektör hafızasına ekler/günceller.
        """
        path = Path(file_path)
        if not path.exists():
            print(f"[Error] File not found: {file_path}")
            return
        result = self.process_file(path)
        print(f"[Delta Index] {result['status']} — {path.name}")
        self._save_hashes()
        self.db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TeleMem Pro Max — Memory Indexer")
    parser.add_argument("--bootstrap", action="store_true",
                        help="Tüm registry/skill/log dosyalarını sıfırdan indexle.")
    # FIX #2: Yeni --file argümanı — kancadan gelen tek dosyayı işler
    parser.add_argument("--file", type=str, default=None,
                        help="Tek bir dosyayı delta olarak indexle (manage_registry kancası).")
    parser.add_argument("--workspace", default=str(Path(__file__).parent.parent),
                        help="Projenin kök dizini (varsayılan: memory-engine'nin üst klasörü)")
    args = parser.parse_args()

    indexer = MemoryIndexer(args.workspace)

    if args.bootstrap:
        indexer.bootstrap()
    elif args.file:
        # FIX #2: Kancadan gelen dosyayı delta olarak işle
        indexer.index_single_file(args.file)
    else:
        print("Kullanım: --bootstrap (tam tarama) veya --file <yol> (delta)")
