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
 * KAPSAM: panel bileşeni, girdi ayrıştırıcı, servisin panel okuma işlevi ve ürün tablosundaki bağlantı.
 * ⛔KAPSAM DIŞI, ADIYLA: kural sayfasındaki form (`PricingRuleFormModal`) kendi cetvelinde (§12) ve `INV-FIYAT-GUNLUGU-1`
 * kapısındadır; satır içi giriş (Faz 2b) eklenince bu kapı ona da genişletilir.
 */

declare global {
  interface ImportMeta {
    glob(pattern: string | string[], options: { query: string; import: string; eager: true }): Record<string, string>
  }
}

const KAYNAKLAR: Record<string, string> = import.meta.glob(
  [
    '/src/components/admin/products/ProductPricePanel.tsx',
    '/src/components/admin/products/productPriceInput.ts',
    '/src/lib/services/pricingProductPrice.service.ts',
    '/src/views/admin/ProductsTableBody.tsx',
  ],
  { query: '?raw', import: 'default', eager: true },
)

function oku(yol: string): string {
  const icerik = KAYNAKLAR[yol]
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

const PANEL = '/src/components/admin/products/ProductPricePanel.tsx'
const GIRDI = '/src/components/admin/products/productPriceInput.ts'
const SERVIS = '/src/lib/services/pricingProductPrice.service.ts'
const TABLO = '/src/views/admin/ProductsTableBody.tsx'

const YAZMA_CAGRISI = /\.(insert|update|upsert|delete|rpc)\s*\(/
const YASAK_KOLONLAR = /\b(margin_pct|surcharge|cost_in_base|purchase_price|purchase_rate_to_base)\b/

describe('INV-ADMIN-FIYAT-GIRISI-1 · ürün fiyat paneli', () => {
  it('alt sınır: yorum sıyırıcı yorumu atar, şemayı yemez ve yorumdaki yasak ifadeyi saymaz', () => {
    const ornek = "const u = 'https://ornek.test/x' // margin_pct yorumda\nconst k = 1 /* .from('products') */"
    const kod = kodOlarak(ornek)
    expect(kod).toContain('https://ornek.test/x')
    expect(kod).not.toMatch(YASAK_KOLONLAR)
    expect(kod).not.toMatch(/\.from\s*\(/)
  })

  it('panel ve girdi ayrıştırıcı veritabanına DOĞRUDAN yazmaz ve tablo okumaz', () => {
    for (const yol of [PANEL, GIRDI]) {
      const kod = kodOlarak(oku(yol))
      expect(kod, `${yol}: doğrudan .from(...) yasak; veri servis işlevleriyle okunur/yazılır`).not.toMatch(/\.from\s*\(/)
      expect(kod, `${yol}: doğrudan yazma çağrısı yasak (insert/update/upsert/delete/rpc)`).not.toMatch(YAZMA_CAGRISI)
      expect(kod, `${yol}: products.price'a yazılmaz; vitrin fiyatı kuraldan üretilir`).not.toMatch(/\bproducts\.price\b/)
    }
  })

  it('panelin yazma yolu geri okumalı servis işlevleridir ve yöntem etiketi "panel"dir', () => {
    const panel = kodOlarak(oku(PANEL))
    expect(panel).toMatch(/\bsetProductPrice\s*\(/)
    expect(panel).toMatch(/\bclearProductPrice\s*\(/)
    expect(panel, 'yöntem başlığı: panel yazımı günlükte yontem=panel olarak görünür').toMatch(/yontem:\s*'panel'/)

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
    const okuma = kodOlarak(islevGovdesi(oku(SERVIS), 'loadProductPricePanelState'))
    expect(okuma, 'loadProductPricePanelState: select(*) marj alanlarını da döndürür').not.toMatch(/select\(\s*['"`]\*['"`]/)
    expect(okuma).not.toMatch(YASAK_KOLONLAR)

    for (const yol of [PANEL, GIRDI]) {
      const kod = kodOlarak(oku(yol))
      expect(kod, `${yol}: panel maliyet/marj alanını okumaz ve göstermez`).not.toMatch(YASAK_KOLONLAR)
      expect(kod, `${yol}: select(*) yasak`).not.toMatch(/select\(\s*['"`]\*['"`]/)
    }
  })

  it('panelin okuduğu kural kolonları açık listedir (yeni kolon eklenirse kapı bilinçli güncellenir)', () => {
    const okuma = kodOlarak(islevGovdesi(oku(SERVIS), 'loadProductPricePanelState'))
    const secimler = [...okuma.matchAll(/\.select\(\s*['"`]([^'"`]+)['"`]/g)].map((e) => e[1] ?? '')
    expect(secimler.length, 'panel okuması en az bir açık kolon listesi taşımalı').toBeGreaterThan(0)
    for (const secim of secimler) {
      expect(secim.trim(), 'joker seçim yok').not.toBe('*')
    }
  })

  it('"Fiyat" düğmesi ve paneli yalnız fiyat yazma yetkisi olana çizilir (UI ⊆ DB)', () => {
    const tablo = kodOlarak(oku(TABLO))
    expect(tablo, 'yetki bayrağı canWrite(pricing)\'den gelir').toMatch(/canWritePricing\s*=\s*canWrite\(\s*['"]pricing['"]\s*\)/)

    const dugme = tablo.match(/\{\s*canWritePricing\s*\?\s*\(\s*<button[\s\S]*?pricePanel\.action/)
    expect(dugme, '"Fiyat" düğmesi canWritePricing koşuluna bağlı olmalı').not.toBeNull()

    const panelCizimi = tablo.match(/\{\s*canWritePricing\s*\?\s*\(\s*<ProductPricePanel\b/)
    expect(panelCizimi, 'ProductPricePanel canWritePricing koşuluna bağlı çizilmeli').not.toBeNull()
  })

  it('vitrine yansıtma yalnız yönetici rollerine açıktır (recalculate maliyet okur)', () => {
    const tablo = kodOlarak(oku(TABLO))
    expect(tablo).toMatch(/canReflectPrice\s*=[^\n]*(admin|super_admin)/)
  })
})
