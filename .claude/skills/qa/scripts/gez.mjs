#!/usr/bin/env node
/* eslint-disable no-console -- CLI betiği: stdout'taki etiketli satırlar (URL= CONSOLE_ERRORS= …) rapor arayüzüdür */
/**
 * qa/gez.mjs — tek sayfayı gerçek tarayıcıda gez, kanıt üret.
 *
 * Kullanım:
 *   node .claude/skills/qa/scripts/gez.mjs <url> [--out <dizin>] [--ad <isim>] [--mobil] [--tikla "<rol>:<ad>"]
 *
 * Çıktı (stdout, satır etiketli — rapora olduğu gibi kopyalanır):
 *   URL=…            gezilen/son URL
 *   HTTP=…           ana belge durumu
 *   CONSOLE_ERRORS=  JSON dizi (console.error + uncaught + unhandledrejection + hydration)
 *   LINKS_BROKEN=    JSON dizi (aynı origin, HEAD 4xx/5xx/ERR) — yalnız --linkler verilirse
 *   TEXT_WORDS=      sunucu HTML'indeki görünür kelime sayısı (RSC/Suspense sınırı ölçümü, kural 5)
 *   SCREENSHOT=…     dosya yolu (tam sayfa JPEG)
 *   INTERACTIVE=     buton/link/form sayıları
 *   QA_STEP_OK       betik sonuna ulaşıldı
 *
 * Kurallar: kimlik bilgisi YAZMAZ; yalnız --tikla ile verilen tek etkileşimi yapar; prod'da
 * ödeme/sipariş/silme adımına ASLA gitmez (bkz. SKILL.md güvenlik sınırı).
 */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

import { chromium, devices } from '@playwright/test'

const args = process.argv.slice(2)
const url = args.find((a) => !a.startsWith('--'))
if (!url) {
  console.error('kullanım: gez.mjs <url> [--out dizin] [--ad isim] [--mobil] [--linkler] [--tikla "rol:ad"]')
  process.exit(2)
}
const opt = (k, d) => {
  const i = args.indexOf(k)
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : d
}
const out = opt('--out', 'qa-raporlari/ekran')
const ad = opt('--ad', new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'ana')
const mobil = args.includes('--mobil')
const linkler = args.includes('--linkler')
const tikla = opt('--tikla', null)
mkdirSync(out, { recursive: true })

// Sunucu HTML'i (JS yok): kural 5 ölçümü — Suspense sınırı sayfa kökündeyse gövde 0 kelime gelir.
let textWords = -1
let http = 0
try {
  const r = await fetch(url, { headers: { 'user-agent': 'venthub-qa-gez' } })
  http = r.status
  const html = await r.text()
  const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  textWords = body.split(/\s+/).filter((w) => w.length > 1).length
} catch (e) {
  console.log('FETCH_ERR=' + String(e && e.message))
}

// Tarayıcı: kurulu Playwright sürümü kendi Chromium'unu bulamazsa QA_CHROMIUM ile verilen ikili
// (ör. uzak konteynerde /opt/pw-browsers/chromium) kullanılır; hiçbir zaman indirme yapılmaz.
const executablePath = process.env.QA_CHROMIUM || undefined
const browser = await chromium.launch({ executablePath })
const ctx = await browser.newContext(mobil ? { ...devices['Pixel 7'] } : { viewport: { width: 1366, height: 900 } })
const page = await ctx.newPage()
const errs = []
page.on('console', (m) => {
  if (m.type() === 'error') errs.push(m.text())
})
page.on('pageerror', (e) => errs.push('uncaught: ' + e.message))
await page.addInitScript(() => {
  window.addEventListener('unhandledrejection', (e) => {
    console.error('unhandledrejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)))
  })
})

await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })

if (tikla) {
  const [rol, ...rest] = tikla.split(':')
  const name = rest.join(':')
  await page.screenshot({ path: join(out, `${ad}${mobil ? '-mobil' : ''}-once.jpg`), type: 'jpeg', quality: 60, fullPage: true })
  await page.getByRole(rol, { name }).first().click()
  await page.waitForLoadState('networkidle').catch(() => {})
  console.log('TIKLANDI=' + tikla)
}

const inter = await page.evaluate(() => ({
  buton: document.querySelectorAll('button,[role=button]').length,
  link: document.querySelectorAll('a[href]').length,
  form: document.querySelectorAll('form').length,
  input: document.querySelectorAll('input,select,textarea').length,
}))

let broken = []
if (linkler) {
  const hrefs = await page.evaluate(() =>
    [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.href))].filter(
      (h) => new URL(h).origin === location.origin && !/logout|cikis|sil|delete|remove|cancel|iptal/i.test(h),
    ),
  )
  for (const h of hrefs) {
    try {
      const r = await fetch(h, { method: 'HEAD', headers: { 'user-agent': 'venthub-qa-gez' } })
      if (r.status >= 400) broken.push({ url: h, status: r.status })
    } catch (e) {
      broken.push({ url: h, status: 'ERR ' + String(e && e.message) })
    }
  }
  console.log('LINKS_TOTAL=' + hrefs.length)
}

const shot = join(out, `${ad}${mobil ? '-mobil' : ''}${tikla ? '-sonra' : ''}.jpg`)
await page.screenshot({ path: shot, type: 'jpeg', quality: 60, fullPage: true })

console.log('URL=' + page.url())
console.log('HTTP=' + http)
console.log('TEXT_WORDS=' + textWords)
console.log('INTERACTIVE=' + JSON.stringify(inter))
console.log('CONSOLE_ERRORS=' + JSON.stringify(errs))
if (linkler) console.log('LINKS_BROKEN=' + JSON.stringify(broken))
console.log('SCREENSHOT=' + shot)
await browser.close()
console.log('QA_STEP_OK')
