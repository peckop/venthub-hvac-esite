# URUN defteri: canlı adres şeması ve yönlendirmeler

Sahibi: URUN · Son doğrulama: 2026-11-09 · Cetvel: `docs/standards/departman-defter-standard.md` · Kaynak: OPS-258, URN-158

Alan: eski Next 15 sitedeki (canlı `venthub.com.tr`) adres şeması, yönlendirme katmanları ve kanonik adres kuralları; yeni siteye geçişte
308 yönlendirmeyi yazan taraf URUN'dur (A6/A9). Depo herkese açıktır: burada yalnız sayı ve yol vardır, arama verisi ve ticari veri yoktur.
Sayı yanında "ölçülmedi" yazıyorsa o sayı başka kayıttan devralınmıştır ve bu turda yeniden ölçülmemiştir.

## 1 Ne yaptık

| Tarih | İş | Sonuç | Kart |
|---|---|---|---|
| 2026-11-09 | `adres-semasi-standard.md` v0.3: yeni sitenin tek önek şeması §1A (urunler, uygulama-alanlari, rehber; A12–A15), eski şema §1 "eski site" diye işaretlendi, §3 geçiş eski-adres gruplarını söyler; rota dili ve dil tespiti bölümlerine dokunulmadı | Cetvel ile karar ayrışıklığı kapandı | URN-159 |
| 2026-11-09 | Marka, ana sayfa, sabit sayfa eşleme önerisi (A1–A7) ve 6 çakışan hedef için öneri (Ç1–Ç6) yazıldı; OPS düzeltmesiyle A6, A7 ve Ç1+Ç2 6 Kasım yol haritasına göre URN-157'ye bırakıldı, Recep'e soru yok | 3.1 | URN-160 |
| 2026-11-09 | Rota dili sorusu kapandı: ALTYAPI cetveli yeni sitenin tek kaynağını adres-semasi v0.3 olarak yazdı, rota dili tablosu eski siteyi yönetir | Madde Sırada'dan düştü | URN-159, ALT-179 |
| 2026-11-09 | Bu defter pilot olarak yazıldı; repoda ölçülebilen katmanlar sayıldı | Aşağıdaki envanter | URN-158 |
| 2026-11-09 | 308 sahiplik bölüşümü görüşü SEO-76'ya yazıldı: URUN eşleştirme tablosunu ve yönlendirmeyi yazar, ALTYAPI rota dilini ve arama yönlendirmesini tutar, GEO-SEO ölçer | Kabul edildi, tablo işi URN-157'ye açıldı (geçişe bağlı, beklemede) | SEO-76, URN-157 |
| 2026-11-06 | `vitrin-metni-standard.md` içinde yazma betikleri ve kapıları KATALOG şeridine yazıldı (8., 72., 230. satırlar) | #2319 birleşti | URN-156 |
| 2026-10-15 | Model adresleri (`/tr/urun/<slug>-p-<sku>`) ve yeni kategori adresleri içerikle birlikte açılacak diye yayın bekletildi; bayraklar kapalı kaldı | PR #1811 kapalı, dal duruyor | URN-85, URN-86 |
| 2026-10-11 | Adres şeması cetveli v0.2 (B-1) yazıldı: TR `/tr/urunler`, `/tr/kategori/…`, `/tr/urun/…`; EN `/en/products`, `/en/category/…`, `/en/products/<aile>` | `adres-semasi-standard.md` | SEO-35 |

## 2 Envanter

Ölçüm tarihi 2026-11-09, dayanak sütunundaki yol. "Eski site" kodu `venthub-hvac` deposundadır.

### 2.1 Yönlendirme katmanları (eski sitede)

| Katman | Bugünkü hâli | Dayanak |
|---|---|---|
| `next.config.mjs` | 24 `source:` girişi: 21 yönlendirme (1 sessiz fan şablonu, 1 `/destek/hesaplayicilar`, 13 eski TR kategori adı, 6 tekil ürün adresi), 3 başlık bloğu (genel noindex sınırı ve hesap/sepet/ödeme yüzeyleri); `redirects()` ve `rewrites()` ayrı | `next.config.mjs` |
| Marka yönlendirmeleri | `KALDIRILAN_MARKALAR` 1 kayıt (`frekans-konvertoru`, hedef kategori), `k3bOku`, `markaHedefi`, `markaYonlendirmeleri(k3b)` | `src/config/markaYonlendirmeleri.mjs` (106 satır) |
| Bilgi merkezi yönlendirmeleri | 2 dilde bölüm adı, `ESKI_KONULAR` 4, `YAYINDAN_KALKAN` 2, EN kapalıyken liste hedefi, `bilgiMerkeziYonlendirmeleri(enYayin)` | `src/config/bilgiMerkeziYonlendirmeleri.mjs` |
| Eski adres tohumu | kategoriler 17, aileler 6, ürünler 6 | `src/data/eski-adres-tohum.json` |
| Adres kodu | envanter, eşleştirici, harita üretimi (A7 %90 fail-closed), rota dili tablosu, tazeleme yolları, yayındaki model yolları | `src/lib/adres/` |
| Veritabanı takma adları (`url_takma_adlari`) | 59 satır (ölçülmedi; OPS envanterinden devralındı, 2026-11-09) | `docs/audits/adres-matrisi-canli-2026-10-04-oncesi.json` (245 satırlık eski matris) |

