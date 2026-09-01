#!/usr/bin/env node
/**
 * TABAN-TAZELEME — dal ağacını `origin/master` ile tek komutta hizalar (ALTYAPI).
 *
 * NİÇİN VAR
 * =========
 * Ölçüldü (2026-08-31, `origin/master` son 20 commit): çakışan dosyaların **tamamı**
 * üretilmiş artefakt (4 master `.md` + `docs/artefakt_manifest.json`), ve son 20 master
 * commit'inin **16'sı** bunlardan birine dokunuyor → geride kalmış bir dalın taban
 * tazelemesinde çakışma olasılığı pratikte **%80**. Her seferinde elle çözülüyordu.
 *
 * NEDEN `.gitattributes merge=ours` DEĞİL (ölçülmüş üç sebep — gelecekte isteyen için)
 * ====================================================================================
 *   1. `merge=ours` master'ın YENİ artefakt içeriğini SESSİZCE atar. INV-DOC-4b bunu
 *      çoğu halde kırmızı yapar (kaynak blob SHA ↔ manifest kaydı) AMA master'ın
 *      artefaktı yalnız DAMGA yüzünden değiştiyse kaynak SHA'ları eşleşmeye devam eder
 *      → kapı YEŞİL kalır ve geri alma görünmez. Kör nokta ölçüldü, varsayılmadı.
 *   2. Sürücü `.git/config`'te yaşar, commit EDİLEMEZ → GitHub tarafı onu hiç koşmaz;
 *      yani §20'nin "çakışık PR'a hiç kapı koşmaz" problemini ÇÖZMEZ.
 *   3. Deney (git 2.49.0, izole depo): sürücü tanımlıyken çakışma yok/dalın sürümü
 *      alınır, sürücü tanımsızken bugünkü davranışın AYNISI. Yani A'nın tek kazancı
 *      yerel kolaylıktı ve bedeli sessizlikti.
 *
 * BU BETİĞİN FARKI — RİSK YAPISAL OLARAK YOK
 * ==========================================
 * A'nın tek gerçek riski "AXIOM 7 ikinci turunu unutmak"tı ve tek koruması INV-DOC-4b idi.
 * Burada yeniden üretim merge ile **aynı komutun içinde** olduğu için unutulacak bir adım
 * kalmıyor; INV-DOC-4b yedek katman olarak kalıyor, tek katman olmaktan çıkıyor.
 *
 * FAIL-CLOSED HÜKÜMLERİ (hepsi ölçülmüş bir dersin karşılığı)
 * ===========================================================
 *   · İlan listesi MANİFESTTEN okunur, gömülü DEĞİLDİR — gömülü liste manifest büyüyünce
 *     sessizce eksik kalır ve "ilan dışı" olan bir yol otomatik çözülüp geçerdi.
 *   · İlan DIŞI tek bir yolda bile çakışma varsa DURULUR; merge yarım bırakılır ve karar
 *     insana kalır. "Çoğu artefakttı" gerekçesiyle devam etmek tam da sessiz kaybın kapısı.
 *   · Ağaç kirliyse hiç başlanmaz (merge kirli ağaçta iş kaybettirir).
 *   · Yeniden üretim SADECE manifestin ilan ettiği artefakt yollarını commit'ler. Başka bir
 *     yol değiştiyse RAPOR EDİLİR, commit EDİLMEZ — şerit claim'i dışına izinsiz çıkmam.
 *   · ÇIKIŞ KODU DÜRÜST: kısmi başarıda 0 dönülmez (0 = merge tamam + üretim tamam +
 *     kapı yeşil). Ölçülemeyen adım "geçti" sayılmaz.
 *   · Her git çağrısı `-C <ağaç>` ile yapılır — `cwd` sessizce ana dizine resetlenebiliyor
 *     (2026-08-31'de defalarca ölçüldü, biri testleri yanlış ağaçta koşturdu).
 *
 * Yöneten cetveller: `docs/standards/uretilmis-artefakt-standard.md` (AXIOM 7, INV-DOC-4b)
 * ve `docs/standards/fleet-mechanism-standard.md` (hijyen araçları, §20 self-merge ritüeli).
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const MANIFEST_YOLU = 'docs/artefakt_manifest.json'
const ISTISNA_YOLU = 'docs/artefakt-ilan-istisnalari.json'
const TAZELIK_KAPISI = 'src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts'

/**
 * Her git cagrisi -C ile. cwd'ye ASLA guvenilmez.
 * `ham: true` -> cikti TRIM EDILMEZ. Bu bir suslemeleme degil: `status --porcelain`
 * satirlari SUTUN duyarlidir (` M yol` ilk iki sutun durum kodudur) ve trim ilk satirin
 * BASTAKI BOSLUGUNU yer. 2026-09-01'de tam bu yuzden ` M docs/x` yolu `ocs/x` diye
 * ayristirildi, ilan listesiyle hicbir zaman eslesmedi ve degisen artefakt SESSIZCE
 * commit edilmedi. Kusuru fikstur degil GERCEK agacta kosturmak buldu.
 */
