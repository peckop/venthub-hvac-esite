import os
from pathlib import Path
from datetime import datetime

def main():
    repo_root = Path(__file__).resolve().parents[3]
    schema_file = repo_root / "docs" / "database_schema_master.md"
    migrations_dir = repo_root / "supabase" / "migrations"
    
    with open(schema_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # 1. Update frontmatter metadata block
    # Find metadata range
    meta_start = content.find("---")
    meta_end = content.find("---", meta_start + 3)
    
    metadata = f"""---
compiled_at: {datetime.utcnow().isoformat()}+00:00
tables: 28
policies: 132
functions: 55
indexes: 47
---"""
    content = content[:meta_start] + metadata + content[meta_end + 3:]
    
    # 2. Insert tenants table in catalog under 1. TABLOLAR
    # Place tenants before user_addresses
    tenants_catalog = """### tenants

| Sutun | Tip |
|-------|-----|
| id | uuid PRIMARY KEY |
| name | text UNIQUE NOT NULL |
| subdomain | text UNIQUE |
| custom_domain | text UNIQUE |
| is_active | boolean NOT NULL DEFAULT true |
| created_at | timestamptz NOT NULL DEFAULT now() |
| features | jsonb NOT NULL DEFAULT '{}' |
| styles | jsonb NOT NULL DEFAULT '{}' |
| config | jsonb NOT NULL DEFAULT '{}' |
| theme_config | jsonb NOT NULL DEFAULT '{}' |

"""
    user_addr_idx = content.find("### user_addresses")
    if user_addr_idx != -1:
        content = content[:user_addr_idx] + tenants_catalog + content[user_addr_idx:]
        
    # 3. Add tenant_id column to Tenant-Aware tables in Section 1
    # List of Tenant-Aware tables in catalog
    tenant_aware_tables = [
        "admin_audit_log", "coupons", "inventory_movements", "inventory_settings",
        "order_attachments", "order_notes", "order_refund_events", "returns_webhook_events",
        "shipping_email_events", "shipping_webhook_events", "user_addresses",
        "user_invoice_profiles", "user_profiles", "venthub_returns", "wizard_selections"
    ]
    
    for table in tenant_aware_tables:
        header = f"### {table}"
        # We need to find the markdown table under this header
        start_idx = 0
        while True:
            idx = content.find(header, start_idx)
            if idx == -1:
                break
            # Find the next markdown table block
            tbl_start = content.find("|-------|-----|", idx)
            if tbl_start != -1:
                # Find the end of the markdown table (double newline or next header)
                next_header = content.find("\n###", tbl_start)
                next_double_nl = content.find("\n\n", tbl_start)
                tbl_end = min(next_header if next_header != -1 else len(content), 
                              next_double_nl if next_double_nl != -1 else len(content))
                
                # Append tenant_id column right before the table ends
                col_row = "\n| tenant_id | uuid NOT NULL DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000' REFERENCES tenants(id) ON DELETE CASCADE |"
                
                content = content[:tbl_end] + col_row + content[tbl_end:]
            start_idx = idx + len(header)
            
    # 4. Concatenate new migration files under Section 2
    migration_files = [
        "20260530220000_tenant_schema_setup.sql",
        "20260530221000_tenant_auth_integration.sql",
        "20260530222000_add_tenant_config_columns.sql",
        "20260530223000_add_tenant_branding_config.sql",
        "20260530224000_tenant_aware_storage_policies.sql"
    ]
    
    migration_blocks = []
    for mf in migration_files:
        filepath = migrations_dir / mf
        if filepath.exists():
            with open(filepath, 'r', encoding='utf-8') as mf_file:
                m_content = mf_file.read()
            block = f"""
-- FILE: {mf}
{m_content}
"""
            migration_blocks.append(block)
            
    migrations_combined = "\n".join(migration_blocks) + "\n\n"
    
    # Insert before Section 3 header
    sec3_header = "## 3. FONKSIYONLAR (PL/pgSQL)"
    sec3_idx = content.find(sec3_header)
    if sec3_idx != -1:
        content = content[:sec3_idx] + migrations_combined + content[sec3_idx:]
        
    # 5. Insert new PL/pgSQL functions
    sec3_idx = content.find(sec3_header) # Re-find index since we inserted text
    # Let's insert new functions under section 3 alphabetically or just after the header
    new_functions = """
### `jwt_tenant_id()` → uuid

### `handle_new_user_metadata()` → trigger

### `handle_new_user_profile()` → trigger
"""
    first_func_header = "\n### `"
    first_func_idx = content.find(first_func_header, sec3_idx)
    if first_func_idx != -1:
        content = content[:first_func_idx] + new_functions + content[first_func_idx:]
        
    # 6. Add triggers in 5. TRIGGER'LAR
    trigger_table_header = "| Trigger | Zamanlama | Event | Tablo |"
    trg_table_idx = content.find(trigger_table_header)
    if trg_table_idx != -1:
        sep_idx = content.find("\n", trg_table_idx)
        sep_end_idx = content.find("\n", sep_idx + 1)
        new_triggers = """| trg_handle_new_user_metadata | before | insert | auth.users |
| trg_handle_new_user_profile | after | insert | auth.users |
"""
        content = content[:sep_end_idx + 1] + new_triggers + content[sep_end_idx + 1:]
        
    # 7. Add indexes to 6. INDEKSLER
    index_table_header = "| Indeks | Tablo | Tip | Sutunlar |"
    idx_table_idx = content.find(index_table_header)
    if idx_table_idx != -1:
        sep_idx = content.find("\n", idx_table_idx)
        sep_end_idx = content.find("\n", sep_idx + 1)
        new_indexes = """| idx_shopping_carts_tenant_id | shopping_carts | btree | tenant_id |
| idx_cart_items_tenant_id | cart_items | btree | tenant_id |
| idx_venthub_orders_tenant_id | venthub_orders | btree | tenant_id |
| idx_venthub_order_items_tenant_id | venthub_order_items | btree | tenant_id |
| idx_venthub_returns_tenant_id | venthub_returns | btree | tenant_id |
| idx_coupons_tenant_id | coupons | btree | tenant_id |
| idx_inventory_movements_tenant_id | inventory_movements | btree | tenant_id |
| idx_inventory_settings_tenant_id | inventory_settings | btree | tenant_id |
| idx_price_lists_tenant_id | price_lists | btree | tenant_id |
| idx_product_prices_tenant_id | product_prices | btree | tenant_id |
| idx_order_attachments_tenant_id | order_attachments | btree | tenant_id |
| idx_order_notes_tenant_id | order_notes | btree | tenant_id |
| idx_order_refund_events_tenant_id | order_refund_events | btree | tenant_id |
| idx_user_profiles_tenant_id | user_profiles | btree | tenant_id |
| idx_user_addresses_tenant_id | user_addresses | btree | tenant_id |
| idx_user_invoice_profiles_tenant_id | user_invoice_profiles | btree | tenant_id |
| idx_wizard_selections_tenant_id | wizard_selections | btree | tenant_id |
| idx_shipping_email_events_tenant_id | shipping_email_events | btree | tenant_id |
| idx_shipping_webhook_events_tenant_id | shipping_webhook_events | btree | tenant_id |
| idx_returns_webhook_events_tenant_id | returns_webhook_events | btree | tenant_id |
| idx_admin_audit_log_tenant_id | admin_audit_log | btree | tenant_id |
"""
        content = content[:sep_end_idx + 1] + new_indexes + content[sep_end_idx + 1:]
        
    # 8. Add diagram relations to 7. TABLO ILISKI DIYAGRAMI
    mermaid_start = content.find("```mermaid\nerDiagram")
    if mermaid_start != -1:
        insert_pos = content.find("\n", mermaid_start + len("```mermaid\nerDiagram"))
        relations = """    tenants ||--o{ shopping_carts : references
    tenants ||--o{ cart_items : references
    tenants ||--o{ venthub_orders : references
    tenants ||--o{ venthub_order_items : references
    tenants ||--o{ venthub_returns : references
    tenants ||--o{ coupons : references
    tenants ||--o{ inventory_movements : references
    tenants ||--o{ inventory_settings : references
    tenants ||--o{ price_lists : references
    tenants ||--o{ product_prices : references
    tenants ||--o{ order_attachments : references
    tenants ||--o{ order_notes : references
    tenants ||--o{ order_refund_events : references
    tenants ||--o{ user_profiles : references
    tenants ||--o{ user_addresses : references
    tenants ||--o{ user_invoice_profiles : references
    tenants ||--o{ wizard_selections : references
    tenants ||--o{ shipping_email_events : references
    tenants ||--o{ shipping_webhook_events : references
    tenants ||--o{ returns_webhook_events : references
    tenants ||--o{ admin_audit_log : references
"""
        content = content[:insert_pos + 1] + relations + content[insert_pos + 1:]
        
    with open(schema_file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Successfully updated database schema master document!")

if __name__ == '__main__':
    main()
