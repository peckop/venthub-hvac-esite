import { cache } from 'react'

import { getFamilyDetail, getSeriesLanding } from '@/lib/services/family.service'
import { getProductBySlug } from '@/lib/services/product.service'
import { supabaseStaticClient as supabase } from '@/lib/supabase/static'

import type { AuthorityContent,CategoryMetadata, DbCategory } from '../../types/db-rows'
import { mapDatabaseCategoryToDomain } from '../type-converters'

// Cached product fetcher
export const getCachedProductBySlug = cache(async (slug: string) => {
  return getProductBySlug(supabase, slug)
})

/**
 * F5-B W2.2 — PDP kanonik çözümü: AİLE detayı (aile + aktif varyantlar).
 * RSC ağacında generateMetadata + Page aynı veriyi ister; React.cache tekilleştirir.
 *
 * T138 K1: bu sarmalayıcı hatayı YUTAR (null döner) ve bu, metadata için doğrudur —
 * başlık üretilemedi diye sayfa patlamamalı. Ama ROTA KARARI için yanlıştır: yutulmuş
 * hata "aile yok" gibi görünür ve zincirin sonunda 404'e dönüşür; yani geçici bir RPC
 * arızası kalıcı bir yokluk beyanı üretir. Rota katmanı bu yüzden `fetchFamilyDetail`i
 * (fırlatan sürüm) kullanır — aynı React.cache anahtarı, tek RPC çağrısı.
 */
const fetchFamilyDetail = cache(async (slug: string, lang: string) => {
  return getFamilyDetail(supabase, slug, lang)
})

export const getCachedFamilyDetail = cache(async (slug: string, lang: string) => {
  try {
    return await fetchFamilyDetail(slug, lang)
  } catch (e) {
    console.warn('getCachedFamilyDetail error:', e)
    return null
  }
})

/** Rota zinciri için: hata YUTULMAZ (bkz. `productRoute.ts` → `unavailable`). */
export const getFamilyDetailForRoute = fetchFamilyDetail

/**
 * T138 K1 — seri landing verisi (seri + model kartları). Hata yutulmaz;
 * `resolveProductRoute` onu `unavailable` sınıfına çevirir.
 */
export const getCachedSeriesLanding = cache(async (slug: string) => {
  return getSeriesLanding(supabase, slug)
})

/**
 * Varyant slug'ından aile slug'ına köprü — yalnız 308 yönlendirmesi için kullanılır
 * (products.slug DB'de kalır, 308 penceresi). Aile bulunamazsa null.
 */
export const getCachedFamilySlugById = cache(async (familyId: string) => {
  const { data, error } = await supabase
    .from('product_families')
    .select('slug')
    .eq('id', familyId)
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data.slug
})

export function preloadFamily(slug: string, lang: string) {
  void getCachedFamilyDetail(slug, lang)
}

/**
 * VİTRİN kategori kolonları — `marketing_title` KASITEN YOK (REC-297).
 *
 * NİÇİN: alan EMEKLİ (Recep kararı 2026-09-09). Emekli olmak "artık okunmuyor" demekti;
 * ama kolon `select`'te kaldığı sürece satır RSC yüküne biniyor ve HER ZİYARETÇİYE
 * gönderiliyordu. Canlı ölçüm (2026-09-09, `/tr/category/fanlar`): kolon HTML'de **11 kez**
 * taşınıyor, görünen yüzeyde **0 kez**. Yani ölü veri, ücreti ödenen bir yük.
 *
 * ⚠BURASI YALNIZ VİTRİN. Admin yüzeyleri (`CategoriesTableBody`, `CategoryBuilderView`,
 * `ProductFormModal`) kolonu okumaya DEVAM EDER — orası veriyi YÖNETİM için okur ve emekli
 * alan DB'de duruyor (kolon silinmedi, 12 satırdaki metin yerinde).
 *
 * Bekçi: INV-MARKETING-YUK-1.
 */
