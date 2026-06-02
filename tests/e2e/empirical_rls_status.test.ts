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

describe('Empirical RLS Status Checklist', () => {
  it('should find any table with RLS disabled', async () => {
    const connectionString = getDatabaseUrl()
    const client = new pg.Client({ connectionString })
    await client.connect()

    try {
      const res = await client.query(`
        SELECT 
          c.relname AS table_name,
          c.relrowsecurity AS rls_enabled
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
        ORDER BY c.relname;
      `)

      const disabled = res.rows.filter(r => !r.rls_enabled).map(r => r.table_name)
      console.log(`RLS DISABLED TABLES:`, disabled)

      // Ensure critical tables have RLS enabled
      const criticalTables = ['user_profiles', 'products', 'venthub_orders', 'venthub_order_items', 'cart_items', 'inventory_movements']
      for (const table of criticalTables) {
        expect(disabled).not.toContain(table)
      }
    } finally {
      await client.end()
    }
  })
})
