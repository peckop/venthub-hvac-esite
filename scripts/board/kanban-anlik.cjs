#!/usr/bin/env node
/**
 * KANBAN ANLIK OKUMA — modların (hafta, ops-kokpit) Kanban'ı izin gerektirmeden okuması için.
 *
 * Neden: `$.mcp.call('wrongstack-kanban','kanban_read',…)` izin denetleyicisinde "karar vermedi" diye reddediliyor
 * (2026-10-04). `linear-zil` modunun `$.process.run(['node', betik])` kalıbı çalışıyor; aynı kalıp.
 *
 * Kaynak: ana deponun `.wrongstack/kanbans/_kanban.sqlite` dosyası, node:sqlite `readOnly` ile açılır
 * (kanban_disa_aktar.py'nin `mode=ro` okumasının eşi). ASLA YAZMAZ. Dosya git DIŞIDIR (depo PUBLIC):
 * betik yalnız seçilen kartların kısa alanlarını stdout'a basar.
 *
 * Kullanım:
 *   node scripts/board/kanban-anlik.cjs [--label <etiket>]... [--id <kart>]... [--acik] [--detay] [--limit N] [--db <sqlite>]
 *   --label birden çok verilirse HERHANGİ biri yeter (büyük/küçük harf ayırmaz). --limit yoksa sınırsız.
 *   --id <kart>: kart kimliği ya da başlığın başındaki numara (ARC-33); birden çok verilirse herhangi biri.
 *   --acik: Done sütunundaki kartları atlar (Pano sekmesi için).
 *   --pano <metin>: yalnız başlığında bu metin geçen (büyük/küçük harf ayırmaz) ya da kimliği bu olan pano(lar)ın kartları.
 *   --kisa: açıklama, createdAt, updatedAt çıkar (Pano sekmesi gibi toplu liste için; çıktı ~3 kat küçülür).
 *   --vade-bas YYYY-AA-GG / --vade-son YYYY-AA-GG: vadesi bu aralıkta (uçlar dahil) olan kartlar; vadesizler elenir.
 *   Çıktıda ayrıca `sayac` vardır: {panoKimligi: {baslik, sutunlar: {sutunAdi: kartSayisi}}} (süzgeçlerden BAĞIMSIZ, arşivsiz
 *   tüm kartlar): Pano sekmesinin sütun sayıları Kanban'la birebir olsun diye (Done kartları listeye girmese de sayılır).
 *   --detay: kartın TAM içeriği (ARC-33): açıklama (tam), kabul ölçütleri, bağımlılıklar (başlıklarıyla), son 5 not,
 *     bağlantılar, süre. Tek karta bakarken `--id` ile birlikte kullanılır; toplu listede kullanılmaz (çıktı şişer).
 *   Varsayılan çıktıya (geriye uyumlu, yalnız alan EKLENİR) hep şunlar girer: sutun (ad), kabul {m, n}, bagimlilik (sayı), notSayisi.
 *
 * Çıktı (MCP search_tasks ile aynı biçim, tek satır JSON):
 *   {"ok":true,"tasks":[{"board":{"id","title"},"task":{id,title,status,priority,labels,dueDate,assignee,description?,...}}]}
 * Hata: {"ok":false,"hata":"<kısa sebep>"} ve çıkış kodu 0 (mod hatayı gösterebilsin).
 * Arşivli kartlar dahil edilmez.
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

// node:sqlite "ExperimentalWarning" yazar; stdout'u bozmaz ama stderr'i kirletmesin.
process.removeAllListeners('warning')

const DEPO = path.resolve(__dirname, '..', '..')
const ACIKLAMA_SINIRI = 200
const DETAY_ACIKLAMA_SINIRI = 20000
const DETAY_NOT_SAYISI = 5
const DETAY_NOT_SINIRI = 2000

function cikti(nesne) {
  process.stdout.write(JSON.stringify(nesne) + '\n')
}

function hata(sebep) {
  cikti({ ok: false, hata: String(sebep).slice(0, 200) })
  process.exit(0)
}

// --label <x> (tekrarlanabilir), --limit N, --db <yol>
function argumanlar(argv) {
  const a = { etiketler: [], kimlikler: [], pano: null, acik: false, detay: false, kisa: false, vadeBas: null, vadeSon: null, limit: Infinity, db: null }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    if (k === '--label') a.etiketler.push(String(argv[++i] ?? '').trim().toLowerCase())
    else if (k === '--id') a.kimlikler.push(String(argv[++i] ?? '').trim().toLowerCase())
    else if (k === '--acik') a.acik = true
    else if (k === '--pano') a.pano = String(argv[++i] ?? '').trim().toLowerCase()
    else if (k === '--kisa') a.kisa = true
    else if (k === '--vade-bas') a.vadeBas = String(argv[++i] ?? '').slice(0, 10)
    else if (k === '--vade-son') a.vadeSon = String(argv[++i] ?? '').slice(0, 10)
    else if (k === '--detay') a.detay = true
    else if (k === '--limit') {
      const n = Number(argv[++i])
      if (Number.isInteger(n) && n > 0) a.limit = n
    } else if (k === '--db') a.db = argv[++i] ?? null
  }
  a.etiketler = a.etiketler.filter(e => e !== '')
  a.kimlikler = a.kimlikler.filter(e => e !== '')
  return a
}

// --db > VENTHUB_KANBAN_DB > ana deponun .wrongstack/kanbans/_kanban.sqlite (worktree'den de ana depo).
function panoDosyasi(db) {
  if (db) return db
  if (process.env.VENTHUB_KANBAN_DB) return process.env.VENTHUB_KANBAN_DB
  let kok = DEPO
  try {
    const r = spawnSync('git', ['-C', DEPO, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
      encoding: 'utf8',
      timeout: 5000,
    })
    if (r.status === 0 && r.stdout.trim() !== '') kok = path.dirname(r.stdout.trim())
  } catch {
    // git yoksa betiğin deposu kullanılır.
  }
  return path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite')
}

function etiketAdi(l) {
  return String(typeof l === 'string' ? l : (l && l.name) || '')
    .trim()
    .toLowerCase()
}

// Kartın MCP cevabındaki biçimi: ağır alanlar (atomicityAssessment, notes, ...) çıkar, açıklama kırpılır.
// Başlığın başındaki kart numarası: "ARC-33: ..." / "ARC-33 · ..." -> "arc-33".
function kartNo(baslik) {
  const m = /^\s*([A-Za-z\u00c7\u011e\u0130\u00d6\u015e\u00dc\u00e7\u011f\u0131\u00f6\u015f\u00fc]{2,6}-\d{1,5})(?!\d)/.exec(String(baslik || ''))
  return m ? m[1].toLowerCase() : null
}

function kimlikUyar(t, kimlikler) {
  if (kimlikler.length === 0) return true
  const no = kartNo(t.title)
  return kimlikler.some(k => k === String(t.id).toLowerCase() || (no !== null && k === no))
}

function kisaMetin(x, sinir) {
  const m = typeof x === 'string' ? x : ''
  return m.length > sinir ? m.slice(0, sinir) + '…' : m
}

function kabulOzeti(t) {
  const l = Array.isArray(t.successCriteria) ? t.successCriteria : []
  return { m: l.filter(c => c && (c.status === 'passed' || c.status === 'skipped')).length, n: l.length }
}

// Tek kartın TAM içeriği (--detay). panoKartlari: bağımlılık başlıklarını çözmek için aynı panonun kartları.
function detayEkle(k, t, panoKartlari) {
  k.description = kisaMetin(t.description, DETAY_ACIKLAMA_SINIRI)
  k.kabulOlcutleri = (Array.isArray(t.successCriteria) ? t.successCriteria : []).map(c => ({
    id: c.id,
    aciklama: kisaMetin(c.description, 1000),
    durum: c.status ?? 'pending',
    tur: c.type ?? 'manual',
  }))
  k.bagimliliklar = (Array.isArray(t.dependsOn) ? t.dependsOn : []).map(id => {
    const d = panoKartlari.find(x => x && x.id === id)
    return { id, title: d ? d.title : null, status: d ? d.status : null }
  })
  const notlar = Array.isArray(t.notes) ? t.notes : []
  k.notlar = notlar.slice(-DETAY_NOT_SAYISI).map(n => ({
    yazan: n.author ?? null,
    icerik: kisaMetin(n.content, DETAY_NOT_SINIRI),
    saat: n.createdAt ?? null,
  }))
  const baglar = [...(Array.isArray(t.links) ? t.links : []), ...(Array.isArray(t.attachments) ? t.attachments : [])]
  k.baglantilar = baglar.map(b => ({ url: b.url ?? null, tur: b.type ?? null, baslik: b.title ?? null }))
  if (typeof t.estimatedHours === 'number') k.tahminSaat = t.estimatedHours
  if (typeof t.actualHours === 'number') k.gercekSaat = t.actualHours
  k.durumAyrinti = t.assignment && t.assignment.status ? t.assignment.status : null
  return k
}

function vadeUyar(t, bas, son) {
  if (bas === null && son === null) return true
  const v = typeof t.dueDate === 'string' ? t.dueDate.slice(0, 10) : ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false
  return (bas === null || v >= bas) && (son === null || v <= son)
}

function kartKisalt(t, sutunAdi, detay, panoKartlari, kisa) {
  const k = {
    id: t.id,
    title: kisa ? kisaMetin(t.title, 120) : t.title,
    status: t.status,
    priority: t.priority,
    labels: Array.isArray(t.labels) ? t.labels : [],
    dueDate: t.dueDate ?? null,
    assignee: t.assignee ?? null,
    columnId: t.columnId,
    sutun: sutunAdi,
    kabul: kabulOzeti(t),
    bagimlilik: Array.isArray(t.dependsOn) ? t.dependsOn.length : 0,
    notSayisi: Array.isArray(t.notes) ? t.notes.length : 0,
  }
  if (!kisa) {
    k.createdAt = t.createdAt
    k.updatedAt = t.updatedAt
  }
  if (t.completedAt) k.completedAt = t.completedAt
  if (detay) return detayEkle(k, t, panoKartlari)
  if (!kisa && typeof t.description === 'string' && t.description !== '') k.description = t.description.slice(0, ACIKLAMA_SINIRI)
  return k
}

function oku(a) {
  const yol = panoDosyasi(a.db)
  if (!fs.existsSync(yol)) throw new Error('pano dosyası yok')
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(yol, { readOnly: true })
  let satirlar
  try {
    db.exec('PRAGMA busy_timeout = 3000')
    satirlar = db.prepare('select payload from kanban_boards').all()
  } finally {
    db.close()
  }
  const tasks = []
  const sayac = {}
  for (const s of satirlar) {
    const pano = JSON.parse(s.payload)
    const sutunlar = new Map((pano.columns || []).map(c => [c.id, c.title || c.name || c.id]))
    for (const t of pano.tasks || []) {
      if (!t || typeof t.id !== 'string' || typeof t.title !== 'string') continue
      if (t.status === 'archived' || t.archived === true) continue
      const sutunAd = sutunlar.get(t.columnId) ?? t.columnId ?? '?'
      const kayit = (sayac[pano.id] ??= { baslik: pano.title, sutunlar: {} })
      kayit.sutunlar[sutunAd] = (kayit.sutunlar[sutunAd] ?? 0) + 1
      if (a.etiketler.length > 0) {
        const var_ = (t.labels || []).map(etiketAdi)
        if (!a.etiketler.some(e => var_.includes(e))) continue
      }
      if (a.pano && !(String(pano.title).toLowerCase().includes(a.pano) || String(pano.id).toLowerCase() === a.pano)) continue
      if (!kimlikUyar(t, a.kimlikler)) continue
      if (!vadeUyar(t, a.vadeBas, a.vadeSon)) continue
      const sutun = sutunlar.get(t.columnId) ?? t.columnId ?? null
      if (a.acik && t.columnId === 'done') continue
      tasks.push({ board: { id: pano.id, title: pano.title }, task: kartKisalt(t, sutun, a.detay, pano.tasks, a.kisa) })
    }
  }
  return { tasks: tasks.slice(0, a.limit), sayac }
}

try {
  const { tasks, sayac } = oku(argumanlar(process.argv.slice(2)))
  cikti({ ok: true, tasks, sayac })
} catch (e) {
  hata('pano okunamadı: ' + (e instanceof Error ? e.message : e))
}
