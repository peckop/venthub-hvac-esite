# Arama Cetveli (`arama-standard.md`)

> **Bu cetvel neyi yönetir:** müşterinin sitede bir şey araması — ne aranır, nasıl normalize
> edilir, ne bulunur, ne sırayla gösterilir, hangi yüzeyde görünür ve hangi kapı ölçer.
>
> **Niçin var:** 2026-09-15'te ölçüldü — dokuz gerçek aramanın **beşi tam sıfır** dönüyordu ve
> **hiçbir kapı bunu görmüyordu**. 76 cetvelin hiçbiri aramayı yönetmiyordu. Arama, hata yapmanın
> serbest olduğu tek yüzeydi. Bu dosya o boşluğu kapatır.
>
> **Sahibi:** URUN şeridi. (Ölçüm: `docs/standards/*.md` ekleyen commit'lerin şerit öneki —
> URUN 11, ALTYAPI 6, OPS 3; konu sahibi kendi cetvelini yazar, claim dizin değil **dosya**
> düzeyindedir. OPS teyit etti 2026-09-15.)
>
> **İlgili cetveller:** `product-schema-standard.md` (aranan alanların kaynağı) ·
> `category-taxonomy-standard.md` (kategori adı/slug SSOT) · `denetim-izi-standard.md` ·
> `rendering-cache-standard.md` (yalnız arama **sayfası** için — overlay için değil, §2).

---

## 1. Kapsam ve yüzeyler

Sitede arama **üç** yüzeyde yaşar. Üçü de bu cetvele tabidir.

| # | Yüzey | Nerede | RPC | Bugünkü tavan |
|---|---|---|---|---|
| Y1 | Öneri kutusu | `SearchOverlay`, yazarken | `get_search_suggestions` | 4 ürün + 2 kategori + 2 marka |
| Y2 | Tam arama listesi | `SearchOverlay`, Enter | `fts_search_products` | 20 satır (istemcide) |
| Y3 | Arama sonuç sayfası | **henüz yok**, Recep kararı 2026-09-15 ile açılacak | Y2 ile aynı gövde | sayfalama |

**Dördüncü bir RPC daha var:** `admin_search_products`. Admin yüzeyi müşteri aramasından ayrı bir
sorundur ve **bu cetvelin kapsamı dışındadır** — ama var olduğu burada yazılıdır ki "iki RPC"
diye sayılmasın.

**K1.1** — Yeni bir arama yüzeyi eklenirse bu tabloya satır eklenir. Tabloda olmayan yüzey
kapısızdır ve kapısız yüzey sessizce bozulur.

## 2. Hangi cetvel neyi yönetir (yanlış atıf yapılmasın)

**K2.1** — Y1 ve Y2 **istemci tarafı** yüzeylerdir (`SearchOverlay`, `ssr: false`). Bunlar statik
vitrinde görünmez, bu yüzden `rendering-cache-standard.md`'nin *"statik vitrinde görünen her
tablonun DB tetiği + webhook handler dalı olmalı"* kuralı **bunlara uygulanmaz.**

**K2.2** — Y3 (arama sonuç sayfası) bir rotadır ve `rendering-cache-standard.md`'ye **tabidir**:
rota sınıfını ilan eder, önbellek anahtarı `lang` ve `tenantId` içerir.

*(Niçin bu ayrım yazılı: REC-340 Faz 1 planının ilk sürümü overlay'i sayfa sanıp yanlış cetvele
atıf yaptı. Atıf yanlışsa kural da yanlış yere uygulanır.)*

## 3. Aranan ALAN kümesi (SSOT)

**K3.1** — Bir ürün şu alanların birleşiminden aranır. Liste burada tutulur; kodda ikinci bir
liste tutulmaz.

| Alan | Kaynak | Diller |
|---|---|---|
| Ürün adı | `products.name` | — |
| Ürün adı (çeviri) | `products.name_i18n` | TR + EN |
| Model kodu | `products.model_code` | — |
| SKU | `products.sku` | — |
| Marka | `products.brand` | — |
| Açıklama | `products.description_i18n` | **TR + EN** |
| Teknik özellikler | `products.technical_specs` | — |
| **Aile adı** | `product_families.name` + `name_i18n` | TR + EN |
| **Kategori adı** | `categories.name` | — |
| **Üst kategori adı** | `categories` (parent zinciri) | — |

