/**
 * lineo-quiet-ses-fix.mjs — saf kurallar (DB'ye ve ağa hiç gitmez; test edilebilir).
 * Test: scripts/db/product-data/__tests__/lineo-quiet-ses-fix-kurallar.test.ts
 *
 * KTL-50: Vortice Lineo Quiet (12 model) canlı ses değeri ↔ güncel katalog (Şubat/Mayıs 2026).
 * Canlı değerler Aralık 2020 baskısının "gövdeden yayılan" Lp'sidir (manifest `_kok`). İki yer birlikte düzelir:
 *   1. technical_specs.noise_level_db_a  (sihirbaz + teknik tablo bunu okur; yerinde düzeltilir)
 *   2. description_i18n.tr / .en içindeki AYNI sayı (ürün açıklama cümlesi)
 * Bu modül:
 *   - manifestIhlalleri(): manifestin kendi iç tutarlılığı (yazımdan önce, fail-closed).
 *   - hedefHesapla(): canlı satır + manifest kalemi → yazılacak nesneler ve fark listesi; canlı değer
 *     manifestin `onceki` (ya da zaten `yeni`) değerinden başkaysa BAYAT ihlali verir.
 */

const ALAN = 'noise_level_db_a'
/** §11.6: dB(A) makul aralığı (3 m serbest alan Lp, kanal fanı). */
const ARALIK = [10, 100]

/** TR gösterim: 26.1 → "26,1"; 47 → "47". */
export const sayiTR = (n) => String(n).replace('.', ',')
/** EN gösterim: 26.1 → "26.1"; 47 → "47". */
export const sayiEN = (n) => String(n)

/**
 * Açıklama cümlesindeki ses sayısını yakalayan kalıplar — SAYI tek yakalama grubudur.
 * Kalıp bilinçli dar: cümle kalıbı değişmişse (başka biri düzenlemişse) eşleşme sıfır olur ve betik DURUR.
 */
const KALIP = {
  tr: /yayılan ses basıncı seviyesi (\d+(?:,\d+)?) dB\(A\)/g,
  en: /Radiated sound pressure level at (?:top speed|the 10 V step): (\d+(?:\.\d+)?) dB\(A\)/g,
}

const esit = (a, b) => (a === null || a === undefined || b === null || b === undefined)
  ? (a ?? null) === (b ?? null)
  : Number(a) === Number(b)

export function manifestIhlalleri(manifest) {
  const v = []
  const items = manifest?.items
  if (!items || typeof items !== 'object' || Object.keys(items).length === 0) return ['items bos']
  const kodlar = Object.keys(items)
  if (kodlar.length !== 12) v.push(`manifest ${kodlar.length} model iceriyor (12 Lineo Quiet bekleniyor)`)
  for (const [kod, it] of Object.entries(items)) {
    const s = `${kod}`
    if (!/^171\d{2}$/.test(kod)) v.push(`${s}: model_code 171xx olmali`)
    if (!it.ad) v.push(`${s}: ad yok`)
    if (!it.kaynak) v.push(`${s}: kaynak (belge + sayfa) yok`)
    if (it.motor !== 'AC' && it.motor !== 'ES') v.push(`${s}: motor AC ya da ES olmali (aciklama cumlesi kalibi buna bagli)`)
    const yeni = it.yeni?.[ALAN]
    const onceki = it.onceki?.[ALAN]
    for (const [etiket, val] of [['yeni', yeni], ['onceki', onceki]]) {
      if (typeof val !== 'number' || !Number.isFinite(val)) v.push(`${s}: ${etiket}.${ALAN} SAYI olmali (${JSON.stringify(val)}) — §11.6`)
      else if (val < ARALIK[0] || val > ARALIK[1]) v.push(`${s}: ${etiket}.${ALAN}=${val} makul aralik disi [${ARALIK[0]}, ${ARALIK[1]}]`)
    }
    // Yazilan deger katalogdaki GOVDE (yayilan) sutunudur; baska sutun sessizce yazilmaz.
    const k = it.katalog ?? {}
    for (const sut of ['emme', 'ufleme', 'govde']) {
      if (typeof k[sut] !== 'number') v.push(`${s}: katalog.${sut} sayi degil — uc sutun da kayitli olmali (kaynak kaniti)`)
    }
    if (typeof k.govde === 'number' && !esit(yeni, k.govde)) v.push(`${s}: yeni ${yeni} != katalog.govde ${k.govde} (yazilan deger govde sutunu olmali)`)
    // Kok kaniti: canli (onceki) deger eski baskinin govde sutunuyla birebir.
    if (typeof it.eski_baski_govde !== 'number') v.push(`${s}: eski_baski_govde yok (kok kaniti)`)
    else if (!esit(onceki, it.eski_baski_govde)) v.push(`${s}: onceki ${onceki} != eski_baski_govde ${it.eski_baski_govde}`)
    if (esit(onceki, yeni)) v.push(`${s}: onceki = yeni (kalem anlamsiz)`)
    // Yalniz tek alan degisir.
    const alanlar = Object.keys(it.yeni ?? {})
    if (alanlar.length !== 1 || alanlar[0] !== ALAN) v.push(`${s}: yeni yalniz {${ALAN}} icermeli (${alanlar.join(',')})`)
  }
  return v
}

