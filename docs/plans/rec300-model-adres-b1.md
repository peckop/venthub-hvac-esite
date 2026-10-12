# REC-300 · Model adres şeması · B-1 (alt kategori tek seviye)

- Sahip: URUN · Kart: URN-85 · Durum: B-1 kod PR'ı ile depoya girdi; bayrak KAPALI
- Karar: SEO-35 = B-1 (Geo-SEO adres şeması karar belgesi, sürüm 5, 2026-10-10). Bayrak açılışı ayrı onaya bağlıdır; bu belge ve ona bağlı kod PR'ı bayrağı AÇMAZ.
- Yöneten cetveller: docs/standards/adres-semasi-standard.md · docs/standards/canonical-url-standard.md · docs/standards/rota-dili-standard.md · docs/standards/rendering-cache-standard.md · docs/standards/migration-safety-standard.md (slug indeksi) · docs/standards/yayin-gorunurluk-denetim-standard.md (Y2/Y3).
- Bağlam: docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md (Faz 3-C), docs/plans/rec300-model-adres-kategori-tr-adlari-2026-10-10.md (kategori TR adları, migration 20261010090000 canlı).

## 1. Karar (değişmez)

İki ayrı okuma vardır ve karıştırılmaz: **3-C'ye göre** sütunu #1811'in (3-C) adresiyle karşılaştırır; **bugünkü canlıya
göre** sütunu ziyaretçinin bugün gördüğü adresle. Açılışta (19 Ekim, bayrak açılınca) canlıya göre değişen her adres tek
308 ile yenisine gider.

| Yüzey | TR | EN | 3-C'ye göre | Bugünkü canlıya göre |
|---|---|---|---|---|
| Ana kategori | `/tr/kategori/<kök>` | `/en/category/<kök>` | değişmez | TR değişir (`/tr/category/<kök>` → tek 308); EN değişmez |
| Alt kategori | `/tr/kategori/<alt-slug>` | `/en/category/<alt-slug>` | DEĞİŞİR: iki seviyeli adres kalktı, TEK seviye; kategori adresinde kimlik soneki YOK | TR ve EN değişir (`<kök>/<alt>` → `<alt-slug>`, tek 308) |
| Ürün ailesi | `/tr/urun/<aile-slug>` | `/en/products/<aile-slug>` | değişmez (adresUret.ts yeniAdres) | TR değişir (`/tr/products/<aile>` → tek 308); EN değişmez |
| Model | `/tr/urun/<ad>-p-<sku>` | `/en/products/<ad>-p-<sku>` | değişmez; yayındaki liste dışı SKU aile + `?sku=` | ölçülmedi (runbook §4.1 matrisi) |
| Marka | `/tr/markalar/<slug>` | `/en/brands/<slug>` | değişmez | TR değişir (`/tr/brands/<slug>` → tek 308); EN değişmez |

EN yayını kapalıyken (`EN_YAYIN`) bütün `/en/` sayfaları noindex'tir ve site haritasında yoktur; alt kategori bunun
dışında noindex DEĞİLDİR (`robots` yalnız pasif kategoride yazılır, sitemap.ts alt kategoriyi tek segmentle ilan eder).

## 2. Eski adresler → yeni adres (tek sıçramalı 308)

