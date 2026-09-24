/**
 * INV-GORSEL-VAR-1 — kaynak kodda SABİT yazılmış her görsel adresi `public/` altında gerçekten VAR.
 *
 * NİÇİN VAR (2026-09-24, BLOG canlı tabanı): üç paylaşım görseli depoda HİÇ yoktu ve kod onlara
 * işaret ediyordu — `/images/og-default.jpg` (11 kategori + marka + ürün + kök düzen: 404),
 * `/images/hvac_heat_recovery_7.png` (ana sayfa: 404), `/og-image.png` (Seo bileşeni: 500).
 * Bağlantı paylaşılınca önizleme görseli boş çıkıyordu; hiçbir derleme/tip/lint kapısı görmez,
 * çünkü adres bir dizedir. Bu test dizenin karşılığını dosya sisteminde arar.
 *
 * Kapsam: `'…'`, `"…"`, `` `…` `` içinde `/…​.(jpg|jpeg|png|webp|svg|ico|gif)` biçimindeki yollar;
 * önünde yalnız `${siteUrl}` gibi bir KÖKEN değişkeni olabilir. Yolun İÇİNDE `${…}` varsa (dinamik
 * görsel, ör. kategori slug'ı) ölçülemez → atlanır. `http(s)://` ile başlayan dış adresler atlanır.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const SRC = join(KOK, 'src')
const PUBLIC = join(KOK, 'public')

function dosyalar(dizin: string): string[] {
  const out: string[] = []
  for (const ad of readdirSync(dizin)) {
    const tam = join(dizin, ad)
    if (statSync(tam).isDirectory()) {
      if (ad === '__tests__' || ad === 'node_modules') continue
      out.push(...dosyalar(tam))
    } else if (/\.(ts|tsx)$/.test(ad) && !/\.test\.tsx?$/.test(ad)) {
      out.push(tam)
    }
  }
  return out
}

/**
 * Yorumları söker (blok + satır). Satır yorumu `(?<!:)` ile — `https://` içindeki `//` yorum sanılmasın
 * (INV-SCRUB-1). Açıklama satırında eski kırık adresi anlatmak kapıyı düşürmemeli.
 */
const yorumsuz = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/.*$/gm, '')

/**
 * Önekte yalnız bu KÖKEN değişkenleri sökülür (değerleri site kökeni, yol değil). Başka bir `${x}`
 * önekli yol (ör. `${basePath}/avens.svg`) yolu bilinmediği için ÖLÇÜLMEZ — yanlış alarm vermesin.
 */
const KOKEN = '(?:\\$\\{(?:siteUrl|SITE_URL|baseUrl|origin)\\})?'

/** Dizedeki sabit görsel yolları (köken değişkeni sökülmüş). */
export function sabitGorselYollari(kaynak: string): string[] {
  const yollar: string[] = []
  const desen = new RegExp(`['"\`]${KOKEN}(\\/[A-Za-z0-9_\\-./]*\\.(?:jpe?g|png|webp|svg|ico|gif))['"\`]`, 'g')
  for (const m of yorumsuz(kaynak).matchAll(desen)) yollar.push(m[1])
  return yollar
}

describe('INV-GORSEL-VAR-1 — sabit görsel adresleri public/ altında var', () => {
  it('desen: köken önekli ve öneksiz yolu yakalar, dinamik ve dış adresi atlar', () => {
    const ornek = [
      "url: '/images/og-default.jpg'",
      'const image = ogImage || `${siteUrl}/og-image.png`',
      'src={`/images/categories/${slug}.jpg`}',
      "img: 'https://cdn.example.com/a.png'",
      'src = `${basePath}/avens.svg`',
      "// eskiden '/images/yok.png' idi",
    ].join('\n')
    expect(sabitGorselYollari(ornek)).toEqual(['/images/og-default.jpg', '/og-image.png'])
  })

  it('kaynaktaki her sabit görsel yolunun dosyası var', () => {
    const eksik: string[] = []
    let sayac = 0
    for (const dosya of dosyalar(SRC)) {
      for (const yol of sabitGorselYollari(readFileSync(dosya, 'utf8'))) {
        sayac++
        if (!existsSync(join(PUBLIC, yol))) eksik.push(`${relative(KOK, dosya).replace(/\\/g, '/')} → ${yol}`)
      }
    }
    // Boşluk muhafızı: tarayıcı gerçekten yol buluyor (kök düzenin og görseli en az bir tane).
    expect(sayac).toBeGreaterThan(3)
    expect(eksik, `public/ altında OLMAYAN görsel adresleri:\n${eksik.join('\n')}`).toEqual([])
  })
})
