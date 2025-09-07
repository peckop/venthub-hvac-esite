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
  client: { from: (table: string) => { insert: (rows: unknown | unknown[]) => Promise<{ error: unknown | null }> } },
  input: AdminAuditLogInput | AdminAuditLogInput[]
): Promise<void> {
  try {
    const rows = Array.isArray(input) ? input : [input]
    const { error } = await client.from('admin_audit_log').insert(rows)
    if (error) {
      // eslint-disable-next-line no-console
      console.warn('audit log insert failed', error)
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('audit log insert exception', e)
  }
}

