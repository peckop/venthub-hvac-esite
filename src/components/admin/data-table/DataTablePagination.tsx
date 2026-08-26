'use client'

import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

interface DataTablePaginationProps {
  page: number
  pageCount: number
  setPage: (page: number) => void
  /** i18n-çözülmüş "önceki sayfa" */
  previousLabel: string
  /** i18n-çözülmüş "sonraki sayfa" */
  nextLabel: string
  /** varsayılan "3 / 12"; kaynak kendi biçimini verebilir */
  renderPageLabel?: (page: number, pageCount: number) => ReactNode
}

/**
 * Sayfalama denetimleri — tablonun ALTINDA, TEK blok.
 *
 * NİÇİN ALTTA: cetvel `docs/standards/admin-standard.md` §3 (Resource Index bileşim sırası)
 * dördüncü maddede birebir şunu söyler: **"Sayfalama — altta; ~50 öğeden sonra zorunlu."**
 * Kural YAZILIYDI ama uygulanmamıştı; denetimler yalnız üst araç çubuğunda duruyordu
 * (T137-VH). Yani bu bir yenilik değil, yazılı kuralın koda inmesi.
 *
 * NİÇİN ÇOĞALTMADIK (üstte + altta iki blok): ikiz denetim seti ekran okuyucuda ayırt
 * edilemeyen iki "Önceki sayfa" düğmesi üretir ve aynı davranışın iki kopyası zamanla
 * ayrışır. Cetvelin kendi kaynağı olan Polaris de tek blok kullanır.
 *
 * NİÇİN AYRI DOSYA: cetvelin kit dosya haritası (§2) `DataTablePagination.tsx` adlı bir
 * bileşeni ZATEN anıyordu, ama dosya yoktu — harita gerçekle ayrışmıştı. Bu çıkarma
 * ikisini birden kapatır.
 */
export function DataTablePagination(props: DataTablePaginationProps): ReactNode {
  const { page, pageCount, setPage, previousLabel, nextLabel, renderPageLabel } = props

  // Tek sayfa varsa denetim GÖSTERİLMEZ: tıklanamaz iki ok bilgi taşımaz, gürültü yapar.
  if (pageCount <= 1) return null

  return (
    <div className="p-4 flex flex-wrap items-center justify-end gap-2 border-t border-admin-border">
      <button
        type="button"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label={previousLabel}
        className="w-8 h-8 flex items-center justify-center rounded-admin-md bg-admin-surface border border-admin-border text-admin-fg-muted hover:text-admin-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} className="rotate-180" />
      </button>
      <span className="text-xs font-semibold text-admin-fg-muted bg-admin-surface-2 px-3 py-1.5 rounded-admin-md border border-admin-border text-center tracking-tighter">
        {renderPageLabel ? renderPageLabel(page, pageCount) : `${page} / ${pageCount}`}
      </span>
      <button
        type="button"
        onClick={() => setPage(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label={nextLabel}
        className="w-8 h-8 flex items-center justify-center rounded-admin-md bg-admin-surface border border-admin-border text-admin-fg-muted hover:text-admin-fg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
