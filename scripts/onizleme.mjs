#!/usr/bin/env node
/**
 * YEREL ÖN İZLEME — bir dalı ya da PR'ı bu makinede üretim derlemesiyle ayağa kaldırır (OPS 2026-09-25, REC-300 1a).
 *
 * KULLANIM (tek komut):
 *   node scripts/onizleme.mjs <dal-adı | PR-numarası> [--port 3100] [--adres]
 *   → derler (next build), başlatır (next start) ve adresi basar: http://localhost:3100/tr
 *   Recep yalnız o adresi tarayıcıda açar. Durdurmak: pencerede Ctrl+C.
 *
 * NE YAPAR:
 *   1. Dalın commit'ini `C:/tmp/vh-onizleme` çalışma ağacına ayrık (detached) alır; ağaç varsa yeniden kullanır.
 *      Kaynak YEREL daldır (push edilmemiş iş ön izlenebilir; yalnız commit'li değişiklikler görünür), ANCAK yerel dal
 *      origin'in gerisindeyse origin alınır (ölçüldü: ana deponun yerel master'ı origin'in gerisinde kalıyor ve eski
 *      kod ön izlenirdi). Yerelde yoksa origin. Dalın sahibinin ağacına ve dalına dokunulmaz.
 *   2. `pnpm install --frozen-lockfile --offline` (karar 88: her ağaç kendi kurulumu; bağlantı YOK).
 *   3. `next build` + `next start -p <port>`. Aynı commit + aynı kip ile 12 saat içinde derlenmişse derleme KORUNUR.
 *
 * --adres KİPİ (ALT-37c; Cuma ADRES önizlemesi, karar 68): yeni adres şemasını YALNIZ bu ön izleme ağacında açar.
 *   Canlıda iki derleme sabiti arkasında kapalıdır; kimsenin dalı ya da canlı ortam değişmez. Sırayla:
 *     a. ağaç kilidi alınır (aynı ağacı iki ön izleme aynı anda yamalayamaz);
 *     b. ağaçtaki yama tablosu uygulanır (scripts/adres/onizleme-adres.mjs YAMALAR: ADRES_SEMASI_K3B = true, harita bağlantısı);
 *     c. eski adres haritası CANLIDAN üretilir (anon anahtarla, salt okuma) ve doğrulanır;
 *     d. NEXT_PUBLIC_ADRES_DILI=1 ile derlenir; yamalar derleme biter bitmez (ya da çökerse çıkışta) GERİ ALINIR;
 *     e. sunucu açılınca Recep'in 18 adresi sınanır (docs/plans/onizleme-tiklama-listesi-*.md, aracın kendi ağacından)
 *        ve tablo basılır; ardından tam tarama (scripts/adres/onizleme-tarama.cjs) koşar, yalnız özeti basılır.
 *
 * GÜVENLİK (bekçi: src/__tests__/conformance/onizleme-yalitimi.test.ts · INV-ONIZLEME-1; adres kipi: onizleme-adres-kipi.test.ts · INV-ONIZLEME-2):
 *   - Canlı veritabanına YALNIZ ziyaretçi (anon) anahtarıyla bağlanır: salt okuma, RLS altında.
 *     Anahtarın JWT gövdesindeki rol `anon` değilse betik DURUR (sunucu anahtarı yanlışlıkla gelmesin).
 *   - Next, derleme sırasında proje klasöründeki `.env*` dosyalarını KENDİLİĞİNDEN yükler. Ana depodaki `.env`
 *     sunucu anahtarı taşır; o yüzden derleme AYRI ağaçta yapılır ve oraya hiçbir `.env*` kopyalanmaz. Ağaçta
 *     `.env*` bulunursa betik DURUR. Sürece yalnız İZİN LİSTESİ geçer (ortamSuz).
 *   - Port 54321-54327 (yerel Supabase/gölge yığını) ve 3000 (geliştirme sunucusu) reddedilir.
 *   - Yönetici oturumu için gereken JWT_CLAIMS_COOKIE_SECRET her koşumda rastgele üretilir; üretim sırrı DEĞİL.
 *   - Yama geri alma ezme değildir: ağaçtaki elle değişikliğe dokunulmaz (bkz. yamalariGeriAl).
 *
 * SINIR: veri CANLI veridir (salt okuma). DB değişikliği isteyen dal (migration) bununla doğru görünmez —
 * onun için gölge DB'li ön izleme (REC-300 1b) ayrıca kurulacak.
 */
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  derlemeGerekli,
  derlemeHatasiOzetle,
  gercekIzleyici,
  HARITA_DOSYASI,
  hazirBekle,
  iliskiBul,
  izOku,
  izSil,
  izYaz,
  kaynakSec,
  kilitAl,
  kilitBirak,
  onKontrol,
  onKontrolTablosu,
  portMusait,
  tamTarama,
  tiklamaListesiBul,
  tiklamaListesiOku,
  yamalariGeriAl,
  yamalariUygula,
  yamaOzeti,
} from './adres/onizleme-adres.mjs'

