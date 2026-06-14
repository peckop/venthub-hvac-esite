import type { SupabaseClient } from '@supabase/supabase-js'

import { logAdminAction } from '@/lib/audit'
import type { Database } from '@/types/database.types'

/**
 * Admin mutasyon eylemi — audit `action` alanına maplenir.
 * (audit.ts `AdminAuditAction`'ın yazma alt-kümesi; 'CUSTOM' mutasyon değildir.)
 */
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE'

/**
 * RBAC katman-2 ihlali — yazma yetkisi olmadan mutasyon denendi.
 * {@link mutateWithAudit}, `fn`'i ÇALIŞTIRMADAN bunu fırlatır (K3).
 */
export class AdminPermissionError extends Error {
  constructor(resource: string) {
    super(`RBAC: '${resource}' kaynağında yazma yetkisi yok`)
    this.name = 'AdminPermissionError'
  }
}

export interface MutateWithAuditArgs<R> {
  /** audit `table_name` + RBAC mesajı (ör. 'products', 'coupons') */
  resource: string
  /** RBAC katman-2 — false ise `fn` ÇALIŞMADAN {@link AdminPermissionError} (K3) */
  canWrite: boolean
  action: AuditAction
  /** tekil işlemde satır PK; toplu işlemde null */
  rowPk: string | null
  /** serileştirilebilir audit payload (`any` yerine sıkı tip) */
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  comment?: string
  /**
   * Edge-function yolu KENDİ audit'ini yazıyorsa `true` ver:
   * mutateWithAudit `logAdminAction`'ı ATLAR (çift-log önlenir, [ADV-1#6]).
   */
  auditedByEdge?: boolean
  /** asıl mutasyon — `supabase`'i closure'dan kullanır (DI) */
  fn: () => Promise<R>
}

/**
 * K3 (yetki) + K4 (audit) için **tek kapı**. Tüm admin yazma yolları buradan geçmeli.
 *
 * Sıra: `canWrite` gate → `fn()` → (`auditedByEdge` ? atla : `logAdminAction`).
 * Audit hatası `fn` sonucunu **bloklamaz** (best-effort; `console.error`'a yazılır).
 *
 * NOT: Asıl yetki kapısı sunucudaki **RLS**'tir (K3 katman-3). Bu fonksiyon, istemci-tarafı
 * guard'ı (kozmetik) + denetim izidir; RLS'in yerine geçmez.
 */
export async function mutateWithAudit<R>(
  supabase: SupabaseClient<Database>,
  args: MutateWithAuditArgs<R>,
): Promise<R> {
  if (!args.canWrite) {
    throw new AdminPermissionError(args.resource)
  }

  const result = await args.fn()

  if (!args.auditedByEdge) {
    try {
      await logAdminAction(supabase, {
        table_name: args.resource,
        row_pk: args.rowPk,
        action: args.action,
        before: args.before,
        after: args.after,
        comment: args.comment,
      })
    } catch (e) {
      console.error('[mutateWithAudit] audit log failed (non-fatal):', e)
    }
  }

  return result
}
