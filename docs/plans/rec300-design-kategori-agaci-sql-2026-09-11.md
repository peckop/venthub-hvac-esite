# Kategori ağacı — DB hazırlığı ve ekran etkisi (Emir #8, teslim 2+3) · 2026-09-11

**Kural 13 / K6 gereği hiçbir SQL çalıştırılmadı.** Ölçümler yalnız `SELECT`. Yazım URUN şeridinde, tek PR, Recep merge.
**Cetvel §9 gereği sıra:** ① bu belge = DÖKÜM (id · slug · ad · önceki değerler) → ② betik `scripts/` altına commit → ③ yazım.
**Cetvel §8 gereği:** her taşımada **iki tablo** güncellenir — `products` **ve** `product_families`. Biri atlanırsa veri doğru, vitrin sessizce yanlış kalır.

---

## 1 · DÖKÜM — etkilenen kategori satırları (bugünkü değerler)

| id | ad | slug (kanonik EN) | metadata.slug.tr | translation_key | is_active | ürün(alt) | aile(alt) |
|---|---|---|---|---|---|---|---|
| `c2f5d352-3bfb-40b2-af54-cfa95ad5c3e4` | Fanlar | `fans` | `fanlar` | `fans` | true | 0 | 0 (kökte 361 ürün) |
| `51c2c050-34ff-4deb-ae0b-f667ca7bf1d9` | Santrifüj / Radyal Fanlar | `centrifugal-fans` | `radyal-fanlar` | `sub.radial` | true | **133** | **12** |
| `98a6f650-74eb-4279-94cb-0edb0339b2e8` | Asit Dayanımlı Fanlar | `acid-resistant-fans` | `asit-dayanikli-fanlar` | `sub.acid-fans` | true | 81 | 3 |
| `f4ef8c4b-132d-4a96-b0d7-3409a05771ea` | Hava Perdeleri | `air-curtains` | `hava-perdeleri` | `sub.air-curtain` | true | 0 | 0 (kökte 8 ürün) |
| `1a87e18b-6195-48f4-8c75-2f5f5feb137f` | Yedek Parça ve Sensörler | `spare-parts-sensors` | `yedek-parca-ve-sensorler` | **null** | true | 3 | 2 |
| `bae47d92-f0f2-4039-829e-71397a060ec1` | Jet Fans | `jet-fans` | `otopark-jet-fanlari` | `sub.jet` | **false** | 0 | 0 |
| `c8d10f94-8362-4524-9c85-3b5d9cf4d202` | Otopark Jet Fanları | `parking-jet-fan` | `otopark-jet-fan` | `parking-jet` | **false** | 0 | 0 |

## 2 · DÖKÜM — taşınacak aileler (bugünkü değerler)

| id | ad | slug | series_code | category_id | subcategory_id | ürün | SKU'lar |
|---|---|---|---|---|---|---|---|
| `b4ad9135-206a-40bb-b133-a550b7838db2` | AVenS Plug Fanlar **(marka yanlış: Casals)** | `avens-plug-fanlar` | **null** | `c2f5…c3e4` (fans) | `51c2…bf1d9` (centrifugal) | **14** | AVE-248312106 · 248314103 · 248314106 · 248354103 · 248354106 · 248404103 · 248404106 · 248454106 · 248504106 · 248506106 · 248564106 · 248566106 · 248634106 · 248636106 |
| `4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733` | AVenS ENKELFAN EC Motorlu Plug Fanlar **(marka yanlış: Casals)** | `avens-enkelfan-ec-plug` | `ENKEC` | fans | centrifugal | **9** | AVE-ENKEC155 · 190 · 250 · 310 · 355 · 450 · 500 · 560 · 630 |
| `196d7854-5b06-4870-96ed-55ec742c880b` | AVenS Hücreli Aspiratörler HF/S | `avens-hucreli-hf-s` | `HF-S` | fans | centrifugal | **7** | AVE-20200 · 20210 · 20220 · 20230 · 20240 · 20250 · 20260 |
| `362cd0ae-9352-4626-a8fc-978dafd3052b` | AVenS Hücreli Aspiratörler HF/FW | `avens-hucreli-aspiratorler` | `HF-FW` | fans | centrifugal | **6** | AVE-20100 · 20110 · 20120 · 20130 · 20140 · 20150 |
| `b5c120f1-6416-49a2-9de2-dee732204680` | Vortice AD Ortam Havalı Hava Perdeleri | `vortice-hava-perdesi` | `AD` | `f4ef…71ea` (air-curtains) | **null** | **4** | VRT-65195 · 65196 · 65197 · 65198 |
| `08e5834b-7935-4ff0-970e-3c2ba8149284` | Vortice H AD Elektrikli Isıtmalı Hava Perdeleri | `vortice-h-ad-elektrikli` | `H-AD` | air-curtains | **null** | **4** | VRT-65155 · 65156 · 65157 · 65158 |

