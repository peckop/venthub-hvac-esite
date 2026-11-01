#!/usr/bin/env node
'use strict'

/**
 * ÖNCE ELİNDEKİ İŞ (ARC-217, OPS ek notu ARC-212 kartında, 26 Ekim 2026).
 *
 * NİÇİN: Departman penceresi açılınca elindeki yarım işi bitirmeden yeni emre geçiyor, işler yarım kalıyor
 * (Recep: tekrar eden hata aynı gün mekanizmaya çevrilir). Not yetmez; açılış ve kart başlatma anı kanca olur.
 *
 * İKİ KULLANIM (aynı mantık):
 *   - açılış kancası (session-board.cjs): `acilisMetni(rol)` → "ÖNCE BUNLAR" (In Progress + Review) ve "SIRADA"
 *     (To Do/Backlog'daki ops-emri kartları) bloğu.
 *   - kart başlatma kancası (once-elindeki-is-uyarisi.cjs): `baslatmaUyarisi(kartKimligi)` → aynı departmanın
 *     başka In Progress kartı varsa (beklemede etiketi yoksa) UYARI metni.
 *
 * VERİ: scripts/board/kanban-anlik.cjs (ana deponun Kanban sqlite'ı, salt okunur). Bir çağrı ~0,5 sn ölçüldü
 * (365 KB çıktı, 781 açık kart). Departman eşlemesi: başlık öneki (ARC → ARAC) YA DA atanan (ARAÇ/ARAC/Arac).
 * Okunamazsa ya da kart bulunamazsa SESSİZ geçer (fail-open): bu kanca iş durdurmaz, hatırlatır.
 *
 * Dışa aktarım: testler ve kancalar için. CLI yok.
 */

const path = require('node:path')
const { spawnSync } = require('node:child_process')

const KANBAN_ANLIK = path.join(__dirname, 'kanban-anlik.cjs')
// Başlık öneki → departman (kart-alani-kapisi.cjs ONEK tablosunun eşi; oradan okunur, yoksa boş kalır).
const BEKLEMEDE_ETIKETLERI = ['beklemede', 'bekliyor', 'blocked', 'engelli']
const ONCE_TAVANI = 6
const SIRADA_TAVANI = 4
const BASLIK_TAVANI = 80

function onekTablosu() {
  try {
    return require(path.join(__dirname, '..', '..', '.claude', 'hooks', 'kart-alani-kapisi.cjs')).ONEK || {}
  } catch {
    return {}
  }
}

/** "Araç", "ARAÇ", "arac" → "ARAC" (kart-alani-kapisi.ad ile aynı katlama). */
function ad(ham) {
  return String(ham || '')
    .trim()
    .toLocaleUpperCase('tr')
    .replace(/Ç/g, 'C')
    .replace(/Ğ/g, 'G')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ş/g, 'S')
    .replace(/Ü/g, 'U')
}

/** Kartın numarası: başlığın başındaki "ARC-217" (yoksa ''). */
function kartNo(baslik) {
  const m = /^\s*([A-Za-z0-9]{2,4}-\d+)\b/.exec(String(baslik || ''))
  return m ? m[1].toUpperCase() : ''
}

/** Kartın departmanı: önce atanan, yoksa başlık öneki. Çözülemezse ''. */
function kartDepartmani(kart, onek = onekTablosu()) {
  const atanan = ad(kart.assignee)
  if (atanan && Object.values(onek).includes(atanan)) return atanan
  const no = kartNo(kart.title)
  const on = no.split('-')[0]
  return on && onek[on] ? onek[on] : ''
}

function beklemede(kart) {
  if (String(kart.status || '') === 'blocked') return true
  const etiketler = (kart.labels || []).map((e) => String(e).toLowerCase())
  return etiketler.some((e) => BEKLEMEDE_ETIKETLERI.some((b) => e.includes(b)))
}

