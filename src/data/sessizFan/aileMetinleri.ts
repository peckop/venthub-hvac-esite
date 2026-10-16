// Lineo Quiet AİLE sayfası metinleri: sekme başlığı, H1, ilk paragraf, meta açıklama (URN-135, U4 · Design D4).
//
// NİÇİN BU DOSYA (ve sözlükte DEĞİL): bu metinler DB'deki aile metninin (`product_families.name_i18n`,
// `description`, `meta_title`, `meta_description`) YERİNE geçer, ama DB'ye YAZMAK canlı yazımdır ve Recep kapısındadır.
// Geçici çözüm: tek bir aile slug'ına özel geçersiz kılma. Kalıcı çözüm metni DB'ye (categories/families metadata)
// taşımaktır (KTL-47 sonrası); o gün bu dosya ve `aileSayfasi.tsx`'teki çağrısı silinir. Kural 7 (görünen metin sözlükten)
// bu yüzden şöyle sağlanır: TR ve EN şablonlar yan yana durur, parite `aileMetinleri.test.ts` ile sabitlenir.
//
// SES SAYISI KOŞULSUZ YAZILMAZ: `{GOVDE_MIN}` yalnız `sesEtiketi` üreticisinden gelir (dB(A) + kademe + yer + 3 m); sayfadaki
// CANLI varyant SKU'larının ses verisiyle kesişiminden hesaplanır (kategori sayfasıyla aynı hesap: `sesOzetiHesapla`).
// Kesişim boşsa ses cümlesi yerine sayısız şablon çizilir; ham `{…}` hiçbir zaman çıkmaz. `{N_MODEL}` sayfadaki canlı
// varyant sayısıdır; hesaplanamazsa (0) model sayısı geçen kısım atılır.
//
// Katalog doğrulaması gereği şu ifadeler KASITLI olarak yok ve geri getirilmez: Helmholtz'lu "sessizliğin kaynağı …",
// mekân sayımı (ofis, yatak odası, toplantı odası), "dört kademe", "kabuk içindeki". Kaynak: URN-135 düzeltilmiş
// metin dosyası, bölüm D4 (Vortice LINEO kataloğu, Mayıs 2026).
//
// Saf modüldür: sözlük, DB ve UI içermez. İstemci bileşenine (`ProductDetailPageView`, 'use client') GİRMEZ; sunucuda
// hesaplanan küçük dizeler prop olarak geçer. Bu yüzden şablonlar istemci demetine sızmaz (test kapısı var).

import { sesOzetiHesapla, skudanModelKodlari } from './sesOzeti'
import { sesEtiketi, type SesEtiketSozlugu } from './sesVerisi'

/** Geçersiz kılmanın uygulandığı aile (kanonik `product_families.slug`). Tek yer burası; sesOzeti.test.ts seri listesiyle eşitler. */
export const LINEO_QUIET_AILE_SLUG = 'vortice-lineo-quiet-sessiz-kanal-fanlari'

/** Arama sonucunda kesilmeyen üst sınır (`aciklamaKirp.ACIKLAMA_AZAMI` ile aynı değer). */
export const META_AZAMI = 155

type Dil = 'tr' | 'en'

/** Yer tutucular: `{GOVDE_MIN}` = sesEtiketi çıktısı, `{N_MODEL}` = canlı model sayısı. */
type MetaAdaylari = Readonly<{
  /** Ses ve model sayısı var: uzundan kısaya adaylar; ilk ≤ META_AZAMI olan seçilir. */
  sesVeN: readonly string[]
  /** Yalnız ses var (model sayısı hesaplanamadı). */
  sesli: readonly string[]
  /** Yalnız model sayısı var (ses kesişimi boş). */
  nli: readonly string[]
  /** İkisi de yok. */
  yok: readonly string[]
}>

type Sablon = Readonly<{
  title: Readonly<{ n: string; nsiz: string }>
  h1: string
  ilkParagraf: Readonly<{ ses: string; sayisiz: string }>
  meta: MetaAdaylari
}>

