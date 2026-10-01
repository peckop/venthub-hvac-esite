#!/usr/bin/env node
/**
 * SessionStart hook — OTURUM KİMLİĞİ + PANO DURUMU bağlama enjekte edilir.
 *
 * Neden: ajan "ben hangi oturumum" sorusunu tahmin etmemeli. Claude Code oturum kimliğini
 * hook'a stdin ile verir; buradan bağlama yazılınca ajan onu OKUR. Kimlik compact'ten de
 * sağ çıkar (bağlam sıfırlansa bile SessionStart yeniden koşar).
 *
 * Ayrıca panonun o anki hâli (kim hangi şeritte, okunmamış notlar) ilk turda görünür olur —
 * böylece kullanıcı mesaj taşıyıcısı olmaktan kurtulur.
 *
 * stdin: { session_id, cwd, ... }
 * stdout: { hookSpecificOutput: { hookEventName, additionalContext, sessionTitle? } }
 *   sessionTitle = şeridin pencere adı ("Araç", "Ops"…; yalnız claim varsa ve source startup/resume/fork; REC-525, aşağıda).
 */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { input = {} }

const sid = input.session_id || ''
if (!sid) process.exit(0)

/**
 * KİMLİK DOSYASI — `pre-commit` şerit kapısı (E1) için tek kimlik kaynağı.
 *
 * NİÇİN GEREKLİ: `pre-commit`i git çalıştırır; ortada `session_id` YOKTUR. Kimlik olmadan
 * "bu dosya BAŞKASININ şeridinde mi" sorusu sorulamaz.
 *
 * BASİT GÖRÜNEN ALTERNATİF ÖLÇÜLDÜ VE ÇÜRÜTÜLDÜ — dal önekinden şerit türetmek: son 40 uzak
 * dalın 36'sı `önek/konu` kalıbına uyuyor AMA önekler şerit adı DEĞİL
 * (`fix/inv-quote-1-content-scope` AUTH'un, `docs/t116-payment-ledger-standard` PRICING'in).
 * Kullansaydık, yanlış şerit adına karar veren bir kapı kurmuş olurduk.
 *
 * ⚠ WORKTREE-YEREL YAZILIR, ORTAK DİZİNE DEĞİL — ölçüldü:
 *     git rev-parse --absolute-git-dir → …/.git/worktrees/venthub-wt-altyapi  (şeride ÖZEL)
 *     git rev-parse --git-common-dir   → …/.git                               (HEPSİNDE ORTAK)
 * Ortak dizine yazsaydık bütün şeritler AYNI kimliği okurdu ve kapı her şeritte yanlış sahibi
 * gösterirdi — bir şerit kapısı için düşünülebilecek en kötü arıza.
 *
 * BOOTSTRAP: dosya ancak bir şeridin BİR SONRAKİ oturum açılışında oluşur. O ana kadar E1
 * fail-open çalışır ve GÖRÜNÜR uyarı basar (sessizlik kanıt sayılmasın).
 */
try {
  const gitCwd = input.cwd || process.cwd()
  const oku = (arg) =>
    execFileSync('git', ['rev-parse', arg], { cwd: gitCwd, encoding: 'utf8', timeout: 10000 }).trim()
  const gitDir = oku('--absolute-git-dir')
  const ortakDir = oku('--git-common-dir')
  /**
   * ⭐ORTAK AĞACA KİMLİK YAZILMAZ — ölçülmüş kusur (2026-08-31, cetvel §19).
   *
   * Ana çalışma dizininde `--absolute-git-dir` ile `--git-common-dir` AYNI yeri gösterir. Yani
   * ana dizinde açılan/resume olan her oturum kimliğini ORTAK dizine yazıyordu ve şeritler
   * birbirinin üstüne biniyordu: ölçüldü, ana dizinin kimliği 30 Ağustos'ta ölü bir oturumun
   * (`974d15cb`), 31 Ağustos'ta bu oturumun sid'iydi. Üç şerit de ana dizinde resume olduğu
   * için kazananı SIRA belirliyordu — yani paylaşılan ağacın "sahibi" rastgeleydi.
   *
   * NİÇİN BU DOSYA HİÇ OLMAMALI, "tazelensin" DEĞİL: kimlik dosyasının cevapladığı soru
   * "bu ağaç KİMİN şeridinde" — ana dizinin bu soruya doğru cevabı YOKTUR, ana dizin hiçbir
   * şeridin değildir. Yanlış cevap veren bir kayıt, cevap vermeyenden KÖTÜDÜR: okuyucuların
   * fail-open kolunu kapatır ve denetim "sahibi var" sanıp hayalete atfeder.
   *
   * E1 BLOKLANMAZ — ölçüldü: `scripts/board/kimlik.cjs` ASIL kanıtı `CLAUDE_CODE_SESSION_ID`
   * env'inden alır (dosya yalnız VEKİL), ve o env Claude Code kabuğunda DOLUDUR. Ana dizinde
   * elle `git commit` yapan bir insan için kimlik "yok" olur ve E1 fail-open + görünür uyarı
   * verir; bu, yanlış şerit adına karar vermekten iyidir.
   */
  if (gitDir && ortakDir && path.resolve(gitCwd, gitDir) === path.resolve(gitCwd, ortakDir)) {
    /**
     * YAZMAYI KESEN MEKANİZMA, KENDİ ESKİ ÇIKTISINI DA TEMİZLER. Yalnız "artık yazmıyorum"
     * demek yetmez: hâlihazırda orada duran sid, sonraki oturumlar için geçerli bir sahiplik
     * kaydı gibi okunmaya DEVAM ederdi ve kusur elle bir temizlik adımına bağlı kalırdı
     * (bu depoda "belge indi, iş bitmedi" sınıfının tipik biçimi).
     */
    const eski = path.join(path.resolve(gitCwd, gitDir), 'venthub-sid')
    let temizlendi = ''
    try {
      if (fs.existsSync(eski)) {
        temizlendi = fs.readFileSync(eski, 'utf8').trim().slice(0, 8)
        fs.unlinkSync(eski)
      }
    } catch (e) {
      temizlendi = '(SILINEMEDI: ' + (e && (e.code || e.message)) + ')'
    }
    process.stderr.write(
      '[session-board] ORTAK agac — kimlik YAZILMADI (cetvel §19: ana dizin hicbir seridin degil).\n' +
        (temizlendi ? '  Orada duran ESKI kimlik TEMIZLENDI: ' + temizlendi + '\n' : '') +
        '  Serit isini kendi worktree inde yap; kimlik orada yazilir.\n',
    )
  } else if (gitDir) {
    fs.writeFileSync(path.join(gitDir, 'venthub-sid'), sid + '\n', 'utf8')
  }
} catch (e) {
  // Sessiz geçmeyiz: kimlik yoksa E1 fail-open olur ve sebebinin bilinmesi gerekir.
  process.stderr.write(
    '[session-board] kimlik dosyasi yazilamadi (' + (e && (e.code || e.message)) +
      ') — E1 serit kapisi bu worktree de KIMLIKSIZ calisir.\n',
  )
}

