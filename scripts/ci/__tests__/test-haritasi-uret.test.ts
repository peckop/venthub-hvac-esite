import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-HARITA-1 · TEST HARİTASI ÜRETİCİSİ ve DEPODAKİ HARİTA (scripts/ci/test-haritasi-uret.cjs, karar 308 B1).
 *
 * Harita bir ÖLÇÜMDÜR (kaydedici koşarken her testin okuduğu dosya/dizinler); üretici ham kayıtları birleştirir, sıkıştırır ve
 * `import.meta.glob` okumalarını (ana süreçte: kaydedici göremez) kaynaktan çıkarıp ölçümle doğrular. Harita yanlışsa seçici bir
 * testi ELER; bu yüzden ELEME yönünde hiçbir sıkıştırma/birleştirme/çıkarım hatasına izin verilmez. Bloklar:
 *   1. `globCikar`/`desenCoz`: gerçek çağrı biçimleri (dizi, olumsuz, göreli, takma ad, genel tip, süslü), yorum/dizge anmaları SAYILMAZ,
 *      çıkarılamayan çağrı SESSİZ geçilmez (`belirsiz`),
 *   2. `sikistir`: yalnız GENİŞLETİR (özellik testi: sıkıştırılmış kayıt, özgün her girdiyi hâlâ kapsar),
 *   3. `kayitKur`/`haritaKur`: çocuk kayıtlar birleşir, geçici dizin adı sızmaz, ölçülen `?raw` okuması desenle KAPSANMIYORSA belirsiz,
 *      kırmızı/atlanan test belirsiz, ham kaydı olmayan test haritaya GİRMEZ (seçici onu her zaman koşturur),
 *   4. `serilestir`: belirlenimli (ekleme sırası fark etmez), canonical gidiş-dönüş, test başına TEK satır,
 *   5. `kontrolEt`: biçim, canonical bayt, ölçüm aracı özeti; bayat/kayıtsız/hayalet test KIRMIZI DEĞİL (seçicide "her zaman koşar"),
 *   6. DEPODAKİ HARİTA kapısı: gerçek `scripts/ci/test-haritasi.json` biçim + canonical + araç özeti taze; kendi okuduğu her yol seçiciyle
 *      GERİ BULUNUR (özgün tutarlılık), yolların hepsi köke göreli POSIX,
 *   7. SABOTAJ: üretici kaynağına tek tek hata sokulur; her hatalı kopya en az bir senaryoyu kırmızıya çevirir.
 */

type Kayit = { sha: string; okunan?: string[]; dizin?: string[]; ozy?: string[]; desenler?: string[]; surec?: string[]; belirsiz?: string[] }
type Harita = { surum: number; uretim: Record<string, string>; arac: string; kokler: string[]; kuresel: string[]; kuresel_desenler: string[]; testler: Record<string, Kayit> }
type Ham = { surum: number; test: string; kurulum: { okunan: string[]; dizin: string[]; ozy: string[] }; okunan: string[]; dizin: string[]; ozy: string[]; surec: string[]; belirsiz: string[] }
type Girdi3 = { okunan: string[]; dizin: string[]; ozy: string[] }
type VitestDurumu = { basarisiz: boolean; atlanan: number; testSayisi: number }
type HamKlasor = {
  anaKayitlar: Map<string, Ham>
  cocuklar: Map<string, Ham[]>
  globOlcum: Map<string, Array<{ kimlik: string; raw: string[] }>>
  vitestDurumlari: Map<string, VitestDurumu>
}
type Uretici = {
  ESIK: { dizinAltAgac: number; dosyaDizin: number; altAgacDosya: number }
  HARITA_YOLU: string
  partilereBol: (liste: string[], n: number) => string[][]
  hamKlasoruOku: (klasor: string, kok: string) => HamKlasor
  desenCoz: (desen: string, dosya: string) => string | null
  globCikar: (kaynak: string, dosya: string) => { desenler: string[]; belirsiz: string[] }
  sikistir: (g: Girdi3 & { okunan: string[] }, esik?: { dizinAltAgac: number; dosyaDizin: number; altAgacDosya: number }) => Girdi3
  surecEtiketi: (etiket: string) => string
  rawYolu: (belirtec: string, kimlik: string) => string | null
  kayitKur: (g: { ana: Ham; cocuklar: Ham[]; kaynak: string; testYolu: string; vitestDurumu: VitestDurumu | null; globOlcum: Array<{ kimlik: string; raw: string[] }>; yoksayilan?: Set<string> }) => { kayit: Required<Kayit>; kurulum: Girdi3 }
  haritaKur: (g: { kok: string; ham: HamKlasor; testler: string[]; kaynakOku: (y: string) => string; dosyalar: string[]; uretim: Record<string, string>; yoksayilan?: Set<string> }) => { harita: Harita; ozet: { kayitli: number; kayitsiz: string[]; kodGlobBelirsiz: string[] } }
  yoksayilanYollar: (kok: string, ham: Pick<HamKlasor, 'anaKayitlar' | 'cocuklar'>) => Set<string>
  serilestir: (h: Harita) => string
  kontrolEt: (kok: string, testler: string[], harita?: Harita | null, metin?: string | null) => { sorunlar: string[]; bilgi: { bayat: string[]; kayitsiz: string[]; hayalet: string[] } }
  kodGlobTaramasi: (kok: string, dosyalar: string[], testMi: (d: string) => boolean) => { desenler: string[]; belirsiz: string[] }
}
type Secici = {
  TEST_DESENI: RegExp
  HARITA_SURUMU: number
  globEslesir: (d: string[], y: string) => boolean
  haritaEslesmeleri: (indeks: unknown, yol: string) => Set<string>
  indeksKur: (h: Harita) => unknown
  icerikOzeti: (m: string) => string
  aracOzeti: (kok: string) => string
  haritaSorunu: (h: unknown) => string | null
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const URETICI_YOLU = path.join(KOK, 'scripts/ci/test-haritasi-uret.cjs')
const KAYNAK = readFileSync(URETICI_YOLU, 'utf8')
const U = require_(URETICI_YOLU) as Uretici
const S = require_(path.join(KOK, 'scripts/ci/test-sec.cjs')) as Secici

function esit(gercek: unknown, beklenen: unknown, ne: string): void {
  if (JSON.stringify(gercek) !== JSON.stringify(beklenen)) throw new Error(`${ne}: beklenen ${JSON.stringify(beklenen)} ama gelen ${JSON.stringify(gercek)}`)
}
function dogru(kosul: boolean, ne: string): void {
  if (!kosul) throw new Error(ne)
}

const TEST = 'src/__tests__/conformance/ornek.test.ts'

function ham(ek: Partial<Ham> = {}): Ham {
  return { surum: 1, test: TEST, kurulum: { okunan: [], dizin: [], ozy: [] }, okunan: [], dizin: [], ozy: [], surec: [], belirsiz: [], ...ek }
}

/** Sıkıştırılmış kaydın bir YOLU hâlâ kapsayıp kapsamadığı (seçicideki eşleşme anlamıyla: okunan = yol ya da üst dizin, dizin = doğrudan çocuk, ozy = alt ağaç). */
function kapsar(k: Girdi3, yol: string): boolean {
  const parcalar = yol.split('/')
  const ustler = parcalar.slice(0, -1).map((_, i) => parcalar.slice(0, i + 1).join('/'))
  const ust = ustler.length > 0 ? ustler[ustler.length - 1] : '.'
  return k.okunan.some((p) => p === yol || ustler.includes(p)) || k.dizin.includes(ust) || k.ozy.some((r) => r === '.' || ustler.includes(r) || r === yol)
}

// ---------------------------------------------------------------------------------------------------------------------------
// SENARYOLAR
// ---------------------------------------------------------------------------------------------------------------------------

type Senaryo = { ad: string; kos: (u: Uretici) => void }

function uretilenGlob(u: Uretici, kaynak: string, dosya = 'src/__tests__/conformance/t.test.ts') {
  return u.globCikar(kaynak, dosya)
}

/** Rastgelelik sabit tohumlu (belirlenimli). */
function tohum(n: number): () => number {
  let x = n
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296
    return x / 4294967296
  }
}