**K3.2** — Son üç satır (kalın) **zorunludur ve sebebi ölçülmüştür.** Ürün adlarımız teknik künye
biçimindedir (`JET 20 · 1400 d/dk · 0,18 kW · 220V`); "fan", "aspiratör" gibi kelimeler ürün adında
değil **kategorisinde** yaşar. 2026-09-15 ölçümü: 441 aktif üründen ad+açıklama gövdesinde "fan"
geçen 66, ama "fan" 10 kategori ve 22 aile adında var. Bu yüzden `jet fan` sorgusu bugün
matematiksel olarak imkânsız — hiçbir tek üründe iki kelime bir arada yok.

**K3.3** — Bu tabloya alan eklemek **kapıya kol eklemeyi kapsar** (kural 14). Kapısız alan,
sessizce aranmamaya başlayabilir ve kimse görmez.

## 4. Aranan SATIR kümesi (SSOT)

**K4.1** — Her arama yüzeyi **aynı** satır evrenini görür:
`status = 'active'` **VE** `deleted_at IS NULL` **VE** tenant sınırı (§7).

**K4.2** — İki yüzeyin farklı evren görmesi kusurdur, tasarım değildir. *(2026-09-15 ölçümü:
`get_search_suggestions` `deleted_at IS NULL` süzüyor, `fts_search_products` süzmüyor. Bugünkü
etkisi sıfır çünkü yumuşak silinmiş aktif ürün yok — ama kural bugünkü veriye değil, kuralın
kendisine dayanır.)*

## 5. Sorgu normalizasyonu

**K5.1 — Aksan/Türkçe karakter körlüğü yasaktır.** `havalandirma` ile `havalandırma` **aynı**
sonucu vermelidir. Kullanıcının klavye alışkanlığı arama sonucunu belirlememelidir.

**K5.2 — Küçültme iki biçimde yapılır.** Türkçe yerel ayarında büyük `I` noktasız `ı` olur; bu
yüzden tek biçimli küçültme metinleri kaçırır. *(Aynı körlük 2026-09-15'te vaat kapısında sahada
görüldü: ekrandaki "AI-powered" metni `ai-powered` terimiyle hiç eşleşmiyordu. Aynı hata ödeme
kapısında da vardı — "Installment" ve "PCI DSS" görünmüyordu.)*

**K5.3 — Normalizasyon fonksiyonları ŞEMA-NİTELİKLİ çağrılır.** Arama RPC'leri
`SET search_path TO 'pg_catalog','public'` ile koşuyor; `pg_trgm` ve `unaccent` ise `extensions`
şemasında. Niteliksiz çağrı **çalışma anında** `ERROR 42883: function does not exist` verir ve
migration `CREATE OR REPLACE` aşamasında **hiç uyarmaz** (plpgsql gövdesi geç bağlanır).
Bu yüzden: `extensions.unaccent(...)`, `operator(extensions.%)` biçiminde yazılır.

**K5.4 — Eklenti kurulumu ayrı bir kalemdir.** `unaccent`, `vector`, `pgroonga`, `fuzzystrmatch`
2026-09-15 itibarıyla **kurulu değildir** (yalnız kurulabilir durumda). `pg_available_extensions`
tablosundaki `default_version` "kurulu sürüm" **değildir**; kurulu olan `installed_version`'dır.
Her `CREATE EXTENSION` kendi migration'ıdır ve kural 13 kapsamındadır.

## 6. Eşleştirme semantiği

**K6.1 — Çok kelimeli sorgu, kelime sırasına bağlı olmamalıdır.** `jet fan` ile `fan jet` **aynı
kümeyi** döndürür.

