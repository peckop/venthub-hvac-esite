import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-ATIF-1 (ARC-305): SKILL.md içindeki scripts/ atıfı tam yolla git ls-files'ta karşılık bulmalı.
 * Yanlış alarm örnekleri (YTN-52): code-review:23 ve llm-council:47 (tam yol skill klasörü altında, kısa adı kökte yok).
 * Sabotaj: kapının kopyasına konan her hata en az bir senaryoyu kırar.
 */
const KOK = path.resolve(__dirname, '../../..')
const KAPI = path.join(KOK, 'scripts/arac/skill-atif-kapisi.cjs')
const KAYNAK = fs.readFileSync(KAPI, 'utf8')
const yukle = (yol: string) =>
  createRequire(import.meta.url)(yol) as {
    atiflar: (m: string) => Array<{ no: number; yol: string }>
    kopuklar: (d: string, m: string, i: Set<string>) => Array<{ dosya: string; no: number; yol: string }>
    calistir: (kok: string, git: (a: string[]) => string) => { kod: number; mesaj: string }
  }

const IZLENEN = new Set([
  'scripts/security/secret-scan.py',
  'scripts/hijyen/a.cjs',
  '.claude/skills/diff-review/scripts/check_diff_rules.py',
  '.claude/skills/agy-orchestrate/scripts/agy-run.sh',
  '.agent/skills/ui/scripts/search.py',
  '.claude/skills/x/scripts/yerel.sh',
])

/** Senaryolar: hata listesi döner ([] = hepsi tamam). */
function senaryolar(mod: ReturnType<typeof yukle>): string[] {
  const hata: string[] = []
  const dogru = (k: boolean, ne: string) => {
    if (!k) hata.push(ne)
  }
  const k = (d: string, m: string) => mod.kopuklar(d, m, IZLENEN)
  dogru(
    k('.claude/skills/code-review/SKILL.md', '| Diff tabanı | `python .claude/skills/diff-review/scripts/check_diff_rules.py` |').length === 0,
    'tam yol skill dışı klasörde varsa kopuk sayılmamalı (code-review:23 örneği)',
  )
  dogru(
    k('.claude/skills/llm-council/SKILL.md', '`bash .claude/skills/agy-orchestrate/scripts/agy-run.sh` ile').length === 0,
    'tam yol varsa kopuk sayılmamalı (llm-council:47 örneği)',
  )
  dogru(k('.claude/skills/x/SKILL.md', 'bkz `scripts/security/secret-scan.py`').length === 0, 'kökten tam yol sağlam sayılmalı')
  const kopuk = k('.claude/skills/x/SKILL.md', 'satır1\nbkz `scripts/yok/olmayan.py` ve devam')
  dogru(kopuk.length === 1 && kopuk[0].no === 2 && kopuk[0].yol === 'scripts/yok/olmayan.py', 'gerçek kopuk atıf dosya:satır ile bildirilmeli')
  dogru(k('.claude/skills/x/SKILL.md', 'scripts/kisa/check_diff_rules.py').length === 1, 'kısa ad kökte yoksa kopuk (başka klasördeki aynı ad kurtarmamalı)')
  dogru(k('.claude/skills/x/SKILL.md', 'scripts/*.py ve scripts/<ad>.py ve scripts/${x}/a ve scripts/...').length === 0, 'joker/şablon/${}/... atlanmalı')
  dogru(k('.claude/skills/x/SKILL.md', 'klasör: scripts/hijyen/ ve scripts/hijyen').length === 0, 'klasör atfı (içinde izlenen dosya) sağlam sayılmalı')
  dogru(k('.agent/skills/ui/SKILL.md', 'python3 skills/ui/scripts/search.py').length === 0, 'skills/ üst klasörüne göreli atıf sağlam sayılmalı')
  dogru(k('.claude/skills/x/SKILL.md', 'bash scripts/yerel.sh').length === 0, 'skill klasörüne göreli atıf sağlam sayılmalı')
  dogru(k('.claude/skills/x/SKILL.md', 'bkz scripts/hijyen/a.cjs.').length === 0, 'cümle sonu noktası jetondan atılmalı')
  const calisan = mod.calistir(KOK, () => {
    throw new Error('yok')
  })
  dogru(calisan.kod === 0 && /kontrol YAPILMADI/.test(calisan.mesaj), 'git okunamazsa fail-open uyarıyla geçmeli')
  const bos = mod.calistir(KOK, () => 'README.md\n')
  dogru(bos.kod === 0 && bos.mesaj === '', 'skill yoksa temiz geçmeli')
  return hata
}

