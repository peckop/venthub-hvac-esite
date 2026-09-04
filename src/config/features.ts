/**
 * Vitrin yetenek bayrakları — derleme zamanı sabitleri.
 *
 * NİÇİN ENV DEĞİL SABİT (REC-94, 2026-09-04 kararı, gerekçesi yazılı):
 * Bu bayrağı tüketen bileşenlerin HEPSİ `'use client'`. İstemciye ulaşan bir env
 * değişkeni `NEXT_PUBLIC_` öneki İSTER; önek unutulursa değer sessizce `undefined`
 * olur ve bayrak "kapalı" gibi davranır — kimse fark etmez. Depoda bu tuzağın
 * belgesi zaten var (`src/config/siteUrl.ts`). Sabit seçtik: geri açmanın bedeli
 * "tek satır" DEĞİL, **tek satır + PR + deploy**. Bu bedeli bilerek ödüyoruz;
 * karşılığında sessizce yanlış değere düşme ihtimali sıfır.
 *
 * NİÇİN quoteMode.ts'e KOYULMADI: teklif modu VERİYE bağlıdır (`hide_price`).
 * Bu bayrak veriye bağlı değil, kurumsal bir SUNUM kararıdır — ayrı eksen.
 */

/**
 * Üç boyutlu (WebGL/R3F) sahnelerin MÜŞTERİ yüzeyinde gösterilip gösterilmeyeceği.
 *
 * Kapalı olmasının sebebi teknik değil: site teklif modunda ve vitrin, arkasında
 * bugün duran bir yetenek olmayan hiçbir şeyi vaat etmemeli — "Etkileşimli 3D"
 * rozeti de, tıklanabilir bir 3D düğmesi de bir vaattir.
 * Cetvel: `docs/standards/vaat-butunlugu-standard.md` §1.4.
 *
 * ⚠KAPSAM: yalnız MÜŞTERİ yüzeyi. Admin tarafındaki 3D (kategori kurucusunun
 * önizlemesi) bu bayrağa BAĞLANMAZ — orası bir vaat değil, bir editördür.
 *
 * Geri açma: bu değeri `true` yap. Geri dönüşte nelerin birlikte dönmesi
 * gerektiği vaat-bütünlüğü cetvelinin §4.5 tablosunda satır satır yazılı.
 */
export const UC_BOYUT_MUSTERI_YUZEYINDE = false

/**
 * Mobil alt sekme çubuğu (REC-129 Faz 1b, tasarım v13 ekran 01/02/12).
 *
 * Beş sekme: Ana sayfa · Ürünler · Teklif (rozet) · Destek · Hesap.
 * Yalnız mobil kırılımda (`md` altı) çizilir; masaüstünde HİÇ render edilmez.
 *
 * NİÇİN KAPALI DOĞUYOR: kabuk fazlı üretiliyor ve bu çubuk tek başına eksik bir
 * deneyimdir — header hâlâ eski altı eylemi taşıyor, ikisi aynı anda açık olursa
 * ziyaretçi aynı işi iki yerde görür (geri-bildirim §36'nın tam olarak reddettiği şey).
 * Bayrak, header paneli (Faz 1c) de indikten sonra TEK seferde açılır.
 *
 * NİÇİN ENV DEĞİL SABİT: yukarıdaki gerekçenin aynısı — bu bayrağı tüketen bileşen
 * `'use client'`; `NEXT_PUBLIC_` öneki unutulursa değer sessizce `undefined` olur ve
 * bayrak kapalı gibi davranır, kimse fark etmez.
 *
 * Geri açma: bu değeri `true` yap. Açmadan ÖNCE header'ın eski eylem kümesinin
 * Faz 1c ile tek öğeye indiği doğrulanmalı — yoksa çift gezinme doğar.
 */
export const MOBIL_ALT_SEKME_CUBUGU = false
