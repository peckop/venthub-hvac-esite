#!/usr/bin/env node
/**
 * REHBER YAZISI GÖVDE İZİ — "gövde değişti ama güncelleme tarihi değişmedi" hatasını PR'da yakalar
 * (BLG-76, OPS isteği 12 Kasım 2026; olay: BLG-13 ve BLG-62'de sitemap lastmod / dateModified eski kaldı,
 * ayrı lastmod PR'ı gerekti; cetvel: rehber-yazisi-standard.md R10.6 madde 9).
 *
 * Yöntem: her yazı için H1 + gövde + özet metninin (boşluklar normalize) SHA-256 izi, o izin kaydedildiği
 * `guncellemeTarihi` ile birlikte `src/lib/bilgiMerkezi/__tests__/govde-izleri.json` dosyasında tutulur.
 * Test (`govdeIzi.test.ts`) yazilar.ts'ten izi yeniden hesaplar ve kayıtla karşılaştırır:
 *   - iz AYNI                      → tamam (tarih serbest);
 *   - iz FARKLI, tarih AYNI        → KIRMIZI "TARIH_UNUTULDU" (asıl hata);
 *   - iz FARKLI, tarih farklı      → KIRMIZI "IZ_ESKI" (iz dosyası güncellenmemiş: `--yaz`);
 *   - yazı iz dosyasında yok       → KIRMIZI "KAYIT_YOK" (yeni yazı: `--yaz`).
 * Yorum, boşluk ve ürün/ilgili alanı değişikliği izi DEĞİŞTİRMEZ (yalnız H1, gövde, özet izlenir).
 *
 * Kullanım:
 *   node scripts/rehber/govde-izi.mjs            # denetle (kırmızıysa çıkış 1)
 *   node scripts/rehber/govde-izi.mjs --yaz      # değişen/yeni yazıların izini kaydet; TARIH_UNUTULDU varsa REDDEDER
 *   node scripts/rehber/govde-izi.mjs --taban    # iz dosyası yoksa bugünkü durumu taban yazar (geçmiş için kırmızı vermez)
 * Çıkış: 0 temiz · 1 kırmızı ya da reddedildi · 2 kullanım hatası.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { yazilariAyristir } from './yazi-envanteri.mjs'

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const IZ_DOSYASI = join(KOK, 'src/lib/bilgiMerkezi/__tests__/govde-izleri.json')
const YAZILAR_TS = join(KOK, 'src/data/bilgiMerkezi/yazilar.ts')

/** Boşlukları tek aralığa indirir; yalnız boşluk/satır sonu değişikliği izi değiştirmez. */
function normalize(metin) {
  return String(metin).replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim()
}

/** Yazı kaydının izi: H1 + gövde + özet. (Gövde H1'i zaten içerir; H1 ayrıca konur ki ayrıştırıcı kayması görünsün.) */
export function iziHesapla(yazi) {
  const girdi = [normalize(yazi.h1), normalize(yazi.govde), normalize(yazi.ozet ?? '')].join('␞')
  return createHash('sha256').update(girdi, 'utf8').digest('hex').slice(0, 16)
}

/**
 * Saf denetim: yazılar × kayıtlı izler → sorun listesi. Boş liste = temiz.
 * Sorun türleri: TARIH_UNUTULDU, IZ_ESKI, KAYIT_YOK.
 */
export function govdeIziDenetle(yazilar, izler) {
  const sorunlar = []
  for (const y of yazilar) {
    const kayit = izler[y.kimlik]
    const iz = iziHesapla(y)
    if (!kayit) {
      sorunlar.push({ kimlik: y.kimlik, tur: 'KAYIT_YOK', ileti: `${y.kimlik}: iz dosyasında kaydı yok; yeni yazı ise \`node scripts/rehber/govde-izi.mjs --yaz\`` })
    } else if (kayit.iz !== iz) {
      if (kayit.tarih === y.guncellemeTarihi) {
        sorunlar.push({
          kimlik: y.kimlik,
          tur: 'TARIH_UNUTULDU',
          ileti: `${y.kimlik}: H1/gövde/özet değişti ama guncellemeTarihi hâlâ ${y.guncellemeTarihi}; tarihi yayın gününe çekin (sitemap lastmod ve Article dateModified bunu izler), sonra \`node scripts/rehber/govde-izi.mjs --yaz\``,
        })
      } else {
        sorunlar.push({ kimlik: y.kimlik, tur: 'IZ_ESKI', ileti: `${y.kimlik}: tarih güncellenmiş (${kayit.tarih} → ${y.guncellemeTarihi}) ama iz dosyası eski; \`node scripts/rehber/govde-izi.mjs --yaz\`` })
      }
    }
  }
  return sorunlar
}

