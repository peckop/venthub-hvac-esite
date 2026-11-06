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
 *
 * R1 (ALT-138, OPS kararı): olay "sahiplenilmiş" ile "işlenmiş" ayrıdır. Upsert boş dönünce (olay zaten var)
 * `processed_at` NULL ise ilk teslim SÜRÜYOR demektir: ikinci teslim 409 IN_FLIGHT + Retry-After alır, 200 DEĞİL;
 * aksi halde ilk işlem sonra hata verip sahipliği bırakınca kargo firması yeniden denemez ve olay kaybolur.
 * `processed_at` doluysa 200 duplicate. Durum okunamazsa 5xx (sessiz 200 yok). Kilit iki sabotajla ölçülür:
 * in-flight dalı 200'e çevrilen kopya ve geçiş kapısı reddinde olayı tamamlamayan kopya.
 */

const KOK = path.resolve(__dirname, '../../..')
const SIR = 'iade-test-siri'
const IADE = '33333333-3333-4333-8333-333333333333'
type Isleyici = (req: Request) => Promise<Response>

let satir: { id: string; tenant_id: string; status: string } = { id: IADE, tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000', status: 'in_transit' }
let olaylar: string[] = []
/** processed_at'i DOLU olay kimlikleri (olay tamamlandı). `olaylar`da olup burada olmayan = ilk teslim sürüyor. */
let tamamlananOlaylar = new Set<string>()
/** Olay satırına yazılan `status_mapped` değerleri (olay kaydı çağrıları). */
let olayDurumlari: string[] = []
/** verilirse olay tablosundaki durum okuması (`select('processed_at')`) bu hatayla döner. */
let olayOkumaHatasi: { message: string } | null = null
/** verilirse iade satırı yazımı bu hatayla döner (ilk işlem hata verir). */
let iadeYazimHatasi: { message: string } | null = null
/** İlk teslimi iade okumasında bekletir: "ilk işlem sürerken ikinci teslim" yarışını belirleyici kılar (zamanlamaya bağlı değil). */
let okumaBariyeri: { ulasti: () => void; serbest: Promise<void> } | null = null
/** true ise bir sonraki olay upsert'i, satır yazmadan çakışma gibi boş döner (sahiplik arada bırakıldı). */
let upsertCakismaZorla = false
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
        then(coz: (v: unknown) => unknown) {
          // İlk teslim iade okumasına ulaşınca bariyerde bekler; bariyer yalnız bir kez (ilk okuma) kullanılır.
          if (okumaBariyeri && tablo === 'venthub_returns' && d.op === 'select') {
            const bariyer = okumaBariyeri
            okumaBariyeri = null
            bariyer.ulasti()
            return bariyer.serbest.then(() => calistir()).then(coz)
          }
          return Promise.resolve(calistir()).then(coz)
        },
      }
      function calistir(): { data: unknown; error: unknown } {
        if (tablo === 'returns_webhook_events') {
          const id = String(d.op === 'upsert' ? d.govde.event_id : d.filtreler.find(([k]) => k === 'event_id')?.[1])
          if (d.op === 'upsert') {
            // Yarış modeli: upsert çakışma gördü (boş döndü) ama satır okumadan önce başka teslim tarafından bırakıldı.
            if (upsertCakismaZorla) { upsertCakismaZorla = false; return { data: [], error: null } }
            if (olaylar.includes(id)) return { data: [], error: null }
            olaylar.push(id)
            return { data: [{ event_id: id }], error: null }
          }
          if (d.op === 'select') {
            // Durum okuması: select('processed_at').eq('event_id', id).limit(1) → satır dizisi.
            if (olayOkumaHatasi) return { data: null, error: olayOkumaHatasi }
            return { data: olaylar.includes(id) ? [{ processed_at: tamamlananOlaylar.has(id) ? '2026-11-06T00:00:00.000Z' : null }] : [], error: null }
          }
          if (d.op === 'update') {
            // Olay kaydı: processed_at dolunca olay tamamlandı sayılır.
            if (d.govde.processed_at) tamamlananOlaylar.add(id)
            olayDurumlari.push(String(d.govde.status_mapped))
          }
          if (d.op === 'delete') {
            // Gerçek SQL: `.is('processed_at', null)` süzgeci tamamlanmış satırı SİLMEZ.
            const yalnizBos = d.filtreler.some(([k, v]) => k === 'processed_at' && v === null)
            if (!(yalnizBos && tamamlananOlaylar.has(id))) {
              olaylar = olaylar.filter((x) => x !== id)
              tamamlananOlaylar.delete(id)
            }
          }
          return { data: null, error: null }
        }
        const uyar = d.filtreler.every(([k, v]) => (satir as Record<string, unknown>)[k] === v)
        if (d.op === 'update') {
          if (iadeYazimHatasi) return { data: null, error: iadeYazimHatasi }
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
  return { http: r.status, json: (await r.json()) as Record<string, unknown>, retryAfter: r.headers.get('retry-after') }
}

/**
 * "İlk teslim işlenirken ikinci teslim" yarışını belirleyici kurar (zamanlama şansına bağlı değil): ilk teslim sahipliği
 * alıp iade okumasında BEKLER, ikinci teslim tam bu sırada gelir, sonra ilk teslim serbest bırakılıp bitirilir.
 */
async function surenIslemdeIkinciTeslim(isleyici: Isleyici, olay: string) {
  let ulasti!: () => void
  let birak!: () => void
  const ulastiSozu = new Promise<void>((coz) => { ulasti = coz })
  okumaBariyeri = { ulasti, serbest: new Promise<void>((coz) => { birak = coz }) }
  const ilkSozu = cagir(isleyici, olay)
  await ulastiSozu // ilk teslim sahipliği aldı ve iade okumasında bekliyor
  const ikinci = await cagir(isleyici, olay)
  const olaylarIken = [...olaylar]
  const yazimIken = iadeYazimlari
  birak()
  return { ilk: await ilkSozu, ikinci, olaylarIken, yazimIken }
}

const KOSUL = /\n\s*\.eq\('status', String\(cur\.status\)\)/
/** Sabotaj 1: süren işlem dalı sökülür; boş dönen upsert her durumda 200 duplicate'a düşer (eski davranış). */
const SUREN_ISLEM_DALI = /if \(!islendi\) \{/
/** Sabotaj 2: geçiş kapısı reddinde olay tamamlandı işaretlenmez (processed_at NULL kalır). */
const BLOKE_KAYIT = /\n\s*await olayKaydet\('ignored:transition_blocked'\)/
let yeni: Isleyici
let kosulsuz: Isleyici
let surenDalsiz: Isleyici
let blokeKayitsiz: Isleyici

beforeAll(async () => {
  Object.assign(globalThis, { __sahteIstemci: sahteIstemci })
  vi.stubGlobal('fetch', async () => new Response('[]', { status: 200 }))
  const kaynak = fs.readFileSync(path.join(KOK, 'supabase/functions/returns-webhook/index.ts'), 'utf8')
  if (!KOSUL.test(kaynak)) throw new Error('sabotaj deseni eşleşmedi: koşullu yazım bulunamadı')
  if (!SUREN_ISLEM_DALI.test(kaynak)) throw new Error('sabotaj deseni eşleşmedi: süren işlem dalı bulunamadı')
  if (!BLOKE_KAYIT.test(kaynak)) throw new Error('sabotaj deseni eşleşmedi: geçiş reddi olay kaydı bulunamadı')
  yeni = await isleyiciYukle(nodeKopyasi('returns-webhook-yeni', kaynak))
  kosulsuz = await isleyiciYukle(nodeKopyasi('returns-webhook-kosulsuz', kaynak.replace(KOSUL, '')))
  surenDalsiz = await isleyiciYukle(nodeKopyasi('returns-webhook-suren-dalsiz', kaynak.replace(SUREN_ISLEM_DALI, 'if (false) {')))
  blokeKayitsiz = await isleyiciYukle(nodeKopyasi('returns-webhook-bloke-kayitsiz', kaynak.replace(BLOKE_KAYIT, '')))
})

afterAll(() => {
  vi.unstubAllGlobals()
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true })
})

