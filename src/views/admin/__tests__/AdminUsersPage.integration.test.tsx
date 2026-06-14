import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'

import { testA11y } from '@/utils/testA11y'

import AdminUsersPage from '../AdminUsersPage'

/* ---- mock'lar (kaynak '../../' importları @/ ile aynı dosyaya çözülür) ---- */
const sb = vi.hoisted(() => {
  const adminUsers = [
    {
      id: 'u1',
      email: 'admin@venthub.com',
      full_name: 'Admin One',
      phone: null,
      role: 'admin',
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'u2',
      email: 'super@venthub.com',
      full_name: 'Super User',
      phone: null,
      role: 'super_admin',
      created_at: '2026-02-01T00:00:00.000Z',
      updated_at: '2026-02-01T00:00:00.000Z',
    },
  ]
  // all-tab kaynağı: from('user_profiles').select('id, role, created_at, full_name') doğrudan await edilir
  const allProfiles = [
    { id: 'u1', role: 'admin', created_at: '2026-01-01T00:00:00.000Z', full_name: 'Admin One' },
    { id: 'u3', role: 'user', created_at: '2026-03-01T00:00:00.000Z', full_name: 'Normal Kullanici' },
  ]
  /* selectChain çift kaynağı kapsar:
     - admins-tab: .select('id, full_name').in('id', ids)  → enrich promise
     - all-tab:    await .select('id, role, created_at, full_name')  → thenable {data, error} */
  const selectChain = {
    in() {
      return Promise.resolve({
        data: adminUsers.map((u) => ({ id: u.id, full_name: u.full_name })),
        error: null,
      })
    },
    then(resolve: (v: { data: unknown; error: null }) => unknown, reject?: (e: unknown) => unknown) {
      return Promise.resolve({ data: allProfiles, error: null }).then(resolve, reject)
    },
  }
  const client = {
    from() {
      return {
        select() {
          return selectChain
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
  return { adminUsers, allProfiles, client }
})

vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: sb.client }))
vi.mock('@/config/admin', () => ({
  listAdminUsers: () => Promise.resolve(sb.adminUsers),
  setUserAdminRole: () => Promise.resolve(true),
}))
vi.mock('@/lib/audit', () => ({ logAdminAction: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/ensureSessionFresh', () => ({ ensureSessionFresh: () => Promise.resolve() }))
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, loading: false, role: 'admin', roleLoading: false }),
}))
vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({ canWrite: () => true, canAccess: () => true, isReadOnly: false, role: 'admin', loading: false, roleLoading: false }),
}))
vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({ t: (k: string) => k, lang: 'tr' }),
}))
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/users',
}))

describe('AdminUsersPage (kit göçü) — integration + a11y', () => {
  it('admin kullanıcılarını render eder + sıralanabilir başlıkta aria-sort taşır', async () => {
    render(<AdminUsersPage />)
    // admins-tab fetcher çözülünce satırlar görünür
    await screen.findByText('admin@venthub.com')
    await screen.findByText('super@venthub.com')

    const headers = screen.getAllByRole('columnheader')
    // initialSort created_at:desc → 'Kayıt' başlığı aria-sort='descending' taşır
    expect(headers.some((h) => h.getAttribute('aria-sort') === 'descending')).toBe(true)
  })

  it('"Tümü" sekmesine geçince user_profiles kaynağını yükler', async () => {
    render(<AdminUsersPage />)
    await screen.findByText('admin@venthub.com')

    fireEvent.click(screen.getByText('admin.users.tabs.all'))
    // all-tab fetcher (thenable select) çözülünce profil görünür
    await screen.findByText('Normal Kullanici')
  })

  it('a11y ihlali yok (axe 0)', async () => {
    const { container } = render(<AdminUsersPage />)
    await screen.findByText('admin@venthub.com')
    const results = await testA11y(container)
    expect(results).toHaveNoViolations()
  })
})
