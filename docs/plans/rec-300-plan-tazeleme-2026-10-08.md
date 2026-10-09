# REC-300 — plan tazeleme (bugünkü master'a göre) · 2026-10-08

> **URUN · Bu belge PLAN'dır: kod yok, migration yok, prod yazımı yok.** Ana plan
> [rec-adres-agac-tek-yayin-2026-09-07.md](rec-adres-agac-tek-yayin-2026-09-07.md) (v5) yerinde durur;
> önceki tazeleme [rec-300-plan-tazeleme-2026-09-29.md](rec-300-plan-tazeleme-2026-09-29.md) bu belgeyle **yerini devreder**.
> Burası "09-29'dan bu yana ne değişti, ne kaldı, yayın günü ne sırayla koşar" tazelemesidir.
> **Emir:** OPS 2026-09-29 (URN-38), 2026-10-06 GEO paketi eki (kısa pilot kabul ölçütleri).

**KAYNAK/CETVEL:** ana plan v5 · `canonical-url-standard.md` · `rendering-cache-standard.md` ·
`yayin-gorunurluk-denetim-standard.md` (IndexNow satırı) · [ops52-adres-dili-mekanizma-plani-2026-10-04.md](ops52-adres-dili-mekanizma-plani-2026-10-04.md) ·
Kararlar: K3-b, K4, **157**, **161**, **164 = A**, **249** (toplu IndexNow yalnız yayında değişmeyen adreslere), **259** (kısa pilot; metni bu depoda yok, kabul ölçütleri Kanban kartı URN-38 notundan).
**Ölçüm tazeliği:** master `51fc924f4` (2026-10-08); bayraklar `src/config/features.ts` → `ADRES_SEMASI_K3B = false` (satır 130), `EN_YAYIN = false` (satır 114);
`get_search_suggestions` dönüş tipi canlı veritabanından okundu 2026-10-08;
§4'teki aile EN adı, kategori EN açıklaması ve REC-434 ölçümleri canlı DB ve canlı sayfadan 2026-10-09 (URN-73).
**YÖNTEM:** şerit (URUN), elle; kod yayını yok.

## 1. 09-29'dan bu yana ne değişti

