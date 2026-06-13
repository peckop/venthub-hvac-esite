import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminAuditLogPage from '../AdminAuditLogPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const auditData = [
    {
      id: 'a1',
      at: '2026-06-10T08:00:00.000Z',
      actor: 'admin@venthub.test',
      table_name: 'products',
      row_pk: 'p-123',
      action: 'UPDATE',
      comment: 'Fiyat güncellendi',
      before: { price: 100 },
      after: { price: 120 },
    },
    {
      id: 'a2',
      at: '2026-06-09T08:00:00.000Z',
      actor: 'admin@venthub.test',
      table_name: 'orders',
      row_pk: 'o-456',
      action: 'INSERT',
      comment: 'Yeni sipariş',
      before: null,
      after: { status: 'created' },
    },
  ]
  // server-mode zinciri: select(...).order(...).gte/lte/eq/or(...).range() → {data, count, error}
  const queryChain = {
    order() {
      return queryChain
    },
    gte() {
      return queryChain
    },
    lte() {
      return queryChain
    },
    eq() {
      return queryChain
    },
    or() {
      return queryChain
    },
    range() {
      return Promise.resolve({ data: auditData, count: auditData.length, error: null })
    },
  }
  const client = {
    from() {
      return {
        select() {
          return queryChain
        },
      }
    },
  }
  return { auditData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/audit',
}))

describe('AdminAuditLogPage (kit göçü) — integration + a11y', () => {
  it('denetim satırlarını render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminAuditLogPage />)
    // server fetcher çözülünce satırlar görünür
    await screen.findByText('Fiyat güncellendi')
    await screen.findByText('Yeni sipariş')

    const headers = screen.getAllByRole('columnheader')
    // initialSort at:desc → aktif sıralı başlık aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlık (action) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminAuditLogPage />)
    await screen.findByText('Fiyat güncellendi')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})
