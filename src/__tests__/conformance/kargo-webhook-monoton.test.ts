// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  kargoHedefiCoz,
  kargoYazimKarari,
  tetikReddiMi,
} from '../../../supabase/functions/_shared/kargo_webhook_gecis'

/**
 * INV-KARGO-WEBHOOK-1 · kargo webhook'u siparişi yalnız İLERİ taşır, iptali ve sözlük dışını yazmaz (ALT-134,
 * CLAUDE.md kural 11). Kalıp: odeme-callback-yazim-kapisi.test.ts.
 *
 * DAVRANIŞLA ölçülür: `supabase/functions/shipping-webhook/index.ts` gerçek hâliyle yüklenir, `Deno.serve`'e
 * verilen işleyici yakalanır, supabase-js yerel bir sahte istemciyle değiştirilir. Sahte istemci `.eq()` filtrelerini
 * GERÇEKTEN uygular (okuma ile yazma arasında satır ilerlerse 0 satır güncellenir) ve isteğe bağlı olarak
 * migration 20261103120000'deki izin tablosunu tetik gibi uygular (VH409).
 *
 * SABOTAJ: aynı saldırılar karar modülü SÖKÜLMÜŞ bir kopyaya karşı da koşar (ham değer yazılır, kaynak durum
 * koşulu yok, cancelled kontrolü yok) ve saldırıların orada GEÇTİĞİ ölçülür.
 */

const KOK = path.resolve(__dirname, '../../..')
const YENI = fs.readFileSync(path.join(KOK, 'supabase/functions/shipping-webhook/index.ts'), 'utf8')

/** Kapıyı söken dönüşümler (çalışma zamanında esbuild tipleri siler). Her biri eşleşmek ZORUNDA. */
const SOKUMLER: [RegExp, string][] = [
  // karar: "taşıyıcının kelimesi neyse onu yaz"
  [/kargoHedefiCoz\(p\.status\)/g, "({ tur: 'ham', ham: String(p.status || '') })"],
  [
    /kargoYazimKarari\(\{[^}]*\}, cozum\)/g,
    "(cozum.ham ? { islem: 'adimlar', adimlar: [{ kaynak: curStatus, hedef: cozum.ham }] } : { islem: 'yalniz_takip' })",
  ],
  // kaynak durum koşulu yok
  [/\.eq\('status', adim\.kaynak\)/g, ''],
]
function kapiyiSok(metin: string): string {
  let m = metin
  for (const [desen, yerine] of SOKUMLER) {
    if (!new RegExp(desen.source).test(m)) throw new Error(`sabotaj deseni eşleşmedi: ${desen}`)
    m = m.replace(desen, yerine)
  }
  return m
}

type Isleyici = (req: Request) => Promise<Response>
type Satir = {
  id: string
  tenant_id: string
  order_number: string
  status: string
  payment_status: string
  shipped_at: string | null
  delivered_at: string | null
  tracking_number: string | null
  tracking_url: string | null
  carrier: string | null
  customer_email: string
  customer_name: string
}

const SIPARIS = '22222222-2222-4222-8222-222222222222'
const TOKEN = 'webhook-test-token'

let satir: Satir
let patchlar: { govde: Record<string, unknown>; filtreler: [string, unknown][]; guncellenen: number }[] = []
let olaylar: string[] = []
let bildirimler = 0
let patchOncesi: (() => void) | null = null
/** true ise sahte DB, ALT-131 tetiği gibi izin dışı status geçişini VH409 ile reddeder. */
let tetikAktif = true
let zorlaHata: { code?: string; message: string } | null = null
/** verilirse hata yalnız bu koşulu sağlayan yazımlara uygulanır (ör. yalnız ikinci adım). */
let zorlaHataKosul: ((govde: Record<string, unknown>) => boolean) | null = null
let olayDurumlari: string[] = []

const IZIN: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

