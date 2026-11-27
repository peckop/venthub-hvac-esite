#!/usr/bin/env node
/**
 * ETKİ DEFTERİ — "bu değişiklik işe yaradı mı?" sorusunun defteri (Kanban SEO-147; cetvel docs/standards/dizin-sistemleri-standard.md D8.1,
 * yayin-gorunurluk-denetim-standard.md Y2.1 görünme kuralı). YENİ DEFTER YOK: `dizin-takip.mjs` hareketler.jsonl'deki 'degisim' satırı "etki satırı"
 * olur (kart, pr, hipotez, once, vadeler, kontrol, cakisan, hukum). Bu betik o satırlara VADE ölçümünü ve HÜKMÜ yazar, adres başına zaman çizgisi
 * ve özet üretir. AĞSIZ: yalnız arşivdeki dosyaları okur (olcumler.jsonl, gsc-sayfa/*.json, dizin-takip-<gün>.json, hareketler.jsonl).
 *
 * Çalıştırma: `node scripts/seo/dizin-takip.mjs --etki` (bu betiğe devreder) ya da doğrudan `node scripts/seo/dizin-etki.mjs`.
 *   --hareket <jsonl>     defter (varsayılan DIZIN_TAKIP_DEFTER ya da ~/VentHub-Olcum-Arsiv/geo-seo/dizin-takip/hareketler.jsonl)
 *   --arsiv <klasör>      geo-seo arşivi (varsayılan: defterin bir üst klasörü): olcumler.jsonl, gsc-sayfa/, INDEKS.md buradan
 *   --cikti <klasör>      sayfa-zaman/<slug>.json ve ozet.json buraya (varsayılan: defterin klasörü). DEPO İÇİ REDDEDİLİR (P6, repo PUBLIC)
 *   --yeniden             dolu vadeleri ve once'yi sıfırdan hesapla (varsayılan: dolu vade yeniden yazılmaz, yalnız null olanlar dolar)
 *   --kuru                hiçbir dosya yazma; yalnız sayıları bas
 *   --simdi <ISO>         "bugün" (test/yeniden üretim)
 * Çıkış: 0 tamam · 1 defter koşu sırasında değişti · 2 araç koşmadı (bozuk girdi, depo içi yol, defter yok).
 *
 * VADE: değişiklikten 3/7/14/28. gün. Ölçüm = aynı adreste hedef güne EN YAKIN ölçüm, ±1 gün tolerans. Kaynaklar (yalnız Google ailesi:
 * motor google/gsc; Bing/Yandex ölçümü zaman çizgisinde görünür ama vade ve hükme girmez, çünkü hipotez Google görünürlüğüdür):
 *   gsc      sayfa okuması günlük serisi: hedef gün ±1'in TOPLAMI (tek günlük 0 gösterim gürültüsü "görünmedi" yazmasın); sıra = gösterim ağırlıklı ortalama
 *   olcum    olcumler.jsonl adresli satır (serp/gsc): sıra yoksa "gorunmedi"
 *   gorunme  hareketler.jsonl 'gorunme' satırı (canlı arama; gorundu/gorunmuyor). 'olculemedi' ölçüm sayılmaz
 * Vadesi gelmemiş vade null kalır; vadesi gelmiş ama ölçüm bulunamayan vade de null kalır (ölçemedim ≠ görünmedi).
 *
 * HÜKÜM (sıralı kural; her hükmün tek cümlelik `hukumNotu`'su yazılır):
 *   1. dolu vade yok                                  → bekliyor
 *   2. aynı adreste ±7 günde başka değişiklik var     → ayrilamiyor, `cakisan` alanına çakışanlar TEK CÜMLEYLE
 *   3. once yok / karşılaştırılabilir değil            → ayrilamiyor (tabanı bilinmeyen etki hükme bağlanmaz)
 *   4. en son dolu vade ile once karşılaştırılır:
 *        önce görünmüyordu → şimdi görünüyor          → olumlu (dizine/aramaya giriş)
 *        önce görünüyordu  → şimdi görünmüyor         → olumsuz
 *        ikisi de görünüyor, sıra farkı ≥ SIRA_ESIGI  → olumlu (iyileşme) / olumsuz (kötüleşme); fark eşiğin altındaysa notr
 *        ikisi de görünmüyor                          → notr
 *   SIRA_ESIGI = 3 sıra BAŞLANGIÇ VARSAYIMIDIR, ölçülmemiştir (günlük sıra verisi gürültülüdür; üç koşu sonra gözden geçirilir).
 * ÖNCE (once): değişiklikten önceki 7 günün GSC toplamı; GSC yoksa ondan önceki en yeni olcum/gorunme (14 gün içinde); son tarama arşiv anlık görüntüsünden.
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { depoIcindeMi } from './bing-webmaster-oku.mjs'
import { GIT_GECMISI, hareketGecerliMi, HUKUMLER, satirYaz, SITE, tarihAl, VADE_GUNLERI, VARSAYILAN_DEFTER, yedekAl } from './dizin-takip.mjs'
import { atomikYaz, indeksYaz } from './etki-son-kosu.mjs'
import { ciktiYoluKontrol } from './gsc-sayfa-oku.mjs'

export const KOK = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const TOLERANS_GUN = 1
export const CAKISMA_GUN = 7
export const SIRA_ESIGI = 3
export const GORUNMEZ_SIRA = 100
export const ONCE_PENCERE_GUN = 7
export const ONCE_GERI_GUN = 14
export const KONTROL_AZAMI = 5
const GUN_MS = 24 * 3600 * 1000
const TR_MS = 3 * 3600 * 1000

// ---------------------------------------------------------------- gün yardımcıları (Türkiye günü, UTC+3, yaz saati yok)
export const trGun = (ms) => new Date(ms + TR_MS).toISOString().slice(0, 10)
export const gunEkle = (gun, n) => new Date(Date.parse(`${gun}T00:00:00Z`) + n * GUN_MS).toISOString().slice(0, 10)
/** a - b, gün olarak. */
export const gunFarki = (a, b) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / GUN_MS)
const yuvarla1 = (x) => Math.round(x * 10) / 10

