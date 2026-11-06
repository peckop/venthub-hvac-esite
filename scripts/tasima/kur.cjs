#!/usr/bin/env node
'use strict'
/**
 * MAKİNE TAŞIMA — KUR (YENİ makinede koşar). ALT-165. Cetvel: docs/standards/makine-tasima-standard.md.
 *
 *   node scripts/tasima/kur.cjs --kaynak <Drive klasörü>            # KURU KOŞUM (varsayılan): plan yazar, hiçbir şey yazmaz
 *   node scripts/tasima/kur.cjs --gercek --kaynak <Drive klasörü> [--uzerine-yaz]
 *
 * Sırayla: icindekiler.json okunur -> parça sha256'ları doğrulanır -> git depoları kurulur (uzaktan klon, sonra
 * bundle'dan dallar/etiketler/stash) -> parçalar yeni ev dizinine açılır (her dosya sha256 ile doğrulanır, tek
 * bayt tutmazsa DURUR) -> yapılandırma dosyalarında ESKİ ev yolu YENİ yolla değiştirilir (önce .oncesi-tasima
 * yedeği; JSON dosyaları JSON kalır) -> sır parçası gpg ile çözülüp açılır (parolayı Recep gpg'nin penceresine yazar).
 *
 * ~/.claude/projects klasör adları yoldan türer; açılırken eski ev slug'ı yenisiyle değiştirilir.
 * Var olan dosyanın üstüne YAZMAZ: içerik farklıysa işlem başlamadan durur. `--uzerine-yaz` ile farklı olan
 * dosya önce <dosya>.mevcut-oncesi-tasima olarak saklanır, sonra yazılır; içeriği aynı olan dosyaya dokunulmaz.
 * Kayıtsız (icindekiler.json'da olmayan) dosya arşivde çıkarsa işlem DURUR.
 *
 * Çıkış: 0 tamam · 1 kırmızı · 2 kullanım hatası.
 */
const fs = require('node:fs')
const path = require('node:path')

const C = require('./cekirdek.cjs')
const E = require('./envanter.cjs')
const G = require('./git.cjs')

const SEMA = {
  bayrak: ['gercek', 'uzerine-yaz', 'git-atla', 'yardim'],
  deger: ['kaynak', 'ev', 'tmp-kok', 'appdata', 'ana-depo', 'gpg', 'parcalar'],
  coklu: ['yol-esle'],
}
const SIRA = ['ayar', 'hafiza', 'wrongstack', 'db', 'ingestor', 'arsiv', 'gorsel', 'transkript']
const METIN_UZANTI = /\.(json|cmd|bat|ps1|sh|md|toml|ya?ml|txt|ini|env)$/i

function log(...a) {
  process.stdout.write(`${a.join(' ')}\n`)
}

/** --kaynak: ya paket klasörü (icindekiler.json içerir) ya da onun üstü (en yeni tasima-*). */
function paketKlasoru(kaynak) {
  const k = path.resolve(kaynak)
  if (fs.existsSync(path.join(k, 'icindekiler.json'))) return k
  let adaylar = []
  try {
    adaylar = fs.readdirSync(k, { withFileTypes: true }).filter((d) => d.isDirectory() && /^tasima-/.test(d.name) && fs.existsSync(path.join(k, d.name, 'icindekiler.json'))).map((d) => d.name).sort()
  } catch {
    /* okunamadı */
  }
  if (!adaylar.length) throw new Error(`${k} içinde tamamlanmış paket (icindekiler.json) yok; yarım paket kurulmaz`)
  return path.join(k, adaylar[adaylar.length - 1])
}

function yeniKokler(ic, a) {
  const k = E.kokleriCoz({ ev: a.deger.ev, tmp: a.deger['tmp-kok'], appdata: a.deger.appdata, anaDepo: a.deger['ana-depo'] })
  if (!a.deger['ana-depo']) {
    const eskiEv = path.resolve(ic.kokler.ev)
    const goreli = path.relative(eskiEv, path.resolve(ic.kokler.depo))
    // Eski ana depo ev'in altındaysa aynı göreli yere; değilse <yeni ev>/venthub-hvac
    k.depo = !goreli.startsWith('..') && !path.isAbsolute(goreli) ? path.join(k.ev, goreli) : path.join(k.ev, 'venthub-hvac')
  }
  return k
}

