import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null

async function run() {
    const { count: countAnon, error: errAnon } = await supabaseAnon.from('products').select('id', { count: 'exact', head: true })

    let countAdmin, errAdmin
    if (supabaseAdmin) {
        const res = await supabaseAdmin.from('products').select('id', { count: 'exact', head: true })
        countAdmin = res.count
        errAdmin = res.error
    }

    const out = `ANON COUNT: ${countAnon} ERR: ${errAnon?.message}\nADMIN COUNT: ${countAdmin} ERR: ${errAdmin?.message}`
    fs.writeFileSync('test_products_out.txt', out)
    console.log('DONE')
}

run()
