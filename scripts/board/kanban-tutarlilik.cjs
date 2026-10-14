#!/usr/bin/env node
'use strict'
/**
 * KANBAN TUTARSIZLIK ONARIMI — ARC-125 (OPS emri 13 Ekim 2026, Recep isteği: "çözüm geliştir").
 *
 * NİÇİN VAR: kokpit "N tutarsız kart" sayıyor (ops-kokpit `tutarsizlariBul`, karar 282), düzeltme her seferinde elle
 * yapılıyordu. 13 Ekim'de 22 tutarsızlığın 19'u Done'da hafta etiketi eksik kartlardı, 2'si `karar-verildi` etiketli
 * Backlog kartıydı; kural yazılmadığı sürece yeniden birikir.
 *
 * ⭐KURAL AYNASI: tespit, kokpitteki `tutarsizlariBul` ile AYNI dört tanımı kullanır (başlıkta departman kodu, bitmiş,
 * `hafta-NN`, `karar-verildi`). Kokpit sayacı ile bu betiğin sayısı ayrışırsa biri bayatlar; test iki tarafı da ölçer.
 *
 * NE ONARIR (SINIR — bunun dışında HİÇBİR şeye dokunmaz; kart içeriği, notlar, başka etiketler, Done'dan geri taşıma yok):
 *  1) `hafta-NN` etiketi olmayan BİTMİŞ kart → tamamlanma gününün ISO haftası eklenir (mevcut etiketler korunur).
 *  2) `karar-verildi` etiketli ve Backlog'da duran bitmemiş kart → To Do'ya taşınır (karar verildiyse iş sıradadır).
 * NE ONARMAZ, YALNIZ RAPORLAR (karar insan işidir): biten kartta `recep-bekliyor`/`karar-bekliyor` etiketi (hangi
 * sonucun doğru olduğunu bilmiyoruz), başlığında departman kodu olmayan kart (numarayı biz uyduramayız).
 *
 * KULLANIM:
 *   node scripts/board/kanban-tutarlilik.cjs                 # tara + rapor (yazmaz)
 *   node scripts/board/kanban-tutarlilik.cjs --onar          # onar (yazar)
 *   node scripts/board/kanban-tutarlilik.cjs --onar --kart <taskId> [--pano <boardId>]   # tek kart (kanca bunu çağırır)
 *   --json: makine okur çıktı
 */

const path = require('node:path')

// Kokpit `DEPARTMAN_BASLIGI` ile aynı (mods/ops-kokpit/hooks/register.tsx).
const DEPARTMAN_BASLIGI = /^\s*[A-Za-zÇĞİÖŞÜçğıöşü][A-Za-zÇĞİÖŞÜçğıöşü0-9]{1,5}-\d{1,5}(?!\d)/

const KURAL = Object.freeze({
  bitenBekliyor: 'Biten kartta «bekliyor» etiketi duruyor',
  numarasiz: 'Başlığında departman kodu olmayan kart',
  haftasiz: 'Hafta etiketi olmadığı için ekranda görünmeyen biten kart',
  kararAcik: "Karar verilmiş ama Backlog'da duran kart",
})

function etiketler(t) {
  return (Array.isArray(t.labels) ? t.labels : []).map((l) => String(typeof l === 'string' ? l : (l && l.name) || '').toLowerCase())
}

function bitmisMi(t) {
  return t.status === 'completed' || t.columnId === 'done'
}

/** Kartın ihlal ettiği kurallar (kokpit `tutarsizlariBul` ile aynı tanım). Arşivli/başlıksız kart sayılmaz. */
function ihlaller(t) {
  if (!t || typeof t.title !== 'string' || t.status === 'archived') return []
  const e = etiketler(t)
  const bitmis = bitmisMi(t)
  const o = []
  if (bitmis && (e.includes('recep-bekliyor') || e.includes('karar-bekliyor'))) o.push('bitenBekliyor')
  if (!DEPARTMAN_BASLIGI.test(t.title)) o.push('numarasiz')
  if (bitmis && !e.some((x) => /^hafta-\d+$/.test(x))) o.push('haftasiz')
  if (!bitmis && e.includes('karar-verildi') && (t.columnId === 'backlog' || t.status === 'pending')) o.push('kararAcik')
  return o
}

