# Rehber Yazısı Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** Bilgi niyetli teknik yazının (rehber) konusu nasıl seçilir, hangi kaynaktan
> araştırılır, nasıl yazılır, nasıl doğrulanır, Recep'e nasıl sunulur, yayından sonra nasıl ölçülür.
> **Niçin var:** Karar 62 (2026-09-22, ORTA YOL): planlı üretim + Recep onayıyla yayın; akademik ve
> resmî kaynaklı teknik yazılar kapsamda; **kaynak gösterimi zorunlu, uydurma atıf = kırmızı.**
> Tetik ölçüm (OPS, 2026-09-24): bir rakibin tek yazısı ("elektrostatik filtre nedir", 2.561 kelime,
> 17 kaynak) üç günde birinci sayfaya çıktı; o şirket bu ürünü satmıyor. VentHub'da bugün bilgi yazısı
> yok ve Search Console'da bilgi niyetli arama **2 gösterim** (R1).
> **Doğrulama gerekçesi sıralama DEĞİL doğruluktur:** biz sattığımız ürünü anlatıyoruz; yanlış değer
> yanlış satıştır (2026-09-06 vitrin emsali → `vitrin-metni-standard.md`).
> **Sahibi:** BLOG şeridi (konu, araştırma, yazım, doğrulama, ölçüm). Sayfa, tablo, adres, JSON-LD:
> URUN şeridi. Sıra ve Recep'e götürme: OPS.
> **Kayıt:** REC-369 (F0–F5 iş sırası OPS yorumunda, 2026-09-24).
> **İlgili cetveller:** `vitrin-metni-standard.md` (K2 not deseni, K4.1 olumsuz iddia, K10 dil) ·
> `catalog-ingestion-standard.md` §6.3 (kaynak dizini; PDF açılmaz) · `rendering-cache-standard.md`
> (§2 fiyat yüzeyi, §3 tazeleme) · `adres-semasi-standard.md` (yer kararı sonrası satır) ·
> `canonical-url-standard.md`.

**Ad notu:** kayıttaki ilk ad `icerik-hatti-standard.md` idi, kullanılmadı. "İçerik hattı" KATALOG'un
aile açıklaması hattının adıdır (`scripts/icerik-hatti/**`, REC-146); iki ayrı iş aynı adı taşımasın.

**Durum:** TASLAK. plan-challenger denetimi yapılmadan ve R6'daki yer kararı verilmeden yazı yayınlanmaz.

---

## R0 — Kapsam

| Metin | Yöneten cetvel |
|---|---|
| Rehber yazısı: "nedir, nasıl çalışır, nasıl seçilir, nasıl hesaplanır" sorusuna cevap veren, tek konulu, kaynaklı yazı | **bu dosya** |
| Ürün/aile açıklaması, blok metinleri, meta alanları | `vitrin-metni-standard.md` |
| Destek süreç sayfaları (SSS, iade, kargo, garanti) | kapsam dışı (süreç metni, teknik yazı değil) |

Rehber yazısı ürün satmaz, soruyu cevaplar; ürüne **bağlantı** verir (R3). Vitrin-metni cetvelinin
K2 (iç not yasağı), K4.1 (olumsuz iddia) ve K10 (dil) maddeleri rehber yazısına **aynen** uygulanır.

## R1 — Konu seçimi

### R1.1 Kaynaklar ve neyi gösterip neyi göstermedikleri

| Kaynak | Ne söyler | Neyi söyleyemez | Durum 2026-09-24 |
|---|---|---|---|
| Search Console (hizmet hesabı, `scripts/gsc/gsc-token.cjs`) | Google'ın bizi **zaten gösterdiği** aramalar, sıra, tık | Göstermediği aramalar — bilgi yazısı olmayan sitede bilgi talebi **görünmez** | ÇALIŞIYOR; veri 2026-08-28'de başlıyor |
| Google arama önerisi (`suggestqueries.google.com`, ücretsiz) | İnsanların yazdığı sorgular | **Hacim** (sıra hacim değildir) | ÇALIŞIYOR |
| Ads Anahtar Kelime Planlayıcı | Aylık arama hacmi | — | YOK (pazar ölçüm düzeni kol 2, Recep hesap adımı) |
| Site içi sonuçsuz arama günlüğü (karar 87) | Sitemizde aranıp bulunamayan | Site dışı talep | URUN kuruyor |
| Teklif kayıtları, müşteri soruları, Recep'in saha bilgisi | Gerçek alıcının sorusu | Hacim | elle |

