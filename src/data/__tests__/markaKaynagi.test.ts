/**
 * INV-MARKA-KAYNAK-1 — vitrindeki marka listesi DB'deki ürünlü markalarla aynı kalır (REC-374).
 *
 * NİÇİN (2026-09-27 ölçümü): statik `HVAC_BRANDS` altı marka yayınlıyordu, DB'de ürünü olan beş
 * markanın ikisi (seat, danfoss) listede YOKTU; listedekilerin üçü ürünsüzdü: `casals` (0 ürün,
 * canlıda "Bu markanın ürünleri henüz katalogda değil"), `flexiva` (DB'de yok), `frekans-konvertoru`
 * (marka değil, ürün türü). Liste koda gömülü, ürünler DB'de — iki kaynak arasında hiçbir kapı yoktu.
 *
 * ÖLÇÜT KAYNAĞI: `markaDbFiksturu.ts` (tarihli DB ölçümü). Bu test ağa çıkmaz; fikstürün tazeliği
 * fikstür dosyasının başlığındaki sorguyla yeniden ölçülür.
 *
 *  (a) statik slug kümesi ⊆ DB marka fikstürü
 *  (b) fikstürde aktif ürünü > 0 olan her marka statik listede
 *  (c) site haritası marka URL kümesi = liste × yayındaki diller
 *  (d) yönlendirme tablosu: kalan eski slug × 2 dil var, hedefler listede/kategoride çözülür, tek hop
 *      (OPS-51: casals ve flexiva listeye döndü → 308'leri KALKTI; yalnız frekans-konvertoru kaldı)
 *  (e) fikstürde ürünsüz marka listede olmaz — TEK, KAPALI istisna: `URUNSUZ_ISTISNALARI` listesindeki marka (şu an yalnız
 *      flexiva, karar 265). Genel gevşeme YOK: istisnasız ürünsüz marka ve ürün kazandığı hâlde istisnada kalan marka
 *      KIRMIZI verir (aşağıdaki "sabotaj" bloğu yüklemi sentetik girdiyle ölçer).
 *  (f) OPS-51 düzeltmesi: marka sayfasının noindex,follow + "teklif isteyin" cümlesi ve site haritası kararı STATİK bayraktan
 *      DEĞİL, DB'deki aktif ürün sayısından türer (`lib/seo/markaUrunDurumu.ts`). Bu dosyadaki (c)/(f) blokları sayıyı
 *      yardımcıya ENJEKTE eder: AYNI marka, yalnız sayı değişir (0 → ürünsüz; >0 → indekslenir) = "ürün gelince kendiliğinden
 *      kalkar" kanıtı. Fikstür artık bu kararın dayanağı DEĞİL, yalnız (a)/(b)/(e) liste-bütünlüğü ölçütüdür.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

import { ADRES_SEMASI_K3B } from '@/config/features'
import { SITE_URL } from '@/config/siteUrl'
import { eskiAdresEsle } from '@/lib/adres/eslestirici'
import { adresUret } from '@/utils/adresUret'
import { localizedHref, Routes } from '@/utils/routes'

import { k3bOku, KALDIRILAN_MARKALAR, markaHedefi, markaYonlendirmeleri } from '../../config/markaYonlendirmeleri.mjs'
import { fiksturHaritasi } from '../../lib/adres/__tests__/fikstur'
import { HVAC_BRANDS } from '../brands'
import { DB_KATEGORILERI, DB_MARKALARI, MARKA_OLCUM_TARIHI } from './markaDbFiksturu'

const KOK = process.cwd()
const DILLER = ['tr', 'en'] as const
const ESKI_SLUGLAR = ['frekans-konvertoru'] as const
const listeSluglari = () => HVAC_BRANDS.map((b) => b.slug)

/**
 * KAPALI İSTİSNA LİSTESİ (karar 265): fikstürde ürünü olmadan listede durabilen markalar. Yeni marka eklemek bu listeyi
 * DEĞİŞTİRMEKTİR — kapının kendisinde görünür bir diff ve bilinçli karar ister. (Sayfa/harita kararı bu listeye DEĞİL,
 * DB sayısına bakar; liste yalnız "ürünsüz marka listeye yanlışlıkla sızmasın" bekçisidir.)
 */
const URUNSUZ_ISTISNALARI: readonly string[] = ['flexiva']

interface MarkaKaydiOzeti {
  slug: string
}

/**
 * (e) yüklemi: `liste` markalarını DB ölçümüne (`db`) karşı süzer, ihlalleri açıklamalı döner.
 *  1. ürünsüz (aktif ürün ≤ 0, fikstürde de yok sayılır) marka istisna listesinde DEĞİLSE ihlal;
 *  2. istisna listesindeki marka fikstürde aktif ürün kazandıysa ihlal (istisna ürünle birlikte kalkmalı; sayfa ve harita
 *     bundan bağımsız olarak DB sayısına göre zaten düzelir — burada yalnız fikstür/istisna listesi güncellenir).
 */
