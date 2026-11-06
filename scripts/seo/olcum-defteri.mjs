#!/usr/bin/env node
/**
 * Ölçüm defteri: "bu sorgu daha önce ölçüldü mü?" sorusunun tek adresi (SEO-87, cetvel: dizin-sistemleri-standard.md D8).
 *
 * NİÇİN: 6 Kasım 2026'da daha önce yapılmış bir kıyasın üzerine yeni plan yazıldı, çünkü
 * ham ölçümler yüzlerce klasörde dağınıktı ve aratacak tek yer yoktu. Yeni SERP / Search Console / Trends ölçümünden
 * ÖNCE `--sor` koşulur; ölçüldüyse eski kayda gidilir, yeniden ölçüm yalnız eski kayıt eskiyse ya da kapsam yeniyse yapılır.
 *
 * DEFTER: depo DIŞI `olcumler.jsonl` (repo PUBLIC: arama sorgusu ve Search Console verisi depoya girmez, P6). Depo içi yol REDDEDİLİR.
 * Satır: {tarih, sorgu, motor, kart, kaynak, tur?, sira?, sayfaTipi?, adres?, not?}. `sorgu` olduğu gibi yazılır; eşleşme
 * anahtarı Türkçe harfleri sadeleştirir ve noktalamayı atar ("Örnek sorgu?" = "ornek sorgu").
 *
 * Kullanım:
 *   node scripts/seo/olcum-defteri.mjs --sor "ornek sorgu" [--motor google] [--gun 30] [--defter <olcumler.jsonl>]
 *   node scripts/seo/olcum-defteri.mjs --kaydet --sorgu "..." --motor google --kart SEO-86 --kaynak seo86/ [--tur serp|gsc|trends] [--sira 4] [--sayfa-tipi bilgi|kategori|karma] [--adres <https>] [--tarih ISO] [--not "..."]
 *   node scripts/seo/olcum-defteri.mjs --toplu <satirlar.json>   (içe aktarım: dizi; aynı tarih+sorgu+motor+kart çiftlenmez)
 * Çıkış: 0 tamam; 2 geçersiz girdi ya da depo içi yol.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { depoIcindeMi } from './bing-webmaster-oku.mjs'

export const VARSAYILAN_DEFTER = join(homedir(), 'VentHub-Olcum-Arsiv', 'geo-seo', 'olcumler.jsonl').replace(/\\/g, '/')
export const MOTORLAR = ['google', 'bing', 'yandex', 'trends', 'gsc']
export const TURLER = ['serp', 'gsc', 'trends', 'diger']
export const SAYFA_TIPLERI = ['bilgi', 'kategori', 'karma', 'diger']
/** Bu günden eski ölçüm "ESKI" sayılır (başlangıç varsayımı, ölçülmemiş: SERP bir haftada değişir, ay sonunda güvenilmez). */
export const ESKI_ESIGI_GUN = 30
const GUN = 86400000

const HARF = { ı: 'i', İ: 'i', ş: 's', Ş: 's', ğ: 'g', Ğ: 'g', ü: 'u', Ü: 'u', ö: 'o', Ö: 'o', ç: 'c', Ç: 'c' }

/** Eşleşme anahtarı: küçük harf (tr), Türkçe harf sadeleştirme, noktalama atılır, boşluk tekilleşir. */
export function sorguAnahtari(sorgu) {
  return String(sorgu ?? '')
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (h) => HARF[h])
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Tarihi epoch ms'ye çevirir; geçersizse null. Yalnız ISO benzeri metin ya da Date kabul. */
export function tarihAl(deger) {
  if (deger instanceof Date) return Number.isNaN(deger.getTime()) ? null : deger.getTime()
  if (typeof deger !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(deger)) return null
  const t = Date.parse(deger)
  return Number.isNaN(t) ? null : t
}

