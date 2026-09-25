#!/usr/bin/env node
'use strict'

/**
 * BELLEK YOKLAMASI — "3 GB üstü tek süreç" ve "boş bellek az" satırı (Ops emri 2026-09-25).
 *
 * ── NİÇİN VAR ──
 *
 * Recep: "bellek yüksek, gün ilerledikçe kasıyor." Ölçüm (2026-09-25 11:12Z): 31,8 GB'ın
 * 0,7 GB'ı boştu; iki süreç 7,3 GB tutuyordu. İkisi de Claude Code'un LSP aracının
 * (`typescript-lsp-win` eklentisi → typescript-language-server) açtığı tsserver'dı: biri bir
 * alt ajan worktree'sinde 3,5 GB, biri ALTYAPI'nın yan ağacında 3,6 GB. Aynı projenin tam tip
 * denetimi 730 MB kullanıyor (tsc --extendedDiagnostics) — yani 3,5 GB projenin ihtiyacı
 * değil, uzun oturumda biriken şişme. Kimse görmedi, çünkü hiçbir yüzey bunu göstermiyordu.
 *
 * ── NASIL ──
 *
 * Süreç listesi (komut satırıyla) Windows'ta ~1 sn sürer; `defter-tazelik-satiri` 300 ms
 * bütçeyle her turda koşar. Bu yüzden ölçüm burada YAPILMAZ: önbellek 10 dakikadan eskiyse
 * bu dosya kendini `--tazele` ile arka planda başlatır ve kanca önbelleği okur.
 *
 * ⛔windowsHide ZORUNLU: aynı gün Recep'in "cmd penceresi açılıp kapanıyor" şikâyeti ölçüldü;
 * arka planda konsol programı başlatan her kanca o pencereyi açar. Hem ayrık Node süreci hem
 * PowerShell çağrısı gizli başlatılır.
 *
 * ⭐EŞİKLİDİR (SAGE bloğu gibi): her şey yolundayken satır YOK. Konuştuğu üç hâl:
 *   · tek süreç ≥ 3 GB, · boş bellek < 2 GB, · önbellek 60 dakikadan eski (ölçüm düşüyor).
 * Windows dışında (CI) hiçbir şey yapmaz.
 */

const fs = require('fs')
const path = require('path')
const { spawn, execFileSync } = require('child_process')

const MB = 1024 * 1024
const ESIK_SUREC_MB = Number(process.env.VENTHUB_BELLEK_SUREC_MB || 3072)
const ESIK_BOS_MB = Number(process.env.VENTHUB_BELLEK_BOS_MB || 2048)
const TAZELE_DK = 10
const BAYAT_DK = 60

function onbellekYolu() {
  const pano = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
  return process.env.VENTHUB_BELLEK_ONBELLEK || path.join(pano, '.bellek-yoklama.json')
}

