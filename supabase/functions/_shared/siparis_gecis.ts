// Çağıran sınıfı: yardımcı modül (uç değil) — sipariş durumu geçişlerinin SUNUCU tarafı kararları.
//
// NİÇİN VAR (ALT-131 · 2026-11-03)
//
// `venthub_orders.status` ve `payment_status` artık VERİTABANI katmanında monotondur
// (`20261103120000_venthub_orders_monoton_durum.sql`, tetik `trg_orders_monoton_durum`).
// Tetik ihlalde SQLSTATE `VH409` ile düşer ve PostgREST bunu 400 + `code: VH409` olarak
// döndürür. Yazıcı fonksiyonların tetiğe çarpıp 500 vermesi yerine, YAZMADAN ÖNCE karar
// vermesi ve net hata kodu dönmesi için bu modül var.
//
// Tablolar migration'daki iki izin tablosunun AYNISIDIR; kopya olması bilinçli (Deno uç
// fonksiyonu SQL'i okuyamaz). İki kopyanın ayrışmasını INV-SIPARIS-MONOTON-1 testi yakalar.

/** Sipariş yaşam döngüsü: anahtar = mevcut durum, değer = yazılabilecek sonraki durumlar. */
export const SIPARIS_DURUM_IZIN: Readonly<Record<string, readonly string[]>> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

/** Ödeme durumu: `NULL` 'pending' sayılır. */
export const ODEME_DURUM_IZIN: Readonly<Record<string, readonly string[]>> = {
  pending: ['paid', 'failed'],
  failed: ['paid'],
  paid: ['partial_refunded', 'refunded'],
  partial_refunded: ['refunded'],
  refunded: [],
}

const kendi = (o: object, k: string): boolean => Object.prototype.hasOwnProperty.call(o, k)

/** Aynı değer her zaman serbesttir; bilinmeyen değer kilitlidir. */
export function siparisGecisiIzinliMi(mevcut: string, sonraki: string): boolean {
  if (mevcut === sonraki) return kendi(SIPARIS_DURUM_IZIN, mevcut)
  return kendi(SIPARIS_DURUM_IZIN, mevcut) && SIPARIS_DURUM_IZIN[mevcut].includes(sonraki)
}

export function odemeGecisiIzinliMi(mevcut: string | null, sonraki: string | null): boolean {
  const a = mevcut ?? 'pending'
  const b = sonraki ?? 'pending'
  if (a === b) return kendi(ODEME_DURUM_IZIN, a)
  return kendi(ODEME_DURUM_IZIN, a) && ODEME_DURUM_IZIN[a].includes(b)
}

/**
 * Veritabanı monotonluk tetiği reddetti mi? PostgREST gövdesi `code: "VH409"` taşır;
 * mesaj öneki ikinci kanıttır (kod alanı bir proxy tarafından silinirse).
 */
export function monotonIhlaliMi(bodyText: string): boolean {
  return bodyText.includes('VH409') || bodyText.includes('ALT131_MONOTON')
}

export type KargoKarari =
  | { islem: 'ilk_kargo' }
  | { islem: 'takip_guncelle' }
  | { islem: 'takip_temizle' }
  | { islem: 'reddet'; kod: string; http: number; mesaj: string }

export interface KargoSatiri {
  status: string | null
  shipped_at: string | null
  /** İlk kargo için 'paid' şart (ALT-131 devam); alan verilmezse ödenmemiş sayılır. */
  payment_status?: string | null
}

/**
 * Kargolama (carrier + takip no geldi) kararı.
 *
 *  · confirmed/processing + shipped_at boş → ilk kargo (status shipped'a taşınır).
 *  · shipped_at dolu ya da status shipped/delivered → yalnız takip bilgisi güncellenir,
 *    durum DEĞİŞMEZ (teslim edilmiş sipariş geri sarılmaz).
 *  · pending (ödenmemiş) ve cancelled → reddedilir: kargoya verilemez.
 */
export function kargolamaKarari(satir: KargoSatiri): KargoKarari {
  const durum = satir.status ?? ''
  if (durum === 'pending' || durum === 'cancelled') {
    return {
      islem: 'reddet',
      kod: 'ORDER_NOT_SHIPPABLE',
      http: 409,
      mesaj: `Sipariş durumu '${durum}' iken kargoya verilemez`,
    }
  }
  if (satir.shipped_at !== null || durum === 'shipped' || durum === 'delivered') {
    return { islem: 'takip_guncelle' }
  }
  if (durum === 'confirmed' || durum === 'processing') {
    // Ödemesi 'paid' olmayan sipariş kargoya verilemez (pending/cancelled kontrolünden AYRI kod).
    if (satir.payment_status !== 'paid') {
      return {
        islem: 'reddet',
        kod: 'ORDER_NOT_PAID',
        http: 409,
        mesaj: `Ödeme durumu '${satir.payment_status ?? 'pending'}' iken kargoya verilemez`,
      }
    }
    return { islem: 'ilk_kargo' }
  }
  return {
    islem: 'reddet',
    kod: 'ORDER_STATUS_UNKNOWN',
    http: 409,
    mesaj: `Bilinmeyen sipariş durumu '${durum}'`,
  }
}

/**
 * Kargo iptali kararı. Sipariş durumu GERİ SARILMAZ (kural 11): iptal yalnız takip bilgisini
 * (taşıyıcı, takip no, takip bağlantısı) temizler; `status` ve `shipped_at` olduğu gibi kalır.
 * Teslim edilmiş siparişin kargosu iptal edilemez. Kargolanmamış siparişte iptal edilecek
 * bir şey yoktur.
 */
export function kargoIptaliKarari(satir: KargoSatiri): KargoKarari {
  const durum = satir.status ?? ''
  if (durum === 'delivered') {
    return {
      islem: 'reddet',
      kod: 'DELIVERED_SHIPMENT_CANCEL_FORBIDDEN',
      http: 409,
      mesaj: 'Teslim edilmiş siparişin kargosu iptal edilemez',
    }
  }
  if (durum === 'shipped') return { islem: 'takip_temizle' }
  return {
    islem: 'reddet',
    kod: 'ORDER_NOT_SHIPPED',
    http: 409,
    mesaj: `Sipariş durumu '${durum}'; iptal edilecek kargo yok`,
  }
}