// SessionStart 'source': startup | resume | clear | compact | fork (Claude Code 2.1.234, hooks-guide).
// 08-22 dersi (docs/audits/platform-capability-audit-2026-08-22.md): makine ~24s kapandi, acilinca
// eklenti oturumlari 'resume' ile geri yuklendi; gozcu (Monitor) olmustu, cron kismen dondu, ekip
// SAGIR kaldi ve Recep elle durtmek zorunda kaldi. Bu alani OKUYUP resume'da davranis veriyoruz.
const source = input.source || 'startup'

/**
 * Registry oto-senkronu — KOPARILMIŞ süreç olarak başlatılır.
 *
 * Neden burada: `post-merge` kancası yalnız yerel `git pull/merge`'de koşar, biz ise PR'ları
 * `gh pr merge` ile GitHub üzerinden kapatıyoruz → senkron hiç çalışmıyordu. CI'a taşımak
 * ÇÖZÜM DEĞİL: registry `~/.orion/registry.db`, yani bu makinedeki yerel bir dosya; runner'da
 * boş bir DB yaratılır ve silinir (yeşil yanar, hiçbir şey senkronlanmaz). Üç oturum da aynı
 * makinede olduğu için doğru yer oturum açılışıdır.
 *
 * Neden koparılmış: `git fetch` ağ işidir; oturum açılışını bekletmemeli. Çıktı
 * `~/.orion/registry-autosync.log`'a düşer.
 *
 * ⚠ PENCERE (ölçüldü 2026-08-27 ve 2026-09-29): `windowsHide: true` yalnız çocuğun KENDİ penceresini
 * gizler. `detached` çocuk konsolsuzdur; içinden çalışan `git fetch` yeni konsol → Windows Terminal'de
 * `git.exe` başlıklı pencere açar (her oturum açılışında ve compact bitişinde 3-4 pencere — Recep 09-29).
 * Bu yüzden başlatma scripts/board/kopuk-baslat.cjs'ten geçer: çocuğun her child_process çağrısına
 * `windowsHide` eklenir (REC-415). `detached: true` başka yerde YASAK; test zorlar.
 */
try {
  require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs'))
    .kopukBaslat(path.join(__dirname, '..', '..', 'scripts', 'board', 'registry-autosync.cjs'))
} catch { /* senkron başlatılamadıysa oturumu bloklama — bir sonraki açılışta tekrar denenir */ }

/**
 * Linear arşiv adımı (karar 187, REC-433): kapanmış ve 2 günden eski kayıtlar günde EN ÇOK BİR kez
 * arşivlenir (Linear ücretsiz planı 250 kayıtta doluyor). Anahtar yoksa ya da bugün koşulduysa hiçbir
 * şey başlatılmaz. Kopuk ve gizli süreç (REC-415), LLM yok, silme yok. Betik: scripts/board/linear-arsiv.cjs
 */
try {
  const kopuk = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'kopuk-baslat.cjs'))
  require(path.join(__dirname, '..', '..', 'scripts', 'board', 'linear-arsiv.cjs')).gunlukBaslat({
    anahtar: process.env.LINEAR_API_KEY || '',
    baslat: (betik, args) => kopuk.kopukBaslat(betik, args),
  })
} catch { /* arşiv başlatılamadıysa oturumu bloklama — bir sonraki açılışta tekrar denenir */ }

/**
 * ⭐ÇIKTI TAVANI (REC-433 alt işi, Ops 09-29; HARİTA 1.2 ölçümü). Bir SessionStart kancasının
 * `additionalContext` çıktısı 10.000 karakteri aşınca bağlama YALNIZ ilk ~2.000 karakter + "Output too
 * large" + dosya yolu girer. Ölçüldü (bu kanca, compact): 11.458 karakter; durum bloğu ve son konuşma
 * dökümü büyüdükçe 21–39 KB'a çıktı ve Recep'in aynen sözü pencereye HİÇ girmedi.
 *
 * Çözüm: çıktı BÖLÜMLERDEN kurulur, her bölümün tam metni + tek satırlık işaretçisi (ozet) vardır.
 * Toplam TOPLAM_TAVAN'ı aşarsa en az önemli bölümden başlayarak tam metin işaretçiye çevrilir.
 * Öncelik 0 (kimlik) hiçbir zaman küçültülmez. Bölüm başına da kendi tavanı vardır (DURUM_TAVAN,
 * `enjeksiyonKisa`), yani tipik çıktı tavanın çok altında kalır; koruma yalnız sigortadır.
 * Kapı: INV-SESSIONSTART-TAVAN-1 (dört açılış türü, şişirilmiş durum dosyası + döküm).
 */
