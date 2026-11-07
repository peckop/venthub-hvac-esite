/**
 * INV-WEBHOOK-HATA-1 (ALT-167): kargo ve iade webhook'ları 500 gövdesinde ham DB ya da istisna mesajı döndürmez.
 * Ayrıntı yalnız günlüğe (console.error) gider; çağırana sabit kod döner (UPDATE_FAILED, INTERNAL).
 * Kaynak: security-reviewer, #2286 incelemesi bulgu 4. Cetvel: docs/standards/edge-function-security-standard.md.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = path.resolve(__dirname, '../../..')
const FONKSIYONLAR = ['shipping-webhook', 'returns-webhook']

/** Bir yanıt çağrısının (json/jsonResponse) argümanında `.message` geçen satırlar. */
function mesajSizanSatirlar(kaynak: string): string[] {
  return kaynak
    .split(/\r?\n/)
    .filter((s) => /\b(json|jsonResponse)\s*\(/.test(s) && /\.message\b/.test(s))
    .map((s) => s.trim())
}

describe('INV-WEBHOOK-HATA-1: webhook hata gövdesi ham mesaj içermez', () => {
  for (const ad of FONKSIYONLAR) {
    it(`${ad}: json/jsonResponse çağrısında .message yok`, () => {
      const kaynak = fs.readFileSync(path.join(KOK, 'supabase', 'functions', ad, 'index.ts'), 'utf8')
      expect(mesajSizanSatirlar(kaynak)).toEqual([])
    })

    it(`${ad}: her 500 yanıtının error alanı sabit metin (değişken yok)`, () => {
      const kaynak = fs.readFileSync(path.join(KOK, 'supabase', 'functions', ad, 'index.ts'), 'utf8')
      const besyuzler = kaynak.split(/\r?\n/).filter((s: string) => /status:\s*500/.test(s))
      expect(besyuzler.length).toBeGreaterThan(0)
      for (const s of besyuzler) expect(s, s.trim()).toMatch(/\{\s*error:\s*'[^']*'\s*(,\s*code:\s*'[A-Z_]+'\s*)?\}/)
    })
  }

  it('SABOTAJ: tarayıcı ham mesaj döndüren satırı yakalar', () => {
    expect(mesajSizanSatirlar("return json({ error: updErr.message || 'x' }, { status: 500 })")).toHaveLength(1)
    expect(mesajSizanSatirlar("return jsonResponse({ error: _e instanceof Error ? _e.message : 'x' }, { status: 500 })")).toHaveLength(1)
    expect(mesajSizanSatirlar("console.error('x', { hata: e.message })")).toHaveLength(0)
  })
})
