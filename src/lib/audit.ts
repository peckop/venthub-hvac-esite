import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminAuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'CUSTOM'

export interface AdminAuditLogInput {
  table_name: string
  row_pk?: string | null
  action: AdminAuditAction
  before?: unknown
  after?: unknown
  comment?: string | null
}

// Lightweight helper; errors are swallowed on purpose to not block UI
export async function logAdminAction(
  client: SupabaseClient,
  input: AdminAuditLogInput | AdminAuditLogInput[]
): Promise<void> {
  try {
    const rows = Array.isArray(input) ? input : [input]
    // Chain .select() to satisfy TS and to ensure request executes immediately
    const { error } = await client.from('admin_audit_log').insert(rows).select('id')
    if (error) {
      console.warn('audit log insert failed', error)
    }
  } catch (e) {
    console.warn('audit log insert exception', e)
  }
}