| Eski | Yeni | Not |
|---|---|---|
| `/tr/category/<üst>/<alt>` (bugünkü canlı, iç içe) | `/tr/kategori/<alt-slug>` | TEK sıçrama; iki sıçrama yok |
| `/tr/kategori/<üst>/<alt>` (3-C'nin iki seviyeli adresi) | `/tr/kategori/<alt-slug>` | aynı hedef |
| `/en/category/<üst>/<alt>` | `/en/category/<alt-slug>` | EN karşılığı |
| pasif kategori | aktif üstü varsa üstün adresi, yoksa `/tr/urunler` | 7 pasif kategori; hedef haritada güncellenir |

Üst slug'ı karar vermez: yanlış üstle istenen iç içe adres de aynı kanonik adrese gider.

## 3. Kapsam ve bayrak

- Bayrak ADRES_SEMASI_K3B (src/config/features.ts) KAPALI kalır. Bayrak kapalıyken canlıda davranış farkı SIFIRDIR; yeni davranış yalnız bayrak açıkken çalışır.
- Bu PR'da DEĞİL: next.config.mjs kural silmesi, eski-adres-haritasi.json yeniden üretimi (ALTYAPI), #1811 (3-C ikinci PR) rebase'i, bayrak yazımı, kategori slug indeksi migration'ı (ayrı PR).
- Aile ve model adresi bugünkü K3-b kodunda zaten bu biçimde üretilir (adresUret.ts); aile slug 47/47 tekil (ölçüm 2026-10-10). Tek fark kategori adresinin kuruluşudur.

### Kod haritası (bu PR)

| Dosya | Değişiklik |
|---|---|
| src/utils/adresUret.ts | kategori nesnesi `dal` verilince `/<bölüm>/<dalın-slug'ı>` üretir (üst adrese girmez), iki dilde; kapalı kip (`bugunkuAdres`) aynı |
| src/lib/data/kategoriSegmenti.ts | `kategoriKanonikAdresi` üstten bağımsız; `kategoriRotasiniUygula` iki segmentli isteği `istenen` ne olursa olsun 308 yapar; aktif kategori için üst sorgusu ödenmez; yeni `kategoriIcIceAdresiYonlendir` (`Promise<never>`) |
| src/app/[lang]/kategori/[kok]/[[...dal]]/page.tsx | rota klasörü KORUNDU; `istenen` yalnız ilk segmentten kurulur; iç içe adreste `generateMetadata` boş; `generateStaticParams` her aktif kategoriyi kendi TR slug'ıyla üretir |
| src/app/[lang]/category/[categorySlug]/page.tsx | EN alt kategori burada çizilir; K3-b `generateStaticParams` kök + alt |
| src/app/[lang]/category/[categorySlug]/[subCategorySlug]/page.tsx | bayrak açıkken iki dilde yalnız yönlendirir; bayrak kapalı dal aynen |
| src/app/_components/kategoriSayfasi.tsx | `ust` prop'u kalktı (kanonik adres üstten bağımsız) |
| src/config/markaYonlendirmeleri.mjs | k3b hedefi tek segment; kapalı dal aynı |
| src/utils/yuzeyAdresleri.ts, src/lib/adres/eslestirici.ts, src/lib/adres/tazelemeYollari.ts, src/lib/seo/jsonld.ts, src/app/sitemap.ts | yorum güncellemeleri; davranış değişmedi (eşleştirici hedefini `adresUret`'ten alır, otomatik tek segment oldu) |

## 4. İş sırası

| # | İş | Sahip | Bekler |
|---|---|---|---|
| 1 | Kategori slug dil başına benzersizlik ölçümü + migration taslağı | URUN | — |
| 2 | B-1 kod PR'ı (master'a, bayrak KAPALI) | URUN | — |
| 3 | Bağımsız okuyucu: bayrak kapalıyken fark sıfır + tek sıçrama kanıtı | URUN-doğrulayıcı | 2 |
| 4 | Migration PR'ı: kategori slug dil başına benzersiz indeks (kural 13; şema tabanı aynı gün yenilenir; gölge denemesi birleşmeden önce koşar) | URUN yazar ve birleştirir (kural 13, karar 224: Recep'in onayı işi koşan URUN penceresinde verilir) · ALTYAPI taban | Recep onayı, gölge koşusu |
| 5 | Eski→yeni harita yeniden üretimi (441 ürün / 47 aile / 35 kategori; kategori hedefleri tek seviye) | ALTYAPI | 2 birleşmiş |
| 6 | #1811'i B-1 koduyla güncelle (master'a rebase, harita commit'i, bayrak true kalır, E2E kalıpları tek seviyeye) | URUN | 2 ve 5 |
| 7 | Önizleme + 243 adres matrisi, SOĞUK önbellekle | ALTYAPI | 6 |
| 8 | Tam doğrulama: adres-yayin-denetim, link-tara, bot-karnesi, sayfa-kalite | GEO-SEO | 7 |
| 9 | canli-kapi kategori sayacı iki adres kipinde + llms.txt bağlantıları | GEO-SEO | — |
| 10 | Yayın: #1811 birleştirme + yayın günü ölçümleri (Y2) | OPS birleştirir · URUN + GEO-SEO ölçer | 8, yayın onayı |

