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
 * Deneme: echo '{"model":{"display_name":"Opus"},"context_window":{"used_percentage":63},"workspace":{"current_dir":"/x"}}' | node .claude/statusline.cjs
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
const pctRaw = typeof cw.used_percentage === 'number' ? cw.used_percentage : null
const pct = pctRaw === null ? null : Math.max(0, Math.min(100, Math.round(pctRaw)))
const size = cw.context_window_size ? Math.round(cw.context_window_size / 1000) + 'k' : ''
const model = (d.model && (d.model.display_name || d.model.id)) || '?'
const effort = d.effort && d.effort.level ? ' · ' + d.effort.level : ''

// Renk eşikleri: <60 yeşil · 60-79 sarı · ≥80 kırmızı (precompact kapısı ~%90'da devreye girer)
const C = { g: '\x1b[32m', y: '\x1b[33m', r: '\x1b[31m', dim: '\x1b[2m', off: '\x1b[0m' }
let bar = C.dim + '░░░░░░░░░░ bağlam ?' + C.off
if (pct !== null) {
  const filled = Math.round(pct / 10)
  const color = pct >= 80 ? C.r : pct >= 60 ? C.y : C.g
  bar = color + '█'.repeat(filled) + '░'.repeat(10 - filled) + ' ' + pct + '%' + C.off + (size ? C.dim + '/' + size + C.off : '')
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
