import { en } from '@/i18n/dictionaries/en'
import { tr } from '@/i18n/dictionaries/tr'

/**
 * AİLE SAYFASI BAŞLIĞINA DEBİ ARALIĞI (URN-149).
 *
 * Kural (OPS onaylı): YALNIZ `technical_specs.max_delivery_m3h` taşıyan modeller sayılır. Birim alan adındadır
 * (`_m3h`), nominal değer maksimuma yazılmaz (product-schema-standard §11.6-11.7). `nominal_delivery_m3h`,
 * `min_delivery_m3h` ve `max_delivery_ls` KULLANILMAZ; yalnız nominal debisi olan ya da hiç debisi olmayan aileye ek yok.
 *
 * Saf fonksiyonlardır: ek sorgu yok, DI yok; girdi sayfaya zaten yüklü varyantlardır.
 */

/** Başlıkta (title) toplam karakter tavanı; aşan title debi ALMAZ (yalnız H1 alır). */
export const AILE_TITLE_AZAMI = 60

const ALAN = 'max_delivery_m3h'
const TIRE = '–'

interface DebiKaynagi {
  technical_specs?: Record<string, string | number | boolean | null> | null
}

function sonluPozitif(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN
  return Number.isFinite(n) && n > 0 ? n : null
}

/** "2.540–22.100 m³/h" (TR) / "2,540–22,100 m³/h" (EN); min=max ise tek değer; debi yoksa `null`. */
export function aileDebiAraligi(variants: ReadonlyArray<DebiKaynagi> | null | undefined, lang: string): string | null {
  if (!variants || variants.length === 0) return null
  const degerler: number[] = []
  for (const v of variants) {
    const n = sonluPozitif(v?.technical_specs?.[ALAN])
    if (n !== null) degerler.push(n)
  }
  if (degerler.length === 0) return null
  const min = Math.min(...degerler)
  const max = Math.max(...degerler)
  const bicim = new Intl.NumberFormat(lang === 'en' ? 'en' : 'tr', { maximumFractionDigits: 1 })
  // Karşılaştırma BİÇİMLENMİŞ dizede: 100,04 ve 100 gösterimde aynıdır, "100–100" yazılmaz.
  const minYazi = bicim.format(min)
  const maxYazi = bicim.format(max)
  const aralik = minYazi === maxYazi ? minYazi : `${minYazi}${TIRE}${maxYazi}`
  const dict = lang === 'en' ? en : tr
  return dict.common.unitCubicMetersPerHour.replace('{{v}}', aralik)
}

/** H1: "<görünen aile adı> <debi>"; debi yoksa dize aynen döner. */
export function aileBasligiDebili(baslik: string, debi: string | null): string {
  return debi ? `${baslik} ${debi}` : baslik
}

/** Title: "<aile adı> <debi> | VentHub"; toplam ≤ 60 değilse debisiz "<aile adı> | VentHub". */
export function aileTitleDebili(ad: string, debi: string | null): string {
  const duz = `${ad} | VentHub`
  if (!debi) return duz
  const debili = `${ad} ${debi} | VentHub`
  return debili.length <= AILE_TITLE_AZAMI ? debili : duz
}
