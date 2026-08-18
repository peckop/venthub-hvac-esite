import { execFileSync, spawnSync } from 'node:child_process'
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
