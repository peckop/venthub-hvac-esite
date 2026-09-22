// Karar 59, ayirici deney: "bosta kalma" mi, "o donemde makine yavas" mi?
// Her tur: 45 sn bosluk → PROBE (fts+oneri paralel) → 1 sn arayla 8 SICAK istek. 10 tur.
// Ayni zaman diliminde iki kol: bosluk etkisi varsa PROBE yavas, SICAK hizli; donem etkisiyse ikisi birlikte yavas.
const fs = require('fs')
const env = Object.fromEntries(fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter((s) => /^[A-Z_]+=/.test(s))
  .map((s) => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1).replace(/^["']|["']$/g, '')] }))
const U = env.NEXT_PUBLIC_SUPABASE_URL, K = env.NEXT_PUBLIC_SUPABASE_ANON_KEY, CIKTI = process.argv[3]
async function rpc(f, b) {
  const r = await fetch(`${U}/rest/v1/rpc/${f}`, { method: 'POST',
    headers: { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  await r.text(); return Number(r.headers.get('x-envoy-upstream-service-time'))
}
const arama = async (q) => Math.max(...await Promise.all([rpc('fts_search_products', { p_q: q, p_limit: 20, p_filters: {} }), rpc('get_search_suggestions', { p_q: q, p_limit: 6 })]))
const uyu = (ms) => new Promise((r) => setTimeout(r, ms))
;(async () => {
  const log = (x) => fs.appendFileSync(CIKTI, x + '\n'); const P = [], W = []
  log('BASLA ' + new Date().toISOString())
  for (let t = 0; t < 10; t++) {
    await uyu(45000)
    const p = await arama(t % 2 ? 'lineo' : 'jet fan'); P.push(p)
    const w = []; for (let i = 0; i < 8; i++) { await uyu(1000); w.push(await arama(i % 2 ? 'lineo' : 'jet fan')) }
    W.push(...w); log(`TUR ${t + 1} ${new Date().toISOString().slice(11, 19)} probe=${p} sicak=${w.join(',')}`)
  }
  const oz = (ad, a) => { const s = [...a].sort((x, y) => x - y); return `${ad} n=${a.length} p50=${s[Math.floor(s.length / 2)]} p95=${s[Math.floor(s.length * .95)]} max=${s[s.length - 1]} ≥1sn=${a.filter((x) => x >= 1000).length} ≥500=${a.filter((x) => x >= 500).length}` }
  log(oz('PROBE', P)); log(oz('SICAK', W)); log('BITTI')
})().catch((e) => { fs.appendFileSync(CIKTI, 'HATA ' + e.stack + '\n') })