/** Satır geçerli mi: tarih, sorgu (anahtarı boş olmayan), motor, kart (ÖN EK-sayı), kaynak zorunlu. */
export function satirGecerliMi(s) {
  if (!s || typeof s !== 'object') return false
  if (tarihAl(s.tarih) === null) return false
  if (!sorguAnahtari(s.sorgu)) return false
  if (!MOTORLAR.includes(s.motor)) return false
  if (typeof s.kart !== 'string' || !/^[A-Z]{2,6}-\d+$/.test(s.kart)) return false
  if (typeof s.kaynak !== 'string' || !s.kaynak.trim()) return false
  if (s.tur !== undefined && !TURLER.includes(s.tur)) return false
  if (s.sayfaTipi !== undefined && !SAYFA_TIPLERI.includes(s.sayfaTipi)) return false
  if (s.sira !== undefined && !(typeof s.sira === 'number' && s.sira > 0)) return false
  return true
}

/** Defter metnini satırlara çevirir; bozuk satır atlanır ve sayılır (sessiz yutma yok: `bozuk` döner). */
export function defterAyristir(metin) {
  const satirlar = []
  let bozuk = 0
  for (const ham of String(metin ?? '').split(/\r?\n/)) {
    if (!ham.trim()) continue
    try {
      const s = JSON.parse(ham)
      if (satirGecerliMi(s)) satirlar.push(s)
      else bozuk++
    } catch { bozuk++ }
  }
  return { satirlar, bozuk }
}

/** Satırı tek satır JSON'a çevirir (alan sırası sabit, tarih ISO'ya normalleşir). */
export function satirYaz(s) {
  const t = {
    tarih: new Date(tarihAl(s.tarih)).toISOString(), sorgu: String(s.sorgu).trim(), motor: s.motor, kart: s.kart, kaynak: s.kaynak.trim(),
  }
  for (const k of ['tur', 'sira', 'sayfaTipi', 'adres', 'not']) if (s[k] !== undefined && s[k] !== '') t[k] = s[k]
  return JSON.stringify(t)
}

/**
 * Sorgu daha önce ölçüldü mü?
 * - OLCULDU: aynı anahtarlı (ve verilmişse aynı motorlu) kayıt var ve en yenisi `gun` günden yeni.
 * - ESKI: kayıt var ama en yenisi `gun` günden eski → yeniden ölçüm gerekçeli.
 * - OLCULMEDI: tam eşleşme yok. `benzer`: en az iki ortak sözcüğü olan kayıtlı sorgular; körü körüne yeniden ölçmeden önce
 *   bunlara bakılır.
 * @param {{satirlar: Array<Record<string, any>>, sorgu: string, motor?: string | null, gun?: number, simdi?: number}} p
 */
export function sorguOlculduMu({ satirlar, sorgu, motor = null, gun = ESKI_ESIGI_GUN, simdi = Date.now() }) {
  const anahtar = sorguAnahtari(sorgu)
  const sozcukler = anahtar.split(' ').filter(Boolean)
  const motorUygun = (/** @type {{motor: string}} */ s) => motor === null || s.motor === motor
  const tam = satirlar.filter((s) => sorguAnahtari(s.sorgu) === anahtar && motorUygun(s))
  tam.sort((a, b) => tarihAl(b.tarih) - tarihAl(a.tarih))
  // Benzer: en az iki ortak sözcük ve kısa sorgunun yarısından fazlası ortak ("ornek konu nelerdir" ~ "ornek konu kullanim alanlari").
  const benzerSatirlar = satirlar.filter((s) => {
    const k = sorguAnahtari(s.sorgu)
    if (k === anahtar || !motorUygun(s) || !sozcukler.length) return false
    const ks = k.split(' ')
    const ortak = sozcukler.filter((w) => ks.includes(w)).length
    return ortak >= 2 && ortak >= Math.ceil(Math.min(sozcukler.length, ks.length) / 2)
  })
  const benzer = [...new Set(benzerSatirlar.map((s) => s.sorgu))]
  if (!tam.length) return { durum: 'OLCULMEDI', anahtar, satirlar: [], benzer }
  const yas = (simdi - tarihAl(tam[0].tarih)) / GUN
  const motorlar = [...new Set(tam.map((s) => s.motor))]
  // Arama sonucu (SERP) ölçümü ayrı sayılır: yalnız gsc/trends kaydı varsa sıra ve sayfa tipi ölçülmemiştir.
  const serpVar = tam.some((s) => s.tur === 'serp')
  return { durum: yas > gun ? 'ESKI' : 'OLCULDU', anahtar, yasGun: Math.floor(yas), son: tam[0], satirlar: tam, benzer, motorlar, serpVar }
}

