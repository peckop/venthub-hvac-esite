# "Sessiz fan" arama görünürlüğü ölçümü (SEO-53, karar 375)

> **Sahibi:** GEO-SEO · **Ölçüm günü:** 2026-10-15 gece (TR) · **Cetvel:** `docs/standards/pazar-olcum-standard.md`
> (P2 ön veri, **P6 depoya girmeyen veri**), `docs/standards/yayin-gorunurluk-denetim-standard.md` Y2.1,
> `docs/standards/rehber-yazisi-standard.md` · **Tazelik:** yayından sonra 3., 7. ve 14. günde yeniden ölçülür.
>
> **P6 notu (okuyucu için):** depo herkese açıktır. Bu dosyada sorgu listesi, hedef anahtar kümesi, rakip adı ve
> adresi **yoktur**; yalnız yöntem ve özet sayılar vardır. Ayrıntı Kanban kartlarındadır: SEO-53 (ölçüm, küme,
> rakip tablosu), BLG-15 (rehber brifi), URN-135 (kategori ve Lineo Quiet sayfası brifi).

## 1. Soru

Karar 375: "sessiz fan" aramasında Google ilk sayfasında görünmek. Bunun için (a) bugün hangi sorgularda ve hangi
sayfamızla görünüyoruz, (b) gerçek Türkiye sonuç sayfasında ilk sayfayı kim tutuyor ve nasıl sayfalarla, (c) hangi
sorgu kümesi gerçekçi, (d) yayına giren rehber ve ürün/kategori sayfaları ne taşımalı.

## 2. Yöntem

| Adım | Ne yapıldı | Kaynak ve sınır |
|---|---|---|
| Kendi görünürlüğümüz | Search Console arama analitiği, hizmet hesabı API'si, 2026-07-15 → 2026-10-12, `dataState=all`. Sorguda "sessiz", "quiet", "lineo", "kanal fan", "aspiratör", "banyo fan", "duct fan", "inline" geçen satırlar (sorgu × sayfa) ve adresinde "sessiz", "quiet", "lineo" geçen sayfalar (sayfa × sorgu) | OPS emri tarayıcıyı önermişti; aynı mülk ve aynı veri API'den okundu, çünkü süzgeçli sorgu satırlarını dar arayüz bölmesinde güvenilir okumak mümkün değil (sapma kartta yazılı). Mülk 2026-08-28'de kuruldu: pencerenin gerçek uzunluğu ~6 hafta |
| Gerçek SERP | Google Türkiye, oturumsuz (`hl=tr`, `gl=tr`, `num=10`, `pws=0`), yerleşik tarayıcıdan, 13 sorgu: hedef 5 + ek 8 (havalandırma, "nasıl seçilir", dB niyeti). Her sorgunun organik başlık ve adres listesi alındı; yapay zekâ özeti ve reklamlar sayılmadı | Sıralama tek alımdır (2026-10-15 gece), kişiselleştirme kapalı; SERP günden güne oynar |
| Sayfa yapısı | İlk sayfada çıkan 25 rakip sayfa (kategori/ürün 16, rehber/blog 9 geçerli) ile kendi 3 sayfamız canlı çekildi: title, meta açıklama, H1/H2, JSON-LD türleri, görünür kelime sayısı, "sessiz" geçiş sayısı, SSS var mı | Sunucu HTML'i (JavaScript çalıştırılmadı): Googlebot'un ilk gördüğü içerik. İki rehber adresi (404 verenler) sayıma girmedi |
| Kendi sayfalarımız | Kategori ve Lineo Quiet aile sayfası aynı yöntemle çekildi; ÜRÜN'ün 15 Ekim ölçümüyle karşılaştırıldı (kelime sayısı ve "sessiz" sayısı birebir tutuyor) | OPS-157'nin "kategoride 'sessiz' 0" ölçümü bu yöntemle doğrulanmadı: sunucu HTML'inde **2** (ÜRÜN da aynı sonucu buldu) |

## 3. Bulgular (özet sayılar)

### 3.1 Bugünkü görünürlüğümüz

- Hedef sorgu ailesinde son ~6 haftada **toplam 8 gösterim, 0 tık**. Genel "sessiz fan" aramasında **gösterim 0**.
- Görünen iki sayfa: kanal tipi fanlar kategorisi ("sessiz" içeren sorgularda ortalama sıra 46 ile 82 arası) ve
  Lineo Quiet ürün sayfası (marka sorgusunda sıra 2 ile 24 arası, birkaç gösterim).
- Lineo Quiet ürün sayfası şu an **308 ile yeni adrese** (adında "sessiz-kanal-fanlari" geçen) gidiyor; gösterimlerin
  tamamı eski adreste. Google'ın yeni adresi yeniden değerlendirmesi sürüyor.

### 3.2 İlk sayfa kimin elinde

