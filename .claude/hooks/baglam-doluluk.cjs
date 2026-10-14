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
 * ── COMPACT HAZIRLIĞI KENDİLİĞİNDEN (ARC-131 madde 1, OPS-134, karar 363) ──
 *
 * Bağlam eşiğe gelince pencere hazırlığı elle kurmak zorunda kalıyordu: "durum dosyam güncel mi", "yarım iş var mı",
 * "/compact satırı nasıl". Üçü de deterministik: kanca durum dosyasının yaşını ve "Yarım iş" satırını zaten okuyor.
 * Bu bölüm hükmü (HAZIR / DEĞİL + nedeni) ve /compact metnini KANCA üretir; pencere yalnız DEĞİL ise durum dosyasını
 * günceller. Hüküm ölçütü kokpitteki `compactHazirlik` ile AYNI: durum dosyası ≤60 dk VE "Yarım iş yok".
 * Belirsizlik (satır yok, dosya yok) "HAZIR" demez. Metin dosya içeriğinden gelir ama yalnız kart numarası deseni
 * ve "Yarım iş" satırının ilk 120 karakteri alınır (keyfi dosya metni istem satırına taşınmaz).
 */
const HAZIR_YAS_DK = 60
const KART_DESENI = /\b(?:ARC|OPS|REC|ALT|URN|KTL|HRT|SEO|BLG|YTN|TSR|ADM|EDG|I18|STS)-\d{1,4}\b/g
const KART_SATIRI = /^\s*[-*]\s*(?:ŞU AN BEKLEYEN|BEKLEYEN|AÇIK|ACIK|SIRADA|YARIM İŞ|Yarım iş|Yarim is)/i
const KART_EN_COK = 8
const YARIM_YAZI_EN_COK = 120

/** Durum dosyasının SON bloğu ("## " başlıklı en son bölüm); başlık yoksa tüm metin. */
function sonBlok(metin) {
  const i = String(metin).lastIndexOf('\n## ')
  return i >= 0 ? String(metin).slice(i + 1) : String(metin)
}

/** Son bloktan { kartlar, yarim } — kart numaraları (tekil, en çok 8) ve "Yarım iş:" satırının kısa metni. */
function compactIcerigi(metin) {
  const kartlar = []
  let yarim = null
  for (const satirMetni of sonBlok(metin).split('\n')) {
    if (!KART_SATIRI.test(satirMetni)) continue
    const m = satirMetni.match(/yar[ıi]m i[şs]\s*:\s*(.+)$/i)
    if (m) yarim = m[1].replace(/\s+/g, ' ').trim().slice(0, YARIM_YAZI_EN_COK)
    for (const kart of satirMetni.match(KART_DESENI) || []) {
      if (!kartlar.includes(kart) && kartlar.length < KART_EN_COK) kartlar.push(kart)
    }
  }
  return { kartlar, yarim }
}

/**
 * Pencerenin yapıştıracağı /compact satırı; kalıp .claude/rules/filo-ortak.md "Compact" bölümüyle AYNI.
 * Kart durumu (Sürüyor, Sırada...) dosyadan güvenle çıkmaz; metne yazılmaz, "ayrıntı durum dosyamda" der.
 */
function compactMetni(icerik) {
  const kartlar = icerik.kartlar.length > 0 ? icerik.kartlar.join(', ') : 'açık kartlar'
  const yarim = icerik.yarim && !/^yok\b/i.test(icerik.yarim) ? icerik.yarim : 'yok'
  return (
    "/compact Recep'in son sözlerini aynen koru. Şunları koru: " + kartlar + ', yarım işler (' + yarim + '). ' +
    'Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.'
  )
}

/**
 * Hüküm. `yasMs` null ise dosya yok/okunamadı. Dönüş: { hazir: boolean, neden: string }.
 * İlk bozan koşul nedeni belirler; sıra kokpitteki `compactHazirlik` ile aynı.
 */
