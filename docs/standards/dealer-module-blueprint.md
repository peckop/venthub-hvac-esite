# VentHub Bayi Modülü — Implementasyon Blueprint (Katman 4)

> **Bu dosya nedir?** Senin "biri oturup inşa edebilir mi?" testini geçen **somut build spec'i.**
> Doğrulanmış gerçek zemine (`dealer-data-ground-truth-2026-06-11.md`) oturtuldu, her dilimi **gerçek canlı
> şemaya karşı adversaryal denetlendi** (workflow `wba9ml62h`, 8 ajan). Dört dilim de **"with-fixes" =
> buildable** verdict'i aldı; bu doküman o düzeltmeleri içeride uygulayarak yazıldı.
>
> **Build-ready mi?** ONARIM fazı (R0–R5) **build-ready** — tek bir karara bağlı: **R1 kimlik ekseni** (§2).
> "Avensair-hazır" ancak **B2 (seed)** ile karşılanır; B1 tek başına premium-yüzey (§7).

---

## 1. Doğrulanmış güncel gerçek (audit'ten İLERİ — denetim düzeltmeleri)

Canlı DB, 11 Haziran audit snapshot'ından ileri gitmiş. **"Canlı kazanır"** gereği düzeltmeler:

| Konu | Audit sanıyordu | CANLI gerçek (doğrulandı) |
|---|---|---|
| `price_lists`/`product_prices` tenant_id | yok | **VAR** (NOT NULL, FK tenants, default `d3b07384`) |
| Aynıların RLS'i | anon ifşa açık | **tenant+is_active scoped + admin-gated yazma** — ama **user_type/segment daraltması YOK** |
| `venthub_orders/order_items/cart` tenant_id | bir kısmı yok | **hepsi VAR** |

**Hâlâ bozuk olanlar (plan bunlara odaklı, hepsi canlı-doğrulandı):**
1. `user_profiles.role` CHECK `'dealer'`/`'corporate'`'a izin **vermez** → `pricing.service` `user_type===role` join'i **asla tutmaz** → her ürün flat `products.price`.
2. **İki uyumsuz çözücü** — ve `order-validate` edge fn **load-time SyntaxError ile ÖLÜ** (çift `const cors` L19/L21) + `res._text()` + PostgREST `_limit`/`select=* ` boşluk bug'ları. "Tüm listeler geçer" bile yaşanmıyor; fn hiç yüklenmiyor.
3. **Snapshot bacağı yazılmıyor** — `venthub_order_items`'ta **6** snapshot kolonu (`unit_price/price_list_id/product_name/product_sku/tax_rate/product_snapshot`) var, `iyzico-payment` map'i (L409-419) hiçbirini doldurmuyor.
4. `organizations` tenant_id'siz + sadece "Anyone can view" (yazma yok); `user_projects`/`project_items` tenant_id'siz + ~100-kat iç-içe `auth.uid()` RLS anti-pattern'i.
5. `product_prices` = **0 satır**.
6. `is_user_admin()` → `role IN ('admin','superadmin')` arar ama CHECK `'super_admin'` (alt çizgi) + **app_metadata'dan değil user_profiles'tan** okur (kural 12 gerilimi). **Latent** (her iki canlı kullanıcı `admin`, bugün ateşleniyor; ilk `super_admin` atanınca kırılır).
7. 5 tablo **CREATE TABLE migration'da yok** (VCS-dışı) + drift: `20250829` migration `price_list_id_snapshot` **text** der, canlı **uuid**.

**Sabit kimlikler (seed/migration için):** tenant `d3b07384-d113-495f-a558-8c38634e0000`; org tier 1/2/3 = `b34b027d`/`c1e63fd7`/`cdeced53`; price_list individual/dealer/corporate = `d9d138d8`/`d97fff9d`/`b3a14f1a`; products=359, product_prices=0, user_profiles=2 (ikisi de admin), tenants=1.

---

## 2. Çekirdek karar: ORG-TIER tabanlı **tek fiyat sözleşmesi** + R1 kapısı

**Tek sözleşme:** segment = **`organizations.tier_level`** (role DEĞİL). `role` staff-yetkisi olarak kalır (CLAUDE.md "yetki app_metadata'dan"). Kural: `userTier = org.tier_level` (org yok → 1/individual) → aktif `price_lists` içinden `tier_level === userTier` (veya genel) seç → `product_prices(list)` → bulunamazsa `products.price` flat. **Frontend `pricing.service` ve `order-validate` AYNI kurala iner** → sepet fiyatı = server fiyatı.

