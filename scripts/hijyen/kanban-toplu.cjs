#!/usr/bin/env node
/**
 * KANBAN TOPLU GİRİŞ — iş kartı panosuna bir sırayı TEK KOŞUMDA, bağlamı şişirmeden yazar.
 *
 * ⭐NİÇİN VAR (2026-09-21, ÖLÇÜLDÜ): kanban MCP'nin her yazma çağrısı panonun TAMAMINI geri
 * döndürüyor — `start_task` 13.171 bayt, `update_check` 13.706, `verify_completion` 18.992.
 * Tek kart kapatmak ~64 KB bağlam. On iki kartlık bir sırayı MCP aracıyla tek tek girmek
 * ~200 KB demek; bu, panonun kullanılmamasının en güçlü sebebi olurdu. Recep sordu: "iş kartı
 * devreye alınmadı mı, atama yapılamıyor mu?" — cevap panonun kendisi değil, BEDELİYDİ.
 *
 * NE YAPAR: `.mcp.json`'daki AYNI sunucuyu (`kanban-mcp/dist/cli.js --stdio --writable`) alt
 * süreç olarak başlatır, MCP JSON-RPC ile konuşur, her yanıtın yalnız BAYT SAYISINI ve
 * gereken kimliği basar. Veri yine aynı SQLite deposuna gider (ANA ağaç — `ana-kok.cjs`).
 *
 * ⛔KART KANIT KURALI (is-kayit-duzeni pilot bölümü): `command` türü kontrol TEK komuttur —
 * boru/yönlendirme/zincir içeren kontrolü bu betik YAZMAZ, çünkü doğrulayıcının güvenlik
 * kapısı onu hiç koşmuyor ve kart asla kapanmaz (2026-09-21, kart 2e5fb1ce'de yaşandı).
 *
 * KULLANIM:
 *   node scripts/hijyen/kanban-toplu.cjs <sira.json>          # yaz
 *   node scripts/hijyen/kanban-toplu.cjs <sira.json> --kuru   # yalnız doğrula, yazma
 *
 * sira.json: { "boardId", "author", "kartlar": [ { "title", "description", "priority",
 *              "labels": [], "assignee", "kontroller": [ { "description", "type", "notes" } ] } ] }
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { spawn } = require('node:child_process')
const { anaKok } = require('./ana-kok.cjs')

const KABUK_ISLECI = /[|&;<>`]|\$\(/

function kontrolDenetle(k) {
  const hatalar = []
  if (!k.description) hatalar.push('kontrolün açıklaması yok')
  if (k.type === 'command') {
    if (!k.notes) hatalar.push('command kontrolünün komutu yok')
    else if (KABUK_ISLECI.test(k.notes)) {
      hatalar.push(`komut kabuk işleci içeriyor, doğrulayıcı KOŞMAZ: ${k.notes}`)
    }
  }
  return hatalar
}

function siraDenetle(sira) {
  const hatalar = []
  if (!sira.boardId) hatalar.push('boardId yok')
  if (!sira.author) hatalar.push('author yok')
  if (!Array.isArray(sira.kartlar) || sira.kartlar.length === 0) hatalar.push('kart yok')
  for (const [i, k] of (sira.kartlar || []).entries()) {
    if (!k.title) hatalar.push(`kart ${i}: başlık yok`)
    if (!Array.isArray(k.kontroller) || k.kontroller.length === 0) {
      hatalar.push(`kart ${i} (${k.title}): KABUL ÖLÇÜTÜ yok — ölçütsüz kart doğrulanamaz`)
    }
    for (const kt of k.kontroller || []) {
      for (const h of kontrolDenetle(kt)) hatalar.push(`kart ${i} (${k.title}): ${h}`)
    }
  }
  return hatalar
}

/** Minimal MCP istemcisi: satır-ayrık JSON-RPC, yanıtları kimlikle eşler. */
function istemci(kok) {
  const cli = path.join(kok, 'tools', 'wrongstack-mcp', 'node_modules', '@wrongstack', 'kanban-mcp', 'dist', 'cli.js')
  if (!fs.existsSync(cli)) throw new Error(`kanban sunucusu ana ağaçta yok: ${cli}`)
  const surec = spawn(process.execPath, [cli, '--project-root', kok, '--stdio', '--writable'], {
    cwd: kok,
    env: { ...process.env, WRONGSTACK_KANBAN_VERIFIER_COMMANDS: '+gh' },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  let tampon = ''
  let sayac = 0
  const bekleyen = new Map()
  surec.stdout.on('data', (d) => {
    tampon += d.toString('utf8')
    let i
    while ((i = tampon.indexOf('\n')) >= 0) {
      const satir = tampon.slice(0, i).trim()
      tampon = tampon.slice(i + 1)
      if (!satir) continue
      let m
      try {
        m = JSON.parse(satir)
      } catch {
        continue
      }
      if (m.id !== undefined && bekleyen.has(m.id)) {
        const { coz, bayt0 } = bekleyen.get(m.id)
        bekleyen.delete(m.id)
        coz({ mesaj: m, bayt: Buffer.byteLength(satir) + bayt0 })
      }
    }
  })
  const istek = (method, params) =>
    new Promise((coz, red) => {
      const id = ++sayac
      bekleyen.set(id, { coz, bayt0: 0 })
      surec.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n')
      setTimeout(() => {
        if (bekleyen.has(id)) {
          bekleyen.delete(id)
          red(new Error(`${method} 60 sn içinde cevap vermedi`))
        }
      }, 60_000)
    })
  const bildir = (method, params) =>
    surec.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n')
  return { surec, istek, bildir }
}

async function arac(c, args) {
  const { mesaj, bayt } = await c.istek('tools/call', { name: 'kanban_manage', arguments: args })
  if (mesaj.error) throw new Error(`${args.action}: ${JSON.stringify(mesaj.error).slice(0, 200)}`)
  const metin = mesaj.result?.content?.[0]?.text ?? ''
  let veri = null
  try {
    veri = JSON.parse(metin)
  } catch {
    /* metin JSON değilse ham döner */
  }
  if (veri && veri.ok === false) throw new Error(`${args.action}: ${JSON.stringify(veri.error).slice(0, 200)}`)
  return { veri, bayt }
}

/**
 * `--pano <boardId>` — panoyu OKUR ve kart başına tek satır basar: durum · kontrol sayısı ·
 * bölünebilirlik hükmü. Hüküm "borderline/unverifiable" kalan kartı görünür kılar
 * (OPS 2026-09-21: kartların doğrulanamaz kalıp kalmadığı sayıyla yazılsın).
 */
async function panoOzeti(boardId) {
  const c = istemci(anaKok())
  try {
    await c.istek('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'kanban-toplu', version: '1' },
    })
    c.bildir('notifications/initialized', {})
    const { mesaj, bayt } = await c.istek('tools/call', {
      name: 'kanban_read',
      arguments: { action: 'get_board', boardId, includeTasks: true },
    })
    const veri = JSON.parse(mesaj.result?.content?.[0]?.text ?? '{}')
    const gorevler = veri.board?.tasks ?? []
    const say = {}
    for (const g of gorevler) {
      const hukum = g.atomicityAssessment?.verdict ?? '—'
      say[hukum] = (say[hukum] ?? 0) + 1
      const kontrol = (g.successCriteria ?? []).length
      const olcutsuz = (g.atomicityAssessment?.criteria ?? []).find((k) => k.id === 'single-verifiable-output')
      console.log(
        `[pano] ${g.status.padEnd(11)} · kontrol ${kontrol} · hüküm ${hukum}` +
          `${olcutsuz ? ` (tek-çıktı ${olcutsuz.score})` : ''} · ${g.title.slice(0, 60)}`,
      )
    }
    console.log(`[pano] ${gorevler.length} kart · hüküm dağılımı ${JSON.stringify(say)} · okuma ${bayt} bayt, bağlama GİRMEDİ`)
  } finally {
    c.surec.kill()
  }
}

/** `--degerlendir <boardId>` — tamamlanmamış her kartın bölünebilirlik hükmünü yeniden hesaplar. */
async function yenidenDegerlendir(boardId) {
  const c = istemci(anaKok())
  let bayt = 0
  try {
    await c.istek('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'kanban-toplu', version: '1' },
    })
    c.bildir('notifications/initialized', {})
    const pano = await c.istek('tools/call', {
      name: 'kanban_read',
      arguments: { action: 'get_board', boardId, includeTasks: true },
    })
    bayt += pano.bayt
    const gorevler = (JSON.parse(pano.mesaj.result?.content?.[0]?.text ?? '{}').board?.tasks ?? []).filter(
      (g) => g.status !== 'completed' && g.status !== 'archived',
    )
    for (const g of gorevler) {
      const r = await arac(c, { action: 'assess_atomicity', boardId, taskId: g.id, author: 'ALTYAPI' })
      bayt += r.bayt
    }
    console.log(`[kanban-toplu] ${gorevler.length} kart yeniden değerlendirildi · ${bayt} bayt, bağlama GİRMEDİ`)
  } finally {
    c.surec.kill()
  }
}

