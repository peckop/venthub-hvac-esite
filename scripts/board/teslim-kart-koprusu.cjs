#!/usr/bin/env node
'use strict'

/**
 * TESLİM-KART KÖPRÜSÜ (HRT-47, OPS 10-09 "teslim-kart köprüsü: EVET"; cetvel: docs/standards/is-kayit-duzeni-standard.md "Teslim notu").
 *
 * NİÇİN VAR: kart-not-sayimi.cjs (HRT-44) yalnız Done kolonundaki kartı görür. 10-09'da URUN'un dört teslimi (#1774 URN-58, #1752 REC-491,
 * #1766 URN-72, #1754 URN-57) master'a girdi, kartları Backlog'da kaldı ve hiçbirinde not yoktu: sayaç bunları göremedi. Bu betik ters yönden
 * bakar: bugün master'a giren her PR'ın numarası (ya da commit kısaltması) bugün yazılmış bir kart notunda geçiyor mu?
 *
 * KULLANIM (yerelde; CI'da KOŞMAZ: Kanban verisi git dışıdır, depo public):
 *   node scripts/board/teslim-kart-koprusu.cjs                      (bugün, Europe/Istanbul günü; canlı Kanban + origin/master)
 *   node scripts/board/teslim-kart-koprusu.cjs --gun 2026-10-09 [--json]
 *   node scripts/board/teslim-kart-koprusu.cjs --dosya <disa-aktar --tam çıktısı.json> --log-dosya <"kısa|başlık" satırları>   (test/elle)
 *   node scripts/board/teslim-kart-koprusu.cjs --repo <git dizini> --fetch-yok                                                   (test)
 *
 * ÖLÇÜ: "teslim" = origin/master'da başlığı "(#N)" ile biten commit (PR birleştirmesi). Not = kart-not-sayimi.cjs ile AYNI kural (yazarı
 * system değil, en az 10 harf/rakam, teslim GÜNÜNDE yazılmış). Teslim "kartlı" sayılır: PR numarası `#N` (tam eşleşme: #17, #1786'yı
 * karşılamaz), `PR N`, `pull/N` ya da tek başına duran 7+ karakterlik commit kısaltması (salt rakamlıysa yalnız tamamı; "1234567 TL" bir
 * kısaltma değildir) HERHANGİ bir kartın bugünkü notunda geçiyorsa. Not başka kartta da olabilir; numaranın doğru karta yazıldığı
 * ölçülmez. Başlıktaki kart numarası (harf sonekli "ALT-37e" dahil) yalnız raporda sahibi bulmak içindir.
 * Gün sınırı: [gün 00:00:00, gün 23:59:59] +03:00, İKİ ucu da kapsayıcı; sonraki günün 00:00:00 damgalı commit'i o günün sayılır.
 * Çıktı departman (başlığın ilk sözcüğü) başına: "URUN: Teslim 8, kart notunda geçmeyen 4: #1774 (URN-58), ...".
 * PR numarasız commit (doğrudan master) ve bot PR'ı (başlığı "chore(deps…):" ya da "chore(ci…):" ile başlayan dependabot birleştirmesi)
 * ayrı SAYILIR, teslim/notsuz toplamına girmez ve çıkış kodunu etkilemez.
 *
 * ÖLÇÜLEMEDİ ≠ TEMİZ (çıkış 2): origin/master okunamadı/taze değil (fetch başarısız), o gün hiç commit yok (log boş), Kanban verisi okunamadı,
 * bayat dışa aktarım, geçersiz argüman.
 *
 * ÇIKIŞ KODU: 0 notsuz teslim yok · 1 en az bir teslim kart notunda geçmiyor · 2 ölçülemedi.
 */

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const K = require('./kart-not-sayimi.cjs')

