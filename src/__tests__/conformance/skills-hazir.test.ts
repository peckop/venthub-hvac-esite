import fs from 'node:fs'
import path from 'node:path'
import { describe, it, expect } from 'vitest'

/**
 * INV-SKILLS-HAZIR-1 — `.claude/skills-hazir/` (uyarlanmış ama ETKİN OLMAYAN skill'ler) kuralı.
 *
 * NİÇİN: hazır klasördeki bir skill, çalışması için gereken parça (ör. köprü sunucusu) bizde yokken
 * `.claude/skills/` altına da konursa oturum açıklama yükü artar ve model olmayan bir araca yönlenir.
 * Klasörün kuralı `.claude/skills-hazir/README.md`'de yazılıdır; bu kapı üç şeyi ölçer:
 *   (1) her hazır skill künyesinde `durum: "HAZIR` taşır (etkin olmadığı ve neden okunur),
 *   (2) aynı ad `.claude/skills/` altında YOK (çift yükleme),
 *   (3) README var ve her hazır skill'in adını anıyor (kayıt tam).
 * Dış kaynak atfı (`NOTICE.md`) `INV-NOTICE-KAPSAM-1`'de ölçülür.
 */
const KOK = process.cwd()
const HAZIR = path.join(KOK, '.claude', 'skills-hazir')
const ETKIN = path.join(KOK, '.claude', 'skills')

function hazirSkilller(): string[] {
  if (!fs.existsSync(HAZIR)) return []
  return fs
    .readdirSync(HAZIR, { withFileTypes: true })
    .filter((g) => g.isDirectory() && fs.existsSync(path.join(HAZIR, g.name, 'SKILL.md')))
    .map((g) => g.name)
}

describe('INV-SKILLS-HAZIR-1 · hazir klasordeki skill etkin degil', () => {
  it('kapi VAKUMDA YESIL VERMEZ: hazir klasor var ve icinde skill BULUNUYOR', () => {
    expect(fs.existsSync(HAZIR), '.claude/skills-hazir/ yok — kapi hicbir sey olcmuyor').toBe(true)
    expect(hazirSkilller().length, 'hazir klasorde skill yok — kapi kor').toBeGreaterThan(0)
  })

  it('her hazir skill kunyesinde durum: "HAZIR tasiyor (neden etkin olmadigi yazili)', () => {
    const eksik = hazirSkilller().filter((ad) => {
      const metin = fs.readFileSync(path.join(HAZIR, ad, 'SKILL.md'), 'utf8')
      return !/^\s*durum:\s*"HAZIR/m.test(metin)
    })
    expect(eksik, 'kunyede `durum: "HAZIR - ...` alani olmayan hazir skill').toEqual([])
  })

  it('⭐ASIL IDDIA — ayni ad .claude/skills altinda YOK (cift yukleme, aciklama yuku)', () => {
    const cift = hazirSkilller().filter((ad) => fs.existsSync(path.join(ETKIN, ad)))
    expect(
      cift,
      'Bu skill hem hazir klasorde hem etkin agacta: etkinlestirme klasoru TASIMAKTIR (README kural 4), kopyalamak degil.',
    ).toEqual([])
  })

  it('README var ve her hazir skill in adini aniyor', () => {
    const readme = path.join(HAZIR, 'README.md')
    expect(fs.existsSync(readme), 'skills-hazir/README.md yok').toBe(true)
    const metin = fs.readFileSync(readme, 'utf8')
    const anilmayan = hazirSkilller().filter((ad) => !metin.includes(ad))
    expect(anilmayan, 'README tablosunda gecmeyen hazir skill (eksik parca ve sahibi yazili degil)').toEqual([])
  })
})
