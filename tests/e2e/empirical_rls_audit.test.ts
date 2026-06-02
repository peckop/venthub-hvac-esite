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

describe('Empirical RLS Policy Auditing', () => {
  it('should inspect all tables and verify RLS and policy configurations', async () => {
    const connectionString = getDatabaseUrl()
    const client = new pg.Client({ connectionString })
    await client.connect()

    try {
      // 1. Fetch RLS status for all tables in the public schema
      const tablesRes = await client.query(`
        SELECT 
          c.relname AS table_name,
          c.relrowsecurity AS rls_enabled,
          c.relforcerowsecurity AS rls_forced
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relkind = 'r'
        ORDER BY c.relname;
      `)

      console.log(`\nFound ${tablesRes.rows.length} tables in public schema:`)
      const nonRlsTables: string[] = []

      for (const row of tablesRes.rows) {
        console.log(`- Table: ${row.table_name} | RLS Enabled: ${row.rls_enabled} | RLS Forced: ${row.rls_forced}`)
        if (!row.rls_enabled) {
          nonRlsTables.push(row.table_name)
        }
      }

      console.log(`\nTables with RLS DISABLED (CRITICAL CHECK):`, nonRlsTables)

      // 2. Fetch all policy definitions
      const policiesRes = await client.query(`
        SELECT 
          schemaname,
          tablename,
          policyname,
          roles,
          cmd,
          qual as using_expr,
          with_check as check_expr
        FROM pg_catalog.pg_policies
        WHERE schemaname = 'public'
        ORDER BY tablename, policyname;
      `)

      console.log(`\nFound ${policiesRes.rows.length} RLS policies:`)
      
      const suspiciousPolicies: any[] = []

      for (const row of policiesRes.rows) {
        console.log(`-------------------------------------------`)
        console.log(`Table: ${row.tablename} | Policy: ${row.policyname}`)
        console.log(`Cmd: ${row.cmd} | Roles: ${row.roles}`)
        console.log(`USING Expr: ${row.using_expr}`)
        console.log(`WITH CHECK Expr: ${row.check_expr}`)
        
        // Analyze if the policy checks auth.role() = 'authenticated' without safety,
        // or uses other expressions that might be bypassed by NULL
        const expr = `${row.using_expr || ''} ${row.check_expr || ''}`.toLowerCase()
        
        // Let's identify if any policy uses auth.uid() or auth.role() without being TO authenticated or TO service_role
        // E.g., if roles is {public} (which means ALL, including anon), and it doesn't check if user is not null.
        const isPermissiveToPublic = row.roles.includes('public')
        const checksUid = expr.includes('auth.uid()')
        
        // If it allows "public" role (all users) and checks identity via auth.uid() = column:
        // is there a case where column is NULL and auth.uid() is NULL, so NULL = NULL ?
        // In SQL, NULL = NULL evaluates to NULL (which is false in policy check), so that is safe!
        // But what about other expressions? E.g. column IS NULL?
        // Or if it checks roles using is_admin_user() or custom checks.
        
        if (expr.includes('auth.role()') && !expr.includes('coalesce')) {
          console.log(`  ⚠️ Warning: Policy uses auth.role() without COALESCE`)
          suspiciousPolicies.push({ table: row.tablename, policy: row.policyname, reason: 'auth.role() without COALESCE' })
        }
      }

      console.log(`\nSuspicious Policies:`, suspiciousPolicies)

      // Verify that critical tables like user_profiles and products have RLS enabled
      expect(nonRlsTables).not.toContain('user_profiles')
      expect(nonRlsTables).not.toContain('products')
      
    } finally {
      await client.end()
    }
  })
})