/** yazilar.ts metninden denetlenecek kayıtlar (ayrıştırıcı + özet). */
export function yazilariOku(kaynak) {
  const t = kaynak.replace(/\r\n/g, '\n')
  return yazilariAyristir(t).map((y) => {
    const baslar = [...t.matchAll(/^\s{4}kimlik:\s*'([^']+)'/gm)]
    const i = baslar.findIndex((m) => m[1] === y.kimlik)
    const seg = t.slice(baslar[i].index, i + 1 < baslar.length ? baslar[i + 1].index : t.length)
    const ozet = seg.match(/\bozet:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/)?.[1]?.slice(1, -1) ?? ''
    return { ...y, ozet }
  })
}

/** İz dosyasını okur; yoksa null. */
export function izleriOku(yol = IZ_DOSYASI) {
  if (!existsSync(yol)) return null
  return JSON.parse(readFileSync(yol, 'utf8'))
}

/** Satır başına bir yazı: farklı yazıları değiştiren PR'lar aynı satıra dokunmaz (birleştirme çakışması azalır). */
export function izleriSerilestir(izler) {
  const anahtarlar = Object.keys(izler).sort()
  const satirlar = anahtarlar.map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify({ iz: izler[k].iz, tarih: izler[k].tarih })}`)
  return `{\n${satirlar.join(',\n')}\n}\n`
}

function bas() {
  const arg = process.argv.slice(2)
  const bilinen = new Set(['--yaz', '--taban'])
  const fazla = arg.filter((a) => !bilinen.has(a))
  if (fazla.length > 0) {
    console.error(`bilinmeyen bayrak: ${fazla.join(' ')} (kullanım: [--yaz | --taban])`)
    process.exit(2)
  }
  const yazilar = yazilariOku(readFileSync(YAZILAR_TS, 'utf8'))
  if (yazilar.length === 0) {
    console.error('yazilar.ts içinde yazı kaydı ayrıştırılamadı (biçim değişmiş olabilir)')
    process.exit(1)
  }
  const mevcut = izleriOku()

  if (arg.includes('--taban')) {
    if (mevcut) {
      console.error('iz dosyası zaten var; --taban yalnız ilk üretimde (geçmişi sıfırlamamak için). Değişiklik için --yaz.')
      process.exit(1)
    }
    const izler = Object.fromEntries(yazilar.map((y) => [y.kimlik, { iz: iziHesapla(y), tarih: y.guncellemeTarihi }]))
    writeFileSync(IZ_DOSYASI, izleriSerilestir(izler))
    console.log(`taban yazıldı: ${yazilar.length} yazı (bugünkü durum sayıldı)`)
    return
  }

  const izler = mevcut ?? {}
  const sorunlar = govdeIziDenetle(yazilar, izler)

  if (arg.includes('--yaz')) {
    const unutulan = sorunlar.filter((s) => s.tur === 'TARIH_UNUTULDU')
    if (unutulan.length > 0) {
      for (const s of unutulan) console.error(`REDDEDİLDİ  ${s.ileti}`)
      process.exit(1)
    }
    const yeni = { ...izler }
    for (const y of yazilar) yeni[y.kimlik] = { iz: iziHesapla(y), tarih: y.guncellemeTarihi }
    writeFileSync(IZ_DOSYASI, izleriSerilestir(yeni))
    console.log(`iz dosyası güncellendi: ${sorunlar.length} kayıt değişti`)
    return
  }

  if (sorunlar.length === 0) {
    console.log(`temiz: ${yazilar.length} yazının izi kayıtla uyuşuyor`)
    return
  }
  for (const s of sorunlar) console.error(`${s.tur}  ${s.ileti}`)
  process.exit(1)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) bas()
