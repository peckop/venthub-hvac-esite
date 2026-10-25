'use strict'
/**
 * OPS OTURUM KİMLİĞİ — TEK KAYNAK (ARC-99, 2026-10-12; yazma kuralı ARC-140, 2026-10-15).
 *
 * ⭐NİÇİN: kokpit düğmeleri (ops-kokpit modu), linear-zil bildirimi ve session-board'un "lider" testi OPS
 * penceresinin oturum kimliğini kodda sabit tutuyordu (cb0467f1...). OPS penceresi değişince (yeni OPS) Recep'in
 * kokpit düğmesi eski pencereye düşüyordu. Kimlik artık TEK dosyada: `~/.claude/mod-durum/ops-oturumu.json`
 * (`{ sid, ts, kaynak, onceki? }`); modlar ve kancalar buradan okur.
 *
 * ⭐KİM YAZAR: yalnız OPS penceresinin KENDİSİ, açılışta (session-board.cjs, SessionStart). OPS penceresi
 * `.claude/settings.local.json` içindeki `"agent": "ops-pencere"` ayarıyla tanınır (şerit/CC_LANE'e bağlı değil:
 * yeni OPS şerit almaz). Aday kimliği taşımayan pencere (eski OPS, departman pencereleri) HİÇ yazmaz. Etkileşimli
 * olmayan süreç (claude -p, SDK) da yazmaz: sessions kaydında `kind` varsa ve `interactive` değilse aday sayılmaz.
 *
 * ⭐ÜZERİNE YAZMA KURALI — KAYITLI KİMLİK CANLI MI? (ARC-140, 15 Ekim; Recep şikâyeti 2. kez: kokpit OPS'u yabancı
 * saydı). Vaka: 14 Ekim 15:40'ta Claude Desktop'ın açıp 15:52'de sildiği geçici worktree oturumu (OPS ajan ayarını
 * taşıyan bir `startup`) dosyayı ele geçirdi; gerçek OPS (11:18'den beri canlı) `resume`/`compact` ile döndüğünde
 * eski kural ("başka kimlik varken startup dışı yazma") onu reddetti, dosya ölü kimlikte kaldı. Eski kural yalnız
 * KAYNAĞA bakıyordu; iki hata yönü vardı: canlı OPS'u bir startup çalabiliyordu, ölü kimliği canlı OPS düzeltemiyordu.
 * Yeni kural kayıtlı kimliğin pencere kaydına (`~/.claude/sessions/*.json`, sessionId + pid yaşıyor mu) bakar:
 *   - dosya yok ya da aynı kimlik → yaz;
 *   - kayıtlı kimlik ÖLÜ → resume/compact/startup fark etmeden aday pencere devralır (eskisi `onceki` alanında kalır);
 *   - kayıtlı kimlik CANLI → HİÇBİR açılış yazmaz (startup dahil); iki canlı OPS adayı varsa karar insanındır:
 *     session-board açılışta uyarı basar, elle düzeltme `--yaz`;
 *   - canlılık ÖLÇÜLEMEDİ (pencere kayıt dizini okunamadı) → eski kural (startup yazar, diğerleri yazmaz).
 * Elle düzeltme: `node scripts/board/ops-oturumu.cjs --yaz <oturum-kimliği>`; durum: argümansız çağrı kimliği ve
 * canlılığını yazar.
 *
 * FAIL-OPEN/GÜVENLİ: okunamayan/bozuk dosya = kimlik YOK (kokpit düğmesi gizlenir, mesaj yanlış pencereye gitmez).
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AJAN_ADI = 'ops-pencere'

function dosyaYolu() {
  return process.env.VH_OPS_OTURUMU_DOSYASI || path.join(os.homedir(), '.claude', 'mod-durum', 'ops-oturumu.json')
}

/** Açık pencere kayıtları (Claude Code her interaktif oturum için `<pid>.json` yazar). Test: VENTHUB_SESSIONS_DIZINI. */
function oturumDizini() {
  return process.env.VENTHUB_SESSIONS_DIZINI || path.join(os.homedir(), '.claude', 'sessions')
}

