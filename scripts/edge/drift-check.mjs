#!/usr/bin/env node
/**
 * scripts/edge/drift-check.mjs
 *
 * REPO ≠ PROD SAPMA DEDEKTÖRÜ (edge functions).
 *
 * Varlık sebebi: 19 fonksiyon prod'da aylarca donmuş kaldı ve bunu kimse görmedi.
 * Sonuç: repoda kapatılmış 4 kimlik-doğrulamasız açık prod'da CANLI kaldı; ters
 * yönde de bir fonksiyonun repo sürümü prod'dakinden FAKİRDİ (codemod çalışan kodu
 * silmişti) — körlemesine deploy REGRESYON olurdu. Bu yüzden sapma SESSİZ kalamaz:
 * sapma varsa bu script exit 1 döner.
 *
 * Ne kontrol eder:
 *   1) Kaynak sapması    — prod'da deploy edilmiş dosya içeriği vs repo dosyası
 *   2) verify_jwt sapması — prod'daki gerçek değer vs supabase/config.toml
 *   3) Yetim fonksiyon   — prod'da var, repoda YOK (bir kez 14 tane çıkmıştı; biri
 *                          kimlik-doğrulamasız hesap açma ucuydu)
 *   4) Deploy edilmemiş  — repoda var, prod'da YOK
 *
 * Kaynağı NEREDEN alır (2026-08-15'te değişti):
 *   - Fonksiyon LİSTESİ  -> Management API: GET /v1/projects/{ref}/functions
 *     (slug, verify_jwt, version, status) — Authorization: Bearer $SUPABASE_ACCESS_TOKEN
 *   - Fonksiyon KAYNAĞI  -> `supabase functions download <slug>` (Supabase CLI).
 *     Management API'nin `/functions/{slug}/body` ucu KALDIRILDI: o uç derlenmiş bir
 *     ESZIP bundle (`ESZIP2.3` sihirli baytları, ~743 KB) döndürüyor ve
 *     `Accept: application/json` isteğini sunucu YOK SAYIYOR — yani kaynak
 *     karşılaştırması o yoldan YAPILAMIYOR (ölçüldü: CI run 31866494488).
 *     CLI eszip'i kendisi çözer; `_shared` bağımlılıklarını da çıkarır.
 *
 * REPOYA DOKUNMAZ: her slug için `os.tmpdir()` altında geçici bir "sahte proje"
 * dizini açılır (`<tmp>/<slug>/supabase/config.toml` içinde yalnız project_id),
 * CLI oraya yazar, karşılaştırma bittiğinde dizin silinir.
 *
 * Kullanım:
 *   SUPABASE_ACCESS_TOKEN=... SUPABASE_PROJECT_REF=... node scripts/edge/drift-check.mjs
 *   node scripts/edge/drift-check.mjs --self-test   # ağsız / token'sız / CLI'sız birim testi
 *   node scripts/edge/drift-check.mjs --json        # makine okunur çıktı
 *   node scripts/edge/drift-check.mjs --all-files   # _shared kopyalarını da karşılaştır
 *
 * Ortam değişkenleri:
 *   SUPABASE_ACCESS_TOKEN  (zorunlu)  API + CLI kimliği
 *   SUPABASE_PROJECT_REF   (zorunlu)  proje ref'i
 *   SUPABASE_API_URL       (ops.)     Management API tabanı
 *   SUPABASE_CLI_BIN       (ops.)     CLI ikili adı/yolu (varsayılan: supabase)
 *   DRIFT_DOWNLOAD_CONCURRENCY (ops.) eşzamanlı indirme sayısı (varsayılan: 4)
 *
 * Exit kodları:
 *   0 = sapma yok
 *   1 = SAPMA VAR (kırmızı)
 *   2 = çalıştırılamadı (token/ref yok, CLI yok/giriş yok, API hatası, indirme hatası)
 *       -> "0 sapma" ASLA denmez; çözemediğini açıkça söyler.
 */

