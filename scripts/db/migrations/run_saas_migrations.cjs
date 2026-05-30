const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Correct remote pooler connection URL on port 6543 (transaction pooler)
const connectionString = "postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:6543/postgres";

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const migrationFiles = [
  '20260530220000_tenant_schema_setup.sql',
  '20260530221000_tenant_auth_integration.sql',
  '20260530222000_add_tenant_config_columns.sql',
  '20260530223000_add_tenant_branding_config.sql',
  '20260530224000_tenant_aware_storage_policies.sql'
];

async function run() {
  try {
    console.log('Connecting to remote Supabase pooler database (6543)...');
    await client.connect();
    console.log('✅ Connected successfully!');

    // Start a transaction for atomicity
    console.log('Starting transaction...');
    await client.query('BEGIN');

    // Robustness: Create order_refund_events table if missing to prevent relation errors
    console.log('Ensuring order_refund_events table exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.order_refund_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid NOT NULL,
        amount numeric(12,2) NOT NULL,
        reason text NULL,
        actor_user_id uuid NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE public.order_refund_events ENABLE ROW LEVEL SECURITY;
    `);
    console.log('✅ order_refund_events table checked/created.');

    for (const filename of migrationFiles) {
      const filepath = path.resolve(__dirname, '../../../supabase/migrations', filename);
      console.log(`Reading migration: ${filename}...`);
      
      if (!fs.existsSync(filepath)) {
        throw new Error(`Migration file not found: ${filepath}`);
      }

      const sql = fs.readFileSync(filepath, 'utf8');
      console.log(`Executing migration: ${filename}...`);
      await client.query(sql);
      console.log(`✅ Completed: ${filename}`);
    }

    console.log('Committing transaction...');
    await client.query('COMMIT');
    console.log('🎉 ALL MIGRATIONS APPLIED SUCCESSFULLY TO REMOTE DATABASE!');
  } catch (err) {
    console.error('❌ Migration failed!');
    console.error(err.message || err);
    try {
      console.log('Rolling back transaction...');
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