// VH_SESSIONSTART_TOPLAM_TEST yalnız kapı testindedir (daralma yolunu zorlar); üretimde ayarlı olmaz.
const TOPLAM_TAVAN = Number(process.env.VH_SESSIONSTART_TOPLAM_TEST) || 9000
const DURUM_TAVAN = 4500 // 09-29 Recep endişesi: ajanı KÖR bırakma; 3000 → 4500 (tipik son blok ~2.000, uzun blokta baş+son korunur)
const DOKUM_TAVAN = 3600 // Recep'in son 8 mesajı (mesaj başına ≤1.500) için bölüm bütçesi; toplam aşılırsa orantılı daralır
const bolumler = []
/**
 * oncelik: küçük = vazgeçilmez (0 = asla küçülmez). ozet: bütçe aşılınca tam metnin yerine geçen tek satır.
 * daralt(n): (isteğe bağlı) bölümü ~n karaktere DARALTAN işlev — durum bloğu ve Recep'in sözü için: bütçe
 * aşılınca bunlar toptan işaretçiye çevrilmez, ORANTILI daralır (ajan kör kalmasın; Recep endişesi 09-29).
 */
function bolum(ad, oncelik, tam, ozet = '', daralt = null) {
  if (tam) bolumler.push({ ad, oncelik, tam, ozet, daralt })
}
/**
 * Bölümleri EKLEME sırasıyla birleştirir. Tavan aşılırsa SIRAYLA:
 *  1) en önemsiz bölümler (öncelik ≥4: yöntem, pano, filo, notlar) işaretçiye çevrilir;
 *  2) hâlâ aşıyorsa `daralt`ı olan bölümler (durum + Recep sözü) taşma payı kadar ORANTILI daraltılır;
 *  3) hâlâ aşıyorsa: önce daraltılamayan bilgi satırları, EN SON durum + Recep sözü işaretçiye çevrilir.
 * (Ölçüldü 09-29 CI: durum 4.500 + döküm 3.600 en kötü durumda 9.000'i aşıyor ve eski sigorta Recep'in
 * sözünü BÜTÜNÜYLE işaretçiye çeviriyordu — 2. adım bunu önler.)
 */
function birlestir() {
  const kullan = bolumler.map((b) => b.tam)
  const topla = () => kullan.reduce((n, m) => n + m.length, 0)
  const sira = bolumler.map((b, i) => i).sort((a, b) => bolumler[b].oncelik - bolumler[a].oncelik)
  for (const i of sira) {
    if (topla() <= TOPLAM_TAVAN) break
    if (bolumler[i].oncelik >= 4) kullan[i] = bolumler[i].ozet
  }
  const asim = topla() - TOPLAM_TAVAN
  if (asim > 0) {
    const dar =sira.filter((i) => bolumler[i].daralt && bolumler[i].oncelik > 0 && kullan[i] === bolumler[i].tam)
    const uzunluk = dar.reduce((n, i) => n + kullan[i].length, 0)
    for (const i of dar) {
      const pay = Math.ceil((asim * kullan[i].length) / uzunluk)
      kullan[i] = bolumler[i].daralt(Math.max(0, kullan[i].length - pay)) || kullan[i]
    }
  }
  // 3) Hâlâ aşıyorsa: ÖNCE daraltılamayan bilgi satırları (compact kolu, şerit, tazelik, posta…) işaretçiye, durum bloğu
  //    ve Recep'in sözü (daralt'lı bölümler) EN SON. Eski sıra yalnız öncelik numarasına bakıyordu; ana ağaç bayatken
  //    tazelik satırı uzayınca Recep'in sözü toptan düşüyordu (ortama bağlı, 09-29'da bir koşumda görüldü).
  const sonSira = [...sira].sort(
    (a, b) => (bolumler[a].daralt ? 1 : 0) - (bolumler[b].daralt ? 1 : 0) || bolumler[b].oncelik - bolumler[a].oncelik,
  )
  for (const i of sonSira) {
    if (topla() <= TOPLAM_TAVAN) break
    if (bolumler[i].oncelik === 0) continue
    kullan[i] = bolumler[i].ozet
  }
  let metin = kullan.join('')
  if (metin.length > TOPLAM_TAVAN) {
    metin = metin.slice(0, TOPLAM_TAVAN - 90) + '\n…(SessionStart tavani: cikti kirpildi — durum dosyasini ve panoyu ELLE oku)\n'
  }
  return metin
}
/** Uzun metni baş + son parça olarak kısaltır (durum bloğunda en yeni satırlar sonda). */
function kes(metin, tavan, yol) {
  if (metin.length <= tavan) return metin
  const bas = Math.floor(tavan * 0.4)
  const son = tavan - bas
  return (
    metin.slice(0, bas) +
    `\n…(KIRPILDI: ${metin.length - tavan} karakter — tamamini OKU: ${yol})\n` +
    metin.slice(-son)
  )
}

/**
 * Pano özetini kısaltır: her şeritte şerit adı + pencere adı + kimlik etiketi kalır, glob listesi ilk ikisine
 * iner (ölçüldü: dört şeritte glob listesi ~2.000 karakterdi; kimlik ve şerit adı asıl bilgi).
 * Biçim `  · LANE (ad) — glob, glob, … [sid, N dk önce]`; tutmayan satır olduğu gibi (en çok 200 karakter).
 */
function kisaPano(ozet) {
  return String(ozet)
    .split('\n')
    .map((satir) => {
      const m = /^(\s*·\s+.+?)\s+—\s+(.*?)(\s*\[[^\]]*\])?\s*$/.exec(satir)
      if (!m) return satir.length > 200 ? satir.slice(0, 200) + '…' : satir
      const globlar = m[2].split(/,\s*/)
      const gosterilen = globlar.slice(0, 2).join(', ')
      const fazla = globlar.length > 2 ? ` (+${globlar.length - 2})` : ''
      return `${m[1]} — ${gosterilen}${fazla}${m[3] || ''}`
    })
    .join('\n')
}

bolum('kimlik', 0, `Oturum kimliğin: ${sid}\nAçılış türü (source): ${source}\n`)

