/**
 * Kanal tipi fan seçim motoru — T150-VH.
 *
 * NİÇİN VAR:
 * Sessiz kanal fanı sayfasında kullanıcı, teknik terim bilmeden doğru modeli bulabilmeli.
 * Bu modül "kullanıcının bildiği şey" (oda tipi, oda büyüklüğü, kanal uzunluğu, sessizlik
 * beklentisi) ile "ürünün söylediği şey" (P-Q eğrisi, ses seviyesi, güç) arasındaki
 * mühendislik köprüsüdür. Kullanıcıya m³/h veya Pa SORULMAZ; ikisi de burada hesaplanır.
 *
 * SAFLIK: bu dosya veri çekmez, çeviri bilmez, React bilmez. Girdi → çıktı. Böylece
 * seçim kuralları testte tek başına kanıtlanabilir (INV-DUCTFAN-SELECT-1).
 *
 * ÖLÇÜM TABANI (2026-08-23, canlı DB, 374 aktif ürün):
 *   · `technical_specs.pq_curve` 145 üründe dolu, JSONB **string** olarak: "[[Q,P],[Q,P],…]"
 *     141'i 3 noktalı, 4'ü 6 noktalı → nokta sayısı SABİT VARSAYILMAZ.
 *   · `inline-duct-fans` altındaki 12/12 üründe pq_curve + noise_level_db_a +
 *     max_delivery_m3h + diameter_mm dolu.
 */

import { kanalBasincKaybi, type KanalMalzemesi } from './ductPressure'

/** Fan eğrisinin tek noktası: bu debide fanın üretebildiği statik basınç. */
export interface PQNoktasi {
  /** Hacimsel debi, m³/h. */
  debiM3h: number
  /** Statik basınç, Pa. */
  basincPa: number
}

/** Kullanıcının seçtiği mahal — hava değişim sayısını (ACH) belirler. */
export type MahalTipi = 'bathroom' | 'kitchen' | 'bedroom' | 'living' | 'office' | 'shop'

/** Kanal güzergâhının kabaca uzunluğu/dirsekliliği — sistem direncini belirler. */
export type KanalGuzergahi = 'short' | 'medium' | 'long'

/** Sessizliğin kullanıcı için önemi — puanlamada ses ağırlığını belirler. */
export type SessizlikOnceligi = 'normal' | 'important' | 'critical'

/**
 * Mahal başına saatlik hava değişim sayısı (ACH) ve mutlak alt sınır.
 *
 * KAYNAKLAR (atıfsız tablo YASAK — Recep kuralı, 2026-08-23):
 *  · `minimumM3h` ıslak hacimlerde **ASHRAE 62.2** (konut havalandırması) talep-üzerine
 *    egzoz değerleridir: banyo 50 CFM ≈ 85 m³/h, mutfak 100 CFM ≈ 170 m³/h.
 *    EN 16798-1 daha düşük taban verir (banyo ~54, mutfak ~90 m³/h); burada YÜKSEK olan
 *    seçildi — yetersiz fan önermek, gereğinden büyük önermekten daha kötü bir hatadır.
 *  · Yaşam mahallerinde sürekli havalandırma esas alınır, ACH ile hesaplanır; değerler
 *    projedeki `hvacCalculations.getAirflowPerArea` (ASHRAE 62.1) ile aynı mertebededir.
 *
 * Tek yerdedir; değişirse INV-DUCTFAN-SELECT-1 kaymayı görür.
 */
export const MAHAL_KURALLARI: Readonly<Record<MahalTipi, { ach: number; minimumM3h: number }>> = {
  bathroom: { ach: 8, minimumM3h: 85 },
  kitchen: { ach: 15, minimumM3h: 170 },
  bedroom: { ach: 4, minimumM3h: 40 },
  living: { ach: 5, minimumM3h: 60 },
  office: { ach: 6, minimumM3h: 60 },
  shop: { ach: 8, minimumM3h: 150 },
}

/**
 * Güzergâh seçiminin GEOMETRİ karşılığı — basınç kaybı buradan HESAPLANIR, tabloya yazılmaz.
 *
 * NEDEN DEĞİŞTİ: ilk sürümde burada sabit bir Pa tablosu vardı ("kısa 50 / orta 100 /
 * uzun 180") — atıfsız bir tahmindi. Gerçek kayıp debiye, çapa, malzemeye ve dirsek
 * sayısına bağlıdır ve debinin KARESİYLE büyür; sabit Pa bunu hiç göremez. Kullanıcı
 * yalnız gözle bildiği şeyi seçer (kanal kısa mı uzun mu, dolambaçlı mı); karşılığındaki
 * geometri `ductPressure.kanalBasincKaybi` ile Colebrook-White üzerinden çözülür.
 */
