/**
 * lineo-quiet-ses-fix.mjs — saf kurallar (KTL-50). Ağa çıkmaz.
 * Kilitlenenler: sayı sözleşmesi (§11.6), yazılan değer katalogun GÖVDE sütunudur, canlı değer eski baskının
 * gövde sütunuyla birebir (kök kanıtı), spec + TR/EN açıklama aynı sayıyla değişir, BAYATLIK, tekrar koşum
 * güvenli, depodaki manifest temiz ve 12 modeli (6 AC + 6 ES) kapsar.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { manifestIhlalleri, hedefHesapla, sayiTR, sayiEN } from '../lineo-quiet-ses-fix-kurallar.mjs'

type Motor = 'AC' | 'ES'
type Kalem = {
  ad: string; motor: Motor; kaynak: string
  katalog: { emme: number; ufleme: number; govde: number }
  eski_baski_govde: number
  onceki: { noise_level_db_a: number }
  yeni: { noise_level_db_a: number }
}
const manifest: { items: Record<string, Kalem> } = JSON.parse(readFileSync(join(__dirname, '..', 'lineo-quiet-ses-manifest.json'), 'utf8'))

/** Canlıda gözlenen cümle kalıbı (16 Ekim 2026 SQL) — sayıyı verip tam metni üretir. */
const trCumle = (motor: Motor, n: number) => motor === 'AC'
  ? `Ses emici kaplaması dış gövdeye tamamen entegre edilmiş, AC motorlu, kanal tipi karma akışlı fan. Azami hızda yayılan ses basıncı seviyesi ${sayiTR(n)} dB(A) (3 m mesafede, serbest alanda hesaplanmış).`
  : `Ses emici kaplaması dış gövdeye tamamen entegre edilmiş, EC fırçasız motorlu, kanal tipi karma akışlı fan. 10 V kademesinde yayılan ses basıncı seviyesi ${sayiTR(n)} dB(A) (3 m mesafede, serbest alanda hesaplanmış).`
const enCumle = (motor: Motor, n: number) => motor === 'AC'
  ? `In-line mixed flow fan with AC motor; the sound-absorbing coating is fully integrated in the outer casing. Radiated sound pressure level at top speed: ${sayiEN(n)} dB(A) (calculated in free field conditions at 3 m).`
  : `In-line mixed flow fan with EC brushless motor; the sound-absorbing coating is fully integrated in the outer casing. Radiated sound pressure level at the 10 V step: ${sayiEN(n)} dB(A) (calculated in free field conditions at 3 m).`

const satir = (kod: string, n: number, motor: Motor, ustune: Record<string, unknown> = {}) => ({
  id: `id-${kod}`, sku: `VRT-${kod}`,
  technical_specs: { rpm_max: 2260, noise_level_db_a: n, pq_curve: '[[0, 1], [1, 0]]' },
  description_i18n: { tr: trCumle(motor, n), en: enCumle(motor, n) },
  ...ustune,
})
const kalem = (o: Record<string, unknown> = {}) => ({
  ad: 'Lineo 100 Quiet', motor: 'AC', kaynak: '193047 s.18',
  katalog: { emme: 35.3, ufleme: 35.1, govde: 28.4 }, eski_baski_govde: 26.1,
  onceki: { noise_level_db_a: 26.1 }, yeni: { noise_level_db_a: 28.4 }, ...o,
})
/** Depodaki 11 kalemin yanına deneme kalemini koyar: model sayısı kuralı tetiklenmeden yalnız ilgili ihlal süzülür. */
const ihlal = (o: Record<string, unknown>) => {
  const digerleri = Object.fromEntries(Object.entries(manifest.items).filter(([kod]) => kod !== '17160'))
  return manifestIhlalleri({ items: { '17160': kalem(o), ...digerleri } }).join('|')
}

