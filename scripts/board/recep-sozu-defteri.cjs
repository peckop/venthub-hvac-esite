#!/usr/bin/env node
'use strict'
/**
 * RECEP SÖZÜ DEFTERİ (REC-554, karar 218/224): Recep hangi pencereye ne yazarsa ORTAK DEFTERE düşer ve OPS bunu görür.
 *
 * NİÇİN VAR (olay 2026-10-01): Recep ARAÇ penceresine "217 evet" yazdı, OPS haber alamadı ve beş mesaj boyunca aynı
 * onayı yeniden istedi. Recep: "ben onay verdiğimde sen zaten bilmelisin". Geçici kural (her pencere aynı turda OPS'a
 * yazsın) insana bağlıydı; bu modül onu kancaya taşır. "Bilmek yetki taşımaz": defter yalnız GÖRÜNÜRLÜK sağlar, hiçbir
 * onayın yerine geçmez (canlı, migration, para, ayar dosyası kuralları değişmedi).
 *
 * NE YAKALAR: UserPromptSubmit girdisindeki `prompt` = Recep'in KENDİ mesajı. YAKALANMAYAN: pencereler arası mesaj
 * (`<cross-session-message>`), alt ajan raporu (`<agent-message>`), görev bildirimi, sistem bloğu, yerel komut çıktısı,
 * yapıştırılmış içerik (`<pasted_content>`). Bu bloklar silinir; geriye anlamlı metin kalmazsa kayıt YAZILMAZ. Peer
 * mesajındaki "217 evet" bu yüzden karar sayılmaz (kapı testinde kol).
 *
 * NEREYE: kullanıcıya özel, sürümsüz, tek JSONL: `~/.claude/recep-sozu-defteri.jsonl` (tüm worktree'ler ortak; depoya
 * GİRMEZ — repo PUBLIC). Satır: `{ts, sid, rol, pencere, no, cevap, soz}`. Sır görünümlü metin MASKELENİR.
 *
 * KİM NEYİ GÖRÜR (iki yön, `gorunur`):
 *   · OPS penceresi: kendi dışındaki pencerelere yazılan HER yeni Recep sözü (okunmamışlar; imleç sid başına).
 *   · Diğer pencereler: OPS penceresinde verilen NUMARALI kararlar; söz o pencerenin departmanını adıyla anıyorsa ya da
 *     hiçbir departmanı anmıyorsa (herkes) görünür.
 *
 * FAIL-OPEN: bu modül hiçbir şeyi BLOKLAMAZ; hata olursa kayıt/satır düşer, kanca devam eder (stderr tek satır).
 * Zamanlayıcı yok (karar 53): kayıt kancanın her turunda, okuma kancanın her turunda — itici kanal.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const pencereAdlari = require('./pencere-adlari.cjs')

const DEFTER_ADI = 'recep-sozu-defteri.jsonl'
/** Sözün defterde tutulacak azami uzunluğu (fazlası kırpılır, `kirpildi: true`). */
const SOZ_TAVAN = 4000
/** Okuma penceresi: defterin yalnız SON bu kadar baytı okunur (dosya büyüse de tur yavaşlamaz). */
const OKUMA_BAYT = 128 * 1024
/** İlk görüşte (imleç yok) bu kadar eski sözler gösterilir; eski defter yığını yeni pencereyi boğmasın. */
const ILK_PENCERE_MS = 30 * 60 * 1000
/** Bir turda en çok bu kadar satır gösterilir; fazlası sayı olarak bildirilir. */
const TUR_TAVAN = 5
/** Satırda gösterilen söz uzunluğu. */
const GORUNUR_UZUNLUK = 200

/** Gerçek oturum kimliği: UUID. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Aynı sid + aynı söz bu süre içinde ikinci kez yazılmaz. */
const TEKRAR_MS = 10 * 1000

function varsayilanYol() {
  return path.join(os.homedir(), '.claude', DEFTER_ADI)
}
function defterYolu() {
  return process.env.VENTHUB_RECEP_DEFTER || varsayilanYol()
}
/** Test koşusu mu? (vitest, NODE_ENV=test, jest). Kancayı spawn eden testler `process.env`'i miras ettirir. */
function testOrtamiMi() {
  return Boolean(process.env.VITEST || process.env.JEST_WORKER_ID || process.env.NODE_ENV === 'test')
}
/** Defter yolu GERÇEK varsayılan yoldan başka bir yere mi işaret ediyor? (Test ortamında yalnız o yazılabilir.) */
function baskaYolMu() {
  const secili = process.env.VENTHUB_RECEP_DEFTER
  if (!secili) return false
  return path.resolve(secili).toLowerCase() !== path.resolve(varsayilanYol()).toLowerCase()
}
function imlecDizini() {
  return path.join(path.dirname(defterYolu()), 'recep-sozu-imlec')
}