/** Eski -> yeni kök eşlemeleri (yapılandırma metni ve proje klasör adı dönüşümü için). */
function eslemeler(ic, yeni, ekstra) {
  const e = [
    { eski: ic.kokler.ev, yeni: yeni.ev },
    { eski: ic.kokler.tmp, yeni: yeni.tmp },
    { eski: ic.kokler.appdata, yeni: yeni.appdata },
    { eski: ic.kokler.depo, yeni: yeni.depo },
  ]
  for (const s of ekstra || []) {
    const i = s.indexOf('=')
    if (i <= 0) throw new Error(`--yol-esle eski=yeni biçiminde olmalı: ${s}`)
    e.push({ eski: s.slice(0, i), yeni: s.slice(i + 1) })
  }
  return e
}

function hedefBul(mantiksal, kokHaritasi, esleme) {
  const p = mantiksal.split('/')
  if (p[0] === 'ev' && p[1] === '.claude' && p[2] === 'projects' && p[3]) {
    p[3] = C.projeKlasorunuYenidenAdlandir(p[3], esleme)
  }
  return C.hedefYolu(p.join('/'), kokHaritasi)
}

function ayniMi(yol, kayit) {
  try {
    const st = fs.statSync(yol)
    return st.isFile() && st.size === kayit.bayt && C.sha256Dosya(yol) === kayit.sha256
  } catch {
    return false
  }
}

function varMi(yol) {
  try {
    fs.lstatSync(yol)
    return true
  } catch {
    return false
  }
}

/** Yedek soneki: yol yazımından önceki paket içeriği .oncesi-tasima; yeni makinenin kendi dosyası .mevcut-oncesi-tasima. */
function yedekAl(yol, sonek = '.oncesi-tasima') {
  fs.copyFileSync(yol, `${yol}${sonek}`)
}

/** Manifestteki (sır olmayan) dosyaların hedef yolları ve çakışmaları. */
function cakismalar(ic, secili, kokHaritasi, esleme) {
  const farkli = []
  let ayni = 0
  let yok = 0
  for (const d of ic.dosyalar) {
    if (secili && !secili.has(d.parca)) continue
    const hedef = hedefBul(d.yol, kokHaritasi, esleme)
    if (!varMi(hedef)) yok += 1
    else if (ayniMi(hedef, d)) ayni += 1
    else farkli.push(hedef)
  }
  return { farkli, ayni, yok }
}

function yenidenYazilacakMi(ev, hedef) {
  const goreli = path.relative(ev, hedef).split(path.sep).join('/')
  return E.YOL_YENIDEN_YAZILACAK.find((r) => r.desen.test(goreli)) || null
}

function degisenEskiKokler(ic, yeni) {
  const cift = [
    [ic.kokler.ev, yeni.ev],
    [ic.kokler.tmp, yeni.tmp],
    [ic.kokler.appdata, yeni.appdata],
    [ic.kokler.depo, yeni.depo],
  ]
  return cift.filter(([e, y]) => path.resolve(e).toLowerCase() !== path.resolve(y).toLowerCase()).map(([e]) => e)
}

