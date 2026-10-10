// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-AGIR-KILIT-1..3 · Ağır komut kilidi + pencere başına süreç sayımı (ARC-81, 2026-10-10).
 *
 * Ölçülen vaka: 2026-10-09 19:57'de dokuz pencere ayni anda ağır komut koştu, 32,6 GB'ın 123 MB'ı
 * boştu ve uygulama kapandı. Kilit olmadan her pencere kendi başına makuldü; makineyi bağlayan
 * bir şey yoktu. Bu testler üç şeyi sabitler: (1) hangi komutun AĞIR sayıldığı (hafif komut
 * kilitlenmez), (2) yuvanın karşılıklı dışlama + bırakma + bayat temizliği, (3) pencere başına
 * süreç sayımı ve eşiği.
 */

interface Sahip {
  sid: string
  lane: string
  komut: string
  ad: string
  ts: number
}
type AlSonuc = { ok: true; yuva: number } | { ok: false; sahipler: Sahip[] }
interface Kilit {
  agirMi: (komut: string) => string | null
  kilitAl: (o: { sid: string; komut: string; ad: string; lane?: string; simdi?: number; dizin?: string; adet?: number }) => AlSonuc
  kilitBirak: (o: { sid: string; dizin?: string; adet?: number }) => number
  durum: (o?: { simdi?: number; dizin?: string; adet?: number }) => { adet: number; dolu: Sahip[] }
  satir: (sid: string, simdi?: number, o?: { dizin?: string; adet?: number }) => string | null
}
interface Yoklama {
  pencereSayimi: (liste: Array<{ i: number; p: number; n: string; c?: string }>) => {
    toplam: number
    pencereToplam: number
    pencereler: Array<{ pid: number; alt: number }>
  }
  satir: (ob: unknown, simdi: number, yasiyor?: (pid: number) => boolean) => string | null
}

const KOK = process.cwd()
const KANCA = path.resolve(KOK, '.claude', 'hooks', 'agir-komut-kilidi.cjs')
const req = createRequire(import.meta.url)
const kilit = req(KANCA) as Kilit
const yoklama = req(path.resolve(KOK, '.claude', 'hooks', 'bellek-yoklama.cjs')) as Yoklama

const A = '11111111-1111-4111-8111-111111111111'
const B = '22222222-2222-4222-8222-222222222222'
const C = '33333333-3333-4333-8333-333333333333'
const SIMDI = Date.parse('2026-10-10T16:00:00Z')

let kok: string
let sayac = 0
const yeniDizin = (): string => path.join(kok, 'kilit-' + ++sayac)

beforeAll(() => {
  kok = fs.mkdtempSync(path.join(os.tmpdir(), 'agir-kilit-'))
})
afterAll(() => {
  fs.rmSync(kok, { recursive: true, force: true })
})

describe('INV-AGIR-KILIT-1: hangi komut ağır sayılır', () => {
  const agir: Array<[string, string]> = [
    ['pnpm type-check', 'type-check'],
    ['pnpm run type-check', 'type-check'],
    ['npx tsc --noEmit', 'type-check'],
    ['cd C:/tmp/x && pnpm exec tsc -p tsconfig.json', 'type-check'],
    ['pnpm build', 'build'],
    ['next build', 'build'],
    ['pnpm install --frozen-lockfile --offline', 'install'],
    ['pnpm add -D foo', 'install'],
    ['pnpm test -- --run', 'tam test'],
    ['pnpm vitest run', 'tam test'],
    ['CI=1 vitest', 'tam test'],
    ['pnpm lint', 'lint'],
    ['pnpm knip', 'knip'],
    ['docker compose up -d', 'docker'],
  ]
  it.each(agir)('AĞIR: %s → %s', (komut, ad) => {
    expect(kilit.agirMi(komut)).toBe(ad)
  })

  const hafif = [
    'pnpm test:ilgili',
    'pnpm vitest run src/__tests__/conformance/bellek-yoklama.test.ts',
    'pnpm vitest src/foo.test.ts --run',
    'pnpm eslint --fix src/a.ts',
    'pnpm lint src/a.ts',
    'git status',
    'grep tsc docs/notlar.md',
    'echo "pnpm type-check"',
    'node scripts/board/board.cjs who',
    'gh api repos/x/y/pulls/1/merge',
  ]
  it.each(hafif)('HAFİF (kilitlenmez): %s', (komut) => {
    expect(kilit.agirMi(komut)).toBeNull()
  })
})

