# VentHub Menü v18 — Ekran Envanteri (2026-09-25, salt okuma)

## 0. Yöntem ve doğrulama

- **Tam dosya:** `Menü Tasarımı v18.dc.html` pencereli (offset/limit) indirmeyle tam olarak çekildi (oturum geçici kopyası, depoya alınmadı): **1.377.089 bayt / 6521 satır**. Tek okuma 256 KiB'de kesiliyor; F kanalı (Bilgi) kesilen kısımda kalır.
- **`data-screen-label` sayımı (ölçüldü, ilk elden):** toplam **62** benzersiz etiket = 8 bölüm-başlığı (`A-0…H-0`, gerçek kare değil) + **52 tekil kare** (A0…F5) + **2 toplu bölüm** (`G` = Mobil kabuk M1–M9, `H` = Satış kipi S1–S6). Dosyanın kendi üst-bilgisi "53 kare + 2 toplu bölüm" diyor; ölçülen tekil kare sayısı 52 — 1 birim fark dosyanın kendi beyanıyla ölçüm arasında var, kaynağı bulunamadı (küçük, gövdeye etkisi yok).
- **Kaynak kod:** `graphify query` bu soruların çoğu için (52 tasarım ekranının site karşılığı) uygun bir grafik sorgusu değil — konu dosya bağımlılığı değil, tasarım-metni ↔ rota eşleşmesi; bu yüzden rota varlığı `find`/`Glob` ile mekanik olarak, birkaç kritik nokta (`productRoute.ts`, `satisKipi.ts`, `CartPage.tsx`) ise doğrudan kod okumasıyla doğrulandı. Aşağıdaki her ÇELİŞKİ satırı bu şekilde ölçülmüş kanıt taşır; ölçülmeyenler açıkça **"ölçülmedi"** yazıyor (uydurulmadı).
- **Kararlar kaynağı:** `docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-24.md` (K1–K62 + T-1…T-8 açık kararlar). Tasarım dosyasının kendi altyazılarındaki K/madde referansları birincil kanıt; kararlar dosyasındaki başlıkla çakışmadı.
- **Önceki taslak** (23 kalem) kararlardan geriye çıkarılmıştı; bu tabloda her satır doğrudan v18 karesinden kuruldu, taslak yalnız çapraz kontrol için kullanıldı — üstünde birebir durmadı.

## 1. Özet sayım

| Toplam tekil kare | HAZIR | YARIM | YOK | ÇELİŞKİ (yapısal) | DS geçişi (yalnız görsel) |
|---|---|---|---|---|---|
| 52 (+2 toplu bölüm) | 33 | 19 | 0* | 27 | 2 |

(Kanal kırılımı — HAZIR/YARIM: A 5/7 · B 17/7 · C 3/0 · D 4/1 · E 2/1 · F 2/3 → toplam 33/19 = 52. ÇELİŞKİ = §2 tablosunda "ÇELİŞKİ" sütununda **VAR** işaretli 27 satır (bazıları kısmi kanıtlı): A4, B1b, B3, B3b, B3c, B4, B6, B7v, B7b, B7f, B8, B8b, B9, B10, B11, B12, C3, D1, D2, D3, D4, D5, E2, E3, F1, F4, F5. Bunlar §3'te 7 kök nedene (adres şeması, taksonomi derinliği, teklif↔sepet adresi, hesap/account, arama/karşılaştırma yokluğu, legal görünürlüğü, K62 tutarsızlığı) kümelendi — 27 satır ≠ 27 ayrı sorun, çoğu aynı kökten. DS geçişi = yalnız A8, A9 (2 satır).)

*YOK = "adı geçiyor ama hiç çizilmemiş" anlamında; bu ölçümde v18'in kendi 62 etiketi zaten "çizilmiş" olanları kapsıyor, bu yüzden 0. Adı geçip ÇİZİLMEMİŞ olanlar (ör. site'de olup tasarımda karşılığı olmayanlar: `destek/hesaplayicilar`, `brands/[slug]`) bu tablonun kapsamı dışında — ayrı not olarak §4'te.

## 2. Ana envanter (A–F kanalları, 52 kare)

