/**
 * INV-FAMILY-DETAIL-CATEGORY-1 — ürün detayı, breadcrumb'ın kategori ADINI çözebilmesi için
 * TAM kategori satırını taşımalı; id yetmez.
 *
 * NİÇİN VAR (2026-08-23):
 * `get_family_detail` RPC'si yalnız `category_id`/`subcategory_id` döndürüyor. Kategori adı
 * `getCategoryDisplayName` ile çözülür ve o fonksiyon SATIR ister (`translation_key`,
 * `menu_label`, `name` orada) — id ile hiçbir ad üretilemez. Sonuç: seri dalı (`getSeriesLanding`,
 * K7'de satırı gömüyor) kategori basamağını çizebiliyor, MODEL dalı çizemiyordu. Aynı rota,
 * iki dal, asimetrik sözleşme.
 *
 * Bu asimetri sessizdi: tip hatası yok, kırmızı test yok — yalnızca ürün sayfasının
 * breadcrumb'ında kategori basamağı hiç doğmuyordu.
 *
 * Yöntem: gerçek supabase-js istemcisi + sahte `fetch` (repo deseni: family.service.slugs.test.ts)
 * — tip hilesi yok; RPC de tablo sorgusu da gerçekten HTTP üzerinden çözülür.
 */
import { createClient } from '@supabase/supabase-js'
import { describe, expect, it } from 'vitest'

import type { Database } from '@/types/database.types'

import { getFamilyDetail } from '../family.service'

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const KATEGORI_SATIRLARI = [
  { id: 'cat-kok', slug: 'residential-ventilation', name: 'Residential Ventilation' },
  { id: 'cat-alt', slug: 'inline-duct-fans', name: 'Kanal İçi Hayalet Fanlar' },
]

/**
 * @param categoryId     RPC'nin döndürdüğü kök kategori id'si (null = hiç yok)
 * @param subcategoryId  RPC'nin döndürdüğü alt kategori id'si
 * @param mevcutSatirlar `categories` tablosunun döndüreceği satırlar (eksik satır senaryosu için)
 */
