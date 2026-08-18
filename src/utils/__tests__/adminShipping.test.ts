import { describe, expect, it, vi } from 'vitest'

import {
  invokeShippingUpdate,
  isSharedTrackingConflict,
  SHARED_TRACKING_CONFLICT,
  type ShippingFunctionsHost,
} from '@/utils/adminShipping'

/**
 * PAYLAŞILAN TAKİP NUMARASI — NİYET BEYANININ İLETİLMESİ.
 *
 * ÖLÇÜLEN KUSUR (2026-08-17): `admin-update-shipping` 409 `tracking_number_in_use`
 * döndürüyor ve `allow_shared_tracking: true` ile yazmaya izin veriyordu — ama repoda
 * bu bayrağı GÖNDEREN tek bir istemci yoktu. Yani sunucudaki kaçış kapısı hiçbir
 * yüzeyden ULAŞILAMIYORDU; admin sadece "başarısız" görüyordu.
 *
 * Bu dosya iki ayrı iddiayı ölçer:
 *   (1) 409 gövdesi DOĞRU ayırt ediliyor mu — durum kodu tek başına yeterli değil,
 *   (2) onay verildiğinde bayrak GERÇEKTEN isteğe giriyor mu.
 * (2)'siz test, çağrının VARLIĞINI doğrulayıp niyetin iletilmediğini kaçırırdı —
 * fakir-argüman sahte-yeşili tam olarak budur.
 */

function conflictError(status = 409, body: unknown = { error: SHARED_TRACKING_CONFLICT }) {
  return { context: new Response(JSON.stringify(body), { status }) }
}

interface SentCall {
  body: Record<string, unknown>
}

/** Sahte istemci — dar `ShippingFunctionsHost` sözleşmesi sayesinde tip zorlaması YOK. */
function clientWith(invoke: (name: string, options: SentCall) => Promise<{ error: unknown }>) {
  const spy = vi.fn(invoke)
  const host: ShippingFunctionsHost = { functions: { invoke: spy } }
  return { host, spy }
}

function sentBody(spy: ReturnType<typeof vi.fn>, callIndex = 0): Record<string, unknown> {
  return (spy.mock.calls[callIndex][1] as SentCall).body
}

const BODY = {
  order_id: 'order-1',
  carrier: 'Aras',
  tracking_number: 'TRK-1',
  tracking_url: null,
  send_email: false,
}

describe('isSharedTrackingConflict — hangi ret paylaşılan takip numarasıdır', () => {
  it('409 + gövdede tracking_number_in_use → true', async () => {
    expect(await isSharedTrackingConflict(conflictError())).toBe(true)
  })

  it('409 ama BAŞKA bir hata kodu → false (kullanıcıya yanlış soruyu sormayalım)', async () => {
    expect(await isSharedTrackingConflict(conflictError(409, { error: 'order_locked' }))).toBe(false)
  })

  it('aynı kod ama 409 DEĞİL → false', async () => {
    expect(await isSharedTrackingConflict(conflictError(400))).toBe(false)
  })

  it('gövde JSON değilse → false (emin olmadan onay sormak yazma riski doğurur)', async () => {
    expect(await isSharedTrackingConflict({ context: new Response('<html/>', { status: 409 }) })).toBe(
      false,
    )
  })

  it('Response taşımayan hata (ağ hatası, null, düz nesne) → false', async () => {
    expect(await isSharedTrackingConflict(new Error('network'))).toBe(false)
    expect(await isSharedTrackingConflict(null)).toBe(false)
    expect(await isSharedTrackingConflict({ context: { status: 409 } })).toBe(false)
  })

  it('gövde TÜKETİLMEZ — çağıran aynı yanıtı loglamak için tekrar okuyabilir', async () => {
    const err = conflictError()
    expect(await isSharedTrackingConflict(err)).toBe(true)
    await expect(err.context.json()).resolves.toEqual({ error: SHARED_TRACKING_CONFLICT })
  })
})

describe('invokeShippingUpdate — niyet beyanı isteğe girer', () => {
  it('varsayılanda bayrak GÖNDERİLMEZ — sunucunun benzersizlik kapısı yürürlükte kalır', async () => {
    const { host, spy } = clientWith(() => Promise.resolve({ error: null }))
    const res = await invokeShippingUpdate(host, BODY)

    expect(res).toEqual({ ok: true, conflict: false })
    expect(sentBody(spy)).not.toHaveProperty('allow_shared_tracking')
  })

  it('allowSharedTracking=true → gövdede allow_shared_tracking: true (ASIL ASSERT)', async () => {
    const { host, spy } = clientWith(() => Promise.resolve({ error: null }))
    await invokeShippingUpdate(host, BODY, true)

    // Sunucu gevşek doğruluk KABUL ETMEZ: yalnız gerçek `true` ya da 'true' dizesi.
    expect(sentBody(spy).allow_shared_tracking).toBe(true)
    // Diğer alanlar bozulmadan gider.
    expect(sentBody(spy).order_id).toBe('order-1')
    expect(sentBody(spy).tracking_number).toBe('TRK-1')
  })

  it('409 paylaşılan-takip → ok:false, conflict:true', async () => {
    const { host } = clientWith(() => Promise.resolve({ error: conflictError() }))
    const res = await invokeShippingUpdate(host, BODY)
    expect(res.ok).toBe(false)
    expect(res.conflict).toBe(true)
  })

  it('başka bir hata → ok:false ama conflict:false (onay sorulmaz)', async () => {
    const { host } = clientWith(() => Promise.resolve({ error: new Error('boom') }))
    const res = await invokeShippingUpdate(host, BODY)
    expect(res.ok).toBe(false)
    expect(res.conflict).toBe(false)
  })
})
