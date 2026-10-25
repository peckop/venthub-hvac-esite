/**
 * REHBER AĞLI DENETİM KOLU — canlı sayfaya karşı (ARC-206 İŞ 2, HRT-70; rehber-yazisi-standard.md R10.5/R10.6 madde 1-3).
 *
 * NİÇİN: ağsız `rehber-denetim.mjs` yazının METNİNİ denetler; ama dersler canlı sayfayla karşılaştırmada çiğnendi:
 *   · BLG-15 sessiz fan: rehber başlığı/meta açıklaması yazıyı gösterecek kategori ve aile sayfası metniyle çakıştı,
 *     Google sayfayı rehber başlığıyla gösterdi (18-22 Ekim 0 gösterim).
 *   · BLG-18: katalog "8 model" ↔ canlı "5 model"; olmayan seri adı (CA V0) yazıdaki sayıyla sayfayı eşleştirmedi.
 *   · BLG-18: hide_price kategoride yazıya fiyat cümlesi yazılırken canlı aile sayfasında ₺/TL 0, "Teklif" 12 idi.
 *
 * GİRDİ (JSON dosyası, depo dışı olabilir; ham yazı değil, denetlenecek alanlar):
 *   {
 *     "yazi":   { "baslik": "…", "metaAciklama": "…", "kartOzeti": "…" },
 *     "sayfalar": ["https://venthub.com.tr/tr/…", …],            // yazıyı gösterecek kategori + aile sayfaları
 *     "iddialar": [ { "sayfa": "https://…", "metin": "26,1 dB(A)" }, … ],   // sayfada GÖRÜNMESİ gereken ifade
 *     "seriler": [ "CA MD", … ],                                  // canlıda (sayfalardan birinde) var olmalı
 *     "yazidaFiyatVar": false,                                    // yazı gövdesinde fiyat cümlesi var mı
 *     "yayinlandi": false                                         // true: yazı canlıda; başlık çakışması en çok UYARI
 *   }
 *
 * ÖLÇÜLENLER (hepsi ağlı; yönlendirme İZLENMEZ, 200 değilse ÖLÇÜLEMEDİ):
 *   1. cakisma:  başlık, metaAciklama, kartOzeti için, her sayfa metniyle 3'lü kelime dizilimi ortak oranı.
 *                oran ≥ 0.5 KALDI, ≥ 0.2 UYARI, altı GEÇTİ. Sayfa metninden script/style/etiket ve data-nosnippet
 *                bloklar atılır (yayınlanmış rehber kartının kendi metni sayılmaz).
 *   2. iddia:    her iddia metni belirtilen sayfanın görünür metninde AYNEN (sayı gösterimi , ve . eşit) bulunmalı.
 *   3. seri:     her seri adı sayfalardan en az birinde görünür metinde bulunmalı.
 *   4. fiyat:    her sayfada ₺/TL desenli sayı ve "Teklif" sayısı (BİLGİ). yazidaFiyatVar=true iken sayfada
 *                görünür fiyat 0 ve "Teklif" > 0 ise KALDI (hide_price: yazıda fiyat cümlesi olmaz).
 *
 * BLOG iddia tablosu (`--iddia <json>`; şema {iddialar:[{no, metin, tur:"sayi"|"genel", …}]}): tur "sayi" satırlarındaki
 * sayı+birim ifadeleri (150 mm, IP45, 8 model…) verilen canlı sayfaların birleşik metninde aranır; bulunmayan UYARI
 * (katalog-canlı farkı KATALOG/ÜRÜN'e kartla gider, KALDI değil). Aile eşleşmesi alanı tabloda yok: bir sonraki yazıdan
 * "canli":{"aile","alan","deger"} eklenirse kesin KALDI kolu ayrıca kurulur.
 *
 * Kullanım:  node tools/rehber/canli-denetim.mjs <girdi.json> [--iddia <iddia-tablosu.json>]
 * Çıkış: 0 GEÇTİ (UYARI olabilir) · 1 KALDI · 3 ölçülemedi (KALDI yoksa). BLOG dosyalarına dokunmaz.
 */
import { readFileSync } from 'node:fs'