// ---------------------------------------------------------------- yol kapısı
/** Depo içi yol REDDEDİLİR (P6). İki mevcut yardımcı birlikte: bir git deposunun içinde mi (`depoIcindeMi`) + bu deponun köküne göre (`ciktiYoluKontrol`). */
export function etkiYoluKontrol(yol, kok = KOK) {
  const r = resolve(String(yol))
  if (depoIcindeMi(join(r, 'x'))) return { gecerli: false, neden: `${yol} bir git deposunun içinde (repo PUBLIC, P6); depo dışı yol ver` }
  const k = ciktiYoluKontrol(r, kok, false)
  return k.gecerli ? { gecerli: true, neden: null } : { gecerli: false, neden: k.neden }
}

// ---------------------------------------------------------------- girdi okuyucular (hepsi tolerant: bozuk satır/dosya atlanır ve SAYILIR)
/** Defter metni → [{ ham, h }]: h geçerli satırsa nesne, değilse null. Satırlar aynen korunur (yeniden yazımda bozuk satır düşmez). */
export function defterSatirlari(metin) {
  return String(metin ?? '').split('\n').map((ham) => {
    const t = ham.replace(/\r$/, '')
    let h = null
    if (t.trim()) { try { const o = JSON.parse(t); if (hareketGecerliMi(o)) h = o } catch { /* bozuk satır: ham korunur */ } }
    return { ham, h }
  })
}

/** olcumler.jsonl → adresli satırlar. Şema: scripts/seo/olcum-defteri.mjs. Dosya yoksa/bozuksa boş + sayaç. */
export function olcumleriOku(yol) {
  const sonuc = { satirlar: [], atlanan: 0, yok: false }
  if (!existsSync(yol)) return { ...sonuc, yok: true }
  for (const ham of readFileSync(yol, 'utf8').split(/\r?\n/)) {
    if (!ham.trim()) continue
    try {
      const o = JSON.parse(ham)
      const t = Date.parse(o?.tarih)
      if (typeof o?.adres === 'string' && o.adres.startsWith(`${SITE}/`) && Number.isFinite(t)) sonuc.satirlar.push({ ...o, ms: t })
    } catch { sonuc.atlanan++ }
  }
  return sonuc
}

function dosyalariBul(klasor, desen, derinlik = 4) {
  const bulunan = []
  const yuru = (d, n) => {
    let adlar
    try { adlar = readdirSync(d) } catch { return }
    for (const ad of adlar) {
      const y = join(d, ad)
      let st
      try { st = statSync(y) } catch { continue }
      if (st.isDirectory()) { if (n < derinlik) yuru(y, n + 1) } else if (desen.test(ad)) bulunan.push(y)
    }
  }
  yuru(klasor, 0)
  return bulunan.sort()
}

/** gsc-sayfa/ altındaki gsc-sayfa-oku-*.json okumaları (alinma sırasıyla). Bozuk dosya sayılır. */
export function gscOkumalariniOku(klasor) {
  const okumalar = []
  let atlanan = 0
  for (const y of dosyalariBul(klasor, /^gsc-sayfa-oku-.*\.json$/)) {
    try {
      const j = JSON.parse(readFileSync(y, 'utf8'))
      const alinma = Date.parse(j?.alinma)
      if (Array.isArray(j?.kayitlar) && Number.isFinite(alinma)) okumalar.push({ alinma, kayitlar: j.kayitlar })
      else atlanan++
    } catch { atlanan++ }
  }
  return { okumalar: okumalar.sort((a, b) => a.alinma - b.alinma), atlanan }
}

/** Arşivdeki dizin-takip-<gün>.json anlık görüntüleri (alinma sırasıyla). */
export function anlikGoruntuleriOku(klasor) {
  const goruntuler = []
  let adlar = []
  try { adlar = readdirSync(klasor).filter((a) => /^dizin-takip-\d{4}-\d{2}-\d{2}\.json$/.test(a)) } catch { /* klasör yok */ }
  for (const ad of adlar) {
    try {
      const j = JSON.parse(readFileSync(join(klasor, ad), 'utf8'))
      const alinma = Date.parse(j?.alinma)
      if (Array.isArray(j?.tablo) && Number.isFinite(alinma)) goruntuler.push({ alinma, tablo: j.tablo })
    } catch { /* bozuk dosya atlanır */ }
  }
  return goruntuler.sort((a, b) => a.alinma - b.alinma)
}

// ---------------------------------------------------------------- adres başına kaynak kaydı
const bosKayit = () => ({ gsc: new Map(), sira: [], gorunme: [], tarama: [], hareket: [], anlik: [] })
const googleAilesi = (motor) => motor === 'google' || motor === 'gsc'

/**
 * Kaynakları adres başına tek kayda toplar. Girdiler ayrıştırılmış nesnelerdir (dosya okuma dışarıda: testte sahte girdi).
 * @param {{ hareketler?: object[], olcumler?: object[], gscOkumalari?: Array<{ alinma: number, kayitlar: object[] }>, anlikGoruntuler?: Array<{ alinma: number, tablo: object[] }> }} k
 * @returns {Map<string, ReturnType<typeof bosKayit>>}
 */
