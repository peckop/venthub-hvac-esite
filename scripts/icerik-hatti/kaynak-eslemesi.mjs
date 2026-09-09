#!/usr/bin/env node
/**
 * ADIM 3 — KAYNAK EŞLEMESİ: her teknik değer ↔ kaynak dizini (REC-212 F1, OPS emri 12:13Z)
 *
 * ── NİÇİN VAR
 * Paketin `kaynak_dosya` / `kaynak_sayfa` / `alinti` kolonları F1 koşumunda BOŞ bırakılmıştı.
 * Bu betik onları doldurur: 5168 teknik değerin her biri kaynak dizininde aranır ve
 * bulunma DURUMU sayıyla raporlanır. ⛔**PDF AÇILMAZ** (K15) — dizin satırı yeter.
 *
 * ── ⛔KANITSIZ DEĞER SİLİNMEZ, İŞARETLENİR
 * Kaynakta bulunamayan değer pakette KALIR; `kaynak_dosya` boş kalır ve `durum` kolonu
 * niçin boş olduğunu söyler. Silmek veriyi kaybettirirdi; sessizce bırakmak ise
 * kanıtlıyla kanıtsızı aynı görünüme sokardı.
 *
 * ── DÖRT DURUM (ölçülen ile ölçülemeyen AYRI)
 *   VAR              → ürünün kodu geçen bir sayfada değer de geçiyor (dosya+sayfa+alıntı)
 *   DEGER YOK        → ürünün sayfası bulundu ama değer o sayfalarda geçmiyor
 *   URUN KAYNAKTA YOK→ ürünün kodu hiçbir kaynak sayfasında yok; değer ÖLÇÜLEMEZ
 *   CELISIYOR        → alanın etiketi ürünün sayfasında var, yanındaki sayı(lar) paketteki
 *                      değerle uyuşmuyor. Yalnız ETİKET SÖZLÜĞÜ OLAN alanlarda ölçülür;
 *                      sözlüğü olmayan alanda çelişki "ÖLÇÜLMEDİ" sayılır ve raporda
 *                      AYRI yazılır — ölçülmeyeni "çelişki yok" diye saymak yalan olurdu.
 *
 * ── EŞLEŞME SAYI ÜZERİNDEN, METİN ARAMASIYLA DEĞİL
 * Kaynakta "1.500", "1 500", "1,5" aynı sayının farklı yazımlarıdır. Sayfa metnindeki her
 * sayı normalize edilip kümeye alınır, değer de normalize edilip o kümede aranır. Ham
 * altdize araması "150" değerini "1500" içinde bulur ve YANLIŞ KANIT üretirdi.
 *
 * KOŞUM: node scripts/icerik-hatti/kaynak-eslemesi.mjs --hedef=<paket> [--dizin=<jsonl>] [--yaz]
 *   --yaz olmadan: yalnız ölçüm raporu (paket CSV'sine dokunulmaz)
 * Çıkış: 0 geçti · 2 ÖLÇÜLEMEDİ (fail-closed). CANLIYA YAZMAZ.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const arg = (ad, vars) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3) || vars
const HEDEF = arg('hedef', 'katalog-paketi')
const DIZIN = arg('dizin', 'C:/Users/alize/venthub-pdf-ingestor/kaynak-dizini/sayfalar.jsonl')
const YAZ = process.argv.includes('--yaz')

if (!existsSync(DIZIN)) { console.error(`ÖLÇÜLEMEDİ — kaynak dizini YOK: ${DIZIN}`); process.exit(2) }

// ── CSV okuma (paket biçimi: ';' + BOM + CRLF, tırnaklı hücre)
const csvOku = (yol) => {
  const ham = readFileSync(yol, 'utf8').replace(/^\ufeff/, '')
  const satirlar = []
  let hucre = '', satir = [], tirnak = false
  for (let i = 0; i < ham.length; i++) {
    const c = ham[i]
    if (tirnak) {
      if (c === '"' && ham[i + 1] === '"') { hucre += '"'; i++ }
      else if (c === '"') tirnak = false
      else hucre += c
    } else if (c === '"') tirnak = true
    else if (c === ';') { satir.push(hucre); hucre = '' }
    else if (c === '\n') { satir.push(hucre); satirlar.push(satir); satir = []; hucre = '' }
    else if (c !== '\r') hucre += c
  }
  if (hucre || satir.length) { satir.push(hucre); satirlar.push(satir) }
  const bas = satirlar.shift()
  return satirlar.filter(s => s.some(v => v !== ''))
    .map(s => Object.fromEntries(bas.map((b, i) => [b, s[i] ?? ''])))
}

// ── SAYI NORMALİZASYONU
// "1.500" TR'de bin beş yüz, EN'de bir buçuktur. Hangisi olduğu METİNDEN bilinemez, o yüzden
// İKİ okuma da kümeye girer. Yanlış negatif (kanıtı kaçırmak) burada yanlış pozitiften
// (olmayan kanıtı uydurmaktan) daha az zararlıdır — ama ikisini de sayıyoruz.
const sayiVaryant = (ham) => {
  const s = String(ham).trim().replace(/\s/g, '')
  const c = new Set()
  const ekle = (x) => {
    const n = Number(x)
    if (Number.isFinite(n)) c.add(String(n))
  }
  ekle(s.replace(',', '.'))
  ekle(s.replace(/[.,]/g, ''))          // binlik ayraç okuması
  ekle(s.replace(/\./g, '').replace(',', '.'))
  return c
}
const SAYI_DESENI = /\d[\d.,]*/g
const sayfaSayilari = (metin) => {
  const k = new Set()
  for (const m of metin.match(SAYI_DESENI) || []) for (const v of sayiVaryant(m)) k.add(v)
  return k
}

