'use strict'
/**
 * MAKİNE TAŞIMA — ORTAK ÇEKİRDEK (ALT-165). Cetvel: docs/standards/makine-tasima-standard.md.
 *
 * Bu dosya SAF/küçük yardımcıları taşır; üç betik (paketle, kur, dogrula) ve conformance testi
 * (src/__tests__/conformance/makine-tasima.test.ts) aynı koda dayanır. Kural: hüküm burada, CLI ince.
 *
 * Bölümler:
 *   1. Yol biçimleri ve yeniden yazım (eski ev yolu -> yeni ev yolu; JSON-güvenli)
 *   2. Arşiv (tar) yazıcı/okuyucu — bağımlılıksız; sha256 aynı geçişte hesaplanır
 *   3. Bütünlük (icindekiler.json biçimi + parça sha256 doğrulaması)
 *   4. gpg (simetrik AES256; parola bu dosyada ASLA geçmez, gpg'nin kendi giriş penceresi sorar)
 *   5. Küçük yardımcılar (argüman ayrıştırma, bayt biçimi, araç sürümleri, depo-içi kapısı)
 *
 * ⛔Kullanıcı adı ve kök yollar kodda SABİT değildir: ev os.homedir(), ya da parametre.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')

// ═════════════════════════════════════════════════════════════════════════════
// 1. YOL BİÇİMLERİ
// ═════════════════════════════════════════════════════════════════════════════

/** Claude Code proje klasör adı: harf/rakam dışındaki her karakter '-' olur (C:\a\.b -> C--a--b). */
function projeKlasorAdi(yol) {
  return String(yol).replace(/[^A-Za-z0-9]/g, '-')
}

function yolAyir(yol) {
  const m = /^([A-Za-z]):[\\/]*(.*)$/.exec(yol)
  if (m) return { surucu: m[1], parcalar: m[2].split(/[\\/]+/).filter(Boolean), posix: false }
  return { surucu: null, parcalar: yol.split(/[\\/]+/).filter(Boolean), posix: yol.startsWith('/') }
}

/**
 * Bir yolun yapılandırma dosyalarında geçebilen BEŞ yazılışı:
 *   ham     C:\a\b        (düz metin: .cmd, kabuk betiği)
 *   kacisli C:\\a\\b      (JSON metninde ters bölü kaçışlı)
 *   duz     C:/a/b        (düz bölülü)
 *   msys    /c/a/b        (Git Bash / izin kuralları)
 *   slug    C--a-b        (~/.claude/projects klasör adı)
 * POSIX yolunda ilk dördü aynıdır.
 */
function yolBicimleri(yol) {
  const { surucu, parcalar, posix } = yolAyir(String(yol).trim())
  if (parcalar.length === 0) throw new Error(`kök yol eşlenemez: ${yol}`)
  if (surucu) {
    const ham = `${surucu}:\\${parcalar.join('\\')}`
    return {
      ham,
      kacisli: ham.replace(/\\/g, '\\\\'),
      duz: `${surucu}:/${parcalar.join('/')}`,
      msys: `/${surucu.toLowerCase()}/${parcalar.join('/')}`,
      slug: projeKlasorAdi(ham),
    }
  }
  const duz = (posix ? '/' : '') + parcalar.join('/')
  return { ham: duz, kacisli: duz, duz, msys: duz, slug: projeKlasorAdi(duz) }
}

const TUM_TURLER = ['ham', 'kacisli', 'duz', 'msys', 'slug']

const regexKac = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Sınırlı desen: önünde harf/rakam yok; arkasında yol adı devam etmiyor.
 * Yol biçimlerinde '-', '_', '.' ad parçasıdır (C:\a\ali ≠ C:\a\ali-eski); slug'ta '-' ayraçtır.
 */
function bicimDeseni(eskiBicim, tur) {
  const sag = tur === 'slug' ? '(?![A-Za-z0-9])' : '(?![A-Za-z0-9_.\\-])'
  return `(?<![A-Za-z0-9])${regexKac(eskiBicim)}${sag}`
}

function eslemeDogrula(esleme) {
  if (!Array.isArray(esleme)) throw new Error('esleme dizi olmalı')
  for (const e of esleme) {
    if (!e || typeof e.eski !== 'string' || typeof e.yeni !== 'string' || !e.eski || !e.yeni) {
      throw new Error('esleme satırı { eski, yeni } ister')
    }
    yolBicimleri(e.eski)
    yolBicimleri(e.yeni)
  }
}

