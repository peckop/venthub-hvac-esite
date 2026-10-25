#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — SAGE YAZIM SAYACI (ARC-200 · ARC-23(c) · HRT-68).
 *
 * ── NİÇİN VAR ──
 * HRT-68 ölçümü (2026-10-12/19): kanca haftada ~2.000 ders gösteriyor ama OPS'un iki tekrar
 * vakasının dersi sage'de HİÇ yoktu. Sorun "göstermiyor" değil "yazılmamış". Yazma kuralı rol
 * kartlarında var (HRT-36), uygulandığını gören ölçü yoktu. Kural var, kuralın uygulandığını
 * gösteren sayaç yok = kural yok.
 *
 * ── NE YAPAR ──
 * Her istemde TEK SATIR (bağlama eklenir): son 7 günde sage'e yazılan yeni kayıt sayısı ve
 * departman başı dağılım. Pencere ajanı bulunan (`.claude/agents/<rol>-pencere.md`) bir
 * departmanın 7 günde 0 kaydı varsa satır `⚠` ile başlar ve o departmanları adıyla sayar.
 *
 *   SAGE-YAZIM: son 7 gun 50 yeni kayit · arac 10, katalog 11, ... · ⚠ 0 kayit: takip, yetenek
 *
 * Departman = kaydın `audience.roles` alanı (`blog-pencere` → `blog`). Rolsuz kayıt toplamda
 * sayılır, hiçbir departmana yazılmaz (rol etiketi dolu oranı ölçülmüş zayıf nokta: %40).
 *
 * ── GARANTİLER ──
 * · YALNIZ OKUR (sage.db salt-okuma); hiçbir şey yazmaz, hiçbir şeyi engellemez. Çıkış DAİMA 0.
 * · FAIL-OPEN AMA SESSİZ DEĞİL: db yoksa/okunamazsa "ölçülemedi (sebep)" yazar; sessizlik
 *   "sorun yok" gibi okunur (is-kirmizi-degil-adim-kirmizi).
 * · Vana: VENTHUB_SAGE_YAZIM_SAYACI_KAPALI=1.
 * · Dış servise çıkmaz.
 *
 * stdin: { session_id?, cwd? } (kullanılmaz) · stdout: tek satır · çıkış: 0
 */

const fs = require('node:fs')
const path = require('node:path')

const GUN_MS = 24 * 60 * 60 * 1000
const PENCERE_GUN = 7

/**
 * `blog-pencere` → `blog`; büyük/küçük harf ve boşluk affedilir. Çıktı bağlama girer ve `audience.roles`
 * sage kaydından gelir: yalnız [a-z0-9çğıöşü_-] kalır (`<` `>` satır sonu düşer), en çok 32 karakter (ARC-203).
 */
function rolAdi(r) {
  return String(r || '')
    .trim()
    .toLowerCase()
    .replace(/-pencere$/, '')
    .replace(/[^a-z0-9çğıöşü_-]/g, '')
    .slice(0, 32)
}

/** Beklenen departmanlar: `.claude/agents/<rol>-pencere.md` dosyalarından (SSOT: ajan tanımları). */
function beklenenRoller(agentsDizini) {
  try {
    return fs
      .readdirSync(agentsDizini)
      .filter((f) => f.endsWith('-pencere.md'))
      .map((f) => rolAdi(f.replace(/\.md$/, '')))
      .sort()
  } catch {
    return []
  }
}

/**
 * Saf sayım: kayıt satırlarından ({ audience, created_at }) departman başı sayı.
 * `simdi` ve pencere gün sayısı dışarıdan verilir (test deterministik).
 */
function say(satirlar, beklenen, simdi = Date.now(), gun = PENCERE_GUN) {
  const esik = simdi - gun * GUN_MS
  const roller = {}
  let toplam = 0
  let rolsuz = 0
  for (const s of satirlar) {
    const t = Date.parse(s.created_at)
    if (!Number.isFinite(t) || t < esik) continue
    toplam++
    let a = null
    try {
      a = s.audience ? JSON.parse(s.audience) : null
    } catch {
      a = null
    }
    const liste = Array.isArray(a && a.roles) ? a.roles.map(rolAdi).filter(Boolean) : []
    if (!liste.length) {
      rolsuz++
      continue
    }
    for (const r of new Set(liste)) roller[r] = (roller[r] || 0) + 1
  }
  const sifir = beklenen.filter((r) => !roller[r])
  return { toplam, rolsuz, roller, sifir }
}

/** Görünür tek satır. Boş beklenen listede uyarı üretilmez (ölçülemeyen şey 0 sayılmaz). */
function satir(sonuc) {
  const dagilim = Object.entries(sonuc.roller)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([r, n]) => `${r} ${n}`)
    .join(', ')
  const parcalar = [`son ${PENCERE_GUN} gun ${sonuc.toplam} yeni kayit${sonuc.rolsuz ? ` (rolsuz ${sonuc.rolsuz})` : ''}`]
  if (dagilim) parcalar.push(dagilim)
  const onek = sonuc.sifir.length ? '⚠' : ''
  if (sonuc.sifir.length) parcalar.push(`⚠ 0 kayit: ${sonuc.sifir.join(', ')}`)
  return `${onek}SAGE-YAZIM: ${parcalar.join(' · ')}`
}

function dbSatirlari(dbYolu, simdi = Date.now(), gun = PENCERE_GUN) {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { DatabaseSync } = require('node:sqlite')
  const db = new DatabaseSync(dbYolu, { readOnly: true })
  try {
    const alt = new Date(simdi - gun * GUN_MS).toISOString()
    return db.prepare('select audience, created_at from memories where created_at >= ?').all(alt)
  } finally {
    try {
      db.close()
    } catch {
      /* süreç zaten bitiyor */
    }
  }
}

function calistir(env = process.env, simdi = Date.now()) {
  if (env.VENTHUB_SAGE_YAZIM_SAYACI_KAPALI === '1') return ''
  try {
    const { anaKok, agacKoku } = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'ana-kok.cjs'))
    const dbKok = env.VENTHUB_SAGE_DB_KOKU || anaKok()
    const yol = path.join(dbKok, '.wrongstack', 'memories', 'sage.db')
    if (!fs.existsSync(yol)) return 'SAGE-YAZIM: ölçülemedi (sage.db yok)'
    const beklenen = beklenenRoller(path.join(agacKoku(), '.claude', 'agents'))
    return satir(say(dbSatirlari(yol, simdi), beklenen, simdi))
  } catch (e) {
    return `SAGE-YAZIM: ölçülemedi (${String((e && e.message) || e).split('\n')[0].slice(0, 80)})`
  }
}

if (require.main === module) {
  try {
    const cikti = calistir()
    if (cikti) process.stdout.write(cikti + '\n')
  } catch {
    /* kanca turu asla bloklamaz */
  }
  process.exit(0)
}

module.exports = { rolAdi, beklenenRoller, say, satir, dbSatirlari, calistir }
