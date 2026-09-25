/**
 * SEARCH CONSOLE TABANI — adres yayını gibi büyük değişiklikten ÖNCE sıfır noktası (pazar-olcum-standard.md
 * P2, kol 1; 2026-09-23: "K3-b yayınından önce şart").
 *
 * NİÇİN depoda: ilk sürüm oturumun geçici klasöründeydi; yayın günü yeniden koşulması gereken betik
 * oturumla birlikte kaybolurdu (OPS, 2026-09-24).
 *
 * ⚠VERİ DEPOYA GİRMEZ: sorgu ve sayfa listeleri PUBLIC depoya yazılmaz (pazar-olcum-standard P6).
 * `--cikti` depo içindeyse ve git o yolu yok saymıyorsa betik DURUR. Çıktı Linear kaydına eklenir.
 * Anahtar: `GSC_SA_ANAHTAR` ortam değişkeni (hizmet hesabı JSON dosyasının yolu); jetonu
 * `scripts/gsc/gsc-token.cjs` (ALTYAPI) üretir.
 *
 * Pencere: son 3 gün ön veri olduğu için dışarıda (P2), 90 gün geriye. Kırılımlar: toplam, gün, sayfa,
 * sorgu, sayfa×gün, sorgu×sayfa, cihaz, ülke + adres sınıfı özeti (ürün/kategori/marka/destek/ana/diğer).
 *
 * Kullanım: GSC_SA_ANAHTAR=<yol> node scripts/rehber/gsc-taban.mjs --cikti <depo-dışı-klasör> [--gun 90]
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

export const MULK = 'sc-domain:venthub.com.tr'
export const ON_VERI_GUNU = 3

const gun = (d) => d.toISOString().slice(0, 10)

/** Bugünden `ON_VERI_GUNU` geri biten, `n` günlük pencere. */
export function donem(bugun, n = 90) {
  const bitis = new Date(bugun.getTime() - ON_VERI_GUNU * 864e5)
  return { startDate: gun(new Date(bitis.getTime() - (n - 1) * 864e5)), endDate: gun(bitis) }
}

/** Adres → sınıf. Adres yayınında değişecek önekler (ürün, kategori, marka) ayrı sayılır. */
export function sinif(adres) {
  const p = new URL(adres).pathname
  if (/^\/(tr|en)\/(products|urun|urunler)\b/.test(p)) return 'urun'
  if (/^\/(tr|en)\/(category|kategori)\b/.test(p)) return 'kategori'
  if (/^\/(tr|en)\/(brands|markalar)\b/.test(p)) return 'marka'
  if (/^\/(tr|en)\/(destek|bilgi-merkezi|knowledge-hub)\b/.test(p)) return 'destek'
  if (/^\/(?:(tr|en)\/?)?$/.test(p)) return 'ana'
  return 'diger'
}

/** Sayfa satırları → sınıf başına sayfa/tık/gösterim. Sayfa bazında gösterim toplamı mülk toplamını AŞABİLİR (bir aramada birden çok sayfa). */
export function sinifOzeti(sayfaSatirlari) {
  const o = {}
  for (const r of sayfaSatirlari) {
    const s = sinif(r.keys[0])
    o[s] = o[s] || { sayfa: 0, tik: 0, gosterim: 0 }
    o[s].sayfa++; o[s].tik += r.clicks; o[s].gosterim += r.impressions
  }
  return o
}

/** Çıktı yolu depo içinde mi? (git yok sayıyorsa izinli — çağıran ayrıca `git check-ignore` ile sorar.) */
export function depoIcinde(yol, depoKoku) {
  const r = relative(resolve(depoKoku), resolve(yol))
  return r === '' || (!r.startsWith('..') && !isAbsolute(r))
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const cikti = deger('--cikti')
  const n = Number(deger('--gun') || 90)
  if (!cikti) { console.error('HATA: --cikti <depo-dışı-klasör> zorunlu (veri depoya girmez)'); process.exit(2) }
  if (!process.env.GSC_SA_ANAHTAR) { console.error('HATA: GSC_SA_ANAHTAR ortam değişkeni yok (hizmet hesabı JSON yolu)'); process.exit(2) }

  const kok = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: fileURLToPath(new URL('.', import.meta.url)) }).toString().trim()
  if (depoIcinde(cikti, kok)) {
    let yokSayiliyor = false
    try { execFileSync('git', ['check-ignore', '-q', resolve(cikti)], { cwd: kok }); yokSayiliyor = true } catch { yokSayiliyor = false }
    if (!yokSayiliyor) { console.error(`HATA: ${cikti} depo içinde ve git yok saymıyor — sorgu listesi PUBLIC depoya girer. Depo dışı klasör ver.`); process.exit(2) }
  }

  const token = execFileSync('node', [join(kok, 'scripts/gsc/gsc-token.cjs')], { env: process.env }).toString().trim()
  const sorgu = async (govde) => {
    const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(MULK)}/searchAnalytics/query`, {
      method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify(govde),
    })
    const j = await r.json()
    if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j.error || j)}`)
    return j.rows || []
  }
  const d = donem(new Date(), n)
  const t = { alinma: new Date().toISOString(), donem: d, mulk: MULK }
  t.toplam = await sorgu({ ...d })
  for (const [ad, boyut, sinir] of [['gun', ['date']], ['sayfa', ['page']], ['sorgu', ['query']], ['sayfaGun', ['page', 'date']],
    ['sorguSayfa', ['query', 'page']], ['cihaz', ['device'], 10], ['ulke', ['country'], 50]]) {
    t[ad] = await sorgu({ ...d, dimensions: boyut, rowLimit: sinir || 25000 })
  }
  t.sinifOzeti = sinifOzeti(t.sayfa)
  mkdirSync(cikti, { recursive: true })
  const dosya = join(cikti, `gsc-taban-${gun(new Date())}.json`)
  writeFileSync(dosya, JSON.stringify(t, null, 1))
  const top = t.toplam[0] || { clicks: 0, impressions: 0, position: 0 }
  console.log(`taban ${d.startDate}→${d.endDate} (ilk veri günü ${t.gun[0]?.keys[0] ?? '-'}, ${t.gun.length} gün): tık ${top.clicks} · gösterim ${top.impressions} · sıra ${(top.position || 0).toFixed(1)}`)
  console.log(`satır: sayfa ${t.sayfa.length} · sorgu ${t.sorgu.length} · sayfa×gün ${t.sayfaGun.length} · sorgu×sayfa ${t.sorguSayfa.length}`)
  console.log('adres sınıfı:', JSON.stringify(t.sinifOzeti))
  console.log(dosya)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 1 })
}