**Toplam etkilenen:** 6 aile · **44 ürün** (plug 23 · hücreli 13 · hava perdesi 8).

---

## 3 · HAZIRLANAN SQL (çalıştırılmadı)

### 3.1 İki yeni fan dalı
```sql
-- Plug Fanlar
insert into categories (name, slug, parent_id, level, translation_key, is_active, sort_order, metadata)
values ('Plug Fanlar', 'plug-fans', 'c2f5d352-3bfb-40b2-af54-cfa95ad5c3e4', 2, 'sub.plug-fans', true, 60,
        jsonb_build_object('slug', jsonb_build_object('tr','plug-fanlar','en','plug-fans')));

-- Hücreli Aspiratörler
insert into categories (name, slug, parent_id, level, translation_key, is_active, sort_order, metadata)
values ('Hücreli Aspiratörler', 'cabinet-fans', 'c2f5d352-3bfb-40b2-af54-cfa95ad5c3e4', 2, 'sub.cabinet-fans', true, 70,
        jsonb_build_object('slug', jsonb_build_object('tr','hucreli-aspiratorler','en','cabinet-fans')));
```
> `level` ve `sort_order` değerleri komşu satırlardan doğrulanmalı (bu belgede ölçülmedi; `select level, sort_order from categories where parent_id='c2f5…c3e4'`).

### 3.2 İki hava perdesi dalı
```sql
insert into categories (name, slug, parent_id, level, translation_key, is_active, sort_order, metadata) values
('Ortam Havalı Hava Perdeleri', 'ambient-air-curtains', 'f4ef8c4b-132d-4a96-b0d7-3409a05771ea', 2, 'sub.ambient-curtain', true, 10,
 jsonb_build_object('slug', jsonb_build_object('tr','ortam-havali-hava-perdeleri','en','ambient-air-curtains'))),
('Elektrikli Isıtmalı Hava Perdeleri', 'electric-heated-air-curtains', 'f4ef8c4b-132d-4a96-b0d7-3409a05771ea', 2, 'sub.electric-curtain', true, 20,
 jsonb_build_object('slug', jsonb_build_object('tr','elektrikli-isitmali-hava-perdeleri','en','electric-heated-air-curtains')));
```
> **Sulu Isıtmalı Hava Perdeleri açılmıyor** — ürünü yok. Cetvel §1 iskeleye izin veriyor; istenirse `is_active=false` ile açılır, vitrinde görünmez.

