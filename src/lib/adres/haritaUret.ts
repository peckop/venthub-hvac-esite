/**
 * ESKİ ADRES HARİTASI ÜRETİCİSİ (REC-300 Faz 3 madde 4; plan §4 katman 1, §4.1).
 *
 * Derleme anında koşar; çıktısı `src/data/generated/eski-adres-haritasi.json` (commit EDİLMEZ).
 * Kaynaklar: `products`, `product_families`, `categories`, `url_takma_adlari` + commit'li tohum
 * (`src/data/eski-adres-tohum.json`). Middleware bu dosyayı JSON olarak okur; istek anında DB'ye
 * gitmez (kural 12, REC-289).
 *
 * ⛔FAIL-CLOSED (plan §4.1 Y2): DB'ye ulaşılamazsa, bir tablo hata dönerse, aktif ürün sayısı sıfırsa
 * ya da bir önceki haritanın %90'ının altındaysa HATA fırlatılır — boş/yarım haritayla yayın yok.
 * Bugünkü `generateStaticParams` gibi `console.warn` ile yutulmaz: boş harita "her eski adres 404"
 * demektir ve hiçbir kapı bunu kendiliğinden görmez. Aynı şekilde tohumdaki bir hedef bulunamazsa
 * ya da iki canlı nesne aynı slug'ı paylaşıyorsa (hangi adrese gidileceği belirsiz) üretim düşer.
 *
 * KİRACI (kural 12): her sorgu `tenant_id = kiraciId` ile AÇIKÇA süzülür. Üretici service-role ile
 * koşar (`url_takma_adlari` anon/authenticated'a kapalı) → RLS kiracıyı süzmez, süzgeç sorgudadır.
 *
 * ÖNCELİK: canlı slug > takma ad > tohum. Bir slug canlıysa eski adres sayılmaz (DB tetiği de canlı
 * slug'la çakışan takma adı siler; burada ikinci kez güvenceye alınır).
 */
import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'
import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import {
  type EskiAdresHaritaDosyasi,
  HARITA_URUN_ESIGI,
  type KategoriHedefi,
  type KategoriKaydi,
  type KategoriSlugKaydi,
  type KiraciHaritasi,
  type ModelKaydi,
} from './haritaTipi'
import type { EskiAdresTohumu } from './tohum'

export interface HaritaUretSecenekleri {
  kiraciId: string
  /** Doğrulanmış tohum (`tohumDogrula`). Başka kiracının tohumuysa yok sayılır. */
  tohum: EskiAdresTohumu | null
  /** Bir önceki haritanın bu kiracı için ürün sayısı (`oncekiUrunSayisi`); ilk üretimde null. */
  oncekiUrunSayisi: number | null
}

/** PostgREST sayfa boyu. Sunucunun `max-rows` sınırı bundan küçük olsa bile döngü boş sayfaya kadar sürer. */
const SAYFA = 1000

type SayfaSonucu<T> = PromiseLike<{ data: T[] | null; error: { message: string } | null }>

function hata(mesaj: string): Error {
  return new Error(`[eski-adres-haritasi] ${mesaj}`)
}

/**
 * Tablonun TAMAMINI okur. Kısa sayfa "son" sayılmaz — sunucu `max-rows` sınırı sayfayı sessizce
 * kırpabilir; döngü ancak BOŞ sayfada biter (yarım tabloyla harita = sessiz 404'ler).
 */
async function tumunuOku<T>(ad: string, sorgu: (bas: number, son: number) => SayfaSonucu<T>): Promise<T[]> {
  const satirlar: T[] = []
  // Bir sonraki sayfa GELEN satır kadar ilerler, istenen kadar değil: sunucu 1000 yerine 500 verdiyse
  // `bas += SAYFA` 500 satırı atlardı.
  for (let bas = 0; ; bas = satirlar.length) {
    let sonuc: Awaited<SayfaSonucu<T>>
    try {
      sonuc = await sorgu(bas, bas + SAYFA - 1)
    } catch (e: unknown) {
      throw hata(`${ad} okunamadı (DB'ye ulaşılamadı): ${e instanceof Error ? e.message : String(e)}`)
    }
    if (sonuc.error) throw hata(`${ad} okunamadı: ${sonuc.error.message}`)
    const sayfa = sonuc.data ?? []
    if (sayfa.length === 0) return satirlar
    satirlar.push(...sayfa)
  }
}