/** Toplu içe aktarımda çiftlemeyi önler: tarih(gün)+sorgu anahtarı+motor+kart aynıysa atlanır. */
export function yeniOlanlar(mevcut, adaylar) {
  const anahtar = (s) => `${new Date(tarihAl(s.tarih)).toISOString().slice(0, 10)}|${sorguAnahtari(s.sorgu)}|${s.motor}|${s.kart}`
  const var_ = new Set(mevcut.map(anahtar))
  const yeni = []
  for (const a of adaylar) {
    const k = anahtar(a)
    if (!var_.has(k)) { var_.add(k); yeni.push(a) }
  }
  return yeni
}

function cikti(r) {
  const bas = { OLCULDU: 'ÖLÇÜLDÜ', ESKI: 'ESKİ ÖLÇÜM', OLCULMEDI: 'ÖLÇÜLMEDİ' }[r.durum]
  const satirlar = [`${bas}: "${r.anahtar}"`]
  if (r.durum !== 'OLCULMEDI') {
    satirlar.push(`en yeni kayıt ${r.yasGun} gün önce: ${r.son.tarih.slice(0, 10)} · ${r.son.motor} · ${r.son.kart} · ${r.son.kaynak}${r.son.sira ? ` · sıra ${r.son.sira}` : ''}${r.son.sayfaTipi ? ` · ${r.son.sayfaTipi}` : ''}`)
    for (const s of r.satirlar.slice(0, 8)) satirlar.push(`  ${s.tarih.slice(0, 10)} ${s.motor} ${s.kart} ${s.kaynak}${s.sira ? ` sıra ${s.sira}` : ''}`)
    satirlar.push(`Ölçen motor/kaynak: ${r.motorlar.join(', ')}${r.serpVar ? '' : ' (arama sonucu SERP ölçümü YOK: sıra ve sayfa tipi bilinmiyor)'}`)
    if (r.durum === 'ESKI') satirlar.push('KARAR: eski kayıt gerekçe; yeniden ölçülebilir, önce eski kayda bak.')
    else if (!r.serpVar) satirlar.push('KARAR: kayıtlı kaynağı yeniden ölçme; eksik olan SERP ölçümünü yap ve --kaydet ile yaz.')
    else satirlar.push('KARAR: yeniden ölçme; eski kayıttaki ham veriye ve kart notuna git.')
  } else {
    satirlar.push(r.benzer.length ? `Benzer kayıtlı sorgular: ${r.benzer.slice(0, 8).join(' | ')}` : 'Benzer kayıt da yok.')
    satirlar.push(r.benzer.length ? 'KARAR: önce benzer kayıtlara bak; gerçekten yeni ifadeyse ölç ve --kaydet ile yaz.' : 'KARAR: ölç ve --kaydet ile yaz.')
  }
  return satirlar.join('\n')
}

function defterOku(yol) {
  if (!existsSync(yol)) return { satirlar: [], bozuk: 0, yok: true }
  return defterAyristir(readFileSync(yol, 'utf8'))
}

function yolKontrol(yol) {
  if (depoIcindeMi(resolve(yol))) { console.error('HATA: --defter bir git deposunun içinde (repo PUBLIC, P6); depo dışı yol ver'); process.exit(2) }
}