/** Kayıtlı OPS oturum kimliği; yok/bozuk → ''. */
function oku(dosya = dosyaYolu()) {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    return j && typeof j.sid === 'string' && UUID.test(j.sid) ? j.sid.toLowerCase() : ''
  } catch {
    return ''
  }
}

/** Dosyanın ham içeriği (onceki alanı için); okunamazsa {}. */
function kayitOku(dosya = dosyaYolu()) {
  try {
    const j = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    return j && typeof j === 'object' && !Array.isArray(j) ? j : {}
  } catch {
    return {}
  }
}

/** Bu oturum kayıtlı OPS mi? Kayıt yoksa HAYIR (güvenli). */
function kimlikMi(sid, dosya = dosyaYolu()) {
  const k = oku(dosya)
  return Boolean(k) && String(sid || '').toLowerCase() === k
}

/** Pencere OPS adayı mı: kök `settings.local.json` agent = ops-pencere (ya da kancaya gelen agent_type). */
function opsAdayiMi({ cwd, agentType } = {}) {
  if (agentType === AJAN_ADI) return true
  try {
    let d = path.resolve(cwd || process.cwd())
    for (let i = 0; i < 6; i += 1) {
      const f = path.join(d, '.claude', 'settings.local.json')
      if (fs.existsSync(f)) {
        const j = JSON.parse(fs.readFileSync(f, 'utf8'))
        return Boolean(j) && j.agent === AJAN_ADI
      }
      const ust = path.dirname(d)
      if (ust === d) break
      d = ust
    }
  } catch {
    /* okunamadı: aday değil */
  }
  return false
}

/** Süreç yaşıyor mu? EPERM = var ama erişim yok → yaşıyor. */
function pidYasiyorMu(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return Boolean(e && e.code === 'EPERM')
  }
}

/** Pencere kayıt dizinindeki kayıtlar; dizin okunamazsa null (ölçülemedi). Bozuk kayıt atlanır. */
function pencereKayitlari(dizin = oturumDizini()) {
  let adlar
  try {
    adlar = fs.readdirSync(dizin)
  } catch {
    return null
  }
  const kayitlar = []
  for (const ad of adlar) {
    if (!ad.endsWith('.json')) continue
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dizin, ad), 'utf8'))
      if (j && typeof j.sessionId === 'string') kayitlar.push(j)
    } catch {
      /* bozuk kayıt atlanır */
    }
  }
  return kayitlar
}

/**
 * Bu kimlik CANLI mı? true: pencere kaydı var ve süreç yaşıyor (pid yoksa kaydın varlığı yeter); false: kayıt yok ya
 * da süreç ölü; null: ÖLÇÜLEMEDİ (kayıt dizini okunamadı) — çağıran eski kurala düşer, "ölü" varsaymaz.
 */
function canliMi(sid, { dizin, yasiyor = pidYasiyorMu } = {}) {
  const hedef = String(sid || '').toLowerCase()
  if (!UUID.test(hedef)) return false
  const kayitlar = pencereKayitlari(dizin)
  if (kayitlar === null) return null
  return kayitlar.some((k) => k.sessionId.toLowerCase() === hedef && (!Number.isInteger(k.pid) || yasiyor(k.pid)))
}

/** Oturum etkileşimli pencere mi? Yalnız kayıt VARSA ve `kind` interactive değilse false; bilinmiyorsa true (engelleme). */
function etkilesimliMi(sid, { dizin } = {}) {
  const hedef = String(sid || '').toLowerCase()
  const kayitlar = pencereKayitlari(dizin)
  if (!kayitlar) return true
  const k = kayitlar.find((x) => x.sessionId.toLowerCase() === hedef)
  return !k || typeof k.kind !== 'string' || k.kind === 'interactive'
}

/**
 * Yazma kararı (saf): mevcut kimlik, bu oturum, açılış kaynağı, kayıtlı kimliğin canlılığı (true/false/null-ya-da-yok)
 * → { yaz, sebep }.
 */
