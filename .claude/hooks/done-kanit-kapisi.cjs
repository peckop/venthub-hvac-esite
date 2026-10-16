#!/usr/bin/env node
'use strict'
/**
 * DONE KANIT KAPISI — ARC-150 (OPS 16 Ekim "B: önleme"). PreToolUse, matcher `mcp__wrongstack-kanban__kanban_manage`.
 *
 * ── NİÇİN VAR (ÖLÇÜLDÜ 16 Ekim) ──
 *
 * "Done yalnız kanıt komutuyla" kuralını araç YALNIZ yönetilen (managed) panoda zorlar. Yönetilmeyen panoda
 * `completionGate: strict` yazısı etkisizdir, `move_task` kanıtsız kartı Done'a alır
 * (docs/audits/skill-yonetilen-pano-deneyi-2026-10-01.md satır 10, 24, 52). Bugün 16 panodan yalnız YETENEK yönetilen;
 * öbür panolarda Done'a alınan kartların verify_completion `passed` raporu taşıma oranı: OPS 10/68, HARİTA 11/41,
 * URUN 29/56, ALTYAPI 43/66 (kopya veritabanı sayımı, 16 Ekim). Yönetilen moda geçmek 7 panoda mümkün değil
 * (arşivli kart `stage-mismatch` ile adopt'u reddeder, deneme panosunda ölçüldü) ve iş akışını (mark_assignment) değiştirir;
 * bu kanca AYNI kuralı pano ayarına dokunmadan, her panoda zorlar.
 *
 * ── NE YAPAR ──
 *
 * `move_task` / `transition_task` kartı Done'a (columnId, targetColumnId ya da lifecycleStage = done) taşıyacaksa,
 * kartın en son `verificationReport.verdict` değerini kanban veritabanından SALT-OKUMA okur; `passed` değilse DENY verir ve
 * yolu söyler: kanıt komutu ekle (add_check), verify_completion koştur, sonra taşı.
 *
 * ── NE YAPMAZ (fail-open) ──
 *
 * Veritabanı/kart okunamazsa, kart zaten Done'daysa, araç başka eylemse sessiz geçer. Muaf: `kanit-muaf` ya da
 * `karar-verildi` etiketli kart (kanıt komutu olmayan karar/kayıt kartları; etiketi OPS verir) ve "Linear Bekleyenler"
 * panosu (taşınan arşiv). Kanban'a YAZMAZ, kartı değiştirmez.
 *
 * VANA: `VENTHUB_DONE_KAPISI_KAPALI=1` kapıyı kapatır (acil durum ve test). `VENTHUB_KANBAN_DB` veritabanı yolunu ezer (test).
 * KURULUM: `.claude/settings.json` PreToolUse kaydı OPS'ta (ayarı OPS uygular); bu dosya tek başına etkisizdir.
 *
 * stdin: { tool_name, tool_input: { action, taskId, boardId, columnId|targetColumnId|lifecycleStage } }
 * Çıkış: DAİMA 0. Engel varsa stdout'a { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', ... } }.
 */
const fs = require('node:fs')
const path = require('node:path')

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const EYLEMLER = new Set(['move_task', 'transition_task'])
const MUAF_ETIKETLER = new Set(['kanit-muaf', 'karar-verildi'])
const MUAF_PANO = /^Linear Bekleyenler/i
const VANA = 'VENTHUB_DONE_KAPISI_KAPALI'

/** Bu çağrı bir kartı Done'a taşıyor mu? SAF. */
function doneIstegiMi(girdi) {
  if (!girdi || girdi.tool_name !== ARAC) return false
  const t = girdi.tool_input || {}
  if (!EYLEMLER.has(t.action)) return false
  if (typeof t.taskId !== 'string' || t.taskId === '') return false
  return [t.columnId, t.targetColumnId, t.lifecycleStage].some((v) => typeof v === 'string' && v.trim().toLowerCase() === 'done')
}

/**
 * Kart bilgisi → karar. SAF.
 * @param {null | {pano?: string, kolon?: string, verdict?: string|null, etiketler?: string[]}} kart
 * @returns {{izin: true, sebep: string} | {izin: false, sebep: string}}
 */
