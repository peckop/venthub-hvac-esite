/**
 * REC-172 · faz4-teknik-yukle.py `--girdi` kipi — uçtan uca, SAHTE PostgREST'e karşı (gerçek DB'ye çıkmaz).
 * Plan rec172-cikarim-dort-aile v5.1, kabul 7 + adım 3.
 *
 * Sahte sunucu sorgu dizesini `URLSearchParams` ile çözer: PostgREST gibi kodlanmamış `+`'yı BOŞLUK
 * okur. Yükleyici `updated_at`'i `quote(safe='')` ile kodlamazsa eşleşme olmaz ve sınav düşer (stub
 * gerçeği taklit ediyor). `count=exact` → Content-Range, `order/offset/limit` sayfalama (SAYFA_BOYU=2
 * ile `_veri.tumunu_cek`'in çok sayfa yolu da koşar). Her PATCH sayılır ve ham URL'si saklanır.
 *
 * Kilitlenenler:
 *   1. Kuru koşum hiçbir şey yazmaz; tek anahtar (`--yaz` onaysız) REDDEDİLİR, 0 PATCH.
 *   2. Yalnız NULL specs'e yazar; PATCH ham URL'si `%2B00%3A00` taşır; sayı int/float, metin aynen;
 *      ✗ (boş değer) satırı yazılmaz; yedek updated_at dahil; geri okuma birebir.
 *   3. Damga araya girerse 0 satır → yeniden okuma → 1 deneme; sürerse KIRMIZI;
 *      yeniden okumada specs dolmuşsa yazmaz.
 *   4. Dolu ve farklı specs'e yazmaz (KIRMIZI); dolu ve aynıysa "değişiklik yok".
 *   5. sku canlıda yok / urun_id tutmuyor → 0 PATCH. İkinci koşum 0 değişiklik.
 *   6. `--girdi` yoksa eski 8-dosya kipi çalışır (evren kapısı).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFile } from 'node:child_process'
import { createServer, type Server } from 'node:http'

const BETIK = join(__dirname, '..', 'faz4-teknik-yukle.py')
const PY = process.platform === 'win32' ? 'python' : 'python3'
type Urun = { id: string; sku: string; tenant_id: string; technical_specs: Record<string, unknown> | null; updated_at: string }

let kok = ''
let sunucu: Server
let port = 0
let urunler: Urun[] = []
let patchlar: string[] = []
// yaris: PATCH gelmeden hemen önce bu ürüne "başka biri" yazar. dolur=true ise specs'i de doldurur.
let yaris: { id: string; kalan: number; dolur?: boolean } | null = null

const ilkUrunler = (): Urun[] => [
  { id: 'uA', sku: 'SKU-A', tenant_id: 't1', technical_specs: null, updated_at: '2026-09-18T07:59:00.123+00:00' },
  { id: 'uB', sku: 'SKU-B', tenant_id: 't1', technical_specs: null, updated_at: '2026-09-18T08:00:00+00:00' },
  { id: 'uC', sku: 'SKU-C', tenant_id: 't1', technical_specs: { rpm_max: 900 }, updated_at: '2026-09-10T08:00:00+00:00' },
  { id: 'uD', sku: 'SKU-D', tenant_id: 't1', technical_specs: null, updated_at: '2026-09-10T09:00:00+00:00' },
  { id: 'uE', sku: 'SKU-E', tenant_id: 't1', technical_specs: { ip_rating: 'IP55' }, updated_at: '2026-09-10T10:00:00+00:00' },
]

const filtre = (q: URLSearchParams) => (u: Urun) => {
  const esit = (k: 'id' | 'tenant_id' | 'updated_at') => !q.has(k) || q.get(k) === `eq.${u[k]}`
  const nul = !q.has('technical_specs') || (q.get('technical_specs') === 'is.null' && u.technical_specs === null)
  return esit('id') && esit('tenant_id') && esit('updated_at') && nul
}

beforeAll(async () => {
  kok = mkdtempSync(join(tmpdir(), 'faz4-yukle-'))
  sunucu = createServer((req, res) => {
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
          if (yaris.dolur) a.technical_specs = { baskasi: 'yazdi' }
        }
        const hedef = urunler.filter(filtre(q))
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

const BASLIK = 'sku,urun_id,alan,deger,birim,belge,sayfa,alinti,kaynak,kural'
const GIRDI = [
  BASLIK,
  'SKU-A,uA,airflow_m3h,1450,m³/h,cms.pdf,2,Air flow 1450,alıntı,',
  'SKU-A,uA,motor_power_kw,"0,09",kW,cms.pdf,2,0.09 kW,alıntı,',
  'SKU-A,uA,atex_zone,Zone 2,,cms.pdf,1,Zone 2,alıntı,',
  'SKU-A,uA,voltage_alt_v,230,V,,,,koşullu,≤4 kW → 230 V',
  'SKU-A,uA,max_current_a,,A,,,,alıntı,', // ✗ satırı: yazılmaz
  'SKU-B,uB,max_delivery_ls,402.8,l/s,,,,türetildi,m3h / 3.6',
  'SKU-B,uB,rpm_max,1400,rpm,nimus.pdf,5,1400,alıntı,',
  'SKU-C,uC,rpm_max,900,rpm,nimus.pdf,6,900,alıntı,', // canlıda dolu ve AYNI → değişiklik yok
]
const A_SPECS = { airflow_m3h: 1450, motor_power_kw: 0.09, atex_zone: 'Zone 2', voltage_alt_v: 230 }
const B_SPECS = { max_delivery_ls: 402.8, rpm_max: 1400 }

const hazirla = (satirlar: string[] = GIRDI) => {
  urunler = ilkUrunler()
  patchlar = []
  yaris = null
  writeFileSync(join(kok, 'girdi.csv'), satirlar.join('\n') + '\n', 'utf8')
  rmSync(join(kok, 'yedek.json'), { force: true })
}
const kos = (ek: string[] = [], onay = true, ekOrtam: Record<string, string> = {}) =>
  new Promise<{ kod: number; cikti: string }>((coz) => {
    execFile(PY, [BETIK, '--girdi', join(kok, 'girdi.csv'), '--yedek', join(kok, 'yedek.json'), ...ek],
      { env: { ...process.env, PYTHONIOENCODING: 'utf-8', VENTHUB_ENV: join(kok, '.env'), SAYFA_BOYU: '2',
        CANLI_YAZIM_ONAYI: onay ? 'evet' : '', ...ekOrtam } },
      (hata, stdout, stderr) => coz({ kod: hata ? (hata.code as number) : 0, cikti: stdout + stderr }))
  })
const urun = (id: string) => urunler.find((u) => u.id === id)!

describe('faz4-teknik-yukle --girdi (sahte PostgREST)', () => {
  it('kuru koşum hiçbir şey yazmaz; tek anahtar reddedilir', async () => {
    hazirla()
    const r1 = await kos()
    expect(r1.kod, r1.cikti).toBe(0)
    expect(r1.cikti).toMatch(/8 satir · 3 urun · 7 hucre · bos \(✗\) satir 1/)
    expect(r1.cikti).toMatch(/yazilacak urun\s+: 2/)
    expect(r1.cikti).toMatch(/KURU KOSUM — hicbir sey yazilmadi/)
    const r2 = await kos(['--yaz'], false)
    expect(r2.kod).toBe(1)
    expect(r2.cikti).toMatch(/tek anahtar/)
    expect(patchlar).toHaveLength(0)
    expect(existsSync(join(kok, 'yedek.json'))).toBe(false)
  })

  it('yalnız NULL specs\'e tek koşullu PATCH; + damgası kodlanıp eşleşir; geri okuma birebir', async () => {
    hazirla()
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchlar).toHaveLength(2) // uA + uB; uC dolu-aynı atlandı
    expect(patchlar[0]).toBe(
      '/rest/v1/products?id=eq.uA&tenant_id=eq.t1&technical_specs=is.null&updated_at=eq.2026-09-18T07%3A59%3A00.123%2B00%3A00')
    expect(urun('uA').technical_specs).toEqual(A_SPECS)
    expect(typeof urun('uA').technical_specs!.motor_power_kw).toBe('number')
    expect(urun('uB').technical_specs).toEqual(B_SPECS)
    expect(urun('uC').technical_specs).toEqual({ rpm_max: 900 })
    expect(urun('uD').technical_specs).toBeNull() // girdide yok, dokunulmadı
    expect(r.cikti).toMatch(/girdi ile birebir 2\/2/)
    const yedek = JSON.parse(readFileSync(join(kok, 'yedek.json'), 'utf8')) as Urun[]
    expect(yedek.map((y) => y.updated_at)).toContain('2026-09-18T07:59:00.123+00:00')
  })

  it('ikinci koşum 0 değişiklik', async () => {
    hazirla()
    expect((await kos(['--yaz'])).kod).toBe(0)
    patchlar = []
    const r = await kos(['--yaz'])
    expect(r.kod, r.cikti).toBe(0)
    expect(patchlar).toHaveLength(0)
    expect(r.cikti).toMatch(/yazilacak urun\s+: 0/)
    expect(r.cikti).toMatch(/degisiklik yok 3/)
  })

  it('damga değişince 0 satır → yeniden okuma → 1 deneme; sürerse KIRMIZI', async () => {
    hazirla()
    yaris = { id: 'uA', kalan: 1 }
    const r1 = await kos(['--yaz'])
    expect(r1.kod, r1.cikti).toBe(0)
    expect(patchlar).toHaveLength(3) // yarış gerçekten oldu: uA 2 deneme + uB
    expect(urun('uA').technical_specs).toEqual(A_SPECS)
    hazirla()
    yaris = { id: 'uA', kalan: 5 }
    const r2 = await kos(['--yaz'])
    expect(r2.kod, r2.cikti).toBe(1)
    expect(r2.cikti).toMatch(/SKU-A: donen satir 0/)
    expect(patchlar).toHaveLength(3) // uA'ya en çok 2 deneme
    expect(urun('uA').technical_specs).toBeNull()
  })

  it('yeniden okumada specs dolmuşsa yazmaz (KIRMIZI)', async () => {
    hazirla()
    yaris = { id: 'uA', kalan: 1, dolur: true }
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/SKU-A: yeniden okumada technical_specs DOLU/)
    expect(urun('uA').technical_specs).toEqual({ baskasi: 'yazdi' })
    expect(patchlar.filter((p) => p.includes('id=eq.uA'))).toHaveLength(1)
  })

  it('dolu ve farklı specs\'e yazmaz, KIRMIZI', async () => {
    hazirla([...GIRDI, 'SKU-E,uE,ip_rating,IP54,,föy.pdf,1,IP54,alıntı,'])
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/SKU-E: technical_specs DOLU ve girdiden farkli/)
    expect(urun('uE').technical_specs).toEqual({ ip_rating: 'IP55' })
    expect(patchlar.some((p) => p.includes('id=eq.uE'))).toBe(false)
  })

  it('sku canlıda yok ya da urun_id tutmuyor → 0 PATCH', async () => {
    hazirla([...GIRDI, 'SKU-YOK,uX,rpm_max,1000,rpm,f.pdf,1,1000,alıntı,'])
    const r1 = await kos(['--yaz'])
    expect(r1.kod).toBe(1)
    expect(r1.cikti).toMatch(/SKU-YOK: canlida YOK/)
    hazirla(GIRDI.map((s) => s.replace('SKU-B,uB,', 'SKU-B,uD,')))
    const r2 = await kos(['--yaz'])
    expect(r2.kod).toBe(1)
    expect(r2.cikti).toMatch(/SKU-B: urun_id tutmuyor/)
    expect(patchlar).toHaveLength(0)
  })

  it('atıfsız alıntı ve bilinmeyen kaynak türü girdi kapısında KIRMIZI', async () => {
    hazirla([...GIRDI, 'SKU-D,uD,rpm_max,1000,rpm,,,,alıntı,'])
    expect((await kos(['--yaz'])).cikti).toMatch(/alıntı ama belge\/sayfa\/alinti eksik/)
    hazirla([...GIRDI, 'SKU-D,uD,rpm_max,1000,rpm,f.pdf,1,1000,tahmin,'])
    const r = await kos(['--yaz'])
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/kaynak='tahmin'/)
    expect(patchlar).toHaveLength(0)
  })

  it('--girdi yoksa eski 8-dosya kipi çalışır (evren kapısı)', async () => {
    const bos = join(kok, 'staging')
    mkdirSync(join(bos, 'duzeltilmis'), { recursive: true })
    const r = await new Promise<{ kod: number; cikti: string }>((coz) => {
      execFile(PY, [BETIK], { env: { ...process.env, PYTHONIOENCODING: 'utf-8', INGESTOR_STAGING: bos, VENTHUB_ENV: join(kok, '.env') } },
        (hata, stdout, stderr) => coz({ kod: hata ? (hata.code as number) : 0, cikti: stdout + stderr }))
    })
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/EVREN EKSIK: 0 dosya, 8 bekleniyordu/)
  })
})