import { execFile, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const API_BASE = process.env.SUPABASE_API_URL || 'https://api.supabase.com'
const FUNCTIONS_DIR = 'supabase/functions'
const CONFIG_TOML = 'supabase/config.toml'
const CLI_BIN = process.env.SUPABASE_CLI_BIN || 'supabase'
// Windows'ta CLI npm ile kurulunca `supabase.cmd` olabilir; kabuk olmadan spawn
// edilemez. Argümanlar sabit token'lar + slug (yalnız [a-z0-9-]) olduğu için
// kabuk üzerinden geçmeleri güvenli.
const USE_SHELL = process.platform === 'win32'
const DOWNLOAD_CONCURRENCY = Math.max(1, Number(process.env.DRIFT_DOWNLOAD_CONCURRENCY) || 4)

/* ------------------------------------------------------------ saf yardımcılar */

export function normalizeSource(text) {
  // Prod gövdesi CRLF ile dönebiliyor (Windows runner'dan deploy edilmiş sürümler).
  // Satır sonu farkı gerçek sapma DEĞİL -> normalize et. Başka hiçbir boşluk
  // dokunulmaz; gerçek fark gizlenmemeli.
  return String(text).replace(/\r\n/g, '\n').replace(/\n+$/, '\n')
}

/**
 * Prod dosya adını fonksiyon-göreli yola çevirir.
 *   C:\tmp\user_fn_..._6\functions\healthz\index.ts        -> healthz/index.ts
 *   /home/runner/work/x/supabase/functions/_shared/cors.ts -> _shared/cors.ts
 */
export function normalizeRemotePath(name) {
  const p = String(name).replace(/\\/g, '/')
  const marker = '/functions/'
  const i = p.lastIndexOf(marker)
  if (i !== -1) return p.slice(i + marker.length)
  if (p.startsWith('functions/')) return p.slice('functions/'.length)
  return p.replace(/^.*\//, '') // son çare: yalnız dosya adı
}

/**
 * config.toml'dan `[functions."slug"] verify_jwt` değerlerini okur.
 * Listelenmeyen fonksiyonun varsayılanı Supabase'de TRUE'dur.
 */
export function parseConfigVerifyJwt(toml) {
  const out = new Map()
  let current = null
  for (const rawLine of String(toml).split(/\r?\n/)) {
    const line = rawLine.replace(/(^|\s)#.*$/, '').trim()
    if (!line) continue
    const sec = line.match(/^\[functions\.(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\]$/)
    if (sec) {
      current = sec[1] ?? sec[2] ?? sec[3]
      continue
    }
    if (/^\[/.test(line)) {
      current = null
      continue
    }
    const kv = line.match(/^verify_jwt\s*=\s*(true|false)\s*$/)
    if (kv && current) out.set(current, kv[1] === 'true')
  }
  return out
}

/** Sıra-bağımsız satır çoklu-küme farkı: hangi yön ileri, kaç satır. */
export function diffStats(repoText, prodText) {
  const a = normalizeSource(repoText).split('\n')
  const b = normalizeSource(prodText).split('\n')
  const count = (arr) => {
    const m = new Map()
    for (const l of arr) m.set(l, (m.get(l) ?? 0) + 1)
    return m
  }
  const ca = count(a)
  const cb = count(b)
  let onlyRepo = 0
  let onlyProd = 0
  for (const [l, n] of ca) onlyRepo += Math.max(0, n - (cb.get(l) ?? 0))
  for (const [l, n] of cb) onlyProd += Math.max(0, n - (ca.get(l) ?? 0))

  let direction
  if (onlyRepo === 0 && onlyProd === 0) direction = 'aynı'
  else if (onlyProd === 0) direction = 'repo ileri (prod eski) — deploy gerekli'
  else if (onlyRepo === 0) direction = 'PROD İLERİ (repo fakir) — deploy REGRESYON olur'
  else direction = 'iki yönlü fark (belirsiz) — elle incele'

  return {
    repoLines: a.length,
    prodLines: b.length,
    onlyInRepo: onlyRepo,
    onlyInProd: onlyProd,
    direction,
    identical: onlyRepo === 0 && onlyProd === 0,
  }
}

/**
 * `supabase --version` sondasını yoruma çevirir (saf: test edilebilir).
 * probe: spawnSync sonucu benzeri { error?, status?, stdout? }
 */
export function cliProbeVerdict(probe) {
  if (probe?.error) {
    const enoent = probe.error.code === 'ENOENT'
    return {
      ok: false,
      reason: enoent ? 'not-found' : 'spawn-error',
      message: enoent
        ? 'Supabase CLI bulunamadi (ENOENT).'
        : `Supabase CLI calistirilamadi (${probe.error.code ?? probe.error.message ?? 'bilinmeyen hata'}).`,
    }
  }
  if (probe?.status !== 0) {
    return {
      ok: false,
      reason: 'failed',
      message: `Supabase CLI hata dondurdu (exit ${probe?.status ?? '?'}).`,
    }
  }
  return { ok: true, reason: 'ok', version: String(probe.stdout ?? '').trim() }
}

/* ------------------------------------------------------------------- API */

function requireEnv() {
  const token = process.env.SUPABASE_ACCESS_TOKEN
  const ref = process.env.SUPABASE_PROJECT_REF
  const missing = []
  if (!token) missing.push('SUPABASE_ACCESS_TOKEN')
  if (!ref) missing.push('SUPABASE_PROJECT_REF')
  if (missing.length) {
    console.error('')
    console.error('HATA: edge drift-check ÇALIŞTIRILAMADI — eksik ortam değişkeni: ' + missing.join(', '))
    console.error('')
    console.error('  Bu script prod ile karşılaştırma yapar; kimlik olmadan hiçbir şey doğrulayamaz.')
    console.error('  "sapma yok" SONUCU ÜRETİLMEDİ — sonuç YOK. (exit 2)')
    console.error('')
    console.error('  Yerel çalıştırma:')
    console.error('    SUPABASE_ACCESS_TOKEN=sbp_... SUPABASE_PROJECT_REF=<ref> node scripts/edge/drift-check.mjs')
    console.error('  CI: her ikisi de repo secret olarak tanımlı.')
    console.error('')
    process.exit(2)
  }
  return { token, ref }
}

/**
 * CLI olmadan kaynak karşılaştırması YAPILAMAZ. Yoksa exit 2 — asla "sapma yok".
 */
function requireCli() {
  const probe = spawnSync(CLI_BIN, ['--version'], { encoding: 'utf8', shell: USE_SHELL, windowsHide: true })
  const verdict = cliProbeVerdict(probe)
  if (!verdict.ok) {
    console.error('')
    console.error(`HATA: edge drift-check ÇALIŞTIRILAMADI — ${verdict.message}`)
    console.error('')
    console.error(`  Denenen komut: ${CLI_BIN} --version`)
    const detail = String(probe?.stderr ?? '').trim()
    if (detail) console.error(`  CLI stderr: ${detail.slice(0, 400)}`)
    console.error('')
    console.error('  Kaynak karşılaştırması Supabase CLI ile yapılır: Management API\'nin')
    console.error('  /functions/{slug}/body ucu derlenmiş ESZIP bundle döndürüyor, kaynak değil.')
    console.error('  CLI olmadan hiçbir şey ÖLÇÜLEMEZ — "sapma yok" SONUCU ÜRETİLMEDİ. (exit 2)')
    console.error('')
    console.error('  CI: drift job\'una `uses: supabase/setup-cli@v1` adımı ekli olmalı.')
    console.error('  Yerel: https://supabase.com/docs/guides/cli  (veya SUPABASE_CLI_BIN=<tam yol>)')
    console.error('')
    process.exit(2)
  }
  return verdict.version
}

function api(token, url, accept) {
  return fetch(url, {
    headers: { Authorization: `Bearer ${token}`, ...(accept ? { Accept: accept } : {}) },
  })
}

function fatal(msg) {
  console.error(`\nHATA: ${msg}\n  Sapma raporu ÜRETİLEMEDİ (exit 2) — "0 sapma" anlamına GELMEZ.\n`)
  process.exit(2)
}

/* ------------------------------------------------- CLI ile kaynak indirme */

/** Sınırlı eşzamanlılıkla çalıştırır; sonuçları giriş sırasında döner. */
async function runPool(items, limit, worker) {
  const results = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = cursor++
      if (i >= items.length) return
      results[i] = await worker(items[i])
    }
  })
  await Promise.all(runners)
  return results
}

function listFilesRecursive(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) listFilesRecursive(abs, acc)
    else if (entry.isFile()) acc.push(abs)
  }
  return acc
}

