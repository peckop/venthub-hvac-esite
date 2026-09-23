#!/usr/bin/env node
'use strict'
/**
 * REC-357 §7 — UnoPim YEDEK AL + GERİ KURMA DENEMESİ (karar 36 şartı: yedeksiz faz 2 adımı başlamaz).
 *
 * Neyi yedekler (2026-09-23 ölçümüyle belirlendi):
 *   1. `db.dump`      — PIM'in PostgreSQL'i (`pg_dump -Fc`). Ürün, öznitelik, aile, kategori, API istemcileri.
 *   2. `storage.tgz`  — `unopim-storage` birimi. ⭐ŞİFRELEME ANAHTARI BURADA: imajın `ensure-app-key.sh`'ı
 *                       APP_KEY'i ortamda/.env'de bulamazsa `storage/app/private/.app_key`'e üretip saklıyor
 *                       (bizde `.env`'de APP_KEY YOK → anahtarın tek kopyası bu birim). Anahtarsız geri
 *                       kurulan DB'de şifreli alanlar okunamaz; bu yüzden `al` anahtar dosyası tarda yoksa DURUR.
 *   3. `compose.yaml` + `.env` + `sirlar/` — kurulumun tarifi ve API anahtarları.
 * Yedeklenmeyenler (yeniden üretilir): Elasticsearch dizini (`unopim:product:index` + `category:index`, ~3 sn),
 * Redis (önbellek/kuyruk).
 *
 * ⛔YEDEK SIR TAŞIR (DB parolası, API anahtarları, APP_KEY) → hedef dizin bir git deposunun içinde OLAMAZ
 * (repo PUBLIC; `hedefDepoIcindeMi` kapısı). Dizin adları ortamdan gelir, kodda kullanıcı yolu yok.
 *
 * KOŞUM:
 *   UNOPIM_DIZIN=<compose.yaml'ın klasörü> UNOPIM_YEDEK_DIZIN=<depo dışı klasör> node scripts/pim/unopim-yedek.cjs al
 *   UNOPIM_YEDEK_DIZIN=<...> node scripts/pim/unopim-yedek.cjs dene [yedek-klasörü]   (verilmezse en yenisi)
 *   UNOPIM_YEDEK_ANAHTAR=<şifre anahtarı dosyası> node scripts/pim/unopim-yedek.cjs coz <paket.vhenc> [hedef-kök]
 * `al` ayrıca UNOPIM_YEDEK_ANAHTAR ister: makine dışına giden tek dosya şifreli `<klasör>.vhenc`'tir (aşağıda).
 * `dene`: yedeği AYRI bir compose projesine (`pim-geri`, port 8001) kurar, ürün/kategori sayısını yedek anındaki
 * sayıyla, giriş sayfasını 200 ile karşılaştırır, arama dizinini yeniden üretir, sonra YALNIZ `pim-geri`'yi siler.
 * Asıl kuruluma (`pim-unopim`) dokunmaz. Ölçüm 2026-09-23: yedek 4 sn, geri kurma 53 sn, 12/12 ürün, API 200.
 */
const fs = require('node:fs')
const path = require('node:path')
const crypto = require('node:crypto')
const os = require('node:os')
const { spawnSync } = require('node:child_process')

const KAYNAK_PROJE = 'pim-unopim'
const DENEME_PROJE = 'pim-geri' // SABİT — `down -v` yalnız bu projeye uygulanır
const DENEME_PORT = '8001'
const ANAHTAR_TAR_YOLU = './app/private/.app_key'

function hedefDepoIcindeMi(dizin) {
  let d = path.resolve(dizin)
  for (;;) {
    if (fs.existsSync(path.join(d, '.git'))) return true
    const ust = path.dirname(d)
    if (ust === d) return false
    d = ust
  }
}

