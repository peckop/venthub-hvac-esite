#!/usr/bin/env node
'use strict'

/**
 * KART-NOT SAYACI (HRT-44, OPS 10-09 "kart notu olmayan teslimi kabul etmiyorum"; cetvel: docs/standards/is-kayit-duzeni-standard.md).
 *
 * NİÇİN VAR: "teslim karta yazılır" kuralı yazıyla kalırsa hatırlanana kadar yaşar (karar 244: kontrolü yazılamayan kural girmez).
 * 2026-10-09'da HRT-34 notsuz Done'a girdi ve bunu ancak elle sayım gösterdi. Bu betik o sayımı tek komuta çevirir:
 * bugün Done'a geçen her kartta bugün tarihli, sistem dışı, dolu en az bir not var mı?
 *
 * KULLANIM (yerelde; CI'da KOŞMAZ: Kanban verisi git dışıdır, depo public):
 *   node scripts/board/kart-not-sayimi.cjs                       (bugün, Europe/Istanbul günü; canlı Kanban'dan)
 *   node scripts/board/kart-not-sayimi.cjs --gun 2026-10-09
 *   node scripts/board/kart-not-sayimi.cjs --dosya <disa-aktar --tam çıktısı.json>
 *   node scripts/board/kart-not-sayimi.cjs --kanit-zorunlu       (kanıt izi olmayan not da "eksik" sayılır)
 *   node scripts/board/kart-not-sayimi.cjs --json                (makine çıktısı)
 *
 * VERİ: scripts/nlm/kanban_disa_aktar.py --tam, stdout'a (dosyaya YAZMAZ: kart içeriği public depoya sızmasın).
 * "Bugün Done oldu" = Done'a geçiş anı: önce `completedAt` (status=completed), yoksa `doneAt` (Kanban olay kaydında Done kolonuna son
 * taşınma; Done kolonundaki ARŞİVLİ kartlarda completedAt boştur, 10-09 ölçümü 240 Done kartın 83'ü). İkisi de yoksa sonAnlamli'ya
 * düşülür ve satırda "tarihsiz" diye BELİRTİLİR: sonAnlamli notla kayar (BLG-4 10-09 doğrulama bulgusu), yani bu yol yaklaşıktır.
 * `sonAnlamli` tek başına ASLA ilk tercih değildir: eski karta bugün düşülen not onu bugüne taşırdı.
 *
 * KURALLAR:
 *   · Not sayılır: yazarı `system` değil ve en az 10 HARF/RAKAM içerir (boşluk, nokta, sıfır genişlikli karakter, emoji not değildir).
 *   · Kanıt izi (v2): "→", "KANIT:"/"Kanıt:", "#<PR no 3-5 hane>", "PR <no>" ya da hem rakam hem a-f harfi içeren 7-40 karakterlik commit
 *     kısaltması. Varsayılanda yalnız RAPORLANIR; --kanit-zorunlu ile notsuz gibi çıkış kodunu etkiler.
 *   · "Ölçülemedi" ASLA "temiz" sayılmaz (çıkış 2): boş dışa aktarım, hiç Done kartı olmayan veri, istenen günden ESKİ damgalı dosya,
 *     notes alanı olmayan Done kart, değersiz argüman, geçersiz takvim günü, beklenmeyen kayıt biçimi.
 *
 * ÇIKIŞ KODU: 0 notsuz teslim yok · 1 notsuz (ya da --kanit-zorunlu ile kanıtsız) teslim var · 2 veri okunamadı/eksik.
 * Kapsam sınırı: yalnız Done kolonundaki kartı sayar; hiç Done'a çekilmemiş teslim (kart Backlog'da kalmış, PR birleşmiş) görünmez.
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const REPO = path.resolve(__dirname, '..', '..')
const DISA_AKTAR = path.join(REPO, 'scripts', 'nlm', 'kanban_disa_aktar.py')
const GUN_DILIMI = 'Europe/Istanbul'
const MIN_NOT = 10
const SISTEM_YAZAR = 'system'
/** Harf ya da rakam sayacı (Unicode): nokta, boşluk, sıfır genişlikli karakter ve emoji sayılmaz. */
const HARF_RAKAM = /[\p{L}\p{N}]/gu
/**
 * Kanıt izi: ok işareti; "KANIT:"/"Kanıt:" (iki yazım, iki nokta zorunlu: "kanıtsız" kanıt değildir); #PR numarası (3-5 hane: "#12" değil);
 * "PR 1786"; ya da en az bir rakam VE en az bir a-f harfi içeren 7-40 karakterlik onaltılı commit kısaltması (salt rakamlı tarih "20261009" değil).
 */
const KANIT_IZI = /→|\bkan[ıi]t\s*:|#\d{3,5}\b|\bPR\s*\d{3,5}\b|\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/i

