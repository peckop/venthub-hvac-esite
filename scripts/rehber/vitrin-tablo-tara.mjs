/**
 * VİTRİN METİN TABLOSU TARAYICI — taslak tablo (anahtar | eski | yeni, TR/EN) Ürün'e verilmeden ÖNCE koşan
 * otomatik kapı (BLG-7; vitrin-genel-metin-standard.md M1–M8). BLG-6'da (684 satır) elle birleştirici içinde
 * yaşayan kapı burada ortak betik olur; aynı kapı bir sonraki tabloda da koşar.
 *
 * ⚠ONARIM (10-09 bağımsız çürütme: 46 sabotaj girişiminden 40'ı kapıdan geçti): metin kalıplardan ÖNCE tek
 * biçime indirilir (`katla`: NFC, tüm boşluklar, NFD işaretleri, İ/I/ı, ASCII Türkçe). Özel ad denetimi
 * alt dize değil BELİRTEÇ eşleşmesidir; büyük harfli satır ve başlık biçimi artık atlanmaz.
 *
 * Kurallar (her bulgu {anahtar, tip, ayrinti}):
 *  EN-TERIM         yeni_en, INV-EN-ALT-KATEGORI-TERIM-1'in 6 yasak yazımını taşımaz (testin desenleri birebir)
 *  YASAK-TR / -EN   üstünlük, vaat, süslü soyut ifade, kaynaksız işletme beyanı kalıpları (M3, M5, M6, M7);
 *                   "garanti" yalnız garanti olgusuna (ctx.garantiOlgusu) dayanan satırda serbest
 *  DAYANAKSIZ-SAYI  yeni metindeki her sayı olgu kaynaklarında ya da satırın eski metninde bulunmalı (uydurma kapısı)
 *  DAYANAKSIZ-AD    yeni metindeki her özel ad olgu kaynaklarında, eski metinde ya da sitenin sözlüğünde bulunmalı
 *  MARKA-OLGU       bir marka adı (ya da takma adı) geçen satırda yıl/yüzde, o markanın kayıttaki YAZILABİLİR
 *                   olgusunda ve yanındaki anahtar sözcüğün (kuruldu / ...'den beri / üretim) alanında olmalı (M8)
 *  K10-EN-TR-HARF   yeni_en Türkçe harf (ya da ASCII yazılmış Türkçe sözcük) taşımaz (dil düşüşü)
 *  YER-TUTUCU-FARKLI TR ve EN aynı yer tutucuları taşır
 *  BOS-YENI         yeni_tr/yeni_en boş değil (kaldırma satırı kod_notunda "kaldırılır" der; EN karşılığı yoksa "EN karşılığı kaldırılır")
 *  DAYANAK-YOK / DAYANAK-GECERSIZ  dayanak olgu numarası olmalı; iddiasız satır YALNIZ etiket/stil/kısa cümle VE kod_notunda
 *                   açık "olgu iddiası yok" beyanı varsa dayanaksız geçer (bu satırlarda diğer kapılar YİNE koşar)
 * Uzunluk taşması bulgu değil UYARI üretir (`UYARI-UZUN-*`), meta.siteTitle > 60 karakter bulgudur.
 *
 * ⛔KAPSAM DIŞI, ADIYLA (bu kapı ölçmez; M8 ayrıntı bölümünde de yazılı): yazıyla yazılmış sayı ("Altmış"), marka
 * açıklamasındaki ülke/şehir adı ve specialty alanı, olgu dayanağı olarak yazılan kural numarasının (M1…K10) gerçek
 * bir olguya karşılık gelip gelmediği, ASCII yazılmış Türkçenin tam kapsamı (yalnız kısa bir sözcük listesi).
 *
 * Kullanım:
 *   node scripts/rehber/vitrin-tablo-tara.mjs <tablo.json> --olgu <dosya> [<dosya>…] --sozluk <tr.json> <en.json> [--kayit <marka-olgu-kaydi.json> | --kayitsiz]
 *   tablo.json: { satirlar: [{ anahtar, eski_tr, eski_en, yeni_tr, yeni_en, dayanak: [], kod_notu, kusur: [] }] }
 * Çıkış: bulgu (UYARI hariç) varsa 1, girdi eksik/okunamıyorsa 2 (sessiz kapanma YOK), yoksa 0. Ağsızdır.
 */
import { readFileSync, existsSync } from 'node:fs'

import { belirtecler, katla, katlaDesen, markaGeciyorMu, markaSayiDenetle, normalize } from './marka-olgu-dogrula.mjs'

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

