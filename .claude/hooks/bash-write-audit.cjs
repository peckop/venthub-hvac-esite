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
/**
 * ⭐KİMLİK "SAHİPLİK" DEĞİL "AÇILIŞ" KAYDIDIR — ölçülmüş kusur (2026-08-31, §19).
 *
 * Yukarıdaki kimlik→ağaç kuralı bir körlüğü kapattı ama İKİNCİSİNİ açık bıraktı. Ölçüm:
 *   · Bu oturum bütün günü `vh-altyapi-scrubber`da çalıştı; o ağaçta kimlik dosyası HİÇ YOK
 *     (worktree oturum ortasında yaratıldı, orada SessionStart hiç koşmadı). Kimlik dört
 *     BAŞKA ağacı işaretliyordu → denetim alakasız dört ağacı okudu, çalışılan ağacı OKUMADI.
 *   · Ana dizinin kimliği YARIŞ hâlinde: üç şerit de ana dizinde açılıp resume oluyor,
 *     `--absolute-git-dir` orada ORTAK dizinin kendisi, ve EN SON açılan sid'i kazanıyor.
 *     30 Ağustos'ta ölü bir oturumdaydı (`974d15cb`), 31 Ağustos 10:30'da bu oturumun.
 *     Yani paylaşılan ağacın "sahibi" rastgele bir canlı oturum.
 *
 * BEDELİ AYNI GÜN İKİ OLAY: (1) bu oturumun ANA DİZİNDEKİ commit'siz işini kendi denetçisi
 * GÖRMEDİ (kimliği orada değildi) — iş, §16'nın `stash→drop` adımıyla silinmeye bir adım
 * kalmıştı. (2) OPS'un denetçisi kimliği hiçbir ağaçta bulamayıp cwd'ye düştü ve ana dizini
 * KAZARA denetledi; alarmın zemini tasarım değil yedek koldu.
 *
 * ⭐ONARIM SEÇİMİ — GENİŞLET, TAHMİN ETME. Denetlenen küme bir BİRLEŞİMDİR:
 *     kimlik ağaçları  ∪  {cwd'nin ağacı}  ∪  {ORTAK ana ağaç}
 * Süperküme olduğu için kimse kör kalmaz. Kimliği hiçbir yere YAZMAZ, dolayısıyla kimse
 * başkasının kimliğini çalmaz — "çalışılan ağaca kimliği yaz" tasarımı ölçülüp REDDEDİLDİ:
 * bir oturum başkasının ağacına tek satır yazsa o ağacı sahiplenir ve GERÇEK sahibinin
 * denetçisi körleşir; onarım yeni bir sessiz arıza doğurmamalı.
 *
 * ORTAK ANA AĞAÇ NİÇİN KOŞULSUZ: Bash cwd'si bu ortamda sessizce oraya resetlenir (§9), yani
 * HER oturum oraya kazara yazabilir; ağaç PAYLAŞILDIĞI için oradaki commit'siz iş kimin
 * olursa olsun filo çapında kayıp riskidir; ve kimlik o ağaç için doğru cevabı hiç veremez —
 * ana dizin hiçbir şeridin DEĞİLDİR. Bu yüzden oradaki kir şerit ihlali gibi değil,
 * "SAHİBİ ÖLÇÜLMEDİ — ortak ağaç" diye ayrı raporlanır (aşağıda) ve BLOKLAMAZ.
 *
 * KAYNAK ETİKETİ: her ağacın kümeye NİÇİN girdiği taşınır (kimlik/cwd/ortak-ana). Atıf gücü
 * bulguyla birlikte basılmazsa okuyan "benim yazdığım" sanır — bugün tam bu yanlış atıf oldu.
 */
const ORTAK_ANA = 'ortak-ana'

