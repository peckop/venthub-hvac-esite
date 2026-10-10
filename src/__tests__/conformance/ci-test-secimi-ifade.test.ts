import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-SECIM-1 (ifade, ölçüm) · ci.yml'deki seçim ve hızlı yol `if:` ifadelerinin GERÇEK doğruluk tablosu (ALT-38e) ve hızlı yolun ölçülmüş DAYANAĞI (md/txt/csv Lint, tip ve Deno girdisi değil: dosyanın sonu).
 * Metin eşitliği (ci-test-secimi.test.ts) "satır doğru yazılmış" der; bu dosya "satır doğru DAVRANIR" der:
 * ifade GitHub'ın kurallarıyla değerlendirilir (docs: expressions) ve kapı yalnız beklenen değerde kapanır. Kurallar: dizge karşılaştırması büyük/küçük harf duyarsız; türler eşleşmezse İKİSİ DE sayıya çevrilir
 * (null → 0, boş dize → 0, sayısal dize → sayı, öteki dize → NaN, true/false → 1/0; NaN hiçbir şeye eşit değil); VAR OLMAYAN bağlam özelliği (eksik/atlanan adımın çıktısı) null'dır. Bu yüzden `secilen-sayisi != '0'` eksik çıktıda
 * "atla" derdi (null ve '0' ikisi de 0): kapanma kararı tek bir `bos` çıktısına bağlandı ve koşullar yalnız TAM `'true'`/`'false'` ile karşılaştırır ('true' ve 'false' sayıya çevrilemez: NaN, eksik çıktı hiçbir zaman eşit çıkmaz).
 * Ölçüm yüzeyi: ifadeler ci.yml'den OKUNUR (sabit kopya yok; sabit varsa ci.yml'de aynen bulunması şarttır). ci.yml'i DEĞİŞTİRMEZ.
 */

const KOK = path.resolve(__dirname, '../../..')
const CI = readFileSync(path.join(KOK, '.github/workflows/ci.yml'), 'utf8').replace(/\r\n/g, '\n')

/** ci.yml'de TAM bu ifadeler bulunmalı (değişirse bilinçle burada da değişir); `eski` terk edilen biçimdir. */
const IFADE = {
  kurulum: "steps.sec.outputs.bos != 'true'",
  test: "steps.sec.outputs.bos != 'true' && steps.dagit.outputs.kos != 'false'",
  kapi: "steps.ayna.outputs.atla != 'true' && steps.hizli.outputs.belge != 'true'",
  kurulumHizli: "steps.ayna.outputs.atla != 'true' && (steps.hizli.outputs.belge != 'true' || steps.node.outputs.cache-hit != 'true')",
  hizli: "github.event_name == 'pull_request' && github.event.action != 'edited' && steps.sinif.outputs.sinif == 'belge'",
  eski: "(steps.sec.outputs.tam != 'false' || steps.sec.outputs.secilen-sayisi != '0')",
}

