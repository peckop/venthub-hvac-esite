# Test Karnesi — Recep Özeti (2026-10-09)

**Sürüm 1.0 · 2026-10-09 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-38 (OPS emri 2026-10-09, Recep'in “hangi test kalır, hangisi silinir” sorusu) · Cetvel: `docs/standards/test-karnesi-standard.md` · Ham karne: `docs/audits/test-karnesi-2026-10-09.json` ve `.md`**

> **Bu dosya niçin var.** Recep'in sorusuna düz cevap: hangi testler kalır, hangileri birleşir, hangileri PR dışına taşınır, hangileri silinir. Hiçbir test bu belge için yeniden koşturulmadı: kaynak 6–7 Ekim'deki bozma ölçümü (her teste bilerek hata koyup yakalayıp yakalamadığına bakma), 6 Temmuz–7 Ekim CI geçmişi ve 6 Ekim yerel süre ölçümüdür; `scripts/test-karnesi/karne-uret.cjs` bunları yalnız birleştirir. Tablo ham karneden 2026-10-09 tarihinde üretildi; hüküm sütunu ALTYAPI'nın önerisidir, silme listesi Recep onayıyla (cetvel §7).

## 1. Kısa cevap

- Depoda **654 test dosyası** (**7.271 test**) var. **347** dosyaya bilerek hata konarak bakıldı (hepsi kural/uyum testi, 6–7 Ekim); **307** dosyaya bakılmadı (birim, uçtan uca, edge, betik testleri ve ölçümden sonra eklenenler).
- **Silinecek test yok.** Silmeye yetecek kanıt çıkmadı: en güçlü üç aday için denenen bozma sayısı birer tane ve eşlerinin ikisi de kendi başına kısmi korumalı. Üçü eşleriyle **birleşir**.
- **2 test PR dışındaki işe taşınır** (üç ayda 10 kırmızı, 10'u da PR'dan bağımsız toplu olay).
- **218 test güçlendirilecek:** kırmızı veriyorlar (en az bir bozmayı yakalıyorlar) ama denenen bir ya da daha fazla bozmaya yeşil kalıyorlar. Toplam 709 bozma denendi, 306'sı yakalanmadı (ana turda 213, ek yoklamada 93).
- **PR süresi kazancı yaklaşık 0 dk.** Bekleme süresini testler değil derleme ve denetim işi (`ci`) belirliyor: 9 Ekim'in son 5 PR'ında `ci` 88–273 sn, en yavaş test dilimi 83–125 sn sürdü.

## 2. Tablo

| Test grubu | Kaç dosya (test) | Hüküm | Gerekçe |
|---|---|---|---|
| Aynı korumayı başka bir testin de verdiği testler | 3 (26) | birleşir | Her biri için denenen tek bozmayı başka bir test de yakalıyor ve üç ayda hiç kırmızı vermediler; ama tek bozma silmeye yetmez, ikisinin eşi de kısmi korumalı. Silmiyorum, eşleriyle tek dosyada birleştireceğim. |
| Dünya durumundan kırmızı verip PR'ı boşuna durduran testler (pencere açılış çıktısının boyut sınırı, git kancalarının belge kapsamı) | 2 (37) | zorunlu olmayan işe taşınır | Üç ayda 10 kırmızı verdiler; 10'u da birçok PR'ı aynı anda durduran iki toplu olaydı (27 Ağustos, 29 Eylül), hiçbiri tek bir PR'ın hatası değildi. Canlı siteyi değil çalışma düzenini koruyorlar. |
| Bir kolu dünya durumuna bağlı testler (yorum sıyırıcı, companion eşliği, cetvel bölüm yapısı, üretilmiş artefakt tazeliği) | 4 (38) | kalır (dünya durumu kolu ayrılacak) | Kırmızılarının 73'ünün 57'si PR'dan bağımsız, 16'sı PR'ın kendi hatasıydı (yani işe yaradıkları anlar); tamamını taşırsam o 16'yı kaçırırım. Yalnız dünya durumuna bağlı kolu ayrılacak. |
| Talimat yüzeyi PPR testi (instruction-surface-ppr) | 1 (3) | kalır (yeniden ölçülecek) | Bozma ölçümü bu testin iki bozmasını da kaçırdı; ama test yalnız kaydedilmiş (commit'li) dosyalara bakıyor, benim bozmalarım kaydedilmemişti. Test mi kör ölçüm mü kör, yeniden ölçülecek. |
| Kart-plan kapısı testi (belge-kart-plan-kapisi) | 1 (45) | kalır | Bozma yapmadan bile kırmızı çıktı: bu makinede (Windows) satır sonu karakteri farklı. Test kodu sağlam, yalnız ölçüm yapılamadı. |
| Şema tabanı tazelik kapısı | 2 (7) | kalır | Dünya parçası 6 Ekim'de ayrı dosyaya taşındı ve PR dışında koşuyor; kalan dosya yalnız PR'ın kendi koduna bakıyor. |
| Adres, kategori ve rota dili (URL, site haritası) | 96 (1.024) | kalır (29 güçlendirilecek, 58 ölçülmedi) | Pazar yayınındaki yeni adres düzeninin asıl koruması; yayından önce gevşetilecek bir şey yok. |
| Ajan, kanca ve çalışma düzeni kapıları (pano, defter, merge, kanca) | 94 (1.443) | kalır (49 güçlendirilecek) | Pencerelerin çalışma düzenini koruyan en büyük grup. Yerel test süresinin %61'i burada (530 sn); CI'da en yavaş test dilimi 125 sn. |
| Vitrin, arayüz, tasarım dili ve 3D | 90 (483) | kalır (21 güçlendirilecek, 54 ölçülmedi) | Müşterinin gördüğü yüzey (bileşenler, tasarım dili, 3D); ölçülmeyenlerin çoğu bileşen birim testi. |
| Admin paneli | 59 (344) | kalır (15 güçlendirilecek, 39 ölçülmedi) | Yönetim ekranlarının yetki ve veri kapıları; yarısından çoğu yalnız birim testi, bozma ölçümü yapılmadı. |
| Ürün, fiyat ve katalog verisi (içerik hattı betikleri dahil) | 56 (563) | kalır (13 güçlendirilecek, 34 ölçülmedi) | Fiyat ve katalog verisi ile ürün içerik hattı betikleri; bir fiyat hatası doğrudan vitrine yansır. |
| Ödeme, sipariş ve teklif | 38 (321) | kalır (23 güçlendirilecek, 9 ölçülmedi) | Para, fatura ve teklif akışı; en riskli grup. Örnek: fatura defteri testi, fatura sayfasının yetki kapısını moderatöre açan bozmayı yakalamadı. |
| SEO, içerik ve hukuki sayfalar | 35 (417) | kalır (11 güçlendirilecek, 24 ölçülmedi) | Arama motoru görünürlüğü, bilgi merkezi ve hukuki metin kapıları. |
| CI ve test hattı kapıları | 29 (1.072) | kalır (9 güçlendirilecek, 16 ölçülmedi) | CI hattının kendi kapıları (test seçimi, dilimleme, dünya durumu listesi). |
| Supabase edge fonksiyonları ve SQL kapıları | 24 (254) | kalır (14 güçlendirilecek, 8 ölçülmedi) | Edge fonksiyonlarının ve SQL yazımının kapıları (tekrar gönderim, sayfalama, kaynak izin listesi). |
| Yardımcı kodların birim testleri (utils, lib, middleware) | 24 (187) | kalır (24 ölçülmedi) | Yardımcı işlevlerin ve ara katmanın (middleware) birim testleri; bozma ölçümü yapılmadı. |
| Güvenlik: kimlik, depolama, sır | 20 (162) | kalır (11 güçlendirilecek, 3 ölçülmedi) | Kimlik, depolama yazma yetkisi ve sır sızıntısı kapıları. |
| Çeviri (TR/EN) kapıları | 19 (110) | kalır (8 güçlendirilecek, 7 ölçülmedi) | Türkçe/İngilizce sözlük eşliği ve çeviri anahtarı kapıları. |
| Uçtan uca ve duman testleri (tarayıcıda) | 18 (123) | kalır (18 ölçülmedi) | Tarayıcıda uçtan uca akışlar; bozma ölçümü yapılmadı. |
| Veritabanı, şema ve yetki (RLS) | 13 (116) | kalır (8 güçlendirilecek, 5 ölçülmedi) | Veritabanı kuralları ve satır güvenliği (RLS) kapıları; yetki açığı en pahalı hata türü. |
| Bağımlılık, sürüm ve derleme kapıları | 12 (312) | kalır (2 güçlendirilecek, 2 ölçülmedi) | Bağımlılık sabitleme, sürüm hizası ve derleme atlama mantığı. |
| Belge ve cetvel kapıları | 9 (114) | kalır (4 güçlendirilecek, 1 ölçülmedi) | Belge ve cetvel yapısı kapıları. |
| Mühendislik hesaplayıcıları (HVAC) | 5 (70) | kalır (1 güçlendirilecek, 4 ölçülmedi) | Mühendislik hesaplayıcılarının sonuçlarını koruyor. |
| **Toplam** | **654 (7.271)** | | |

Hüküm sözlüğü: **kalır** = dokunulmaz; **güçlendirilecek** = test kalır, kaçırdığı bozmalar için sağlamlaştırma eklenir; **birleşir** = iki test tek dosyada toplanır, koruma kaybolmaz; **zorunlu olmayan işe taşınır** = PR'ı durdurmaz, master'a girişte ve zamanlı koşuda çalışır; **silinir** = hiçbiri değil (bkz. §1).

## 3. Süre hesabı (ölçülen ve ölçülmeyen ayrı)

| Kalem | Değer | Kaynak |
|---|---|---|
| Birleşecek 3 dosyanın toplam test süresi | 16 sn (yerel, Windows) | `ci-test-olcum-2026-10-06.csv` |
| Taşınacak 2 dosyanın toplam test süresi | 149 sn (yerel; CI'daki süresi ÖLÇÜLMEDİ) | aynı |
| Tüm testlerin toplam yerel süresi | 872 sn | aynı |
| `ci` işi süresi, son 5 PR (9 Ekim) | 88 / 95 / 204 / 251 / 273 sn | `gh run view` iş süreleri |
| En yavaş test dilimi (4 paralel), kod PR'ları | 83 / 107 / 115 / 125 sn | aynı |

Testler dört dilimde paralel koşuyor ve `ci` işinin son adımı dilimlerin bitmesini bekliyor; derleme ve denetimler daha uzun sürdüğü için PR beklemesi dilimlere bağlı değil. Test kısaltmak yalnız çok küçük PR'larda (dilim ≈ `ci`) en çok birkaç saniye kazandırır. Gerçek kısaltma kaldıracı `ci` içindeki sıralama (Lint'i Build ile paralel koşturmak, ALTYAPI ölçümü ≈ 42 sn) ve admin-smoke işidir; Pazartesi ele alınır.

## 4. Sınırlar

- Bozma ölçümü 347 dosyada yapıldı; 307 dosya “ölçülmedi” ve bu yüzden **kalır** yazıldı (tahmin yok).
- Ölçüm bir teste bozmaları sırayla dener ve ilk yakalanışta durur (`sabotaj.cjs`). Bu yüzden “kaç bozmadan kaçı yakalandı” bir oran olarak verilmez: ölçülen 347 testin 345'i en az bir bozmayı yakaladı, 221'inin en az bir bozması kaçtı. “Hiçbir bozması kaçmadı” (117 test) “tam korunuyor” demek değildir, kalan bozmalar denenmedi. Bozmalar el yapımıdır, rastgele örnek değildir.
- Süreler yerel Windows koşusundan (3 işçi, çekişmeli) gelir; CI'da dosya başına süre ölçülmedi, yalnız dilim toplamları ölçüldü.
- Dünya durumu hükümleri 6 Temmuz–7 Ekim CI geçmişine dayanır; 6 Ekim'de taşınan şema tabanı kolu tabloda ayrıca gösterilmiştir.

## 5. Sıradaki işler

1. Karne PR'ı (üretici, ham karne, bu özet, cetvel §7): 9 Ekim akşamı.
2. Pazartesi 12 Ekim: güçlendirme sırası (para, yetki ve veritabanı kapıları önce), `ci` içi sıralama ölçümü, günlük kazanç hesabı, seçimin bağımsız doğrulaması.
3. Salı 13 Ekim: ALT-38 kapanış raporu.
