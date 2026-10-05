/**
 * SİTE İÇİ BAĞLANTI TARAMASI — linkinator sarmalayıcısı (plan rec-adres-agac-tek-yayin §5 Faz 5 ve §7
 * "linkinator (kırık 0, zincir 0)"; cetvel docs/standards/yayin-gorunurluk-denetim-standard.md).
 *
 * Site haritasındaki her sayfayı açar, sayfalardaki site içi bağlantı + ürün görseli adreslerini sınar.
 * Yönlendirme UYARI olarak işaretlenir (zincir sayılır), 4xx/5xx KIRMIZI. Dış siteler atlanır.
 *
 * Araç KURULMAZ: sürümü sabitli `npx linkinator@<SURUM>` ile koşar, package.json'a dokunmaz (kurulum kararı
 * ALTYAPI'da, bagimlilik-kararlari.md). ⚠Ölçüldü 2026-09-24: 8.1.0'da `--sitemap` bu sitede tek çıktı
 * vermedi; `--sitemap-url` + `--format json` BOŞ rapor verdi → `--sitemap-url` + `--format csv` kullanılır.
 * 429 (görsel deposu hız sınırı) kırık değildir: `--retry` ile yeniden denenir, kalanı ayrı sayılır.
 *
 * Kullanım: node scripts/seo/link-tara.mjs --taban <https://site> --cikti <klasör> [--es-zaman 6]
 * Çıkış: 0 temiz · 1 KIRMIZI (kırık ya da yönlendirme) · 2 araç koşmadı.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SURUM = '8.1.0'
export const GORSEL_DEPOSU = 'tnofewwkwlyjsqgwjjga\\.supabase\\.co'

/** linkinator CSV (url,status,state,parent,failureDetails) → satırlar. failureDetails JSON'u virgül içerebilir. */
export function csvAyristir(csv) {
  const satirlar = csv.replace(/\r/g, '').split('\n').filter(Boolean)
  if (!satirlar.length || !/^url,status,state,parent,failureDetails$/.test(satirlar[0])) return null
  return satirlar.slice(1).map((s) => {
    const p = s.split(',')
    return { url: p[0], status: Number(p[1]), state: p[2], parent: p[3], failureDetails: p.slice(4).join(',') }
  })
}

/** Satırlar → özet: kırık (tekil adres), 429 ayrı, yönlendirme uyarısı, taranan kök sayfa. */
export function ozetle(satirlar) {
  // İlk görülen satır örnek sayfa olarak kalır
  const tekil = (xs) => { const m = new Map(); for (const x of xs) if (!m.has(x.url)) m.set(x.url, x); return [...m.values()] }
  const kirik = tekil(satirlar.filter((s) => s.state === 'BROKEN' && s.status !== 429))
  const hizSiniri = tekil(satirlar.filter((s) => s.status === 429))
  const yonlendirme = tekil(satirlar.filter((s) => s.state !== 'BROKEN' && s.failureDetails && s.failureDetails !== '[]' && /redirect|30[1278]/i.test(s.failureDetails)))
  const yerSay = (u) => satirlar.filter((s) => s.url === u).length
  return {
    bagArti: satirlar.length,
    tekilAdres: new Set(satirlar.map((s) => s.url)).size,
    kokSayfa: satirlar.filter((s) => !s.parent).length,
    kirik: kirik.map((k) => ({ url: k.url, status: k.status, ornekSayfa: k.parent, yer: yerSay(k.url) })),
    hizSiniri: hizSiniri.length,
    yonlendirme: yonlendirme.map((k) => ({ url: k.url, ornekSayfa: k.parent, ayrinti: k.failureDetails.slice(0, 200) })),
  }
}

/**
 * npx'i KABUKSUZ çağırmak için npm'in npx-cli.js dosyası. Kabuk (Windows cmd) `--skip` desenindeki `|` ve `^`
 * karakterlerini kendi sözdizimi sayar ve deseni bozar; `.cmd` dosyası da kabuksuz başlatılamaz.
 */
export function npxYolu(nodeYolu = process.execPath) {
  const d = dirname(nodeYolu)
  for (const aday of [join(d, 'node_modules/npm/bin/npx-cli.js'), join(d, '../lib/node_modules/npm/bin/npx-cli.js')]) {
    if (existsSync(aday)) return aday
  }
  return null
}

async function calistir() {
  const arg = process.argv.slice(2)
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const taban = (deger('--taban') || 'https://venthub.com.tr').replace(/\/$/, '')
  const cikti = deger('--cikti')
  if (!cikti) { console.error('HATA: --cikti <klasör> zorunlu'); process.exit(2) }
  const host = new URL(taban).host.replace(/\./g, '\\.')
  const npx = npxYolu()
  if (!npx) { console.error('HATA: npm npx-cli.js bulunamadı (Node kurulumu standart değil)'); process.exit(2) }
  let csv
  try {
    csv = execFileSync(process.execPath, [npx, '--yes', `linkinator@${SURUM}`, taban, '--sitemap-url', `${taban}/sitemap.xml`,
      '--redirects', 'warn', '--concurrency', deger('--es-zaman') || '6', '--timeout', '20000', '--retry',
      '--skip', `^(?!https?://(${host}|${GORSEL_DEPOSU}))`, '--format', 'csv'],
    { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
  } catch (e) {
    csv = e.stdout || '' // linkinator kırık bulunca çıkış 1 verir; çıktı yine geçerlidir
  }
  const satirlar = csvAyristir(csv)
  if (!satirlar) { console.error('HATA: linkinator çıktısı okunamadı (araç koşmadı ya da biçim değişti)'); process.exit(2) }
  const o = ozetle(satirlar)
  mkdirSync(cikti, { recursive: true })
  const damga = new Date().toISOString().replace(/[:.]/g, '-')
  writeFileSync(join(cikti, `link-tara-${damga}.csv`), csv)
  writeFileSync(join(cikti, `link-tara-${damga}.json`), JSON.stringify({ taban, alinma: new Date().toISOString(), surum: SURUM, ...o }, null, 1))
  console.log(JSON.stringify({ taban, kokSayfa: o.kokSayfa, tekilAdres: o.tekilAdres, kirik: o.kirik.length, yonlendirme: o.yonlendirme.length, hizSiniri: o.hizSiniri }))
  for (const k of o.kirik) console.log(`KIRIK ${k.status} | ${k.url} | ${k.yer} yerde, ör. ${k.ornekSayfa}`)
  for (const k of o.yonlendirme.slice(0, 20)) console.log(`YONLENDIRME | ${k.url} | ör. ${k.ornekSayfa}`)
  process.exit(o.kirik.length || o.yonlendirme.length ? 1 : 0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