function eslemeGirdileri(esleme, turler) {
  eslemeDogrula(esleme)
  const girdiler = []
  for (const { eski, yeni } of esleme) {
    const e = yolBicimleri(eski)
    const y = yolBicimleri(yeni)
    for (const tur of turler) {
      if (e[tur] === y[tur]) continue
      girdiler.push({ tur, eskiBicim: e[tur], yeniBicim: y[tur] })
    }
  }
  // En uzun eski biçim önce: C:\ev\ali, C:\ev\ali\proje'nin önüne geçmesin.
  girdiler.sort((a, b) => b.eskiBicim.length - a.eskiBicim.length)
  return girdiler
}

/**
 * Metindeki eski yolları yeni yollarla değiştirir. TEK GEÇİŞ (bir değişikliğin çıktısı ikinci kez eşlenmez).
 * Büyük/küçük harf farkı (c:\ / C:\) aynı yol sayılır. `$` içeren yeni yol güvenlidir (işlev değiştirici).
 * @returns {{ metin: string, degisiklik: number }}
 */
function yoluYenidenYaz(metin, esleme, { turler = TUM_TURLER } = {}) {
  const girdiler = eslemeGirdileri(esleme, turler)
  if (girdiler.length === 0) return { metin, degisiklik: 0 }
  const re = new RegExp(girdiler.map((g) => `(${bicimDeseni(g.eskiBicim, g.tur)})`).join('|'), 'gi')
  let degisiklik = 0
  const yeni = String(metin).replace(re, (...a) => {
    const i = a.slice(1, 1 + girdiler.length).findIndex((x) => x !== undefined)
    degisiklik += 1
    return girdiler[i].yeniBicim
  })
  return { metin: yeni, degisiklik }
}

/** Metinde eski yolun kaç yerde kaldığını sayar (yeniden yazım sonrası 0 olmalı). */
function eskiYolSay(metin, eskiYollar, { turler = TUM_TURLER } = {}) {
  let n = 0
  for (const eski of eskiYollar) {
    const b = yolBicimleri(eski)
    for (const tur of turler) {
      const m = String(metin).match(new RegExp(bicimDeseni(b[tur], tur), 'gi'))
      n += m ? m.length : 0
    }
  }
  return n
}

/** JSON dosyası metni için yeniden yazım: girdi de çıktı da JSON olmak ZORUNDA, yoksa atar (dosya yazılmaz). */
function jsonGuvenliYenidenYaz(metin, esleme) {
  const bom = metin.charCodeAt(0) === 0xfeff
  const govde = bom ? metin.slice(1) : metin
  try {
    JSON.parse(govde)
  } catch (e) {
    throw new Error(`kaynak JSON değil: ${e.message}`)
  }
  const r = yoluYenidenYaz(govde, esleme)
  try {
    JSON.parse(r.metin)
  } catch (e) {
    throw new Error(`yeniden yazım JSON'u bozdu, dosya YAZILMADI: ${e.message}`)
  }
  return { metin: (bom ? '\ufeff' : '') + r.metin, degisiklik: r.degisiklik }
}

/**
 * Yeniden yazım sonrası denetim: hâlâ eski yol var mı, JSON ise okunuyor mu.
 * @returns {string[]} hatalar (boş = temiz)
 */
function yenidenYazimDogrula(sonraMetin, eskiYollar, { json = false } = {}) {
  const hatalar = []
  if (json) {
    try {
      JSON.parse(sonraMetin.charCodeAt(0) === 0xfeff ? sonraMetin.slice(1) : sonraMetin)
    } catch (e) {
      hatalar.push(`JSON okunamıyor: ${e.message}`)
    }
  }
  const kalan = eskiYolSay(sonraMetin, eskiYollar)
  if (kalan > 0) hatalar.push(`${kalan} yerde eski yol kaldı`)
  return hatalar
}

