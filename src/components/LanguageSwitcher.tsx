'use client'

import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'

import { useI18n } from '../i18n/I18nProvider'

/**
 * `id` NİÇİN PROP OLDU (REC-129 Faz 1c): bayrak açıkken bu bileşen İKİ yerde çizilir —
 * masaüstü header'ında ve mobil Hesap yaprağında. İkisi de DOM'da aynı anda bulunabilir
 * (header `hidden md:block` ile gizlenir ama DOM'dan silinmez), sabit bir `id` o an
 * ÇİFTLENİRDİ. Varsayılan korunuyor; ikinci örnek kendi id'sini verir.
 */
/**
 * Düğmelerin GÖRÜNEN yazısı. Erişilebilir ad da buradan kurulur (aşağıya bak) — tek kaynak
 * olmasının sebebi ölçülmüş bir kusurdur: görünen yazı ile erişilebilir ad ayrı yazılınca
 * ikisi ayrıştı ve `label-content-name-mismatch` doğdu (REC-268).
 */
const DIL_KODU = { tr: 'TR', en: 'EN' } as const

const LanguageSwitcher: React.FC<{ id?: string }> = ({ id = 'language-switcher' }) => {
  const { lang, setLang, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  const switchLanguage = (newLang: 'tr' | 'en') => {
    if (lang === newLang) return

    // İstemci tarafında cookie'yi güncelle (Middleware dil algılama kararlılığı için)
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000; SameSite=Lax`

    // Local storage güncelle (I18nProvider fallback için)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lang', newLang)
      }
    } catch {}

    // İstemci tarafı state'ini anında güncelle (Buton ve client çevirileri için)
    setLang(newLang)

    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]

    let newPath = '/'
    if (firstSegment === 'tr' || firstSegment === 'en') {
      segments[0] = newLang
      newPath = '/' + segments.join('/')
    } else {
      newPath = '/' + newLang + (pathname === '/' ? '' : pathname)
    }

    // SPA akışını ve pürüzsüzlüğü koruyarak yönlendir ve sunucu cache'ini yenile
    router.push(newPath as Route)
    router.refresh()
  }

  return (
    <div
      id={id}
      className="bg-white/90 backdrop-blur border border-light-gray rounded-full shadow-sm p-1 flex items-center gap-1"
      role="group"
      aria-label={t('common.languageSwitcher')}
    >
      {/* ⭐ERİŞİLEBİLİR AD, GÖRÜNEN YAZIYI İÇERİR (REC-268 · WCAG 2.5.3 "Label in Name").
          ÖLÇÜLDÜ (Lighthouse a11y, `label-content-name-mismatch`, 2 ihlal): düğmelerin
          görünen yazısı `TR`/`EN` iken erişilebilir adı `Türkçe`/`İngilizce` idi — yani ad,
          görünen yazıyı HİÇ içermiyordu. Bedeli somut: sesle komut veren kullanıcı ekranda
          gördüğü "TR"yi söylediğinde düğme BULUNAMAZ.
          Çözüm ikisini birleştirir: kısa kod okunabilirliği korur, tam ad ekran okuyucuya
          hangi dil olduğunu söyler. Kod ve görünen yazı TEK yerden gelir ki ileride biri
          değişip diğeri kalmasın — kusur tam olarak buydu.
          `TR`/`EN` sözlüğe girmez: bunlar çevrilecek METİN değil, dilin kendi kodudur ve
          her iki dilde de aynı yazılır (kural 7 kapsamı dışında). */}
      <button
        onClick={() => switchLanguage('tr')}
        className={`px-3 py-1 text-sm rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${lang === 'tr' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'tr'}
        aria-label={`${DIL_KODU.tr} — ${t('common.turkish')}`}
      >{DIL_KODU.tr}</button>
      <button
        onClick={() => switchLanguage('en')}
        className={`px-3 py-1 text-sm rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-navy ${lang === 'en' ? 'bg-primary-navy text-white' : 'text-industrial-gray hover:bg-light-gray'}`}
        aria-pressed={lang === 'en'}
        aria-label={`${DIL_KODU.en} — ${t('common.english')}`}
      >{DIL_KODU.en}</button>
    </div>
  )
}

export default LanguageSwitcher
