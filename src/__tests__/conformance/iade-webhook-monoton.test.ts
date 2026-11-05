// @vitest-environment node
import { createHmac } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { webhookImzaMetni } from '../../../supabase/functions/_shared/sabit_zaman'

/**
 * INV-IADE-WEBHOOK-MONOTON-1 · returns-webhook iade durumunu OKUNAN duruma bağlı yazar ve olayı işlemden
 * ÖNCE sahiplenir (ALT-138, CLAUDE.md kural 11: iade durumları monoton, webhook idempotent).
 *
 * NİÇİN: (1) yazım koşulsuzdu (`update(patch).eq('id', …)`): geçiş kapısı okunan `approved`'ı görüp
 * `received`'a izin verdikten sonra admin iadeyi `refunded` yaptıysa, kargo olayı parası iade edilmiş iadeyi
 * `received`'a geri çekiyordu. (2) tekilleştirme kontrol-sonra-kaydet idi: aynı olayın eşzamanlı iki teslimi
 * ikisi de "yok" görüp ikisi de işleniyordu.
 *
 * DAVRANIŞLA ölçülür (kalıp: webhook-imza-kapsami.test.ts). SABOTAJ: koşul sökülen kopya aynı yarışta
 * `refunded` iadeyi `received`'a çeker — kilit testinin kırmızıyı gerçekten gördüğü ölçülür.
 */

const KOK = path.resolve(__dirname, '../../..')
const SIR = 'iade-test-siri'
const IADE = '33333333-3333-4333-8333-333333333333'
type Isleyici = (req: Request) => Promise<Response>

