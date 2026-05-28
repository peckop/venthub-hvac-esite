import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import pg from 'pg';

const { Client } = pg;

// Helper to parse env files
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[match[1].trim()] = val;
    }
  });
  return env;
}

// Helper to write to env files
function updateEnvFile(filePath, key, value) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `${key}=${value}\n`, 'utf8');
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let found = false;
  const updatedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${key}=`)) {
      found = true;
      return `${key}=${value}`;
    }
    return line;
  });
  if (!found) {
    updatedLines.push(`${key}=${value}`);
  }
  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
}

async function main() {
  console.log('=== Supabase Webhook Automated Setup ===');
  
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  
  const env = {
    ...parseEnv(envPath),
    ...parseEnv(envLocalPath)
  };
  
  // 1. Generate or read SUPABASE_WEBHOOK_SECRET
  let secret = env.SUPABASE_WEBHOOK_SECRET || process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) {
    secret = 'whsec_venthub_' + crypto.randomBytes(16).toString('hex');
    console.log(`Generating new SUPABASE_WEBHOOK_SECRET: ${secret}`);
    
    // Save to both env and env.local
    updateEnvFile(envPath, 'SUPABASE_WEBHOOK_SECRET', secret);
    updateEnvFile(envLocalPath, 'SUPABASE_WEBHOOK_SECRET', secret);
    console.log('Saved secret to .env and .env.local');
  } else {
    console.log(`Using existing SUPABASE_WEBHOOK_SECRET: ${secret}`);
  }
  
  // 2. Try possible PostgreSQL connection details
  const possibleUrls = [];
  
  // Default values
  const user = 'postgres.tnofewwkwlyjsqgwjjga';
  const host = 'aws-1-eu-central-1.pooler.supabase.com';
  const database = 'postgres';
  
  const passwords = [env.SUPABASE_DB_PASSWORD, 'SgxnZcG8Y79evUfd', 'buSgxnZcG8Y79evUfd'].filter(Boolean);
  // Remove duplicates
  const uniquePasswords = Array.from(new Set(passwords));
  
  const ports = [5432, 6543];
  
  for (const pw of uniquePasswords) {
    for (const port of ports) {
      possibleUrls.push({
        user,
        password: pw,
        host,
        port,
        database,
        desc: `Port: ${port}, Password: ${pw.substring(0, 3)}...`
      });
    }
  }
  
  let client;
  let connected = false;
  
  console.log(`Attempting to connect to Supabase DB (trying ${possibleUrls.length} configurations)...`);
  
  for (const config of possibleUrls) {
    try {
      console.log(`Connecting with config: ${config.desc}`);
      client = new Client({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        database: config.database,
        ssl: {
          rejectUnauthorized: false
        }
      });
      await client.connect();
      connected = true;
      console.log(`SUCCESSFULLY CONNECTED via config: ${config.desc}`);
      break;
    } catch (err) {
      console.log(`Connection failed: ${err.message}`);
      if (client) {
        try { await client.end(); } catch (e) {}
      }
    }
  }
  
  if (!connected) {
    console.error('CRITICAL: All database connection attempts failed! Please check your network or DB credentials in .env.');
    process.exit(1);
  }
  
  try {
    // 3. Enable pg_net
    console.log('Enabling pg_net extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_net;');
    
    // 4. Create Webhook Trigger function and triggers
    console.log('Creating webhook trigger function and triggers in database...');
    
    const sql = `
      -- Create the webhook function
      CREATE OR REPLACE FUNCTION public.handle_supabase_webhook()
      RETURNS TRIGGER AS $$
      DECLARE
        payload jsonb;
        webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
        webhook_secret text := '${secret}';
        req_id bigint;
      BEGIN
        -- Construct the payload matching Route Handler expectations
        payload := jsonb_build_object(
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA,
          'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
          'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
        );

        -- Perform asynchronous HTTP POST request using pg_net
        SELECT net.http_post(
          url := webhook_url,
          body := payload::text,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-webhook-secret', webhook_secret
          ),
          timeout_milliseconds := 5000
        ) INTO req_id;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Attach triggers to public.products
      DROP TRIGGER IF EXISTS on_products_change ON public.products;
      CREATE TRIGGER on_products_change
      AFTER INSERT OR UPDATE OR DELETE ON public.products
      FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

      -- Attach triggers to public.categories
      DROP TRIGGER IF EXISTS on_categories_change ON public.categories;
      CREATE TRIGGER on_categories_change
      AFTER INSERT OR UPDATE OR DELETE ON public.categories
      FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

      -- Attach triggers to public.inventory_movements
      DROP TRIGGER IF EXISTS on_inventory_movements_change ON public.inventory_movements;
      CREATE TRIGGER on_inventory_movements_change
      AFTER INSERT OR UPDATE OR DELETE ON public.inventory_movements
      FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();
    `;
    
    await client.query(sql);
    console.log('SUCCESS: Supabase Webhook triggers and function successfully installed in remote database!');
    
    // 5. Verify the tables have the triggers attached
    console.log('Verifying trigger status...');
    const verificationRes = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_name IN ('on_products_change', 'on_categories_change', 'on_inventory_movements_change');
    `);
    
    console.log('Installed Triggers:');
    verificationRes.rows.forEach(row => {
      console.log(`- Table: ${row.event_object_table}, Trigger: ${row.trigger_name}, Event: ${row.event_manipulation}`);
    });
    
    console.log('\n===============================================================');
    console.log('🎉 Setup Completed Successfully!');
    console.log('The following steps have been done on your behalf:');
    console.log('1. Generated and saved SUPABASE_WEBHOOK_SECRET in .env and .env.local.');
    console.log('2. Connected directly to the remote Supabase database.');
    console.log('3. Enabled the pg_net extension in PostgreSQL.');
    console.log('4. Installed the asynchronous HTTP triggers on products, categories, and inventory_movements.');
    console.log('===============================================================');
    
  } catch (err) {
    console.error('Error during database configuration:', err);
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
