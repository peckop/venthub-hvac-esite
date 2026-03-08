
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function probe() {
    const candidates = ['exec_sql', 'execute_sql', 'run_sql', 'exec'];

    for (const fn of candidates) {
        console.log(`Probing rpc('${fn}')...`);
        const { data, error } = await supabase.rpc(fn, { query: 'SELECT 1' });
        // Note: Parameter name might be 'sql', 'query', 'command' etc. 
        // This is a hail mary.

        // Try with 'sql' param just in case
        const { data: data2, error: error2 } = await supabase.rpc(fn, { sql: 'SELECT 1' });

        if (!error || !error2) {
            console.log(`✅ FOUND FUNCTION: ${fn}`);
            process.exit(0);
        } else {
            console.log(`❌ ${fn} failed:`, error?.message || error2?.message);
        }
    }
    console.log('No SQL execution function found.');
}

probe();
