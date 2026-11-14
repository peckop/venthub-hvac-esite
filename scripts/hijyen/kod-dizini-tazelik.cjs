'use strict'
/**
 * KOD DİZİNİ TAZELİK (ARC-311, ARC-310 kararı: --watch ve zamanlanmış görev YOK).
 *
 * Kod dizini (`wrongstack-codebase-index`) kendiliğinden yenilenmiyor; 14 Kasım'da 20 gün bayat kaldı ve kimse görmedi.
 * Çözüm süreçsiz: oturum açılışında bu modül son başarılı yenilemenin yaşına bakar; ESİK_GUN'den eskiyse
 * `tools/wrongstack-mcp/kod-dizini-yenile.cjs`'i ARKA PLANDA bir kez başlatır (kopuk-baslat, INV-KOPUK-1). Süreç yalnız
 * yenileme sürerken yaşar (~4 dk), bitince kapanır; makinede kalıcı süreç, Görev Zamanlayıcı kaydı ya da Run anahtarı yok.
 *
 * Durum dizini (pencereler ve worktree'ler arası ORTAK, ev klasöründe): `son.json` (son başarılı yenileme), `kilit`
 * (çalışan yenileme; KILIT_OMRU_MS sonra kendiliğinden düşer), `hata.json` (son başarısız deneme; HATA_BEKLEME_MS boyunca
 * otomatik yeniden deneme yok, her pencere açılışında 4 dk'lık süreç döngüsüne girmesin).
 *
 * Salt-okuma + tek yazım yeri (durum dizini), fail-open (fırlatmaz), çıktı tek satır. Vana: VENTHUB_KOD_DIZINI_TAZELIK_KAPAT=1.
 * Testler: src/__tests__/conformance/kanca-kod-dizini-tazelik.test.ts.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const ESIK_GUN = 3
const GUN_MS = 24 * 3600 * 1000
const KILIT_OMRU_MS = 25 * 60 * 1000
const HATA_BEKLEME_MS = 6 * 3600 * 1000
const AZ_BELLEK_MB = 2048
const ELLE = 'node tools/wrongstack-mcp/kod-dizini-yenile.cjs'

function durumDizini(env = process.env) {
  return env.VENTHUB_KOD_DIZINI_DURUM_DIZINI || path.join(os.homedir(), '.claude', 'kod-dizini-durum')
}

const SAAT_SAPMASI_MS = 60_000

/** Kayıt tarihi; geleceğe 1 dk'dan fazla taşıyorsa (saat ileri alınıp geri çekildi) GEÇERSİZ sayılır: günlerce susturmasın. */
function tarihOku(yol, simdi) {
  try {
    const t = JSON.parse(fs.readFileSync(yol, 'utf8')).tarih
    return typeof t === 'number' && Number.isFinite(t) && t <= simdi + SAAT_SAPMASI_MS ? t : null
  } catch {
    return null
  }
}

/** Kilit yaşı dosyanın İÇİNDEKİ damgadan okunur (testte sahte saat çalışsın); okunamazsa dosya mtime'ı. */
function kilitTaze(dizin, simdi) {
  const yol = path.join(dizin, 'kilit')
  try {
    const damga = Number(fs.readFileSync(yol, 'utf8'))
    const t = Number.isFinite(damga) && damga > 0 ? damga : fs.statSync(yol).mtimeMs
    return t <= simdi + SAAT_SAPMASI_MS && simdi - t < KILIT_OMRU_MS // gelecekteki damga = bozuk saat = taze sayılmaz
  } catch {
    return false
  }
}

/** Saf karar: 'sessiz' | 'surer' | 'hata-bekle' | 'baslat' (+ yaş gün; kayıt yoksa null). */
function karar({ dizin, simdi = Date.now() }) {
  const son = tarihOku(path.join(dizin, 'son.json'), simdi)
  const yasGun = son == null ? null : Math.max(0, (simdi - son) / GUN_MS)
  if (yasGun != null && yasGun < ESIK_GUN) return { eylem: 'sessiz', yasGun }
  if (kilitTaze(dizin, simdi)) return { eylem: 'surer', yasGun }
  const hata = tarihOku(path.join(dizin, 'hata.json'), simdi)
  if (hata != null && simdi - hata < HATA_BEKLEME_MS) return { eylem: 'hata-bekle', yasGun }
  return { eylem: 'baslat', yasGun }
}

/** `wx` ile yeni dosya yaz: yalnız dosya YOKSA başarır (atomik). */
function yeniYaz(yol, simdi) {
  try {
    fs.writeFileSync(yol, String(simdi), { flag: 'wx' })
    return true
  } catch {
    return false
  }
}

/**
 * Kilidi ATOMİK al. Süresi dolmuş kilidi devralma da tek elde olmalı (denetçi bulgusu, 14 Kasım: "bayat sil + yeniden
 * yaz" iki pencerede birbirinin taze kilidini siliyordu, 6/15 turda 2-3 başlatma): devralma `kilit.devral` (`wx`) ile
 * seri hâle getirilir; devralan kilidi TAZE mi diye yeniden bakar, sonra siler ve yazar. Alındıysa true.
 */
