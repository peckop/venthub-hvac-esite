import sqlite3
from pathlib import Path
from federation import MemoryFederation
from mastar_validator import MASTAR_REGISTRY, resolve_conflict
import os

def determine_intent_layer(domain: str, source_type: str, content: str) -> str:
    content_lower = content.lower()
    
    # helper for checking mastar
    def has_mastar(layer):
        mastar = MASTAR_REGISTRY[layer]
        return any(kw.lower() in content_lower for kw in mastar["zorunlu_herhangi_biri"])
        
    if domain == "database":
        if has_mastar("N2_NEDEN"):
            return "N2_NEDEN"
        return "N1_NE"
        
    if domain == "planning" and source_type == "plan":
        return "N3_NASIL"
        
    if domain == "skill" and source_type == "skill":
        return "N3_NASIL"
        
    if domain == "frontend":
        return "N1_NE"
        
    if domain == "general":
        # Mastar taramasi -> eslesen katman
        scores = {}
        for layer_name, mastar in MASTAR_REGISTRY.items():
            hits = sum(
                1 for kw in mastar["zorunlu_herhangi_biri"]
                if kw.lower() in content_lower
            )
            scores[layer_name] = hits
            
        best_layer = max(scores, key=scores.get) if scores else None
        if best_layer and scores[best_layer] > 0:
             return best_layer
        return "N1_NE"
        
    # Default fallback
    return "N1_NE"

def run_migration():
    registry_path = Path(__file__).parent.absolute() / "data" / "registry.json"
    fed = MemoryFederation(str(registry_path))
    
    projects = fed.list_projects()
    if not projects:
        print("No projects registered. Migration skipped.")
        return
        
    total_migrated = 0
    
    for name, data in projects.items():
        db_path = data["db_path"]
        if not os.path.exists(db_path):
            continue
            
        # Ensure schema first
        fed._ensure_schema(db_path)
            
        conn = sqlite3.connect(db_path)
        try:
            cursor = conn.execute("SELECT id, domain, source_type, content, intent_layer FROM memory_nodes WHERE status = 'active' OR status = 'archived'")
            nodes = cursor.fetchall()
            
            updates = []
            for node_id, domain, source_type, content, current_intent in nodes:
                if not current_intent:
                    new_intent = determine_intent_layer(domain, source_type, content)
                    updates.append((new_intent, node_id))
                    
            if updates:
                conn.executemany("UPDATE memory_nodes SET intent_layer = ? WHERE id = ?", updates)
                conn.commit()
                print(f"[{name}] Migrated {len(updates)} nodes.")
                total_migrated += len(updates)
            else:
                print(f"[{name}] Already up to date.")
                
        except Exception as e:
            print(f"[{name}] Error during migration: {e}")
        finally:
            conn.close()
            
    print(f"Migration completed. Total nodes labeled: {total_migrated}")

if __name__ == "__main__":
    run_migration()
