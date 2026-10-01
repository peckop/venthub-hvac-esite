#!/usr/bin/env node
/**
 * mutasyon-kosucu.cjs — mutasyon testi koşucusu (bağımlılıksız, yalnız Node).
 *
 * Bir plan dosyasındaki her mutasyonu SIRAYLA uygular, kapsamdaki testleri koşar, sonucu sınıflar
 * (KILLED / SURVIVED / TIMEOUT / ERROR) ve dosyayı geri alır. Geri almayı sha256 ile doğrular;
 * tutmazsa DURUR. Mekanik korumalar (skill metnindeki kurallar burada ZORLANIR, hatırlanmaz):
 *
 *   1. Yalnız BAĞLI git worktree'de koşar; ana ağaçta REDDEDER.
 *   2. Ağaç temiz başlamalı (`git status --porcelain` boş), temiz bitmeli.
 *   3. Hedef yalnız `src/` ve `supabase/functions/` altındaki, git'in izlediği, test OLMAYAN dosya.
 *      `supabase/migrations/**` ve `.sql` REDDEDİLİR (CLAUDE.md kural 13).
 *   4. Çapa (`bul`) dosyada TAM 1 KEZ geçmeli; 0 ya da 2+ ise mutasyon HATA-CAPA sayılır, uygulanmaz.
 *   5. Alt süreç ortamından ödeme/posta/sır anahtarları silinir: koşu dış sağlayıcıya istek atamaz.
 *   6. Boş bellek 2 GB altındaysa ve `--paralel` verilmişse başlamaz (çıkış 4): çağıran sırayla koşmalı.
 *
 * Kullanım:
 *   node mutasyon-kosucu.cjs --repo <worktree> --plan <plan.json> --out <sonuc.json> [--taban] [--tur vitest|cikis]
 *                            [--timeout <sn>] [--paralel]
 *   node mutasyon-kosucu.cjs --karsilastir <once.json> <sonra.json>
 *
 * Çıkış kodları: 0 tamam · 1 kullanım/plan hatası · 2 GERİ ALMA/AĞAÇ İHLALİ (durdu, ağaç kirli olabilir) ·
 *                3 ana ağaç reddi · 4 bellek düşük (paralel) · 5 taban kırmızı (--taban).
 */
'use strict'

const cp = require('node:child_process')
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const BELLEK_ESIGI_GB = 2
const VARSAYILAN_ZAMAN_ASIMI_SN = 120
// Alt sürece geçmeyecek ortam değişkenleri (ödeme, posta, SMS, servis anahtarı, sır, jeton).
const YASAK_ORTAM = /IYZICO|RESEND|TWILIO|SERVICE_ROLE|SENTRY_(AUTH|DSN)|STRIPE|SECRET|PRIVATE_KEY|API_KEY|_TOKEN$|PASSWORD/i
const YUKLEME_HATASI = /SyntaxError|Transform failed|Failed to (parse|resolve)|Cannot find module|ERR_MODULE_NOT_FOUND|Unexpected token/

// ---------------------------------------------------------------- saf yardımcılar (test edilir)

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex')
}

/** Yolu `/` ayraçlı, depo köküne göreli hâle getirir. */
function goreli(repo, dosya) {
  return path.relative(repo, path.resolve(repo, dosya)).split(path.sep).join('/')
}