export function kayitlariKur({ hareketler = [], olcumler = [], gscOkumalari = [], anlikGoruntuler = [] }) {
  const harita = new Map()
  const al = (adres) => { if (!harita.has(adres)) harita.set(adres, bosKayit()); return harita.get(adres) }
  for (const h of hareketler) {
    const ms = tarihAl(h.tarih)
    if (ms === null) continue
    const k = al(h.adres)
    k.hareket.push({ ...h, ms })
    if (h.eylem === 'gorunme' && (h.sonuc === 'gorundu' || h.sonuc === 'gorunmuyor')) k.gorunme.push({ ms, gun: trGun(ms), gorunme: h.sonuc === 'gorundu' ? 'gorundu' : 'gorunmedi' })
  }
  for (const o of olcumler) {
    if (!Number.isFinite(o.ms)) continue
    al(o.adres).sira.push({ ms: o.ms, gun: trGun(o.ms), motor: o.motor, tur: o.tur ?? null, sira: typeof o.sira === 'number' && o.sira > 0 ? o.sira : null, kart: o.kart ?? null })
  }
  for (const okuma of gscOkumalari) {
    for (const r of okuma.kayitlar) {
      if (typeof r?.adres !== 'string') continue
      const k = al(r.adres)
      const g = r.seri
      if (g && !g.hata && Array.isArray(g.gunler)) for (const d of g.gunler) if (typeof d?.tarih === 'string') k.gsc.set(d.tarih, { tik: d.tik ?? 0, gosterim: d.gosterim ?? 0, sira: typeof d.sira === 'number' ? d.sira : null, alinma: okuma.alinma })
      const t = tarihAl(r.denetim?.sonTarama)
      if (t !== null && !k.tarama.some((x) => x.motor === 'google' && x.ms === t)) k.tarama.push({ ms: t, motor: 'google', kaynak: 'gsc-denetim' })
    }
  }
  const son = new Map()
  for (const goruntu of anlikGoruntuler) {
    for (const s of goruntu.tablo) {
      if (typeof s?.adres !== 'string') continue
      const k = al(s.adres)
      for (const motor of ['google', 'bing']) {
        const t = tarihAl(s[motor]?.sonTarama)
        const anahtar = `${s.adres}|${motor}`
        if (t !== null && son.get(anahtar) !== t) {
          son.set(anahtar, t)
          if (!k.tarama.some((x) => x.motor === motor && x.ms === t)) k.tarama.push({ ms: t, motor, kaynak: 'anlik' })
        }
      }
    }
  }
  return harita
}

// ---------------------------------------------------------------- ölçüm (vade ve önce)
function gscPencere(kayit, bas, bit) {
  let gosterim = 0, tik = 0, agirlik = 0, gunSayisi = 0
  for (const [gun, v] of kayit.gsc) {
    if (gun < bas || gun > bit) continue
    gunSayisi++; gosterim += v.gosterim; tik += v.tik; agirlik += (v.sira ?? 0) * v.gosterim
  }
  return gunSayisi ? { gunSayisi, gosterim, tik, sira: gosterim ? yuvarla1(agirlik / gosterim) : null } : null
}

const KAYNAK_ONCELIGI = { gsc: 0, olcum: 1, gorunme: 2 }

/**
 * Bir adreste hedef güne en yakın ölçüm (±tolerans gün) ya da null. "Ölçüm yok" ile "görünmedi" ayrıdır: ölçüm VARSA ve sıra yoksa gorunme: 'gorunmedi'.
 * @returns {{ kaynak: string, tarih: string, gorunme: 'gorundu'|'gorunmedi', sira: number|null, gunFarki?: number, gosterim?: number, tik?: number, kaynaklar: string[] } | null}
 */
export function olcumBul({ kayit, hedefGun, tolerans = TOLERANS_GUN }) {
  if (!kayit) return null
  const adaylar = []
  const g = gscPencere(kayit, gunEkle(hedefGun, -tolerans), gunEkle(hedefGun, tolerans))
  if (g) adaylar.push({ kaynak: 'gsc', tarih: hedefGun, fark: 0, gorunme: g.gosterim > 0 ? 'gorundu' : 'gorunmedi', sira: g.sira, gosterim: g.gosterim, tik: g.tik })
  const olc = kayit.sira.filter((r) => googleAilesi(r.motor) && (r.tur === 'serp' || r.tur === 'gsc') && Math.abs(gunFarki(r.gun, hedefGun)) <= tolerans)
  if (olc.length) {
    const fark = Math.min(...olc.map((r) => Math.abs(gunFarki(r.gun, hedefGun))))
    const o = olc.filter((r) => Math.abs(gunFarki(r.gun, hedefGun)) === fark)
    const sirali = o.map((r) => r.sira).filter((x) => x !== null)
    const sira = sirali.length ? Math.min(...sirali) : null
    adaylar.push({ kaynak: 'olcum', tarih: o[0].gun, fark, gorunme: sira === null ? 'gorunmedi' : 'gorundu', sira })
  }
  const gor = kayit.gorunme.filter((r) => Math.abs(gunFarki(r.gun, hedefGun)) <= tolerans)
  if (gor.length) {
    const fark = Math.min(...gor.map((r) => Math.abs(gunFarki(r.gun, hedefGun))))
    const en = gor.filter((r) => Math.abs(gunFarki(r.gun, hedefGun)) === fark).sort((a, b) => b.ms - a.ms)[0]
    adaylar.push({ kaynak: 'gorunme', tarih: en.gun, fark, gorunme: en.gorunme, sira: null })
  }
  if (!adaylar.length) return null
  adaylar.sort((a, b) => a.fark - b.fark || Number(b.sira !== null) - Number(a.sira !== null) || KAYNAK_ONCELIGI[a.kaynak] - KAYNAK_ONCELIGI[b.kaynak])
  const s = adaylar[0]
  return {
    kaynak: s.kaynak, tarih: s.tarih, gorunme: s.gorunme, sira: s.sira,
    ...(s.fark ? { gunFarki: s.fark } : {}),
    ...(s.gosterim !== undefined ? { gosterim: s.gosterim, tik: s.tik } : {}),
    kaynaklar: [...new Set(adaylar.map((a) => a.kaynak))],
  }
}

