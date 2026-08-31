#!/usr/bin/env node
'use strict'

/**
 * scripts/hijyen/agac-silme-kapisi.cjs — WORKTREE SİLME KAPISI (REC-84 Kol-4)
 *
 * NİÇİN VAR — ölçülmüş vaka, teorik değil (2026-08-27):
 * "Terk edilmiş worktree" listesi çıkarıldı: 14 ağaç. Liste onaya gitti, onay alındı. Sonra
 * ÜÇ ŞERİT ayrı ayrı itiraz etti ve listenin **en az 6 kalemi CANLI çıktı** (AUTH 1, I18N 3,
 * ALTYAPI 2). Altısı da yalnızca sahibi o an UYANIK olduğu için yakalandı. Yani kapı, ajanların
 * uyku düzenine bağlı olarak doğru ya da yanlış çalışıyordu. Bir daha elle değerlendirme YOK:
 * her silme turu bu betikten geçer.
 *
 * ÜÇ ÖLÇÜT AYRI AYRI ÇÜRÜDÜ, ÜÇÜ DE AYNI HATA SINIFI — YOKLUĞU KANIT SAYMAK:
 *   · "venthub-sid yok = sahipsiz"  → vh-t088'de kimlik dosyası HİÇ oluşmamıştı, ağaç I18N'indi.
 *   · "venthub-sid var+canlı = sahipli" → vh-altyapi-851'de sid BAYATTI (başka oturumdan kalma),
 *     ağaç ALTYAPI'nındı ve içinde 19 commit'siz companion vardı. Kimlik AĞACIN değil OTURUMUN izidir.
 *   · "PR MERGED = iş indi" → venthub-wt-kvkk ve venthub-wt-t086'da merge SONRASI eklenen
 *     commitler vardı; PR durumu onları GÖRMÜYOR.
 *
 * KOŞUL 2'NİN BİÇİMİ KASITLI — `branch -r --contains HEAD` YETMEZ:
 * O test yalnız UCU ölçer. Ucu uzakta olup ARADA erişilemeyen commit taşıyan bir dal testi
 * GEÇER ve iş sessizce kaybolur. Ölçüt `rev-list --count HEAD --not --remotes`; ayrıca KAÇ
 * commit'in risk altında olduğunu da söyler, yani tanı için de üstündür. Ölçüldü: vh-ledger
 * dal-başı karşılaştırmada 39 gösterip bu ölçütte 0 çıktı (yanlış pozitif), venthub-wt-t086
 * ise 8 çıktı (gerçek).
 *
 * KOŞUL 3'TE `-uall` ZORUNLU: `--porcelain` tek başına izlenmeyen DİZİNİ tek satıra katlar ve
 * içindeki onlarca dosyayı gizler. Bugün tam bu yüzden 478 sanılan sayı 550 çıktı.
 *
 * ⚠ KAPININ SINIRI — ADIYLA SÖYLÜYORUM, ÇÜNKÜ SESSİZ KALIRSA TEHLİKELİ:
 * 1-3 mekanik koşulları "TEMİZ + itilmiş + kimliksiz" ama HÂLÂ AKTİF KULLANILAN bir ağacı
 * AYIRT EDEMEZ. vh-t088 tam bu haldeydi. Bu boşluğu kapatan tek şey KOŞUL 4'tür (ilan +
 * itiraz penceresi) — yani 4. koşul bir formalite değil, kapının ASIL emniyetidir. 1-3'ü
 * geçip 4'ü atlamak, bugün yaşanan kazanın aynısını üretir.
 *
 * ⚠ K4'ÜN KENDİ ZAYIFLIĞI — SESSİZLİK ONAY DEĞİLDİR (AUTH'un uyarısı, 2026-08-27):
 * Pencere sessiz kapandıysa bu "sahipsiz" değil, "sahibi KONUŞAMIYOR" demek olabilir —
 * ölü bir oturumun ağacı itiraz edemez. Yani K4 de bir absans çıkarımıdır ve tek başına
 * güvenilmez. NİÇİN YİNE DE YETERLİ: bu zayıflık K1-K3 tarafından SINIRLANIR. Dördünü de
 * geçen bir ağaç tanım gereği "kimliksiz + her şeyi uzakta + izlenmeyen dahil tertemiz"dir;
 * böyle bir ağacı silmek KURTARILAMAZ hiçbir şey kaybettirmez, olsa olsa birinin worktree'yi
 * yeniden kurmasını gerektirir. Yani net dağılım şudur:
 *     K2/K3 = VERİ KAYBINA karşı emniyet (mutlak)
 *     K4    = KESİNTİYE karşı emniyet (olasılıksal — sessizlik yanıltabilir)
 * Bu ayrımı bilerek yazıyorum: K4'ü "her şeyi tutar" sanıp K2/K3'ü gevşetmek, kapıyı
 * bugünkü kazadan DAHA kötü bir hale getirir.
 *
 * ⛔ SAHİPLİK İÇİN `git log --format=%an` KULLANMA — BU DEPODA AYIRT ETMEZ:
 * Tüm ajanlar Recep'in kimliğiyle commit atar, yani yazar alanı her dalda aynıdır. Bugün
 * iki şerit (AUTH, I18N) sahipliği bağımsız olarak DOKUNULAN DOSYA KÜMESİ ile ölçtü ve aynı
 * cevaba vardı; ad kalıbı ("dal adı bana benzemiyor") ikisinin de zayıf bulduğu kanıttı.
 * Sahiplik sorusunun ayırt eden ölçütü: dalın dokunduğu dosyalar ∩ şeridin claim'i.
 *
 * BU BETİK HİÇBİR ŞEY SİLMEZ. Karar üretir ve gerekçesini basar; silme komutunu insan/ajan
 * çalıştırır. Silme kararını üreten ile uygulayanın ayrı olması kasıtlıdır.
 *
 * KULLANIM:
 *   node scripts/hijyen/agac-silme-kapisi.cjs                    # tüm ağaçları değerlendir
 *   node scripts/hijyen/agac-silme-kapisi.cjs --agac a,b,c       # yalnız bunları
 *   node scripts/hijyen/agac-silme-kapisi.cjs --ilan a,b,c       # itiraz penceresini BAŞLAT
 *   node scripts/hijyen/agac-silme-kapisi.cjs --json
 * Çıkış kodu: 0 = en az bir ağaç SİLİNEBİLİR · 1 = hiçbiri · 2 = kullanım hatası
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const argv = process.argv.slice(2)
const bayrak = (ad) => argv.includes(ad)
const deger = (ad) => {
  const i = argv.indexOf(ad)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null
}

const JSON_CIKTI = bayrak('--json')
const ILAN = (deger('--ilan') || '').split(',').map((s) => s.trim()).filter(Boolean)
const SUZ = (deger('--agac') || '').split(',').map((s) => s.trim()).filter(Boolean)

/** İtiraz penceresi: iki cron turu. OPS kuralı, hatırdan değil buradan okunur. */
const PENCERE_DK = 40

