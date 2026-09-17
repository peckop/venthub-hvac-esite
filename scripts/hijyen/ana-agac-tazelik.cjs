#!/usr/bin/env node
/**
 * ANA AĞAÇ TAZELİĞİ — pencerelerin yüklediği ayarların DEPODAKİ hâlle aynı olup olmadığını ölçer
 * ve güvenliyse ana ağacı ileri sarar (REC-345, karar 44).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR (ölçüldü 2026-09-17)
 * ══════════════════════════════════════════════════════════════════════════════
 * Claude Code kancaları, CLAUDE.md'yi, `.claude/settings.json`'u ve `.mcp.json`'u ANA ağaçtan
 * (`CLAUDE_PROJECT_DIR`) yükler; şeritler ise worktree'de çalışır ve PR'ları uzakta merge eder.
 * Ana ağacı kimse çekmediği için 09-17'de ana ağaç origin/master'dan **50 commit gerideydi**:
 * graphify kancası (#1217), verify-on-stop onarımı (#1247), pano özeti (#1251) ve WrongStack
 * kurulumu (#1248) merge EDİLMİŞ ama HİÇBİR pencerede ETKİN DEĞİLDİ. Hiçbir kapı görmedi,
 * çünkü kapılar worktree'yi ölçüyordu.
 *
 * Engel de ölçüldü: ana ağaçta Recep'in kendi izin satırları `settings.json`'da commit'siz
 * duruyordu. `pull` kirli dosyaya dokunamaz; biri elle çözmedikçe ağaç sonsuza dek geride kalır.
 * Kalıcı yer `.claude/settings.local.json` (git-ignored) — oraya taşındı.
 *
 * ⭐AĞ YOK. `refs/remotes/origin/*` bütün worktree'lerde ORTAKTIR; herhangi bir şeridin `fetch`i
 * ana ağacın gördüğü origin/master'ı da tazeler. Oturum açılışı ağ beklemez.
 *
 * ⭐İLERİ SARMA YALNIZ GÜVENLİYSE (üç şart, biri eksikse DOKUNULMAZ ve sebebi yazılır):
 *   1. ana ağaç `master` dalında,
 *   2. İZLENEN dosyalarda değişiklik yok (izlenmeyen dosyalar engel değil — `.wrongstack/`,
 *      başka şeridin ekran görüntüleri; merge onlara dokunmaz),
 *   3. ana ağaçta origin/master'da olmayan commit yok (yalnız `--ff-only`).
 * Stash, reset, checkout YAPILMAZ: kirli ağaç birinin yarım işidir.
 *
 * Yöneten cetvel: docs/standards/fleet-mechanism-standard.md §20.2.
 */
const { execFileSync } = require('child_process')
const path = require('path')

