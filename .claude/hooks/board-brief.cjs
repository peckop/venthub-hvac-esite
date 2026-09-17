#!/usr/bin/env node
/**
 * UserPromptSubmit hook — SESSİZ pano brifingi + kira yenileme.
 *
 * Amaç: "eş controller ne yapıyor?" sorusunun cevabı, sormaya gerek kalmadan bağlamda olsun.
 * Bu, Recep'i mesaj taşıyıcısı olmaktan çıkaran katman.
 *
 * SESSİZLİK KURALI: söyleyecek bir şey yoksa HİÇBİR ŞEY yazmaz. Her tura birkaç satır
 * eklemek bağlamı kirletir ve zamanla okunmaz hâle gelir; bu yüzden yalnız (a) başka bir
 * oturumun canlı şeridi varsa ya da (b) OKUNMAMIŞ not varsa konuşur. Teslim edilen notlar
 * `seen` ile işaretlenir — aksi hâlde aynı not sonsuza dek basılır ve kural kendi kendini
 * bozar.
 *
 * KALP ATIŞI burada: kira modeli atış olmadan çalışmaz, atışı elle yapmayı beklemek
 * "hatırlamaya bağlı adım"ı katmanın merkezine geri koyar. Bu kanca zaten her turda
 * koşuyor ve oturum kendi dosyasına yazıyor (çekişme yok) → atışın doğal yeri.
 *
 * stdin: { session_id, ... } · stdout: hookSpecificOutput.additionalContext
 */
const fs = require('fs')
const path = require('path')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { process.exit(0) }

const sid = input.session_id || ''
if (!sid) process.exit(0)

