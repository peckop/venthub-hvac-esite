/**
 * INV-HAZIR-OZELLIK-1 — Claude Code'un hazır özelliklerinden KURAL DİZİNİ depoda gerçekten var mı, ajan tanımlarında
 * yazma kapısı ve hafıza kapsamı bozulmamış mı (Kanban OPS-102, 2026-10-09).
 *
 * NİÇİN VAR: özellik 30 Eylül'de onaylandı ama depoya hiç girmedi; "yapıldı" sanıldı, kanıt aranmadı
 * (`.claude/rules` yoktu, 53 ajan tanımında `memory:` yoktu). Bu kapı kural dosyasını DOSYA olarak ölçer ve geri alınmasını yakalar.
 *
 * KAPSAM (dürüst sınır): bu dosya (1) `.claude/rules/filo-ortak.md` dosyasının varlığını, boyutunu ve üreticideki ortak
 * metinlerle eşitliğini ölçer; (2) ajan tanımlarında yazma kapısının kapalı kaldığını ve `memory:` alanının yalnız `user`
 * olabildiğini korur. Ajan hafızasının KURULUMUNU (`memory: user` satırının üretilen 51 tanımda bulunmasını) ölçmez: o adım
 * Kanban HRT-48 / PR #1795'tedir ve oradaki "her yardımcıda memory: user" kolu eklenince kurulum da ölçülür. Hafıza yokken
 * bu testin yeşil olması "hafıza kuruldu" demek DEĞİLDİR.
 *
 * ÖLÇÜLMÜŞ OLGULAR (2026-10-09, deney dizini, `claude -p`):
 *   - `paths:` alanı olmayan `.claude/rules/<dosya>.md` açılışta yüklenir. Belgeye göre compact sonrası da diskten yeniden
 *     yüklenir (compact sonrası YÜKLEME ÖLÇÜLMEDİ); `paths:`li kural yalnız ilgili dosyaya dokunulunca yüklenir, yani filo
 *     ortak kuralı gibi HER oturumda gereken metin için yanlış kapsamdır.
 *   - `memory: user` → `~/.claude/agent-memory/<ad>/MEMORY.md` yüklenir; `disallowedTools: Edit, Write, NotebookEdit` ile birlikte
 *     ajan yazma araçlarının KAPALI olduğunu söyledi (hafıza yetkisi yazmayı açmadı). Salt-okuma çalışan kendi hafızasına
 *     yazamaz; hafızayı müdür (departman penceresi) yazar. Aynı sonuç `Agent` aracıyla ADSIZ açılan alt ajan yolunda da
 *     ölçüldü (10-09, Haiku, iki koşu, `memory: user` + `disallowedTools`): araç listesinde Write, Edit ve NotebookEdit YOKTU,
 *     MEMORY.md bağlamdaydı. ÖLÇÜLMEDİ: `tools:` allowlist'li tanımda `memory` (security-reviewer) ve `name` ile açılan ekip üyesi
 *     yolu (cetvel §10.3: orada yazma yasağı zaten işlemiyor, ARC-20); bu yüzden allowlist'li tanımda `memory` kapıda yasaktır.
 *   - Hafıza KULLANICI kapsamındadır (`user`): depo PUBLIC olduğundan `project`/`local` kapsamı hafızayı depo içine yazar
 *     (sızıntı yolu) ve worktree'ler arasında bölünür. Bu yüzden kapı yalnız `memory: user` kabul eder.
 *
 * ETKİ SINIRI: kural dosyası YALNIZ yeni açılan pencerelerde yüklenir; açık pencereler yeniden açılana kadar eski davranışla çalışır.
 * Yeniden açılan pencerede ve compact sonrasında yüklendiği ölçülene kadar "compact kök sebebi çözüldü" denmez.
 *
 * SIZINTI TARAMASI: depo PUBLIC; kural dosyası e-posta, anahtar/sır deseni ve yerel yol taşımaz (aşağıda sınanır).
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const kok = path.resolve(__dirname, '..', '..', '..')
const KURAL_YOLU = path.join('.claude', 'rules', 'filo-ortak.md')
const AJAN_DIZINI = path.join(kok, '.claude', 'agents')

/** Kural dosyasının üst sınırı (satır). Her açılışta bağlama girer; şişerse her oturum ve her alt ajan öder. */
const KURAL_SATIR_TAVANI = 120
/** Aynı sınır bayt olarak (en uzun satır 300+ karakter olabildiği için satır tavanı tek başına yetmez). */
const KURAL_BAYT_TAVANI = 10_000
/**
 * Kural dosyasında BULUNMASI GEREKEN işaretler: her biri filonun tekrar tekrar düştüğü bir ders.
 * Metin değişirse işaret de bilerek güncellenir; işaret sessizce düşmez.
 */