/** Mutasyon hedefi olabilir mi? Dönüş: null (uygun) ya da ret nedeni. */
function hedefRedNedeni(rel) {
  if (rel.startsWith('../') || path.isAbsolute(rel)) return 'depo dışı yol'
  // Önce migration/SQL: sebep "kural 13" olarak açık yazılsın, genel "src altı" mesajına karışmasın.
  if (/(^|\/)migrations?\//.test(rel) || /\.sql$/i.test(rel)) return 'migration/SQL hedef olamaz (kural 13)'
  if (!/^(src|supabase\/functions)\//.test(rel)) return 'yalnız src/ ve supabase/functions/ altı hedef olabilir'
  if (/(^|\/)(__tests__|tests?|e2e)\//.test(rel) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(rel)) return 'test dosyası hedef olamaz'
  if (/\.(md|json|ya?ml)$/i.test(rel)) return 'yalnız kod dosyası hedef olabilir'
  return null
}

/** İçerikte `bul` kaç kez geçiyor (çakışmasız)? */
function kacKez(icerik, bul) {
  if (!bul) return 0
  let n = 0
  let i = 0
  while ((i = icerik.indexOf(bul, i)) !== -1) {
    n++
    i += bul.length
  }
  return n
}

/** `indeks` konumunun 1 tabanlı satır numarası. */
function satirNo(icerik, indeks) {
  let n = 1
  for (let i = 0; i < indeks; i++) if (icerik.charCodeAt(i) === 10) n++
  return n
}

/** Vitest JSON raporundan sonucu sınıflar. `cikis` = alt sürecin çıkış kodu. */
function vitestSinifla(rapor, cikis) {
  if (!rapor) return { sonuc: 'ERROR', neden: 'vitest JSON raporu yok ya da okunamadı' }
  const toplam = rapor.numTotalTests ?? 0
  const basarisiz = rapor.numFailedTests ?? 0
  const suitHata = rapor.numFailedTestSuites ?? 0
  if (basarisiz > 0) {
    const olduren = []
    for (const dosya of rapor.testResults ?? [])
      for (const t of dosya.assertionResults ?? []) if (t.status === 'failed' && olduren.length < 3) olduren.push(t.fullName || t.title)
    return { sonuc: 'KILLED', neden: '', olduren }
  }
  if (suitHata > 0) return { sonuc: 'ERROR', neden: `${suitHata} test dosyası YÜKLENEMEDİ (yükleme/derleme hatası, öldürme sayılmaz)` }
  if (toplam === 0) return { sonuc: 'ERROR', neden: 'hiç test koşmadı' }
  if (cikis === 0) return { sonuc: 'SURVIVED', neden: '' }
  return { sonuc: 'ERROR', neden: `çıkış kodu ${cikis} ama başarısız test yok` }
}

/** `--tur cikis`: yalnız çıkış kodu ve çıktı metnine bakar. */
function cikisSinifla(cikis, zamanAsimi, cikti) {
  if (zamanAsimi) return { sonuc: 'TIMEOUT', neden: 'zaman aşımı' }
  if (cikis === 0) return { sonuc: 'SURVIVED', neden: '' }
  if (YUKLEME_HATASI.test(cikti)) return { sonuc: 'ERROR', neden: 'yükleme/derleme hatası (öldürme sayılmaz)' }
  return { sonuc: 'KILLED', neden: '', olduren: [] }
}

/** Skor = KILLED / (KILLED + SURVIVED). ERROR ve TIMEOUT paydaya girmez. */
function ozetle(satirlar) {
  const say = (s) => satirlar.filter((x) => x.sonuc === s).length
  const k = say('KILLED')
  const s = say('SURVIVED')
  return { killed: k, survived: s, timeout: say('TIMEOUT'), error: say('ERROR'), hataCapa: say('HATA-CAPA'), skor: k + s === 0 ? null : Math.round((k / (k + s)) * 1000) / 10 }
}

function tabloYaz(sonuc) {
  const o = sonuc.ozet
  const l = [`# Mutasyon sonuçları — ${sonuc.slug}`, '', `Tarih: ${sonuc.tarih} · Çıkarım: ${sonuc.tur} · Bellek (boş): ${sonuc.bosBellekGB} GB`, '']
  if (sonuc.taban) l.push(`Taban: ${sonuc.taban.toplam} test, ${sonuc.taban.gecen} geçti, ${sonuc.taban.kalan} kaldı, ${sonuc.taban.atlanan} atlandı, ${sonuc.taban.sureSn} sn`, '')
  l.push('| ID | Dosya:satır | Operatör | Açıklama | Sonuç | Öldüren test / neden |', '|---|---|---|---|---|---|')
  for (const x of sonuc.satirlar) l.push(`| ${x.id} | ${x.dosya}:${x.satir ?? '?'} | ${x.operator} | ${String(x.aciklama).replace(/\|/g, '/')} | ${x.sonuc} | ${((x.olduren && x.olduren.join('; ')) || x.neden || '').replace(/\|/g, '/')} |`)
  l.push('', `**Skor:** ${o.skor === null ? 'hesaplanamadı (öldürülen+sağ kalan = 0)' : o.skor + '%'} — KILLED ${o.killed} · SURVIVED ${o.survived} · TIMEOUT ${o.timeout} · ERROR ${o.error} · HATA-CAPA ${o.hataCapa}`)
  l.push('(Skor = KILLED / (KILLED + SURVIVED); ERROR, TIMEOUT ve HATA-CAPA paydaya girmez.)')
  return l.join('\n') + '\n'
}

// ---------------------------------------------------------------- süreç yardımcıları

function git(repo, ...args) {
  const r = cp.spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8' })
  return { kod: r.status, cikti: (r.stdout || '').trim(), hata: (r.stderr || '').trim() }
}

/** Bağlı worktree mi? (`.git` bir dosya ve git-dir `/worktrees/` içinde). */
function bagliWorktreeMi(repo) {
  const r = git(repo, 'rev-parse', '--git-dir')
  if (r.kod !== 0) return false
  return /[\\/]worktrees[\\/]/.test(r.cikti)
}

function temizOrtam() {
  const e = {}
  for (const [k, v] of Object.entries(process.env)) if (!YASAK_ORTAM.test(k)) e[k] = v
  e.NODE_ENV = 'test'
  e.MUTASYON_KOSUSU = '1'
  e.CI = '1'
  return e
}

function agaciOldur(child) {
  if (process.platform === 'win32') cp.spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'])
  else {
    try {
      process.kill(-child.pid, 'SIGKILL')
    } catch {
      child.kill('SIGKILL')
    }
  }
}

/** Komutu koşar. Dönüş: { cikis, zamanAsimi, cikti }. */
function kos(repo, komutDizisi, zamanAsimiSn, ortam) {
  return new Promise((coz) => {
    const child = cp.spawn(komutDizisi[0], komutDizisi.slice(1), { cwd: repo, env: ortam, detached: process.platform !== 'win32', windowsHide: true })
    let cikti = ''
    const topla = (b) => {
      if (cikti.length < 200000) cikti += b.toString()
    }
    child.stdout.on('data', topla)
    child.stderr.on('data', topla)
    let zamanAsimi = false
    const t = setTimeout(() => {
      zamanAsimi = true
      agaciOldur(child)
    }, zamanAsimiSn * 1000)
    child.on('close', (kod) => {
      clearTimeout(t)
      coz({ cikis: kod, zamanAsimi, cikti })
    })
    child.on('error', (e) => {
      clearTimeout(t)
      coz({ cikis: -1, zamanAsimi: false, cikti: String(e) })
    })
  })
}

function vitestKomutu(repo, testler, jsonYolu) {
  const giris = path.join(repo, 'node_modules', 'vitest', 'vitest.mjs')
  const arg = ['run', ...testler, '--reporter=json', `--outputFile=${jsonYolu}`]
  if (fs.existsSync(giris)) return [process.execPath, giris, ...arg]
  return [process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', 'exec', 'vitest', ...arg]
}

// ---------------------------------------------------------------- ana akış

function argumanlar(argv) {
  const a = { tur: 'vitest', timeout: VARSAYILAN_ZAMAN_ASIMI_SN, taban: false, paralel: false }
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i]
    if (k === '--taban') a.taban = true
    else if (k === '--paralel') a.paralel = true
    else if (k === '--karsilastir') {
      a.karsilastir = [argv[++i], argv[++i]]
    } else if (k.startsWith('--')) a[k.slice(2)] = argv[++i]
  }
  a.timeout = Number(a.timeout)
  return a
}

function karsilastir(yolOnce, yolSonra) {
  const once = JSON.parse(fs.readFileSync(yolOnce, 'utf8'))
  const sonra = JSON.parse(fs.readFileSync(yolSonra, 'utf8'))
  const eski = Object.fromEntries(once.satirlar.map((x) => [x.id, x.sonuc]))
  console.log('| ID | Önce | Sonra |\n|---|---|---|')
  for (const x of sonra.satirlar) console.log(`| ${x.id} | ${eski[x.id] ?? '—'} | ${x.sonuc}${eski[x.id] !== x.sonuc ? ' ←' : ''} |`)
  const f = (o) => (o.skor === null ? 'hesaplanamadı' : `${o.killed}/${o.killed + o.survived} = ${o.skor}%`)
  console.log(`\nSkor önce: ${f(once.ozet)}\nSkor sonra: ${f(sonra.ozet)}`)
}

async function ana() {
  const a = argumanlar(process.argv.slice(2))
  if (a.karsilastir) return karsilastir(...a.karsilastir)
  if (!a.repo || !a.plan || !a.out) {
    console.error('Kullanım: --repo <worktree> --plan <plan.json> --out <sonuc.json> [--taban] [--tur vitest|cikis] [--timeout sn] [--paralel]')
    process.exit(1)
  }
  const repo = path.resolve(a.repo)
  const plan = JSON.parse(fs.readFileSync(a.plan, 'utf8'))
  const testler = plan.testler || []
  if (!plan.slug || (a.tur === 'vitest' && testler.length === 0) || !Array.isArray(plan.mutasyonlar)) {
    console.error('Plan geçersiz: slug, testler[] (vitest için) ve mutasyonlar[] gerekli')
    process.exit(1)
  }

  // Koruma 1: ana ağaç reddi
  if (!bagliWorktreeMi(repo)) {
    console.error(`RED: ${repo} bağlı bir git worktree değil (ana ağaç ya da git deposu değil). Mutasyon ana ağaçta ASLA koşmaz.`)
    process.exit(3)
  }
  // Koruma 6: bellek
  const bosGB = Math.round((os.freemem() / 1024 ** 3) * 10) / 10
  if (a.paralel && bosGB < BELLEK_ESIGI_GB) {
    console.error(`BELLEK: boş ${bosGB} GB < ${BELLEK_ESIGI_GB} GB — paralel koşma, sırayla koş.`)
    process.exit(4)
  }
  // Koruma 2: temiz başlangıç
  const kirli = git(repo, 'status', '--porcelain').cikti
  if (kirli) {
    console.error('RED: ağaç temiz değil, mutasyon başlamaz:\n' + kirli)
    process.exit(2)
  }

  const ortam = temizOrtam()
  const jsonYolu = path.join(os.tmpdir(), `mut-${process.pid}-${Date.now()}.json`)
  const komut = () => (a.tur === 'vitest' ? vitestKomutu(repo, testler, jsonYolu) : plan.komut)
  if (a.tur === 'cikis' && !Array.isArray(plan.komut)) {
    console.error('--tur cikis için plan.komut bir dizi olmalı (ör. ["node","test.js"])')
    process.exit(1)
  }
  const raporOku = () => {
    try {
      return JSON.parse(fs.readFileSync(jsonYolu, 'utf8'))
    } catch {
      return null
    } finally {
      try {
        fs.unlinkSync(jsonYolu)
      } catch {}
    }
  }

  const sonuc = { slug: plan.slug, tarih: new Date().toISOString(), tur: a.tur, bosBellekGB: bosGB, satirlar: [] }

  // Taban
  if (a.taban) {
    const t0 = Date.now()
    const r = await kos(repo, komut(), a.timeout * 3, ortam)
    const rapor = a.tur === 'vitest' ? raporOku() : null
    const sinif = a.tur === 'vitest' ? vitestSinifla(rapor, r.cikis) : cikisSinifla(r.cikis, r.zamanAsimi, r.cikti)
    sonuc.taban = {
      toplam: rapor ? rapor.numTotalTests : null,
      gecen: rapor ? rapor.numPassedTests : null,
      kalan: rapor ? rapor.numFailedTests : null,
      atlanan: rapor ? rapor.numPendingTests : null,
      sureSn: Math.round((Date.now() - t0) / 100) / 10,
    }
    console.log('TABAN:', JSON.stringify(sonuc.taban))
    if (sinif.sonuc !== 'SURVIVED') {
      // taban "SURVIVED" = hiçbir mutasyon yokken yeşil demek
      console.error(`TABAN KIRMIZI ya da geçersiz (${sinif.sonuc}: ${sinif.neden}). Kırmızı takımı denetleme.`)
      console.error(r.cikti.slice(-1500))
      process.exit(5)
    }
  }

  // Mutasyonlar
  let uygulanan = null // { yol, orijinal } — çıkışta senkron geri alma
  const acilGeriAl = () => {
    if (uygulanan) {
      try {
        fs.writeFileSync(uygulanan.yol, uygulanan.orijinal)
      } catch {}
      uygulanan = null
    }
  }
  process.on('exit', acilGeriAl)
  for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => process.exit(2))

  for (const m of plan.mutasyonlar) {
    const satir = { id: m.id, dosya: m.dosya, satir: m.satir ?? null, operator: m.operator, aciklama: m.aciklama }
    const rel = goreli(repo, m.dosya || '')
    const red = hedefRedNedeni(rel)
    const yol = path.join(repo, rel)
    if (red || !fs.existsSync(yol) || git(repo, 'ls-files', '--error-unmatch', rel).kod !== 0) {
      sonuc.satirlar.push({ ...satir, sonuc: 'HATA-CAPA', neden: red || 'dosya yok ya da git izlemiyor' })
      continue
    }
    const orijinal = fs.readFileSync(yol)
    const oncekiHash = sha256(orijinal)
    const metin = orijinal.toString('utf8')
    const crlf = metin.includes('\r\n')
    const bul = crlf ? String(m.bul).replace(/\r?\n/g, '\r\n') : String(m.bul)
    const yerine = crlf ? String(m.yerine).replace(/\r?\n/g, '\r\n') : String(m.yerine)
    const adet = kacKez(metin, bul)
    if (adet !== 1) {
      sonuc.satirlar.push({ ...satir, sonuc: 'HATA-CAPA', neden: `çapa dosyada ${adet} kez geçiyor (tam 1 olmalı)` })
      continue
    }
    const gercekSatir = satirNo(metin, metin.indexOf(bul))
    satir.satir = gercekSatir
    if (m.satir && Math.abs(m.satir - gercekSatir) > 0) satir.not = `plandaki satır ${m.satir}, gerçek ${gercekSatir}`
    if (bul === yerine) {
      sonuc.satirlar.push({ ...satir, sonuc: 'HATA-CAPA', neden: 'bul ve yerine aynı (mutasyon değişiklik yapmıyor)' })
      continue
    }

    const t0 = Date.now()
    uygulanan = { yol, orijinal }
    let sinif
    try {
      fs.writeFileSync(yol, metin.replace(bul, () => yerine))
      const r = await kos(repo, komut(), a.timeout, ortam)
      if (a.tur === 'vitest') {
        const rapor = raporOku() // zaman aşımında da geçici dosyayı temizler
        sinif = r.zamanAsimi ? { sonuc: 'TIMEOUT', neden: 'zaman aşımı' } : vitestSinifla(rapor, r.cikis)
      }
      else sinif = cikisSinifla(r.cikis, r.zamanAsimi, r.cikti)
    } finally {
      fs.writeFileSync(yol, orijinal)
      uygulanan = null
    }
    // Koruma 4: geri alma doğrulaması (dosya + ağaç)
    if (sha256(fs.readFileSync(yol)) !== oncekiHash) {
      console.error(`GERİ ALMA BAŞARISIZ: ${rel} önceki sha256 ile eşleşmiyor. DURULDU. Bu worktree'yi silin, mutasyon sonuçlarına güvenmeyin.`)
      process.exit(2)
    }
    sonuc.satirlar.push({ ...satir, sonuc: sinif.sonuc, neden: sinif.neden || '', olduren: sinif.olduren, sure_ms: Date.now() - t0 })
    console.log(`${m.id} ${sinif.sonuc}${sinif.neden ? ' — ' + sinif.neden : ''}`)
  }

  const son = git(repo, 'status', '--porcelain').cikti
  if (son) {
    console.error('AĞAÇ KİRLİ (kalıntı mutasyon?):\n' + son)
    process.exit(2)
  }
  sonuc.ozet = ozetle(sonuc.satirlar)
  sonuc.agacTemiz = true
  fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true })
  fs.writeFileSync(a.out, JSON.stringify(sonuc, null, 1))
  fs.writeFileSync(a.out.replace(/\.json$/, '') + '.md', tabloYaz(sonuc))
  console.log(`SKOR: ${sonuc.ozet.skor === null ? 'hesaplanamadı' : sonuc.ozet.skor + '%'} (KILLED ${sonuc.ozet.killed}, SURVIVED ${sonuc.ozet.survived}, TIMEOUT ${sonuc.ozet.timeout}, ERROR ${sonuc.ozet.error}, HATA-CAPA ${sonuc.ozet.hataCapa}) — AĞAÇ TEMİZ`)
}

module.exports = { sha256, goreli, hedefRedNedeni, kacKez, satirNo, vitestSinifla, cikisSinifla, ozetle, tabloYaz, bagliWorktreeMi, temizOrtam, YASAK_ORTAM }

if (require.main === module) {
  ana().catch((e) => {
    console.error('BEKLENMEDİK HATA:', e)
    process.exit(2)
  })
}
