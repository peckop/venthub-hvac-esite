import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { bilincliKurallar, enYayinOku, varsayilanBaslikMi } from '../bot-karnesi.mjs'

/**
 * INV-BOT-KARNESI-EN-YAYIN-1 · bot karnesi EN_YAYIN bayrağını KAYNAKTAN okur; bayrak kapalıyken hreflang
 * yokluğu BİLİNÇLİ sayılır (REC-439).
 *
 * ÖLÇÜLMÜŞ VAKA (2026-09-29, #1493 sonrası canlı): URUN EN_YAYIN kapalıyken hreflang beyanını kaldırdı;
 * betik bunu bilmiyordu ve 45/45 adresi "HREFLANG-YOK" kırmızısı saydı (TR sayfalar dahil) — yanlış alarm.
 * Çözümün ikinci yarısı: bayrak betiğe SABİT yazılmaz (EN_YAYIN açılınca unutulup gerçek hreflang eksiğini
 * gizlerdi); `src/config/features.ts`'ten okunur, okunamazsa HİÇBİR şey bilinçli sayılmaz.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: okuma, kural kapalıyken devreye girmesi, açıkken/belirsizken girmemesi
 * ayrı davranışlardır.
 */

function ozelDosya(icerik: string): string {
  const dizin = mkdtempSync(join(tmpdir(), 'vh-en-yayin-'))
  const yol = join(dizin, 'features.ts')
  writeFileSync(yol, icerik, 'utf8')
  return yol
}

const hreflangKurali = (acik: boolean | null) =>
  bilincliKurallar(acik as boolean).find((k: { sinif: string }) => k.sinif === 'HREFLANG-YOK')

describe('INV-BOT-KARNESI-EN-YAYIN-1 · EN_YAYIN kaynaktan okunur', () => {
  it('KOL 1 · `export const EN_YAYIN = false/true` doğru okunur', () => {
    expect(enYayinOku(ozelDosya('export const EN_YAYIN = false\n'))).toBe(false)
    expect(enYayinOku(ozelDosya('// x\nexport const EN_YAYIN = true // açık\n'))).toBe(true)
  })

  it('KOL 2 · dosya yok ya da bayrak bulunamıyor → null (belirsiz, bilinçli sayılmaz)', () => {
    expect(enYayinOku(join(tmpdir(), 'olmayan-features-dosyasi.ts'))).toBeNull()
    expect(enYayinOku(ozelDosya('export const BASKA = false\n'))).toBeNull()
  })

  it('KOL 3 · GERÇEK depo dosyası okunabiliyor (regex kaynak biçimiyle hâlâ eşleşiyor)', () => {
    expect(typeof enYayinOku(), 'src/config/features.ts EN_YAYIN biçimi değişti: regex artık eşleşmiyor').toBe('boolean')
  })
})

describe('INV-BOT-KARNESI-EN-YAYIN-1 · HREFLANG-YOK bilinçli kuralı', () => {
  it('KOL 4 · bayrak KAPALI → kural var ve HER sayfada koşul doğru (TR dahil)', () => {
    const k = hreflangKurali(false)
    expect(k, 'HREFLANG-YOK bilinçli kuralı yok').toBeDefined()
    expect(k?.kosul({ son: '/tr/products', tur: 'urun-listesi' })).toBe(true)
    expect(k?.kosul({ son: '/en', tur: 'ana' })).toBe(true)
  })

  it('KOL 5 · bayrak AÇIK → kural KOŞMAZ: hreflang eksiği kusur olarak KALIR', () => {
    expect(hreflangKurali(true)?.kosul({ son: '/tr/products' })).toBe(false)
  })

  it('KOL 6 · bayrak BELİRSİZ (null) → kural KOŞMAZ: belirsizlik kusuru gizlemez', () => {
    expect(hreflangKurali(null)?.kosul({ son: '/tr/products' })).toBe(false)
  })

  it('KOL 7 · mevcut /en kuralları bozulmadı (INDEKSE-KAPALI, HARITADA-YOK hâlâ /en için)', () => {
    const kurallar = bilincliKurallar(false) as Array<{ sinif: string; kosul: (s: unknown) => boolean }>
    expect(kurallar.find((k) => k.sinif === 'INDEKSE-KAPALI')?.kosul({ son: '/en/products' })).toBe(true)
    expect(kurallar.find((k) => k.sinif === 'INDEKSE-KAPALI')?.kosul({ son: '/tr/products' })).toBe(false)
  })
})

