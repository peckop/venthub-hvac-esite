import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { FamilyListItem } from '@/types/ui-models'

import { MarkaSayfasi } from '../_components/markaSayfasi'

/**
 * URN-145 — marka sayfasının aile listesi SUNUCUDA okunur ve fiyatı süzülür (INV-FIYAT-SIZINTI-3 yüzeyi).
 *
 * NİÇİN: `BrandDetailPage` ('use client') listeyi tarayıcıdan çekiyordu; XHR yanıtı teklif modundaki ailenin gerçek
 * `min_price`'ını taşıyordu. Kapılar: (a) `MarkaSayfasi` görünüme süzülmüş aileleri `initialFamilies` olarak geçirir,
 * (b) ürünsüz markada okuma HİÇ atılmaz, (c) okuma hatasında boş liste + uyarı (sayfa kırılmaz), (d) görünüm dosyası
 * tarayıcı client'ına / aile servisine bağlı değildir.
 */
vi.mock('@/lib/supabase/static', () => ({ supabaseStaticClient: {} }))

afterEach(() => {
  vi.restoreAllMocks()
})

const aile = (id: string, minPrice: number | null): FamilyListItem => ({
  id,
  name: `Aile ${id}`,
  slug: `aile-${id}`,
  series_code: null,
  description: null,
  brand_name: 'Vortice',
  category_id: null,
  subcategory_id: null,
  cover_image_path: null,
  variant_count: 3,
  min_price: minPrice,
  total_count: 3,
})

const fiyatSayisi = (veri: unknown) => (JSON.stringify(veri).match(/"min_price":[0-9][0-9.]*/g) ?? []).length

function gorunum(el: unknown) {
  const cocuklar = (el as ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>).props.children
  return cocuklar[1].props as { initialFamilies: FamilyListItem[]; urunsuz: boolean }
}

describe('MarkaSayfasi: aile kartları sunucuda okunur, fiyat süzülür (URN-145)', () => {
  it('KURGU FİYATLI — sahte-yeşil olmasın', () => {
    expect(fiyatSayisi([aile('1', 37773), aile('2', null)])).toBe(1)
  })

  it('ürünlü markada aileler okunur; teklif modunda (kategori yok) min_price görünüme GİTMEZ, diğer alanlar korunur', async () => {
    const oku = vi.fn(async () => [aile('1', 37773), aile('2', 41200.5), aile('3', null)])
    const { initialFamilies, urunsuz } = gorunum(
      await MarkaSayfasi({ lang: 'tr', slug: 'vortice', sayac: async () => 5, katalogOzeti: async () => null, aileler: oku }),
    )
    expect(oku).toHaveBeenCalledWith('Vortice')
    expect(urunsuz).toBe(false)
    expect(initialFamilies.map((f) => f.id)).toEqual(['1', '2', '3'])
    expect(fiyatSayisi(initialFamilies)).toBe(0)
    expect(initialFamilies.every((f) => f.min_price === null)).toBe(true)
  })

  it('ürünsüz markada (sayı 0) aile okuması HİÇ atılmaz; liste boştur', async () => {
    const oku = vi.fn(async () => [aile('1', 100)])
    const { initialFamilies, urunsuz } = gorunum(
      await MarkaSayfasi({ lang: 'tr', slug: 'flexiva', sayac: async () => 0, katalogOzeti: async () => null, aileler: oku }),
    )
    expect(oku).not.toHaveBeenCalled()
    expect(urunsuz).toBe(true)
    expect(initialFamilies).toEqual([])
  })

  it('okuma hatasında (ağ yok / DB hatası) boş liste, hata FIRLATILMAZ, uyarı basılır', async () => {
    const uyari = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { initialFamilies, urunsuz } = gorunum(
      await MarkaSayfasi({
        lang: 'en',
        slug: 'vortice',
        sayac: async () => 5,
        katalogOzeti: async () => null,
        aileler: async () => {
          throw new Error('ağ yok')
        },
      }),
    )
    expect(initialFamilies).toEqual([])
    expect(urunsuz).toBe(false)
    expect(uyari).toHaveBeenCalledTimes(1)
  })

  it('kaynak: okuma önbellekli, anahtar lang + tenantId + marka adı; keşif etiketiyle tazelenir; süzgeç null kategoriyle', () => {
    const k = readFileSync(join(process.cwd(), 'src/app/_components/markaSayfasi.tsx'), 'utf8')
    expect(k).toMatch(/\['brand-families',\s*lang,\s*tenantId,\s*markaAdi\]/)
    expect(k).toMatch(/getCachedMarkaAileleri[\s\S]{0,400}tags:\s*\[PRODUCTS_DISCOVERY_TAG,\s*discoveryTag\(tenantId\)\]/)
    expect(k).toMatch(/listeFiyatiniSuz\(\s*\(await oku\(brand\.name\)\)\.map\(\(f\) => \(\{ \.\.\.f, description: null \}\)\)\s*,\s*null\s*\)/)
  })
})

describe('MarkaSayfasi: açıklama (TR+EN) istemciye inmez (INV-DIL-DUSUSU-1)', () => {
  it('FamilyCard description okumaz; ham {tr,en} nesnesi görünüme gitmez', async () => {
    const aciklamali = { ...aile('1', 100), description: { tr: 'Çelik gövdeli, direkt akuple, orta basınçlı fan', en: 'Steel casing fan' } }
    expect(JSON.stringify(aciklamali)).toContain('Çelik gövdeli')
    const { initialFamilies } = gorunum(
      await MarkaSayfasi({ lang: 'en', slug: 'vortice', sayac: async () => 5, katalogOzeti: async () => null, aileler: async () => [aciklamali] }),
    )
    expect(initialFamilies.every((f) => f.description === null)).toBe(true)
    expect(JSON.stringify(initialFamilies)).not.toContain('Çelik gövdeli')
  })
})

describe('BrandDetailPage: tarayıcıdan veri çekmez (URN-145)', () => {
  it("kaynak metninde supabaseBrowserClient / getFamiliesEnriched / useEffect yok; initialFamilies prop'u var", () => {
    const k = readFileSync(join(process.cwd(), 'src/views/BrandDetailPage.tsx'), 'utf8')
    expect(k).not.toContain('supabaseBrowserClient')
    expect(k).not.toContain('getFamiliesEnriched')
    expect(k).not.toMatch(/family\.service/)
    expect(k).not.toMatch(/\buseEffect\b/)
    expect(k).toMatch(/initialFamilies\??:\s*FamilyListItem\[\]/)
  })
})
