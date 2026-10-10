/**
 * OPS-53 Faz 2a — DS takma adları GÖRÜNMEZ ve TEK KAYNAKTA (TASARIM'ın kendi kapısı).
 *
 * NİÇİN VAR (plan: docs/plans/tasarim-kod-plani-v2.2-2026-10-05.md §2 Salı/TOK ve
 * v2.1 §2.1/§2.2; PR #1700):
 * Design System'in renk adları koda iki kapıyla iner. Faz 2a yalnız GÖRÜNMEZ olanı
 * ekler: değeri sitede zaten bulunan DS adları mevcut tokene TAKMA AD olur (K1),
 * değeri sitede olmayanlar `:root`ta TEK literal olarak yazılır (K2). Çakışan küme
 * (`primary-navy`, `brand-cyan`, `action-terracotta-deep`) DOKUNULMAZ — görünür
 * dönüşüm Faz 2b'dir ve `:root` değerlerini DEĞİŞTİRMEZ (çevirme `data-gorunum`
 * kapsamlı üzerine yazmadır; v2.2 §1.2). Bu dosya bu üç cümleyi koda bağlar.
 *
 * ÖLÇTÜĞÜ:
 *  1. K1 takma adları `var(--hedef)` biçiminde, hedef `:root`ta tanımlı ve çözülmüş
 *     renk DS değerine ≤2 kanal farkla eşit (HSL→HEX çevrimiyle, dize değil).
 *  2. K2 literalleri DS'in 2026-09-14 sürümünden okunan değerle birebir ve HSL üçlüsü.
 *  3. Her yeni ad `index.css`te TAM BİR KEZ tanımlı (ikinci tanım = ikinci kaynak).
 *  4. Çakışan kümenin `:root` değerleri DEĞİŞMEMİŞ (anahtar kapalıyken fark 0).
 *  5. Tailwind her yeni adı `hsl(var(--ad) / <alpha-value>)` ile, TEK kez bağlar.
 *  6. `tailwind.config.js` `theme` altında yalnız `extend` taşır — `spacing`/`colors`/
 *     `fontFamily` doğrudan yazılırsa varsayılan ölçek SİLİNİR (red-team §2.6).
 *
 * ÖLÇMEDİĞİ — adıyla, gizlenmiyor:
 *  ⛔ "Diff yalnız ekleme" (silinen satır 0) ve "üretilen CSS'te yalnız yeni custom
 *     property satırları farklı" bir dosya içeriği değil GİT/DERLEME ölçümüdür; PR
 *     gövdesinde sayıyla yazılır, bu test onu kanıtlayamaz.
 *  ⛔ KONTRAST. jsdom'da ölçülemez (`index.css` import edilmiyor; axe `color-contrast`
 *     koşmaz). Takma adların kontrastı gerçek tarayıcıda, tüketici doğduğunda ölçülür.
 *  ⛔ DS'in kendi sürümünün güncelliği (CI Design'a erişemez). Kopya↔türev tutarlılığı
 *     INV-TOKEN-PARITE-1'in işidir (ALTYAPI); bu dosya yalnız bu fazda eklenen adları tutar.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import tailwindConfig from '../../../tailwind.config.js'

const KOK = process.cwd()
const INDEX_CSS = readFileSync(join(KOK, 'src', 'index.css'), 'utf8')
const TAILWIND = readFileSync(join(KOK, 'tailwind.config.js'), 'utf8')

/** K1 — değeri sitede aynı olan DS adı → mevcut tokene takma ad. `dsHex`: DS'in değeri (kapıdaki kaynak kimliği). */
const K1: ReadonlyArray<{ ad: string; hedef: string; dsHex: string }> = [
  { ad: '--action-terracotta', hedef: '--marka-kiremit', dsHex: '#D95D0E' },
  { ad: '--warn-amber', hedef: '--marka-amber', dsHex: '#F59E0B' },
  { ad: '--text-strong', hedef: '--marka-lacivert', dsHex: '#1B2C4B' },
  { ad: '--text-on-dark', hedef: '--clean-white', dsHex: '#FFFFFF' },
  // DS 220 9% 46% = site steel-gray; INV-PALET-1 4. kol takma adı serbest bıraktı (ALT-30, #1707)
  { ad: '--text-muted', hedef: '--steel-gray', dsHex: '#6B7280' },
]

