/**
 * YAYINDAKİ MODELLER — "hangi model kendi sayfasına (model adresi) sahip" kararının TEK kaynağı
 * (URN-31, karar 259 kısa pilot mekanizması; plan `rec-adres-agac-tek-yayin-2026-09-07.md` §2).
 *
 * NİÇİN: adres şeması (`ADRES_SEMASI_K3B`) açılınca 442 modelin hepsi sayfa almaz; pilot yalnız seçilmiş
 * modelleri açar. Liste dışı SKU'nun model adresi YOKTUR: aile sayfasında `?sku=` seçimi olarak yaşar,
 * model adresi 404'tür, eski `?sku=` adresi aile sayfasına 308 verir. Karar bu modülde verilir; yüzeyler
 * (adres üretimi, rota, site haritası, JSON-LD, eşleyici, canonical) yalnız buraya sorar.
 *
 * VERİ: `yayindaModeller.veri.json` (derleme sabiti; DB/Edge Config/ortam değişkeni DEĞİL — Edge'de DB sorgusu
 * yasak, kural 12; değişim = yeni derleme, yani kod incelemesi). Mekanizma PR'ında BOŞTUR; liste açma PR'ında
 * dolar. Şekli:
 *   modeller: { "<aile slug'ı>": { "<SKU>": { tr: "<model slug_tr>", en: "<model slug_en>" } } }  (aile = CANLIDAKİ aile slug'ı)
 *   surumler: { "<SÜRÜM SKU>": { temel: "<TEMEL SKU>", tr, en } }   (URN-27 asgarisi: bkz. aşağıda)
 * Adres metinleri (slug_tr/slug_en) Faz 2 CSV'sinden gelir, elle yazılmaz; üretim betiği:
 * `scripts/seo/yayinda-model-veri-uret.mjs`, CSV ile birebirlik kapısı: INV-YAYINDA-MODEL-9.
 *
 * SÜRÜM (URN-27 asgarisi): "T" ekli gibi sürüm SKU'su KENDİ adresini alır (200), ama sayfanın canonical'ı
 * TEMEL modelin adresidir ve site haritasında YOKTUR. `kanonikModelSku` bunu söyler.
 *
 * FAIL-CLOSED: liste boşsa HİÇBİR model sayfası yoktur. Slug metni eksik kayıt, hedefi listede olmayan sürüm
 * ya da sürüm zinciri adres ALMAZ (aile slug'ına düşülmez: "slug yok" = kayıt geçersiz). Bozuk liste
 * `yayindaListesiDogrula` ile kapıda (INV-YAYINDA-MODEL-1) yakalanır; çalışma anında sessizce daraltılır.
 * SKU kimliği büyük harf, kenar boşluksuz (DB biçimi); girdi küçük harf/boşluklu gelirse normalleştirilir.
 *
 * Bu dosya ADRES BİÇİMİNİ bilmez (ayırıcı `utils/modelAdresBicimi.ts`); yalnız doğrulamada gidiş-dönüşü ölçer.
 */
import { skuAdreseUygunMu, slugMetniUygunMu } from '../utils/modelAdresBicimi'
import veri from './yayindaModeller.veri.json'

type Dil = 'tr' | 'en'

export interface ModelSlugu {
  tr: string
  en: string
}

export interface YayindaVeri {
  modeller: Readonly<Record<string, Readonly<Record<string, ModelSlugu>>>>
  surumler: Readonly<Record<string, ModelSlugu & { temel: string }>>
}

export interface YayindaKaydi {
  sku: string
  aileSlug: string
  /** Sürümse temel modelin SKU'su; temel modelde null. */
  temel: string | null
  slug: ModelSlugu
}

export interface YayindaListesi {
  /** Bu SKU'nun model adresi (200) var mı? (liste içi model ya da sürüm) */
  modelAdresiVarMi(sku: unknown): boolean
  /** Site haritasına girer mi? (yalnız liste içi TEMEL model; sürüm girmez) */
  sitemapModelMi(sku: unknown): boolean
  /** Sayfanın canonical'ının gösterdiği model SKU'su: model → kendisi, sürüm → temeli, liste dışı → null. */
  kanonikModelSku(sku: unknown): string | null
  /** Model adresinin slug metni (dilde); liste dışı → null. */
  modelSlugu(sku: unknown, dil: Dil): string | null
  /** Tüm kayıtlar: önce temel modeller (aile/SKU sırasında), sonra sürümler. */
  kayitlar(): readonly YayindaKaydi[]
}

