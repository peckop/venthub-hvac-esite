/**
 * REC-212 · paket kolon sözleşmesi + CSV katmanı round-trip kapısı + geri yükleyici yolu.
 * Ağa ve DB'ye ÇIKMAZ: sahte paket geçici dizine yazılır.
 *
 * Kilitlenen üç kusur (hepsi 2026-09-22'de sahada ölçüldü):
 *   1. `fiyat` var olmayan `price`/`amount` kolonundan okunuyordu → 1044/1044 BOŞ.
 *   2. Adım 3 betiği teknik dosyayı SABİT başlıkla yeniden yazıyordu → yeni kolon sessizce silinirdi.
 *   3. Geri yükleyici jsonl'i kökte arıyordu, dışa aktarıcı `ham/`e yazıyordu → sınama hiç koşmadı.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import {
  URUN_BASLIK, TEKNIK_BASLIK, TEKNIK_BASLIK_ADIM3, GORSEL_BASLIK, FIYAT_BASLIK,
  HAM_ESLEME, paketHucresi, csvOku, turkceBasliklar, birimler,
} from '../paket-sozlesme.mjs'

const DIZIN = join(__dirname, '..')
const KAPI = join(DIZIN, 'paket-csv-dogrula.mjs')
const YUKLE = join(DIZIN, 'katalog-geri-yukle.mjs')

describe('sözleşme v1 — açılan 8 kolon', () => {
  it('sekiz kolonun sekizi de başlıklarda', () => {
    expect(GORSEL_BASLIK).toContain('alt_metin')
    expect(FIYAT_BASLIK).toEqual(expect.arrayContaining(['fiyat', 'brut_fiyat', 'kdv']))
    expect(URUN_BASLIK).toEqual(expect.arrayContaining(['ust_kategori', 'alt_kategori']))
    expect(URUN_BASLIK).not.toContain('kategori')
    expect(TEKNIK_BASLIK).toEqual(expect.arrayContaining(['birim', 'baslik_tr']))
  })

  it('fiyat NET, brüt BRÜT — base_price hiçbir kolona bağlı değil', () => {
    const k = HAM_ESLEME['fiyatlar.csv'].kolonlar
    expect(k.fiyat).toBe('net_price')
    expect(k.brut_fiyat).toBe('gross_price')
    expect(Object.values(k)).not.toContain('base_price')
  })

  it('adım 3 başlığı üreticinin teknik kolonlarının HEPSİNİ taşır (sessiz silme yok)', () => {
    for (const b of TEKNIK_BASLIK) expect(TEKNIK_BASLIK_ADIM3).toContain(b)
    expect(TEKNIK_BASLIK_ADIM3).toEqual(expect.arrayContaining(['durum', 'kaynak_tur']))
  })

  it('kaynak-eslemesi.mjs başlığı ortak sözleşmeden okur, sabit liste tutmaz', () => {
    const kod = readFileSync(join(DIZIN, 'kaynak-eslemesi.mjs'), 'utf8')
    expect(kod).toMatch(/const BAS = TEKNIK_BASLIK_ADIM3/)
  })
})

describe('Türkçe başlık ve birim kaynakları', () => {
  it('tr.ts pdp.specs okunur; müşterinin gördüğü başlık gelir', () => {
    const h = turkceBasliklar()
    expect(h.size).toBeGreaterThanOrEqual(50)
    expect(h.get('max_delivery_m3h')).toBe('Maksimum Debi (m³/h)')
    expect(h.get('ip_rating')).toBe('Koruma Sınıfı (IP)')
  })

  it('biçimi bozuk sözlük FAIL-CLOSED hata verir, boş harita dönmez', () => {
    const d = mkdtempSync(join(tmpdir(), 'tr-'))
    const yol = join(d, 'tr.ts')
    writeFileSync(yol, "export default {\n  pdp: {\n    specs: {\n      a_b: 'X',\n    },\n  },\n}\n")
    expect(() => turkceBasliklar(yol)).toThrow(/<50/)
    writeFileSync(yol, 'export default {}\n')
    expect(() => turkceBasliklar(yol)).toThrow(/pdp/)
    rmSync(d, { recursive: true, force: true })
  })

  it('birim sözlükten gelir', () => {
    expect(birimler().get('weight_kg')).toBe('kg')
  })
})

describe('csvOku / paketHucresi', () => {
  it('tırnak içi ; ve "" doğru okunur, BOM atılır', () => {
    const { basliklar, satirlar } = csvOku('﻿a;b\r\n"x;y";"he ""dedi"""\r\n')
    expect(basliklar).toEqual(['a', 'b'])
    expect(satirlar).toEqual([{ a: 'x;y', b: 'he "dedi"' }])
  })
  it('null boş, nesne JSON, satır sonu boşluk', () => {
    expect(paketHucresi(null)).toBe('')
    expect(paketHucresi({ a: 1 })).toBe('{"a":1}')
    expect(paketHucresi(' a\nb ')).toBe('a b')
  })
})

// ── sahte paket: 1 ürün · 1 görsel · 1 fiyat · 2 teknik değer
const csvYaz = (yol: string, bas: string[], satirlar: Record<string, unknown>[]) =>
  writeFileSync(yol, '﻿' + [bas.join(';'), ...satirlar.map(r => bas.map(b => paketHucresi(r[b])).join(';'))].join('\r\n') + '\r\n')

let P = ''
const URUN = { id: 'u1', sku: 'VRT-1', name: 'Fan', model_code: '1', brand: 'Vortice', status: 'active', slug: 'fan', category_id: 'c1', subcategory_id: null, technical_specs: { ip_rating: 'IP45', weight_kg: 2.5 } }
const GORSEL = { id: 'g1', product_id: 'u1', path: 't/u1/01.webp', sort_order: 1, alt: 'Fan – 1 – 1' }
const FIYAT = { id: 'f1', product_id: 'u1', price_list_id: 'l1', net_price: 100, gross_price: 120, base_price: 120, currency: 'TRY', valid_from: '2026-01-01', is_active: true }

function paketKur(fiyatHucresi: unknown = 100, gorselBaslik = GORSEL_BASLIK) {
  P = mkdtempSync(join(tmpdir(), 'paket-'))
  mkdirSync(join(P, 'ham'))
  writeFileSync(join(P, 'ham', 'products.jsonl'), JSON.stringify(URUN) + '\n')
  writeFileSync(join(P, 'ham', 'product_images.jsonl'), JSON.stringify(GORSEL) + '\n')
  writeFileSync(join(P, 'ham', 'product_prices.jsonl'), JSON.stringify(FIYAT) + '\n')
  csvYaz(join(P, 'urunler.csv'), URUN_BASLIK, [{ sku: 'VRT-1', ad: 'Fan', model_kodu: '1', marka: 'Vortice', durum: 'active', slug: 'fan', ust_kategori: 'Fanlar', alt_kategori: '' }])
  csvYaz(join(P, 'gorseller.csv'), gorselBaslik, [{ sku: 'VRT-1', sira: 1, alt_metin: 'Fan – 1 – 1' }])
  csvYaz(join(P, 'fiyatlar.csv'), FIYAT_BASLIK, [{ sku: 'VRT-1', fiyat: fiyatHucresi, brut_fiyat: 120, para_birimi: 'TRY', gecerli_baslangic: '2026-01-01', aktif: true }])
  csvYaz(join(P, 'teknik-ozellikler.csv'), TEKNIK_BASLIK, [
    { sku: 'VRT-1', alan: 'ip_rating', deger: 'IP45' }, { sku: 'VRT-1', alan: 'weight_kg', deger: 2.5, birim: 'kg' }])
}
const kos = (betik: string, args: string[], env: Record<string, string> = {}) =>
  spawnSync(process.execPath, [betik, ...args], { encoding: 'utf8', env: { ...process.env, ...env } })

describe('CSV katmanı round-trip kapısı', () => {
  afterAll(() => { if (P) rmSync(P, { recursive: true, force: true }) })

  it('doğru paket → çıkış 0, SIFIR FARK', () => {
    paketKur()
    const r = kos(KAPI, [`--paket=${P}`])
    expect(r.stdout).toContain('SIFIR FARK')
    expect(r.status).toBe(0)
  })

  it('SABOTAJ: fiyat boş (eski price/amount kusuru) → çıkış 1', () => {
    paketKur('')
    const r = kos(KAPI, [`--paket=${P}`])
    expect(r.status).toBe(1)
    expect(r.stdout).toMatch(/fiyat: CSV "" ≠ ham net_price "100"/)
  })

  it('SABOTAJ: fiyat base_price ile doldurulmuş (brüt) → çıkış 1', () => {
    paketKur(120)
    expect(kos(KAPI, [`--paket=${P}`]).status).toBe(1)
  })

  it('SABOTAJ: gorseller.csv alt_metin kolonu yok → başlık farkı, çıkış 1', () => {
    paketKur(100, GORSEL_BASLIK.filter(b => b !== 'alt_metin'))
    const r = kos(KAPI, [`--paket=${P}`])
    expect(r.status).toBe(1)
    expect(r.stdout).toContain('gorseller.csv: BAŞLIK')
  })

  it('ham yarı yoksa FAIL-CLOSED çıkış 2', () => {
    paketKur()
    rmSync(join(P, 'ham'), { recursive: true, force: true })
    expect(kos(KAPI, [`--paket=${P}`]).status).toBe(2)
  })
})

describe('geri yükleyici jsonl yolu (ham/)', () => {
  let E = ''
  beforeAll(() => {
    E = mkdtempSync(join(tmpdir(), 'env-'))
    writeFileSync(join(E, '.env'), 'SUPABASE_URL=http://127.0.0.1:9\nSUPABASE_SERVICE_ROLE_KEY=sahte\n')
  })
  afterAll(() => rmSync(E, { recursive: true, force: true }))

  it('dosyayı ham/ altında BULUR (sha tutmadığı için BOZUK der, "EKSİK" demez) — ağa çıkmadan durur', () => {
    paketKur()
    writeFileSync(join(P, 'ham', 'brands.jsonl'), '{"id":"b1"}\n')
    writeFileSync(join(P, 'manifest.json'), JSON.stringify({ tablolar: { brands: { sha256: 'yanlis' } } }))
    const r = kos(YUKLE, [`--paket=${P}`], { VENTHUB_ENV: join(E, '.env') })
    expect(r.status).toBe(1)
    expect(r.stderr).toContain('brands.jsonl BOZUK')
    expect(r.stderr).not.toContain('EKSİK')
  })
})