function kilitAl(dizin, simdi = Date.now()) {
  fs.mkdirSync(dizin, { recursive: true })
  const yol = path.join(dizin, 'kilit')
  if (yeniYaz(yol, simdi)) return true
  if (kilitTaze(dizin, simdi)) return false
  const devral = yol + '.devral'
  if (!yeniYaz(devral, simdi)) {
    // devralan çöktüyse (60 sn'den eski) devral kilidi bir sonraki pencere için temizlenir
    try {
      if (Date.now() - fs.statSync(devral).mtimeMs > 60_000) fs.unlinkSync(devral)
    } catch {
      /* başkası temizledi */
    }
    return false
  }
  try {
    if (kilitTaze(dizin, simdi)) return false // devralma beklerken başkası taze kilit yazdı
    try {
      fs.unlinkSync(yol)
    } catch {
      /* zaten yok */
    }
    return yeniYaz(yol, simdi)
  } finally {
    try {
      fs.unlinkSync(devral)
    } catch {
      /* yok */
    }
  }
}

function kilitBirak(dizin) {
  try {
    fs.unlinkSync(path.join(dizin, 'kilit'))
  } catch {
    /* zaten yok */
  }
}

/** Yenileme betiği bitince: başarıda son.json (yaş sıfırlanır) ve hata.json silinir; başarısızlıkta hata.json. */
function bitir({ dizin, basari, simdi = Date.now(), kilidiBirak = true }) {
  try {
    fs.mkdirSync(dizin, { recursive: true })
    if (basari) {
      fs.writeFileSync(path.join(dizin, 'son.json'), JSON.stringify({ tarih: simdi }))
      try {
        fs.unlinkSync(path.join(dizin, 'hata.json'))
      } catch {
        /* yok */
      }
    } else if (kilidiBirak) {
      fs.writeFileSync(path.join(dizin, 'hata.json'), JSON.stringify({ tarih: simdi }))
    }
  } catch {
    /* fail-open */
  }
  if (kilidiBirak) kilitBirak(dizin)
}

function varsayilanBaslatici() {
  const { kopukBaslat } = require(path.join(__dirname, '..', 'board', 'kopuk-baslat.cjs'))
  const betik = path.join(__dirname, '..', '..', 'tools', 'wrongstack-mcp', 'kod-dizini-yenile.cjs')
  const cocuk = kopukBaslat(betik, ['--arka-plan'])
  cocuk.on('error', () => {})
}

function yasMetni(yasGun) {
  return yasGun == null ? 'yenileme kaydı yok' : `${Math.floor(yasGun)} gün bayat`
}

/**
 * Açılış kancası çekirdeği: tek satır ('' = sessiz). Hiçbir koşulda fırlatmaz.
 * @param {{ dizin?: string, simdi?: number, env?: Record<string, string | undefined>, baslatici?: () => void, bosBellekMB?: number }} [s]
 */
function kancaKos({ dizin, simdi = Date.now(), env = process.env, baslatici = varsayilanBaslatici, bosBellekMB = os.freemem() / 1048576 } = {}) {
  try {
    if (env.VENTHUB_KOD_DIZINI_TAZELIK_KAPAT === '1') return ''
    const d = dizin || durumDizini(env)
    const k = karar({ dizin: d, simdi })
    if (k.eylem === 'sessiz') return ''
    if (k.eylem === 'surer') return `KOD DİZİNİ: ${yasMetni(k.yasGun)}; yenileme başka pencerede sürüyor`
    if (k.eylem === 'hata-bekle') return `⚠KOD DİZİNİ: ${yasMetni(k.yasGun)}; son otomatik yenileme başarısız oldu, 6 saat yeniden denenmeyecek. Elle: ${ELLE}`
    if (bosBellekMB < AZ_BELLEK_MB) return `⚠KOD DİZİNİ: ${yasMetni(k.yasGun)}; boş bellek az (${Math.round(bosBellekMB)} MB), otomatik yenileme atlandı. Elle: ${ELLE}`
    if (!kilitAl(d, simdi)) return `KOD DİZİNİ: ${yasMetni(k.yasGun)}; yenileme başka pencerede sürüyor`
    try {
      baslatici()
    } catch {
      kilitBirak(d)
      return `⚠KOD DİZİNİ: ${yasMetni(k.yasGun)}; otomatik yenileme başlatılamadı. Elle: ${ELLE}`
    }
    return `⚠KOD DİZİNİ: ${yasMetni(k.yasGun)} (eşik ${ESIK_GUN}); yenileme arka planda başlatıldı (~4 dk, bitince kapanır)`
  } catch {
    return ''
  }
}

module.exports = { karar, kilitAl, kilitBirak, bitir, kancaKos, durumDizini, ESIK_GUN, KILIT_OMRU_MS, HATA_BEKLEME_MS }
