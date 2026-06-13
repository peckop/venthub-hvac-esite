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

/**
 * Records an administrative action (INSERT, UPDATE, DELETE, or CUSTOM) into the system's audit log.
 * Automatically resolves the acting user ID from the active session if one is not explicitly provided in the payload.
 *
 * @param client - The active Supabase client instance.
 * @param input - A single audit log payload or an array of payloads to insert.
 * @returns A promise that resolves when the insertion attempt is complete.
 * @throws Never throws; network and validation errors are silently caught and logged via console.warn to prevent disrupting admin workflows.
 *
 * @example
 * await logAdminAction(supabase, {
 *   table_name: 'venthub_orders',
 *   action: 'UPDATE',
 *   row_pk: 'order-123',
 *   comment: 'status changed to processed'
 * });
 */
export async function logAdminAction(
  client: SupabaseClient,
  input: AdminAuditLogInput | AdminAuditLogInput[]
): Promise<void> {
  try {
    const rows = Array.isArray(input) ? input : [input]

    // Best-effort: get current user id to set actor if not provided
    let userId: string | null = null
    try {
      // Prefer session for reliability; fall back to getUser
      const { data: sessData } = await client.auth.getSession()
      userId = sessData?.session?.user?.id ?? null
      if (!userId) {
        const { data } = await client.auth.getUser()
        userId = data?.user?.id ?? null
      }
    } catch {
      userId = null
    }

    const prepared = rows.map((r) => {
      // Only set actor if not explicitly provided
      const hasActor = Object.prototype.hasOwnProperty.call(r, 'actor') && r.actor != null
      return hasActor ? r : { ...r, actor: userId }
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