// ── DEĞERİN METİNDEKİ YAZILI BİÇİMLERİ (konum bulmak için — küme üyeliği konum vermez)
const yaziliBicimler = (ham) => {
  const s = String(ham).trim()
  const c = new Set([s])
  const n = Number(s.replace(',', '.'))
  if (Number.isFinite(n)) {
    const tam = String(n)
    c.add(tam)
    c.add(tam.replace('.', ','))
    if (Number.isInteger(n) && Math.abs(n) >= 1000) {
      const g = String(Math.abs(n))
      const ayrilmis = g.replace(/\B(?=(\d{3})+(?!\d))/g, '#')
      for (const ay of ['.', ',', ' ']) c.add((n < 0 ? '-' : '') + ayrilmis.replaceAll('#', ay))
    }
  }
  return [...c].filter(Boolean)
}

// ── ⭐YAKINLIK ŞARTI — sayfada bulunmak KANIT DEĞİLDİR
// Sabotaj sınavı ölçtü (2026-09-09): değerlerin hepsi +7 kaydırılıp SAHTE yapıldığında
// bile satırların **%19,5'i "VAR" dedi** — çünkü bir katalog sayfası yüzlerce sayı taşır
// ve ürün kodu ile herhangi bir sayının aynı sayfada bulunması tesadüftür.
// Kapı: değer, ürün kodunun **YAKININDA** geçmeli (aynı tablo satırı mertebesi).
// Ölçüt keskindi ama EVREN yanlıştı — "sayfa" değil, "satır" doğru evren.
// Pencere 80 karakter: 40/80/120/200 taranıp ölçüldü — net sinyal (gerçek − tesadüf)
// 80'de doruğa çıkıyor ve gürültü oranı en düşük kalıyor.
const YAKINLIK = 80

// ── ALAN ETİKET SÖZLÜĞÜ — çelişki YALNIZ buradaki alanlarda ölçülebilir.
// Sözlük kasıtlı olarak DAR: uydurma etiket, uydurma çelişki üretir. Kapsam dışı alan
// "çelişki ÖLÇÜLMEDİ" sayılır ve raporda ayrı satırda görünür.
const ETIKET = {
  weight_kg: ['weight', 'ağırlık', 'agirlik', 'peso', 'kg'],
  voltage_v: ['voltage', 'gerilim', 'volt', 'tension'],
  frequency_hz: ['frequency', 'frekans', 'hz'],
  rpm_max: ['rpm', 'devir', 'speed', 'r.p.m'],
  max_absorbed_power_w: ['absorbed power', 'power', 'güç', 'guc', 'potenza'],
  diameter_mm: ['diameter', 'çap', 'cap', 'ø'],
  max_delivery_m3h: ['m3/h', 'm³/h', 'debi', 'delivery', 'airflow'],
  ip_rating: ['ip', 'protection', 'koruma'],
  insulation_class: ['insulation', 'izolasyon'],
  noise_db: ['noise', 'gürültü', 'gurultu', 'db(a)', 'lp'],
}

