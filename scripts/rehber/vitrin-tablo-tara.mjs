/**
 * VİTRİN METİN TABLOSU TARAYICI — taslak tablo (anahtar | eski | yeni, TR/EN) Ürün'e verilmeden ÖNCE koşan
 * otomatik kapı (BLG-7; vitrin-genel-metin-standard.md M1–M8). BLG-6'da (684 satır) elle birleştirici içinde
 * yaşayan kapı burada ortak betik olur; aynı kapı bir sonraki tabloda da koşar.
 *
 * Kurallar (her bulgu {anahtar, tip, ayrinti}):
 *  EN-TERIM         yeni_en, INV-EN-ALT-KATEGORI-TERIM-1'in 6 yasak yazımını taşımaz (testin desenleri birebir)
 *  YASAK-TR / -EN   üstünlük, vaat, süslü soyut ifade, kaynaksız işletme beyanı kalıpları (M3, M5, M6, M7);
 *                   "garanti" yalnız garanti olgusuna (ctx.garantiOlgusu) dayanan satırda serbest
 *  DAYANAKSIZ-SAYI  yeni metindeki her sayı olgu kaynaklarında ya da satırın eski metninde bulunmalı (uydurma kapısı)
 *  DAYANAKSIZ-AD    yeni metindeki her özel ad olgu kaynaklarında, eski metinde ya da sitenin sözlüğünde bulunmalı
 *  MARKA-OLGU       bir marka adı geçen satırda yıl/yüzde, o markanın kayıttaki YAZILABİLİR olgusunda olmalı (M8)
 *  K10-EN-TR-HARF   yeni_en Türkçe harf taşımaz (dil düşüşü)
 *  YER-TUTUCU-FARKLI TR ve EN aynı yer tutucuları taşır
 *  BOS-YENI         yeni_tr/yeni_en boş değil (kaldırma satırı kod_notunda "kaldırılır" der; EN karşılığı yoksa "EN karşılığı kaldırılır")
 *  DAYANAK-YOK / DAYANAK-GECERSIZ  dayanak olgu numarası olmalı; iddiasız satır YALNIZ etiket/stil/kısa cümle VE kod_notunda
 *                   açık "olgu iddiası yok" beyanı varsa dayanaksız geçer (bu satırlarda diğer kapılar YİNE koşar)
 * Uzunluk taşması bulgu değil UYARI üretir (`UYARI-UZUN-*`), meta.siteTitle > 60 karakter bulgudur.
 *
 * Kullanım:
 *   node scripts/rehber/vitrin-tablo-tara.mjs <tablo.json> --olgu <dosya> [<dosya>…] --sozluk <tr.json> <en.json> [--kayit <marka-olgu-kaydi.json>]
 *   tablo.json: { satirlar: [{ anahtar, eski_tr, eski_en, yeni_tr, yeni_en, dayanak: [], kod_notu, kusur: [] }] }
 * Çıkış: bulgu (UYARI hariç) varsa 1, yoksa 0. Ağsızdır.
 */
import { readFileSync, existsSync } from 'node:fs'

import { izinliSayilar, metindekiSayilar } from './marka-olgu-dogrula.mjs'

// ─── INV-EN-ALT-KATEGORI-TERIM-1 desenleri (src/__tests__/conformance/en-alt-kategori-terim.test.ts ile aynı altı yazım) ───
const AY = '[\\s\\u00a0\\u2010-\\u2015\\u2212-]+'
export const EN_TERIM_KALIPLARI = [
  ['Sub Product Groups', `sub${AY}product${AY}groups?`],
  ['Sub categories', `sub${AY}categor(?:y|ies)`],
  ['Sub Families', `sub${AY}families`],
  ['Sub Groups', `sub${AY}groups`],
  ['Technical Product Family', `technical${AY}product${AY}family\\b`],
  ['Series Detail', `series${AY}detail`],
].map(([ad, desen]) => [ad, new RegExp(desen, 'i')])

