/**
 * GOOGLEBOT GÖZÜYLE SAYFA DENETİMİ — Search Console URL Inspection API (REC-402; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md).
 *
 * NİÇİN: PageSpeed Insights ara sıra sayfayı yükleyemiyor (09-25: 6/86, 09-27: 1/86 FAILED_DOCUMENT_REQUEST;
 * aynı anda curl 200). Soru: aynı engel Googlebot'a da oluyor mu? Search Console'un "tarama istatistikleri"
 * raporu API'de YOK (ölçüldü 2026-09-27); URL Inspection API her sayfa için Googlebot'un son getirme sonucunu,
 * robots durumunu, dizin kararını ve son tarama zamanını verir.
 *
 * Kimlik: `scripts/gsc/gsc-token.cjs` (hizmet hesabı, GSC_SA_ANAHTAR). Kota: mülk başına günde 2000, dakikada 600.
 * Kullanım: node scripts/seo/gsc-url-denetim.mjs [--taban https://venthub.com.tr] [--site sc-domain:venthub.com.tr]
 *           --cikti <depo-dışı klasör>
 * Çıkış: 0 temiz · 1 KIRMIZI (getirme başarısız, robots engeli ya da denetlenemeyen sayfa) · 2 araç koşmadı.
 * Çıktı depoya girmez (pazar-olcum P6); özet sayı cetvelin ölçüm geçmişine yazılır.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const GUN = 24 * 3600 * 1000

/** Bir inceleme yanıtı → düz satır. Hata yanıtı `hata` alanıyla döner (sessiz sıfır değil). */
export function satirCikar(adres, yanit) {
  const r = yanit?.inspectionResult?.indexStatusResult
  if (!r) return { adres, hata: yanit?.error ? `${yanit.error.code} ${String(yanit.error.message).slice(0, 160)}` : 'indexStatusResult yok' }
  return {
    adres, karar: r.verdict ?? null, kapsam: r.coverageState ?? null, getirme: r.pageFetchState ?? null,
    robots: r.robotsTxtState ?? null, dizin: r.indexingState ?? null, sonTarama: r.lastCrawlTime ?? null,
    tarayici: r.crawledAs ?? null, googleKanonik: r.googleCanonical ?? null,
  }
}

/** Satırlar → özet. Kırmızı: getirme SUCCESSFUL değil (hiç taranmamış sayfa hariç), robots engeli, denetlenemeyen. */
export function ozetle(satirlar, simdi = Date.now()) {
  const say = (f) => satirlar.reduce((m, s) => { const k = f(s) ?? 'YOK'; m[k] = (m[k] ?? 0) + 1; return m }, {})
  const taranmis = satirlar.filter((s) => !s.hata && s.sonTarama)
  const yas = taranmis.map((s) => (simdi - Date.parse(s.sonTarama)) / GUN)
  const kova = { '0-7': 0, '8-30': 0, '31+': 0 }
  for (const g of yas) kova[g <= 7 ? '0-7' : g <= 30 ? '8-30' : '31+']++
  const kirmizi = satirlar.filter((s) => s.hata
    || (s.getirme && s.getirme !== 'SUCCESSFUL' && s.getirme !== 'PAGE_FETCH_STATE_UNSPECIFIED')
    || (s.robots && s.robots === 'DISALLOWED'))
  return {
    sayfa: satirlar.length, denetlenemeyen: satirlar.filter((s) => s.hata).length,
    karar: say((s) => s.karar), getirme: say((s) => s.getirme), robots: say((s) => s.robots),
    hicTaranmamis: satirlar.filter((s) => !s.hata && !s.sonTarama).length, taramaYasiGun: kova,
    kirmizi: kirmizi.map((s) => ({ adres: s.adres, getirme: s.getirme ?? null, robots: s.robots ?? null, hata: s.hata ?? null })),
  }
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const taban = (deger('--taban') || 'https://venthub.com.tr').replace(/\/$/, '')
  const site = deger('--site') || 'sc-domain:venthub.com.tr'
  const cikti = deger('--cikti')
  if (!cikti) { console.error('HATA: --cikti <klasör> zorunlu (depo dışı)'); process.exit(2) }
  const kok = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
  let jeton
  try { jeton = execFileSync('node', [join(kok, 'scripts/gsc/gsc-token.cjs')], { env: process.env }).toString().trim() } catch (e) {
    console.error('HATA: jeton alınamadı (GSC_SA_ANAHTAR?)', String(e.message).slice(0, 120)); process.exit(2)
  }
  const xml = await (await fetch(`${taban}/sitemap.xml`)).text()
  const adresler = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  if (!adresler.length) { console.error('HATA: site haritası boş'); process.exit(2) }
  const satirlar = []
  for (const adres of adresler) {
    let yanit
    try {
      yanit = await (await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST', headers: { authorization: `Bearer ${jeton}`, 'content-type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: adres, siteUrl: site, languageCode: 'tr' }),
      })).json()
    } catch (e) { yanit = { error: { code: 'ag', message: e.message } } }
    satirlar.push(satirCikar(adres, yanit))
    await new Promise((r) => setTimeout(r, 150))
  }
  const o = ozetle(satirlar)
  mkdirSync(cikti, { recursive: true })
  writeFileSync(join(resolve(cikti), 'gsc-url-denetim.json'), JSON.stringify({ taban, site, alinma: new Date().toISOString(), ozet: o, satirlar }, null, 1))
  console.log(JSON.stringify({ ...o, kirmizi: o.kirmizi.length }))
  for (const k of o.kirmizi) console.log(`KIRMIZI | ${k.adres} | getirme=${k.getirme} robots=${k.robots}${k.hata ? ' hata=' + k.hata : ''}`)
  process.exit(o.kirmizi.length ? 1 : 0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