const ILAN_YOLU = path.join(__dirname, 'silme-ilani.json')

function git(args, cwd) {
  return execFileSync('git', args, {
    cwd: cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  })
}

function agaclar() {
  const cikti = git(['worktree', 'list', '--porcelain'])
  const liste = []
  for (const satir of cikti.split('\n')) {
    if (satir.startsWith('worktree ')) liste.push(satir.slice('worktree '.length).trim())
  }
  return liste
}

/** Ana worktree ASLA silinemez; ayrı bir koşula gerek kalmadan burada elenir. */
function anaAgac() {
  return path.resolve(git(['rev-parse', '--path-format=absolute', '--git-common-dir']).trim(), '..')
}

function kimlikYolu(ortakGitDir, ad) {
  return path.join(ortakGitDir, 'worktrees', ad, 'venthub-sid')
}

function degerlendir(wt, ortakGitDir, ana, ilan) {
  const ad = path.basename(wt)
  const sonuc = { agac: wt, ad, kosullar: {}, engeller: [] }

  if (path.resolve(wt) === path.resolve(ana)) {
    sonuc.engeller.push('ANA AGAC — asla silinmez')
    sonuc.karar = 'SILINEMEZ'
    return sonuc
  }

  // KOŞUL 1 — kimlik dosyası YOK olmalı (varlığı oturuma bağlılık şüphesi doğurur)
  const ky = kimlikYolu(ortakGitDir, ad)
  let sid = null
  try {
    sid = fs.readFileSync(ky, 'utf8').trim()
  } catch { /* yok */ }
  sonuc.kosullar.k1_kimliksiz = sid === null
  sonuc.sid = sid
  if (sid !== null) sonuc.engeller.push('K1: venthub-sid VAR (' + sid.slice(0, 8) + ') — oturuma bagli olabilir')

  // KOŞUL 2 — hiçbir uzak ref'ten erişilemeyen commit OLMAMALI
  let kayip = null
  try {
    kayip = Number(git(['rev-list', '--count', 'HEAD', '--not', '--remotes'], wt).trim())
  } catch {
    sonuc.engeller.push('K2: OLCULEMEDI (agac erisilemez) — silme')
  }
  sonuc.kosullar.k2_uzakta_var = kayip === 0
  sonuc.erisilemeyenCommit = kayip
  if (kayip !== null && kayip > 0) {
    sonuc.engeller.push('K2: ' + kayip + ' commit HICBIR uzak ref ten erisilemiyor — silinirse KALICI KAYIP')
  }

  // KOŞUL 3 — izlenmeyen dahil kirli dosya OLMAMALI (-uall ZORUNLU)
  let kirli = null
  try {
    kirli = git(['status', '--porcelain', '--untracked-files=all'], wt)
      .split('\n')
      .filter((s) => s.trim().length > 0).length
  } catch { /* K2 zaten engel koydu */ }
  sonuc.kosullar.k3_temiz = kirli === 0
  sonuc.kirli = kirli
  if (kirli !== null && kirli > 0) sonuc.engeller.push('K3: ' + kirli + ' kirli dosya (izlenmeyen dahil)')

  // KOŞUL 4 — ilan edilmiş ve itiraz penceresi geçmiş olmalı
  const k4 = ilanDurumu(ilan, ad)
  sonuc.kosullar.k4_ilan_gecti = k4.gecti
  sonuc.ilan = k4
  if (!k4.gecti) sonuc.engeller.push('K4: ' + k4.sebep)

  sonuc.karar = sonuc.engeller.length === 0 ? 'SILINEBILIR' : 'SILINEMEZ'
  return sonuc
}

