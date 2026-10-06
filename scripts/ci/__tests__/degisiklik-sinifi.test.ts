// @vitest-environment node
//
// Saf Node testi: DOM ortamı yalnız maliyet. Ağ ve gerçek ev dizini YOK. Komut satırı mantığı SAHTE git ile (enjeksiyon) sınanır; `git`in kendisi
// yalnız geçici depolarda ve boş bir ev dizini ile ölçülür (yeniden adlandırma, Türkçe yol ve birleştirme commit'i sahte git'le ölçülemez).
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-CI-SINIF-1 (öneri adı; standarda henüz yazılmadı) · DEĞİŞİKLİK SINIFLAYICI (scripts/ci/degisiklik-sinifi.cjs, ALT-38c, karar 296).
 *
 * Tek değişmez: sınıflayıcının yanlış yönü HEP `tam`dır. Bir PR'ın değişen dosyaları "dar" sınıflara (belge, edge, betik) ancak AÇIKÇA girerse
 * dar sayılır; aksi her durumda tam koşu yapılır. Bozulan her halka, kaynak koda dokunan bir PR'ın testlerinin SESSİZCE atlanması demektir ve
 * HİÇBİR KIRMIZI GÖRÜNMEZ. Bu dosya halkaları TEK TEK ölçer:
 *   1. SÖZLEŞME: dışa açılan adlar, DAR_SINIFLAR ve HER_ZAMAN_TAM LİTERAL (modülden türetilmez: türetilen beklenti listeden silinen girdiyi göremezdi),
 *   2. DAR SINIFLAR ve SINIR KOMŞULARI (`/` sınırı, büyük/küçük harf, kök .md ↔ kök .json),
 *   3. HER ZAMAN TAM ve ÖNEK ÇAKIŞMA DENETİMİ (tek istisna scripts/ ↔ scripts/ci/, adıyla),
 *   4. KARMA: birleşimler, sıra ve tekrar bağımsızlığı, TEK `tam` yolun her şeyi `tam` yapması,
 *   5. HATALI GİRDİ (fırlatmaz), YOL NORMALLEŞTİRME tablosu, SINIRLAR (1024 karakter, 2000 dosya),
 *   6. DEĞİŞMEZLER: üretilmiş külliyat + bağımsız hakem (tohumlu rastgele yollar),
 *   7. KOMUT SATIRI sahte git ile (argümanlar, biçim, enjeksiyon, her hata `tam`),
 *   8. KOMUT SATIRI GERÇEK süreç ve GERÇEK git (birleştirme commit'li depoda uçtan uca; `-z` ve `--no-renames`ın gerçekten ne kazandırdığı).
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const BETIK = path.join(KOK, 'scripts/ci/degisiklik-sinifi.cjs')

type Sinif = 'tam' | 'belge' | 'edge' | 'betik' | 'karma'
interface Sonuc {
  sinif: Sinif
  siniflar: string[]
  neden: string[]
}
type Ortam = Record<string, string | undefined>
type CiktiYaz = (yol: string | null, metin: string) => void
interface CalistirSecenek {
  gitCalistir?: (args: string[]) => unknown
  ciktiYaz?: CiktiYaz
  ortam?: Ortam | null
}
interface Modul {
  DAR_SINIFLAR: Readonly<Record<string, readonly string[]>>
  DOSYA_SINIRI: number
  EN_UZUN_YOL: number
  HER_ZAMAN_TAM: readonly string[]
  NEDEN_AZAMI: number
  calistir: (secenek?: CalistirSecenek | null) => Sonuc
  kokDeseniEslesirMi: (desen: string, ad: string) => boolean
  main: (calistirFn?: () => unknown) => void
  satirTemizle: (metin: string) => string
  siniflandir: (dosyalar: unknown) => Sonuc
  yoluNormallestir: (ham: unknown) => { yol?: string; sebep?: string }
}
const M = require_(BETIK) as Modul

/** Her türden değeri fırlatır (Error olmayanlar dahil): üretim kodunun `catch (e)` sınırı Error varsaymamalı. */
const firlat = (deger: unknown): never => {
  throw deger
}
const sinifi = (yol: unknown): Sinif => M.siniflandir([yol]).sinif
const s = (...dosyalar: unknown[]): Sonuc => M.siniflandir(dosyalar)
/** Beklenen TAM sonucu: `siniflar` BOŞ (kısmen dar iddia yok) ve tek bir neden cümlesi. */
const TAM_SEKLI = { sinif: 'tam', siniflar: [], neden: [expect.any(String)] }

// ── LİTERAL beklentiler (SPEC'ten elle yazıldı; modülden TÜRETİLMEZ) ────────────────────────────────────────────────────────────────────────
const DAR_BEKLENEN = {
  belge: ['docs/', '.claude/', '.agent/'],
  edge: ['supabase/functions/'],
  betik: ['scripts/', 'tools/'],
}
const HER_ZAMAN_TAM_BEKLENEN = [
  '.github/',
  'scripts/ci/',
  '.githooks/',
  'src/',
  'public/',
  'supabase/migrations/',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig*.json',
  'vitest.config.*',
  'next.config.*',
  'eslint.config.*',
  '.eslintrc*',
  'tailwind.config.*',
  'postcss.config.*',
  '.npmrc',
  '.nvmrc',
  '.node-version',
  '.gitignore',
  '.gitattributes',
  'knip.*',
  'middleware.*',
]

const BELGE_YOLLARI = [
  'docs/a.md',
  'docs/standards/x.md',
  'docs/a/b/c/d/e.json',
  'docs/.gizli',
  'docs/Çevre.md',
  'README.md',
  'CHANGELOG.md',
  'CLAUDE.md',
  'PROJECT.md',
  'RECOMMENDATIONS.md',
  'CONTEXT.md',
  'AGENTS.md',
  'a.md',
  'playwright.config.md',
  'sentry.client.config.md',
  'vitest.setup.md',
  'package.md',
  'tsconfig.md',
  '.claude/agents/x.md',
  '.claude/skills/y/SKILL.md',
  '.claude/hooks/z.cjs',
  '.claude/commands/c.md',
  '.claude/settings.json',
  '.agent/skills/s/SKILL.md',
  '.agent/x',
]
const EDGE_YOLLARI = [
  'supabase/functions/a/index.ts',
  'supabase/functions/_shared/x.ts',
  'supabase/functions/deno.json',
  'supabase/functions/a/b/c/d.ts',
]
const BETIK_YOLLARI = [
  'scripts/x.js',
  'scripts/db/migrate.ts',
  'scripts/hijyen/arac-envanteri.cjs',
  'scripts/ci-baska/x.js',
  'scripts/cix/y.js',
  'scripts/ci.sh',
  'scripts/CI/x.cjs',
  'scripts/__tests__/x.test.ts',
  'scripts/a/b/c/d.sh',
  'tools/a.sh',
  'tools/x/y/z.ts',
]
/** SPEC sınır komşuları ve benzerleri: ÖNEK `/` sınırında olmadığı için dar DEĞİL. */
const SINIR_KOMSULARI = [
  'docs-ekstra/x.md',
  'docsx/a.md',
  'doc/a.md',
  'scripts-eski/x.js',
  'scriptsx/y.js',
  'script/y.js',
  'supabase/functions-eski/x.ts',
  'supabase/functionsx/y.ts',
  'supabase/function/y.ts',
  '.claude2/x',
  '.claudeX/x',
  '.claude-eski/x',
  '.agent2/x',
  '.agents/x',
  'src2/x.ts',
  'tools2/x.sh',
  'tool/x.sh',
  'docs',
  'scripts',
  'tools',
  '.claude',
  '.agent',
  'supabase/functions',
]
/** HER_ZAMAN_TAM kapsamındaki örnek yollar (her biri `küresel/mekanizma` nedeniyle tam). */
const HER_ZAMAN_TAM_YOLLARI = [
  '.github/workflows/ci.yml',
  '.github/CODEOWNERS',
  '.github/ISSUE_TEMPLATE/a.md',
  'scripts/ci/x.cjs',
  'scripts/ci/__tests__/y.test.ts',
  'scripts/ci/dunya-durumu-testleri.json',
  'scripts/ci',
  '.githooks/pre-commit',
  '.githooks/lib/x.sh',
  'src/a.ts',
  'src/app/page.tsx',
  'src/docs/a.md',
  'src/README.md',
  'src/__tests__/x.test.ts',
  'src/middleware.ts',
  'public/x.png',
  'public/docs/a.md',
  'supabase/migrations/20260101000000_x.sql',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'tsconfig.build.json',
  'tsconfig-x.json',
  'vitest.config.ts',
  'vitest.config.mts',
  'vitest.config.md',
  'next.config.mjs',
  'next.config.md',
  'eslint.config.cjs',
  'eslint.config.md',
  '.eslintrc',
  '.eslintrc.json',
  '.eslintrc.cjs',
  'tailwind.config.js',
  'tailwind.config.md',
  'postcss.config.js',
  'postcss.config.md',
  '.npmrc',
  '.nvmrc',
  '.node-version',
  '.gitignore',
  '.gitattributes',
  'knip.json',
  'knip.ts',
  'knip.md',
  'middleware.ts',
  'middleware.md',
]
/** Hiçbir listede yok; "kökteki diğer her dosya ve sınıflanamayan her yol" olarak tam. */
const VARSAYILAN_TAM_YOLLARI = [
  'supabase/baselines/x.sql',
  'supabase/config.toml',
  'supabase/seed.sql',
  'supabase/x.ts',
  'supabase/README.md',
  'vercel.json',
  'Dockerfile',
  'LICENSE',
  'deno.lock',
  'components.json',
  'playwright.config.ts',
  'sentry.client.config.ts',
  'memory.db',
  '.env.example',
  'data.json',
  'skills.json',
  'next-env.d.ts',
  'README.json',
  'README.txt',
  'README.mdx',
  'README.MD',
  'Readme.Md',
  '.md',
  '.hidden.md',
  '.cursorrules',
  'e2e/README.md',
  'tests/x.md',
  'registry/a/b.md',
  'deploy/x.md',
  'artifacts/x.md',
  'support/x.md',
  'memory-engine/x.md',
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 1. SÖZLEŞME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('sözleşme yüzeyi', () => {
  it('dışa açılan adlar ve türleri', () => {
    expect(typeof M.siniflandir).toBe('function')
    expect(typeof M.calistir).toBe('function')
    expect(typeof M.main).toBe('function')
    expect(typeof M.yoluNormallestir).toBe('function')
    expect(typeof M.satirTemizle).toBe('function')
    expect(typeof M.kokDeseniEslesirMi).toBe('function')
    expect(typeof M.DAR_SINIFLAR).toBe('object')
    expect(Array.isArray(M.HER_ZAMAN_TAM)).toBe(true)
  })

  it('DAR_SINIFLAR LİTERAL: sınıf başına önek listesi (modülden türetilmez)', () => {
    expect(M.DAR_SINIFLAR).toEqual(DAR_BEKLENEN)
    expect(Object.isFrozen(M.DAR_SINIFLAR)).toBe(true)
    for (const onekler of Object.values(M.DAR_SINIFLAR)) expect(Object.isFrozen(onekler)).toBe(true)
  })

  it('HER_ZAMAN_TAM LİTERAL: SPEC listesi, sırasıyla (modülden türetilmez)', () => {
    expect([...M.HER_ZAMAN_TAM]).toEqual(HER_ZAMAN_TAM_BEKLENEN)
    expect(Object.isFrozen(M.HER_ZAMAN_TAM)).toBe(true)
  })

  it('sayısal sınırlar LİTERAL: 2000 dosya, 1024 karakter, 300 karakterlik neden', () => {
    expect(M.DOSYA_SINIRI).toBe(2000)
    expect(M.EN_UZUN_YOL).toBe(1024)
    expect(M.NEDEN_AZAMI).toBe(300)
  })

  it('yazım kuralı: dar önekler `/` ile biter; tam girdileri ya dizin (`/`), ya kök ad, ya TEK `*` içeren kök desen; tekrar yok', () => {
    for (const onekler of Object.values(M.DAR_SINIFLAR)) {
      for (const onek of onekler) {
        expect(onek.endsWith('/')).toBe(true)
        expect(onek.includes('*')).toBe(false)
        expect(onek.startsWith('/')).toBe(false)
      }
    }
    for (const girdi of M.HER_ZAMAN_TAM) {
      if (girdi.endsWith('/')) {
        expect(girdi.includes('*')).toBe(false)
      } else {
        expect(girdi.includes('/')).toBe(false)
        expect(girdi.split('*').length - 1).toBeLessThanOrEqual(1)
      }
    }
    expect(new Set(M.HER_ZAMAN_TAM).size).toBe(M.HER_ZAMAN_TAM.length)
  })

  it('sonuç şekli: tam olarak { sinif, siniflar, neden }; her çağrıda TAZE diziler (paylaşılan durum yok)', () => {
    const a = s('docs/a.md')
    expect(Object.keys(a)).toEqual(['sinif', 'siniflar', 'neden'])
    a.siniflar.push('kirlendi')
    a.neden.push('kirlendi')
    expect(s('docs/a.md')).toEqual({ sinif: 'belge', siniflar: ['belge'], neden: ['1 dosyanın tümü dar sınıflarda: belge 1'] })
    const t = s('src/a.ts')
    t.siniflar.push('kirlendi')
    expect(s('src/b.ts').siniflar).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 2. DAR SINIFLAR ve SINIR KOMŞULARI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('dar sınıflar: tipik yollar', () => {
  it.each([
    ['belge', BELGE_YOLLARI],
    ['edge', EDGE_YOLLARI],
    ['betik', BETIK_YOLLARI],
  ] as const)('%s: her tipik yol TEK başına o sınıf (sinif, siniflar, neden)', (sinif, yollar) => {
    for (const yol of yollar) {
      expect(s(yol), yol).toEqual({ sinif, siniflar: [sinif], neden: [`1 dosyanın tümü dar sınıflarda: ${sinif} 1`] })
    }
  })

  it('aynı sınıftan çok dosya yine o sınıf; neden adedi ve sınıf sayısını söyler', () => {
    expect(s(...BELGE_YOLLARI)).toEqual({
      sinif: 'belge',
      siniflar: ['belge'],
      neden: [`${BELGE_YOLLARI.length} dosyanın tümü dar sınıflarda: belge ${BELGE_YOLLARI.length}`],
    })
    expect(s(...EDGE_YOLLARI).sinif).toBe('edge')
    expect(s(...BETIK_YOLLARI).sinif).toBe('betik')
  })

  it('DAR_SINIFLAR önekleriyle tutarlılık: her önek altındaki her derinlik o sınıf (önekler ayrıca literal tabloda sabitlendi)', () => {
    for (const [sinif, onekler] of Object.entries(M.DAR_SINIFLAR)) {
      for (const onek of onekler) {
        for (const yol of [`${onek}x.ext`, `${onek}a/b/c.ext`, `${onek}.gizli`]) {
          expect(sinifi(yol), yol).toBe(sinif)
        }
      }
    }
  })
})

describe('sınır komşuları: önek `/` sınırında eşleşir, benzer adlar DAR DEĞİL', () => {
  it.each(SINIR_KOMSULARI)('%s → tam', (yol) => {
    expect(s(yol)).toEqual(TAM_SEKLI)
  })

  it('SPEC komşuları adıyla: docs-ekstra/, scripts-eski/, supabase/functions-eski/, .claude2/, src2/ tam; scripts/ci-baska/ BETİK (scripts/ci/ değil)', () => {
    expect(sinifi('docs-ekstra/x.md')).toBe('tam')
    expect(sinifi('scripts-eski/x.js')).toBe('tam')
    expect(sinifi('supabase/functions-eski/x.ts')).toBe('tam')
    expect(sinifi('.claude2/x')).toBe('tam')
    expect(sinifi('src2/x.ts')).toBe('tam')
    expect(sinifi('scripts/ci-baska/x.js')).toBe('betik')
  })

  it('DAR_SINIFLAR önekinden türetilen komşular: her önek için `<ad>-eski/`, `<ad>2/`, adın DOSYA olarak kendisi ve `<ad>x` tam', () => {
    for (const onekler of Object.values(M.DAR_SINIFLAR)) {
      for (const onek of onekler) {
        const ad = onek.slice(0, -1)
        for (const yol of [`${ad}-eski/x.ext`, `${ad}2/x.ext`, `${ad}`, `${ad}x`]) {
          expect(sinifi(yol), yol).toBe('tam')
        }
      }
    }
  })

  it('dar bir dizinin KENDİSİ dosya olarak (alt yolsuz) dar değil: `docs/`, `scripts/`, `.claude/`, `supabase/functions/`', () => {
    expect(sinifi('docs/')).toBe('tam')
    expect(sinifi('scripts/')).toBe('tam')
    expect(sinifi('.claude/')).toBe('tam')
    expect(sinifi('supabase/functions/')).toBe('tam')
  })

  it('dar dizinler iç içe geçmez: `docs/scripts/x.js` belge, `scripts/docs/x.md` betik, `supabase/functions/docs/x.md` edge', () => {
    expect(sinifi('docs/scripts/x.js')).toBe('belge')
    expect(sinifi('scripts/docs/x.md')).toBe('betik')
    expect(sinifi('supabase/functions/docs/x.md')).toBe('edge')
    expect(sinifi('tools/docs/x.md')).toBe('betik')
  })

  it('dar dizin başka bir dizinin ALTINDA ise dar DEĞİL (önek yalnız kökten): `x/docs/a.md`, `src/docs/a.md`, `a/scripts/x.js`', () => {
    for (const yol of ['x/docs/a.md', 'src/docs/a.md', 'a/scripts/x.js', 'public/.claude/x', 'e2e/supabase/functions/x.ts', 'a/tools/x.sh']) {
      expect(sinifi(yol), yol).toBe('tam')
    }
  })
})

describe('kök `*.md` ↔ kökteki diğer dosyalar; `.md` yalnız kökte ve yalnız dar dizinlerde belgedir', () => {
  it('kökte `*.md` belge, kökte `.json`/`.txt`/`.mdx`/`.MD` tam', () => {
    for (const yol of ['README.md', 'CHANGELOG.md', 'a.md', 'ORIGINAL_REQUEST.md']) expect(sinifi(yol), yol).toBe('belge')
    for (const yol of ['README.json', 'README.txt', 'README.mdx', 'README.MD', 'Readme.Md', 'README.md.bak', 'README', 'data.json']) {
      expect(sinifi(yol), yol).toBe('tam')
    }
  })

  it('kökteki gizli `.md` dosyaları ve çıplak `.md` belge DEĞİL (nokta ile başlayan ad `*` ile eşleşmez)', () => {
    for (const yol of ['.md', '.hidden.md', '..md', '.a.md']) expect(sinifi(yol), yol).toBe('tam')
  })

  it('alt dizindeki `.md` YALNIZ dar dizinlerde belge (docs/, .claude/, .agent/); `src/**/*.md` ve öteki yerler tam', () => {
    for (const yol of ['src/README.md', 'src/a/b/c.md', 'supabase/README.md', 'e2e/README.md', 'public/a.md', '.github/a.md', 'x/y.md', 'registry/a/b.md']) {
      expect(sinifi(yol), yol).toBe('tam')
    }
    for (const yol of ['docs/x/README.md', '.claude/x/README.md', '.agent/x/README.md']) expect(sinifi(yol), yol).toBe('belge')
  })

  it('kökte `.config.md` eşlik dosyaları: `next.config.md` HER_ZAMAN_TAM ile çakışır ve TAM kazanır; çakışmayanlar belge', () => {
    for (const yol of ['next.config.md', 'vitest.config.md', 'eslint.config.md', 'tailwind.config.md', 'postcss.config.md', 'knip.md', 'middleware.md']) {
      expect(s(yol).neden[0], yol).toContain('küresel/mekanizma')
      expect(sinifi(yol), yol).toBe('tam')
    }
    for (const yol of ['playwright.config.md', 'sentry.client.config.md', 'vitest.setup.md', 'vitest-setup.md', 'next-env.d.md', 'tsconfig.md', 'package.md']) {
      expect(sinifi(yol), yol).toBe('belge')
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 3. HER ZAMAN TAM ve ÖNEK ÇAKIŞMA DENETİMİ
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('HER ZAMAN tam (mekanizma/küresel)', () => {
  it.each(HER_ZAMAN_TAM_YOLLARI)('%s → tam, neden "küresel/mekanizma"', (yol) => {
    const r = s(yol)
    expect(r).toEqual(TAM_SEKLI)
    expect(r.neden[0]).toContain('küresel/mekanizma')
  })

  it.each(VARSAYILAN_TAM_YOLLARI)('%s → tam, neden "hiçbir dar sınıfta değil" (sınıflanamayan)', (yol) => {
    const r = s(yol)
    expect(r).toEqual(TAM_SEKLI)
    expect(r.neden[0]).toContain('hiçbir dar sınıfta')
  })

  it('kök desenleri YALNIZ kökte eşleşir: `docs/package.json` belge, `scripts/tsconfig.json` betik, `supabase/functions/deno.json` edge; `x/package.json` ve `a/b/.npmrc` yine tam (başka nedenle)', () => {
    expect(sinifi('docs/package.json')).toBe('belge')
    expect(sinifi('docs/tsconfig.json')).toBe('belge')
    expect(sinifi('.claude/knip.json')).toBe('belge')
    expect(sinifi('scripts/package.json')).toBe('betik')
    expect(sinifi('scripts/tsconfig.json')).toBe('betik')
    expect(sinifi('tools/middleware.ts')).toBe('betik')
    expect(sinifi('supabase/functions/tsconfig.json')).toBe('edge')
    expect(sinifi('x/package.json')).toBe('tam')
    expect(sinifi('a/b/.npmrc')).toBe('tam')
    expect(s('x/package.json').neden[0]).toContain('hiçbir dar sınıfta')
  })

  it('kök desenleri TAM eşleşir: `package.jsonx`, `xpackage.json`, `tsconfig.jsonc`, `Package.json` HER_ZAMAN_TAM neden metni taşımaz (yine tam, ama sınıflanamayan)', () => {
    for (const yol of ['package.jsonx', 'xpackage.json', 'tsconfig.jsonc', 'Package.json', 'xtsconfig.json', 'vitest.config', 'next.config', '.npmrcx', 'knip', 'middleware']) {
      const r = s(yol)
      expect(r.sinif, yol).toBe('tam')
      expect(r.neden[0], yol).toContain('hiçbir dar sınıfta')
    }
  })

  it('`*` boş eşleşebilir ama baş ve son BİNMEZ: `tsconfig.json` (boş), `.eslintrc` (boş) küresel; `knip.` ve `vitest.config.` (uzantı boş) da küresel', () => {
    for (const yol of ['tsconfig.json', '.eslintrc', 'knip.', 'vitest.config.']) expect(s(yol).neden[0], yol).toContain('küresel/mekanizma')
  })
})

describe('kök deseni eşleştirici (kokDeseniEslesirMi): gerçek listede tetiklenmeyen kenarlar sentetik desenlerle', () => {
  it.each<[string, string, boolean]>([
    ['package.json', 'package.json', true],
    ['package.json', 'package.jsonx', false],
    ['package.json', 'xpackage.json', false],
    ['package.json', 'Package.json', false],
    ['tsconfig*.json', 'tsconfig.json', true],
    ['tsconfig*.json', 'tsconfig.build.json', true],
    ['tsconfig*.json', 'tsconfig.jsonc', false],
    ['tsconfig*.json', 'xtsconfig.json', false],
    ['knip.*', 'knip.', true],
    ['knip.*', 'knip', false],
    ['.eslintrc*', '.eslintrc', true],
    ['.eslintrc*', '.eslintrc.cjs', true],
    ['*.json', '.json', true],
    ['*.json', 'a.json', true],
    ['*.json', 'json', false],
    ['a*', 'a', true],
    ['*', '', true],
    // baş ve son BİNMEZ: "ab*ba" için "aba" 3 karakterdir, ama en az 4 gerekir (aksi halde ortadaki "b" iki kez sayılırdı)
    ['ab*ba', 'aba', false],
    ['ab*ba', 'abba', true],
    ['ab*ba', 'abxba', true],
    ['abc*cba', 'abcba', false],
    ['abc*cba', 'abccba', true],
  ])('%j ↔ %j → %s', (desen, ad, beklenen) => {
    expect(M.kokDeseniEslesirMi(desen, ad)).toBe(beklenen)
  })
})

describe('önek çakışma denetimi', () => {
  it('hiçbir dar önek bir tam öneğin altında ya da üstünde değil; TEK istisna betik `scripts/` ↔ `scripts/ci/`', () => {
    const tamDizinler = M.HER_ZAMAN_TAM.filter((g) => g.endsWith('/'))
    const cakisanlar: string[] = []
    for (const [sinif, onekler] of Object.entries(M.DAR_SINIFLAR)) {
      for (const onek of onekler) {
        for (const tam of tamDizinler) {
          if (onek.startsWith(tam) || tam.startsWith(onek)) cakisanlar.push(`${sinif}:${onek} ↔ ${tam}`)
        }
      }
    }
    expect(cakisanlar).toEqual(['betik:scripts/ ↔ scripts/ci/'])
  })

  it('ADLI İSTİSNA: scripts/ci/ dizini scripts/ (betik) altında olduğu hâlde TAM kazanır; komşuları `scripts/ci-baska/`, `scripts/ci.sh`, `scripts/cix/` betik; dizinin adı DOSYA olarak (`scripts/ci`) da tam', () => {
    for (const yol of ['scripts/ci/a.cjs', 'scripts/ci/x/y/z.ts', 'scripts/ci/__tests__/q.test.ts', 'scripts/ci/.gizli']) {
      expect(s(yol), yol).toEqual(TAM_SEKLI)
      expect(s(yol).neden[0]).toContain('(scripts/ci/)')
    }
    for (const yol of ['scripts/ci-baska/x.js', 'scripts/ci.sh', 'scripts/cix/y.js', 'scripts/c/x.js', 'scripts/CI/x.cjs']) expect(sinifi(yol), yol).toBe('betik')
    expect(sinifi('scripts/ci')).toBe('tam')
  })

  it('kök çakışması: HER_ZAMAN_TAM kök desenleri ile kök `*.md` kuralı çakışırsa TAM kazanır (öncelik, dar sınıf kuralından ÖNCE)', () => {
    expect(sinifi('next.config.md')).toBe('tam')
    expect(sinifi('scripts/ci/README.md')).toBe('tam')
    expect(sinifi('scripts/ci/x.md')).toBe('tam')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 4. KARMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('karma birleşimler', () => {
  it('belge + betik → karma ["belge","betik"]; neden sınıf başına adedi söyler', () => {
    expect(s('docs/a.md', 'scripts/x.js')).toEqual({
      sinif: 'karma',
      siniflar: ['belge', 'betik'],
      neden: ['2 dosyanın tümü dar sınıflarda: belge 1, betik 1'],
    })
  })

  it('siniflar ALFABETİK sıralı: betik + edge → ["betik","edge"] (edge SPEC listesinde betikten önce gelir, sıralama listeyi izlemez)', () => {
    expect(s('supabase/functions/f/i.ts', 'scripts/x.js').siniflar).toEqual(['betik', 'edge'])
    expect(s('supabase/functions/f/i.ts', 'docs/a.md').siniflar).toEqual(['belge', 'edge'])
  })

  it('üç dar sınıf birden → karma ["belge","betik","edge"]', () => {
    expect(s('supabase/functions/f/i.ts', 'scripts/x.js', 'docs/a.md', 'README.md')).toEqual({
      sinif: 'karma',
      siniflar: ['belge', 'betik', 'edge'],
      neden: ['4 dosyanın tümü dar sınıflarda: belge 2, betik 1, edge 1'],
    })
  })

  it('belge + src → TAM; belge + scripts/ci → TAM; belge + betik + supabase/migrations → TAM; karma ASLA tam yerine geçmez', () => {
    for (const liste of [
      ['docs/a.md', 'src/a.ts'],
      ['docs/a.md', 'scripts/ci/x.cjs'],
      ['docs/a.md', 'scripts/x.js', 'supabase/migrations/20260101000000_x.sql'],
      ['docs/a.md', 'package.json'],
      ['README.md', '.github/workflows/ci.yml'],
      ['scripts/x.js', 'public/a.png'],
    ]) {
      expect(s(...liste), liste.join()).toEqual(TAM_SEKLI)
    }
  })

  it('TEK tam yol hangi konumda olursa olsun (ilk, orta, son) sonucu TAM yapar ve neden ilk tam yolu söyler', () => {
    const dar = ['docs/a.md', 'scripts/x.js', 'supabase/functions/f/i.ts', 'README.md', '.claude/x']
    for (let konum = 0; konum <= dar.length; konum++) {
      const liste = [...dar.slice(0, konum), 'src/a.ts', ...dar.slice(konum)]
      const r = M.siniflandir(liste)
      expect(r.sinif, `konum ${konum}`).toBe('tam')
      expect(r.siniflar).toEqual([])
      expect(r.neden).toHaveLength(1)
      expect(r.neden[0]).toContain("'src/a.ts'")
    }
  })

  it('birden çok tam yol varsa neden İLK tam yolu söyler (sonrakini değil)', () => {
    const r = s('docs/a.md', 'src/ilk.ts', 'src/ikinci.ts')
    expect(r.neden).toHaveLength(1)
    expect(r.neden[0]).toContain("'src/ilk.ts'")
    expect(r.neden[0]).not.toContain('ikinci')
  })

  it('girdi SIRASI sonucu değiştirmez (6 permütasyon) ve tekrar eden yol sınıfı değiştirmez (adet artar)', () => {
    const [a, b, c] = ['docs/a.md', 'scripts/x.js', 'supabase/functions/f/i.ts']
    const permutasyonlar = [
      [a, b, c],
      [a, c, b],
      [b, a, c],
      [b, c, a],
      [c, a, b],
      [c, b, a],
    ]
    const sonuclar = permutasyonlar.map((p) => s(...p))
    for (const r of sonuclar) expect(r).toEqual(sonuclar[0])
    expect(sonuclar[0].siniflar).toEqual(['belge', 'betik', 'edge'])
    const tekrarli = s(a, a, a, b)
    expect(tekrarli.sinif).toBe('karma')
    expect(tekrarli.siniflar).toEqual(['belge', 'betik'])
    expect(tekrarli.neden[0]).toBe('4 dosyanın tümü dar sınıflarda: belge 3, betik 1')
  })

  it('girdi dizisini DEĞİŞTİRMEZ (donmuş girdiyle de çalışır)', () => {
    const girdi = Object.freeze(['docs/a.md', 'src/a.ts'])
    expect(() => M.siniflandir(girdi)).not.toThrow()
    expect(girdi).toEqual(['docs/a.md', 'src/a.ts'])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 5. HATALI GİRDİ, NORMALLEŞTİRME, SINIRLAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('boş ve hatalı girdi: ASLA fırlatmaz, hata = tam', () => {
  it('boş liste → tam (belge değil), neden "boş"', () => {
    expect(s()).toEqual({ sinif: 'tam', siniflar: [], neden: ['değişen dosya listesi boş: karar verilemez'] })
  })

  it.each<[string, unknown]>([
    ['undefined', undefined],
    ['null', null],
    ['sayı', 42],
    ['mantıksal', true],
    ['metin (dizi değil: karakterlerine bölünmez)', 'docs/a.md'],
    ['düz nesne', {}],
    ['dizi benzeri nesne', { length: 1, 0: 'docs/a.md' }],
    ['Set', new Set(['docs/a.md'])],
    ['Map', new Map([['a', 'docs/a.md']])],
    ['işlev', () => ['docs/a.md']],
    ['sembol', Symbol('x')],
  ])('dizi olmayan girdi (%s) → tam, neden "dizi değil"', (_ad, girdi) => {
    expect(M.siniflandir(girdi)).toEqual({ sinif: 'tam', siniflar: [], neden: ['girdi bir yol dizisi değil'] })
  })

  it.each<[string, unknown]>([
    ['undefined', undefined],
    ['null', null],
    ['sayı', 7],
    ['mantıksal', false],
    ['iç içe dizi', ['docs/a.md']],
    ['nesne', {}],
    ['String nesnesi (typeof object)', new String('docs/a.md')],
    ['işlev', () => 'docs/a.md'],
    ['sembol', Symbol('docs/a.md')],
    ['boş metin', ''],
  ])('metin olmayan ya da boş eleman (%s) → tam, tek başına ve bir belgenin yanında', (_ad, eleman) => {
    expect(s(eleman)).toEqual(TAM_SEKLI)
    expect(s('docs/a.md', eleman)).toEqual(TAM_SEKLI)
    expect(s(eleman, 'docs/a.md')).toEqual(TAM_SEKLI)
  })

  it('metin olmayan elemanın nedeni TÜRÜNÜ söyler, değerini metne çevirmeye çalışmaz', () => {
    expect(s(42).neden[0]).toContain('<number>')
    expect(s(undefined).neden[0]).toContain('<undefined>')
    expect(s({}).neden[0]).toContain('<object>')
    expect(s(Symbol('x')).neden[0]).toContain('<symbol>')
  })

  it('SEYREK dizi (delik) → tam: delikler undefined sayılır (forEach/every deliği atlardı ve boş-doğru derdi)', () => {
    expect(M.siniflandir(new Array(3))).toEqual(TAM_SEKLI)
    expect(M.siniflandir(new Array(1))).toEqual(TAM_SEKLI)
    const delikli = ['docs/a.md', , 'docs/b.md'] as unknown[]
    expect(M.siniflandir(delikli)).toEqual(TAM_SEKLI)
  })

  it('dizi olmayan ama `length` taşıyan nesne ve yineleyici girdi tam (yalnız gerçek dizi kabul edilir)', () => {
    expect(M.siniflandir({ length: 2, 0: 'docs/a.md', 1: 'docs/b.md' })).toEqual({ sinif: 'tam', siniflar: [], neden: ['girdi bir yol dizisi değil'] })
    expect(M.siniflandir(new Set(['docs/a.md']).values())).toEqual({ sinif: 'tam', siniflar: [], neden: ['girdi bir yol dizisi değil'] })
  })

  it('FIRLATAN girdiler: dizi vekili, eleman alıcısı (getter) ve mesajı da fırlatan hata nesnesi → tam, fırlatmaz, neden TEK satır', () => {
    const patlayanDizi = new Proxy(['docs/a.md'], {
      get() {
        throw new Error('boom\n::error::x')
      },
    })
    const patlayanEleman: unknown[] = ['docs/a.md']
    Object.defineProperty(patlayanEleman, 0, {
      get() {
        throw new Error('eleman okunamadı\r\n::error::y')
      },
    })
    for (const girdi of [patlayanDizi, patlayanEleman]) {
      const r = M.siniflandir(girdi)
      expect(r.sinif).toBe('tam')
      expect(r.siniflar).toEqual([])
      expect(r.neden).toHaveLength(1)
      expect(r.neden[0]).toContain('beklenmeyen hata')
      expect(r.neden[0]).not.toMatch(/[\r\n]/)
    }
    const cifteHata: unknown[] = ['docs/a.md']
    Object.defineProperty(cifteHata, 0, {
      get() {
        return firlat({
          get message(): string {
            throw new Error('iç içe')
          },
        })
      },
    })
    const r = M.siniflandir(cifteHata)
    expect(r.sinif).toBe('tam')
    expect(r.neden[0]).toContain('bilinmeyen hata')
    const dizeFirlatan = new Proxy(['docs/a.md'], {
      get() {
        return firlat('dize hata')
      },
    })
    expect(M.siniflandir(dizeFirlatan).neden[0]).toContain('dize hata')
  })

  it('neden içinde yol DEĞERİ görünür ama TEK satır ve kontrol karakteri taşımaz; uzun yol 80 karakterde kesilir', () => {
    const r = s('src/a\nb\0c\r.ts')
    expect(r.neden[0]).toContain("'src/a?b?c?.ts'")
    expect(r.neden[0]).not.toMatch(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/)
    const uzun = s(`src/${'x'.repeat(500)}.ts`)
    expect(uzun.neden[0].length).toBeLessThan(200)
    expect(uzun.neden[0]).toContain('…')
    const tam80 = s(`src/${'y'.repeat(76)}`) // tam 80 karakter: kesilmez
    expect(tam80.neden[0]).not.toContain('…')
    expect(tam80.neden[0]).toContain(`'src/${'y'.repeat(76)}'`)
    const seksenBir = s(`src/${'y'.repeat(77)}`)
    expect(seksenBir.neden[0]).toContain('…')
  })
})

describe('yol normalleştirme', () => {
  it.each<[string, string]>([
    ['docs/a.md', 'docs/a.md'],
    ['./docs/a.md', 'docs/a.md'],
    ['././docs/a.md', 'docs/a.md'],
    ['.//docs/a.md', 'docs/a.md'],
    ['docs//a.md', 'docs/a.md'],
    ['docs///a.md', 'docs/a.md'],
    ['docs/./a.md', 'docs/a.md'],
    ['docs/././a.md', 'docs/a.md'],
    ['docs\\a.md', 'docs/a.md'],
    ['.\\docs\\a.md', 'docs/a.md'],
    ['docs\\\\a.md', 'docs/a.md'],
    ['docs/a/', 'docs/a'],
    ['docs/a//', 'docs/a'],
    ['a', 'a'],
    ['./a', 'a'],
    ['scripts/./ci/x.cjs', 'scripts/ci/x.cjs'],
    ['scripts//ci//x.cjs', 'scripts/ci/x.cjs'],
    ['scripts\\ci\\x.cjs', 'scripts/ci/x.cjs'],
    ['docs/Çevre dosyası.md', 'docs/Çevre dosyası.md'],
    [' docs/a.md', ' docs/a.md'],
    ['docs /a.md', 'docs /a.md'],
    ['docs/a.md ', 'docs/a.md '],
  ])('%j → %j', (ham, beklenen) => {
    expect(M.yoluNormallestir(ham)).toEqual({ yol: beklenen })
  })

  it.each<[string, string]>([
    ['', 'boş'],
    ['.', 'boş'],
    ['./', 'boş'],
    ['././', 'boş'],
    ['..', "'..'"],
    ['../x', "'..'"],
    ['docs/..', "'..'"],
    ['docs/../src/a.ts', "'..'"],
    ['docs\\..\\src\\a.ts', "'..'"],
    ['./docs/../x', "'..'"],
    ['a/b/../../../etc/passwd', "'..'"],
    ['docs/a/../../src/x.ts', "'..'"],
    ['/', 'mutlak'],
    ['//', 'mutlak'],
    ['/docs/a.md', 'mutlak'],
    ['\\docs\\a.md', 'mutlak'],
    ['//docs/a.md', 'mutlak'],
    ['\\\\sunucu\\paylasim\\docs\\a.md', 'mutlak'],
    ['C:/docs/a.md', 'mutlak'],
    ['C:\\docs\\a.md', 'mutlak'],
    ['c:docs/a.md', 'mutlak'],
    ['z:', 'mutlak'],
    ['docs/a\0.md', 'kontrol'],
    ['\0', 'kontrol'],
    ['\0docs/a.md', 'kontrol'],
    ['docs/\0', 'kontrol'],
    ['docs/a\n.md', 'kontrol'],
    ['docs/a\r.md', 'kontrol'],
    ['docs/a\t.md', 'kontrol'],
    ['docs/a\x1b.md', 'kontrol'],
    ['docs/a\x1f.md', 'kontrol'],
    ['docs/a\x7f.md', 'kontrol'],
    ['docs/a\x80.md', 'kontrol'],
    ['docs/a\x85.md', 'kontrol'],
    ['docs/a\x9f.md', 'kontrol'],
    ['docs/a\u2028.md', 'kontrol'],
    ['docs/a\u2029.md', 'kontrol'],
  ])('%j reddedilir (sebep %s)', (ham, sebep) => {
    const r = M.yoluNormallestir(ham)
    expect(r.yol).toBeUndefined()
    expect(r.sebep).toContain(sebep)
  })

  it('kontrol karakteri SINIRLARI: 0x1f reddedilir 0x20 (boşluk) kabul; 0x7e kabul 0x7f ret; 0x9f ret 0xa0 (NBSP) kabul; 0x2027 kabul 0x2028/0x2029 ret 0x202a kabul', () => {
    const kodlar: Array<[number, boolean]> = [
      [0x00, false],
      [0x1f, false],
      [0x20, true],
      [0x7e, true],
      [0x7f, false],
      [0x80, false],
      [0x9f, false],
      [0xa0, true],
      [0x2027, true],
      [0x2028, false],
      [0x2029, false],
      [0x202a, true],
      [0x0130, true], // İ
    ]
    for (const [kod, kabul] of kodlar) {
      const r = M.yoluNormallestir(`docs/a${String.fromCharCode(kod)}b`)
      expect(r.yol !== undefined, `0x${kod.toString(16)}`).toBe(kabul)
    }
  })

  it('metin olmayan girdi reddedilir: sebep "metin değil"', () => {
    for (const ham of [undefined, null, 1, {}, [], ['docs/a.md'], new String('docs/a.md'), Symbol('x'), true]) {
      expect(M.yoluNormallestir(ham)).toEqual({ sebep: 'yol bir metin değil' })
    }
  })

  it('SPEC normalleştirme tablosu sınıf olarak: ./docs/a.md, docs//a.md, docs\\a.ts belge; docs/../src/a.ts, mutlak yol, NUL tam', () => {
    expect(sinifi('./docs/a.md')).toBe('belge')
    expect(sinifi('docs//a.md')).toBe('belge')
    expect(sinifi('docs\\a.md')).toBe('belge')
    // `.md` UZANTISIZ: kök-`.md` kuralının tesadüfen kurtaramadığı yazım; yalnız ters eğik çizgi dönüşümü belge yapar.
    expect(sinifi('docs\\a.ts')).toBe('belge')
    expect(sinifi('docs\\sub\\a.ts')).toBe('belge')
    expect(sinifi('scripts\\x.js')).toBe('betik')
    expect(sinifi('supabase\\functions\\f\\i.ts')).toBe('edge')
    expect(sinifi('docs/../src/a.ts')).toBe('tam')
    expect(sinifi('/docs/a.md')).toBe('tam')
    expect(sinifi('docs/a\0.md')).toBe('tam')
  })

  it('mekanizma yolunu normalleştirme DARALTMAZ: scripts/./ci/x.cjs, scripts//ci/x.cjs, ./scripts/ci/x.cjs, scripts\\ci\\x.cjs tam', () => {
    for (const yol of ['scripts/./ci/x.cjs', 'scripts//ci/x.cjs', './scripts/ci/x.cjs', 'scripts\\ci\\x.cjs', 'scripts/ci/./x.cjs', './/scripts/ci/x.cjs', 'scripts/././ci/x.cjs']) {
      expect(s(yol), yol).toEqual(TAM_SEKLI)
      expect(s(yol).neden[0], yol).toContain('(scripts/ci/)')
    }
  })

  it('tam neden yolun KENDİ yazımını söyler (normalleştirilmiş değil): okuyan PR yazarı kendi yolunu görür', () => {
    expect(s('./src//a.ts').neden[0]).toContain("'./src//a.ts'")
  })

  it('boşluk KIRPILMAZ: " docs/a.md", "docs /a.md", "\\u00a0docs/a.md" belge değil; "docs/a.md " belge (dizin altında)', () => {
    expect(sinifi(' docs/a.md')).toBe('tam')
    expect(sinifi('docs /a.md')).toBe('tam')
    expect(sinifi('\u00a0docs/a.md')).toBe('tam')
    expect(sinifi('docs/a.md ')).toBe('belge')
  })

  it('Unicode benzerleri dar sayılmaz: tam genişlikli `ｄｏｃｓ/a.md`, `docs∕a.ts` (bölme eğik çizgisi), Kiril `dоcs/a.ts`', () => {
    for (const yol of ['ｄｏｃｓ/a.md', 'docs\u2215a.ts', 'd\u043ecs/a.ts', '\u0455cripts/x.js']) expect(sinifi(yol), yol).toBe('tam')
  })
})

describe('büyük/küçük harf DUYARLI', () => {
  it.each([
    'Docs/x.md',
    'DOCS/x.md',
    'dOcs/x.md',
    '.Claude/x',
    '.CLAUDE/x',
    '.Agent/x',
    '.AGENT/x',
    'Scripts/x.js',
    'SCRIPTS/x.js',
    'Tools/x.sh',
    'TOOLS/x.sh',
    'Supabase/functions/x.ts',
    'supabase/Functions/x.ts',
    'supabase/FUNCTIONS/x.ts',
    'SUPABASE/functions/x.ts',
    'README.MD',
    'Readme.Md',
  ])('%s → tam', (yol) => {
    expect(s(yol)).toEqual(TAM_SEKLI)
  })

  it('küçük harfli karşılıkları dar; `scripts/CI/x.cjs` ise scripts/ci/ DEĞİL, betik (harf duyarlı: ayrı dizin)', () => {
    expect(sinifi('docs/x.md')).toBe('belge')
    expect(sinifi('scripts/CI/x.cjs')).toBe('betik')
    expect(sinifi('SRC/a.ts')).toBe('tam')
    expect(sinifi('Package.json')).toBe('tam')
    expect(sinifi('PACKAGE.JSON')).toBe('tam')
  })
})

describe('Türkçe karakterli dosya adları', () => {
  it('docs/Çevre.md ve boşluklu/Türkçe adlar dar dizin altında belge/betik; kökte `Çevre.md` belge; src altında tam', () => {
    expect(sinifi('docs/Çevre.md')).toBe('belge')
    expect(sinifi('docs/çğıöşü İĞÜÖŞÇ dosyası.md')).toBe('belge')
    expect(sinifi('scripts/ş.js')).toBe('betik')
    expect(sinifi('Çevre.md')).toBe('belge')
    expect(sinifi('supabase/functions/ğ/i.ts')).toBe('edge')
    expect(sinifi('src/Çevre.ts')).toBe('tam')
    expect(sinifi('ÇEVRE/x.md')).toBe('tam')
    expect(sinifi('docs-çevre/x.md')).toBe('tam')
  })
})

describe('sınırlar', () => {
  it('yol uzunluğu: tam 1024 karakter kabul (belge), 1025 tam; sınır HAM uzunluğa uygulanır (normalleştirmeden önce)', () => {
    const ek = 'a'.repeat(M.EN_UZUN_YOL - 'docs/'.length)
    const sinirda = `docs/${ek}`
    expect(sinirda).toHaveLength(1024)
    expect(sinifi(sinirda)).toBe('belge')
    const asan = `${sinirda}a`
    expect(asan).toHaveLength(1025)
    expect(s(asan)).toEqual(TAM_SEKLI)
    expect(s(asan).neden[0]).toContain('1024 karakterden uzun')
    const sisirilmis = `${'./'.repeat(512)}docs/a.md`
    expect(sisirilmis.length).toBeGreaterThan(1024)
    expect(sinifi(sisirilmis)).toBe('tam')
  })

  it('sınırın altındaki derin yol dar kalır (derinlik sınırı yok): 600 karakterlik `docs/a/a/.../x.md`', () => {
    expect(sinifi(`docs/${'a/'.repeat(300)}x.md`)).toBe('belge')
  })

  it('dosya sayısı: 1999 belge → belge; 2000 → TAM (sınıra ULAŞAN tam); 2001 ve 10000 → tam; neden adedi söyler', () => {
    const uret = (n: number) => Array.from({ length: n }, (_v, i) => `docs/d${i}.md`)
    expect(M.siniflandir(uret(1999)).sinif).toBe('belge')
    expect(M.siniflandir(uret(1)).sinif).toBe('belge')
    for (const n of [2000, 2001, 10000]) {
      expect(M.siniflandir(uret(n)), String(n)).toEqual({
        sinif: 'tam',
        siniflar: [],
        neden: [`${n} dosya değişmiş (sınır 2000): kaba sınıflama güvenilmez`],
      })
    }
  })

  it('devasa seyrek dizi (length 10^9) taranmadan tam döner (bellek/süre güvenli)', () => {
    const t0 = Date.now()
    const r = M.siniflandir(new Array(1_000_000_000))
    expect(r.sinif).toBe('tam')
    expect(Date.now() - t0).toBeLessThan(2000)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 6. DEĞİŞMEZLER: üretilmiş külliyat + bağımsız hakem
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
type DarSinif = 'belge' | 'edge' | 'betik'

/** Tohumlu, tekrarlanabilir rastgelelik (mulberry32): sonuç her koşuda ve her makinede aynıdır. */
function tohumlu(tohum: number): () => number {
  let a = tohum >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const KOK_TAM_DESENLERI = [
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^pnpm-workspace\.yaml$/,
  /^tsconfig.*\.json$/,
  /^vitest\.config\..*$/,
  /^next\.config\..*$/,
  /^eslint\.config\..*$/,
  /^\.eslintrc.*$/,
  /^tailwind\.config\..*$/,
  /^postcss\.config\..*$/,
  /^\.npmrc$/,
  /^\.nvmrc$/,
  /^\.node-version$/,
  /^\.gitignore$/,
  /^\.gitattributes$/,
  /^knip\..*$/,
  /^middleware\..*$/,
]
const TAM_DIZINLERI = ['.github', 'scripts/ci', '.githooks', 'src', 'public', 'supabase/migrations']
const DAR_DIZINLERI: Array<[string, DarSinif]> = [
  ['docs', 'belge'],
  ['.claude', 'belge'],
  ['.agent', 'belge'],
  ['supabase/functions', 'edge'],
  ['scripts', 'betik'],
  ['tools', 'betik'],
]

/** BAĞIMSIZ HAKEM: SPEC cümlelerinden, modülün kodunu görmeden ve regex/bileşen mantığıyla yazılmış tek-yol sınıflayıcı. */
function hakem(ham: string): DarSinif | 'tam' {
  if (ham.length > 1024 || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(ham)) return 'tam'
  const duz = ham.replace(/\\/g, '/')
  if (duz.startsWith('/') || /^[A-Za-z]:/.test(duz)) return 'tam'
  const bilesenler = duz.split('/').filter((b) => b !== '' && b !== '.')
  if (bilesenler.length === 0 || bilesenler.includes('..')) return 'tam'
  const yol = bilesenler.join('/')
  if (TAM_DIZINLERI.some((d) => yol === d || yol.startsWith(`${d}/`))) return 'tam'
  if (bilesenler.length === 1 && KOK_TAM_DESENLERI.some((d) => d.test(yol))) return 'tam'
  const dar = DAR_DIZINLERI.find(([d]) => yol.startsWith(`${d}/`))
  if (dar) return dar[1]
  if (bilesenler.length === 1 && /^[^.].*\.md$/.test(yol)) return 'belge'
  return 'tam'
}

const PARCALAR = [
  'docs', 'scripts', 'ci', 'src', 'supabase', 'functions', 'migrations', 'baselines', '.claude', '.agent', '.github', 'tools', 'x.md', 'a.ts',
  'README.md', 'package.json', 'docs-ekstra', 'scripts-eski', 'Docs', 'SRC', 'Çevre.md', 'tsconfig.json', 'next.config.md', 'middleware.ts',
  '..', '.', '', ' ', 'public', '.githooks', 'knip.json', '.md', 'a b.md', 'ci-baska', 'a\0b', 'x\ny', '\u0085',
]
const DIZIN_ONEKLERI = [
  'docs', 'scripts', 'scripts/ci', 'scripts/./ci', 'scripts//ci', 'scripts\\ci', 'src', 'supabase/functions', 'supabase/migrations', '.claude', '.agent',
  'tools', '', 'docs/sub', 'scripts/ci-baska', '.github/workflows', 'public', 'Docs', 'docs-ekstra',
]
const DOSYALAR = ['x.md', 'a.ts', 'package.json', 'tsconfig.json', 'Çevre.md', 'next.config.md', 'README.md', 'x', '.gizli', 'a b.sh', '.md']
const AYRACLAR = ['/', '/', '/', '/', '\\', '//', '/./']
const BASLAR = ['', '', '', '', './', '/', '\\', 'C:/', '../', '.\\', ' ']

function rastgeleYollar(adet: number, tohum: number): string[] {
  const r = tohumlu(tohum)
  const sec = <T>(dizi: readonly T[]): T => dizi[Math.floor(r() * dizi.length)]
  const yollar: string[] = []
  for (let i = 0; i < adet; i++) {
    if (i % 2 === 0) {
      const n = 1 + Math.floor(r() * 5)
      let yol = sec(BASLAR)
      for (let k = 0; k < n; k++) yol += (k ? sec(AYRACLAR) : '') + sec(PARCALAR)
      yollar.push(yol)
    } else {
      let yol = sec(BASLAR) + sec(DIZIN_ONEKLERI) + sec(AYRACLAR) + sec(DOSYALAR)
      if (r() < 0.1) yol += sec(['/', '\\', '/.', '//'])
      yollar.push(yol)
    }
  }
  return yollar
}

describe('değişmezler: üretilmiş külliyat ve bağımsız hakem', () => {
  const yollar = rastgeleYollar(6000, 20261006)

  it('6000 rastgele yol tek başına: modülün kararı = bağımsız hakemin kararı (uyuşmazlık listesi BOŞ)', () => {
    const uyusmazlar: string[] = []
    const sayim: Record<string, number> = { belge: 0, edge: 0, betik: 0, tam: 0 }
    for (const yol of yollar) {
      const beklenen = hakem(yol)
      sayim[beklenen] += 1
      const gercek = M.siniflandir([yol]).sinif
      if (gercek !== beklenen) uyusmazlar.push(`${JSON.stringify(yol)}: modül ${gercek}, hakem ${beklenen}`)
    }
    expect(uyusmazlar.slice(0, 10)).toEqual([])
    // Külliyat BOŞ DEĞİL: her sonuç türünden yeterince örnek var (aksi halde "hepsi tam" sahte yeşildir).
    expect(sayim.belge).toBeGreaterThan(150)
    expect(sayim.betik).toBeGreaterThan(150)
    expect(sayim.edge).toBeGreaterThan(30)
    expect(sayim.tam).toBeGreaterThan(1500)
  })

  it('1500 rastgele LİSTE (1-6 yol): sonuç hakemden türetilen beklenenle aynı; şekil değişmezleri; sıra ve tekrar bağımsız; tam tekdüze', () => {
    const r = tohumlu(77)
    const secili = (): string => yollar[Math.floor(r() * yollar.length)]
    const uyusmazlar: string[] = []
    const gorulen: Record<string, number> = { tam: 0, belge: 0, betik: 0, edge: 0, karma: 0 }
    for (let i = 0; i < 1500; i++) {
      const n = 1 + Math.floor(r() * 6)
      const liste = Array.from({ length: n }, secili)
      const sinifler = liste.map(hakem)
      const sonuc = M.siniflandir(liste)
      const dar = sinifler.every((k) => k !== 'tam')
      const kume = [...new Set(sinifler)].sort()
      const beklenenSinif = !dar ? 'tam' : kume.length === 1 ? kume[0] : 'karma'
      const beklenenSiniflar = dar ? kume : []
      gorulen[beklenenSinif] += 1
      if (sonuc.sinif !== beklenenSinif || JSON.stringify(sonuc.siniflar) !== JSON.stringify(beklenenSiniflar)) {
        uyusmazlar.push(`${JSON.stringify(liste)} → ${sonuc.sinif}/${sonuc.siniflar.join()} (beklenen ${beklenenSinif}/${beklenenSiniflar.join()})`)
        continue
      }
      // şekil
      expect(['tam', 'belge', 'edge', 'betik', 'karma']).toContain(sonuc.sinif)
      expect(sonuc.neden.length).toBeGreaterThanOrEqual(1)
      for (const c of sonuc.neden) {
        expect(c.length).toBeGreaterThan(0)
        expect(c).not.toMatch(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]/)
      }
      expect(sonuc.siniflar).toEqual([...sonuc.siniflar].sort())
      if (sonuc.sinif === 'tam') expect(sonuc.siniflar).toEqual([])
      if (sonuc.siniflar.length === 1) expect(sonuc.sinif).toBe(sonuc.siniflar[0])
      if (sonuc.siniflar.length >= 2) expect(sonuc.sinif).toBe('karma')
      // sıra ve tekrar bağımsızlığı
      const ters = M.siniflandir([...liste].reverse())
      expect(ters.sinif).toBe(sonuc.sinif)
      expect(ters.siniflar).toEqual(sonuc.siniflar)
      expect(M.siniflandir([...liste, ...liste]).sinif).toBe(sonuc.sinif)
      // tekdüzelik: HERHANGİ bir listeye TAM bir yol eklemek sonucu tam yapar; tam bir listeyi dar bir yol tam olmaktan çıkaramaz
      expect(M.siniflandir([...liste, 'src/a.ts']).sinif).toBe('tam')
      if (sonuc.sinif === 'tam') expect(M.siniflandir([...liste, 'docs/a.md']).sinif).toBe('tam')
    }
    expect(uyusmazlar.slice(0, 5)).toEqual([])
    // Rastgele listelerde tam ağır basar (tek bir tam yol yeter); yine de dar sonuçlar da üretilmiş olmalı
    expect(gorulen.tam).toBeGreaterThan(300)
    expect(gorulen.belge + gorulen.betik + gorulen.edge + gorulen.karma).toBeGreaterThan(20)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 7. KOMUT SATIRI — SAHTE GİT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const GIT_ARGS = ['diff', '--name-only', '-z', '--no-renames', 'HEAD^1', 'HEAD']
const CIKTI_YOLU = '/sahte/github_output'

interface Yazim {
  yol: string | null
  metin: string
}
function kosFonk(git: (args: string[]) => unknown, ortam: Ortam | null | undefined = { GITHUB_OUTPUT: CIKTI_YOLU }, ciktiYaz?: CiktiYaz) {
  const gitCagrilari: string[][] = []
  const yazimlar: Yazim[] = []
  const sonuc = M.calistir({
    gitCalistir: (args) => {
      gitCagrilari.push([...args])
      return git(args)
    },
    ciktiYaz:
      ciktiYaz ??
      ((yol, metin) => {
        yazimlar.push({ yol, metin })
      }),
    ortam,
  })
  return {
    sonuc,
    gitCagrilari,
    yazimlar,
    dosya: yazimlar.filter((y) => y.yol === CIKTI_YOLU).map((y) => y.metin).join(''),
    ekran: yazimlar.filter((y) => y.yol === null).map((y) => y.metin).join(''),
  }
}
/** Git `cikti` döner (ya da bir Error ise fırlatır). */
const kos = (cikti: unknown, ortam?: Ortam | null) =>
  kosFonk(() => {
    if (cikti instanceof Error) throw cikti
    return cikti
  }, ortam)

describe('komut satırı (sahte git): git çağrısı', () => {
  it('git TEK kez ve SPEC argümanlarıyla çağrılır: diff --name-only -z --no-renames HEAD^1 HEAD', () => {
    const r = kos('docs/a.md\0')
    expect(r.gitCagrilari).toEqual([GIT_ARGS])
  })

  it('argüman dizisi her çağrıda DEĞİŞTİRİLEBİLİR TAZE kopyadır (git işlevi diziyi bozabilir, sonraki çağrı etkilenmez; donuk sabit doğrudan verilmez)', () => {
    const bozan = (args: string[]) => {
      args.length = 0 // donuk bir dizide bu TypeError olurdu ve sonuç tam çıkardı
      return 'docs/a.md\0'
    }
    expect(kosFonk(bozan).sonuc.sinif).toBe('belge')
    const r = kos('docs/a.md\0')
    expect(r.gitCagrilari).toEqual([GIT_ARGS])
  })

  it('git hata verince de TEK kez çağrılır (yeniden deneme yok)', () => {
    expect(kos(new Error('x')).gitCagrilari).toEqual([GIT_ARGS])
  })
})

describe('komut satırı (sahte git): çıktı biçimi ve $GITHUB_OUTPUT', () => {
  it('yalnız belge: dosyaya TAM üç satır (sinif, siniflar, neden), sonda satır sonu; ekrana yalnız ::notice::', () => {
    const r = kos('docs/a.md\0README.md\0')
    expect(r.sonuc).toEqual({ sinif: 'belge', siniflar: ['belge'], neden: ['2 dosyanın tümü dar sınıflarda: belge 2'] })
    expect(r.dosya).toBe('sinif=belge\nsiniflar=belge\nneden=2 dosyanın tümü dar sınıflarda: belge 2\n')
    expect(r.ekran).toBe('::notice::değişiklik sınıfı: belge — 2 dosyanın tümü dar sınıflarda: belge 2\n')
    expect(r.yazimlar.filter((y) => y.yol === CIKTI_YOLU)).toHaveLength(1)
    expect(r.yazimlar.filter((y) => y.yol === null)).toHaveLength(1)
  })

  it('karma: `siniflar=belge,betik` VİRGÜLLE, `sinif=karma`', () => {
    const r = kos('docs/a.md\0scripts/x.js\0')
    expect(r.dosya).toBe('sinif=karma\nsiniflar=belge,betik\nneden=2 dosyanın tümü dar sınıflarda: belge 1, betik 1\n')
  })

  it('üç sınıf: `siniflar=belge,betik,edge`', () => {
    const r = kos('docs/a.md\0scripts/x.js\0supabase/functions/f/i.ts\0')
    expect(r.dosya.split('\n')[1]).toBe('siniflar=belge,betik,edge')
  })

  it('tam: `sinif=tam`, `siniflar=` (BOŞ değer), neden ilk tam yolu söyler', () => {
    const r = kos('docs/a.md\0src/a.ts\0')
    expect(r.dosya).toBe("sinif=tam\nsiniflar=\nneden='src/a.ts' dar sınıflarda değil: küresel/mekanizma yolu (src/)\n")
    expect(r.ekran).toContain("::notice::değişiklik sınıfı: tam — 'src/a.ts' dar sınıflarda değil")
  })

  it('satır sayısı SABİT üç (neden satırı bölünemez); her satır anahtar=değer; tek `sinif=` satırı', () => {
    for (const cikti of ['docs/a.md\0', 'src/a.ts\0', '', 'docs/a.md', 'scripts/ci/x.cjs\0docs/a.md\0']) {
      const { dosya } = kos(cikti)
      const satirlar = dosya.split('\n')
      expect(satirlar).toHaveLength(4) // 3 satır + sondaki boş
      expect(satirlar[3]).toBe('')
      expect(satirlar[0]).toMatch(/^sinif=(tam|belge|edge|betik|karma)$/)
      expect(satirlar[1]).toMatch(/^siniflar=[a-z,]*$/)
      expect(satirlar[2]).toMatch(/^neden=[^\n]+$/)
    }
  })

  it('GITHUB_OUTPUT YOK ({}, null, boş metin, undefined değer): dosyaya HİÇ yazılmaz; ekrana ::notice:: ve üç anahtar satırı', () => {
    for (const ortam of [{}, null, { GITHUB_OUTPUT: '' }, { GITHUB_OUTPUT: undefined }]) {
      const r = kos('docs/a.md\0', ortam)
      expect(r.yazimlar.every((y) => y.yol === null), JSON.stringify(ortam)).toBe(true)
      expect(r.ekran).toBe(
        '::notice::değişiklik sınıfı: belge — 1 dosyanın tümü dar sınıflarda: belge 1\n' +
          'sinif=belge\nsiniflar=belge\nneden=1 dosyanın tümü dar sınıflarda: belge 1\n',
      )
    }
  })

  it('çıktı dosya yolu ORTAMDAKİ GITHUB_OUTPUT değeridir (başka bir yol değil)', () => {
    const r = kos('docs/a.md\0', { GITHUB_OUTPUT: '/baska/cikti.txt' })
    expect(r.yazimlar.filter((y) => y.yol !== null).map((y) => y.yol)).toEqual(['/baska/cikti.txt'])
  })

  it('dönüş değeri saf fonksiyonla AYNI sonuç', () => {
    const r = kos('docs/a.md\0scripts/x.js\0')
    expect(r.sonuc).toEqual(M.siniflandir(['docs/a.md', 'scripts/x.js']))
  })
})

describe('komut satırı (sahte git): NUL ayrıştırma', () => {
  it('NUL ayraçlı çıktı yollara bölünür (boşluklu ve Türkçe adlar bozulmaz)', () => {
    const r = kos('docs/Çevre dosyası.md\0docs/b.md\0')
    expect(r.sonuc).toEqual({ sinif: 'belge', siniflar: ['belge'], neden: ['2 dosyanın tümü dar sınıflarda: belge 2'] })
  })

  it('SON NUL atılır ama ARADAKİ boş öğe korunur: "docs/a.md\\0\\0docs/b.md\\0" boş yol içerir → tam', () => {
    expect(kos('docs/a.md\0\0docs/b.md\0').sonuc.sinif).toBe('tam')
    expect(kos('\0').sonuc.sinif).toBe('tam')
    expect(kos('\0\0').sonuc.sinif).toBe('tam')
  })

  it('boş çıktı (değişiklik yok) → tam, neden "boş"', () => {
    expect(kos('').sonuc).toEqual({ sinif: 'tam', siniflar: [], neden: ['değişen dosya listesi boş: karar verilemez'] })
  })

  it.each([
    ['NUL ile BİTMEYEN çıktı (-z yok ya da kesik)', 'docs/a.md'],
    ['satır ayraçlı çıktı (-z düşmüş): tek yol', 'docs/a.md\n'],
    ['satır ayraçlı çıktı (-z düşmüş): iki yol', 'docs/a.md\nREADME.md\n'],
    ['KESİLMİŞ çıktı: mekanizma yolu betik gibi görünürdü', 'docs/a.md\0scripts/c'],
    ['CRLF ayraçlı', 'docs/a.md\r\n'],
  ])('%s → tam (belge/betik DEĞİL)', (_ad, cikti) => {
    const r = kos(cikti)
    expect(r.sonuc.sinif).toBe('tam')
    expect(r.dosya.startsWith('sinif=tam\nsiniflar=\n')).toBe(true)
  })

  it('NUL ile bitmeme nedeni söylenir; metin olmayan çıktı (undefined, null, sayı, Buffer, dizi, nesne) tam ve "metin değil"', () => {
    expect(kos('docs/a.md').sonuc.neden[0]).toContain('NUL ile bitmiyor')
    for (const cikti of [undefined, null, 42, Buffer.from('docs/a.md\0'), ['docs/a.md'], {}, true]) {
      const r = kos(cikti)
      expect(r.sonuc.sinif).toBe('tam')
      expect(r.sonuc.neden[0]).toContain('git çıktısı metin değil')
    }
  })

  it('yeniden adlandırma: ESKİ yol (src/a.ts) da listede olduğu için tam; yalnız yeni yol (docs/a.ts) olsaydı belge görünürdü (--no-renames bu yüzden şart)', () => {
    expect(kos('src/a.ts\0docs/a.ts\0').sonuc.sinif).toBe('tam')
    expect(kos('docs/a.ts\0').sonuc.sinif).toBe('belge')
  })

  it('2000 dosya → tam; 1999 → belge (sınır SPEC: 2000+)', () => {
    const uret = (n: number) => `${Array.from({ length: n }, (_v, i) => `docs/d${i}.md`).join('\0')}\0`
    expect(kos(uret(1999)).sonuc.sinif).toBe('belge')
    const r = kos(uret(2000))
    expect(r.sonuc.sinif).toBe('tam')
    expect(r.dosya).toBe('sinif=tam\nsiniflar=\nneden=2000 dosya değişmiş (sınır 2000): kaba sınıflama güvenilmez\n')
    expect(kos(uret(2500)).sonuc.sinif).toBe('tam')
  })
})

describe('komut satırı (sahte git): HER hata tam, ASLA fırlatmaz', () => {
  it('git Error fırlatırsa: tam, neden "okunamadı" ve git mesajını taşır', () => {
    const r = kos(new Error("fatal: ambiguous argument 'HEAD^1': unknown revision or path not in the working tree."))
    expect(r.sonuc).toEqual({
      sinif: 'tam',
      siniflar: [],
      neden: ["değişen dosyalar okunamadı (git diff HEAD^1 HEAD): fatal: ambiguous argument 'HEAD^1': unknown revision or path not in the working tree."],
    })
    expect(r.dosya.startsWith('sinif=tam\nsiniflar=\nneden=değişen dosyalar okunamadı')).toBe(true)
  })

  it.each<[string, unknown]>([
    ['dize', 'git yok'],
    ['undefined', undefined],
    ['null', null],
    ['sayı', 128],
    ['mesajı olmayan nesne', { code: 'ENOENT' }],
    ['dizi', ['x']],
  ])('git %s fırlatırsa → tam, fırlatma yok', (_ad, hata) => {
    const r = kosFonk(() => firlat(hata))
    expect(r.sonuc.sinif).toBe('tam')
    expect(r.sonuc.siniflar).toEqual([])
    expect(r.dosya.split('\n')[0]).toBe('sinif=tam')
  })

  it('mesajı okunurken de fırlayan hata nesnesi → tam, "bilinmeyen hata"', () => {
    const r = kosFonk(() =>
      firlat({
        get message(): string {
          throw new Error('getter')
        },
      }),
    )
    expect(r.sonuc.sinif).toBe('tam')
    expect(r.sonuc.neden[0]).toContain('bilinmeyen hata')
  })

  it('SPEC hata sayımı: git yok, HEAD^1 yok, sığ klon, zaman aşımı, tampon aşımı mesajları → hepsi `sinif=tam`', () => {
    for (const mesaj of [
      'spawnSync git ENOENT',
      'fatal: not a git repository (or any of the parent directories): .git',
      "fatal: ambiguous argument 'HEAD^1': unknown revision or path not in the working tree.",
      'fatal: bad revision HEAD^1',
      'spawnSync git ETIMEDOUT',
      'stdout maxBuffer length exceeded',
    ]) {
      const r = kos(new Error(mesaj))
      expect(r.dosya.startsWith('sinif=tam\n'), mesaj).toBe(true)
      expect(r.sonuc.neden[0], mesaj).toContain(mesaj)
    }
  })
})

describe('komut satırı (sahte git): çıktı ENJEKSİYONU', () => {
  it('git hata mesajında `\\n::error::x` ve `%0A`: neden TEK satır; `::`, `%` ve satır sonu kalmaz; dosyada tam 3 satır ve TEK `sinif=` satırı', () => {
    const r = kos(new Error('boom\n::error::x %0A %0D %25 ::notice::y\r\nsinif=belge'))
    const satirlar = r.dosya.split('\n')
    expect(satirlar).toHaveLength(4)
    expect(satirlar[0]).toBe('sinif=tam')
    expect(satirlar[2]).toMatch(/^neden=.+/)
    expect(satirlar[2]).not.toContain('::')
    expect(satirlar[2]).not.toContain('%')
    expect(r.dosya.split('\n').filter((l) => l.startsWith('sinif='))).toEqual(['sinif=tam'])
    expect(r.ekran.split('\n').filter((l) => l.startsWith('::'))).toHaveLength(1)
    expect(r.ekran).not.toContain('%')
  })

  it('YOL içinde satır sonu: `src/a\\n::error::x.ts` → tam; dosyada `::` yok, ekranda yalnız TEK iş akışı komutu (::notice::)', () => {
    const r = kos('docs/a.md\0src/a\n::error::x.ts\0')
    expect(r.sonuc.sinif).toBe('tam')
    expect(r.dosya.split('\n')).toHaveLength(4)
    expect(r.dosya).not.toContain('::')
    expect(r.ekran.split('\n').filter((l) => l.startsWith('::'))).toHaveLength(1)
  })

  it('YOL içinde sinif sahtekârlığı: `docs/a.md\\nsinif=belge` (kontrol karakteri) → tam, ikinci sinif= satırı üretilemez', () => {
    const r = kos('src/x.ts\0docs/a.md\nsinif=belge\0')
    expect(r.dosya.split('\n').filter((l) => l.startsWith('sinif='))).toEqual(['sinif=tam'])
    const r2 = kos('docs/a.md\nsinif=belge\0')
    expect(r2.dosya.split('\n').filter((l) => l.startsWith('sinif='))).toEqual(['sinif=tam'])
    expect(r2.dosya.split('\n')).toHaveLength(4)
  })

  it('KONTROL karakteri içermeyen ama `%0A` ve `::` içeren yol (geçerli dosya adı): neden `%` ve `::` taşımaz', () => {
    const r = kos('src/%0A::error::x.ts\0')
    expect(r.sonuc.sinif).toBe('tam')
    expect(r.sonuc.neden[0]).toContain('%0A::error::') // saf fonksiyonun nedeni ham yolu gösterir (kontrol karakteri yok)
    expect(r.dosya).not.toContain('%')
    expect(r.dosya).not.toContain('::')
    expect(r.ekran).not.toContain('%')
    expect(r.ekran.replace('::notice::', '')).not.toContain('::')
  })

  it('`:%:` silinen `%` ile `::` oluşturmaz (`%` önce silinir, `::` sonra sadeleşir); `:::::` tek `:` olur', () => {
    const r = kos(new Error('a:%:b ::::: c'))
    expect(r.dosya).not.toContain('::')
    expect(r.dosya).toContain('a:b : c')
  })

  it('çok uzun hata mesajı 300 karakterde kesilir (`…`), çıktı satırı sınırlıdır', () => {
    const r = kos(new Error('x'.repeat(5000)))
    const neden = r.dosya.split('\n')[2]
    expect(neden.startsWith('neden=')).toBe(true)
    expect(neden.length).toBeLessThan('neden='.length + 400)
    expect(neden.endsWith('…')).toBe(true)
  })

  it('satirTemizle: kontrol karakterleri boşluk, `%` silinir, `::` → `:`, sınır 300 (+…); sınırın altı olduğu gibi', () => {
    expect(M.satirTemizle('a\nb\rc\td\0e\x1bf\x7fg\x85h\u2028i\u2029j')).toBe('a b c d e f g h i j')
    expect(M.satirTemizle('100%')).toBe('100')
    expect(M.satirTemizle('%0A%0D')).toBe('0A0D')
    expect(M.satirTemizle('::error::x')).toBe(':error:x')
    expect(M.satirTemizle('a: b')).toBe('a: b')
    expect(M.satirTemizle(':%:')).toBe(':')
    expect(M.satirTemizle('düz Türkçe cümle: çğıöşü')).toBe('düz Türkçe cümle: çğıöşü')
    expect(M.satirTemizle('x'.repeat(300))).toBe('x'.repeat(300))
    expect(M.satirTemizle('x'.repeat(301))).toBe(`${'x'.repeat(300)}…`)
    expect(M.satirTemizle('')).toBe('')
  })
})

describe('komut satırı (sahte git): yazma hataları', () => {
  it('dosyaya yazma FIRLATIRSA: calistir fırlatmaz; ekrana ::warning:: ve üç anahtar satırı da basılır (çıktı kaybolmaz)', () => {
    const ekranlar: string[] = []
    const r = kosFonk(
      () => 'docs/a.md\0',
      { GITHUB_OUTPUT: CIKTI_YOLU },
      (yol, metin) => {
        if (yol !== null) throw new Error('EACCES: permission denied\n::error::x')
        ekranlar.push(metin)
      },
    )
    expect(r.sonuc.sinif).toBe('belge')
    expect(ekranlar).toHaveLength(1)
    expect(ekranlar[0]).toContain('::notice::değişiklik sınıfı: belge')
    expect(ekranlar[0]).toContain('::warning::GITHUB_OUTPUT yazılamadı (EACCES: permission denied :error:x)')
    expect(ekranlar[0]).toContain('sinif=belge\nsiniflar=belge\nneden=')
  })

  it('ekrana yazma da fırlatırsa: calistir yine fırlatmaz', () => {
    const patla = () => {
      throw new Error('EPIPE')
    }
    expect(() => kosFonk(() => 'docs/a.md\0', { GITHUB_OUTPUT: CIKTI_YOLU }, patla)).not.toThrow()
    expect(() => kosFonk(() => 'docs/a.md\0', {}, patla)).not.toThrow()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 8. KOMUT SATIRI — GERÇEK SÜREÇ ve GERÇEK GİT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
describe('komut satırı (gerçek süreç, gerçek git, geçici birleştirme commit’li depo; ağ YOK)', () => {
  let ev = ''
  let repo = ''
  let sayac = 0

  /** Dışarıdaki GIT_* değişkenleri (ör. bir git kancasından gelen GIT_DIR/GIT_INDEX_FILE) süreci başka depoya YÖNLENDİRMESİN. */
  const gitOrtami = (): Record<string, string> => {
    const env: Record<string, string> = {}
    for (const k of ['PATH', 'SystemRoot', 'TEMP', 'TMP', 'TMPDIR']) {
      const v = process.env[k]
      if (v !== undefined) env[k] = v
    }
    return { ...env, HOME: ev, USERPROFILE: ev, GIT_CONFIG_NOSYSTEM: '1', GIT_TERMINAL_PROMPT: '0' }
  }
  const git = (...args: string[]): string => {
    const r = spawnSync('git', args, { cwd: repo, encoding: 'utf8', env: gitOrtami(), timeout: 30_000 })
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} → ${r.status}: ${r.stderr}`)
    return r.stdout.trim()
  }
  /** HEAD'i `s-<ad>` birleşim commit'ine çevirir. Çalışma ağacı güncellenmez: betik YALNIZ `git diff HEAD^1 HEAD` (iki commit arası) okur, ağaca bakmaz. */
  const sec = (ad: string) => git('symbolic-ref', 'HEAD', `refs/heads/s-${ad}`)

  interface Degisim {
    yol: string
    /** `null` = dosya silinir. */
    icerik: string | null
  }
  /**
   * `git fast-import` akışı: bütün sahte geçmiş TEK git sürecinde kurulur (commit + checkout + merge başına süreç açmaktan yüzlerce kez ucuz; Windows'ta
   * süreç açmak pahalıdır ve bu dosya her koşuda kurulur). Üretilenler GERÇEK commit nesneleridir; birleşimler iki ebeveynlidir (merge-ref'in biçimi).
   */
  function akisKur() {
    const parcalar: string[] = []
    let isaret = 0
    const commit = (ref: string, mesaj: string, degisimler: Degisim[], from?: string, merge?: string): string => {
      const m = `:${++isaret}`
      parcalar.push(`commit ${ref}\nmark ${m}\ncommitter t <t@example.invalid> ${1_700_000_000 + isaret} +0000\ndata ${Buffer.byteLength(mesaj)}\n${mesaj}\n`)
      if (from) parcalar.push(`from ${from}\n`)
      if (merge) parcalar.push(`merge ${merge}\n`)
      for (const d of degisimler) {
        parcalar.push(d.icerik === null ? `D ${d.yol}\n` : `M 100644 inline ${d.yol}\ndata ${Buffer.byteLength(d.icerik)}\n${d.icerik}\n`)
      }
      parcalar.push('\n')
      return m
    }
    return { commit, metin: () => parcalar.join('') }
  }

  beforeAll(() => {
    ev = mkdtempSync(path.join(tmpdir(), 'degisiklik-sinifi-'))
    repo = path.join(ev, 'depo')
    mkdirSync(repo)
    git('init', '-q')
    git('symbolic-ref', 'HEAD', 'refs/heads/ana')
    for (const [k, v] of [
      ['user.name', 'test'],
      ['user.email', 'test@example.invalid'],
      ['commit.gpgsign', 'false'],
      ['core.autocrlf', 'false'],
      ['core.quotePath', 'true'], // varsayılan: ASCII dışı yollar `-z` olmadan tırnaklanıp sekizlik kaçışla yazılır
      ['diff.renames', 'true'], // varsayılan: taşınan dosya `--no-renames` olmadan YALNIZ yeni yoluyla görünür
    ]) {
      git('config', k, v)
    }
    const akis = akisKur()
    const ekle = (yol: string, icerik: string): Degisim => ({ yol, icerik })
    const A_TS = 'export const a = 1\nexport const ayrik = "a"\n'
    const ilk = akis.commit(
      'refs/heads/ana',
      'ilk',
      [
        ekle('README.md', 'ilk\n'),
        ekle('docs/a.md', 'a\n'),
        ekle('src/a.ts', A_TS),
        // `src/` içinde YERİNDE KALAN ikinci dosya: `a.ts` tek dosya olsaydı `docs/`a taşınması git'in "dizin yeniden adlandırma" sezgisini
        // tetikler ve gerçek bir `git merge` tabandaki yeni `src/ilerledi.ts`i de `docs/` altına yönlendirmeye çalışıp ÇAKIŞIRDI.
        ekle('src/b.ts', 'export const b = 2\nexport const tamamenFarkli = "b"\n'),
        ekle('scripts/ci/x.cjs', "'use strict'\n"),
        ekle('scripts/db/y.ts', 'export {}\n'),
        ekle('supabase/functions/f/index.ts', 'export {}\n'),
        ekle('package.json', '{}\n'),
      ],
    )
    // TABAN ilerler ve KAYNAK koda dokunur: yanlış ebeveyne karşı alınan bir fark (HEAD^2..HEAD) bu değişikliği görür ve belge PR'ını TAM yapardı.
    const tabanUcu = akis.commit('refs/heads/ana', 'taban ilerledi', [ekle('src/ilerledi.ts', 'export const taban = 1\n')], ilk)
    /** PR dalı `ilk`ten dallanır; `s-<ad>` = GERÇEK birleşim commit'i: birinci ebeveyn taban ucu, ikinci PR ucu (merge-ref'in aynısı). */
    const senaryo = (ad: string, degisimler: Degisim[]) => {
      const prUcu = akis.commit(`refs/heads/pr-${ad}`, `pr ${ad}`, degisimler, ilk)
      akis.commit(`refs/heads/s-${ad}`, `birlesim ${ad}`, degisimler, tabanUcu, prUcu)
    }
    senaryo('belge', [ekle('docs/yeni.md', 'x\n'), ekle('README.md', 'degisti\n')])
    senaryo('belge-src', [ekle('docs/b.md', 'b\n'), ekle('src/a.ts', 'export const a = 2\n')])
    senaryo('ci-betigi', [ekle('scripts/ci/x.cjs', "'use strict'\n// degisti\n")])
    senaryo('tasima', [{ yol: 'src/a.ts', icerik: null }, ekle('docs/a.ts', A_TS)]) // aynı içerik: git bunu yeniden adlandırma olarak görür
    senaryo('turkce', [ekle('docs/Çevre dosyası.md', 'x\n')])
    senaryo('karma', [ekle('docs/c.md', 'c\n'), ekle('scripts/db/y.ts', 'export const y = 1\n')])
    senaryo('edge-belge', [ekle('README.md', 'edge\n'), ekle('supabase/functions/f/index.ts', 'export const f = 1\n')])
    senaryo('yalniz-edge', [ekle('supabase/functions/f/index.ts', 'export const f = 2\n')])
    senaryo('yalniz-betik', [ekle('scripts/db/y.ts', 'export const y = 2\n')])
    senaryo('bos', []) // PR'ın tek commit'i boş: birleşimin ağacı tabanınkiyle aynı
    senaryo('migration', [ekle('docs/m.md', 'm\n'), ekle('supabase/migrations/20260101000000_x.sql', 'select 1;\n')])
    senaryo('kok-json', [ekle('package.json', '{"name":"x"}\n')])
    senaryo('silme', [{ yol: 'src/a.ts', icerik: null }])
    senaryo('yuzde-adi', [ekle('src/%0Ax.ts', 'x\n')]) // `%` geçerli dosya adı karakteridir (Windows dahil); `:` değildir, o sahte git testlerinde
    const ice = spawnSync('git', ['fast-import', '--quiet'], { cwd: repo, input: Buffer.from(akis.metin(), 'utf8'), env: gitOrtami(), timeout: 60_000 })
    if (ice.status !== 0) throw new Error(`git fast-import → ${ice.status}: ${String(ice.stderr)}`)
  }, 120_000)

  afterAll(() => {
    try {
      rmSync(ev, { recursive: true, force: true })
    } catch {
      /* geçici dizin; kalırsa os.tmpdir'dedir (Windows'ta salt-okunur git nesneleri) */
    }
  })

  /** `dal`ı çıkarıp betiği GERÇEK süreçte koşar. `GITHUB_OUTPUT` verilmezse dosyalı çıktı kurulur; `ek` ortamı ezer (`undefined` = sil). */
  function kosCli(dal: string | null, ek: Record<string, string | undefined> = {}, cwd?: string) {
    if (dal !== null) sec(dal)
    const cikti = path.join(ev, `cikti-${sayac++}.txt`)
    const env: Record<string, string> = { ...gitOrtami(), GITHUB_OUTPUT: cikti }
    for (const [k, v] of Object.entries(ek)) {
      if (v === undefined) delete env[k]
      else env[k] = v
    }
    const r = spawnSync(process.execPath, [BETIK], { cwd: cwd ?? repo, encoding: 'utf8', env, timeout: 60_000 })
    let dosya = ''
    try {
      dosya = readFileSync(env.GITHUB_OUTPUT ?? cikti, 'utf8')
    } catch {
      dosya = ''
    }
    return { durum: r.status, stdout: r.stdout, stderr: r.stderr, dosya }
  }
  const anahtarlar = (dosya: string): Record<string, string> =>
    Object.fromEntries(
      dosya
        .split('\n')
        .filter(Boolean)
        .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]),
    )

  it('belge-yalnız PR (docs/ + README.md) → `belge`; taban ilerlemesi (src/ilerledi.ts) PR farkına GİRMEZ (HEAD^1..HEAD, HEAD^2..HEAD DEĞİL)', () => {
    const r = kosCli('belge')
    expect(r.durum).toBe(0)
    expect(r.dosya).toMatch(/^sinif=belge\nsiniflar=belge\nneden=2 dosyanın tümü dar sınıflarda: belge 2\n$/)
    expect(r.stdout).toContain('::notice::değişiklik sınıfı: belge')
    expect(r.stderr).toBe('')
  }, 60_000)

  it('belge + src PR → `tam`', () => {
    const r = kosCli('belge-src')
    expect(r.durum).toBe(0)
    expect(r.dosya).toMatch(/^sinif=tam\nsiniflar=\nneden='src\/a\.ts' dar sınıflarda değil: küresel\/mekanizma yolu \(src\/\)\n$/)
  }, 60_000)

  it('yalnız scripts/ci/x.cjs değişen PR → `tam` (mekanizma, scripts/ betik kuralının altında DEĞİL)', () => {
    const r = kosCli('ci-betigi')
    expect(r.durum).toBe(0)
    expect(r.dosya).toMatch(/^sinif=tam\nsiniflar=\nneden='scripts\/ci\/x\.cjs' dar sınıflarda değil: küresel\/mekanizma yolu \(scripts\/ci\/\)\n$/)
  }, 60_000)

  it('`--no-renames`: kaynak koddan belgeye TAŞIMA (src/a.ts → docs/a.ts) → `tam`; rename tespiti açık kalsaydı yalnız docs/a.ts görünür ve `belge` çıkardı', () => {
    const r = kosCli('tasima')
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya).sinif).toBe('tam')
    expect(anahtarlar(r.dosya).neden).toContain("'src/a.ts'")
    // Aynı fark `--no-renames` OLMADAN: git yeniden adlandırmayı tek satıra indirir ve ESKİ yol kaybolur (bu testin neden var olduğunu kanıtlar)
    expect(git('diff', '--name-only', 'HEAD^1', 'HEAD')).toBe('docs/a.ts')
  }, 60_000)

  it('`-z`: Türkçe karakterli ve boşluklu yol (docs/Çevre dosyası.md) → `belge`; `-z` olmadan git yolu TIRNAKLAR ve tırnaklı yol dar sınıfa girmezdi', () => {
    const r = kosCli('turkce')
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya)).toMatchObject({ sinif: 'belge', siniflar: 'belge' })
    const tirnakli = git('diff', '--name-only', 'HEAD^1', 'HEAD')
    expect(tirnakli.startsWith('"')).toBe(true)
    expect(M.siniflandir([tirnakli]).sinif).toBe('tam')
  }, 60_000)

  it('karma: docs + scripts/db → `karma`, `siniflar=belge,betik`', () => {
    const r = kosCli('karma')
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya)).toMatchObject({ sinif: 'karma', siniflar: 'belge,betik' })
  }, 60_000)

  it('README.md (kök belge) + supabase/functions → `karma`, `siniflar=belge,edge`; yalnız edge → `edge`; yalnız scripts/db → `betik`', () => {
    expect(anahtarlar(kosCli('edge-belge').dosya)).toMatchObject({ sinif: 'karma', siniflar: 'belge,edge' })
    expect(anahtarlar(kosCli('yalniz-edge').dosya)).toMatchObject({ sinif: 'edge', siniflar: 'edge' })
    expect(anahtarlar(kosCli('yalniz-betik').dosya)).toMatchObject({ sinif: 'betik', siniflar: 'betik' })
  }, 60_000)

  it('boş PR (birleşimin ağacı tabanla aynı) → `tam`, neden "boş"; kök package.json ve supabase/migrations → `tam`; silinen src dosyası → `tam`', () => {
    expect(anahtarlar(kosCli('bos').dosya)).toMatchObject({ sinif: 'tam', neden: 'değişen dosya listesi boş: karar verilemez' })
    expect(anahtarlar(kosCli('migration').dosya).sinif).toBe('tam')
    expect(anahtarlar(kosCli('kok-json').dosya).sinif).toBe('tam')
    expect(anahtarlar(kosCli('silme').dosya).sinif).toBe('tam')
  }, 60_000)

  it('dosya adında `%0A` (geçerli ad) olan tam PR: çıktıda `%` yok (silinir), tam üç satır; ad `src/0Ax.ts` olarak görünür', () => {
    const r = kosCli('yuzde-adi')
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya).sinif).toBe('tam')
    expect(anahtarlar(r.dosya).neden).toContain("'src/0Ax.ts'")
    expect(r.dosya.split('\n')).toHaveLength(4)
    expect(r.dosya).not.toContain('%')
    expect(r.stdout).not.toContain('%')
  }, 60_000)

  it('GITHUB_OUTPUT mevcut içeriğin SONUNA eklenir (başka adımların satırları silinmez)', () => {
    sec('belge')
    const cikti = path.join(ev, 'onceden-dolu.txt')
    writeFileSync(cikti, 'onceki=deger\n')
    const r = kosCli(null, { GITHUB_OUTPUT: cikti })
    expect(r.durum).toBe(0)
    expect(readFileSync(cikti, 'utf8')).toMatch(/^onceki=deger\nsinif=belge\nsiniflar=belge\nneden=.+\n$/)
  }, 60_000)

  it('GITHUB_OUTPUT YOK: yalnız stdout (::notice:: ve üç anahtar satırı), çıkış 0', () => {
    sec('belge')
    const r = kosCli(null, { GITHUB_OUTPUT: undefined })
    expect(r.durum).toBe(0)
    expect(r.stdout).toMatch(/^::notice::değişiklik sınıfı: belge — .+\nsinif=belge\nsiniflar=belge\nneden=.+\n$/)
  }, 60_000)

  it('GITHUB_OUTPUT yazılamayan bir yer (var olmayan dizin): çıkış YİNE 0, stdout ::warning:: ve anahtar satırlarını taşır', () => {
    sec('belge')
    const r = kosCli(null, { GITHUB_OUTPUT: path.join(ev, 'yok-dizin', 'alt', 'cikti.txt') })
    expect(r.durum).toBe(0)
    expect(r.stdout).toContain('::warning::GITHUB_OUTPUT yazılamadı')
    expect(r.stdout).toContain('sinif=belge\nsiniflar=belge\n')
  }, 60_000)

  it('HATA: HEAD^1 olmayan depo (tek commit) → `tam`, çıkış 0', () => {
    const tek = path.join(ev, 'tek-commit')
    mkdirSync(tek)
    const g = (...args: string[]) => {
      const r = spawnSync('git', args, { cwd: tek, encoding: 'utf8', env: gitOrtami(), timeout: 30_000 })
      if (r.status !== 0) throw new Error(`git ${args.join(' ')} → ${r.stderr}`)
    }
    g('init', '-q')
    g('config', 'user.name', 't')
    g('config', 'user.email', 't@example.invalid')
    g('config', 'commit.gpgsign', 'false')
    writeFileSync(path.join(tek, 'a.md'), 'a\n')
    g('add', '-A')
    g('commit', '-q', '-m', 'tek')
    const r = kosCli(null, {}, tek)
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya).sinif).toBe('tam')
    expect(anahtarlar(r.dosya).neden).toContain('değişen dosyalar okunamadı')
  }, 60_000)

  it('HATA: git deposu olmayan dizin → `tam`, çıkış 0', () => {
    const bos = path.join(ev, 'git-degil')
    mkdirSync(bos)
    // Tavan: git, geçici dizinin üstündeki (varsa) bir depoyu bulup yanlışlıkla başarıyla koşmasın.
    const r = kosCli(null, { GIT_CEILING_DIRECTORIES: ev }, bos)
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya).sinif).toBe('tam')
    expect(anahtarlar(r.dosya).neden).toContain('değişen dosyalar okunamadı')
  }, 60_000)

  it('HATA: git ÇALIŞTIRILAMIYOR (PATH boş dizin) → `tam`, çıkış 0', () => {
    const bosYol = path.join(ev, 'bos-yol')
    mkdirSync(bosYol)
    const r = kosCli('belge', { PATH: bosYol })
    expect(r.durum).toBe(0)
    expect(anahtarlar(r.dosya).sinif).toBe('tam')
    expect(anahtarlar(r.dosya).neden).toContain('değişen dosyalar okunamadı')
  }, 60_000)

  it('`main` son sigortası: calistir FIRLARSA bile çıkış 0, `sinif=tam` yazılır (kapı sessiz kalmaz) ve çıktı enjeksiyonu temizlenir', () => {
    const cikti = path.join(ev, 'sigorta.txt')
    const r = spawnSync(
      process.execPath,
      ['-e', `const M = require(${JSON.stringify(BETIK)}); M.main(() => { throw new Error('patladi\\n::error::x %0A') })`],
      { cwd: repo, encoding: 'utf8', env: { ...gitOrtami(), GITHUB_OUTPUT: cikti }, timeout: 60_000 },
    )
    expect(r.status).toBe(0)
    expect(readFileSync(cikti, 'utf8')).toMatch(/^sinif=tam\nsiniflar=\nneden=beklenmeyen hata: patladi :error:x 0A\n$/)
    expect(r.stdout).toContain('::notice::değişiklik sınıfı: tam — beklenmeyen hata')
    // GITHUB_OUTPUT yokken de çıkış 0 ve anahtar satırları stdout'ta
    const r2 = spawnSync(process.execPath, ['-e', `const M = require(${JSON.stringify(BETIK)}); M.main(() => { throw 'dize' })`], {
      cwd: repo,
      encoding: 'utf8',
      env: gitOrtami(),
      timeout: 60_000,
    })
    expect(r2.status).toBe(0)
    expect(r2.stdout).toMatch(/^sinif=tam\nsiniflar=\nneden=beklenmeyen hata: dize\n::notice::/)
  }, 60_000)

  it('`main` normal yolda calistir’ı çağırır ve fırlatmaz (varsayılan: gerçek git, gerçek ortam)', () => {
    sec('belge')
    const cikti = path.join(ev, 'main-normal.txt')
    const r = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(BETIK)}).main()`], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...gitOrtami(), GITHUB_OUTPUT: cikti },
      timeout: 60_000,
    })
    expect(r.status).toBe(0)
    expect(readFileSync(cikti, 'utf8')).toMatch(/^sinif=belge\n/)
  }, 60_000)

  it('modül `require` edilince KENDİLİĞİNDEN koşmaz (yalnız `node betik.cjs` koşar): require çıktısı boş', () => {
    const cikti = path.join(ev, 'require-sessiz.txt')
    const r = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(BETIK)})`], {
      cwd: repo,
      encoding: 'utf8',
      env: { ...gitOrtami(), GITHUB_OUTPUT: cikti },
      timeout: 60_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
    expect(() => readFileSync(cikti, 'utf8')).toThrow()
  }, 60_000)
})
