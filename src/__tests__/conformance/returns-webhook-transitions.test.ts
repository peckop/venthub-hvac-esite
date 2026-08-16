import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  canCarrierTransition,
  CARRIER_ALLOWED_TRANSITIONS,
  RETURN_STATUSES,
  type ReturnStatus,
  TERMINAL_RETURN_STATUSES,
} from '../../../supabase/functions/_shared/return_transitions'
import { allowedNextStatuses } from '../../lib/admin/returnStatusMachine'

/**
 * INV-RETURN-1 — iade statüsünün TEK bir sözleşmesi vardır.
 *
 * NİÇİN VAR (T057-VH · operasyon döngüsü denetimi 2026-08-15 §3)
 *
 * Denetim, iade statüsü için üç ayrı otorite ölçtü ve üçü birbiriyle çelişiyordu:
 *
 *   1. `src/lib/admin/returnStatusMachine.ts` — istemci geçiş tablosu (admin butonlarını üretir)
 *   2. `returns-webhook` — sayısal bir SIRALAMA haritası
 *   3. Veritabanı — geçiş trigger'ı YOK (bu test onu kapatmaz; DB tarafı ayrı iştir)
 *
 * (2)'deki sıralama iki somut kaçak üretiyordu ve ikisi de kaynaktan doğrulandı:
 *
 *   • `rejected` bir SONLANMA durumu, ama sıralamada rütbesi 1'di. Kargo firmasının
 *     gönderdiği `in_transit` (2) "ilerleme" sayılıyor ve REDDEDİLMİŞ iadeyi canlandırıyordu.
 *   • `refunded` ile `cancelled` eşit rütbedeydi (4). Kontrol `nextRank < curRank` olduğu
 *     için `4 < 4` yanlış → parası iade edilmiş bir iade `cancelled`'a çevrilebiliyordu.
 *
 * Bu testin işi, düzeltmenin geri gelmesini engellemek DEĞİL yalnızca; iki tarafın
 * SÖZLEŞMESİNİN ayrışmasını engellemek. Bir düzeltme tek dosyada yaşarsa, diğer dosya
 * ertesi hafta sessizce ondan uzaklaşır — bugün olan tam olarak buydu.
 *
 * Sınır: bu test DB CHECK kısıtını çalıştırmaz. Kısıt 2026-08-16'da prod'dan OKUNDU ve
 * beklenen liste aşağıya sabitlendi; kısıt değişirse burası kırmızı yanar ve insan bakar.
 */

const REPO_ROOT = path.resolve(__dirname, '../../..')

/**
 * Blok ve satır yorumlarını boşlukla değiştirir (satır numaraları korunur).
 * Kaynak taraması yapan her dedektörün ihtiyacı: aksi hâlde bir kusuru ANLATAN yorum,
 * kusurun kendisi sanılır.
 */
function stripTsComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (_m, p1: string) => p1)
}

/** 2026-08-16'da prod'dan okundu: `venthub_returns_status_check`. */
const DB_CHECK_STATUSES = [
  'requested',
  'approved',
  'rejected',
  'in_transit',
  'received',
  'refunded',
  'cancelled',
] as const

