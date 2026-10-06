import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-TEST-KARNE-2 · CI geçmişi toplayıcısının ayıklayıcısı (scripts/test-karnesi/ci-gecmis.cjs).
 *
 * İKİ GERÇEK KUSUR bu testin doğum sebebi (ALT-38, 2026-10-06 ölçüldü):
 *   1. GitHub günlüğünde renk kodu gerçek ESC değil, iki karakterlik "^[" METNİ olarak geliyor (karakter kodları 94,91,91).
 *      Yalnız ESC'yi soyan ilk sürüm 182 kırmızı koşuda 0 test dosyası buldu: karne "hiç kırmızı yok" derdi (sessiz yanlış).
 *   2. `status=failure&page=N` sayfalaması kararsız (400 satırın 320'si benzersiz, son üç haftanın kırmızıları eksik):
 *      `created=` pencereleri `total_count` ile doğrulanır.
 *
 * SERTLEŞTİRME (ALT-38, sabotaj yoklaması): ilk sürüm sekiz gerçekçi bozulmayı GEÇİRDİ (test yeşil, kod bozuk):
 * renk kodunda ";", ad tekilleştirme, çok haneli sayı, --pencere-gun doğrulaması, --is-akisi bağı, total_count uyarısı,
 * sayfalama ve kırmızı koşuda günlük çekimi. Son üçü `gh` çağrısı olduğu için HİÇ sınanmıyordu. Artık `gh` ENJEKTE edilir
 * (sahte GitHub: ağ yok, gerçek `gh` yok, gerçek ev dizini yok) ve ÇAĞRININ kendisi (URL, sayfa, bayrak) assert edilir.
 * Bir kapının sessizce atlanabilmesi en ağır hatadır: bozulmanın yalnız örneği değil TÜRÜ kapatıldı (tüm bayraklar tablosu,
 * sayfa sınırı tablosu, çok haneli/çok parametreli girdiler, her uyarının tam metni).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')

type GhSecenek = { json?: boolean }
/** `gh`'nin ve üretimdeki `ghDene`nin imzası: (args, secenek) → JSON nesnesi (json:true) ya da çıktı metni. */
type GhCagri = (args: string[], secenek?: GhSecenek) => Promise<unknown>
type SurecHatasi = Error & { code?: number | string }
type ExecGeriCagri = (err: SurecHatasi | null, stdout: string, stderr: string) => void
/** `child_process.execFile` biçimi (yalnız `gh` sarmalayıcısının kullandığı kısım): gerçek süreç yerine enjekte edilir. */
type SahteExec = (komut: string, args: string[], secenek: Record<string, unknown>, geriCagri: ExecGeriCagri) => void

/** GitHub `workflow_runs` satırı (yalnız toplayıcının okuduğu alanlar). */
type HamKosu = {
  id: number
  event?: string
  head_branch?: string
  head_sha?: string
  created_at: string
  run_started_at?: string | null
  updated_at?: string | null
  conclusion?: string | null
  status?: string | null
  run_attempt?: number
  pull_requests?: Array<{ number: number }>
  display_title?: string
}
type TestDosyasi = { dosya: string; adlar: string[] }
type KosuKaydi = {
  kosuId: number
  olay?: string
  dal?: string
  sha?: string
  olusturma: string
  baslama: string | null
  guncelleme: string | null
  sonuc: string | null
  deneme: number
  pr: number | null
  baslik: string
}
type ZenginKayit = KosuKaydi & {
  basarisizAdimlar?: string[]
  testDosyalari?: TestDosyasi[]
  basarisizDosyaSayisi?: number
  testAdimiSuresiSn?: number | null
  isBilgisiAlinamadi?: string
  logAlinamadi?: boolean
  logHatasi?: string
}
type Cikti = {
  repo: string
  isAkisi: string
  alinma: string
  pencere: { baslangic: string; bitis: string; gun: number }
  uyarilar: string[]
  kosular: ZenginKayit[]
}

const C = require_(path.join(KOK, 'scripts/test-karnesi/ci-gecmis.cjs')) as {
  ansiSoy: (s: string) => string
  basarisizTestleriAyikla: (metin: string) => TestDosyasi[]
  basarisizDosyaSayisiOku: (metin: string) => number | null
  pencereler: (b: string, e: string, gun: number) => Array<[string, string]>
  testAdimiSuresi: (isler: unknown) => number | null
  argumanlar: (argv: string[], bugun?: Date) => Record<string, unknown>
  kosuKaydi: (r: HamKosu) => KosuKaydi
  pencereyiCek: (
    repo: string,
    isAkisi: string,
    pencere: [string, string],
    ghCagri?: GhCagri,
  ) => Promise<{ kosular: KosuKaydi[]; toplam: number | null; pencere: string }>
  kirmiziKosuyuIsle: (repo: string, k: KosuKaydi, ghCagri?: GhCagri) => Promise<ZenginKayit>
  basariliKosuSuresi: (repo: string, k: KosuKaydi, ghCagri?: GhCagri) => Promise<ZenginKayit>
  havuz: <T, R>(isler: T[], es: number, fn: (is: T, i: number) => Promise<R>) => Promise<R[]>
  gh: (args: string[], secenek?: GhSecenek, execFileFn?: SahteExec) => Promise<unknown>
  ghDene: (args: string[], secenek?: GhSecenek, deneme?: number, ghFn?: GhCagri) => Promise<unknown>
  main: (argv?: string[], baglam?: { gh?: GhCagri }) => Promise<void>
}

const ONEK = 'ci\tUNKNOWN STEP\t2026-10-05T11:30:22.0256000Z '

// ── Sahte GitHub ─────────────────────────────────────────────────────────────────────────────────────────────────────
// `gh` bu testlerde ENJEKTE edilir: ağ yok, gerçek `gh` yok. Sahte her çağrıyı kaydeder; testler ÇAĞRININ argümanını
// (URL, sayfa, bayrak) assert eder. Bilinmeyen çağrı "HTTP 404" ile düşer: `ghDene` kalıcı 4xx'te beklemeden bırakır
// (yoksa yeniden deneme beklemesi testi saniyelerce uyutur).

type Cagri = { args: string[]; secenek?: GhSecenek }
type Senaryo = {
  /** "<baslangic>..<bitis>" → o pencerede sunucunun SIRAYLA döndüğü satırlar (yinelenen satır olabilir: GitHub kararsızlığı) */
  pencereler: Record<string, { toplam?: number; satirlar: HamKosu[] }>
  /** kosuId → `/jobs` yanıtı ya da hata */
  isler?: Record<number, unknown>
  /** kosuId → `--log-failed` çıktısı ya da hata */
  gunlukler?: Record<number, string | Error>
  /** `gh repo view` çıktısı (satır sonu dahil gelir, ana akış kırpar) */
  repoAdi?: string
  /** `/jobs` yanıtına eklenen gecikme (eşzamanlılık sınırını ölçmek için) */
  isGecikmeMs?: number
}

const PENCERE_URL = /^repos\/([^/]+\/[^/]+)\/actions\/workflows\/([^/]+)\/runs\?created=(\S+?)&per_page=(\d+)&page=(\d+)$/
const ISLER_URL = /^repos\/[^/]+\/[^/]+\/actions\/runs\/(\d+)\/jobs\?per_page=30$/

function sahteGitHub(s: Senaryo): { gh: GhCagri; cagrilar: Cagri[]; enFazlaEszamanliIs: () => number } {
  const cagrilar: Cagri[] = []
  let aktifIs = 0
  let enFazlaIs = 0
  const yok = (ne: string) => new Error(`sahte gh: HTTP 404 ${ne}`)
  const gh: GhCagri = async (args, secenek) => {
    cagrilar.push({ args: [...args], secenek })
    if (args[0] === 'repo' && args[1] === 'view') return `${s.repoAdi ?? 'sahip/depo'}\n`
    if (args[0] === 'api') {
      const p = PENCERE_URL.exec(args[1])
      if (p) {
        const veri = s.pencereler[p[3]]
        if (!veri) throw yok(`pencere yok: ${p[3]}`)
        const boy = Number(p[4])
        const sayfa = Number(p[5])
        return {
          total_count: veri.toplam ?? veri.satirlar.length,
          workflow_runs: veri.satirlar.slice((sayfa - 1) * boy, sayfa * boy),
        }
      }
      const j = ISLER_URL.exec(args[1])
      if (j) {
        aktifIs += 1
        enFazlaIs = Math.max(enFazlaIs, aktifIs)
        try {
          if (s.isGecikmeMs) await new Promise<void>((coz) => setTimeout(coz, s.isGecikmeMs))
        } finally {
          aktifIs -= 1
        }
        const yanit = s.isler?.[Number(j[1])]
        if (yanit === undefined) throw yok(`jobs yok: ${j[1]}`)
        if (yanit instanceof Error) throw yanit
        return yanit
      }
    }
    if (args[0] === 'run' && args[1] === 'view') {
      const gunluk = s.gunlukler?.[Number(args[2])]
      if (gunluk === undefined) throw yok(`günlük yok: ${args[2]}`)
      if (gunluk instanceof Error) throw gunluk
      return gunluk
    }
    throw yok(`beklenmeyen çağrı: ${args.join(' ')}`)
  }
  return { gh, cagrilar, enFazlaEszamanliIs: () => enFazlaIs }
}

function hamKosu(id: number, olusturma: string, sonuc: string | null, ek: Partial<HamKosu> = {}): HamKosu {
  return {
    id,
    event: 'push',
    head_branch: 'master',
    head_sha: `sha-${id}`,
    created_at: olusturma,
    run_started_at: olusturma,
    updated_at: olusturma,
    conclusion: sonuc,
    status: 'completed',
    run_attempt: 1,
    pull_requests: [],
    display_title: `koşu ${id}`,
    ...ek,
  }
}

/** `n` tane "iptal" koşu (iş çağrısı gerektirmez): sayfalama ve uyarı testleri için. */
function iptalKosular(n: number, ilkId: number): HamKosu[] {
  return Array.from({ length: n }, (_, i) => hamKosu(ilkId + i, '2026-10-02T10:00:00Z', 'cancelled'))
}

/** Tek işli `/jobs` yanıtı. Adım: [ad, sonuç, süre sn]; süre null ise zaman damgası yok (atlanan adım). */
function isYaniti(adimlar: Array<[string, string, number | null]>, isSonucu = 'failure'): { jobs: unknown[] } {
  const bas = Date.parse('2026-10-05T11:00:00Z')
  return {
    jobs: [
      {
        conclusion: isSonucu,
        steps: adimlar.map(([name, conclusion, sn]) =>
          sn === null
            ? { name, conclusion }
            : { name, conclusion, started_at: new Date(bas).toISOString(), completed_at: new Date(bas + sn * 1000).toISOString() },
        ),
      },
    ],
  }
}

/** Gerçek günlük biçimi: "^[" renk metni, aynı FAIL satırı iki kez (canlı akış + özet), paket düzeyi hata, "Test Files 12 failed". */
const GUNLUK_KIRMIZI = [
  `${ONEK}^[[41m^[[1m FAIL ^[[22m^[[49m src/a/x.test.ts^[[2m > ^[[22mgrup^[[2m > ^[[22mdurum bir`,
  `${ONEK}     ^[[33m^[[2m✓^[[22m^[[39m FAIL-CLOSED: geçen test kırmızı sayılmaz ^[[33m 12^[[2mms^[[22m^[[39m`,
  `${ONEK}^[[41m^[[1m FAIL ^[[22m^[[49m src/a/x.test.ts^[[2m > ^[[22mgrup^[[2m > ^[[22mdurum bir`,
  `${ONEK}^[[41m^[[1m FAIL ^[[22m^[[49m src/b/y.test.ts [ src/b/y.test.ts ]`,
  `${ONEK} ^[[2m Test Files ^[[22m ^[[1m^[[31m12 failed^[[39m^[[22m^[[2m | ^[[22m^[[1m^[[32m588 passed^[[39m^[[22m^[[90m (600)^[[39m`,
].join('\n')
const GUNLUK_BEKLENEN: TestDosyasi[] = [
  { dosya: 'src/a/x.test.ts', adlar: ['grup > durum bir'] },
  { dosya: 'src/b/y.test.ts', adlar: [] },
]

describe('ansiSoy — iki renk biçimi', () => {
  it('gerçek ESC dizisini soyar', () => {
    expect(C.ansiSoy('\u001b[41m\u001b[1m FAIL \u001b[22m\u001b[49m x')).toBe(' FAIL  x')
  })
  it('günlükteki "^[" METİN biçimini soyar (ESC olmadan)', () => {
    expect(C.ansiSoy('^[[41m^[[1m FAIL ^[[22m^[[49m x')).toBe(' FAIL  x')
  })
  it('renk kodu OLMAYAN köşeli parantezlere dokunmaz', () => {
    expect(C.ansiSoy('dizi[0] ve ^x [a] "[[ok]]"')).toBe('dizi[0] ve ^x [a] "[[ok]]"')
  })

  // SERTLEŞTİRME: ";" içeren çok parametreli kodlar. `[0-9;]*m` yerine `[0-9]*m` gibi dar bir desen yalnız tek
  // parametreli kodu soyardı; 256 renkli çıktıda test adları renk artığıyla kirlenir, karne sessizce yanlış olurdu.
  it.each<[string, string]>([
    ['tek parametre', '[31m'],
    ['256 renk (38;5;196)', '[38;5;196m'],
    ['gerçek renk (38;2;255;100;0)', '[38;2;255;100;0m'],
    ['birleşik öznitelik (1;31;4)', '[1;31;4m'],
    ['parametresiz sıfırlama', '[m'],
  ])('renk kodu soyulur: %s (ESC biçimi ve "^[" metin biçimi)', (_ad, kod) => {
    expect(C.ansiSoy(`a\u001b${kod}b`)).toBe('ab')
    expect(C.ansiSoy(`a^[${kod}b`)).toBe('ab')
  })
  it('aynı satırda ESC ve "^[" biçimi KARIŞIK, çok parametreli kodlarla da tamamen temizlenir', () => {
    expect(C.ansiSoy('\u001b[38;5;196mkırmızı\u001b[0m ^[[1;4mkalın^[[0m ^[[38;2;1;2;3mx^[[m')).toBe('kırmızı kalın x')
  })
  // Önek (ESC ya da "^[") ŞARTTIR: isteğe bağlı olsaydı düz metindeki "[31m" gibi parçalar da silinir, test adları bozulurdu.
  it('önek (ESC ya da "^[") OLMAYAN "[31m" benzeri düz metne dokunmaz; ESC tek başına ya da "^" tek başına da kalır', () => {
    const duz = 'dizi[31m ve [0;1m ve ^x[2m ve \u001bX ve ^[x'
    expect(C.ansiSoy(duz)).toBe(duz)
  })
})

describe('basarisizTestleriAyikla', () => {
  const gercek =
    `${ONEK}^[[41m^[[1m FAIL ^[[22m^[[49m src/__tests__/conformance/taban-tazeligi.test.ts^[[2m > ^[[22mINV-TABAN-TAZE-1 · sema tabani^[[2m > ^[[22mTAZELIK: eski\n` +
    `${ONEK}     ^[[33m^[[2m✓^[[22m^[[39m FAIL-CLOSED: TABAN_TAZELE_BUILD_CMD gecersizse SESSIZCE yok sayilmaz ^[[33m 437^[[2mms^[[22m^[[39m\n`
  const fail = (dosya: string, ad?: string) => `${ONEK} FAIL  ${dosya}${ad === undefined ? '' : ` > ${ad}`}\n`

  it('GERÇEK günlük biçimini ("^[" renkli) çözer: dosya + ad', () => {
    expect(C.basarisizTestleriAyikla(gercek)).toEqual([
      {
        dosya: 'src/__tests__/conformance/taban-tazeligi.test.ts',
        adlar: ['INV-TABAN-TAZE-1 · sema tabani > TAZELIK: eski'],
      },
    ])
  })

  it('FAIL-CLOSED gibi içinde FAIL geçen GEÇEN test adlarını kırmızı SAYMAZ', () => {
    const r = C.basarisizTestleriAyikla(`${ONEK} ✓ FAIL-CLOSED: agac KIRLIYSE hic baslamaz\n`)
    expect(r).toEqual([])
  })

  it('paket düzeyi hata (` FAIL  x.test.ts [ x.test.ts ]`) dosyayı yakalar', () => {
    const r = C.basarisizTestleriAyikla(`${ONEK} FAIL  src/a/b.test.ts [ src/a/b.test.ts ]\n`)
    expect(r.map((x) => x.dosya)).toEqual(['src/a/b.test.ts'])
  })

  it('gerçek ESC renkli günlüğü de çözer, CRLF satır sonu da', () => {
    const r = C.basarisizTestleriAyikla(`${ONEK}\u001b[41m FAIL \u001b[49m tests/e2e/x.test.ts > a > b\r\n`)
    expect(r).toEqual([{ dosya: 'tests/e2e/x.test.ts', adlar: ['a > b'] }])
  })

  it('aynı dosyanın ad listesi en çok 8 ad ve tekrarsız', () => {
    const satirlar = Array.from({ length: 12 }, (_, i) => `${ONEK} FAIL  src/x.test.ts > t${i % 10}\n`).join('')
    const r = C.basarisizTestleriAyikla(satirlar)
    expect(r).toHaveLength(1)
    expect(r[0].adlar.length).toBe(8)
    // SERTLEŞTİRME: yalnız uzunluk değil İÇERİK: ilk 8 TEKİL ad, ilk görülme sırasıyla (t0 ve t1 ikinci kez geldi, sayılmadı).
    expect(r[0].adlar).toEqual(['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'])
  })

  it('SABOTAJ: ESC-yalnız ayıklayıcı (eski kusur) gerçek günlükte 0 bulurdu', () => {
    const eskiAnsi = /\u001b\[[0-9;]*m/g
    const eskiAyiklayici = (metin: string) =>
      metin.split('\n').filter((s) => /\bFAIL\s+(\S+?\.(?:test|spec)\.[a-z]+)/.test(s.replace(eskiAnsi, ''))).length
    expect(eskiAyiklayici(gercek)).toBe(0)
    expect(C.basarisizTestleriAyikla(gercek).length).toBe(1)
  })

  // ── SERTLEŞTİRME ─────────────────────────────────────────────────────────────────────────────────────────────────
  it('çok parametreli renk kodu (38;5;196) test ADINI bozmaz: ad temiz çıkar', () => {
    const satir = `${ONEK}^[[38;5;196m FAIL ^[[39m src/c.test.ts^[[2m > ^[[22m^[[38;5;196mkırmızı ad^[[39m\n`
    expect(C.basarisizTestleriAyikla(satir)).toEqual([{ dosya: 'src/c.test.ts', adlar: ['kırmızı ad'] }])
  })

  it('aynı test adı günlükte birden çok kez geçerse BİR kez sayılır (ilk görülme sırası korunur)', () => {
    const r = C.basarisizTestleriAyikla(['a', 'a', 'b', 'a', 'b', 'c'].map((ad) => fail('src/x.test.ts', ad)).join(''))
    expect(r).toEqual([{ dosya: 'src/x.test.ts', adlar: ['a', 'b', 'c'] }])
  })

  it('tekrarlar 8 ad sınırını YEMEZ: sınır TEKİL adlara uygulanır', () => {
    const adlar = ['yinelenen', 'yinelenen', 'yinelenen', 'yinelenen', 'yinelenen', ...Array.from({ length: 9 }, (_, i) => `n${i + 1}`)]
    const r = C.basarisizTestleriAyikla(adlar.map((ad) => fail('src/x.test.ts', ad)).join(''))
    expect(r).toEqual([{ dosya: 'src/x.test.ts', adlar: ['yinelenen', 'n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7'] }])
  })

  it('aynı ad iki AYRI dosyada AYRI sayılır (tekilleştirme dosya başınadır) ve dosyalar giriş sırasıyla döner', () => {
    const r = C.basarisizTestleriAyikla(
      fail('src/b.test.ts', 'ortak ad') + fail('src/a.test.ts', 'ortak ad') + fail('src/b.test.ts', 'ortak ad') + fail('src/a.test.ts', 'ikinci'),
    )
    expect(r).toEqual([
      { dosya: 'src/b.test.ts', adlar: ['ortak ad'] },
      { dosya: 'src/a.test.ts', adlar: ['ortak ad', 'ikinci'] },
    ])
  })

  it('ad 200 karaktere kırpılır (199 ve 200 olduğu gibi kalır, 201 kırpılır) ve baştaki/sondaki boşluk atılır', () => {
    const a199 = 'a'.repeat(199)
    const a200 = 'b'.repeat(200)
    const a201 = 'c'.repeat(201)
    const r = C.basarisizTestleriAyikla([a199, a200, a201].map((ad) => fail('src/u.test.ts', `${ad}  `)).join(''))
    expect(r[0].adlar).toEqual([a199, a200, 'c'.repeat(200)])
  })

  it.each<[string]>([['src/a.spec.ts'], ['src/b.test.tsx'], ['scripts/c.test.cjs'], ['tests/d.spec.mjs']])(
    '%s: .test/.spec dosya türleri yakalanır',
    (dosya) => {
      expect(C.basarisizTestleriAyikla(fail(dosya, 'x'))).toEqual([{ dosya, adlar: ['x'] }])
    },
  )

  it('test dosyası OLMAYAN yol ve FAIL ile başlayan başka sözcük (FAILED) yok sayılır', () => {
    const metin = fail('src/lib/util.ts', 'x') + `${ONEK} FAILED  src/a.test.ts > y\n` + `${ONEK} Error: FAIL src/lib/z.ts\n`
    expect(C.basarisizTestleriAyikla(metin)).toEqual([])
  })

  // Sözcük sınırı: "FAIL" başka bir sözcüğün parçasıysa (XFAIL, TEST_FAIL) kırmızı sayılmamalı; yoksa geçen/atlanan işaretler
  // karnede "kırık test dosyası" olur (sessiz yanlış pozitif).
  it('FAIL başka bir sözcüğün PARÇASIYSA (XFAIL, TEST_FAIL) kırmızı sayılmaz; yalnız bağımsız FAIL sayılır', () => {
    const metin = `${ONEK} XFAIL  src/a.test.ts > x\n` + `${ONEK} TEST_FAIL  src/b.test.ts > y\n` + fail('src/ok.test.ts', 'z')
    expect(C.basarisizTestleriAyikla(metin)).toEqual([{ dosya: 'src/ok.test.ts', adlar: ['z'] }])
  })

  it('paket düzeyi hatada dosya AD OLMADAN listelenir', () => {
    const r = C.basarisizTestleriAyikla(`${ONEK} FAIL  src/a/b.test.ts [ src/a/b.test.ts ]\n`)
    expect(r).toEqual([{ dosya: 'src/a/b.test.ts', adlar: [] }])
  })
})

describe('basarisizDosyaSayisiOku', () => {
  it('"Test Files  1 failed | 597 passed" satırından sayıyı okur', () => {
    expect(C.basarisizDosyaSayisiOku('^[[2m Test Files ^[[22m ^[[1m^[[31m3 failed^[[39m^[[22m^[[2m | ^[[22m 597 passed')).toBe(3)
    expect(C.basarisizDosyaSayisiOku('Test Files  600 passed (600)')).toBeNull()
  })

  // SERTLEŞTİRME: çok haneli sayılar. `(\d)` tek haneyi okur; 10+ başarısız dosya "null" (= ölçülmedi) görünürdü:
  // en kötü günün (en çok kırılan koşunun) verisi karneden sessizce düşerdi.
  it.each<[string, number]>([
    ['Test Files  1 failed | 597 passed (598)', 1],
    ['Test Files  9 failed | 589 passed (598)', 9],
    ['Test Files  10 failed | 588 passed (598)', 10],
    ['Test Files  12 failed | 588 passed (600)', 12],
    ['Test Files  100 failed | 500 passed (600)', 100],
    ['^[[2m Test Files ^[[22m ^[[1m^[[31m12 failed^[[39m^[[22m^[[2m | ^[[22m 588 passed', 12],
    ['\u001b[2m Test Files \u001b[22m \u001b[1m\u001b[31m38 failed\u001b[39m', 38],
  ])('%j → %i', (metin, beklenen) => {
    expect(C.basarisizDosyaSayisiOku(metin)).toBe(beklenen)
  })

  it('başarısız DOSYA yoksa null: yalnız "passed", yalnız "Tests" (test sayısı) satırı ya da boş metin', () => {
    expect(C.basarisizDosyaSayisiOku('Test Files  598 passed (598)')).toBeNull()
    expect(C.basarisizDosyaSayisiOku('      Tests  7 failed | 100 passed (107)')).toBeNull()
    expect(C.basarisizDosyaSayisiOku('')).toBeNull()
  })

  it('"Test Files" ile "Tests" satırı birlikteyse DOSYA sayısını okur, test sayısını değil', () => {
    const metin = ' Test Files  2 failed | 8 passed (10)\n      Tests  15 failed | 90 passed (105)\n'
    expect(C.basarisizDosyaSayisiOku(metin)).toBe(2)
  })
})

describe('pencereler — created= pencereleri', () => {
  it('kapalı aralıklara böler, çakışmaz, boşluk bırakmaz', () => {
    const p = C.pencereler('2026-10-01', '2026-10-16', 7)
    expect(p).toEqual([
      ['2026-10-01', '2026-10-07'],
      ['2026-10-08', '2026-10-14'],
      ['2026-10-15', '2026-10-16'],
    ])
  })
  it('tek günlük aralık', () => {
    expect(C.pencereler('2026-10-06', '2026-10-06', 7)).toEqual([['2026-10-06', '2026-10-06']])
  })
  it('KAPSAM: her gün tam bir pencerede (92 günlük aralık)', () => {
    const p = C.pencereler('2026-07-06', '2026-10-06', 7)
    const gunler = new Set<string>()
    for (const [b, e] of p) {
      for (let t = Date.parse(b); t <= Date.parse(e); t += 86400000) {
        const g = new Date(t).toISOString().slice(0, 10)
        expect(gunler.has(g), `${g} iki pencerede`).toBe(false)
        gunler.add(g)
      }
    }
    expect(gunler.size).toBe(93)
  })
  it('SERTLEŞTİRME: 1 günlük pencere (--pencere-gun 1) her günü ayrı pencere yapar; başlangıç bitişten sonraysa pencere yok', () => {
    expect(C.pencereler('2026-10-01', '2026-10-03', 1)).toEqual([
      ['2026-10-01', '2026-10-01'],
      ['2026-10-02', '2026-10-02'],
      ['2026-10-03', '2026-10-03'],
    ])
    expect(C.pencereler('2026-10-07', '2026-10-01', 7)).toEqual([])
  })
})

describe('testAdimiSuresi ve argumanlar', () => {
  it('Test adımının süresini saniye olarak okur; yoksa null', () => {
    const isler = { jobs: [{ steps: [{ name: 'Lint', started_at: '2026-10-06T08:00:00Z', completed_at: '2026-10-06T08:00:10Z' }, { name: 'Test', started_at: '2026-10-06T08:01:00Z', completed_at: '2026-10-06T08:04:10Z' }] }] }
    expect(C.testAdimiSuresi(isler)).toBe(190)
    expect(C.testAdimiSuresi({ jobs: [{ steps: [{ name: 'Test' }] }] })).toBeNull()
    expect(C.testAdimiSuresi(null)).toBeNull()
  })
  it('varsayılan pencere 92 gün geriden yarına; bilinmeyen bayrak fırlatır', () => {
    const a = C.argumanlar(['--cikti', 'x.json'], new Date('2026-10-06T10:00:00Z'))
    expect(a.baslangic).toBe('2026-07-06')
    expect(a.bitis).toBe('2026-10-07')
    expect(() => C.argumanlar(['--cikti', 'x', '--yok'])).toThrow(/bilinmeyen bayrak/)
    expect(() => C.argumanlar([])).toThrow(/--cikti gerekli/)
  })

  // ── SERTLEŞTİRME: testAdimiSuresi ────────────────────────────────────────────────────────────────────────────────
  it('testAdimiSuresi: ad büyük/küçük harf ve boşluk fark etmez; bitmemiş adım atlanır, sonraki işe bakılır; saniye YUVARLANIR', () => {
    const isler = {
      jobs: [
        { steps: [{ name: 'Test', started_at: '2026-10-06T08:00:00Z' }] },
        { steps: [{ name: ' test ', started_at: '2026-10-06T08:00:00.000Z', completed_at: '2026-10-06T08:00:30.499Z' }] },
      ],
    }
    expect(C.testAdimiSuresi(isler)).toBe(30)
    const yarim = { jobs: [{ steps: [{ name: 'TEST', started_at: '2026-10-06T08:00:00.000Z', completed_at: '2026-10-06T08:00:01.500Z' }] }] }
    expect(C.testAdimiSuresi(yarim)).toBe(2)
    expect(C.testAdimiSuresi({ jobs: [{ steps: [{ name: 'Test files', started_at: '2026-10-06T08:00:00Z', completed_at: '2026-10-06T08:00:09Z' }] }] })).toBeNull()
  })
})

// ── SERTLEŞTİRME: bayrak tablosu ───────────────────────────────────────────────────────────────────────────────────────
// Her bayrak YALNIZ kendi alanını değiştirir. `--is-akisi` değerinin `repo` alanına yazılması gibi "yanlış alan" bozulması,
// tek tek bayrak + tam nesne eşitliğiyle (toEqual) her bayrak için yakalanır; ana akışta da URL'den yakalanır (main bloğu).
describe('argumanlar — bayrak tablosu ve doğrulama', () => {
  const BUGUN = new Date('2026-10-06T10:00:00Z')
  const VARSAYILAN = {
    cikti: 'x.json',
    baslangic: '2026-07-06',
    bitis: '2026-10-07',
    pencereGun: 7,
    es: 5,
    isAkisi: 'ci.yml',
    repo: null,
    sureOrnek: 30,
  }

  it('isteğe bağlı bayrak yoksa TÜM varsayılanlar (tam nesne eşitliği)', () => {
    expect(C.argumanlar(['--cikti', 'x.json'], BUGUN)).toEqual(VARSAYILAN)
  })

  it.each<[string, string, Record<string, unknown>]>([
    ['--cikti', 'C:/tmp/a b/çıktı.json', { cikti: 'C:/tmp/a b/çıktı.json' }],
    ['--baslangic', '2026-01-02', { baslangic: '2026-01-02' }],
    ['--bitis', '2026-02-03', { bitis: '2026-02-03' }],
    ['--pencere-gun', '3', { pencereGun: 3 }],
    ['--es', '2', { es: 2 }],
    ['--is-akisi', 'deploy.yml', { isAkisi: 'deploy.yml' }],
    ['--repo', 'sahip/depo', { repo: 'sahip/depo' }],
    ['--sure-ornek', '10', { sureOrnek: 10 }],
  ])('%s %s: YALNIZ kendi alanını değiştirir, başka alana yazılmaz', (bayrak, deger, degisen) => {
    const beklenen = { ...VARSAYILAN, ...degisen }
    const girdi = bayrak === '--cikti' ? ['--cikti', deger] : ['--cikti', 'x.json', bayrak, deger]
    expect(C.argumanlar(girdi, BUGUN)).toEqual(beklenen)
  })

  it('tüm bayraklar birlikte, ters sırada da doğru alanlara yazılır', () => {
    const girdi = ['--sure-ornek', '4', '--repo', 'o/r', '--is-akisi', 'deploy.yml', '--es', '2', '--pencere-gun', '3', '--bitis', '2026-02-03', '--baslangic', '2026-01-02', '--cikti', 'son.json']
    expect(C.argumanlar(girdi, BUGUN)).toEqual({
      cikti: 'son.json',
      baslangic: '2026-01-02',
      bitis: '2026-02-03',
      pencereGun: 3,
      es: 2,
      isAkisi: 'deploy.yml',
      repo: 'o/r',
      sureOrnek: 4,
    })
  })

  // `--pencere-gun 0` doğrulamasız `pencereler()`i ilerlemeyen döngüye sokardı (bellek dolana dek): doğrulama TEK koruma.
  it.each<[string]>([['0'], ['-3'], ['abc'], [''], ['0.5']])('--pencere-gun %j geçersizdir: fırlatır', (deger) => {
    expect(() => C.argumanlar(['--cikti', 'x', '--pencere-gun', deger], BUGUN)).toThrow('--pencere-gun >= 1 olmalı')
  })
  it('--pencere-gun 1 sınırında KABUL edilir', () => {
    expect(C.argumanlar(['--cikti', 'x', '--pencere-gun', '1'], BUGUN).pencereGun).toBe(1)
  })

  it('hata metinleri tam: bilinmeyen bayrak adı ve eksik --cikti', () => {
    expect(() => C.argumanlar(['--cikti', 'x', '--yok'], BUGUN)).toThrow('bilinmeyen bayrak: --yok')
    expect(() => C.argumanlar(['--es', '2'], BUGUN)).toThrow('--cikti gerekli')
  })
})

describe('kosuKaydi — GitHub satırı → karne kaydı', () => {
  const tam: HamKosu = {
    id: 77,
    event: 'pull_request',
    head_branch: 'altyapi/x',
    head_sha: 'abc123',
    created_at: '2026-10-05T11:00:00Z',
    run_started_at: '2026-10-05T11:00:05Z',
    updated_at: '2026-10-05T11:09:00Z',
    conclusion: 'failure',
    status: 'completed',
    run_attempt: 2,
    pull_requests: [{ number: 1701 }, { number: 9 }],
    display_title: 'ALTYAPI (ALT-38): başlık',
  }

  it('her alanı doğru yere eşler (tam nesne eşitliği)', () => {
    expect(C.kosuKaydi(tam)).toEqual({
      kosuId: 77,
      olay: 'pull_request',
      dal: 'altyapi/x',
      sha: 'abc123',
      olusturma: '2026-10-05T11:00:00Z',
      baslama: '2026-10-05T11:00:05Z',
      guncelleme: '2026-10-05T11:09:00Z',
      sonuc: 'failure',
      deneme: 2,
      pr: 1701,
      baslik: 'ALTYAPI (ALT-38): başlık',
    })
  })

  // Karne "kırmızı" kaydını `sonuc === 'failure'` ile seçer: bitmiş koşuda `status` ("completed") `conclusion`ı ezerse
  // HİÇ kırmızı koşu kalmaz ve karne "hiç kırmızı yok" der (ilk kusurun ikizi: sessiz yanlış).
  it('sonuç: bitmiş koşuda conclusion (status "completed" onu EZMEZ); sürüyorsa status; ikisi de yoksa null', () => {
    expect(C.kosuKaydi({ ...tam, conclusion: 'success', status: 'completed' }).sonuc).toBe('success')
    expect(C.kosuKaydi({ ...tam, conclusion: 'failure', status: 'completed' }).sonuc).toBe('failure')
    expect(C.kosuKaydi({ ...tam, conclusion: null, status: 'in_progress' }).sonuc).toBe('in_progress')
    expect(C.kosuKaydi({ ...tam, conclusion: null, status: null }).sonuc).toBeNull()
  })

  it('eksik alanlar için varsayılanlar: deneme 1, pr null, başlama/güncelleme null, başlık boş', () => {
    expect(C.kosuKaydi({ id: 5, created_at: '2026-10-05T11:00:00Z' })).toMatchObject({
      kosuId: 5,
      baslama: null,
      guncelleme: null,
      sonuc: null,
      deneme: 1,
      pr: null,
      baslik: '',
    })
    expect(C.kosuKaydi({ ...tam, pull_requests: [] }).pr).toBeNull()
  })

  it('başlık 100 karaktere kırpılır (100 olduğu gibi kalır, 101 kırpılır)', () => {
    expect(C.kosuKaydi({ ...tam, display_title: 'x'.repeat(100) }).baslik).toBe('x'.repeat(100))
    expect(C.kosuKaydi({ ...tam, display_title: 'y'.repeat(101) }).baslik).toBe('y'.repeat(100))
  })
})

describe('pencereyiCek — sayfalama (sahte gh, ağ yok)', () => {
  const PENCERE: [string, string] = ['2026-10-01', '2026-10-07']
  const sayfaUrl = (sayfa: number, repo = 'sahip/depo', isAkisi = 'ci.yml') =>
    `repos/${repo}/actions/workflows/${isAkisi}/runs?created=2026-10-01..2026-10-07&per_page=100&page=${sayfa}`

  // İlk kusurun ikizi: ilk sayfada durmak 100'den fazla koşulu sessizce düşürür. 250 koşu = 100 + 100 + 50 → ÜÇ istek.
  it('250 koşu: üç sayfa (100+100+50) gezilir, hepsi toplanır, her istek URL + sayfa ile tam', async () => {
    const depo = sahteGitHub({ pencereler: { '2026-10-01..2026-10-07': { satirlar: iptalKosular(250, 1000) } } })
    const r = await C.pencereyiCek('sahip/depo', 'ci.yml', PENCERE, depo.gh)
    expect(r.kosular).toHaveLength(250)
    expect(r.kosular.map((k) => k.kosuId)).toEqual(Array.from({ length: 250 }, (_, i) => 1000 + i))
    expect(r.toplam).toBe(250)
    expect(r.pencere).toBe('2026-10-01..2026-10-07')
    expect(depo.cagrilar).toEqual([
      { args: ['api', sayfaUrl(1)], secenek: { json: true } },
      { args: ['api', sayfaUrl(2)], secenek: { json: true } },
      { args: ['api', sayfaUrl(3)], secenek: { json: true } },
    ])
  })

  // Sınır tablosu: tam 100 satırlık sayfa "dolu" sayılır, sonraki sayfa da istenir (boş gelince durur).
  it.each<[number, number]>([
    [0, 1],
    [1, 1],
    [99, 1],
    [100, 2],
    [101, 2],
    [199, 2],
    [200, 3],
    [201, 3],
  ])('%i koşu → %i istek, hiçbiri düşmez', async (n, istek) => {
    const depo = sahteGitHub({ pencereler: { '2026-10-01..2026-10-07': { satirlar: iptalKosular(n, 1) } } })
    const r = await C.pencereyiCek('sahip/depo', 'ci.yml', PENCERE, depo.gh)
    expect(r.kosular).toHaveLength(n)
    expect(depo.cagrilar).toHaveLength(istek)
    expect(depo.cagrilar.map((c) => c.args[1])).toEqual(Array.from({ length: istek }, (_, i) => sayfaUrl(i + 1)))
  })

  it('depo ve iş akışı adı URL\'ye girer', async () => {
    const depo = sahteGitHub({ pencereler: { '2026-10-01..2026-10-07': { satirlar: [] } } })
    await C.pencereyiCek('baska/depo', 'deploy.yml', PENCERE, depo.gh)
    expect(depo.cagrilar[0].args).toEqual(['api', sayfaUrl(1, 'baska/depo', 'deploy.yml')])
  })

  // GitHub'ın kararsız sayfalaması: aynı koşu iki sayfada görülebilir (ölçüldü: 400 satırın 320'si benzersiz).
  it('sayfalar arası YİNELENEN koşu tekilleştirilir; total_count sunucunun dediği kalır (uyarı ana akışta)', async () => {
    const satirlar = [...iptalKosular(130, 1), ...iptalKosular(20, 1)]
    const depo = sahteGitHub({ pencereler: { '2026-10-01..2026-10-07': { satirlar } } })
    const r = await C.pencereyiCek('sahip/depo', 'ci.yml', PENCERE, depo.gh)
    expect(r.kosular.map((k) => k.kosuId)).toEqual(Array.from({ length: 130 }, (_, i) => 1 + i))
    expect(r.toplam).toBe(150)
  })

  it('total_count İLK sayfadan alınır (sonraki sayfaların sayısı onu değiştirmez)', async () => {
    const yanitlar = [
      { total_count: 120, workflow_runs: iptalKosular(100, 1) },
      { total_count: 999, workflow_runs: iptalKosular(20, 101) },
    ]
    let i = 0
    const r = await C.pencereyiCek('sahip/depo', 'ci.yml', PENCERE, async () => yanitlar[i++])
    expect(r.toplam).toBe(120)
    expect(r.kosular).toHaveLength(120)
  })

  it('yanıtta workflow_runs yoksa boş pencere sayılır (çökmez, tek istek)', async () => {
    let istek = 0
    const r = await C.pencereyiCek('sahip/depo', 'ci.yml', PENCERE, async () => {
      istek += 1
      return { total_count: 0 }
    })
    expect(r).toEqual({ kosular: [], toplam: 0, pencere: '2026-10-01..2026-10-07' })
    expect(istek).toBe(1)
  })

  it('bir sayfa hata verirse pencere O HATAYLA reddedilir: kısmi veri sessizce dönmez', async () => {
    const depo = sahteGitHub({ pencereler: { '2026-10-01..2026-10-07': { satirlar: iptalKosular(250, 1) } } })
    const bozuk: GhCagri = async (args, secenek) => {
      if (args[1].endsWith('page=2')) throw new Error('gh api: HTTP 502 Bad Gateway')
      return depo.gh(args, secenek)
    }
    await expect(C.pencereyiCek('sahip/depo', 'ci.yml', PENCERE, bozuk)).rejects.toThrow('HTTP 502 Bad Gateway')
  })
})

describe('kirmiziKosuyuIsle — günlük ne zaman çekilir, nasıl ayıklanır (sahte gh, ağ yok)', () => {
  const K = C.kosuKaydi(hamKosu(42, '2026-10-05T11:00:00Z', 'failure'))
  const JOBS_ARGS = ['api', 'repos/sahip/depo/actions/runs/42/jobs?per_page=30']
  const LOG_ARGS = ['run', 'view', '42', '--repo', 'sahip/depo', '--log-failed']

  // Üçüncü kusur sınıfı: günlük hiç çekilmezse test dosyaları HEP boş çıkar; karne "bu test hiç kırmızı vermedi" der.
  it('Test adımı kırıksa günlük ÇEKİLİR (çağrı argümanları tam) ve ayıklanır', async () => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: { 42: isYaniti([['Checkout', 'success', 3], ['Test', 'failure', 190], ['Upload', 'skipped', null]]) },
      gunlukler: { 42: GUNLUK_KIRMIZI },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(depo.cagrilar).toEqual([
      { args: JOBS_ARGS, secenek: { json: true } },
      { args: LOG_ARGS, secenek: undefined },
    ])
    expect(r).toEqual({
      ...K,
      basarisizAdimlar: ['Test'],
      testAdimiSuresiSn: 190,
      testDosyalari: GUNLUK_BEKLENEN,
      basarisizDosyaSayisi: 12,
    })
  })

  it('başka adım kırıksa (Lint) günlük ÇEKİLMEZ: test dosyası uydurulmaz', async () => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: { 42: isYaniti([['Checkout', 'success', 2], ['Lint', 'failure', 20], ['Test', 'skipped', null]]) },
      gunlukler: { 42: GUNLUK_KIRMIZI },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(depo.cagrilar.map((c) => c.args)).toEqual([JOBS_ARGS])
    expect(r).toEqual({ ...K, basarisizAdimlar: ['Lint'], testAdimiSuresiSn: null, testDosyalari: [] })
  })

  it('adım bilgisi alınamazsa (jobs API hatası) günlük YİNE DE denenir ve hata kayda geçer', async () => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: { 42: new Error('gh api jobs: HTTP 404 Not Found') },
      gunlukler: { 42: GUNLUK_KIRMIZI },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(depo.cagrilar.map((c) => c.args)).toEqual([JOBS_ARGS, LOG_ARGS])
    expect(r.isBilgisiAlinamadi).toBe('gh api jobs: HTTP 404 Not Found')
    expect(r.basarisizAdimlar).toEqual([])
    expect(r.testDosyalari).toEqual(GUNLUK_BEKLENEN)
    expect(r.basarisizDosyaSayisi).toBe(12)
  })

  it('günlük alınamazsa logAlinamadi + logHatasi yazılır, test dosyası uydurulmaz', async () => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: { 42: isYaniti([['Test', 'failure', 10]]) },
      gunlukler: { 42: new Error('gh run view: HTTP 410 Gone (günlük süresi doldu)') },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(r.logAlinamadi).toBe(true)
    expect(r.logHatasi).toBe('gh run view: HTTP 410 Gone (günlük süresi doldu)')
    expect(r.testDosyalari).toEqual([])
    expect(r).not.toHaveProperty('basarisizDosyaSayisi')
    expect(r.basarisizAdimlar).toEqual(['Test'])
  })

  it.each<[string]>([['Test'], ['test'], [' TEST ']])('adım adı %j "Test" sayılır: günlük çekilir', async (ad) => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: { 42: isYaniti([[ad, 'failure', 10]]) },
      gunlukler: { 42: GUNLUK_KIRMIZI },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(depo.cagrilar.map((c) => c.args)).toEqual([JOBS_ARGS, LOG_ARGS])
    expect(r.testDosyalari).toEqual(GUNLUK_BEKLENEN)
  })

  it('BAŞARILI işin içindeki "failure" adım (continue-on-error) kırmızı adım SAYILMAZ, günlük çekilmez', async () => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: { 42: isYaniti([['Test', 'failure', 10]], 'success') },
      gunlukler: { 42: GUNLUK_KIRMIZI },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(r.basarisizAdimlar).toEqual([])
    expect(depo.cagrilar.map((c) => c.args)).toEqual([JOBS_ARGS])
  })

  it('birden çok başarısız iş: kırık adımlar işlerin sırasıyla birikir ve günlük çekilir', async () => {
    const depo = sahteGitHub({
      pencereler: {},
      isler: {
        42: {
          jobs: [
            { conclusion: 'failure', steps: [{ name: 'Lint', conclusion: 'failure' }] },
            { conclusion: 'failure', steps: [{ name: 'Test', conclusion: 'failure' }] },
          ],
        },
      },
      gunlukler: { 42: GUNLUK_KIRMIZI },
    })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(r.basarisizAdimlar).toEqual(['Lint', 'Test'])
    expect(depo.cagrilar.map((c) => c.args)).toEqual([JOBS_ARGS, LOG_ARGS])
  })

  it('jobs yanıtı boşsa (jobs alanı yok) çökmez: kırık adım yok, günlük çekilmez', async () => {
    const depo = sahteGitHub({ pencereler: {}, isler: { 42: {} }, gunlukler: { 42: GUNLUK_KIRMIZI } })
    const r = await C.kirmiziKosuyuIsle('sahip/depo', K, depo.gh)
    expect(r).toEqual({ ...K, basarisizAdimlar: [], testAdimiSuresiSn: null, testDosyalari: [] })
    expect(depo.cagrilar).toHaveLength(1)
  })
})

