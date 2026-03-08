
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

async function listIndexes() {
    try {
        await client.connect();
        console.log('Connected to database...');

        const query = `
            SELECT indexname, indexdef
            FROM pg_indexes
            WHERE tablename = 'products';
        `;

        const res = await client.query(query);

        if (res.rows.length === 0) {
            console.log('⚠️ No indexes found on products table (other than PK potentially).');
        } else {
            console.log('Existing indexes on products:');
            res.rows.forEach(row => {
                console.log(`- ${row.indexname}: ${row.indexdef}`);
            });
        }

    } catch (err) {
        console.error('Error listing indexes:', err);
    } finally {
        await client.end();
    }
}

listIndexes();
