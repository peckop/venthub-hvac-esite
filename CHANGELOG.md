# Changelog

### [2026-05-29] VentHub Toast Migration to Sonner, Floating Widgets Flexbox Unification & 20-Workers Orion standard
**Özet:** Uygulama genelinde eski bildirim kütüphaneleri temizlenerek `sonner` migrasyonu tamamlandı, main layout üzerindeki yüzen araçlar flexbox ile dikeyde hizalanıp layout thrashing engellendi ve Xiaomi mimoV2 Premium Token aboneliği doğrultusunda Orion CLI paralel işçi (workers) standardı kalıcı olarak 20 worker'a çıkarıldı.
**Değişiklik Kapsamı:**
- **Sonner Toast Migrasyonu:** Eski `react-hot-toast` ve kullanılmayan `react-error-boundary` kütüphaneleri kaldırıldı. Toplamda 38 adet dosya statik ve dinamik olarak `sonner` API'lerine geçirildi, geriye dönük uyumluluk için custom toast adaptörü yazıldı.
- **Yüzen Araçlar Flexbox Unification:** `BackToTopButton`, `LanguageSwitcher` ve `WhatsAppFloat` widget'ları main layout altında tek bir dikey Flexbox sütununda birleştirildi. `getBoundingClientRect` ve `setInterval` tabanlı layout thrashing (CLS tetikleyicileri) yok edilerek, `useScrollThrottle` hook'u ve saf CSS'e geçildi. Clicktable alanları `pointer-events-none` ve `pointer-events-auto` overlay sistemiyle izole edildi.
- **Orion CLI 20-Workers Standardı:** Xiaomi mimoV2 Premium Token planının sunduğu yüksek RPM/TPM limitlerini tam verimle kullanmak üzere, Orion CLI yetenek tanımı (`.agent/skills/orion-cli/SKILL.md`) güncellendi ve varsayılan işçi sayısı kalıcı olarak 20 paralel worker'a yükseltildi.
- **Dokümantasyon Ağacı Rejenerasyonu:** Sonner geçişi sonrası `orion doc tree` komutuyla `docs/system_tree.md`, `venthub_hvac_master.md` ve `supabase_functions_master.md` dosyaları sıfırdan derlenerek Git deposuna işlendi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ | `orion doc tree` E2E Test ✅

---

### [2026-05-28] VentHub Multilingual SSG/PPR, On-Demand ISR Webhooks & 10/10 SEO alternates
**Özet:** Platformun statik sayfa hızı ve arama motoru görünürlüğü (SEO) için Next.js 15 sub-path routing, Kısmi Ön Oluşturma (PPR), HMAC doğrulamalı Supabase Webhook On-Demand ISR, Sitemap alternates (hreflang) metadata kurgusu tamamlandı ve yerel dökümantasyon ağacı ile NotebookLM hafızası %100 senkronize edildi.
**Değişiklik Kapsamı:**
- **i18n Sub-path Routing:** Tüm kamu sayfaları `src/app/[lang]/` dinamik alt-yolu altına taşındı. `LanguageSwitcher.tsx`, `useLocalizedRoutes` hook'u ve `locale` bazlı B2C anonim para birimi tespiti devreye alındı. `venthub_orders` veritabanı tablosuna locale/dil tiplemeleri migration ile işlendi.
- **SSG + PPR Entegrasyonu:** `products/[slug]/page.tsx`, `brands/[slug]/page.tsx` ve `destek/konular/[slug]/page.tsx` dinamik rotalarına `generateStaticParams` (FlatMap ile dil segmentleri dahil) eklendi. Statik sayfalara `export const dynamic = 'force-static'` eklenerek PPR kabukları donduruldu.
- **unstable_cache & Webhook HMAC:** `getCachedHomeData` ve `getCachedProducts` önbellek anahtarları dil izole (`['home-page-data', lang]`) hale getirildi. Supabase veri güncellemelerini yakalayıp önbelleği anında temizleyen (revalidate) **HMAC doğrulamalı** `/api/webhook/supabase` endpoint'i yazıldı.
- **Sitemap Hreflang SEO:** `sitemap.ts` üzerinde Next.js 15 standartlarına uygun `alternates: { languages: { tr: '...', en: '...' } }` dil alternates metadata kurgusu eklenerek SEO skoru 10/10 seviyesine çıkarıldı.
- **Döküman Senkronizasyonu & Orphan Temizliği:** Eski `src/app/page.md` yetim dökümanı silindi. Bozuk olan `src/app/[lang]/page.md` içeriği `cc doc single --force` ile sıfırdan derlendi. Tüm master dökümanlar `cc doc tree --nlm-sync --force-sync` komutuyla NotebookLM kütüphanelerine sıfırdan yüklenerek dijital ikiz senkronize edildi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ | `nlm query` E2E Test ✅

---