describe('INV-AGIR-KILIT-2: yuva karşılıklı dışlama, bırakma, bayat temizliği', () => {
  it('ikinci pencere REDDEDİLİR ve sahibi söylenir; bırakınca ikincisi alır', () => {
    const dizin = yeniDizin()
    const a = kilit.kilitAl({ sid: A, komut: 'pnpm type-check', ad: 'type-check', lane: 'ALTYAPI', simdi: SIMDI, dizin, adet: 1 })
    expect(a.ok).toBe(true)
    const b = kilit.kilitAl({ sid: B, komut: 'pnpm build', ad: 'build', simdi: SIMDI + 60_000, dizin, adet: 1 })
    expect(b.ok).toBe(false)
    if (!b.ok) {
      expect(b.sahipler).toHaveLength(1)
      expect(b.sahipler[0]).toMatchObject({ sid: A, lane: 'ALTYAPI', ad: 'type-check' })
    }
    expect(kilit.kilitBirak({ sid: A, dizin, adet: 1 })).toBe(1)
    expect(kilit.kilitAl({ sid: B, komut: 'pnpm build', ad: 'build', simdi: SIMDI + 120_000, dizin, adet: 1 }).ok).toBe(true)
  })

  it('aynı pencere yeniden girebilir (kendi kendini kilitlemez); başkası bırakamaz', () => {
    const dizin = yeniDizin()
    expect(kilit.kilitAl({ sid: A, komut: 'pnpm build', ad: 'build', simdi: SIMDI, dizin, adet: 1 }).ok).toBe(true)
    expect(kilit.kilitAl({ sid: A, komut: 'pnpm type-check', ad: 'type-check', simdi: SIMDI + 1000, dizin, adet: 1 }).ok).toBe(true)
    expect(kilit.kilitBirak({ sid: B, dizin, adet: 1 })).toBe(0)
    expect(kilit.durum({ simdi: SIMDI + 2000, dizin, adet: 1 }).dolu).toHaveLength(1)
  })

  it('N=2: iki pencere alır, üçüncü reddedilir', () => {
    const dizin = yeniDizin()
    expect(kilit.kilitAl({ sid: A, komut: 'pnpm build', ad: 'build', simdi: SIMDI, dizin, adet: 2 }).ok).toBe(true)
    expect(kilit.kilitAl({ sid: B, komut: 'pnpm build', ad: 'build', simdi: SIMDI, dizin, adet: 2 }).ok).toBe(true)
    expect(kilit.kilitAl({ sid: C, komut: 'pnpm build', ad: 'build', simdi: SIMDI, dizin, adet: 2 }).ok).toBe(false)
  })

  it('BAYAT yuva (TTL aşıldı) silinir ve yenisi alır; taze yuva silinmez', () => {
    const dizin = yeniDizin()
    kilit.kilitAl({ sid: A, komut: 'pnpm build', ad: 'build', simdi: SIMDI, dizin, adet: 1 })
    const taze = kilit.kilitAl({ sid: B, komut: 'pnpm build', ad: 'build', simdi: SIMDI + 19 * 60_000, dizin, adet: 1 })
    expect(taze.ok).toBe(false)
    const bayat = kilit.kilitAl({ sid: B, komut: 'pnpm build', ad: 'build', simdi: SIMDI + 21 * 60_000, dizin, adet: 1 })
    expect(bayat.ok).toBe(true)
    expect(kilit.durum({ simdi: SIMDI + 21 * 60_000, dizin, adet: 1 }).dolu[0]?.sid).toBe(B)
  })
})

