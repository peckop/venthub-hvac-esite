// Çağıran sınıfı: yardımcı modül (uç değil) — kargo webhook'unun sipariş durumuna YAZMA kararları.
//
// NİÇİN VAR (ALT-134 · 2026-11-03)
//
// `shipping-webhook` taşıyıcının ham durum kelimesini siparişe doğrudan yazıyordu:
//   · `RANK` yalnız pending/paid/confirmed/shipped/delivered'ı biliyordu; `processing` ve `cancelled`
//     rütbesiz (0) kaldığı için İPTAL EDİLMİŞ siparişe `shipped`/`delivered` yazılabiliyordu;
//   · `mapCarrierStatus` 'paid' ve 'failed' döndürüyordu — `venthub_orders_status_check` bu değerleri
//     kabul etmez, UPDATE düşer ve webhook 500 verirdi; bilinmeyen kelime HAM yazılıyordu;
//   · `confirmed → delivered` gibi atlayışlar rütbeyle geçiyordu.
// Veritabanı tetiği (ALT-131, `trg_orders_monoton_durum`) bu geçişleri artık reddeder (SQLSTATE VH409);
// bu modül YAZMADAN ÖNCE aynı kararı verir. Tetik ayrı bir PR'la (#2208) gelir: bu değişiklik tek başına
// UYGULAMA kapısıyla güvenlidir (okunan duruma bağlı koşullu yazım); tetik canlıya girince ikinci hat olur.
//
// Geçiş tablosu (ALT-131 ile aynı): confirmed→{processing,shipped,cancelled}, processing→{shipped,cancelled},
// shipped→{delivered,cancelled}. Webhook yalnız İLERİ taşıma yapar: shipped ve delivered. İptal ve
// 'processing' bir TİCARİ karardır, taşıyıcının işi değil.

export type KargoHedefi = 'shipped' | 'delivered'

export type HedefCozum =
  | { tur: 'hedef'; hedef: KargoHedefi }
  /** Taşıyıcı durumu geçerli ama sipariş durumunu ilgilendirmiyor (etiket oluşturuldu, istisna...). */
  | { tur: 'durum_yok'; neden: 'hazirlik' | 'istisna' | 'bos' }
  /** Tanınmayan kelime: status'a DOKUNULMAZ (ham değer yazılmaz), yalnız takip alanları. */
  | { tur: 'durum_yok'; neden: 'bilinmeyen' }

const SHIPPED = ['accepted', 'picked_up', 'in_transit', 'transit', 'out_for_delivery', 'dispatched', 'shipped']
const DELIVERED = ['delivered', 'completed']
const HAZIRLIK = ['label_created', 'created', 'ready', 'processing', 'info_received']
const ISTISNA = ['failed', 'exception', 'return_to_sender', 'cancelled', 'canceled']

/** Taşıyıcı kelimesi → sipariş hedefi. Çıktı ASLA sözlük dışı bir status değeri taşımaz. */
export function kargoHedefiCoz(ham: string | undefined | null): HedefCozum {
  const s = (ham ?? '').trim().toLowerCase()
  if (!s) return { tur: 'durum_yok', neden: 'bos' }
  if (SHIPPED.includes(s)) return { tur: 'hedef', hedef: 'shipped' }
  if (DELIVERED.includes(s)) return { tur: 'hedef', hedef: 'delivered' }
  if (HAZIRLIK.includes(s)) return { tur: 'durum_yok', neden: 'hazirlik' }
  if (ISTISNA.includes(s)) return { tur: 'durum_yok', neden: 'istisna' }
  return { tur: 'durum_yok', neden: 'bilinmeyen' }
}

export interface KargoSiparisi {
  status: string | null
  payment_status: string | null
}

export type YazimKarari =
  /** Hiçbir şey yazılmaz (takip alanları dahil). */
  | { islem: 'yoksay'; neden: 'ORDER_CANCELLED' | 'ORDER_DELIVERED' | 'ORDER_NOT_CONFIRMED' | 'ORDER_NOT_PAID' | 'ORDER_STATUS_UNKNOWN' }
  /** Yalnız takip alanları (status değişmez). */
  | { islem: 'yalniz_takip' }
  /**
   * Sıralı status adımları. Her adım PATCH'te kendi kaynak durumuna bağlıdır (`status=eq.<kaynak>`):
   * satır arada ilerlediyse 0 satır güncellenir, zararsızdır.
   */
  | { islem: 'adimlar'; adimlar: ReadonlyArray<{ kaynak: string; hedef: KargoHedefi }> }