const REPO = path.resolve(__dirname, '..', '..')
const { VeriHatasi, gunAdi, gunGecerli, bugun, notSayilir } = K
/** Kart numarası, tek harf sonekli olanlar dahil ("ALT-37e", "TSR-10b": 10-08'de üç PR sonek yüzünden kartsız göründü). */
const KART_NO = /\b([A-Z]{2,5}-\d+[a-z]?)\b/
const PR_SONU = /\(#(\d{2,6})\)\s*$/
/**
 * Bot PR'ı (dependabot): başlık "chore(deps…):", "chore(ci…):" ya da "chore(tools…):" ile başlar (10-08: #1749, #1695; "tools" =
 * tools/wrongstack-mcp, Pazartesi 06:00). Önekler .github/dependabot.yml'deki `commit-message.prefix` değerleridir (üç ekosistem, üç önek).
 * Sahibi bir departman değil, kartı yok; PR numarasız commit gibi AYRI satırda sayılır ve çıkış kodunu etkilemez (OPS kararı, 10-10).
 */
const BOT_BASLIK = /^chore\((?:deps|ci|tools)[^)]*\)\s*:/i
/** Commit kısaltması en az bu kadar karakter (git %h) olmalı; daha kısası PR anmaz. */
const KISA_MIN = 7
/** Metindeki 7-40 karakterlik onaltılık sözcükler (harf ya da rakama bitişik olmayan): commit kısaltması adayı. */
const HEX_SOZCUK = /(?<![0-9A-Za-z])[0-9a-f]{7,40}(?![0-9A-Za-z])/gi
/** Türkçe büyük harf katlama: "HARİTA" ve "HARITA" aynı departman. */
const DEPARTMAN_ASCII = { İ: 'I', Ş: 'S', Ğ: 'G', Ü: 'U', Ö: 'O', Ç: 'C' }

