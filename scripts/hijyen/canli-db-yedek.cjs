#!/usr/bin/env node
'use strict'
/**
 * ALT-188 — CANLI VERİTABANI GECE TAM YEDEĞİ (Supabase Free: platform yedeği ve PITR YOK).
 * Cetvel: docs/plans/rec409-canli-yedek-plani-2026-10-01.md (§5 bulguları §2-§3'ün ÜSTÜNDEDİR) + "v2 uygulama notu".
 * Emsal: scripts/pim/unopim-yedek.cjs (al / dene / coz, AES-256-GCM, sha256 manifest, depo içi hedef kapısı).
 *
 * KOMUTLAR
 *   anahtar-uret                      32 rastgele bayttan şifre anahtarı dosyası üretir; YOLUNU basar, İÇERİĞİNİ ASLA.
 *   al                                pg_dump -Fc → boş-yedek kapısı → şema kapısı → AES-256-GCM `.vhenc` + manifest → geri okuma doğrulaması → saklama.
 *   dene [yedek-*.vhenc]              sha256 + çözme + `pg_restore --list` ile içerik sayımı (verilmezse en yenisi). Geri yükleme DEĞİLDİR.
 *   coz <yedek-*.vhenc> [hedef-dizin] şifresiz dökümü güvenli geçici klasöre açar, yolunu basar (işin bitince silmek çağıranındır).
 *   temizle [--kuru]                  14 gün saklama (en az 3 yedek, doğrulanmış yedek korunur); önce silinecekleri basar.
 *
 * ORTAM
 *   SUPABASE_DB_URL        yalnız `al`; yalnız process.env'den okunur. pg_dump/psql'e PG* ortam değişkenleri olarak geçer,
 *                          komut satırı argümanı (argv) OLARAK ASLA; hata/çıktı metinleri sırlardan süzülür.
 *   CANLI_YEDEK_ANAHTAR    şifre anahtarı dosyası (varsayılan ~/.secrets/canli-db-yedek.key); depo ve yedek dizini içinde olamaz.
 *   CANLI_YEDEK_DIZIN      hedef dizin (varsayılan G:/Drive'ım/VentHub-Tasima/yedek/canli-db); depo içinde olamaz.
 *   PG_DUMP_YOLU / PG_RESTORE_YOLU / PSQL_YOLU   araç yolları (.js/.cjs/.mjs verilirse node ile koşulur: test için).
 *   CANLI_YEDEK_TABLO_TABANI (50) · CANLI_YEDEK_MUTLAK_BAYT_TABANI (524288) · CANLI_YEDEK_SAKLAMA_GUN (14) · CANLI_YEDEK_EN_AZ (3)
 *   CANLI_YEDEK_PG_EK_BAYRAK   pg_dump'a eklenecek `--` bayrakları (boşlukla ayrık; '@' içeremez). Varsayılan boş.
 *   CANLI_YEDEK_SEMA_KAPISI=kapali   şema karşılaştırmasını açıkça atlar (çıktıya yazılır; varsayılan AÇIK).
 *   CANLI_YEDEK_SIMDI      saklama hesabı için "şimdi" (ISO; yalnız test).
 *
 * ÇIKIŞ KODLARI: 0 tamam · 1 kapı/eşik/doğrulama/hata · 2 kullanım · 3 ÖLÇÜLEMEDİ (araç yok, şema sorgulanamadı: "yeşil" sayılmaz).
 *
 * ⚠ÖLÇÜLMEDİ (deneme dökümüyle müdür ölçecek): (a) `pg_restore --list` çıktısının satır biçimi (TABLE DATA / SCHEMA ayrıştırması
 *   17.4 yerel istemcide varsayıma dayanır) · (b) bağlantı türü (havuz/doğrudan; pg_dump oturum kipi ister) · (c) dışlama listesindeki
 *   şema ve tablo adlarının canlıdaki karşılığı · (d) boyut/süre · (e) `--no-owner/--no-privileges` kararı (aşağıda).
 *
 * --no-owner / --no-privileges GEREKÇESİ: döküme VARSAYILAN OLARAK eklenmez. Sahiplik ve GRANT bilgisi arşivde kalırsa geri yükleme
 * anında `pg_restore --no-owner --no-privileges` ile atılabilir (karar geri yükleyende); dökümde atılırsa kolon GRANT'leri (migration
 * kuralı: satır kapısı yetmez) bir daha geri gelmez. Hedefte `supabase_admin` yoksa geri yükleme `--no-owner` ile yapılır. Gerekirse
 * CANLI_YEDEK_PG_EK_BAYRAK="--no-owner" ile dökümde de atılır. Doğrulanmadı: "deneme dökümüyle ölçülecek".
 * `--jobs` YOK: -Fc tek dosya biçiminde paralel döküm desteklenmez (plan §5 bulgu 14); yük için gece saati + lock-wait zaman aşımı.
 */
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const crypto = require('node:crypto')
const { spawnSync } = require('node:child_process')

