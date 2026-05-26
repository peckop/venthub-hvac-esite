# Changelog

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