const KURAL_ISARETLERI = ['/compact', 'kart numara', 'mekanik', 'YÖNTEM:', 'ağır komut', 'verify_completion', 'pnpm test:ilgili', 'Kanban: <ÖN EK>-<sayı>'] as const
/** Yazmayan çalışan türleri (ajan-tanimi-uret.cjs YAZMAYAN ile aynı üç ad). */
const SALT_OKUMA = /-(arastirmaci|curutucu|dogrulayici)\.md$/

const lf = (m: string): string => m.replace(/\r\n/g, '\n')

/** Dosya başındaki BOM (U+FEFF). Claude Code'un BOM'lu frontmatter'ı okuyup okumadığı ÖLÇÜLMEDİ: ayrıştırıcı BOM'u atar, kapı ise BOM'u ayrıca KIRMIZI sayar. */
const BOM = '﻿'
const bomluMu = (metin: string): boolean => metin.startsWith(BOM)

/** `---` ile çevrili frontmatter gövdesi; yoksa boş dize. */
function frontmatter(metin: string): string {
  const m = lf(metin.startsWith(BOM) ? metin.slice(1) : metin)
  return /^---\n([\s\S]*?)\n---(?:\n|$)/.exec(m)?.[1] ?? ''
}

/** `anahtar: değer` satırı; YAML'da geçerli olan tırnaklı anahtar (`"memory":`) ve iki nokta öncesi boşluk (`memory :`) da tanınır. */
const anahtarKalibi = (anahtar: string): RegExp => new RegExp(`^["']?${anahtar}["']?[ \\t]*:[ \\t]*(.*?)[ \\t]*$`, 'm')

