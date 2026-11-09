'use strict'

/**
 * GEÇİŞ KONUSU YÖNLENDİRMESİ (ARC-290, OPS emri).
 *
 * NİÇİN: 9 Kasım'da OPS, 6 Kasım yol haritasını görmeden yeni araştırma başlattı (Recep düzeltmesi). Canlıya geçiş / yeni site
 * konusu tek süreçtir ve kararları tek yerde durur; her seferinde yeniden araştırma aynı işi ikinci kez yaptırır.
 *
 * NE: yalnız OPS penceresi için, (1) Recep'in istemi geçiş konusuna girince bağlam satırı, (2) OPS aynı konuda Agent açmaya ya da
 * Kanban kartı açmaya kalkınca aynı satır UYARI olarak. Bloklamaz, ağa gitmez, dosya yazmaz, fail-open; vana
 * VENTHUB_GECIS_KONUSU_KAPAT=1. Kancalar: hafiza-sorusu-yonlendirme (istem), olcum-satiri-uyarisi (Agent), onceki-calisma-kapisi (kart).
 *
 * Kalıplar KASITLI dar: kanca her istemde koşar; "geçiş" tek başına (veri geçişi, auth geçişi) YOK, yalnız site bağlamıyla.
 */

const fs = require('node:fs')
const path = require('node:path')

const KOK = path.resolve(__dirname, '..', '..')
const DEFTER = 'docs/defter/yeni-site-gecis.md'
const PLAN = 'docs/plans/yeni-site-gecis-tek-resim-2026-11-01.md'

/** `(?<!\p{L})` = kelime başı (JS \b Türkçe harfi kelime saymaz). */
// Denetçi (ARC-290): "canlıya çıktı mı", "canlıya geçmeden migration", "veri geçiş planı" günlük deploy/migration cümleleridir → YOK.
// Her kalıp kelime başında başlar; "geçiş" yalnız site/canlı bağlamıyla.
const GECIS_RE = new RegExp(
  '(?<!\\p{L})(?:' +
    [
      'yeni\\s+site',
      'canl[ıi]ya\\s+ge[çc]i[şs]',
      'canl[ıi]ya\\s+[çc][ıi]k[ıi][şs]',
      '(?:canl[ıi]|site)\\s+ge[çc]i[şs]',
      'siteye\\s+ge[çc]i[şs]',
      '(?:site|canl[ıi])\\s+ge[çc]i[şs]\\p{L}*\\s+(?:plan|konu|s[üu]re[çc])',
      'ge[çc]i[şs]\\s+tek\\s+resim',
      'eski\\s*(?:→|->|-|\\s)\\s*yeni\\s+adres',
      'adres\\s+e[şs]le[şs]tirme',
      // Veri aktarımı (ARC-291 eki, Recep): UnoPIM tek başına yeter; öteki kalıplar "aktar" ile birlikte (gündelik "görsel", "resim" tek başına YOK).
      'unopim',
      'veri\\s+aktar\\p{L}*',
      '(?:teknik\\s+(?:[öo]zellik|de[ğg]er)\\p{L}*|g[öo]rsel\\p{L}*|resim\\p{L}*|[üu]r[üu]n\\s+veri\\p{L}*|fiyat(?:\\s*/\\s*|\\s+ve\\s+|\\s+)kdv)\\s+aktar\\p{L}*',
    ].join('|') +
    ')',
  'iu',
)

/** Pencere OPS mu? (kancaya gelen agent_type ya da cwd'nin settings.local.json'ı). */
function opsMu(girdi, kok = KOK) {
  try {
    const k = require(path.join(kok, 'scripts', 'board', 'pencere-kimligi.cjs'))
    return k.rolAdi(k.agentAdi({ cwd: girdi && girdi.cwd, agentType: girdi && girdi.agent_type })) === 'OPS'
  } catch {
    return false
  }
}

function gecisMi(metin) {
  return typeof metin === 'string' && metin.length > 0 && GECIS_RE.test(metin)
}

/** Tek satır, ≤ 420 karakter. Defter henüz yoksa (HARİTA açıyor) tek-resim planına işaret eder. */
function satir(kok = KOK) {
  let defter = DEFTER
  try {
    if (!fs.existsSync(path.join(kok, DEFTER))) defter = `${DEFTER} (henüz yok; o zamana kadar ${PLAN} ve OPS-180 notu)`
  } catch {
    // varlık sorulamadı: asıl yol yazılır
  }
  return (
    `GEÇİŞ KONUSU: Geçiş tek süreçtir — önce ${defter} oku; yeni araştırma/kart açma, deftere bak; ` +
    'adres → urun-adres, dizin → geo-seo-dizin, veri aktarımı (UnoPIM) → yeni-site-gecis §2 (ana kart OPS-180).'
  )
}

/**
 * Uyarı gerekiyorsa satır, yoksa null.
 * @param {string} metin taranacak metin (istem, Agent görev metni, kart başlığı+açıklaması)
 * @param {object} girdi kanca stdin'i (cwd, agent_type)
 */
function uyari(metin, girdi, kok = KOK) {
  if (process.env.VENTHUB_GECIS_KONUSU_KAPAT === '1') return null
  if (!gecisMi(metin) || !opsMu(girdi, kok)) return null
  return satir(kok)
}

/** ARC-291: başlığında geçiş/yeni site/adres/308/dizin geçen kart `defter:<ad>` etiketi olmadan açılırsa açana uyarı (her rol, blok değil). */
const ETIKETSIZ_RE = /(?<!\p{L})(?:yeni\s+site|site\s+ge[çc]i[şs]|canl[ıi]ya\s+ge[çc]i[şs]|(?:eski\s+)?adres\s+(?:e[şs]le[şs]tir|tablo|[şs]ema|plan|listesi)|308|dizin\s+(?:iste[ğg]i|defter|kontrol)|y[öo]nlendirme\s+(?:tablo|plan|kural))/iu

function etiketsizUyari(girdi) {
  if (process.env.VENTHUB_GECIS_KONUSU_KAPAT === '1') return null
  const ti = girdi || {}
  if (ti.action !== 'add_task' || !ETIKETSIZ_RE.test(String(ti.title || ''))) return null
  const etiketler = Array.isArray(ti.labels) ? ti.labels : []
  if (etiketler.some((e) => typeof e === 'string' && /^defter:[a-z0-9-]+$/.test(e.toLowerCase()))) return null
  return (
    'DEFTER ETİKETİ YOK: başlık geçiş/adres/dizin konusunda ama kartta defter:<ad> etiketi yok. ' +
    'labels\'a defter:yeni-site-gecis, defter:urun-adres ya da defter:geo-seo-dizin ekle ki defter bu kartı Kanban\'dan üretsin (engel yok).'
  )
}

module.exports = { gecisMi, opsMu, satir, uyari, etiketsizUyari, GECIS_RE, ETIKETSIZ_RE, DEFTER }