function stubClient(
  categoryId: string | null,
  subcategoryId: string | null,
  mevcutSatirlar = KATEGORI_SATIRLARI,
) {
  const kategoriSorgulari: string[] = []
  /** REC-108: aile adı çevirisi sorguları — sayısı kola bağlı (aşağıda). */
  const adSorgulari: string[] = []
  /** REC-110: varyant adı çevirisi sorguları — id kümesi başına TEK olmalı (aşağıda). */
  const varyantAdSorgulari: string[] = []

  const fakeFetch: typeof fetch = async (input) => {
    const url =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

    if (url.includes('/rpc/get_family_detail')) {
      return jsonResponse({
        family: {
          id: 'fam-1',
          name: 'Lineo 150 Quiet',
          slug: 'vortice-lineo-150-quiet',
          series_code: 'LINEO',
          description: null,
          brand_name: 'Vortice',
          category_id: categoryId,
          subcategory_id: subcategoryId,
          meta_title: null,
          meta_description: null,
        },
        variants: [{ id: 'v-1', sku: 'VRT-17162', price: 100 }],
        price_tax_included: true,
      })
    }

    if (url.includes('/categories')) {
      kategoriSorgulari.push(url)
      // PostgREST filtresi URL'de yüzde-kodlu gelir: `id=in.%28a%2Cb%29`. Önce ÇÖZ, sonra eşle —
      // düz parantez arayan bir regex burada hiçbir zaman eşleşmez ve sahte istemci sessizce
      // boş liste döndürüp testi yanlış-kırmızı yapar.
      const cozulmus = decodeURIComponent(url)
      const istenen = new Set(
        (cozulmus.match(/id=in\.\(([^)]*)\)/)?.[1] ?? '')
          .split(',')
          .map((s) => s.replace(/"/g, '').trim())
          .filter(Boolean),
      )
      expect(istenen.size, 'kategori sorgusu bos filtreyle atilmis').toBeGreaterThan(0)
      return jsonResponse(mevcutSatirlar.filter((c) => istenen.has(c.id)))
    }

    // REC-108: aile ADI çevirileri (`name_i18n`) RPC'de YOK — kolon DB'de dolu ama
    // `get_family_detail` ham `f.name` döndürüyor. Ad, kategori satırlarıyla AYNI desende
    // tek ek sorguyla gömülüyor. Bu dal o sorguyu MEŞRU kılar; sayısı aşağıda kola bağlı.
    if (url.includes('/product_families')) {
      adSorgulari.push(url)
      return jsonResponse([{ name_i18n: { tr: null, en: 'Vortice Lineo Quiet Inline Duct Fans' } }])
    }

    // REC-110: VARYANT adı çevirileri (`products.name_i18n`) — aile adıyla aynı desen, aynı
    // gerekçe. `/product_families` dalı YUKARIDA ve önce eşleşir; bu dal yalnız `products`
    // tablosunu yakalar. Sayısı aşağıda kola bağlı (id kümesi başına TEK sorgu).
    if (url.includes('/products?')) {
      varyantAdSorgulari.push(url)
      return jsonResponse([{ id: 'v-1', name_i18n: { tr: null, en: 'Lineo 150 Quiet Inline Fan' } }])
    }

    throw new Error('beklenmeyen istek: ' + url)
  }

  const supabase = createClient<Database>('https://ornek.supabase.co', 'anon-anahtar', {
    global: { fetch: fakeFetch },
  })
  return { supabase, kategoriSorgulari, adSorgulari, varyantAdSorgulari }
}

describe('INV-FAMILY-DETAIL-CATEGORY-1 — getFamilyDetail kategori satırını gömer', () => {
  it('her iki kategori de varsa TAM satırları döndürür (id değil, satır)', async () => {
    const { supabase } = stubClient('cat-kok', 'cat-alt')
    const detay = await getFamilyDetail(supabase, 'vortice-lineo-150-quiet', 'tr')

    expect(detay).not.toBeNull()
    // Ad çözümü SATIRLA yapılır — bu alan boş kalırsa breadcrumb kategori basamağı hiç doğmaz.
    expect(detay?.family.category?.slug).toBe('residential-ventilation')
    expect(detay?.family.subcategory?.slug).toBe('inline-duct-fans')
    expect(detay?.family.subcategory?.name).toBe('Kanal İçi Hayalet Fanlar')
  })

  it('iki kategoriyi TEK sorguda çeker (aile başına ek round-trip patlamaz)', async () => {
    const { supabase, kategoriSorgulari } = stubClient('cat-kok', 'cat-alt')
    await getFamilyDetail(supabase, 'vortice-lineo-150-quiet', 'tr')
    expect(kategoriSorgulari).toHaveLength(1)
  })

  it('⭐AD ÇEVİRİSİ SORGUSU DA TEK — ek round-trip kabul, SAYISI sözleşme (REC-108)', async () => {
    // Bu kol, bu kapının itirazına verilen cevabın kendisidir.
    //
    // REC-108 aile adını dile bağlarken `getFamilyDetail`e BİR ek sorgu ekledi: RPC
    // `name_i18n`'i döndürmüyor (ham `f.name` yazıyor) ve RPC'yi yeniden tanımlamak
    // `returns table` dönüş tipi yüzünden `drop` gerektirirdi. Yani ek sorgu, seçilen
    // yolun kaçınılmaz bedeli — planda risk olarak yazıldı, sayfalar SSG/ISR olduğu için
    // maliyet build'de, istekte değil.
    //
    // ⭐AMA KAPI GEVŞETİLMEDİ, GENİŞLETİLDİ: yukarıdaki kol kategori sorgusunu tek'e
    // bağlıyordu; bu kol ad sorgusunu tek'e bağlar. Yarın biri aile başına N sorgu
    // eklerse kırmızı görür. "Bir tane daha eklendi" ile "sayı serbest bırakıldı"
    // arasındaki fark budur.
    const { supabase, adSorgulari } = stubClient('cat-kok', 'cat-alt')
    await getFamilyDetail(supabase, 'vortice-lineo-150-quiet', 'tr')
    expect(adSorgulari).toHaveLength(1)
  })

  it('⭐VARYANT AD ÇEVİRİSİ: id kümesi başına TEK sorgu VE alan gerçekten TAŞINIYOR (REC-110)', async () => {
    // Aynı sözleşme, varyant tarafı: RPC ham `p.name` döndürür, `products.name_i18n` tek
    // `in` sorgusuyla gömülür. İKİ iddia ayrı ölçülür — sorgu sayısı (N+1 patlamaz) ve
    // taşıma (alan gerçekten satıra iniyor). "Sorgu atıldı" tek başına yetmez: atılıp
    // sonucu yere düşürülseydi sayı yine 1 olur, kapı yeşil kalır, EN sayfa TR basardı.
    const { supabase, varyantAdSorgulari } = stubClient('cat-kok', 'cat-alt')
    const detay = await getFamilyDetail(supabase, 'vortice-lineo-150-quiet', 'tr')
    expect(varyantAdSorgulari).toHaveLength(1)
    expect(detay?.variants[0]?.name_i18n?.en).toBe('Lineo 150 Quiet Inline Fan')
  })

  it('kategori id yoksa HİÇ sorgu atmaz ve alanlar null olur', async () => {
    const { supabase, kategoriSorgulari } = stubClient(null, null)
    const detay = await getFamilyDetail(supabase, 'vortice-lineo-150-quiet', 'tr')

    expect(kategoriSorgulari).toHaveLength(0)
    expect(detay?.family.category).toBeNull()
    expect(detay?.family.subcategory).toBeNull()
  })

  it('id var ama satır bulunamıyorsa undefined DEĞİL null döner', async () => {
    // Kategori silinmiş/görünmez olabilir. `undefined` sızarsa çağıran "alan yok" ile
    // "kategori yok"u ayırt edemez ve breadcrumb sessizce kopar.
    const { supabase } = stubClient('cat-kok', 'yok-boyle-bir-id')
    const detay = await getFamilyDetail(supabase, 'vortice-lineo-150-quiet', 'tr')

    expect(detay?.family.category?.slug).toBe('residential-ventilation')
    expect(detay?.family.subcategory).toBeNull()
    expect(detay?.family.subcategory).not.toBeUndefined()
  })
})
