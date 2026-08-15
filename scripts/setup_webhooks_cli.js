import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

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
  console.log('=== Supabase Webhook Automated CLI Setup ===');
  
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  
  const env = {
    ...parseEnv(envPath),
    ...parseEnv(envLocalPath)
  };
  
  const webhookPrefix = 'whsec_';
  let secret = env.SUPABASE_WEBHOOK_SECRET || process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) {
    secret = webhookPrefix + 'venthub_' + crypto.randomBytes(16).toString('hex');
    console.log(`Generating new SUPABASE_WEBHOOK_SECRET: ${secret}`);
    
    // Save to both env and env.local
    updateEnvFile(envPath, 'SUPABASE_WEBHOOK_SECRET', secret);
    updateEnvFile(envLocalPath, 'SUPABASE_WEBHOOK_SECRET', secret);
    console.log('Saved secret to .env and .env.local');
  } else {
    console.log(`Using existing SUPABASE_WEBHOOK_SECRET: ${secret}`);
  }
  
  // 2. Prepare the SQL file
  const sqlContent = `
    -- Enable pg_net extension
    CREATE EXTENSION IF NOT EXISTS pg_net;

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
    $$ LANGUAGE plpgsql SECURITY DEFINER
    -- SET search_path SART: CREATE OR REPLACE FUNCTION fonksiyonun TUM ozniteliklerini
    -- yeniden yazar; SET yazilmazsa proconfig SILINIR ve SECURITY DEFINER bir fonksiyon
    -- search_path kilidini kaybeder (20260602070000_security_hardening.sql ile getirilen
    -- sertlestirme geri alinir). Prod'daki canli hal: SET search_path TO 'pg_catalog','public','net'.
    SET search_path = pg_catalog, public, net;

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

    -- Attach triggers to public.product_families
    DROP TRIGGER IF EXISTS on_product_families_change ON public.product_families;
    CREATE TRIGGER on_product_families_change
    AFTER INSERT OR UPDATE OR DELETE ON public.product_families
    FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

    -- Attach triggers to public.product_prices
    -- UPDATE ayri ve KOSULLU: fiyat materialize her satiri yeniden yazar; kosulsuz bir tetik
    -- fiyat DEGISMESE bile ~1044 webhook atesler (2026-08-15 olculdu). WHEN yalniz UPDATE'te
    -- kurulabilir (INSERT'te OLD, DELETE'te NEW yoktur), o yuzden ekleme/silme ayri tetikte kalir.
    DROP TRIGGER IF EXISTS on_product_prices_change ON public.product_prices;
    DROP TRIGGER IF EXISTS on_product_prices_ins_del ON public.product_prices;
    DROP TRIGGER IF EXISTS on_product_prices_upd ON public.product_prices;

    CREATE TRIGGER on_product_prices_ins_del
    AFTER INSERT OR DELETE ON public.product_prices
    FOR EACH ROW EXECUTE FUNCTION public.handle_supabase_webhook();

    CREATE TRIGGER on_product_prices_upd
    AFTER UPDATE ON public.product_prices
    FOR EACH ROW
    WHEN (
      OLD.net_price IS DISTINCT FROM NEW.net_price
      OR OLD.gross_price IS DISTINCT FROM NEW.gross_price
      OR OLD.is_active IS DISTINCT FROM NEW.is_active
      OR OLD.currency IS DISTINCT FROM NEW.currency
    )
    EXECUTE FUNCTION public.handle_supabase_webhook();
  `;
  
  const tempSqlFile = path.resolve(process.cwd(), 'scripts/temp_setup.sql');
  fs.writeFileSync(tempSqlFile, sqlContent, 'utf8');
  console.log('Created temporary SQL file scripts/temp_setup.sql');
  
  const passwords = [env.SUPABASE_DB_PASSWORD].filter(Boolean);
  
  // Dynamically extract password from DATABASE_URL if available
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/);
      if (match && match[2] && !match[2].includes('[')) {
        passwords.push(match[2]);
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // Remove duplicates
  const uniquePasswords = Array.from(new Set(passwords));
  
  const possibleConfigs = [];
  
  for (const pw of uniquePasswords) {
    // Pooler Configs
    possibleConfigs.push({
      user: 'postgres.tnofewwkwlyjsqgwjjga',
      host: 'aws-1-eu-central-1.pooler.supabase.com',
      port: 5432,
      password: pw,
      desc: `Pooler Port 5432, Password: ${pw.substring(0, 3)}...`
    });
    possibleConfigs.push({
      user: 'postgres.tnofewwkwlyjsqgwjjga',
      host: 'aws-1-eu-central-1.pooler.supabase.com',
      port: 6543,
      password: pw,
      desc: `Pooler Port 6543, Password: ${pw.substring(0, 3)}...`
    });
    
    // Direct DB Configs (IPv6)
    possibleConfigs.push({
      user: 'postgres',
      host: 'db.tnofewwkwlyjsqgwjjga.supabase.co',
      port: 5432,
      password: pw,
      desc: `Direct DB IPv6, Password: ${pw.substring(0, 3)}...`
    });

    // Direct DB Configs (Literal IPv6)
    possibleConfigs.push({
      user: 'postgres',
      host: '[2a05:d014:1c06:5f10:b87e:91ba:96a8:18d5]',
      port: 5432,
      password: pw,
      desc: `Direct DB Literal IPv6, Password: ${pw.substring(0, 3)}...`
    });
  }
  
  let success = false;
  
  for (const config of possibleConfigs) {
    try {
      const encUser = encodeURIComponent(config.user);
      const encPass = encodeURIComponent(config.password);
      const dbUrl = `postgresql://${encUser}:${encPass}@${config.host}:${config.port}/postgres`;
      
      console.log(`Trying to execute setup on: ${config.desc}`);
      
      // Run supabase db query via execSync
      const cmd = `npx supabase db query --db-url "${dbUrl}" -f "scripts/temp_setup.sql"`;
      execSync(cmd, { stdio: 'inherit' });
      
      success = true;
      console.log(`SUCCESSFULLY applied SQL via ${config.desc}!`);
      break;
    } catch (err) {
      console.log(`CLI execution failed: ${err.message}`);
    }
  }
  
  // Clean up
  if (fs.existsSync(tempSqlFile)) {
    fs.unlinkSync(tempSqlFile);
    console.log('Removed temporary SQL file.');
  }
  
  if (!success) {
    console.error('CRITICAL: All database triggers installation attempts failed! Please check your network or DB credentials in .env.');
    process.exit(1);
  }
  
  console.log('\n===============================================================');
  console.log('🎉 Setup Completed Successfully!');
  console.log('The following steps have been done on your behalf:');
  console.log('1. Generated and saved SUPABASE_WEBHOOK_SECRET in .env and .env.local.');
  console.log('2. Connected directly to the remote Supabase database via Supabase CLI.');
  console.log('3. Enabled the pg_net extension in PostgreSQL.');
  console.log('4. Installed the asynchronous HTTP triggers on products, categories, inventory_movements, product_families and product_prices.');
  console.log('===============================================================');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
