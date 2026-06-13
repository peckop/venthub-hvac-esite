'use client'

import type { SupabaseClient } from '@supabase/supabase-js'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { supabaseBrowserClient } from '@/lib/supabase/client'
import type { TableSortDir } from '@/types/admin-shared'
import type { Database } from '@/types/database.types'

export type AdminMode = 'server' | 'client' | 'none'

export interface SortState {
  key: string
  dir: TableSortDir
}

/** fetcher'a geçen normalize parametreler. */
export interface FetchParams {
  page: number
  pageSize: number
  sort: SortState | null
  /** trimmed + debounced */
  query: string
  /** facetKey → seçili değerler */
  filters: Record<string, string[]>
}

/**
 * fetcher sözleşmesi — İKİ-TOTAL [ADV-1#1]:
 * - `totalMatched`: client-süzme SONRASI görünür-eşleşme toplamı (pageCount kaynağı).
 * - `rows`: server-mode'da zaten süzülmüş+sayfalanmış satırlar.
 */
export interface FetchResult<T> {
  rows: T[]
  totalMatched: number
}

export interface UseAdminTableOptions<T> {
  /** persist + URL namespace + audit resource etiketi (ör. 'products') */
  resource: string
  /** stabil satır PK çıkarıcı (selection + audit rowPk) */
  rowId: (r: T) => string
  /** DI: ilk param supabase ZORUNLU (CLAUDE.md kural 2) */
  fetcher: (supabase: SupabaseClient<Database>, params: FetchParams) => Promise<FetchResult<T>>
  pageSize?: number
  paginationMode?: AdminMode
  /**
   * TEK-TARAF ZORLA: server-pagination + client-sort = YASAK mix (cetvel 2.3 sessiz-bug).
   * server → fetcher sıralar; client → kit sıralar; karışım dev'de uyarılır.
   */
  sortMode?: AdminMode
  initialSort?: SortState
  /** URL'ye senkron (useSearchParams → çağıran bileşen <Suspense> ister) */
  syncUrl?: boolean
  debounceMs?: number
}

export interface PaginationApi {
  page: number
  pageSize: number
  pageCount: number
  setPage: (p: number) => void
  setPageSize: (n: number) => void
}

export interface SortingApi {
  sort: SortState | null
  toggleSort: (key: string) => void
}

export interface FilteringApi {
  query: string
  setQuery: (q: string) => void
  filters: Record<string, string[]>
  setFilter: (facetKey: string, values: string[]) => void
  clearAll: () => void
  /** empty-state ayrımı için TEK kanonik sinyal [ADV-1#7] */
  hasActiveFilters: boolean
}

export interface SelectionApi {
  selectedIds: string[]
  isSelected: (id: string) => boolean
  toggle: (id: string, opts?: { shiftKey?: boolean }) => void
  toggleAll: () => void
  clear: () => void
  allSelected: boolean
}

export interface UseAdminTableResult<T> {
  rows: T[]
  totalMatched: number
  isLoading: boolean
  error: string | null
  reload: () => Promise<void>
  /** CSV tam-export: TÜM filtreli sonucu çeker (sayfa-bağımsız), kit-state'i bozmaz [ADV-2#10] */
  fetchAllForExport: () => Promise<T[]>
  pagination: PaginationApi
  sorting: SortingApi
  filtering: FilteringApi
  selection: SelectionApi
}

/* ----------------------------- yardımcılar ----------------------------- */

/** client-mode: kolon/facet key'i satır property'sine karşılık gelir (yoksa server-mode kullan). */
function getCell<T>(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}

function defaultCompare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'tr')
}

function matchesQuery<T>(row: T, needleLower: string): boolean {
  for (const v of Object.values(row as Record<string, unknown>)) {
    if (typeof v === 'string' && v.toLowerCase().includes(needleLower)) return true
  }
  return false
}

function parseSortParam(raw: string | null): SortState | null {
  if (!raw) return null
  const [key, dir] = raw.split(':')
  if (!key) return null
  return { key, dir: dir === 'desc' ? 'desc' : 'asc' }
}

const RESERVED_PARAMS = new Set(['page', 'sort', 'q'])

function parseFiltersFromParams(params: URLSearchParams): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [k, v] of params.entries()) {
    if (RESERVED_PARAMS.has(k) || !v) continue
    out[k] = v.split(',').filter(Boolean)
  }
  return out
}

/* ------------------------------- hook ---------------------------------- */

