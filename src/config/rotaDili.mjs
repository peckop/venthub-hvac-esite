/**
 * ROTA DİLİ — sayfa adreslerinin dile göre yazımı: TEK tablo, üç çıktı (OPS-52, kararlar 267/269/270).
 *
 * NİÇİN: `about`/`contact` gibi klasör adları iki dilde ortaktı; Türkçe ziyaretçi `/tr/about` görüyordu.
 * Karar 267 (hakkımızda) ve 269 (iletişim) ile adres dile göre yazılır: `/tr/hakkimizda`, `/en/about`.
 * Klasörler DEĞİŞMEZ (sayfa kopyası yok): yeni adres iç yeniden yazımla eski klasöre iner, eski adres
 * kalıcı yönlendirmeyle yeniye gider. Üç çıktı aynı tablodan üretilir, ayrışamaz:
 *  · `rotaDiliYonlendirmeleri` — eski adres → yeni adres, TEK hop 308 (adres-semasi-standard.md A9).
 *  · `rotaDiliYenidenYazimlari` — yeni adres → mevcut klasör (kullanıcı adresi değişmez, sayfa aynı).
 *  · `rotaDiliEsle` — dilsiz eski adres (`/about`) için saf arama; middleware'in dilsiz kolu içindir.
 *
 * NİÇİN .mjs: bu liste `next.config.mjs` içinden çağrılır ve o dosya TypeScript içe aktaramaz
 * (aynı gerekçe: bilgiMerkeziYonlendirmeleri.mjs). Testler de aynı fonksiyonları doğrudan çağırır;
 * yayındaki kural ile test edilen kural aynı koddur.
 *
 * İKİ DOSYA, NİÇİN (PR-C0): bu dosya tabloyu `node:fs` ile diskten okur, yani yalnız Node'da (next.config,
 * testler) çalışır. Mantığın kendisi `rotaDiliCekirdek.mjs`'tedir (fs/path/process YOK, tablo daima parametre);
 * Edge'deki `middleware.ts` ve istemciye giden `routes.ts` çekirdeği `src/lib/adres/rotaDiliTablo.ts` üzerinden
 * kullanır. Bu kabuk yalnız tabloyu yükler ve `tablo = ROTA_DILI` varsayılanını ekler; imzalar PR-A ile aynıdır.
 *
 * ANAHTAR (plan §2.3): `NEXT_PUBLIC_ADRES_DILI`, derleme anında okunur; YALNIZ tam `1` açar. Yok, boş,
 * `true`, `0` ya da bozuk değer = KAPALI (güvenli yön). Kapalıyken üç çıktı da BOŞTUR → hiçbir adres
 * değişmez (kapı: INV-ROTA-DILI-KAPALI-1, src/__tests__/conformance/rota-dili-kapali-sifir-fark.test.ts).
 * K3B (`ADRES_SEMASI_K3B`) ile BAĞLANMAZ: iki ayrı anahtardır, biri tek başına geri alınabilir.
 *
 * VERİ ayrı dosyada (`rotaDili.veri.json`): mekanizma veriden bağımsızdır, Design'ın sayfa listesi
 * yalnız o dosyayı doldurur. Tablo YÜKLENİRKEN doğrulanır; bozuk tablo derlemeyi düşürür, sessizce
 * yutulmaz (kapı yeşilken yanlış yönlendirme canlıya çıkmasın).
 *
 * KAPSAM SINIRI (karar 270): Aşama 2 yüzeyleri (`account`, `cart`, `checkout`, `auth`, `payment-success`)
 * tabloya GİREMEZ. Bu adresler `next.config` noindex başlığına ve ödeme akışına bağlı; dil değişikliği
 * ayrı aşama ve ayrı karardır.
 */

import { readFileSync } from 'node:fs'

import {
  rotaDiliCevir as cekirdekCevir,
  rotaDiliEsle as cekirdekEsle,
  rotaDiliTablosuDogrula,
  rotaDiliYenidenYazimlari as cekirdekYenidenYazimlari,
  rotaDiliYolu as cekirdekYolu,
  rotaDiliYonlendirmeleri as cekirdekYonlendirmeleri,
} from './rotaDiliCekirdek.mjs'

export { adresDiliOku, ASAMA_2_ONEKLERI, DILLER, rotaDiliTablosuDogrula, zincirVarMi } from './rotaDiliCekirdek.mjs'

/** @typedef {import('./rotaDiliCekirdek.mjs').RotaDiliSatiri} RotaDiliSatiri */
/** @typedef {import('./rotaDiliCekirdek.mjs').Yonlendirme} Yonlendirme */
/** @typedef {import('./rotaDiliCekirdek.mjs').YenidenYazim} YenidenYazim */

/** Varsayılan tablo: veri dosyasından okunur ve yüklemede doğrulanır. */
export const ROTA_DILI = rotaDiliTablosuDogrula(
  JSON.parse(readFileSync(new URL('./rotaDili.veri.json', import.meta.url), 'utf8')),
)

/**
 * @param {boolean} acik anahtar (`adresDiliOku` çıktısı); false → boş liste
 * @param {RotaDiliSatiri[]} [tablo]
 * @returns {Yonlendirme[]}
 */
export function rotaDiliYonlendirmeleri(acik, tablo = ROTA_DILI) {
  return cekirdekYonlendirmeleri(acik, tablo)
}

/**
 * @param {boolean} acik anahtar; false → boş liste
 * @param {RotaDiliSatiri[]} [tablo]
 * @returns {YenidenYazim[]}
 */
export function rotaDiliYenidenYazimlari(acik, tablo = ROTA_DILI) {
  return cekirdekYenidenYazimlari(acik, tablo)
}

/**
 * @param {string} yol dil öneksiz yol (sorgu dizesiz), ör. `/about`
 * @param {RotaDiliSatiri[]} [tablo]
 * @param {boolean} [acik] anahtar; varsayılan kapalı
 * @returns {{ satirId: string, tr: string, en: string } | null}
 */
export function rotaDiliEsle(yol, tablo = ROTA_DILI, acik = false) {
  return cekirdekEsle(yol, tablo, acik)
}

/**
 * @param {string} url dilsiz klasör yolu (sorgu/parça olabilir)
 * @param {'tr' | 'en'} dil
 * @param {RotaDiliSatiri[]} [tablo]
 * @param {boolean} [acik] anahtar; varsayılan kapalı
 * @returns {string}
 */
export function rotaDiliYolu(url, dil, tablo = ROTA_DILI, acik = false) {
  return cekirdekYolu(url, dil, tablo, acik)
}

/**
 * @param {string} yol eskiDil'de görünen dil öneksiz yol
 * @param {'tr' | 'en'} eskiDil
 * @param {'tr' | 'en'} yeniDil
 * @param {RotaDiliSatiri[]} [tablo]
 * @param {boolean} [acik] anahtar; varsayılan kapalı
 * @returns {string}
 */
export function rotaDiliCevir(yol, eskiDil, yeniDil, tablo = ROTA_DILI, acik = false) {
  return cekirdekCevir(yol, eskiDil, yeniDil, tablo, acik)
}
