/**
 * ESKİ ADRES EŞLEYİCİSİ — middleware'in tek sözlük araması (REC-300 Faz 3 madde 4; plan §4, §4.1, §6).
 *
 * SAF: DB'ye, isteğe, çereze bakmaz. Girdi yol + `?sku=` + (gerekirse) dil tespiti; çıktı TEK hedef
 * ve durum kodu ya da null ("eski adres değil, bugünkü akış devam etsin").
 *
 * KURALLAR (plan §4.1 ve §6 — her birinin testi `__tests__/eslestirici.test.ts`):
 *  1. Dil önekli eski adres → TEK 308 (sonuç yalnız yoldan türer, kalıcı önbelleğe uygun).
 *  2. Dilsiz eski adres → TEK 307; hedef dili ziyaretçiden (`dilTespit`, bugünkü `detectLocale`).
 *     AMA slug'ı TÜRKÇE olan dilsiz eski adres → deterministik TR'ye 308 (içerik zaten Türkçe; Y3).
 *  3. Segment ÖNEKİ eşlenir: `/category/fanlar/<x>` de eşleşir (bugünkü `:path*` kuralları); tanınmayan
 *     kuyruk düşer, bilinen en uzun önek kazanır. Sondaki `/` önce normalize edilir (O3).
 *  4. Hedefte query YOK — `?sku=` hedefe taşınmaz, hedefte yeniden eşleşip döngü kuramaz (K1).
 *     `utm_*` gibi parametrelerin düşmesi bilinçli (plan §6 satır 9, v4 D2).
 *  5. Hedef adresler yeni şemayla `adresUret(…, dil, true)`'dan kurulur — şemanın tek kaynağı.
 *  6. Hedef, gelen yolun kendisiyse null (kanonik adres kendine yönlenmez; EN önekleri yeni şemada
 *     değişmediği için `/en/category/<kök>` ve `/en/products/<aile>` bu yoldan geçer).
 *
 * Pasif kategori → aktif üst kategoriye; üstü de pasifse tüm ürünler (plan §5 Faz 3 m.5, v4 O4).
 * Model adresi biçimindeki yollar (`…-p-<sku>`) haritanın değil sayfa çözücüsünün işidir → null.
 */
import { type AdresDili, type AdresNesnesi, adresUret, MODEL_AYIRICI } from '@/utils/adresUret'

import type { KategoriHedefi, KiraciHaritasi } from './haritaTipi'

export interface EslesmeGirdisi {
  /** İsteğin yolu (`request.nextUrl.pathname`), query'siz. */
  yol: string
  /** `?sku=` değeri; yoksa null. Harf duyarsız. */
  sku: string | null
  /** Yalnız dilsiz ve dile bağlı adreste çağrılır (bugünkü `detectLocale`). */
  dilTespit: () => AdresDili
}

export interface EslesmeSonucu {
  hedef: string
  durum: 307 | 308
}

const DILLER: readonly AdresDili[] = ['tr', 'en']
const KATEGORI_ONEKLERI = new Set(['category', 'kategori'])
const URUN_ONEKLERI = new Set(['products', 'urun'])
const TUM_URUNLER_ONEKLERI = new Set(['products', 'urunler'])

/** Sondaki eğik çizgileri atar (kök `/` hariç). */
function normalizeEt(yol: string): string {
  const kirpilmis = yol.replace(/\/+$/, '')
  return kirpilmis === '' ? '/' : kirpilmis
}

/** Segmentleri çözer; bozuk yüzde kodlamada null (eşleşme yok — bugünkü akış karar versin). */
function segmentler(yol: string): string[] | null {
  const parcalar = yol.split('/').filter(Boolean)
  try {
    return parcalar.map((p) => decodeURIComponent(p).toLowerCase())
  } catch {
    return null
  }
}

interface Cozum {
  nesne: (dil: AdresDili) => AdresNesnesi
  /** Slug Türkçe biçimle mi eşleşti? (dilsiz adreste deterministik TR kararı) */
  turkce: boolean
}

/** Kategori indeksini (pasifse aktif üstüne tırmanarak) adres nesnesine çevirir. */
function kategoriNesnesi(harita: KiraciHaritasi, hedef: KategoriHedefi): (dil: AdresDili) => AdresNesnesi {
  if ('urunler' in hedef) return () => ({ tur: 'urunler' })
  let i: number | null = hedef.kategori
  const gorulen = new Set<number>()
  while (i !== null && !harita.kategoriler[i]?.aktif) {
    if (gorulen.has(i)) return () => ({ tur: 'urunler' })
    gorulen.add(i)
    i = harita.kategoriler[i]?.ust ?? null
  }
  if (i === null) return () => ({ tur: 'urunler' })
  const k = harita.kategoriler[i]
  const ust = k.ust === null ? null : harita.kategoriler[k.ust]
  return (dil) => (ust ? { tur: 'kategori', kok: ust[dil], dal: k[dil] } : { tur: 'kategori', kok: k[dil] })
}

