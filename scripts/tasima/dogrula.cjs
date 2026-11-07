#!/usr/bin/env node
'use strict'
/**
 * MAKİNE TAŞIMA — DOĞRULA (iki makinede de koşar). ALT-165. Cetvel: docs/standards/makine-tasima-standard.md.
 *
 *   node scripts/tasima/dogrula.cjs                              # ölçer ve yazar
 *   node scripts/tasima/dogrula.cjs --cikti eski.json            # ESKİ makinede, paketlemeden hemen önce
 *   node scripts/tasima/dogrula.cjs --karsilastir eski.json      # YENİ makinede: ölç + eski ölçümle karşılaştır
 *   ... --eski-ev <yol> --ev <yol> --ana-depo <yol> --siki
 *
 * Ölçülenler: kanban pano/kart/olay/bütünlük · sage kayıt · posta kutusu/kayıt · hafıza md ve hafıza klasörü ·
 * kancalarda başvurulan betik dosyaları (eksik sayısı) · ayar dosyalarında ESKİ ev yolu (yeni makinede 0 olmalı) ·
 * araç sürümleri. Sayım işlevleri scripts/hijyen/sage-yedek.cjs'ten gelir (ikinci okuyucu yazılmaz).
 *
 * Karşılaştırma kuralı: veri sayıları "yeni >= eski" olmalı (kayıp = KIRMIZI). Yeni makinede iş yapıldıkça sayılar
 * artar; artış uyarı olarak yazılır, hata sayılmaz. `--siki` ile tam eşitlik istenir. Eksik araç = KIRMIZI, farklı
 * araç sürümü = UYARI. Çıkış: 0 temiz · 1 fark var · 2 kullanım hatası.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const C = require('./cekirdek.cjs')
const E = require('./envanter.cjs')

const SEMA = { bayrak: ['siki', 'yardim'], deger: ['cikti', 'karsilastir', 'ev', 'ana-depo', 'eski-ev'] }
const BETIK_DESENI = /(?:[A-Za-z]:)?[^\s"'`|;&<>()=]+\.(?:cjs|mjs|js|sh|py|cmd|ps1|bat)\b/g

function log(...a) {
  process.stdout.write(`${a.join(' ')}\n`)
}

function sageModulu() {
  return require('../hijyen/sage-yedek.cjs')
}

function mdSay(dizin) {
  let n = 0
  const yigin = [dizin]
  while (yigin.length) {
    const d = yigin.pop()
    let girdiler
    try {
      girdiler = fs.readdirSync(d, { withFileTypes: true })
    } catch {
      continue
    }
    for (const g of girdiler) {
      if (g.name === '.git' || g.isSymbolicLink()) continue
      if (g.isDirectory()) yigin.push(path.join(d, g.name))
      else if (g.isFile() && /\.md$/i.test(g.name)) n += 1
    }
  }
  return n
}

/** settings nesnesindeki kanca komutlarından betik yollarını çıkarır. SAF. */
function kancaKomutlari(settings) {
  const komutlar = []
  const hooks = settings && typeof settings === 'object' ? settings.hooks : null
  if (!hooks || typeof hooks !== 'object') return komutlar
  for (const grup of Object.values(hooks)) {
    if (!Array.isArray(grup)) continue
    for (const g of grup) {
      for (const h of (g && g.hooks) || []) if (h && typeof h.command === 'string') komutlar.push(h.command)
    }
  }
  return komutlar
}

function betikAdaylari(komut, ev, depo) {
  const bulunan = komut.match(BETIK_DESENI) || []
  return bulunan.map((t) => {
    let s = t
      .replace(/\$\{?CLAUDE_PROJECT_DIR(?::-[^}]*)?\}?/g, depo)
      .replace(/%CLAUDE_PROJECT_DIR%/g, depo)
      .replace(/\$\{?HOME\}?/g, ev)
      .replace(/^~(?=[\\/])/, ev)
    s = s.replace(/^"+|"+$/g, '')
    return path.isAbsolute(s) || /^[A-Za-z]:/.test(s) ? s : path.join(depo, s)
  })
}

