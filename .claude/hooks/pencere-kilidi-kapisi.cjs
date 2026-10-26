#!/usr/bin/env node
'use strict'

/**
 * PreToolUse hook (matcher SendMessage) — PENCERE KİLİDİ KAPISI (ARC-212).
 *
 * NİÇİN: Recep "başka pencere açma" dediğinde bunu OPS `node scripts/board/pencere-kilidi.cjs --koy ARAC` ile yazar;
 * kural hafızada durunca OPS iki gün üst üste çiğnedi. Bu kanca kilidi gönderim anında okur: alıcı izinli değilse
 * mesaj GİTMEZ ve gönderene izinlilerin listesi döner. Kilit dosyası yoksa HİÇBİR ŞEY değişmez.
 *
 * KAPI SIKILAŞTIRIR, GEVŞETMEZ: yeni bir red yolu ekler; var olan hiçbir kapıya dokunmaz. Eşleme ve karar mantığı
 * scripts/board/pencere-kilidi.cjs'te (alıcı adı / UUID / local_ kimliği → departman; ayrıntı orada).
 *
 * FAIL-OPEN: stdin bozuk, araç SendMessage değil, `to` metin değil, kilit dosyası okunamıyor → mesaj gider. Tek istisna
 * sesli: kilit dosyası VAR ama BOZUKSA mesaj gider ve gönderene tek satır uyarı verilir (sessizce korumasız kalma).
 *
 * stdin: { tool_name, tool_input: { to, message }, cwd, agent_type, session_id }
 * Çıkış: DAİMA 0. Red: stdout'a { hookSpecificOutput: { hookEventName:'PreToolUse', permissionDecision:'deny',
 * permissionDecisionReason } }.
 */

const fs = require('fs')
const path = require('path')

function modul() {
  return require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-kilidi.cjs'))
}

function yaz(nesne) {
  try {
    fs.writeSync(1, JSON.stringify(nesne) + '\n')
  } catch {
    /* stdout kapalı: karar iletilemedi, mesaj yine gider */
  }
}

/** Göndericinin rolü: pencere ajanı (`arac-pencere`) → ARAC, yoksa oturum kimliğinden. Bilinmezse ''. */
function gonderenRoluBul(girdi, kilit) {
  try {
    const pk = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'pencere-kimligi.cjs'))
    const rol = pk.rolAdi(pk.agentAdi({ cwd: girdi.cwd, agentType: girdi.agent_type }))
    return rol || kilit.rolOturumdan(girdi.session_id) || ''
  } catch {
    return ''
  }
}

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return
  }
  if (!girdi || girdi.tool_name !== 'SendMessage') return
  const alici = girdi.tool_input && girdi.tool_input.to
  if (typeof alici !== 'string' || !alici.trim()) return

  const kilit = modul()
  const o = kilit.kilitOku()
  if (o.durum === 'yok') return
  if (o.durum === 'bozuk') {
    yaz({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: `PENCERE KİLİDİ dosyası var ama okunamıyor (${o.sebep}); kilit UYGULANMADI. Düzeltmek için: node scripts/board/pencere-kilidi.cjs --koy <ROL> ya da --kaldir.`,
      },
    })
    return
  }

  const sonuc = kilit.karar({ kilit: o.kilit, alici, gonderenRol: gonderenRoluBul(girdi, kilit) })
  if (sonuc.izin) return

  const koyulma = kilit.saatOnce(o.kilit.koyulma)
  const neden =
    `PENCERE KİLİDİ: Recep "başka pencere açma" dedi${koyulma ? ` (${koyulma} kondu)` : ''}. İzinli departmanlar: ${sonuc.izinliler.join(', ')}. ` +
    `"${alici}" gönderilmedi (${sonuc.sebep}). Mesaj gerekiyorsa önce Recep'ten izin al; kilidi yalnız Recep'in sözüyle ` +
    'node scripts/board/pencere-kilidi.cjs --kaldir ile kaldır.'
  yaz({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: neden } })
}

if (require.main === module) {
  try {
    calistir()
  } catch {
    // fail-open
  }
  process.exit(0)
}

module.exports = { calistir }