/** Açık kartların düz listesi; okunamazsa null. `calistir` testte sahte verilir. */
function acikKartlar(calistir = kanbanAnlikCalistir) {
  try {
    const cikti = calistir()
    const govde = JSON.parse(cikti)
    if (!govde || govde.ok !== true || !Array.isArray(govde.tasks)) return null
    return govde.tasks.map((t) => t.task).filter(Boolean)
  } catch {
    return null
  }
}

function kanbanAnlikCalistir() {
  const r = spawnSync(process.execPath, [KANBAN_ANLIK, '--acik', '--kisa'], {
    encoding: 'utf8',
    timeout: 8000,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  })
  if (r.error || r.status !== 0) throw new Error('kanban-anlik çalışmadı')
  return r.stdout
}

function kisalt(metin) {
  const t = String(metin || '').replace(/\s+/g, ' ').trim()
  return t.length > BASLIK_TAVANI ? t.slice(0, BASLIK_TAVANI - 1) + '…' : t
}

/** Bir departmanın açık kartlarını üç gruba böler. */
function grupla(kartlar, rol, onek = onekTablosu()) {
  const hedef = ad(rol)
  const benim = kartlar.filter((k) => kartDepartmani(k, onek) === hedef)
  const surenler = benim.filter((k) => k.sutun === 'In Progress' && !beklemede(k))
  const bekleyenler = benim.filter((k) => k.sutun === 'In Progress' && beklemede(k))
  const incelemede = benim.filter((k) => k.sutun === 'Review')
  // Sıra: önce To Do, sonra Backlog; her ikisinde öncelik (critical → low).
  const ONCELIK = { critical: 0, high: 1, medium: 2, low: 3 }
  const sutunSirasi = (k) => (k.sutun === 'To Do' ? 0 : 1)
  const sirada = benim
    .filter((k) => (k.sutun === 'To Do' || k.sutun === 'Backlog') && (k.labels || []).includes('ops-emri'))
    .sort((a, b) => sutunSirasi(a) - sutunSirasi(b) || (ONCELIK[a.priority] ?? 4) - (ONCELIK[b.priority] ?? 4))
  return { surenler, bekleyenler, incelemede, sirada }
}

function satir(k) {
  return `  - ${kartNo(k.title) || k.id}: ${kisalt(k.title.replace(/^\s*[A-Za-z0-9]{2,4}-\d+\s*[·:-]?\s*/, ''))} [${k.sutun}]`
}

/**
 * Açılış bloğu. Departman kartı yoksa '' (OPS ve kartsız roller dahil: sessiz).
 * Yalnız In Progress/Review varsa "ÖNCE BUNLAR"; sırada olanlar ayrı başlıkta ve ikincildir.
 */
function acilisMetni(rol, kartlar = acikKartlar(), onek = onekTablosu()) {
  if (!rol || !kartlar) return ''
  const g = grupla(kartlar, rol, onek)
  const once = [...g.surenler, ...g.incelemede]
  if (once.length === 0 && g.sirada.length === 0) return ''
  const parcalar = []
  if (once.length > 0) {
    parcalar.push(
      `ÖNCE BUNLAR (${ad(rol)}: elindeki ${once.length} açık iş; yeni emre geçmeden bitir ya da "beklemede" etiketi ve sebebiyle bırak):`,
    )
    for (const k of once.slice(0, ONCE_TAVANI)) parcalar.push(satir(k))
    if (once.length > ONCE_TAVANI) parcalar.push(`  … +${once.length - ONCE_TAVANI} kart daha (Kanban panosu)`)
  }
  if (g.sirada.length > 0) {
    parcalar.push(`SIRADA (yeni ops-emri kartları, elindekiler bitince):`)
    for (const k of g.sirada.slice(0, SIRADA_TAVANI)) parcalar.push(satir(k))
    if (g.sirada.length > SIRADA_TAVANI) parcalar.push(`  … +${g.sirada.length - SIRADA_TAVANI} kart daha`)
  }
  return parcalar.join('\n') + '\n'
}