function yeniSatir(over: Partial<Satir> = {}): Satir {
  return {
    id: SIPARIS,
    tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000',
    order_number: 'VH-1',
    status: 'confirmed',
    payment_status: 'paid',
    shipped_at: null,
    delivered_at: null,
    tracking_number: null,
    tracking_url: null,
    carrier: null,
    customer_email: 'musteri@example.com',
    customer_name: 'Test',
    ...over,
  }
}

/** Satırın düz kayıt görünümü (filtre karşılaştırması için). */
const kayit = (): Record<string, unknown> => ({ ...satir })

/** supabase-js sorgu zincirinin test için gereken alt kümesi. */
function sahteIstemci() {
  return {
    from(tablo: string) {
      const durum: { op: 'select' | 'update'; govde: Record<string, unknown>; filtreler: [string, unknown][]; tek: boolean } = {
        op: 'select', govde: {}, filtreler: [], tek: false,
      }
      const b = {
        select() { return b },
        limit() { return b },
        single() { durum.tek = true; return b },
        eq(k: string, v: unknown) { durum.filtreler.push([k, v]); return b },
        update(g: Record<string, unknown>) { durum.op = 'update'; durum.govde = g; return b },
        insert(g: Record<string, unknown>) {
          if (tablo === 'shipping_webhook_events') {
            olaylar.push(String(g.event_id))
            olayDurumlari.push(String(g.status_mapped))
          }
          return Promise.resolve({ data: null, error: null })
        },
        then(coz: (v: unknown) => unknown) { return Promise.resolve(calistir()).then(coz) },
      }
      const uyar = (r: Record<string, unknown>) => durum.filtreler.every(([k, v]) => r[k] === v)
      function calistir(): { data: unknown; error: unknown } {
        if (tablo === 'shipping_webhook_events') {
          // tekrar kontrolü: daha önce işlenmiş event_id var mı
          const varMi = durum.filtreler.some(([k, v]) => k === 'event_id' && olaylar.includes(String(v)))
          return { data: varMi ? [{ event_id: durum.filtreler[0][1] }] : [], error: null }
        }
        if (tablo !== 'venthub_orders') return { data: [], error: null }
        if (durum.op === 'select') {
          const bulunan = uyar(kayit()) ? [structuredClone(satir)] : []
          return durum.tek
            ? { data: bulunan[0] ?? null, error: bulunan[0] ? null : { message: 'not found' } }
            : { data: bulunan, error: null }
        }
        patchOncesi?.()
        const eslesti = uyar(kayit())
        patchlar.push({ govde: durum.govde, filtreler: durum.filtreler, guncellenen: eslesti ? 1 : 0 })
        if (zorlaHata && (zorlaHataKosul?.(durum.govde) ?? true)) return { data: null, error: zorlaHata }
        if (!eslesti) return { data: [], error: null }
        const yeniStatus = durum.govde.status
        if (tetikAktif && typeof yeniStatus === 'string' && yeniStatus !== satir.status && !(IZIN[satir.status] ?? []).includes(yeniStatus)) {
          return { data: null, error: { code: 'VH409', message: `ALT131_MONOTON: siparis durumu ${satir.status} -> ${yeniStatus} gecisi yasak` } }
        }
        satir = { ...satir, ...durum.govde }
        return { data: [structuredClone(satir)], error: null }
      }
      return b
    },
  }
}

async function sahteFetch(girdi: RequestInfo | URL): Promise<Response> {
  const url = typeof girdi === 'string' ? girdi : girdi instanceof URL ? girdi.href : girdi.url
  if (url.includes('/functions/v1/delivery-notification')) bildirimler++
  return new Response(null, { status: 200 })
}

let tmp = ''
function dizin(): string {
  if (!tmp) tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kargo-webhook-'))
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
    throw new Error('shipping-webhook yeni bir uzak/göreli içe aktarma eklemiş: nodeKopyasi güncellenmeli')
  }
  const yol = path.join(dizin(), `${ad}.mts`)
  fs.writeFileSync(yol, cevrilmis)
  return yol
}

