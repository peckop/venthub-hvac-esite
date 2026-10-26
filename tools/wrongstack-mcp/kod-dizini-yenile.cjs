#!/usr/bin/env node
'use strict'

/**
 * KOD DİZİNİ TEK SEFERLİK ARTIMLI YENİLEME — yalıtılmış koşum (ARC-196 / ARC-208, ARC-177 hükmü 1a).
 *
 * NİÇİN: kod dizini (`wrongstack-codebase-index`) kendiliğinden yenilenmiyor: 25 Ekim'de son dizinleme 17 Eylül'dü
 * (38 gün bayat, 9.484 sembol); ajanlar bayat sonuca güveniyordu. Pencerelere `--writable` VERİLMEZ (her pencereye
 * tam yeniden dizinleme tetikleme gücü verir, AYAR-FARKI-1.1.2-1.1.4.md §3). Yazma yetkisi YALNIZ bu betiğin açtığı
 * ayrı süreçte durur; süreç iş bitince öldürülür. `.mcp.json` ve pencere ayarlarına dokunulmaz.
 *
 * NE YAPAR: ana depo kökünde codebase-index-mcp'yi `--stdio --writable` ile AYRI süreçte açar; `codebase_stats`
 * (önce) → `codebase_index` {} (artımlı; `force` YOK) → `codebase_stats` (sonra) çağırır; önce/sonra tablosunu ve
 * süreyi yazar. Hata ya da zaman aşımında çıkış 1 (sessiz yeşil yok).
 *
 *   node tools/wrongstack-mcp/kod-dizini-yenile.cjs           → yenile
 *   node tools/wrongstack-mcp/kod-dizini-yenile.cjs --kuru    → ne yapacağını yaz, hiçbir süreç açma
 *
 * Çıkış: 0 yenilendi · 1 hata/zaman aşımı · 2 kullanım. Ortam: VENTHUB_KOD_DIZINI_SURE_DK (varsayılan 20).
 * ⚠md/yaml/json da dizinleniyor (ARC-196 ölçümü: 56.779 sembolün 31.259'u md başlığı); gürültü ölçümü ARC-208 (bir hafta).
 */
const path = require('node:path')
const { spawn } = require('node:child_process')

const SURE_DK = 20

/**
 * @typedef {{ totalSymbols?: number, totalFiles?: number, sizeBytes?: number, lastIndexed?: number, byLang?: Record<string, number> }} Istatistik
 * @typedef {{ filesIndexed?: number, errors?: unknown[] }} IndeksSonucu
 */

/** @param {Istatistik | null | undefined} s codebase_stats çıktısı → tek satırlık özet */
function ozet(s) {
  if (!s) return 'ölçülemedi'
  const mb = s.sizeBytes ? (s.sizeBytes / 1048576).toFixed(1) : '?'
  const t = s.lastIndexed ? new Date(s.lastIndexed).toISOString().slice(0, 16).replace('T', ' ') : '?'
  return `${s.totalSymbols} sembol · ${s.totalFiles} dosya · ${mb} MB · son dizinleme ${t}`
}

/** MCP araç sonucu → JSON gövde (content[0].text JSON ise ayrıştırılır, değilse null). */
function govde(sonuc) {
  const t = sonuc && sonuc.content && sonuc.content[0] && sonuc.content[0].text
  if (typeof t !== 'string') return null
  try {
    return JSON.parse(t)
  } catch {
    return null
  }
}

/**
 * @param {{ cli: string, kok: string, sureMs?: number, calistir?: (kok: string, cli: string) => import('node:child_process').ChildProcess }} p
 * @returns {Promise<{ onceki: Istatistik | null, sonraki: Istatistik | null, indeks: IndeksSonucu | null, sureMs: number }>}
 */
