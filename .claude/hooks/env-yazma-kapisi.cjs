#!/usr/bin/env node
'use strict'
/**
 * ENV YAZMA KAPISI — REC-410 S3 (sensitive-path-guard'ın Bash tarafı). Cetvel: izin-kapilari-standard.md §S3.
 *
 * ── NİÇİN VAR ──
 *
 * `sensitive-path-guard.cjs` `.env` ailesine Edit/Write'ı reddeder, ama yalnız o araçlara bağlı: Bash ile
 * `echo KEY=… >> .env.local` hiçbir kapıdan geçmiyordu. Kapı 2 (sır/anahtar yazma) Recep'te.
 *
 * ── ÖLÇÜM (09-28, bu makinedeki tüm kayıtlar) ──
 *
 * `.env` geçen 795 Bash komutunun 13'ü `.env` ailesine yazıyor. Çoğunluk zararsız: ana depodaki
 * `.env`/`.env.local`'ı bir worktree'ye AYNI ADLA kopyalamak (derleme için) ya da o kopyayı silmek.
 * Geri kalanı yeni içerik: başka projenin `.env`'ini üretmek, `~/.claude/.env.global`'a yazmak.
 *
 * ── KARAR ──
 *
 * Hedefi `.env` ailesi olan (`.env.example` hariç) her Bash yazması `ask`; iki istisna geçer:
 *   (a) `cp <kaynak>/.env[.x] <hedef>/.env[.x]` — kaynak ve hedef aynı ad, hedef ana depo DEĞİL
 *       (içerik zaten var olan dosyanın aynısı; yeni sır yazılmıyor);
 *   (b) `rm` — hedef ana depo DEĞİL (worktree kopyasının temizliği).
 * Ana depo = `git rev-parse --git-common-dir`'in üst dizini; çözülemezse her hedef ana depo sayılır.
 */
const path = require('path')
const { execFileSync } = require('child_process')

const ENV = /(^|[/\\])\.env(\.[^/\\\s]+)?$/
const envMi = (y) => ENV.test(String(y)) && !/\.example$/.test(String(y))

function anaDepo(cwd) {
  try {
    const ortak = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      windowsHide: true,
    }).trim()
    return path.dirname(ortak)
  } catch {
    return null
  }
}

const norm = (y) => path.resolve(String(y).replace(/^\/([a-zA-Z])\//, '$1:/')).replace(/\\/g, '/').toLowerCase()

/** Komutta sorulması gereken .env yazması varsa sebep, yoksa null. */
function incele(komut, cwd, ana, cikarici = require(path.join(__dirname, 'bash-write-targets.cjs'))) {
  const anaN = ana ? norm(ana) + '/' : null
  const anaDepoda = (y) => !anaN || norm(path.resolve(cwd, String(y).replace(/^\/([a-zA-Z])\//, '$1:/'))).startsWith(anaN)
  for (const parca of String(komut).split(/&&|\|\||;|\n|\|/)) {
    const r = cikarici.yazmaHedefleri(parca)
    const hedefler = (r.hedefler || []).filter(envMi)
    if (!hedefler.length) continue
    const kelimeler = parca.trim().split(/\s+/).map((k) => k.replace(/^["']|["']$/g, ''))
    const komutAdi = kelimeler[0]
    for (const h of hedefler) {
      if (anaDepoda(h)) return '.env ailesine yazma ANA DEPODA: ' + path.basename(String(h))
      if (komutAdi === 'rm') continue
      if (komutAdi === 'cp') {
        const argl = kelimeler.slice(1).filter((k) => !k.startsWith('-'))
        const kaynak = argl[argl.length - 2]
        if (kaynak && envMi(kaynak) && path.basename(kaynak) === path.basename(String(h))) continue
      }
      return '.env ailesine yeni icerik: ' + path.basename(String(h)) + ' (' + komutAdi + ')'
    }
  }
  return null
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(require('fs').readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0)
  }
  const komut = (girdi.tool_input || {}).command || ''
  if (girdi.tool_name !== 'Bash' || !/\.env/.test(komut)) process.exit(0)
  const cwd = girdi.cwd || process.cwd()
  let sebep
  try {
    sebep = incele(komut, cwd, anaDepo(cwd))
  } catch (e) {
    sebep = 'komut ayristirilamadi (' + ((e && e.message) || 'bilinmeyen') + ')'
  }
  if (!sebep) process.exit(0)
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: '[env-yazma-kapisi] ' + sebep + ' — sir dosyasi, Recep onayi gerekir (REC-410 S3).',
      },
    }),
  )
  process.exit(0)
}

module.exports = { incele, anaDepo, envMi }
if (require.main === module) main()