function ilanDurumu(ilan, ad) {
  if (!ilan) return { gecti: false, sebep: 'ilan YOK — once --ilan ile pencereyi baslat' }
  if (!ilan.agaclar.includes(ad)) {
    return { gecti: false, sebep: 'bu agac ilan listesinde YOK (ilan: ' + ilan.agaclar.join(',') + ')' }
  }
  const gecenDk = (Date.now() - Date.parse(ilan.ilanEdildi)) / 60000
  if (!Number.isFinite(gecenDk)) return { gecti: false, sebep: 'ilan zaman damgasi okunamadi' }
  if (gecenDk < PENCERE_DK) {
    return {
      gecti: false,
      sebep: 'itiraz penceresi ACIK — ' + Math.ceil(PENCERE_DK - gecenDk) + ' dk kaldi',
      kalanDk: Math.ceil(PENCERE_DK - gecenDk),
    }
  }
  return { gecti: true, sebep: 'pencere kapandi (' + Math.floor(gecenDk) + ' dk)', gecenDk: Math.floor(gecenDk) }
}

function ilanOku() {
  try {
    return JSON.parse(fs.readFileSync(ILAN_YOLU, 'utf8'))
  } catch {
    return null
  }
}

// ---------------------------------------------------------------- sahiplik modu

