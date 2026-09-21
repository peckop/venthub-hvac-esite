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
const { siraDenetle, kontrolDenetle } = require_(
  path.resolve(__dirname, '../../../scripts/hijyen/kanban-toplu.cjs'),
) as {
  siraDenetle: (s: unknown) => string[]
  kontrolDenetle: (k: unknown) => string[]
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