| Olay | Etkisi |
|---|---|
| **#1352 (Faz 1-B) birleşti** 10-06 | Kategori ağacı + Casals + 40 aile adresi canlı veritabanında. Yayın günü listesinden **"Faz 1-B merge" adımı DÜŞTÜ**. Canlı ölçüm: 103 kontrol, başarısız 0. Bayrak kapalı olduğundan görünen site değişmedi. |
| **URN-53** (#1720, #1732, #1733, #1735, #1736) | Eski adres yönlendirmeleri, rehber bağları, sessiz fan serisi ve içerik hattı **yeni aile slug'ına** çevrildi; eski slug köprüsü kaldırıldı. Zincir kalmaz (ALT-13 ön koşulu). |
| **OPS-51** (#1692 migration, #1686 kod) | Casals ayrı marka, Flexiva marka kaydı (noindex), Sığınak 7. kök kategori; Casals ve Flexiva 308'leri kalktı. Marka sayısı 7. |
| **3e tamam** (#1510, #1493, #1557, #1645) | Site haritası adresleri `adresUret` üzerinden; model adresleri haritaya yalnız bayrak açıkken girer (INV-SITEMAP-MODEL-1); EN yazım eşitlendi. |
| **3g büyük ölçüde** (#1561, #1651, ALT-16 #1716) | Webhook aile/kategori/eski slug/model yollarını tazeler. |
| **URN-31** (#1703), **URN-38** (#1715) | "Yayındaki modeller" listesi mekanizması (bugün BOŞ, kapalı kipte sıfır fark); model rotasında veri yokken 200 boş sayfa yerine hata. |
| **IndexNow** (#1459 → `ecef2d5d1`, SEO-12 #1660) | Anahtar + doğrulama dosyası master'da; K3-b adresleri yayına kadar süzülür; toplu kip yalnız yayında değişmeyen adresleri bildirir (karar 249). |
| **OPS-52 + ALT** (#1681, #1682, #1728, #1744, #1745) | Adres dili mekanizması (kapalı), adres matrisi taban ölçümü (245 adres), eski adres haritası üreten elle tetikli iş akışı, önizleme adres taraması (78 vaka) ve Recep'in Cuma önizleme listesi (17 adres). |
| **URN-59 / #1738** (açık) | Ürün sayfasında çift gövde (H1=2) bayrak açılınca tek gövdeye iner; bayrak kapalıyken bire bir aynı. Birleşme karar 298 Recep özetine bağlı. |

## 2. Faz durumu (master'a göre, 2026-10-08)

| Faz | Durum | Kanıt |
|---|---|---|
| 0 cetvel · 1-A · 1-B · 2 · 3a · 3b · 3c · 3d · **3e** | **Bitti** (bayrak arkasında; canlıda görünmez) | PR'lar §1 ve ana plan |
| **3f** arama RPC (adres yerine kimlik) | **KALDI — MIGRATION, Recep onayı.** Ölçüm: `get_search_suggestions` bugün hâlâ `TABLE(type, label, url, metadata)` döndürür, yani adres DB'de üretiliyor. | canlı veritabanı 10-08 |
| **3g** tazeleme | **Büyük ölçüde bitti.** Kalan: model yolu dışındaki kapsam ölçümü (kart notu 10-02 "ölçüm sürüyor"), bu tazelemede yeniden ölçülmedi. | #1561, #1651, #1716 |
| 3-C bayrak `true` + harita + config'ten 19 satır silme | Yayın günü, tek geri dönüşsüz adım. Sırası ALT-13 ve #1738 ile birlikte OPS belirler. | ana plan Faz 3-C |
| 4 Recep önizleme | Araç + tarama + 17 adreslik liste hazır | #1413, #1744, #1745 |
| 5 yayın | §3 | — |

## 3. Kısa pilot (karar 259) kabul ölçütleri ve yayın günü sırası

**Kabul ölçütleri** (ana plan v5 bunları içermiyordu, buraya eklendi; kaynak Kanban kartı URN-38 notu 10-06):

1. Aile, kategori ve marka adreslerinin her biri **tek 308** ile yeni adrese gider (zincir 0).
2. Model adresleri **yalnız "yayındaki modeller" listesindekiler** için açılır; liste dışı model adresi haritada ve bildirimde yoktur. Pasif/arşivli SKU'nun listeden elenmesi açma PR'ının ağ kapısı işidir (URN-51, ölçüt 3).
3. IndexNow süzgeci pilot kapsamında **bildirilecek adres sayısını 0** tutar; toplu bildirim pilotun değil tam yayının adımıdır (SEO-21, karar 249).

**Yayın günü sırası (güncel):**

1. Önkoşul ölçümleri: Recep önizlemesi (Faz 4) onayı · `canli-olc.sh` ve `canli-kapi.mjs` taban satırı · linkinator + unlighthouse taraması · GSC taban ölçümü (SEO-1/SEO-2 #1648 ile alındı, yayın günü yenilenir).
2. **Faz 3-C merge** (bayrak `true` + harita + config'ten 19 satır silme). Aynı yayında #1738 (tek gövde) bayrağa bağlı iner.
3. Deploy sonrası yayın ölçümü: 5 örnek yeni adres 200, eski adresler **tek** 308, site haritası satır sayısı = beklenen, hreflang/canonical, linkinator kırık 0 ve zincir 0.
4. IndexNow (karar 164 A, 249): anahtar dosyası 200 ve 32 bayt ölçülür → `--kuru` sayısı beklenene eşit mi → toplu betik bir kez; pilot kapsamında sayı 0 (ölçüt 3).
5. GSC site haritası yeniden gönderilir; KATALOG ve OPS'a haber (karar 157): katalog paketi canlı DB'den yeniden üretir.
6. İki hafta izleme (ana plan §8).

## 4. Riskler / açık noktalar

* **3f migration** (Recep "şimdi yap"): `get_search_suggestions` dönüş tipi değişir (DROP+CREATE aynı işlemde), tek tüketici aynı PR'da. Kural 13 gereği `--auto` ile birleşmez.
* **Önkoşul ölçümü (canlı DB, 2026-10-09; `product_families.name_i18n`, `categories.metadata.description_i18n`):**
  * 7 ailenin EN adı **dolu** (REC-226 ile gelen aileler, toplam 67 ürün; güncel slug'lar `casals-nimax`, `casals-nimus`, `casals-enkelfan-ec-plug`, `vortice-vorticent-cms-atex-santrifuj-fanlar`, `avens-qe-b-kasa-serisi`, `avens-dikdortgen-kanal-tipi-radyal-fanlar`, `seat-atex-ptc-sensoru`; önceki planlardaki `avens-nimax` gibi adlar eskidir). 47 aktif ailenin 47'sinde EN adı dolu, EN adında Türkçe harf 0; EN adı TR adıyla aynı olan 8 aile marka/model adıdır.
  * `EN_YAYIN` şart 3 (kategori EN açıklaması) **karşılanmıyor: 24/28.** 10-06'da açılan dört alt kategori (`cabinet-fans`, `plug-fans`, `electric-heated-air-curtains`, `unheated-air-curtains`; 44 ürün) hem TR hem EN açıklamada boş. Alan KATALOG'un (`description_i18n`). Bu dört `/en/` sayfasında görünür metin 170-177 kelime ve Türkçe harf 0: boşluk Türkçe sızıntı değil, kategori paragrafının yokluğu.
  * `EN_YAYIN`'ın bu yayında açılıp açılmayacağı OPS'ta bekleyen karar; bayrak bugün `false`.
* **#1738** karar 298 özetine kadar birleşmez; 3-C sırası değişirse ürün sayfası çift gövde ile (H1=2) kalmaya devam eder (bugünkü durum, canlı ölçüldü 10-08).
* **REC-434** (ölü hızlı seçim slug'ları): **kapalı.** #1501 iki ölü kartı kaldırdı ve `showcaseOluSlug` kapısını ekledi; kayıt 2026-09-30'da Done. Ölçüm 2026-10-09: kaynakta `elektrikli-isitici` / `ortam-havali` adres olarak 0 (kalanlar yorum satırı ve 3D model adı eşlemesi), DB'de bu adla kategori 0, canlı `/tr/category/hava-perdeleri` sayfasındaki iç bağlantılar 2/2 HTTP 200. Yayın öncesi yapılacak iş yok.

## 5. OPS'tan beklenen

Yalnız onay: §3 sırası ve ölçütleri. Karar isteyen yeni soru yok.
