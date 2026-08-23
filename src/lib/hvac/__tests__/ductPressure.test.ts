/**
 * INV-DUCTPRESSURE-1 — kanal basınç kaybı, BAĞIMSIZ bir profesyonel kaynağa karşı ölçülür.
 *
 * BU TESTİN ASIL İDDİASI:
 * Sürtünme faktörü kendi uydurduğumuz bir sabit değil, Colebrook-White'ın gerçek çözümü
 * olmalı. Doğrulama fikstürü elle yazılmadı: Python **fluids 1.3.1** (MIT, Caleb Bell)
 * kütüphanesinin `friction_factor()` çıktısından üretildi (54 senaryo). Böylece bu dosya
 * "kendi hesabımı kendi beklentimle doğruladım" tuzağına düşmez — ölçüt DIŞARIDAN gelir.
 *
 * NİÇİN ÖNEMLİ: projedeki eski yaklaşım (`hvacCalculations.calculatePressureLoss`)
 * f ≈ 0,02 + pürüzlülük·0,1 diyor. 100 mm galvaniz kanalda 2 m/s'te gerçek değer 0,0312,
 * o formül 0,0200 veriyor — basınç kaybı üçte bir eksik, fan olduğundan güçlü görünüyor.
 * Aşağıdaki "eski yaklaşım yetersizdi" testi bu farkı KİLİTLER; biri sabit faktöre geri
 * dönerse kırmızı verir.
 */
import { describe, expect, it } from 'vitest'

import {
  akisHizi,
  dinamikBasinc,
  FITTING_K,
  HAVA_KINEMATIK_VISKOZITE,
  kanalBasincKaybi,
  PURUZLULUK_M,
  reynolds,
  surtunmeFaktoru,
  TERMINAL_K_TOPLAM,
} from '../ductPressure'
import referans from './fluids-reference.json'

interface SurtunmeReferansi {
  capMm: number
  malzeme: string
  hizMs: number
  Re: number
  f: number
}

describe('surtunmeFaktoru — Colebrook-White, fluids kütüphanesine karşı', () => {
  const satirlar = referans.surtunme as SurtunmeReferansi[]

  it('referans seti gerçekten yüklendi (kapının kendi ön koşulu)', () => {
    // Fikstür boş gelirse aşağıdaki döngü hiç koşmaz ve test SESSİZCE yeşil kalırdı.
    expect(satirlar.length).toBe(54)
    expect(referans.uretici).toContain('fluids')
  })

  it('54 senaryonun HEPSİNDE fluids ile %0,5 içinde uyuşur', () => {
    for (const s of satirlar) {
      const malzeme = s.malzeme as keyof typeof PURUZLULUK_M
      const bagil = PURUZLULUK_M[malzeme] / (s.capMm / 1000)
      const bizim = surtunmeFaktoru(s.Re, bagil)
      const sapmaYuzde = Math.abs(bizim - s.f) / s.f
      expect(
        sapmaYuzde,
        `cap ${s.capMm} ${s.malzeme} ${s.hizMs} m/s → bizim ${bizim.toFixed(6)} vs fluids ${s.f}`,
      ).toBeLessThan(0.005)
    }
  })

  it('Reynolds hesabımız referans setindekiyle aynı tabana oturuyor', () => {
    expect(referans.hava_kinematik_viskozite_m2s).toBe(HAVA_KINEMATIK_VISKOZITE)
    const s = satirlar[0]
    expect(reynolds(s.hizMs, s.capMm)).toBeCloseTo(s.Re, 0)
  })

  it('⭐ESKİ YAKLAŞIM YETERSİZDİ — sabit f ≈ 0,02 gerçeğin belirgin altında', () => {
    // 100 mm galvaniz, 2 m/s. Eski formül: 0,02 + (0,15/1000)·0,1 ≈ 0,0200
    const bagil = PURUZLULUK_M.galvanized / 0.1
    const gercek = surtunmeFaktoru(reynolds(2, 100), bagil)
    expect(gercek).toBeGreaterThan(0.03)
    expect(gercek / 0.02).toBeGreaterThan(1.4) // en az %40 fark
  })

  it('laminer bölgede analitik çözüme döner (f = 64/Re)', () => {
    expect(surtunmeFaktoru(1000, 0.001)).toBeCloseTo(64 / 1000, 6)
  })

  it('pürüzlü kanal her zaman pürüzsüzden yüksek sürtünme verir', () => {
    const Re = 5e4
    const pvc = surtunmeFaktoru(Re, PURUZLULUK_M.pvc / 0.15)
    const galv = surtunmeFaktoru(Re, PURUZLULUK_M.galvanized / 0.15)
    const flex = surtunmeFaktoru(Re, PURUZLULUK_M.flex / 0.15)
    expect(galv).toBeGreaterThan(pvc)
    expect(flex).toBeGreaterThan(galv)
  })

  it('geçersiz girdide sahte sayı üretmez', () => {
    expect(surtunmeFaktoru(0, 0.001)).toBe(0)
    expect(surtunmeFaktoru(Number.NaN, 0.001)).toBe(0)
  })
})

