#!/usr/bin/env node
'use strict'

/**
 * PostToolUse hook — EYLEM DEFTERİ (git'in GÖRMEDİĞİ taşıma/silmeleri kaydeder).
 *
 * NİÇİN VAR — ölçülmüş vaka, 2026-09-06/07:
 * Sabah 06:55Z'de `~/.claude/skills` altından **20 beceri karantinaya taşındı** (Recep onaylı,
 * OPS eliyle). Öğleden sonra Recep "bugün pek çok skill temizlendi" dedi ve **hiçbir şerit
 * bulamadı** — OPS dahil, çünkü taşımayı yapan oturum compact'ten sonra hatırlamıyordu ve
 * hiçbir yere YAZMAMIŞTI. Üç şerit ayrı ayrı arama yaptı; iz ancak dizin damgasından çıktı,
 * NE taşındığı ise hiçbir yerde yoktu. Cevabı en sonunda insan verdi.
 *
 * ⭐BU KANCA NİÇİN `bash-write-audit.cjs`'İN YAPTIĞI İŞ DEĞİL:
 * O kanca `git status` deltası ölçer — yani **depo içini** görür. Beceri dizini depo DIŞINDADIR
 * (`~/.claude/skills`), git onu hiç görmez. Kaybolan tam da bu sınıftı: **çalışma ağacının
 * dışındaki geri-döndürülemez eylem.** Bu kanca komutun KENDİSİNE bakar, sonucuna değil.
 *
 * NE YAPAR: Bash komutunda taşıma/silme fiili görürse deftere bir satır yazar
 * (damga, sid, fiil, hedef yollar, komutun kısaltılmış hâli). Hepsi bu. **ENGELLEMEZ.**
 *
 * ⚠"YAPILDI" DEĞİL "ÇALIŞTIRILDI": PostToolUse, komut koştuktan sonra çağrılır ama bu kanca
 * komutun BAŞARILI olduğunu ölçmez (çıkış kodu girdide güvenilir biçimde yok). Defter satırı
 * "bu komut koşturuldu" der; "hedef gerçekten silindi" DEMEZ. Ad, ölçtüğü şeyin sınırını
 * taşımak zorundadır — yoksa defterin kendisi yanlış tanıklık eder.
 *
 * FAIL-OPEN ve SESSİZ: bu bir kapı değil, bir DEFTERDİR. Yazamazsa akışı durdurmaz; ama
 * yazamadığını `stderr`e basar, çünkü "kayıt yok" ile "kaydedemedim" ayırt edilebilir olmalı.
 *
 * stdin: { session_id, tool_name, tool_input: { command }, cwd? }
 * Çıkış: DAİMA 0.
 */

const fs = require('fs')
const path = require('path')

/**
 * İKİ AD, TEK KAVRAM (bkz. bash-write-audit.cjs): pano dizini iki değişkenle anılıyor ve
 * yönlendirmenin YARIM uygulanması 2026-08-23'te canlı bir şeride kanarya notu düşürdü.
 * board.cjs'in okuduğu ad ÖNCELİKLİ — tek değişken bütün katmanı birlikte taşısın.
 */
const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

/**
 * TAŞIMA/SİLME FİİLLERİ — POSIX ve PowerShell birlikte, çünkü bu makinede ikisi de koşuyor.
 * ⭐`git mv`/`git rm` DE VAR: depo içi olsalar bile defter "ne oldu" sorusunun tek yeri olsun;
 * bash-write-audit ayrı bir şey ölçer (sonuç deltası), bu ise NİYETİ kaydeder.
 * Sınır: `trash`/`recycle` gibi araçlar listede yok — bilmediğimizi bilerek yazıyoruz.
 */
const FIILLER = [
  { ad: 'mv', re: /(^|[;&|]\s*|\s)mv\s+/ },
  { ad: 'rm', re: /(^|[;&|]\s*|\s)rm\s+/ },
  { ad: 'rmdir', re: /(^|[;&|]\s*|\s)rmdir\s+/ },
  { ad: 'git-mv', re: /\bgit\s+(-C\s+\S+\s+)?mv\b/ },
  { ad: 'git-rm', re: /\bgit\s+(-C\s+\S+\s+)?rm\b/ },
  { ad: 'Move-Item', re: /\bMove-Item\b/i },
  { ad: 'Remove-Item', re: /\bRemove-Item\b/i },
  { ad: 'Rename-Item', re: /\bRename-Item\b/i },
  { ad: 'del', re: /(^|[;&|]\s*|\s)del\s+/i },
]

/**
 * Komuttan hedef görünen yolları çıkarır — YAKLAŞIKTIR ve sınırı burada yazılıdır:
 * kabuk genişletmesi (`*`, `$VAR`, `$(...)`) çözülmez, çünkü çözmek komutu YENİDEN
 * KOŞTURMAK demektir ve bir defter, kaydettiği eylemi tekrar etmez.
 * Bu yüzden defterde hem çıkarılan yollar hem KOMUTUN KENDİSİ durur: yol listesi eksikse
 * okuyan komuta bakar.
 */
