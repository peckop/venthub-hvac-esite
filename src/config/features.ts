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

/**
 * İngilizce vitrinin ARAMA MOTORUNA SUNULMASI. Sayfaların kendisiyle ilgisi yoktur.
 *
 * ⚠ADI TAM OLARAK BUNU YÖNETİR: `/en/...` sayfaları KAPALI hâlde de **çalışmaya devam
 * eder** — açılır, gezilir, bağlantısı paylaşılabilir. Yönettiği tek şey, o sayfaların
 * **dizine girme talebi**: site haritasında ilan edilmeleri ve `noindex` işareti.
 * (Alan adı taşıdığı birimi taahhüt eder — bu yüzden `EN_ACIK` değil, `EN_YAYIN`.)
 *
 * NİÇİN KAPALI DOĞUYOR (Recep kararı, 2026-09-07, REC-204):
 * *"Bu şekilde yayınlanmasınlar evet, ama her zamanda olsun istemiyorum — biz
 * sorunlarımızı çözelim, sonra yayınlansınlar."* Yani bu bir **"kapat ve unut" değil,
 * "kapat ve bitir"** bayrağıdır.
 *
 * ÖLÇÜM (Google Search Console + canlı + DB, 2026-09-07):
 *  · GSC: dizine eklenmedi 115 / eklendi 101. En büyük kalem **"Keşfedildi ama
 *    taranmadı: 110"** ve örneklerin TAMAMI `/en/…`, "son tarama: Yok".
 *  · TR ana sayfadan `/en/…` adresine giden iç bağlantı: **0**. EN tarafı kendi içinde
 *    bağlı (22 link) ama oraya giden kapı yok → Google için "kimsenin bağlantı
 *    vermediği sayfa" = düşük öncelik.
 *  · EN sayfalar BOŞ DEĞİL, TR'den daha dolu (17.330 vs 15.389 kelime) — sorun içerik
 *    hacmi değil, görünürlük.
 *  · Ama vitrin YARIM: 40 ailenin **8'inde** EN adı = TR adı; 23 aktif kategorinin
 *    **0'ında** EN açıklaması var; çatı metni Türkçe basıyordu (REC-210 kapattı).
 *
 * RİSK (niçin bugün açmıyoruz): Google yarım çevrilmiş sayfaları "düşük değerli
 * otomatik çeviri" diye işaretleyebilir ve o damga sonradan zor silinir. Bugün açık
 * tutmak, ileride ihracat başladığında **temiz başlangıç hakkını harcamak** olur.
 * Kapatmanın kaybı yok: sayfalar zaten dizinde DEĞİL (110'u kuyrukta), yani yaş/güven
 * kazanmıyorlar — sadece Türkçe sayfaların tarama sırasını işgal ediyorlar.
 *
 * NİÇİN ENV DEĞİL SABİT: bu dosyanın başındaki gerekçenin aynısı — `NEXT_PUBLIC_`
 * öneki unutulursa değer sessizce `undefined` olur ve bayrak "kapalı" gibi davranır.
 * Burada sessiz kapalılık ÖZELLİKLE tehlikeli: kimse fark etmeden İngilizce vitrin
 * dizinden düşer ve sebebi görünmez.
 *
 * AÇILMA ŞARTI (REC-204, üçü de SAYIYLA ölçülür; karar Recep'in):
 *  1. `/en/…` görünür metninde Türkçe kelime **0** (REC-210 ile bugün karşılandı).
 *  2. 8 ailenin gerçek İngilizce adı yazılmış (REC-109).
 *  3. 23 aktif kategorinin İngilizce açıklaması dolu (REC-161 alanı açıyor).
 *
 * GERİ AÇMA: bu değeri `true` yap — site haritası EN adresleri yeniden ilan eder,
 * `noindex` düşer. Sonra Search Console'a yeni site haritası bildirilir. Başka hiçbir
 * yeri değiştirmek gerekmez; kapı (INV-EN-YAYIN-1) bunu iki yönlü tutar.
 *
 * BİLİNEN SINIR (gizlemiyoruz): `hreflang` beyanları KALDI. Sayfa var olmaya devam
 * ettiği için dil eşleşmesini bozmak istemedik; ama `noindex` bir sayfaya hreflang
 * göstermek Google için tutarsız sinyaldir ve o beyan büyük ihtimalle yok sayılır.
 * Zararı ölçülmedi, faydası (açılışta tek bayrak yetmesi) ölçüldü. Sorun çıkarsa
 * hreflang de bu bayrağa bağlanır — kapsamı bugün bilerek büyütmedik.
 */
export const EN_YAYIN = false

