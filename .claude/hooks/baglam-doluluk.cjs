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
 *
 * ── SIFIR KULLANIMLI KOPYA SATIRLAR (hata 09-28, ölçüldü) ──
 *
 * 09-28'den beri compact sınırından SONRA kayıtta eski cevapların kopyaları duruyor (bu oturumun
 * son üç compact'inde 344 / 266 / 437 satır), hepsinin usage toplamı 0. Kanca bunlardan birini
 * son cevap sanıp "BAGLAM: 0k" bastı; gerçek ~257k idi. Toplamı 0 olan satır ölçüm değildir.
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
    const t = (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0)
    if (t === 0) continue // compact sonrası kopya satır; ölçüm taşımaz (hata 09-28)
    return t
  }
  return null
}

const k = (t) => (t >= 1_000_000 ? (t / 1_000_000).toFixed(1).replace('.0', '') + 'M' : Math.round(t / 1000) + 'k')

/**
 * COMPACT HAZIRLIK NOTU talimatı (Recep 09-29: "diğer pencerelerin compact açıklaması yaptığını görmedim,
 * bu önemli"). Kanca ve durum dosyası yazımı pencerelerde ÇALIŞIYOR ama Recep'e görünen tek cümle üretmiyordu;
 * yalnız Ops elle açıklıyordu. Bu satır eşik üstünde HER istemde gelir → not "bir kez" değil, compact
 * yapılana kadar her cevapta tekrarlanır. Biçim: recep.md §2b "Compact hazırlığı" (üç AYRI satır, tablo değil).
 *
 * ⚠BİÇİM (Recep 09-29, iki kez tekrarladı: "şıkları yanyana dizmişsin, alt alta olsun düz cümle gibi"):
 * üç madde TEK PARAGRAFTA yan yana ve `(a) (b) (c)` etiketiyle yazılınca okunmuyordu. Talimat artık
 * her maddenin AYRI SATIRDA, etiketsiz düz cümle olmasını söyler; eski etiketli sürüm geri gelmesin diye
 * kapı (hafiza-baglam-ve-belge-satiri.test.ts) etiketleri yasaklar.
 */
const HAZIRLIK_NOTU =
  " ⭐RECEP'E COMPACT HAZIRLIK NOTU: bu cevabinin SONUNA UC MADDELIK LISTE yaz; her madde '- ' ile baslayan " +
  'ayri bir satir ve tam cumle, yan yana tek paragraf YOK, harfli ya da numarali etiket YOK. ' +
  'Birinci madde: durum dosyam guncel mi (dosya adi + saat). ' +
  'Ikinci madde: yarim is var mi (varsa ne, ne zaman guvenli noktaya gelir). ' +
  "Ucuncu madde: hukum, 'Simdi compact yapabilirsin' ya da 'X bitince soyleyecegim'. " +
  'Compact yapilana kadar her cevapta kisaca tekrarla. ' +
  "Listenin altina Recep'e su tek cumleyi de yaz: " +
  '"Compact iki aşamalıdır: önce araç çıktıları temizlenir, konuşmanın özeti sonra gelir. ' +
  'Uyarı kısa sürede yeniden görünebilir; bu normaldir ve hiçbir iş kaybolmaz."'

/** Ölçülecek şey yoksa null; eşik altında düz satır, eşiklerde uyarı. */
function satir(token, pencere) {
  if (token === null || token === undefined) return null
  if (token === COMPACT_SONRASI) return 'BAGLAM: compact sonrasi — olcum ilk cevaptan sonra'
  const e = esikler(pencere)
  const oran = k(token) + '/' + k(pencere)
  if (token >= e.yakin) {
    return '⛔BAGLAM: ' + oran + ' — COMPACT YAKIN. Durum dosyasini ve acik sozleri SIMDI yaz; buyuk okuma yapma.' + HAZIRLIK_NOTU
  }
  if (token >= e.doluyor) {
    return '⚠BAGLAM: ' + oran + ' — doluyor. Isi toparlamaya basla; compact ' + k(e.yakin) + "'da uyarilir."
  }
  return 'BAGLAM: ' + oran
}

/**
 * ── PENCERE BAŞINA DURUM DOSYASI (ARC-33 madde 2, 10-04) ──
 *
 * Modlar (ops-kokpit) bağlamı `$.session.usage()` ile okuyunca değer donuyordu (kokpit 19, gerçek 27).
 * Gerçek değeri bu kanca zaten her istemde ölçüyor; aynı ölçümü `~/.claude/mod-durum/pencereler/<sid>.json`
 * dosyasına da bırakır, mod oradan okur (kanca denetlenebilir, mod yalnız gösterir). Aynı dosya pencere
 * başına compact için temel olur. Alanlar: baglamToken (sayı; compact sonrası ilk mesajda null), durum
 * ('olculdu' | 'compact-sonrasi'), pencere, saat (ISO), rol (CC_LANE; bilinmiyorsa null), sid.
 *
 * FAIL-OPEN: yazım hatası kancayı bozmaz, null döner. Yazım atomiktir (geçici dosya + rename), okuyan mod
 * yarım dosya görmez. sid yalnız UUID ise yazılır (yol enjeksiyonu yok).
 */
const SID_BICIMI = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function pencereDosyasiYaz(klasor, sid, token, pencere, rol, simdi = new Date()) {
  try {
    if (!SID_BICIMI.test(String(sid || ''))) return null
    if (token === null || token === undefined) return null
    const compactSonrasi = token === COMPACT_SONRASI
    const kayit = {
      sid: String(sid).toLowerCase(),
      baglamToken: compactSonrasi ? null : token,
      durum: compactSonrasi ? 'compact-sonrasi' : 'olculdu',
      pencere,
      saat: simdi.toISOString(),
      rol: rol ? String(rol).toUpperCase() : null,
    }
    fs.mkdirSync(klasor, { recursive: true })
    const hedef = path.join(klasor, kayit.sid + '.json')
    const gecici = hedef + '.' + process.pid + '.tmp'
    fs.writeFileSync(gecici, JSON.stringify(kayit) + '\n')
    fs.renameSync(gecici, hedef)
    return hedef
  } catch {
    return null
  }
}

/** Varsayılan klasör; VH_PENCERE_KLASORU yalnız testler içindir (gerçek kullanıcı klasörünü kirletmesin). */
const PENCERE_KLASORU =
  process.env.VH_PENCERE_KLASORU || path.join(os.homedir(), '.claude', 'mod-durum', 'pencereler')

module.exports = {
  compactPenceresi,
  esikler,
  sonBaglam,
  satir,
  pencereDosyasiYaz,
  PENCERE_KLASORU,
  COMPACT_SONRASI,
  DOLUYOR,
  YAKIN,
  OKUMA_BAYT,
  HAZIRLIK_NOTU,
}
