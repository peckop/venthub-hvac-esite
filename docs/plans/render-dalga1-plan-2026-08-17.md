# Render Dalga-1 — Tazeleme Zinciri Onarımı (uygulama planı)

> **İş emri:** OPS-AUDIT ataması, 2026-08-17 · **Kaynak denetim:** `docs/audits/render-stratejisi-denetimi-2026-08-16.md`
> **Cetvel (anayasa):** `docs/standards/rendering-cache-standard.md` §3
> **Bu belge PLAN'dır — kod yazılmadı.** Uygulama Recep'in dalga onayından sonra.
> **Ölçüm:** prod DB salt-okuma (tetik envanteri, tablo kolonları, satır sayıları) + kaynak okuma.
> Aşağıdaki her iddia ölçülmüştür; ölçülemeyenler "KARAR GEREKİYOR" bölümünde ayrı durur.

## Niçin bu sıra (tek cümle)

Vitrin bugün **kazara dinamik**, bu yüzden zincir delikleri görünmüyor; statikleştiren ilk PR
(Dalga-2) zincirler önceden örülmezse görselleri ve kategorileri dondurur — 1044-fiyat-satırı
vakasının birebir tekrarı. **Dalga-1 bu yüzden Dalga-2'den önce gelir.**

---

## 1. Ölçülmüş yer-gerçeği (plan bunun üzerine kurulu)

### 1.1 Mevcut tetik envanteri (prod, `pg_trigger`)

| Tablo | Tetik | Zamanlama | Olaylar |
|---|---|---|---|
| `products` | `on_products_change` | AFTER ROW | INSERT/DELETE/UPDATE |
| `categories` | `on_categories_change` | AFTER ROW | INSERT/DELETE/UPDATE |
| `inventory_movements` | `on_inventory_movements_change` | AFTER ROW | INSERT/DELETE/UPDATE |
| `product_families` | `on_product_families_change` | AFTER ROW | INSERT/DELETE/UPDATE |
| `product_prices` | `on_product_prices_ins_del` + `_upd` | AFTER ROW | INSERT/DELETE · UPDATE |

**Eksik: `product_images`, `brands`, `price_lists` — üçünün de tetiği YOK.** (Denetim doğrulandı.)

⚠️ **Yeni tetikler AFTER ROW olmak ZORUNDA.** `handle_supabase_webhook()` gövdesi `RETURN NEW`
ile biter; DELETE'te `NEW` NULL'dur. AFTER'da dönüş değeri yok sayılır (bugün 5 tablo böyle,
zararsız), ama biri BEFORE yazarsa **DELETE sessizce iptal edilir** — veri kaybı sınıfı.
Bu, plan içindeki en kolay gözden kaçacak tuzak.

### 1.2 Tetik fonksiyonu jenerik

`public.handle_supabase_webhook()` tabloyu `TG_TABLE_NAME` ile kendi okur, gövdeyi
`to_jsonb(NEW)`/`to_jsonb(OLD)` olarak yollar, sırrı Vault'tan alır. **Yeni tablo eklemek
yalnız `create trigger` demek** — fonksiyona dokunulmaz.

### 1.3 Etkilenen yüzeyler — hangi tablo NEREYİ bozuyor (kaynak okundu, varsayım yok)

| Tablo | Yüzey | Kanıt | Sonuç |
|---|---|---|---|
| `product_images` | **kartlar + PDP galerisi** | `cover_image_path` bir KOLON DEĞİL, RPC içinde `product_images`'tan lateral join ile türetiliyor (`20260812_f5b_family_rpcs.sql:63-69`, "sku sırasına göre ilk aktif varyantın ilk görseli"); PDP galerisi de aynı tablo | PDP yolu **+ keşif tag'leri** (ikisi de) |
| `brands` | **kartlar + PDP** | `fam.brand_name` enriched-families RPC'sinde `join brands b on b.id = f.brand_id` (`20260814_pricing_w4b_display_price.sql:213`) | o markanın ailelerinin PDP yolları **+ keşif tag'leri** |
| `price_lists` | **yalnız PDP fiyatı** | `display_price`'ın ikinci girdisi; PS-042 kararı: fiyat kartlarda gösterilmez | PDP yolları, **keşife DOKUNMAZ** (PS-042 ile tutarlı) |

⚠️ Marka **detay sayfası** (`/[lang]/brands/[slug]`) DB'den DEĞİL, statik
`src/data/brands.ts` (`HVAC_BRANDS`) üzerinden üretiliyor — `brands` tablosu o rotayı
etkilemez. Denetimin ima ettiğinden **daha dar** bir dal yeterli; geniş yazmak yanlış-tazeleme olur.

### 1.4 Ölçek (fan-out kararlarını bu sayılar belirliyor)

