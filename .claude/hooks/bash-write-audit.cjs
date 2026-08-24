#!/usr/bin/env node
'use strict'

/**
 * PostToolUse hook — BASH YAZMA DENETIMI (dikiş yeri alarmı).
 *
 * NİÇİN VAR — ve niçin PreToolUse kapısı YETMEZ:
 * `bash-write-guard.cjs` komut METNİNDEN yazma hedefi çıkarır. Ama bir komut yalnızca kendi
 * gösterdiği kadarını ele verir: `node betik.cjs` çağrısının İÇİNDEKİ yazma statik olarak
 * GÖRÜLEMEZ. Bugün panoya not bırakan her komut tam bu biçimde. Yani ön eleme tek başına
 * "bağladım" yanılsaması üretir — OPS'un cümlesiyle: C tek başına inmemeli.
 *
 * BU KATMAN KOMUTA DEĞİL SONUCA BAKAR: komut ne yapmış olursa olsun, çalışma ağacında NE
 * DEĞİŞTİĞİNİ `git status` ile ölçer. Nasıl yazıldığı önemsizdir — sed, heredoc, betik, derleyici.
 *
 * TABAN ALMA — ölçülmüş tuzak: bu depoda 46 dosya SÜREKLİ kirli (40'ı `.archive` altında
 * satır-sonu hayaleti, 5'i üretilmiş companion `.md`). Mutlak kirli kümeye alarm bağlansaydı
 * HER Bash çağrısında ötecekti ve alarm üç gün içinde görmezden gelinirdi. Bu yüzden taban
 * dosyada tutulur ve yalnız DELTA raporlanır.
 *
 * FAIL-OPEN ama SESSİZ DEĞİL: git ya da pano okunamazsa yazmayı engellemeyiz (zaten oldu),
 * ama hatayı BASARIZ. "Hiçbir şey bulamadı" ile "hiçbir yere bakmadı" ayırt edilebilir olmalı.
 *
 * stdin: { session_id, tool_name, tool_input, cwd? }
 * Çıkış: exit 2 = alarm (stderr Claude'a döner; eylem zaten olmuş, amaç GÖRÜNÜRLÜK) · exit 0 = sessiz.
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

/**
 * IKI AD, TEK KAVRAM — OLCULMUS KUSUR (2026-08-23): bu dosya VENTHUB_PANO_DIR okuyordu,
 * board.cjs ise VENTHUB_BOARD_DIR (board.cjs:28). Panoyu bir kopyaya yonlendirip kanarya
 * kosturdugumda yonlendirme YARIM uygulandi: OKUMA kopyadan yapildi, YAZMA gercek panoya
 * gitti ve canli bir seride kanarya notu dustu. Yonlendirme "calisti" gorunuyordu cunku
 * yarisi tasinmisti — sessiz sizinti, cunku hicbir hata olusmadi.
 * Bu yuzden ikisi de kabul edilir ve board.cjs in okudugu ad ONCELIKLIDIR: tek bir degisken
 * ayarlamak butun katmani birlikte tasir.
 */
const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

function stdinOku() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

let girdi = {}
try {
  girdi = JSON.parse(stdinOku() || '{}')
} catch {
  process.exit(0)
}

const sid = girdi.session_id || ''
if (!sid || girdi.tool_name !== 'Bash') process.exit(0)

const kok = path.resolve(girdi.cwd || process.cwd())
const kisaSid = String(sid).slice(0, 8)
const TABAN_YOLU = path.join(PANO, '.bash-audit-' + kisaSid + '.json')

/** `git status --porcelain` satırını yola çevirir. Yeniden adlandırmada HEDEFİ alır. */
function satirdanYol(satir) {
  const govde = satir.slice(3)
  const ok = govde.indexOf(' -> ')
  const ham = ok > -1 ? govde.slice(ok + 4) : govde
  return ham.replace(/^"|"$/g, '').trim()
}

let simdiki = []
try {
  const cikti = execFileSync('git', ['status', '--porcelain'], {
    cwd: kok,
    encoding: 'utf8',
    timeout: 15000,
  })
  simdiki = cikti.split('\n').filter((s) => s.trim()).map(satirdanYol)
} catch (e) {
  process.stderr.write(
    '[bash-write-audit] git status kosulamadi (' + (e && (e.code || e.message)) + ')' +
      ' - BU TURDA CALISMA AGACINI DENETLEMEDIM; sessizlik degil KORLUK.\n',
  )
  process.exit(0)
}

let taban = { yollar: [], bildirilen: [] }
let tabanVarDi = false
try {
  if (fs.existsSync(TABAN_YOLU)) {
    const okunan = JSON.parse(fs.readFileSync(TABAN_YOLU, 'utf8'))
    if (okunan && Array.isArray(okunan.yollar)) {
      taban = { yollar: okunan.yollar, bildirilen: Array.isArray(okunan.bildirilen) ? okunan.bildirilen : [] }
      tabanVarDi = true
    }
  }
} catch {
  /* bozuk taban -> sıfırdan kurulur, aşağıda yazılır */
}