/** Kancalarda başvurulan betik dosyalarının var/yok sayımı. */
function kancalariOlc(ev, depo) {
  const ayarlar = [path.join(ev, '.claude', 'settings.json'), path.join(depo, '.claude', 'settings.json'), path.join(depo, '.claude', 'settings.local.json')]
  const gorulen = new Set()
  const eksik = []
  let kanca = 0
  for (const f of ayarlar) {
    let s
    try {
      s = JSON.parse(fs.readFileSync(f, 'utf8'))
    } catch {
      continue
    }
    for (const komut of kancaKomutlari(s)) {
      kanca += 1
      for (const b of betikAdaylari(komut, ev, depo)) {
        if (gorulen.has(b)) continue
        gorulen.add(b)
        if (!fs.existsSync(b)) eksik.push(path.relative(depo, b).startsWith('..') ? b : path.relative(depo, b).split(path.sep).join('/'))
      }
    }
  }
  return { kanca, betik: gorulen.size, eksik }
}

function olc(opt = {}) {
  const kokler = E.kokleriCoz({ ev: opt.ev, anaDepo: opt.anaDepo })
  const sage = sageModulu()
  const sayimlar = {}

  const kanbanYol = path.join(kokler.depo, '.wrongstack', 'kanbans', '_kanban.sqlite')
  sayimlar.kanban = fs.existsSync(kanbanYol) ? sage.kanbanSayim(kanbanYol) : null

  const sageYol = path.join(kokler.depo, '.wrongstack', 'memories', 'sage.db')
  if (fs.existsSync(sageYol)) {
    const iz = sage.parmakIzi(sageYol, 'memories')
    sayimlar.sage = { kayit: iz.sayi, aktif: iz.aktif }
  } else sayimlar.sage = null

  const postaKoku = path.join(kokler.ev, '.wrongstack', 'projects')
  const kutular = sage.postaDepolari(postaKoku)
  let toplam = 0
  const sorunlu = []
  for (const k of kutular) {
    try {
      toplam += sage.parmakIzi(k.mutlak, null).sayi
    } catch (e) {
      sorunlu.push(`${k.ad}: ${String(e.message).slice(0, 60)}`)
    }
  }
  sayimlar.posta = { kutuSayisi: kutular.length, toplamKayit: toplam, okunamayan: sorunlu }

  const projeler = path.join(kokler.ev, '.claude', 'projects')
  let md = 0
  let klasor = 0
  try {
    for (const d of fs.readdirSync(projeler, { withFileTypes: true })) {
      const m = path.join(projeler, d.name, 'memory')
      // Yalnız içinde md olan klasör sayılır: boş memory klasörleri pakete girmez (tar boş dizin taşımaz)
      // ve c--/C-- yazımlı iki klasör yeni makinede birleşebilir; boşları saymak sahte KAYIP verdi
      // (ölçüldü 2026-11-07 prova: eski 44, yeni 18; farkın 26'sı boş, md sayısı iki tarafta 1509).
      const n = d.isDirectory() && fs.existsSync(m) ? mdSay(m) : 0
      if (n > 0) {
        klasor += 1
        md += n
      }
    }
  } catch {
    /* projects yok */
  }
  sayimlar.hafizaMd = md
  sayimlar.hafizaKlasorSayisi = klasor

  sayimlar.kancalar = kancalariOlc(kokler.ev, kokler.depo)

  let eskiEv = opt.eskiEv || null
  if (eskiEv && path.resolve(eskiEv).toLowerCase() === path.resolve(kokler.ev).toLowerCase()) eskiEv = null
  if (eskiEv) {
    const dosyalar = ['.claude.json', '.claude/settings.json', '.claude/settings.local.json']
    sayimlar.ayarEskiYol = { eskiEv: '(verildi)', dosyalar: {}, toplam: 0 }
    for (const f of dosyalar) {
      const yol = path.join(kokler.ev, ...f.split('/'))
      if (!fs.existsSync(yol)) continue
      const n = C.eskiYolSay(fs.readFileSync(yol, 'utf8'), [eskiEv])
      sayimlar.ayarEskiYol.dosyalar[f] = n
      sayimlar.ayarEskiYol.toplam += n
    }
  } else sayimlar.ayarEskiYol = null

  const araclar = {}
  for (const [ad, v] of Object.entries(C.aracSurumleri())) araclar[ad] = v ? v.surum : null

  return {
    surum: 1,
    olcum: new Date().toISOString(),
    host: { platform: process.platform, bilgisayar: os.hostname(), node: process.version },
    ev: kokler.ev,
    depo: kokler.depo,
    sayimlar,
    araclar,
  }
}

