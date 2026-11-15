/**
 * ÜRÜN ASİSTANI — MODELE GİDECEK SATIRIN İZİN LİSTESİYLE KURULMASI (URN-171, adım 1).
 *
 * Cetvel: docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md §4 madde 2-3
 * (docs/standards/urun-asistani-standard.md olarak yazılana dek bu not geçerli).
 *
 * NİÇİN KARA LİSTE DEĞİL İZİN LİSTESİ: anon rolü bugün `price` ve `stock_qty` okuyabiliyor; "şunları çıkar"
 * diyen bir kapı, tabloya yarın eklenen her sütunu sessizce modele taşır. Burada tersi geçerlidir: yalnız
 * aşağıda ADIYLA sayılan alanlar çıkar, bilinmeyen her şey düşer. `sku`, `model_code`, barkod, `price`,
 * `purchase_price`, `stock_qty` ve `description_i18n` (enjeksiyon yüzeyi; niyet çözmek için gerekmez) hiçbir
 * koşulda satıra girmez. Ürünün GÖRÜNEN ADI model koduyla birlikte gidebilir ("ADH-225 E2": Recep, 15 Kasım);
 * adın içindeki kod ad olarak gider, `sku` / `model_code` ALANLARI gitmez.
 *
 * Eksen eşlemesinin TEK kaynağı `wizard.service.ts` içindeki `SPEC_ANAHTARLARI`dır (debi, çap, ses): burada
 * yeniden yazılmaz, oradan okunur. Sihirbazın bilerek DIŞARIDA bıraktığı `noise_lpa_3m_db` (3 m'de ölçülmüş
 * ses basıncı, `noise_level_db_a` ile AYNI eksen değildir) bu listeye ayrı ve adıyla eklenir; şablon basıcı
 * onu yalnız "3 m" koşuluyla yazar, iki anahtarı hiçbir yerde birleştirmez (docs/standards/spec-axis-standard.md K2).
 *
 * Saf modül: ağ, veritabanı, ortam değişkeni, saat yok.
 */
import { SPEC_ANAHTARLARI } from '@/lib/services/wizard.service'

/** Değeri SAYI olan izinli `technical_specs` anahtarları (sıra = satırda basılma sırası). */
export const SAYISAL_SPEC_ANAHTARLARI = [
  ...SPEC_ANAHTARLARI.debiM3h, // max_delivery_m3h (serbest üfleme) + nominal_delivery_m3h (başka çalışma noktası)
  ...SPEC_ANAHTARLARI.capMm, // diameter_mm
  'max_static_pressure_pa',
  ...SPEC_ANAHTARLARI.sesDbA, // noise_level_db_a (ölçüm mesafesi YOK)
  'noise_lpa_3m_db', // 3 m'de ölçülmüş ses basıncı
] as const

/** Değeri METİN olan izinli `technical_specs` anahtarları. */
export const METIN_SPEC_ANAHTARLARI = ['ip_rating', 'atex_zone'] as const

export const IZINLI_SPEC_ANAHTARLARI = [...SAYISAL_SPEC_ANAHTARLARI, ...METIN_SPEC_ANAHTARLARI] as const

export type SayisalSpecAnahtari = (typeof SAYISAL_SPEC_ANAHTARLARI)[number]
export type MetinSpecAnahtari = (typeof METIN_SPEC_ANAHTARLARI)[number]
export type IzinliSpecAnahtari = (typeof IZINLI_SPEC_ANAHTARLARI)[number]

/** Modele HİÇBİR koşulda gitmeyen alan adları (kapı: `asistan-cekirdek.test.ts` INV-ASISTAN-1). */
export const MODELE_GITMEYEN_ALANLAR = [
  'sku',
  'model_code',
  'barcode',
  'price',
  'purchase_price',
  'stock_qty',
  'description_i18n',
] as const

export type OzelliklerDeger = { -readonly [K in SayisalSpecAnahtari]?: number } & {
  -readonly [K in MetinSpecAnahtari]?: string
}

/**
 * Modele giden (ve şablon basıcının okuduğu) ürün satırı. TAM bu alanlar vardır, başkası yoktur.
 *
 * `marka`: izin listesine eklenen TEK alan ve nedeni şudur: "farklı üreticilerin ses değeri aynı sıralamada
 * karşılaştırılmaz" kuralı (plan §2) markayı bilmeden uygulanamaz. Marka adı herkese açık bilgidir.
 * `slug`: ürün sayfası slug'ı; bağlantıyı şablon basıcı `adresUret` ile bundan kurar, model yazmaz.
 */
export type AsistanSatiri = Readonly<{
  id: string
  ad: string
  slug: string
  marka: string | null
  ozellikler: Readonly<OzelliklerDeger>
}>

/** Veritabanından / RPC'den gelen ham satır: tipsizdir, çünkü içinde ne olacağı bu modülün bildiği şey DEĞİLDİR. */
export type HamUrunSatiri = Readonly<Record<string, unknown>>

const GUID_DESENI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SLUG_DESENI = /^[A-Za-z0-9._~-]+$/
const MAKS_AD = 200
const MAKS_SLUG = 200
const MAKS_MARKA = 80
const MAKS_METIN_DEGERI = 80