const SIHIR = Buffer.from('VHENC1')
const VARSAYILAN_HEDEF = "G:/Drive'ım/VentHub-Tasima/yedek/canli-db"
const AD_DESENI = /^yedek-(\d{8}T\d{6}Z)\.vhenc$/
// Supabase'in yönettiği ya da geri yüklenemeyen şemalar: AÇIKÇA dışlanır (izin listesi değil, dışlama listesi — plan §5 bulgu 4).
// vault: sırlar proje anahtarıyla şifreli, başka projeye geri yüklenemez (yeniden girilecek sır adları cetvelde). cron: işler migration'lardan kurulur.
const DISLANAN_SEMALAR = ['extensions', 'graphql', 'graphql_public', 'pgbouncer', 'pgsodium', 'pgsodium_masks', 'realtime', '_realtime', 'supabase_functions', 'vault', 'net', 'cron']
// Oturum/belirteç tabloları: yapı gelir, VERİ gelmez (plan §5 bulgu 10: gereksiz ve hassas).
const DISLANAN_VERI = ['auth.sessions', 'auth.refresh_tokens', 'auth.flow_state', 'auth.one_time_tokens', 'auth.mfa_challenges', 'auth.saml_relay_states']
const SEMA_SORGUSU = "select nspname from pg_namespace where nspname !~ '^pg_' and nspname <> 'information_schema' order by 1"
const AZAMI_BAYT = 1.5 * 1024 * 1024 * 1024

class YedekHatasi extends Error {
  constructor(mesaj, kod = 1) {
    super(mesaj)
    this.kod = kod
  }
}

// ── yardımcılar ───────────────────────────────────────────────────────────────────────────────────
function hedefDepoIcindeMi(dizin) {
  let d = path.resolve(dizin)
  for (;;) {
    if (fs.existsSync(path.join(d, '.git'))) return true
    const ust = path.dirname(d)
    if (ust === d) return false
    d = ust
  }
}
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex')
const sayiOrtam = (ad, varsayilan) => {
  const v = process.env[ad]
  if (v === undefined || v === '') return varsayilan
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) throw new YedekHatasi(`${ad} geçerli bir sayı değil`)
  return n
}
function damgaUret(tarih = new Date()) {
  return tarih.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
}
function damgadanTarih(d) {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(d)
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6])) : null
}
function hedefDizini() {
  return path.resolve(process.env.CANLI_YEDEK_DIZIN || VARSAYILAN_HEDEF)
}
function anahtarYolu() {
  return path.resolve(process.env.CANLI_YEDEK_ANAHTAR || path.join(os.homedir(), '.secrets', 'canli-db-yedek.key'))
}

