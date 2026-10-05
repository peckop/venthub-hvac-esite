#!/usr/bin/env node
'use strict'
/**
 * KARTSIZ KAYIT SAYACI (karar 144, REC-401 madde 0) — "Linear'da başlatılan kaydın panoda
 * açık kartı var mı?" sorusunun tek satırlık cevabı. Gün açılış/kapanış raporuna girer.
 *
 * ── NİÇİN VAR (2026-09-27, ÖLÇÜLDÜ) ──
 *
 * is-kayit-duzeni §6.1 pilotu (karar 46, 09-18) "her yeni iş panoda kartla yürür" diyordu.
 * 09-27 el ölçümü: 09-18'den beri açılan/başlatılan 52 Linear kaydının 9'unun kartı vardı;
 * `started` 24 kaydın 4'ünün. 09-21 → 09-27 arası panoya hiç kart açılmamıştı ve bunu
 * hiçbir yüzey göstermedi. Kural yazılıydı; onu ölçen bir şey yoktu.
 *
 * ── NASIL ──
 *
 * 1. Linear'dan `state.type = started` kayıtlar (tek GraphQL sorgusu, 5 sn zaman aşımı).
 * 2. Pano: WrongStack kanban SQLite dosyası, `node:sqlite` ile SALT OKUMA. MCP yolu
 *    kullanılmaz (her çağrı panonun tamamını döndürür, REC-391 K1).
 * 3. Kart eşlemesi: başlıktaki `REC-nn` kalıpları; yalnız AÇIK kart sayılır
 *    (status `completed`/`cancelled` değil). Bir kartta birden çok REC olabilir.
 *
 * ⭐BLOKLAMAZ: çıkış kodu her durumda 0. Ölçülemeyen hâl sessiz geçmez, "OLCULEMEDI" der
 * (anahtar yok / ağ yok / pano dosyası yok) — sessizlik "sıfır kartsız" ile karışmasın.
 * ⛔ANAHTAR HİÇBİR YERE BASILMAZ (depo PUBLIC).
 *
 * Kullanım:  node scripts/board/kartsiz-kayit.cjs          → tek satır
 *            node scripts/board/kartsiz-kayit.cjs --json   → makine çıktısı
 */

const fs = require('node:fs')
const path = require('node:path')

const { anaKok } = require(path.join(__dirname, '..', 'hijyen', 'ana-kok.cjs'))

const ZAMAN_ASIMI_MS = 5000
const LISTE_SINIRI = 8
const KAPALI_DURUMLAR = new Set(['completed', 'cancelled', 'canceled'])
const SORGU =
  '{ issues(first: 250, filter: { state: { type: { eq: "started" } } }) { nodes { identifier createdAt startedAt } } }'
/**
 * Deneme ölçütünün evreni: pilot başlangıcından (§6.1, 09-18) sonra açılan ya da başlatılan kayıt.
 * Daha eski `started` kayıtlar AYRI sayılır — çoğu bayat durumda kalmış kayıttır (09-27: 43 kayıt),
 * kart eksiği değil durum temizliği sinyalidir; tek sayıda karışırsa deneme ölçütü okunmaz.
 */
const PILOT_BASLANGIC = process.env.VENTHUB_KARTSIZ_BASLANGIC || '2026-09-18'

/** Pano dosyası: ana deponun `.wrongstack/kanbans/_kanban.sqlite` (worktree'den de ana depo). */
function panoYolu() {
  if (process.env.VENTHUB_KANBAN_DB) return process.env.VENTHUB_KANBAN_DB
  const kok = anaKok()
  return kok ? path.join(kok, '.wrongstack', 'kanbans', '_kanban.sqlite') : null
}

/** @returns {{ tasks: Array<{ title?: string, status?: string }> }[] | null} */
function panolariOku(yol) {
  if (!yol || !fs.existsSync(yol)) return null
  // node:sqlite deneysel uyarısı rapor satırını kirletmesin.
  process.removeAllListeners('warning')
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    return db
      .prepare('select payload from kanban_boards')
      .all()
      .map((r) => JSON.parse(String(r.payload)))
  } finally {
    db.close()
  }
}

