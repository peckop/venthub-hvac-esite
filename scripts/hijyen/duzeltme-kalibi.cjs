'use strict'

/**
 * DÜZELTME / TEKRAR UYARISI KALIBI — ARC-202 (HRT-68 kanıtı, OPS 19 Ekim).
 *
 * Recep'in KENDİ mesajı bir düzeltme ya da "bunu daha önce söyledim" uyarısı taşıyorsa, o turun
 * bir davranış dersi (sage remember, audience.roles dolu) üretmesi beklenir.
 *
 * ── KALIP LİSTESİ NASIL ÇIKTI (ÖLÇÜLDÜ, 19 Ekim 2026) ──
 * Son 14 günün 243 konuşma dosyasından 904 GERÇEK Recep mesajı çıkarıldı (kullanıcı metni; sistem
 * zarfı, tool_result, cross-session, otomatik "Review this change" istemleri sayılmadı). Aday kalıplar
 * o kümede sayıldı ve eşleşen her mesaj elle okundu. İlk deneme tek başına `yine` ve `hala` idi: 38 ve
 * 32 eşleşme, çoğu nötr ("yine açarız", "hala 11 Ekim'e park" gibi) — YANLIŞ POZİTİF yüksek. Bu yüzden
 * kalıplar tek sözcük değil BAĞLAMLI: "yine" yalnız olumsuz bir sözcükle birlikte, "hala/halen" yalnız
 * eksiklik/yokluk bildiren bir sözcükle birlikte sayılır. Sayılar ve yanlış pozitif oranı karttadır (ARC-202).
 *
 * Recep hızlı ve hatalı yazar ("hatırlıyorsun" → "hatırlamıuyorsun"); karşılaştırma ASCII'ye
 * indirgenmiş küçük harfle yapılır (ı/İ/ş/ğ/ü/ö/ç ayrımı kalıbı bozmasın).
 */

const asciiKucuk = (s) =>
  String(s)
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')

/** Kalıp adı → düzenli ifade (ASCII-küçük metin üstünde). Sıra: güçlü tekrar sinyali → bağlamlı → ton. */
const KALIPLAR = [
  ['tekrar-sayisi', /\b(defalarca|kac\s*(kez|defa|kere|kerede)|kacinci|her seferinde|\d+\s*(defa|kez|kere)\b)/],
  // "dedim/söyledim" tek başına KALIBA ALINMADI: ölçümde 15 eşleşmenin çoğu nötr ("ona dedim artır", "esc dedim").
  ['soylemistim', /\b(demistim|dememis miydim|soylemistim|yazmistim|uyarmistim|uyardim|anlatmistim|hatirlatiyorum|hatirlatmistim)\b/],
  ['yine-olumsuz', /\byine\b.{0,40}\b(yanlis|ayni|boyle|kafaniza|yapmamis|yapmadin|yapmadiniz|hata|yabanci|oldun|olmamis|gitti|bozuk|yok)\b|\byine mi\b|\bayni (hatayi|seyi|sorunu)\b/],
  ['hala-eksik', /\b(hala|halen)\b.{0,50}\b(yok|yapmamis|yapmadin|yapmadiniz|bekliyor|hareket|bahsetmedin|cevap|ayni|olmadi|olmamis|gelmedi|bitmedi|calismiyor|konusuyor)\b|\bneden (hala|halen)\b/],
  // Çıplak "sürekli" KALIBA ALINMADI ("sürekli saatler harcasınlar" nötr); yalnız tekrar/unutma bağlamı.
  ['surekli', /\b(hep bir seylere|hicbir seyin sonu|surekli (ayni|tekrar|unutuyor|gidiyor))\b/],
  ['ton', /\b(salak|zirva|rezalet|biktim|yeter artik|malsiniz|sinirliyim|anlamiyor musun|ne yapiyorsun sen|ne sikime|sikinin)\b/],
  ['hafiza-sitemi', /\b(hafizan|hafiza sorunu|aklinda tutmuyorsun|hatirlamiyorsun|unutuyorsun)\b/],
]

/** Recep'in KENDİ mesajı mı: sistem zarfı, otomatik inceleme istemi ve komut çıktısı değil. */
function recepMesajiMi(metin) {
  const t = String(metin || '').trim()
  if (!t) return false
  if (t.startsWith('<') || t.startsWith('[') || t.startsWith('/')) return false
  if (/^(Review this change|You previously flagged|Caveat:|This session is being continued)/.test(t)) return false
  if (t.includes('Unified diff') || /^Another Claude session/.test(t)) return false
  return true
}

/**
 * @returns {{eslesti: boolean, kaliplar: string[]}}
 */
function duzeltmeMi(metin) {
  if (!recepMesajiMi(metin)) return { eslesti: false, kaliplar: [] }
  const t = asciiKucuk(metin)
  const kaliplar = KALIPLAR.filter(([, re]) => re.test(t)).map(([ad]) => ad)
  return { eslesti: kaliplar.length > 0, kaliplar }
}

module.exports = { asciiKucuk, KALIPLAR, recepMesajiMi, duzeltmeMi }
