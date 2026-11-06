#!/usr/bin/env node
'use strict'
/**
 * MAKİNE TAŞIMA — PAKETLE (ESKİ makinede koşar). ALT-165. Cetvel: docs/standards/makine-tasima-standard.md.
 *
 *   node scripts/tasima/paketle.cjs                      # KURU KOŞUM (varsayılan): ne alınır, boyut, sığar mı. Hiçbir şey yazmaz.
 *   node scripts/tasima/paketle.cjs --hedef <Drive>      # kuru koşum + hedefte boş yer ölçümü
 *   node scripts/tasima/paketle.cjs --gercek --hedef <Drive klasörü>
 *
 * Çıktı (hedef içinde tasima-<damga>/): parça başına düz tar (<parca>-<damga>.tar), git/ altında bundle'lar ve
 * durum dosyaları, sirlar-<damga>.tar.gpg (gpg simetrik AES256) ve EN SON yazılan icindekiler.json
 * (her dosya: göreli yol, bayt, sha256, kaynak mutlak yol, kategori). icindekiler.json yoksa paket YARIMDIR.
 *
 * SIRLAR: yalnız şifreli parçaya girer; düz sır tar'ı diske YAZILMAZ (bellekte kurulur, gpg'ye boruyla gider).
 * Parolayı Recep gpg'nin kendi giriş penceresine yazar; bu betik parolayı hiçbir biçimde almaz, bilmez, yazmaz.
 * Sır parçası işin BAŞINDA şifrelenir (giriş penceresi uzun bir paketlemenin sonunda beklemesin).
 *
 * SQLite (kanban, sage, posta, corpus-callosum .db): canlı dosya kopyası yedek DEĞİLDİR (WAL). Her biri
 * `VACUUM INTO` ile tutarlı anlık görüntüye çevrilir, kaynakla satır sayımı karşılaştırılır, sonra arşive girer.
 *
 * Hedef bir git deposunun içindeyse REDDEDİLİR (paket sır taşır; depo PUBLIC).
 * Çıkış: 0 tamam · 1 kırmızı (eksik zorunlu öğe, okunamayan dosya, hata) · 2 kullanım hatası.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const C = require('./cekirdek.cjs')
const E = require('./envanter.cjs')
const G = require('./git.cjs')

const SEMA = {
  bayrak: ['gercek', 'transkriptler', 'yardim'],
  deger: ['hedef', 'ev', 'tmp-kok', 'appdata', 'ana-depo', 'gpg', 'parcalar', 'json'],
}
const PARCA_SIRASI = ['ayar', 'hafiza', 'wrongstack', 'db', 'ingestor', 'arsiv', 'gorsel', 'transkript']
const SIR_TAVANI = 64 * 1024 * 1024

function log(...a) {
  process.stdout.write(`${a.join(' ')}\n`)
}

function sqliteModulu() {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  return require('node:sqlite')
}

/** En yakın var olan atanın boş yeri (bayt) ya da null. */
function bosYer(hedef) {
  let d = path.resolve(hedef)
  while (!fs.existsSync(d)) {
    const ust = path.dirname(d)
    if (ust === d) return null
    d = ust
  }
  try {
    const s = fs.statfsSync(d)
    return Number(s.bavail) * Number(s.bsize)
  } catch {
    return null
  }
}

function transkriptOgesi() {
  return {
    id: 'transkriptler',
    parca: 'transkript',
    kategori: 'arsiv',
    kok: 'ev',
    yol: '.claude/projects',
    tur: 'dizin',
    zorunlu: false,
    // memory klasörleri 'hafiza' parçasında; burada yalnız konuşma dökümleri
    haric: [/^[^/]+\/memory(\/|$)/],
    sqlite: false,
    gitDahil: false,
  }
}

