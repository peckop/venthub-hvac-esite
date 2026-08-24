#!/usr/bin/env node
/**
 * T139-OLCEK hazırlık — kategori ağacında bulunamayan kodları DOĞRUDAN YOKLAR.
 *
 * Ölçülmüş gerçek (2026-08-21): vortice.com, GEÇERLİ bir kategori yolu + /<kod>
 * istendiğinde kategori fark etmeksizin o kodun GERÇEK ürün sayfasını çözümlüyor
 * (15261 /en/box-fans/ducted altında 200 + 12 adet _15261_ medya referansı).
 * Yumuşak-200'e karşı kapı: sayfada _<kod>_ deseni YOKSA bulunmadı sayılır
 * (99999 → 404 ölçüldü; ayrıca içerik kapısı çift emniyet).
 *
 * Kullanım: node scripts/media/vortice-probe-missing.mjs --map <vortice-url-map.json>
 * Haritayı yerinde günceller: bulunanlar found'a taşınır, kalanlar missing'de kalır.
 */
import fs from 'node:fs';

const DELAY_MS = 1500;
const UA = 'VentHub-image-pilot/0.1 (HVAC distributor catalog import; sequential polite probe)';
const TEMPLATE = 'https://www.vortice.com/en/box-fans/ducted/'; // geçerli kategori şablonu

const i = process.argv.indexOf('--map');
const mapPath = i > -1 ? process.argv[i + 1] : null;
if (!mapPath) { console.error('kullanım: --map <vortice-url-map.json>'); process.exit(2); }
const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
let last = 0;
const still = [];
for (const code of map.missing) {
  const wait = last + DELAY_MS - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  const url = TEMPLATE + code;
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    const html = res.ok ? await res.text() : '';
    if (res.ok && html.includes(`_${code}_`)) {
      map.found[code] = url;
      console.log(`[bulundu] ${code} (icerik kapisi: _${code}_ var)`);
    } else {
      still.push(code);
      console.log(`[yok] ${code} http=${res.status} icerik=${html.includes(`_${code}_`)}`);
    }
  } catch (e) {
    still.push(code);
    console.log(`[hata] ${code} ${e.message}`);
  }
  fs.writeFileSync(mapPath, JSON.stringify({ ...map, missing: still.concat(map.missing.slice(map.missing.indexOf(code) + 1)) }, null, 2));
}
map.missing = still;
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log(`bitti — bulunan toplam: ${Object.keys(map.found).length}, hala eksik: ${still.length} (${still.join(' ')})`);