function planYazdir(ic, pkg, yeni, esleme, sec, a) {
  log('── MAKİNE TAŞIMA · KUR · KURU KOŞUM (hiçbir şey yazılmadı) ──')
  log(`paket   : ${pkg}  (${ic.damga}, ${ic.makine && ic.makine.bilgisayar ? `eski makine ${ic.makine.bilgisayar}` : 'eski makine ?'})`)
  log('')
  log('YOL DÖNÜŞÜMÜ (eski -> yeni):')
  for (const e of esleme) log(`  ${e.eski}  ->  ${e.yeni}${path.resolve(e.eski).toLowerCase() === path.resolve(e.yeni).toLowerCase() ? '   (değişmiyor)' : ''}`)
  if (!degisenEskiKokler(ic, yeni).length && !esleme.slice(4).length) log('  yol dönüşümü gerekmiyor (kökler aynı)')
  log('')
  log('PARÇA        DOSYA    BOYUT       PARÇA DOSYASI')
  for (const p of ic.parcalar) {
    if (p.ad !== 'sirlar' && sec && !sec.has(p.ad)) continue
    if (p.ad === 'sirlar' && sec && !sec.has('sirlar')) continue
    const var_ = fs.existsSync(path.join(pkg, p.dosya))
    log(`${p.ad.padEnd(12)} ${String(p.dosyaSayisi).padStart(6)}  ${C.bicimBayt(p.bayt).padStart(9)}   ${var_ ? 'var' : 'YOK!'}${p.sifreli ? '   (gpg parolası gerekir)' : ''}`)
  }
  const c = cakismalar(ic, sec, hedefHaritasi(yeni), esleme)
  log('')
  log(`ÇAKIŞMA: ${c.farkli.length} dosya farklı içerikle var, ${c.ayni} aynı içerikle var, ${c.yok} yok`)
  for (const f of c.farkli.slice(0, 10)) log(`  farklı: ${f}`)
  if (c.farkli.length) log(`  --uzerine-yaz olmadan --gercek BAŞLAMAZ; bayrakla farklı olanlar .mevcut-oncesi-tasima olarak saklanır`)
  const yaz = ic.dosyalar.filter((d) => (!sec || sec.has(d.parca)) && yenidenYazilacakMi(yeni.ev, hedefBul(d.yol, hedefHaritasi(yeni), esleme)))
  log(`YOLU YENİDEN YAZILACAK dosya: ${yaz.length}${yaz.length ? ` (${yaz.slice(0, 6).map((d) => path.basename(d.yol)).join(', ')}${yaz.length > 6 ? ', …' : ''})` : ''}`)
  const projeler = [...new Set(ic.dosyalar.map((d) => d.yol.split('/')).filter((p) => p[0] === 'ev' && p[1] === '.claude' && p[2] === 'projects' && p[3]).map((p) => p[3]))]
  if (projeler.length) {
    log(`PROJE KLASÖRÜ yeniden adlandırma (${projeler.length}):`)
    for (const p of projeler.slice(0, 4)) log(`  ${p}  ->  ${C.projeKlasorunuYenidenAdlandir(p, esleme)}`)
  }
  if (!a.bayrak['git-atla']) {
    log('')
    log('GİT DEPOLARI:')
    for (const g of ic.git || []) {
      if (!g.var) {
        log(`  ${g.ad.padEnd(21)} (eski makinede yoktu)`)
        continue
      }
      const hedef = path.join(yeni[g.kok], ...g.yol.split('/').filter(Boolean))
      log(`  ${g.ad.padEnd(21)} -> ${hedef}  [${g.uzak ? 'uzaktan klon' : 'bundle\'dan klon'}${g.bundle ? ` + bundle ${C.bicimBayt(g.bundle.bayt)}` : ''}] ileri ${g.ahead}, stash ${g.stash.length}, kirli(eski) ${g.kirliSayisi}${varMi(hedef) && fs.readdirSync(hedef).length ? '  HEDEF DOLU' : ''}`)
    }
  }
  log('')
  log('Gerçek koşum: aynı komut + --gercek (sır parçası varsa gpg parola penceresi açılır).')
}

function hedefHaritasi(yeni) {
  return { ev: yeni.ev, tmp: yeni.tmp, appdata: yeni.appdata, depo: yeni.depo }
}

// ── Çıkarma ──────────────────────────────────────────────────────────────
function cikarParca(pkg, parca, kayitlar, kokHaritasi, esleme, uzerineYaz, cikanlar) {
  const fd = fs.openSync(path.join(pkg, parca.dosya), 'r')
  let n = 0
  try {
    C.tarOku(C.dosyaKaynagi(fd), (g) => {
      const kayit = kayitlar.get(g.ad)
      if (!kayit) throw new Error(`arşivde icindekiler.json'da OLMAYAN dosya: ${g.ad}`)
      const hedef = hedefBul(g.ad, kokHaritasi, esleme)
      if (varMi(hedef) && ayniMi(hedef, kayit)) return null
      if (varMi(hedef) && !uzerineYaz) throw new Error(`hedef dolu (--uzerine-yaz yok): ${hedef}`)
      return cikarSink(hedef, kayit, g.mtime, () => {
        n += 1
        cikanlar.push({ hedef, kayit })
      })
    })
  } finally {
    fs.closeSync(fd)
  }
  return n
}

