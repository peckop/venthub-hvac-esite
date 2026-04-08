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

# Helper to get active project and API key
def get_context():
    active_project = os.environ.get("TELEMEM_ACTIVE_PROJECT", "venthub")
    
    # Priority: Always use the project's .env.local via registry
    proj_data = federated_engine._get_project_data(active_project)
    if proj_data and os.path.exists(proj_data["env_file"]):
        load_dotenv(proj_data["env_file"], override=True)
        
    open_router_key = os.environ.get("OPENROUTER_API_KEY")
    if open_router_key:
        open_router_key = open_router_key.strip()
    return active_project, open_router_key


@mcp.tool()
def telemem_search(query: str, cross_project: bool = False, domain_hint: str = None) -> str:
    """Hafizadan ilgili bilgileri getirir. (Retrieves relevant memories).
    
    Args:
        query: Aranacak bilgi veya soru.
        cross_project: Diger projelerin hafizasini da taramak icin True yapin.
        domain_hint: Sonuclari filtrelemek/bastirmak icin: database, frontend, planning, skill, general
    """
    active_project, api_key = get_context()
    if not api_key:
         return "Error: OPENROUTER_API_KEY not found."
         
    results = federated_engine.search(
        query=query,
        active_project=active_project,
        cross_project=cross_project,
        domain_hint=domain_hint,
        open_router_key=api_key
    )
    
    if not results:
         return "Hiçbir sonuç bulunamadı."
         
    # Format the results
    output_lines = ["--- FEDERATED MEMORY CONTEXT ---"]
    for idx, r in enumerate(results[:20]):
        age_str = f"{r['age']:.1f}d"
        source_tag = f"{r['source']}:{r['domain']}"
        proj_tag = f"[{r['project'].upper()}]" if cross_project else ""
        
        block = f"{proj_tag}[{source_tag}/{age_str} | score:{r['score']:.2f}] {r['content'].strip()}"
        output_lines.append(block)
        
    output_lines.append("---")
    return "\\n".join(output_lines)


@mcp.tool()
def telemem_remember(content: str, source_type: str = "doc", domain: str = "general") -> str:
    """Yeni bir bilgiyi aktif projenin hafuzasuna kaydeder. (Saves a new memory).
    
    Args:
        content: Kaydedilecek bilgi metni.
        source_type: doc, plan, skill, log.
        domain: database, frontend, planning, skill, general.
    """
    active_project, api_key = get_context()
    if not api_key:
         return "Error: OPENROUTER_API_KEY not found."
         
    node_id = federated_engine.remember(
         active_project=active_project,
         content=content,
         source_type=source_type,
         domain=domain,
         open_router_key=api_key
    )
    
    if node_id != -1:
         return f"Başarıyla kaydedildi. Node ID: {node_id} (Project: {active_project}, Domain: {domain})"
    return "Hata: Kayıt işlemi başarısız oldu."


@mcp.tool()
def telemem_list_projects() -> str:
    """Kayutlu tüm projeleri listeler. (Lists all registered projects in the federation)."""
    projects = federated_engine.list_projects()
    if not projects:
         return "Sistemde kayıtlı proje yok."
    
    lines = ["--- REGISTERED PROJECTS ---"]
    for name, data in projects.items():
         lines.append(f"- {name} (Kayıt: {data.get('registered_at', 'N/A')})")
    
    return "\\n".join(lines)


@mcp.tool()
def telemem_register(project_name: str, db_path: str, workspace_root: str, env_file: str) -> str:
    """Yeni bir projeyi federasyona dahil eder. (Registers a new project)."""
    return federated_engine.register_project(project_name, db_path, workspace_root, env_file)


if __name__ == "__main__":
    mcp.run(transport="stdio")