/** Değişiklik öncesi durum özeti ya da null. Yalnız bilinen parça yazılır; bilinmeyen alan yoktur (uydurma yok). */
export function onceHesapla({ degisimMs, kayit }) {
  if (!kayit) return null
  const gun = trGun(degisimMs)
  const bas = gunEkle(gun, -ONCE_PENCERE_GUN)
  const bit = gunEkle(gun, -1)
  const cikti = {}
  const g = gscPencere(kayit, bas, bit)
  if (g) {
    Object.assign(cikti, { kaynak: 'gsc', tarih: bit, gorunme: g.gosterim > 0 ? 'gorundu' : 'gorunmedi', sira: g.sira, gosterim: g.gosterim })
  } else {
    const adaylar = []
    for (const r of kayit.sira) if (googleAilesi(r.motor) && (r.tur === 'serp' || r.tur === 'gsc') && r.ms < degisimMs && degisimMs - r.ms <= ONCE_GERI_GUN * GUN_MS) adaylar.push({ ms: r.ms, kaynak: 'olcum', gorunme: r.sira === null ? 'gorunmedi' : 'gorundu', sira: r.sira })
    for (const r of kayit.gorunme) if (r.ms < degisimMs && degisimMs - r.ms <= ONCE_GERI_GUN * GUN_MS) adaylar.push({ ms: r.ms, kaynak: 'gorunme', gorunme: r.gorunme, sira: null })
    adaylar.sort((a, b) => b.ms - a.ms)
    if (adaylar[0]) Object.assign(cikti, { kaynak: adaylar[0].kaynak, tarih: trGun(adaylar[0].ms), gorunme: adaylar[0].gorunme, sira: adaylar[0].sira })
  }
  const t = kayit.tarama.filter((x) => x.motor === 'google' && x.ms <= degisimMs).sort((a, b) => b.ms - a.ms)[0]
  if (t) cikti.sonTarama = new Date(t.ms).toISOString()
  return Object.keys(cikti).length ? cikti : null
}

// ---------------------------------------------------------------- çakışma, kontrol, hüküm
/** Aynı değişiklik mi: aynı PR (biliniyorsa) ya da aynı an. Git geçmişi satırı ile elle kayıt aynı değişikliği iki kez saymasın. */
const ayniDegisiklik = (a, b) => (a.pr && b.pr && a.pr === b.pr) || a.ms === b.ms

/** i. satırla aynı adreste ±7 günde olan BAŞKA değişiklikler. */
export function cakisanlariBul(degisimler, i) {
  const h = degisimler[i]
  return degisimler.filter((d, j) => j !== i && d.adres === h.adres && Math.abs(d.ms - h.ms) <= CAKISMA_GUN * GUN_MS && !ayniDegisiklik(h, d)).sort((a, b) => a.ms - b.ms)
}

/** TEK CÜMLE: çakışan değişiklikler ve neden ayrıştırılamadığı. Çakışma yoksa null. */
export function cakisanCumlesi(liste) {
  if (!liste.length) return null
  const parca = (d) => `${trGun(d.ms)}${d.kart ? ` ${d.kart}` : ''}${d.pr ? ` #${d.pr}` : ''}`
  const ilk = liste.slice(0, 3).map(parca).join(', ')
  const fazla = liste.length > 3 ? ` ve ${liste.length - 3} tane daha` : ''
  return `Aynı adreste ±${CAKISMA_GUN} günde ${liste.length} başka değişiklik var (${ilk}${fazla}); etki bu değişiklikten ayrıştırılamıyor.`
}

/** Adres türü: kontrol adresi aynı türden seçilsin (yazı yazıyla, kategori kategoriyle karşılaştırılır). */
export function adresTipi(adres) {
  const yol = String(adres).replace(`${SITE}/`, '').replace(/^(tr|en)(\/|$)/, '')
  const [bolum, slug] = yol.split('/')
  if (!bolum) return 'kok'
  if (bolum === 'bilgi-merkezi' || bolum === 'knowledge-hub') return slug ? 'yazi' : 'liste'
  return bolum
}

/**
 * Aynı dönemde (değişiklikten -7 ile +28 gün) HİÇ değişmemiş, aynı türden ve ölçümü olan adresler (en çok 5; alfabetik, tekrar üretilebilir).
 * Ölçümü olmayan adres kontrol olamaz: karşılaştıracak veri yok. Liste boşsa null (alan yazılmaz).
 */
export function kontrolBul({ adres, degisimMs, degisimler, kayitlar }) {
  const tip = adresTipi(adres)
  const bas = degisimMs - CAKISMA_GUN * GUN_MS
  const bit = degisimMs + VADE_GUNLERI[VADE_GUNLERI.length - 1] * GUN_MS
  const degisenler = new Set(degisimler.filter((d) => d.ms >= bas && d.ms <= bit).map((d) => d.adres))
  const adaylar = []
  for (const [a, k] of kayitlar) {
    if (a === adres || adresTipi(a) !== tip || degisenler.has(a)) continue
    if (k.gsc.size || k.sira.some((r) => googleAilesi(r.motor) && (r.tur === 'serp' || r.tur === 'gsc'))) adaylar.push(a)
  }
  const liste = adaylar.sort().slice(0, KONTROL_AZAMI)
  return liste.length ? liste : null
}

