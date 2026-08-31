/**
 * Kanal basınç kaybı — standart formüller, halka açık kaynakla DOĞRULANMIŞ. T150-VH.
 *
 * NİÇİN AYRI DOSYA (2026-08-23):
 * Seçim motorunun ilk halinde basınç kaybını "kısa 50 / orta 100 / uzun 180 Pa" diye
 * üç kademeli bir TAHMİN tablosuyla geçmiştim — atıfsız, uydurma. Recep bunu yakaladı:
 * hesap motoru profesyonel ve halka açık kaynaklardan gelmeli.
 *
 * Projedeki `hvacCalculations.ts` bu işi yapmaya çalışıyor ama sürtünme faktörünü
 * `f ≈ 0,02 + pürüzlülük·0,1` diye sabitliyor. ÖLÇTÜM: 100 mm galvaniz kanalda 2 m/s'te
 * gerçek Darcy faktörü **0,0312**, o formül **0,0200** veriyor — yani basınç kaybını
 * üçte bir eksik hesaplıyor ve fanı olduğundan güçlü gösteriyor. Bu dosya o yüzden
 * Colebrook-White denklemini gerçekten çözer.
 *
 * KAYNAK VE DOĞRULAMA:
 *  · Darcy-Weisbach:  ΔP = f · (L/D) · (ρ·V²/2)
 *  · Colebrook-White: 1/√f = −2·log₁₀( ε/(3,7·D) + 2,51/(Re·√f) )
 *  · Yerel kayıplar:  ΔP = K · (ρ·V²/2)
 *  · Sayısal doğrulama: Python **fluids 1.3.1** (MIT, Caleb Bell) — `friction_factor()`
 *    ve `fittings.bend_rounded()`. 54 senaryoluk referans seti
 *    `__tests__/fluids-reference.json` içinde; INV-DUCTPRESSURE-1 bu değerlere karşı ölçer.
 *    Kütüphane ÇALIŞMA ZAMANINDA kullanılmaz (tarayıcıda Python yok) — referans üretici
 *    ve doğrulayıcı olarak kullanılır, sayılar burada bağımsızca hesaplanır.
 */

/** Hava yoğunluğu (kg/m³), 20 °C deniz seviyesi. */
export const HAVA_YOGUNLUGU = 1.2

/** Havanın kinematik viskozitesi (m²/s), 20 °C — referans seti bu değerle üretildi. */
export const HAVA_KINEMATIK_VISKOZITE = 1.5e-5

/** Kanal iç yüzey pürüzlülüğü (m). `hvacCalculations.getRoughness` ile aynı sınıflar. */
export const PURUZLULUK_M = {
  galvanized: 0.00015,
  pvc: 0.00001,
  flex: 0.003,
} as const

export type KanalMalzemesi = keyof typeof PURUZLULUK_M

/**
 * Yerel direnç katsayıları (K) — `fluids.fittings.bend_rounded`, Re = 1e5, D = 150 mm.
 * Kanal montajında en sık görülen üç parça. Sayılar kütüphaneden ALINDI, uydurulmadı.
 */
export const FITTING_K = {
  /** 90° yuvarlak dirsek, eğrilik yarıçapı = 1,5·D (tipik hazır dirsek). */
  dirsek90: 0.2253,
  /** 90° dar dirsek, r = 1,0·D. */
  dirsek90Dar: 0.3133,
  /** 45° dirsek, r = 1,5·D. */
  dirsek45: 0.1552,
} as const