// ── sır süzgeci: bağlantı dizesinin hiçbir parçası çıktıya/hataya sızmaz ──────────────────────────────
function bagKapsami(ham) {
  const gizli = new Set()
  const ekle = (v) => {
    if (typeof v === 'string' && v.length > 0) gizli.add(v)
  }
  ekle(ham)
  let u
  try {
    u = new URL(ham)
  } catch {
    throw new YedekHatasi('SUPABASE_DB_URL ayrıştırılamadı (değer güvenlik için gösterilmez)')
  }
  const dec = (s) => {
    try {
      return decodeURIComponent(s)
    } catch {
      return s
    }
  }
  const kullanici = dec(u.username)
  const parola = dec(u.password)
  ;[u.username, kullanici, u.password, parola, u.hostname].forEach(ekle)
  const veritabani = dec(u.pathname.replace(/^\//, ''))
  if (!u.hostname || !kullanici || !veritabani) throw new YedekHatasi('SUPABASE_DB_URL eksik parça içeriyor (sunucu/kullanıcı/veritabanı); değer gösterilmez')
  const env = {
    PGHOST: u.hostname,
    PGPORT: u.port || '5432',
    PGUSER: kullanici,
    PGDATABASE: veritabani,
    PGSSLMODE: u.searchParams.get('sslmode') || 'require',
    PGCONNECT_TIMEOUT: '30',
  }
  if (parola) env.PGPASSWORD = parola
  return { env, gizli: [...gizli].sort((a, b) => b.length - a.length) }
}
function suz(metin, gizli) {
  let s = String(metin == null ? '' : metin)
  for (const g of gizli || []) s = s.split(g).join('***')
  return s
}

// ── dış araç çağrısı ─────────────────────────────────────────────────────────────────────────────
function aracCalistir(ad, varsayilan, argv, secenek = {}) {
  const yol = process.env[ad] || varsayilan
  const betik = /\.(c|m)?js$/.test(yol)
  const komut = betik ? process.execPath : yol
  const tam = betik ? [yol, ...argv] : argv
  const gizli = secenek.gizli || []
  const cevre = { ...(secenek.env || process.env) }
  delete cevre.SUPABASE_DB_URL // hiçbir çocuk süreç bağlantı dizesini ortamında görmez
  const r = spawnSync(komut, tam, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: secenek.zamanAsimi || 30 * 60 * 1000, env: cevre })
  if (r.error) {
    if (r.error.code === 'ENOENT') throw new YedekHatasi(`${path.basename(yol)} bulunamadı: ölçülemedi (araç yolu: ${ad})`, 3)
    throw new YedekHatasi(`${path.basename(yol)} çalıştırılamadı: ${suz(r.error.message, gizli)}`)
  }
  if (r.status !== 0) throw new YedekHatasi(`${path.basename(yol)} ${suz(argv.slice(0, 1).join(' '), gizli)} → çıkış ${r.status}: ${suz(r.stderr, gizli).slice(0, 400)}`)
  return (r.stdout || '').trim()
}

// ── içerik sayımı (pg_restore --list) ────────────────────────────────────────────────────────────
function icerikCozumle(liste) {
  const tablolar = []
  const sema = new Set()
  for (const satir of String(liste).split('\n')) {
    let m = /^\d+; \d+ \d+ TABLE DATA (\S+) (\S+) /.exec(satir)
    if (m) {
      tablolar.push(`${m[1]}.${m[2]}`)
      sema.add(m[1])
      continue
    }
    m = /^\d+; \d+ \d+ SCHEMA - (\S+) /.exec(satir)
    if (m) {
      sema.add(m[1])
      continue
    }
    m = /^\d+; \d+ \d+ (?:TABLE|VIEW|MATERIALIZED VIEW|SEQUENCE|FUNCTION|PROCEDURE|TYPE|DOMAIN|AGGREGATE) (\S+) /.exec(satir)
    if (m) sema.add(m[1])
  }
  return { tablolar: tablolar.sort(), sema: [...sema].sort() }
}

// ── kapılar (saf; testlenir) ─────────────────────────────────────────────────────────────────────
function bosKapisi({ tabloSayisi, bayt, oncekiBayt, tabloTabani, mutlakTaban }) {
  const sorun = []
  if (tabloSayisi < tabloTabani) sorun.push(`TABLE DATA girdisi ${tabloSayisi} < taban ${tabloTabani}`)
  if (bayt < mutlakTaban) sorun.push(`döküm ${bayt} bayt < mutlak taban ${mutlakTaban}`)
  if (oncekiBayt && bayt < oncekiBayt / 2) sorun.push(`döküm ${bayt} bayt < önceki yedeğin yarısı (${Math.floor(oncekiBayt / 2)})`)
  return sorun
}
function semaKapisi(canliSemalar, dokumSemalar) {
  const dokumde = new Set(dokumSemalar)
  const dislanan = new Set(DISLANAN_SEMALAR)
  return canliSemalar.filter((s) => !dokumde.has(s) && !dislanan.has(s))
}
function saklamaPlani(adlar, simdi, gun, enAz, manifestOku) {
  const girdiler = adlar
    .map((ad) => {
      const m = AD_DESENI.exec(ad)
      const tarih = m ? damgadanTarih(m[1]) : null
      return tarih ? { ad, tarih, dogrulandi: !!(manifestOku(ad) || {}).dogrulandi } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.tarih - a.tarih)
  const sinir = simdi.getTime() - gun * 86400000
  const tut = new Set(girdiler.filter((g, i) => i < enAz || g.tarih.getTime() >= sinir).map((g) => g.ad))
  const dogrulananlar = girdiler.filter((g) => g.dogrulandi)
  if (dogrulananlar.length === 0) return { tut: girdiler.map((g) => g.ad), sil: [] } // doğrulanmış yedek yoksa HİÇBİRİ silinmez
  if (!dogrulananlar.some((g) => tut.has(g.ad))) tut.add(dogrulananlar[0].ad)
  return { tut: girdiler.filter((g) => tut.has(g.ad)).map((g) => g.ad), sil: girdiler.filter((g) => !tut.has(g.ad)).map((g) => g.ad) }
}

// ── şifreleme (emsal biçimi: 'VHENC1' | iv(12) | etiket(16) | gövde) ──────────────────────────────
function anahtarOku(yedekDizini) {
  const f = anahtarYolu()
  if (hedefDepoIcindeMi(path.dirname(f))) throw new YedekHatasi('şifre anahtarı bir git deposunun içinde — reddedildi')
  if (yedekDizini) {
    const d = path.resolve(yedekDizini)
    if (f === d || f.startsWith(d + path.sep)) throw new YedekHatasi('şifre anahtarı yedek dizininin içinde olamaz — yedekle birlikte taşınır; reddedildi')
  }
  if (!fs.existsSync(f)) throw new YedekHatasi(`şifre anahtarı yok: ${f} — önce \`anahtar-uret\` koş (anahtarsız yedek başlamaz)`)
  const k = Buffer.from(fs.readFileSync(f, 'utf8').trim(), 'base64')
  if (k.length !== 32) throw new YedekHatasi('şifre anahtarı 32 bayt değil')
  return k
}
function sifrele(duz, anahtar) {
  const iv = crypto.randomBytes(12)
  const c = crypto.createCipheriv('aes-256-gcm', anahtar, iv)
  const govde = Buffer.concat([c.update(duz), c.final()])
  return Buffer.concat([SIHIR, iv, c.getAuthTag(), govde])
}
function coz(veri, anahtar) {
  if (veri.length < 34 || !veri.subarray(0, 6).equals(SIHIR)) throw new YedekHatasi('VHENC1 paketi değil')
  const d = crypto.createDecipheriv('aes-256-gcm', anahtar, veri.subarray(6, 18))
  d.setAuthTag(veri.subarray(18, 34))
  try {
    return Buffer.concat([d.update(veri.subarray(34)), d.final()])
  } catch {
    throw new YedekHatasi('şifre çözülemedi — yanlış anahtar ya da bozuk paket')
  }
}

// ── geçici dizin: depo dışı, özel, her yolda silinir ─────────────────────────────────────────────
function ozelGecici(on) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), on))
  try {
    fs.chmodSync(d, 0o700)
  } catch {
    /* Windows: sessiz */
  }
  if (hedefDepoIcindeMi(d)) {
    fs.rmSync(d, { recursive: true, force: true })
    throw new YedekHatasi('geçici dizin bir git deposunun içine düştü — reddedildi')
  }
  return d
}
const sil = (d) => fs.rmSync(d, { recursive: true, force: true })