export const sonDoluVade = (vadeler) => {
  for (const n of [...VADE_GUNLERI].reverse()) if (vadeler?.[n]) return { gun: n, olcum: vadeler[n] }
  return null
}

/**
 * Hüküm: yukarıdaki sıralı kural (dosya başı). Saf işlev.
 * @returns {{ hukum: 'olumlu'|'olumsuz'|'notr'|'ayrilamiyor'|'bekliyor', notu: string }}
 */
export function hukumHesapla({ once, vadeler, cakisan }) {
  const son = sonDoluVade(vadeler)
  if (!son) return { hukum: 'bekliyor', notu: 'Henüz dolu vade yok (vade gelmedi ya da gelen vadelerde ölçüm yok); ölçüm bekleniyor.' }
  if (cakisan) return { hukum: 'ayrilamiyor', notu: cakisan }
  const o = once?.gorunme
  if (o !== 'gorundu' && o !== 'gorunmedi') return { hukum: 'ayrilamiyor', notu: 'Değişiklik öncesi görünme durumu bilinmiyor; karşılaştırma tabanı yok, etki hükme bağlanamaz.' }
  const v = son.olcum
  const gun = `${son.gun}. gün`
  if (o === 'gorunmedi' && v.gorunme === 'gorundu') return { hukum: 'olumlu', notu: `Değişiklik öncesi aramada görünmüyordu, ${gun} ölçümünde göründü${v.sira !== null && v.sira !== undefined ? ` (sıra ${v.sira})` : ''}.` }
  if (o === 'gorundu' && v.gorunme === 'gorunmedi') return { hukum: 'olumsuz', notu: `Değişiklik öncesi aramada görünüyordu, ${gun} ölçümünde görünmüyor.` }
  if (o === 'gorunmedi') return { hukum: 'notr', notu: `Öncesinde de ${gun} ölçümünde de aramada görünmüyor; değişim yok.` }
  if (typeof once.sira !== 'number' || typeof v.sira !== 'number') return { hukum: 'notr', notu: `İkisinde de görünüyor ama sıra karşılaştırılamadı (${gun}); değişim ölçülemedi.` }
  const fark = yuvarla1(once.sira - v.sira)
  if (fark >= SIRA_ESIGI) return { hukum: 'olumlu', notu: `Sıra ${once.sira} iken ${gun} ölçümünde ${v.sira} (${fark} sıra iyileşme).` }
  if (fark <= -SIRA_ESIGI) return { hukum: 'olumsuz', notu: `Sıra ${once.sira} iken ${gun} ölçümünde ${v.sira} (${-fark} sıra kötüleşme).` }
  return { hukum: 'notr', notu: `Sıra ${once.sira} iken ${gun} ölçümünde ${v.sira}; fark ${SIRA_ESIGI} sıranın altında, değişim yok.` }
}

// ---------------------------------------------------------------- etki satırı hesabı
/**
 * Tek etki satırının hesaplanan alanları. Dolu vade ve once, `yeniden` verilmedikçe KORUNUR (ölçüm yeniden yazılmaz); null olanlar dolar.
 * `once.sayfa === 'yeni'` (git geçmişinden: sayfa yoktu) her zaman korunur.
 * @param {{ h: object, i: number, degisimler: Array<object & { ms: number }>, kayitlar: Map<string, any>, simdi: number, yeniden?: boolean }} p
 */
export function etkiHesapla({ h, i, degisimler, kayitlar, simdi, yeniden = false }) {
  const ms = degisimler[i].ms
  const kayit = kayitlar.get(h.adres) ?? null
  const once = h.once?.sayfa === 'yeni' || (!yeniden && h.once) ? h.once : onceHesapla({ degisimMs: ms, kayit })
  const degisimGun = trGun(ms)
  const bugun = trGun(simdi)
  const vadeler = {}
  for (const n of VADE_GUNLERI) {
    const onceki = yeniden ? null : h.vadeler?.[n] ?? null
    if (onceki) { vadeler[n] = onceki; continue }
    const hedef = gunEkle(degisimGun, n)
    vadeler[n] = hedef <= bugun ? olcumBul({ kayit, hedefGun: hedef }) : null
  }
  const cakisan = cakisanCumlesi(cakisanlariBul(degisimler, i))
  const kontrol = kontrolBul({ adres: h.adres, degisimMs: ms, degisimler, kayitlar })
  const { hukum, notu } = hukumHesapla({ once, vadeler, cakisan })
  return { once: once ?? null, vadeler, kontrol, cakisan, hukum, hukumNotu: notu }
}

/** Defter satırlarından etki satırlarını (degisim) çıkarıp hepsini hesaplar. @returns {Array<{ satirNo: number, h: object, yeni: object, degisti: boolean }>} */
export function etkileriHesapla({ satirlar, kayitlar, simdi, yeniden = false }) {
  const degisimler = []
  satirlar.forEach((s, satirNo) => { if (s.h?.eylem === 'degisim') degisimler.push({ ...s.h, ms: tarihAl(s.h.tarih), satirNo }) })
  return degisimler.map((d, i) => {
    const { ms, satirNo, ...h } = d
    const yeni = { ...h, ...etkiHesapla({ h, i, degisimler, kayitlar, simdi, yeniden }) }
    return { satirNo, h, yeni, degisti: satirYaz(yeni) !== satirYaz(h) }
  })
}

// ---------------------------------------------------------------- zaman çizgisi ve özet (depo dışı çıktılar)
const TUR_SIRASI = { degisim: 0, istek: 1, tarama: 2, gorunme: 3, sira: 4 }

