// @vitest-environment node
import { createHmac } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { webhookImzaMetni } from '../../../supabase/functions/_shared/sabit_zaman'

/**
 * INV-WEBHOOK-IMZA-2 · `order-paid-webhook` ve `quote-notification-webhook` imzalı yolu zaman damgasını, olay
 * kimliğini ve ham gövdeyi BİRLİKTE kapsar (OPS-293 D1; kardeş kapı: webhook-imza-kapsami.test.ts, INV-WEBHOOK-IMZA-1).
 *
 * NİÇİN AYRI DOSYA: INV-WEBHOOK-IMZA-1 olay tablosu (`*_webhook_events`) tekilleştirmesini, token yolunun kodda
 * OLMADIĞINI ve `timingSafeEquals` içermediğini ölçer; bu iki uçta olay tablosu YOK (D6, migration ister) ve düz
 * secret yolu bilerek duruyor (ISTISNA-OPS293-D1, INV-WEBHOOK-DUZ-YOL-1). O testin kollarını bu uçlara uygulamak
 * onun iddialarını zayıflatmak ya da bozmak olurdu; shipping/returns kolları DEĞİŞMEDİ.
 *
 * Bu dosya yalnız imza kapsamı kollarını koşar: zaman + olay kimliği + gövde imzalı; yalnız gövde imzası reddedilir;
 * bayat zaman reddedilir; olay kimliği eksikse imzalı yol reddedilir; noktalı zaman bölünme saldırısı reddedilir.
 * Düz yolun HÂLÂ çalıştığı da ölçülür (D2'ye kadar canlı yol; silinirse ödeme/teklif e-postaları durur).
 *
 * KAPI GEÇTİ = 404: sahte istemci kayıtlı satırı BULAMAZ (`maybeSingle` → null); kimlik + replay guard geçilirse uç
 * `*_not_found` ile 404 döner, geçilmezse 401. Böylece e-posta gönderen ağır mutlu yola girmeden yalnız kapı ölçülür.
 * SABOTAJ: aynı saldırılar imzayı yalnız gövdeye bağlayıp olay kimliğini yok sayan kopyaya karşı da koşar ve orada
 * GEÇTİKLERİ ölçülür (kalıp: webhook-imza-kapsami.test.ts).
 */

const KOK = path.resolve(__dirname, '../../..')
const SIR = 'imza-ek-test-siri'
const FN = path.join(KOK, 'supabase/functions')

type Isleyici = (req: Request) => Promise<Response>
interface Uc {
  ad: 'order-paid-webhook' | 'quote-notification-webhook'
  sirAdi: string
  govde: Record<string, unknown>
  yok: string
}
const UCLAR: Uc[] = [
  {
    ad: 'order-paid-webhook',
    sirAdi: 'ORDER_PAID_WEBHOOK_SECRET',
    govde: { order_id: '44444444-4444-4444-8444-444444444444' },
    yok: 'order_not_found',
  },
  {
    ad: 'quote-notification-webhook',
    sirAdi: 'QUOTE_WEBHOOK_SECRET',
    govde: { quote_id: '55555555-5555-4555-8555-555555555555' },
    yok: 'quote_not_found',
  },
]

/** İmza kapsamını söken dönüşümler: imza yalnız gövde, olay kimliği yok sayılır. Her biri eşleşmek ZORUNDA. */
const SOKUMLER: [RegExp, string][] = [
  [/import \{ timingSafeEquals, webhookImzaGecerli \}/, 'import { timingSafeEquals, hmacImzaGecerli }'],
  [/webhookImzaGecerli\(secret, tsHeader\.trim\(\), eventId, raw, (\w+)\)/, 'hmacImzaGecerli(secret, raw, $1)'],
]
function kapiyiSok(metin: string): string {
  let m = metin
  for (const [desen, yerine] of SOKUMLER) {
    if (!desen.test(m)) throw new Error(`sabotaj deseni eşleşmedi: ${desen}`)
    m = m.replace(desen, yerine)
  }
  return m
}

