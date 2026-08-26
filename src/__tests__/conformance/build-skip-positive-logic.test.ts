import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BUILD-SKIP · Vercel "Ignored Build Step" betiği POZİTİF mantıkla çalışır.
 *
 * CETVEL: `docs/standards/deploy-build-skip-standard.md`
 * BETİK:  `scripts/vercel-ignore-build.sh`
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR
 * ─────────────────────────────────────────────────────────────────────────────
 * Dağıtım tavanının %47'si israftı (2026-08-17 ölçümü); altı SALT-MARKDOWN PR'ı
 * tek başına günlük tavanın %12'sini yakmıştı ve tavan dolunca TÜM filo durdu.
 * Çözüm build'i atlamak — ama YANLIŞ atlama, doğrudan "kod değişti, deploy olmadı"
 * sınıfını doğurur ki bu 2026-08-15 vitrin kazasının kardeşidir.
 *
 * BU KAPI STATİK TARAMA DEĞİL, DAVRANIŞ ÖLÇÜMÜDÜR: betiği gerçek girdilerle
 * ÇALIŞTIRIR ve çıkış kodunu okur. Betiğin metnine bakan bir test, `case`
 * dallarının gerçekte ne yaptığını göremezdi.
 *
 * ⚠️ ÇIKIŞ KODU SEZGİYE TERS (Vercel sözleşmesi):
 *        exit 0 → build ATLANIR      exit 1 → build ÇALIŞIR
 * Ters çevrilirse HER build sessizce atlanır. Bu kapının asıl varlık sebebi
 * o sessiz felaketi imkânsız kılmaktır.
 */

const SCRIPT = 'scripts/vercel-ignore-build.sh'

/** exit 0 = ATLA, exit 1 = BUILD. */
type Karar = 'ATLA' | 'BUILD'

function kararVer(degisenDosyalar: string[]): Karar {
  const dir = mkdtempSync(join(tmpdir(), 'inv-build-skip-'))
  const listFile = join(dir, 'files.txt')
  writeFileSync(listFile, degisenDosyalar.join('\n'), 'utf8')

  try {
    // Hata fırlatmazsa exit 0 demektir → ATLA
    execFileSync('sh', [SCRIPT, listFile], { stdio: 'pipe' })
    return 'ATLA'
  } catch (err) {
    const status = (err as { status?: number }).status
    // `sh` hiç çalışmadıysa (ENOENT) status undefined olur — bunu "BUILD" diye
    // yorumlamak kapıyı sessizce anlamsızlaştırırdı (ölçemedik ama yeşil geçtik).
    if (typeof status !== 'number') {
      throw new Error(
        `\`sh\` çalıştırılamadı; bu kapı ölçüm yapamıyor. Orijinal hata: ${String(err)}`,
      )
    }
    return 'BUILD'
  }
}

