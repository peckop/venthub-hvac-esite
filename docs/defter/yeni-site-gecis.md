# OPS defteri: yeni site geçişi (tek süreç)

Sahibi: OPS · Son doğrulama: 2026-11-09 · Cetvel: `docs/standards/departman-defter-standard.md` · Kaynak: OPS-180 (ana kart), OPS-258, HRT-128

**Son tarih: Design projesi 14 Aralık 2026'da kapanıyor.** Design'daki içerik, adres verisi, görseller ve makaleler o tarihten önce kalıcı depoya alınır (kart OPS-228).

"Canlıya geçiş" dendiğinde konuşulan tek süreç budur. Adres, Design, ürün verisi ve dizin bu sürecin parçalarıdır; ayrı araştırma ya da ayrı iş
olarak açılmaz, ilgili parçanın alt defterine ve kartına yazılır. Karar verilmiş konu yeniden soru olarak getirilmez; yeni karar gelince
bu defter güncellenir. Depo herkese açıktır: söz tırnaklanmaz, karar ve kaynak yazılır; maliyet ve sır yoktur.
İçerik 6 Kasım yol haritası ve Design eksik listesinden (OPS çalışma notları, depo dışı) birebir taşınmıştır; 9 Kasım ekleri 1. bölümde işaretlidir.
Daha önce yazılmış plan: `docs/plans/yeni-site-gecis-tek-resim-2026-11-01.md` (taslak, OPS-180); katalog şeması `docs/plans/yeni-site-katalog-sema-taslak-2026-11-01.md`.

## Bu süreç ne kapsar

| Parça | Ne | Alt defter ya da kart |
|---|---|---|
| Design | Claude Design'daki "Venthub New" projesi yeni sitenin kaynağı; eksiklerini Recep yaptırır, eksik listesini OPS verir; OPS Design'a kendiliğinden şart ya da kural yazmaz | 2. bölüm B; kart OPS-180 |
| Adres | Tek önek şeması, eski adreslerin yeni adreslere 308 yönlendirmesi | `docs/defter/urun-adres.md`; URN-157, ALT-177, SEO-76 |
| UnoPIM / ürün verisi | Ürün verisinin tek kaynağı; Design ile sayı farkı ve görselsiz ürünler | KTL-82 (Katalog); 2. bölüm A |
| Arka uç | Veritabanı, sipariş, teklif, ödeme, sunucu fonksiyonları canlıdan olduğu gibi alınır | OPS-180 (kapsam: yeni site mevcut arka uca bağlanır) |
| Önizleme | `onizleme.venthub.com.tr` (Cloudflare); Design her değiştiğinde OPS günceller, kontrol Recep ve OPS birlikte | OPS-180 |
| Dizin | Yeni sitenin arama motorlarında görünmesi, eski adreslerin dizindeki karşılıkları | `docs/defter/geo-seo-dizin.md`; SEO-76 |

## 1 Ne yaptık

| Tarih | İş | Sonuç | Kart |
|---|---|---|---|
| 2026-11-09 | Yeni sitenin tek önek adres şeması cetvele işlendi (`/urunler`, `/uygulama-alanlari`, `/rehber`) | `adres-semasi-standard.md` v0.3, #2449; adres ayrıntısı `urun-adres.md` | URN-159 |
| 2026-11-09 | 308 takip paylaşımı: eşleştirme tablosu ve yönlendirme URUN, rota dili ve arama yönlendirmesi ALTYAPI, ölçüm GEO-SEO | Üç kart: URN-157 (beklemede), ALT-177, SEO-76 | URN-157, ALT-177, SEO-76 |
| 2026-11-09 | Dizin süreci ve adres süreci kendi alt defterlerine alındı; bu defter ikisini tek süreç altında toplar | `urun-adres.md`, `geo-seo-dizin.md` (pilot) | OPS-258 |
| 2026-11-09 | Departman defter düzeni kuruldu; bu defter OPS'un ilk defteri | `departman-defter-standard.md`, manifest | OPS-258, HRT-128 |
| 2026-11-06 | Yol haritası ve Design eksik listesi yazıldı (7 karar, A/B/C eksikleri); o gün depoda değil OPS çalışma ağacındaydı, bu defter onları depoya alır | Aşağıdaki 3. ve 4. bölüm | OPS-180 |
| 2026-11-02 | Yeni sitenin adres şeması kararı verildi | 4. bölümde karar 7 | OPS-180 |
| 2026-11-01 | Yeni site geçiş planı ve katalog şeması taslağı yazıldı | `docs/plans/yeni-site-gecis-tek-resim-2026-11-01.md` | OPS-180 |

