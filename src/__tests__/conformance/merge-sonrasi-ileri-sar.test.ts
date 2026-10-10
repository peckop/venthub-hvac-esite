import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-MERGE-SONRASI-ILERI-SAR-1 (karar 165 W4, 2026-09-28).
 *
 * `gh pr merge` sonrası ana ağaç, merge ritüelinin kullandığı AYNI `ileriSar` ile ileri sarılır;
 * kirli ağaçta DURUR ve söyler. Gerekçe: .claude/hooks/merge-sonrasi-ileri-sar.cjs başlığı.
 * Durum üretilir: geçici çıplak origin + ana ağaç + worktree; gerçek depoya dokunulmaz.
 */
const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'merge-sonrasi-ileri-sar.cjs')
const k = require_(KANCA) as {
  mergeMi: (s: unknown) => boolean
  satir: (s: { durum: string; geride?: number; sebep?: string } | null) => string | null
}

const GECICI: string[] = []
afterAll(() => {
  for (const d of GECICI) fs.rmSync(d, { recursive: true, force: true })
})

function g(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'core.autocrlf=false', ...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

/** origin + ana ağaç + worktree; worktree origin'e 1 commit iter, ana ağaç geride kalır. */
function kurulum(): { ana: string; wt: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-ileri-'))
  GECICI.push(kok)
  const origin = path.join(kok, 'origin.git')
  const ana = path.join(kok, 'ana')
  const wt = path.join(kok, 'wt')
  g(kok, 'init', '--bare', '-b', 'master', origin)
  g(kok, 'clone', '-q', origin, ana)
  g(ana, 'checkout', '-q', '-B', 'master')
  fs.writeFileSync(path.join(ana, 'a.txt'), '0\n')
  fs.writeFileSync(path.join(ana, 'b.txt'), '0\n')
  g(ana, 'add', '.')
  g(ana, 'commit', '-q', '-m', 'c0')
  g(ana, 'push', '-q', 'origin', 'master')
  g(ana, 'worktree', 'add', '-q', '-b', 'serit', wt, 'master')
  fs.writeFileSync(path.join(wt, 'a.txt'), '1\n')
  g(wt, 'commit', '-qam', 'c1')
  g(wt, 'push', '-q', 'origin', 'serit:master')
  return { ana, wt }
}

function kos(cwd: string, komut: string): string {
  const r = spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ cwd, tool_input: { command: komut } }),
    encoding: 'utf8',
    timeout: 60_000,
    windowsHide: true,
  })
  expect(r.status).toBe(0)
  return r.stdout ? (JSON.parse(r.stdout) as { hookSpecificOutput: { additionalContext: string } }).hookSpecificOutput.additionalContext : ''
}

describe('INV-MERGE-SONRASI-ILERI-SAR-1', () => {
  it('yalnız gh pr merge tetikler', () => {
    expect(k.mergeMi('gh pr merge 1457 --squash')).toBe(true)
    expect(k.mergeMi('cd x && gh  pr   merge 12')).toBe(true)
    for (const s of ['gh pr view 1457', 'git merge --ff-only origin/master', 'gh pr checks 1', undefined]) expect(k.mergeMi(s)).toBe(false)
  })

  it('merge sonrası geride ana ağaç ileri sarılır; merge değilse dokunulmaz (ayırt edici çift)', { timeout: 420_000 }, () => {
    const { ana, wt } = kurulum()
    expect(kos(wt, 'gh pr view 1')).toBe('')
    expect(g(ana, 'rev-list', '--count', 'HEAD..origin/master').length).toBeGreaterThan(0)
    const once = g(ana, 'rev-parse', 'HEAD')
    expect(kos(wt, 'gh pr merge 1 --squash')).toMatch(/1 commit ileri sarildi/)
    expect(g(ana, 'rev-parse', 'HEAD')).not.toBe(once)
    expect(g(ana, 'rev-parse', 'HEAD')).toBe(g(ana, 'rev-parse', 'origin/master'))
  })

  it('ilgisiz kirli dosya ileri sarmayı ENGELLEMEZ; dosya korunur (#1468 vakası, Ops 09-28)', { timeout: 420_000 }, () => {
    const { ana, wt } = kurulum()
    fs.writeFileSync(path.join(ana, 'b.txt'), 'yarim is\n')
    const once = g(ana, 'rev-parse', 'HEAD')
    expect(kos(wt, 'gh pr merge 1')).toMatch(/^ANA AGAC: merge sonrasi 1 commit ileri sarildi/)
    expect(g(ana, 'rev-parse', 'HEAD')).not.toBe(once)
    expect(fs.readFileSync(path.join(ana, 'b.txt'), 'utf8')).toBe('yarim is\n')
  })

  it('kanca .claude/settings.json PostToolUse Bash bloğunda KAYITLI (kayıtsız kanca hiçbir şey yapmaz)', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8')) as {
      hooks: { PostToolUse: { matcher: string; hooks: { command: string }[] }[] }
    }
    const bash = ayar.hooks.PostToolUse.filter((b) => b.matcher.split('|').includes('Bash'))
    expect(bash.flatMap((b) => b.hooks.map((h) => h.command)).some((c) => c.includes('merge-sonrasi-ileri-sar.cjs'))).toBe(true)
  })

  it('güncel ağaçta susar; ölçülemeyen hâl söylenir', () => {
    expect(k.satir({ durum: 'guncel', geride: 0 })).toBeNull()
    expect(k.satir({ durum: 'olcemedi', sebep: 'git yok' })).toMatch(/olculemedi \(git yok\)/)
  })
})