/** Dosya adına girecek sid güvenli mi (yol kaçışı yok)? */
function sidGuvenliMi(sid) {
  return typeof sid === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(sid)
}

// ───────────────────────── sınıflandırma ─────────────────────────

/** Harness/peer blokları: Recep'in sözü DEĞİL, gövdesiyle birlikte silinir. */
const DIS_BLOKLAR = [
  /<cross-session-message\b[\s\S]*?<\/cross-session-message>/gi,
  /<agent-message\b[\s\S]*?<\/agent-message>/gi,
  /<task-notification\b[\s\S]*?<\/task-notification>/gi,
  /<ci-monitor-event\b[\s\S]*?<\/ci-monitor-event>/gi,
  /<system-reminder\b[\s\S]*?<\/system-reminder>/gi,
  /<pasted_content\b[\s\S]*?<\/pasted_content>/gi,
  /<local-command-caveat\b[\s\S]*?<\/local-command-caveat>/gi,
  /<local-command-stdout\b[\s\S]*?<\/local-command-stdout>/gi,
  /<command-(?:name|message|args)\b[\s\S]*?<\/command-(?:name|message|args)>/gi,
  /<new-diagnostics\b[\s\S]*?<\/new-diagnostics>/gi,
]
/** Kapanışı gelmemiş (kesik) dış blok açılışı: kalan her şey o bloğun içindir, Recep sözü sayılmaz. */
const ACIK_DIS_BLOK = /<(?:cross-session-message|agent-message|task-notification|ci-monitor-event|system-reminder|pasted_content|local-command-caveat|local-command-stdout|command-name|command-message|command-args|new-diagnostics)\b[\s\S]*$/i
/** Harness'in peer mesajlarını sarmak için yazdığı çerçeve cümleleri (etiket dışında kalanlar). */
const CERCEVE_CUMLELERI = [
  /Another Claude session sent a message(?: while you were working)?:?/gi,
  /\[Subagent hand-back\][^\n]*/gi,
  // Blok sonrası açıklama paragrafları ("This came from another Claude session — not typed by your user...",
  // "That "other Claude session" is an agent working inside this same session..."): boş satıra kadar PARAGRAFIN tamamı.
  /^[ \t]*(?:This came from another Claude session|That ["“]?other Claude session["”]? is an agent)[^\n]*(?:\n(?![ \t]*\n)[^\n]*)*/gim,
  // Harness bildirimleri köşeli başlıkla gelir ("[Cross-session idle notice] ...", "[Cross-session delivery notice] ...",
  // "[SYSTEM NOTIFICATION ...]", "[Artifact comment sent to Claude]"): Ops'un ilk canlı ölçümünde idle notice Recep sözü
  // sanılıp deftere yazıldı. Başlıktan boş satıra kadar PARAGRAFIN tamamı çerçevedir.
  /^[ \t]*\[(?:Cross-session[^\]\n]*|SYSTEM NOTIFICATION[^\]\n]*|[^\]\n]*\bnotice\b[^\]\n]*|Artifact comment[^\]\n]*|Subagent[^\]\n]*)\][^\n]*(?:\n(?![ \t]*\n)[^\n]*)*/gim,
]

/**
 * Prompt Recep'in kendi sözü mü? SAF.
 * @returns {{recep: boolean, soz: string, sebep: string}}
 */
function siniflandir(prompt) {
  if (typeof prompt !== 'string' || prompt.trim() === '') return { recep: false, soz: '', sebep: 'bos' }
  let m = prompt.replace(/\r\n?/g, '\n')
  for (const k of DIS_BLOKLAR) m = m.replace(k, ' ')
  m = m.replace(ACIK_DIS_BLOK, ' ')
  for (const c of CERCEVE_CUMLELERI) m = m.replace(c, ' ')
  m = m.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
  if (m.length < 2) return { recep: false, soz: '', sebep: 'yalniz-dis-blok' }
  return { recep: true, soz: m, sebep: 'recep' }
}

