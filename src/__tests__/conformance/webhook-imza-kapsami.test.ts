// @vitest-environment node
import { createHmac } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  hmacImzaGecerli,
  webhookImzaGecerli,
  webhookImzaMetni,
} from '../../../supabase/functions/_shared/sabit_zaman'

/**
 * INV-WEBHOOK-IMZA-1 · kargo ve iade webhook imzası zaman damgasını, olay kimliğini ve ham gövdeyi BİRLİKTE
 * kapsar; olay kimliği zorunludur (ALT-138, CLAUDE.md kural 11, cetvel edge-function-security-standard §3.5).
 *
 * NİÇİN: imza yalnız gövdeyi kapsarken zaman damgası ve olay kimliği imzasızdı. Yakalanmış geçerli bir istek
 * `x-timestamp` taze bir değerle, `x-event-id` yeni bir kimlikle değiştirilerek replay penceresini de
 * tekilleştirmeyi de atlatıyordu; kimliksiz istek tekilleştirmeye hiç girmiyordu.
 *
 * DAVRANIŞLA ölçülür: iki fonksiyon gerçek hâliyle yüklenir (`Deno.serve` işleyicisi yakalanır, supabase-js
 * sahte istemciyle değişir). SABOTAJ: aynı saldırılar imzayı yalnız gövdeye bağlayan ve olay kimliğini zorunlu
 * tutmayan kopyaya karşı da koşar ve orada GEÇTİKLERİ ölçülür (kalıp: kargo-webhook-monoton.test.ts).
 *
 * TOKEN YOLU YOK (ALT-166, 2026-11-07): eski `x-webhook-token` yolu zaman ve olay kimliğini imzalamıyordu; iki uç
 * da yalnız HMAC ile kimlik doğrular. `ORTAM` `*_WEBHOOK_TOKEN`ı bilerek TANIMLI tutar: kapı, ortamda token olması
 * yüzünden değil, kodda token yolu bulunmadığı için kapalıdır (aşağıdaki "TOKEN YOLU KALDIRILDI" kolu).
 */

const KOK = path.resolve(__dirname, '../../..')
const SIR = 'imza-test-siri'
const TOKEN = 'imza-test-token'

type Isleyici = (req: Request) => Promise<Response>
interface Uc {
  ad: 'shipping-webhook' | 'returns-webhook'
  sirAdi: string
  tokenAdi: string
  govde: Record<string, unknown>
}
const UCLAR: Uc[] = [
  {
    ad: 'shipping-webhook',
    sirAdi: 'SHIPPING_WEBHOOK_SECRET',
    tokenAdi: 'SHIPPING_WEBHOOK_TOKEN',
    govde: { order_id: '22222222-2222-4222-8222-222222222222', status: 'in_transit', tracking_number: 'TN-1' },
  },
  {
    ad: 'returns-webhook',
    sirAdi: 'RETURNS_WEBHOOK_SECRET',
    tokenAdi: 'RETURNS_WEBHOOK_TOKEN',
    govde: { return_id: '33333333-3333-4333-8333-333333333333', status: 'in_transit' },
  },
]

