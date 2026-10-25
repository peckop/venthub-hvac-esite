import { describe, expect, it } from 'vitest'

import { kurallar } from './depo-dokum-kapisi.yardimci'

/**
 * INV-DEPO-DOKUM-2 · R1'in TEK dar daraltması (ALT-105, önizleme dalı yanlış alarmı) ve daraltmanın DELİK AÇMADIĞI.
 * (Yaprak-belirteç daraltması denendi ve ATILDI: gerçek `durum` değeri serbest metin; kural uyduruk kalıyordu.)
 *
 * Cetvel: `docs/standards/depoya-giremeyecek-veri-standard.md` (R1). Kapı: `scripts/security/depo-dokum-kapisi.cjs`.
 *
 * Olay: önizleme dalının push'u üç dosyada R1 ile durdu; üçü de kişisel değer taşımıyordu:
 *   · sözlük dosyaları: anahtar adı `tx.e_tcNoN` (kimlik numarası kökü), değer "TC Kimlik No" gibi arayüz etiketi (rakamsız);
 *   · `uygulama-alani.json`: alan adı `adres`, değer `{tr:'/tr/…', en:'/en/…', durum:'hazir'}` (site yolları + durum belirteci).
 *
 * Daraltma A: KİMLİK NUMARASI alanı (tolerans kökü, tam sözlük adı DEĞİL) + metin değerde HİÇ rakam yok → kişisel sayılmaz.
 * Daraltma B: GENEL alanın değeri nesne ve tüm metin yaprakları site yolu/küçük harfli kısa belirteç → kişisel sayılmaz.
 *
 * SABOTAJ: kapıdaki iki satır (kisiselSay içindeki `ALT-105` blokları) silinirse ilk iki test kırmızı olur; satırlar
 * genişletilirse (rakam şartı ya da yaprak şartı kalkarsa) delik testleri kırmızı olur.
 */
describe('INV-DEPO-DOKUM-2 · R1 dar daraltmaları (ALT-105)', () => {
  it('A: kimlik numarası köklü anahtar + rakamsız etiket değeri (sözlük girdisi) R1 vermez', () => {
    const sozluk = JSON.stringify({ 'tx.e_tcNoN': 'TC Kimlik No', 'tx.e_vergiNoN': 'Vergi No' })
    expect(kurallar('veri/sozluk.json', sozluk)).toEqual([])
  })

  it('A DELİĞİ YOK: kimlik numarası köklü anahtarda rakamlı değer (metin ya da sayı) hâlâ R1', () => {
    expect(kurallar('veri/a.json', JSON.stringify({ tc_no: '10000000146' }))).toContain('R1')
    expect(kurallar('veri/a.json', JSON.stringify({ tc_no: 10000000146 }))).toContain('R1')
    expect(kurallar('veri/a.json', JSON.stringify([{ tcno: 'x1' }]))).toContain('R1')
  })

  it('A DELİĞİ YOK: TAM sözlük adı (tckn, customer_name) rakamsız değerde de R1 kalır (daraltma yalnız tolerans köküne)', () => {
    expect(kurallar('veri/a.json', JSON.stringify({ tckn: 'TCKN' }))).toContain('R1')
    expect(kurallar('veri/a.json', JSON.stringify({ customer_name: 'Ayşe Yılmaz' }))).toContain('R1')
  })

  it('uygulama-alani biçimi (adres: {tr, en, durum} nesnesi) daraltılmadı: R1 hâlâ KIRMIZI (çözüm veri tarafında: alan adı yol)', () => {
    const satirlar = Array.from({ length: 5 }, (_, i) => ({ adres: { tr: `/tr/a${i}`, en: `/en/a${i}`, durum: 'öneri · taslak' } }))
    expect(kurallar('veri/uygulama-alani.json', JSON.stringify({ alanlar: satirlar }))).toContain('R1')
    const yolAdli = satirlar.map((s) => ({ yol: s.adres }))
    expect(kurallar('veri/uygulama-alani.json', JSON.stringify({ alanlar: yolAdli }))).toEqual([])
  })
})
