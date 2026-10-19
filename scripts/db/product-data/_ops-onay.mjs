/**
 * Canlı yazım onayı (ARC-181, OPS-176 / karar 391 sonrası, derinlemesine savunma).
 *
 * `--apply` ya da `--rollback` ile canlı veritabanına yazan her product-data betiği EN ÜSTTE şunu içe aktarır:
 *   import './_ops-onay.mjs'
 * Bayrak yoksa (kuru koşum) hiçbir şey yapmaz. Bayrak varsa şu iki şey birlikte aranır, yoksa çıkış kodu 1:
 *   1. ortam değişkeni VENTHUB_OPS_YAZIM_ONAYI dolu;
 *   2. değeri, OPS'un bir kez oluşturduğu anahtar dosyasının içeriğiyle birebir aynı
 *      (sabit yol: ~/.claude/ops-yazim-onayi.txt; ortam değişkeniyle değiştirilemez).
 * Anahtar dosyası yoksa yazım HİÇBİR pencerede çalışmaz; OPS dosyayı oluşturup değişkeni kendi koşum kabuğunda tanımlar.
 *
 * Bu kapı metin taramasına dayanan canli-yazim-kapisi.cjs (#1998) kancasının ARKASINDAKİ ikinci katmandır:
 * kanca komut metnine bakar, bu dosya betiğin kendisine. İkisi birbirinin yerine geçmez. Sınır (belgeli): anahtar
 * dosyasını okuyabilen bir süreç değeri öğrenebilir; bu yüzden dosya yolu .claude/hooks/izin-istegi-kapisi.cjs HASSAS
 * desenlerine ve okuma kapılarına eklenir (ayrı karar, OPS).
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'

const YAZIM_BAYRAGI = /^--(apply|rollback)(=|$)/

export function yazimIsteniyor(argv) {
  return argv.some((a) => YAZIM_BAYRAGI.test(a))
}

/** Anahtar dosyası SABİT (os.userInfo: USERPROFILE/HOME değişkeninden etkilenmez): ortam değişkeniyle yolu değiştirmek, ajanın kendi dosyasını göstermesine izin verirdi (güvenlik taraması, 19 Ekim). */
export const ANAHTAR_DOSYASI = path.join(os.userInfo().homedir, '.claude', 'ops-yazim-onayi.txt')

/** dosya parametresi yalnız testte işlevi doğrudan çağırmak içindir; modül düzeyindeki kontrol hep sabit yolu kullanır. */
export function onayDurumu(argv, ortam, dosya = ANAHTAR_DOSYASI) {
  if (!yazimIsteniyor(argv)) return { izin: true, sebep: 'kuru koşum' }
  const girilen = ortam.VENTHUB_OPS_YAZIM_ONAYI
  if (!girilen) return { izin: false, sebep: 'VENTHUB_OPS_YAZIM_ONAYI tanımlı değil' }
  let beklenen
  try {
    beklenen = fs.readFileSync(dosya, 'utf8').trim()
  } catch {
    return { izin: false, sebep: 'anahtar dosyası okunamadı (OPS oluşturmadı)' }
  }
  if (!beklenen) return { izin: false, sebep: 'anahtar dosyası boş' }
  const a = crypto.createHash('sha256').update(girilen).digest()
  const b = crypto.createHash('sha256').update(beklenen).digest()
  return crypto.timingSafeEqual(a, b) ? { izin: true, sebep: 'onay eşleşti' } : { izin: false, sebep: 'onay değeri eşleşmiyor' }
}

const durum = onayDurumu(process.argv.slice(2), process.env)
if (!durum.izin) {
  console.error(`[ops-onay] canlı yazım (--apply/--rollback) DURDURULDU: ${durum.sebep}.`)
  console.error('Canlı yazım yalnız OPS penceresinde, Recep "yaz" dedikten sonra koşulur. Kuru koşum (bayraksız) serbest.')
  process.exit(1)
}
