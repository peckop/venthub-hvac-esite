/**
 * ÜRÜN DURUMU PLANI — saf çekirdek (DB'ye dokunmaz). Yazıcı: `urun-durum-yaz.mjs`. REC-397, karar 130.
 *
 * NİÇİN VAR: üreticinin "not in compliance" dediği ürünleri satıştan çekmek (pasif, geri açılabilir).
 * Yalnız `products.status` değişir; fiyat satırı, teknik veri, görsel, adres DOKUNULMAZ — geri açınca
 * ürün olduğu gibi döner. İzinli değerler DB kısıtıyla aynı: products_status_check (active|draft|archived).
 *
 * Plan dosyası: `{ _nicin, _kanit, karar, skus: { SKU: { onceki, yeni } } }`.
 * RED (hiç yazım olmaz): SKU canlıda yok · canlı durum `onceki`den farklı (başkası değiştirmiş) ·
 * `yeni` izinli değil · `_nicin`/`_kanit` boş. Zaten `yeni` durumdaysa AYNI (yazılmaz, red değil).
 */

export const IZINLI = ['active', 'draft', 'archived']

/**
 * @param {Array<{id: string, sku: string, status: string}>} urunler canlı ürün satırları
 * @param {{_nicin?: string, _kanit?: string, skus?: Record<string, {onceki: string, yeni: string}>}} plan
 */
export function durumPlani(urunler, plan) {
  const bySku = new Map(urunler.map(u => [u.sku, u]))
  const yazilacak = []
  const ayni = []
  const red = []
  if (!plan?._nicin?.trim() || !plan?._kanit?.trim()) red.push({ sku: '*', sebep: '_nicin ve _kanit zorunlu' })
  const skus = plan?.skus || {}
  if (!Object.keys(skus).length) red.push({ sku: '*', sebep: 'plan boş' })
  for (const [sku, { onceki, yeni }] of Object.entries(skus)) {
    const u = bySku.get(sku)
    if (!u) { red.push({ sku, sebep: 'canlıda yok' }); continue }
    if (!IZINLI.includes(yeni)) { red.push({ sku, sebep: `izinsiz durum: ${yeni}` }); continue }
    if (u.status === yeni) { ayni.push({ sku, id: u.id, durum: yeni }); continue }
    if (u.status !== onceki) { red.push({ sku, sebep: `canlı durum ${u.status}, plan ${onceki} bekliyor` }); continue }
    yazilacak.push({ sku, id: u.id, onceki, yeni })
  }
  return { yazilacak, ayni, red }
}

/** Yedek = ters plan: aynı yazıcıyla koşulunca her şeyi eski hâline döndürür. */
export function tersPlan(plan, yazilacak) {
  return {
    _nicin: `GERİ ALMA: ${plan._nicin}`,
    _kanit: plan._kanit,
    karar: plan.karar,
    skus: Object.fromEntries(yazilacak.map(y => [y.sku, { onceki: y.yeni, yeni: y.onceki }])),
  }
}
