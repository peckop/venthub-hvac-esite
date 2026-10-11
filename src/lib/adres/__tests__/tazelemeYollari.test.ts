// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { aileYollari, kategoriYollari } from '../tazelemeYollari'

/**
 * INV-TAZELEME-YOL-1 (REC-300 Faz 3g) — webhook, adres şeması bayrağı hangi değerde olursa olsun sayfanın GERÇEK
 * yolunu geçersiz kılar. KORUDUĞU KUSUR: sabit `/tr/products/<slug>` yolu; bayrak açılınca canlı adres
 * `/tr/urun/<slug>` olur, tazeleme yanlış yolu vurur, vitrin bayat kalır ve hiçbir test görmez.
 * ÖLÇMEDİĞİ: Next'in `revalidatePath`ının gerçekten önbelleği düşürmesi (yayın günü canlı ölçüm).
 */
describe('INV-TAZELEME-YOL-1 — tazeleme yolları: aile ve kategori kökü iki şemada ve iki dilde; kategori dalı yalnız yeni şemada (bugünkü TR iki segmentli 308 yolu hariç, URN-7)', () => {
  it('aile: bugünkü ve yeni yol, TR ve EN', () => {
    expect(aileYollari('vortice-lineo-quiet').sort()).toEqual(
      [
        '/tr/products/vortice-lineo-quiet',
        '/en/products/vortice-lineo-quiet',
        '/tr/urun/vortice-lineo-quiet',
      ].sort(),
    )
  })

  it('kategori kökü: bugünkü + yeni, iki dil', () => {
    const yollar = kategoriYollari((d) => (d === 'tr' ? 'fanlar' : 'fans'))
    expect(yollar).toEqual(
      expect.arrayContaining(['/tr/category/fanlar', '/tr/kategori/fanlar', '/en/category/fans']),
    )
  })

  it('kategori dalı: yeni-şema üst/alt yolu üretilir; bugünkü TR iki segmentli 308 yolu üretilmez; tek segmentli alt yol durur (REC-205, URN-7)', () => {
    const yollar = kategoriYollari(
      (d) => (d === 'tr' ? 'sessiz-kanal-fanlari' : 'quiet-duct-fans'),
      (d) => (d === 'tr' ? 'fanlar' : 'fans'),
    )
    expect(yollar).toEqual(
      expect.arrayContaining([
        '/tr/kategori/fanlar/sessiz-kanal-fanlari',
        '/en/category/fans/quiet-duct-fans',
        '/tr/category/sessiz-kanal-fanlari',
      ]),
    )
    // URN-7 (ölçüm 2026-10-01): bugünkü şemanın TR iki segmentli yolu bayrak kapalıyken yalnız 308'dir, önbelleği
    // yok; tazelenmez. AYIRT EDİCİ iddia budur (`not.toContain` TR); EN iki segmentli yol yukarıdaki
    // `arrayContaining` ile yeni-şema dalından zaten doğrulanıyor.
    expect(yollar).not.toContain('/tr/category/fanlar/sessiz-kanal-fanlari')
  })

  it('INV-TAZELEME-YOL-3 — TR eski iki segmentli rota sayfa sınıfı ilan etmedi (ilan ederse yol listeye geri eklenmeli)', () => {
    // KORUDUĞU KUSUR: URN-7 `/<dil>/category/<üst>/<alt>` yolunu "önbelleği olmayan 308" diye tazelemiyor. Bu
    // yalnız o rota sayfa sınıfı (dynamic/revalidate/generateStaticParams/force-static) ilan etmediği sürece doğru.
    // Faz 3-C ilan ederse bu test kırılır. Yorumlar atlanır (rota yorumda ilanı anlatıyor); yalnız kod taranır.
    const KOD_ILANI = /\b(?:export\s+const\s+(?:dynamic|revalidate)|generateStaticParams|force-static)\b/
    const yorumsuz = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    const kaynak = fs.readFileSync(
      path.resolve(__dirname, '../../../app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx'),
      'utf8',
    )
    expect(
      yorumsuz(kaynak),
      "Faz 3-C sayfa sınıfı ilan etti: TR eski iki segmentli yol tazeleme listesine geri eklenmeli (URN-7) — kategoriYollari'na `localizedHref` satırını geri koy ve bu kapıyı güncelle",
    ).not.toMatch(KOD_ILANI)

    // Sabotaj kanıtı: desen gerçek ilanlarda eşleşir, yorumdaki anlatımda eşleşmez (kapı boş geçmiyor).
    const ilanlar: string[] = [
      "export const dynamic = 'force-static'",
      'export const revalidate = 3600',
      'export async function generateStaticParams() { return [] }',
    ]
    for (const ilan of ilanlar) expect(yorumsuz(ilan)).toMatch(KOD_ILANI)
    const yorumdaAnlatim: string = [
      '/**',
      ' * Bu dosya sayfa sınıfı ilan etmiyor (`dynamic`/`revalidate` yok); Faz 3-C `force-static` ilan eder.',
      ' */',
      '// export const revalidate = 60',
    ].join('\n')
    expect(yorumsuz(yorumdaAnlatim)).not.toMatch(KOD_ILANI)
  })

  it('INV-TAZELEME-YOL-2 — tazelemeYollari.ts dil önekini elle birleştirmez (kural 7: önek rota yardımcısından)', () => {
    // KORUDUĞU KUSUR: `/${dil}/category/...` gibi elle önekli şablon; çıktı aynı kalsa da önek kuralı (localizedHref)
    // atlanır. Test kaynağı tarar; çıktıyı DEĞİL, yazım biçimini sınar.
    const ELLE_ONEK = /\/\$\{\s*dil\s*\}\//
    const kaynak = fs.readFileSync(path.resolve(__dirname, '../tazelemeYollari.ts'), 'utf8')
    expect(kaynak, 'elle `/${dil}/` öneki geri gelmiş: `localizedHref` kullan').not.toMatch(ELLE_ONEK)

    // Sabotaj kanıtı: desen, eski satırı içeren bir dizgede GERÇEKTEN eşleşir (kapı boş geçmiyor).
    const eskiSatir = 'if (ustSlug) yollar.add(`/${dil}/category/${ustSlug}/${own}`)'
    expect(eskiSatir).toMatch(ELLE_ONEK)
  })

  it('boş slug yol üretmez; yollar tekil', () => {
    expect(kategoriYollari(() => '')).toEqual([])
    const yollar = aileYollari('x')
    expect(new Set(yollar).size).toBe(yollar.length)
  })

  it('webhook route.ts sabit `/products/${…}` yoluyla revalidatePath çağırmaz (yollar yardımcıdan gelir)', () => {
    const kaynak = fs.readFileSync(
      path.resolve(__dirname, '../../../app/api/webhook/supabase/route.ts'),
      'utf8',
    )
    expect(kaynak, 'sabit aile yolu geri gelmiş: bayrak açılınca yanlış sayfayı tazeler').not.toMatch(
      /revalidatePath\(\s*`\/(?:tr|en|\$\{lang\})\/products\//,
    )
    expect(kaynak).not.toMatch(/revalidatePath\(\s*`\/(?:tr|en|\$\{lang\})\/category\//)
    expect(kaynak).toMatch(/aileYollari\(/)
    expect(kaynak).toMatch(/kategoriYollari\(/)
  })
})
