import type { Route } from 'next'

import { dildekiYazilar, type RehberYazisi, type YaziDili, YAZILAR,type YaziMetni } from '../../data/bilgiMerkezi/yazilar'
import { bilgiMerkeziYaziHref } from '../../utils/bilgiMerkezi'
import { IcBaglantiHatasi, type IcBaglantiKaynagi, icBaglantilariCoz, kimlikAyristir } from './icBaglanti'
import {
  type AyrismisYazi,
  baglantilariTopla,
  icindekiler,
  type IcindekilerOgesi,
  markdownAyristir,
  okumaSuresiDakika,
} from './markdown'

/**
 * Bir rehber yazısının sayfa modelini SUNUCUDA hazırlar: gövde ayrıştırılır, bütün `vh:` kimlikleri
 * bugünkü adrese çözülür, içindekiler, okuma süresi, ürün kartları ve ilgili yazılar çıkarılır.
 * Her hata ATAR (çözülemeyen bağlantı, desteklenmeyen biçim, bulunamayan ürün ailesi) → sayfa
 * üretilmez, derleme durur. Boş bölüm üretilmez: kart/ilgili yazı yoksa dizi boş döner ve görünüm
 * o bloğu hiç basmaz (eski konu sayfasındaki boş başlık kusuru — rehber-yazisi-standard R0.1).
 */

export type BilgiMerkeziKaynagi = IcBaglantiKaynagi & {
  aileKarti(slug: string, dil: string): Promise<{ slug: string; ad: string } | null>
  /**
   * Kategori kartı verisi (URN-151). `ad` = `getCategoryDisplayName` (sözlük → menü etiketi → ad), `aciklama` =
   * `getCategoryDescription` (o dilin metni; yoksa BOŞ dize, başka dile düşme yok). Pasif/silinmiş kategori `null`.
   */
  kategoriKarti(slug: string, dil: string): Promise<{ slug: string; ad: string; aciklama: string } | null>
}

export interface UrunKarti {
  ad: string
  href: Route
}

/** Yazının "İlgili ürün kategorileri" kutusundaki kart (URN-151). Markasızdır: kategori adı + kısa metin. */
export interface KategoriKarti {
  ad: string
  /** Kategorinin o dildeki kısa metni; yoksa boş (görünüm satırı hiç basmaz, Türkçe metin yedeği konmaz). */
  aciklama: string
  href: Route
}

export interface IlgiliYazi {
  baslik: string
  /** Kartta görünen metin: ilgili yazının `kartOzeti` alanı; meta açıklaması (`ozet`) DEĞİL. Boşsa çizilmez. */
  kartOzeti: string
  href: Route
}

export interface YaziSayfasi {
  yazi: RehberYazisi
  dil: YaziDili
  metin: YaziMetni
  ayrismis: AyrismisYazi
  /** `vh:` kimliği → çözülmüş dil önekli adres. */
  hrefler: Map<string, Route>
  icindekiler: IcindekilerOgesi[]
  okumaSuresi: number
  urunKartlari: UrunKarti[]
  /** `yazi.ilgiliKategoriler` kimliklerinden (URN-151); alan yoksa ya da boşsa boş dizi, görünüm bloğu basmaz. */
  kategoriKartlari: KategoriKarti[]
  ilgiliYazilar: IlgiliYazi[]
}

/** İlgili yazılar: aynı konu ya da ortak ürün ailesi; en çok üç (R3, tasarım K37-a / U2). */
export function ilgiliYazilariSec(
  yazi: RehberYazisi,
  dil: YaziDili,
  yazilar: readonly RehberYazisi[] = YAZILAR,
): RehberYazisi[] {
  const urunler = new Set(yazi.urunler)
  return dildekiYazilar(dil, yazilar)
    .filter((y) => y.kimlik !== yazi.kimlik)
    .filter((y) => y.konu === yazi.konu || y.urunler.some((u) => urunler.has(u)))
    .slice(0, 3)
}