/** ISO 8601 hafta numarası, YEREL saatle (kokpit hafta modu da yerel gün kullanır). */
function isoHafta(tarih) {
  const d = new Date(tarih.getFullYear(), tarih.getMonth(), tarih.getDate())
  const gun = (d.getDay() + 6) % 7 // Pzt=0 … Paz=6
  d.setDate(d.getDate() - gun + 3) // haftanın Perşembesi
  const ilkPersembe = new Date(d.getFullYear(), 0, 4)
  const ilkGun = (ilkPersembe.getDay() + 6) % 7
  ilkPersembe.setDate(ilkPersembe.getDate() - ilkGun + 3)
  return 1 + Math.round((d.getTime() - ilkPersembe.getTime()) / (7 * 24 * 3600 * 1000))
}

/** Tamamlanma gününden `hafta-NN` (completedAt, yoksa updatedAt, yoksa şimdi). */
function haftaEtiketi(t, simdi = new Date()) {
  for (const alan of [t.completedAt, t.updatedAt]) {
    const d = typeof alan === 'string' ? new Date(alan) : null
    if (d && !Number.isNaN(d.getTime())) return 'hafta-' + String(isoHafta(d)).padStart(2, '0')
  }
  return 'hafta-' + String(isoHafta(simdi)).padStart(2, '0')
}

/**
 * Bir kart için ONARIM PLANI (saf): { etiketEkle: string|null, todoyaTasi: boolean, yalnizRapor: string[] }.
 * `todoyaTasi` yalnız columnId === 'backlog' iken (kokpit kuralı `status === pending`i de sayar; To Do'daki bekleyen kart
 * zaten sıradadır, taşınacak yer yok → o durum yalnız RAPORDA kalır).
 */
function plan(t, simdi = new Date()) {
  const ih = ihlaller(t)
  const p = { etiketEkle: null, todoyaTasi: false, yalnizRapor: [] }
  for (const k of ih) {
    if (k === 'haftasiz') p.etiketEkle = haftaEtiketi(t, simdi)
    else if (k === 'kararAcik' && t.columnId === 'backlog') p.todoyaTasi = true
    else p.yalnizRapor.push(k)
  }
  return p
}

/**
 * Kartları tarar; `yaz` verilirse planı uygular. `yaz` enjekte edilir (test sahte yazıcıyla koşar).
 * @param {{kartlar: any[], yaz?: {etiketle: Function, tasi: Function}, simdi?: Date, kartKimligi?: string}} p
 * @returns {Promise<{taranan: number, tutarsiz: number, kurallar: Record<string, number>, onarilan: object[], hatalar: string[]}>}
 */
async function calistir({ kartlar, yaz, simdi = new Date(), kartKimligi } = {}) {
  const sonuc = { taranan: 0, tutarsiz: 0, kurallar: {}, ihlalli: [], onarilan: [], hatalar: [] }
  for (const t of kartlar || []) {
    if (kartKimligi && t.id !== kartKimligi) continue
    sonuc.taranan++
    const ih = ihlaller(t)
    if (ih.length === 0) continue
    sonuc.tutarsiz++
    for (const k of ih) sonuc.kurallar[k] = (sonuc.kurallar[k] || 0) + 1
    sonuc.ihlalli.push({ id: t.id, kart: String(t.title).slice(0, 60), sutun: t.columnId, durum: t.status, kurallar: ih })
    if (!yaz) continue
    const p = plan(t, simdi)
    const ad = String(t.title).slice(0, 60)
    try {
      if (p.etiketEkle) {
        const mevcut = Array.isArray(t.labels) ? t.labels.map((l) => (typeof l === 'string' ? l : l && l.name)).filter(Boolean) : []
        await yaz.etiketle(t, [...new Set([...mevcut, p.etiketEkle])])
        sonuc.onarilan.push({ id: t.id, kart: ad, islem: 'etiket+' + p.etiketEkle })
      }
      if (p.todoyaTasi) {
        await yaz.tasi(t, 'todo', "ARC-125 otomatik: karar-verildi etiketli kart Backlog'dan To Do'ya taşındı (karar verildiyse iş sıradadır).")
        sonuc.onarilan.push({ id: t.id, kart: ad, islem: 'backlog->todo' })
      }
    } catch (e) {
      sonuc.hatalar.push(`${ad}: ${(e && e.message) || e}`)
    }
  }
  return sonuc
}

