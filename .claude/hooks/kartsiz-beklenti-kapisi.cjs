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

// Kanban kart ön ekleri (ölçüldü 2026-10-04: panolardaki başlık ön ekleri). Yeni departman ön eki → buraya.
const ONEKLER = ['OPS', 'ARC', 'HRT', 'URN', 'YTN', 'REC', 'ALT', 'ADM', 'KTL', 'SEO', 'EDG', 'BLG']
const KART_NO = new RegExp('\\b(?:' + ONEKLER.join('|') + ')-\\d{1,5}\\b', 'g')
const KART_UUID = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi

// Başlık: satır başında "Senden istenen(ler)/beklenen(ler)" (kalın, başlık işaretli ya da düz).
const BASLIK = /^\s*(?:#{1,6}\s*)?(?:[*_]{1,2})?\s*senden\s+(?:istenen|beklenen)(?:ler)?\b[\s*_:.\-–—]*(.*)$/i
// Tek satırlık kalıplar: kendisi bir istektir, aynı satırda kart no gerekir.
const SATIR_KALIBI = /(onay[ıi]na sunuyorum|\bevet de\b)/i
const OLUMSUZ = /\b(yok|istemiyor|gerekmiyor|beklenmiyor|bekleyen yok|bir şey yok|bir sey yok)\b/i
// Giriş satırı: iki nokta ile biten ya da yalnız parantezli not ("(iki adım):") bir istek değil, ardından gelenleri bağlar.
const GIRIS = /(?::\s*$|^\s*\([^)]*\)\s*:?\s*$)/
// Muaf: compact hazırlığı Recep output style'ında kendi kalıbı olan ritüeldir (üç maddelik not + /compact satırı), kart gerektirmez.
const MUAF = /compact/i
const ATLATMA = /^\s*Kartsız:\s*(\S.{4,})$/im
const MADDE = /^\s*(?:[-*•]|\d+[.)]|\*\*\d+[.)]?\*\*)\s+/
const BASLIK_BENZERI = /^\s*(?:#{1,6}\s|\*\*[^*\n]{1,60}\*\*\s*$)/

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
    if (SATIR_KALIBI.test(satir)) maddeler.push({ metin: satir.trim() })
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
    const sen = String(task.assignee || '').trim().toLowerCase() === 'sen'
    if (!(sen || etiketler.includes('recep-bekliyor') || etiketler.includes('karar-bekliyor'))) continue
    const no = (String(task.title || '').match(/^([A-ZÇĞİÖŞÜ]+-\d+)/) || [])[1]
    if (no) gecerli.add(no)
    gecerli.add(String(task.id).toLowerCase())
  }
  return { gecerli }
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
  return { sonMetin, mesajlar }
}

function engelMetni(sorunlar, kaynak) {
  return (
    "[kartsiz-beklenti-kapisi] KIRMIZI: Recep'ten istenen şey KARTSIZ (" + kaynak + '). ' +
    sorunlar.join(' · ') + '. ' +
    "Şimdi: Kanban'da (kendi panonda) kartı aç (atanan Sen ya da etiket recep-bekliyor; karardıysa karar-bekliyor), " +
    'numarasını ilgili maddenin sonuna yaz ("(kart OPS-61)") ve mesajı yeniden yaz. ' +
    'Gerçekten kart gerekmiyorsa mesaja tek satır ekle: "Kartsız: <sebep>" (sebep kayda düşer).'
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

    const satirlar = fs.readFileSync(tp, 'utf8').trim().split('\n').slice(-400)
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
      // Döngü koruması: kapı zaten bir kez bloklamışsa bu tur geçer.
      if (input.stop_hook_active) {
        process.stderr.write('[kartsiz-beklenti-kapisi] stop_hook_active: ikinci kez bloklanmadi\n')
        process.exit(0)
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

module.exports = { maddeleriCikar, degerlendir, kartBaslari, kanbandanDogrula, turuOku, ONEKLER }

if (require.main === module) main()
