import type { Route } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import type { DomainCategory } from '@/lib/type-converters'
import { type AdresDili, adresUret } from '@/utils/adresUret'
import { getLocalizedCategorySlug } from '@/utils/categoryHelpers'

import { eskiKategoriHedefi, getCachedCategoryData, getCachedKategoriUstById, type KategoriUst } from './preload'

/**
 * K3-b KATEGORİ ADRESİ ÇÖZÜCÜSÜ (REC-300 Faz 3b-2, plan §5 Faz 3 madde 1 + 5).
 *
 * TEK KARAR NOKTASI: yeni TR rotası (`/tr/kategori/<kök>[/<dal>]`), eski TR rotaları
 * (`/tr/category/*`) ve EN rotaları (`/en/category/<x>`, `/en/category/<kök>/<dal>`) bayrak
 * açıkken AYNI çözücüden geçer. Her rota yalnız "istenen adres" ile "kanonik adres"i karşılaştırır:
 * eşitse çizer, değilse 308. Böylece bir kategori hiçbir an iki adresten 200 dönemez (REC-205,
 * INV-ADRES-TEK-KANONIK-1) — eşitlik tek bir fonksiyonun çıktısına bağlı.
 *
 * KURALLAR (plan §2, §4.1, §12a):
 *  - Dal slug'la bulunur, adresteki kök segmenti KARAR VERMEZ (O6): `parent_id` değişirse eski
 *    `/kategori/<eski-kök>/<dal>` kanonik köke 308 alır, kırılmaz.
 *  - Adresteki slug TR ya da EN biçimli olabilir (O2) ve büyük harf taşıyabilir: çözüm küçük harfle
 *    yapılır, kanonik adres her zaman o dilin görünen slug'ıyla kurulur.
 *  - Sondaki `/` (boş segment) yok sayılır (O3); ikiden fazla segment → yok.
 *  - Pasif kategori (O4): aktif üst → üstün kanonik adresi; üst yok ya da pasif → tüm ürünler.
 *  - Bulunamayan slug → takma ad tablosu (REC-300 Faz 1-A) → yoksa 404.
 *  - DB hatası FIRLATILIR (`getCachedCategoryData`, `getCachedTakmaAd`, `getCachedKategoriUstById`
 *    fırlatır): geçici arıza kalıcı 404 olarak önbelleğe girmesin.
 */

/** Çözücünün kategori satırından okuduğu alanlar (`DomainCategory` bunu karşılar). */
export interface KategoriSatiri {
  slug: string | null
  metadata?: unknown
  is_active: boolean | null
  parent_id: string | null
}

export interface KategoriCozucuBagimliliklari<K extends KategoriSatiri> {
  /** Slug (kanonik / TR / EN) → kategori; yoksa null, sorgu hatasında FIRLATIR. */
  kategoriGetir: (slug: string) => Promise<K | null>
  /** Kimlik → üst kategori (slug + etkinlik + kendi üstü); yoksa null, hatada FIRLATIR. */
  ustGetir: (id: string) => Promise<KategoriUst | null>
  /** Eski slug → bugünkü görünen slug (takma ad); yoksa null, hatada FIRLATIR. */
  eskiHedef: (slug: string, dil: AdresDili) => Promise<string | null>
}

/** Üretimdeki bağımlılıklar (React.cache'li, hata fırlatan okuyucular). */
export const kategoriBagimliliklari: KategoriCozucuBagimliliklari<DomainCategory> = {
  kategoriGetir: getCachedCategoryData,
  ustGetir: getCachedKategoriUstById,
  eskiHedef: eskiKategoriHedefi,
}

export type KategoriCozumu<K extends KategoriSatiri> =
  | { tur: 'kategori'; kategori: K; ust: KategoriUst | null }
  | { tur: 'yonlendir'; hedef: Route }
  | { tur: 'yok' }

type SlugKaynagi = { slug: string | null; metadata?: unknown }

/**
 * Kategorinin kanonik adresi (yeni şema): üstü varsa İKİ seviye (`<kök>/<dal>`), yoksa kök.
 * Adres `adresUret`'ten çıkar (kural 7); slug'lar o dilin görünen slug'ı.
 */
export function kategoriKanonikAdresi(kategori: SlugKaynagi, ust: SlugKaynagi | null, dil: AdresDili): Route {
  const yaprak = getLocalizedCategorySlug(kategori, dil)
  return ust
    ? adresUret({ tur: 'kategori', kok: getLocalizedCategorySlug(ust, dil), dal: yaprak }, dil)
    : adresUret({ tur: 'kategori', kok: yaprak }, dil)
}

/** Adresin segmentlerini kategoriye çözer (saf karar; bağımlılıklar enjekte edilir). */
export async function kategoriSegmentleriniCoz<K extends KategoriSatiri>(
  segmentler: readonly string[],
  dil: AdresDili,
  bag: KategoriCozucuBagimliliklari<K>,
): Promise<KategoriCozumu<K>> {
  const parcalar = segmentler.filter((s) => s.length > 0)
  if (parcalar.length === 0 || parcalar.length > 2) return { tur: 'yok' }

  const yaprakSlug = parcalar[parcalar.length - 1].toLowerCase()
  let kategori = await bag.kategoriGetir(yaprakSlug)
  if (!kategori) {
    const eski = await bag.eskiHedef(yaprakSlug, dil)
    if (eski) kategori = await bag.kategoriGetir(eski)
  }
  if (!kategori) return { tur: 'yok' }

  const ust = kategori.parent_id ? await bag.ustGetir(kategori.parent_id) : null

  if (kategori.is_active !== true) {
    // Pasif kategori (O4): bugün 7 satır canlıda 200 dönüyor. Aktif üst varsa oraya, yoksa tüm ürünler.
    if (ust && ust.is_active === true) {
      const ustunUstu = ust.parent_id ? await bag.ustGetir(ust.parent_id) : null
      return { tur: 'yonlendir', hedef: kategoriKanonikAdresi(ust, ustunUstu, dil) }
    }
    return { tur: 'yonlendir', hedef: adresUret({ tur: 'urunler' }, dil) }
  }

  return { tur: 'kategori', kategori, ust }
}

/**
 * Rota tarafı: çözer ve SONUCU UYGULAR. `istenen` = bu isteğin adresi (`adresUret` ile aynı
 * biçimde kurulmuş); kanonik adresle birebir aynı değilse 308. `istenen` null ise (eski TR
 * rotaları) her zaman 308 — o adresler hiçbir durumda 200 dönmez.
 */
export async function kategoriRotasiniUygula<K extends KategoriSatiri>(
  segmentler: readonly string[],
  dil: AdresDili,
  istenen: Route | null,
  bag: KategoriCozucuBagimliliklari<K>,
): Promise<{ kategori: K; ust: KategoriUst | null }> {
  const cozum = await kategoriSegmentleriniCoz(segmentler, dil, bag)
  if (cozum.tur === 'yok') notFound()
  if (cozum.tur === 'yonlendir') permanentRedirect(cozum.hedef)
  const kanonik = kategoriKanonikAdresi(cozum.kategori, cozum.ust, dil)
  if (istenen !== kanonik) permanentRedirect(kanonik)
  return { kategori: cozum.kategori, ust: cozum.ust }
}
