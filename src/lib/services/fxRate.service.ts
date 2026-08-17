import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '../../types/database.types'

/**
 * KUR ÇÖZÜCÜ — "bugün geçerli kur hangisi?" sorusunun TEK cevabı.
 *
 * CETVEL: `docs/standards/pricing-standard.md` §8.2.1 (fx-lock admin yüzeyi sözleşmesi).
 *
 * NİÇİN TEK YERDE. Bu sorgunun iki kopyası vardı ve **ikisi aynı şeyi sormuyordu**:
 * motor (`pricingMaterialize`) `base_ccy='TRY'` filtresini uyguluyordu, gösterim yolu
 * (`pricing.service.resolvePrice`) uygulamıyordu. Yani aynı ürün için "maliyet hangi
 * kurdan hesaplandı" ile "vitrinde hangi kurdan gösterildi" ayrışabiliyordu.
 * (ADMIN-CUSTOMER buldu, 2026-08-17; o gün prod'da 6 satırın hepsi `base_ccy='TRY'`
 * olduğu için kusur GİZLİYDİ — `base_ccy` üzerinde CHECK yok ve `source='manual'`
 * serbest, yani TRY-dışı tabanlı tek bir satır girildiği gün ayrışma görünür olurdu.)
 *
 * Üçüncü bir kopya daha doğacaktı: fx-lock admin yüzeyi, kilit anındaki kuru
 * "enstantane" alacak. Kilidin dondurduğu sayı motorun kullandığından farklı olursa
 * fiyat **kilitliyken oynar** — sinsi ve gecikmeli bir hata sınıfı. Bu yüzden çözüm
 * "dikkatli kopyala" talimatı değil, YAPI: üç okuyucu da bu fonksiyonu çağırır.
 *
 * Bekçi: INV-PRICE-8 — "geçerli kuru seçen" sorgu deseni yalnız BU dosyada bulunabilir.
 */

/** Çözülen kur + hangi tarihli kaydın kullanıldığı (künye/denetim için). */
export interface FxRateResult {
  rate: number
  effectiveDate: string
}

/**
 * `quoteCcy` için `today` itibarıyla geçerli kuru döndürür; yoksa `null`.
 *
 * Sözleşme (motorun 2026-08-17'deki davranışıyla BİREBİR — göç sırasında korundu):
 *  · `TRY` hiç sorgulanmaz, `{ rate: 1, effectiveDate: today }` döner.
 *  · `base_ccy='TRY'` **filtresi şarttır**: kayıt (base=TRY, quote=EUR, rate=55.32)
 *    "1 EUR kaç TL" demektir. Yalnız `quote_ccy` eşleştirmek, TRY-dışı tabanlı bir
 *    satır varsa YANLIŞ BİRİMİ döndürür.
 *  · `effective_date <= today`; sıralama `effective_date DESC`, eşitlikte
 *    `fetched_at DESC`; ilk satır.
 *  · `spread_pct` **okunmaz** — fiyatlandırma zinciri ham `rate` üzerinden çalışır.
 *    (Spread bir gün devreye girecekse, tek yer burasıdır.)
 *  · Geçersiz/sıfır/negatif oran `null` sayılır — sessizce 0'la çarpmak yerine
 *    "kur yok" davranışı üretir (çağıranlar bunu `skippedNoRate` olarak sayar).
 */
export async function resolveFxRate(
  supabase: SupabaseClient<Database>,
  quoteCcy: string,
  today: string,
): Promise<FxRateResult | null> {
  const ccy = quoteCcy.toUpperCase()
  if (ccy === 'TRY') return { rate: 1, effectiveDate: today }

  const { data: rates, error } = await supabase
    .from('currency_rates')
    .select('rate, effective_date')
    .eq('base_ccy', 'TRY')
    .eq('quote_ccy', ccy)
    .lte('effective_date', today)
    .order('effective_date', { ascending: false })
    .order('fetched_at', { ascending: false })
    .limit(1)
  if (error) throw error

  const row = rates && rates.length > 0 ? rates[0] : null
  if (!row) return null

  const rate = Number(row.rate)
  if (!Number.isFinite(rate) || rate <= 0) return null

  return { rate, effectiveDate: row.effective_date }
}
