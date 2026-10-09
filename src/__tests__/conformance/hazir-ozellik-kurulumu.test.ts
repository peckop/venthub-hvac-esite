/**
 * INV-HAZIR-OZELLIK-1 — Claude Code'un hazır özellikleri (kural dizini, ajan hafızası) depoda GERÇEKTEN kurulu mu
 * (OPS "hazır özellik kurulumu", 2026-10-09).
 *
 * NİÇİN VAR: özellik 30 Eylül'de onaylandı ama depoya hiç girmedi; "yapıldı" sanıldı, kanıt aranmadı
 * (`.claude/rules` yoktu, 53 ajan tanımında `memory:` yoktu). Bu kapı kurulumu DOSYA olarak ölçer ve geri alınmasını yakalar.
 *
 * ÖLÇÜLMÜŞ OLGULAR (2026-10-09, deney dizini, `claude -p`):
 *   - `paths:` alanı olmayan `.claude/rules/<dosya>.md` açılışta yüklenir. Belgeye göre compact sonrası da diskten yeniden
 *     yüklenir (compact sonrası YÜKLEME ÖLÇÜLMEDİ); `paths:`li kural yalnız ilgili dosyaya dokunulunca yüklenir, yani filo
 *     ortak kuralı gibi HER oturumda gereken metin için yanlış kapsamdır.
 *   - `memory: user` → `~/.claude/agent-memory/<ad>/MEMORY.md` yüklenir; `disallowedTools: Edit, Write, NotebookEdit` ile birlikte
 *     ajan yazma araçlarının KAPALI olduğunu söyledi (hafıza yetkisi yazmayı açmadı). Salt-okuma çalışan kendi hafızasına
 *     yazamaz; hafızayı müdür (departman penceresi) yazar.
 *   - Hafıza KULLANICI kapsamındadır (`user`): depo PUBLIC olduğundan `project`/`local` kapsamı hafızayı depo içine yazar
 *     (sızıntı yolu) ve worktree'ler arasında bölünür. Bu yüzden kapı yalnız `memory: user` kabul eder.
 *
 * Bu dosya `hazir-ozellik-*` adıyla OPS şeridindedir (board: ops-hazir-ozellik).
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const kok = path.resolve(__dirname, '..', '..', '..')
const KURAL_YOLU = path.join('.claude', 'rules', 'filo-ortak.md')
const AJAN_DIZINI = path.join(kok, '.claude', 'agents')

/** Kural dosyasının üst sınırı (satır). Her açılışta bağlama girer; şişerse her oturum ve her alt ajan öder. */
const KURAL_SATIR_TAVANI = 120
/**
 * Kural dosyasında BULUNMASI GEREKEN işaretler: her biri filonun tekrar tekrar düştüğü bir ders.
 * Metin değişirse işaret de bilerek güncellenir; işaret sessizce düşmez.
 */
const KURAL_ISARETLERI = ['/compact', 'kart numara', 'mekanik', 'YÖNTEM:', 'ağır komut'] as const
/** Yazmayan çalışan türleri (ajan-tanimi-uret.cjs YAZMAYAN ile aynı üç ad). */
const SALT_OKUMA = /-(arastirmaci|curutucu|dogrulayici)\.md$/
/** Üreticinin yazdığı yardımcı ajan adları (dört tür); security-reviewer ve denetim-opus bu kalıpta değildir. */
const YARDIMCI = /-(arastirmaci|uygulayici|curutucu|dogrulayici)\.md$/

const lf = (m: string): string => m.replace(/\r\n/g, '\n')

/** `---` ile çevrili frontmatter gövdesi; yoksa boş dize. */
function frontmatter(metin: string): string {
  return /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(lf(metin))?.[1] ?? ''
}

/** Frontmatter'da tek satırlık `anahtar: değer` okur. */
function alan(fm: string, anahtar: string): string | undefined {
  return new RegExp(`^${anahtar}:[ \\t]*(.*?)[ \\t]*$`, 'm').exec(fm)?.[1]
}

/** Kural dosyası sorunları: satır tavanı, `paths:`li (koşullu) kapsam, eksik işaret, boş dosya. */
function kuralSorunlari(metin: string): string[] {
  const m = lf(metin)
  const s: string[] = []
  const satir = m.replace(/\n$/, '').split('\n').length
  if (!m.trim()) s.push('kural dosyası boş')
  if (satir > KURAL_SATIR_TAVANI) s.push(`${satir} satır > ${KURAL_SATIR_TAVANI}`)
  if (/^paths:/m.test(frontmatter(m))) s.push('frontmatter `paths:` taşıyor: kural yalnız ilgili dosyaya dokunulunca yüklenir, açılışta DEĞİL')
  for (const i of KURAL_ISARETLERI) if (!m.includes(i)) s.push(`işaret yok: "${i}"`)
  return s
}

/** Yazmayan türün `disallowedTools` alanında Edit ve Write kapalı mı. */
function yazmaKapaliMi(fm: string): boolean {
  const araclar = (alan(fm, 'disallowedTools') ?? '').split(',').map((x) => x.trim())
  return araclar.includes('Edit') && araclar.includes('Write')
}

const ajanDosyalari = (): string[] => fs.readdirSync(AJAN_DIZINI).filter((f) => f.endsWith('.md')).sort()
const ajanFm = (f: string): string => frontmatter(fs.readFileSync(path.join(AJAN_DIZINI, f), 'utf8'))

