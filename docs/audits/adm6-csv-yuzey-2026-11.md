# ADM-6 · Yönetici CSV/XLS yüzey envanteri ve güvenlik ölçümü — 2026-11-03

> **Kart:** ADM-6 (VULN-006 Faz 2) · **Şerit:** ADMIN · **Kapsam:** `src/views/admin/**`,
> `src/components/admin/**`, `src/app/admin/**`, `src/lib/**` içinde CSV/XLS üreten ya da okuyan kod.
> **Yöntem:** kod okuma (taban `40cdb71`), sunucu tarafı için migration dosyaları SALT OKUNDU
> (`supabase/migrations/**` ve `supabase/functions/**` değiştirilmedi). Canlı veritabanı sorgulanmadı.
> **Cetvel:** `docs/standards/csv-import-export-standard.md` §1.1 (dışa) · §1.2 (içe, bu işte yazıldı).
> **Önceki çalışma:** `docs/plans/vuln006-csv-formul-enjeksiyonu-2026-09-29.md` (Faz 0-1: yardımcı +
> kapı yazılmış, 16 yüzeyin göçü `BEKLEYEN_GOC` listesinde bekliyordu).

## 0. Tek cümlelik sonuç

2026-11-03 itibarıyla 16 dışa aktarma yüzeyinin **hiçbiri** formül nötrleme yardımcısına bağlı değildi
(yardımcı ve kapı vardı, göç yapılmamıştı); ayrıca 3 XLS dışa aktarımı hücreleri **HTML kaçışı olmadan**
basıyordu ve iki içe aktarıcıda boyut/satır sınırı, uzantı denetimi ve şema doğrulaması yoktu. Hepsi bu
işte `src/lib/csv/` ortak yardımcısına bağlandı; sunucu tarafında iki bulgu migration gerektirdiği için
**ayrı kayıt** olarak bırakıldı (§4).

## 1. Envanter — dışa aktarma (satırlar taban `40cdb71`'e göredir)

| # | Dosya:satır | Yön | Saldırganın etkileyebildiği alan | Bulgu | Şiddet | Durum |
|---|---|---|---|---|---|---|
| 1 | `src/views/admin/OrdersTableBody.tsx:1080` | CSV | yok (id, durum, tutar) | formül nötrleme yok | DÜŞÜK | ✅ `csvBelgesi` |
| 2 | `src/views/admin/OrdersTableBody.tsx:1088` | XLS | yok | `<td>${r.id}</td>` kaçışsız HTML | DÜŞÜK | ✅ `xlsBelgesi` |
| 3 | `src/views/admin/AdminUsersTableBody.tsx:469` | CSV | e-posta, ad soyad (müşteri kayıtta yazar) | formül nötrleme yok | DÜŞÜK¹ | ✅ |
| 4 | `src/views/admin/ReturnsTableBody.tsx:923` | CSV | müşteri adı, e-posta, iade nedeni | formül nötrleme yok | DÜŞÜK¹ | ✅ |
| 5 | `src/views/admin/ReturnsTableBody.tsx:959` | XLS | müşteri adı, e-posta, iade nedeni | **kaçışsız HTML**: `<img src=//dış-adres>` Excel'de dış istek atar, `=…` formül olur | **ORTA** | ✅ `xlsBelgesi` |
| 6 | `src/views/admin/AdminLogisticsTableBody.tsx:263` | CSV | müşteri adı | formül nötrleme yok | DÜŞÜK¹ | ✅ |
| 7 | `src/views/admin/MovementsTableBody.tsx:281` | CSV | ürün adı, neden | formül nötrleme yok | DÜŞÜK | ✅ |
| 8 | `src/views/admin/MovementsTableBody.tsx:291` | XLS | ürün adı, neden (yönetici girer) | kaçışsız HTML | DÜŞÜK | ✅ `xlsBelgesi` |
| 9 | `src/views/admin/InventoryTableBody.tsx:276` | CSV | ürün adı, depo yeri, tedarikçi | formül nötrleme yok | DÜŞÜK | ✅ |
| 10 | `src/views/admin/AdminInventoryReportPage.tsx:194` | CSV | ürün adı, neden | formül nötrleme yok | DÜŞÜK | ✅ |
| 11 | `src/views/admin/CategoriesTableBody.tsx:207` | CSV | ad, açıklama | formül nötrleme yok | DÜŞÜK | ✅ |
| 12 | `src/views/admin/CouponsTableBody.tsx:457` | CSV | kod | formül nötrleme yok | DÜŞÜK | ✅ |
| 13 | `src/views/admin/PricingRulesTableBody.tsx:481` | CSV | hedef adı | formül nötrleme yok | DÜŞÜK | ✅ |
| 14 | `src/views/admin/ProductsTableBody.tsx:860` | CSV | ürün adı | formül nötrleme yok | DÜŞÜK | ✅ |
| 15 | `src/views/admin/AuditLogTableBody.tsx:107` | CSV | aktör, satır kimliği, yorum | formül nötrleme yok | DÜŞÜK | ✅ |
| 16 | `src/views/admin/ErrorsTableBody.tsx:138` | CSV | **mesaj, url, user-agent: istemciden gelir** (`log-client-error`) | formül nötrleme yok | DÜŞÜK¹ | ✅ |
| 17 | `src/views/admin/ErrorGroupsTableBody.tsx:555` | CSV | hata mesajı, örnek url | formül nötrleme yok | DÜŞÜK¹ | ✅ |
| 18 | `src/views/admin/WebhookEventsTableBody.tsx:106` | CSV | olay tipi, sağlayıcı, hata mesajı (dış sistem) | formül nötrleme yok | DÜŞÜK¹ | ✅ |
| 19 | `src/components/admin/InventoryCsvImport.tsx:236` | CSV (hata raporu) | SKU ve hata mesajı içe aktarılan dosyadan gelir | formül nötrleme yok | DÜŞÜK | ✅ |