| | Değer |
|---|---|
| Aktif aile (`product_families`) | **32** |
| Kategori / alt-kategori | **31 / 18** |
| `metadata.slug` (lokalize) taşıyan kategori | **31 / 31 — hepsi** |
| Markası olan aile | 32 / 32 |
| `product_images` satırı | **0** (T069 bekliyor) |
| `brands` / `price_lists` satırı | 5 / 3 |

İki sonuç: (a) TR-yol hatası **istisna değil kural** — 31 kategorinin tamamı lokalize slug
taşıyor, yani bugün webhook'un tazelediği TR yolları neredeyse tamamen yanlış. (b) 32 aile ile
**tam fan-out ucuz** (32×2 = 64 `revalidatePath`), `price_lists` için tag icat etmeye gerek yok.

---

## 2. İş kalemleri

### W1 — Webhook'ta lokalize yol yardımcısı (K2'nin kalbi)

**Sorun:** üç dal da kategori yolunu **kanonik EN slug** ile kuruyor
(`route.ts:176-178`, `:187-189`, `:227-229`) ve `SELECT` yalnız `slug` çekiyor (`:171`, `:222`).
TR sayfası `metadata.slug.tr` ile prerender edildiği için TR yüzeyi **hiç** geçersiz kılınmıyor.

**Değişiklik:**
1. Kategori SELECT'lerine `metadata` ekle → `.select('slug, metadata')`.
2. Yolu `getLocalizedCategorySlug(cat, lang)` ile kur (`src/utils/categoryHelpers.ts:65`).
   **Bu yardımcı route handler'da güvenle kullanılabilir** — dosya yalnız `type` import ediyor
   (`db-rows`, `ui-models`), React/i18n/client bağımlılığı YOK (ölçüldü).
3. `categories` dalında `activeRecord.slug` yerine payload'daki `metadata`'yı kullan —
   tetik `to_jsonb(NEW)` yolladığı için `metadata` **zaten payload'da**, ek sorgu gerekmez.

**Dikkat:** iki dil için İKİ ayrı slug çıkar (aynı olabilirler); ikisini de tazele, tekilleştir.
Kanonik EN yolu da tazelenmeye devam etmeli (308 redirect kaynağı olsa bile prerender edilmiş
olabilir) — kaldırmak yeni bir delik açar.

### W2 — Alt-kategori (iki segmentli) yolları

**Sorun:** 14 `revalidatePath` çağrısının tamamı tek segment; `/category/[c]/[s]` hiç tazelenmiyor.

**Değişiklik:** kategori yolu kurulurken `parent_id` varsa iki segmentli yolu da üret:
`/{lang}/category/{parentLocalizedSlug}/{ownLocalizedSlug}`. Ebeveyn için ek sorgu gerekir
(`select slug, metadata from categories where id = parent_id`).

⚠️ **Ters yön de var ve denetimde YOK:** bir ÜST kategorinin slug'ı değişirse, **tüm
çocuklarının** iki segmentli yolları değişir. `categories` dalı bu durumda çocukları da
sorgulayıp (`where parent_id = <id>`, en fazla 18 satır) onların yollarını tazelemeli.
Aksi hâlde ebeveyn adı düzeltilir, alt-kategori sayfaları eski yolda donar.

### W3 — `sitemap.xml`

**Sorun:** `src/app/sitemap.ts` DB'den üretiliyor, `revalidate` ihracı YOK, webhook dalı YOK →
build'de donuyor.

**Değişiklik:** `products` / `categories` / `product_families` dallarına
`revalidatePath('/sitemap.xml')` ekle. Ek olarak `sitemap.ts`'e `export const revalidate`
(cetvelde beyan edilmiş bir değer) — webhook düşerse yedek yol kalsın.
**Ölçmediğim şey:** `revalidatePath('/sitemap.xml')`'in Next 15'te metadata rotasını gerçekten
geçersiz kıldığını bu depoda doğrulamadım → uygulamada **kabul ölçüsü şart** (bkz. §5 A3).

### W4 — Üç eksik zincir (tetik + handler dalı + cetvel satırı)

Her biri için: (a) `create trigger ... AFTER INSERT OR UPDATE OR DELETE ON <t> FOR EACH ROW
EXECUTE FUNCTION public.handle_supabase_webhook()` · (b) `route.ts`'e dal · (c) cetvel §3
tablosuna satır. **Üçü aynı migration'da olabilir** (yalnız `create trigger`, DDL riski düşük).

