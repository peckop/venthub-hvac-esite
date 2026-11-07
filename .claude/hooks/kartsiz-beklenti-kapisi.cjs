#!/usr/bin/env node
// kartsiz-beklenti-kapisi — Stop kapısı (kart 0c0232db, 2026-10-04, Recep sözü):
// "bana onaya gelen bişey var ise ve bunun kartı yoksa bunun tespitini de yapıp yakalanması lazım.
//  bu bana yazıldığı anda da olabilir, bu sefer sistem kendisini düzeltir."
//
// OLAY: OPS Recep'e yapacağı adımları verdi, Kanban'da kart açmadı; kokpit "bekleyen yok" dedi.
// Recep'ten istenen şey KARTSIZ ise hiçbir yüzey (kokpit, hafta planı) onu göstermez ve unutulur.
//
// KURAL: son mesajda "Senden istenen / Senden beklenen / onayına sunuyorum / Evet de" kalıbı varsa
// her istenen maddenin sonunda kart numarası (OPS-61 gibi ya da tam kart kimliği) bulunmalı ve
// o kart Kanban'da AÇIK ve (sahibi Sen ya da etiket recep-bekliyor/karar-bekliyor) olmalıdır.
// Eksikse tur BLOKLANIR (exit 2); pencere kartı açıp mesajı yeniden yazar (sistem kendini düzeltir).
//
// YANLIŞ ALARM YOK (fail-open ama SESSİZ DEĞİL):
//  - Kanban okunamazsa tur geçer, durum dosyasına "kapı ölçemedi" (uyarı) yazılır (kokpit amber gösterir).
//  - Atlatma yalnız mesajda "Kartsız: <sebep>" satırıyla; sebep kayda düşer (kartsiz-atlatma.log).
//  - Döngü koruması: stop_hook_active ise bir daha bloklanmaz.
// Başka pencerenin Recep'e ilettiği istek: turdaki SendMessage çağrıları da aynı kalıp ve kuralla taranır
// (bir mesaj bir kez işaretlenir; düzeltme mesajı gönderildikten sonra eski mesaj yeniden bloklamaz).
//
// settings.json'a ekleme Recep'in sözüyle OPS tarafından yapılır; bu dosya tek başına etkisizdir.
'use strict'
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { kuyrukSatirlari } = require('./transkript-kuyrugu.cjs')

// Kanban kart ön ekleri (ölçüldü 2026-10-04: panolardaki başlık ön ekleri). Yeni departman ön eki → buraya.
// TSR/DIL/MRK/MVZ/STS 10-05: docs/standards/is-kayit-duzeni-standard.md §1 tablosu; eksikken bu departmanların kartı «bilinen kart değil» diye bloklanırdı.
const ONEKLER = ['OPS', 'ARC', 'HRT', 'URN', 'YTN', 'REC', 'ALT', 'ADM', 'KTL', 'SEO', 'EDG', 'BLG', 'TSR', 'DIL', 'MRK', 'MVZ', 'STS', 'TKP', 'I18', '3D']
const KART_NO = new RegExp('\\b(?:' + ONEKLER.join('|') + ')-\\d{1,5}\\b', 'g')
const KART_UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi

// ── ARC-95 (10-12): İKİNCİ DENETİM — Recep'e bağlanan kartın açıklaması "RECEP YETKİSİ: <gerekçe>" satırı taşır ──
// Olay: yetkisi zaten verilmiş iş tekrar tekrar Recep'e soru olarak geldi; kural yazılıydı ama kapı yoktu (karar 317 ailesi).
// Kural: mesajda istek olarak anılan ve Recep'e bağlı (Sen/Recep ya da recep-bekliyor/karar-bekliyor) her açık kart, açıklamasında bir
// satır "RECEP YETKİSİ: <gerekçe>" taşır; gerekçe YALNIZ aşağıdaki yedi sınıftan biridir (yedincisi ARC-142, 15 Ekim: dış kişiye
// Recep adına yazışma; OPS-155 AVenS belge isteği altı sınıfta karşılık bulamadan kırmızı aldı). Satır yoksa ya da gerekçe liste dışıysa KIRMIZI.
// Cetvel: docs/standards/is-kayit-duzeni-standard.md §RECEP YETKİSİ. Kanban betiği ikinci kez (--detay) çağrılır; okunamazsa fail-open ama sessiz değil.
// Satır başı çapası biçim işaretlerini tanır (OPS 10-12 okuması): düz, "**RECEP YETKİSİ:** x", "- RECEP YETKİSİ: x", "> RECEP YETKİSİ: x".
// Başında madde/alıntı işareti (> - * +), kalın/altı çizili (** __) ve iki noktanın iki yanında kalın kapanışı serbesttir.
const YETKI_SATIRI = /^[ \t]*(?:[>\-*+][ \t]*)*(?:\*\*|__)?[ \t]*RECEP[ \t]+YETK[İIiı]S[İIiı][ \t]*(?:\*\*|__)?[ \t]*:[ \t]*(?:\*\*|__)?[ \t]*(\S.*)$/gim
const YETKI_GEREKCELERI =
  'canlı yazım · migration birleştirme · gerçek para · geri alınamaz silme · yeni görünüm/iddia/yapı kararı · hesap/ayar dosyası · dış kişiye Recep adına yazışma'
