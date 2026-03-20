---
completed_at: null
started_at: null
created_at: "2026-03-17 15:50:57"
updated_at: "2026-03-20 17:25:27"
id: 008
title: "B2B Hiyerarşisi ve Yetkilendirme"
status: "Executing"
progress: "0%"
priority: "High"
depends_on: [006]
artifacts:
  brainstorm: "registry/P01-Visual-Page-Builder/active/008-b2b-hiyerarsisi-ve-yetkilendirme/brainstorm.md"
  plan: "registry/P01-Visual-Page-Builder/active/008-b2b-hiyerarsisi-ve-yetkilendirme/plan.md"
  review: "registry/P01-Visual-Page-Builder/active/008-b2b-hiyerarsisi-ve-yetkilendirme/review.md"
---




































# 008 - B2B Hiyerarşisi ve Yetkilendirme

## 🎯 Hedef
Bayi, proje ve son kullanıcı bazlı farklı içerik ve fiyat gösterimi için dinamik hiyerarşiyi kurmak.

## ✅ Alt Görevler
- [x] `src/components/category/sections/silent-fan/` altındaki bileşenlerin incelenip "Universal" şablon parametrelerinin belirlenmesi.
- [ ] SEO Otoritesi için gerekli olan "Question-Answer" (FAQ) ve "Problem-Solution" veri yapısının (Schema) `STATIC_CATEGORY_METADATA`'ya eklenmesi.
- [ ] `src/components/category/universal/` klasörünün oluşturulması.
- [ ] `UniversalProblemSection.tsx`: Her kategori için metin ve görselleri metadata'dan alan yapı.
- [ ] `UniversalFAQ.tsx`: JSON-LD destekli, dinamik soru-cevap bileşeni.
- [ ] `UniversalHowItWorks.tsx`: Süreç odaklı anlatım şablonu.
- [ ] `src/config/categoryMetadata.ts` içinde `isi-geri-kazanim-cihazlari` için gerekli olan SEO ve İçerik verisinin (Sessiz Fan standardında) girilmesi.
- [ ] `CategoryPage.tsx` üzerinde bu evrensel bileşenlerin dinamik olarak render edilmesinin sağlanması.
- [ ] Kullanıcı rolüne (`user_profiles.role`) göre sayfa üzerindeki bölümlerin görünürlük kontrolü (Örn: B2B kullanıcısına özel "Toplu Alım Şartları" veya "Teknik Katalog" bölümü).
- [ ] `useB2BAuthority` hook'unun oluşturulması.
- [ ] Isı Geri Kazanım sayfasının Sessiz Fan ile görsel ve SEO uyumunun testi.
- [ ] B2B rolüyle giriş yapıldığında yetki katmanlarının kontrolü.
- [ ] `python registry/registry_sync.py` ile ilerlemenin güncellenmesi.