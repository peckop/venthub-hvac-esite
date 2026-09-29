#!/usr/bin/env node
'use strict'
/**
 * SQL YAZMA KAPISI — REC-410 S1 (izin denetimi 09-28, Recep: "beş kapı kâğıtta değil gerçekten korunsun").
 *
 * ── NİÇİN VAR (ölçüldü 09-28) ──
 *
 * Canlı veritabanında SQL çalıştıran araç iki adla ALLOW listesinde: `mcp__claude_ai_Supabase__execute_sql`
 * (proje settings.local.json) ve `mcp__plugin_supabase_supabase__execute_sql` (kullanıcı settings.json).
 * Yani bir pencere `DELETE FROM orders` çalıştırsa önüne hiçbir soru çıkmaz. İzin listesi SQL'in
 * İÇERİĞİNE bakamaz; bu kanca bakar.
 *
 * ── KARAR ──
 *
 * Okuma → sessizce geçer (karar vermez, izin listesi işler). Okuma olduğu KANITLANAMAYAN her şey →
 * `ask` (Recep'e onay sorusu). Varsayılan "sor"dur: sınıflandırıcı emin değilse sorar, geçirmez.
 * `apply_migration` / `deploy_edge_function` araçları da her zaman `ask` (S5: eski adlarla yazılmış
 * ask kuralları bugünkü araç adlarını tutmuyordu).
 *
 * Okuma sayılan: her deyim SELECT / WITH / SHOW / EXPLAIN (ANALYZE'sız) / VALUES / TABLE ile başlar VE
 * yorum ve metin sabitleri atıldıktan sonra hiçbir yazma sözcüğü geçmez (WITH içinde DELETE, SELECT
 * INTO, nextval/setval, set_config, pg_terminate_backend …).
 *
 * ── FONKSİYON ÇAĞRISI ──
 *
 * `SELECT admin_publish_quote(...)` metin olarak okumaya benzer ama yazar. Ayırt etme yolu depodaki
 * migration'lar: projenin kendi fonksiyonları oradan toplanır, son tanımı STABLE/IMMUTABLE olmayan
 * (VOLATILE) fonksiyona çağrı `ask` olur. Postgres STABLE/IMMUTABLE fonksiyonda yazmayı çalışma anında
 * reddeder, yani bu ölçüt beyan değil motorun kuralıdır. Yerleşik fonksiyonlardan yazanlar
 * (nextval, set_config, pg_terminate_backend …) yazma sözcükleri listesinde.
 *
 * İlk sürüm "yerleşik olmayan her çağrı → sor" idi; 2.024 gerçek sorguda (bu makinedeki tüm kayıtlar)
 * takma ad `e(k,v)`, CTE adı `v(...)`, `btrim(`, `pg_get_function_identity_arguments(` gibi okumaları
 * da soruyordu. Migration'dan okunan liste bu yanlış alarmları kaldırır.
 *
 * ── RLS DENEMESİ ──
 *
 * `BEGIN; SET LOCAL ROLE authenticated; SET LOCAL request.jwt.claims …; SELECT …; ROLLBACK;` ölçüm
 * kalıbıdır (51 sorgu). BEGIN / ROLLBACK ve yalnız rol/istek/zaman aşımı/arama yolu SET'leri okumayı
 * bozmaz; COMMIT ve diğer SET'ler bozar sayılır.
 */
const fs = require('fs')
const path = require('path')

const OKUMA_BASLARI = /^(select|with|show|explain|values|table)\b/
const ZARARSIZ_DEYIM =
  /^(begin|start\s+transaction|rollback|set\s+(local\s+)?(role|request\.[a-z_.]+|statement_timeout|search_path)\b|reset\s+role)\b/
const YAZMA_SOZCUKLERI =
  /\b(insert|update|delete|merge|upsert|create|alter|drop|truncate|grant|revoke|comment\s+on|copy|vacuum|reindex|cluster|refresh\s+materialized|call|do|lock|security\s+label|import\s+foreign|listen|notify|pg_notify|prepare|execute|discard|nextval|setval|set_config|pg_terminate_backend|pg_cancel_backend|pg_reload_conf|pg_advisory_lock|pg_advisory_xact_lock|lo_import|lo_export|lo_unlink|dblink\w*|into|analyze|commit)\b/

let _fonksiyonlar = null
/** Migration'lardan { ad → volatile mi } — son tanım kazanır. */
function projeFonksiyonlari(kok = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  if (_fonksiyonlar && _fonksiyonlar.kok === kok) return _fonksiyonlar.harita
  const harita = new Map()
  const dizin = path.join(kok, 'supabase', 'migrations')
  let dosyalar = []
  try {
    dosyalar = fs.readdirSync(dizin).filter((f) => f.endsWith('.sql')).sort()
  } catch {
    // migration dizini yok → harita boş; kullanıcı fonksiyonu tanınmaz (aşağıda ele alınır)
  }
  for (const f of dosyalar) {
    const metin = fs.readFileSync(path.join(dizin, f), 'utf8')
    const parcalar = metin.split(/create\s+(?:or\s+replace\s+)?function\s+/i).slice(1)
    for (const p of parcalar) {
      const m = p.match(/^\s*(?:"?public"?\s*\.\s*)?"?([A-Za-z_][A-Za-z0-9_]*)"?/)
      if (!m) continue
      const govdesiz = p.replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, ' ').split(/;\s*(?:\n|$)/)[0]
      harita.set(m[1].toLowerCase(), !/\b(stable|immutable)\b/i.test(govdesiz))
    }
  }
  _fonksiyonlar = { kok, harita }
  return harita
}

