// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-HAKKIMIZDA-SAYAC-1 — Hakkımızda sayfasındaki marka / aktif ürün / aile sayıları CANLI veriden gelir (URN-75).
 *
 * KORUDUĞU KUSUR: sayfa dört sayıyı elle yazıyordu (6, 50+, 81, 15+). "81 il" dayanaksız bir sevkiyat vaadiydi
 * (karar 295) ve elle yazılan sayı ürün eklendikçe sessizce yanlışlaşır. Ayrıca sayfa DB'den sayı basmaya başlayınca
 * "tam statik" sınıfından çıkar: tazeleme sözleşmesi (rendering-cache-standard §3) kurulmadan sayı bayat kalırdı.
 *
 * KAPI: (1) elle yazılmış sayaç değeri yok (yalnız kurucu yılı `15+` izinli), (2) rota ISR ilan eder ve sayacı
 * önbellekli sarmaldan okur, (3) sarmal anahtarı `lang` + `tenantId`, etiketi keşif etiketi (kural 12), (4) webhook
 * `products` / `product_families` / `brands` dallarında keşif etiketini tazeler ve ürün için duyarlı alanlar
 * `status` / `family_id` / `deleted_at`'i içerir, (5) hata sayfayı çökertmez: sayaç `null`, kartlar çizilmez.
 * NE ÖLÇMEZ: canlıda bir ürün değişince sayfanın gerçekten yenilendiği (render cetveli §1.1: canlıda ayrıca ölçülür).
 */
const KOK = path.resolve(__dirname, '../../..')
const oku = (yol: string) => fs.readFileSync(path.join(KOK, yol), 'utf8')

/** `stats` dizisinde elle yazılmış, `15+` dışındaki sayı değerleri (saf: sentetik girdiyle sınanır). */
function elleYazilmisSayaclar(kaynak: string): string[] {
  const blok = kaynak.match(/const stats = \[[\s\S]*?\n  \]/)
  if (!blok) return ['stats bloğu bulunamadı']
  return [...blok[0].matchAll(/value:\s*(['"`])([^'"`]*)\1/g)]
    .map((m) => m[2])
    .filter((deger) => deger !== '15+')
}

describe('INV-HAKKIMIZDA-SAYAC-1', () => {
  describe('elle yazılmış sayaç dedektörü (sentetik)', () => {
    it('eski dört sayıyı yakalar', () => {
      const eski = `const stats = [
    { value: '15+', label: t('a'), icon: Zap },
    { value: '6', label: t('b'), icon: Award },
    { value: '50+', label: t('c'), icon: Factory },
    { value: '81', label: t('d'), icon: Globe }
  ]`
      expect(elleYazilmisSayaclar(eski)).toEqual(['6', '50+', '81'])
    })

    it('canlı veriden gelen değere ve kurucu yılına izin verir', () => {
      const yeni = `const stats = [
    { value: '15+', label: t('a'), icon: Zap },
    ...(sayaclar ? [{ value: String(sayaclar.markaSayisi), label: t('b'), icon: Award }] : [])
  ]`
      expect(elleYazilmisSayaclar(yeni)).toEqual([])
    })

    it('çift tırnak ve şablon dizesiyle yazılan sayıyı da yakalar', () => {
      expect(elleYazilmisSayaclar(`const stats = [\n    { value: "81", label: x },\n    { value: \`441\`, label: y }\n  ]`)).toEqual(['81', '441'])
    })

    it('stats bloğu yoksa susmaz', () => {
      expect(elleYazilmisSayaclar('const baska = 1')).toEqual(['stats bloğu bulunamadı'])
    })
  })

  it('AboutPage sayaçları elle yazmaz ve sayıyı `sayaclar` prop`undan alır', () => {
    const kaynak = oku('src/views/AboutPage.tsx')
    expect(elleYazilmisSayaclar(kaynak), 'AboutPage stats içinde elle yazılmış sayı var').toEqual([])
    for (const alan of ['markaSayisi', 'aktifUrunSayisi', 'aileSayisi']) {
      expect(kaynak, `${alan} sayfada kullanılmıyor`).toContain(`sayaclar.${alan}`)
    }
  })

  it('rota ISR ilan eder ve sayacı önbellekli sarmaldan okur', () => {
    const rota = oku('src/app/[lang]/about/page.tsx')
    expect(rota).toMatch(/export const dynamic = 'force-static'/)
    expect(rota).toMatch(/export const revalidate = 3600/)
    expect(rota).toMatch(/siteSayaclariOku\(lang, DEFAULT_TENANT_ID\)/)
    expect(rota).toMatch(/<PageComponent lang=\{lang\} sayaclar=\{sayaclar\} \/>/)
  })

  it('sarmal anahtarı lang + tenantId, etiketi keşif etiketi; hata önbelleğe yazılmaz, sayfaya null döner', () => {
    const sarmal = oku('src/app/_components/siteSayaclari.ts')
    expect(sarmal).toMatch(/\['site-sayaclari', lang, tenantId\]/)
    expect(sarmal).toMatch(/tags: \[PRODUCTS_DISCOVERY_TAG, discoveryTag\(tenantId\)\]/)
    expect(sarmal).toMatch(/revalidate: 3600/)
    expect(sarmal).toMatch(/catch \(hata\)[\s\S]*return null/)
    expect(oku('src/lib/services/siteSayaclari.service.ts')).toMatch(/if \(error\) throw error/)
  })

  it('TAZELEME: sayının dayandığı üç tablo keşif etiketini tazeler', () => {
    const rota = oku('src/app/api/webhook/supabase/route.ts')
    const dal = (bas: string) => {
      const i = rota.indexOf(bas)
      expect(i, `${bas} dalı bulunamadı`).toBeGreaterThan(-1)
      const j = rota.slice(i + bas.length).search(/\n\s*else if \(table ===/)
      return rota.slice(i, j === -1 ? undefined : i + bas.length + j)
    }
    expect(dal("if (table === 'products') {")).toMatch(/revalidateTag\(PRODUCTS_DISCOVERY_TAG\)|shouldRevalidateDiscovery/)
    expect(dal("else if (table === 'product_families') {")).toMatch(/revalidateTag\(PRODUCTS_DISCOVERY_TAG\)/)
    expect(dal("else if (table === 'brands') {")).toMatch(/revalidateTag\(PRODUCTS_DISCOVERY_TAG\)/)
    const duyarli = rota.match(/PRODUCT_DISCOVERY_SENSITIVE_FIELDS = \[([\s\S]*?)\] as const/)![1]
    for (const alan of ['status', 'family_id', 'deleted_at']) {
      expect(duyarli, `${alan} değişince keşif etiketi tazelenmiyor: sayaç bayat kalır`).toContain(`'${alan}'`)
    }
  })

  it('sözlük: aile etiketi iki dilde var, "il sevkiyat" vaadi anahtarı kalktı', () => {
    for (const dosya of ['src/i18n/dictionaries/tr.ts', 'src/i18n/dictionaries/en.ts']) {
      const kaynak = oku(dosya)
      expect(kaynak, `${dosya}: productFamilies yok`).toMatch(/productFamilies:\s*'[^']+'/)
      expect(kaynak, `${dosya}: shippingNetwork geri geldi`).not.toMatch(/shippingNetwork:/)
    }
  })
})
