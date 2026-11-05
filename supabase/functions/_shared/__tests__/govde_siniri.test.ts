import { describe, expect, it } from 'vitest'

import { govdeyiSinirliOku } from '../govde_siniri'

/**
 * `_shared/govde_siniri.ts` DAVRANIŞ KİLİDİ (OPS-213, güvenlik incelemesi 2026-11-03 takibi).
 * `log-client-error` gövdeyi bu yardımcıyla okur; statik kapı:
 * `src/__tests__/conformance/edge-cikti-kodlama-maske.test.ts` (K7).
 */

/** Content-Length başlığı OLMAYAN (chunked) istek: gövde parça parça akar. */
function akisliIstek(parcalar: string[]): Request {
  const kodlayici = new TextEncoder()
  const govde = new ReadableStream<Uint8Array>({
    start(denetci) {
      for (const p of parcalar) denetci.enqueue(kodlayici.encode(p))
      denetci.close()
    },
  })
  return new Request('https://x.test/log', { method: 'POST', body: govde, duplex: 'half' } as RequestInit)
}

describe('govdeyiSinirliOku', () => {
  it('sınır içindeki gövdeyi aynen döndürür (çok baytlı karakter dahil)', async () => {
    const r = await govdeyiSinirliOku(new Request('https://x.test', { method: 'POST', body: '{"msg":"şğü"}' }), 1024)
    expect(r).toEqual({ ok: true, metin: '{"msg":"şğü"}' })
  })

  it('Content-Length sınırı aşıyorsa gövdeye hiç dokunmadan reddeder', async () => {
    const req = new Request('https://x.test', { method: 'POST', body: 'a'.repeat(10), headers: { 'content-length': '999999' } })
    expect(await govdeyiSinirliOku(req, 1024)).toEqual({ ok: false, sebep: 'cok_buyuk' })
    expect(req.bodyUsed).toBe(false)
  })

  it('⭐başlıksız akışta sınır aşılınca okumayı keser (başlık yalan söyleyemez)', async () => {
    const r = await govdeyiSinirliOku(akisliIstek(Array(100).fill('x'.repeat(1024))), 64 * 1024)
    expect(r).toEqual({ ok: false, sebep: 'cok_buyuk' })
    const tamSinir = await govdeyiSinirliOku(akisliIstek(Array(64).fill('x'.repeat(1024))), 64 * 1024)
    expect(tamSinir.ok).toBe(true)
  })

  it('bayt sayar, karakter değil: 2 baytlık harfle sınır yarıda dolar', async () => {
    const req = new Request('https://x.test', { method: 'POST', body: 'ş'.repeat(600) })
    expect(await govdeyiSinirliOku(req, 1000)).toEqual({ ok: false, sebep: 'cok_buyuk' })
  })

  it('gövdesiz istek boş metin döner', async () => {
    expect(await govdeyiSinirliOku(new Request('https://x.test', { method: 'POST' }), 10)).toEqual({ ok: true, metin: '' })
  })
})
