import os
import requests
import json
from dotenv import load_dotenv
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env vars
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SERVICE_KEY:
    logger.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

def apply_migration():
    migration_file = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'migrations', '20251218_wizard_selections.sql')
    
    with open(migration_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Use the file content directly
    full_sql = sql_content
    
    # Join statements into one block for exec function
    # full_sql is already set above
    
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec"
    headers = {
        "Authorization": f"Bearer {SERVICE_KEY}",
        "apikey": SERVICE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "query": full_sql
    }
    
    logger.info(f"Executing migration via RPC: {url}")
    response = requests.post(url, headers=headers, json=payload)
    
    if response.status_code == 200:
        logger.info("Migration applied successfully!")
        logger.info(response.text)
    else:
        logger.error(f"Failed to apply migration: {response.status_code}")
        logger.error(response.text)
        # If exec doesn't exist, try asking user
        if response.status_code == 404:
             logger.error("RPC 'exec' not found. Please run 'supabase db push' manually.")
        exit(1)

if __name__ == "__main__":
    apply_migration()