## 2 Envanter

Ölçüm tarihi 2026-11-09 (içerik 6 Kasım listesinden devralındı; sayı yanında kaynak kartı yazılıdır, bu turda yeniden ölçülmemiştir).

### A. Site (vitrin) eksikleri

| No | Eksik | Durum | Kaynak |
|---|---|---|---|
| A1 | Sepet ve satış kipi sayfaları: sepet, ödeme adımları (adres, kargo, ödeme), ödeme sonucu (başarılı/başarısız), hesapta sipariş ayrıntısı. Satış kipi düğmesi var, sayfaların çizimi yok. Ödeme sağlayıcısı (iyzico) canlıdaki mevcut kodla bağlanır; Design yalnız ekranları çizer | Açık | Design notları |
| A2 | Ürün galerisi ve görsel açıklamaları: Design'da 718 ürün klasörü, her birinde tek fotoğraf; ek fotoğraf ve alt metin yok. UnoPIM'de iki alan açıldı, boş | Açık | KTL-82 |
| A3 | Görseli olmayan 8 ürün: VRT-HP-1400, VRT-HP-1400-D, SEA-810105, SEA-61102010, AVE-13050, AVE-13051, VRT-25095, VRT-25096 | Açık | KTL-82 |
| A4 | Ürün sayısı farkı: Design'da 1206 model, UnoPIM'de 1165 ürün idi; fark 41 modeldi (6 Kasım, KTL-83: Design'da fazla DAN-80141 ve EDF-* 40 model). Çift kod Design'da çözüldü: önekli kod kaldı, `adres.json` model sayısı 1206'dan 1165'e indi, öneksiz EDF-* `cevir` ile VRT-EDF-*'e çözülür (Design `surec/ops-cevap-2026-11-07-galeri-ve-cift-kod.md`) | Kapandı 7 Kasım: Design 1165 = UnoPIM 1165 | KTL-82 |
| A5 | Bekleyen üç içerik cevabı: Notus 11177 ve 11903 adları katalog tablolarında yer değiştirmiş görünüyor; AVE-80141 için önek kararı (AVE mi DAN mı); Sanikit'in 2 modelinde debi, basınç, güç değerleri yok | Açık | Katalog raporları |
| A5a | İçerik projesinde kalanlar: NIC AT ailesinin 8 ürününün özeti boş, 51 ürünün seri kaydı yok, SEA-61102010 adı boş | Açık | OPS-219 |
| A5b | Kanal tipi fan kategori sayfası önerisi: yuvarlak ve dikdörtgen kesit ayrımı, çeşit tablosu, teklif metni, aileler arası denge | Öneri | OPS-220 |
| A5c | Aynı ürün iki SKU anahtarıyla: Design'daki 40 EDF modeli hem önekli (VRT-EDF-xxx) hem öneksiz (EDF-xxx) kayıtlı, UnoPIM önekli olanı kullanıyor; DAN-80141 de aynı (Design hem AVE-80141 hem DAN-80141). Kanonik olan önekli kod; Design 7 Kasım'da çözdü (A4). UnoPIM'deki 1165 ürünün hepsinin Design'da adresi var | Kapandı 7 Kasım | KTL-82 |
| A6 | Teklif kipi metinleri: fiyatı olmayan ürünlerde "Teklif iste"; kapsam liste fiyatı olmayan 822 ürün | Karar verildi (4. bölüm 4) | Design |

### B. Design'ın kendi açık listesi (devir öncesi)

| No | Eksik | Durum |
|---|---|---|
| B7 | Veri katmanı arayüz tanımı (VHKatalog.d.ts) yazılmadı; canlıya geçişte servisler buna göre yazılacak | Açık |
| B8 | 17 şablonda sözlük yükleme kodu kopya; tek yere toplanacak | Açık |
| B9 | 5 Kasım akşamı yapılanların hiçbiri ölçülmedi: teklif ekranı, tam ekran ürün seçici, geri gitme davranışı, dar pencere düzeni, cari kartının yeni sekmeleri | Açık |
| B10 | Devir paketi: hangi ekran hangi kaynak dosyayı ve veriyi kullanıyor, canlıda hangi tabloya karşılık geliyor; Design panelin ilk üç işinden sonra hazırlayacak | Açık |

### C. Yönetim paneli (ERP)

| No | Eksik | Durum |
|---|---|---|
| C11 | Design'ın sıradaki işleri: kayıt kartı kalıbı, ürün kartı (tedarik, ilişkiler, set), teklif satır davranışları, teklif listesinin tam hali | Sürüyor |
| C12 | Stok, Satınalma, Servis, Üretim ve Muhasebe şimdilik yalnız iskelet: 46 sayfa planlı, içleri boş | Açık |

## 3 Sırada ve yapılabilecekler

Sıra yol haritasındandır; üç iş aynı anda yürür, sonra ortak kontrol, en son canlıya aktarım. Ana kart OPS-180.

| Madde | Gerekçe | Öncelik | Kart |
|---|---|---|---|
| Design eksiklerini Design ile yaptırmak (2. bölüm A, B, C) | Esas Design'dır; Design ile OPS konuşmaz, eksik listesini OPS verir, Design ile Recep konuşur | yüksek | OPS-180 |
| Design'ın adres dosyalarından UnoPIM'e adres yazmak; görselsiz 8 ürünü listelemek | UnoPIM eksiksiz olmadan hiçbir ürün yayına girmez (41 ürünlük sayı farkı 7 Kasım'da kapandı, A4) | yüksek | KTL-82 |
| Fotoğrafsız 18 ürün: Design'da kaynağı yok, görsel üretici kataloğundan ya da Supabase'den gelmeli | Design cevabında çıkan ek bulgu (7 Kasım); UnoPIM eksiksiz olmadan ürün yayına girmez | yüksek | KTL-82 |
| Design içeriğini, adres verisini, görselleri ve makaleleri kalıcı depoya almak | Design projesi 14 Aralık'ta kapanıyor; öncesinde alınmazsa kaynak kaybolur | yüksek | OPS-228 |
| Veri aktarımı engeli: UnoPIM'den canlıya yazma kolu açılmaz | Yazma kolu plan-challenger tarafından 5 koşulla BLOK (`docs/olcum/pim-unopim.md`); koşullar kapanmadan aktarım başlamaz | yüksek | REC-357 §6 (ALTYAPI panosu) |
| Önizlemeyi güncel tutmak; Design ile UnoPIM arasındaki farkı ölçmek | Kontrol önizlemede yapılır | yüksek | OPS-180 |
| Ortak önizleme kontrolü: sayfa sayfa, masaüstü ve mobil, Türkçe ve İngilizce; bulgular Design'a (tasarım) ya da Katalog'a (ürün verisi) | İki taraf "tamam" diyene kadar tekrarlanır; canlıya aktarım ondan sonra konuşulur | yüksek | OPS-180 |
| Canlı adresten yeni tek önekli adrese eşleştirme tablosu ve 308 yönlendirmesi | Eski adreslerin yeni adreslere gitmesi geçişin şartı | yüksek | URN-157 (beklemede, geçişe bağlı) |
| 308 kuralları CI kapıları (eski→yeni 200 tek sıçrama, boyut bütçesi, zincir ve çakışma); `?sku=` yönlendirmesi | Barındırma Cloudflare'e taşınabilir kalır, kural sağlayıcıya özgü yazılmaz | orta | ALT-177 |
| Dondurulmuş eski adres evreni ve dizinli adreslerin ölçümü | GEO-SEO ölçer, URUN tabloya alır | orta | SEO-76 (beklemede) |
| Dizin: yeni sitenin ve eski adreslerin arama motorlarındaki durumu | Geçişte dizin kaybı olmasın | orta | `geo-seo-dizin.md` |
| Satış kipi: şirket kurulunca tek anahtarla geçiş; o gün yeni iş yapılmaz | İki kip de Design'da hazırlanır, sepet ve satış kipi şirket kurulmadan test edilir | orta | OPS-180 |
| Canlıya aktarım planı | Önizleme "tamam" olunca konuşulur; kapsam 4. bölümde | düşük | OPS-180 |
| Bu defter için `olcum` komutu (manifest, plan dosyası ve alt defterlerdeki kart numaralarının tutarlılığı) | Defter `kontrolsuz` kalmasın; şimdilik `pilot` | düşük | açılacak |

Canlıya aktarımın kapsamı şimdiden belli: yeni site sıfırdan kurulur (Next 16); mevcut arka uca bağlanır; ürünler UnoPIM'den taşınır; eski adresler yeni adreslere yönlendirilir; eski vitrin kodu ve testleri silinir.
Bu arada eski sitede yalnız iki tür iş yapılır: bugün zarar veren sorunların düzeltilmesi ve sonucu yeni siteye aynen taşınan işler (karar 412). Rehber yazıları ve arama görünürlüğü işleri sürer.

## 4 Kararlar

| Tarih | Karar | Not |
|---|---|---|
| 2026-11-09 | Yeni site geçişi tek süreçtir; adres, Design ve dizin onun parçasıdır, ayrı araştırma ya da iş açılmaz | Bu defterin varlık nedeni |
| 2026-11-06 | 1. Esas Design'dır: yeni sitenin kaynağı Design'daki "Venthub New" projesi, canlı vitrin taşınmaz; canlıdan yalnız arka uç (veritabanı, sipariş, teklif, ödeme, sunucu fonksiyonları) ve eski adreslerin yeni adreslere yönlendirmesi alınır | OPS-180 |
| 2026-11-06 | 2. Ürün verisinin tek kaynağı UnoPIM; Design'da tamamlanan içerik UnoPIM'e alınır; UnoPIM eksiksiz olmadan hiçbir ürün yayına girmez | OPS-180 |
| 2026-11-06 | 3. Design'daki eksikleri Recep yaptırır (görsel ve galeri, sepet ve ödeme sayfaları, seri sayfası ve benzerleri); OPS eksik listesini verir, Design'a kendisi yazmaz | OPS-180 |
| 2026-11-06 | 4. Site kiple çalışır: ilk açılışta teklif kipi açık; sepet ve satış kipi şirket kurulmadan eksiksiz yapılır ve test edilir; şirket kurulunca tek anahtarla satış kipine geçilir, o gün yeni iş yapılmaz; iki kip de Design'da hazırlanır; fiyatı olmayan ürünlerde "Teklif iste" görünür | OPS-180 |
| 2026-11-06 | 5. Ödeme: Design'da yapılabilen her şey Design'da; yapılamayan kısım ayrı tutulur ve canlıdaki mevcut kod kullanılır | OPS-180 |
| 2026-11-06 | 6. Kontrol önizlemede (`onizleme.venthub.com.tr`, Cloudflare); OPS önizlemeyi Design her değiştiğinde günceller; kontrolü Recep ve OPS birlikte yapar; canlıya aktarım ikisi de "tamam" dedikten sonra konuşulur | OPS-180 |
| 2026-11-02 | 7. Adres şeması: ürünler ve kategoriler `/tr/urunler/`, uygulama alanları `/tr/uygulama-alanlari/`, rehber yazıları `/tr/rehber/` altında; 9 Kasım'da cetvele işlendi (adres-semasi v0.3, §1A) | OPS-180, URN-159 |
| karar 412 | Eski sitede yalnız bugün zarar veren sorunlar ve sonucu yeni siteye aynen taşınan işler yapılır | Yeni iş yeni site hattında |
| 2026-11-09 | 308 sahipliği: URUN tablo ve yönlendirme, ALTYAPI rota dili ve arama yönlendirmesi, GEO-SEO ölçüm | SEO-76 görüşü |
