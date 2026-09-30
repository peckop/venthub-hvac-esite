# KURALLAR: ADMIN

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/ADMIN.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K2 Tip güvenliği: `any` yasak, strict TypeScript.
- K3 RLS-first: Her tablo RLS politikasıyla korunur.
- K4 Monoton durum: Sipariş ve iade durumları yalnız ileri gider, geri dönüş engellenir.
- K5 Audit izi: Admin işlemleri `admin_audit_log` tablosuna yazılır.
- K7 i18n: Kullanıcıya görünen her metin sözlük dosyalarından gelir.
- K9 MVVM/Gateway: UI bileşeni ham veri çekmez (fetch/supabase); veri Gateway kancalarından gelir.
- K10 Design token: Arbitrary Tailwind değeri yasak; değerler `tokens.js`'ten, renk HEX değil CSS custom property (HSL).
- K11 content-auto: Sayfa altı ağır bileşenlerde `.content-auto` zorunlu.
- K12 focus-visible: Etkileşimli elemanlarda `focus:` değil `focus-visible:`.
- K14 Suspense sınırı: `useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton />}>` ile sarılır (sınır yalnız o uç bileşeni sarar).
- K21 React Compiler (geçiş, uyarı): Basit bileşende manuel `useMemo`/`useCallback` kısıtlı; Gateway viewmodel ve Provider'lar muaf.
- K22 React.cache (geçiş, katı): RSC ağacında tekrarlanabilen Supabase sorguları `React.cache()` ile tekilleştirilir.
- K24 Tenant izolasyonu: Okuma/yazma, Edge API ve Realtime kanalları tenant-scoped olur; data bleeding kabul edilmez.
- K26 app_metadata: Yetki kararı `app_metadata` üzerinden verilir; kullanıcının kendi düzenleyebildiği meta veriden asla.
- K27 Feature flag / RSC: Server Component'ta `getTenantConfig()`, Client Component'ta `useTenant()`; RSC'de client hook yok.
- K31 super_admin pivotu: Çapraz kiracı `super_admin` için 1-N FK yerine `tenant_users` pivot tablosu. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)
