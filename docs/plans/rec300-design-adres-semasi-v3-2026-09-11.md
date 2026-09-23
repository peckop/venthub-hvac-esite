# VentHub adres şeması v3 — önekli, kodlu (2026-09-11)

**Durum:** Recep hükmü 2026-09-11 (öğleden sonra): **önekler Türkçeleşir** — `/tr/kategori/` ve `/tr/urun/`. EN yüzey `/en/category/` ve `/en/products/` kalır. K3-b'nin "önekler olduğu gibi kalır" satırı bu hükümle güncellenir (OPS'a bildirildi). Emir #8'in getirdiği kalıp aynen geçerli: sondaki kodla çözülür (Türkçeleştirme plan §4'te "ayrı middleware-rewrite işi" olarak ertelendi). Kanonik kimlik EN slug, görünen URL dile göre (`metadata.slug={tr,en}`), yanlış dil 308. Slug üretim kuralı ayrı belgede: `slug-uretim-kurali-2026-09-11.md`. Kategori ağacı SQL hazırlığı: `kategori-agaci-sql-hazirligi-2026-09-11.md`.

**Önceki durum:** Recep kararı 2026-09-11 (ilk tur). Bilgi mimarisi `design_handoff_venthub_menu/README.md` §3'ten gelir ve bu belge onu **değiştirmez**: 7 kategori · 26 dal · üçüncü seviye yok · kürasyon ve faset kategori altında yaşar. `adres-semasi-v2.md` ARŞİV (v2 düz adres önerisiydi; bu belge onun yerine geçer).
**Kaynaklar:** K3 (CLAUDE.md satır 66–67, güncellenecek) · `adres-semasi-v2.md` (slug tabloları buradan devralındı) · Drive "SKU" belgesi (2026-09-11, Gemini sohbeti) · 09-08 nesne modeli kararı (model kanonik) · canlı site ölçümü.

---

## 1 · Neden v2 düştü

**Bugün üç kaynak üç şey söylüyordu:**
| Kaynak | Ürün adresi | Kategori adresi |
|---|---|---|
| Canlı site | `/tr/urun/vortice-lineo-quiet` | `/tr/kategori/kanal-tipi-fanlar` |
| CLAUDE.md K3 (satır 66–67) | `/tr/urun/<seri>` | `/tr/fanlar/korozyon-dayanimli` |
| v2 + v18 kareleri | `/tr/seat-30` (düz) | `/tr/fanlar` · `/tr/korozyon-dayanimli-fanlar` (düz) |

**v2'nin getirdiği dört fark ve akıbeti:**
1. Ürün önekinin kalkması → **iptal** (önek kalıyor, Türkçeleşiyor).
2. Dalın kategori altından köke çıkması → **iptal** (iki katman kalıyor).
3. Dal slug'larının uzaması → **kalıyor**, ama gerekçesi değişti: artık "kökte tek başına anlamlı olsun" diye değil, **anlam tamamlansın** diye (Recep, 11-09: "kısaltma istemiyorum"). v2'nin "kırpma yok" kuralı aynen yürürlükte.
4. `/tr/urunler` sayfası → **kalıyor**.

**v2 içi eskime (kayda geçti):** v2 satır 25 hâlâ "aile kanonik, `?sku=` varyant ön seçer" diyor. 09-08 nesne modeli kararı **modeli** kanonik yaptı; v3'te `?sku=` tamamen kalkıyor.

---

## 2 · Drive "SKU" belgesinden alınanlar ve alınmayanlar

