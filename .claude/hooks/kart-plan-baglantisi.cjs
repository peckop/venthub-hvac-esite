#!/usr/bin/env node
'use strict'
/**
 * KART PLAN BAĞLANTISI — ARC-216 B kolu (HRT-74 B; OPS UYGUN 27 Ekim: "bugünkü kapıyı olduğu gibi bağlama").
 * PreToolUse, matcher `mcp__wrongstack-kanban__kanban_manage`.
 *
 * NİÇİN: `scripts/belge/kart-plan-kapisi.cjs` kart planının iskeletini (yedi etiket + ÖNCEKİ ÇALIŞMA) ölçer ama yalnız elle koşuyordu;
 * kartı açarken ya da Review'a geçerken onu çağıran bağ yoktu (cetvel docs/standards/kart-plani-standard.md "Kontrol").
 *
 * ⛔GÜRÜLTÜ SINIRI (ÖLÇÜLDÜ 27 Ekim): son 8 günde açılan 55 kartın HİÇBİRİNDE "PLAN" başlığı yok (filonun kart biçimi KAYNAK/YÖNTEM/
 * ÖNCEKİ ÇALIŞMA satırlarıdır). Kapıyı her karta uygulamak her Review geçişinde "plan-yok" uyarısı demekti; ARC-220'nin kaldırdığı
 * gürültünün aynısı. Bu yüzden bağ YALNIZ kartın açıklamasında PLAN başlığı VARKEN iskeleti ölçer; başlık yoksa SESSİZ kalır.
 * Kart sınıfına göre zorunlu ölçüm satırı (yayın öncesi liste, canlı adres matrisi, kare kabul...) HARİTA kural verisini verince eklenir.
 *
 * NE YAPAR: (1) `add_task` açıklamasında, (2) bir kartı Review'a taşıyan `move_task`/`transition_task`/`update_task`ta kartın
 * kayıtlı açıklamasında PLAN başlığı varsa `degerlendir` çalıştırır; iskelet eksikse eksikleri additionalContext olarak UYARIR.
 * NE YAPMAZ: reddetmez (çıkış hep 0), Kanban'a yazmaz, ağa gitmez. Veritabanı/kart okunamazsa ya da modül yüklenemezse sessiz (fail-open).
 *
 * VANA: `VENTHUB_KART_PLAN_BAGI_KAPALI=1` kapatır. `VENTHUB_KANBAN_DB` veritabanı yolunu ezer (test).
 * KURULUM: `.claude/settings.json` PreToolUse kaydı (ayarı OPS tam fark okuyarak birleştirir).
 *
 * stdin: { tool_name, tool_input: { action, taskId, description, columnId|targetColumnId|lifecycleStage|status } }
 */
const fs = require('node:fs')
const path = require('node:path')

const ARAC = 'mcp__wrongstack-kanban__kanban_manage'
const REVIEW_EYLEMLERI = new Set(['move_task', 'transition_task', 'update_task'])
const VANA = 'VENTHUB_KART_PLAN_BAGI_KAPALI'
const AZAMI_SATIR = 6

/** Bu çağrı kartı Review'a taşıyor mu? SAF. */
function reviewIstegiMi(t) {
  if (!t || !REVIEW_EYLEMLERI.has(t.action) || typeof t.taskId !== 'string' || t.taskId === '') return false
  return [t.columnId, t.targetColumnId, t.lifecycleStage, t.status].some((v) => typeof v === 'string' && v.trim().toLowerCase() === 'review')
}

/**
 * Açıklama → uyarı satırları. SAF. PLAN başlığı yoksa ([] = sessiz) ya da iskelet tamamsa [].
 * @param {string} aciklama
 * @param {string} ad kart numarası/başlığı (mesajda gösterilir)
 * @param {{degerlendir: Function, oncekiKipi: Function}} kapi kart-plan-kapisi.cjs
 * @param {string} [olusturuldu] kartın createdAt'i (yürürlükten önceki kartta ÖNCEKİ ÇALIŞMA eksiği yalnız uyarı sayılır)
 */
