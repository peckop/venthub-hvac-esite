import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-TEST-HARITA-KAYDEDICI-1 · test haritası KAYDEDİCİSİ (scripts/ci/test-haritasi-kaydedici.cjs, karar 308 B1).
 *
 * Kaydedici bir ÖLÇÜM aracıdır: yanlış kayıt, haritadaki bir bağımlılığı sessizce düşürür ve seçici o testi ELER. Bu dosya iki şeyi ölçer:
 *   1. SAF yardımcılar: yol normalleştirme (köke göreli POSIX, kök dışı/node_modules/.git yok sayılır), alt süreç sınıflama
 *      (node izlenir; repo içindeki git ve python/sh izlenemez = `belirsiz`), glob önek çıkarımı,
 *   2. UÇTAN UCA (gerçek alt süreç): kaydedici ayrı bir `node` sürecinde kurulur; eşzamanlı/geri çağrılı/`fs.promises` okumaları, dizin
 *      okuması (`recursive` dahil), var olmayan yolun yoklaması, `require` ve yerel ESM `import()` yüklemeleri, testin başlattığı `node`
 *      çocuğunun okumaları (çocuk ham kaydı) ve izlenemeyen `git` çocuğunun `belirsiz` düşmesi gerçekten kayda geçer; kaydın kendi
 *      yazımı, kök dışı yollar, `node_modules` ve `.git` kayda GİRMEZ.
 * Kaydedici vitest işçisine kurulumu `test-haritasi-kurulum*.ts` yapar; o kablolama TAM ölçüm koşusunda (test-haritasi-uret.cjs)
 * doğrulanır: her koşuda ham kayıt yoksa test haritada "kayıtsız" kalır ve seçici onu HER ZAMAN koşturur (güvenli yön).
 */

type Kaydedici = {
  ORTAM: { KLASOR: string; KOK: string; TEST: string; COCUK: string }
  yoluNormalle: (girdi: unknown, kok?: string) => string | null
  surecSinifla: (komut: unknown, argv: unknown, secenek: unknown, kok?: string) => { tur: string; betik?: string | null; taban?: string; altKomut?: string; disarida?: boolean; belirsiz?: string | null }
  desenOneki: (desen: unknown) => string | null
  nodeBetigi: (argumanlar: string[]) => string | null
  gitAyristir: (sozcukler: string[], cwd: string) => { altKomut: string; kalan?: string[]; cwd: string; gitDizini: string | null }
  gitDosyayaBagli: (altKomut: string, kalan: string[]) => boolean
}

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KAYDEDICI_YOLU = path.join(KOK, 'scripts/ci/test-haritasi-kaydedici.cjs')
const K = require_(KAYDEDICI_YOLU) as Kaydedici

describe('INV-TEST-HARITA-KAYDEDICI-1 · 1. yol normalleştirme', () => {
  const kok = path.resolve(tmpdir(), 'kayit-kok')
  const tablo: Array<[string, unknown, string | null]> = [
    ['köke göreli dosya', path.join(kok, 'docs', 'a.md'), 'docs/a.md'],
    ['kökün kendisi', kok, '.'],
    ['kök dışı', path.resolve(kok, '..', 'baska', 'x.md'), null],
    ['kök dışı komşu önek', `${kok}-ekstra${path.sep}x.md`, null],
    ['node_modules içi', path.join(kok, 'node_modules', 'x', 'i.js'), null],
    ['iç içe node_modules', path.join(kok, 'a', 'node_modules', 'b.js'), null],
    ['.git içi', path.join(kok, '.git', 'HEAD'), null],
    ['.github (git DEĞİL)', path.join(kok, '.github', 'x.yml'), '.github/x.yml'],
    ['URL (file:)', new URL(`file://${path.sep === '\\' ? '/' : ''}${path.join(kok, 'docs', 'b.md').split(path.sep).join('/')}`), 'docs/b.md'],
    ['URL (http:)', new URL('http://example.com/x'), null],
    ['Buffer', Buffer.from(path.join(kok, 'docs', 'c.md')), 'docs/c.md'],
    ['dosya tanıtıcısı (sayı)', 3, null],
    ['undefined', undefined, null],
    ['boş metin', '', null],
    ['NUL içeren', `${path.join(kok, 'a')}\0b`, null],
  ]
  it.each(tablo)('%s', (_ad, girdi, beklenen) => {
    expect(K.yoluNormalle(girdi, kok)).toBe(beklenen)
  })
  it('göreli yol işlem dizinine göre çözülür (vitest kökü = depo kökü)', () => {
    expect(K.yoluNormalle('docs/a.md', process.cwd())).toBe('docs/a.md')
    expect(K.yoluNormalle('../dışarı', process.cwd())).toBeNull()
  })
})

