#!/usr/bin/env node
/**
 * M6 FONT PRELOAD ÖLÇÜMÜ (ALT-34, plan v2.2 §2.1 madde 2 + §4 M6): derlemeden sonra HTML'e kaç font
 * `<link rel=preload>` bağlantısı basılacağını ve HANGİ aileye ait olduğunu ölçer; beklenenden fazlası KIRMIZI.
 *
 * NİÇİN: Next, `layout.tsx`'te `preload: true` tanımlı fontu kullanılmasa da önyükler (next-font-manifest-plugin
 * her `next-font-loader` modülünü tarar; plan v2.2 §1.2). Bayrak kapalıyken yeni yazı tipi sızarsa ziyaretçi
 * görmediği bir fontu indirir ve hiçbir test görmez.
 *
 * NASIL ÖLÇER: (1) `.next/server/next-font-manifest.json` → `app` girdilerindeki dosyalar = basılacak preload
 * bağlantıları (tekilleştirilmiş); (2) `.next/static/css/*.css` → `@font-face` blokları dosya→aile eşlemesi verir
 * (`font-family: __Inter_abc123` → "Inter"). Dosya adından aile çıkarılamaz (özet adıdır), bu yüzden CSS gerekir.
 *
 * ⛔ WINDOWS'TA ÖLÇÜLEMEZ: next-font-manifest yol ayracı yüzünden `"app":{}` BOŞ çıkar (TASARIM S1, 10-05;
 * bu depoda `.next` ile teyit edildi). Win32'de ya da manifest boşken sonuç "ÖLÇÜLEMEDİ"dir (çıkış 3), ASLA yeşil
 * değil: ölçülemedi ≠ geçti (reflow.e2e.ts ile aynı ilke). CI Linux'ta boş manifest de kırmızıdır.
 *
 * KULLANIM: node scripts/ci/font-preload-olc.cjs --beklenen Inter [--en-cok 2] [--dizin .next]
 *   --beklenen  izin verilen TEK aile (kapalı kip: Inter; açık kip YENI_GORUNUM=true derlemesi: Archivo)
 *   --en-cok    bu ailenin en çok kaç bağlantısı olabilir (varsayılan 2: latin + latin-ext)
 * Çıkış: 0 yeşil · 1 kırmızı · 3 ölçülemedi.
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')

/** `app` girdilerindeki benzersiz font dosyaları (preload bağlantıları). `pages` sayfa-yönlendiricisi, vitrin değil. */
function manifestOnyuklemeleri(manifest) {
  const app = manifest && typeof manifest === 'object' ? manifest.app : null
  const dosyalar = new Set()
  if (app && typeof app === 'object') {
    for (const liste of Object.values(app)) {
      if (Array.isArray(liste)) for (const d of liste) if (typeof d === 'string' && d) dosyalar.add(d)
    }
  }
  return [...dosyalar].sort()
}