/**
 * Kod noktası sırası — dil kuralı YOK, bilerek: sıra yalnız çıktının her makinede bayt bayt aynı olması
 * içindir (INV-9: dilsiz `localeCompare` çalışma ortamına göre değişir). Anahtarlar ASCII slug/SKU.
 */
function kodSirasi(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}

/** Anahtarları sıralı kopya — aynı veri her üretimde bayt bayt aynı JSON'u versin (fark okunabilir kalsın). */
function sirali<V>(nesne: Record<string, V>): Record<string, V> {
  const cikti: Record<string, V> = {}
  for (const k of Object.keys(nesne).sort()) cikti[k] = nesne[k]
  return cikti
}

/**
 * Bir kiracının eski adres haritasını üretir. DI (kural 2): istemciyi çağıran verir — derleme
 * adımında service-role istemcisi, testte sahte `fetch`'li gerçek istemci.
 */
export async function eskiAdresHaritasiUret(
  supabase: SupabaseClient<Database>,
  secenek: HaritaUretSecenekleri
): Promise<KiraciHaritasi> {
  const { kiraciId, oncekiUrunSayisi } = secenek
  if (!kiraciId) throw hata('kiracı kimliği boş')

  const [kategoriSatirlari, aileSatirlari, urunSatirlari, takmaSatirlari] = await Promise.all([
    tumunuOku('categories', (bas, son) =>
      supabase
        .from('categories')
        .select('id, slug, metadata, parent_id, is_active')
        .eq('tenant_id', kiraciId)
        .order('id')
        .range(bas, son)
    ),
    tumunuOku('product_families', (bas, son) =>
      supabase
        .from('product_families')
        .select('id, slug')
        .eq('tenant_id', kiraciId)
        .is('deleted_at', null)
        .order('id')
        .range(bas, son)
    ),
    tumunuOku('products', (bas, son) =>
      supabase
        .from('products')
        .select('id, sku, slug, family_id')
        .eq('tenant_id', kiraciId)
        .is('deleted_at', null)
        .eq('status', 'active')
        .order('id')
        .range(bas, son)
    ),
    tumunuOku('url_takma_adlari', (bas, son) =>
      supabase
        .from('url_takma_adlari')
        .select('tur, dil, eski_slug, hedef_id')
        .eq('tenant_id', kiraciId)
        .order('tur')
        .order('dil')
        .order('eski_slug')
        .range(bas, son)
    ),
  ])

  // ── Ürün sayısı eşiği (fail-closed) ───────────────────────────────────────────────────────────
  const urunSayisi = urunSatirlari.length
  if (urunSayisi === 0) throw hata(`kiracı ${kiraciId} için aktif ürün 0 — boş haritayla yayın yapılmaz`)
  if (oncekiUrunSayisi !== null && urunSayisi < oncekiUrunSayisi * HARITA_URUN_ESIGI) {
    throw hata(
      `aktif ürün ${urunSayisi}, önceki haritada ${oncekiUrunSayisi} — %${Math.round(HARITA_URUN_ESIGI * 100)} eşiğinin altında; ` +
        'yarım okunmuş tabloyla yayın yapılmaz (bilinçli toplu silme ise önceki haritayı kaldırıp yeniden üret)'
    )
  }

  // ── Aileler ───────────────────────────────────────────────────────────────────────────────────
  const aileler = aileSatirlari.map((a) => a.slug).sort()
  const aileIndeksi = new Map<string, number>()
  for (const a of aileSatirlari) aileIndeksi.set(a.id, aileler.indexOf(a.slug))
  const aileSluglari: Record<string, number> = {}
  aileler.forEach((slug, i) => {
    if (slug in aileSluglari) throw hata(`aile slug'ı "${slug}" iki ailede`)
    aileSluglari[slug] = i
  })

  // ── Modeller ──────────────────────────────────────────────────────────────────────────────────
  const modeller: Record<string, ModelKaydi> = {}
  const urunSluglari: Record<string, string> = {}
  const urunSkusu = new Map<string, string>()
  for (const u of [...urunSatirlari].sort((a, b) => kodSirasi(a.sku, b.sku))) {
    const aile = u.family_id ? aileIndeksi.get(u.family_id) : undefined
    if (aile === undefined) throw hata(`ürün ${u.sku} ailesiz ya da ailesi bu kiracıda yok — adresi kurulamaz`)
    // Model adres metni Faz 2'de `products.slug_i18n` kolonuyla gelir (plan §5 Faz 2); kolon bugün
    // DB'de YOK. Boş bırakılır; eşleyici modelsiz slug'da aile adresine gider (kırık adres üretmez).
    modeller[u.sku] = { aile, slug: { tr: null, en: null } }
    urunSkusu.set(u.id, u.sku)
    // Slug'sız ürünün eski ürün-slug adresi hiç olmadı; modeli SKU'dan (`?sku=`) yine bulunur.
    if (!u.slug) continue
    const slug = u.slug.toLowerCase()
    if (slug in urunSluglari) throw hata(`ürün slug'ı "${slug}" iki üründe (${urunSluglari[slug]}, ${u.sku})`)
    urunSluglari[slug] = u.sku
  }

  // ── Kategoriler ───────────────────────────────────────────────────────────────────────────────
  const siraliKategori = [...kategoriSatirlari].sort((a, b) => kodSirasi(a.slug, b.slug))
  const kategoriIndeksi = new Map<string, number>()
  siraliKategori.forEach((k, i) => kategoriIndeksi.set(k.id, i))
  const kategoriler: KategoriKaydi[] = siraliKategori.map((k) => {
    let ust: number | null = null
    if (k.parent_id) {
      const i = kategoriIndeksi.get(k.parent_id)
      if (i === undefined) throw hata(`kategori ${k.slug} üst kategorisi bu kiracıda yok`)
      ust = i
    }
    return {
      tr: getLocalizedCategorySlug(k, 'tr'),
      en: getLocalizedCategorySlug(k, 'en'),
      ust,
      aktif: k.is_active === true,
    }
  })
  const kategoriSluglari: Record<string, KategoriSlugKaydi> = {}
  const canliKategoriSlugu = (slug: string, i: number, bicim: KategoriSlugKaydi['bicim']) => {
    const var_ = kategoriSluglari[slug]
    if (var_ && !('kategori' in var_.hedef && var_.hedef.kategori === i)) {
      throw hata(`kategori slug'ı "${slug}" iki kategoride — hangi adrese gidileceği belirsiz`)
    }
    kategoriSluglari[slug] = { hedef: { kategori: i }, bicim }
  }
  kategoriler.forEach((k, i) => {
    if (k.tr === k.en) {
      canliKategoriSlugu(k.tr, i, 'ortak')
    } else {
      canliKategoriSlugu(k.tr, i, 'tr')
      canliKategoriSlugu(k.en, i, 'en')
    }
  })

  // ── Takma adlar (DB tetiğinin kaydı; canlı slug her zaman önce gelir) ──────────────────────────
  const eskiSkular: Record<string, string> = {}
  for (const t of takmaSatirlari) {
    const eski = t.eski_slug.toLowerCase()
    switch (t.tur) {
      case 'urun': {
        const sku = urunSkusu.get(t.hedef_id)
        if (sku && !(eski in urunSluglari)) urunSluglari[eski] = sku
        break
      }
      case 'sku': {
        const sku = urunSkusu.get(t.hedef_id)
        const eskiSku = eski.toUpperCase()
        if (sku && !(eskiSku in modeller)) eskiSkular[eskiSku] = sku
        break
      }
      case 'aile': {
        const i = aileIndeksi.get(t.hedef_id)
        if (i !== undefined && !(eski in aileSluglari)) aileSluglari[eski] = i
        break
      }
      case 'kategori': {
        const i = kategoriIndeksi.get(t.hedef_id)
        const bicim = t.dil === 'tr' || t.dil === 'en' ? t.dil : 'ortak'
        if (i !== undefined && !(eski in kategoriSluglari)) kategoriSluglari[eski] = { hedef: { kategori: i }, bicim }
        break
      }
      // Bilinmeyen tür (tablo CHECK'i dört türe izin veriyor) yok sayılır; yeni tür eklenirse burası genişler.
    }
  }

  // ── Tohum (DB'de hiç olmamış eski adresler, plan §4.1 Y1) ─────────────────────────────────────
  const tohum = secenek.tohum && secenek.tohum.kiraci === kiraciId ? secenek.tohum : null
  if (tohum) {
    for (const k of tohum.kategoriler) {
      let hedef: KategoriHedefi
      if (k.hedef === null) {
        hedef = { urunler: true }
      } else {
        const bulunan = kategoriSluglari[k.hedef]
        if (!bulunan) throw hata(`tohum kategorisi "${k.eski}" → "${k.hedef}": hedef kategori bu kiracıda yok`)
        hedef = bulunan.hedef
      }
      if (!(k.eski in kategoriSluglari)) kategoriSluglari[k.eski] = { hedef, bicim: k.bicim }
    }
    for (const a of tohum.aileler) {
      const i = aileSluglari[a.hedef]
      if (i === undefined) throw hata(`tohum ailesi "${a.eski}" → "${a.hedef}": hedef aile bu kiracıda yok`)
      if (!(a.eski in aileSluglari)) aileSluglari[a.eski] = i
    }
    for (const u of tohum.urunler) {
      const sku = u.hedefSku in modeller ? u.hedefSku : eskiSkular[u.hedefSku]
      if (!sku) throw hata(`tohum ürünü "${u.eski}" → ${u.hedefSku}: hedef ürün bu kiracıda aktif değil`)
      if (!(u.eski in urunSluglari)) urunSluglari[u.eski] = sku
    }
  }

  return {
    urunSayisi,
    aileler,
    modeller: sirali(modeller),
    eskiSkular: sirali(eskiSkular),
    urunSluglari: sirali(urunSluglari),
    aileSluglari: sirali(aileSluglari),
    kategoriler,
    kategoriSluglari: sirali(kategoriSluglari),
  }
}

