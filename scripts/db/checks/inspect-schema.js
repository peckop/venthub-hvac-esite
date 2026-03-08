
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Inspecting Categories Metadata ---');
    const { data: cats, error: catError } = await supabase
        .from('categories')
        .select('name, metadata')
        .limit(3);

    if (catError) console.error(catError);
    else {
        cats.forEach(c => {
            console.log(`Category: ${c.name}`);
            console.log('Metadata:', JSON.stringify(c.metadata, null, 2));
            console.log('---');
        });
    }

    console.log('\n--- Inspecting Products Technical Specs ---');
    const { data: prods, error: prodError } = await supabase
        .from('products')
        .select('name, technical_specs')
        .limit(3);

    if (prodError) console.error(prodError);
    else {
        prods.forEach(p => {
            console.log(`Product: ${p.name}`);
            console.log('Technical Specs:', JSON.stringify(p.technical_specs, null, 2));
            console.log('---');
        });
    }
}

inspect();
