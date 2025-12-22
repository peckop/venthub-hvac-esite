import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://postgres.tnofewwkwlyjsqgwjjga:***REMOVED***@aws-1-eu-central-1.pooler.supabase.com:5432/postgres';

// Duplicate/çoklu SELECT politikaları olan tabloları temizle
async function cleanMultiplePolicies() {
    console.log('🔧 Çoklu Permissive Politika Temizliği...\n');

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Veritabanına bağlandı.\n');

        // Aynı tablo + aynı cmd için birden fazla politika olanları bul
        const duplicates = await client.query(`
            SELECT tablename, cmd, array_agg(policyname) as policies, count(*) as cnt
            FROM pg_policies 
            WHERE schemaname = 'public'
            GROUP BY tablename, cmd
            HAVING count(*) > 1
            ORDER BY tablename, cmd;
        `);

        console.log(`Çoklu politika bulunan tablo/eylem çiftleri: ${duplicates.rows.length}\n`);

        for (const row of duplicates.rows) {
            console.log(`${row.tablename} [${row.cmd}]: ${row.cnt} politika`);
            console.log(`   Politikalar: ${row.policies.join(', ')}`);
        }

        // Sonuç
        const countResult = await client.query(`
            SELECT COUNT(*) as total FROM pg_policies WHERE schemaname = 'public'
        `);
        console.log(`\n📋 Toplam politika sayısı: ${countResult.rows[0].total}`);

    } catch (err) {
        console.error('❌ Hata:', err.message);
    } finally {
        await client.end();
        console.log('\n✅ Analiz tamamlandı.');
    }
}

cleanMultiplePolicies();