const CATEGORY_COLUMNS = 'id, name, parent_id, slug, is_active, sort_order, level, image_url, seo_title, seo_desc, created_at, updated_at, description, display_mode, is_featured, menu_label, metadata, translation_key, authority_content'

// PostgREST `.or()` filtreleri virgül/parantez ile ayrıştırılır; sadece güvenli
// slug karakterlerine izin ver, aksi halde yalnız kanonik eşleşmeye düş.
const SAFE_SLUG = /^[a-zA-Z0-9._~-]+$/

/**
 * Kategori satırı seçimi — ÜÇ KOŞULLU `.or()` sorgusunun sonucunu tek satıra indirir.
 *
 * NİÇİN AYRI VE SAF (REC-286): eski hâl `rows.find(r => r.slug === slug) ?? rows[0]` idi ve
 * SESSİZ bir yanlış-satır kolu taşıyordu. Gelen adres kanonik slug DEĞİLSE — ki TR
 * yüzeyinde çoğu adres öyle: `/tr/category/aksiyel-sanayi-fanlari` kanonik değil, kanonik
 * `axial-industrial-fans` — `find` DAİMA ıskalar ve seçim `rows[0]`'a düşer. PostgREST
 * sırasız döner, yani iki satır eşleştiği anda HANGİSİNİN geleceği belirsizdir. Bugün
 * zararsız (ölçüldü: `aksiyel-sanayi-fanlari` sorgusuna tek satır uyuyor), ama ikinci satır
 * eşleşir eşleşmez ziyaretçiye BAŞKA kategorinin sayfası döner ve hiçbir yerde ses çıkmaz.
 *
 * Kural, cetvelin dil hiyerarşisiyle aynı sırada (`category-taxonomy-standard.md` §4):
 * kanonik EN slug > o dilin görünen slug'ı (tr) > diğer dilin görünen slug'ı (en).
 *
 * Fonksiyon SAF ve dışa açık: kapı (`INV-KATEGORI-COZUCU-1`) onu ağ/DB olmadan ölçer.
 */
type SlugAdayi = { slug: string | null; metadata: unknown; id?: string | null }

export function kategoriSatiriSec<T extends SlugAdayi>(rows: T[], slug: string): T | null {
  if (rows.length === 0) return null

  const yerel = (row: T, dil: 'tr' | 'en'): string | null => {
    const meta = row.metadata
    if (!meta || typeof meta !== 'object' || !('slug' in meta)) return null
    const s = (meta as { slug?: unknown }).slug
    if (!s || typeof s !== 'object') return null
    const v = (s as Record<string, unknown>)[dil]
    return typeof v === 'string' && v.length > 0 ? v : null
  }

  const oncelik = (row: T): number =>
    row.slug === slug ? 0 : yerel(row, 'tr') === slug ? 1 : yerel(row, 'en') === slug ? 2 : 3

  const sirali = [...rows].sort((a, b) => {
    const fark = oncelik(a) - oncelik(b)
    if (fark !== 0) return fark
    // AYNI öncelikte iki satır = VERİ kusuru (iki kategori aynı adresi iddia ediyor).
    // Çözücü burada doğruyu BİLEMEZ; yapabileceği tek şey seçimi DETERMİNİSTİK kılmak,
    // yani aynı istek iki kez geldiğinde aynı sayfayı vermek. Rastgele salınan bir seçim
    // "bazen doğru" görünür ve tam o yüzden hiçbir ölçüm onu yakalayamaz.
    // ⭐`localeCompare` BİLEREK KULLANILMIYOR, ve bunu kapı bana ÖLÇEREK gösterdi
    // (INV-9 madde 3, #1127 ilk koşumunda kırmızı). İlk yazışta `localeCompare` vardı;
    // kapı "dil argümanı yok" dedi ve haklıydı — ama asıl kusur daha derin: `localeCompare`
    // çalışma zamanının yerel ayarına göre sonuç değiştirebilir, yani DETERMİNİSTİKLİK
    // iddiasının kendisini çürütürdü. Burada sıralanan şey insana gösterilen bir metin
    // değil, bir KİMLİK (uuid ya da slug); doğru araç kod-birimi karşılaştırmasıdır.
    const ida = String(a.id ?? a.slug ?? '')
    const idb = String(b.id ?? b.slug ?? '')
    return ida < idb ? -1 : ida > idb ? 1 : 0
  })

  const secilen = sirali[0]
  if (oncelik(secilen) === 3) return null

  const ayniOncelikte = sirali.filter((r) => oncelik(r) === oncelik(secilen))
  if (ayniOncelikte.length > 1) {
    console.warn(
      `[kategoriSatiriSec] "${slug}" adresini ${ayniOncelikte.length} satır aynı öncelikle ` +
        `iddia ediyor: ${ayniOncelikte.map((r) => r.slug).join(', ')}. Deterministik seçim ` +
        `yapıldı ama bu bir VERİ kusurudur — kategori adresleri tekil olmalı.`
    )
  }
  return secilen
}

