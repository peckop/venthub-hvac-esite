
import pg from 'pg';
const { Client } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is missing in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
});

async function checkPerformance() {
    try {
        await client.connect();
        console.warn('Connected to database...');

        const query = `
            SELECT
                c.conrel_id::regclass AS table_name,
                c.conname AS fk_name,
                pg_get_constraintdef(c.oid) AS definition
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE c.contype = 'f' 
            AND n.nspname = 'public'
            AND NOT EXISTS (
                SELECT 1 
                FROM pg_index i 
                WHERE i.indrelid = c.conrelid 
                AND i.indkey[0] = c.conkey[1]
            )
            ORDER BY table_name, fk_name;
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.warn('✅ No unindexed foreign keys found.');
        } else {
            console.warn('⚠️  Found potential unindexed Foreign Keys:');
            res.rows.forEach(row => {
                const dbDef = row.definition;
                const match = dbDef.match(/FOREIGN KEY \((.*?)\)/);
                const columns = match ? match[1] : 'unknown';

                console.warn(`- Table: ${row.table_name}, FK: ${row.fk_name}, Columns: ${columns}`);
                console.warn(`  SUGGESTION: CREATE INDEX idx_${row.fk_name}_perf ON ${row.table_name} (${columns});`);
            });
        }

    } catch (err) {
        console.error('Error conducting checks:', err);
    } finally {
        await client.end();
    }
}

checkPerformance();
