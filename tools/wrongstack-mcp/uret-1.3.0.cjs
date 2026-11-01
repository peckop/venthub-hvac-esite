#!/usr/bin/env node
'use strict'
/**
 * WRONGSTACK 1.3.0 — KAYNAKTAN PAKET ÜRETİMİ (ARC-199, Recep 1 Kasım "1.3.0'ı eski yöntemle kur").
 *
 * ── NİÇİN VAR ──
 * 1.3.0 npm'de YOK (npm `latest` 1.1.11; 1.3.0 yalnız GitHub'da, 29 Ekim 2026, yalnız tek dosyalık program
 * olarak yayınlı). Bizim dört sunucumuz (sage-mcp, kanban-mcp, mailbox-mcp, codebase-index-mcp) npm paketi
 * olarak çalışır. Bu betik GitHub'daki v1.3.0 etiketinden o dört paketi ve iç bağımlılıklarını (15 paket) kendi
 * makinemizde derler, `npm pack` ile tarball yapar. `kurulum.cjs` sonra bu tarball'lardan `npm ci` koşar.
 * Tarball'lar (≈9 MB) DEPOYA GİRMEZ (OPS onayı 1 Kasım): `~/.claude/venthub-wrongstack-130/` altında durur;
 * depoda yalnız bu tarif, `wrongstack-130.sha256` ve `package-lock.json` bulunur.
 *
 * ── AYARLAR (aynı komutla yeniden üretilebilsin diye AÇIKÇA yazılı) ──
 *  - Kaynak: `git clone --depth 1 --branch v1.3.0 https://github.com/wrongstack/wrongstack.git C:/tmp/ws-src-1.3.0`
 *    (etiket ek açıklamalı; çıkan commit c52219246ef19591b1527ad1e06928c6b1aa1ce2).
 *  - Proje `packageManager: bun@1.4.3` der; pnpm bunu reddeder ("This project is configured to use bun").
 *    Bu yüzden her pnpm çağrısı `--config.package-manager-strict=false` ile koşar. Derleme betikleri Bun ister
 *    (`bun ../../scripts/build-package.mjs`): ölçülen Bun 1.4.2 yetti (proje 1.4.3 ister), Bun PATH'te olmalı.
 *  - Bağımlılık kurulumu `--ignore-scripts` (kurulum betikleri koşmaz). Projenin kilit dosyası `bun.lock`'tur,
 *    pnpm onu kullanmaz: dış (npm kaydı) bağımlılık sürümleri kurulum günündeki çözüme göre gelir. Bu yüzden
 *    TARBALL'LAR kayıt belgesidir; yeniden üretim aynı bayt sonucu vermeyebilir (ölçülmedi) → yeniden üretince
 *    `--kilit` ile kilit yenilenir ve `wrongstack-130.sha256` güncellenir.
 *  - `npm pack` öncesi `workspace:*` bağımlılık metinleri `1.3.0`a çevrilir (npm pack çevirmez; çevrilmezse
 *    tarball kurulamaz).
 *
 * ── KULLANIM ──
 *   node tools/wrongstack-mcp/uret-1.3.0.cjs           → klonla, kur, derle, paketle (≈3 dk), sağlama toplamı yaz
 *   node tools/wrongstack-mcp/uret-1.3.0.cjs --kilit   → paket kümesinden package.json bağımlılıkları + kilit üret
 *   node tools/wrongstack-mcp/uret-1.3.0.cjs --denetle → tarball'ların sağlama toplamı depodaki listeyle aynı mı
 * Çıktının son satırı `HAZIR` ya da `HATA: <neden>`.
 */
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const crypto = require('node:crypto')
const { execFileSync } = require('node:child_process')