function cikarSink(hedef, kayit, mtime, bitti) {
  fs.mkdirSync(path.dirname(hedef), { recursive: true })
  const tmp = `${hedef}.tasima-tmp`
  fs.rmSync(tmp, { force: true })
  const w = C.dosyaYazici(tmp)
  return {
    yaz: (b) => w.yaz(b),
    bitir() {
      const r = w.kapat()
      if (r.bayt !== kayit.bayt || r.sha256 !== kayit.sha256) {
        fs.rmSync(tmp, { force: true })
        throw new Error(`sha256 tutmuyor, DURDU: ${kayit.yol}`)
      }
      if (varMi(hedef)) {
        yedekAl(hedef, '.mevcut-oncesi-tasima')
        fs.rmSync(hedef, { force: true })
      }
      fs.renameSync(tmp, hedef)
      if (mtime) {
        try {
          fs.utimesSync(hedef, mtime, mtime)
        } catch {
          /* zaman damgası ayarlanamadı: içerik doğrulandı, kritik değil */
        }
      }
      bitti()
    },
  }
}

// ── Yol yeniden yazımı ───────────────────────────────────────────────────
function yapilandirmayiYenidenYaz(cikanlar, yeni, esleme, eskiKokler, log_) {
  let dosya = 0
  let degisiklik = 0
  const hatalar = []
  for (const { hedef } of cikanlar) {
    const kural = yenidenYazilacakMi(yeni.ev, hedef)
    if (!kural) continue
    const once = fs.readFileSync(hedef, 'utf8')
    let sonuc
    try {
      sonuc = kural.json ? C.jsonGuvenliYenidenYaz(once, esleme) : C.yoluYenidenYaz(once, esleme)
    } catch (e) {
      hatalar.push(`${hedef}: ${e.message}`)
      continue
    }
    if (sonuc.degisiklik === 0) continue
    const kontrol = C.yenidenYazimDogrula(sonuc.metin, eskiKokler, { json: kural.json })
    if (kontrol.length) {
      hatalar.push(`${hedef}: ${kontrol.join('; ')}`)
      continue
    }
    yedekAl(hedef)
    fs.writeFileSync(hedef, sonuc.metin)
    dosya += 1
    degisiklik += sonuc.degisiklik
    log_(`  yazıldı ${path.relative(yeni.ev, hedef).split(path.sep).join('/')}: ${sonuc.degisiklik} yer (yedek .oncesi-tasima)`)
  }
  return { dosya, degisiklik, hatalar }
}

/** Yeniden yazılmayan ama eski yol içeren yapılandırma dosyaları (elle bakılacak). */
function eskiYolKalanlar(cikanlar, yeni, eskiKokler) {
  const liste = []
  for (const { hedef, kayit } of cikanlar) {
    if (kayit.parca !== 'ayar' || yenidenYazilacakMi(yeni.ev, hedef) || !METIN_UZANTI.test(hedef) || kayit.bayt > 2 * 1024 * 1024) continue
    let n = 0
    try {
      n = C.eskiYolSay(fs.readFileSync(hedef, 'utf8'), eskiKokler)
    } catch {
      continue
    }
    if (n) liste.push({ hedef: path.relative(yeni.ev, hedef).split(path.sep).join('/'), n })
  }
  return liste
}

// ── Sırlar ───────────────────────────────────────────────────────────────
function sirlariAc(pkg, parca, gpg, kokHaritasi, esleme, uzerineYaz, eskiKokler) {
  const duz = C.gpgCoz(path.join(pkg, parca.dosya), gpg.yol)
  const girdiler = new Map()
  C.tarOku(C.bellekKaynagi(duz), (g) => {
    const parcalar = []
    return { yaz: (b) => parcalar.push(Buffer.from(b)), bitir: () => girdiler.set(g.ad, { ...g, icerik: Buffer.concat(parcalar) }) }
  })
  const ozet = girdiler.get('_sirlar-icindekiler.json')
  if (!ozet) throw new Error('şifreli parçada _sirlar-icindekiler.json yok: parça eksik/bozuk')
  const dahili = JSON.parse(ozet.icerik.toString('utf8'))
  const sonuc = { yazilan: 0, ayni: 0, eskiYolluDosya: [], hatalar: [] }
  const crypto = require('node:crypto')
  // 1) hepsini doğrula ve çakışmaları ÖNCEDEN bul (yarım sır kurulumu bırakma)
  const isler = []
  for (const k of dahili.dosyalar) {
    const g = girdiler.get(k.yol)
    if (!g) throw new Error(`sır dosyası arşivde yok: ${k.yol}`)
    if (crypto.createHash('sha256').update(g.icerik).digest('hex') !== k.sha256 || g.icerik.length !== k.bayt) throw new Error(`sır dosyası sha256 tutmuyor: ${k.yol}`)
    const hedef = hedefBul(k.yol, kokHaritasi, esleme)
    if (varMi(hedef)) {
      if (ayniMi(hedef, k)) {
        sonuc.ayni += 1
        continue
      }
      if (!uzerineYaz) throw new Error(`hedef dolu (--uzerine-yaz yok): ${hedef}`)
    }
    isler.push({ k, g, hedef })
  }
  for (const girdi of girdiler.keys()) {
    if (girdi !== '_sirlar-icindekiler.json' && !dahili.dosyalar.some((k) => k.yol === girdi)) throw new Error(`şifreli parçada kayıtsız dosya: ${girdi}`)
  }
  // 2) yaz
  for (const { k, g, hedef } of isler) {
    fs.mkdirSync(path.dirname(hedef), { recursive: true })
    if (varMi(hedef)) yedekAl(hedef, '.mevcut-oncesi-tasima')
    fs.writeFileSync(hedef, g.icerik, { mode: 0o600 })
    sonuc.yazilan += 1
    if (METIN_UZANTI.test(hedef) || /\.(key|keys|pem)$/i.test(hedef) || /\/\.env/.test(k.yol)) {
      const n = C.eskiYolSay(g.icerik.toString('utf8'), eskiKokler)
      if (n) sonuc.eskiYolluDosya.push(`${k.yol} (${n})`)
    }
  }
  return sonuc
}

