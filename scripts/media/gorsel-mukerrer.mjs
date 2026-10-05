/**
 * MÜKERRER GÖRSEL — saf çekirdek (REC-282). Ağa, DB'ye, diske çıkmaz; gorsel-envanteri.mjs okur, bu sayar.
 *
 * Aynı dosya (sha256) birden çok üründe = mükerrer grup. Grup KATEGORİ SINIRINI aşıyorsa şüphelidir:
 * aile içi varyant paylaşımı meşrudur, kategori aşımı "yanlış ürüne yapıştırılmış" demektir
 * (REC-282: ısı geri kazanım fotoğrafı altı sulu batarya ürününe kopyalanmıştı).
 *
 * BİLİNEN İSTİSNALAR — Recep kararı 2026-09-08, lafzıyla: *"tekrar edenler aynen kalsınlar ama bunları
 * kaydet bilelim … bunlar yeni foto lazım diye bilelim."* Bu gruplar SİLİNMEZ, donmuş istisnadır:
 * aynı grup yeni bir ürüne YAYILIRSA ya da listede olmayan bir kategori aşımı doğarsa kapı KIRMIZI.
 * 2026-09-24 ölçümü: 3 grup, her biri 9 ürün (AVE-13010/13011/13013 + AVE-13052…13057), doğru
 * sulu batarya fotoğrafı kaynak dizininde YOK (AVenS fiyat listesi s.69'un tek fotoğrafı elektrikli ısıtıcı).
 */

/** sha256'nın ilk 16 hanesi (gorsel-envanteri.mjs ile aynı kısaltma) → izin verilen en çok ürün sayısı */
export const BILINEN_KATEGORI_ASAN = {
  e5ebeadb41e3a5f0: 9,
  bac4bcd2c8666dbc: 9,
  '767e808a589d9668': 9,
}

/**
 * @param {{product_id: string, path: string}[]} gorseller
 * @param {Map<string, string>} hashOf     path → hash (yalnız hash'lenenler)
 * @param {Map<string, {sku?: string, name?: string}>} urunById
 * @param {(urun: object|undefined) => string} katOf
 */
export function mukerrerGruplari(gorseller, hashOf, urunById, katOf) {
  const hashGrup = new Map()
  for (const g of gorseller) {
    const h = hashOf.get(g.path)
    if (!h) continue
    if (!hashGrup.has(h)) hashGrup.set(h, [])
    hashGrup.get(h).push(g)
  }
  const mukerrer = []
  for (const [h, kayitlar] of hashGrup) {
    const urunSeti = [...new Set(kayitlar.map((k) => k.product_id))]
    if (urunSeti.length < 2) continue
    const kats = [...new Set(urunSeti.map((id) => katOf(urunById.get(id))))]
    mukerrer.push({
      hash: h,
      dosya_sayisi: kayitlar.length,
      urun_sayisi: urunSeti.length,
      kategoriler: kats,
      kategori_sinirini_asiyor: kats.length > 1,
      urunler: urunSeti.map((id) => {
        const p = urunById.get(id)
        return { sku: p?.sku ?? '(bilinmiyor)', ad: p?.name ?? '', kategori: katOf(p) }
      }).sort((a, b) => a.sku.localeCompare(b.sku)),
    })
  }
  return mukerrer.sort((a, b) =>
    (b.kategori_sinirini_asiyor - a.kategori_sinirini_asiyor) || (b.urun_sayisi - a.urun_sayisi) || a.hash.localeCompare(b.hash))
}

/**
 * Kapı: bilinmeyen kategori aşımı ya da bilinen grubun yayılması KIRMIZI.
 * @param {{hash: string, urun_sayisi: number, kategoriler: string[], kategori_sinirini_asiyor: boolean}[]} gruplar
 * @param {Record<string, number>} [bilinen] hash → izin verilen en çok ürün
 */
export function mukerrerKapisi(gruplar, bilinen = BILINEN_KATEGORI_ASAN) {
  const ihlal = []
  for (const g of gruplar.filter((x) => x.kategori_sinirini_asiyor)) {
    const tavan = bilinen[g.hash]
    if (tavan === undefined) ihlal.push(`YENİ kategori aşımı ${g.hash}: ${g.urun_sayisi} ürün (${g.kategoriler.join(' + ')})`)
    else if (g.urun_sayisi > tavan) ihlal.push(`bilinen grup YAYILDI ${g.hash}: ${g.urun_sayisi} > ${tavan} ürün`)
  }
  return { ihlal, kirmizi: ihlal.length > 0 }
}
