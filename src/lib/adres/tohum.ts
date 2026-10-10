/**
 * ESKİ ADRES TOHUMU — tip + doğrulayıcı (REC-300 plan §4.1 Y1).
 *
 * Tohum dosyası (`src/data/eski-adres-tohum.json`) DB'de hiç var olmamış ama bugün yönlendirilen
 * eski adresleri taşır: 13 dilsiz kategori kuralının kaynakları, bugün 404 veren 4 hedefin en
 * yakın canlı karşılığı, 6 Lineo çap ailesi ve `next.config`'teki 6 ürün kuralı. Faz 3-C'de o
 * `next.config` satırları silindiğinde bu adreslerin tek taşıyıcısı burasıdır.
 *
 * NİÇİN ÇALIŞMA ANINDA DOĞRULANIR: JSON içe aktarımı TS'e yalnız "şu biçimde bir nesne" der; elle
 * düzenlenen bir dosyada yazım hatası (`hedefsku`, boş `eski`) sessizce "tohum yok" olurdu ve
 * eski adres yeniden 404'e düşerdi. Doğrulayıcı bozuk tohumda HATA fırlatır — üretim düşer.
 */
import type { SlugBicimi } from './haritaTipi'

export interface TohumKategori {
  eski: string
  bicim: Exclude<SlugBicimi, 'ortak'>
  /** Hedef kategorinin kanonik (EN) slug'ı; null = karşılığı yok → tüm ürünler. */
  hedef: string | null
  kaynak: string
}

export interface TohumAile {
  eski: string
  /** Hedef ailenin slug'ı (bugünkü ya da takma adı olan eski slug'ı). */
  hedef: string
  kaynak: string
}

export interface TohumUrun {
  eski: string
  hedefSku: string
  kaynak: string
}

export interface EskiAdresTohumu {
  kiraci: string
  kategoriler: TohumKategori[]
  aileler: TohumAile[]
  urunler: TohumUrun[]
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SKU = /^[A-Z0-9-]+$/

function kayit(v: unknown, yer: string): Record<string, unknown> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new Error(`[tohum] ${yer}: nesne bekleniyordu`)
  return v as Record<string, unknown>
}

function metin(v: unknown, yer: string, desen?: RegExp): string {
  if (typeof v !== 'string' || v.length === 0) throw new Error(`[tohum] ${yer}: boş olmayan metin bekleniyordu`)
  if (desen && !desen.test(v)) throw new Error(`[tohum] ${yer}: "${v}" biçim dışı`)
  return v
}

function dizi(v: unknown, yer: string): unknown[] {
  if (!Array.isArray(v)) throw new Error(`[tohum] ${yer}: dizi bekleniyordu`)
  return v
}

/** Ham JSON'u doğrular; bozuksa hata fırlatır. Aynı `eski` iki kez geçemez (hangisi geçerli belirsiz olurdu). */
export function tohumDogrula(ham: unknown): EskiAdresTohumu {
  const kok = kayit(ham, 'kök')
  const kiraci = metin(kok.kiraci, 'kiraci')

  const kategoriler = dizi(kok.kategoriler, 'kategoriler').map((v, i): TohumKategori => {
    const k = kayit(v, `kategoriler[${i}]`)
    const bicim = k.bicim
    if (bicim !== 'tr' && bicim !== 'en') throw new Error(`[tohum] kategoriler[${i}].bicim: 'tr' ya da 'en' olmalı`)
    const hedef = k.hedef === null ? null : metin(k.hedef, `kategoriler[${i}].hedef`, SLUG)
    return { eski: metin(k.eski, `kategoriler[${i}].eski`, SLUG), bicim, hedef, kaynak: metin(k.kaynak, `kategoriler[${i}].kaynak`) }
  })

  const aileler = dizi(kok.aileler, 'aileler').map((v, i): TohumAile => {
    const a = kayit(v, `aileler[${i}]`)
    return {
      eski: metin(a.eski, `aileler[${i}].eski`, SLUG),
      hedef: metin(a.hedef, `aileler[${i}].hedef`, SLUG),
      kaynak: metin(a.kaynak, `aileler[${i}].kaynak`),
    }
  })

  const urunler = dizi(kok.urunler, 'urunler').map((v, i): TohumUrun => {
    const u = kayit(v, `urunler[${i}]`)
    return {
      eski: metin(u.eski, `urunler[${i}].eski`, SLUG),
      hedefSku: metin(u.hedefSku, `urunler[${i}].hedefSku`, SKU),
      kaynak: metin(u.kaynak, `urunler[${i}].kaynak`),
    }
  })

  for (const [ad, liste] of [['kategoriler', kategoriler], ['aileler', aileler], ['urunler', urunler]] as const) {
    const gorulen = new Set<string>()
    for (const { eski } of liste) {
      if (gorulen.has(eski)) throw new Error(`[tohum] ${ad}: "${eski}" iki kez yazılmış`)
      gorulen.add(eski)
    }
  }

  return { kiraci, kategoriler, aileler, urunler }
}