async function ana() {
  const arg = process.argv.slice(2)
  const deger = (ad) => { const i = arg.indexOf(ad); return i >= 0 ? arg[i + 1] : undefined }
  const defter = deger('--defter') || VARSAYILAN_DEFTER
  yolKontrol(defter)

  if (arg.includes('--sor')) {
    const sorgu = deger('--sor')
    const gun = Number(deger('--gun') || ESKI_ESIGI_GUN)
    const motor = deger('--motor') ?? null
    if (!sorgu || !sorguAnahtari(sorgu)) { console.error('HATA: --sor "<sorgu>" zorunlu'); process.exit(2) }
    if (!Number.isFinite(gun) || gun < 1) { console.error('HATA: --gun pozitif sayı olmalı'); process.exit(2) }
    if (motor !== null && !MOTORLAR.includes(motor)) { console.error(`HATA: --motor ${MOTORLAR.join('|')} olmalı`); process.exit(2) }
    const { satirlar, bozuk, yok } = defterOku(defter)
    if (yok) console.error(`UYARI: defter yok (${defter}); ilk kayıt --kaydet ile oluşur`)
    if (bozuk) console.error(`UYARI: ${bozuk} bozuk defter satırı atlandı`)
    console.log(cikti(sorguOlculduMu({ satirlar, sorgu, motor, gun })))
    return
  }

  if (arg.includes('--kaydet')) {
    const s = {
      tarih: deger('--tarih') ?? new Date().toISOString(), sorgu: deger('--sorgu'), motor: deger('--motor'), kart: deger('--kart'), kaynak: deger('--kaynak'),
      tur: deger('--tur'), sayfaTipi: deger('--sayfa-tipi'), adres: deger('--adres'), not: deger('--not'),
    }
    const sira = deger('--sira')
    if (sira !== undefined) s.sira = Number(sira)
    for (const k of ['tur', 'sayfaTipi', 'adres', 'not']) if (s[k] === undefined) delete s[k]
    if (!satirGecerliMi(s)) { console.error('HATA: --kaydet için --sorgu --motor --kart (ÖN EK-sayı) --kaynak zorunlu; tur/sayfa-tipi/sira değerleri geçerli olmalı'); process.exit(2) }
    mkdirSync(dirname(resolve(defter)), { recursive: true })
    appendFileSync(defter, satirYaz(s) + '\n')
    console.log(`kaydedildi: ${s.sorgu} · ${s.motor} · ${s.kart}`)
    return
  }

  if (arg.includes('--toplu')) {
    const dosya = deger('--toplu')
    let adaylar
    try { adaylar = JSON.parse(readFileSync(dosya, 'utf8')) } catch (e) { console.error(`HATA: --toplu dosyası okunamadı: ${e.message}`); process.exit(2) }
    if (!Array.isArray(adaylar) || adaylar.some((s) => !satirGecerliMi(s))) { console.error('HATA: --toplu bir dizi olmalı ve her satır geçerli olmalı'); process.exit(2) }
    const { satirlar } = defterOku(defter)
    const yeni = yeniOlanlar(satirlar, adaylar)
    if (yeni.length) {
      mkdirSync(dirname(resolve(defter)), { recursive: true })
      appendFileSync(defter, yeni.map(satirYaz).join('\n') + '\n')
    }
    console.log(`toplu: ${adaylar.length} satır, ${yeni.length} yeni yazıldı, ${adaylar.length - yeni.length} zaten vardı`)
    return
  }

  console.error('Kullanım: --sor "<sorgu>" | --kaydet --sorgu ... --motor ... --kart ... --kaynak ... | --toplu <dosya.json>  (ayrıntı: dosya başı)')
  process.exit(2)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ana().catch((e) => { console.error('HATA:', e.message); process.exit(1) })
}
