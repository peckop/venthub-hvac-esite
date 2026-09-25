/**
 * TAŞINABİLİR KATALOG — TAZELİK (REC-212, OPS hükmü 2026-09-24). Saf; ağa ve diske çıkmaz.
 *
 * ── NİÇİN VAR (olay)
 * 2026-09-24'te paketin ham dökümü 09-10 tarihli çıktı: canlıdan 316 satır farklıydı (281 ürün, 34 aile —
 * iki haftanın onaylı yazımları). Paket "ana kaynak" sayılıyor (K13); bayat paket geri yüklenseydi o yazımlar
 * SESSİZCE geri alınırdı. Paket her canlı yazımda kendiliğinden bayatlar ve bunu hiçbir şey ölçmüyordu.
 *
 * ── NİÇİN ZAMAN DAMGASI DEĞİL, PARMAK İZİ
 * "paket damgası ≥ en son updated_at" karşılaştırması üç yerde kördür (şema 2026-09-24 tabanından ölçüldü):
 * `categories.updated_at` tetiksizdir (düzenleme damgayı ilerletmez), `product_images`'ta updated_at yoktur,
 * ve SİLİNEN satır hiçbir damga bırakmaz. Tablonun kendisinin sha256'sı ise her değişikliği görür.
 * Parmak izi DIŞA AKTARICININ manifest'e yazdığı izle aynı fonksiyondan üretilir (tek kaynak): iki ayrı
 * hesap yazılsaydı biri anahtar sırasını değiştirdiğinde kapı her şeyi "bayat" derdi ya da hiçbir şeyi.
 */
import { createHash } from 'node:crypto'

/** Anahtar sırası sabit: aynı veri iki koşumda aynı baytı verir. */
export const sirala = (o) => {
  const y = {}
  for (const k of Object.keys(o).sort()) y[k] = o[k]
  return y
}

/** Tablonun ham gövdesi (paketteki `ham/<tablo>.jsonl`'in birebir içeriği). Satırlar id sırasında gelmelidir. */
export const tabloGovdesi = (satirlar) => satirlar.map((s) => JSON.stringify(sirala(s))).join('\n') + '\n'

export const parmakIzi = (satirlar) => createHash('sha256').update(tabloGovdesi(satirlar)).digest('hex')

/**
 * @param {{ uretildi?: string, tablolar?: Record<string, { satir: number, sha256: string }> } | null} manifest
 *   paketin manifest.json'u; yoksa null
 * @param {Record<string, { satir: number, sha256: string }>} canli  manifest'teki her tablonun canlı ölçümü
 * @returns {{ durum: 'TAZE' | 'BAYAT' | 'PAKET YOK', damga: string | null,
 *   bayat: { tablo: string, paket_satir: number, canli_satir: number }[], olculmedi: string[] }}
 */
export function tazelik(manifest, canli) {
  if (!manifest || !manifest.tablolar || !Object.keys(manifest.tablolar).length) {
    return { durum: 'PAKET YOK', damga: null, bayat: [], olculmedi: [] }
  }
  const bayat = []
  const olculmedi = []
  for (const [tablo, p] of Object.entries(manifest.tablolar)) {
    const c = canli[tablo]
    if (!c) { olculmedi.push(tablo); continue }
    if (c.sha256 !== p.sha256) bayat.push({ tablo, paket_satir: p.satir, canli_satir: c.satir })
  }
  // Ölçülemeyen tablo "taze" SAYILMAZ: kapı yalnız her tabloyu gördüğünde yeşil verir.
  const durum = bayat.length || olculmedi.length ? 'BAYAT' : 'TAZE'
  return { durum, damga: manifest.uretildi ?? null, bayat, olculmedi }
}

/** Karne satırının not metni. */
export function tazelikNotu(t) {
  if (t.durum === 'PAKET YOK') return 'paket bulunamadı (manifest.json yok) — önce katalog-disa-aktar + katalog-paket-uret'
  const ek = [
    ...t.bayat.map((b) => `${b.tablo} ${b.paket_satir}→${b.canli_satir}${b.paket_satir === b.canli_satir ? ' (içerik)' : ''}`),
    ...t.olculmedi.map((x) => `${x} ÖLÇÜLMEDİ`),
  ]
  return `paket ${t.damga ?? '?'}` + (ek.length ? ` · farklı: ${ek.join(' · ')} — paketi yeniden üret` : ' · canlıyla birebir (sha256)')
}
