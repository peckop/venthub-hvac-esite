import { describe, expect, it } from 'vitest'

import {
  type AsistanHata,
  HATA_BILGISI,
  hataCevabi,
  MAKS_URUN,
  satirlariSinirla,
  sayacCevabiniCoz,
  sayacKarari,
  sayacOku,
  semaHatasiniEsle,
  yonlendirmeMetni,
} from '../hataYollari'
import type { SemaHatasi } from '../semalar'
import { cevirEn, cevirTr } from './fikstur'

describe('satirlariSinirla: çok geniş süzgeç', () => {
  it('MAKS_URUN sabittir ve yirmidir', () => {
    expect(MAKS_URUN).toBe(20)
  })

  it('sınırı aşan liste ilk N satıra indirilir, kırpıldı işaretlenir, toplam korunur', () => {
    const sonuc = satirlariSinirla(Array.from({ length: 25 }, (_v, i) => i))
    expect(sonuc.satirlar).toEqual(Array.from({ length: 20 }, (_v, i) => i))
    expect(sonuc.kirpildi).toBe(true)
    expect(sonuc.toplam).toBe(25)
  })

  it('tam sınırdaki ve sınırın altındaki liste kırpılmaz', () => {
    expect(satirlariSinirla(new Array(20).fill(0)).kirpildi).toBe(false)
    expect(satirlariSinirla([1]).kirpildi).toBe(false)
    expect(satirlariSinirla([])).toEqual({ satirlar: [], toplam: 0, kirpildi: false })
  })

  it('geçersiz sınır değeri varsayılana düşer, fırlatmaz', () => {
    for (const maks of [0, -3, 1.5, Number.NaN]) {
      expect(satirlariSinirla(new Array(30).fill(0), maks).satirlar).toHaveLength(MAKS_URUN)
    }
    expect(satirlariSinirla([1, 2, 3, 4], 2).satirlar).toEqual([1, 2])
  })
})

describe('hata yolları: her birinin AYRI mesajı ve durum kodu var', () => {
  const kodlar = Object.keys(HATA_BILGISI) as AsistanHata[]

  it('beş tanımlı hata yolu var', () => {
    expect(kodlar.sort()).toEqual(['ISTEK_SINIRI', 'MODEL_CIKTISI', 'SAGLAYICI', 'SAYAC_OLCULEMEDI', 'SUZGEC_BOS'])
  })

  it.each([
    ['tr', cevirTr],
    ['en', cevirEn],
  ] as const)('%s: mesajlar sözlükte çözülür (ham anahtar sızmaz), boş değil ve birbirinden farklı', (_dil, cevir) => {
    const metinler = kodlar.map((k) => hataCevabi(k, cevir).metin)
    for (const metin of metinler) {
      expect(metin.length).toBeGreaterThan(10)
      expect(metin).not.toMatch(/^asistan\./)
    }
    expect(new Set(metinler).size).toBe(metinler.length)
  })

  it('sayaç ölçülemedi: 503 ve arama kutusuna geri düşüş (fail-closed)', () => {
    const cevap = hataCevabi('SAYAC_OLCULEMEDI', cevirTr)
    expect(cevap.http).toBe(503)
    expect(cevap.aramaKutusunaDus).toBe(true)
  })

  it('durum kodları: boş süzgeç 200, istek sınırı 429, sağlayıcı kesintisi 503, model çıktısı 502', () => {
    expect(HATA_BILGISI.SUZGEC_BOS.http).toBe(200)
    expect(HATA_BILGISI.ISTEK_SINIRI.http).toBe(429)
    expect(HATA_BILGISI.SAGLAYICI.http).toBe(503)
    expect(HATA_BILGISI.SAGLAYICI.aramaKutusunaDus).toBe(true)
    expect(HATA_BILGISI.MODEL_CIKTISI.http).toBe(502)
  })

  it('her şema hatası MODEL_CIKTISI yoluna iner', () => {
    const hepsi: SemaHatasi[] = ['BOS_CIKTI', 'COK_UZUN', 'GECERSIZ_JSON', 'BILINMEYEN_SINIF', 'SEMA_DISI']
    for (const h of hepsi) expect(semaHatasiniEsle(h)).toBe('MODEL_CIKTISI')
  })
})

