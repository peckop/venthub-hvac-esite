import os
import sys
from pathlib import Path
from mcp.server.fastmcp import FastMCP
from federation import MemoryFederation
from dotenv import load_dotenv

# Initialize MCP 
mcp = FastMCP("corpus-callosum")

# Setup federation
_global_dir = Path(__file__).parent.absolute()
registry_path = _global_dir / "data" / "registry.json"
federated_engine = MemoryFederation(str(registry_path))

# Session-scoped project (set by agent via cc_set_project)
_session_project = None

# Helper to get active project and API key
def get_context():
    # 1. Session-level (agent told us which project)
    active_project = _session_project
    
    # 2. Environment variable (static config fallback)
    if not active_project:
        active_project = os.environ.get("CC_ACTIVE_PROJECT")
    
    # 3. Workspace Auto-Detection (best-effort)
    if not active_project:
        cwd = os.getcwd()
        active_project = federated_engine.detect_project_by_path(cwd)
        
    # 4. Ultimate fallback
    if not active_project:
        active_project = "venthub"
    
    # Load project's API key from its .env file
    proj_data = federated_engine._get_project_data(active_project)
    if proj_data and os.path.exists(proj_data["env_file"]):
        load_dotenv(proj_data["env_file"], override=True)
        
    open_router_key = os.environ.get("OPENROUTER_API_KEY")
    if open_router_key:
        open_router_key = open_router_key.strip()
    return active_project, open_router_key


from mastar_validator import validate, resolve_conflict
from query_intent import detect_query_intent

@mcp.tool()
def cc_search(query: str, cross_project: bool = False, domain_hint: str = None, intent_filter: str = None) -> str:
    """Hafizadan ilgili bilgileri getirir. (Retrieves relevant memories).
    
    Args:
        query: Aranacak bilgi veya soru.
        cross_project: Diger projelerin hafizasini da taramak icin True yapin.
        domain_hint: Sonuclari filtrelemek/bastirmak icin: database, frontend, planning, skill, general
        intent_filter: N1_NE, N2_NEDEN, vb. manuel katman firtresi. Verilmezse otomatik tespit edilir.
    """
    active_project, api_key = get_context()
    if not api_key:
         return "Error: OPENROUTER_API_KEY not found."
         
    # Query intent detection
    if not intent_filter:
         detected_intent = detect_query_intent(query)
         if detected_intent:
              intent_filter = detected_intent
              print(f"[{active_project}] Query Intent Detected: {detected_intent}")
         
    results = federated_engine.search(
        query=query,
        active_project=active_project,
        cross_project=cross_project,
        domain_hint=domain_hint,
        intent_filter=intent_filter,
        open_router_key=api_key
    )
    
    if not results:
         return "Hiçbir sonuç bulunamadı."
         
    # Format the results
    output_lines = ["--- FEDERATED MEMORY CONTEXT ---"]
    if intent_filter:
         output_lines.append(f"Filtre: [{intent_filter}]")
         
    # To avoid repeating related nodes, keep track of processed IDs
    processed_related = set()
    
    for idx, r in enumerate(results[:20]):
        age_str = f"{r['age']:.1f}d"
        source_tag = f"{r['source']}:{r['domain']}"
        proj_tag = f"[{r['project'].upper()}]" if cross_project else ""
        intent_tag = f"[{r.get('intent_layer', 'UNKNOWN')}]"
        
        block = f"{proj_tag}[{source_tag}/{age_str} | score:{r['score']:.2f}] {intent_tag} {r['content'].strip()}"
        output_lines.append(block)
        
        # Micro-GraphRAG: Fetch related nodes
        raw_related_ids = r.get("raw_related_ids", [])
        if raw_related_ids:
            unprocessed_ids = [id for id in raw_related_ids if id not in processed_related]
            if unprocessed_ids:
                related_nodes = federated_engine.get_related_nodes(r["db_path"], unprocessed_ids)
                for rel_node in related_nodes:
                    rel_id, rel_content, rel_intent = rel_node
                    processed_related.add(rel_id)
                    output_lines.append(f"  └─[BAĞLANTILI - {rel_intent}]: {rel_content.strip()}")
        
    output_lines.append("---")
    return "\n".join(output_lines)