async function isleyiciYukle(dosya: string): Promise<Isleyici> {
  let yakalanan: Isleyici | null = null
  vi.stubGlobal('Deno', {
    serve: (f: Isleyici) => {
      yakalanan = f
    },
    env: {
      get: (k: string) =>
        ({
          SUPABASE_URL: 'https://ornek.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: 'test-anahtari',
          SHIPPING_WEBHOOK_TOKEN: TOKEN,
        })[k],
    },
  })
  await import(/* @vite-ignore */ pathToFileURL(dosya).href)
  if (!yakalanan) throw new Error('Deno.serve çağrılmadı')
  return yakalanan
}

async function cagir(
  isleyici: Isleyici,
  govde: Record<string, unknown>,
  basliklar: Record<string, string> = {},
): Promise<{ http: number; json: Record<string, unknown> }> {
  const r = await isleyici(
    new Request('https://ornek.supabase.co/functions/v1/shipping-webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-webhook-token': TOKEN, 'x-timestamp': String(Date.now()), ...basliklar },
      body: JSON.stringify({ order_id: SIPARIS, ...govde }),
    }),
  )
  return { http: r.status, json: await r.json() }
}

let yeni: Isleyici
let eski: Isleyici | null = null
let eskiYuklenemedi = ''

beforeAll(async () => {
  vi.stubGlobal('fetch', sahteFetch)
  Object.assign(globalThis, { __sahteIstemci: sahteIstemci })
  yeni = await isleyiciYukle(nodeKopyasi('yeni', YENI))
  try {
    eski = await isleyiciYukle(nodeKopyasi('kapisiz', kapiyiSok(YENI)))
  } catch (e) {
    eskiYuklenemedi = e instanceof Error ? e.message : String(e)
  }
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

beforeEach(() => {
  satir = yeniSatir()
  patchlar = []
  olaylar = []
  olayDurumlari = []
  zorlaHataKosul = null
  bildirimler = 0
  patchOncesi = null
  tetikAktif = true
  zorlaHata = null
})

const yazildi = (): boolean => patchlar.some((p) => p.guncellenen > 0)

describe('INV-KARGO-WEBHOOK-1 · saf karar modülü', () => {
  it('taşıyıcı kelimesi yalnız shipped/delivered hedefine çözülür; paid/failed/ham değer ASLA', () => {
    for (const k of ['in_transit', 'picked_up', 'out_for_delivery']) expect(kargoHedefiCoz(k)).toEqual({ tur: 'hedef', hedef: 'shipped' })
    for (const k of ['delivered', 'COMPLETED']) expect(kargoHedefiCoz(k)).toEqual({ tur: 'hedef', hedef: 'delivered' })
    for (const k of ['label_created', 'info_received', 'processing']) expect(kargoHedefiCoz(k)).toEqual({ tur: 'durum_yok', neden: 'hazirlik' })
    for (const k of ['failed', 'exception', 'cancelled', 'return_to_sender']) expect(kargoHedefiCoz(k)).toEqual({ tur: 'durum_yok', neden: 'istisna' })
    expect(kargoHedefiCoz('paid')).toEqual({ tur: 'durum_yok', neden: 'bilinmeyen' })
    expect(kargoHedefiCoz('rastgele-kelime')).toEqual({ tur: 'durum_yok', neden: 'bilinmeyen' })
    expect(kargoHedefiCoz('')).toEqual({ tur: 'durum_yok', neden: 'bos' })
  })

  it('geçiş tablosu elle yazılmış beklentiyle aynı', () => {
    const k = (status: string, payment_status: string, hedef: 'shipped' | 'delivered') =>
      kargoYazimKarari({ status, payment_status }, { tur: 'hedef', hedef })
    expect(k('cancelled', 'paid', 'shipped')).toEqual({ islem: 'yoksay', neden: 'ORDER_CANCELLED' })
    expect(k('cancelled', 'paid', 'delivered')).toEqual({ islem: 'yoksay', neden: 'ORDER_CANCELLED' })
    expect(k('pending', 'pending', 'shipped')).toEqual({ islem: 'yoksay', neden: 'ORDER_NOT_CONFIRMED' })
    expect(k('confirmed', 'pending', 'shipped')).toEqual({ islem: 'yoksay', neden: 'ORDER_NOT_PAID' })
    expect(k('confirmed', 'paid', 'shipped')).toEqual({ islem: 'adimlar', adimlar: [{ kaynak: 'confirmed', hedef: 'shipped' }] })
    expect(k('processing', 'paid', 'shipped')).toEqual({ islem: 'adimlar', adimlar: [{ kaynak: 'processing', hedef: 'shipped' }] })
    expect(k('confirmed', 'paid', 'delivered')).toEqual({
      islem: 'adimlar',
      adimlar: [{ kaynak: 'confirmed', hedef: 'shipped' }, { kaynak: 'shipped', hedef: 'delivered' }],
    })
    expect(k('shipped', 'paid', 'delivered')).toEqual({ islem: 'adimlar', adimlar: [{ kaynak: 'shipped', hedef: 'delivered' }] })
    expect(k('shipped', 'paid', 'shipped')).toEqual({ islem: 'yalniz_takip' })
    expect(k('delivered', 'paid', 'shipped')).toEqual({ islem: 'yalniz_takip' })
    expect(k('delivered', 'paid', 'delivered')).toEqual({ islem: 'yalniz_takip' })
    expect(kargoYazimKarari({ status: 'confirmed', payment_status: 'paid' }, { tur: 'durum_yok', neden: 'bilinmeyen' })).toEqual({ islem: 'yalniz_takip' })
    expect(kargoYazimKarari({ status: 'paid', payment_status: 'paid' }, { tur: 'hedef', hedef: 'shipped' })).toMatchObject({ islem: 'yoksay' })
  })

  it('tetik reddi tanınır (kod ya da mesaj öneki)', () => {
    expect(tetikReddiMi({ code: 'VH409', message: 'x' })).toBe(true)
    expect(tetikReddiMi({ message: 'ALT131_MONOTON: ...' })).toBe(true)
    expect(tetikReddiMi({ code: '23514', message: 'check' })).toBe(false)
    expect(tetikReddiMi(null)).toBe(false)
  })
})

describe('INV-KARGO-WEBHOOK-1 · handler: iptal çıkışsız, sözlük dışı yazılmaz', () => {
  it('iptal edilmiş siparişe in_transit: HİÇBİR şey yazılmaz (takip alanları dahil), 200 + ignored', async () => {
    satir = yeniSatir({ status: 'cancelled' })
    const r = await cagir(yeni, { status: 'in_transit', tracking_number: 'TN-1', carrier: 'yurtici' })
    expect(r.http).toBe(200)
    expect(r.json.ignored).toBe(true)
    expect(olayDurumlari).toEqual([])
    expect(yazildi()).toBe(false)
    expect(satir.status).toBe('cancelled')
    expect(satir.tracking_number).toBeNull()
  })

  it('iptal edilmiş siparişe delivered: yazılmaz', async () => {
    satir = yeniSatir({ status: 'cancelled' })
    await cagir(yeni, { status: 'delivered' })
    expect(yazildi()).toBe(false)
    expect(satir.status).toBe('cancelled')
    expect(satir.delivered_at).toBeNull()
  })

  it('bilinmeyen taşıyıcı kelimesi status\'a YAZILMAZ; takip alanları yazılır', async () => {
    const r = await cagir(yeni, { status: 'rastgele_kelime', tracking_number: 'TN-2', carrier: 'aras' })
    expect(r.http).toBe(200)
    expect(satir.status).toBe('confirmed')
    expect(satir.tracking_number).toBe('TN-2')
    expect(patchlar.every((p) => !('status' in p.govde))).toBe(true)
  })

  it.each(['label_created', 'info_received', 'failed', 'exception', 'return_to_sender', 'paid'])(
    'taşıyıcı kelimesi %s siparişin status\'unu DEĞİŞTİRMEZ (eski kod paid/failed yazıyordu)',
    async (kelime) => {
      await cagir(yeni, { status: kelime, tracking_number: 'TN-3' })
      expect(satir.status).toBe('confirmed')
      expect(patchlar.every((p) => !('status' in p.govde))).toBe(true)
    },
  )
})

describe('INV-KARGO-WEBHOOK-1 · handler: yalnız ileri, delivered iki adım', () => {
  it('confirmed + ödenmiş + delivered → iki adım: önce shipped (kaynak confirmed), sonra delivered (kaynak shipped)', async () => {
    const r = await cagir(yeni, { status: 'delivered', tracking_number: 'TN-4' })
    expect(r.http).toBe(200)
    expect(satir.status).toBe('delivered')
    expect(satir.shipped_at).not.toBeNull()
    expect(satir.delivered_at).not.toBeNull()
    expect(patchlar.map((p) => p.govde.status)).toEqual(['shipped', 'delivered'])
    expect(patchlar[0].filtreler).toContainEqual(['status', 'confirmed'])
    expect(patchlar[1].filtreler).toContainEqual(['status', 'shipped'])
    expect(patchlar.every((p) => p.guncellenen === 1)).toBe(true)
    expect(bildirimler).toBe(1)
  })

  it('processing + ödenmiş + in_transit → shipped', async () => {
    satir = yeniSatir({ status: 'processing' })
    await cagir(yeni, { status: 'in_transit' })
    expect(satir.status).toBe('shipped')
    expect(satir.shipped_at).not.toBeNull()
    expect(bildirimler).toBe(0)
  })

  it('shipped + delivered → tek adım', async () => {
    satir = yeniSatir({ status: 'shipped', shipped_at: '2026-11-01T10:00:00.000Z' })
    await cagir(yeni, { status: 'delivered' })
    expect(satir.status).toBe('delivered')
    expect(patchlar).toHaveLength(1)
    expect(satir.shipped_at).toBe('2026-11-01T10:00:00.000Z')
  })

  it('teslim edilmiş siparişe gecikmiş in_transit: status GERİ GİTMEZ, teslim bildirimi tekrar gitmez', async () => {
    satir = yeniSatir({ status: 'delivered', shipped_at: '2026-11-01T10:00:00.000Z', delivered_at: '2026-11-02T10:00:00.000Z' })
    await cagir(yeni, { status: 'in_transit', tracking_number: 'TN-5' })
    expect(satir.status).toBe('delivered')
    expect(bildirimler).toBe(0)
  })

  it('aynı olay tekrar: ikinci çağrı zararsız, ek yazım yok', async () => {
    await cagir(yeni, { status: 'in_transit', tracking_number: 'TN-6', carrier: 'aras' })
    const ilkPatch = patchlar.length
    const r = await cagir(yeni, { status: 'in_transit', tracking_number: 'TN-6', carrier: 'aras' })
    expect(r.http).toBe(200)
    expect(r.json.unchanged).toBe(true)
    expect(patchlar).toHaveLength(ilkPatch)
    expect(satir.status).toBe('shipped')
  })

  it('ödemesi paid olmayan sipariş taşıyıcı olayıyla shipped OLMAZ', async () => {
    satir = yeniSatir({ status: 'confirmed', payment_status: 'pending' })
    const r = await cagir(yeni, { status: 'in_transit' })
    expect(r.json.ignored).toBe(true)
    expect(yazildi()).toBe(false)
  })

  it('pending sipariş: yoksayılır', async () => {
    satir = yeniSatir({ status: 'pending', payment_status: 'pending' })
    const r = await cagir(yeni, { status: 'delivered' })
    expect(r.json.ignored).toBe(true)
    expect(yazildi()).toBe(false)
  })

  it('geçersiz tarih alanı 500 vermez', async () => {
    const r = await cagir(yeni, { status: 'in_transit', shipped_at: 'bu-bir-tarih-degil' })
    expect(r.http).toBe(200)
    expect(satir.status).toBe('shipped')
  })
})

describe('INV-KARGO-WEBHOOK-1 · yarış ve tetik: fail-closed yazım, fail-safe cevap', () => {
  it('okuma ile yazma arasında araya İPTAL girerse: yeniden okunur, iptal görülür, 0 satır yazılır, 200 + ignored:true', async () => {
    patchOncesi = () => {
      satir = { ...satir, status: 'cancelled' } // araya iptal girdi
      patchOncesi = null
    }
    const r = await cagir(yeni, { status: 'in_transit' }, { 'x-event-id': 'evt-y' })
    expect(r.http).toBe(200)
    expect(r.json.ignored).toBe(true)
    expect(satir.status).toBe('cancelled')
    expect(patchlar[0].guncellenen).toBe(0)
    expect(olayDurumlari).toEqual(['ignored:ORDER_CANCELLED'])
  })

  it('İLERİ yarış: confirmed iken delivered gelir, araya admin shipped yazar → teslim sinyali KAYBOLMAZ (delivered + bildirim bir kez)', async () => {
    patchOncesi = () => {
      satir = { ...satir, status: 'shipped', shipped_at: '2026-11-03T09:00:00.000Z' } // admin araya girdi
      patchOncesi = null
    }
    const r = await cagir(yeni, { status: 'delivered' })
    expect(r.http).toBe(200)
    expect(satir.status).toBe('delivered')
    expect(satir.delivered_at).not.toBeNull()
    expect(satir.shipped_at).toBe('2026-11-03T09:00:00.000Z') // admin'in damgası ezilmedi
    expect(r.json.status).toBe('delivered')
    expect(bildirimler).toBe(1)
  })

  it('yeniden deneme EN ÇOK bir kez: durum yine tutmazsa yoksayılır, döngü yok', async () => {
    let kez = 0
    patchOncesi = () => {
      kez++
      satir = { ...satir, status: kez === 1 ? 'processing' : 'cancelled' } // her yazımdan önce satır kayar
    }
    const r = await cagir(yeni, { status: 'in_transit' })
    expect(r.http).toBe(200)
    expect(r.json.ignored).toBe(true)
    expect(patchlar.length).toBeLessThanOrEqual(2)
  })

  it('veritabanı tetiği (VH409) reddederse webhook 500 DEĞİL 200 döner (taşıyıcı sonsuz yeniden denemez)', async () => {
    zorlaHata = { code: 'VH409', message: 'ALT131_MONOTON: siparis durumu confirmed -> delivered gecisi yasak' }
    const r = await cagir(yeni, { status: 'in_transit' }, { 'x-event-id': 'evt-1' })
    expect(r.http).toBe(200)
    expect(r.json.ignored).toBe(true)
    expect(olaylar).toContain('evt-1')
    expect(olayDurumlari).toEqual(['ignored:MONOTON_REJECTED'])
  })

  it('iki adımda 1. adım yazılır, 2. adım reddedilir: cevap ve kayıt GERÇEK son durumu (shipped) söyler, unchanged değil, bildirim yok', async () => {
    zorlaHata = { code: 'VH409', message: 'ALT131_MONOTON: x' }
    zorlaHataKosul = (g) => g.status === 'delivered'
    const r = await cagir(yeni, { status: 'delivered' }, { 'x-event-id': 'evt-2' })
    expect(r.http).toBe(200)
    expect(satir.status).toBe('shipped')
    expect(r.json.status).toBe('shipped')
    expect(r.json.unchanged).toBeUndefined()
    expect(r.json.ignored).toBeUndefined()
    expect(olayDurumlari).toEqual(['shipped'])
    expect(bildirimler).toBe(0)
  })

  it('aynı x-event-id tekrar gelirse yazmadan döner (duplicate)', async () => {
    await cagir(yeni, { status: 'in_transit', tracking_number: 'TN-7' }, { 'x-event-id': 'evt-3' })
    const ilkPatch = patchlar.length
    const r = await cagir(yeni, { status: 'delivered' }, { 'x-event-id': 'evt-3' })
    expect(r.http).toBe(200)
    expect(r.json.duplicate).toBe(true)
    expect(patchlar).toHaveLength(ilkPatch)
    expect(satir.status).toBe('shipped')
  })

  it('cevap SINIRLI: yalnız ok/order_id/status; payment_status, tenant_id, müşteri bilgisi sızmaz', async () => {
    const r = await cagir(yeni, { status: 'in_transit' })
    expect(Object.keys(r.json).sort()).toEqual(['ok', 'order_id', 'status'])
    const yoksayilan = await cagir(yeni, { status: 'delivered' }) // shipped → delivered normal; yoksayılan için iptal
    expect(Object.keys(yoksayilan.json)).not.toContain('shipping')
    satir = yeniSatir({ status: 'cancelled' })
    const y = await cagir(yeni, { status: 'in_transit' })
    expect(Object.keys(y.json).sort()).toEqual(['ignored', 'ok', 'order_id', 'status', 'unchanged'])
    expect(y.json.ignored).toBe(true) // neden cevapta yok
    const metin = JSON.stringify([r.json, yoksayilan.json, y.json])
    for (const sizinti of ['payment_status', 'tenant_id', 'customer_email', 'musteri@example.com', 'ORDER_CANCELLED']) {
      expect(metin).not.toContain(sizinti)
    }
  })

  it('ilgisiz veritabanı hatası hâlâ 500 (gerçek arıza gizlenmez)', async () => {
    zorlaHata = { code: '08006', message: 'connection failure' }
    const r = await cagir(yeni, { status: 'in_transit' })
    expect(r.http).toBe(500)
  })
})

describe('INV-KARGO-WEBHOOK-1 · imza ve replay kapısı bozulmadı (kural 11)', () => {
  it('geçersiz token → 401, DB\'ye dokunulmaz', async () => {
    const r = await cagir(yeni, { status: 'in_transit' }, { 'x-webhook-token': 'yanlis' })
    expect(r.http).toBe(401)
    expect(patchlar).toHaveLength(0)
  })

  it('zaman damgası yok → 401', async () => {
    const r = await cagir(yeni, { status: 'in_transit' }, { 'x-timestamp': '' })
    expect(r.http).toBe(401)
  })

  it('bayat zaman damgası → 401', async () => {
    const r = await cagir(yeni, { status: 'in_transit' }, { 'x-timestamp': String(Date.now() - 60 * 60 * 1000) })
    expect(r.http).toBe(401)
    expect(yazildi()).toBe(false)
  })
})

describe('INV-KARGO-WEBHOOK-1 · SABOTAJ kolu (karar modülü sökülünce saldırılar GEÇER)', () => {
  it('sabotajlı kopya yüklenebildi (sahte-yeşil kilidi)', () => {
    expect(eskiYuklenemedi).toBe('')
    expect(eski).not.toBeNull()
  })

  it('kapısız kopyada: iptal edilmiş siparişe in_transit YAZILIR', async () => {
    satir = yeniSatir({ status: 'cancelled' })
    tetikAktif = false
    await cagir(eski!, { status: 'shipped' })
    expect(satir.status, 'kapı sökülünce saldırı geçmeli; geçmiyorsa test kapıyı ölçmüyor').toBe('shipped')
  })

  it('kapısız kopyada: sözlük dışı ham kelime status\'a YAZILIR', async () => {
    tetikAktif = false
    await cagir(eski!, { status: 'rastgele_kelime' })
    expect(satir.status).toBe('rastgele_kelime')
  })

  it('kapısız kopyada: okuma-yazma yarışında kaynak durum koşulu yok → ezer', async () => {
    tetikAktif = false
    patchOncesi = () => {
      satir = { ...satir, status: 'cancelled' }
      patchOncesi = null
    }
    await cagir(eski!, { status: 'shipped' })
    expect(satir.status).toBe('shipped')
  })
})