### 2.2 Bayraklar

| Bayrak | Değer | Anlamı | Dayanak |
|---|---|---|---|
| `EN_YAYIN` | `false` | EN yüzey kapalı; EN adresler noindex ve hreflang dışı | `src/config/features.ts` |
| `ADRES_SEMASI_K3B` | `false` | Yeni model ve kategori adresleri yayında değil; açılışta aynı PR eski-adres haritasını ve `next.config` satırlarını da siler | `src/config/features.ts` |

### 2.3 Canlı adres evreni (devralınan, ölçülmedi)

| Kalem | Sayı | Dayanak |
|---|---|---|
| Canlı site haritası | 101 adres (9 Kasım, SEO-100; dağılımı yazılmadı) | OPS geçiş envanteri (depo dışı) |
| 2 Kasım listesi | 94 adres: ürün 47, kategori 29, marka 7, bilgi merkezi 7, sabit 4 | OPS geçiş envanteri (depo dışı) |
| Canlı katalog | 442 model (aile sayfasında `?sku=` ile), 47 aile, 35 kategori (28 aktif), 7 marka | OPS geçiş envanteri (depo dışı) |
| Yeni site (Design) | kategori 32, aile 17, seri 104, model 1206, mekân 9, bina 5, marka 7, rehber 5, sabit 20 | OPS geçiş envanteri (depo dışı); Design 14 Aralık'ta kapanıyor |
| UnoPIM adres alanı | 1165 üründe `adres_tr` ve `adres_en` dolu | `docs/olcum/pim-unopim.md` |
| Eşleştirme taslağı (2 Kasım) | 2402 satır; canlı 94 adresin 93'ü listede yok; slug düzeyinde kategori 28/29, ürün 6/47, marka 0/7, bilgi merkezi yazısı 0/6; 6 hedef çakışması | SEO-76 kartı (4 Kasım ölçümü, GEO-SEO) |
| Model adres listesi (eski şema) | 442 model | `docs/plans/rec300-model-adres-listesi-2026-09-23.csv` |

### 2.4 Kurallar ve kapılar

