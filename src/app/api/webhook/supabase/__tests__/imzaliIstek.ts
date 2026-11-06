import { randomUUID } from 'node:crypto'

import { NextRequest } from 'next/server'

import { imzaUret } from '@/lib/webhook/imza'

/**
 * ALT-76 PR 3 · rota testleri için imzalı istek. Rota artık yalnız imzalı isteği kabul eder ve
 * gövdede `event_id` ister; tetiğin ürettiği isteğin aynısını kurar: gövdeye rastgele olay
 * kimliği, `x-webhook-timestamp` (sn) ve `x-webhook-signature` = hex(HMAC(secret, `<zaman>.<gövde>`)).
 * Rota dalı testleri `@/lib/webhook/olayTekil`'in `olayTuket`'ini 'yeni' döndürecek biçimde taklit eder;
 * kalıcı tekrar koruması `src/__tests__/conformance/webhook-hmac-imza.test.ts`'te ölçülür.
 */
const TEST_SIRRI = 'test-webhook-secret-mock'

export function imzaliIstek(payload: unknown, secret: string = TEST_SIRRI): NextRequest {
  const govdeNesnesi =
    payload !== null && typeof payload === 'object' && !('event_id' in payload)
      ? { event_id: randomUUID(), ...(payload as Record<string, unknown>) }
      : payload
  const govde = JSON.stringify(govdeNesnesi)
  const zaman = String(Math.floor(Date.now() / 1000))
  return new NextRequest('http://localhost/api/webhook/supabase', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-webhook-timestamp': zaman,
      'x-webhook-signature': imzaUret(secret, zaman, govde),
    },
    body: govde,
  })
}