function rastgeleGirdi(rnd: () => number): Girdi3 {
  const kokler = ['src', 'docs', 'scripts']
  const yol = (derinlik: number) => Array.from({ length: derinlik }, () => `d${Math.floor(rnd() * 6)}`).join('/')
  const secim = () => `${kokler[Math.floor(rnd() * kokler.length)]}/${yol(1 + Math.floor(rnd() * 3))}`
  const dosya = () => `${secim()}/f${Math.floor(rnd() * 70)}.ts`
  return {
    okunan: Array.from({ length: Math.floor(rnd() * 120) }, dosya),
    dizin: Array.from({ length: Math.floor(rnd() * 25) }, secim),
    ozy: Array.from({ length: Math.floor(rnd() * 3) }, secim),
  }
}

const SENARYOLAR: Senaryo[] = [
  {
    ad: 'globCikar: tek desen, dizi, olumsuz, göreli, takma ad, genel tip, süslü, `**` ile başlayan',
    kos: (u) => {
      esit(uretilenGlob(u, "import.meta.glob('/src/**/*.{ts,tsx}', { query: '?raw', eager: true })").desenler, ['src/**/*.{ts,tsx}'], 'tek desen')
      esit(uretilenGlob(u, "import.meta.glob(['../../a/*.ts', '!../../a/x.ts'], { eager: true })").desenler, ['!src/a/x.ts', 'src/a/*.ts'], 'dizi + olumsuz + göreli')
      esit(uretilenGlob(u, "import.meta.glob('./fix/*.json')", 'scripts/ci/__tests__/t.test.ts').desenler, ['scripts/ci/__tests__/fix/*.json'], 'aynı dizin göreli')
      esit(uretilenGlob(u, "import.meta.glob('@/lib/**/*.ts')").desenler, ['src/lib/**/*.ts'], 'takma ad')
      esit(uretilenGlob(u, "import.meta.glob<string>('/x/*.md', { query: '?raw' })").desenler, ['x/*.md'], 'genel tip')
      esit(uretilenGlob(u, 'import.meta.glob(`/y/*.sql`)').desenler, ['y/*.sql'], 'şablon dizgesi')
      esit(uretilenGlob(u, "import.meta.glob(['/src/**', '!**/*.compiled.*.ts'])").desenler, ['!**/*.compiled.*.ts', 'src/**'], '** ile başlayan olumsuz')
      esit(uretilenGlob(u, "const a = import.meta.glob('/a/*');\nconst b = import . meta . glob('/b/*');").desenler, ['a/*', 'b/*'], 'birden çok çağrı ve boşluklu yazım')
    },
  },
  {
    ad: 'globCikar: yorum satırı, JSDoc ve dizge içindeki anmalar GERÇEK çağrı sayılmaz',
    kos: (u) => {
      const kaynak = ["// import.meta.glob('/yorum/*')", " * import.meta.glob('/jsdoc/*')", "/* import.meta.glob('/blok/*') */", "const metin = 'import.meta.glob(' + x", 'const s = `import.meta.glob(`', "const gercek = import.meta.glob('/gercek/*')"].join('\n')
      esit(uretilenGlob(u, kaynak).desenler, ['gercek/*'], 'yalnız gerçek çağrı')
      esit(uretilenGlob(u, kaynak).belirsiz, [], 'anmalar belirsiz üretmemeli')
    },
  },
  {
    ad: 'globCikar: çıkarılamayan çağrı SESSİZ geçilmez (belirsiz)',
    kos: (u) => {
      for (const [kaynak, parca] of [
        ['import.meta.glob(desenDegiskeni)', 'argümanı çıkarılamadı'],
        ['import.meta.glob(`/a/${x}/*`)', 'argümanı çıkarılamadı'],
        ["import.meta.glob(['/a/*', degisken])", 'argümanı çıkarılamadı'],
        ["import.meta.glob('/a/*', { base: '/src' })", 'base seçeneği'],
        ["import.meta.glob('../../../../dis/*')", 'çözülemedi'],
        ["import.meta.glob('src/**/*.ts')", 'çözülemedi'],
      ] as const) {
        const g = uretilenGlob(u, kaynak)
        dogru(g.belirsiz.some((b) => b.includes(parca)), `belirsiz bekleniyordu (${kaynak}): ${JSON.stringify(g)}`)
      }
    },
  },
  {
    ad: 'rawYolu: göreli ve kök-göreli belirteç köke göreli yola çevrilir; sorgu atılır; kök dışı ve node_modules null',
    kos: (u) => {
      esit(u.rawYolu('../../../.githooks/README.md?raw', 'src/__tests__/conformance/t.test.ts'), '.githooks/README.md', 'göreli')
      esit(u.rawYolu('/src/a.ts?raw', 'x/t.test.ts'), 'src/a.ts', 'kök-göreli')
      esit(u.rawYolu('./3d-csp.test.ts?raw&x=1', 'src/__tests__/conformance/t.test.ts'), 'src/__tests__/conformance/3d-csp.test.ts', 'sorgu atılır')
      esit(u.rawYolu('/@fs/C:/x/a.ts?raw', 't.test.ts'), null, '/@fs')
      esit(u.rawYolu('../../../../../dis.md?raw', 'src/t.test.ts'), null, 'kök dışı')
      esit(u.rawYolu('/node_modules/x/a.js?raw', 't.test.ts'), null, 'node_modules')
    },
  },
  {
    ad: 'sikistir: alt ağaç dizin ve dosyayı yutar; dizin doğrudan çocuk dosyayı yutar',
    kos: (u) => {
      esit(u.sikistir({ okunan: ['a/b/c.txt', 'z/q.txt'], dizin: ['a/b', 'a'], ozy: ['a'] }), { okunan: ['z/q.txt'], dizin: [], ozy: ['a'] }, 'alt ağaç yutar')
      esit(u.sikistir({ okunan: ['a/x', 'a/y', 'b/z'], dizin: ['a'], ozy: [] }), { okunan: ['b/z'], dizin: ['a'], ozy: [] }, 'dizin çocuğu yutar')
      esit(u.sikistir({ okunan: ['a/b/x'], dizin: ['a'], ozy: [] }), { okunan: ['a/b/x'], dizin: ['a'], ozy: [] }, 'dizin torunu YUTMAZ (doğrudan çocuk değil)')
    },
  },
  {
    ad: 'sikistir: eşikler (8 dizin → üst alt ağaç; 40 dosya → dizin); eşiğin altında dokunmaz',
    kos: (u) => {
      const sekiz = Array.from({ length: 8 }, (_, i) => `s/d${i}`)
      esit(u.sikistir({ okunan: [], dizin: sekiz, ozy: [] }), { okunan: [], dizin: [], ozy: ['s'] }, '8 dizin')
      esit(u.sikistir({ okunan: [], dizin: sekiz.slice(0, 7), ozy: [] }), { okunan: [], dizin: [...sekiz.slice(0, 7)].sort(), ozy: [] }, '7 dizin')
      const kirk = Array.from({ length: 40 }, (_, i) => `k/f${i}.ts`)
      esit(u.sikistir({ okunan: kirk, dizin: [], ozy: [] }), { okunan: [], dizin: ['k'], ozy: [] }, '40 dosya')
      esit(u.sikistir({ okunan: kirk.slice(0, 39), dizin: [], ozy: [] }).okunan.length, 39, '39 dosya')
      // 60 dosya on alt dizine YAYILMIŞ (hiçbir dizinde 40 yok): en derin ortak üst dizin alt ağaç olur
      const altmis = Array.from({ length: 60 }, (_, i) => `u/d${i % 10}/f${i}.ts`)
      esit(u.sikistir({ okunan: altmis, dizin: [], ozy: [] }), { okunan: [], dizin: [], ozy: ['u'] }, '60 dosya alt dizinlere yayılmış')
      esit(u.sikistir({ okunan: altmis.slice(0, 59), dizin: [], ozy: [] }).ozy, [], '59 dosya')
      // en derin aday kazanır: aynı 60 dosya `a/b/c` altındaysa `a` ya da `a/b` DEĞİL `a/b/c` olur
      const derin = Array.from({ length: 60 }, (_, i) => `a/b/c/d${i % 10}/f${i}.ts`)
      esit(u.sikistir({ okunan: derin, dizin: [], ozy: [] }).ozy, ['a/b/c'], 'en derin ortak üst dizin')
      esit(u.ESIK, { dizinAltAgac: 8, dosyaDizin: 40, altAgacDosya: 60 }, 'eşik sözleşmesi')
    },
  },
  {
    ad: 'partilereBol: bitişik, belirlenimli, hiçbir test düşmez, boş parça yok, istenen sayıda parça',
    kos: (u) => {
      const liste = Array.from({ length: 10 }, (_, i) => `t${i}`)
      const p = u.partilereBol(liste, 3)
      esit(p.length, 3, 'parça sayısı')
      esit(p.flat(), liste, 'sıra korunur ve hiçbiri düşmez')
      dogru(p.every((x) => x.length > 0), 'boş parça yok')
      esit(u.partilereBol(liste, 3), p, 'belirlenimli')
      esit(u.partilereBol(liste, 50).flat(), liste, 'parçadan çok n')
      esit(u.partilereBol([], 4), [], 'boş liste')
    },
  },
  {
    ad: 'hamKlasoruOku: ana kayıt, alt süreç kaydı, glob ölçümü ve BİRDEN ÇOK vitest sonuç dosyası (vitest-N.json) okunur; bozuk dosya atlanır',
    kos: (u) => {
      const kok = mkdtempSync(path.join(tmpdir(), 'ham-oku-kok-'))
      const klasor = mkdtempSync(path.join(tmpdir(), 'ham-oku-'))
      const yaz = (ad: string, nesne: unknown) => writeFileSync(path.join(klasor, ad), typeof nesne === 'string' ? nesne : JSON.stringify(nesne))
      yaz('aaa.json', ham({ test: 'src/a.test.ts', okunan: ['docs/a.md'] }))
      yaz('aaa.c123-456.json', ham({ test: 'src/a.test.ts', okunan: ['docs/c.md'] }))
      yaz('bozuk.json', '{bozuk')
      yaz('yabanci.json', { x: 1 })
      yaz('glob-olcum.jsonl', `${JSON.stringify({ kimlik: path.join(kok, 'src/a.test.ts'), raw: ['/x/y.ts?raw'] })}\nbozuk satir\n`)
      const sonuc = (adlar: Array<[string, string, number]>) => ({
        testResults: adlar.map(([ad, durum, atlanan]) => ({ name: path.join(kok, ad), status: durum, startTime: 1000, endTime: 3500, assertionResults: [{ status: 'passed' }, ...Array.from({ length: atlanan }, () => ({ status: 'pending' }))] })),
      })
      yaz('vitest-0.json', sonuc([['src/a.test.ts', 'passed', 0]]))
      yaz('vitest-1.json', sonuc([['src/b.test.ts', 'failed', 2]]))
      const h = u.hamKlasoruOku(klasor, kok)
      esit([...h.anaKayitlar.keys()], ['src/a.test.ts'], 'ana kayıt')
      esit((h.cocuklar.get('src/a.test.ts') ?? []).length, 1, 'alt süreç kaydı')
      esit(h.globOlcum.get('src/a.test.ts')?.[0].raw, ['/x/y.ts?raw'], 'glob ölçümü')
      esit([...h.vitestDurumlari.keys()].sort(), ['src/a.test.ts', 'src/b.test.ts'], 'iki vitest sonuç dosyası birleşir')
      esit(h.vitestDurumlari.get('src/b.test.ts'), { basarisiz: true, atlanan: 2, testSayisi: 3, sn: 2.5 }, 'kırmızı ve atlanan sayısı, süre')
      esit(h.vitestDurumlari.get('src/a.test.ts')?.basarisiz, false, 'yeşil')
    },
  },
  {
    ad: 'sikistir ÖZELLİK TESTİ: 200 rastgele girdide özgün her yol sıkıştırılmış kayıtta hâlâ kapsanır (yalnız genişletir)',
    kos: (u) => {
      const rnd = tohum(20261007)
      for (let i = 0; i < 200; i++) {
        const g = rastgeleGirdi(rnd)
        const s = u.sikistir(g)
        for (const p of g.okunan) dogru(kapsar(s, p), `okunan kayboldu: ${p} (tur ${i})`)
        for (const d of g.dizin) dogru(kapsar(s, `${d}/yeni-dosya.txt`), `dizin kayboldu: ${d} (tur ${i})`)
        for (const r of g.ozy) dogru(kapsar(s, `${r}/a/b/c.txt`), `alt ağaç kayboldu: ${r} (tur ${i})`)
        esit(s.okunan, [...new Set(s.okunan)].sort(), 'okunan sıralı tekil')
        esit(s.dizin, [...new Set(s.dizin)].sort(), 'dizin sıralı tekil')
        esit(s.ozy, [...new Set(s.ozy)].sort(), 'ozy sıralı tekil')
      }
    },
  },
  {
    ad: 'kayitKur: çocuk kayıtlar birleşir; geçici dizin adı etikete sızmaz; test kendi yolunu okumuş sayılmaz',
    kos: (u) => {
      const ana = ham({ okunan: ['docs/a.md', TEST], surec: ['node C:\\Users\\x\\Temp\\rastgele-1\\a.cjs', 'node scripts/x.cjs'] })
      const cocuk = ham({ okunan: ['docs/cocuk.md'], dizin: ['docs/cocuk-dizin'], surec: ['node /tmp/rastgele-2/b.cjs'], belirsiz: ['x: izlenemeyen süreç'] })
      const { kayit } = u.kayitKur({ ana, cocuklar: [cocuk], kaynak: '// k', testYolu: TEST, vitestDurumu: null, globOlcum: [] })
      esit(kayit.okunan, ['docs/a.md', 'docs/cocuk.md'], 'okunan birleşimi, kendi yolu yok')
      // İzlenmeyen + ignore kapsamındaki yol (testin yazdığı `tmp/<ad>-<pid>.json`) atılır; izlenen yol kalır
      const gecici = u.kayitKur({ ana: ham({ okunan: ['docs/a.md', 'tmp/gecici-4242.json'] }), cocuklar: [], kaynak: '// k', testYolu: TEST, vitestDurumu: null, globOlcum: [], yoksayilan: new Set(['tmp/gecici-4242.json']) }).kayit
      esit(gecici.okunan, ['docs/a.md'], 'ignore kapsamındaki geçici dosya atılır')
      esit(kayit.dizin, ['docs/cocuk-dizin'], 'dizin')
      esit(kayit.surec, ['node (repo dışı betik)', 'node scripts/x.cjs'], 'süreç etiketleri')
      esit(kayit.belirsiz, ['x: izlenemeyen süreç'], 'belirsiz çocuktan taşınır')
    },
  },
  {
    ad: 'kayitKur: ölçülen ?raw okuması desenle KAPSANIYORSA temiz; KAPSANMIYORSA belirsiz + okunan; desensiz doğrudan ?raw okunan olur',
    kos: (u) => {
      const kaynak = "import.meta.glob('/src/**/*.ts', { query: '?raw' })"
      const temiz = u.kayitKur({ ana: ham(), cocuklar: [], kaynak, testYolu: TEST, vitestDurumu: null, globOlcum: [{ kimlik: TEST, raw: ['/src/a/b.ts?raw'] }] }).kayit
      esit(temiz.belirsiz, [], 'kapsanan ölçüm temiz')
      esit(temiz.desenler, ['src/**/*.ts'], 'desen')
      const kacak = u.kayitKur({ ana: ham(), cocuklar: [], kaynak, testYolu: TEST, vitestDurumu: null, globOlcum: [{ kimlik: TEST, raw: ['/src/a/b.ts?raw', '/docs/gizli.md?raw'] }] }).kayit
      dogru(kacak.belirsiz.some((b) => b.includes('desen kapsamıyor')), `kapsanmayan ölçüm belirsiz olmalı: ${JSON.stringify(kacak.belirsiz)}`)
      dogru(kacak.okunan.includes('docs/gizli.md'), 'kapsanmayan ölçülen yol okunan olmalı')
      const dogrudan = u.kayitKur({ ana: ham(), cocuklar: [], kaynak: "import x from './a.md?raw'", testYolu: TEST, vitestDurumu: null, globOlcum: [{ kimlik: TEST, raw: ['./a.md?raw'] }] }).kayit
      esit(dogrudan.okunan, ['src/__tests__/conformance/a.md'], 'doğrudan ?raw okunan olur')
      esit(dogrudan.belirsiz, [], 'doğrudan ?raw belirsiz DEĞİL')
    },
  },
  {
    ad: 'kayitKur: ölçümde kırmızı ya da atlanan test belirsizdir; temiz test değildir; özet kaynaktan',
    kos: (u) => {
      const kos = (d: VitestDurumu | null) => u.kayitKur({ ana: ham(), cocuklar: [], kaynak: '// icerik', testYolu: TEST, vitestDurumu: d, globOlcum: [] }).kayit
      dogru(kos({ basarisiz: true, atlanan: 0, testSayisi: 3 }).belirsiz.some((b) => b.includes('kırmızı')), 'kırmızı → belirsiz')
      dogru(kos({ basarisiz: false, atlanan: 2, testSayisi: 3 }).belirsiz.some((b) => b.includes('atlandı')), 'atlanan → belirsiz')
      esit(kos({ basarisiz: false, atlanan: 0, testSayisi: 3 }).belirsiz, [], 'temiz')
      esit(kos(null).sha, S.icerikOzeti('// icerik'), 'sha = kaynak özeti')
    },
  },
  {
    ad: 'surecEtiketi: mutlak geçici yol sızıntısı (Windows/POSIX) düzeltilir; depo içi göreli etiket korunur',
    kos: (u) => {
      esit(u.surecEtiketi('node C:\\Users\\a\\x.cjs'), 'node (repo dışı betik)', 'Windows')
      esit(u.surecEtiketi('node /tmp/x/y.cjs'), 'node (repo dışı betik)', 'POSIX')
      esit(u.surecEtiketi('node scripts/a.cjs'), 'node scripts/a.cjs', 'göreli')
      esit(u.surecEtiketi('git ls-files'), 'git ls-files', 'git')
    },
  },
  {
    ad: 'serilestir: belirlenimli (ekleme sırası fark etmez), canonical gidiş-dönüş, boş alan yok, test başına tek satır, sonda satır sonu',
    kos: (u) => {
      const a: Harita = { surum: 1, uretim: { vitest: '4', kip: 'dislan', node: '22' }, arac: 'x', kokler: ['src', 'docs'], kuresel: ['b', 'a'], kuresel_desenler: [], testler: { 'b.test.ts': { sha: '1', okunan: ['z', 'y'], dizin: [] }, 'a.test.ts': { sha: '2', desenler: ['q'] } } }
      const b: Harita = { ...a, testler: { 'a.test.ts': { sha: '2', desenler: ['q'] }, 'b.test.ts': { sha: '1', dizin: [], okunan: ['y', 'z'] } } }
      const metin = u.serilestir(a)
      esit(u.serilestir(b), metin, 'ekleme sırası')
      esit(u.serilestir(JSON.parse(metin) as Harita), metin, 'canonical gidiş-dönüş')
      dogru(metin.endsWith('}\n') && !metin.endsWith('\n\n'), 'tek satır sonu')
      dogru(!metin.includes('"dizin":[]'), 'boş alan yazılmamalı')
      dogru(metin.includes('"kokler": ["docs","src"]'), 'kökler sıralı')
      esit(metin.split('\n').filter((s) => s.includes('.test.ts')).length, 2, 'test başına TEK satır')
    },
  },
  {
    ad: 'haritaKur: ham kaydı olmayan test haritaya GİRMEZ ve ozet.kayitsiz listesinde; kurulum evresi okumaları küresel; kökler dosyalardan',
    kos: (u) => {
      const kok = mkdtempSync(path.join(tmpdir(), 'harita-kur-'))
      mkdirSync(path.join(kok, 'src'), { recursive: true })
      writeFileSync(path.join(kok, 'src/a.test.ts'), '// a')
      writeFileSync(path.join(kok, 'src/b.test.ts'), '// b')
      const hamKlasor: HamKlasor = {
        anaKayitlar: new Map([['src/a.test.ts', ham({ test: 'src/a.test.ts', okunan: ['docs/x.md'], kurulum: { okunan: ['docs/kurulum.json'], dizin: [], ozy: [] } })]]),
        cocuklar: new Map(),
        globOlcum: new Map(),
        vitestDurumlari: new Map(),
      }
      const { harita, ozet } = u.haritaKur({ kok, ham: hamKlasor, testler: ['src/a.test.ts', 'src/b.test.ts'], kaynakOku: (y) => readFileSync(path.join(kok, y), 'utf8'), dosyalar: ['src/a.test.ts', 'src/b.test.ts', 'docs/x.md', 'README.md'], uretim: { vitest: 'v', kip: 'dislan', node: '22' } })
      esit(Object.keys(harita.testler), ['src/a.test.ts'], 'yalnız kayıtlı test')
      esit(ozet.kayitsiz, ['src/b.test.ts'], 'kayıtsız liste')
      esit(harita.kuresel, ['docs/kurulum.json'], 'kurulum okuması küresel')
      esit(harita.kokler, ['README.md', 'docs', 'src'], 'kökler')
      esit(harita.surum, S.HARITA_SURUMU, 'sürüm')
      esit(S.haritaSorunu(harita), null, 'seçicinin haritayı geçerli bulması')
      // ölçüm sonuçları (vitest JSON) VARSA ama bu test için YOKSA kırmızı/atlanan bilinemez: belirsiz
      const durumlu: HamKlasor = { ...hamKlasor, vitestDurumlari: new Map([['src/baska.test.ts', { basarisiz: false, atlanan: 0, testSayisi: 1 }]]) }
      const iki = u.haritaKur({ kok, ham: durumlu, testler: ['src/a.test.ts'], kaynakOku: (y) => readFileSync(path.join(kok, y), 'utf8'), dosyalar: ['src/a.test.ts'], uretim: { vitest: 'v', kip: 'dislan', node: '22' } })
      dogru((iki.harita.testler['src/a.test.ts']?.belirsiz ?? []).some((b) => b.includes('vitest JSON')), 'sonuçsuz test belirsiz olmalı')
      esit(harita.testler['src/a.test.ts']?.belirsiz ?? [], [], 'hiç vitest sonucu yoksa (eski ham klasör) belirsiz EKLENMEZ')
    },
  },
  {
    ad: 'haritaKur: test dışı yardımcı modülün ölçülen ?raw okuması deseni kapsamıyorsa küresel; test dışı kodun glob deseni küresel desen',
    kos: (u) => {
      const kok = mkdtempSync(path.join(tmpdir(), 'harita-kur2-'))
      mkdirSync(path.join(kok, 'src/yardim'), { recursive: true })
      writeFileSync(path.join(kok, 'src/yardim/okur.ts'), "export const k = import.meta.glob('/docs/**/*.md', { query: '?raw' })")
      writeFileSync(path.join(kok, 'src/a.test.ts'), '// a')
      const hamKlasor: HamKlasor = {
        anaKayitlar: new Map([['src/a.test.ts', ham({ test: 'src/a.test.ts' })]]),
        cocuklar: new Map(),
        globOlcum: new Map([['src/yardim/okur.ts', [{ kimlik: 'src/yardim/okur.ts', raw: ['/docs/a/b.md?raw', '/ekstra/gizli.txt?raw'] }]]]),
        vitestDurumlari: new Map(),
      }
      const { harita } = u.haritaKur({ kok, ham: hamKlasor, testler: ['src/a.test.ts'], kaynakOku: (y) => readFileSync(path.join(kok, y), 'utf8'), dosyalar: ['src/a.test.ts', 'src/yardim/okur.ts'], uretim: { vitest: 'v', kip: 'dislan', node: '22' } })
      esit(harita.kuresel_desenler, ['docs/**/*.md'], 'yardımcının deseni küresel desen')
      esit(harita.kuresel, ['ekstra/gizli.txt'], 'desenin kapsamadığı ölçülen yol küresel')
      // Test dışı kodda ÇIKARILAMAYAN glob çağrısı: küresel desen `**` (her değişiklik tam) ve belirsizlik raporlanır
      writeFileSync(path.join(kok, 'src/yardim/bozuk.ts'), 'export const k = import.meta.glob(desenDegiskeni)')
      const belirsiz = u.haritaKur({ kok, ham: hamKlasor, testler: ['src/a.test.ts'], kaynakOku: (y) => readFileSync(path.join(kok, y), 'utf8'), dosyalar: ['src/a.test.ts', 'src/yardim/okur.ts', 'src/yardim/bozuk.ts'], uretim: { vitest: 'v', kip: 'dislan', node: '22' } })
      dogru(belirsiz.harita.kuresel_desenler.includes('**'), `çıkarılamayan test dışı glob küresel '**' eklemeli: ${JSON.stringify(belirsiz.harita.kuresel_desenler)}`)
      esit(belirsiz.ozet.kodGlobBelirsiz.length, 1, 'belirsizlik raporlanır')
    },
  },
  {
    ad: 'yoksayilanYollar: izlenmeyen ve `.gitignore` kapsamındaki yol döner; izlenen dosya (ignore desenine uysa da) ve olağan dosya DÖNMEZ',
    kos: (u) => {
      const kok = mkdtempSync(path.join(tmpdir(), 'ignore-kok-'))
      const git = (...a: string[]) => execFileSync('git', ['-C', kok, ...a], { stdio: 'pipe' })
      git('init', '-q')
      writeFileSync(path.join(kok, '.gitignore'), 'tmp/\n*.log\n')
      mkdirSync(path.join(kok, 'tmp'), { recursive: true })
      for (const d of ['tmp/a-123.json', 'x.log', 'izlenen.log', 'docs.md']) writeFileSync(path.join(kok, d), 'x')
      git('add', '-f', 'izlenen.log')
      const hamK = { anaKayitlar: new Map([[TEST, ham({ okunan: ['tmp/a-123.json', 'x.log', 'izlenen.log', 'docs.md', 'yok-olan.txt'] })]]), cocuklar: new Map<string, Ham[]>() }
      esit([...u.yoksayilanYollar(kok, hamK)].sort(), ['tmp/a-123.json', 'x.log'], 'izlenmeyen + ignore')
      esit([...u.yoksayilanYollar(kok, { anaKayitlar: new Map(), cocuklar: new Map() })], [], 'boş girdi')
      // alt süreç kayıtlarındaki okumalar da taranır
      const cocuklu = { anaKayitlar: new Map(), cocuklar: new Map([[TEST, [ham({ okunan: ['tmp/c-1.json'] })]]]) }
      esit([...u.yoksayilanYollar(kok, cocuklu)], ['tmp/c-1.json'], 'çocuk kaydı')
    },
  },
  {
    ad: 'kontrolEt: bozuk biçim, canonical olmayan bayt ve değişmiş ölçüm aracı KIRMIZI; bayat/kayıtsız/hayalet test KIRMIZI DEĞİL',
    kos: (u) => {
      const h: Harita = { surum: 1, uretim: { vitest: 'v', kip: 'dislan', node: '22' }, arac: S.aracOzeti(KOK), kokler: ['src'], kuresel: [], kuresel_desenler: [], testler: { 'src/hayalet.test.ts': { sha: 'x' } } }
      const metin = u.serilestir(h)
      esit(u.kontrolEt(KOK, [], h, metin).sorunlar, [], 'temiz harita')
      dogru(u.kontrolEt(KOK, [], { ...h, arac: 'eski-arac' }, u.serilestir({ ...h, arac: 'eski-arac' })).sorunlar.some((s) => s.includes('ölçüm aracı özeti')), 'araç özeti farklıysa kırmızı')
      dogru(u.kontrolEt(KOK, [], h, `${metin} `).sorunlar.some((s) => s.includes('canonical')), 'canonical olmayan bayt kırmızı')
      dogru(u.kontrolEt(KOK, [], { ...h, surum: 9 }, metin).sorunlar.some((s) => s.includes('biçimi geçersiz')), 'biçim kırmızı')
      const bilgi = u.kontrolEt(KOK, ['package.json', 'scripts/ci/test-sec.cjs'], h, metin)
      esit(bilgi.sorunlar, [], 'kayıtsız/hayalet kırmızı değil')
      esit(bilgi.bilgi.kayitsiz, ['package.json', 'scripts/ci/test-sec.cjs'], 'kayıtsız')
      esit(bilgi.bilgi.hayalet, ['src/hayalet.test.ts'], 'hayalet')
    },
  },
]