export const AILE_SABLONLARI: Readonly<Record<Dil, Sablon>> = {
  tr: {
    title: {
      n: 'Vortice Lineo Quiet Sessiz Kanal Fanı: {N_MODEL} Model | VentHub',
      nsiz: 'Vortice Lineo Quiet Sessiz Kanal Fanı | VentHub',
    },
    h1: 'Vortice Lineo Quiet Sessiz Kanal Tipi Fan',
    ilkParagraf: {
      ses:
        'Vortice Lineo Quiet, yuvarlak kanala seri bağlanan karışık akışlı bir kanal fanıdır. Dış gövdeye bütünleşik ses emici kaplama çevresel ses emisyonunu en aza indirmek için optimize edilmiştir; katalogdaki en düşük değer {GOVDE_MIN}. Ø100–Ø315 mm çaplarda, AC ve 0–10 V ayarlı EC motorla gelir. Konut, ticari ya da sanayi mekânlarının kanallı havalandırması için, yatay ya da dikey kurulumla kullanılır.',
      sayisiz:
        'Vortice Lineo Quiet, yuvarlak kanala seri bağlanan karışık akışlı bir kanal fanıdır. Dış gövdeye bütünleşik ses emici kaplama çevresel ses emisyonunu en aza indirmek için optimize edilmiştir. Ø100–Ø315 mm çaplarda, AC ve 0–10 V ayarlı EC motorla gelir. Konut, ticari ya da sanayi mekânlarının kanallı havalandırması için, yatay ya da dikey kurulumla kullanılır.',
    },
    meta: {
      sesVeN: [
        'Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; ses değeri {GOVDE_MIN} değerinden başlar ve AC ile EC motorlu {N_MODEL} modeli vardır.',
        'Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; ses değeri {GOVDE_MIN} değerinden başlar ve {N_MODEL} modeli vardır.',
      ],
      sesli: ['Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; ses değeri {GOVDE_MIN} değerinden başlar.'],
      nli: [
        'Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; AC ile EC motorlu {N_MODEL} modeli vardır.',
        'Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; {N_MODEL} modeli vardır.',
      ],
      yok: ['Vortice Lineo Quiet, ses emici gövdeli bir kanal fanıdır; AC ve EC motorlu sürümleri vardır.'],
    },
  },
  en: {
    title: {
      n: 'Vortice Lineo Quiet Silent Duct Fan: {N_MODEL} Models | VentHub',
      nsiz: 'Vortice Lineo Quiet Silent Duct Fan | VentHub',
    },
    h1: 'Vortice Lineo Quiet Silent In-Line Duct Fan',
    ilkParagraf: {
      ses:
        'Vortice Lineo Quiet is a mixed-flow duct fan connected in series with a circular duct. The sound-absorbing coating integrated in the outer casing is optimised to minimise the sound radiated to the surroundings; the lowest catalogue value is {GOVDE_MIN}. It comes in Ø100–Ø315 mm diameters, with AC and 0–10 V adjustable EC motors. It is used for ducted ventilation of residential, commercial or industrial premises, installed horizontally or vertically.',
      sayisiz:
        'Vortice Lineo Quiet is a mixed-flow duct fan connected in series with a circular duct. The sound-absorbing coating integrated in the outer casing is optimised to minimise the sound radiated to the surroundings. It comes in Ø100–Ø315 mm diameters, with AC and 0–10 V adjustable EC motors. It is used for ducted ventilation of residential, commercial or industrial premises, installed horizontally or vertically.',
    },
    meta: {
      sesVeN: [
        'Vortice Lineo Quiet is a duct fan with a sound-absorbing casing; its sound values start at {GOVDE_MIN}, across {N_MODEL} AC and EC motor models.',
        'Vortice Lineo Quiet is a duct fan with a sound-absorbing casing; its sound values start at {GOVDE_MIN}, across {N_MODEL} models.',
      ],
      sesli: ['Vortice Lineo Quiet is a duct fan with a sound-absorbing casing; its sound values start at {GOVDE_MIN}.'],
      nli: [
        'Vortice Lineo Quiet is a duct fan with a sound-absorbing casing, available in {N_MODEL} AC and EC motor models.',
        'Vortice Lineo Quiet is a duct fan with a sound-absorbing casing, available in {N_MODEL} models.',
      ],
      yok: ['Vortice Lineo Quiet is a duct fan with a sound-absorbing casing, available in AC and EC motor versions.'],
    },
  },
}