function yenile({ cli, kok, sureMs = SURE_DK * 60_000, calistir }) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now()
    const p = calistir
      ? calistir(kok, cli)
      : spawn(process.execPath, [path.join(kok, 'tools/wrongstack-mcp/kanonik-kok.cjs'), cli, '--project-root', kok, '--stdio', '--writable'], {
          cwd: kok,
          stdio: ['pipe', 'pipe', 'pipe'],
        })
    let tampon = ''
    let n = 0
    const bekleyen = new Map()
    let bitti = false
    let zaman = null
    const bitir = (hata, deger) => {
      if (bitti) return
      bitti = true
      if (zaman) clearTimeout(zaman)
      try {
        p.kill()
      } catch {
        /* süreç zaten kapalı */
      }
      if (hata) reject(hata)
      else resolve(deger)
    }
    zaman = setTimeout(() => bitir(new Error(`zaman aşımı (${Math.round(sureMs / 60000)} dk)`)), sureMs)
    p.on('error', (e) => bitir(e))
    p.on('exit', (kod) => bitir(new Error(`MCP süreci beklenmedik kapandı (çıkış ${kod})`)))
    p.stdout.on('data', (d) => {
      tampon += d.toString()
      let i
      while ((i = tampon.indexOf('\n')) >= 0) {
        const satir = tampon.slice(0, i)
        tampon = tampon.slice(i + 1)
        try {
          const m = JSON.parse(satir)
          if (m.id != null && bekleyen.has(m.id)) bekleyen.get(m.id)(m)
        } catch {
          /* günlük satırı */
        }
      }
    })
    const iste = (method, params) =>
      new Promise((res) => {
        const id = ++n
        bekleyen.set(id, res)
        p.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
      })
    const cagir = async (ad, args) => {
      const r = await iste('tools/call', { name: ad, arguments: args })
      if (r.error) throw new Error(`${ad}: ${r.error.message || JSON.stringify(r.error)}`)
      if (r.result && r.result.isError) throw new Error(`${ad}: ${JSON.stringify(r.result.content).slice(0, 200)}`)
      return govde(r.result)
    }
    ;(async () => {
      await iste('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'kod-dizini-yenile', version: '1' } })
      p.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n')
      const onceki = await cagir('codebase_stats', {})
      const indeks = await cagir('codebase_index', {}) // artımlı; `force` YOK
      const sonraki = await cagir('codebase_stats', {})
      bitir(null, { onceki, sonraki, indeks, sureMs: Date.now() - t0 })
    })().catch((e) => bitir(e))
  })
}

async function main(argv) {
  const { anaKok } = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-kok.cjs'))
  const kok = anaKok()
  const cli = process.env.VENTHUB_KOD_DIZINI_CLI || path.join(kok, 'tools/wrongstack-mcp/node_modules/@wrongstack/codebase-index-mcp/dist/cli.js')
  if (argv.includes('--kuru')) {
    process.stdout.write(`KURU: ${cli} --project-root ${kok} --stdio --writable (ayrı süreç, artımlı, force yok); pencerelere dokunulmaz\n`)
    return 0
  }
  const sureDk = Number(process.env.VENTHUB_KOD_DIZINI_SURE_DK) || SURE_DK
  try {
    const r = await yenile({ cli, kok, sureMs: sureDk * 60_000 })
    process.stdout.write(`ÖNCE : ${ozet(r.onceki)}\nSONRA: ${ozet(r.sonraki)}\n`)
    const i = r.indeks || {}
    process.stdout.write(
      `İNDEKS: ${i.filesIndexed ?? '?'} dosya ayrıştırıldı · hata ${Array.isArray(i.errors) ? i.errors.length : '?'} · ${Math.round(r.sureMs / 1000)} sn\n`,
    )
    if (r.sonraki && r.sonraki.byLang) {
      const l = r.sonraki.byLang
      const toplam = r.sonraki.totalSymbols || 1
      const gurultu = ['md', 'json', 'yaml'].reduce((a, k) => a + (l[k] || 0), 0)
      process.stdout.write(`GÜRÜLTÜ: md+json+yaml sembol payı ${((gurultu / toplam) * 100).toFixed(0)}% (${gurultu}/${toplam})\n`)
    }
    return Array.isArray(i.errors) && i.errors.length ? 1 : 0
  } catch (e) {
    process.stderr.write(`HATA: ${e.message}\n`)
    return 1
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).then((k) => process.exit(k))
}

module.exports = { yenile, ozet, govde, main }
