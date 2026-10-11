// @vitest-environment node
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-LISTE-SAY-1 · skill listesi KESİN sayımının çekirdeği doğru sayıyor (REC-519).
 *
 * NİÇİN: 2026-10-01'de "kesin sayım" iki kez yanlış çıktı. (1) "Modele kendi listesini saydır" yolu Haiku için
 * 109-116 dedi, gerçek 128. (2) İlk betik `^- [^:]+: ` düzenli ifadesini kullandı; eklenti önekli adları
 * (`eklenti:skill: açıklama`) yanlışlıkla ADSIZ saydı (Sonnet 43, gerçek 3). Yanlış sayı bir "kesin" damgasıyla
 * OPS'a gitti; betiğe taşırken yakalandı. Kesin sayımın çekirdeği bu yüzden fixture'lı testle sabitlenir.
 *
 * ⛔SINIR: bu kapı YALNIZ ayrıştırma çekirdeğini ölçer (`say`, `listingCikar`). `claude -p` çağıran, döküm
 * üreten ve silen kısım ücretli/yerel bir araçtır; CI'da koşmaz ve burada SINANMAZ.
 */
const require = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const m = require(path.join(KOK, 'scripts/hijyen/skill-listesi-say.cjs')) as {
  say: (listing: string, proje: string[]) => { toplam: number; adsiz: number; proje: number; projeToplam: number; projeAdsiz: number }
  listingCikar: (jsonl: string) => string | null
  satirAciklamali: (satir: string) => boolean
  adOku: (satir: string) => string
}

const LISTE = [
  '- accessibility: Audit and improve web accessibility following WCAG 2.2 guidelines.',
  '- typesafe:typesafe-ai: Build AI-powered software with TypeSafe.', // eklenti önekli, AÇIKLAMALI
  '- sentry:sentry-create-alert', // eklenti önekli, ADSIZ
  '- testing', // proje skill'i, ADSIZ
  '- git-flow: Git işlemlerinde güvenli akış.', // proje skill'i, açıklamalı
  'Başka bir satır (liste dışı, sayılmaz)',
].join('\n')

describe('INV-SKILL-LISTE-SAY-1 · saf ayrıştırma', () => {
  it('eklenti önekli AÇIKLAMALI satır adsız SAYILMAZ (eski regex burada yanılıyordu)', () => {
    expect(m.satirAciklamali('- typesafe:typesafe-ai: Build AI-powered software.')).toBe(true)
    // eski ifade: /^- [^:]+: / bu satırı adsız sayardı
    expect(/^- [^:]+: /.test('- typesafe:typesafe-ai: Build AI-powered software.')).toBe(false)
  })

  it('eklenti önekli ama açıklamasız satır ADSIZ sayılır', () => {
    expect(m.satirAciklamali('- sentry:sentry-create-alert')).toBe(false)
  })

  it('ad okuma: iki nokta üstü + boşluk ayracı, eklenti öneki addan sayılır', () => {
    expect(m.adOku('- typesafe:typesafe-ai: Build')).toBe('typesafe:typesafe-ai')
    expect(m.adOku('- testing')).toBe('testing')
  })

  it('say: toplam, adsız, proje ve proje-adsız doğru; liste dışı satır sayılmaz', () => {
    const s = m.say(LISTE, ['testing', 'git-flow', 'olmayan-skill'])
    expect(s).toEqual({ toplam: 5, adsiz: 2, proje: 2, projeToplam: 3, projeAdsiz: 1 })
  })

  it('listingCikar: ilk skill_listing ekini bulur, bozuk satırı atlar, yoksa null', () => {
    const jsonl = ['{bozuk', JSON.stringify({ type: 'user' }), JSON.stringify({ attachment: { type: 'skill_listing', content: LISTE } })].join('\n')
    expect(m.listingCikar(jsonl)).toBe(LISTE)
    expect(m.listingCikar(JSON.stringify({ type: 'user' }))).toBeNull()
  })
})
