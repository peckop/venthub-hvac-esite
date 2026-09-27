/**
 * ESKİ ADRES HARİTASI — veri tipi (REC-300 Faz 3 madde 4; plan §4 katman 1, §4.1, §6).
 *
 * NİÇİN YAPISAL, KARTEZYEN DEĞİL (plan §4 "Harita boyutu", v4 çürütmesi O5): harita Edge
 * middleware paketine girer ve Vercel Hobby'de gzip sonrası 1 MB sınırına sayılır. Her eski
 * adresi tam metniyle yazmak (442 model × 2 dil × önek biçimleri…) boyutu katlar ve aynı bilgiyi
 * tekrar eder. Harita yalnız KİMLİK ilişkisini tutar (`sku → aile`, `eski slug → hedef`);
 * önek, dil ve şema `eslestirici.ts` içinde `adresUret(…, dil, true)` ile birleşir — yeni şemanın
 * tek kaynağı yine `src/utils/adresUret.ts` kalır.
 *
 * KİRACI (kural 12): dosya kiracı anahtarlıdır; middleware `resolveTenant(host)` sonucuyla kendi
 * kiracısının gövdesini seçer. Başka kiracının haritası hiçbir istekte okunmaz. Çok kiracı açılınca
 * tek paket yeniden tasarlanır (plan §4, cetvele not).
 */

/** Model kaydı: aile indeksi + modelin kendi adres metni (Faz 2 `slug_i18n`; yoksa null). */
export interface ModelKaydi {
  aile: number
  slug: { tr: string | null; en: string | null }
}

/** Kategori kaydı: dile göre görünen slug, üst kategori indeksi, aktiflik. */
export interface KategoriKaydi {
  tr: string
  en: string
  /** Üst kategorinin `kategoriler` içindeki indeksi; kökte null. */
  ust: number | null
  aktif: boolean
}

/** Bir kategori slug'ının gösterdiği yer: bir kategori ya da (karşılığı olmayan eski kök) tüm ürünler. */
export type KategoriHedefi = { kategori: number } | { urunler: true }

/**
 * Slug'ın hangi dile ait olduğu. Dilsiz eski adreste karar buna bağlı (plan §4.1 Y3):
 * `tr` → içerik zaten Türkçe, deterministik TR'ye 308; `en`/`ortak` → ziyaretçinin diline 307.
 */
export type SlugBicimi = 'tr' | 'en' | 'ortak'

export interface KategoriSlugKaydi {
  hedef: KategoriHedefi
  bicim: SlugBicimi
}

/** Tek kiracının haritası. */
export interface KiraciHaritasi {
  /** Aktif ürün sayısı — bir sonraki üretimin fail-closed eşiği bununla ölçülür (plan §4.1 Y2). */
  urunSayisi: number
  /** Aile slug'ları (bugünkü); indeks = haritadaki aile kimliği. */
  aileler: string[]
  /** SKU (DB biçimi, büyük harf) → model. */
  modeller: Record<string, ModelKaydi>
  /** Eski SKU (büyük harf, `url_takma_adlari` tur=sku) → bugünkü SKU. */
  eskiSkular: Record<string, string>
  /** Ürün slug'ı (bugünkü `products.slug` + eski ürün slug'ları) → SKU. */
  urunSluglari: Record<string, string>
  /** Aile slug'ı (bugünkü + eski: takma ad, tohum) → aile indeksi. */
  aileSluglari: Record<string, number>
  kategoriler: KategoriKaydi[]
  /** Kategori slug'ı (bugünkü TR ve EN biçimi + takma ad + tohum) → hedef. */
  kategoriSluglari: Record<string, KategoriSlugKaydi>
}

export interface EskiAdresHaritaDosyasi {
  surum: 1
  /** ISO damga; fikstürde sabit. */
  uretildi: string
  /** Kiracı kimliği (uuid) → o kiracının haritası. */
  kiracilar: Record<string, KiraciHaritasi>
}

/**
 * Fail-closed eşiği (plan §4.1 Y2): yeni üretimdeki ürün sayısı bir öncekinin bu oranının altındaysa
 * üretim DÜŞER. Katalogdan bir günde %10'dan fazla ürün kalkması olağan bir olay değil; olağan olan,
 * yarım okunmuş bir tablo (sayfalama, RLS, yanlış anahtar) — onunla yayın yapılmaz.
 */
export const HARITA_URUN_ESIGI = 0.9

/** Vercel Edge middleware kod sınırı, gzip sonrası, Hobby (plan §4; Pro 2 MB). */
export const EDGE_GZIP_SINIRI_BAYT = 1024 * 1024