> ### ✅ R1 — KARAR VERİLDİ: **(B) organization-tabanlı, B-minimal** (2026-06-12)
> Bayi = **`organizations` satırı (şirket)**; kullanıcı `user_profiles.organization_id` FK'siyle bağlanır.
> Segment çözümü: `user → organization → tier_level → price_list`.
> - **B-minimal (şimdi):** `organization_id` FK'sini etkinleştir (kolon zaten var). Bir kullanıcı bir şirkete
>   bağlı; **birden çok kullanıcı aynı şirketi paylaşabilir** (1 veya çok kişi — ikisi de yürür). `role` CHECK'e
>   **dokunulmaz** (staff-yetkisi olarak kalır).
> - **B-full (sonra, Avensair çok-kullanıcı-rol isteyince):** `dealer_user` üyelik tablosu + şirket-içi roller
>   (Bayi Admini/Kıdemli/Junior) + self-service. **Additive** — şirket entity'si kurulu olduğu için göç yok.
> - Gerekçe: A→şirket sonradan = acı göç; B-minimal→B-full = temiz ekleme. Standart §1 "Bayi≠Kullanıcı" ile uyumlu.

---

## 3. Fazlı sıra: ONARIM (R0–R5) → İNŞA (B1–B2) + faz-başı DoD

> No-Plan-No-Code: her faz öncesi onay. Her fazda: `pnpm type-check` + `pnpm test -- --run` + `get_advisors` temiz + (mutasyon varsa) `admin_audit_log`.