describe('akış büyüklükleri', () => {
  it('debi → hız dönüşümü kesit alanına dayanır', () => {
    // 150 mm kanal, 0,01767 m² kesit. 200 m³/h = 0,05556 m³/s → ≈ 3,14 m/s
    expect(akisHizi(200, 150)).toBeCloseTo(3.14, 1)
  })

  it('dinamik basınç ρV²/2', () => {
    expect(dinamikBasinc(4)).toBeCloseTo((1.2 * 16) / 2, 6)
  })

  it('sıfır çapta bölme hatası vermez', () => {
    expect(akisHizi(200, 0)).toBe(0)
  })
})

describe('kanalBasincKaybi — sistem eğrisinin tasarım noktası', () => {
  const kanal = {
    uzunlukM: 6,
    capMm: 150,
    malzeme: 'galvanized' as const,
    dirsek90: 2,
    dirsek45: 0,
  }

  it('sürtünme ve yerel kayıpları AYRI AYRI raporlar', () => {
    const d = kanalBasincKaybi(200, kanal)
    expect(d.surtunmeKaybiPa).toBeGreaterThan(0)
    expect(d.yerelKayipPa).toBeGreaterThan(0)
    expect(d.toplamPa).toBeCloseTo(d.surtunmeKaybiPa + d.yerelKayipPa, 9)
  })

  it('yerel kayıp K katsayılarıyla tutarlı (dirsekler + sabit terminaller)', () => {
    const d = kanalBasincKaybi(200, kanal)
    const beklenen = (2 * FITTING_K.dirsek90 + TERMINAL_K_TOPLAM) * dinamikBasinc(d.hizMs)
    expect(d.yerelKayipPa).toBeCloseTo(beklenen, 9)
  })

  it('⭐terminal kayıplar HER ZAMAN sayılır — menfez/klape/panjur seçenek değildir', () => {
    // Dirseksiz, çok kısa bir kanalda bile sistem direnci sıfıra yakın OLMAMALI.
    const d = kanalBasincKaybi(200, { ...kanal, uzunlukM: 0.5, dirsek90: 0, dirsek45: 0 })
    expect(d.yerelKayipPa).toBeGreaterThan(d.surtunmeKaybiPa)
    expect(d.toplamPa).toBeGreaterThan(20)
  })

  it('⭐basınç kaybı debinin KARESİYLE büyür — sistem eğrisinin temel davranışı', () => {
    const tek = kanalBasincKaybi(200, kanal).toplamPa
    const cift = kanalBasincKaybi(400, kanal).toplamPa
    // f de Re ile hafif değiştiği için tam 4× değil; 3,5–4,2 bandı beklenir.
    expect(cift / tek).toBeGreaterThan(3.5)
    expect(cift / tek).toBeLessThan(4.2)
  })

  it('daha uzun kanal ve daha çok dirsek daha yüksek kayıp verir', () => {
    const kisa = kanalBasincKaybi(200, { ...kanal, uzunlukM: 3, dirsek90: 1 })
    const uzun = kanalBasincKaybi(200, { ...kanal, uzunlukM: 12, dirsek90: 4 })
    expect(uzun.toplamPa).toBeGreaterThan(kisa.toplamPa)
  })

  it('dar kanal aynı debide çok daha yüksek kayıp üretir', () => {
    const genis = kanalBasincKaybi(300, { ...kanal, capMm: 200 })
    const dar = kanalBasincKaybi(300, { ...kanal, capMm: 100 })
    expect(dar.toplamPa).toBeGreaterThan(genis.toplamPa * 5)
  })
})