/**
 * Eski ve yeni ölçümü karşılaştırır. SAF (diske/komuta dokunmaz).
 * @returns {{farklar: string[], uyarilar: string[]}}
 */
function karsilastir(eski, yeni, { siki = false } = {}) {
  const farklar = []
  const uyarilar = []
  const se = (eski && eski.sayimlar) || {}
  const sy = (yeni && yeni.sayimlar) || {}

  const say = (ad, e, y) => {
    if (e === null || e === undefined) return
    if (y === null || y === undefined) {
      farklar.push(`${ad}: eski makinede ${e}, yenide ÖLÇÜLEMEDİ/YOK`)
    } else if (y < e) farklar.push(`${ad}: KAYIP — eski ${e}, yeni ${y}`)
    else if (y > e) (siki ? farklar : uyarilar).push(`${ad}: yeni ${y} > eski ${e}${siki ? ' (--siki: eşitlik istendi)' : ' (artış: kayıp değil)'}`)
  }

  if (se.kanban) {
    if (!sy.kanban) farklar.push('kanban: eski makinede pano vardı, yenide YOK')
    else {
      say('kanban.pano', se.kanban.pano, sy.kanban.pano)
      say('kanban.kart', se.kanban.kart, sy.kanban.kart)
      if (se.kanban.olay !== null && se.kanban.olay !== undefined) say('kanban.olay', se.kanban.olay, sy.kanban.olay)
      if (sy.kanban.butunluk !== 'ok') farklar.push(`kanban: bütünlük denetimi ${sy.kanban.butunluk}`)
      if (sy.kanban.bozukPayload > 0) farklar.push(`kanban: ${sy.kanban.bozukPayload} pano yükü okunamıyor`)
    }
  }
  if (se.sage) {
    if (!sy.sage) farklar.push('sage: eski makinede vardı, yenide YOK')
    else {
      say('sage.kayit', se.sage.kayit, sy.sage.kayit)
      say('sage.aktif', se.sage.aktif, sy.sage.aktif)
    }
  }
  if (se.posta) {
    say('posta.kutuSayisi', se.posta.kutuSayisi, sy.posta ? sy.posta.kutuSayisi : null)
    say('posta.toplamKayit', se.posta.toplamKayit, sy.posta ? sy.posta.toplamKayit : null)
    if (sy.posta && sy.posta.okunamayan && sy.posta.okunamayan.length) farklar.push(`posta: okunamayan kutu ${sy.posta.okunamayan.join(' | ')}`)
  }
  say('hafizaMd', se.hafizaMd, sy.hafizaMd)
  say('hafizaKlasorSayisi', se.hafizaKlasorSayisi, sy.hafizaKlasorSayisi)

  if (sy.kancalar && sy.kancalar.eksik && sy.kancalar.eksik.length) {
    farklar.push(`kancalar: ${sy.kancalar.eksik.length} betik dosyası YOK -> ${sy.kancalar.eksik.slice(0, 5).join(', ')}`)
  }
  if (sy.ayarEskiYol && sy.ayarEskiYol.toplam > 0) {
    farklar.push(`ayar dosyalarında ${sy.ayarEskiYol.toplam} yerde ESKİ ev yolu kaldı (0 olmalı): ${JSON.stringify(sy.ayarEskiYol.dosyalar)}`)
  } else if (!sy.ayarEskiYol) uyarilar.push('ayar dosyalarında eski yol denetimi YAPILMADI (--eski-ev verilmedi ya da kökler aynı)')

  const ae = (eski && eski.araclar) || {}
  const ay = (yeni && yeni.araclar) || {}
  for (const [ad, s] of Object.entries(ae)) {
    if (s === null || s === undefined) continue
    if (ay[ad] === null || ay[ad] === undefined) farklar.push(`araç ${ad}: eski makinede ${s}, yenide KURULU DEĞİL`)
    else if (ay[ad] !== s) uyarilar.push(`araç ${ad}: sürüm farkı (eski ${s}, yeni ${ay[ad]})`)
  }
  return { farklar, uyarilar }
}

