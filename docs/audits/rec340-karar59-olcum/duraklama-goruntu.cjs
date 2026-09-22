// Gorsel kanit: ikinci aramada sunucu duraklamasini (2,5 sn) YAPAY uretir, 900 ms'de ekran goruntusu alir.
// Beklenen: onceki sonuclar soluk ama ekranda + "Araniyor" satiri. Uc goruntu: once / duraklama / sonra.
const { chromium } = require(process.argv[3])
const BASE = process.argv[2], DIZIN = process.argv[4]
;(async () => {
  const b = await chromium.launch()
  const p = await (await b.newContext({ viewport: { width: 1280, height: 800 } })).newPage()
  let geciktir = false
  await p.route(/\/rest\/v1\/rpc\/(fts_search_products|get_search_suggestions)/, async (r) => {
    if (geciktir) await new Promise((x) => setTimeout(x, 2500))
    await r.continue()
  })
  await p.goto(BASE + '/tr', { waitUntil: 'load' })
  await p.waitForTimeout(2500)
  const tetik = p.locator('header button[aria-haspopup="dialog"][aria-label]').filter({ hasText: /Ara/ }).first()
  await tetik.click()
  await p.locator('[aria-modal="true"] input').waitFor({ state: 'visible' })
  await p.keyboard.type('lineo', { delay: 60 })
  await p.waitForFunction(() => [...document.querySelectorAll('[aria-modal="true"] li')].some((li) => li.textContent.toUpperCase().includes('LINEO')))
  await p.waitForTimeout(400)
  await p.screenshot({ path: DIZIN + '/k147-1-once.png' })
  geciktir = true
  await p.keyboard.type(' quiet', { delay: 60 })
  await p.waitForTimeout(200 + 900) // debounce 200 + esik 600 gecildi
  const durum = await p.evaluate(() => ({ busy: document.querySelector('[aria-busy]')?.getAttribute('aria-busy'), ipucu: document.querySelector('[role="status"]')?.textContent || null,
    satir: document.querySelectorAll('[aria-modal="true"] li').length, kutu: document.querySelector('[aria-modal="true"] input')?.value }))
  await p.screenshot({ path: DIZIN + '/k147-2-duraklama.png' })
  await p.waitForFunction(() => !document.querySelector('[role="status"]'), null, { timeout: 8000 })
  await p.waitForTimeout(300)
  await p.screenshot({ path: DIZIN + '/k147-3-sonra.png' })
  console.log(JSON.stringify(durum))
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
