#!/usr/bin/env node
/**
 * YEREL ÖN İZLEME — bir dalı ya da PR'ı bu makinede üretim derlemesiyle ayağa kaldırır (OPS 2026-09-25, REC-300 1a).
 *
 * KULLANIM (tek komut):
 *   node scripts/onizleme.mjs <dal-adı | PR-numarası> [--port 3100]
 *   → derler (next build), başlatır (next start) ve adresi basar: http://localhost:3100/tr
 *   Recep yalnız o adresi tarayıcıda açar. Durdurmak: pencerede Ctrl+C.
 *
 * NE YAPAR:
 *   1. Dalı `C:/tmp/vh-onizleme` çalışma ağacına ayrık (detached) olarak alır; ağaç varsa yeniden kullanır.
 *   2. `pnpm install --frozen-lockfile --offline` (karar 88: her ağaç kendi kurulumu; bağlantı YOK).
 *   3. `next build` + `next start -p <port>`.
 *
 * GÜVENLİK (bekçi: src/__tests__/conformance/onizleme-yalitimi.test.ts · INV-ONIZLEME-1):
 *   - Canlı veritabanına YALNIZ ziyaretçi (anon) anahtarıyla bağlanır: salt okuma, RLS altında.
 *     Anahtarın JWT gövdesindeki rol `anon` değilse betik DURUR (sunucu anahtarı yanlışlıkla gelmesin).
 *   - Next, derleme sırasında proje klasöründeki `.env*` dosyalarını KENDİLİĞİNDEN yükler. Ana depodaki `.env`
 *     sunucu anahtarı taşır; o yüzden derleme AYRI ağaçta yapılır ve oraya hiçbir `.env*` kopyalanmaz. Ağaçta
 *     `.env*` bulunursa betik DURUR. Sürece yalnız İZİN LİSTESİ geçer (ortamSuz).
 *   - Port 54321-54327 (yerel Supabase/gölge yığını) ve 3000 (geliştirme sunucusu) reddedilir.
 *   - Yönetici oturumu için gereken JWT_CLAIMS_COOKIE_SECRET her koşumda rastgele üretilir; üretim sırrı DEĞİL.
 *
 * SINIR: veri CANLI veridir (salt okuma). DB değişikliği isteyen dal (migration) bununla doğru görünmez —
 * onun için gölge DB'li ön izleme (REC-300 1b) ayrıca kurulacak.
 */
import { spawn, spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const CANLI_PROJE = 'tnofewwkwlyjsqgwjjga'
export const VARSAYILAN_PORT = 3100
export const ONIZLEME_AGACI = 'C:/tmp/vh-onizleme'
const YASAK_PORTLAR = new Set([3000, 54321, 54322, 54323, 54324, 54325, 54326, 54327])

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
  const r = spawnSync('git', argumanlar, { cwd, encoding: 'utf8' })
  return { kod: r.status, cikti: (r.stdout || '').trim(), hata: (r.stderr || '').trim() }
}

function ana(argv) {
  const hedef = argv.find((a) => !a.startsWith('--'))
  const portArg = argv.find((a) => a.startsWith('--port'))
  const port = portArg ? Number(portArg.split('=')[1] ?? argv[argv.indexOf(portArg) + 1]) : VARSAYILAN_PORT
  if (!hedef) dur('kullanım: node scripts/onizleme.mjs <dal-adı | PR-numarası> [--port 3100]')
  if (!portGecerli(port)) dur(`port ${port} kullanılamaz (1024-65535; 3000 ve 54321-54327 yasak)`)

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

  // Ağaç: yoksa kur, varsa aynı ağacı yeni dala çevir.
  console.log(`[onizleme] dal: ${dal}`)
  if (git(['fetch', 'origin', dal], depo).kod !== 0) dur(`origin/${dal} alınamadı`)
  if (fs.existsSync(ONIZLEME_AGACI)) {
    if (git(['status', '--porcelain'], ONIZLEME_AGACI).cikti) dur(`${ONIZLEME_AGACI} kirli — elle bak`)
    if (git(['checkout', '--detach', `origin/${dal}`], ONIZLEME_AGACI).kod !== 0) dur('ağaç dala çevrilemedi')
  } else if (git(['worktree', 'add', '--detach', ONIZLEME_AGACI, `origin/${dal}`], depo).kod !== 0) {
    dur('çalışma ağacı kurulamadı')
  }
  const envDosyalari = fs.readdirSync(ONIZLEME_AGACI).filter((f) => /^\.env/.test(f) && !/example/.test(f))
  if (envDosyalari.length) dur(`ön izleme ağacında ${envDosyalari.join(', ')} var — Next bunları yükler; kaldır`)

  const surecOrtami = ortamSuz(process.env, { url: env.NEXT_PUBLIC_SUPABASE_URL, anonAnahtar: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, port })
  const secenek = { cwd: ONIZLEME_AGACI, env: surecOrtami }

  kos('pnpm', ['install', '--frozen-lockfile', '--offline'], secenek)
  kos('pnpm', ['run', 'build'], secenek)

  console.log(`\n[onizleme] HAZIR → http://localhost:${port}/tr   (dal: ${dal} · veri: canlı, salt okuma · durdurmak: Ctrl+C)\n`)
  const sunucu = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], { ...secenek, stdio: 'inherit', shell: process.platform === 'win32' })
  sunucu.on('exit', (kod) => process.exit(kod ?? 0))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) ana(process.argv.slice(2))
