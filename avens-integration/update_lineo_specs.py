import json
import os
import psycopg2
from psycopg2.extras import Json

# Database connection parameters (using environment variables or default)
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_NAME = os.environ.get("DB_NAME", "venthub_db")
DB_USER = os.environ.get("DB_USER", "postgres")
DB_PASS = os.environ.get("DB_PASS", "password")

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def update_specs():
    # Load specs from JSON
    try:
        with open('lineo_quiet_specs.json', 'r', encoding='utf-8') as f:
            specs_data = json.load(f)
    except FileNotFoundError:
        print("Error: lineo_quiet_specs.json not found.")
        return

    conn = get_db_connection()
    if not conn:
        return

    cur = conn.cursor()

    print("Updating product specifications...")

    for item in specs_data:
        model_name = item['model']
        specs = item['specs']
        
        # Construct a search term for fuzzy matching
        # e.g., "Lineo 100 Quiet" -> "%Lineo%100%Quiet%"
        search_term = "%" + "%".join(model_name.split()) + "%"
        
        try:
            # Find the product ID first
            cur.execute("""
                SELECT id, name FROM products 
                WHERE name ILIKE %s
            """, (search_term,))
            
            matches = cur.fetchall()
            
            if not matches:
                print(f"⚠️ No product found for: {model_name}")
                continue
            
            # If multiple matches, try to find the best one (exact match preference)
            target_id = None
            target_name = ""
            
            if len(matches) == 1:
                target_id = matches[0][0]
                target_name = matches[0][1]
            else:
                # Simple heuristic: pick the one that contains the model name most closely
                # For now, just pick the first one and log warning
                print(f"⚠️ Multiple matches for {model_name}: {[m[1] for m in matches]}. Using first one.")
                target_id = matches[0][0]
                target_name = matches[0][1]

            # Update the technical_specs column
            # Assuming technical_specs is a JSONB column
            cur.execute("""
                UPDATE products 
                SET technical_specs = %s 
                WHERE id = %s
            """, (Json(specs), target_id))
            
            print(f"✅ Updated {target_name} (ID: {target_id}) with specs.")
            
        except Exception as e:
            print(f"❌ Error updating {model_name}: {e}")
            conn.rollback()
            continue

    conn.commit()
    cur.close()
    conn.close()
    print("\nUpdate process completed.")

if __name__ == "__main__":
    update_specs()
