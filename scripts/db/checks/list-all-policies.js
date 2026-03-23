
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

        console.warn('=== ALL PUBLIC POLICIES ===\n');
        let currentTable = '';
        for (const r of res.rows) {
            if (r.tablename !== currentTable) {
                console.warn(`\n--- ${r.tablename} ---`);
                currentTable = r.tablename;
            }
            const hasInitPlan = (r.qual && r.qual.includes('auth.uid()')) || (r.with_check && r.with_check.includes('auth.uid()'));
            const marker = hasInitPlan ? '⚠️ INITPLAN' : '';
            console.warn(`  [${r.cmd}] ${r.policyname} (${r.permissive}) ${marker}`);
        }

        // _count multiple permissive per table/cmd
        console.warn('\n\n=== MULTIPLE PERMISSIVE (NEED CONSOLIDATION) ===');
        const multiRes = await client.query(`
            SELECT tablename, cmd, _count(*) cnt, string_agg(policyname, ', ') policies
            FROM pg_policies
            WHERE permissive = 'PERMISSIVE' AND schemaname = 'public'
            GROUP BY tablename, cmd
            HAVING _count(*) > 1
            ORDER BY tablename, cmd;
        `);
        if (multiRes.rows.length === 0) console.warn('  ✅ None');
        else multiRes.rows.forEach(r => console.warn(`  ${r.tablename} (${r.cmd}): ${r.policies}`));

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

listPolicies();