class VeriHatasi extends Error {}

/** ISO zaman damgasının Europe/Istanbul takvim günü (YYYY-MM-DD); çözülemezse null. */
function gunAdi(iso) {
  if (!iso) return null
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return null
  return new Intl.DateTimeFormat('en-CA', { timeZone: GUN_DILIMI, year: 'numeric', month: '2-digit', day: '2-digit' }).format(t)
}

function bugun(simdi = new Date()) {
  return gunAdi(simdi.toISOString())
}

/** YYYY-MM-DD biçimi VE gerçek takvim günü ("2026-13-45" değil). */
function gunGecerli(gun) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(gun || '')) return false
  const t = new Date(`${gun}T00:00:00Z`)
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === gun
}

/** Bir not "dolu not" mu: yazarı sistem değil (boşluk/büyük harf duyarsız), en az MIN_NOT harf/rakam. */
function notSayilir(not) {
  if (!not || typeof not !== 'object') return false
  if (String(not.author || '').trim().toLowerCase() === SISTEM_YAZAR) return false
  return (String(not.content || '').match(HARF_RAKAM) || []).length >= MIN_NOT
}

function kanitVar(not) {
  return KANIT_IZI.test(String(not.content || ''))
}

/** Kart etiketi: numara + (varsa) kısa kimlik; numara tekil değil (10-09: 75 numara birden fazla kartta). */
function etiket(k) {
  const no = k.identifier || '?'
  return k.id ? `${no} [${String(k.id).slice(0, 8)}]` : no
}

/** Done'a geçiş anı ve kaynağı: completedAt > doneAt > sonAnlamli (tarihsiz). */
function doneGunu(k) {
  const g1 = gunAdi(k.completedAt)
  if (g1) return { gun: g1, tarihsiz: false }
  const g2 = gunAdi(k.doneAt)
  if (g2) return { gun: g2, tarihsiz: false }
  return { gun: gunAdi(k.sonAnlamli), tarihsiz: true }
}

/**
 * kayitlar: kanban_disa_aktar.py --tam çıktısındaki `kayitlar[]`. Dönen: şerit → {done, notsuz, kanitsiz, tarihsiz} (kart etiketi listeleri).
 * Done olup notes alanı olmayan kart VeriHatasi fırlatır (sessizlik "notsuz yok" sayılmasın).
 */
function say(kayitlar, gun) {
  const seritler = {}
  for (const k of kayitlar) {
    if (!k || typeof k !== 'object') throw new VeriHatasi('kayitlar[] içinde kayıt olmayan öğe var')
    if (k.status !== 'Done') continue
    const { gun: donenGun, tarihsiz } = doneGunu(k)
    if (donenGun !== gun) continue
    if (!Array.isArray(k.notes)) {
      throw new VeriHatasi(`${k.identifier}: notes alanı yok — dışa aktarım --tam ile alınmalı`)
    }
    const s = (seritler[k.serit || 'BILINMEYEN'] ||= { done: [], notsuz: [], kanitsiz: [], tarihsiz: [] })
    const e = etiket(k)
    s.done.push(e)
    if (tarihsiz) s.tarihsiz.push(e)
    const bugunNotlari = k.notes.filter((n) => notSayilir(n) && gunAdi(n.createdAt) === gun)
    if (bugunNotlari.length === 0) s.notsuz.push(e)
    else if (!bugunNotlari.some(kanitVar)) s.kanitsiz.push(e)
  }
  return seritler
}

function ozetle(seritler, secenek = {}) {
  let notsuz = 0
  let kanitsiz = 0
  let done = 0
  for (const s of Object.values(seritler)) {
    done += s.done.length
    notsuz += s.notsuz.length
    kanitsiz += s.kanitsiz.length
  }
  const eksik = notsuz + (secenek.kanitZorunlu ? kanitsiz : 0)
  return { done, notsuz, kanitsiz, eksik, cikis: eksik > 0 ? 1 : 0 }
}

function satirlar(seritler, gun) {
  const adlar = Object.keys(seritler).sort()
  if (adlar.length === 0) return [`${gun}: bugün Done'a geçen kart yok.`]
  return adlar.map((ad) => {
    const s = seritler[ad]
    let satir = `${ad}: Done(bugün) ${s.done.length}, notsuz ${s.notsuz.length}${s.notsuz.length ? `: ${s.notsuz.join(', ')}` : ''}`
    if (s.kanitsiz.length) satir += ` · kanıt izi yok ${s.kanitsiz.length}: ${s.kanitsiz.join(', ')}`
    if (s.tarihsiz.length) satir += ` · Done tarihi yok (sonAnlamli ile sayıldı, yaklaşık): ${s.tarihsiz.join(', ')}`
    return satir
  })
}