// Karşılaştırma ASCII'ye indirgenmiş metinle yapılır (ı/İ/ş/ğ/ü/ö/ç yazımı ayrımı bozmasın); gerekçenin devamı (" — ayrıntı") serbesttir.
const asciiKucuk = (s) =>
  String(s).toLocaleLowerCase('tr').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ç/g, 'c')
const YETKI_KALIPLARI = [
  // "canlı yazım", "canlı veritabanı yazımı", "canlı veritabanına yazım" (filo-ortak.md adlandırması).
  /^canli\s+(?:veritaban[a-z]*\s+)?(?:yazim[a-z]*|yazma)\b/,
  /^migration\s+birlestirme\b/,
  // "migration'lı PR birleştirme", "migration içeren dalın merge'ü" (filo-ortak.md: "Migration'lı PR birleştirme" / "migration içeren PR").
  /^migration['’`]?li\s+(?:pr\s+)?birlestirme\b/,
  /^migration\s+iceren\s+(?:dal|pr|branch)[a-z]*\s+(?:merge|birlestirme)/,
  /^gercek\s+para\b/,
  /^geri\s+alinamaz\s+silme\b/,
  /^yeni\s+(?:gorunum|iddia|yapi)(?:\s*\/\s*(?:gorunum|iddia|yapi))*\s+karari\b/,
  /^(?:hesap|ayar)(?:\s*\/\s*(?:hesap|ayar))*\s+dosyasi\b/,
  // ARC-142: "dış kişiye Recep adına yazışma", "tedarikçiye/dış kişiye Recep adına yazışma", "üreticiye Recep adına belge isteği".
  // "Recep adına" ZORUNLU: yalnız "tedarikçi hakkında soru" gibi ifadeler liste dışı kalır (kullanıcı adına mesaj göndermek açık izin ister).
  /^(?:dis\s+kisi|tedarikci|uretici|kurum|firma)[a-z]*(?:\s*\/\s*(?:dis\s+kisi|tedarikci|uretici|kurum|firma)[a-z]*)*\s+recep\s+adina\s+(?:yazisma|mesaj|e-?posta|belge\s+istegi)/,
]

/** Kartın açıklamasından: { durum: 'yok' | 'liste-disi' | 'tamam', gerekce }. Birden çok satırda biri geçerliyse 'tamam'. */
function yetkiDegerlendir(aciklama) {
  const gerekceler = []
  for (const m of String(aciklama || '').matchAll(YETKI_SATIRI)) gerekceler.push(m[1].trim())
  if (gerekceler.length === 0) return { durum: 'yok', gerekce: '' }
  const gecen = gerekceler.find((g) => YETKI_KALIPLARI.some((k) => k.test(asciiKucuk(g).replace(/^[\s"'«(\-–—]+/, ''))))
  if (gecen !== undefined) return { durum: 'tamam', gerekce: gecen }
  return { durum: 'liste-disi', gerekce: gerekceler[0] }
}

// Başlık: satır başında "Senden istenen(ler)/beklenen(ler)" (kalın, başlık işaretli ya da düz).
const BASLIK = /^\s*(?:#{1,6}\s*)?(?:[*_]{1,2})?\s*senden\s+(?:istenen|beklenen)(?:ler)?\b[\s*_:.\-–—]*(.*)$/i
// Tek satırlık kalıplar: kendisi bir istektir, aynı satırda kart no gerekir.
const SATIR_KALIBI = /(onay[ıi]na sunuyorum|\bevet de\b)/i
const OLUMSUZ = /\b(yok|istemiyor|gerekmiyor|beklenmiyor|bekleyen yok|bir şey yok|bir sey yok)\b/i
// Giriş satırı: iki nokta ile biten ya da yalnız parantezli not ("(iki adım):") bir istek değil, ardından gelenleri bağlar.
const GIRIS = /(?::\s*$|^\s*\([^)]*\)\s*:?\s*$)/
// Muaf: compact hazırlığı Recep output style'ında kendi kalıbı olan ritüeldir (elle /compact; Recep'in kendi isteği), kart gerektirmez.
const MUAF = /compact/i
const ATLATMA = /^\s*Kartsız:\s*(\S.{4,})$/im
const MADDE = /^\s*(?:[-*•]|\d+[.)]|\*\*\d+[.)]?\*\*)\s+/
const BASLIK_BENZERI = /^\s*(?:#{1,6}\s|\*\*[^*\n]{1,60}\*\*\s*$)/

// ── ARC-43 genişletmesi (10-05): kapı OPS'un GERÇEK karar biçimlerine kördü ──
// Ölçüm: "**285.** … Önerim evet", "bu pencerede evet demen yeterli", "| No | Karar | Önerim |" tablosu → 0 madde; sabah 285 ve 286
// kartsız sorulup geçti. Recep output style'ının kendi karar biçimi bunlardır, yani kapı üslubun öngördüğü biçime kör kalmıştı.
// Numaralı karar maddesi: satır başında kalın karar numarası ("**285.** …", "**Karar 285** …") VE aynı satırda öneri/evet/hayır/onay sözü.
const KARAR_MADDESI = /^\s*(?:[-*•]\s+)?\*\*\s*(?:karar\s+)?\d{2,4}\s*[.)]?\s*\*\*\s*[.:)\-–—]?\s*\S/i
const KARAR_KELIMESI = /(önerim|\bevet\b|\bhay[ıi]r\b|\bonay)/i
// Doğrudan istek ifadeleri: bir şey yapmasını/demesini RECEP'ten bekler. İkinci kişi ŞARTTIR: "Ops'un onayını bekliyorum" Recep'e bir şey
// sormaz (ölçüm 10-05: üçüncü kişi hâli 81.745 geçmiş mesajda gürültünün çoğuydu); "senin onayını bekliyor", "onayın gerekiyor", "demen yeterli" sorar.
const ISTEK_IFADESI = /(demen\s+(?:yeterli|gerek(?:iyor|li)?|lazım)|evet\s+demen|hay[ıi]r\s+demen|karar\s+vermen|\bonay[ıi]n\s+(?:gerek|laz)|\bsenin\s+(?:[^\s.,;:|]+\s+){0,3}?(?:onay|karar)[a-zçğıöşü]*\s+(?:bekli|gerek|laz))/i
// Bitmiş iş anlatımı istek değildir: "**284.** evet verildi, uygulandı".
// \b Türkçe harflerde (ı ü ö ş ç ğ) kelime sınırı saymaz: «alındı», «kapandı» kaçıyordu → yan yana harf yok diye ölçülür.
const BITMIS = /(?<![a-zçğıöşü])(?:verildi|verdin|verdi|dedin|dediğin|uygulandı|uyguladım|alındı|kapandı|kapattım|işlendi|yapıldı|birleşti|tamamlandı)(?![a-zçğıöşü])/i
// Tırnak, «» ve ters tırnak içi alıntıdır, istek değildir (örnek ifadeyi anan satır Recep'ten bir şey istemez).
const tirnaksiz = (satir) => String(satir).replace(/«[^»]*»|"[^"]*"|“[^”]*”|`[^`]*`/g, ' ')
const SEPARATOR = /^\s*\|[\s:|-]+\|\s*$/

/** Tablo hücrelerini ayırır: "| a | b |" → ['a','b']. */
function hucreler(satir) {
  return String(satir).trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((h) => h.trim())
}

/**
 * "Önerim" sütunlu tablo (karar tablosu ya da tek tablo): Önerim hücresi DOLU (boş ya da "—" değil) her veri satırı bir istektir.
 * Karar beklemeyen satırda Önerim boş/"—" olur (output style), o satır istek sayılmaz.
 * Dönüş: { maddeler: [{metin}], sonSatir } — sonSatir tablonun son satırının dizinidir.
 */
function tablodanMaddeler(satirlar, bas) {
  const baslik = hucreler(satirlar[bas])
  const oneriSutunu = baslik.findIndex((h) => /^önerim$/i.test(h.replace(/\*/g, '')))
  if (oneriSutunu < 0 || !SEPARATOR.test(satirlar[bas + 1] || '')) return null
  // Durum sütunu varsa istek yalnız "Onayında" satırıdır (output style: Onayında = Recep'in kararını bekliyor); eski tablolar her satırda
  // Önerim doldurmuştu, durumu Sürüyor/Bitti olan satır Recep'ten bir şey istemez. Durum sütunu yoksa (karar tablosu) Önerim dolu satır istektir.
  const durumSutunu = baslik.findIndex((h) => /^durum$/i.test(h.replace(/\*/g, '')))
  const maddeler = []
  let k = bas + 2
  for (; k < satirlar.length && /^\s*\|/.test(satirlar[k]); k++) {
    const h = hucreler(satirlar[k])
    const oneri = (h[oneriSutunu] || '').replace(/\*/g, '').trim()
    if (oneri === '' || /^[—–\-]+$/.test(oneri)) continue
    if (durumSutunu >= 0 && !/onayında/.test((h[durumSutunu] || '').replace(/\*/g, '').trim().toLocaleLowerCase('tr'))) continue
    if (BITMIS.test(satirlar[k]) || MUAF.test(satirlar[k])) continue
    maddeler.push({ metin: satirlar[k].trim() })
  }
  return { maddeler, sonSatir: k - 1 }
}

function kartBaslari(metin) {
  const bulunan = new Set()
  for (const m of String(metin).matchAll(KART_NO)) bulunan.add(m[0])
  for (const m of String(metin).matchAll(KART_UUID)) bulunan.add(m[0].toLowerCase())
  return [...bulunan]
}

/** Mesajdan "Recep'ten istenen" maddelerini çıkarır. Dönüş: [{ metin }] (bölüm yoksa ya da "yok" ise boş). */
function maddeleriCikar(metin) {
  const satirlar = String(metin).split('\n')
  const maddeler = []
  for (let i = 0; i < satirlar.length; i++) {
    const satir = satirlar[i]
    const b = BASLIK.exec(satir)
    if (b) {
      const kalan = (b[1] || '').replace(/\*+$/g, '').trim()
      // Başlık satırının kalanı da bir madde olabilir ("Senden beklenen: Design penceresine bak (kart OPS-61).").
      if (kalan !== '' && !OLUMSUZ.test(kalan) && !GIRIS.test(kalan) && !MUAF.test(kalan)) maddeler.push({ metin: kalan })
      let j = i + 1
      let sonMadde = null
      for (; j < satirlar.length; j++) {
        const s = satirlar[j]
        if (s.trim() === '') {
          // Boşluktan sonra madde gelmiyorsa bölüm biter.
          let k = j + 1
          while (k < satirlar.length && satirlar[k].trim() === '') k++
          if (k >= satirlar.length || !MADDE.test(satirlar[k])) break
          continue
        }
        if (BASLIK.test(s) || BASLIK_BENZERI.test(s)) break
        if (/^\s*\|[\s:|-]+\|\s*$/.test(s)) continue
        if (MADDE.test(s)) {
          sonMadde = { metin: s.replace(MADDE, '').trim() }
          if (!MUAF.test(sonMadde.metin)) maddeler.push(sonMadde)
        } else if (sonMadde !== null && /^\s{2,}\S/.test(s)) {
          sonMadde.metin += ' ' + s.trim()
        } else if (GIRIS.test(s) && sonMadde === null) {
          // "(iki adım):" gibi giriş satırı bir istek değil, ardından gelen maddeleri bağlar.
          continue
        } else if (!OLUMSUZ.test(s) && !MUAF.test(s)) {
          sonMadde = { metin: s.trim() }
          maddeler.push(sonMadde)
        }
      }
      i = j - 1
      continue
    }
    if (/^\s*\|/.test(satir)) {
      const t = tablodanMaddeler(satirlar, i)
      if (t !== null) {
        maddeler.push(...t.maddeler)
        i = t.sonSatir
        continue
      }
    }
    if (SATIR_KALIBI.test(satir)) maddeler.push({ metin: satir.trim() })
    else if (KARAR_MADDESI.test(satir) && KARAR_KELIMESI.test(tirnaksiz(satir)) && !BITMIS.test(satir) && !MUAF.test(satir)) maddeler.push({ metin: satir.trim() })
    else if (ISTEK_IFADESI.test(tirnaksiz(satir)) && !OLUMSUZ.test(satir) && !BITMIS.test(satir) && !MUAF.test(satir)) maddeler.push({ metin: satir.trim() })
  }
  return maddeler
}

/**
 * Karar: { durum: 'temiz' | 'atlatildi' | 'blok' | 'olculemedi', sorunlar: [...], kartlar: [...] }
 * `kartlariDogrula(kartlar)` → { olculemedi: string } | { gecerli: Set<string> } (enjekte edilir; testlenebilir).
 */
function degerlendir(metin, kartlariDogrula) {
  const maddeler = maddeleriCikar(metin)
  if (maddeler.length === 0) return { durum: 'temiz', sorunlar: [], kartlar: [] }

  const atlat = ATLATMA.exec(String(metin))
  if (atlat) return { durum: 'atlatildi', sorunlar: [], kartlar: [], atlatmaSebebi: atlat[1].trim() }

  const sorunlar = []
  const tumKartlar = []
  for (const m of maddeler) {
    const kartlar = kartBaslari(m.metin)
    if (kartlar.length === 0) sorunlar.push('kartsız madde: "' + m.metin.slice(0, 70) + '"')
    tumKartlar.push(...kartlar)
  }
  const benzersiz = [...new Set(tumKartlar)]
  if (benzersiz.length > 0) {
    const d = kartlariDogrula(benzersiz)
    if (d.olculemedi) {
      return { durum: sorunlar.length > 0 ? 'blok' : 'olculemedi', sorunlar, kartlar: benzersiz, olculemedi: d.olculemedi }
    }
    for (const k of benzersiz) {
      if (!d.gecerli.has(k)) {
        sorunlar.push('kart ' + k + " yok, kapalı ya da Recep'e bağlı değil (sahibi Sen ya da etiket recep-bekliyor/karar-bekliyor olmalı)")
      }
    }
    // ARC-95: ikinci denetim yalnız birinci denetimi geçen (açık ve Recep'e bağlı) kartlara uygulanır; Recep'e bağlı olmayan kart etkilenmez.
    // `yetkiler` yoksa (enjekte edilen eski doğrulayıcı) ikinci denetim yapılmaz.
    if (d.yetkiler instanceof Map) {
      for (const k of benzersiz) {
        if (!d.gecerli.has(k)) continue
        const y = d.yetkiler.get(k) || d.yetkiler.get(String(k).toLowerCase())
        if (y === undefined) continue // ayrıntısı okunamayan kart: aşağıdaki yetkiOlculemedi notu görünür kılar
        if (y.durum === 'yok') {
          sorunlar.push(
            'kart ' + k + ': "RECEP YETKİSİ: <gerekçe>" satırı yok — bu işin yetkisi zaten verilmiş, Recep\'e SORMA, yap; ' +
              "gerçekten Recep'in kararıysa kartın açıklamasına gerekçeyi yaz (" + YETKI_GEREKCELERI + ')',
          )
        } else if (y.durum === 'liste-disi') {
          sorunlar.push('kart ' + k + ': RECEP YETKİSİ gerekçesi listede yok ("' + y.gerekce.slice(0, 50) + '") — izinli: ' + YETKI_GEREKCELERI)
        }
      }
    }
    // Ayrıntı okuması çöktüyse `yetkiler` hiç gelmez: denetim SESSİZCE atlanmaz, ölçülemedi diye görünür kılınır (fail-open, sessiz değil).
    if (sorunlar.length === 0 && d.yetkiOlculemedi) {
      return { durum: 'olculemedi', sorunlar, kartlar: benzersiz, olculemedi: 'RECEP YETKİSİ denetimi ölçülemedi: ' + d.yetkiOlculemedi }
    }
  }
  return { durum: sorunlar.length > 0 ? 'blok' : 'temiz', sorunlar, kartlar: benzersiz }
}

function kanbanBetigi() {
  if (process.env.KARTSIZ_KAPI_KANBAN) return process.env.KARTSIZ_KAPI_KANBAN
  return path.resolve(__dirname, '..', '..', 'scripts', 'board', 'kanban-anlik.cjs')
}

/** Tek çağrıyla bütün kartları doğrular. Okunamazsa { olculemedi }. */
function kanbandanDogrula(kartlar) {
  const arg = [kanbanBetigi(), '--kisa']
  for (const k of kartlar) arg.push('--id', k)
  const r = spawnSync(process.execPath, arg, { encoding: 'utf8', timeout: 8000, maxBuffer: 8 * 1024 * 1024 })
  if (r.error || r.status !== 0) {
    return { olculemedi: 'Kanban betiği çalışmadı (' + (r.error ? r.error.code || r.error.message : 'çıkış ' + r.status) + ')' }
  }
  let govde
  try {
    govde = JSON.parse(String(r.stdout).trim())
  } catch {
    return { olculemedi: 'Kanban cevabı çözülemedi' }
  }
  if (!govde || govde.ok === false || !Array.isArray(govde.tasks)) {
    return { olculemedi: 'Kanban okunamadı' + (govde && govde.hata ? ': ' + String(govde.hata).slice(0, 80) : '') }
  }
  const gecerli = new Set()
  for (const t of govde.tasks) {
    const task = t && t.task
    if (!task) continue
    if (task.status === 'completed' || task.status === 'archived' || task.status === 'failed' || task.columnId === 'done') continue
    const etiketler = (task.labels || []).map((l) => String(l).toLowerCase())
    // "Sen" kokpit/Kanban'daki Recep takma adıdır; ARC-95: atananı doğrudan "Recep" olan kart da Recep'e bağlıdır.
    const sen = ['sen', 'recep'].includes(String(task.assignee || '').trim().toLowerCase())
    if (!(sen || etiketler.includes('recep-bekliyor') || etiketler.includes('karar-bekliyor'))) continue
    const no = (String(task.title || '').match(/^([A-ZÇĞİÖŞÜ]+-\d+)/) || [])[1]
    if (no) gecerli.add(no)
    gecerli.add(String(task.id).toLowerCase())
  }

  // ARC-95 ikinci denetim: Recep'e bağlı kartların açıklaması TAM okunur (--detay; listede açıklama 200 karakterde kesilir).
  const yetkiKartlari = kartlar.filter((k) => gecerli.has(k) || gecerli.has(String(k).toLowerCase()))
  if (yetkiKartlari.length === 0) return { gecerli }
  const arg2 = [kanbanBetigi(), '--detay']
  for (const k of yetkiKartlari) arg2.push('--id', k)
  const r2 = spawnSync(process.execPath, arg2, { encoding: 'utf8', timeout: 8000, maxBuffer: 8 * 1024 * 1024 })
  if (r2.error || r2.status !== 0) {
    return { gecerli, yetkiOlculemedi: 'ayrıntı okuması çalışmadı (' + (r2.error ? r2.error.code || r2.error.message : 'çıkış ' + r2.status) + ')' }
  }
  let govde2
  try {
    govde2 = JSON.parse(String(r2.stdout).trim())
  } catch {
    return { gecerli, yetkiOlculemedi: 'ayrıntı cevabı çözülemedi' }
  }
  if (!govde2 || govde2.ok === false || !Array.isArray(govde2.tasks)) {
    return { gecerli, yetkiOlculemedi: 'ayrıntı okunamadı' + (govde2 && govde2.hata ? ': ' + String(govde2.hata).slice(0, 80) : '') }
  }
  const yetkiler = new Map()
  let aciklamasiz = 0
  for (const t of govde2.tasks) {
    const task = t && t.task
    if (!task) continue
    if (typeof task.description !== 'string') {
      aciklamasiz++
      continue
    }
    const y = yetkiDegerlendir(task.description)
    const no = (String(task.title || '').match(/^([A-ZÇĞİÖŞÜ]+-\d+)/) || [])[1]
    if (no) yetkiler.set(no, y)
    yetkiler.set(String(task.id).toLowerCase(), y)
  }
  return {
    gecerli,
    yetkiler,
    ...(aciklamasiz > 0 ? { yetkiOlculemedi: aciklamasiz + ' kartın açıklaması okunamadı' } : {}),
  }
}

function durumDizini() {
  return process.env.KARTSIZ_KAPI_DURUM_DIZINI || path.join(os.homedir(), '.claude', 'mod-durum')
}

function saatYaz(d) {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

/** Modlar paneli / kokpit için kapının anlık durumu. Yazılamazsa sessizce geçer (kapı bunun yüzünden bozulmaz). */
function durumYaz(seviye, ozet) {
  try {
    const dizin = durumDizini()
    fs.mkdirSync(dizin, { recursive: true })
    fs.writeFileSync(path.join(dizin, 'kartsiz-kapi.json'), JSON.stringify({ ozet, seviye, saat: saatYaz(new Date()) }))
  } catch {
    /* durum yazılamadı: kapı yine çalışır */
  }
}

function atlatmaKaydet(sebep, oturum) {
  try {
    const dizin = durumDizini()
    fs.mkdirSync(dizin, { recursive: true })
    fs.appendFileSync(path.join(dizin, 'kartsiz-atlatma.log'), new Date().toISOString() + ' ' + oturum + ' ' + sebep.replace(/\s+/g, ' ') + '\n')
  } catch {
    /* kayıt yazılamadı */
  }
}

function gorulenYolu(oturum) {
  return path.join(os.tmpdir(), 'kartsiz-kapi-gorulen-' + String(oturum).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) + '.json')
}
function gorulenOku(oturum) {
  try {
    return new Set(JSON.parse(fs.readFileSync(gorulenYolu(oturum), 'utf8')))
  } catch {
    return new Set()
  }
}
function gorulenYaz(oturum, set) {
  try {
    fs.writeFileSync(gorulenYolu(oturum), JSON.stringify([...set].slice(-200)))
  } catch {
    /* yazılamadı */
  }
}

function ozetKodu(metin) {
  return crypto.createHash('sha1').update(String(metin)).digest('hex').slice(0, 16)
}

function insanMesaji(k) {
  if (k.type !== 'user' || k.isMeta) return false
  const c = k.message && k.message.content
  if (typeof c === 'string') return !c.startsWith('<local-command-caveat>') && !c.includes('[SYSTEM NOTIFICATION')
  if (Array.isArray(c)) return c.some((b) => b.type === 'text') && !c.some((b) => b.type === 'tool_result')
  return false
}

/** Transkript kuyruğundan: turun son asistan metni + turdaki SendMessage metinleri. */
function turuOku(kayitlar) {
  let sonInsan = -1
  kayitlar.forEach((k, i) => {
    if (insanMesaji(k)) sonInsan = i
  })
  if (sonInsan === -1) return null
  const asistanlar = kayitlar.slice(sonInsan + 1).filter((k) => k.type === 'assistant')
  if (asistanlar.length === 0) return null
  const sonIcerik = (asistanlar[asistanlar.length - 1].message && asistanlar[asistanlar.length - 1].message.content) || []
  const sonBlok = Array.isArray(sonIcerik) ? sonIcerik[sonIcerik.length - 1] : null
  const sonMetin = sonBlok && sonBlok.type === 'text' ? String(sonBlok.text || '') : ''
  const mesajlar = []
  for (const a of asistanlar) {
    const ic = (a.message && a.message.content) || []
    if (!Array.isArray(ic)) continue
    for (const b of ic) {
      if (b.type === 'tool_use' && b.name === 'SendMessage' && b.input && typeof b.input.message === 'string') mesajlar.push(b.input.message)
    }
  }
  const si = kayitlar[sonInsan]
  const insan = ozetKodu((si.uuid || '') + '|' + (si.timestamp || '') + '|' + JSON.stringify(si.message && si.message.content))
  return { sonMetin, mesajlar, insan }
}

// ── ARC-265 (7 Kasım): kırmızıda cevabı YENİDEN YAZDIRMA ──
// Olay (KTL-82 mesajı, OPS ölçümü): kapı "mesajı yeniden yaz" deyince pencere aynı cevabı ikinci kez yazıyor, Recep aynı metni iki kez görüyordu.
// Çözüm: kırmızıda bekleyen durum kaydedilir; pencere yalnız TEK KISA SATIR yazar ("(kart X)" ya da "Kartsız: <sebep>"), kanca satırı
// Kanban'dan doğrular. Kapı GEVŞEMEZ: satır yoksa/geçersizse kırmızı kalır (en çok EK_SATIR_DENEME tur; sonra fail-open ama sessiz değil).
const EK_SATIR_AZAMI = 500 // bundan uzun cevap "ek satır" değil, yeni mesajdır: normal denetimden geçer
const EK_SATIR_DENEME = 3
const BEKLEYEN_OMUR_MS = 60 * 60 * 1000

/** Ek satırı değerlendirir. Dönüş: { durum: 'uzun' | 'atlatildi' | 'temiz' | 'blok' | 'olculemedi', sorunlar, atlatmaSebebi? }. */
function ekSatirKarar(metin, kartlariDogrula) {
  const t = String(metin || '').trim()
  if (t.length > EK_SATIR_AZAMI) return { durum: 'uzun', sorunlar: [] }
  const atlat = ATLATMA.exec(t)
  if (atlat) return { durum: 'atlatildi', sorunlar: [], atlatmaSebebi: atlat[1].trim() }
  const kartlar = kartBaslari(t)
  if (kartlar.length === 0) return { durum: 'blok', sorunlar: ['ek satır yok: "(kart OPS-61)" ya da "Kartsız: <sebep>" yazılmadı'] }
  // Yalnız kart belirteçleri doğrulanır (satırdaki serbest metin "yok" gibi sözlerle denetimi atlatamasın).
  // Parantezsiz: "(kart X)" tek başına GIRIS kalıbına takılıp maddesiz sayılır ve doğrulamayı atlardı.
  const k = degerlendir('Senden istenen: kart ' + kartlar.join(' '), kartlariDogrula)
  return { durum: k.durum, sorunlar: k.sorunlar, olculemedi: k.olculemedi }
}

function bekleyenDizini() {
  return process.env.KARTSIZ_KAPI_BEKLEYEN_DIZINI || os.tmpdir()
}
function bekleyenYolu(oturum) {
  return path.join(bekleyenDizini(), 'kartsiz-kapi-bekleyen-' + String(oturum).replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) + '.json')
}
function bekleyenOku(oturum, simdi = Date.now()) {
  try {
    const b = JSON.parse(fs.readFileSync(bekleyenYolu(oturum), 'utf8'))
    if (!b || typeof b.zaman !== 'number' || simdi - b.zaman > BEKLEYEN_OMUR_MS) return null
    return { zaman: b.zaman, deneme: Number(b.deneme) || 1, insan: String(b.insan || '') }
  } catch {
    return null
  }
}
/** Dönüş: yazıldı mı. `insan` = kırmızıyı doğuran insan mesajının kimliği (yeni insan mesajında kayıt düşer). */
function bekleyenYaz(oturum, deneme, insan, simdi = Date.now()) {
  try {
    fs.writeFileSync(bekleyenYolu(oturum), JSON.stringify({ zaman: simdi, deneme, insan }))
    return true
  } catch {
    return false
  }
}
function bekleyenSil(oturum) {
  try {
    fs.unlinkSync(bekleyenYolu(oturum))
  } catch {
    /* yok */
  }
}

function engelMetni(sorunlar, kaynak) {
  return (
    "[kartsiz-beklenti-kapisi] KIRMIZI: Recep'ten istenen şey KARTSIZ (" + kaynak + '). ' +
    sorunlar.join(' · ') + '. ' +
    "Şimdi: Kanban'da (kendi panonda) kartı aç (atanan Sen ya da etiket recep-bekliyor; karardıysa karar-bekliyor). " +
    'Mesajı YENİDEN YAZMA (Recep aynı cevabı iki kez görmesin): yalnız TEK KISA SATIR yaz — "(kart OPS-61)" gibi kart numarası ' +
    '(kanca Kanban\'dan doğrular) ya da gerçekten kart gerekmiyorsa "Kartsız: <sebep>" (sebep kayda düşer).' +
    (sorunlar.some((s) => s.includes('RECEP YETKİSİ'))
      ? ' RECEP YETKİSİ sorunu: yetkisi verilmiş işi Recep\'e soru olarak getirme, işi yap; kartı gerçekten Recep\'e bağlıysa açıklamaya ' +
        '"RECEP YETKİSİ: <gerekçe>" satırını ekle (docs/standards/is-kayit-duzeni-standard.md §RECEP YETKİSİ).'
      : '')
  )
}

function main() {
  let raw = ''
  process.stdin.on('data', (c) => {
    raw += c
  })
  process.stdin.on('end', () => {
    if (!String(raw).trim()) {
      process.stderr.write('[kartsiz-beklenti-kapisi] stdin okunamadi (bos), karisilmadi\n')
      process.exit(0)
    }
    let input
    try {
      input = JSON.parse(raw)
    } catch {
      process.stderr.write('[kartsiz-beklenti-kapisi] stdin okunamadi (bozuk JSON), karisilmadi\n')
      process.exit(0)
    }
    const tp = input.transcript_path
    if (!tp || !fs.existsSync(tp)) process.exit(0)
    const oturum = input.session_id || 'x'

    // ARC-83: kayıt BÜTÜN okunmaz; 1,78 GB'lık konuşma dosyasında readFileSync dizge sınırını aşıp kancayı çökertiyordu.
    let satirlar
    try {
      satirlar = kuyrukSatirlari(tp)
    } catch (e) {
      // §9.7: okunamayan kayıt → fail-OPEN ama SESSİZ DEĞİL.
      process.stderr.write(
        '[kartsiz-beklenti-kapisi] transkript okunamadi (' + ((e && e.code) || (e && e.message) || 'bilinmeyen') + '), karisilmadi\n',
      )
      process.exit(0)
    }
    if (satirlar.length === 0) {
      if (fs.statSync(tp).size > 0) {
        process.stderr.write('[kartsiz-beklenti-kapisi] transkript kuyrugunda tam satir yok (tek satir pencereyi asiyor), karisilmadi\n')
      }
      process.exit(0)
    }
    const kayitlar = []
    for (const s of satirlar) {
      try {
        kayitlar.push(JSON.parse(s))
      } catch {
        /* yut */
      }
    }
    const tur = turuOku(kayitlar)
    if (!tur) process.exit(0)

    // ARC-265: önceki tur kırmızı verdiyse bu turun cevabı ek satır olarak değerlendirilir (yeniden yazım istenmez).
    // Denetçi bulgusu 2: bekleyen kayıt YALNIZ kırmızıyı doğuran insan mesajının devam turunda geçerlidir; yeni insan mesajı gelince düşer
    // (ilgisiz kısa cevap gereksiz bloklanmasın).
    let ekTuru = false // bu tur kırmızıdan sonraki devam turu mu (gerçek devam turunda stop_hook_active=true gelir; denetçi turu 2)
    let oncekiDeneme = 0
    let bekleyen = bekleyenOku(oturum)
    if (bekleyen && bekleyen.insan !== tur.insan) {
      bekleyenSil(oturum)
      bekleyen = null
    }
    if (bekleyen) {
      const ek = ekSatirKarar(tur.sonMetin, kanbandanDogrula)
      if (ek.durum === 'blok') {
        // ek satır yok ya da geçersiz → kırmızı kalır (sınırlı sayıda tur; sonra fail-open, kalıcı log satırıyla).
        if (bekleyen.deneme >= EK_SATIR_DENEME) {
          bekleyenSil(oturum)
          atlatmaKaydet('EK-SATIR-DOGRULANAMADI: ' + EK_SATIR_DENEME + ' denemede kart/Kartsız satiri gelmedi, tur gecti', oturum)
          durumYaz('uyari', 'kartsız istek ek satırla kapanmadı (' + EK_SATIR_DENEME + ' deneme)')
          process.stderr.write('[kartsiz-beklenti-kapisi] ek satir ' + EK_SATIR_DENEME + ' denemede dogrulanamadi, tur gecti (log: kartsiz-atlatma.log)\n')
          process.exit(0)
        }
        bekleyenYaz(oturum, bekleyen.deneme + 1, tur.insan)
        durumYaz('uyari', 'ek satır geçersiz, kırmızı kaldı')
        process.stderr.write(engelMetni(ek.sorunlar, 'ek satır') + '\n')
        process.exit(2)
      }
      // uzun / atlatildi / temiz / olculemedi: bekleyen kapanır; AMA tur aşağıdaki NORMAL denetimden de geçer (denetçi bulgusu 1b/1c:
      // ek satırla birlikte yazılmış yeni kartsız istek ya da SendMessage geçmesin).
      bekleyenSil(oturum)
      if (ek.durum === 'atlatildi') atlatmaKaydet(ek.atlatmaSebebi, oturum)
      ekTuru = true
      oncekiDeneme = bekleyen.deneme
    }

    const gorulen = gorulenOku(oturum)
    const adaylar = [{ metin: tur.sonMetin, kaynak: 'son mesaj', kod: null }]
    for (const m of tur.mesajlar) adaylar.push({ metin: m, kaynak: 'başka pencereye giden mesaj', kod: ozetKodu(m) })

    const sorunlar = []
    let kaynak = ''
    let olculemedi = null
    for (const a of adaylar) {
      if (a.kod && gorulen.has(a.kod)) continue
      const k = degerlendir(a.metin, kanbandanDogrula)
      if (k.durum === 'atlatildi') {
        atlatmaKaydet(k.atlatmaSebebi, oturum)
        continue
      }
      if (k.olculemedi) olculemedi = k.olculemedi
      if (k.durum === 'blok') {
        sorunlar.push(...k.sorunlar)
        kaynak = kaynak || a.kaynak
        if (a.kod) gorulen.add(a.kod)
      }
    }
    gorulenYaz(oturum, gorulen)

    if (sorunlar.length > 0) {
      durumYaz('uyari', 'son tur kartsız istek yüzünden bloklandı')
      // Döngü koruması: kapı zaten bir kez bloklamışsa bu tur geçer. (Ek satır turları yukarıda kendi sayacıyla sınırlıdır.)
      // Ek turu (denetçi turu 2): kırmızıdan sonraki devam turunda stop_hook_active=true gelir; koruma burada kendi sayacıyla (EK_SATIR_DENEME) işler,
      // yoksa ek satırla birlikte yazılan yeni kartsız istek bayrak yüzünden geçerdi.
      if (ekTuru && oncekiDeneme >= EK_SATIR_DENEME) {
        atlatmaKaydet('EK-SATIR-DOGRULANAMADI: ek turda yeni kartsiz istek ' + EK_SATIR_DENEME + ' denemede kapanmadi, tur gecti', oturum)
        process.stderr.write('[kartsiz-beklenti-kapisi] ek tur ' + EK_SATIR_DENEME + ' denemede kapanmadi, tur gecti (log: kartsiz-atlatma.log)\n')
        process.exit(0)
      }
      if (!ekTuru && input.stop_hook_active) {
        process.stderr.write('[kartsiz-beklenti-kapisi] stop_hook_active: ikinci kez bloklanmadi\n')
        process.exit(0)
      }
      // ARC-265: devam turunda ek satır beklenir. Yazılamazsa kırmızı yine verilir ama ek satır akışı çalışmaz: görünür kıl (bulgu 4).
      if (!bekleyenYaz(oturum, ekTuru ? oncekiDeneme + 1 : 1, tur.insan)) {
        durumYaz('uyari', 'ek satır kaydı yazılamadı (tmp): kırmızı yeniden-yaz moduna düştü')
        process.stderr.write('[kartsiz-beklenti-kapisi] bekleyen kayit yazilamadi (' + bekleyenDizini() + '), ek satir akisi calismaz\n')
      }
      process.stderr.write(engelMetni(sorunlar, kaynak) + '\n')
      process.exit(2)
    }
    if (olculemedi) {
      durumYaz('uyari', 'kapı ölçemedi: ' + olculemedi)
      process.stderr.write('[kartsiz-beklenti-kapisi] kapi olcemedi, tur gecti: ' + olculemedi + '\n')
      process.exit(0)
    }
    durumYaz('iyi', 'kapı çalışıyor')
    process.exit(0)
  })
}

module.exports = { maddeleriCikar, degerlendir, kartBaslari, kanbandanDogrula, turuOku, yetkiDegerlendir, ekSatirKarar, EK_SATIR_AZAMI, EK_SATIR_DENEME, ONEKLER }

if (require.main === module) main()