/**
 * ⭐ROL KARTI SATIRI (REC-433 Faz 1.2, Ops 09-29): pencere açılırken kendi rolünü, yetkisini ve sınırını
 * bilsin — "hatırlayan pencereye" bağlı kalmasın. Kart HARİTA'nın üreticisinden (`scripts/belge/
 * rol-karti-uret.cjs --ozet <ROL>`, tek satır ≤300 karakter; tam kart docs/roller/<ROL>.md) gelir.
 * Rol = pano şeridi (claim), yoksa `CC_LANE` ortam değişkeni. FAIL-OPEN: üretici yok/rol yok/hata →
 * satır yine basılır ("ROL KARTI:" her zaman görünür), ama bilgi yerine sebep yazılır; oturum bloklanmaz.
 * Öncelik 0: asla işaretçiye çevrilmez (300 karakterlik tek satır bütçeyi zorlamaz).
 */
let rolSeridi = process.env.CC_LANE || ''
function rolKartiSatiri(lane) {
  const rol = String(lane || '').trim().toUpperCase()
  if (!rol) return 'ROL KARTI: (bu oturumun seridi/rolu bilinmiyor — serit talep et ya da docs/roller/ altina bak)\n'
  try {
    // VH_ROL_KARTI_URETICI yalnız test içindir (kapı sahte üreticiyle koşar); üretimde ayarlı olmaz.
    const uretici = process.env.VH_ROL_KARTI_URETICI ||
      path.join(__dirname, '..', '..', 'scripts', 'belge', 'rol-karti-uret.cjs')
    if (!fs.existsSync(uretici)) return `ROL KARTI: ${rol} (kart uretici bu agacta yok — docs/roller/${rol}.md varsa oku)\n`
    const ozet = execFileSync(process.execPath, [uretici, '--ozet', rol], {
      encoding: 'utf8', timeout: 4000, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'],
    }).replace(/\s+/g, ' ').trim()
    if (!ozet) return `ROL KARTI: ${rol} (bu rol icin kart yok — docs/roller/ altina bak)\n`
    return `ROL KARTI: ${rol} — ${ozet} (tamami: docs/roller/${rol}.md)\n`
  } catch (e) {
    return `ROL KARTI: ${rol} (kart okunamadi: ${(e && (e.code || e.message)) || 'bilinmeyen'} — docs/roller/${rol}.md'yi ELLE oku)\n`
  }
}
/**
 * ⭐PENCERE ADI = ŞERİT ADI (REC-525, 2026-09-30). `hookSpecificOutput.sessionTitle` `/rename` ile AYNI etkidir
 * (belge: code.claude.com/docs/en/hooks). Pencereleri IDE eklentisi açıyor, `--name` bayrağı yok ve her açılış
 * `--resume=<sid>`; ad verilmezse pencereler `venthub-hvac-72` gibi anlamsız adlarla açılır ve şerit ↔ pencere
 * eşlemesi (SendMessage) karışır (REC-404). Ad oturumla KALICIdır: bir kez verilince sonraki resume'lar da taşır.
 *
 * KURALLAR:
 *  · ELLE VERİLMİŞ FARKLI AD EZİLMEZ (ORTA-1): belge (SessionStart girdisi) `session_title` alanını verir — "oturum
 *    başlığı zaten ayarlıysa (--name, /rename)". Dolu VE tablodaki adla farklıysa alan HİÇ eklenmez. Boşsa ya da
 *    tablodaki adla AYNIYSA (harf ve Türkçe harf farksız: "Araç" = "arac" = "ARAÇ") kanonik ad YAZILIR (REC-525 takip:
 *    restart/resume'da harness dökümdeki /rename adını geri yüklemiyor, pid kaydına türetilmiş ad yazıyor; aynı değeri
 *    yazmak sonucu değiştirmez, kaydı düzeltir);
 *  · yalnız pano talebi varsa; talep yoksa alan HİÇ eklenmez (`CC_LANE` yedeği de kullanılmaz: ortam değişkeni bir
 *    ad taahhüdü değil, rol ipucudur). Talep BAYAT (TTL 4 saat, makine kapanıp sabah resume) olsa da KENDİ sid'inin
 *    talebiyse ad verilir (ORTA-3, `board.tumTalepler`; başka pencerenin talebi karışmaz); BIRAKILMIŞ talep ad vermez;
 *  · ÇAKIŞMA (ORTA-2): aynı adı verecek başka CANLI oturum varsa (aynı şerit ya da aynı ad) alan eklenmez —
 *    iki pencere aynı adı taşırsa SendMessage to:"Araç" belirsizleşir;
 *  · yalnız startup/resume/fork — belge clear ve compact'ta alanı yok sayar, gereksiz çıktı basılmaz;
 *  · ad ÇIPLAK pano yazımı (ARAC) değil, Recep'in pencereleri elle verdiği İNSAN adıdır ("Araç", "Ops", "Yetenek",
 *    "Harita" — Recep 09-30). Eşleme TEK KAYNAKTA: scripts/board/pencere-adlari.cjs (`ad(serit)` + `TABLO`); başka
 *    üreticiler de oradan alır, burada kopya YOK. Tabloda olmayan şerit → ilk harf büyük, kalanı küçük (Türkçe
 *    karakter ÜRETİLMEZ, tahmin yok); string değil/boş/`lane` yer tutucusu → '' (alan eklenmez);
 *  · FAIL-OPEN: modül/hesap hatası → '' (alan yok, mevcut çıktı aynen); kanca `claude agents` ÇAĞIRMAZ (yavaşlatır).
 *
 * BİLİNEN SINIRLAR (dürüst liste):
 *  · claim'siz YENİ pencere ilk açılışta ad ALMAZ: o an pano talebi yoktur. Şerit talep edilince pencere ad alır
 *    yalnız SONRAKİ açılışta (resume/startup/fork); pencere içinde anlık yeniden adlandırma bu kancanın işi değil;
 *  · fork'ta yeni oturum YENİ sid alır ve claim'i yoktur → fork ilk açılışta ad almaz (belge fork'ta alanı uygular,
 *    ama pano kimlik bağı olmadan şerit bilinemez);
 *  · claim ile pencere adı bağı yalnız sid'dir; iki pencere aynı şeridi talep ederse ikisi de ad ALMAZ (ORTA-2 seçimi:
 *    belirsiz ad, adsızlıktan kötü).
 */
