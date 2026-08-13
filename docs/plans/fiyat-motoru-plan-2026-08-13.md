# Fiyat Motoru Uygulama Planı (T001-VH)

> **İş emri:** registry `T001-VH` (aktif, controller: Fable) · **Cetvel:** `docs/standards/pricing-standard.md` v1.0 (§15 build sırası)
> **Durum:** PLAN — Recep onayı bekliyor. Onay sonrası dalga dalga uygulanır; **her migration'lı PR merge'ü
> ve her prod veri yazımı AYRICA sorulur** (mode-independent hard gates).
> 2026-08-13 · Kademe-2 sonrası şema yer-gerçeğine uyarlandı (cetvelin §15'i 06-19 şemasına yazılmıştı).

---

## 0. Yer gerçeği (2026-08-13, canlı şema + Kademe-2 sonrası)

| Cetvelin varsaydığı | Bugünkü gerçek | Plana etkisi |
|---|---|---|
| `products.purchase_price` tek/yetersiz | ✅ Kademe-2 getirdi: `purchase_price` (NOT NULL) + `purchase_currency`; **348/374 ürün EUR alışlı** | F0 daralır: yalnız `purchase_rate_to_base` + `cost_in_base` eklenir |
| `product_prices` 0 satır, kolon eksik | Hâlâ boş; `base_price/sale_price` var, `currency/net/gross/is_derived` yok | W2'de kolon ekleme + cache sözleşmesi |
| `price_lists` 3 segment satırı | Duruyor (individual/dealer/corporate) | Kimlikler sabit, yeniden kurulmaz |
| F4 = "eski 359 ürünü göçür, düz price emekli" | **GEÇERSİZ:** Kademe-2 F5-A düz fiyatı zaten emekli etti ("Teklif Alın" modeli; `price` NULL) | F4 dalgası düşer → yerine W4 "aktivasyon" |
| `currency_rates`, `pricing_rule` | YOK | W0/W1 kurar |

Sonuç: motor kurulduğunda **348 ürün otomatik fiyatlanır**; alış maliyeti olmayan 26 ürün "Teklif Alın"da kalır
(maliyet gelince kendiliğinden fiyatlanır — ayrı iş değil).

## 1. Dalga planı

### W0 — Maliyet + parite temeli 【migration + prod-yazım kapısı】
- **Migration:** `products` += `purchase_rate_to_base numeric(18,6)`, `cost_in_base numeric(14,4)` ·
  `currency_rates` tablosu (cetvel §10 şeması: append-only, tenant RLS, **UPDATE policy YOK** → INV-PRICE-4).
- **TCMB günlük job:** Edge Function `tcmb-rates-sync` (cron 15:30 TSİ; hafta-sonu/404'te son kuru taşı;
  `source='tcmb'`, elle ezme = `source='manual'` yeni satır).
- **Backfill (prod veri yazımı — AYRI ONAY):** 348 EUR'lu ürüne ilk kur snapshot'ı + `cost_in_base` hesabı.
  *Not:* gerçek alım tarihleri bilinmediğinden ilk snapshot = backfill günü TCMB Efektif Satış; ileride
  Satınalma modülü (T010) gerçek alım-anı kurunu yazar.
- **Çıktı:** her maliyetli ürünün donmuş TL maliyeti + günlük canlı kur akışı.

### W1 — Marj kuralı motoru 【migration kapısı】
- **Migration:** `pricing_rule` (cetvel §10 tam şema: scope 0-4, method/base, min/max marj, priority,
  is_exclusive, valid_from/to, tenant RLS).
- **Servis:** `lib/services/pricing.service.ts` genişletilir (yeniden yazılmaz — mevcut çözücü iskeleti
  korunur): `resolvePrice()` cetvel §11 algoritması (DI ilk param, segment = `app_metadata`/`tier_level`,
  ASLA `user_profiles.role`), **"hangi kural neden kazandı" trace çıktısı** dahil.
- **Conformance:** INV-PRICE-2 (çözücü role okumaz) + INV-PRICE-4 (float yasak / append-only) testleri bu dalgada yazılır.

### W2 — Cache + sipariş sözleşmesi onarımı 【migration kapısı】
- **Migration:** `product_prices` += `currency char(3)`, `net_price`, `gross_price`, `is_derived` ·
  **R5 segment RLS** (bayi fiyatı anon'a sızmaz — seed'den ÖNCE zorunlu).
- Çözücü tek sözleşme: `user → organization → tier_level → price_list → product_prices` → yoksa motor (§8).
- Sipariş yazan yollar 6 snapshot alanını doldurur (blueprint R3) + **INV-PRICE-3** testi.
- İlgili bilinen bug onarımları: ölü order-validate / çift-const / `_text()` (cetvel §15-F1 notu).

### W3 — Admin paneli B1 (kod-only, migration yok)
- **Ayarlar:** para birimleri, parite görünümü (oto TCMB + elle ezme + spread), KDV modu, yuvarlama/charm politikası.
- **Marj kuralları:** scope-bazlı CRUD + **etkin-marj matris önizleme** (kural değişince hangi ürünler etkilenir).
- **Kural giriş biçimleri (Recep gereksinimi, 2026-08-13):** kullanıcı kuralı **yüzde** (%40), **katsayı**
  (×2 → alış 1.000 TL = satış 2.000 TL) veya **sabit fiyat** olarak girebilir; katsayı k girildiğinde motor
  `margin_pct=(k−1)×100` olarak saklar (tek kanonik biçim, çift gerçek yok — panel iki yönde çevirir).
  Sabit fiyat girişinde **KDV dahil / +KDV seçimi** kural başına (`price_is_vat_inclusive`, cetvel §10'da mevcut).
- **Ürün başına:** alış + para birimi + canlı hesaplanan satış önizleme (her para biriminde, trace'li).
- admin-standard K1–K5 zorunlu (table-kit, URL-state, RBAC+RLS, `logAdminAction`, 5 durum); §8 skor ≥20/24.

### W4 — Seed + aktivasyon 【prod-yazım kapısı】
- Başlangıç kuralları girilir (karar girdileri §3'te) → motor **materialize**: 348 ürün × 3 segment × TRY
  → `product_prices` (idempotent: sabit `valid_from` + `ON CONFLICT DO NOTHING`).
- Storefront/PDP çözücüye bağlanır: fiyatlı ürün fiyat gösterir, maliyetsiz 26 ürün "Teklif Alın" kalır
  (mevcut model korunur; motor "fiyat yoksa teklif" fallback'ini doğal destekler).
- **INV-PRICE-1** (müşteri yüzeyi `products.price`'ı doğrudan okumaz) yazılır + ratchet.
- checkout-smoke e2e **karantinadan çıkar** (fiyat artık deterministik).

### Kapanış
- `pnpm supabase:gen` types regen · DURUM-TAKIP anlatı güncelle (id-ref) · registry `T001-VH complete` ·
  NLM twin'e cetvel+plan sync (milestone) · hafıza güncelle.

## 2. Kapı haritası (mode-independent hard gates)

| Nokta | Kapı |
|---|---|
| W0/W1/W2 migration PR merge'leri (3 ayrı PR) | Her biri merge öncesi **Recep'e sorulur** (merge = prod DB'ye otomatik apply) |
| W0 backfill (348 ürüne kur+maliyet yazımı) | Prod veri yazımı — **ayrı onay**, önce dry-run raporu |
| W4 seed (product_prices doldurma) | Prod veri yazımı — **ayrı onay**, önce örneklem fiyat tablosu Recep'e |
| Kod-only PR'lar (W3, servis, testler) | Normal akış: PR + CI + Vercel preview; onay istenmez |

## 3. Recep'ten karar girdileri (plan onayıyla birlikte veya W4'ten önce)

1. **Başlangıç global kâr oranı** — tek değer yeter, biçim serbest: yüzde ("%40") YA DA katsayı ("×1,4").
   Marka/kategori/ürün istisnaları sonra panelden; hiçbir oran koda gömülmez, hepsi admin-konfigüre.
2. **Segment farkları:** dealer/corporate listeleri için başlangıç iskonto oranı (ör. bayi %X eksik) — ya da
   "şimdilik hepsi aynı, bayi farkı R2/bayi fazında".
3. **Yuvarlama politikası:** öneri = düz kuruş yuvarlama, charm (`,90`) kapalı başla (panelden açılır).
4. **Spread:** öneri = %0 başla (TCMB kuru bire bir).

## 4. Kapsam DIŞI (bilinçli — ayrı iş emirleri)

- **Teklif/CPQ hattı** → `T009-VH` (backlog, T001'e bağımlı). Motor teklifin *girdi fiyatını* üretir.
- **Satınalma modülü** (tedarikçi siparişi/mal kabul/iskonto zinciri/gerçek alım-kuru) → `T010-VH` (backlog).
- Bayi tier gerçek iskonto kurgusu (dealer R2 tam kapsamı), görsel temini (T003), PageKit (T005).
- **Vizyon çıpası (Recep, 2026-08-13):** hedef platformun teklif+satınalmayı da içselleştirmesi
  ("neden ayrı ERP kullanayım?") — T001→T009→T010 zinciri bu hedefe yürür; büyük projede hızlı
  mühendislik çözümlemesi (BOM/keşif) T009'un proje katmanıdır.

## 5. Kabul kriterleri (T001 "bitti" tanımı)

- 348 ürün 3 segmentte TRY net+gross fiyatlı (`product_prices` dolu, `is_derived=true`); PDP/listede fiyat görünür.
- Kur değişince (yeni `currency_rates` satırı) yeniden-materialize fiyatları günceller (tetik: cron sonrası job).
- Admin'den marj kuralı değişimi → önizleme → yeniden-materialize akışı çalışır (audit log'lu).
- INV-PRICE-1..4 testleri yeşil ve CI'da; checkout-smoke aktif; tsc 0 / lint 0 / build yeşil / Vercel preview OK.
- 29 borç-ürün özel durumu kalmadı (hepsi Kademe-2'de zaten arşivlendi; sabit ×46,83 kod/veri kalıntısı sıfır).