| Sorgu sınıfı | İlk sayfanın bileşimi | Bizim için anlamı |
|---|---|---|
| Genel "sessiz fan" | Çoğunluğu pazar yeri ve fiyat karşılaştırma sayfaları, forumlar, bir iki HVAC kategori sayfası; niyet karışık (bilgisayar fanı, vantilatör, soğutucu, HVAC) | Üretici/bayi kategori sayfası ancak "kanal/aspiratör" bağlamıyla girer; hafta sonunda ilk sayfa **beklenti değil, hedef** |
| "Sessiz kanal fanı / kanal tipi fan" | Kategori sayfaları (bayi ve üretici), ince; ürün ve video | Rakipler zayıf ve şemasız; bizim kategori sayfamız başlığında "sessiz" taşımıyor |
| Marka/model (Lineo Quiet) | Üretici ve yetkili satıcı sayfaları, blog yazıları | Ürün sayfamız zaten görünüyor; adres değişikliğinin oturması gerekiyor |
| "Banyo fanı / aspiratör" sınıfı | Pazar yerleri ve banyo fanı satıcıları | Lineo Quiet bir **kanal** fanıdır; niyet uyumsuz. Uygun ürün ailesi yoksa hedef dışı |
| "Nasıl seçilir / kaç dB" (bilgi) | Küçük bayi ve üretici blogları, forumlar | Rehber için **açık alan**: rakip rehberler kısa ve tek tek şemasız |

### 3.3 Rakip sayfa yapısı (ilk sayfada çıkanlar, sunucu HTML'i)

| Ölçü | Kategori/ürün sayfaları (n=16) | Rehber/blog sayfaları (n=9) | Bizim kategori | Bizim Lineo Quiet |
|---|---|---|---|---|
| Görünür kelime, medyan (en az – en çok) | 585 (175 – 1514) | 665 (368 – 2682) | 588 | 624 |
| "sessiz" geçiş sayısı, medyan | 7,5 | 8 | 2 | **0** |
| Title'da "sessiz" | 14 / 16 | 6 / 9 | **yok** | **yok** |
| H1'de "sessiz" | 8 / 16 | 4 / 9 | **yok** | **yok** |
| JSON-LD var | 4 / 16 | 8 / 9 | CollectionPage + BreadcrumbList | ProductGroup + BreadcrumbList |
| Görünür SSS bölümü | 0 / 16 | 2 / 9 | var | **yok** |
| En az 3 H2 | 4 / 16 | 8 / 9 | 6 | 3 (tekrarlı) |

Okuma: çıta düşük. Rakipler ya ince kategori sayfası ya kısa blog; bizim sayfalarda eksik olan **kelimenin
kendisi** (title, H1, ilk metin, ses verisi bloğu), uzunluk ya da şema değil.

### 3.4 Kendi sayfalarımızdaki teknik bulgular (URN-135'e)

- Lineo Quiet aile sayfasında iki H1 var ve ikisi aynı metin; H2'ler ("Genel Bilgiler", "Teknik Özellikler",
  "Modeller") sunucu HTML'inde iki kez geçiyor.
- Aynı sayfanın meta açıklaması cümle ortasında "…" ile kesiliyor.
- Kategori sayfası iki adresten 200 veriyor; kanonik doğru adrese işaret ediyor (sorun değil, izlenecek).
- Kategori sayfasında "sessiz" 2 kez geçiyor ama dB(A) değeri hiç yok: ses **anlatısı** var, ses **verisi** yok.

## 4. Gerçekçilik değerlendirmesi (ölçülmüş olanla ölçülmemiş ayrı)

- **Ölçülmüş:** yukarıdaki sayılar. **Ölçülmemiş:** yeni içeriğin Google'da kaç günde nerede duracağı; domainin yaşı
  (mülk 6 hafta) ve sıfır tıklama geçmişi göz önüne alınırsa "18 Ekim yayın = 18 Ekim ilk sayfa" sözü verilemez.
- İlk sayfaya en yakın küme sırasıyla: marka/model sorguları → "sessiz kanal fanı / kanal tipi fan" → "nasıl seçilir"
  bilgi sorguları → genel "sessiz fan". Genel "sessiz fan" pazar yeri ve forum ağırlıklıdır; oraya kategori sayfası +
  rehberin birlikte etkisi gerekir.
- Yayın, ölçüm planıyla birlikte düşünülmeli: 3. gün (21 Ekim), 7. gün (25 Ekim), 14. gün (1 Kasım).

## 5. Öneri özeti (ayrıntı kartlarda)

1. **Rehber (BLOG, BLG-15):** bilgi niyetine cevap veren, ses gücü ile ses basıncı farkını ve koşullu dB(A) okumayı
   anlatan, Lineo Quiet'i örnek alan, soru başlıklı, görünür SSS'li yazı; kategori ve ürün sayfalarına iç bağlantı.
2. **Kategori ve Lineo Quiet sayfası (URUN, URN-135):** başlık, H1, ilk paragraf ve meta açıklamada "sessiz"in doğal
   geçmesi; Lineo Quiet sayfasında koşullu ses verisi bloğu ve görünür SSS; çift H1/H2 ve kesik açıklamanın
   düzeltilmesi. Yeni adres açılmaz (karar 374).
3. **Yayın günü (GEO-SEO, Y2.1):** değişen/yeni üç adres için canlı doğrulama, IndexNow, Google dizin isteği, Bing
   URL Gönder, harita `lastmod` kontrolü; sonuç SEO-53 kartına.
4. **Ölçüm:** aynı sorgu kümesi ve aynı SERP yöntemiyle 3/7/14. gün okuması; sonuç kartta (P6).

## 6. Ölçüm geçmişi

| Tarih | Ölçüm | Sonuç | Sınıf |
|---|---|---|---|
| 2026-10-15 | İlk taban: Search Console 2026-07-15 → 2026-10-12, SERP 13 sorgu, 25 rakip + 3 kendi sayfa yapısı | 8 gösterim, 0 tık; ilk sayfada sayfa tipi/kelime/şema tabloları (bkz. 3.3) | A |