const PENCERE_ADI_KAYNAKLARI = new Set(['startup', 'resume', 'fork'])
let pencereAdi = ''
/**
 * Bu pencerenin adı ('' = alan eklenmez). Sırayla: kendi sid'inin talebi (bayat dahil, bırakılmış hariç; ORTA-3) →
 * tablodan ad → mevcut `session_title` dolu VE tablodaki adla FARKLIYSA ezme (Recep'in verdiği başka ad, ORTA-1);
 * boş ya da aynıysa (harf/Türkçe harf farksız, `ayniMi`) kanonik adı YAZ (REC-525 takip: restart/resume'da harness
 * dökümdeki adı geri yüklemiyor, pid kaydına türetilmiş ad yazıyor; aynı değeri yazmak sonucu değiştirmez) →
 * başka canlı oturum aynı adı alıyor/taşıyor mu (ORTA-2). Her hata → ''.
 */
function pencereAdiKarari(board, live, kendiSid, mevcutAd) {
  try {
    const benim = board.tumTalepler().find((c) => c.sid === kendiSid)
    if (!benim) return ''
    const modul = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-adlari.cjs'))
    const ad = modul.ad(benim.lane)
    if (!ad) return ''
    if (typeof mevcutAd === 'string' && mevcutAd.trim() && !modul.ayniMi(mevcutAd, ad)) return ''
    const digerleri = live.filter((c) => c.sid !== kendiSid)
    if (digerleri.some((c) => modul.ad(c.lane) === ad)) return ''
    const adlar = board.pencereAdlari()
    if (digerleri.some((c) => modul.ayniMi(adlar.get(c.sid), ad))) return ''
    return ad
  } catch {
    return '' // modül/pano hatası: alan eklenmez, mevcut çıktı aynen (fail-open)
  }
}

/** Kimlikten HEMEN sonra (ikinci sıra) yerleştirilir: kimlik ilk satır kalır, rol kartı ondan hemen sonra gelir. */
function rolBolumuEkle() {
  const satir = rolKartiSatiri(rolSeridi)
  bolumler.splice(1, 0, { ad: 'rol-karti', oncelik: 0, tam: satir, ozet: satir })
}

// RESUME UYANDIRMA REFLEKSI (Recep 08-22 onayi: yalniz otomatik uyandirma). Makine kapanip
// acildiginda oturumlar 'resume' ile geri gelir ama gozcu/cron olabilir; ekip SAGIR acilir.
// LIDER (OPS/AUDIT-DOCS) resume ile acildiginda ILK IS: ListAgents ile uyuyan peer oturumlarini
// bul, her birine SendMessage ile 'uyan: uclunu kur + panoyu oku + isbasi notu' gonder.
// Bu kanca ajan degil harness'tir; mesaji ATAMAZ — yalnizca lidere TALIMAT yazar, mesaji ajan atar.
if (source === 'resume') {
  const lider = /audit|ops/i.test(process.env.CC_LANE || '') || sid === 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3'
  bolum('resume', 1,
    // ⛔REC-328: "uclunu yeniden kur" talimati kaldirildi (gozcu/cron EMEKLI).
    // Resume'da gercekten kaybolan sey MEKANIZMA degil, KIMIN NEREDE OLDUGU bilgisidir.
    // KARAR 53 (2026-09-19): "gozcu/cron KURULMAZ" GENEL YASAK DEGILDI — kota sikisikken
    // alinmis donemsel bir karardi ve genelleme olarak gecmisti. Emekli olan ESKI UCLU.
    'RESUME ACILISI — makine geri dondu. Eski gozcu uclusu EMEKLI (REC-328); filo dogrudan ' +
    'mesajla calisir. Zamanlayici / cron / loop gerekiyorsa ONCE Recep ile konus (karar 53).\n' +
    (lider
      ? '⭐LIDERSIN: uyandirma refleksi — ListAgents ile canli peer oturumlarini listele ve ' +
        'uyuyan her birine SendMessage at: "makine dondu, hangi isteydin, serit talebini tazele". ' +
        'Bekleme yapma; mesaj tek kanaldir.\n'
      : 'Serit talebin acilista (startup/resume) OTOMATIK yenilenir (claim-yenile); yenilenmediyse pano blogu ' +
        '"TALEP EDILMEMIS" ya da UYARI basar — o zaman elle claim al. Liderin uyandirma mesajini bekleme — ' +
        'hangi iste oldugunu SendMessage ile lidere yaz.\n'))
}