⚠**Yokluk kanıt değildir.** F1'de (2026-09-24) Search Console'da bilgi niyetli sorgu 2 gösterim verdi.
Bu "talep yok" demek değil; aynı konular için Google arama önerisi 16 tohumda toplam 93 bilgi
niyetli öneri döndürdü (ör. "hava perdesi" tek başına 16). Search Console, yazı yayımlanana kadar bilgi
talebini ölçemez; konu seçimi en az bir **dış** kaynağa dayanır.

### R1.2 Ölçütler (konu başına tablo, Recep'e özetle gider)

| # | Ölçüt | Nereden |
|---|---|---|
| a | Google bizi o konuda zaten gösteriyor mu (küme gösterimi, sıra) | Search Console, sorgu+sayfa |
| b | Dış bilgi talebi (öneri sayısı; kol 2 gelince hacim) | arama önerisi / Ads |
| c | Katalogda o konuda satılan aile var mı, kaç tane | DB: `product_families` × `categories` |
| d | Sitede ilgili hesaplayıcı var mı | `/destek/hesaplayicilar/*` (bugün: kanal, hrv, hava-perdesi, jet-fan) |
| e | Kaynak dizininde üretici belgesi var mı (sayfa sayısı) | `sayfalar.jsonl` |

Satılan ailesi olmayan konu (c = 0) yasak değildir ama sıranın sonuna gider: iç bağlantı ve satış
karşılığı yoktur. Bu, rakip emsaliyle bilerek ayrışan bir tercihtir.

### R1.3 Konu başına TEK yazı

Aynı sorguya iki yazı yarışmaz. Yeni konu açılmadan önce Search Console'da sorgu+sayfa kırılımıyla o
küme için mevcut sayfa aranır; varsa yeni yazı değil **o yazının genişletilmesi** yapılır.

## R2 — Kaynak

### R2.1 Öncelik sırası

1. **Üretici belgesi** — kaynak dizininden okunur (`<ingestor>/kaynak-dizini/sayfalar.jsonl`).
   ⛔PDF doğrudan açılmaz; dizinde yoksa önce dizine eklenir (`catalog-ingestion-standard.md` §6.3, §6.5).
2. **Resmî kurum ve mevzuat** — Resmî Gazete, bakanlık, TSE; uluslararası: EPA, DOE, AB mevzuatı.
3. **Akademik ve meslek kuruluşu** — hakemli yayın, üniversite, ASHRAE, REHVA.
4. **Diğer** — sektör yayını. Yalnız bağlam için; **sayı bu sınıftan alınmaz**.

**Kaynak olmayanlar:** rakip sitesi, forum, yapay zekâ cevabı (ChatGPT, Gemini, Perplexity dahil),
kaynağı gösterilmeyen blog. Ücretli standardın (EN, ISO) yalnız adı ve kapsamı anılır; içindeki sayı,
kurumun herkese açık bir özetinde geçmiyorsa yazılmaz.

### R2.2 Kaynaksız sayı yok

Metindeki her sayı, birim, oran ve teknik iddia en az bir kaynağa bağlıdır. **Açılmamış kaynak atıf
alamaz:** doğrulayıcı (R5) her adresi kendisi açar ve atfedilen ifadeyi içinde bulur. Bulamazsa
atıf kalkar, cümle ya kaynağa uydurulur ya silinir.

### R2.3 Müşteriye görünen atıf biçimi

- Metin içinde numara: `[1]`. Yazının sonunda "Kaynaklar" listesi: yayıncı · başlık · (belge sayfası) ·
  adres · erişim tarihi.