type Deger = string | boolean | null
type Baglam = Record<string, string>
function sayiya(d: Deger): number {
  if (d === null) return 0
  if (typeof d === 'boolean') return d ? 1 : 0
  const t = d.trim()
  if (t === '') return 0
  return /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(t) ? Number(t) : Number.NaN
}
function ifadeDegerlendir(ifade: string, baglam: Baglam): boolean {
  const belirtecler = [...ifade.matchAll(/\s*(&&|\|\||!=|==|!|\(|\)|'[^']*'|[A-Za-z_][\w.-]*)/g)].map((m) => m[1])
  if (belirtecler.join('').replace(/\s/g, '') !== ifade.replace(/\s/g, '')) throw new Error(`ifade ayrıştırılamadı: ${ifade}`)
  let i = 0
  const deger = (b: string): Deger => (b.startsWith("'") ? b.slice(1, -1) : b in baglam ? baglam[b] : null)
  const esit = (a: Deger, b: Deger): boolean => (typeof a === 'string' && typeof b === 'string' ? a.toLowerCase() === b.toLowerCase() : sayiya(a) === sayiya(b))
  const dogruMu = (v: Deger): boolean => (v === null ? false : typeof v === 'boolean' ? v : v !== '')
  function birincil(): Deger {
    const b = belirtecler[i++]
    if (b === '(') {
      const v = veya()
      i++
      return v
    }
    if (b === '!') return !dogruMu(birincil())
    return deger(b)
  }
  function esitlik(): Deger {
    let sol = birincil()
    while (belirtecler[i] === '==' || belirtecler[i] === '!=') {
      const op = belirtecler[i++]
      const e = esit(sol, birincil())
      sol = op === '==' ? e : !e
    }
    return sol
  }
  function ve(): Deger {
    let sol = esitlik()
    while (belirtecler[i] === '&&') {
      i++
      const sag = esitlik()
      sol = dogruMu(sol) ? sag : sol
    }
    return sol
  }
  function veya(): Deger {
    let sol = ve()
    while (belirtecler[i] === '||') {
      i++
      const sag = ve()
      sol = dogruMu(sol) ? sol : sag
    }
    return sol
  }
  return dogruMu(veya())
}
/** Bağlam kurar: değeri `undefined` olan anahtar HİÇ EKLENMEZ (eksik çıktı = null). */
const baglam = (kayit: Record<string, string | undefined>): Baglam => Object.fromEntries(Object.entries(kayit).filter((e): e is [string, string] => e[1] !== undefined))

describe('INV-CI-SECIM-1 (ifade) · `if:` ifadelerinin GERÇEK doğruluk tablosu', () => {
  it('kanarya: ifadeler ci.yml’de AYNEN bulunur (kopya kaymaz) ve değerlendirici bilinen sonuçları verir', () => {
    for (const [ad, ifade] of Object.entries(IFADE)) if (ad !== 'eski') expect(CI, ad).toContain(`if: ${ifade}`)
    expect(CI).not.toContain(`if: ${IFADE.eski}`)
    expect(ifadeDegerlendir("a.b == 'x'", { 'a.b': 'X' }), 'dizge karşılaştırması büyük/küçük harf duyarsız').toBe(true)
    expect(ifadeDegerlendir("a.b != '0'", {}), 'null ve 0 sayıya çevrilince eşit: `!=` yanlış').toBe(false)
    expect(ifadeDegerlendir("a.b != 'true'", {}), "null → 0, 'true' → NaN: eşit değil").toBe(true)
  })

  it('kurulum/test koşulu YALNIZ `bos` TAM `true` iken kapanır; eksik (null), boş, `false`, sayı ya da başka değerde KOŞAR', () => {
    const kosar = (bos: string | undefined): boolean => ifadeDegerlendir(IFADE.kurulum, baglam({ 'steps.sec.outputs.bos': bos }))
    for (const bos of [undefined, '', 'false', '0', '1', '2', 'evet', 'null', 'truee', 'untrue']) expect(kosar(bos), `bos=${String(bos)}`).toBe(true)
    expect(kosar('true')).toBe(false)
    expect(kosar('TRUE'), 'GitHub dizge karşılaştırması büyük/küçük harf duyarsızdır: `bos` yalnız bu adımın yazdığı küçük harf `true`dur').toBe(false)
  })

  it("ESKİ koşul biçimi (`secilen-sayisi != '0'`) çıktı EKSİKKEN `tam=false` ile kurulumu ATLATIRDI (null ve '0' ikisi de 0): `bos` bayrağına bu yüzden geçildi", () => {
    const eski = (tam?: string, sayi?: string): boolean => ifadeDegerlendir(IFADE.eski, baglam({ 'steps.sec.outputs.tam': tam, 'steps.sec.outputs.secilen-sayisi': sayi }))
    expect(eski('false', undefined), 'tam=false, secilen-sayisi EKSİK: eski koşul kapanır (kapı sessizce düşerdi)').toBe(false)
    expect(eski('false', '0')).toBe(false)
    expect(eski('false', '')).toBe(true)
    expect(eski(undefined, undefined)).toBe(true)
    expect(ifadeDegerlendir(IFADE.kurulum, {}), 'yeni biçimde aynı durum: `bos` yazılmadıysa kurulum KOŞAR').toBe(true)
  })

  it('Test koşulu boş parçada (`kos=false`) kapanır; `kos` yoksa/başka değerse ve seçim doluysa KOŞAR', () => {
    const kos = (bos: string | undefined, kosDeger: string | undefined): boolean => ifadeDegerlendir(IFADE.test, baglam({ 'steps.sec.outputs.bos': bos, 'steps.dagit.outputs.kos': kosDeger }))
    expect(kos(undefined, undefined), 'tam paket: dağıtım çıktısı henüz yok: Test KOŞAR').toBe(true)
    expect(kos('false', 'true')).toBe(true)
    for (const k of ['', 'evet', '0', 'FALSEE']) expect(kos(undefined, k), `kos=${k}: yalnız TAM \`false\` atlatır`).toBe(true)
    expect(kos(undefined, 'false'), 'parçaya test düşmedi: vitest koşmaz').toBe(false)
    expect(kos('true', undefined), 'kendiliğinden boş seçim: kurulum da yok, Test de yok').toBe(false)
    expect(kos('true', 'true'), 'boş seçimde dağıtım çıktısı ne derse desin Test kurulumsuz koşmaz').toBe(false)
  })

  it('kod kapıları hızlı yolda yalnız `belge=true` iken (ve ayna atlatmıyorken) atlanır; çıktı eksik/başka değerse KOŞAR', () => {
    const kosar = (ayna: string | undefined, belge: string | undefined): boolean => ifadeDegerlendir(IFADE.kapi, baglam({ 'steps.ayna.outputs.atla': ayna, 'steps.hizli.outputs.belge': belge }))
    for (const ayna of [undefined, '', 'false']) for (const belge of [undefined, '', 'false', 'evet', '1', 'TRUE-DEGIL']) expect(kosar(ayna, belge), `ayna=${ayna} belge=${belge}`).toBe(true)
    for (const ayna of [undefined, '', 'false']) expect(kosar(ayna, 'true'), `ayna=${ayna} belge=true`).toBe(false)
    expect(kosar('true', undefined), 'ayna atlatıyorsa belge çıktısı ne olursa olsun atlanır (eski davranış)').toBe(false)
    expect(kosar('true', 'true')).toBe(false)
  })

  it('`ci` kurulumu hızlı yolda YALNIZ pnpm önbelleği İSABET ettiyse atlanır; ıskada, çıktı yokken ya da başka değerde KOŞAR (setup-node kayıt adımı var olmayan depoyla işi kırmızı yapmasın)', () => {
    const kosar = (ayna: string | undefined, belge: string | undefined, isabet: string | undefined): boolean =>
      ifadeDegerlendir(IFADE.kurulumHizli, baglam({ 'steps.ayna.outputs.atla': ayna, 'steps.hizli.outputs.belge': belge, 'steps.node.outputs.cache-hit': isabet }))
    expect(kosar(undefined, 'true', 'true'), 'belge + önbellek isabeti: kurulum atlanır (kazanç)').toBe(false)
    for (const isabet of [undefined, '', 'false', '0', 'evet']) expect(kosar(undefined, 'true', isabet), `belge + isabet=${String(isabet)}: kurulum KOŞAR`).toBe(true)
    for (const belge of [undefined, '', 'false', 'evet']) for (const isabet of [undefined, 'true', 'false']) expect(kosar(undefined, belge, isabet), `belge=${String(belge)} isabet=${String(isabet)}`).toBe(true)
    expect(kosar('true', 'true', 'false'), 'ayna atlatıyorsa (edited) kurulum atlanır: eski davranış').toBe(false)
    expect(kosar('true', undefined, undefined)).toBe(false)
  })

  it('hızlı yol adımı yalnız shard olayında (`edited` hariç pull_request) ve `belge` sınıfında açılır; push, elle koşum, edited ve başka sınıf açmaz', () => {
    const a = (olay: string, eylem: string, sinif: string | undefined): boolean => ifadeDegerlendir(IFADE.hizli, baglam({ 'github.event_name': olay, 'github.event.action': eylem, 'steps.sinif.outputs.sinif': sinif }))
    for (const eylem of ['opened', 'synchronize', 'reopened']) expect(a('pull_request', eylem, 'belge'), eylem).toBe(true)
    expect(a('pull_request', 'edited', 'belge'), 'edited koşusunda ci içindeki Test kurulum ister').toBe(false)
    expect(a('push', '', 'belge')).toBe(false)
    expect(a('workflow_dispatch', '', 'belge')).toBe(false)
    for (const sinif of ['tam', 'betik', 'edge', 'karma', '', undefined]) expect(a('pull_request', 'opened', sinif), String(sinif)).toBe(false)
  })
})

// ── ÖLÇÜM: hızlı yolun DAYANAĞI ───────────────────────────────────────────────────────────────────────────────────────────────────
// "md/txt/csv farkı Lint, tip ve Deno sonucunu değiştiremez" iddiası elle değil ÖLÇÜMLE durur: yapılandırmalar bu uzantıları okumaz. Biri değişirse (ör. lint'e markdown, tsc'ye .md) bu test KIRMIZI olur ve hızlı yol gözden geçirilir.
describe('INV-CI-SECIM-1 (ölçüm) · md/txt/csv uzantıları Lint, tip denetimi ve Deno kapılarının girdisi DEĞİL', () => {
  const oku = (y: string): string => readFileSync(path.join(KOK, y), 'utf8').replace(/\r\n/g, '\n')
  const betikler = (JSON.parse(oku('package.json')) as { scripts: Record<string, string> }).scripts

  it('tsc: tsconfig `include` yalnız .ts/.tsx desenleri; `tsc --noEmit` süzgeçsiz kök (dosya/proje süzgeci yok)', () => {
    const include = (JSON.parse(oku('tsconfig.json')) as { include: string[] }).include
    expect(include.filter((g) => !/\.(?:ts|tsx)$/.test(g))).toEqual([])
    expect(betikler['type-check']).toMatch(/\btsc --noEmit$/)
  })

  it('eslint: `eslint .` (süzgeçsiz kök, --ext yok); yapılandırma dosya sistemini ve docs/ yolunu okumaz, `files` desenleri md/txt/csv içermez', () => {
    expect(betikler.lint).toMatch(/\beslint \.$/)
    const cfg = oku('eslint.config.cjs')
    expect(cfg).not.toMatch(/readFileSync|readdirSync|docs\//)
    expect((cfg.match(/files:\s*\[[^\]]*\]/g) ?? []).join(' ')).not.toMatch(/\.(?:md|txt|csv)\b/)
  })

  it('deno check: yalnız supabase/functions/*/index.ts (docs ya da metin dosyası içe aktarmaz: kaynakta `docs/` ya da .md/.txt/.csv içe aktarma yok)', () => {
    expect(CI).toContain('run: deno check --node-modules-dir=none supabase/functions/*/index.ts')
    const kaynak = execFileSync('git', ['ls-files', 'supabase/functions'], { cwd: KOK, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
      .split('\n')
      .filter((d) => /\.(?:ts|tsx|js|mjs)$/.test(d) && !/__tests__|\.test\./.test(d)) // testler vitest'tedir (seçici kapsar), deno check onları denetlemez
    expect(kaynak.length).toBeGreaterThan(20)
    // yalnız İÇE AKTARMA (statik `from` ve dinamik `import()`) tip denetimine girer; yorumdaki `docs/` anması ya da çalışma anında dosya okuma deno check'in girdisi değildir
    for (const d of kaynak) expect(oku(d), d).not.toMatch(/\bfrom\s+['"][^'"]*(?:\.(?:md|txt|csv)|\/docs\/)[^'"]*['"]|\bimport\s*\(\s*['"][^'"]*(?:\.(?:md|txt|csv)|\/docs\/)/)
  })
})
