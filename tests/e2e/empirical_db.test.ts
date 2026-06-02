/// <reference types="node" />
import { describe, it, expect } from 'vitest'
import pg from 'pg'
import * as fs from 'fs'
import * as path from 'path'

// Helper to parse .env file
function getDatabaseUrl(): string {
  const envPath = path.resolve(process.cwd(), '.env')
  const envContent = fs.readFileSync(envPath, 'utf8')
  const match = envContent.match(/^DATABASE_URL=(.+)$/m)
  if (!match) {
    throw new Error('DATABASE_URL not found in .env')
  }
  return match[1].trim()
}

describe('Empirical Source Definition Dumper', () => {
  it('dump function definitions', async () => {
    const connectionString = getDatabaseUrl()
    const client = new pg.Client({ connectionString })
    await client.connect()

    const targetFunctions = [
      'update_inventory_settings',
      'update_inventory_thresholds',
      'adjust_stock_v2',
      'set_user_role',
      'is_user_admin',
      'is_admin_user',
      'user_invoice_profiles_ensure_single_default',
      'process_order_stock_reduction',
      'increment_coupon_usage'
    ]

    try {
      for (const name of targetFunctions) {
        const res = await client.query(`
          SELECT 
            p.proname AS name,
            pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
            pg_catalog.pg_get_functiondef(p.oid) AS definition
          FROM pg_catalog.pg_proc p
          LEFT JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public'
            AND p.proname = $1;
        `, [name])

        for (const row of res.rows) {
          console.log(`\n===========================================`)
          console.log(`FUNCTION: ${row.name}(${row.arguments})`)
          console.log(`===========================================`)
          console.log(row.definition)
        }
      }
    } finally {
      await client.end()
    }
  })
})
