import type { Route } from 'next'

import { EN_YAYIN } from '../../config/features'
import { dildekiYazilar, type RehberYazisi, type YaziDili, YAZILAR, type YaziMetni } from '../../data/bilgiMerkezi/yazilar'
import { bilgiMerkeziDilAcik, bilgiMerkeziYaziHref } from '../../utils/bilgiMerkezi'
import { baglantilariTopla, markdownAyristir } from './markdown'

/**
 * TERS DİZİN — hangi kategori / ürün ailesi hangi rehber yazısına bağlanır (REC-452;
 * rehber-yazisi-standard.md R3.1).
 *
 * NİÇİN: yazı kategoriye ve ailelere bağlanıyordu, ters yön YOKTU. 2026-09-29 ölçümü: frekans
 * konvertörü rehberine sitenin içinden bağlanan TEK sayfa Bilgi Merkezi listesiydi (kategori 0,
 * aileler 0, ana sayfa 0); Google yazıyı 4 gün sonra hâlâ dizine almamıştı. Arama motoru bir
 * sayfanın önemini kısmen site içinden aldığı bağlantıdan okur.
 *
 * ELLE LİSTE YOK: dizin yazının KENDİ kimliklerinden türer — gövdedeki `vh:kategori/…`,
 * `vh:aile/…` bağlantıları + `urunler` listesi. Yeni yazı eklenince bağlantı kendiliğinden gelir;
 * yazıdan kimlik silinince kendiliğinden gider.
 *
 * SINIR: eşleşme kimliğin YAZILDIĞI slug iledir. Yazı eski (takma adlı) bir slug taşıyorsa çözücü
 * yazıdaki bağlantıyı yeni adrese çözer ama ters dizin yeni slug'ı tanımaz; yazı yeniden yazılırken
 * kimlik güncel slug'la yazılır (R3).
 *
 * SAF: DB'ye gitmez; yazılar ve EN bayrağı parametre (testler sentetik yazıyla koşar).
 */

export interface RehberBaglantisi {
  baslik: string
  ozet: string
  href: Route
}

export type RehberHedefi = `vh:kategori/${string}` | `vh:aile/${string}`

/** Yazının o dildeki metninin bağlandığı kategori ve aile kimlikleri (+ ürün kartları). */
export function yazininHedefleri(yazi: RehberYazisi, dil: YaziDili): Set<string> {
  const metin = yazi.diller[dil]
  const hedefler = new Set<string>(yazi.urunler.filter((k) => k.startsWith('vh:aile/')))
  if (!metin) return hedefler
  for (const h of baglantilariTopla(markdownAyristir(metin.govde))) {
    if (h.startsWith('vh:kategori/') || h.startsWith('vh:aile/')) hedefler.add(h)
  }
  return hedefler
}

function baglanti(yazi: RehberYazisi, dil: YaziDili): RehberBaglantisi {
  const m = yazi.diller[dil] as YaziMetni
  return { baslik: markdownAyristir(m.govde).h1, ozet: m.ozet, href: bilgiMerkeziYaziHref(m.slug, dil) }
}

/** Sayfanın dili (`lang`) → yazı dili; Bilgi Merkezi o dilde kapalıysa `null`. */
function acikDil(lang: string, enYayin: boolean): YaziDili | null {
  const dil: YaziDili = lang === 'en' ? 'en' : 'tr'
  return bilgiMerkeziDilAcik(dil, enYayin) ? dil : null
}

/**
 * Bir kategori ya da aile sayfasının bağlanacağı rehberler, yeniden eskiye, en çok `adet`.
 * O dilde Bilgi Merkezi kapalıysa ya da yazı yoksa BOŞ dizi — görünüm bloğu hiç basmaz.
 */
export function ilgiliRehberler(
  hedef: RehberHedefi | readonly RehberHedefi[],
  lang: string,
  adet: number = 3,
  yazilar: readonly RehberYazisi[] = YAZILAR,
  enYayin: boolean = EN_YAYIN,
): RehberBaglantisi[] {
  const dil = acikDil(lang, enYayin)
  if (!dil) return []
  // Birden çok kimlik: yeniden adlandırılan ailenin eski slug'ı da sayılır (`eskiAileSluglari.ts`).
  const aranan = typeof hedef === 'string' ? [hedef] : hedef
  return dildekiYazilar(dil, yazilar)
    .filter((y) => {
      const hedefler = yazininHedefleri(y, dil)
      return aranan.some((h) => hedefler.has(h))
    })
    .slice(0, adet)
    .map((y) => baglanti(y, dil))
}

/** Ana sayfa için en yeni rehberler (yayın tarihine göre), en çok `adet`. */
export function enYeniRehberler(
  lang: string,
  adet: number = 3,
  yazilar: readonly RehberYazisi[] = YAZILAR,
  enYayin: boolean = EN_YAYIN,
): RehberBaglantisi[] {
  const dil = acikDil(lang, enYayin)
  if (!dil) return []
  return dildekiYazilar(dil, yazilar)
    .slice(0, adet)
    .map((y) => baglanti(y, dil))
}