describe('yonlendirmeMetni: hesap, konu dışı, kötü niyet', () => {
  it('üçü sabit, boş değil ve birbirinden farklı; yargı sözcüğü içermez', () => {
    for (const cevir of [cevirTr, cevirEn]) {
      const metinler = (['hesap', 'konu_disi', 'kotu_niyet'] as const).map((s) => yonlendirmeMetni(s, cevir))
      expect(new Set(metinler).size).toBe(3)
      for (const m of metinler) {
        expect(m).not.toMatch(/^asistan\./)
        expect(m).not.toMatch(/uygun|suitab/i)
      }
    }
  })
})

describe('sayaç: FAIL-CLOSED (emsal checkRateLimit boş cevapta izin veriyordu)', () => {
  it('tek satırlı cevap: izin ve sınır doğru ayrışır', () => {
    expect(sayacCevabiniCoz([{ allowed: true, remaining: 7, reset_at: '2026-11-15T12:00:00Z' }])).toEqual({
      durum: 'izin',
      kalan: 7,
    })
    expect(sayacCevabiniCoz([{ allowed: false, remaining: 0, reset_at: 'x' }])).toEqual({ durum: 'sinir' })
  })

  it('tek nesne olarak gelen satır da çözülür', () => {
    expect(sayacCevabiniCoz({ allowed: true, remaining: 3 })).toEqual({ durum: 'izin', kalan: 3 })
  })

  it('BOŞ cevap ölçülemedi sayılır, ASLA izin değil', () => {
    for (const bos of [[], null, undefined, [null], [undefined]]) {
      expect(sayacCevabiniCoz(bos), JSON.stringify(bos)).toEqual({ durum: 'olculemedi', sebep: 'BOS_CEVAP' })
    }
  })

  it('bozuk biçim ölçülemedi sayılır', () => {
    const bozuklar: unknown[] = [
      'ok',
      42,
      true,
      [{}],
      [{ allowed: 'true', remaining: 5 }],
      [{ allowed: 1, remaining: 5 }],
      [{ allowed: true }],
      [{ allowed: true, remaining: '5' }],
      [{ allowed: true, remaining: Number.NaN }],
      [{ allowed: true, remaining: Number.POSITIVE_INFINITY }],
    ]
    for (const b of bozuklar) {
      const sonuc = sayacCevabiniCoz(b)
      expect(sonuc.durum, JSON.stringify(b)).toBe('olculemedi')
    }
  })

  it('negatif kalan sıfıra çekilir', () => {
    expect(sayacCevabiniCoz([{ allowed: true, remaining: -4 }])).toEqual({ durum: 'izin', kalan: 0 })
  })

  it('sayacOku: fırlatan, reddeden ve boş dönen okuma ölçülemedi olur', async () => {
    expect(await sayacOku(() => Promise.reject(new Error('rate_limit_rpc_failed:500')))).toEqual({
      durum: 'olculemedi',
      sebep: 'HATA',
    })
    expect(
      await sayacOku(() => {
        throw new Error('ağ yok')
      }),
    ).toEqual({ durum: 'olculemedi', sebep: 'HATA' })
    expect(await sayacOku(() => Promise.resolve([]))).toEqual({ durum: 'olculemedi', sebep: 'BOS_CEVAP' })
    expect(await sayacOku(() => Promise.resolve([{ allowed: true, remaining: 2 }]))).toEqual({ durum: 'izin', kalan: 2 })
  })

  it('sayacKarari: yalnız izin devam ettirir', () => {
    expect(sayacKarari({ durum: 'izin', kalan: 1 })).toEqual({ devam: true })
    expect(sayacKarari({ durum: 'sinir' })).toEqual({ devam: false, hata: 'ISTEK_SINIRI' })
    expect(sayacKarari({ durum: 'olculemedi', sebep: 'BOS_CEVAP' })).toEqual({ devam: false, hata: 'SAYAC_OLCULEMEDI' })
    expect(sayacKarari({ durum: 'olculemedi', sebep: 'HATA' })).toEqual({ devam: false, hata: 'SAYAC_OLCULEMEDI' })
  })
})