function departman(baslik) {
  const ilk = String(baslik).trim().split(/[\s(:]/)[0] || '?'
  // Önce büyüt, sonra katla: küçük harfli "ürün" de "URUN" olur ("İ" büyütmede değişmez, katlamada "I" olur).
  return ilk.toUpperCase().replace(/[İŞĞÜÖÇ]/g, (c) => DEPARTMAN_ASCII[c])
}

/** "kısa|başlık" satırlarından teslim listesi. PR numarasız commit ve bot PR'ı (dependabot) ayrı döner. */
function teslimleriCoz(satirlar) {
  const teslimler = []
  const prSiz = []
  const botlar = []
  for (const satir of satirlar) {
    if (!satir.trim()) continue
    const i = satir.indexOf('|')
    if (i < 1) throw new VeriHatasi(`git günlüğü satırı "kısa|başlık" biçiminde değil: ${satir.slice(0, 40)}`)
    const kisa = satir.slice(0, i).trim()
    const baslik = satir.slice(i + 1).trim()
    const pr = baslik.match(PR_SONU)
    const kart = (baslik.match(KART_NO) || [])[1] || null
    if (!pr) prSiz.push({ kisa, baslik, departman: departman(baslik), kart })
    else if (BOT_BASLIK.test(baslik)) botlar.push({ kisa, baslik, pr: pr[1] })
    else teslimler.push({ kisa, baslik, pr: pr[1], departman: departman(baslik), kart })
  }
  return { teslimler, prSiz, botlar }
}

/**
 * Metin bu teslimi anıyor mu: #N (tam eşleşme), "PR N", "pull/N" ya da commit kısaltması.
 * Kısaltma TEK BAŞINA duran bir sözcük olmalı ve teslimin %h değeriyle öneki paylaşmalı (not kısaltılmış ya da daha uzun sha yazmış olabilir);
 * başka bir sözcüğün ortasındaki parça anmak sayılmaz. Salt rakamdan oluşan sözcük tutar/sayı olabilir: yalnız kısaltmanın TAMAMI
 * (ya da daha uzun sha) anar. Yanlış "anıldı" sessizce temiz görünür, yanlış "anılmadı" gürültü yapar: belirsizlikte ikincisi seçilir.
 */
function notAniyor(metin, teslim) {
  const m = String(metin)
  const n = teslim.pr
  if (new RegExp(`(?<![0-9A-Za-z])#${n}(?![0-9])`).test(m)) return true
  if (new RegExp(`\\bPR\\s*#?${n}(?![0-9])`, 'i').test(m)) return true
  if (new RegExp(`/pull/${n}(?![0-9])`).test(m)) return true
  const kisa = String(teslim.kisa).toLowerCase()
  if (kisa.length < KISA_MIN) return false
  return (m.match(HEX_SOZCUK) || []).some((p) => {
    const s = p.toLowerCase()
    if (/^[0-9]+$/.test(s)) return s.startsWith(kisa)
    return s.startsWith(kisa) || kisa.startsWith(s)
  })
}

/** O gün (TR) yazılmış dolu, sistem dışı tüm notların metni. */
function gununNotlari(kayitlar, gun) {
  const metinler = []
  for (const k of kayitlar) {
    if (!k || !Array.isArray(k.notes)) continue
    for (const n of k.notes) if (notSayilir(n) && gunAdi(n.createdAt) === gun) metinler.push(String(n.content))
  }
  return metinler
}

function olc(kayitlar, satirlar, gun) {
  const { teslimler, prSiz, botlar } = teslimleriCoz(satirlar)
  const notlar = gununNotlari(kayitlar, gun)
  const departmanlar = {}
  for (const t of teslimler) {
    const d = (departmanlar[t.departman] ||= { teslim: 0, notsuz: [] })
    d.teslim += 1
    if (!notlar.some((m) => notAniyor(m, t))) d.notsuz.push({ pr: t.pr, kart: t.kart, kisa: t.kisa })
  }
  const notsuz = Object.values(departmanlar).reduce((a, d) => a + d.notsuz.length, 0)
  return { gun, teslim: teslimler.length, notsuz, departmanlar, prSiz, botlar, cikis: notsuz > 0 ? 1 : 0 }
}

function satirlariYaz(sonuc) {
  const adlar = Object.keys(sonuc.departmanlar).sort()
  const cikti = adlar.map((ad) => {
    const d = sonuc.departmanlar[ad]
    const liste = d.notsuz.map((t) => `#${t.pr}${t.kart ? ` (${t.kart})` : ''}`).join(', ')
    return `${ad}: Teslim ${d.teslim}, kart notunda geçmeyen ${d.notsuz.length}${d.notsuz.length ? `: ${liste}` : ''}`
  })
  if (sonuc.prSiz.length) {
    cikti.push(`PR numarasız commit ${sonuc.prSiz.length} (çıkış kodunu etkilemez): ${sonuc.prSiz.map((c) => c.kisa).join(', ')}`)
  }
  if (sonuc.botlar.length) {
    cikti.push(`Bot PR ${sonuc.botlar.length} (dependabot; teslim sayılmaz, çıkış kodunu etkilemez): ${sonuc.botlar.map((b) => `#${b.pr}`).join(', ')}`)
  }
  cikti.push(`TOPLAM ${sonuc.gun}: Teslim ${sonuc.teslim}, kart notunda geçmeyen ${sonuc.notsuz}`)
  return cikti
}

/** origin/master'ın TR gününe düşen "kısa|başlık" satırları. Okunamazsa ya da boşsa VeriHatasi (ölçülemedi ≠ temiz). */
function gitGunlugu(gun, repo, fetchYok) {
  const git = (...a) => spawnSync('git', ['-C', repo, ...a], { encoding: 'utf8', timeout: 60000 })
  if (!fetchYok) {
    const f = git('fetch', 'origin', 'master', '--quiet')
    if (f.status !== 0) throw new VeriHatasi(`git fetch origin master başarısız (origin/master taze değil): ${(f.stderr || '').trim().split('\n').pop()}`)
  }
  // git --since ve --until İKİSİ de kapsayıcıdır: sonraki günün 00:00:00 damgalı commit'i iki günde birden sayılırdı.
  // Bitiş, sonraki günün başından bir saniye önce (git zaman damgası saniye çözünürlüklüdür).
  const bitis = new Date(`${gun}T00:00:00+03:00`)
  bitis.setUTCDate(bitis.getUTCDate() + 1)
  bitis.setUTCSeconds(bitis.getUTCSeconds() - 1)
  const r = git('log', 'origin/master', `--since=${gun}T00:00:00+03:00`, `--until=${bitis.toISOString()}`, '--format=%h|%s')
  if (r.status !== 0) throw new VeriHatasi(`git log origin/master okunamadı: ${(r.stderr || '').trim().split('\n').pop()}`)
  const satirlar = r.stdout.split('\n').filter(Boolean)
  if (satirlar.length === 0) throw new VeriHatasi(`origin/master'da ${gun} günü hiç commit yok — ölçülemedi ("temiz" değil)`)
  return satirlar
}

function argumanlar(argv) {
  const a = { gun: null, dosya: null, logDosya: null, repo: REPO, fetchYok: false, json: false }
  const deger = (i, ad) => {
    const v = argv[i + 1]
    if (v === undefined || v.startsWith('--')) throw new VeriHatasi(`${ad} bir değer ister`)
    return v
  }
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i]
    if (x === '--gun') a.gun = deger(i++, x)
    else if (x === '--dosya') a.dosya = deger(i++, x)
    else if (x === '--log-dosya') a.logDosya = deger(i++, x)
    else if (x === '--repo') a.repo = deger(i++, x)
    else if (x === '--fetch-yok') a.fetchYok = true
    else if (x === '--json') a.json = true
    else throw new VeriHatasi(`bilinmeyen argüman: ${x}`)
  }
  if (a.gun !== null && !gunGecerli(a.gun)) throw new VeriHatasi('--gun geçerli bir takvim günü olmalı (YYYY-MM-DD)')
  return a
}