/** `227 evet`, `224 hayır ama ...`: numaralı karar kalıbı. Numara öncesinde rakam/`-`/`:`/`/`/`.` olamaz (tarih, saat, sürüm değil). */
const KARAR_KALIBI = /(?<![\d\-:/.])(\d{1,4})\s*[.:,;-]?\s*(evet|hayir|kabul|ret|reddet|onay|olur|tamam|beklemede|iptal|ertele)\b/gi

/** Sözden karar numaralarını çıkarır. SAF. Türkçe harf katlanır (hayır = hayir). */
function kararlar(soz) {
  const katli = pencereAdlari.katla(String(soz || ''))
  const cikti = []
  let e
  KARAR_KALIBI.lastIndex = 0
  while ((e = KARAR_KALIBI.exec(katli)) !== null) cikti.push({ no: e[1], cevap: e[2].toLowerCase() })
  return cikti
}

// ───────────────────────── maske ─────────────────────────

const SIR_KALIPLARI = [
  /\bsk-[A-Za-z0-9_-]{16,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]{16,}/gi,
  /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s:@/]+:[^\s@/]+@\S+/gi,
]
/** `parola: xyz`, `token=abc`: ANAHTAR kalır, DEĞER maskelenir. */
const ANAHTAR_DEGER = /\b(password|passwd|parola|sifre|şifre|secret|token|api[_-]?key|anahtar)\b(\s*[:=]\s*)(\S+)/gi
/** Uzun, boşluksuz, karışık harf-rakam diziler (anahtar/özet görünümlü). */
const UZUN_DIZI = /\b(?=[A-Za-z0-9+/_-]*\d)(?=[A-Za-z0-9+/_-]*[A-Za-z])[A-Za-z0-9+/_-]{40,}\b/g
const MASKE = '[MASKELENDI]'

/** Sır görünümlü metni maskeler. SAF. */
function maskele(metin) {
  let m = String(metin || '')
  for (const k of SIR_KALIPLARI) m = m.replace(k, MASKE)
  m = m.replace(ANAHTAR_DEGER, (_t, ad, ayrac) => `${ad}${ayrac}${MASKE}`)
  m = m.replace(UZUN_DIZI, MASKE)
  return m
}

// ───────────────────────── rol ─────────────────────────

/** Pencere adı ya da şerit adından pano şerit adını (ARAC, OPS...) bulur; yoksa ''. */
function seritAdi(ad) {
  for (const [serit, pencere] of pencereAdlari.TABLO) {
    if (pencereAdlari.ayniMi(ad, serit) || pencereAdlari.ayniMi(ad, pencere)) return serit
  }
  return ''
}

/**
 * sid → `{rol, pencere}`. Önce panodaki talep (şerit), yoksa pencere adı. Hiçbiri yoksa rol '' (görünürde 'bilinmiyor').
 * `board` verilmezse çözümleme denenmez. Hata atmaz.
 */
function rolBul(sid, board) {
  const sonuc = { rol: '', pencere: '' }
  if (!board || !sid) return sonuc
  try {
    if (typeof board.pencereAdlari === 'function') sonuc.pencere = String(board.pencereAdlari().get(sid) || '')
  } catch { /* ad çözülemedi */ }
  try {
    if (typeof board.tumTalepler === 'function') {
      const t = board.tumTalepler().filter((c) => c.sid === sid).sort((a, b) => Date.parse(b.ts || 0) - Date.parse(a.ts || 0))[0]
      if (t && t.lane) sonuc.rol = seritAdi(t.lane) || String(t.lane).toUpperCase()
    }
  } catch { /* talep çözülemedi */ }
  if (!sonuc.rol && sonuc.pencere) sonuc.rol = seritAdi(sonuc.pencere)
  return sonuc
}

// ───────────────────────── yaz ─────────────────────────

/**
 * Kancanın çağırdığı kayıt. Recep sözü değilse YAZMAZ. Hata atmaz.
 * @param {{prompt?: string, session_id?: string}} girdi UserPromptSubmit stdin
 * @param {{board?: object, simdi?: number}} [secenek]
 * @returns {{kaydedildi: boolean, sebep: string, kayit?: object}}
 */
