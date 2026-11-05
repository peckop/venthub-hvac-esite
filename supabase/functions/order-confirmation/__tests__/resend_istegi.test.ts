import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { resendIstegi, siparisOnayAnahtari } from '../resend_istegi'

/**
 * OPS-225 kilidi — notification-standard §B3.1 Katman 1: order-confirmation Resend'e
 * Idempotency-Key gönderir; aynı sipariş için anahtar kararlıdır.
 */
const govde = { from: 'a@b.c', to: ['m@b.c'], subject: 's', html: '<p>h</p>', text: 's' }

describe('order-confirmation Resend Idempotency-Key', () => {
  it('aynı sipariş için aynı anahtar, farklı sipariş için farklı anahtar', () => {
    expect(siparisOnayAnahtari('ord-1')).toBe('order-confirmation:ord-1')
    expect(siparisOnayAnahtari('ord-1')).toBe(siparisOnayAnahtari('ord-1'))
    expect(siparisOnayAnahtari('ord-1')).not.toBe(siparisOnayAnahtari('ord-2'))
    expect(siparisOnayAnahtari('x'.repeat(400)).length).toBeLessThanOrEqual(256)
  })

  it('istek Idempotency-Key başlığını taşır', () => {
    const istek = resendIstegi('k', 'ord-1', govde)
    const basliklar = istek.headers as Record<string, string>
    expect(basliklar['Idempotency-Key']).toBe('order-confirmation:ord-1')
    expect(resendIstegi('k', 'ord-1', govde).headers).toEqual(istek.headers)
    expect(JSON.parse(istek.body as string)).toEqual(govde)
  })

  it('index.ts Resend çağrısını bu yardımcıdan geçirir (başlıksız fetch yok)', () => {
    const kaynak = readFileSync(join(__dirname, '..', 'index.ts'), 'utf8')
    expect(kaynak).toMatch(/fetch\('https:\/\/api\.resend\.com\/emails', resendIstegi\(/)
    expect(kaynak).not.toMatch(/pg_net tekrar dener/)
  })
})
