/**
 * REC-212 · geri yükleyici yazma kolu (OPS onayı 2026-09-27). Canlıya ÇIKMAZ: hedef, bu dosyanın
 * içinde bellekte çalışan sahte bir PostgREST'tir (şemalı: eksik kolonu null ile doldurur,
 * tıpkı gerçek tablo gibi). Veri UYDURMA — ürün kodları TST-*.
 *
 * Kilitlenenler:
 *   1. Hedef canlı projeyse RED — ağa çıkmadan önce.
 *   2. Hedefte ürün varsa RED; ürün sayısı ölçülemezse de RED ("bilinmiyor" boş sayılmaz).
 *   3. --yaz, --hedef-env olmadan RED (varsayılan hedef canlıdır).
 *   4. categories ebeveyn çocuktan önce yazılır; pakette olmayan ebeveyn = yarım paket.
 *   5. SABOTAJ: paketten bir kolon düşerse round-trip KIRMIZI. Eski ölçüm yalnız paketin
 *      kolonlarını karşılaştırdığı için bunu GÖREMİYORDU.
 *   6. Boş sahte hedefe tam yükleme → round-trip 0 fark, bitiş sayıları paketle eşit.
 */
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { SIRA, bitisSayilari, farkOlc, farkSifirMi, hedefKilidi, projeKimligi, tabloSirala } from '../katalog-yukle.mjs'

const BETIK = join(__dirname, '..', 'katalog-geri-yukle.mjs')
const CANLI = 'https://abcdefghijklmnop.supabase.co'

type Satir = Record<string, unknown>

describe('kilitler (saf)', () => {
  it('proje kimliği: supabase adresinden ref, yerel adresten host:port', () => {
    expect(projeKimligi(CANLI)).toBe('abcdefghijklmnop')
    expect(projeKimligi('https://ABCDEFGHIJKLMNOP.supabase.co/rest/v1')).toBe('abcdefghijklmnop')
    expect(projeKimligi('http://127.0.0.1:54321')).toBe('127.0.0.1:54321')
    expect(projeKimligi('bozuk')).toBeNull()
  })

  it('canlı proje RED — ürün sayısı 0 olsa bile', () => {
    const k = hedefKilidi({ hedefAdres: `${CANLI}/`, canliAdres: CANLI, hedefUrunSayisi: 0 })
    expect(k.izin).toBe(false)
    expect(k.sebep).toContain('CANLI')
  })

  it('dolu hedef RED, ölçülemeyen hedef RED, boş yerel hedef İZİN', () => {
    const yerel = 'http://127.0.0.1:54321'
    expect(hedefKilidi({ hedefAdres: yerel, canliAdres: CANLI, hedefUrunSayisi: 3 }).sebep).toContain('DOLU')
    expect(hedefKilidi({ hedefAdres: yerel, canliAdres: CANLI, hedefUrunSayisi: null }).izin).toBe(false)
    expect(hedefKilidi({ hedefAdres: yerel, canliAdres: '', hedefUrunSayisi: 0 }).izin).toBe(false)
    expect(hedefKilidi({ hedefAdres: yerel, canliAdres: CANLI, hedefUrunSayisi: 0 }).izin).toBe(true)
  })
})

describe('tablo sırası', () => {
  it('categories: ebeveyn çocuktan önce, girdi sırası ne olursa olsun', () => {
    const s = tabloSirala('categories', [
      { id: 'a', parent_id: 'c' }, { id: 'b', parent_id: null }, { id: 'c', parent_id: 'b' },
    ])
    expect(s.map((x: Satir) => x.id)).toEqual(['b', 'c', 'a'])
  })
  it('pakette olmayan ebeveyn = yarım paket (hata)', () => {
    expect(() => tabloSirala('categories', [{ id: 'a', parent_id: 'yok' }])).toThrow(/yarım paket/)
  })
  it('döngü = hata', () => {
    expect(() => tabloSirala('categories', [{ id: 'a', parent_id: 'b' }, { id: 'b', parent_id: 'a' }])).toThrow(/döngü/)
  })
})

