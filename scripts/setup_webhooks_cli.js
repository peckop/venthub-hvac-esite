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
  // SQL TEK KAYNAKTAN gelir: scripts/webhook_setup.sql. Bkz. setup_webhooks.js icindeki not —
  // uc ayri kopya, uc ayri drift yolu demekti.
  const setupSqlPath = path.resolve(process.cwd(), 'scripts/webhook_setup.sql');
  const sqlContent = fs.readFileSync(setupSqlPath, 'utf8').replace(/REPLACE_WITH_ENV_SECRET/g, secret);
  
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