/** K2 — değeri sitede olmayan DS adı → `:root`ta TEK literal (DS 2026-09-14, okuma 2026-10-05). */
const K2: ReadonlyArray<{ ad: string; deger: string }> = [
  { ad: '--accent-air-green', deger: '100 61% 30%' },
  { ad: '--text-body', deger: '218 17% 35%' },
  { ad: '--text-on-dark-muted', deger: '215 26% 65%' },
]

/** Çakışan küme — 2a'da DOKUNULMAZ; `:root` değeri hiçbir fazda DS'e çevrilmez (v2.2 §1.2). */
const CAKISAN_KUME: ReadonlyArray<{ ad: string; deger: string }> = [
  { ad: '--primary-navy', deger: '226 71% 40%' },
  { ad: '--brand-cyan', deger: '189 78% 53%' },
  { ad: '--action-terracotta-deep', deger: '24.4 91% 39.2%' },
]

const YENI_ADLAR = [...K1.map((x) => x.ad), ...K2.map((x) => x.ad)]

const HSL_UCLUSU = /^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/

/** Blok yorumlarını söker; kapı yalnız KODU okur (yorumda ad geçmesi tanım değildir). */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ')
}

/** İlk `:root { … }` bloğunun gövdesi (süslü parantez eşlemeli). */
function kokBlogu(css: string): string {
  const kod = yorumsuz(css)
  const m = /(^|\n)\s*:root\s*\{/.exec(kod)
  if (!m) return ''
  let derinlik = 0
  const bas = m.index + m[0].length
  for (let i = bas; i < kod.length; i++) {
    if (kod[i] === '{') derinlik++
    else if (kod[i] === '}') {
      if (derinlik === 0) return kod.slice(bas, i)
      derinlik--
    }
  }
  return ''
}

const KOK_BLOGU = kokBlogu(INDEX_CSS)

function kokDegeri(ad: string): string | null {
  const m = new RegExp(`(?:^|[\\s;{])${ad}\\s*:\\s*([^;]+);`).exec(KOK_BLOGU)
  return m ? m[1].trim() : null
}

/** `var(--x)` zincirini `:root` içinde çözer (sonlu; döngü 8 adımda kesilir). */
function coz(ad: string): string | null {
  let deger = kokDegeri(ad)
  for (let i = 0; i < 8 && deger !== null; i++) {
    const v = /^var\((--[a-z0-9-]+)\)$/.exec(deger)
    if (!v) return deger
    deger = kokDegeri(v[1])
  }
  return null
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x]
  const to2 = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, '0').toUpperCase()
  return `#${to2(r1)}${to2(g1)}${to2(b1)}`
}

function kanalFarki(a: string, b: string): number {
  const oku = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
  const [ra, ga, ba] = oku(a)
  const [rb, gb, bb] = oku(b)
  return Math.max(Math.abs(ra - rb), Math.abs(ga - gb), Math.abs(ba - bb))
}

function tanimSayisi(ad: string): number {
  return (yorumsuz(INDEX_CSS).match(new RegExp(`(?:^|[\\s;{])${ad}\\s*:`, 'g')) ?? []).length
}

function tailwindBaglamaSayisi(ad: string): number {
  const anahtar = ad.replace(/^--/, '')
  const desen = new RegExp(`'${anahtar}':\\s*'hsl\\(var\\(${ad}\\) / <alpha-value>\\)'`, 'g')
  return (TAILWIND.match(desen) ?? []).length
}