/** Tüm öğeleri tarar; parça bazında toplar. */
function planCikar(kokler, secenek) {
  const secili = secenek.parcalar ? new Set(secenek.parcalar) : null
  let ogeler = E.ogeleriAc(kokler)
  if (secenek.transkriptler) ogeler = [...ogeler, transkriptOgesi()]
  const parcalar = {}
  const eksikZorunlu = []
  for (const oge of ogeler) {
    if (secili && !secili.has(oge.parca)) continue
    const t = E.ogeTara(oge, kokler)
    const p = (parcalar[oge.parca] = parcalar[oge.parca] || { ad: oge.parca, dosyalar: [], atlanan: [], eksik: [], bayt: 0 })
    p.dosyalar.push(...t.dosyalar.map((d) => ({ ...d, kategori: oge.kategori, ogeId: oge.id })))
    p.atlanan.push(...t.atlanan)
    p.bayt += t.dosyalar.reduce((a, d) => a + d.bayt, 0)
    if (!t.var) {
      p.eksik.push(oge.id)
      if (oge.zorunlu) eksikZorunlu.push(oge.id)
    }
  }
  const git = []
  if (!secili || secili.has('git')) {
    for (const g of E.GIT_DEPOLARI) {
      const dizin = path.join(kokler[g.kok], ...g.yol.split('/').filter(Boolean))
      const durum = G.depoDurumu(dizin)
      git.push({ ...g, dizin, durum, bundleGerekli: durum.var && G.bundleGerekli(durum) })
    }
  }
  return { parcalar, git, eksikZorunlu, secili }
}

function planYazdir(plan, kokler, hedef, gpg, gercek = false) {
  log(gercek ? '── MAKİNE TAŞIMA · PLAN (aşağıdaki ölçüme göre paketlenecek) ──' : '── MAKİNE TAŞIMA · KURU KOŞUM (hiçbir şey yazılmadı) ──')
  log(`ev      : ${kokler.ev}`)
  log(`depo    : ${kokler.depo}`)
  log(`tmp     : ${kokler.tmp}`)
  log(`appdata : ${kokler.appdata}`)
  log('')
  log('PARÇA        DOSYA    BOYUT        ATLANAN  YOK (öğe)')
  let toplam = 0
  let dosyaSayisi = 0
  for (const ad of [...PARCA_SIRASI, 'sirlar']) {
    const p = plan.parcalar[ad]
    if (!p) continue
    toplam += p.bayt
    dosyaSayisi += p.dosyalar.length
    log(`${ad.padEnd(12)} ${String(p.dosyalar.length).padStart(7)}  ${C.bicimBayt(p.bayt).padStart(10)}   ${String(p.atlanan.length).padStart(6)}   ${p.eksik.join(', ') || '-'}${ad === 'sirlar' ? '   (gpg ile şifreli)' : ''}`)
  }
  log('')
  log('GİT DEPOSU            DAL                  İLERİ  STASH  KİRLİ  BUNDLE  TAHMİN')
  let bundleToplam = 0
  for (const g of plan.git) {
    if (!g.durum.var) {
      log(`${g.ad.padEnd(21)} (bu makinede YOK)`)
      continue
    }
    const tahmin = g.bundleGerekli ? g.durum.boyutBayt : 0
    bundleToplam += tahmin
    log(`${g.ad.padEnd(21)} ${String(g.durum.dal).slice(0, 20).padEnd(20)} ${String(g.durum.ahead).padStart(5)}  ${String(g.durum.stash.length).padStart(5)}  ${String(g.durum.kirli.length).padStart(5)}  ${(g.bundleGerekli ? 'evet' : 'hayır').padStart(6)}  ${C.bicimBayt(tahmin).padStart(8)}`)
  }
  const kirli = plan.git.filter((g) => g.durum.var && g.durum.kirli.length)
  if (kirli.length) log(`  UYARI: ${kirli.length} depoda commit edilmemiş değişiklik var (pakete GİRMEZ, yalnız durum dosyasına yazılır): taşıma günü önce commit ya da stash`)
  const ek = dosyaSayisi * 1024 + 10 * 1024 * 1024
  const gerek = toplam + bundleToplam + ek
  log('')
  log(`TOPLAM tahmini paket : ${C.bicimBayt(gerek)} (tar ${C.bicimBayt(toplam)} + bundle ${C.bicimBayt(bundleToplam)} + başlık payı ${C.bicimBayt(ek)})`)
  const bos = hedef ? bosYer(hedef) : null
  if (!hedef) log('SIĞAR MI            : ölçülemedi (--hedef verilmedi)')
  else if (bos === null) log(`SIĞAR MI            : ölçülemedi (hedefin boş yeri okunamadı: ${hedef})`)
  else log(`SIĞAR MI            : ${bos >= gerek * 1.05 ? 'EVET' : 'HAYIR'} (boş ${C.bicimBayt(bos)}, gereken ${C.bicimBayt(gerek)} + %5 pay)`)
  log(`gpg                  : ${gpg ? gpg.surum : 'BULUNAMADI (sır parçası yazılamaz; --gpg <yol>)'}`)
  const bagli = Object.values(plan.parcalar).flatMap((p) => p.atlanan.filter((a) => a.sebep === 'baglanti'))
  if (bagli.length) log(`BAĞLANTILAR (taşınmaz, yeniden kurulur): ${bagli.length}`)
  if (plan.eksikZorunlu.length) log(`KIRMIZI: zorunlu öğe YOK -> ${plan.eksikZorunlu.join(', ')}`)
  return { toplam, bundleToplam, gerek, bos }
}

