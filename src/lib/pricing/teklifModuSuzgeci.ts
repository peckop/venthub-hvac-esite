import { quoteModeHesapla } from './quoteMode'

/**
 * TEKLİF MODU SÜZGECİ — gerçek fiyat, teklif modunda 'use client' sınırını GEÇMEZ (URN-142).
 *
 * NİÇİN VAR (canlı ölçüm, 2026-10-25): `quoteModeHesapla` görsel çizimi ve JSON-LD'yi koruyordu ama
 * sayfa verisi (RSC yükü, `self.__next_f`) ham fiyatlı varyantı ve `min_price`'ı istemci bileşenlerine
 * prop olarak taşıyordu. 47 aile adresinin 36'sında toplam 347 `"price":<sayı>`; çizim gizliyordu, VERİ
 * taşınıyordu (kaynak-görüntüle ve önbellekte kalıcı).
 *
 * KURAL: karar `quoteModeHesapla`'dan gelir (tek hüküm); mod BİLİNMİYORSA (kategori yok) teklif modudur
 * ve fiyat çıkarılır. Süzgeç sunucuda, veri istemciye verilmeden ÖNCE uygulanır. JSON-LD süzülmemiş
 * veriyle kendi kararını verir (buildProductGroupJsonLd teklif kipinde zaten fiyat yazmaz).
 *
 * Kapı: `INV-FIYAT-SIZINTI-3` (RSC yükü yüzeyi).
 */

/** true = bu kategori bağlamında fiyat istemciye gitmez. Fiyatın kendisine bakılmaz, yalnız mod. */
export function teklifModundaMi(kategori: { metadata?: unknown } | null | undefined): boolean {
  // Gösterilebilir geçerli bir fiyat varsayımıyla sorulur: yalnız (1) mod bilinmiyor ve (2) hide_price
  // dalları sonucu belirler; (3) fiyat dalı varyanta özgüdür ve süzgeç kararı değildir.
  return quoteModeHesapla(kategori, { price: 1 })
}

/** Varyantların `price` alanını teklif modunda null'lar; satış kipinde aynı diziyi döner. */
export function varyantFiyatiniSuz<T extends { price?: number | string | null }>(
  varyantlar: readonly T[],
  kategori: { metadata?: unknown } | null | undefined,
): T[] {
  if (!teklifModundaMi(kategori)) return [...varyantlar]
  return varyantlar.map((v) => ({ ...v, price: null }))
}

/** Liste/kategori öğelerinden `min_price` (ve varsa `max_price`) alanlarını teklif modunda null'lar. */
export function listeFiyatiniSuz<T extends { min_price?: number | string | null; max_price?: number | string | null }>(
  ogeler: readonly T[],
  kategori: { metadata?: unknown } | null | undefined,
): T[] {
  if (!teklifModundaMi(kategori)) return [...ogeler]
  return ogeler.map((o) => {
    const kopya = { ...o, min_price: null } as T
    if ('max_price' in kopya) (kopya as { max_price?: number | string | null }).max_price = null
    return kopya
  })
}