const ARAC = __dirname
const SURUM = '1.3.0'
const ETIKET = 'v1.3.0'
const DEPO = 'https://github.com/wrongstack/wrongstack.git'
const KAYNAK = 'C:/tmp/ws-src-1.3.0'
const PAKET_DIZINI = path.join(os.homedir(), '.claude', 'venthub-wrongstack-130').replace(/\\/g, '/')
const SAGLAMA = path.join(ARAC, 'wrongstack-130.sha256')
/** Dört sunucumuz. */
const SUNUCULAR = ['sage-mcp', 'kanban-mcp', 'mailbox-mcp', 'codebase-index-mcp']
/** Sunucuların iç bağımlılık kapanışı (15 paket; 1 Kasım ölçüldü, `kapanis()` aynısını yeniden hesaplar). */
const PAKETLER = ['agent-catalog', 'codebase-index-mcp', 'contracts', 'coordination', 'core', 'hq', 'kanban', 'kanban-mcp', 'mailbox-mcp', 'mcp', 'persistence', 'primitives', 'sage', 'sage-mcp', 'tools']
const PNPM = ['--config.package-manager-strict=false']

function calistir(komut, args, ek = {}) {
  // .cmd dosyaları Windows'ta shell ister; argümanlar bu dosyada sabittir (dış girdi yok).
  return execFileSync(komut, args, { stdio: 'inherit', shell: process.platform === 'win32', windowsHide: true, ...ek })
}

function sha256(dosya) {
  return crypto.createHash('sha256').update(fs.readFileSync(dosya)).digest('hex')
}

function tarballAdi(ad) {
  return 'wrongstack-' + ad + '-' + SURUM + '.tgz'
}

/** Kaynak ağaçta dört sunucunun `workspace:` bağımlılık kapanışı. */
function kapanis() {
  const harita = {}
  for (const d of fs.readdirSync(path.join(KAYNAK, 'packages'))) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(KAYNAK, 'packages', d, 'package.json'), 'utf8'))
      harita[p.name] = { dizin: d, p }
    } catch {
      /* package.json olmayan klasör */
    }
  }
  const gorulen = new Set()
  const kuyruk = SUNUCULAR.map((s) => '@wrongstack/' + s)
  while (kuyruk.length) {
    const ad = kuyruk.pop()
    if (gorulen.has(ad)) continue
    gorulen.add(ad)
    const m = harita[ad]
    if (!m) throw new Error('kaynakta paket yok: ' + ad)
    const deps = { ...m.p.dependencies, ...m.p.optionalDependencies }
    for (const [k, v] of Object.entries(deps)) if (k.startsWith('@wrongstack/') && String(v).startsWith('workspace')) kuyruk.push(k)
  }
  return [...gorulen].map((a) => harita[a].dizin).sort()
}

function uret() {
  fs.rmSync(KAYNAK, { recursive: true, force: true })
  calistir('git', ['clone', '--depth', '1', '--branch', ETIKET, DEPO, KAYNAK])
  const filtre = SUNUCULAR.flatMap((s) => ['--filter', '@wrongstack/' + s + '...'])
  calistir('pnpm', ['install', ...PNPM, ...filtre, '--ignore-scripts'], { cwd: KAYNAK })
  calistir('pnpm', [...PNPM, ...filtre, 'run', 'build'], { cwd: KAYNAK })
  const dizinler = kapanis()
  if (dizinler.join() !== PAKETLER.join()) throw new Error('paket kumesi degisti: ' + dizinler.join(','))
  // npm pack `workspace:*` metnini çevirmez; çevrilmemiş tarball kurulamaz.
  for (const d of dizinler) {
    const dosya = path.join(KAYNAK, 'packages', d, 'package.json')
    const p = JSON.parse(fs.readFileSync(dosya, 'utf8'))
    for (const alan of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const [k, v] of Object.entries(p[alan] || {})) if (String(v).startsWith('workspace:')) p[alan][k] = SURUM
    }
    fs.writeFileSync(dosya, JSON.stringify(p, null, 2) + '\n')
  }
  fs.mkdirSync(PAKET_DIZINI, { recursive: true })
  for (const d of dizinler) calistir('npm', ['pack', '--ignore-scripts', '--pack-destination', PAKET_DIZINI], { cwd: path.join(KAYNAK, 'packages', d) })
  const satirlar = dizinler.map((d) => sha256(path.join(PAKET_DIZINI, tarballAdi(d))) + '  ' + tarballAdi(d))
  fs.writeFileSync(SAGLAMA, satirlar.join('\n') + '\n')
  process.stdout.write(dizinler.length + ' tarball yazildi: ' + PAKET_DIZINI + '\nsaglama: ' + SAGLAMA + '\n')
}

