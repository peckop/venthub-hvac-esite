/**
 * ÜRÜN ASİSTANI — ŞABLON BASICI (URN-171, adım 1).
 *
 * Cetvel: docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md §2, §3 (YOL A) ve §4 madde 1.
 *
 * SAYIYI, BİRİMİ, SES ETİKETİNİ VE BAĞLANTIYI MODEL YAZMAZ; SUNUCU BURADA SATIRDAN BASAR. Girdi iki şeydir:
 * veritabanından kurulmuş izin listeli satırlar ve (varsa) şemadan geçmiş karşılaştırma başvuruları. Çıktı DÜZ
 * METİNDİR (HTML değil): ürün adı ya da teknik değer içinde işaretleme olsa bile çalışmaz.
 *
 * Üretilen metinde şu kurallar vardır ve kapıyla (`asistan-cekirdek.test.ts`) ölçülür:
 *  - yargı sözcüğü yoktur ("uygun", "en iyi" vb.): asistan eşleştirir, seçim yargısı vermez;
 *  - debi "serbest üfleme (0 Pa) en yüksek debi" etiketiyle basılır; `nominal_delivery_m3h` başka çalışma noktasıdır
 *    ve ayrı etiketle basılır, ikisi birbirinin yerine geçmez;
 *  - `noise_level_db_a` ölçüm mesafesi taşımaz: sayısı BASILMAZ, "karşılaştırılamaz (ölçüm koşulu yok)" yazılır;
 *  - `noise_lpa_3m_db` yalnız "3 m" koşuluyla basılır (`sesEtiketi.ts` kuralı: koşulsuz ses sayısı yazılmaz);
 *  - farklı (ya da bilinmeyen) üreticilerin ses değerleri sıralanmaz, sıralama istense bile; yan yana basılırsa not düşülür;
 *  - değer yoksa "bu üründe veri yok" yazılır, satır sessizce atılmaz;
 *  - bağlantı `adresUret` ile kurulur (dil önekini ve bölüm adını o verir; elle birleştirme yok).
 *
 * Görünen metin sözlükten gelir (`asistan.*`, `cevir` işleviyle); sayı yazımı dile göre biçimlenir (TR 2.000 ve
 * 0,18; EN 2,000 ve 0.18) ve değer ONDALIK BASAMAĞI DEĞİŞTİRİLMEDEN yazılır (yuvarlama yok).
 */
import type { SesKosulu } from '@/data/sessizFan/sesEtiketi'
import { type AdresDili, adresUret } from '@/utils/adresUret'

import type { Ceviri } from './ceviri'
import { hataCevabi, MAKS_URUN, satirlariSinirla } from './hataYollari'
import { type AsistanSatiri, IZINLI_SPEC_ANAHTARLARI, type IzinliSpecAnahtari } from './izinListesi'
import { type GerekceKodu, type Karsilastirma, MAKS_BASVURU } from './semalar'

/** `noise_lpa_3m_db`'nin ölçüm mesafesi anahtar adında yazılıdır; tip, `sesEtiketi.ts`'in zorunlu mesafesine bağlıdır. */
const SES_MESAFESI_M: SesKosulu['mesafeM'] = 3

type AlanBilgisi = Readonly<{ etiket: string; birim: string }>

/** Her izinli alanın etiket anahtarı ve birimi. `Record<IzinliSpecAnahtari>`: yeni izinli anahtar eklenince buraya da eklemek ZORUNLUDUR. */
const ALANLAR: Readonly<Record<IzinliSpecAnahtari, AlanBilgisi>> = {
  max_delivery_m3h: { etiket: 'asistan.alan.maxDeliveryM3h', birim: 'm³/h' },
  nominal_delivery_m3h: { etiket: 'asistan.alan.nominalDeliveryM3h', birim: 'm³/h' },
  diameter_mm: { etiket: 'asistan.alan.diameterMm', birim: 'mm' },
  max_static_pressure_pa: { etiket: 'asistan.alan.maxStaticPressurePa', birim: 'Pa' },
  noise_level_db_a: { etiket: 'asistan.alan.noiseLevelDbA', birim: 'dB(A)' },
  noise_lpa_3m_db: { etiket: 'asistan.alan.noiseLpa3mDb', birim: 'dB(A)' },
  ip_rating: { etiket: 'asistan.alan.ipRating', birim: '' },
  atex_zone: { etiket: 'asistan.alan.atexZone', birim: '' },
}

type Siralama = Readonly<{ alan: IzinliSpecAnahtari; yon: 'azalan' | 'artan' | null }>