// ── SQLite anlık görüntü ──────────────────────────────────────────────────
let anlikSayac = 0

function sqliteAnlik(kaynak, geciciDizin) {
  const sage = require('../hijyen/sage-yedek.cjs')
  const { DatabaseSync } = sqliteModulu()
  const hedef = path.join(geciciDizin, `${++anlikSayac}.snap`)
  let sonHata = null
  for (let deneme = 1; deneme <= 3; deneme++) {
    try {
      fs.rmSync(hedef, { force: true })
      const once = sage.parmakIzi(kaynak, null)
      const db = new DatabaseSync(kaynak, { readOnly: true })
      try {
        db.exec(`VACUUM INTO '${hedef.replace(/'/g, "''")}'`)
      } finally {
        db.close()
      }
      const sonra = sage.parmakIzi(hedef, null)
      if (JSON.stringify(once.satirlar) !== JSON.stringify(sonra.satirlar)) {
        sonHata = new Error('SQLITE_SAYIM_UYMUYOR: kaynak yazılırken anlık görüntü alındı')
        continue
      }
      const bilgi = { mod: 'vacuum', tablo: sonra.tablolar.length, satir: sonra.sayi }
      if (path.basename(kaynak) === '_kanban.sqlite') {
        const k = sage.kanbanSayim(hedef)
        if (k) Object.assign(bilgi, { pano: k.pano, kart: k.kart, butunluk: k.butunluk })
      }
      return { yol: hedef, bilgi }
    } catch (e) {
      sonHata = e
      // Uzantısı .db ama SQLite olmayan dosya: ham kopya (açık işaretle). Başka her hata KIRMIZI: yarım kopya yedek değildir.
      if (/file is not a database/i.test(String(e.message))) {
        return { yol: kaynak, bilgi: { mod: 'ham', neden: 'SQLite değil: ham kopya' } }
      }
    }
  }
  throw new Error(`SQLite anlık görüntüsü alınamadı (${kaynak}): ${sonHata && sonHata.message}`)
}

// ── Parça yazımı ─────────────────────────────────────────────────────────
function parcaYaz(parca, dosyalar, pkgDir, damga, gecici, ic) {
  const dosyaAdi = `${parca}-${damga}.tar`
  const tmp = path.join(pkgDir, `${dosyaAdi}.tmp`)
  const sink = C.dosyaYazici(tmp)
  const tar = new C.TarYazici((b) => sink.yaz(b))
  let tamam = false
  try {
    for (const d of dosyalar) {
      let kaynak = d.kaynak
      let sqlite = null
      if (d.sqlite) {
        const s = sqliteAnlik(d.kaynak, gecici)
        kaynak = s.yol
        sqlite = s.bilgi
      }
      try {
        const r = tar.dosyadan(d.mantiksal, kaynak)
        ic.dosyalar.push({ parca, yol: d.mantiksal, bayt: r.bayt, sha256: r.sha256, kaynak: d.kaynak, kategori: d.kategori, mtime: Math.floor(d.mtimeMs / 1000), ...(sqlite ? { sqlite } : {}) })
        if (sqlite) ic.sqlite.push({ yol: d.mantiksal, ...sqlite })
      } catch (e) {
        if (!e.baslikOncesi) throw e
        ic.atlanan.push({ kaynak: d.kaynak, sebep: `okunamadi:${e.code || e.message}` })
      }
    }
    tar.bitir()
    const r = sink.kapat()
    tamam = true
    fs.renameSync(tmp, path.join(pkgDir, dosyaAdi))
    ic.parcalar.push({ ad: parca, dosya: dosyaAdi, bayt: r.bayt, sha256: r.sha256, sifreli: false, dosyaSayisi: tar.dosyaSayisi })
    log(`  ${parca.padEnd(11)} ${String(tar.dosyaSayisi).padStart(7)} dosya  ${C.bicimBayt(r.bayt).padStart(10)}  sha256 ${r.sha256.slice(0, 12)}…`)
  } finally {
    if (!tamam) {
      sink.iptal()
      fs.rmSync(tmp, { force: true })
    }
  }
}