function manifestOkuDosyadan(dizin, vhencAdi) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dizin, vhencAdi.replace(/\.vhenc$/, '.manifest.json')), 'utf8'))
  } catch {
    return null
  }
}

// ── doğrulama (al'ın geri okuması ve dene ortak) ─────────────────────────────────────────────────
function dogrula(vhencYolu, manifest, anahtar) {
  const veri = fs.readFileSync(vhencYolu)
  if (sha(veri) !== manifest.sha256) throw new YedekHatasi('şifreli dosyanın sha256 değeri manifestle tutmuyor — bozuk')
  const duz = coz(veri, anahtar)
  if (sha(duz) !== manifest.acik_sha256) throw new YedekHatasi('çözülen dökümün sha256 değeri manifestle tutmuyor — bozuk')
  if (duz.subarray(0, 5).toString('latin1') !== 'PGDMP') throw new YedekHatasi('çözülen içerik pg_dump özel biçimi değil (PGDMP başlığı yok)')
  const gecici = ozelGecici('canli-yedek-dene-')
  try {
    const f = path.join(gecici, 'dokum.dump')
    fs.writeFileSync(f, duz, { mode: 0o600 })
    const icerik = icerikCozumle(aracCalistir('PG_RESTORE_YOLU', 'pg_restore', ['--list', f]))
    if (icerik.tablolar.length !== manifest.tablo_veri_sayisi) throw new YedekHatasi(`TABLE DATA sayısı ${icerik.tablolar.length} ≠ manifest ${manifest.tablo_veri_sayisi}`)
    if (JSON.stringify(icerik.tablolar) !== JSON.stringify([...manifest.tablolar].sort())) throw new YedekHatasi('tablo listesi manifestle tutmuyor')
    return icerik
  } finally {
    sil(gecici)
  }
}