// Kalıplar OKUNUR Türkçe yazılır; denetimde `katlaDesen` ile katlanmış metne uygulanır (EN İYİ, ONAYLI, NBSP, NFD, ASCII).
export const YASAK_TR = /premium|lider|devi\b|dünya|en iyi|(?<![A-Za-zÇĞİÖŞÜçğıöşü])en (yüksek|verimli|geniş|güvenilir|kaliteli|prestijli|köklü|büyük|küçük)|kusursuz|mükemmel|maksimum|minimum|ultra|kesintisiz|her an\b|ömrü boyunca|ömür boyu|yıl(lık|ın)? (deneyim|tecrübe)|\d\+|\b81\b|7\/24|dakika|zamanında|stok|sertifika|yetkili|onaylı|garanti|güvence|uzman|ekib|ekip|kadro|çözüm ortağ|katman|kürasyon|deterministik|estetik|geleceği|fütüristik|sanat|mimari|laminer|dijital standart|hassasiyet|prestij|önde gelen|tercih edilen|köklü|no\.? ?1\b|numara bir/i
// son iki: Bilgi Merkezi yalnız TR yayımlanır (EN adresleri 404)
export const YASAK_EN = /premium|world[- ](class|leader|renowned)|leading|\bbest\b|\bmost\b|ultra|maximum|minimum|seamless|24\/7|around the clock|expert|certified|authori[sz]ed|guarantee|warranty|trusted|verified|\blayers?\b|curated|aesthetic|future|cutting[- ]edge|state[- ]of[- ]the[- ]art|\d\+|\byears?\b|nationwide|\b81\b|same[- ]day|precision|renowned|prestig|knowledge[- ]hub|knowledge[- ]cent(er|re)|\bstock\b|within (?:\d+ )?(?:minutes?|hours?|days?)|\bour (?:team|experts?|engineers?|specialists?)\b|\bteam\b|\bexperience\b|\bdecades?\b|\blifetime\b|\bno\.? ?1\b|number one/i

const TR_NORMAL = katlaDesen(YASAK_TR)
const TR_GARANTI = katlaDesen(new RegExp(YASAK_TR.source.replace('|garanti', ''), 'i'))
const EN_NORMAL = katlaDesen(YASAK_EN)
const EN_GARANTI = katlaDesen(new RegExp(YASAK_EN.source.replace('|guarantee|warranty', ''), 'i'))
/** "Ömür boyu / lifetime" vaadi garanti olgusu (O16) olsa da yazılamaz: O16 garanti SÜRESİNİ söyler, ömür boyu demez. */
const OMUR_BOYU = /omur boyu|omru boyunca|lifetime/

const ULKE_ESLEME = { italy: 'italya', italian: 'italyan', germany: 'almanya', german: 'alman', france: 'fransa', french: 'fransa', spain: 'ispanya', spanish: 'ispanya', denmark: 'danimarka', danish: 'danimarka', turkey: 'turkiye', turkish: 'turk', czech: 'cek' }
const TR_HARF = /[çğıİöşüÇĞÖŞÜ]/
/** ASCII yazılmış Türkçenin yaygın sözcükleri (yeni_en'de olmamalı). Kısa liste; tam kapsam iddia edilmez. */
const TR_ASCII_SOZCUK = /\b(icin|hakkinda|nasil|degil|urun|urunler|urunleri|cozum|cozumler|cozumleri|sistemleri|kullanim|uretim|havalandirma|isitma|sogutma|musteri|teklif|hesaplama|secici|secim)\b/
const sozcuk = (t) => t.trim().split(/\s+/).filter(Boolean).length

// Yer tutucu: yalnız TANIMLAYICI içerikli ({ad} ya da {{ ad }}); {{en iyi}} gibi serbest metin tarama dışı KALMAZ (çürütme I).
const YER_TUTUCU = /\{\{\s*[\p{L}\p{N}_.-]+\s*\}\}|\{[\p{L}\p{N}_-]+\}/gu
const yerTutucuSiz = (t) => t.replace(YER_TUTUCU, ' ')
const yerTutucular = (t) => (t.match(YER_TUTUCU) || []).map((x) => x.replace(/\s+/g, '')).sort().join(',')

const KALDIRMA = /kald[ıi]r|kalk(ar|ır)|gizle|sil(in|ir)|alan[ıi] (kald|sil)/i
/**
 * "kaldırılmayacak", "silinmez", "gizlenmeyecek" kaldırma beyanı DEĞİLDİR (çürütme J). ⚠"kaldırılmalı" olumsuz DEĞİLDİR:
 * olumsuzluk eki (-ma/-me + yacak/z/dı/yan) açıkça aranır, "kaldırılma" öneki yetmez (ilk deneme "kaldırılmalı"yı olumsuz sandı).
 */
