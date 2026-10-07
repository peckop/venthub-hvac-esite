import { readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-SINIF-1 / INV-CI-SINIF-2 · değişiklik sınıfı iki iş akışına DOĞRU bağlı ve "siteye dokunmayan" tanımı ÖLÇÜLMÜŞ (ALT-38c).
 *
 * NİÇİN VAR: PR'ın değişen dosyaları yalnız dar sınıflardaysa (belge, edge, betik, karma; mantık: scripts/ci/degisiklik-sinifi.cjs) `ci` işinin
 * `Build` adımı ve `admin-smoke` işinin ağır adımları ATLANIR. Atlanan adım kırmızı olamaz: yanlış atlama "kod değişti, kapı görmedi" demektir.
 * Bu dosya iki şeyi korur:
 *   SINIF-1 · BAĞLANTI: koşul yalnız DARALTMA yönünde (dar küme literal ve sınıflayıcıyla birebir; `tam`, boş ve bilinmeyen değer hiçbir şeyi atlatmaz),
 *     Test ve öteki kapılar HİÇBİR sınıfta atlanmaz (kapsam kaybı sıfır), `admin-smoke` iş düzeyinde `if`/`needs` taşımaz (atlanan iş zorunlu kontrolde
 *     YEŞİL sayılır; adım düzeyi bu deliği kapatır), iki iş akışındaki sınıf adımı BİREBİR aynıdır ve tabandan çıkarılan kopyayı koşar.
 *   SINIF-2 · TANIM: "siteye dokunmayan" tanımı elle listeye değil ÖLÇÜME dayanır: `next build` girdisi (src/ ve kök ayar dosyaları) src/ ve public/
 *     DIŞINA bir dosya aktarırsa ya da dosya sisteminden okursa, hedef sınıflayıcıda `tam` olmak zorundadır; package.json'ın CI hattında çağırdığı her
 *     betik `tam`dır; atlanabilen işlerin çağırdığı her betik `tam`dır. Yeni bir bağımlılık eklenirse bu dosya KIRMIZI olur ve listeye bilinçle eklenir.
 *
 * Ölçüm yüzeyi: `node:fs` + satır taraması (YAML ayrıştırıcı yok; girinti sabit: iş 2, iş anahtarı 4, adım 6, adım anahtarı 8). Ayrıştırılamayan yapı
 * KIRMIZIDIR (boş sonuç "uyumlu" sayılmaz). İş akışlarını DEĞİŞTİRMEZ.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const yukle = (yol: string): string => readFileSync(path.join(KOK, yol), 'utf8').replace(/\r\n/g, '\n')

interface Siniflayici {
  DAR_SINIFLAR: Record<string, readonly string[]>
  siniflandir: (dosyalar: unknown) => { sinif: string; siniflar: string[]; neden: string[] }
}
const S = require_(path.join(KOK, 'scripts/ci/degisiklik-sinifi.cjs')) as Siniflayici
const sinifi = (yol: string): string => S.siniflandir([yol]).sinif

/** Dar sınıf kümesi sınıflayıcıdan TÜRER: yeni bir dar sınıf eklenirse iş akışları ona bağlanmadan bu test kırmızı olur. */
const DAR = [...Object.keys(S.DAR_SINIFLAR), 'karma'].sort()
const DAR_LITERAL = '["belge","edge","betik","karma"]'
const KOSUL_E2E = `if: \${{ !contains(fromJSON('${DAR_LITERAL}'), steps.sinif.outputs.sinif) }}`
const PR_KOSULU = "if: github.event_name == 'pull_request'"
const SINIF_ADI = "Değişiklik sınıfı (siteye dokunmayan PR'da Build atlanır)"
const CI_SINIF_OKUYAN = ['Next.js derleme önbelleği', 'Build (blocking)']
const E2E_HEP_KOSAN = ['Merge-ref çözümle (yalnız elle tetiklemede)', 'Checkout', SINIF_ADI]
const E2E_YUKLEME_ADIMI = 'Upload Playwright report on failure'

// ── AYRIŞTIRICI ──────────────────────────────────────────────────────────────────────────────────────────────────

interface Adim {
  ad: string
  /** Adımın ham satırları (yorum ve boş satır dahil). */
  satirlar: string[]
  /** Adımın DOĞRUDAN anahtarları (girinti 8) ve değerleri. */
  anahtarlar: Array<{ anahtar: string; deger: string }>
  /** `with:` altındaki girdiler (girinti 10). */
  girdiler: Map<string, string>
  /** `run: |` gövdesi (girinti 10 atılmış); yoksa null. */
  govde: string | null
}

const yorumsuz = (satirlar: string[]): string[] => satirlar.filter((s) => !/^\s*#/.test(s))

function isSatirlari(metin: string, isId: string): string[] {
  const satirlar = metin.split('\n')
  const jobs = satirlar.findIndex((s) => s === 'jobs:')
  if (jobs < 0) return []
  const bas = satirlar.findIndex((s, i) => i > jobs && s === `  ${isId}:`)
  if (bas < 0) return []
  let bit = satirlar.length
  for (let i = bas + 1; i < satirlar.length; i++) {
    if (/^ {2}[A-Za-z0-9_-]+:\s*$/.test(satirlar[i])) {
      bit = i
      break
    }
  }
  return satirlar.slice(bas + 1, bit)
}

function adimlariAyir(isSat: string[]): Adim[] {
  const stepsIdx = isSat.findIndex((s) => s === '    steps:')
  if (stepsIdx < 0) return []
  const adimlar: Adim[] = []
  for (const s of isSat.slice(stepsIdx + 1)) {
    const m = /^ {6}- name: ?(.*)$/.exec(s)
    if (m) {
      adimlar.push({ ad: m[1].trim(), satirlar: [s], anahtarlar: [], girdiler: new Map(), govde: null })
      continue
    }
    if (adimlar.length) adimlar[adimlar.length - 1].satirlar.push(s)
  }
  for (const a of adimlar) {
    const sat = yorumsuz(a.satirlar)
    for (let i = 0; i < sat.length; i++) {
      const k = /^ {8}([A-Za-z0-9_-]+):\s?(.*)$/.exec(sat[i])
      if (!k) continue
      a.anahtarlar.push({ anahtar: k[1], deger: k[2].trim() })
      if (k[1] === 'with') {
        for (let j = i + 1; j < sat.length && /^ {10}\S/.test(sat[j]); j++) {
          const g = /^ {10}([A-Za-z0-9_-]+):\s?(.*)$/.exec(sat[j])
          if (g) a.girdiler.set(g[1], g[2].trim())
        }
      }
      if (k[1] === 'run' && /^\|[-+]?$/.test(k[2].trim())) {
        const govde: string[] = []
        for (let j = i + 1; j < sat.length && (sat[j].trim() === '' || /^ {10}/.test(sat[j])); j++) govde.push(sat[j].slice(10))
        a.govde = govde.join('\n').replace(/\n+$/, '')
      }
    }
  }
  return adimlar
}

const ifler = (a: Adim): string[] => a.anahtarlar.filter((k) => k.anahtar === 'if').map((k) => `if: ${k.deger}`)
const adimlar = (metin: string, isId: string): Adim[] => adimlariAyir(isSatirlari(metin, isId))
/** Çıktıdaki `fromJSON('[...]')` literallerinin dizileri (yorumsuz satırlardan). */
function darKumeler(metin: string): string[][] {
  const bulunan: string[][] = []
  for (const s of yorumsuz(metin.split('\n'))) {
    for (const m of s.matchAll(/fromJSON\('(\[[^']*\])'\)/g)) bulunan.push((JSON.parse(m[1]) as string[]).slice().sort())
  }
  return bulunan
}

// ── SINIF-1 DENETİMİ ─────────────────────────────────────────────────────────────────────────────────────────────

function ciDenetle(ci: string): string[] {
  const ihlal: string[] = []
  const ad = adimlar(ci, 'ci')
  if (ad.length === 0) return ['ci.yml `jobs.ci.steps` ayrıştırılamadı: hiçbir adım denetlenmedi']
  const sinif = ad.filter((a) => a.ad === SINIF_ADI)
  if (sinif.length !== 1) ihlal.push(`ci.yml: "${SINIF_ADI}" adımı TAM BİR tane olmalı (bulunan ${sinif.length})`)
  for (const a of ad) {
    const okur = yorumsuz(a.satirlar).some((s) => /steps\.sinif\./.test(s))
    if (okur && !CI_SINIF_OKUYAN.includes(a.ad)) {
      ihlal.push(`ci.yml: adım "${a.ad}" sınıf çıktısını okuyor: YALNIZ Build ve Next.js önbelleği dar sınıfta atlanabilir (Test ve öteki kapılar HİÇBİR sınıfta atlanmaz: kapsam kaybı sıfır)`)
    }
  }
  for (const ad2 of CI_SINIF_OKUYAN) {
    const a = ad.find((x) => x.ad === ad2)
    if (!a || !yorumsuz(a.satirlar).some((s) => /steps\.sinif\.outputs\.sinif/.test(s))) ihlal.push(`ci.yml: "${ad2}" sınıf çıktısını OKUMUYOR: dar sınıfta atlanmaz (kazanç sıfır)`)
  }
  const kumeler = darKumeler(ci)
  if (kumeler.length === 0) ihlal.push('ci.yml: dar sınıf kümesi (fromJSON literal) bulunamadı')
  for (const k of kumeler) if (JSON.stringify(k) !== JSON.stringify(DAR)) ihlal.push(`ci.yml: dar sınıf kümesi sınıflayıcıyla AYNI değil: bulunan ${JSON.stringify(k)}, beklenen ${JSON.stringify(DAR)}`)
  return ihlal
}

function e2eDenetle(e2e: string, ci: string): string[] {
  const ihlal: string[] = []
  const is = isSatirlari(e2e, 'admin-smoke')
  if (is.length === 0) return ['e2e-smoke.yml: `admin-smoke` işi yok: zorunlu kontrol adı değişti ya da dosya ayrıştırılamadı']
  const stepsIdx = is.findIndex((s) => s === '    steps:')
  for (const s of yorumsuz(is.slice(0, stepsIdx))) {
    const k = /^ {4}(if|needs|continue-on-error|strategy):/.exec(s)
    if (k) ihlal.push(`e2e-smoke.yml: \`admin-smoke\` işi iş düzeyinde \`${k[1]}\` taşıyor: atlanan/bekleyen iş zorunlu kontrolde YEŞİL sayılabilir (adım düzeyi kullanılır)`)
  }
  const ad = adimlariAyir(is)
  const sinifIdx = ad.findIndex((a) => a.ad === SINIF_ADI)
  if (ad.filter((a) => a.ad === SINIF_ADI).length !== 1) return [...ihlal, `e2e-smoke.yml: "${SINIF_ADI}" adımı TAM BİR tane olmalı`]
  const sinif = ad[sinifIdx]
  const checkout = ad.find((a) => a.ad === 'Checkout')
  if (!checkout) ihlal.push('e2e-smoke.yml: Checkout adımı yok')
  else if (checkout.girdiler.get('fetch-depth') !== '2') ihlal.push(`e2e-smoke.yml: Checkout \`fetch-depth: 2\` değil (bulunan ${checkout.girdiler.get('fetch-depth') ?? 'yok'}): \`HEAD^1\` gelmez, sınıf hiçbir koşuda dar çıkmaz`)
  if (!checkout?.girdiler.has('ref')) ihlal.push('e2e-smoke.yml: Checkout `ref` girdisi yok: merge-ref testi bozulur (T066-VH)')
  const siniflar = sinif.anahtarlar
  if (siniflar.find((k) => k.anahtar === 'id')?.deger !== 'sinif') ihlal.push('e2e-smoke.yml: sınıf adımı `id: sinif` değil: sonraki adımlar çıktıyı okuyamaz')
  if (JSON.stringify(ifler(sinif)) !== JSON.stringify([PR_KOSULU])) ihlal.push(`e2e-smoke.yml: sınıf adımı \`${PR_KOSULU}\` koşulunu taşımıyor (bulunan ${JSON.stringify(ifler(sinif))})`)
  const ciSinif = adimlar(ci, 'ci').find((a) => a.ad === SINIF_ADI)
  if (!ciSinif || sinif.govde === null || ciSinif.govde !== sinif.govde) ihlal.push('e2e-smoke.yml: sınıf adımının gövdesi ci.yml\'dekiyle BİREBİR aynı değil (iki yerde farklı karar)')
  if (sinif.govde !== null && !/git show HEAD\^1:scripts\/ci\/degisiklik-sinifi\.cjs/.test(sinif.govde)) ihlal.push('e2e-smoke.yml: sınıf adımı sınıflayıcıyı TABANDAN (git show HEAD^1:) çıkarmıyor')
  const sonraki = ad.slice(sinifIdx + 1)
  if (sonraki.length === 0) ihlal.push('e2e-smoke.yml: sınıf adımından sonra adım yok')
  for (const a of sonraki) {
    if (a.ad === E2E_YUKLEME_ADIMI) {
      if (JSON.stringify(ifler(a)) !== JSON.stringify(['if: failure()'])) ihlal.push(`e2e-smoke.yml: "${a.ad}" \`if: failure()\` olmalı (bulunan ${JSON.stringify(ifler(a))})`)
      continue
    }
    if (JSON.stringify(ifler(a)) !== JSON.stringify([KOSUL_E2E])) ihlal.push(`e2e-smoke.yml: ağır adım "${a.ad}" daraltma koşulunu TAM taşımıyor (bulunan ${JSON.stringify(ifler(a))}, beklenen ["${KOSUL_E2E}"])`)
  }
  for (const a of ad.slice(0, sinifIdx)) {
    if (!E2E_HEP_KOSAN.includes(a.ad)) ihlal.push(`e2e-smoke.yml: sınıf adımından ÖNCE beklenmeyen adım "${a.ad}"`)
  }
  const kumeler = darKumeler(e2e)
  if (kumeler.length === 0) ihlal.push('e2e-smoke.yml: dar sınıf kümesi (fromJSON literal) bulunamadı')
  for (const k of kumeler) if (JSON.stringify(k) !== JSON.stringify(DAR)) ihlal.push(`e2e-smoke.yml: dar sınıf kümesi sınıflayıcıyla AYNI değil: bulunan ${JSON.stringify(k)}, beklenen ${JSON.stringify(DAR)}`)
  return ihlal
}

// ── SINIF-2 ÖLÇÜMÜ: derleme girdisinin import/okuma kenarları ─────────────────────────────────────────────────────

const KOD_UZANTISI = /\.(ts|tsx|js|jsx|mjs|cjs)$/
const testMi = (rel: string): boolean => /(^|\/)__tests__\//.test(rel) || /\.(test|spec)\.[a-z]+$/.test(rel) || /(^|\/)(e2e|tests)\//.test(rel)

function kodDosyalari(dizin: string, cikti: string[] = []): string[] {
  for (const ent of readdirSync(path.join(KOK, dizin), { withFileTypes: true })) {
    const rel = `${dizin}/${ent.name}`
    if (ent.isDirectory()) {
      if (ent.name !== 'node_modules' && ent.name !== '.next') kodDosyalari(rel, cikti)
    } else if (KOD_UZANTISI.test(ent.name) && !testMi(rel)) {
      cikti.push(rel)
    }
  }
  return cikti
}

/** Derleme girdisi: src/ altındaki test OLMAYAN kod + derlemeyi/ayarı yapan kök dosyalar. */
function derlemeGirdisi(): string[] {
  const kok = readdirSync(KOK).filter((a) => /^(next\.config|sentry\..*\.config|tailwind\.config|postcss\.config)\./.test(a) && KOD_UZANTISI.test(a))
  return [...kodDosyalari('src'), ...kok]
}

interface Kenar {
  kaynak: string
  hedef: string
}
/** Göreli içe aktarma/`require`/dinamik `import()`/`new URL(..., import.meta.url)` hedefleri (depo köküne göreli, normalleşmiş). */
function kenarlariBul(rel: string, metin: string): Kenar[] {
  const kenarlar: Kenar[] = []
  const coz = (spec: string) => path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec))
  for (const m of metin.matchAll(/(?:from|import|require)\s*\(?\s*['"](\.{1,2}\/[^'"]*)['"]/g)) kenarlar.push({ kaynak: rel, hedef: coz(m[1]) })
  for (const m of metin.matchAll(/new URL\(\s*['"](\.{1,2}\/[^'"]*)['"]\s*,\s*import\.meta\.url/g)) kenarlar.push({ kaynak: rel, hedef: coz(m[1]) })
  return kenarlar
}

/** `fs` okuyabilen derleme girdisi dosyaları (elle ölçüldü, 2026-10-07: ikisi de YALNIZ src/ içindeki dosyaları `new URL(..., import.meta.url)` ile okur). */
const FS_KULLANAN_BILINEN = ['next.config.mjs', 'src/config/rotaDili.mjs']
const FS_TOKEN = /\b(readFileSync|readdirSync|process\.cwd)\b/

describe('INV-CI-SINIF-1 · sınıf kararı iki iş akışında AYNI ve güvenli yönde bağlı', () => {
  const ci = yukle('.github/workflows/ci.yml')
  const e2e = yukle('.github/workflows/e2e-smoke.yml')

  it('gerçek ci.yml ve e2e-smoke.yml uyumlu', () => {
    expect(ciDenetle(ci)).toEqual([])
    expect(e2eDenetle(e2e, ci)).toEqual([])
  })

  it('dar küme sınıflayıcıdan türer (belge, betik, edge, karma): `tam` içermez', () => {
    expect(DAR).toEqual(['belge', 'betik', 'edge', 'karma'])
    expect(DAR).not.toContain('tam')
  })

  const CI_BOZ: Array<{ ad: string; boz: (c: string) => string; beklenen: string }> = [
    { ad: 'Test adımı sınıf çıktısını okur (kapsam kaybı)', boz: (c) => c.replace("- name: Test\n        if: steps.ayna.outputs.atla != 'true'", "- name: Test\n        if: steps.ayna.outputs.atla != 'true' && steps.sinif.outputs.sinif != 'belge'"), beklenen: 'adım "Test" sınıf çıktısını okuyor' },
    { ad: 'Lint adımı sınıf çıktısını okur', boz: (c) => c.replace("- name: Lint (blocking)\n        if: steps.ayna.outputs.atla != 'true'", "- name: Lint (blocking)\n        if: steps.ayna.outputs.atla != 'true' && steps.sinif.outputs.sinif != 'belge'"), beklenen: 'adım "Lint (blocking)" sınıf çıktısını okuyor' },
    { ad: 'Build sınıf çıktısını OKUMAZ (dar sınıfta da koşar)', boz: (c) => c.replace(/(- name: Build \(blocking\)\n\s+if: [^\n]*)/, "- name: Build (blocking)\n        if: steps.ayna.outputs.atla != 'true'"), beklenen: '"Build (blocking)" sınıf çıktısını OKUMUYOR' },
    { ad: 'dar kümeden `karma` düşer', boz: (c) => c.split(DAR_LITERAL).join('["belge","edge","betik"]'), beklenen: 'dar sınıf kümesi sınıflayıcıyla AYNI değil' },
    { ad: 'dar kümeye `tam` girer', boz: (c) => c.split(DAR_LITERAL).join('["belge","edge","betik","karma","tam"]'), beklenen: 'dar sınıf kümesi sınıflayıcıyla AYNI değil' },
    { ad: 'sınıf adımı silinir', boz: (c) => c.replace(`- name: ${SINIF_ADI}`, '- name: Başka ad'), beklenen: `"${SINIF_ADI}" adımı TAM BİR tane olmalı` },
  ]
  it.each(CI_BOZ)('sabotaj ci.yml: $ad', ({ boz, beklenen }) => {
    const bozuk = boz(ci)
    expect(bozuk, 'bozucu hiçbir şeyi değiştirmedi (çapa kayıp)').not.toBe(ci)
    expect(ciDenetle(bozuk).join('|')).toContain(beklenen)
  })

  const E2E_BOZ: Array<{ ad: string; boz: (c: string) => string; beklenen: string }> = [
    { ad: 'Build adımından daraltma koşulu silinir (dar sınıfta da derler)', boz: (c) => c.replace(`- name: Build (real Supabase env)\n        ${KOSUL_E2E}\n`, '- name: Build (real Supabase env)\n'), beklenen: 'ağır adım "Build (real Supabase env)" daraltma koşulunu TAM taşımıyor' },
    { ad: 'smoke adımı POZİTİF mantığa çevrilir (çıktı boşken atlanır)', boz: (c) => c.replace(KOSUL_E2E, "if: steps.sinif.outputs.sinif == 'tam'"), beklenen: 'daraltma koşulunu TAM taşımıyor' },
    { ad: 'Checkout derinliği düşer (HEAD^1 gelmez: sınıf hiç dar çıkmaz, kazanç sıfır)', boz: (c) => c.replace('          fetch-depth: 2\n', ''), beklenen: 'Checkout `fetch-depth: 2` değil' },
    { ad: 'iş düzeyinde `if` (atlanan iş yeşil sayılır)', boz: (c) => c.replace('  admin-smoke:\n    runs-on: ubuntu-latest\n', "  admin-smoke:\n    if: github.event.action != 'edited'\n    runs-on: ubuntu-latest\n"), beklenen: 'iş düzeyinde `if` taşıyor' },
    { ad: 'iş düzeyinde `needs` (sınıf işi çökerse iş atlanır = yeşil)', boz: (c) => c.replace('  admin-smoke:\n    runs-on: ubuntu-latest\n', '  admin-smoke:\n    needs: [baska]\n    runs-on: ubuntu-latest\n'), beklenen: 'iş düzeyinde `needs` taşıyor' },
    { ad: 'dar kümeye `tam` girer', boz: (c) => c.split(DAR_LITERAL).join('["belge","edge","betik","karma","tam"]'), beklenen: 'dar sınıf kümesi sınıflayıcıyla AYNI değil' },
    { ad: 'sınıf adımı PR koşulunu kaybeder', boz: (c) => c.replace("        if: github.event_name == 'pull_request'\n        run: |\n          if ! git show", '        run: |\n          if ! git show'), beklenen: 'sınıf adımı `if: github.event_name' },
    { ad: 'sınıf adımı PR kopyasını koşar (tabandan çıkarılmaz)', boz: (c) => c.replace('git show HEAD^1:scripts/ci/degisiklik-sinifi.cjs', 'cat scripts/ci/degisiklik-sinifi.cjs'), beklenen: 'sınıf adımının gövdesi ci.yml\'dekiyle BİREBİR aynı değil' },
    { ad: 'yükleme adımı koşulunu kaybeder', boz: (c) => c.replace(`- name: ${E2E_YUKLEME_ADIMI}\n        if: failure()\n`, `- name: ${E2E_YUKLEME_ADIMI}\n`), beklenen: `"${E2E_YUKLEME_ADIMI}" \`if: failure()\` olmalı` },
  ]
  it.each(E2E_BOZ)('sabotaj e2e-smoke.yml: $ad', ({ boz, beklenen }) => {
    const bozuk = boz(e2e)
    expect(bozuk, 'bozucu hiçbir şeyi değiştirmedi (çapa kayıp)').not.toBe(e2e)
    expect(e2eDenetle(bozuk, ci).join('|')).toContain(beklenen)
  })
})

describe('INV-CI-SINIF-2 · "siteye dokunmayan" tanımı ölçülür: derleme girdisi dar sınıflara taşmaz', () => {
  const girdi = derlemeGirdisi()
  const kenarlar = girdi.flatMap((rel) => kenarlariBul(rel, yukle(rel)))

  it('ölçüm BOŞ değil (src/ ve kök ayar dosyaları gerçekten taranıyor)', () => {
    expect(girdi.length).toBeGreaterThan(500)
    expect(kenarlar.length).toBeGreaterThan(1000)
    const nextKenarlari = kenarlar.filter((k) => k.kaynak === 'next.config.mjs').map((k) => k.hedef)
    expect(nextKenarlari).toEqual(expect.arrayContaining(['src/config/rotaDili.mjs', 'src/config/features.ts']))
  })

  it('src/ ve public/ DIŞINA çözülen her içe aktarma hedefi sınıflayıcıda `tam` (siteye dokunmuş sayılır)', () => {
    const taşan = kenarlar.filter((k) => !k.hedef.startsWith('src/') && !k.hedef.startsWith('public/'))
    const ihlal = taşan.filter((k) => sinifi(k.hedef) !== 'tam').map((k) => `${k.kaynak} → ${k.hedef}: derleme girdisi dar sınıfta (${sinifi(k.hedef)}); scripts/ci/degisiklik-sinifi.cjs HER_ZAMAN_TAM'a ekle`)
    expect(ihlal).toEqual([])
  })

  it('dosya sistemi okuyan derleme girdisi YALNIZ bilinen iki dosyadır (yenisi önce ölçülür, sonra listeye eklenir)', () => {
    const okuyanlar = girdi.filter((rel) => FS_TOKEN.test(yukle(rel))).sort()
    expect(okuyanlar).toEqual([...FS_KULLANAN_BILINEN].sort())
    // bilinen ikisi de YALNIZ src/ içindeki dosyaları `new URL('./..', import.meta.url)` ile okur: okunan hedefler src/ altında
    for (const rel of FS_KULLANAN_BILINEN) {
      const hedefler = kenarlariBul(rel, yukle(rel)).map((k) => k.hedef)
      for (const h of hedefler) expect(h.startsWith('src/') || sinifi(h) === 'tam', `${rel} → ${h}`).toBe(true)
    }
  })

  it("package.json'ın CI hattında çağırdığı her betik `tam`dır (build, lint, test, type-check, prepare ...)", () => {
    const betikler = (JSON.parse(yukle('package.json')) as { scripts: Record<string, string> }).scripts
    const anahtarlar = ['build', 'build:ci', 'prebuild', 'postbuild', 'postinstall', 'prepare', 'lint', 'lint:ci', 'test', 'type-check']
    const bulunan = new Set<string>()
    for (const k of anahtarlar) for (const m of (betikler[k] ?? '').matchAll(/scripts\/[A-Za-z0-9_./-]+/g)) bulunan.add(m[0])
    expect([...bulunan]).toEqual(expect.arrayContaining(['scripts/assert-node-major.mjs', 'scripts/setup-hooks.mjs']))
    const ihlal = [...bulunan].filter((b) => sinifi(b) !== 'tam').map((b) => `${b}: package.json CI hattı betiği dar sınıfta (${sinifi(b)})`)
    expect(ihlal).toEqual([])
  })

  it('atlanabilen işlerin (e2e-smoke) çağırdığı her betik `tam`dır: değişirse iş ATLANMAZ', () => {
    const e2e = yukle('.github/workflows/e2e-smoke.yml')
    const bulunan = new Set<string>()
    for (const s of yorumsuz(e2e.split('\n'))) for (const m of s.matchAll(/scripts\/[A-Za-z0-9_./-]+/g)) bulunan.add(m[0].replace(/[.]+$/, ''))
    expect([...bulunan]).toEqual(expect.arrayContaining(['scripts/ci/apt-hardening.sh', 'scripts/ci/retry-bounded.sh', 'scripts/ci/font-preload-olc.cjs']))
    const ihlal = [...bulunan].filter((b) => sinifi(b) !== 'tam').map((b) => `${b}: e2e-smoke.yml betiği dar sınıfta (${sinifi(b)})`)
    expect(ihlal).toEqual([])
  })

  it('OPS tanımının literal listesi: build girdisi, mekanizma ve test/e2e ayar dosyaları HEP tam', () => {
    for (const yol of [
      'src/app/page.tsx',
      'public/robots.txt',
      'next.config.mjs',
      'package.json',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'vitest.config.ts',
      'playwright.config.ts',
      'e2e/axe-anasayfa.e2e.ts',
      '.github/workflows/ci.yml',
      '.github/workflows/e2e-smoke.yml',
      'scripts/ci/degisiklik-sinifi.cjs',
      'scripts/assert-node-major.mjs',
      'supabase/migrations/20260101000000_x.sql',
      'vercel.json',
      'bilinmeyen-kok-dosya.xyz',
    ]) {
      expect(sinifi(yol), yol).toBe('tam')
    }
    for (const yol of ['docs/standards/x.md', 'README.md', '.claude/hooks/x.cjs', 'scripts/board/x.cjs', 'tools/x.sh', 'supabase/functions/f/index.ts']) {
      expect(['belge', 'betik', 'edge'], yol).toContain(sinifi(yol))
    }
  })
})
