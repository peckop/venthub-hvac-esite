#!/usr/bin/env node
'use strict'
/**
 * WRONGSTACK SAĞLIK / SÜRÜM OKUMA (ARC-94, OPS emri 12 Ekim: "daemon'lar durdurulur, SONRA health'te sürüm okunur").
 *
 * ⭐NİÇİN VAR: yükseltmeden sonra "paket dosyaları 1.1.0" demek "koşan süreç 1.1.0" demek değildir. Arka plan
 * süreci (`project-server.js`) pencere kapanınca da yaşar ve eski kodu bellekte tutar; farklı sürümlü istemci
 * hayattaki eski daemon'a BAĞLANMAZ, kendi daemon'unu doğurur (12 Ekim provasında ölçüldü: eski sunucu açıkken
 * daemon 1, yeni istemci eklenince 2). Bu betik iki şeyi birlikte ölçer:
 *   1. her MCP sunucusu `initialize` cevabında hangi sürümü söylüyor (gerçekten açılıp konuşturulur);
 *   2. makinede koşan her `project-server.js` hangi sürümün paket klasöründen koşuyor (komut satırından).
 * Kurulu sürümden farklı bir daemon ya da sunucu varsa `HATA` (çıkış 1); aksi hâlde `HAZIR` (çıkış 0).
 *
 *   node tools/wrongstack-mcp/saglik.cjs            → yalnız daemon taraması (sunucu AÇMAZ; hiçbir yan etkisi yok)
 *   node tools/wrongstack-mcp/saglik.cjs --sunucu   → daemon + her sunucuyu açıp initialize sürümünü oku
 *                                                     (YALNIZ ana ağaçta; yükseltme bittikten sonra, bkz. anaAgacMi)
 *
 * Sunucular `--writable` OLMADAN açılır, hiçbir araç çağrılmaz (yalnız initialize + tools/list), hiçbir süreç
 * sonlandırılmaz. Yine de sunucu açmak canlı kökte bir daemon doğurabilir ve yeni sürüm şemayı göç ettirir:
 * bu yüzden varsayılan KAPALI. Daemon durdurma `kurulum.cjs`'in işidir.
 */
const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const { surecleriOku } = require('./kurulum.cjs')

const ARAC = __dirname
const KOK = path.resolve(ARAC, '..', '..')
const SUNUCULAR = ['sage-mcp', 'kanban-mcp', 'mailbox-mcp', 'codebase-index-mcp']

function paketSurumu(klasor) {
  try {
    return JSON.parse(fs.readFileSync(path.join(klasor, 'package.json'), 'utf8')).version || null
  } catch {
    return null
  }
}

/** `...\@wrongstack\<paket>\...\project-server.js` komut satırından paket klasörü ve adı. */
function daemonPaketi(komut) {
  const k = String(komut || '').replace(/\\/g, '/')
  if (!/project-server\.js/.test(k)) return null
  const m = k.match(/([^"\s]*\/@wrongstack\/([a-z0-9-]+))\//i)
  if (!m) return null
  const kok = k.match(/--project-(?:root|dir)\s+("[^"]+"|\S+)/)
  return { klasor: m[1], paket: m[2], kok: kok ? kok[1].replace(/"/g, '') : null }
}

/**
 * Koşan daemon'ların sürümü. `beklenen(paket)` bu ağaçta kurulu sürümü verir; `okuSurum(klasor)` daemon'un
 * çalıştığı paket klasörünün sürümünü. Sürümü okunamayan daemon ESKİ sayılır (fail-closed).
 * @param {{pid:number, komut:string}[]} surecler
 */
function daemonSurumleri(surecler, beklenen, okuSurum = paketSurumu) {
  const sonuc = []
  for (const s of surecler) {
    const d = daemonPaketi(s.komut)
    if (!d) continue
    const surum = okuSurum(d.klasor)
    const bek = beklenen(d.paket)
    sonuc.push({
      pid: s.pid,
      paket: d.paket,
      kok: d.kok,
      klasor: d.klasor,
      surum,
      beklenen: bek,
      eski: !(surum && bek && surum === bek),
    })
  }
  return sonuc
}

/** Bir MCP sunucusunu salt-okuma açar; initialize.serverInfo.version ve araç sayısını döndürür. */
function sunucuSurumu(cli, kok, zamanAsimi = 30000) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [cli, '--project-root', kok, '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    })
    let tampon = ''
    let bitti = false
    const bekleyen = new Map()
    const bitir = (v) => {
      if (bitti) return
      bitti = true
      clearTimeout(t)
      try {
        p.kill()
      } catch {
        /* süreç zaten kapandı */
      }
      resolve(v)
    }
    const t = setTimeout(() => bitir({ hata: 'zaman asimi ' + zamanAsimi + ' ms' }), zamanAsimi)
    p.on('exit', () => bitir({ hata: 'sunucu beklenmedik kapandi' }))
    p.stdout.on('data', (d) => {
      tampon += d.toString('utf8')
      let i
      while ((i = tampon.indexOf('\n')) >= 0) {
        const satir = tampon.slice(0, i).trim()
        tampon = tampon.slice(i + 1)
        if (!satir) continue
        try {
          const m = JSON.parse(satir)
          if (m.id !== undefined && bekleyen.has(m.id)) bekleyen.get(m.id)(m)
        } catch {
          /* JSON olmayan satır */
        }
      }
    })
    const istek = (id, method, params) =>
      new Promise((res) => {
        bekleyen.set(id, res)
        p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
      })
    ;(async () => {
      const ilk = await istek(1, 'initialize', {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'wrongstack-saglik', version: '1' },
      })
      p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} }) + '\n')
      const arac = await istek(2, 'tools/list', {})
      bitir({
        surum: ilk.result && ilk.result.serverInfo ? ilk.result.serverInfo.version : null,
        arac: arac.result && arac.result.tools ? arac.result.tools.length : null,
      })
    })()
  })
}