/**
 * Sistem uçlarındaki sabit kayıplar (K).
 *
 * NİÇİN AYRI VE NİÇİN ŞART: yalnız düz kanal + dirsek sayan bir model, konut
 * havalandırmasında gerçeğin çok altını verir. Ölçtüm: 6 m / 150 mm galvaniz kanal +
 * 2 dirsek yalnızca ~10 Pa çıkıyor; oysa aynı tesisatta iç menfez, geri-akış klapesi ve
 * dış panjur birlikte bunun birkaç katını ekler. Bu kalemler her kanal fanı montajında
 * VARDIR, seçenek değildir — bu yüzden sabit olarak eklenirler.
 *
 * KAYNAK VE SINIR: dirsek katsayıları `fluids` kütüphanesinden geldi; aşağıdaki üç
 * kalem ise ASHRAE Fundamentals (Duct Fitting Database) mertebesinde YAYGIN DEĞERLERDİR,
 * tekil bir üründen ölçülmemiştir. Yani bunlar makul mühendislik kabulüdür, kesin veri
 * değil; ürün bazlı menfez/panjur verisi elimize geçerse buradan tek yerden güncellenir.
 */
export const TERMINAL_K = {
  /** İç mahal egzoz menfezi/ızgarası. */
  menfez: 2.5,
  /** Geri-akış klapesi (backdraft damper). */
  klape: 0.5,
  /** Dış cephe panjuru + çıkış kaybı. */
  disPanjur: 3.0,
} as const

/** Her kanal fanı montajında bulunan sabit terminal kaybı toplamı (K). */
export const TERMINAL_K_TOPLAM = TERMINAL_K.menfez + TERMINAL_K.klape + TERMINAL_K.disPanjur

/**
 * Calculates the Darcy friction factor by solving the Colebrook-White equation.
 *
 * The Colebrook-White equation is implicit (f appears on both sides). This function uses
 * fixed-point iteration to approximate the solution for 1/√f. It converges quickly and
 * typically reaches near machine precision within 20 iterations. For laminar flow
 * (Reynolds < 2300), it directly returns the exact analytical solution (64/Re).
 *
 * @param Re - The Reynolds number of the flow. Returns 0 if Re is non-positive or invalid.
 * @param bagilPuruzluluk - The relative roughness of the duct (ε/D, dimensionless).
 * @returns The calculated Darcy friction factor (dimensionless).
 *
 * @example
 * surtunmeFaktoru(2000, 0.001) // returns 0.032 (Laminar flow, 64/2000)
 * surtunmeFaktoru(100000, 0.001) // returns ~0.022 (Turbulent flow iterative result)
 */
export function surtunmeFaktoru(Re: number, bagilPuruzluluk: number): number {
  if (!Number.isFinite(Re) || Re <= 0) return 0
  if (Re < 2300) return 64 / Re

  // Başlangıç tahmini: Swamee-Jain (açık form, Colebrook'a yakın)
  let f =
    0.25 /
    Math.pow(Math.log10(bagilPuruzluluk / 3.7 + 5.74 / Math.pow(Re, 0.9)), 2)

  for (let i = 0; i < 20; i++) {
    const sqrtF = Math.sqrt(f)
    const sag = -2 * Math.log10(bagilPuruzluluk / 3.7 + 2.51 / (Re * sqrtF))
    const yeniF = 1 / (sag * sag)
    if (Math.abs(yeniF - f) < 1e-12) return yeniF
    f = yeniF
  }
  return f
}

/**
 * Calculates the air flow velocity in a circular duct given the volumetric flow rate and duct diameter.
 *
 * @param debiM3h - Volumetric flow rate in cubic meters per hour (m³/h).
 * @param capMm - Internal diameter of the circular duct in millimeters (mm).
 * @returns The average flow velocity in meters per second (m/s). Returns 0 if diameter or area is invalid.
 *
 * @example
 * akisHizi(360, 100) // returns ~12.73 m/s
 * akisHizi(0, 150) // returns 0 m/s
 */
export function akisHizi(debiM3h: number, capMm: number): number {
  if (capMm <= 0) return 0
  const yaricapM = capMm / 2000
  const alanM2 = Math.PI * yaricapM * yaricapM
  if (alanM2 <= 0) return 0
  return debiM3h / 3600 / alanM2
}