describe('fark ölçümü', () => {
  const hedef = [{ id: '1', sku: 'TST-1', technical_specs: { rpm: 1 } }]
  it('aynı satır + aynı kolonlar → sıfır', () => {
    expect(farkSifirMi(farkOlc([{ id: '1', sku: 'TST-1', technical_specs: { rpm: 1 } }], hedef))).toBe(true)
  })
  it('SABOTAJ: paketten kolon düşerse KIRMIZI (satırlar kalan kolonlarda eşit olsa bile)', () => {
    const f = farkOlc([{ id: '1', sku: 'TST-1' }], hedef)
    expect(f.degisik).toBe(0)
    expect(f.eksikKolon).toEqual(['technical_specs'])
    expect(farkSifirMi(f)).toBe(false)
  })
  it('değer değişimi, eksik satır, hedefte fazla satır ayrı ayrı sayılır', () => {
    const f = farkOlc(
      [{ id: '1', sku: 'TST-X', technical_specs: { rpm: 1 } }, { id: '2', sku: 'TST-2', technical_specs: {} }],
      [...hedef, { id: '3', sku: 'TST-3', technical_specs: {} }],
    )
    expect([f.degisik, f.yeni, f.fazla]).toEqual([1, 1, 1])
  })
  it('bitiş sayıları: teknik değer + TR/EN açıklama + görsel bağı', () => {
    expect(bitisSayilari(
      [{ technical_specs: { a: 1, b: 2 }, description_i18n: { tr: 'x', en: ' ' } }, { technical_specs: null }],
      [{}, {}, {}],
    )).toEqual({ urun: 2, teknikDeger: 2, aciklamaTr: 1, aciklamaEn: 0, gorselBagi: 3 })
  })
})

// ---------------------------------------------------------------- uçtan uca, sahte hedef
const SEMA: Record<string, string[]> = {
  brands: ['id', 'name'],
  categories: ['id', 'name', 'parent_id'],
  product_families: ['id', 'slug'],
  price_lists: ['id', 'name'],
  products: ['id', 'sku', 'technical_specs', 'description_i18n'],
  product_prices: ['id', 'product_id', 'base_price'],
  product_images: ['id', 'product_id', 'path'],
}
const PAKET_VERI: Record<string, Satir[]> = {
  brands: [{ id: 'b1', name: 'TST' }],
  categories: [{ id: 'k2', name: 'Alt', parent_id: 'k1' }, { id: 'k1', name: 'Kök', parent_id: null }],
  product_families: [{ id: 'f1', slug: 'tst-aile' }],
  price_lists: [{ id: 'l1', name: 'Liste' }],
  products: [
    { id: 'p1', sku: 'TST-1', technical_specs: { rpm: 1400, ip: 'IP44' }, description_i18n: { tr: 'Açıklama', en: 'Text' } },
    { id: 'p2', sku: 'TST-2', technical_specs: {}, description_i18n: null },
  ],
  product_prices: [{ id: 'r1', product_id: 'p1', base_price: 10 }],
  product_images: [{ id: 'g1', product_id: 'p1', path: 't/p1/00.webp' }],
}

/** Şemalı bellek-içi PostgREST: POST doldurur (eksik kolon = null), GET sayar/okur, sıra ihlalini reddeder. */
function sahteHedef(tohum: Record<string, Satir[]> = {}) {
  const db: Record<string, Satir[]> = Object.fromEntries(SIRA.map((t: string) => [t, [...(tohum[t] ?? [])]]))
  const sunucu = createServer((istek, cevap) => {
    const u = new URL(istek.url ?? '/', 'http://x')
    const t = u.pathname.replace('/rest/v1/', '')
    if (!db[t]) { cevap.writeHead(404).end(); return }
    if (istek.method === 'POST') {
      let govde = ''
      istek.on('data', (p) => { govde += p })
      istek.on('end', () => {
        for (const s of JSON.parse(govde) as Satir[]) {
          if (t === 'categories' && s.parent_id != null && !db.categories.some(c => c.id === s.parent_id)) {
            cevap.writeHead(409).end('yabanci anahtar: ebeveyn yok'); return
          }
          db[t].push(Object.fromEntries(SEMA[t].map(k => [k, s[k] === undefined ? null : s[k]])))
        }
        cevap.writeHead(201).end()
      })
      return
    }
    const off = Number(u.searchParams.get('offset') ?? 0)
    const lim = Number(u.searchParams.get('limit') ?? 1000)
    cevap.setHeader('content-range', `0-0/${db[t].length}`)
    cevap.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(db[t].slice(off, off + lim)))
  })
  return { sunucu, db }
}

function paketYaz(dizin: string, veri: Record<string, Satir[]>) {
  mkdirSync(join(dizin, 'ham'), { recursive: true })
  const tablolar: Record<string, { sha256: string }> = {}
  for (const t of SIRA) {
    const govde = veri[t].map(s => JSON.stringify(s)).join('\n') + '\n'
    writeFileSync(join(dizin, 'ham', `${t}.jsonl`), govde)
    tablolar[t] = { sha256: createHash('sha256').update(govde).digest('hex') }
  }
  writeFileSync(join(dizin, 'manifest.json'), JSON.stringify({ tablolar }))
}

