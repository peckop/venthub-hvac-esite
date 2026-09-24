#!/usr/bin/env node
/**
 * TAŞINABİLİR KATALOG — İNSAN-OKUR PAKET ÜRETİCİ (REC-212 F1, adım 1-2)
 *
 * ── NİÇİN VAR (Recep kararı K13, 2026-09-09)
 * *"öncelik TAŞINABİLİR PAKET; sıra PDF → paket (gözle kontrol) → DB. Paket ANA KAYNAK,
 * DB pakete göre denetlenir."* Yani bu paket bir yedek değil, kataloğun **aslı**dır.
 * Recep aile aile gözle kontrol edecek; o yüzden çıktı Excel'de açılabilir olmalı.
 *
 * ── ⭐ÜRETİLMİŞ ARTEFAKT: CSV'ler `ham/*.jsonl`'den ÜRETİLİR, ELLE DÜZENLENMEZ
 * Kaynak `katalog-disa-aktar.mjs`'in yazdığı jsonl'lerdir. Sebep iki tane:
 *   1. Tek doğruluk kaynağı — CSV ile jsonl ayrışırsa hangisi doğru sorusu doğar.
 *   2. Round-trip eşitlik kapısı **jsonl üzerinde** ölçülür; CSV'de bayt eşitliği işletim
 *      sistemine bağlıdır (2026-09-09'da ölçüldü: aynı dosya CRLF'li ağaçta farklı davrandı).
 * Recep'in gözle bulduğu düzeltme `duzeltme.csv` ile girer ve jsonl'e işlenir — CSV'ye
 * elle yazılan düzeltme bir sonraki koşumda SESSİZCE SİLİNİR.
 *
 * ── PAKET GİT'E GİRMEZ
 * Fiyat (Euro) ve ~36 MB görsel taşır; ingestor deposu REC-215 ile PUBLIC olacak.
 * `paket/` .gitignore'dadır. USB kopyası = dizinin KENDİSİ, git değil.
 *
 * ── EVREN: pasif DÂHİL, silinmiş HARİÇ
 * `status` kolonu taşınır; bugün 441 aktif + 1 arşivli = 442. Sayı raporda ayrı ayrı yazılır.
 * "Aktif" süzgeci koymak paketi eksik yapardı — arşivli ürün de kataloğun parçasıdır.
 *
 * ── KAYNAK KOLONLARI (K8 aile föyü kalıbı)
 * Üç KAYNAKLI tabloda (teknik · açıklama · fiyat) `kaynak_dosya` `kaynak_sayfa` `alinti`
 * ZORUNLU kolondur. Diğerlerinde kolon VARDIR ama hücre boş kalabilir (K7: boş hücre,
 * tire yok). `alinti` en fazla 200 karakter — şişme yok.
 * ⚠Bu koşumda değerler BOŞ gelir: kaynak eşlemesi adım 3'ün işidir. Kolonun şimdiden
 * açılması bilinçli — şema sonradan değişirse gözle kontrol edilmiş dosyalar bozulur.
 *
 * KOŞUM:  node scripts/icerik-hatti/katalog-paket-uret.mjs --hedef=<paket-dizini>
 * CANLIYA YAZMAZ. Storage'dan yalnız OKUR (görsel indirir).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join, dirname, basename } from 'node:path'
import {
  URUN_BASLIK, TEKNIK_BASLIK, GORSEL_BASLIK, FIYAT_BASLIK, turkceBasliklar, birimler, paketHucresi,
} from './paket-sozlesme.mjs'
import { fiyatDizini, urunFiyatKaynagi } from './fiyat-kaynak-esle.mjs'

// Fail-closed: okunamazsa betik DURUR (başlıksız paket üretmek, eksikliği gizler).
const BASLIK_TR = turkceBasliklar()
const BIRIM = birimler()

const env = Object.fromEntries(
  readFileSync(process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env'), 'utf8')
    .split(/\r?\n/).filter(s => s && !s.startsWith('#') && s.includes('='))
    .map(s => { const i = s.indexOf('='); return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const U = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
if (!U) { console.error('⛔ SUPABASE_URL yok'); process.exit(1) }

const HEDEF = process.argv.find(a => a.startsWith('--hedef='))?.slice(8) || 'katalog-paketi'
const HAM = join(HEDEF, 'ham')
const GORSEL_ATLA = process.argv.includes('--gorsel-atla')
// Fiyatın kaynak eşlemesi KAYNAK DİZİNİNDEN (K15). Dizin yoksa betik DURUR: üç kaynak kolonunu
// sessizce boş bırakmak "kaynağı yok" ile "okunmadı"yı ayırt edilemez yapar. Bilerek kaynaksız
// paket isteyen `--fiyat-kaynaksiz` verir; o zaman kolonlar boş gider ve özet bunu söyler.
const DIZIN = process.argv.find(a => a.startsWith('--dizin='))?.slice(8)
  || join(homedir(), 'venthub-pdf-ingestor', 'kaynak-dizini', 'sayfalar.jsonl')
const FIYAT_KAYNAKSIZ = process.argv.includes('--fiyat-kaynaksiz')
const FIYAT_BELGESI = 'ticaret/avensair-fiyat-listesi-2026/01-input/avens_fiyat_listesi_2026_HQ.pdf'

if (!existsSync(HAM)) {
  console.error(`⛔ ham dizini YOK: ${HAM}`)
  console.error('   Önce: node scripts/icerik-hatti/katalog-disa-aktar.mjs --hedef=' + HEDEF)
  process.exit(2)
}

// ── CSV yazımı: TR Excel için ';' + UTF-8 BOM + CRLF.
// BOM olmazsa Excel Türkçe karakterleri bozar; bu paket GÖZLE KONTROL için var,
// okunamayan dosya işe yaramaz.
const BOM = '﻿'
const csvHucre = (v) => {
  // K7: boş hücre, tire YOK. Biçim kuralı ORTAK (paketHucresi) — round-trip kapısı aynısını kullanır.
  let s = paketHucresi(v)
  if (s.includes(';') || s.includes('"')) s = '"' + s.replace(/"/g, '""') + '"'
  return s
}
// `alinti` TAVANI burada, yazım anında uygulanır — adım 3 kolonu doldurduğunda kural
// zaten işliyor olsun diye. Kolon başına kural koymak, çağıranın hatırlamasına bırakmaktan
// güvenli: unutulan tek çağrı dosyayı şişirir ve gözle kontrol edilemez hâle getirir.
const csvYaz = (yol, basliklar, satirlar) => {
  const kirp = (b, v) => (b === 'alinti' && v != null ? String(v).slice(0, ALINTI_TAVAN) : v)
  const govde = [basliklar.join(';'),
    ...satirlar.map(r => basliklar.map(b => csvHucre(kirp(b, r[b]))).join(';'))]
  writeFileSync(yol, BOM + govde.join('\r\n') + '\r\n', 'utf8')
  return satirlar.length
}

const oku = (ad) => {
  const yol = join(HAM, `${ad}.jsonl`)
  if (!existsSync(yol)) { console.error(`⛔ ${ad}.jsonl YOK — paket eksik, fail-closed`); process.exit(2) }
  return readFileSync(yol, 'utf8').split(/\n/).filter(Boolean).map(s => JSON.parse(s))
}

const ALINTI_TAVAN = 200
const kaynakKolon = { kaynak_dosya: '', kaynak_sayfa: '', alinti: '' }
const dil = (o, k) => (o && typeof o === 'object' ? (o[k] ?? '') : '')

console.log(`PAKET ÜRETİLİYOR: ${HEDEF}`)

const urunler = oku('products')
const aileler = oku('product_families')
const kategoriler = oku('categories')
const markalar = oku('brands')
const fiyatlar = oku('product_prices')
const fiyatListeleri = oku('price_lists')
const gorseller = oku('product_images')

// `brands` pakette tablo olarak KALIR (round-trip onu da ölçer) ama ürün satırı ona bağlanmaz:
// `products.brand_id` diye bir kolon YOK (DESIGN-KATALOG sözleşme v1, bulgu 5, 2026-09-10).
// Eski `markaAdi.get(u.brand_id)` dalı hiç çalışmayan ölü koddu; marka `products.brand`dır.
void markalar

const aileAdi = new Map(aileler.map(a => [a.id, a.name]))
const kategoriAdi = new Map(kategoriler.map(k => [k.id, k.name]))
const listeAdi = new Map(fiyatListeleri.map(l => [l.id, l.name]))
const urunSku = new Map(urunler.map(u => [u.id, u.sku]))
const urunAdi = new Map(urunler.map(u => [u.id, u.name]))

mkdirSync(HEDEF, { recursive: true })
const sayim = {}

// ── 1. ÜRÜNLER
sayim['urunler.csv'] = csvYaz(join(HEDEF, 'urunler.csv'),
  URUN_BASLIK,
  urunler.map(u => ({
    sku: u.sku, ad: u.name, model_kodu: u.model_code,
    marka: u.brand ?? '',
    aile: aileAdi.get(u.family_id) ?? '',
    // İKİ KADEME AYRI KOLON. Eski tek `kategori` kolonu alt kademe yoksa KÖKÜ yazıyordu;
    // o 8 üründe kök ile alt kademe aynı hücrede görünüyor, hangisi olduğu okunamıyordu
    // (sayım standardı §2 tuzağı). Alt kademe yoksa hücre BOŞ kalır, köke DÜŞÜRÜLMEZ.
    ust_kategori: kategoriAdi.get(u.category_id) ?? '',
    alt_kategori: kategoriAdi.get(u.subcategory_id) ?? '',
    durum: u.status, slug: u.slug, ...kaynakKolon,
  })))

// ── 2. TEKNİK ÖZELLİKLER — UZUN BİÇİM (satır = ürün · alan · değer)
// Geniş biçim (her alan bir kolon) 100+ kolon üretir ve Excel'de okunmaz; ayrıca yeni bir
// alan geldiğinde şema değişir. Uzun biçimde şema SABİT kalır.
const teknikSatirlar = []
for (const u of urunler) {
  const t = u.technical_specs
  if (!t || typeof t !== 'object') continue
  for (const alan of Object.keys(t).sort()) {
    const deger = t[alan]
    if (deger == null || deger === '') continue
    teknikSatirlar.push({
      sku: u.sku, urun: u.name, alan,
      deger: typeof deger === 'object' ? JSON.stringify(deger) : deger,
      birim: BIRIM.get(alan) ?? '', baslik_tr: BASLIK_TR.get(alan) ?? '',
      ...kaynakKolon,
    })
  }
}
sayim['teknik-ozellikler.csv'] = csvYaz(join(HEDEF, 'teknik-ozellikler.csv'),
  TEKNIK_BASLIK, teknikSatirlar)

// ── 3. GÖRSEL BAĞI
sayim['gorseller.csv'] = csvYaz(join(HEDEF, 'gorseller.csv'),
  GORSEL_BASLIK,
  gorseller.map(g => ({
    sku: urunSku.get(g.product_id) ?? '', urun: urunAdi.get(g.product_id) ?? '',
    dosya: g.path ? basename(g.path) : '',
    paket_yolu: g.path ? `gorseller/${g.path}` : '',
    sira: g.sort_order ?? g.position ?? '',
    alt_metin: g.alt ?? '', ...kaynakKolon,
  })))

// ── 4. FİYATLAR (kaynaklı tablo — alinti ZORUNLU)
// `fiyat` NET (KDV hariç), `brut_fiyat` BRÜT (KDV dahil) — OPS hükmü 2026-09-11.
// ⛔`base_price` KULLANILMAZ: Standart listede brüte, Bayi/Kurumsal listede nete eşit; aynı
// kolon bir satırda KDV dahil bir satırda KDV hariç değer taşırdı. Eski `f.price ?? f.amount`
// ise hiç var olmayan iki kolonu okuyordu → 1044 satırın 1044'ünde fiyat BOŞ gidiyordu.
// `kdv` · `kaynak_fiyat_eur` · `fiyat_kaynak_sayfa` KAYNAK DİZİNİNDEN gelir (fiyat listesi
// sayfasının kendi beyanı); DB'de karşılıkları YOKTUR. Eşleme `fiyat-kaynak-esle.mjs`'te: kod →
// liste satırı, kod çakışmasında ada göre, bulunamazsa hücre BOŞ (K7, uydurma yok).
// `kdv` ile `products.tax_rate` AYRI şeydir, aynı kolona konmaz.
// ⛔ kaynak_fiyat_eur = AVenS ALIŞ fiyatı (maliyetimiz). Paket iç ana kopyadır (K13) ve git'e
// girmez; bayiye verilecek bir sürüm üretilirse bu kolon orada ÇIKARILMALIDIR.
let fiyatKaynak = null
if (!FIYAT_KAYNAKSIZ) {
  if (!existsSync(DIZIN)) {
    console.error(`⛔ kaynak dizini YOK: ${DIZIN} — fiyat kaynak kolonları okunamaz.`)
    console.error('   --dizin=<sayfalar.jsonl> ver ya da bilerek boş bırakmak için --fiyat-kaynaksiz')
    process.exit(2)
  }
  const sayfalar = readFileSync(DIZIN, 'utf8').split(/\n/).filter(Boolean).map(s => JSON.parse(s))
  fiyatKaynak = fiyatDizini(sayfalar, FIYAT_BELGESI)
  if (!fiyatKaynak.kayit.size) {
    console.error(`⛔ dizinde fiyat belgesi satırı YOK (${FIYAT_BELGESI}) — fail-closed`)
    process.exit(2)
  }
}
const urunById = new Map(urunler.map(u => [u.id, u]))
const fiyatEsleme = new Map() // product_id → urunFiyatKaynagi sonucu (liste başına tekrar hesaplanmaz)
const fiyatHucreleri = (productId) => {
  if (!fiyatKaynak) return { kdv: '', kaynak_fiyat_eur: '', fiyat_kaynak_sayfa: '', ...kaynakKolon }
  if (!fiyatEsleme.has(productId)) fiyatEsleme.set(productId, urunFiyatKaynagi(urunById.get(productId), fiyatKaynak))
  const r = fiyatEsleme.get(productId)
  if (r.durum !== 'bulundu') return { kdv: '', kaynak_fiyat_eur: '', fiyat_kaynak_sayfa: '', ...kaynakKolon }
  return {
    kdv: r.kayit.kdv, kaynak_fiyat_eur: r.kayit.eur, fiyat_kaynak_sayfa: r.kayit.sayfa,
    kaynak_dosya: basename(FIYAT_BELGESI), kaynak_sayfa: r.kayit.sayfa, alinti: r.kayit.alinti,
  }
}
sayim['fiyatlar.csv'] = csvYaz(join(HEDEF, 'fiyatlar.csv'),
  FIYAT_BASLIK,
  fiyatlar.map(f => ({
    sku: urunSku.get(f.product_id) ?? '', urun: urunAdi.get(f.product_id) ?? '',
    liste: listeAdi.get(f.price_list_id) ?? '',
    fiyat: f.net_price ?? '', brut_fiyat: f.gross_price ?? '',
    para_birimi: f.currency ?? '', gecerli_baslangic: f.valid_from ?? '',
    aktif: f.is_active ?? '',
    ...fiyatHucreleri(f.product_id),
  })))

// Kaynak ↔ DB alış fiyatı farkı: pakete AYRI dosya (git'e girmez). Konsola fiyat BASILMAZ,
// yalnız sayı ve SKU — konsol çıktısı kayıtlara/panoya yapıştırılır.
if (fiyatKaynak) {
  const durum = { bulundu: [], yok: [], cakisma: [] }
  const farklar = []
  for (const [pid, r] of fiyatEsleme) {
    const u = urunById.get(pid)
    durum[r.durum].push(u.sku)
    if (r.durum === 'bulundu' && u.purchase_currency === 'EUR' && u.purchase_price != null
      && Math.abs(Number(u.purchase_price) - r.kayit.eur) >= 0.005) {
      farklar.push({ sku: u.sku, urun: u.name, db_alis_eur: u.purchase_price, kaynak_eur: r.kayit.eur,
        kaynak_sayfa: r.kayit.sayfa, yol: r.kayit.yol, alinti: r.kayit.alinti })
    }
  }
  sayim['fiyat-kaynak-farklari.csv'] = csvYaz(join(HEDEF, 'fiyat-kaynak-farklari.csv'),
    ['sku', 'urun', 'db_alis_eur', 'kaynak_eur', 'kaynak_sayfa', 'yol', 'alinti'], farklar.sort((a, b) => a.sku.localeCompare(b.sku)))
  const adaGore = [...fiyatEsleme.values()].filter(r => /ada göre/.test(r.kayit?.yol ?? '')).length
  console.log(`FİYAT KAYNAĞI: fiyatlı ürün ${fiyatEsleme.size} · bulundu ${durum.bulundu.length}`
    + ` (kod çakışması ada göre ${adaGore}) · listede yok ${durum.yok.length} · çözülemeyen çakışma ${durum.cakisma.length}`
    + ` · DB alış fiyatından FARKLI ${farklar.length}`)
  if (durum.yok.length) console.log(`   listede yok: ${durum.yok.sort().join(' ')}`)
  if (durum.cakisma.length) console.log(`   çözülemeyen çakışma: ${durum.cakisma.sort().join(' ')}`)
  if (farklar.length) console.log(`   DB'den farklı: ${farklar.map(f => f.sku).join(' ')} → fiyat-kaynak-farklari.csv`)
} else {
  console.log('FİYAT KAYNAĞI: --fiyat-kaynaksiz — kdv/kaynak_fiyat_eur/fiyat_kaynak_sayfa BOŞ gitti')
}

// ── 5. AİLELER
sayim['aileler.csv'] = csvYaz(join(HEDEF, 'aileler.csv'),
  ['ad', 'slug', 'kategori', 'aciklama_tr', 'aciklama_en', 'kaynak_dosya', 'kaynak_sayfa', 'alinti'],
  aileler.map(a => ({
    ad: a.name, slug: a.slug,
    kategori: kategoriAdi.get(a.subcategory_id) ?? kategoriAdi.get(a.category_id) ?? '',
    aciklama_tr: String(dil(a.description, 'tr')).slice(0, 2000),
    aciklama_en: String(dil(a.description, 'en')).slice(0, 2000),
    ...kaynakKolon,
  })))

// ── 6. KATEGORİLER
sayim['kategoriler.csv'] = csvYaz(join(HEDEF, 'kategoriler.csv'),
  ['ad', 'slug', 'ust_kategori', 'gorunum', 'kaynak_dosya', 'kaynak_sayfa', 'alinti'],
  kategoriler.map(k => ({
    ad: k.name, slug: k.slug,
    ust_kategori: k.parent_id ? (kategoriAdi.get(k.parent_id) ?? '') : '',
    gorunum: k.display_mode ?? '', ...kaynakKolon,
  })))

// ── 7. AÇIKLAMALAR (kaynaklı tablo — alinti ZORUNLU)
const aciklamaSatirlar = []
for (const u of urunler) {
  const tr = String(dil(u.description_i18n, 'tr') || u.description || '')
  const en = String(dil(u.description_i18n, 'en') || '')
  const adEn = String(dil(u.name_i18n, 'en') || '')
  if (!tr && !en && !adEn) continue
  aciklamaSatirlar.push({
    sku: u.sku, urun: u.name, ad_en: adEn,
    aciklama_tr: tr.slice(0, 4000), aciklama_en: en.slice(0, 4000), ...kaynakKolon,
  })
}
sayim['aciklamalar.csv'] = csvYaz(join(HEDEF, 'aciklamalar.csv'),
  ['sku', 'urun', 'ad_en', 'aciklama_tr', 'aciklama_en',
   'kaynak_dosya', 'kaynak_sayfa', 'alinti'], aciklamaSatirlar)

for (const [d, n] of Object.entries(sayim)) console.log(`  ${d.padEnd(24)} ${String(n).padStart(5)} satır`)

// ── GÖRSEL DOSYALARI — bağ değil, DOSYANIN KENDİSİ
// Yalnız yolu taşımak paketi eksik yapar: alıcının Storage kovasına erişimi YOKTUR.
// Ölçüldü (2026-09-09): 1188 dosya / 36 MB — USB için taşınabilir boyut.
let indirilen = 0, atlanan = 0, basarisiz = []
if (GORSEL_ATLA) {
  console.log('\n⚠ --gorsel-atla verildi: görsel DOSYALARI indirilmedi, paket EKSİK.')
} else {
  const yollar = [...new Set(gorseller.map(g => g.path).filter(Boolean))]
  console.log(`\nGÖRSELLER indiriliyor: ${yollar.length} tekil dosya`)
  for (const p of yollar) {
    const hedefDosya = join(HEDEF, 'gorseller', p)
    if (existsSync(hedefDosya)) { atlanan++; continue }
    try {
      const r = await fetch(`${U}/storage/v1/object/public/product-images/${p}`)
      if (!r.ok) { basarisiz.push(`${p} (${r.status})`); continue }
      mkdirSync(dirname(hedefDosya), { recursive: true })
      writeFileSync(hedefDosya, Buffer.from(await r.arrayBuffer()))
      indirilen++
      if (indirilen % 100 === 0) console.log(`  ${indirilen}/${yollar.length}`)
    } catch (e) { basarisiz.push(`${p} (${e.message})`) }
  }
  console.log(`  indirildi ${indirilen} · zaten vardı ${atlanan} · BAŞARISIZ ${basarisiz.length}`)
  for (const b of basarisiz.slice(0, 10)) console.log(`    ⛔ ${b}`)
}

// ── MANIFEST.md — insan için
const hamManifest = existsSync(join(HEDEF, 'manifest.json'))
  ? JSON.parse(readFileSync(join(HEDEF, 'manifest.json'), 'utf8')) : {}
const durumSayim = urunler.reduce((a, u) => (a[u.status] = (a[u.status] || 0) + 1, a), {})

writeFileSync(join(HEDEF, 'MANIFEST.md'), `# VentHub Taşınabilir Katalog Paketi

**Üretildi:** ${hamManifest.uretildi || '(ham manifest yok)'}
**Kaynak:** canlı DB (salt okuma) · **Bu paket ANA KAYNAKTIR** — DB buna göre denetlenir (K13).

## İçindekiler

| dosya | satır | ne |
|---|---|---|
${Object.entries(sayim).map(([d, n]) => `| \`${d}\` | ${n} | |`).join('\n')}
| \`gorseller/\` | ${indirilen + atlanan} dosya | görsellerin KENDİSİ |
| \`ham/*.jsonl\` | ${hamManifest.toplam_satir ?? '?'} | makine kopyası — **doğruluk kaynağı** |

## Ürün evreni
${Object.entries(durumSayim).map(([s, n]) => `- **${s}:** ${n}`).join('\n')}
**Toplam ${urunler.length}.** Pasif/arşivli ürünler DÂHİLDİR — onlar da kataloğun parçasıdır.

## ⛔Bilmen gerekenler

1. **CSV'ler ÜRETİLMİŞ dosyalardır.** Doğruluk kaynağı \`ham/*.jsonl\`. CSV'ye elle yazılan
   düzeltme bir sonraki koşumda **sessizce silinir**. Düzeltme \`duzeltme.csv\` ile girer.
2. **Bu paket GİT'E GİRMEZ.** Fiyat (Euro) ve ~36 MB görsel taşır; ingestor deposu
   REC-215 ile PUBLIC olacak. USB kopyası = **bu dizinin kendisi**.
3. **\`kaynak_dosya\` / \`kaynak_sayfa\` / \`alinti\` kolonları bu koşumda BOŞTUR.**
   Kaynak eşlemesi adım 3'ün işidir. Kolonlar şimdiden açık, çünkü şema sonradan değişirse
   gözle kontrol edilmiş dosyalar bozulur.
4. **Geri yükleyici (paket → DB) HENÜZ YOK.** Paket, geri yüklenebildiği ölçüde taşınabilirdir;
   bu koşum o iddiayı ETMEZ.
5. \`tenant_id\` olduğu gibi taşınır — başka kuruluma yüklenirken yeniden eşlenmelidir.

## Excel'de açarken
Dosyalar \`;\` ayırıcılı, UTF-8 BOM'lu, CRLF satır sonlu — Türkçe karakterler doğru görünür.
`, 'utf8')

console.log(`\n✓ PAKET HAZIR: ${HEDEF}`)
console.log(`  ${Object.keys(sayim).length} CSV · ${Object.values(sayim).reduce((a, b) => a + b, 0)} satır · görsel ${indirilen + atlanan} dosya`)
console.log(`  ürün evreni: ${Object.entries(durumSayim).map(([s, n]) => `${s} ${n}`).join(' · ')} = ${urunler.length}`)
if (basarisiz.length) { console.error(`\n⛔ ${basarisiz.length} görsel İNDİRİLEMEDİ — paket EKSİK`); process.exit(1) }