function hazirlikHukmu(yasMs, yarimIs) {
  if (yasMs === null || yasMs === undefined) return { hazir: false, neden: 'durum dosyasi bulunamadi' }
  const dk = Math.max(0, Math.round(yasMs / 60000))
  if (yasMs > HAZIR_YAS_DK * 60000) return { hazir: false, neden: 'durum dosyasi bayat (' + dk + ' dk once guncellendi)' }
  if (yarimIs === 'var') return { hazir: false, neden: 'yarim is var' }
  if (yarimIs !== 'yok') return { hazir: false, neden: "durum dosyasinda 'Yarim is yok/var' satiri yok" }
  return { hazir: true, neden: 'durum dosyasi ' + dk + ' dk once guncellendi, yarim is yok' }
}

/** COMPACT YAKIN satırına eklenen hüküm cümlesi; hazirlik yoksa '' (eski davranış). */
function hazirlikCumlesi(h) {
  if (!h || typeof h !== 'object' || typeof h.hazir !== 'boolean') return ''
  if (h.hazir) {
    return ' HAZIRLIK: HAZIR (' + h.neden + '). Recep icin /compact satiri kancadan hazir: ' + (h.compactMetni || '(uretilemedi)')
  }
  return ' HAZIRLIK: DEGIL (' + (h.neden || 'olculemedi') + '). Once durum dosyasini guncelle (sonuna "Yarim is: yok/var" satiri), sonra compact.'
}

/**
 * ── DÖNÜŞTE İLK SATIR KONTROLÜ (ARC-131 madde 4) ──
 *
 * Kural: compact dönüşünde İLK GÖRÜNÜR satır "bana ulaşan son girdin: …" olur (geçiş anındaki mesaj yutulabilir;
 * kaybı bir turda ortaya çıkarmak için). Bugüne dek uyulup uyulmadığını kimse ölçmüyordu. Kayıtta son
 * `compact_boundary`tan sonraki İLK gerçek (usage > 0, isSidechain değil) assistant METNİNİN ilk dolu satırına bakılır.
 *
 * Sıfır kullanımlı kopya satırlar (hata 09-28) atlanır. Sınır kaydın son 512 KB'ında değilse ölçülmez (null).
 * Dönüş: null (ölçülemedi / cevap yok) | { anahtar: sınır kimliği, tamam: boolean }.
 * Aynı sınır için uyarı BİR kez çıksın diye çağıran `anahtar`ı pencere dosyasına yazar.
 */
const DONUS_DESENI = /^\W*bana ula[şs]an son girdin\b/
function donusKontrolu(kayitYolu) {
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
  const nesneler = []
  for (const s of tampon.toString('utf8').split('\n')) {
    try {
      nesneler.push(JSON.parse(s))
    } catch {
      // kesilmiş ilk satır ya da boş satır
    }
  }
  let sinir = -1
  for (let i = nesneler.length - 1; i >= 0; i--) {
    const o = nesneler[i]
    if (o && o.type === 'system' && o.subtype === 'compact_boundary' && !o.isSidechain) {
      sinir = i
      break
    }
  }
  if (sinir < 0) return null
  const anahtar = String(nesneler[sinir].uuid || nesneler[sinir].timestamp || 'sinir-' + sinir)
  for (let i = sinir + 1; i < nesneler.length; i++) {
    const o = nesneler[i]
    if (!o || o.type !== 'assistant' || o.isSidechain || !o.message) continue
    const u = o.message.usage
    if (!u || (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) === 0) continue
    const icerik = Array.isArray(o.message.content) ? o.message.content : []
    const blok = icerik.find((c) => c && c.type === 'text' && String(c.text || '').trim() !== '')
    if (!blok) continue // araç çağrısı satırı; metin sonraki satırda
    const ilk = String(blok.text).split('\n').find((x) => x.trim() !== '') || ''
    return { anahtar, tamam: DONUS_DESENI.test(ilk.toLocaleLowerCase('tr')) }
  }
  return null
}

/** Pencere dosyasında önceden bildirilen sınır kimliği; dosya yok/bozuksa null. sid UUID değilse null (yol enjeksiyonu yok). */
function donusBildirilenOku(klasor, sid) {
  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(sid || ''))) return null
    const k = JSON.parse(fs.readFileSync(path.join(klasor, String(sid).toLowerCase() + '.json'), 'utf8'))
    return typeof k.donusBildirilen === 'string' && k.donusBildirilen !== '' ? k.donusBildirilen : null
  } catch {
    return null
  }
}

