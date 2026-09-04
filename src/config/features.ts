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
 * REC-129 Faz 1 kabuk gezinmesi — mobil alt sekme çubuğu **VE** header "Teklif" paneli.
 * (Tasarım v13, ekran 01/02/12.)
 *
 * ⭐NİÇİN ADI DEĞİŞTİ (Faz 1c, 2026-09-04): bayrak `MOBIL_ALT_SEKME_CUBUGU` adıyla
 * doğdu ve Faz 1b'de yalnız onu yönetiyordu. Faz 1c aynı bayrağın arkasına header
 * değişikliğini de koyuyor — çünkü ikisi TEK SEFERDE açılmalı (yoksa aynı iş iki
 * yerde görünür). Ama o hâlde eski ad YALAN SÖYLER: "mobil alt sekme çubuğu" diye
 * okunan bir sabit, masaüstü header'ını da kapatıyor olurdu. **Alan adı taşıdığı
 * birimi taahhüt eder**; ad, yönettiği kapsamla birlikte büyütüldü.
 *
 * NE YÖNETİR (ikisi birlikte, tek anahtar — kasıtlı):
 *  · Mobil alt sekme çubuğu (5 sekme) — `md` altı.
 *  · Header eylem kümesinin TEK öğeye inmesi + "Teklif" paneli — her kırılımda.
 *
 * NİÇİN KAPALI DOĞUYOR: yarısı açık bir kabuk, kapalı bir kabuktan KÖTÜDÜR —
 * ziyaretçi aynı işi iki yerde görür (geri-bildirim §36'nın tam olarak reddettiği şey).
 *
 * NİÇİN ENV DEĞİL SABİT: bu bayrağı tüketen bileşenlerin hepsi `'use client'`;
 * `NEXT_PUBLIC_` öneki unutulursa değer sessizce `undefined` olur ve bayrak kapalı
 * gibi davranır, kimse fark etmez.
 *
 * Geri açma: bu değeri `true` yap. Açmadan ÖNCE ölçülmesi gereken: mobil kırılımda
 * alt çubuk ile header'ın AYNI işi iki kez sunmadığı (Faz 1c bunu header tarafında
 * çözüyor, ama açılış bir GÖZLE doğrulama ister — kapı semantik çakışmayı göremez).
 */
export const YENI_KABUK_GEZINMESI = false