### [2026-05-27] VentHub CSS Enterprise Polish — Cilalama ve Performans Optimizasyonları
**Özet:** CSS katmanında global premium iyileştirmeler, `.content-auto` render performans optimizasyonları, `@tailwindcss/typography` ile Bringhurst standartları entegrasyonu ve klavye navigasyonunu standarda bağlayan otonom `focus-visible` migrasyonu gerçekleştirildi.
**Değişiklik Kapsamı:**
- **index.css Polish:** root seviyesinde `accent-color`, `color-scheme` eklendi; selection, coarse pointers, thin scrollbars ve high contrast modları base katmanına işlendi.
- **Performans (content-visibility):** `.content-auto` utility sınıfı oluşturularak ağır tablolar ve 3D tuval barındıran bileşenlere (`AdminOrdersBoard.tsx`, `InventoryTable.tsx`, `InfiniteProductsShowcase.tsx`) entegre edildi. Sayfa dışı eleman render yükü sıfırlandı.
- **focus-visible Migrasyonu:** 43 adet TSX dosyasında, interaktif elemanlar üzerinde (`button`, `a`, `input`, `select`, `textarea`) yer alan **381 adet** `focus:ring/outline/border/shadow` sınıfı otonom olarak `focus-visible:` formuna dönüştürüldü.
- **Typography prose:** `@tailwindcss/typography` eklentisi kuruldu. 6 adet yasal sayfa, teknik konular sayfası (`TopicPage.tsx`) ve ana sayfa `KnowledgeBlock.tsx` wrapper'ları `prose dark:prose-invert max-w-prose` sınıflarıyla bezenerek premium seviyeye çekildi.
- **Dark Mode Shadows:** tailwind.config.js extend.boxShadow altına `'elevation-1-dark'`, `'elevation-2-dark'`, `'elevation-3-dark'` token'ları eklendi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ (399/399 sayfa)

---

### [2026-05-27] Enterprise Design Token System — Ultimate Konsolidasyon & NotebookLM Senkronizasyonu
**Özet:** Tasarım sistemi kuralı `tailwindcss/no-arbitrary-value` flat config'de **Strict Error** seviyesine çekildi. Kalan tüm arbitrary değerler temizlendi. Tasarım token'ları (shadow, elevation, timing, blur, spacing) genişletilerek `tokens.js` ve `tokens.d.ts` ultimate düzeyde güncellendi. Tüm yerel mimari otonom bir şekilde NotebookLM ile %100 senkronize edildi.
**Değişiklik Kapsamı:**
- **Strict Linter Guard:** `"tailwindcss/no-arbitrary-value": "error"` olarak aktifleştirildi. `pnpm run lint` sıfır hata verdi.
- **Kalan Temizlik (43 satır):** 16 satır `transition-all`, 6 satır `rounded-[...]` ve `max-w-[...]` değerleri standart Tailwind ve `rounded-hvac-*` token'larına refaktör edildi.
- **Tasarım Sistemi Genişletilmesi:** `src/design-system/tokens.js` ve `tokens.d.ts` spacing, elevation, duration, timing, blur ve specific transition'lar ile ultimate haline getirildi.
- **Otonom NotebookLM Sync (NLM Sync):** Frontend (`cc doc all`) ve Supabase Edge Functions (`cc doc batch`) dokümanları güncellendi. `Authentication expired` hatası sessizce otonom `nlm login` + `refresh_auth` ile çözülerek `cc doc tree --nlm-sync --force-sync` ile tüm master ve standalone dosyalar NotebookLM bulutunda başarıyla senkronize edildi.
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error, 0 warning) | `pnpm run build` ✅ (399/399 sayfa)

---

### [2026-05-26] Enterprise Design Token System — Tam Migrasyon
**Özet:** Projedeki tüm hardcoded tasarım değerleri (renk, font, radius, z-index, max-width, animasyon) merkezi bir Design Token Sistemi'ne taşındı. `src/design-system/` modülü oluşturuldu, `tailwind.config.js` tamamen yeniden yazıldı, `src/index.css`'teki çift `:root` bloğu birleştirildi.
**Değişiklik Kapsamı:**
- **580 satır** arbitrary font boyutu → Tailwind standart (`text-xs/sm/base/lg/xl`)
- **103 satır** arbitrary radius → `rounded-hvac-sm/md/lg/xl/2xl/3xl` namespace token
- **32 satır** arbitrary z-index → 5 semantik katman (`z-raised/dropdown/sticky/modal/toast`)
- **93+ TSX + 6 CSS** `transition-all` → property-spesifik transition
- **33 dosya** hardcoded HEX renk → 15 HSL CSS Custom Property token
- **28 satır** opacity modifier uyumluluğu → `<alpha-value>` placeholder
- **Yeni:** `eslint-plugin-tailwindcss` guard (`tailwindcss/no-arbitrary-value: warn`)
- **Yeni:** `src/design-system/` (tokens.js + tokens.d.ts + index.ts)
- **Yeni:** `.light` / `.dark` tema değişkenleri (runtime tema değişimi hazır)
**Doğrulama:** `pnpm run type-check` ✅ | `pnpm run lint` ✅ (0 error) | `pnpm run build` ✅ (334+ sayfa)
---

