/**
 * ESKİ ADRES ENVANTERİ — haritanın tanıdığı her eski adresi eşleyiciden geçirip "eski → yeni" listesi
 * çıkarır ve döngü/query/tek-hop ihlallerini sayar (plan §6, §7 INV-ADRES-HARITA-1).
 *
 * Middleware bunu İÇE AKTARMAZ (Edge paketine girmesin); tüketicileri testler ve Faz 3-C'de commit'lenecek
 * envanter dosyasının üretimi. Dilsiz adreslerde dil tespiti sabit bir dille taklit edilir.
 */
import type { AdresDili } from '@/utils/adresUret'
import { localizedHref } from '@/utils/routes'

import { eskiAdresEsle } from './eslestirici'
import type { KiraciHaritasi } from './haritaTipi'

export interface EnvanterSatiri {
  eski: string
  sku: string | null
  yeni: string
  durum: 307 | 308
}

export interface EnvanterIhlali {
  eski: string
  sku: string | null
  sebep: string
}

export interface Envanter {
  satirlar: EnvanterSatiri[]
  ihlaller: EnvanterIhlali[]
}

/** Eşleyicinin yolu tanıyabileceği her aday adres (eski önek, yeni önek, dilli, dilsiz). */
function adayAdresler(harita: KiraciHaritasi): { yol: string; dilli: boolean; sku: string | null }[] {
  const adaylar: { yol: string; dilli: boolean; sku: string | null }[] = []
  // Dil öneki SSOT'tan (INV-2); null = dilsiz eski adres.
  const diller: (AdresDili | null)[] = ['tr', 'en', null]
  const kategoriSluglari = Object.keys(harita.kategoriSluglari)
  for (const dil of diller) {
    const ekle = (taban: string, sku: string | null = null) =>
      adaylar.push({ yol: dil ? localizedHref(taban, dil) : taban, dilli: dil !== null, sku })
    for (const s of kategoriSluglari) ekle(`/category/${s}`)
    // İki seviyeli eski adres: her dal, üstünün her iki biçimiyle.
    for (const k of harita.kategoriler) {
      if (k.ust === null) continue
      const ust = harita.kategoriler[k.ust]
      for (const us of new Set([ust.tr, ust.en])) {
        for (const ds of new Set([k.tr, k.en])) ekle(`/category/${us}/${ds}`)
      }
    }
    for (const s of Object.keys(harita.aileSluglari)) ekle(`/products/${s}`)
    for (const s of Object.keys(harita.urunSluglari)) ekle(`/products/${s}`)
    for (const [sku, m] of Object.entries(harita.modeller)) {
      const aile = harita.aileler[m.aile]
      ekle(`/products/${aile}`, sku)
      if (dil !== 'en') ekle(`/urun/${aile}`, sku)
    }
    for (const eskiSku of Object.keys(harita.eskiSkular)) {
      const m = harita.modeller[harita.eskiSkular[eskiSku]]
      if (m) ekle(`/products/${harita.aileler[m.aile]}`, eskiSku)
    }
  }
  return adaylar
}

/**
 * Envanteri üretir. İhlaller (INV-ADRES-HARITA-1): hedefte query · hedef yine eşleşiyor (ikinci hop /
 * döngü) · dilli kaynakta 308 dışı durum.
 */
export function envanterUret(harita: KiraciHaritasi, dilsizDil: AdresDili = 'tr'): Envanter {
  const satirlar: EnvanterSatiri[] = []
  const ihlaller: EnvanterIhlali[] = []
  const gorulen = new Set<string>()
  const dilTespit = () => dilsizDil
  for (const { yol, dilli, sku } of adayAdresler(harita)) {
    const anahtar = `${yol}?${sku ?? ''}`
    if (gorulen.has(anahtar)) continue
    gorulen.add(anahtar)
    const sonuc = eskiAdresEsle(harita, { yol, sku, dilTespit })
    if (!sonuc) continue
    satirlar.push({ eski: yol, sku, yeni: sonuc.hedef, durum: sonuc.durum })
    if (sonuc.hedef.includes('?')) ihlaller.push({ eski: yol, sku, sebep: `hedefte query: ${sonuc.hedef}` })
    const ikinci = eskiAdresEsle(harita, { yol: sonuc.hedef, sku: null, dilTespit })
    if (ikinci) ihlaller.push({ eski: yol, sku, sebep: `ikinci hop: ${sonuc.hedef} → ${ikinci.hedef}` })
    if (dilli && sonuc.durum !== 308) ihlaller.push({ eski: yol, sku, sebep: `dilli kaynakta ${sonuc.durum}` })
  }
  return { satirlar, ihlaller }
}