/** Açık kartların başlığındaki REC kimlikleri. */
function acikKartRecleri(panolar) {
  const set = new Set()
  for (const p of panolar) {
    for (const t of p.tasks || []) {
      if (KAPALI_DURUMLAR.has(String(t.status || ''))) continue
      for (const m of String(t.title || '').matchAll(/\bREC-\d+\b/g)) set.add(m[0])
    }
  }
  return set
}

/** Saf hesap: başlatılmış kayıtlardan açık kartı olmayanlar (numara sırasıyla). */
function kartsizlar(baslatilmis, kartRecleri) {
  const no = (k) => Number(k.split('-')[1])
  return [...new Set(baslatilmis)].filter((k) => !kartRecleri.has(k)).sort((a, b) => no(a) - no(b))
}

/**
 * Kayıtları pilot evreni ile eski kayıtlar diye ayırır. Tarih karşılaştırması ISO dizesi
 * üzerinden (Linear UTC ISO döndürür; `YYYY-MM-DD` öneki sözlük sırasıyla doğru kıyaslanır).
 * @param {Array<{ identifier: string, createdAt?: string, startedAt?: string | null }>} kayitlar
 */
function ayir(kayitlar, baslangic = PILOT_BASLANGIC) {
  const pilot = []
  const eski = []
  for (const k of kayitlar) {
    const yeni = String(k.createdAt || '') >= baslangic || String(k.startedAt || '') >= baslangic
    ;(yeni ? pilot : eski).push(k.identifier)
  }
  return { pilot, eski }
}

/**
 * @param {{ olculemedi?: string, baslangic?: string, toplam?: number, kartsiz?: string[],
 *   eskiToplam?: number, eskiKartsiz?: number }} s
 */
function satir(s) {
  if (s.olculemedi) return 'KARTSIZ KAYIT: OLCULEMEDI (' + s.olculemedi + ')'
  const k = s.kartsiz || []
  let metin =
    'KARTSIZ KAYIT: ' + k.length + '/' + s.toplam + ' baslatilmis kaydin (' + String(s.baslangic).slice(5) + ' sonrasi) panoda acik karti yok'
  if (k.length) {
    metin += ' (' + k.slice(0, LISTE_SINIRI).join(', ') + (k.length > LISTE_SINIRI ? ' +' + (k.length - LISTE_SINIRI) : '') + ')'
  }
  if (s.eskiToplam) metin += ' · eski started ' + s.eskiKartsiz + '/' + s.eskiToplam + ' kartsiz (durum temizligi)'
  return metin
}

async function baslatilmislariCek(anahtar) {
  const cevap = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: anahtar },
    body: JSON.stringify({ query: SORGU }),
    signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
  })
  if (!cevap.ok) throw new Error('Linear HTTP ' + cevap.status)
  const g = await cevap.json()
  if (g.errors) throw new Error('Linear sorgu hatasi')
  return g.data.issues.nodes
}

async function olc() {
  const anahtar = process.env.LINEAR_API_KEY || ''
  if (!anahtar) return { olculemedi: 'LINEAR_API_KEY yok' }
  let panolar
  try {
    panolar = panolariOku(panoYolu())
  } catch {
    return { olculemedi: 'pano okunamadi' }
  }
  if (!panolar) return { olculemedi: 'pano dosyasi yok' }
  let kayitlar
  try {
    kayitlar = await baslatilmislariCek(anahtar)
  } catch {
    return { olculemedi: 'Linear erisilemedi' }
  }
  const kartlar = acikKartRecleri(panolar)
  const { pilot, eski } = ayir(kayitlar)
  return {
    baslangic: PILOT_BASLANGIC,
    toplam: new Set(pilot).size,
    kartsiz: kartsizlar(pilot, kartlar),
    eskiToplam: new Set(eski).size,
    eskiKartsiz: kartsizlar(eski, kartlar).length,
  }
}

module.exports = { kartsizlar, acikKartRecleri, ayir, satir, panoYolu, panolariOku, olc, SORGU, KAPALI_DURUMLAR, PILOT_BASLANGIC }

if (require.main === module) {
  olc()
    .then((s) => {
      process.stdout.write((process.argv.includes('--json') ? JSON.stringify(s) : satir(s)) + '\n')
    })
    .catch(() => process.stdout.write(satir({ olculemedi: 'beklenmeyen hata' }) + '\n'))
    .finally(() => {
      process.exitCode = 0
    })
}
