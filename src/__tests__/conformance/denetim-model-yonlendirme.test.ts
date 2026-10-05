/**
 * INV-DENETIM-MODEL-1 — pencereler Sonnet, denetim Opus (karar 168, Recep 2026-09-29).
 *
 * Ölçüldü (09-29, `claude -p` + gerçek ayarlar, transkriptte modelUsage): alt-ajan dosyasında
 * `model: opus` ÇALIŞIR; yetenek (SKILL.md) başlığında `model: opus` bu sürümde ETKİSİZ (cevabı
 * Sonnet verdi); yetenek `context: fork` + Opus'lu ince kap ajan ÇALIŞIR. Bu yüzden denetim
 * yetenekleri fork'a gider. `verify-before-done` bilinçli istisna: konuşmayı görmesi şart.
 * Cetvel: docs/standards/execution-method-standard.md §5.4.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const AJANLAR = path.join(KOK, '.claude', 'agents')
const YETENEKLER = path.join(KOK, '.claude', 'skills')

const DENETIM_YETENEKLERI = ['plan-challenger', 'diff-review', 'venthub-auditor', 'venthub-enterprise-audit', 'venthub-20-eksen-denetimi']

/** Yalnız ilk `---` bloğundaki üst düzey `anahtar: değer` satırları (çok satırlı değerler aranmaz). */
function baslik(dosya: string): Record<string, string> {
  const s = fs.readFileSync(dosya, 'utf8').replace(/\r\n/g, '\n')
  const m = s.match(/^---\n([\s\S]*?)\n---/)
  if (!m) throw new Error('frontmatter yok: ' + dosya)
  const out: Record<string, string> = {}
  for (const satir of m[1].split('\n')) {
    const k = satir.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (k) out[k[1]] = k[2].trim()
  }
  return out
}
const yetenek = (ad: string) => baslik(path.join(YETENEKLER, ad, 'SKILL.md'))

describe('INV-DENETIM-MODEL-1 · denetim işleri Opus', () => {
  it('security-reviewer alt-ajanı model: opus', () => {
    expect(baslik(path.join(AJANLAR, 'security-reviewer.md')).model).toBe('opus')
  })

  it('denetim-opus kabı Opus ve `tools` alanı YOK (satır içi koşsaydı sahip olacağı araçların hepsi)', () => {
    const b = baslik(path.join(AJANLAR, 'denetim-opus.md'))
    expect(b.name).toBe('denetim-opus')
    expect(b.model).toBe('opus')
    expect(b).not.toHaveProperty('tools')
  })

  it.each(DENETIM_YETENEKLERI)('%s: context: fork + agent: denetim-opus', (ad) => {
    const b = yetenek(ad)
    expect(b.context).toBe('fork')
    expect(b.agent).toBe('denetim-opus')
    // Yeteneğin kendi `model:` satırı ETKİSİZDİR (ölçüldü); yazılırsa yanlış güven verir.
    expect(b).not.toHaveProperty('model')
  })

  it('bilinçli istisna: verify-before-done fork\'a GİTMEZ (konuşmayı görmesi şart) ve cetvelde yazılı', () => {
    const b = yetenek('verify-before-done')
    expect(b).not.toHaveProperty('context')
    expect(b).not.toHaveProperty('agent')
    const cetvel = fs.readFileSync(path.join(KOK, 'docs', 'standards', 'execution-method-standard.md'), 'utf8')
    expect(cetvel).toContain('Bilinçli istisna: `verify-before-done` fork\'a GİTMEZ')
  })

  it('her `context: fork` yeteneği var olan bir ajan dosyasına bağlıdır', () => {
    for (const ad of fs.readdirSync(YETENEKLER)) {
      const dosya = path.join(YETENEKLER, ad, 'SKILL.md')
      if (!fs.existsSync(dosya)) continue
      const b = baslik(dosya)
      if (b.context !== 'fork') continue
      expect(b.agent, `${ad}: fork için agent: gerekli`).toBeTruthy()
      expect(fs.existsSync(path.join(AJANLAR, `${b.agent}.md`)), `${ad}: agent ${b.agent} dosyası yok`).toBe(true)
    }
  })

  it('.agent/ ikiz ağacına dokunulmadı (fork/agent satırı yok)', () => {
    const kok = path.join(KOK, '.agent', 'skills')
    if (!fs.existsSync(kok)) return
    for (const ad of fs.readdirSync(kok)) {
      const dosya = path.join(kok, ad, 'SKILL.md')
      if (!fs.existsSync(dosya)) continue
      expect(fs.readFileSync(dosya, 'utf8'), `${ad}: .agent ağacı değiştirilmemeli`).not.toContain('agent: denetim-opus')
    }
  })
})