describe('INV-BUILD-SKIP · ignore-build betiği pozitif mantıkla karar verir', () => {
  it('ölçüm aracı gerçekten çalışıyor (vacuous-pass koruması)', () => {
    // Betik hiç çalışmıyorsa aşağıdaki her assert "BUILD" görür ve kapı
    // yanlışlıkla yeşil kalırdı. Önce ATLA üretebildiğini kanıtla.
    expect(kararVer(['README.md'])).toBe('ATLA')
  })

  describe('build GEREKTİREN değişiklikler ATLANMAZ', () => {
    const buildGerektiren: Array<[string, string[]]> = [
      ['kaynak kodu', ['src/app/page.tsx']],
      ['tek bir .ts dosyası dokümanlara karışsa bile', ['docs/a.md', 'src/lib/foo.ts']],
      ['bağımlılık/yapılandırma', ['package.json']],
      ['Next yapılandırması', ['next.config.mjs']],
      ['migration (önizleme dağıtımı gerekir)', ['supabase/migrations/20260818_x.sql']],
      ['edge fonksiyonu', ['supabase/functions/iyzico-payment/index.ts']],
      ['TANIMADIĞI bir uzantı (varsayılan güvenli taraf)', ['src/content/a.mdx']],
      ['ada benzeyen ama farklı dizin', ['docsfake/a.ts']],
      ['kök yapılandırma dosyası', ['.gitignore']],
      // --- KAPSAM DARLIĞI (2026-08-26, scripts/board + .githooks eklenirken) ---
      // Bu dört kol, EKLENEN sınıfın GENİŞLEMEDİĞİNİ kanıtlar. Olmasalardı
      // `scripts/*` ya da `.githooks*` yazmak da kapıyı yeşil bırakırdı ve
      // atlama sınıfı sessizce büyürdü — "kapıyı açmak yeni tehlike doğurur".
      ['ignore-build betiğinin KENDİSİ (scripts/ tümü atlanmaz)', ['scripts/vercel-ignore-build.sh']],
      ['kancaları KURAN betik (koşan dosya bu, kancalar değil)', ['scripts/setup-hooks.mjs']],
      ['board ADINA benzeyen ama farklı yol', ['scripts/boardfake.ts']],
      ['githooks ADINA benzeyen ama farklı dizin', ['.githooksfake/pre-commit']],
    ]

    for (const [ad, dosyalar] of buildGerektiren) {
      it(`${ad} → BUILD`, () => {
        expect(kararVer(dosyalar)).toBe('BUILD')
      })
    }
  })

  describe('build GEREKTİRMEYEN sınıf atlanır', () => {
    const atlanabilir: Array<[string, string[]]> = [
      ['salt markdown', ['README.md', 'docs/standards/x.md']],
      ['companion doküman (src ağacının içinde ama .md)', ['src/views/CartPage.md']],
      ['ajan yetenek ağacı', ['.claude/skills/x/SKILL.md']],
      ['CI yapılandırması', ['.github/workflows/ci.yml']],
      ['şerit panosu aracı', ['scripts/board/board.cjs']],
      ['panonun alt dizini (yıldız `/` de yutar)', ['scripts/board/lib/x.cjs']],
      ['git kancasının kendisi', ['.githooks/pre-commit']],
    ]

    for (const [ad, dosyalar] of atlanabilir) {
      it(`${ad} → ATLA`, () => {
        expect(kararVer(dosyalar)).toBe('ATLA')
      })
    }
  })

  /**
   * VACUOUS-SKIP: boş liste "hiçbir şey değişmedi" DEĞİL, "ölçemedim" olabilir.
   * Boş kümede "her dosya güvenli" iddiası vacuous olarak doğrudur ve kapıyı
   * sessizce açar. Bu, kapı yazarken tekrar tekrar karşımıza çıkan sınıftır.
   */
  it('boş değişiklik listesi ATLAMAYA değil BUILD\'e düşer', () => {
    expect(kararVer([])).toBe('BUILD')
    expect(kararVer([''])).toBe('BUILD')
  })

  /**
   * POZİTİF MANTIĞIN ASIL KANITI: betiğin hiç tanımadığı, uydurma bir dosya türü
   * bile build'i TETİKLEMELİ. Negatif liste ile yazılmış olsaydı bu geçerdi.
   */
  it('hiç tanımadığı bir dosya türü BUILD tetikler (negatif-liste değil)', () => {
    expect(kararVer(['bilinmeyen/uzanti.qqq'])).toBe('BUILD')
    expect(kararVer(['yeni-teknoloji.zig'])).toBe('BUILD')
  })

  /**
   * `VERCEL_GIT_PREVIOUS_SHA` **son BAŞARILI dağıtımın** SHA'sıdır, önceki commit
   * değil. `HEAD^`'e düşmek, arka arkaya atlanan commit'lerden sonra daha eski bir
   * kaynak değişikliğini görünmez kılar → tam olarak "kod değişti, deploy olmadı".
   * Bu assert o değişkenin kullanımını sabitler.
   */
  it('taban olarak VERCEL_GIT_PREVIOUS_SHA kullanılır (HEAD^ değil)', () => {
    const src = readFileSync(SCRIPT, 'utf8')
    expect(src, 'betik VERCEL_GIT_PREVIOUS_SHA kullanmıyor').toContain('VERCEL_GIT_PREVIOUS_SHA')

    const kod = src.replace(/^\s*#.*$/gm, '')
    expect(
      /git\s+diff[^\n]*HEAD\^/.test(kod),
      'betik HEAD^ ile karşılaştırıyor — atlanan commit\'lerin değişikliği kaybolur',
    ).toBe(false)
  })
})

/* ===========================================================================
 * TABAN ÇÖZÜMÜ — GERÇEK GIT DEPOSU ÜZERİNDE
 * ===========================================================================
 *
 * NİÇİN AYRI BİR BÖLÜM: yukarıdaki testler betiği **dosya-listesi kipinde**
 * koşturur (birinci argüman). O kip taban çözümünü HİÇ ÇALIŞTIRMAZ — yani
 * betiğin "hangi commit'e göre karşılaştıracağım" mantığı, kapı yeşilken bile
 * ölçülmemiş kalıyordu. 2026-08-18'de bu boşlukta gerçek bir kusur yaşadı:
 * `VERCEL_GIT_PREVIOUS_SHA` her önizleme dağıtımında BOŞ geliyordu ve atlama hiç
 * çalışmıyordu; kapı bunu göremedi çünkü o dala hiç girmiyordu.
 *
 * Buradaki testler geçici bir GERÇEK depo kurar, `origin/master` referansını
 * elle yazar ve betiği o deponun içinde çalıştırır. Ağ yok, Vercel yok.
 */

const SCRIPT_MUTLAK = resolve(SCRIPT).replace(/\\/g, '/')

function git(cwd: string, ...args: string[]): string {
  return execFileSync(
    'git',
    ['-c', 'user.email=gate@venthub.test', '-c', 'user.name=INV-BUILD-SKIP', ...args],
    { cwd, stdio: 'pipe', encoding: 'utf8' },
  )
}

/** İçinde `master` dalı ve `origin/master` referansı olan geçici depo kurar. */
function depoKur(): string {
  const dir = mkdtempSync(join(tmpdir(), 'inv-build-skip-git-')).replace(/\\/g, '/')
  git(dir, 'init', '--initial-branch=master', '--quiet')
  writeFileSync(join(dir, 'README.md'), 'ilk\n', 'utf8')
  writeFileSync(join(dir, 'src.ts'), 'export const a = 1\n', 'utf8')
  git(dir, 'add', '.')
  git(dir, 'commit', '--quiet', '-m', 'ilk commit')
  // Uzak referansı ağ olmadan kur: betik `origin/master`'ı bu yolla görür.
  git(dir, 'update-ref', 'refs/remotes/origin/master', git(dir, 'rev-parse', 'HEAD').trim())
  return dir
}

function commitAt(dir: string, dosya: string, icerik: string, mesaj: string): void {
  const tam = join(dir, dosya)
  const klasor = tam.slice(0, Math.max(tam.lastIndexOf('/'), tam.lastIndexOf('\\')))
  execFileSync('sh', ['-c', `mkdir -p "${klasor.replace(/\\/g, '/')}"`], { stdio: 'pipe' })
  writeFileSync(tam, icerik, 'utf8')
  git(dir, 'add', '.')
  git(dir, 'commit', '--quiet', '-m', mesaj)
}

/** Betiği gerçek depoda, verilen ortam değişkenleriyle koşturur. */
function depodaKararVer(dir: string, env: Record<string, string> = {}): Karar {
  try {
    execFileSync('sh', [SCRIPT_MUTLAK], {
      cwd: dir,
      stdio: 'pipe',
      env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: '', ...env },
    })
    return 'ATLA'
  } catch (err) {
    const status = (err as { status?: number }).status
    if (typeof status !== 'number') {
      throw new Error(`\`sh\` çalıştırılamadı; bu kapı ölçüm yapamıyor: ${String(err)}`)
    }
    return 'BUILD'
  }
}

