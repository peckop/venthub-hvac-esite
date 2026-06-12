# B2B/Bayi Veri Katmanı — Doğrulanmış Gerçek Zemin (2026-06-11)

> **Bu dosya nedir?** Bayi modülü blueprint'inin **kanıtlı zemini.** 4 kaynaktan paralel okundu
> (Supabase canlı DB · migration+types · CodeGraph · NLM ikiz/yerel master), **çapraz-eşleştirildi**,
> ve **2 bağımsız adversaryal ajanla denetlendi** (workflow `wmpn8vfln`, 7 ajan).
> Çelişkide **canlı DB kazanır.** Bu, tahmin değil; her olgu kaynaklı + denetlenmiş.

---

## 0. MANŞET: B2B katmanı "yarı-kurulu ama kopuk/bozuk" — DATA katmanında "premium yüzey"

Sandığımdan **çok daha fazlası kurulmuş** (sadece tohum değil) — **ama hiçbiri çalışmıyor.** Tam da senin
defalarca uyardığın "dışı premium, içi boş" durumu, bu sefer **kendi veritabanında**, kanıtıyla. Bu yüzden
"hadi modül kuralım" demeden zemini okumamız hayat kurtardı: kum üstüne inşa edecektik.

---

## 1. NE VAR (doğrulandı — beklediğimden fazla)

| Varlık | Durum (canlı DB) |
|---|---|
| `organizations` | **3 satır** — Standart/Bayi/Kurumsal Organizasyon, `tier_level` 1/2/3, hepsi aktif |
| `price_lists` | **3 satır** — `user_type` ile segmentli: dealer / corporate / individual (Bayi listesi id `d97fff9d…`) |
| `product_prices` | tablo var, **yapısal olarak seed-ready** (UNIQUE(product_id,price_list_id,valid_from) + 3 CASCADE FK) |
| `user_profiles.organization_id` | kolon **var** (uuid, nullable) |
| `user_projects` / `project_items` | BOM/proje tohumu tabloları var |
| `user_invoice_profiles` | kurumsal vergi profili (company_name/tax_number/tax_office) var |
| `cart_items.price_list_id` + `venthub_order_items.*_snapshot` | fiyat-snapshot kolonları **var** |
| Servis katmanı (kod) | `pricing/project/invoice/cart.service.ts` **tam ve DI'lı** |

## 2. NE BOZUK / KOPUK (doğrulandı — neden hiçbiri çalışmıyor)

1. **`product_prices` = 0 SATIR.** Hiçbir ürünün dealer/corporate fiyatı yok → her ürün flat `products.price`'a düşer.
2. **Bayi rolü DB'de İMKANSIZ.** `user_profiles.role` CHECK'i yalnız staff rollerine izin verir
   (`super_admin/admin/warehouse/sales/viewer/user`). **`dealer`/`corporate` DB'de geçersiz** → kimse bayi *olamaz*.
3. **Fiyat mantığı ASLA ateşlenmez.** `pricing.service.ts` fiyatı `price_lists.user_type === role` ile eşler;
   rol asla 'dealer' olamayacağı için **daima fallback** (`product.price`). (Veri dolu olsa bile çalışmazdı.)
4. **`organization_id` ölü:** organizations'a **FK yok**, veri boş, üyelik zorlanmıyor.
5. **Tier/rol → fiyat-listesi eşlemesi HİÇBİR YERDE yok** — ne kolon, ne FK, ne RLS. "Hangi bayi hangi listeyi görür" kararsız.
6. **Sipariş/sepet → bayi/org bağı YOK** (`venthub_orders`/`shopping_carts`'ta organization_id yok).
7. **5 tablo VERSİYON KONTROLÜ DIŞINDA:** `organizations/user_projects/project_items/price_lists/product_prices`
   CREATE TABLE'ı **hiçbir migration'da yok** (dashboard/elle kurulmuş) → reproducibility/CI riski.
8. **3 tablo `tenant_id` taşımıyor** (organizations/user_projects/project_items) → CLAUDE.md kural 12 ihlali / data-bleeding.
9. **RLS boşlukları:** organizations'ta yazma politikası yok (yalnız service_role); fiyat tablolarında **user_type daraltması yok** (seed edilince individual, dealer fiyatını görebilir).

## 3. DRIFT — NLM ikiz/master MD bayat (canlı kazandı)

- NLM API auth **süresi dolmuştu**; ajan aynı içeriği **yerel `docs/database_schema_master.md`'den** okudu (4/4 kaynak fiilen geldi).
- Master MD **bayat** bulundu: `venthub_orders.id`'yi **text** sanıyor (canlı: **uuid**); eski `user_invoice_profiles` şeması (tckn/vkn/e_invoice — canlı'da **yok**, `tax_number` var); `organization_id`'yi atlıyor.
- `row-level-security.md` (NLM source) = **jenerik Supabase dokümanı**, VentHub'a özel değil → bayi RLS için yanıltıcı.
- → `nlm-twin-boundaries` memo doğrulandı: şema "var mı / kaç / tip" için **CodeGraph/canlı kazanır.**