| Kural veya kapı | Ne söyler | Dayanak |
|---|---|---|
| A6 | Sağlayıcıya özgü yönlendirme yok (barındırma Cloudflare'e taşınabilir) | `docs/standards/adres-semasi-standard.md` |
| A9 | Dil önekli eski adres tek sıçramada 308, öneksiz 307 | `docs/standards/adres-semasi-standard.md` |
| A4 | Rezerve kelimeler | `docs/standards/adres-semasi-standard.md` |
| Kanonik adres | Tek kaynak `src/config/siteUrl.ts`; bekçi INV-CANONICAL-1 | `docs/standards/canonical-url-standard.md` |
| INV-ADRES-TEK-KANONIK-1, INV-ADRES-HARITA-1 | Tek kanonik adres, harita tutarlılığı | `src/lib/adres/__tests__/envanter.test.ts` |
| INV-ADRES-YAYIN-DENETIM-1 | Yayın öncesi adres denetimi | `scripts/seo/__tests__/adres-yayin-denetim.test.ts`, `scripts/seo/adres-yayin-denetim.mjs` |
| INV-DIL-TESPITI-1 | Dil tespiti | `src/test/dil-tespiti.test.ts` |
| Harita üretimi | Zamanlı üretim | `.github/workflows/harita-uret.yml`, `scripts/adres/` |

### 2.5 Cetvel durumu

`docs/standards/adres-semasi-standard.md` v0.3 (9 Kasım, URN-159) iki şemayı ayrı tutar: §1 eski site (K3-b/B-1, bayraklar kapalı), §1A yeni site tek önek
(`/tr/urunler`, `/tr/uygulama-alanlari`, `/tr/rehber`; EN `products`, `applications`, `guides`). Kaynak Design Venthub New `assets/veri/adres.json`, 9 Kasım okuma (depo dışı).
Rota dili cetveli (`rota-dili-standard.md`, ALTYAPI) §0 ile yeni sitenin tek kaynağının bu cetvel (v0.3) olduğunu, rota dili tablosunun eski siteyi yönettiğini yazıyor
(ALT-179, #2450, 1d335bd04): tablo yeni önekleri taşımıyor, kod değişmedi, karar 412. URUN o dosyaya dokunmadı.

## 3 Sırada ve yapılabilecekler

| Madde | Gerekçe | Öncelik | Kart |
|---|---|---|---|
| Canlı şemadan (`/tr/products`, `/category`, `/brands`, `/bilgi-merkezi`) yeni tek önekli hedefe eşleştirme tablosu | 308 yönlendirmenin kaynağı; mevcut taslağın "eski" sütunu canlıdan değil Design ara şemasından | yüksek | URN-157 (geçişe bağlı) |
| Rehber eşlemesi: canlı 13 yazı, Design 5 yazı, birebir slug 0 | Hangi yazı yeni adrese, hangisi neye gidecek kararı yok; BLOG ile birlikte | orta | URN-157'ye bağlı |
| Marka 7, ana sayfa, iletişim, hakkımızda, ürün seçici, sepet/hesap/ödeme eşleme önerisi (A1–A7) | Öneri yazıldı (3.1); A6 ve A7 Design adresleri verince URN-157'de çözülür, Recep'e soru yok | orta | URN-160 |
| 6 çakışan hedef için önerili liste (Ç1–Ç6) | Liste yazıldı (3.1); Ç1+Ç2 kök kategori sorusu URN-157 sırasında çözülür, Recep'e soru yok | orta | URN-160 |
| EN eski adres evreni sayısı ve EN açılış kararı | Sayı yok; EN açılış Recep kararı | orta | URN-86 |
| `?sku=` ile gelen eski model adresleri için sorgu duyarlı yönlendirme | A6: sağlayıcı özelliği yok; ALTYAPI yazar, URUN kuralı söyler | orta | ALT-177 |
| Dondurulmuş eski adres evreni (101 + EN + GSC'de dizinli `?sku=` adresleri + zincir düzleştirme) | GEO-SEO ölçer, URUN tabloya alır | orta | SEO-76 (beklemede) |
| Defter ölçüm komutu (`olcum`) yaz: next.config kural sayısı, bayraklar, tohum sayıları defterle tutarlı mı | Defter `kontrolsuz` kalmasın; şimdilik `pilot` | düşük | açılacak |

Başka sahipte kalanlar (bilgi için): CI kapıları (eski→yeni 200 tek sıçrama, boyut bütçesi, zincir ve çakışma) ALTYAPI (ALT-177); `src/lib/adres` kodunun yeni kuruluma taşınıp taşınmayacağı OPS kararı (OPS-180);
Design adres verisinin kalıcı depoya alınması OPS-228 ve KATALOG.

### 3.1 Eşleme önerileri (URN-160, 9 Kasım; esas: 6 Kasım yol haritası ve Design eksik listesi)

Yeni siteden gelen kural Design'ındır (Design Venthub New `adres.json`, 9 Kasım okuma); öneriler Design'a şart koymaz, siteyi Design'a uydurur.
Eski adresler için kaynaklar: canlı 94 adres listesi (2 Kasım), eşlemesiz canlı adres listesi (SEO-76, 4 Kasım) ve eşleştirme taslağı (2402 satır). "Önerim: evet" = önerilen eşlemeyi kabul et.
Ham dosyalar depoda değil, yalnız sonuçlar buradadır.

**A. Marka, ana sayfa ve sabit sayfalar (canlı → yeni)**

| No | Eski (canlı) | Önerilen yeni | Önerim | Not |
|---|---|---|---|---|
| A1 | `/tr/products` | `/tr/urunler` | evet | EN `/en/products` yolu aynı kalır, yönlendirme gerekmez |
| A2 | `/tr/brands` | `/tr/markalar` | evet | EN `/en/brands` aynı kalır |
| A3 | `/tr/brands/<marka>`: vortice, avens, casals, seat, danfoss, nicotra-gebhardt (+ flexiva: kodda açık, 2 Kasım haritasında yok) | `/tr/markalar/<marka>` (7 marka adı Design'daki ile birebir) | evet | EN yol aynı kalır (ölçülmedi: `/en/brands/<marka>` biçimi). `frekans-konvertoru` zaten kategoriye yönleniyor (`markaYonlendirmeleri.mjs`) |
| A4 | `/tr/contact`, `/tr/about` | `/tr/iletisim`, `/tr/hakkimizda` | evet | EN `/en/contact`, `/en/about` aynı kalır |
| A5 | `/tr` (ana sayfa) | `/tr` (değişmez) | evet | Design `adres.json`'da ana sayfa kaydı yok; kök adres değişmez varsayıldı, Design kaydederse ona uyulur |
| A6 | `/tr/urun-secici` | Design'ın ürün seçicisine; ayrı adresi yoksa `/tr/urunler` (308) | URN-157'de çözülür | Ürün seçici Design'da var (6 Kasım eksik listesi, madde 9: tam ekran ürün seçici). `adres.json` 9 Kasım okumasında seçicinin ayrı adresi yok (ölçüldü); hedef, Design seçiciye adres verip vermediğine göre URN-157 tablosuna girerken belli olur. Recep'e soru değil |
| A7 | `/tr/account`; `/tr/cart`, `/tr/checkout`, `/tr/payment-success` | `/tr/hesap`; sepet, ödeme adımları ve ödeme sonucu: Design'ın çizeceği sayfalar | URN-157'de çözülür | 6 Kasım yol haritası (karar 4-5): sepet, ödeme adımları, ödeme sonucu ve hesapta sipariş ayrıntısı ekranlarını Design çizer; ödeme sağlayıcısı (iyzico) canlıdaki mevcut kodla bağlanır, yeni sitede sıfırdan yazılmaz. Dört eski yüzey bugün noindex. Eşleme, Design bu sayfaların adreslerini verince URN-157 tablosuna girer; bugünden 410 ya da başka hedef önerilmez |

**B. Çakışan 6 hedef (2 Kasım taslağı: aynı yeni adrese giden birden çok eski adres)**

Not: taslağın "eski" sütunu canlıdan değil Design ara şemasından geldi (`/tr/kategori/...`). Canlı adresler (`/tr/category/...`) URN-157 tablosuna girerken çakışma listesi yeniden çıkar.

| No | Yeni hedef | Eski adresler (taslak) | Önerim | Gerekçe |
|---|---|---|---|---|
| Ç1 | `/tr/urunler` | `kategori/fanlar`, `kategori/hava-sartlandirma` | URN-157'de çözülür | Kök kategori sorusu Recep'e gitmez; geçiş tablosu yazılırken yol haritasına göre çözülür. Çalışma notu: iki eski kök kategori genel ürün listesine düşmemeli, içerik karşılığı olan yeni gruba gitmeli (yeni grup düzeyi 7 kategori var) |
| Ç2 | `/en/products` | `category/fans`, `category/air-treatment` | URN-157'de çözülür | Ç1'in EN karşılığı, aynı not |
| Ç3 | `/tr/urunler/kontrol-ve-aksesuarlar` | `kategori/elektrik-aksesuarlari`, `kontrol-ve-suruculer`, `aksesuarlar` | evet | Yeni grubun adı üç eski kategorinin kapsamına uyuyor (alt türlerin dağılımı ölçülmedi); frekans konvertörü ve hız anahtarı gibi türler ürün satırlarıyla kendi sayfasına gitmeli |
| Ç4 | `/en/products/controls-and-accessories` | `category/controls-drives`, `category/accessories` | evet | Ç3'ün EN karşılığı |
| Ç5 | `/tr/urunler/siginak-havalandirma` | `kategori/siginak-havalandirma`, `uygulama-alani/siginak` | evet | Design bu kararı zaten yazmış: sığınak mekânı ayrı sayfa açmıyor, ürün grubuna bağlanıyor; mekân adresi yalnız eski yönlendirme için duruyor |
| Ç6 | `/tr/urunler/sensorler-ve-koruma` | `kategori/sensorler-ve-koruma`, `kategori/yedek-parcalar-ve-sensorler` | evet | İki eski kategori yeni tek türde birleşiyor (Design kimliği `spare-parts-sensors`) |

Bu bölümde Recep'e giden soru kalmadı (OPS düzeltmesi, 9 Kasım): A6, A7 ve Ç1+Ç2 geçiş tablosu (URN-157) sırasında 6 Kasım yol haritasına göre çözülür. Öteki satırlar öneridir, onay beklemez; tablo yazılırken tutarlılığı ölçülür.

## 4 Kararlar

| Tarih | Karar | Not |
|---|---|---|
| 2026-11-09 | 308 sahipliği: URUN tablo ve yönlendirme, ALTYAPI rota dili ve arama yönlendirmesi, GEO-SEO ölçüm | SEO-76 görüşü, OPS bölüşümü |
| 2026-11-02 | Yeni sitede tek önek: `/urunler`, `/uygulama-alanlari`, `/rehber`, `/destek` | 9 Kasım'da cetvele işlendi (adres-semasi v0.3, §1A) |
| karar 412 | Rafta ve eski site kartları başlatılmaz; eski sitenin yönlendirmesine yeni iş eklenmez | Yeni adres işi yeni site hattında |
| 2026-10-15 | 3-C ve B-1 yayını bekletildi; yeni adresler içerikle birlikte açılacak | Bayraklar kapalı |
| karar 59 | Barındırma Cloudflare'e taşınabilir; yönlendirme sağlayıcıya özgü yazılmaz | A6 gerekçesi |
