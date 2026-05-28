# venthub-hvac System Architecture Tree

Bu belge sistemdeki kaynak kod dosyalarının (.py/.ts/.tsx/.js/.jsx) eşleşen `.md` (mimari dokümantasyon) dosyalarına sahip olup olmadığını gösterir.
Bu ağaç `cli/docs_tree.py` tarafından otonom olarak üretilmiştir.

## Dokümantasyon Durumu
```text
📂 venthub-hvac/
├── 📂 **src/**
│   └── 📂 **views/**
│       └── 📂 **support/**
│           ├── ✅ `FAQPage.tsx`
│           ├── ✅ `ReturnsPage.tsx`
│           ├── ✅ `ShippingPage.tsx`
│           ├── ✅ `SupportHomePage.tsx`
│           └── ✅ `WarrantyPage.tsx`
└── 📂 **supabase/**
    └── 📂 **functions/**
        └── 📂 **_shared/**
            ├── ✅ `notify.ts`
            ├── ✅ `rate_limit.ts`
            └── ✅ `sentry.ts`
```

## Eksik Dokümantasyonlar
Tebrikler! Tüm çekirdek `.py` dosyalarının eşleşen `.md` belgeleri mevcut. 🎉

## Sahipsiz (Orphan) MD Dosyaları
Harika! Eşleşmeyen başıboş bir `.md` dosyası bulunmuyor. ✅

## Geçersiz Şablon (Invalid Format)
Harika! Tüm MD belgeleri Enterprise-Ready (5N1K + Axioms) şablonuna uygun. ✅