// COMPACT DONUSU (REC-86 Faz 1). Bu kol `resume`den AYRI: resume'da makine dondu ve MEKANIZMA
// olmus olabilir; compact'te mekanizma yasiyor ama BAGLAM kirpildi — kaybolan sey baska, o yuzden
// tedavi de baska. Olculmus vakalar: 08-27 donuste durum dosyasi okunmadi, gun boyu bedel odendi;
// 08-28 gecis aninda yazilan kullanici mesaji yutuldu, 3 tur kayip.
//
// Kural bugune kadar YAZIYDI ("donuste ILK IS durum dosyasini oku") ve tamamen ajan disiplinine
// dayaniyordu. Burasi onu MEKANIZMAYA cevirir: dosyanin son blogunu ajanin onune KOYAR, cunku
// "oku" demek ile okutmak ayni sey degil.
if (source === 'compact') {
  bolum('compact-kol', 1,
    '⭐COMPACT DONUSU — baglamin kirpildi. ILK GORUNUR SATIRIN "bana ulasan son girdin: <ozet>" ' +
    'olacak (gecis aninda yazilan mesaj YUTULABILIR; teslimati garanti edemeyiz ama kaybi 1 turda ' +
    'TESPIT ettirebiliriz). Durum dosyanin son blogu asagida — okumadan is baslatma.\n')
  try {
    const kapi = require(path.join(__dirname, 'precompact-durum-kapisi.cjs'))
    // transcript_path verilir: proje dizini sid taramasına değil, oturumun kendi kaydına dayanır (döküm koluyla aynı çözümleme).
    const d = kapi.durumDosyasiBul(sid, input.transcript_path)
    if (d) {
      const yasDk = Math.round((Date.now() - d.mt) / 60000)
      const baslik = `DURUM DOSYAN: ${d.ad} (${yasDk} dk once guncellenmis)\n`
      const sonBlok = kapi.sonBlok(d.tam)
      const durumMetni = (tavan) => baslik + '--- SON BLOK ---\n' + kes(sonBlok, tavan, d.tam) + '\n--- SON BLOK BITTI ---\n'
      const durumTam = durumMetni(DURUM_TAVAN)
      bolum('durum', 2, durumTam,
        baslik + `(son blok tavan yuzunden yok — okumadan is baslatma: ${d.tam})\n`,
        // Toplam tavan aşılırsa toptan işaretçi değil, taşma payı kadar daral (baş + son parça yine kalır).
        (n) => durumMetni(Math.max(1200, Math.min(sonBlok.length, DURUM_TAVAN) - (durumTam.length - n))))
    } else {
      bolum('durum', 2,
        '⚠DURUM DOSYAN BULUNAMADI — compact oncesi yazilmamis demektir. Ne kaybettigini ' +
        'bilmiyorsun; ilerlemeden once panoyu ve son PR/commit durumunu OLC.\n')
    }
  } catch (e) {
    // Kanca oturumu bloklamaz ama sessiz de gecmez: sebep bilinmeli.
    bolum('durum', 2, `⚠durum dosyasi enjeksiyonu basarisiz (${(e && (e.code || e.message)) || 'bilinmeyen'}) — ELLE oku.\n`)
  }
  // SON KONUŞMA DÖKÜMÜ (Ops 09-28): Recep'in son mesajları AYNEN — özet onları değiştirmiş olabilir.
  // Kısa biçim (REC-433): yalnız Recep mesajları, mesaj başına ve toplam tavanlı; cevaplar dosyada.
  try {
    const kapi = require(path.join(__dirname, 'precompact-durum-kapisi.cjs'))
    const dokum = require(path.join(__dirname, 'son-konusma-dokumu.cjs'))
    const proje = kapi.projeDiziniBul(sid, input.transcript_path)
    const memoryDir = proje && path.join(proje, 'memory')
    const dokumMetni = (tavan) => {
      const m = memoryDir && dokum.enjeksiyonKisa(memoryDir, sid, { tavan })
      return m ? '--- SON KONUSMA (ozetsiz; Recep sozu burada AYNEN) ---\n' + m + '\n--- SON KONUSMA BITTI ---\n' : ''
    }
    const dokumTam = dokumMetni(DOKUM_TAVAN)
    bolum('son-konusma', 3,
      dokumTam || '⚠son konusma dokumu YOK — PreCompact kancasi kosmamis olabilir; ozetle yetin, Recep sozunu ONA SOR.\n',
      dokumTam
        ? `SON KONUSMA dokumu (Recep sozu AYNEN): ${dokum.dosyaYolu(memoryDir, sid)} — ilk is OKU.\n`
        : '',
      // Toplam tavan aşılırsa Recep'in sözü toptan işaretçiye çevrilmez: en eski mesajlar düşer, en yeniler AYNEN kalır.
      dokumTam ? (n) => dokumMetni(Math.max(1000, DOKUM_TAVAN - (dokumTam.length - n))) : null)
  } catch (e) {
    bolum('son-konusma', 3, `⚠son konusma dokumu okunamadi (${(e && (e.code || e.message)) || 'bilinmeyen'}).\n`)
  }
}

/**
 * ⭐BELGESİZ COMMIT SAYACI — kabul edilmiş bir eksik SESSİZ kalmamalı (2026-08-31, REC-67).
 *
 * Companion üreteci 08-28'de durdu (model sağlayıcı anahtarı 401, havuz boş) ve **üç gün**
 * fark edilmedi. Taşıyıcıyı açmak Recep'in kararıydı ve *"kapalı kalsın"* dedi — yani
 * bayatlık artık **bilinen ve kabul edilmiş eksik**. Kabul edilmiş bir eksiğin tek şartı:
 * GÖRÜNÜR olması.
 *
 * NİÇİN BURADA: kaydı `post-commit` yazıyor ama o **arka planda koşan bir alt kabuk**
 * (`( … ) &`) — çıktısı komut isteminden sonra düşer ve pratikte kimse görmez. Ölçülmüş
 * gerçek: üç gün boyunca kimse görmedi. Oturum açılışı, bir ajana GERÇEKTEN ulaşan kanaldır.
 *
 * ⚠SAYI DEĞİL EĞİLİM önemli: sayaç durmadan büyüyorsa kabul edilmiş eksik BÜYÜYEN bir borca
 * dönüşmüştür ve karar yeniden Recep'e gitmelidir. Bu yüzden ilk tarih de basılır.
 */
try {
  const defterModul = require(path.join(__dirname, '..', '..', '.githooks', 'lib', 'companion-defter.cjs'))
  const gitDirs = []
  try {
    gitDirs.push(
      execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
        cwd: input.cwd || process.cwd(),
        encoding: 'utf8',
        timeout: 10000,
      }).trim(),
    )
  } catch {
    /* git okunamadı — sayaç atlanır, oturum bloklanmaz */
  }
  for (const gd of gitDirs.filter(Boolean)) {
    const { kayitlar, bozuk } = defterModul.defterOku(path.join(gd, defterModul.DEFTER_ADI))
    if (!kayitlar.length) continue
    const ilk = String((kayitlar[0] || {}).ts || '').slice(0, 10)
    const tasiyicisiz = kayitlar.filter((k) => k.sebep === 'tasiyici-yok').length
    const dosya = kayitlar.reduce((a, k) => a + (Number(k.dosya) || 0), 0)
    // Tek satır (REC-433 tavanı): kabul edilmiş eksik GÖRÜNÜR kalır, üç satırlık gerekçe düşer.
    bolum('belgesiz', 5,
      '⚠COMPANION BELGESIZ: ' + kayitlar.length + ' commit belge URETMEDI' +
      (ilk ? ' (ilk: ' + ilk + ')' : '') + ', ' + tasiyicisiz + ' tasiyicisizlik, ' + dosya + ' dosya — ' +
      'Tasiyici KAPALI = RECEP IN KARARI (08-31), kabul edilmis eksik; sayi surekli buyuyorsa Recep e yeniden goturulur, kendi basina ACMA.' +
      (bozuk ? ' (defterde ' + bozuk + ' bozuk satir atlandi)' : '') + '\n',
      '⚠COMPANION BELGESIZ: ' + kayitlar.length + ' commit (kabul edilmis eksik, Recep karari 08-31).\n')
  }
} catch {
  /* defter modülü yok/bozuk: oturum açılışı bundan etkilenmez */
}