describe('INV-SKILL-ATIF-1 · gerçek kapı', () => {
  it('tüm senaryolar geçer', () => {
    expect(senaryolar(yukle(KAPI))).toEqual([])
  })

  it('geçici depoda: kopuk atıf çıkış 1 ve dosya:satır; temiz depo çıkış 0', () => {
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-atif-'))
    try {
      const git = (...a: string[]) => execFileSync('git', a, { cwd: gecici, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      git('init', '-q')
      fs.mkdirSync(path.join(gecici, '.claude/skills/a'), { recursive: true })
      fs.mkdirSync(path.join(gecici, 'scripts'), { recursive: true })
      fs.writeFileSync(path.join(gecici, 'scripts/var.cjs'), '')
      fs.writeFileSync(path.join(gecici, '.claude/skills/a/SKILL.md'), 'bkz scripts/var.cjs\nve scripts/yok.cjs\n')
      git('add', '-A')
      const r = execFileSync(process.execPath, [KAPI], { cwd: gecici, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).toString()
      expect(r).toBe('')
    } catch (e) {
      const err = e as { status?: number; stderr?: string }
      expect(err.status).toBe(1)
      expect(err.stderr).toMatch(/\.claude\/skills\/a\/SKILL\.md:2 kopuk: scripts\/yok\.cjs/)
      expect(err.stderr).not.toMatch(/scripts\/var\.cjs/)
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    }
  })
})

describe('INV-SKILL-ATIF-1 · SABOTAJ: kapıya konan her hata en az bir senaryoyu kırar', () => {
  const SABOTAJLAR: Array<[string, string, string]> = [
    ['kök yolu aday değil', 'const adaylar = [yol, ', 'const adaylar = ['],
    ['skill klasörüne göreli aday yok', 'path.posix.join(skillKlasoru, yol), ', ''],
    ['skills/ üst klasörüne göreli aday yok', ', path.posix.join(path.posix.dirname(path.posix.dirname(skillKlasoru)), yol)]', ']'],
    ['kısa ad eşleşmesi: scripts/ öncesi yol atılır', "if (!yol.includes('scripts/') || ATLA.test(yol)) continue", "if (!yol.includes('scripts/') || ATLA.test(yol)) continue\n      sonuc.push({ no: i + 1, yol: yol.slice(yol.indexOf('scripts/')) })\n      continue"],
    ['joker/şablon atlama kalkar', "|| ATLA.test(yol)) continue", ') continue'],
    ['klasör öneki sayılmaz', "|| [...izlenen].some((f) => f.startsWith(duz + '/'))", ''],
    ['sondaki nokta kırpılmaz', "return j.replace(/[.:]+$/, '')", 'return j'],
    ['kopuk atıf bildirilmez', '.filter((a) => !var_mi(a.yol, klasor, izlenen))', '.filter(() => false)'],
    ['satır numarası kayar', 'sonuc.push({ no: i + 1, yol })', 'sonuc.push({ no: i, yol })'],
    ['git okunamazsa kapı çöker', "return { kod: 0, mesaj: `[skill-atif] UYARI:", "throw new Error(`[skill-atif] UYARI:"],
  ]

  it.each(SABOTAJLAR)('%s', (ad, eski, yeni) => {
    expect(KAYNAK.split(eski).length, `sabotaj noktası kaynakta TAM BİR KEZ olmalı: ${eski}`).toBe(2)
    const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-atif-sab-'))
    try {
      const yol = path.join(gecici, 'sabotaj.cjs')
      fs.writeFileSync(yol, KAYNAK.replace(eski, yeni), 'utf8')
      let hata: string[]
      try {
        hata = senaryolar(yukle(yol))
      } catch {
        hata = ['kapı çöktü'] // sabotajlı kopya çökmesi de "kırdı" sayılır
      }
      expect(hata.length, `sabotaj HİÇBİR senaryoyu kırmadı: "${ad}"`).toBeGreaterThan(0)
    } finally {
      fs.rmSync(gecici, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
    }
  })
})