const kos = (argv: string[], env: Record<string, string>) =>
  new Promise<{ status: number, out: string }>((coz) => {
    execFile(process.execPath, [BETIK, ...argv], { env: { ...process.env, ...env } }, (hata, stdout, stderr) => {
      coz({ status: hata ? Number((hata as { code?: number }).code ?? 1) : 0, out: stdout + stderr })
    })
  })

describe('uçtan uca — sahte boş hedef', () => {
  let D = ''
  let sunucu: Server | null = null
  const envDosya = (ad: string, url: string) => {
    const yol = join(D, ad)
    writeFileSync(yol, `SUPABASE_URL=${url}\nSUPABASE_SERVICE_ROLE_KEY=sahte\n`)
    return yol
  }
  const baslat = async (tohum?: Record<string, Satir[]>) => {
    const h = sahteHedef(tohum)
    await new Promise<void>(r => h.sunucu.listen(0, '127.0.0.1', () => r()))
    sunucu = h.sunucu
    return { url: `http://127.0.0.1:${(h.sunucu.address() as AddressInfo).port}`, db: h.db }
  }

  beforeAll(() => { D = mkdtempSync(join(tmpdir(), 'rec212-')) })
  afterEach(() => { sunucu?.close(); sunucu = null })
  afterAll(() => rmSync(D, { recursive: true, force: true }))

  it('--yaz, --hedef-env olmadan RED (varsayılan hedef canlı)', async () => {
    const P = join(D, 'p0'); paketYaz(P, PAKET_VERI)
    const r = await kos([`--paket=${P}`, '--yaz'], { VENTHUB_ENV: envDosya('canli0.env', CANLI) })
    expect(r.status).toBe(1)
    expect(r.out).toContain('--hedef-env')
  })

  it('hedef canlıyla aynı proje → RED, hiçbir satır yazılmadan', async () => {
    const { url, db } = await baslat()
    const P = join(D, 'p1'); paketYaz(P, PAKET_VERI)
    const e = envDosya('ayni.env', url)
    const r = await kos([`--paket=${P}`, '--yaz', `--hedef-env=${e}`], { VENTHUB_ENV: e })
    expect(r.status).toBe(1)
    expect(r.out).toContain('HEDEF CANLI PROJE')
    expect(db.products.length).toBe(0)
  })

  it('dolu hedef → RED, mevcut satır dokunulmadan kalır', async () => {
    const { url, db } = await baslat({ products: [{ id: 'eski', sku: 'TST-ESKI', technical_specs: null, description_i18n: null }] })
    const P = join(D, 'p2'); paketYaz(P, PAKET_VERI)
    const r = await kos([`--paket=${P}`, '--yaz', `--hedef-env=${envDosya('dolu.env', url)}`], { VENTHUB_ENV: envDosya('canli2.env', CANLI) })
    expect(r.status).toBe(1)
    expect(r.out).toContain('HEDEF DOLU (1 ürün)')
    expect(db.products.map(s => s.id)).toEqual(['eski'])
  })

  it('boş hedefe tam yükleme → round-trip SIFIR FARK, bitiş sayıları eşit, ebeveyn önce', async () => {
    const { url, db } = await baslat()
    const P = join(D, 'p3'); paketYaz(P, PAKET_VERI)
    const r = await kos([`--paket=${P}`, '--yaz', `--hedef-env=${envDosya('bos.env', url)}`], { VENTHUB_ENV: envDosya('canli3.env', CANLI) })
    expect(r.out).toContain('SIFIR FARK')
    expect(r.status).toBe(0)
    expect(db.categories.map(s => s.id)).toEqual(['k1', 'k2'])
    expect(r.out).toMatch(/teknikDeger\s+2 →\s+2 ✓/)
    expect(r.out).not.toContain('✗')
  })

  it('SABOTAJ uçtan uca: paketten technical_specs düşerse yükleme biter ama round-trip KIRMIZI', async () => {
    const { url } = await baslat()
    const eksik = { ...PAKET_VERI, products: PAKET_VERI.products.map(({ technical_specs: _t, ...s }) => s) }
    const P = join(D, 'p4'); paketYaz(P, eksik)
    const r = await kos([`--paket=${P}`, '--yaz', `--hedef-env=${envDosya('sab.env', url)}`], { VENTHUB_ENV: envDosya('canli4.env', CANLI) })
    expect(r.status).toBe(1)
    expect(r.out).toContain('PAKETTE EKSİK KOLON technical_specs')
    expect(r.out).toContain('FARK VAR')
  })
})
