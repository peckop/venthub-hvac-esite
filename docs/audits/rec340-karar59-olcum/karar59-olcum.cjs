// Karar 59 olcumu: aralikli arama bekleyisinin IKI kaynagini ayirir.
// Evre S (sicak): 150 istek, 2 sn arayla → baglanti havuzu hep sicak; uclar = islemci dalgalanmasi.
// Evre C (soguk): 20 deneme, her biri 45 sn bosluktan sonra → ilk istek soguk arka uca duser.
// Her istekte fts + oneri PARALEL (tarayicidaki gibi); olculen: ikisinin EN YAVASI (ekranda beklenen).
// Yalniz sonuc donduren sorgular (K10.1 gunlugu tetiklenmez). Anahtar ekrana basilmaz.
const fs = require('fs')
const env = Object.fromEntries(fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/).filter((s) => /^[A-Z_]+=/.test(s))
  .map((s) => { const i = s.indexOf('='); return [s.slice(0, i), s.slice(i + 1).replace(/^["']|["']$/g, '')] }))
const U = env.NEXT_PUBLIC_SUPABASE_URL, K = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const CIKTI = process.argv[3]
const QS = ['jet fan', 'lineo']
async function rpc(f, b) {
  const t0 = performance.now()
  const r = await fetch(`${U}/rest/v1/rpc/${f}`, { method: 'POST',
    headers: { apikey: K, Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' }, body: JSON.stringify(b) })
  const n = (await r.json()).length
  return { sunucu: Number(r.headers.get('x-envoy-upstream-service-time')), toplam: Math.round(performance.now() - t0), n, durum: r.status }
}
async function arama(q) {
  const [a, b] = await Promise.all([rpc('fts_search_products', { p_q: q, p_limit: 20, p_filters: {} }), rpc('get_search_suggestions', { p_q: q, p_limit: 6 })])
  return { zaman: new Date().toISOString(), q, sunucu: Math.max(a.sunucu, b.sunucu), toplam: Math.max(a.toplam, b.toplam), bos: a.n === 0 || b.n === 0, hata: a.durum !== 200 || b.durum !== 200 }
}
const uyu = (ms) => new Promise((r) => setTimeout(r, ms))
function ozet(ad, a) {
  const s = (k) => a.map((x) => x[k]).sort((x, y) => x - y)
  const p = (arr, q) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))]
  const sun = s('sunucu'), top = s('toplam')
  return `${ad} n=${a.length} | sunucu p50=${p(sun, .5)} p95=${p(sun, .95)} max=${sun[sun.length - 1]} ≥1sn=${sun.filter((x) => x >= 1000).length} ≥500=${sun.filter((x) => x >= 500).length}` +
    ` | toplam p50=${p(top, .5)} p95=${p(top, .95)} max=${top[top.length - 1]} ≥1sn=${top.filter((x) => x >= 1000).length} | bos=${a.filter((x) => x.bos).length} hata=${a.filter((x) => x.hata).length}`
}
;(async () => {
  const S = [], C = [], log = (x) => fs.appendFileSync(CIKTI, x + '\n')
  log('BASLA ' + new Date().toISOString())
  await arama('lineo'); await arama('jet fan')
  for (let i = 0; i < 150; i++) { const r = await arama(QS[i % 2]); S.push(r); log('S ' + JSON.stringify(r)); await uyu(2000) }
  log(ozet('SICAK', S))
  for (let i = 0; i < 20; i++) {
    await uyu(45000)
    const ilk = await arama(QS[i % 2]); await uyu(300); const ikinci = await arama(QS[(i + 1) % 2])
    C.push({ ...ilk, ikinci_sunucu: ikinci.sunucu, ikinci_toplam: ikinci.toplam })
    log('C ' + JSON.stringify(C[C.length - 1]))
  }
  log(ozet('SOGUK-ilk', C))
  log(ozet('SOGUK-ikinci', C.map((x) => ({ ...x, sunucu: x.ikinci_sunucu, toplam: x.ikinci_toplam }))))
  log('BITTI ' + new Date().toISOString())
})().catch((e) => { fs.appendFileSync(CIKTI, 'HATA ' + e.stack + '\n'); process.exit(1) })