/**
 * İndirme kökü: os.tmpdir() altında tek geçici dizin. Süreç biterken silinir —
 * `process.exit()` ile çıkan yollarda da (fatal) temizlik yapılsın diye 'exit'
 * kancasına bağlanır. REPO DİZİNİNE ASLA YAZILMAZ.
 */
function makeTempRoot() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'venthub-edge-drift-'))
  process.on('exit', () => {
    try {
      fs.rmSync(base, { recursive: true, force: true })
    } catch {
      // temizlik best-effort: tmpdir'de kalan artık sonucu etkilemez
    }
  })
  return base
}

/**
 * Tek slug'ı geçici "sahte proje" dizinine indirir.
 * Dönen: { slug, files: [{name, content}] } veya { slug, error }
 * name -> fonksiyon-göreli yol: 'healthz/index.ts', '_shared/sentry.ts'
 */
async function downloadSlug(ref, tempRoot, slug) {
  const work = path.join(tempRoot, slug)
  const fnDir = path.join(work, 'supabase', 'functions')
  fs.mkdirSync(fnDir, { recursive: true })
  // CLI'nin "burası bir Supabase projesi" demesi için gereken TEK şey.
  fs.writeFileSync(path.join(work, 'supabase', 'config.toml'), `project_id = "${ref}"\n`, 'utf8')

  try {
    // `--use-api` ZORUNLU, kolaylık değil. Bayrak yokken CLI eszip'i **Docker ile**
    // yerelde açıyor; GitHub runner'da bu 26 fonksiyonun 19'unda SESSİZCE başarısız
    // oldu — CLI exit 0 döndürdü ama hiç dosya çıkarmadı (ölçüldü: CI run 31870449493;
    // çalışan 7 tanesi, tesadüfen, bundle'ı CI'da üretilmiş olanlardı).
    // `--use-api` unbundle'ı sunucu tarafında yaptırır: Docker bağımlılığı yok,
    // sonuç ortamdan bağımsız. Yerelde iki yolun da aynı dosyaları verdiği doğrulandı.
    await execFileAsync(CLI_BIN, ['functions', 'download', slug, '--project-ref', ref, '--use-api'], {
      cwd: work,
      shell: USE_SHELL,
      windowsHide: true,
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch (e) {
    const detail = String(e?.stderr || e?.stdout || e?.message || e).trim().slice(0, 600)
    return { slug, error: `'${CLI_BIN} functions download ${slug}' BAŞARISIZ (exit ${e?.code ?? '?'}): ${detail}` }
  }

  let files
  try {
    files = listFilesRecursive(fnDir).map((abs) => ({
      name: path.relative(fnDir, abs).replace(/\\/g, '/'),
      content: fs.readFileSync(abs, 'utf8'),
    }))
  } catch (e) {
    return { slug, error: `'${slug}' indirildi ama çıkarılan dosyalar okunamadı: ${e?.message ?? e}` }
  }

  if (!files.length) {
    return { slug, error: `'${slug}' için CLI hata vermedi ama HİÇ DOSYA çıkarmadı (${fnDir} boş).` }
  }
  return { slug, files }
}

/**
 * Tüm slug'ları indirir. Tek bir slug bile alınamazsa exit 2 — kısmi sonuçla
 * "sapma yok" denmez.
 */
async function downloadAll(ref, slugs) {
  if (!slugs.length) return new Map()
  const tempRoot = makeTempRoot()
  const started = Date.now()
  console.error(
    `[drift] ${slugs.length} fonksiyonun kaynağı indiriliyor ` +
      `(supabase functions download, paralellik ${DOWNLOAD_CONCURRENCY}, geçici dizin: ${tempRoot})`
  )

  const results = await runPool(slugs, DOWNLOAD_CONCURRENCY, (slug) => downloadSlug(ref, tempRoot, slug))
  const seconds = ((Date.now() - started) / 1000).toFixed(1)

  const failed = results.filter((r) => r.error)
  if (failed.length) {
    fatal(
      `Prod kaynağı indirilemedi — ${failed.length}/${slugs.length} fonksiyon (süre ${seconds}s).\n` +
        failed.map((f) => `    - ${f.error}`).join('\n') +
        '\n  "hata vermedi ama dosya çıkarmadı" görüyorsan: sunucu-tarafı unbundle (--use-api)\n' +
        '  bozulmuş olabilir. Bayrak KALDIRILMAMALI — kaldırılırsa CLI Docker ile açmaya çalışır\n' +
        '  ve runner\'da 26 fonksiyonun 19\'unda sessizce başarısız olur (CI run 31870449493).\n' +
        '  Diğer olası sebepler: SUPABASE_ACCESS_TOKEN geçersiz/süresi dolmuş, CLI sürümü eski,\n' +
        '  proje ref yanlış, ya da ağ erişimi yok. Kaynak karşılaştırması YAPILAMADI.'
    )
  }

  console.error(`[drift] indirme tamam: ${slugs.length} fonksiyon, ${seconds}s`)
  return new Map(results.map((r) => [r.slug, r.files]))
}

/* ------------------------------------------------------------------ main */

function repoSlugs(root) {
  const dir = path.join(root, FUNCTIONS_DIR)
  if (!fs.existsSync(dir)) fatal(`${FUNCTIONS_DIR} bulunamadi (root: ${root})`)
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== '_shared' && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort()
}

async function run({ root, asJson, compareAllFiles }) {
  const { token, ref } = requireEnv()
  const cliVersion = requireCli()
  console.error(`[drift] Supabase CLI: ${cliVersion || '(sürüm okunamadı)'}`)

  const listUrl = `${API_BASE}/v1/projects/${ref}/functions`
  const res = await api(token, listUrl, 'application/json')
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    fatal(`GET ${listUrl} -> HTTP ${res.status}. ${body.slice(0, 400)}`)
  }
  const prodList = await res.json()
  if (!Array.isArray(prodList)) fatal(`Liste ucu dizi dondurmedi: ${JSON.stringify(prodList).slice(0, 300)}`)

  const repo = repoSlugs(root)
  const repoSet = new Set(repo)
  const prodBySlug = new Map(prodList.map((f) => [f.slug, f]))

  const configPath = path.join(root, CONFIG_TOML)
  const cfg = fs.existsSync(configPath) ? parseConfigVerifyJwt(fs.readFileSync(configPath, 'utf8')) : new Map()

  const report = { orphans: [], missing: [], sourceDrift: [], jwtDrift: [], checked: 0, inactive: [] }

  // 3) Yetim: prod'da var, repoda yok
  for (const f of prodList) {
    if (!repoSet.has(f.slug)) {
      report.orphans.push({ slug: f.slug, verify_jwt: f.verify_jwt, version: f.version, status: f.status })
    }
    if (f.status && f.status !== 'ACTIVE') report.inactive.push({ slug: f.slug, status: f.status })
  }

  // 4) Deploy edilmemis: repoda var, prod'da yok
  for (const slug of repo) if (!prodBySlug.has(slug)) report.missing.push({ slug })

  // Kaynağı yalnız iki tarafta da bulunan fonksiyonlar için indir.
  const comparable = repo.filter((slug) => prodBySlug.has(slug))
  const deployedFilesBySlug = await downloadAll(ref, comparable)

  for (const slug of repo) {
    const prodFn = prodBySlug.get(slug)
    if (!prodFn) continue
    report.checked++

    // 2) verify_jwt sapmasi (config'de yoksa Supabase varsayilani true)
    const expected = cfg.has(slug) ? cfg.get(slug) : true
    const actual = prodFn.verify_jwt
    if (expected !== actual) {
      report.jwtDrift.push({
        slug,
        config: expected,
        configExplicit: cfg.has(slug),
        prod: actual,
        // config false + prod true => bir sonraki deploy KORUMAYI DUSURUR
        severity: expected === false && actual === true ? 'KRITIK' : 'UYARI',
      })
    }

    // 1) Kaynak sapmasi
    const files = deployedFilesBySlug.get(slug)
    if (!files) fatal(`'${slug}' icin indirilmis kaynak yok — indirme adimi eksik calisti.`)
    const targets = compareAllFiles
      ? files
      : files.filter((f) => f.name === `${slug}/index.ts` || f.name === 'index.ts')
    if (!targets.length) {
      report.sourceDrift.push({
        slug,
        file: 'index.ts',
        error: `prod govdesinde index.ts bulunamadi. Gelen dosyalar: ${files.map((f) => f.name).join(', ')}`,
      })
      continue
    }
    for (const rf of targets) {
      const rel = rf.name.includes('/') ? rf.name : `${slug}/${rf.name}`
      const local = path.join(root, FUNCTIONS_DIR, rel)
      if (!fs.existsSync(local)) {
        report.sourceDrift.push({ slug, file: rel, error: 'prod bu dosyayi iceriyor ama repoda YOK' })
        continue
      }
      const d = diffStats(fs.readFileSync(local, 'utf8'), rf.content)
      if (!d.identical) {
        report.sourceDrift.push({ slug, file: rel, ...d, prodVersion: prodFn.version, prodUpdatedAt: prodFn.updated_at })
      }
    }
  }

  const driftCount =
    report.orphans.length + report.missing.length + report.sourceDrift.length + report.jwtDrift.length

  if (asJson) console.log(JSON.stringify({ ...report, driftCount }, null, 2))
  else printReport(report, driftCount, repo.length, prodList.length)

  if (driftCount > 0) {
    console.error(`\n::error::edge drift: ${driftCount} sapma bulundu — repo ile prod AYNI DEGIL.`)
    process.exit(1)
  }
  console.log('\nSAPMA YOK: repo ile prod ayni.')
}

function printReport(r, driftCount, repoCount, prodCount) {
  const line = '-'.repeat(72)
  console.log(line)
  console.log(`EDGE SAPMA RAPORU  (repo: ${repoCount} fn, prod: ${prodCount} fn, karsilastirilan: ${r.checked})`)
  console.log(line)

  if (r.orphans.length) {
    console.log(`\n[YETIM] Prod'da var, repoda YOK — ${r.orphans.length}`)
    for (const o of r.orphans) console.log(`  ! ${o.slug}  verify_jwt=${o.verify_jwt} v${o.version} ${o.status}`)
    console.log('    -> Repo bunlari bilmiyor: kimse gozden gecirmiyor, kimse guncellemiyor.')
  }

  if (r.missing.length) {
    console.log(`\n[EKSIK] Repoda var, prod'a hic deploy edilmemis — ${r.missing.length}`)
    for (const m of r.missing) console.log(`  ! ${m.slug}`)
  }

  if (r.jwtDrift.length) {
    console.log(`\n[verify_jwt SAPMASI] — ${r.jwtDrift.length}`)
    for (const j of r.jwtDrift) {
      const src = j.configExplicit ? 'config.toml' : 'config.toml varsayilani'
      console.log(`  ! [${j.severity}] ${j.slug}: ${src}=${j.config}  prod=${j.prod}`)
      if (j.severity === 'KRITIK') console.log("      -> Bu fonksiyonun BIR SONRAKI DEPLOY'U prod korumasini DUSURUR.")
    }
  }

  if (r.sourceDrift.length) {
    console.log(`\n[KAYNAK SAPMASI] — ${r.sourceDrift.length}`)
    for (const s of r.sourceDrift) {
      if (s.error) {
        console.log(`  ! ${s.slug} (${s.file}): ${s.error}`)
        continue
      }
      console.log(
        `  ! ${s.slug} (${s.file}): repo ${s.repoLines} satir / prod ${s.prodLines} satir` +
          ` — yalniz repoda ${s.onlyInRepo}, yalniz prodda ${s.onlyInProd}`
      )
      console.log(`      yon: ${s.direction}   (prod v${s.prodVersion})`)
    }
  }

  if (r.inactive.length) {
    console.log(`\n[BILGI] ACTIVE olmayan fonksiyonlar: ${r.inactive.map((i) => `${i.slug}=${i.status}`).join(', ')}`)
  }

  console.log(`\n${line}\nTOPLAM SAPMA: ${driftCount}`)
}

/* -------------------------------------------------------------- self-test */

function selfTest() {
  const fails = []
  const eq = (name, got, want) => {
    const g = JSON.stringify(got)
    const w = JSON.stringify(want)
    if (g !== w) fails.push(`${name}\n  beklenen: ${w}\n  gelen   : ${g}`)
    else console.log(`  ok  ${name}`)
  }

  eq('normalizeRemotePath windows tmp', normalizeRemotePath('C:\\tmp\\user_fn_x_6\\functions\\healthz\\index.ts'), 'healthz/index.ts')
  eq('normalizeRemotePath posix runner', normalizeRemotePath('/home/runner/work/a/b/supabase/functions/_shared/cors.ts'), '_shared/cors.ts')
  eq('normalizeRemotePath ciplak', normalizeRemotePath('index.ts'), 'index.ts')

  eq('CRLF farki sapma degil', diffStats('a\r\nb\r\n', 'a\nb\n').identical, true)

  const fwd = diffStats('a\nb\nc\n', 'a\nb\n')
  eq('repo ileri', [fwd.direction, fwd.onlyInRepo, fwd.onlyInProd], ['repo ileri (prod eski) — deploy gerekli', 1, 0])

  const back = diffStats('a\nb\n', 'a\nb\nc\nd\n')
  eq('prod ileri (regresyon riski)', [back.direction, back.onlyInProd], ['PROD İLERİ (repo fakir) — deploy REGRESYON olur', 2])

  const both = diffStats('a\nx\n', 'a\ny\n')
  eq('iki yonlu', both.direction, 'iki yönlü fark (belirsiz) — elle incele')

  const toml = [
    '[functions]',
    '',
    '[functions."iyzico-callback"]',
    'verify_jwt = false          # iyzico cagiriyor',
    '',
    '[functions."admin-orders-latest"]',
    'verify_jwt = true',
    '',
    '# [functions."yorumlanmis"]',
    '# verify_jwt = false',
    '',
    '[db]',
    'verify_jwt = false',
  ].join('\n')
  const cfg = parseConfigVerifyJwt(toml)
  eq('toml: false okundu', cfg.get('iyzico-callback'), false)
  eq('toml: true okundu', cfg.get('admin-orders-latest'), true)
  eq('toml: yorum satiri sayilmadi', cfg.has('yorumlanmis'), false)
  eq('toml: [db] bolumu sizdirmadi', cfg.size, 2)

  // --- CLI sondasi (saf) -----------------------------------------------------
  eq('cliProbeVerdict: ENOENT -> not-found', cliProbeVerdict({ error: { code: 'ENOENT' } }).reason, 'not-found')
  eq(
    'cliProbeVerdict: ENOENT mesaji CLI\'yi adiyla soyluyor',
    cliProbeVerdict({ error: { code: 'ENOENT' } }).message.includes('Supabase CLI'),
    true
  )
  eq('cliProbeVerdict: exit!=0 -> failed', cliProbeVerdict({ status: 127, stdout: '' }).reason, 'failed')
  eq('cliProbeVerdict: exit 0 -> ok', cliProbeVerdict({ status: 0, stdout: ' 2.34.3\n' }), { ok: true, reason: 'ok', version: '2.34.3' })

  // --- CLI yoksa GERCEKTEN exit 2 (alt surec, AGA CIKMADAN) -------------------
  // Kritik davranis: kaynak olculemiyorsa script "sapma yok" DEMEZ.
  // CLI sondasi ag cagrisindan ONCE kostugu icin bu test token/ag gerektirmez.
  {
    const selfPath = fileURLToPath(import.meta.url)
    const child = spawnSync(process.execPath, [selfPath], {
      encoding: 'utf8',
      windowsHide: true,
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: 'self-test-sahte-token',
        SUPABASE_PROJECT_REF: 'self-test-sahte-ref',
        SUPABASE_CLI_BIN: 'venthub-boyle-bir-komut-yok',
      },
    })
    const out = `${child.stdout ?? ''}${child.stderr ?? ''}`
    eq('CLI yoksa exit 2', child.status, 2)
    eq('CLI yoksa mesaj CLI eksikligini soyluyor', /Supabase CLI/.test(out), true)
    eq('CLI yoksa "sapma yok" YAZMIYOR', /SAPMA YOK/.test(out), false)
    eq('CLI yoksa setup-cli ipucu veriyor', out.includes('supabase/setup-cli@v1'), true)
  }

  const real = path.join(process.cwd(), CONFIG_TOML)
  if (fs.existsSync(real)) {
    const rc = parseConfigVerifyJwt(fs.readFileSync(real, 'utf8'))
    eq('gercek config.toml parse edildi (>0 giris)', rc.size > 0, true)
    console.log(`      (${rc.size} fonksiyon icin verify_jwt tanimli; digerleri varsayilan true)`)
    console.log(`      ${[...rc.entries()].map(([k, v]) => `${k}=${v}`).join(', ')}`)
  }

  console.log('')
  if (fails.length) {
    console.error(`SELF-TEST FAIL (${fails.length}):\n` + fails.join('\n'))
    process.exit(1)
  }
  console.log('SELF-TEST OK  (ag/token/CLI gerektiren yollar bu modda calistirilmaz)')
}

/* -------------------------------------------------------------------- CLI */

const argv = process.argv.slice(2)
if (argv.includes('--self-test')) {
  selfTest()
} else {
  const rootIdx = argv.indexOf('--root')
  await run({
    root: rootIdx !== -1 ? argv[rootIdx + 1] : process.cwd(),
    asJson: argv.includes('--json'),
    // Varsayilan: yalniz index.ts. --all-files ile prod bundle'indaki _shared
    // kopyalari da karsilastirilir (daha siki, daha gurultulu).
    compareAllFiles: argv.includes('--all-files'),
  })
}