/** İmza kapsamını söken dönüşümler: imza yalnız gövde, olay kimliği isteğe bağlı. Her biri eşleşmek ZORUNDA. */
const SOKUMLER: [RegExp, string][] = [
  [/import \{ webhookImzaGecerli \}/, 'import { hmacImzaGecerli }'],
  [/webhookImzaGecerli\(secret, tsHeader, eventId, raw, (\w+)\)/, 'hmacImzaGecerli(secret, raw, $1)'],
  [/if \(!eventId\) \{/, 'if (false) {'],
]
function kapiyiSok(metin: string): string {
  let m = metin
  for (const [desen, yerine] of SOKUMLER) {
    if (!desen.test(m)) throw new Error(`sabotaj deseni eşleşmedi: ${desen}`)
    m = m.replace(desen, yerine)
  }
  return m
}

let yazimlar = 0
let gorulenOlaylar: string[] = []
/** processed_at'i DOLU olay kimlikleri: tekrar teslim yalnız bunlar için 200 duplicate alır (R1, ALT-138); sürenler 409 alır. */
let tamamlananOlaylar = new Set<string>()

/** İki fonksiyonun kullandığı supabase-js zincirinin alt kümesi; kapı sonrası mutlu yolu yürütmeye yeter. */
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
        // "Önce kaydet" sahiplenmesi: insert ... on conflict (event_id) do nothing returning.
        upsert(g: Record<string, unknown>) { d.op = 'upsert'; d.filtreler.push(['event_id', g.event_id]); return b },
        then(coz: (v: unknown) => unknown) { return Promise.resolve(calistir()).then(coz) },
      }
      function calistir(): { data: unknown; error: unknown } {
        if (tablo.endsWith('_webhook_events')) {
          const id = String(d.filtreler.find(([k]) => k === 'event_id')?.[1])
          if (d.op === 'upsert') {
            if (gorulenOlaylar.includes(id)) return { data: [], error: null }
            gorulenOlaylar.push(id)
            return { data: [{ event_id: id }], error: null }
          }
          if (d.op === 'select') {
            // Çakışma sonrası durum okuması: select('processed_at').eq('event_id', id).limit(1)
            return { data: gorulenOlaylar.includes(id) ? [{ processed_at: tamamlananOlaylar.has(id) ? '2026-11-06T00:00:00.000Z' : null }] : [], error: null }
          }
          if (d.op === 'update') {
            if (d.govde.processed_at) tamamlananOlaylar.add(id)
            return { data: null, error: null }
          }
          if (d.op === 'delete') {
            // Gerçek SQL: `.is('processed_at', null)` süzgeci tamamlanmış satırı SİLMEZ.
            const yalnizBos = d.filtreler.some(([k, v]) => k === 'processed_at' && v === null)
            if (!(yalnizBos && tamamlananOlaylar.has(id))) {
              gorulenOlaylar = gorulenOlaylar.filter((x) => x !== id)
              tamamlananOlaylar.delete(id)
            }
            return { data: null, error: null }
          }
          return { data: null, error: null }
        }
        if (d.op === 'update') {
          yazimlar++
          return { data: [{ id: 'x', status: 'shipped' }], error: null }
        }
        const satir =
          tablo === 'venthub_orders'
            ? { id: '22222222-2222-4222-8222-222222222222', tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000', status: 'confirmed', payment_status: 'paid' }
            : { id: '33333333-3333-4333-8333-333333333333', tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000', status: 'approved' }
        return d.tek ? { data: satir, error: null } : { data: [satir], error: null }
      }
      return b
    },
  }
}

let tmp = ''
function dizin(): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'webhook-imza-'))
  return tmp
}