/**
 * Calculates the Reynolds number for airflow in a circular duct.
 *
 * The Reynolds number determines whether the flow is laminar or turbulent.
 * It is calculated using the established standard kinematic viscosity of air at 20°C.
 *
 * @param hizMs - Average flow velocity in meters per second (m/s).
 * @param capMm - Internal diameter of the duct in millimeters (mm).
 * @returns The dimensionless Reynolds number.
 *
 * @example
 * reynolds(5, 100) // returns ~33333
 */
export function reynolds(hizMs: number, capMm: number): number {
  return (hizMs * (capMm / 1000)) / HAVA_KINEMATIK_VISKOZITE
}

/**
 * Calculates the dynamic pressure (velocity pressure) of the airflow.
 *
 * Dynamic pressure represents the kinetic energy of the fluid and acts as the fundamental
 * multiplier (ρV²/2) for calculating both friction and local resistance losses.
 *
 * @param hizMs - Average flow velocity in meters per second (m/s).
 * @returns The dynamic pressure in Pascals (Pa).
 *
 * @example
 * dinamikBasinc(10) // returns 60 Pa (assuming standard air density of 1.2 kg/m³)
 */
export function dinamikBasinc(hizMs: number): number {
  return (HAVA_YOGUNLUGU * hizMs * hizMs) / 2
}

export interface KanalTanimi {
  /** Toplam düz kanal uzunluğu (m). */
  uzunlukM: number
  /** Kanal iç çapı (mm). */
  capMm: number
  malzeme: KanalMalzemesi
  /** 90° dirsek adedi. */
  dirsek90: number
  /** 45° dirsek adedi. */
  dirsek45: number
}

export interface BasincDokumu {
  hizMs: number
  reynolds: number
  surtunmeFaktoru: number
  /** Düz kanal sürtünme kaybı (Pa). */
  surtunmeKaybiPa: number
  /** Dirsek vb. yerel kayıplar (Pa). */
  yerelKayipPa: number
  /** Toplam sistem basınç kaybı (Pa). */
  toplamPa: number
}

/**
 * Computes the total pressure loss (friction + local resistances) for a defined ductwork system at a specific flow rate.
 *
 * This calculates the operational design point on the system curve (P = k·Q²),
 * solving Colebrook-White for straight duct friction and summing local `K` factors for fittings
 * and mandatory terminals (grilles, dampers, louvers).
 *
 * @param debiM3h - Volumetric flow rate in cubic meters per hour (m³/h).
 * @param kanal - Configuration object describing the physical layout and materials of the ductwork.
 * @returns A detailed breakdown of fluid dynamics metrics and pressure losses (Pa).
 *
 * @example
 * const ductConfig = { uzunlukM: 5, capMm: 150, malzeme: 'galvanized', dirsek90: 2, dirsek45: 0 };
 * const losses = kanalBasincKaybi(350, ductConfig);
 * // returns { hizMs: ~5.5, surtunmeKaybiPa: ~12.5, yerelKayipPa: ~117.4, toplamPa: ~129.9, ... }
 */
export function kanalBasincKaybi(debiM3h: number, kanal: KanalTanimi): BasincDokumu {
  const hizMs = akisHizi(debiM3h, kanal.capMm)
  const Re = reynolds(hizMs, kanal.capMm)
  const bagil = PURUZLULUK_M[kanal.malzeme] / (kanal.capMm / 1000)
  const f = surtunmeFaktoru(Re, bagil)
  const pDin = dinamikBasinc(hizMs)

  const capM = kanal.capMm / 1000
  const surtunmeKaybiPa = capM > 0 ? f * (kanal.uzunlukM / capM) * pDin : 0
  const toplamK =
    kanal.dirsek90 * FITTING_K.dirsek90 +
    kanal.dirsek45 * FITTING_K.dirsek45 +
    TERMINAL_K_TOPLAM
  const yerelKayipPa = toplamK * pDin

  return {
    hizMs,
    reynolds: Re,
    surtunmeFaktoru: f,
    surtunmeKaybiPa,
    yerelKayipPa,
    toplamPa: surtunmeKaybiPa + yerelKayipPa,
  }
}