| Tablo | Handler dalının yapacağı | Yol çözümü |
|---|---|---|
| `product_images` | PDP yolu + **keşif tag'leri** | `product_id` → `products.family_id` → `familySlugById` (mevcut yardımcı) |
| `brands` | o markanın ailelerinin PDP yolları + **keşif tag'leri** | `select slug from product_families where brand_id = <id> and deleted_at is null` (32 aile tavanında ucuz) |
| `price_lists` | **tüm** ailelerin PDP yolları, keşife DOKUNMAZ | `select slug from product_families where deleted_at is null` — 32×2=64 çağrı |

⚠️ `price_lists` fan-out'u **32 aile** ölçümüne dayanıyor. Katalog büyürse (birkaç yüz aile)
bu dal pahalılaşır; o eşikte tag tabanlı çözüme geçilir. Bu sınır cetvele **sayıyla** yazılmalı,
yoksa sessizce yavaşlar.

⚠️ `product_images` bugün **0 satır**. Yani bu dalın doğruluğu bugün canlı veriyle
kanıtlanamaz — sabotaj/testle kanıtlanmalı (bkz. §4). T069 görselleri yüklenmeden zincir
yerinde olmalı; **lansman kritik kalem budur.**

### W5 — `getAllFamilySlugs` 96 tavanı

`family.service.ts:112-118` → `getFamiliesEnriched(supabase, { limit: 96 })`, `total_count`
kontrolü yok. Bugün 32 aile var, **tavan henüz vurmuyor** (denetim "sessizce kesiliyor" derken
gelecek riski anlatıyor, bugün zarar YOK). Katalog 96'yı geçince `sitemap` + `generateStaticParams`
sessizce eksik üretir. **Değişiklik:** `total_count` okunup tükenene kadar sayfalanmalı; ya da
tavan aşılırsa açıkça hata/uyarı. Görseller/aileler yüklenmeden yapılmalı.

### W6 — Cetvel §3 güncellemesi

Üç yeni satır + `sitemap.xml` notu + `price_lists` fan-out eşiği + "yeni tetik AFTER olmalı"
kuralı. **Bu adım kapıyı otomatik sıkılaştırır:** INV-RENDER-2 `REQUIRED_TABLES`'ı cetvelin §3
tablosundan ayrıştırıyor (`render-revalidation-contract.test.ts:362`), yani satır eklendiği anda
tetik+handler zorunlu hâle gelir. Cetveli **son değil, birlikte** güncellemek gerekir — önce
cetvel yazılırsa kapı kırmızıya döner ve sıra bozulur.

### W7 — Kapı genişletmesi (INV-RENDER-2, Dalga-1 payı)

Mevcut kapı tetik⇄handler **varlığını** zorluyor; **yolun doğruluğunu denetlemiyor** — K2 tam
bu boşlukta yaşadı. Eklenecek assert'ler:

| # | Assert | Yakaladığı hata |
|---|---|---|
| A1 | Kategori yolu kuran her satır `getLocalizedCategorySlug` çağrısından geçer; ham `category.slug` ile `revalidatePath('/tr/category/...')` YASAK | K2 (TR yüzeyi tazelenmiyor) |
| A2 | Kategori SELECT'leri `metadata` içerir | lokalize slug'ın girdisi hiç gelmiyor |
| A3 | En az bir dal iki segmentli kategori yolu üretir (`/category/x/y` deseni) | alt-kategori donması |
| A4 | En az bir dal `/sitemap.xml` tazeler | sitemap donması |
| A5 | `product_images`/`brands`/`price_lists` dalları **gövdeli** (boş blok = kırmızı) | boşaltılmış handler yeşil geçiyordu |
| A6 | Yeni tetikler AFTER (migration metninde `before ... on <t>` + webhook fn = kırmızı) | DELETE iptali |