/** Skaler değer: satır sonu yorumu (` # ...`) ve çevreleyen tırnak atılır. */
const skaler = (ham: string): string => ham.replace(/[ \t]+#.*$/, '').trim().replace(/^(["'])(.*)\1$/, '$2')

/** Frontmatter'da tek satırlık `anahtar: değer` okur; alan yoksa undefined. */
function alan(fm: string, anahtar: string): string | undefined {
  const e = anahtarKalibi(anahtar).exec(fm)
  return e ? skaler(e[1]) : undefined
}

/** Liste alanı: satır içi `a, b` / `[a, b]` ve altındaki `- a` blok biçimi (`skills:` böyle yazılıyor). Alan yoksa undefined. */
function liste(fm: string, anahtar: string): string[] | undefined {
  const satirlar = fm.split('\n')
  const i = satirlar.findIndex((s) => anahtarKalibi(anahtar).test(s))
  if (i < 0) return undefined
  const ic = skaler(anahtarKalibi(anahtar).exec(satirlar[i])?.[1] ?? '').replace(/^\[|\]$/g, '')
  const blok: string[] = []
  for (const s of satirlar.slice(i + 1)) {
    const e = /^[ \t]*-[ \t]+(.*?)[ \t]*$/.exec(s)
    if (!e) break
    blok.push(e[1])
  }
  return [...ic.split(','), ...blok].map((x) => skaler(x)).filter((x) => x !== '')
}

/** Kural dosyası sorunları: satır ve bayt tavanı, BOM, `paths:`li (koşullu) kapsam, eksik işaret, boş dosya. */
function kuralSorunlari(metin: string): string[] {
  const m = lf(metin)
  const s: string[] = []
  const satir = m.replace(/\n$/, '').split('\n').length
  if (!m.trim()) s.push('kural dosyası boş')
  if (satir > KURAL_SATIR_TAVANI) s.push(`${satir} satır > ${KURAL_SATIR_TAVANI}`)
  const bayt = Buffer.byteLength(m, 'utf8')
  if (bayt > KURAL_BAYT_TAVANI) s.push(`${bayt} bayt > ${KURAL_BAYT_TAVANI}`)
  if (bomluMu(m)) s.push('BOM ile başlıyor: Claude Code frontmatter okumasını bozabilir (ölçülmedi)')
  if (/^["']?paths["']?[ \t]*:/m.test(frontmatter(m))) s.push('frontmatter `paths:` taşıyor: kural yalnız ilgili dosyaya dokunulunca yüklenir, açılışta DEĞİL')
  for (const i of KURAL_ISARETLERI) if (!m.includes(i)) s.push(`işaret yok: "${i}"`)
  return s
}

/**
 * Yazmayan türde yazma kapısı kapalı mı: `disallowedTools` Edit, Write ve NotebookEdit'i birlikte yasaklıyor
 * YA DA `tools:` allowlist'i var ve içinde yazma aracı yok (security-reviewer böyle).
 */
function yazmaKapaliMi(fm: string): boolean {
  const yasak = liste(fm, 'disallowedTools') ?? []
  const izinli = liste(fm, 'tools')
  const yasakKapali = ['Edit', 'Write', 'NotebookEdit'].every((a) => yasak.includes(a))
  const allowlistKapali = izinli !== undefined && !izinli.some((a) => /^(Edit|Write|NotebookEdit|MultiEdit)$/.test(a))
  return yasakKapali || allowlistKapali
}

/** `.claude/agents` altındaki tanımlar. Claude Code dizini ÖZYİNELEMELİ tarar, kapı da öyle yapar (alt dizindeki tanım kaçmasın). */
const ajanDosyalari = (): string[] =>
  fs
    .readdirSync(AJAN_DIZINI, { recursive: true })
    .map((f) => String(f).replace(/\\/g, '/'))
    .filter((f) => f.endsWith('.md'))
    .sort()
const ajanMetin = (f: string): string => fs.readFileSync(path.join(AJAN_DIZINI, f), 'utf8')
const ajanFm = (f: string): string => frontmatter(ajanMetin(f))
/** Salt-okuma niyeti: üretilen yazmayan tür adı YA DA açıklamada "SALT-OKUMA" (üretilmeyen security-reviewer gibi). */
const saltOkumaNiyetli = (f: string): boolean => SALT_OKUMA.test(f) || /salt[- ]okuma/i.test(alan(ajanFm(f), 'description') ?? '')

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

  it('üretici bloklarıyla eşit: ortak metinler (tablo başlığı, yedi durum kelimesi, /compact kalıbı, Yarım iş satırı, iki aşamalı cümle) kaynaktaki yazımın AYNISI', () => {
    // Bu dosya docs/roller/*-kurallar.md bloklarının kısaltılmış kopyasıdır; üretici ya da kanca metni değişirse burası KIRMIZI olur.
    const kaynak = (yolu: string): string => lf(fs.readFileSync(path.join(kok, yolu), 'utf8')).replace(/\\'/g, "'")
    const uretici = kaynak(path.join('scripts', 'belge', 'rol-karti-uret.cjs'))
    const kanca = kaynak(path.join('.claude', 'hooks', 'baglam-doluluk.cjs'))
    const kural = lf(fs.readFileSync(yol, 'utf8'))
    const ureticiParcalari = [
      '| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |',
      'Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti',
      "/compact Recep'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.",
      'hüküm "Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim"',
      'Yarım iş: yok — <kısa>',
      'Yarım iş: var — <ne>, <ne zaman güvenli>',
      'başka bir departmanın işini bekliyor',
    ]
    const kancaParcalari = [
      'Compact iki aşamalıdır: önce araç çıktıları temizlenir, konuşmanın özeti sonra gelir.',
      'Uyarı kısa sürede yeniden görünebilir; bu normaldir ve hiçbir iş kaybolmaz.',
    ]
    for (const p of ureticiParcalari) {
      expect(uretici.includes(p), `üretici (rol-karti-uret.cjs) bu metni artık taşımıyor: ${p}`).toBe(true)
      expect(kural.includes(p.replace('hüküm ', '')), `kural dosyası bu metni taşımıyor: ${p}`).toBe(true)
    }
    for (const p of kancaParcalari) {
      expect(kanca.includes(p), `kanca (baglam-doluluk.cjs) bu metni artık taşımıyor: ${p}`).toBe(true)
      expect(kural.includes(p), `kural dosyası bu metni taşımıyor: ${p}`).toBe(true)
    }
  })

  it('sızıntı yok: depo PUBLIC; kural dosyası e-posta, yerel yol, anahtar ya da sır deseni taşımaz', () => {
    const kural = fs.readFileSync(yol, 'utf8')
    expect(kural).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.-]+/)
    expect(kural).not.toMatch(/\b[A-Za-z]:[\\/](?:Users|tmp)\b/)
    expect(kural).not.toMatch(/\b(?:sk-[A-Za-z0-9_-]{16,}|eyJ[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{12,}|ghp_[A-Za-z0-9]{20,})\b/)
  })

  it('ayırt edici: bozulmuş metinde kapı kırmızı verir (işaret silinir, tavan aşılır, paths: eklenir, dosya boşalır, BOM)', () => {
    const saglam = fs.readFileSync(yol, 'utf8')
    for (const i of KURAL_ISARETLERI) {
      expect(kuralSorunlari(saglam.split(i).join('')), `işaret silindi: ${i}`).toContainEqual(`işaret yok: "${i}"`)
    }
    expect(kuralSorunlari(saglam + '\nbir satır\n'.repeat(KURAL_SATIR_TAVANI)).some((x) => /satır >/.test(x))).toBe(true)
    expect(kuralSorunlari(saglam + 'x'.repeat(KURAL_BAYT_TAVANI)).some((x) => /bayt >/.test(x))).toBe(true)
    expect(kuralSorunlari(`---\npaths:\n  - "src/**"\n---\n${saglam}`).some((x) => /paths:/.test(x))).toBe(true)
    // YAML'da geçerli başka yazımlar da paths: sayılır: boşluklu, tek ya da çift tırnaklı anahtar, CRLF, BOM'lu dosya
    for (const yazim of ['paths :', '"paths":', "'paths':"]) {
      expect(kuralSorunlari(`---\n${yazim}\n  - "src/**"\n---\n${saglam}`).some((x) => /paths:/.test(x)), yazim).toBe(true)
    }
    expect(kuralSorunlari(`---\r\npaths:\r\n  - "src/**"\r\n---\r\n${saglam}`).some((x) => /paths:/.test(x))).toBe(true)
    expect(kuralSorunlari(`${BOM}${saglam}`).some((x) => /BOM/.test(x))).toBe(true)
    expect(kuralSorunlari(`${BOM}---\npaths:\n  - "src/**"\n---\n${saglam}`).some((x) => /paths:/.test(x))).toBe(true)
    expect(kuralSorunlari('').length).toBeGreaterThan(0)
  })
})

describe('INV-HAZIR-OZELLIK-1 — ajan yazma kapısı ve hafıza KAPSAMI (hafızanın kurulumu değil: o adım HRT-48 / #1795)', () => {
  it('kaynak sağlam: .claude/agents altında salt-okuma ajanı çok sayıda (kapı boş kümeyi geçmesin)', () => {
    expect(ajanDosyalari().filter((f) => SALT_OKUMA.test(f)).length).toBeGreaterThan(30)
  })

  it('salt-okuma ajanlarında (-arastirmaci, -curutucu, -dogrulayici ve açıklaması SALT-OKUMA diyenler) yazma kapısı kapalı: disallowedTools Edit+Write+NotebookEdit ya da yazma aracı içermeyen tools allowlist', () => {
    const niyetli = ajanDosyalari().filter(saltOkumaNiyetli)
    expect(niyetli.length, 'kapı boş kümeyi geçmesin').toBeGreaterThan(30)
    expect(niyetli, 'üretilmeyen salt-okuma tanımı da kapsamda olmalı (security-reviewer)').toContain('security-reviewer.md')
    const acik = niyetli.filter((f) => !yazmaKapaliMi(ajanFm(f)))
    expect(acik, 'hafıza kurulurken yazma kapısı açılmış olabilir').toEqual([])
  })

  it('üreticiyle bağ: SALT_OKUMA kalıbı, ajan-tanimi-uret.cjs YAZMAYAN kümesiyle birebir aynı türleri tanır (iki liste sessizce ayrışmasın)', () => {
    const uretici = createRequire(import.meta.url)(path.join(kok, 'scripts', 'belge', 'ajan-tanimi-uret.cjs')) as {
      YAZMAYAN: Set<string>
      TURLER: Record<string, unknown>
    }
    const turler = Object.keys(uretici.TURLER)
    expect(turler.length).toBeGreaterThan(3)
    for (const tur of turler) {
      expect(SALT_OKUMA.test(`x-${tur}.md`), `tür: ${tur}`).toBe(uretici.YAZMAYAN.has(tur))
    }
  })

  it('hafıza varsa KULLANICI kapsamındadır: memory alanı yalnız `user` olur (project/local hafızayı PUBLIC depoya yazar)', () => {
    const yanlis = ajanDosyalari()
      .map((f) => ({ f, v: alan(ajanFm(f), 'memory') }))
      .filter((x) => x.v !== undefined && x.v !== 'user')
    expect(yanlis).toEqual([])
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

  it('her ajan dosyası okunabilir frontmatter taşır (name dosya adıyla aynı), BOM ile başlamaz: ayrıştırılamayan dosya sessizce geçmesin', () => {
    const sorunlu: string[] = []
    for (const f of ajanDosyalari()) {
      const taban = path.basename(f, '.md')
      if (bomluMu(ajanMetin(f))) sorunlu.push(`${f}: BOM ile başlıyor (Claude Code okuması ölçülmedi)`)
      else if (alan(ajanFm(f), 'name') !== taban) sorunlu.push(`${f}: frontmatter yok ya da name dosya adıyla aynı değil`)
    }
    expect(sorunlu).toEqual([])
  })

  it('memory taşıyan tanımda `tools:` allowlist olamaz: memory açılınca Read/Write/Edit otomatik açılır ve allowlist ile önceliği ÖLÇÜLMEDİ', () => {
    const riskli = ajanDosyalari().filter((f) => alan(ajanFm(f), 'memory') !== undefined && liste(ajanFm(f), 'tools') !== undefined)
    expect(riskli).toEqual([])
    // allowlist'li iki tanım bugün hafızasızdır; memory eklemek ayrı karar ve ayrı ölçüm ister
    for (const f of ['security-reviewer.md', 'denetim-opus.md']) {
      expect(alan(ajanFm(f), 'memory'), `${f}: memory eklenirse yazma kapısı ölçülmeden açılabilir`).toBeUndefined()
    }
  })

  it('ayırt edici: ayrıştırıcı YAML yazım çeşitlerini okur (tırnak, boşluk, yorum, liste biçimleri, BOM) ve kapı bunlarda kırmızı verir', () => {
    const govde = (fm: string): string => `---\nname: x-arastirmaci\n${fm}\n---\ngövde\n`
    // alan(): tırnaklı değer, tırnaklı anahtar, iki nokta öncesi boşluk, satır sonu yorumu
    expect(alan(frontmatter(govde('memory: "user"')), 'memory')).toBe('user')
    expect(alan(frontmatter(govde("memory: 'project'")), 'memory')).toBe('project')
    expect(alan(frontmatter(govde('memory : project')), 'memory')).toBe('project')
    expect(alan(frontmatter(govde('"memory": project')), 'memory')).toBe('project')
    expect(alan(frontmatter(govde('memory: user # kullanıcı kapsamı')), 'memory')).toBe('user')
    // liste(): satır içi, köşeli parantezli ve blok biçimi
    expect(liste(frontmatter(govde('tools: Read, Grep')), 'tools')).toEqual(['Read', 'Grep'])
    expect(liste(frontmatter(govde('tools: [Read, Grep]')), 'tools')).toEqual(['Read', 'Grep'])
    expect(liste(frontmatter(govde('tools:\n  - Read\n  - Grep\nmodel: sonnet')), 'tools')).toEqual(['Read', 'Grep'])
    expect(liste(frontmatter(govde('model: sonnet')), 'tools')).toBeUndefined()
    // yazma kapısı: blok biçimi ve köşeli parantez de kapalı sayılır; eksik araç ya da yazma içeren allowlist AÇIK sayılır
    expect(yazmaKapaliMi(frontmatter(govde('disallowedTools:\n  - Edit\n  - Write\n  - NotebookEdit')))).toBe(true)
    expect(yazmaKapaliMi(frontmatter(govde('disallowedTools: [Edit, Write, NotebookEdit]')))).toBe(true)
    expect(yazmaKapaliMi(frontmatter(govde('disallowedTools: Edit, Write')))).toBe(false)
    expect(yazmaKapaliMi(frontmatter(govde('tools: Read, Grep, Glob')))).toBe(true)
    expect(yazmaKapaliMi(frontmatter(govde('tools: Read, Write')))).toBe(false)
    expect(yazmaKapaliMi(frontmatter(govde('model: sonnet')))).toBe(false)
    // BOM'lu dosya: ayrıştırıcı okur, bomluMu yakalar (kapı kırmızı verir)
    const bomlu = `${BOM}${govde('memory: user')}`
    expect(bomluMu(bomlu)).toBe(true)
    expect(alan(frontmatter(bomlu), 'memory')).toBe('user')
    expect(bomluMu(govde('memory: user'))).toBe(false)
  })
})
