/**
 * ÜRÜN ASİSTANI — TANIMLI HATA YOLLARI (URN-171, adım 1).
 *
 * Cetvel: docs/plans/urun-asistani-kapsam-guvenlik-notu-2026-11-15.md §4 madde 8 ve 9.
 *
 * Kural: her hata yolunun AYRI mesajı ve AYRI durum kodu vardır; "hata" sessizce boş liste olmaz.
 *  - süzgeç sıfır satır döndürdü → `SUZGEC_BOS` (sabit mesaj);
 *  - süzgeç çok geniş → ilk `MAKS_URUN` satır + "daralt" mesajı (`satirlariSinirla`, şablon basıcı ekler);
 *  - model geçersiz JSON / şema dışı / bilinmeyen sınıf → `MODEL_CIKTISI`;
 *  - sağlayıcı kesintisi ya da zaman aşımı → `SAGLAYICI`;
 *  - sayaç ölçülemedi ya da cevap boş → `SAYAC_OLCULEMEDI`: FAIL-CLOSED (503 + arama kutusuna geri düşüş).
 *
 * Sayaç emsali `supabase/functions/_shared/rate_limit.ts` boş cevapta `allowed: true` üretir (fail-open):
 * `bump_rate_limit` satır döndürmezse "izin" sayılır. Bu asistan için kabul edilmez; `sayacCevabiniCoz`
 * boş, bozuk ya da tipi yanlış cevabı `olculemedi` yapar. Saf modül: ağ ve saat yok.
 */
import type { Ceviri } from './ceviri'
import type { NiyetSinifi, SemaHatasi } from './semalar'

/** Bir cevapta gösterilen ve modele giden en çok ürün sayısı ("çok geniş" eşiği). */
export const MAKS_URUN = 20

export type SinirliListe<T> = Readonly<{ satirlar: T[]; toplam: number; kirpildi: boolean }>

/** Listeyi `maks` ile sınırlar; kırpıldıysa `kirpildi` doğrudur (şablon "daralt" mesajını buna göre ekler). */
export function satirlariSinirla<T>(satirlar: readonly T[], maks: number = MAKS_URUN): SinirliListe<T> {
  const sinir = Number.isInteger(maks) && maks > 0 ? maks : MAKS_URUN
  return {
    satirlar: satirlar.slice(0, sinir),
    toplam: satirlar.length,
    kirpildi: satirlar.length > sinir,
  }
}

export type AsistanHata = 'SUZGEC_BOS' | 'MODEL_CIKTISI' | 'SAGLAYICI' | 'SAYAC_OLCULEMEDI' | 'ISTEK_SINIRI'

export type HataBilgisi = Readonly<{
  /** Uç noktanın döneceği HTTP durumu. */
  http: number
  /** Sözlük anahtarı (`asistan.hata.*`). */
  anahtar: string
  /** Arayüz mevcut arama kutusuna geri düşmeli mi? */
  aramaKutusunaDus: boolean
}>

export const HATA_BILGISI: Readonly<Record<AsistanHata, HataBilgisi>> = {
  SUZGEC_BOS: { http: 200, anahtar: 'asistan.hata.suzgecBos', aramaKutusunaDus: false },
  MODEL_CIKTISI: { http: 502, anahtar: 'asistan.hata.modelCiktisi', aramaKutusunaDus: false },
  SAGLAYICI: { http: 503, anahtar: 'asistan.hata.saglayici', aramaKutusunaDus: true },
  SAYAC_OLCULEMEDI: { http: 503, anahtar: 'asistan.hata.sayac', aramaKutusunaDus: true },
  ISTEK_SINIRI: { http: 429, anahtar: 'asistan.hata.istekSiniri', aramaKutusunaDus: false },
}

/** Her şema hatası modelin kullanılamaz çıktısıdır; kayıt tipi, yeni `SemaHatasi` eklenince derleme hatası verir. */
const SEMA_HATASI_ESLEMESI: Readonly<Record<SemaHatasi, AsistanHata>> = {
  BOS_CIKTI: 'MODEL_CIKTISI',
  COK_UZUN: 'MODEL_CIKTISI',
  GECERSIZ_JSON: 'MODEL_CIKTISI',
  BILINMEYEN_SINIF: 'MODEL_CIKTISI',
  SEMA_DISI: 'MODEL_CIKTISI',
}