async function aileKartiHazirla(kimlik: string, dil: YaziDili, kaynak: BilgiMerkeziKaynagi, href: Route): Promise<UrunKarti> {
  const { tur, anahtar } = kimlikAyristir(kimlik)
  if (tur !== 'aile') throw new IcBaglantiHatasi(kimlik, 'ürün kartı yalnız aile kimliğiyle yazılır (vh:aile/<slug>)')
  const guncel = (await kaynak.aile(anahtar))?.slug ?? (await kaynak.takmaAd('aile', anahtar.toLowerCase()))
  const kart = guncel ? await kaynak.aileKarti(guncel, dil) : null
  if (!kart) throw new IcBaglantiHatasi(kimlik, 'ürün kartı için aile bulunamadı')
  return { ad: kart.ad, href }
}

/**
 * Kategori kimliği → kart (URN-151). Pasif/silinmiş kategori ya da adı boş kayıt SESSİZ GEÇMEZ: ATAR (derleme durur).
 * Bağlantı çözümü (`hrefler`) zaten `icBaglantilariCoz`da yapılır; burada yalnız görünen veri toplanır.
 * Eski (takma adlı) slug bugünkü slug'a çevrilir; kart bugünkü kategoriden beslenir.
 */
async function kategoriKartiHazirla(kimlik: string, dil: YaziDili, kaynak: BilgiMerkeziKaynagi, href: Route): Promise<KategoriKarti> {
  const { tur, anahtar } = kimlikAyristir(kimlik)
  if (tur !== 'kategori') throw new IcBaglantiHatasi(kimlik, 'kategori kartı yalnız kategori kimliğiyle yazılır (vh:kategori/<slug>)')
  const guncel = (await kaynak.kategori(anahtar))?.slug ?? (await kaynak.takmaAd('kategori', anahtar.toLowerCase()))
  const kart = guncel ? await kaynak.kategoriKarti(guncel, dil) : null
  if (!kart) throw new IcBaglantiHatasi(kimlik, 'kategori kartı için etkin kategori bulunamadı')
  if (!kart.ad.trim()) throw new IcBaglantiHatasi(kimlik, 'kategori kartı için görünen ad boş')
  return { ad: kart.ad, aciklama: kart.aciklama.trim(), href }
}

export async function yaziSayfasiHazirla(
  yazi: RehberYazisi,
  dil: YaziDili,
  kaynak: BilgiMerkeziKaynagi,
  yazilar: readonly RehberYazisi[] = YAZILAR,
): Promise<YaziSayfasi> {
  const metin = yazi.diller[dil]
  if (!metin) throw new Error(`[bilgi merkezi] "${yazi.kimlik}" yazısı ${dil} dilinde yok`)
  const ayrismis = markdownAyristir(metin.govde)
  // Aynı kategori alanda tekrar edebilir; kart tekrarsız çizilir (Set).
  const kategoriKimlikleri = [...new Set(yazi.ilgiliKategoriler ?? [])]
  const kimlikler = [...baglantilariTopla(ayrismis).filter((h) => h.startsWith('vh:')), ...yazi.urunler, ...kategoriKimlikleri]
  // Yazı kendine bağlanamaz (URN-140): kendi sayfasına giden bağlantı boş tıklamadır, ters dizine de sayılmaz.
  if (kimlikler.includes(`vh:yazi/${yazi.kimlik}`)) {
    throw new IcBaglantiHatasi(`vh:yazi/${yazi.kimlik}`, 'yazı kendine bağlanamaz (self-link)')
  }
  const hrefler = await icBaglantilariCoz(kimlikler, dil, kaynak, yazilar)

  const urunKartlari: UrunKarti[] = []
  for (const k of yazi.urunler) {
    urunKartlari.push(await aileKartiHazirla(k, dil, kaynak, hrefler.get(k) as Route))
  }

  const kategoriKartlari: KategoriKarti[] = []
  for (const k of kategoriKimlikleri) {
    kategoriKartlari.push(await kategoriKartiHazirla(k, dil, kaynak, hrefler.get(k) as Route))
  }

  const ilgiliYazilar = ilgiliYazilariSec(yazi, dil, yazilar).map((y) => {
    const m = y.diller[dil] as YaziMetni
    return { baslik: markdownAyristir(m.govde).h1, kartOzeti: m.kartOzeti.trim(), href: bilgiMerkeziYaziHref(m.slug, dil) }
  })

  return {
    yazi,
    dil,
    metin,
    ayrismis,
    hrefler,
    icindekiler: icindekiler(ayrismis),
    okumaSuresi: okumaSuresiDakika(metin.govde),
    urunKartlari,
    kategoriKartlari,
    ilgiliYazilar,
  }
}
