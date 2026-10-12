#!/usr/bin/env node
'use strict'
/**
 * KANBAN KANIT YOLU KAPISI — ARC-93. Kural: .claude/hooks/kanban-kanit-yolu-kapisi.md
 *
 * ── NİÇİN VAR ──
 *
 * @wrongstack/kanban `resolveProjectPath` (dist/index.js:6208) ilk satırda `path.isAbsolute(yol)` ise null döner;
 * proje kökünün İÇİNDEKİ mutlak yol bile reddedilir. Sonuç: file_exists kanıtı dosya diskte VARKEN
 * "File not found", file_matches "Path escapes the project root" verir (URN-104, KTL-19, HRT-50'de görüldü).
 * 1.0.36 ve 1.0.37 aynı satırı taşıyor; çözüm yükseltme değil, kanıtı EKLEME ANINDA doğru yola çevirmek.
 *
 * ── KARAR ──
 *
 * Matcher mcp__wrongstack-kanban__kanban_manage; action add_check/update_check; checkType file_exists ya da
 * file_matches. Yol mutlak (C:/..., /..., \\...), `~` ile başlayan ya da kökten çıkan (`..`) ise DENY ve
 * çalışan üç seçeneği söyler. Göreli yol, command/test/manual kontrolü ve başka her çağrı sessiz geçer.
 * file_matches'te yol checkNotes içindeki JSON'un `file` alanıdır; JSON okunamazsa karışmaz (doğrulayıcı
 * kendi hatasını verir).
 */
const path = require('path')

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const EYLEMLER = new Set(['add_check', 'update_check'])
const TIPLER = new Set(['file_exists', 'file_matches'])

/** Kanıt yolunun doğrulayıcıda çalışmama sebebi; çalışıyorsa null. */
function yolSorunu(ham) {
  const yol = String(ham || '').trim()
  if (!yol) return null
  if (/^[a-zA-Z]:([\\/]|$)/.test(yol) || yol.startsWith('/') || yol.startsWith('\\')) return 'mutlak yol'
  if (yol === '~' || yol.startsWith('~/') || yol.startsWith('~\\')) return 'ev dizini (~) genişletilmez'
  const duz = path.posix.normalize(yol.replace(/\\/g, '/'))
  if (duz === '..' || duz.startsWith('../')) return 'proje kökünün dışına çıkıyor (..)'
  return null
}

/** Kontrolün dosya yolu: file_exists'te checkNotes (yoksa checkDescription), file_matches'te JSON'daki file. */
function kanitYolu(girdi) {
  const govde = String(girdi.checkNotes || girdi.checkDescription || '').trim()
  if (girdi.checkType === 'file_exists') return govde
  try {
    const j = JSON.parse(govde)
    return j && typeof j.file === 'string' ? j.file : ''
  } catch {
    return ''
  }
}

/** hook girdisi → reddetme sebebi ya da null. */
function incele(hookGirdisi) {
  if (!hookGirdisi || hookGirdisi.tool_name !== ARAC) return null
  const g = hookGirdisi.tool_input || {}
  if (!EYLEMLER.has(g.action) || !TIPLER.has(g.checkType)) return null
  const yol = kanitYolu(g)
  const sorun = yolSorunu(yol)
  if (!sorun) return null
  return (
    g.checkType +
    ' kanıtı "' +
    yol +
    '" geçmez: ' +
    sorun +
    '. Kanban doğrulayıcısı mutlak yolu kök içinde olsa bile reddeder; dosya diskte VARKEN "File not found" ya da ' +
    '"Path escapes the project root" verir. Üç çalışan yol: (1) depo içindeki dosyayı repo-göreli yaz (docs/..., tmp/...); ' +
    '(2) dosya depo dışındaysa kanıt kopyasını depo içi tmp/ altına (gitignored) koy ve onu göster, ya da manual kontrol ' +
    'yaz ve karta ls -l çıktısını not düş; (3) PR/merge kanıtı için command tipinde gh api repos/peckop/venthub-hvac-esite/pulls/<N>/merge.'
  )
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(require('fs').readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  let sebep = null
  try {
    sebep = incele(girdi)
  } catch {
    // Kapı yüzünden iş durmaz: ayrıştırılamayan girdi sessiz geçer.
  }
  if (!sebep) process.exit(0)
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: '[kanban-kanit-yolu-kapisi] ' + sebep + ' (ARC-93)',
      },
    }),
  )
  process.exit(0)
}

module.exports = { incele, yolSorunu, kanitYolu }
if (require.main === module) main()
