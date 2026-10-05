/**
 * TSR-9 Faz 2b — YENİ_GORUNUM anahtarı: kapalıyken fark 0, açıkken yeni görünüm (TASARIM'ın kendi kapısı).
 *
 * Plan: docs/plans/tasarim-kod-plani-v2.2-2026-10-05.md §1.1 (anahtar), §1.2 (mekanizma: kapsamlı
 * üzerine yazma + üç aile `preload: false` + body sınıfı), §1.3 (kapalı = fark 0), §1.4 (admin dondurma).
 *
 * ÖLÇTÜĞÜ:
 *  (a) bayrak KAPALIyken `<body>` sınıfı bugünkü (`inter.variable inter.className`) ve `<html>`de
 *      `data-gorunum` / `class` YOK;
 *  (b) bayrak AÇIKken `data-gorunum="yeni"`, body = Archivo `className`, `<html>` üç `variable` sınıfı;
 *  (c) üç yeni aile `preload: false` ile (ve `latin-ext`, çakışmayan `variable` adıyla) tanımlı;
 *  (d) `index.css` `:root` içindeki çakışan küme DEĞERLERİ değişmedi, kapsamlı blok `var(--marka-*)`
 *      takma adı kullanıyor (literal değil) ve YALNIZ `:root[data-gorunum='yeni']` seçicisinde;
 *  (e) admin yerleşimi kendi Inter'ini (kökle AYNI yapılandırma) `variable` + `className` birlikte taşır;
 *  (f) `[data-admin-theme]` bloğu `--primary-navy`/`--brand-cyan`'ı eski değerlere sabitliyor;
 *  (g) Tailwind `font-mono`/`font-serif` `var(--ad, <varsayılan yığın>)` biçiminde (kapalıyken eski yığın).
 *
 * ÖLÇMEDİĞİ — adıyla:
 *  ⛔ Gerçek tarayıcıda computed `font-family` ve üretilen CSS/HTML farkı: derleme + tarayıcı ölçümüdür
 *     (PR gövdesinde sayıyla). jsdom `index.css`i ve next/font'u çalıştırmaz.
 *  ⛔ `preload` bağlantısının HTML'e basılması: Windows'ta `next-font-manifest` boş çıkar; Linux/CI ölçümü.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import tailwindConfig from '../../../tailwind.config.js'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')
const yorumsuz = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, ' ')

/* ── next/font/google: çağrı seçeneklerini yakalayan sahte (gerçek yükleyici yalnız derlemede çalışır) ── */
type FontSecenekleri = { variable?: string; preload?: boolean; subsets?: string[]; weight?: string[]; display?: string }
const cagrilar: Array<{ aile: string; secenek: FontSecenekleri }> = []
vi.mock('next/font/google', () => {
  const uret = (aile: string) => (secenek: FontSecenekleri) => {
    cagrilar.push({ aile, secenek })
    return { variable: `var-${aile}`, className: `cls-${aile}` }
  }
  return {
    Inter: uret('Inter'),
    Archivo: uret('Archivo'),
    Source_Serif_4: uret('SourceSerif4'),
    IBM_Plex_Mono: uret('PlexMono'),
  }
})
vi.mock('../../components/layout/ClientLayout', () => ({
  ClientLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Providers: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock('@vercel/analytics/next', () => ({ Analytics: () => null }))
vi.mock('../../index.css', () => ({}))

async function kokDuzeni(acik: boolean) {
  vi.resetModules()
  cagrilar.length = 0
  vi.doMock('@/config/features', () => ({ YENI_GORUNUM: acik }))
  const { default: RootLayout } = await import('../../app/layout')
  const html = renderToStaticMarkup(<RootLayout>{<p>x</p>}</RootLayout>)
  return { html, cagrilar: [...cagrilar] }
}

describe('TSR-9 (a)(b) · kök yerleşim: bayrak kapalı = bugünkü, açık = yeni', () => {
  beforeEach(() => {
    vi.resetModules()
  })
  afterEach(() => {
    vi.doUnmock('@/config/features')
    vi.resetModules()
  })

  it('(a) KAPALI: body sınıfı bugünkü (Inter variable + className), html\'de data-gorunum ve class YOK', async () => {
    const { html } = await kokDuzeni(false)
    expect(html).toMatch(/<body class="var-Inter cls-Inter">/)
    expect(html, 'kapalıyken <html> data-gorunum basmamalı').not.toContain('data-gorunum')
    expect(html, 'kapalıyken <html> hiçbir sınıf taşımamalı (bugün de taşımıyor)').toMatch(
      /^<html lang="tr" data-scroll-behavior="smooth">/,
    )
    expect(html, 'kapalıyken Archivo sınıfı HTML\'e sızmamalı').not.toContain('Archivo')
  })

  it('(b) AÇIK: data-gorunum="yeni", body = Archivo className, html = üç variable sınıfı, Inter sınıfı body\'de YOK', async () => {
    const { html } = await kokDuzeni(true)
    expect(html).toContain('data-gorunum="yeni"')
    expect(html).toMatch(/<html[^>]*class="var-Archivo var-SourceSerif4 var-PlexMono"/)
    expect(html).toMatch(/<body class="cls-Archivo">/)
    expect(html, 'variable ile className BİRLİKTE değişir: Inter body\'de kalmamalı').not.toMatch(/<body[^>]*Inter/)
  })

  it('(c) üç yeni aile `preload: false`, latin + latin-ext, çakışmayan variable adıyla tanımlı (bayrak durumundan bağımsız)', async () => {
    for (const acik of [false, true]) {
      const { cagrilar: c } = await kokDuzeni(acik)
      const yeni = c.filter((x) => x.aile !== 'Inter')
      expect(yeni.map((x) => x.aile).sort(), 'üç yeni aile tanımlı olmalı').toEqual(['Archivo', 'PlexMono', 'SourceSerif4'])
      for (const { aile, secenek } of yeni) {
        expect(secenek.preload, `${aile}: preload false olmalı (true kapalıyken de HTML'e <link rel=preload> basar; S1)`).toBe(false)
        expect(secenek.subsets, `${aile}: Türkçe karakter için latin-ext`).toEqual(['latin', 'latin-ext'])
        expect(secenek.variable, `${aile}: variable adı --font-sans ile çakışmamalı`).toMatch(/^--font-(archivo|source-serif|plex-mono)$/)
      }
      const inter = c.find((x) => x.aile === 'Inter')
      expect(inter?.secenek, 'kök Inter tanımı AYNEN kalır (kapalı = fark 0)').toEqual({
        subsets: ['latin'],
        display: 'swap',
        variable: '--font-sans',
      })
    }
  })
})

/* ── CSS ayrıştırma ── */
const CSS = yorumsuz(oku('src', 'index.css'))

function blok(css: string, baslangic: RegExp): string {
  const m = baslangic.exec(css)
  if (!m) return ''
  let derinlik = 0
  const bas = m.index + m[0].length
  for (let i = bas; i < css.length; i++) {
    if (css[i] === '{') derinlik++
    else if (css[i] === '}') {
      if (derinlik === 0) return css.slice(bas, i)
      derinlik--
    }
  }
  return ''
}
const deger = (b: string, ad: string) => new RegExp(`(?:^|[\\s;{])${ad}\\s*:\\s*([^;]+);`).exec(b)?.[1].trim() ?? null

describe('TSR-9 (d) · :root değerleri değişmedi, kapsamlı blok takma ad kullanıyor', () => {
  const KOK_BLOGU = blok(CSS, /(^|\n)\s*:root\s*\{/)
  const KAPSAM = blok(CSS, /:root\[data-gorunum='yeni'\]\s*\{/)

  it('stale-guard: bloklar okunabildi', () => {
    expect(KOK_BLOGU.length).toBeGreaterThan(500)
    expect(KAPSAM.length).toBeGreaterThan(50)
  })

  it.each([
    ['--primary-navy', '226 71% 40%'],
    ['--brand-cyan', '189 78% 53%'],
    ['--action-terracotta-deep', '24.4 91% 39.2%'],
    ['--radius', '0.5rem'],
  ])('%s :root değeri bugünkü (%s) — çevirme yalnız data-gorunum kapsamında', (ad, beklenen) => {
    expect(deger(KOK_BLOGU, ad)).toBe(beklenen)
  })

  it(':root içinde font ailesi adı (--font-serif/--font-mono) TANIMLI DEĞİL (yalnız kapsamlı blokta doğar)', () => {
    expect(deger(KOK_BLOGU, '--font-serif')).toBeNull()
    expect(deger(KOK_BLOGU, '--font-mono')).toBeNull()
  })

  it('kapsamlı blok: renkler var(--marka-*) TAKMA ADI (literal değil), --radius 0, üç font ailesi DS dizesiyle', () => {
    expect(deger(KAPSAM, '--primary-navy')).toBe('var(--marka-lacivert)')
    expect(deger(KAPSAM, '--brand-cyan')).toBe('var(--marka-turkuaz)')
    expect(deger(KAPSAM, '--radius')).toBe('0')
    expect(deger(KAPSAM, '--font-sans')).toBe("var(--font-archivo), system-ui, -apple-system, 'Helvetica Neue', sans-serif")
    expect(deger(KAPSAM, '--font-serif')).toBe('var(--font-source-serif), Georgia, serif')
    expect(deger(KAPSAM, '--font-mono')).toBe('var(--font-plex-mono), ui-monospace, monospace')
    expect(KAPSAM, 'kapsamlı blokta ham HEX / hsl literal olmamalı').not.toMatch(/#[0-9a-fA-F]{3,8}\b|\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%/)
  })

  it('kapsamlı seçici yalnız :root[data-gorunum=\'yeni\'] (kapalıyken hiçbir öğeyle eşleşmez); --action-terracotta-deep ATLANDI', () => {
    expect(CSS.match(/data-gorunum/g)?.length, 'index.css başka yerde data-gorunum seçmemeli').toBe(1)
    expect(deger(KAPSAM, '--action-terracotta-deep'), 'site değeri kazanır (v2.1 §2.2)').toBeNull()
  })

  it('--marka-lacivert / --marka-turkuaz :root\'ta tanımlı (takma adın hedefi var)', () => {
    expect(deger(KOK_BLOGU, '--marka-lacivert')).not.toBeNull()
    expect(deger(KOK_BLOGU, '--marka-turkuaz')).not.toBeNull()
  })
})

describe('TSR-9 (e)(f) · admin dondurma', () => {
  const ADMIN = oku('src', 'app', 'admin', 'layout.tsx')
  const ADMIN_GOVDE = yorumsuz(ADMIN).replace(/^\s*\/\/.*$/gm, '')

  it('(e) admin yerleşimi KENDİ Inter nesnesini kökle AYNI yapılandırmayla tanımlar', () => {
    expect(ADMIN_GOVDE).toMatch(/from 'next\/font\/google'/)
    expect(ADMIN_GOVDE).toContain("Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })")
    const kok = yorumsuz(oku('src', 'app', 'layout.tsx'))
    expect(kok, 'kök Inter tanımı (admin ile AYNI) yerinde').toContain("Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' })")
  })

  it('(e) variable VE className birlikte uygulanıyor (biri tek başına yetmez: className font-family\'yi doğrudan yazar)', () => {
    expect(ADMIN_GOVDE).toMatch(/className=\{`\$\{inter\.variable\} \$\{inter\.className\}[^`]*`\}/)
  })

  it('(f) [data-admin-theme] --primary-navy ve --brand-cyan\'ı ESKİ değerlere sabitliyor (--font-sans burada sabitlenemez)', () => {
    const b = blok(CSS, /\[data-admin-theme\]\s*\{/)
    expect(deger(b, '--primary-navy')).toBe('226 71% 40%')
    expect(deger(b, '--brand-cyan')).toBe('189 78% 53%')
    expect(deger(b, '--font-sans'), 'Inter\'in üretilmiş adı CSS\'ten bilinemez; admin yerleşimi taşır').toBeNull()
  })

  it('(f) [data-admin-theme] --font-mono/--font-serif\'i Tailwind VARSAYILAN yığınına sabitliyor (admin font-mono bayrak açıkken Plex Mono olmasın)', async () => {
    const { default: varsayilan } = await import('tailwindcss/defaultTheme')
    const b = blok(CSS, /\[data-admin-theme\]\s*\{/)
    // CSS'te yığın tırnaklı yazılı; `defaultTheme` ile birebir aynı sıra
    expect(deger(b, '--font-mono')).toBe(varsayilan.fontFamily.mono.join(', '))
    expect(deger(b, '--font-serif')).toBe(varsayilan.fontFamily.serif.join(', '))
  })

  it('(f) sabit değerler :root\'takiyle AYNI (kapalıyken kalıtımla zaten bu değerler → admin\'de fark 0)', () => {
    const kok = blok(CSS, /(^|\n)\s*:root\s*\{/)
    const admin = blok(CSS, /\[data-admin-theme\]\s*\{/)
    for (const ad of ['--primary-navy', '--brand-cyan']) {
      expect(deger(admin, ad), ad).toBe(deger(kok, ad))
    }
  })
})

describe('TSR-9 (g) · Tailwind font-mono/serif: tanımsız değişkende eski yığın (plan §1.2 Tuzak)', () => {
  const extend = ((tailwindConfig as { theme?: { extend?: { fontFamily?: Record<string, string[]> } } }).theme?.extend ?? {})
  const aileler = extend.fontFamily ?? {}

  it('mono: var(--font-mono, <Tailwind varsayılan mono yığını>) — yığın birebir eski', async () => {
    const { default: varsayilan } = await import('tailwindcss/defaultTheme')
    expect(aileler.mono).toEqual([`var(--font-mono, ${varsayilan.fontFamily.mono.join(', ')})`])
  })

  it('serif: var(--font-serif, <Tailwind varsayılan serif yığını>)', async () => {
    const { default: varsayilan } = await import('tailwindcss/defaultTheme')
    expect(aileler.serif).toEqual([`var(--font-serif, ${varsayilan.fontFamily.serif.join(', ')})`])
  })

  it('sans bugünkü gibi (var(--font-sans), system-ui, sans-serif) ve theme altında yalnız extend', () => {
    expect(aileler.sans).toEqual(['var(--font-sans)', 'system-ui', 'sans-serif'])
    expect(Object.keys((tailwindConfig as { theme?: Record<string, unknown> }).theme ?? {})).toEqual(['extend'])
  })
})