/** Yorumları ve metin sabitlerini atar; dolar-tırnaklı gövdeler de metin sayılır. */
function temizle(sql) {
  return String(sql)
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, " 'x' ")
    .replace(/'(?:[^']|'')*'/g, " 'x' ")
    .replace(/"(?:[^"]|"")*"/g, ' q ')
    .toLowerCase()
}

/** Yorumları ve metin sabitlerini atar; dolar-tırnaklı gövdeler de metin sayılır. */
function temizle(sql) {
  return String(sql)
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, " 'x' ")
    .replace(/'(?:[^']|'')*'/g, " 'x' ")
    .replace(/"(?:[^"]|"")*"/g, ' q ')
    .toLowerCase()
}

/** { okuma: true } ya da { okuma: false, sebep } */
function siniflandir(sql, fonksiyonlar = projeFonksiyonlari()) {
  // RLS denemesindeki işlem-yerel kimlik ayarı (17 sorgu): yalnız request.* ve role, üçüncü argüman
  // true (işlem-yerel) iken zararsız. Metin sabitleri temizlenmeden ÖNCE bakılmalı.
  const hazir = String(sql).replace(
    /set_config\s*\(\s*'(?:request\.[a-z_.]+|role)'\s*,\s*(?:'(?:[^']|'')*'|[^,()]+)\s*,\s*true\s*\)/gi,
    'yerel_kimlik()',
  )
  const t = temizle(hazir)
  const deyimler = t
    .split(';')
    .map((s) => s.trim())
    // EXPLAIN ANALYZE sorguyu ÇALIŞTIRIR; altındaki sorgu okumaysa okumadır, değilse aşağıda yakalanır.
    .map((s) => s.replace(/^explain\s*(\([^)]*\)|analyze\b(\s+verbose\b)?)\s*/, ''))
    .filter(Boolean)
  if (!deyimler.some((d) => OKUMA_BASLARI.test(d))) return { okuma: false, sebep: 'okuma deyimi yok' }
  // Liste okunamadıysa proje fonksiyonları tanınamaz → güvenli yön: sor.
  if (!fonksiyonlar.size) return { okuma: false, sebep: 'migration listesi okunamadi, fonksiyonlar dogrulanamiyor' }
  for (const d of deyimler) {
    if (ZARARSIZ_DEYIM.test(d)) continue
    if (!OKUMA_BASLARI.test(d)) return { okuma: false, sebep: 'okuma ile baslamayan deyim: ' + d.split(/\s+/)[0] }
    const y = d.match(YAZMA_SOZCUKLERI)
    if (y) return { okuma: false, sebep: 'yazma sozcugu: ' + y[1] }
    for (const m of d.matchAll(/(?:([a-z_][a-z0-9_]*)\s*\.\s*)?([a-z_][a-z0-9_]*)\s*\(/g)) {
      const sema = m[1]
      const ad = m[2]
      if (sema && sema !== 'public') continue // pg_catalog / auth / extensions — yazanlar yazma listesinde
      if (fonksiyonlar.get(ad) === true) return { okuma: false, sebep: 'VOLATILE proje fonksiyonu: ' + ad }
      if (sema === 'public' && !fonksiyonlar.has(ad)) return { okuma: false, sebep: 'migration\'da bulunmayan public fonksiyon: ' + ad }
    }
  }
  return { okuma: true }
}

const HEP_SOR = /(apply_migration|deploy_edge_function|merge_branch|reset_branch|delete_branch|pause_project|restore_project)$/

function karar(girdi) {
  const arac = String(girdi.tool_name || '')
  if (HEP_SOR.test(arac)) return { karar: 'ask', sebep: arac.split('__').pop() + ' canli veritabanini/sistemi degistirir' }
  if (!/execute_sql$/.test(arac)) return null
  const sql = (girdi.tool_input || {}).query || ''
  const s = siniflandir(sql)
  return s.okuma ? null : { karar: 'ask', sebep: 'Canli veritabanina YAZMA olabilir (' + s.sebep + ')' }
}

/**
 * Onay sorusunun metni. Recep SQL okumaz (Ops 09-28): önce ETKİ (tablo · işlem · satır sayısı, bkz.
 * sql-etki.cjs), sonra kapının teknik sebebi. Etki özeti çıkarılamazsa yalnız sebep gösterilir —
 * özet hatası soruyu asla engellemez.
 */
async function soruMetni(girdi, k) {
  const teknik = '[sql-yazma-kapisi] ' + k.sebep + ' (REC-410 S1)'
  if (!/execute_sql$/.test(String(girdi.tool_name || ''))) return 'CANLI SİSTEMDE DEĞİŞİKLİK: ' + k.sebep + '\n' + teknik
  try {
    const giris = girdi.tool_input || {}
    const etki = await require(path.join(__dirname, 'sql-etki.cjs')).ozet(giris.query || '', giris.project_id)
    return etki ? etki + '\n' + teknik : teknik
  } catch (e) {
    return teknik + '\n(etki özeti çıkarılamadı: ' + ((e && e.message) || 'bilinmeyen').slice(0, 80) + ')'
  }
}

async function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(require('fs').readFileSync(0, 'utf8') || '{}')
  } catch {
    // Girdi okunamadıysa karar veremeyiz: SOR (varsayılan güvenli yön).
    girdi = { tool_name: 'execute_sql', tool_input: { query: '' } }
  }
  const k = karar(girdi)
  if (!k) process.exit(0)
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: k.karar,
        permissionDecisionReason: await soruMetni(girdi, k),
      },
    }),
  )
  process.exit(0)
}

module.exports = { siniflandir, karar, temizle, projeFonksiyonlari, soruMetni }
if (require.main === module) main()
