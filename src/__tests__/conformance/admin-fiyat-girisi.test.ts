import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-FIYAT-GIRISI-1 · Ürün satırındaki "Fiyat" paneli tek yazma yolunu, geri okumayı, yetki kapısını ve
 * maliyet/marj sızıntı yasağını korur.
 *
 * Cetvel: docs/standards/pricing-standard.md §12.1 (REC-412 Faz 2a, REC-468).
 *
 * Neden test: tsc/lint panelin `products.price`'a doğrudan yazmasını, `select('*')` ile marj alanı çekmesini ya da
 * "Fiyat" düğmesinin yetkisiz role görünmesini yakalayamaz; bunlar sessiz kusurdur (vitrin ile yönetici ekranı ayrışır,
 * moderatör maliyeti görür).
 *
 * KAPSAM: `src/components/admin/products/*` (panel klasörü: yeni yardımcı dosya da taranır), servisin panel okuma
 * işlevi ve ürün tablosundaki bağlantı. Panelin servisten içe aktarabileceği yazma yolu KAPALI LİSTEDİR (aşağıda).
 * ⛔KAPSAM DIŞI, ADIYLA: kural sayfasındaki form (`PricingRuleFormModal`) kendi cetvelinde (§12) ve `INV-FIYAT-GUNLUGU-1`
 * kapısındadır; satır içi giriş (Faz 2b) eklenince bu kapı ona da genişletilir. Kapı METİN taramasıdır: kasıtlı
 * kaçırmayı (dinamik özellik adı üretme vb.) değil, dikkatsiz sapmayı yakalar; asıl sınır sunucu RLS'idir.
 */

declare global {
  interface ImportMeta {
    glob(pattern: string | string[], options: { query: string; import: string; eager: true }): Record<string, string>
  }
}

const PANEL_KLASORU: Record<string, string> = import.meta.glob('/src/components/admin/products/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const DIGER: Record<string, string> = import.meta.glob(
  ['/src/lib/services/pricingProductPrice.service.ts', '/src/views/admin/ProductsTableBody.tsx'],
  { query: '?raw', import: 'default', eager: true },
)

const SERVIS = '/src/lib/services/pricingProductPrice.service.ts'
const TABLO = '/src/views/admin/ProductsTableBody.tsx'
const PANEL = '/src/components/admin/products/ProductPricePanel.tsx'

function oku(yol: string): string {
  const icerik = PANEL_KLASORU[yol] ?? DIGER[yol]
  if (icerik === undefined) throw new Error(`Kaynak bulunamadı (yol değişmiş olabilir; kapıyı güncelle): ${yol}`)
  return icerik
}

/** Yorum satırlarını atar: kapı koda bakar, açıklama metnine değil. `(?<!:)` şemayı (`https://`) yorum sanmaz. */
function kodOlarak(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((satir) => satir.replace(/(?<!:)\/\/.*$/, ''))
    .join('\n')
}

/** `export async function <ad>` / `export function <ad>` gövdesi: bir sonraki üst düzey `export`a kadar. */
function islevGovdesi(kaynak: string, ad: string): string {
  const baslangic = kaynak.search(new RegExp(`export (async )?function ${ad}\\b`))
  if (baslangic < 0) throw new Error(`İşlev bulunamadı: ${ad}`)
  const geri = kaynak.slice(baslangic + 1)
  const sonraki = geri.search(/\nexport /)
  return sonraki < 0 ? kaynak.slice(baslangic) : kaynak.slice(baslangic, baslangic + 1 + sonraki)
}

/** `import { a, type B } from '<modul>'` içe aktarmalarından modül → ad listesi (tür içe aktarmaları çıkarılır). */
function iceAktarmalar(kod: string): Map<string, string[]> {
  const sonuc = new Map<string, string[]>()
  for (const e of kod.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    const adlar = (e[1] ?? '')
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a !== '' && !a.startsWith('type '))
      .map((a) => a.replace(/\s+as\s+\w+$/, ''))
    sonuc.set(e[2] ?? '', [...(sonuc.get(e[2] ?? '') ?? []), ...adlar])
  }
  return sonuc
}