function karar(kart) {
  if (!kart) return { izin: true, sebep: 'kart-okunamadi' }
  if (String(kart.kolon || '').toLowerCase() === 'done') return { izin: true, sebep: 'zaten-done' }
  if (MUAF_PANO.test(String(kart.pano || ''))) return { izin: true, sebep: 'muaf-pano' }
  const etiketler = Array.isArray(kart.etiketler) ? kart.etiketler.map((e) => String(e).toLowerCase()) : []
  if (etiketler.some((e) => MUAF_ETIKETLER.has(e))) return { izin: true, sebep: 'muaf-etiket' }
  if (kart.verdict === 'passed') return { izin: true, sebep: 'verify-passed' }
  return { izin: false, sebep: kart.verdict ? 'verify-' + kart.verdict : 'verify-yok' }
}

/** Reddetme metni: neden ve çalışan yol. */
function redMetni(sebep) {
  const durum =
    sebep === 'verify-yok'
      ? 'bu kartta verify_completion raporu yok'
      : 'kartın son verify_completion raporu "' + sebep.replace('verify-', '') + '"'
  return (
    'DONE KANIT KAPISI (ARC-150): ' +
    durum +
    ', kart Done\'a taşınamaz. Yol: (1) add_check ile kanıt komutu ekle (checkType command/test/file_matches; PR için `gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge`), ' +
    '(2) verify_completion koştur ve rapor passed olsun, (3) kartı yeniden Done\'a taşı. Kanıt komutu olmayan karar/kayıt kartıysa OPS `kanit-muaf` etiketini verir. ' +
    'Kural: .claude/rules/filo-ortak.md "İş ve kart".'
  )
}

/** Veritabanı yolu: ortam ezmesi, yoksa kanonik (ana ağaç) kök. */
function veritabaniYolu(ortam = process.env, cwd = process.cwd()) {
  if (ortam.VENTHUB_KANBAN_DB) return ortam.VENTHUB_KANBAN_DB
  let kok = ortam.CLAUDE_PROJECT_DIR || cwd
  try {
    kok = require('../../tools/wrongstack-mcp/posta-kutusu.cjs').kanonikKok(kok)
  } catch {
    /* kanonik kök çözülemedi: verilen kök kalır */
  }
  return path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite')
}

/** Kartı veritabanından SALT-OKUMA oku; herhangi bir sorunda null (fail-open). */
function kartiOku(dbYolu, taskId) {
  let db
  try {
    if (!fs.existsSync(dbYolu)) return null
    // node:sqlite deneysel uyarısı kanca çıktısını kirletmesin
    process.removeAllListeners('warning')
    const { DatabaseSync } = require('node:sqlite')
    db = new DatabaseSync(dbYolu, { readOnly: true })
    const satir = db
      .prepare(
        "select json_extract(b.payload,'$.title') as pano, " +
          "json_extract(t.value,'$.columnId') as kolon, " +
          "json_extract(t.value,'$.verificationReport.verdict') as verdict, " +
          "json_extract(t.value,'$.labels') as etiketler " +
          'from kanban_boards b, json_each(b.payload, \'$.tasks\') t ' +
          "where json_extract(t.value,'$.id') = ? limit 1"
      )
      .get(taskId)
    if (!satir) return null
    let etiketler = []
    try {
      etiketler = JSON.parse(satir.etiketler || '[]')
    } catch {
      /* etiket okunamadı: boş */
    }
    return { pano: satir.pano, kolon: satir.kolon, verdict: satir.verdict, etiketler }
  } catch {
    return null
  } finally {
    try {
      db && db.close()
    } catch {
      /* kapanış hatası önemsiz */
    }
  }
}

function main() {
  if (process.env[VANA] === '1') return
  let ham = ''
  try {
    ham = fs.readFileSync(0, 'utf8')
  } catch {
    return
  }
  let girdi
  try {
    girdi = JSON.parse(ham)
  } catch {
    return
  }
  if (!doneIstegiMi(girdi)) return
  const k = karar(kartiOku(veritabaniYolu(), girdi.tool_input.taskId))
  if (k.izin) return
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: redMetni(k.sebep) },
    })
  )
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* kanca asla araç akışını bozmaz */
  }
  process.exit(0)
}

module.exports = { doneIstegiMi, karar, redMetni, veritabaniYolu, kartiOku, MUAF_ETIKETLER }
