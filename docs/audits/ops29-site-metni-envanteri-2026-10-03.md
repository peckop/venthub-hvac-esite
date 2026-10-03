# OPS-29 — canlıda müşteriye görünen metinlerin envanteri (2026-10-03)

**Sahip:** BLOG (kart BLG-1) · **Emir:** OPS-29 · **Yöntem:** salt okuma (canlı sayfa HTML'i, veritabanı SELECT, depo kaynağı); alt ajan yok.
**Kural:** canlı metne dokunulmadı. **Cetvel:** `rehber-yazisi-standard.md` R4, `vitrin-metni-standard.md` K1/K2/K4.1/K6/K10, ortak övgü listesi `src/lib/seo/ovguAyikla.ts` (REC-497).
**Önceki çalışma:** SEO-20 (aile ve kategori arama açıklamaları süzgeci; kod tarafı SEO'da, içerik bende), #1664 (marka arama açıklaması), `icerik-hatti-metin-boslugu-2026-09-25.md` (alan doluluğu; tekrar ölçülmedi).

## 1. Yüzey × cetvel

| Yüzey | Canlı adres / kaynak | Ölçülen | Yöneten cetvel | Sahibi |
|---|---|---|---|---|
| Ana sayfa | `/tr` · sözlük `tr.ts` `home` | 1 H1, 10 H2, 28 paragraf (50+ karakter; 6'sı kategori kartı = DB metni, 2'si altbilgi) | **YOK** (K1 yalnız aile ve ürün alanlarını sayar) | URUN (kod), BLOG (metin) |
| Hakkımızda | `/tr/about` | 1 H2, 8 paragraf; meta açıklama | **YOK** | URUN, BLOG |
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

## 3. Ana sayfa ve hakkımızda bulguları (canlı HTML'den, elle okundu)

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

- Ürün açıklamaları (`products.description_i18n`, OPS listesinde yok), EN metinler (yalnız TR okundu), aile `meta_description` (boş döndü), ürün ve aile sayfalarının meta açıklamaları (2 örnek), eski destek konu adreslerinin tek tek durumu.
- Bulguların doğruluk hükmü: B ve E türü Recep'in işletme bilgisidir; teknik iddialar (A) için KATALOG kaynak dizininde okuyacak.