/** Adres için tarih sıralı olay listesi: değişiklik, istek/gönderim, tarama, görünme, sıra. */
export function zamanCizgisi({ adres, kayit, degisimler = [], simdi }) {
  const olaylar = []
  const ekle = (ms, tur, alanlar) => olaylar.push({ ms, olay: { tarih: new Date(ms).toISOString(), tur, ...alanlar } })
  // Değişiklik olayları GÜNCEL etki satırlarından gelir (kayit.hareket defterin okunan hâlidir).
  for (const h of degisimler) ekle(tarihAl(h.tarih), 'degisim', { kart: h.kart ?? null, pr: h.pr ?? null, commit: h.commit ?? null, kaynak: h.kaynak ?? null, neden: h.neden ?? null, hipotez: h.hipotez ?? null, once: h.once ?? null, vadeler: h.vadeler ?? null, kontrol: h.kontrol ?? null, cakisan: h.cakisan ?? null, hukum: h.hukum ?? 'bekliyor', hukumNotu: h.hukumNotu ?? null })
  for (const h of kayit?.hareket ?? []) {
    if (h.eylem === 'degisim') continue
    if (h.eylem === 'istek' || h.eylem === 'gonderim') ekle(h.ms, 'istek', { motor: h.motor, eylem: h.eylem, kaynak: h.kaynak ?? null, kart: h.kart ?? null })
    else if (h.eylem === 'gorunme') ekle(h.ms, 'gorunme', { motor: h.motor, sonuc: h.sonuc, kaynak: 'hareket' })
    else if (h.eylem === 'olcum') ekle(h.ms, 'gorunme', { motor: h.motor, sonuc: h.sonuc ?? null, kaynak: 'hareket-olcum' })
  }
  for (const t of kayit?.tarama ?? []) ekle(t.ms, 'tarama', { motor: t.motor, kaynak: t.kaynak })
  for (const r of kayit?.sira ?? []) ekle(r.ms, 'sira', { motor: r.motor, sira: r.sira, kaynak: 'olcum', olcumTuru: r.tur, kart: r.kart })
  for (const [gun, v] of kayit?.gsc ?? []) if (v.gosterim > 0) ekle(Date.parse(`${gun}T00:00:00Z`), 'sira', { motor: 'gsc', sira: v.sira === null ? null : yuvarla1(v.sira), gosterim: v.gosterim, tik: v.tik, kaynak: 'gsc', gunluk: true })
  olaylar.sort((a, b) => a.ms - b.ms || TUR_SIRASI[a.olay.tur] - TUR_SIRASI[b.olay.tur])
  const sayi = (tur) => olaylar.filter((o) => o.olay.tur === tur).length
  const sonDegisim = [...olaylar].reverse().find((o) => o.olay.tur === 'degisim')
  return {
    adres,
    olusturma: new Date(simdi).toISOString(),
    ozet: { degisim: sayi('degisim'), istek: sayi('istek'), tarama: sayi('tarama'), gorunme: sayi('gorunme'), sira: sayi('sira'), sonHukum: sonDegisim?.olay.hukum ?? null },
    olaylar: olaylar.map((o) => o.olay),
  }
}

/** Dosya adı: slug; farklı adresler aynı slug'ı verirse tür, gerekirse dil önekiyle ayrılır. Yalnız [a-z0-9-]. */
export function dosyaAdlari(adresler) {
  const parcala = (adres) => {
    const yol = String(adres).replace(`${SITE}/`, '')
    const dil = /^(tr|en)(\/|$)/.exec(yol)?.[1] ?? 'tr'
    const kalan = yol.replace(/^(tr|en)(\/|$)/, '')
    const segmentler = kalan.split('/').filter(Boolean)
    return { dil, tip: adresTipi(adres), slug: segmentler[segmentler.length - 1] ?? 'ana-sayfa' }
  }
  const temiz = (s) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'adres'
  const p = new Map(adresler.map((a) => [a, parcala(a)]))
  const say = (f) => { const m = new Map(); for (const [a, v] of p) { const k = f(v); m.set(k, [...(m.get(k) ?? []), a]) } return m }
  const slugSay = say((v) => temiz(v.slug))
  const tipSay = say((v) => `${temiz(v.tip)}--${temiz(v.slug)}`)
  const sonuc = new Map()
  for (const [a, v] of p) {
    let ad = temiz(v.slug)
    if (slugSay.get(ad).length > 1) ad = `${temiz(v.tip)}--${temiz(v.slug)}`
    if (tipSay.get(`${temiz(v.tip)}--${temiz(v.slug)}`).length > 1 && slugSay.get(temiz(v.slug)).length > 1) ad = `${temiz(v.dil)}--${temiz(v.tip)}--${temiz(v.slug)}`
    sonuc.set(a, `${ad}.json`)
  }
  return sonuc
}

/** Etki puanı (yalnız kazanan/kaybeden SIRALAMASI için; hükmü etkilemez): sıra iyileşmesi; görünmeyenden görünene giriş GORUNMEZ_SIRA tabanına göre. */
export function etkiPuani(once, son) {
  if (!once || !son) return null
  const sira = (x) => (typeof x === 'number' ? x : GORUNMEZ_SIRA - 1)
  if (once.gorunme === 'gorunmedi' && son.gorunme === 'gorundu') return yuvarla1(GORUNMEZ_SIRA - sira(son.sira))
  if (once.gorunme === 'gorundu' && son.gorunme === 'gorunmedi') return yuvarla1(-(GORUNMEZ_SIRA - sira(once.sira)))
  if (once.gorunme === 'gorundu' && son.gorunme === 'gorundu' && typeof once.sira === 'number' && typeof son.sira === 'number') return yuvarla1(once.sira - son.sira)
  return 0
}

