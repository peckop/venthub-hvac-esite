import { act, renderHook, waitFor } from '@testing-library/react'
import { useMemo, useSyncExternalStore } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAdminTable } from '../useAdminTable'

/**
 * REC-411 — useAdminTable syncUrl=true davranışı, GERÇEKÇİ yönlendirici ile.
 *
 * Eski testlerin hepsi syncUrl:false idi (URL yazma/okuma effect çifti hiç koşmuyordu) ve
 * next/navigation mock'u `useSearchParams: () => new URLSearchParams()` döndürüyordu: URL hiç
 * değişmediği için yankı/döngü hatası yapısal olarak görünmezdi. Burada URL dış bir mağazada
 * durur, `router.replace` onu GECİKMELİ uygular (Next'te navigasyon geçiş içinde commit olur) ve
 * `useSearchParams` mağazaya abonedir; her `replace` çağrısı sayılır.
 */

const store = {
  search: '',
  listeners: new Set<() => void>(),
  replaceCalls: [] as string[],
  delayMs: 0,
}

function setSearch(next: string): void {
  store.search = next
  store.listeners.forEach((l) => l())
}

vi.mock('next/navigation', () => ({
  useSearchParams: () => {
    const s = useSyncExternalStore(
      (cb) => {
        store.listeners.add(cb)
        return () => store.listeners.delete(cb)
      },
      () => store.search,
      () => store.search,
    )
    // Next, aynı adres için AYNI nesneyi döndürür (useMemo); kimlik kararlılığı hook'un effect
    // bağımlılığını etkiler — her render'da yeni nesne vermek hatayı sahte üretirdi.
    return useMemo(() => new URLSearchParams(s), [s])
  },
  useRouter: () => routerSingleton,
  usePathname: () => '/admin/products',
}))
vi.mock('@/lib/supabase/client', () => ({ supabaseBrowserClient: {} }))

const routerSingleton = {
  replace: (href: string) => {
    store.replaceCalls.push(href)
    const q = href.includes('?') ? href.slice(href.indexOf('?') + 1) : ''
    setTimeout(() => setSearch(q), store.delayMs)
  },
  push: vi.fn(),
}

interface Row {
  id: string
}

function mount() {
  const fetcher = vi.fn().mockResolvedValue({ rows: [{ id: 'a' }], totalMatched: 1 })
  const hook = renderHook(() =>
    useAdminTable<Row>({
      resource: 'products',
      rowId: (r) => r.id,
      fetcher,
      paginationMode: 'server',
      sortMode: 'server',
      pageSize: 50,
      initialSort: { key: 'name', dir: 'asc' },
      syncUrl: true,
    }),
  )
  return { ...hook, fetcher }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

beforeEach(() => {
  store.search = ''
  store.replaceCalls = []
  store.delayMs = 0
  store.listeners.clear()
})

describe('REC-411 · useAdminTable syncUrl URL yazma/okuma döngüsü', () => {
  it('durum filtresi tek tıkla açılır: URL bir kez yazılır ve yerleşir', async () => {
    const { result } = mount()
    await waitFor(() => expect(result.current.rows.length).toBe(1))
    store.replaceCalls.length = 0

    await act(async () => {
      result.current.filtering.setFilter('status', ['inactive'])
    })
    await act(async () => {
      await sleep(80)
    })

    expect(store.replaceCalls.length).toBeLessThanOrEqual(1)
    expect(store.search).toContain('status=inactive')
    expect(result.current.filtering.filters.status).toEqual(['inactive'])
  })

  it.each([0, 5, 30])(
    'gecikmeli navigasyon (%i ms): açıp hemen kapatıp yeniden açmak sonsuz replace üretmez',
    async (delay) => {
      store.delayMs = delay
      const { result } = mount()
      await waitFor(() => expect(result.current.rows.length).toBe(1))
      await act(async () => {
        await sleep(delay + 30)
      })
      store.replaceCalls.length = 0

      await act(async () => {
        result.current.filtering.setFilter('status', ['inactive'])
      })
      await act(async () => {
        result.current.filtering.setFilter('status', [])
      })
      await act(async () => {
        result.current.filtering.setFilter('status', ['inactive'])
      })
      await act(async () => {
        await sleep(delay * 6 + 200)
      })

      // Yerleşmiş olmalı: bekleme sonunda replace SAYISI sabit (sınır cömert: 6)
      const settled = store.replaceCalls.length
      await act(async () => {
        await sleep(delay * 6 + 200)
      })
      expect(store.replaceCalls.length).toBe(settled)
      expect(settled).toBeLessThanOrEqual(6)
      expect(store.search).toContain('status=inactive')
    },
  )

  it('toplu işlem sonrası reload() URL yazmaz', async () => {
    const { result } = mount()
    await waitFor(() => expect(result.current.rows.length).toBe(1))
    await act(async () => {
      result.current.filtering.setFilter('status', ['inactive'])
      await sleep(60)
    })
    const before = store.replaceCalls.length
    await act(async () => {
      await result.current.reload()
      await sleep(60)
    })
    expect(store.replaceCalls.length).toBe(before)
  })

  it('geri/ileri (dış URL değişimi) state’i URL’den yeniler ve geri yazmaz', async () => {
    const { result } = mount()
    await waitFor(() => expect(result.current.rows.length).toBe(1))
    await act(async () => {
      result.current.filtering.setFilter('status', ['inactive'])
      await sleep(60)
    })
    store.replaceCalls.length = 0
    await act(async () => {
      setSearch('sort=name%3Aasc')
      await sleep(80)
    })
    expect(result.current.filtering.filters.status ?? []).toEqual([])
    expect(store.replaceCalls.length).toBe(0)
  })
})
