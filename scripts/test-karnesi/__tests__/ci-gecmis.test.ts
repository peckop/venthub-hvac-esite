import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-KARNE-2 · CI geçmişi toplayıcısının ayıklayıcısı (scripts/test-karnesi/ci-gecmis.cjs).
 *
 * İKİ GERÇEK KUSUR bu testin doğum sebebi (ALT-38, 2026-10-06 ölçüldü):
 *   1. GitHub günlüğünde renk kodu gerçek ESC değil, iki karakterlik "^[" METNİ olarak geliyor (karakter kodları 94,91,91).
 *      Yalnız ESC'yi soyan ilk sürüm 182 kırmızı koşuda 0 test dosyası buldu: karne "hiç kırmızı yok" derdi (sessiz yanlış).
 *   2. `status=failure&page=N` sayfalaması kararsız (400 satırın 320'si benzersiz, son üç haftanın kırmızıları eksik):
 *      `created=` pencereleri `total_count` ile doğrulanır.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const C = require_(path.join(KOK, 'scripts/test-karnesi/ci-gecmis.cjs')) as {
  ansiSoy: (s: string) => string
  basarisizTestleriAyikla: (metin: string) => Array<{ dosya: string; adlar: string[] }>
  basarisizDosyaSayisiOku: (metin: string) => number | null
  pencereler: (b: string, e: string, gun: number) => Array<[string, string]>
  testAdimiSuresi: (isler: unknown) => number | null
  argumanlar: (argv: string[], bugun?: Date) => Record<string, unknown>
}

const ONEK = 'ci\tUNKNOWN STEP\t2026-10-05T11:30:22.0256000Z '

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
})

describe('basarisizTestleriAyikla', () => {
  const gercek =
    `${ONEK}^[[41m^[[1m FAIL ^[[22m^[[49m src/__tests__/conformance/taban-tazeligi.test.ts^[[2m > ^[[22mINV-TABAN-TAZE-1 · sema tabani^[[2m > ^[[22mTAZELIK: eski\n` +
    `${ONEK}     ^[[33m^[[2m✓^[[22m^[[39m FAIL-CLOSED: TABAN_TAZELE_BUILD_CMD gecersizse SESSIZCE yok sayilmaz ^[[33m 437^[[2mms^[[22m^[[39m\n`

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
  })

  it('SABOTAJ: ESC-yalnız ayıklayıcı (eski kusur) gerçek günlükte 0 bulurdu', () => {
    const eskiAnsi = /\u001b\[[0-9;]*m/g
    const eskiAyiklayici = (metin: string) =>
      metin.split('\n').filter((s) => /\bFAIL\s+(\S+?\.(?:test|spec)\.[a-z]+)/.test(s.replace(eskiAnsi, ''))).length
    expect(eskiAyiklayici(gercek)).toBe(0)
    expect(C.basarisizTestleriAyikla(gercek).length).toBe(1)
  })
})

describe('basarisizDosyaSayisiOku', () => {
  it('"Test Files  1 failed | 597 passed" satırından sayıyı okur', () => {
    expect(C.basarisizDosyaSayisiOku('^[[2m Test Files ^[[22m ^[[1m^[[31m3 failed^[[39m^[[22m^[[2m | ^[[22m 597 passed')).toBe(3)
    expect(C.basarisizDosyaSayisiOku('Test Files  600 passed (600)')).toBeNull()
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
})