// ── komutlar ─────────────────────────────────────────────────────────────────────────────────────
function anahtarUret() {
  const f = anahtarYolu()
  if (hedefDepoIcindeMi(path.dirname(f))) throw new YedekHatasi('anahtar yolu bir git deposunun içinde — reddedildi')
  if (fs.existsSync(f)) throw new YedekHatasi(`anahtar zaten var: ${f} — üzerine yazılmaz (kaybolursa yedekler açılmaz)`)
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, crypto.randomBytes(32).toString('base64'), { mode: 0o600 })
  let izin = 'mod 0600'
  if (process.platform === 'win32') {
    const r = spawnSync('icacls', [f, '/inheritance:r', '/grant:r', `${os.userInfo().username}:(R,W)`], { encoding: 'utf8' })
    izin = r.status === 0 ? 'icacls: yalnız bu kullanıcı' : 'icacls BAŞARISIZ — izni elle kısıtla'
  }
  console.log(`ANAHTAR ÜRETİLDİ: ${f} (${izin}) — yedekten AYRI bir yerde ikinci kopya tut; kaybolursa tüm yedekler açılmaz`)
}

function onceki(hedef) {
  const adlar = fs.readdirSync(hedef).filter((a) => AD_DESENI.test(a)).sort()
  for (const ad of adlar.reverse()) {
    const m = manifestOkuDosyadan(hedef, ad)
    if (m && m.dogrulandi) return m
  }
  return null
}

function saklamayiUygula(hedef, kuru) {
  const simdi = process.env.CANLI_YEDEK_SIMDI ? new Date(process.env.CANLI_YEDEK_SIMDI) : new Date()
  const plan = saklamaPlani(fs.readdirSync(hedef), simdi, sayiOrtam('CANLI_YEDEK_SAKLAMA_GUN', 14), sayiOrtam('CANLI_YEDEK_EN_AZ', 3), (ad) => manifestOkuDosyadan(hedef, ad))
  console.log(`SAKLAMA: tutulan ${plan.tut.length} · silinecek ${plan.sil.length}${kuru ? ' (KURU KOŞU, silinmedi)' : ''}`)
  for (const ad of plan.sil) console.log(`  SİLİNECEK: ${ad}`)
  if (kuru) return
  for (const ad of plan.sil) {
    for (const f of [ad, ad.replace(/\.vhenc$/, '.manifest.json')]) {
      const tam = path.join(hedef, path.basename(f)) // yalnız hedef dizinin içi, yalnız bu ad deseni
      if (fs.existsSync(tam)) fs.unlinkSync(tam)
    }
  }
}