beforeEach(() => {
  satir = { id: IADE, tenant_id: 'd3b07384-d113-495f-a558-8c38634e0000', status: 'in_transit' }
  olaylar = []
  tamamlananOlaylar = new Set<string>()
  olayDurumlari = []
  olayOkumaHatasi = null
  iadeYazimHatasi = null
  okumaBariyeri = null
  upsertCakismaZorla = false
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
  it('aynı olay eşzamanlı iki kez gelirse yalnız biri işlenir; diğeri 409 IN_FLIGHT (ilk sürerken) ya da 200 duplicate (ilk bitmişse), asla ikinci işlem', async () => {
    const [a, b] = await Promise.all([cagir(yeni, 'evt-ikiz'), cagir(yeni, 'evt-ikiz')])
    const isleyenler = [a, b].filter((r) => r.http === 200 && !r.json.duplicate)
    const digerleri = [a, b].filter((r) => !(r.http === 200 && !r.json.duplicate))
    expect(isleyenler).toHaveLength(1)
    expect(digerleri).toHaveLength(1)
    // Zamanlamaya göre iki geçerli sonuç var (sürerken 409, bitmişse 200 duplicate); üçüncüsü yok. 409 kolu belirleyici
    // olarak aşağıdaki bariyerli testte kilitli.
    const diger = digerleri[0]
    if (diger.http === 409) expect(diger.json.error).toBe('IN_FLIGHT')
    else expect(diger.json.duplicate).toBe(true)
    expect(iadeYazimlari).toBe(1)
    expect(satir.status).toBe('received')
  })

  it('İŞLEM SÜRERKEN ikinci teslim: 409 IN_FLIGHT + Retry-After, ilk teslimin sahipliğine dokunmaz; ilk bitince tekrar 200 duplicate (olay kaybolmaz, çift işlenmez)', async () => {
    const r = await surenIslemdeIkinciTeslim(yeni, 'evt-suren')
    expect(r.ikinci.http).toBe(409)
    expect(r.ikinci.json.error).toBe('IN_FLIGHT')
    expect(r.ikinci.json.duplicate).toBeUndefined()
    // Retry-After: pozitif tam sayı ve replay penceresinin (5 dk = 300 sn) altında.
    const bekleme = Number(r.ikinci.retryAfter)
    expect(Number.isInteger(bekleme)).toBe(true)
    expect(bekleme).toBeGreaterThan(0)
    expect(bekleme).toBeLessThan(300)
    // 409 yolu sahipliği almadığı için ilk teslimin satırı SİLİNMEDİ ve ikinci teslim iadeye yazmadı.
    expect(r.olaylarIken).toContain('evt-suren')
    expect(r.yazimIken).toBe(0)
    // İlk teslim sonunda işlendi ve olay tamamlandı işaretlendi.
    expect(r.ilk.http).toBe(200)
    expect(r.ilk.json.duplicate).toBeUndefined()
    expect(satir.status).toBe('received')
    expect(iadeYazimlari).toBe(1)
    expect(tamamlananOlaylar.has('evt-suren')).toBe(true)
    // Artık tamamlanmış olayın tekrarı 200 duplicate (409 değil) ve yazım yok.
    const tekrar = await cagir(yeni, 'evt-suren')
    expect(tekrar.http).toBe(200)
    expect(tekrar.json.duplicate).toBe(true)
    expect(iadeYazimlari).toBe(1)
  })

  it('SABOTAJ: süren işlem dalı sökülünce aynı yarışta ikinci teslim 200 duplicate alır (kilit kırmızıyı görüyor)', async () => {
    const r = await surenIslemdeIkinciTeslim(surenDalsiz, 'evt-suren-sabotaj')
    expect(r.ikinci.http).toBe(200)
    expect(r.ikinci.json.duplicate).toBe(true)
    expect(r.ikinci.retryAfter).toBeNull()
  })

  it('ilk işlem hata verirse (500) sahiplik bırakılır; aynı olayın yeniden denemesi işlenir ve tamamlandı işaretlenir (olay kaybolmaz)', async () => {
    iadeYazimHatasi = { message: 'baglanti koptu' }
    const ilk = await cagir(yeni, 'evt-hata')
    expect(ilk.http).toBe(500)
    expect(olaylar).not.toContain('evt-hata')
    expect(iadeYazimlari).toBe(0)

    iadeYazimHatasi = null
    const tekrar = await cagir(yeni, 'evt-hata')
    expect(tekrar.http).toBe(200)
    expect(tekrar.json.duplicate).toBeUndefined()
    expect(satir.status).toBe('received')
    expect(iadeYazimlari).toBe(1)
    expect(olaylar).toContain('evt-hata')
    expect(tamamlananOlaylar.has('evt-hata')).toBe(true)
  })

  it('işlenmiş olay (processed_at dolu) tekrar gelirse 200 duplicate, yazım yok', async () => {
    expect((await cagir(yeni, 'evt-bitmis')).http).toBe(200)
    expect(iadeYazimlari).toBe(1)
    const tekrar = await cagir(yeni, 'evt-bitmis')
    expect(tekrar.http).toBe(200)
    expect(tekrar.json.duplicate).toBe(true)
    expect(iadeYazimlari).toBe(1)
  })

  it('geçiş kapısının 200 reddi de olayı TAMAMLAR: aynı olayın tekrarı 409 IN_FLIGHT değil 200 duplicate alır', async () => {
    satir = { ...satir, status: 'refunded' } // soğurucu durum: received yazılamaz → transition_blocked (200)
    const ilk = await cagir(yeni, 'evt-bloke')
    expect(ilk.http).toBe(200)
    expect(ilk.json.reason).toBe('transition_blocked')
    expect(tamamlananOlaylar.has('evt-bloke')).toBe(true)
    expect(olayDurumlari).toEqual(['ignored:transition_blocked'])
    const tekrar = await cagir(yeni, 'evt-bloke')
    expect(tekrar.http).toBe(200)
    expect(tekrar.json.duplicate).toBe(true)
    expect(iadeYazimlari).toBe(0)
  })

  it('SABOTAJ: geçiş reddinde olay kaydı sökülünce tamamlanmayan olayın tekrarı sonsuza dek 409 alır (kilit kırmızıyı görüyor)', async () => {
    satir = { ...satir, status: 'refunded' }
    expect((await cagir(blokeKayitsiz, 'evt-bloke-sabotaj')).http).toBe(200)
    expect(tamamlananOlaylar.has('evt-bloke-sabotaj')).toBe(false)
    const tekrar = await cagir(blokeKayitsiz, 'evt-bloke-sabotaj')
    expect(tekrar.http).toBe(409)
    expect(tekrar.json.error).toBe('IN_FLIGHT')
  })

  it('FAIL-CLOSED: olay durumu okunamazsa 5xx (sessiz 200 yok), ilk teslimin satırına dokunulmaz, iade yazılmaz', async () => {
    olaylar.push('evt-okuma') // ilk teslim sahipliği almış
    olayOkumaHatasi = { message: 'baglanti koptu' }
    const r = await cagir(yeni, 'evt-okuma')
    expect(r.http).toBe(500)
    expect(r.json.error).toBe('Event state read failed')
    expect(r.json.duplicate).toBeUndefined()
    expect(olaylar).toContain('evt-okuma')
    expect(iadeYazimlari).toBe(0)
  })

  it('sahiplik satırı arada bırakıldıysa (çakışma görüldü, okumada satır yok) ikinci teslim 409 alır; yeniden deneme sahipliği alıp işler', async () => {
    // Yarış: upsert çakışma gördü (boş döndü), okumadan önce ilk teslim hata verip satırını bıraktı → okuma boş döner.
    upsertCakismaZorla = true
    const ikinci = await cagir(yeni, 'evt-arada')
    expect(ikinci.http).toBe(409)
    expect(ikinci.json.error).toBe('IN_FLIGHT')
    expect(iadeYazimlari).toBe(0)
    const tekrar = await cagir(yeni, 'evt-arada')
    expect(tekrar.http).toBe(200)
    expect(tekrar.json.duplicate).toBeUndefined()
    expect(iadeYazimlari).toBe(1)
    expect(tamamlananOlaylar.has('evt-arada')).toBe(true)
  })

  it('kaynak kontrol-sonra-kaydet değil: olay tablosunda ÖNCE sahiplenilir (upsert ignoreDuplicates); tek select yalnız çakışma SONRASI processed_at okur', () => {
    for (const ad of ['returns-webhook', 'shipping-webhook']) {
      const k = fs.readFileSync(path.join(KOK, `supabase/functions/${ad}/index.ts`), 'utf8')
      expect(k, ad).toMatch(/_webhook_events'\)\s*\.upsert\([\s\S]*?ignoreDuplicates: true/)
      expect(k, ad).not.toMatch(/_webhook_events'\)\.insert\(/)
      // Eskiden olay tablosunda hiç select yoktu (kontrol-sonra-kaydet yasağı). R1 ile çakışmada durum okuması geldi:
      // select yalnız 'processed_at' alır ve upsert'ten SONRA gelir; sahiplenmeden önceki bir select hâlâ yasak.
      const upsertYeri = k.search(/_webhook_events'\)\s*\.upsert\(/)
      const secimler = [...k.matchAll(/_webhook_events'\)\s*\.select\(([^)]*)\)/g)]
      expect(secimler.length, ad).toBeGreaterThan(0)
      for (const m of secimler) {
        expect(m[1].trim(), ad).toBe("'processed_at'")
        expect(m.index ?? -1, ad).toBeGreaterThan(upsertYeri)
      }
    }
  })
})