/** Sayfa bağlamı: sunucuda zaten yüklü canlı varyantlardan çıkarılır (ek sorgu yok). */
export type AileMetniBaglam = Readonly<{
  /**
   * Canlı (aktif, silinmemiş) varyantlar; model kodu `sku`dan çıkar (`VRT-17164` → `17164`, `skudanModelKodlari`).
   * Çağıran SKU alanını OKUMAZ, nesneyi olduğu gibi verir: müşteri sayfası dosyasında ham `sku` okuması INV-SKU-GORUNMEZ-1
   * tarayıcısını (haklı olarak) tetikler; SKU burada, yalnız kod çıkarmak için ve ekrana basılmadan işlenir.
   */
  varyantlar: ReadonlyArray<{ sku?: string | null }>
  /** Canlı model sayısı; 0 / geçersiz → model sayısı geçen kısım atılır. */
  nModel: number
  /** Sözlükten (`categorySilentFan.ses`) kurulmuş sözcükler; `sesEtiketi`nin tek girdisi. */
  sesSozlugu: SesEtiketSozlugu
}>

export type AileMetniGecersizKilma = Readonly<{
  /** `<title>`, OpenGraph ve Twitter başlığı. */
  title: string
  /** Görünen H1. */
  h1: string
  /** Görünen ilk (açıklama) paragrafı; JSON-LD `description` ile aynı değer. */
  ilkParagraf: string
  /** Meta description (≤ META_AZAMI); hiçbir aday sığmazsa `null` → çağıran mevcut zincire düşer. */
  meta: string | null
}>

function doldur(sablon: string, degerler: Readonly<{ govdeMin: string; nModel: string }>): string {
  return sablon.replaceAll('{GOVDE_MIN}', degerler.govdeMin).replaceAll('{N_MODEL}', degerler.nModel)
}

/**
 * Slug eşleşirse Lineo Quiet aile metinlerini yer tutucuları doldurulmuş olarak döner; eşleşmezse `null`
 * (çağıran bugünkü DB zincirini AYNEN kullanır). Ses etiketi yalnız `sesEtiketi`den; veri yoksa sayısız şablon.
 */
export function aileMetniGecersizKil(
  slug: string,
  lang: string,
  baglam: AileMetniBaglam,
): AileMetniGecersizKilma | null {
  if (slug !== LINEO_QUIET_AILE_SLUG) return null
  const dil: Dil = lang === 'en' ? 'en' : 'tr'
  const sablon = AILE_SABLONLARI[dil]

  const ozet = sesOzetiHesapla(skudanModelKodlari(baglam.varyantlar.map((v) => v.sku)))
  const govdeMin = ozet ? sesEtiketi(ozet.seri.enDusukGovde, dil, baglam.sesSozlugu) : ''
  const nSayi = Number.isFinite(baglam.nModel) ? Math.trunc(baglam.nModel) : 0
  const nVar = nSayi > 0
  const sesVar = govdeMin !== ''
  const degerler = { govdeMin, nModel: nVar ? String(nSayi) : '' }

  const adaylar = sesVar ? (nVar ? sablon.meta.sesVeN : sablon.meta.sesli) : nVar ? sablon.meta.nli : sablon.meta.yok
  // 155'i aşan meta KULLANILMAZ: uzundan kısaya ilk sığan seçilir; hiçbiri sığmazsa null (mevcut zincir).
  const meta = adaylar.map((a) => doldur(a, degerler)).find((m) => [...m].length <= META_AZAMI) ?? null

  return {
    title: doldur(nVar ? sablon.title.n : sablon.title.nsiz, degerler),
    h1: sablon.h1,
    ilkParagraf: doldur(sesVar ? sablon.ilkParagraf.ses : sablon.ilkParagraf.sayisiz, degerler),
    meta,
  }
}
