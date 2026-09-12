/**
 * REC-292 denetim izi kapısının **SAF HÜKÜM KATMANI**.
 *
 * ⛔BU DOSYADA ŞUNLAR YOKTUR VE OLMAYACAK: shebang · yan etki · ağ · dosya sistemi ·
 * `process.exit` · Node yerleşiği. Yalnız veri alır, hüküm döndürür.
 *
 * NİÇİN AYRI DOSYA (2026-09-09, üç bağımsız ölçümle öğrenildi)
 *
 * `degerlendir` daha önce CLI betiğinin (`denetim-izi-tetik-kapisi.mjs`) içindeydi ve
 * konformans testi o betiği **dinamik import** ile çekiyordu. Sonuç: kapının **ayırt edici
 * altı kolu** URUN ve KATALOG ağaçlarında sessizce düşüyordu (`SyntaxError: Invalid or
 * unexpected token`), benim ağacımda ise geçiyordu. Yani kapı "kırmızı vermiyor" değildi,
 * **bazı ağaçlarda hiç sınanmıyordu**; CI Linux olduğu için master yeşildi.
 *
 * Sebep avı üç adımda daraldı ve **iki onarım denemesi yetmedi**:
 *   1. ham Windows yolu → `pathToFileURL` (ben): Node tarafı düzeldi, hata SÜRDÜ.
 *   2. KATALOG ölçtü: düz `node` ile aynı dosya SORUNSUZ yükleniyor → sebep Node DEĞİL.
 *   3. Kalan fail: **Vite/vitest modül yükleyicisi**. URUN'un adayı: dosyadaki **shebang**
 *      (`#!/usr/bin/env node`, ilk üç bayt `23 21 2f`) — Node `.mjs`'de kabul eder, Vite'ın
 *      dönüştürücüsü ilk karakteri çözemez. `scripts/db/checks` altındaki **8 betiğin
 *      8'inde** shebang var, yani tek dosyalık kaza değil SINIF.
 *
 * ⭐**BU YÜZDEN SEBEBİ KOVALAMAK YERİNE SINIFI KALDIRIYORUM:** test artık bir CLI betiğini
 * hiç import etmiyor. Saf mantık burada, shebang'siz; CLI de test de **aynı kaynaktan**
 * besleniyor ve testin import'u sıradan bir statik import. Böylece shebang, dinamik import,
 * mutlak yol ve import-anında-yan-etki — dördü birlikte ortadan kalkıyor.
 *
 * ⚠Elenemeyen bir aday da adıyla kalsın: bayat `node_modules/.vite` önbelleği. KATALOG
 * silme izni olmadığı için eleyemedi; bu tasarım onu da GEÇERSİZ kılıyor, çünkü artık
 * dönüştürücüye giren bir CLI dosyası yok.
 */

/** Denetim izi tetiği ZORUNLU olan tablolar. */
export const KAPSAM = [
  'categories',
  'products',
  'product_families',
  'product_images',
  'brands',
  'site_settings',
]

/** `products` UPDATE süzgecinde BULUNMASI ZORUNLU kolonlar (ticari çekirdek). */
export const PRODUCTS_ZORUNLU_KOLON = ['price', 'category_id', 'status', 'deleted_at', 'sku']

/** Tetik satırlarından hüküm çıkar. Saf fonksiyon: fikstürle de sınanabilir. */
export function degerlendir(satirlar) {
  const ihlaller = []
  const denetimSatirlari = satirlar.filter((r) => /^denetim_izi/.test(r.tetik))

  // (1) TETİK VAR MI
  for (const tablo of KAPSAM) {
    const bulunan = denetimSatirlari.filter((r) => r.tablo === tablo)
    if (bulunan.length === 0) {
      ihlaller.push({
        sinif: 'TETIK-YOK',
        tablo,
        aciklama:
          `${tablo} tablosunda denetim_izi tetigi YOK. Bu tabloya yapilan her yazim ` +
          `KAYITSIZ gecer. Migration dosyasinin repoda durmasi bunu KANITLAMAZ — ` +
          `tetik DROP edilmis olabilir.`,
      })
    }
  }

  // (2) FAIL-CLOSED MI — fonksiyon gövdesinde exception yakalayıcısı var mı
  const govdeler = new Map()
  for (const r of denetimSatirlari) govdeler.set(r.fonksiyon, r.govde)
  for (const [fn, govde] of govdeler) {
    if (/\bexception\s+when\b/i.test(String(govde))) {
      ihlaller.push({
        sinif: 'FAIL-OPEN',
        tablo: fn,
        aciklama:
          `${fn} govdesinde "exception when" YAKALAYICISI var. Tetik AYAKTA gorunur ama ` +
          `denetim yazimi patladiginda hata yutulur ve veri yazimi GECER: kayip SESSIZ olur. ` +
          `REC-292 karari fail-CLOSED (OPS H1). Yakalayici bilincli eklendiyse karar ` +
          `YENIDEN alinmali, sessizce degistirilmemeli.`,
      })
    }
  }

  // (3) products SÜZGECİ
  //
  // ⛔BURADA BİR KEZ YANILDIM, ve kendi fikstür kolum yakaladı — düzeltme yorumda kalsın:
  // önce "products üzerinde tanımında `update` geçen İLK tetik" diye arıyordum. `products`
  // üzerinde birden çok denetim tetiği var (biri INSERT/DELETE, biri UPDATE OF) ve gevşek
  // eşleşme YANLIŞ tetiği seçip süzgeci yok sanıyordu. Doğru soru "hangi tetik UPDATE'te
  // ateşleniyor" ve cevabı TEK tetik olmak zorunda değil.
  const productsUpdTetikleri = denetimSatirlari.filter(
    (r) => r.tablo === 'products' && /\bupdate\b/i.test(String(r.tanim)),
  )
  if (productsUpdTetikleri.length > 0) {
    const suzgecli = productsUpdTetikleri.filter((r) => /update\s+of/i.test(String(r.tanim)))

    if (suzgecli.length === 0) {
      ihlaller.push({
        sinif: 'SUZGEC-YOK',
        tablo: 'products',
        aciklama:
          `products UPDATE tetigi kolon suzgeci OLMADAN kurulmus (UPDATE OF yok). ` +
          `Her siparisin stok dusumu denetim satiri uretir ve "kim fiyati degistirdi" ` +
          `sorusunun cevabi gurultude kaybolur (OPS H2).`,
      })
    } else {
      // Zorunlu kolon, süzgeçli tetiklerin HERHANGİ BİRİNDE geçiyorsa kapsanmış sayılır:
      // süzgeç birden çok tetiğe bölünmüş olabilir ve bu meşrudur.
      const hepsi = suzgecli.map((r) => String(r.tanim)).join(' ')
      const eksik = PRODUCTS_ZORUNLU_KOLON.filter((k) => !new RegExp(`\\b${k}\\b`).test(hepsi))
      if (eksik.length > 0) {
        ihlaller.push({
          sinif: 'SUZGEC-DAR',
          tablo: 'products',
          aciklama:
            `products UPDATE tetiginin kolon suzgecinde ticari cekirdek kolonlar EKSIK: ` +
            `${eksik.join(', ')}. Bu kolonlarin degisimi KAYITSIZ gecer.`,
        })
      }
    }
  }

  return { ihlaller, denetimTetikSayisi: denetimSatirlari.length }
}
