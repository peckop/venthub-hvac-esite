// @vitest-environment node
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-GECIS-KONUSU-1 · OPS penceresinde geçiş/yeni site konusu → deftere yönlendirme satırı (ARC-290).
 * Üç yüzey: istem (hafiza-sorusu-yonlendirme), Agent (olcum-satiri-uyarisi), kart açma (onceki-calisma-kapisi).
 * Hepsi UYARI: çıkış 0, blok yok. Sabotaj kolları: OPS olmayan pencere, başka konu, makine mesajı, vana, add_task dışı eylem.
 */

const req = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const YARDIMCI = req(path.join(KOK, 'scripts/hijyen/gecis-konusu.cjs')) as { gecisMi: (m: unknown) => boolean }
const HAFIZA = path.join(KOK, '.claude/hooks/hafiza-sorusu-yonlendirme.cjs')
const AGENT = path.join(KOK, '.claude/hooks/olcum-satiri-uyarisi.cjs')
const KART = path.join(KOK, '.claude/hooks/onceki-calisma-kapisi.cjs')
const IZ = 'Geçiş tek süreçtir'

function kos(betik: string, girdi: object, env: Record<string, string> = {}) {
  const r = spawnSync(process.execPath, [betik], {
    encoding: 'utf8',
    input: JSON.stringify({ cwd: KOK, ...girdi }),
    env: { ...process.env, VENTHUB_PENCERE_AGENT: 'ops-pencere', ...env },
    timeout: 30000,
  })
  return { status: r.status, cikti: String(r.stdout || '') }
}

describe('INV-KANCA-GECIS-KONUSU-1 · kalıp', () => {
  it('geçiş/yeni site cümlelerini yakalar', () => {
    for (const m of [
      'yeni site için adres şeması nasıl olacak',
      'Canlıya geçiş planı',
      'canlıya çıkış planı',
      'site geçiş planı nerede',
      'eski → yeni adres tablosu',
      'siteye geçişte dizin isteği',
    ]) {
      expect(YARDIMCI.gecisMi(m), m).toBe(true)
    }
  })
  it('gündelik "geçiş" cümlelerini YAKALAMAZ; string olmayan girdi çökertmez', () => {
    for (const m of [
      'veri geçişi bitti',
      'auth geçişi için migration yaz',
      'sayfa geçiş animasyonu',
      'testler geçti',
      'canlıya çıktı mı',
      'canlıya geçmeden migration kontrol et',
      'canlıya çıkmadan önce test et',
      'veri geçiş planı',
      'auth geçiş süreci',
    ]) {
      expect(YARDIMCI.gecisMi(m), m).toBe(false)
    }
    expect(YARDIMCI.gecisMi(42)).toBe(false)
    expect(YARDIMCI.gecisMi(undefined)).toBe(false)
  })
})

describe('INV-KANCA-GECIS-KONUSU-1 · istem', () => {
  it('OPS + Recep istemi geçiş konusu → bağlam satırı, çıkış 0', () => {
    const r = kos(HAFIZA, { prompt: 'yeni site için adres şemasını konuşalım' })
    expect(r.status).toBe(0)
    expect(r.cikti).toContain(IZ)
    expect(r.cikti).toContain('urun-adres')
    expect(r.cikti).toContain('geo-seo-dizin')
  })
  it('sabotaj: OPS olmayan pencerede susar', () => {
    expect(kos(HAFIZA, { prompt: 'yeni site için adres şemasını konuşalım' }, { VENTHUB_PENCERE_AGENT: 'arac-pencere' }).cikti).toBe('')
  })
  it('sabotaj: başka konu susar', () => {
    expect(kos(HAFIZA, { prompt: 'sepet sayfasının rengini değiştir' }).cikti).toBe('')
  })
  it('sabotaj: makine mesajı (cross-session) susar', () => {
    expect(kos(HAFIZA, { prompt: '<cross-session-message>yeni site geçişi</cross-session-message>' }).cikti).toBe('')
  })
  it('sabotaj: vana kapatır', () => {
    expect(kos(HAFIZA, { prompt: 'yeni site için adres şeması' }, { VENTHUB_GECIS_KONUSU_KAPAT: '1' }).cikti).toBe('')
  })
})

