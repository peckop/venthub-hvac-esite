import { describe, expect, it } from 'vitest'

import {
  canCarrierTransition,
  isTerminalReturnStatus,
  RETURN_STATUSES,
  type ReturnStatus,
  TERMINAL_RETURN_STATUSES,
} from '../return_transitions'

/**
 * OPS-224 — kargo iade geçiş kapısının mutasyon yoklaması.
 *
 * `returns-webhook-transitions.test.ts` iki makinenin birbirine göre tutarlılığını kilitliyor
 * (alt küme, fark, soğurucu terminal). Mutasyon koşusu, terminal kümesinden `cancelled`
 * çıkarıldığında bütün paketin yeşil kaldığını ölçtü: `cancelled` iadeye gelen bir kargo
 * sinyali yine reddediliyordu ama `not_allowed` sebebiyle, yani `cancelled` artık sonlanma
 * durumu sayılmıyordu. Webhook gövdesi bu sebebi kargo firmasına yazar.
 *
 * Aşağıdaki doğruluk tablosu 7 × 7 çiftin HER BİRİNİN kararını ve sebebini açıkça yazar:
 * tabloya yeni bir geçiş eklenmesi ya da çıkarılması, hangi çift olursa olsun, burada düşer.
 */

const IZINLI: Readonly<Record<ReturnStatus, readonly ReturnStatus[]>> = {
  requested: ['cancelled'],
  approved: ['in_transit', 'cancelled'],
  in_transit: ['received', 'cancelled'],
  received: [],
  rejected: [],
  refunded: [],
  cancelled: [],
}

const TERMINAL: readonly ReturnStatus[] = ['rejected', 'refunded', 'cancelled']

function beklenen(a: ReturnStatus, b: ReturnStatus): ReturnType<typeof canCarrierTransition> {
  // Aynı durum serbest = BUGÜNKÜ davranış (`return_transitions.ts:84`), bilinçli onay değil.
  // Karnedeki P6 (2026-11 güvenlik karnesi) bu satırı sorguluyor; P6 düzeltilirse bu satır
  // ve köşegendeki 7 çift yeni karara göre güncellenir — buradaki kırmızı regresyon değildir.
  if (a === b) return { allowed: true }
  if (TERMINAL.includes(a)) return { allowed: false, reason: 'terminal' }
  return IZINLI[a].includes(b) ? { allowed: true } : { allowed: false, reason: 'not_allowed' }
}

describe('OPS-224 · kargo geçiş kapısı: 49 çiftin tam doğruluk tablosu', () => {
  it('tablonun evreni DB sözlüğüyle aynı 7 statü', () => {
    expect([...RETURN_STATUSES].sort()).toEqual(Object.keys(IZINLI).sort())
  })

  const ciftler = RETURN_STATUSES.flatMap((a) => RETURN_STATUSES.map((b) => [a, b] as const))

  it.each(ciftler)('%s → %s', (a, b) => {
    expect(canCarrierTransition(a, b)).toEqual(beklenen(a, b))
  })
})

describe('OPS-224 · sonlanma durumları adıyla sabit', () => {
  it('terminal küme tam olarak rejected, refunded, cancelled — R5, R6', () => {
    expect([...TERMINAL_RETURN_STATUSES].sort()).toEqual([...TERMINAL].sort())
  })

  it.each(TERMINAL)('%s terminaldir: başka her hedefe sebep `terminal` — R5', (kaynak) => {
    expect(isTerminalReturnStatus(kaynak)).toBe(true)
    for (const hedef of RETURN_STATUSES) {
      if (hedef === kaynak) continue
      expect(canCarrierTransition(kaynak, hedef), `${kaynak} → ${hedef}`).toEqual({
        allowed: false,
        reason: 'terminal',
      })
    }
  })

  it('terminal olmayan dört statü terminal sayılmaz', () => {
    for (const s of ['requested', 'approved', 'in_transit', 'received']) {
      expect(isTerminalReturnStatus(s), s).toBe(false)
    }
  })

  it('bilinmeyen değer terminal sayılmaz ve kapıdan bilinmeyen sebebiyle döner', () => {
    expect(isTerminalReturnStatus('bilinmeyen')).toBe(false)
    expect(canCarrierTransition('cancelled', 'bilinmeyen')).toEqual({ allowed: false, reason: 'unknown_next' })
    expect(canCarrierTransition('bilinmeyen', 'cancelled')).toEqual({ allowed: false, reason: 'unknown_current' })
  })

  it('bilinmeyen statü kendisine geçişte de reddedilir (aynı-statü kısayolu bilinmeyeni geçirmez)', () => {
    expect(canCarrierTransition('x', 'x')).toEqual({ allowed: false, reason: 'unknown_current' })
    expect(canCarrierTransition('__proto__', '__proto__')).toEqual({ allowed: false, reason: 'unknown_current' })
    for (const s of RETURN_STATUSES) {
      expect(canCarrierTransition(s, s), `${s} → ${s}`).toEqual({ allowed: true })
    }
  })

  it.each(['__proto__', 'constructor', 'toString', ''])(
    'kalıtsal ya da boş anahtar `%s` statü değildir, istisna fırlatmaz',
    (anahtar) => {
      expect(canCarrierTransition(anahtar, 'cancelled')).toEqual({ allowed: false, reason: 'unknown_current' })
      expect(canCarrierTransition('approved', anahtar)).toEqual({ allowed: false, reason: 'unknown_next' })
    },
  )
})
