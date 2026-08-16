import { describe, expect, it } from 'vitest'

import { allowedNextOrderStatuses, canTransitionOrder } from '../orderStatusMachine'
import { allowedNextStatuses } from '../returnStatusMachine'

/**
 * T057-VH / T058-VH — operasyon döngüsü denetiminde ölçülen iki kusuru
 * geri gelmekten alıkoyan testler.
 *
 * Bunlar "makine ne diyor" testi değil, **yeteneğin var olduğunun** testidir:
 * aksiyon butonları ve toplu işlem hedefleri doğrudan bu haritalardan üretiliyor,
 * dolayısıyla haritadaki bir eksik = arayüzde tamamen kapalı bir yetenek.
 */

describe('returnStatusMachine — iade reddi (T057-VH)', () => {
  it('bekleyen bir talep REDDEDİLEBİLİR', () => {
    // Bu geçiş YOKTU: "Reddet" butonu hiç render edilmiyordu ve toplu işlemde
    // `rejected` daima 0 hedef buluyordu. Admin bir iadeyi reddedemiyordu.
    expect(allowedNextStatuses('requested')).toContain('rejected')
  })

  it('reddetmek `cancelled` ile KARIŞTIRILMAZ — ikisi de ayrı ayrı mümkün', () => {
    // `cancelled` "müşteri vazgeçti" demektir; reddi onunla kapatmak kaydı
    // yanlış sebeple kapatır ve raporlamayı bozar.
    const next = allowedNextStatuses('requested')
    expect(next).toContain('cancelled')
    expect(next).toContain('approved')
  })

  it('ONAYLANMIŞ bir talep reddedilemez (monotonluk, kural 11)', () => {
    expect(allowedNextStatuses('approved')).not.toContain('rejected')
  })

  it('`rejected` terminaldir', () => {
    expect(allowedNextStatuses('rejected')).toEqual([])
  })
})

describe('orderStatusMachine — kanban monotonluk kapısı (T058-VH)', () => {
  it('teslim edilmiş sipariş başa döndürülemez', () => {
    // Panoda hiçbir koruma yoktu: teslim edilmiş sipariş "Yeni" sütununa
    // sürüklenebiliyordu.
    expect(canTransitionOrder('delivered', 'pending')).toBe(false)
    expect(canTransitionOrder('delivered', 'confirmed')).toBe(false)
    expect(canTransitionOrder('delivered', 'shipped')).toBe(false)
  })

  it('teslim sonrası tek çıkış iadedir', () => {
    expect(allowedNextOrderStatuses('delivered')).toEqual(['refunded'])
  })

  it('iptal ve iade terminaldir', () => {
    expect(allowedNextOrderStatuses('cancelled')).toEqual([])
    expect(allowedNextOrderStatuses('refunded')).toEqual([])
  })

  it('normal ileri akış açık', () => {
    expect(canTransitionOrder('pending', 'confirmed')).toBe(true)
    expect(canTransitionOrder('confirmed', 'shipped')).toBe(true)
    expect(canTransitionOrder('shipped', 'delivered')).toBe(true)
  })

  it('teslim edilene kadar iptal her aşamada mümkün', () => {
    for (const s of ['pending', 'paid', 'confirmed', 'processing', 'shipped']) {
      expect(canTransitionOrder(s, 'cancelled')).toBe(true)
    }
    expect(canTransitionOrder('delivered', 'cancelled')).toBe(false)
  })

  it('bilinmeyen statü KİLİTLİ (fail-closed)', () => {
    expect(allowedNextOrderStatuses('bilinmeyen')).toEqual([])
    expect(canTransitionOrder('bilinmeyen', 'shipped')).toBe(false)
  })
})