/**
 * ozet.json: son 7 gün değişiklikleri, hüküm dağılımı, en çok kazanan 5 ve en çok kaybeden 5 adres (adres başına en yeni olumlu/olumsuz satır).
 * `ayrilamiyor` hükümlü adres kazanan/kaybeden sayılmaz (nedenselliği kurulamıyor).
 */
export function ozetUret({ satirlar, simdi }) {
  const hukumler = Object.fromEntries(HUKUMLER.map((k) => [k, 0]))
  const kayitlar = satirlar.map((h) => ({ ...h, ms: tarihAl(h.tarih) }))
  for (const h of kayitlar) hukumler[h.hukum ?? 'bekliyor']++
  const son7 = kayitlar.filter((h) => h.ms <= simdi && simdi - h.ms <= 7 * GUN_MS).sort((a, b) => b.ms - a.ms)
    .map((h) => ({ tarih: h.tarih, adres: h.adres, kart: h.kart ?? null, pr: h.pr ?? null, hukum: h.hukum ?? 'bekliyor', kaynak: h.kaynak ?? null }))
  const adresBasina = new Map()
  for (const h of kayitlar.sort((a, b) => a.ms - b.ms)) if (h.hukum === 'olumlu' || h.hukum === 'olumsuz') adresBasina.set(h.adres, h)
  const puanli = [...adresBasina.values()].map((h) => {
    const son = sonDoluVade(h.vadeler)
    return { adres: h.adres, hukum: h.hukum, kart: h.kart ?? null, pr: h.pr ?? null, vade: son?.gun ?? null, onceSira: h.once?.sira ?? null, sonSira: son?.olcum.sira ?? null, puan: etkiPuani(h.once, son?.olcum) }
  })
  const kazananlar = puanli.filter((p) => p.hukum === 'olumlu').sort((a, b) => b.puan - a.puan || a.adres.localeCompare(b.adres)).slice(0, 5)
  const kaybedenler = puanli.filter((p) => p.hukum === 'olumsuz').sort((a, b) => a.puan - b.puan || a.adres.localeCompare(b.adres)).slice(0, 5)
  const olcumlu = kayitlar.filter((h) => sonDoluVade(h.vadeler)).length
  return {
    sonKosu: new Date(simdi).toISOString(),
    satirSayisi: satirlar.length,
    gitGecmisi: satirlar.filter((h) => h.kaynak === GIT_GECMISI).length,
    olcumluSatir: olcumlu,
    hukumDagilimi: hukumler,
    son7Gun: son7,
    kazananlar,
    kaybedenler,
    not: `Puan yalnız sıralama içindir (sıra iyileşmesi; görünmeyenden girişte ${GORUNMEZ_SIRA} sıra tabanı varsayımı); hüküm kurallarını etkilemez. ayrilamiyor hükümlü adresler listelenmez.`,
  }
}

// ---------------------------------------------------------------- dosya yazımı (eşzamanlı eklemeye karşı güvenli)
/** Dosya okunduktan sonra yalnız UZADIYSA (başka pencere `--kaydet` ile ekledi) kuyruk korunur; başka değişiklikte yazmaz. */
export function defterYaz({ defter, okunan, yeni }) {
  const simdiki = readFileSync(defter, 'utf8')
  let metin = yeni
  if (simdiki !== okunan) {
    if (!simdiki.startsWith(okunan)) return { hata: 'defter koşu sırasında değişti (ek dışında); yeniden koş' }
    metin = yeni + simdiki.slice(okunan.length)
  }
  atomikYaz(defter, metin)
  return { tamam: true }
}

/** Yazımdan ÖNCE yedek: `<defter klasörü>/hareketler.yedek-<tarih>.jsonl` (aynı gün varsa saat eklenir; eski yedek ezilmez). */
export function onYedekAl(defter, simdi = Date.now()) {
  const iso = new Date(simdi).toISOString()
  const ad = basename(defter, '.jsonl')
  let hedef = join(dirname(defter), `${ad}.yedek-${iso.slice(0, 10)}.jsonl`)
  if (existsSync(hedef)) hedef = join(dirname(defter), `${ad}.yedek-${iso.slice(0, 10)}-${iso.slice(11, 19).replace(/:/g, '')}.jsonl`)
  copyFileSync(defter, hedef)
  return hedef
}

/**
 * Ana işlem. Kaynakları okur, etki satırlarını hesaplar, (kuru değilse) defteri/zaman çizgisini/özeti/son koşu satırını yazar.
 * Son koşu saati YALNIZ depo dışı INDEKS.md'ye yazılır; depo içi hiçbir dosyaya dokunulmaz (SEO-154: depo içi ETKI bloğu her koşuda depoyu kirletiyordu).
 * @returns {{ kod: number, mesajlar: string[], hata?: string, ozet?: object }}
 */