// ---------------------------------------------------------------------------------------------------------------------------
// SABOTAJ
// ---------------------------------------------------------------------------------------------------------------------------

type Sabotaj = { ad: string; eski: string; yeni: string }

const SABOTAJLAR: Sabotaj[] = [
  { ad: 'serileştirme test adlarını sıralamaz (belirlenimlilik)', eski: 'const adlar = Object.keys(harita.testler).sort();', yeni: 'const adlar = Object.keys(harita.testler);' },
  { ad: 'serileştirme kök listesini sıralamaz', eski: '${dizi([...harita.kokler].sort())}', yeni: '${dizi(harita.kokler)}' },
  { ad: 'serileştirme kayıt dizilerini sıralamaz', eski: 'sade[alan] = [...k[alan]].sort();', yeni: 'sade[alan] = [...k[alan]];' },
  { ad: 'sıkıştırma alt ağaç girdisinin yuttuğu dosyaları silmez', eski: 'okunan = new Set([...okunan].filter((f) => ![...ozy].some((r) => altinda(f, r))));', yeni: '' },
  { ad: 'sıkıştırma dosya eşiğinde dizin eklemek yerine dosyaları DÜŞÜRÜR (daraltır)', eski: 'if (n >= esik.dosyaDizin) dizin.add(d);', yeni: 'if (n >= esik.dosyaDizin) okunan = new Set([...okunan].filter((f) => ustDizin(f) !== d));' },
  { ad: 'sıkıştırma dizin eşiğinde alt ağaç eklemek yerine dizinleri DÜŞÜRÜR (daraltır)', eski: 'ozy.add(adaylar[0]);', yeni: 'dizin = new Set([...dizin].filter((d) => !altinda(d, adaylar[0])));' },
  { ad: 'dizin girdisi torun dosyayı da yutar (doğrudan çocuk sınırı kalkar)', eski: 'okunan = new Set([...okunan].filter((f) => !dizin.has(ustDizin(f))));', yeni: 'okunan = new Set([...okunan].filter((f) => ![...dizin].some((d) => altinda(f, d))));' },
  { ad: 'yorum satırındaki import.meta.glob gerçek çağrı sayılır', eski: 'if (!gercekCagriMi(kaynak, eslesme.index)) continue;', yeni: '' },
  { ad: 'genel tip argümanlı çağrı (glob<string>) görülmez', eski: '(?:<[^>()]*>)?', yeni: '' },
  { ad: 'çıkarılamayan glob argümanı sessiz geçilir', eski: "belirsiz.add(`import.meta.glob argümanı çıkarılamadı (satır ${satir})`);", yeni: '' },
  { ad: 'base seçeneği sessiz geçilir', eski: "belirsiz.add(`import.meta.glob base seçeneği (satır ${satir})`);", yeni: '' },
  { ad: '`**` ile başlayan olumsuz desen çözülemez sayılır', eski: "else if (d.startsWith('**')) cozulen = d;", yeni: '' },
  { ad: 'takma ad (@/) çözülmez', eski: "else if (d.startsWith('@/')) cozulen = `src/${d.slice(2)}`;", yeni: '' },
  { ad: 'ölçülen ?raw okuması desenle kapsanmasa da belirsiz yapılmaz', eski: 'if (glob.desenler.length > 0) belirsiz.add(', yeni: 'if (false) belirsiz.add(' },
  { ad: 'ölçümde kırmızı test belirsiz yapılmaz', eski: 'if (vitestDurumu.basarisiz) belirsiz.add(', yeni: 'if (false) belirsiz.add(' },
  { ad: 'ölçümde atlanan test belirsiz yapılmaz', eski: 'if (vitestDurumu.atlanan > 0) belirsiz.add(', yeni: 'if (false) belirsiz.add(' },
  { ad: 'çocuk süreç okumaları birleştirilmez', eski: 'for (const p of c.okunan) okunan.add(p);', yeni: '' },
  { ad: 'çocuk süreç belirsizleri taşınmaz', eski: 'for (const b of c.belirsiz || []) belirsiz.add(b);', yeni: '' },
  { ad: 'testin kendi yolu okunan listesinden çıkarılmaz', eski: 'p !== testYolu && !yoksayilan.has(p)', yeni: '!yoksayilan.has(p)' },
  { ad: 'izlenmeyen ve ignore kapsamındaki yollar (geçici dosya, pid adlı) okunan listesinden atılmaz', eski: 'p !== testYolu && !yoksayilan.has(p)', yeni: 'p !== testYolu' },
  { ad: 'git check-ignore sonucu ters okunur (izlenen dosya da ignore sayılır)', eski: "['check-ignore', '-z', '--stdin']", yeni: "['check-ignore', '-z', '--no-index', '--stdin']" },
  { ad: 'mutlak yol etikete sızar', eski: "/^node (?:[A-Za-z]:|\\/)/.test(etiket) ? 'node (repo dışı betik)' : etiket", yeni: 'etiket' },
  { ad: 'ham kaydı olmayan test de haritaya girer', eski: 'kayitsiz.push(test);\n      continue;', yeni: 'kayitsiz.push(test);\n      kayitlar[test] = { sha: "x" };\n      continue;' },
  { ad: 'kurulum evresi okumaları küreselleşmez', eski: 'for (const p of [...kurulum.okunan, ...kurulum.dizin, ...kurulum.ozy]) kurulumOkunan.add(p);', yeni: '' },
  { ad: 'kodun glob belirsizliği `**` küreseli eklemez', eski: "kodGlob.belirsiz.length > 0 ? sirali(new Set([...kodGlob.desenler, '**'])) : kodGlob.desenler", yeni: 'kodGlob.desenler' },
  { ad: 'yardımcı modülün kapsanmayan ölçülen okuması küreselleşmez', eski: 'kuresel.add(yol);', yeni: 'void yol;' },
  { ad: 'canonical bayt denetimi kalkar', eski: 'if (serilestir(nesne) !== ham)', yeni: 'if (false)' },
  { ad: 'ölçüm aracı özeti denetimi kalkar', eski: 'if (nesne.arac !== guncel)', yeni: 'if (false)' },
  { ad: 'dağınık dosyalar için alt ağaç eşiği (60 dosya) kalkar', eski: 'o.dosya >= esik.altAgacDosya', yeni: 'false' },
  { ad: 'vitest sonucu olmayan test belirsiz yapılmaz', eski: "ham.vitestDurumlari.size > 0 && !ham.vitestDurumlari.has(test)", yeni: 'false' },
  { ad: 'birden çok vitest sonuç dosyası okunmaz (yalnız vitest.json)', eski: '/^vitest(?:-\\d+)?\\.json$/', yeni: '/^vitest\\.json$/' },
  { ad: 'parti bölmesi parça sayısını bozar (Math.ceil yerine floor)', eski: 'Math.max(1, Math.ceil(liste.length / n))', yeni: 'Math.max(1, Math.floor(liste.length / n))' },
  { ad: 'kısmi sonuç dosyasının atlanması: ölçülen süre kaybolur', eski: 'sn: Math.max(0, (r.endTime - r.startTime) / 1000),', yeni: '' },
]