export const YASAK_TR = /premium|lider|devi\b|dünya|en iyi|(?<![A-Za-zÇĞİÖŞÜçğıöşü])en (yüksek|verimli|geniş|güvenilir|kaliteli|prestijli|köklü|büyük|küçük)|kusursuz|mükemmel|maksimum|minimum|ultra|kesintisiz|her an\b|ömrü boyunca|yıl(lık)? (deneyim|tecrübe)|\d\+|\b81\b|7\/24|dakika|zamanında|stok|sertifika|yetkili|onaylı|garanti|güvence|uzman|ekib|kadro|çözüm ortağ|katman|kürasyon|deterministik|estetik|geleceği|fütüristik|sanat|mimari|laminer|dijital standart|hassasiyet|prestij|önde gelen|tercih edilen|köklü/i
// son iki: Bilgi Merkezi yalnız TR yayımlanır (EN adresleri 404)
export const YASAK_EN = /premium|world[- ](class|leader|renowned)|leading|\bbest\b|\bmost\b|ultra|maximum|minimum|seamless|24\/7|around the clock|expert|certified|authori[sz]ed|guarantee|warranty|trusted|verified|\blayer\b|curated|aesthetic|future|cutting[- ]edge|state[- ]of[- ]the[- ]art|\d\+|\byears?\b|nationwide|\b81\b|same[- ]day|precision|renowned|prestig|knowledge[- ]hub|knowledge[- ]cent(er|re)/i

const ULKE_ESLEME = { italy: 'italya', italian: 'italyan', germany: 'almanya', german: 'alman', france: 'fransa', french: 'fransa', spain: 'ispanya', spanish: 'ispanya', denmark: 'danimarka', danish: 'danimarka', turkey: 'türkiye', turkish: 'türk', czech: 'çek' }
const TR_HARF = /[çğıİöşüÇĞÖŞÜ]/
const lc = (s) => s.toLocaleLowerCase('tr-TR')
const sozcuk = (t) => t.trim().split(/\s+/).filter(Boolean).length
const yerTutucuSiz = (t) => t.replace(/\{\{[^}]+\}\}|\{[a-zA-Zğüşıöç_]+\}/g, ' ')
const yerTutucular = (t) => (t.match(/\{[a-zA-Zğüşıöç_]+\}|\{\{[^}]+\}\}/g) || []).sort().join(',')

/**
 * Tek satırı tara. ctx: { olguMetni, sozlukMetni, olguNolari:Set, kayit?, garantiOlgusu? } — `olguMetni` ve
 * `sozlukMetni` ham metindir (küçük harfe çevirmeyi işlev yapar).
 */
