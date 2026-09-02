import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn, `vitest.config.ts`).
 * Ölçüm 2026-08-30, boş makine: gövde **2,17 sn**, 8 alt süreç çağrısı.
 * Yük altında gözlenen amplifikasyon ~27× (tek gözlem: `eol` 1,47 → 39,9 sn).
 * 60 sn'yi aşan kırmızı GERÇEK aşımdır. Gerekçe: `docs/standards/fleet-mechanism-standard.md` §13.
 */
vi.setConfig({ testTimeout: 60_000 })

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

interface BoardClaimHali extends BoardClaim {
  bayat: boolean
  yasDk: number | null
}

interface BoardModule {
  append: (sid: string, event: Record<string, unknown>) => void
  readEvents: () => { sid?: string; type?: string }[]
  tumTalepler: (now?: number) => BoardClaimHali[]
  summary: (sid: string) => string
  PANOYA_YAZAN_FIILLER: Set<string>
  liveClaims: (now?: number) => BoardClaim[]
  findConflict: (filePath: string, sid: string, repoRoot?: string) => BoardConflict | null
  notesFor: (sid: string, lane: string, events?: Record<string, unknown>[]) => BoardNote[]
  markSeen: (sid: string, notes: BoardNote[]) => void
  globToRegExp: (glob: string) => RegExp
  toRepoRelative: (filePath: string, repoRoot?: string) => string
  resolveNoteTarget: (rawTo?: string) => { ok: boolean; to?: string; how?: string; reason?: string; valid?: string[] }
  /**
   * Kimligin BICIMINI dogrular. resolveNoteTarget HEDEFI (--to) dogruluyordu; bu, GONDERENIN
   * kimligini (--sid) dogrular — olculmus vaka icin INV-BOARD-3 icindeki BOZUK kimlik kolu.
   */
  sidDogrula: (sid: string) => { ok: boolean; tur?: string; sebep?: string; oneri?: string }
  /** §23: TARAMA (gözcü süreci okuyor mu) ve TESLIM (bildirim KONUŞMAYA ulaştı mı) AYRI ölçümler. */
  taramaDurumu: (sid: string, now: number, esikTur?: number) => string
  teslimDurumu: (sid: string, now: number) => number | string
  esikleriOku: (cetvelYolu?: string) => Record<string, number> | null
  yoklama: (now?: number) => string
  /** §23: yoklamanın eksenleri TEK KAYNAK — başlık ve `--help` bundan ÜRETİLİR. */
  EKSENLER: { ad: string; aciklama: string }[]
  SAYI_SOZU: Record<number, string>
  eksenOzeti: () => string
  kullanimMetni: () => string
}

/**
 * `execFileSync` başarısız çıkışta fırlatır; kodu ve stderr'i buradan okuruz (`any` yasak).
 * `encoding: 'utf8'` verildiği için akışlar string gelir — `Buffer` tipine referans YOK
 * (bu ortamda `@types/node` bozuk, dosya başındaki NOT'a bakınız).
 */
