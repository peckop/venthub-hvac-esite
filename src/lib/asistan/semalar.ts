/**
 * ÜRÜN ASİSTANI — MODEL ÇIKTISININ ŞEMA DOĞRULAMASI (URN-171, adım 1).
 *
 * Cetvel: docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md §3 (YOL A) ve §4 madde 6, 9.
 *
 * Model iki yapılandırılmış çıktı üretir ve ikisi de BURADA doğrulanmadan hiçbir yere gitmez:
 *  (a) NİYET: `sinif` (süz | hesap | konu_disi | kotu_niyet) + izinli eksenlerde `suzgec`;
 *  (b) KARŞILAŞTIRMA: yalnız `{urunId, alan}` başvuruları + sabit gerekçe kodları.
 * Modelin serbest metin, sayı ya da bağlantı yazacağı bir alan YOKTUR; bilinmeyen alan reddedilir (`.strict()`).
 *
 * Hata yolu: fırlatma yok. Bozuk model çıktısı tipli sonuçtur (`{ ok: false, hata }`); çağıran "Her biri ayrı
 * mesaj" kuralı için hata koduna bakar (bkz. `hataYollari.ts`). `yol` alanı yalnız şema yolunu taşır, modelin
 * yazdığı değeri DEĞİL (günlüğe güvenle yazılır; uzunluğu sınırlıdır).
 */
import { z } from 'zod'

import { IZINLI_SPEC_ANAHTARLARI } from './izinListesi'

/** Niyet sınıfları. Sunucu şemadan geçmeyen sınıfı ASLA işlemez. */
export const NIYET_SINIFLARI = ['suz', 'hesap', 'konu_disi', 'kotu_niyet'] as const
export type NiyetSinifi = (typeof NIYET_SINIFLARI)[number]

/** Karşılaştırmada modelin seçebileceği gerekçe kodları: sabit küme, serbest metin değil. */
export const GEREKCE_KODLARI = [
  'EN_YUKSEK_DEBI',
  'EN_DUSUK_SES',
  'EN_YUKSEK_BASINC',
  'EN_KUCUK_CAP',
  'IP_KORUMA',
  'ATEX_BOLGESI',
] as const
export type GerekceKodu = (typeof GEREKCE_KODLARI)[number]

/** Bir karşılaştırmada en çok kaç `{urunId, alan}` başvurusu (hem şema hem şablon bu sabiti kullanır). */
export const MAKS_BASVURU = 10
/** Model çıktısının en uzun kabul edilen JSON metni (karakter). Daha uzunu şema denemeden reddedilir. */
export const MAKS_JSON_UZUNLUGU = 4096

/** IP sınıfı yazımı: IP55, IPX4, IP67... (ilk rakam 0-6 ya da X, ikinci rakam 0-9 ya da X). */
const IP_DESENI = /^IP[0-6X][0-9X]$/

const pozitif = (maks: number) => z.number().positive().max(maks)

/**
 * Süzgeç: yalnız izinli eksenler, hepsi isteğe bağlı, sayılar pozitif ve fiziksel olarak makul üst sınırlı.
 * Eksen karşılıkları: debiMinM3h = `max_delivery_m3h` (serbest üfleme debisi), capMinMm/capMaksMm = `diameter_mm`,
 * statikBasincMinPa = `max_static_pressure_pa`, sesMaksDb3m = `noise_lpa_3m_db` (3 m; `noise_level_db_a`'da süzgeç
 * YOKTUR: mesafesiz değer karşılaştırılamaz), ipMin = `ip_rating`, atexGerekli = `atex_zone` dolu mu.
 */
export const SuzgecSema = z
  .object({
    debiMinM3h: pozitif(1_000_000).optional(),
    capMinMm: pozitif(10_000).optional(),
    capMaksMm: pozitif(10_000).optional(),
    statikBasincMinPa: pozitif(100_000).optional(),
    sesMaksDb3m: pozitif(200).optional(),
    ipMin: z.string().regex(IP_DESENI).optional(),
    atexGerekli: z.boolean().optional(),
  })
  .strict()
  .refine((s) => s.capMinMm === undefined || s.capMaksMm === undefined || s.capMinMm <= s.capMaksMm, {
    message: 'capMinMm capMaksMm degerini asamaz',
    path: ['capMinMm'],
  })

export type Suzgec = z.infer<typeof SuzgecSema>

