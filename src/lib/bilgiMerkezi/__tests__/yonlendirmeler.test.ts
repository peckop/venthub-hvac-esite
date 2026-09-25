import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  BILGI_MERKEZI_BOLUMU,
  bilgiMerkeziYonlendirmeleri,
  enYayinOku,
  ESKI_KONULAR,
  YAYINDAN_KALKAN,
} from '../../../config/bilgiMerkeziYonlendirmeleri.mjs'
import { EN_YAYIN } from '../../../config/features'
import { yaziBul } from '../../../data/bilgiMerkezi/yazilar'
import { bilgiMerkeziDilAcik, bilgiMerkeziListeHref } from '../../../utils/bilgiMerkezi'
import { bilgiMerkeziRotalari } from '../../../utils/bilgiMerkeziRotalari'

/**
 * INV-BILGI-MERKEZI-YONLENDIRME-1 — karar 92'nin 10 eski adresi TEK HOP'ta canlı bir hedefe gider;
 * EN kuralı `EN_YAYIN` bayrağına bağlıdır ve İKİ YÖNDE de ölçülür. Kalıcılık: 308; yalnız yayından
 * geçici kalkan yazıya ait adresler 307 (karar 121/c, `YAYINDAN_KALKAN`).
 */
const KOK = process.cwd()

/** Karar 92'nin saydığı 10 adres (merkez + 4 konu, iki dilde). */
const ON_ADRES = ['tr', 'en'].flatMap((d) => [
  `/${d}/destek/merkez`,
  ...['air-curtain', 'hava-perdesi', 'hrv', 'jet-fan'].map((k) => `/${d}/destek/konular/${k}`),
])

/** Next'in ilk eşleşen kuralı uygulamasının basit taklidi (`:ad*` = kalan yol). */
function uygula(kurallar: { source: string; destination: string }[], yol: string): string | null {
  for (const k of kurallar) {
    const desen = new RegExp(`^${k.source.replace(/\/:[a-z]+\*$/i, '(?:/.*)?')}$`)
    if (desen.test(yol)) return k.destination
  }
  return null
}