export function semaHatasiniEsle(hata: SemaHatasi): AsistanHata {
  return SEMA_HATASI_ESLEMESI[hata]
}

export type HataCevabi = Readonly<{ kod: AsistanHata; http: number; metin: string; aramaKutusunaDus: boolean }>

export function hataCevabi(kod: AsistanHata, cevir: Ceviri): HataCevabi {
  const bilgi = HATA_BILGISI[kod]
  return { kod, http: bilgi.http, metin: cevir(bilgi.anahtar), aramaKutusunaDus: bilgi.aramaKutusunaDus }
}

/** `suz` dışındaki niyet sınıflarının sabit yönlendirme anahtarları. */
const YONLENDIRME_ANAHTARLARI: Readonly<Record<Exclude<NiyetSinifi, 'suz'>, string>> = {
  hesap: 'asistan.yonlendirme.hesap',
  konu_disi: 'asistan.yonlendirme.konuDisi',
  kotu_niyet: 'asistan.yonlendirme.kotuNiyet',
}

export function yonlendirmeMetni(sinif: Exclude<NiyetSinifi, 'suz'>, cevir: Ceviri): string {
  return cevir(YONLENDIRME_ANAHTARLARI[sinif])
}

/** Sayaç sonucu: üç durumlu ve KAPALI. `olculemedi` ASLA "izin" olarak okunmaz. */
export type SayacSonucu =
  | Readonly<{ durum: 'izin'; kalan: number }>
  | Readonly<{ durum: 'sinir' }>
  | Readonly<{ durum: 'olculemedi'; sebep: 'BOS_CEVAP' | 'BICIM' | 'HATA' }>

/**
 * `bump_rate_limit` RPC'sinin HAM cevabını (`[{ allowed, remaining, reset_at }]` ya da tek satır nesnesi) çözer.
 * Boş dizi, null, `allowed` mantıksal değilse, `remaining` sayı değilse → `olculemedi` (fail-closed).
 */
export function sayacCevabiniCoz(ham: unknown): SayacSonucu {
  if (ham === null || ham === undefined) return { durum: 'olculemedi', sebep: 'BOS_CEVAP' }
  const satir: unknown = Array.isArray(ham) ? ham[0] : ham
  if (satir === null || satir === undefined) return { durum: 'olculemedi', sebep: 'BOS_CEVAP' }
  if (typeof satir !== 'object') return { durum: 'olculemedi', sebep: 'BICIM' }
  const kayit = satir as Record<string, unknown>
  const izinli = kayit['allowed']
  const kalanHam = kayit['remaining']
  if (typeof izinli !== 'boolean') return { durum: 'olculemedi', sebep: 'BICIM' }
  if (typeof kalanHam !== 'number' || !Number.isFinite(kalanHam)) return { durum: 'olculemedi', sebep: 'BICIM' }
  return izinli ? { durum: 'izin', kalan: Math.max(0, kalanHam) } : { durum: 'sinir' }
}

/** Sayaç okumasını sarar: fırlatma (ağ, zaman aşımı, 5xx) da `olculemedi` olur, hiçbir yol "izin"e düşmez. */
export async function sayacOku(oku: () => Promise<unknown>): Promise<SayacSonucu> {
  try {
    return sayacCevabiniCoz(await oku())
  } catch {
    return { durum: 'olculemedi', sebep: 'HATA' }
  }
}

/** Sayaç sonucunu uç noktanın kararına çevirir: yalnız `izin` devam ettirir. */
export function sayacKarari(sonuc: SayacSonucu): { devam: true } | { devam: false; hata: AsistanHata } {
  switch (sonuc.durum) {
    case 'izin':
      return { devam: true }
    case 'sinir':
      return { devam: false, hata: 'ISTEK_SINIRI' }
    case 'olculemedi':
      return { devam: false, hata: 'SAYAC_OLCULEMEDI' }
  }
}