export const GUZERGAH_GEOMETRISI: Readonly<
  Record<KanalGuzergahi, { uzunlukM: number; dirsek90: number; dirsek45: number }>
> = {
  short: { uzunlukM: 3, dirsek90: 1, dirsek45: 0 },
  medium: { uzunlukM: 6, dirsek90: 2, dirsek45: 1 },
  long: { uzunlukM: 12, dirsek90: 4, dirsek45: 2 },
}

/** Puanlamada sesin ağırlığı (0-1). Kalanı debi uygunluğu + verimlilik paylaşır. */
export const SESSIZLIK_AGIRLIGI: Readonly<Record<SessizlikOnceligi, number>> = {
  normal: 0.2,
  important: 0.4,
  critical: 0.6,
}

/** Sihirbazın kullanıcıdan topladığı ham girdi. */
export interface SecimGirdisi {
  mahal: MahalTipi
  /** Oda taban alanı, m². */
  alanM2: number
  /** Tavan yüksekliği, m. Kullanıcı girmezse çağıran 2.5 geçmelidir. */
  tavanYuksekligiM: number
  guzergah: KanalGuzergahi
  sessizlik: SessizlikOnceligi
  /** Kullanıcı kanal çapını biliyorsa (mm); bilmiyorsa null → çap filtresi uygulanmaz. */
  kanalCapiMm: number | null
  /**
   * Kanal malzemesi. Kullanıcı "sert kanal" / "esnek spiral boru" diye seçer;
   * esnek boru sürtünmesi galvanizin 20 katıdır ve seçimi ciddi biçimde değiştirir.
   */
  malzeme: KanalMalzemesi
}

/** Seçim motorunun değerlendirdiği tek ürün adayı. */
export interface FanAdayi {
  id: string
  sku: string
  ad: string
  slug: string
  /** Ham `technical_specs.pq_curve` değeri (string ya da dizi) — parse burada yapılır. */
  pqCurveHam: unknown
  /** `technical_specs.max_delivery_m3h` — eğri yoksa kaba yedek. */
  maksDebiM3h: number | null
  /** `technical_specs.noise_level_db_a`. */
  sesDbA: number | null
  /** `technical_specs.max_absorbed_power_w`. */
  gucW: number | null
  /** `technical_specs.diameter_mm`. */
  capMm: number | null
}

/** Bir adayın hesaplanmış sonucu. */
export interface AdaySonucu {
  aday: FanAdayi
  /** Fanın BU tesisatta gerçekten verebildiği debi (çalışma noktası), m³/h. */
  calismaDebisiM3h: number
  /** Çalışma noktasındaki basınç, Pa. */
  calismaBasinciPa: number
  /** calismaDebisi / tasarimDebisi. 1.0 = tam yeterli. */
  karsilamaOrani: number
  /** 0-100 arası toplam uygunluk puanı. */
  puan: number
  /** Debi yetersizse ya da çap uyuşmuyorsa dolu gelir; elenme sebebi. */
  elenmeSebebi: ElenmeSebebi | null
}

export type ElenmeSebebi = 'debi-yetersiz' | 'cap-uyusmuyor' | 'veri-yok'

/** Debi hesabının şeffaf dökümü — kullanıcıya "neden bu sayı" diye gösterilir. */
export interface DebiHesabi {
  hacimM3: number
  ach: number
  hamDebiM3h: number
  minimumM3h: number
  tasarimDebiM3h: number
  /** Minimum sınır devreye girdiyse true — arayüz bunu açıklayabilir. */
  minimumUygulandi: boolean
}

export interface SecimSonucu {
  hesap: DebiHesabi
  sistemBasinciPa: number
  /** Debiyi karşılayan adaylar, puana göre azalan. */
  uygunlar: AdaySonucu[]
  /** Elenenler (sebebiyle) — arayüz "şu kadar model yetersiz kaldı" diyebilir. */
  elenenler: AdaySonucu[]
  /** Dengeli puanı en yüksek olan. */
  enUygun: AdaySonucu | null
  /** Yeterli olanlar içinde en düşük ses. */
  enSessiz: AdaySonucu | null
  /** Yeterli olanlar içinde birim debi başına en az güç çeken. */
  enVerimli: AdaySonucu | null
}