describe('INV-TEST-HARITA-KAYDEDICI-1 · 2. alt süreç sınıflama (izlenen = node; izlenemeyen ve dosyaya bağlı = belirsiz)', () => {
  const kok = path.resolve(tmpdir(), 'kayit-kok2')
  const dis = path.resolve(tmpdir(), 'baska-yer')
  it('node (process.execPath ve ad) izlenir; betik ilk seçenek-dışı argümandır; -e/-p satır içi koddur (betik YOK)', () => {
    expect(K.surecSinifla(process.execPath, ['scripts/x.cjs', '--bayrak'], {}, kok)).toEqual({ tur: 'node', betik: 'scripts/x.cjs' })
    expect(K.surecSinifla('node', ['--no-warnings', 'a.mjs'], {}, kok)).toEqual({ tur: 'node', betik: 'a.mjs' })
    expect(K.surecSinifla('node', [], {}, kok)).toEqual({ tur: 'node', betik: null })
    for (const satirIci of [['-e', 'console.log(1)'], ['-p', '1+1'], ['--eval', 'x'], ['--eval=x'], ['--print=1']]) {
      expect(K.surecSinifla('node.exe', satirIci, {}, kok).betik, JSON.stringify(satirIci)).toBeNull()
    }
    // değer alan seçenekler betik SANILMAZ
    expect(K.surecSinifla('node', ['-r', 'oncelik.js', 'scripts/a.cjs'], {}, kok).betik).toBe('scripts/a.cjs')
    expect(K.surecSinifla('node', ['--import', 'x.mjs', '--require', 'y.cjs', 'b.mjs'], {}, kok).betik).toBe('b.mjs')
    expect(K.nodeBetigi(['--max-old-space-size=4096', 'c.cjs', 'arg'])).toBe('c.cjs')
  })
  it('git: repo İÇİNDE dosyaya bağlı alt komut belirsiz; üst veri komutu, repo dışı (cwd / -C / --git-dir) değil', () => {
    for (const bagli of [['ls-files'], ['diff', '--name-only'], ['status', '--porcelain'], ['grep', 'x'], ['check-ignore', 'a'], ['cat-file', '-p', 'HEAD'], ['show', 'HEAD'], ['ls-tree', 'HEAD']]) {
      expect(K.surecSinifla('git', bagli, { cwd: kok }, kok).belirsiz, bagli.join(' ')).toMatch(/izlenemeyen/)
      expect(K.surecSinifla('git', bagli, { cwd: dis }, kok).belirsiz, `${bagli.join(' ')} (repo dışı cwd)`).toBeNull()
    }
    for (const ustVeri of [['rev-parse', 'HEAD'], ['--version'], ['branch', '--show-current'], ['worktree', 'list'], ['config', 'user.name'], ['init', '-q'], ['commit', '-m', 'x'], ['add', '-A'], ['fetch'], ['merge-base', 'a', 'b']]) {
      expect(K.surecSinifla('git', ustVeri, { cwd: kok }, kok).belirsiz, ustVeri.join(' ')).toBeNull()
    }
  })
  it('git log|show|rev-list: yalnız dosya/diff/yol isteyince bağlı (üst veri sorgusu bağlı DEĞİL)', () => {
    const bagli = (alt: string, ...a: string[]) => K.gitDosyayaBagli(alt, a)
    expect(bagli('log', '-1', '--format=%H')).toBe(false)
    expect(bagli('log', '-5', '--oneline', 'HEAD')).toBe(false)
    expect(bagli('log', 'v1.0.0..HEAD', '--oneline')).toBe(false)
    expect(bagli('log', '-1', '--', 'docs/x.md')).toBe(true)
    expect(bagli('log', '-1', 'docs/a.md')).toBe(true)
    expect(bagli('log', '--name-only')).toBe(true)
    expect(bagli('log', '--stat', '-1')).toBe(true)
    expect(bagli('log', '-p')).toBe(true)
    expect(bagli('show', '-s', '--format=%H', 'HEAD')).toBe(false)
    expect(bagli('show', 'HEAD:docs/a.md')).toBe(true)
    expect(bagli('show', 'HEAD')).toBe(true)
    expect(bagli('rev-list', '--count', 'HEAD')).toBe(false)
    expect(bagli('rev-list', '--objects', 'HEAD')).toBe(true)
    expect(bagli('ls-files')).toBe(true)
    expect(bagli('bilinmeyen-komut')).toBe(true)
    expect(bagli('rev-parse')).toBe(false)
  })
  it('git genel seçenekleri alt komut SAYILMAZ: -C yol, -c a=b, --git-dir yol; -C etkin çalışma dizinini değiştirir', () => {
    const g = K.gitAyristir(['-C', dis, '-c', 'user.name=x', 'log', '-1'], kok)
    expect(g.altKomut).toBe('log')
    expect(g.kalan).toEqual(['-1'])
    expect(g.cwd).toBe(dis)
    expect(K.gitAyristir(['--git-dir', dis, 'status'], kok)).toMatchObject({ altKomut: 'status', gitDizini: dis })
    expect(K.gitAyristir(['--no-pager', '--git-dir=' + dis, 'diff'], kok)).toMatchObject({ altKomut: 'diff', gitDizini: dis })
    expect(K.gitAyristir(['--version'], kok).altKomut).toBe('--version')
    // -C dış dizini göstermiyorsa repo içidir (kök göreli yol çalışma dizinine göre çözülür)
    expect(K.surecSinifla('git', ['-C', kok, 'ls-files'], { cwd: dis }, kok).belirsiz).toMatch(/git ls-files/)
    expect(K.surecSinifla('git', ['-C', dis, 'ls-files'], { cwd: kok }, kok).belirsiz).toBeNull()
    expect(K.surecSinifla('git', ['--git-dir', path.join(dis, '.git'), 'ls-files'], { cwd: kok }, kok).belirsiz).toBeNull()
  })
  it('kabuk satırı ve shell:true: komut + argümanlar tek metin sayılır', () => {
    expect(K.surecSinifla('git ls-files | wc -l', [], { shell: true, cwd: kok }, kok).belirsiz).toMatch(/git ls-files/)
    expect(K.surecSinifla('git', ['diff'], { shell: true, cwd: kok }, kok).belirsiz).toMatch(/git diff/)
    expect(K.surecSinifla('node scripts/a.cjs', [], { shell: true, cwd: kok }, kok)).toEqual({ tur: 'node', betik: 'scripts/a.cjs' })
    expect(K.surecSinifla('echo x && git status', [], { shell: true, cwd: kok }, kok).belirsiz).toMatch(/git status/)
    // Repo DIŞINDA çalışan kabuk satırı repo durumuna bağlı değildir
    expect(K.surecSinifla('git ls-files | wc -l', [], { shell: true, cwd: dis }, kok).belirsiz).toBeNull()
  })
  it('claude: belgeli yapılandırma ayak izi kaydedilir, belirsiz DEĞİL; işletim sistemi araçları belirsiz DEĞİL', () => {
    expect(K.surecSinifla('claude', ['--version'], {}, kok)).toEqual({ tur: 'claude', taban: 'claude', belirsiz: null })
    for (const arac of ['net', 'taskkill', 'tasklist', 'whoami', 'hostname', 'uname']) {
      expect(K.surecSinifla(arac, ['x'], {}, kok), arac).toMatchObject({ tur: 'os', belirsiz: null })
    }
  })
  it('python, sh, cmd, deno, pnpm, powershell: çalışma dizini repo İÇİNDEYSE ya da argüman repoyu anıyorsa belirsiz; yoksa değil', () => {
    for (const k of ['python', 'python3', 'sh', 'bash', 'cmd.exe', 'deno', 'pnpm', 'tsc', 'powershell']) {
      const ic = K.surecSinifla(k, ['x'], { cwd: kok }, kok)
      expect(ic.tur, k).toBe('diger')
      expect(ic.belirsiz, k).toMatch(/izlenemeyen süreç/)
      const dista = K.surecSinifla(k, ['x.py'], { cwd: dis }, kok)
      expect(dista.belirsiz, `${k} (repo dışı cwd)`).toBeNull()
      expect(dista.disarida, k).toBe(true)
      // dışarıdaki çalışma dizininde bile argüman repo yolunu anıyorsa bağlıdır
      expect(K.surecSinifla(k, [path.join(kok, 'scripts', 'a.sh')], { cwd: dis }, kok).belirsiz, `${k} (repo yolu argümanı)`).toMatch(/izlenemeyen/)
      expect(K.surecSinifla(k, ['-c', `cat ${kok}/package.json`], { cwd: dis }, kok).belirsiz, `${k} (komut metni repo kökünü anıyor)`).toMatch(/izlenemeyen/)
    }
  })
})

