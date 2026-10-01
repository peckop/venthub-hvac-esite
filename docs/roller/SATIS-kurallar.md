# KURALLAR: SATIS

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/SATIS.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K2 Tip güvenliği: `any` yasak, strict TypeScript.
- K3 RLS-first: Her tablo RLS politikasıyla korunur.
- K4 Monoton durum: Sipariş ve iade durumları yalnız ileri gider, geri dönüş engellenir.
- K6 HMAC: Webhook uçları HMAC-SHA256 ile korunur.
- K8 Replay koruması: Webhook'ta HMAC'e ek olarak zaman damgası (`x-timestamp`) ya da idempotency.
- K26 app_metadata: Yetki kararı `app_metadata` üzerinden verilir; kullanıcının kendi düzenleyebildiği meta veriden asla.