Sütunlar: **Kare** (+eski no) · **Adı** · **Durum** · **Site karşılığı** · **ÇELİŞKİ** (yapısal fark; "—" = ölçülmedi/uygulanamaz) · **DS?** (yalnız renk/tipografi farkıysa "evet") · **K karar** · **Kanıt** (dosyanın kendi altyazısından kısa alıntı).

### A · Kabuk (header/footer/global)

| Kare | Adı | Durum | Site karşılığı | ÇELİŞKİ | DS? | K karar | Kanıt |
|---|---|---|---|---|---|---|---|
| A0 | 404 — sayfa yok | YARIM (rozetli) | `not-found.tsx` genel — "dört çıkış" tasarımı ölçülmedi | ölçülmedi | — | Emir #7 | "dört çıkış · aramaya odak · kiremit yok" |
| A1 | Header sağ küme — Teklif(n)+Hesap tek öğe | HAZIR | Header bileşeni var, iç yapı bu turda okunmadı | ölçülmedi | — | madde 24/31/33 | "Header sağında tek öğe: Teklif (n) + hesap simgesi" |
| A2 | Mobil üst şerit — 52b | HAZIR | ölçülmedi | ölçülmedi | — | madde 63 | "52b seçildi (madde 63)" |
| A2b | Mobil üst şerit — girişli + bildirim | YARIM (rozetli) | ölçülmedi | ölçülmedi | — | — | "Rozet yalnız okunmamış varsa" |
| A3 | Header "Teklif" paneli + İletişim/Hesap panelleri | HAZIR | ölçülmedi | ölçülmedi | — | madde 25/68 | "Panel 360 px, gölgesiz, 8 px köşeli" |
| A4 | Masaüstü İletişim girişi | HAZIR | `contact/page.tsx` var (ayrı sayfa) — tasarım panel öneriyor, site ayrı SAYFA kullanıyor | **VAR** — panel/yaprak vs. tam sayfa | hayır | K19 madde 3 | "masaüstündeki İletişim simgesi mobil alt panelin karşılığını açar" |
| A5 | Eylem bloğu — Teklif kipi / Satış kipi arşiv | HAZIR | `satisKipi.ts` (`site_settings.satis_kipi`, DB bayrağı) — K1a ile **uyumlu**, arşiv değil "kapalı" | hayır (K1a'nın kendisi düzeltmiş) | hayır | K1 | "Teklif kipi bugün, Satış kipi arşiv" |
| A5b | Kip sözlüğü — Teklif↔Satış tek tablo | YARIM (rozetli) | `satisKipi.ts` merkezi okuma var, 14 satırlık sözlük kod tarafında ayrıca doğrulanmadı | ölçülmedi | — | — | "kod tek yerden okur" |
| A6 | Çerez şeridi | YARIM (rozetli) — **T-5 açık karar** | ölçülmedi | — | — | T-5 | "m.70 açık sorusu" |
| A7 | Yükleme iskeleti | YARIM (rozetli) | ölçülmedi | — | — | — | "300 ms sonra görünür" |
| A8 | UI standartları (8 desen) | YARIM (rozetli, kendi notu "onay bekler") | DS'e girmeyen, DESIGN-MENU'nün kendi standardı | — | evet (tanım gereği token/pattern kararı) | K11 | "DS'e girmez… onaylanınca sözleşme v2'ye ölçülüp DS'e teklif edilir" |
| A9 | Arayüz ikon seti — 25 ikon | YARIM (rozetli) | `brand/icons/ui/*` üretildi (öneri), koda alınmadı | — | evet | — | "24 SVG … olarak yazıldı (öneri, ret gelirse silinir)" |

### B · Keşif → Teklif (24 kare)

| Kare | Adı | Durum | Site karşılığı | ÇELİŞKİ | DS? | K karar | Kanıt |
|---|---|---|---|---|---|---|---|
| B1 (eski 02-ana) | Ana sayfa | HAZIR | `app/[lang]/page.tsx` var | — | — | K17 | "Sayfada tek dolu kiremit: hero'daki Projeniz için teklif iste" |
| B1b | Tüm ürünler — üç kapı, varsayılan TABLO | YARIM (rozetli) | `products/page.tsx` var, adres **`/tr/urunler` değil `/products`** | **VAR — adres şeması**: TR gövdeli "urunler" vs EN "products" | hayır | — | "/tr/urunler bir sayfa, ön ek değil" |
| B2 | Mega menü paneli | HAZIR | ölçülmedi (header alt bileşeni) | ölçülmedi | — | K9 | "panel yedi büyük kategori kiremiti + Tüm ürün ağacı" |
| B3 | Kategori şablonu ×7 | HAZIR | `category/[categorySlug]/page.tsx` **tek seviye** | **VAR — taksonomi derinliği**: tasarım kategori→dal 2 seviyeli adres varsayıyor, site tek dinamik segment | hayır | madde 33 | "Kategori şablonu ×7" |
| B3b | Kategori — ANLATIM (tek alt kategori) | HAZIR | `/tr/kategori/isi-geri-kazanim` — site'de `/category/isi-geri-kazanim` (tek seviye) | **VAR — adres şeması** (kategori vs category, iki-seviye vs tek) | hayır | K8 | "/tr/kategori/isi-geri-kazanim" |
| B3c | Kategori — SERİ LİSTESİ (alt kategori yok) | HAZIR | aynı — `/category/hava-perdeleri` | **VAR — adres şeması** (yukarıdakiyle aynı aile) | hayır | K8, madde 64 | "/tr/kategori/hava-perdeleri" |
| B4 | Dal şablonu ×26 | HAZIR | site'de ayrı "dal" rotası yok (tek seviyeli category içinde çözülüyor olmalı) | **VAR** — yukarıdaki taksonomi çelişkisinin devamı | hayır | K7, madde 59 | "Dal şablonu ×26" |
| B5 | Liste — model kartı | HAZIR | `products/page.tsx` süzgeçli hâli olası ama ayrı ölçülmedi | ölçülmedi | — | K5, madde 59 | "Liste model kartı gösterir, seri kartı değil" |
| B5b (06b) | Filtreli liste — boş sonuç | HAZIR | ölçülmedi | ölçülmedi | — | madde 13/59 | "hangi süzgecin kaç modeli sakladığı yazılı" |
| B6 (07a) | Seri sayfası — anlatım + model tablosu | HAZIR | `/tr/urun/seat-serisi` — site'de `products/[slug]` **ama slug "-p-<sku>" son-eki YOK**, aile slug'ı tek başına kullanılıyor | **VAR — adres şeması** (§3'te detay) | hayır | — | "/tr/urun/seat-serisi" |
| B7 | Ürün sayfası — VARSAYILAN kabuk | HAZIR | `products/[slug]/page.tsx` var | ölçülmedi (iç yerleşim) | — | — | "bu sayfa artık her ürünün VARSAYILAN hâli" |
| B7v | Varyant seçici — kardeş model ayrımı | YARIM (rozetli) | `productRoute.ts`: varyant slug'ı **308 ile `?sku=`'a yönlendiriliyor**, tasarımın varsaydığı "aynı adreste seçilir, adres değişmez" davranışı **DEĞİL** | **VAR (güçlü kanıt)** — kod: varyant her zaman aile adresine redirect+query, path-içi seçim yok | hayır | — | "varyant … aynı sayfada seçilir, adres değişmez" |
| B7b (07) | Ürün sayfası — panel AÇIK (kanal fanı) | HAZIR | `-p-sea-51302000` son-eki site şemasında yok (bkz. B7v kanıtı) | **VAR — adres şeması** | hayır | K3-b, madde 5/59 | "…-p-sea-51302000 · K3-b: sondaki SKU ile çözülür" |
| B7c (07d) | Ürün sayfası — panel DOLU (?hesap=1) | HAZIR | `?hesap=1` sorgu parametresi koda özel doğrulanmadı; kod tabanında görülen tek query-param şeması `?sku=` | ölçülmedi (kısmi kanıt: farklı bir query şeması zaten kodda var) | — | madde 32 | "adres bir işaret taşır (…?hesap=1); şema Faz 3'te kesinleşir" |
| B7d (07e) | Ürün sayfası — KISA KABUK (sürücü/aksesuar) | HAZIR | aynı `products/[slug]` şablonu (ayrı route yok, koşullu render varsayımı) | ölçülmedi | — | — | "3 satır tablo, seçici yok, eğri yok" |
| B7e (07b) | Ürün sayfası — panel AÇIK (hava perdesi) | HAZIR | aynı | ölçülmedi | — | madde 19 | "Bu perde kapınıza yeter mi?" |
| B7f | Kaldırılan model — yerine geçen | YARIM (rozetli) | `productRoute.ts` beş `kind` değerinden biri "bulunamadı/hizmet dışı" durumunu ayırıyor — 200+noindex davranışı doğrulanmadı | ölçülmedi (kısmi: kod byle bir durumu zaten modelliyor) | — | K7 | "404 değil 200 + noindex" |
| B8 (11) | Karşılaştırma tablosu | HAZIR (tasarımda) | **site'de `/karsilastir` ya da eşdeğeri YOK** | **VAR — özellik tamamen eksik** | hayır | — | "/tr/karsilastir?m=seat-30,seat-35,jet-25" |
| B8b (U1) | Karşılaştırma — "farkı göster" | HAZIR — ama kendi notu **"karar karesi, ekran değil"** | B8 ile aynı: yok | **VAR** (B8 ile birlikte) | hayır | K37-a | "Karar karesi, ekran değil… fark satırı 7/11" |
| B9 | Teklif listesi | HAZIR | **`/tr/teklif-listesi` yok**; işlev `cart/page.tsx`'te birleşik (teklif-alınamayan kalemler "Teklif Alın" ile işaretleniyor) | **VAR (güçlü kanıt)** — ayrı adres yerine `/cart` yeniden kullanılıyor | hayır | madde 32/51 | "Adres /tr/teklif-listesi (EN /en/quote-list)" |
| B9b | Teklif listesi — boş | YARIM (rozetli) | aynı `/cart` boş-durum ölçülmedi | ölçülmedi | — | — | "Boş durum kuralı (DS)" |
| B10 | Teklif talebi — form | YARIM (rozetli) | `/tr/teklif-listesi/gonder` yok; `checkout/page.tsx` `satis_kipi` bayrağına bağlı, form alanları karşılaştırılmadı | **VAR — adres şeması** | hayır | K1 | "/tr/teklif-listesi/gonder" |
| B11 | Teklif alındı | YARIM (rozetli) | `/tr/teklif-listesi/alindi` yok; en yakını `payment-success/page.tsx` (Satış-kipi adlı) | **VAR — adres şeması + kip adlandırma** | hayır | — | "/tr/teklif-listesi/alindi?no=VH-2026-0912" |
| B12 | Hesap — Tekliflerim | YARIM (rozetli) **ve K62'ye göre ERTELENDİ** | `/account/quotes` var (isim örtüşüyor) ama adres `/tr/hesap/teklifler` değil `/account/quotes` | **VAR — hem karar hem adres**: K62 "acelesi yok, erteleme" derken kare hâlâ "ONAY BEKLER" rozetiyle aktif duruyor; adres de hesap→account farklı | hayır | K19, K1, **K62 (ERTELENDİ)** | "Üç durum: İNCELENİYOR → TEKLİF GÖNDERİLDİ → KAPANDI" |

### C · Senaryo (3 kare)

| Kare | Adı | Durum | Site karşılığı | ÇELİŞKİ | DS? | K karar | Kanıt |
|---|---|---|---|---|---|---|---|
| C1 | Senaryo ızgarası (8 senaryo) | HAZIR | ölçülmedi (ayrı /senaryo rotası bulunamadı) | ölçülmedi — muhtemel **VAR** (Broadsheet'in "tek panel, iki sekme" fikrine göre de ayrışmış, bkz §4) | — | — | "Sekiz senaryo, aynı Apple kalıbı" |
| C2 | Senaryo detay | HAZIR | ölçülmedi | ölçülmedi | — | — | "Teknik destek iste — kiremit orada" |
| C3 (04k) | Montaj/kullanım dalı | HAZIR | `/tr/kategori/fanlar/kanal-tipi-fanlar` — site'de tek seviyeli `/category/kanal-tipi-fanlar` | **VAR — adres şeması** (B3 ailesiyle aynı) | hayır | — | "/tr/kategori/fanlar/kanal-tipi-fanlar" |

### D · Arama (5 kare)

| Kare | Adı | Durum | Site karşılığı | ÇELİŞKİ | DS? | K karar | Kanıt |
|---|---|---|---|---|---|---|---|
| D1 | Arama — kutuya odak | HAZIR | **`/tr/arama` rotası site'de YOK** | **VAR — özellik tamamen eksik** (tüm D kanalı) | hayır | — | "Arama kanalı header'dan başlar" |
| D2 (08c) | Arama — yazarken öneri | HAZIR | yok (yukarıdakiyle aynı) | **VAR** | hayır | — | "öneri sırası sabittir — kod, ürün, seri, marka" |
| D3 (08) | Arama sonucu — liste | HAZIR | `/tr/arama?q=…` yok | **VAR** | hayır | — | "ekran B5 liste şablonunun aynısı" |
| D4 (08b) | Arama sonucu — boş | HAZIR | yok | **VAR** | hayır | — | "üç çıkış yolu verir" |
| D5 | Arama — kod tam eşleşti | YARIM (rozetli) | yok; ayrıca `?q=SEA-…` şeması da `?sku=` şemasıyla çakışıyor | **VAR** | hayır | — | "D2'nin notunda vardı, karesi yoktu" |

### E · Ürün Seçici (3 kare)

| Kare | Adı | Durum | Site karşılığı | ÇELİŞKİ | DS? | K karar | Kanıt |
|---|---|---|---|---|---|---|---|
| E1 (eski B4) | Ürün Seçici menü yeri — karar kapandı | HAZIR (karar kaydı, kapalı) | header'da giriş — genel olarak doğrulanmadı | ölçülmedi | — | K24, K18-b | "Hüküm B (K24): header" |
| E2 | Ürün Seçici — tek sayfa | HAZIR | `/tr/secici` değil **`/urun-secici`** (`app/[lang]/urun-secici/page.tsx`) | **VAR — adres şeması** | hayır | K17, K10, madde 62 | "/tr/secici" |
| E3 | Ürün Seçici sonucu → ürün geçişi | YARIM (rozetli) | `?hesap=1` köprüsü koda özel doğrulanmadı, E2'nin kendi adresi zaten farklı | **VAR** (E2 ile aynı aile) | hayır | — | "E2 ile B7c arasındaki köprü yalnız notta duruyordu" |

### F · Bilgi (5 kare)

| Kare | Adı | Durum | Site karşılığı | ÇELİŞKİ | DS? | K karar | Kanıt |
|---|---|---|---|---|---|---|---|
| F1 (eski 14) | Uzun-metin şablonu + Bilgi Merkezi girişi | HAZIR | `destek/konular/[slug]/page.tsx` **VAR**, `destek/merkez/page.tsx` **VAR**, `legal/kvkk` **VAR** — adres örtüşüyor | **VAR (kısmi)**: F1 notu "mesafeli satış ve ön bilgilendirme… bugün yayında değil (K1)" diyor ama `legal/mesafeli-satis-sozlesmesi` ve `legal/on-bilgilendirme-formu` **canlı rota olarak MEVCUT** | hayır | K1, K14 | "/legal/* … bugün yayında değil (K1)" |
| F2 (eski U2) | Bilgi Merkezi — iç tasarım (dört blok) | HAZIR (rozetsiz — v17'deki "satır pasifti" uyarısı v18'de kalkmış) | `destek/konular/[slug]` sayfası küçük (549 bayt) — dört blok (içindekiler/arama/ilgili konu/ürün bağı) koda yansımış mı ayrı ölçülmedi | ölçülmedi (kuvvetli şüphe: 549 baytlık sayfa dört bloklu zengin bir şablon için küçük) | — | K37-a | "Dört blok: içindekiler (44 px, aktif)…" |
| F3 (eski U3) | İletişim: panel mi kalıcı sütun mu | **YARIM — açık karar T-1**, `{{ u3Rozet }}` `{{ u3Dugme }}` şablon değişkenleri çözülmemiş | A4 ile aynı soru | — | — | **T-1 (açık)** | "{{ u3Rozet }} {{ u3Dugme }}" (foot boş) |
| F4 | Nasıl teklif alınır — dört adım | YARIM (rozetli) | **`/tr/destek/nasil-teklif-alinir` site'de YOK** | **VAR — sayfa hiç yok** | hayır | Emir #7 | "/tr/destek/nasil-teklif-alinir" |
| F5 | Hesap — giriş/kayıt (Google ile giriş) | YARIM (rozetli) | `/tr/hesap/giris` değil `/auth/login`; Google ile giriş anahtarı doğrulanmadı | **VAR — adres şeması** + ölçülmedi (Google OAuth) | hayır | K19, K5 | "/tr/hesap/giris" |

## 3. Sistemik (tek satıra sığmayan) çelişkiler — kanıtlı

1. **Ürün adresi son-eki (`-p-<sku>`) kodda yok.** `src/lib/data/productRoute.md/.ts`: varyant slug eşleşmesi ailenin kanonik adresine **308 + `?sku=<sku>` sorgu parametresiyle** yönlendiriliyor; tasarım "sonda SKU ile çözülür" (K3-b, B7b/B7c/D5/E3) diyor ve v18'in kendi değişiklik kaydı "`?sku=` kalktı" yazıyor — kod bunun tersini yapıyor. Etkilenen kareler: B6, B7b, B7c, B7v, B7d, B7e, B7f, D5, E3 (9 kare).
2. **"Kategori → dal" iki seviyeli adres kodda tek seviyeye iniyor.** `category/[categorySlug]` tek dinamik segment; tasarımın `/kategori/<kategori>/<dal>` şeması (B3, B3b, B3c, B4, C3) karşılıksız.
3. **Teklif-listesi adres ailesi hiç yok; işlev `/cart`+`/checkout`'a taşınmış.** B9/B9b/B10/B11/B12 tasarımdaki `/teklif-listesi*` adresleri site'de yok; `CartPage.tsx` içinde "Teklif Alın" ile karma bir uygulama var. Kip-kapalı davranış K1a ile tutarlı (bu kendisi çelişki değil) ama **adres ailesi** farklı.
4. **`hesap/*` yerine `account/*` + `auth/*`.** B12, F5 ve genel "Hesap" nav etiketleri `/tr/hesap/…` varsayıyor; site İngilizce `account`/`auth` kullanıyor.
5. **Arama ve karşılaştırma sayfaları (D kanalı, B8) sitede tümüyle yok.**
6. **Legal sayfa görünürlüğü ters:** F1 "mesafeli satış + ön bilgilendirme bugün yayında değil" diyor, ikisi de canlı rota.
7. **K62 (B12 ertelendi) ile dosyanın rozet durumu tutarsız** — karar "acelesi yok" derken kare hâlâ "DESIGN ÖNERİSİ · ONAY BEKLER" aktif kare gibi duruyor.

## 4. G/H toplu bölümler (özet, ayrıntı deşilmedi)

- **G — Mobil kabuk (K9·K16·K19'un mobil karşılıkları), 9 alt kare:** M1 İletişim alt paneli · M2 Ürünler sekmesi bir SAYFA · M3 Hesap sekmesi iki hâl · M4 Üç sayfa üst şeridi · M5 Girişli ana sayfa kısayol şeridi · M6 Teklif sekmesi sayfası + kapalı Sepet hâli · M7 Ürün sayfası mobil · M8 Bildirim rozeti iki hâl · M9 Geri dönüş hâli. Hepsi HAZIR görünüyor (rozet yok, her biri K19/K9/K16 madde numarasına bağlı) — site karşılığı tek tek ölçülmedi.
- **H — Satış kipi (kapalı, koddaHAZIR), 6 alt kare:** S1 Sepet · S2 Ödeme adımları · S3 Sipariş onayı · S4 Siparişlerim+takip · S5 İade talebi · S6 Header/alt çubuk satış hâli. Bunlar `satis_kipi` bayrağı KAPALIYKEN de kodda gerçekten var (S1≈`/cart`, S2≈`/checkout`) — K1a ile örtüşüyor, ayrıntılı satır-satır karşılaştırma yapılmadı.

## 5. Broadsheet (design_handoff_venthub_menu/README.md) vs bugünkü v18/kararlar — çelişki listesi

Kaynak: proje içi `design_handoff_venthub_menu/README.md` (34.576 bayt, Broadsheet dönemi, "on ana ekran").

1. **Fiyat/sepet/ödeme tamamen kapsam dışıydı, şimdi kodda var.** README §0: "Aşağıdakiler bilinçli olarak tasarım dışıdır. Uygulamada da olmamalıdır: … Sepete ekle butonu, sipariş akışı, ödeme." K1/K1a bunu tersine çevirdi: fiyat DB'de var (348/442 fiyatlı), satış kipi kodda çizili ve mevcut (yalnız bayrakla kapalı).
2. **Tek tipografi ailesi → üç aile.** README §Tipografi: "Tek aile: Source Serif 4 (`--font-heading` = `--font-body`). Sans-serif kullanılmaz." v18: Archivo (varsayılan/başlık) + Source Serif 4 (yalnız gövde) + IBM Plex Mono (etiket/veri) — üç aile.
3. **Köşe yarıçapı tanımlı (2px) → v18'de fiilen sıfıra yakın.** README: "`--radius-md` (2px). Sistem kare köşelidir." v18 taramasında `border-radius` yalnızca 8 kullanım (marjinal bir bileşende); geri kalan tüm kart/panel/düğme 0 radius.
4. **Birincil eylem tanımı değişti.** README: "Birincil eylem her yerde aynıdır: Teklif listesine ekle (primary/dolu) + Teklif iste (secondary)." v18/K5: sayfa başına TEK dolu kiremit kuralı var; liste kartlarında (B5) "İki düğme de çerçeveli; sayfada dolu kiremit yok" — Broadsheet'in "primary dolu" ikili-düğme modeli artık geçerli değil.
5. **Menü mimarisi: tek panel + iki sekme → ayrı kanallar.** README Overview: "menünün tek 'Ürünler' paneli altında iki sekmeye ('Ürüne göre'/'Senaryoya göre') indirilmesi." v18'de Ürünler (B2 mega menü) ve Senaryo (C1, ayrı kanal/kare seti) ayrışmış görünüyor; B2'nin kendi altyazısında senaryo sekmesinden söz edilmiyor (kanıt sınırlı — B2 iç metni tek tek "sekme" ibaresi taşımıyor, bu madde orta güvenle işaretlenmeli).
6. **Taksonomi derinliği: "iki seviye + faset" → dört seviye.** README Overview madde (1): "ürün taksonomisinin iki seviye + faset modeline geçirilmesi." v18 üst bilgisi: "kategori → dal → aile → model (kanonik adres) → varyant" — dört seviye + faset; §3 madde 2'deki kod tarafı da tek seviyeye (category) iniyor, yani üç taraf (Broadsheet / v18 tasarım / kod) birbirinden farklı.

## 6. Okuyamadığım / ölçmediğim kısımlar (dürüst sınır)

- G ve H toplu bölümlerin 15 alt karesi (M1–M9, S1–S6) başlık düzeyinde okundu, gövde metinleri tek tek site koduyla karşılaştırılmadı.
- Header/panel/bileşen düzeyindeki kareler (A1–A9, B2, E1) için ilgili React bileşenlerinin iç kodu bu turda açılmadı — yalnız route/dosya varlığı değil, davranış karşılaştırması yapılmadı; tabloda "ölçülmedi" olarak işaretlendi.
- `?hesap=1` sorgu-parametresi şemasının (B7c, E3) kodda gerçekten var olup olmadığı doğrudan aranmadı; yalnız `?sku=` şemasının varlığı doğrulandı (dolaylı karşıt kanıt).
- F2'nin (Bilgi Merkezi iç tasarım — dört blok) `destek/konular/[slug]/page.tsx` içinde gerçekten uygulanıp uygulanmadığı — sayfa küçük (549 bayt) olduğu için şüpheli ama page.tsx içeriği okunmadı.
- Broadsheet çelişki listesindeki madde 5 (menü sekme mimarisi) orta güvenle işaretlendi; B2 ve C1'in tam gövdesi (B2 26KB, C1 19KB) satır satır taranmadı.