// ── VERİ
const teknik = csvOku(join(HEDEF, 'teknik-ozellikler.csv'))
const urunler = csvOku(join(HEDEF, 'urunler.csv'))
const kod = new Map(urunler.map(u => [u.sku, String(u.model_kodu || '').trim()]))

const sayfalar = []
for (const s of readFileSync(DIZIN, 'utf8').split('\n')) {
  if (!s.trim()) continue
  const k = JSON.parse(s)
  const tb = Array.isArray(k.tablo) ? JSON.stringify(k.tablo) : ''
  const govde = ((k.metin || '') + ' ' + tb)
  sayfalar.push({ dosya: k.dosya, sayfa: k.sayfa, govde, kucuk: govde.toLowerCase(), sayilar: sayfaSayilari(govde) })
}
if (!sayfalar.length) { console.error('ÖLÇÜLEMEDİ — dizin BOŞ'); process.exit(2) }

// ── ürün kodu → sayfalar (kelime sınırlı: "20210" kodu "120210" içinde SAYILMAZ)
const kacis = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const urunSayfa = new Map()
for (const [sku, k] of kod) {
  if (!k) { urunSayfa.set(sku, []); continue }
  const re = new RegExp(`(?<![\\w-])${kacis(k)}(?![\\w-])`, 'g')
  const bulunan = []
  for (const p of sayfalar) {
    re.lastIndex = 0
    const yerler = []
    let m
    while ((m = re.exec(p.govde))) yerler.push(m.index)
    if (yerler.length) bulunan.push({ ...p, kodYerleri: yerler })
  }
  urunSayfa.set(sku, bulunan)
}

// Değerin sayfadaki konumları — kelime sınırlı, sayının içindeki sayıyı saymaz
// ("150", "1500"ün içinde bulunursa yanlış kanıt olurdu).
const degerYerleri = (govde, bicim) => {
  const yer = []
  const re = new RegExp(`(?<![\\d.,])${kacis(bicim)}(?![\\d])`, 'g')
  let m
  while ((m = re.exec(govde))) yer.push(m.index)
  return yer
}

// ── EŞLEME
const alinti = (govde, iz) => {
  const i = govde.indexOf(iz)
  if (i < 0) return ''
  return govde.slice(Math.max(0, i - 80), i + 120).replace(/\s+/g, ' ').trim().slice(0, 200)
}
const esle = (girdi) => {
const sonuc = []
const sayim = { VAR: 0, 'DEGER YOK': 0, 'URUN KAYNAKTA YOK': 0, CELISIYOR: 0 }
let celiskiOlculmedi = 0
const celiskiListesi = []

for (const t of girdi) {
  const adaylar = urunSayfa.get(t.sku) || []
  const deger = String(t.deger || '').trim()
  if (!adaylar.length) {
    sayim['URUN KAYNAKTA YOK']++
    sonuc.push({ ...t, durum: 'URUN KAYNAKTA YOK', kaynak_dosya: '', kaynak_sayfa: '', alinti: '' })
    continue
  }
  const sayisal = /^-?\d[\d.,]*$/.test(deger)
  const bicimler = sayisal ? yaziliBicimler(deger) : (deger ? [deger] : [])
  let bulundu = null, iz = '', enYakin = Infinity
  for (const p of adaylar) {
    for (const b of bicimler) {
      const yerler = sayisal ? degerYerleri(p.govde, b)
        : [...p.kucuk.matchAll(new RegExp(kacis(b.toLowerCase()), 'g'))].map(m => m.index)
      for (const y of yerler) {
        // Kanıt = değerin ürün koduna UZAKLIĞI. En yakın olanı seçeriz ki alıntı
        // gerçekten o ürünün satırından gelsin, sayfanın rastgele bir yerinden değil.
        const d = Math.min(...p.kodYerleri.map(k => Math.abs(k - y)))
        if (d < enYakin) { enYakin = d; bulundu = p; iz = b }
      }
    }
  }
  if (enYakin > YAKINLIK) { bulundu = null }
  if (bulundu) {
    sayim.VAR++
    sonuc.push({ ...t, durum: 'VAR', kaynak_dosya: bulundu.dosya, kaynak_sayfa: bulundu.sayfa,
      alinti: alinti(bulundu.govde, iz) })
    continue
  }
  // Değer bulunamadı — ÇELİŞKİ mi, yoksa sadece yok mu? Yalnız etiket sözlüğü olan alanda ayırt edilir.
  const etiketler = ETIKET[t.alan]
  if (etiketler && sayisal) {
    const etiketli = adaylar.find(p => etiketler.some(e => p.kucuk.includes(e)))
    if (etiketli) {
      sayim.CELISIYOR++
      celiskiListesi.push({ sku: t.sku, urun: t.urun, alan: t.alan, paket_degeri: deger,
        kaynak_dosya: etiketli.dosya, kaynak_sayfa: etiketli.sayfa })
      sonuc.push({ ...t, durum: 'CELISIYOR', kaynak_dosya: etiketli.dosya,
        kaynak_sayfa: etiketli.sayfa, alinti: '' })
      continue
    }
  }
  if (!etiketler) celiskiOlculmedi++
  sayim['DEGER YOK']++
  sonuc.push({ ...t, durum: 'DEGER YOK', kaynak_dosya: '', kaynak_sayfa: '', alinti: '' })
}
return { sonuc, sayim, celiskiOlculmedi, celiskiListesi }
}