describe('basariliKosuSuresi (sahte gh)', () => {
  const K = C.kosuKaydi(hamKosu(43, '2026-10-05T12:00:00Z', 'success'))

  it('başarılı koşunun Test adımı süresini kayda ekler (jobs çağrısı tam)', async () => {
    const depo = sahteGitHub({ pencereler: {}, isler: { 43: isYaniti([['Test', 'success', 160]], 'success') } })
    const r = await C.basariliKosuSuresi('sahip/depo', K, depo.gh)
    expect(r).toEqual({ ...K, testAdimiSuresiSn: 160 })
    expect(depo.cagrilar).toEqual([{ args: ['api', 'repos/sahip/depo/actions/runs/43/jobs?per_page=30'], secenek: { json: true } }])
  })

  it('jobs alınamazsa isBilgisiAlinamadi yazılır, süre UYDURULMAZ', async () => {
    const depo = sahteGitHub({ pencereler: {}, isler: { 43: new Error('gh api jobs: HTTP 404 Not Found') } })
    const r = await C.basariliKosuSuresi('sahip/depo', K, depo.gh)
    expect(r).toEqual({ ...K, isBilgisiAlinamadi: 'gh api jobs: HTTP 404 Not Found' })
    expect(r).not.toHaveProperty('testAdimiSuresiSn')
  })
})

