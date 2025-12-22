import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:SgxnZcG8Y79evUfd@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function analyze() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // Tüm RLS politikalarını listele
        const policiesResult = await client.query(`
            SELECT 
                tablename, 
                policyname,
                permissive,
                cmd
            FROM pg_policies 
            WHERE schemaname = 'public'
            ORDER BY tablename, policyname;
        `);

        let output = '=== VERİTABANI RLS ANALİZİ ===\n\n';
        output += `Toplam politika sayısı: ${policiesResult.rows.length}\n\n`;

        // Tabloya göre grupla
        const byTable = {};
        for (const row of policiesResult.rows) {
            if (!byTable[row.tablename]) byTable[row.tablename] = [];
            byTable[row.tablename].push(row);
        }

        output += '=== TABLO BAZINDA POLİTİKALAR ===\n';
        for (const [table, policies] of Object.entries(byTable)) {
            output += `\n${table} (${policies.length} politika):\n`;
            for (const p of policies) {
                output += `  - ${p.policyname} [${p.cmd}] ${p.permissive}\n`;
            }
        }

        // RLS etkin ama politikası olmayan tabloları bul
        const noPolicy = await client.query(`
            SELECT c.relname as tablename
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' 
              AND c.relkind = 'r'
              AND c.relrowsecurity = true
              AND NOT EXISTS (
                  SELECT 1 FROM pg_policies p 
                  WHERE p.schemaname = 'public' AND p.tablename = c.relname
              );
        `);

        if (noPolicy.rows.length > 0) {
            output += '\n=== RLS ETKİN AMA POLİTİKASIZ TABLOLAR ===\n';
            for (const row of noPolicy.rows) {
                output += `  ⚠️ ${row.tablename}\n`;
            }
        }

        // Dosyaya yaz
        fs.writeFileSync('rls-analysis.txt', output);
        console.log('Analiz tamamlandı. Sonuçlar: rls-analysis.txt');
        console.log(output);

    } catch (err) {
        console.error('Hata:', err.message);
    } finally {
        await client.end();
    }
}

analyze();