**K6.2 — Katı "hepsi eşleşmeli" davranışı tek başına yeterli değildir.** `plainto_tsquery` ve
`websearch_to_tsquery` ikisi de boşluğu **VE** olarak yorumlar (2026-09-15'te ölçüldü — "websearch
kullanınca VEYA gelir" **yanlıştır**). Terimler ayrı ayrı değerlendirilir ve hepsi eşleşen üste
sıralanır.

**K6.3 — Sıralı alt-dize eşleştirmesi tek dal olarak bırakılmaz.** `ILIKE '%a%b%'` biçimi
kelimelerin metinde **o sırada** geçmesini şart koşar. Bu, K6.1'i tek başına ihlal eder.

**K6.4 — Yazım hatası toleransı zorunludur.** `vortis` yazan kullanıcı `Vortice` ürünlerini
bulmalıdır. İki ölçülmüş tuzak:
- Trigram indeksini tetikleyen **`%` operatörüdür**; `similarity(...) > eşik` yazımı indeksi
  **hiç kullanmaz** (2026-09-15, `enable_seqscan=off` altında EXPLAIN ile).
- Uzun metinde doğru fonksiyon `word_similarity`'dir:
  `similarity('Vortice Vort Penta','vortis')` = 0,294 ama `word_similarity` aynı çiftte **0,714**.
  Yanlış fonksiyonla ölçülen eşik yanlış eşiktir.

**K6.5 — Eşik tahminle değil ölçümle belirlenir** ve hangi fonksiyonun eşiği olduğu yazılır.

**K6.6 — Yazım hatası yedeği hassasiyeti düşürür; tavanı vardır.** Bkz. K8.4.

## 7. Tenant ve yetki (kural 12)

**K7.1** — Arama RPC'leri **`SECURITY INVOKER`** kalır (`prosecdef = false`). Bugün üçü de öyle ve
RLS uygulanıyor; `products.tenant_id` mevcut, `prod_public_read_opt` politikası
`tenant_id = (SELECT jwt_tenant_id())` diyor. Performans gerekçesiyle `SECURITY DEFINER`'a geçmek
**tenant filtresini tümüyle kaldırır** — bu kural 12 ihlalidir.

**K7.2** — Arama metnini üreten/tazeleyen fonksiyon **tenant sınırını aşan JOIN yapamaz**
(`WHERE c.tenant_id = p.tenant_id`). Bu fonksiyon `SECURITY DEFINER` yazılırsa (tetiklerde yaygın
bir alışkanlık) başka tenant'ın kategori adını **kalıcı olarak** ürün satırına gömer — geri
alınamayan bir sızıntı sınıfıdır.

**K7.3** — Faz 2 (multi-tenant) PARK'ta olması bu kuralları askıya **almaz**.

## 8. Kapı: INV-SEARCH-* ailesi

**K8.1 — Kapı iki katmanlıdır.**
- **Katman A (her PR'da):** sorgu kurucusunun semantiği saf fonksiyon olarak, fikstürle. Canlı DB
  gerekmez. *(Gerekçe: CI'daki vitest `https://dummy.supabase.co` ile koşuyor — canlı DB'ye bakan
  bir test orada sessizce yanlış ölçer.)*
- **Katman B (canlı):** `db-advisor.yml` içinde, `db-gate-precheck.outputs.ready` koşuluna bağlı,
  psql ile RPC'leri gerçekten çağırır. Emsal: `catalog-integrity` / INV-CATALOG-1 — **"ATLANMIS IS
  YESIL DEGILDIR"** uyarısı dahil.

**K8.2 — Kapı adı mevcut aileyle hizalanır.** Depoda `INV-SEARCH-ROUTE-1` var
(`search-route-ssot.test.ts`, aramanın dil-güvenli gezinme tarafını ölçüyor). Aynı alanda biri
Türkçe biri İngilizce iki kapı ailesi taşınmaz.

**K8.3 — İddialar sabit sayıya bağlanmaz.** Katalog şeridi her gün ürün ekliyor; `= 47` diyen bir
kapı ilk ürün eklemede kırmızı yanar ve kimse ona güvenmez. İddia biçimleri: **oran**,
**sıfır-değil**, **adıyla bilinen bir ürünün varlığı**, **sıralamadaki yeri**. Kesin sayı yalnız
SKU vakasında anlamlıdır.

**K8.4 — Kapı hem alt hem ÜST sınır ölçer.** Arama düzeltmesi sıfır-sonuç sorununu
**alakasız-sonuç** sorununa çevirebilir. *(Ölçüm: aile+kategori adı gövdeye girince `jet fan`
0 → 61'e çıkıyor, yani "Fan" kategorisindeki her şey sorguya karışma riski taşıyor.)* Hiçbir vaka
aktif ürünlerin **%40'ından fazlasını** döndürmemelidir.

**K8.5 — Bugün çalışan davranış regresyon testine bağlanır.** `VRT-17160` gibi tam SKU araması
bugün **kusursuz** çalışıyor (tam 1 sonuç); yazım hatası yedeği eklenince benzer SKU'larla
kirlenebilir. Çalışan bir davranışı değiştiren her değişiklik regresyon kolu ister; bu tartışmaya
kapalıdır.

**K8.6 — Kapı, aranan alanın TAZELİĞİNİ de ölçer.** Aile adı değişince arama metni tazelendi mi —
ölçülmeyen tazeleme ilanı bedavaya yazılmış olur.

**K8.7 — İndeksin VARLIĞI ölçülür.** *(Niçin: `20250919_fts_search_products.sql` beş indeks
yaratıyor; canlıda yalnız ikisi var. Migration ya geri alındı ya hiç uygulanmadı ve hiçbir kapı
görmedi. "Uygulandı" ile "işe yaradı" arasındaki fark burada yaşıyor.)*

**K8.8 — Fiyat korunumu ölçülür.** Arama sonucu `display_price(p)` döndürür, ham `products.price`
değil (INV-PRICE-1). Ortak gövdeye geçişte kaybolma riski gerçektir.

### Asgari vaka kümesi

Aşağıdaki vakalar **taban**dır; genişletilebilir, daraltılamaz.

| # | Sorgu | Neyi ölçer | İddia biçimi |
|---|---|---|---|
| 1 | `havalandırma` | temel eşleşme | `> 0` |
| 2 | `havalandirma` | Türkçe karakter körlüğü (K5.1) | vaka 1'in **≥ %90'ı** |
| 3 | `jet fan` | gövdede aile/kategori adı (K3.2) | `> 0` |
| 4 | `fan jet` | kelime sırası bağımsızlığı (K6.1) | vaka 3 ile **aynı küme** |
| 5 | `vortis` | yazım hatası toleransı (K6.4) | markası `Vortice` olan **≥ 1** |
| 6 | `ısı geri kazanım` | çok kelimeli tamlama (K6.2) | `> 0` |
| 7 | `VRT-17160` | kesinlik **regresyonu** (K8.5) | **tam 1**, ilk satır o SKU |
| 8 | `kanal tipi fan` | üç kelime + kategori | `> 0` |
| 9 | `duvar tipi aspiratör` | dört kelime, ad'da geçmeyen terim | `> 0` |
| 10 | `ISI GERI KAZANIM` | büyük harf + noktasız (K5.2) | vaka 6 ile aynı küme |
| 11 | — (her vaka) | hassasiyet tavanı (K8.4) | aktif ürünlerin **≤ %40'ı** |
| 12 | — (Y1 ↔ Y2) | iki yüzey aynı gövde (K4.1) | **aynı ilk ürün** |

## 9. Hata yolları (kural 14)

**K9.1 — Hata, "sıfır sonuç" olarak gösterilemez.** *(2026-09-15 ölçümü: `getSearchSuggestions`
hata dalında `console.error` + `return []` yapıyor. Yani RPC çökse bile kullanıcı "sonuç yok"
görüyor.)* İki ayrı durum, iki ayrı ekran: **bulunamadı** ayrı, **arama çalışmadı** ayrı.

**K9.2 — Aynı ekranda iki hata politikası olamaz.** Bugün tam arama yolu kullanıcıya hata
gösteriyor, öneri yolu yalnız konsola yazıyor.

**K9.3 — Arama günlüğünün ön şartı K9.1'dir.** Hata sessizce sıfıra dönüştüğü sürece günlük
hatayı "sıfır sonuç" diye kaydeder; günlük yalan söyler ve "düzeldi mi" sorusu ölçülemez kalır.

## 10. Arama günlüğü

**K10.1** — Sıfır sonuç dönen her sorgu kaydedilir. Bu, "arama düzeldi mi" sorusunun **tek**
ölçülebilir cevabıdır.

**K10.2** — Günlük yazma yüzeyi anonim kullanıcıya açıktır; RLS ve kötüye kullanım sınırı
(oran sınırı, uzunluk tavanı) yazılmadan açılmaz.

**K10.3** — Günlük olmadan kullanıcı davranışı hakkında **ölçüm gibi cümle kurulmaz.** *(Niçin:
REC-340 planının ilk sürümü "müşterinin yarısı sıfır sonuç görüyor" diyordu; bu bir çıkarımdı,
ölçüm değil.)*

## 11. Tazeleme

**K11.1 — Türetilmiş arama metni, kaynak veri değişince tazelenir.** Kaynaklar: ürünün kendi
alanları, aile adı, kategori adı, kategori ağacındaki yer.

**K11.2 — Tazeleme satır-satır tetikle değil, KUYRUK + toplu işle yapılır.** *(Ölçüm: en kalabalık
kategoride 361 ürün var; `products` üzerindeki mevcut tetik her satırda Vault'tan sır okuyup
`net.http_post` atıyor. Satır-satır tazeleme tek bir kategori yeniden adlandırmasında 361 webhook
POST'u ve 361 `updated_at` bump'ı üretir.)*

**K11.3 — Tetikler koşulludur:** `WHEN (OLD.name IS DISTINCT FROM NEW.name)`. Adı değişmeyen
güncelleme tazeleme tetiklemez.

**K11.4 — Toplu tazeleme sırasında vitrin webhook'u atlanır.** Kategori yeniden adlandırmanın
vitrin tazelemesi **zaten vardır** (`on_categories_change` → handler'ın `categories` dalı); ikinci
bir yol eklemek render'a hiçbir şey katmaz, yalnız gürültü katar.

**K11.5 — Türetilmiş arama metninin yazımı `admin_audit_log`'a girmez.** Denetim izini üreten
**kaynak** değişikliktir (kategori/aile adı) ve o zaten `denetim_izi_categories` /
`denetim_izi_product_families` ile kayıtlıdır. *(Bu bir karardır ve burada yazılıdır — "hatırlanan"
değil.)*

## 12. Yapı kısıtları (uygulayan kişi için)

**K12.1 — Arama metni sütunu ÜRETİLMİŞ SÜTUN (`GENERATED ALWAYS AS`) olamaz.** PostgreSQL'de
üretilmiş sütun ifadesi yalnız **aynı satırın** sütunlarına bakabilir; alt sorgu ve başka tabloya
başvuru yasaktır. Aile adı `product_families`'te, kategori adı `categories`'tedir. Doğrusu:
**normal `tsvector` sütunu + kuyrukla tazeleme + backfill.**

**K12.2 — `unaccent` IMMUTABLE değildir** (STABLE'dır), bu yüzden indeks ifadesinde ya da
üretilmiş sütunda doğrudan kullanılamaz; IMMUTABLE sarmalayıcı gerekir. **Kurulumdan sonra
`select proname, provolatile from pg_proc where proname='unaccent'` ile doğrulanır ve sonuç
migration guard'ına yazılır.** *(Bu satır belge okumasına dayanıyor; bu veritabanında henüz
ölçülmedi çünkü eklenti kurulu değil.)*

**K12.3 — RPC imzası (`RETURNS TABLE`) değiştirilmez.** İmza değişikliği `drop` + `create`
gerektirir; `drop` mevcut `GRANT`'leri de götürür ve arama anonim kullanıcıda **sessizce ölür**.
Ortak gövde paylaşmak imza birleştirmek demek değildir.

**K12.4 — Dönüş tipi daraltılmaz.** `family_slug` ve `cover_image_path` arama sonucunun ürüne
gidebilmesi ve kapak görselini gösterebilmesi için gereklidir.

## 13. Migration kuralları

**K13.1** — Arama migration'ları kural 13 kapsamındadır: master'a merge = prod DB'ye **otomatik**
uygulama. Migration'lı PR yalnız Recep'in açık onayıyla merge edilir; şerit kendi merge etmez.

**K13.2 — Her migration guard bloğu taşır ve guard DAVRANIŞ ölçer.** Fonksiyon tanımının metnini
okumak yetmez: fonksiyon **çağrılır** ve çıktısına bakılır. *(Özellikle K5.3'teki `search_path`
tuzağı yalnız çalışma anında görünür — tanım metni temiz görünür.)*

**K13.3 — Guard yetkiyi de doğrular.** `has_function_privilege('anon', ...)` — "değişmedi"
varsayımı ölçüm değildir.

---

## Ek: bu cetvelin kendi ölçüm tabanı

Bu dosyadaki her sayı 2026-09-15'te canlı prod veritabanında (`SELECT`) ölçüldü ve üç bağımsız
inceleme tarafından doğrulandı (`plan-challenger` DB ekseni + kod/kapı ekseni, gstack
`/plan-eng-review`). Ölçüm dökümü: REC-340 yorumları · yan yana inceleme:
`docs/audits/gstack-yan-yana-2026-09-15.md`.

**Ölçülmemiş olup burada belge bilgisine dayanan tek kalem K12.2'dir** (unaccent volatilitesi) ve
bu açıkça yazılmıştır. Eklenti kurulduğunda ölçülür ve bu satır güncellenir.
