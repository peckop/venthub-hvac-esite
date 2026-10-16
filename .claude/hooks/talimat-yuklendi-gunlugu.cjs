#!/usr/bin/env node
'use strict'
/**
 * TALİMAT YÜKLENDİ GÜNLÜĞÜ — ARC-155 (ARC-147 AL6, OPS 16 Ekim). Kanca olayı: InstructionsLoaded.
 *
 * NE YAPAR: Claude Code bir talimat dosyasını (CLAUDE.md, .claude/rules/*.md, hafıza dosyası) bağlama yüklediğinde olay gelir;
 * bu kanca TEK SATIR yazar: `<ISO zaman> <oturum kısa> <memory_type> <load_reason> <file_path>` → pano dizininde
 * `talimat-yuklendi.log`. Amaç: "paths'siz filo-ortak her açılışta gerçekten yükleniyor mu, MEMORY.md yükleniyor mu" sorusunu
 * tahminle değil kayıtla cevaplamak (ARC-147 headless ölçümü: 3 kayıt, alanlar file_path / memory_type / load_reason).
 *
 * NE YAPMAZ: engellemez, stdout yazmaz, çıkış HEP 0 (olay asenkron gözlemdir, kararı etkilemez); bozuk/boş girdide ve yazma hatasında
 * sessiz geçer. Kaydı OKUMAZ (yalnız ekler). Dosya 256 KB'ı geçerse `.1` yedeğine döner (tek nesil), günlük sınırsız büyümez.
 *
 * KURULUM: `.claude/settings.json` içindeki InstructionsLoaded kaydı OPS'ta (ayarı OPS uygular); bu dosya tek başına etkisizdir.
 * VANA: `VENTHUB_TALIMAT_GUNLUGU_KAPALI=1`. Pano dizini: `VENTHUB_BOARD_DIR` (sage-enjeksiyon-defteri.panoDizini ile aynı kural).
 *
 * stdin: { session_id, hook_event_name: 'InstructionsLoaded', file_path, memory_type, load_reason, ... }
 */
const fs = require('node:fs')
const path = require('node:path')

const GUNLUK_ADI = 'talimat-yuklendi.log'
const TAVAN_BAYT = 256 * 1024

/** SAF: stdin metni → günlük satırı (yoksa null). */
function satirUret(ham, simdi = new Date()) {
  let g
  try {
    g = JSON.parse(String(ham || ''))
  } catch {
    return null
  }
  if (!g || typeof g !== 'object') return null
  const temiz = (v) => String(v === undefined || v === null || v === '' ? '-' : v).replace(/[\r\n\t]+/g, ' ').slice(0, 300)
  const oturum = temiz(g.session_id).slice(0, 8)
  return [simdi.toISOString(), oturum, temiz(g.memory_type), temiz(g.load_reason), temiz(g.file_path)].join(' ')
}

/** Günlüğe ekler; tavan aşıldıysa `.1`e döndürür. Hata fırlatmaz. */
function gunlugeYaz(satir, pano) {
  try {
    fs.mkdirSync(pano, { recursive: true })
    const yol = path.join(pano, GUNLUK_ADI)
    try {
      if (fs.statSync(yol).size > TAVAN_BAYT) fs.renameSync(yol, yol + '.1')
    } catch {
      /* günlük henüz yok: sorun değil */
    }
    fs.appendFileSync(yol, satir + '\n', 'utf8')
  } catch {
    /* yazılamıyorsa da kanca bloklanmaz */
  }
}

function panoDizini() {
  const defter = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-enjeksiyon-defteri.cjs'))
  return defter.panoDizini()
}

function main() {
  if (process.env.VENTHUB_TALIMAT_GUNLUGU_KAPALI === '1') return
  let ham = ''
  try {
    ham = fs.readFileSync(0, 'utf8')
  } catch {
    return
  }
  const satir = satirUret(ham)
  if (!satir) return
  gunlugeYaz(satir, panoDizini())
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* kanca asla bağlam yüklemesini bozmaz */
  }
  process.exit(0)
}

module.exports = { satirUret, gunlugeYaz, GUNLUK_ADI, TAVAN_BAYT }