function kaydet(girdi, secenek = {}) {
  try {
    // KORUMA 1 (Ops 10-01, ilk canlı ölçüm): eski kanca testleri yalıtımsız koşunca GERÇEK deftere sahte "Recep sözü"
    // ("merhaba", sid benim1) yazdı. Test ortamında gerçek defter yoluna yazmak YASAK; test geçici yol vermelidir.
    if (testOrtamiMi() && !baskaYolMu()) return { kaydedildi: false, sebep: 'test-ortami-gercek-defter-yasak' }
    const s = siniflandir(girdi && girdi.prompt)
    if (!s.recep) return { kaydedildi: false, sebep: s.sebep }
    const sid = girdi && typeof girdi.session_id === 'string' ? girdi.session_id : ''
    // KORUMA 2: gerçek oturum kimliği UUID'dir; "benim1" gibi uydurma sid kayda girmez.
    if (!UUID.test(sid)) return { kaydedildi: false, sebep: 'sid-uuid-degil' }
    const { rol, pencere } = rolBul(sid, secenek.board)
    let soz = maskele(s.soz)
    let kirpildi = false
    if (soz.length > SOZ_TAVAN) { soz = soz.slice(0, SOZ_TAVAN); kirpildi = true }
    const k = kararlar(soz)
    const kayit = {
      ts: new Date(secenek.simdi || Date.now()).toISOString(),
      sid,
      rol: rol || '',
      pencere: pencere || '',
      no: k.length ? k[0].no : null,
      cevap: k.length ? k[0].cevap : null,
      nolar: k.length > 1 ? k.map((x) => x.no) : undefined,
      soz,
      ...(kirpildi ? { kirpildi: true } : {}),
    }
    // KORUMA 3: aynı sid + aynı söz TEKRAR_MS içinde ikinci kez yazılmaz (aynı mesajı altı kez kaydeden test artığı).
    const simdi = secenek.simdi || Date.now()
    const tekrar = kayitlariOku().some((k) => k.sid === sid && k.soz === soz && Math.abs(simdi - Date.parse(k.ts)) < TEKRAR_MS)
    if (tekrar) return { kaydedildi: false, sebep: 'tekrar' }
    const yol = defterYolu()
    fs.mkdirSync(path.dirname(yol), { recursive: true })
    fs.appendFileSync(yol, JSON.stringify(kayit) + '\n')
    return { kaydedildi: true, sebep: 'yazildi', kayit }
  } catch (e) {
    process.stderr.write(`[recep-sozu-defteri] kayit YAZILAMADI (fail-open): ${e && e.message}\n`)
    return { kaydedildi: false, sebep: 'yazilamadi' }
  }
}

// ───────────────────────── oku ─────────────────────────

/** Test koşularının deftere sızdırdığı bilinen sahte kimlikler (Ops ilk canlı ölçüm, 2026-10-01): 5555… UUID biçimindedir. */
const BILINEN_TEST_SIDLERI = new Set(['55555555-aaaa-4aaa-8aaa-555555555555'])
/** Uydurma rol adları (testler "BEN" yazdı); gerçek roller pano şerit adlarıdır. */
const SAHTE_ROLLER = new Set(['BEN'])

/**
 * OKUMA süzgeci: dosyaya ek-yazılmış ESKİ sahte satırlar silinmeden görünmez/sayılmaz (silme izni yok; okumada süzmek de
 * söz kaybettirmez). Gerçek Recep sözü bu üç eleme dışında hiçbir şeyi kaybetmez: UUID olmayan sid · bilinen sahte
 * kimlik/rol · sözü harness çerçevesinden ibaret kayıt (idle notice gibi).
 */
function gecerliKayit(k) {
  if (typeof k.sid !== 'string' || !UUID.test(k.sid)) return false
  if (BILINEN_TEST_SIDLERI.has(k.sid.toLowerCase())) return false
  if (SAHTE_ROLLER.has(String(k.rol || '').toUpperCase())) return false
  if (!siniflandir(k.soz).recep) return false
  return true
}