/** Next'in aile adı: `__Inter_a1b2c3` / `__Inter_Fallback_a1b2c3` → "Inter". */
function aileAdi(hamAd) {
  const m = /^['"]?__(.+?)(?:_Fallback)?_[0-9a-f]{4,}['"]?$/i.exec(String(hamAd).trim())
  return m ? m[1].replace(/_/g, ' ') : String(hamAd).trim().replace(/^['"]|['"]$/g, '')
}

/** CSS metinlerinden `dosya adı (yoldan sonra) → aile` eşlemesi. */
function fontFaceHaritasi(cssMetinleri) {
  const harita = new Map()
  const blok = /@font-face\s*\{([^}]*)\}/g
  for (const css of cssMetinleri) {
    for (const m of String(css).matchAll(blok)) {
      const govde = m[1]
      const aile = /font-family\s*:\s*([^;]+)/i.exec(govde)
      if (!aile) continue
      for (const u of govde.matchAll(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/g)) {
        harita.set(path.posix.basename(u[1].split('?')[0]), aileAdi(aile[1]))
      }
    }
  }
  return harita
}

/**
 * Saf karar. `girdi`: { manifest, css:[metin], beklenen, enCok, platform }.
 * Dönüş: { durum: 'yesil'|'kirmizi'|'olculemedi', mesaj, aileler:{aile:adet} }.
 */
function degerlendir({ manifest, css, beklenen, enCok = 2, platform = process.platform }) {
  if (platform === 'win32') {
    return {
      durum: 'olculemedi',
      mesaj: 'Windows: next-font-manifest yol ayracı yüzünden boş çıkar; ölçüm yalnız Linux/CI\'da yapılır (yeşil DEĞİL).',
      aileler: {},
    }
  }
  const dosyalar = manifestOnyuklemeleri(manifest)
  if (dosyalar.length === 0) {
    return {
      durum: 'olculemedi',
      mesaj: 'next-font-manifest "app" girdisi BOŞ: ya derleme font önyüklemesi üretmedi ya da manifest okunamadı. Ölçülemedi ≠ geçti.',
      aileler: {},
    }
  }
  const harita = fontFaceHaritasi(css ?? [])
  const aileler = {}
  const cozulemeyen = []
  for (const d of dosyalar) {
    const aile = harita.get(path.posix.basename(d))
    if (!aile) cozulemeyen.push(d)
    else aileler[aile] = (aileler[aile] ?? 0) + 1
  }
  if (cozulemeyen.length > 0) {
    return {
      durum: 'kirmizi',
      mesaj: `Önyüklenen ${cozulemeyen.length} font dosyasının ailesi @font-face CSS'inde bulunamadı: ${cozulemeyen.join(', ')}. Ölçülemeyen preload geçti sayılmaz.`,
      aileler,
    }
  }
  const yabanci = Object.keys(aileler).filter((a) => a !== beklenen)
  if (yabanci.length > 0) {
    return {
      durum: 'kirmizi',
      mesaj: `Beklenen yalnız "${beklenen}"; fazladan önyüklenen aile: ${yabanci.map((a) => `${a} (${aileler[a]})`).join(', ')}.`,
      aileler,
    }
  }
  if ((aileler[beklenen] ?? 0) > enCok) {
    return {
      durum: 'kirmizi',
      mesaj: `"${beklenen}" için ${aileler[beklenen]} preload bağlantısı var; en çok ${enCok} beklenir.`,
      aileler,
    }
  }
  return { durum: 'yesil', mesaj: `Yalnız "${beklenen}" önyükleniyor (${aileler[beklenen]} bağlantı, sınır ${enCok}).`, aileler }
}

function cssOku(dizin) {
  const klasor = path.join(dizin, 'static', 'css')
  if (!fs.existsSync(klasor)) return []
  return fs
    .readdirSync(klasor)
    .filter((f) => f.endsWith('.css'))
    .map((f) => fs.readFileSync(path.join(klasor, f), 'utf8'))
}

function bayrak(argv, ad, varsayilan) {
  const i = argv.indexOf(`--${ad}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : varsayilan
}

function main(argv) {
  const beklenen = bayrak(argv, 'beklenen', null)
  if (!beklenen) {
    console.error('[font-preload] --beklenen <Aile> zorunlu (kapalı kip: Inter).')
    return 1
  }
  const dizin = path.resolve(bayrak(argv, 'dizin', '.next'))
  const enCok = Number(bayrak(argv, 'en-cok', '2'))
  let manifest = null
  const yol = path.join(dizin, 'server', 'next-font-manifest.json')
  try {
    manifest = JSON.parse(fs.readFileSync(yol, 'utf8'))
  } catch (e) {
    console.error(`[font-preload] ÖLÇÜLEMEDİ: ${yol} okunamadı (${e.code ?? e.message}). Derleme çıktısı yok.`)
    return 3
  }
  const s = degerlendir({ manifest, css: cssOku(dizin), beklenen, enCok })
  const etiket = { yesil: 'YEŞİL', kirmizi: 'KIRMIZI', olculemedi: 'ÖLÇÜLEMEDİ' }[s.durum]
  console.error(`[font-preload] ${etiket}: ${s.mesaj}`)
  if (s.durum !== 'yesil') console.error(`[font-preload] ailelere göre: ${JSON.stringify(s.aileler)}; manifest app: ${JSON.stringify(manifest.app)}`)
  return { yesil: 0, kirmizi: 1, olculemedi: 3 }[s.durum]
}

module.exports = { manifestOnyuklemeleri, fontFaceHaritasi, aileAdi, degerlendir }

if (require.main === module) process.exit(main(process.argv.slice(2)))
