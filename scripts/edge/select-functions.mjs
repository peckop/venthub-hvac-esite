#!/usr/bin/env node
/**
 * scripts/edge/select-functions.mjs
 *
 * Değişen dosya listesinden DEPLOY EDİLECEK edge fonksiyonlarını seçer.
 *
 * Neden var: `deploy-functions.yml` uzun süre 7 fonksiyonun adını ELLE listeledi;
 * kalan 19 fonksiyon prod'da aylarca donmuş kaldı (repoda düzeltilmiş güvenlik
 * açıkları deploy edilmedi). Artık liste elle yazılmıyor, buradan türetiliyor.
 *
 * Kurallar:
 *   supabase/functions/<slug>/**            -> yalnız o fonksiyon
 *   supabase/functions/_shared/<dosya>      -> o dosyayı GERÇEKTEN import eden fonksiyonlar
 *   supabase/functions/deno.json            -> hepsi (tüm derlemeyi etkiler)
 *   supabase/config.toml                    -> hepsi (verify_jwt yalnız deploy'da uygulanır)
 *
 * Bağımlılık taraması YALNIZ kod uzantılarında yapılır (.ts/.tsx/.js/.mjs/.jsx).
 * Repoda her fonksiyonun yanında `index.md` companion dokümanı var ve bu dosyalar
 * `_shared/cors.ts` gibi yolları METİN olarak içeriyor -> .md taransaydı bağımlılık
 * grafiği yanlış-pozitif ile şişerdi (ör. apply-coupon cors'u import ETMİYOR).
 *
 * Kullanım:
 *   node scripts/edge/select-functions.mjs --all
 *   node scripts/edge/select-functions.mjs --changed supabase/functions/_shared/cors.ts
 *   git diff --name-only A B | node scripts/edge/select-functions.mjs --stdin
 *   node scripts/edge/select-functions.mjs --stdin --github-output   # GITHUB_OUTPUT'a yazar
 *   node scripts/edge/select-functions.mjs --self-test               # ağsız birim testi
 *
 * Çıktı: seçilen slug'lar, alfabetik (deterministik deploy sırası), satır başına bir tane.
 * Hiçbir şey seçilmezse çıktı BOŞ olur ve exit code 0'dır (deploy edilecek iş yok).
 */

import fs from 'node:fs'
import path from 'node:path'

const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.jsx'])
const FUNCTIONS_DIR = 'supabase/functions'
const CONFIG_TOML = 'supabase/config.toml'
const DENO_JSON = 'supabase/functions/deno.json'

/** Windows ters bölü + './' önekini normalize eder. */
export function toPosix(p) {
  return String(p).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
}

/** supabase/functions altındaki fonksiyon dizinlerini (slug) döndürür. */
export function listFunctionSlugs(root) {
  const dir = path.join(root, FUNCTIONS_DIR)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== '_shared' && !e.name.startsWith('.'))
    .map((e) => e.name)
    .sort()
}

function walkCodeFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walkCodeFiles(full, out)
    else if (CODE_EXT.has(path.extname(e.name))) out.push(full)
  }
  return out
}

/**
 * Bir kod metnindeki `../_shared/<dosya>` referanslarını çıkarır.
 * Hem statik `import ... from '../_shared/x.ts'` hem de dinamik
 * `await import('../_shared/x.ts')` yakalanır (repoda ikisi de kullanılıyor).
 */