- Kaynak dizini atfı müşteriye **üretici belgesinin adı ve sayfasıyla** görünür (ör. "Vortice, AIR DOOR
  kataloğu, s. 12"); üreticinin herkese açık PDF adresi varsa verilir. Dizin yolu ve hash'i yalnız iç
  doğrulama kaydında kalır (URUN ile netleşti, 2026-09-24).
- `[s.41]`, `[DB]`, `[MANIFEST]` biçimleri iç nottur, vitrine girmez (`vitrin-metni-standard.md` K2/5).

## R3 — Yazı kalıbı

Kalıp rakip ölçümünden çıkarıldı (OPS, 2026-09-24): birinci sayfadaki yazı tek sayfada bütün yan
soruları cevaplıyor, resmî kaynak gösteriyor ve Türkçede rekabet zayıf. Kelime sayısı **hedef değildir**;
ölçüt, konunun yan sorularının cevaplanıp cevaplanmadığıdır.

| Bölüm | Kural |
|---|---|
| H1 | Aranan soru ya da konu adı |
| Doğrudan cevap | İlk 2–3 cümle sorunun cevabı; giriş cümlesi yok |
| Gövde | 12–15 H2; konuya uyanlar seçilir: nedir / nasıl çalışır · türleri · uygulamalar · seçim ve boyutlandırma · hesap örneği (+ hesaplayıcı bağlantısı) · alternatiflerle kıyas · montaj · bakım · güvenlik ve mevzuat · fiyatı belirleyen etkenler · izlenecek yol |
| Tablo | En az bir (kıyas ya da boyutlandırma) |
| Fiyat | **Rakam yok.** "Fiyatı belirleyen etkenler" bölümü etkenleri anlatır; fiyat yalnız ürün sayfasında görünür (`rendering-cache-standard.md` §2) |
| SSS | 5–8 soru; her cevap tek başına anlamlı |
| İç bağlantı | İlgili ürün aileleri (kart, fiyatsız) · ana kategori · varsa hesaplayıcı. Ters yön (kategoriden yazıya) URUN'un sayfa işi |
| Kaynaklar | R2.3 |
| Teknik sorumluluk notu | Sabit metin, sözlükten: yazı genel bilgidir, proje hesabının yerini tutmaz |
| Tarih | Yayın ve güncelleme tarihi görünür |

**Üslup:** sade Türkçe; SI birimleri (m³/h, Pa, kW); ondalık virgül; kısaltma ilk geçişte açılır.
**Dil:** TR önce. EN ayrı yazılır ve aynı doğrulamadan geçer; EN yoksa EN sayfa **yoktur** (başka dile
düşme yasak, `vitrin-metni-standard.md` K10).

## R4 — Yasaklar

1. **Toplu üretim yok.** Google spam politikası: *"Scaled content abuse is when many pages are generated
   for the primary purpose of manipulating search rankings and not helping users."* Örnekleri arasında:
   *"Using generative AI tools or other similar tools to generate many pages without adding value for
   users"* (developers.google.com/search/docs/essentials/spam-policies, erişim 2026-09-24). Yazılar tek
   tek, konu başına araştırılarak üretilir; R5 doğrulaması atlanamaz.
2. **Garanti ve üstünlük vaadi yok** ("en iyi", "%100", "kesin çözüm").
3. **Rakip adı ve kötüleme yok.** Kıyas ürün tipleri arasında yapılır, firmalar arasında değil.
4. **Taslak ve editör notu vitrine girmez** (`vitrin-metni-standard.md` K2 deseni, R8 kapısı).
5. **Olumsuz iddia kaynakta açıkça yoksa yazılmaz** ("içermez", "gerekmez"; K4.1). Kaynağın sessizliği kanıt değildir.
6. **Mevzuat hükmü** ("zorunludur") yalnız resmî metne atıfla ve yürürlük tarihiyle yazılır.
7. **Kişi ve proje adı yok** (müşteri, şantiye, teklif).
8. **Yayından önce metin herkese açık başka bir adreste durmaz.** Depo PUBLIC; taslak, iddia tablosu ve
   doğrulama kaydı yayından önce depoya girmez (Linear kaydı ya da veritabanı taslak durumu).

## R5 — Doğrulama (ajanlarda)

Recep metni satır satır okumaz. Doğruluğu ajan düzeni taşır; Recep'e özet gider (R5.3).

### R5.1 Akış

| Adım | Kim | Çıktı |
|---|---|---|
| 1. Araştırma | Sonnet alt ajan × N (konu eksenlerine bölünür) | Kaynak listesi + her kaynaktan alıntılanmış ifadeler |
| 2. Yazım | BLOG | Taslak + **iddia tablosu** (her iddia → kaynak no + birebir alıntı) |
| 3. Bağımsız doğrulama | **Fable 5.1 alt ajan**, yazımı yapmamış | Her iddia için: DOĞRULANDI / DESTEKSİZ / ÇELİŞİYOR; her kaynağı **kendisi açar** |
| 4. Düzeltme | BLOG | DESTEKSİZ ve ÇELİŞİYOR satırları düzeltilir ya da silinir |
| 5. İkinci tur | aynı doğrulayıcı, yalnız değişen satırlar | 0 / 0 |

Doğrulayıcı ayrıca bakar: birim ve dönüşüm (m³/h ↔ l/s), sayının kaynaktaki bağlamı (model mi, seri
mi), olumsuz iddia (K4.1), cümle içinde **her iddianın ayrı** doğrulanması (bir yarısı doğru diye cümle
geçmez — K4.1 ölçülmüş vakası). Doğrulama tek tek alt ajanla yapılır; çok ajanlı Workflow yalnız Recep
isterse (karar gereği opt-in).

### R5.2 Kabul

- DESTEKSİZ = 0 · ÇELİŞİYOR = 0 · açılamayan kaynak = 0.
- Kaynak listesindeki her numara metinde kullanılmış, metindeki her numara listede var.
- K2 not deseni gövde + SSS + kaynak listesinde 0 eşleşme.

### R5.3 Recep'e sunum

Metin değil özet, BLOG penceresinde, düz cümleyle: konu ve neden bu konu (R1.2 tablosu), kaynak sayısı
ve türleri, iddia sayısı ve doğrulanan, bağlanan ürün aileleri, önizleme bağlantısı, tek soru:
**"yayınlayalım mı?"** Onay Recep'in kendi sözüyle ve bu pencerede alınır; başka pencereden aktarılan
söz onay sayılmaz.

## R6 — Yer ve teknik gereklilikler (uygulayan URUN)

**Yer: Recep kararı bekliyor.** URUN olguları topladı (REC-369, 2026-09-24): A — Bilgi Merkezi kendi
klasöründe (`/tr/bilgi-merkezi`, `/en/knowledge-hub`; 8 kalıcı yönlendirme) · B — bugünkü yerinde
(`/tr/destek/konular/...`). URUN önerisi A. Karar verilince adres satırı `adres-semasi-standard.md`'ye
girer, bu bölüm güncellenir.

İki seçenekte de aynı olan şartlar:

| Şart | Gerekçe / ölçüm |
|---|---|
| Sayfa sunucuda üretilir; ziyaretçi ve arama botu **aynı HTML**'i alır | Rakibin bota ayrı sayfa vermesi bizde yok |
| Gövde markdown; sunucuda, izin listeli etiketlerle render | URUN ile netleşti, 2026-09-24 |
| JSON-LD: `Article` + `BreadcrumbList` | Google: *"Article objects must be based on one of the following schema.org types: Article, NewsArticle, BlogPosting."* `TechArticle` bu listede yok (ölçüldü 2026-09-24); OPS emrindeki TechArticle'dan **sapma** budur. Önerilen alanlar: `author`, `dateModified`, `datePublished`, `headline`, `image` |
| JSON-LD: `FAQPage` isteğe bağlı | Google SSS zengin sonucunu 2023'ten beri *"only shown for well-known, authoritative government and health websites"*. Bizde arama sonucunda SSS görünmez; işaretlemenin başka kazancı **ölçülmedi**. SSS bölümü okuyucu için kalır |
| Site haritasında her yayındaki yazı; `lastmod` = güncelleme tarihi | Bugün 3 destek konusu site haritasında yok (URUN ölçümü) |
| `hreflang` yalnız iki dil de varsa; kanonik adres tek | `canonical-url-standard.md` |
| Tablo `tenant_id` taşır; ziyaretçi rolü yalnız **yayında** olanı okur | Kural 12; koruma veri düzeyinde, kodla süzme yetmez (`vitrin-metni-standard.md` K1) |
| Tablonun DB tetiği + webhook dalı + `rendering-cache-standard.md` §3 tablosuna satır | Yoksa yazı değişir, sayfa değişmez (§3) |
| Migration kural 13 (Recep onayı, URUN penceresi) | Migration merge = prod |

## R7 — Ölçüm (yayından sonra)

- **1. hafta:** indekslendi mi (Search Console URL denetimi).
- **4 hafta, haftalık:** sayfa bazında gösterim, tık, ortalama sıra; hedef küme sorguları.
- **Taban:** F1 küme rakamları (Ölçüm geçmişi). Kıyas aynı sorgu ve aynı gün sayısıyla yapılır.
- Sonuç bu cetvele geri yazılır (hangi kalıp, hangi uzunluk, hangi kaynak türü işe yaradı).
- Sayısal hedef yazılmadı: 25 günlük, 448 gösterimlik tabanla hedef koymak tahmin olurdu. İlk dört
  yazının ölçümü tabanı oluşturur.
- Sorgu listeleri PUBLIC depoya girmez; depoya yalnız özet sayılar, sorgular Linear kaydına.

## R8 — Kapılar

⚠**Bugün bu cetveli zorlayan hiçbir otomatik kapı yok.** Aşağıdakiler ilk yazı yayından önce kurulur;
biri eksikse yayın yapılmaz.

| Kapı | Ne ölçer | Nerede | Sahip | Durum |
|---|---|---|---|---|
| Not deseni | K2 deseni gövde + SSS + kaynak listesinde 0 | yazma anında (yazıcı betik ya da tablo kısıtı) | BLOG + URUN | YOK |
| Kaynak bütünlüğü | Yayındaki yazının kaynak listesi boş değil; metin ↔ liste numaraları birebir | yazma anında + test | BLOG | YOK |
| Doğrulama kaydı | DESTEKSİZ = 0 olmadan durum "doğrulandı"ya geçmez | yazıcı betik | BLOG | YOK |
| Taslak görünmezliği | Ziyaretçi rolüyle taslak okunamaz | RLS testi (anon rolüyle) | URUN | YOK |
| JSON-LD + site haritası | Yayındaki her yazı haritada; `Article` + `BreadcrumbList` sunucu HTML'inde | test | URUN | YOK |
| Tazeleme | Tablo `rendering-cache-standard.md` §3'te; INV-RENDER-2 okur | mevcut kapı | URUN | tablo gelince otomatik |

## R9 — Ritim

Orta yol: planlı üretim. Başlangıç önerisi **haftada bir yazı**, ilk dört yazının R7 ölçümü bitene
kadar; sonra ölçüme göre artırılır. Ritim Recep'in tercihidir; bu satır öneridir.

---

## Ölçüm geçmişi

| Tarih | Ölçüm | Sonuç |
|---|---|---|
| 2026-09-24 | Rakip yazı (OPS) | 2.561 kelime · 15 H2 · 8 SSS · 17 kaynak; Türkçe rakipler 433–1.565 kelime, 0 kaynak |
| 2026-09-24 | F1 Search Console (BLOG) | Veri 2026-08-28'de başlıyor (25 gün): 34 tık · 448 gösterim · ort. sıra 28,0 · sorguda görünen gösterim %50, tık %26 · bilgi niyetli sorgu 2 gösterim |
| 2026-09-24 | F1 konu kümeleri (BLOG) | Frekans konvertörü 57 gösterim / 0 tık / sıra 44 · endüstriyel-aksiyel fan 32 / 0 / 81 · kanal tipi fan 8 / 0 / 65 · hava perdesi 7 / 0 / 75 |
| 2026-09-24 | F1 arama önerisi (BLOG, 16 tohum × 6 ek) | En çok bilgi niyetli öneri: hava perdesi 16 · havalandırma hesabı 13 · fan seçimi 11 · elektrostatik filtre 9 · frekans konvertörü 8 · jet fan 8 |
| 2026-09-24 | Google belgeleri (BLOG) | Article türleri: Article/NewsArticle/BlogPosting · SSS zengin sonucu yalnız resmî ve sağlık siteleri · toplu içerik spam politikası |

Sorgu dökümü ve konu aday sıralaması REC-369 BLOG F1 yorumunda (2026-09-24).