**Yazım kuralları (bu depoda kanıtlanmış tuzaklar):** yorumları CRLF-güvenli sıy (`[^\r\n]`,
`.` değil — `/--.*$/` bu depoda hiçbir şey temizlemez); adın geçmesini değil **ÇAĞRIYI** ara
(import satırı ve açıklayıcı yorum naif assert'i tatmin eder); glob anahtarı nokta-dizinde
çizgisiz.

---

## 3. Sahiplik ve koordinasyon

| Dosya | Şerit | Not |
|---|---|---|
| `src/app/api/webhook/supabase/route.ts` | **PRICING-STOK** (`f68f03d8`) | W1/W2/W3/W4 hepsi bu dosyaya dokunuyor. Plan aşamasında DOKUNMADIM. |
| `supabase/migrations/*` (yeni tetikler) | serbest ama **migration = prod** (kural 13) | merge yalnız Recep |
| `docs/standards/rendering-cache-standard.md` | serbest (ölçüldü) | W6 |
| `src/__tests__/conformance/render-revalidation-contract.test.ts` | serbest | W7 |
| `src/app/sitemap.ts`, `src/lib/services/family.service.ts` | serbest | W3/W5 |

**Koordinasyon önerisi:** webhook dosyası tek elden değişmeli. İki yol var — (a) PRICING
W1-W4'ü kendi dalında alır (idempotens işi aynı dosyada, dal çakışması olmaz), ben W5/W6/W7'yi
alırım; (b) PRICING dosyayı oyar, hepsini ben alırım. **(a)'yı öneriyorum:** PRICING'in açık
webhook işi zaten aynı dosyada, ikinci bir dal aynı satırlarda çakışır. Karar OPS-AUDIT'te.

---

## 4. Sabotaj listesi (kapı kanıtı — her kural AYRI AYRI kırmızı gösterilmeli)

| # | Sabotaj | Beklenen |
|---|---|---|
| S1 | `getLocalizedCategorySlug` çağrısını ham `category.slug` ile değiştir | A1 KIRMIZI |
| S2 | SELECT'ten `metadata`'yı çıkar | A2 KIRMIZI |
| S3 | İki segmentli yol üretimini sil | A3 KIRMIZI |
| S4 | `/sitemap.xml` tazelemesini sil | A4 KIRMIZI |
| S5 | `product_images` dalının gövdesini boşalt (blok kalsın) | A5 KIRMIZI |
| S6 | `brands` tetiğini migration'dan sil (handler kalsın) | mevcut çift-yön kapısı KIRMIZI |
| S7 | Tersi: handler dalını sil (tetik kalsın) | öksüz-tetik KIRMIZI |
| S8 | Yeni tetiği `BEFORE` yaz | A6 KIRMIZI |
| S9 | Cetvel §3'ten `price_lists` satırını sil | `REQUIRED_TABLES` daralır → kapı sessizce YEŞİL olmalı DEĞİL; bu **kapının kendi kör noktası** (Dalga-4 işi, burada yalnız belgelenir) |

S9 bilinçli olarak "düzeltilmeyecek ama yazılacak" kalemdir: kapı tablo kümesini cetvelden
okuduğu için cetvelden satır silmek kapıyı kandırır. Koddan-türetme Dalga-4'te.

---

## 5. Kabul ölçüleri (uygulama bitişinde kanıt olarak istenecek)

- **A1** Tam vitest yeşil + INV-RENDER-2 yeni assert'leriyle; 8 sabotajın 8'i ayrı ayrı kırmızı gösterilmiş.
- **A2** Prod'da 8 tetik (`pg_trigger` sorgusu, mevcut 5 + yeni 3) ve hepsi AFTER ROW.
- **A3** `revalidatePath('/sitemap.xml')`'in gerçekten çalıştığı **ölçülmüş** olmalı
  (webhook yanıtındaki `revalidatedPaths` yeterli DEĞİL — o yalnız çağrının yapıldığını söyler).
  Ucuz kanıt: `net._http_response` defterinden 200 + sitemap içeriğinin değiştiğini görmek
  (PRICING'in bugün paylaştığı yöntem).
- **A4** TR yolunun gerçekten tazelendiğinin kanıtı: bir kategorinin `metadata.slug.tr`'siyle
  kurulan yolun `revalidatedPaths`'te görünmesi.
- **A5** Cetvel §3 tablosu 8 satır; INV-RENDER-2 `REQUIRED_TABLES` 8 tablo ölçüyor.

---

## 6. KARAR GEREKİYOR (kendim çözmedim — Recep/OPS-AUDIT)

| # | Karar | Bağlam |
|---|---|---|
| D1 | **Webhook dosyasını kim değiştiriyor** — PRICING mi, oyup bana mı veriyor | §3; önerim PRICING (aynı dosyada açık işi var) |
| D2 | `sitemap.ts`'e `revalidate` değeri kaç olacak | W3; webhook yedeği; cetvelde beyan edilecek |
| D3 | `price_lists` tam fan-out onayı (bugün 32 aile → 64 çağrı) + eşik sayısı | W4; alternatifi tag icat etmek, bugün gereksiz karmaşıklık |
| D4 | W5 (96 tavanı) Dalga-1'de mi Dalga-2'de mi | Denetim Dalga-1 diyor; bugün zarar YOK, ama T069 öncesi şart |

## 7. Kapsam DIŞI (bilinçli)

Statikleştirme (`getTenantConfig`/`headers()`, sayfalama) = **Dalga-2** · ölü tag temizliği
(`variantStockTag`/`familyTag`), `categoryIds` anahtarı, fiyat-segmenti kararı = **Dalga-3** ·
`ssr-html` spec'i CI'a bağlama, INV-RENDER-1 onarımı, sınıfsız-rota kuralı, ölü-revalidate
dedektörü = **Dalga-4** · destek/marka/`ssr:false` göçleri = **Dalga-5** · PPR: karar değişmiyor
(kullanılmıyor).