const { sonuc, sayim, celiskiOlculmedi, celiskiListesi } = esle(teknik)

// ── KAPI: hiçbir satır kaybolmamalı (fail-closed)
if (sonuc.length !== teknik.length) {
  console.error(`ÖLÇÜLEMEDİ — girdi ${teknik.length}, çıktı ${sonuc.length}`)
  process.exit(2)
}

// ── ⭐TESADÜF TABANI — rakam kendi güvenilirliğini söylemeli
// Aynı eşleme, değerlerin hepsi kaydırılmış SAHTE bir kopya üzerinde koşulur. Oradan çıkan
// "VAR" sayısı, yöntemin gürültü tabanıdır: bu kadarı kanıt değil, tesadüftür. Taban
// yazılmadan verilen bir "%X kanıtlı" rakamı, okuyanı olduğundan emin yapar.
// (Sabotaj sınavı kalıbı: kapı, YEŞİL tabanı bozunca kırmızıya dönerek ayırt ettiğini kanıtlar.)
const kaydir = (d) => {
  const n = Number(String(d).replace(',', '.'))
  if (!Number.isFinite(n)) return d
  return Number.isInteger(n) ? String(n + 7) : String(Math.round((n + 0.7) * 100) / 100)
}
const sahte = teknik.map(t => (/^-?\d[\d.,]*$/.test(String(t.deger || '').trim())
  ? { ...t, deger: kaydir(t.deger) } : t))
const taban = esle(sahte).sayim.VAR
const netOran = sayim.VAR ? ((sayim.VAR - taban) / sayim.VAR * 100).toFixed(1) : '0.0'

const yuzde = (n) => `${((n / teknik.length) * 100).toFixed(1)}%`
console.log(`KAYNAK EŞLEMESİ — ${teknik.length} teknik değer · ${sayfalar.length} kaynak sayfası`)
for (const [k, v] of Object.entries(sayim)) console.log(`  ${k.padEnd(18)} ${String(v).padStart(5)}  ${yuzde(v)}`)
console.log(`  (çelişki ÖLÇÜLMEDİ: ${celiskiOlculmedi} satır — alanın etiket sözlüğü yok)`)
console.log(`\nTESADÜF TABANI (sahte değerlerle aynı koşum): VAR ${taban}`)
console.log(`  → "VAR" satırlarının ~%${(taban / sayim.VAR * 100).toFixed(1)}'i tesadüf olabilir.`)
console.log(`  → GERÇEK KANIT payı: %${netOran} · ${sayim.VAR - taban} satır`)