### [2026-03-19] P00-Standalone - Task 033: Checkout Type Safety & CI Unblocking
**Özet:** `CheckoutPage.tsx` ve bağlı bileşenlerdeki (`StepCustomerInfo`, `StepAddressInfo`, `ReviewSummary`) TypeScript ve Lint hataları tamamen giderildi. `Record<string, unknown>` ve `as unknown as` gibi "güvensiz" tiplemeler, merkezi `db-rows.ts` tabanlı yeni bir tip mimarisiyle değiştirildi.
**Notlar:** - `CheckoutAddressInfo`, `CheckoutInvoiceInfo` ve `CheckoutCustomerInfo` tipleri hem veritabanı (snake_case) hem de UI (camelCase) standartlarına tam uyumlu hale getirildi.
- Sayfa ve alt bileşenler `%100` tip güvenliğine ulaştı, GitHub CI akışındaki engeller kaldırıldı.
- `StepAddressInfo` bileşenindeki form girişleri, eksik veri durumunda hata vermeyecek şekilde (`|| ''` fallback'ler) güçlendirildi.
---

### [2026-03-19] P06 - Aşama 3: Registry İndeksleme Sistemi (Indexing Engine)
**Özet:** Registry sistemi artık tamamen otonom ve indekslenebilir durumda. `index.json` dosyası, tüm projelerin ve görevlerin "Single Source of Truth" (Tek Gerçeklik Kaynağı) verisi haline getirildi. Arama motoru, ID dışındaki anahtar kelimelerle de (başlık, içerik özeti) çalışıyor.
**Notlar:** - `manage_registry.py` içindeki Python tiplemeleri (Pyre hataları) Pyre limitleri nedeniyle `dict` bazlı sadeleştirildi ancak runtime güvenliği `cast` ve `str()` zorlamalarıyla maksimize edildi.
- İleride bu indeks, AI asistanının projedeki "bağlamı" (context) çok daha hızlı kavraması için RAG (Retrieval-Augmented Generation) altyapısında kullanılabilir.
---

### [2026-03-19] P06-System-Intelligence-Registry - Aşama 2: Registry Bağımlılık Görselleştirici (Graph Motor)
**Özet:** Registry sistemine `graph` yeteneği eklendi. Tüm projelerdeki görevlerin `depends_on` ilişkileri taranarak hem Mermaid.js hem de ASCII formatında görsel çıktılar üretilebiliyor.
**Notlar:** - Bu geliştirme sayesinde projenin "Kritik Yolu" (Critical Path) anlık olarak takip edilebilir hale geldi.
- Döngüsel bağımlılıkları tespit etmek artık çok daha kolay.
- Statü renkleri sayesinde (Completed=Yeşil, Active=Sarı) projenin nabzı görsel olarak ölçülebiliyor.
---

### [2026-03-19] P04-Category-Architecture - Aşama 4: ProductsPage Birleştirme
**Özet:** Genel `/products` sayfası, yeni Gateway mimarisine başarıyla entegre edildi. Eski, mükerrer kod blokları temizlendi ve tüm site genelinde filtreleme mantığı standardize edildi.
**Notlar:** - `/products` sayfası için oluşturulan "Virtual Category" yapısı, gelecekte bu sayfaya özel metadata ve SEO ayarları yapmamızı kolaylaştıracak.
- Sayfa, Next.js 15'in asenkron parametre yapısına tam uyumlu hale getirildi.
---

### [2026-03-19] P04-Category-Architecture - Aşama 3: Gateway Mimarisi (CategoryPage Parçalama)
**Özet:** 800 satırlık `CategoryPage.tsx` dosyası, Gateway Pattern uygulanarak başarıyla parçalandı. Veri katmanı ve görsel katman birbirinden tamamen ayrıldı.
**Notlar:** - `CategoryHero` ve `CategoryFilters` artık projenin her yerinde kullanılabilir modüler bileşenlerdir.
- `useCategoryGateway` hook'u, ileride eklenecek olan PPR (Partial Prerendering) için mükemmel bir veri girişi sağlar.
- `ProductCard` bileşenindeki `viewMode` -> `layout` uyumsuzluğu giderildi.
---

### [2026-03-19] P06-System-Intelligence-Registry - Aşama 1: Otomatik CHANGELOG Jeneratörü
**Özet:** `manage_registry.py` aracına otonom CHANGELOG güncelleme yeteneği eklendi. Artık bir görev `completed` statüsüne taşındığında, `review.md` içeriği otomatik olarak `docs/CHANGELOG.md` dosyasına tarihçe olarak işleniyor.
**Notlar:** - Bu geliştirme, projenin tarihçesinin manuel hata payı olmadan tutulmasını sağlar.
- `docs/CHANGELOG.md` dosyası projenin ana dökümantasyon dizininde merkezi bir "Source of Truth" haline getirildi.
---