const KALDIRMA_OLUMSUZ = /kald[ıi]r(?:ma|[ıi]lma)(?:yacak|z|d[ıi]|yan|y[ıi]n)|g[ıi]zle(?:me|nme)(?:yecek|z|di|yen)|sil(?:me|inme)(?:yecek|z|di|yen)|kalk(?:mayacak|maz)/i

/**
 * İNCELENMİŞ GENEL SÖZCÜKLER (BLOG, 2026-10-13, BLG-7 gerçek 684 satırlık tabloda yanlış pozitif ölçümü):
 * sözlükte/olguda/eski metinde yer almayan ama sıradan İngilizce ya da Türkçe sözcük olan, başlık ve cümle başında
 * büyük harfle yazılan kelimeler. Özel ad denetimi artık cümle başı/başlık/tümü büyük satırı ATLAMADIĞI için
 * ("Atlantis ürünleri" geçmesin), bu sözcüklerin bir kez insan gözüyle sıradan olduğu görülüp buraya yazılır.
 * ⛔Marka, ürün, firma adı BURAYA KONMAZ; yeni sözcük eklemek bir insan kararıdır ve PR'da görünür.
 */
export const GENEL_SOZCUK_INCELENDI = new Set(
  ['Lining', 'Horizontal', 'Vertical', 'Induction', 'Enquiry', 'Construction', 'Seçenekleri', 'Choosing', 'Whether', 'Downward',
    'Separation', 'Analysing', 'Clarified', 'Isıtılacak', 'Isıtılmayacak', 'Föyler', 'Uses', 'Further', 'Sanitation', 'Sample',
    'Expecting', 'Decide', 'YÖRÜNGE', 'Ranked', 'Infrequent', 'Illustration'].map((x) => katla(x)),
)