describe('INV-AGIR-KILIT-2b: kanca protokolü (stdin → stdout, çıkış kodu 0)', () => {
  const calistir = (dizin: string, girdi: object, ...arglar: string[]) =>
    spawnSync(process.execPath, [KANCA, ...arglar], {
      input: JSON.stringify(girdi),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_AGIR_KILIT_DIR: dizin, VENTHUB_AGIR_KILIT_N: '1', CC_LANE: '' },
    })
  const bash = (sid: string, command: string, ekstra: object = {}) => ({
    session_id: sid,
    tool_name: 'Bash',
    tool_input: { command, ...ekstra },
  })

  it('ilk pencere geçer (stdout boş); ikinci pencere "deny" JSON alır; PostToolUse bırakınca geçer', () => {
    const dizin = yeniDizin()
    const ilk = calistir(dizin, bash(A, 'pnpm type-check'))
    expect(ilk.status).toBe(0)
    expect(ilk.stdout.trim()).toBe('')

    const ikinci = calistir(dizin, bash(B, 'pnpm build'))
    expect(ikinci.status).toBe(0)
    const cevap = JSON.parse(ikinci.stdout) as { hookSpecificOutput: { permissionDecision: string; permissionDecisionReason: string } }
    expect(cevap.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(cevap.hookSpecificOutput.permissionDecisionReason).toMatch(/AGIR KOMUT KILIDI/)
    expect(cevap.hookSpecificOutput.permissionDecisionReason).toMatch(/type-check/)

    calistir(dizin, bash(A, 'pnpm type-check'), '--birak')
    const ucuncu = calistir(dizin, bash(B, 'pnpm build'))
    expect(ucuncu.stdout.trim()).toBe('')
  })

  it('arka plan komutu PostToolUse\'ta yuvayı BIRAKMAZ (komut hâlâ koşuyor)', () => {
    const dizin = yeniDizin()
    calistir(dizin, bash(A, 'pnpm build', { run_in_background: true }))
    calistir(dizin, bash(A, 'pnpm build', { run_in_background: true }), '--birak')
    const b = calistir(dizin, bash(B, 'pnpm type-check'))
    expect(b.stdout).toMatch(/"permissionDecision":"deny"/)
  })

  it('hafif komut ve Bash dışı araç yuva ALMAZ', () => {
    const dizin = yeniDizin()
    calistir(dizin, bash(A, 'pnpm test:ilgili'))
    calistir(dizin, { session_id: A, tool_name: 'Read', tool_input: { command: 'pnpm build' } })
    const b = calistir(dizin, bash(B, 'pnpm type-check'))
    expect(b.stdout.trim()).toBe('')
  })

  it('AÇIK KALIR: kilit dizini yazılamıyorsa komut geçer (stdout boş, çıkış 0)', () => {
    const dosya = path.join(kok, 'dizin-degil')
    fs.writeFileSync(dosya, 'x')
    const r = calistir(path.join(dosya, 'alt'), bash(A, 'pnpm build'))
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('')
  })

  it('bozuk girdi komutu engellemez', () => {
    const r = spawnSync(process.execPath, [KANCA], { input: '{bozuk', encoding: 'utf8' })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('')
  })
})

