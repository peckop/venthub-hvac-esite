/**
 * SAYFA KALİTESİ TARAMASI — iki kip (plan rec-adres-agac-tek-yayin §5 Faz 5 ve §7 "SEO ortalaması düşmez"
 * öncesi/sonrası fark tablosu; cetvel docs/standards/yayin-gorunurluk-denetim-standard.md Y1).
 *
 * Site haritasındaki her sayfaya Lighthouse koşar (örnekleme KAPALI: tam liste). Ölçüt SEO kategorisidir;
 * performans telefon benzetimiyle ölçülür ve gürültülüdür → bilgi olarak raporlanır, kapı ölçütü değildir
 * (hız işi REC-398).
 *
 * `--kip psi` (VARSAYILAN): PageSpeed Insights API v5 — Lighthouse Google'ın sunucusunda koşar, bu makinenin
 *   belleğine bağlı değildir. Anahtar yalnız `PAGESPEED_API_KEY` ortam değişkeninden okunur (karar 127) ve hiçbir
 *   çıktıya yazılmaz. NİÇİN (ölçüldü 2026-09-25): yerel unlighthouse boş bellek ~1 GB iken "Unable to get browser
 *   page" ile üç koşuda düştü (59→24→3 sayfa); PSI 86/86 ölçtü. Tek deneme `FAILED_DOCUMENT_REQUEST` geçicidir
 *   (86 sayfanın 6'sı, yeniden denemede ölçüldü) → her sayfa en çok 3 kez denenir.
 * `--kip yerel`: sürümü sabitli `npx -p @unlighthouse/cli@<SURUM> unlighthouse-ci`, makinedeki Chrome; YEDEK.
 *   Aracın çıktısı artık `<cikti>/unlighthouse.log`'a yazılır (eskiden yutuluyordu; düşme sebebi görünmüyordu).
 *
 * Kullanım:
 *   node scripts/seo/sayfa-kalite.mjs --taban <https://site> --cikti <klasör> [--kip psi|yerel] [--strateji mobile|desktop]
 *   node scripts/seo/sayfa-kalite.mjs --kiyas <önceki sonuç.json> <sonraki sonuç.json>   # fark (iki kipin çıktısı da)
 * Çıkış: 0 temiz · 1 KIRMIZI (SEO < 1 sayfa, eksik tarama ya da SEO ortalaması düştü) · 2 araç koşmadı.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, openSync, closeSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { npxYolu } from './link-tara.mjs'

export const SURUM = '0.18.1'
const KAT = ['seo', 'accessibility', 'best-practices', 'performance']

/** unlighthouse jsonExpanded raporu → sayfa başına puanlar + ortalamalar. */
export function ozetle(rapor) {
  const sayfalar = (rapor?.routes ?? []).map((r) => ({
    yol: r.path,
    ...Object.fromEntries(KAT.map((k) => [k, r.categories?.[k]?.score ?? null])),
  }))
  const ort = Object.fromEntries(KAT.map((k) => {
    const xs = sayfalar.map((s) => s[k]).filter((x) => typeof x === 'number')
    return [k, xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(3) : null]
  }))
  const seoEksik = sayfalar.filter((s) => typeof s.seo === 'number' && s.seo < 1)
  return { sayfa: sayfalar.length, ortalama: ort, seoEksik, sayfalar }
}

/**
 * Toplu rapor (`ci-result.json`) yoksa sayfa başına `reports/**\/lighthouse.json` dosyalarından aynı biçimi kurar.
 * NİÇİN (ölçüldü 2026-09-24): 87 sayfalık tarama 59 sayfada durdu, çıkış 0 verdi ve toplu raporu YAZMADI;
 * sayfa raporları diskteydi. Kısmi sonuç sessiz sıfır olmasın diye okunur ve eksik sayfa sayısı ayrıca verilir.
 */
export function sayfaRaporlariniTopla(dizin) {
  const routes = []
  const gez = (d) => {
    for (const ad of readdirSync(d, { withFileTypes: true })) {
      const yol = join(d, ad.name)
      if (ad.isDirectory()) gez(yol)
      else if (ad.name === 'lighthouse.json') {
        try {
          const r = JSON.parse(readFileSync(yol, 'utf8'))
          const url = r.finalDisplayedUrl || r.finalUrl || r.requestedUrl
          routes.push({ path: url ? new URL(url).pathname : yol, categories: r.categories ?? {} })
        } catch { /* bozuk rapor sayılmaz; eksik sayısına yansır */ }
      }
    }
  }
  if (existsSync(dizin)) gez(dizin)
  return { routes }
}