/** İstem satırı: eksikse uyarı; tamam, ölçülemedi ya da bu sınır zaten bildirilmişse null. `bildirilen` önceki anahtardır. */
function donusSatiri(sonuc, bildirilen) {
  if (!sonuc || sonuc.tamam || sonuc.anahtar === bildirilen) return null
  return (
    "⚠DONUS: compact sonrasi ilk cevapta 'bana ulasan son girdin: <ozet>' satiri YOK. " +
    "Recep'e simdi o satiri yaz (durum dosyasinin son blogundaki BANA ULASAN SON GIRDI), sonra isine don."
  )
}

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
  " ⭐RECEP'E COMPACT HAZIRLIK NOTU: bu cevabinin SONUNA UC PARCA yaz. " +
  "Birinci parca UC MADDELIK LISTE; her madde '- ' ile baslayan " +
  'ayri bir satir ve tam cumle, yan yana tek paragraf YOK, harfli ya da numarali etiket YOK. ' +
  'Birinci madde: durum dosyam guncel mi (dosya adi + saat). ' +
  'Ikinci madde: yarim is var mi (varsa ne, ne zaman guvenli noktaya gelir). ' +
  "Ucuncu madde: hukum, 'Simdi compact yapabilirsin' ya da 'X bitince soyleyecegim'. " +
  // ARC-69 (OPS 10-09): rol kurallarında şart olan satır kancada yoktu; pencere her istemde kancayı görüyor,
  // kurallar dosyasını görmüyor. Metin .claude/rules/filo-ortak.md "Compact" bölümündeki kalıpla AYNI olmalı.
  "Ikinci parca, listenin altinda, uc ters tirnakla acilan TEK KOD BLOGU icinde Recep'in kopyalayip yapistiracagi su /compact satiri: " +
  "/compact Recep'in son sozlerini aynen koru. Sunlari koru: <numara (durum)>, ..., yarim isler (<kisa adlar>). " +
  'Ayrinti durum dosyamda. Arac ciktilarini ve eski olcum ayrintilarini at. ' +
  'Durumu cumleye KOPYALAMA, ayrinti durum dosyasinda durur; durum dosyan guncel degilse bu satiri vermeden ONCE onu yaz. ' +
  "Ucuncu parca, en altta, Recep'e su tek cumle: " +
  '"Compact iki aşamalıdır: önce araç çıktıları temizlenir, konuşmanın özeti sonra gelir. ' +
  'Uyarı kısa sürede yeniden görünebilir; bu normaldir ve hiçbir iş kaybolmaz." ' +
  'Compact yapilana kadar her cevapta kisaca tekrarla.'

/**
 * Ölçülecek şey yoksa null; eşik altında düz satır, eşiklerde uyarı.
 * `hazirlik` (ARC-131 madde 1) verilirse COMPACT YAKIN satırı hükmü ve kancanın kendi ürettiği /compact metnini taşır:
 * pencere metni sıfırdan yazmaz, yalnız "DEĞİL" ise durum dosyasını günceller.
 */
function satir(token, pencere, hazirlik = null) {
  if (token === null || token === undefined) return null
  if (token === COMPACT_SONRASI) return 'BAGLAM: compact sonrasi — olcum ilk cevaptan sonra'
  const e = esikler(pencere)
  const oran = k(token) + '/' + k(pencere)
  if (token >= e.yakin) {
    return (
      '⛔BAGLAM: ' + oran + ' — COMPACT YAKIN. Durum dosyasini ve acik sozleri SIMDI yaz; buyuk okuma yapma.' +
      hazirlikCumlesi(hazirlik) +
      HAZIRLIK_NOTU
    )
  }
  if (token >= e.doluyor) {
    return '⚠BAGLAM: ' + oran + ' — doluyor. Isi toparlamaya basla; compact ' + k(e.yakin) + "'da uyarilir."
  }
  return 'BAGLAM: ' + oran
}

