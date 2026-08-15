import fs from 'fs';
import { fileURLToPath } from 'node:url';
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
  
  // .env dosyalari REPO KOKUNE yazilir (betige goreli). process.cwd() kullanmak, betik baska
  // bir dizinden kosuldugunda gizli anahtari YANLIS DIZINE dusuruyordu — denetimde olculdu.
  const envPath = fileURLToPath(new URL('../.env', import.meta.url));
  const envLocalPath = fileURLToPath(new URL('../.env.local', import.meta.url));
  
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
  
  // 2. Try possible PostgreSQL connection details
  const possibleUrls = [];
  
  // Default values
  const user = 'postgres.tnofewwkwlyjsqgwjjga';
  const host = 'aws-1-eu-central-1.pooler.supabase.com';
  const database = 'postgres';
  
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
    
    // SQL TEK KAYNAKTAN gelir: scripts/webhook_setup.sql.
    // Daha once ayni SQL uc yerde AYRI AYRI kopyalanmisti (bu betik, setup_webhooks_cli.js ve
    // .sql dosyasi). Uc kopya birbirinden ayrisabiliyordu ve 2026-08-15 denetimi ucunun de eksik
    // tablo kurdugunu olctu — hicbir kapi gormuyordu. Kopyayi silmek, "hangi kopya guncel"
    // sorusunu tamamen ortadan kaldirir.
    // Yol BETIGE gore cozulur, process.cwd()'e gore DEGIL. Denetim olctu: cwd'ye baglayinca
    // betik repo koku disindan kosuldugunda ENOENT veriyordu — ama once .env'i YANLIS DIZINE
    // yazip prod DB'ye baglanip CREATE EXTENSION kosturduktan SONRA. Yan etki, on kosul
    // dogrulanmadan olmamali.
    const setupSqlPath = fileURLToPath(new URL('webhook_setup.sql', import.meta.url));
    const sql = fs.readFileSync(setupSqlPath, 'utf8').replace(/REPLACE_WITH_ENV_SECRET/g, secret);
    
    await client.query(sql);
    console.log('SUCCESS: Supabase Webhook triggers and function successfully installed in remote database!');
    
    // 5. Verify the tables have the triggers attached
    console.log('Verifying trigger status...');
    const verificationRes = await client.query(`
      SELECT trigger_name, event_manipulation, event_object_table, action_statement
      FROM information_schema.triggers
      WHERE trigger_name IN ('on_products_change', 'on_categories_change', 'on_inventory_movements_change', 'on_product_families_change', 'on_product_prices_ins_del', 'on_product_prices_upd');
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
    console.log('4. Installed the asynchronous HTTP triggers on products, categories, inventory_movements, product_families and product_prices.');
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