/**
 * `pq_curve` alanını güvenle noktalara çevirir.
 *
 * Alan canlıda JSONB **string** olarak duruyor ("[[0, 210.9], …]"), ama dizi olarak da
 * gelebilir. İkisini de kabul eder; tanıyamadığı hiçbir şeyi UYDURMAZ, boş dizi döner.
 * Boş dizi = "eğri yok" demektir ve çağıran kaba yedeğe (maksDebi) düşer.
 */
export function parsePQCurve(ham: unknown): PQNoktasi[] {
  let dizi: unknown = ham
  if (typeof ham === 'string') {
    try {
      dizi = JSON.parse(ham)
    } catch {
      return []
    }
  }
  if (!Array.isArray(dizi)) return []

  const noktalar: PQNoktasi[] = []
  for (const oge of dizi) {
    if (!Array.isArray(oge) || oge.length < 2) continue
    const q = Number(oge[0])
    const p = Number(oge[1])
    if (!Number.isFinite(q) || !Number.isFinite(p) || q < 0 || p < 0) continue
    noktalar.push({ debiM3h: q, basincPa: p })
  }
  // Debiye göre artan sırada olmalı; kaynak sırasına GÜVENİLMEZ.
  noktalar.sort((a, b) => a.debiM3h - b.debiM3h)
  return noktalar
}

/**
 * Oda bilgisinden tasarım debisini çıkarır.
 * Kullanıcı m³/h bilmez; bu fonksiyon onun yerine hesaplar ve dökümünü de verir.
 */
export function hesaplaTasarimDebisi(
  mahal: MahalTipi,
  alanM2: number,
  tavanYuksekligiM: number,
): DebiHesabi {
  const kural = MAHAL_KURALLARI[mahal]
  const hacimM3 = Math.max(0, alanM2) * Math.max(0, tavanYuksekligiM)
  const hamDebiM3h = hacimM3 * kural.ach
  const tasarimDebiM3h = Math.max(hamDebiM3h, kural.minimumM3h)
  return {
    hacimM3,
    ach: kural.ach,
    hamDebiM3h,
    minimumM3h: kural.minimumM3h,
    tasarimDebiM3h,
    minimumUygulandi: kural.minimumM3h > hamDebiM3h,
  }
}

/**
 * Sistem direnç katsayısı: kanal sistemi P = k·Q² eğrisidir.
 *
 * k, tasarım debisindeki GERÇEK basınç kaybından türetilir — `ductPressure` modülü
 * Colebrook-White ile çözer (sabit Pa tahmini DEĞİL). Çap, sistemin en belirleyici
 * değişkenidir: kayıp yaklaşık D⁻⁵ ile büyür, yani 100 mm kanal 200 mm'nin ~30 katı
 * direnç gösterir. O yüzden k, aday fanın KENDİ çapıyla hesaplanır — kullanıcı çapını
 * biliyorsa onunla, bilmiyorsa fan hangi çapa uygunsa onunla.
 */
export function sistemKatsayisi(
  tasarimDebiM3h: number,
  guzergah: KanalGuzergahi,
  capMm: number,
  malzeme: KanalMalzemesi,
): number {
  if (tasarimDebiM3h <= 0 || capMm <= 0) return 0
  const geo = GUZERGAH_GEOMETRISI[guzergah]
  const dokum = kanalBasincKaybi(tasarimDebiM3h, {
    uzunlukM: geo.uzunlukM,
    capMm,
    malzeme,
    dirsek90: geo.dirsek90,
    dirsek45: geo.dirsek45,
  })
  return dokum.toplamPa / (tasarimDebiM3h * tasarimDebiM3h)
}

