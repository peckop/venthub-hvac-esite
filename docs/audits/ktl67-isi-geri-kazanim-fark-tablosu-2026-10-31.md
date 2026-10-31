# KTL-67 — Isı geri kazanım: canlı sayfa ile resmî kaynak farkları (31 Ekim 2026)

Yöneten cetvel: `docs/standards/catalog-ingestion-standard.md` §6.3 (önce kaynak dizini), `product-schema-standard.md`. Bulan: BLOG (BLG-20 B2, B5). Canlıya yazılmadı. Yazım paketi bu belgenin sonunda yalnız TASLAK olarak duruyor (aşağıda "Yazım paketi durumu").

## 1. Kaynak ekleme (AVenS)

| Dosya | Kaynak adres (resmî alan avensair.com) | Boyut | sha256 | Tarih (belgede) |
|---|---|---|---|---|
| AVENS_750_IGK.pdf | `https://www.avensair.com/uploads/191124013152673c9348c38a8_AVENS%20750%20IGK.pdf` | 362107 | `5d8fb0af9060d1d3d554e97192432fc03655374b3ede65bbc00c0270145d1cb6` | 23/09/2024 |
| AVENS_1000_IGK.pdf | `…/191124013226673c936a7130f_AVENS%201000%20IGK.pdf` | 418284 | `ea4662d0f76b5b8f62bf01cec5bcfdf0d42d497052c9388d1bee408f70d58bfd` | 13/11/2017 (rev 15/11/2017) |
| AVENS_2000_IGK.pdf | `…/191124013227673c936b0df91_AVENS%202000%20IGK.pdf` | 353504 | `206b374e03c676835e90ef8955acf8e881fb5bae1ee6cdf1270d33cda450054c` | 30/01/2024 |

YÖNTEM: Chrome yerine curl (yalnız resmî üretici alanı, yönlendirme yok, boyut + sha256 ölçüldü). Kaynak dizinine `cikar.py --pdf` ile eklendi (belge 97-99, dizin 4125→4133 sayfa); dosyalar `venthub-pdf-ingestor/venthub/markalar/avens/isi-geri-kazanim/01-input/`. Dizin değişikliği ingestor deposunda commit bekliyor. Tazelik kapısı kırmızı: sebep bu işle ilgisiz, `vorticent-cms-atex` web kaynağı (`vortice.com__en__centrifugal-fans__duct__30174.txt`) bayat; bu işte dokunulmadı.

Baskı tazeliği: 1000 föyü 2017 tarihli (rev 2017); avensair.com'da ikinci bir 1000 PDF'i var (BLOG: Last-Modified 11 Mar 2026, metin aynı). Son baskı olduğu ölçülmedi.

## 2. AVenS: canlı ≠ resmî föy

Canlı değerler `venthub.com.tr/tr/products/avens-isi-geri-kazanim-cihazlari` sayfa verisinden (31 Ekim). Resmî föy = yukarıdaki PDF sayfa 1 (ölçü tablosu görüntüden okundu). Üretici fiyat listesi = `avens_fiyat_listesi_2026_HQ.pdf` s.68.

| Alan | Ürün | Canlı | Resmî föy s.1 | Fiyat listesi s.68 | Durum |
|---|---|---|---|---|---|
| Ölçü L×W×H (mm) | AVE-13010 (750) | 910×815×350 | 910×815×350 | 910×815×350 | kesin, tutuyor |
| Bağlantı (mm) | AVE-13010 | 250×250 | A,B=250 | model tablosu 250×250 | kesin, tutuyor |
| Ölçü L×W×H | AVE-13011 (1000) | 910×815×350 | 910×815×350 | 910×815×350 | kesin, tutuyor |
| Bağlantı | AVE-13011 | **275×275** | A,B=250 | model tablosu 275×275, ölçü tablosu A,B=250 | ÇELİŞKİLİ: föy ve fiyat listesinin ölçü tablosu 250; fiyat listesinin model tablosu 275 (üretici belgesi kendi içinde tutarsız). Föye göre canlı yanlış |
| Ölçü L×W×H | AVE-13013 (2000) | **1400×1025×500** | **1240×1075×500** | 1400×1025×500 | ÇELİŞKİLİ: canlı = fiyat listesi; föy 2024 tarihli farklı. Hangisi doğru ölçülemedi |
| Bağlantı | AVE-13013 | 300×300 | AxB, CxD=300 | 300×300 | kesin, tutuyor |

