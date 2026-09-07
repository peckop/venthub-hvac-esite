import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { DESTEKLENEN_DILLER, VARSAYILAN_DIL, yoldanDilCoz } from '../../i18n/yoldanDil'

/**
 * INV-CATI-DIL-1 — Site çatısı (Header + Footer) sayfanın diliyle çizilir.
 *
 * NİÇİN VAR (REC-210, canlı ölçüm 2026-09-07):
 * `/en/category/axial-industrial-fans` sayfasının GÖRÜNÜR metninde 26 tekil Türkçe kelime /
 * 32 geçiş vardı — hepsi menü ve altbilgi. Sebep: çatı, `app/[lang]/layout.tsx`'teki doğru
 * sağlayıcının DIŞINDA; kök `Providers` içindeki `I18nProvider`'a `lang` hiç verilmiyordu ve
 * sağlayıcı sessizce `'tr'`ye düşüyordu. Çeviri eksikliği DEĞİLDİ: `en.ts`'te karşılıklar
 * vardı, `Footer.tsx` sözlüğü kullanıyordu. Metin doğruydu, dil bilgisi ulaşmıyordu.
 *
 * BU KAPI NE YAPAR: dil çözücüsünün doğruluğunu ve çatı sağlayıcısına dilin GERÇEKTEN
 * geçirildiğini tutar. Sabotaj: `ClientLayout`'tan `lang={dil}` silinirse K2 KIRMIZI.
 *
 * BU KAPI NE YAPMAZ: canlı HTML'de Türkçe kelime saymaz (ağ gerektirir). Onu yayın sonrası
 * ölçüm yapar — REC-210 "bitti sayılır" satırı. Ayrıca `<html lang>` özniteliğini ölçmez:
 * o ayrı bir kusur ve çözümü statik üretimle çatışıyor (ayrı kayda taşındı).
 */

const KOK = path.resolve(__dirname, '../../..')
const CLIENT_LAYOUT = path.join(KOK, 'src/components/layout/ClientLayout.tsx')

function oku(dosya: string): string {
  return fs.readFileSync(dosya, 'utf8')
}

describe('INV-CATI-DIL-1 — çatı dili', () => {
  it('K1 · yol dili doğru çözülür (bilinen diller, bilinmeyen segment, boş yol)', () => {
    expect(yoldanDilCoz('/en')).toBe('en')
    expect(yoldanDilCoz('/en/category/fans')).toBe('en')
    expect(yoldanDilCoz('/tr')).toBe('tr')
    expect(yoldanDilCoz('/tr/products/x')).toBe('tr')

    // Dil öneki taşımayan yollar varsayılana düşer — ama varsayılan ADIYLA, gizli değil.
    expect(yoldanDilCoz('/admin')).toBe(VARSAYILAN_DIL)
    expect(yoldanDilCoz('/')).toBe(VARSAYILAN_DIL)
    expect(yoldanDilCoz('')).toBe(VARSAYILAN_DIL)
    expect(yoldanDilCoz(null)).toBe(VARSAYILAN_DIL)
    expect(yoldanDilCoz(undefined)).toBe(VARSAYILAN_DIL)

    // Büyük harfli yol da çözülür (adres büyük/küçük harfe duyarsız gelebilir).
    expect(yoldanDilCoz('/EN/category/fans')).toBe('en')
  })

  it('K2 · SABOTAJ HEDEFİ — çatı sağlayıcısına dil GERÇEKTEN geçiriliyor', () => {
    const kaynak = oku(CLIENT_LAYOUT)

    // Evren muhafızı: dosya gerçekten okundu mu, Providers hâlâ burada mı?
    expect(
      kaynak.length,
      'ClientLayout.tsx boş okundu — kapı hiçbir şey ölçmüyor olabilir',
    ).toBeGreaterThan(500)
    expect(
      kaynak,
      'ClientLayout.tsx içinde Providers bulunamadı — dosya taşınmış olabilir, kapı körleşti',
    ).toContain('export function Providers')

    // Asıl kol: I18nProvider lang PROP'U İLE çağrılmalı. Propsuz kullanım kusurun kendisiydi.
    expect(
      kaynak,
      'Çatı sağlayıcısı dilsiz: <I18nProvider> lang prop\'u OLMADAN kullanılmış. ' +
        'REC-210: bu hâlde sağlayıcı sessizce VARSAYILAN_DIL\'e düşer ve /en sayfasında ' +
        'menü/altbilgi Türkçe basılır.',
    ).toMatch(/<I18nProvider\s+lang=\{/)
    expect(kaynak).not.toMatch(/<I18nProvider>\s*$/m)

    // Dil, yolun kendisinden türetilmeli — sabit yazılmış bir dil kabul edilmez.
    expect(kaynak).toContain('yoldanDilCoz')
    expect(
      kaynak,
      'Çatıda sabit dil yazılmış (lang="tr" / lang="en") — yol yerine sabit kullanmak ' +
        'kusuru başka biçimde geri getirir',
    ).not.toMatch(/<I18nProvider\s+lang=["'](tr|en)["']/)
  })

  it('K3 · SESSİZ VARSAYILAN YASAĞI — çatıda ham dil yedeği yazılmaz', () => {
    const kaynak = oku(CLIENT_LAYOUT)

    // `|| 'tr'` kalıbı tam olarak kusurun kendisiydi: dil "yok" olduğunda kimse fark
    // etmeden Türkçe basılıyordu. Varsayılan yalnız yoldanDil.ts'te, adıyla durur.
    expect(
      kaynak,
      'ClientLayout içinde ham dil yedeği (|| \'tr\') var — varsayılan TEK yerde ' +
        '(yoldanDil.ts VARSAYILAN_DIL) tanımlanır',
    ).not.toMatch(/\|\|\s*['"](tr|en)['"]/)
  })

  it('K4 · çözücü yalnız beyan edilen dilleri tanır (yeni dil sessizce sızamaz)', () => {
    expect(DESTEKLENEN_DILLER).toEqual(['tr', 'en'])
    expect(DESTEKLENEN_DILLER).toContain(VARSAYILAN_DIL)

    // Ayırt edicilik: kapı gerçekten eleme yapıyor mu, yoksa her şeye evet mi diyor?
    expect(yoldanDilCoz('/de/kategorie')).toBe(VARSAYILAN_DIL)
    expect(yoldanDilCoz('/english')).toBe(VARSAYILAN_DIL)
    expect(yoldanDilCoz('/trx')).toBe(VARSAYILAN_DIL)
  })

  it('K5 · çözücü dosyası gerekçesini taşır (soğuk okuyucu kuralı)', () => {
    const cozucu = oku(path.join(KOK, 'src/i18n/yoldanDil.ts'))
    expect(cozucu).toContain('REC-210')
    expect(
      cozucu,
      'yoldanDil.ts kusurun ölçümünü taşımıyor — altı ay sonra okuyan "niçin var" diye sorar',
    ).toMatch(/26 tekil|32 geçiş/)
  })
})