describe('havuz — sınırlı eşzamanlılık', () => {
  const bekle = (ms: number) => new Promise<void>((coz) => setTimeout(coz, ms))

  it('sonuçlar GİRİŞ sırasında döner (iş bitiş sırası farklı olsa da) ve fn (öğe, indeks) alır', async () => {
    const sonuc = await C.havuz([25, 1, 12, 1, 5], 3, async (ms, i) => {
      await bekle(ms)
      return `${i}:${ms}`
    })
    expect(sonuc).toEqual(['0:25', '1:1', '2:12', '3:1', '4:5'])
  })

  it('aynı anda en çok `es` iş koşar ve her iş tam bir kez işlenir', async () => {
    let aktif = 0
    let enFazla = 0
    const gorulen: number[] = []
    await C.havuz([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
      aktif += 1
      enFazla = Math.max(enFazla, aktif)
      gorulen.push(n)
      await bekle(3)
      aktif -= 1
    })
    expect(enFazla).toBe(3)
    expect(gorulen.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it.each<[number]>([[0], [-2]])('es=%i: yine de TEK işçiyle çalışır, hiçbir iş sessizce atlanmaz', async (es) => {
    let aktif = 0
    let enFazla = 0
    const sonuc = await C.havuz(['a', 'b', 'c'], es, async (x) => {
      aktif += 1
      enFazla = Math.max(enFazla, aktif)
      await bekle(1)
      aktif -= 1
      return x.toUpperCase()
    })
    expect(sonuc).toEqual(['A', 'B', 'C'])
    expect(enFazla).toBe(1)
  })

  it('boş listede boş dizi döner; bir iş hata fırlatırsa havuz o hatayla reddedilir (yutulmaz)', async () => {
    await expect(C.havuz([], 4, async () => 1)).resolves.toEqual([])
    await expect(
      C.havuz([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error('iş patladı')
        return n
      }),
    ).rejects.toThrow('iş patladı')
  })
})

describe('ghDene — yeniden deneme (sahte gh, sahte zamanlayıcı)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('geçici hatada (HTTP 502, ağ kopması) yeniden dener: zamanlayıcı ilerlemeden ikinci çağrı YOK; sonunda başarırsa sonucu döner', async () => {
    vi.useFakeTimers()
    const cagri = vi
      .fn<GhCagri>()
      .mockRejectedValueOnce(new Error('gh api x: HTTP 502 Bad Gateway'))
      .mockRejectedValueOnce(new Error('connect ETIMEDOUT'))
      .mockResolvedValue({ tamam: true })
    const bekleyen = C.ghDene(['api', 'x'], { json: true }, 3, cagri)
    await vi.advanceTimersByTimeAsync(0)
    expect(cagri).toHaveBeenCalledTimes(1)
    await vi.runAllTimersAsync()
    await expect(bekleyen).resolves.toEqual({ tamam: true })
    expect(cagri).toHaveBeenCalledTimes(3)
    expect(cagri).toHaveBeenNthCalledWith(1, ['api', 'x'], { json: true })
    expect(cagri).toHaveBeenNthCalledWith(3, ['api', 'x'], { json: true })
  })

  it.each<[string]>([['HTTP 404 Not Found'], ['HTTP 403 Forbidden'], ['HTTP 410 Gone'], ['HTTP 422 Unprocessable']])(
    'kalıcı hata (%s): HEMEN bırakır, yeniden denemez, beklemez',
    async (mesaj) => {
      vi.useFakeTimers() // zamanlayıcı ilerletilmez: bekleyen bir yeniden deneme olsaydı bu söz hiç çözülmez, test zaman aşımına düşerdi
      const cagri = vi.fn<GhCagri>().mockRejectedValue(new Error(`gh api x: ${mesaj}`))
      await expect(C.ghDene(['api', 'x'], {}, 3, cagri)).rejects.toThrow(mesaj)
      expect(cagri).toHaveBeenCalledTimes(1)
    },
  )

  it('429 (hız sınırı) 4xx olsa da yeniden denenir', async () => {
    vi.useFakeTimers()
    const cagri = vi.fn<GhCagri>().mockRejectedValueOnce(new Error('gh api x: HTTP 429 Too Many Requests')).mockResolvedValue('tamam')
    const bekleyen = C.ghDene(['api', 'x'], {}, 3, cagri)
    await vi.runAllTimersAsync()
    await expect(bekleyen).resolves.toBe('tamam')
    expect(cagri).toHaveBeenCalledTimes(2)
  })

  it('üç denemenin üçü de başarısızsa SON hatayı fırlatır (üç çağrı); deneme sayısı parametreyle değişir', async () => {
    vi.useFakeTimers()
    const cagri = vi
      .fn<GhCagri>()
      .mockRejectedValueOnce(new Error('birinci HTTP 500'))
      .mockRejectedValueOnce(new Error('ikinci HTTP 500'))
      .mockRejectedValueOnce(new Error('son HTTP 503'))
    const bekleyen = C.ghDene(['api', 'x'], {}, 3, cagri)
    const sonuc = expect(bekleyen).rejects.toThrow('son HTTP 503')
    await vi.runAllTimersAsync()
    await sonuc
    expect(cagri).toHaveBeenCalledTimes(3)

    const tek = vi.fn<GhCagri>().mockRejectedValue(new Error('hata HTTP 500'))
    const tekBekleyen = C.ghDene(['api', 'x'], {}, 1, tek)
    const tekSonuc = expect(tekBekleyen).rejects.toThrow('hata HTTP 500')
    await vi.runAllTimersAsync()
    await tekSonuc
    expect(tek).toHaveBeenCalledTimes(1)
  })
})