try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
  /**
   * ⭐CLAIM YENİLEME (Ops 09-30): startup/resume'da bu oturumun KENDİ süresi dolmuş talebi varsa aynı şerit + aynı
   * desenlerle yeniden alınır; canlı başka oturum aynı şeridi/çakışan deseni tutuyorsa ALINMAZ, tek satır UYARI basılır.
   * `liveClaims()` çağrısından ÖNCE koşar: yenilenen talep aşağıda `mine` olarak görünür (şerit satırı, rol kartı, ad).
   * clear/compact'ta dokunulmaz. FAIL-OPEN: yenile() asla fırlatmaz; hata → alan yok, oturum açılışı aynen (hata stderr'e).
   * Mantık ve kurallar: scripts/board/claim-yenile.cjs (kapı: claim-yenile.test.ts).
   */
  try {
    const y = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'claim-yenile.cjs')).yenile(board, sid, { source })
    if (y.satir) bolum('claim-yenile', 1, y.satir, y.islem === 'yenile' ? 'CLAIM YENILENDI (pano: board.cjs who)\n' : '⚠CLAIM YENILENMEDI (canli cakisma; board.cjs who)\n')
    if (y.islem === 'hata') process.stderr.write(`[session-board] claim yenileme atlandi (${y.sebep}) — oturum acilisi etkilenmedi.\n`)
  } catch (e) {
    process.stderr.write(`[session-board] claim yenileme modulu yuklenemedi (${(e && (e.code || e.message)) || 'bilinmeyen'}) — oturum acilisi etkilenmedi.\n`)
  }
  const live = board.liveClaims()
  const mine = live.find(c => c.sid === sid)
  if (mine && mine.lane) rolSeridi = mine.lane
  pencereAdi = pencereAdiKarari(board, live, sid, input.session_title)

  bolum('serit', 2, mine
    ? `Şeridin: ${mine.lane} — ${mine.globs.join(', ')}\n`
    : `Şeridin: TALEP EDİLMEMİŞ. Çok dosyalı bir işe başlamadan önce şeridi al:\n` +
      `  node scripts/board/board.cjs claim --sid ${sid} --lane <ad> --globs "src/**"\n`,
    mine ? `Şeridin: ${mine.lane}\n` : 'Şeridin: TALEP EDİLMEMİŞ (board.cjs claim)\n')

  // MEKANİZMA (T115-VH) — oturumun İLK işi.
  //
  // Gözcü (Monitor), cron ve tur-sonu uyanışı ÜÇÜ DE bu oturumun içinde yaşar ve oturumla
  // birlikte ÖLÜR; yeni oturum onları devralmaz. 2026-08-20 sabahı dört oturum tam bu yüzden
  // SAĞIR açıldı ve Recep her birini elle dürtmek zorunda kaldı. Talimat dört kanaldan
  // ulaşmıştı; kurulum üretmedi. O yüzden hatırlatma artık oturumun kendi açılışına gömülü.
  //
  // ⭐2026-09-01 ONARIMI (§23) — BU SATIR BENI YANILTTI, kayda geciyor: compact donusunde bu
  // kanca "MEKANIZMA: gozcun CANLI (imlec taze)" yazdi ve DOGRUYDU; ardindan sirf o satira
  // guvenildigi icin 62 dakika boyunca hicbir sey yapilmadi, Recep uyandirdi. Imlec tazeligi
  // gozcu SURECININ yasadigini kanitlar (surec compact'i sag atlatir); bildirimin KONUSMAYA
  // ULASTIGINI kanitlamaz. Dahasi: gozcu TEPKISEL katmandir — panoya biri yazmadikca susar,
  // dolayisiyla "canli" olmasi bir sessizligi KIRACAGI anlamina gelmez.
  // Bu yuzden satir artik IKI OLCUM basar ve tek kelimeyle "canli" DEMEZ.
  // ⛔UCLU KURULUM RITUELI KALDIRILDI (REC-328, Recep karari 2026-09-14, kendi sozu "1").
  //
  // Eskiden burada uc kol vardi ve hepsi ajani `mechanism-setup.cjs plan|prob|dogrula`
  // ucluusunu kurmaya yollardi. Uclu EMEKLI. Yerine gecen model, iki gundur olculerek
  // calisan model: FILO DOGRUDAN MESAJLA calisir (SendMessage + notify_when_idle), pano ise
  // not kutusu DEGIL yalniz CLAIM + CANLILIK yuzeyidir, emir ise LINEAR KAYDIDIR.
  //
  // OLCUM (2026-09-14, REC-328 kaydinda da yazili):
  //   · Pano SES sutunu iki serit icin de ~2700 dk (45 saat) SESSIZ — gozcunun bekcilik
  //     yaptigi kanal fiilen KULLANILMIYOR; bugune kadar YAKALADIGI NOT YOK.
  //   · Lider oturumun TARAMA katmani ASILMIS, TESLIM kaniti 6955 dk (~4,8 gun) bayatti;
  //     filo o sure boyunca KAYIPSIZ calisti, butun emirler SendMessage ile gitti.
  //   · ALTYAPI gozcusu KAPATILDIKTAN SONRA pano `who` canliligi 0 dk kaldi: canlilik
  //     CLAIM ATISINDAN gelir, gozcuden DEGIL.
  //
  // 2026-09-01'in dersi (imlec tazeligi teslimati kanitlamaz, 62 dk kayip) SILINMIYOR —
  // yalnizca artik BASKA bir seyi kanitliyor: o gun kaybedilen sey, kanitlanamayan bir
  // katmana guvenilmesiydi. Cozum katmani daha iyi olcmek degil, ONA IHTIYAC DUYMAMAK oldu.
  // Cetvel: docs/standards/fleet-mechanism-standard.md.
  // Kısa biçim (REC-433 tavanı): ayrıntı docs/standards/fleet-mechanism-standard.md'de.
  bolum('filo', 4,
    'FILO ILETISIMI: dogrudan mesaj (SendMessage) + is bitince notify_when_idle; kapali pencereye ' +
    'mailbox_manage send (alici = TAM oturum kimligi, kisa 8 hane SESSIZCE duser). Pano = claim + canlilik, ' +
    'NOT KUTUSU DEGIL. Emir = Linear kaydi. Zamanlayici/cron/loop ONCE Recep ile (karar 53). ' +
    'Kutuya sir ve Recep onayi yazilmaz. Ayrinti: docs/standards/fleet-mechanism-standard.md\n',
    'FILO: SendMessage + notify_when_idle; emir = Linear; ayrinti fleet-mechanism-standard.md\n')

  bolum('pano', 5, kisaPano(board.summary(sid)) + '\n', 'PANO: node scripts/board/board.cjs who\n')

  const notes = board.notesFor(sid, mine && mine.lane)
  if (notes.length > 0) {
    const tam = 'OKUNMAMIŞ NOTLAR:\n' +
      notes.map(n => `  · ${String(n.sid).slice(0, 8)} → ${n.to || 'herkes'}: ${n.text}`).join('\n') + '\n'
    // Öncelik 4: Ops sırası kimlik → durum bloğu → Recep sözü → gerisi; notlar Recep sözünden ÖNCE küçülür.
    bolum('notlar', 4, tam.length > 800 ? tam.slice(0, 750) + `\n…(${notes.length} not; kirpildi — panoyu oku)\n` : tam,
      `OKUNMAMIŞ NOTLAR: ${notes.length} adet — panoyu oku\n`)
  }
} catch (e) {
  // Pano okunamazsa oturum yine de açılır — koordinasyon katmanı fail-open (bkz. lane-guard).
  bolum('pano-hata', 5, `(pano okunamadı: ${e && e.message})\n`)
}

