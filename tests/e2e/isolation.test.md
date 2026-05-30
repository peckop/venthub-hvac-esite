---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\tests\e2e\isolation.test.ts
skeleton_hash: cec936eb80db1726
entity_hashes:
  overview: ef4015787eee6563
generated_at: 2026-05-30T20:36:46Z
---

## Genel Bakış

Bu dosya, VentHub HVAC sistemindeki veri izolasyonunu test eden bir uçtan uca (E2E) test modülüdür. Testler, farklı kullanıcılar veya oturumlar arasındaki verilerin birbirinden doğru şekilde izole edildiğini doğrulamak amacıyla yazılmıştır. Vitest test çerçevesi ve MockDatabaseEngine yardımcı sınıfı kullanılarak, veritabanı motorunun izolasyon davranışları kontrollü bir ortamda simüle edilmektedir.

## Modül Yapısı

Dosya içerisinde tanımlı bir fonksiyon bulunmamakta olup tüm test senaryoları modül-seviyesi script ifadeleri (describe, it blokları) şeklinde düzenlenmiştir. `testDbState` adlı değişken, testler arasında paylaşılacak veritabanı durumunu tutmak amacıyla kullanılmaktadır. Her bir test, `beforeEach` ile sıfırlanarak birbirinden bağımsız çalışacak şekilde tasarlanmıştır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi veya imzası sağlanmadığından, detaylı mimari varsayımlar üretilememektedir.

---

**Mevcut bilgiye dayalı genel observation:**

Bu bir **E2E izolasyon test dosyasıdır** (`isolation.test.ts`). Modül sabiti olarak yalnızca `testDbState` (object) belirtilmiştir.

[Aksiyom 1]: Eğer `testDbState` nesnesi geçerli (valid) bir veritabanı durumu içermiyorsa, izolasyon testleri tutarsız sonuçlar verebilir.

[Aksiyom 2]: Eğer test ortamı izole edilmemişse (örn: testler arası veri sızıntısı varsa), E2E izolasyon testleri yanlış positif/negatif sonuçlar üretebilir.

---

> **Not:** Fonksiyon imzaları ve gövdeleri sağlanmadığı için, bu aksiyomlar yalnızca dosya adı ve sabit bilgisinden türetilen **yüksek seviyeli** varsayımlardır. Fonksiyon gövdesi eklendiğinde daha spesifik aksiyomlar üretilebilir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **testDbState** (object) — `{
  tenants: [
    { id: 'tenant-a', domain: 'a.venthub.hvac', name: 'Tenan...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(describe_anon)
- **params**: () — parametre yok
- **ic_degiskenler**:
  - `db` — MockDatabaseEngine örneği, tüm testler boyunca veritabanı motorunu temsil eder, beforeEach ile her test öncesi sıfırlanır
- **Dönüş**: yok (describe bloğu test tanımlama_AMAÇLIdır, dönüş döndürmez)
- **Yan etkiler**: 10 adet `it` test senaryosunu vitest runner'a kaydeder, `beforeEach` hook'u tanımlar

---

### [N2_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(beforeEach_callback)
- **params**: () — parametre yok
- **ic_degiskenler**:
  - (yeni tanımlı değişken yok — mevcut `db` değişkenine atama yapar)
- **Dönüş**: yok (vitest hook callback)
- **Yan etkiler**: `db`'yi yeni MockDatabaseEngine ile yeniden oluşturur; `testDbState.tenants`, `testDbState.products`, `testDbState.venthub_orders`, `testDbState.user_profiles` tablolarını mock DB'ye yükler

---

### [N3_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_1_select_tenant_restriction)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` çağrısıyla üretilen Supabase-like istemci, query builder zinciri başlatmak için kullanılır
  - `data` — `client.from('products').select()` sonucu dönen satır dizisi (destructured), tenant-a context'inde filtrelenmiş ürün listesi
  - `error` — select sorgusu sonucu oluşan hata nesnesi, null olmalı
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: 'tenant-a', userRole: 'customer' })` ile güvenlik bağlamını ayarlar

---

### [N4_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_2_insert_tenant_injection)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` çağrısıyla üretilen istemci, insert ve select zincirleri için kullanılır
  - `data` — insert işleminin sonucu dönen nesne, `data.tenant_id` alanı üzerinden otomatik tenant enjeksiyonu doğrulanır
  - `error` — insert sorgusu hata nesnesi, null olmalı
  - `fetchList` — insert sonrası `client.from('products').select()` ile çekilen güncel ürün listesi, yeni eklenen kaydın doğrulanması için kullanılır
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: 'tenant-a', userRole: 'admin' })` çağrısı; `products` tablosuna `{ id: 'prod-new', slug: 'new-air-conditioner', name: 'Super AC', stock: 12, category_id: 'cat-1' }` kaydı insert edilir

---

### [N5_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_3_cross_tenant_update_block)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, update ve single select zincirleri için kullanılır
  - `data` — `client.from('products').eq('id', 'prod-2').update(...)` sonucu, RLS tarafından filtrelenen kayıtlar nedeniyle boş dizi beklenir
  - `error` — update hata nesnesi
  - `prod2` — Tenant-b context'inde `client.from('products').eq('id', 'prod-2').single()` ile çekilen tekil kayıt, adının değişmemiş olduğunu doğrular
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: İki ayrı `db.setSecurityContext` çağrısı — önce tenant-a admin, sonra tenant-b admin

---

### [N6_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_4_cross_tenant_delete_block)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, delete ve single select zincirleri için kullanılır
  - `data` — `client.from('venthub_orders').eq('id', 'order-2').delete()` sonucu, boş dizi beklenir
  - `order2` — Tenant-b context'inde `client.from('venthub_orders').eq('id', 'order-2').single()` ile çekilen tekil sipariş kaydı, silinmemiş olduğunu doğrular
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: İki ayrı `db.setSecurityContext` çağrısı — önce tenant-a admin, sonra tenant-b admin

---

### [N7_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_5_super_admin_bypass)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, tüm tenant'ların verisini okumak için kullanılır
  - `data` — `client.from('products').select()` sonucu, super_admin context'inde tüm tenant'lara ait ürünleri içeren dizi
  - `error` — select hata nesnesi, null olmalı
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: null, userRole: 'super_admin' })` ile tenant kısıtlamasız bağlam ayarlanır; `data.map((p: any) => p.tenant_id)` ile iki ayrı tenant-id varlığı doğrulanır