function logOku(yol) {
  try {
    const satirlar = fs.readFileSync(yol, 'utf8').split(/\r?\n/).filter(Boolean)
    if (satirlar.length === 0) throw new VeriHatasi(`git günlüğü dosyası boş: ${yol}`)
    return satirlar
  } catch (e) {
    if (e instanceof VeriHatasi) throw e
    throw new VeriHatasi(`günlük dosyası okunamadı: ${yol} (${e.code || 'hata'})`)
  }
}

/**
 * Not verisi: --tam dışa aktarımı. Okuyucu kart-not-sayimi.cjs'inkidir (python/py döngüsü, kayıt boşluğu, bayatlık: tek kopya;
 * iki kopya 10-10'da `python3` düzeltmesini iki yerde yaptırmıştı). Köprü Done dışı kartları da görür, bu yüzden "en az bir Done" şartı kapalı.
 */
function kanbanOku(a, gun) {
  const secenek = { doneSart: false }
  return a.dosya ? K.dosyadanOku(a.dosya, gun, secenek) : K.canlidanOku(gun, secenek)
}

/** `simdi` yalnız test içindir (varsayılan gün saat dilimi sınırında sınanabilsin diye saat dışarıdan verilir). */
function main(argv, simdi = new Date()) {
  try {
    const a = argumanlar(argv)
    const gun = a.gun || bugun(simdi)
    const satirlar = a.logDosya ? logOku(a.logDosya) : gitGunlugu(gun, a.repo, a.fetchYok)
    const kayitlar = kanbanOku(a, gun)
    const sonuc = olc(kayitlar, satirlar, gun)
    if (a.json) process.stdout.write(`${JSON.stringify(sonuc, null, 2)}\n`)
    else process.stdout.write(`${satirlariYaz(sonuc).join('\n')}\n`)
    return sonuc.cikis
  } catch (e) {
    process.stderr.write(`HATA${e instanceof VeriHatasi ? '' : ' (beklenmeyen)'}: ${e.message}\n`)
    return 2
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { departman, teslimleriCoz, notAniyor, gununNotlari, olc, satirlariYaz, gitGunlugu, main }