describe('INV-BUILD-SKIP · karşılaştırma tabanı gerçek depoda çözülür', () => {
  it('ölçüm aracı gerçekten çalışıyor: salt-.md dal ATLANIR (vacuous-pass koruması)', () => {
    // Bu test aynı zamanda ASIL DÜZELTMEnin kanıtıdır: VERCEL_GIT_PREVIOUS_SHA
    // BOŞ ve betik yine de doğru tabanı (ortak ata) bulup atlayabiliyor.
    const dir = depoKur()
    git(dir, 'checkout', '--quiet', '-b', 'docs/x')
    commitAt(dir, 'docs/a.md', 'metin\n', 'docs: a')
    expect(depodaKararVer(dir)).toBe('ATLA')
  })

  /**
   * ZİNCİRİN ASIL SEBEBİ. `HEAD^` kullanılsaydı bu senaryo ATLA derdi: son commit
   * salt-.md, ama dalın İÇİNDE daha önce bir kaynak değişikliği var ve o değişiklik
   * HİÇ dağıtılmamış olabilir. Ortak ata dalın TAMAMINI kapsadığı için görülür.
   */
  it('dalın ÖNCEKİ commit\'inde kod varsa, son commit salt-.md olsa bile BUILD', () => {
    const dir = depoKur()
    git(dir, 'checkout', '--quiet', '-b', 'feat/x')
    commitAt(dir, 'src/yeni.ts', 'export const b = 2\n', 'feat: kod')
    commitAt(dir, 'docs/b.md', 'metin\n', 'docs: b')
    expect(depodaKararVer(dir)).toBe('BUILD')
  })

  it('VERCEL_GIT_PREVIOUS_SHA dolu ama klonda YOKSA ortak ataya düşer, sessizce atlamaz', () => {
    const dir = depoKur()
    git(dir, 'checkout', '--quiet', '-b', 'feat/y')
    commitAt(dir, 'src/yeni.ts', 'export const c = 3\n', 'feat: kod')
    // 40 haneli ama var olmayan bir SHA — sığ klon/force-push sınıfının taklidi.
    const karar = depodaKararVer(dir, {
      VERCEL_GIT_PREVIOUS_SHA: '0123456789abcdef0123456789abcdef01234567',
    })
    expect(karar).toBe('BUILD')
  })

  it('HEAD varsayılan dalın ucuysa (üretim dağıtımı) BUILD — boş diff atlama gerekçesi değildir', () => {
    const dir = depoKur()
    expect(depodaKararVer(dir)).toBe('BUILD')
  })

  it('origin/master hiç yoksa BUILD (ölçemediğimizde atlamayız)', () => {
    const dir = depoKur()
    git(dir, 'checkout', '--quiet', '-b', 'docs/z')
    commitAt(dir, 'docs/c.md', 'metin\n', 'docs: c')
    git(dir, 'update-ref', '-d', 'refs/remotes/origin/master')
    // Ağ yok, `git fetch` başarısız olacak → taban çözülemez → BUILD.
    expect(depodaKararVer(dir)).toBe('BUILD')
  })
})
