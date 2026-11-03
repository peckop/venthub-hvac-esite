// KİŞİSEL VERİ MASKELEME + HATA AYIKLAMA BAYRAĞI — log, Slack ve hata kayıtları buradan geçer.
//
// NİÇİN (güvenlik karnesi 2026-11, kök 3 · bulgular S1, S2, S6): müşteri e-postası ve telefonu
// dört uçta koşulsuz loglanıyordu; `iyzico-payment` hata ayıklama bayrağını istemciden
// (`?debug=1`, `x-debug: 1`) açıyor ve açıkken ad/soyadı maskesiz, API anahtarlarının
// ilk 6 + son 4 karakterini logluyordu; `log-client-error` istemci mesajını ve adresini
// Slack'e maskesiz, `extra` alanını DB'ye hiç dokunmadan yazıyordu. Her uç kendi küçük
// `mask` fonksiyonunu taşıyordu ve üçü de farklıydı.
//
// Bu dosya SAF: Deno/ağ yok, vitest'ten içe aktarılır. Cetvel: `docs/standards/kisisel-veri-log-standard.md`.

const YILDIZ = '***'

/** `recep@example.com` → `r***@example.com`. Biçimsiz ya da boş değer → `***`. */
export function maskEposta(e: unknown): string {
  const s = String(e ?? '').trim()
  const at = s.lastIndexOf('@')
  if (at < 1 || at === s.length - 1) return YILDIZ
  return `${s[0]}${YILDIZ}@${s.slice(at + 1)}`
}

/** `+90 555 123 45 67` → `***67`. Dört rakamdan kısa ya da boş → `***`. */
export function maskTelefon(p: unknown): string {
  const rakam = String(p ?? '').replace(/\D/g, '')
  if (rakam.length < 4) return YILDIZ
  return `${YILDIZ}${rakam.slice(-2)}`
}

/** `Ayşe Yılmaz` → `A*** Y***`. Boş → `***`. */
export function maskAd(n: unknown): string {
  const kelimeler = String(n ?? '').trim().split(/\s+/).filter(Boolean)
  if (kelimeler.length === 0) return YILDIZ
  return kelimeler.map((k) => `${Array.from(k)[0]}${YILDIZ}`).join(' ')
}

const TELEFON_BICIMI = /^\+?[\d\s().-]{7,}$/

/**
 * Türü bilinmeyen tek bir alıcı değeri (e-posta YA DA telefon YA DA ad): `@` varsa e-posta,
 * yalnız telefon karakterleriyse telefon, değilse ad gibi maskelenir. Log satırında
 * `to` değişkeni kanala göre farklı türde olabildiği için var (`notification-service`, `stock-alert`).
 */
export function mask(v: unknown): string {
  const s = String(v ?? '').trim()
  if (s.includes('@')) return maskEposta(s)
  if (TELEFON_BICIMI.test(s)) return maskTelefon(s)
  return maskAd(s)
}

// Yerel kısım: boşluk, `@`, tırnak, köşeli parantez, ayırıcı dışında HER karakter (Türkçe harf dahil;
// `[A-Z0-9…]` sınıfı `ayşe@x.com`'da yalnız `e@x.com`'u yakalayıp `ayş`'yi açıkta bırakıyordu).
const EPOSTA_METIN = /[^\s@<>"'(),;:/?#&=[\]]+@[\p{L}0-9-]+(?:\.[\p{L}0-9-]+)+/gu
// Yalnız TR mobil biçimi (5xx xxx xx xx, isteğe bağlı +90 / 0 öneki). Genel "10+ rakam" kuralı
// sipariş numarasını (`20260818-4215`) ve epoch ms değerlerini de telefon sanıyordu.
const TELEFON_METIN = /(?<!\d)(?:\+?90[\s.-]?|\(?0[\s.-]?)?\(?5\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}(?!\d)/g
// Oturum belirteci, JWT, API anahtarı gibi uzun tek parça değerler.
const UZUN_BELIRTEC = /[A-Za-z0-9_-]{20,}/g

/**
 * Serbest metin içindeki e-posta, telefon ve uzun belirteçleri maskeler; `sinir` karaktere keser.
 * İstemciden gelen hata mesajı, adres (sorgu dizgesi e-posta taşıyabilir) ve yığın izi içindir.
 * Adreste yüzde-kodlu `@` (`%40`) önce çözülür: `?email=ayse%40example.com` da maskelenir.
 */
export function metniMaskele(s: unknown, sinir = 4000): string {
  return String(s ?? '')
    .slice(0, sinir)
    .replace(/%40/gi, '@')
    .replace(EPOSTA_METIN, (m) => maskEposta(m))
    .replace(TELEFON_METIN, (m) => maskTelefon(m))
    .replace(UZUN_BELIRTEC, YILDIZ)
}

/** `nesneyiMaskele` toplam bütçesi: istemcinin keyfi nesnesi CPU ve DB'yi sınırsız kullanamaz. */
const NESNE_BUTCESI = { yaprak: 200, karakter: 16_000 }

/**
 * JSON değerini derinlemesine dolaşır, her dizge yaprağını `metniMaskele`den geçirir.
 * Derinlik (4), düğüm başına eleman (50) ve TOPLAM bütçe (200 yaprak, 16 000 karakter) sınırlı:
 * bütçe biter bitmez kalan yapraklar `***` olur (güvenlik incelemesi 2026-11-03: 50^4 yaprak ×
 * 1000 karakter gönderen oturumlu bir çağıran uç CPU sınırını aşabiliyordu).
 */
export function nesneyiMaskele(v: unknown): unknown {
  const kalan = { ...NESNE_BUTCESI }
  const gez = (x: unknown, derinlik: number): unknown => {
    if (x == null) return null
    if (kalan.yaprak <= 0 || kalan.karakter <= 0) return YILDIZ
    if (typeof x === 'string') {
      kalan.yaprak--
      const kesik = x.slice(0, Math.min(1000, kalan.karakter))
      kalan.karakter -= kesik.length
      return metniMaskele(kesik, kesik.length)
    }
    if (typeof x === 'number' || typeof x === 'boolean') {
      kalan.yaprak--
      return x
    }
    if (derinlik >= 4) return YILDIZ
    if (Array.isArray(x)) return x.slice(0, 50).map((e) => gez(e, derinlik + 1))
    if (typeof x === 'object') {
      const cikti: Record<string, unknown> = {}
      for (const [k, e] of Object.entries(x as Record<string, unknown>).slice(0, 50)) {
        cikti[metniMaskele(k, 100)] = gez(e, derinlik + 1)
      }
      return cikti
    }
    return YILDIZ
  }
  return gez(v, 0)
}

/**
 * Bir sırrın loglanabilir tek bilgisi: tanımlı mı. Karakterinden HİÇBİRİ loga girmez
 * (S1: eskiden ilk 6 + son 4 karakter basılıyordu — anahtar uzayını daraltır, log sızarsa ipucu verir).
 */
export const sirDurumu = (k: unknown): string =>
  typeof k === 'string' && k.length > 0 ? 'tanimli' : 'eksik'

/**
 * Hata ayıklama bayrağı YALNIZ ortam değişkeninden okunur (S1). İstek nesnesi bu fonksiyona
 * bilerek verilmez: başlık ya da sorgu dizgesiyle açılabilen bir bayrak, isteyen her
 * çağıranın sunucu loguna ayrıntı döktürmesi demektir.
 */
export const hataAyiklamaAcik = (ortamDegeri: string | null | undefined): boolean => {
  const d = (ortamDegeri ?? '').trim().toLowerCase()
  return d === 'true' || d === '1'
}
