# Brainstorm: Venthub Mimari Temizlik ve i18n Standardizasyonu

### Goal
Proje genelindeki tüm kullanıcıya dönen metinleri i18n (TR/EN) sistemine bağlamak, `any` tiplerini temizlemek ve 90+ Lighthouse skorunu korumak için erişilebilirlik (A11y) açıklarını kapatmak.

### Constraints
- **Framework:** Next.js (App Router)
- **i18n:** `src/i18n/dictionaries/` altındaki TR ve EN sözlükleri.
- **Typing:** `any` kullanımı kesinlikle yasak (No-any policy).
- **Aesthetics:** VentHub premium tasarım dilinden ödün verilmemeli.
- **Language:** Tüm teknik dokümantasyon ve iletişim Türkçe olmalı (Anayasa Kuralları).

### Known context
- `ProductDetailPageView.tsx`: Teknik özellikler i18n'e bağlandı ancak SEO ve şema verileri (JSON-LD) hala statik kalabiliyor.
- `AdminSettingsPage.tsx`: Tip güvenliği artırıldı ama bazı `as any` casting'ler hala mevcut.
- `orderStatusService.ts`: Stok hareket notları ve varsayılan iade nedenleri hala hardcoded Türkçe (`Sipariş İptal Edildi`).
- `LanguageSwitcher.tsx`: ARIA labelları eklendi ancak genel bir erişilebilirlik denetimi (audit) gerekiyor.

### Risks
- **Data Integrity:** Servis katmanındaki metinlerin değiştirilmesi, veritabanına yazılan logların tutarlılığını etkileyebilir. (İlgili audit tabloları incelenmeli).
- **i18n Key Mismatch:** TR sözlüğünde olup EN sözlüğünde olmayan anahtarların UI'da boş görünmesi.
- **Build Failures:** SEO meta verilerindeki değişikliklerin build sırasında çökme yaratma riski.

### Options
#### Option 1: Kısmi UI Temizliği
- **Summary:** Sadece görünür bileşenlerdeki (JSX) metinleri ve ARIA etiketlerini düzeltmek.
- **Pros:** Hızlı uygulama, düşük risk.
- **Cons:** Arka plan servislerinde (stok hareketleri, sipariş güncellemeleri) dil karmaşası devam eder.
- **Complexity:** Low

#### Option 2: Full-Stack i18n & Type Safety (Önerilen)
- **Summary:** Servis katmanı (`orderStatusService`), SEO (JSON-LD) ve Admin UI dahil tüm katmanları temizlemek. `as any` kullanımlarını tamamen kaldırmak.
- **Pros:** Tam mimari bütünlük, profesyonel global yapı.
- **Cons:** Daha fazla dosya değişikliği, kapsamlı test gereksinimi.
- **Complexity:** Medium

### Recommendation
**Option 2.** "VentHub Proje Anayasası" (GEMINI.md) gereği teknik borç (technical debt) biriktirmemek adına, servis katmanından SEO katmanına kadar tüm yapıyı standardize etmeliyiz. Özellikle şu an aktif olan `orderStatusService.ts` dosyasındaki hardcoded ifadeleri temizlemek projenin gelecekteki ölçeklenebilirliği için kritiktir.

### Acceptance criteria
- [ ] `orderStatusService.ts` içindeki tüm kullanıcıya dönen ve loglanan metinler i18n anahtarlarına bağlanmalı.
- [ ] `src/app/products/[id]/page.tsx` içindeki `jsonLd` objesindeki statik metinler dinamikleştirilmeli.
- [ ] `AdminSettingsPage.tsx` dosyasındaki tüm ESLint uyarıları ve `any` casting'ler temizlenmeli.
- [ ] `pnpm run lint:ci` komutu sıfır hata ile tamamlanmalı.
- [ ] Yapılan tüm değişiklikler `artifacts/superpowers/` altında belgelenmeli.