export function satirTara(s, ctx) {
  const bulgu = []
  const k = s.anahtar
  const ekle = (tip, ayrinti) => bulgu.push({ anahtar: k, tip, ayrinti })
  const yeniTr = s.yeni_tr ?? ''
  const yeniEn = s.yeni_en ?? ''
  const eskiTr = String(s.eski_tr ?? '')
  const eskiEn = String(s.eski_en ?? '')
  const dayanak = s.dayanak ?? []
  const kodNotu = s.kod_notu ?? ''
  const olguKucuk = ctx.olguKucuk ?? lc(ctx.olguMetni)
  const sozlukKucuk = ctx.sozlukKucuk ?? lc(ctx.sozlukMetni)

  for (const [ad, re] of EN_TERIM_KALIPLARI) if (re.test(yeniEn)) ekle('EN-TERIM', `"${ad}" yasak yazım (karar 236/238) → ${yeniEn.slice(0, 80)}`)

  const kaldirma = !yeniTr && !yeniEn && /kald[ıi]r|kalk(ar|ır)|gizle|sil(in|ir)|alan[ıi] (kald|sil)/i.test(kodNotu)
  const enYok = !!yeniTr && !yeniEn && /EN karşılığı kald[ıi]r[ıi]l[ıi]r|EN (kart|blok|sayfa|menü)[^.]{0,40}g[ıi]zlenir/i.test(kodNotu)
  if (!enYok && !kaldirma && (!yeniTr || !yeniEn)) ekle('BOS-YENI', 'yeni_tr ya da yeni_en boş (kaldırma ise kod_notu "kaldırılır" demeli)')

  const stilSatiri = (s.kusur ?? []).length > 0 && (s.kusur ?? []).every((x) => ['C', 'E', 'G'].includes(x))
  const etiketSatiri = !/\d/.test(yeniTr + yeniEn) && sozcuk(yeniTr) <= 4 && sozcuk(yeniEn) <= 4
  const kisaCumle = !/\d/.test(yeniTr + yeniEn) && sozcuk(yeniTr) <= 8 && sozcuk(yeniEn) <= 8
  const iddiasizBeyan = /olgu iddias[ıi] yok|dayanak gerektirmeyen|olgu numaras[ıi] gerektirmez|nötr (etiket|ifade|metin)|yeni metin[^.]{0,30}iddia[^.]{0,20}yok/i.test(kodNotu)
  const iddiasiz = (etiketSatiri || stilSatiri || kisaCumle) && iddiasizBeyan
  if (!dayanak.length && !kaldirma && !iddiasiz) ekle('DAYANAK-YOK', 'dayanak (O-numarası) yok')
  for (const o of kaldirma ? [] : dayanak) {
    const gorselAlt = o === 'GORSEL' && (/alt$/i.test(k) || /alt metni/i.test(kodNotu)) && /görsel/i.test(kodNotu)
    const gecerli = ctx.olguNolari.has(o) || o === 'aileler.md' || gorselAlt || (/^[MK]\d{1,2}$/.test(o) && (stilSatiri || etiketSatiri))
    if (!gecerli) ekle('DAYANAK-GECERSIZ', `${o} olgu listesinde yok`)
  }

  const garanti = ctx.garantiOlgusu && dayanak.includes(ctx.garantiOlgusu)
  const yasakTr = garanti ? new RegExp(YASAK_TR.source.replace('|garanti', ''), 'i') : YASAK_TR
  const yasakEn = garanti ? new RegExp(YASAK_EN.source.replace('|guarantee|warranty', ''), 'i') : YASAK_EN
  const mt = yerTutucuSiz(yeniTr).match(yasakTr)
  if (mt) ekle('YASAK-TR', `"${mt[0]}" → ${yeniTr.slice(0, 80)}`)
  const me = yerTutucuSiz(yeniEn).match(yasakEn)
  if (me) ekle('YASAK-EN', `"${me[0]}" → ${yeniEn.slice(0, 80)}`)

  // UYDURMA KAPISI: her sayı olgu kaynaklarında ya da eski metinde; her özel ad olgu kaynaklarında, eski metinde ya da sözlükte.
  const eskiBirlesik = `${eskiTr} ${eskiEn}`
  const sayilar = (yerTutucuSiz(`${yeniTr} ${yeniEn}`).match(/\d+(?:[.,]\d+)?/g) || []).filter((x) => !eskiBirlesik.includes(x))
  // Sayı olgu metninde AYRI bir sayı olarak geçmeli: "O12" içindeki 12 ya da "1215" içindeki 12 dayanak sayılmaz (alt dize eşleşmesi sayıyı yanlış aklardı).
  const sayiVarMi = (metin, x) => new RegExp(`(?<![\\p{L}\\d.,])${x.replace(/[.,]/g, '[.,]')}(?![\\d])`, 'u').test(metin)
  for (const x of new Set(sayilar)) if (!sayiVarMi(ctx.olguMetni, x)) ekle('DAYANAKSIZ-SAYI', `"${x}" olgu kaynaklarında ve eski metinde yok → ${yeniTr.slice(0, 70)}`)
  for (const t of [yeniTr, yeniEn]) {
    const govde = yerTutucuSiz(t)
    if (govde === govde.toLocaleUpperCase('tr-TR') && /[A-Za-zÇĞİÖŞÜçğıöşü]{3}/.test(govde)) continue
    const kelimeler = govde.split(/(?<=[.!?:;—–])\s+|\s+/).filter(Boolean)
    const baslik = kelimeler.length >= 2 && kelimeler.filter((x) => /^[("'’“”]*[A-ZÇĞİÖŞÜ]/.test(x)).length / kelimeler.length >= 0.6
    for (let i = 0; i < kelimeler.length; i++) {
      for (const w of kelimeler[i].replace(/^[("'’“”]+|[)"'’“”.,;:!?]+$/g, '').split('-')) {
        if (!/^[A-ZÇĞİÖŞÜ][A-Za-zÇĞİÖŞÜçğıöşü0-9]+$/.test(w)) continue
        if (baslik && !/^[A-ZÇĞİÖŞÜ0-9]{2,}$/.test(w) && !/\d/.test(w)) continue
        if (!baslik && (i === 0 || /[.!?:—–]$/.test(kelimeler[i - 1]))) continue
        const kucuk = lc(w)
        const tekil = kucuk.length >= 5 ? kucuk.replace(/s$/, '') : kucuk
        if (tekil !== kucuk && (olguKucuk.includes(tekil) || sozlukKucuk.includes(tekil))) continue
        const eslenik = ULKE_ESLEME[kucuk]
        const eski = lc(eskiBirlesik)
        if (olguKucuk.includes(kucuk) || sozlukKucuk.includes(kucuk) || eski.includes(kucuk) || (eslenik && (olguKucuk.includes(eslenik) || eski.includes(eslenik)))) continue
        ekle('DAYANAKSIZ-AD', `"${w}" olgu kaynaklarında, eski metinde ve sözlükte yok → ${t.slice(0, 70)}`)
      }
    }
  }

  // M8: marka adı geçen satırda yıl/yüzde, o markanın kayıttaki yazılabilir olgularında olmalı.
  if (ctx.kayit) {
    for (const [slug, m] of Object.entries(ctx.kayit.markalar)) {
      const adRe = new RegExp(`(^|[^A-Za-zÇĞİÖŞÜçğıöşü])${m.ad.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-zÇĞİÖŞÜçğıöşü]|$)`, 'i')
      for (const [dil, t] of [['TR', yeniTr], ['EN', yeniEn]]) {
        if (!adRe.test(t)) continue
        const izinli = izinliSayilar(ctx.kayit, slug)
        for (const sayi of metindekiSayilar(t)) if (!izinli.has(sayi)) ekle('MARKA-OLGU', `${m.ad} (${dil}): "${sayi}" marka kaydında yazılabilir bir olgu değil → ${t.slice(0, 70)}`)
      }
    }
  }

  if (TR_HARF.test(yeniEn.replace(/İ?[Üü]rün Seçici/g, ''))) ekle('K10-EN-TR-HARF', yeniEn.slice(0, 80))
  if (yerTutucular(yeniTr) !== yerTutucular(yeniEn)) ekle('YER-TUTUCU-FARKLI', `TR[${yerTutucular(yeniTr)}] EN[${yerTutucular(yeniEn)}]`)

  const eskiMax = Math.max(eskiTr.length, eskiEn.length)
  for (const [dil, t] of [['TR', yeniTr], ['EN', yeniEn]]) {
    if (k === 'meta.siteTitle') { if (t.length > 60) ekle(`META-BASLIK-UZUN-${dil}`, `${t.length} > 60`); continue }
    if (eskiMax >= 20 && t.length > eskiMax * 1.3) ekle(`UYARI-UZUN-${dil}`, `${t.length} > ${Math.round(eskiMax * 1.3)} (eskinin en uzunu ${eskiMax})`)
  }
  return bulgu
}

/** Tüm tabloyu tara; yinelenen anahtar da bulgudur. */
export function tabloTara(satirlar, ctx) {
  const tam = { ...ctx, olguKucuk: lc(ctx.olguMetni), sozlukKucuk: lc(ctx.sozlukMetni) }
  const bulgu = []
  const gorulen = new Set()
  for (const s of satirlar) {
    if (gorulen.has(s.anahtar)) bulgu.push({ anahtar: s.anahtar, tip: 'CIFT-ANAHTAR', ayrinti: 'aynı anahtar tabloda iki kez' })
    gorulen.add(s.anahtar)
    bulgu.push(...satirTara(s, tam))
  }
  return bulgu
}

export const uyariMi = (b) => b.tip.startsWith('UYARI-')

function main(argv) {
  const tablo = argv.find((a) => !a.startsWith('--'))
  if (!tablo) { console.error('kullanım: vitrin-tablo-tara.mjs <tablo.json> --olgu <dosya…> --sozluk <tr.json> <en.json> [--kayit <json>]'); process.exitCode = 1; return }
  const degerler = (bayrak) => {
    const i = argv.indexOf(bayrak)
    if (i === -1) return []
    const sonuc = []
    for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) sonuc.push(argv[j])
    return sonuc
  }
  const olguDosyalari = degerler('--olgu')
  const [trYol, enYol] = degerler('--sozluk')
  const kayitYol = degerler('--kayit')[0] ?? 'docs/standards/marka-olgu-kaydi.json'
  const okuMetin = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
  const olguMetni = olguDosyalari.map(okuMetin).join('\n')
  const sozluk = [trYol, enYol].filter(Boolean).map((p) => JSON.parse(readFileSync(p, 'utf8')))
  const sozlukMetni = sozluk.flatMap((s) => Object.values(s)).filter((v) => typeof v === 'string').join(' \n ')
  const olguNolari = new Set([...olguMetni.matchAll(/\bO\d{2}(?:-EK)?\b/g)].map((m) => m[0]))
  const kayit = existsSync(kayitYol) ? JSON.parse(readFileSync(kayitYol, 'utf8')) : null
  const j = JSON.parse(readFileSync(tablo, 'utf8'))
  const bulgu = tabloTara(j.satirlar, { olguMetni, sozlukMetni, olguNolari, kayit, garantiOlgusu: 'O16' })
  for (const b of bulgu) console.log(`${uyariMi(b) ? 'UYARI' : 'BULGU'} [${b.tip}] ${b.anahtar} — ${b.ayrinti}`)
  const gercek = bulgu.filter((b) => !uyariMi(b)).length
  console.log(`satır ${j.satirlar.length} · bulgu ${gercek} · uyarı ${bulgu.length - gercek}`)
  process.exitCode = gercek ? 1 : 0
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/rehber/vitrin-tablo-tara.mjs')) main(process.argv.slice(2))
