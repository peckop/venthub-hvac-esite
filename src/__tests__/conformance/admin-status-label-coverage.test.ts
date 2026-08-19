import { describe, expect, it } from 'vitest'

import { admin as adminEn } from '@/i18n/dictionaries/admin/en'
import { admin as adminTr } from '@/i18n/dictionaries/admin/tr'
import {
  ORDER_STATUS_LABEL_KEYS,
  ORDER_STATUS_UNKNOWN_KEY,
  ORDER_STATUS_VALUES,
  orderStatusLabel,
} from '@/lib/admin/orderStatusLabels'

/**
 * INV-ADMIN-STATUS-LABEL-1 · Durum etiketi ham DB değeri basmaz (T108-VH).
 *
 * NİÇİN VAR — VE NİÇİN STATİK DEĞİL DAVRANIŞSAL
 *
 * Recep admin panosunda normal bir sepet siparişinin yanında "Teklif/Bekleniyor"
 * gördü. Ölçüm, görünen etiketin sorunun yalnız UCU olduğunu gösterdi:
 *
 *   · `RecentOrdersTable` DÖRT durum tanıyordu (completed, pending, processing,
 *     cancelled); `completed` hiçbir sipariş durumu DEĞİLDİ — ölü dal.
 *   · `OrdersTableBody.prettyStatus` SEKİZ tanıyordu ama `processing` YOKTU —
 *     oysa durum-makinesi `confirmed → processing` geçişine izin verir.
 *   · Sözlükte de `processing` anahtarı yoktu.
 *
 * İkisinin de `default` dalı `return s` idi: eşleşmeyen her durum **ham DB
 * dizesi** olarak ekrana basılıyordu — hem TR hem EN'de.
 *
 * YENİ SINIF: **ÇEVİRİ KAÇAĞI LİTERAL OLARAK GÖRÜNMEZ.**
 * Bu kaçağı hiçbir i18n kapısı yakalamadı ve yakalayamazdı. `react/jsx-no-literals`
 * ve kardeşleri kaynakta ham *literal* arar; `return s` bir literal değil, bir
 * DEĞİŞKENDİR. Çevrilmemiş metin çalışma zamanında doğar. Bu yüzden bu kapı
 * fonksiyonu GERÇEKTEN ÇAĞIRIR ve döndürdüğü değere bakar.
 *
 * ÜÇ KURAL
 *
 *   A) Küme eşitliği — makinenin tanıdığı HER durum bir sözlük anahtarına eşlenir.
 *      (Tip düzeyinde de korunur: `Record<OrderBoardStatus, string>` eksik kalırsa
 *      tsc durdurur. Bu test o kapının ikinci ayağı, TR/EN sözlüklerini de ölçer.)
 *   B) Ham sızıntı yok — hiçbir durum için dönen etiket, durumun kendisine eşit
 *      olamaz.
 *   C) Bilinmeyen durum nötr etiket alır, ham değer DEĞİL.
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla)
 *
 *   · Etiketlerin TR/EN çeviri KALİTESİNİ ölçmez, yalnız var olduklarını ve ham
 *     değere eşit olmadıklarını ölçer.
 *   · Bileşenleri render ETMEZ. "İki yüzey gerçekten bu modülü kullanıyor mu"
 *     sorusunu bu dosya yanıtlamaz; kopya bir switch geri gelirse ve o switch
 *     tam etiket üretirse bu kapı sessiz kalır. Bilinen sınır, adıyla yazıldı.
 */

/**
 * Sözlükten nokta-yollu anahtar çözer.
 *
 * Parametre `unknown`: sözlük nesnesi doğrudan geçilebilir, tip dökümü GEREKMEZ.
 * Daraltma gezinme sırasında yapılır.
 */
function makeT(dict: unknown): (key: string) => string {
  return (key: string): string => {
    const path = key.startsWith('admin.') ? key.slice('admin.'.length) : key
    let node: unknown = dict
    for (const part of path.split('.')) {
      if (typeof node !== 'object' || node === null) return key
      const kayit: Record<string, unknown> = { ...node }
      node = kayit[part]
    }
    return typeof node === 'string' ? node : key
  }
}

const DILLER: { ad: string; t: (key: string) => string }[] = [
  { ad: 'tr', t: makeT(adminTr) },
  { ad: 'en', t: makeT(adminEn) },
]

describe('INV-ADMIN-STATUS-LABEL-1 · kapsam (stale-guard)', () => {
  it('durum kümesi boş değil', () => {
    /* Modül boşalırsa aşağıdaki her test sessizce "temiz" derdi. */
    expect(ORDER_STATUS_VALUES.length, 'tanınan durum yok').toBeGreaterThanOrEqual(9)
  })

  it('sözlük çözücü gerçekten çözüyor', () => {
    /* Çözücü bozulursa her anahtar kendine dönerdi ve A/B yanlış-yeşil olurdu. */
    for (const { ad, t } of DILLER) {
      expect(t('admin.orders.statusLabels.pending'), `${ad}: çözücü anahtarı geri döndürdü`).not.toBe(
        'admin.orders.statusLabels.pending',
      )
    }
  })
})

describe('INV-ADMIN-STATUS-LABEL-1 · kural', () => {
  it('A · her durumun sözlük karşılığı var (TR ve EN)', () => {
    const eksik: string[] = []
    for (const { ad, t } of DILLER) {
      for (const durum of ORDER_STATUS_VALUES) {
        const anahtar = ORDER_STATUS_LABEL_KEYS[durum]
        if (t(anahtar) === anahtar) eksik.push(`${ad}: ${durum} → ${anahtar}`)
      }
    }
    expect(eksik, `Sözlükte karşılığı olmayan durum:\n  ${eksik.join('\n  ')}`).toEqual([])
  })

  it('B · hiçbir durum HAM değeriyle basılmaz', () => {
    const sizan: string[] = []
    for (const { ad, t } of DILLER) {
      for (const durum of ORDER_STATUS_VALUES) {
        if (orderStatusLabel(durum, t) === durum) sizan.push(`${ad}: ${durum}`)
      }
    }
    expect(sizan, `Ham DB değeri ekrana basılıyor:\n  ${sizan.join('\n  ')}`).toEqual([])
  })

  it('C · bilinmeyen/boş durum nötr etiket alır, ham değer değil', () => {
    for (const { ad, t } of DILLER) {
      const notr = t(ORDER_STATUS_UNKNOWN_KEY)
      expect(notr, `${ad}: nötr anahtar sözlükte yok`).not.toBe(ORDER_STATUS_UNKNOWN_KEY)
      for (const giris of ['awaiting_quote', 'completed', '', 'bilinmeyen-durum']) {
        expect(orderStatusLabel(giris, t), `${ad}: "${giris}" ham döndü`).toBe(notr)
      }
      expect(orderStatusLabel(null, t)).toBe(notr)
      expect(orderStatusLabel(undefined, t)).toBe(notr)
    }
  })

  it('C2 · büyük/küçük harf farkı ham sızıntıya dönüşmez', () => {
    /* Eski prettyStatus toLowerCase yapıyordu; yeni modülde de korunmalı. */
    for (const { t } of DILLER) {
      expect(orderStatusLabel('PENDING', t)).toBe(t(ORDER_STATUS_LABEL_KEYS.pending))
      expect(orderStatusLabel('Partial_Refunded', t)).toBe(
        t(ORDER_STATUS_LABEL_KEYS.partial_refunded),
      )
    }
  })
})