/** Kiracı haritalarını dosya biçimine sarar (derleme adımı JSON olarak yazar). */
export function haritaDosyasiKur(kiracilar: Record<string, KiraciHaritasi>, uretildi: Date): EskiAdresHaritaDosyasi {
  return { surum: 1, uretildi: uretildi.toISOString(), kiracilar: sirali(kiracilar) }
}

/**
 * Bir önceki harita dosyasından bu kiracının ürün sayısını okur (fail-closed eşiğinin tabanı).
 * Dosya yoksa ya da tanınmayan biçimdeyse null → eşik uygulanmaz (ilk üretim). Bozuk biçimi
 * sessizce "ilk üretim" saymak eşiği kaldırır; bu yüzden ÇAĞIRAN dosya VAR ama okunamıyorsa
 * üretimi durdurmalıdır — bu fonksiyon yalnız biçim tanır.
 */
export function oncekiUrunSayisi(dosya: unknown, kiraciId: string): number | null {
  if (typeof dosya !== 'object' || dosya === null) return null
  const kiracilar = (dosya as { kiracilar?: unknown }).kiracilar
  if (typeof kiracilar !== 'object' || kiracilar === null) return null
  const govde = (kiracilar as Record<string, unknown>)[kiraciId]
  if (typeof govde !== 'object' || govde === null) return null
  const sayi = (govde as { urunSayisi?: unknown }).urunSayisi
  return typeof sayi === 'number' && Number.isFinite(sayi) && sayi > 0 ? sayi : null
}