---

### [N8_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_6_reject_mismatched_tenant_insert)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, zorla yanlış tenant_id ile insert denemesi için kullanılır
  - `data` — insert sonucu, null olmalıdır (RLS reddeder)
  - `error` — insert hata nesnesi, `error.code` alanı `'42501'` (Postgres RLS violation kodu) olmalıdır
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: 'tenant-a', userRole: 'admin' })` çağrısı; `products` tablosuna `{ id: 'prod-rogue', tenant_id: 'tenant-b', slug: 'rogue-filter', name: 'Rogue Filter' }` ile yanlış namespace'e yazma denemesi yapılır

---

### [N9_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_7_block_tenant_id_reassignment)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, mevcut kaydın tenant_id'sini değiştirme denemesi için kullanılır
  - `data` — update sonucu, null olmalıdır (RLS reddeder)
  - `error` — update hata nesnesi, `error.code` alanı `'42501'` olmalıdır
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: 'tenant-a', userRole: 'admin' })` çağrısı; `products` tablosunda `id='prod-1` kaydının `tenant_id` alanını `'tenant-b'` olarak değiştirme denemesi yapılır

---

### [N10_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_8_empty_for_null_tenant_non_admin)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, null tenant ve customer rolüyle sorgulama için kullanılır
  - `prodData` — `client.from('products').select()` sonucu, boş dizi beklenir (null tenantId ile customer rolü veri göremez)
  - `orderData` — `client.from('venthub_orders').select()` sonucu, boş dizi beklenir
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: null, userRole: 'customer' })` ile null tenant + customer rolü bağlamı ayarlanır

---

### [N11_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_9_sql_injection_safety)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, SQL injection parametresiyle sorgulama için kullanılır
  - `data` — `client.from('products').eq('id', "' OR '1'='1").select()` sonucu, boş dizi beklenir (güvenli eşleme)
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: `db.setSecurityContext({ tenantId: 'tenant-a', userRole: 'customer' })` çağrısı; `' OR '1'='1` SQL injection karakteri `eq` filtresine parametre olarak geçirilir

---

### [N12_NASIL] AST Pointer: `tests/e2e/isolation.test.ts`::(it_10_block_tenant_hopping)
- **params**: () — parametre yok (async)
- **ic_degiskenler**:
  - `client` — `db.createClient()` istemcisi, iki farklı tenant context'inde ardışık sorgulama için kullanılır
  - `aData` — Tenant-a context'inde `client.from('products').select()` sonucu, `aData[0].tenant_id` alanının `'tenant-a'` olduğunu doğrular
  - `bData` — Tenant-b context'inde `client.from('products').select()` sonucu, `bData[0].tenant_id` alanının `'tenant-b'` olduğunu doğrular
- **Dönüş**: yok (test assertion_AMAÇLIdır)
- **Yan etkiler**: İki ayrı `db.setSecurityContext` çağrısı — önce `{ tenantId: 'tenant-a', userRole: 'admin' }`, sonra `{ tenantId: 'tenant-b', userRole: 'admin' }` ile session hop simülasyonu yapılır

---

## NODE ID STANDARD

  file: tests\e2e\isolation.test.ts