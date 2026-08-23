/**
 * INV-DUCTCALC-PRESSURE-1 — Kanal Hesaplayıcı'nın basınç kaybı çıktısının kapısı.
 *
 * NİÇİN VAR (T145-VH, 2026-08-23):
 * `calculatePressureLoss` sürtünme faktörünü `f = 0,02 + pürüzlülük·0,1` diye hesaplıyordu —
 * yani galvaniz kanalda pratikte SABİT 0,020015. Gerçek Darcy faktörü 100 mm / 2 m/s'te
 * 0,0312; sonuç olarak hesaplayıcı basınç kaybını **üçte bir eksik** veriyor, kullanıcıya
 * fanı olduğundan güçlü gösteriyordu.
 *
 * Kusur beş ay yaşadı çünkü `hvacCalculations.test.ts` yalnız HIZI ölçüyordu — basınç kaybı
 * çıktısına hiçbir test bakmıyordu. Yani hata yoktu değil, **bakan yoktu**. Bu dosya o
 * boşluğu kapatır ve ölçütü DIŞARIDAN alır: Python `fluids 1.3.1` (MIT) referans seti.
 */
import { describe, expect, it } from 'vitest'

import referans from '../hvac/__tests__/fluids-reference.json'
import { PURUZLULUK_M, surtunmeFaktoru } from '../hvac/ductPressure'
import { calculateDuct } from '../hvacCalculations'

const HAVA_YOGUNLUGU = 1.2

interface SurtunmeReferansi {
  capMm: number
  malzeme: string
  hizMs: number
  Re: number
  f: number
}

/** Verilen çapta hedef hızı üretecek debiyi (m³/h) bulur. */
function debiIcin(hizMs: number, capMm: number): number {
  const r = capMm / 2000
  return hizMs * Math.PI * r * r * 3600
}

describe('INV-DUCTCALC-PRESSURE-1 — Kanal Hesaplayıcı basınç kaybı', () => {
  const satirlar = (referans.surtunme as SurtunmeReferansi[]).filter(
    (s) => s.malzeme === 'galvanized',
  )

  it('referans seti yüklendi (kapının kendi ön koşulu)', () => {
    expect(satirlar.length).toBeGreaterThan(10)
  })

  it('⭐basınç kaybı fluids referansıyla %2 içinde uyuşur', () => {
    for (const s of satirlar) {
      const sonuc = calculateDuct({
        airflow: debiIcin(s.hizMs, s.capMm),
        ductType: 'circular',
        diameter: s.capMm,
        length: 10,
        material: 'galvanized',
      })

      const D = s.capMm / 1000
      const beklenen = (s.f * (HAVA_YOGUNLUGU * s.hizMs * s.hizMs)) / (2 * D)
      const sapma = Math.abs(sonuc.pressureLossPerMeter - beklenen) / beklenen

      expect(
        sapma,
        `cap ${s.capMm} · ${s.hizMs} m/s → hesaplayıcı ${sonuc.pressureLossPerMeter} Pa/m, referans ${beklenen.toFixed(2)} Pa/m`,
      ).toBeLessThan(0.02)
    }
  })

  it('⭐ESKİ SABİT FAKTÖRE DÖNÜŞ KİLİTLİ — f=0,02 gerçeğin belirgin altında', () => {
    // 100 mm galvaniz, 2 m/s. Eski formül burada 0,020015 veriyordu.
    const capMm = 100
    const hiz = 2
    const sonuc = calculateDuct({
      airflow: debiIcin(hiz, capMm),
      ductType: 'circular',
      diameter: capMm,
      length: 10,
      material: 'galvanized',
    })

    const D = capMm / 1000
    const eskiYaklasim = (0.020015 * (HAVA_YOGUNLUGU * hiz * hiz)) / (2 * D)
    expect(sonuc.pressureLossPerMeter / eskiYaklasim).toBeGreaterThan(1.4)
  })

  it('esnek boru, sert kanaldan belirgin yüksek kayıp verir', () => {
    const ortak = { airflow: 400, ductType: 'circular' as const, diameter: 150, length: 10 }
    const galvaniz = calculateDuct({ ...ortak, material: 'galvanized' })
    const esnek = calculateDuct({ ...ortak, material: 'flex' })

    expect(esnek.pressureLossPerMeter).toBeGreaterThan(galvaniz.pressureLossPerMeter * 1.3)
  })

  it('toplam kayıp uzunlukla doğru orantılı', () => {
    const ortak = {
      airflow: 400,
      ductType: 'circular' as const,
      diameter: 150,
      material: 'galvanized' as const,
    }
    const on = calculateDuct({ ...ortak, length: 10 })
    const yirmi = calculateDuct({ ...ortak, length: 20 })

    expect(yirmi.totalPressureLoss / on.totalPressureLoss).toBeCloseTo(2, 1)
  })

  it('dikdörtgen kanalda da eşdeğer çap üzerinden hesaplar', () => {
    const sonuc = calculateDuct({
      airflow: 1000,
      ductType: 'rectangular',
      width: 400,
      height: 200,
      length: 10,
      material: 'galvanized',
    })
    expect(sonuc.pressureLossPerMeter).toBeGreaterThan(0)
    // Eşdeğer çap ~ 310 mm, hız 3,47 m/s → Colebrook mertebesi birkaç Pa/m olmalı.
    expect(sonuc.pressureLossPerMeter).toBeLessThan(5)
  })

  it('sürtünme faktörü TEK kaynaktan gelir — ductPressure ile aynı sayı', () => {
    // İkinci bir kopya yazılırsa (T145 kararının ihlali) bu test kırılır.
    const capMm = 200
    const hiz = 4
    const sonuc = calculateDuct({
      airflow: debiIcin(hiz, capMm),
      ductType: 'circular',
      diameter: capMm,
      length: 1,
      material: 'galvanized',
    })

    const D = capMm / 1000
    const f = surtunmeFaktoru((hiz * D) / 1.5e-5, PURUZLULUK_M.galvanized / D)
    const beklenen = (f * (HAVA_YOGUNLUGU * hiz * hiz)) / (2 * D)
    expect(sonuc.pressureLossPerMeter).toBeCloseTo(Math.round(beklenen * 100) / 100, 1)
  })
})
