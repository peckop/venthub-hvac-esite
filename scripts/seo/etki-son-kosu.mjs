/**
 * ETKİ DEFTERİ SON KOŞU SAATİ (Kanban SEO-147, SEO-154; cetvel docs/standards/dizin-sistemleri-standard.md D8.1).
 *
 * Neden ayrı, bağımlılıksız bir modül: son koşu saatini HEM `dizin-etki.mjs` (yazar) HEM `dizin-acilis.mjs` (açılış kancasında okur, 12 sn tavanlı)
 * kullanır; biçim iki yerde ayrı yazılırsa okuyan yazanı tanımaz ve "koşmadı" uyarısı sürekli yanlış çalar. Bu dosya yalnız `node:fs` içe aktarır.
 *
 * TEK YER (depo dışı): `<arşiv>/INDEKS.md` içinde bir `etki defteri son koşu: <ISO>` satırı (varsa güncellenir, yoksa eklenir).
 *
 * SEO-154: depo içi `docs/defter/geo-seo-dizin.md` içindeki `ETKI:BASLA`/`ETKI:BITIS` bloğu KALDIRILDI. Her `--etki` koşusu o bloğa yeni saat ve sayı
 * yazdığı için depo her koşuda kirleniyordu (commit'lenmemiş değişiklik, elle temizlik, yanlışlıkla commit'e girme riski). Saat artık yalnız INDEKS'te
 * durur; depo içi hiçbir dosyaya yazılmaz. Sayılar (satır sayısı, hüküm dağılımı) zaten depo dışı `ozet.json` içindedir (D8.1 madde 5).
 *
 * Açılış uyarısı (`acilisUyarisi`): son koşu 24 saatten eskiyse ya da hiç yoksa TEK parça uyarı döner; fail-open (okunamayan dosya "yok" sayılır, fırlatmaz).
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'

export const SON_KOSU_ETIKETI = 'etki defteri son koşu'
export const SON_KOSU_DESENI = /etki defteri son koşu:\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z)/gi
export const ESIK_SAAT = 24

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

function guvenliOku(yol) {
  try { return readFileSync(yol, 'utf8') } catch { return '' }
}

/**
 * Açılış satırına eklenecek uyarı parçası ('' = temiz). YALNIZ depo dışı INDEKS.md okunur (SEO-154: depo içi blok kalktı).
 * Fail-open: dosya yoksa/okunamazsa "kaydı yok" uyarısı (sessiz değil), asla fırlatmaz.
 * @param {{ indeksYolu?: string|null, simdi?: number }} p
 */
export function acilisUyarisi({ indeksYolu = null, simdi = Date.now() } = {}) {
  try {
    const t = indeksYolu ? sonKosuOku(guvenliOku(indeksYolu)) : null
    if (t === null) return 'ETKİ DEFTERİ: son koşu kaydı yok — dizin-takip --etki'
    const saat = Math.max(0, Math.floor((simdi - t) / 3600000))
    return saat >= ESIK_SAAT ? `ETKİ DEFTERİ: son koşu ${saat} saat önce — dizin-takip --etki` : ''
  } catch {
    return 'ETKİ DEFTERİ: son koşu kaydı okunamadı — dizin-takip --etki'
  }
}
