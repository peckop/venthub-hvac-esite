import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminErrorsPage from '../AdminErrorsPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const errorsData = [
    {
      id: 'e1',
      at: '2026-06-10T08:00:00.000Z',
      url: '/checkout',
      message: 'TypeError: x is undefined',
      stack: 'at foo (app.js:1)',
      user_agent: 'Mozilla/5.0',
      release: 'v1.2.3',
      env: 'production',
      level: 'error',
    },
    {
      id: 'e2',
      at: '2026-06-09T08:00:00.000Z',
      url: '/cart',
      message: 'Warning: slow render',
      stack: null,
      user_agent: 'Mozilla/5.0',
      release: 'v1.2.3',
      env: 'production',
      level: 'warn',
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
      return Promise.resolve({ data: errorsData, count: errorsData.length, error: null })
    },
  }
  const channel = {
    on() {
      return channel
    },
    subscribe() {
      return channel
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
    channel() {
      return channel
    },
    removeChannel() {},
  }
  return { errorsData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/hooks/useTenant', () => ({ useTenant: () => ({ id: 'tenant-1' }) }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => false, canAccess: () => true, isReadOnly: true, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/errors',
}))

describe('AdminErrorsPage (kit göçü) — integration + a11y', () => {
  it('hataları render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminErrorsPage />)
    // server fetcher çözülünce satırlar görünür
    await screen.findByText('TypeError: x is undefined')
    await screen.findByText('Warning: slow render')

    const headers = screen.getAllByRole('columnheader')
    // initialSort at:desc → aktif sıralı başlık aria-sort='descending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
    // diğer sıralanabilir başlık (level) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminErrorsPage />)
    await screen.findByText('TypeError: x is undefined')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})
