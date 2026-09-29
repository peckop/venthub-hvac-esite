import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { bilincliKurallar, enYayinOku } from '../bot-karnesi.mjs'

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
