import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminPermissionError, mutateWithAudit } from '../mutateWithAudit'

// logAdminAction'ı mock'la — gerçek audit_log yazımı yapılmasın
const audit = vi.hoisted(() => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/audit', () => audit)

// DI sözleşmesini gerçek tiple doğrula (`{} as never` değil)
const fakeSupabase = {} as import('@supabase/supabase-js').SupabaseClient<
  import('@/types/database.types').Database
>

describe('mutateWithAudit (K3 gate + K4 audit)', () => {
  beforeEach(() => audit.logAdminAction.mockClear())

  it('K3: canWrite=false → fn ÇALIŞMADAN AdminPermissionError, audit YOK', async () => {
    const fn = vi.fn()
    await expect(
      mutateWithAudit(fakeSupabase, {
        resource: 'products',
        canWrite: false,
        action: 'DELETE',
        rowPk: 'p1',
        before: { id: 'p1' },
        after: null,
        fn,
      }),
    ).rejects.toBeInstanceOf(AdminPermissionError)
    expect(fn).not.toHaveBeenCalled()
    expect(audit.logAdminAction).not.toHaveBeenCalled()
  })

  it('K4: başarılı mutasyon sonrası logAdminAction (before/after iz)', async () => {
    const fn = vi.fn().mockResolvedValue({ ok: true })
    const r = await mutateWithAudit(fakeSupabase, {
      resource: 'coupons',
      canWrite: true,
      action: 'UPDATE',
      rowPk: 'c1',
      before: { is_active: false },
      after: { is_active: true },
      fn,
    })
    expect(r).toEqual({ ok: true })
    expect(audit.logAdminAction).toHaveBeenCalledWith(
      fakeSupabase,
      expect.objectContaining({
        table_name: 'coupons',
        row_pk: 'c1',
        action: 'UPDATE',
        before: { is_active: false },
        after: { is_active: true },
      }),
    )
  })

  it('K4: audit hatası fn sonucunu BLOKLAMAZ (non-fatal)', async () => {
    audit.logAdminAction.mockRejectedValueOnce(new Error('audit down'))
    const r = await mutateWithAudit(fakeSupabase, {
      resource: 'products',
      canWrite: true,
      action: 'INSERT',
      rowPk: null,
      before: null,
      after: { id: 'x' },
      fn: async () => 'done',
    })
    expect(r).toBe('done')
  })

  it('[ADV-1#6] auditedByEdge=true → çift-log önlenir (logAdminAction ATLANIR)', async () => {
    const r = await mutateWithAudit(fakeSupabase, {
      resource: 'coupons',
      canWrite: true,
      action: 'INSERT',
      rowPk: 'c2',
      before: null,
      after: { code: 'X' },
      auditedByEdge: true,
      fn: async () => 'edge-ok',
    })
    expect(r).toBe('edge-ok')
    expect(audit.logAdminAction).not.toHaveBeenCalled()
  })
})