describe('INV-HAZIR-OZELLIK-1 — .claude/rules/filo-ortak.md', () => {
  const yol = path.join(kok, KURAL_YOLU)

  it('dosya var, paths: taşımaz, tavanı aşmaz ve işaretlerin hepsini içerir', () => {
    expect(fs.existsSync(yol), `${KURAL_YOLU} yok: hazır özellik kurulumu depoya girmemiş`).toBe(true)
    expect(kuralSorunlari(fs.readFileSync(yol, 'utf8'))).toEqual([])
  })

  it('metindeki literal belge ve betik yolları gerçekten var (kural var olmayan cetvele işaret etmez)', () => {
    const metin = lf(fs.readFileSync(yol, 'utf8'))
    const yollar = [...new Set(metin.match(/\b(?:docs|scripts)\/[A-Za-z0-9_./-]+\.(?:md|cjs)\b/g) ?? [])]
    expect(yollar.length).toBeGreaterThan(3)
    const yok = yollar.filter((y) => !fs.existsSync(path.join(kok, y)))
    expect(yok).toEqual([])
    // docs/roller/*-kurallar.md deseni: dizinde en az bir kurallar dosyası olmalı
    const roller = fs.readdirSync(path.join(kok, 'docs', 'roller')).filter((f) => f.endsWith('-kurallar.md'))
    expect(roller.length).toBeGreaterThan(0)
  })

  it('ayırt edici: bozulmuş metinde kapı kırmızı verir (işaret silinir, tavan aşılır, paths: eklenir, dosya boşalır)', () => {
    const saglam = fs.readFileSync(yol, 'utf8')
    for (const i of KURAL_ISARETLERI) {
      expect(kuralSorunlari(saglam.split(i).join('')), `işaret silindi: ${i}`).toContainEqual(`işaret yok: "${i}"`)
    }
    expect(kuralSorunlari(saglam + '\nbir satır\n'.repeat(KURAL_SATIR_TAVANI)).some((x) => /satır >/.test(x))).toBe(true)
    expect(kuralSorunlari(`---\npaths:\n  - "src/**"\n---\n${saglam}`).some((x) => /paths:/.test(x))).toBe(true)
    expect(kuralSorunlari('').length).toBeGreaterThan(0)
  })
})

describe('INV-HAZIR-OZELLIK-1 — ajan hafızası ve yazma kapısı', () => {
  it('kaynak sağlam: .claude/agents altında salt-okuma ajanı çok sayıda (kapı boş kümeyi geçmesin)', () => {
    expect(ajanDosyalari().filter((f) => SALT_OKUMA.test(f)).length).toBeGreaterThan(30)
  })

  it('salt-okuma ajanlarında (-arastirmaci, -curutucu, -dogrulayici) disallowedTools içinde Edit ve Write hâlâ var', () => {
    const acik = ajanDosyalari().filter((f) => SALT_OKUMA.test(f) && !yazmaKapaliMi(ajanFm(f)))
    expect(acik, 'hafıza kurulurken yazma kapısı açılmış olabilir').toEqual([])
  })

  it('hafıza varsa KULLANICI kapsamındadır: memory alanı yalnız `user` olur (project/local hafızayı PUBLIC depoya yazar)', () => {
    const yanlis = ajanDosyalari()
      .map((f) => ({ f, v: alan(ajanFm(f), 'memory') }))
      .filter((x) => x.v !== undefined && x.v !== 'user')
    expect(yanlis).toEqual([])
  })

  it('üretilen her yardımcıda (-arastirmaci, -uygulayici, -curutucu, -dogrulayici) `memory: user` var; allowlist\'li iki tanım (security-reviewer, denetim-opus) hafızasız kalır', () => {
    const yardimcilar = ajanDosyalari().filter((f) => YARDIMCI.test(f))
    expect(yardimcilar.length, 'kapı boş kümeyi geçmesin: üretilen yardımcı sayısı beklenenden az').toBeGreaterThan(40)
    const eksik = yardimcilar.filter((f) => alan(ajanFm(f), 'memory') !== 'user')
    expect(eksik, 'üretici `memory: user` yazmıyor ya da dosya elle bozulmuş (scripts/belge/ajan-tanimi-uret.cjs --yaz)').toEqual([])
    // Muaf iki tanım: tools allowlist'i var; memory verilince Read/Write/Edit otomatik açılır (ÖLÇÜLMEDİ). Eklenirse karar yeniden verilir.
    const muaflar = ajanDosyalari().filter((f) => !YARDIMCI.test(f))
    expect(muaflar.sort()).toEqual(['denetim-opus.md', 'security-reviewer.md'])
    expect(muaflar.filter((f) => alan(ajanFm(f), 'memory') !== undefined)).toEqual([])
  })

  it('ayırt edici: ayrıştırıcı yazma kapısının açılmasını ve yanlış kapsamı yakalar', () => {
    const tam = '---\nname: x-arastirmaci\nmodel: sonnet\nmemory: user\ndisallowedTools: Edit, Write, NotebookEdit\n---\ngövde\n'
    expect(yazmaKapaliMi(frontmatter(tam))).toBe(true)
    expect(yazmaKapaliMi(frontmatter(tam.replace('Write, ', '')))).toBe(false)
    expect(yazmaKapaliMi(frontmatter(tam.replace('Edit, ', '')))).toBe(false)
    expect(yazmaKapaliMi(frontmatter(tam.replace(/disallowedTools:.*\n/, '')))).toBe(false)
    expect(alan(frontmatter(tam), 'memory')).toBe('user')
    expect(alan(frontmatter(tam.replace('memory: user', 'memory: project')), 'memory')).toBe('project')
    expect(alan(frontmatter(tam.replace('memory: user\n', '')), 'memory')).toBeUndefined()
    // CRLF ile yazılmış tanım da aynı okunur
    expect(alan(frontmatter(tam.replace(/\n/g, '\r\n')), 'memory')).toBe('user')
  })
})