/** Defterin son OKUMA_BAYT baytından kayıtları okur; bozuk ve geçersiz (sahte) satır atlanır. */
function kayitlariOku() {
  const yol = defterYolu()
  let fd
  try {
    fd = fs.openSync(yol, 'r')
    const boy = fs.fstatSync(fd).size
    const bas = Math.max(0, boy - OKUMA_BAYT)
    const tampon = Buffer.alloc(boy - bas)
    fs.readSync(fd, tampon, 0, tampon.length, bas)
    let metin = tampon.toString('utf8')
    if (bas > 0) metin = metin.slice(metin.indexOf('\n') + 1) // ortadan kesilen ilk satırı at
    const out = []
    for (const satir of metin.split('\n')) {
      if (!satir.trim()) continue
      try {
        const o = JSON.parse(satir)
        if (o && typeof o.ts === 'string' && typeof o.soz === 'string' && gecerliKayit(o)) out.push(o)
      } catch { /* bozuk satır */ }
    }
    return out
  } catch {
    return []
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* kapatılamadı */ }
  }
}

// ───────────────────────── arşiv / döndürme (ARC-15) ─────────────────────────

/**
 * ⭐DEFTER ARTIK KARAR KAYDIDIR (Recep 10-01: "tarih ve saat var ise neleri yazdığım nelere onay verdiğim de kayıt altında
 * olmuş olur"). Büyüyen tek dosya iki şeyi bozar: kanca her turda son OKUMA_BAYT'ı okur (eski kararlar görünmez olur) ve
 * dosya sonsuza dek şişer. Çare KIRPMA DEĞİL TAŞIMA: aktif defter DONDUR_ESIK_BAYT'ı aşınca eski kayıtlar aylık arşive
 * (`recep-sozu-defteri.arsiv-YYYY-MM.jsonl`) EKLENİR, aktifte son DONDUR_TUT_BAYT kalır. Hiçbir kayıt silinmez.
 * Aktif defter eşiği OKUMA_BAYT'ın ALTINDA tutulur: kanca okuması aktif defteri her zaman TAMAMEN görür.
 */
const DONDUR_ESIK_BAYT = 96 * 1024
const DONDUR_TUT_BAYT = 32 * 1024
const ARSIV_ONEK = 'recep-sozu-defteri.arsiv-'

/** Arşiv dosyaları, eskiden yeniye. */
function arsivYollari() {
  const dizin = path.dirname(defterYolu())
  try {
    return fs
      .readdirSync(dizin)
      .filter((f) => f.startsWith(ARSIV_ONEK) && f.endsWith('.jsonl'))
      .sort()
      .map((f) => path.join(dizin, f))
  } catch {
    return []
  }
}

/** Buffer'ı son TAM satıra kadar keser (yazım ortasındaki kesik satırı almaz). */
function tamSatirlar(tampon) {
  const son = tampon.lastIndexOf(0x0a)
  return son === -1 ? Buffer.alloc(0) : tampon.subarray(0, son + 1)
}

/**
 * Arşiv + aktif defterin TÜM geçerli kayıtları (tekilleştirilmiş: aynı ts+sid+söz bir kez). Kanca kullanmaz (yavaş);
 * karar listesi, pano sayfası ve geri yükleme doğrulaması kullanır.
 */
function tumKayitlar() {
  const gorulen = new Set()
  const out = []
  for (const yol of [...arsivYollari(), defterYolu()]) {
    let metin
    try { metin = fs.readFileSync(yol, 'utf8') } catch { continue }
    for (const satir of metin.split('\n')) {
      if (!satir.trim()) continue
      try {
        const o = JSON.parse(satir)
        if (!o || typeof o.ts !== 'string' || typeof o.soz !== 'string' || !gecerliKayit(o)) continue
        const anahtar = `${o.ts}|${o.sid}|${o.soz}`
        if (gorulen.has(anahtar)) continue
        gorulen.add(anahtar)
        out.push(o)
      } catch { /* bozuk satır */ }
    }
  }
  return out
}

/** Numaralı kararlar (arşiv dahil), eskiden yeniye: `{ts, no, cevap, soz, rol, pencere}`. Pano "Son kararlar" bölümü bunu okur. */
function kararKayitlari() {
  return tumKayitlar().filter((k) => k.no).map((k) => ({ ts: k.ts, no: k.no, cevap: k.cevap, soz: k.soz, rol: k.rol, pencere: k.pencere }))
}

