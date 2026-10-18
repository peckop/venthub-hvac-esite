/**
 * radon-ca-rm-fix.mjs — saf kurallar (DB'ye ve ağa hiç gitmez; test edilebilir).
 * Test: scripts/db/product-data/__tests__/radon-ca-rm-fix-kurallar.test.ts
 *
 * KTL-48: Vortice CA-RM (Radon) ailesinde canlı değerler ↔ katalog (Ocak 2026, 191875 s.61 ve s.64)
 * düzeltmesi. Bu modül iki iş yapar:
 *   1. manifestIhlalleri(): manifestin kendi iç tutarlılığı (yazımdan önce, fail-closed).
 *   2. hedefHesapla(): canlı satır + manifest kalemi → yazılacak nesne ve fark listesi; canlı değer
 *      manifestin `onceki` değerinden farklıysa (ölçümden sonra biri değiştirmiş) BAYAT ihlali verir.
 */

/** §11.6: birimli alan adı (…_v, …_kg, …_db) sayı olmalı, metin olamaz. */
const BIRIMLI = /_(v|m3h|w|pa|kg|mm|a|hz|db)$/
/** pq_curve DB'de metin olarak tutuluyor ("[[0, 902], [470, 676.5], [940, 0]]"). */
const SAYI_CIFTI_DIZISI = /^\[\s*(\[\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*\]\s*,?\s*)+\]$/

const ARALIK = {
  weight_kg: [0.1, 100],
  rpm_max: [500, 6000],
  noise_lpa_3m_db: [10, 100],
  absorbed_current_a: [0.01, 50],
  size_c_mm: [50, 2000],
  max_static_pressure_pa: [1, 5000],
}

const esit = (a, b) => (a === null || a === undefined || b === null || b === undefined)
  ? (a ?? null) === (b ?? null)
  : (typeof a === 'number' || typeof b === 'number') ? Number(a) === Number(b) : String(a) === String(b)

/**
 * @param {object} manifest
 * @param {{ kodDeseni?: RegExp, kodAciklama?: string, aralik?: Record<string, [number, number]> }} [secenek]
 *   Varsayılan (secenek yok): anahtar 5 haneli model_code, ARALIK tablosu (Radon / Air Door davranışı DEĞİŞMEZ).
 *   KTL-55 (SEAT): anahtar `SEA-<8 hane>` sku, weight_kg aralığı geniş (SEAT 50 ≈ 138 kg).
 */
export function manifestIhlalleri(manifest, secenek = {}) {
  const v = []
  const items = manifest?.items
  const kodDeseni = secenek.kodDeseni ?? /^\d{5}$/
  const kodAciklama = secenek.kodAciklama ?? 'model_code 5 haneli sayi olmali'
  const aralikTablosu = { ...ARALIK, ...(secenek.aralik ?? {}) }
  if (!items || typeof items !== 'object' || Object.keys(items).length === 0) return ['items bos']
  for (const [kod, it] of Object.entries(items)) {
    const s = `${kod}`
    if (!kodDeseni.test(kod)) v.push(`${s}: ${kodAciklama}`)
    if (!it.ad) v.push(`${s}: ad yok`)
    if (!it.kaynak) v.push(`${s}: kaynak (belge + sayfa) yok`)
    const yeni = it.yeni ?? {}
    const onceki = it.onceki ?? {}
    if (Object.keys(yeni).length === 0 && !(it.kaldir ?? []).length) v.push(`${s}: yeni de kaldir da bos (kalem anlamsiz)`)
    for (const [k, val] of Object.entries(yeni)) {
      if (!(k in onceki)) v.push(`${s}: ${k} yeni ama onceki'de beklenen deger yazilmamis (yeni alan icin null yaz)`)
      if (k === 'pq_curve') {
        if (typeof val !== 'string' || !SAYI_CIFTI_DIZISI.test(val)) v.push(`${s}: pq_curve [[q,p],...] metni olmali: ${JSON.stringify(val)}`)
        continue
      }
      if (BIRIMLI.test(k) || k === 'rpm_max') {
        if (typeof val !== 'number' || !Number.isFinite(val)) v.push(`${s}: ${k} birimli alan ama SAYI degil (${JSON.stringify(val)}) — §11.6`)
      }
      const ar = aralikTablosu[k]
      if (ar && typeof val === 'number' && (val < ar[0] || val > ar[1])) v.push(`${s}: ${k}=${val} makul aralik disi [${ar[0]}, ${ar[1]}]`)
    }
    // Eski alan ancak yerine geçen alan yeni nesnede doluysa kaldırılır (veri kaybı yok).
    for (const kd of it.kaldir ?? []) {
      if (!kd.alan || !kd.yerine) v.push(`${s}: kaldir kaydi {alan, yerine} olmali`)
      else if (yeni[kd.yerine] === undefined || yeni[kd.yerine] === null) v.push(`${s}: ${kd.alan} kaldirilamaz — yerine gecen ${kd.yerine} yeni'de dolu degil`)
      if (kd.alan && !(kd.alan in onceki)) v.push(`${s}: kaldirilan ${kd.alan} icin onceki deger yazilmamis`)
    }
    // Kolon aynasi: products.weight_kg, technical_specs.weight_kg ile AYNI olmali.
    const kolon = it.kolon ?? {}
    for (const [k, val] of Object.entries(kolon)) {
      if (k !== 'weight_kg') v.push(`${s}: kolon ${k} desteklenmiyor (yalniz weight_kg)`)
      else if (yeni.weight_kg !== undefined && !esit(val, yeni.weight_kg)) v.push(`${s}: kolon.weight_kg ${val} != yeni.weight_kg ${yeni.weight_kg}`)
    }
    if (it.kolon_onceki !== undefined && typeof it.kolon_onceki?.weight_kg !== 'number') v.push(`${s}: kolon_onceki.weight_kg sayi olmali`)
    if (Object.keys(kolon).length && it.kolon_onceki === undefined) v.push(`${s}: kolon yazilacak ama kolon_onceki yok`)
  }
  return v
}

