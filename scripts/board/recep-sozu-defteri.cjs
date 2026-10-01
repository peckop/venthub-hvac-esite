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

function defterYolu() {
  return process.env.VENTHUB_RECEP_DEFTER || path.join(os.homedir(), '.claude', DEFTER_ADI)
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
    const s = siniflandir(girdi && girdi.prompt)
    if (!s.recep) return { kaydedildi: false, sebep: s.sebep }
    const sid = girdi && typeof girdi.session_id === 'string' ? girdi.session_id : ''
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

/** Defterin son OKUMA_BAYT baytından kayıtları okur; bozuk satır atlanır. */
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
        if (o && typeof o.ts === 'string' && typeof o.soz === 'string') out.push(o)
      } catch { /* bozuk satır */ }
    }
    return out
  } catch {
    return []
  } finally {
    if (fd !== undefined) try { fs.closeSync(fd) } catch { /* kapatılamadı */ }
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
  defterYolu, imlecDizini, SOZ_TAVAN, TUR_TAVAN, ILK_PENCERE_MS, MASKE,
}