**Kabul edilen tespitler:**
- Önekin SEO'ya katkısı ya da zararı **yok**. Amazon `/dp/`, Trendyol `-p-<id>`, Hepsiburada `-p-HBCV…`, Shopify `/products/`, Magento `/product/` — hepsi bir tip işareti kullanır. AVenS'in öneksiz yapısı ona **üstünlük vermiyor**, yalnız kısa görünüyor.
- Öneksiz (düz) yapının iki gerçek bedeli: **isim çakışması** (aynı slug ikinci kez kullanılamaz) ve **ölçüm kaybı** (GSC/Analytics'te "tüm ürünler" klasör raporu yok).
- **301 ≡ 308.** Google ikisini aynı sayar; Next.js `permanent: true` zaten 308 döndürür. Adreste tek harf değişse bile kalıcı yönlendirme şart.
- **Sonda kimlik kodu** slug metnini sonradan değiştirmeyi 301 borcu olmadan mümkün kılar. Bizde kritik: TR açıklama %42 dolu, ürün adları daha çok kez düzeltilecek.
- Uzun teknik slug B2B'de gerçek kazanç: hedef kitle "510 m3/h kanal tipi fan" diye arıyor.

**Uyarlanan / reddedilen:**
- **DB id değil, gerçek SKU.** Trendyol'un `-p-161266094` kodu hiçbir şey ifade etmez; bizim kodumuz (`SEA-51302000`, `VRT-17175`) müşterinin **arattığı** şeydir. Kod hem kimlik hem arama terimi olur.
- **Rakip slug taraması sınırlı.** Kelime yığını (keyword stuffing) K7 ve marka tonuna aykırı. Parametreler kendi `technical_specs` verimizden gelir, uydurulmaz.
- **Product/Offer şemasında fiyat + stok önerisi K1'e aykırı.** Şema fiyatsız kurulur (bkz. §8).

**Kritik tespit — "olduğu gibi bırak, sıfır risk" bizde geçerli değil.** Belge haklı olarak "değiştirmezsen risk yok" diyor; ama biz slug metinlerini **zaten değiştiriyoruz** (uzun teknik slug, 442 ürünün aileye bağlanması, ad düzeltmeleri). 308 faturası ne olursa olsun ödenecek. Fatura zaten ödeneceğine göre önek seçimi **bedava bir karar** hâline geldi ve SEO'ya göre değil **çakışma + ölçüm + rota basitliği**ne göre verildi.

---

## 3 · Şema

| Ne | TR | EN |
|---|---|---|
| Ana sayfa | `/tr` | `/en` |
| Tüm ürünler | `/tr/urunler` | `/en/products` |
| Kategori | `/tr/kategori/fanlar` | `/en/category/fans` |
| Dal | `/tr/kategori/fanlar/korozyon-dayanimli-fanlar` | `/en/category/fans/corrosion-resistant-fans` |
| Aile = seri (kodsuz, DB'de hazır slug) | `/tr/urun/seat-serisi` · `/tr/urun/vortice-lineo-quiet` | aynı slug, iki dilde ortak |
| **Model (kanonik)** | `/tr/urun/seat-30-korozyon-dayanimli-radyal-fan-2476m3h-p-sea-51302000` | `/en/products/seat-30-corrosion-resistant-centrifugal-fan-2476m3h-p-sea-51302000` |
| Kürasyon (kategori altında yaşar, README §3) | `/tr/kategori/fanlar/kanal-tipi-fanlar` | `/en/category/fans/in-duct-fans` |
| Senaryo | `/tr/senaryo/kimya-laboratuvari` | `/en/solutions/chemical-laboratory` |
| Marka | `/tr/markalar/vortice` | `/en/brands/vortice` |
| Ürün Seçici | `/tr/secici` | `/en/selector` |
| Teklif listesi | `/tr/teklif-listesi` | `/en/quote-list` |
| Karşılaştırma | `/tr/karsilastir?m=sea-51302000,vrt-17175` | `/en/compare?m=…` |
| Hesap | `/tr/hesap/teklifler` · `/tr/hesap/projeler` · … | `/en/account/quotes` · … |

**İlke:** insanın yazdığı ve markanın gösterdiği adresler (kategori, dal, kürasyon, senaryo) **okunur ve öneklidir**; makinenin ürettiği 442 model adresi **önekli + kodludur**. Ürün hiçbir zaman kökte durmaz → kategori ile ürün çakışması yapısal olarak imkânsız.

**`category` → `kategori`:** Recep kararı 11-09. Türkçe yolda İngilizce kelime durmaz. Bedeli 33 adres × 308, bir kereliğine.

**`-p-` ayırıcısı:** yönlendirici tek kuralla çalışır — *son `-p-` işaretinden böl; sağdaki SKU, soldaki metin serbest*. Soldaki metin değişince yönlendirme gerekmez, adres aynı ürünü açar.

**Varyant:** her varyantın kendi SKU'su var → kendi adresi var. `?sku=` tamamen kalkar. 09-08 "model kanonik" kararı bununla uygulanmış olur. Model sayfasındaki varyant seçici kardeş modelin kendi adresine gider.

**Aile ile seri aynı nesnedir** (DB: `product_families`, kodu `series_code`); ayrı bir "seri" katmanı ve ayrı adres yok. Belgede iki ad dönüşümlü geçiyorsa aynı şeydir.

**Aile sayfası kod almaz:** aile bir ürün değil, anlatım + liste sayfasıdır. Ayrı önek gerekmez — ayrım kodun varlığıyla kurulur: son `-p-` yoksa aile, varsa model. Canlıdaki `/tr/urun/<aile>` yapısının doğrudan devamı (K3, CLAUDE.md satır 67).

---

## 4 · Slug yazım ve üretim kuralı

**Kategori ve dal (elle, sabit):**
- TR slug **çoğul ve tam ad**; kırpma yok (`hava-perdeleri`, `yedek-filtreler`). Recep 11-09: anlam tamamlanacak — dal iki katman altında olsa bile `korozyon-dayanimli-fanlar` kısalmaz.
- EN slug çoğul; gereksiz sıfat düşer. Bağlaç "ve" TR'de korunur, EN'de düşer. Parantez içi düşer (`Radyal (Santrifüj)` → `radyal-fanlar`).
- Kategori slug'ları kısa kalır (`fanlar`, `aksesuarlar`) — tek başına zaten anlamlı ve üst katman.

**Model (otomatik üretilir, bir kez):**
```
slug = [marka] + [model] + [ürün tipi] + [en fazla 2 teknik parametre] + "-p-" + [sku]
```
- ~70 karakter tavan (kod hariç). Türkçe karakter dönüşümü (ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c), özel karakter silinir, boşluk tire, üst üste tire tekleşir.
- Parametreler **`technical_specs`'ten** gelir (debi · çap · basınç · güç sırasıyla, dolu olan ilk ikisi). Değer yoksa yazılmaz — K7. Uydurma sayı yok.
- SKU küçük harf yazılır: `SEA-51302000` → `sea-51302000`.
- Slug bir kez üretilir; sonradan metin düzeltilebilir, **yönlendirme gerekmez** (kod sabit).
- Üretim yeri: katalog paketi (`urunler.csv` → `slug_tr · slug_en · sku` kolonları). Bu belge kuralı yazar, üretimi yapmaz.

**Rezerve kelimeler** (hiçbir ürün/kategori/kürasyon slug'ı olamaz):
`urunler · urun · kategori · seri · liste · senaryo · markalar · secici · teklif-listesi · karsilastir · hesap · api · admin · giris · kayit · arama` ve EN karşılıkları.

**Tek rota kütüğü:** kategori · dal · aile · model · kürasyon · senaryo · marka aynı tabloda, `(dil, yol)` benzersiz. Bugün DB'de ayrı tablolar var; benzersizlik zorlanmıyor — kütük açılmadan v3 uygulanmaz.

**Boş dal:** adres alır, hiçbir yerde bağlanmaz (K3). Plug Fanlar ve Hücreli Aspiratörler bugün ürünle doldu (DB 09-08: 27 ürün) — menüye girip girmeyeceği ayrı karar.

---

## 5 · Slug tabloları

### Kategoriler (7)
| TR ad | TR slug | EN slug |
|---|---|---|
| Fanlar ve Aspiratörler | `fanlar` | `fans` |
| Sığınak Havalandırma | `siginak-havalandirma` | `shelter-ventilation` |
| Isı Geri Kazanım (VMC) | `isi-geri-kazanim` | `heat-recovery` |
| Hava Perdeleri | `hava-perdeleri` | `air-curtains` |
| Hava Şartlandırma | `hava-sartlandirma` | `air-treatment` |
| Kontrol ve Sürücüler | `kontrol-ve-suruculer` | `controls-drives` |
| Aksesuarlar ve Bileşenler | `aksesuarlar` | `accessories` |

### Dallar (26) — v2 tablosu aynen, kırpma yok
**Fanlar (6):** `radyal-fanlar` · `korozyon-dayanimli-fanlar` · `aksiyel-fanlar` · `konut-tipi-fanlar` · `plug-fanlar` · `hucreli-aspiratorler`
**Sığınak (3):** `siginak-havalandirma-uniteleri` · `kursun-separatorler` · `siginak-aksesuarlari`
**Isı geri kazanım (3):** `kanalli-merkezi-uniteler` · `tek-oda-uniteleri` · `yedek-filtreler`
**Hava perdesi (3):** `ortam-havali-hava-perdeleri` · `elektrikli-isitmali-hava-perdeleri` · `sulu-isitmali-hava-perdeleri`
**Hava şartlandırma (3):** `nem-alma-cihazlari` · `elektrikli-kanal-isiticilari` · `sulu-bataryalar`
**Kontrol (3):** `frekans-konvertorleri` · `hiz-anahtarlari` · `sensorler-ve-termostatlar`
**Aksesuar (5):** `kanal-baglanti-elemanlari` · `susturucu-ve-damperler` · `menfez-ve-difuzorler` · `titresim-takozlari` · `yedek-parcalar`

EN karşılıkları v2 tablosundaki gibidir (`centrifugal-fans`, `corrosion-resistant-fans`, …).

### Kürasyon (6) — `/tr/kategori/fanlar/…` ↔ `/en/category/fans/…`
README §3: kürasyon sayfaları kategori altında yaşar; adreste dal ile ayırt edilmez. Altı kürasyonun hepsi Fanlar kategorisinde. Kürasyon dal değildir: ürünün kanonik adresi kendi dalındadır, kürasyon yalnız link verir (README "kopyasını oluşturmaz").
`kanal-tipi-fanlar` · `cati-tipi-fanlar` · `banyo-tuvalet-fanlari` · `duman-egzoz-fanlari` · `tavan-vantilatorleri` · `ec-motorlu-fanlar`

> **Açık kalem:** v2, ATEX kürasyonunu düşürmüştü (senaryo aynı işi görüyor); v18'de **04k karesi ATEX kürasyonu olarak çizildi**. İkisinden biri düzeltilmeli — ya 04k `kanal-tipi-fanlar` örneğine çevrilir, ya ATEX kürasyonu geri gelir. Design önerisi: kare örneği değişsin, senaryo yeter.

### Senaryolar (8) — `/tr/senaryo/…` ↔ `/en/solutions/…`
`kimya-laboratuvari` · `ilac-kimya-tesisi` · `galvaniz-yuzey-islem` · `patlayici-ortam-atex` · `magaza-girisi` · `kapali-havuz-spa` · `ticari-alan-konforu` · `siginak`

---

## 6 · Geçiş (308)

| Eski (canlı) | Yeni | Adet |
|---|---|---|
| `/tr/kategori/<kategori>` | `/tr/kategori/<kategori>` | 7 |
| `/tr/kategori/<dal>` | `/tr/kategori/<kategori>/<dal>` | 26 |
| **Aile adresi** | **değişmiyor** — `/tr/urun/<aile-slug>` canlıda ne ise o kalır | **0** |
| `/tr/urun/avens-plug-fanlar` | `/tr/urun/avens-kentalfan-plug` | 1 (ad düzeltmesi) |
| `/tr/urun/<aile>?sku=<model>` | `/tr/urun/<slug>-p-<sku>` | 442 |
| `/tr/urun/<varyant-slug>` | `/tr/urun/<slug>-p-<sku>` | mevcut varyant slug'ları |
| `/tr/brands/<marka>` | `/tr/markalar/<marka>` | 7 |
| `/tr/cart` | yok (K1) | 1 → 410/404 |

**Kurallar:** kalıcı yönlendirme (308) · birebir eşleşme, parametre kaybı yok · site içi tüm bağlantılar aynı yayında yeni adrese geçer (kullanıcı hiç yönlendirmeye takılmaz) · `canonical` ve sitemap aynı anda yenilenir · GSC'den birkaç örnek adres için indeksleme istenir.

**Sitemap:** tip başına ayrı dosya — `sitemap-kategori.xml` · `sitemap-aile.xml` · `sitemap-urun.xml` · `sitemap-kurasyon.xml` · `sitemap-senaryo.xml`, hepsi `sitemap.xml` indeksinde. hreflang TR↔EN çiftleri her yolda. Klasör raporu GSC'de `/tr/urun/` ve `/tr/kategori/` önekleriyle çalışır.

---

## 7 · Hangi ekran hangi adres (v18 etkisi)

Çizim değişmez, yalnız kare başlığındaki adres etiketi güncellenir:

| Kare | Yeni adres |
|---|---|
| B1b tüm ürünler | `/tr/urunler` |
| B3 kategori (3 mod) | `/tr/kategori/fanlar` |
| B4 · B5 · B5b dal + liste | `/tr/kategori/fanlar/korozyon-dayanimli-fanlar` |
| B6 aile | `/tr/urun/seat-serisi` |
| B7 · B7b · B7c · B7d · B7e · B7v · B7f | `/tr/urun/<slug>-p-<sku>` (+ `?hesap=1`) |
| B8 · B8b karşılaştırma | `/tr/karsilastir?m=<sku>,<sku>` |
| 04k kürasyon | `/tr/liste/<slug>` |
| C2 senaryo | `/tr/senaryo/kimya-laboratuvari` |
| D5 arama → tam kod eşleşmesi | `/tr/urun/…-p-sea-51302000` |
| E3 seçiciden geliş | `/tr/urun/…-p-vrt-17175?hesap=1` |

Breadcrumb'lar değişmez: `Ana Sayfa / Ürünler / Fanlar ve Aspiratörler / Korozyon Dayanımlı Fanlar / SEAT Serisi / SEAT 30`.

---

## 8 · Adresin ötesi — belgeden kabul edilen SEO/GEO katmanları

Adres tek başına sıralamanın küçük bir parçası. Sırayla değer üretenler:
1. **Fiyatsız Product şeması (JSON-LD):** `name · sku · brand · image · additionalProperty[]` (debi m³/h · basınç Pa · güç W · ses dB · çap mm). Fiyat ve stok alanı **yazılmaz** (K1). Teklif akışı için `Offer` yerine iletişim/teklif eylemi işaretlenir.
2. **Belge indeksleme:** teknik föy, montaj kılavuzu, sertifika PDF'leri Google tarafından indekslenir ve "Lineo 150 Quiet teknik föy" aramasını toplar. Bugün **belge tablosu yok** (REC-145) — açılınca kazanç otomatik gelir.
3. **Görsel alt metni:** P-Q eğrisi grafiklerine "Vortice Lineo 250 Quiet ES debi-basınç eğrisi" tipi alt metin. Bedava, bugün yapılabilir.
4. **Kürasyon = indekslenebilir faset sayfası.** Belgenin "SEO uyumlu filtre sayfaları" dediği şey bizim kürasyon şablonumuz; karar doğrulandı.
5. **Teknik SSS** (ileride): "Bu fan banyo için uygun mu?" — sayfa altında; chat-LLM kapısından önce gelir, onu besler.

---

## 9 · Sahiplik

- **Bu belge (DESIGN-MENU):** şema, yazım kuralı, rezerve kelimeler, tablolar, 308 haritası, ekran-adres eşlemesi.
- **Katalog paketi (DESIGN-KATALOG):** 442 ürünün gerçek slug'ının üretimi — `urunler.csv` içinde `slug_tr · slug_en · sku` kolonları, doluluk ölçümü.
- **Kod (URUN / Claude Code):** tek rota kütüğü + benzersizlik kısıtı, middleware 308, canonical, sitemap, GSC.

Ayrı proje açılmasına gerek yok: adres bilgi mimarisidir, K11 gereği burada yaşar.

---

## 10 · Kapanan kalemler (Recep, 2026-09-11)

1. **`-p-` ayırıcısı KALIR.** Karar verildi; `-k-` önerisi düştü.
2. **Kürasyon ayrı sınıf DEĞİL** (11-09): Kanal Tipi · Çatı Tipi · Banyo-Tuvalet · Duman Egzoz **daldır**, ürün oraya atanır. 04k karesindeki "39 model, üç daldan" cümlesi ölçülmemişti, kaldırılacak. ATEX tek çapraz küme (53 ürün / 4 dal) — senaryo anlatır, faset süzer.
3. Plug Fanlar ve Hücreli Aspiratörler artık ürünlü — menüye girsin mi?
4. Aksesuar ve sürücü modellerinde teknik parametre çoğu zaman boş; slug'da yalnız marka + model + tip kalır. Kabul mü?
7. Multi-tenant (çoklu satıcı) ihtimali — bugünkü önekli şema buna hazır, ayrı karar gerekmiyor.

— DESIGN-MENU (Fable) 2026-09-11