/** Sırlar: bellekte tar -> gpg (parola Recep'ten gpg penceresinde) -> sirlar-<damga>.tar.gpg. */
function sirParcasi(dosyalar, pkgDir, damga, gpg, ic) {
  const parcalar = []
  let toplam = 0
  const tar = new C.TarYazici((b) => {
    toplam += b.length
    if (toplam > SIR_TAVANI) throw new Error(`sır parçası ${C.bicimBayt(SIR_TAVANI)} tavanını aştı: sır olmayan dosya girmiş olabilir`)
    parcalar.push(Buffer.from(b))
  })
  const ici = []
  for (const d of dosyalar) {
    try {
      const r = tar.dosyadan(d.mantiksal, d.kaynak, { mod: 0o600 })
      ici.push({ yol: d.mantiksal, bayt: r.bayt, sha256: r.sha256, kaynak: d.kaynak })
    } catch (e) {
      if (!e.baslikOncesi) throw e
      ic.atlanan.push({ kaynak: d.kaynak, sebep: `okunamadi:${e.code || e.message}`, sir: true })
    }
  }
  tar.bellekten('_sirlar-icindekiler.json', Buffer.from(JSON.stringify({ surum: 1, damga, dosyalar: ici }, null, 2)))
  tar.bitir()
  const dosyaAdi = `sirlar-${damga}.tar.gpg`
  const cikis = path.join(pkgDir, dosyaAdi)
  log('  sirlar      gpg parola penceresi açılacak: parolayı SİZ yazın (iki kez sorulur)…')
  C.gpgSifrele(Buffer.concat(parcalar), cikis, gpg.yol)
  const paket = C.gpgPaketiDogrula(cikis)
  if (!paket.sifreli) {
    fs.rmSync(cikis, { force: true })
    throw new Error('sirlar parçası şifreli gpg paketi olarak doğrulanamadı; silindi')
  }
  const sha = C.sha256Dosya(cikis)
  ic.parcalar.push({ ad: 'sirlar', dosya: dosyaAdi, bayt: fs.statSync(cikis).size, sha256: sha, sifreli: true, dosyaSayisi: ici.length, sifre: paket.aes256 ? 'AES256' : 'gpg-simetrik (AES256 doğrulanamadı)' })
  log(`  sirlar      ${String(ici.length).padStart(7)} dosya  şifreli ${paket.aes256 ? '(AES256 doğrulandı)' : '(AES256 etiketi okunamadı)'}  sha256 ${sha.slice(0, 12)}…`)
}

function duzDosya(pkgDir, goreli, icerik) {
  const yol = path.join(pkgDir, ...goreli.split('/'))
  fs.mkdirSync(path.dirname(yol), { recursive: true })
  fs.writeFileSync(yol, icerik)
  return { dosya: goreli, bayt: Buffer.byteLength(icerik), sha256: C.sha256Dosya(yol) }
}

function gitParcasi(gitler, pkgDir, damga, ic) {
  for (const g of gitler) {
    if (!g.durum.var) {
      ic.git.push({ ad: g.ad, kok: g.kok, yol: g.yol, var: false })
      continue
    }
    const d = g.durum
    const kayit = {
      ad: g.ad,
      kok: g.kok,
      yol: g.yol,
      var: true,
      uzak: d.uzaklar.origin || Object.values(d.uzaklar)[0] || null,
      dal: d.dal,
      head: d.head,
      ahead: d.ahead,
      stash: d.stash,
      kirliSayisi: d.kirli.length,
      kirli: d.kirli.slice(0, 500),
    }
    kayit.refs = duzDosya(pkgDir, `git/${g.ad}-refs-${damga}.txt`, d.refs.map((r) => `${r.ref} ${r.sha}`).join('\n') + '\n')
    kayit.durum = duzDosya(pkgDir, `git/${g.ad}-durum-${damga}.txt`, `# ${g.ad} · dal ${d.dal} · head ${d.head}\n# git status --porcelain (${d.kirli.length} satır)\n${d.kirli.join('\n')}${d.kirli.length ? '\n' : ''}`)
    kayit.bundle = null
    if (g.bundleGerekli) {
      const goreli = `git/${g.ad}-${damga}.bundle`
      const yol = path.join(pkgDir, ...goreli.split('/'))
      fs.mkdirSync(path.dirname(yol), { recursive: true })
      const r = G.bundleOlustur(g.dizin, yol, d.stash)
      if (!r.ok) throw new Error(`${g.ad}: ${r.hata}`)
      kayit.bundle = { dosya: goreli, bayt: fs.statSync(yol).size, sha256: C.sha256Dosya(yol) }
    }
    ic.git.push(kayit)
    log(`  git ${g.ad.padEnd(21)} ${kayit.bundle ? `bundle ${C.bicimBayt(kayit.bundle.bayt)}` : 'bundle yok (uzakla özdeş)'} · ileri ${d.ahead} · stash ${d.stash.length} · kirli ${d.kirli.length}`)
  }
}