function yazdir(m) {
  const s = m.sayimlar
  log(`ölçüm    : ${m.olcum} · ${m.host.platform} · ${m.host.bilgisayar}`)
  log(`kanban   : ${s.kanban ? `${s.kanban.pano} pano / ${s.kanban.kart} kart / ${s.kanban.olay} olay · bütünlük ${s.kanban.butunluk}` : 'YOK'}`)
  log(`sage     : ${s.sage ? `${s.sage.kayit} kayıt (aktif ${s.sage.aktif})` : 'YOK'}`)
  log(`posta    : ${s.posta.kutuSayisi} kutu / ${s.posta.toplamKayit} kayıt`)
  log(`hafıza   : ${s.hafizaMd} md dosyası / ${s.hafizaKlasorSayisi} proje hafıza klasörü`)
  log(`kancalar : ${s.kancalar.kanca} komut, ${s.kancalar.betik} betik dosyası, ${s.kancalar.eksik.length} eksik`)
  log(`eski yol : ${s.ayarEskiYol ? `${s.ayarEskiYol.toplam} yerde (0 olmalı)` : 'denetlenmedi'}`)
  log(`araçlar  : ${Object.entries(m.araclar).map(([k, v]) => `${k} ${v || 'YOK'}`).join(' · ')}`)
}

function main(argv) {
  let a
  try {
    a = C.argumanlariAyir(argv, SEMA)
  } catch (e) {
    process.stderr.write(`dogrula: ${e.message}\n`)
    return 2
  }
  if (a.bayrak.yardim) {
    log('kullanım: dogrula.cjs [--cikti <json>] [--karsilastir <eski.json>] [--eski-ev <yol>] [--ev <yol>] [--ana-depo <yol>] [--siki]')
    return 0
  }
  let eski = null
  if (a.deger.karsilastir) {
    try {
      eski = JSON.parse(fs.readFileSync(a.deger.karsilastir, 'utf8'))
    } catch (e) {
      process.stderr.write(`dogrula: eski ölçüm okunamadı: ${e.message}\n`)
      return 2
    }
  }
  const m = olc({ ev: a.deger.ev, anaDepo: a.deger['ana-depo'], eskiEv: a.deger['eski-ev'] || (eski && eski.ev) || null })
  yazdir(m)
  if (a.deger.cikti) {
    fs.writeFileSync(a.deger.cikti, JSON.stringify(m, null, 2))
    log(`yazıldı  : ${a.deger.cikti}`)
  }
  if (!eski) return 0
  const k = karsilastir(eski, m, { siki: Boolean(a.bayrak.siki) })
  for (const u of k.uyarilar) log(`UYARI    : ${u}`)
  for (const f of k.farklar) log(`FARK     : ${f}`)
  log(k.farklar.length ? `SONUÇ: KIRMIZI (${k.farklar.length} fark)` : 'SONUÇ: TEMİZ (kayıp yok)')
  return k.farklar.length ? 1 : 0
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { olc, karsilastir, kancaKomutlari, betikAdaylari, kancalariOlc, main }