function yollariCikar(komut) {
  const cikti = []
  for (const parca of String(komut).split(/\s+/)) {
    if (parca.startsWith('-')) continue
    const temiz = parca.replace(/^["']|["'];?$/g, '')
    if (!temiz || temiz.length < 2) continue
    if (/[/\\]/.test(temiz) || /^[A-Za-z]:$/.test(temiz)) cikti.push(temiz)
  }
  return cikti.slice(0, 12)
}

/**
 * Yol depo ağacının İÇİNDE mi — defterin en değerli ayrımı budur (git görür / görmez).
 *
 * ⭐`~` ÖNCE ÇÖZÜLÜR — kendi kancamda ÖLÇÜMLE bulduğum kusur (2026-09-07): `path.resolve`
 * tilde'yi BİLMEZ; `~/.claude/skills/pptx` cwd'ye göre çözülüp **depo içi** sayılıyordu.
 * Yani defterin varlık sebebi olan vaka — beceri taşıması — tam da yanlış kovaya düşüyordu.
 * Kusur sessizdi: satır yazılıyor, yalnız "repo dışı" alanı boş kalıyordu.
 */
function repoIci(yol, cwd) {
  if (!yol) return false
  const ev = process.env.HOME || process.env.USERPROFILE || ''
  /**
   * ⭐MSYS YOLU ÇEVRİLİR — üçüncü ölçülmüş kusur (2026-09-07, aynı koşumda):
   * Git-Bash `/c/Users/alize/venthub-hvac/...` biçimi verir; Windows Node bunu geçerli bir
   * yol sanıp `C:\c\Users\...` diye çözer, o da YOK — yani `.git` araması boşa gider ve
   * ana dizindeki bir silme bile "depo dışı" görünür. Bu makinede iki kabuk birden koşuyor,
   * o yüzden çeviri ortamın gerçeği; "hangi biçim doğru" tartışması değil.
   */
  const msys = /^\/([A-Za-z])\/(.*)$/.exec(yol)
  const duz = msys ? msys[1].toUpperCase() + ':/' + msys[2] : yol
  const acilmis = /^~[/\\]/.test(duz) && ev ? path.join(ev, duz.slice(2)) : duz
  // Tilde var ama ev dizini okunamıyorsa: İÇERİDE SAYMA. Ölçemediğimizde defterin
  // kaydetmesi, kaydetmemesinden iyidir (fail-open değil, fail-LOUD tarafı).
  if (/^~/.test(yol) && !ev) return false
  const mutlak = path.isAbsolute(acilmis) ? acilmis : path.resolve(cwd || process.cwd(), acilmis)
  const n = mutlak.replace(/\\/g, '/').toLowerCase()
  if (n.includes('/node_modules/')) return false

  /**
   * ⭐ÖLÇÜT ADA DEĞİL GERÇEĞE BAĞLI — ikinci ölçülmüş kusur (2026-09-07, aynı koşumda):
   * ilk hâli yolda "venthub-hvac" arıyordu. Ama bu depoda İŞİN ÇOĞU WORKTREE'de koşar
   * (`C:/tmp/vh-altyapi-*`, `C:/tmp/vh-katalog-*`) ve o yollarda depo adı GEÇMEZ. Yani
   * `git -C C:/tmp/vh-altyapi-scrubber rm ...` "depo dışı" sayılıyordu — defterin en çok
   * kullanılacağı yer tam olarak orası.
   * Doğrusu: yukarı doğru `.git` ara. Worktree'de `.git` bir DOSYADIR (gitdir işaretçisi),
   * ana dizinde DİZİN; ikisi de bulunur. Sınır 10 kademe — sonsuz döngü olmasın.
   */
  let dizin = mutlak
  for (let i = 0; i < 10; i++) {
    try {
      if (fs.existsSync(path.join(dizin, '.git'))) return true
    } catch {
      /* erişilemeyen dizin: yukarı devam et */
    }
    const ust = path.dirname(dizin)
    if (!ust || ust === dizin) break
    dizin = ust
  }
  return false
}

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

if (girdi.tool_name !== 'Bash') process.exit(0)
const komut = String((girdi.tool_input && girdi.tool_input.command) || '')
if (!komut) process.exit(0)

const bulunan = FIILLER.filter((f) => f.re.test(komut)).map((f) => f.ad)
if (bulunan.length === 0) process.exit(0)

const sid = String(girdi.session_id || '')
const cwd = String(girdi.cwd || process.cwd())
const yollar = yollariCikar(komut)
const disYollar = yollar.filter((y) => !repoIci(y, cwd))

const satir = {
  ts: new Date().toISOString(),
  sid: sid.slice(0, 8),
  fiiller: bulunan,
  // ⭐DEPO DIŞI yollar AYRI alanda: defterin varlık sebebi bu sınıf. Okuyan "bugün ağacın
  // dışında ne oldu" sorusunu tek alandan cevaplayabilsin.
  repoDisiYollar: disYollar,
  yollar,
  // Komut KISALTILIR ama kırpıldığı SÖYLENİR — sessiz kırpma, yanlış veri yayınlamanın en
  // sinsi hâlidir (gozcu.cjs:112 aynı dersin kaydı).
  komut: komut.length > 400 ? komut.slice(0, 400) + ' …[KIRPILDI: ' + (komut.length - 400) + ' karakter daha]' : komut,
  cwd,
}

try {
  fs.mkdirSync(PANO, { recursive: true })
  fs.appendFileSync(path.join(PANO, '.eylem-defteri.' + (satir.sid || 'bilinmeyen') + '.jsonl'), JSON.stringify(satir) + '\n', 'utf8')
} catch (e) {
  // Fail-open ama SESSİZ DEĞİL.
  process.stderr.write('[eylem-defteri] YAZILAMADI (' + ((e && e.code) || (e && e.message)) + ') — bu eylem deftere GİRMEDİ\n')
}

process.exit(0)