/**
 * Kart başlatılırken uyarı. `hedef` kartın kimliği (uuid) ya da numarası ("ARC-217").
 * Başka In Progress kart yoksa, kart bulunamazsa, departman çözülemezse ya da hedef beklemedeyse '' döner.
 */
function baslatmaUyarisi(hedef, kartlar = acikKartlar(), onek = onekTablosu()) {
  if (!hedef || !kartlar) return ''
  const anahtar = String(hedef).trim().toUpperCase()
  const kart = kartlar.find((k) => String(k.id).toUpperCase() === anahtar || kartNo(k.title) === anahtar)
  if (!kart) return ''
  const rol = kartDepartmani(kart, onek)
  if (!rol) return ''
  const digerleri = grupla(kartlar, rol, onek).surenler.filter((k) => k.id !== kart.id)
  if (digerleri.length === 0) return ''
  const adlar = digerleri
    .slice(0, 3)
    .map((k) => kartNo(k.title) || k.id)
    .join(', ')
  const fazla = digerleri.length > 3 ? ` (+${digerleri.length - 3})` : ''
  return (
    `ÖNCE ELİNDEKİ İŞ: ${kartNo(kart.title) || kart.id} başlatılıyor ama ${ad(rol)}'in In Progress'te ${digerleri.length} kartı var: ${adlar}${fazla}. ` +
    `Elinde X var; önce bitir ya da "beklemede" etiketi ve sebebiyle bırak. (Uyarıdır, engel değil: OPS'un sıra emri varsa karta not yaz.)`
  )
}

const VADE_TAVANI = 10

function vadeKartlariCalistir(bugun) {
  const r = spawnSync(process.execPath, [KANBAN_ANLIK, '--acik', '--kisa', '--vade-son', bugun], {
    encoding: 'utf8',
    timeout: 8000,
    maxBuffer: 32 * 1024 * 1024,
    windowsHide: true,
  })
  if (r.error || r.status !== 0) throw new Error('kanban-anlik çalışmadı')
  return r.stdout
}

/**
 * VADESİ GELEN (ARC-236, OPS 1 Kasım): dueDate ≤ bugün olan ve Done olmayan kartlar, en eski vade önce, en çok 10.
 * Kanban 1.3.0'da vade yalnız veridir, hatırlatma yoktur; zamanlayıcı da yok (karar 53) — OPS açılışında görünür.
 * Okunamazsa ya da vadeli kart yoksa '' (fail-open). `kartlar` testte verilir; `bugun` yerel gün "YYYY-MM-DD".
 */
function vadeMetni(bugun, kartlar = acikKartlar(() => vadeKartlariCalistir(bugun))) {
  if (!kartlar || !/^\d{4}-\d{2}-\d{2}$/.test(String(bugun))) return ''
  const gunu = (k) => (typeof k.dueDate === 'string' ? k.dueDate.slice(0, 10) : '')
  const vadeli = kartlar
    .filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(gunu(k)) && gunu(k) <= bugun && k.sutun !== 'Done')
    .sort((a, b) => gunu(a).localeCompare(gunu(b)) || kartNo(a.title).localeCompare(kartNo(b.title)))
  if (vadeli.length === 0) return ''
  const satirlar = vadeli
    .slice(0, VADE_TAVANI)
    .map((k) => `VADESİ GELEN: ${kartNo(k.title) || k.id} · ${kisalt(k.title.replace(/^\s*[A-Za-z0-9]{2,4}-\d+\s*[·:-]?\s*/, ''))} · ${gunu(k)}`)
  if (vadeli.length > VADE_TAVANI) satirlar.push(`  … +${vadeli.length - VADE_TAVANI} vadesi gelen kart daha (node scripts/board/kanban-anlik.cjs --acik --kisa --vade-son ${bugun})`)
  return satirlar.join('\n') + '\n'
}

module.exports = {
  vadeMetni,
  acilisMetni,
  baslatmaUyarisi,
  grupla,
  kartDepartmani,
  kartNo,
  beklemede,
  acikKartlar,
  BEKLEMEDE_ETIKETLERI,
}