/**
 * Aktif defter eşiği aştıysa eski kayıtları aylık arşive TAŞIR. Hiçbir kayıt kaybolmaz:
 *   1. aktif defter okunur, boyutu not edilir;
 *   2. tutulacak kuyruk ve taşınacak baş belirlenir (satır sınırında);
 *   3. baş, kayıtların KENDİ ayının arşivine eklenir; arşiv boyu beklenen kadar büyümediyse işlem DURUR;
 *   4. aktif defter boyu hâlâ aynıysa (araya yazım girmediyse) geçici dosya + rename ile yerine konur.
 * Araya yazım girerse ya da dosya başka süreçte açıksa (Windows EBUSY/EPERM) VAZGEÇİLİR: aktif defter dokunulmadan kalır,
 * arşive gitmiş satırlar sonraki koşumda `tumKayitlar` tekilleştirmesiyle çift sayılmaz.
 * @returns {{durum: 'gerek-yok'|'dondu'|'yaris'|'mesgul'|'hata', tasinan?: number, tutulan?: number, sebep?: string}}
 */
function dondur(secenek = {}) {
  const esik = secenek.esikBayt || DONDUR_ESIK_BAYT
  const tut = secenek.tutBayt || DONDUR_TUT_BAYT
  const yol = defterYolu()
  try {
    const ilk = fs.statSync(yol).size
    if (ilk <= esik) return { durum: 'gerek-yok' }
    // Satır sonu olmayan son satır da KALIR (kesik satırı atmak kayıp olurdu); eşzamanlı yazım aşağıdaki boy kontrolleriyle yakalanır.
    const satirlar = fs.readFileSync(yol, 'utf8').split('\n').filter((s) => s !== '')
    let toplam = 0
    let bolum = satirlar.length
    while (bolum > 0 && toplam + Buffer.byteLength(satirlar[bolum - 1]) + 1 <= tut) {
      toplam += Buffer.byteLength(satirlar[bolum - 1]) + 1
      bolum--
    }
    const tasinacak = satirlar.slice(0, bolum)
    const tutulacak = satirlar.slice(bolum)
    if (tasinacak.length === 0) return { durum: 'gerek-yok' }

    // Ay → satırlar. Ayı çözülemeyen (bozuk) satır "diger" arşivine gider: KAYIP YOK.
    const aylar = new Map()
    for (const s of tasinacak) {
      let ay = 'diger'
      try {
        const o = JSON.parse(s)
        if (o && typeof o.ts === 'string' && /^\d{4}-\d{2}/.test(o.ts)) ay = o.ts.slice(0, 7)
      } catch { /* bozuk satır: diger */ }
      if (!aylar.has(ay)) aylar.set(ay, [])
      aylar.get(ay).push(s)
    }
    if (fs.statSync(yol).size !== ilk) return { durum: 'yaris', sebep: 'okuma sirasinda deftere yazildi' }

    const dizin = path.dirname(yol)
    for (const [ay, sat] of aylar) {
      const hedef = path.join(dizin, `${ARSIV_ONEK}${ay}.jsonl`)
      const veri = sat.join('\n') + '\n'
      const once = fs.existsSync(hedef) ? fs.statSync(hedef).size : 0
      fs.appendFileSync(hedef, veri)
      if (fs.statSync(hedef).size !== once + Buffer.byteLength(veri)) {
        return { durum: 'hata', sebep: `arsiv boyu beklenenle uyusmuyor: ${path.basename(hedef)} (aktif defter DOKUNULMADI)` }
      }
    }
    if (fs.statSync(yol).size !== ilk) return { durum: 'yaris', sebep: 'arsivlerken deftere yazildi (aktif DOKUNULMADI; satirlar arsivde, tekilleştirilir)' }

    const gecici = `${yol}.donduruluyor-${process.pid}`
    fs.writeFileSync(gecici, tutulacak.join('\n') + '\n')
    try {
      fs.renameSync(gecici, yol)
    } catch (e) {
      try { fs.unlinkSync(gecici) } catch { /* temizlenemedi */ }
      return { durum: 'mesgul', sebep: String((e && e.code) || (e && e.message) || e) }
    }
    return { durum: 'dondu', tasinan: tasinacak.length, tutulan: tutulacak.length }
  } catch (e) {
    return { durum: 'hata', sebep: String((e && e.message) || e).slice(0, 160) }
  }
}

function imlecOku(sid) {
  try {
    const o = JSON.parse(fs.readFileSync(path.join(imlecDizini(), `${sid}.json`), 'utf8'))
    return Number.isFinite(o.sonTs) ? o.sonTs : null
  } catch {
    return null
  }
}
function imlecYaz(sid, sonTs) {
  try {
    fs.mkdirSync(imlecDizini(), { recursive: true })
    fs.writeFileSync(path.join(imlecDizini(), `${sid}.json`), JSON.stringify({ sonTs }))
  } catch (e) {
    process.stderr.write(`[recep-sozu-defteri] imlec yazilamadi (sozler tekrar gelebilir): ${e && e.message}\n`)
  }
}

