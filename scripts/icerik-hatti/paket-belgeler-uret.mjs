#!/usr/bin/env node
/**
 * PAKET BELGE TABLOSU — belgeler.csv (REC-212 F1 eki, OPS emri 2026-09-09 12:02Z)
 *
 * ── NİÇİN VAR
 * OPS hükmü: *"belge = pakette belgeler.csv (ürün/aile ↔ kaynak PDF bağı) olarak
 * tasarlanır, tablo sonra."* Yani müşteriye açık belge tablosu (REC-145) DB'de bir tablo
 * olmadan ÖNCE pakette bir CSV olarak yaşar. Paket ana kaynaktır (K13); belge bağı da
 * pakette doğar.
 *
 * ── ⛔BAĞ UYDURULMAZ — kanıt ile not AYRIMI KOLONDA
 * Bir belgenin hangi aileye ait olduğu çoğu zaman DİZİN ADINDAN türetilir. Bu bir
 * TAHMİNDİR, kanıt değildir. URL kuralının (web_kaynagi_ekle.py) aynısı burada da geçerli:
 * bağ kurulur ama `eslesme_kaynagi` kolonu HANGİ KADEMEDEN geldiğini adıyla yazar:
 *   dizin adi tam · dizin adi on ek · dizin son simge · dosya adi simgesi · marka geneli
 * Hiçbiri tutmazsa satır YİNE YAZILIR, aile boş kalır ve `eslesme_kaynagi = eslesme yok`.
 * Belgeyi tablodan düşürmek onu görünmez yapardı; kanıtsız bağ kurmak ise yalan olurdu.
 *
 * ── AYIRT EDİCİ SİMGE TEKİLLİK ŞARTI
 * "son token eşleşmesi" ancak o token TEK bir aileye götürüyorsa kabul edilir ve
 * genel kelimeler (fanlar/serisi/radyal/kanal…) simge sayılmaz. Tekillik gereklidir ama
 * yeterli değildir: alanın ANLAMI da ölçüte girer — bu ders 2026-09-09'da ödendi.
 *
 * ── ÜRÜN BAĞI NEDEN YOK
 * Ürün bazında belge bağı = adım 3'ün (kaynak eşlemesi) işi. Burada aile seviyesinde
 * bağ + o ailedeki ürün sayısı verilir. Uydurulmuş ürün bağı yerine SAYI konur.
 *
 * KOŞUM: node scripts/icerik-hatti/paket-belgeler-uret.mjs --hedef=<paket> --dizin=<sayfalar.jsonl>
 * Çıkış: 0 geçti · 2 ÖLÇÜLEMEDİ (fail-closed). CANLIYA YAZMAZ, salt okuma.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const arg = (ad, vars) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3) || vars
const HEDEF = arg('hedef', 'katalog-paketi')
const DIZIN = arg('dizin', 'C:/Users/alize/venthub-pdf-ingestor/kaynak-dizini/sayfalar.jsonl')
const HAM = join(HEDEF, 'ham')

if (!existsSync(DIZIN)) { console.error(`ÖLÇÜLEMEDİ — kaynak dizini YOK: ${DIZIN}`); process.exit(2) }
if (!existsSync(HAM)) { console.error(`ÖLÇÜLEMEDİ — ham dizini YOK: ${HAM}`); process.exit(2) }

const BOM = '\ufeff'
const csvHucre = (v) => {
  if (v == null) return ''
  let s = String(v).replace(/\r?\n/g, ' ').trim()
  return (s.includes(';') || s.includes('"')) ? '"' + s.replace(/"/g, '""') + '"' : s
}
const oku = (ad) => readFileSync(join(HAM, `${ad}.jsonl`), 'utf8')
  .split('\n').filter(Boolean).map(s => JSON.parse(s))

// ── kaynak dizini → belge başına tekilleştir (dizin satırı = SAYFA)
const belgeler = new Map()
for (const satir of readFileSync(DIZIN, 'utf8').split('\n')) {
  if (!satir.trim()) continue
  const k = JSON.parse(satir)
  const yol = k.dosya || ''
  if (!belgeler.has(yol)) {
    belgeler.set(yol, {
      dosya: yol, tur: k.tur || 'pdf', sha256: k.pdf_hash || '',
      url: k.url || '', url_kaynagi: k.url_kaynagi || '', sayfa: 0,
    })
  }
  belgeler.get(yol).sayfa++
}

const aileler = oku('product_families')
const urunler = oku('products')
const urunSayisi = new Map()
for (const u of urunler) {
  const f = u.family_id
  if (f) urunSayisi.set(f, (urunSayisi.get(f) || 0) + 1)
}

// ── simge tekilliği: her ailenin slug'ının SON parçası ayırt edici mi
const GENEL = new Set(['fanlar', 'fan', 'serisi', 'seri', 'radyal', 'kanal', 'range',
  'cihazlari', 'tipi', 'evo', 'roof', 'circular', 'rectangular', 'smoke', 'axial',
  'atex', 'quiet', 'serisi'])
const simgeSayaci = new Map()
for (const a of aileler) {
  for (const t of String(a.slug || '').split('-')) {
    if (t.length >= 3 && !GENEL.has(t)) simgeSayaci.set(t, (simgeSayaci.get(t) || 0) + 1)
  }
}

// ── AİLENİN MARKASI ürünlerinden ÖLÇÜLÜR, adından tahmin edilmez.
// Niçin kapı: `jet-serisi` (SEAT) ile Vortice'in "vort jet fan system" broşürü aynı
// `jet` simgesini taşıyor. Simge TEKİL ama ANLAMI farklı — tekillik gereklidir, yeterli
// değildir. Belgenin markası ile ailenin markası ayrışıyorsa bağ KURULMAZ.
const markaSlug = new Map(oku('brands').map(b => [b.id, String(b.slug || b.name || '').toLowerCase()]))
const aileMarka = new Map()
for (const u of urunler) {
  if (!u.family_id) continue
  // İKİ KAYNAK: brand_id çoğu üründe BOŞ (ölçüldü: JET serisinin 21 ürününde de boş),
  // marka adı serbest metin `brand` kolonunda duruyor. Tek kaynağa güvenmek kapıyı kör ederdi.
  const m = markaSlug.get(u.brand_id) || String(u.brand || '').toLowerCase().replace(/\s+/g, '-')
  if (m) aileMarka.set(u.family_id, m)
}

const markaAdi = (yol) => {
  const p = yol.split('/')
  const i = p.indexOf('markalar')
  if (i >= 0 && p[i + 1]) return p[i + 1]
  if (yol.includes('avensair')) return 'avens'
  return ''
}

const satirlar = []
let bagli = 0, bagsiz = 0
for (const b of [...belgeler.values()].sort((x, y) => x.dosya.localeCompare(y.dosya))) {
  const marka = markaAdi(b.dosya)
  const parcalar = b.dosya.split('/')
  const girdiIdx = parcalar.findIndex(p => p === '01-input')
  const dizinSon = girdiIdx > 0 ? parcalar[girdiIdx - 1] : ''
  const dosyaAdi = parcalar[parcalar.length - 1]
  // camelCase sınırı da ayırıcıdır: "fc51Design-Guide" → fc51 · design · guide
  const dosyaSimge = dosyaAdi.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/([0-9])([A-Za-z])/g, '$1-$2')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')

  const eslesen = []   // {aile, kaynak}
  for (const a of aileler) {
    const slug = String(a.slug || '')
    const aday = `${marka}-${dizinSon}`
    // Dizin-adı kademeleri MARKA önkoşulludur: dizin ağacı markaya göre kurulmuş.
    if (marka && slug.startsWith(marka)) {
      if (slug === aday) { eslesen.push([a, 'dizin adi tam']); continue }
      if (dizinSon && slug.startsWith(aday + '-')) { eslesen.push([a, 'dizin adi on ek']); continue }
      // Kısa aile simgesi (`at`, `dd`): dizin `radyal-fanlar-at` ↔ slug `nicotra-gebhardt-at`.
      // 3-harf tekillik şartı bunları eliyordu; marka önkoşulu burada zaten sağlandığı için
      // iki harflik simgeye bu kademede güvenilebilir.
      // SINIR: yalnız KISA AİLE SİMGESİ (at · dd · adh · rdh · fc102). Uzun/genel son ekler
      // (atex · evo · range · serisi) tesadüfen eşleşiyordu ve DÖRT yanlış bağ üretti —
      // ör. `vort-e-atex` → `vorticent-cms-atex`, `radon-range` → `deumido-range`.
      const sonD = dizinSon.split('-').pop(), sonS = slug.split('-').pop()
      if (sonD && sonD === sonS && sonD.length <= 5 && !GENEL.has(sonD)) {
        eslesen.push([a, 'dizin son ek (marka icinde)']); continue
      }
    }
    // Simge kademelerinde marka önkoşulu YOKTUR: aile adı markanın adını taşımayabilir
    // (SEAT klasöründeki `storm-serisi` ve `jet-serisi` böyle elenmişti). Yanlış bağ
    // riskini burada TEKİLLİK kapatır — simge tek bir aileye götürmüyorsa bağ kurulmaz.
    const son = slug.split('-').filter(t => t.length >= 3 && !GENEL.has(t)).pop()
    if (!son || simgeSayaci.get(son) !== 1) continue
    const am = aileMarka.get(a.id) || ''
    if (marka && am && !am.includes(marka) && !marka.includes(am)) continue   // marka ayrışması
    if (dizinSon.split('-').includes(son)) { eslesen.push([a, 'dizin son simge']); continue }
    if (dosyaSimge.split('-').includes(son)) { eslesen.push([a, 'dosya adi simgesi']); continue }
  }

  const ortak = {
    dosya: b.dosya, dosya_adi: dosyaAdi, tur: b.tur, marka,
    sayfa_sayisi: b.sayfa, sha256: b.sha256, url: b.url, url_kaynagi: b.url_kaynagi,
  }
  if (eslesen.length === 0) {
    // Fiyat listesi gibi marka geneli belgeler: aile boş, bağ MARKA seviyesinde.
    const markaGeneli = marka && aileler.some(a => String(a.slug || '').startsWith(marka))
    satirlar.push({ ...ortak, aile: '', aile_slug: '', urun_sayisi: '',
      eslesme_kaynagi: markaGeneli ? 'marka geneli' : 'eslesme yok' })
    bagsiz++
  } else {
    for (const [a, kaynak] of eslesen) {
      satirlar.push({ ...ortak, aile: a.name || '', aile_slug: a.slug || '',
        urun_sayisi: urunSayisi.get(a.id) || 0, eslesme_kaynagi: kaynak })
      bagli++
    }
  }
}

const BASLIK = ['dosya', 'dosya_adi', 'tur', 'marka', 'sayfa_sayisi', 'aile', 'aile_slug',
  'urun_sayisi', 'eslesme_kaynagi', 'sha256', 'url', 'url_kaynagi']
const yol = join(HEDEF, 'belgeler.csv')
writeFileSync(yol, BOM + [BASLIK.join(';'),
  ...satirlar.map(r => BASLIK.map(b => csvHucre(r[b])).join(';'))].join('\r\n') + '\r\n', 'utf8')

// ── KAPI: her belge tabloda en az bir satırla temsil edilmeli (fail-closed)
const temsil = new Set(satirlar.map(r => r.dosya))
if (temsil.size !== belgeler.size) {
  console.error(`ÖLÇÜLEMEDİ — dizinde ${belgeler.size} belge, tabloda ${temsil.size}`)
  process.exit(2)
}
const kademe = {}
for (const r of satirlar) kademe[r.eslesme_kaynagi] = (kademe[r.eslesme_kaynagi] || 0) + 1

// ── MANIFEST.md'ye bölüm — ÜRETİLİR, elle yazılmaz. Varsa yerine konur (idempotent):
// aynı koşum iki kez atıldığında dosya BÜYÜMEZ, bölüm tazelenir.
const mYol = join(HEDEF, 'MANIFEST.md')
if (existsSync(mYol)) {
  const BAS = '## Belge tablosu (belgeler.csv)'
  const blok = `${BAS}

**${belgeler.size} kaynak belge · ${satirlar.length} satır** (satır = belge × aile bağı).
Kaynak: \`kaynak-dizini/sayfalar.jsonl\` — PDF **yeniden açılmaz** (K15).

| eşleşme kademesi | satır |
|---|---|
${Object.entries(kademe).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

⛔**\`eslesme_kaynagi\` kolonunu OKU.** Aile bağı çoğu belgede **dizin adından türetilmiştir**
— bu bir tahmindir, kanıt değildir. \`marka geneli\` = belge tek bir aileye ait değil
(katalog, broşür, fiyat listesi); satır yine tabloda durur, aile hücresi boş kalır.
**Ürün bazında belge bağı YOKTUR** — o adım 3'ün (kaynak eşlemesi) işidir; burada
o ailedeki **ürün sayısı** verilir.
`
  const mevcut = readFileSync(mYol, 'utf8')
  const i = mevcut.indexOf(BAS)
  writeFileSync(mYol, i >= 0 ? mevcut.slice(0, i) + blok : mevcut.trimEnd() + '\n\n' + blok, 'utf8')
}

console.log(`belgeler.csv YAZILDI: ${satirlar.length} satır · ${belgeler.size} belge`)
console.log(`  aileye bağlanan satır ${bagli} · aile bağı kurulamayan belge ${bagsiz}`)
for (const [k, v] of Object.entries(kademe).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`)
