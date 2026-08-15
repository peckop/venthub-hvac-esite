#!/usr/bin/env node
/**
 * `.githooks/` içindeki versiyonlanan kancaları git'e bağlar. `pnpm install`
 * sonrası `prepare` script'i ile otomatik koşar.
 *
 * ## Niçin `core.hooksPath` DEĞİL — ölçülerek görüldü (2026-08-15)
 *
 * İlk denemem `git config core.hooksPath .githooks` idi. Bu ayar **ana depo
 * yapılandırmasına** yazılır ve o deponun **bütün worktree'leri** tarafından
 * paylaşılır. Bu repoda aynı anda 4 worktree var, her biri farklı dalda:
 *
 *   worktree A (dalında .githooks VAR)  → kancalar çalışır
 *   worktree B (dalında .githooks YOK)  → git var olmayan dizini SESSİZCE atlar
 *                                          → B'nin kancaları TAMAMEN kapanır
 *
 * Yani "kanca kurmak", eş-controller'ın kancalarını sessizce kapatıyordu.
 * Ayarı verdiğim an bu oldu ve geri alındı. Dala-bağlı bir dizini, depo-geneli
 * bir ayarla göstermek yapısal olarak yanlış.
 *
 * ## Bunun yerine: SHIM (ince yönlendirici)
 *
 * Ortak `.git/hooks/` dizinine, tek işi delege etmek olan küçük kabuk betikleri
 * yazılır. Shim her koşuda **o worktree'nin kendi çalışma ağacına** bakar:
 *
 *   .githooks/<ad> varsa  → onu çalıştırır  (kanca dalla birlikte gelir/gider)
 *   yoksa                 → sessizce exit 0 (o dal etkilenmez)
 *
 * Böylece kanca dosyaları **versiyonlanır** (asıl amaç) ama davranış **dal
 * başına doğru** kalır. Shim'ler durağandır; içerik `.githooks/`'ta değişir.
 *
 * ## Değişmezler
 * - Kurulum ASLA install'ı düşürmez (Vercel/CI'da `.git` olmayabilir).
 * - Var olan gerçek kanca üzerine yazmadan önce **bir kez** yedeklenir.
 * - Eski `core.hooksPath=.githooks` ayarı görülürse KALDIRILIR (yukarıdaki hata).
 *
 * Kancaların kendisi ve gerekçeleri: `.githooks/README.md`
 */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC_DIR = path.join(repoRoot, '.githooks')
const SHIM_MARK = 'venthub-githooks-shim'

function git(args) {
  try {
    return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return null
  }
}

// Git deposu değilse (Vercel build, tarball indirmesi) sessizce çık.
const commonDir = git(['rev-parse', '--git-common-dir'])
if (commonDir === null) {
  console.log('[hooks] git deposu değil — kanca kurulumu atlandı.')
  process.exit(0)
}

// Geçmiş hatanın temizliği: dala-bağlı dizini depo-geneli ayarla göstermek yanlıştı.
if (git(['config', 'core.hooksPath']) === '.githooks') {
  git(['config', '--unset', 'core.hooksPath'])
  console.log('[hooks] eski core.hooksPath ayarı kaldırıldı (worktree\'ler arası sızıntı yapıyordu).')
}

if (!existsSync(SRC_DIR)) {
  console.log('[hooks] .githooks bu dalda yok — kurulacak kanca yok (shim\'ler zaten no-op).')
  process.exit(0)
}

const hooksDir = path.resolve(repoRoot, commonDir, 'hooks')
try {
  mkdirSync(hooksDir, { recursive: true })
} catch {
  console.log('[hooks] .git/hooks oluşturulamadı — kurulum atlandı, install etkilenmedi.')
  process.exit(0)
}

const names = readdirSync(SRC_DIR).filter((f) => !f.endsWith('.md') && !f.startsWith('.'))
const yazilan = []

for (const name of names) {
  const shim =
    `#!/bin/sh\n` +
    `# ${SHIM_MARK} — scripts/setup-hooks.mjs tarafından ÜRETİLDİ, elle düzenleme.\n` +
    `# Asıl kanca versiyonlu: .githooks/${name}  (gerekçeler: .githooks/README.md)\n` +
    `# Bu shim her worktree'de kendi çalışma ağacına bakar; kanca o dalda yoksa\n` +
    `# sessizce geçer — böylece tek bir depo-geneli ayar başka dalları kapatmaz.\n` +
    `ROOT=$(git rev-parse --show-toplevel 2>/dev/null) || exit 0\n` +
    `HOOK="$ROOT/.githooks/${name}"\n` +
    `[ -f "$HOOK" ] || exit 0\n` +
    `exec sh "$HOOK" "$@"\n`

  const dest = path.join(hooksDir, name)
  try {
    if (existsSync(dest)) {
      const mevcut = readFileSync(dest, 'utf8')
      if (mevcut === shim) continue // zaten güncel
      if (!mevcut.includes(SHIM_MARK)) {
        // Gerçek bir kanca duruyor: üzerine yazmadan önce BİR KEZ yedekle.
        const backup = `${dest}.oncesi-githooks`
        if (!existsSync(backup)) copyFileSync(dest, backup)
      }
    }
    writeFileSync(dest, shim, { mode: 0o755 })
    yazilan.push(name)
  } catch (e) {
    console.log(`[hooks] ${name} shim'i yazılamadı (${e?.code ?? e}) — atlandı.`)
  }
}

console.log(
  yazilan.length
    ? `[hooks] shim kuruldu: ${yazilan.join(', ')} -> .githooks/ (yedek: *.oncesi-githooks)`
    : `[hooks] shim'ler güncel (${names.join(', ')}).`,
)
