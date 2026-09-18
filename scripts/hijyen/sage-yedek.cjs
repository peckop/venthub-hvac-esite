#!/usr/bin/env node
/**
 * SAGE YEDEĞİ — çapalı hafızanın TUTARLI anlık görüntüsü (REC-345).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Hafıza dersleri sage'e taşınıyor (dosya hafızasından puanlı tek depoya). Tek depo
 * **tek arıza noktasıdır**: `.wrongstack/memories/sage.db` git DIŞIDIR (bilerek — ikili
 * SQLite üç pencerede çatışır, sır taraması ikiliyi görmez, içerik PR incelemesini atlar),
 * yani depoyu kaybetmek dersleri kaybetmektir ve geri dönüşü yoktur.
 *
 * ⛔CANLI DOSYA KOPYASI YEDEK DEĞİLDİR. Ölçüldü (2026-09-18): veritabanı WAL kipinde ve
 * yanında 758 KB'lık bir `sage.db-wal` duruyordu. `sage.db`yi tek başına kopyalamak, WAL'da
 * bekleyen yazımları ATLAR — elde sessizce eksik, hatta tutarsız bir dosya kalır. Bu yüzden
 * yedek `VACUUM INTO` ile alınır: kaynak SALT-OKUMA açılır, çıktı WAL dahil tek tutarlı
 * dosyadır.
 *
 * ⛔YEDEK GIT'E KONMAZ. Özel hafıza deposu bile üç pencerenin yazdığı bir git deposudur ve
 * ikili dosya çatışması birleştirilemez. Yedek git DIŞI bir dizine iner
 * (`%LOCALAPPDATA%/venthub-sage-yedek`, ya da `VENTHUB_SAGE_YEDEK_DIZINI`).
 *
 * ⭐YEDEK DOĞRULANMADAN YEDEK SAYILMAZ. Her koşum, ürettiği dosyayı salt-okuma açar, kayıt
 * sayısını ve tabloları KAYNAKLA KARŞILAŞTIRIR. Sayı tutmuyorsa çıkış kodu kırmızıdır ve dosya
 * `.DOGRULANMADI` uzantısıyla bırakılır — "yedek aldım" cümlesi ölçülmüş olmadan kurulmaz.
 * (Bu depoda ölçülmüş kusur sınıfı: "koşuyor" ≠ "geçti".)
 *
 * KOŞTURMA:
 *   node scripts/hijyen/sage-yedek.cjs            # yedek al + doğrula
 *   node scripts/hijyen/sage-yedek.cjs --liste    # mevcut yedekleri yaz
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §7.
 */
const fs = require('fs')
const path = require('path')

/** Kaç yedek tutulur (en yenileri). Eski olanlar silinir — sonsuz büyüme de bir arızadır. */
const TUTULACAK = 14

function kok() {
  return process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..')
}

function kaynakYolu(k = kok()) {
  return path.join(k, '.wrongstack', 'memories', 'sage.db')
}

/** Git DIŞI hedef dizin. Depo içine ASLA yazılmaz (ikili + üç yazar = çözülemez çatışma). */
function yedekDizini() {
  if (process.env.VENTHUB_SAGE_YEDEK_DIZINI) return process.env.VENTHUB_SAGE_YEDEK_DIZINI
  const taban =
    process.env.LOCALAPPDATA || process.env.XDG_STATE_HOME || path.join(process.env.HOME || '.', '.local', 'state')
  return path.join(taban, 'venthub-sage-yedek')
}

/** node:sqlite deneysel: uyarı stderr'e düşmesin (dinleyici require'DAN ÖNCE kaldırılır). */
function sqlite() {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  return require('node:sqlite')
}

/** Bir veritabanının parmak izi: tablo adları + kayıt sayısı. Karşılaştırma bununla yapılır. */
function parmakIzi(yol) {
  const { DatabaseSync } = sqlite()
  const db = new DatabaseSync(yol, { readOnly: true })
  try {
    const tablolar = db
      .prepare("select name from sqlite_master where type='table' and name not like 'sqlite_%' order by name")
      .all()
      .map((r) => r.name)
    const sayi = db.prepare('select count(*) as c from memories').get().c
    const aktif = db.prepare("select count(*) as c from memories where status='active'").get().c
    return { tablolar, sayi: Number(sayi), aktif: Number(aktif) }
  } finally {
    try {
      db.close()
    } catch {
      /* süreç zaten bitiyor */
    }
  }
}