function yazmaKarari({ mevcut, sid, kaynak, mevcutCanli }) {
  if (!UUID.test(String(sid || ''))) return { yaz: false, sebep: 'gecersiz-sid' }
  if (!mevcut) return { yaz: true, sebep: 'kayit-yok' }
  if (mevcut === String(sid).toLowerCase()) return { yaz: true, sebep: 'ayni-sid' }
  if (mevcutCanli === false) return { yaz: true, sebep: 'kayitli-kimlik-olu' }
  if (mevcutCanli === true) return { yaz: false, sebep: 'kayitli-kimlik-canli' }
  // Canlılık ölçülemedi: ARC-99 kuralı (sıfırdan açılış devralır, resume/compact/clear yazmaz).
  if (kaynak === 'startup') return { yaz: true, sebep: 'yeni-pencere' }
  return { yaz: false, sebep: 'baska-kimlik-var-' + (kaynak || 'bilinmiyor') }
}

/**
 * Açılışta çağrılır: aday ve karar uygunsa yazar. Hata yutulur (açılışı bozmaz).
 * Dönüş: { yazildi, sebep, mevcut?, mevcutCanli? } — session-board "canlı başka kimlik var" uyarısını buradan basar.
 */
function acilistaYaz({ sid, kaynak, cwd, agentType, dosya = dosyaYolu(), simdi = Date.now(), oturumler, yasiyor } = {}) {
  try {
    if (!opsAdayiMi({ cwd, agentType })) return { yazildi: false, sebep: 'aday-degil' }
    if (!etkilesimliMi(sid, { dizin: oturumler })) return { yazildi: false, sebep: 'etkilesimli-degil' }
    const yeniSid = String(sid || '').toLowerCase()
    const kayit = kayitOku(dosya)
    const mevcut = oku(dosya)
    const mevcutCanli = mevcut && mevcut !== yeniSid ? canliMi(mevcut, { dizin: oturumler, yasiyor }) : undefined
    const k = yazmaKarari({ mevcut, sid, kaynak, mevcutCanli })
    if (!k.yaz) return { yazildi: false, sebep: k.sebep, mevcut, mevcutCanli }
    const govde = { sid: yeniSid, ts: simdi, kaynak: kaynak || '' }
    const onceki = mevcut && mevcut !== yeniSid ? mevcut : typeof kayit.onceki === 'string' ? kayit.onceki : ''
    if (UUID.test(onceki)) govde.onceki = onceki.toLowerCase()
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    fs.writeFileSync(dosya, JSON.stringify(govde) + '\n')
    return { yazildi: true, sebep: k.sebep, mevcut, mevcutCanli }
  } catch (e) {
    return { yazildi: false, sebep: 'hata-' + ((e && e.code) || 'bilinmiyor') }
  }
}

if (require.main === module) {
  const i = process.argv.indexOf('--yaz')
  if (i >= 0) {
    const sid = process.argv[i + 1]
    if (!UUID.test(String(sid || ''))) {
      process.stderr.write('kullanim: node scripts/board/ops-oturumu.cjs --yaz <oturum-kimligi (uuid)>\n')
      process.exit(2)
    }
    const dosya = dosyaYolu()
    const onceki = oku(dosya)
    const govde = { sid: sid.toLowerCase(), ts: Date.now(), kaynak: 'elle' }
    if (onceki && onceki !== govde.sid) govde.onceki = onceki
    fs.mkdirSync(path.dirname(dosya), { recursive: true })
    fs.writeFileSync(dosya, JSON.stringify(govde) + '\n')
    process.stdout.write('ops-oturumu yazildi: ' + govde.sid + '\n')
  } else {
    const k = oku()
    if (!k) {
      process.stdout.write('(kayit yok)\n')
    } else {
      const c = canliMi(k)
      process.stdout.write(k + ' (' + (c === true ? 'canli' : c === false ? 'OLU — acilista canli aday devralir' : 'canlilik olculemedi') + ')\n')
    }
  }
}

module.exports = {
  dosyaYolu,
  oturumDizini,
  oku,
  kimlikMi,
  opsAdayiMi,
  pidYasiyorMu,
  canliMi,
  etkilesimliMi,
  yazmaKarari,
  acilistaYaz,
  AJAN_ADI,
}
