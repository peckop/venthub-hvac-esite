#!/usr/bin/env node
'use strict'

/**
 * KANIT DÖNÜŞTÜRÜCÜ — ARC-78 (OPS emri 26 Ekim 2026, Recep isteği: kanıt sistemi kalıcı düzelsin).
 *
 * NİÇİN: Ekleme anı kapısı (.claude/hooks/kanban-kanit-yolu-kapisi.cjs) yeni kartta koşmayacak kanıtı reddeder; ama
 * AÇIK kartlarda daha önce kabul edilmiş geçersiz kanıtlar duruyor (git, node, pnpm test:ilgili, boru, mutlak yol).
 * Done kapısı (gateEnforcement=strict) açılınca bu kartlar kapanamaz. Bu betik onları MEKANİK olarak tarar ve çevirir.
 *
 * NE YAPAR: Done/arşiv dışı kartlardaki kontrolleri kapıyla AYNI kurallarla (komutSorunu / yolSorunu) tarar; geçersiz
 * olanın TÜRÜNÜ `manual` yapar. Açıklama korunur; eski gövde (komut ya da yol) notlara taşınır ve şu cümle eklenir:
 * "eski kanıt biçimi, kapanışta geçerli biçimle ölçülür".
 *
 * ⛔SINIR: kırmızı (failed) ya da bekleyen kanıt `passed` YAPILMAZ; yalnız tür (ve gövde metni) değişir, durum aynı kalır.
 * Done ve arşivli kartlara dokunulmaz. `test`, `manual`, `metric`, `file_*` (geçerli yollu) ve geçerli komutlar olduğu
 * gibi kalır. Kart içeriği, başka kontroller, etiketler, notlar değişmez.
 *
 * KULLANIM:
 *   node scripts/board/kanit-donustur.cjs                       # --kuru: yalnız say ve listele (VARSAYILAN, yazmaz)
 *   node scripts/board/kanit-donustur.cjs --uygula              # yaz
 *   node scripts/board/kanit-donustur.cjs --pano <boardId>      # tek pano (tekrarlanabilir)
 *   node scripts/board/kanit-donustur.cjs --json                # makine okur çıktı
 */

const path = require('node:path')

const KAPI = require(path.join(__dirname, '..', '..', '.claude', 'hooks', 'kanban-kanit-yolu-kapisi.cjs'))

const NOT_METNI = 'eski kanıt biçimi, kapanışta geçerli biçimle ölçülür'
const YAZAR = 'ARC-78'
const DOSYA_TIPLERI = new Set(['file_exists', 'file_matches'])

/** Bitmiş ya da arşivli kart mı (dokunulmaz). */
function kapaliMi(t) {
  const sutun = String(t.columnId || t.sutun || '').toLowerCase()
  const durum = String(t.status || t.durum || '').toLowerCase()
  return sutun === 'done' || durum === 'completed' || durum === 'archived'
}

/** Kontrolün gövdesi: doğrulayıcı notes'u açıklamaya tercih eder. */
function govde(c) {
  return String(c.notes || c.description || '')
}

/**
 * Bir kontrolün geçersizlik sebebi; geçerliyse null.
 * @param {{type:string, notes?:string, description?:string}} c
 * @param {string[]|null} ekler izin listesi ekleri (null = liste bilinmiyor)
 */
function kontrolSorunu(c, ekler) {
  if (c.type === 'command') return KAPI.komutSorunu(govde(c), ekler)
  if (DOSYA_TIPLERI.has(c.type)) {
    const yol = KAPI.kanitYolu({ checkType: c.type, checkNotes: c.notes, checkDescription: c.description })
    return KAPI.yolSorunu(yol)
  }
  return null
}

/**
 * Kartlardan dönüşüm planı üretir (yazmaz).
 * @returns {{taranan:number, acik:number, kontrol:number, donusecek:Array<object>, kategori:Record<string,number>}}
 */
function planla(kartlar, ekler) {
  const plan = { taranan: kartlar.length, acik: 0, kontrol: 0, donusecek: [], kategori: {} }
  for (const t of kartlar) {
    if (kapaliMi(t)) continue
    plan.acik += 1
    for (const c of Array.isArray(t.successCriteria) ? t.successCriteria : []) {
      plan.kontrol += 1
      const sorun = kontrolSorunu(c, ekler)
      if (!sorun) continue
      const anahtar = c.type === 'command' ? `komut: ${sorun.replace(/"[^"]*"/g, '"…"').slice(0, 70)}` : `${c.type}: ${sorun}`
      plan.kategori[anahtar] = (plan.kategori[anahtar] || 0) + 1
      plan.donusecek.push({
        boardId: t.boardId,
        taskId: t.id,
        kart: String(t.title || '').split(' ')[0],
        checkId: c.id,
        tip: c.type,
        durum: c.status,
        eskiGovde: govde(c),
        sebep: sorun,
        yeniNot: `ESKİ KANIT (${c.type}): ${govde(c)} — ${NOT_METNI}. Sebep: ${sorun}`,
      })
    }
  }
  return plan
}

