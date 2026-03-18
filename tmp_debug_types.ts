
import { createClient } from '@supabase/supabase-js'
import { Database } from './src/types/database.types'

const supabase = createClient<Database>('https://example.com', 'key')

async function test() {
  const { data } = await supabase.from('shopping_carts').insert({ user_id: '123' })
  console.log(data)
}