function damga(d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(
    d.getUTCMinutes(),
  )}Z`
}

/**
 * Tutarlı yedek alır ve DOĞRULAR.
 * @returns {{durum:'alindi'|'dogrulanmadi'|'kaynak-yok'|'hata', yol?:string, kaynak?:object, yedek?:object, sebep?:string}}
 */
function yedekAl(simdi = new Date()) {
  const kaynak = kaynakYolu()
  if (!fs.existsSync(kaynak)) return { durum: 'kaynak-yok', sebep: kaynak }

  const dizin = yedekDizini()
  fs.mkdirSync(dizin, { recursive: true })
  const hedef = path.join(dizin, `sage-${damga(simdi)}.db`)

  let kaynakIzi
  try {
    kaynakIzi = parmakIzi(kaynak)
    const { DatabaseSync } = sqlite()
    const db = new DatabaseSync(kaynak, { readOnly: true })
    try {
      // ⭐VACUUM INTO: WAL dahil TEK tutarlı dosya. Kaynağa YAZMAZ (readOnly ile açıldı).
      db.exec(`VACUUM INTO '${hedef.replace(/'/g, "''")}'`)
    } finally {
      try {
        db.close()
      } catch {
        /* süreç zaten bitiyor */
      }
    }
  } catch (e) {
    return { durum: 'hata', sebep: String((e && e.message) || e).slice(0, 200) }
  }

  // GERİ YÜKLEME DENEMESİ: yedeği aç, parmak izini kaynakla karşılaştır.
  let yedekIzi
  try {
    yedekIzi = parmakIzi(hedef)
  } catch (e) {
    const bozuk = hedef + '.DOGRULANMADI'
    try {
      fs.renameSync(hedef, bozuk)
    } catch {
      /* yeniden adlandırma başarısızsa dosya yerinde kalır; durum yine kırmızı */
    }
    return { durum: 'dogrulanmadi', yol: bozuk, sebep: 'yedek acilamadi: ' + String((e && e.message) || e).slice(0, 160) }
  }

  const uyusuyor =
    yedekIzi.sayi === kaynakIzi.sayi &&
    yedekIzi.aktif === kaynakIzi.aktif &&
    yedekIzi.tablolar.join(',') === kaynakIzi.tablolar.join(',')
  if (!uyusuyor) {
    const bozuk = hedef + '.DOGRULANMADI'
    try {
      fs.renameSync(hedef, bozuk)
    } catch {
      /* aynı: durum kırmızı kalır */
    }
    return {
      durum: 'dogrulanmadi',
      yol: bozuk,
      kaynak: kaynakIzi,
      yedek: yedekIzi,
      sebep: `parmak izi uyusmuyor (kaynak ${kaynakIzi.sayi}/${kaynakIzi.aktif}, yedek ${yedekIzi.sayi}/${yedekIzi.aktif})`,
    }
  }

  budama(dizin)
  return { durum: 'alindi', yol: hedef, kaynak: kaynakIzi, yedek: yedekIzi }
}

/** En yeni TUTULACAK yedeği bırakır. `.DOGRULANMADI` dosyalarına DOKUNMAZ (kanıt olarak kalır). */
function budama(dizin = yedekDizini()) {
  let dosyalar
  try {
    dosyalar = fs
      .readdirSync(dizin)
      .filter((f) => /^sage-.*\.db$/.test(f))
      .sort()
  } catch {
    return []
  }
  const silinecek = dosyalar.slice(0, Math.max(0, dosyalar.length - TUTULACAK))
  for (const f of silinecek) {
    try {
      fs.unlinkSync(path.join(dizin, f))
    } catch {
      /* silinemezse bir sonraki koşumda tekrar denenir */
    }
  }
  return silinecek
}

function liste(dizin = yedekDizini()) {
  try {
    return fs
      .readdirSync(dizin)
      .filter((f) => f.startsWith('sage-'))
      .sort()
      .map((f) => {
        const s = fs.statSync(path.join(dizin, f))
        return { ad: f, bayt: s.size, tarih: s.mtime.toISOString() }
      })
  } catch {
    return []
  }
}

module.exports = { TUTULACAK, kaynakYolu, yedekDizini, parmakIzi, yedekAl, budama, liste, damga }

if (require.main === module) {
  if (process.argv.includes('--liste')) {
    const l = liste()
    if (!l.length) process.stdout.write(`sage-yedek: ${yedekDizini()} altinda yedek YOK\n`)
    for (const y of l) process.stdout.write(`${y.ad}  ${y.bayt} bayt  ${y.tarih}\n`)
    process.exit(0)
  }
  const s = yedekAl()
  if (s.durum === 'alindi') {
    process.stdout.write(
      `sage-yedek: ALINDI ve DOGRULANDI -> ${s.yol}\n` +
        `  kayit ${s.yedek.sayi} (aktif ${s.yedek.aktif}), tablo ${s.yedek.tablolar.length} — kaynakla BIREBIR\n`,
    )
    process.exit(0)
  }
  if (s.durum === 'kaynak-yok') {
    process.stdout.write(`sage-yedek: KAYNAK YOK (${s.sebep}) — bu makinede sage kurulu degil, yedek ALINMADI\n`)
    process.exit(0)
  }
  process.stderr.write(`sage-yedek: ${s.durum.toUpperCase()} — ${s.sebep}\n`)
  process.exit(1)
}