/** Gerekçe kodunun hangi alanı hangi yönde sıraladığı. `yon: null` = yalnız bilgi, sıralama yapılmaz (metin alanları). */
const SIRALAMA: Readonly<Record<GerekceKodu, Siralama>> = {
  EN_YUKSEK_DEBI: { alan: 'max_delivery_m3h', yon: 'azalan' },
  EN_DUSUK_SES: { alan: 'noise_lpa_3m_db', yon: 'artan' },
  EN_YUKSEK_BASINC: { alan: 'max_static_pressure_pa', yon: 'azalan' },
  EN_KUCUK_CAP: { alan: 'diameter_mm', yon: 'artan' },
  IP_KORUMA: { alan: 'ip_rating', yon: null },
  ATEX_BOLGESI: { alan: 'atex_zone', yon: null },
}

const GUID_DESENI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Sayıyı dile göre yazar ve ondalık basamağını DEĞİŞTİRMEZ: 2000 → "2.000" (TR) / "2,000" (EN), 0.18 → "0,18" / "0.18".
 * Basamak sayısı değerin kendi yazımından okunur; üstel yazım ya da 20'den çok basamak çıplak yazıma düşer.
 */
export function sayiMetni(n: number, dil: AdresDili): string {
  const ham = String(n)
  if (/e/i.test(ham)) return ham
  const nokta = ham.indexOf('.')
  const ondalik = nokta < 0 ? 0 : ham.length - nokta - 1
  if (ondalik > 20) return ham
  return new Intl.NumberFormat(dil === 'tr' ? 'tr-TR' : 'en-US', {
    minimumFractionDigits: ondalik,
    maximumFractionDigits: ondalik,
  }).format(n)
}

/** Ürün sayfası bağlantısı; `adresUret`'ten gelir. UUID gibi sayfası olmayan slug'da ve üretici hata verirse null (bağlantı satırı basılmaz). */
function baglantiMetni(slug: string, dil: AdresDili): string | null {
  if (GUID_DESENI.test(slug)) return null
  try {
    return String(adresUret({ tur: 'aile', slug }, dil))
  } catch {
    return null
  }
}

/** Bir satırın tek alanının basılacak değeri. Sayı YALNIZ satırdan gelir. */
function degerMetni(satir: AsistanSatiri, alan: IzinliSpecAnahtari, dil: AdresDili, cevir: Ceviri): string {
  const deger = satir.ozellikler[alan]
  if (deger === undefined) return cevir('asistan.sablon.veriYok')
  // Ölçüm mesafesi bilinmeyen ses: sayı basılmaz (koşulsuz ses sayısı yazılmaz).
  if (alan === 'noise_level_db_a') return cevir('asistan.sablon.sesKosulsuz')
  if (typeof deger === 'string') return deger
  const sayi = `${sayiMetni(deger, dil)} ${ALANLAR[alan].birim}`
  return alan === 'noise_lpa_3m_db' ? `${sayi} · ${SES_MESAFESI_M} m` : sayi
}

function satirBloku(satir: AsistanSatiri, dil: AdresDili, cevir: Ceviri): string {
  const alanlar = IZINLI_SPEC_ANAHTARLARI.filter((a) => satir.ozellikler[a] !== undefined).map(
    (a) => `${cevir(ALANLAR[a].etiket)}: ${degerMetni(satir, a, dil, cevir)}`,
  )
  const baglanti = baglantiMetni(satir.slug, dil)
  return [`• ${satir.ad}`, alanlar.length > 0 ? `  ${alanlar.join('; ')}` : null, baglanti ? `  ${baglanti}` : null]
    .filter((s): s is string => s !== null)
    .join('\n')
}

function markaAnahtari(marka: string | null): string | null {
  return marka === null ? null : marka.trim().toLocaleLowerCase('tr-TR')
}

/** Değeri olan satırların hepsi AYNI ve BİLİNEN markadansa doğrudur (marka bilinmiyorsa karşılaştırılabilir sayılmaz). */
function ayniMarkaMi(satirlar: readonly AsistanSatiri[]): boolean {
  const anahtarlar = satirlar.map((s) => markaAnahtari(s.marka))
  if (anahtarlar.some((a) => a === null)) return false
  return new Set(anahtarlar).size <= 1
}

