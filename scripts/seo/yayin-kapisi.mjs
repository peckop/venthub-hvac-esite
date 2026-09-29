/**
 * TOPLU INDEXNOW YAYIN KAPISI (REC-405 / karar 164 A, OPS hükmü 09-29).
 *
 * NİÇİN VAR: K4 (Recep, 2026-09-03) "Bing'i değişecek adreslerle beslemeyelim" dedi; karar 164 A bunu
 * "IndexNow adres yayınıyla AYNI yayında başlar" diye kesinleştirdi. Toplu betik canlı `sitemap.xml`'i
 * okur ve SÜZGEÇSİZ hepsini gönderir. Adres şeması bayrağı (`ADRES_SEMASI_K3B`) KAPALIYKEN canlı sitemap'in
 * 87 adresinin 78'i (products 48, category 24, brands 6) yayında değişecek adrestir (ölçüm 2026-09-29):
 * o hâlde koşmak K4'ü çiğner ve Bing'e eski adresleri öğretir. Bu kapı betiği bayrak kapalıyken REDDETTİRİR.
 *
 * Bayrak değeri `src/config/features.ts` METNİNDEN okunur (.mjs TS içe aktaramaz; okuma kuralı
 * `markaYonlendirmeleri.mjs` `k3bOku` ile tek kaynak). Metin beklenen biçimde değilse `k3bOku` HATA
 * fırlatır: sessizce "açık" varsaymak yasak yönü açardı.
 */
import { k3bOku } from '../../src/config/markaYonlendirmeleri.mjs'

/**
 * @param {string} featuresMetni `src/config/features.ts` içeriği
 * @returns {{ izin: true } | { izin: false, sebep: string }}
 */
export function yayinKapisi(featuresMetni) {
  if (k3bOku(featuresMetni)) return { izin: true }
  return {
    izin: false,
    sebep:
      'ADRES_SEMASI_K3B KAPALI: canlı sitemap adreslerinin çoğu yayında DEĞİŞECEK (K4, karar 164 A). ' +
      'Toplu IndexNow bildirimi adres yayınıyla AYNI yayında, bayrak AÇILDIKTAN sonra koşar.',
  }
}