import { FIYAT } from '../../scripts/rehber/rehber-denetim.mjs'

export const ESIK_KALDI = 0.5
export const ESIK_UYARI = 0.2

/** HTML → görünür düz metin (script/style/yorum/data-nosnippet blokları atılır). */
export function gorunurMetin(html) {
  let h = html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
  // data-nosnippet: aynı etiket adıyla kapanana kadar (iç içe aynı etiket yoksa doğru; ayrıntı UYARI notunda)
  h = h.replace(/<([a-z0-9]+)\b[^>]*\bdata-nosnippet\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  h = h.replace(/<[^>]+>/g, ' ')
  const kod = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' }
  h = h.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (m) => kod[m])
  return h.replace(/\s+/g, ' ').trim()
}

/** Metin → küçük harf kelime dizisi (Türkçe harfler korunur, noktalama atılır; sayıdaki , ve . kalır). */
export function kelimeler(metin) {
  return String(metin || '')
    .toLocaleLowerCase('tr')
    .replace(/[^\p{L}\p{N},.]+/gu, ' ')
    .replace(/(?<![\p{N}])[,.]+|[,.]+(?![\p{N}])/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** Kelime dizisi → 3'lü dizilim kümesi. */
export function uclular(metin) {
  const k = kelimeler(metin)
  const s = new Set()
  for (let i = 0; i + 2 < k.length; i++) s.add(`${k[i]} ${k[i + 1]} ${k[i + 2]}`)
  return s
}

/** Aday metnin 3'lü dizilimlerinin kaçı sayfa metninde de var → { ortak, toplam, oran }. */
export function cakismaOlc(aday, sayfaMetni) {
  const a = uclular(aday)
  if (!a.size) return { ortak: 0, toplam: 0, oran: 0 }
  const s = uclular(sayfaMetni)
  let ortak = 0
  for (const x of a) if (s.has(x)) ortak++
  return { ortak, toplam: a.size, oran: ortak / a.size }
}

/** Sayı gösterimi eşitlenir: "26,1" = "26.1"; aranan ifade küçük harfe indirilip boşluklar tekleştirilir. */
export function ifadeVarMi(metin, ifade) {
  const norm = (t) => String(t).toLocaleLowerCase('tr').replace(/(\d),(\d)/g, '$1.$2').replace(/\s+/g, ' ').trim()
  return norm(metin).includes(norm(ifade))
}

/**
 * Cümle → denetlenecek sayı ifadeleri: "[n]" atıf numaraları ve düz yıl/sıra sayıları atılır; sayı + birim
 * ("150 mm", "IP45", "26,1 dB(A)", "8 model") ya da birimsiz ondalık sayı kalır. Tekil, sıra korunur.
 */
export function sayiTokenleri(metin) {
  const t = String(metin || '').replace(/\[[\d,\s–-]+\]/g, ' ')
  const out = []
  const desenler = [
    /\bIP\s?\d{2}\b/g,
    /\d+(?:[.,]\d+)?\s?(?:mm|cm|m³\/h|m3\/h|m\/s|dB\(A\)|dB|kW|W|V|Hz|Pa|rpm|dev\/dk|°C|%)(?![\p{L}])/gu,
    /(?<![\p{L}\p{N}.,])\d+[.,]\d+(?![\p{N}])/gu,
  ]
  for (const d of desenler) for (const m of t.matchAll(d)) out.push(m[0].trim())
  // sayım sözcükleri Türkçe ek alır ("8 modelden", "5 adet"): sayı + gövde tutulur
  for (const m of t.matchAll(/(?<![\p{L}\p{N}.,])(\d+)\s?(model|adet|kademe)\p{L}*/giu)) out.push(`${m[1]} ${m[2].toLocaleLowerCase('tr')}`)
  const tekil = [...new Set(out)]
  // başka bir ifadenin içinde zaten geçen ("26,1" ⊂ "26,1 dB(A)") parça ayrıca aranmaz
  return tekil.filter((x) => !tekil.some((y) => y !== x && y.includes(x)))
}

/** BLOG iddia tablosu JSON'u → tur "sayi" satırları { no, sayilar[] } (sayısı olmayan satır atılır). */
export function sayiIddialari(tablo) {
  return (tablo?.iddialar || [])
    .filter((i) => i && i.tur === 'sayi')
    .map((i) => ({ no: i.no, sayilar: sayiTokenleri(i.metin) }))
    .filter((i) => i.sayilar.length)
}

/** Sayfa metninde ₺/TL desenli geçiş sayısı ve "Teklif" geçiş sayısı. */
export function fiyatOlc(metin) {
  const fiyat = (metin.match(new RegExp(FIYAT.source, 'giu')) || []).length
  const teklif = (metin.match(/teklif/giu) || []).length
  return { fiyat, teklif }
}

const madde = (ad, durum, ayrinti) => ({ ad, durum, ayrinti })

/**
 * @typedef {{ status: number, headers?: { get(ad: string): string | null }, text(): Promise<string> }} Cevap
 * @typedef {(adres: string, secenek?: { redirect?: 'manual' }) => Promise<Cevap>} Getir
 * @param {{ yazi?: { baslik?: string, metaAciklama?: string, kartOzeti?: string }, sayfalar?: string[], iddialar?: { sayfa: string, metin: string }[], seriler?: string[], yazidaFiyatVar?: boolean, yayinlandi?: boolean, iddiaTablosu?: { iddialar?: { no: number, metin: string, tur?: string }[] } }} girdi
 * @param {{ getir?: Getir }} [secenek]
 */
export async function canliDenetle(girdi, { getir = fetch } = {}) {
  const maddeler = []
  const sayfalar = [...new Set([...(girdi.sayfalar || []), ...(girdi.iddialar || []).map((i) => i.sayfa)])]
  const metinler = new Map() // sayfa → görünür metin
  for (const s of sayfalar) {
    try {
      const r = await getir(s, { redirect: 'manual' })
      if (r.status !== 200) maddeler.push(madde('sayfa', 'ÖLÇÜLEMEDİ', `${s} → ${r.status}`))
      else metinler.set(s, gorunurMetin(await r.text()))
    } catch (e) {
      maddeler.push(madde('sayfa', 'ÖLÇÜLEMEDİ', `${s} → ${String(e?.cause?.code || e?.message || e)}`))
    }
  }

  // 1: çakışma
  const adaylar = [
    ['başlık', girdi.yazi?.baslik],
    ['metaAçıklama', girdi.yazi?.metaAciklama],
    ['kartÖzeti', girdi.yazi?.kartOzeti],
  ].filter(([, v]) => v)
  for (const [ad, aday] of adaylar) {
    for (const s of girdi.sayfalar || []) {
      if (!metinler.has(s)) continue
      const c = cakismaOlc(aday, metinler.get(s))
      if (!c.toplam) {
        maddeler.push(madde(`cakisma:${ad}`, 'UYARI', `${s}: 3 kelimeden kısa, ölçülemez`))
        continue
      }
      let durum = c.oran >= ESIK_KALDI ? 'KALDI' : c.oran >= ESIK_UYARI ? 'UYARI' : 'GEÇTİ'
      let not = ''
      // Yayınlanmış rehberin kartı sayfada başlığıyla görünür (tasarım gereği); başlık çakışması yalnız yayın ÖNCESİ KALDI üretir.
      if (girdi.yayinlandi && ad === 'başlık' && durum === 'KALDI') {
        durum = 'UYARI'
        not = ' — yayınlanmış: rehber kartı başlığı sayfada beklenir, yayın öncesi ölçüm kanıttır'
      }
      maddeler.push(madde(`cakisma:${ad}`, durum, `${s}: ${c.ortak}/${c.toplam} üçlü ortak (oran ${c.oran.toFixed(2)})${not}`))
    }
  }

  // 2: iddia
  for (const i of girdi.iddialar || []) {
    if (!metinler.has(i.sayfa)) continue
    maddeler.push(
      ifadeVarMi(metinler.get(i.sayfa), i.metin)
        ? madde('iddia', 'GEÇTİ', `"${i.metin}" ${i.sayfa} sayfasında var`)
        : madde('iddia', 'KALDI', `"${i.metin}" ${i.sayfa} sayfasında YOK (katalog-canlı farkı: KATALOG/ÜRÜN'e kartla gider)`),
    )
  }

  // 3: seri adı
  for (const ad of girdi.seriler || []) {
    const bulunan = [...metinler].filter(([, m]) => ifadeVarMi(m, ad)).map(([s]) => s)
    maddeler.push(
      bulunan.length
        ? madde('seri', 'GEÇTİ', `"${ad}" canlıda: ${bulunan[0]}${bulunan.length > 1 ? ` (+${bulunan.length - 1})` : ''}`)
        : madde('seri', metinler.size ? 'KALDI' : 'ÖLÇÜLEMEDİ', `"${ad}" verilen sayfaların hiçbirinde yok`),
    )
  }

  // 3b: BLOG iddia tablosu (`--iddia`): tur "sayi" satırlarındaki sayılar canlı sayfa metinlerinde var mı
  if (girdi.iddiaTablosu) {
    const hepsi = [...metinler.values()].join(' ')
    for (const i of sayiIddialari(girdi.iddiaTablosu)) {
      if (!metinler.size) break
      const yok = i.sayilar.filter((t) => !ifadeVarMi(hepsi, t))
      maddeler.push(
        yok.length
          ? madde('iddia-tablo', 'UYARI', `#${i.no}: canlı sayfalarda bulunmayan sayı: ${yok.join(', ')} — katalog-canlı farkı olabilir; KATALOG/ÜRÜN'e kartla gider`)
          : madde('iddia-tablo', 'GEÇTİ', `#${i.no}: ${i.sayilar.length} sayının hepsi canlıda var`),
      )
    }
  }

  // 4: fiyat
  for (const [s, m] of metinler) {
    if (!(girdi.sayfalar || []).includes(s)) continue
    const { fiyat, teklif } = fiyatOlc(m)
    if (girdi.yazidaFiyatVar && fiyat === 0 && teklif > 0) {
      maddeler.push(madde('fiyat', 'KALDI', `${s}: görünür ₺/TL 0, "Teklif" ${teklif} → hide_price; yazıda fiyat cümlesi olmaz`))
    } else {
      maddeler.push(madde('fiyat', 'GEÇTİ', `${s}: ₺/TL ${fiyat}, "Teklif" ${teklif} (bilgi)`))
    }
  }

  const durum = maddeler.some((m) => m.durum === 'KALDI')
    ? 'KALDI'
    : maddeler.some((m) => m.durum === 'ÖLÇÜLEMEDİ')
      ? 'ÖLÇÜLEMEDİ'
      : maddeler.length === 0
        ? 'ÖLÇÜLEMEDİ' // boş girdi sessiz yeşil değildir
        : 'GEÇTİ'
  return { durum, maddeler }
}

// ─── komut satırı ──────────────────────────────────────────────────────────────
const buDosya = import.meta.url.replace(/\\/g, '/').toLowerCase()
const cagrilan = process.argv[1] ? `file:///${process.argv[1].replace(/\\/g, '/').replace(/^\//, '')}`.toLowerCase() : ''
if (buDosya === cagrilan) {
  const arg = process.argv.slice(2)
  const yol = arg.find((a, i) => !a.startsWith('--') && !arg[i - 1]?.startsWith('--'))
  const iddiaYolu = arg[arg.indexOf('--iddia') + 1]
  if (!yol) {
    console.error('Kullanım: node tools/rehber/canli-denetim.mjs <girdi.json> [--iddia <iddia-tablosu.json>]')
    process.exit(2)
  }
  const girdi = JSON.parse(readFileSync(yol, 'utf8'))
  if (arg.includes('--iddia') && iddiaYolu) girdi.iddiaTablosu = JSON.parse(readFileSync(iddiaYolu, 'utf8'))
  const s = await canliDenetle(girdi)
  for (const m of s.maddeler) process.stdout.write(`${m.durum} | ${m.ad} | ${m.ayrinti}\n`)
  process.stdout.write(`SONUÇ: ${s.durum}\n`)
  process.exit(s.durum === 'GEÇTİ' ? 0 : s.durum === 'KALDI' ? 1 : 3)
}
