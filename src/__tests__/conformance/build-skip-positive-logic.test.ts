import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn, `vitest.config.ts`).
 *
 * Ölçüm 2026-08-30, **boş makine**: bu dosyanın gövdesi **9,27 sn** — yani 20 sn bütçesinin
 * **%46'sı**. Bu test yük olmadan da kenardaydı; filo yükü onu yaratmadı, GÖRÜNÜR KILDI.
 * Yük altında gözlenen amplifikasyon ~27× (tek gözlem: `eol-normalization` 1,47 → 39,9 sn).
 *
 * **60 sn'yi aşan bir kırmızı GERÇEK aşımdır** — yükün gürültüsü değil.
 * Gerekçe zinciri ve adı konmuş artık risk: `docs/standards/fleet-mechanism-standard.md` §13.
 */
vi.setConfig({ testTimeout: 60_000 })

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

/**
 * ⚠️ MUTLAK YOL ZORUNLU — göreli yol bu kapıyı YANLIŞ AĞACA baktırır.
 *
 * Bu kapı betiği dosya sisteminden okur ve çalıştırır; yolu göreli bırakırsak
 * hedef `process.cwd()`'ye göre çözülür. Filo çok-worktree çalışıyor ve
 * `vitest --root` cwd'yi DEĞİŞTİRMEZ (2026-08-28 ölçümü, ÜRÜN); ayrıca bu
 * ortamda kabuğun cwd'si arka plan komutundan sonra ana dizine dönebiliyor
 * (ALTYAPI, aynı gün üç kez). İkisi birleşince kapı, ölçtüğünü sandığı
 * worktree'nin değil ANA AĞACIN betiğini ölçebilir — yani onardığın dosya ile
 * kapının onayladığı dosya farklı olur.
 *
 * `__dirname` dosyanın kendi konumudur; cwd ne olursa olsun değişmez.
 */
const REPO_KOK = resolve(__dirname, '../../..')
const SCRIPT = join(REPO_KOK, 'scripts/vercel-ignore-build.sh')

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
      ['ağaç hijyeni aracı', ['scripts/hijyen/agac-silme-kapisi.cjs']],
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

// SCRIPT zaten mutlak (bkz. yukarıdaki REPO_KOK notu); burada yalnız Windows
// ters bölüleri `sh` için düzleştiriliyor.
const SCRIPT_MUTLAK = SCRIPT.replace(/\\/g, '/')

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

/** Betiği koşturur ve KARARDAN bağımsız olarak stdout günlüğünü döndürür. */
function gunlukAl(dir: string, env: Record<string, string> = {}): string {
  try {
    return String(
      execFileSync('sh', [SCRIPT_MUTLAK], {
        cwd: dir,
        stdio: 'pipe',
        encoding: 'utf8',
        env: { ...process.env, VERCEL_GIT_PREVIOUS_SHA: '', ...env },
      }),
    )
  } catch (err) {
    return String((err as { stdout?: string }).stdout ?? '')
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

  /**
   * ⭐GÖZLENEBİLİRLİK KOLU — 2026-08-27'de ölçülen kusurun kapısı.
   *
   * Yukarıdaki kol "çözemezsen BUILD" davranışını sınar ve YEŞİLDİ. Ama üretimde
   * o dal TEK yoldu: `origin/master` Vercel'in sığ klonunda hiç yok, çekme her
   * seferinde başarısız oluyordu ve betik başarısızlığı `2>/dev/null || true` ile
   * YUTUYORDU. Sonuç: pozitif sınıf listesi on gün boyunca BİR KEZ BİLE
   * değerlendirilmedi, kimse fark etmedi, günlük yalnız "origin/master yok" diyordu.
   * Ölçüm: üç Vercel dağıtımının build günlüğü (d9f31989 · f4c5c25f · 304a1785),
   * üçünde de birebir aynı iki satır.
   *
   * DOĞRU DAVRANIŞ YETMEZ, GÖREBİLMEK GEREKİR: fail-safe sessizse, "kapı çalışıyor"
   * ile "kapı hiç sıra bulamıyor" ayırt edilemez. Bu kol, her başarısız çekme
   * denemesinin SEBEBİYLE birlikte günlüğe düşmesini zorunlu kılar.
   */
  it('taban çözülemediğinde SEBEP günlüğe yazılır (sessiz fail-safe yasak)', () => {
    const dir = depoKur()
    git(dir, 'checkout', '--quiet', '-b', 'docs/z')
    commitAt(dir, 'docs/c.md', 'metin\n', 'docs: c')
    git(dir, 'update-ref', '-d', 'refs/remotes/origin/master')

    const gunluk = gunlukAl(dir)

    // Uzak YOK ve ortam değişkeni de yoksa: neden çekilemediği ADIYLA yazılmalı.
    expect(gunluk, 'çekilemeyişin sebebi günlüğe yazılmamış').toMatch(
      /origin uzagi YOK ve VERCEL_GIT_REPO_OWNER\/SLUG bos/,
    )
    // Karar satırı da yerinde: sebep yazıldı diye karar kaybolmasın.
    expect(gunluk).toMatch(/-> BUILD/)
  })

  /**
   * ⭐ÜRETİMDEKİ GERÇEK SEBEP — `origin` UZAĞI HİÇ YOK (2026-08-27, dağıtım 5cjXTJWY).
   *
   * Görünürlük onarımı ilk koşumunda cevabı verdi:
   *   `ignore-build: refspec cekmesi basarisiz -> fatal: 'origin' does not appear to be a git repository`
   * Sorun refspec biçimi ya da derinlik değildi; Vercel'in klonunda uzak tanımlı DEĞİL.
   * Bu yüzden "origin"e yapılan hiçbir çekme tutamazdı. Betik artık uzağı ortam
   * değişkenlerinden kurar (depo public, kimlik gerekmez).
   *
   * Bu kol o yolu AĞSIZ koşturur: yerel bir bare depo `origin` olarak bağlanır,
   * `refs/remotes/origin/master` SİLİNİR — yani betik gerçekten ÇEKMEK zorunda kalır.
   */
  it('origin/master ref yoksa ama uzak ERİŞİLEBİLİRSE çekip tabanı çözer → salt-.md ATLA', () => {
    const dir = depoKur()
    const bare = mkdtempSync(join(tmpdir(), 'inv-build-skip-bare-')).replace(/\\/g, '/')
    execFileSync('git', ['init', '--bare', '--quiet', bare], { stdio: 'pipe' })
    git(dir, 'remote', 'add', 'origin', bare)
    git(dir, 'push', '--quiet', 'origin', 'master')

    git(dir, 'checkout', '--quiet', '-b', 'docs/z')
    commitAt(dir, 'docs/c.md', 'metin\n', 'docs: c')
    // Yerel takip referansını SİL: betik çekmezse tabanı çözemez.
    git(dir, 'update-ref', '-d', 'refs/remotes/origin/master')

    const gunluk = gunlukAl(dir)
    expect(gunluk, 'çekme yolu hiç koşmamış').toMatch(/taban = /)
    expect(depodaKararVer(dir)).toBe('ATLA')
  })
})
