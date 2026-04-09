import os
import re
import json
import sqlite3
import hashlib
import argparse
from pathlib import Path

# Antigravity paths
BRAIN_DIR = Path(os.getenv("ANTIGRAVITY_BRAIN_DIR", r"C:\Users\alize\.gemini\antigravity\brain"))
REGISTRY_PATH = Path(r"C:\Users\alize\.gemini\antigravity\memory-engine\data\registry.json")

import sys
sys.path.append(os.path.dirname(__file__))
try:
    from federation import MemoryFederation
except ImportError:
    MemoryFederation = None

def get_project_for_session(session_id):
    """Bulunulan session'ın projesini meta dosyadan okur."""
    meta_path = BRAIN_DIR / session_id / ".session_meta.json"
    if meta_path.exists():
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
                return meta.get("project")
        except Exception:
            pass
    return None

def extract_checkpoints(overview_path):
    """overview.txt içinden {{ CHECKPOINT N }} bloklarını ve içindeki User Objective/Summary parçalarını çeker."""
    if not overview_path.exists():
        return []
        
    checkpoints = []
    with open(overview_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
        
    # Önceki kısımları böler, her "{{ CHECKPOINT" stringinde
    parts = re.split(r'\{\{\s*CHECKPOINT\s+\d+\s*\}\}', content)
    
    # parts[0] checkpoint öncesidir. Eğer len == 1 ise checkpoint yoktur.
    if len(parts) <= 1:
        return []
        
    # İlk eleman dışındakilerin her biri bir checkpointin içeriğidir
    # Fakat sadece önemli kısımları (mesela User Objective, Previous Session Summary) almak isteyebiliriz.
    for i, part in enumerate(parts[1:]):
        # Her part'ın çok uzun olma ihtimaline karşı başlıkları yakalayalım.
        # Checkpoint bloku bittikten sonra "The earlier parts of this conversation" başlar
        # Bazen çok uzundur, o yüzden ilk 2000 karakteri veya genel özeti almak yeterli olabilir.
        part = part.strip()
        # Maks 4000 karakter alalım ki token patlamasın.
        text_chunk = part[:4000]
        checkpoints.append({
            "idx": i + 1,
            "text": text_chunk
        })
        
    return checkpoints

def mirror_checkpoints(session_id):
    if not MemoryFederation:
        print("[MIRROR] Error: federation modülü bulunamadı.")
        return
        
    overview_path = BRAIN_DIR / session_id / ".system_generated" / "logs" / "overview.txt"
    if not overview_path.exists():
        print(f"[MIRROR] Graceful exit: overview.txt bulunamadı -> {overview_path}")
        return
        
    project_name = get_project_for_session(session_id)
    if not project_name:
        print(f"[MIRROR] Warning: Bu session için proje tespit edilemedi (.session_meta.json yok). İşlem atlanıyor.")
        return
        
    checkpoints = extract_checkpoints(overview_path)
    if not checkpoints:
        print("[MIRROR] Checkpoint bulunamadı. Graceful exit.")
        return
        
    fed = MemoryFederation(REGISTRY_PATH)
    proj_data = fed.registry.get("projects", {}).get(project_name)
    if not proj_data:
        print(f"[MIRROR] Error: Proje '{project_name}' registry içinde kayıtlı değil.")
        return
        
    db_path = proj_data.get("db_path")
    if not db_path or not os.path.exists(db_path):
        print(f"[MIRROR] Error: Database bulunamadı ({db_path})")
        return

    # Checkpoint'in aynen DB'ye bir daha yazılmasını engellemek için MD5 kullan:
    try:
        # Önceden yazılmış node'ların hash bilgisi içerikte tutulmuyor ama content üzerinden hash
        # hesaplayıp filter edemeyiz çünkü doğrudan metin eşleşmesi yapabiliriz.
        rows = fed._execute_readonly_query(db_path, "SELECT content FROM memory_nodes WHERE domain = 'session_shadow'")
        existing_contents = set([r[0] for r in rows if r[0]])
        
        OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY")
        if not OPENROUTER_KEY:
            print("[MIRROR] Error: OPENROUTER_API_KEY eksik, cc_remember embeddings oluşturamaz.")
            return

        added_count = 0
        for cp in checkpoints:
            cp_text = f"[MIRROR-CHECKPOINT-{cp['idx']}] Session: {session_id}\n{cp['text']}"
            
            # Simple content hash to avoid duplication
            cp_hash = hashlib.md5(cp_text.encode('utf-8')).hexdigest()
            content_with_hash = f"{cp_text}\n#HASH:{cp_hash}"
            
            # DB'de var mıydı (eski yazdıklarımız formatından)?
            is_dupe = any(cp_hash in ext_c for ext_c in existing_contents)
            
            if not is_dupe:
                print(f"[MIRROR] Checkpoint {cp['idx']} Gölgelere (session_shadow) yazılıyor...")
                # intent_layer için N1_NE verilebilir geçici olarak
                node_id = fed.remember(
                    active_project=project_name,
                    content=content_with_hash,
                    source_type="log",
                    domain="session_shadow",
                    intent_layer="N1_NE",
                    open_router_key=OPENROUTER_KEY
                )
                if node_id != -1:
                    added_count += 1
            else:
                print(f"[MIRROR] Checkpoint {cp['idx']} zaten DB'de var, atlanıyor.")
                
        print(f"[MIRROR] İşlem tamam. {added_count} yeni checkpoint aynalandı.")
    except Exception as e:
        print(f"[MIRROR] Exception: {e}")

def main():
    parser = argparse.ArgumentParser(description="Session Shadow Memory CLI - Katman 3 (Ayna)")
    parser.add_argument("--session-id", required=True, help="Belirli bir session ID")
    
    args = parser.parse_args()
    mirror_checkpoints(args.session_id)

if __name__ == "__main__":
    main()
