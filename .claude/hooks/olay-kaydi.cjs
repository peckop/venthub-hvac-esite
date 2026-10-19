#!/usr/bin/env node
'use strict'
/**
 * OLAY KAYDI — ARC-191 (OPS-176 kıyası, OPS 19 Ekim). Kanca olayları: PermissionDenied, StopFailure, SubagentStop, TaskCompleted.
 *
 * NE YAPAR: dört olayın her biri için pano dizininde `olay-kaydi.jsonl` dosyasına TEK JSON satırı ekler:
 *   { t, olay, oturum (ilk 8), ...olaya özgü alanlar }.
 *   - PermissionDenied: tool_name, mcp_server, reason (araç GİRDİSİ yazılmaz; komut/anahtar sızmasın).
 *   - StopFailure: error, error_details, last_assistant_message (API hata metni).
 *   - SubagentStop: agent_id, agent_type, stop_hook_active, last_assistant_message.
 *   - TaskCompleted: task_id, task_subject, teammate_name, agent_id.
 * Amaç: "ret edilen izin, durdurulan oturum (rate_limit/overloaded/...), biten alt ajan, tamamlanan görev" sorularını tahminle değil
 * kayıtla cevaplamak. Metin alanları satır sonu ayrılmış, 300 karaktere kesilmiş ve sır desenlerinden geçirilmiştir.
 *
 * NE YAPMAZ (belge: code.claude.com/docs/en/hooks, 19 Ekim ölçümü): engellemez. stdout'a JSON yazmaz (SubagentStop'ta decision,
 * PermissionDenied'da retry yok), TaskCompleted'ta exit 2 kullanmaz; çıkış HEP 0. Bozuk/boş girdide ve yazma hatasında sessiz geçer.
 * Kaydı OKUMAZ (yalnız ekler). Dosya 512 KB'ı geçerse `.1` yedeğine döner (tek nesil).
 *
 * KURULUM: `.claude/settings.json` içinde dört olay için kayıt (matcher yok; TaskCompleted zaten matcher desteklemez).
 * VANA: `VENTHUB_OLAY_KAYDI_KAPALI=1`. Pano dizini: `VENTHUB_BOARD_DIR` (talimat-yuklendi-gunlugu ile aynı kural).
 * Belgede OLMAYAN: dört olayın -p/SDK/arka plan davranışı ve çıkış sürümü; kayıt yoksa bu kancanın tetiklenmediği anlamına gelmez.
 */
const fs = require('node:fs')
const path = require('node:path')

const GUNLUK_ADI = 'olay-kaydi.jsonl'
const TAVAN_BAYT = 512 * 1024
const OLAYLAR = ['PermissionDenied', 'StopFailure', 'SubagentStop', 'TaskCompleted']

// Kayda sır yazmamak için (izin-istegi-kapisi GIZLI_DESENLER ile aynı aile; bu kanca ona bağımlı değil).
const GIZLI_DESENLER = [
  /gh[pousr]_[A-Za-z0-9]{20,}/g,
  /sk-[A-Za-z0-9_-]{16,}/g,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
  /AKIA[0-9A-Z]{16}/g,
  /xox[abprs]-[A-Za-z0-9-]{10,}/g,
  /(?:token|key|secret|password|passwd|pwd)=[^\s&"']+/gi,
  /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{6,}/gi,
  /\b(?:authorization|x-api-key|cookie|x-auth-token)\s*[:=]\s*[^\n"']+/gi,
  /\/\/[^/\s:@]+:[^/\s@]+@/g,
]
const gizle = (m) => GIZLI_DESENLER.reduce((s, d) => s.replace(d, '[GIZLI]'), String(m))

/** Metin alanı: boşsa null; satır sonu/sekme boşluk; sır maskesi; 300 karakter. */
function temiz(v) {
  if (v === undefined || v === null || v === '') return null
  return gizle(String(v).replace(/[\r\n\t]+/g, ' ')).slice(0, 300)
}

/** SAF: stdin metni → kayıt nesnesi (olay tanınmazsa ya da girdi bozuksa null). */
function kayitUret(ham, simdi = new Date()) {
  let g
  try {
    g = JSON.parse(String(ham || ''))
  } catch {
    return null
  }
  if (!g || typeof g !== 'object') return null
  const olay = g.hook_event_name
  if (!OLAYLAR.includes(olay)) return null
  const k = { t: simdi.toISOString(), olay, oturum: String(g.session_id || '-').slice(0, 8) }
  const ekle = (ad, deger) => {
    const t = temiz(deger)
    if (t !== null) k[ad] = t
  }
  if (olay === 'PermissionDenied') {
    ekle('tool_name', g.tool_name)
    ekle('mcp_server', g.mcp_server)
    ekle('reason', g.reason)
  } else if (olay === 'StopFailure') {
    ekle('error', g.error)
    ekle('error_details', g.error_details)
    ekle('last_assistant_message', g.last_assistant_message)
  } else if (olay === 'SubagentStop') {
    ekle('agent_id', g.agent_id)
    ekle('agent_type', g.agent_type)
    if (typeof g.stop_hook_active === 'boolean') k.stop_hook_active = g.stop_hook_active
    ekle('last_assistant_message', g.last_assistant_message)
  } else {
    ekle('task_id', g.task_id)
    ekle('task_subject', g.task_subject)
    ekle('teammate_name', g.teammate_name)
    ekle('agent_id', g.agent_id)
  }
  return k
}

/** Kayda ekler; tavan aşıldıysa `.1`e döndürür. Hata fırlatmaz. */
function gunlugeYaz(kayit, pano) {
  try {
    fs.mkdirSync(pano, { recursive: true })
    const yol = path.join(pano, GUNLUK_ADI)
    try {
      if (fs.statSync(yol).size > TAVAN_BAYT) fs.renameSync(yol, yol + '.1')
    } catch {
      /* günlük henüz yok: sorun değil */
    }
    fs.appendFileSync(yol, JSON.stringify(kayit) + '\n', 'utf8')
  } catch {
    /* yazılamıyorsa da kanca bloklanmaz */
  }
}

function panoDizini() {
  const defter = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-enjeksiyon-defteri.cjs'))
  return defter.panoDizini()
}

function main() {
  if (process.env.VENTHUB_OLAY_KAYDI_KAPALI === '1') return
  let ham = ''
  try {
    ham = fs.readFileSync(0, 'utf8')
  } catch {
    return
  }
  const kayit = kayitUret(ham)
  if (!kayit) return
  gunlugeYaz(kayit, panoDizini())
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* kanca asla oturumu bozmaz */
  }
  process.exit(0)
}

module.exports = { kayitUret, gunlugeYaz, GUNLUK_ADI, TAVAN_BAYT, OLAYLAR }