/**
 * ── KAYIT BOYUTU (ARC-82, Ops emri 2026-10-09 madde 3) ──
 *
 * Konuşma dosyası (`<sid>.jsonl`) compact'a rağmen küçülmez, yalnız büyür; 10-09 ölçümü: OPS 1,77 GB,
 * Ürün 682 MB, Katalog 260 MB, toplam 4,6 GB (10-10: OPS 2,1 GB). Büyüdükçe dosyayı okuyan her şey
 * yavaşlıyor ve çöküyor. Pencerenin kendi dosyasının boyutu her istemde görünür; eşikler aşılınca
 * uyarı çıkar, 1,5 GB'ta "yeni oturuma devret" denir.
 *
 * ⭐Yalnız `statSync` (dosya AÇILMAZ, ~0,1 ms); okuma yok. Dosya/yol yoksa satır YOK (susar).
 * ⭐Satır EŞİKSİZ görünür (BAGLAM gibi): Recep bağlamın yanında kayıt boyutunu da görür.
 * Eşikler `VENTHUB_KAYIT_UYARI_MB` (1024) ve `VENTHUB_KAYIT_DEVRET_MB` (1536) ile ayarlanır; bozuk
 * (sayı değil, ≤0) ya da sırası ters (devret ≤ uyarı) değer ikisini de varsayılana döndürür.
 *
 * Not: 10-09 20:00 kapanması bellekten (OPS, main.log); dosya boyutu ikincil etken olarak ele alınır,
 * kanıtlanmış sebep sayılmaz.
 */
/** Ortam değişkeninden pozitif eşik; bozuksa (boş, sayı değil, ≤0) varsayılan. */
function mbEsigi(ad, varsayilan) {
  const v = Number(process.env[ad])
  return Number.isFinite(v) && v > 0 ? v : varsayilan
}
const UYARI_VARSAYILAN_MB = 1024
const DEVRET_VARSAYILAN_MB = 1536
const KAYIT_UYARI_MB_HAM = mbEsigi('VENTHUB_KAYIT_UYARI_MB', UYARI_VARSAYILAN_MB)
const KAYIT_DEVRET_MB_HAM = mbEsigi('VENTHUB_KAYIT_DEVRET_MB', DEVRET_VARSAYILAN_MB)
// Sıra bozuksa (devret ≤ uyarı) ikisi de varsayılana döner: ⛔ hiçbir zaman ⚠'dan önce çıkmaz.
const ESIKLER_TUTARLI = KAYIT_DEVRET_MB_HAM > KAYIT_UYARI_MB_HAM
const KAYIT_UYARI_MB = ESIKLER_TUTARLI ? KAYIT_UYARI_MB_HAM : UYARI_VARSAYILAN_MB
const KAYIT_DEVRET_MB = ESIKLER_TUTARLI ? KAYIT_DEVRET_MB_HAM : DEVRET_VARSAYILAN_MB

/**
 * GB yazımı: AŞAĞI yuvarlanır. Yoksa 1535 MB "1,5 GB" görünür ve "1,5 GB'ta devret" diyen satırla
 * çelişir; aşağı yuvarlayınca "1,5" ancak eşik aşılınca çıkar.
 */
function gbYaz(mb) {
  return (Math.floor((mb / 1024) * 10) / 10).toFixed(1).replace('.', ',')
}

/** Konuşma dosyasının boyutu (MB); yol yok/okunamıyorsa ya da dosya değilse null. Dosya açılmaz. */
function kayitBoyutuMb(kayitYolu) {
  if (!kayitYolu) return null
  try {
    const st = fs.statSync(kayitYolu)
    return st.isFile() ? st.size / (1024 * 1024) : null
  } catch {
    return null
  }
}