@mcp.tool()
def cc_remember(content: str, intent_layer: str, source_type: str = "doc", domain: str = "general", related_to: list[int] = None) -> str:
    """Yeni bir bilgiyi aktif projenin hafızasına kaydeder. (Saves a new memory).
    
    Args:
        content: Kaydedilecek bilgi metni.
        intent_layer: ZORUNLU. 5N1K Katman (Örn: N1_NE, N2_NEDEN, vb.)
        source_type: doc, plan, skill, log.
        domain: database, frontend, planning, skill, general.
        related_to: Micro-GraphRAG için ilişkili node ID'leri.
    """
    active_project, api_key = get_context()
    if not api_key:
         return "Error: OPENROUTER_API_KEY not found."
         
    # 1. Mastar-Kalıp Doğrulaması
    validation_res = validate(content, intent_layer)
    if not validation_res.valid:
         return f"Error 400 (Bad Request): {validation_res.message}"
         
    # 2. Conflict Resolver
    conflict_res = resolve_conflict(content, intent_layer)
    warning_msg = ""
    if conflict_res.warning:
         warning_msg = f"\n{conflict_res.warning}"
         
    node_id = federated_engine.remember(
         active_project=active_project,
         content=content,
         source_type=source_type,
         domain=domain,
         intent_layer=intent_layer,
         related_to=related_to,
         open_router_key=api_key
    )
    
    if node_id != -1:
         return f"Başarıyla kaydedildi. Node ID: {node_id} (Project: {active_project}, Domain: {domain}){warning_msg}"
    return "Hata: Kayıt işlemi başarısız oldu."


@mcp.tool()
def cc_list_projects() -> str:
    """Kayutlu tüm projeleri listeler. (Lists all registered projects in the federation)."""
    projects = federated_engine.list_projects()
    if not projects:
         return "Sistemde kayıtlı proje yok."
    
    lines = ["--- REGISTERED PROJECTS ---"]
    for name, data in projects.items():
         lines.append(f"- {name} (Kayıt: {data.get('registered_at', 'N/A')})")
    
    return "\n".join(lines)


@mcp.tool()
def cc_register(project_name: str, db_path: str, workspace_root: str, env_file: str) -> str:
    """Yeni bir projeyi federasyona dahil eder. (Registers a new project)."""
    return federated_engine.register_project(project_name, db_path, workspace_root, env_file)

@mcp.tool()
def cc_cluster_memories(max_clusters: int = 5) -> str:
    """Motor belleğini sıkıştırır. (Deduplicates memories and merges them)."""
    active_project, api_key = get_context()
    if not api_key:
         return "Error: OPENROUTER_API_KEY not found."
    return federated_engine.cluster_memories(active_project, max_clusters, api_key)

@mcp.tool()
def cc_reindex() -> str:
    """Bozuk veya arşive (is_valid=0) alınmış node'ları kalıcı siler."""
    active_project, _ = get_context()
    return federated_engine.reindex_memories(active_project)

@mcp.tool()
def cc_set_project(project_name: str) -> str:
    """Aktif projeyi ayarlar. Oturum basinda bir kez cagirin. (Sets the active project for this session).
    
    Args:
        project_name: Registry'de kayitli proje adi (ornegin: venthub, qvalidator).
    """
    global _session_project
    proj_data = federated_engine._get_project_data(project_name)
    if not proj_data:
        available = ", ".join(federated_engine.list_projects().keys())
        return f"Hata: '{project_name}' registry'de bulunamadi. Kayitli projeler: {available}"
    _session_project = project_name
    return f"Aktif proje '{project_name}' olarak ayarlandi. Tum cc_* islemleri bu projeye yonlendirilecek."

if __name__ == "__main__":
    mcp.run(transport="stdio")
