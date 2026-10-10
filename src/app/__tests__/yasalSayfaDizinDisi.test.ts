// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Metadata } from 'next'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { enKapaliMi, NOINDEX_FOLLOW } from '@/lib/seo/enYayinKurali'

/**
 * INV-YASAL-DIZIN-1 (URN-97, OPS hükmü 2026-10-10) — hukukçu teyidi ve satıcı bilgileri HAZIR olana kadar
 * altı yasal sayfa arama dizinine girmez (`noindex, follow`); hazır olunca kendiliğinden girer.
 *
 * NİÇİN VAR (GEO-SEO canlı ölçümü, SEO-32 açık noktası): taslak yasal metinler başlıkta "(Taslak)" taşıyor ama
 * robots etiketi yoktu; arama sonucunda onaylanmamış metin belge gibi görünebilirdi. Üç tuzağı sabitler:
 *  1. Başlık (`yasalBaslik`), uyarı bandı ve robots AYNI koşuldan (`isLegalContentReady`) okunur; üçü
 *     ayrışırsa metin "onaylı görünür ama noindex" ya da "taslak ama indekslenir" olur.
 *  2. Yedinci bir yasal sayfa eklenir de `dizinDisi` verilmezse sessizce indekslenirdi: klasör listesi
 *     bu dosyadaki listeyle birebir eşleşmeli, her sayfa yazıcıya bağlı olmalı.
 *  3. `noindex` sayfa hreflang taşımaz (`sayfaUstVerisi`, `dizinDisi` sözleşmesi); canonical kalır.
 *
 * ÖLÇMEDİĞİ: Google'ın sayfayı dizinden gerçekten çıkardığı (GSC, yayın sonrası) ve canlı HTML'deki meta
 * etiketi (birleşme sonrası tarayıcı bölmesiyle ayrıca ölçülür). Sayfalar site haritasında yoktur;
 * bu kapı haritayı ölçmez.
 */

const durum = vi.hoisted(() => ({ zorla: null as boolean | null }))

// Yalnız `yasalDizinDisi` sarılır: sayfaların yazıcıya GERÇEKTEN bağlı olduğunu iki yönde ölçmek için.
// `zorla` boşken gerçek işlev çalışır (bugünkü yapılandırma = taslak).
vi.mock('@/config/legal', async (importOriginal) => {
  const gercek = await importOriginal<typeof import('@/config/legal')>()
  return {
    ...gercek,
    yasalDizinDisi: (...girdi: Parameters<typeof gercek.yasalDizinDisi>) => durum.zorla ?? gercek.yasalDizinDisi(...girdi),
  }
})

type SayfaModulu = {
  generateMetadata: (girdi: { params: Promise<{ lang: string }> }) => Promise<Metadata>
}

const SAYFALAR: Record<string, () => Promise<SayfaModulu>> = {
  kvkk: () => import('../[lang]/legal/kvkk/page'),
  'gizlilik-politikasi': () => import('../[lang]/legal/gizlilik-politikasi/page'),
  'cerez-politikasi': () => import('../[lang]/legal/cerez-politikasi/page'),
  'mesafeli-satis-sozlesmesi': () => import('../[lang]/legal/mesafeli-satis-sozlesmesi/page'),
  'kullanim-kosullari': () => import('../[lang]/legal/kullanim-kosullari/page'),
  'on-bilgilendirme-formu': () => import('../[lang]/legal/on-bilgilendirme-formu/page'),
}

const DILLER = ['tr', 'en'] as const

/** Ham yer tutucu: `[SATICI_UNVAN]` biçimi (satis-kipi-yasal-kapi kapısıyla aynı kalıp). */
const YER_TUTUCU = /^\[[A-Z0-9_]+\]$/

function legalKlasorleri(): string[] {
  return readdirSync(join(process.cwd(), 'src', 'app', '[lang]', 'legal'), { withFileTypes: true })
    .filter((girdi) => girdi.isDirectory())
    .map((girdi) => girdi.name)
    .sort()
}

afterEach(() => {
  durum.zorla = null
})