export function urunsuzMarkaIhlalleri(
  liste: readonly MarkaKaydiOzeti[],
  db: Readonly<Record<string, { aktifUrun: number }>>,
  istisnalar: readonly string[],
): string[] {
  const ihlal: string[] = []
  for (const m of liste) {
    const aktif = db[m.slug]?.aktifUrun ?? 0
    if (aktif <= 0 && !istisnalar.includes(m.slug)) ihlal.push(`${m.slug}: ürünsüz marka istisna listesinde yok ("henüz katalogda değil" sayfası)`)
    if (istisnalar.includes(m.slug) && aktif > 0) ihlal.push(`${m.slug}: DB'de ${aktif} aktif ürünü var ama hâlâ ürünsüz istisna listesinde`)
  }
  return ihlal
}

/**
 * Sayı enjeksiyonlu marka-sayacı: `{ marka adı → aktif ürün sayısı }` tablosundan `MarkaUrunSayaci` üretir. Tabloda
 * olmayan marka hata fırlatır (test yanlış kurulmuşsa sessizce 0 saymaz).
 */
const sayacKur = (tablo: Readonly<Record<string, number>>) => async (ad: string): Promise<number> => {
  if (!(ad in tablo)) throw new Error(`sayac: ${ad} tabloda yok`)
  return tablo[ad]
}
/** Site haritası testlerinde sahte `getBrandFamilyCount`'ın okuduğu tablo (her test kendi sayısını yazar). */
const enjekte: { sayilar: Record<string, number> } = { sayilar: {} }
/** Fikstürdeki aktif ürün sayılarından ad bazlı tablo (casals 53, flexiva 0, …). */
const fiksturSayilari = (): Record<string, number> =>
  Object.fromEntries(HVAC_BRANDS.map((b) => [b.name, DB_MARKALARI[b.slug]?.aktifUrun ?? 0]))

