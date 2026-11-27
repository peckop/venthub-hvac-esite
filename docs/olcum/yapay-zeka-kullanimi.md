# Ölçüm defteri: yapay zekâ kullanımı (KVKK, API mi kendi sunucu mu)

Sahibi: OPS · Son doğrulama: 2026-11-27 · Kart: OPS-420
Son ölçüm: 2026-11-27 (OPS araştırmacısı; resmî sayfalar ve PDF'ler ham indirildi). Hukuki son söz avukatın.
Bağlı defter: kvkk-yurt-disi-aktarim.md (m.9 kuralı orada; burada tekrar edilmez).

## KVKK Kurumu ne diyor
| Konu | Bulgu |
|---|---|
| Rehber | Üretken Yapay Zekâ ve Kişisel Verilerin Korunması Rehberi (15 Soruda), Yayın No 113, 24 Kasım 2025, kvkk.gov.tr/Icerik/8547 |
| Yurt dışı API | Soru 10 (s.47-48): yurt dışı sağlayıcı üzerinden kullanımda kişisel veri giderse m.9 ve 10.07.2024 Yönetmeliği uygulanır; yani aktarımdır |
| Rol | Soru 7 (s.27-29): hazır modeli kendi amacıyla kullanan kuruluş veri sorumlusudur |
| Anonim veri | Soru 6 (s.24-26): yalnız gerçekten anonim veri Kanun dışıdır; anonimlik teknik yöntem ve nesnel ölçütle gösterilmeli. Girdide kişisel veri yokken çıktıda çıkabilir, bu da işlemedir |
| Maskeleme | Rehberde geçmiyor. Anonimleştirme rehberinde (Nisan 2025) yöntemlerden biri; koşul sonucun kişiyi tanımlayamaması. Geri çevrilebilir maske (eşleme tablosu bizde) için lehte metin bulunamadı |
| Diğer | Sohbet Robotları Bilgi Notu (8 Kasım 2024, /Icerik/8047); Etken Yapay Zekâ duyurusu (12 Mart 2026, /Icerik/8683). OpenAI için Kurul kararı bulunamadı |

## Sağlayıcı sözleşmeleri (2026-11-27)
| Sağlayıcı | Sözleşme | Eğitim / saklama | Bölge | Türkiye |
|---|---|---|---|---|
| Anthropic | DPA 24 Şub 2025; AB SCC, UK, İsviçre | Ticari API verisi eğitimde kullanılmaz; 30 gün içinde silinir, sıfır saklama ayrı sözleşme | Birinci taraf API: global ve ABD | Ek yok |
| OpenAI | DPA 1 Ara 2025; AEA/İsviçre/UK SCC | API verisi izinsiz eğitimde kullanılmaz; izleme günlüğü 30 güne kadar | ABD, Avrupa ve diğerleri (%10 ek ücret) | Ek yok |
| Google Cloud (Vertex) | Cloud DPA 30 Eki 2026, Ek 3 Türkiye bölümü | İzinsiz eğitim yok; önbellek 24 saat | Bölge seçilebilir | Koşullu: fatura adresi Türkiye ve Google ek şartı sunarsa Türk SCC; bildirim müşteride. Fiilen sunuluyor mu ölçülmedi |
| Gemini Developer API | Ayrı işleyen şartları | Ücretli kota eğitimde yok; ücretsiz katman ürün geliştirmede kullanır | — | Ek yok |

## Türkiye'de yerleşik seçenekler
- Token bazlı API, veri yurt içinde: GlassHouse LLMaaS (OpenAI uyumlu, ağ geçidinde TCKN/IBAN/telefon maskeleme), Bulutistan LLMaaS ve GPUaaS, Kloudeks MIA (KKB, 18 Kasım 2026). Fiyatlar yayımlı değil, teklifle.
- GPU kiralama: Cloud4U Türkiye, DT Cloud, GlassHouse; fiyat teklifle.
- Turkcell, Türk Telekom, Radore: ana sayfalarda yapay zekâ ürünü bulunamadı (derin sayfa taranmadı). Turkcell-Google Cloud Türkiye bölgesi KAP 12.11.2025, faaliyete 2028-2029.
- Türk modeller: VNGRS Kumru 7,4B (AWS Marketplace), Kumru-2B ve Trendyol-LLM-7b açık (Apache-2.0).

## Kendi sunucuda açık model (İstanbul, yayımlı fiyat, KDV hariç)
SistemDC: RTX 5090 32 GB 42.000 TL/ay (≈828 $, TCMB 27.11.2026 50,6955), Tesla P40 27.000 TL, çift 5090 62.000 TL. Balhost: RTX 3090 26.000 TL, RTX A5000 32.000 TL. Satıcı iddiası tek 5090'da 26-32B model (nicemli); Türkçe kalitesi ölçülmedi. Tek kart tek hata noktası.

API karşılığı (1M token, resmî fiyat 27.11.2026): Anthropic Haiku 5.5 0,10 $ girdi / 0,50 $ çıktı; Sonnet 5.5 2 $ / 10 $; Gemini 3.5 Flash-Lite 0,30 $ / 2,50 $. 828 $ ile Haiku sınıfında ayda yaklaşık 3,8 milyar token (%70 girdi varsayımı).

## Türkiye'den kaynaklı örnekler
İş Bankası İşGPT (22.05.2024, kendi modeli, veri ülke dışına çıkmıyor) · Akbank kendi modeli (25.04.2024, Mixtral tabanlı), çalışan asistanı Azure OpenAI · Trendyol LLM ve satıcı asistanı (16.10.2026) · Hepsiburada yorum özeti ChatGPT (26.09.2023).

## Hüküm (2026-11-27)
Kişisel veri içermeyen işler (ürün araması, ürün seçimi, teknik soru, yazı hazırlığı) yurt dışı API ile yapılabilir. Müşteri mesajı, sipariş ve e-posta kişisel veridir: yurt dışı API'ye gidecekse ya anonimlik kanıtlanır ya standart sözleşme + bildirim yapılır (Anthropic ve OpenAI'da Türkiye eki yok). Üçüncü yol Türkiye'de barındırılan token API'sidir. Kendi GPU sunucusu bugün önerilmez.

## Ölçülmedi
Sağlayıcıların Türk SCC'yi talep üzerine imzalayıp imzalamadığı; Anthropic'in Bedrock/Google üzerinden AB bölgesi; Kurul karar özetleri; Türk sağlayıcıların token ve GPU fiyatı; açık modellerin Türkçe kalitesi; geri çevrilebilir maskenin hukuki durumu.

## Yeniden ölçme tetikleyicisi
Uygulamaya ilk yapay zekâ çağrısı eklenmeden önce; KVKK yeni rehber ya da karar yayımlarsa; Turkcell-Google Türkiye bölgesi açılırsa.