export function useAdminTable<T>(options: UseAdminTableOptions<T>): UseAdminTableResult<T> {
  const {
    resource,
    rowId,
    fetcher,
    pageSize: pageSizeOpt = 50,
    paginationMode = 'server',
    sortMode = 'server',
    initialSort,
    syncUrl = true,
    debounceMs = 300,
  } = options

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Tek-taraf sort zorlaması (cetvel 2.3) — dev uyarısı (yanlış kombinasyon = sessiz bug)
  useEffect(() => {
    if (paginationMode === 'server' && sortMode === 'client') {
      console.error(
        `[useAdminTable:${resource}] YASAK kombinasyon: server-pagination + client-sort yalnız mevcut sayfayı sıralar (sessiz bug). sortMode='server' yapın.`,
      )
    } else if (paginationMode !== 'server' && sortMode === 'server') {
      console.error(
        `[useAdminTable:${resource}] tutarsız kombinasyon: client/none-pagination + server-sort. sortMode='client' veya 'none' yapın.`,
      )
    }
  }, [paginationMode, sortMode, resource])

  // callback'leri ref'le → fetch deps'ine girmesin (inline arrow refetch loop'unu önler)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher
  const rowIdRef = useRef(rowId)
  rowIdRef.current = rowId

  /* ---- state (syncUrl ise URL'den lazy seed) ---- */
  const [page, setPageRaw] = useState<number>(() => {
    if (!syncUrl || !searchParams) return 1
    const v = parseInt(searchParams.get('page') ?? '1', 10)
    return Number.isFinite(v) && v > 0 ? v : 1
  })
  const [pageSize, setPageSize] = useState<number>(pageSizeOpt)
  const [sort, setSort] = useState<SortState | null>(() => {
    if (syncUrl && searchParams) {
      const s = parseSortParam(searchParams.get('sort'))
      if (s) return s
    }
    return initialSort ?? null
  })
  const [query, setQueryRaw] = useState<string>(() =>
    syncUrl && searchParams ? searchParams.get('q') ?? '' : '',
  )
  const [debouncedQuery, setDebouncedQuery] = useState<string>(() =>
    syncUrl && searchParams ? (searchParams.get('q') ?? '').trim() : '',
  )
  const [filters, setFilters] = useState<Record<string, string[]>>(() =>
    syncUrl && searchParams ? parseFiltersFromParams(new URLSearchParams(searchParams.toString())) : {},
  )

  const [rawRows, setRawRows] = useState<T[]>([])
  const [serverTotal, setServerTotal] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const lastIndexRef = useRef<number | null>(null)

  /* ---- debounce arama ---- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPageRaw(1)
    }, debounceMs)
    return () => clearTimeout(t)
  }, [query, debounceMs])

  /* ---- veri çekme (yalnız server-relevant param değişiminde) ----
     Etkin primitifler client-mode'da sabit kalır → arama/filtre client'ta işlenir, refetch tetiklemez. */
  const effPage = paginationMode === 'server' ? page : 1
  const effSortKey = sortMode === 'server' ? sort?.key ?? '' : ''
  const effSortDir = sortMode === 'server' ? sort?.dir ?? 'asc' : 'asc'
  const effQuery = paginationMode === 'server' ? debouncedQuery : ''
  const effFiltersKey = paginationMode === 'server' ? JSON.stringify(filters) : ''

  const serverParams = useMemo<FetchParams>(
    () => ({
      page: effPage,
      pageSize,
      sort: effSortKey ? { key: effSortKey, dir: effSortDir as TableSortDir } : null,
      query: effQuery,
      filters: effFiltersKey ? (JSON.parse(effFiltersKey) as Record<string, string[]>) : {},
    }),
    [effPage, pageSize, effSortKey, effSortDir, effQuery, effFiltersKey],
  )

  const doFetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetcherRef.current(supabaseBrowserClient, serverParams)
      setRawRows(res.rows)
      setServerTotal(res.totalMatched)
    } catch (e) {
      setError((e as Error)?.message || 'Veriler yüklenemedi')
      setRawRows([])
      setServerTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [serverParams])

  useEffect(() => {
    void doFetch()
  }, [doFetch])

  /* ---- client-mode işleme (query → filter → sort) ---- */
  const processedRows = useMemo(() => {
    if (paginationMode === 'server') return rawRows
    let out = rawRows
    const needle = debouncedQuery.toLowerCase()
    if (needle) out = out.filter((r) => matchesQuery(r, needle))
    for (const [k, vals] of Object.entries(filters)) {
      if (vals.length) out = out.filter((r) => vals.includes(String(getCell(r, k) ?? '')))
    }
    if (sortMode === 'client' && sort) {
      const factor = sort.dir === 'asc' ? 1 : -1
      out = [...out].sort((a, b) => factor * defaultCompare(getCell(a, sort.key), getCell(b, sort.key)))
    }
    return out
  }, [paginationMode, rawRows, debouncedQuery, filters, sortMode, sort])

  const totalMatched = paginationMode === 'server' ? serverTotal : processedRows.length
  const pageCount = paginationMode === 'none' ? 1 : Math.max(1, Math.ceil(totalMatched / pageSize))

  const rows = useMemo(() => {
    if (paginationMode !== 'client') return processedRows
    const from = (page - 1) * pageSize
    return processedRows.slice(from, from + pageSize)
  }, [paginationMode, processedRows, page, pageSize])

  /* ---- URL yazımı (syncUrl) — router.replace, ham history YASAK [ADV-2#e] ---- */
  const lastUrlRef = useRef<string>(syncUrl ? searchParams?.toString() ?? '' : '')

  const buildQuery = useCallback((): string => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (sort) params.set('sort', `${sort.key}:${sort.dir}`)
    if (debouncedQuery) params.set('q', debouncedQuery)
    for (const [k, vals] of Object.entries(filters)) {
      if (vals.length) params.set(k, vals.join(','))
    }
    return params.toString()
  }, [page, sort, debouncedQuery, filters])

  useEffect(() => {
    if (!syncUrl) return
    const qs = buildQuery()
    if (qs === lastUrlRef.current) return
    lastUrlRef.current = qs
    router.replace((qs ? `${pathname}?${qs}` : pathname) as import('next').Route, { scroll: false })
  }, [syncUrl, buildQuery, pathname, router])

  /* ---- URL okuma (geri/ileri tuşu) ---- */
  useEffect(() => {
    if (!syncUrl) return
    const current = searchParams?.toString() ?? ''
    if (current === lastUrlRef.current) return // kendi yazdığımız
    lastUrlRef.current = current
    const sp = new URLSearchParams(current)
    setPageRaw(Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1))
    setSort(parseSortParam(sp.get('sort')))
    const q = sp.get('q') ?? ''
    setQueryRaw(q)
    setDebouncedQuery(q.trim())
    setFilters(parseFiltersFromParams(sp))
  }, [syncUrl, searchParams])

  /* ---------------------------- API ---------------------------- */

  const setPage = useCallback((p: number) => setPageRaw(Math.max(1, p)), [])
  const setQuery = useCallback((q: string) => setQueryRaw(q), [])

  const setFilter = useCallback((facetKey: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [facetKey]: values }))
    setPageRaw(1)
  }, [])

  const clearAll = useCallback(() => {
    setQueryRaw('')
    setDebouncedQuery('')
    setFilters({})
    setPageRaw(1)
  }, [])

  const hasActiveFilters = useMemo(
    () => debouncedQuery !== '' || Object.values(filters).some((v) => v.length > 0),
    [debouncedQuery, filters],
  )

  const toggleSort = useCallback(
    (key: string) => {
      if (sortMode === 'none') return
      setSort((prev) => (prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))
      setPageRaw(1)
    },
    [sortMode],
  )

  // selection — shift-aralık mevcut sayfa rows üzerinde
  const rowsRef = useRef<T[]>(rows)
  rowsRef.current = rows

  const toggle = useCallback((id: string, opts?: { shiftKey?: boolean }) => {
    const currentRows = rowsRef.current
    const curIdx = currentRows.findIndex((r) => rowIdRef.current(r) === id)
    const anchor = lastIndexRef.current // updater ertelenir → anchor'u ŞİMDİ yakala (ref sonra curIdx'e döner)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (opts?.shiftKey && anchor != null && curIdx >= 0) {
        const lo = Math.min(anchor, curIdx)
        const hi = Math.max(anchor, curIdx)
        for (let i = lo; i <= hi; i++) next.add(rowIdRef.current(currentRows[i]))
        return next
      }
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (curIdx >= 0) lastIndexRef.current = curIdx
  }, [])

  const toggleAll = useCallback(() => {
    const currentRows = rowsRef.current
    setSelectedIds((prev) => {
      const next = new Set(prev)
      const allOnPage = currentRows.length > 0 && currentRows.every((r) => prev.has(rowIdRef.current(r)))
      for (const r of currentRows) {
        if (allOnPage) next.delete(rowIdRef.current(r))
        else next.add(rowIdRef.current(r))
      }
      return next
    })
  }, [])

  const clear = useCallback(() => {
    setSelectedIds(new Set())
    lastIndexRef.current = null
  }, [])

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds])
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(rowIdRef.current(r)))
  const selectedIdsArr = useMemo(() => Array.from(selectedIds), [selectedIds])

  const reload = useCallback(async () => {
    await doFetch()
  }, [doFetch])

  const fetchAllForExport = useCallback(async (): Promise<T[]> => {
    if (paginationMode !== 'server') return processedRows
    const res = await fetcherRef.current(supabaseBrowserClient, {
      page: 1,
      pageSize: Math.max(totalMatched || pageSize, pageSize),
      sort: sortMode === 'none' ? null : sort,
      query: debouncedQuery,
      filters,
    })
    return res.rows
  }, [paginationMode, processedRows, totalMatched, pageSize, sortMode, sort, debouncedQuery, filters])

  return {
    rows,
    totalMatched,
    isLoading,
    error,
    reload,
    fetchAllForExport,
    pagination: { page, pageSize, pageCount, setPage, setPageSize },
    sorting: { sort, toggleSort },
    filtering: { query, setQuery, filters, setFilter, clearAll, hasActiveFilters },
    selection: { selectedIds: selectedIdsArr, isSelected, toggle, toggleAll, clear, allSelected },
  }
}
