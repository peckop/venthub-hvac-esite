import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../..');

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

    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database for auditing.\n');

        let allPassed = true;

        // ==========================================
        // R1: RLS recursion loop fixed & tenant isolation
        // ==========================================
        console.log('--- R1: user_profiles RLS & is_admin_user() ---');
        const r1PolicyRes = await client.query(`
            SELECT policyname, roles, cmd, qual 
            FROM pg_policies 
            WHERE tablename = 'user_profiles' AND schemaname = 'public';
        `);
        console.log('Found policies on public.user_profiles:');
        r1PolicyRes.rows.forEach(r => {
            console.log(`- Policy: ${r.policyname}, Roles: ${r.roles}, Cmd: ${r.cmd}, Qual: ${r.qual}`);
        });

        const r1FuncRes = await client.query(`
            SELECT prosecdef, proconfig, prosrc 
            FROM pg_proc JOIN pg_namespace n ON n.oid = pronamespace 
            WHERE proname = 'is_admin_user' AND n.nspname = 'public';
        `);
        if (r1FuncRes.rows.length > 0) {
            const f = r1FuncRes.rows[0];
            const isSecDef = f.prosecdef;
            const searchPath = f.proconfig ? f.proconfig.find(c => c.startsWith('search_path=')) : null;
            const hasRecursionFreeFallback = f.prosrc.includes('claims ->> \'user_role\'') || f.prosrc.includes('auth.role() = \'service_role\'');
            console.log(`- is_admin_user() Security Definer: ${isSecDef ? 'PASS' : 'FAIL'}`);
            console.log(`- is_admin_user() search_path config: ${searchPath ? 'PASS (' + searchPath + ')' : 'FAIL'}`);
            console.log(`- is_admin_user() logic check: ${hasRecursionFreeFallback ? 'PASS' : 'FAIL'}`);
            if (!isSecDef || !searchPath || !hasRecursionFreeFallback) allPassed = false;
        } else {
            console.log('- Function public.is_admin_user() not found! FAIL');
            allPassed = false;
        }
        console.log();

        // ==========================================
        // R2: GraphQL schema disabled on 32 sensitive tables
        // ==========================================
        console.log('--- R2: GraphQL Comments on Tables/Views ---');
        const sensitiveTables = [
            'user_profiles', 'wizard_selections', 'venthub_orders', 'venthub_order_items', 'admin_users',
            'admin_audit_log', 'cart_items', 'category_mapping_rules', 'client_errors', 'contact_messages',
            'coupons', 'error_groups', 'inventory_movements', 'inventory_settings', 'order_attachments',
            'order_email_events', 'order_notes', 'order_refund_events', 'organizations', 'payment_transactions',
            'product_authorities', 'project_items', 'rate_limits', 'returns_webhook_events', 'shipping_email_events',
            'shipping_idempotency', 'shipping_webhook_events', 'shopping_carts', 'site_settings', 'user_addresses',
            'user_invoice_profiles', 'user_projects', 'venthub_returns'
        ];
        const r2CommentsRes = await client.query(`
            SELECT c.relname, d.description
            FROM pg_class c
            LEFT JOIN pg_description d ON d.objoid = c.oid AND d.objsubid = 0
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE n.nspname = 'public' AND c.relname = ANY($1);
        `, [sensitiveTables]);

        const disabledTables = [];
        r2CommentsRes.rows.forEach(r => {
            const desc = r.description || '';
            const isDisabled = desc.includes('@graphql({"disabled": true})');
            if (isDisabled) {
                disabledTables.push(r.relname);
            } else {
                console.log(`- Table ${r.relname} comment: "${desc}" -> FAIL (missing GraphQL disable comment)`);
            }
        });
        console.log(`Disabled GraphQL on ${disabledTables.length} / ${sensitiveTables.length} tables/views.`);
        if (disabledTables.length >= 32) {
            console.log('- GraphQL disable check: PASS');
        } else {
            console.log('- GraphQL disable check: FAIL');
            allPassed = false;
        }
        console.log();

        // ==========================================
        // R3: Storage bucket list policy
        // ==========================================
        console.log('--- R3: Storage Policy for product-images ---');
        const storagePoliciesRes = await client.query(`
            SELECT policyname, roles, cmd, qual 
            FROM pg_policies 
            WHERE tablename = 'objects' AND schemaname = 'storage';
        `);
        let r3Pass = false;
        storagePoliciesRes.rows.forEach(p => {
            console.log(`- Policy: ${p.policyname}, Roles: ${p.roles}, Cmd: ${p.cmd}, Qual: ${p.qual}`);
            if (p.policyname === 'product_images_select_tenant') {
                const isAuthOnly = p.roles.includes('authenticated') && !p.roles.includes('public') && !p.roles.includes('anon');
                const hasTenantIsolation = p.qual.includes('jwt_tenant_id()') && p.qual.includes('split_part');
                if (isAuthOnly && hasTenantIsolation) {
                    r3Pass = true;
                }
            }
        });
        console.log(`- Storage Tenant RLS Policy verification: ${r3Pass ? 'PASS' : 'FAIL'}`);
        if (!r3Pass) allPassed = false;
        console.log();

        // ==========================================
        // R4: Duplicate Policies Check
        // ==========================================
        console.log('--- R4: Duplicate Policies Check ---');
        const duplicateRes = await client.query(`
            SELECT tablename, policyname, count(*) 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            GROUP BY tablename, policyname 
            HAVING count(*) > 1;
        `);
        if (duplicateRes.rows.length === 0) {
            console.log('- No duplicate policy names found in public schema: PASS');
        } else {
            console.log('- Duplicate policy names found! FAIL');
            duplicateRes.rows.forEach(r => {
                console.log(`  * Table: ${r.tablename}, Policy: ${r.policyname}, Count: ${r.count}`);
            });
            allPassed = false;
        }
        console.log();

        // ==========================================
        // R5: Webhook search_path lock
        // ==========================================
        console.log('--- R5: handle_supabase_webhook search_path ---');
        const r5FuncRes = await client.query(`
            SELECT proname, proconfig 
            FROM pg_proc JOIN pg_namespace n ON n.oid = pronamespace 
            WHERE proname = 'handle_supabase_webhook' AND n.nspname = 'public';
        `);
        if (r5FuncRes.rows.length > 0) {
            const config = r5FuncRes.rows[0].proconfig || [];
            const searchPath = config.find(c => c.startsWith('search_path='));
            console.log(`- handle_supabase_webhook proconfig: ${JSON.stringify(config)}`);
            if (searchPath && (searchPath.includes('pg_catalog') && searchPath.includes('public') && searchPath.includes('net'))) {
                console.log('- search_path lock: PASS');
            } else {
                console.log('- search_path lock: FAIL');
                allPassed = false;
            }
        } else {
            console.log('- handle_supabase_webhook function not found! FAIL');
            allPassed = false;
        }
        console.log();

        // ==========================================
        // R6: custom_access_token_hook grants
        // ==========================================
        console.log('--- R6: custom_access_token_hook grants ---');
        const r6AuthCheck = await client.query(`
            SELECT 
                has_function_privilege('anon', 'public.custom_access_token_hook(jsonb)', 'EXECUTE') as anon_exec,
                has_function_privilege('authenticated', 'public.custom_access_token_hook(jsonb)', 'EXECUTE') as auth_exec,
                has_function_privilege('supabase_auth_admin', 'public.custom_access_token_hook(jsonb)', 'EXECUTE') as admin_exec;
        `);
        if (r6AuthCheck.rows.length > 0) {
            const r = r6AuthCheck.rows[0];
            console.log(`- Anon execute: ${r.anon_exec ? 'FAIL' : 'PASS'}`);
            console.log(`- Authenticated execute: ${r.auth_exec ? 'FAIL' : 'PASS'}`);
            console.log(`- supabase_auth_admin execute: ${r.admin_exec ? 'PASS' : 'FAIL'}`);
            if (r.anon_exec || r.auth_exec || !r.admin_exec) {
                allPassed = false;
            }
        } else {
            console.log('- Failed to run function privilege check for R6! FAIL');
            allPassed = false;
        }
        console.log();

        // ==========================================
        // R7: Revoke execution on 30 functions
        // ==========================================
        console.log('--- R7: EXECUTE Revocation on 30 security definer functions ---');
        // RLS helpers (allow authenticated/anon execution)
        // Public shop RPC (allow authenticated/anon execution)
        // Admin/Warehouse RPCs (allow authenticated, block anon execution)
        // Other sensitive functions (block authenticated and anon execution)
        const functionsToCheck = [
            { sig: 'adjust_stock(uuid, integer, text, uuid)', type: 'admin' },
            { sig: 'adjust_stock(uuid, integer, text)', type: 'admin' },
            { sig: 'adjust_stock_v2(uuid, integer)', type: 'sensitive' },
            { sig: 'admin_list_all_users()', type: 'sensitive' },
            { sig: 'admin_list_users()', type: 'admin' },
            { sig: 'enforce_role_change()', type: 'sensitive' },
            { sig: 'fn_admin_get_orders(text, text, text, integer)', type: 'sensitive' },
            { sig: 'fn_admin_update_order_status(text, text, text)', type: 'sensitive' },
            { sig: 'get_admin_users()', type: 'sensitive' },
            { sig: 'get_products_enriched(uuid[], integer, integer, text, text, text, numeric, numeric)', type: 'public_rpc' },
            { sig: 'get_user_role(uuid)', type: 'sensitive' },
            { sig: 'handle_new_user_metadata()', type: 'sensitive' },
            { sig: 'handle_new_user_profile()', type: 'sensitive' },
            { sig: 'handle_supabase_webhook()', type: 'sensitive' },
            { sig: 'increment_coupon_usage(text)', type: 'sensitive' },
            { sig: 'is_admin()', type: 'helper' },
            { sig: 'is_admin_user()', type: 'helper' },
            { sig: 'is_staff_user()', type: 'helper' },
            { sig: 'is_user_admin(uuid)', type: 'helper' },
            { sig: 'jwt_tenant_id()', type: 'helper' },
            { sig: 'process_order_stock_reduction(text)', type: 'sensitive' },
            { sig: 'reverse_inventory_batch(uuid, integer)', type: 'sensitive' },
            { sig: 'reverse_inventory_batch(uuid)', type: 'sensitive' },
            { sig: 'set_stock(uuid, integer, text, uuid)', type: 'admin' },
            { sig: 'set_stock(uuid, integer, text)', type: 'admin' },
            { sig: 'set_user_admin_role(uuid, text)', type: 'admin' },
            { sig: 'set_user_role(uuid, text)', type: 'sensitive' },
            { sig: 'update_inventory_settings(integer)', type: 'sensitive' },
            { sig: 'update_inventory_thresholds(integer, boolean)', type: 'sensitive' },
            { sig: 'user_invoice_profiles_ensure_single_default()', type: 'sensitive' }
        ];

        let r7Pass = true;
        for (const fn of functionsToCheck) {
            const res = await client.query(`
                SELECT 
                    has_function_privilege('anon', 'public.${fn.sig}', 'EXECUTE') as anon_exec,
                    has_function_privilege('authenticated', 'public.${fn.sig}', 'EXECUTE') as auth_exec;
            `);
            const r = res.rows[0];
            if (fn.type === 'helper' || fn.type === 'public_rpc') {
                // RLS Helpers and Public RPCs must keep execute for public roles
                if (!r.anon_exec || !r.auth_exec) {
                    console.log(`- Helper/Public RPC ${fn.sig} has missing EXECUTE grants: anon=${r.anon_exec}, auth=${r.auth_exec} -> FAIL`);
                    r7Pass = false;
                }
            } else if (fn.type === 'admin') {
                // Admin/Warehouse RPCs are callable by authenticated (guarded internally by role checks) but blocked for anon
                if (r.anon_exec) {
                    console.log(`- Admin RPC ${fn.sig} has EXECUTE granted to anon -> FAIL`);
                    r7Pass = false;
                }
                if (!r.auth_exec) {
                    console.log(`- Admin RPC ${fn.sig} does not have EXECUTE granted to authenticated -> FAIL`);
                    r7Pass = false;
                }
            } else {
                // Sensitive functions must have execute completely revoked from public roles
                if (r.anon_exec || r.auth_exec) {
                    console.log(`- Sensitive function ${fn.sig} has EXECUTE granted: anon=${r.anon_exec}, auth=${r.auth_exec} -> FAIL`);
                    r7Pass = false;
                }
            }
        }
        console.log(`- Function execution privilege check: ${r7Pass ? 'PASS' : 'FAIL'}`);
        if (!r7Pass) allPassed = false;
        console.log();

        // ==========================================
        // R9: Obsolete Debug Functions
        // ==========================================
        console.log('--- R9: Debug Functions Dropped ---');
        const r9Res = await client.query(`
            SELECT count(*) FROM pg_proc WHERE proname IN ('debug_context', 'debug_policies_product_images');
        `);
        const debugFuncCount = parseInt(r9Res.rows[0].count, 10);
        console.log(`- Debug function count: ${debugFuncCount} (expected: 0)`);
        if (debugFuncCount === 0) {
            console.log('- Debug functions drop: PASS');
        } else {
            console.log('- Debug functions drop: FAIL');
            allPassed = false;
        }
        console.log();

        // ==========================================
        // R10: Restrict Anon SELECT Privileges
        // ==========================================
        console.log('--- R10: Anon SELECT privileges revoked on 35+ non-catalog tables/views ---');
        const anonTables = [
            'admin_audit_log', 'admin_users', 'cart_items', 'category_mapping_rules', 'client_errors',
            'contact_messages', 'coupons', 'error_groups', 'inventory_movements', 'inventory_settings',
            'inventory_summary', 'inventory_velocity', 'order_attachments', 'order_email_events', 'order_notes',
            'order_refund_events', 'organizations', 'payment_transactions', 'product_authorities', 'project_items',
            'rate_limits', 'returns_webhook_events', 'shipping_email_events', 'shipping_idempotency', 'shipping_webhook_events',
            'shopping_carts', 'site_settings', 'user_addresses', 'user_invoice_profiles', 'user_profiles',
            'user_projects', 'venthub_order_items', 'venthub_orders', 'venthub_returns', 'view_admin_orders',
            'wizard_selections'
        ];

        let r10Pass = true;
        for (const tbl of anonTables) {
            const tblCheck = await client.query(`
                SELECT has_table_privilege('anon', 'public.${tbl}', 'SELECT') as has_select;
            `);
            if (tblCheck.rows[0].has_select) {
                console.log(`- Table/View public.${tbl} is SELECTABLE by anon role -> FAIL`);
                r10Pass = false;
            }
        }
        console.log(`- Anon SELECT revocation verification: ${r10Pass ? 'PASS' : 'FAIL'}`);
        if (!r10Pass) allPassed = false;
        console.log();

        if (allPassed) {
            console.log('💯 ALL SECURITY HARDENING AUDIT CHECKS PASSED SUCCESSFULLY!');
        } else {
            console.log('❌ SOME SECURITY HARDENING AUDIT CHECKS FAILED!');
            process.exit(1);
        }

    } catch (err) {
        console.error('Audit execution error:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