/**
 * @param {{ id: string, sku?: string, weight_kg: number|string|null, technical_specs: Record<string, unknown>|null }} satir canlı satır
 * @param {object} it manifest kalemi
 * @returns {{ ihlaller: string[], yeniSpecs: Record<string, unknown>, yeniKolon: Record<string, number>, farklar: Array<{alan: string, kind: string, from: unknown, to: unknown}> }}
 */
export function hedefHesapla(satir, it) {
  const ihlaller = []
  const onceki = it.onceki ?? {}
  const mevcut = satir.technical_specs ?? {}
  for (const [k, beklenen] of Object.entries(onceki)) {
    const canli = mevcut[k] === undefined ? null : mevcut[k]
    if (!esit(canli, beklenen)) ihlaller.push(`${satir.sku ?? satir.id}: BAYAT — ${k} canli ${JSON.stringify(canli)}, manifestte beklenen ${JSON.stringify(beklenen)} (olcumden sonra degismis)`)
  }
  if (it.kolon_onceki && !esit(satir.weight_kg === null ? null : Number(satir.weight_kg), it.kolon_onceki.weight_kg)) {
    ihlaller.push(`${satir.sku ?? satir.id}: BAYAT — kolon weight_kg canli ${satir.weight_kg}, manifestte beklenen ${it.kolon_onceki.weight_kg}`)
  }
  const yeniSpecs = { ...mevcut }
  const farklar = []
  for (const [k, val] of Object.entries(it.yeni ?? {})) {
    if (mevcut[k] === undefined) { yeniSpecs[k] = val; farklar.push({ alan: k, kind: 'YENI', from: null, to: val }) }
    else if (!esit(mevcut[k], val)) { yeniSpecs[k] = val; farklar.push({ alan: k, kind: 'DEGISTI', from: mevcut[k], to: val }) }
  }
  for (const kd of it.kaldir ?? []) {
    if (kd.alan in yeniSpecs) { farklar.push({ alan: kd.alan, kind: 'KALDIRILDI', from: yeniSpecs[kd.alan], to: null }); delete yeniSpecs[kd.alan] }
  }
  const yeniKolon = {}
  for (const [k, val] of Object.entries(it.kolon ?? {})) {
    if (!esit(satir.weight_kg === null ? null : Number(satir.weight_kg), val)) { yeniKolon[k] = val; farklar.push({ alan: `kolon.${k}`, kind: 'DEGISTI', from: satir.weight_kg === null ? null : Number(satir.weight_kg), to: val }) }
  }
  return { ihlaller, yeniSpecs, yeniKolon, farklar }
}