function agaclariCoz() {
  const ortakHam = gitOku(cwdKok, '--git-common-dir')
  if (!ortakHam) return { kaynaklar: new Map(), sebep: 'ortak git dizini cozulemedi (cwd: ' + cwdKok + ')' }
  const ortak = path.resolve(cwdKok, ortakHam)

  // Ağaç yolları EĞİK ÇİZGİYE normalize edilir: bu depodaki bütün kanca çıktıları ve claim
  // glob'ları eğik çizgi kullanıyor; ters bölülü bir yol raporda kopyala-yapıştır edilemez ve
  // karşılaştırmalarda sessizce eşleşmez.
  const duzelt = (a) => path.resolve(a).replace(/\\/g, '/')
  const kaynaklar = new Map()
  const ekle = (agac, kaynak) => {
    if (!agac) return
    const y = duzelt(agac)
    try {
      if (!fs.statSync(y).isDirectory()) return
    } catch {
      return
    }
    if (!kaynaklar.has(y)) kaynaklar.set(y, new Set())
    kaynaklar.get(y).add(kaynak)
  }

  let kimlikSayisi = 0
  if (kimlikOku(path.join(ortak, 'venthub-sid')) === sid) {
    ekle(path.dirname(ortak), 'kimlik')
    kimlikSayisi++
  }

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
    ekle(path.dirname(path.resolve(gitdir)), 'kimlik')
    kimlikSayisi++
  }

  // cwd'nin AĞACI — cwd'nin kendisi değil: alt dizinde koşuyorsak `git status` oradan da
  // çalışır ama yollar ağaç köküne göre gelmez ve taban anahtarları eşleşmez.
  ekle(gitOku(cwdKok, '--show-toplevel') || cwdKok, 'cwd')

  // ORTAK ana ağaç: ortak git dizininin ÜSTÜ. `--show-toplevel` burada işe yaramaz (worktree
  // içinden çağrıldığında o worktree'yi verir); ortak dizinin konumu tek güvenilir yoldur.
  ekle(path.dirname(ortak), ORTAK_ANA)

  return {
    kaynaklar,
    kimlikSayisi,
    sebep: kimlikSayisi ? '' : 'bu sid hicbir agacin venthub-sid dosyasinda kayitli degil',
  }
}

const { kaynaklar, kimlikSayisi, sebep } = agaclariCoz()
const denetlenecek = [...kaynaklar.keys()]
/**
 * ⭐ORTAK-ANA BASKINDIR — cwd ve kimlik onu BASTIRAMAZ (2026-08-31 akşamı, §20).
 *
 * İlk yazımda ölçüt `kaynak sayısı === 1 && ortak-ana` idi: "bu ağaç kümeye YALNIZ ortak-ana
 * olduğu için girdiyse bu şeride atfedilemez". Aynı gün ölçtüm ve **kol fiilen hiç devreye
 * girmiyordu**: bu ortamda Bash cwd'si sessizce ana dizine resetlenir (§9), dolayısıyla ortak
 * ana ağaç neredeyse HER TURDA `cwd` kaynağıyla da kümeye giriyor → `size === 2` → ayrı muamele
 * kapalı. Yani "SAHİBİ ÖLÇÜLMEDİ" raporu ve bloklamama davranışı, yazıldığı gün ölü doğmuştu.
 *
 * Kanıt (kendi tabanımdan): ortak ağaç denetlendi ve 5 yol tabana girdi — ama `cwd` orada
 * olduğu için ortak-ağaç kolu değil, DİKİŞ YERİ kolu geçerliydi.
 *
 * ⭐DÜZELTME BİR TERCİH DEĞİL, §19'un ZORUNLU SONUCU: "ana dizin hiçbir şeridin DEĞİLDİR."
 * O hüküm doğruysa, ortak ağaç için cwd de kimlik de sahiplik kanıtı ÜRETEMEZ:
 *   · `cwd` orada olması = **resetin artığı**, niyetin değil.
 *   · kimlik orada olması = **yarışın kazananı** (ölçüldü: aynı dosya bir gün içinde iki farklı
 *     oturumun sid'ini taşıdı; sonuncusu bu şeridin merge'inden BİR DAKİKA sonra yazılmıştı).
 * İkisi de "kim yazdı" sorusunu cevaplamaz. Bu yüzden ortak-ana etiketi DİĞER BÜTÜN
 * KAYNAKLARI EZER.
 *
 * ⚠KABUL EDİLEN BEDEL, ADIYLA: ortak ağaçta yapılan GERÇEK bir şerit ihlali artık `exit 2` ile
 * BLOKLAMAZ, yalnız görünür uyarı verir. Bilerek: (a) atfedemediğimiz bir kir için bu oturumun
 * Bash'ini durdurmak yanlış hüküm verir ve alarmı üç günde körleştirir (bu dosyanın kendi
 * tarihi); (b) yaptırım yolu KAPALI DEĞİL — `lane-precommit` (E1) commit anında hâlâ bloklar ve
 * kimliğini env'den ASIL kanıt olarak alır. Yani ortak ağaçta kaybedilen şey bloklama değil,
 * yalnızca YANLIŞ ADRESE yazılmış bir bloklamadır.
 */
const ortakAgacMi = (agac) => Boolean(kaynaklar.get(agac)?.has(ORTAK_ANA))

