// Pencere acilis suresini SAYFA ICINDEN olcer (Playwright tiklama/bekleme yukunu disarida birakir):
// DOM click() → MutationObserver ile arama girdisinin DOM'a girdigi an + ilk boyama (rAF×2).
const { chromium } = require(process.argv[3])
const BASE = process.argv[2], N = Number(process.argv[4] || 8)
;(async () => {
  const s = []
  for (let i = 0; i < N; i++) {
    const b = await chromium.launch()
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
    await p.goto(BASE + '/tr', { waitUntil: 'load' })
    await p.waitForTimeout(3000)
    const r = await p.evaluate(() => new Promise((coz) => {
      const dugme = [...document.querySelectorAll('header button[aria-haspopup="dialog"][aria-label]')].find((x) => /Ara/.test(x.textContent))
      const t0 = performance.now()
      let dom = -1
      let yerTutucu = -1
      const bak = () => document.querySelector('[aria-modal="true"] input')
      const mo = new MutationObserver(() => {
        if (yerTutucu < 0 && document.querySelector('.z-modal.animate-pulse')) yerTutucu = Math.round(performance.now() - t0)
        if (dom < 0 && bak()) {
          dom = performance.now() - t0
          mo.disconnect()
          requestAnimationFrame(() => requestAnimationFrame(() => coz({ yerTutucu, dom: Math.round(dom), boya: Math.round(performance.now() - t0) })))
        }
      })
      mo.observe(document.body, { childList: true, subtree: true })
      dugme.click()
      setTimeout(() => coz({ dom: -1, boya: -1 }), 5000)
    }))
    s.push(r)
    await b.close()
  }
  console.log(JSON.stringify(s))
  const med = (k) => { const a = s.map((x) => x[k]).sort((x, y) => x - y); return a[Math.floor(a.length / 2)] }
  console.log('medyan dom', med('dom'), 'boya', med('boya'))
})()