function satirlar(aciklama, ad, kapi, olusturuldu) {
  if (typeof aciklama !== 'string' || aciklama.trim() === '') return []
  const s = kapi.degerlendir(aciklama, { onceki: kapi.oncekiKipi(olusturuldu) })
  if (s.tur !== 'plan' || s.gecti) return []
  const eksik = s.eksikler.slice(0, AZAMI_SATIR).map((e) => `  - ${e}`)
  const fazla = s.eksikler.length > AZAMI_SATIR ? [`  - … ve ${s.eksikler.length - AZAMI_SATIR} eksik daha`] : []
  return [
    `KART PLANI UYARI (ARC-216 B; ${ad}): açıklamada PLAN başlığı var ama iskelet eksik (cetvel kart-plani-standard.md, kapı: node scripts/belge/kart-plan-kapisi.cjs --kart <NO>):`,
    ...eksik,
    ...fazla,
  ]
}

/** Veritabanı yolu: ortam ezmesi, yoksa kanonik (ana ağaç) kök (done-kanit-kapisi.cjs ile aynı çözümleme). */
function veritabaniYolu(ortam = process.env, cwd = process.cwd()) {
  return require('./done-kanit-kapisi.cjs').veritabaniYolu(ortam, cwd)
}

/** Kartın başlığı, açıklaması ve açılış zamanı; her sorunda null (fail-open). SALT-OKUMA. */
function kartiOku(dbYolu, taskId) {
  let db
  try {
    if (!fs.existsSync(dbYolu)) return null
    process.removeAllListeners('warning')
    const { DatabaseSync } = require('node:sqlite')
    db = new DatabaseSync(dbYolu, { readOnly: true })
    const satir = db
      .prepare(
        "select json_extract(t.value,'$.title') as baslik, json_extract(t.value,'$.description') as aciklama, json_extract(t.value,'$.createdAt') as olusturuldu " +
          "from kanban_boards b, json_each(b.payload, '$.tasks') t where json_extract(t.value,'$.id') = ? limit 1",
      )
      .get(taskId)
    return satir ? { baslik: String(satir.baslik || ''), aciklama: String(satir.aciklama || ''), olusturuldu: satir.olusturuldu || undefined } : null
  } catch {
    return null
  } finally {
    try {
      db && db.close()
    } catch {
      /* kapanış hatası önemsiz */
    }
  }
}

/** Kısa ad: başlığın ilk sözcüğü (ARC-216 …), yoksa taskId. */
function kisaAd(baslik, taskId) {
  const m = /^\s*([A-Z0-9]{2,5}-\d+)/.exec(String(baslik || ''))
  return m ? m[1] : String(taskId || 'kart')
}

function main() {
  if (process.env[VANA] === '1') return
  let girdi
  try {
    girdi = JSON.parse(fs.readFileSync(0, 'utf8'))
  } catch {
    return
  }
  if (!girdi || girdi.tool_name !== ARAC) return
  const t = girdi.tool_input || {}
  let aciklama = null
  let ad = ''
  let olusturuldu
  if (t.action === 'add_task') {
    aciklama = t.description
    ad = kisaAd(t.title, 'yeni kart')
  } else if (reviewIstegiMi(t)) {
    const k = kartiOku(veritabaniYolu(), t.taskId)
    if (!k) return
    aciklama = k.aciklama
    ad = kisaAd(k.baslik, t.taskId)
    olusturuldu = k.olusturuldu
  } else {
    return
  }
  const kapi = require(path.join(__dirname, '..', '..', 'scripts', 'belge', 'kart-plan-kapisi.cjs'))
  const satir = satirlar(aciklama, ad, kapi, olusturuldu)
  if (satir.length === 0) return
  fs.writeSync(1, JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: satir.join('\n') } }) + '\n')
}

if (require.main === module) {
  try {
    main()
  } catch {
    /* kanca asla araç akışını bozmaz */
  }
  process.exit(0)
}

module.exports = { reviewIstegiMi, satirlar, kartiOku, kisaAd, veritabaniYolu }