### 3.3 Aile + ürün taşıma (İKİ TABLO — cetvel §8)
```sql
-- PLUG (23 ürün / 2 aile)
update product_families set subcategory_id = (select id from categories where slug='plug-fans'), updated_at = now()
 where id in ('b4ad9135-206a-40bb-b133-a550b7838db2','4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733');
update products set subcategory_id = (select id from categories where slug='plug-fans')
 where family_id in ('b4ad9135-206a-40bb-b133-a550b7838db2','4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733');

-- HÜCRELİ (13 ürün / 2 aile)
update product_families set subcategory_id = (select id from categories where slug='cabinet-fans'), updated_at = now()
 where id in ('196d7854-5b06-4870-96ed-55ec742c880b','362cd0ae-9352-4626-a8fc-978dafd3052b');
update products set subcategory_id = (select id from categories where slug='cabinet-fans')
 where family_id in ('196d7854-5b06-4870-96ed-55ec742c880b','362cd0ae-9352-4626-a8fc-978dafd3052b');

-- HAVA PERDESİ (8 ürün / 2 aile) — category_id doğru, yalnız subcategory_id boş
update product_families set subcategory_id = (select id from categories where slug='ambient-air-curtains'), updated_at = now()
 where id = 'b5c120f1-6416-49a2-9de2-dee732204680';
update products set subcategory_id = (select id from categories where slug='ambient-air-curtains')
 where family_id = 'b5c120f1-6416-49a2-9de2-dee732204680';
update product_families set subcategory_id = (select id from categories where slug='electric-heated-air-curtains'), updated_at = now()
 where id = '08e5834b-7935-4ff0-970e-3c2ba8149284';
update products set subcategory_id = (select id from categories where slug='electric-heated-air-curtains')
 where family_id = '08e5834b-7935-4ff0-970e-3c2ba8149284';
```
**Beklenen etkilenen satır:** `product_families` 6 · `products` 44.