export function extractSharedRefs(source) {
  const refs = new Set()
  const re = /['"`][^'"`]*_shared\/([A-Za-z0-9_.-]+)['"`]/g
  let m
  while ((m = re.exec(source)) !== null) refs.add(m[1])
  return refs
}

/**
 * _shared/<dosya> -> onu (doğrudan veya _shared içi zincirle) kullanan slug kümesi.
 */
export function buildSharedDependencyMap(root) {
  const slugs = listFunctionSlugs(root)
  const direct = new Map() // slug -> Set(_shared dosya adı)

  for (const slug of slugs) {
    const refs = new Set()
    for (const file of walkCodeFiles(path.join(root, FUNCTIONS_DIR, slug))) {
      for (const r of extractSharedRefs(fs.readFileSync(file, 'utf8'))) refs.add(r)
    }
    direct.set(slug, refs)
  }

  // _shared dosyaları birbirini import edebilir -> kapanış al.
  const sharedDir = path.join(root, FUNCTIONS_DIR, '_shared')
  const sharedEdges = new Map() // shared dosya -> Set(shared dosya)
  for (const file of walkCodeFiles(sharedDir)) {
    const name = path.basename(file)
    const inner = extractSharedRefs(fs.readFileSync(file, 'utf8'))
    // aynı dizindeki './x.ts' biçimini de yakala
    const rel = /['"`]\.\/([A-Za-z0-9_.-]+)['"`]/g
    let m
    const src = fs.readFileSync(file, 'utf8')
    while ((m = rel.exec(src)) !== null) inner.add(m[1])
    inner.delete(name)
    sharedEdges.set(name, inner)
  }

  const map = new Map() // shared dosya -> Set(slug)
  const allShared = new Set([
    ...sharedEdges.keys(),
    ...[...direct.values()].flatMap((s) => [...s]),
  ])

  for (const sharedFile of allShared) {
    const consumers = new Set()
    for (const [slug, refs] of direct) {
      if (reachesShared(refs, sharedFile, sharedEdges)) consumers.add(slug)
    }
    map.set(sharedFile, consumers)
  }
  return map
}

/** refs kümesinden sharedFile'a _shared içi kenarlarla ulaşılıyor mu? */
function reachesShared(refs, target, sharedEdges) {
  const seen = new Set()
  const stack = [...refs]
  while (stack.length) {
    const cur = stack.pop()
    if (cur === target) return true
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const next of sharedEdges.get(cur) ?? []) stack.push(next)
  }
  return false
}

/**
 * Ana seçim mantığı.
 * @returns {{ slugs: string[], reasons: Record<string,string[]>, warnings: string[] }}
 */
export function selectFunctions({ root, changed, all = false }) {
  const available = new Set(listFunctionSlugs(root))
  const reasons = {}
  const warnings = []
  const picked = new Set()

  const add = (slug, why) => {
    if (!available.has(slug)) {
      warnings.push(`atlandı: '${slug}' repoda yok (silinmiş olabilir) — tetikleyen: ${why}`)
      return
    }
    picked.add(slug)
    ;(reasons[slug] ??= []).push(why)
  }

  if (all) {
    for (const s of available) add(s, 'tümü istendi (--all / workflow_dispatch deploy_all)')
    return finalize(picked, reasons, warnings)
  }

  const sharedMap = buildSharedDependencyMap(root)

  for (const raw of changed) {
    const p = toPosix(raw)
    if (!p) continue

    if (p === CONFIG_TOML) {
      // verify_jwt YALNIZ `supabase functions deploy` sırasında uygulanır.
      // config.toml değiştiyse deploy edilmeyen fonksiyon eski korumada kalır -> hepsi.
      for (const s of available) add(s, 'supabase/config.toml değişti (verify_jwt yalnız deploy ile uygulanır)')
      continue
    }
    if (p === DENO_JSON) {
      for (const s of available) add(s, 'supabase/functions/deno.json değişti')
      continue
    }
    if (!p.startsWith(FUNCTIONS_DIR + '/')) continue

    const rest = p.slice(FUNCTIONS_DIR.length + 1)
    const first = rest.split('/')[0]

    if (first === '_shared') {
      const file = rest.split('/').slice(1).join('/')
      const base = path.posix.basename(file)
      const consumers = sharedMap.get(base)
      if (!consumers || consumers.size === 0) {
        warnings.push(`_shared/${base} değişti ama onu import eden fonksiyon bulunamadı`)
        continue
      }
      for (const s of consumers) add(s, `_shared/${base} değişti`)
      continue
    }

    add(first, `${p} değişti`)
  }

  return finalize(picked, reasons, warnings)
}

function finalize(picked, reasons, warnings) {
  return { slugs: [...picked].sort(), reasons, warnings }
}

/* ------------------------------------------------------------------ CLI */