/**
 * INV-MERGE-SONRASI-ILERI-SAR-2 · ilerleme izleme + yeniden deneme (REC-441, 09-29; REC-459, 09-30).
 * Ölçülen vaka: #1481 merge'ünde sanal bellek %89'du, git zaman aşımına düştü, ana ağaç bayat kaldı. Ayrıca harness
 * PostToolUse kancasını ~60 sn'de sessizce öldürür. REC-459 kök sebebi: önceki sürüm çocuğa SABİT süre verip yarı yolda
 * öldürüyordu; çekirdeğin 2 katı CPU yükünde 3 koşumun 3'ünde düştü (yavaş ama ilerleyen iş öldürülüp baştan başlıyordu).
 * Şimdi çocuk her adımda işaret yazar; ebeveyn YALNIZ işaret gelmeyince (takılma) ya da toplam pay (TAVAN_MS) dolunca öldürür.
 * Testler GERÇEK git hızına bağlı değildir: takılma ve yavaşlık kancanın test kancalarıyla ÜRETİLİR.
 */
describe('INV-MERGE-SONRASI-ILERI-SAR-2 · ilerleme izleme ve yeniden deneme', () => {
  function kosEnv(cwd: string, komut: string, env: Record<string, string>): { cikti: string; ms: number } {
    const t0 = Date.now()
    const r = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ cwd, tool_input: { command: komut } }),
      encoding: 'utf8',
      timeout: 90_000,
      windowsHide: true,
      env: { ...process.env, ...env },
    })
    expect(r.status).toBe(0)
    const cikti = r.stdout ? (JSON.parse(r.stdout) as { hookSpecificOutput: { additionalContext: string } }).hookSpecificOutput.additionalContext : ''
    return { cikti, ms: Date.now() - t0 }
  }

  it('ilk deneme takılırsa ikinci denemede ileri sarar (yeniden deneme ayırt edici kanıt)', { timeout: 420_000 }, () => {
    const { ana, wt } = kurulum()
    const uyku = path.join(os.tmpdir(), `ileri-uyku-${process.pid}-${Date.now()}`)
    GECICI.push(uyku)
    const once = g(ana, 'rev-parse', 'HEAD')
    // Takılan çocuk 'basla' işaretinden sonra uyur → 15 sn işaret gelmeyince öldürülür; 2. deneme süreye değil işaret akışına bağlı.
    // (Pencere yük altında TEK git çağrısının süresinden geniş tutulur: her git çağrısından önce işaret yazılır.)
    const { cikti } = kosEnv(wt, 'gh pr merge 1', { VH_ILERI_SAR_TEST_UYKU_DOSYA: uyku, VH_ILERI_SAR_BOSTA_MS: '15000', VH_ILERI_SAR_BEKLE_MS: '0' })
    expect(cikti).toMatch(/ileri sarildi/)
    expect(cikti).toMatch(/deneme 2\/3/)
    expect(g(ana, 'rev-parse', 'HEAD')).not.toBe(once)
  })

  it('üç deneme de takılırsa SESSİZ KALMAZ, elle komutu söyler ve bütçeyi aşmaz', { timeout: 420_000 }, () => {
    const { wt } = kurulum()
    const { cikti, ms } = kosEnv(wt, 'gh pr merge 1', { VH_ILERI_SAR_TEST_HEP_TAKIL: '1', VH_ILERI_SAR_BOSTA_MS: '1500', VH_ILERI_SAR_BEKLE_MS: '0' })
    expect(cikti).toMatch(/3 denemede tamamlanamadi/)
    expect(cikti).toContain('ana-agac-tazelik.cjs --ileri-sar')
    expect(cikti).toContain('ilerleme isareti gelmedi')
    expect(ms).toBeLessThan(30_000)
  })

  it('REC-459 KÖK SEBEP: YAVAŞ AMA İLERLEYEN çocuk ÖLDÜRÜLMEZ, ilk denemede tamamlanır (sabit süre bütçesi bunu öldürürdü)', { timeout: 420_000 }, () => {
    const { ana, wt } = kurulum()
    const once = g(ana, 'rev-parse', 'HEAD')
    // Çocuk ≈18 sn sürer ama her 500 ms'de işaret yazar; bekleme penceresi 8 sn: toplam süre pencereyi 2 kattan fazla aşar.
    const { cikti } = kosEnv(wt, 'gh pr merge 1', { VH_ILERI_SAR_TEST_YAVAS_MS: '18000', VH_ILERI_SAR_BOSTA_MS: '8000', VH_ILERI_SAR_BEKLE_MS: '0' })
    expect(cikti).toMatch(/ileri sarildi/)
    expect(cikti).not.toMatch(/deneme \d\/3/)
    expect(g(ana, 'rev-parse', 'HEAD')).not.toBe(once)
  })

  it('TOPLAM PAY (harness sınırı) dolunca İLERLEYEN çocuk da öldürülür ve durum SÖYLENİR', { timeout: 420_000 }, () => {
    const { wt } = kurulum()
    const { cikti, ms } = kosEnv(wt, 'gh pr merge 1', { VH_ILERI_SAR_TEST_YAVAS_MS: '60000', VH_ILERI_SAR_BOSTA_MS: '20000', VH_ILERI_SAR_TAVAN_MS: '3000', VH_ILERI_SAR_BEKLE_MS: '0' })
    expect(cikti).toMatch(/1 denemede tamamlanamadi/)
    expect(cikti).toContain('toplam 3000 ms doldu')
    expect(cikti).toContain('ana-agac-tazelik.cjs --ileri-sar')
    expect(ms).toBeLessThan(20_000)
  })

  it('yama sırası: ana-agac-tazelik içindeki git çağrıları da ilerleme işareti yazar (davranış)', { timeout: 420_000 }, () => {
    // Kanca DOĞRUDAN çocuk kipinde (--is) koşar; işaretler çocuğun stderr'ine yazılır. `require(tazelik)` yamadan ÖNCEYE
    // alınırsa tazelik modülü orijinal execFileSync'i destructure eder → anaAgacYolu/ileriSar içindeki git çağrıları işaretsiz kalır.
    const { wt } = kurulum()
    const r = spawnSync(process.execPath, [KANCA, '--is'], {
      input: JSON.stringify({ cwd: wt, tool_input: { command: 'gh pr merge 1' } }),
      encoding: 'utf8',
      windowsHide: true,
      timeout: 300_000,
    })
    const isaretler = (r.stderr ?? '').split(/\r?\n/).map((s) => s.trim())
    const gitSayisi = isaretler.filter((s) => s === 'ADIM git').length
    expect(gitSayisi, `ADIM git satırı sayısı (stderr: ${JSON.stringify(r.stderr)})`).toBeGreaterThanOrEqual(3)
    for (const ad of ['basla', 'fetch', 'ileri-sar']) expect(isaretler, `ADIM ${ad} yok`).toContain(`ADIM ${ad}`)
  })

  it('kaynak: sabit süre bütçesi (spawnSync + timeout) GERİ GELMEZ; ilerleme işareti ve takılma penceresi var', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
    expect(kod).not.toMatch(/spawnSync/)
    expect(kod).not.toMatch(/DENEME_MS/)
    expect(kod).toMatch(/BOSTA_MS/)
    expect(kod).toMatch(/TAVAN_MS/)
    expect(kod).toContain("ilerle('fetch')")
    expect(kod).toContain("ilerle('ileri-sar')")
    expect(kod).toContain("ilerle('git')") // her git çağrısından önce işaret (yük altı ölçümü: seyrek işaret takılma sanılıyordu)
  })
})