describe('INV-TEST-HARITA-KAYDEDICI-1 · 3. glob önek çıkarımı', () => {
  it.each([
    ['src/**/*.ts', 'src'],
    ['supabase/migrations/*.sql', 'supabase/migrations'],
    ['**/x.ts', ''],
    ['docs/a.md', 'docs'],
    ['{a,b}/x', ''],
    ['a/b/[c]/d', 'a/b'],
  ])('%s → %s', (desen, beklenen) => {
    expect(K.desenOneki(desen)).toBe(beklenen)
  })
  it('metin olmayan desen → null', () => {
    expect(K.desenOneki(['a'])).toBeNull()
    expect(K.desenOneki(5)).toBeNull()
  })
})

type Ham = {
  surum: number
  test: string
  kurulum: { okunan: string[]; dizin: string[]; ozy: string[] }
  okunan: string[]
  dizin: string[]
  ozy: string[]
  surec: string[]
  belirsiz: string[]
}

describe('INV-TEST-HARITA-KAYDEDICI-1 · 4. uçtan uca (gerçek alt süreç)', () => {
  function kurulum(): { kok: string; klasor: string; calistir: () => { durum: number | null; stderr: string; kayit: Ham; cocuklar: Ham[] } } {
    const kok = mkdtempSync(path.join(tmpdir(), 'kayit-e2e-kok-'))
    const klasor = mkdtempSync(path.join(tmpdir(), 'kayit-e2e-ham-'))
    for (const d of ['docs', 'docs/alt', 'src', 'node_modules/x', '.git', 'scripts', 'ozyin/a/b']) mkdirSync(path.join(kok, d), { recursive: true })
    writeFileSync(path.join(kok, 'docs/a.md'), 'a')
    writeFileSync(path.join(kok, 'docs/b.md'), 'b')
    writeFileSync(path.join(kok, 'docs/alt/c.md'), 'c')
    writeFileSync(path.join(kok, 'src/modul.cjs'), 'module.exports = 1\n')
    writeFileSync(path.join(kok, 'src/modul.mjs'), 'export default 2\n')
    writeFileSync(path.join(kok, 'node_modules/x/i.js'), 'x')
    writeFileSync(path.join(kok, '.git/HEAD'), 'ref')
    writeFileSync(path.join(kok, 'ozyin/a/b/d.txt'), 'd')
    writeFileSync(path.join(kok, 'scripts/cocuk.cjs'), "const fs = require('node:fs'); fs.readFileSync(require('node:path').join(__dirname, '..', 'docs', 'b.md'), 'utf8'); fs.readdirSync(require('node:path').join(__dirname, '..', 'docs', 'alt')); require('node:child_process').execFileSync(process.execPath, ['-e', 'require(\\'node:fs\\').readFileSync(process.env.TORUN_YOLU)'], { env: { ...process.env, TORUN_YOLU: require('node:path').join(__dirname, '..', 'docs', 'a.md') } })\n")
    const surucu = path.join(kok, 'surucu.cjs')
    writeFileSync(
      surucu,
      [
        "const path = require('node:path'), fs = require('node:fs'), cp = require('node:child_process'), { pathToFileURL } = require('node:url')",
        `const K = require(${JSON.stringify(KAYDEDICI_YOLU)})`,
        'K.kur(); K.basla(path.join(process.env.VENTHUB_HARITA_KOK, "src/ornek.test.ts"), "kurulum")',
        "fs.readFileSync(path.join(process.env.VENTHUB_HARITA_KOK, 'package.json'), 'utf8')",
        'K.fazDegistir("test")',
        "const kok = process.env.VENTHUB_HARITA_KOK, j = (...p) => path.join(kok, ...p)",
        "fs.readFileSync(j('docs/a.md'), 'utf8')",
        "fs.existsSync(j('docs/yok-olan.md'))",
        "fs.statSync(j('docs/b.md'))",
        "fs.readdirSync(j('docs'))",
        "fs.readdirSync(j('ozyin'), { recursive: true })",
        "fs.readFile(j('docs/alt/c.md'), () => {})",
        "fs.readFileSync(j('node_modules/x/i.js'))",
        "fs.readFileSync(j('.git/HEAD'))",
        "try { fs.readFileSync(path.join(path.dirname(kok), 'kok-disi-dosya.txt')) } catch {}",
        "require(j('src/modul.cjs'))",
        "fs.openSync(j('docs/b.md'), 'r'); fs.openSync(j('yazilan.txt'), 'w')",
        "cp.execFileSync(process.execPath, [j('scripts/cocuk.cjs')])",
        "cp.execFileSync(process.execPath, ['-e', '1'])",
        "try { cp.execFileSync('git', ['ls-files'], { cwd: kok, stdio: 'ignore' }) } catch {}",
        "try { cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: kok, stdio: 'ignore' }) } catch {}",
        "cp.spawnSync('python-yok-xyz', ['x'], { cwd: kok })",
        "cp.spawnSync('claude-yok-xyz', ['x'], { cwd: path.dirname(kok) })",
        "cp.spawnSync('claude', ['--version'], { cwd: kok })",
        "fs.promises.readFile(j('docs/b.md')).then(() => import(pathToFileURL(j('src/modul.mjs')).href)).then(() => { K.bitir() })",
      ].join('\n'),
    )
    writeFileSync(path.join(kok, 'package.json'), '{}')
    return {
      kok,
      klasor,
      calistir: () => {
        const s = spawnSync(process.execPath, [surucu], {
          cwd: kok,
          encoding: 'utf8',
          env: { ...process.env, VENTHUB_HARITA_KLASOR: klasor, VENTHUB_HARITA_KOK: kok, NODE_OPTIONS: '' },
        })
        const dosyalar = readdirSync(klasor).filter((d) => d.endsWith('.json'))
        const oku = (d: string) => JSON.parse(readFileSync(path.join(klasor, d), 'utf8')) as Ham
        return {
          durum: s.status,
          stderr: s.stderr,
          kayit: oku(dosyalar.find((d) => !/\.c\d+-\d+\.json$/.test(d)) ?? 'yok.json'),
          cocuklar: dosyalar.filter((d) => /\.c\d+-\d+\.json$/.test(d)).map(oku),
        }
      },
    }
  }

  // Alt süreçli sürücü BİR KEZ koşar (her test aynı ham kaydı okur): süre ve gürültü azalır.
  let onbellek: ReturnType<ReturnType<typeof kurulum>['calistir']> | null = null
  const calisma = () => {
    onbellek = onbellek ?? kurulum().calistir()
    return onbellek
  }

  it('okumalar köke göreli POSIX olarak doğru türde kayda geçer; kök dışı, node_modules, .git, yazma ve kendi kaydı girmez', () => {
    const { kayit, durum, stderr } = calisma()
    expect(stderr).toBe('')
    expect(durum).toBe(0)
    expect(kayit.test).toBe('src/ornek.test.ts')
    // dosyalar
    // `src/modul.mjs`: `import(pathToFileURL(yol).href)` ile yerel ESM yüklemesi; Node yükleyicisi dosyayı iç `fs` ile okur, kaydedici `pathToFileURL(yol)`
    // çağrısını yakalar (module.registerHooks vitest işçisinde `require(esm)` çağrısını bozduğu için KULLANILMIYOR).
    for (const beklenen of ['docs/a.md', 'docs/yok-olan.md', 'docs/b.md', 'docs/alt/c.md', 'src/modul.cjs', 'src/modul.mjs', 'scripts/cocuk.cjs']) {
      expect(kayit.okunan, beklenen).toContain(beklenen)
    }
    // dizinler: `docs` listelendi, `ozyin` alt ağaç olarak
    expect(kayit.dizin).toContain('docs')
    expect(kayit.ozy).toContain('ozyin')
    // girmeyenler
    const hepsi = [...kayit.okunan, ...kayit.dizin, ...kayit.ozy]
    expect(hepsi.some((p) => p.includes('node_modules')), 'node_modules girmemeli').toBe(false)
    expect(hepsi.some((p) => p === '.git' || p.startsWith('.git/')), '.git girmemeli').toBe(false)
    expect(hepsi.some((p) => p.includes('kok-disi')), 'kök dışı girmemeli').toBe(false)
    expect(hepsi.some((p) => p.includes('yazilan.txt')), 'yazma okuma sayılmamalı').toBe(false)
    expect(hepsi.some((p) => p.includes('kayit-e2e-ham')), 'ham kayıt dosyasının kendisi (kendi yazımı) girmemeli').toBe(false)
    expect(hepsi.some((p) => p.startsWith('..') || path.isAbsolute(p) || p.includes('\\')), 'yollar köke göreli POSIX olmalı').toBe(false)
  })

  it('kurulum evresindeki okuma `kurulum` altına yazılır, test evresindekiler `okunan`a', () => {
    const { kayit } = calisma()
    expect(kayit.kurulum.okunan).toContain('package.json')
    expect(kayit.okunan).not.toContain('package.json')
  })

  it('izlenen node çocuğunun okumaları (iç içe torun dahil) ayrı çocuk ham kaydına yazılır; betik kendisi okunan sayılır', () => {
    const { cocuklar, kayit } = calisma()
    const cocukOkunan = new Set(cocuklar.flatMap((c) => c.okunan))
    const cocukDizin = new Set(cocuklar.flatMap((c) => c.dizin))
    expect(cocuklar.length).toBeGreaterThanOrEqual(2)
    expect(cocuklar.every((c) => c.test === 'src/ornek.test.ts'), 'çocuk kaydı AYNI teste yazılmalı').toBe(true)
    expect(cocukOkunan).toContain('docs/b.md')
    expect(cocukOkunan).toContain('docs/a.md') // torun (çocuğun başlattığı node) env'i aktarmadan bile izlendi mi: yukarıdaki env + NODE_OPTIONS enjeksiyonu
    expect(cocukDizin).toContain('docs/alt')
    expect(kayit.surec.some((s) => s === 'node scripts/cocuk.cjs')).toBe(true)
  })

  it('izlenemeyen çocuklar (repo içinde dosyaya bağlı git, bulunamayan/python benzeri) `belirsiz` ve `surec` etiketi olarak düşer; üst veri komutu düşmez', () => {
    const { kayit } = calisma()
    expect(kayit.belirsiz.some((b) => /git ls-files.*izlenemeyen/.test(b))).toBe(true)
    expect(kayit.belirsiz.some((b) => /python-yok-xyz.*izlenemeyen/.test(b))).toBe(true)
    expect(kayit.belirsiz.some((b) => /rev-parse/.test(b)), 'git rev-parse üst veridir, belirsiz değil').toBe(false)
    expect(kayit.surec).toContain('git ls-files')
    expect(kayit.surec).toContain('git rev-parse')
    expect(kayit.surec).toContain('node (satır içi)')
  })

  it('claude: çalışma dizini repo içindeyse belgeli yapılandırma ayak izi (.claude alt ağacı, CLAUDE.md, .mcp.json) yazılır, belirsiz DEĞİL', () => {
    const { kayit } = calisma()
    expect(kayit.ozy).toContain('.claude')
    expect(kayit.okunan).toContain('CLAUDE.md')
    expect(kayit.okunan).toContain('.mcp.json')
    expect(kayit.belirsiz.some((b) => /claude/.test(b))).toBe(false)
    expect(kayit.surec).toContain('claude')
  })

  it('repo DIŞINDA çalışan, depoya değmeyen bilinmeyen süreç belirsiz DEĞİL ve etiketi "(repo dışı)" taşır', () => {
    const { kayit } = calisma()
    expect(kayit.surec).toContain('claude-yok-xyz (repo dışı)')
    expect(kayit.belirsiz.some((b) => /claude-yok-xyz/.test(b))).toBe(false)
  })

  it('kayıt BELİRLENİMLİ: diziler sıralı ve tekil', () => {
    const { kayit } = calisma()
    for (const alan of ['okunan', 'dizin', 'ozy', 'surec', 'belirsiz'] as const) {
      expect(kayit[alan], alan).toEqual([...new Set(kayit[alan])].sort())
    }
  })
})