function sabotajliModul(sabotaj: Sabotaj, dizin: string, sira: number): Uretici {
  const parca = KAYNAK.split(sabotaj.eski)
  if (parca.length !== 2) throw new Error(`sabotaj noktası kaynakta TAM BİR KEZ bulunmalı (${parca.length - 1} kez): ${sabotaj.ad}`)
  const hedef = path.join(dizin, `test-haritasi-uret-sabotaj-${sira}.cjs`)
  // Sabotajlı kopya yanındaki test-sec.cjs'i ister: gerçek dosyaya köprü
  writeFileSync(path.join(dizin, 'test-sec.cjs'), `module.exports = require(${JSON.stringify(path.join(KOK, 'scripts/ci/test-sec.cjs'))})\n`, 'utf8')
  writeFileSync(hedef, parca.join(sabotaj.yeni), 'utf8')
  return createRequire(hedef)(hedef) as Uretici
}

function senaryoHatalari(u: Uretici): string[] {
  const hatalar: string[] = []
  for (const s of SENARYOLAR) {
    try {
      s.kos(u)
    } catch (e) {
      hatalar.push(`${s.ad} → ${e instanceof Error ? e.message.slice(0, 120) : String(e)}`)
    }
  }
  return hatalar
}

describe('INV-TEST-HARITA-1 · 1-5. üretici senaryoları (gerçek modül)', () => {
  it.each(SENARYOLAR.map((s) => [s.ad, s] as const))('%s', (_ad, senaryo) => {
    senaryo.kos(U)
  })
})

