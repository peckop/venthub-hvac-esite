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
 * Kart sınıfına göre zorunlu ÖLÇÜM satırı (ARC-230, HRT-78 kural verisi #2115): `olcum-<ad>` etiketi ya da dar başlık sözcüğüyle tanınan sınıfta
 * satır yoksa uyarır; PLAN başlığı İSTEMEZ, tanınan sınıf yoksa sessiz.
 *
 * NE YAPAR: (1) `add_task` açıklamasında, (2) bir kartı Review'a taşıyan `move_task`/`transition_task`/`update_task`ta kartın
 * kayıtlı açıklamasında PLAN başlığı varsa `degerlendir` çalıştırır; iskelet eksikse eksikleri additionalContext olarak UYARIR.
 * NE YAPMAZ: Kanban'a yazmaz, ağa gitmez; çıkış hep 0. Veritabanı/kart okunamazsa ya da modül yüklenemezse sessiz (fail-open).
 * REDDEDER YALNIZ (ARC-300, OPS 13 Kasım): `add_task`ta ÖNCEKİ ÇALIŞMA satırı yer tutucu ("ARANACAK") ya da ifadesiz çıplak "yok" ise
 * (permissionDecision deny, vana kapatır); Review geçişinde aynı kusur yalnız uyarı. Başka her durumda reddetmez.
 *
 * VANA: `VENTHUB_KART_PLAN_BAGI_KAPALI=1` kapatır. `VENTHUB_KANBAN_DB` veritabanı yolunu ezer (test).
 * KURULUM: `.claude/settings.json` PreToolUse kaydı (ayarı OPS tam fark okuyarak birleştirir).
 *
 * stdin: { tool_name, tool_input: { action, taskId, description, labels, columnId|targetColumnId|lifecycleStage|status } }
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

/**
 * Kart sınıfı ölçüm satırı (HRT-78, ARC-230): `olcum-<ad>` etiketi ya da dar başlık sözcüğüyle tanınan sınıfta `ÖLÇÜM: <ad> — <sonuç>`
 * satırı yoksa uyarır. PLAN başlığı İSTEMEZ; tanınan sınıf yoksa [] (sessiz). SAF.
 */
function olcumSatirlari(kart, ad, kapi) {
  let eksik
  try {
    eksik = typeof kapi.olcumEksikleri === 'function' ? kapi.olcumEksikleri(kart) : []
  } catch {
    return []
  }
  if (!Array.isArray(eksik) || eksik.length === 0) return []
  return [`KART ÖLÇÜM UYARI (ARC-230; ${ad}): kart sınıfı için zorunlu ölçüm satırı eksik (kural verisi scripts/belge/kart-sinif-olcum.json):`, ...eksik.slice(0, AZAMI_SATIR).map((e) => `  - ${e}`)]
}

/**
 * ÖNCEKİ ÇALIŞMA satırının İKİ açık kusuru (ARC-300; OPS 13 Kasım): yer tutucu ("ARANACAK") ve ifadesiz çıplak "yok".
 * ÖLÇÜLDÜ 13 Kasım: son 30 günde açılan 758 kartın yalnız 1'i kapının tam kuralını (beş yer + "ifade:" + sonuç) geçiyor, 559'u eksik,
 * 184'ünde satır yok; tam kuralı engel yapmak her karta tıkardı. Bu yüzden KIRMIZI yalnız şu ikisidir (30 günde 21 kart):
 *   - yer tutucu: değer kısa (<120) ve ARANACAK / DOLDURULACAK / TBD / TODO / "işe başlarken" içerir (arama yapılmamış, sonra yapılacak);
 *   - ifadesiz çıplak yok: değerde "yok" var, ama kart/commit/dosya bulgusu da "ifade:" arama ifadesi de yok, değer kısa (<140).
 * Satır HİÇ yoksa ya da başka eksikse SESSİZ kalır (ARC-220 gürültü sınırı). SAF; sebep dizgesi ya da null döner.
 */
const ONCEKI_ETIKET = /(^|\n)[ \t#>*_-]*[Öö][Nn][Cc][Ee][Kk][iİıI][ \t]+[Çç][Aa][Ll][iİıI][Şş][Mm][Aa][ \t]*:[ \t]*([\s\S]*?)(?=\n[ \t#>*_-]*(?![İIiı][Ff][Aa][Dd][Ee])[A-ZÇĞİÖŞÜ][A-ZÇĞİÖŞÜ0-9 /_.()-]{2,40}[ \t]*:|\n\s*PLAN\b|$)/
const YER_TUTUCU = /aranacak|doldurulacak|\btbd\b|\btodo\b|işe başlarken/i
const YOK_KELIMESI = /(^|[^\p{L}])yok(tur)?([^\p{L}]|$)/iu
// ARC-300 (d): "aranmadı" tek başına arama kanıtı değildir (ifadesiz "yok" gibi). Katlı metinde aranır.
const ARANMADI = /aranmad[ıi]|aramad[ıi]m?/i
const BULGU = /\b[a-z]{2,5}-\d+\b|\b(docs|scripts|src|supabase)\/[\w./-]+|\b[0-9a-f]{7,40}\b/i
/** JS /i "İFADE:" yazımını "ifade" ile eşleştirmez; kapı (kart-plan-kapisi.cjs asciiKatla) ile aynı katlama. */
function katla(metin) {
  return String(metin)
    .replace(/İ/g, 'i')
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c])
}
function oncekiKirmizi(aciklama) {
  if (typeof aciklama !== 'string') return null
  const m = ONCEKI_ETIKET.exec(aciklama)
  if (!m) return null
  const deger = m[2].trim()
  const katli = katla(deger)
  if (deger.length < 120 && YER_TUTUCU.test(deger)) {
    return `ÖNCEKİ ÇALIŞMA satırı yer tutucu ("${deger.slice(0, 40)}"): arama yapılmadan kart açılamaz. Önce beş yeri ara (Kanban search_tasks, git log, docs/plans ve docs/audits, sage, Linear arşivi), satıra yer adlarını, "ifade: <aranan sözcükler>" ve bulguyu ya da "yok"u yaz.`
  }
  if (deger.length < 140 && (YOK_KELIMESI.test(deger) || ARANMADI.test(katli)) && !BULGU.test(deger) && !/ifade(si)?[ \t]*:/.test(katli)) {
    return `ÖNCEKİ ÇALIŞMA satırı ifadesiz "yok" ("${deger.slice(0, 40)}"): hangi sözcüklerle arandığı yazılmayan "yok" kanıt değildir. Satıra "ifade: <aranan sözcükler>" ekle ve aranan yerleri say (örnek: "Kanban search_tasks, git log, docs/plans, docs/audits, sage, Linear arandı; ifade: kart plan kapısı; sonuç: ARC-25").`
  }
  return null
}

