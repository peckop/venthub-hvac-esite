import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useAdminTable } from '../useAdminTable'

// Hook next/navigation + supabase browser client'i import eder → mock'la
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/admin/test',
}))
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: {} }))

interface Row {
  id: string
  n: number
  name: string
}

describe('useAdminTable — sortMode tek-taraf (anti-bug) + selection + pageCount', () => {
  it("server: toggleSort fetcher'ı yeni sort ile çağırır, rows'u CLIENT sıralamaz", async () => {
    const rows: Row[] = [
      { id: 'b', n: 2, name: 'b' },
      { id: 'a', n: 1, name: 'a' },
    ] // kasıtlı sırasız
    const fetcher = vi.fn().mockResolvedValue({ rows, totalMatched: 2 })

    const { result } = renderHook(() =>
      useAdminTable<Row>({
        resource: 'test',
        rowId: (r) => r.id,
        fetcher,
        sortMode: 'server',
        paginationMode: 'server',
        syncUrl: false,
      }),
    )

    await waitFor(() => expect(result.current.rows.length).toBe(2))

    await act(async () => {
      result.current.sorting.toggleSort('n')
    })

    await waitFor(() =>
      expect(fetcher).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({ sort: { key: 'n', dir: 'asc' } }),
      ),
    )
    // server-mode: kit rows'u client-side SIRALAMAZ → server sırası korunur
    expect(result.current.rows.map((r) => r.id)).toEqual(['b', 'a'])
  })

  it('shift-aralık: toggle(id,{shiftKey}) ardışık aralığı seçer', async () => {
    const rows: Row[] = [
      { id: 'a', n: 1, name: 'a' },
      { id: 'b', n: 2, name: 'b' },
      { id: 'c', n: 3, name: 'c' },
    ]
    const fetcher = vi.fn().mockResolvedValue({ rows, totalMatched: 3 })

    const { result } = renderHook(() =>
      useAdminTable<Row>({
        resource: 'test',
        rowId: (r) => r.id,
        fetcher,
        paginationMode: 'none',
        sortMode: 'none',
        syncUrl: false,
      }),
    )

    await waitFor(() => expect(result.current.rows.length).toBe(3))

    await act(async () => {
      result.current.selection.toggle('a')
    })
    await act(async () => {
      result.current.selection.toggle('c', { shiftKey: true })
    })

    expect([...result.current.selection.selectedIds].sort()).toEqual(['a', 'b', 'c'])
  })

  it('pageCount = ceil(totalMatched/pageSize) (client-süzme sonrası doğru) [ADV-1#1]', async () => {
    const rows: Row[] = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, n: i, name: `r${i}` }))
    const fetcher = vi.fn().mockResolvedValue({ rows, totalMatched: 95 }) // server düzeltilmiş total

    const { result } = renderHook(() =>
      useAdminTable<Row>({
        resource: 'test',
        rowId: (r) => r.id,
        fetcher,
        pageSize: 50,
        paginationMode: 'server',
        sortMode: 'server',
        syncUrl: false,
      }),
    )

    await waitFor(() => expect(result.current.totalMatched).toBe(95))
    expect(result.current.pagination.pageCount).toBe(2)
  })
})