let satir: { id: string; tenant_id: string; status: string } = { id: IADE, tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000', status: 'in_transit' }
let olaylar: string[] = []
let iadeYazimlari = 0
/** Okuma ile yazma arasına giren başka yazıcı (admin iadeyi tamamladı). */
let yazimOncesi: (() => void) | null = null

function sahteIstemci() {
  return {
    from(tablo: string) {
      const d: { op: string; govde: Record<string, unknown>; filtreler: [string, unknown][]; tek: boolean } = { op: 'select', govde: {}, filtreler: [], tek: false }
      const b = {
        select() { return b },
        limit() { return b },
        order() { return b },
        single() { d.tek = true; return b },
        eq(k: string, v: unknown) { d.filtreler.push([k, v]); return b },
        is(k: string, v: unknown) { d.filtreler.push([k, v]); return b },
        update(g: Record<string, unknown>) { d.op = 'update'; d.govde = g; return b },
        delete() { d.op = 'delete'; return b },
        upsert(g: Record<string, unknown>) { d.op = 'upsert'; d.govde = g; return b },
        then(coz: (v: unknown) => unknown) { return Promise.resolve(calistir()).then(coz) },
      }
      function calistir(): { data: unknown; error: unknown } {
        if (tablo === 'returns_webhook_events') {
          if (d.op === 'upsert') {
            const id = String(d.govde.event_id)
            if (olaylar.includes(id)) return { data: [], error: null }
            olaylar.push(id)
            return { data: [{ event_id: id }], error: null }
          }
          if (d.op === 'delete') {
            const id = String(d.filtreler.find(([k]) => k === 'event_id')?.[1])
            olaylar = olaylar.filter((x) => x !== id)
          }
          return { data: null, error: null }
        }
        const uyar = d.filtreler.every(([k, v]) => (satir as Record<string, unknown>)[k] === v)
        if (d.op === 'update') {
          yazimOncesi?.()
          yazimOncesi = null
          const tutar = d.filtreler.every(([k, v]) => (satir as Record<string, unknown>)[k] === v)
          if (!tutar) return { data: [], error: null }
          iadeYazimlari++
          satir = { ...satir, ...(d.govde as { status?: string }) }
          return { data: [{ id: satir.id }], error: null }
        }
        const bulunan = uyar ? { ...satir } : null
        return d.tek ? { data: bulunan, error: bulunan ? null : { message: 'not found' } } : { data: bulunan ? [bulunan] : [], error: null }
      }
      return b
    },
  }
}

let tmp = ''
function nodeKopyasi(ad: string, metin: string): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'iade-webhook-'))
  const istemciYolu = path.join(tmp, 'sahte-supabase.mjs')
  fs.writeFileSync(istemciYolu, 'export const createClient = () => globalThis.__sahteIstemci()\n')
  const paylasilan = pathToFileURL(path.join(KOK, 'supabase/functions/_shared')).href
  const cevrilmis = metin
    .replace(/["']https:\/\/esm\.sh\/@supabase\/supabase-js@[\d.]+["']/, `'${pathToFileURL(istemciYolu).href}'`)
    .replace(/(['"])\.\.\/_shared\//g, `$1${paylasilan}/`)
  if (/https:\/\/esm\.sh|["']npm:|['"]\.\.\//.test(cevrilmis)) throw new Error('returns-webhook yeni bir uzak/göreli içe aktarma eklemiş')
  const yol = path.join(tmp, `${ad}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

async function isleyiciYukle(dosya: string): Promise<Isleyici> {
  let yakalanan: Isleyici | null = null
  vi.stubGlobal('Deno', {
    serve: (f: Isleyici) => { yakalanan = f },
    env: { get: (k: string) => ({ SUPABASE_URL: 'https://ornek.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-anahtari', RETURNS_WEBHOOK_SECRET: SIR } as Record<string, string>)[k] },
  })
  await import(/* @vite-ignore */ pathToFileURL(dosya).href)
  if (!yakalanan) throw new Error('Deno.serve çağrılmadı')
  return yakalanan
}

async function cagir(isleyici: Isleyici, olay: string, govde: Record<string, unknown> = { return_id: IADE, status: 'delivered' }) {
  const ham = JSON.stringify(govde)
  const ts = String(Date.now())
  const sig = createHmac('sha256', SIR).update(webhookImzaMetni(ts, olay, ham)).digest('base64')
  const r = await isleyici(new Request('https://ornek.supabase.co/functions/v1/returns-webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-timestamp': ts, 'x-event-id': olay, 'x-signature': sig },
    body: ham,
  }))
  return { http: r.status, json: (await r.json()) as Record<string, unknown> }
}

const KOSUL = /\n\s*\.eq\('status', String\(cur\.status\)\)/
let yeni: Isleyici
let kosulsuz: Isleyici

beforeAll(async () => {
  Object.assign(globalThis, { __sahteIstemci: sahteIstemci })
  vi.stubGlobal('fetch', async () => new Response('[]', { status: 200 }))
  const kaynak = fs.readFileSync(path.join(KOK, 'supabase/functions/returns-webhook/index.ts'), 'utf8')
  if (!KOSUL.test(kaynak)) throw new Error('sabotaj deseni eşleşmedi: koşullu yazım bulunamadı')
  yeni = await isleyiciYukle(nodeKopyasi('returns-webhook-yeni', kaynak))
  kosulsuz = await isleyiciYukle(nodeKopyasi('returns-webhook-kosulsuz', kaynak.replace(KOSUL, '')))
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

beforeEach(() => {
  satir = { id: IADE, tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000', status: 'in_transit' }
  olaylar = []
  iadeYazimlari = 0
  yazimOncesi = null
})

describe('INV-IADE-WEBHOOK-MONOTON-1 · koşullu yazım', () => {
  it('yarış yoksa in_transit → received yazılır', async () => {
    const r = await cagir(yeni, 'evt-1')
    expect(r.http).toBe(200)
    expect(satir.status).toBe('received')
  })

  it('okuma ile yazma arasında refunded olan iadeye received YAZILMAZ: 409, olay sahipliği bırakılır', async () => {
    yazimOncesi = () => { satir = { ...satir, status: 'refunded' } }
    const r = await cagir(yeni, 'evt-yaris')
    expect(r.http).toBe(409)
    expect(r.json.code).toBe('STATE_CHANGED')
    expect(satir.status).toBe('refunded')
    expect(iadeYazimlari).toBe(0)
    // yeniden deneme "tekrar" sanılıp yutulmasın
    expect(olaylar).not.toContain('evt-yaris')
    // yeniden deneme taze durumla kapıdan geçer: refunded soğurucu → yazım yok
    const tekrar = await cagir(yeni, 'evt-yaris')
    expect(tekrar.http).toBe(200)
    expect(tekrar.json.reason).toBe('transition_blocked')
    expect(satir.status).toBe('refunded')
  })

  it('SABOTAJ: koşul sökülünce aynı yarış refunded iadeyi received yapar (kilit kırmızıyı görüyor)', async () => {
    yazimOncesi = () => { satir = { ...satir, status: 'refunded' } }
    const r = await cagir(kosulsuz, 'evt-sabotaj')
    expect(r.http).toBe(200)
    expect(satir.status).toBe('received')
  })
})

describe('INV-IADE-WEBHOOK-MONOTON-1 · önce kaydet tekilleştirmesi', () => {
  it('aynı olay eşzamanlı iki kez gelirse yalnız biri işlenir, diğeri 200 duplicate', async () => {
    const [a, b] = await Promise.all([cagir(yeni, 'evt-ikiz'), cagir(yeni, 'evt-ikiz')])
    expect([a.http, b.http]).toEqual([200, 200])
    expect([a.json.duplicate, b.json.duplicate].filter(Boolean)).toHaveLength(1)
    expect(iadeYazimlari).toBe(1)
  })

  it('kaynak kontrol-sonra-kaydet değil: olay tablosunda select tabanlı tekrar kontrolü yok, upsert ignoreDuplicates var', () => {
    for (const ad of ['returns-webhook', 'shipping-webhook']) {
      const k = fs.readFileSync(path.join(KOK, `supabase/functions/${ad}/index.ts`), 'utf8')
      expect(k, ad).toMatch(/_webhook_events'\)\s*\.upsert\([\s\S]*?ignoreDuplicates: true/)
      expect(k, ad).not.toMatch(/_webhook_events'\)\s*\.select\(/)
      expect(k, ad).not.toMatch(/_webhook_events'\)\.insert\(/)
    }
  })
})