/** PSI v5 yanıtı → `ozetle`'nin okuduğu rota biçimi. Hata yanıtı ya da eksik gövde null döner (sessiz sıfır değil). */
export function psiRota(yanit, istenenAdres) {
  const lh = yanit?.lighthouseResult
  if (!lh || yanit.error) return null
  const url = lh.finalDisplayedUrl || lh.finalUrl || istenenAdres
  let path
  try { path = new URL(url).pathname } catch { path = url }
  return { path, categories: lh.categories ?? {} }
}

/** Metinden anahtarı siler: PSI hata mesajı ya da fetch hatası istek adresini (key=…) taşıyabilir. */
export function anahtarGizle(metin, anahtar) {
  let s = String(metin ?? '')
  if (anahtar) s = s.split(anahtar).join('***')
  return s.replace(/([?&]key=)[^&\s"']+/g, '$1***')
}

/** Yeniden denenir mi: geçici hatalar (429, 5xx, Lighthouse'un sayfayı yükleyememesi, ağ). 4xx kimlik/kota hatası değil. */
export function yenidenDenenir(hata) {
  if (!hata) return false
  if (hata.ag) return true
  const kod = Number(hata.code)
  if (kod === 429 || kod >= 500) return true
  return kod === 400 && /FAILED_DOCUMENT_REQUEST|NO_FCP|ERRORED_DOCUMENT_REQUEST|PROTOCOL_TIMEOUT/.test(String(hata.message))
}

async function psiTara(taban, strateji, anahtar) {
  const xml = await (await fetch(`${taban}/sitemap.xml`)).text()
  const adresler = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const routes = [], hatali = []
  for (const adres of adresler) {
    const q = new URLSearchParams({ url: adres, strategy: strateji, key: anahtar })
    KAT.forEach((k) => q.append('category', k))
    let son = null
    for (let dene = 1; dene <= 3; dene++) {
      let hata = null
      try {
        const j = await (await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${q}`)).json()
        const r = psiRota(j, adres)
        if (r) { routes.push(r); son = null; break }
        hata = j.error ?? { code: 0, message: 'lighthouseResult yok' }
      } catch (e) { hata = { ag: true, message: e.message } }
      son = hata
      if (!yenidenDenenir(hata)) break
      await new Promise((s) => setTimeout(s, 5000 * dene))
    }
    if (son) hatali.push({ adres, hata: anahtarGizle(`${son.code ?? 'ag'} ${son.message ?? ''}`, anahtar).slice(0, 200) })
    process.stderr.write(`${routes.length + hatali.length}/${adresler.length} ${son ? 'HATA' : 'ok'} ${adres}\n`)
  }
  return { routes, hatali, haritaAdres: adresler.length }
}

/**
 * İki özet arasında fark. Adresler yayında değiştiği için sayfa sayfa değil ORTALAMA kıyaslanır;
 * yalnız aynı yol iki koşuda da varsa sayfa farkı ayrıca verilir.
 */
export function kiyasla(once, sonra) {
  const fark = Object.fromEntries(KAT.map((k) => [k, once.ortalama[k] == null || sonra.ortalama[k] == null ? null : +(sonra.ortalama[k] - once.ortalama[k]).toFixed(3)]))
  const onceHarita = new Map(once.sayfalar.map((s) => [s.yol, s]))
  const seoDusen = sonra.sayfalar.filter((s) => onceHarita.has(s.yol) && typeof s.seo === 'number' && s.seo < onceHarita.get(s.yol).seo)
  return { fark, seoDustu: fark.seo != null && fark.seo < 0, seoDusen: seoDusen.map((s) => ({ yol: s.yol, once: onceHarita.get(s.yol).seo, sonra: s.seo })) }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  if (arg.includes('--kiyas')) {
    const i = arg.indexOf('--kiyas')
    const [a, b] = [arg[i + 1], arg[i + 2]].map((p) => ozetle(JSON.parse(readFileSync(p, 'utf8'))))
    const k = kiyasla(a, b)
    console.log(JSON.stringify({ once: a.ortalama, sonra: b.ortalama, ...k }, null, 1))
    process.exit(k.seoDustu || k.seoDusen.length ? 1 : 0)
  }
  const taban = (deger('--taban') || 'https://venthub.com.tr').replace(/\/$/, '')
  const cikti = deger('--cikti')
  if (!cikti) { console.error('HATA: --cikti <klasör> zorunlu'); process.exit(2) }
  const kip = deger('--kip') || 'psi'
  if (kip === 'psi') {
    const anahtar = process.env.PAGESPEED_API_KEY
    if (!anahtar) { console.error('HATA: PAGESPEED_API_KEY ortam değişkeni yok (karar 127) — ya da --kip yerel'); process.exit(2) }
    const strateji = deger('--strateji') || 'mobile'
    mkdirSync(cikti, { recursive: true })
    const { routes, hatali, haritaAdres } = await psiTara(taban, strateji, anahtar)
    if (!routes.length) { console.error('HATA: PSI hiçbir sayfayı ölçmedi', JSON.stringify(hatali.slice(0, 3))); process.exit(2) }
    const o = ozetle({ routes })
    const eksik = Math.max(0, haritaAdres - o.sayfa)
    writeFileSync(join(resolve(cikti), 'psi-result.json'), JSON.stringify({ routes }, null, 1))
    writeFileSync(join(resolve(cikti), 'sayfa-kalite-ozet.json'), JSON.stringify({ taban, alinma: new Date().toISOString(), kip, strateji, haritaAdres, eksik, hatali, ...o }, null, 1))
    console.log(JSON.stringify({ taban, kip, strateji, sayfa: o.sayfa, haritaAdres, eksik, ortalama: o.ortalama, seoEksik: o.seoEksik.length }))
    for (const h of hatali) console.log(`HATA | ${h.adres} | ${h.hata}`)
    if (eksik) console.log(`EKSIK-TARAMA: ${o.sayfa}/${haritaAdres} sayfa ölçüldü — tam taban DEĞİL`)
    for (const s of o.seoEksik) console.log(`SEO<1 | ${s.yol} | ${s.seo}`)
    process.exit(o.seoEksik.length || eksik ? 1 : 0)
  }
  if (kip !== 'yerel') { console.error(`HATA: bilinmeyen --kip ${kip} (psi | yerel)`); process.exit(2) }
  const npx = npxYolu()
  if (!npx) { console.error('HATA: npm npx-cli.js bulunamadı'); process.exit(2) }
  mkdirSync(cikti, { recursive: true })
  // Günlük çıktı klasörünün YANINA yazılır: unlighthouse açılışta --output-path klasörünü temizler (ölçüldü 09-25,
  // klasör içindeki günlük silindi).
  const gunluk = `${resolve(cikti)}.unlighthouse.log`
  const fd = openSync(gunluk, 'w')
  try {
    execFileSync(process.execPath, [npx, '--yes', '-p', `@unlighthouse/cli@${SURUM}`, 'unlighthouse-ci', '--site', taban,
      '--sitemaps', `${taban}/sitemap.xml`, '--disable-dynamic-sampling', '--reporter', 'jsonExpanded', '--output-path', resolve(cikti), '--no-cache'],
    { stdio: ['ignore', fd, fd], timeout: 3 * 3600 * 1000 })
  } catch { /* budget verilmediği için çıkış kodu anlamlı değil; rapor dosyası esastır, düşme sebebi günlükte */ } finally { closeSync(fd) }
  const dosya = join(resolve(cikti), 'ci-result.json')
  const toplu = existsSync(dosya)
  const rapor = toplu ? JSON.parse(readFileSync(dosya, 'utf8')) : sayfaRaporlariniTopla(join(resolve(cikti), 'reports'))
  if (!rapor.routes.length) { console.error('HATA: unlighthouse hiçbir sayfa raporu üretmedi (Chrome yok ya da site açılmadı)'); process.exit(2) }
  const o = ozetle(rapor)
  // Eksik sayfa: site haritasındaki adres sayısı − ölçülen sayfa
  let haritaAdres = null
  try { haritaAdres = [...(await (await fetch(`${taban}/sitemap.xml`)).text()).matchAll(/<loc>/g)].length } catch { /* ölçülemedi */ }
  const eksik = haritaAdres == null ? null : Math.max(0, haritaAdres - o.sayfa)
  writeFileSync(join(resolve(cikti), 'sayfa-kalite-ozet.json'), JSON.stringify({ taban, alinma: new Date().toISOString(), surum: SURUM, topluRapor: toplu, haritaAdres, eksik, ...o }, null, 1))
  console.log(JSON.stringify({ taban, topluRapor: toplu, sayfa: o.sayfa, haritaAdres, eksik, ortalama: o.ortalama, seoEksik: o.seoEksik.length }))
  if (!toplu || eksik) console.log(`EKSIK-TARAMA: ${o.sayfa}/${haritaAdres ?? '?'} sayfa ölçüldü${toplu ? '' : ' (toplu rapor yok, sayfa raporlarından okundu)'} — tam taban DEĞİL`)
  for (const s of o.seoEksik) console.log(`SEO<1 | ${s.yol} | ${s.seo}`)
  process.exit(o.seoEksik.length || !toplu || eksik ? 1 : 0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
