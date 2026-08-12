'use client'

import type { Route } from 'next'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import React from 'react'

import { useI18n } from '../../i18n/I18nProvider'

interface PaginationProps {
  /** 1-tabanlı aktif sayfa. */
  page: number
  /** Sayfa başına kayıt (sunucu tarafıyla aynı olmalı). */
  pageSize: number
  /** Filtre setine göre TOPLAM kayıt (RPC window count). */
  total: number
}

/**
 * F5-B W2.1 — Sunucu-sayfalaması için basit önceki/sonraki + "Sayfa X / Y" göstergesi.
 * Sayfa durumu URL'de (`?page=`) tutulur; diğer sorgu parametreleri korunur.
 * `useSearchParams` kullandığı için çağıran taraf <Suspense> ile sarmalıdır (PPR kuralı).
 */
const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total }) => {
  const { t } = useI18n()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const pageCount = Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
  if (pageCount <= 1) return null

  const hrefFor = (target: number): Route => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (target <= 1) params.delete('page')
    else params.set('page', String(target))
    const qs = params.toString()
    return `${pathname}${qs ? `?${qs}` : ''}` as Route
  }

  const hasPrev = page > 1
  const hasNext = page < pageCount
  const linkClass = 'px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-light-gray bg-white text-primary-navy transition-colors hover:bg-light-gray/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-navy focus-visible:ring-offset-2'
  const disabledClass = 'px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-light-gray bg-light-gray/40 text-steel-gray cursor-not-allowed'

  return (
    <nav
      aria-label={t('common.paginationLabel')}
      className="flex items-center justify-center gap-4 py-10"
    >
      {hasPrev ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass}>
          {t('common.paginationPrevious')}
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>{t('common.paginationPrevious')}</span>
      )}

      <span className="text-sm font-bold text-industrial-gray" aria-current="page">
        {t('common.paginationStatus', { page, pageCount })}
      </span>

      {hasNext ? (
        <Link href={hrefFor(page + 1)} rel="next" className={linkClass}>
          {t('common.paginationNext')}
        </Link>
      ) : (
        <span aria-disabled className={disabledClass}>{t('common.paginationNext')}</span>
      )}
    </nav>
  )
}

export default Pagination
