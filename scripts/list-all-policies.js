
import pg from 'pg';
const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) { console.error('DATABASE_URL missing'); process.exit(1); }

const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

async function listPolicies() {
    try {
        await client.connect();

        // List all policies with auth.uid() usage
        const res = await client.query(`
            SELECT tablename, policyname, cmd, permissive, qual, with_check
            FROM pg_policies
            WHERE schemaname = 'public'
            ORDER BY tablename, cmd, policyname;
        `);

        console.log('=== ALL PUBLIC POLICIES ===\n');
        let currentTable = '';
        for (const r of res.rows) {
            if (r.tablename !== currentTable) {
                console.log(`\n--- ${r.tablename} ---`);
                currentTable = r.tablename;
            }
            const hasInitPlan = (r.qual && r.qual.includes('auth.uid()')) || (r.with_check && r.with_check.includes('auth.uid()'));
            const marker = hasInitPlan ? '⚠️ INITPLAN' : '';
            console.log(`  [${r.cmd}] ${r.policyname} (${r.permissive}) ${marker}`);
        }

        // Count multiple permissive per table/cmd
        console.log('\n\n=== MULTIPLE PERMISSIVE (NEED CONSOLIDATION) ===');
        const multiRes = await client.query(`
            SELECT tablename, cmd, COUNT(*) cnt, string_agg(policyname, ', ') policies
            FROM pg_policies
            WHERE permissive = 'PERMISSIVE' AND schemaname = 'public'
            GROUP BY tablename, cmd
            HAVING COUNT(*) > 1
            ORDER BY tablename, cmd;
        `);
        if (multiRes.rows.length === 0) console.log('  ✅ None');
        else multiRes.rows.forEach(r => console.log(`  ${r.tablename} (${r.cmd}): ${r.policies}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listPolicies();
