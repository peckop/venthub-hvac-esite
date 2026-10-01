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

## Recep'e mesaj kuralları (ayrıntı; yöneten metin `~/.claude/output-styles/recep.md`)
- Durum mesajı TEK TABLO: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`; onay bekleyenler en üst satırlardır, ayrı tablo yok. Recep'e giden durum cevabı tek tablodur.
- (OPS hariç) tabloya yalnız KENDİ kartların girer; çok departmanlı genel resmi OPS verir; çok elzemse tablo dışında tek cümle hatırlat.
- Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider, Recep'e ANLATILMAZ; Recep'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok).
- Değişen yoksa tablo yok: Recep "devam et" dediğinde ya da durum sorduğunda son rapordan beri kartında değişen yoksa cevap TEK cümledir; bekleyen kartlar her cevapta yeniden dökülmez, tabloya yalnız durumu değişen ya da Recep'in adıyla sorduğu kart girer. İşi kalmayan departman bunu Recep'e değil OPS'a yazar.
- İşin başkasını bekliyorsa yalnız "başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok); Sorumlu = "ben" (OPS hariç).
- 2+ kalem madde işaretli liste olur (tablo dışında, cümle içinde (a) (b) şık dizilmez); compact hazırlık notu 3 maddelik listedir; "Onayında" yalnız Recep kararı bekleyen iştir; tur sonunda "devam edeyim mi" sorma, sırası belli işe geç.
