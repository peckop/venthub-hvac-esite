import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANBAN-TOPLU-1 · Panoya giden sıra, doğrulanamayacak kart doğuramaz.
 *
 * NİÇİN VAR (2026-09-21, ölçüldü): iş kartı panosunun ilk gerçek atamasında (kart 2e5fb1ce)
 * kanıt komutu `gh pr view … | grep -qx MERGED` idi. Doğrulayıcının güvenlik kapısı boru
 * içeren komutu HİÇ KOŞMADI: "Command contains shell operators … not permitted". Kart
 * `needs_human`a düştü ve kapanamadı. Aynı gün kurulan 11 kartlık sıra, bu kuralı
 * `scripts/hijyen/kanban-toplu.cjs` üzerinden yazıyor; bu kapı o betiğin reddini ölçer.
 *
 * İkinci sınıf: ölçütsüz kart. Pano 19 Eylül'den beri bir kartı hiç ölçüt olmadan
 * taşıyordu ("borderline — unverifiable"); iş yapılmıştı ama kapatılamıyordu.
 */

const require_ = createRequire(import.meta.url)
const { siraDenetle, kontrolDenetle, arac, mcpHatasi } = require_(
  path.resolve(__dirname, '../../../scripts/hijyen/kanban-toplu.cjs'),
) as {
  siraDenetle: (s: unknown) => string[]
  kontrolDenetle: (k: unknown) => string[]
  arac: (c: unknown, args: Record<string, unknown>) => Promise<{ veri: unknown; bayt: number }>
  mcpHatasi: (mesaj: unknown, ad: string) => Error | null
}

const temizKart = {
  title: 'ornek',
  kontroller: [{ description: 'PR birlesti', type: 'command', notes: 'gh api repos/o/r/pulls/1/merge' }],
}

describe('INV-KANBAN-TOPLU-1 · sıra denetimi', () => {
  it('temiz sıra geçer', () => {
    expect(siraDenetle({ boardId: 'b', author: 'ALTYAPI', kartlar: [temizKart] })).toEqual([])
  })

  it('⭐kabuk işleci taşıyan komut REDDEDİLİR — doğrulayıcı onu koşmaz', () => {
    for (const kotu of [
      'gh pr view 1 | grep -qx MERGED',
      'gh api a && echo x',
      'gh api a; echo x',
      'gh api a > dosya',
      'gh api $(echo a)',
      'gh api `echo a`',
    ]) {
      expect(kontrolDenetle({ description: 'x', type: 'command', notes: kotu }), kotu).not.toEqual([])
    }
  })

  it('tırnaklı jq ifadesi KABUL edilir (doğrulayıcıda koştuğu 2026-09-21 ölçüldü)', () => {
    const jq = `gh api repos/o/r/automated-security-fixes --jq 'if .enabled then "acik" else error("KAPALI") end'`
    expect(kontrolDenetle({ description: 'x', type: 'command', notes: jq })).toEqual([])
  })

  it('ölçütsüz kart REDDEDİLİR', () => {
    const h = siraDenetle({ boardId: 'b', author: 'A', kartlar: [{ title: 'olcutsuz', kontroller: [] }] })
    expect(h.join(' ')).toContain('KABUL ÖLÇÜTÜ yok')
  })

  it('komutsuz command kontrolü REDDEDİLİR', () => {
    expect(kontrolDenetle({ description: 'x', type: 'command' })).not.toEqual([])
  })
})

/**
 * INV-KANBAN-TOPLU-2 · hata zarfı (ARC-106, WrongStack 1.1.0 ölçümü 12 Ekim): geçersiz argümanı 1.0.26 JSON-RPC
 * `error` ile, 1.1.0 `result.isError=true` + düz metin ile döner; ikisi de FIRLATILMALI, sessiz yutulmamalı.
 */
describe('INV-KANBAN-TOPLU-2 · MCP hata zarfı iki biçimde de fırlatılır', () => {
  const istemci = (mesaj: unknown) => ({ istek: async () => ({ mesaj, bayt: 1 }) })

  it('⭐1.1.0 zarfı: result.isError=true düz metin → arac() FIRLATIR (eskiden sessiz yutuyordu)', async () => {
    const c = istemci({ result: { isError: true, content: [{ type: 'text', text: 'invalid arguments for tool kanban_manage: priority' }] } })
    await expect(arac(c, { action: 'add_task', priority: 'acil' })).rejects.toThrow(/add_task: .*invalid arguments/)
  })

  it('1.0.26 zarfı: JSON-RPC error → arac() FIRLATIR', async () => {
    const c = istemci({ error: { code: -32602, message: 'invalid arguments for tool kanban_manage' } })
    await expect(arac(c, { action: 'add_task' })).rejects.toThrow(/add_task: .*-32602/)
  })

  it('başarılı cevap geçer: veri ayrışır; ok:false gövde yine fırlatır (eski davranış KORUNUR)', async () => {
    const ok = istemci({ result: { content: [{ type: 'text', text: JSON.stringify({ ok: true, task: { id: 'x' } }) }] } })
    await expect(arac(ok, { action: 'add_task' })).resolves.toMatchObject({ veri: { ok: true } })
    const red = istemci({ result: { content: [{ type: 'text', text: JSON.stringify({ ok: false, error: 'kart yok' }) }] } })
    await expect(arac(red, { action: 'update_task' })).rejects.toThrow(/update_task: .*kart yok/)
  })

  it('mcpHatasi: isError metinsiz gelirse de hata döner (sessiz geçmez); normal cevapta null', () => {
    expect(mcpHatasi({ result: { isError: true } }, 'a')?.message).toMatch(/isError/)
    expect(mcpHatasi({ result: { content: [] } }, 'a')).toBeNull()
  })
})