/**
 * "Bu ağaç kimin?" sorusunun AYIRT EDEN ölçütü: erişilemeyen commit'lerin DOKUNDUĞU DOSYA
 * KÜMESİ. 2026-08-27'de AUTH ve I18N bu ölçümü ayrı ayrı, ELLE koştu ve aynı sonuca vardı;
 * üçüncü kez elle koşulmasın diye buraya alındı. İkisi de kendi ilk cevaplarını ("dal adı
 * bana benzemiyor") ZAYIF bulup geri çekti — ad kalıbı ölçüt değildir, dosya kümesi ölçüttür.
 */
const SAHIPLIK = deger('--sahiplik')
if (SAHIPLIK) {
  const wt = agaclar().find((w) => path.basename(w) === SAHIPLIK)
  if (!wt) {
    console.error('HATA: worktree bulunamadi: ' + SAHIPLIK)
    process.exit(2)
  }
  let dosyalar = []
  let commitler = []
  try {
    commitler = git(['log', '--format=%h %s', 'HEAD', '--not', '--remotes'], wt)
      .split('\n').filter((s) => s.trim())
    dosyalar = [
      ...new Set(
        git(['log', '--name-only', '--format=', 'HEAD', '--not', '--remotes'], wt)
          .split('\n').map((s) => s.trim()).filter(Boolean)
      ),
    ].sort()
  } catch (e) {
    console.error('HATA: olculemedi — ' + e.message)
    process.exit(2)
  }
  console.log('== SAHIPLIK OLCUMU: ' + SAHIPLIK + ' ==')
  console.log('  dal: ' + git(['rev-parse', '--abbrev-ref', 'HEAD'], wt).trim())
  console.log('')
  console.log('  ERISILEMEYEN COMMITLER (' + commitler.length + '):')
  for (const c of commitler) console.log('    ' + c)
  console.log('')
  console.log('  DOKUNULAN DOSYALAR (' + dosyalar.length + ') — sahiplik SORUSUNUN CEVABI BURADA:')
  for (const d of dosyalar) console.log('    ' + d)
  console.log('')
  console.log('  Bu listeyi seritlerin claim globlariyla KESISTIR (board.cjs who).')
  console.log('  ⛔ git yazar alanina (--format=%an) BAKMA: bu depoda tum ajanlar Recep in')
  console.log('     kimligiyle commit atar, alan her dalda ayni — AYIRT ETMEZ.')
  process.exit(0)
}

// ---------------------------------------------------------------- ilan modu

if (ILAN.length) {
  const kayit = {
    _nicin:
      'Itiraz penceresi. Mekanik kosullar (K1-K3) "temiz+itilmis+kimliksiz ama HALA KULLANILAN" ' +
      'bir agaci ayirt EDEMEZ; bu boslugu kapatan tek sey ilandir. Formalite degil, asil emniyet.',
    ilanEdildi: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    pencereDk: PENCERE_DK,
    agaclar: ILAN,
    hatirlatma:
      'Bu dosyayi yazmak YETMEZ — ayni listeyi panoya HERKESE not olarak da yaz, yoksa ' +
      'itiraz edecek seritler ilani GORMEZ ve pencere sahte bir emniyet olur.',
  }
  fs.writeFileSync(ILAN_YOLU, JSON.stringify(kayit, null, 2) + '\n', 'utf8')
  console.log('ILAN YAZILDI: ' + ILAN_YOLU)
  console.log('  agaclar : ' + ILAN.join(', '))
  console.log('  pencere : ' + PENCERE_DK + ' dk (kapanis ~' +
    new Date(Date.now() + PENCERE_DK * 60000).toISOString().replace(/\.\d{3}Z$/, 'Z') + ')')
  console.log('')
  console.log('  ⚠ SIRADAKI ADIM ATLANAMAZ: ayni listeyi PANOYA da yaz.')
  console.log('    node scripts/board/board.cjs note --sid <sid> --text "SILME ILANI: ... son itiraz"')
  console.log('    Dosya seritlere ULASMAZ; ilani goren olmadan gecen pencere emniyet DEGILDIR.')
  process.exit(0)
}

