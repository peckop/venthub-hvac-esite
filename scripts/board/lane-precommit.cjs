#!/usr/bin/env node
'use strict'

/**
 * scripts/board/lane-precommit.cjs — İKİNCİ KATMAN: pre-commit ŞERİT KAPISI (E1).
 *
 * NİÇİN VAR — PreToolUse tek başına yetmez, ölçüldü:
 * PreToolUse kancaları ARACA bakar (Edit/Write/Bash). Ama bir dosya üçüncü bir yoldan da
 * değişebilir: bir git kancasının çalıştırdığı üreteç. 2026-08-23'te tam bu yaşandı —
 * companion üreteci `src/i18n/dictionaries/{tr,en}.md` dosyalarını I18N'in claim'i içinde
 * değiştirdi ve hiçbir PreToolUse kapısı görmedi. `pre-commit` ise ARACA değil DOSYA LİSTESİNE
 * bakar; yazının nasıl yapıldığı önemsizdir. Bash boşluğunu kapatan asıl yer burasıdır.
 *
 * NİÇİN BLOKLAYABİLİR (pre-commit 2026-08-15'te "bloklamaz" yapılmışken):
 * O karar LLM SKORUNA bağlı bir ölçüt içindi — aynı dosya bir koşuda 80/100, ötekinde 100/100
 * alıyordu; rastgele patlayan kapı `--no-verify` alışkanlığı kazandırır ve GERÇEK kapıları da
 * birlikte atlatır. Şerit kontrolü ise DETERMİNİSTİK, ÇEVRİMDIŞI ve HIZLI: aynı girdi hep aynı
 * sonucu verir. `.githooks/pre-commit`in kendi notu şartı böyle koymuştu; karşılıyor.
 * Companion uyarısı UYARI-ONLY kalır; yalnız ŞERİT İHLALİ bloklar.
 *
 * KİMLİK: `<absolute-git-dir>/venthub-sid` (SessionStart kancası yazar). ORTAK dizine değil
 * WORKTREE-YEREL yazılır — ölçüldü: `--git-common-dir` bütün worktree'lerde AYNI yeri gösterir,
 * oraya yazılsa her şerit aynı kimliği okurdu.
 *
 * BOOTSTRAP: kimlik dosyası ancak bir şeridin sonraki oturum açılışında oluşur. O ana kadar
 * FAIL-OPEN çalışır — ama SESSİZ DEĞİL: görünür uyarı basar ve panoya iz bırakır. Sessizliğin
 * "kapı çalıştı" diye okunması bu projede defalarca ölçülmüş bir arıza biçimi.
 *
 * Çıkış: 1 = commit BLOKLANDI (şerit ihlali) · 0 = geç.
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const git = (args) => execFileSync('git', args, { encoding: 'utf8', timeout: 15000 }).trim()

const uyar = (s) => process.stderr.write(s + '\n')

let gitDir = ''
let dal = '(bilinmiyor)'
let staged = []
try {
  gitDir = git(['rev-parse', '--absolute-git-dir'])
  dal = git(['rev-parse', '--abbrev-ref', 'HEAD'])
  staged = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR']).split('\n').filter(Boolean)
} catch (e) {
  uyar('[lane-precommit] git okunamadi (' + (e && (e.code || e.message)) + ') — SERIT KONTROLU YAPILMADI.')
  process.exit(0)
}

if (!staged.length) process.exit(0)

/**
 * MERGE COMMITI MUAF — olculmus tasarim hatasi (2026-08-26, ADMIN bloke oldu).
 *
 * E1 staged DOSYA LISTESINE bakar ve "baska seridin claim inde mi" diye sorar. Bu soru SEN
 * yazdiginda dogrudur. Merge commit inde ise ANLAMSIZDIR: git merge origin/master, master in
 * getirdigi HER dosyayi staged yapar — uretilmis docs/*_master.md ve artefakt_manifest.json
 * dahil. Onlari serit YAZMADI, ENTEGRE ediyor. Kapi boylece yazari degil TASIYICIYI cezalandirir.
 *
 * OLCULEN SONUC: 2026-08-26 aksami ADMIN in 'git merge origin/master' i bloklandi, merge yarim
 * kaldi. Bu kapinin ONARMAYA calistigi seyin tam tersi: serit taban tazeleyemeyince BAYAT tabanda
 * calisir ve asil catisma o zaman uretilir.
 *
 * NICIN ATLAMAK GUVENLI: merge in getirdigi icerik zaten master a girmis, yani baska bir seridin
 * KENDI kapisindan gecmis demektir. Burada ikinci kez sorgulamak koruma eklemez.
 *
 * NICIN SESSIZ DEGIL: atlama GORUNUR satir basar. Sessiz atlama bu depoda defalarca olculmus bir
 * ariza bicimi — 'kapi kostu' ile 'kapi atladi' ayirt edilemez hale gelir.
 */
const birlestirmeHali = (() => {
  for (const ad of ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD']) {
    try {
      if (fs.existsSync(path.join(gitDir, ad))) return ad
    } catch {
      /* okunamadi -> asil kola dus, fail-open degil fail-normal */
    }
  }
  return null
})()