let aramalar = 0

/** Kapıdan sonraki ilk DB okuması: satır yok. Kaç kez okunduğu "kapı geçildi mi"nin ikinci kanıtıdır. */
function sahteIstemci() {
  const b = {
    select() { return b },
    eq() { return b },
    maybeSingle() { aramalar++; return Promise.resolve({ data: null, error: null }) },
  }
  return { from() { return b } }
}

let tmp = ''
function dizin(): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'webhook-imza-ek-'))
  return tmp
}

/**
 * Edge kaynağını Node'da yüklenebilir kopyaya çevirir: uzak supabase-js sahte istemciyle, `../_shared/` göreli
 * yolları mutlak dosya adresiyle, `./` kardeş dosyalar işlev dizininin adresiyle değişir. `tenant_config.ts` esm.sh'ten
 * supabase-js çeker (ağ gerekir) ve kapıdan sonraki yolda kullanılır; burada yalnız kapı ölçüldüğü için kökü stub'lanır.
 */
function nodeKopyasi(ad: string, uc: Uc['ad'], metin: string): string {
  const d = dizin()
  const istemciYolu = path.join(d, 'sahte-supabase.mjs')
  fs.writeFileSync(istemciYolu, 'export const createClient = () => globalThis.__sahteIstemci()\n')
  const tenantStub = path.join(d, 'tenant-config-stub.mjs')
  fs.writeFileSync(tenantStub, "export const getTenantBranding = async () => ({})\nexport const VARSAYILAN_GONDERICI = 'test'\n")
  const paylasilan = pathToFileURL(path.join(KOK, 'supabase/functions/_shared')).href
  const kardes = pathToFileURL(path.join(FN, uc)).href
  const cevrilmis = metin
    .replace(/["']https:\/\/esm\.sh\/@supabase\/supabase-js@[\d.]+["']/, `'${pathToFileURL(istemciYolu).href}'`)
    .replace(/["']\.\.\/_shared\/tenant_config\.ts["']/, `'${pathToFileURL(tenantStub).href}'`)
    .replace(/(['"])\.\.\/_shared\//g, `$1${paylasilan}/`)
    .replace(/(['"])\.\/(?=[\w-]+\.ts\1)/g, `$1${kardes}/`)
  if (/https:\/\/esm\.sh|["']npm:|['"]\.\.?\//.test(cevrilmis)) {
    throw new Error(`${ad} yeni bir uzak/göreli içe aktarma eklemiş: nodeKopyasi güncellenmeli`)
  }
  const yol = path.join(d, `${ad}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

const ORTAM: Record<string, string> = {
  SUPABASE_URL: 'https://ornek.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-anahtari',
  ...Object.fromEntries(UCLAR.map((u) => [u.sirAdi, SIR])),
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
const imzalaHex = (metin: string, sir = SIR) => createHmac('sha256', sir).update(metin).digest('hex')

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
  // Kapıdan sonraki mutlu yola girilmiyor; yine de gerçek ağ çağrısı sızmasın diye engellenir.
  vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 200 })))
  for (const uc of UCLAR) {
    const kaynak = fs.readFileSync(path.join(FN, uc.ad, 'index.ts'), 'utf8')
    yeni.set(uc.ad, await isleyiciYukle(nodeKopyasi(`${uc.ad}-yeni`, uc.ad, kaynak)))
    try {
      kapisiz.set(uc.ad, await isleyiciYukle(nodeKopyasi(`${uc.ad}-kapisiz`, uc.ad, kapiyiSok(kaynak))))
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
  aramalar = 0
})

describe.each(UCLAR)('INV-WEBHOOK-IMZA-2 · $ad: imza zaman + olay + gövdeyi kapsar', (uc) => {
  it('doğru imzalı istek (zaman + olay kimliği + gövde) kapıyı geçer (404 *_not_found), DB okunur', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, imzaliBasliklar(uc))
    expect(r.http).toBe(404)
    expect(r.json.error).toBe(uc.yok)
    expect(aramalar).toBe(1)
  })

  it('`sha256=` önekli imza da kabul edilir (returns-webhook ile aynı sözleşme)', async () => {
    const b = imzaliBasliklar(uc)
    const r = await cagir(yeni.get(uc.ad)!, uc, { ...b, 'x-signature': `sha256=${b['x-signature']}` })
    expect(r.http).toBe(404)
  })

  it('ESKİ biçim (yalnız gövde imzası, base64) 401, DB okunmaz', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-event-id': 'evt-eski', 'x-signature': imzala(ham) })
    expect(r.http).toBe(401)
    expect(r.json.error).toBe('unauthorized')
    expect(aramalar).toBe(0)
  })

  it('ESKİ biçim (yalnız gövde imzası, hex: yerel hmacValid) 401, DB okunmaz', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-event-id': 'evt-eski-hex', 'x-signature': imzalaHex(ham) })
    expect(r.http).toBe(401)
    expect(aramalar).toBe(0)
  })

  it('REPLAY: yakalanan istek taze zaman damgasıyla yeniden oynatılınca 401', async () => {
    const eski = imzaliBasliklar(uc, String(Date.now() - 60 * 60 * 1000), 'evt-yakalanan')
    const r = await cagir(yeni.get(uc.ad)!, uc, { ...eski, 'x-timestamp': String(Date.now()) })
    expect(r.http).toBe(401)
    expect(aramalar).toBe(0)
  })

  it('bayat zaman damgası (doğru imzalı, 1 saat önce) 401 stale_timestamp', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, imzaliBasliklar(uc, String(Date.now() - 60 * 60 * 1000), 'evt-bayat'))
    expect(r.http).toBe(401)
    expect(r.json.error).toBe('stale_timestamp')
    expect(aramalar).toBe(0)
  })

  it('REPLAY: yakalanan istek yeni olay kimliğiyle yeniden oynatılınca 401 (olay kimliği imzalı)', async () => {
    const b = imzaliBasliklar(uc, String(Date.now()), 'evt-ilk')
    const ilk = await cagir(yeni.get(uc.ad)!, uc, b)
    expect(ilk.http).toBe(404)
    const tekrar = await cagir(yeni.get(uc.ad)!, uc, { ...b, 'x-event-id': 'evt-uydurma' })
    expect(tekrar.http).toBe(401)
  })

  it('olay kimliği yoksa imzalı yol 401 (imzasız alanla doğrulama yok)', async () => {
    const ts = String(Date.now())
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': ts, 'x-signature': imzala(webhookImzaMetni(ts, '', ham)) })
    expect(r.http).toBe(401)
    expect(aramalar).toBe(0)
  })

  it('zaman başlığı yoksa imzalı yol 401 (zaman imzanın parçası)', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-event-id': 'evt-zamansiz', 'x-signature': imzala(webhookImzaMetni('', 'evt-zamansiz', ham)) })
    expect(r.http).toBe(401)
    expect(aramalar).toBe(0)
  })

  it('REPLAY: kesirli ISO zamanlı imzalı metni farklı bölüp yeni olay kimliği üretmek 401; kesirsiz ISO kabul', async () => {
    const iso = new Date().toISOString() // ör. 2026-11-04T17:00:00.123Z
    const [onu, kesir] = iso.split('.')
    const ham = JSON.stringify(uc.govde)
    const imza = imzala(webhookImzaMetni(iso, 'e1', ham))
    expect(webhookImzaMetni(onu, `${kesir}.e1`, ham)).toBe(webhookImzaMetni(iso, 'e1', ham))
    const bolunmus = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': onu, 'x-event-id': `${kesir}.e1`, 'x-signature': imza })
    expect(bolunmus.http).toBe(401)
    const kesirli = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': iso, 'x-event-id': 'e1', 'x-signature': imza })
    expect(kesirli.http).toBe(401)
    expect(aramalar).toBe(0)
    const duz = `${onu}Z`
    const ok = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': duz, 'x-event-id': 'e-iso', 'x-signature': imzala(webhookImzaMetni(duz, 'e-iso', ham)) })
    expect(ok.http).toBe(404)
  })

  it('yanlış sırla imzalı istek 401', async () => {
    const ts = String(Date.now())
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': ts, 'x-event-id': 'e-yanlis', 'x-signature': imzala(webhookImzaMetni(ts, 'e-yanlis', ham), 'baska-sir') })
    expect(r.http).toBe(401)
  })
})

describe.each(UCLAR)('INV-WEBHOOK-IMZA-2 · $ad: düz secret yolu (ISTISNA-OPS293-D1) bilerek ayakta ve sabit zamanlı', (uc) => {
  it('düz yol: doğru x-webhook-secret + taze x-timestamp kapıyı geçer (D2 öncesi canlı gönderici yolu)', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-webhook-secret': SIR, 'x-timestamp': String(Date.now()) })
    expect(r.http).toBe(404)
    expect(r.json.error).toBe(uc.yok)
  })

  it('düz yol: yanlış sır (eşit uzunlukta) 401', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-webhook-secret': 'x'.repeat(SIR.length), 'x-timestamp': String(Date.now()) })
    expect(r.http).toBe(401)
    expect(r.json.error).toBe('unauthorized')
    expect(aramalar).toBe(0)
  })

  it('düz yol: yanlış sır (kısa, uzun, önek) 401', async () => {
    for (const yanlis of [SIR.slice(0, -1), `${SIR}x`, SIR.slice(0, 3), 'a']) {
      const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-webhook-secret': yanlis, 'x-timestamp': String(Date.now()) })
      expect(r.http, yanlis).toBe(401)
    }
    expect(aramalar).toBe(0)
  })

  it('düz yol: x-timestamp zorunlu (yok → 401 missing_timestamp; bayat → 401 stale_timestamp)', async () => {
    const yok = await cagir(yeni.get(uc.ad)!, uc, { 'x-webhook-secret': SIR })
    expect(yok.http).toBe(401)
    expect(yok.json.error).toBe('missing_timestamp')
    const bayat = await cagir(yeni.get(uc.ad)!, uc, { 'x-webhook-secret': SIR, 'x-timestamp': String(Date.now() - 60 * 60 * 1000) })
    expect(bayat.http).toBe(401)
    expect(bayat.json.error).toBe('stale_timestamp')
    expect(aramalar).toBe(0)
  })

  it('kimlik başlığı hiç yoksa 401 (sır tanımlı, fail-closed)', async () => {
    const r = await cagir(yeni.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()) })
    expect(r.http).toBe(401)
    expect(aramalar).toBe(0)
  })
})

describe.each(UCLAR)('INV-WEBHOOK-IMZA-2 · $ad SABOTAJ kolu (imza yalnız gövdeye bağlanınca saldırılar GEÇER)', (uc) => {
  it('sabotajlı kopya yüklenebildi (sahte-yeşil kilidi)', () => {
    expect(yuklemeHatasi).toEqual([])
    expect(kapisiz.get(uc.ad)).toBeDefined()
  })

  it('kapısız kopyada: yeni olay kimliğiyle replay GEÇER', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(kapisiz.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-event-id': 'evt-uydurma', 'x-signature': imzala(ham) })
    expect(r.http, 'kapı sökülünce saldırı geçmeli; geçmiyorsa test kapıyı ölçmüyor').toBe(404)
  })

  it('kapısız kopyada: olay kimliksiz (yalnız gövde imzalı) istek GEÇER', async () => {
    const ham = JSON.stringify(uc.govde)
    const r = await cagir(kapisiz.get(uc.ad)!, uc, { 'x-timestamp': String(Date.now()), 'x-signature': imzala(ham) })
    expect(r.http, 'kapı sökülünce saldırı geçmeli; geçmiyorsa test kapıyı ölçmüyor').toBe(404)
  })
})
