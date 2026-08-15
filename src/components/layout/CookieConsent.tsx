'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import {
  acceptAll,
  onConsentChange,
  OPTIONAL_CATEGORIES,
  readConsent,
  rejectOptional,
  setConsent,
} from '@/lib/consent'

import { useLocalizedRoutes } from '../../hooks/useLocalizedRoutes'
import { useI18n } from '../../i18n/I18nProvider'

/**
 * Çerez rıza bandı (T020-VH ile yeniden yazıldı).
 *
 * ÖNCEKİ HÂLİ NEDEN YETERSİZDİ: ikili kabul/ret vardı, tercihi kimse okumuyordu, geri alma
 * yolu yoktu ve metinler koda gömülüydü (CLAUDE.md kural 7 ihlali). KVKK kategori bazlı,
 * geri alınabilir ve ispatlanabilir rıza ister.
 *
 * Bant YALNIZCA karar verilmemişken görünür. "Karar verilmedi" ile "hepsini reddetti"
 * farklı durumlardır: ikincisinde bant bir daha gösterilmez, kullanıcı tercihini
 * Çerez Politikası sayfasından değiştirebilir.
 */
export default function CookieConsent() {
  const { t } = useI18n()
  const routes = useLocalizedRoutes()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [draft, setDraft] = useState({ functional: false, analytics: false, marketing: false })

  const syncVisibility = useCallback(() => {
    // Karar yoksa göster. LCP/CLS için ilk boyamadan sonra gecikmeli.
    setIsVisible(readConsent() === null)
  }, [])

  useEffect(() => {
    const timer = setTimeout(syncVisibility, 1500)
    const off = onConsentChange(syncVisibility)
    return () => {
      clearTimeout(timer)
      off()
    }
  }, [syncVisibility])

  if (!isVisible) return null

  const handleAcceptAll = () => {
    acceptAll()
    setIsVisible(false)
  }

  const handleRejectOptional = () => {
    rejectOptional()
    setIsVisible(false)
  }

  const handleSaveSelection = () => {
    setConsent(draft)
    setIsVisible(false)
  }

  return (
    <div
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-toast animate-fadeInUp"
      role="dialog"
      aria-live="polite"
      aria-label={t('cookieConsent.title')}
    >
      <div className="glass-strong p-6 rounded-2xl shadow-2xl border border-white/10 cyan-glow flex flex-col gap-4 text-white">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {t('cookieConsent.title')}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {t('cookieConsent.description')}
            </p>
          </div>
        </div>

        {showDetails && (
          <fieldset className="flex flex-col gap-3 pt-2 border-t border-white/5">
            <legend className="sr-only">{t('cookieConsent.manage')}</legend>

            <label className="flex items-start gap-3 opacity-60 cursor-not-allowed">
              <input type="checkbox" checked disabled className="mt-1 accent-cyan-500" />
              <span className="flex flex-col">
                <span className="text-xs font-bold text-white">{t('cookieConsent.categories.necessary')}</span>
                <span className="text-xs text-slate-400">{t('cookieConsent.categories.necessaryDesc')}</span>
              </span>
            </label>

            {OPTIONAL_CATEGORIES.map((category) => (
              <label key={category} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft[category]}
                  onChange={(e) => setDraft({ ...draft, [category]: e.target.checked })}
                  className="mt-1 accent-cyan-500"
                />
                <span className="flex flex-col">
                  <span className="text-xs font-bold text-white">{t(`cookieConsent.categories.${category}`)}</span>
                  <span className="text-xs text-slate-400">{t(`cookieConsent.categories.${category}Desc`)}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
          <Link
            href={routes.legal.cerez()}
            className="text-xs text-slate-400 hover:text-cyan-400 font-bold underline underline-offset-4 transition-colors uppercase tracking-wider"
          >
            {t('cookieConsent.policyLink')}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {showDetails ? (
              <button
                onClick={handleSaveSelection}
                className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {t('cookieConsent.saveSelection')}
              </button>
            ) : (
              <button
                onClick={() => setShowDetails(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                {t('cookieConsent.manage')}
              </button>
            )}
            <button
              onClick={handleRejectOptional}
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {t('cookieConsent.rejectOptional')}
            </button>
            <button
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {t('cookieConsent.acceptAll')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