### 3.4 Ad ve kimlik düzeltmeleri
```sql
-- Radyal: yalnız görünen ad; slug ve tr slug DOĞRU, dokunulmuyor → 301 YOK
update categories set name='Radyal (Santrifüj) Fanlar', updated_at=now()
 where id='51c2c050-34ff-4deb-ae0b-f667ca7bf1d9';

-- Korozyon (Recep 11-09): ad + TR slug; kanonik EN slug DEĞİŞMEZ
update categories set name='Korozyon Dayanımlı Fanlar',
 metadata = jsonb_set(metadata, '{slug,tr}', '"korozyon-dayanimli-fanlar"'), updated_at=now()
 where id='98a6f650-74eb-4279-94cb-0edb0339b2e8';

-- translation_key boşluğu (cetvel §4: ham c.name render YASAK)
update categories set translation_key='sub.spare-parts', updated_at=now()
 where id='1a87e18b-6195-48f4-8c75-2f5f5feb137f';

-- MARKA: Casals kaydı yok, açılır (Recep tespiti 11-09: ENKELFAN ve KENTALFAN Casals'tır, AVenS değil)
insert into brands (name, slug) values ('Casals', 'casals');
-- (Flexiva da marka kılavuzunda var ve DB'de yok; ürünü gelene kadar açılmayabilir — karar Recep'in.)

-- KENTALFAN: marka + aile adı + seri kodu + slug (ürün adlarının tamamı KENTALFAN)
update product_families set name='Casals KENTALFAN Plug Fanlar', series_code='KENTALFAN',
 slug='casals-kentalfan-plug', brand_id=(select id from brands where slug='casals'), updated_at=now()
 where id='b4ad9135-206a-40bb-b133-a550b7838db2';

-- ENKELFAN: marka + aile adı + slug (AVenS → Casals)
update product_families set name='Casals ENKELFAN EC Motorlu Plug Fanlar',
 slug='casals-enkelfan-ec-plug', brand_id=(select id from brands where slug='casals'), updated_at=now()
 where id='4b81f44f-bb67-4ac7-8bac-b7f3f6e9e733';

-- NIMAX ve NIMUS: marka Casals (Recep kararı 11-09), radyal dalında KALIR
update product_families set name='Casals NIMAX Santrifüj Fanlar', slug='casals-nimax',
 brand_id=(select id from brands where slug='casals'), updated_at=now()
 where id='25dfd5ad-4378-47f7-8e3e-974a9819294c';
update product_families set name='Casals NIMUS Santrifüj Fanlar', slug='casals-nimus',
 brand_id=(select id from brands where slug='casals'), updated_at=now()
 where id='ced432da-9b30-4407-a224-6b2ff9306ad7';
-- HF/S ve HF/FW: marka AVenS DOĞRU, dokunulmaz (Recep 11-09) — yalnız dal taşıması yapılır.
```
> **Jet ikiliği:** `jet-fans` ve `parking-jet-fan` ikisi de pasif ve boş. Cetvel §6 `parking-jet-fan`'i kanonik sayıyor. Öneri: `jet-fans` satırı kapalı kalır ve **TR slug'ı boşaltılır** (bugün `otopark-jet-fanlari`, kanonik satırın TR slug'ı `otopark-jet-fan` ile neredeyse çakışıyor; §4.1 "aynı öncelikte iki satır veri kusurudur"). SQL yazılmadı — silme/boşaltma kararı Recep'in.

### 3.5 Doğrulama kapıları (yazımdan sonra koşulur)
```sql
-- INV-AILE-KATEGORI-1 (cetvel §8) — beklenen 0
select count(*) from products p join product_families f on f.id=p.family_id
where f.deleted_at is null
  and (p.subcategory_id is distinct from f.subcategory_id or p.category_id is distinct from f.category_id);

-- Yeni dağılım — beklenen: centrifugal 97/8 · plug-fans 23/2 · cabinet-fans 13/2 · air curtains 4+4
select c.slug, count(distinct f.id) aile, count(p.id) urun
from categories c left join product_families f on f.subcategory_id=c.id
left join products p on p.subcategory_id=c.id
where c.slug in ('centrifugal-fans','plug-fans','cabinet-fans','ambient-air-curtains','electric-heated-air-curtains')
group by c.slug;
```
**Kanıt satırı (cetvel §8):** vitrin sayımı — hiç sorulmamış adres (`?v=<damga>`), `X-Vercel-Cache: MISS`, `Age: 0`, ve kategori sayfasındaki *"N ürün ailesi"* sayısı artmış olmalı. Beyan yeterli değil.

---

## 4 · 308 TABLOSU — TAM (durum: **HAZIR**, OPS kabulü 11-09; bir satır RED ile çıkarıldı)

**Terim notu (OPS 11-09):** ekran metni **"seri"**, DB tablosu `product_families`, **katalog paketi/sözleşmesinde kolon adı `aile` kalır** — üç yüzeyde üç ad, eşlemesi burada.

**Kural:** hepsi **308** (kalıcı; Next.js `permanent:true` zaten 308 döndürür, Google 301 ile eşdeğer sayar). Tek yayında, katalog paketi bittikten sonra. Kanonik, sitemap, hreflang, IndexNow (K4) aynı yayında yenilenir.

| # | Eski adres | Yeni adres | Satır | Kaynak karar |
|---|---|---|---|---|
| 1 | `/tr/category/<kategori>` | `/tr/kategori/<kategori>` | **7** | Türkçe önek (Recep 11-09) |
| 2 | `/tr/category/<kategori>/<dal>` | `/tr/kategori/<kategori>/<alt-kategori>` | **26** | Türkçe önek |
| 3 | `/tr/category/asit-dayanikli-fanlar` | `/tr/kategori/fanlar/korozyon-dayanimli-fanlar` | **1** | ad düzeltmesi (Recep 11-09) |
| 4 | `/tr/products/<aile>` | `/tr/urun/<aile>` | **47** | Türkçe önek; aile slug'ı aynı kalır |
| 5 | `/tr/products/avens-plug-fanlar` | `/tr/urun/casals-kentalfan-plug` | **1** | KENTALFAN adı + Casals markası |
| 6 | `/tr/products/avens-enkelfan-ec-plug` | `/tr/urun/casals-enkelfan-ec-plug` | **1** | Casals markası |
| 7 | `/tr/products/avens-nimax` · `avens-nimus` | `/tr/urun/casals-nimax` · `casals-nimus` | **2** | Casals markası (K17) |
| 8 | `/tr/products/<aile>?sku=<model>` | `/tr/urun/<uzun-slug>-p-<sku>` | **442** | model kanonik, `?sku=` kalkar (K3-b) |
| 9 | `/tr/products/<varyant-slug>` (mevcut varyant adresleri) | `/tr/urun/<uzun-slug>-p-<sku>` | mevcut sayı URUN'da ölçülür | model kanonik |
| 10 | `-p-<SKU-BÜYÜK>` | `-p-<sku-küçük>` | kural (satır değil) | §2.1 harf hükmü |
| 11 | `/tr/brands/<marka>` | `/tr/markalar/<marka>` | **7** | Türkçe önek |
| 12 | `/tr/cart` · `/tr/checkout` | **tabloya girmez** — kip kapalı davranışı mevcut, değişmez | **0** | OPS RED 11-09: K1 "sepet ölmedi, satış kipi KAPALI"; 410 kalıcı yok demek olur, kip açılınca Google sıfırdan öğrenir. Bugün ne döndüğü (302 / noindex) URUN ölçer |

**Toplam:** 7 + 26 + 1 + 47 + 1 + 1 + 2 + 442 + 7 = **534 satır** (+ varyant slug'ları, URUN ölçer). Bunun **442'si model adresi** ve zaten paket yayınında tek seferde yazılıyor; kategori/aile tarafı **92 satır**. `/tr/cart` ve `/tr/checkout` tabloda **yok** (OPS RED 11-09).

**Alt kategori taşımasının 308 maliyeti SIFIR:** 44 ürün alt kategori değiştiriyor (plug 23 · hücreli 13 · perde 8) ama ürün adresinde alt kategori geçmiyor. K3-b'nin "sondaki kodla çözülür" kararının ölçülmüş ilk faydası bu.

### Eski tablo (kayıt)

| Eski | Yeni | Kod | Sebep |
|---|---|---|---|
| `/tr/kategori/fans/radyal-fanlar` | — | **yok** | slug değişmiyor, yalnız görünen ad |
| `/tr/kategori/fans/asit-dayanikli-fanlar` | `/tr/kategori/fans/korozyon-dayanimli-fanlar` | **308** | TR slug değişiyor; kanonik EN sabit |
| `/tr/urun/avens-plug-fanlar` | `/tr/urun/casals-kentalfan-plug` | **308** | aile adı + markası düzeltiliyor |
| `/tr/urun/avens-enkelfan-ec-plug` | `/tr/urun/casals-enkelfan-ec-plug` | **308** | marka düzeltiliyor |
| `/tr/urun/avens-nimax` | `/tr/urun/casals-nimax` | **308** | marka düzeltiliyor |
| `/tr/urun/avens-nimus` | `/tr/urun/casals-nimus` | **308** | marka düzeltiliyor |
| 44 ürün adresi | — | **yok** | ürün adresinde dal geçmiyor (`/products/<slug>-p-<sku>`) |
| 4 yeni dal adresi | — | **yok** | yeni adres, öncesi yok |

Yani **44 ürünün hiçbiri yönlendirme gerektirmiyor** — dal değişimi adresi bozmuyor. Toplam iki adet 308.

---

## 5 · Ekran etkisi (v18 kareleri)

| Kare | Bugün | Değişiklik |
|---|---|---|
| **A1 · menü paneli** | Fanlar 8 dolu dal | **10 dal** (Plug Fanlar · Hücreli Aspiratörler eklenir); Hava Perdeleri 0 → **2 dal** |
| **B3 · kategori sayfası** | Hava Perdeleri **mod 3** (dal yok → seri listesi) | 2 dal olunca **mod 1 vitrin**'e geçer (K8: mod dal sayısından türer) |
| **B3 · Fanlar** | "361 ürün · 8 dal" | "361 ürün · **10 dal**" · dal gridine iki kart |
| **B4 · dal sayfası** | Radyal "133 ürün · 12 aile" | "**97 ürün · 8 aile**"; açıklamaya tek cümle: *"Salyangoz gövdeli radyal fanlar. Gövdesiz (plug) ve kabinli (hücreli) modeller ayrı dallarda."* + iki komşu dal bağlantısı |
| **B5 · filtreli liste** | Radyal 133 model | 97 model; **muhafaza faseti** (hücresiz · hücreli · plug) süzgeç sütununa girer |
| **B6 · aile sayfası** | — | KENTALFAN aile başlığı ve adresi değişir (`avens-kentalfan-plug`) |
| **Breadcrumb** | 44 ürün "… / Radyal" ya da "… / Hava Perdeleri" | 23 ürün "… / Plug Fanlar", 13 ürün "… / Hücreli Aspiratörler", 8 ürün "… / Ortam Havalı ‹veya› Elektrikli Isıtmalı Hava Perdeleri" |
| **Sitemap** | — | +4 kategori × 2 dil = **8 satır**; iki 308 satırı |
| **Ana sayfa kategori kartı** | Hava Perdeleri "8 ürün" | "8 ürün · 2 dal" |

---

## 6 · Alan ↔ ekran haritası (DESIGN-KATALOG'a borçlu olan)

Hangi veri alanı hangi ekranda görünür — katalog sözleşmesinin "zorunlu mu" kolonu bu tablodan türer.

| Alan | Ürün sayfası | Model kartı | Aile tablosu | Süzgeç (faset) | Slug | Karşılaştırma | Seçici |
|---|---|---|---|---|---|---|---|
| `sku` | başlık altı | kart üstü | satır | — | **kimlik** | satır | kanıt satırı |
| `debi_m3h` | teknik tablo | ✔ | ✔ | ✔ aralık | ✔ (tipe göre) | ✔ | **girdi** |
| `basinc_pa` | teknik tablo | ✔ | ✔ | ✔ aralık | ✔ | ✔ | **girdi** |
| `cap_mm` | teknik tablo | — | ✔ | ✔ liste | ✔ | ✔ | — |
| `guc_w` | teknik tablo | ✔ | ✔ | — | tipe göre | ✔ | hesap |
| `ses_dba` | teknik tablo | — | ✔ | ✔ eşik | — | ✔ | hüküm |
| `devir_dk` | teknik tablo | — | ✔ | — | — | ✔ | **kaydırıcı** |
| `akis_tipi` | teknik tablo | — | — | ✔ | ürün tipi kelimesi | ✔ | — |
| `muhafaza` | teknik tablo | — | — | **✔ (yeni)** | ürün tipi kelimesi | ✔ | — |
| `motor_tipi` (AC/EC) | teknik tablo | rozet | ✔ | ✔ | — | ✔ | — |
| `faz` | teknik tablo | ✔ | ✔ | ✔ | — | ✔ | — |
| `atex` | **rozet** | rozet | ✔ | ✔ | — | ✔ | uyarı |
| `duman_sinifi` | rozet | rozet | — | ✔ | — | ✔ | — |
| `malzeme` | teknik tablo | — | — | ✔ | — | ✔ | — |
| `ip_sinifi` | teknik tablo | — | — | ✔ | — | ✔ | — |
| `aciklama_tr/en` | Source Serif paragraf | — | — | — | — | — | — |
| `gorsel` | beyaz kutu | kart | — | — | — | — | — |
| `belge` (föy·çizim·sertifika) | üç düğme | — | — | — | — | — | — |

**Ölçülmüş boşluk:** `akis_tipi · muhafaza · motor_tipi · atex · duman_sinifi · malzeme · ip_sinifi` alanları **bugün yok** — ATEX/EC/F400 ürün adından okunuyor (ad taramasıyla: ATEX 53 ürün/4 dal · EC 14/2 · F400 10/1; EC'nin gerçek sayısı kesinlikle daha yüksek). Bu alanlar açılmadan ne faset sütunu ne ATEX sayfası dolar. `belge` alanı ve tablosu da yok (REC-145).

---

## 6.5 · Pasif kayıtlar — "asla silinmez" maddesi Recep kapısında (§1 yeniden yazımı)

Recep tespiti (11-09): *"silinecek gereksiz bir kategoriyi sonsuza dek taşımak saçma."* Cetvel §8'in sonu bunu zaten kabul ediyor: 2026-09-08'de 7 boş kategori sildirildi, *"karar cetveli ezer; §1'in yeniden yazımı Recep kapısında."*

**Ölçüm (11-09) pasif satırları üçe ayırıyor:**

| Satır | Ürün | Karşılığı | Hüküm |
|---|---|---|---|
| `commercial-ventilation` (kök, pasif) | 0 | yok | **silinebilir** |
| `residential-ventilation` (kök, pasif) | 0 | yok | **silinebilir** |
| `inline-duct-fans` (Kanal İçi Hayalet) | 0 | Lineo'nun **19 ürünü** artık `duct-fans`'te | **silinebilir** (eski adres, gereksiz) |
| `jet-fans` | 0 | kanonik ikizi `parking-jet-fan`; adında "jet" geçen 21 ürün **SEAT JET** serisi, otopark jeti değil | **silinebilir** (ikiz fazlalık) |
| `ex-proof-atex-fans` | 0 | adında ATEX geçen **52 ürün** | **silinmez** — boş değil, beklemede; aktive edilecek |
| `parking-jet-fan` | 0 | cetvel §6 kanonik (Vortice VORT JET R) | **silinmez** — iskele |
| `rectangular-duct-fans` | 0 | **1 ürün** bekliyor (AVenS dikdörtgen kanal); README eşiği 5 | **silinmez**, ama ebeveyni silinirse Fanlar altına taşınır |

**§1 yerine önerilen ölçüt (üç soru):** (a) marka kataloğunda karşılığı var mı · (b) bekleyen ürün sayısı kaç · (c) adresi indekslenmiş mi. Üçü de "yok" ise satır silinir; silme cetvel §9 dökümüyle yapılır (id · slug · ad · önceki değerler, betik `scripts/` altında). Böylece iskele fikri korunur ama ölü satır süresiz taşınmaz.

SQL yazılmadı — silme geri dönüşsüzdür, karar Recep'in.

## 7 · Recep kapısında bekleyen üç karar

1. **Plug Fanlar ve Hücreli Aspiratörler dal olsun mu?** (Design önerisi: evet — piyasada ayrı satın alma sınıfı; Nicotra ve Systemair ayrı hat olarak satıyor.) Alternatif: dal açılmaz, yalnız `muhafaza` faseti tanımlanır, Radyal 133 kalır.
2. **`jet-fans` satırının TR slug'ı boşaltılsın mı** (kanonik `parking-jet-fan` ile çakışma riski, §4.1)?
3. **Pasif satırların silinmesi** (§6.5): dört satır silinebilir, üçü kalır. §1'in yeniden yazımı buna bağlı.
4. **Marka düzeltmesi KARARA BAĞLANDI (Recep 11-09), SQL hazır:** Casals markası açılır ve **4 aile / 53 ürün** bağlanır — ENKELFAN (9) · KENTALFAN (14) · NIMAX (15) · NIMUS (15). **HF/S ve HF/FW AVenS kalır** (doğru). AVenS'te 53 ürün kalır. Aile slug'ları `casals-…` olur → **4 adet 308**. **Flexiva:** ölçüm 11-09 — ne `brands` kaydı ne adında geçen ürün var; marka olarak tanımlı ama ürünü girilmemiş. Ürün gelirse katalog paketiyle girer.

— DESIGN-MENU (Fable) 2026-09-11