describe('bilgiMerkeziYonlendirmeleri', () => {
  for (const enYayin of [false, true]) {
    describe(`EN_YAYIN = ${enYayin}`, () => {
      const kurallar = bilgiMerkeziYonlendirmeleri(enYayin)

      it('10 adresin hepsi yönlendirilir (hedefsiz adres 0)', () => {
        for (const yol of ON_ADRES) expect(uygula(kurallar, yol), yol).not.toBeNull()
      })

      it('⭐KALICILIK: yalnız YAYINDAN_KALKAN yazıya giden/yazının kendi adresi geçici (307), gerisi 308 (karar 121/c)', () => {
        const kalkanHedefi = (k: { source: string }) =>
          YAYINDAN_KALKAN.tr.some((s) => k.source === `/tr/bilgi-merkezi/${s}`) ||
          YAYINDAN_KALKAN.en.some((s) => k.source === `/en/knowledge-hub/${s}`) ||
          Object.entries(ESKI_KONULAR).some(
            ([eski, h]) =>
              (k.source === `/tr/destek/konular/${eski}` && (YAYINDAN_KALKAN.tr as readonly string[]).includes(h.tr)) ||
              (enYayin && k.source === `/en/destek/konular/${eski}` && (YAYINDAN_KALKAN.en as readonly string[]).includes(h.en)),
          )
        for (const k of kurallar) expect(k.permanent, k.source).toBe(!kalkanHedefi(k))
      })

      it('TEK HOP: hiçbir hedef başka bir kuralın kaynağına düşmez', () => {
        for (const k of kurallar) expect(uygula(kurallar, k.destination.split('?')[0]), `${k.source} -> ${k.destination}`).toBeNull()
      })

      it('TR: her eski konu ya yayındaki yazıya (308) ya da — yazı kalktıysa — listeye (307) gider; 404 yok', () => {
        expect(uygula(kurallar, '/tr/destek/merkez')).toBe('/tr/bilgi-merkezi')
        expect(uygula(kurallar, '/tr/destek/konular/air-curtain')).toBe(uygula(kurallar, '/tr/destek/konular/hava-perdesi'))
        for (const [eski, hedef] of Object.entries(ESKI_KONULAR)) {
          const kalkti = (YAYINDAN_KALKAN.tr as readonly string[]).includes(hedef.tr)
          expect(uygula(kurallar, `/tr/destek/konular/${eski}`)).toBe(kalkti ? '/tr/bilgi-merkezi' : `/tr/bilgi-merkezi/${hedef.tr}`)
          if (!kalkti) expect(yaziBul('tr', hedef.tr), `TR yazısı yok: ${hedef.tr}`).not.toBeNull()
        }
        for (const slug of YAYINDAN_KALKAN.tr) expect(uygula(kurallar, `/tr/bilgi-merkezi/${slug}`), slug).toBe('/tr/bilgi-merkezi')
      })

      it('⛔SABOTAJ: yazı geri eklenip slug YAYINDAN_KALKAN\'da unutulursa çakışma görünür', () => {
        // Geçici yönlendirme next.config'te sayfadan ÖNCE çalışır: slug listede kalırsa dönen yazı
        // hiç görünmez. icerik.test.ts bu çakışmayı gerçek listede ölçer; burada kural ölçülür.
        expect(uygula(kurallar, `/tr/bilgi-merkezi/${YAYINDAN_KALKAN.tr[0]}`)).not.toBeNull()
        expect(uygula(kurallar, '/tr/bilgi-merkezi/yayinda-olan-baska-yazi')).toBeNull()
      })

      it('EN hedefi bayrağa bağlı: kapalıyken knowledge-hub YOK, açıkken EN yazısına gider', () => {
        const enHedefleri = ON_ADRES.filter((y) => y.startsWith('/en/')).map((y) => uygula(kurallar, y) as string)
        if (!enYayin) {
          expect(enHedefleri.some((h) => h.includes('knowledge-hub'))).toBe(false)
          expect(uygula(kurallar, '/en/destek/konular/hava-perdesi')).toBe('/en/category/air-curtains')
          // Jet fan kategorisi canlıda pasif (404) → EN karşılığı hesaplayıcı.
          expect(uygula(kurallar, '/en/destek/konular/jet-fan')).toBe('/en/destek/hesaplayicilar/jet-fan')
        } else {
          expect(uygula(kurallar, '/en/destek/merkez')).toBe('/en/knowledge-hub')
          for (const [eski, hedef] of Object.entries(ESKI_KONULAR)) {
            const kalkti = (YAYINDAN_KALKAN.en as readonly string[]).includes(hedef.en)
            expect(uygula(kurallar, `/en/destek/konular/${eski}`)).toBe(kalkti ? '/en/knowledge-hub' : `/en/knowledge-hub/${hedef.en}`)
            if (!kalkti) expect(yaziBul('en', hedef.en), `EN yazısı yok: ${hedef.en}`).not.toBeNull()
          }
        }
      })

      it('Bilgi Merkezi bağlantısı bayrağa uyar (kapalı dilde bağlantı basılmaz)', () => {
        expect(bilgiMerkeziListeHref('tr', enYayin)).toBe('/tr/bilgi-merkezi')
        expect(bilgiMerkeziListeHref('en', enYayin)).toBe(enYayin ? '/en/knowledge-hub' : null)
        expect(bilgiMerkeziDilAcik('en', enYayin)).toBe(enYayin)
      })
    })
  }

  it('sss / iade / kargo / garanti /destek\'te KALIR (karar 92) — yönlendirilmez', () => {
    const kurallar = bilgiMerkeziYonlendirmeleri(false)
    for (const yol of ['/tr/destek/sss', '/tr/destek/iade-degisim', '/tr/destek/teslimat-kargo', '/tr/destek/garanti-servis', '/tr/destek/hesaplayicilar/kanal']) {
      expect(uygula(kurallar, yol), yol).toBeNull()
    }
  })

  it('bölüm adları Routes ile aynı (iki kopya ayrışamaz)', () => {
    expect(bilgiMerkeziRotalari.liste('tr')).toBe(`/${BILGI_MERKEZI_BOLUMU.tr}`)
    expect(bilgiMerkeziRotalari.liste('en')).toBe(`/${BILGI_MERKEZI_BOLUMU.en}`)
  })

  it('next.config bayrağı features.ts metninden okur ve okunan değer gerçek EN_YAYIN ile aynı', () => {
    const features = readFileSync(join(KOK, 'src', 'config', 'features.ts'), 'utf8')
    expect(enYayinOku(features)).toBe(EN_YAYIN)
    const nextConfig = readFileSync(join(KOK, 'next.config.mjs'), 'utf8')
    expect(nextConfig).toMatch(/enYayinOku\(readFileSync\(new URL\('\.\/src\/config\/features\.ts'/)
    expect(nextConfig).toMatch(/\.\.\.bilgiMerkeziYonlendirmeleri\(EN_YAYIN\)/)
  })

  it('⛔SABOTAJ: bayrak satırı bozulursa okuyucu ATAR (sessizce "kapalı" varsaymaz)', () => {
    expect(() => enYayinOku('export const EN_YAYIN = process.env.X === "1"')).toThrow()
    expect(() => enYayinOku('')).toThrow()
    expect(enYayinOku('export const EN_YAYIN = true\n')).toBe(true)
  })
})