/** Veritabanı yolu: ortam ezmesi, yoksa kanonik (ana ağaç) kök (done-kanit-kapisi.cjs ile aynı çözümleme). */
function veritabaniYolu(ortam = process.env, cwd = process.cwd()) {
  return require('./done-kanit-kapisi.cjs').veritabaniYolu(ortam, cwd)
}

/** sqlite json_extract çıktısı (JSON metni) → etiket dizisi; bozuksa []. */
function etiketCoz(ham) {
  try {
    const a = JSON.parse(String(ham || '[]'))
    return Array.isArray(a) ? a.map(String) : []
  } catch {
    return []
  }
}

/** Kartın başlığı, açıklaması, açılış zamanı ve etiketleri; her sorunda null (fail-open). SALT-OKUMA. */
function kartiOku(dbYolu, taskId) {
  let db
  try {
    if (!fs.existsSync(dbYolu)) return null
    process.removeAllListeners('warning')
    const { DatabaseSync } = require('node:sqlite')
    db = new DatabaseSync(dbYolu, { readOnly: true })
    const satir = db
      .prepare(
        "select json_extract(t.value,'$.title') as baslik, json_extract(t.value,'$.description') as aciklama, json_extract(t.value,'$.createdAt') as olusturuldu, json_extract(t.value,'$.labels') as etiketler " +
          "from kanban_boards b, json_each(b.payload, '$.tasks') t where json_extract(t.value,'$.id') = ? limit 1",
      )
      .get(taskId)
    return satir ? { baslik: String(satir.baslik || ''), aciklama: String(satir.aciklama || ''), olusturuldu: satir.olusturuldu || undefined, etiketler: etiketCoz(satir.etiketler) } : null
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
  let baslik = ''
  let etiketler = []
  let acilisMi = false
  if (t.action === 'add_task') {
    acilisMi = true
    aciklama = t.description
    baslik = String(t.title || '')
    etiketler = Array.isArray(t.labels) ? t.labels.map(String) : []
    ad = kisaAd(t.title, 'yeni kart')
  } else if (reviewIstegiMi(t)) {
    const k = kartiOku(veritabaniYolu(), t.taskId)
    if (!k) return
    aciklama = k.aciklama
    baslik = k.baslik
    etiketler = k.etiketler
    ad = kisaAd(k.baslik, t.taskId)
    olusturuldu = k.olusturuldu
  } else {
    return
  }
  const kapi = require(path.join(__dirname, '..', '..', 'scripts', 'belge', 'kart-plan-kapisi.cjs'))
  // ARC-300: yer tutucu / ifadesiz çıplak yok. Açılışta (add_task) KIRMIZI = reddeder; Review geçişinde yalnız uyarır (kart zaten açık, teslimi tıkamayız).
  const kirmizi = oncekiKirmizi(aciklama)
  if (kirmizi && acilisMi) {
    fs.writeSync(
      1,
      JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: `KART AÇILMADI (ARC-300; ${ad}): ${kirmizi} Vana: ${VANA}=1.` } }) + '\n',
    )
    return
  }
  const satir = [
    ...(kirmizi ? [`KART ÖNCEKİ ÇALIŞMA UYARI (ARC-300; ${ad}): ${kirmizi}`] : []),
    ...satirlar(aciklama, ad, kapi, olusturuldu),
    ...olcumSatirlari({ baslik, aciklama: String(aciklama || ''), etiketler }, ad, kapi),
  ]
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

module.exports = { reviewIstegiMi, oncekiKirmizi, satirlar, olcumSatirlari, etiketCoz, kartiOku, kisaAd, veritabaniYolu }