| Faz | İş | Definition of Done (özet) |
|---|---|---|
| **R0** | 5 VCS-dışı tabloyu versiyonla + **drift reconcile** | Idempotent `CREATE TABLE IF NOT EXISTS` (canlıyı **birebir** yansıtan — elle yazma, canlıdan dump). **`price_list_id_snapshot` text→uuid drift'i de reconcile.** Replay sonrası diff = yalnız kasıtlı reconcile. Sıfır veri kaybı. |
| **R1** ⚠️ | Kimlik ekseni (§2 kararı) | Seçilen eksen migration'da CHECK'li; mevcut 2 profil geriye-uyumlu (default individual); değer **app_metadata claim'ine** yansır (RLS okuyabilsin); `supabase:gen`. |
| **R2** | İki çözücüyü tek sözleşmeye indir + ölü edge fn'i **yeniden yaz** | `order-validate`: çift `const cors`, `res._text()`, `_limit`/`select=* ` PostgREST typo'ları, ghost kolon dizileri **hepsi** düzeltilir (yalnız const'u kapatmak fn'i "düzeldi sanılıp" bozuk bırakır). Frontend+edge AYNI girdi→AYNI fiyat. `price_list_id IS NULL` ölü dalı kaldırılır (kolon NOT NULL). |
| **R3** | Cart→order snapshot yazımını bağla | `iyzico-payment` map'e **6** snapshot alanı (`product_snapshot` jsonb dahil) eklenir; `price_list_id_snapshot` = çözücünün seçtiği liste. **Aynı dosyadaki `itemsResp._text()` bug'ı da** düzeltilir. Yeni siparişte 6 kolon dolu (staging insert ile doğrula). Okuma tarafı snapshot-kazanır: **tüm** order-item okuma noktaları (`OrdersPage`, `AdminOrders*`, **`account/OrderDetailPage`**, fatura/e-posta) `snapshot ?? legacy` pattern'ine geçer — hiçbiri atlanmaz. |
| **R4** | `organizations`/`user_projects`/`project_items` tenant_id + RLS onar | 3 tabloya `tenant_id NOT NULL` + FK tenants; backfill **fallback değil GERÇEK tenant id** (`tenants`'tan) + sıra: ADD NULL→UPDATE→FK→SET NOT NULL. `organizations` tenant-scoped admin yazma (price_lists deseni). `user_projects`/`project_items` RLS'i düz `tenant_id=jwt_tenant_id() AND user_id=(SELECT auth.uid())`'e indir (iç-içe yığını sil). Çapraz-tenant okuma testi: başka tenant verisi görünmez. |
| **R5** | Fiyat-listesi **segment daraltması** (RLS) | `price_lists`/`product_prices` SELECT'ine segment koşulu (`account_type`/tier ↔ `user_type` + NULL=genel + `is_user_admin` bypass; anon yalnız genel). Test: individual, dealer listesini **göremez**; admin hepsini. **B2'den ÖNCE** zorunlu — yoksa seed bayi fiyatını anon'a sızdırır. |
| **B1** | Bayi-Org + Fiyat-Atama Admin paneli | `admin-standard.md` cetveline uy (K1 ortak tablo kiti, K2 URL-state, K3 RBAC 3 katman, K4 `logAdminAction`, K5 beş durum). Resource Index+Details, route-modal CRUD, DI (ilk param `supabase`), i18n+token+a11y. §8 skoru **≥20/24**. |
| **B2** | `product_prices` SEED + uçtan-uca bayi siparişi kanıtı | dealer/corporate listelerine **gerçek** fiyat (idempotency: `valid_from` **sabit**, `now()` DEĞİL → `ON CONFLICT(product_id,price_list_id,valid_from) DO NOTHING`). Kanıt: dealer hesabı ürün fiyatını individual'dan **farklı** görür → sepet → order-validate → order_item snapshot'ları doğru. **Bu faz biterse "Avensair-hazır" karşılanır.** |
| **Yan** | `is_user_admin` enum onarımı | `role IN ('admin','superadmin','super_admin')` + app_metadata'dan oku. **Latent** — B1'i bloklamaz ama ilk `super_admin` kullanıcıdan önce kapat. Ayrı küçük PR. |

---

## 4. Premium-yüzey tuzakları (denetimin armağanı — bunlara DÜŞME)

Denetim, "kurulu görünüp çalışmayan" altı şey buldu. Blueprint bunları kapatır; uygulayan **kapatıldığını doğrulamalı:**
1. **Ölü edge çözücü** — `order-validate` çift-const ile yüklenmiyor; sadece görünüyor. (R2)
2. **Ölü null-dalı** — `product_prices.price_list_id NOT NULL` iken iki çözücünün `IS NULL` fallback'i asla satır döndüremez. (R2)
3. **Ölü snapshot** — 6 kolon var, sıfır kod yazıyor/okuyor. (R3)
4. **Ölü fiyat-mantığı** — `pricing.service`'in 100+ satırı staff-role'u segment'e karşı eşlediği için daima boş. (R1+R2)
5. **Seed-önce-RLS sızıntısı** — segment daraltması olmadan seed = bayi fiyatı anon'a açık. (R5 → B2)
6. **now() seed** — `valid_from=now()` `ON CONFLICT`'i tetiklemez → tekrar seed çift satır. (B2 sabit timestamp)
+ **Tek-tenant illüzyonu:** `jwt_tenant_id()` hardcoded fallback'e düşüyor; bugün doğru tenant'a denk geliyor, ikinci tenant'ta data-bleeding. (R4 gerçek-id backfill)

---

## 5. Senin karar vermen gereken açık kararlar

| # | Karar | Öneri | Neye bağlı |
|---|---|---|---|
| **1** ⚠️ | R1 kimlik ekseni: (A) account_type vs (B) organization_id FK | Avensair "bayi=kişi" → A; "bayi=şirket/çok-kullanıcı" → B | **Senin Avensair bilgin** |
| 2 | Çözücü otoritesi: server mi, paylaşılan saf-fonksiyon mu | Server-otoriter + frontend için ortak saf modül | güvenlik |
| 3 | Segment→liste: doğrudan FK mı, tier-türevi mi | MVP: tier-türevi (tek seviye); junction sonra | standart §3 |
| 4 | B1 panel kapsamı: price_list oluşturma dahil mi | MVP: mevcut 3 listeyi kullan, sadece product_prices+atama | hız |
| 5 | İskonto oranları (dealer/corporate %) | **Senin Avensair gerçeğin** (epistemik sınır) | sözleşme |

---

## 6. Build-ready verdict

- **ONARIM (R0–R5): build-ready** — R1 kararını verdiğin an başlanabilir. Migration'lar veri-modelini, kod fazları çözücü+snapshot'ı, RLS fazları izolasyonu kurar; hepsi canlı-doğrulandı.
- **B1 tek başına ≠ Avensair-hazır.** Seed (B2) olmadan panel kurulsa bile bayi indirimi görünmez — bu, kaçındığımız "dışı premium" tuzağının ta kendisi. **"Avensair-hazır" = B2 biter.**
- Sıra kritik: **R1 → R2 → (R3) → R4 → R5 → B1 → B2.** R5, B2'den önce zorunlu (sızıntı).

---

## 7. Provenance

Workflow `wba9ml62h` · 8 ajan (4 tasarla + 4 adversaryal doğrula) · 183 araç çağrısı · ~788K token · her dilim
gerçek canlı şemaya karşı denetlendi, 4/4 "with-fixes". Zemin: `dealer-data-ground-truth-2026-06-11.md`. Standart:
`dealer-network-standard.md`, `admin-standard.md`. Strateji: memory `avensair-dealer-focus`, `standard-first-strategy`.
Tüm "DOĞRULANDI" iddiaları canlı `information_schema`/`pg_policies`/`pg_constraint`/`execute_sql` ile teyitli.