/**
 * INV-BOT-KARNESI-BASLIK-1 · bot karnesi layout varsayılan başlığını ESKİ ve YENİ biçimde tanır (SEO-25).
 *
 * ÖLÇÜLMÜŞ RİSK (2026-10-09, abartı taraması): `meta.siteTitle` "VentHub — Premium HVAC Çözümleri"nden ana sayfanın canlı başlığına
 * ("VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri") geçiyor. Karne kalıbı eski metne kilitliydi: yeni başlık dağılınca
 * "kendi title yok" (VARSAYILAN-BASLIK) kusurunu GÖRMEZ olurdu. Ters risk: yeni varsayılan ana sayfanın kendi başlığıyla AYNI metin;
 * naif bir kalıp ana sayfayı yanlış kusurlu sayardı.
 *
 * ⚠ KOLLAR BİRBİRİNİN YERİNE GEÇMEZ: eski biçim, yeni biçim, ana sayfa istisnası, yanlış eşleşmeme ve kaynak bağı ayrı davranışlardır.
 */
const ESKI_BASLIK = ['VentHub — Premium HVAC Çözümleri', 'VentHub — Premium HVAC Solutions']
const YENI_BASLIK = [
  'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
  'VentHub | Industrial Ventilation and HVAC Engineering Solutions',
]

describe('INV-BOT-KARNESI-BASLIK-1 · varsayılan başlık tanıma', () => {
  it('KOL B1 · ESKİ biçim (TR/EN) her sayfa türünde varsayılan sayılır, ana sayfa dahil', () => {
    for (const b of ESKI_BASLIK) for (const tur of ['aile-urun', 'kategori', 'ana']) expect(varsayilanBaslikMi(b, tur), `${tur}: ${b}`).toBe(true)
  })

  it('KOL B2 · YENİ biçim (TR/EN) ana sayfa dışındaki sayfada varsayılan sayılır', () => {
    for (const b of YENI_BASLIK) for (const tur of ['aile-urun', 'kategori', 'marka']) expect(varsayilanBaslikMi(b, tur), `${tur}: ${b}`).toBe(true)
  })

  it('KOL B3 · ana sayfa YENİ biçimde kusur sayılmaz (kendi başlığı = site başlığı), ESKİ biçime düşerse sayılır', () => {
    for (const b of YENI_BASLIK) expect(varsayilanBaslikMi(b, 'ana'), b).toBe(false)
    for (const b of ESKI_BASLIK) expect(varsayilanBaslikMi(b, 'ana'), b).toBe(true)
  })

  it('KOL B4 · sayfaya özgü başlık ve yakın benzerleri varsayılan SAYILMAZ', () => {
    for (const b of [
      'Hakkımızda | VentHub',
      'Tüm Ürünler | Endüstriyel Havalandırma ve HVAC — VentHub',
      'VentHub | Endüstriyel Havalandırma',
      'VentHub — Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri',
      'VentHub | Endüstriyel Havalandırma ve HVAC Mühendislik Çözümleri ',
      'VentHub — Premium HVAC',
    ]) expect(varsayilanBaslikMi(b, 'kategori'), b).toBe(false)
  })
})

describe('INV-BOT-KARNESI-BASLIK-1 · kaynak bağı', () => {
  // import.meta.url test çalıştırıcıda `file:` olmayabilir (enYayinOku yedeğiyle aynı gerekçe): depo kökünden okunur.
  const sozluk = (dosya: string): string => readFileSync(join(process.cwd(), 'src', 'i18n', 'dictionaries', dosya), 'utf8')

  it.each(['tr.ts', 'en.ts'])('KOL B5 · %s içindeki meta.siteTitle bot karnesinin kalıbıyla eşleşir (başlık değişirse kalıp da güncellenir)', (dosya) => {
    const eslesme = [...sozluk(dosya).matchAll(/siteTitle:\s*'([^']+)'/g)]
    expect(eslesme, `${dosya}: siteTitle biçimi değişti, kaynak bağı kuramıyorum`).toHaveLength(1)
    const baslik = eslesme[0][1]
    expect(
      varsayilanBaslikMi(baslik, 'kategori'),
      `${dosya} meta.siteTitle (${baslik}) bot karnesinin varsayılan başlık kalıbıyla eşleşmiyor: scripts/seo/bot-karnesi.mjs içindeki ESKI/YENI_VARSAYILAN_BASLIK kalıbına yeni başlığı ekle (eski biçimi dağıtım bitene kadar tut)`,
    ).toBe(true)
  })
})
