/**
 * SAGE ENJEKSİYON DEFTERİ — "bağlama hangi ders basıldı" sorusunun tek cevabı (REC-519).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * Sage'in `injectionCount` / `useCount` sayaçları yalnız WrongStack ajanının kendi ara
 * katmanlarından yazılıyordu; Claude Code'da o katman YOK ve sayaçlar bu depoda hiç
 * yazılmadı (ölçüm 2026-09-30: 163 aktif kayıtta ikisi de boş). Sayaç yoksa sage'in hijyeni
 * "hiç kullanılmadı" ayrımını yapamaz. Sayaç için önce "hangi ders, hangi oturumda,
 * gerçekten bağlama basıldı mı" bilinmeli — bu dosya o kaydı tutar.
 *
 * ⛔İKİ KANCA YAZAR, BİR KANCA OKUR: konu kancası (`hafiza-enjeksiyonu.cjs`) ve dosya dersi
 * kancası (`sage-dosya-dersi.cjs`) BASTIKLARI derslerin ID'sini buraya ekler; Stop kancası
 * (`hafiza-kullanim-sayaci.cjs`) okur, sage'e sayaç yazar ve işaretler.
 *
 * ── BİÇİM ──
 * Dosya: `.sage-enjekte-<oturum24>-<nesil>.jsonl` (PANO dizini; işaret dosyası deseniyle aynı
 * anahtar: oturumun ilk 24 karakteri + compact nesli). Nesil `sage-dosya-dersi.cjs`in
 * `.sage-dersi-nesil-<oturum24>` dosyasından okunur; compact/clear dönüşünde artar.
 *   ders satırı : {n, id, metin(ilk 200 kr), kaynak:'konu'|'dosya', t}
 *   işaret satırı: {n, sayildi:true} | {n, kullanildi:true}   (n = ders satırının anahtarı)
 *
 * ⭐YALNIZ EKLEME (append-only): işaret, satırı yeniden yazmak yerine yeni satır olarak
 * eklenir. Sebep: PreToolUse (dosya dersi) ile Stop (sayaç, async) AYNI dosyaya eşzamanlı
 * dokunabilir; "oku-değiştir-yaz" son yazanın öncekini ezmesi demektir (bu depoda MEMORY.md
 * için ölçülmüş kusur sınıfı). Küçük `appendFileSync` satırı yarışta kaybolmaz.
 *
 * Bu modül SADECE `fs` ve `path` kullanır: dosya dersi kancasının (her araç çağrısında koşan
 * sıcak yol) içinden çağrılır, ağır bir şey yüklememeli.
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §8.
 */
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

/** Deftere yazılan ders metni bu kadar karaktere indirilir (eşleştirme yalnız başlangıca bakar). */
const METIN_KARAKTER = 200
/** Tek dosyadan okunacak en çok satır — sınırsız büyüyen bir oturumda okuma bütçeyi yemesin. */
const OKUMA_SATIR_TAVANI = 5000

/** PANO dizini `sage-dosya-dersi.cjs` ile aynı çözümlenir (ortam değişkeni → varsayılan). */
function panoDizini() {
  return process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'
}

const oturumKisa = (oturum) => String(oturum || 'oturumsuz').slice(0, 24)

/** Oturumun şimdiki nesli (compact/clear artırır). Okunamazsa 0. */
function nesil(oturum, pano = panoDizini()) {
  try {
    const n = Number(fs.readFileSync(path.join(pano, `.sage-dersi-nesil-${oturumKisa(oturum)}`), 'utf8').trim())
    return Number.isFinite(n) ? n : 0
  } catch {
    return 0
  }
}

function defterYolu(oturum, nesilNo, pano = panoDizini()) {
  return path.join(pano, `.sage-enjekte-${oturumKisa(oturum)}-${nesilNo}.jsonl`)
}

/**
 * Basılan dersleri deftere ekler. Yazamazsa FIRLATMAZ, `false` döner: defter bir ölçüm
 * yüzeyidir, ders basmayı engellememeli.
 * @param {string} oturum
 * @param {{id:string, metin:string, kaynak:'konu'|'dosya'}[]} kayitlar
 * @returns {boolean}
 */
function yaz(oturum, kayitlar, { pano = panoDizini(), simdi = Date.now() } = {}) {
  try {
    const liste = (kayitlar || []).filter((k) => k && typeof k.id === 'string' && k.id)
    if (!liste.length) return true
    const t = new Date(simdi).toISOString()
    const govde = liste
      .map((k) =>
        JSON.stringify({
          n: `${simdi}-${crypto.randomBytes(4).toString('hex')}`,
          id: k.id,
          metin: String(k.metin || '').slice(0, METIN_KARAKTER),
          kaynak: k.kaynak === 'dosya' ? 'dosya' : 'konu',
          t,
        }),
      )
      .join('\n')
    fs.mkdirSync(pano, { recursive: true })
    fs.appendFileSync(defterYolu(oturum, nesil(oturum, pano), pano), govde + '\n', 'utf8')
    return true
  } catch {
    return false
  }
}

/**
 * Oturumun BÜTÜN nesillerindeki ders satırlarını, işaretleriyle birleştirilmiş olarak okur.
 * Dosya yoksa boş liste — "defter yok" hata değildir.
 * @returns {{satirlar: {n:string,id:string,metin:string,kaynak:string,t:string,sayildi:boolean,kullanildi:boolean,nesil:number,dosya:string}[], guncelNesil:number}}
 */
function oku(oturum, { pano = panoDizini() } = {}) {
  const guncelNesil = nesil(oturum, pano)
  const satirlar = []
  let adlar = []
  try {
    adlar = fs.readdirSync(pano)
  } catch {
    return { satirlar, guncelNesil }
  }
  const onek = `.sage-enjekte-${oturumKisa(oturum)}-`
  for (const ad of adlar.sort()) {
    if (!ad.startsWith(onek) || !ad.endsWith('.jsonl')) continue
    const nesilNo = Number(ad.slice(onek.length, -'.jsonl'.length))
    if (!Number.isInteger(nesilNo)) continue
    const dosya = path.join(pano, ad)
    let ham = ''
    try {
      ham = fs.readFileSync(dosya, 'utf8')
    } catch {
      continue
    }
    const satirMap = new Map()
    for (const s of ham.split('\n').slice(-OKUMA_SATIR_TAVANI)) {
      if (!s.trim()) continue
      let o
      try {
        o = JSON.parse(s)
      } catch {
        continue // yarım yazılmış satır defteri bozmaz
      }
      if (!o || typeof o.n !== 'string') continue
      if (typeof o.id === 'string') {
        satirMap.set(o.n, { ...o, sayildi: false, kullanildi: false, nesil: nesilNo, dosya })
      } else if (satirMap.has(o.n)) {
        const k = satirMap.get(o.n)
        if (o.sayildi === true) k.sayildi = true
        if (o.kullanildi === true) k.kullanildi = true
      }
    }
    satirlar.push(...satirMap.values())
  }
  return { satirlar, guncelNesil }
}

/**
 * Bir ders satırına işaret ekler (`sayildi` | `kullanildi`). Yalnız ekleme — bkz. başlık.
 * @returns {boolean}
 */
function isaretle(satir, alan) {
  try {
    if (alan !== 'sayildi' && alan !== 'kullanildi') return false
    fs.appendFileSync(satir.dosya, JSON.stringify({ n: satir.n, [alan]: true }) + '\n', 'utf8')
    return true
  } catch {
    return false
  }
}

module.exports = { METIN_KARAKTER, panoDizini, nesil, defterYolu, yaz, oku, isaretle }