function al() {
  const hedef = hedefDizini()
  if (hedefDepoIcindeMi(hedef)) throw new YedekHatasi('CANLI_YEDEK_DIZIN bir git deposunun içinde — yedek kişisel veri taşır, reddedildi')
  const anahtar = anahtarOku(hedef) // anahtar sorunu varsa yedek BAŞLAMADAN dur
  const ham = process.env.SUPABASE_DB_URL
  if (!ham) throw new YedekHatasi('SUPABASE_DB_URL tanımlı değil')
  const { env: pgEnv, gizli } = bagKapsami(ham)
  const ek = (process.env.CANLI_YEDEK_PG_EK_BAYRAK || '').split(/\s+/).filter(Boolean)
  for (const b of ek) if (!b.startsWith('--') || b.includes('@')) throw new YedekHatasi('CANLI_YEDEK_PG_EK_BAYRAK yalnız `--` bayrakları içerebilir ve bağlantı bilgisi taşıyamaz')
  fs.mkdirSync(hedef, { recursive: true })
  const baslangic = Date.now()
  const damga = damgaUret()
  const ad = `yedek-${damga}.vhenc`
  const cikti = path.join(hedef, ad)
  if (fs.existsSync(cikti)) throw new YedekHatasi(`${ad} zaten var — aynı saniyede ikinci koşu`)
  const cevre = { ...process.env, ...pgEnv }
  delete cevre.SUPABASE_DB_URL
  const gecici = ozelGecici('canli-yedek-al-')
  const yazim = path.join(hedef, `.yazim-${damga}.tmp`)
  try {
    const dump = path.join(gecici, 'dokum.dump')
    const argv = ['--format=custom', `--file=${dump}`, '--lock-wait-timeout=60000', ...DISLANAN_SEMALAR.map((s) => `--exclude-schema=${s}`), ...DISLANAN_VERI.map((t) => `--exclude-table-data=${t}`), ...ek]
    const surum = aracCalistir('PG_DUMP_YOLU', 'pg_dump', ['--version'])
    aracCalistir('PG_DUMP_YOLU', 'pg_dump', argv, { env: cevre, gizli })
    if (!fs.existsSync(dump)) throw new YedekHatasi('pg_dump çıkış verdi ama döküm dosyası yok')
    const duz = fs.readFileSync(dump)
    if (duz.length > AZAMI_BAYT) throw new YedekHatasi('döküm 1,5 GiB üstü — bellek içi şifreleme sınırı; akışlı şifrelemeye geçiş gerekir')
    if (duz.subarray(0, 5).toString('latin1') !== 'PGDMP') throw new YedekHatasi('döküm pg_dump özel biçimi değil (PGDMP başlığı yok); dosya yazılmadı')
    const icerik = icerikCozumle(aracCalistir('PG_RESTORE_YOLU', 'pg_restore', ['--list', dump]))
    const oncekiManifest = onceki(hedef)
    const sorun = bosKapisi({
      tabloSayisi: icerik.tablolar.length,
      bayt: duz.length,
      oncekiBayt: oncekiManifest ? oncekiManifest.acik_bayt : 0,
      tabloTabani: sayiOrtam('CANLI_YEDEK_TABLO_TABANI', 50),
      mutlakTaban: sayiOrtam('CANLI_YEDEK_MUTLAK_BAYT_TABANI', 524288),
    })
    if (sorun.length) throw new YedekHatasi(`BOŞ/ŞÜPHELİ YEDEK REDDEDİLDİ (dosya yazılmadı): ${sorun.join('; ')}`)
    if (process.env.CANLI_YEDEK_SEMA_KAPISI === 'kapali') {
      console.log('UYARI: şema kapısı AÇIKÇA kapatıldı (CANLI_YEDEK_SEMA_KAPISI=kapali)')
    } else {
      const canli = aracCalistir('PSQL_YOLU', 'psql', ['-X', '-qAt', '-c', SEMA_SORGUSU], { env: cevre, gizli })
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      if (canli.length === 0) throw new YedekHatasi('canlı şema listesi boş döndü: şema kapısı ölçülemedi', 3)
      const acikta = semaKapisi(canli, icerik.sema)
      if (acikta.length) throw new YedekHatasi(`AÇIKLANMAMIŞ ŞEMA dökümde yok (dosya yazılmadı): ${acikta.join(', ')}`)
    }
    const sifreli = sifrele(duz, anahtar)
    const manifest = {
      surum: 1,
      damga,
      sure_sn: Math.round((Date.now() - baslangic) / 1000),
      pg_dump: surum,
      bayt: sifreli.length,
      sha256: sha(sifreli),
      acik_bayt: duz.length,
      acik_sha256: sha(duz),
      tablo_veri_sayisi: icerik.tablolar.length,
      tablolar: icerik.tablolar,
      semalar: icerik.sema,
      dislanan_sema: DISLANAN_SEMALAR,
      dislanan_veri: DISLANAN_VERI,
      dogrulandi: false,
    }
    fs.writeFileSync(yazim, sifreli, { mode: 0o600 })
    dogrula(yazim, manifest, anahtar) // geri okuma: çözülür, sha256 ve içerik sayımı tutmalı
    manifest.dogrulandi = true
    fs.renameSync(yazim, cikti)
    fs.writeFileSync(path.join(hedef, `yedek-${damga}.manifest.json`), JSON.stringify(manifest, null, 2))
    console.log(`YEDEK TAMAM ${cikti} · ${manifest.sure_sn} sn · ${manifest.bayt} bayt (şifreli) · TABLE DATA ${manifest.tablo_veri_sayisi} · şema ${manifest.semalar.length} · ${surum}`)
  } finally {
    sil(gecici)
    if (fs.existsSync(yazim)) fs.unlinkSync(yazim)
  }
  saklamayiUygula(hedef, false)
}

