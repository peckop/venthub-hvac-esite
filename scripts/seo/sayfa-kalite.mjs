/**
 * SAYFA KALİTESİ TARAMASI — unlighthouse sarmalayıcısı (plan rec-adres-agac-tek-yayin §5 Faz 5 ve §7
 * "unlighthouse (SEO ortalaması düşmez) öncesi/sonrası fark tablosu"; cetvel
 * docs/standards/yayin-gorunurluk-denetim-standard.md).
 *
 * Site haritasındaki her sayfaya Lighthouse koşar (örnekleme KAPALI: tam liste). Ölçüt SEO kategorisidir;
 * performans telefon benzetimiyle ölçülür ve ağ koşuluna bağlı gürültülüdür → bilgi olarak raporlanır,
 * kapı ölçütü değildir.
 *
 * Araç KURULMAZ: sürümü sabitli `npx -p @unlighthouse/cli@<SURUM> unlighthouse-ci` ile koşar; makinedeki
 * Chrome'u kullanır (ölçüldü 2026-09-24: "Using system Chrome"). package.json'a dokunmaz.
 *
 * Kullanım:
 *   node scripts/seo/sayfa-kalite.mjs --taban <https://site> --cikti <klasör>          # tarama
 *   node scripts/seo/sayfa-kalite.mjs --kiyas <önceki ci-result.json> <sonraki ci-result.json>  # fark
 * Çıkış: 0 temiz · 1 KIRMIZI (SEO < 1 olan sayfa ya da SEO ortalaması düştü) · 2 araç koşmadı.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
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
  const npx = npxYolu()
  if (!npx) { console.error('HATA: npm npx-cli.js bulunamadı'); process.exit(2) }
  mkdirSync(cikti, { recursive: true })
  try {
    execFileSync(process.execPath, [npx, '--yes', '-p', `@unlighthouse/cli@${SURUM}`, 'unlighthouse-ci', '--site', taban,
      '--sitemaps', `${taban}/sitemap.xml`, '--disable-dynamic-sampling', '--reporter', 'jsonExpanded', '--output-path', resolve(cikti), '--no-cache'],
    { stdio: ['ignore', 'ignore', 'ignore'], timeout: 3 * 3600 * 1000 })
  } catch { /* budget verilmediği için çıkış kodu anlamlı değil; rapor dosyası esastır */ }
  const dosya = join(resolve(cikti), 'ci-result.json')
  if (!existsSync(dosya)) { console.error('HATA: unlighthouse raporu üretilmedi (Chrome yok ya da site açılmadı)'); process.exit(2) }
  const o = ozetle(JSON.parse(readFileSync(dosya, 'utf8')))
  writeFileSync(join(resolve(cikti), 'sayfa-kalite-ozet.json'), JSON.stringify({ taban, alinma: new Date().toISOString(), surum: SURUM, ...o }, null, 1))
  console.log(JSON.stringify({ taban, sayfa: o.sayfa, ortalama: o.ortalama, seoEksik: o.seoEksik.length }))
  for (const s of o.seoEksik) console.log(`SEO<1 | ${s.yol} | ${s.seo}`)
  process.exit(o.seoEksik.length ? 1 : 0)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  calistir().catch((e) => { console.error('HATA', e.message); process.exitCode = 2 })
}