export function etkiKos({ defter, arsiv = dirname(dirname(defter)), cikti = dirname(defter), olcumler = join(arsiv, 'olcumler.jsonl'), gscKlasor = join(arsiv, 'gsc-sayfa'), indeks = join(arsiv, 'INDEKS.md'), simdi = Date.now(), yeniden = false, kuru = false, kok = KOK, gunlukYedek = true }) {
  for (const [ad, yol] of [['--hareket', defter], ['--cikti', cikti], ['--arsiv', arsiv], ['--olcumler', olcumler], ['--gsc-sayfa', gscKlasor]]) {
    const k = etkiYoluKontrol(yol, kok)
    if (!k.gecerli) return { kod: 2, mesajlar: [], hata: `${ad}: ${k.neden}` }
  }
  if (!existsSync(defter)) return { kod: 2, mesajlar: [], hata: `defter yok: ${defter}` }
  const okunan = readFileSync(defter, 'utf8')
  const satirlar = defterSatirlari(okunan)
  const hareketler = satirlar.filter((s) => s.h).map((s) => s.h)
  const olc = olcumleriOku(olcumler)
  const gsc = gscOkumalariniOku(gscKlasor)
  const anlik = anlikGoruntuleriOku(dirname(defter))
  const kayitlar = kayitlariKur({ hareketler, olcumler: olc.satirlar, gscOkumalari: gsc.okumalar, anlikGoruntuler: anlik })
  const sonuclar = etkileriHesapla({ satirlar, kayitlar, simdi, yeniden })
  const mesajlar = []
  const degisen = sonuclar.filter((s) => s.degisti)

  // Yeni değerleri bellekteki satırlara işle (zaman çizgisi ve özet GÜNCEL hâlden üretilir).
  const yeniSatirlar = satirlar.map((s) => ({ ...s }))
  for (const s of degisen) yeniSatirlar[s.satirNo] = { ham: satirYaz(s.yeni), h: s.yeni, yeni: satirYaz(s.yeni) }
  const etkiSatirlari = sonuclar.map((s) => s.yeni)
  const ozet = ozetUret({ satirlar: etkiSatirlari, simdi })

  if (kuru) {
    mesajlar.push(`KURU: etki satırı ${etkiSatirlari.length} · yazılacak değişiklik ${degisen.length} · hüküm ${HUKUMLER.map((k) => `${k} ${ozet.hukumDagilimi[k]}`).join(', ')}`)
    return { kod: 0, mesajlar, ozet }
  }

  if (degisen.length) {
    const yedek = onYedekAl(defter, simdi)
    const yeniMetin = yeniSatirlar.map((s) => s.yeni ?? s.ham).join('\n')
    const y = defterYaz({ defter, okunan, yeni: yeniMetin })
    if (y.hata) return { kod: 1, mesajlar, hata: y.hata }
    if (gunlukYedek) yedekAl(defter, new Date(simdi))
    mesajlar.push(`defter: ${degisen.length} etki satırı güncellendi · yedek ${basename(yedek)}`)
  } else mesajlar.push('defter: değişen etki satırı yok')

  const klasor = join(cikti, 'sayfa-zaman')
  mkdirSync(klasor, { recursive: true })
  const adresler = [...new Set(etkiSatirlari.map((h) => h.adres))].sort()
  const adlar = dosyaAdlari(adresler)
  for (const a of adresler) atomikYaz(join(klasor, adlar.get(a)), `${JSON.stringify(zamanCizgisi({ adres: a, kayit: kayitlar.get(a), degisimler: etkiSatirlari.filter((h) => h.adres === a), simdi }), null, 1)}\n`)
  atomikYaz(join(cikti, 'ozet.json'), `${JSON.stringify(ozet, null, 1)}\n`)
  mesajlar.push(`çıktı: ${adresler.length} sayfa-zaman dosyası + ozet.json → ${cikti}`)

  const iso = new Date(simdi).toISOString()
  mkdirSync(dirname(indeks), { recursive: true })
  const i = indeksYaz(indeks, iso)
  mesajlar.push(`son koşu ${iso}: INDEKS ${i}`)
  mesajlar.push(`etki: ${etkiSatirlari.length} satır · ölçümlü ${ozet.olcumluSatir} · hüküm ${HUKUMLER.map((k) => `${k} ${ozet.hukumDagilimi[k]}`).join(', ')}`)
  const atlanan = olc.atlanan + gsc.atlanan + satirlar.filter((s) => s.ham.trim() && !s.h).length
  if (atlanan) mesajlar.push(`UYARI: ${atlanan} bozuk/okunamayan kaynak satırı ya da dosya atlandı`)
  if (olc.yok) mesajlar.push(`UYARI: olcumler.jsonl yok (${olcumler}); yalnız GSC ve defter ölçümleri kullanıldı`)
  if (!gsc.okumalar.length) mesajlar.push('UYARI: gsc-sayfa okuması bulunamadı; vade ölçümü yalnız defter ve olcumler.jsonl ile')
  return { kod: 0, mesajlar, ozet }
}

export function cli(arg = process.argv.slice(2)) {
  const deger = (b) => { const i = arg.indexOf(b); return i >= 0 ? arg[i + 1] : undefined }
  const defter = resolve(deger('--hareket') || process.env.DIZIN_TAKIP_DEFTER || VARSAYILAN_DEFTER)
  const simdiArg = deger('--simdi')
  if (simdiArg !== undefined && tarihAl(simdiArg) === null) { console.error('HATA: --simdi geçerli bir ISO tarih olmalı'); return 2 }
  const secenek = {
    defter, simdi: simdiArg ? Date.parse(simdiArg) : Date.now(), yeniden: arg.includes('--yeniden'), kuru: arg.includes('--kuru'),
    ...(deger('--arsiv') ? { arsiv: resolve(deger('--arsiv')) } : {}),
    ...(deger('--cikti') ? { cikti: resolve(deger('--cikti')) } : {}),
    ...(deger('--olcumler') ? { olcumler: resolve(deger('--olcumler')) } : {}),
    ...(deger('--gsc-sayfa') ? { gscKlasor: resolve(deger('--gsc-sayfa')) } : {}),
    ...(deger('--indeks') ? { indeks: resolve(deger('--indeks')) } : {}),
  }
  const r = etkiKos(secenek)
  for (const m of r.mesajlar) console.log(m)
  if (r.hata) console.error(`HATA: ${r.hata}`)
  return r.kod
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(cli())
