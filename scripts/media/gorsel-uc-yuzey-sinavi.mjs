#!/usr/bin/env node
/**
 * INV-IMG-2 — ürün görseli ÜÇ YÜZEY SINAVI (product-image-standard §7). Saf parça: gorsel-uc-yuzey.mjs
 *
 * YALNIZ YEREL GÖLGE VERİTABANINDA koşar (docker exec → yerel Supabase konteyneri). Canlıya bağlanma yolu YOKTUR.
 * Gölge: `node scripts/db/golge-kur.mjs --ad img2_golge` (ALTYAPI). Her koşum tek işlem + ROLLBACK: gölgede iz yok.
 *
 * KULLANIM:
 *   node scripts/media/gorsel-uc-yuzey-sinavi.mjs [--ad img2_golge] [--konteyner supabase_db_venthub-hvac]
 *   node scripts/media/gorsel-uc-yuzey-sinavi.mjs --sabotaj kiracisiz     # tek sabotaj: KIRMIZI beklenir
 *   node scripts/media/gorsel-uc-yuzey-sinavi.mjs --kanit                 # temiz YEŞİL + her sabotaj KIRMIZI
 *
 * ÇIKIŞ KODLARI:
 *   0 = üç yüzey doğru (--kanit: temiz yeşil VE her sabotaj kırmızı)
 *   1 = İHLAL (--kanit: temiz kırmızı YA DA bir sabotaj yakalanmadı)
 *   2 = ÖLÇEMEDİ — gölge/konteyner yok, kurulum tutmadı ya da sabotaj boşa düştü. Geçti ile AYNI ŞEY DEĞİL.
 */
import { spawnSync } from 'node:child_process'

import { SABOTAJLAR, ayristir, degerlendir, sinavSql } from './gorsel-uc-yuzey.mjs'

const arg = (ad, varsayilan) => {
  const i = process.argv.indexOf(`--${ad}`)
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : varsayilan
}
const VT = arg('ad', 'img2_golge')
const KONTEYNER = arg('konteyner', 'supabase_db_venthub-hvac')

// Paylaşılan küme altyapısı ve rastgele ad REDDEDİLİR: sınav yalnız adı bilinen bir gölgeye girer.
if (!/^[a-z][a-z0-9_]{2,62}$/.test(VT) || ['postgres', 'template0', 'template1', '_supabase'].includes(VT)) {
  console.error(`⛔ geçersiz gölge adı: ${JSON.stringify(VT)} — yalnız golge-kur.mjs ile kurulmuş bir gölge verilir`)
  process.exit(2)
}

function kos(sabotaj) {
  const r = spawnSync('docker', ['exec', '-i', KONTEYNER, 'psql', '-U', 'postgres', '-d', VT, '-q', '-At', '-v', 'ON_ERROR_STOP=0'],
    { input: sinavSql({ sabotaj }), encoding: 'utf8' })
  if (r.error || /does not exist|No such container|Cannot connect/i.test(r.stderr || '')) {
    return { olcemedi: `gölgeye ulaşılamadı (${KONTEYNER}/${VT}): ${(r.error?.message || r.stderr).trim().split('\n')[0]}` }
  }
  if (/SABOTAJ_BOS/.test(r.stderr || '')) return { olcemedi: `sabotaj "${sabotaj}" boşa düştü: gövde metni değişmiş, sabotajı güncelle` }
  const sonuc = degerlendir(ayristir(r.stdout))
  if (sonuc.kurulum.length) return { olcemedi: `kurulum tutmadı — sonuç OKUNMAZ:\n    ${sonuc.kurulum.join('\n    ')}`, hata: r.stderr }
  return { ihlal: sonuc.ihlal, hata: r.stderr }
}

const yaz = (baslik, s) => {
  if (s.olcemedi) { console.log(`  ${baslik.padEnd(26)} ÖLÇEMEDİ — ${s.olcemedi}`); return }
  console.log(`  ${baslik.padEnd(26)} ${s.ihlal.length ? `KIRMIZI (${s.ihlal.length})` : 'YEŞİL'}`)
  for (const i of s.ihlal) console.log(`      · ${i}`)
}

console.log(`INV-IMG-2 · üç yüzey sınavı · gölge ${VT} (tek işlem, ROLLBACK)\n`)

if (process.argv.includes('--kanit')) {
  const temiz = kos(null)
  yaz('temiz', temiz)
  if (temiz.olcemedi) process.exit(2)
  let kacan = 0
  let olcemedi = 0
  for (const ad of Object.keys(SABOTAJLAR)) {
    const s = kos(ad)
    yaz(`sabotaj ${ad}`, s)
    if (s.olcemedi) olcemedi++
    else if (!s.ihlal.length) { kacan++; console.log(`      ⛔ YAKALANMADI: ${SABOTAJLAR[ad].ne}`) }
  }
  console.log(`\n  sonuç: temiz ${temiz.ihlal.length ? 'KIRMIZI' : 'YEŞİL'} · ${Object.keys(SABOTAJLAR).length} sabotajın ${kacan} tanesi kaçtı · ${olcemedi} ölçülemedi`)
  process.exit(olcemedi ? 2 : (temiz.ihlal.length || kacan) ? 1 : 0)
}

const sabotaj = arg('sabotaj', null)
if (sabotaj && !SABOTAJLAR[sabotaj]) {
  console.error(`⛔ bilinmeyen sabotaj "${sabotaj}" — seçenekler: ${Object.keys(SABOTAJLAR).join(', ')}`)
  process.exit(2)
}
const s = kos(sabotaj)
yaz(sabotaj ? `sabotaj ${sabotaj}` : 'temiz', s)
if (s.olcemedi) process.exit(2)
process.exit(s.ihlal.length ? 1 : 0)