/**
 * Yeni makinede depo daha YOKTUR; kur.cjs'i çalıştıracak betik pakette bulunmalı. scripts/tasima/*.cjs paketin
 * arac/ klasörüne kopyalanır (kur.cjs kendi kendine yeter: yalnız scripts/tasima içindekileri yükler).
 */
function aracKopyala(pkgDir, ic) {
  const hedef = path.join(pkgDir, 'arac')
  fs.mkdirSync(hedef, { recursive: true })
  ic.arac = []
  for (const f of fs.readdirSync(__dirname).filter((x) => x.endsWith('.cjs')).sort()) {
    fs.copyFileSync(path.join(__dirname, f), path.join(hedef, f))
    ic.arac.push({ dosya: `arac/${f}`, bayt: fs.statSync(path.join(hedef, f)).size, sha256: C.sha256Dosya(path.join(hedef, f)) })
  }
  fs.writeFileSync(
    path.join(pkgDir, 'OKU-BENI.txt'),
    [
      'VentHub makine taşıma paketi (ALT-165). Cetvel: docs/standards/makine-tasima-standard.md',
      '',
      'YENİ MAKİNEDE (Git, GitHub CLI ve Node kurulu; "gh auth login" yapılmış olmalı):',
      '  1) node arac/kur.cjs --kaynak <bu klasör ya da üstü>                (KURU KOŞUM: ne yapacağını yazar)',
      '  2) node arac/kur.cjs --gercek --kaynak <...> [--uzerine-yaz]        (sır parçası için gpg parola penceresi açılır)',
      '  3) pnpm install --frozen-lockfile --prefer-offline  (depo içinde)  ·  node scripts/tasima/dogrula.cjs --karsilastir <eski ölçüm json>',
      '',
      'icindekiler.json = her dosyanın yolu, boyutu, sha256\'sı. Bu dosya YOKSA paket yarımdır, kurulmaz.',
      'Sırlar yalnız sirlar-*.tar.gpg içindedir (gpg simetrik AES256); parolayı yalnız sahibi bilir.',
      '',
    ].join('\n'),
  )
}

function gercekKos(kokler, secenek, plan, gpg) {
  const hata = C.hedefHatasi(secenek.hedef)
  if (hata) throw new Error(hata)
  const hedefKok = path.resolve(secenek.hedef)
  const damga = C.damgaUret()
  const pkgDir = path.join(hedefKok, `tasima-${damga}`)
  if (fs.existsSync(pkgDir)) throw new Error(`paket klasörü zaten var: ${pkgDir}`)
  const sirVar = Boolean(plan.parcalar.sirlar && plan.parcalar.sirlar.dosyalar.length)
  if (sirVar && !gpg) throw new Error('gpg bulunamadı: sır parçası şifrelenemez. Git for Windows ile gelen gpg\'yi --gpg <yol> ile verin')
  const ic = {
    surum: 1,
    damga,
    olusturulma: new Date().toISOString(),
    kokler: { ev: kokler.ev, tmp: kokler.tmp, appdata: kokler.appdata, depo: kokler.depo },
    makine: { platform: process.platform, node: process.version, kullanici: os.userInfo().username, bilgisayar: os.hostname() },
    parcalar: [],
    dosyalar: [],
    atlanan: [],
    sqlite: [],
    git: [],
  }
  fs.mkdirSync(pkgDir, { recursive: true })
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'tasima-sqlite-'))
  try {
    log(`PAKET: ${pkgDir}`)
    if (sirVar) sirParcasi(plan.parcalar.sirlar.dosyalar, pkgDir, damga, gpg, ic)
    for (const ad of PARCA_SIRASI) {
      const p = plan.parcalar[ad]
      if (!p || p.dosyalar.length === 0) continue
      parcaYaz(ad, p.dosyalar, pkgDir, damga, gecici, ic)
    }
    if (plan.secili === null || plan.secili.has('git')) gitParcasi(plan.git, pkgDir, damga, ic)
    for (const ad of Object.keys(plan.parcalar)) {
      for (const a of plan.parcalar[ad].atlanan) ic.atlanan.push(a)
    }
    aracKopyala(pkgDir, ic)
    ic.sayilar ={ dosya: ic.dosyalar.length, atlanan: ic.atlanan.length, sqlite: ic.sqlite.length }
    const bicim = C.icindekilerBicimHatalari(ic)
    if (bicim.length) throw new Error(`icindekiler.json biçimi geçersiz: ${bicim.join('; ')}`)
    const yol = path.join(pkgDir, 'icindekiler.json')
    fs.writeFileSync(`${yol}.tmp`, JSON.stringify(ic, null, 2))
    fs.renameSync(`${yol}.tmp`, yol) // SON yazılan: varlığı paketin tamam olduğunu söyler
    const okunamayan = ic.atlanan.filter((a) => String(a.sebep).startsWith('okunamadi'))
    log('')
    log(`PAKET TAMAM: ${pkgDir}`)
    log(`  parça ${ic.parcalar.length} · dosya ${ic.dosyalar.length} · sqlite anlık görüntü ${ic.sqlite.length} · atlanan ${ic.atlanan.length}`)
    if (okunamayan.length) {
      log(`  KIRMIZI: ${okunamayan.length} dosya okunamadı (kilitli/izin) -> ${okunamayan.slice(0, 5).map((a) => a.kaynak).join(' | ')}`)
      return 1
    }
    log('  sonraki adım: node scripts/tasima/dogrula.cjs --cikti <json> ; yeni makinede kur.cjs')
    return 0
  } finally {
    fs.rmSync(gecici, { recursive: true, force: true })
  }
}

