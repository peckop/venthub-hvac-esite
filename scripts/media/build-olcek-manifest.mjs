#!/usr/bin/env node
/**
 * T139-OLCEK — url-haritasi + DB urun kayitlarini birlestirip kosum manifesti uretir.
 * SALT-OKUMA (anon anahtar, public SELECT). Kullanim:
 *   node build-olcek-manifest.mjs --map <vortice-url-map.json> --out <manifest.json> \
 *     --url <SUPABASE_URL> --key <ANON_KEY>
 */
import fs from 'node:fs';
const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : null; };
const map = JSON.parse(fs.readFileSync(arg('map'), 'utf8'));
const url = arg('url'), key = arg('key'), outPath = arg('out');
const codes = Object.keys(map.found);
const res = await fetch(`${url}/rest/v1/products?select=id,name,model_code,tenant_id&brand=ilike.vortice&deleted_at=is.null&model_code=in.(${codes.join(',')})`, {
  headers: { apikey: key, authorization: `Bearer ${key}` },
});
if (!res.ok) { console.error('DB okuma hatasi', res.status, await res.text()); process.exit(1); }
const rows = await res.json();
const tenants = new Set(rows.map(r => r.tenant_id));
if (tenants.size !== 1) { console.error('tenant tekil degil:', [...tenants]); process.exit(1); }
const pilots = rows.map(r => ({
  model_code: r.model_code,
  product_id: r.id,
  name: r.name,
  page_url: map.found[r.model_code],
})).sort((a, b) => a.model_code.localeCompare(b.model_code));
fs.writeFileSync(outPath, JSON.stringify({
  comment: `T139-OLCEK Vortice kosum manifesti — ${pilots.length} urun (url-haritasi ${codes.length} koddan DB ile kesisim).`,
  tenant_id: [...tenants][0],
  pilots,
}, null, 2));
console.log(`manifest: ${outPath} — urun: ${pilots.length} (harita ${codes.length}, DB kesisimi ${rows.length})`);
