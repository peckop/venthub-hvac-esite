#!/usr/bin/env node
/**
 * REHBER ↔ MEVZUAT BAĞ KAPILARI (ARC-284, BLG-57 / OPS-253): M-A, M-C, M-D.
 * Cetvel: docs/plans/rehber-mevzuat-bagi-sema-2026-11-08.md §2-3, docs/standards/mevzuat-kaydi-standard.md (M5, M6.1).
 *
 * Girdi: BAĞ DİZİNİ (varsayılan docs/rehber/mevzuat-bag) altında yazı başına bir JSON:
 *   { "yazi": "frekans-konvertoru", "kaynaklar": [1,2,3],
 *     "mevzuat": [ { "kayit": "AB-2019/1781", "madde": "...", "bolum": "...", "kaynak": [2], "tur": "atif", "not": "..." } ] }
 * ve docs/mevzuat/kayit.json (MEVZUAT'ın elle yazdığı kayıt; bu betik ona YAZMAZ).
 *
 *   M-A  `ma`   : her mevzuat[].kayit kayıt.json'da var mı; kaynak numaraları yazının kaynaklar listesinde mi;
 *                 alanlar (kayit, bolum, kaynak, tur) eksiksiz mi; tur ∈ {atif, tarih, tanim, yok}; tur=yok iken `not` var mı.
 *                 Kalem `kaldirildi` olsa da kimlik kalır (bağ kırılmaz). `madde` serbest metin, doğrulanmaz.
 *   M-D  `uret` : atıf dizinini ÜRETİR (docs/mevzuat/atif-dizini.json; elle düzenlenmez). `uret --kontrol` dosya güncel mi bakar.
 *                 tur=yok yazıyı o kalemin atıf yapanı SAYMAZ (yazı anmıyor).
 *   M-C  `mc`   : taban kayıt (master) ile şimdiki kayıt arasında durum / tarihler / yerini_aldigi / degistirenler değişen
 *                 kalemleri bulur, atıf dizininden etkilenen yazıları listeler. `son_kontrol` TEK BAŞINA işaret üretmez
 *                 (35 günlük tazelemede çoğu kalemin tarihi değişir). Yeni eklenen kalem işaret üretmez.
 *
 * Salt-okuma: yalnız `uret` (kontrolsüz) atif-dizini.json yazar. İtme, PR yorumu, kart açma YOK (bağlama ayrı adım).
 *
 * KULLANIM:
 *   node scripts/mevzuat/bag-kapilari.cjs ma [--dizin=<yol>] [--kok=<depo-kökü>]
 *   node scripts/mevzuat/bag-kapilari.cjs uret [--kontrol] [--dizin=<yol>] [--kok=<depo-kökü>]
 *   node scripts/mevzuat/bag-kapilari.cjs mc [--taban=<eski kayit.json yolu>] [--dizin=<yol>] [--kok=<depo-kökü>]
 *     (--taban verilmezse `git show origin/master:docs/mevzuat/kayit.json`)
 * Çıkış kodu: ma/uret --kontrol ihlalde 1; mc işaret varsa 0 (UYARI kapısı, kırmızı değil).
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const TURLER = new Set(['atif', 'tarih', 'tanim', 'yok'])
const IZLENEN_ALANLAR = ['durum', 'tarihler', 'yerini_aldigi', 'degistirenler']
const VARSAYILAN_DIZIN = 'docs/rehber/mevzuat-bag'
const ATIF_DOSYASI = 'docs/mevzuat/atif-dizini.json'
const KAYIT_DOSYASI = 'docs/mevzuat/kayit.json'

/** Anahtar sırasından bağımsız, kararlı karşılaştırma metni. */
function kararli(x) {
  if (Array.isArray(x)) return '[' + x.map(kararli).join(',') + ']'
  if (x && typeof x === 'object') return '{' + Object.keys(x).sort().map((k) => JSON.stringify(k) + ':' + kararli(x[k])).join(',') + '}'
  return JSON.stringify(x === undefined ? null : x)
}

function kayitKimlikleri(kayit) {
  return new Map((kayit.kalemler || []).map((k) => [k.kimlik, k]))
}

