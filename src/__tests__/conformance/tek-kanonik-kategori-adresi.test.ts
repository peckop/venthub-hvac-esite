import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { Routes } from '../../utils/routes'

/**
 * INV-TEK-ADRES-1 — Bir kategori sayfası TEK adresten yayınlanır.
 *
 * NİÇİN VAR (REC-205 · Google Search Console + canlı ölçüm, 2026-09-07):
 * Her alt kategori İKİ adresten 200 dönüyordu — `/category/<alt>` ve `/category/<üst>/<alt>` —
 * ve **her ikisi de kendini kanonik ilan ediyordu**. İkisi de site haritasındaydı:
 * TR tarafında 23 tek seviyeli + 17 iki seviyeli → **17 × 2 dil = 34 çift adres**.
 *
 * Google bunu ölçtü ve İKİ SEVİYELİ olanı ELEDİ:
 *   GSC "Kopya, Google kullanıcıdan farklı bir standart sayfa seçti"
 *   → /tr/category/fanlar/endustriyel-tavan-vantilatorleri
 * Haklıydı: iki seviyeli varyantta `og:url` ve `CollectionPage` yapısal verisi YOKTU,
 * kırıntı yolu 2 satırdı (tek seviyelide 5).
 *
 * BU KAPI NE YAPAR: üç düzeltmenin de yerinde durduğunu tutar — adres üreteci tek seviyeli,
 * iki seviyeli rota yalnız yönlendirir, site haritası ikinci adresi ilan etmez.
 *
 * BU KAPI NE YAPMAZ: canlıda 301 döndüğünü ölçmez (ağ ister). Onu yayın sonrası ölçüm yapar.
 */

const KOK = path.resolve(__dirname, '../../..')
const SITEMAP = path.join(KOK, 'src/app/sitemap.ts')
const ALT_ROTA = path.join(KOK, 'src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx')
const NEXT_CONFIG = path.join(KOK, 'next.config.mjs')

function oku(dosya: string): string {
  return fs.readFileSync(dosya, 'utf8')
}

/**
 * Yorumları ayıklar; kapı YALNIZ kodu ölçsün diye.
 *
 * NİÇİN (bu kapının kendi ilk koşumunda öğrenildi): kaldırma gerekçesini yorum olarak
 * yazdım ve yorumda `subCategoryRoutes` / `generateStaticParams` kelimeleri geçiyordu —
 * ham metin taraması bunları KOD sandı ve kapı kendi belgesini kusur diye raporladı.
 * Ters yönü daha tehlikelidir ve daha önce yaşandı: yorumda geçen bir desen kapıyı
 * yanlışlıkla YEŞİL yapabilir. İki hâlin de kökü aynı: metin taraması kodu ve yorumu
 * ayırmaz. Bu yüzden ölçüm yorumsuz metin üzerinde yapılır.
 */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ') // blok yorum (JSDoc dahil)
    .replace(/(^|[^:])\/\/.*$/gm, '$1') // satır yorumu (http:// gibi dizeleri korur)
}