if (birlestirmeHali) {
  uyar(
    '[lane-precommit] MERGE/PICK COMMITI (' + birlestirmeHali + ') — serit kontrolu ATLANDI. ' +
      staged.length + ' staged dosya; bunlar entegre edilen icerik, bu seridin YAZDIGI is degil.',
  )
  process.exit(0)
}


let board = null
let kimlik = null
try {
  board = require(path.join(__dirname, 'board.cjs'))
  kimlik = require(path.join(__dirname, 'kimlik.cjs'))
} catch (e) {
  uyar('[lane-precommit] pano yuklenemedi (' + (e && e.message) + ') — SERIT KONTROLU YAPILMADI (fail-open).')
  process.exit(0)
}

const kimlikYolu = path.join(gitDir, 'venthub-sid')

// ---- E1-v2 KIMLIK COZUMU (2026-08-28): dosya VEKIL kanit, oturumun kendi kimligi ASIL kanit.
// Eski kol yalniz dosyayi okurdu ve 'dosya VAR ama YANLIS SAHIBE ait' halini goremiyordu.
// Olculdu: kapi kendi sahibini baska serit sanip KENDI claim indeki dosyada bloklad.
// Gerekce ve olcum sinirlari: scripts/board/kimlik.cjs
const kimlikCozum = kimlik.coz(gitDir, board)
const sid = kimlikCozum.sid
for (const u of kimlikCozum.uyarilar) uyar('[lane-precommit] ' + u)
if (kimlikCozum.celisme && kimlik.onar(gitDir, sid)) {
  uyar('[lane-precommit] kimlik dosyasi ASIL kimlikle ONARILDI (' + sid.slice(0, 8) + ').')
}

// TANINMAYAN KIMLIK -> FAIL-OPEN. Blok DEGIL: kapi yanlis oturum adina karar veremez ve
// yanlis blok '--no-verify' aliskanligi kazandirir, GERCEK kapilari da birlikte atlatir
// (bu dosyanin 2026-08-15 tarihli kendi notunun gerekcesi).
if (kimlikCozum.bilinmeyen) {
  uyar('[lane-precommit] SERIT KONTROLU YAPILMADI (fail-open) — taninmayan kimlik.')
  process.exit(0)
}

// ---- BOOTSTRAP KOLU: kimlik yok. Fail-open, ama iz bırakarak.
if (!sid) {
  uyar('')
  uyar('[lane-precommit] KIMLIK YOK — serit kontrolu bu commit icin YAPILAMADI (fail-open).')
  uyar('  Beklenen dosya: ' + kimlikYolu)
  uyar('  Sebep: kimlik dosyasini SessionStart kancasi yazar; bu worktree o kancanin')
  uyar('  guncel surumuyle bir oturum ACMAMIS. OTURUMU YENIDEN BASLATINCA kimlik olusur.')
  uyar('  Commit ENGELLENMEDI — ama sessiz gecmiyor: panoya iz birakiliyor.')
  uyar('')
  try {
    board.append('e1-kimliksiz', {
      type: 'note',
      to: '',
      text:
        'E1 KIMLIKSIZ COMMIT: ' + dal + ' — ' + staged.length + ' dosya: ' + staged.slice(0, 12).join(', ') +
        (staged.length > 12 ? ' (+' + (staged.length - 12) + ')' : '') +
        '. Kimlik dosyasi yoktu (' + kimlikYolu + '), serit kontrolu KOSMADI. Bu worktree oturumu ' +
        'yeniden baslatilinca kimlik olusur ve kapi devreye girer.',
    })
  } catch (e) {
    uyar('[lane-precommit] panoya iz birakilamadi (' + (e && e.message) + ') — bu commit HICBIR YERDE gorunmuyor.')
  }
  process.exit(0)
}

// ---- ASIL KOL: kimlik var, şerit ihlali bloklar.
const kok = path.resolve(__dirname, '..', '..')
const ihlaller = []
for (const bagil of staged) {
  let catisma = null
  try {
    catisma = board.findConflict(path.resolve(kok, bagil), sid, kok)
  } catch {
    continue
  }
  if (catisma) ihlaller.push({ bagil, catisma })
}

if (!ihlaller.length) process.exit(0)

uyar('')
uyar('[lane-precommit] COMMIT BLOKLANDI — staged dosyalar BASKA seritlerin claim inde:')
for (const i of ihlaller) {
  uyar(
    '  · ' + i.bagil + '  ->  ' + i.catisma.claim.lane +
      ' (' + String(i.catisma.claim.sid).slice(0, 8) + ') · kural: ' + i.catisma.glob,
  )
}
uyar('')
uyar('  Bu kapi ARACA degil DOSYA LISTESINE bakar: dosyayi Edit, Bash, betik ya da bir git')
uyar('  kancasinin ureteci yazmis olabilir — sonuc ayni.')
uyar('  YAPILACAKLAR:')
uyar('   (a) dosyayi staged listesinden cikar: git restore --staged <yol>')
uyar('   (b) serit sahibine panoya yaz ve GO al:')
uyar('       node scripts/board/board.cjs note --sid ' + sid + ' --to <SERIT> --text "..."')
uyar('   (c) uretilmis bir dosyaysa (companion .md) commit etme; ureteci sahibi kossun.')
uyar('  Yeniden claim etmek SENI ACMAZ: "en erken kazanir".')
uyar('')
process.exit(1)