AVenS 1000 ve 2000 için karar/teyit: üretici (Recep'in dış yazışma yetkisi). Föyün tarihi 2000 için (30/01/2024) fiyat listesinden (Ocak 2026 değişiklik) eski.

Canlıda olmayan ama föyde olan değerler (yazım için ayrı karar, bu turda önerilmiyor): sıcaklık verimi %55 (1000), %42 (2000); ses 43 dBA (750/1000) / 72 dBA (2000) "Ses Basınç Seviyesi" yazıyor ama 2000'in 72 dBA'sı fan sayfasındaki 72 dBA ile aynı (fan değeri), 750 için de 43/70; ses ve verimin ölçüm koşulu föyde açık değil. Bu yüzden yazım önerilmedi.

## 3. Vortice: canlı ≠ resmî föy

Kaynak: MEV IoT 188510 (Ocak 2025, sayfa = PDF sırası) ve Mono 189860 (Ocak 2025). Canlı: `vortice-vort-hr-isi-geri-kazanim` ve `vortice-vort-mono` aile sayfaları, 31 Ekim.

| # | Alan | Ürün | Canlı | Föy | Durum |
|---|---|---|---|---|---|
| 1 | Ses etiketi türü | HR ürünlerinde LwA (57), Mono'da Lp (49,2 / 31,8 / 44,6) | — | HR föyünün enerji sayfası LwA veriyor (s.48, 54), performans sayfası Lp 3 m veriyor (s.47, 53); Mono yalnız Lp | Tür karışıklığı gerçek; Mono canlı değerleri föyle TUTUYOR |
| 1a | Ses | 12101 (AVEL D) | 57 | LwA 47,2 (s.54), Lp 3 m 25,2 (s.53) | canlı YANLIŞ (57 başka modelin değeri: 12106/10911 LwA 57) |
| 1b | Ses | 10930 (NETI) | 57,2 | LwA 53 (s.34), Lp 3 m 26,3 (s.33) | canlı YANLIŞ |
| 1c | Ses | 10911 / 12106 (AVEL) | 57 | LwA 57 (s.48) | tutuyor (LwA) |
| 1d | Ses | 12219 (MINI TOP) | 46 | Lp 3 m 36 (s.58); LwA ölçülmedi | ÖLÇÜLMEDİ (LwA sayfası okunmadı) |
| 2 | Filtre sınıfı | Mono ailesi | G4 | G3 (Mono föyü s.8, s.10, s.14) | canlı YANLIŞ, kesin |
| 2a | Filtre | AVEL 10911/12106 | G3 | Coarse 30% (G3) (s.46) | tutuyor |
| 3 | Elektrik koruma sınıfı | AVEL 10911/12106 | Class II | Class I, topraklama gerekli (s.49) | canlı YANLIŞ; NETI, AVEL D, MINI için ölçülmedi |
| 4 | Verim | 10930 | 87,9 | 87 (s.34, referans debide) | canlı yuvarlama farkı; 87,9 föyde yok |
| 5 | Mono verim | Mono ailesi | 90 (eğri 90/85/80) | "up to 90% at minimum flow rate" (Mono s.5, 7, 14); eğri föyde yok | eğri föy dışı, 90 tutuyor; eğri uydurma olabilir, ölçülmedi |
| 6 | 12444 (Mono 40 Wi-Fi) | MEV kat. s.18 ile Mono föyü s.17 | canlı 40 m³/h, 5 W, 47 Pa, Lp 31,8, Ø160 | Mono föyü s.17: 40 / 5 / 47 / 31,8 (s.16: Ø146 çap tablosu); MEV s.18'de aynı kod satırı 100 mm, 38, 4, 130, 49,2 yani 12443'ün değerleri | MEV s.18 kopya hatası, canlı Mono föyüyle TUTUYOR; yazım gerekmez |
| 7 | Ağırlık, l/s, IP | 10911/12106/10930, tüm Mono | — | ölçülmedi | ÖLÇÜLMEDİ |

Ağırlık, IP, l/s alanları ve 12214/10935 kod tutarsızlığı bu turda doğrulanmadı.

## 4. Yazım paketi durumu

Yazılacak değerler kesin olanlar: Mono filtre G4→G3 (8 ürün), 12101 ve 10930 ses değerleri (canlı değer tür olarak LwA, föyde LwA var: 47,2 ve 53), AVEL (10911/12106) elektrik koruma Class II→Class I. Kuru koşu ve geri alma SQL'i hazırlanmadı: ürünlerin ilgili alanları, `description_i18n` metinlerinde aynı sayı geçip geçmediği ve alan değişmeden okuyan kodlar taranmadı (KATALOG-kurallar 2 ve 3), bu yüzden paket "hazır" sayılmaz.