/** SKU kimliği: kenar boşluğu atılır, büyük harf; SKU olmayan girdi → ''. */
const kimlik = (sku: unknown): string => (typeof sku === 'string' ? sku.trim().toUpperCase() : '')

const metinVar = (s: unknown): s is string => typeof s === 'string' && s !== ''
const slugVar = (s: unknown): s is ModelSlugu =>
  typeof s === 'object' && s !== null && metinVar(Reflect.get(s, 'tr')) && metinVar(Reflect.get(s, 'en'))

export function yayindaListesiKur(v: YayindaVeri): YayindaListesi {
  const kayit = new Map<string, YayindaKaydi>()
  for (const [aileSlug, grup] of Object.entries(v.modeller)) {
    for (const [ham, slug] of Object.entries(grup)) {
      const sku = kimlik(ham)
      if (!sku || kayit.has(sku) || !slugVar(slug)) continue
      kayit.set(sku, { sku, aileSlug, temel: null, slug: { tr: slug.tr, en: slug.en } })
    }
  }
  for (const [ham, s] of Object.entries(v.surumler)) {
    const sku = kimlik(ham)
    const temel = kayit.get(kimlik(s.temel))
    // Hedefi listede olmayan ya da kendisi sürüm olan temel (zincir) → adres YOK.
    if (!sku || kayit.has(sku) || !slugVar(s) || !temel || temel.temel !== null) continue
    kayit.set(sku, { sku, aileSlug: temel.aileSlug, temel: temel.sku, slug: { tr: s.tr, en: s.en } })
  }
  const tumu = [...kayit.values()]
  return {
    modelAdresiVarMi: (sku) => kayit.has(kimlik(sku)),
    sitemapModelMi: (sku) => kayit.get(kimlik(sku))?.temel === null,
    kanonikModelSku: (sku) => {
      const k = kayit.get(kimlik(sku))
      return k ? (k.temel ?? k.sku) : null
    },
    modelSlugu: (sku, dil) => kayit.get(kimlik(sku))?.slug[dil] ?? null,
    kayitlar: () => tumu,
  }
}

const SKU_DESENI = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/
const KUCUK_SLUG_DESENI = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** Model adres metni üst sınırı (Faz 2 CSV'si: slug_tr/slug_en ≤ 70). */
export const SLUG_AZAMI_UZUNLUK = 70

const nesneMi = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x)
const siraliMi = (anahtarlar: string[]) => anahtarlar.every((a, i) => i === 0 || anahtarlar[i - 1] < a)

/**
 * Liste verisini doğrular; hata metinleri döner (boş = geçerli). Kontroller: üst yapı · aile slug'ı biçimi ve sırası ·
 * SKU biçimi (büyük harf, boşluksuz, adres ayırıcısıyla çakışmaz: gidiş-dönüş ölçülür) · SKU tekilliği ve sırası ·
 * her kaydın slug_tr/slug_en'i (küçük harf ASCII, ≤70, ayırıcı içermez, dil içinde TEKİL) · sürüm hedefi
 * (temel listede, sürüm temel değil, zincir yok, kendisi değil).
 */