İndeks YAYINDAN ÖNCE uygulanmış olmalıdır (adım 4 → adım 10).

## 5. Riskler

- Kök ile alt slug aynı olursa tek seviyede çakışır: adım 1 ölçtü (aşağıda), adım 4 indeksi kalıcı korur.
- Bugünkü canlı `/tr/category/<kök>/<dal>` yayında tek sıçramayla yeni adrese gitmeli; haritada ve matriste ölçülür (adım 5-7).
- Pasif kategori hedefleri aktif üste gider; hedef güncellenir.
- Migration onayı gecikirse yayın kayar.
- Rota dosyası `kategori/[kok]/[[...dal]]` korunur; `generateStaticParams` DEĞERLERİ değişti (param şekli `{lang, kok, dal}` aynı). Bayrak açıkken derlenen kategori sayfası 35 → 56 (28 TR + 28 EN; +21 EN alt kategori); bayrak kapalıyken sayı bugünkü ile aynı. Shard ve derleme planı ALTYAPI'dadır, haber verilir.

## 6. Ölçümler ve ölçülmeyenler

Ölçüldü (2026-10-11):

- Slug tekrarı (repodaki taban fikstürü + migration 20261005100000 ve 20261010090000 uygulanmış hâli): 35 satır, 28 aktif = 7 kök + 21 dal; aktif TR slug tekrarı YOK, EN tekrarı YOK, TR slug ile başka kategorinin EN slug'ı çakışması YOK, kök TR = dal TR YOK. Fikstürün kendisi 17 dal diyor (eski), 21 doğrudur.
- Canlı veritabanı (salt-okuma SELECT): categories 35 satır, TR slug tekrarı 0 grup, EN slug tekrarı 0 grup, benzersizlik indeksi henüz yok.

Ölçülmedi:

- Google'ın tek seviyeli kategori adresini nasıl yeniden indeksleyeceği (yayın sonrası +1/+7/+28 gün, Search Console).
- Vercel önizlemede soğuk önbellek davranışı (adım 7'de ölçülür).
- Gerçek HTTP 308 (middleware ve sayfa) ve `next build`: bayrak kapalı, yerelde build yok; açılış öncesi önizlemede ölçülür.

## 7. Açılış öncesi takipler (ayrı kayıt)

- scripts/seo/bot-karnesi.mjs `DINAMIK_TURLER` içindeki 'alt-kategori' kalıbı iki seviyelidir; B-1'de site haritasında iki segmentli kategori adresi yoktur, bayrak açılınca karne sahte kırmızı verir. Fikstür scripts/seo/__tests__/bot-karnesi-en-yayin.test.ts de iki seviyeli. Sahibi GEO-SEO/ALTYAPI; açılıştan ÖNCE düzeltilmeli.
- Bayat yorum ve belge satırları: src/config/features.ts (kategori adresi satırı), src/app/api/webhook/supabase/route.ts (yorum ve `eskiChildPaths` döngüsü artık yeni yol üretmiyor, zararsız), docs/standards/adres-semasi-standard.md Dal satırı, docs/standards/rendering-cache-standard.md ilgili satır, docs/plans/rec-adres-agac-tek-yayin-2026-09-07.md (ALTYAPI'nın dizini).
- Webhook testlerinde (U12-q/r) adres artık üstten bağımsız; alt sayfa tazeleme mantığı doğru, yalnız iç içe yol üretimi kalktı.
