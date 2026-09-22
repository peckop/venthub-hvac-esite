/**
 * TAŞINABİLİR KATALOG PAKETİ — KOLON SÖZLEŞMESİ (REC-212, sözleşme v1'in açılan 8 kolonu)
 *
 * ── NİÇİN AYRI DOSYA
 * Aynı başlık listesini üç betik kullanır: `katalog-paket-uret.mjs` (yazar),
 * `kaynak-eslemesi.mjs` (teknik dosyayı adım 3 kolonlarıyla YENİDEN yazar) ve
 * `paket-csv-dogrula.mjs` (CSV katmanı round-trip kapısı). Liste üç yerde tutulsaydı, birine
 * eklenen kolon öbüründe SESSİZCE silinirdi — adım 3 betiği sabit listeyle yazdığı için
 * `birim`/`baslik_tr` tam da bu yolla kaybolacaktı (2026-09-22 ölçüldü).
 *
 * ── KAYNAK (uydurma yok)
 * Kolon adları DESIGN-KATALOG sözleşme v1'den (Linear proje yorumu 2026-09-10 07:11Z) ve
 * OPS hükümlerinden (07:43Z sekiz kolon · 09-11 fiyat ← net_price / brut_fiyat ← gross_price).
 * `baslik_tr` = sitenin ürün sayfasında müşterinin gördüğü alan adı (`tr.ts` → `pdp.specs`);
 * `birim` = `alan-etiket-sozlugu.json` (kaynak tablo başlıklarından sayılmış birim).
 * Sözlükte ya da sitede tanımı olmayan alanda hücre BOŞ kalır (K7) — tahmin edilmez.
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const BURASI = dirname(fileURLToPath(import.meta.url))
const DEPO = join(BURASI, '..', '..')

export const KAYNAK_KOLONLARI = ['kaynak_dosya', 'kaynak_sayfa', 'alinti']

export const URUN_BASLIK = ['sku', 'ad', 'model_kodu', 'marka', 'aile', 'ust_kategori', 'alt_kategori',
  'durum', 'slug', ...KAYNAK_KOLONLARI]

export const TEKNIK_BASLIK = ['sku', 'urun', 'alan', 'deger', 'birim', 'baslik_tr', ...KAYNAK_KOLONLARI]

// Adım 3 (`kaynak-eslemesi.mjs --yaz`) iki kolon ekler: durum + kaynak_tur, değerden hemen sonra
// değil kaynak üçlüsünden önce — gözle kontrolde "değer · birim · başlık · hüküm · nereden" sırası.
export const TEKNIK_BASLIK_ADIM3 = ['sku', 'urun', 'alan', 'deger', 'birim', 'baslik_tr',
  'durum', 'kaynak_tur', ...KAYNAK_KOLONLARI]

export const GORSEL_BASLIK = ['sku', 'urun', 'dosya', 'paket_yolu', 'sira', 'alt_metin', ...KAYNAK_KOLONLARI]

export const FIYAT_BASLIK = ['sku', 'urun', 'liste', 'fiyat', 'brut_fiyat', 'para_birimi',
  'gecerli_baslangic', 'aktif', 'kdv', 'kaynak_fiyat_eur', 'fiyat_kaynak_sayfa', ...KAYNAK_KOLONLARI]

/**
 * Paket kolonu → ham (DB) alanı. CSV katmanı round-trip kapısı YALNIZ bu eşlemedeki hücreleri
 * karşılaştırır. Listede OLMAYAN kolonlar iki sınıftır ve eşitliğe girmez:
 *   · türetilmiş (ad eşlemesi: aile, kategori adları, dosya adı…) — kimlik değil, okuma kolaylığı
 *   · pakete özgü (kdv, kaynak_fiyat_eur, fiyat_kaynak_sayfa, kaynak üçlüsü, birim, baslik_tr)
 *     — DB'de karşılığı YOK; kaynak dizininden ya da sözlükten gelir.
 */
export const HAM_ESLEME = {
  'urunler.csv': { tablo: 'products', anahtar: 'sku', kolonlar: { sku: 'sku', ad: 'name', model_kodu: 'model_code', marka: 'brand', durum: 'status', slug: 'slug' } },
  'gorseller.csv': { tablo: 'product_images', kolonlar: { sira: 'sort_order', alt_metin: 'alt' } },
  'fiyatlar.csv': { tablo: 'product_prices', kolonlar: { fiyat: 'net_price', brut_fiyat: 'gross_price', para_birimi: 'currency', gecerli_baslangic: 'valid_from', aktif: 'is_active' } },
}