/**
 * Planı uygular. `yaz.kontrolGuncelle` MCP `update_check` çağrısıdır. Durum ASLA gönderilmez (passed'a çevirme yasak).
 * @returns {Promise<{yazilan:number, hatalar:string[]}>}
 */
async function uygula(plan, yaz) {
  const sonuc = { yazilan: 0, hatalar: [] }
  for (const d of plan.donusecek) {
    try {
      await yaz.kontrolGuncelle({ boardId: d.boardId, taskId: d.taskId, checkId: d.checkId, checkType: 'manual', checkNotes: d.yeniNot, author: YAZAR })
      sonuc.yazilan += 1
    } catch (e) {
      sonuc.hatalar.push(`${d.kart} ${d.checkId}: ${e && e.message ? e.message : e}`)
    }
  }
  return sonuc
}

function argumanlar(argv) {
  const a = { uygula: false, json: false, panolar: [] }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--uygula') a.uygula = true
    else if (argv[i] === '--kuru') a.uygula = false
    else if (argv[i] === '--json') a.json = true
    else if (argv[i] === '--pano' && argv[i + 1]) {
      a.panolar.push(argv[i + 1])
      i += 1
    }
  }
  return a
}

async function cli(argv) {
  const a = argumanlar(argv)
  const { anaKok } = require(path.join(__dirname, '..', 'hijyen', 'ana-kok.cjs'))
  const { istemci, mcpHatasi } = require(path.join(__dirname, '..', 'hijyen', 'kanban-toplu.cjs'))
  const c = istemci(anaKok())
  const cagir = async (arac, args) => {
    const { mesaj } = await c.istek('tools/call', { name: arac, arguments: args })
    const h = mcpHatasi(mesaj, args.action)
    if (h) throw h
    const veri = JSON.parse(mesaj.result.content[0].text)
    if (veri && veri.ok === false) throw new Error(`${args.action}: ${JSON.stringify(veri.error).slice(0, 160)}`)
    return veri
  }
  try {
    await c.istek('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'kanit-donustur', version: '1' } })
    c.bildir('notifications/initialized', {})
    const panolar = a.panolar.length ? a.panolar.map((id) => ({ id })) : (await cagir('kanban_read', { action: 'list_boards' })).boards
    const kartlar = []
    for (const b of panolar) {
      const g = await cagir('kanban_read', { action: 'get_board', boardId: b.id, includeTasks: true })
      for (const t of (g.board && g.board.tasks) || []) kartlar.push({ ...t, boardId: b.id })
    }
    const plan = planla(kartlar, KAPI.izinEkleriniOku())
    let yazim = null
    if (a.uygula) {
      yazim = await uygula(plan, {
        kontrolGuncelle: (g) => cagir('kanban_manage', { action: 'update_check', ...g }),
      })
    }
    if (a.json) {
      process.stdout.write(JSON.stringify({ taranan: plan.taranan, acik: plan.acik, kontrol: plan.kontrol, donusecek: plan.donusecek.length, kategori: plan.kategori, yazim }) + '\n')
    } else {
      process.stdout.write(`[kanit-donustur] ${a.uygula ? 'UYGULANDI' : 'KURU (yazmaz)'} · taranan kart ${plan.taranan} · açık ${plan.acik} · kontrol ${plan.kontrol} · dönüşecek ${plan.donusecek.length}\n`)
      for (const [k, n] of Object.entries(plan.kategori).sort((x, y) => y[1] - x[1])) process.stdout.write(`  ${n} x ${k}\n`)
      for (const d of plan.donusecek.slice(0, 60)) process.stdout.write(`  ${d.kart} [${d.tip}/${d.durum}] ${d.eskiGovde.slice(0, 90)}\n`)
      if (plan.donusecek.length > 60) process.stdout.write(`  … ve ${plan.donusecek.length - 60} kontrol daha (--json tamamını verir)\n`)
      if (yazim) {
        process.stdout.write(`  yazılan ${yazim.yazilan} · hata ${yazim.hatalar.length}\n`)
        for (const h of yazim.hatalar) process.stdout.write(`  HATA ${h}\n`)
      }
    }
  } finally {
    try {
      c.surec.kill()
    } catch {
      /* istemci zaten kapalı */
    }
  }
}

if (require.main === module) {
  cli(process.argv.slice(2)).then(
    () => process.exit(0),
    (e) => {
      process.stderr.write(`[kanit-donustur] ${e && e.message ? e.message : e}\n`)
      process.exit(1)
    },
  )
}

module.exports = { planla, uygula, kontrolSorunu, kapaliMi, argumanlar, NOT_METNI }