function main(argv) {
  let a
  try {
    a = C.argumanlariAyir(argv, SEMA)
  } catch (e) {
    process.stderr.write(`kur: ${e.message}\n`)
    return 2
  }
  if (a.bayrak.yardim || !a.deger.kaynak) {
    log('kullanım: kur.cjs --kaynak <Drive klasörü> [--gercek] [--uzerine-yaz] [--parcalar a,b] [--git-atla] [--ev --tmp-kok --appdata --ana-depo] [--yol-esle eski=yeni]… [--gpg <yol>]')
    return a.bayrak.yardim ? 0 : 2
  }
  try {
    const pkg = paketKlasoru(a.deger.kaynak)
    const ic = JSON.parse(fs.readFileSync(path.join(pkg, 'icindekiler.json'), 'utf8'))
    const bicim = C.icindekilerBicimHatalari(ic)
    if (bicim.length) {
      process.stderr.write(`kur: icindekiler.json geçersiz: ${bicim.join('; ')}\n`)
      return 1
    }
    const yeni = yeniKokler(ic, a)
    const esleme = eslemeler(ic, yeni, a.coklu['yol-esle'])
    const sec = a.deger.parcalar ? new Set(a.deger.parcalar.split(',').map((s) => s.trim()).filter(Boolean)) : null
    if (!a.bayrak.gercek) {
      planYazdir(ic, pkg, yeni, esleme, sec, a)
      return 0
    }
    return gercekKos(ic, pkg, yeni, esleme, sec, a)
  } catch (e) {
    process.stderr.write(`kur: HATA — ${e.message}\n`)
    return 1
  }
}

