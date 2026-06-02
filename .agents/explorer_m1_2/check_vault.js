import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

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

async function main() {
  const envPath = path.resolve(process.cwd(), '.env');
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  
  const env = {
    ...parseEnv(envPath),
    ...parseEnv(envLocalPath)
  };
  
  const user = 'postgres.tnofewwkwlyjsqgwjjga';
  const host = 'aws-1-eu-central-1.pooler.supabase.com';
  const database = 'postgres';
  const passwords = [env.SUPABASE_DB_PASSWORD].filter(Boolean);
  
  const dbUrl = env.DATABASE_URL || process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@/);
      if (match && match[2] && !match[2].includes('[')) {
        passwords.push(match[2]);
      }
    } catch (e) {}
  }
  
  const uniquePasswords = Array.from(new Set(passwords));
  const ports = [5432, 6543];
  const possibleUrls = [];
  
  for (const pw of uniquePasswords) {
    for (const port of ports) {
      possibleUrls.push({ user, password: pw, host, port, database });
    }
  }
  
  let client;
  let connected = false;
  
  for (const config of possibleUrls) {
    try {
      client = new Client({
        user: config.user,
        password: config.password,
        host: config.host,
        port: config.port,
        database: config.database,
        ssl: { rejectUnauthorized: false }
      });
      await client.connect();
      connected = true;
      break;
    } catch (err) {
      if (client) {
        try { await client.end(); } catch (e) {}
      }
    }
  }
  
  if (!connected) {
    console.error('Failed to connect to database.');
    process.exit(1);
  }
  
  try {
    const res = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'vault'");
    if (res.rows.length > 0) {
      console.log('Vault schema is present in the database!');
      const tableRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'vault'");
      console.log('Tables in vault schema:', tableRes.rows.map(r => r.table_name).join(', '));
    } else {
      console.log('Vault schema is NOT present.');
    }
  } catch (err) {
    console.error('Error querying vault schema:', err.message);
  } finally {
    await client.end();
  }
}

main();