¹ Şiddet ALTYAPI'nın VULN-006 derecelendirmesidir (sömürü izi yok; yönetici dosyayı Excel'de açmalı).
Bu PR'dan önce kapıdaki `BEKLEYEN_GOC` listesi 16 dosyayı (1-19'un bulunduğu dosyalar) adla taşıyordu.

**Kapsamda olup CSV üretmeyen/okumayan:** `src/app/admin/**` (yalnız rota kabukları), `src/lib/**`
(CSV yalnız `lib/admin/csvProductMapping.ts` ve yeni `lib/csv/`). `src/app/api/**` içinde `text/csv`
yanıtı yok (ölçüldü: `grep text/csv`).

## 2. Envanter — içe aktarma

| # | Dosya:satır | Bulgu | Şiddet | Durum |
|---|---|---|---|---|
| 20 | `src/components/admin/products/ProductCsvImport.tsx:49` | dosya boyutu / satır sınırı yok; uzantı yalnız `accept` ipucu (seçicide "tüm dosyalar" ile aşılır) | DÜŞÜK | ✅ `csvDosyasiOku` |
| 21 | `src/components/admin/InventoryCsvImport.tsx:61` | aynı + binlerce SKU tek `.in('sku', …)` sorgusuna gidiyordu | DÜŞÜK | ✅ + 200'lük parça |
| 22 | her iki içe aktarıcı, satır bölme `split(/,(?=…)/)` | tırnak içi satır sonu kaydı ikiye bölüyor, kapanmamış tırnak sessizce yutuluyor, tekrarlı başlık önceki sütunu eziyor | DÜŞÜK | ✅ `csvAyristir` |
| 23 | `src/lib/admin/csvProductMapping.ts:142` | `status` hücresi `as` ile türe zorlanıyor (şema yok) | DÜŞÜK | ✅ zod |
| 24 | `src/lib/admin/csvProductMapping.ts:145-146` | `stock_qty`/`low_stock_threshold` `Number()` → NaN / negatif / ondalık | DÜŞÜK | ✅ zod |
| 25 | `src/lib/admin/csvProductMapping.ts:148` | `category_id` hücresi denetimsiz yazıma giriyor; kendi kategori listesinde olmayan (başka tenant / uydurma) kimlik kabul ediliyor | DÜŞÜK² | ✅ listede değilse reddedilir |
| 26 | `src/components/admin/InventoryCsvImport.tsx:104` | negatif miktar sessizce 0'a, ondalık sessizce tamsayıya kırpılıyor; SKU biçimi denetlenmiyor | DÜŞÜK | ✅ zod + satır hatası |
| 27 | `src/components/admin/products/ProductCsvImport.tsx:171` | yeni SKU'lar da `upsert(onConflict:'sku')` ile yazılıyor: aynı SKU başka tenant'ta varsa o satır güncellenirdi (yazım politikası tenant denetlemiyor, §4-A) | DÜŞÜK² | ✅ yeni satır `insert` |

² Bugün tek tenant var (Faz 2 PARK, REC-88); çok tenant'a geçişte ORTA olur.

## 3. Yetki ve tenant ölçümü (sunucu tarafı, salt okuma)

