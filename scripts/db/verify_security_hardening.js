import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

// Read .env file manually
function loadEnv() {
    const envPath = path.join(rootDir, '.env');
    if (!fs.existsSync(envPath)) return {};

    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const cleanLine = line.replace(/\r/g, '').split('#')[0].trim();
        if (!cleanLine) return;

        const parts = cleanLine.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
            env[key] = value;
        }
    });
    return env;
}

async function run() {
    const env = loadEnv();
    const connectionString = env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    const tryConnect = async (url) => {
        const client = new Client({
            connectionString: url,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 15000,
        });

        try {
            await client.connect();
            return client;
        } catch (err) {
            return null;
        }
    };

    let client = await tryConnect(connectionString);
    if (!client && connectionString.includes('pooler')) {
        const directUrl = connectionString
            .replace(':6543', ':5432')
            .replace('.pooler.', '.')
            .replace('?pgbouncer=true', '');
        client = await tryConnect(directUrl);
    }

    if (!client) {
        console.error('❌ Failed to connect to database.');
        process.exit(1);
    }

    console.log('✅ Connected to Postgres database.');

    try {
        // Start transaction for clean verification (will rollback at the end)
        await client.query('BEGIN;');

        console.log('\n--- 1. VERIFYING RLS POLICY ON public.user_profiles ---');
        // Setup T1, T2, U1, U2
        const t1 = '11111111-1111-1111-1111-111111111111';
        const t2 = '22222222-2222-2222-2222-222222222222';
        const u1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
        const u2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

        await client.query(`
            INSERT INTO public.tenants (id, name, subdomain, is_active)
            VALUES ('${t1}', 'Tenant 1', 'tenant1', true),
                   ('${t2}', 'Tenant 2', 'tenant2', true)
            ON CONFLICT (id) DO UPDATE SET is_active = true;
        `);

        // Delete any existing conflicting test profiles and users
        await client.query(`DELETE FROM public.user_profiles WHERE id IN ('${u1}', '${u2}');`);
        await client.query(`DELETE FROM auth.users WHERE id IN ('${u1}', '${u2}');`);

        // Insert into auth.users (triggers will automatically insert into public.user_profiles)
        await client.query(`
            INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role)
            VALUES 
            ('${u1}', 'user1@tenant1.com', '{"role": "user", "tenant_id": "${t1}", "full_name": "User T1"}'::jsonb, '{"tenant_id": "${t1}", "user_role": "user"}'::jsonb, 'authenticated', 'authenticated'),
            ('${u2}', 'user2@tenant2.com', '{"role": "user", "tenant_id": "${t2}", "full_name": "User T2"}'::jsonb, '{"tenant_id": "${t2}", "user_role": "user"}'::jsonb, 'authenticated', 'authenticated');
        `);

        // Verify they exist in public.user_profiles
        const profileCount = await client.query(`SELECT count(*) FROM public.user_profiles WHERE id IN ('${u1}', '${u2}');`);
        console.log(`- Profiles successfully propagated: ${profileCount.rows[0].count === '2' ? 'PASS' : 'FAIL'} (count: ${profileCount.rows[0].count})`);

        // Test SELECT under U1 user context
        await client.query('SET LOCAL ROLE authenticated;');
        await client.query(`
            SET LOCAL request.jwt.claims = '{"sub": "${u1}", "role": "authenticated", "app_metadata": {"tenant_id": "${t1}"}}';
        `);

        // Should read U1
        const resU1 = await client.query(`SELECT id, full_name, tenant_id FROM public.user_profiles WHERE id = '${u1}';`);
        console.log(`- Select own profile: ${resU1.rows.length === 1 ? 'PASS' : 'FAIL'} (rows returned: ${resU1.rows.length})`);

        // Should NOT read U2 (different tenant)
        const resU2 = await client.query(`SELECT id, full_name, tenant_id FROM public.user_profiles WHERE id = '${u2}';`);
        console.log(`- Select cross-tenant profile: ${resU2.rows.length === 0 ? 'PASS' : 'FAIL'} (rows returned: ${resU2.rows.length})`);

        // Reset role to postgres for setup of next test
        await client.query('RESET ROLE;');
        await client.query('SET LOCAL request.jwt.claims = DEFAULT;');

        console.log('\n--- 2. VERIFYING public.custom_access_token_hook ACCESS ---');
        
        // A. Switch to anon role
        await client.query('SET LOCAL ROLE anon;');
        await client.query('SAVEPOINT hook_anon;');
        try {
            await client.query(`SELECT public.custom_access_token_hook('{"claims":{}}'::jsonb);`);
            console.log('- Executing as anon: FAIL (No exception thrown)');
        } catch (err) {
            console.log(`- Executing as anon: PASS (Exception thrown: ${err.message})`);
        }
        await client.query('ROLLBACK TO SAVEPOINT hook_anon;');

        // B. Switch to authenticated role
        await client.query('RESET ROLE;');
        await client.query('SET LOCAL ROLE authenticated;');
        await client.query('SAVEPOINT hook_auth;');
        try {
            await client.query(`SELECT public.custom_access_token_hook('{"claims":{}}'::jsonb);`);
            console.log('- Executing as authenticated: FAIL (No exception thrown)');
        } catch (err) {
            console.log(`- Executing as authenticated: PASS (Exception thrown: ${err.message})`);
        }
        await client.query('ROLLBACK TO SAVEPOINT hook_auth;');

        // Reset role
        await client.query('RESET ROLE;');

        console.log('\n--- 3. VERIFYING ROLE SELF-PROMOTION DOWNGRADE/BLOCK TRIGGER ---');
        
        const testUserUuid = '77777777-7777-7777-7777-777777777777';
        // Clean up first
        await client.query(`DELETE FROM public.user_profiles WHERE id = '${testUserUuid}';`);
        await client.query(`DELETE FROM auth.users WHERE id = '${testUserUuid}';`);

        // Set jwt context as a normal non-admin user
        await client.query(`
            SET LOCAL request.jwt.claims = '{"sub": "${testUserUuid}", "role": "authenticated", "app_metadata": {"tenant_id": "${t1}"}}';
        `);

        // Insert new user into auth.users as superuser (to bypass DDL restrictions, but with standard JWT claims set).
        // The trigger is handle_new_user_metadata and handle_new_user_profile on INSERT.
        // Let's try to pass 'admin' in raw_user_meta_data.
        await client.query(`
            INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role)
            VALUES (
                '${testUserUuid}', 
                'test_hacker@venthub.com', 
                '{"role": "admin", "tenant_id": "${t1}"}'::jsonb,
                '{"tenant_id": "${t1}"}'::jsonb,
                'authenticated',
                'authenticated'
            );
        `);

        // Let's inspect raw_app_meta_data and user_profile role
        const resUserAuth = await client.query(`SELECT raw_app_meta_data, raw_user_meta_data FROM auth.users WHERE id = '${testUserUuid}';`);
        const resUserProfile = await client.query(`SELECT role, tenant_id FROM public.user_profiles WHERE id = '${testUserUuid}';`);

        const appRole = resUserAuth.rows[0]?.raw_app_meta_data?.user_role;
        const metaRole = resUserAuth.rows[0]?.raw_user_meta_data?.role;
        const profileRole = resUserProfile.rows[0]?.role;

        console.log(`- Trigger check (auth.users raw_app_meta_data.user_role): ${appRole === 'user' ? 'PASS' : 'FAIL'} (actual: ${appRole})`);
        console.log(`- Trigger check (auth.users raw_user_meta_data.role): ${metaRole === 'user' ? 'PASS' : 'FAIL'} (actual: ${metaRole})`);
        console.log(`- Trigger check (public.user_profiles role): ${profileRole === 'user' ? 'PASS' : 'FAIL'} (actual: ${profileRole})`);

        // Clean up test users
        await client.query('RESET ROLE;');
        await client.query('SET LOCAL request.jwt.claims = DEFAULT;');

        console.log('\n--- 4. VERIFYING ADMIN RPC FUNCTION ACCESS RESTRICTIONS ---');

        const rpcFunctions = [
            { name: 'set_user_admin_role', args: `'${u1}', 'admin'` },
            { name: 'adjust_stock', args: `'${t1}', 5, 'test_adjust'` },
            { name: 'adjust_stock', args: `'${t1}', 5, 'test_adjust', '${t1}'` },
            { name: 'set_stock', args: `'${t1}', 10, 'test_set'` },
            { name: 'set_stock', args: `'${t1}', 10, 'test_set', '${t1}'` }
        ];

        for (const fn of rpcFunctions) {
            console.log(`Testing ${fn.name}(${fn.args}):`);
            
            // A. Execute as anon
            await client.query('SET LOCAL ROLE anon;');
            await client.query('SAVEPOINT sp_anon;');
            try {
                await client.query(`SELECT public.${fn.name}(${fn.args});`);
                console.log(`  - Call as anon: FAIL (Allowed execution)`);
            } catch (err) {
                console.log(`  - Call as anon: PASS (Blocked with: ${err.message})`);
            }
            await client.query('ROLLBACK TO SAVEPOINT sp_anon;');

            // B. Execute as authenticated (unauthorized)
            await client.query('RESET ROLE;');
            await client.query('SET LOCAL ROLE authenticated;');
            await client.query('SAVEPOINT sp_auth;');
            try {
                await client.query(`SELECT public.${fn.name}(${fn.args});`);
                console.log(`  - Call as authenticated: FAIL (Allowed execution)`);
            } catch (err) {
                console.log(`  - Call as authenticated: PASS (Blocked with: ${err.message})`);
            }
            await client.query('ROLLBACK TO SAVEPOINT sp_auth;');

            // C. Execute with admin database role but unauthorized JWT context (checks internal auth checks)
            await client.query('RESET ROLE;');
            // simulate non-admin JWT
            await client.query(`
                SET LOCAL request.jwt.claims = '{"sub": "${u1}", "role": "authenticated", "app_metadata": {"tenant_id": "${t1}"}}';
            `);
            await client.query('SAVEPOINT sp_jwt;');
            try {
                await client.query(`SELECT public.${fn.name}(${fn.args});`);
                console.log(`  - Call as non-admin JWT: FAIL (Allowed execution)`);
            } catch (err) {
                console.log(`  - Call as non-admin JWT: PASS (Blocked with: ${err.message})`);
            }
            await client.query('ROLLBACK TO SAVEPOINT sp_jwt;');

            // Reset state
            await client.query('RESET ROLE;');
            await client.query('SET LOCAL request.jwt.claims = DEFAULT;');
        }

        console.log('\nRollbacking database transaction to maintain state clean.');
        await client.query('ROLLBACK;');

    } catch (err) {
        console.error('❌ Error during verification:', err);
        try {
            await client.query('ROLLBACK;');
        } catch (_) {}
    } finally {
        await client.end();
    }
}

run();
