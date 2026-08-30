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

const cwdKok = path.resolve(girdi.cwd || process.cwd()).replace(/\\/g, '/')
const kisaSid = String(sid).slice(0, 8)
const TABAN_YOLU = path.join(PANO, '.bash-audit-' + kisaSid + '.json')

/**
 * Uyarılar TOPLANIR, tek yerden basılır. Erken çıkışlı yollarda basmayı unutmamak için:
 * bu dosyanın tarihi zaten "sessizce atlandı" arızalarıyla dolu.
 */
const uyarilar = []
const uyariBas = () => {
  if (uyarilar.length) process.stderr.write(uyarilar.join('\n') + '\n')
}

const gitOku = (dizin, arg) => {
  try {
    return execFileSync('git', ['-C', dizin, 'rev-parse', arg], {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const kimlikOku = (yol) => {
  try {
    return fs.readFileSync(yol, 'utf8').trim()
  } catch {
    return ''
  }
}

/**
 * HANGİ AĞACI DENETLİYORUZ — ÖLÇÜLMÜŞ KÖRLÜK (2026-08-27).
 *
 * Eski hâli: `const kok = path.resolve(girdi.cwd || process.cwd())` ve `git status` o kökte.
 * `girdi.cwd` OTURUMUN cwd'sidir ve bu ortamda Bash cwd'si sessizce ANA çalışma dizinine
 * resetlenir (araç çıktısının sonunda "Shell cwd was reset to …" yazar; PRICING ve EDGE
 * bağımsız ölçtü). Sonuç: şerit kendi worktree'sinde çalışırken denetim ANA DEPONUN kirli
 * listesini okuyordu — 5 yol, şeridin kendi ağacındaki 40+ yol yerine. Alarm bir kez bu
 * worktree'de VAR OLMAYAN bir dosya adı verdi; kusur oradan çözüldü.
 *
 * YENİ KURAL — kimlikten ağaca: `session-board.cjs` her oturum açılışında sid'i
 * `<absolute-git-dir>/venthub-sid` dosyasına yazar. Bu dosyalar taranıp sid'i taşıyan
 * BÜTÜN ağaçlar bulunur. Kaynaklar:
 *   · `<ortak>/worktrees/<ad>/venthub-sid`  → ağaç = `<ad>/gitdir` içeriğinin dizini
 *   · `<ortak>/venthub-sid`                 → ağaç = ana depo (ortak dizinin üstü)
 *
 * ⚠ SID TEKİL DEĞİL — ölçüldü (2026-08-27): `e033dc3e` ÜÇ worktree'de (vh-comp, vh-inv7,
 * vh-rec80), `4397deef` İKİ worktree'de kayıtlı; ayrıca ana deponun kimlik dosyası da bir
 * şeridin sid'ini taşıyor. Belirsizlikte SESSİZCE BİRİNİ SEÇMEK, tam da onarmaya çalıştığımız
 * "yanlış ağacı ölçtü ve yeşil göründü" arızasını geri getirir. Bu yüzden: HİÇBİRİNİ SEÇME,
 * GÖRÜNÜR UYARI BAS ve HEPSİNİ denetle.
 *
 * NİÇİN `bash-write-guard.cjs`'teki çözüm burada işe yaramaz: orada hedef yolları KOMUT
 * METNİNDE yazılıdır, dolayısıyla her hedefin kökü kendi git deposundan sorulabilir. Burada
 * hedef yoktur — soru "ne değişti"dir, yani önce HANGİ AĞAÇ olduğu bilinmelidir. İki kancanın
 * farklı çözmesi tutarsızlık değil, girdilerinin farklı olmasıdır.
 * (Cetvel: `docs/standards/fleet-mechanism-standard.md` §9.)
 */
function agaclariCoz() {
  const ortakHam = gitOku(cwdKok, '--git-common-dir')
  if (!ortakHam) return { agaclar: [], sebep: 'ortak git dizini cozulemedi (cwd: ' + cwdKok + ')' }
  const ortak = path.resolve(cwdKok, ortakHam)

  const bulunan = []
  if (kimlikOku(path.join(ortak, 'venthub-sid')) === sid) bulunan.push(path.dirname(ortak))

  let adlar = []
  try {
    adlar = fs.readdirSync(path.join(ortak, 'worktrees'))
  } catch {
    adlar = []
  }
  for (const ad of adlar) {
    const dizin = path.join(ortak, 'worktrees', ad)
    if (kimlikOku(path.join(dizin, 'venthub-sid')) !== sid) continue
    const gitdir = kimlikOku(path.join(dizin, 'gitdir'))
    if (!gitdir) continue
    bulunan.push(path.dirname(path.resolve(gitdir)))
  }

  // Ağaç yolları EĞİK ÇİZGİYE normalize edilir: bu depodaki bütün kanca çıktıları ve claim
  // glob'ları eğik çizgi kullanıyor; ters bölülü bir yol raporda kopyala-yapıştır edilemez ve
  // karşılaştırmalarda sessizce eşleşmez.
  const tekil = [...new Set(bulunan.map((a) => path.resolve(a).replace(/\\/g, '/')))].filter((a) => {
    try {
      return fs.statSync(a).isDirectory()
    } catch {
      return false
    }
  })
  return {
    agaclar: tekil,
    sebep: tekil.length ? '' : 'bu sid hicbir agacin venthub-sid dosyasinda kayitli degil',
  }
}

const { agaclar, sebep } = agaclariCoz()
let denetlenecek = agaclar
if (!denetlenecek.length) {
  uyarilar.push(
    '[bash-write-audit] KIMLIK COZULEMEDI (' + sebep + ') — cwd tabanina DUSTUM: ' + cwdKok +
      '\n  Bu agac seridin agaci OLMAYABILIR; denetim yanlis agaci olcuyor olabilir.' +
      '\n  Onarim: bu worktree de bir oturum acilisi yap (session-board.cjs kimligi yazar).',
  )
  denetlenecek = [cwdKok]
} else if (denetlenecek.length > 1) {
  uyarilar.push(
    '[bash-write-audit] SID TEKIL DEGIL — ' + denetlenecek.length +
      ' agac ayni kimligi tasiyor. HICBIRINI SECMEDIM, HEPSINI denetliyorum:\n  ' +
      denetlenecek.join('\n  '),
  )
}

/** `git status --porcelain` satırını yola çevirir. Yeniden adlandırmada HEDEFİ alır. */
function satirdanYol(satir) {
  const govde = satir.slice(3)
  const ok = govde.indexOf(' -> ')
  const ham = ok > -1 ? govde.slice(ok + 4) : govde
  return ham.replace(/^"|"$/g, '').trim()
}

/**
 * Anahtar AĞAÇLA NİTELENİR. Aynı bağıl yol (ör. `src/lib/rbac.ts`) iki ağaçta birden kirli
 * olabilir; nitelenmemiş anahtar ikisini tek sayar ve ikincisi sessizce "zaten bildirildi"
 * olur — yine sessiz kayıp.
 */
const anahtarla = (agac, bagil) => agac + '::' + bagil

const simdiki = []
let okunanAgac = 0
for (const agac of denetlenecek) {
  try {
    /**
     * `-uall` ŞART — INV-BASH-WRITE-2 kolu bunu yakaladı (2026-08-27). Varsayılan
     * `--untracked-files=normal`, YENİ BİR DİZİN altındaki izlenmeyen dosyaları tek satırda
     * DİZİN olarak toplar: `?? zzz-audit-sinavi/`. O satır bir dosya yolu değildir, hiçbir
     * claim glob'una (`.../**`) uymaz ve alarm sessizce ötmez. Yani "başka şeridin ağacına
     * YENİ dosya eklemek" — en tipik ihlal biçimi — tam da görünmeyen hâldi.
     */
    const cikti = execFileSync('git', ['status', '--porcelain', '-uall'], {
      cwd: agac,
      encoding: 'utf8',
      timeout: 15000,
    })
    okunanAgac++
    for (const satir of cikti.split('\n')) {
      if (!satir.trim()) continue
      const bagil = satirdanYol(satir)
      simdiki.push({ agac, bagil, anahtar: anahtarla(agac, bagil) })
    }
  } catch (e) {
    uyarilar.push(
      '[bash-write-audit] git status kosulamadi (' + agac + ': ' + (e && (e.code || e.message)) + ')' +
        ' - BU AGACI DENETLEMEDIM; sessizlik degil KORLUK.',
    )
  }
}

if (!okunanAgac) {
  uyariBas()
  process.exit(0)
}

let taban = { surum: 0, yollar: [], bildirilen: [] }
let tabanVarDi = false
try {
  if (fs.existsSync(TABAN_YOLU)) {
    const okunan = JSON.parse(fs.readFileSync(TABAN_YOLU, 'utf8'))
    if (okunan && Array.isArray(okunan.yollar)) {
      taban = {
        surum: Number(okunan.surum) || 1,
        yollar: okunan.yollar,
        bildirilen: Array.isArray(okunan.bildirilen) ? okunan.bildirilen : [],
      }
      tabanVarDi = true
    }
  }
} catch {
  /* bozuk taban -> sıfırdan kurulur, aşağıda yazılır */
}

const tabanYaz = (bildirilen) => {
  try {
    const gecici = TABAN_YOLU + '.tmp'
    fs.writeFileSync(
      gecici,
      JSON.stringify({ surum: 2, sid, yollar: simdiki.map((s) => s.anahtar), bildirilen }),
      'utf8',
    )
    fs.renameSync(gecici, TABAN_YOLU)
  } catch (e) {
    process.stderr.write('[bash-write-audit] taban yazilamadi (' + (e && e.code) + ') - sonraki turda tekrar oteriz.\n')
  }
}

// İLK KURULUM: mevcut kirliliğin tamamı taban olur. Aksi hâlde ilk çağrıda 46 dosyalık
// bir alarm yağar ve gerçek sinyal onun içinde kaybolur.
if (!tabanVarDi) {
  tabanYaz(taban.bildirilen)
  uyariBas()
  process.exit(0)
}

/**
 * BİÇİM GEÇİŞİ v1 → v2: eski taban NİTELENMEMİŞ bağıl yollar tutuyordu. Doğrudan
 * karşılaştırsaydık her yol "yeni" görünür ve tek turda onlarca sahte alarm düşerdi. Sessizce
 * geçmiyoruz: taban yeniden kuruluyor ve bu turda alarmın bastırıldığı YAZILIYOR.
 */
if (taban.surum < 2) {
  uyarilar.push(
    '[bash-write-audit] taban BICIMI DEGISTI (v1 -> v2, agac nitelikli anahtar). Taban yeniden ' +
      'kuruldu; BU TURDA alarm bastirildi. Kayip degil, bicim gecisi — sonraki tur normal oter.',
  )
  tabanYaz(taban.bildirilen)
  uyariBas()
  process.exit(0)
}

const tabanKume = new Set(taban.yollar)
const hamYeniler = simdiki.filter((y) => !tabanKume.has(y.anahtar))

/**
 * BİRLEŞTİRME MUAFİYETİ — ölçülmüş kusur (2026-08-28), aynı gün ÜÇ kez ötdü.
 *
 * `git merge origin/master` çalışma ağacına BAŞKA ŞERİTLERİN master'a inmiş dosyalarını
 * getirir. Bunlar "yeni kirli yol"dur ve bu kanca onları bu şeridin yazması sanıyordu.
 * Bugünkü üç vaka: ALTYAPI kendi ağacında 7 dosya (URUN + I18N yolları), AUTH iki kez,
 * URUN bir kez — URUN alarmı bağımsız olarak "bu ihlal değil, merge'in kendisi" diye
 * teşhis etti ve panoya yazdı. Yani ihlal ETİKETİ yanlış kişiye yapışıyordu: içeriği
 * YAZAN değil TAŞIYAN cezalanıyordu.
 *
 * `lane-precommit.cjs`'te bu muafiyet ZATEN VARDI (MERGE_HEAD/CHERRY_PICK_HEAD/REVERT_HEAD);
 * burada yoktu. İki kapının aynı olguya farklı hüküm vermesi, bugün adlandırdığımız
 * "düzeltme yolu kapalı alarm" sınıfının kardeşi: bir kapı normal iş akışını ihlal sayarsa
 * alarm üç gün içinde görmezden gelinir ve GERÇEK sinyal onunla birlikte ölür.
 *
 * FAIL-CLOSED: birleştirme hâli ÖLÇÜLEMEZSE muafiyet AÇILMAZ. Muafiyet bir kapıyı gevşetir;
 * gevşetmenin ölçülemediği yerde varsayılan sıkı olmalı (guard'daki `anaDepoMu` ile aynı ilke).
 *
 * KAPSAM DAR: yalnız birleştirme HÂLİNDEKİ ağacın yeni yolları muaf. Merge commit'lendikten
 * sonra hâl biter, ağaç temizlenir ve bu yollar zaten `simdiki`den düşer — muafiyet kalıcı
 * bir kör nokta bırakmaz. Taban her turda güncellendiği için muaf tutulan yollar sonraki
 * turlarda da alarm üretmez; bu KAYIP değil, aynı olgunun tek kez değerlendirilmesidir.
 */
const BIRLESTIRME_ISARETLERI = ['MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD']

function birlestirmeHali(agac) {
  const gitDir = gitOku(agac, '--absolute-git-dir')
  if (!gitDir) return { hal: null, olculdu: false }
  for (const ad of BIRLESTIRME_ISARETLERI) {
    try {
      if (fs.existsSync(path.join(gitDir, ad))) return { hal: ad, olculdu: true }
    } catch {
      return { hal: null, olculdu: false }
    }
  }
  return { hal: null, olculdu: true }
}

const halCache = new Map()
const halAl = (agac) => {
  if (!halCache.has(agac)) halCache.set(agac, birlestirmeHali(agac))
  return halCache.get(agac)
}

const muafAgaclar = new Map()
const olculemeyenAgaclar = new Set()
const yeniler = hamYeniler.filter((y) => {
  const { hal, olculdu } = halAl(y.agac)
  if (!olculdu) {
    olculemeyenAgaclar.add(y.agac)
    return true // FAIL-CLOSED: ölçemediysem muaf tutmam
  }
  if (!hal) return true
  muafAgaclar.set(y.agac, { hal, sayi: (muafAgaclar.get(y.agac)?.sayi || 0) + 1 })
  return false
})

for (const [agac, { hal, sayi }] of muafAgaclar) {
  uyarilar.push(
    '[bash-write-audit] BIRLESTIRME MUAFIYETI — ' + agac + ' su an ' + hal + ' halinde; ' +
      sayi + ' yeni yol ENTEGRE EDILEN icerik sayildi, serit kapisindan GECIRILMEDI.' +
      '\n  Bunlar bu seridin YAZDIGI is degil, TASIDIGI is. Muafiyet merge bitince kendiliginden kapanir.',
  )
}
for (const agac of olculemeyenAgaclar) {
  uyarilar.push(
    '[bash-write-audit] birlestirme hali OLCULEMEDI (' + agac + ') — muafiyet ACILMADI (fail-closed).' +
      '\n  Alarm oterse once bu agacin git dizinini kontrol et; sessiz muafiyetten iyidir.',
  )
}

if (!yeniler.length) {
  tabanYaz(taban.bildirilen)
  uyariBas()
  process.exit(0)
}

let pano = null
try {
  pano = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
} catch (e) {
  uyarilar.push(
    '[bash-write-audit] pano yuklenemedi (' + (e && e.message) + ') - YENI DEGISEN ' + yeniler.length +
      ' dosyayi serit kapisindan GECIREMEDIM:\n  ' + yeniler.map((y) => y.anahtar).join('\n  '),
  )
  tabanYaz(taban.bildirilen)
  uyariBas()
  process.exit(0)
}

const cokAgac = denetlenecek.length > 1
const etiket = (y) => (cokAgac ? path.basename(y.agac) + ' :: ' + y.bagil : y.bagil)

const bildirilen = new Set(taban.bildirilen)
const ihlaller = []
for (const y of yeniler) {
  let catisma = null
  try {
    catisma = pano.findConflict(path.resolve(y.agac, y.bagil), sid, y.agac)
  } catch {
    continue
  }
  if (catisma && !bildirilen.has(y.anahtar)) {
    ihlaller.push({ y, catisma })
    bildirilen.add(y.anahtar)
  }
}

tabanYaz([...bildirilen])

if (!ihlaller.length) {
  uyariBas()
  process.exit(0)
}

/**
 * ⭐ÜRETİLMİŞ ARTEFAKT İHLALİ ≠ DİKİŞ YERİ İHLALİ (2026-08-30, ölçülmüş alarm gürültüsü).
 *
 * Bu kanca bugün üç ayrı turda öttü ve ÜÇÜNDE DE bulduğu şey aynıydı: `post-commit`
 * üretecinin arka planda yazdığı companion `.md`'ler (`bash-write-audit.md`,
 * `lane-precommit.md`, `AboutPage.md`, `board.md`...). Hiçbiri elle yazılmadı; hiçbiri
 * bir şeridin işine dokunmadı.
 *
 * NİÇİN ONARILIYOR: alarm "başka şeridin dosyasına SEN yazdın" der ve `exit 2` ile
 * dönüp okuyanı durdurur. Üretecin çıktısı için bu cümle YANLIŞ — ve yanlış alarm
 * bedavaya gelmez: bu depoda defalarca yazıldığı gibi, sürekli öten bir kapı üç gün
 * içinde görmezden gelinir. Yani gürültü, kapıyı KÖR ETMENİN yavaş yoludur.
 *
 * SINIFLANDIRMA YAPISALDIR — ad araması DEĞİL (AXIOM 8 dersi: `uretilmis-artefakt-standard.md`):
 *   · manifestte ÜRÜN olarak ilan edilmiş dosya (`artefaktlar[].ad`) — `kaynak.dosyalar`a
 *     BAKILMAZ, orası kaynak listesidir ve ona bakan bir süzgeç kaynağı "üretilmiş" sanar.
 *   · manifestin kendisi.
 *   · companion: `X.md` ve yanında aynı adlı bir KAYNAK dosya (`X.ts` gibi) duruyorsa.
 *
 * ⚠FAIL-CLOSED: sınıf ÖLÇÜLEMEZSE (manifest okunamadı, `statSync` patladı) ihlal GERÇEK
 * sayılır. "Ölçemedim" ile "üretilmiş" aynı kefeye konmaz — bu kancanın kendi cetveli
 * (§5) bunu emrediyor.
 *
 * ⚠KABUL EDİLEN ARTIK RİSK, ADIYLA: başka bir şeridin companion'ını ELLE düzenlersem bu
 * artık bloklamaz, yalnız düşük şiddetle raporlanır. Bilerek: companion üretilmiş dosyadır
 * (AXIOM 3 zaten elle düzenlemeyi yasaklar) ve bir sonraki üretimde ezilir — yani yarıçapı
 * sınırlı. Buna karşılık gürültünün bedeli sınırsızdı.
 */
const KAYNAK_UZANTILARI = ['.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.py']

/** Manifestin ilan ettiği ÜRÜN adları — ağaç başına bir kez okunur. */
const manifestOnbellek = new Map()
function manifestUrunleri(agac) {
  if (manifestOnbellek.has(agac)) return manifestOnbellek.get(agac)
  let sonuc = null // null = ÖLÇÜLEMEDİ (fail-closed sinyali)
  try {
    const ham = fs.readFileSync(path.join(agac, 'docs', 'artefakt_manifest.json'), 'utf8')
    const m = JSON.parse(ham)
    const liste = Array.isArray(m.artefaktlar) ? m.artefaktlar : []
    sonuc = new Set(liste.map((a) => 'docs/' + String(a.ad)).concat(['docs/artefakt_manifest.json']))
  } catch {
    sonuc = null
  }
  manifestOnbellek.set(agac, sonuc)
  return sonuc
}

/** @returns {{uretilmis: boolean, olculdu: boolean, gerekce: string}} */
function uretilmisSinifi(agac, bagil) {
  const yol = String(bagil).replace(/\\/g, '/')
  const urunler = manifestUrunleri(agac)
  if (urunler === null) return { uretilmis: false, olculdu: false, gerekce: 'manifest okunamadi' }
  if (urunler.has(yol)) return { uretilmis: true, olculdu: true, gerekce: 'manifestte URUN' }
  if (!/\.md$/i.test(yol)) return { uretilmis: false, olculdu: true, gerekce: 'md degil' }
  const govde = yol.slice(0, -3)
  for (const uz of KAYNAK_UZANTILARI) {
    try {
      if (fs.statSync(path.join(agac, govde + uz)).isFile()) {
        return { uretilmis: true, olculdu: true, gerekce: 'companion (' + govde.split('/').pop() + uz + ')' }
      }
    } catch { /* yok — sonraki uzantı */ }
  }
  return { uretilmis: false, olculdu: true, gerekce: 'kardes kaynak dosya YOK' }
}

const uretilmisIhlaller = []
const gercekIhlaller = []
for (const i of ihlaller) {
  const s = uretilmisSinifi(i.y.agac, i.y.bagil)
  if (s.uretilmis) uretilmisIhlaller.push({ ...i, gerekce: s.gerekce })
  else {
    if (!s.olculdu) uyarilar.push('[bash-write-audit] sinif OLCULEMEDI (' + s.gerekce + ') — ihlal GERCEK sayildi: ' + etiket(i.y))
    gercekIhlaller.push(i)
  }
}

/**
 * Üretilmiş olanlar GÖRÜNÜR kalır ama BLOKLAMAZ ve panoya not GÖNDERMEZ: not, karşı
 * şeridin dikkatini ister; üreteç çıktısı için bu dikkat boşa harcanır. "Sustu" ile
 * "böyle sınıflandırdı" ayırt edilebilsin diye gerekçe basılır.
 */
if (uretilmisIhlaller.length) {
  process.stderr.write(
    '[bash-write-audit] DUSUK SIDDET — ' + uretilmisIhlaller.length +
      ' URETILMIS artefakt baska seridin globunda degisti (uretec ciktisi, elle yazma DEGIL; panoya not GONDERILMEDI):\n' +
      uretilmisIhlaller.map((i) => '  · ' + etiket(i.y) + '  [' + i.gerekce + ']').join('\n') + '\n',
  )
}

if (!gercekIhlaller.length) {
  uyariBas()
  process.exit(0)
}

const ihlallerAsil = gercekIhlaller

const satirlar = ihlallerAsil.map(
  (i) => '  · ' + etiket(i.y) + '  ->  ' + i.catisma.claim.lane + ' (' + String(i.catisma.claim.sid).slice(0, 8) + ') · kural: ' + i.catisma.glob,
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
for (const i of ihlallerAsil) {
  const anahtar = i.catisma.claim.sid
  if (!lanelereGore.has(anahtar)) lanelereGore.set(anahtar, { claim: i.catisma.claim, satirlar: [] })
  lanelereGore.get(anahtar).satirlar.push('  · ' + etiket(i.y) + ' · kural: ' + i.catisma.glob)
}

for (const { claim, satirlar: laneSatirlar } of lanelereGore.values()) {
  try {
    const hedef = pano.resolveNoteTarget(claim.sid)
    if (!hedef || !hedef.ok) {
      uyarilar.push('[bash-write-audit] pano hedefi cozulemedi (' + (hedef && hedef.reason) + ') - not GONDERILEMEDI.')
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
    uyarilar.push('[bash-write-audit] panoya not yazilamadi (' + (e && e.message) + ') - serit sahibi HABERSIZ.')
  }
}

uyariBas()
process.stderr.write(
  '[bash-write-audit] DIKIS YERI ALARMI — Bash sonrasi BASKA SERIDIN dosyalari degisti' +
    (cokAgac ? ' (agac :: yol)' : '') + ':\n' +
    satirlar.join('\n') +
    '\n  Denetlenen agac(lar): ' + denetlenecek.join(', ') +
    '\n  Bu, PreToolUse kapisinin GOREMEDIGI bir yazma (komut metninde hedef yoktu).\n' +
    '  YAPILACAK: degisikligi geri al (git checkout -- <yol> KENDI dosyanda guvenlidir),\n' +
    '  serit sahibine panoya yaz (otomatik not birakildi) ve isi onun kapisindan gecir.\n',
)
process.exit(2)