async function main() {
  const panoIdx = process.argv.indexOf('--pano')
  if (panoIdx >= 0) return panoOzeti(process.argv[panoIdx + 1])
  const degIdx = process.argv.indexOf('--degerlendir')
  if (degIdx >= 0) return yenidenDegerlendir(process.argv[degIdx + 1])
  const dosya = process.argv[2]
  const kuru = process.argv.includes('--kuru')
  if (!dosya) {
    console.log('kullanım: node scripts/hijyen/kanban-toplu.cjs <sira.json> [--kuru]')
    process.exit(2)
  }
  const sira = JSON.parse(fs.readFileSync(dosya, 'utf8'))
  const hatalar = siraDenetle(sira)
  if (hatalar.length) {
    for (const h of hatalar) console.log(`[kanban-toplu] ⛔${h}`)
    process.exit(1)
  }
  console.log(`[kanban-toplu] sıra geçerli: ${sira.kartlar.length} kart, ${sira.kartlar.reduce((n, k) => n + k.kontroller.length, 0)} kontrol`)
  if (kuru) process.exit(0)

  const kok = anaKok()
  const c = istemci(kok)
  let toplamBayt = 0
  let cagri = 0
  try {
    await c.istek('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'kanban-toplu', version: '1' },
    })
    c.bildir('notifications/initialized', {})
    for (const [i, k] of sira.kartlar.entries()) {
      const eklendi = await arac(c, {
        action: 'add_task',
        boardId: sira.boardId,
        title: k.title,
        description: k.description,
        priority: k.priority || 'medium',
        labels: k.labels || [],
        order: i,
        author: sira.author,
      })
      cagri++
      toplamBayt += eklendi.bayt
      const taskId = eklendi.veri?.task?.id
      if (!taskId) throw new Error(`kart ${i}: add_task kimlik döndürmedi`)
      if (k.assignee) {
        const at = await arac(c, {
          action: 'assign_task',
          boardId: sira.boardId,
          taskId,
          assignee: k.assignee,
          author: sira.author,
        })
        cagri++
        toplamBayt += at.bayt
      }
      for (const kt of k.kontroller) {
        const ek = await arac(c, {
          action: 'add_check',
          boardId: sira.boardId,
          taskId,
          checkDescription: kt.description,
          checkType: kt.type || 'manual',
          checkNotes: kt.notes,
          author: sira.author,
        })
        cagri++
        toplamBayt += ek.bayt
      }
      // ⭐BÖLÜNEBİLİRLİK HÜKMÜ YENİDEN HESAPLANIR (2026-09-21, ÖLÇÜLDÜ): sunucu hükmü
      // `add_task` anında, ölçütler HENÜZ YOKKEN hesaplıyor ve bir daha hesaplamıyor.
      // Sonuç: 3 deterministik ölçütlü kart da ölçütsüz kart da aynı "borderline /
      // tek-çıktı 0.3" damgasını taşıyordu — ayırt etmeyen damga. `assess_atomicity`
      // sonrası aynı kart "atomic 0.8 / tek-çıktı 1.0" oldu.
      const hk = await arac(c, { action: 'assess_atomicity', boardId: sira.boardId, taskId, author: sira.author })
      cagri++
      toplamBayt += hk.bayt
      console.log(`[kanban-toplu] ✓ ${taskId.slice(0, 8)} · ${k.title.slice(0, 70)}`)
    }
  } finally {
    c.surec.kill()
  }
  console.log(
    `[kanban-toplu] BİTTİ: ${sira.kartlar.length} kart · ${cagri} çağrı · sunucu ${toplamBayt} bayt döndürdü — BAĞLAMA GİRMEDİ (bu satır ~150 bayt).`,
  )
}

if (require.main === module) {
  main().catch((e) => {
    console.log(`[kanban-toplu] HATA: ${e.message}`)
    process.exit(1)
  })
}

module.exports = { siraDenetle, kontrolDenetle, istemci, arac }