describe('INV-TEK-ADRES-1 — kategori adresi tekilliği', () => {
  it('K1 · adres üreteci ALT slug verilse de TEK SEVİYELİ üretir', () => {
    expect(Routes.category('fanlar')).toBe('/category/fanlar')

    // Asıl kol: iki argümanlı çağrı artık iki seviyeli adres ÜRETMEZ.
    expect(
      Routes.category('fanlar', 'kanal-tipi-fanlar'),
      'Routes.category(üst, alt) hâlâ iki seviyeli adres üretiyor — çift yayın geri geldi',
    ).toBe('/category/kanal-tipi-fanlar')

    // Ayırt edicilik: fonksiyon her şeye aynı cevabı vermiyor.
    expect(Routes.category('a', 'b')).toBe('/category/b')
    expect(Routes.category('a')).toBe('/category/a')
    expect(Routes.category('a', undefined)).toBe('/category/a')
    // 'undefined' DİZESİ (eski çağrı yerlerinden gelebilir) üst slug'a düşer, adrese sızmaz.
    expect(Routes.category('a', 'undefined')).toBe('/category/a')

    // Hiçbir üretim yolu iki bölmeli adres vermemeli.
    for (const uretilen of [
      Routes.category('x'),
      Routes.category('x', 'y'),
      Routes.category('x', 'undefined'),
    ]) {
      expect(
        uretilen.split('/').filter(Boolean).length,
        `İki seviyeli adres üretildi: ${uretilen}`,
      ).toBe(2) // ['category', '<slug>']
    }
  })

  it('K2 · SABOTAJ HEDEFİ — site haritası ikinci (kanonik olmayan) adresi İLAN ETMEZ', () => {
    const hamKaynak = oku(SITEMAP)
    const kaynak = yorumsuz(hamKaynak)

    // Evren muhafızı: dosya gerçekten okundu mu, yorum ayıklaması her şeyi silmedi mi?
    expect(hamKaynak.length, 'sitemap.ts boş okundu — kapı hiçbir şey ölçmüyor').toBeGreaterThan(1000)
    expect(
      kaynak.length,
      'Yorum ayıklaması kaynağı tükettі — kapı boş metin ölçüyor olabilir',
    ).toBeGreaterThan(500)
    expect(kaynak, 'sitemap.ts içinde categoryRoutes yok — dosya değişmiş, kapı körleşti').toContain(
      'categoryRoutes',
    )

    expect(
      kaynak,
      'sitemap.ts yeniden subCategoryRoutes üretiyor — aynı sayfa iki adresle ilan edilir ' +
        've Google birini eler (REC-205 vakası)',
    ).not.toContain('subCategoryRoutes')

    // Alt kategori süzgeci de kalmamalı: yalnız iki seviyeli üretim için vardı.
    expect(
      kaynak,
      'sitemap.ts hâlâ subCategoriesWithProducts hesaplıyor — iki seviyeli üretim geri gelmiş olabilir',
    ).not.toContain('subCategoriesWithProducts')

    // ⚠BURADA BİR KOL DENENDİ VE ÇÜRÜTÜLDÜ (aynı koşumda, kayda geçsin):
    // "iki argümanlı Routes.category çağrısı var mı" diye desen aradım. YANLIŞ ÖLÇÜMDÜ —
    // `Routes.category(getLocalizedCategorySlug(cat, lang))` TEK argümanlıdır ama içindeki
    // iç çağrı virgül taşır; düz regex iç içe parantezi anlamaz ve üç sağlam satırı kusur
    // saydı. Kol kaldırıldı çünkü GEREKSİZ de: `Routes.category` artık ikinci argümanı
    // adrese hiç koymuyor (K1 bunu sabotajla tutuyor), yani site haritası ne yazarsa yazsın
    // iki seviyeli adres ÜRETİLEMEZ. Güvence çağrı yerinde değil, üretecin kendisinde.
  })

  it('K3 · iki seviyeli rota yalnız YÖNLENDİRİR, içerik üretmez', () => {
    const hamKaynak = oku(ALT_ROTA)
    const kaynak = yorumsuz(hamKaynak)

    expect(hamKaynak.length, 'alt kategori rotası boş okundu').toBeGreaterThan(300)
    expect(kaynak.length, 'Yorum ayıklaması kaynağı tüketti').toBeGreaterThan(100)
    expect(
      kaynak,
      'iki seviyeli rota kalıcı yönlendirme yapmıyor — çift yayın sürüyor',
    ).toContain('permanentRedirect')

    // İçerik üretimi geri gelmemeli: sayfa bileşeni, statik parametre üretimi, metadata.
    expect(
      kaynak,
      'iki seviyeli rota yeniden içerik üretiyor (PageComponent) — kanonik ikiye böl��nür',
    ).not.toContain('PageComponent')
    expect(kaynak).not.toContain('generateStaticParams')
    expect(kaynak).not.toContain('generateMetadata')
  })

  it('K4 · özel yüzeyler (giriş/hesap/sepet) dizine girmez, ama bağlantıları izlenir', () => {
    const kaynak = oku(NEXT_CONFIG)

    expect(kaynak.length, 'next.config.mjs boş okundu').toBeGreaterThan(1000)
    expect(
      kaynak,
      'X-Robots-Tag başlığı yok — giriş/kayıt/hesap/sepet sayfaları arama sonucuna çıkabilir ' +
        '(GSC 2026-09-07: /tr/auth/login "standart sayfa olmadan kopya")',
    ).toContain('X-Robots-Tag')
    expect(kaynak).toMatch(/X-Robots-Tag['"]\s*,\s*value:\s*['"]noindex,\s*follow['"]/)

    // `follow` kasıtlı: sayfa dizine girmesin ama içindeki bağlantılar izlensin.
    expect(
      kaynak,
      'noindex, nofollow yazılmış — hesap/sepet sayfasından vitrine giden yollar kapanır',
    ).not.toMatch(/X-Robots-Tag['"]\s*,\s*value:\s*['"][^'"]*nofollow/)

    // Üç yüzey de kapsamda olmalı.
    for (const yuzey of ['auth', 'account', 'cart']) {
      expect(kaynak, `${yuzey} yüzeyi X-Robots-Tag kapsamında değil`).toMatch(
        new RegExp(`\\(auth\\|account\\|cart\\)`),
      )
      expect(yuzey).toBeTruthy()
    }

    // KAPSAM SINIRI kayıtlı kalsın: checkout başka şeridin claim'inde, bilerek dışarıda.
    expect(
      kaynak,
      'checkout X-Robots-Tag desenine eklenmiş — o yüzey ALTYAPI claim\'inde, sahibi kapatır',
    ).not.toMatch(/\(auth\|account\|cart\|checkout\)/)
  })
})
