/**
 * YAYINDAKİ MODELLER VERİ ÜRETİCİSİ — URN-31 (karar 259 kısa pilot mekanizması).
 *
 * NİÇİN: `src/config/yayindaModeller.veri.json` (yayındaki modeller listesi) elle yazılmaz. Her SKU'nun model adres
 * metni (`slug_tr` / `slug_en`) Faz 2 CSV'sinden (`docs/plans/rec300-model-adres-listesi-2026-09-23.csv`) BİREBİR
 * gelir; sıfırdan üretilmez. CSV değişirse liste tek komutla yenilenir; `scripts/seo/__tests__/yayinda-model-veri-uret.test.ts` her satırı
 * CSV ile karşılaştırır (CSV ile liste ayrışırsa kapı KIRMIZI).
 *
 * Kullanım:
 *   node scripts/seo/yayinda-model-veri-uret.mjs --yenile
 *       Mevcut listenin SKU'larını CSV'den yeniden üretir ve yazar (CSV değişince). Boş liste → boş kalır.
 *   node scripts/seo/yayinda-model-veri-uret.mjs --girdi <dosya.json> [--cikti <yol>]
 *       Girdi (depo DIŞI tutulur): { "modeller": ["SKU", ...], "surumler": { "SURUM-SKU": "TEMEL-SKU" } }.
 *       --cikti verilmezse sonuç stdout'a; verilirse dosyaya yazılır (liste açma PR'ında `src/config/yayindaModeller.veri.json`).
 *   --csv <yol>  CSV'yi başka yoldan oku (varsayılan: yukarıdaki dosya).
 * Çıkış: 0 temiz · 1 hata (SKU CSV'de yok, girdi bozuk). Ağa çıkmaz, DB'ye dokunmaz.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const VARSAYILAN_CSV = join(KOK, 'docs', 'plans', 'rec300-model-adres-listesi-2026-09-23.csv')
export const VERI_DOSYASI = join(KOK, 'src', 'config', 'yayindaModeller.veri.json')

/** CSV (';' ayraçlı, BOM'lu, "" ile kaçışlı tırnaklı alanlar) → satırlar (dizi dizisi). */
export function csvAyristir(metin) {
  const girdi = metin.replace(/^﻿/, '')
  const satirlar = []
  let satir = []
  let alan = ''
  let tirnakta = false
  for (let i = 0; i < girdi.length; i++) {
    const c = girdi[i]
    if (tirnakta) {
      if (c === '"') {
        if (girdi[i + 1] === '"') {
          alan += '"'
          i++
        } else tirnakta = false
      } else alan += c
    } else if (c === '"') tirnakta = true
    else if (c === ';') {
      satir.push(alan)
      alan = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && girdi[i + 1] === '\n') i++
      satir.push(alan)
      alan = ''
      if (satir.some((x) => x !== '')) satirlar.push(satir)
      satir = []
    } else alan += c
  }
  if (alan !== '' || satir.length > 0) {
    satir.push(alan)
    if (satir.some((x) => x !== '')) satirlar.push(satir)
  }
  return satirlar
}

/** CSV metni → başlık adlı nesneler. */
export function csvSatirlari(metin) {
  const [baslik, ...govde] = csvAyristir(metin)
  if (!baslik) throw new Error('CSV boş')
  return govde.map((satir) => Object.fromEntries(baslik.map((ad, i) => [ad, satir[i] ?? ''])))
}

const kodSirasi = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

function indeks(satirlar) {
  const harita = new Map()
  for (const s of satirlar) harita.set(s.sku, s)
  return harita
}

/**
 * SKU listesi + sürüm eşlemesi → liste verisi (aile slug'una gruplu, kod sırasında).
 * Aile = CSV `aile_bugun` (canlıdaki aile slug'ı; `aile_yeni` gelecekteki addır). Sürümün ailesi temelinden gelir.
 */