describe('INV-TEST-HARITA-1 · 6. DEPODAKİ HARİTA (scripts/ci/test-haritasi.json)', () => {
  const metin = readFileSync(path.join(KOK, U.HARITA_YOLU), 'utf8')
  const harita = JSON.parse(metin) as Harita

  it('seçicinin kabul ettiği biçimde, canonical baytlarla ve GÜNCEL ölçüm aracı özetiyle (bayat harita KIRMIZI)', () => {
    expect(S.haritaSorunu(harita)).toBeNull()
    const k = U.kontrolEt(KOK, [], harita, metin)
    expect(k.sorunlar, `harita bayat ya da bozuk — onarım: node scripts/ci/test-haritasi-uret.cjs\n${k.sorunlar.join('\n')}`).toEqual([])
  })

  it('her kayıt bir test dosyasına ait; yollar köke göreli POSIX, `..`/mutlak/ters bölü/node_modules içermez; diziler tekil', () => {
    const kotu: string[] = []
    for (const [test, k] of Object.entries(harita.testler)) {
      if (!S.TEST_DESENI.test(test)) kotu.push(`test adı test dosyası değil: ${test}`)
      for (const alan of ['okunan', 'dizin', 'ozy'] as const) {
        const liste = k[alan] ?? []
        if (new Set(liste).size !== liste.length) kotu.push(`${test}.${alan} yinelenen girdi`)
        for (const p of liste) {
          // `.` yalnız DİZİN girdilerinde geçerli ve deponun KÖK listesi demektir (`readdirSync('.')`).
          if (alan !== 'okunan' && p === '.') continue
          if (p.startsWith('/') || p.startsWith('..') || p.includes('\\') || /^[A-Za-z]:/.test(p) || p.split('/').some((b) => b === '' || b === '.' || b === '..' || b === 'node_modules')) kotu.push(`${test}.${alan}: ${p}`)
        }
      }
    }
    expect(kotu).toEqual([])
  })

  it('ÖZGÜN TUTARLILIK: haritadaki her okuma, seçicinin indeksiyle o testi GERİ BULUR (dizin için doğrudan çocuk, alt ağaç için torun)', () => {
    const indeks = S.indeksKur(harita)
    const kayip: string[] = []
    for (const [test, k] of Object.entries(harita.testler)) {
      const dene = (yol: string, tur: string) => {
        if (!S.haritaEslesmeleri(indeks, yol).has(test)) kayip.push(`${test} ← ${tur} ${yol}`)
      }
      for (const p of k.okunan ?? []) dene(p, 'okunan')
      for (const d of k.dizin ?? []) dene(`${d === '.' ? '' : `${d}/`}yeni-dosya.txt`, 'dizin')
      for (const r of k.ozy ?? []) dene(`${r === '.' ? '' : `${r}/`}derin/yeni/dosya.txt`, 'alt ağaç')
    }
    expect(kayip.slice(0, 5)).toEqual([])
  })

  it('ölçüm kipi PR kapısının kipidir (dislan), sürüm seçicininkiyle aynı, kayıt sayısı kesilmiş bir haritayı yakalayacak kadar yüksek', () => {
    expect(harita.surum).toBe(S.HARITA_SURUMU)
    expect(harita.uretim.kip).toBe('dislan')
    // Conformance tek başına 330'dan fazla dosya: bu tabanın altı `--yalniz` ile kazara ezilmiş ya da kesilmiş bir haritadır.
    expect(Object.keys(harita.testler).length).toBeGreaterThan(300)
  })

  it('`kokler` depodaki üst düzey adları taşır (bilinmeyen kök → tam kuralının dayanağı) ve tekildir', () => {
    expect(new Set(harita.kokler).size).toBe(harita.kokler.length)
    for (const beklenen of ['src', 'docs', 'scripts', 'supabase', '.github', 'package.json']) expect(harita.kokler, `${beklenen} kök listesinde olmalı`).toContain(beklenen)
  })
})

describe('INV-TEST-HARITA-1 · 7. sabotaj: üretici kaynağına konan her tek hata en az bir senaryoyu KIRMIZIYA çevirir', () => {
  const dizin = mkdtempSync(path.join(tmpdir(), 'test-haritasi-sabotaj-'))
  it.each(SABOTAJLAR.map((s, i) => [s.ad, s, i] as const))('%s', (_ad, sabotaj, sira) => {
    const kopya = sabotajliModul(sabotaj, dizin, sira)
    const hatalar = senaryoHatalari(kopya)
    expect(hatalar.length, `sabotaj HİÇBİR senaryoyu kırmızıya çevirmedi: "${sabotaj.ad}" — bu karar testle korunmuyor`).toBeGreaterThan(0)
  })
})
