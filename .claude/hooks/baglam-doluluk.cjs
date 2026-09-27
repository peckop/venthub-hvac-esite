'use strict'
/**
 * BAĞLAM DOLULUĞU SATIRI (karar 148, 2026-09-27) — defter-tazelik-satiri.cjs'in eşikli bloğu.
 *
 * ── NİÇİN VAR ──
 *
 * Durum çubuğu (.claude/statusline.cjs, karar 140) doluluğu gösteriyor ama VS Code panelinde
 * görünmüyor; Recep her mesajda yalnız UserPromptSubmit kanca satırlarını görüyor. Compact'ın ne
 * zaman geleceği bilinmeyince durum dosyası son anda yazılıyor ya da hiç yazılmıyor.
 *
 * ── NASIL ÖLÇER ──
 *
 * Kanca stdin'i `context_window` taşımaz (yalnız durum çubuğuna verilir); `transcript_path` taşır.
 * Konuşma kaydının SON 512 KB'ı okunur, sondan başa doğru ana konuşmaya ait (isSidechain değil)
 * ilk `assistant` satırının `usage` alanından bağlam = input + cache_creation + cache_read.
 * Durum çubuğunun `current_usage` toplamıyla aynı tanım. Ölçüm 09-27: 12,9 MB kayıtta okuma ~1 ms.
 *
 * ── EŞİKLER ──
 *
 * Ops/Recep: 300k "doluyor", 500k "compact yakın". Compact penceresi `autoCompactWindow` ile
 * küçültülmüşse (karar 140'ta 250k idi) mutlak eşik hiç yanmaz; bu yüzden eşik
 * min(mutlak, pencerenin %60 / %80'i). Pencere önceliği durum çubuğuyla aynı: ortam değişkeni >
 * proje/kullanıcı ayarı > model penceresi (varsayılan 1M).
 *
 * HER MESAJDA KONUŞUR (Ops 09-27, Recep: "her mesajda ne kadar context tüketildiği yazılacaktı"):
 * eşik altında düz "BAGLAM: 146k/1M", eşiklerde uyarı. Kayıt yoksa ya da henüz cevap yoksa
 * (oturumun ilk mesajı) ölçülecek şey yoktur, susar.
 *
 * ── COMPACT SINIRI (hata 09-27, ölçüldü) ──
 *
 * Compact'tan hemen sonraki ilk mesajda kayıtta sınırdan SONRA hiç assistant satırı yoktur; eski
 * sürüm sondan geriye yürürken sınırı geçip compact ÖNCESİ cevabı okuyordu → gerçek ~126k iken
 * "⛔707k COMPACT YAKIN" bastı. Artık `system/compact_boundary` satırına varılınca yürüyüş durur:
 * sınırdan sonra cevap yoksa "compact sonrasi" denir. `compactMetadata.postTokens` KULLANILMAZ —
 * yalnız özet boyudur (ölçüm: post 45k, ilk cevap 126k); sistem istemi ve araçlar dahil değil.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

const OKUMA_BAYT = 512 * 1024
const MODEL_PENCERESI = 1_000_000
const DOLUYOR = 300_000
const YAKIN = 500_000

/** Durum çubuğundaki `compactPenceresi` ile aynı öncelik. */
function compactPenceresi(kok = process.cwd(), ev = os.homedir(), env = process.env) {
  const e = parseInt(env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '', 10)
  if (e > 0) return Math.min(e, MODEL_PENCERESI)
  const yerler = [
    path.join(kok, '.claude', 'settings.local.json'),
    path.join(kok, '.claude', 'settings.json'),
    path.join(ev, '.claude', 'settings.json'),
  ]
  for (const y of yerler) {
    try {
      const v = JSON.parse(fs.readFileSync(y, 'utf8')).autoCompactWindow
      if (typeof v === 'number' && v > 0) return Math.min(v, MODEL_PENCERESI)
    } catch {
      // dosya yok ya da okunamadı → sıradakine bak
    }
  }
  return MODEL_PENCERESI
}

function esikler(pencere) {
  return { doluyor: Math.min(DOLUYOR, Math.round(pencere * 0.6)), yakin: Math.min(YAKIN, Math.round(pencere * 0.8)) }
}

/**
 * Kaydın sonundaki ana konuşma cevabının bağlam token'ı. Kayıt ya da cevap yoksa null; son
 * compact sınırından sonra henüz cevap yoksa COMPACT_SONRASI.
 */
const COMPACT_SONRASI = 'compact-sonrasi'
function sonBaglam(kayitYolu) {
  if (!kayitYolu || !fs.existsSync(kayitYolu)) return null
  const boy = fs.statSync(kayitYolu).size
  const n = Math.min(boy, OKUMA_BAYT)
  const tampon = Buffer.alloc(n)
  const fd = fs.openSync(kayitYolu, 'r')
  try {
    fs.readSync(fd, tampon, 0, n, boy - n)
  } finally {
    fs.closeSync(fd)
  }
  const satirlar = tampon.toString('utf8').split('\n')
  for (let i = satirlar.length - 1; i >= 0; i--) {
    let o
    try {
      o = JSON.parse(satirlar[i])
    } catch {
      continue // kesilmiş ilk satır ya da boş satır
    }
    if (o && o.type === 'system' && o.subtype === 'compact_boundary' && !o.isSidechain) return COMPACT_SONRASI
    const u = o && o.message && o.message.usage
    if (o.type !== 'assistant' || o.isSidechain || !u) continue
    return (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0)
  }
  return null
}

const k = (t) => (t >= 1_000_000 ? (t / 1_000_000).toFixed(1).replace('.0', '') + 'M' : Math.round(t / 1000) + 'k')

/** Ölçülecek şey yoksa null; eşik altında düz satır, eşiklerde uyarı. */
function satir(token, pencere) {
  if (token === null || token === undefined) return null
  if (token === COMPACT_SONRASI) return 'BAGLAM: compact sonrasi — olcum ilk cevaptan sonra'
  const e = esikler(pencere)
  const oran = k(token) + '/' + k(pencere)
  if (token >= e.yakin) {
    return '⛔BAGLAM: ' + oran + ' — COMPACT YAKIN. Durum dosyasini ve acik sozleri SIMDI yaz; buyuk okuma yapma.'
  }
  if (token >= e.doluyor) {
    return '⚠BAGLAM: ' + oran + ' — doluyor. Isi toparlamaya basla; compact ' + k(e.yakin) + "'da uyarilir."
  }
  return 'BAGLAM: ' + oran
}

module.exports = { compactPenceresi, esikler, sonBaglam, satir, COMPACT_SONRASI, DOLUYOR, YAKIN, OKUMA_BAYT }