// `gh` sarmalayıcısının KENDİSİ: yukarıdaki sahte GitHub onun ÜSTÜNDE durur, yani `json` seçeneğinin yok sayılması gibi bir
// bozulmayı göremez (ham metin gelir, `workflow_runs` "yok" görünür, pencereler sessizce BOŞ çıkar, karne "koşu yok" der).
// Burada `execFile` sahte süreçle değiştirilir: gerçek süreç, ağ ve gerçek `gh` yok.
describe('gh — süreç sarmalayıcısı (sahte execFile)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  type Surec = { err?: SurecHatasi | null; stdout?: string; stderr?: string }
  function sahteSurec(sonuc: Surec) {
    const cagrilar: Array<{ komut: string; args: string[]; secenek: Record<string, unknown> }> = []
    const exec: SahteExec = (komut, args, secenek, geriCagri) => {
      cagrilar.push({ komut, args: [...args], secenek })
      geriCagri(sonuc.err ?? null, sonuc.stdout ?? '', sonuc.stderr ?? '')
    }
    return { exec, cagrilar }
  }
  async function reddi(soz: Promise<unknown>): Promise<Error & { kod?: unknown }> {
    try {
      await soz
    } catch (e) {
      return e as Error & { kod?: unknown }
    }
    throw new Error('söz reddedilmedi')
  }

  it('json:true → stdout JSON olarak ayrıştırılır; süreç çağrısı: "gh", argümanlar AYNEN, 256 MiB tampon, pencere gizli', async () => {
    const s = sahteSurec({ stdout: '{"total_count":3,"workflow_runs":[]}' })
    await expect(C.gh(['api', 'repos/o/r/actions/runs'], { json: true }, s.exec)).resolves.toEqual({ total_count: 3, workflow_runs: [] })
    expect(s.cagrilar).toEqual([
      { komut: 'gh', args: ['api', 'repos/o/r/actions/runs'], secenek: { maxBuffer: 256 * 1024 * 1024, windowsHide: true } },
    ])
  })

  it('json verilmezse stdout METNİ aynen döner (ayrıştırılmaz, kırpılmaz)', async () => {
    await expect(C.gh(['repo', 'view'], undefined, sahteSurec({ stdout: 'sahip/depo\n' }).exec)).resolves.toBe('sahip/depo\n')
    await expect(C.gh(['api', 'x'], {}, sahteSurec({ stdout: '{"a":1}' }).exec)).resolves.toBe('{"a":1}')
  })

  it('süreç hatası: mesaj "gh <ilk üç argüman>: <stderr>" (boşluklar kırpılır), kod err.code', async () => {
    const hata = Object.assign(new Error('Command failed: gh api'), { code: 1 })
    const s = sahteSurec({ err: hata, stderr: '  gh: Not Found (HTTP 404)\n' })
    const e = await reddi(C.gh(['api', 'repos/o/r/actions/runs/9/jobs?per_page=30', '--paginate', 'dördüncü'], { json: true }, s.exec))
    expect(e.message).toBe('gh api repos/o/r/actions/runs/9/jobs?per_page=30 --paginate: gh: Not Found (HTTP 404)')
    expect(e.kod).toBe(1)
  })

  it('stderr boşsa hata mesajı err.message olur; stderr 300 karaktere kırpılır', async () => {
    const yok = await reddi(C.gh(['repo', 'view'], {}, sahteSurec({ err: Object.assign(new Error('spawn gh ENOENT'), { code: 'ENOENT' }) }).exec))
    expect(yok.message).toBe('gh repo view: spawn gh ENOENT')
    expect(yok.kod).toBe('ENOENT')
    const uzun = await reddi(C.gh(['a', 'b', 'c', 'd'], {}, sahteSurec({ err: new Error('x'), stderr: 'h'.repeat(400) }).exec))
    expect(uzun.message).toBe(`gh a b c: ${'h'.repeat(300)}`)
  })

  it('JSON olmayan çıktı: "gh çıktısı JSON değil" + ilk 200 karakter (json:true)', async () => {
    const cikti = `<html>${'x'.repeat(300)}`
    const e = await reddi(C.gh(['api', 'x'], { json: true }, sahteSurec({ stdout: cikti }).exec))
    expect(e.message).toBe(`gh çıktısı JSON değil: ${cikti.slice(0, 200)}`)
  })

  // Sarmalayıcı ile yeniden deneme mantığı birbirine BAĞLI: gh stderr'indeki "(HTTP 404)" mesaja girmezse kalıcı hata
  // (silinmiş koşu, süresi dolmuş günlük) "geçici" sanılır ve her biri için 9 sn (1,5 + 3 + 4,5) boşuna beklenir.
  it('gh stderr\'indeki "(HTTP 404)" mesaja girer: ghDene bunu KALICI sayar, yeniden denemez', async () => {
    vi.useFakeTimers() // zamanlayıcı ilerletilmez: yeniden deneme bekleyen bir söz çözülmez, test zaman aşımına düşerdi
    const s = sahteSurec({ err: new Error('Command failed'), stderr: 'gh: Not Found (HTTP 404)' })
    const ghFn: GhCagri = (args, secenek) => C.gh(args, secenek, s.exec)
    await expect(C.ghDene(['api', 'x'], { json: true }, 3, ghFn)).rejects.toThrow('HTTP 404')
    expect(s.cagrilar).toHaveLength(1)
  })
})