const YAZMA_CAGRISI = /\.(insert|update|upsert|delete|rpc)\s*\(/
const DOLAYLI_ERISIM = /\.from\b|\[\s*['"`]from['"`]\s*\]|\{[^}]*\bfrom\b[^}]*\}\s*=\s*(supabase|client)/
const YASAK_KOLONLAR =
  /\b(margin_pct|min_margin_abs|max_margin_abs|surcharge|cost_in_base|purchase_price|purchase_currency|purchase_rate_to_base)\b/
const JOKER_SECIM = /select\(\s*['"`]\*['"`]/

/** Panelin servisten alabileceği tek yazma yolu + saf/okuma işlevleri: yenisi eklenirse kapı BİLİNÇLİ güncellenir. */
const IZINLI_ADMIN_SERVIS = ['isValidFixedPriceAmount']
const IZINLI_FIYAT_SERVISI = [
  'clearProductPrice',
  'DEFAULT_VAT_RATE_PCT',
  'loadProductPricePanelState',
  'previewProductFixedPrice',
  'setProductPrice',
]

function panelDosyalari(): [string, string][] {
  return Object.entries(PANEL_KLASORU).filter(([yol]) => !yol.includes('/__tests__/'))
}

describe('INV-ADMIN-FIYAT-GIRISI-1 · ürün fiyat paneli', () => {
  it('alt sınır: yorum sıyırıcı yorumu atar, şemayı yemez ve yorumdaki yasak ifadeyi saymaz', () => {
    const ornek = "const u = 'https://ornek.test/x' // margin_pct yorumda\nconst k = 1 /* .from('products') */"
    const kod = kodOlarak(ornek)
    expect(kod).toContain('https://ornek.test/x')
    expect(kod).not.toMatch(YASAK_KOLONLAR)
    expect(kod).not.toMatch(DOLAYLI_ERISIM)
  })

  it('panel klasörü veritabanına DOĞRUDAN erişmez: .from / dolaylı erişim / yazma çağrısı / products.price yok', () => {
    const dosyalar = panelDosyalari()
    expect(dosyalar.map(([yol]) => yol), 'panel ve girdi ayrıştırıcı taranmalı').toEqual(
      expect.arrayContaining([PANEL, '/src/components/admin/products/productPriceInput.ts']),
    )
    for (const [yol, icerik] of dosyalar) {
      const kod = kodOlarak(icerik)
      // ProductFormModal vb. bu klasörde başka amaçlı dosyalar var; kapı yalnız fiyat panelinin dosyalarını kapsar.
      if (!/ProductPricePanel|productPriceInput/.test(yol)) continue
      expect(kod, `${yol}: doğrudan/dolaylı .from yasak; veri servis işlevleriyle okunur/yazılır`).not.toMatch(DOLAYLI_ERISIM)
      expect(kod, `${yol}: doğrudan yazma çağrısı yasak (insert/update/upsert/delete/rpc)`).not.toMatch(YAZMA_CAGRISI)
      expect(kod, `${yol}: products.price'a yazılmaz; vitrin fiyatı kuraldan üretilir`).not.toMatch(/\bproducts\.price\b/)
    }
  })

  it('panelin servisten alabildiği işlevler KAPALI LİSTEDİR: tek yazma yolu setProductPrice/clearProductPrice', () => {
    const ice = iceAktarmalar(kodOlarak(oku(PANEL)))
    const adminServis = ice.get('../../../lib/services/pricingAdmin.service') ?? []
    expect(adminServis.sort(), 'pricingAdmin.service\'ten yalnız tutar doğrulayıcı alınır (createPricingRule vb. yasak)').toEqual(
      [...IZINLI_ADMIN_SERVIS].sort(),
    )
    const fiyatServisi = ice.get('../../../lib/services/pricingProductPrice.service') ?? []
    for (const ad of fiyatServisi) {
      expect(IZINLI_FIYAT_SERVISI, `pricingProductPrice.service'ten "${ad}" izinli listede yok; kapıyı bilinçle güncelle`).toContain(ad)
    }
    for (const [modul, adlar] of ice) {
      if (/\/lib\/services\/pricing\w*\.service$/.test(modul) && !/pricingAdmin|pricingProductPrice/.test(modul)) {
        expect(adlar, `panel başka bir fiyat servisinden içe aktarıyor: ${modul}`).toEqual([])
      }
    }
  })

  it('panelin yazma çağrıları yöntem etiketi "panel" taşır ve servis yazımdan sonra vitrini geri okur', () => {
    const panel = kodOlarak(oku(PANEL))
    expect(panel, 'setProductPrice çağrısı yontem: panel taşır').toMatch(/setProductPrice\s*\([\s\S]*?yontem:\s*'panel'/)
    expect(panel, 'clearProductPrice çağrısı yontem: panel taşır').toMatch(/clearProductPrice\s*\([^)]*yontem:\s*'panel'/)

    const servis = kodOlarak(oku(SERVIS))
    for (const ad of ['setProductPrice', 'clearProductPrice']) {
      expect(
        islevGovdesi(servis, ad),
        `${ad}: yazımdan sonra vitrin geri okuması (recalculateAndVerify → verifyProductStorefrontPrice) şart`,
      ).toMatch(/recalculateAndVerify\s*\(/)
    }
    expect(servis).toMatch(/verifyProductStorefrontPrice\s*\(/)
  })

  it('panel okuması `select(*)` kullanmaz ve maliyet/marj kolonu içermez (moderatör sızıntısı, karar 95)', () => {
    const servis = kodOlarak(oku(SERVIS))
    expect(servis, 'pricingProductPrice.service: select(*) yasak (yardımcı işlevler dahil, tüm dosya)').not.toMatch(JOKER_SECIM)
    const okuma = kodOlarak(islevGovdesi(oku(SERVIS), 'loadProductPricePanelState'))
    expect(okuma).not.toMatch(YASAK_KOLONLAR)

    for (const [yol, icerik] of panelDosyalari()) {
      if (!/ProductPricePanel|productPriceInput/.test(yol)) continue
      const kod = kodOlarak(icerik)
      expect(kod, `${yol}: panel maliyet/marj alanını okumaz ve göstermez`).not.toMatch(YASAK_KOLONLAR)
      expect(kod, `${yol}: select(*) yasak`).not.toMatch(JOKER_SECIM)
    }
  })

  it('panelin okuduğu kural kolonları açık listedir', () => {
    const okuma = kodOlarak(islevGovdesi(oku(SERVIS), 'loadProductPricePanelState'))
    const secimler = [...okuma.matchAll(/\.select\(\s*['"`]([^'"`]+)['"`]/g)].map((e) => e[1] ?? '')
    expect(secimler.length, 'panel okuması en az bir açık kolon listesi taşımalı').toBeGreaterThan(0)
    for (const secim of secimler) expect(secim.trim(), 'joker seçim yok').not.toBe('*')
  })

  it('panel durumu yazılan kural satırını TUTMAZ (satırın tamamında marj/ek ücret var, güvenlik #5)', () => {
    const panel = kodOlarak(oku(PANEL))
    expect(panel).toMatch(/Omit<SetProductPriceResult,\s*'rule'>/)
    expect(panel).not.toMatch(/result:\s*SetProductPriceResult\b/)
  })

  it('"Fiyat" düğmesi ve paneli yalnız fiyat yazma yetkisi olana çizilir (UI ⊆ DB)', () => {
    const tablo = kodOlarak(oku(TABLO))
    expect(tablo, "yetki bayrağı canWrite('pricing')'den gelir").toMatch(/canWritePricing\s*=\s*canWrite\(\s*['"]pricing['"]\s*\)/)

    expect((tablo.match(/pricePanel\.action/g) ?? []).length, '"Fiyat" düğmesi TEK yerde ve koşullu olmalı').toBe(1)
    expect(tablo.match(/\{\s*canWritePricing\s*\?\s*\(\s*<button[\s\S]*?pricePanel\.action/), 'düğme canWritePricing koşuluna bağlı').not.toBeNull()
    expect(tablo.match(/\{\s*canWritePricing\s*\?\s*\(\s*<ProductPricePanel\b/), 'panel canWritePricing koşuluna bağlı').not.toBeNull()
    expect((tablo.match(/openPricePanel\s*\(/g) ?? []).length, 'openPricePanel yalnız koşullu düğmeden çağrılır').toBe(1)
  })

  it('vitrine yansıtma YALNIZ admin/super_admin rolüne açıktır (recalculate maliyet okur)', () => {
    const tablo = kodOlarak(oku(TABLO))
    expect(tablo).toMatch(/canReflectPrice\s*=\s*role\s*===\s*'admin'\s*\|\|\s*role\s*===\s*'super_admin'\s*(\n|$)/)
  })
})