/** Tarball'ların toplamları depodaki listeyle aynı mı? Farkları döndürür. */
function denetle() {
  const fark = []
  const beklenen = new Map(fs.readFileSync(SAGLAMA, 'utf8').split('\n').filter(Boolean).map((s) => s.split(/\s+/).reverse()))
  for (const d of PAKETLER) {
    const dosya = path.join(PAKET_DIZINI, tarballAdi(d))
    if (!fs.existsSync(dosya)) fark.push('tarball yok: ' + dosya)
    else if (sha256(dosya) !== beklenen.get(tarballAdi(d))) fark.push('saglama farkli: ' + tarballAdi(d))
  }
  return fark
}

/**
 * package.json bağımlılıkları (sabit "1.3.0") + package-lock.json. Önce geçici klasörde `file:` bağımlılıkla
 * kurulur (kayıt 1.3.0'ı bilmez), sonra package.json sabit sürüme, kilitteki `resolved` ise tarball'ın mutlak
 * `file:` adresine yazılır: `npm ci` kilitteki adresten çeker; `INV-WRONGSTACK-MCP-1` (sabit sürüm + kilit
 * sürümü) aynen geçerli kalır.
 */
function kilitUret() {
  const gecici = fs.mkdtempSync(path.join(os.tmpdir(), 'wrongstack-130-kilit-'))
  const dosya = (d) => 'file:' + PAKET_DIZINI + '/' + tarballAdi(d)
  const overrides = Object.fromEntries(PAKETLER.map((d) => ['@wrongstack/' + d, dosya(d)]))
  const dependencies = Object.fromEntries(SUNUCULAR.map((s) => ['@wrongstack/' + s, overrides['@wrongstack/' + s]]))
  fs.writeFileSync(path.join(gecici, 'package.json'), JSON.stringify({ name: 'venthub-wrongstack-mcp', private: true, dependencies, overrides }, null, 2))
  calistir('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], { cwd: gecici })
  const kilit = JSON.parse(fs.readFileSync(path.join(gecici, 'package-lock.json'), 'utf8'))
  const paket = JSON.parse(fs.readFileSync(path.join(ARAC, 'package.json'), 'utf8'))
  paket.dependencies = Object.fromEntries(SUNUCULAR.map((s) => ['@wrongstack/' + s, SURUM]))
  fs.writeFileSync(path.join(ARAC, 'package.json'), JSON.stringify(paket, null, 2) + '\n')
  kilit.packages[''].dependencies = paket.dependencies
  delete kilit.packages[''].overrides
  for (const [ad, k] of Object.entries(kilit.packages)) {
    const m = ad.match(/^node_modules\/@wrongstack\/(.+)$/)
    if (!m || !PAKETLER.includes(m[1])) continue
    k.resolved = dosya(m[1])
  }
  fs.writeFileSync(path.join(ARAC, 'package-lock.json'), JSON.stringify(kilit, null, 2) + '\n')
  fs.rmSync(gecici, { recursive: true, force: true })
  process.stdout.write('package.json + package-lock.json yazildi (resolved = ' + PAKET_DIZINI + '/…)\n')
}

module.exports = { kapanis, tarballAdi, sha256, denetle, PAKETLER, SUNUCULAR, PAKET_DIZINI, SURUM }

if (require.main === module) {
  try {
    if (process.argv.includes('--denetle')) {
      const fark = denetle()
      if (fark.length) throw new Error(fark.join(' · '))
    } else if (process.argv.includes('--kilit')) kilitUret()
    else uret()
    process.stdout.write('HAZIR\n')
  } catch (e) {
    process.stdout.write('HATA: ' + String(e.message).slice(0, 400) + '\n')
    process.exitCode = 1
  }
}