/** Bağ dizinini okur: [{ yazi, kaynaklar, mevzuat, dosya }]; bozuk JSON hata listesine düşer. Dizin yoksa { yok: true }. */
function bagOku(dizin) {
  if (!fs.existsSync(dizin)) return { yok: true, yazilar: [], hatalar: [] }
  const yazilar = []
  const hatalar = []
  for (const ad of fs.readdirSync(dizin).filter((f) => f.endsWith('.json')).sort()) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dizin, ad), 'utf8'))
      yazilar.push({ dosya: ad, yazi: j.yazi, kaynaklar: j.kaynaklar, mevzuat: j.mevzuat })
    } catch (e) {
      hatalar.push(`${ad}: JSON okunamadı (${e.message})`)
    }
  }
  return { yok: false, yazilar, hatalar }
}

/** M-A: saf karar. Dönüş: ihlal metinleri dizisi (boş = temiz). */
function ma(kayit, yazilar) {
  const var_ = kayitKimlikleri(kayit)
  const ihlal = []
  const gorulen = new Set()
  for (const y of yazilar) {
    const ad = y.dosya || y.yazi
    if (typeof y.yazi !== 'string' || !y.yazi) ihlal.push(`${ad}: "yazi" kimliği yok`)
    else if (gorulen.has(y.yazi)) ihlal.push(`${ad}: yazı kimliği ${y.yazi} iki dosyada`)
    else gorulen.add(y.yazi)
    if (!Array.isArray(y.mevzuat)) {
      ihlal.push(`${ad}: "mevzuat" dizi değil (mevzuatsız yazı için [] yazılır)`)
      continue
    }
    if (!Array.isArray(y.kaynaklar)) ihlal.push(`${ad}: "kaynaklar" dizi değil (kaynak numaraları doğrulanamaz)`)
    y.mevzuat.forEach((b, i) => {
      const yer = `${ad} mevzuat[${i}]`
      if (!b || typeof b !== 'object') return ihlal.push(`${yer}: nesne değil`)
      if (typeof b.kayit !== 'string' || !b.kayit) ihlal.push(`${yer}: "kayit" yok`)
      else if (!var_.has(b.kayit)) ihlal.push(`${yer}: kayit ${b.kayit} docs/mevzuat/kayit.json'da yok (kimlik aynen yazılır, yenisi türetilmez)`)
      if (typeof b.bolum !== 'string' || !b.bolum) ihlal.push(`${yer}: "bolum" yok`)
      if (!TURLER.has(b.tur)) ihlal.push(`${yer}: tur ${JSON.stringify(b.tur)} geçersiz (atif, tarih, tanim, yok)`)
      if (b.tur === 'yok' && !(typeof b.not === 'string' && b.not.trim())) ihlal.push(`${yer}: tur=yok bilinçli boşluktur, "not" ile açıklanır`)
      if (!Array.isArray(b.kaynak)) ihlal.push(`${yer}: "kaynak" dizi değil`)
      else {
        if (b.kaynak.length === 0 && b.tur !== 'yok') ihlal.push(`${yer}: "kaynak" boş (yalnız tur=yok boş olabilir)`)
        if (Array.isArray(y.kaynaklar)) {
          for (const n of b.kaynak) if (!y.kaynaklar.includes(n)) ihlal.push(`${yer}: kaynak numarası ${n} yazının kaynaklar listesinde yok`)
        }
      }
    })
  }
  return ihlal
}

/** M-D: atıf dizini (saf, zamansız damga yok: "güncel mi" testi kararlı kalır). tur=yok sayılmaz. */
function atifDizini(yazilar) {
  const kalemler = {}
  for (const y of yazilar) {
    if (!Array.isArray(y.mevzuat) || typeof y.yazi !== 'string') continue
    for (const b of y.mevzuat) {
      if (!b || b.tur === 'yok' || typeof b.kayit !== 'string') continue
      ;(kalemler[b.kayit] ||= new Set()).add(y.yazi)
    }
  }
  const sirali = {}
  for (const k of Object.keys(kalemler).sort()) sirali[k] = [...kalemler[k]].sort()
  return {
    aciklama: 'ÜRETİLMİŞ DOSYA, elle düzenlenmez: node scripts/mevzuat/bag-kapilari.cjs uret (ARC-284, M-D). Kaynak: docs/rehber/mevzuat-bag/*.json',
    atif_yapan_yazilar: sirali,
  }
}

