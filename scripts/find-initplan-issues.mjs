import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

async function findInitplanIssues() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();

        // auth.uid() veya auth.role() içeren politikaları bul
        const result = await client.query(`
            SELECT 
                tablename, 
                policyname,
                cmd,
                qual,
                with_check
            FROM pg_policies 
            WHERE schemaname = 'public'
              AND (
                  (qual IS NOT NULL AND qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%SELECT auth.uid()%')
                  OR (with_check IS NOT NULL AND with_check::text LIKE '%auth.uid()%' AND with_check::text NOT LIKE '%SELECT auth.uid()%')
                  OR (qual IS NOT NULL AND qual::text LIKE '%auth.role()%' AND qual::text NOT LIKE '%SELECT auth.role()%')
                  OR (with_check IS NOT NULL AND with_check::text LIKE '%auth.role()%' AND with_check::text NOT LIKE '%SELECT auth.role()%')
              )
            ORDER BY tablename, policyname;
        `);

        console.log('=== AUTH.UID() INITPLAN SORUNLARI ===\n');
        console.log(`Toplam sorunlu politika: ${result.rows.length}\n`);

        let output = '=== AUTH.UID() INITPLAN SORUNLARI ===\n\n';
        output += `Toplam sorunlu politika: ${result.rows.length}\n\n`;

        for (const row of result.rows) {
            console.log(`${row.tablename}.${row.policyname} [${row.cmd}]`);
            console.log(`  USING: ${row.qual ? row.qual.substring(0, 100) : 'null'}...`);
            console.log(`  CHECK: ${row.with_check ? row.with_check.substring(0, 100) : 'null'}...`);
            console.log('');

            output += `${row.tablename}.${row.policyname} [${row.cmd}]\n`;
            output += `  USING: ${row.qual || 'null'}\n`;
            output += `  CHECK: ${row.with_check || 'null'}\n\n`;
        }

        fs.writeFileSync('initplan-issues.txt', output);
        console.log('Detaylar: initplan-issues.txt');

    } catch (err) {
        console.error('Hata:', err.message);
    } finally {
        await client.end();
    }
}

findInitplanIssues();
