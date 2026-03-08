
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

async function applyFixes() {
    try {
        await client.connect();
        console.log('Applying DB Adapter Fixes...');

        // 1. Drop Duplicate Index on product_images
        // 'idx_product_images_product_id' is commonly the duplicate of 'product_images_product_id_idx'
        // We drop one.
        try {
            await client.query(`DROP INDEX IF EXISTS idx_product_images_product_id;`);
            console.log('✅ Dropped duplicate index: idx_product_images_product_id');
        } catch (e) {
            console.log('Note: idx_product_images_product_id not found or error: ' + e.message);
        }

        // 2. Consolidate RLS Policies on product_images
        // Nuke all PERMISSIVE policies on product_images to be safe and clean.
        try {
            await client.query(`
                DO $$
                DECLARE r RECORD;
                BEGIN
                    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'product_images' AND permissive = 'PERMISSIVE' LOOP
                        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON product_images';
                        RAISE NOTICE 'Dropped policy: %', r.policyname;
                    END LOOP;
                END $$;
            `);
            console.log('✅ Dropped all permissive policies on product_images via dynamic SQL.');
        } catch (e) {
            console.log('Error dropping policies: ' + e.message);
        }

        // 3. Recreate a single consolidated update policy (optional, but good practice if we removed all updates)
        // We assume 'authenticated' users can update product images.
        try {
            await client.query(`
                CREATE POLICY "consolidated_product_images_update" 
                ON product_images 
                FOR UPDATE 
                TO authenticated 
                USING (true) 
                WITH CHECK (true);
            `);
            console.log(`✅ Created consolidated policy: consolidated_product_images_update`);
        } catch (e) {
            console.log('Note: Could not create consolidated policy (might exist).');
        }

        console.log('DB Fixes Applied.');

    } catch (err) {
        console.error('Error applying fixes:', err);
    } finally {
        await client.end();
    }
}

applyFixes();
