import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * INV-BOARD-1 · Çok-oturum panosu değişmezleri (kalıcı bekçi).
 *
 * `scripts/board/board.cjs` üç Claude Code oturumunu (controller ikizleri + ortak worker)
 * aynı repoda koordine eder: hangi şerit hangi glob'u talep etmiş, kim kime not bırakmış.
 * Bu katman bir gecede İKİ kez kritik hataya yol açtı ve her seferinde düzeltme atılabilir
 * bir "probe" script'iyle kanıtlanıp SİLİNDİ — yani mantığın repoda tek kalıcı testi hiç
 * olmadı. `findConflict`'i biri "sadeleştirirse" (ör. kıdem kontrolünü kaldırırsa) karşılıklı
 * kilit (her iki oturum da bloklanır → hiçbiri yazamaz) sessizce geri gelir ve hiçbir mevcut
 * kapı bunu fark etmez.
 *
 * Bu bir DAVRANIŞ testidir (statik tarama değil): modülü gerçekten yükleyip fonksiyonlarını
 * çağırıyoruz. `BOARD_DIR` modül üst-seviyesinde (require anında) `process.env`'den okunuyor
 * — bu yüzden her testte TAZE bir modül örneği gerekir (require cache temizlenir), yoksa
 * testler birbirinin geçici pano dizinini miras alır ve sessizce birbirine sızar.
 *
 * NOT — bilinçli olarak `node:fs`/`node:path`/`node:os` KULLANILMIYOR: bu ortamda yerel
 * `node_modules/@types/node` paketi bozuk (`fs`/`path` modül bildirimleri `_fs`/`_path` adına
 * kaymış — ayrı bir ortam arızası, kaynak kodun kusuru değil) ve `tsc` bu iki modülü
 * çözemiyor. Bunun yerine board.cjs'in KENDİ genel API'si (`append`) olayları yazar (dosyaya
 * elle dokunmayız — modül kendi `ensureDir()`/`fs.appendFileSync`'ini zaten kullanıyor) ve
 * geçici dizin adları `process.env`/`process.pid`/`Date.now()` ile düz string birleştirmeyle
 * üretilir. Tek gerçek disk-yazımı ihtiyacı (item 8, scratch git reposu) `git init <path>`
 * ile karşılanır — git, var olmayan hedef dizini kendisi oluşturur, ayrıca `mkdirSync` gerekmez.
 */

interface BoardClaim {
  sid: string
  lane: string
  globs: string[]
  ts: string
  heartbeat: string
  ttlMs: number
}

interface BoardConflict {
  claim: BoardClaim
  glob: string
  rel: string
}

interface BoardNote {
  ts: string
  sid: string
  type: 'note'
  to?: string
  text: string
}

interface BoardModule {
  append: (sid: string, event: Record<string, unknown>) => void
  liveClaims: (now?: number) => BoardClaim[]
  findConflict: (filePath: string, sid: string, repoRoot?: string) => BoardConflict | null
  notesFor: (sid: string, lane: string, events?: Record<string, unknown>[]) => BoardNote[]
  markSeen: (sid: string, notes: BoardNote[]) => void
  globToRegExp: (glob: string) => RegExp
  toRepoRelative: (filePath: string, repoRoot?: string) => string
}

const require = createRequire(import.meta.url)
const BOARD_MODULE_PATH = require.resolve('../../../scripts/board/board.cjs')

/**
 * Modülü TAZE yükle. `VENTHUB_BOARD_DIR`'i require'dan ÖNCE ayarlıyoruz ve require cache'ini
 * temizliyoruz — board.cjs `BOARD_DIR`'i modül gövdesinde bir kez okuyor, cache temizlenmezse
 * ikinci test birincinin geçici dizinini miras alır.
 */
function loadBoard(boardDir: string): BoardModule {
  process.env.VENTHUB_BOARD_DIR = boardDir
  delete require.cache[BOARD_MODULE_PATH]
  return require(BOARD_MODULE_PATH) as BoardModule
}

function isoAgo(msAgo: number): string {
  return new Date(Date.now() - msAgo).toISOString()
}

/** Sistem geçici klasörü — `node:os` yerine düz `process.env` okuması. */
/**
 * Geçici dizin kökü — PLATFORMDAN BAĞIMSIZ olmak ZORUNDA.
 *
 * İlk sürüm `'C:/tmp'` fallback'i taşıyordu ve yerelde (Windows, `TEMP` hep dolu) sorunsuz
 * geçti; CI Linux runner'ında `TEMP`/`TMP` yok, `TMPDIR` de her zaman set edilmiyor → fallback
 * devreye girdi ve `C:/tmp/...` orada MUTLAK yol değil, cwd'ye göreli bir dizin adı oldu.
 * Sonuç: `git rev-parse --show-toplevel` başka bir kök döndürdü, `toRepoRelative` eşleşmedi ve
 * test yalnız CI'da kırmızı yandı. GitHub runner'ı `RUNNER_TEMP` verir; POSIX fallback `/tmp`.
 */
function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let dirCounter = 0
/** Her çağrıda BENZERSİZ bir geçici yol üretir (henüz yaratılmaz — ihtiyaç sahibi yaratır). */
function uniqueTempDir(prefix: string): string {
  dirCounter += 1
  return `${tmpRoot()}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}-${dirCounter}`
}

let boardDir: string
let originalEnv: string | undefined

beforeEach(() => {
  originalEnv = process.env.VENTHUB_BOARD_DIR
  // Dizini BURADA yaratmıyoruz: board.cjs'in append()/readEvents()'i ensureDir() ile
  // kendisi yaratıyor — testin fs'e dokunmasına gerek yok.
  boardDir = uniqueTempDir('venthub-board-test')
})

afterEach(() => {
  if (originalEnv === undefined) delete process.env.VENTHUB_BOARD_DIR
  else process.env.VENTHUB_BOARD_DIR = originalEnv
  // Kasıtlı olarak temizlenmiyor: pano dizinleri board.cjs'in kendi tasarımı gereği zaten
  // anlık/prunable (bkz. PRUNE_MS) ve testin fs'e dokunmaması tercih edildi (yukarıdaki NOT).
})

describe('INV-BOARD-1 · "en erken kazanır"', () => {
  it('kıdemli talep engellenmez, geç gelen engellenir — İKİSİ de bloklanırsa bu tam olarak yaşanan karşılıklı-kilit hatasıdır', () => {
    const board = loadBoard(boardDir)
    board.append('session-a', { ts: isoAgo(5000), type: 'claim', lane: 'lane-a', globs: ['supabase/migrations/**'] })
    board.append('session-b', { ts: isoAgo(1000), type: 'claim', lane: 'lane-b', globs: ['supabase/migrations/**'] })

    const target = '/repo/supabase/migrations/20260101_test.sql'
    const repoRoot = '/repo'

    const seniorResult = board.findConflict(target, 'session-a', repoRoot)
    const juniorResult = board.findConflict(target, 'session-b', repoRoot)

    expect(
      seniorResult,
      'kıdemli oturum (erken ts) engellenmemeli — engellenirse geç gelen bir talep onu bloklamış demektir (karşılıklı kilit)',
    ).toBeNull()
    expect(
      juniorResult,
      'geç gelen oturum kıdemli talebe çarpmalı — çarpmazsa "en erken kazanır" kuralı sessizce kaybolmuş, iki oturum aynı yola birden yazabilir demektir',
    ).not.toBeNull()
    expect(juniorResult?.claim.sid).toBe('session-a')
  })
})

describe('INV-BOARD-1 · kendi şeridi engel değildir', () => {
  it('bir oturum kendi talep ettiği globa yazabilir', () => {
    const board = loadBoard(boardDir)
    board.append('session-a', { ts: isoAgo(1000), type: 'claim', lane: 'lane-a', globs: ['src/lib/**'] })

    const result = board.findConflict('/repo/src/lib/services/x.ts', 'session-a', '/repo')

    expect(result, 'oturum kendi talep ettiği şeride yazarken KENDİ talebiyle çakışmamalı').toBeNull()
  })
})

describe('INV-BOARD-1 · ikinci claim globları birleştirir + kıdemi korur', () => {
  it('aynı oturumun ikinci claim\'i globları birleştirir, ilk ts kıdem olarak kalır', () => {
    const board = loadBoard(boardDir)
    const first = isoAgo(10000)
    board.append('session-a', { ts: first, type: 'claim', lane: 'lane-a', globs: ['src/lib/**'] })
    board.append('session-a', { ts: isoAgo(2000), type: 'claim', lane: 'lane-a', globs: ['src/views/**'] })

    const live = board.liveClaims()
    const mine = live.find(c => c.sid === 'session-a')

    expect(mine, 'birleşmiş talep liveClaims() içinde bulunamadı').toBeDefined()
    expect(
      mine?.ts,
      'ikinci claim kıdemi (ilk ts) EZMEMELİ — ezerse "şeridimi genişleteyim" hareketi eskisini sessizce bırakmış olur',
    ).toBe(first)
    expect(new Set(mine?.globs)).toEqual(new Set(['src/lib/**', 'src/views/**']))

    // Kıdemin GERÇEKTEN korunduğunu, sadece ts alanının değil davranışın da doğruladığını göster:
    // eski glob'a giren geç bir rakip hâlâ session-a'nın (daha eski) kıdemine göre değerlendirilmeli.
    board.append('session-b', { ts: isoAgo(500), type: 'claim', lane: 'lane-b', globs: ['src/lib/**'] })
    const conflict = board.findConflict('/repo/src/lib/services/x.ts', 'session-b', '/repo')

    expect(
      conflict?.claim.sid,
      'genişletilmiş talebin eski globu, korunan kıdem sayesinde hâlâ öncelikli olmalı',
    ).toBe('session-a')
  })
})

describe('INV-BOARD-1 · release düşürür, heartbeat diriltmez', () => {
  it('release sonrası gelen heartbeat şeridi geri getirmez', () => {
    const board = loadBoard(boardDir)
    board.append('session-a', { ts: isoAgo(5000), type: 'claim', lane: 'lane-a', globs: ['src/lib/**'] })
    board.append('session-a', { ts: isoAgo(3000), type: 'release' })
    board.append('session-a', { ts: isoAgo(1000), type: 'heartbeat' })

    const live = board.liveClaims()

    expect(
      live.find(c => c.sid === 'session-a'),
      'release edilmiş şerit sonraki heartbeat ile DİRİLMEMELİ — dirilirse bırakılan iş yanlışlıkla hâlâ kilitli görünür',
    ).toBeUndefined()
  })
})

describe('INV-BOARD-1 · TTL', () => {
  it('TTL\'i dolmuş (bayat) talep yeni bir oturumu engellemez', () => {
    const board = loadBoard(boardDir)
    // Kısa ttlMs ile yazıyoruz ki test gerçek saatlerce beklemek zorunda kalmasın.
    board.append('session-a', { ts: isoAgo(5000), type: 'claim', lane: 'lane-a', globs: ['src/lib/**'], ttlMs: 1000 })

    const live = board.liveClaims()
    expect(
      live.find(c => c.sid === 'session-a'),
      'TTL dolmuş talep hâlâ canlı görünüyor — ölü/çökmüş bir oturum diğerlerini süresiz kilitleyebilir',
    ).toBeUndefined()

    const result = board.findConflict('/repo/src/lib/services/x.ts', 'session-b', '/repo')
    expect(result, 'TTL dolmuş talep yeni bir oturumu hâlâ engelliyor').toBeNull()
  })
})

describe('INV-BOARD-1 · notesFor + markSeen', () => {
  it('not bir kez teslim edilir, markSeen sonrası ikinci turda tekrar gelmez', () => {
    const board = loadBoard(boardDir)
    board.append('session-a', { ts: isoAgo(2000), type: 'note', to: 'session-b', text: 'merhaba' })

    const firstRound = board.notesFor('session-b', 'lane-b')
    expect(firstRound.length, 'not ilk turda teslim edilmedi').toBe(1)
    expect(firstRound[0].text).toBe('merhaba')

    board.markSeen('session-b', firstRound)
    const secondRound = board.notesFor('session-b', 'lane-b')

    expect(
      secondRound,
      'markSeen sonrası aynı not TEKRAR geldi — brifingin tek değeri olan "sessizlik kuralı" bozulmuş demektir (gürültü birikir, katman zamanla okunmaz olur)',
    ).toEqual([])
  })
})

describe('INV-BOARD-1 · glob doğruluğu', () => {
  it('src/** derin yolu yakalar, komşu önek srcfoo/ yakalamaz', () => {
    const board = loadBoard(boardDir)
    const re = board.globToRegExp('src/**')

    expect(re.test('src/a/b/c.ts'), 'src/** derin bir alt yolu (src/a/b/c.ts) yakalamalı').toBe(true)
    expect(
      re.test('srcfoo/x.ts'),
      'src/** komşu önekli bir yolu (srcfoo/x.ts) YAKALAMAMALI — yakalarsa glob sınır denetimi olmadan geniş eşleşiyor, alakasız bir şeridi yanlışlıkla engelleyebilir',
    ).toBe(false)
  })
})

describe('INV-BOARD-1 · toRepoRelative git kökünden çözer', () => {
  it('cwd BAŞKA bir repoda olsa bile, dosyanın KENDİ git kökünden repo-göreli yol üretir', () => {
    const board = loadBoard(boardDir)
    // Vitest 'threads' havuzunda process.chdir() worker'larda desteklenmiyor (Node kısıtı);
    // bu yüzden global cwd'yi değiştirmek yerine AYRI bir scratch git reposu kuruyoruz.
    // process.cwd() test sırasında gerçek venthub-hvac kökü olarak KALIR — scratch reponun
    // hiçbir ilgisi yok. Sonuç doğruysa çözüm repoRootFor() (dosyanın kendi git kökü)
    // üzerinden geliyor demektir, process.cwd() üzerinden DEĞİL.
    const scratchRepo = uniqueTempDir('venthub-board-scratch-repo')
    // `git init <path>` var olmayan hedef dizini KENDİSİ yaratır — mkdirSync gerekmez.
    execFileSync('git', ['init', '-q', scratchRepo])
    const filePath = `${scratchRepo}/foo.ts`

    const rel = board.toRepoRelative(filePath)

    expect(
      rel,
      'repo-göreli yol scratch reponun KENDİ köküne göre çözülmedi — cwd\'ye bağımlılık geri gelmiş olabilir (bkz. board.cjs repoRootFor yorumu)',
    ).toBe('foo.ts')
  })
})
