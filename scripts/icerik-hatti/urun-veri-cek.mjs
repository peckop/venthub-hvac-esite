// URUN VERI CEKME — kanit tablosunun girdisi (REC-163).
// SALT OKUMA. Servis anahtari kullanir cunku anon anahtar RLS altinda sessizce BOS doner
// (olculdu 2026-09-06) — bos veri "kanitsiz 0" gibi gorunur, en tehlikeli sahte yesil.
// tenant_id TASINIR: kanit satiri hangi kiracinin verisine ait oldugunu soylemezse
// cok-kiracili kurulumda baska kiracinin degeri bizim kanitimiz gibi sayilabilir.
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
const o = Object.fromEntries(readFileSync(ENV_YOL,'utf8').split(/\r?\n/).filter(s=>s&&!s.startsWith('#')&&s.includes('=')).map(s=>{const i=s.indexOf('=');return [s.slice(0,i).trim(), s.slice(i+1).trim().replace(/^["']|["']$/g,'')]}))
const U=o.SUPABASE_URL||o.NEXT_PUBLIC_SUPABASE_URL, K=o.SUPABASE_SERVICE_ROLE_KEY
const h={apikey:K,Authorization:`Bearer ${K}`}
const fam = await (await fetch(`${U}/rest/v1/product_families?select=id,slug`,{headers:h})).json()
const famMap = Object.fromEntries(fam.map(f=>[f.id,f.slug]))
// KESIN SAYI ONCE (1000 satir tavani, 2026-09-06): sunucunun bildirdigi sayiyla karsilastirilmayan
// sayfalama, tavana takilinca SESSIZCE eksik doner. Sayi alinamazsa KIRMIZI (fail-open yasak).
const sayiCevap = await fetch(`${U}/rest/v1/products?select=id&limit=1`,{headers:{...h,Prefer:'count=exact'}})
const kesinStr = (sayiCevap.headers.get('content-range')||'').split('/').pop()
if(!/^\d+$/.test(kesinStr)){ console.error('OLCUM GUVENILIR DEGIL: products kesin sayisi alinamadi (Content-Range:', sayiCevap.headers.get('content-range'), ')'); process.exit(1) }
const BOY = Number(process.env.SAYFA_BOYU||500) // sinav icin kucultulebilir: tablo tek sayfaya sigarsa sayfalama yolu HIC kosmaz
const kesin = Number(kesinStr), turTavani = Math.floor(kesin/BOY)+2
let out=[], from=0, tur=0
for(;;){
  if(++tur > turTavani){ console.error(`DONGU TAVANI asildi: ${tur} tur, beklenen en cok ${turTavani}`); process.exit(1) }
  const r = await fetch(`${U}/rest/v1/products?select=slug,family_id,tenant_id,technical_specs&order=slug`,{headers:{...h,Range:`${from}-${from+BOY-1}`}})
  const j = await r.json(); if(!j.length) break
  out = out.concat(j.map(p=>({slug:p.slug, family_slug:famMap[p.family_id]||null, tenant_id:p.tenant_id, technical_specs:p.technical_specs})))
  if(j.length<BOY) break; from+=BOY
}
if(out.length !== kesin){ console.error(`EKSIK VERI: cekilen ${out.length}, sunucu ${kesin} — cikti uretilmedi`); process.exit(1) }
writeFileSync(process.argv[2], JSON.stringify(out,null,1)+'\n','utf8')
console.log('urun yazildi:', out.length)