// ---------------------------------------------------------------- degerlendirme

const ortakGitDir = path.resolve(git(['rev-parse', '--path-format=absolute', '--git-common-dir']).trim())
const ana = anaAgac()
const ilan = ilanOku()
const hepsi = agaclar()
const secili = SUZ.length ? hepsi.filter((w) => SUZ.includes(path.basename(w))) : hepsi

if (SUZ.length) {
  const bulunmayan = SUZ.filter((a) => !hepsi.some((w) => path.basename(w) === a))
  if (bulunmayan.length) {
    console.error('HATA: su agaclar worktree listesinde YOK: ' + bulunmayan.join(', '))
    console.error('Sessizce atlamiyoruz — yanlis yazilmis bir ad "degerlendirildi" sanilirdi.')
    process.exit(2)
  }
}

const sonuclar = secili.map((wt) => degerlendir(wt, ortakGitDir, ana, ilan))
const silinebilir = sonuclar.filter((s) => s.karar === 'SILINEBILIR')

if (JSON_CIKTI) {
  console.log(JSON.stringify({ pencereDk: PENCERE_DK, ilan, sonuclar }, null, 2))
} else {
  console.log('== AGAC SILME KAPISI — 4 kosul BIRDEN saglanmali ==')
  console.log('   K1 kimliksiz · K2 uzakta var · K3 temiz (-uall) · K4 ilan+pencere')
  console.log('')
  for (const s of sonuclar) {
    const k = s.kosullar
    const im = (v) => (v === true ? 'E' : v === false ? 'H' : '?')
    console.log(
      (s.karar === 'SILINEBILIR' ? '  ✓ ' : '  · ') +
        s.ad.padEnd(24) +
        ' K1:' + im(k.k1_kimliksiz) +
        ' K2:' + im(k.k2_uzakta_var) +
        ' K3:' + im(k.k3_temiz) +
        ' K4:' + im(k.k4_ilan_gecti) +
        '   ' + s.karar
    )
    for (const e of s.engeller) console.log('        - ' + e)
  }
  console.log('')
  console.log('  SILINEBILIR: ' + silinebilir.length + ' / ' + sonuclar.length)
  if (silinebilir.length) {
    console.log('  Komut (kapi karar verir, SILMEYI SEN kosarsin):')
    for (const s of silinebilir) console.log('    git worktree remove "' + s.agac + '"')
    console.log('    git worktree prune')
  }
  console.log('')
  console.log('  ⚠ K1-K3 "temiz+itilmis+kimliksiz ama HALA KULLANILAN" agaci AYIRT EDEMEZ.')
  console.log('    O boslugu kapatan K4 tur. 1-3 u gecip 4 u atlamak 2026-08-27 kazasini tekrarlar.')
  console.log('  ⚠ K4 de absans cikarimidir: SESSIZLIK "sahipsiz" degil "sahibi KONUSAMIYOR"')
  console.log('    olabilir (olu oturumun agaci itiraz edemez). Zayifligi K1-K3 SINIRLAR:')
  console.log('    K2/K3 = VERI KAYBINA karsi emniyet (mutlak) · K4 = KESINTIYE karsi (olasiliksal).')
  console.log('    Bu yuzden K4 e guvenip K2/K3 u gevsetmek kapiyi DAHA kotu hale getirir.')
  const riskli = sonuclar.filter((s) => s.erisilemeyenCommit > 0)
  if (riskli.length) {
    console.log('')
    console.log('  ⛔ KAYIP RISKI (K2) — bu agaclar silinemez, ama sahibi cikip ITMELI:')
    for (const s of riskli) {
      console.log('     ' + String(s.erisilemeyenCommit).padStart(3) + ' commit  ' + s.ad)
    }
    console.log('     Sahibi bulmak icin: --sahiplik <agac-adi>  (yazar alanina BAKMA, ayirt etmez)')
  }
}

process.exit(silinebilir.length ? 0 : 1)