function main(argv) {
  let a
  try {
    a = C.argumanlariAyir(argv, SEMA)
  } catch (e) {
    process.stderr.write(`paketle: ${e.message}\n`)
    return 2
  }
  if (a.bayrak.yardim) {
    log('kullanım: paketle.cjs [--gercek] [--hedef <klasör>] [--parcalar a,b] [--transkriptler] [--ev --tmp-kok --appdata --ana-depo] [--gpg <yol>] [--json <dosya>]')
    return 0
  }
  const kokler = E.kokleriCoz({ ev: a.deger.ev, tmp: a.deger['tmp-kok'], appdata: a.deger.appdata, anaDepo: a.deger['ana-depo'] })
  const secenek = {
    gercek: Boolean(a.bayrak.gercek),
    hedef: a.deger.hedef || null,
    parcalar: a.deger.parcalar ? a.deger.parcalar.split(',').map((s) => s.trim()).filter(Boolean) : null,
    transkriptler: Boolean(a.bayrak.transkriptler),
  }
  if (secenek.hedef) {
    const h = C.hedefHatasi(secenek.hedef)
    if (h) {
      process.stderr.write(`paketle: ${h}\n`)
      return 1
    }
  }
  if (secenek.gercek && !secenek.hedef) {
    process.stderr.write('paketle: --gercek için --hedef <Drive klasörü> şart\n')
    return 2
  }
  const plan = planCikar(kokler, secenek)
  const gpg = C.gpgBul(a.deger.gpg || null)
  if (!secenek.gercek) {
    const s = planYazdir(plan, kokler, secenek.hedef, gpg)
    if (a.deger.json) {
      fs.writeFileSync(a.deger.json, JSON.stringify({ kokler, ...s, parcalar: Object.fromEntries(Object.entries(plan.parcalar).map(([k, p]) => [k, { dosya: p.dosyalar.length, bayt: p.bayt, atlanan: p.atlanan.length, eksik: p.eksik }])), git: plan.git.map((g) => ({ ad: g.ad, var: g.durum.var, bundleGerekli: g.bundleGerekli, ileri: g.durum.ahead, stash: g.durum.stash ? g.durum.stash.length : 0, kirli: g.durum.kirli ? g.durum.kirli.length : 0, tahmin: g.durum.boyutBayt || 0 })) }, null, 2))
    }
    return plan.eksikZorunlu.length ? 1 : 0
  }
  planYazdir(plan, kokler, secenek.hedef, gpg, true)
  if (plan.eksikZorunlu.length) {
    process.stderr.write(`paketle: zorunlu öğe yok (${plan.eksikZorunlu.join(', ')}); eksik paketle çıkılmaz\n`)
    return 1
  }
  log('')
  try {
    return gercekKos(kokler, secenek, plan, gpg)
  } catch (e) {
    process.stderr.write(`paketle: HATA — ${e.message}\n`)
    return 1
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { main, planCikar, bosYer, PARCA_SIRASI }