export function yayindaListesiDogrula(girdi: unknown): string[] {
  const hata: string[] = []
  if (!nesneMi(girdi)) return ['liste nesne değil']
  for (const anahtar of Object.keys(girdi)) {
    if (anahtar !== 'modeller' && anahtar !== 'surumler') hata.push(`bilinmeyen üst anahtar: ${anahtar}`)
  }
  const { modeller, surumler } = girdi
  if (!nesneMi(modeller)) hata.push('modeller nesne değil')
  if (!nesneMi(surumler)) hata.push('surumler nesne değil')
  if (!nesneMi(modeller) || !nesneMi(surumler)) return hata

  const gorulenSlug: Record<Dil, Map<string, string>> = { tr: new Map(), en: new Map() }
  const skuBicimi = (sku: string, etiket: string): boolean => {
    if (!SKU_DESENI.test(sku)) {
      hata.push(`${etiket}: SKU biçimi geçersiz "${sku}" (büyük harf, boşluksuz, ^[A-Z0-9]+(-[A-Z0-9]+)*$)`)
      return false
    }
    if (!skuAdreseUygunMu(sku)) {
      hata.push(`${etiket}: SKU "${sku}" model adresi ayırıcısıyla çakışıyor (gidiş-dönüş bozuk)`)
      return false
    }
    return true
  }
  const slugKontrol = (sku: string, kayit: unknown) => {
    if (!nesneMi(kayit)) {
      hata.push(`${sku}: kayıt nesne değil`)
      return
    }
    for (const dil of ['tr', 'en'] as const) {
      const slug = kayit[dil]
      if (!metinVar(slug)) {
        hata.push(`${sku}: slug_${dil} yok ya da boş (aile slug'ına düşülmez; kayıt geçersiz)`)
        continue
      }
      if (!KUCUK_SLUG_DESENI.test(slug)) hata.push(`${sku}: slug_${dil} biçimi geçersiz "${slug}" (küçük harf ASCII, rakam, tek tire)`)
      if (slug.length > SLUG_AZAMI_UZUNLUK) hata.push(`${sku}: slug_${dil} ${slug.length} karakter (azami ${SLUG_AZAMI_UZUNLUK})`)
      if (!slugMetniUygunMu(slug)) hata.push(`${sku}: slug_${dil} "${slug}" model adresi ayırıcısı içeriyor (D1: slug metninde geçemez)`)
      const onceki = gorulenSlug[dil].get(slug)
      if (onceki !== undefined) hata.push(`${sku}: slug_${dil} "${slug}" ${onceki} ile AYNI (dil içinde tekil olmalı)`)
      else gorulenSlug[dil].set(slug, sku)
    }
  }

  const aileler = Object.keys(modeller)
  if (!siraliMi(aileler)) hata.push('aile slug\'ları sıralı değil (kod sırası)')
  const modelSkulari = new Set<string>()
  for (const aile of aileler) {
    if (!KUCUK_SLUG_DESENI.test(aile)) hata.push(`aile slug'ı geçersiz "${aile}"`)
    const grup = modeller[aile]
    if (!nesneMi(grup)) {
      hata.push(`${aile}: grup nesne değil`)
      continue
    }
    const skular = Object.keys(grup)
    if (skular.length === 0) hata.push(`${aile}: grup boş`)
    if (!siraliMi(skular)) hata.push(`${aile}: SKU'lar sıralı değil (kod sırası)`)
    for (const sku of skular) {
      if (!skuBicimi(sku, aile)) continue
      if (modelSkulari.has(sku)) hata.push(`${aile}: SKU ${sku} birden çok yerde (tekil olmalı)`)
      modelSkulari.add(sku)
      slugKontrol(sku, grup[sku])
    }
  }

  const surumSkulari = Object.keys(surumler)
  if (!siraliMi(surumSkulari)) hata.push('sürüm SKU\'ları sıralı değil (kod sırası)')
  for (const sku of surumSkulari) {
    if (!skuBicimi(sku, 'sürüm')) continue
    if (modelSkulari.has(sku)) hata.push(`sürüm ${sku} aynı zamanda liste modeli (tekil olmalı)`)
    const kayit = surumler[sku]
    if (!nesneMi(kayit)) {
      hata.push(`sürüm ${sku}: kayıt nesne değil`)
      continue
    }
    const temel = kayit.temel
    if (typeof temel !== 'string' || !modelSkulari.has(temel)) hata.push(`sürüm ${sku}: temel "${String(temel)}" listedeki modeller arasında yok (zincir/hedefsiz sürüm yok)`)
    if (temel === sku) hata.push(`sürüm ${sku}: kendi temeli`)
    slugKontrol(sku, kayit)
  }
  return hata
}

/** Derleme sabiti: yalnız bu modül okur (kapı: INV-YAYINDA-MODEL-6b). */
const YAYINDA_LISTE: YayindaListesi = yayindaListesiKur(veri as YayindaVeri)

export const modelAdresiVarMi = (sku: unknown): boolean => YAYINDA_LISTE.modelAdresiVarMi(sku)
export const sitemapModelMi = (sku: unknown): boolean => YAYINDA_LISTE.sitemapModelMi(sku)
export const kanonikModelSku = (sku: unknown): string | null => YAYINDA_LISTE.kanonikModelSku(sku)
export const modelSlugu = (sku: unknown, dil: Dil): string | null => YAYINDA_LISTE.modelSlugu(sku, dil)
export const yayindaModelKayitlari = (): readonly YayindaKaydi[] => YAYINDA_LISTE.kayitlar()