function karsilastirmaBloku(
  satirlar: readonly AsistanSatiri[],
  karsilastirma: Karsilastirma,
  dil: AdresDili,
  cevir: Ceviri,
): string | null {
  const kimlikle = new Map(satirlar.map((s) => [s.id.toLowerCase(), s]))
  const gorulen = new Set<string>()
  const gruplar = new Map<IzinliSpecAnahtari, AsistanSatiri[]>()
  for (const basvuru of karsilastirma.basvurular.slice(0, MAKS_BASVURU)) {
    const kimlik = basvuru.urunId.toLowerCase()
    const satir = kimlikle.get(kimlik)
    if (satir === undefined) continue // satırlarda olmayan ürüne başvuru atılır
    const anahtar = `${kimlik}|${basvuru.alan}`
    if (gorulen.has(anahtar)) continue
    gorulen.add(anahtar)
    const liste = gruplar.get(basvuru.alan) ?? []
    liste.push(satir)
    gruplar.set(basvuru.alan, liste)
  }
  if (gruplar.size === 0) return null

  const bloklar: string[] = [cevir('asistan.sablon.karsilastirmaBasligi')]
  for (const [alan, liste] of gruplar) {
    const degerliler = liste.filter((s) => s.ozellikler[alan] !== undefined)
    const sesKarsilastirmasi = alan === 'noise_lpa_3m_db'
    const markalarFarkli = sesKarsilastirmasi && degerliler.length >= 2 && !ayniMarkaMi(degerliler)
    const olcut = karsilastirma.gerekceKodlari.map((k) => SIRALAMA[k]).find((s) => s.alan === alan && s.yon !== null)
    // Farklı (ya da bilinmeyen) üreticilerin ses değeri sıralanmaz; gerekçe istese bile.
    const yon = markalarFarkli ? null : (olcut?.yon ?? null)
    const gosterilecek = yon !== null ? siralaDegere(liste, alan, yon) : liste

    bloklar.push(`${cevir(ALANLAR[alan].etiket)}:`)
    for (const satir of gosterilecek) bloklar.push(`• ${satir.ad}: ${degerMetni(satir, alan, dil, cevir)}`)
    if (yon !== null) bloklar.push(cevir(yon === 'azalan' ? 'asistan.sablon.siraAzalan' : 'asistan.sablon.siraArtan'))
    if (markalarFarkli) bloklar.push(cevir('asistan.sablon.sesFarkliUretici'))
  }
  return bloklar.join('\n')
}

/** Kararlı sıralama; değeri olmayan satırlar sona gider. */
function siralaDegere(
  liste: readonly AsistanSatiri[],
  alan: IzinliSpecAnahtari,
  yon: 'azalan' | 'artan',
): AsistanSatiri[] {
  const sayi = (s: AsistanSatiri): number | null => {
    const d = s.ozellikler[alan]
    return typeof d === 'number' ? d : null
  }
  return liste.slice().sort((a, b) => {
    const x = sayi(a)
    const y = sayi(b)
    if (x === null && y === null) return 0
    if (x === null) return 1
    if (y === null) return -1
    return yon === 'azalan' ? y - x : x - y
  })
}

export type CevapGirdisi = Readonly<{
  satirlar: readonly AsistanSatiri[]
  karsilastirma?: Karsilastirma | null
  dil: AdresDili
  cevir: Ceviri
}>

export type CevapMetni = Readonly<{
  /** Düz metin. `durum: 'bos'` iken sabit "eşleşen ürün yok" mesajıdır. */
  metin: string
  durum: 'tamam' | 'bos'
  gosterilen: number
  toplam: number
  kirpildi: boolean
}>

/**
 * Cevap metnini üretir: satır yoksa sabit mesaj, `MAKS_URUN`'den çoksa ilk `MAKS_URUN` + "daralt" mesajı;
 * karşılaştırma varsa liste sonuna eklenir. Başvurulan ürün satırlarda yoksa o başvuru atılır.
 */
export function cevapMetniUret(girdi: CevapGirdisi): CevapMetni {
  const { satirlar, karsilastirma, dil, cevir } = girdi
  const sinirli = satirlariSinirla(satirlar, MAKS_URUN)
  if (sinirli.toplam === 0) {
    return { metin: hataCevabi('SUZGEC_BOS', cevir).metin, durum: 'bos', gosterilen: 0, toplam: 0, kirpildi: false }
  }
  const parcalar: string[] = sinirli.satirlar.map((s) => satirBloku(s, dil, cevir))
  if (sinirli.kirpildi) parcalar.push(cevir('asistan.sablon.fazlaSonuc', { adet: MAKS_URUN }))
  if (karsilastirma) {
    const blok = karsilastirmaBloku(sinirli.satirlar, karsilastirma, dil, cevir)
    if (blok !== null) parcalar.push(blok)
  }
  return {
    metin: parcalar.join('\n\n'),
    durum: 'tamam',
    gosterilen: sinirli.satirlar.length,
    toplam: sinirli.toplam,
    kirpildi: sinirli.kirpildi,
  }
}