/** Niyet: `suz` sınıfı süzgeç taşır (boş süzgeç GEÇERLİDİR, "çok geniş" yolu karşılar); diğerleri hiçbir ek alan taşımaz. */
export const NiyetSema = z.discriminatedUnion('sinif', [
  z.object({ sinif: z.literal('suz'), suzgec: SuzgecSema }).strict(),
  z.object({ sinif: z.literal('hesap') }).strict(),
  z.object({ sinif: z.literal('konu_disi') }).strict(),
  z.object({ sinif: z.literal('kotu_niyet') }).strict(),
])
export type Niyet = z.infer<typeof NiyetSema>

export const BasvuruSema = z
  .object({
    urunId: z.guid(),
    alan: z.enum(IZINLI_SPEC_ANAHTARLARI),
  })
  .strict()
export type Basvuru = z.infer<typeof BasvuruSema>

/** Karşılaştırma: sayı, birim ve bağlantı YOKTUR; model yalnız hangi ürünün hangi alanına başvurduğunu söyler. */
export const KarsilastirmaSema = z
  .object({
    basvurular: z.array(BasvuruSema).min(1).max(MAKS_BASVURU),
    gerekceKodlari: z.array(z.enum(GEREKCE_KODLARI)).max(GEREKCE_KODLARI.length),
  })
  .strict()
export type Karsilastirma = z.infer<typeof KarsilastirmaSema>

export type SemaHatasi =
  | 'BOS_CIKTI' // metin değil ya da boş
  | 'COK_UZUN' // MAKS_JSON_UZUNLUGU aşıldı
  | 'GECERSIZ_JSON' // JSON olarak ayrıştırılamadı
  | 'BILINMEYEN_SINIF' // `sinif` var ama dört sınıftan biri değil
  | 'SEMA_DISI' // bilinmeyen alan, eksik alan, yanlış tip ya da sınır dışı sayı

export type SemaSonucu<T> = { ok: true; veri: T } | { ok: false; hata: SemaHatasi; yol: string }

/** Şema yolunu günlüğe güvenli yazıma çevirir (modelin yazdığı anahtar adı olabilir: harf/rakam/nokta dışı atılır, kısaltılır). */
function yolMetni(yol: ReadonlyArray<PropertyKey>): string {
  return yol
    .map((p) => String(p))
    .join('.')
    .replace(/[^A-Za-z0-9_.]/g, '_')
    .slice(0, 80)
}

function jsonCoz(ham: unknown): SemaSonucu<unknown> {
  if (typeof ham !== 'string' || ham.trim() === '') return { ok: false, hata: 'BOS_CIKTI', yol: '' }
  if (ham.length > MAKS_JSON_UZUNLUGU) return { ok: false, hata: 'COK_UZUN', yol: '' }
  try {
    // Kod çiti (```json) AYIKLANMAZ: sözleşme "çıktı yalnız JSON"dur; çit sızıntısı bozuk çıktıdır.
    return { ok: true, veri: JSON.parse(ham) as unknown }
  } catch {
    return { ok: false, hata: 'GECERSIZ_JSON', yol: '' }
  }
}

function dogrula<T>(sema: z.ZodType<T>, veri: unknown): SemaSonucu<T> {
  const sonuc = sema.safeParse(veri)
  if (sonuc.success) return { ok: true, veri: sonuc.data }
  const ilk = sonuc.error.issues[0]
  return { ok: false, hata: 'SEMA_DISI', yol: ilk ? yolMetni(ilk.path) : '' }
}

/** Zaten ayrıştırılmış değer için niyet doğrulaması. */
export function niyetDogrula(veri: unknown): SemaSonucu<Niyet> {
  if (typeof veri === 'object' && veri !== null && !Array.isArray(veri)) {
    const sinif = (veri as Record<string, unknown>)['sinif']
    if (typeof sinif === 'string' && !(NIYET_SINIFLARI as readonly string[]).includes(sinif)) {
      return { ok: false, hata: 'BILINMEYEN_SINIF', yol: 'sinif' }
    }
  }
  return dogrula(NiyetSema, veri)
}

/** Modelin ham metin çıktısından niyet: geçersiz JSON, şema dışı alan ya da bilinmeyen sınıf TİPLİ hatadır. */
export function niyetCoz(ham: unknown): SemaSonucu<Niyet> {
  const json = jsonCoz(ham)
  return json.ok ? niyetDogrula(json.veri) : json
}

/** Zaten ayrıştırılmış değer için karşılaştırma doğrulaması. */
export function karsilastirmaDogrula(veri: unknown): SemaSonucu<Karsilastirma> {
  return dogrula(KarsilastirmaSema, veri)
}

/** Modelin ham metin çıktısından karşılaştırma. */
export function karsilastirmaCoz(ham: unknown): SemaSonucu<Karsilastirma> {
  const json = jsonCoz(ham)
  return json.ok ? karsilastirmaDogrula(json.veri) : json
}
