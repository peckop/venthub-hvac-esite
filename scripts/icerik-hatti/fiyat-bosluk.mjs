/**
 * FİYAT BOŞLUK RAPORU — saf çekirdek (REC-209 C). Katalog hattı fiyat YAZMAZ (Recep kararı
 * 2026-09-07); bu modül yalnız "hangi üründe satış fiyatı satırı yok, liste fiyatı elimizde var mı,
 * kaynağı nerede" sorusunu cevaplar. Yazma kararı REC-193 / Recep'tedir.
 *
 * Satır = `product_prices` satırı OLMAYAN canlı ürün. Sütunlar:
 *   liste_fiyati_db  — `products.purchase_price` dolu mu (AVenS LİSTE fiyatı; pricing-standard §2 A)
 *   listede          — fiyat listesinde bulundu mu (`fiyat-kaynak-esle.mjs`): bulundu · yok · cakisma
 *   kaynak_sayfa     — bulunduysa sayfa
 *   db_kaynak_ayni   — DB liste fiyatı kaynakla aynı mı (evet · hayır · —)
 *   durum            — HAZIR (DB fiyatı var ve kaynakla aynı: türetme koşunca satır oluşur) ·
 *                      KAYNAKSIZ (DB fiyatı var, listede yok) · FARKLI (ikisi tutmuyor) ·
 *                      LİSTEDE VAR (DB'de liste fiyatı yok/0, AVenS listesinde basılı) ·
 *                      HİÇBİR YERDE YOK (ne DB'de ne listede)
 * ⚠ `purchase_price = 0` "fiyat yok" sayılır: canlıda fiyatsız 94 ürünün 94'ü 0 taşıyor (2026-09-23
 *   ölçümü; aynı gün "null değil" diye sayılıp dolu sanılmıştı).
 * ⛔ Fiyat DEĞERİ satıra girmez — rapor PUBLIC depoya ve panoya yapıştırılabilir; değer paketin
 * `fiyat-kaynak-farklari.csv`'sindedir (git'e girmez).
 */
import { urunFiyatKaynagi } from './fiyat-kaynak-esle.mjs'

export const BOSLUK_BASLIK = ['sku', 'urun', 'marka', 'aile', 'liste_fiyati_db', 'listede', 'kaynak_sayfa', 'db_kaynak_ayni', 'durum']

/**
 * @param {Array<{id:string,sku:string,name:string,brand?:string,family_slug?:string,purchase_price?:number|string|null,purchase_currency?:string|null}>} urunler canlı (silinmemiş)
 * @param {Set<string>} fiyatliUrunIdleri product_prices satırı olan ürün id'leri
 * @param {ReturnType<import('./fiyat-kaynak-esle.mjs').fiyatDizini>} dizin
 */
export const fiyatBoslukSatirlari = (urunler, fiyatliUrunIdleri, dizin) => urunler
  .filter(u => !fiyatliUrunIdleri.has(u.id))
  .map(u => {
    const r = urunFiyatKaynagi(u, dizin)
    const dbVar = u.purchase_price != null && u.purchase_price !== '' && Number(u.purchase_price) > 0
    const ayni = r.durum === 'bulundu' && dbVar && u.purchase_currency === 'EUR'
      ? (Math.abs(Number(u.purchase_price) - r.kayit.eur) < 0.005 ? 'evet' : 'hayır') : '—'
    const durum = !dbVar ? (r.durum === 'bulundu' ? 'LİSTEDE VAR' : 'HİÇBİR YERDE YOK')
      : r.durum !== 'bulundu' ? 'KAYNAKSIZ' : ayni === 'evet' ? 'HAZIR' : 'FARKLI'
    return {
      sku: u.sku, urun: u.name, marka: u.brand ?? '', aile: u.family_slug ?? '',
      liste_fiyati_db: dbVar ? 'var' : 'yok', listede: r.durum,
      kaynak_sayfa: r.durum === 'bulundu' ? r.kayit.sayfa : '', db_kaynak_ayni: ayni, durum,
    }
  })
  .sort((a, b) => a.durum.localeCompare(b.durum) || a.sku.localeCompare(b.sku))

/** Durum → sayı özeti (konsol ve karne için). */
export const boslukOzeti = (satirlar) => satirlar.reduce((o, s) => ({ ...o, [s.durum]: (o[s.durum] ?? 0) + 1 }), {})