if (!denetlenecek.length) {
  uyarilar.push(
    '[bash-write-audit] HICBIR AGAC COZULEMEDI (' + sebep + ') — DENETIM YAPILMADI.' +
      '\n  Bu sessizlik degil KORLUK: cwd (' + cwdKok + ') bir git agaci olarak cozulemedi.',
  )
} else if (!kimlikSayisi) {
  uyarilar.push(
    '[bash-write-audit] KIMLIK YOK (' + sebep + ') — cwd agaci + ORTAK ana agac denetlendi.' +
      '\n  Bu sid hicbir agaci isaretlemiyor; calistigin worktree kimliksiz olabilir (oturum' +
      '\n  ortasinda yaratilmis agaclarda SessionStart hic kosmaz). Onarim: bu worktree de bir' +
      '\n  oturum acilisi yap. Kimlik SAHIPLIK degil ACILIS kaydidir (cetvel §19).',
  )
} else if (kimlikSayisi > 1) {
  uyarilar.push(
    '[bash-write-audit] SID TEKIL DEGIL — ' + kimlikSayisi +
      ' agac ayni kimligi tasiyor. HICBIRINI SECMEDIM, HEPSINI denetliyorum.',
  )
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
        ts: Number(okunan.ts) || 0,
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
      // `ts` (surum 3): tabanin YAZILDIGI an. Bkz. aşağıdaki pencere ayrımı — bu damga
      // olmadan "senin Bash'in yazdı" ile "sen yokken oldu" ayırt EDİLEMEZ.
      JSON.stringify({ surum: 3, sid, ts: Date.now(), yollar: simdiki.map((s) => s.anahtar), bildirilen }),
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

/**
 * ⭐GENİŞLEYEN KÜME İÇİN AYRI "SOĞURMA" KATMANI YAZILDI VE SÖKÜLDÜ — kaydı burada duruyor.
 *
 * Denetlenen küme artık cwd ağacını ve ortak ana ağacı da kapsıyor. İlk düşünce: bir ağaç kümeye
 * İLK KEZ katıldığında oradaki mevcut kirlilik "taban kümesinde yok" görünür, o yüzden tek turluk
 * soğurulmalı. Tabana `agaclar` alanı (surum 4) eklendi ve geçiş için ağaçlar taban
 * ANAHTARLARINDAN türetildi.
 *
 * ⭐KAPI ÜÇ KOLDAN KIRMIZI VERDİ VE HAKLIYDI. Türetme çöküyor: taban `yollar: []` olabilir
 * (ağaç TEMİZKEN yazılmış taban — tamamen meşru hâl), ve o zaman "hiçbir ağaç bilinmiyor" →
 * HEPSİ yeni → her şey soğuruluyor. Yani katman, gerçek ihlali de yutan tek turluk tam körlük
 * üretiyordu. Fikstürde ölçüldü: `PENCERE ICI` kolu exit 2 yerine 0 döndü.
 *
 * ⭐SÖKÜLME GEREKÇESİ (yalnız "bozuktu" değil): katman GEREKSİZDİ. Eski kirin doğru sınıflandırması
 * ZATEN VAR — PENCERE AYRIMI (aşağıda): mtime'ı taban damgasından eski olan kalem şerit sahibine
 * alarm ÜRETMEZ, kendi satırıyla uyarı olarak basılır. Yani genişleyen kümenin getirdiği eski
 * kirlilik için doğru cevabı veren bir katman zaten işliyordu; ikinci bir katman aynı işi daha
 * kaba (ağaç bazında, tek turluk, körleştirebilen) yapıyordu.
 *
 * DERS, ADIYLA: yeni bir kapı eklemeden önce "bu olguyu ölçen bir katman ZATEN VAR MI" sorulur.
 * Bugün bu soruyu iki kez atladım — biri buydu, diğeri `kimlik.cjs`in bu kancaya hiç bağlanmamış
 * olmasıydı. `agaclar` alanı da GERİ ALINDI: hiçbir kolun okumadığı bir taban alanı, ileride
 * "mekanizma var sanılan" ölü kayıt olur.
 */
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
const birlestirmeSonrasi = hamYeniler.filter((y) => {
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

/**
 * ⭐PENCERE AYRIMI (2026-08-28, REC-84) — ölçtüğüm şey ile İDDİA ETTİĞİM şey aynı olmalı.
 *
 * Bu kanca "taban kümesinde yoktu, şimdi var" ölçer. Alarmın metni ise "Bash SONRASI değişti"
 * diyordu — bu bir NEDENSELLİK iddiasıdır ve ölçüm onu desteklemiyor. Taban dosyası
 * (`.bash-audit-<sid>.json`) OTURUMLAR ARASI kalıcıdır: oturum kapalıyken doğan bir dosya,
 * dönüşte "senin Bash'in yazdı" gibi görünür.
 *
 * ÖLÇÜLDÜ: bugün üç kez "üretim yolu kaçağı" diye alarm veren iki dosyanın
 * (`build-skip-positive-logic.test.md`, `search-route-ssot.test.md`) mtime'ı BİR ÖNCEKİ
 * GÜNDÜ. Süzgeç doğru çalışıyordu (`GIRDI 3 satir · CIKAN 1 yol`), üretim yolu kaçırmıyordu;
 * yanlış olan alarmın cümlesiydi. İki şerit boşuna iş çıkardı.
 *
 * AYRIM: dosyanın mtime'ı tabanın yazıldığı andan ESKİYSE, o dosya bu pencerede doğmadı.
 * Böyle kalemler ŞERİT SAHİBİNE ALARM OLARAK GİTMEZ — sessizce de yutulmaz, kendi
 * satırlarıyla uyarı olarak basılır ve tabana alınır (bir daha ötmez).
 *
 * TOLERANS: taban yazımı ile dosya yazımı aynı saniyeye düşebilir; 2 sn'lik pay bırakıldı.
 * Pay YÖNÜ bilinçli — şüpheli kalemi "bu pencerede" saymak yanlış-pozitif üretir, tersi
 * yanlış-negatif; ikisi arasında yanlış-pozitifi seçiyoruz çünkü asıl ihlal SESSİZ KALMAMALI.
 *
 * ⚠SIRA BİLİNÇLİ (2026-08-30, bu iki katman ilk kez yan yana geldi): önce BİRLEŞTİRME
 * MUAFİYETİ, sonra PENCERE. Merge'in taşıdığı dosya zaten bu şeridin yazması değildir —
 * onu önce elemek, "pencere dışı" raporunu merge artıklarıyla şişirmeyi önler. Ters sıra
 * aynı dosyayı iki kez ve iki farklı gerekçeyle anlatırdı; rapor okunaksızlaşır.
 */
const TOLERANS_MS = 2000
const dosyaZamani = (y) => {
  try {
    return fs.statSync(path.resolve(y.agac, y.bagil)).mtimeMs
  } catch {
    return null // silinmiş/erişilemez: yaşını bilemeyiz, pencere İÇİ sayarız (sessiz kalmaktansa)
  }
}

const bayatlar = []
const yeniler = []
for (const y of birlestirmeSonrasi) {
  const mt = taban.ts ? dosyaZamani(y) : null
  if (taban.ts && mt !== null && mt < taban.ts - TOLERANS_MS) bayatlar.push({ ...y, mt })
  else yeniler.push(y)
}

if (bayatlar.length) {
  const bicim = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ')
  uyarilar.push(
    '[bash-write-audit] PENCERE DISI ' + bayatlar.length + ' kalem — bu Bash cagrisinin ESERI DEGIL, ' +
      'taban yazildigindan (' + bicim(taban.ts) + ') ONCE olusmuslar. Serit sahibine alarm GITMEDI:\n' +
      bayatlar.map((b) => '  · ' + b.anahtar + '  (mtime ' + bicim(b.mt) + ')').join('\n') +
      '\n  Sebep genellikle oturum araligi: taban dosyasi oturumlar arasi kalicidir.',
  )
}

if (!taban.ts && birlestirmeSonrasi.length) {
  uyarilar.push(
    '[bash-write-audit] taban ZAMAN DAMGASIZ (surum<3) — pencere ayrimi yapilamadi, ' +
      birlestirmeSonrasi.length + ' kalem "bu turda olustu" SAYILDI. Bir sonraki tur damgali olacak.',
  )
}

/**
 * ⭐ORTAK AĞAÇ KOLU — "sahibi ölçülmedi" ile "sen yazdın" AYNI CÜMLE DEĞİLDİR (2026-08-31, §19).
 *
 * Ortak ana ağaç kümeye KOŞULSUZ girer (yukarı bkz.), ama oradaki kir bu şeride ATFEDİLEMEZ:
 * ağaç paylaşılır, cwd oraya sessizce resetlenir, ve kimliği yarışın kazananı taşır. Bu yüzden
 * ortak ağaçtaki kalemler dikiş yeri alarmından ÖNCE ayrılır:
 *   · rapor cümlesi atıf İDDİA ETMEZ ("sahibi ölçülmedi"),
 *   · `exit 2` ile BLOKLAMAZ — başkasının kirinden bu oturumun Bash'ini durdurmak yanlış olur,
 *   · buna karşılık SESSİZ DE KALMAZ: ortak ağaçta commit'siz iş kimin olursa olsun kayıp
 *     riskidir, çünkü §16 tazelemesi `stash → pull → drop` içerir.
 *
 * ⭐CLAIM'DEN BAĞIMSIZ, BİLİNÇLİ: dikiş yeri kolu "bu yol BAŞKASININ glob'unda mı" sorar; burada
 * o soru YETMEZ. §16'nın ön koşulu daha geniştir — "companion olmayan TEK kirli dosya varsa
 * tazeleme YAPILMAZ" — ve hiç kimsenin glob'una girmeyen bir dosya da o koşulu tetikler. Kolu
 * claim'e bağlasaydık, sahipsiz bir dosya ortak ağaçta sessizce durur ve ilk tazelemede ölürdü.
 * Böylece bu kol, §16'nın YALNIZ tazeleme anında ölçülen ön koşulunu SÜREKLİ ölçülür hâle
 * getiriyor: yeni bir kural değil, var olan kuralın gözü.
 *
 * ÜRETİLMİŞ ARTEFAKTLAR DIŞARIDA: `post-commit` üreteci ortak ağaçta durmadan companion `.md`
 * yazar. Onları rapor etmek kolu üç günde kör eder (bu dosyanın kendi tarihi). Sınıflandırma
 * FAIL-CLOSED: ölçülemeyen kalem RAPOR EDİLİR.
 *
 * TEK KEZ ÖTER: taban her turda `simdiki`nin tamamını (ortak ağaç dahil) yazdığı için her yeni
 * kirli yol yalnız BİR kez rapor edilir. Sürekli tekrar, tam da kaçınılan gürültü olurdu.
 */
const ortakKalemler = []
if (yeniler.length) {
  const kalanlar = []
  for (const y of yeniler) {
    if (!ortakAgacMi(y.agac)) {
      kalanlar.push(y)
      continue
    }
    const s = uretilmisSinifi(y.agac, y.bagil)
    if (s.uretilmis) continue // üreteç çıktısı — ortak ağaçta beklenen hâl
    ortakKalemler.push({ ...y, gerekce: s.olculdu ? s.gerekce : 'SINIF OLCULEMEDI (' + s.gerekce + ')' })
  }
  yeniler.splice(0, yeniler.length, ...kalanlar)
}

if (ortakKalemler.length) {
  process.stderr.write(
    '[bash-write-audit] ⛔ORTAK AGAC UYARISI — ' + ortakKalemler.length +
      ' commit siz dosya PAYLASILAN ana agacta:\n' +
      ortakKalemler.map((o) => '  · ' + o.bagil + '  [' + o.gerekce + ']').join('\n') +
      '\n  Agac: ' + [...new Set(ortakKalemler.map((o) => o.agac))].join(', ') +
      '\n  ⭐SAHIBI OLCULMEDI: bu, bu oturumun yazdiginin KANITI DEGIL — ortak agaca her oturum' +
      '\n  yazabilir (Bash cwd si sessizce oraya resetlenir) ve kimlik dosyasi orada sahiplik' +
      '\n  BELIRTMEZ (yarisin kazanani; cetvel §19). Bloklamadim.' +
      '\n  ⚠NICIN ONEMLI: §16 tazelemesi stash -> pull -> DROP icerir; buradaki commit siz is' +
      '\n  bir sonraki tazelemede SILINIR. Is senin ise: kendi worktree ine tasi (patch + taze' +
      '\n  dal), hash ile dogrula, sonra ana dizini temizle. Senin degilse panoya yaz.\n',
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
        'OTOMATIK ALARM (bash-write-audit): SENIN SERIDINDEKI dosya(lar) benim calisma ' +
        'agacimda, BU BASH CAGRISININ PENCERESINDE degisti (dosya mtime > taban damgasi; ' +
        'pencere disi kalemler bu alarma GIRMEZ). Kasten olmamis olabilir ama SONUC ayni.\n' +
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
  '[bash-write-audit] DIKIS YERI ALARMI — BU PENCEREDE baska seridin dosyalari degisti' +
    (cokAgac ? ' (agac :: yol)' : '') + ':\n' +
    satirlar.join('\n') +
    '\n  Denetlenen agac(lar): ' + denetlenecek.join(', ') +
    '\n  Bu, PreToolUse kapisinin GOREMEDIGI bir yazma (komut metninde hedef yoktu).\n' +
    '  YAPILACAK: degisikligi geri al (git checkout -- <yol> KENDI dosyanda guvenlidir),\n' +
    '  serit sahibine panoya yaz (otomatik not birakildi) ve isi onun kapisindan gecir.\n',
)
process.exit(2)
