#!/usr/bin/env node
'use strict'
/**
 * silme-baglanti-kapisi — PreToolUse (Bash) bekçisi (karar 88, 2026-09-23).
 *
 * NİÇİN: 09-23'te `git worktree remove` bir worktree'yi silerken içindeki `node_modules` JUNCTION'ından geçti ve
 * ANA DEPONUN node_modules'unu (.bin + paket içerikleri) silmeye başladı; iki pencere 15 dk derleyemedi/test koşamadı.
 * Kural "rm -rf yasak" KOMUT ADINI yasaklıyordu, ETKİYİ değil: başka adlı özyinelemeli silme kuralın yanından geçti.
 * Bu kapı etkiye bakar: özyinelemeli silinecek klasörün içinde, KLASÖRÜN DIŞINI gösteren bir bağlantı
 * (junction / symlink) varsa komut ÇALIŞMADAN durur ve güvenli yol söylenir.
 *
 * Kapsanan silme biçimleri: `git [-C x] worktree remove <yol>`, `rm -r/-R/-rf <yol>`, `rmdir|rd /s <yol>`,
 * `Remove-Item … -Recurse <yol>`. Serbest: bağlantının KENDİSİNİ kaldıran özyinelemesiz `rmdir <bağlantı>`.
 * Klasör İÇİNDE kalan bağlantılar (pnpm'in node_modules → .pnpm bağları) tehlike değildir; hedef silinen kökün içindedir.
 *
 * Sözleşme: stdin hook JSON'u; karar yoksa hiçbir şey basmaz (= izin). Bozuk girdi → fail-OPEN ama stderr'e yazar.
 * Tarama sınırı: derinlik 3, en çok 60 000 girdi; aşılırsa DURDURUR (bilinmeyen = güvenli değil).
 */
const fs = require('node:fs')
const path = require('node:path')

const DERINLIK = 3
const SINIR = 60000

/** Saf: kabuk komutunu parçalar ve özyinelemeli silme hedeflerini döndürür → [{ yol, bicim }]. */
function silmeHedefleri(komut) {
  const hedefler = []
  const parcalar = String(komut).split(/&&|\|\||;|\n|\|/)
  for (const ham of parcalar) {
    const t = belirtecler(ham.trim())
    if (!t.length) continue
    // cmd //c "rmdir /s …" ve powershell -Command "Remove-Item …" iç içe komutları aç
    const ic = t.findIndex((x) => /^(\/\/c|\/c|-Command|-c)$/i.test(x))
    if (ic !== -1 && /^(cmd(\.exe)?|powershell(\.exe)?|pwsh(\.exe)?|bash|sh)$/i.test(path.basename(t[0]))) {
      hedefler.push(...silmeHedefleri(t.slice(ic + 1).join(' ')))
      continue
    }
    const ad = path.basename(t[0]).toLowerCase()
    if (ad === 'git') {
      const i = t.indexOf('worktree')
      if (i !== -1 && t[i + 1] === 'remove') {
        for (const a of t.slice(i + 2)) if (!a.startsWith('-')) hedefler.push({ yol: a, bicim: 'git worktree remove' })
      }
    } else if (ad === 'rm') {
      const bayrak = t.slice(1).filter((a) => a.startsWith('-')).join('')
      if (/r|R|--recursive/.test(bayrak)) for (const a of t.slice(1)) if (!a.startsWith('-')) hedefler.push({ yol: a, bicim: 'rm -r' })
    } else if (ad === 'rmdir' || ad === 'rd') {
      if (t.slice(1).some((a) => /^\/s$/i.test(a))) for (const a of t.slice(1)) if (!a.startsWith('/')) hedefler.push({ yol: a, bicim: 'rmdir /s' })
    } else if (/^remove-item$/i.test(ad) || /^(ri|del)$/i.test(ad)) {
      if (t.some((a) => /^-rec/i.test(a))) {
        for (let k = 1; k < t.length; k++) {
          const a = t[k]
          if (/^-(path|literalpath)$/i.test(a)) { hedefler.push({ yol: t[++k], bicim: 'Remove-Item -Recurse' }); continue }
          if (!a.startsWith('-')) hedefler.push({ yol: a, bicim: 'Remove-Item -Recurse' })
        }
      }
    }
  }
  return hedefler.filter((h) => h.yol)
}