function parseArgs(argv) {
  const out = { changed: [], all: false, stdin: false, root: process.cwd(), githubOutput: false, selfTest: false, quiet: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--all') out.all = true
    else if (a === '--stdin') out.stdin = true
    else if (a === '--github-output') out.githubOutput = true
    else if (a === '--self-test') out.selfTest = true
    else if (a === '--quiet') out.quiet = true
    else if (a === '--root') out.root = argv[++i]
    else if (a === '--changed') out.changed.push(argv[++i])
    else if (a === '--changed-from-file') {
      out.changed.push(...fs.readFileSync(argv[++i], 'utf8').split(/\r?\n/))
    } else if (a.startsWith('--')) {
      console.error(`Bilinmeyen argüman: ${a}`)
      process.exit(2)
    } else out.changed.push(a)
  }
  return out
}

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function selfTest(root) {
  const fails = []
  const eq = (name, got, want) => {
    const g = JSON.stringify(got)
    const w = JSON.stringify(want)
    if (g !== w) fails.push(`${name}\n  beklenen: ${w}\n  gelen   : ${g}`)
    else console.log(`  ok  ${name}`)
  }

  eq('toPosix', toPosix('supabase\\functions\\healthz\\index.ts'), 'supabase/functions/healthz/index.ts')
  eq(
    'extractSharedRefs statik+dinamik',
    [...extractSharedRefs("import {a} from '../_shared/cors.ts'\nawait import('../_shared/notify.ts')")].sort(),
    ['cors.ts', 'notify.ts']
  )

  const slugs = listFunctionSlugs(root)
  eq('slug listesi boş değil', slugs.length > 0, true)
  eq('_shared slug değil', slugs.includes('_shared'), false)

  const one = selectFunctions({ root, changed: ['supabase/functions/healthz/index.ts'] })
  eq('tek fonksiyon değişimi', one.slugs, ['healthz'])

  const md = selectFunctions({ root, changed: ['supabase/functions/apply-coupon/index.md'] })
  eq('companion .md de fonksiyonu seçer (dizin kuralı)', md.slugs, ['apply-coupon'])

  const cors = selectFunctions({ root, changed: ['supabase/functions/_shared/cors.ts'] })
  eq('cors.ts -> HEPSİ değil', cors.slugs.length < slugs.length, true)
  eq('cors.ts -> apply-coupon YOK (.md yanlış-pozitifi)', cors.slugs.includes('apply-coupon'), false)
  eq('cors.ts -> tcmb-rates-sync YOK', cors.slugs.includes('tcmb-rates-sync'), false)
  eq('cors.ts -> order-validate VAR', cors.slugs.includes('order-validate'), true)

  const tenant = selectFunctions({ root, changed: ['supabase/functions/_shared/tenant_config.ts'] })
  eq('tenant_config.ts -> shipping-webhook VAR', tenant.slugs.includes('shipping-webhook'), true)
  eq('tenant_config.ts -> healthz YOK', tenant.slugs.includes('healthz'), false)

  const cfg = selectFunctions({ root, changed: ['supabase/config.toml'] })
  eq('config.toml -> hepsi', cfg.slugs.length, slugs.length)

  const gone = selectFunctions({ root, changed: ['supabase/functions/silinmis-fn/index.ts'] })
  eq('repoda olmayan fonksiyon seçilmez', gone.slugs, [])
  eq('repoda olmayan fonksiyon uyarı üretir', gone.warnings.length, 1)

  const noop = selectFunctions({ root, changed: ['src/app/page.tsx', 'README.md'] })
  eq('alakasız değişiklik -> boş', noop.slugs, [])

  console.log('')
  if (fails.length) {
    console.error(`SELF-TEST FAIL (${fails.length}):\n` + fails.join('\n'))
    process.exit(1)
  }
  console.log('SELF-TEST OK')
}

const isMain = process.argv[1] && toPosix(process.argv[1]).endsWith('scripts/edge/select-functions.mjs')
if (isMain) {
  const args = parseArgs(process.argv.slice(2))
  if (args.selfTest) {
    selfTest(args.root)
  } else {
    if (args.stdin) args.changed.push(...readStdin().split(/\r?\n/))
    const changed = args.changed.map((s) => s.trim()).filter(Boolean)
    const { slugs, reasons, warnings } = selectFunctions({ root: args.root, changed, all: args.all })

    if (!args.quiet) {
      for (const w of warnings) console.error(`::warning::edge-select: ${w}`)
      console.error(`edge-select: ${slugs.length} fonksiyon seçildi`)
      for (const s of slugs) console.error(`  - ${s}  <- ${[...new Set(reasons[s])].join(' | ')}`)
    }

    process.stdout.write(slugs.join('\n') + (slugs.length ? '\n' : ''))

    if (args.githubOutput && process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `slugs=${slugs.join(' ')}\ncount=${slugs.length}\n`
      )
    }
  }
}