describe('lineo-quiet-ses-fix manifest kuralları', () => {
  it('depodaki manifest TEMİZ ve 12 modeli kapsar (6 AC + 6 ES)', () => {
    expect(manifestIhlalleri(manifest)).toEqual([])
    const kalemler = Object.values(manifest.items)
    expect(kalemler).toHaveLength(12)
    expect(kalemler.filter(k => k.motor === 'AC')).toHaveLength(6)
    expect(kalemler.filter(k => k.motor === 'ES')).toHaveLength(6)
    expect(Object.keys(manifest.items).sort()).toEqual(['17160', '17161', '17162', '17164', '17165', '17166', '17170', '17171', '17172', '17174', '17175', '17176'])
  })
  it('her kalemde yazılan = katalog GÖVDE sütunu, canlı (önceki) = eski baskı gövde sütunu (kök kanıtı)', () => {
    for (const [kod, k] of Object.entries(manifest.items)) {
      expect(k.yeni.noise_level_db_a, `${kod} yeni`).toBe(k.katalog.govde)
      expect(k.onceki.noise_level_db_a, `${kod} onceki`).toBe(k.eski_baski_govde)
      expect(Object.keys(k.yeni), `${kod} yalniz tek alan`).toEqual(['noise_level_db_a'])
    }
  })
  it('gövde sütunu emme/üfleme sütunundan hiçbir modelde yüksek değil (gövde en sessiz yoldur)', () => {
    for (const [kod, k] of Object.entries(manifest.items)) {
      expect(k.katalog.govde, kod).toBeLessThanOrEqual(Math.min(k.katalog.emme, k.katalog.ufleme))
    }
  })
  it('yazılan değer gövde sütunu DEĞİLSE düşer (örn. üfleme yazılmak istenirse)', () => {
    expect(ihlal({ yeni: { noise_level_db_a: 35.1 } })).toMatch(/yazilan deger govde sutunu olmali/)
  })
  it('önceki değer eski baskının gövde değeriyle tutmuyorsa düşer', () => {
    expect(ihlal({ onceki: { noise_level_db_a: 26.2 } })).toMatch(/onceki 26.2 != eski_baski_govde 26.1/)
  })
  it('eski_baski_govde ya da üç katalog sütunundan biri yoksa düşer', () => {
    expect(ihlal({ eski_baski_govde: undefined })).toMatch(/eski_baski_govde yok/)
    expect(ihlal({ katalog: { emme: 35.3, govde: 28.4 } })).toMatch(/katalog.ufleme sayi degil/)
  })
  it('ses METİN ya da makul aralık dışıysa düşer (§11.6)', () => {
    expect(ihlal({ yeni: { noise_level_db_a: '28,4' } })).toMatch(/SAYI olmali/)
    expect(ihlal({ yeni: { noise_level_db_a: 4 }, katalog: { emme: 35.3, ufleme: 35.1, govde: 4 } })).toMatch(/makul aralik disi/)
  })
  it('yeni yalnız tek alan içermeli (başka alan sessizce yazılamaz)', () => {
    expect(ihlal({ yeni: { noise_level_db_a: 28.4, rpm_max: 3000 } })).toMatch(/yalniz \{noise_level_db_a\}/)
  })
  it('motor AC/ES dışıysa ve model sayısı 12 değilse düşer', () => {
    expect(ihlal({ motor: 'DC' })).toMatch(/motor AC ya da ES olmali/)
    expect(manifestIhlalleri({ items: { '17160': kalem() } }).join('|')).toMatch(/1 model iceriyor \(12/)
  })
  it('önceki = yeni olan kalem anlamsızdır', () => {
    expect(ihlal({ onceki: { noise_level_db_a: 28.4 }, eski_baski_govde: 28.4 })).toMatch(/onceki = yeni/)
  })
})

describe('lineo-quiet-ses-fix hedef hesabı', () => {
  it('AC: spec + TR + EN üç fark; metinde YALNIZ sayı değişir', () => {
    const h = hedefHesapla(satir('17160', 26.1, 'AC'), kalem())
    expect(h.ihlaller).toEqual([])
    expect(h.farklar.map(f => f.alan)).toEqual(['technical_specs.noise_level_db_a', 'description_i18n.tr', 'description_i18n.en'])
    expect(h.yeniSpecs.noise_level_db_a).toBe(28.4)
    expect(h.yeniAciklama.tr).toBe(trCumle('AC', 28.4))
    expect(h.yeniAciklama.en).toBe(enCumle('AC', 28.4))
  })
  it('diğer teknik alanlar ve diğer dil anahtarları KORUNUR', () => {
    const s = satir('17160', 26.1, 'AC', { description_i18n: { tr: trCumle('AC', 26.1), en: enCumle('AC', 26.1), de: 'unberuehrt 26,1' } })
    const h = hedefHesapla(s, kalem())
    expect(h.yeniSpecs.rpm_max).toBe(2260)
    expect(h.yeniSpecs.pq_curve).toBe('[[0, 1], [1, 0]]')
    expect(h.yeniAciklama.de).toBe('unberuehrt 26,1')
  })
  it('12/12: canlıda gözlenen cümleden üretilen metin, yeni sayıyla üretilene BİREBİR eşit', () => {
    for (const [kod, k] of Object.entries(manifest.items)) {
      const h = hedefHesapla(satir(kod, k.onceki.noise_level_db_a, k.motor), k)
      expect(h.ihlaller, kod).toEqual([])
      expect(h.farklar, kod).toHaveLength(3)
      expect(h.yeniSpecs.noise_level_db_a, kod).toBe(k.katalog.govde)
      expect(h.yeniAciklama.tr, kod).toBe(trCumle(k.motor, k.katalog.govde))
      expect(h.yeniAciklama.en, kod).toBe(enCumle(k.motor, k.katalog.govde))
    }
  })
  it('ES: "10 V kademesinde" ibaresi ve "10 V step" sayıdan ÖNCEKİ rakamlar bozulmaz', () => {
    const k = kalem({ motor: 'ES', onceki: { noise_level_db_a: 27.4 }, eski_baski_govde: 27.4, katalog: { emme: 38.1, ufleme: 40.7, govde: 30.9 }, yeni: { noise_level_db_a: 30.9 } })
    const h = hedefHesapla(satir('17170', 27.4, 'ES'), k)
    expect(h.yeniAciklama.tr).toContain('10 V kademesinde yayılan ses basıncı seviyesi 30,9 dB(A)')
    expect(h.yeniAciklama.en).toContain('at the 10 V step: 30.9 dB(A)')
  })
  it('tam sayı değer ondalıksız yazılır (47 → "47", "47,0" değil)', () => {
    const k = kalem({ onceki: { noise_level_db_a: 45.4 }, eski_baski_govde: 45.4, katalog: { emme: 58.4, ufleme: 57.4, govde: 47 }, yeni: { noise_level_db_a: 47 } })
    const h = hedefHesapla(satir('17166', 45.4, 'AC'), k)
    expect(h.yeniAciklama.tr).toContain('seviyesi 47 dB(A)')
    expect(h.yeniAciklama.en).toContain('top speed: 47 dB(A)')
  })
  it('TEKRAR KOŞUM güvenli: zaten hedefteyse fark yok, ihlal yok', () => {
    const h = hedefHesapla(satir('17160', 28.4, 'AC'), kalem())
    expect(h.ihlaller).toEqual([])
    expect(h.farklar).toEqual([])
  })
  it('KISMİ yazım toparlanır: spec hedefte ama metin eskiyse yalnız metin düzelir', () => {
    const s = satir('17160', 28.4, 'AC', { description_i18n: { tr: trCumle('AC', 26.1), en: enCumle('AC', 26.1) } })
    const h = hedefHesapla(s, kalem())
    expect(h.ihlaller).toEqual([])
    expect(h.farklar.map(f => f.alan)).toEqual(['description_i18n.tr', 'description_i18n.en'])
  })
  it('BAYAT: canlı spec değeri ne önceki ne yeni ise YAZMAZ', () => {
    const h = hedefHesapla(satir('17160', 27.7, 'AC'), kalem())
    expect(h.ihlaller.join('|')).toMatch(/BAYAT — noise_level_db_a canli 27.7/)
  })
  it('BAYAT: açıklamadaki sayı beklenenden başkaysa YAZMAZ (biri metni elle değiştirmiş)', () => {
    const s = satir('17160', 26.1, 'AC', { description_i18n: { tr: trCumle('AC', 29.9), en: enCumle('AC', 26.1) } })
    const h = hedefHesapla(s, kalem())
    expect(h.ihlaller.join('|')).toMatch(/BAYAT — tr aciklamadaki ses 29,9/)
  })
  it('cümle kalıbı yok ya da birden fazlaysa DURUR (sessizce atlamaz)', () => {
    const yok = satir('17160', 26.1, 'AC', { description_i18n: { tr: 'Ses emici kaplamalı fan.', en: enCumle('AC', 26.1) } })
    expect(hedefHesapla(yok, kalem()).ihlaller.join('|')).toMatch(/tr aciklamada ses cumlesi 0 kez/)
    const iki = satir('17160', 26.1, 'AC', { description_i18n: { tr: `${trCumle('AC', 26.1)} ${trCumle('AC', 26.1)}`, en: enCumle('AC', 26.1) } })
    expect(hedefHesapla(iki, kalem()).ihlaller.join('|')).toMatch(/tr aciklamada ses cumlesi 2 kez/)
  })
  it('açıklama alanı hiç yoksa (null) ihlal verir', () => {
    const s = satir('17160', 26.1, 'AC', { description_i18n: null })
    expect(hedefHesapla(s, kalem()).ihlaller.join('|')).toMatch(/aciklama metni yok/)
  })
  it('sayı biçimleri: TR virgül, EN nokta', () => {
    expect(sayiTR(26.1)).toBe('26,1'); expect(sayiEN(26.1)).toBe('26.1')
    expect(sayiTR(47)).toBe('47'); expect(sayiEN(25)).toBe('25')
  })
})
