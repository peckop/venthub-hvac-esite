#!/usr/bin/env node
/**
 * statusline.cjs — bağlam penceresi doluluk çubuğu (Recep kararı 2026-09-08, "headroom" fikri).
 *
 * KAYNAK: henchmarketing-rgb/headroom (MIT) fikri — "compact seni yakalamadan doluluğu gör".
 * ALINAN: yalnız fikir (çubuk + yüzde + eşik renkleri).
 * BİZDEN: uygulamanın tamamı. headroom oturum JSONL'ini PostToolUse hook'uyla ayrıştırır;
 *   Claude Code statusline artık `context_window.used_percentage`'ı stdin JSON'da doğrudan
 *   veriyor (code.claude.com/docs/en/statusline, 2026-09-08 okundu) — ek hook ve Python gereksiz.
 *   Node seçildi: Windows'ta jq yok, node zaten var.
 *
 * Niçin: şerit disiplini compact'a dayanır (damga + kalıcı imleç). Compact'ın NE ZAMAN geleceği
 * görünmüyordu; precompact-durum-kapisi son anda yakalıyor. Bu çubuk erken uyarıdır.
 *
 * Ayar (.claude/settings.json): "statusLine": { "type": "command", "command": "node .claude/statusline.cjs" }
 * Deneme: echo '{"model":{"display_name":"Opus"},"context_window":{"used_percentage":18,"context_window_size":1000000},"workspace":{"current_dir":"/x"}}' | node .claude/statusline.cjs
 *   (250k pencerede → "180k/250k" sarı)
 */
'use strict'
const fs = require('fs')
const { execSync } = require('child_process')

let d = {}
try {
  d = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
} catch {
  d = {}
}
const cw = d.context_window || {}
const model = (d.model && (d.model.display_name || d.model.id)) || '?'
const effort = d.effort && d.effort.level ? ' · ' + d.effort.level : ''

// Karar 140 (2026-09-27): compact eşiği `autoCompactWindow` ile ~250k'ya indirildi. used_percentage
// HER ZAMAN modelin tam penceresine (1M) göre ölçülür (code.claude.com/docs/en/env-vars,
// CLAUDE_CODE_AUTO_COMPACT_WINDOW satırı) — eşik düşünce eski %60/%80 renkleri hiç yanmaz.
// Bu yüzden çubuk kullanılan TOKEN'ı compact penceresine göre gösterir.
// Pencere önceliği belgedeki gibi: ortam değişkeni > proje/kullanıcı ayarı > model penceresi.
function compactPenceresi(modelPenceresi) {
  const env = parseInt(process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '', 10)
  if (env > 0) return Math.min(env, modelPenceresi || env)
  const path = require('path')
  const yerler = [
    path.join(process.cwd(), '.claude', 'settings.local.json'),
    path.join(process.cwd(), '.claude', 'settings.json'),
    path.join(require('os').homedir(), '.claude', 'settings.json'),
  ]
  for (const y of yerler) {
    try {
      const v = JSON.parse(fs.readFileSync(y, 'utf8')).autoCompactWindow
      if (typeof v === 'number' && v > 0) return Math.min(v, modelPenceresi || v)
    } catch {
      // dosya yok ya da okunamadı → sıradakine bak
    }
  }
  return modelPenceresi || null
}

const u = cw.current_usage
const tokens = u
  ? (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0)
  : typeof cw.used_percentage === 'number' && cw.context_window_size
    ? Math.round((cw.used_percentage / 100) * cw.context_window_size)
    : null
const pencere = compactPenceresi(cw.context_window_size || 0)

// Renk eşikleri compact penceresine oranla: <%60 yeşil · %60-79 sarı · ≥%80 kırmızı
// (250k pencerede: sarı 150k, kırmızı 200k — Recep onayı 2026-09-27)
const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', dim: '\x1b[2m', off: '\x1b[0m' }
let bar = C.dim + '░░░░░░░░░░ bağlam ?' + C.off
if (tokens !== null && pencere) {
  const pct = Math.max(0, Math.min(100, Math.round((tokens / pencere) * 100)))
  const filled = Math.round(pct / 10)
  const color = pct >= 80 ? C.r : pct >= 60 ? C.y : C.g
  const k = (n) => Math.round(n / 1000) + 'k'
  bar = color + '█'.repeat(filled) + '░'.repeat(10 - filled) + ' ' + k(tokens) + C.off + C.dim + '/' + k(pencere) + C.off
}

let branch = ''
try {
  branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'], timeout: 800 })
    .toString()
    .trim()
} catch {
  branch = ''
}

const five = d.rate_limits && d.rate_limits.five_hour && typeof d.rate_limits.five_hour.used_percentage === 'number'
  ? ' · 5s ' + Math.round(d.rate_limits.five_hour.used_percentage) + '%'
  : ''
const week = d.rate_limits && d.rate_limits.seven_day && typeof d.rate_limits.seven_day.used_percentage === 'number'
  ? ' · 7g ' + Math.round(d.rate_limits.seven_day.used_percentage) + '%'
  : ''

process.stdout.write(`${bar}  ${C.dim}[${model}${effort}]${branch ? ' ' + branch : ''}${five}${week}${C.off}\n`)