const SIMGE_BASI = /^[("'‘’“”«»\[]+/
const SIMGE_SONU = /[)"'‘’“”«».,;:!?\]]+$/

/**
 * Özel ad adayları: büyük harfle başlayan her sözcük parçası (apostrof, tire ve eğik çizgi ayırır;
 * "Vortice'nin" → Vortice; tümü büyük harfli sözcükler de aday). Cümle başı ya da başlık biçimi ATLANMAZ:
 * cümle başında yazılmış yabancı marka da aynı sözlük sınavından geçer.
 */
export function ozelAdAdaylari(t) {
  const adaylar = []
  for (const kelime of yerTutucuSiz(t).split(/\s+/).filter(Boolean)) {
    const temiz = kelime.replace(SIMGE_BASI, '').replace(SIMGE_SONU, '')
    for (const parca of temiz.split(/['‘’\-–—/]/)) if (/^\p{Lu}[\p{L}\p{N}]+$/u.test(parca)) adaylar.push(parca)
  }
  return adaylar
}

/**
 * Bilinen belirteç mi: tam eşleşme ya da Türkçe/İngilizce çekim eki (en az 4 harflik ortak gövde, ek ya da
 * gövde tarafından): "Teklifle" ↔ "teklif", "Katalog" ↔ "katalogu". ⚠Alt dize DEĞİL, ÖNEKtir: "kat" "katalog"un
 * içinde diye bilinmiş sayılmaz (çürütme F: includes alt dizesi sahte ad geçiriyordu).
 */
const MIN_GOVDE = 4
export function onekIndeksi(...kumeler) {
  const idx = new Set()
  for (const kume of kumeler) for (const t of kume) for (let n = MIN_GOVDE; n < t.length; n++) idx.add(t.slice(0, n))
  return idx
}
function bilinenMi(b, kumeler, onekler) {
  if (kumeler.some((k) => k.has(b))) return true
  if (b.length < MIN_GOVDE) return false
  for (let n = MIN_GOVDE; n < b.length; n++) if (kumeler.some((k) => k.has(b.slice(0, n)))) return true // b = gövde + ek
  return onekler.has(b) // bilinen belirteç = b + ek
}

/** Sayı metinde AYRI bir sayı olarak geçmeli: "O12" içindeki 12 ya da "1215" içindeki 12 dayanak sayılmaz. */
const sayiVarMi = (metin, x) => new RegExp(`(?<![\\p{L}\\d.,])${x.replace(/[.,]/g, '[.,]')}(?![\\d])`, 'u').test(metin)

/**
 * Tek satırı tara. ctx: { olguMetni, sozlukMetni, olguNolari:Set, kayit?, garantiOlgusu? } — `olguMetni` ve
 * `sozlukMetni` ham metindir (katlama işlevin işi). Önceden hesaplanmış `olguSeti`/`sozlukSeti` verilirse kullanılır.
 */
export function satirTara(s, ctx) {
  const bulgu = []
  const k = s.anahtar
  const ekle = (tip, ayrinti) => bulgu.push({ anahtar: k, tip, ayrinti })
  const yeniTr = normalize(s.yeni_tr)
  const yeniEn = normalize(s.yeni_en)
  const eskiTr = normalize(s.eski_tr)
  const eskiEn = normalize(s.eski_en)
  const dayanak = s.dayanak ?? []
  const kodNotu = normalize(s.kod_notu)
  const olguSeti = ctx.olguSeti ?? new Set(belirtecler(ctx.olguMetni))
  const sozlukSeti = ctx.sozlukSeti ?? new Set(belirtecler(ctx.sozlukMetni))

  const yeniEnKatli = katla(yeniEn)
  for (const [ad, re] of EN_TERIM_KALIPLARI) if (re.test(yeniEnKatli)) ekle('EN-TERIM', `"${ad}" yasak yazım (karar 236/238) → ${yeniEn.slice(0, 80)}`)

  const kaldirma = !yeniTr && !yeniEn && KALDIRMA.test(kodNotu) && !KALDIRMA_OLUMSUZ.test(kodNotu)
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
  const trKatli = katla(yerTutucuSiz(yeniTr))
  const enKatli = katla(yerTutucuSiz(yeniEn))
  const mt = trKatli.match(garanti ? TR_GARANTI : TR_NORMAL) ?? (garanti ? trKatli.match(OMUR_BOYU) : null)
  if (mt) ekle('YASAK-TR', `"${mt[0]}" → ${yeniTr.slice(0, 80)}`)
  const me = enKatli.match(garanti ? EN_GARANTI : EN_NORMAL) ?? (garanti ? enKatli.match(OMUR_BOYU) : null)
  if (me) ekle('YASAK-EN', `"${me[0]}" → ${yeniEn.slice(0, 80)}`)

  // UYDURMA KAPISI: her sayı olgu kaynaklarında ya da eski metinde; her özel ad olgu kaynaklarında, eski metinde ya da sözlükte.
  const eskiBirlesik = `${eskiTr} ${eskiEn}`
  const sayilar = (yerTutucuSiz(`${yeniTr} ${yeniEn}`).match(/\d+(?:[.,]\d+)?/g) || []).filter((x) => !sayiVarMi(eskiBirlesik, x))
  for (const x of new Set(sayilar)) if (!sayiVarMi(ctx.olguMetni, x)) ekle('DAYANAKSIZ-SAYI', `"${x}" olgu kaynaklarında ve eski metinde yok → ${yeniTr.slice(0, 70)}`)
  const eskiSeti = new Set(belirtecler(eskiBirlesik))
  const kumeler = [olguSeti, sozlukSeti, eskiSeti]
  const onekler = ctx.onekler ?? onekIndeksi(olguSeti, sozlukSeti)
  const eskiOnekler = onekIndeksi(eskiSeti)
  const bilinen = (b) => bilinenMi(b, kumeler, onekler) || eskiOnekler.has(b) || GENEL_SOZCUK_INCELENDI.has(b)
  for (const t of [yeniTr, yeniEn]) {
    for (const w of ozelAdAdaylari(t)) {
      const b = katla(w)
      if (bilinen(b)) continue
      const tekil = b.length >= 5 ? b.replace(/s$/, '') : b
      if (tekil !== b && bilinen(tekil)) continue
      const eslenik = ULKE_ESLEME[b]
      if (eslenik && (olguSeti.has(eslenik) || eskiSeti.has(eslenik))) continue
      ekle('DAYANAKSIZ-AD', `"${w}" olgu kaynaklarında, eski metinde ve sözlükte yok → ${t.slice(0, 70)}`)
    }
  }

  // M8: marka adı (ya da takma adı) geçen satırda yıl/yüzde, o markanın kayıttaki yazılabilir olgularında ve yanındaki alanda olmalı.
  if (ctx.kayit) {
    for (const [slug, m] of Object.entries(ctx.kayit.markalar)) {
      for (const [dil, t] of [['TR', yeniTr], ['EN', yeniEn]]) {
        if (!markaGeciyorMu(m, t)) continue
        for (const x of markaSayiDenetle(ctx.kayit, slug, t)) ekle('MARKA-OLGU', `${m.ad} (${dil}): "${x.sayi}" ${x.sebep} → ${t.slice(0, 70)}`)
      }
    }
  }

  if (TR_HARF.test(yeniEn.replace(/İ?[Üü]rün Seçici/g, ''))) ekle('K10-EN-TR-HARF', yeniEn.slice(0, 80))
  else {
    // "Ürün Seçici" site araç adıdır (EN metinde de aynen geçer); ASCII sözcük sınavından muaf tutulur.
    const ascii = katla(yeniEn.replace(/İ?[Üü]rün Seçici/g, ' ')).match(TR_ASCII_SOZCUK)
    if (ascii) ekle('K10-EN-TR-HARF', `ASCII yazılmış Türkçe sözcük "${ascii[0]}" → ${yeniEn.slice(0, 70)}`)
  }
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
  const olguSeti = new Set(belirtecler(ctx.olguMetni))
  const sozlukSeti = new Set(belirtecler(ctx.sozlukMetni))
  const tam = { ...ctx, olguSeti, sozlukSeti, onekler: onekIndeksi(olguSeti, sozlukSeti) }
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
  const hata = (m) => { console.error(`HATA: ${m}`); process.exitCode = 2 }
  if (!tablo) { console.error('kullanım: vitrin-tablo-tara.mjs <tablo.json> --olgu <dosya…> --sozluk <tr.json> <en.json> [--kayit <json> | --kayitsiz]'); process.exitCode = 2; return }
  const degerler = (bayrak) => {
    const i = argv.indexOf(bayrak)
    if (i === -1) return []
    const sonuc = []
    for (let j = i + 1; j < argv.length && !argv[j].startsWith('--'); j++) sonuc.push(argv[j])
    return sonuc
  }
  const olguDosyalari = degerler('--olgu')
  const sozlukDosyalari = degerler('--sozluk')
  const kayitsiz = argv.includes('--kayitsiz')
  const kayitYol = degerler('--kayit')[0] ?? 'docs/standards/marka-olgu-kaydi.json'

  // SESSİZ KAPANMA YOK (çürütme L): eksik girdi "bulgu 0" gibi okunur. Olgu dosyası, sözlük ve kayıt yoksa HATA (çıkış 2).
  if (!existsSync(tablo)) { hata(`tablo bulunamadı: ${tablo}`); return }
  if (!olguDosyalari.length) { hata('--olgu verilmedi (DAYANAKSIZ-SAYI/-AD kapısı olgu kaynaksız anlamsız)'); return }
  const eksik = [...olguDosyalari, ...sozlukDosyalari].filter((p) => !existsSync(p))
  if (eksik.length) { hata(`girdi dosyası yok: ${eksik.join(', ')}`); return }
  if (sozlukDosyalari.length < 2) { hata('--sozluk için TR ve EN iki dosya gerekir'); return }
  if (!kayitsiz && !existsSync(kayitYol)) { hata(`marka olgu kaydı bulunamadı (${kayitYol}); M8 çalıştırılamaz. Bilerek atlamak için --kayitsiz verin`); return }
  if (kayitsiz) console.log('UYARI [M8-ATLANDI] --kayitsiz verildi: marka olgu kaydı denetimi YAPILMADI')

  const olguMetni = olguDosyalari.map((p) => readFileSync(p, 'utf8')).join('\n')
  const sozluk = sozlukDosyalari.map((p) => JSON.parse(readFileSync(p, 'utf8')))
  const sozlukMetni = sozluk.flatMap((s) => Object.values(s)).filter((v) => typeof v === 'string').join(' \n ')
  const olguNolari = new Set([...olguMetni.matchAll(/\bO\d{2}(?:-EK)?\b/g)].map((m) => m[0]))
  const kayit = kayitsiz ? null : JSON.parse(readFileSync(kayitYol, 'utf8'))
  const j = JSON.parse(readFileSync(tablo, 'utf8'))
  if (!Array.isArray(j.satirlar) || !j.satirlar.length) { hata('tabloda satirlar yok ya da boş'); return }
  const bulgu = tabloTara(j.satirlar, { olguMetni, sozlukMetni, olguNolari, kayit, garantiOlgusu: 'O16' })
  for (const b of bulgu) console.log(`${uyariMi(b) ? 'UYARI' : 'BULGU'} [${b.tip}] ${b.anahtar} — ${b.ayrinti}`)
  const gercek = bulgu.filter((b) => !uyariMi(b)).length
  console.log(`satır ${j.satirlar.length} · bulgu ${gercek} · uyarı ${bulgu.length - gercek}`)
  process.exitCode = gercek ? 1 : 0
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/rehber/vitrin-tablo-tara.mjs')) main(process.argv.slice(2))
