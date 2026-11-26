/**
 * ETKİ DEFTERİ SON KOŞU SAATİ (Kanban SEO-147; cetvel docs/standards/dizin-sistemleri-standard.md D8.1).
 *
 * Neden ayrı, bağımlılıksız bir modül: son koşu saatini HEM `dizin-etki.mjs` (yazar) HEM `dizin-acilis.mjs` (açılış kancasında okur, 12 sn tavanlı)
 * kullanır; biçim iki yerde ayrı yazılırsa okuyan yazanı tanımaz ve "koşmadı" uyarısı sürekli yanlış çalar. Bu dosya yalnız `node:fs` içe aktarır.
 *
 * İKİ YER (depo dışı + depo içi):
 *   1. DEPO DIŞI `<arşiv>/INDEKS.md`: bir `etki defteri son koşu: <ISO>` satırı (varsa güncellenir, yoksa eklenir).
 *   2. DEPO İÇİ `docs/defter/geo-seo-dizin.md`: `<!-- ETKI:BASLA -->`…`<!-- ETKI:BITIS -->` bloğu. YALNIZ depo-güvenli içerik: saat ve SAYILAR
 *      (satır sayısı, hüküm dağılımı). Sorgu, sıra, tıklama, gösterim, adres bazlı arama verisi bu bloğa GİRMEZ (repo PUBLIC, P6);
 *      `blokUret` yalnız sayı alır, adres/metin kabul etmez. `dizin-defter-kontrol.mjs` ÖZET bloğuna (`OZET:`) dokunulmaz.
 *
 * Açılış uyarısı (`acilisUyarisi`): son koşu 24 saatten eskiyse ya da hiç yoksa TEK parça uyarı döner; fail-open (okunamayan dosya "yok" sayılır, fırlatmaz).
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'

export const SON_KOSU_ETIKETI = 'etki defteri son koşu'
export const SON_KOSU_DESENI = /etki defteri son koşu:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/gi
export const ESIK_SAAT = 24
export const BLOK_BASLA = '<!-- ETKI:BASLA -->'
export const BLOK_BITIS = '<!-- ETKI:BITIS -->'
const HUKUMLER_SIRALI = ['olumlu', 'olumsuz', 'notr', 'ayrilamiyor', 'bekliyor']

/** Metindeki EN YENİ son koşu zamanı (ms) ya da null. */
export function sonKosuOku(metin) {
  let en = null
  for (const m of String(metin ?? '').matchAll(SON_KOSU_DESENI)) {
    const t = Date.parse(m[1])
    if (Number.isFinite(t) && (en === null || t > en)) en = t
  }
  return en
}

/** Aynı dizinde geçici dosyaya yazıp yeniden adlandırır: yarım yazılmış dosya okunmaz. */
export function atomikYaz(yol, metin) {
  const gecici = `${yol}.tmp-${process.pid}`
  writeFileSync(gecici, metin)
  renameSync(gecici, yol)
}

/** INDEKS metni → son koşu satırı güncellenmiş (ya da eklenmiş) metin. Başka satıra dokunmaz. */
export function indeksMetniniGuncelle(metin, iso) {
  const satir = `${SON_KOSU_ETIKETI}: ${iso}`
  const desen = new RegExp(`^(?:- )?${SON_KOSU_ETIKETI}:.*$`, 'gim')
  const m = String(metin ?? '')
  if (desen.test(m)) return m.replace(new RegExp(`^(?:- )?${SON_KOSU_ETIKETI}:.*$`, 'gim'), satir)
  return `${m}${m === '' || m.endsWith('\n') ? '' : '\n'}${satir}\n`
}

/** INDEKS dosyasına son koşu satırını yazar. @returns {'guncellendi'|'eklendi'|'olusturuldu'} */
export function indeksYaz(yol, iso) {
  const var_ = existsSync(yol)
  const eski = var_ ? readFileSync(yol, 'utf8') : ''
  const yeni = indeksMetniniGuncelle(eski, iso)
  atomikYaz(yol, yeni)
  if (!var_) return 'olusturuldu'
  return sonKosuOku(eski) === null ? 'eklendi' : 'guncellendi'
}

/**
 * Depo içi blok metni. SAYILAR dışında hiçbir şey kabul etmez (P6): adres, sorgu, sıra, tıklama, gösterim bu işleve ULAŞAMAZ.
 * @param {{ iso: string, satirSayisi: number, gitGecmisi: number, hukumler: Record<string, number> }} p
 */
export function blokUret({ iso, satirSayisi, gitGecmisi, hukumler }) {
  const say = (n) => (Number.isInteger(n) && n >= 0 ? n : 0)
  const dagilim = HUKUMLER_SIRALI.map((k) => `${k} ${say(hukumler?.[k])}`).join(', ')
  return [
    BLOK_BASLA,
    `Etki defteri son koşu: ${iso}`,
    `- etki satırı: ${say(satirSayisi)} (git geçmişinden eklenen: ${say(gitGecmisi)})`,
    `- hüküm: ${dagilim}`,
    BLOK_BITIS,
  ].join('\n')
}

/** Defter metnindeki ETKİ bloğunu değiştirir. Blok yoksa `null` (dosya bozulmaz, çağıran hata yazar). */
export function mdMetniniGuncelle(metin, blok) {
  const a = metin.indexOf(BLOK_BASLA)
  const b = metin.indexOf(BLOK_BITIS)
  if (a < 0 || b < a) return null
  return `${metin.slice(0, a)}${blok}${metin.slice(b + BLOK_BITIS.length)}`
}

/** Depo içi defter dosyasındaki ETKİ bloğunu günceller. @returns {'yazildi'|'blok-yok'|'dosya-yok'} */
export function mdYaz(yol, bilgi) {
  if (!existsSync(yol)) return 'dosya-yok'
  const yeni = mdMetniniGuncelle(readFileSync(yol, 'utf8'), blokUret(bilgi))
  if (yeni === null) return 'blok-yok'
  atomikYaz(yol, yeni)
  return 'yazildi'
}

function guvenliOku(yol) {
  try { return readFileSync(yol, 'utf8') } catch { return '' }
}

/**
 * Açılış satırına eklenecek uyarı parçası ('' = temiz). İki kaynaktan EN YENİ saat alınır (INDEKS depo dışı, md depo içi).
 * Fail-open: dosya yoksa/okunamazsa "kaydı yok" uyarısı (sessiz değil), asla fırlatmaz.
 * @param {{ indeksYolu?: string|null, mdYolu?: string|null, simdi?: number }} p
 */
export function acilisUyarisi({ indeksYolu = null, mdYolu = null, simdi = Date.now() } = {}) {
  try {
    const adaylar = [indeksYolu, mdYolu].filter(Boolean).map((y) => sonKosuOku(guvenliOku(y))).filter((t) => t !== null)
    if (!adaylar.length) return 'ETKİ DEFTERİ: son koşu kaydı yok — dizin-takip --etki'
    const saat = Math.max(0, Math.floor((simdi - Math.max(...adaylar)) / 3600000))
    return saat >= ESIK_SAAT ? `ETKİ DEFTERİ: son koşu ${saat} saat önce — dizin-takip --etki` : ''
  } catch {
    return 'ETKİ DEFTERİ: son koşu kaydı okunamadı — dizin-takip --etki'
  }
}