// ───────────────────────── CLI (MCP istemcisi: kanban-toplu.cjs ile aynı sunucu) ─────────────────────────

function argumanlar(argv) {
  const a = { onar: false, kart: null, pano: null, json: false }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--onar') a.onar = true
    else if (argv[i] === '--kart') a.kart = argv[++i] || null
    else if (argv[i] === '--pano') a.pano = argv[++i] || null
    else if (argv[i] === '--json') a.json = true
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
    await c.istek('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'kanban-tutarlilik', version: '1' } })
    c.bildir('notifications/initialized', {})
    const panolar = a.pano ? [{ id: a.pano }] : (await cagir('kanban_read', { action: 'list_boards' })).boards
    const kartlar = []
    if (a.kart) {
      // Tek kart (kanca her tetikte bunu çağırır): pano tüm kartlarıyla OKUNMAZ (16 pano / ~1100 kart), yalnız get_task.
      // Pano verilmediyse kart her panoda denenir (get_task hafif; bulunamayan pano hata verir, sıradakine geçilir).
      for (const b of panolar) {
        try {
          const g = await cagir('kanban_read', { action: 'get_task', boardId: b.id, taskId: a.kart })
          if (g.task) {
            kartlar.push({ ...g.task, boardId: b.id })
            break
          }
        } catch {
          /* bu panoda kart yok */
        }
      }
    } else {
      for (const b of panolar) {
        const g = await cagir('kanban_read', { action: 'get_board', boardId: b.id, includeTasks: true })
        for (const t of (g.board && g.board.tasks) || []) kartlar.push({ ...t, boardId: b.id })
      }
    }
    const yaz = a.onar
      ? {
          etiketle: (t, labels) => cagir('kanban_manage', { action: 'update_task', boardId: t.boardId, taskId: t.id, labels }),
          tasi: (t, kolon, note) => cagir('kanban_manage', { action: 'move_task', boardId: t.boardId, taskId: t.id, targetColumnId: kolon, note, author: 'ARC-125' }),
        }
      : undefined
    const sonuc = await calistir({ kartlar, yaz, kartKimligi: a.kart || undefined })
    if (a.json) process.stdout.write(JSON.stringify(sonuc) + '\n')
    else {
      process.stdout.write(`[kanban-tutarlilik] taranan ${sonuc.taranan} · tutarsiz ${sonuc.tutarsiz}${a.onar ? ` · onarilan ${sonuc.onarilan.length}` : ' (yalniz rapor; --onar ile yazar)'}\n`)
      for (const [k, n] of Object.entries(sonuc.kurallar)) process.stdout.write(`  ${n} x ${KURAL[k] || k}\n`)
      for (const o of sonuc.onarilan) process.stdout.write(`  ONARILDI ${o.islem}: ${o.kart}\n`)
      for (const h of sonuc.hatalar) process.stdout.write(`  HATA ${h}\n`)
    }
    process.exitCode = sonuc.hatalar.length ? 1 : 0
  } finally {
    try { c.surec.kill() } catch { /* kapalı */ }
  }
}

if (require.main === module) {
  // İş bitince süreç AÇIKÇA çıkar: MCP istemcisinin 60 sn'lik zamanlayıcısı temizlenmiyor, çıkış çağrılmazsa süreç
  // iş bittikten sonra ~60 sn yaşar (OPS ölçümü, #1932). Çıkış kodu cli'nin process.exitCode'undan gelir.
  cli(process.argv.slice(2))
    .then(() => process.exit(process.exitCode || 0))
    .catch((e) => {
      process.stderr.write(`[kanban-tutarlilik] ${(e && e.message) || e}\n`)
      process.exit(1)
    })
}

module.exports = { KURAL, DEPARTMAN_BASLIGI, ihlaller, plan, isoHafta, haftaEtiketi, calistir, bitmisMi }
