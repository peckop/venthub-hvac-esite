# OPS-29 — canlıda müşteriye görünen metinlerin envanteri (2026-10-03)

**Sahip:** BLOG (kart BLG-1) · **Emir:** OPS-29 · **Yöntem:** salt okuma (canlı sayfa HTML'i, veritabanı SELECT, depo kaynağı); alt ajan yok.
**Kural:** canlı metne dokunulmadı. **Cetvel:** `rehber-yazisi-standard.md` R4, `vitrin-metni-standard.md` K1/K2/K4.1/K6/K10, ortak övgü listesi `src/lib/seo/ovguAyikla.ts` (REC-497).
**Önceki çalışma:** SEO-20 (aile ve kategori arama açıklamaları süzgeci; kod tarafı SEO'da, içerik bende), #1664 (marka arama açıklaması), `icerik-hatti-metin-boslugu-2026-09-25.md` (alan doluluğu; tekrar ölçülmedi).
**Güncelleme 2026-10-09 (OPS emri, karar 317 sonrası):** #1758 (10-08) bazı ifadeleri kaldırdı. Canlı HTML (TR ve EN; ana sayfa ve hakkımızda) ve master sözlüğü yeniden okundu (salt okuma, canlı metne dokunulmadı). §3'teki **hiçbir satır silinmedi**; bugünkü durumları §3a'da, envanterde olmayan yeni uçlar §3b'de, İngilizce sayfalar §3c'de.

## 1. Yüzey × cetvel

| Yüzey | Canlı adres / kaynak | Ölçülen | Yöneten cetvel | Sahibi |
|---|---|---|---|---|
| Ana sayfa | `/tr` · sözlük `tr.ts` `home` | 1 H1, 10 H2, 28 paragraf (50+ karakter; 6'sı kategori kartı = DB metni, 2'si altbilgi). 10-09 yeniden sayım: aynı | **YOK** (K1 yalnız aile ve ürün alanlarını sayar) | URUN (kod), BLOG (metin) |
| Hakkımızda | `/tr/about` | 1 H2, 8 paragraf; meta açıklama. 10-09 yeniden sayım: 3 H2, 7 paragraf (50+ karakter ölçütüyle); fark sebebi ölçülmedi (ölçüt farkı ya da sayfa değişikliği) | **YOK** | URUN, BLOG |
| Kategori açıklaması | `/tr/category/*` · `categories.metadata` | 24 metin (24 sitemap adresi) | **YOK** | KATALOG (veri), BLOG (metin) |
| Aile açıklaması | aile sayfaları · `product_families.description` | 47 aile; `tr` 47, `bloklar_tr` 37, `maddeler_tr` 38 | K1–K7 (`vitrin-metni-standard`) | KATALOG |
| Marka açıklaması | `/tr/brands/*` · `src/data/brands.ts` | 6 marka; gövde metni değişmedi (#1664 yalnız arama açıklamasını süzdü) | **YOK** | URUN (kayıt), GEO-SEO (arama açıklaması) |
| Bilgi Merkezi | `/tr/bilgi-merkezi` | 1 yazı canlı (frekans konvertörü); eski destek adresi `/tr/destek/merkez` → 308 → bilgi merkezi; `/tr/destek` 404 | `rehber-yazisi-standard` | BLOG |
| Arama açıklamaları | `<meta name="description">` | ana sayfa, hakkımızda, 2 kategori, 2 marka, 2 ürün örneklendi | **YOK** (K1 `meta_description` yalnız aile) | GEO-SEO |
| Ürün açıklaması | `products.description_i18n` | **ölçülmedi** (OPS listesinde yok) | K1–K7 | KATALOG |

## 2. Cetvelde "yapay zekâ kokusu" kuralı var mı? (ölçüldü)

| Cetvel | Sonuç |
|---|---|
| `vitrin-metni-standard.md` | **YOK.** K2 iç not, K4.1 olumsuz iddia, K6 doğrulanmamış teknik değer, K10 dil. Üstünlük/övgü yasağı yok; "yapay zekâ" ifadesi yok. |
| `rehber-yazisi-standard.md` | **Yalnız rehber yazısı için, kısmen:** R4.2 garanti ve üstünlük vaadi yasak; R4.5 kaynaksız olumsuz iddia; R4.6 mevzuat hükmü kaynaksız yazılmaz; karar 106 "yapay zekâ notu konmaz". "Koku" ölçütü tanımlı değil. |

## 3. Ana sayfa ve hakkımızda bulguları (canlı HTML'den, elle okundu; 10-03 durumu, bugünkü durum §3a)

Türler: **A** kaynaksız üstünlük/kıyas · **B** kaynaksız test, sertifika, stok, teslimat, deneyim iddiası · **C** süslü soyut ifade (yapay zekâ kokusu adayı) · **D** vaat · **E** iç bilgi, doğrulanmadı.

| Yer | Metin (kısaltılmış) | Tür | Doğrulama sahibi |
|---|---|---|---|
| Ana sayfa H2 | "Vortice Lineo Quiet: Sessizliğin Geleceği" | C | BLOG |
| Ana sayfa H2 | "Teknik Mükemmeliyet ve Akıllı Akış" · "Hava Akışının Mühendislik Estetiği" · "Mühendislik Hassasiyeti, Operasyonel Güven" | C | BLOG |
| Ana sayfa p | "Minimum enerji tüketimi, maksimum hava transfer verimliliği ve premium sessiz konforun kusursuz dengesi." | A, C | KATALOG |
| Ana sayfa p | "uçtan uca deterministik havalandırma mühendisliği" · "VentHub kürasyonu ile endüstriyel standartlarda…" | C | BLOG |
| Ana sayfa p | "…yüksek statik basınçta bile ultra sessiz operasyon verimliliği sunar." (Lineo Quiet kartı) | A | KATALOG (ses tablosu kaynağı var, "ultra" yok) |
| Ana sayfa H2+p | "Dünya Devlerinin Güvenilir Partneri" · "Dünya devi HVAC markalarının en güncel ve sertifikalı ürün gamını marka güvencesiyle sunuyoruz." (hakkımızda'da aynı cümle) | A, B | Recep (sertifika/yetki belgesi) |
| Ana sayfa p | "Sektörün en güvenilir ve verimli ürünlerini…" · "…en verimli şekilde çözüyoruz." | A | KATALOG |
| Ana sayfa H3+p | "Performans Liderleri" · "Mühendislik ekibimiz tarafından dayanıklılık ve verimlilik testlerinden tam not almış, projelerin amiral gemisi çözümleri." | A, B | KATALOG (test kaydı var mı) |
| Ana sayfa p | "Geniş stok ağımız ve profesyonel lojistik partnerlerimizle … tam zamanında teslimat yapıyoruz." | B, D | Recep |
| Ana sayfa H3+p | "Kesintisiz Teknik Destek" · "uzman kadromuzla sisteminizin ömrü boyunca yanınızdayız." · "Marka ve Garanti Güvencesi" | D | Recep |
| Ana sayfa p | "…sonuçlara saniyeler içinde ulaşır." (hesaplayıcı) | D | URUN (süre ölçülmedi) |
| Ana sayfa p | "Marka alanını pasif logo vitrini olmaktan çıkarıp kalite, güven ve ürün yaklaşımının taşıyıcısı haline getiriyoruz." | C (iç not tonu) | BLOG |
| Altbilgi (her sayfa) | "6 önde gelen marka, 50+ ürün çeşidiyle" | A, bayat sayı riski: veritabanında 442 aktif ürün | URUN |
| Altbilgi (her sayfa) | "Hafta İçi 09:00 – 18:00, Cumartesi 09:00 – 14:00" | E | Recep |
| Hakkımızda p + meta | "15 yılı aşkın saha deneyimimizle…" (meta: "15 yıllık saha tecrübesiyle") · "Avrupa'nın en prestijli markalarını…" | B, A | Recep |
| Hakkımızda p | "operasyonel mükemmeliyet" · "her proje ise bir havalandırma sanatı eseridir" · "zamanında teslimatı hedefliyoruz" | C, D | BLOG |

Toplam: ana sayfa ve hakkımızda için 16 bulgu satırı (bir satırda birden çok cümle olabilir). Doğrulama sahibine göre: **Recep** (işletme bilgisi, sertifika, stok, teslimat, deneyim, çalışma saati) 5 satır; **KATALOG** (teknik üstünlük ve test iddiası) 4 satır; **URUN** (sayı, süre) 2 satır; **BLOG** tek başına düzeltebilir (süslü soyut ifade) 5 satır.

### 3a. 10-09 yeniden sayım — §3'ün 16 satırı canlıda (satır silinmedi)

Kaynak: `venthub.com.tr/tr` ve `/tr/about` canlı HTML'i (2026-10-09) ve master sözlüğü. Satır numarası §3 tablosundaki sıradır.

| §3 satır | Ne | 10-09 canlı | Not |
|---|---|---|---|
| 1 | "…Sessizliğin Geleceği" (H2) | duruyor | |
| 2 | Üç H2: "Teknik Mükemmeliyet…", "Mühendislik Estetiği", "Mühendislik Hassasiyeti, Operasyonel Güven" | duruyor | |
| 3 | "…premium sessiz konforun kusursuz dengesi" | duruyor | |
| 4 | "deterministik havalandırma mühendisliği" · "VentHub kürasyonu…" | duruyor | #1758 yalnız büyük harfli etiketi değiştirdi ("DETERMİNİSTİK SİSTEMLER" → "HAVALANDIRMA ÇÖZÜMLERİ"); cümledeki küçük harfli "deterministik" kaldı |
| 5 | "…ultra sessiz operasyon verimliliği sunar" | duruyor | |
| 6 | "Dünya Devlerinin Güvenilir Partneri" · "Dünya devi HVAC markalarının … sertifikalı ürün gamını…" | **kısmen kalktı** | Başlık 10-08'de #1758 ile "Sunduğumuz Markalar" oldu. "Dünya devi … sertifikalı" cümlesi ana sayfada ve hakkımızda'da duruyor |
| 7 | "Sektörün en güvenilir ve verimli ürünlerini…" · "…en verimli şekilde çözüyoruz" | duruyor | |
| 8 | "Performans Liderleri" · "…testlerinden tam not almış… amiral gemisi çözümleri" | **kısmen kalktı** | Başlık duruyor. İkinci cümle 10-08'de #1758 ile "VentHub ürün ailesinden öne çıkan seçili modeller ve teknik özellikleri." oldu |
| 9 | "Geniş stok ağımız … tam zamanında teslimat" | **kalktı** | 10-08'de #1758 ile "Teslimat Planlaması: Teslimat süresi ve sevkiyat koşulları, teklif aşamasında projenize göre netleştirilir." oldu |
| 10 | "Kesintisiz Teknik Destek" · "…ömrü boyunca yanınızdayız" · "Marka ve Garanti Güvencesi" | duruyor | |
| 11 | "…sonuçlara saniyeler içinde ulaşır" | duruyor | |
| 12 | "…pasif logo vitrini olmaktan çıkarıp…" | duruyor | |
| 13 | Altbilgi "6 önde gelen marka, 50+ ürün çeşidiyle" | duruyor | Sayı bayat: kayıtlı marka 7, aktif ürün 441 (10-09 veritabanı) |
| 14 | Altbilgi çalışma saati | duruyor | Biçim "Hafta İçi: 09:00 - 18:00 / Cumartesi: 09:00 - 14:00"; her sayfada |
| 15 | Hakkımızda "15 yılı aşkın saha deneyimimizle…" · "Avrupa'nın en prestijli…" · meta "15 yıllık saha tecrübesiyle" | duruyor | |
| 16 | Hakkımızda "operasyonel mükemmeliyet" · "havalandırma sanatı eseridir" · "zamanında teslimatı hedefliyoruz" | duruyor | |

**Sonuç:** 16 satırdan 13'ü olduğu gibi, 2'si kısmen (6, 8), 1'i tamamen (9) kalktı. #1758 envanterde ayrı satırı olmayan şunları da kaldırdı: "%92 Optimizasyon" sayacı, "Çok Satanlar" ve "En Çok Tercih Edilenler" adları, "…en çok sipariş edilen, güvenilirliği sahada kanıtlanmış modeller" cümlesi.

### 3b. Yeni uçlar — TR (10-09 canlı okumada bulundu, §3'te yoktu)

| Yer (sözlük anahtarı) | Canlı metin | Tür |
|---|---|---|
| Hero etiketleri (`home.hero.sinevizyon.slides[0..2].eyebrow`) | "İLERİ AERODİNAMİK MÜHENDİSLİĞİ" · "FÜTÜRİSTİK İKLİMLENDİRME" · "HASSAS HVAC SİSTEMLERİ" | C |
| Hero ilk slayt (`slides[0].title`, `.subtitle`) | "Endüstriyel Havalandırma Katmanları" · "Yüksek debili sistemlerde statik balanslı ve akustik optimize edilmiş çözüm eksenleri." | C; ölçüsüz teknik ifade (M3) |
| Hero veri kutuları (`slides[*].products[*]`, `cinematicShowcase.hudStatus`) | "Sistem.Veri.Canlı" (6 kutuda) · "Ultra Sessiz Performans" · "Laminer Akış Kontrolü" · "EC Motor Verimi / Düşük Enerji Tüketimi" · "Yüksek Kapasite" · "Otomasyon Entegrasyonu" | A, C. "Canlı" etiketi sabit sözlük metni; kutunun canlı veri çektiği ölçülmedi |
| Lineo Quiet kartı (`cinematicShowcase.subtitle`, `.cta`) | "Aero-akustik gövde tasarımı ile sessizliğin yeni dijital standardı." · "Yüksek Çözünürlüklü Teknik Verilere Ulaş" | A, C |
| Güven şeridi (`home.hero.trustStrip.*`) | "Dünyaca tanınan markalar" · "Türkiye geneli sevkiyat" | A, B |
| Güven bölümü (`home.trustProof.badge`, `.subtitle`) | "ONAYLI" rozeti (4 kez; kimin onayı belirsiz) · "Her adımda doğrulanabilir kalite ve uzman desteği sunuyoruz." | E; A, D |
| Ana sayfa sayacı (`home.knowledge.statsPipelineLabel`, `home.stats.yearsExperience`; "15+" bileşende sabit) | "Proje Hattı · 15+ · Yıl Deneyim" | B |
| Marka bölümü (`home.strategicBrands.*`, `brands.sectionTitle`, `header.brandTagline`) | "Stratejik Markalar" · "Çalıştığımız markalar sadece logo değil, çözüm mimarisinin temelidir." · "Premium HVAC Markaları" · "HVAC Premium" (üst bilgide marka sloganı) | A, C |
| Hakkımızda sayaçları (`src/views/AboutPage.tsx:43-46`, sözlük dışı sabit değer) | "15+ Yıllık Tecrübe" · "6 Küresel Marka Ağı" · "50+ Ürün Çeşidi" · "81 İl Sevkiyat Ağı" | B. "6" bayat (kayıtlı 7 marka); "50+" yerine gerçek 441 aktif ürün; "81 il" bileşendeki yoruma göre "kargoyla tüm illere sevkiyat vaadi" |
| Hakkımızda hero (`aboutPage.heroBadge`, `.heroTitle` + `.heroTitleItalic`, `.heroDesc`) | "15+ Yıl Mühendislik Deneyimi" · "Havayı Yeniden Tanımlıyoruz" · "…yüksek verimli, teknolojik ve sürdürülebilir havalandırma sistemlerini…" | B, C, A |
| Hakkımızda değerler (`aboutPage.precisionDesc`, `.standardsTitle`) | "…her projeye özel debi, basınç ve verimlilik hesaplamalarıyla…" · "Global Standartlar" | D, C |
| Ana sayfa senaryo kartı (`home.applicationSolutions.items.entrance.description`) | "…hava perdesi keşfini daha anlaşılır hale getirin." (müşteriye değil tasarımcıya yazılmış talimat cümlesi) | M1 |
| Marka kayıtları (`src/data/brands.ts`; 10-09'da yeniden okundu) | Vortice (satır 73): "…dünya lideri… standartları belirliyor" · Avens (86): "Yüksek performanslı…" (kaynak satırı yok) · Nicotra Gebhardt (150): "…dünyanın en geniş ve teknolojik ürün gamına sahip üreticisi" (kaynak satırı yok) · Flexiva (169): "Flexiva marka kaydı katalogda açıldı." (iç durum cümlesi) · Danfoss (137): "%80'e varan" üretici iddiası üreticiye atıf yapılmadan yazılmış | A (Vortice, Avens, Nicotra); M1 (Flexiva); Danfoss'ta üretici iddiasının atfı yok (hangi maddeye girdiği ölçülmedi) |

### 3c. İngilizce sayfalar — bu envanterde ilk kez okundu (10-09, `/en` ve `/en/about`)

§3 ve §3a yalnız TR'yi okumuştu. EN ana sayfada güven bölümünün (`home.trustProof`) 14 anahtarı TR ile aynı anlamı taşımıyor; çoğu editör notu ya da tasarım dili gibi okunuyor (M1, M4):

| Anahtar | Canlı EN metin | Sorun |
|---|---|---|
| `home.trustProof.title` | "We build trust with clear operational realities, not decorative promises." | TR başlığı farklı ("Mühendislik Hassasiyeti, Operasyonel Güven"); "süslü vaat değil" cümlesi karşı-iddia sesi |
| `home.trustProof.subtitle` | "The trust layer on the VentHub homepage should make the verified working model and expert support approach visible." | **Editör notu**: sayfa hakkında "olmalı" diye konuşuyor |
| `home.trustProof.items.brands.*` | "Brand Layer" · "Premium brand selection" · "Represented brands are not only visual assets; they carry solution quality and category credibility." | İç etiket ("Layer"); TR ile farklı anlam; A ("Premium") |
| `home.trustProof.items.guidance.*` | "Expert Layer" · "Engineering-guided direction" · "We aim to move users not only into product lists, but into a more accurate selection flow." | Editör notu |
| `home.trustProof.items.delivery.*` | "Operations Layer" · "Delivery and supply visibility" · "Delivery and supply expectations are made clearer, more predictable and more professional." | Editör notu; #1758 yalnız TR'yi değiştirdi, EN eski kaldı |
| `home.trustProof.items.support.*` | "Continuity Layer" · "Accessible after-sales support" · "Support, quoting and knowledge-center flows are not disconnected; they are parts of the same trust architecture." | Editör notu |
| `home.strategicBrands.subtitle` | "We turn the brand area from passive logo wallpaper into a carrier of quality, trust and product positioning." | M1 (TR'deki "pasif logo vitrini" ile aynı) |
| `aboutPage.heroTitle` + `aboutPage.heroTitleItalic` | "Turkey's Trusted HVAC Platform" + "the Air" → ekranda "Turkey's Trusted HVAC Platform the Air" | **Kırık cümle**; ayrıca A ("Trusted") |
| `home.knowledge.subtitle` | "Guides, calculators and support-center routes help users reach not only products, but a better decision environment." | TR cümlesi bozuk ve farklı ("…sonuçları saniyeler içinde ulaşır") |

Canlıda görünen 160 sözlük anahtarının (TR ya da EN) geri kalanında EN, TR ile aynı anlamı taşıyor; bu karşılaştırma anahtar anahtar yapıldı.

## 4. Kategori, aile, marka bulguları (veritabanı SELECT + depo)

Övgü kalıbı (`OVGU_KALIBI`) aile ve kategori metinlerine **salt okuma ile** uygulandı: **21 ham eşleşme**, elle okununca **9 gerçek iddia**, **12 yanlış alarm**.

| Metin | Yer | Sonuç |
|---|---|---|
| "…asitlere ve korozyona karşı **üstün dayanım** sağlayarak maksimum koruma sunar" | SEAT ve STORM aile `bloklar_tr` + `maddeler_tr` (4 yer), kategori `acid-resistant-fans` (1 yer) | **Gerçek iddia (A)**. BLOG'un 09-25 ölçümü: üretici belgelerinde kimyasal dayanım tablosu yok → kaynaksız |
| "performans, tüketim ve ses arasında **en iyi denge**" | Lineo `maddeler_tr`; hava perdesi `bloklar_tr` ("en iyi dengeyi kurar") (2 yer) | Gerçek iddia (A), kaynak ölçülmedi |
| "…kanal direncinin düşük olduğu yerlerde **en verimli çözümdür**" | kategori `axial-industrial-fans` | Gerçek iddia (A) |
| "VentHub'ın **en geniş kategorisi**" | kategori `fans`, ana sayfa kartı ve meta açıklama | Olgu, sayıyla doğrulanabilir; sayı değişince bayatlar |
| "en küçük model / en büyük model", "en yüksek sürekli çalışma sıcaklığı" | 5 aile (`avens-elektrikli-isiticilar`, `avens-sulu-batarya`, `danfoss-fc101`, `avens-nimax`, `avens-nimus`) | **Yanlış alarm** (teknik olgu) |
| "kapının **yerden yüksekliği**" → "en yüksek"; "ısıtıcılı modellerin **üstünde**", "binanın en **üstünden**" → "üstün" | `air-curtains`, `vortice-hava-perdesi`, `roof-fans` | **Yanlış alarm: kalıp sözcük sınırı gözetmiyor** |
| Marka gövdesi | Vortice: "dünya lideri … standartları belirliyor" (`brands.ts`; üretici sitesinden) | Gerçek iddia (A). #1664 yalnız arama açıklamasından çıkardı, sayfa gövdesinde duruyor |

⚠**GEO-SEO ve SEO-20 için bulgu:** `OVGU_KALIBI` "en yüksek" ve "üstün" için sözcük sınırı kullanmıyor; aile ve kategori açıklamasına olduğu gibi uygulanırsa teknik cümleleri atar (12 yanlış alarmın 3'ü bu iki sebepten: "yerden yüksekliği", "üstünde", "en üstünden"). SEO-20'nin ölçüm adımı bu sayımı kullanabilir.

Yardımcı ölçütler (kural değil, aday; elle okunmadı): "abartılı sıfat" sözcük listesine takılan metin: `bloklar_tr` 17/37, `maddeler_tr` 8/38, aile `tr` 2/47, kategori 3/24; uzun çizgi (—) içeren: 11, 14, 2, 4. Bunlar yapay zekâ kokusunun **sayılabilir adaylarıdır**, kanıtı değil.

## 5. Ölçülmedi

- Ürün açıklamaları (`products.description_i18n`, OPS listesinde yok), EN metinler (10-09'da yalnız ana sayfa ve hakkımızda okundu, §3c; kategori/aile/marka EN okunmadı), aile `meta_description` (boş döndü), ürün ve aile sayfalarının meta açıklamaları (2 örnek), eski destek konu adreslerinin tek tek durumu.
- Bulguların doğruluk hükmü: B ve E türü Recep'in işletme bilgisidir; teknik iddialar (A) için KATALOG kaynak dizininde okuyacak.
