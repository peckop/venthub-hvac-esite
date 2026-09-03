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