function git(agac, args, { yut = false, ham = false } = {}) {
  try {
    const cikti = execFileSync('git', ['-C', agac, ...args], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
    return ham ? cikti : cikti.trim()
  } catch (e) {
    if (yut) return null
    const detay = String((e && e.stdout) || '') + String((e && e.stderr) || '')
    const hata = new Error('git ' + args.join(' ') + ' basarisiz\n' + detay.trim())
    hata.gitCikti = detay
    throw hata
  }
}

/**
 * ILAN EDILMIS ARTEFAKT YOLLARI — MANIFESTTEN, gomulu listeden DEGIL.
 * `yol` alani ZORUNLU: `ad` alanindan yol turetmek ('docs/' + ad) manifest duzeni
 * degisirse sessizce yanlis kume uretir. Alan adi birimini taahhut eder.
 */
function ilanEdilmisYollar(manifestMetni) {
  let m
  try {
    m = JSON.parse(manifestMetni)
  } catch (e) {
    throw new Error('manifest AYRISTIRILAMADI: ' + (e && e.message))
  }
  if (!Array.isArray(m.artefaktlar)) throw new Error('manifestte artefaktlar dizisi YOK')
  if (m.artefaktlar.length === 0) throw new Error('manifest BOS artefakt ilan ediyor — fail-closed')
  const yollar = new Set([MANIFEST_YOLU])
  for (const a of m.artefaktlar) {
    if (!a || typeof a.yol !== 'string' || !a.yol.trim()) {
      throw new Error('manifest kaydinda yol alani YOK: ' + JSON.stringify(a && a.ad))
    }
    yollar.add(a.yol.replace(/\\/g, '/').trim())
  }
  return yollar
}

/**
 * TOLERE EDILEN KIRLILIK — `docs/artefakt-ilan-istisnalari.json`'un ILAN ETTIGI yollar.
 *
 * NICIN VAR: bu dosyalar (`docs/system_tree.md`, `docs/database_schema_master.md`,
 * `docs/venthub_skills_master.md`) her commit'ten SONRA `post-commit` kancasi tarafindan
 * yeniden uretilir ve damgalari degistigi icin agac SUREKLI kirli kalir. Yani "agac temiz
 * olmali" onkosulu, kendi kancamiz yuzunden ASLA saglanamaz — arac hicbir zaman baslamaz.
 * Bunlari GOMULU bir listeye yazmak yerine ILAN kaynagindan okuyoruz: ilan listesi degisince
 * arac kendiliginde hizalanir, ve tolere edilen her kalem zaten gerekcesiyle yazili.
 *
 * FAIL-CLOSED: ilan dosyasi okunamaz/bozuksa BOS kume donulur — yani hicbir sey tolere
 * edilmez ve arac kirli agacta DURUR. Olcemedigimiz yerde ihtiyatli davranilir.
 */
function tolereEdilenKirlilik(metin) {
  if (!metin) return new Set()
  try {
    const j = JSON.parse(metin)
    if (!Array.isArray(j.istisnalar)) return new Set()
    return new Set(
      j.istisnalar
        .map((i) => (i && typeof i.yol === 'string' ? i.yol.replace(/\\/g, '/').trim() : ''))
        .filter(Boolean),
    )
  } catch {
    return new Set()
  }
}

/** Cakisanlari ILAN EDILMIS / ILAN DISI diye ayirir. Ilan disi TEK yol bile varsa durulur. */
function cakismaSiniflandir(cakisanlar, ilanlar) {
  const ilan = []
  const disi = []
  for (const y of cakisanlar) {
    const temiz = String(y).replace(/\\/g, '/').trim()
    if (!temiz) continue
    if (ilanlar.has(temiz)) ilan.push(temiz)
    else disi.push(temiz)
  }
  return { ilan, disi }
}

/**
 * Yorumlayici secimi. `TABAN_TAZELE_PYTHON` ortam degiskeni her seyi EZER — bu bir
 * test kacamagi DEGIL, kapinin olcebilmesi icin acilmis ADI KONMUS bir dikis:
 * "doc build BASARISIZ olursa cikis kodu 3 mu" sorusu ancak basarisizlik
 * URETILEBILIYORSA olculebilir. Olculemeyen dal, yazilmamis dal kadar korumasizdir.
 */
function pythonSec(agac) {
  const zorlanan = process.env.TABAN_TAZELE_PYTHON
  if (zorlanan) return zorlanan
  for (const aday of ['.venv/Scripts/python.exe', '.venv/Scripts/python', '.venv/bin/python']) {
    if (fs.existsSync(path.join(agac, aday))) return path.join(agac, aday)
  }
  return 'python'
}

/**
 * AXIOM 7 IKINCI TURU — --force-sync ZORUNLU ve bayrak burada SABIT.
 * Ucuncu-olcut dersi: arac ile kapi farkli olcut kullanirsa sessiz atlama olur;
 * --force-sync olmadan gecersiz MD'de derleme atlanir ve kapi kirmizi kalir.
 */
function docBuildArgumanlari(agac) {
  return ['-m', 'orion.cli.main', 'doc', 'build', '--force-sync', '--repo-root', agac]
}

/**
 * Derleme komutunu TAMAMEN ezmek icin dikis: `TABAN_TAZELE_BUILD_CMD` bir JSON dizisidir
 * (ilk oge calistirilabilir, gerisi arguman). Iki mesru kullanimi var:
 *   1. orion baska bicimde cagrilan bir depoda calistirmak,
 *   2. ⭐KAPININ KENDISI: "derleme BASARILI ama kapi kosmadi" ile "derleme BASARISIZ" dallari
 *      ancak ikisi de URETILEBILIYORSA olculebilir. Yorumlayici yolunu ezmek yetmiyordu —
 *      CI kosucusunda orion KURULU DEGIL, dolayisiyla "basarili derleme" dali orada HIC
 *      kosmuyordu ve o dala konan bir sabotaj CI'da fark edilmezdi. (2026-09-01'de olculdu:
 *      yerelde yesil olan kol CI'da 3 dondu, cunku onkosul ORTAMA BAGLIYDI.)
 * Gecersiz JSON verilirse fail-closed: yok sayilmaz, HATA basilir ve normal yola donulur.
 */
function docBuildKomutu(agac) {
  const ham = process.env.TABAN_TAZELE_BUILD_CMD
  if (ham) {
    try {
      const dizi = JSON.parse(ham)
      if (Array.isArray(dizi) && dizi.length && dizi.every((x) => typeof x === 'string')) {
        return { calistirilabilir: dizi[0], args: dizi.slice(1) }
      }
      console.error('TABAN_TAZELE_BUILD_CMD dizi-of-string DEGIL — yok sayiliyor.')
    } catch (e) {
      console.error('TABAN_TAZELE_BUILD_CMD gecersiz JSON — yok sayiliyor: ' + (e && e.message))
    }
  }
  return { calistirilabilir: pythonSec(agac), args: docBuildArgumanlari(agac) }
}

function docBuildKos(agac) {
  const { calistirilabilir: py, args } = docBuildKomutu(agac)
  try {
    const cikti = execFileSync(py, args, {
      encoding: 'utf8',
      cwd: agac,
      maxBuffer: 64 * 1024 * 1024,
    })
    return { tamam: true, cikti: String(cikti) }
  } catch (e) {
    return {
      tamam: false,
      cikti: String((e && e.stdout) || '') + String((e && e.stderr) || (e && e.message) || ''),
    }
  }
}

/**
 * `git status --porcelain` ciktisindan YOL listesi. Bicim SUTUN duyarlidir:
 *   XY<bosluk><yol>            (X ve Y durum kodu; biri bosluk OLABILIR)
 *   XY<bosluk><eski> -> <yeni> (yeniden adlandirma; ilgilendigimiz YENI yol)
 * Yollar bosluk iceriyorsa git onlari tirnaklar; tirnak soyulur.
 */
function porcelainYollari(cikti) {
  const yollar = []
  for (const satirHam of String(cikti).split('\n')) {
    const satir = satirHam.replace(/\r$/, '')
    if (satir.length < 4) continue
    let yol = satir.slice(3)
    const ok = yol.indexOf(' -> ')
    if (ok >= 0) yol = yol.slice(ok + 4)
    yol = yol.trim()
    if (yol.startsWith('"') && yol.endsWith('"')) yol = yol.slice(1, -1)
    if (yol) yollar.push(yol.replace(/\\/g, '/'))
  }
  return yollar
}

function kirliYollar(agac) {
  return porcelainYollari(git(agac, ['status', '--porcelain'], { ham: true }))
}

function main() {
  const argv = process.argv.slice(2)
  const al = (ad, varsayilan) => {
    const i = argv.indexOf(ad)
    return i >= 0 && argv[i + 1] ? argv[i + 1] : varsayilan
  }
  const agacHam = al('--agac', process.cwd())
  const taban = al('--taban', 'origin/master')
  const kapiKos = !argv.includes('--kapisiz')

  const agac = path.resolve(agacHam).replace(/\\/g, '/')
  console.log('== TABAN-TAZELEME ==')
  console.log('agac  :', agac)
  console.log('taban :', taban)

  const kok = git(agac, ['rev-parse', '--show-toplevel'], { yut: true })
  if (!kok) {
    console.error('DURDU: bu bir git agaci degil -> ' + agac)
    return 2
  }

  const tolere = tolereEdilenKirlilik(git(agac, ['show', 'HEAD:' + ISTISNA_YOLU], { yut: true }))
  const kirliHepsi = kirliYollar(agac)
  const kirli = kirliHepsi.filter((y) => !tolere.has(y))
  const tolereEdilen = kirliHepsi.filter((y) => tolere.has(y))
  if (tolereEdilen.length) {
    console.log('tolere edilen kirlilik: ' + tolereEdilen.length + ' yol (' + ISTISNA_YOLU + " ILAN ETMIS)")
    tolereEdilen.forEach((y) => console.log('   tolere: ' + y))
  }
  if (kirli.length) {
    console.error('DURDU: agac KIRLI (' + kirli.length + ' yol) — merge kirli agacta is kaybettirir.')
    kirli.slice(0, 20).forEach((y) => console.error('   ' + y))
    return 2
  }

  // Taban UZAK bir ref ise (`origin/master`) once cekilir. YEREL bir dal adi verildiyse
  // (fikstur, deney) fetch HIC denenmez — olmayan uzagi yoklamak gurultu uretir.
  if (taban.includes('/')) {
    const [uzak, ...kalan] = taban.split('/')
    git(agac, ['fetch', uzak, kalan.join('/'), '--prune'], { yut: true })
  }

  const manifestMetni = git(agac, ['show', 'HEAD:' + MANIFEST_YOLU], { yut: true })
  if (!manifestMetni) {
    console.error('DURDU: ' + MANIFEST_YOLU + ' HEAD agacinda OKUNAMADI — ilan listesi olcumsuz.')
    return 2
  }
  let ilanlar
  try {
    ilanlar = ilanEdilmisYollar(manifestMetni)
  } catch (e) {
    console.error('DURDU: ' + (e && e.message))
    return 2
  }
  console.log('ilan edilmis artefakt: ' + ilanlar.size + ' yol (MANIFESTTEN okundu)')

  console.log('geride: ' + git(agac, ['rev-list', '--count', 'HEAD..' + taban]) + ' commit')

  let cozulen = []
  try {
    git(agac, ['merge', taban, '--no-edit'])
    console.log('MERGE: cakismasiz tamamlandi.')
  } catch (e) {
    const cakisanlarHam = git(agac, ['diff', '--name-only', '--diff-filter=U'], { yut: true })
    const cakisanlar = cakisanlarHam ? cakisanlarHam.split('\n').filter(Boolean) : []
    if (!cakisanlar.length) {
      console.error('DURDU: merge basarisiz ama cakisan yol LISTELENEMEDI — sebep baska.')
      console.error(String(e.gitCikti || e.message).slice(0, 800))
      return 2
    }
    const { ilan, disi } = cakismaSiniflandir(cakisanlar, ilanlar)
    if (disi.length) {
      console.error('DURDU (fail-closed): ILAN DISI ' + disi.length + ' yolda cakisma var.')
      disi.forEach((y) => console.error('   ILAN DISI: ' + y))
      ilan.forEach((y) => console.error('   (ilan edilmis: ' + y + ')'))
      console.error('Merge YARIM birakildi — karar senin. Vazgecmek icin:')
      console.error('   git -C ' + agac + ' merge --abort')
      return 2
    }
    for (const y of ilan) {
      git(agac, ['checkout', '--ours', '--', y])
      git(agac, ['add', '--', y])
    }
    git(agac, ['commit', '--no-edit'])
    cozulen = ilan
    console.log('MERGE: ' + ilan.length + ' ilan edilmis artefaktta cakisma OTOMATIK cozuldu (ours).')
    ilan.forEach((y) => console.log('   ours -> ' + y))
  }

  /**
   * TAZELIK KAPISINI kos. `null` = kosulamadi (arac yok / kapi kapatilmis).
   * `npx` KULLANILMAZ: Windows'ta npx bir .cmd sarmalayicisidir ve execFileSync onu kabuk
   * olmadan CALISTIRAMAZ — komut sessizce hic kosmaz, ciktisi bos gelir ve "kapi kirmizi"
   * sanilir. Olculdu (2026-09-01). Dogrusu vitest'in JS girisini dogrudan cagirmak.
   */
  const kapiOlc = () => {
    if (!kapiKos) return null
    const vitestGirisi = path.join(agac, 'node_modules/vitest/vitest.mjs')
    if (!fs.existsSync(vitestGirisi)) {
      console.log('Kapi ATLANDI: vitest girisi yok -> ' + vitestGirisi)
      return null
    }
    try {
      execFileSync(process.execPath, [vitestGirisi, 'run', TAZELIK_KAPISI], {
        encoding: 'utf8',
        cwd: agac,
        stdio: 'inherit',
        maxBuffer: 64 * 1024 * 1024,
      })
      return 'YESIL'
    } catch {
      return 'KIRMIZI'
    }
  }

  /**
   * AXIOM 7 — cift rollu dosya yuzunden build TEK TURDA kapanmayabilir; en cok IKI tur.
   *
   * ⭐TURLAR KAPI GUDUMLUDUR, sayi guduml DEGIL. Olculdu (2026-09-01): `doc build`
   * hicbir zaman "fark yok" haline YAKINSAMAZ — artefakti commit'lemek HEAD'i degistirir,
   * manifest de `kaynak_commit`/`compiled_at` ile HEAD'i takip eder, yani her tur DAMGA
   * farki uretir. Icerik ozeti (`ozet`) ise ayni kalir. Kosulsuz iki tur kosmak bu yuzden
   * her tazelemede GEREKSIZ bir commit uretir — ve o commit uretilmis artefakta dokundugu
   * icin BASKA dallar icin cakisma olasiligini artirir, yani cozdugumuz problemi besler.
   * Bu yuzden: tur 1'den sonra kapiyi olc; YESILSE dur.
   */
  let uretimTamam = true
  let kapiSonuc = 'KOSULMADI'
  for (const tur of [1, 2]) {
    const r = docBuildKos(agac)
    if (!r.tamam) {
      uretimTamam = false
      console.error('AXIOM 7 tur ' + tur + ': doc build BASARISIZ')
      console.error(r.cikti.slice(0, 800))
      break
    }
    const degisen = kirliYollar(agac)
    const commitlenecek = degisen.filter((y) => ilanlar.has(y))
    const beklenen = degisen.filter((y) => !ilanlar.has(y) && tolere.has(y))
    const disarida = degisen.filter((y) => !ilanlar.has(y) && !tolere.has(y))
    if (beklenen.length) {
      console.log('AXIOM 7 tur ' + tur + ': ' + beklenen.length + ' ILAN EDILMIS ISTISNA degisti (beklenen, commit YOK):')
      beklenen.forEach((y) => console.log('   istisna: ' + y))
    }
    if (disarida.length) {
      console.log(
        'AXIOM 7 tur ' + tur + ': ILAN DISI ' + disarida.length + ' yol degisti — COMMIT EDILMEDI (claim disi):',
      )
      disarida.forEach((y) => console.log('   dokunulmadi: ' + y))
    }
    if (commitlenecek.length) {
      for (const y of commitlenecek) git(agac, ['add', '--', y])
      git(agac, ['commit', '-m', 'chore(altyapi): AXIOM 7 tur ' + tur + ' — artefakt yeniden uretimi'])
      console.log('AXIOM 7 tur ' + tur + ': ' + commitlenecek.length + ' artefakt commit edildi.')
    } else {
      console.log('AXIOM 7 tur ' + tur + ': ilan edilmis artefaktta degisiklik yok.')
    }

    const olcum = kapiOlc()
    if (olcum === null) {
      // Kapi kosulamadi -> tur sayisiyla karar veremeyiz; AXIOM 7'nin guvenli tarafi
      // olan IKI turu tamamla. Olcemedigimiz yerde ihtiyatli davranilir.
      continue
    }
    kapiSonuc = olcum
    console.log('AXIOM 7 tur ' + tur + ' sonrasi INV-DOC-4b: ' + olcum)
    if (olcum === 'YESIL') break
  }

  console.log('')
  console.log('== SONUC ==')
  console.log('cozulen cakisma : ' + cozulen.length)
  console.log('AXIOM 7 uretimi : ' + (uretimTamam ? 'TAMAM' : 'BASARISIZ'))
  console.log('INV-DOC-4b      : ' + kapiSonuc)

  if (!uretimTamam) return 3
  if (kapiSonuc === 'KIRMIZI') return 3
  if (kapiSonuc === 'KOSULMADI') {
    console.log('Kapi kosulmadi — "gecti" DEMIYORUM. Cikis kodu 1.')
    return 1
  }
  return 0
}

if (require.main === module) {
  let kod
  try {
    kod = main()
  } catch (e) {
    // Beklenmedik hata SESSIZ kalmaz ve 0 DONMEZ. Yigin izi degil, okunur sebep basilir;
    // merge yarim kalmis olabilir, o yuzden cikis yolu da yazilir.
    console.error('DURDU (beklenmedik hata): ' + String((e && e.message) || e))
    kod = 3
  }
  process.exit(kod)
}

module.exports = {
  ilanEdilmisYollar,
  cakismaSiniflandir,
  porcelainYollari,
  docBuildArgumanlari,
  docBuildKomutu,
  tolereEdilenKirlilik,
  MANIFEST_YOLU,
  ISTISNA_YOLU,
  TAZELIK_KAPISI,
}