/** Boyuta göre istem satırı; ölçülemediyse null. */
function kayitSatiri(boyMb) {
  if (typeof boyMb !== 'number' || !Number.isFinite(boyMb) || boyMb < 0) return null
  if (boyMb >= KAYIT_DEVRET_MB) {
    return '⛔KAYIT: ' + gbYaz(boyMb) + ' GB — yeni oturuma DEVRET: konusma dosyasi ' + gbYaz(KAYIT_DEVRET_MB) + " GB'i asti, kancalar ve pencere yavaslar (10-09 olcumu)."
  }
  if (boyMb >= KAYIT_UYARI_MB) {
    return '⚠KAYIT: ' + gbYaz(boyMb) + ' GB — konusma dosyasi buyuyor; ' + gbYaz(KAYIT_DEVRET_MB) + " GB'ta yeni oturuma devret (devir belgesini simdiden hazirla)."
  }
  return 'KAYIT: ' + (boyMb < 1 ? '<1' : String(Math.floor(boyMb))) + ' MB'
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
// ARC-131: hüküm alanları YALNIZ ölçüldüğünde bulunur (eşik altı ve bulunamayan durum dosyası eski biçimi korur).
const HAZIRLIK_YOK = Object.freeze({})
const BOS_DURUM = Object.freeze({ durumDosyasi: null, durumBulundu: null, yarimIs: 'bilinmiyor', ...HAZIRLIK_YOK })

/**
 * ── COMPACT HAZIRLIK VERİSİ (ARC-31 madde 2, 10-05) ──
 * Kokpitin "Açık pencereler" satırı ≥%50'de pencerenin durum dosyası güncel mi / yarım iş var mı / hüküm ne satırını gösterir.
 * Durum dosyasını BULMA mantığı tek yerde kalır (precompact-durum-kapisi.cjs: kimlik, şerit adı, gün klasörleri); mod onu kopyalamaz.
 * Bulma ~300 ms sürer (ölçüldü 10-05), her istemde koşamaz: bulunan yol pencere dosyasında saklanır, bağlam %40'ı geçince
 * ve en çok 10 dakikada bir yeniden aranır. "Yarım iş" ifadesi dosyanın SON 24 KB'ından okunur (<1 ms).
 * Dosya içeriği ekrana ya da bağlama GİRMEZ: yalnız sabit sözlükten bir değer çıkar ('yok' | 'var' | 'bilinmiyor').
 */
const HAZIRLIK_ESIGI = 0.4
const DURUM_ARAMA_ARALIGI_MS = 10 * 60 * 1000
const DURUM_OKUMA_BAYT = 24 * 1024

/** Dosyadaki SON "yarım iş yok/var" ifadesi. Yoksa 'bilinmiyor'. Güvenli yön: belirsizlik "yok" demez. */
function yarimIsOku(metin) {
  const kucuk = String(metin).toLocaleLowerCase('tr')
  let son = null
  for (const m of kucuk.matchAll(/yar[ıi]m i[şs](?:im|lerim)?\s*[:=]?\s*(yok|var)(?![a-zçğıöşü])/g)) son = m[1]
  return son === 'yok' || son === 'var' ? son : 'bilinmiyor'
}

function sonBaytlar(yol, bayt) {
  const fd = fs.openSync(yol, 'r')
  try {
    const boy = fs.fstatSync(fd).size
    const baslangic = Math.max(0, boy - bayt)
    const tampon = Buffer.alloc(boy - baslangic)
    fs.readSync(fd, tampon, 0, tampon.length, baslangic)
    return tampon.toString('utf8')
  } finally {
    fs.closeSync(fd)
  }
}

/**
 * Pencere dosyasına yazılacak durum alanları. FAIL-OPEN: her hata BOS_DURUM'a (bilinmiyor) düşer, kancayı bozmaz.
 * `bul(sid, transcriptPath)` → { tam } | null; testte yerine konur.
 */
function pencereDurumOzeti(klasor, sid, transcriptPath, token, pencere, simdi = Date.now(), bul = null) {
  try {
    if (!SID_BICIMI.test(String(sid || ''))) return BOS_DURUM
    let onceki = {}
    try {
      onceki = JSON.parse(fs.readFileSync(path.join(klasor, String(sid).toLowerCase() + '.json'), 'utf8'))
    } catch {
      onceki = {}
    }
    let yol = typeof onceki.durumDosyasi === 'string' ? onceki.durumDosyasi : null
    let bulundu = typeof onceki.durumBulundu === 'number' ? onceki.durumBulundu : null
    if (yol !== null && !fs.existsSync(yol)) {
      yol = null
      bulundu = null
    }
    const oran = typeof token === 'number' && pencere > 0 ? token / pencere : 0
    const eskidi = bulundu === null || simdi - bulundu > DURUM_ARAMA_ARALIGI_MS
    if (oran >= HAZIRLIK_ESIGI && (yol === null || eskidi)) {
      const bulucu = bul || require(path.join(__dirname, 'precompact-durum-kapisi.cjs')).durumDosyasiBul
      const r = bulucu(String(sid).toLowerCase(), transcriptPath)
      yol = r && typeof r.tam === 'string' ? r.tam : null
      bulundu = simdi
    }
    if (yol === null) return { durumDosyasi: null, durumBulundu: bulundu, yarimIs: 'bilinmiyor', ...HAZIRLIK_YOK }
    const metin = sonBaytlar(yol, DURUM_OKUMA_BAYT)
    const yarimIs = yarimIsOku(metin)
    // ARC-131: hüküm ve /compact metni yalnız hazırlık eşiğinde (≥%40) üretilir; altında alanlar yazılmaz.
    if (oran < HAZIRLIK_ESIGI) return { durumDosyasi: yol, durumBulundu: bulundu, yarimIs, ...HAZIRLIK_YOK }
    const h = hazirlikHukmu(simdi - fs.statSync(yol).mtimeMs, yarimIs)
    return {
      durumDosyasi: yol,
      durumBulundu: bulundu,
      yarimIs,
      hazir: h.hazir,
      hazirNeden: h.neden,
      compactMetni: compactMetni(compactIcerigi(metin)),
    }
  } catch {
    return BOS_DURUM
  }
}

function pencereDosyasiYaz(klasor, sid, token, pencere, rol, simdi = new Date(), durum = BOS_DURUM, donusBildirilen = null) {
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
      // Compact hazırlığı (ARC-31 madde 2): kokpit ≥%50'de bu üç alandan "durum dosyası güncel mi / yarım iş / hüküm" satırını kurar.
      durumDosyasi: typeof durum.durumDosyasi === 'string' ? durum.durumDosyasi : null,
      durumBulundu: typeof durum.durumBulundu === 'number' ? durum.durumBulundu : null,
      yarimIs: durum.yarimIs === 'yok' || durum.yarimIs === 'var' ? durum.yarimIs : 'bilinmiyor',
    }
    // ARC-131: hüküm ve hazır /compact metni; kokpit HAZIR/DEĞİL satırını ve kopyalanabilir metni bundan kurar.
    // Alanlar yalnız ölçüldüyse yazılır (eşik altındaki pencere dosyası eski biçimini korur).
    if (typeof durum.hazir === 'boolean') {
      kayit.hazir = durum.hazir
      kayit.hazirNeden = typeof durum.hazirNeden === 'string' ? durum.hazirNeden : null
      kayit.compactMetni = typeof durum.compactMetni === 'string' ? durum.compactMetni : null
    }
    // Dönüş uyarısı bir sınır için bir kez çıksın diye bildirilen sınır kimliği dosyada kalır.
    if (typeof donusBildirilen === 'string' && donusBildirilen !== '') kayit.donusBildirilen = donusBildirilen
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
  kayitBoyutuMb,
  kayitSatiri,
  KAYIT_UYARI_MB,
  KAYIT_DEVRET_MB,
  pencereDosyasiYaz,
  pencereDurumOzeti,
  yarimIsOku,
  HAZIRLIK_ESIGI,
  DURUM_ARAMA_ARALIGI_MS,
  PENCERE_KLASORU,
  COMPACT_SONRASI,
  DOLUYOR,
  YAKIN,
  OKUMA_BAYT,
  HAZIRLIK_NOTU,
  compactIcerigi,
  compactMetni,
  hazirlikHukmu,
  hazirlikCumlesi,
  donusKontrolu,
  donusSatiri,
  donusBildirilenOku,
  HAZIR_YAS_DK,
}