describe('OPS-53 Faz 2a — DS takma adları görünmez ve tek kaynakta', () => {
  it('ÖN KOŞUL — okuyucu çalışıyor (boş okuma sahte yeşil üretirdi)', () => {
    expect(KOK_BLOGU.length, 'src/index.css içinde :root bloğu bulunamadı').toBeGreaterThan(500)
    expect(kokDegeri('--marka-lacivert'), 'bilinen bir token okunamadı').toBe('218.8 48% 19.6%')
  })

  describe.each(K1)('K1 takma ad $ad → $hedef', ({ ad, hedef, dsHex }) => {
    it('takma ad var(hedef) biçiminde (değer kopyası DEĞİL)', () => {
      expect(
        kokDegeri(ad),
        `${ad} :root'ta ${hedef} için var() takma adı olmalı: değer tek kaynakta kalır, kopyalanmaz.`,
      ).toBe(`var(${hedef})`)
    })

    it('hedef :root\'ta tanımlı ve HSL üçlüsü olarak çözülüyor', () => {
      const cozulen = coz(ad)
      expect(cozulen, `${ad} zinciri çözülemedi (hedef ${hedef} :root'ta yok ya da döngü)`).not.toBeNull()
      expect(HSL_UCLUSU.test(cozulen ?? ''), `${ad} çözülmüş değeri HSL üçlüsü değil: "${cozulen}"`).toBe(true)
    })

    it(`çözülmüş renk DS değeri ${dsHex} ile ≤2 kanal farkta`, () => {
      const [h, s, l] = (coz(ad) ?? '').split(/\s+/).map((p) => parseFloat(p))
      const uretilen = hslToHex(h, s, l)
      const fark = kanalFarki(uretilen, dsHex)
      expect(
        fark,
        `${ad} → ${uretilen}, DS değeri ${dsHex} (kanal farkı ${fark}). 2'den büyük fark yuvarlama değil, yanlış renktir.`,
      ).toBeLessThanOrEqual(2)
    })
  })

  describe.each(K2)('K2 literal $ad', ({ ad, deger }) => {
    it('DS değeriyle birebir ve HSL üçlüsü (CLAUDE.md kural 8: HEX değil)', () => {
      const okunan = kokDegeri(ad)
      expect(okunan, `${ad} :root'ta YOK`).toBe(deger)
      expect(HSL_UCLUSU.test(okunan ?? '')).toBe(true)
    })
  })

  it.each(YENI_ADLAR)('%s index.css\'te TAM BİR KEZ tanımlı (ikinci tanım = ikinci kaynak)', (ad) => {
    expect(tanimSayisi(ad), `${ad} index.css'te birden çok yerde tanımlı ya da hiç tanımlı değil`).toBe(1)
  })

  it.each(CAKISAN_KUME)(
    'çakışan küme $ad :root değeri DEĞİŞMEDİ ($deger) — görünür dönüşüm 2b, ve :root\'a yazılmaz',
    ({ ad, deger }) => {
      expect(
        kokDegeri(ad),
        `${ad} :root değeri değişmiş. Faz 2a görünmezdir; çevirme yalnız data-gorunum kapsamlı üzerine ` +
          'yazmayla yapılır (v2.2 §1.2) ve :root değeri anahtar kapalıyken canlıyı belirler.',
      ).toBe(deger)
    },
  )

  it.each(YENI_ADLAR)('%s Tailwind\'e hsl(var(--ad) / <alpha-value>) ile TEK kez bağlı', (ad) => {
    expect(
      tailwindBaglamaSayisi(ad),
      `${ad} tailwind.config.js'te hsl(var(${ad}) / <alpha-value>) biçiminde tam bir kez bağlı olmalı`,
    ).toBe(1)
  })

  it('tailwind.config.js theme altında YALNIZ extend taşır (varsayılan ölçek ezilmez)', () => {
    // red-team §2.6: theme.spacing / theme.colors / theme.fontFamily doğrudan yazılırsa
    // Tailwind'in varsayılan ölçeği SİLİNİR; yeni anahtarlar yalnız theme.extend altına girer.
    const theme = (tailwindConfig as { theme?: Record<string, unknown> }).theme ?? {}
    expect(Object.keys(theme)).toEqual(['extend'])
  })

  it('theme.extend.colors yeni adları taşıyor ve `spacing` ölçeği hiç tanımlanmamış', () => {
    const extend = ((tailwindConfig as { theme?: { extend?: Record<string, unknown> } }).theme?.extend ?? {})
    const renkler = Object.keys((extend.colors ?? {}) as Record<string, unknown>)
    for (const ad of YENI_ADLAR) {
      expect(renkler, `${ad} theme.extend.colors altında yok`).toContain(ad.replace(/^--/, ''))
    }
    // Plan v2.2 §2.6: boşluk rolleri YALNIZ `space-*` önekli anahtarlar (extend.spacing); sayısal
    // varsayılan ölçeğe (1, 2, 4 …) dokunan anahtar yok.
    const spacing = Object.keys((extend.spacing ?? {}) as Record<string, unknown>)
    expect(spacing.filter((k) => !k.startsWith('space-')), 'extend.spacing space-* dışı anahtar taşıyor').toEqual([])
  })
})