describe('INV-RETURN-1 · iade geçiş sözleşmesi tek ve tutarlı', () => {
  it('statü sözlüğü DB CHECK kısıtıyla birebir aynı', () => {
    expect([...RETURN_STATUSES].sort()).toEqual([...DB_CHECK_STATUSES].sort())
  })

  it('sonlanma durumları İKİ tarafta da soğurucu (istemci makinesi ile webhook anlaşıyor)', () => {
    const ayrisan: string[] = []
    for (const s of TERMINAL_RETURN_STATUSES) {
      const istemci = allowedNextStatuses(s)
      const webhook = CARRIER_ALLOWED_TRANSITIONS[s]
      if (istemci.length > 0) ayrisan.push(`istemci ${s} -> [${istemci.join(', ')}]`)
      if (webhook.length > 0) ayrisan.push(`webhook ${s} -> [${webhook.join(', ')}]`)
    }
    expect(
      ayrisan,
      'Sonlanma durumundan ÇIKIŞ tanımlanmış. Bir iade rejected/refunded/cancelled ' +
        'olduysa oradan hiçbir yöne gitmemeli — eski rank haritası tam bu yüzden ' +
        'reddedilmiş iadeyi in_transit yapabiliyordu.\n' +
        ayrisan.join('\n'),
    ).toEqual([])
  })

  it('webhook geçişleri istemci makinesinin İZİN VERDİKLERİNİN alt kümesi', () => {
    const fazla: string[] = []
    for (const kaynak of RETURN_STATUSES) {
      const istemci = new Set(allowedNextStatuses(kaynak))
      for (const hedef of CARRIER_ALLOWED_TRANSITIONS[kaynak]) {
        if (!istemci.has(hedef)) fazla.push(`${kaynak} -> ${hedef}`)
      }
    }
    expect(
      fazla,
      'Webhook, istemci durum makinesinin tanımadığı bir geçişi yapabiliyor. İki taraf ' +
        'ayrışmış demektir; hangisinin doğru olduğuna KARAR VER ve ikisini birden ' +
        `güncelle.\nFazla geçişler: ${fazla.join(', ')}`,
    ).toEqual([])
  })

  it('webhook `refunded` YAZAMAZ — para kararı kargo firmasının değil', () => {
    const yazabilen = (Object.keys(CARRIER_ALLOWED_TRANSITIONS) as ReturnStatus[]).filter((k) =>
      (CARRIER_ALLOWED_TRANSITIONS[k] as readonly string[]).includes('refunded'),
    )
    expect(
      yazabilen,
      'Bir kargo webhook\'u ödeme durumunu ilan edemez. `refunded`, admin\'in para ' +
        'kararıdır ve `iyzico-refund` üzerinden PSP kanıtıyla yazılır.',
    ).toEqual([])
  })

  it('bilinmeyen statü SESSİZCE geçmez', () => {
    expect(canCarrierTransition('in_transit', 'teslim_edildi_belki')).toEqual({
      allowed: false,
      reason: 'unknown_next',
    })
    expect(canCarrierTransition('bilinmeyen', 'received')).toEqual({
      allowed: false,
      reason: 'unknown_current',
    })
  })

  it('eski SIRALAMA haritası webhook kaynağına geri dönmemiş', () => {
    const ham = readFileSync(
      path.join(REPO_ROOT, 'supabase/functions/returns-webhook/index.ts'),
      'utf8',
    )
    // ⚠️ YORUMLARI ÇIKAR. İlk sürümde çıkarmıyordu ve test KIRMIZI yandı — yakaladığı
    // şey kaldırdığımız kodun kendisi değil, onu ANLATAN yorumdu. Bir dedektör düzyazıyı
    // koddan ayırt edemiyorsa, doğru düzeltmeyi ihlal sanar ve insanı yorumu silmeye iter.
    const kaynak = stripTsComments(ham)
    // Rank haritasının imzası: `rejected:1` benzeri sayısal atama ya da `nextRank < curRank`.
    expect(
      /\brank\s*\[|nextRank|curRank|rejected\s*:\s*\d/.test(kaynak),
      'returns-webhook içinde yeniden bir sıralama (rank) haritası belirmiş. İade akışı ' +
        'bir sıra değildir; geçişler `_shared/return_transitions.ts` tablosundan gelir.',
    ).toBe(false)
    // ⚠️ Burada `kaynak.includes('canCarrierTransition')` YETMEZ ve bu bir varsayım değil,
    // ÖLÇÜM: kapıyı kasten bozan sabotaj turunda (çağrıyı `{ allowed: true }` ile
    // değiştirdim) test YEŞİL kaldı — çünkü `import` satırı ismi hâlâ içeriyordu.
    // Bir ismin dosyada GEÇMESİ, o ismin ÇAĞRILDIĞI anlamına gelmez.
    const govde = kaynak.replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"]\s*;?\s*$/gm, '')
    expect(
      /\bcanCarrierTransition\s*\(/.test(govde),
      'returns-webhook ortak geçiş tablosunu ÇAĞIRMIYOR — kapı devre dışı bırakılmış ' +
        '(import durup çağrının silinmesi yeterlidir; bu yüzden import satırları hariç tutulur).',
    ).toBe(true)
  })

  /**
   * Kapının kendisini kanıtla. Yeşil bir test, ölçtüğünü ölçtüğünü kanıtlamaz —
   * dedektöre BİLEREK ihlal göster ve gördüğünü doğrula.
   * (bkz. memory `prove-the-gate-with-deliberate-failure`)
   */
  it('kendi kendini doğrular: dedektör gerçek ihlalleri GÖRÜR', () => {
    // (a) sonlanma durumundan çıkış
    expect(canCarrierTransition('rejected', 'in_transit')).toEqual({ allowed: false, reason: 'terminal' })
    expect(canCarrierTransition('refunded', 'cancelled')).toEqual({ allowed: false, reason: 'terminal' })
    // Eski rank haritası bu ikisini de GEÇİRİYORDU — regresyonun birebir kanıtı:
    const eskiRank: Record<string, number> = {
      requested: 0, approved: 1, rejected: 1, in_transit: 2, received: 3, refunded: 4, cancelled: 4,
    }
    expect(eskiRank['in_transit'] < eskiRank['rejected'], 'eski harita rejected->in_transit geçirirdi').toBe(false)
    expect(eskiRank['cancelled'] < eskiRank['refunded'], 'eski harita refunded->cancelled geçirirdi').toBe(false)

    // (b) tanımlı ama izinsiz geçiş
    expect(canCarrierTransition('requested', 'received')).toEqual({ allowed: false, reason: 'not_allowed' })

    // (c) meşru geçişler gerçekten geçiyor (yanlış-KIRMIZI da kusurdur)
    expect(canCarrierTransition('approved', 'in_transit')).toEqual({ allowed: true })
    expect(canCarrierTransition('in_transit', 'received')).toEqual({ allowed: true })
    expect(canCarrierTransition('received', 'received')).toEqual({ allowed: true })
  })
})