| Soru | Ölçüm | Sonuç |
|---|---|---|
| Yönetici rotasına kim girer? | `src/middleware.ts:226-286`: Edge'de imzalı JWT claim `user_role` (`custom_access_token_hook` yazar) `ADMIN_ROLES` kümesinde mi; DB sorgusu yok | ✅ `raw_user_meta_data` okunmuyor (kural 12) |
| Dışa aktarılan veriyi kim belirler? | `useAdminTable.fetchAllForExport` (`src/hooks/useAdminTable.ts:429`) tarayıcı istemcisiyle aynı sorguyu sayfasız koşar → satırlar **RLS** ile süzülür | ✅ ekranda göremediği satırı dışa aktaramaz |
| Ürün yazımı kimde? | `products` yazım politikaları `user_profiles.role IN (admin, superadmin, moderator)` (`20260224_optimize_performance_advisor_wave4.sql:61-80`) | ✅ sunucuda; ⚠ tenant denetimi yok (§4-A) |
| Stok yazımı kimde? | `adjust_stock` SECURITY DEFINER, rolü `user_profiles`'tan denetler (`20260602090000_security_hardening_null_fix.sql:152-179`) | ✅ sunucuda; ⚠ ürünün tenant'ını denetlemiyor (§4-B) |
| Ürün okuması tenant'lı mı? | `prod_public_read_opt`: `tenant_id = jwt_tenant_id()` (`20260811_f3_tenant_isolation.sql:21`); `jwt_tenant_id()` claim'i `app_metadata.tenant_id`'den okur | ✅ içe aktarıcıların SKU ön ölçümü kendi tenant'ıyla sınırlı |
| Gereksiz kişisel veri? | Kişisel veri çıkan yüzeyler: kullanıcılar (e-posta, ad), iadeler (ad, e-posta, neden), lojistik (ad), hatalar (url, user-agent). Her biri sayfanın kendi işi için gerekli alan | Gereksiz alan bulunmadı; alan çıkarmak ürün kararıdır, önerilmedi |

## 4. Bu PR'ın kapsamı DIŞINDA kalan bulgular (migration gerekir → ayrı kayıt)

- **A · `products` yazım politikaları tenant denetlemiyor.** `prod_admin_insert_opt/update_opt/delete_opt`
  yalnız rolü denetler; bir tenant'ın yöneticisi başka tenant'ın ürününü kimliğiyle güncelleyebilir.
  Bugün tek tenant olduğu için etkisi yok. İstemci tarafı önlem bu PR'da (madde 27); kalıcı çözüm
  politikaya `tenant_id = jwt_tenant_id()` eklemek (migration = prod, kural 13, Recep onayı).
- **B · `adjust_stock` ürünün tenant'ını denetlemiyor ve rolü `app_metadata` yerine `user_profiles`'tan
  okuyor.** Rol tablosu kullanıcı tarafından yazılamaz (REC-355 yetki döngüsü işi), yani bugün açık değil;
  kural 12'nin "yetki kararı app_metadata" ilkesiyle hizalanması ve tenant denetimi ayrı iştir.
- **C · Dışa aktarılan bazı tablolarda `tenant_id` kolonu yok** (`orders`, `returns`, `client_errors`,
  `error_groups`, `webhook_events`, `pricing_rules`; `src/types/database.types.ts`). Faz 2 PARK olduğu için
  bilgi notudur.

Kanban sunucusu bu oturumda bağlanamadı (`wrongstack-kanban: Connection closed`); A ve B için kart
numarasını OPS açar. Bu PR bunlara dokunmaz.

## 5. Yapılan düzeltme (özet)

`src/lib/csv/` tek kapı: `hucre.ts` (formül nötrleme, `src/utils/csvHucre.ts`'ten taşındı), `belge.ts`
(`csvBelgesi`, `xlsBelgesi` + HTML kaçışı, `tabloIndir`), `ayristir.ts` (RFC 4180 temel, satır sınırı
ayrıştırırken), `dosyaKapisi.ts` (uzantı `.csv`, tür, 5 MB, 5.000 satır), `semalar.ts` (zod satır
şemaları; SKU deseni DB kısıtıyla aynı). 19 dışa aktarma yüzeyi ve 2 içe aktarıcı buna bağlandı.
Kapı `INV-ADMIN-CSV-1` (`src/__tests__/conformance/admin-csv-hucre.test.ts`) tabanı sıfıra indirdi ve
XLS (kural C) ile içe aktarma (kural D) kurallarını ekledi.

**Sınır (dürüst kayıt):** dosya kapısı istemcidedir; güvenlik sınırı değil kaza/hata önleyicidir.
Yazma yetkisinin kararını veritabanı verir (§3).