function nodeKopyasi(ad: string, metin: string): string {
  const istemciYolu = path.join(dizin(), 'sahte-supabase.mjs')
  fs.writeFileSync(istemciYolu, 'export const createClient = () => globalThis.__sahteIstemci()\n')
  const paylasilan = pathToFileURL(path.join(KOK, 'supabase/functions/_shared')).href
  const cevrilmis = metin
    .replace(/["']https:\/\/esm\.sh\/@supabase\/supabase-js@[\d.]+["']/, `'${pathToFileURL(istemciYolu).href}'`)
    .replace(/(['"])\.\.\/_shared\//g, `$1${paylasilan}/`)
  if (/https:\/\/esm\.sh|["']npm:|['"]\.\.\//.test(cevrilmis)) {
    throw new Error(`${ad} yeni bir uzak/göreli içe aktarma eklemiş: nodeKopyasi güncellenmeli`)
  }
  const yol = path.join(dizin(), `${ad}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

// Ortam değişkenleri istek ANINDA okunur ve `Deno` sahtesi tektir: iki ucun değişkenleri birlikte verilir.
const ORTAM: Record<string, string> = {
  SUPABASE_URL: 'https://ornek.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-anahtari',
  ...Object.fromEntries(UCLAR.flatMap((u) => [[u.sirAdi, SIR], [u.tokenAdi, TOKEN]])),
}

async function isleyiciYukle(dosya: string): Promise<Isleyici> {
  let yakalanan: Isleyici | null = null
  vi.stubGlobal('Deno', {
    serve: (f: Isleyici) => {
      yakalanan = f
    },
    env: { get: (k: string) => ORTAM[k] },
  })
  await import(/* @vite-ignore */ pathToFileURL(dosya).href)
  if (!yakalanan) throw new Error('Deno.serve çağrılmadı')
  return yakalanan
}

const imzala = (metin: string, sir = SIR) => createHmac('sha256', sir).update(metin).digest('base64')

async function cagir(isleyici: Isleyici, uc: Uc, basliklar: Record<string, string>, ham = JSON.stringify(uc.govde)) {
  const r = await isleyici(
    new Request(`https://ornek.supabase.co/functions/v1/${uc.ad}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...basliklar },
      body: ham,
    }),
  )
  return { http: r.status, json: (await r.json()) as Record<string, unknown> }
}

/** Yeni biçimde doğru imzalanmış başlıklar. */
let olaySayaci = 0
function imzaliBasliklar(uc: Uc, ts = String(Date.now()), olay = `evt-${++olaySayaci}`) {
  const ham = JSON.stringify(uc.govde)
  return { 'x-timestamp': ts, 'x-event-id': olay, 'x-signature': imzala(webhookImzaMetni(ts, olay, ham)) }
}

const yeni = new Map<string, Isleyici>()
const kapisiz = new Map<string, Isleyici>()
const yuklemeHatasi: string[] = []

beforeAll(async () => {
  Object.assign(globalThis, { __sahteIstemci: sahteIstemci })
  vi.stubGlobal('fetch', async () => new Response('[]', { status: 200 }))
  for (const uc of UCLAR) {
    const kaynak = fs.readFileSync(path.join(KOK, `supabase/functions/${uc.ad}/index.ts`), 'utf8')
    yeni.set(uc.ad, await isleyiciYukle(nodeKopyasi(`${uc.ad}-yeni`, kaynak)))
    try {
      kapisiz.set(uc.ad, await isleyiciYukle(nodeKopyasi(`${uc.ad}-kapisiz`, kapiyiSok(kaynak))))
    } catch (e) {
      yuklemeHatasi.push(`${uc.ad}: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

beforeEach(() => {
  yazimlar = 0
  gorulenOlaylar = []
  tamamlananOlaylar = new Set<string>()
})

describe('INV-WEBHOOK-IMZA-1 · saf yardımcı', () => {
  it('imza metni `<zaman>.<olay>.<gövde>` biçiminde', () => {
    expect(webhookImzaMetni('1730700000000', 'evt-1', '{"a":1}')).toBe('1730700000000.evt-1.{"a":1}')
  })

  it('doğru imza kabul; zaman, olay ya da gövde değişince ret; boş zaman/olay ret', async () => {
    const imza = imzala(webhookImzaMetni('100', 'e1', 'g'))
    expect(await webhookImzaGecerli(SIR, '100', 'e1', 'g', imza)).toBe(true)
    expect(await webhookImzaGecerli(SIR, '100', 'e1', 'g', `sha256=${imza}`)).toBe(true)
    expect(await webhookImzaGecerli(SIR, '101', 'e1', 'g', imza)).toBe(false)
    expect(await webhookImzaGecerli(SIR, '100', 'e2', 'g', imza)).toBe(false)
    expect(await webhookImzaGecerli(SIR, '100', 'e1', 'h', imza)).toBe(false)
    expect(await webhookImzaGecerli('baska-sir', '100', 'e1', 'g', imza)).toBe(false)
    // eski biçim (yalnız gövde) yeni yardımcıdan geçmez
    expect(await webhookImzaGecerli(SIR, '100', 'e1', 'g', imzala('g'))).toBe(false)
    // imzasız alanla doğrulama yok: boş zaman / boş olay kimliği, "..g" imzalanmış olsa bile ret
    expect(await webhookImzaGecerli(SIR, '', '', 'g', imzala('..g'))).toBe(false)
    expect(await webhookImzaGecerli(SIR, '100', '', 'g', imzala('100..g'))).toBe(false)
  })

  it('bölünme belirsizliği: noktalı zaman/olay kimliği reddedilir (aynı imzayla yeni olay kimliği üretilemez)', async () => {
    const zaman = '2026-11-04T10:00:00.000Z'
    const imza = imzala(webhookImzaMetni(zaman, 'e1', 'g'))
    // saldırı: aynı imzalı metni farklı böl → zaman '2026-11-04T10:00:00', olay '000Z.e1'
    expect(webhookImzaMetni('2026-11-04T10:00:00', '000Z.e1', 'g')).toBe(webhookImzaMetni(zaman, 'e1', 'g'))
    expect(await webhookImzaGecerli(SIR, '2026-11-04T10:00:00', '000Z.e1', 'g', imza)).toBe(false)
    // noktalı zaman doğru imzalı olsa bile kabul edilmez; kesirsiz ISO ve epoch ms kabul
    expect(await webhookImzaGecerli(SIR, zaman, 'e1', 'g', imza)).toBe(false)
    const iso = '2026-11-04T10:00:00Z'
    expect(await webhookImzaGecerli(SIR, iso, 'e1', 'g', imzala(webhookImzaMetni(iso, 'e1', 'g')))).toBe(true)
  })

  it('iki fonksiyon da imzayı yeni yardımcıyla doğruluyor (yalnız-gövde çağrısı yok)', () => {
    for (const uc of UCLAR) {
      const kaynak = fs.readFileSync(path.join(KOK, `supabase/functions/${uc.ad}/index.ts`), 'utf8')
      expect(kaynak, uc.ad).toMatch(/webhookImzaGecerli\(secret, tsHeader, eventId, raw, \w+\)/)
      expect(kaynak, uc.ad).not.toMatch(/hmacImzaGecerli\s*\(/)
    }
  })

  it('iki fonksiyon da ortamdan *_WEBHOOK_TOKEN okumuyor (token yolu kodda yok, ALT-166)', () => {
    for (const uc of UCLAR) {
      const kaynak = fs.readFileSync(path.join(KOK, `supabase/functions/${uc.ad}/index.ts`), 'utf8')
      expect(kaynak, uc.ad).not.toMatch(/Deno\.env\.get\(\s*['"][A-Z_]*WEBHOOK_TOKEN['"]\s*\)/)
      expect(kaynak, uc.ad).not.toMatch(/headers\.get\(\s*['"]x-webhook-token['"]\s*\)/)
      expect(kaynak, uc.ad).not.toMatch(/timingSafeEquals/)
    }
  })

  it('hmacImzaGecerli genel yardımcı olarak duruyor (başka çağıranlar için davranışı değişmedi)', async () => {
    expect(await hmacImzaGecerli(SIR, 'g', imzala('g'))).toBe(true)
  })
})

describe.each(UCLAR)('INV-WEBHOOK-IMZA-1 · $ad: imza zaman + olay + gövdeyi kapsar', (uc) => {
  it('yeni biçimde doğru imzalı istek kapıyı geçer', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, imzaliBasliklar(uc))
    expect(r.http).toBe(200)
    expect(yazimlar).toBeGreaterThan(0)
  })

  it('ESKİ biçim (yalnız gövde imzası) 401', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-event-id': 'evt-eski', 'x-signature': imzala(ham) })
    expect(r.http).toBe(401)
    expect(yazimlar).toBe(0)
  })

  it('REPLAY: yakalanan istek taze zaman damgasıyla yeniden oynatılınca 401', async () => {
    const eski = imzaliBasliklar(uc, String(Date.now() - 60 * 60 * 1000), 'evt-yakalanan')
    const r = await cagir(yeni.get(uc.ad)!, uc, { ...eski, 'x-timestamp': String(Date.now()) })
    expect(r.http).toBe(401)
    expect(yazimlar).toBe(0)
  })

  it('REPLAY: yakalanan istek yeni olay kimliğiyle yeniden oynatılınca 401 (tekilleştirme atlatılamaz)', async () => {
    const b = imzaliBasliklar(uc, String(Date.now()), 'evt-ilk')
    const ilk = await cagir(yeni.get(uc.ad)!, uc, b)
    expect(ilk.http).toBe(200)
    const tekrar = await cagir(yeni.get(uc.ad)!, uc, { ...b, 'x-event-id': 'evt-uydurma' })
    expect(tekrar.http).toBe(401)
  })

  it('aynı olay aynen tekrar gelirse tekilleştirme yakalar (duplicate)', async () => {
    const b = imzaliBasliklar(uc, String(Date.now()), 'evt-ayni')
    await cagir(yeni.get(uc.ad)!, uc, b)
    const once = yazimlar
    const r = await cagir(yeni.get(uc.ad)!, uc, b)
    expect(r.http).toBe(200)
    expect(r.json.duplicate).toBe(true)
    expect(yazimlar).toBe(once)
  })

  it('olay kimliği yoksa HMAC yolu 401 (imzasız alanla doğrulama yok)', async () => {
    const ts = String(Date.now())
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': ts, 'x-signature': imzala(webhookImzaMetni(ts, '', ham)) })
    expect(r.http).toBe(401)
  })

  it('TOKEN YOLU KALDIRILDI (ALT-166): ortamda *_WEBHOOK_TOKEN TANIMLI olsa bile yalnız x-webhook-token + taze zaman + olay kimliği 401, DB yazılmaz', async () => {
    // ön koşul: token ortamda gerçekten tanımlı; 401'in sebebi "token yok" olamaz
    expect(ORTAM[uc.tokenAdi]).toBe(TOKEN)
    const r = await cagir(yeni.get(uc.ad)!, uc, {
      'x-webhook-token': TOKEN,
      'x-timestamp': String(Date.now()),
      'x-event-id': 'evt-token-yolu',
    })
    expect(r.http).toBe(401)
    expect(r.json.error).toBe('Unauthorized')
    expect(yazimlar).toBe(0)
    // kapı olay sahiplenmesinden ÖNCE kapanır: olay tablosuna satır düşmez
    expect(gorulenOlaylar).toEqual([])
  })

  it('token + imza kipi karışık: geçerli token yanlış imzayı kurtarmaz (401, DB yazılmaz)', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, {
      'x-webhook-token': TOKEN,
      'x-timestamp': String(Date.now()),
      'x-event-id': 'evt-token-yanlis-imza',
      'x-signature': 'gecersiz',
    })
    expect(r.http).toBe(401)
    expect(yazimlar).toBe(0)
  })

  it('olay kimliği yoksa token da imza da kabul edilmez (401), DB yazılmaz', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-webhook-token': TOKEN, 'x-timestamp': String(Date.now()) })
    expect(r.http).toBe(401)
    expect(yazimlar).toBe(0)
  })

  it('REPLAY: kesirli ISO zamanlı imzalı metni farklı bölüp yeni olay kimliği üretmek 401', async () => {
    const iso = new Date().toISOString() // ör. 2026-11-04T17:00:00.123Z
    const [onu, kesir] = iso.split('.')
    const ham = JSON.stringify(uc.govde)
    const imza = imzala(webhookImzaMetni(iso, 'e1', ham))
    expect(webhookImzaMetni(onu, `${kesir}.e1`, ham)).toBe(webhookImzaMetni(iso, 'e1', ham))
    const bolunmus = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': onu, 'x-event-id': `${kesir}.e1`, 'x-signature': imza })
    expect(bolunmus.http).toBe(401)
    const kesirli = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': iso, 'x-event-id': 'e1', 'x-signature': imza })
    expect(kesirli.http).toBe(401)
    expect(yazimlar).toBe(0)
    // kesirsiz ISO kabul
    const duz = `${onu}Z`
    const ok = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': duz, 'x-event-id': 'e-iso', 'x-signature': imzala(webhookImzaMetni(duz, 'e-iso', ham)) })
    expect(ok.http).toBe(200)
  })

  it('x-id başlığı da olay kimliği olarak kabul edilir', async () => {
    const ts = String(Date.now())
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': ts, 'x-id': 'evt-xid', 'x-signature': imzala(webhookImzaMetni(ts, 'evt-xid', ham)) })
    expect(r.http).toBe(200)
  })
})

describe.each(UCLAR)('INV-WEBHOOK-IMZA-1 · $ad SABOTAJ kolu (imza yalnız gövdeye bağlanınca saldırılar GEÇER)', (uc) => {
  it('sabotajlı kopya yüklenebildi (sahte-yeşil kilidi)', () => {
    expect(yuklemeHatasi).toEqual([])
    expect(kapisiz.get(uc.ad)).toBeDefined()
  })

  it('kapısız kopyada: yeni olay kimliğiyle replay GEÇER', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(kapisiz.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-event-id': 'evt-uydurma', 'x-signature': imzala(ham) })
    expect(r.http, 'kapı sökülünce saldırı geçmeli; geçmiyorsa test kapıyı ölçmüyor').toBe(200)
  })

  it('kapısız kopyada: olay kimliksiz (yalnız gövde imzalı) istek tekilleştirmesiz GEÇER', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(kapisiz.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-signature': imzala(ham) })
    expect(r.http, 'kapı sökülünce saldırı geçmeli; geçmiyorsa test kapıyı ölçmüyor').toBe(200)
  })
})