/**
 * Kategoriyi kanonik slug (EN kolon) VEYA dile göre yerelleştirilmiş
 * `metadata.slug.tr` / `metadata.slug.en` üzerinden çözer.
 * Migration uygulanmamışsa metadata yolları hiç eşleşmez, kanonik yol çalışır.
 */
export const getCachedCategoryData = cache(async (slug: string) => {
  const query = supabase.from('categories').select(CATEGORY_COLUMNS)

  // `.limit(3)`: `.or()` üç koşullu, sağlıklı veride her koşul en fazla bir satır gösterir.
  // Eski değer 2 idi ve üçüncü eşleşmeyi görünmez yapıyordu — belirsizliği ölçemediğimiz
  // hâl, belirsizlik yokmuş gibi görünür.
  const { data: rows, error } = SAFE_SLUG.test(slug)
    ? await query
        .or(`slug.eq.${slug},metadata->slug->>tr.eq.${slug},metadata->slug->>en.eq.${slug}`)
        .limit(3)
    : await query.eq('slug', slug).limit(1)

  // ⭐"YOK" İLE "ÖLÇEMEDİM" AYNI DEĞER OLAMAZ (2026-09-08, REC-205 soft-404 işi).
  //
  // Eskiden bu satır `if (error || !rows || rows.length === 0) return null` idi: sorgu HATASI ile
  // "böyle bir kategori yok" ayrımsız biçimde `null` dönüyordu. Çağıran taraf o `null`'a bakıp
  // 404 üretirse, GEÇİCİ bir DB arızası KALICI bir 404'e dönüşür — üstelik rota artık statik
  // olduğu için o 404 CDN'e yazılır ve gerçek kategori sayfası ortadan kalkar.
  //
  // Doğru davranış: ölçemediğimizde SUSMAK değil, PATLAMAK. `throw` Next tarafında 5xx'e döner
  // ve önbelleğe alınmaz; arıza geçince sayfa kendiliğinden geri gelir. Yokluk ise `null`
  // olarak kalır ve çağıran onu `notFound()`'a çevirir.
  if (error) {
    throw new Error(
      `getCachedCategoryData: kategori sorgusu DÜŞTÜ (slug=${slug}) — bu bir YOKLUK DEĞİL, ` +
        `ölçüm başarısızlığıdır; 404'e çevrilmemeli. Sebep: ${error.message}`,
    )
  }
  if (!rows || rows.length === 0) return null
  const data = kategoriSatiriSec(rows, slug)
  if (!data) return null

  return mapDatabaseCategoryToDomain({
    ...data,
    name: data.name || '',
    menu_label: data.menu_label as string | null,
    translation_key: data.translation_key as string | null,
    description: data.description as string | null,
    metadata: data.metadata as CategoryMetadata | null,
    authority_content: data.authority_content as AuthorityContent | null
  } as DbCategory)
})

// Preload pattern functions that can be called early in the render phase
export function preloadProduct(slug: string) {
  void getCachedProductBySlug(slug)
}

export function preloadCategory(slug: string) {
  void getCachedCategoryData(slug)
}