describe('yasalDizinDisi: başlıkla aynı koşul', () => {
  it('taslakta true (bugünkü yapılandırma), tüm alanlar dolu ve hukukçu teyidi varsa false', async () => {
    const gercek = await vi.importActual<typeof import('@/config/legal')>('@/config/legal')
    const taslak = gercek.default
    expect(gercek.isLegalContentReady(taslak)).toBe(false)
    expect(gercek.yasalDizinDisi(taslak)).toBe(true)

    const doldurulmus = Object.fromEntries(
      Object.entries(taslak)
        .filter(([, deger]) => typeof deger === 'string' && YER_TUTUCU.test(deger))
        .map(([alan]) => [alan, `Dolu ${alan}`]),
    )
    const hazir: typeof taslak = Object.assign({}, taslak, doldurulmus, { legalReviewCompleted: true })
    expect(gercek.isLegalContentReady(hazir)).toBe(true)
    expect(gercek.yasalDizinDisi(hazir)).toBe(false)
    expect(gercek.yasalBaslik('KVKK Aydınlatma Metni (Taslak)', hazir)).toBe('KVKK Aydınlatma Metni')
  })

  it('hukukçu teyidi tek başına yetmez: yer tutucu doluysa sayfa dizin dışı KALIR', async () => {
    const gercek = await vi.importActual<typeof import('@/config/legal')>('@/config/legal')
    const teyitliAmaEksik: typeof gercek.default = { ...gercek.default, legalReviewCompleted: true }
    expect(gercek.yasalDizinDisi(teyitliAmaEksik)).toBe(true)
  })
})

describe('altı yasal sayfa üst veri yazıcısına dizin dışılığı verir', () => {
  it('klasör listesi bu dosyadaki listeyle birebir (yeni yasal sayfa bilinçli eklenir)', () => {
    expect(legalKlasorleri()).toEqual(Object.keys(SAYFALAR).sort())
  })

  it('her sayfa `dizinDisi: yasalDizinDisi()` verir ve başlığı `yasalBaslik` ile yazar', () => {
    for (const klasor of legalKlasorleri()) {
      const kaynak = readFileSync(join(process.cwd(), 'src', 'app', '[lang]', 'legal', klasor, 'page.tsx'), 'utf8')
      expect(kaynak, `${klasor}: dizinDisi yasalDizinDisi()'den gelmiyor`).toMatch(/dizinDisi:\s*yasalDizinDisi\(\)/)
      expect(kaynak, `${klasor}: başlık yasalBaslik ile yazılmıyor`).toMatch(/yasalBaslik\(/)
    }
  })

  it('taslakta her sayfa × iki dil: noindex,follow, canonical var, hreflang yok', async () => {
    durum.zorla = null
    for (const [klasor, yukle] of Object.entries(SAYFALAR)) {
      const sayfa = await yukle()
      for (const lang of DILLER) {
        const veri = await sayfa.generateMetadata({ params: Promise.resolve({ lang }) })
        expect(veri.robots, `${klasor} ${lang}`).toEqual(NOINDEX_FOLLOW)
        expect(typeof veri.alternates?.canonical, `${klasor} ${lang} canonical`).toBe('string')
        expect(veri.alternates?.languages, `${klasor} ${lang} hreflang`).toBeUndefined()
      }
    }
  }, 60_000)

  it('hazırken TR sayfa robots basmaz (indekslenir); EN yalnız EN yayını kapalıysa noindex', async () => {
    durum.zorla = false
    for (const [klasor, yukle] of Object.entries(SAYFALAR)) {
      const sayfa = await yukle()
      const tr = await sayfa.generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })
      const en = await sayfa.generateMetadata({ params: Promise.resolve({ lang: 'en' }) })
      expect(tr.robots, `${klasor} tr`).toBeUndefined()
      expect(typeof tr.alternates?.canonical, `${klasor} tr canonical`).toBe('string')
      expect(en.robots, `${klasor} en`).toEqual(enKapaliMi('en') ? NOINDEX_FOLLOW : undefined)
    }
  }, 60_000)

  it('başlık ve robots ayrışmaz: "(Taslak)" ekini taşıyan sayfa dizin dışıdır', async () => {
    durum.zorla = null
    for (const [klasor, yukle] of Object.entries(SAYFALAR)) {
      const sayfa = await yukle()
      const veri = await sayfa.generateMetadata({ params: Promise.resolve({ lang: 'tr' }) })
      const baslik = typeof veri.title === 'string' ? veri.title : ''
      const taslakEkiVar = /\((?:Taslak|Draft)\)/.test(baslik)
      const dizinDisi = JSON.stringify(veri.robots) === JSON.stringify(NOINDEX_FOLLOW)
      expect(dizinDisi, `${klasor}: başlık "${baslik}" ile robots ayrıştı`).toBe(taslakEkiVar)
    }
  }, 60_000)
})
