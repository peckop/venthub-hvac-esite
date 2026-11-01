#!/usr/bin/env node
'use strict'

/**
 * PostToolUse hook (Edit|Write|MultiEdit) — DÜZENLEME ANI LİNT (ARC-214).
 *
 * Düzenlenen src/ dosyasına TEK DOSYA ESLint koşar; error varsa Claude'a geri döner. Kayıt `asyncRewake: true`
 * (Claude Code belgesi, code.claude.com/docs/en/hooks): kanca arka planda koşar, düzenlemeyi BEKLETMEZ (tek dosya
 * ESLint ~6-9 sn ölçüldü); çıkış kodu 2 + stderr hata listesi Claude'a sistem hatırlatması olarak ulaşır, çıkış 0 sessizdir.
 *
 * NE YAPMAZ: tam proje taraması, tip kontrolü, --fix (dosyayı değiştirmez), warning bildirmek. Bellek gerginliği
 * varken (BELLEK uyarısı) atlar. ESLint kurulu değilse ya da çıktı çözülemezse sessiz geçer (ölçemedim hata değildir).
 * Mantık: scripts/board/duzenleme-ani-lint.cjs. Tur sonu lint+tsc: verify-on-stop.cjs (bu kanca onu DEĞİŞTİRMEZ).
 *
 * stdin: { tool_name, tool_input: { file_path }, cwd }
 */

const fs = require('node:fs')
const path = require('node:path')

function calistir() {
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
  } catch {
    return 0
  }
  const dosya = girdi && girdi.tool_input && girdi.tool_input.file_path
  const kok = process.env.CLAUDE_PROJECT_DIR || (girdi && girdi.cwd) || process.cwd()
  const modul = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'duzenleme-ani-lint.cjs'))
  if (!modul.uygunMu(dosya, kok)) return 0
  if (modul.bellekGergin()) return 0
  const sonuc = modul.lintle(path.resolve(kok, dosya), kok)
  if (sonuc.durum !== 'hata') return 0
  const goreli = path.relative(kok, path.resolve(kok, dosya)).split(path.sep).join('/')
  try {
    fs.writeSync(2, modul.metin(goreli, sonuc.hatalar) + '\n')
  } catch {
    // stderr kapalı: hata iletilemedi
  }
  return 2
}

if (require.main === module) {
  let kod = 0
  try {
    kod = calistir()
  } catch {
    // fail-open
  }
  process.exit(kod)
}
