import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-LINT-STAGED-1 · `.lintstagedrc.json` ölü kalmasın: `pre-commit` onu çağırır, ama commit'i ENGELLEMEZ
 * (ALT-108, 26 Ekim 2026).
 *
 * NİÇİN: lint-staged yüklü ve ayarlıydı (`.lintstagedrc.json`) ama husky kalkınca hiçbir kancaya bağlı kalmadı;
 * "ayar var, kapı yok" durumu hiçbir testte görünmüyordu. Ölçüm: eslint yapılandırması dosya sayısından bağımsız
 * ~14-16 sn sürüyor; bu yüzden kanca UYARI-ONLY (kancanın "hızlı, çevrimdışı" ilkesi, `.githooks/README.md`).
 * Gerçek kapı CI'daki `pnpm run lint` adımıdır.
 *
 * Cetvel: `.githooks/README.md` · `.githooks/pre-commit` başlık yorumu.
 *
 * NE ÖLÇER (metin düzeyinde; kancayı çalıştırmaz, çünkü 15 sn'lik eslint koşusu test için fazla):
 *   1. pre-commit lint-staged'i çağırıyor ve `--no-stash` veriyor (stash yığını worktree'ler arası PAYLAŞILIR).
 *   2. Çağrı başarısızlıkta commit'i durdurmuyor: `|| {` bloğunda `exit` yok ve dosya `exit 0` ile bitiyor.
 *   3. `VH_LINT_STAGED=0` yalnız bu adımı atlıyor (başka kapıyı değil).
 *   4. `.lintstagedrc.json` JS/TS uzantılarına eslint koşuyor; kanca ile aynı depoda duruyor.
 *
 * SABOTAJ: pre-commit'ten lint-staged çağrısını silince (1) kırmızı; `|| {` bloğuna `exit 1` koyunca (2) kırmızı.
 */

const KOK = process.cwd()
const PRE_COMMIT = fs.readFileSync(path.join(KOK, '.githooks', 'pre-commit'), 'utf8')
const RC = JSON.parse(fs.readFileSync(path.join(KOK, '.lintstagedrc.json'), 'utf8')) as Record<string, string[]>

/** LF'ye çevir (Windows checkout CRLF olabilir). */
const metin = PRE_COMMIT.replace(/\r\n/g, '\n')

describe('INV-KANCA-LINT-STAGED-1 · pre-commit lint-staged bağlantısı', () => {
  it('pre-commit lint-staged\'i --no-stash ile çağırır', () => {
    expect(metin).toMatch(/node "\$LINT_STAGED_BIN" --no-stash\b/)
    expect(metin).toContain('node_modules/lint-staged/bin/lint-staged.js')
  })

  it('başarısızlık commit\'i ENGELLEMEZ: || { bloğunda exit yok, dosya exit 0 ile biter', () => {
    const baslangic = metin.indexOf('node "$LINT_STAGED_BIN"')
    expect(baslangic).toBeGreaterThan(-1)
    const blok = metin.slice(baslangic, metin.indexOf('\nfi\n', baslangic))
    expect(blok).toMatch(/\|\| \{/)
    expect(blok).not.toMatch(/\bexit\b/)
    expect(metin.trimEnd().endsWith('exit 0')).toBe(true)
  })

  it('VH_LINT_STAGED=0 yalnız lint-staged adımını sarar (şerit kapısından SONRA gelir)', () => {
    const atlama = metin.indexOf('VH_LINT_STAGED')
    const serit = metin.indexOf('lane-precommit.cjs')
    expect(atlama).toBeGreaterThan(serit)
    // tek kullanım: lint-staged koşulu; başka kapı bu değişkene bağlı olmasın
    expect(metin.match(/VH_LINT_STAGED/g)?.length).toBeGreaterThanOrEqual(2)
    expect(metin.slice(0, atlama - 1)).not.toMatch(/exit \$LANE_RC[\s\S]*VH_LINT_STAGED=0[\s\S]*exit \$LANE_RC/)
  })

  it('.lintstagedrc.json JS/TS uzantılarına eslint koşar', () => {
    const desen = Object.keys(RC).find((k) => k.includes('ts') && k.includes('tsx'))
    expect(desen).toBeDefined()
    expect(RC[desen as string].some((k) => /\beslint\b/.test(k))).toBe(true)
  })
})