/** mailbox-mcp proje kimliğini kök yolundan türetir; sürücü harfi küçük (posta-kutusu.cjs ile aynı kanonik kök). */
function kanonikKok(p) {
  return path.resolve(p).replace(/^([A-Za-z]):/, (_, h) => h.toLowerCase() + ':')
}

/**
 * ⛔SUNUCU AÇMA GUARD'I (12 Ekim 13:07, ölçülmüş kaza): sunucu `--project-root`u git üzerinden ANA AĞACA çevirir.
 * Worktree'den koşan bir betik, o worktree'nin KENDİ node_modules sürümüyle CANLI kökü açar; sürüm canlıda
 * koşandan yeniyse sage.db şeması yerinde göç eder (34 → 47 nesne, geri alınamaz) ve yeni sürüm daemon'u doğar.
 * Bu yüzden sunucu açmak ANA AĞAÇ + açık bayrak (`--sunucu`) ister. Ana ağaç: `.git` bir DİZİN (worktree'de dosya).
 */
function anaAgacMi(kok = KOK) {
  try {
    return fs.statSync(path.join(kok, '.git')).isDirectory()
  } catch {
    return false
  }
}

module.exports = { daemonPaketi, daemonSurumleri, paketSurumu, sunucuSurumu, kanonikKok, anaAgacMi, SUNUCULAR }

if (require.main === module) {
  ;(async () => {
    const sunucuIstegi = process.argv.includes('--sunucu')
    const yalnizDaemon = !sunucuIstegi
    const hatalar = []
    if (sunucuIstegi && !anaAgacMi()) {
      process.stdout.write(
        'HATA: --sunucu yalniz ANA AGACTA kosulur (burasi worktree: sunucu canli koku acar ve sage.db semasini yerinde goc ettirir). Daemon taramasi icin bayraksiz kos.\n',
      )
      process.exit(1)
    }
    const beklenen = (paket) => paketSurumu(path.join(ARAC, 'node_modules', '@wrongstack', paket))
    if (!yalnizDaemon) {
      for (const ad of SUNUCULAR) {
        const klasor = path.join(ARAC, 'node_modules', '@wrongstack', ad)
        const kurulu = paketSurumu(klasor)
        const r = await sunucuSurumu(path.join(klasor, 'dist', 'cli.js'), kanonikKok(KOK))
        const ok = !r.hata && r.surum && r.surum === kurulu
        process.stdout.write(
          `${ok ? 'tamam ' : 'HATA  '} ${ad.padEnd(22)} paket ${kurulu || 'YOK'}  initialize ${r.surum || r.hata}  araç ${r.arac ?? '-'}\n`,
        )
        if (!ok) hatalar.push(ad + ' sunucusu ' + (r.hata || 'sürüm ' + r.surum + ' ≠ kurulu ' + kurulu))
      }
    }
    let surecler
    try {
      surecler = surecleriOku()
    } catch (e) {
      surecler = null
      hatalar.push('süreç listesi alınamadı (' + String(e.message).slice(0, 80) + '): daemon sürümü DOĞRULANAMADI')
    }
    if (surecler) {
      const d = daemonSurumleri(surecler, beklenen)
      for (const x of d) {
        process.stdout.write(
          `${x.eski ? 'ESKİ  ' : 'tamam '} daemon pid ${x.pid} ${x.paket.padEnd(14)} ${x.surum || '?'} (beklenen ${x.beklenen || '?'}) kök ${x.kok || '?'}\n`,
        )
        if (x.eski) hatalar.push('daemon pid ' + x.pid + ' ' + x.paket + ' ' + (x.surum || '?') + ' ≠ ' + (x.beklenen || '?'))
      }
      if (d.length === 0) process.stdout.write('daemon yok (ilk çağrıda kendiliğinden doğar)\n')
    }
    if (hatalar.length) {
      process.stdout.write('HATA: ' + hatalar.join(' · ').slice(0, 400) + '\n')
      process.exitCode = 1
    } else {
      process.stdout.write('HAZIR\n')
    }
  })()
}