/** Söz hangi departmanları ADIYLA anıyor? (TABLO'dan; Türkçe katlamalı.) Boş küme = kimseyi anmıyor = herkes. */
function anilanSeritler(soz) {
  const katli = pencereAdlari.katla(String(soz || ''))
  const bulunan = new Set()
  for (const [serit, ad] of pencereAdlari.TABLO) {
    for (const aday of [serit, ad]) {
      const k = pencereAdlari.katla(aday)
      if (k && new RegExp(`(?<![a-z0-9])${k.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}(?![a-z0-9])`).test(katli)) bulunan.add(serit)
    }
  }
  return bulunan
}

function saat(ts) {
  try {
    return new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(ts))
  } catch {
    return String(ts).slice(11, 16)
  }
}
function tekSatir(soz) {
  const t = String(soz).replace(/\s+/g, ' ').trim()
  return t.length > GORUNUR_UZUNLUK ? t.slice(0, GORUNUR_UZUNLUK) + '…' : t
}

/**
 * Bu pencerenin bu turda göreceği satırlar; imleci ilerletir. Hata atmaz.
 * @param {{sid: string, rol: string, simdi?: number}} g
 * @returns {string[]} additionalContext'e eklenecek satırlar (boşsa sessiz)
 */
function gorunur(g) {
  try {
    const { sid } = g
    if (!sidGuvenliMi(sid)) return []
    const simdi = g.simdi || Date.now()
    const rol = String(g.rol || '').toUpperCase()
    const imlec = imlecOku(sid)
    const esik = imlec === null ? simdi - ILK_PENCERE_MS : imlec
    const tum = kayitlariOku()
    const yeniler = tum.filter((k) => {
      const t = Date.parse(k.ts)
      if (!Number.isFinite(t) || t <= esik) return false
      if (rol === 'OPS') return k.sid !== sid && String(k.rol || '').toUpperCase() !== 'OPS'
      if (String(k.rol || '').toUpperCase() !== 'OPS' || !k.no) return false
      const anilan = anilanSeritler(k.soz)
      return anilan.size === 0 || (rol !== '' && anilan.has(rol))
    })
    if (tum.length > 0) {
      const sonT = Math.max(...tum.map((k) => Date.parse(k.ts)).filter(Number.isFinite))
      if (Number.isFinite(sonT) && (imlec === null || sonT > imlec)) imlecYaz(sid, sonT)
    } else if (imlec === null) {
      imlecYaz(sid, simdi)
    }
    if (yeniler.length === 0) return []
    const goster = yeniler.slice(-TUR_TAVAN)
    const satirlar = goster.map((k) => {
      const kim = k.pencere || k.rol || 'bilinmiyor'
      if (rol === 'OPS') {
        const kar = k.no ? ` · karar ${k.no} ${k.cevap || ''}`.trimEnd() : ''
        return `RECEP SÖZÜ (defter, yeni): ${kim} ${saat(k.ts)}${kar} · "${tekSatir(k.soz)}"`
      }
      return `OPS'TA VERİLEN KARAR (defter): ${saat(k.ts)} · ${k.no} ${k.cevap || ''} · "${tekSatir(k.soz)}"`.replace(/\s+·/g, ' ·')
    })
    if (yeniler.length > goster.length) satirlar.push(`(+${yeniler.length - goster.length} söz daha; tamamı: ${defterYolu()})`)
    return satirlar
  } catch (e) {
    process.stderr.write(`[recep-sozu-defteri] okuma basarisiz (fail-open): ${e && e.message}\n`)
    return []
  }
}

module.exports = {
  siniflandir, kararlar, maskele, rolBul, kaydet, gorunur, anilanSeritler, kayitlariOku, seritAdi,
  defterYolu, imlecDizini, testOrtamiMi, SOZ_TAVAN, TUR_TAVAN, ILK_PENCERE_MS, TEKRAR_MS, MASKE,
  OKUMA_BAYT, DONDUR_ESIK_BAYT, DONDUR_TUT_BAYT, ARSIV_ONEK, arsivYollari, tamSatirlar, tumKayitlar, kararKayitlari, dondur,
}