/** Komut satırından kısa, kimlik taşımayan ipucu: çalışma ağacı adı + betik adı. */
function ipucu(komut) {
  const k = String(komut || '').replace(/\\/g, '/')
  const agac = k.match(/(?:\/tmp\/|\/worktrees\/)([^/\s"]+)/i)
  const betik = k.match(/([A-Za-z0-9_.-]+\.(?:js|mjs|cjs))\b/)
  return [agac && agac[1], betik && betik[1]].filter(Boolean).join(' ')
}

/**
 * Süreç hâlâ yaşıyor mu? `process.kill(pid, 0)` sinyal GÖNDERMEZ, yalnız varlığı sorar (~0,4 ms,
 * alt süreç yok). EPERM = var ama yetkimiz yok → yaşıyor sayılır.
 */
function pidYasiyor(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return Boolean(e && e.code === 'EPERM')
  }
}

/**
 * Önbellekteki büyük süreçlerden ölmüş olan var mı? Varsa önbellek bayattır: boş bellek sayısı
 * da o süreç ölmeden önceki hâli gösterir.
 *
 * ⭐NİÇİN (2026-09-25, ilk gün): 58400 kapatıldıktan sonra üç pencere 10 dk boyunca aynı bayat
 * uyarıyı Ops'a ayrı ayrı bildirdi. Kapatılmış süreci göstermek, yanlış alarmdır.
 */
function oluVar(ob, yasiyor = pidYasiyor) {
  if (!ob || !Array.isArray(ob.surecler)) return false
  return ob.surecler.some((s) => s.mb >= ESIK_SUREC_MB && !yasiyor(s.pid))
}

/**
 * Önbellekten satır üretir; söyleyecek bir şey yoksa null. Büyük süreçlerden biri ölmüşse
 * satır SUSAR (önbellek bayat; kanca hemen yeniden ölçtürür).
 * @param {{ts:number,bosMb:number,surecler:Array<{pid:number,ad:string,mb:number,ipucu:string}>}|null} ob
 * @param {number} simdi
 * @param {(pid:number)=>boolean} [yasiyor]
 */
function satir(ob, simdi, yasiyor = pidYasiyor) {
  if (!ob || typeof ob.ts !== 'number') return null
  const yasDk = Math.round((simdi - ob.ts) / 60000)
  if (yasDk > BAYAT_DK) return '⚠BELLEK: OLCULEMEDI (onbellek ' + yasDk + ' dk bayat — arka plan olcumu dusuyor)'
  if (oluVar(ob, yasiyor)) return null
  const buyukler = (ob.surecler || []).filter((s) => s.mb >= ESIK_SUREC_MB)
  const bosAz = typeof ob.bosMb === 'number' && ob.bosMb < ESIK_BOS_MB
  if (!buyukler.length && !bosAz) return null
  const gb = (mb) => (mb / 1024).toFixed(1).replace('.', ',')
  const parca = ['bos ' + gb(ob.bosMb) + ' GB']
  if (buyukler.length) {
    parca.push(
      gb(ESIK_SUREC_MB) + ' GB ustu: ' + buyukler.map((s) => s.ad + ' ' + s.pid + ' ' + gb(s.mb) + ' GB' + (s.ipucu ? ' (' + s.ipucu + ')' : '')).join(', '),
    )
  }
  return '⚠BELLEK: ' + parca.join(' · ') + ' (' + yasDk + ' dk once olculdu)'
}

function oku() {
  try {
    return JSON.parse(fs.readFileSync(onbellekYolu(), 'utf8'))
  } catch {
    return null
  }
}

/**
 * Önbellek eskiyse ya da gösterdiği büyük süreç ölmüşse ölçümü arka planda, pencere açmadan
 * başlatır. Kilit: 2 dk.
 */
function gerekirseTazele(simdi) {
  if (process.platform !== 'win32') return
  const ob = oku()
  if (ob && simdi - ob.ts < TAZELE_DK * 60000 && !oluVar(ob)) return
  const kilit = onbellekYolu() + '.kilit'
  try {
    if (simdi - fs.statSync(kilit).mtimeMs < 2 * 60000) return
  } catch {
    /* kilit yok */
  }
  try {
    fs.mkdirSync(path.dirname(kilit), { recursive: true })
    fs.writeFileSync(kilit, String(simdi))
    spawn(process.execPath, [__filename, '--tazele'], { detached: true, stdio: 'ignore', windowsHide: true }).unref()
  } catch {
    /* başlatılamadı: 60 dk sonra satır OLCULEMEDI der */
  }
}

/** Ölçüm: en büyük 8 süreç + boş bellek. Yalnız `--tazele` ile, arka planda koşar. */
function tazele() {
  const ps =
    '$ErrorActionPreference="Stop";' +
    '$o=Get-CimInstance Win32_OperatingSystem;' +
    '$p=Get-CimInstance Win32_Process | Sort-Object WorkingSetSize -Descending | Select-Object -First 8 ProcessId,Name,WorkingSetSize,CommandLine;' +
    '@{bos=[int64]$o.FreePhysicalMemory*1024;p=@($p)} | ConvertTo-Json -Depth 3 -Compress'
  const cikti = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 30000,
  })
  const v = JSON.parse(cikti)
  const ob = {
    ts: Date.now(),
    bosMb: Math.round(Number(v.bos) / MB),
    surecler: (v.p || []).map((s) => ({
      pid: s.ProcessId,
      ad: String(s.Name || '').replace(/\.exe$/i, ''),
      mb: Math.round(Number(s.WorkingSetSize) / MB),
      ipucu: ipucu(s.CommandLine),
    })),
  }
  fs.mkdirSync(path.dirname(onbellekYolu()), { recursive: true })
  fs.writeFileSync(onbellekYolu(), JSON.stringify(ob))
}

if (require.main === module && process.argv.includes('--tazele')) {
  try {
    tazele()
  } catch {
    /* ölçülemedi: önbellek eskir, satır bunu söyler */
  }
  try {
    fs.unlinkSync(onbellekYolu() + '.kilit')
  } catch {
    /* kilit yoksa sorun değil */
  }
}

module.exports = { satir, ipucu, oku, oluVar, pidYasiyor, gerekirseTazele, ESIK_SUREC_MB, ESIK_BOS_MB }
