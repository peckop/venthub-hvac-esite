# KURALLAR: URUN

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/URUN.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K2 Tip güvenliği: `any` yasak, strict TypeScript.
- K7 i18n: Kullanıcıya görünen her metin sözlük dosyalarından gelir.
- K9 MVVM/Gateway: UI bileşeni ham veri çekmez (fetch/supabase); veri Gateway kancalarından gelir.
- K10 Design token: Arbitrary Tailwind değeri yasak; değerler `tokens.js`'ten, renk HEX değil CSS custom property (HSL).
- K11 content-auto: Sayfa altı ağır bileşenlerde `.content-auto` zorunlu.
- K12 focus-visible: Etkileşimli elemanlarda `focus:` değil `focus-visible:`.
- K13 Typography prose: Yasal ve bilgi merkezi metin sayfalarında `prose dark:prose-invert max-w-prose` sarmalayıcısı.
- K14 Suspense sınırı: `useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton />}>` ile sarılır (sınır yalnız o uç bileşeni sarar).
- K15 Önbellek anahtarı: dil: `unstable_cache` anahtar dizisine aktif dil kodu (`lang`) eklenir.
- K16 ISR + webhook: Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).
- K17 Hreflang: Sitemap ve dinamik rotalarda TR/EN `alternates.languages` saf TypeScript ile üretilir; istemci hook'u yok.
- K19 3D gölge: R3F gölge haritası türü `'percentage'` olur; başka (yumuşak) gölge haritası türü yasak.
- K20 CSP 3D CDN: `connect-src` beyaz listesinde `raw.githubusercontent.com` ve `raw.githack.com` kalıcıdır; kaldırmak yasak.
- K21 React Compiler (geçiş, uyarı): Basit bileşende manuel `useMemo`/`useCallback` kısıtlı; Gateway viewmodel ve Provider'lar muaf.
- K22 React.cache (geçiş, katı): RSC ağacında tekrarlanabilen Supabase sorguları `React.cache()` ile tekilleştirilir.
- K27 Feature flag / RSC: Server Component'ta `getTenantConfig()`, Client Component'ta `useTenant()`; RSC'de client hook yok.
- K28 Önbellek anahtarı: tenant: `unstable_cache`/`revalidateTag` anahtarına `tenantId` de girer (`['key', lang, tenantId]`).
