import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function queryFunctionSignatures() {
    const functionNames = [
        'reverse_inventory_batch',
        'bump_rate_limit',
        'enforce_role_change',
        'update_updated_at_column'
    ]

    console.log('Querying function signatures from pg_proc...\n')

    for (const funcName of functionNames) {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
                SELECT 
                    p.proname as name,
                    pg_get_function_identity_arguments(p.oid) as args,
                    p.prosecdef as security_definer,
                    p.proconfig as config
                FROM pg_proc p
                JOIN pg_namespace n ON p.pronamespace = n.oid
                WHERE n.nspname = 'public'
                AND p.proname = '${funcName}'
            `
        })

        if (error) {
            // Try alternative query
            const { data: data2, error: error2 } = await supabase
                .from('_metadata')
                .select('*')
                .limit(1)

            console.log(`${funcName}: Error querying - trying direct SQL...`)

            // Use raw fetch instead
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseServiceKey,
                    'Authorization': `Bearer ${supabaseServiceKey}`
                },
                body: JSON.stringify({
                    sql: `SELECT proname, pg_get_function_identity_arguments(oid) as args FROM pg_proc WHERE proname = '${funcName}' AND pronamespace = 'public'::regnamespace`
                })
            })

            const result = await response.json()
            console.log(`${funcName}:`, result)
        } else {
            console.log(`${funcName}:`, data)
        }
    }
}

queryFunctionSignatures().catch(console.error)
