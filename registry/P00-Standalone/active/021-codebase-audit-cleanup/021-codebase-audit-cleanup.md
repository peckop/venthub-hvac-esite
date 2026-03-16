---
updated_at: "2026-03-16 14:44:57"
id: 021
title: "Codebase Audit & Technical Debt Cleanup"
status: "Active"
progress: "0%"
priority: "High"
depends_on: ["020"]
artifacts:
  audit_report: "audit_results.txt"
---

# Görev Tanımı
`venthub-auditor` tarafından yapılan analiz sonuçlarına göre projedeki teknik borçların temizlenmesi, tip güvenliğinin artırılması ve i18n dönüşümlerinin tamamlanması.

## 1. Tip Güvenliği (Strict Typing)
- [ ] `src/lib/supabase.ts` içindeki tüm `as any` ve `: any` kullanımlarının temizlenerek `database.types.ts` veya `db-rows.ts` modellerine geçilmesi.
- [ ] `src/views/checkout/buildPaymentRequest.ts` dosyasındaki ödeme objelerinin tipleştirilmesi.
- [ ] `src/views/CategoryPage.tsx` içindeki SEO ve sıralama mantığındaki `any` dökümlerinin düzeltilmesi.

## 2. i18n & Hardcoded Metin Temizliği
- [ ] `src/views/LoginPage.tsx` ve `RegisterPage.tsx` içindeki Türkçe metinlerin i18n anahtarlarına taşınması.
- [ ] `src/views/PaymentSuccessPage.tsx` içindeki ödeme durum metinlerinin i18n'e taşınması.
- [ ] Yasal metin sayfalarının (`legal/` klasörü) i18n sistemine entegre edilmesi (veya statik içerik yönetimine alınması).

## 3. Performans ve Erişilebilirlik
- [ ] `src/components/` altındaki butonlara eksik `aria-label` eklemelerinin yapılması.
- [ ] Kalan `<img` etiketlerinin `VentImage` veya Next.js `Image` bileşenine dönüştürülmesi.

## 4. Kullanılmayan Kodlar
- [ ] `src/views/admin/AdminInventoryPage.tsx` içindeki kullanılmayan `lang` değişkeninin kaldırılması.

---
*Bu task, projenin "Anayasası"ndaki %90+ Lighthouse ve Strict Typing kurallarına uyum için oluşturulmuştur.*
