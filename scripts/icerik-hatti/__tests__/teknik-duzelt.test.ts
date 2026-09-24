/**
 * teknik-duzelt.py — DOLU technical_specs'te anahtar düzeyinde düzeltme, SAHTE PostgREST'e karşı
 * (gerçek DB'ye çıkmaz). Kalıp: faz4-teknik-yukle.test.ts.
 *
 * Sahte sunucu sorgu dizesini `URLSearchParams` ile çözer: PostgREST gibi kodlanmamış `+`'yı BOŞLUK
 * okur. Betik `updated_at`'i `quote(safe='')` ile kodlamazsa eşleşme olmaz ve sınav düşer (stub
 * gerçeği taklit ediyor). `count=exact` → Content-Range, `order/offset/limit` sayfalama (SAYFA_BOYU=2).
 *
 * Kilitlenenler:
 *   1. Kuru koşum ve tek anahtar yazmaz (0 PATCH, yedek yok).
 *   2. değiştir + sil doğru gövde; PATCH ham URL'si `%2B00%3A00`; yedek updated_at dahil; geri okuma birebir.
 *   3. `onceki` tek üründe tutmazsa HİÇBİR ürün yazılmaz (diğerleri doğru olsa bile); tip birebir.
 *   4. Zaten hedefteki ürün "değişiklik yok" (onceki tutmasa da); ikinci koşum 0 PATCH.
 *   5. Damga yarışında tek yeniden deneme (taze specs üzerine kurulur); önkoşul bozulduysa yazmaz; sürerse KIRMIZI.
 *   6. `onceki`'de beyan edilmeyen alanı değiştirme/silme → çıkış 2, ağ yok.
 *   7. sku yok / specs NULL / çok kiracı → 0 PATCH.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'

const BETIK = join(__dirname, '..', 'teknik-duzelt.py')
const PY = process.platform === 'win32' ? 'python' : 'python3'
type Specs = Record<string, unknown>
type Urun = { id: string; sku: string; tenant_id: string; technical_specs: Specs | null; updated_at: string }

let kok = ''
let sunucu: Server
let port = 0
let urunler: Urun[] = []
let patchlar: string[] = []
let govdeler: Specs[] = []
let istekSayisi = 0
// yaris: PATCH gelmeden hemen önce bu ürüne "başka biri" yazar; specs verilirse onu da birleştirir.
let yaris: { id: string; kalan: number; specs?: Specs } | null = null

const ilkUrunler = (): Urun[] => [
  { id: 'uA', sku: 'SKU-A', tenant_id: 't1',
    technical_specs: { atex_zone: 'Zone II', atex_marking: 'II 3G', rpm_max: 900 },
    updated_at: '2026-09-18T07:59:00.123+00:00' },
  { id: 'uB', sku: 'SKU-B', tenant_id: 't1', technical_specs: { ip_rating: 'IPX5', airflow_m3h: 1450 },
    updated_at: '2026-09-18T08:00:00+00:00' },
  { id: 'uC', sku: 'SKU-C', tenant_id: 't1', technical_specs: { atex_zone: 'Zone 2' },
    updated_at: '2026-09-10T08:00:00+00:00' },
  { id: 'uN', sku: 'SKU-N', tenant_id: 't1', technical_specs: null, updated_at: '2026-09-10T09:00:00+00:00' },
  { id: 'uX1', sku: 'SKU-X', tenant_id: 't1', technical_specs: { a: 1 }, updated_at: '2026-09-10T10:00:00+00:00' },
  { id: 'uX2', sku: 'SKU-X', tenant_id: 't2', technical_specs: { a: 1 }, updated_at: '2026-09-10T10:00:00+00:00' },
]

const filtre = (q: URLSearchParams) => (u: Urun) => {
  const esit = (k: 'id' | 'tenant_id' | 'updated_at') => !q.has(k) || q.get(k) === `eq.${u[k]}`
  return esit('id') && esit('tenant_id') && esit('updated_at')
}

beforeAll(async () => {
  kok = mkdtempSync(join(tmpdir(), 'teknik-duzelt-'))
  sunucu = createServer((req, res) => {
    istekSayisi++
    const u = new URL(req.url || '', 'http://x')
    const q = u.searchParams // PostgREST gibi: kodlanmamış '+' → boşluk
    let govde = ''
    req.on('data', (c) => { govde += c })
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json')
      if (!u.pathname.endsWith('/rest/v1/products')) { res.statusCode = 404; return res.end('[]') }
      if (req.method === 'GET') {
        const hepsi = urunler.filter(filtre(q)).sort((a, b) => a.id.localeCompare(b.id))
        const bas = Number(q.get('offset') || 0)
        const boy = q.has('limit') ? Number(q.get('limit')) : hepsi.length
        const parca = hepsi.slice(bas, bas + boy)
        if (/count=exact/.test(String(req.headers.prefer || ''))) {
          res.setHeader('Content-Range', `${bas}-${bas + parca.length - 1}/${hepsi.length}`)
        }
        return res.end(JSON.stringify(parca))
      }
      if (req.method === 'PATCH') {
        patchlar.push(req.url || '')
        if (yaris && q.get('id') === `eq.${yaris.id}` && yaris.kalan > 0) {
          yaris.kalan--
          const a = urunler.find((x) => x.id === yaris!.id)!
          a.updated_at = `2026-09-23T0${9 - yaris.kalan}:00:00+00:00` // araya başka yazım girdi
          if (yaris.specs) a.technical_specs = { ...a.technical_specs, ...yaris.specs }
        }
        const hedef = urunler.filter(filtre(q))
        const d = JSON.parse(govde) as { technical_specs: Specs }
        govdeler.push(d.technical_specs)
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

type Kayit = { degistir?: Specs; sil?: string[]; onceki?: Specs; _urun?: string }
const DUZELTME = (): Record<string, Kayit> => ({
  'SKU-A': { _urun: 'aciklama yok sayilir', degistir: { atex_zone: 'Zone 2' }, sil: ['atex_marking'],
    onceki: { atex_zone: 'Zone II', atex_marking: 'II 3G' } },
  'SKU-B': { degistir: { ip_rating: 'IP45' }, onceki: { ip_rating: 'IPX5' } },
  'SKU-C': { degistir: { atex_zone: 'Zone 2' }, onceki: { atex_zone: 'Zone II' } }, // zaten hedefte
})
const A_HEDEF = { atex_zone: 'Zone 2', rpm_max: 900 }
const B_HEDEF = { ip_rating: 'IP45', airflow_m3h: 1450 }

const hazirla = (skus: Record<string, Kayit> = DUZELTME(), ust: Record<string, unknown> = {}) => {
  urunler = ilkUrunler()
  patchlar = []
  govdeler = []
  istekSayisi = 0
  yaris = null
  writeFileSync(join(kok, 'duzeltme.json'),
    JSON.stringify({ _nicin: ['sinav'], _kanit: { belge: 'x.pdf' }, skus, ...ust }), 'utf8')
  rmSync(join(kok, 'yedek.json'), { force: true })
}
const kos = (ek: string[] = [], onay = true) =>
  new Promise<{ kod: number; cikti: string }>((coz) => {
    execFile(PY, [BETIK, '--duzeltme', join(kok, 'duzeltme.json'), '--yedek', join(kok, 'yedek.json'), ...ek],
      { env: { ...process.env, PYTHONIOENCODING: 'utf-8', VENTHUB_ENV: join(kok, '.env'), SAYFA_BOYU: '2',
        CANLI_YAZIM_ONAYI: onay ? 'evet' : '' } },
      (hata, stdout, stderr) => coz({ kod: hata ? (hata.code as number) : 0, cikti: stdout + stderr }))
  })
const urun = (id: string) => urunler.find((u) => u.id === id)!

describe('teknik-duzelt (sahte PostgREST)', () => {
  it('kuru koşum hiçbir şey yazmaz; tek anahtar reddedilir', async () => {
    hazirla()
    const r1 = await kos()
    expect(r1.kod, r1.cikti).toBe(0)
    expect(r1.cikti).toMatch(/yazilacak urun\s+: 2/)
    expect(r1.cikti).toMatch(/SKU-A\s+atex_zone\s+"Zone II" → "Zone 2"\s+\[yazilacak\]/)
    expect(r1.cikti).toMatch(/SKU-A\s+atex_marking\s+"II 3G" → —\s+\[yazilacak\]/)
    expect(r1.cikti).toMatch(/KURU KOSUM — hicbir sey yazilmadi/)
    const r2 = await kos(['--yaz'], false)
    expect(r2.kod).toBe(1)
    expect(r2.cikti).toMatch(/tek anahtar/)
    expect(patchlar).toHaveLength(0)
    expect(existsSync(join(kok, 'yedek.json'))).toBe(false)
    expect(urun('uA').technical_specs).toEqual(ilkUrunler()[0].technical_specs)
  })

  it('değiştir + sil doğru gövde; + damgası kodlanıp eşleşir; yedek + geri okuma birebir', async () => {
    hazirla()
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchlar).toHaveLength(2) // uA + uB; uC zaten hedefte
    expect(patchlar[0]).toBe(
      '/rest/v1/products?id=eq.uA&tenant_id=eq.t1&updated_at=eq.2026-09-18T07%3A59%3A00.123%2B00%3A00')
    expect(govdeler[0]).toEqual(A_HEDEF) // atex_marking silindi, rpm_max korundu
    expect(govdeler[1]).toEqual(B_HEDEF)
    expect(urun('uA').technical_specs).toEqual(A_HEDEF)
    expect(urun('uB').technical_specs).toEqual(B_HEDEF)
    expect(urun('uC').technical_specs).toEqual({ atex_zone: 'Zone 2' })
    expect(r.cikti).toMatch(/hedef ile birebir 2\/2/)
    const yedek = JSON.parse(readFileSync(join(kok, 'yedek.json'), 'utf8')) as Urun[]
    expect(yedek.find((y) => y.id === 'uA')).toEqual(ilkUrunler()[0])
  })

  it('onceki tek üründe tutmazsa HİÇBİR ürün yazılmaz (diğeri doğru olsa bile); tip birebir', async () => {
    const d = DUZELTME()
    d['SKU-B'].onceki = { ip_rating: 'IP44' }
    hazirla(d)
    const r1 = await kos(['--yaz'])
    expect(r1.kod).toBe(1)
    expect(r1.cikti).toMatch(/SKU-B: onkosul tutmadi — ip_rating: beklenen "IP44" ≠ canli "IPX5"/)
    expect(r1.cikti).toMatch(/HICBIR urun yazilmadi/)
    expect(patchlar).toHaveLength(0)
    expect(urun('uA').technical_specs).toEqual(ilkUrunler()[0].technical_specs)
    expect(existsSync(join(kok, 'yedek.json'))).toBe(false)
    // tip: canlı 900 (sayı), beklenen "900" (metin) → tutmaz
    hazirla({ 'SKU-A': { degistir: { rpm_max: 950 }, onceki: { rpm_max: '900' } } })
    const r2 = await kos(['--yaz'])
    expect(r2.kod).toBe(1)
    expect(r2.cikti).toMatch(/rpm_max: beklenen "900" ≠ canli 900/)
    // null = alan yok: yok olan alan için null beklenir, yeni alan eklenir
    hazirla({ 'SKU-B': { degistir: { ip_class: 'IP45' }, onceki: { ip_class: null } } })
    const r3 = await kos(['--yaz'])
    expect(r3.kod, r3.cikti).toBe(0)
    expect(urun('uB').technical_specs).toEqual({ ip_rating: 'IPX5', airflow_m3h: 1450, ip_class: 'IP45' })
  })

  it('zaten hedefteki ürün "değişiklik yok"; ikinci koşum 0 PATCH', async () => {
    hazirla()
    expect((await kos(['--yaz'])).kod).toBe(0)
    patchlar = []
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchlar).toHaveLength(0)
    expect(r.cikti).toMatch(/yazilacak urun\s+: 0/)
    expect(r.cikti).toMatch(/degisiklik yok\s+: 3/)
  })

  it('damga yarışında tek yeniden deneme; taze specs korunur; önkoşul bozulduysa ya da sürerse KIRMIZI', async () => {
    hazirla()
    yaris = { id: 'uA', kalan: 1, specs: { baskasi: 'yazdi' } } // ilgisiz alan eklendi, onceki tutuyor
    const r1 = await kos(['--yaz'])
    expect(r1.kod, r1.cikti).toBe(0)
    expect(patchlar.filter((p) => p.includes('id=eq.uA'))).toHaveLength(2)
    expect(patchlar[1]).toMatch(/updated_at=eq\.2026-09-23T09%3A00%3A00%2B00%3A00$/)
    expect(urun('uA').technical_specs).toEqual({ ...A_HEDEF, baskasi: 'yazdi' })

    hazirla()
    yaris = { id: 'uA', kalan: 1, specs: { atex_zone: 'Zone 1' } } // araya giren yazım önkoşulu bozdu
    const r2 = await kos(['--yaz'])
    expect(r2.kod).toBe(1)
    expect(r2.cikti).toMatch(/SKU-A: yeniden okumada onkosul tutmadi/)
    expect(patchlar.filter((p) => p.includes('id=eq.uA'))).toHaveLength(1)
    expect(urun('uA').technical_specs!.atex_zone).toBe('Zone 1')

    hazirla()
    yaris = { id: 'uA', kalan: 5 }
    const r3 = await kos(['--yaz'])
    expect(r3.kod).toBe(1)
    expect(r3.cikti).toMatch(/SKU-A: donen satir 0/)
    expect(patchlar.filter((p) => p.includes('id=eq.uA'))).toHaveLength(2)
    expect(urun('uA').technical_specs).toEqual(ilkUrunler()[0].technical_specs)
  })

  it('onceki\'de beyan edilmeyen alanı değiştirme/silme → çıkış 2, ağa çıkılmaz', async () => {
    hazirla({ 'SKU-B': { degistir: { ip_rating: 'IP45', airflow_m3h: 1500 }, onceki: { ip_rating: 'IPX5' } } })
    const r1 = await kos(['--yaz'])
    expect(r1.kod).toBe(2)
    expect(r1.cikti).toMatch(/SKU-B: `onceki`'de beklenen eski deger beyan edilmemis: \['airflow_m3h'\]/)
    hazirla({ 'SKU-A': { sil: ['atex_marking'], onceki: {} } })
    const r2 = await kos(['--yaz'])
    expect(r2.kod).toBe(2)
    hazirla(DUZELTME(), { _nicin: [] })
    const r3 = await kos(['--yaz'])
    expect(r3.kod).toBe(2)
    expect(r3.cikti).toMatch(/_nicin/)
    expect(istekSayisi).toBe(0)
    expect(patchlar).toHaveLength(0)
  })

  it('sku yok / specs NULL / çok kiracı → KIRMIZI, 0 PATCH', async () => {
    const d = DUZELTME()
    d['SKU-YOK'] = { degistir: { a: 2 }, onceki: { a: 1 } }
    d['SKU-N'] = { degistir: { a: 2 }, onceki: { a: null } }
    d['SKU-X'] = { degistir: { a: 2 }, onceki: { a: 1 } }
    hazirla(d)
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/SKU-YOK: canlida YOK/)
    expect(r.cikti).toMatch(/SKU-N: technical_specs NULL/)
    expect(r.cikti).toMatch(/SKU-X: canlida 2 satir/)
    expect(patchlar).toHaveLength(0)
  })
})