/**
 * ÇALIŞMA NOKTASI — fan eğrisi ile sistem eğrisinin kesişimi.
 *
 * Bu fonksiyon seçimin kalbidir. Katalogdaki "maks. debi" serbest üflemede (0 Pa)
 * ölçülür; gerçek tesisatta fan o debiyi ASLA vermez. Kesişimi hesaplamadan yapılan
 * seçim, fanı olduğundan güçlü sanar ve yetersiz model önerir.
 *
 * Fan eğrisi noktalar arasında DOĞRUSAL kabul edilir (elimizde 3–6 nokta var, daha
 * yüksek dereceli uydurma bu veriyle sahte hassasiyet olurdu). Her segmentte
 * k·Q² = P_fan(Q) denklemi ikinci dereceden çözülür.
 *
 * @returns kesişim, ya da eğri kullanılamıyorsa null
 */
export function calismaNoktasi(egri: PQNoktasi[], k: number): PQNoktasi | null {
  if (egri.length < 2) return null

  // Direnç yoksa fan serbest üfler: eğrinin en yüksek debili noktası.
  if (k <= 0) {
    const son = egri[egri.length - 1]
    return { debiM3h: son.debiM3h, basincPa: son.basincPa }
  }

  for (let i = 0; i < egri.length - 1; i++) {
    const a = egri[i]
    const b = egri[i + 1]
    const dQ = b.debiM3h - a.debiM3h
    if (dQ <= 0) continue

    // Segmentte fan eğrisi: P = egim·(Q - a.Q) + a.P
    const egim = (b.basincPa - a.basincPa) / dQ

    // Kesişim: k·Q² = egim·(Q - a.Q) + a.P  →  k·Q² - egim·Q - (a.P - egim·a.Q) = 0
    const c = a.basincPa - egim * a.debiM3h
    const disk = egim * egim + 4 * k * c
    if (disk < 0) continue

    const kok = (egim + Math.sqrt(disk)) / (2 * k)
    if (kok >= a.debiM3h - 1e-9 && kok <= b.debiM3h + 1e-9) {
      const q = Math.min(Math.max(kok, a.debiM3h), b.debiM3h)
      return { debiM3h: q, basincPa: k * q * q }
    }
  }

  // Sistem eğrisi fanın tamamen üstünde kaldı: fan bu tesisatta hiç hava basamıyor.
  return { debiM3h: 0, basincPa: 0 }
}

/** Çapların uyumlu sayılacağı tolerans (mm). Katalog çapları ayrık (100/125/150…). */
const CAP_TOLERANSI_MM = 1

/**
 * Bir adayı değerlendirir: çalışma noktası, karşılama oranı, puan, elenme sebebi.
 *
 * PUANLAMA GEREKÇESİ:
 *  · Karşılama oranı 1.0–1.3 arası İDEAL. 1.0 altı zaten elenir; 1.3 üstü "gereğinden
 *    büyük" demektir — fazla güç, fazla ses, fazla para. O yüzden ceza alır, ödül değil.
 *  · Ses puanı katalog aralığına göre normalize edilir (25–55 dB(A) tipik aralık).
 *  · Verim = çalışma debisi başına watt; düşük olan iyi.
 */
