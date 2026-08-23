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
 * Colebrook-White denklemini çözer → Darcy sürtünme faktörü.
 *
 * Denklem örtüktür (f iki tarafta); sabit nokta iterasyonu kullanılır — 1/√f için
 * yakınsama hızlıdır ve 20 adımda makine hassasiyetine yaklaşır.
 * Laminer bölgede (Re < 2300) analitik çözüm geçerlidir: f = 64/Re.
 *
 * @param Re Reynolds sayısı
 * @param bagilPuruzluluk ε/D (boyutsuz)
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

/** Dairesel kanalda verilen debi için akış hızı (m/s). */
export function akisHizi(debiM3h: number, capMm: number): number {
  if (capMm <= 0) return 0
  const yaricapM = capMm / 2000
  const alanM2 = Math.PI * yaricapM * yaricapM
  if (alanM2 <= 0) return 0
  return debiM3h / 3600 / alanM2
}

/** Reynolds sayısı (dairesel kanal). */
export function reynolds(hizMs: number, capMm: number): number {
  return (hizMs * (capMm / 1000)) / HAVA_KINEMATIK_VISKOZITE
}

/** Dinamik basınç ρV²/2 (Pa). Hem sürtünme hem yerel kayıpların ortak çarpanı. */
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
 * Verilen debide kanal sisteminin toplam basınç kaybı.
 * Sonuç, seçim motorunda sistem eğrisinin (P = k·Q²) tasarım noktasıdır.
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