/** İkinci dilim: DS tipografi/ölçü/kenar/yüzey adları (DesignSync kopyası 2026-10-05, birebir). */
const IKINCI: ReadonlyArray<readonly [string, string]> = [
  ['--wordmark-weight', '700'], ['--wordmark-tracking', '-0.03em'],
  ['--weight-govde', '400'], ['--weight-mono', '500'], ['--weight-baslik', '600'], ['--weight-h1', '700'],
  ['--size-display', '46px'], ['--lh-display', '1.16'], ['--track-display', '-0.03em'],
  ['--size-h1', '34px'], ['--size-h1-mobil', '25px'], ['--lh-h1', '1.15'], ['--track-h1', '-0.025em'],
  ['--size-h2', '29px'], ['--lh-h2', '1.2'], ['--track-h2', '-0.03em'],
  ['--size-h3', '21px'], ['--lh-h3', '1.3'], ['--track-h3', '-0.02em'],
  ['--size-body', '15px'], ['--lh-body', '1.5'],
  ['--size-body-small', '13.5px'], ['--lh-body-small', '1.55'],
  ['--size-caption', '12.5px'], ['--lh-caption', '1.45'],
  ['--size-overline', '11px'], ['--lh-overline', '1.4'], ['--track-overline', '0.14em'],
  ['--size-editorial', '16px'], ['--lh-editorial', '1.6'],
  ['--space-tight', '5px'], ['--space-inline', '7px'], ['--space-grid', '10px'], ['--space-stack', '14px'],
  ['--space-card', '16px'], ['--space-card-loose', '20px'], ['--space-page-mobile', '18px'],
  ['--space-block', '30px'], ['--space-page', '40px'],
  ['--border-control', '60 5% 84%'], ['--border-hairline', '60 6% 88%'], ['--border-row', '60 13% 94%'],
  ['--radius-panel', '8px'], ['--shadow-none', 'none'],
  ['--surface-page', '60 8% 95%'], ['--surface-card', '0 0% 100%'], ['--surface-subtle', '60 20% 98%'],
  ['--surface-inset', '60 11% 93%'], ['--surface-dark', '216 40% 10%'], ['--surface-dark-inset', '218 44% 25%'],
]
const RENK_IKINCI = IKINCI.filter(([ad]) => /^--(border-(control|hairline|row)|surface-(page|card|subtle|inset|dark|dark-inset))$/.test(ad))

describe('OPS-53 Faz 2a ikinci dilim — tipografi/ölçü/kenar/yüzey', () => {
  it('50 ad', () => {
    expect(IKINCI.length).toBe(50)
  })

  it.each(IKINCI)('%s :root\'ta DS değeriyle birebir ve tek tanımlı', (ad, deger) => {
    expect(kokDegeri(ad)).toBe(deger)
    expect(tanimSayisi(ad)).toBe(1)
  })

  it.each(RENK_IKINCI)('%s HSL üçlüsü ve Tailwind\'e bağlı', (ad) => {
    expect(HSL_UCLUSU.test(kokDegeri(ad) ?? '')).toBe(true)
    expect(tailwindBaglamaSayisi(ad)).toBe(1)
  })

  it('boşluk rolleri extend.spacing altında space-* önekiyle, değişkene bağlı', () => {
    const extend = (tailwindConfig as { theme?: { extend?: Record<string, Record<string, unknown>> } }).theme?.extend ?? {}
    for (const [ad] of IKINCI.filter(([a]) => a.startsWith('--space-'))) {
      expect(extend.spacing?.[ad.replace(/^--/, '')]).toBe(`var(${ad})`)
    }
  })

  it('yazı ölçeği ds-* anahtarlarıyla, mevcut display anahtarı DEĞİŞMEDİ', () => {
    const fs = ((tailwindConfig as { theme?: { extend?: Record<string, Record<string, unknown>> } }).theme?.extend ?? {}).fontSize ?? {}
    expect(Object.keys(fs).filter((k) => k.startsWith('ds-')).length).toBe(10)
    expect(JSON.stringify(fs.display)).toBe(JSON.stringify(['var(--font-size-display)', { lineHeight: '1.1' }]))
  })

  it('çakışan küme DS\'e çevrilmemiş: --radius ve yazı ailesi adı :root\'ta yok/aynı', () => {
    expect(kokDegeri('--radius')).toBe('0.5rem')
    for (const ad of ['--font-serif', '--font-mono', '--font-size-display']) {
      expect(ad === '--font-size-display' ? kokDegeri(ad) !== null : kokDegeri(ad) === null, ad).toBe(true)
    }
  })
})