/** M-C: saf karar. Dönüş: [{ kimlik, alanlar:[...], yazilar:[...] }] yalnız değişen VE en az bir yazının andığı kalemler. */
function mc(eskiKayit, yeniKayit, atif) {
  const eski = kayitKimlikleri(eskiKayit)
  const sonuc = []
  for (const yeni of yeniKayit.kalemler || []) {
    const e = eski.get(yeni.kimlik)
    if (!e) continue
    const alanlar = IZLENEN_ALANLAR.filter((a) => kararli(e[a]) !== kararli(yeni[a]))
    if (!alanlar.length) continue
    const yazilar = (atif.atif_yapan_yazilar || {})[yeni.kimlik] || []
    if (yazilar.length) sonuc.push({ kimlik: yeni.kimlik, alanlar, yazilar })
  }
  return sonuc
}

function mcRapor(bulgular) {
  if (!bulgular.length) return 'M-C: kayıt değişikliği bir yazıyı etkilemiyor (durum/tarihler/yerini_aldigi/degistirenler değişen, anılan kalem yok).'
  const satir = bulgular.map((b) => `- ${b.kimlik} (${b.alanlar.join(', ')}) → ${b.yazilar.join(', ')}`)
  const yazilar = [...new Set(bulgular.flatMap((b) => b.yazilar))].sort()
  return ['M-C: mevzuat gözden geçirmesi gerekli yazılar: ' + yazilar.join(', '), ...satir].join('\n')
}

function arg(argv, ad) {
  const a = argv.find((x) => x.startsWith(`--${ad}=`))
  return a ? a.slice(ad.length + 3) : null
}

function main(argv) {
  const [komut, ...rest] = argv
  const kok = path.resolve(arg(rest, 'kok') || process.cwd())
  const dizin = path.resolve(kok, arg(rest, 'dizin') || VARSAYILAN_DIZIN)
  const kayit = JSON.parse(fs.readFileSync(path.join(kok, KAYIT_DOSYASI), 'utf8'))
  const bag = bagOku(dizin)
  if (bag.yok) {
    console.log(`${komut}: bağ dizini yok (${path.relative(kok, dizin)}); 0 yazı okundu, ÖLÇÜLEMEDİ (bağ verisi BLOG tarafından henüz depoya konmadı).`)
    return 0
  }
  if (komut === 'ma') {
    const ihlal = [...bag.hatalar, ...ma(kayit, bag.yazilar)]
    console.log(ihlal.length ? `M-A KIRMIZI (${ihlal.length}):\n` + ihlal.map((s) => '- ' + s).join('\n') : `M-A yeşil: ${bag.yazilar.length} yazı, ${bag.yazilar.reduce((n, y) => n + (y.mevzuat || []).length, 0)} bağ.`)
    return ihlal.length ? 1 : 0
  }
  if (komut === 'uret') {
    const beklenen = JSON.stringify(atifDizini(bag.yazilar), null, 2) + '\n'
    const yol = path.join(kok, ATIF_DOSYASI)
    if (rest.includes('--kontrol')) {
      const mevcut = fs.existsSync(yol) ? fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n') : ''
      if (mevcut === beklenen) return console.log('M-D güncel.'), 0
      console.log(`M-D ESKİ: ${ATIF_DOSYASI} yazı bağından üretilen içerikle uyuşmuyor; çalıştır: node scripts/mevzuat/bag-kapilari.cjs uret`)
      return 1
    }
    fs.writeFileSync(yol, beklenen)
    console.log(`M-D yazıldı: ${ATIF_DOSYASI}`)
    return 0
  }
  if (komut === 'mc') {
    const tabanYol = arg(rest, 'taban')
    let tabanMetin
    if (tabanYol) tabanMetin = fs.readFileSync(path.resolve(kok, tabanYol), 'utf8')
    else {
      const r = spawnSync('git', ['-C', kok, 'show', `origin/master:${KAYIT_DOSYASI}`], { encoding: 'utf8', timeout: 8000, maxBuffer: 64 * 1024 * 1024 })
      if (r.status !== 0) return console.log('M-C: taban (origin/master) okunamadı, ÖLÇÜLEMEDİ:', String(r.stderr).trim().slice(0, 200)), 0
      tabanMetin = r.stdout
    }
    console.log(mcRapor(mc(JSON.parse(tabanMetin), kayit, atifDizini(bag.yazilar))))
    return 0
  }
  console.error('Kullanım: bag-kapilari.cjs ma|uret [--kontrol]|mc [--taban=<yol>] [--dizin=<yol>] [--kok=<yol>]')
  return 2
}

module.exports = { ma, atifDizini, mc, mcRapor, bagOku, kararli, VARSAYILAN_DIZIN, ATIF_DOSYASI }

if (require.main === module) process.exit(main(process.argv.slice(2)))