interface ExecFailure {
  status?: number
  stderr?: string
  stdout?: string
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

/**
 * INV-BOARD-2 · Not adresleme SESSİZ KAYBI (T064-VH).
 *
 * `notesFor` hedefi TAM EŞİTLİKLE arıyor. Bu yüzden `--to herkes` (düz metin) ve
 * `--to <8-hane>` (kısaltma) HİÇBİR oturumla eşleşmiyordu; komut yine de "not bırakıldı"
 * basıyordu. 2026-08-16'da ölçüldü: **110 notun 49'u (%45) hiç teslim edilmedi** —
 * `herkes` 37 · `ALL` 1 · 8-hane kısaltma 10 · geçersiz ad 1. Kaybolanların arasında bir
 * şeridin diğer üçünü bloklayan bir bulgusu da vardı; kimse görmedi çünkü katman
 * ÇALIŞIYOR GİBİ YAPIYORDU.
 *
 * Çözüm GÖNDERİM ANINDA çözmektir (okuma anında değil): şerit adı ve kısaltma tam sid'e
 * çevrilip KALICI yazılır. Böylece şerit adı değişse (`PRICING`→`PRICING-STOK`,
 * `EDGE`→`EDGE-REFUND`, `ADMIN-UX`→`ADMIN-OPS` — üçü de aynı gün oldu) veya şerit
 * bırakılsa bile not teslim edilebilir kalır.
 *
 * ⚠ BİLİNÇLİ KAPSAM DIŞI: diskteki 49 eski kayıp not GERİYE TESLİM EDİLMEZ. `notesFor`
 * hâlâ katıdır; yalnız gönderim normalize eder. Aksi hâlde tek turda 38 bayat not boşalır
 * ve append-only olay günlüğü geriye dönük yeniden yorumlanmış olur. Sahipleri yeniden
 * gönderiyor (üç şerit 2026-08-16'da öyle yaptı).
 */
describe('INV-BOARD-2 · not adresleme teslim edilebilir olmalı', () => {
  const SID_A = 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa'
  const SID_B = 'bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb'
  const SID_C = 'cccccccc-3333-4333-8333-cccccccccccc'

  /** Panoyu üç oturumla doldur (hedef çözümü sid/şerit geçmişini diskten okur). */
  function seed(board: BoardModule): void {
    board.append(SID_A, { ts: isoAgo(9000), type: 'claim', lane: 'ALFA', globs: ['src/a/**'] })
    board.append(SID_B, { ts: isoAgo(8000), type: 'claim', lane: 'BETA', globs: ['src/b/**'] })
    board.append(SID_C, { ts: isoAgo(7000), type: 'claim', lane: 'GAMA', globs: ['src/c/**'] })
  }

  /** CLI'yi gerçekten koştur (exit kodu ancak süreç sınırında ölçülebilir). */
  function runNote(args: string[]): { status: number; stdout: string; stderr: string } {
    try {
      const stdout = execFileSync('node', [BOARD_MODULE_PATH, 'note', ...args], {
        encoding: 'utf8',
        env: { ...process.env, VENTHUB_BOARD_DIR: boardDir },
      })
      return { status: 0, stdout, stderr: '' }
    } catch (e) {
      const f = e as ExecFailure
      return { status: typeof f.status === 'number' ? f.status : -1, stdout: f.stdout ?? '', stderr: f.stderr ?? '' }
    }
  }

  it('"--to herkes" BROADCAST olarak yazılır ve alakasız bir oturuma teslim edilir', () => {
    const board = loadBoard(boardDir)
    seed(board)

    const r = runNote(['--sid', SID_A, '--to', 'herkes', '--text', 'yayin-notu'])
    expect(r.status, `"herkes" reddedilmemeli, broadcast'e çevrilmeli. stderr: ${r.stderr}`).toBe(0)

    const delivered = board.notesFor(SID_C, 'GAMA')
    expect(
      delivered.map(n => n.text),
      '"--to herkes" ile gönderilen not teslim EDİLMEDİ — tam olarak 37 notun kaybolduğu hata bu (board.cjs notesFor tam-eşitlik)',
    ).toContain('yayin-notu')
    expect(delivered.find(n => n.text === 'yayin-notu')?.to ?? '', 'broadcast notunun to alanı BOŞ yazılmalı').toBe('')
  })

  it('8-hane kısaltma tam sid\'e çözülür: hedefe gider, ÜÇÜNCÜ oturuma GİTMEZ', () => {
    const board = loadBoard(boardDir)
    seed(board)

    const r = runNote(['--sid', SID_A, '--to', SID_B.slice(0, 8), '--text', 'kisaltma-notu'])
    expect(r.status, `8-hane kısaltma çözülmeli. stderr: ${r.stderr}`).toBe(0)

    expect(
      board.notesFor(SID_B, 'BETA').map(n => n.text),
      'kısaltmayla adreslenen not hedefe teslim edilmedi — 10 notun kaybolduğu hata bu',
    ).toContain('kisaltma-notu')
    expect(
      board.notesFor(SID_C, 'GAMA').map(n => n.text),
      'hedefli not ÜÇÜNCÜ bir oturuma da gitmiş — çözüm broadcast\'e düşmüş, yani gizlilik/gürültü sınırı yok',
    ).not.toContain('kisaltma-notu')
  })

  it('şerit adı sid\'e çözülür ve şerit BIRAKILDIKTAN sonra bile teslim edilir', () => {
    const board = loadBoard(boardDir)
    seed(board)

    const r = runNote(['--sid', SID_A, '--to', 'BETA', '--text', 'serit-notu'])
    expect(r.status, `şerit adı çözülmeli. stderr: ${r.stderr}`).toBe(0)

    // Alıcı şeridi bırakıyor (ve adını değiştirip yeniden alıyor) — gerçekte olan tam bu.
    board.append(SID_B, { ts: isoAgo(100), type: 'release' })

    expect(
      board.notesFor(SID_B, 'BETA-YENI-AD').map(n => n.text),
      'şerit bırakıldı/yeniden adlandırıldı diye not teslim EDİLEMEZ hâle geldi — gönderimde sid\'e çözülmediği için (eski davranış okuma anında lane adına bakıyordu)',
    ).toContain('serit-notu')
  })

  it('BİLİNMEYEN hedefte exit 1 verir ve HİÇBİR ŞEY yazmaz (sahte başarı yok)', () => {
    const board = loadBoard(boardDir)
    seed(board)
    const before = board.notesFor(SID_C, 'GAMA').length

    const r = runNote(['--sid', SID_A, '--to', 'boyle-bir-hedef-yok', '--text', 'kayip-olacak-not'])

    expect(
      r.status,
      'bilinmeyen hedef SESSİZCE kabul edildi (exit 0) — "not bırakıldı" yazıp not\'u yok eden davranış tam budur',
    ).not.toBe(0)
    expect(r.stderr, 'hata mesajı geçerli hedefleri göstermeli, yoksa gönderen neyi yanlış yazdığını bilemez').toContain('geçerli hedefler')
    expect(
      board.notesFor(SID_C, 'GAMA').length,
      'reddedilen not YİNE DE panoya yazılmış — kısmi yazım en kötüsü: ne teslim edilir ne de gönderen uyarılır',
    ).toBe(before)
  })

  it('BELİRSİZ kısaltma exit 1 verir — yanlış oturuma teslim etmekten iyidir', () => {
    const board = loadBoard(boardDir)
    board.append('dddddddd-1111-4111-8111-000000000001', { ts: isoAgo(9000), type: 'claim', lane: 'D1', globs: ['x/**'] })
    board.append('dddddddd-1111-4111-8111-000000000002', { ts: isoAgo(8000), type: 'claim', lane: 'D2', globs: ['y/**'] })

    const r = runNote(['--sid', SID_A, '--to', 'dddddddd', '--text', 'belirsiz'])

    expect(r.status, 'iki oturumla eşleşen kısaltma kabul edildi — not YANLIŞ oturuma gitmiş olabilir').not.toBe(0)
    expect(r.stderr).toContain('tam UUID')
  })

  it('resolveNoteTarget: broadcast kelimeleri büyük/küçük harften bağımsız tanınır', () => {
    const board = loadBoard(boardDir)
    seed(board)

    for (const word of ['herkes', 'HERKES', 'All', 'everyone', 'tümü']) {
      const res = board.resolveNoteTarget(word)
      expect(res.ok, `"${word}" broadcast sayılmadı`).toBe(true)
      expect(res.to, `"${word}" broadcast ise to BOŞ olmalı`).toBe('')
    }
  })
})

/**
 * INV-BOARD-3 · Kimliksiz yazım YOK (T079-VH).
 *
 * CLI, oturum kimliğini `--sid > CLAUDE_SESSION_ID > os.hostname() + '-manual'` sırasıyla
 * çözüyordu. Üçüncü basamak sessiz bir arıza üretti: **Bash kabuğunda `CLAUDE_SESSION_ID`
 * tanımlı değil**, dolayısıyla `--sid` verilmeyen her çağrı `events.<makine-adı>-manual.jsonl`
 * dosyasına yazıyor, komut ise `exit 0` verip "not bırakıldı" basıyordu. Gönderen teslim
 * edildiğini sanıyor; alıcı o dosyayı izlemediği için hiç görmüyor.
 *
 * 2026-08-17'de ölçüldü: 34 kayıt hayalet dosyaya düşmüş. Bunlardan biri CANLI bir `claim`di
 * ve etkisi nottan daha ağır: pano aynı şeridi İKİ ayrı sahiple gösterdi ve kıdem hayalete
 * geçtiği için şerit-çakışma kontrolü GERÇEK sahibi kendi dosyalarında engelleyebilir hâle
 * geldi — yani sessiz kayıp, sessiz kilide dönüşebiliyor.
 *
 * Karar: yazan fiillerde kimlik ZORUNLU, yoksa gürültülü hata + HİÇ yazmama. Muafiyet ADLA
 * verilir (`--sid recep-manual`). `who` yazmadığı için koşmaya devam eder ama uyarır; bu
 * asimetri bilinçlidir ve aşağıda kilitlenmiştir.
 *
 * ⚠ Bu testler `CLAUDE_SESSION_ID`'yi alt sürecin ortamından SİLER. Silinmezse Claude Code
 * içinde koşarken değişken dolu gelir, CLI ikinci basamaktan kimlik bulur ve testler kusur
 * geri konsa bile yeşil kalır — ölçüm aracının kendisi kör olur.
 */
describe('INV-BOARD-3 · kimliksiz yazım yok', () => {
  /** Yazan fiilin kimlik dışındaki asgari argümanları (kimlik kapısı bunlardan ÖNCE çalışmalı). */
  const EK_ARGS: Record<string, string[]> = {
    claim: ['--globs', 'src/x/**'],
    heartbeat: [],
    release: [],
    note: ['--text', 'hayalete-dusmemeli'],
  }
  /** Tanınmayan (sonradan eklenmiş) bir fiil için: her iki argümanı da ver, kapsam dışı kalmasın. */
  const VARSAYILAN_EK_ARGS = ['--globs', 'src/x/**', '--text', 'hayalete-dusmemeli']

  /** CLI'yi kimlik ortam değişkeni OLMADAN koştur. */
  function runCli(args: string[], opts: { sidEnv?: string } = {}): { status: number; stdout: string; stderr: string } {
    // Ortamı GİRDİ ÇİFTLERİYLE kuruyoruz: bu repoda `ProcessEnv` bildirimi genişletilmiş ve
    // indeks imzası YOK, o yüzden `delete env.CLAUDE_SESSION_ID` tip hatası verir.
    const ciftler = Object.entries(process.env).filter(([k]) => k !== 'CLAUDE_SESSION_ID')
    if (opts.sidEnv) ciftler.push(['CLAUDE_SESSION_ID', opts.sidEnv])
    ciftler.push(['VENTHUB_BOARD_DIR', boardDir])
    const env = Object.fromEntries(ciftler) as typeof process.env
    // `execFileSync` DEĞİL `spawnSync`: ilki BAŞARILI çıkışta yalnız stdout döndürür, yani
    // "koştu ama uyardı mı?" sorusunu ölçemez. İlk sürümü öyle yazdım ve `who` testi
    // aracın körlüğü yüzünden kırmızı yandı — kusur koddaydı sanılabilirdi.
    const r = spawnSync('node', [BOARD_MODULE_PATH, ...args], { encoding: 'utf8', env })
    return { status: typeof r.status === 'number' ? r.status : -1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
  }

  it('YAZAN her fiil kimliksiz çağrıda exit 1 verir ve panoya HİÇBİR ŞEY yazmaz', () => {
    const board = loadBoard(boardDir)
    // Listeyi modülden okuyoruz: buraya yeni bir yazan fiil eklenirse kapı onu kendiliğinden
    // kapsar. Kopyalanmış bir liste, kaynak büyüdüğünde sessizce kör kalırdı.
    const fiiller = [...board.PANOYA_YAZAN_FIILLER]
    expect(fiiller.length, 'yazan fiil listesi BOŞ geldi — kapı hiçbir şey ölçmüyor olurdu (vacuous)').toBeGreaterThan(0)

    for (const verb of fiiller) {
      const r = runCli([verb, ...(EK_ARGS[verb] ?? VARSAYILAN_EK_ARGS)])

      expect(
        r.status,
        `"${verb}" kimliksiz koştu ve BAŞARILI döndü — hayalet oturum üretip "yaptım" diyen davranış tam budur (T079-VH)`,
      ).not.toBe(0)
      expect(
        r.stderr,
        `"${verb}" hatası çözümü göstermiyor; operatör neyi eklemesi gerektiğini bilemez`,
      ).toContain('--sid')
      expect(
        board.readEvents().length,
        `"${verb}" reddedildiği HÂLDE panoya yazmış — hangi kimliğe yazdığı önemli değil, kısmi yazım en kötüsü: ne teslim edilir ne de gönderen uyarılır`,
      ).toBe(0)
    }
  })

  it('KAPSAM DARALTMASI KİLİTLİ: yazan fiil listesi bu dördünü içermek ZORUNDA', () => {
    const board = loadBoard(boardDir)
    // Yukarıdaki test listeyi modülden okuyor: bu, listeye EKLEME yapıldığında kapının
    // kendiliğinden büyümesini sağlar ama DARALTMAYA karşı korumaz — liste küçülünce test de
    // küçülür ve sessizce yeşil kalır. Sabotaj turunda tam bu oldu (liste ['note']'a indirildi,
    // 19/19 yeşil). Taban burada ADLARIYLA sabitlenmiştir.
    for (const verb of ['claim', 'heartbeat', 'release', 'note']) {
      expect(
        board.PANOYA_YAZAN_FIILLER.has(verb),
        `"${verb}" yazan fiil listesinden ÇIKARILMIŞ — o fiil yine kimliksiz koşabilir, kapı ise yeşil kalır`,
      ).toBe(true)
    }
  })

  it('kimlik makine adından TÜRETİLMEZ — hayalet oturum dosyası oluşmaz', () => {
    const board = loadBoard(boardDir)
    runCli(['note', '--text', 'hayalete-dusmemeli'])
    runCli(['claim', '--lane', 'HAYALET', '--globs', 'src/x/**'])

    const sidler = board.readEvents().map(e => String(e.sid ?? ''))
    expect(
      sidler.filter(s => s.endsWith('-manual')),
      'kimlik yine makine adı + "-manual" ile üretilmiş: bu dosyayı hiçbir oturum izlemiyor, yani kayıt yazılmış ama YOK sayılır',
    ).toEqual([])
  })

  it('MUAFİYET ADLA: elle verilen --sid çalışır ve TAM O kimliğe yazar', () => {
    const board = loadBoard(boardDir)
    const r = runCli(['claim', '--sid', 'recep-manual', '--lane', 'ELLE', '--globs', 'src/x/**'])

    expect(r.status, `açıkça verilen kimlik reddedildi — kapı insanın elle çalışmasını da kapatmış olur. stderr: ${r.stderr}`).toBe(0)
    expect(
      board.liveClaims().map(c => c.sid),
      'talep açıkça verilen kimliğe yazılmadı',
    ).toContain('recep-manual')
  })

  /**
   * BOZUK KİMLİKLE YAZIM YOK — kimliğin VARLIĞI yetmez, BİÇİMİ de doğrulanır.
   *
   * ⚠ ÖLÇÜLMÜŞ VAKA (2026-08-20, 2026-08-23'te TEKRARLADI): bir şeridin `--sid`'ine altı Kiril
   * harf karıştı. Komut BAŞARILI döndü ve "not bırakıldı" yazdı; ama `sessionFile()` geçersiz
   * karakterleri `_` ile değiştirdiği için not `events.99fa366e-d8bb-4______61.jsonl` adlı YENİ
   * bir dosyaya düştü. Gönderen teslim edildiğini sandı, ALICI HİÇ GÖRMEDİ. Aynı sınıf 08-23'te
   * GÖRSEL şeridinde yeniden yaşandı (`events.*969a`) — yani tek seferlik bir sürçme değil.
   *
   * Sınıf: SAHTE-YEŞİL. `--to` için 2026-08-16'da kapatılmıştı (`resolveNoteTarget`); `--sid`
   * tarafı açık kalmıştı. Kapı VARDI, KAPSAMI eksikti.
   */
  it('BOZUK kimlikle YAZAN her fiil reddedilir ve panoya HİÇBİR ŞEY yazmaz', () => {
    const board = loadBoard(boardDir)
    // Gerçek vakanın kendisi: latin görünümlü ama Kiril kod noktaları (U+0432 U+0437 U+0430).
    const bozukSid = '99fa366e-d8bb-4взаимо61'
    const fiiller = [...board.PANOYA_YAZAN_FIILLER]
    expect(fiiller.length, 'yazan fiil listesi BOŞ — kapı hiçbir şey ölçmüyor olurdu (vacuous)').toBeGreaterThan(0)

    for (const verb of fiiller) {
      const r = runCli([verb, '--sid', bozukSid, ...(EK_ARGS[verb] ?? VARSAYILAN_EK_ARGS)])

      expect(
        r.status,
        `"${verb}" BOZUK kimlikle koştu ve BAŞARILI döndü — not hayalet dosyaya düşer, gönderen "bırakıldı" cevabı alır, alıcı hiç görmez`,
      ).not.toBe(0)
      expect(
        board.readEvents().length,
        `"${verb}" reddedildiği HÂLDE panoya yazmış — kısmi yazım en kötüsü: ne teslim edilir ne de gönderen uyarılır`,
      ).toBe(0)
    }
  })

  it('red MESAJI bozuk karakteri KOD NOKTASIYLA gösterir — operatör neyi düzelteceğini görmeli', () => {
    loadBoard(boardDir)
    const r = runCli(['note', '--sid', '99fa366e-d8bb-4вм61', '--text', 'hayalete-dusmemeli'])

    // Yalnız "reddedildi" demek yetmez: Kiril "в" ile latin "b" EKRANDA ayırt edilemez.
    // Kod noktası basılmazsa operatör kimliği tekrar tekrar aynı yanlış biçimde yazar.
    expect(
      r.stderr,
      `red gerekçesi kod noktası içermiyor; görsel olarak ayırt edilemeyen karakteri operatör bulamaz. stderr: ${r.stderr}`,
    ).toMatch(/U\+04[0-9A-F]{2}/)
  })

  it('KAÇIŞ KAPISI YOK: hiçbir ek bayrak bozuk kimliği geçiremez', () => {
    const board = loadBoard(boardDir)
    // İlk sürümde `--yeni-kimlik` bayrağı vardı ve sabotaj testinde bozuk kimliği GEÇİRDİ —
    // yani kaçış kapısı, kapının kapattığı deliği aynen geri açıyordu. Bayrak kaldırıldı;
    // bu test onun geri gelmesini yakalar.
    for (const bayrak of ['--yeni-kimlik', '--force', '--zorla']) {
      const r = runCli(['note', '--sid', 'xвx', '--text', 'hayalete-dusmemeli', bayrak])
      expect(
        r.status,
        `"${bayrak}" bayrağı bozuk kimliği GEÇİRDİ — kaçış kapısı kapının varlık sebebini yiyor`,
      ).not.toBe(0)
    }
    expect(board.readEvents().length, 'bayraklı çağrıların biri panoya yazmış').toBe(0)
  })

  it('KAPI YALNIZ YAZAN FİİLLERDE: "who" bozuk kimlikle de KOŞAR (okuma kapanmaz)', () => {
    loadBoard(boardDir)
    const r = runCli(['who', '--sid', '99fa366e-d8bb-4вм61'])

    // Asimetri bilinçli: bozuk kimlik YANLIŞ DOSYAYA YAZAR, ama okumayı bozmaz. Kapıyı
    // okuyan fiillere de yaymak, kimliği bozulmuş bir şeridi panodan tamamen kör bırakırdı.
    expect(r.status, '"who" bozuk kimlik yüzünden engellendi — pano okuma gereksiz yere kapatılmış').toBe(0)
  })

  it('KAPI VACUOUS DEĞİL: geçerli kimlikler GEÇER (hepsini reddeden kapı da "yeşil" görünür)', () => {
    const board = loadBoard(boardDir)

    expect(board.sidDogrula('ac03ce11-c975-478d-bf30-66afb7c00f15').ok, 'geçerli uuid reddedildi').toBe(true)
    expect(board.sidDogrula('recep-manual').ok, 'INV-BOARD-3\'ün YAZILI muafiyeti kırıldı — elle kimlik bayraksız çalışmalı').toBe(true)
    expect(board.sidDogrula('99fa366e-d8bb-4вм61').ok, 'Kiril harfli kimlik KABUL edildi — kapı ölçmüyor').toBe(false)
  })


  it('CLAUDE_SESSION_ID dolu ise ikinci basamak çalışmaya devam eder', () => {
    const board = loadBoard(boardDir)
    const r = runCli(['claim', '--lane', 'ORTAM', '--globs', 'src/x/**'], { sidEnv: 'eeeeeeee-4444-4444-8444-eeeeeeeeeeee' })

    expect(r.status, `ortam değişkeninden kimlik çözülmedi — hook'suz kabuk dışındaki tüm çağrılar kırılırdı. stderr: ${r.stderr}`).toBe(0)
    expect(board.liveClaims().map(c => c.sid)).toContain('eeeeeeee-4444-4444-8444-eeeeeeeeeeee')
  })

  it('"who" kimliksiz KOŞAR (yazmıyor) ama sessiz kalmaz — asimetri bilinçli', () => {
    loadBoard(boardDir)
    const r = runCli(['who'])

    expect(r.status, '"who" yalnız OKUR; kimlik yok diye engellemek pano okumayı gereksiz yere kapatır').toBe(0)
    expect(
      r.stderr,
      '"who" kimliksiz koşup SUSMUŞ — okuyan kendi şeridini listede boşuna arar, çünkü "(sen)" işareti hiç konmaz',
    ).toContain('uyarı')
  })
})

/**
 * INV-BOARD-4 · BAYAT şerit sessizce KAYBOLMASIN (T084-VH).
 *
 * `liveClaims` TTL'i dolmuş talebi listeden atar ve bu ENGELLEME için doğrudur. Ama aynı liste
 * panoyu/brifingi de besliyordu ve orada sessiz bilgi kaybı üretti: 2026-08-18'de EDGE şeridi
 * 240+ dakika atış almadıktan sonra listeden TAMAMEN kayboldu. "Listede yok" iki bambaşka
 * durumu aynı gösteriyor: (a) iş bitti, bilinçli bırakıldı · (b) oturum koptu, şerit SAHİPSİZ.
 * (b) hâlinde o globlara kimse bakmaz ve kimse fark etmez — oysa bu bir devralma kararıdır.
 *
 * Düzeltme ilk koşumda gerçek bilgi üretti: EDGE (269dk) yanında I18N-SWEEP (251dk) de bayat
 * çıktı — ikincisini kimse bilmiyordu, çünkü kaybolmuştu.
 */
describe('INV-BOARD-4 · bayat şerit görünür kalır', () => {
  const SID_CANLI = '11111111-aaaa-4aaa-8aaa-111111111111'
  const SID_BAYAT = '22222222-bbbb-4bbb-8bbb-222222222222'
  const SID_BIRAKAN = '33333333-cccc-4ccc-8ccc-333333333333'

  function seed(board: BoardModule): void {
    board.append(SID_CANLI, { ts: isoAgo(60_000), type: 'claim', lane: 'CANLI', globs: ['src/canli/**'] })
    // TTL 4 saat; 5 saat atış yok → bayat
    board.append(SID_BAYAT, { ts: isoAgo(5 * 60 * 60 * 1000), type: 'claim', lane: 'BAYAT-SERIT', globs: ['src/bayat/**'] })
    board.append(SID_BIRAKAN, { ts: isoAgo(3 * 60 * 60 * 1000), type: 'claim', lane: 'BIRAKAN', globs: ['src/birakan/**'] })
    board.append(SID_BIRAKAN, { ts: isoAgo(60_000), type: 'release' })
  }

  it('bayat şerit LISTEDE KALIR (bayat etiketi + yaşıyla), liveClaims ise onu düşürür', () => {
    const board = loadBoard(boardDir)
    seed(board)

    const hepsi = board.tumTalepler()
    const bayat = hepsi.find(c => c.sid === SID_BAYAT)

    expect(
      bayat,
      'BAYAT şerit listeden düştü — "listede yok" ifadesi "iş bitti" ile "sahipsiz kaldı"yı ' +
        'aynı gösterir ve sahipsiz globları kimse fark etmez (EDGE vakası, 240dk)',
    ).toBeDefined()
    expect(bayat?.bayat, 'bayat şerit CANLI gibi işaretlenmiş — etiketi olmayan bilgi yanıltır').toBe(true)
    expect(
      bayat?.yasDk ?? 0,
      'yaş bilgisi yok — "ne kadar süre sessiz" olmadan devralma kararı verilemez',
    ).toBeGreaterThan(240)

    // Engelleme tarafı DEĞİŞMEDİ: bayat şerit canlı listede olmamalı.
    expect(
      board.liveClaims().map(c => c.sid),
      'bayat şerit liveClaims\'e sızmış — ölü oturum yeniden kilitleyebilir hâle gelir',
    ).not.toContain(SID_BAYAT)
  })

  it('BIRAKILAN şerit gerçekten düşer — bilinçli kapanış bayatlıkla karıştırılmaz', () => {
    const board = loadBoard(boardDir)
    seed(board)

    expect(
      board.tumTalepler().map(c => c.sid),
      'release edilmiş şerit hâlâ listede — bilinçli kapanış "sahipsiz kaldı" gibi görünürse ' +
        'pano gürültüye boğulur ve etiket anlamını yitirir',
    ).not.toContain(SID_BIRAKAN)
  })

  it('bayat şerit BLOKLAMAZ (görünürlük ile engelleme AYRI)', () => {
    const board = loadBoard(boardDir)
    seed(board)

    const c = board.findConflict('src/bayat/dosya.ts', SID_CANLI, process.cwd())
    expect(
      c,
      'bayat şerit yazmayı engelliyor — görünür kılmak onu tekrar kilide çevirmemeli, ' +
        'yoksa ölü oturum tüm filoyu durdurur (TTL\'in var olma sebebi bu)',
    ).toBeNull()
  })

  it('summary çıktısı BAYAT etiketini ve süresini YAZAR', () => {
    const board = loadBoard(boardDir)
    seed(board)

    const cikti = board.summary(SID_CANLI)
    expect(cikti, 'summary bayat şeridi hiç anmıyor').toContain('BAYAT')
    expect(cikti, 'bayat şeridin adı çıktıda yok').toContain('BAYAT-SERIT')
    expect(cikti, 'canlı şerit kaybolmuş').toContain('CANLI')
    expect(cikti, 'bırakılan şerit yeniden görünür olmuş').not.toContain('BIRAKAN')
  })
})

/**
 * INV-BOARD-5 · Loop kurulum hatırlatması hook TARAFINDAN taşınır (T085-VH).
 *
 * Recep'in sabah ritüeli: her pencereye yalnız "günaydın" yazması yeterli olmalı, oturum
 * kendi loop zincirini KENDİSİ kurmalı. Komutu insanın taşıması, tam olarak bu katmanın
 * ortadan kaldırmaya çalıştığı "hatırlamaya bağlı adım".
 *
 * Tasarım kısıtı: `board-brief.cjs`'in yazılı bir SESSİZLİK KURALI var (söyleyecek şey yoksa
 * hiçbir şey yazmaz). Bu yüzden hatırlatma HER TURA eklenmiyor: yalnız şerit talep ETMEMİŞ
 * taze oturum görüyor, şerit alınınca kendiliğinden susuyor.
 */
describe('INV-BOARD-5 · loop hatırlatması', () => {
  const SID_TAZE = '44444444-dddd-4ddd-8ddd-444444444444'
  const HOOK_YOLU = require.resolve('../../../.claude/hooks/board-brief.cjs')

  function hookKostur(sidDeger: string): string {
    const ciftler = Object.entries(process.env).filter(([k]) => k !== 'CLAUDE_SESSION_ID')
    ciftler.push(['VENTHUB_BOARD_DIR', boardDir])
    const env = Object.fromEntries(ciftler) as typeof process.env
    const r = spawnSync('node', [HOOK_YOLU], {
      encoding: 'utf8',
      env,
      input: JSON.stringify({ session_id: sidDeger }),
    })
    return r.stdout ?? ''
  }

  it('şerit ALMAMIŞ oturum loop hatırlatmasını görür (pano boş olsa bile)', () => {
    loadBoard(boardDir) // pano dizinini hazırla, hiç talep yok
    const cikti = hookKostur(SID_TAZE)

    expect(
      cikti,
      'hook hiç çıktı vermedi — pano boşken bile TAZE oturum loop komutunu almalı, yoksa ' +
        'komutu yine insan taşır (T085\'in tam sebebi)',
    ).toContain('LOOP:')
    expect(cikti, 'hatırlatma hangi dosyaya bakılacağını söylemiyor').toContain('session-loop-ritual.md')
    expect(cikti, 'yedek cron adımı hatırlatmada yok').toContain('CronCreate')
  })

  it('şerit ALAN oturumda hatırlatma SUSAR — hook KONUŞURKEN bile', () => {
    const board = loadBoard(boardDir)
    board.append(SID_TAZE, { ts: isoAgo(30_000), type: 'claim', lane: 'CALISIYOR', globs: ['src/x/**'] })
    // ⚠ BU SATIR TESTİN KENDİSİNİ KURTARIYOR: ilk sürümde yoktu ve test YANLIŞ SEBEPLE geçti.
    // Tek talep bu oturumun kendisi olunca hook'un SESSİZLİK KURALI devreye giriyor ve kanca
    // hiç çıktı vermeden çıkıyordu — yani hatırlatmayı koşulsuz basacak şekilde bozduğumda
    // (sabotaj) test yine yeşil kaldı, çünkü sabotajlanan satıra hiç ULAŞILMIYORDU.
    // Başka bir oturumun canlı şeridi eklenince kanca KONUŞMAK ZORUNDA kalıyor ve asıl iddia
    // ("konuşuyor ama LOOP satırını basmıyor") gerçekten ölçülüyor.
    board.append('99999999-eeee-4eee-8eee-999999999999', {
      ts: isoAgo(45_000), type: 'claim', lane: 'BASKA-SERIT', globs: ['src/y/**'],
    })

    const cikti = hookKostur(SID_TAZE)

    expect(cikti, 'hook hiç konuşmadı — bu testin ön koşulu, başka şerit varken PANO basmasıdır').toContain('PANO:')
    expect(
      cikti.includes('LOOP:'),
      'şerit almış oturuma da hatırlatma basılıyor — her tura satır eklemek bağlamı kirletir ve ' +
        'zamanla okunmaz hâle gelir (dosyanın kendi SESSİZLİK KURALI)',
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

/**
 * INV-BOARD-6 · CLAIM SEMANTİĞİ — glob ayırıcısı, daraltma ve kıdem.
 *
 * NİÇİN VAR (2026-08-26 ölçümü, tahmin değil): --globs YALNIZ virgülle ayrılıyordu ve boşluk
 * ayırmalı bir dize verildiğinde komut HATA VERMİYORDU — dizeyi geri basıp "talep alındı" der,
 * TEK bir dev glob saklardı. O glob hiçbir yolla eşleşmez: claim VAR görünür, koruma YOKTUR,
 * pano "çakışma yok" der ve şerit kapısı YEŞİL yanar. Filo taraması 8 canlı şeritten 3'ünde
 * (EDGE, ALTYAPI, URUN) bunu buldu; gerçekten korumasız kalan 5 yolun ikisi Bash yazma kapısının
 * KENDİ kaynak dosyalarıydı — kapıyı yaz, kapıyı claim etmeyi kaçır.
 *
 * İKİNCİ KUSUR AYNI YERDE: claim BİRLEŞTİRİR, yani bir şeridi DARALTMANIN yolu yoktu. İki şerit
 * aynı cetvel dosyasını meşru sebeplerle talep ettiğinde (ALTYAPI ve I18N, aynı gün) ayrışma
 * yalnız SÖZLE mümkündü. release çözüm değil: oturumu haritadan siler, sonraki claim YENİ bir ts
 * alır ve şerit bütün ortak yollarda kıdemsiz düşer. --exact daraltmayı kıdem bedeli ödemeden yapar.
 *
 * KAPININ KENDİSİ İÇİN YANLIŞ-POZİTİF KOLU ZORUNLU: bu kapının ilk yazımında boşluk deseni
 * kabuk katmanlarında bozuldu ve dosyaya "harf s arayan" bir kontrol düştü. Sözdizimi geçerliydi
 * ama masum her glob'u reddedecekti. Bir kapının fazla dar olması kadar fazla geniş olması da
 * arızadır; ikisi AYRI kollarla ölçülür.
 */
describe('INV-BOARD-6 · claim semantiği', () => {
  function claimCli(args: string[]): { status: number; stdout: string; stderr: string } {
    const ciftler = Object.entries(process.env).filter(([k]) => k !== 'CLAUDE_SESSION_ID')
    ciftler.push(['VENTHUB_BOARD_DIR', boardDir])
    const env = Object.fromEntries(ciftler) as typeof process.env
    const r = spawnSync('node', [BOARD_MODULE_PATH, ...args], { encoding: 'utf8', env })
    return { status: typeof r.status === 'number' ? r.status : -1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' }
  }

  it('BOŞLUKLU --globs REDDEDİLİR ve panoya HİÇBİR ŞEY yazılmaz', () => {
    const r = claimCli(['claim', '--sid', 'sess-bosluk', '--lane', 'T', '--globs', 'a/** b/**'])

    expect(
      r.status,
      'boşluklu --globs KABUL EDİLDİ — tek dev glob saklanır, hiçbir yolla eşleşmez ve şerit ' +
        'korunuyor sanılırken korunmaz (2026-08-26: 3 şeritte, 5 yolda gerçekleşti)',
    ).not.toBe(0)
    expect(
      r.stderr,
      'red mesajı doğru komutu ÖĞRETMELİ, yoksa kullanıcı aynı hatayı tekrarlar',
    ).toContain('a/**,b/**')

    const board = loadBoard(boardDir)
    const yazilan = board.readEvents().filter(e => e.sid === 'sess-bosluk')
    expect(
      yazilan.length,
      'reddedilen claim yine de panoya YAZILMIŞ — "hata verdi ama kaydetti" en kötü hâl: kapı kırmızı, veri yeşil',
    ).toBe(0)
  })

  it('YANLIŞ-POZİTİF KOLU: içinde s harfi geçen masum globlar KABUL EDİLİR', () => {
    const masum = 'scripts/board/**,src/lib/services/x.ts,supabase/functions/**,docs/standards/y.md'
    const r = claimCli(['claim', '--sid', 'sess-masum', '--lane', 'T', '--globs', masum])

    expect(
      r.status,
      'masum globlar REDDEDİLDİ — boşluk kontrolü fazla geniş yazılmış olabilir (ilk yazımda tam ' +
        'bu oldu: desen kabuk katmanlarında bozulup harf-s arayan bir kontrole dönüştü)',
    ).toBe(0)

    const board = loadBoard(boardDir)
    const c = board.liveClaims().find(x => x.sid === 'sess-masum')
    expect(c?.globs.length, 'dört glob virgülden ayrılmalıydı').toBe(4)
  })

  it('--exact OLMADAN claim BİRLEŞTİRİR (varsayılan davranış korunur)', () => {
    const board = loadBoard(boardDir)
    board.append('sess-birlesim', { ts: isoAgo(5000), type: 'claim', lane: 'T', globs: ['a/**'] })
    board.append('sess-birlesim', { ts: isoAgo(1000), type: 'claim', lane: 'T', globs: ['b/**'] })

    const c = board.liveClaims().find(x => x.sid === 'sess-birlesim')
    expect(
      c?.globs.slice().sort(),
      'genişletme birleştirmiyor — şeridimi-genişleteyim hareketi eskisini sessizce bırakır',
    ).toEqual(['a/**', 'b/**'])
  })

  it('--exact DARALTIR: önceki globlar düşer', () => {
    const board = loadBoard(boardDir)
    board.append('sess-exact', { ts: isoAgo(5000), type: 'claim', lane: 'T', globs: ['a/**', 'b/**', 'c/**'] })
    board.append('sess-exact', { ts: isoAgo(1000), type: 'claim', lane: 'T', globs: ['b/**'], exact: true })

    const c = board.liveClaims().find(x => x.sid === 'sess-exact')
    expect(
      c?.globs,
      'exact claim BİRLEŞTİRİLMİŞ — daraltma imkânsız kalır ve iki şerit bir dosyayı ancak SÖZLE ayrıştırabilir',
    ).toEqual(['b/**'])
  })

  it('--exact KIDEMİ KORUR — daraltma en-erken-kazanır hakkını kaybettirmemeli', () => {
    const board = loadBoard(boardDir)
    const ilkTs = isoAgo(5000)
    board.append('sess-kidem', { ts: ilkTs, type: 'claim', lane: 'T', globs: ['a/**', 'b/**'] })
    board.append('sess-kidem', { ts: isoAgo(1000), type: 'claim', lane: 'T', globs: ['a/**'], exact: true })

    const c = board.liveClaims().find(x => x.sid === 'sess-kidem')
    expect(
      c?.ts,
      'daraltma kıdemi TAZELEDİ — şerit bütün ortak yollarda kıdemsiz düşer, yani bir dosyayı ' +
        'bırakmak başka her yerde kapıyı aleyhine çevirir',
    ).toBe(ilkTs)
  })

  it('KARŞIT KANIT: release ile daraltma kıdemi SIFIRLAR — bu yüzden --exact gerekli', () => {
    const board = loadBoard(boardDir)
    const ilkTs = isoAgo(5000)
    board.append('sess-release', { ts: ilkTs, type: 'claim', lane: 'T', globs: ['a/**', 'b/**'] })
    board.append('sess-release', { ts: isoAgo(3000), type: 'release' })
    board.append('sess-release', { ts: isoAgo(1000), type: 'claim', lane: 'T', globs: ['a/**'] })

    const c = board.liveClaims().find(x => x.sid === 'sess-release')
    expect(
      c?.ts,
      'release+claim kıdemi KORUDU — öyleyse --exact gerekçesi çökmüş demektir; bu testin ' +
        'kırmızısı gerçek bir tasarım değişikliğidir, sessizce yeşile çevrilmemeli',
    ).not.toBe(ilkTs)
  })

  it('SÜRÜKLENME KAPISI: liveClaims ve tumTalepler AYNI glob kümesini verir', () => {
    const board = loadBoard(boardDir)
    board.append('sess-surukle', { ts: isoAgo(5000), type: 'claim', lane: 'T', globs: ['a/**', 'b/**'] })
    board.append('sess-surukle', { ts: isoAgo(1000), type: 'claim', lane: 'T', globs: ['b/**'], exact: true })

    const canli = board.liveClaims().find(x => x.sid === 'sess-surukle')
    const hepsi = board.tumTalepler().find(x => x.sid === 'sess-surukle')

    expect(
      hepsi?.globs,
      'iki görünüm AYRIŞTI — claim indirgeme mantığı board.cjs içinde İKİ KEZ yazılıdır; birine ' +
        'dokunup ötekini unutmak panonun iki yüzünü farklı gerçeklere böler ve hiçbir kapı görmez',
    ).toEqual(canli?.globs)
  })
})

/**
 * INV-BOARD-YOKLAMA-2 — TARAMA ile TESLIM AYRI ÖLÇÜLÜR, ve eşik CETVELDEN gelir (§23).
 *
 * ÖLÇÜLMÜŞ VAKA (2026-09-01, 62 dakika): yoklama tek sütun basıyordu —
 * `GOZCU = panoyu DUYUYOR mu` — ve o sütun imleç tazeliğini ölçüyordu. Compact sonrası şeride
 * bir saat boyunca hiçbir bildirim ulaşmadı, Recep uyandırdı; AMA sütun o an YEŞİLDİ ve
 * yanlış da değildi: gözcü SÜRECİ yaşıyordu (imleç 14 sn önce yazılmıştı). Ölen şey bildirimin
 * KONUŞMAYA teslimiydi ve imleçte bunun izi yoktu.
 *
 * Bu kollar TEXT TARAMASI DEĞİL: gerçek geçici pano dizinine gerçek imleç/damga dosyaları
 * yazılır ve `yoklama()` çıktısı okunur. Sebep, ölçülmüş bir ders: kaynak-tarayan konformans
 * yorumla tatmin olur — sabotaj gerçek çağrıyı silse bile dize kaynakta durduğu için kapı
 * yeşil kalabilir. Ayırt eden şey DAVRANIŞTIR.
 */
describe('INV-BOARD-YOKLAMA-2: TARAMA ≠ TESLIM, eşik cetvelden', () => {
  /** Verilen sid için imleç (gözcü süreci taze) ve istenirse teslimat damgası yazar. */
  function mekanizmaKur(
    dir: string,
    sid: string,
    opts: { taramaYasSn: number; teslimYasDk?: number | null },
  ): void {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      `${dir}/.gozcu-imlec.${sid.slice(0, 8)}.json`,
      JSON.stringify({
        sid,
        aralikSn: 60,
        sonTarama: isoAgo(opts.taramaYasSn * 1000),
        ofsetler: {},
      }),
      'utf8',
    )
    if (opts.teslimYasDk !== null && opts.teslimYasDk !== undefined) {
      fs.writeFileSync(
        `${dir}/.mekanizma-durum.${sid.slice(0, 8)}.json`,
        JSON.stringify({ sid, jeton: 'X', teslimDogrulandiTs: isoAgo(opts.teslimYasDk * 60000) }),
        'utf8',
      )
    }
  }

  const SID = 'eeeeeeee-1111-4111-8111-000000000009'

  function talepAt(board: BoardModule): void {
    board.append(SID, { type: 'claim', sid: SID, lane: 'DENEK', globs: ['x/**'] })
    board.append(SID, { type: 'heartbeat', sid: SID })
  }

  it('⭐TARAMA taze ama TESLİMAT YOK: yoklama bunu SAKLAMAZ (asıl sahte-yeşil vakası)', () => {
    const board = loadBoard(boardDir)
    talepAt(board)
    // Gözcü süreci CANLI (14 sn önce taradı) — tam olarak 62 dakikalık vakadaki durum.
    mekanizmaKur(boardDir, SID, { taramaYasSn: 14, teslimYasDk: null })

    const cikti = board.yoklama()

    expect(cikti).toMatch(/TARAMA TARIYOR/)
    expect(
      /TESLIM\s+KANITSIZ/.test(cikti),
      'Teslimat kanıtı yokken sütun bunu SÖYLEMELİ — eski tek sütun bu durumda "CANLI" diyordu.',
    ).toBe(true)
    expect(
      /TESLIMAT KANITI BAYAT\/YOK/.test(cikti),
      'Satır işareti yetmez: alt uyarı bloğu da çıkmalı. 62 dk vakasında ekranda hiçbir uyarı yoktu.',
    ).toBe(true)
    // AYIRT EDİCİLİK: aynı çıktı "gözcü ölü" demiyor — iki arıza karışmamalı.
    expect(cikti).not.toMatch(/PANOYU OKUDUGU KANITLANAMAYAN 1 serit/)
  })

  it('⭐DURUM DOSYASI VAR ama damga YOK: yine KANITSIZ (prob sonrası, dogrula öncesi hâli)', () => {
    // Bu kol bir SABOTAJ turunda keşfedildi: "damga yoksa 0 dön" sabotajı kolları düşürmedi,
    // çünkü o zamanki fikstür durum dosyasını HİÇ yazmıyordu — dosya yok → catch → KANITSIZ.
    // Yani sabotajın dokunduğu dal test tarafından HİÇ KOŞULMUYORDU. Oysa bu dal gerçektir ve
    // tam olarak TEHLİKELİ olandır: `prob` durum dosyasını damgasız yazar; `dogrula`
    // çalışana kadar dosya VAR, damga YOK. Ölçülmeyen dal, yazılmamış dal kadar korumasızdır.
    const board = loadBoard(boardDir)
    talepAt(board)
    fs.mkdirSync(boardDir, { recursive: true })
    fs.writeFileSync(
      `${boardDir}/.gozcu-imlec.${SID.slice(0, 8)}.json`,
      JSON.stringify({ sid: SID, aralikSn: 60, sonTarama: isoAgo(14_000), ofsetler: {} }),
      'utf8',
    )
    // prob'un yazdığı biçim: jeton var, teslimDogrulandiTs YOK.
    fs.writeFileSync(
      `${boardDir}/.mekanizma-durum.${SID.slice(0, 8)}.json`,
      JSON.stringify({ sid: SID, jeton: 'PROB-XXXX', probTs: isoAgo(30_000), gozcuOkudu: true }),
      'utf8',
    )

    expect(
      board.teslimDurumu(SID, Date.now()),
      'Jeton yazılmış olması TESLİMATI KANITLAMAZ — probu gözcü okur, teslimatı ajan doğrular.',
    ).toBe('KANITSIZ')
    expect(board.yoklama()).toMatch(/TESLIMAT KANITI BAYAT\/YOK/)
  })

  it('teslimat damgası TAZE ise uyarı ÇIKMAZ (kol iki yöne de ayırt ediyor)', () => {
    const board = loadBoard(boardDir)
    talepAt(board)
    mekanizmaKur(boardDir, SID, { taramaYasSn: 14, teslimYasDk: 5 })

    const cikti = board.yoklama()

    expect(cikti).toMatch(/TESLIM\s+5dk/)
    expect(
      /TESLIMAT KANITI BAYAT\/YOK/.test(cikti) === false,
      'Taze kanıt varken uyarı çıkarsa kol ayırt etmiyor demektir — her hâlde kırmızı yanan ' +
        'gösterge, hiç yanmayan gösterge kadar bilgisizdir.',
    ).toBe(true)
  })

  it('teslimat damgası EŞİKTEN eski ise bayat sayılır (cetveldeki 120dk)', () => {
    const board = loadBoard(boardDir)
    talepAt(board)
    const esik = board.esikleriOku()
    expect(esik, 'cetveldeki ESIKLER bloğu okunamadı').not.toBeNull()
    mekanizmaKur(boardDir, SID, {
      taramaYasSn: 14,
      teslimYasDk: (esik as Record<string, number>).TESLIM_ESIK_DK + 10,
    })

    expect(board.yoklama()).toMatch(/TESLIMAT KANITI BAYAT\/YOK/)
  })

  it('⭐eşik CETVELDEN okunamazsa SESSİZ VARSAYILANA DÜŞMEZ — alarm basar', () => {
    const board = loadBoard(boardDir)
    talepAt(board)
    mekanizmaKur(boardDir, SID, { taramaYasSn: 14, teslimYasDk: null })

    // Bloksuz bir cetvel: eşik okunamaz.
    const bosCetvel = `${boardDir}/cetvel-bloksuz.md`
    fs.writeFileSync(bosCetvel, '# cetvel\nESIKLER blogu YOK\n', 'utf8')
    expect(
      board.esikleriOku(bosCetvel),
      'Blok yoksa null dönmeli: sessiz varsayılan, eşiği silen bir değişikliği YEŞİL gösterirdi.',
    ).toBeNull()

    // Blok var ama BİÇİMİ bozuk (sayı yok) — yarım eşleşme de kabul EDİLMEMELİ.
    const bozukCetvel = `${boardDir}/cetvel-bozuk.md`
    fs.writeFileSync(
      bozukCetvel,
      'ESIKLER-BASLANGIC\n- `SES_ESIK_DK: cok`\n- `TESLIM_ESIK_DK: 120`\n- `TARAMA_ESIK_TUR: 3`\nESIKLER-BITIS\n',
      'utf8',
    )
    expect(
      board.esikleriOku(bozukCetvel),
      'Biçim bozuksa null: yarım okunan eşik, okunmamış eşikten daha tehlikelidir (yanlış hüküm verir).',
    ).toBeNull()

    // Üç eşikten biri EKSİK olsa da null (hepsi ya da hiçbiri).
    const eksikCetvel = `${boardDir}/cetvel-eksik.md`
    fs.writeFileSync(
      eksikCetvel,
      'ESIKLER-BASLANGIC\n- `SES_ESIK_DK: 45`\n- `TARAMA_ESIK_TUR: 3`\nESIKLER-BITIS\n',
      'utf8',
    )
    expect(board.esikleriOku(eksikCetvel), 'TESLIM_ESIK_DK eksik — null olmalı').toBeNull()
  })

  it('SES eşiği aşılınca ALARM basar, altında kalınca BASMAZ (ayırt edici çift)', () => {
    const board = loadBoard(boardDir)
    const esik = board.esikleriOku() as Record<string, number>

    // (a) eşiğin ÜSTÜ: not eski
    board.append(SID, { type: 'claim', sid: SID, lane: 'DENEK', globs: ['x/**'] })
    board.append(SID, { type: 'heartbeat', sid: SID })
    board.append(SID, {
      type: 'note',
      sid: SID,
      lane: 'DENEK',
      text: 'eski not',
      ts: isoAgo((esik.SES_ESIK_DK + 20) * 60000),
    })
    mekanizmaKur(boardDir, SID, { taramaYasSn: 14, teslimYasDk: 5 })
    const eskiCikti = board.yoklama()
    expect(eskiCikti).toMatch(/SESSIZ!/)
    expect(eskiCikti).toMatch(/SESSIZLIK ESIGI ASILDI/)

    // (b) eşiğin ALTI: TAZE not — aynı fikstüre taze not eklenince alarm SÖNMELİ.
    board.append(SID, { type: 'note', sid: SID, lane: 'DENEK', text: 'taze not' })
    const yeniCikti = board.yoklama()
    expect(
      /SESSIZLIK ESIGI ASILDI/.test(yeniCikti) === false,
      'Taze not geldiğinde sessizlik alarmı sönmeli; sönmüyorsa ölçüt son notu değil başka ' +
        'bir şeyi okuyor.',
    ).toBe(true)
  })
})

/**
 * INV-BOARD-EKSEN-1 — yoklamanın EKSEN ADLARI tek kaynaktan; başlık ve `--help` ÜRETİLİR.
 *
 * ⭐ÖLÇÜLMÜŞ VAKA (2026-09-01/02): #942'de eksen `GOZCU` → `TARAMA` oldu ve dördüncü eksen
 * `TESLIM` eklendi. Başlık güncellendi, **`--help` geride kaldı** ve günlerce
 * *"UC EKSENLI ... GOZCU=duyuyor"* dedi — hem SAYI hem AD yanlıştı.
 *
 * ⭐NİÇİN MEVCUT KOL GÖRMEDİ: eski adı yasaklayan konformans kolu `gozcuDurumu` gibi bir
 * TANIMLAYICI arıyordu; `--help` içindeki `GOZCU=duyuyor` bir DİZE literalidir. Kol,
 * ölçtüğünü sandığı şeyin yalnızca bir yüzünü ölçüyordu. Bu, §23'ün "gösterge doğruydu,
 * adı yanlıştı" sınıfının aynısıdır — bu kez göstergenin ADI değil, ADI ANLATAN METİN bayattı.
 *
 * ⭐NİÇİN TEK SATIR YAMAMADIK: help'i elle düzeltmek kaymayı GERİ GETİRİRDİ (bir sonraki
 * eksen değişikliğinde aynı üç yer yine ayrışır). Kayma İMKÂNSIZ olmalı: tek `EKSENLER`
 * listesi, başlık ve help ondan üretilir, ve bu kol üretildiğini ÖLÇER.
 */
describe('INV-BOARD-EKSEN-1: eksen adları TEK KAYNAK, başlık ve --help ÜRETİLİR', () => {
  it('EKSENLER dolu ve her kaydın adı + açıklaması var (liste kendisi ölçülebilir olmalı)', () => {
    const board = loadBoard(boardDir)
    expect(Array.isArray(board.EKSENLER) && board.EKSENLER.length > 0).toBe(true)
    for (const e of board.EKSENLER) {
      expect(typeof e.ad === 'string' && e.ad.length > 0, `eksen adı boş: ${JSON.stringify(e)}`).toBe(true)
      expect(
        typeof e.aciklama === 'string' && e.aciklama.length > 0,
        `${e.ad} açıklaması boş — help metni "${e.ad}=" yazıp yarım kalırdı`,
      ).toBe(true)
    }
  })

  it('⭐--help HER eksen adını içerir (eksen eklenip help unutulamaz)', () => {
    const board = loadBoard(boardDir)
    const help = board.kullanimMetni()
    const eksik = board.EKSENLER.map((e) => e.ad).filter((ad) => !help.includes(ad))
    expect(
      eksik,
      'Bu eksenler --help metninde YOK. Help elle yazılmış olabilir; EKSENLER listesinden ' +
        'ÜRETİLMELİ — yoksa eksen değişince help sessizce bayatlar (2026-09-01 vakası).',
    ).toEqual([])
  })

  it('⭐--help içindeki SAYI SÖZCÜĞÜ eksen sayısıyla uyuşur (BAĞIMSIZ referansla — tautoloji değil)', () => {
    const board = loadBoard(boardDir)
    const help = board.kullanimMetni()
    // ⚠BAĞIMSIZ REFERANS ZORUNLU (sabotaj S4 ile ölçüldü): beklenen sözcüğü `board.SAYI_SOZU`'ndan
    // okumak TAUTOLOJİDİR — tablo bozulursa (4:'UC') beklenti DE bozulur ve kol yeşil kalır.
    // Ölçüt, ölçtüğü tabloyu referans olarak kullanamaz; doğru sayı sözcükleri BURADA durur.
    const BAGIMSIZ_SAYI: Record<number, string> = { 1: 'TEK', 2: 'IKI', 3: 'UC', 4: 'DORT', 5: 'BES', 6: 'ALTI' }
    const beklenen = BAGIMSIZ_SAYI[board.EKSENLER.length]
    expect(beklenen, `Bu testin bağımsız tablosunda ${board.EKSENLER.length} karşılığı YOK — tabloyu genişlet`).toBeTruthy()
    expect(
      board.SAYI_SOZU[board.EKSENLER.length],
      `board.SAYI_SOZU[${board.EKSENLER.length}] bağımsız referansla UYUŞMUYOR: ` +
        `"${board.SAYI_SOZU[board.EKSENLER.length]}" ≠ "${beklenen}". Sayı sözcüğü tablosu bozuk.`,
    ).toBe(beklenen)
    expect(
      help.includes(beklenen + ' EKSENLI'),
      `--help "${beklenen} EKSENLI" demiyor. Eksen sayısı ${board.EKSENLER.length} ama metin ` +
        'başka bir sayı taşıyor — tam olarak 2026-09-01\'deki "UC EKSENLI ama dört eksen" hatası.',
    ).toBe(true)
  })

  it('⭐yoklama BAŞLIĞI ile --help AYNI kaynaktan (iki metin ayrışamaz)', () => {
    const board = loadBoard(boardDir)
    const ozet = board.eksenOzeti()
    expect(board.kullanimMetni().includes(ozet), '--help, eksenOzeti() dizesini içermiyor').toBe(true)
    // ⚠FİKSTÜR, ÖLÇÜLECEK DURUMU ÜRETMEK ZORUNDA (§25): boş panoda yoklama() erken döner
    // ("panoda talep yok") ve BAŞLIĞI HİÇ BASMAZ — o hâlde bu kol, var olmayan bir metni
    // arayıp kırmızı verirdi. Başlık ancak en az bir şerit varken üretilir; onu üretiyoruz.
    board.append('session-eksen', {
      ts: isoAgo(1000),
      type: 'claim',
      lane: 'EKSEN-SINAMA',
      globs: ['src/eksen-sinama/**'],
    })
    expect(
      board.yoklama().includes(ozet),
      'yoklama başlığı eksenOzeti() dizesini içermiyor. Başlık ile help AYRI yazılmışsa biri ' +
        'güncellenip diğeri bayatlar — bu değişmezin tam kapatmak istediği durum.',
    ).toBe(true)
  })

  it('⭐LİSTE BEYAN, SATIR GERÇEK: yoklama şerit satırı HER eksen adını basar', () => {
    // ⚠SABOTAJ S3 BU KOLU DOĞURDU: `EKSENLER`den TESLIM silindiğinde her şey TUTARLI kalıyordu
    // (liste 3, sayı UC, adlar geçiyor) — çünkü listenin yoklamanın GERÇEKTEN bastığı sütunlarla
    // bağı hiç ölçülmüyordu. Liste bir BEYANDIR; şerit satırı GERÇEKTİR. İkisi ayrışırsa
    // yoklama, adı ilan edilmemiş bir sütun basar ya da ilan edilmiş bir eksen hiç görünmez.
    const board = loadBoard(boardDir)
    board.append('session-satir', {
      ts: isoAgo(1000),
      type: 'claim',
      lane: 'SATIR-SINAMA',
      globs: ['src/satir-sinama/**'],
    })
    const satirlar = board.yoklama().split('\n')
    const seritSatiri = satirlar.find((s) => s.includes('SATIR-SINAMA'))
    expect(seritSatiri, 'yoklama çıktısında şerit satırı bulunamadı — fikstür durumu üretmedi').toBeTruthy()
    const gorunmeyen = board.EKSENLER.map((e) => e.ad).filter((ad) => !(seritSatiri ?? '').includes(ad))
    expect(
      gorunmeyen,
      `Bu eksenler ilan edilmiş ama şerit satırında BASILMIYOR: ${gorunmeyen.join(', ')}. ` +
        'EKSENLER listesi ile yoklamanın gerçek sütunları AYRIŞMIŞ — biri beyan, diğeri davranış.',
    ).toEqual([])

    // ⚠TERS YÖN, BAĞIMSIZ REFERANSLA (sabotaj S3 bunu doğurdu): yukarıdaki kol yalnız
    // "listedeki her ad satırda var mı" der. Listeden bir eksen SİLİNİRSE liste küçülür,
    // kalanlar hâlâ satırdadır ve kol YEŞİL kalır — kayma tam da bu yönde olur. O yüzden
    // beklenen eksen KÜMESİ burada, ölçülen tablodan BAĞIMSIZ olarak durur. Yeni bir eksen
    // eklemek bu satırı da güncellemeyi gerektirir; bu sürtünme KASITLIDIR — eksen kümesi
    // §23'te hükme bağlı bir karardır, sessizce değişmemeli.
    const BEKLENEN_EKSENLER = ['ATIS', 'TARAMA', 'TESLIM', 'SES']
    const ilanEdilenler = board.EKSENLER.map((e) => e.ad)
    const kaybolan = BEKLENEN_EKSENLER.filter((ad) => !ilanEdilenler.includes(ad))
    expect(
      kaybolan,
      `Bu eksenler EKSENLER listesinden DÜŞMÜŞ: ${kaybolan.join(', ')}. Yoklamanın eksen kümesi ` +
        '§23 ile hükme bağlıdır; bir eksen kaldırılacaksa cetvel ve bu kol birlikte güncellenir. ' +
        'Sessiz düşüş, ölçülen bir sağırlık boyutunun sessizce ölçülmez olması demektir.',
    ).toEqual([])
  })

  it('⭐KAYNAKTA eski eksen adı ve elle yazılmış sayı YOK (yorumlar hariç — orada AÇIKLANIR)', () => {
    // Bu kol modülü YÜKLEMEZ: ölçtüğü şey çalışma zamanı davranışı değil, KAYNAK METNİ.
    // Yasak, adın KULLANIMINA konur; adın ANLATILDIĞI yorum serbesttir. Ayrım yapılmazsa
    // ya kol kendi gerekçesini yasaklar ya da yasak hiç konamaz (fleet-mechanism-integrity
    // aynı `yorumsuz` desenini kullanır).
    const kaynak = fs.readFileSync(BOARD_MODULE_PATH, 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1')
    expect(
      /GOZCU\s*=/.test(kod),
      'Kaynak KODda "GOZCU=" geçiyor. Eksen #942\'de TARAMA oldu; kullanıcıya görünen metinde ' +
        'eski ad kalmışsa gösterge doğru, adı yanlış demektir (§23).',
    ).toBe(false)
    expect(
      /(UC|IKI|DORT|BES)\s+EKSENLI/.test(kod),
      'Kaynak KODda eksen sayısı ELLE yazılmış. Sayı SAYI_SOZU[EKSENLER.length] ile ÜRETİLMELİ; ' +
        'elle yazılan sayı eksen eklenince bayatlar.',
    ).toBe(false)
  })

  it('⭐AYIRT EDİCİ: eksen listesi değişirse help DE değişir (üretildiğinin kanıtı)', () => {
    const board = loadBoard(boardDir)
    // Tek yönlü kol yetmez: help'i sabit bir literal döndüren bir uygulama da yukarıdaki
    // "her ad geçiyor" kolunu BUGÜNKÜ listeyle geçerdi. Ayırt edici soru: liste değişince
    // metin DE değişiyor mu? Bu kol onu gerçekten listeyi değiştirerek ölçer.
    const oncekiHelp = board.kullanimMetni()
    const oncekiOzet = board.eksenOzeti()
    const yedek = board.EKSENLER.slice()
    try {
      board.EKSENLER.push({ ad: 'ZZTEST', aciklama: 'sinama ekseni' })
      const yeniHelp = board.kullanimMetni()
      expect(yeniHelp.includes('ZZTEST'), 'Eksen eklendi ama --help onu göstermedi: metin ÜRETİLMİYOR.').toBe(true)
      // ⚠SABOTAJ S2 BU SATIRLARI DOĞURDU: başlığı literal yapmak BUGÜN aynı dizeyi verdiği için
      // "içeriyor" kolunu geçiyordu. Ayırt edici soru başlık için de sorulmalı: liste değişince
      // BAŞLIK da değişiyor mu? Değişmiyorsa başlık dondurulmuş bir kopyadır ve yarın ayrışır.
      expect(
        board.eksenOzeti().includes('ZZTEST'),
        'Eksen eklendi ama eksenOzeti() onu göstermedi — özet ÜRETİLMİYOR.',
      ).toBe(true)
      expect(
        board.eksenOzeti() === oncekiOzet,
        'Liste değişti ama eksenOzeti() AYNI kaldı: özet dondurulmuş literal göstergesi.',
      ).toBe(false)
      // ⚠ASIL ÖLÇÜT BAŞLIĞIN KENDİSİ: S2 `eksenOzeti()`'ni bozmadı, başlığın onu KULLANMASINI
      // bozdu (literal yazdı). Fonksiyonu ölçmek yetmez — başlığın o fonksiyondan ÜRETİLDİĞİ
      // ölçülür. Başlık ancak şerit varken basılır, o yüzden durumu üretiyoruz.
      board.append('session-ayirt', {
        ts: isoAgo(1000),
        type: 'claim',
        lane: 'AYIRT-SINAMA',
        globs: ['src/ayirt-sinama/**'],
      })
      expect(
        board.yoklama().includes('ZZTEST'),
        'Eksen eklendi ama yoklama BAŞLIĞI onu göstermedi: başlık eksenOzeti()\'nden ÜRETİLMİYOR, ' +
          'dondurulmuş bir literal taşıyor. Bugün aynı dizeye eşit olsa bile yarın ayrışır.',
      ).toBe(true)
      const yeniSayi = board.SAYI_SOZU[yedek.length + 1]
      if (yeniSayi) {
        expect(
          yeniHelp.includes(yeniSayi + ' EKSENLI'),
          `Eksen sayısı ${yedek.length + 1} oldu ama --help "${yeniSayi} EKSENLI" demiyor: sayı da üretilmeli.`,
        ).toBe(true)
      }
      expect(yeniHelp === oncekiHelp, 'Liste değişti ama --help AYNI kaldı — sabit literal göstergesi.').toBe(false)
    } finally {
      board.EKSENLER.length = 0
      board.EKSENLER.push(...yedek)
    }
    expect(board.kullanimMetni(), 'Sınama sonrası liste eski hâline dönmedi.').toBe(oncekiHelp)
  })
})