/** Cümledeki sayıyı yenisiyle değiştirir; kalıp TAM 1 kez eşleşmiyorsa ya da sayı beklenenden başkaysa ihlal döner. */
function cumleDegistir(metin, dil, beklenenSayilar, yeniSayi, etiket) {
  if (typeof metin !== 'string') return { ihlal: `${etiket}: ${dil} aciklama metni yok`, yeni: metin, degisti: false }
  const kalip = new RegExp(KALIP[dil].source, 'g')
  const eslesmeler = [...metin.matchAll(kalip)]
  if (eslesmeler.length !== 1) return { ihlal: `${etiket}: ${dil} aciklamada ses cumlesi ${eslesmeler.length} kez eslesti (1 bekleniyor)`, yeni: metin, degisti: false }
  const mevcut = eslesmeler[0][1]
  if (mevcut === yeniSayi) return { ihlal: null, yeni: metin, degisti: false }
  if (!beklenenSayilar.includes(mevcut)) return { ihlal: `${etiket}: BAYAT — ${dil} aciklamadaki ses ${mevcut}, manifestte beklenen ${beklenenSayilar.join(' / ')} (olcumden sonra degismis)`, yeni: metin, degisti: false }
  // Sayı cümlenin SONUNDA ("… 26,1 dB(A)"); "10 V" gibi baştaki rakamlara dokunmamak için sondan değiştirilir.
  const yeniMetin = metin.replace(kalip, (tum) => tum.replace(/\d+(?:[.,]\d+)?( dB\(A\))$/, `${yeniSayi}$1`))
  return { ihlal: null, yeni: yeniMetin, degisti: true }
}

/**
 * @param {{ id: string, sku?: string, technical_specs: Record<string, unknown>|null, description_i18n: Record<string, unknown>|null }} satir canlı satır
 * @param {object} it manifest kalemi
 * @returns {{ ihlaller: string[], yeniSpecs: Record<string, unknown>, yeniAciklama: Record<string, unknown>, farklar: Array<{alan: string, kind: string, from: unknown, to: unknown}> }}
 */
export function hedefHesapla(satir, it) {
  const ihlaller = []
  const farklar = []
  const etiket = satir.sku ?? satir.id
  const onceki = it.onceki?.[ALAN]
  const yeni = it.yeni?.[ALAN]

  // technical_specs.noise_level_db_a — canlı değer onceki YA DA zaten yeni olmalı (tekrar koşum güvenli).
  const mevcutSpecs = satir.technical_specs ?? {}
  const canli = mevcutSpecs[ALAN] === undefined ? null : mevcutSpecs[ALAN]
  const yeniSpecs = { ...mevcutSpecs }
  if (esit(canli, yeni)) {
    // zaten hedefte
  } else if (esit(canli, onceki)) {
    yeniSpecs[ALAN] = yeni
    farklar.push({ alan: `technical_specs.${ALAN}`, kind: 'DEGISTI', from: canli, to: yeni })
  } else {
    ihlaller.push(`${etiket}: BAYAT — ${ALAN} canli ${JSON.stringify(canli)}, manifestte beklenen ${JSON.stringify(onceki)} (olcumden sonra degismis)`)
  }

  // description_i18n.tr / .en — aynı sayı, ayrı biçimde (virgül / nokta). Diğer anahtarlar korunur.
  const mevcutAciklama = satir.description_i18n ?? {}
  const yeniAciklama = { ...mevcutAciklama }
  for (const [dil, bicim] of [['tr', sayiTR], ['en', sayiEN]]) {
    const r = cumleDegistir(mevcutAciklama[dil], dil, [bicim(onceki)], bicim(yeni), etiket)
    if (r.ihlal) ihlaller.push(r.ihlal)
    if (r.degisti) {
      yeniAciklama[dil] = r.yeni
      farklar.push({ alan: `description_i18n.${dil}`, kind: 'DEGISTI', from: bicim(onceki), to: bicim(yeni) })
    }
  }
  return { ihlaller, yeniSpecs, yeniAciklama, farklar }
}
