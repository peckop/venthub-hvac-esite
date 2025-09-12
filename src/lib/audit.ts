import type { SupabaseClient } from '@supabase/supabase-js'

export type AdminAuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'CUSTOM'

export interface AdminAuditLogInput {
  table_name: string
  row_pk?: string | null
  action: AdminAuditAction
  before?: unknown
  after?: unknown
  comment?: string | null
  actor?: string | null // optional; auto-filled from auth if not provided
}

// Lightweight helper; errors are swallowed on purpose to not block UI
export async function logAdminAction(
  client: SupabaseClient,
  input: AdminAuditLogInput | AdminAuditLogInput[]
): Promise<void> {
  try {
    const rows = Array.isArray(input) ? input : [input]

    // Best-effort: get current user id to set actor if not provided
    let uid: string | null = null
    try {
      const { data } = await client.auth.getUser()
      uid = data?.user?.id ?? null
    } catch {
      uid = null
    }

    const prepared = rows.map((r) => {
      // Only set actor if not explicitly provided
      const hasActor = Object.prototype.hasOwnProperty.call(r, 'actor') && r.actor != null
      return hasActor ? r : { ...r, actor: uid }
    })

    // Chain .select() to satisfy TS and to ensure request executes immediately
    const { error } = await client.from('admin_audit_log').insert(prepared).select('id')
    if (error) {
      console.warn('audit log insert failed', error)
    }
  } catch (e) {
    console.warn('audit log insert exception', e)
  }
}