function belirtecler(s) {
  const out = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

/** Git Bash yolunu (/c/tmp/x) Windows yoluna çevirir; göreli yolu cwd'ye göre çözer. */
function yolCoz(yol, cwd) {
  let y = String(yol).replace(/^~(?=\/|\\|$)/, process.env.USERPROFILE || process.env.HOME || '~')
  const m = y.match(/^\/([a-zA-Z])(\/.*)?$/)
  if (m) y = `${m[1].toUpperCase()}:${m[2] || '/'}`
  return path.resolve(cwd || process.cwd(), y)
}

const icinde = (hedef, kok) => {
  const g = path.relative(kok, hedef)
  return g === '' || (!g.startsWith('..') && !path.isAbsolute(g))
}

/** Saf-ish: kökün altında KÖKÜN DIŞINI gösteren bağlantıları bulur. */
function disBaglantilar(kok) {
  const bulunan = []
  let sayac = 0
  let asildi = false
  const gerKok = (() => { try { return fs.realpathSync.native(kok) } catch { return kok } })()
  const dolas = (dizin, derinlik) => {
    if (asildi) return
    let girdiler
    try { girdiler = fs.readdirSync(dizin, { withFileTypes: true }) } catch { return }
    for (const g of girdiler) {
      if (++sayac > SINIR) { asildi = true; return }
      const tam = path.join(dizin, g.name)
      let st
      try { st = fs.lstatSync(tam) } catch { continue }
      if (st.isSymbolicLink()) {
        let hedef
        try { hedef = fs.realpathSync.native(tam) } catch { hedef = null }
        if (hedef && !icinde(hedef, gerKok)) bulunan.push({ baglanti: tam, hedef })
        continue
      }
      if (st.isDirectory() && derinlik < DERINLIK && g.name !== '.git') dolas(tam, derinlik + 1)
    }
  }
  dolas(kok, 1)
  return { bulunan, asildi }
}

function karar(sebep) {
  console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: sebep } }))
  process.exit(0)
}

function main() {
  let raw = ''
  try { raw = fs.readFileSync(0, 'utf8') } catch { /* stdin yok */ }
  if (!raw.trim()) { process.stderr.write('[silme-baglanti-kapisi] stdin bos, karisilmadi\n'); return }
  let girdi
  try { girdi = JSON.parse(raw) } catch { process.stderr.write('[silme-baglanti-kapisi] stdin bozuk JSON, karisilmadi\n'); return }
  const komut = girdi.tool_input && girdi.tool_input.command
  if (!komut) return
  for (const h of silmeHedefleri(komut)) {
    const kok = yolCoz(h.yol, girdi.cwd)
    let st
    try { st = fs.lstatSync(kok) } catch { continue } // yok → silinecek bir şey yok
    if (st.isSymbolicLink()) {
      karar(`[silme-baglanti-kapisi] "${h.yol}" bir BAĞLANTI (junction/symlink) ve ${h.bicim} ile özyinelemeli siliniyor → hedefinin içeriği silinebilir. ` +
        `Yalnız bağlantıyı kaldır: cmd //c "rmdir ${kok}" (/s OLMADAN), sonra hedefin sağlam olduğunu doğrula. (karar 88, 09-23 olayı)`)
    }
    if (!st.isDirectory()) continue
    const { bulunan, asildi } = disBaglantilar(kok)
    if (bulunan.length) {
      const liste = bulunan.slice(0, 5).map((b) => `${b.baglanti} → ${b.hedef}`).join('; ')
      karar(`[silme-baglanti-kapisi] ${h.bicim} "${h.yol}" DURDURULDU: içinde klasörün DIŞINI gösteren ${bulunan.length} bağlantı var (${liste}). ` +
        `Silme bu bağlantılardan geçip hedefleri silebilir (09-23: ana deponun node_modules'u böyle silindi). ` +
        `Önce her bağlantıyı yalnız kendisini kaldırarak sök: cmd //c "rmdir <bağlantı>" (/s OLMADAN), hedefin sağlam olduğunu doğrula, sonra silmeyi tekrarla. (karar 88)`)
    }
    if (asildi) {
      karar(`[silme-baglanti-kapisi] ${h.bicim} "${h.yol}" DURDURULDU: klasör ${SINIR} girdiden büyük, dışa giden bağlantı taraması tamamlanamadı. ` +
        `Bilinmeyen = güvenli değil. Bağlantıları elle ölç: find "${h.yol}" -maxdepth 3 -type l, sonra alt klasörleri parça parça sil.`)
    }
  }
}

if (require.main === module) main()

module.exports = { silmeHedefleri, disBaglantilar, yolCoz }