// ── ANA AKIŞ: sahte GitHub + geçici dosya çıktısı─────────────────────────────────────────────────────────────────────
describe('main — sahte GitHub + geçici dosya (ağ yok, gerçek gh yok)', () => {
  const gecici: string[] = []
  afterEach(() => {
    vi.restoreAllMocks()
    for (const d of gecici.splice(0)) fs.rmSync(d, { recursive: true, force: true })
  })

  /** stderr'i yakalar: gürültü yok, özet satırları assert edilir. */
  function stderrYakala(): string[] {
    const yazilan: string[] = []
    vi.spyOn(process.stderr, 'write').mockImplementation((parca: string | Uint8Array) => {
      yazilan.push(String(parca))
      return true
    })
    return yazilan
  }

  function geciciCikti(): string {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-gecmis-test-'))
    gecici.push(dizin)
    // var olmayan alt dizin: `mkdir -p` davranışı da sınanır
    return path.join(dizin, 'alt', 'dizin', 'ci-gecmis.json')
  }

  async function calistir(bayraklar: string[], senaryo: Senaryo) {
    const yazilan = stderrYakala()
    const cikti = geciciCikti()
    const depo = sahteGitHub(senaryo)
    await C.main([...bayraklar, '--cikti', cikti], { gh: depo.gh })
    const belge = JSON.parse(fs.readFileSync(cikti, 'utf8')) as Cikti
    return { belge, stderr: yazilan.join(''), cagrilar: depo.cagrilar, depo, cikti }
  }

  const PENCERE_BAYRAKLARI = ['--repo', 'sahip/depo', '--baslangic', '2026-10-01', '--bitis', '2026-10-07']
  const W1 = '2026-10-01..2026-10-07'

  it('uçtan uca: sıralama, kırmızı/başarılı zenginleştirme, uyarı, çağrı argümanları ve çıktı dosyası', async () => {
    const senaryo: Senaryo = {
      pencereler: {
        // yanıt sırası BİLEREK karışık: sıralama ana akışta yapılmalı
        '2026-10-01..2026-10-07': {
          satirlar: [
            hamKosu(101, '2026-10-03T09:00:00Z', 'success'),
            hamKosu(102, '2026-10-02T09:00:00Z', 'failure'),
            hamKosu(103, '2026-10-05T09:00:00Z', 'failure'),
            hamKosu(104, '2026-10-04T09:00:00Z', 'cancelled'),
            hamKosu(105, '2026-10-06T09:00:00Z', 'success'),
          ],
        },
        // GitHub "4 koşu" der ama 3 verir → total_count uyarısı
        '2026-10-08..2026-10-10': {
          toplam: 4,
          satirlar: [
            hamKosu(106, '2026-10-08T09:00:00Z', 'success'),
            hamKosu(107, '2026-10-09T09:00:00Z', 'failure'),
            hamKosu(108, '2026-10-10T09:00:00Z', 'success'),
          ],
        },
      },
      isler: {
        102: isYaniti([['Checkout', 'success', 3], ['Test', 'failure', 190], ['Upload', 'skipped', null]]),
        103: isYaniti([['Checkout', 'success', 2], ['Lint', 'failure', 20], ['Test', 'skipped', null]]),
        107: new Error('gh api jobs: HTTP 404 Not Found'),
        106: isYaniti([['Test', 'success', 100]], 'success'),
        108: isYaniti([['Test', 'success', 160]], 'success'),
      },
      gunlukler: {
        102: GUNLUK_KIRMIZI,
        107: new Error('gh run view: HTTP 410 Gone'),
      },
    }
    const { belge, stderr, cagrilar } = await calistir(
      ['--repo', 'sahip/depo', '--is-akisi', 'deploy.yml', '--baslangic', '2026-10-01', '--bitis', '2026-10-10', '--pencere-gun', '7', '--es', '2', '--sure-ornek', '2'],
      senaryo,
    )

    // belge üstbilgisi
    expect(belge.repo).toBe('sahip/depo')
    expect(belge.isAkisi).toBe('deploy.yml')
    expect(belge.pencere).toEqual({ baslangic: '2026-10-01', bitis: '2026-10-10', gun: 7 })
    expect(Number.isNaN(Date.parse(belge.alinma))).toBe(false)
    expect(belge.uyarilar).toEqual(['2026-10-08..2026-10-10: total_count=4 ama 3 benzersiz koşu alındı'])

    // koşular oluşturma tarihine göre ESKİDEN YENİYE
    expect(belge.kosular.map((k) => k.kosuId)).toEqual([102, 101, 104, 103, 105, 106, 107, 108])

    const kayit = (id: number) => {
      const k = belge.kosular.find((x) => x.kosuId === id)
      if (!k) throw new Error(`kayıt yok: ${id}`)
      return k
    }
    // kırmızı, Test adımı kırık: günlük ayıklandı
    expect(kayit(102)).toMatchObject({
      sonuc: 'failure',
      basarisizAdimlar: ['Test'],
      testAdimiSuresiSn: 190,
      testDosyalari: GUNLUK_BEKLENEN,
      basarisizDosyaSayisi: 12,
    })
    // kırmızı, Lint kırık: günlük çekilmedi
    expect(kayit(103)).toMatchObject({ sonuc: 'failure', basarisizAdimlar: ['Lint'], testDosyalari: [] })
    expect(kayit(103)).not.toHaveProperty('logAlinamadi')
    expect(kayit(103)).not.toHaveProperty('basarisizDosyaSayisi')
    // kırmızı, jobs bilgisi alınamadı: günlük denendi, o da alınamadı
    expect(kayit(107).isBilgisiAlinamadi).toBe('gh api jobs: HTTP 404 Not Found')
    expect(kayit(107).logAlinamadi).toBe(true)
    expect(kayit(107).logHatasi).toBe('gh run view: HTTP 410 Gone')
    expect(kayit(107).testDosyalari).toEqual([])
    // başarılı koşular: yalnız EN YENİ `--sure-ornek` (2) tanesinin süresi örneklenir
    expect(kayit(106).testAdimiSuresiSn).toBe(100)
    expect(kayit(108).testAdimiSuresiSn).toBe(160)
    expect(kayit(101)).not.toHaveProperty('testAdimiSuresiSn')
    expect(kayit(105)).not.toHaveProperty('testAdimiSuresiSn')
    // iptal edilen koşu zenginleştirilmez; düz kayıt (fazladan alan yok)
    expect(kayit(104)).toEqual({
      kosuId: 104,
      olay: 'push',
      dal: 'master',
      sha: 'sha-104',
      olusturma: '2026-10-04T09:00:00Z',
      baslama: '2026-10-04T09:00:00Z',
      guncelleme: '2026-10-04T09:00:00Z',
      sonuc: 'cancelled',
      deneme: 1,
      pr: null,
      baslik: 'koşu 104',
    })

    // çağrılar: önce pencereler SIRAYLA (iş akışı adı = --is-akisi), sonra iş/günlük çağrıları (havuz sırası belirsiz → sıralı karşılaştırma)
    const url = (w: string) => `repos/sahip/depo/actions/workflows/deploy.yml/runs?created=${w}&per_page=100&page=1`
    const arg = (c: { args: string[] }) => c.args.join(' ')
    expect(cagrilar.slice(0, 2).map((c) => c.args)).toEqual([
      ['api', url('2026-10-01..2026-10-07')],
      ['api', url('2026-10-08..2026-10-10')],
    ])
    const isUrl = (id: number) => `api repos/sahip/depo/actions/runs/${id}/jobs?per_page=30`
    expect(
      cagrilar
        .slice(2)
        .map(arg)
        .sort(),
    ).toEqual(
      [
        isUrl(102),
        isUrl(103),
        isUrl(107),
        isUrl(106),
        isUrl(108),
        'run view 102 --repo sahip/depo --log-failed',
        'run view 107 --repo sahip/depo --log-failed',
      ].sort(),
    )

    // stderr özeti
    expect(stderr).toContain('[ci-gecmis] 8 koşu (sahip/depo, 2026-10-01..2026-10-10); kırmızı 3, süre örneği 2. Uyarı: 1\n')
    expect(stderr).toContain('test dosyası ayıklanan kırmızı koşu: 1 · günlüğü alınamayan: 1\n')
  })

  // `--is-akisi` değeri `repo` alanına yazılırsa (ya da tersi) URL'ler bozulur: burada İKİSİ de URL'den doğrulanır.
  it('--is-akisi ve --repo ayrı alanlara gider: URL repos/<repo>/actions/workflows/<is-akisi>/runs', async () => {
    const { cagrilar, belge } = await calistir(
      ['--repo', 'baska/depo', '--is-akisi', 'nightly.yml', '--baslangic', '2026-10-06', '--bitis', '2026-10-06'],
      { pencereler: { '2026-10-06..2026-10-06': { satirlar: [] } } },
    )
    expect(cagrilar.map((c) => c.args)).toEqual([
      ['api', 'repos/baska/depo/actions/workflows/nightly.yml/runs?created=2026-10-06..2026-10-06&per_page=100&page=1'],
    ])
    expect(belge.repo).toBe('baska/depo')
    expect(belge.isAkisi).toBe('nightly.yml')
  })

  it('--repo verilmezse depo adı `gh repo view` ile okunur (satır sonu kırpılır) ve URL\'lere girer; verilirse o çağrı YAPILMAZ', async () => {
    const yok = await calistir(['--baslangic', '2026-10-06', '--bitis', '2026-10-06'], {
      repoAdi: 'sahip/depo',
      pencereler: { '2026-10-06..2026-10-06': { satirlar: [] } },
    })
    expect(yok.cagrilar[0].args).toEqual(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'])
    expect(yok.cagrilar[1].args).toEqual([
      'api',
      'repos/sahip/depo/actions/workflows/ci.yml/runs?created=2026-10-06..2026-10-06&per_page=100&page=1',
    ])
    expect(yok.belge.repo).toBe('sahip/depo')

    const var_ = await calistir(['--repo', 'ben/depo', '--baslangic', '2026-10-06', '--bitis', '2026-10-06'], {
      repoAdi: 'sahip/depo',
      pencereler: { '2026-10-06..2026-10-06': { satirlar: [] } },
    })
    expect(var_.cagrilar.some((c) => c.args[0] === 'repo')).toBe(false)
    expect(var_.belge.repo).toBe('ben/depo')
  })

  // İkinci kusurun ana akıştaki yüzü: 250 koşu ÜÇ sayfa; hepsi çıktıda, uyarı YOK (total_count tutuyor).
  it('sayfalama ana akışta: 250 koşu üç sayfadan toplanır, hepsi çıktıda, total_count tuttuğu için uyarı YOK', async () => {
    const { belge, cagrilar } = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { satirlar: iptalKosular(250, 1) } } })
    expect(belge.kosular).toHaveLength(250)
    expect(belge.uyarilar).toEqual([])
    const sayfa = (n: number) => `repos/sahip/depo/actions/workflows/ci.yml/runs?created=${W1}&per_page=100&page=${n}`
    expect(cagrilar.map((c) => c.args)).toEqual([
      ['api', sayfa(1)],
      ['api', sayfa(2)],
      ['api', sayfa(3)],
    ])
  })

  // GitHub'ın kararsız sayfalaması (ölçüldü: 400 satırın 320'si benzersiz): sunucu 150 der, benzersiz 130 gelir → UYARI.
  it('total_count uyuşmazlığı UYARI olur: sunucu 150 koşu der, yinelenen satırlar yüzünden 130 benzersiz gelir', async () => {
    const { belge, stderr } = await calistir(PENCERE_BAYRAKLARI, {
      pencereler: { [W1]: { satirlar: [...iptalKosular(130, 1), ...iptalKosular(20, 1)] } },
    })
    expect(belge.kosular).toHaveLength(130)
    expect(belge.uyarilar).toEqual([`${W1}: total_count=150 ama 130 benzersiz koşu alındı`])
    expect(stderr).toContain('Uyarı: 1\n')
  })

  it('total_count tutuyorsa uyarı yok; EKSİK satır (sunucu fazla der) de uyarıdır, FAZLA satır (sunucu eksik der) de', async () => {
    const tutuyor = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { toplam: 7, satirlar: iptalKosular(7, 1) } } })
    expect(tutuyor.belge.uyarilar).toEqual([])
    const eksik = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { toplam: 9, satirlar: iptalKosular(7, 1) } } })
    expect(eksik.belge.uyarilar).toEqual([`${W1}: total_count=9 ama 7 benzersiz koşu alındı`])
    const fazla = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { toplam: 5, satirlar: iptalKosular(7, 1) } } })
    expect(fazla.belge.uyarilar).toEqual([`${W1}: total_count=5 ama 7 benzersiz koşu alındı`])
  })

  // GitHub bir aramada en çok 1000 sonuç verir: 1200 koşu olan pencerede yalnız 1000'i gelir → İKİ uyarı (sırayla).
  it('1000 sonuç sınırı: 1200 der, 1000 gelir → önce uyuşmazlık sonra "1000 sınırına dayandı"; tam 1000/1000 yalnız sınır uyarısı; 999 uyarısız', async () => {
    const dolu = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { toplam: 1200, satirlar: iptalKosular(1000, 1) } } })
    expect(dolu.belge.uyarilar).toEqual([
      `${W1}: total_count=1200 ama 1000 benzersiz koşu alındı`,
      `${W1}: 1000 sınırına dayandı, pencereyi daralt`,
    ])
    const tam = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { satirlar: iptalKosular(1000, 1) } } })
    expect(tam.belge.uyarilar).toEqual([`${W1}: 1000 sınırına dayandı, pencereyi daralt`])
    const altinda = await calistir(PENCERE_BAYRAKLARI, { pencereler: { [W1]: { satirlar: iptalKosular(999, 1) } } })
    expect(altinda.belge.uyarilar).toEqual([])
  })

  // Aynı koşu iki pencerede görünebilir (GitHub kararsızlığı): çıktıda BİR kez yer almalı, yoksa karne aynı kırmızıyı iki sayar.
  it('aynı koşu İKİ pencerede görünürse çıktıda BİR kez yer alır', async () => {
    const ortak = hamKosu(301, '2026-10-07T23:59:00Z', 'cancelled')
    const { belge, stderr } = await calistir(['--repo', 'sahip/depo', '--baslangic', '2026-10-01', '--bitis', '2026-10-10'], {
      pencereler: {
        '2026-10-01..2026-10-07': { satirlar: [ortak, hamKosu(300, '2026-10-02T09:00:00Z', 'cancelled')] },
        '2026-10-08..2026-10-10': { satirlar: [ortak] },
      },
    })
    expect(belge.kosular.map((k) => k.kosuId)).toEqual([300, 301])
    expect(belge.uyarilar).toEqual([])
    expect(stderr).toContain('[ci-gecmis] 2 koşu (sahip/depo, 2026-10-01..2026-10-10);')
  })

  it('kırmızı koşular en çok --es kadar eşzamanlı işlenir', async () => {
    const satirlar = Array.from({ length: 6 }, (_, i) => hamKosu(200 + i, `2026-10-0${i + 1}T09:00:00Z`, 'failure'))
    const isler: Record<number, unknown> = {}
    for (const s of satirlar) isler[s.id] = isYaniti([['Lint', 'failure', 5]])
    const { depo, belge } = await calistir([...PENCERE_BAYRAKLARI, '--es', '2'], {
      pencereler: { [W1]: { satirlar } },
      isler,
      isGecikmeMs: 5,
    })
    expect(depo.enFazlaEszamanliIs()).toBe(2)
    expect(belge.kosular).toHaveLength(6)
  })

  it('HATA: pencere alınamazsa ana akış O HATAYLA reddedilir ve çıktı dosyası YAZILMAZ (kısmi karne yok)', async () => {
    stderrYakala()
    const cikti = geciciCikti()
    const depo = sahteGitHub({ pencereler: { [W1]: { satirlar: iptalKosular(3, 1) } } }) // ikinci pencere (bitiş 10-10) sahtede yok → HTTP 404
    await expect(
      C.main(['--repo', 'sahip/depo', '--baslangic', '2026-10-01', '--bitis', '2026-10-10', '--cikti', cikti], { gh: depo.gh }),
    ).rejects.toThrow('HTTP 404 pencere yok: 2026-10-08..2026-10-10')
    expect(fs.existsSync(cikti)).toBe(false)
  })

  it('HATA: `gh repo view` başarısızsa ana akış reddedilir; geçersiz bayrak da (hiçbir gh çağrısı yapılmadan)', async () => {
    stderrYakala()
    const cikti = geciciCikti()
    const cagrilar: string[][] = []
    const bozuk: GhCagri = async (args) => {
      cagrilar.push(args)
      throw new Error('gh repo view: not a git repository')
    }
    await expect(C.main(['--baslangic', '2026-10-06', '--bitis', '2026-10-06', '--cikti', cikti], { gh: bozuk })).rejects.toThrow(
      'not a git repository',
    )
    expect(cagrilar).toEqual([['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']])
    await expect(C.main(['--cikti', cikti, '--pencere-gun', '0'], { gh: bozuk })).rejects.toThrow('--pencere-gun >= 1 olmalı')
    expect(cagrilar).toHaveLength(1)
    expect(fs.existsSync(cikti)).toBe(false)
  })
})
