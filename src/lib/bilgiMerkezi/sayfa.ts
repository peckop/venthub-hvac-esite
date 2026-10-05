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
}

export interface UrunKarti {
  ad: string
  href: Route
}

export interface IlgiliYazi {
  baslik: string
  ozet: string
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

export async function yaziSayfasiHazirla(
  yazi: RehberYazisi,
  dil: YaziDili,
  kaynak: BilgiMerkeziKaynagi,
  yazilar: readonly RehberYazisi[] = YAZILAR,
): Promise<YaziSayfasi> {
  const metin = yazi.diller[dil]
  if (!metin) throw new Error(`[bilgi merkezi] "${yazi.kimlik}" yazısı ${dil} dilinde yok`)
  const ayrismis = markdownAyristir(metin.govde)
  const kimlikler = [...baglantilariTopla(ayrismis).filter((h) => h.startsWith('vh:')), ...yazi.urunler]
  const hrefler = await icBaglantilariCoz(kimlikler, dil, kaynak)

  const urunKartlari: UrunKarti[] = []
  for (const k of yazi.urunler) {
    urunKartlari.push(await aileKartiHazirla(k, dil, kaynak, hrefler.get(k) as Route))
  }

  const ilgiliYazilar = ilgiliYazilariSec(yazi, dil, yazilar).map((y) => {
    const m = y.diller[dil] as YaziMetni
    return { baslik: markdownAyristir(m.govde).h1, ozet: m.ozet, href: bilgiMerkeziYaziHref(m.slug, dil) }
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
    ilgiliYazilar,
  }
}
