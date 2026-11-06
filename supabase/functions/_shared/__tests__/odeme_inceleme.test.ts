import { describe, expect, it } from 'vitest'

import {
  ESLESMEYEN_ODEME_KODU,
  IncelemeOlculemediError,
  adminDurumGirdisi,
  adminDurumKarari,
  eslesmeyenOdemeSiparisleri,
} from '../odeme_inceleme'

/**
 * Karne 2026-11 §4 P2 + P11 (OPS-222) — saf kararlar. Uçların davranışı (gerçek index.ts yüklenerek)
 * `src/__tests__/conformance/odeme-p2-p11-kilit.test.ts` içinde.
 */

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'

describe('adminDurumGirdisi / adminDurumKarari — P11', () => {
  it('status yok → 400 missing_status (varsayılan paid yok)', () => {
    expect(adminDurumGirdisi(undefined)).toEqual({ gecerli: false, kod: 'missing_status' })
    expect(adminDurumGirdisi('  ')).toEqual({ gecerli: false, kod: 'missing_status' })
    expect(adminDurumKarari({ mevcut: 'pending', yeni: undefined, gerekce: null })).toEqual({ islem: 'reddet', http: 400, kod: 'missing_status' })
  })

  it.each(['paid', 'failed', 'PENDING', 'shipped; drop', 7])('sözlük dışı %s → 400 invalid_status', (d) => {
    expect(adminDurumKarari({ mevcut: 'pending', yeni: d, gerekce: null })).toEqual({ islem: 'reddet', http: 400, kod: 'invalid_status' })
  })

  it.each([
    ['delivered', 'confirmed'],
    ['shipped', 'processing'],
    ['cancelled', 'pending'],
    ['confirmed', 'pending'],
    ['delivered', 'cancelled'],
  ])('geri/izin dışı geçiş %s → %s: 409 INVALID_TRANSITION', (mevcut, yeni) => {
    expect(adminDurumKarari({ mevcut, yeni, gerekce: 'yeterince uzun gerekçe' })).toEqual({ islem: 'reddet', http: 409, kod: 'INVALID_TRANSITION' })
  })

  it('pending → confirmed gerekçesiz ya da kısa gerekçeyle 409 REASON_REQUIRED', () => {
    for (const gerekce of [undefined, null, '', 'kisa', 123]) {
      expect(adminDurumKarari({ mevcut: 'pending', yeni: 'confirmed', gerekce })).toEqual({ islem: 'reddet', http: 409, kod: 'REASON_REQUIRED' })
    }
  })

  it('pending → confirmed gerekçeyle yazılır; ileri geçişler gerekçe istemez', () => {
    expect(adminDurumKarari({ mevcut: 'pending', yeni: 'confirmed', gerekce: 'havale dekontu kontrol edildi' })).toEqual({ islem: 'yaz' })
    expect(adminDurumKarari({ mevcut: 'confirmed', yeni: 'processing', gerekce: null })).toEqual({ islem: 'yaz' })
    expect(adminDurumKarari({ mevcut: 'shipped', yeni: 'delivered', gerekce: null })).toEqual({ islem: 'yaz' })
    expect(adminDurumKarari({ mevcut: 'pending', yeni: 'cancelled', gerekce: null })).toEqual({ islem: 'yaz' })
  })
})

describe('eslesmeyenOdemeSiparisleri — PAYMENT_ORDER_MISMATCH kaydı (P2)', () => {
  it('kaydı olan siparişi bulur; sorgu kodu ve order_id filtresi taşır', async () => {
    const urller: string[] = []
    const set = await eslesmeyenOdemeSiparisleri('https://x.supabase.co', 'k', [A, B], async (u) => {
      urller.push(u)
      return new Response(JSON.stringify([{ extra: { code: ESLESMEYEN_ODEME_KODU, order_id: A } }]), { status: 200 })
    })
    expect([...set]).toEqual([A])
    expect(urller[0]).toContain(`extra->>code=eq.${ESLESMEYEN_ODEME_KODU}`)
    expect(urller[0]).toContain(`extra->>order_id=in.(${A},${B})`)
    // kaynak süzgeci: yalnız iyzico-callback'in edge alarmı kanıttır
    expect(urller[0]).toContain('env=eq.edge')
    expect(urller[0]).toContain('extra->>fn=eq.iyzico-callback')
  })

  it('istenmeyen kimliği sunucu dönse bile sayılmaz; UUID olmayan kimlik sorguya girmez', async () => {
    const urller: string[] = []
    const set = await eslesmeyenOdemeSiparisleri('https://x.supabase.co', 'k', [A, 'x),or(1=1'], async (u) => {
      urller.push(u)
      return new Response(JSON.stringify([{ extra: { order_id: B } }]), { status: 200 })
    })
    expect(set.size).toBe(0)
    expect(urller[0]).not.toContain('or(1=1')
  })

  it('boş liste → sorgu yok, boş küme', async () => {
    let cagri = 0
    const set = await eslesmeyenOdemeSiparisleri('https://x.supabase.co', 'k', [], async () => { cagri++; return new Response('[]') })
    expect(set.size).toBe(0)
    expect(cagri).toBe(0)
  })

  it('HTTP hatası, ağ hatası ve bozuk gövde FIRLATIR ("bakamadım" ≠ "kayıt yok")', async () => {
    await expect(eslesmeyenOdemeSiparisleri('u', 'k', [A], async () => new Response('x', { status: 503 }))).rejects.toBeInstanceOf(IncelemeOlculemediError)
    await expect(eslesmeyenOdemeSiparisleri('u', 'k', [A], async () => { throw new TypeError('fetch failed') })).rejects.toBeInstanceOf(IncelemeOlculemediError)
    await expect(eslesmeyenOdemeSiparisleri('u', 'k', [A], async () => new Response('{"a":1}'))).rejects.toBeInstanceOf(IncelemeOlculemediError)
  })
})