let board
try {
  board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch { process.exit(0) } // pano yoksa sessizce geç (koordinasyon katmanı fail-open)

/** Loop hatırlatması bu yaştan sonra susar — sürekli nag etmesin (T085-VH). */
const LOOP_HATIRLATMA_PENCERESI_MS = 2 * 60 * 60 * 1000

let hepsi = []
let notes = []
let seritAldiMi = true
try {
  board.touch(sid) // kirayı yenile (aralık board.cjs'te kısılı)
  const events = board.readEvents()
  // BAYAT şeritler de gelsin: "listede yok" ile "sahipsiz kaldı" ayrı şeyler (T084-VH).
  hepsi = board.tumTalepler()
  const mine = hepsi.find(c => c.sid === sid)
  notes = board.notesFor(sid, mine && mine.lane, events)
  // Bu oturum HİÇ şerit talep etmiş mi? (TTL'e değil GEÇMİŞE bakıyoruz: bir kez claim
  // ettiyse loop'unu kurmuş sayılır, bayatlasa bile hatırlatma tekrar açılmasın.)
  const benim = events.filter(e => e.sid === sid)
  seritAldiMi = benim.some(e => e.type === 'claim')
  if (!seritAldiMi && benim.length > 0) {
    const ilk = Math.min(...benim.map(e => Date.parse(e.ts)).filter(Number.isFinite))
    if (Number.isFinite(ilk) && Date.now() - ilk > LOOP_HATIRLATMA_PENCERESI_MS) seritAldiMi = true
  }
} catch (e) {
  process.stderr.write(`[board-brief] pano okunamadı (fail-open): ${e && e.message}\n`)
  process.exit(0)
}

const others = hepsi.filter(c => c.sid !== sid)
// SESSİZLİK KURALINA EK (T085-VH): şerit almamış TAZE oturum, pano boş olsa bile loop
// hatırlatmasını almalı — Recep'in sabah "günaydın" yazıp başka hiçbir şey yazmaması için
// komutu İNSAN değil bu kanca taşıyor. Şerit alınınca hatırlatma kendiliğinden kapanır.

// ⛔MEKANIZMA SATIRI KALDIRILDI (REC-328, Recep karari 2026-09-14, kendi sozu "1").
//
// Eskiden burada her turda "gozcun KANITLANMADI / TESLIMAT kanitin bayat" uyarisi basilirdi
// ve ajani `mechanism-setup.cjs plan|prob|dogrula` ucluusunu kurmaya yollardi. Uclu EMEKLI:
// filo artik DOGRUDAN MESAJLA calisir (SendMessage + notify_when_idle), pano ise not kutusu
// degil yalniz CLAIM + CANLILIK yuzeyidir.
//
// NICIN KALDIRILDI — olculdu 2026-09-14:
//   · Gozcu bugune kadar TEK BIR NOT yakalamadi; pano SES sutunu iki serit icin de
//     ~2700 dk (45 saat) SESSIZ. Yani uyari, var olmayan bir kanalin bekciligini yapiyordu.
//   · Lider oturumun (OPS) TARAMA katmani ASILMIS ve TESLIM kaniti 6955 dk (~4,8 gun) bayatti;
//     filo o sure boyunca kayipsiz calisti — butun emirler SendMessage ile gitti.
//   · ALTYAPI gozcusu KAPATILDIKTAN SONRA pano `who` canliligi 0 dk kaldi: canlilik
//     CLAIM ATISINDAN gelir, gozcuden DEGIL. Yani bu satirin korudugu sey zaten korunuyordu.
//
// Her turda basilan ve hicbir seyi yakalamayan bir uyari, ucuncu gunde bakilmayan bir uyaridir
// ([[yesil-kapi-gorundugunu-kanitlamaz]] dersinin aynadaki hali: kirmizi da bakmadigi seyi
// kanitlamaz). Cetvel: docs/standards/fleet-mechanism-standard.md.
//
// ⭐LINEAR YENI-YORUM SAYACI (REC-329) — Recep karari 2026-09-14 ("3. evet").
//
// NICIN BURADA: Design seritleri kararlarini Linear PROJE yorumlarina yaziyor ve o
// yuzey PASIF — kimse bakmazsa bekler. Olculen bedel: 2026-09-09'da iki Design mesaji
// 1,5 saat, 2026-09-13 18:23Z'deki DESIGN-KATALOG teslim yorumlari 13+ saat cevapsiz
// kaldi. Emekli edilen gozcu uclusu (REC-328) Linear'a HIC bakmiyordu; bu bosluk yeni
// degil, HIC KAPATILMAMISTI.
//
// ⭐CETVEL AYRIMI (fleet-mechanism-standard v2.0): PASIF kanal mekanizma ister, ITICI
// kanal istemez. Linear yorumu pasif bir kutu -> mekanizma hak ediyor. Ama bu GOZCU
// DEGIL: surec kurmaz, cron kurmaz, Monitor kurmaz. Zaten kosan bu kancanin icinde TEK
// sorgu, TEK satir, 60 sn onbellek. "Linear yorum sayaci = kanca, gozcu degil."
//
// ⚠SESSIZLIK KURALINDAN ONCE hesaplaniyor ve kurala DAHIL: pano sessiz oldugunda da
// bu satir akmali, cunku itilmesi gereken sey tam olarak o. Once yazdigim sirada
// satir sessizlik kontrolunun ALTINDA kaliyordu ve pano bos oldugunda HIC basilmiyordu
// — yani en cok gerektigi anda susuyordu.
let linearSatiri = null
try {
  linearSatiri = require('../../scripts/board/linear-yeni-yorum.cjs')
} catch {
  linearSatiri = null // betik yok/bozuk: sayac YOK, kanca calismaya devam eder
}

async function linearCizgisi() {
  if (!linearSatiri || typeof linearSatiri.satir !== 'function') return null
  try {
    return await linearSatiri.satir()
  } catch {
    return null // anahtar yok / ag yok / zaman asimi: SESSIZ, hata basmaz
  }
}

void (async () => {
const linear = await linearCizgisi()

// SESSIZLIK KURALI KORUNDU: pano bos + serit alinmis + Linear'da yeni yorum yok ise
// brifing hic akmaz.
if (others.length === 0 && notes.length === 0 && seritAldiMi && !linear) process.exit(0)

const lines = []
if (linear) lines.push(linear)
/**
 * ⭐ÖZET SATIR (REC-345 Kova C, 2026-09-17) — tam desen listesi HER TURDA basılmaz.
 *
 * Ölçüldü (09-16'dan beri, transkript): bu satır OPS'ta 543 kez · 1.278 KB, URUN'da 332 kez ·
 * 681 KB — iki pencerede de TEK en büyük bağlam kalemi (OPS'ta tüm Bash çıktısı 626 KB).
 * Kaynağı ALTYAPI'nın ~90 desenlik claim listesiydi. Oysa satırın işi "kim canlı, ne zamandır"
 * sorusudur; desen ayrıntısı yalnız ÇAKIŞMA anında gerekir ve o an zaten lane-guard kancası
 * düzenlemeyi durdurup sahibini söyler.
 *
 * Biçim: `AD=sid8 (N desen, Xdk)`. İstem metninde geçen bir yol başka bir şeridin desenine
 * değiyorsa YALNIZ o desen(ler) eklenir — "bu dosya kimin" sorusunun cevabı tam gerektiği yerde.
 * Tam liste: `node scripts/board/board.cjs who` (SessionStart zaten tam listeyi basıyor).
 */
function istemYollari(metin) {
  const out = new Set()
  for (const m of String(metin || '').matchAll(/[A-Za-z0-9_.\-*]+(?:\/[A-Za-z0-9_.\-*]+)+/g)) {
    out.add(m[0].replace(/^\.\//, ''))
  }
  return [...out]
}

if (others.length > 0) {
  const yollar = istemYollari(input.prompt)
  lines.push('PANO: ' + others.map(c => {
    const bayat = c.bayat ? ` ⚠BAYAT ${c.yasDk}dk atış yok, bırakılmadı` : ''
    const globs = Array.isArray(c.globs) ? c.globs : []
    let degen = []
    try {
      degen = globs.filter(g => yollar.some(y => board.globToRegExp(g).test(y)))
    } catch { degen = [] } // eşleyici yoksa özet yine basılır; ayrıntı düşer, satır düşmez
    const ek = degen.length > 0 ? `; istemdeki yola değen: ${degen.join(' ')}` : ''
    return `${c.lane}=${String(c.sid).slice(0, 8)} (${globs.length} desen, ${c.yasDk}dk${ek})${bayat}`
  }).join(' · '))
}
if (!seritAldiMi) {
  lines.push(
    'LOOP: zincirin kurulu değilse docs/standards/session-loop-ritual.md KOMUT-B ile kur ' +
    '(OPS-AUDIT oturumuysan KOMUT-A) + yedek olarak CronCreate ile 30dk recurring tur kur ' +
    '(dakika 0/30 dışı). Şerit talep edince bu satır kendiliğinden susar.',
  )
}
// YÖNTEM işareti (T144-VH): yalnız pano konuştuğunda (sessizlik kuralına tabi) tek satır —
// ajan kafasını panoya çevirdiğinde cetvelin yerini görsün; tam metin SessionStart'ta.
lines.push('YÖNTEM: emirde YÖNTEM: satırı (öneri; sapmayı yaz) — cetvel docs/standards/execution-method-standard.md')
if (notes.length > 0) {
  lines.push('NOT: ' + notes.map(n => `${String(n.sid).slice(0, 8)}→${n.to || 'herkes'} "${n.text}"`).join(' | '))
  try { board.markSeen(sid, notes) } catch { /* işaretlenemedi: not tekrar gelir, zararsız */ }
}

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'UserPromptSubmit',
    additionalContext: lines.join('\n'),
  },
}))
})()
