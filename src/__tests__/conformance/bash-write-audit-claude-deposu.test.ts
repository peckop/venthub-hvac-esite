// @vitest-environment node
import { execFileSync, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BASH-AUDIT-CLAUDE-DEPOSU · `~/.claude` altındaki git depoları şerit denetimi DIŞINDADIR.
 *
 * ÖLÇÜLEN KUSUR (2026-09-25, Ops): hafıza dizini kendi git deposu. Komut oradan koşunca
 * `bash-write-audit` o deponun kökünü "ORTAK ana ağaç" sayıyor ve her yazımda
 * "ORTAK AGAC UYARISI … tazelemede SİLİNİR" basıyordu. O depoda şerit/worktree/tazeleme yok;
 * #1400'den beri bu yanlış uyarı her Bash'te modele gidiyordu.
 *
 * AYIRT EDİCİ ÇİFT: aynı kirli depo, kök `VENTHUB_CLAUDE_KOK` altındayken SESSİZ; değilken
 * uyarı VAR. Yalnız sessiz kolu ölçen test, kancayı tamamen kapatan bir kusuru da yeşil sayardı.
 */

const KANCA = path.resolve(process.cwd(), '.claude', 'hooks', 'bash-write-audit.cjs')
const SID = 'cccccccc-3333-4333-8333-333333333333'

function depoKur(): { kok: string; depo: string; pano: string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'bwa-claude-'))
  const depo = path.join(kok, 'projects', 'p', 'memory')
  fs.mkdirSync(depo, { recursive: true })
  execFileSync('git', ['init', '-q', depo])
  fs.writeFileSync(path.join(depo, 'MEMORY.md'), 'ilk\n')
  execFileSync('git', ['-C', depo, '-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '-A'])
  execFileSync('git', ['-C', depo, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-q', '-m', 'ilk'])
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'bwa-pano-'))
  return { kok, depo, pano }
}

function kostur(depo: string, pano: string, claudeKok: string | null) {
  const env: NodeJS.ProcessEnv = { ...process.env, VENTHUB_BOARD_DIR: pano, VENTHUB_MODELE_ILET_DIR: pano }
  delete env.CLAUDE_SESSION_ID
  if (claudeKok) env.VENTHUB_CLAUDE_KOK = claudeKok
  else delete env.VENTHUB_CLAUDE_KOK
  return spawnSync(process.execPath, [KANCA], {
    input: JSON.stringify({ session_id: SID, tool_name: 'Bash', cwd: depo }),
    encoding: 'utf8',
    env,
  })
}

describe('INV-BASH-AUDIT-CLAUDE-DEPOSU: ~/.claude altındaki depo denetlenmez', () => {
  it('kök ~/.claude altındayken SESSİZ; aynı depo dışarıdayken uyarı VAR (ayırt edici çift)', () => {
    const { kok, depo, pano } = depoKur()

    // Taban kur, sonra commit'siz iş bırak.
    kostur(depo, pano, null)
    fs.writeFileSync(path.join(depo, 'yeni-ders.md'), 'commit edilmedi\n')

    const disarida = kostur(depo, pano, null)
    expect(disarida.status).toBe(0)
    expect(
      `${disarida.stdout}${disarida.stderr}`,
      'kontrol kolu: kök ~/.claude dışında sayılınca uyarı basılmalı — basılmıyorsa ölçüm kör',
    ).toMatch(/ORTAK AGAC UYARISI/)

    fs.writeFileSync(path.join(depo, 'ikinci-ders.md'), 'bu da commit edilmedi\n')
    const icerde = kostur(depo, pano, kok)
    expect(icerde.status).toBe(0)
    expect(icerde.stdout.trim(), '~/.claude altındaki depo için modele uyarı gitti').toBe('')
    expect(icerde.stderr, '~/.claude altındaki depo için ORTAK AGAC uyarısı basıldı').not.toMatch(/ORTAK AGAC/)
  })

  it('kural yol taşımaz: kaynakta kullanıcı adı içeren mutlak yol YOK (depo PUBLIC)', () => {
    const kaynak = fs.readFileSync(KANCA, 'utf8')
    expect(/[A-Za-z]:[\\/]Users[\\/]/.test(kaynak), 'kancada kullanıcı adı taşıyan mutlak yol var').toBe(false)
    expect(kaynak).toMatch(/homedir\(\)/)
  })
})
