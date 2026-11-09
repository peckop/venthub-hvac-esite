#!/usr/bin/env node
/**
 * DİZİN DEFTERİ TUTARLILIK KONTROLÜ (Kanban SEO-101, OPS-258; cetvel docs/standards/departman-defter-standard.md D2.4).
 *
 * `docs/defter/geo-seo-dizin.md` içindeki ÖZET bloğu (depo-güvenli: yalnız sayı, tarih, sha256) ile depo dışı arşivdeki EN SON
 * `dizin-takip-<gün>.json` anlık görüntüsünü karşılaştırır. Defter ham adres×motor tablosu, arama sorgusu, tıklama ya da sıra
 * taşımaz (P6, D5); bu betik o ham veriyi okur ama yalnız özetini üretir ve basar.
 *
 * Çıkış: 0 tutarlı · 1 sapma (defter bayat ya da sayı uyuşmuyor) · 2 ölçülemedi (arşiv/anlık görüntü/defter okunamadı).
 * "Ölçülemedi" ASLA "tutarlı" sayılmaz. SALT-OKUMA.
 *
 * Kullanım:
 *   node scripts/seo/dizin-defter-kontrol.mjs            kontrol (varsayılan)
 *   node scripts/seo/dizin-defter-kontrol.mjs --ozet     son anlık görüntüden ÖZET JSON'unu basar (deftere yapıştırmak için)
 * Ortam: VENTHUB_DIZIN_ARSIV (arşiv klasörü, varsayılan dizin-acilis.mjs ile aynı), VENTHUB_DIZIN_DEFTER (defter yolu).
 */
import { readdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { arsivKlasoru, trGun } from './dizin-acilis.mjs'

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFTER_YOLU = join(KOK, 'docs', 'defter', 'geo-seo-dizin.md')
export const BASLA = '<!-- OZET:BASLA -->'
export const BITIS = '<!-- OZET:BITIS -->'
const MOTORLAR = ['google', 'bing', 'indexnow', 'yandex']
const KARARLAR = ['TAMAM', 'BEKLE', 'TEKRAR', 'YAP', 'ATLA', 'ESKI', 'OLCULEMEDI']

/** Arşivdeki en son anlık görüntü dosyası: { ad, hamMetin, json } ya da null. Bozuk dosya atlanır. */
export function enSonDosya(klasor) {
  let adlar
  try { adlar = readdirSync(klasor) } catch { return null }
  const adaylar = adlar.filter((a) => /^dizin-takip-\d{4}-\d{2}-\d{2}\.json$/.test(a)).sort().reverse()
  for (const ad of adaylar) {
    try {
      const hamMetin = readFileSync(join(klasor, ad))
      const json = JSON.parse(hamMetin.toString('utf8'))
      if (json && Array.isArray(json.tablo)) return { ad, hamMetin, json }
    } catch { /* bozuk dosya: bir öncekine bak */ }
  }
  return null
}

const kume = (adres) => {
  const yol = String(adres).replace(/^https?:\/\/[^/]+/, '')
  const m = /^\/(?:tr|en)\/(bilgi-merkezi|category|products|brands|urun-secici|contact|about)(?:\/|$)/.exec(yol)
  return m ? m[1] : 'diger'
}

/** Anlık görüntüden depo-güvenli özet: tarih, sha256, kapsam kümeleri, motor başına karar sayıları, ölçülemeyen nedenler. */
export function ozetUret({ ad, hamMetin, json }) {
  const gun = json.alinma && Number.isFinite(Date.parse(json.alinma)) ? trGun(Date.parse(json.alinma)) : ad.slice(12, 22)
  const kapsam = {}
  for (const s of json.tablo) { const k = kume(s.adres); kapsam[k] = (kapsam[k] ?? 0) + 1 }
  const kararlar = {}
  const olculemeyen = {}
  for (const m of MOTORLAR) {
    kararlar[m] = Object.fromEntries(KARARLAR.map((k) => [k, 0]))
    for (const s of json.tablo) {
      const d = s?.[m]?.durum
      if (d in kararlar[m]) kararlar[m][d]++
      if (d === 'OLCULEMEDI') {
        const sebep = String(s[m].neden ?? '').replace(/^durum okunamadı:?\s*/, '').replace(/ERROR!+\s*/i, '').replace(/;.*$/, '').trim().slice(0, 60) || 'sebep yok'
        olculemeyen[`${m}: ${sebep}`] = (olculemeyen[`${m}: ${sebep}`] ?? 0) + 1
      }
    }
  }
  return {
    anlikGoruntu: ad,
    gun,
    sha256: createHash('sha256').update(hamMetin).digest('hex'),
    adresSayisi: json.tablo.length,
    kapsam: Object.fromEntries(Object.entries(kapsam).sort()),
    kararlar,
    olculemeyen: Object.fromEntries(Object.entries(olculemeyen).sort()),
  }
}

/** Defter metninden ÖZET JSON'u. Blok yok ya da bozuksa null. */
export function defterOzeti(metin) {
  const a = metin.indexOf(BASLA), b = metin.indexOf(BITIS)
  if (a < 0 || b < a) return null
  const m = /```json\s*([\s\S]*?)```/.exec(metin.slice(a + BASLA.length, b))
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

const esit = (x, y) => JSON.stringify(x) === JSON.stringify(y)

/** { kod, mesaj }. 0 tutarlı · 1 sapma · 2 ölçülemedi. Saf: dosya okuma dışarıda (testte sahte girdi). */
export function karsilastir(defterMetni, son) {
  if (!son) return { kod: 2, mesaj: 'ÖLÇÜLEMEDİ: arşivde okunabilir anlık görüntü yok (VENTHUB_DIZIN_ARSIV?)' }
  const yazili = defterMetni ? defterOzeti(defterMetni) : null
  if (!yazili) return { kod: 2, mesaj: 'ÖLÇÜLEMEDİ: defterde ÖZET bloğu yok ya da JSON bozuk' }
  const gercek = ozetUret(son)
  const sapma = []
  for (const alan of ['anlikGoruntu', 'gun', 'sha256', 'adresSayisi', 'kapsam', 'kararlar', 'olculemeyen']) {
    if (!esit(yazili[alan], gercek[alan])) sapma.push(alan)
  }
  if (!sapma.length) return { kod: 0, mesaj: `TUTARLI: defter ${gercek.gun} anlık görüntüsüyle birebir (${gercek.adresSayisi} adres)` }
  const yeni = yazili.gun && gercek.gun > yazili.gun
  return { kod: 1, mesaj: `SAPMA (${sapma.join(', ')}): ${yeni ? `arşivde daha yeni anlık görüntü var (defter ${yazili.gun}, arşiv ${gercek.gun}); ` : ''}defterin ÖZET bloğunu \`--ozet\` çıktısıyla yenile` }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const son = enSonDosya(arsivKlasoru())
  if (process.argv.includes('--ozet')) {
    if (!son) { console.error('ÖLÇÜLEMEDİ: arşivde okunabilir anlık görüntü yok'); process.exit(2) }
    console.log(JSON.stringify(ozetUret(son), null, 2))
    process.exit(0)
  }
  let metin = null
  try { metin = readFileSync(process.env.VENTHUB_DIZIN_DEFTER || DEFTER_YOLU, 'utf8') } catch { /* karsilastir 2 döndürür */ }
  const r = karsilastir(metin, son)
  console[r.kod === 0 ? 'log' : 'error'](r.mesaj)
  process.exit(r.kod)
}