describe('INV-AGIR-KILIT-2c: istem satırı eşikli (boşken susar)', () => {
  it('yuva boşken null; doluyken kimin tuttuğunu ve süreyi söyler; kendi penceren "sende" der', () => {
    const dizin = yeniDizin()
    expect(kilit.satir(B, SIMDI, { dizin, adet: 1 })).toBeNull()
    kilit.kilitAl({ sid: A, komut: 'pnpm build', ad: 'build', lane: 'ALTYAPI', simdi: SIMDI, dizin, adet: 1 })
    const baskasi = kilit.satir(B, SIMDI + 3 * 60_000, { dizin, adet: 1 })
    expect(baskasi).toMatch(/^⚠KILIT: agir komut 1\/1 dolu \(ALTYAPI build 3 dk\)/)
    expect(kilit.satir(A, SIMDI + 3 * 60_000, { dizin, adet: 1 })).toMatch(/sende build 3 dk/)
  })

  it('BAYAT yuva istem satırında GÖRÜNMEZ (kapanmış pencerenin kilidi ölü uyarı üretmez)', () => {
    const dizin = yeniDizin()
    kilit.kilitAl({ sid: A, komut: 'pnpm build', ad: 'build', simdi: SIMDI, dizin, adet: 1 })
    expect(kilit.satir(B, SIMDI + 25 * 60_000, { dizin, adet: 1 })).toBeNull()
  })

  it('istem satırı kancası KILIT bloğunu çağırır', () => {
    const kaynak = fs.readFileSync(path.resolve(KOK, '.claude', 'hooks', 'defter-tazelik-satiri.cjs'), 'utf8')
    expect(kaynak).toMatch(/require\(path\.join\(__dirname, 'agir-komut-kilidi\.cjs'\)\)/)
    expect(kaynak).toMatch(/ak\.satir\(/)
  })
})

describe('INV-AGIR-KILIT-3: pencere başına süreç sayımı', () => {
  const pencere = (i: number, p = 1) => ({
    i,
    p,
    n: 'claude.exe',
    c: 'C:\\Users\\x\\AppData\\Roaming\\Claude\\claude-code\\2.1.293\\abc\\claude.exe --output-format stream-json',
  })
  const cocuk = (i: number, p: number, n = 'node.exe') => ({ i, p, n, c: '' })

  it('her pencerenin TÜM torunlarını sayar; masaüstü uygulaması süreçleri pencere sayılmaz', () => {
    const liste = [
      { i: 1, p: 0, n: 'claude.exe', c: '"C:\\Program Files\\WindowsApps\\Claude_2\\app\\Claude.exe"' },
      pencere(100),
      cocuk(101, 100),
      cocuk(102, 101, 'conhost.exe'),
      cocuk(103, 101),
      pencere(200),
      cocuk(201, 200),
    ]
    const s = yoklama.pencereSayimi(liste)
    expect(s.toplam).toBe(7)
    expect(s.pencereler).toEqual([
      { pid: 100, alt: 3 },
      { pid: 200, alt: 1 },
    ])
    expect(s.pencereToplam).toBe(4)
  })

  it('döngülü ya da kendi kendine ebeveyn listede sonsuz döngüye girmez', () => {
    const liste = [pencere(10), cocuk(11, 10), cocuk(10, 11), cocuk(12, 12)]
    const s = yoklama.pencereSayimi(liste)
    expect(s.pencereler[0]).toMatchObject({ pid: 10 })
  })

  it('pencere eşiği (80) ve toplam eşiği (400) altında SUSAR, üstünde KONUŞUR', () => {
    const taban = { ts: SIMDI, bosMb: 9000, surecler: [] as unknown[] }
    expect(yoklama.satir({ ...taban, pencereler: [{ pid: 7, alt: 79 }], pencereToplam: 300 }, SIMDI)).toBeNull()
    const kalabalik = yoklama.satir({ ...taban, pencereler: [{ pid: 7, alt: 80 }], pencereToplam: 300 }, SIMDI)
    expect(kalabalik).toMatch(/^⚠BELLEK: /)
    expect(kalabalik).toMatch(/KALABALIK pencere \(>= 80 surec\): claude 7 altinda 80/)
    expect(yoklama.satir({ ...taban, pencereler: [], pencereToplam: 400 }, SIMDI)).toMatch(/pencereler toplam 400 surec/)
  })
})