describe('INV-MARKA-KAYNAK-1: marka listesi = DB\'de ürünü olan markalar', () => {
  it('fikstür tarihli ve boş değil (ölçüt körelmesin)', () => {
    expect(MARKA_OLCUM_TARIHI).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Object.keys(DB_MARKALARI).length).toBeGreaterThan(0)
    expect(HVAC_BRANDS.length).toBeGreaterThan(0)
  })

  it('(a) statik listedeki her slug DB\'de marka olarak var', () => {
    const dbdeYok = listeSluglari().filter((s) => !(s in DB_MARKALARI))
    expect(dbdeYok, `DB'de olmayan marka yayınlanıyor (fikstür ${MARKA_OLCUM_TARIHI})`).toEqual([])
  })

  it('(b) DB\'de aktif ürünü olan her marka statik listede', () => {
    const liste = new Set(listeSluglari())
    const eksik = Object.entries(DB_MARKALARI)
      .filter(([, m]) => m.aktifUrun > 0)
      .map(([s]) => s)
      .filter((s) => !liste.has(s))
    expect(eksik, 'ürünü olan marka vitrinde yok').toEqual([])
  })

  it('(e) fikstürde ürünsüz marka listede olamaz — yalnız kapalı istisna listesindeki marka (flexiva) durabilir', () => {
    expect(urunsuzMarkaIhlalleri(HVAC_BRANDS, DB_MARKALARI, URUNSUZ_ISTISNALARI)).toEqual([])
  })

  it('(e) istisna listesindeki her marka listede VE fikstürde ürünsüz (ölçüt körelmesin)', () => {
    const liste = new Set(listeSluglari())
    for (const s of URUNSUZ_ISTISNALARI) {
      expect(liste.has(s), `${s} istisna listesinde ama marka listesinde yok`).toBe(true)
      expect(DB_MARKALARI[s]?.aktifUrun, `${s} DB fikstüründe ürünsüz olmalı`).toBe(0)
    }
  })

  it('(e) STATİK `urunsuz` bayrağı kalmadı: hiçbir marka kaydı taşımaz, hiçbir yüzey `.urunsuz` okumaz (karar DB sayısından)', () => {
    expect(HVAC_BRANDS.filter((b) => 'urunsuz' in b).map((b) => b.slug)).toEqual([])
    for (const yol of [
      ['src', 'app', '_components', 'markaSayfasi.tsx'],
      ['src', 'app', 'sitemap.ts'],
      ['src', 'views', 'BrandDetailPage.tsx'],
      ['src', 'data', 'brands.ts'],
    ]) {
      const kaynak = readFileSync(join(KOK, ...yol), 'utf8')
      expect(kaynak, `${yol.join('/')} hâlâ .urunsuz okuyor`).not.toMatch(/\.urunsuz\b|\burunsuz\??:\s*true/)
    }
  })

  it('(e) TEK karar noktası: sayfa üst verisi, sayfa gövdesi ve site haritası AYNI yardımcıdan (markaUrunDurumu) karar verir', () => {
    const sayfa = readFileSync(join(KOK, 'src', 'app', '_components', 'markaSayfasi.tsx'), 'utf8')
    const harita = readFileSync(join(KOK, 'src', 'app', 'sitemap.ts'), 'utf8')
    expect(sayfa).toMatch(/from '@\/lib\/seo\/markaUrunDurumu'/)
    expect(harita).toMatch(/from '\.\.\/lib\/seo\/markaUrunDurumu'/)
    // Gövde kararı aynı `markaUrunsuzMu` ile alır ve istemci görünümüne prop geçirir.
    expect(sayfa).toMatch(/const urunsuz = await markaUrunsuzMu\(lang, slug, sayac\)/)
    // URN-79: aynı görünüme DB'den türeyen `urunOzeti` de geçer (ürünsüz markada boş; karar `urunsuz`dan gelir).
    expect(sayfa).toMatch(/<PageComponent initialBrandSlug=\{slug\} urunsuz=\{urunsuz\} urunOzeti=\{urunOzeti\} \/>/)
    // Her iki üst veri rotası kararı yardımcıdan alıp üst veri kurucusuna geçirir (atlayıp doğrudan çağırmak kırmızı).
    for (const yol of [
      ['src', 'app', '[lang]', 'brands', '[slug]', 'page.tsx'],
      ['src', 'app', '[lang]', 'markalar', '[slug]', 'page.tsx'],
    ]) {
      const rota = readFileSync(join(KOK, ...yol), 'utf8')
      expect(rota, `${yol.join('/')}: markaUrunsuzMu çağrısı yok`).toMatch(/await markaUrunsuzMu\(lang, slug\)/)
      expect(rota, `${yol.join('/')}: üst veri kurucusu karar olmadan çağrılıyor`).not.toMatch(/markaUstVerisi(K3b)?\(lang, slug\)/)
    }
  })

  it('önbellek sarmalı: anahtar lang+tenantId, keşif etiketleri (webhook tazeler), hata fırlatılır (kural 12; önbelleğe hata yazılmaz)', () => {
    const sayfa = readFileSync(join(KOK, 'src', 'app', '_components', 'markaSayfasi.tsx'), 'utf8')
    const sarmal = sayfa.match(/const getCachedMarkaUrunSayisi = [\s\S]*?\)\(\)/)
    expect(sarmal, 'getCachedMarkaUrunSayisi sarmalı bulunamadı').not.toBeNull()
    expect(sarmal![0]).toMatch(/unstable_cache\(/)
    expect(sarmal![0]).toMatch(/\['brand-active-product-count', lang, tenantId, markaAdi\]/)
    expect(sarmal![0]).toMatch(/tags: \[PRODUCTS_DISCOVERY_TAG, discoveryTag\(tenantId\)\]/)
    expect(sarmal![0]).not.toMatch(/\.catch\(|try\s*\{/)
    // Kural 6: aynı render'da tekrar eden sorgu React.cache ile tekilleştirilir.
    expect(sayfa).toMatch(/const markaUrunSayisiOku = cache\(/)
  })

  // URN-79: marka sayfası metnini DB'den türeten ikinci okuma (aile adları + kategoriler) AYNI kuralla sarılır: yeni önbellek
  // biçimi yok, anahtar lang+tenantId, webhook'un tazelediği keşif etiketleri (rendering-cache-standard.md §3: product_families,
  // products, brands ve categories değişimi bu etiketi tazeler). Hata önbelleğe yazılmaz; "özet yok" kararı önbelleğin DIŞINDA.
  it('katalog özeti önbellek sarmalı: anahtar lang+tenantId+marka, keşif etiketleri, sarmalın içinde hata yutulmaz; ürünsüz markada okunmaz', () => {
    const sayfa = readFileSync(join(KOK, 'src', 'app', '_components', 'markaSayfasi.tsx'), 'utf8')
    const sarmal = sayfa.match(/const getCachedMarkaKatalogOzeti = [\s\S]*?\)\(\)/)
    expect(sarmal, 'getCachedMarkaKatalogOzeti sarmalı bulunamadı').not.toBeNull()
    expect(sarmal![0]).toMatch(/unstable_cache\(/)
    expect(sarmal![0]).toMatch(/\['brand-catalog-summary', lang, tenantId, markaAdi\]/)
    expect(sarmal![0]).toMatch(/tags: \[PRODUCTS_DISCOVERY_TAG, discoveryTag\(tenantId\)\]/)
    expect(sarmal![0]).not.toMatch(/\.catch\(|try\s*\{/)
    // DI (kural 2): servis çağrısının ilk parametresi statik istemci enjeksiyonu, modül düzeyi istemci importu değil.
    expect(sarmal![0]).toMatch(/getBrandCatalogSummary\(supabaseStaticClient, markaAdi\)/)
    // Ürünsüz markada özet sorgusu hiç atılmaz.
    expect(sayfa).toMatch(/brand && !urunsuz\s*\?\s*await markaUrunOzeti\(/)
  })

  it('casals ve flexiva listede, eski 308 tablosunda DEĞİL (OPS-51)', () => {
    const liste = new Set(listeSluglari())
    for (const s of ['casals', 'flexiva']) {
      expect(liste.has(s), `${s} listede yok`).toBe(true)
      expect(Object.keys(KALDIRILAN_MARKALAR), `${s} hem listede hem 308 kaynağı: sayfa erişilmez`).not.toContain(s)
    }
    expect(DB_MARKALARI.casals?.aktifUrun).toBe(53)
    expect(DB_MARKALARI.avens?.aktifUrun).toBe(53)
  })
})

describe('INV-MARKA-KAYNAK-1 (e) vitrin cümlesi: zaman vaadi taşımaz, teklif yoluna bağlanır (OPS-51)', () => {
  const tr = readFileSync(join(KOK, 'src', 'i18n', 'dictionaries', 'tr.ts'), 'utf8')
  const en = readFileSync(join(KOK, 'src', 'i18n', 'dictionaries', 'en.ts'), 'utf8')
  const sayfa = readFileSync(join(KOK, 'src', 'views', 'BrandDetailPage.tsx'), 'utf8')
  const ZAMAN = /yakında|çok yakında|soon|coming|will be (added|listed)|opening/i

  it('eski productsSoon anahtarı sözlüklerde ve sayfada YOK; productsOnRequest(+Cta) iki dilde var', () => {
    for (const kaynak of [tr, en, sayfa]) expect(kaynak).not.toContain('productsSoon')
    for (const kaynak of [tr, en]) {
      expect(kaynak).toContain('productsOnRequest:')
      expect(kaynak).toContain('productsOnRequestCta:')
    }
  })

  it('cümleler ve bağlantı metni zaman öbeği içermez (VAAT-SIZINTI-2 terimlerinin üst kümesi)', () => {
    for (const kaynak of [tr, en]) {
      for (const anahtar of ['productsOnRequest', 'productsOnRequestCta']) {
        const satir = kaynak.split('\n').find((s) => s.trim().startsWith(`${anahtar}:`))
        expect(satir, `${anahtar} satırı yok`).toBeDefined()
        expect(satir!, `${anahtar} zaman taşıyor`).not.toMatch(ZAMAN)
      }
    }
  })

  it('sayfa urunsuz markada cümle + Routes.contact() bağlantısı çizer (manuel /tr/ yok); karar sunucudan gelen `urunsuz` prop\'u', () => {
    expect(sayfa).toContain("t('brands.detail.productsOnRequest', { ad: brand.name })")
    expect(sayfa).toMatch(/\{urunsuz \? t\('brands\.detail\.productsOnRequest'/)
    expect(sayfa).toMatch(/href=\{Routes\.contact\(\)\}[\s\S]{0,400}productsOnRequestCta/)
    expect(sayfa).not.toMatch(/href=["'`{]\s*["'`]?\/(tr|en)\//)
  })
})

describe('INV-MARKA-KAYNAK-1 (e) sabotaj: yüklem gevşemeden ayırt eder', () => {
  const db = { flexiva: { aktifUrun: 0 }, avens: { aktifUrun: 53 }, yenimarka: { aktifUrun: 0 } }
  const ist = ['flexiva']

  it('temiz durum: flexiva ürünsüz + istisnada, diğerleri ürünlü → ihlal yok', () => {
    expect(urunsuzMarkaIhlalleri([{ slug: 'flexiva' }, { slug: 'avens' }], db, ist)).toEqual([])
  })

  it('istisnasız ürünsüz marka eklenince KIRMIZI', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'flexiva' }, { slug: 'yenimarka' }], db, ist)
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/^yenimarka: ürünsüz marka istisna listesinde yok/)
  })

  it('istisna listesi boşaltılırsa flexiva KIRMIZI (istisna kapalı listede görünür bir karar ister)', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'flexiva' }], db, [])
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/^flexiva: ürünsüz marka istisna listesinde yok/)
  })

  it('flexiva DB\'de ürün kazanıp hâlâ istisna listesindeyse KIRMIZI (istisna ürünle birlikte kalkmalı)', () => {
    const ihlal = urunsuzMarkaIhlalleri([{ slug: 'flexiva' }], { flexiva: { aktifUrun: 4 } }, ist)
    expect(ihlal).toHaveLength(1)
    expect(ihlal[0]).toMatch(/hâlâ ürünsüz istisna listesinde/)
  })

  it('fikstürde HİÇ olmayan marka ürünsüz sayılır (DB\'de yok = ürün yok)', () => {
    expect(urunsuzMarkaIhlalleri([{ slug: 'hayalet' }], {}, ist)).toHaveLength(1)
  })
})