## 4. DENETİM SONUCU (adversaryal — "denetlet" kanıtı; rubber-stamp DEĞİL)

İki bağımsız denetçi eşleştirmedeki **iddiaları çürüttü** ve **eksikler** buldu:

- **ÇÜRÜTÜLDÜ — "priceListId uçtan uca bağlı" YANLIŞ.** Sepet→sipariş **snapshot bacağı kodda BAĞLI DEĞİL:**
  `iyzico-payment` edge fonksiyonu order item'ları `price_list_id_snapshot`/`unit_price_snapshot` **olmadan** yazar.
  Snapshot kolonları var ama **hiçbir kod doldurmuyor** — bağlantı `cart_items`'ta bitiyor.
- **ÇÜRÜTÜLDÜ/GENİŞLETİLDİ — İKİ UYUMSUZ fiyat çözücü var.** `pricing.service.ts` (frontend, skaler `user_type`)
  **vs** `order-validate` edge fn (server, `allowed_user_roles`/`organization_tiers`/`is_default` dizileri). Ama bu
  **kolonlar canlı'da YOK** → edge çözücü ölü (tüm listeler geçer). İki sözleşme de farklı, ikisi de bozuk.
- **EKSİK bulundu:** `price_lists`/`product_prices`'ta **anon SELECT** politikası (kimliksiz ziyaretçi aktif
  fiyat listelerini görebilir); order_items'ta **çift fiyat modeli** (legacy `price_at_time/unit_price` vs snapshot)
  = çift doğruluk-kaynağı; `order-validate`'te PostgREST sorgu hatası (literal boşluk); `moderator` rolü de DB-geçersiz.

**Her iki denetçi verdict'i: `minor-fixes`** (zemin sağlam/okunabilir; bulgular gerçek ama yıkıcı değil).

## 5. BUNUN ANLAMI — ilk faz "modül kur" DEĞİL, "uzlaştır + onar + versiyonla"

Bayi modülünü sıfırdan kurmuyoruz; mevcut yarı-kurulu katmanı **çalışır hale getirip versiyona alıyoruz**, sonra ileri inşa:

1. **Bayi-kimliği kararı:** role CHECK 'dealer'ı engelliyor → ticari segmenti staff-rolünden ayır (ayrı `user_type`
   kolonu veya org-üyelik tabanlı). Dual-enum çelişkisini çöz.
2. **İki fiyat çözücüyü tek sözleşmeye indir** (frontend skaler vs edge dizi — biri seçilip diğeri kaldırılmalı).
3. **5 out-of-band tabloyu versiyonlu migration'a al** (reproducibility).
4. **Eksik `tenant_id`'leri ekle** (3 tablo) + RLS'i {authenticated}+tenant_id'ye taşı.
5. **Eksik bağları kur:** org↔price_list, order/cart↔org, cart→order snapshot yazımı.
6. **RLS düzelt:** anon ifşa, user_type daraltma, organizations yazma politikası.
7. **SONRA** seed + ileri inşa (bayi hiyerarşisi, deal registration, CPQ — `dealer-network-standard.md`).

> Bu liste artık **tahmin değil, kanıt.** Blueprint'in iskeleti budur.

## 6. Provenance

Workflow `wmpn8vfln` · 7 ajan · 182 araç çağrısı · ~708K token · 4 kaynak (Supabase canlı DB birincil ·
migration+types · CodeGraph · NLM yerel master) · 2 adversaryal denetçi. Tüm "high confidence" olgular ≥2 kaynakta
uyuştu veya canlı DB ile doğrulandı. Tam çıktı: workflow task `wmpn8vfln`. İlgili: `dealer-network-standard.md`,
`admin-standard.md`, memory `avensair-dealer-focus`.