/**
 * `tr.ts` içindeki `pdp.specs` bloğundan alan → Türkçe başlık. TS derlemeden okunur; blok
 * düz `anahtar: 'metin',` satırlarından oluşur (2026-09-22: 75 satır, istisnasız).
 * ⛔FAIL-CLOSED: blok bulunamaz ya da 50'den az alan çıkarsa HATA — sessizce boş başlık üretmek
 * paketi "başlıksız" gösterir ve hiçbir kapı fark etmez.
 */
export function turkceBasliklar(trYolu = join(DEPO, 'src', 'i18n', 'dictionaries', 'tr.ts')) {
  if (!existsSync(trYolu)) throw new Error(`tr sözlüğü YOK: ${trYolu}`)
  const satirlar = readFileSync(trYolu, 'utf8').split(/\r?\n/)
  const pdp = satirlar.findIndex(s => /^ {2}pdp: \{$/.test(s))
  if (pdp < 0) throw new Error('tr.ts: `pdp: {` bloğu bulunamadı')
  const bas = satirlar.findIndex((s, i) => i > pdp && /^ {4}specs: \{$/.test(s))
  if (bas < 0) throw new Error('tr.ts: `pdp.specs: {` bloğu bulunamadı')
  const harita = new Map()
  for (let i = bas + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (/^ {4}\},?$/.test(s)) break
    const m = s.match(/^\s+([a-z0-9_]+): '((?:[^'\\]|\\.)*)',?$/)
    if (!m) throw new Error(`tr.ts pdp.specs: tanınmayan satır ${i + 1}: ${s.trim()}`)
    harita.set(m[1], m[2].replace(/\\'/g, "'"))
  }
  if (harita.size < 50) throw new Error(`tr.ts pdp.specs: yalnız ${harita.size} alan okundu (<50) — blok biçimi değişmiş olabilir`)
  return harita
}

/**
 * Paket hücresi biçimi — üreticinin `csvHucre`'siyle AYNI kural (null → boş, nesne → JSON,
 * satır sonu → boşluk, kırpma). Round-trip kapısı DB değerini bu kuralla biçimleyip CSV'deki
 * hücreyle karşılaştırır; kural iki yerde ayrı yazılsaydı kapı kendi kendini kandırırdı.
 */
export function paketHucresi(v) {
  if (v == null) return ''
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
  return s.replace(/\r?\n/g, ' ').trim()
}

/** `;` ayraçlı, `"` tırnaklı, BOM'lu CSV → nesne dizisi. Tırnak içindeki `;` ve `""` doğru okunur. */
export function csvOku(metin) {
  const t = metin.replace(/^﻿/, '')
  const satirlar = []
  let satir = [], hucre = '', tirnak = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (tirnak) {
      if (c === '"') { if (t[i + 1] === '"') { hucre += '"'; i++ } else tirnak = false }
      else hucre += c
    } else if (c === '"') tirnak = true
    else if (c === ';') { satir.push(hucre); hucre = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      satir.push(hucre); satirlar.push(satir); satir = []; hucre = ''
    } else hucre += c
  }
  if (hucre !== '' || satir.length) { satir.push(hucre); satirlar.push(satir) }
  const [bas, ...govde] = satirlar
  return { basliklar: bas ?? [], satirlar: govde.map(r => Object.fromEntries((bas ?? []).map((b, i) => [b, r[i] ?? '']))) }
}

/** `alan-etiket-sozlugu.json` → alan → birim. Birimi boş/eksik alan haritaya girmez. */
export function birimler(sozlukYolu = join(BURASI, 'alan-etiket-sozlugu.json')) {
  const s = JSON.parse(readFileSync(sozlukYolu, 'utf8'))
  if (!s.alanlar || typeof s.alanlar !== 'object') throw new Error('alan-etiket-sozlugu.json: `alanlar` yok')
  return new Map(Object.entries(s.alanlar).filter(([, v]) => v && v.birim).map(([k, v]) => [k, v.birim]))
}