function enYeni(hedef) {
  const adlar = fs.readdirSync(hedef).filter((a) => AD_DESENI.test(a)).sort()
  if (!adlar.length) throw new YedekHatasi(`${hedef} içinde yedek-*.vhenc yok`)
  return path.join(hedef, adlar[adlar.length - 1])
}

function dene(verilen) {
  const hedef = hedefDizini()
  const dosya = path.resolve(verilen || enYeni(hedef))
  const dizin = path.dirname(dosya)
  const manifest = manifestOkuDosyadan(dizin, path.basename(dosya))
  if (!manifest) throw new YedekHatasi('eş manifest bulunamadı (yedek-*.manifest.json)')
  const icerik = dogrula(dosya, manifest, anahtarOku(null))
  console.log(`DENEME TAMAM ${path.basename(dosya)} · sha256 tuttu · çözüldü · TABLE DATA ${icerik.tablolar.length}/${manifest.tablo_veri_sayisi} · şema ${icerik.sema.length} (geri yükleme DEĞİL: elle denenecek)`)
}

function cozKomutu(dosya, hedefKok) {
  if (!dosya) throw new YedekHatasi('kullanım: coz <yedek-*.vhenc> [hedef-dizin]')
  const duz = coz(fs.readFileSync(path.resolve(dosya)), anahtarOku(null))
  let kok
  if (hedefKok) {
    kok = path.resolve(hedefKok)
    if (hedefDepoIcindeMi(kok)) throw new YedekHatasi('çözme hedefi bir git deposunun içinde — reddedildi')
    fs.mkdirSync(kok, { recursive: true })
  } else {
    kok = ozelGecici('canli-yedek-coz-')
  }
  const f = path.join(kok, 'dokum.dump')
  fs.writeFileSync(f, duz, { mode: 0o600 })
  console.log(`ÇÖZÜLDÜ → ${f} (şifresiz kişisel veri içerir; işin bitince SİL)`)
}

function main(argv) {
  const [komut, arg, arg2] = argv
  try {
    if (komut === 'anahtar-uret') anahtarUret()
    else if (komut === 'al') al()
    else if (komut === 'dene') dene(arg)
    else if (komut === 'coz') cozKomutu(arg, arg2)
    else if (komut === 'temizle') saklamayiUygula(hedefDizini(), arg === '--kuru')
    else {
      console.error('kullanım: canli-db-yedek.cjs anahtar-uret | al | dene [yedek.vhenc] | coz <yedek.vhenc> [hedef-dizin] | temizle [--kuru]')
      return 2
    }
    return 0
  } catch (e) {
    const gizli = e && e.gizli ? e.gizli : []
    console.error(`HATA: ${suz(e && e.message, gizli)}`)
    return e instanceof YedekHatasi ? e.kod : 1
  }
}

if (require.main === module) process.exitCode = main(process.argv.slice(2))

module.exports = { hedefDepoIcindeMi, bosKapisi, semaKapisi, saklamaPlani, icerikCozumle, bagKapsami, suz, sifrele, coz, DISLANAN_SEMALAR, DISLANAN_VERI, SIHIR }