function kategoriCoz(harita: KiraciHaritasi, kuyruk: string[]): Cozum | null {
  const ilk = kuyruk[0] ? harita.kategoriSluglari[kuyruk[0]] : undefined
  if (!ilk) return null
  // İki seviye: ikinci segment bilinen bir kategoriyse o kazanır — kök segmenti yanlış olsa bile
  // (üst değişimi, v4 O6) dalın bugünkü köküne gidilir. Tanınmayan ikinci segment düşer (önek eşleşmesi).
  const ikinci = kuyruk[1] ? harita.kategoriSluglari[kuyruk[1]] : undefined
  const secilen = ikinci ?? ilk
  return {
    nesne: kategoriNesnesi(harita, secilen.hedef),
    turkce: ilk.bicim === 'tr' || ikinci?.bicim === 'tr',
  }
}

function modelNesnesi(harita: KiraciHaritasi, sku: string): ((dil: AdresDili) => AdresNesnesi) | null {
  const model = harita.modeller[sku]
  if (!model) return null
  const aileSlug = harita.aileler[model.aile]
  if (aileSlug === undefined) return null
  return (dil) => {
    const slug = model.slug[dil]
    // Model adres metni yoksa (Faz 2 verisi eksik) aile adresi: kırık model adresi üretilmez.
    return slug ? { tur: 'model', aileSlug, sku, slug } : { tur: 'aile', slug: aileSlug }
  }
}

function urunCoz(harita: KiraciHaritasi, segment: string, skuParametresi: string | null): Cozum | null {
  // `…-p-<sku>` yeni model adresidir; kanonikliğine (büyük harf, yanlış slug) sayfa çözücüsü karar verir.
  if (segment.includes(MODEL_AYIRICI)) return null
  if (skuParametresi) {
    const buyuk = skuParametresi.trim().toUpperCase()
    const sku = buyuk in harita.modeller ? buyuk : harita.eskiSkular[buyuk]
    const nesne = sku ? modelNesnesi(harita, sku) : null
    if (nesne) return { nesne, turkce: false }
    // Bilinmeyen SKU: parametre yok sayılır, yol kendi başına çözülür.
  }
  const aile = harita.aileSluglari[segment]
  if (aile !== undefined) {
    const slug = harita.aileler[aile]
    return slug === undefined ? null : { nesne: () => ({ tur: 'aile', slug }), turkce: false }
  }
  const sku = harita.urunSluglari[segment]
  const nesne = sku ? modelNesnesi(harita, sku) : null
  return nesne ? { nesne, turkce: false } : null
}

/**
 * Yol eski bir adres mi? Öyleyse tek hedef + durum; değilse null.
 * `harita` yoksa (kiracının haritası üretilmemiş) null — eşleyici tahmin yürütmez.
 */
export function eskiAdresEsle(harita: KiraciHaritasi | undefined, girdi: EslesmeGirdisi): EslesmeSonucu | null {
  if (!harita) return null
  const yol = normalizeEt(girdi.yol)
  const parcalar = segmentler(yol)
  if (!parcalar || parcalar.length === 0) return null

  const onekDili = DILLER.find((d) => d === parcalar[0])
  const kuyruk = onekDili ? parcalar.slice(1) : parcalar
  const [bolum, ...geri] = kuyruk
  if (!bolum) return null

  let cozum: Cozum | null = null
  if (KATEGORI_ONEKLERI.has(bolum)) {
    cozum = kategoriCoz(harita, geri)
  } else if (URUN_ONEKLERI.has(bolum) && geri.length === 1) {
    cozum = urunCoz(harita, geri[0], girdi.sku)
  } else if (TUM_URUNLER_ONEKLERI.has(bolum) && geri.length === 0) {
    cozum = { nesne: () => ({ tur: 'urunler' }), turkce: bolum === 'urunler' }
  }
  if (!cozum) return null

  let dil: AdresDili
  let durum: 307 | 308
  if (onekDili) {
    dil = onekDili
    durum = 308
  } else if (cozum.turkce) {
    dil = 'tr'
    durum = 308
  } else {
    dil = girdi.dilTespit()
    durum = 307
  }

  const hedef: string = adresUret(cozum.nesne(dil), dil, true)
  // Kanonik adres kendine yönlenmez. `?sku=` varken de: aynı yola query'siz gitmek model seçimini
  // düşürür ve kazancı yoktur (model adresi metni gelince hedef zaten farklı olur).
  if (hedef === yol) return null
  return { hedef, durum }
}