/**
 * Okunan sipariş durumu + taşıyıcı hedefi → yazım kararı.
 *
 *  · cancelled: ÇIKIŞSIZ — hiçbir şey yazılmaz.
 *  · delivered: KİLİTLİ (ALT-138) — takip alanları dahil hiçbir şey yazılmaz. Teslim edilmiş siparişin
 *    takip bağlantısı müşterinin elindeki kanıttır; gecikmiş ya da sahte bir olayın onu başka bir adrese
 *    çevirmesi oltalama yoludur. Düzeltme gerekiyorsa admin yapar (admin_audit_log).
 *  · pending: ödenmemiş sipariş için kargo olayı anlamsız — yoksayılır.
 *  · confirmed/processing → shipped: yalnız ÖDENMİŞ siparişte (admin kargolama ile aynı kural).
 *  · delivered hedefi, sipariş henüz shipped değilse İKİ ADIM: önce shipped, sonra delivered. Gerekçe:
 *    taşıyıcı teslim bildirdiyse paket fiilen çıkmıştır; yalnız shipped yazıp bırakmak teslim sinyalini
 *    (tekrar gelmeyebilir) kaybettirir, atlamak ise tetikle çelişir (confirmed→delivered yasak).
 *  · aynı değer (shipped→shipped): status yazılmaz, takip alanları güncellenir.
 */
export function kargoYazimKarari(siparis: KargoSiparisi, cozum: HedefCozum): YazimKarari {
  const durum = siparis.status ?? ''
  if (durum === 'cancelled') return { islem: 'yoksay', neden: 'ORDER_CANCELLED' }
  if (durum === 'delivered') return { islem: 'yoksay', neden: 'ORDER_DELIVERED' }
  if (durum === 'pending') return { islem: 'yoksay', neden: 'ORDER_NOT_CONFIRMED' }
  if (!['confirmed', 'processing', 'shipped', 'delivered'].includes(durum)) {
    return { islem: 'yoksay', neden: 'ORDER_STATUS_UNKNOWN' }
  }
  if (cozum.tur !== 'hedef') return { islem: 'yalniz_takip' }

  const hedef = cozum.hedef
  if (durum === 'shipped') {
    return hedef === 'delivered'
      ? { islem: 'adimlar', adimlar: [{ kaynak: 'shipped', hedef: 'delivered' }] }
      : { islem: 'yalniz_takip' }
  }
  // confirmed | processing
  if (siparis.payment_status !== 'paid') return { islem: 'yoksay', neden: 'ORDER_NOT_PAID' }
  return hedef === 'shipped'
    ? { islem: 'adimlar', adimlar: [{ kaynak: durum, hedef: 'shipped' }] }
    : {
        islem: 'adimlar',
        adimlar: [
          { kaynak: durum, hedef: 'shipped' },
          { kaynak: 'shipped', hedef: 'delivered' },
        ],
      }
}

/**
 * Takip bağlantısının izinli olduğu taşıyıcı alan adları (ALT-138). Liste admin panelinin kendi ürettiği
 * takip adreslerinden alındı (`src/views/admin/OrdersTableBody.tsx`, `AdminLogisticsTableBody.tsx`):
 * yeni bir taşıyıcı bağlanınca buraya eklenir ve testi genişletilir. Alan adının kendisi ya da alt alan
 * adı kabul edilir (`www.yurticikargo.com`, `gonderitakip.ptt.gov.tr`); benzer görünen alan adı kabul edilmez.
 */
export const TAKIP_ALAN_ADLARI: readonly string[] = [
  'yurticikargo.com',
  'araskargo.com.tr',
  'mngkargo.com.tr',
  'ptt.gov.tr',
]

/**
 * Taşıyıcının gönderdiği takip bağlantısı siparişe yazılabilir mi? Yalnız `https:` şemalı, kimlik bilgisi ve
 * özel bağlantı noktası taşımayan, izinli bir taşıyıcı alan adına giden adres kabul edilir.
 *
 * NİÇİN: bağlantı müşteriye sipariş sayfasında ve e-postada tıklanır biçimde gösterilir. Doğrulanmadan
 * yazılan değer `javascript:` şeması ya da oltalama sitesi olabilir.
 */
export function takipBaglantisiGecerli(ham: string | null | undefined): boolean {
  const metin = (ham ?? '').trim()
  if (!metin || metin.length > 2048) return false
  let url: URL
  try {
    url = new URL(metin)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  if (url.username || url.password || url.port) return false
  const host = url.hostname.toLowerCase().replace(/\.$/, '')
  return TAKIP_ALAN_ADLARI.some((alan) => host === alan || host.endsWith(`.${alan}`))
}

/** Veritabanı monotonluk tetiği reddetti mi (PostgREST/supabase-js hata nesnesi)? */
export function tetikReddiMi(hata: unknown): boolean {
  if (typeof hata !== 'object' || hata === null) return false
  const h = hata as { code?: unknown; message?: unknown }
  return h.code === 'VH409' || (typeof h.message === 'string' && h.message.includes('ALT131_MONOTON'))
}