// ANA AĞAÇ TAZELİĞİ (REC-345, karar 44 — ölçüldü 2026-09-17): kancalar/CLAUDE.md/.mcp.json ana
// ağaçtan yüklenir; ana ağaç 50 commit gerideyken dört merge'lü düzenek hiçbir pencerede etkin
// değildi ve hiçbir kapı görmedi. Güncelse satır basılmaz (sessizlik kuralı). Ağ beklemez.
try {
  bolum('tazelik', 1, require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-agac-tazelik.cjs'))
    .acilisSatiri(input.cwd || process.cwd()))
} catch (e) {
  bolum('tazelik', 1, `⚠ana agac tazelik modulu yuklenemedi (${(e && (e.code || e.message)) || 'bilinmeyen'}) — tazelik OLCULMEDI.\n`)
}

// SAGE DOSYA DERSİ İŞARETLERİ (Recep 2026-09-18: "gün içinde defalarca compact oluyor").
// Dersler dosya başına BİR KEZ gösterilir; compact bağlamı kırpınca o "bir kez" kaybolur ve
// hafıza yine okunmamış olur. Bu yüzden compact/clear dönüşünde nesil artırılır — işaretler
// geçersizleşir, dersler kırpılmış bağlamda bir kez daha görünür. Sessiz ve fail-open.
if (source === 'compact' || source === 'clear') {
  try {
    require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-dosya-dersi.cjs'))
      .isaretleriTemizle(input.session_id)
  } catch {
    /* ders kancası yoksa oturum yine açılır — koordinasyon katmanı fail-open */
  }
}

// YÖNTEM GÖSTERGESİ (T144-VH, Recep 08-21): ajan panoya baktığında cetveli de görsün —
// tarayıcıda ayrı sayfa değil, bakılan yerin yanında. Öneri, dayatma değil; sapma yazılır.
// Kısa biçim (REC-433 tavanı): kısa harita cetvelin kendisinde; burada yalnız işaretçi.
bolum('yontem', 6,
  'YÖNTEM CETVELİ (docs/standards/execution-method-standard.md): iş emrinde YÖNTEM: satırı ZORUNLU, seçim ' +
  'SERBEST (ölç, seç, sapmayı yaz); harita ve karar tablosu cetvelde.\n')

// POSTA KUTUSU SAYACI (karar 54, 2026-09-21): açılışta kutuya bakılmazsa kapalı pencereye
// bırakılan mesaj yine kaybolur. 0 → satır yok; ölçülemezse "ölçülemedi" satırı (temiz sayılmaz).
// Üst sınır 5 sn: kanca açılışı bekletmesin (ölçüldü ~0,8–1,2 sn).
const yaz = () => {
  rolBolumuEkle()
  const cikti = {
    hookEventName: 'SessionStart',
    additionalContext: birlestir(),
  }
  if (pencereAdi && PENCERE_ADI_KAYNAKLARI.has(source)) cikti.sessionTitle = pencereAdi
  process.stdout.write(JSON.stringify({ hookSpecificOutput: cikti }))
}
;(async () => {
  try {
    const sayac = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'posta-kutusu-sayac.cjs'))
    const kok = path.join(__dirname, '..', '..')
    bolum('posta', 1, sayac.acilisSatiri(await sayac.okunmamis(sid, { kok, zamanAsimiMs: 5000 })))
  } catch (e) {
    bolum('posta', 1, `⚠posta kutusu sayaci yuklenemedi (${(e && (e.code || e.message)) || 'bilinmeyen'}) — kutu OLCULMEDI.\n`)
  }
  yaz()
})()
