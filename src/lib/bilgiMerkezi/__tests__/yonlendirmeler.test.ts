import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  BILGI_MERKEZI_BOLUMU,
  bilgiMerkeziYonlendirmeleri,
  enYayinOku,
  ESKI_KONULAR,
} from '../../../config/bilgiMerkeziYonlendirmeleri.mjs'
import { EN_YAYIN } from '../../../config/features'
import { yaziBul } from '../../../data/bilgiMerkezi/yazilar'
import { bilgiMerkeziDilAcik, bilgiMerkeziListeHref } from '../../../utils/bilgiMerkezi'
import { bilgiMerkeziRotalari } from '../../../utils/bilgiMerkeziRotalari'

/**
 * INV-BILGI-MERKEZI-YONLENDIRME-1 — karar 92'nin 10 eski adresi 308 ile TEK HOP'ta canlı bir hedefe
 * gider; EN kuralı `EN_YAYIN` bayrağına bağlıdır ve İKİ YÖNDE de ölçülür.
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

      it('10 adresin hepsi kalıcı yönlendirilir (hedefsiz adres 0)', () => {
        for (const yol of ON_ADRES) expect(uygula(kurallar, yol), yol).not.toBeNull()
        expect(kurallar.every((k) => k.permanent === true)).toBe(true)
      })

      it('TEK HOP: hiçbir hedef başka bir kuralın kaynağına düşmez', () => {
        for (const k of kurallar) expect(uygula(kurallar, k.destination.split('?')[0]), `${k.source} -> ${k.destination}`).toBeNull()
      })

      it('TR hedefleri gerçek yazılara gider; air-curtain ile hava-perdesi TEK yazıda birleşir', () => {
        expect(uygula(kurallar, '/tr/destek/merkez')).toBe('/tr/bilgi-merkezi')
        expect(uygula(kurallar, '/tr/destek/konular/air-curtain')).toBe(uygula(kurallar, '/tr/destek/konular/hava-perdesi'))
        for (const [eski, hedef] of Object.entries(ESKI_KONULAR)) {
          expect(uygula(kurallar, `/tr/destek/konular/${eski}`)).toBe(`/tr/bilgi-merkezi/${hedef.tr}`)
          expect(yaziBul('tr', hedef.tr), `TR yazısı yok: ${hedef.tr}`).not.toBeNull()
        }
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
            expect(uygula(kurallar, `/en/destek/konular/${eski}`)).toBe(`/en/knowledge-hub/${hedef.en}`)
            expect(yaziBul('en', hedef.en), `EN yazısı yok: ${hedef.en}`).not.toBeNull()
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
