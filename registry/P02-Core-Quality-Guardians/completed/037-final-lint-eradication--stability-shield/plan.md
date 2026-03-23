---
artifact_type: "plan"
task_id: "037"
strategy_id: "lint-eradication-v7"
derived_from: "brainstorm.md (Analysis: 2026-03-22 22:30:00)"
verification_mode: "Strict Lint Check"
---

# 📋 Implementation Plan: Final Lint Eradication & Stability Shield

## 🏁 Adım 1: Otomatik Onarım ve Temel Temizlik
Basit lint hatalarının toplu olarak düzeltilmesi.
- [ ] `npm run lint -- --fix` komutunun çalıştırılması.
- [ ] `avens-integration` dizinindeki tüm `console.log` ifadelerinin `console.warn`'a toplu dönüştürülmesi (Risk düşük).
- **Verify:** `npm run lint` komutunun hata sayısının azaldığının teyit edilmesi.

## 🛠️ Adım 2: Scripts & Integration Otorite Temizliği
`require` ifadelerinin ve `any` kullanımlarının bu dizinlerden temizlenmesi.
- [ ] `avens-integration` dizinindeki `no-require-imports` hatalarının ESM (`import`) formatına çevrilmesi.
- [ ] `scripts/db/checks/` altındaki `any` kullanımlarının (özellikle `scripts/db/checks/analyze_categories.ts`) en azından `unknown` veya `Record<string, any>` olarak güncellenmesi.
- **Verify:** `npm run lint avens-integration scripts` komutunun temiz sonuç vermesi.

## 🛡️ Adım 3: Supabase & UI Tip Güvenliği (Kritik)
Kritik sistem bileşenlerindeki tip hatalarının giderilmesi.
- [ ] `supabase/functions/` altındaki fonksiyonlarda `any` dökümlerinin gerçek tiplerle değiştirilmesi.
- [ ] `src/components/products/Category3DIcon.tsx` dosyasındaki `any` hatalarının temizlenmesi.
- **Verify:** `npm run lint supabase/functions src/components` komutunun temiz sonuç vermesi.

## 🚀 Adım 4: Final Stabilite ve Mühürleme
Tüm sistemin lint standartlarına tam uyumunun sağlanması.
- [ ] Kalan münferit hataların manuel olarak düzeltilmesi.
- [ ] `npm run lint` komutunun 0 hata ile sonuçlanması.
- **Verify:** `npm run lint` çıktısının "0 problems" olduğunu gösteren ekran dökümü.