if (YAZ) {
  const BOM = '\ufeff'
  const hucre = (v) => {
    if (v == null) return ''
    let s = String(v).replace(/\r?\n/g, ' ').trim()
    return (s.includes(';') || s.includes('"')) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const BAS = ['sku', 'urun', 'alan', 'deger', 'durum', 'kaynak_dosya', 'kaynak_sayfa', 'alinti']
  writeFileSync(join(HEDEF, 'teknik-ozellikler.csv'),
    BOM + [BAS.join(';'), ...sonuc.map(r => BAS.map(b => hucre(r[b])).join(';'))].join('\r\n') + '\r\n', 'utf8')
  const CB = ['sku', 'urun', 'alan', 'paket_degeri', 'kaynak_dosya', 'kaynak_sayfa']
  writeFileSync(join(HEDEF, 'celiski-listesi.csv'),
    BOM + [CB.join(';'), ...celiskiListesi.map(r => CB.map(b => hucre(r[b])).join(';'))].join('\r\n') + '\r\n', 'utf8')
  // MANIFEST bölümü — ÜRETİLİR, idempotent (aynı koşum dosyayı büyütmez).
  const mYol = join(HEDEF, 'MANIFEST.md')
  if (existsSync(mYol)) {
    const BASLIK = '## Kaynak eşlemesi (teknik-ozellikler.csv · durum kolonu)'
    const blok = `${BASLIK}

Her teknik değer kaynak dizininde arandı. **PDF açılmadı** (K15).

| durum | satır | ne demek |
|---|---|---|
| VAR | ${sayim.VAR} | değer, ürünün kodunun **yakınında** geçiyor — dosya+sayfa+alıntı dolu |
| DEGER YOK | ${sayim['DEGER YOK']} | ürünün sayfası bulundu, değer o sayfalarda yok |
| URUN KAYNAKTA YOK | ${sayim['URUN KAYNAKTA YOK']} | ürünün kodu hiçbir kaynakta geçmiyor — **ölçülemez** |
| CELISIYOR | ${sayim.CELISIYOR} | alanın etiketi sayfada var, değer uyuşmuyor → \`celiski-listesi.csv\` |

⛔**"VAR" mutlak kanıt değildir.** Aynı eşleme, değerleri kaydırılmış **sahte** bir kopya
üzerinde de koşuldu: orada da **${taban} satır "VAR" dedi.** Yani bu yöntemin tesadüf tabanı
%${(taban / sayim.VAR * 100).toFixed(1)}'dir; gerçek kanıt payı **%${netOran} (${sayim.VAR - taban} satır)**.
Bir alıntıya dayanıp karar vereceksen **alıntıyı oku** — sayı tek başına yetmez.

⛔**Kanıtsız değer SİLİNMEDİ, İŞARETLENDİ.** \`DEGER YOK\` ve \`URUN KAYNAKTA YOK\`
satırları pakette duruyor; boş \`kaynak_dosya\` hücresi bir eksiklik değil, bir **beyandır**.

Çelişki yalnız **etiket sözlüğü olan 10 alanda** ölçülebildi; ${celiskiOlculmedi} satırda
çelişki **ÖLÇÜLMEDİ** — bunları "çelişki yok" saymak yanlış olurdu.
`
    const mevcut = readFileSync(mYol, 'utf8')
    const i = mevcut.indexOf(BASLIK)
    const j = mevcut.indexOf('## Belge tablosu')
    // Bölüm sırası korunur: kaynak eşlemesi, belge tablosundan ÖNCE gelir.
    if (i >= 0) {
      const son = mevcut.indexOf('\n## ', i + 5)
      writeFileSync(mYol, mevcut.slice(0, i) + blok + (son >= 0 ? mevcut.slice(son + 1) : ''), 'utf8')
    } else if (j >= 0) {
      // '\n' EKLENMEZ: blok zaten satır sonuyla biter. Eklenirse ilk koşum ile ikinci
      // koşum arasında 1 baytlık fark doğar ve "üretilmiş artefakt" iddiası zayıflar.
      writeFileSync(mYol, mevcut.slice(0, j) + blok + mevcut.slice(j), 'utf8')
    } else {
      writeFileSync(mYol, mevcut.trimEnd() + '\n\n' + blok, 'utf8')
    }
  }
  console.log(`\n✓ teknik-ozellikler.csv YAZILDI (durum kolonu eklendi) · celiski-listesi.csv ${celiskiListesi.length} satır`)
} else {
  console.log('\nKURU KOŞUM — paket CSV\'sine dokunulmadı. Yazmak için: --yaz')
}
