/**
 * REC-146 · aile metni yazıcısı — uçtan uca, SAHTE PostgREST'e karşı (gerçek DB'ye çıkmaz).
 *
 * Sahte sunucu sorgu dizesini `URLSearchParams` ile çözer: PostgREST gibi kodlanmamış `+`'yı
 * BOŞLUK okur. Yani yazıcı `updated_at`'i kodlamazsa eşleşme olmaz ve sınav düşer (stub gerçeği
 * taklit ediyor). Her PATCH sayılır: tetik PATCH başına 1 audit yazar → "aile başına 1 PATCH".
 *
 * Kilitlenenler:
 *   1. Kuru koşum ve tek anahtarlı `--yaz` hiçbir şey yazmaz.
 *   2. en kipi yalnız `en` ekler (tr, bloklar_tr, maddeler_tr aynen); dolu `en` ezilmez.
 *   3. b kipi TEK PATCH: tr + en + is_description_manual=true.
 *   4. `+00:00` damgası eşleşir; yarış bir kez olursa yeniden okuyup yazar, sürerse KIRMIZI.
 *   5. Onaylanmamış aile / iki kipte aile / onaylı TR'nin üstüne işaretsiz b → KIRMIZI, 0 PATCH.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'
import { patchYolu, kumeKapisi, yazimPlani } from '../aile-metni-kurallar.mjs'

const BETIK = join(__dirname, '..', 'aile-metni-yaz.mjs')
type Aile = { id: string; tenant_id: string; slug: string; description: Record<string, unknown>; is_description_manual: boolean; updated_at: string }

let kok = ''
let sunucu: Server
let port = 0
let aileler: Aile[] = []
let patchSayisi = 0
let yaris: { slug: string; kalan: number } | null = null

const ilkAileler = (): Aile[] => [
  { id: '1', tenant_id: 't1', slug: 'seat-serisi', is_description_manual: true, updated_at: '2026-09-18T07:59:00.123+00:00',
    description: { tr: 'SEAT onaylı TR metni, yirmi karakterden uzun.', bloklar_tr: { Motor: 'IE3' }, maddeler_tr: ['m1'] } },
  { id: '2', tenant_id: 't1', slug: 'danfoss-fc51', is_description_manual: true, updated_at: '2026-09-18T08:00:00+00:00',
    description: { tr: 'FC51 TR', en: 'Already has an English text of enough length.' } },
  { id: '3', tenant_id: 't1', slug: 'avens-nimax', is_description_manual: false, updated_at: '2026-09-07T10:00:00+00:00',
    description: { tr: 'Eski onaysız TR metni, hatalı olabilir.' } },
  { id: '4', tenant_id: 't1', slug: 'jet-serisi', is_description_manual: true, updated_at: '2026-09-17T09:00:00+00:00',
    description: { tr: 'Onaydan sonra değişmiş TR metni burada.' } },
]

const filtre = (q: URLSearchParams) => (a: Aile) => {
  const slugIn = q.get('slug')
  if (slugIn?.startsWith('in.(')) return slugIn.slice(4, -1).split(',').includes(a.slug)
  const esit = (k: keyof Aile) => !q.has(k) || q.get(k) === `eq.${a[k]}`
  return esit('id') && esit('tenant_id') && esit('updated_at')
}

beforeAll(async () => {
  kok = mkdtempSync(join(tmpdir(), 'aile-yaz-'))
  sunucu = createServer((req, res) => {
    const u = new URL(req.url || '', 'http://x')
    const q = u.searchParams // PostgREST gibi: kodlanmamış '+' → boşluk
    let govde = ''
    req.on('data', (c) => { govde += c })
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json')
      if (req.method === 'GET') return res.end(JSON.stringify(aileler.filter(filtre(q))))
      if (req.method === 'PATCH') {
        patchSayisi++
        if (yaris && q.get('id') === `eq.${aileler.find((a) => a.slug === yaris!.slug)?.id}` && yaris.kalan > 0) {
          yaris.kalan--
          const a = aileler.find((x) => x.slug === yaris!.slug)!
          a.updated_at = `2026-09-23T0${9 - yaris.kalan}:00:00+00:00` // araya başka yazım girdi
        }
        const hedef = aileler.filter(filtre(q))
        const d = JSON.parse(govde)
        for (const a of hedef) Object.assign(a, d, { updated_at: '2026-09-23T12:00:00.5+00:00' })
        return res.end(JSON.stringify(hedef))
      }
      res.statusCode = 405
      res.end('[]')
    })
  })
  await new Promise<void>((r) => sunucu.listen(0, '127.0.0.1', () => r()))
  port = (sunucu.address() as { port: number }).port
  writeFileSync(join(kok, '.env'), `SUPABASE_URL=http://127.0.0.1:${port}\nSUPABASE_SERVICE_ROLE_KEY=sahte\n`)
})
afterAll(() => { sunucu.close(); rmSync(kok, { recursive: true, force: true }) })

const hazirla = (yuk: unknown[], beklenen: unknown) => {
  aileler = ilkAileler()
  patchSayisi = 0
  yaris = null
  writeFileSync(join(kok, 'yuk.json'), JSON.stringify(yuk))
  writeFileSync(join(kok, 'onay.json'), JSON.stringify(beklenen))
}
const kos = (ek: string[] = [], onay = true) => new Promise<{ kod: number; cikti: string }>((coz) => {
  execFile(process.execPath, [BETIK, '--yuk', join(kok, 'yuk.json'), '--beklenen', join(kok, 'onay.json'),
    '--yedek', join(kok, 'yedek.json'), ...ek],
  { env: { ...process.env, VENTHUB_ENV: join(kok, '.env'), CANLI_YAZIM_ONAYI: onay ? 'evet' : '' } },
  (hata, stdout, stderr) => coz({ kod: hata ? (hata.code as number) : 0, cikti: stdout + stderr }))
})

const EN = 'A sufficiently long English family description.'
const YUK = [
  { slug: 'seat-serisi', kip: 'en', kimlik_en: EN },
  { slug: 'danfoss-fc51', kip: 'en', kimlik_en: EN },
  { slug: 'avens-nimax', kip: 'b', kimlik_tr: 'Kaynakla doğrulanmış yeni onaylı TR metni.', kimlik_en: EN },
  { slug: 'jet-serisi', kip: 'b', degisti: true, kimlik_tr: 'Jet için yeniden onaylanan TR metni burada.', kimlik_en: EN },
]
const ONAY = { en: ['seat-serisi', 'danfoss-fc51'], b: ['avens-nimax', 'jet-serisi'] }

describe('aile metni yazıcısı (sahte PostgREST)', () => {
  it('kuru koşum ve tek anahtarlı --yaz hiçbir şey yazmaz', async () => {
    hazirla(YUK, ONAY)
    expect((await kos()).kod).toBe(0)
    expect((await kos(['--yaz'], false)).kod).toBe(0)
    expect(patchSayisi).toBe(0)
  })

  it('en yalnız en ekler, dolu en ezilmez; b tek PATCH ile tr+en+manual; + damgası eşleşir', async () => {
    hazirla(YUK, ONAY)
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchSayisi).toBe(3) // danfoss-fc51 atlandı (en dolu); aile başına 1 PATCH
    const seat = aileler.find((a) => a.slug === 'seat-serisi')!
    expect(seat.description).toEqual({ tr: 'SEAT onaylı TR metni, yirmi karakterden uzun.', bloklar_tr: { Motor: 'IE3' }, maddeler_tr: ['m1'], en: EN })
    expect(aileler.find((a) => a.slug === 'danfoss-fc51')!.description.en).toBe('Already has an English text of enough length.')
    const nimax = aileler.find((a) => a.slug === 'avens-nimax')!
    expect(nimax.description).toEqual({ tr: 'Kaynakla doğrulanmış yeni onaylı TR metni.', en: EN })
    expect(nimax.is_description_manual).toBe(true)
    expect(r.cikti).toMatch(/yuk ile birebir 3\/3/)
  })

  it('yarış bir kez olursa yeniden okuyup yazar; sürerse KIRMIZI', async () => {
    hazirla(YUK, ONAY)
    yaris = { slug: 'seat-serisi', kalan: 1 }
    const r1 = await kos(['--yaz'])
    expect(r1.kod, r1.cikti).toBe(0)
    expect(patchSayisi).toBe(4) // yarış gerçekten oldu: seat 2 deneme + nimax + jet
    expect(aileler.find((a) => a.slug === 'seat-serisi')!.description.en).toBe(EN)
    hazirla(YUK, ONAY)
    yaris = { slug: 'seat-serisi', kalan: 5 }
    const r2 = await kos(['--yaz'])
    expect(r2.kod, r2.cikti).toBe(1)
    expect(r2.cikti).toMatch(/seat-serisi: donen satir 0/)
  })

  it('onaylanmamış aile, iki kipte aile, onaylı TR üstüne işaretsiz b → KIRMIZI, 0 PATCH', async () => {
    hazirla([...YUK, { slug: 'storm-serisi', kip: 'en', kimlik_en: EN }], ONAY)
    expect((await kos(['--yaz'])).kod).toBe(1)
    hazirla(YUK, { en: ['seat-serisi', 'danfoss-fc51', 'jet-serisi'], b: ['avens-nimax', 'jet-serisi'] })
    expect((await kos(['--yaz'])).kod).toBe(1)
    const isaretsiz = YUK.map((y) => (y.slug === 'jet-serisi' ? { ...y, degisti: false } : y))
    hazirla(isaretsiz, ONAY)
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/jet-serisi: TR onayli/)
    expect(patchSayisi).toBe(0)
  })

  it('iç kaynak referansı taşıyan metin KIRMIZI', async () => {
    hazirla([{ ...YUK[0], kimlik_en: 'Galvanised steel impeller as per source [AVenS s.27].' }, ...YUK.slice(1)], ONAY)
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(patchSayisi).toBe(0)
  })
})

describe('aile metni kuralları (saf)', () => {
  it('PATCH yolu id + tenant_id + kodlanmış updated_at taşır', () => {
    const y = patchYolu({ id: '1', tenant_id: 't1', slug: 's', updated_at: '2026-09-18T07:59:00.123+00:00' })
    expect(y).toBe('product_families?id=eq.1&tenant_id=eq.t1&updated_at=eq.2026-09-18T07%3A59%3A00.123%2B00%3A00')
    expect(() => patchYolu({ id: '1', slug: 's', updated_at: 'x' })).toThrow()
  })
  it('kume kapısı yük ile onayı küme olarak karşılaştırır', () => {
    expect(kumeKapisi(YUK, ONAY)).toEqual([])
    expect(kumeKapisi(YUK.slice(1), ONAY).join()).toMatch(/onaylanan ama yukte YOK: seat-serisi/)
  })
  it('b kipi dolu EN\'i ezmez', () => {
    expect(yazimPlani({ is_description_manual: false, description: { tr: 'x', en: 'dolu' } }, YUK[2]).hata).toMatch(/en DOLU/)
  })
})