function kos(komut, argv, secenek = {}) {
  const r = spawnSync(komut, argv, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...secenek })
  if (r.status !== 0) throw new Error(`${komut} ${argv.slice(0, 3).join(' ')} → ${r.status}: ${(r.stderr || '').slice(0, 400)}`)
  return (r.stdout || '').trim()
}

const psqlSay = (konteyner, tablo) =>
  Number(kos('docker', ['exec', konteyner, 'sh', '-c', `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "select count(*) from ${tablo}"`]))

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')

function ortam(ad) {
  const v = process.env[ad]
  if (!v) throw new Error(`${ad} tanımlı değil (başlıktaki KOŞUM satırına bak)`)
  return v
}

function al() {
  const kaynak = ortam('UNOPIM_DIZIN')
  const kok = ortam('UNOPIM_YEDEK_DIZIN')
  if (hedefDepoIcindeMi(kok)) throw new Error('UNOPIM_YEDEK_DIZIN bir git deposunun içinde — yedek sır taşır, reddedildi')
  sifreAnahtari(kok) // anahtar sorunu varsa yedek BAŞLAMADAN dur
  const damga = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const hedef = path.resolve(kok, `yedek-${damga}`)
  fs.mkdirSync(hedef, { recursive: true })
  const t0 = Date.now()
  const pg = `${KAYNAK_PROJE}-unopim-pgsql-1`
  kos('docker', ['exec', pg, 'sh', '-c', 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/yedek.dump'])
  kos('docker', ['cp', `${pg}:/tmp/yedek.dump`, path.join(hedef, 'db.dump')])
  kos('docker', ['exec', pg, 'rm', '-f', '/tmp/yedek.dump'])
  kos('docker', ['run', '--rm', '-v', `${KAYNAK_PROJE}_unopim-storage:/v:ro`, '-v', `${hedef}:/out`, 'alpine', 'tar', 'czf', '/out/storage.tgz', '-C', '/v', '.'])
  const icerik = kos('docker', ['run', '--rm', '-v', `${hedef}:/in:ro`, 'alpine', 'tar', 'tzf', '/in/storage.tgz']).split('\n')
  if (!icerik.includes(ANAHTAR_TAR_YOLU)) throw new Error('storage.tgz içinde .app_key YOK — anahtarsız yedek geri kurulamaz, durdu')
  for (const f of ['compose.yaml', '.env']) fs.copyFileSync(path.join(kaynak, f), path.join(hedef, f))
  fs.cpSync(path.join(kaynak, '.sirlar'), path.join(hedef, 'sirlar'), { recursive: true })
  const manifest = {
    damga, sure_sn: Math.round((Date.now() - t0) / 1000),
    urun: psqlSay(pg, 'products'), kategori: psqlSay(pg, 'categories'),
    dosya: Object.fromEntries(['db.dump', 'storage.tgz'].map((f) => [f, { bayt: fs.statSync(path.join(hedef, f)).size, sha256: sha(path.join(hedef, f)) }])),
    anahtar_tarda: true,
  }
  fs.writeFileSync(path.join(hedef, 'manifest.json'), JSON.stringify(manifest, null, 2))
  const paket = sifreliPaketle(hedef)
  console.log(`YEDEK TAMAM ${hedef} · ${manifest.sure_sn} sn · ürün ${manifest.urun} · kategori ${manifest.kategori}`)
  console.log(`MAKİNE DIŞINA GİDECEK TEK DOSYA (şifreli): ${paket}`)
}

// ── Şifreli paket (OPS 09-23: yedek makineden çıkmadan ÖNCE şifrelenir) ─────────────────────────────
// Klasör (düz) yerelde kalır — `dene` onu kullanır. Makine dışına YALNIZ `<klasör>.vhenc` gider:
// tar.gz → AES-256-GCM. Anahtar 32 bayt, `UNOPIM_YEDEK_ANAHTAR` dosyasında; dosya yoksa üretilir. Anahtar
// YEDEĞİN İÇİNDE DEĞİL ve yedek dizininin/bir git deposunun içinde olamaz — ayrı yerde (parola kasası) saklanır.
// Biçim: 'VHENC1' (6) | iv (12) | etiket (16) | şifreli gövde. Etiket tutmazsa `coz` durur (bozulma/yanlış anahtar).
const SIHIR = Buffer.from('VHENC1')

function sifreAnahtari(yedekKoku) {
  const f = path.resolve(ortam('UNOPIM_YEDEK_ANAHTAR'))
  if (hedefDepoIcindeMi(f)) throw new Error('UNOPIM_YEDEK_ANAHTAR bir git deposunun içinde — reddedildi')
  if (yedekKoku && f.startsWith(path.resolve(yedekKoku) + path.sep)) throw new Error('şifre anahtarı yedek dizininin içinde olamaz — yedekle birlikte taşınır')
  if (!fs.existsSync(f)) {
    fs.mkdirSync(path.dirname(f), { recursive: true })
    fs.writeFileSync(f, crypto.randomBytes(32).toString('base64'), { mode: 0o600 })
    console.log(`YENİ ŞİFRE ANAHTARI ÜRETİLDİ: ${f} — bunu yedekten AYRI bir yerde sakla, kaybolursa yedek açılmaz`)
  }
  const k = Buffer.from(fs.readFileSync(f, 'utf8').trim(), 'base64')
  if (k.length !== 32) throw new Error('şifre anahtarı 32 bayt değil')
  return k
}

function sifreliPaketle(klasor) {
  const anahtar = sifreAnahtari(path.dirname(klasor))
  const ust = path.dirname(klasor)
  const ad = path.basename(klasor)
  kos('docker', ['run', '--rm', '-v', `${ust}:/w`, 'alpine', 'tar', 'czf', `/w/${ad}.tgz`, '-C', '/w', ad])
  const duz = fs.readFileSync(path.join(ust, `${ad}.tgz`))
  fs.unlinkSync(path.join(ust, `${ad}.tgz`))
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', anahtar, iv)
  const govde = Buffer.concat([c.update(duz), c.final()])
  const cikti = path.join(ust, `${ad}.vhenc`)
  fs.writeFileSync(cikti, Buffer.concat([SIHIR, iv, c.getAuthTag(), govde]))
  return cikti
}

function coz(dosya, hedefKok) {
  const veri = fs.readFileSync(path.resolve(dosya))
  if (!veri.subarray(0, 6).equals(SIHIR)) throw new Error('VHENC1 paketi değil')
  const d = crypto.createDecipheriv('aes-256-gcm', sifreAnahtari(null), veri.subarray(6, 18))
  d.setAuthTag(veri.subarray(18, 34))
  let duz
  try {
    duz = Buffer.concat([d.update(veri.subarray(34)), d.final()])
  } catch {
    throw new Error('şifre çözülemedi — yanlış anahtar ya da bozuk paket')
  }
  const kok = path.resolve(hedefKok || path.dirname(path.resolve(dosya)))
  if (hedefDepoIcindeMi(kok)) throw new Error('çözme hedefi bir git deposunun içinde — reddedildi')
  const tgz = path.join(kok, `coz-${Date.now()}.tgz`)
  fs.writeFileSync(tgz, duz)
  kos('docker', ['run', '--rm', '-v', `${kok}:/w`, 'alpine', 'tar', 'xzf', `/w/${path.basename(tgz)}`, '-C', '/w'])
  fs.unlinkSync(tgz)
  console.log(`ÇÖZÜLDÜ → ${kok} (içindeki yedek-* klasörüyle 'dene' koşulabilir)`)
}

function dene(verilen) {
  const kok = ortam('UNOPIM_YEDEK_DIZIN')
  const yedek = verilen
    ? path.resolve(verilen)
    : path.join(kok, fs.readdirSync(kok).filter((d) => d.startsWith('yedek-')).sort().pop() || '')
  const manifest = JSON.parse(fs.readFileSync(path.join(yedek, 'manifest.json'), 'utf8'))
  for (const [f, { sha256 }] of Object.entries(manifest.dosya)) {
    if (sha(path.join(yedek, f)) !== sha256) throw new Error(`${f} bozuk (sha256 tutmuyor)`)
  }
  const env = { ...process.env, APP_PORT: `127.0.0.1:${DENEME_PORT}`, FORWARD_MAILPIT_PORT: '8026', APP_URL: `http://localhost:${DENEME_PORT}` }
  const compose = (...a) => kos('docker', ['compose', '-p', DENEME_PROJE, '-f', path.join(yedek, 'compose.yaml'), ...a], { env, cwd: yedek })
  const t0 = Date.now()
  let hata = null
  try {
    kos('docker', ['volume', 'create', `${DENEME_PROJE}_unopim-storage`])
    kos('docker', ['run', '--rm', '-v', `${DENEME_PROJE}_unopim-storage:/v`, '-v', `${yedek}:/in:ro`, 'alpine', 'sh', '-c', 'tar xzf /in/storage.tgz -C /v && chown -R 33:33 /v'])
    compose('up', '-d', '--wait', 'unopim-pgsql')
    const pg = `${DENEME_PROJE}-unopim-pgsql-1`
    kos('docker', ['cp', path.join(yedek, 'db.dump'), `${pg}:/tmp/yedek.dump`])
    kos('docker', ['exec', pg, 'sh', '-c', 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists /tmp/yedek.dump'])
    compose('up', '-d', '--wait')
    const web = `${DENEME_PROJE}-unopim-1`
    kos('docker', ['exec', web, 'php', '/var/www/html/artisan', 'unopim:product:index'])
    kos('docker', ['exec', web, 'php', '/var/www/html/artisan', 'unopim:category:index'])
    const urun = psqlSay(pg, 'products')
    const kategori = psqlSay(pg, 'categories')
    const giris = kos('curl', ['-s', '-o', os.devNull, '-w', '%{http_code}', `http://localhost:${DENEME_PORT}/admin/login`])
    const gunluk = spawnSync('docker', ['logs', web], { encoding: 'utf8' })
    const yeniAnahtar = /APP_KEY not set/.test(`${gunluk.stdout}${gunluk.stderr}`)
    const sure = Math.round((Date.now() - t0) / 1000)
    const tamam = urun === manifest.urun && kategori === manifest.kategori && giris === '200' && !yeniAnahtar
    console.log(`${tamam ? 'GERİ KURMA TAMAM' : 'GERİ KURMA KIRMIZI'} · ${sure} sn · ürün ${urun}/${manifest.urun} · kategori ${kategori}/${manifest.kategori} · giriş ${giris} · anahtar ${yeniAnahtar ? 'YENİDEN ÜRETİLDİ (yedekteki kullanılmadı)' : 'yedekten'}`)
    if (!tamam) process.exitCode = 1
  } catch (e) {
    hata = e
  } finally {
    spawnSync('docker', ['compose', '-p', DENEME_PROJE, '-f', path.join(yedek, 'compose.yaml'), 'down', '-v'], { env, cwd: yedek })
  }
  if (hata) throw hata
}

if (require.main === module) {
  const [komut, arg] = process.argv.slice(2)
  try {
    if (komut === 'al') al()
    else if (komut === 'dene') dene(arg)
    else if (komut === 'coz') coz(arg, process.argv[4])
    else { console.error('kullanım: unopim-yedek.cjs al | dene [yedek-klasörü] | coz <paket.vhenc> [hedef-kök]'); process.exitCode = 2 }
  } catch (e) {
    console.error(`HATA: ${e.message}`)
    process.exitCode = 1
  }
}

module.exports = { hedefDepoIcindeMi, DENEME_PROJE, KAYNAK_PROJE, SIHIR }