/** Ana ağacın ölçüm sonucunu etkileyen yollar: bunlara dokunan merge ana ağacı ileri sardırır. */
const AYAR_YOLLARI = [/^\.claude\//, /^\.mcp\.json$/, /^CLAUDE\.md$/, /^tools\//, /^\.githooks\//]

function git(agac, args, zamanAsimi = 15000) {
  return execFileSync('git', ['-C', agac, ...args], {
    encoding: 'utf8',
    timeout: zamanAsimi,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  }).trim()
}

/** `git worktree list --porcelain` ilk kaydı = ana ağaç (git bunu sözleşme olarak ilk basar). */
function anaAgacYolu(herhangiAgac) {
  const satir = git(herhangiAgac, ['worktree', 'list', '--porcelain']).split('\n')[0] || ''
  if (!satir.startsWith('worktree ')) throw new Error('worktree listesi okunamadi')
  return path.resolve(satir.slice('worktree '.length).trim())
}

/**
 * @returns {{agac:string, dal:string, geride:number, ileride:number, kirli:string[]}}
 * Ölçemezse FIRLATIR — çağıran "ölçemedim" diye yazar, "geride değil" diye DEĞİL.
 */
function olc(agac, uzak = 'origin/master') {
  const dal = git(agac, ['rev-parse', '--abbrev-ref', 'HEAD'])
  const [ileride, geride] = git(agac, ['rev-list', '--left-right', '--count', `HEAD...${uzak}`])
    .split(/\s+/)
    .map(Number)
  const kirli = git(agac, ['status', '--porcelain', '--untracked-files=no'])
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  if (!Number.isFinite(geride) || !Number.isFinite(ileride)) throw new Error('sayim okunamadi')
  return { agac, dal, geride, ileride, kirli }
}

/** Neden ileri sarılamayacağını söyler; sarılabilirse null. */
function engel(o, beklenenDal = 'master') {
  if (o.dal !== beklenenDal) return `ana agac '${o.dal}' dalinda (beklenen ${beklenenDal})`
  if (o.kirli.length) return `izlenen ${o.kirli.length} dosyada degisiklik var: ${o.kirli.slice(0, 3).join(', ')}`
  if (o.ileride > 0) return `ana agacta origin'de olmayan ${o.ileride} commit var`
  return null
}

/**
 * Güvenliyse `merge --ff-only`. Hiçbir koşulda stash/reset/checkout yapmaz.
 * @returns {{durum:'guncel'|'ilerlendi'|'engelli'|'olcemedi', geride?:number, sebep?:string}}
 */
function ileriSar(agac, uzak = 'origin/master') {
  let o
  try {
    o = olc(agac, uzak)
  } catch (e) {
    return { durum: 'olcemedi', sebep: String((e && e.message) || e).slice(0, 160) }
  }
  if (o.geride === 0) return { durum: 'guncel', geride: 0 }
  const neden = engel(o)
  if (neden) return { durum: 'engelli', geride: o.geride, sebep: neden }
  try {
    git(agac, ['merge', '--ff-only', uzak], 60000)
  } catch (e) {
    return { durum: 'engelli', geride: o.geride, sebep: 'ff-only reddetti: ' + String((e && e.message) || e).slice(0, 160) }
  }
  return { durum: 'ilerlendi', geride: o.geride }
}

/** PR dosya listesi ana ağacın yüklediği bir yola değiyor mu? */
function ayarYolunaDeger(dosyalar) {
  return dosyalar.some((d) => AYAR_YOLLARI.some((r) => r.test(d)))
}

/** Oturum açılışı için tek satır; güncelse boş dize (sessizlik kuralı). */
function acilisSatiri(herhangiAgac) {
  let o
  try {
    o = olc(anaAgacYolu(herhangiAgac))
  } catch (e) {
    return `⚠ANA AGAC TAZELIGI OLCULEMEDI (${String((e && e.message) || e).slice(0, 120)}) — kanca/ayar bayat olabilir.\n`
  }
  if (o.geride === 0) return ''
  const neden = engel(o)
  return (
    `⚠ANA AGAC ${o.geride} COMMIT GERIDE (${o.agac}) — bu pencerenin kancalari/CLAUDE.md/.mcp.json ` +
    `DEPODAKI HALDEN ESKI.\n` +
    (neden
      ? `  Ileri sarilamaz: ${neden}. Stash/reset YAPMA; sahibini bul, Recep in izinleri ise settings.local.json a tasi.\n`
      : `  Guvenli: \`node scripts/hijyen/ana-agac-tazelik.cjs --ileri-sar\` (yalniz ff-only).\n`)
  )
}

module.exports = { AYAR_YOLLARI, anaAgacYolu, olc, engel, ileriSar, ayarYolunaDeger, acilisSatiri }

if (require.main === module) {
  const argv = process.argv.slice(2)
  let agac
  try {
    agac = anaAgacYolu(process.cwd())
  } catch (e) {
    process.stderr.write('ana-agac-tazelik: OLCEMEDI — ' + e.message + '\n')
    process.exit(2)
  }
  if (argv.includes('--ileri-sar')) {
    const s = ileriSar(agac)
    process.stdout.write(`ana-agac-tazelik: ${s.durum}` + (s.geride != null ? ` (geride ${s.geride})` : '') +
      (s.sebep ? ` — ${s.sebep}` : '') + '\n')
    process.exit(s.durum === 'olcemedi' ? 2 : s.durum === 'engelli' ? 1 : 0)
  }
  try {
    const o = olc(agac)
    process.stdout.write(`ana-agac-tazelik: ${o.agac} dal=${o.dal} geride=${o.geride} ileride=${o.ileride} kirli=${o.kirli.length}\n`)
    process.exit(o.geride > 0 ? 1 : 0)
  } catch (e) {
    process.stderr.write('ana-agac-tazelik: OLCEMEDI — ' + e.message + '\n')
    process.exit(2)
  }
}