describe('INV-MARKA-KAYNAK-1 (adlar)', () => {
  it('slug\'lar tekil ve adı DB adıyla harf-duyarsız aynı (aile sorgusu `ilike` ile eşler)', () => {
    expect(new Set(listeSluglari()).size).toBe(HVAC_BRANDS.length)
    const farkli = HVAC_BRANDS.filter((b) => DB_MARKALARI[b.slug] && DB_MARKALARI[b.slug].ad.toLowerCase() !== b.name.toLowerCase())
      .map((b) => `${b.slug}: "${b.name}" ≠ DB "${DB_MARKALARI[b.slug].ad}"`)
    expect(farkli).toEqual([])
  })
})

describe('INV-MARKA-KAYNAK-1 (c): site haritası marka kolu listeyi izler', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('../../config/features')
    vi.doUnmock('../../lib/supabase/static')
    vi.doUnmock('../../lib/services/category.service')
    vi.doUnmock('../../lib/services/family.service')
    vi.resetModules()
  })

  for (const enYayin of [false, true]) {
    it(`EN_YAYIN=${enYayin}: marka URL kümesi = liste × diller`, async () => {
      vi.resetModules()
      vi.doMock('../../config/features', async (asil) => ({ ...(await asil<object>()), EN_YAYIN: enYayin }))
      vi.doMock('../../lib/supabase/static', () => ({
        supabaseStaticClient: { rpc: async () => ({ data: [] }) },
      }))
      // Site haritası boş katalogda ÜRETİLMEZ (INV-SITEMAP-HATA-1): sahte veri tek kategori + tek aile taşır;
      // bu test yalnız MARKA satırlarını ölçer, kategori/aile satırlarını filtre dışı bırakır.
      vi.doMock('../../lib/services/category.service', () => ({
        getCategories: async () => [
          { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
        ],
      }))
      // OPS-51: marka ürün sayısı ENJEKTE edilir (DB yerine tablo): site haritası kararı bu sayıdan türer.
      vi.doMock('../../lib/services/family.service', () => ({
        getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
        getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
        getBrandFamilyCount: async (_sb: unknown, ad: string) => sayacKur(enjekte.sayilar)(ad),
      }))
      enjekte.sayilar = fiksturSayilari()
      const { default: sitemap } = await import('../../app/sitemap')
      const girisler = await sitemap()
      const markaUrlleri = new Set(girisler.map((g) => g.url).filter((u) => /\/(tr|en)\/brands\//.test(u)))
      const diller = enYayin ? DILLER : (['tr'] as const)
      // Haritaya YALNIZ aktif ürün sayısı > 0 olan markalar girer. Beklenen küme enjekte edilen sayıdan türer
      // (statik bayraktan DEĞİL): ürünlü marka haritadan düşerse de, ürünsüz marka haritaya girerse de KIRMIZI.
      const haritadaOlmali = HVAC_BRANDS.filter((b) => enjekte.sayilar[b.name] > 0).map((b) => b.slug)
      const beklenen = new Set(diller.flatMap((d) => haritadaOlmali.map((s) => `${SITE_URL}/${d}${Routes.brand(s)}`)))
      expect([...markaUrlleri].sort()).toEqual([...beklenen].sort())
      expect(markaUrlleri.has(`${SITE_URL}/tr${Routes.brand('flexiva')}`), 'ürünsüz flexiva haritada').toBe(false)
      expect(markaUrlleri.has(`${SITE_URL}/tr${Routes.brand('casals')}`), 'ürünlü casals haritada olmalı').toBe(true)
    })
  }

  // "Kendiliğinden kalkar" kanıtı (site haritası kolu): AYNI marka (flexiva), yalnız enjekte edilen sayı değişir.
  for (const [sayi, haritada] of [[0, false], [4, true]] as const) {
    it(`flexiva aktif ürün sayısı ${sayi} → site haritasında ${haritada ? 'VAR' : 'YOK'} (bayrak/fikstür değişmeden)`, async () => {
      vi.resetModules()
      vi.doMock('../../config/features', async (asil) => ({ ...(await asil<object>()), EN_YAYIN: false }))
      vi.doMock('../../lib/supabase/static', () => ({ supabaseStaticClient: { rpc: async () => ({ data: [] }) } }))
      vi.doMock('../../lib/services/category.service', () => ({
        getCategories: async () => [
          { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
        ],
      }))
      vi.doMock('../../lib/services/family.service', () => ({
        getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
        getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
        getBrandFamilyCount: async (_sb: unknown, ad: string) => sayacKur(enjekte.sayilar)(ad),
      }))
      enjekte.sayilar = { ...fiksturSayilari(), Flexiva: sayi }
      const { default: sitemap } = await import('../../app/sitemap')
      const urller = new Set((await sitemap()).map((g) => g.url))
      expect(urller.has(`${SITE_URL}/tr${Routes.brand('flexiva')}`)).toBe(haritada)
      // Diğer markalar sayıdan etkilenmez (casals ürünlü kalır).
      expect(urller.has(`${SITE_URL}/tr${Routes.brand('casals')}`)).toBe(true)
    })
  }

  it('sayaç hata verirse harita ÜRETİLMEZ (hata yutulmaz, "ürünsüz" ya da "ürünlü" varsayılmaz)', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://gercek.supabase.co')
    vi.doMock('../../config/features', async (asil) => ({ ...(await asil<object>()), EN_YAYIN: false }))
    vi.doMock('../../lib/supabase/static', () => ({ supabaseStaticClient: { rpc: async () => ({ data: [] }) } }))
    vi.doMock('../../lib/services/category.service', () => ({
      getCategories: async () => [
        { id: 'k1', slug: 'fans', parent_id: null, metadata: { slug: { tr: 'fanlar', en: 'fans' } }, updated_at: '2026-09-01T00:00:00.000Z' },
      ],
    }))
    vi.doMock('../../lib/services/family.service', () => ({
      getAllFamilySlugs: async () => [{ slug: 'vortice-lineo-quiet' }],
      getFamilySitemapData: async () => ({ aileTarihleri: new Map<string, string>(), modeller: [] }),
      getBrandFamilyCount: async () => {
        throw new Error('rpc düştü')
      },
    }))
    const { default: sitemap } = await import('../../app/sitemap')
    await expect(sitemap()).rejects.toThrow(/rpc düştü/)
  })
})

describe('INV-MARKA-KAYNAK-1 (f): ürünsüz marka sayfası noindex,follow ve ürün vaat etmeyen açıklama basar (OPS-51)', () => {
  afterEach(() => {
    vi.doUnmock('../../config/features')
    vi.resetModules()
  })

  for (const k3b of [false, true]) {
    it(`ADRES_SEMASI_K3B=${k3b}: flexiva noindex,follow; ürünlü markada robots alanı YOK (bugünkü)`, async () => {
      vi.resetModules()
      vi.doMock('../../config/features', async (asil) => ({ ...(await asil<object>()), ADRES_SEMASI_K3B: k3b, EN_YAYIN: true }))
      const m = await import('../../app/_components/markaSayfasi')
      // Karar `markaUrunsuzMu(lang, slug, sayac)`'tan gelir: sayı ENJEKTE edilir (rotalar da aynı çağrıyı yapar).
      const sayac = sayacKur(fiksturSayilari())
      const ust = async (slug: string, lang: string) => {
        const urunsuz = await m.markaUrunsuzMu(lang, slug, sayac)
        return k3b ? m.markaUstVerisiK3b(lang, slug, urunsuz) : m.markaUstVerisi(lang, slug, urunsuz)
      }
      for (const lang of ['tr', 'en']) {
        expect((await ust('flexiva', lang)).robots, `flexiva ${lang} noindex değil`).toEqual({ index: false, follow: true })
        for (const urunlu of ['casals', 'avens', 'seat', 'vortice']) {
          expect((await ust(urunlu, lang)).robots, `${urunlu} ${lang} robots yazıyor`).toBeUndefined()
        }
      }
    })

    // "Kendiliğinden kalkar" kanıtı (üst veri kolu): AYNI marka (flexiva), AYNI kod, yalnız enjekte edilen sayı değişir.
    it(`ADRES_SEMASI_K3B=${k3b}: flexiva sayı 0 → noindex,follow + ürün vaat etmeyen açıklama; sayı 4 → indekslenir (robots yok) + normal açıklama`, async () => {
      vi.resetModules()
      vi.doMock('../../config/features', async (asil) => ({ ...(await asil<object>()), ADRES_SEMASI_K3B: k3b, EN_YAYIN: true }))
      const m = await import('../../app/_components/markaSayfasi')
      const ust = async (lang: string, sayi: number) => {
        const urunsuz = await m.markaUrunsuzMu(lang, 'flexiva', async () => sayi)
        return k3b ? m.markaUstVerisiK3b(lang, 'flexiva', urunsuz) : m.markaUstVerisi(lang, 'flexiva', urunsuz)
      }
      for (const lang of ['tr', 'en']) {
        const sifir = await ust(lang, 0)
        const dort = await ust(lang, 4)
        expect(sifir.robots, `${lang} sayı 0: noindex,follow olmalı`).toEqual({ index: false, follow: true })
        expect(dort.robots, `${lang} sayı 4: robots yazılmamalı (indekslenir)`).toBeUndefined()
        // Açıklama da sayıya bağlı: 0 → "teklif isteyin" olgusu (seoUrunsuz); 4 → ürünlü marka açıklaması (ürün aileleri vaadi serbest).
        expect(String(sifir.description)).not.toBe(String(dort.description))
        expect(String(dort.description)).toContain('Flexiva')
      }
    })
  }

  it('flexiva meta açıklaması ürün vaat etmez, ≥70 karakter (seoYedek devreye girmez) ve sayfanın söylediğiyle aynı olgu (iki dil)', async () => {
    vi.resetModules()
    const m = await import('../../app/_components/markaSayfasi')
    const { tr } = await import('../../i18n/dictionaries/tr')
    const { en } = await import('../../i18n/dictionaries/en')
    for (const [lang, sozluk] of [['tr', tr], ['en', en]] as const) {
      const a = String(m.markaUstVerisi(lang, 'flexiva', await m.markaUrunsuzMu(lang, 'flexiva', async () => 0)).description)
      expect(a.length).toBeGreaterThanOrEqual(70)
      expect(a).toContain('Flexiva')
      expect(a, `seoYedek ürün vaadi: ${a}`).not.toBe(sozluk.brands.seoYedek.replace('{{ad}}', 'Flexiva'))
      expect(a).not.toMatch(/ürün ailelerini|modellerini|product families|models and technical/i)
      expect(a).not.toMatch(/yakında|soon|coming/i)
    }
    // Ürünlü marka (casals) açıklaması DEĞİŞMEDİ: ürünsüz dalına düşmez.
    expect(String(m.markaUstVerisi('tr', 'casals').description)).not.toContain('henüz VentHub kataloğunda yer almıyor')
  })

  it('sayfa GÖVDESİ aynı sayıdan karar verir: istemci görünümüne `urunsuz` prop\'u sayı 0 → true, sayı 4 → false (teklif cümlesiyle çelişmez)', async () => {
    vi.resetModules()
    const m = await import('../../app/_components/markaSayfasi')
    const urunsuzProp = async (sayi: number) => {
      // URN-79: ürünlü kolda gövde katalog özetini de okur; bu test `urunsuz` kararını ölçer → okuyucu ENJEKTE (ağ/önbellek yok).
      const el = await m.MarkaSayfasi({ lang: 'tr', slug: 'flexiva', sayac: async () => sayi, katalogOzeti: async () => null })
      const cocuklar = (el.props as { children: { props: { urunsuz?: boolean } }[] }).children
      return cocuklar[1].props.urunsuz
    }
    expect(await urunsuzProp(0)).toBe(true)
    expect(await urunsuzProp(4)).toBe(false)
  })
})

describe('INV-MARKA-KAYNAK-1 (d): listeden çıkan slug\'ların 308 yönlendirmesi', () => {
  it('yönlendirme tablosu tam olarak kalan eski slug\'ları (frekans-konvertoru) taşır ve hiçbiri listede değil (çakışma = sayfa erişilmez)', () => {
    expect(Object.keys(KALDIRILAN_MARKALAR).sort()).toEqual([...ESKI_SLUGLAR].sort())
    const liste = new Set(listeSluglari())
    expect(ESKI_SLUGLAR.filter((s) => liste.has(s))).toEqual([])
  })

  for (const k3b of [false, true]) {
    describe(`ADRES_SEMASI_K3B=${k3b}`, () => {
      const kurallar = markaYonlendirmeleri(k3b)
      const kaynaklar = new Map(kurallar.map((k) => [k.source, k]))

      it('her eski slug × iki dil için kalıcı (308) kural var', () => {
        const eksik: string[] = []
        for (const s of ESKI_SLUGLAR) {
          for (const d of DILLER) {
            const k = kaynaklar.get(`/${d}/brands/${s}`)
            if (!k) eksik.push(`/${d}/brands/${s}`)
            else expect(k.permanent, `${k.source} kalıcı değil`).toBe(true)
          }
        }
        expect(eksik).toEqual([])
      })

      it(k3b ? 'bayrak AÇIK: /tr/markalar/<eski> de aynı hedefe gider' : 'bayrak KAPALI: /tr/markalar kuralı üretilmez (rota 404)', () => {
        for (const s of ESKI_SLUGLAR) {
          const k = kaynaklar.get(`/tr/markalar/${s}`)
          if (k3b) expect(k?.destination).toBe(kaynaklar.get(`/tr/brands/${s}`)?.destination)
          else expect(k).toBeUndefined()
        }
      })

      it('hedefler adresUret/Routes ile aynı ve ölçülmüş kategoriye/listeye çözülür', () => {
        for (const s of ESKI_SLUGLAR) {
          const h = KALDIRILAN_MARKALAR[s]
          for (const d of DILLER) {
            const hedef = markaHedefi(s, d, k3b)
            if (h.tur === 'liste') {
              expect(hedef).toBe(localizedHref(Routes.brands(), d))
            } else {
              expect(hedef).toBe(adresUret({ tur: 'kategori', kok: h.kok[d], dal: h.dal[d] }, d, k3b))
              const dal = DB_KATEGORILERI[h.dal.en]
              const kok = DB_KATEGORILERI[h.kok.en]
              expect(dal, `hedef kategori fikstürde yok: ${h.dal.en}`).toBeDefined()
              expect(dal.aktif && (dal.aktifUrun ?? 0) > 0, 'hedef kategori pasif ya da ürünsüz').toBe(true)
              expect(dal.slug[d]).toBe(h.dal[d])
              expect(dal.ust).toBe(h.kok.en)
              expect(kok?.aktif).toBe(true)
              expect(kok?.slug[d]).toBe(h.kok[d])
            }
          }
        }
      })

      it('tek hop: hiçbir hedef başka bir kuralın kaynağı değil', () => {
        const zincir = kurallar.filter((k) => kaynaklar.has(k.destination)).map((k) => `${k.source} → ${k.destination}`)
        expect(zincir).toEqual([])
      })

      if (k3b) {
        it('3-C eski adres eşleyicisiyle çakışmaz: kaynaklar eşleyiciye düşmez, hedefler kanonik (eşleyici null)', () => {
          // Paylaşılan eşleyici fikstürü `control-systems`'i taşıyor ama dalını taşımıyor (fikstür
          // alt kümedir). Gerçek harita DB'den üretilir; DB'de ölçülen dal (DB_KATEGORILERI) buraya
          // aynı biçimde eklenir — yoksa eşleyici bilinmeyen dalı düşürüp köke yönlendirirdi.
          const h = fiksturHaritasi()
          const kokIndeksi = h.kategoriler.findIndex((k) => k.en === 'control-systems')
          expect(kokIndeksi, 'fikstürde control-systems yok').toBeGreaterThanOrEqual(0)
          const dalOlcum = DB_KATEGORILERI['frequency-converters']
          const dalIndeksi = h.kategoriler.push({ ...dalOlcum.slug, ust: kokIndeksi, aktif: dalOlcum.aktif }) - 1
          h.kategoriSluglari[dalOlcum.slug.en] = { hedef: { kategori: dalIndeksi }, bicim: 'en' }
          h.kategoriSluglari[dalOlcum.slug.tr] = { hedef: { kategori: dalIndeksi }, bicim: 'tr' }
          const esle = (yol: string) => eskiAdresEsle(h, { yol, sku: null, dilTespit: () => 'tr' })
          const cakisan = kurallar.flatMap((k) => [k.source, k.destination]).filter((y) => esle(y) !== null)
          expect(cakisan).toEqual([])
        })
      }
    })
  }

  it('next.config bu listeyi yayındaki bayrakla kullanıyor (kopya kural yok)', () => {
    const features = readFileSync(join(KOK, 'src', 'config', 'features.ts'), 'utf8')
    expect(k3bOku(features)).toBe(ADRES_SEMASI_K3B)
    const nextConfig = readFileSync(join(KOK, 'next.config.mjs'), 'utf8')
    expect(nextConfig).toMatch(/k3bOku\(readFileSync\(new URL\('\.\/src\/config\/features\.ts'/)
    expect(nextConfig).toContain('...markaYonlendirmeleri(ADRES_SEMASI_K3B)')
    for (const s of ESKI_SLUGLAR) expect(nextConfig).not.toContain(`/brands/${s}'`)
  })

  it('k3bOku okuyamadığı biçimde ATAR (sessizce "kapalı" varsaymaz)', () => {
    expect(() => k3bOku('')).toThrow()
    expect(() => k3bOku('export const ADRES_SEMASI_K3B = process.env.X === "1"')).toThrow()
    expect(k3bOku('export const ADRES_SEMASI_K3B = true\n')).toBe(true)
  })
})