describe('INV-DEFTER-KANBAN-1 · etiketsiz kart uyarısı (ARC-291)', () => {
  const kart = (title: string, labels?: string[], action = 'add_task') => ({
    tool_name: 'mcp__wrongstack-kanban__kanban_manage',
    tool_input: { action, title, labels },
  })
  it('geçiş/adres/dizin başlıklı kart etiketsiz açılırsa HER rolde uyarır', () => {
    for (const rol of ['ops-pencere', 'urun-pencere', 'arac-pencere']) {
      const r = kos(KART, kart('URN-300: 308 yönlendirme tablosu', ['kanca']), { VENTHUB_PENCERE_AGENT: rol })
      expect(r.status).toBe(0)
      expect(r.cikti, rol).toContain('DEFTER ETİKETİ YOK')
    }
  })
  it('sabotaj: defter:<ad> etiketi varsa, başka konuysa, add_task değilse, vana kapalıysa susar', () => {
    expect(kos(KART, kart('URN-300: 308 yönlendirme tablosu', ['defter:urun-adres'])).cikti).not.toContain('DEFTER ETİKETİ YOK')
    expect(kos(KART, kart('ARC-300: kanca testi', [])).cikti).not.toContain('DEFTER ETİKETİ YOK')
    expect(kos(KART, kart('URN-300: dizin isteği', [], 'add_note')).cikti).not.toContain('DEFTER ETİKETİ YOK')
    expect(kos(KART, kart('URN-300: dizin isteği', []), { VENTHUB_GECIS_KONUSU_KAPAT: '1' }).cikti).not.toContain('DEFTER ETİKETİ YOK')
    expect(kos(KART, kart('URN-300: adres eşleştirme', ['defter:YOK_BÜYÜK'])).cikti).toContain('DEFTER ETİKETİ YOK')
  })
  it('büyük harfli etiket kabul edilir; alakasız "adres/dizin" başlıkları susar', () => {
    expect(kos(KART, kart('URN-300: adres eşleştirme', ['defter:Urun-adres'])).cikti).not.toContain('DEFTER ETİKETİ YOK')
    for (const t of ['Sipariş teslimat adresi', 'e-posta adresi doğrula', 'Vitrin dizin yapısı (klasör dizini)', 'Adres defteri alanı', 'dizinde ara']) {
      expect(kos(KART, kart(`URN-301: ${t}`, [])).cikti, t).not.toContain('DEFTER ETİKETİ YOK')
    }
  })
})

describe('INV-KANCA-GECIS-KONUSU-1 · Agent ve kart açma', () => {
  it('OPS Agent açarken geçiş konusu → PreToolUse uyarısı (blok değil)', () => {
    const r = kos(AGENT, { tool_name: 'Agent', tool_input: { description: 'yeni site araştırması', prompt: 'canlıya geçiş için adres şemasını araştır' } })
    expect(r.status).toBe(0)
    expect(r.cikti).toContain(IZ)
    expect(r.cikti).toContain('PreToolUse')
  })
  it('sabotaj: OPS olmayan pencere / başka konu / SendMessage susar', () => {
    const g = { tool_name: 'Agent', tool_input: { description: 'x', prompt: 'canlıya geçiş için adres şemasını araştır' } }
    expect(kos(AGENT, g, { VENTHUB_PENCERE_AGENT: 'urun-pencere' }).cikti).toBe('')
    expect(kos(AGENT, { tool_name: 'Agent', tool_input: { description: 'x', prompt: 'kanca testini oku' } }).cikti).toBe('')
    expect(kos(AGENT, { tool_name: 'SendMessage', tool_input: { message: 'canlıya geçiş adres şeması' } }).cikti).toBe('')
  })
  it('OPS geçiş konusunda kart açarken uyarı; add_task dışı eylemde susar', () => {
    const ac = { tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'add_task', title: 'Yeni site adres araştırması', description: 'canlıya geçiş' } }
    const r = kos(KART, ac)
    expect(r.status).toBe(0)
    expect(r.cikti).toContain(IZ)
    const baska = { tool_name: 'mcp__wrongstack-kanban__kanban_manage', tool_input: { action: 'add_note', title: 'Yeni site', description: 'canlıya geçiş' } }
    expect(kos(KART, baska).cikti).toBe('')
    expect(kos(KART, ac, { VENTHUB_PENCERE_AGENT: 'katalog-pencere' }).cikti).not.toContain(IZ)
  })
})