function gercekKos(ic, pkg, yeni, esleme, sec, a) {
  const uzerineYaz = Boolean(a.bayrak['uzerine-yaz'])
  const kokHaritasi = hedefHaritasi(yeni)
  const eskiKokler = degisenEskiKokler(ic, yeni)
  const secilen = (ad) => !sec || sec.has(ad)
  log(`PAKET: ${pkg}`)

  // 1) Bütünlük: hiçbir şey yazmadan ÖNCE
  const parcaAdlari = ic.parcalar.map((p) => p.ad).filter(secilen)
  const hatalar = C.parcalariDogrula(ic, pkg, { sha: true, parcalar: parcaAdlari })
  if (hatalar.length) {
    process.stderr.write(`kur: PAKET BOZUK, hiçbir şey yazılmadı:\n  ${hatalar.join('\n  ')}\n`)
    return 1
  }
  log(`bütünlük  : ${parcaAdlari.length} parça sha256 ile doğrulandı`)

  // 2) Çakışma: hiçbir şey yazmadan ÖNCE
  const c = cakismalar(ic, sec, kokHaritasi, esleme)
  if (c.farkli.length && !uzerineYaz) {
    process.stderr.write(`kur: ${c.farkli.length} dosya hedefte farklı içerikle var; DURDU (hiçbir şey yazılmadı). İlk üçü:\n  ${c.farkli.slice(0, 3).join('\n  ')}\n  --uzerine-yaz ile farklı olanlar .mevcut-oncesi-tasima olarak saklanıp yazılır\n`)
    return 1
  }

  let kirmizi = false
  // 3) Git (klon hedef boş olmalı: dosya çıkarmadan ÖNCE)
  if (!a.bayrak['git-atla'] && secilen('git')) {
    for (const g of ic.git || []) {
      if (!g.var) continue
      const hedef = path.join(yeni[g.kok], ...g.yol.split('/').filter(Boolean))
      const refsMetin = fs.readFileSync(path.join(pkg, g.refs.dosya), 'utf8')
      if (C.sha256Dosya(path.join(pkg, g.refs.dosya)) !== g.refs.sha256) throw new Error(`git ${g.ad}: refs dosyası sha256 tutmuyor`)
      const r = G.depoyuKur({
        ad: g.ad,
        hedef,
        uzak: g.uzak,
        bundle: g.bundle ? path.join(pkg, g.bundle.dosya) : null,
        refs: G.refListesiAyir(refsMetin),
        stash: g.stash,
      })
      log(`git ${g.ad.padEnd(21)}: ${r.ok ? 'TAMAM' : 'KIRMIZI'} ${r.notlar.join(' · ')}${r.hata ? ` — ${r.hata}` : ''}`)
      if (!r.ok) kirmizi = true
    }
  }

  // 4) Parçalar
  const cikanlar = []
  const kayitlar = new Map(ic.dosyalar.map((d) => [d.yol, d]))
  for (const ad of SIRA) {
    const p = ic.parcalar.find((x) => x.ad === ad)
    if (!p || !secilen(ad)) continue
    const n = cikarParca(pkg, p, kayitlar, kokHaritasi, esleme, uzerineYaz, cikanlar)
    log(`açıldı    : ${ad.padEnd(11)} ${n} dosya yazıldı (${p.dosyaSayisi - n} zaten aynıydı)`)
  }

  // 5) Yol yeniden yazımı
  if (eskiKokler.length) {
    const y = yapilandirmayiYenidenYaz(cikanlar, yeni, esleme, eskiKokler, log)
    log(`yol yazımı: ${y.dosya} dosya, ${y.degisiklik} yer`)
    for (const h of y.hatalar) {
      process.stderr.write(`  YOL YAZIMI HATASI: ${h}\n`)
      kirmizi = true
    }
    const kalan = eskiYolKalanlar(cikanlar, yeni, eskiKokler)
    if (kalan.length) log(`  ELLE BAKILACAK (eski yol var, yazılmadı): ${kalan.slice(0, 8).map((k) => `${k.hedef} (${k.n})`).join(', ')}${kalan.length > 8 ? ` … +${kalan.length - 8}` : ''}`)
  } else {
    log('yol yazımı: kökler aynı, gerekmedi')
  }

  // 6) Sırlar
  const sir = ic.parcalar.find((p) => p.ad === 'sirlar')
  if (sir && secilen('sirlar')) {
    const gpg = C.gpgBul(a.deger.gpg || null)
    if (!gpg) {
      process.stderr.write('kur: gpg bulunamadı; sır parçası açılamadı (Git for Windows kurulumunu ya da --gpg <yol> verin)\n')
      kirmizi = true
    } else {
      log('sırlar    : gpg parola penceresi açılacak, parolayı SİZ yazın…')
      try {
        const s = sirlariAc(pkg, sir, gpg, kokHaritasi, esleme, uzerineYaz, eskiKokler)
        log(`sırlar    : ${s.yazilan} dosya yazıldı, ${s.ayni} zaten aynıydı${s.eskiYolluDosya.length ? ` · eski yol içeren (elle bakılacak): ${s.eskiYolluDosya.join(', ')}` : ''}`)
      } catch (e) {
        process.stderr.write(`kur: sır parçası açılamadı — ${e.message}\n`)
        kirmizi = true
      }
    }
  }

  log('')
  log(kirmizi ? 'KUR KIRMIZI: yukarıdaki hatalara bak' : 'KUR TAMAM')
  log('sonraki adımlar (kitap §Taşıma günü, yeni makine): pnpm install --frozen-lockfile · dogrula.cjs --karsilastir <eski.json> · unopim-yedek.cjs coz/dene · VentHub-Drive-Yedek görevini yeniden kur')
  return kirmizi ? 1 : 0
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { main, paketKlasoru, eslemeler, hedefBul, degisenEskiKokler }