const tabanKume = new Set(taban.yollar)
const yeniler = simdiki.filter((y) => !tabanKume.has(y))

const tabanYaz = (bildirilen) => {
  try {
    const gecici = TABAN_YOLU + '.tmp'
    fs.writeFileSync(gecici, JSON.stringify({ sid, yollar: simdiki, bildirilen }), 'utf8')
    fs.renameSync(gecici, TABAN_YOLU)
  } catch (e) {
    process.stderr.write('[bash-write-audit] taban yazilamadi (' + (e && e.code) + ') - sonraki turda tekrar oteriz.\n')
  }
}

// İLK KURULUM: mevcut kirliliğin tamamı taban olur. Aksi hâlde ilk çağrıda 46 dosyalık
// bir alarm yağar ve gerçek sinyal onun içinde kaybolur.
if (!tabanVarDi) {
  tabanYaz(taban.bildirilen)
  process.exit(0)
}

if (!yeniler.length) {
  tabanYaz(taban.bildirilen)
  process.exit(0)
}

let pano = null
try {
  pano = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch (e) {
  process.stderr.write(
    '[bash-write-audit] pano yuklenemedi (' + (e && e.message) + ') - YENI DEGISEN ' + yeniler.length +
      ' dosyayi serit kapisindan GECIREMEDIM:\n  ' + yeniler.join('\n  ') + '\n',
  )
  tabanYaz(taban.bildirilen)
  process.exit(0)
}

const bildirilen = new Set(taban.bildirilen)
const ihlaller = []
for (const bagil of yeniler) {
  let catisma = null
  try {
    catisma = pano.findConflict(path.resolve(kok, bagil), sid, kok)
  } catch {
    continue
  }
  if (catisma && !bildirilen.has(bagil)) {
    ihlaller.push({ bagil, catisma })
    bildirilen.add(bagil)
  }
}

tabanYaz([...bildirilen])

if (!ihlaller.length) process.exit(0)

const satirlar = ihlaller.map(
  (i) => '  · ' + i.bagil + '  ->  ' + i.catisma.claim.lane + ' (' + String(i.catisma.claim.sid).slice(0, 8) + ') · kural: ' + i.catisma.glob,
)

/**
 * Panoya da yaz: stderr YALNIZ bu oturuma döner, şerit sahibinin haberi olmaz.
 *
 * ⚠ İlk yazımda burada `pano.note(...)` çağırmıştım — board.cjs böyle bir fonksiyon İHRAÇ
 * ETMİYOR (dışa açılan yazıcı `append`). Çağrı fırlatırdı, `catch` onu yutardı ve alarmın
 * pano kolu HİÇ ÇALIŞMADAN "çalışıyor" görünürdü. Kendi kancamda, tam da bugün üç kez
 * onardığım sessiz-yutma sınıfı. Bu yüzden aşağıda hem doğru API kullanılıyor hem de
 * başarısızlık BASILIYOR.
 */
const lanelereGore = new Map()
for (const i of ihlaller) {
  const anahtar = i.catisma.claim.sid
  if (!lanelereGore.has(anahtar)) lanelereGore.set(anahtar, { claim: i.catisma.claim, satirlar: [] })
  lanelereGore.get(anahtar).satirlar.push('  · ' + i.bagil + ' · kural: ' + i.catisma.glob)
}

for (const { claim, satirlar: laneSatirlar } of lanelereGore.values()) {
  try {
    const hedef = pano.resolveNoteTarget(claim.sid)
    if (!hedef || !hedef.ok) {
      process.stderr.write('[bash-write-audit] pano hedefi cozulemedi (' + (hedef && hedef.reason) + ') - not GONDERILEMEDI.\n')
      continue
    }
    pano.append(sid, {
      type: 'note',
      to: hedef.to,
      text:
        'OTOMATIK ALARM (bash-write-audit): Bash sonrasi SENIN SERIDINDEKI dosya(lar) benim ' +
        'calisma agacimda degisti. Kasten olmamis olabilir ama SONUC ayni; haberin olsun diye yaziyorum.\n' +
        laneSatirlar.join('\n') +
        '\nBu, PreToolUse kapisinin GOREMEDIGI bir yazmadir: komut metninde hedef yoktu ' +
        '(ornek: node betik.cjs, ya da bir git kancasinin calistirdigi ureteci).',
    })
  } catch (e) {
    process.stderr.write('[bash-write-audit] panoya not yazilamadi (' + (e && e.message) + ') - serit sahibi HABERSIZ.\n')
  }
}

process.stderr.write(
  '[bash-write-audit] DIKIS YERI ALARMI — Bash sonrasi BASKA SERIDIN dosyalari degisti:\n' +
    satirlar.join('\n') +
    '\n  Bu, PreToolUse kapisinin GOREMEDIGI bir yazma (komut metninde hedef yoktu).\n' +
    '  YAPILACAK: degisikligi geri al (git checkout -- <yol> KENDI dosyanda guvenlidir),\n' +
    '  serit sahibine panoya yaz (otomatik not birakildi) ve isi onun kapisindan gecir.\n',
)
process.exit(2)
