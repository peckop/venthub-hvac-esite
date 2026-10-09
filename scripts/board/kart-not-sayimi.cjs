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
 * "Bugün Done oldu" = `completedAt` (sonAnlamli DEĞİL: eski karta bugün düşülen not onu bugüne taşırdı). completedAt'i boş
 * Done kart varsa sonAnlamli'ya düşülür ve satırda "completedAt yok" diye BELİRTİLİR (sessiz varsayım yok).
 *
 * KURALLAR:
 *   · Not sayılır: yazarı `system` değil (kira bırakma satırları not değildir) ve boşluksuz uzunluğu >= 10 karakter (MIN_NOT).
 *   · Kanıt izi (v2): nottaki "→", "KANIT", "#<PR no>", PR no ya da 7+ karakterlik commit kısaltması. Varsayılanda yalnız
 *     RAPORLANIR; --kanit-zorunlu ile notsuz gibi çıkış kodunu etkiler.
 *   · Ölçülemeyen hal sessiz geçmez: Done kartında `notes` alanı yoksa (dışa aktarım --tam'sız alınmış) çıkış 2.
 *
 * ÇIKIŞ KODU: 0 notsuz teslim yok · 1 notsuz (ya da --kanit-zorunlu ile kanıtsız) teslim var · 2 veri okunamadı/eksik.
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const REPO = path.resolve(__dirname, '..', '..')
const DISA_AKTAR = path.join(REPO, 'scripts', 'nlm', 'kanban_disa_aktar.py')
const GUN_DILIMI = 'Europe/Istanbul'
const MIN_NOT = 10
const SISTEM_YAZAR = 'system'
/** Kanıt izi: ok işareti, KANIT sözcüğü, #PR numarası, "PR 1234" ya da en az bir rakam içeren 7-40 karakterlik onaltılı commit kısaltması. */
const KANIT_IZI = /→|KANIT|#\d{2,5}\b|\bPR\s*\d{2,5}\b|\b(?=[0-9a-f]*\d)[0-9a-f]{7,40}\b/i

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

/** Bir not "dolu not" mu: sistem satırı değil, boşluksuz uzunluk eşiğin üstünde. */
function notSayilir(not) {
  if (!not || typeof not !== 'object') return false
  if (String(not.author || '').toLowerCase() === SISTEM_YAZAR) return false
  return String(not.content || '').replace(/\s+/g, '').length >= MIN_NOT
}

function kanitVar(not) {
  return KANIT_IZI.test(String(not.content || ''))
}

/**
 * kayitlar: kanban_disa_aktar.py --tam çıktısındaki `kayitlar[]`. Dönen: şerit → {done, notsuz, kanitsiz, tarihsiz} (kart numarası listeleri).
 * Done olup notes alanı olmayan kart VeriHatasi fırlatır (sessizlik "notsuz yok" sayılmasın).
 */
function say(kayitlar, gun) {
  const seritler = {}
  for (const k of kayitlar) {
    if (k.status !== 'Done') continue
    const tamamlandi = gunAdi(k.completedAt)
    const tarihsiz = tamamlandi === null
    const donenGun = tarihsiz ? gunAdi(k.sonAnlamli) : tamamlandi
    if (donenGun !== gun) continue
    if (!Array.isArray(k.notes)) {
      throw new VeriHatasi(`${k.identifier}: notes alanı yok — dışa aktarım --tam ile alınmalı`)
    }
    const s = (seritler[k.serit] ||= { done: [], notsuz: [], kanitsiz: [], tarihsiz: [] })
    s.done.push(k.identifier)
    if (tarihsiz) s.tarihsiz.push(k.identifier)
    const bugunNotlari = k.notes.filter((n) => notSayilir(n) && gunAdi(n.createdAt) === gun)
    if (bugunNotlari.length === 0) s.notsuz.push(k.identifier)
    else if (!bugunNotlari.some(kanitVar)) s.kanitsiz.push(k.identifier)
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
    if (s.tarihsiz.length) satir += ` · completedAt yok (sonAnlamli ile sayıldı): ${s.tarihsiz.join(', ')}`
    return satir
  })
}

function dosyadanOku(yol) {
  let metin
  try {
    metin = fs.readFileSync(yol, 'utf8')
  } catch (e) {
    throw new VeriHatasi(`dosya okunamadı: ${yol} (${e.message})`)
  }
  return kayitlariCoz(metin)
}

function kayitlariCoz(metin) {
  let d
  try {
    d = JSON.parse(metin)
  } catch (e) {
    throw new VeriHatasi(`JSON çözülemedi: ${e.message}`)
  }
  if (!d || !Array.isArray(d.kayitlar)) throw new VeriHatasi('kayitlar[] yok — kanban_disa_aktar.py çıktısı değil')
  return d.kayitlar
}

function canlidanOku() {
  for (const py of ['python', 'python3']) {
    const r = spawnSync(py, [DISA_AKTAR, '--tam'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 120000 })
    if (r.error && r.error.code === 'ENOENT') continue
    if (r.error) throw new VeriHatasi(`${py} çalıştırılamadı: ${r.error.message}`)
    if (r.status !== 0) throw new VeriHatasi(`dışa aktarım çıkış ${r.status}: ${(r.stderr || '').trim().split('\n').pop()}`)
    return kayitlariCoz(r.stdout)
  }
  throw new VeriHatasi('python bulunamadı (python ya da python3 PATH içinde olmalı)')
}

function argumanlar(argv) {
  const a = { gun: null, dosya: null, json: false, kanitZorunlu: false }
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i]
    if (x === '--gun') a.gun = argv[++i]
    else if (x === '--dosya') a.dosya = argv[++i]
    else if (x === '--json') a.json = true
    else if (x === '--kanit-zorunlu') a.kanitZorunlu = true
    else throw new VeriHatasi(`bilinmeyen argüman: ${x}`)
  }
  if (a.gun !== null && !/^\d{4}-\d{2}-\d{2}$/.test(a.gun || '')) throw new VeriHatasi('--gun YYYY-MM-DD biçiminde olmalı')
  return a
}

function main(argv) {
  try {
    const a = argumanlar(argv)
    const gun = a.gun || bugun()
    const kayitlar = a.dosya ? dosyadanOku(a.dosya) : canlidanOku()
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
    if (!(e instanceof VeriHatasi)) throw e
    process.stderr.write(`HATA: ${e.message}\n`)
    return 2
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { gunAdi, bugun, notSayilir, kanitVar, say, ozetle, satirlar, kayitlariCoz, main, MIN_NOT, VeriHatasi }