/** Dışa aktarım metnini çöz ve ölçülebilirlik şartlarını denetle; sağlam değilse VeriHatasi (çıkış 2). */
function kayitlariCoz(metin, gun) {
  let d
  try {
    d = JSON.parse(metin)
  } catch (e) {
    throw new VeriHatasi(`JSON çözülemedi: ${String(e.message).split('\n')[0].slice(0, 60)}`)
  }
  if (!d || !Array.isArray(d.kayitlar)) throw new VeriHatasi('kayitlar[] yok — kanban_disa_aktar.py çıktısı değil')
  if (d.kayitlar.length === 0) throw new VeriHatasi('kayitlar[] boş — dışa aktarım hiç kart vermedi (ölçülemedi, "temiz" değil)')
  if (d.kayitlar.some((k) => !k || typeof k !== 'object')) throw new VeriHatasi('kayitlar[] içinde kayıt olmayan öğe var')
  if (!d.kayitlar.some((k) => k.status === 'Done')) throw new VeriHatasi('veride hiç Done kartı yok — durum eşlemesi bozulmuş olabilir (ölçülemedi)')
  if (gun && d.damga) {
    const damgaGunu = gunAdi(d.damga)
    if (damgaGunu !== null && damgaGunu < gun) {
      throw new VeriHatasi(`dışa aktarım damgası (${d.damga}) istenen günden (${gun}) eski — bayat dosya, yeniden alın`)
    }
  }
  return d.kayitlar
}

function dosyadanOku(yol, gun) {
  let metin
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch (e) {
    throw new VeriHatasi(`dosya okunamadı: ${yol} (${e.code || 'hata'})`)
  }
  return kayitlariCoz(metin, gun)
}

function canlidanOku(gun) {
  for (const py of ['python', 'python3']) {
    const r = spawnSync(py, [DISA_AKTAR, '--tam'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 120000 })
    if (r.error && r.error.code === 'ENOENT') continue
    if (r.error) throw new VeriHatasi(`${py} çalıştırılamadı: ${r.error.message}`)
    if (r.status !== 0) throw new VeriHatasi(`dışa aktarım çıkış ${r.status}: ${(r.stderr || '').trim().split('\n').pop()}`)
    return kayitlariCoz(r.stdout, gun)
  }
  throw new VeriHatasi('python bulunamadı (python ya da python3 PATH içinde olmalı)')
}

function argumanlar(argv) {
  const a = { gun: null, dosya: null, json: false, kanitZorunlu: false }
  const deger = (i, ad) => {
    const v = argv[i + 1]
    if (v === undefined || v.startsWith('--')) throw new VeriHatasi(`${ad} bir değer ister`)
    return v
  }
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i]
    if (x === '--gun') a.gun = deger(i++, x)
    else if (x === '--dosya') a.dosya = deger(i++, x)
    else if (x === '--json') a.json = true
    else if (x === '--kanit-zorunlu') a.kanitZorunlu = true
    else throw new VeriHatasi(`bilinmeyen argüman: ${x}`)
  }
  if (a.gun !== null && !gunGecerli(a.gun)) throw new VeriHatasi('--gun geçerli bir takvim günü olmalı (YYYY-MM-DD)')
  return a
}

function main(argv) {
  try {
    const a = argumanlar(argv)
    const gun = a.gun || bugun()
    const kayitlar = a.dosya ? dosyadanOku(a.dosya, gun) : canlidanOku(gun)
    const bilinmeyen = kayitlar.filter((k) => k.status === '?').length
    if (bilinmeyen) process.stderr.write(`UYARI: ${bilinmeyen} kart bilinmeyen Kanban kolonunda (durum eşlemesi eksik olabilir)\n`)
    const seritler = say(kayitlar, gun)
    const ozet = ozetle(seritler, { kanitZorunlu: a.kanitZorunlu })
    if (a.json) {
      process.stdout.write(`${JSON.stringify({ gun, seritler, ozet }, null, 2)}\n`)
    } else {
      process.stdout.write(`${satirlar(seritler, gun).join('\n')}\n`)
      process.stdout.write(`TOPLAM ${gun}: Done ${ozet.done}, notsuz ${ozet.notsuz}, kanıt izi yok ${ozet.kanitsiz}\n`)
    }
    return ozet.cikis
  } catch (e) {
    // Beklenmeyen istisna "notsuz var" (1) ile karışmasın: ölçülemedi = 2.
    process.stderr.write(`HATA${e instanceof VeriHatasi ? '' : ' (beklenmeyen)'}: ${e.message}\n`)
    return 2
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { gunAdi, gunGecerli, bugun, notSayilir, kanitVar, etiket, doneGunu, say, ozetle, satirlar, kayitlariCoz, main, MIN_NOT, VeriHatasi }