/** ~/.claude/projects altındaki bir klasör adındaki eski ev slug'ını yenisiyle değiştirir. */
function projeKlasorunuYenidenAdlandir(ad, esleme) {
  return yoluYenidenYaz(ad, esleme, { turler: ['slug'] }).metin
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. ARŞİV (TAR) — yazıcı ve okuyucu
// ═════════════════════════════════════════════════════════════════════════════
// NİÇİN KENDİ TAR'IMIZ: sistemin tar'ı makineye göre değişir (Git'in GNU tar'ı / Windows bsdtar),
// "kökü yeniden adlandır" ve "sır akışını diske yazmadan şifrele" ikisi de burada kolay; dosya
// içeriği BİR geçişte hem yazılır hem sha256'lanır (hash ile arşivlenen bayt aynı bayttır).
// Biçim POSIX pax (ustar + 'x' başlığı): GNU tar ve bsdtar okur (testte `tar -tf` ile ölçülür).
const BLOK = 512
const OKU_PARCA = 1 << 20

function sekizli(sayi, uzunluk) {
  const s = Math.floor(sayi).toString(8)
  if (s.length > uzunluk - 1) throw new Error('tar sayı alanı taştı')
  return s.padStart(uzunluk - 1, '0') + '\0'
}

function paxKayit(anahtar, deger) {
  const govde = ` ${anahtar}=${deger}\n`
  const bl = Buffer.byteLength(govde)
  let uzunluk = bl + 1
  for (let i = 0; i < 8; i++) {
    const yeni = String(uzunluk).length + bl
    if (yeni === uzunluk) break
    uzunluk = yeni
  }
  return Buffer.from(`${uzunluk}${govde}`)
}

function tarBaslik({ ad, bayt, mtime, mod, tip }) {
  const b = Buffer.alloc(BLOK)
  const asciiAd = ad.replace(/[^\x20-\x7e]/g, '_')
  b.write(asciiAd.slice(0, 100), 0, 'latin1')
  b.write(sekizli(mod, 8), 100, 'latin1')
  b.write(sekizli(0, 8), 108, 'latin1')
  b.write(sekizli(0, 8), 116, 'latin1')
  b.write(sekizli(Math.min(bayt, 0o77777777777), 12), 124, 'latin1')
  b.write(sekizli(mtime, 12), 136, 'latin1')
  b.fill(0x20, 148, 156)
  b.write(tip, 156, 'latin1')
  b.write('ustar\0', 257, 'latin1')
  b.write('00', 263, 'latin1')
  let toplam = 0
  for (let i = 0; i < BLOK; i++) toplam += b[i]
  b.write(toplam.toString(8).padStart(6, '0') + '\0 ', 148, 'latin1')
  return b
}

class TarYazici {
  /** @param {(buf: Buffer) => void} yazFn arşiv baytlarının gittiği yer (dosya/bellek) */
  constructor(yazFn) {
    this.yazFn = yazFn
    this.bayt = 0
    this.dosyaSayisi = 0
  }

  _yaz(buf) {
    this.yazFn(buf)
    this.bayt += buf.length
  }

  _baslikYaz({ ad, bayt, mtime, mod }) {
    const pax = []
    if (!/^[\x20-\x7e]*$/.test(ad) || Buffer.byteLength(ad) > 100) pax.push(paxKayit('path', ad))
    if (bayt > 0o77777777777) pax.push(paxKayit('size', String(bayt)))
    if (pax.length) {
      const govde = Buffer.concat(pax)
      this._yaz(tarBaslik({ ad: `PaxHeaders/${this.dosyaSayisi}`, bayt: govde.length, mtime, mod: 0o644, tip: 'x' }))
      this._yaz(govde)
      const pad = (BLOK - (govde.length % BLOK)) % BLOK
      if (pad) this._yaz(Buffer.alloc(pad))
    }
    this._yaz(tarBaslik({ ad, bayt, mtime, mod, tip: '0' }))
  }

  /** Bellekteki içeriği ekler. @returns {{bayt:number, sha256:string}} */
  bellekten(ad, icerik, { mtime = Math.floor(Date.now() / 1000), mod = 0o644 } = {}) {
    guvenliGoreliYol(ad)
    this._baslikYaz({ ad, bayt: icerik.length, mtime, mod })
    this._yaz(icerik)
    const pad = (BLOK - (icerik.length % BLOK)) % BLOK
    if (pad) this._yaz(Buffer.alloc(pad))
    this.dosyaSayisi += 1
    return { bayt: icerik.length, sha256: crypto.createHash('sha256').update(icerik).digest('hex') }
  }

  /**
   * Diskteki dosyayı ekler. Dosya AÇILAMAZSA (kilitli/izin) başlıktan ÖNCE atar: arşiv bozulmaz, çağıran atlar.
   * Dosya okunurken KISALIRSA arşiv geçersizdir: 'DOSYA_KISALDI' atılır, çağıran parçayı baştan almalı.
   * @returns {{bayt:number, sha256:string, mtimeMs:number}}
   */
  dosyadan(ad, kaynakYol, { mod = null } = {}) {
    guvenliGoreliYol(ad)
    let fd
    try {
      fd = fs.openSync(kaynakYol, 'r')
    } catch (e) {
      e.baslikOncesi = true // arşive henüz bir bayt yazılmadı: çağıran dosyayı atlayıp sürdürebilir
      throw e
    }
    try {
      const st = fs.fstatSync(fd)
      if (!st.isFile()) {
        const e = new Error(`düz dosya değil: ${kaynakYol}`)
        e.baslikOncesi = true
        throw e
      }
      const dosyaModu = mod !== null ? mod : process.platform === 'win32' ? 0o644 : st.mode & 0o777
      this._baslikYaz({ ad, bayt: st.size, mtime: Math.floor(st.mtimeMs / 1000), mod: dosyaModu })
      const h = crypto.createHash('sha256')
      const buf = Buffer.alloc(Math.min(OKU_PARCA, Math.max(st.size, 1)))
      let kalan = st.size
      let konum = 0
      while (kalan > 0) {
        const n = fs.readSync(fd, buf, 0, Math.min(buf.length, kalan), konum)
        if (n === 0) throw new Error(`DOSYA_KISALDI: ${kaynakYol} okunurken küçüldü`)
        const dilim = buf.subarray(0, n)
        h.update(dilim)
        this._yaz(Buffer.from(dilim))
        kalan -= n
        konum += n
      }
      const pad = (BLOK - (st.size % BLOK)) % BLOK
      if (pad) this._yaz(Buffer.alloc(pad))
      this.dosyaSayisi += 1
      return { bayt: st.size, sha256: h.digest('hex'), mtimeMs: st.mtimeMs }
    } finally {
      fs.closeSync(fd)
    }
  }

  bitir() {
    this._yaz(Buffer.alloc(2 * BLOK))
  }
}

/** Dosyaya yazan, akan sha256 hesaplayan hedef. `yaz` kısmi yazımı döngüyle tamamlar. */
function dosyaYazici(yol, { bayrak = 'wx' } = {}) {
  const fd = fs.openSync(yol, bayrak)
  const h = crypto.createHash('sha256')
  let bayt = 0
  return {
    yaz(buf) {
      let k = 0
      while (k < buf.length) k += fs.writeSync(fd, buf, k, buf.length - k)
      h.update(buf)
      bayt += buf.length
    },
    kapat() {
      fs.fsyncSync(fd)
      fs.closeSync(fd)
      return { bayt, sha256: h.digest('hex') }
    },
    iptal() {
      try {
        fs.closeSync(fd)
      } catch {
        /* zaten kapalı */
      }
    },
  }
}

function dosyaKaynagi(fd) {
  const boyut = fs.fstatSync(fd).size
  return {
    boyut,
    oku(konum, uzunluk) {
      const b = Buffer.alloc(uzunluk)
      const n = fs.readSync(fd, b, 0, uzunluk, konum)
      if (n < uzunluk) throw new Error('TAR_KISA: arşiv beklenenden erken bitti')
      return b
    },
  }
}

function bellekKaynagi(buf) {
  return {
    boyut: buf.length,
    oku(konum, uzunluk) {
      if (konum + uzunluk > buf.length) throw new Error('TAR_KISA: arşiv beklenenden erken bitti')
      return buf.subarray(konum, konum + uzunluk)
    },
  }
}

function alanOku(b, bas, uzun) {
  const e = b.indexOf(0, bas)
  return b.toString('utf8', bas, e >= 0 && e < bas + uzun ? e : bas + uzun)
}

function paxAyir(veri) {
  const sonuc = {}
  let i = 0
  while (i < veri.length) {
    const bosluk = veri.indexOf(0x20, i)
    if (bosluk < 0) break
    const uzunluk = parseInt(veri.toString('latin1', i, bosluk), 10)
    if (!Number.isFinite(uzunluk) || uzunluk <= 0) break
    const kayit = veri.toString('utf8', bosluk + 1, i + uzunluk - 1)
    const esit = kayit.indexOf('=')
    if (esit > 0) sonuc[kayit.slice(0, esit)] = kayit.slice(esit + 1)
    i += uzunluk
  }
  return sonuc
}

/**
 * Arşivi sırayla okur. Her düz dosya için `yakala({ad, bayt, mtime, mod})` çağrılır; null dönerse içerik
 * atlanır, aksi hâlde `{ yaz(buf), bitir() }` hedefi içerik dilimlerini alır.
 * Başlık toplamı tutmazsa 'TAR_BASLIK_BOZUK' atar (bozuk/kesik arşiv sessizce geçmez).
 */
function tarOku(kaynak, yakala) {
  let konum = 0
  let pax = {}
  let uzunAd = null
  let girdi = 0
  while (konum + BLOK <= kaynak.boyut) {
    const b = kaynak.oku(konum, BLOK)
    if (b.every((x) => x === 0)) return girdi
    let toplam = 0
    for (let i = 0; i < BLOK; i++) toplam += i >= 148 && i < 156 ? 0x20 : b[i]
    const yazili = parseInt(alanOku(b, 148, 8).trim(), 8)
    if (toplam !== yazili) throw new Error(`TAR_BASLIK_BOZUK: ${konum}. bayttaki başlığın toplamı tutmuyor`)
    const tip = String.fromCharCode(b[156] || 0x30)
    let bayt = parseInt(alanOku(b, 124, 12).trim() || '0', 8)
    const veriBasi = konum + BLOK
    const doldurulmus = Math.ceil(bayt / BLOK) * BLOK
    if (tip === 'x' || tip === 'g' || tip === 'L') {
      const veri = bayt ? kaynak.oku(veriBasi, bayt) : Buffer.alloc(0)
      if (tip === 'x') pax = { ...pax, ...paxAyir(veri) }
      if (tip === 'L') uzunAd = veri.toString('utf8').replace(/\0+$/, '')
      konum = veriBasi + doldurulmus
      continue
    }
    if (pax.size !== undefined) bayt = Number(pax.size)
    const onek = alanOku(b, 345, 155)
    const kisaAd = alanOku(b, 0, 100)
    const ad = pax.path !== undefined ? pax.path : uzunAd !== null ? uzunAd : onek ? `${onek}/${kisaAd}` : kisaAd
    const mtime = parseInt(alanOku(b, 136, 12).trim() || '0', 8)
    const mod = parseInt(alanOku(b, 100, 8).trim() || '644', 8)
    const adsizDoldurulmus = Math.ceil(bayt / BLOK) * BLOK
    pax = {}
    uzunAd = null
    if (tip === '0' || tip === '\0') {
      girdi += 1
      const hedef = yakala({ ad, bayt, mtime, mod })
      if (hedef) {
        let okunan = 0
        while (okunan < bayt) {
          const n = Math.min(OKU_PARCA, bayt - okunan)
          hedef.yaz(kaynak.oku(veriBasi + okunan, n))
          okunan += n
        }
        hedef.bitir()
      }
    }
    konum = veriBasi + adsizDoldurulmus
  }
  return girdi
}

/**
 * Arşiv yolu güvenliği (zip-slip/tar-slip): '..', mutlak yol, sürücü harfi, ters bölü, ':' YOK.
 * Mantıksal yol 'etiket/göreli/yol' biçimindedir.
 * @returns {string[]} parçalar
 */
function guvenliGoreliYol(ad) {
  if (typeof ad !== 'string' || !ad) throw new Error('boş arşiv yolu')
  if (ad.includes('\0') || ad.includes('\\') || ad.includes(':') || ad.startsWith('/')) {
    throw new Error(`güvensiz arşiv yolu: ${ad}`)
  }
  const p = ad.split('/')
  if (p.some((s) => s === '' || s === '.' || s === '..')) throw new Error(`güvensiz arşiv yolu: ${ad}`)
  return p
}

const ETIKETLER = ['ev', 'tmp', 'appdata', 'depo']

/** 'etiket/göreli' mantıksal yolunu kök haritasıyla gerçek yola çevirir; kökün dışına çıkamaz. */
function hedefYolu(mantiksal, kokHaritasi) {
  const p = guvenliGoreliYol(mantiksal)
  const kok = kokHaritasi[p[0]]
  if (!kok || !ETIKETLER.includes(p[0])) throw new Error(`bilinmeyen kök etiketi: ${p[0]}`)
  const tam = path.join(kok, ...p.slice(1))
  const goreli = path.relative(kok, tam)
  if (goreli.startsWith('..') || path.isAbsolute(goreli)) throw new Error(`kökün dışına çıkıyor: ${mantiksal}`)
  return tam
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. BÜTÜNLÜK
// ═════════════════════════════════════════════════════════════════════════════

function sha256Dosya(yol) {
  const h = crypto.createHash('sha256')
  const fd = fs.openSync(yol, 'r')
  try {
    const buf = Buffer.alloc(OKU_PARCA)
    let konum = 0
    for (;;) {
      const n = fs.readSync(fd, buf, 0, buf.length, konum)
      if (n === 0) break
      h.update(buf.subarray(0, n))
      konum += n
    }
  } finally {
    fs.closeSync(fd)
  }
  return h.digest('hex')
}

const SHA_DESENI = /^[0-9a-f]{64}$/

/** icindekiler.json biçimi: eksik/bozuk alan = hata (fail-closed). */
function icindekilerBicimHatalari(ic) {
  const h = []
  if (!ic || typeof ic !== 'object') return ['icindekiler bir nesne değil']
  if (ic.surum !== 1) h.push(`desteklenmeyen sürüm: ${ic.surum}`)
  if (typeof ic.damga !== 'string' || !ic.damga) h.push('damga yok')
  if (!ic.kokler || typeof ic.kokler.ev !== 'string' || !ic.kokler.ev) h.push('kokler.ev yok (eski ev yolu bilinmeden yol dönüşümü yapılamaz)')
  if (!Array.isArray(ic.parcalar)) h.push('parcalar listesi yok')
  else if (ic.parcalar.length === 0 && !(Array.isArray(ic.git) && ic.git.length > 0)) h.push('parcalar ve git boş: pakette taşınacak bir şey yok')
  for (const p of ic.parcalar || []) {
    if (!p || typeof p.ad !== 'string' || typeof p.dosya !== 'string') h.push('parça adı/dosyası eksik')
    else if (p.dosya.includes('/') || p.dosya.includes('\\') || p.dosya.includes('..')) h.push(`parça dosya adı güvensiz: ${p.dosya}`)
    if (!p || !Number.isInteger(p.bayt) || p.bayt < 0) h.push(`parça bayt geçersiz: ${p && p.ad}`)
    if (!p || !SHA_DESENI.test(String(p.sha256))) h.push(`parça sha256 geçersiz: ${p && p.ad}`)
  }
  if (!Array.isArray(ic.dosyalar)) h.push('dosyalar listesi yok')
  for (const d of ic.dosyalar || []) {
    if (!d || typeof d.yol !== 'string' || !SHA_DESENI.test(String(d.sha256 || '')) || !Number.isInteger(d.bayt)) {
      h.push(`dosya kaydı geçersiz: ${d && d.yol}`)
      break
    }
  }
  return h
}

/**
 * Parça dosyalarını diskte doğrular: var mı, bayt tutuyor mu, sha256 tutuyor mu.
 * @param {{sha?: boolean}} secenek sha=false yalnız bayt/varlık bakar (hızlı)
 * @returns {string[]} hatalar
 */
function parcalariDogrula(ic, kok, { sha = true, parcalar = null } = {}) {
  const hatalar = []
  for (const p of ic.parcalar) {
    if (parcalar && !parcalar.includes(p.ad)) continue
    const yol = path.join(kok, p.dosya)
    let st
    try {
      st = fs.statSync(yol)
    } catch {
      hatalar.push(`${p.ad}: parça dosyası YOK (${p.dosya})`)
      continue
    }
    if (st.size !== p.bayt) {
      hatalar.push(`${p.ad}: bayt tutmuyor (beklenen ${p.bayt}, bulunan ${st.size})`)
      continue
    }
    if (sha) {
      const s = sha256Dosya(yol)
      if (s !== p.sha256) hatalar.push(`${p.ad}: sha256 tutmuyor (parça bozuk ya da değiştirilmiş)`)
    }
  }
  for (const g of ic.git || []) {
    if (!g.bundle) continue
    const yol = path.join(kok, g.bundle.dosya)
    if (!fs.existsSync(yol)) hatalar.push(`git ${g.ad}: bundle YOK (${g.bundle.dosya})`)
    else if (sha && sha256Dosya(yol) !== g.bundle.sha256) hatalar.push(`git ${g.ad}: bundle sha256 tutmuyor`)
  }
  return hatalar
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. gpg — simetrik AES256. PAROLA BU KODDAN GEÇMEZ.
// ═════════════════════════════════════════════════════════════════════════════
// gpg parolayı kendi giriş penceresinden (gpg-agent + pinentry) Recep'ten ister. Betiğe parola vermenin
// hiçbir yolu yoktur: ne argüman, ne ortam değişkeni, ne dosya. Bu yüzden gpg çağrılarında toplu kip
// ve parola-kanalı bayrakları KULLANILMAZ (test bu kaynakları tarar).

/**
 * Şifreleme: girdi gpg'nin stdin'inden gelir, şifreli çıktı stdout'tan döner; dosyayı Node yazar.
 * ⛔Dosya yolu gpg'ye ARGÜMAN olarak verilmez: Git for Windows gpg'si (MSYS) argümandaki kesme işaretini
 * tırnak sayıp siler; "G:\Drive'ım\..." yolu "Driveım" olur ve şifreleme "No such file" ile düşer
 * (ölçüldü 2026-11-07, ilk gerçek prova). Çözmede de şifreli baytlar stdin'den verilir.
 */
function gpgSifrelemeArgumanlari() {
  return [
    '--symmetric',
    '--cipher-algo', 'AES256',
    '--s2k-mode', '3',
    '--s2k-digest-algo', 'SHA512',
    '--s2k-count', '65011712',
    '--no-symkey-cache',
    '--output', '-',
  ]
}

function gpgCozmeArgumanlari() {
  return ['--decrypt', '--no-symkey-cache']
}

function gpgBul(verilen = null) {
  const adaylar = [verilen, process.env.TASIMA_GPG, 'gpg']
  const pf = process.env.ProgramFiles || 'C:\\Program Files'
  adaylar.push(path.join(pf, 'Git', 'usr', 'bin', 'gpg.exe'))
  for (const c of adaylar.filter(Boolean)) {
    const r = spawnSync(c, ['--version'], { encoding: 'utf8', windowsHide: true })
    if (!r.error && r.status === 0) return { yol: c, surum: (r.stdout || '').split('\n')[0].trim() }
  }
  return null
}

/** Arşiv baytlarını gpg ile şifreler. Şifreli çıktı geçici adla yazılır, başarıda asıl adına döner. */
function gpgSifrele(girdiBuffer, cikisYol, gpgYol) {
  const gecici = `${cikisYol}.tmp`
  fs.rmSync(gecici, { force: true })
  const r = spawnSync(gpgYol, gpgSifrelemeArgumanlari(), {
    input: girdiBuffer,
    stdio: ['pipe', 'pipe', 'inherit'],
    maxBuffer: 1 << 28,
    windowsHide: false,
  })
  if (r.error || r.status !== 0 || !r.stdout || r.stdout.length === 0) {
    throw new Error(`gpg şifreleme başarısız (çıkış ${r.status}${r.error ? `, ${r.error.message}` : ''}); parola girilmediyse ya da iptal edildiyse bu beklenen sonuçtur`)
  }
  fs.writeFileSync(gecici, r.stdout)
  fs.renameSync(gecici, cikisYol)
}

/** Şifreli dosyayı çözer, düz baytları döndürür (diske yazmaz). Şifreli baytlar gpg'ye stdin'den gider. */
function gpgCoz(girdiYol, gpgYol) {
  const r = spawnSync(gpgYol, gpgCozmeArgumanlari(), {
    input: fs.readFileSync(girdiYol),
    stdio: ['pipe', 'pipe', 'inherit'],
    maxBuffer: 1 << 28,
    windowsHide: false,
  })
  if (r.error || r.status !== 0) throw new Error(`gpg çözme başarısız (çıkış ${r.status}); parola yanlış ya da iptal edildi`)
  return r.stdout
}

/**
 * OpenPGP (RFC 4880) ilk paket başlığı: simetrik anahtarlı oturum anahtarı paketi (etiket 3) mi, şifre AES256 (9) mu,
 * ardından şifreli veri paketi (etiket 9 ya da 18) geliyor mu. SAF; gpg'yi ÇALIŞTIRMAZ.
 * ⛔`gpg --list-packets` kullanılmaz: simetrik dosyada çözmeye girişir ve parola penceresi açar (ölçüldü 2026-11-06).
 */
function openpgpSimetrikOzet(buf) {
  const sonuc = { sifreli: false, aes256: false }
  const paket = (konum) => {
    if (konum >= buf.length) return null
    const b0 = buf[konum]
    if (!(b0 & 0x80)) return null
    let tag
    let len
    let basliklik
    if (b0 & 0x40) {
      tag = b0 & 0x3f
      const l = buf[konum + 1]
      if (l < 192) { len = l; basliklik = 2 }
      else if (l < 224) { len = ((l - 192) << 8) + buf[konum + 2] + 192; basliklik = 3 }
      else if (l === 255) { len = buf.readUInt32BE(konum + 2); basliklik = 6 }
      else return { tag, govdeBasi: konum + 2, uzunluk: null }
    } else {
      tag = (b0 >> 2) & 0xf
      const t = b0 & 3
      if (t === 0) { len = buf[konum + 1]; basliklik = 2 }
      else if (t === 1) { len = buf.readUInt16BE(konum + 1); basliklik = 3 }
      else if (t === 2) { len = buf.readUInt32BE(konum + 1); basliklik = 5 }
      else return { tag, govdeBasi: konum + 1, uzunluk: null }
    }
    return { tag, govdeBasi: konum + basliklik, uzunluk: len }
  }
  try {
    const p1 = paket(0)
    if (!p1 || p1.tag !== 3) return sonuc
    sonuc.aes256 = buf[p1.govdeBasi] === 4 && buf[p1.govdeBasi + 1] === 9
    if (p1.uzunluk === null) return sonuc
    const p2 = paket(p1.govdeBasi + p1.uzunluk)
    sonuc.sifreli = Boolean(p2 && (p2.tag === 9 || p2.tag === 18))
  } catch {
    return { sifreli: false, aes256: false }
  }
  return sonuc
}

/** Dosyanın gerçekten simetrik gpg paketi (ve AES256) olduğunu parola GEREKTİRMEDEN doğrular. */
function gpgPaketiDogrula(yol) {
  const fd = fs.openSync(yol, 'r')
  try {
    const buf = Buffer.alloc(64)
    const n = fs.readSync(fd, buf, 0, 64, 0)
    return openpgpSimetrikOzet(buf.subarray(0, n))
  } finally {
    fs.closeSync(fd)
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. KÜÇÜK YARDIMCILAR
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Argüman ayrıştırıcı. Tanımsız bayrak HATA (yazım hatası sessizce yok sayılmaz).
 * @param {string[]} argv
 * @param {{bayrak?: string[], deger?: string[], coklu?: string[]}} sema
 */
function argumanlariAyir(argv, { bayrak = [], deger = [], coklu = [] } = {}) {
  const sonuc = { bayrak: {}, deger: {}, coklu: {}, kalan: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) {
      sonuc.kalan.push(a)
      continue
    }
    const es = a.indexOf('=')
    const ad = (es > 0 ? a.slice(2, es) : a.slice(2))
    let ic = es > 0 ? a.slice(es + 1) : undefined
    if (bayrak.includes(ad)) {
      if (ic !== undefined) throw new Error(`--${ad} değer almaz`)
      sonuc.bayrak[ad] = true
    } else if (deger.includes(ad) || coklu.includes(ad)) {
      if (ic === undefined) {
        ic = argv[i + 1]
        i += 1
      }
      if (ic === undefined || ic.startsWith('--')) throw new Error(`--${ad} bir değer ister`)
      if (coklu.includes(ad)) (sonuc.coklu[ad] = sonuc.coklu[ad] || []).push(ic)
      else sonuc.deger[ad] = ic
    } else {
      throw new Error(`bilinmeyen bayrak: ${a}`)
    }
  }
  return sonuc
}

function bicimBayt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '?'
  const birim = ['B', 'KB', 'MB', 'GB', 'TB']
  let v = n
  let i = 0
  while (v >= 1024 && i < birim.length - 1) {
    v /= 1024
    i += 1
  }
  return `${i === 0 ? v : v.toFixed(1).replace('.', ',')} ${birim[i]}`
}

function damgaUret(d = new Date()) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
}

/** Bir git deposunun içindeki dizin = REDDEDİLİR (paket sır taşır; depo PUBLIC). unopim-yedek.cjs kalıbı. */
function hedefDepoIcindeMi(dizin) {
  let d = path.resolve(dizin)
  for (;;) {
    if (fs.existsSync(path.join(d, '.git'))) return true
    const ust = path.dirname(d)
    if (ust === d) return false
    d = ust
  }
}

/** Hedef dizin için tek hüküm: null = uygun, aksi hâlde red sebebi. */
function hedefHatasi(hedef) {
  if (!hedef) return '--hedef verilmedi'
  if (hedefDepoIcindeMi(hedef)) return 'hedef bir git deposunun içinde — paket sır taşır, reddedildi'
  return null
}

const ARAC_KOMUTLARI = [
  ['node', 'node --version'],
  ['pnpm', 'pnpm --version'],
  ['python', 'python --version'],
  ['gh', 'gh --version'],
  ['git', 'git --version'],
  ['docker', 'docker --version'],
  ['deno', 'deno --version'],
  ['supabase', 'supabase --version'],
  ['bun', 'bun --version'],
  ['graphify', 'graphify --version'],
  ['claude', 'claude --version'],
  ['gpg', 'gpg --version'],
]

/** Araç sürümleri: { ad: { surum, ham } | null }. Sabit komut tablosu (kullanıcı girdisi kabuğa girmez). */
function aracSurumleri(komutlar = ARAC_KOMUTLARI) {
  const sonuc = {}
  for (const [ad, komut] of komutlar) {
    const r = spawnSync(komut, { shell: true, encoding: 'utf8', timeout: 20000, windowsHide: true })
    const ham = `${r.stdout || ''}\n${r.stderr || ''}`.split(/\r?\n/).map((s) => s.trim()).find(Boolean) || ''
    const m = /(\d+\.\d+(?:\.\d+)?)/.exec(ham)
    sonuc[ad] = r.status === 0 && m ? { surum: m[1], ham: ham.slice(0, 80) } : null
  }
  return sonuc
}

module.exports = {
  projeKlasorAdi,
  yolBicimleri,
  yoluYenidenYaz,
  eskiYolSay,
  jsonGuvenliYenidenYaz,
  yenidenYazimDogrula,
  projeKlasorunuYenidenAdlandir,
  TarYazici,
  tarOku,
  dosyaYazici,
  dosyaKaynagi,
  bellekKaynagi,
  guvenliGoreliYol,
  hedefYolu,
  ETIKETLER,
  sha256Dosya,
  icindekilerBicimHatalari,
  parcalariDogrula,
  gpgSifrelemeArgumanlari,
  gpgCozmeArgumanlari,
  gpgBul,
  gpgSifrele,
  gpgCoz,
  gpgPaketiDogrula,
  openpgpSimetrikOzet,
  argumanlariAyir,
  bicimBayt,
  damgaUret,
  hedefDepoIcindeMi,
  hedefHatasi,
  aracSurumleri,
  ARAC_KOMUTLARI,
}