function duzNesneMi(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Yalnız KENDİ alanını okur (prototip zincirinden `constructor` vb. okunmaz). */
function oku(nesne: Record<string, unknown>, anahtar: string): unknown {
  return Object.prototype.hasOwnProperty.call(nesne, anahtar) ? nesne[anahtar] : undefined
}

/** Denetim ve yönlendirme karakterleri: modele ve ekrana gitmez (kod noktasıyla süzülür, düzenli ifadeyle değil). */
function gizliKarakterMi(kod: number): boolean {
  return (
    kod < 32 ||
    (kod >= 127 && kod <= 159) ||
    (kod >= 0x200b && kod <= 0x200f) ||
    (kod >= 0x2028 && kod <= 0x202e) ||
    (kod >= 0x2066 && kod <= 0x2069) ||
    kod === 0xfeff
  )
}

/** Metni temizler; boşsa ya da `maks` karakteri aşıyorsa null döner (KIRPILMAZ: yarım ATEX/IP değeri yanıltır). */
export function metinTemizle(v: unknown, maks: number): string | null {
  if (typeof v !== 'string') return null
  let cikti = ''
  for (const harf of v) {
    const kod = harf.codePointAt(0) ?? 0
    cikti += gizliKarakterMi(kod) ? ' ' : harf
  }
  const temiz = cikti.replace(/\s+/g, ' ').trim()
  return temiz.length >= 1 && temiz.length <= maks ? temiz : null
}

/**
 * Teknik veri değerini SAYIYA çevirir; çevrilemezse null (satırda "veri yok" olur).
 * Sayı tipi geçer; metin yalnız belirsizliği olmayan yazımda geçer ("2,2", "1.5", "125"). "2.000" gibi
 * binlik mi ondalık mı olduğu anlaşılamayan metin REDDEDİLİR: 2.000'i 2 okumak sessiz bir veri bozulmasıdır.
 * Fiziksel büyüklüklerin hepsi pozitiftir; sıfır ve negatif "veri yok" sayılır.
 */
export function sayiyaCevir(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : null
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(s)) return null
  const n = Number(s.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

/**
 * Tek ham satırdan izin listeli satırı kurur. Kimliği, adı ya da slug'ı geçersiz satır null döner:
 * kimliksiz satır başvuru ile eşleşemez, slug'sız satırın bağlantısı kurulamaz.
 * Okunan ham alanlar: `id`, `name`, `slug`, `marka` (görünen marka adı), `technical_specs`. Gerisi OKUNMAZ.
 */
export function izinliSatirKur(ham: unknown): AsistanSatiri | null {
  if (!duzNesneMi(ham)) return null
  const id = metinTemizle(oku(ham, 'id'), 64)
  const ad = metinTemizle(oku(ham, 'name'), MAKS_AD)
  const slug = metinTemizle(oku(ham, 'slug'), MAKS_SLUG)
  if (id === null || !GUID_DESENI.test(id)) return null
  if (ad === null) return null
  if (slug === null || !SLUG_DESENI.test(slug)) return null

  const marka = metinTemizle(oku(ham, 'marka'), MAKS_MARKA)
  const specs = oku(ham, 'technical_specs')
  const ozellikler: OzelliklerDeger = {}
  if (duzNesneMi(specs)) {
    for (const anahtar of SAYISAL_SPEC_ANAHTARLARI) {
      const n = sayiyaCevir(oku(specs, anahtar))
      if (n !== null) ozellikler[anahtar] = n
    }
    for (const anahtar of METIN_SPEC_ANAHTARLARI) {
      const m = metinTemizle(oku(specs, anahtar), MAKS_METIN_DEGERI)
      if (m !== null) ozellikler[anahtar] = m
    }
  }
  return { id, ad, slug, marka, ozellikler }
}

/**
 * Ham satır listesinden izin listeli satırları kurur: geçersiz satır ve yinelenen kimlik atılır, kaç satırın
 * atıldığı `atilan`da döner (sessiz dışlama olmasın: çağıran günlüğe yazar).
 */
export function izinliSatirlariKur(hamlar: readonly unknown[]): { satirlar: AsistanSatiri[]; atilan: number } {
  const gorulen = new Set<string>()
  const satirlar: AsistanSatiri[] = []
  let atilan = 0
  for (const ham of hamlar) {
    const satir = izinliSatirKur(ham)
    if (satir === null || gorulen.has(satir.id)) {
      atilan++
      continue
    }
    gorulen.add(satir.id)
    satirlar.push(satir)
  }
  return { satirlar, atilan }
}

/** `purchase_price`, `purchasePrice`, `PURCHASE-PRICE` aynı alandır. */
function alanAdiniEsitle(ad: string): string {
  return ad.toLowerCase().replace(/[^a-z0-9]/g, '')
}

const YASAK_ESITLENMIS = new Set<string>(MODELE_GITMEYEN_ALANLAR.map(alanAdiniEsitle))
const MAKS_TARAMA_DERINLIGI = 8

/**
 * Bir veri ağacında (modele gidecek yükte) yasak alan adı arar; bulunan YOLLARI döndürür, boş = temiz.
 * Son kapıdır: `izinliSatirKur` zaten süzer, bu işlev "birisi yarın satıra yeni bir alan eklerse" durumunu yakalar.
 */
export function yasakAlanBul(veri: unknown, yol = '', derinlik = 0): string[] {
  if (derinlik > MAKS_TARAMA_DERINLIGI || typeof veri !== 'object' || veri === null) return []
  const bulunan: string[] = []
  if (Array.isArray(veri)) {
    veri.forEach((oge, i) => bulunan.push(...yasakAlanBul(oge, `${yol}[${i}]`, derinlik + 1)))
    return bulunan
  }
  for (const [anahtar, deger] of Object.entries(veri as Record<string, unknown>)) {
    const yeniYol = yol ? `${yol}.${anahtar}` : anahtar
    if (YASAK_ESITLENMIS.has(alanAdiniEsitle(anahtar))) bulunan.push(yeniYol)
    bulunan.push(...yasakAlanBul(deger, yeniYol, derinlik + 1))
  }
  return bulunan
}
