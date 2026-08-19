import { describe, expect, it } from 'vitest'

import {
  isRefundedPayment,
  ORDER_DB_STATUSES,
  PAYMENT_DB_STATUSES,
  PAYMENT_ONLY_STATUSES,
} from '@/lib/admin/orderStatusDomain'

/**
 * INV-ADMIN-STATUS-FILTER-1 · `status` kolonuna ödeme değeri sorulamaz (T111-VH).
 *
 * NİÇİN VAR
 *
 * Admin sipariş tablosunun durum filtresi `status` kolonuna sorgu atıyordu
 * (`query.eq('status', …)`) ama seçenek listesi elle yazılmış SEKİZ değerdi ve
 * ÜÇÜ ödeme sözlüğüne aitti: `paid`, `refunded`, `partial_refunded`. Canlı DB
 * kısıtına göre `status` bu üçünü **hiçbir zaman** taşıyamaz.
 *
 * Sonuç: üç filtre seçeneği **her zaman sıfır sonuç** döndürüyordu. Ve ters
 * yönde de eksikti — `processing` gerçek bir durum olduğu hâlde listede yoktu,
 * yani hazırlanmakta olan siparişler hiç filtrelenemiyordu.
 *
 * TEK BELİRTİSİ BOŞ EKRANDI. Hata yok, kırmızı yok, log yok. Bu yüzden statik
 * bir "literal ara" kapısı yetmez; kapı KÜMELERİ karşılaştırmalıdır.
 *
 * İKİ SÖZLÜK, canlı prod DB'den `pg_constraint` ile ölçüldü (2026-08-19; EDGE
 * bağımsız olarak aynı ölçümü tekrarladı, kesişimleri yalnız `pending`):
 *
 *   venthub_orders_status_check         → 6 değer
 *   venthub_orders_payment_status_check → 5 değer
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla)
 *
 *   · Bu kapı DB'ye BAĞLANMAZ. Sözlükler `orderStatusDomain.ts` içinde ölçüm
 *     tarihiyle sabitlenmiştir; kısıt prod'da değişirse bu dosya bunu göremez.
 *     O riski kapatan şey ayrı bir DB kapısıdır (db-advisor), burası değil.
 *   · Filtrenin DOĞRU SONUÇ döndürdüğünü ölçmez; yalnız sorulan değerin
 *     kolonun sözlüğünde bulunabilir olduğunu ölçer.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const KAYNAKLAR: Record<string, string> = import.meta.glob('/src/views/admin/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Filtre listesi bileşende TÜRETİLMİŞ mi, yoksa yeniden ELLE mi yazılmış?
 *
 * Bu kontrol bilinçli olarak KAYNAK METİN üzerinde çalışır. İlk yazımda listeyi
 * testin içinde yeniden tanımlamıştım ve o hâliyle kural bir TOTOLOJİYİ
 * doğruluyordu: iki taraf tanım gereği eşitti, gerçek regresyon (birinin
 * listeyi tekrar elle yazması) hiç yakalanamazdı.
 */
function filtreListesiTanimi(): { dosya: string; satir: string } | null {
  for (const [yol, ham] of Object.entries(KAYNAKLAR)) {
    for (const satir of ham.split(/\r?\n/)) {
      if (satir.includes('const ORDER_STATUS_KEYS')) return { dosya: yol, satir: satir.trim() }
    }
  }
  return null
}

describe('INV-ADMIN-STATUS-FILTER-1 · kapsam (stale-guard)', () => {
  it('iki sözlük de boş değil', () => {
    /* Listeler boşalırsa aşağıdaki her kural sessizce "temiz" derdi. */
    expect(ORDER_DB_STATUSES.length, 'sipariş sözlüğü boş').toBe(6)
    expect(PAYMENT_DB_STATUSES.length, 'ödeme sözlüğü boş').toBe(5)
  })

  it('yalnız-ödeme kümesi gerçekten türetiliyor', () => {
    /*
     * Elle yazılsaydı iki liste değişince sessizce bayatlardı. Ayrıca `pending`
     * iki sözlükte de var ve bu kümede OLMAMALI — aksi hâlde tamamen meşru bir
     * `status='pending'` filtresi yanlış-kırmızı verirdi.
     */
    expect([...PAYMENT_ONLY_STATUSES].sort()).toEqual(
      ['failed', 'paid', 'partial_refunded', 'refunded'].sort(),
    )
    expect(PAYMENT_ONLY_STATUSES).not.toContain('pending')
  })
})

describe('INV-ADMIN-STATUS-FILTER-1 · kural', () => {
  it('A · filtreye giden HİÇBİR değer yalnız-ödeme sözlüğünden olamaz', () => {
    const tanim = filtreListesiTanimi()
    expect(tanim, 'ORDER_STATUS_KEYS tanimi hic bulunamadi').not.toBeNull()
    const olu = PAYMENT_ONLY_STATUSES.filter((p) => tanim!.satir.includes("'" + p + "'"))
    expect(
      olu,
      `Bu değerler status kolonunda ASLA bulunamaz, filtre her zaman boş döner:\n  ${olu.join('\n  ')}`,
    ).toEqual([])
  })

  it('B · filtre kümesi DB sözlüğünün tamamını kapsar (eksik filtre yok)', () => {
    const tanim = filtreListesiTanimi()
    expect(tanim, 'ORDER_STATUS_KEYS tanimi hic bulunamadi').not.toBeNull()
    const turetilmis = tanim!.satir.includes('ORDER_DB_STATUSES')
    const eksik = turetilmis ? [] : ORDER_DB_STATUSES.filter((s) => !tanim!.satir.includes(s))
    expect(
      eksik,
      `Gerçek bir durum filtrelenemiyor:\n  ${eksik.join('\n  ')}`,
    ).toEqual([])
  })

  it('C · iki sözlüğün kesişimi yalnız pending', () => {
    /* Kesişim büyürse "yalnız-ödeme" türetmesi daralır ve A kuralı zayıflar. */
    const kesisim = ORDER_DB_STATUSES.filter((s) =>
      (PAYMENT_DB_STATUSES as readonly string[]).includes(s),
    )
    expect(kesisim).toEqual(['pending'])
  })
})

describe('INV-ADMIN-STATUS-FILTER-1 · iade kaynağı', () => {
  it('D · iade hükmü ÖDEME kolonundan kurulur', () => {
    expect(isRefundedPayment('refunded')).toBe(true)
    expect(isRefundedPayment('partial_refunded')).toBe(true)
    expect(isRefundedPayment('paid')).toBe(false)
    expect(isRefundedPayment(null)).toBe(false)
    expect(isRefundedPayment(undefined)).toBe(false)
  })

  it('E · sipariş sözlüğündeki hiçbir değer iade sayılmaz', () => {
    /*
     * Kanban zaten payment_status'tan türetiyordu; liste yüzeyi status'tan
     * türetmeye kalkarsa HİÇBİR iade göremez - bu test o yolu kapatır.
     */
    const yanlis = ORDER_DB_STATUSES.filter((s) => isRefundedPayment(s))
    expect(yanlis, `Sipariş durumu iade sanıldı: ${yanlis.join(', ')}`).toEqual([])
  })
})
