import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { ConfirmProvider } from '@/components/admin/overlay/ConfirmProvider'
import { testA11y } from '@/utils/testA11y'

import AdminCategoriesPage from '../AdminCategoriesPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const categoriesData = [
    {
      id: 'cat-1',
      name: 'Fanlar',
      parent_id: null,
      slug: 'fanlar',
      is_active: true,
      sort_order: 1,
      level: 0,
      image_url: null,
      seo_title: null,
      seo_desc: null,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
      description: 'Endüstriyel fanlar',
      display_mode: null,
      is_featured: true,
      marketing_title: null,
      menu_label: null,
      metadata: null,
      translation_key: null,
      authority_content: null,
    },
    {
      id: 'cat-2',
      name: 'Klimalar',
      parent_id: null,
      slug: 'klimalar',
      is_active: true,
      sort_order: 2,
      level: 0,
      image_url: null,
      seo_title: null,
      seo_desc: null,
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
      description: 'Split klimalar',
      display_mode: null,
      is_featured: false,
      marketing_title: null,
      menu_label: null,
      metadata: null,
      translation_key: null,
      authority_content: null,
    },
  ]
  // .order('sort_order').order('name') → ikinci order() veriyi çözer
  const selectChain = {
    order() {
      return selectChain
    },
    then(
      resolve: (v: { data: typeof categoriesData; error: null }) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve({ data: categoriesData, error: null }).then(resolve, reject)
    },
  }
  const updateChain = {
    eq() {
      return Promise.resolve({ error: null })
    },
  }
  const deleteChain = {
    eq() {
      return Promise.resolve({ error: null })
    },
  }
  const client = {
    from() {
      return {
        select() {
          return selectChain
        },
        update() {
          return updateChain
        },
        delete() {
          return deleteChain
        },
      }
    },
    auth: {
      getSession() {
        return Promise.resolve({ data: { session: { user: { id: 'u1' } } } })
      },
      getUser() {
        return Promise.resolve({ data: { user: { id: 'u1' } } })
      },
    },
  }
  return { categoriesData, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/lib/audit', () => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/categories',
}))
// CategoryFormModal radix-dialog + react-hook-form taşır → testte no-op (kapalıyken DOM'a hiçbir şey basmaz)
vi.mock('@/components/admin/categories/CategoryFormModal', () => ({ default: () => null }))

describe('AdminCategoriesPage (kit göçü) — integration + a11y', () => {
  it('kategorileri render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(
    <ConfirmProvider>
      <AdminCategoriesPage />
    </ConfirmProvider>
  )
    // fetcher çözülünce satırlar görünür
    await screen.findByText('Fanlar')
    await screen.findByText('Klimalar')

    const headers = screen.getAllByRole('columnheader')
    // initialSort sort_order asc → aktif sıralı başlık aria-sort='ascending'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'ascending')).toBe(true)
    // diğer sıralanabilir başlıklar (name) aria-sort='none'
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'none')).toBe(true)
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(
    <ConfirmProvider>
      <AdminCategoriesPage />
    </ConfirmProvider>
  )
    await screen.findByText('Fanlar')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})
