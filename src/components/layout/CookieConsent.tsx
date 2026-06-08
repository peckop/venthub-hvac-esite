'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { useI18n } from '../../i18n/I18nProvider'

export default function CookieConsent() {
  const { lang } = useI18n()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Çerez izni kontrolü (localStorage tabanlı)
    try {
      const consent = localStorage.getItem('vh_cookie_consent')
      if (!consent) {
        // İlk etkileşimden 1.5 saniye sonra göster (LCP / CLS optimizasyonu için)
        const timer = setTimeout(() => setIsVisible(true), 1500)
        return () => clearTimeout(timer)
      }
    } catch {}
  }, [])

  const handleAccept = () => {
    try {
      localStorage.setItem('vh_cookie_consent', 'accepted')
    } catch {}
    setIsVisible(false)
  }

  const handleReject = () => {
    try {
      localStorage.setItem('vh_cookie_consent', 'rejected')
    } catch {}
    setIsVisible(false)
  }

  if (!isVisible) return null

  // Dil bazlı lokalize metinler
  const text = lang === 'en'
    ? 'We use cookies to enhance your HVAC engineering and discovery experience. By continuing, you agree to our policies.'
    : 'HVAC mühendislik ve keşif deneyiminizi iyileştirmek için çerezleri kullanıyoruz. Devam ederek politikalarımızı kabul etmiş olursunuz.'

  const policyText = lang === 'en' ? 'Cookie Policy' : 'Çerez Politikası'
  const acceptText = lang === 'en' ? 'Accept All' : 'Tümünü Kabul Et'
  const rejectText = lang === 'en' ? 'Reject' : 'Reddet'

  return (
    <div 
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-toast animate-fadeInUp"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie Consent"
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
              {lang === 'en' ? 'Cookie Consent' : 'Çerez İzni'}
            </span>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              {text}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/5">
          <Link 
            href={`/${lang}/legal/cerez-politikasi`} 
            className="text-xs text-slate-400 hover:text-cyan-400 font-bold underline underline-offset-4 transition-colors uppercase tracking-wider"
          >
            {policyText}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReject}
              className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {rejectText}
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {acceptText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
