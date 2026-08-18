import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