export function degerlendir(
  aday: FanAdayi,
  hesap: DebiHesabi,
  girdi: SecimGirdisi,
): AdaySonucu {
  // Sistem direnci ADAY BAZLI: kanal çapı kullanıcıdan biliniyorsa o, değilse fanın
  // kendi çapı. Kayıp ~D⁻⁵ ile değiştiği için tek bir "ortalama çap" varsaymak,
  // küçük fanları haksız yere güçlü, büyükleri haksız yere zayıf gösterirdi.
  const capMm = girdi.kanalCapiMm ?? aday.capMm ?? 0
  const k = sistemKatsayisi(hesap.tasarimDebiM3h, girdi.guzergah, capMm, girdi.malzeme)

  const egri = parsePQCurve(aday.pqCurveHam)
  const nokta = calismaNoktasi(egri, k)

  if (!nokta) {
    return {
      aday,
      calismaDebisiM3h: 0,
      calismaBasinciPa: 0,
      karsilamaOrani: 0,
      puan: 0,
      elenmeSebebi: 'veri-yok',
    }
  }

  const karsilamaOrani =
    hesap.tasarimDebiM3h > 0 ? nokta.debiM3h / hesap.tasarimDebiM3h : 0

  let elenmeSebebi: ElenmeSebebi | null = null
  if (
    girdi.kanalCapiMm != null &&
    aday.capMm != null &&
    Math.abs(aday.capMm - girdi.kanalCapiMm) > CAP_TOLERANSI_MM
  ) {
    elenmeSebebi = 'cap-uyusmuyor'
  } else if (karsilamaOrani < 1) {
    elenmeSebebi = 'debi-yetersiz'
  }

  // --- Puan bileşenleri (her biri 0-1) ---

  // Debi uygunluğu: 1.0–1.3 tam puan, üstü kademeli düşer.
  let debiPuani: number
  if (karsilamaOrani < 1) debiPuani = 0
  else if (karsilamaOrani <= 1.3) debiPuani = 1
  else debiPuani = Math.max(0, 1 - (karsilamaOrani - 1.3) / 1.7)

  // Ses: 25 dB(A) ve altı tam puan, 55 ve üstü sıfır.
  const sesPuani =
    aday.sesDbA == null ? 0.5 : Math.min(1, Math.max(0, (55 - aday.sesDbA) / 30))

  // Verim: W/(m³/h). 0.05 ve altı tam puan, 0.5 ve üstü sıfır.
  const ozgulGuc =
    aday.gucW != null && nokta.debiM3h > 0 ? aday.gucW / nokta.debiM3h : null
  const verimPuani =
    ozgulGuc == null ? 0.5 : Math.min(1, Math.max(0, (0.5 - ozgulGuc) / 0.45))

  const sesAgirligi = SESSIZLIK_AGIRLIGI[girdi.sessizlik]
  const kalan = 1 - sesAgirligi
  // Kalan ağırlık debi ve verim arasında 2:1 bölünür — debi uygunluğu daha belirleyici.
  const puan =
    100 * (sesAgirligi * sesPuani + kalan * ((2 / 3) * debiPuani + (1 / 3) * verimPuani))

  return {
    aday,
    calismaDebisiM3h: nokta.debiM3h,
    calismaBasinciPa: nokta.basincPa,
    karsilamaOrani,
    puan: elenmeSebebi ? 0 : puan,
    elenmeSebebi,
  }
}

/**
 * Sihirbazın tek giriş noktası: girdi + adaylar → sıralı öneriler.
 * Üç ayrı öneri döner çünkü kullanıcının önceliği tek boyutlu değildir.
 */
export function secimYap(adaylar: FanAdayi[], girdi: SecimGirdisi): SecimSonucu {
  const hesap = hesaplaTasarimDebisi(girdi.mahal, girdi.alanM2, girdi.tavanYuksekligiM)

  // Rapor için temsilî sistem basıncı: kullanıcının bildiği çap varsa onunla, yoksa
  // 150 mm referansıyla. Adayların kendi k'ları `degerlendir` içinde ayrıca hesaplanır;
  // bu sayı yalnız kullanıcıya "sisteminiz kabaca şu kadar direnç gösteriyor" demek için.
  const referansCap = girdi.kanalCapiMm ?? 150
  const geo = GUZERGAH_GEOMETRISI[girdi.guzergah]
  const sistemBasinciPa = kanalBasincKaybi(hesap.tasarimDebiM3h, {
    uzunlukM: geo.uzunlukM,
    capMm: referansCap,
    malzeme: girdi.malzeme,
    dirsek90: geo.dirsek90,
    dirsek45: geo.dirsek45,
  }).toplamPa

  const tumu = adaylar.map((a) => degerlendir(a, hesap, girdi))
  const uygunlar = tumu
    .filter((s) => s.elenmeSebebi === null)
    .sort((a, b) => b.puan - a.puan)
  const elenenler = tumu.filter((s) => s.elenmeSebebi !== null)

  const sesliOlanlar = uygunlar.filter((s) => s.aday.sesDbA != null)
  const enSessiz =
    sesliOlanlar.length > 0
      ? sesliOlanlar.reduce((en, s) =>
          (s.aday.sesDbA as number) < (en.aday.sesDbA as number) ? s : en,
        )
      : null

  const guclu = uygunlar.filter((s) => s.aday.gucW != null && s.calismaDebisiM3h > 0)
  const enVerimli =
    guclu.length > 0
      ? guclu.reduce((en, s) => {
          const suanki = (s.aday.gucW as number) / s.calismaDebisiM3h
          const mevcut = (en.aday.gucW as number) / en.calismaDebisiM3h
          return suanki < mevcut ? s : en
        })
      : null

  return {
    hesap,
    sistemBasinciPa,
    uygunlar,
    elenenler,
    enUygun: uygunlar[0] ?? null,
    enSessiz,
    enVerimli,
  }
}