export const CANLI_PROJE = 'tnofewwkwlyjsqgwjjga'
export const VARSAYILAN_PORT = 3100
export const ONIZLEME_AGACI = 'C:/tmp/vh-onizleme'
/** Bu betiğin KENDİ ağacı: tıklama listesi ve tam tarama tabloları buradan okunur (ön izlenen commit eskiyse bile güncel olan). */
const BU_AGAC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const YASAK_PORTLAR = new Set([3000, 54321, 54322, 54323, 54324, 54325, 54326, 54327])
const HARITA_KAYNAGI = 'src/lib/adres/haritaKaynagi.ts'

/** Port geçerli mi: 1024-65535 arası ve yerel yığın/geliştirme portlarından değil. */
export function portGecerli(port) {
  return Number.isInteger(port) && port >= 1024 && port <= 65535 && !YASAK_PORTLAR.has(port)
}

/** JWT gövdesindeki `role` alanı (imza doğrulanmaz; amaç yanlış anahtarı durdurmak). */
export function jwtRolu(anahtar) {
  const parca = String(anahtar ?? '').split('.')[1]
  if (!parca) return null
  try {
    return JSON.parse(Buffer.from(parca.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')).role ?? null
  } catch {
    return null
  }
}

/** `.env` biçimli metinden yalnız istenen anahtarları okur. */
export function envOku(metin, anahtarlar) {
  const out = {}
  for (const satir of String(metin).split(/\r?\n/)) {
    const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(satir)
    if (m && anahtarlar.includes(m[1])) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return out
}

/**
 * Derleme/başlatma sürecine geçecek ortam — İZİN LİSTESİ. Sistem değişkenlerinden yalnız çalışmak için
 * gerekenler (PATH vb.) geçer; adında KEY/SECRET/TOKEN/PASSWORD geçen hiçbir şey miras alınmaz.
 */
export function ortamSuz(sistem, { url, anonAnahtar, port }) {
  const temel = {}
  for (const [k, v] of Object.entries(sistem)) {
    if (/KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL|SUPABASE/i.test(k)) continue
    if (/^(PATH|Path|PATHEXT|SystemRoot|SYSTEMROOT|windir|COMSPEC|ComSpec|TEMP|TMP|HOME|USERPROFILE|APPDATA|LOCALAPPDATA|HOMEDRIVE|HOMEPATH|PNPM_HOME|NODE_OPTIONS|ProgramFiles|ProgramData|NUMBER_OF_PROCESSORS|PROCESSOR_ARCHITECTURE|OS|LANG)$/.test(k)) {
      temel[k] = v
    }
  }
  return {
    ...temel,
    NODE_ENV: 'production',
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonAnahtar,
    NEXT_PUBLIC_SITE_URL: `http://localhost:${port}`,
    JWT_CLAIMS_COOKIE_SECRET: `onizleme-${randomBytes(24).toString('hex')}`,
  }
}

function dur(mesaj) {
  console.error(`[onizleme] DURDU: ${mesaj}`)
  process.exit(1)
}

function kos(komut, argumanlar, secenek = {}) {
  const r = spawnSync(komut, argumanlar, { stdio: 'inherit', shell: process.platform === 'win32', ...secenek })
  if (r.status !== 0) dur(`${komut} ${argumanlar.join(' ')} → çıkış ${r.status}`)
}

function git(argumanlar, cwd) {
  // 2 dk sınır: ağ yokken `git fetch` sonsuza dek beklemesin (zaman aşımında kod null = başarısız).
  const r = spawnSync('git', argumanlar, { cwd, encoding: 'utf8', timeout: 120_000 })
  return { kod: r.status, cikti: (r.stdout || '').trim(), hata: (r.stderr || '').trim() }
}

/**
 * `next build`i çalıştırır: çıktı CANLI akar (5 dakikalık sessizlik "takıldı mı" dedirtir) ve aynı anda biriktirilir;
 * hata olursa özet çıkarılır (günlük yüzlerce uyarı taşır, hata satırı arada kaybolur).
 * @returns {Promise<{kod: number | null, metin: string}>}
 */
function derle(secenek) {
  return new Promise((coz) => {
    const cocuk = spawn('pnpm', ['run', 'build'], { ...secenek, stdio: ['inherit', 'pipe', 'pipe'], shell: process.platform === 'win32' })
    const parcalar = []
    let toplam = 0
    const biriktir = (akis, cikis) =>
      akis.on('data', (parca) => {
        cikis.write(parca)
        const s = parca.toString()
        parcalar.push(s)
        toplam += s.length
        while (toplam > 2_000_000 && parcalar.length > 1) toplam -= parcalar.shift().length
      })
    biriktir(cocuk.stdout, process.stdout)
    biriktir(cocuk.stderr, process.stderr)
    cocuk.on('error', (e) => coz({ kod: 1, metin: String(e) }))
    cocuk.on('close', (kod) => coz({ kod, metin: parcalar.join('') }))
  })
}

/** Yamaları ve üretilen haritayı geri alır; elle değiştirilmiş dosyaya dokunmaz, uyarır. */
function yamalariGeriAlUyarili() {
  const s = yamalariGeriAl(ONIZLEME_AGACI, git)
  if (s.atlanan.length > 0) console.error(`[onizleme] UYARI: ${s.atlanan.join(', ')} elle değiştirilmiş görünüyor; geri alınmadı (dokunulmadı)`)
  return s
}

/**
 * Eski adres haritasını CANLIDAN üretir ve doğrular. Çalıştırıcı (harita-uret.ts) anahtar env adı olarak
 * SUPABASE_SERVICE_ROLE_KEY bekler; buraya ANON anahtar verilir (rol denetimi `ana`da yapıldı). Üretici yalnız okur
 * (SELECT ve okuma işlevi; conformance: harita-uret-is-akisi.test.ts), sunucu anahtarı bu betikte hiç okunmaz.
 */
function haritaUret(anonAnahtar, surecOrtami) {
  const ortam = {
    ...surecOrtami,
    JITI_ALIAS: JSON.stringify({ '@/': `${ONIZLEME_AGACI}/src/` }), // göreli takma ad çözülemiyor (ölçüldü), mutlak yol
    SUPABASE_PROJECT_REF: CANLI_PROJE,
    SUPABASE_SERVICE_ROLE_KEY: anonAnahtar,
  }
  fs.mkdirSync(path.join(ONIZLEME_AGACI, 'src', 'data', 'generated'), { recursive: true })
  kos('pnpm', ['exec', 'jiti', 'scripts/adres/harita-uret.ts', '--cikti', HARITA_DOSYASI], { cwd: ONIZLEME_AGACI, env: ortam })
  kos('pnpm', ['exec', 'jiti', 'scripts/adres/harita-uret.ts', '--dogrula', HARITA_DOSYASI], { cwd: ONIZLEME_AGACI, env: ortam })
}

/** Sunucu açıldıktan sonra Recep'in tıklama listesindeki adresleri sınar ve tabloyu basar (sunucu açık kalır). */
async function adresOnKontrolu(port) {
  const taban = `http://localhost:${port}`
  const { ag, izle } = gercekIzleyici(taban)
  if (!(await hazirBekle(taban, { getir: ag }))) {
    console.error('[onizleme] ÖN KONTROL ATLANDI: sunucu 90 sn içinde cevap vermedi')
    return
  }
  // Liste aracın kendi ağacından okunur; orada yoksa ön izlenen commit'ten. (Ön izlenen commit listeyi henüz taşımıyorsa
  // ya da eskiyse, ölçülen şey liste değil derlenen kod olmalı: bayat liste sahte kırmızı üretmesin.)
  const belge = tiklamaListesiBul(BU_AGAC) ?? tiklamaListesiBul(ONIZLEME_AGACI)
  if (!belge) {
    console.error('[onizleme] ÖN KONTROL ATLANDI: docs/plans/onizleme-tiklama-listesi-*.md bu sürümde yok')
    return
  }
  const liste = tiklamaListesiOku(fs.readFileSync(belge, 'utf8'))
  if (liste.length === 0) {
    console.error(`[onizleme] ÖN KONTROL ATLANDI: ${path.basename(belge)} içinde adres satırı okunamadı`)
    return
  }
  const sonuclar = await onKontrol(liste, izle)
  console.log(`\n${onKontrolTablosu(sonuclar)}\n`)
  // Tam tarama aynı komutun içinde koşar (tablodan ve model listesinden türeyen adresler, yalnız GET; ölçülen: ~10 sn).
  // Sunucu açık kalır; tarama çökerse ön izleme düşmez, elle komutu yazılır.
  console.log('[onizleme] tam tarama başlıyor (yalnız GET)…')
  try {
    const { kod, satirlar } = await tamTarama(taban)
    console.log(`${satirlar.join('\n')}\n`)
    if (kod !== 0) console.log(`[onizleme] tam tarama çıkış kodu ${kod}: kırmızı ya da ölçülemeyen adres var (ayrıntı yukarıda)`)
  } catch (e) {
    console.error(`[onizleme] TAM TARAMA ÇALIŞMADI: ${e instanceof Error ? e.message : String(e)} (sunucu açık; elle: node ${path.join(BU_AGAC, 'scripts', 'adres', 'onizleme-tarama.cjs')} --taban ${taban})`)
  }
}

async function ana(argv) {
  const adres = argv.includes('--adres')
  const hedef = argv.find((a) => !a.startsWith('--'))
  const portArg = argv.find((a) => a.startsWith('--port'))
  const port = portArg ? Number(portArg.split('=')[1] ?? argv[argv.indexOf(portArg) + 1]) : VARSAYILAN_PORT
  if (!hedef) dur('kullanım: node scripts/onizleme.mjs <dal-adı | PR-numarası> [--port 3100] [--adres]')
  if (!portGecerli(port)) dur(`port ${port} kullanılamaz (1024-65535; 3000 ve 54321-54327 yasak)`)
  // Derleme 5 dakika sürer; port meşgulse bunu sonda değil BAŞTA öğren.
  if (!(await portMusait(port))) dur(`port ${port} meşgul — başka bir ön izleme açık olabilir (onu Ctrl+C ile kapat) ya da --port ile başka port ver`)

  const depo = path.resolve(git(['rev-parse', '--git-common-dir']).cikti, '..')

  let dal = hedef
  if (/^\d+$/.test(hedef)) {
    const r = spawnSync('gh', ['pr', 'view', hedef, '--json', 'headRefName', '-q', '.headRefName'], { encoding: 'utf8', shell: process.platform === 'win32' })
    dal = (r.stdout || '').trim()
    if (!dal) dur(`PR #${hedef} okunamadı (gh oturumu?)`)
  }

  // Okuma anahtarı: ana deponun .env.local'ından yalnız iki değer; rol ve proje doğrulanır.
  const envYolu = path.join(depo, '.env.local')
  if (!fs.existsSync(envYolu)) dur(`${envYolu} yok — NEXT_PUBLIC_SUPABASE_URL/ANON_KEY okunamıyor`)
  const env = envOku(fs.readFileSync(envYolu, 'utf8'), ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'])
  if (!env.NEXT_PUBLIC_SUPABASE_URL?.includes(`${CANLI_PROJE}.supabase.co`)) dur('NEXT_PUBLIC_SUPABASE_URL canlı proje değil')
  if (jwtRolu(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) !== 'anon') dur('okuma anahtarının rolü anon DEĞİL — sunucu anahtarı ön izlemeye verilmez')

  // Kaynak: yerel dal (push edilmemiş yazı ön izlenebilsin — R4.8), yerel origin'in gerisindeyse origin. Yerel dal başka
  // bir ağaçta açık olabilir; o yüzden dal değil COMMIT ayrık (detached) alınır, sahibinin ağacına dokunulmaz.
  const yerel = git(['rev-parse', '--verify', '--quiet', `refs/heads/${dal}^{commit}`], depo)
  const cekildi = git(['fetch', 'origin', dal], depo)
  const uzak = cekildi.kod === 0 ? git(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${dal}^{commit}`], depo) : { kod: 1, cikti: '' }
  const yerelCommit = yerel.kod === 0 && yerel.cikti ? yerel.cikti : null
  const uzakCommit = uzak.kod === 0 && uzak.cikti ? uzak.cikti : null
  const secim = kaynakSec({
    yerel: yerelCommit,
    uzak: uzakCommit,
    iliski: yerelCommit && uzakCommit && yerelCommit !== uzakCommit ? iliskiBul(git, depo, yerelCommit, uzakCommit) : undefined,
  })
  if (!secim) dur(`${dal} ne yerelde ne origin'de bulundu`)
  if (cekildi.kod !== 0 && yerelCommit) console.log("[onizleme] UYARI: origin'den çekilemedi (ağ yok ya da dal origin'de yok); tazelik doğrulanamadı, yerel dal ön izleniyor")
  if (secim.uyari) console.log(`[onizleme] UYARI: ${secim.uyari}`)
  const commit = secim.commit
  const kaynakEtiketi = secim.kaynak === 'yerel' ? `YEREL dal ${dal}` : `origin/${dal}`
  console.log(`[onizleme] kaynak: ${kaynakEtiketi} @ ${commit.slice(0, 9)}${secim.kaynak === 'yerel' ? " (yalnız commit'li değişiklikler görünür)" : ''}`)

  // Ağaç kilidi: yamalar ve .next başka bir ön izlemenin derlemesine sızmasın. Çıkışta (Ctrl+C, hata) bırakılır.
  const kilit = kilitAl(ONIZLEME_AGACI)
  if (!kilit.alindi) dur(`başka bir ön izleme bu ağacı kullanıyor (süreç ${kilit.sahip ?? '?'}) — onu Ctrl+C ile kapat ya da bitmesini bekle`)
  process.on('exit', () => {
    try {
      yamalariGeriAl(ONIZLEME_AGACI, git) // yarım kalan koşum ağaçta yama bırakmasın (bayrak yalnız bu ön izlemede açık olmalı)
    } catch {
      // sonraki koşum başında yeniden denenir
    }
    kilitBirak(ONIZLEME_AGACI)
  })
  process.on('SIGINT', () => process.exit(130))
  process.on('SIGTERM', () => process.exit(143))

  if (fs.existsSync(ONIZLEME_AGACI)) {
    yamalariGeriAlUyarili() // önceki --adres koşumundan kalan yama/harita (idempotent; elle değişikliğe dokunmaz)
    if (git(['status', '--porcelain'], ONIZLEME_AGACI).cikti) dur(`${ONIZLEME_AGACI} kirli — elle bak`)
    if (git(['checkout', '--detach', commit], ONIZLEME_AGACI).kod !== 0) dur("ağaç commit'e çevrilemedi")
  } else if (git(['worktree', 'add', '--detach', ONIZLEME_AGACI, commit], depo).kod !== 0) {
    dur('çalışma ağacı kurulamadı')
  }
  const envDosyalari = fs.readdirSync(ONIZLEME_AGACI).filter((f) => /^\.env/.test(f) && !/example/.test(f))
  if (envDosyalari.length) dur(`ön izleme ağacında ${envDosyalari.join(', ')} var — Next bunları yükler; kaldır`)

  const surecOrtami = ortamSuz(process.env, { url: env.NEXT_PUBLIC_SUPABASE_URL, anonAnahtar: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, port })
  if (adres) surecOrtami.NEXT_PUBLIC_ADRES_DILI = '1' // derleme sabiti; izin listesine EKLENMEZ, yalnız bu kipte sürece verilir
  const secenek = { cwd: ONIZLEME_AGACI, env: surecOrtami }

  kos('pnpm', ['install', '--frozen-lockfile', '--offline'], secenek)

  // `.next` kipler arasında paylaşılır: iz, derlemenin HANGİ commit ve HANGİ kiple yapıldığını söyler.
  const beklenen = { commit, adres, yamaOzeti: adres ? yamaOzeti() : '' }
  const iz = izOku(ONIZLEME_AGACI)
  const derlemeVar = fs.existsSync(path.join(ONIZLEME_AGACI, '.next', 'BUILD_ID'))
  if (!derlemeGerekli(iz, beklenen, derlemeVar)) {
    const dakika = Math.max(0, Math.round((Date.now() - Date.parse(iz.zaman)) / 60_000))
    console.log(`[onizleme] derleme KORUNDU: aynı commit, aynı kip, ${dakika} dk önce derlendi (sıfırdan derlemek için ${ONIZLEME_AGACI}/.next klasörünü sil)`)
  } else {
    izSil(ONIZLEME_AGACI) // yarım kalan derleme "geçerli" sayılmasın; iz yalnız başarıdan sonra yazılır
    if (adres) {
      const durumlar = yamalariUygula(ONIZLEME_AGACI)
      console.log(`[onizleme] ADRES kipi, ${durumlar.length} yama: ${durumlar.map((d) => `${path.basename(d.dosya)}=${d.durum}`).join(', ')} (yalnız bu ağaçta; derleme bitince geri alınır)`)
      if (durumlar.some((d) => d.dosya === HARITA_KAYNAGI && d.durum === 'uygulandi')) haritaUret(env.NEXT_PUBLIC_SUPABASE_ANON_KEY, surecOrtami)
      else console.log('[onizleme] eski adres haritası kaynakta ZATEN bağlı (Faz 3-C birleşik): harita üretilmedi')
    }
    const sonuc = await derle(secenek)
    if (adres) yamalariGeriAlUyarili()
    if (sonuc.kod !== 0) {
      console.error(`\n${derlemeHatasiOzetle(sonuc.metin)}\n`)
      dur(`pnpm run build → çıkış ${sonuc.kod}`)
    }
    izYaz(ONIZLEME_AGACI, beklenen)
  }

  console.log(`\n[onizleme] HAZIR → http://localhost:${port}/tr   (dal: ${dal} · kip: ${adres ? 'ADRES — yeni adres şeması AÇIK, yalnız bu ön izlemede' : 'normal'} · veri: canlı, salt okuma · durdurmak: Ctrl+C)\n`)
  const sunucu = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], { ...secenek, stdio: 'inherit', shell: process.platform === 'win32' })
  sunucu.on('exit', (kod) => process.exit(kod ?? 0))
  if (adres) await adresOnKontrolu(port)
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ana(process.argv.slice(2)).catch((e) => dur(e instanceof Error ? e.message : String(e)))
}