export function veriUret(satirlar, girdi) {
  const csv = indeks(satirlar)
  const bul = (sku) => {
    const s = csv.get(sku)
    if (!s) throw new Error(`SKU CSV'de yok: ${sku}`)
    if (!s.slug_tr || !s.slug_en) throw new Error(`SKU için slug_tr / slug_en boş: ${sku}`)
    return s
  }
  const modeller = {}
  for (const sku of [...(girdi.modeller ?? [])].sort(kodSirasi)) {
    const s = bul(sku)
    ;(modeller[s.aile_bugun] ??= {})[sku] = { tr: s.slug_tr, en: s.slug_en }
  }
  const sirali = Object.fromEntries(Object.entries(modeller).sort(([a], [b]) => kodSirasi(a, b)))
  const surumler = {}
  for (const [surum, temel] of Object.entries(girdi.surumler ?? {}).sort(([a], [b]) => kodSirasi(a, b))) {
    const s = bul(surum)
    surumler[surum] = { temel, tr: s.slug_tr, en: s.slug_en }
  }
  return { modeller: sirali, surumler }
}

/**
 * Liste verisi ↔ CSV: her kayıt CSV satırıyla BİREBİR mi? Hata metinleri döner (boş = eşit).
 * Kontroller: SKU CSV'de var · slug_tr · slug_en · aile = aile_bugun · sürümün CSV ailesi temelinin ailesiyle aynı.
 */
export function csvKarsilastir(veri, satirlar) {
  const csv = indeks(satirlar)
  const hatalar = []
  const kontrol = (sku, kayit, aile) => {
    const s = csv.get(sku)
    if (!s) return hatalar.push(`${sku}: CSV'de satırı yok`)
    if (s.slug_tr !== kayit.tr) hatalar.push(`${sku}: slug_tr "${kayit.tr}" ≠ CSV "${s.slug_tr}"`)
    if (s.slug_en !== kayit.en) hatalar.push(`${sku}: slug_en "${kayit.en}" ≠ CSV "${s.slug_en}"`)
    if (s.aile_bugun !== aile) hatalar.push(`${sku}: aile "${aile}" ≠ CSV aile_bugun "${s.aile_bugun}"`)
  }
  const aileOf = new Map()
  for (const [aile, grup] of Object.entries(veri.modeller ?? {})) {
    for (const [sku, kayit] of Object.entries(grup)) {
      kontrol(sku, kayit, aile)
      aileOf.set(sku, aile)
    }
  }
  for (const [sku, kayit] of Object.entries(veri.surumler ?? {})) {
    const aile = aileOf.get(kayit.temel)
    if (aile === undefined) hatalar.push(`${sku}: temel ${kayit.temel} listede yok`)
    else kontrol(sku, kayit, aile)
  }
  return hatalar
}

/** Mevcut liste verisinin SKU girdisi (yenileme için). */
export function girdiyiCikar(veri) {
  return {
    modeller: Object.values(veri.modeller ?? {}).flatMap((g) => Object.keys(g)),
    surumler: Object.fromEntries(Object.entries(veri.surumler ?? {}).map(([s, k]) => [s, k.temel])),
  }
}

/** JSON metni (kararlı biçim: 2 boşluk, sonda satır sonu). */
export const veriMetni = (veri) => `${JSON.stringify(veri, null, 2)}\n`

function argumanlar(argv) {
  const a = { yenile: false, girdi: null, cikti: null, csv: VARSAYILAN_CSV }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--yenile') a.yenile = true
    else if (argv[i] === '--girdi') a.girdi = argv[++i]
    else if (argv[i] === '--cikti') a.cikti = argv[++i]
    else if (argv[i] === '--csv') a.csv = argv[++i]
    else throw new Error(`bilinmeyen argüman: ${argv[i]}`)
  }
  if (a.yenile === Boolean(a.girdi)) throw new Error('tam olarak biri gerekli: --yenile ya da --girdi <dosya>')
  return a
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const a = argumanlar(process.argv.slice(2))
    const satirlar = csvSatirlari(readFileSync(a.csv, 'utf8'))
    const girdi = a.yenile ? girdiyiCikar(JSON.parse(readFileSync(VERI_DOSYASI, 'utf8'))) : JSON.parse(readFileSync(a.girdi, 'utf8'))
    const metin = veriMetni(veriUret(satirlar, girdi))
    const hedef = a.yenile ? (a.cikti ?? VERI_DOSYASI) : a.cikti
    if (hedef) {
      writeFileSync(hedef, metin)
      console.log(`yazıldı: ${hedef}`)
    } else process.stdout.write(metin)
  } catch (hata) {
    console.error(`yayinda-model-veri-uret: ${hata instanceof Error ? hata.message : String(hata)}`)
    process.exit(1)
  }
}
