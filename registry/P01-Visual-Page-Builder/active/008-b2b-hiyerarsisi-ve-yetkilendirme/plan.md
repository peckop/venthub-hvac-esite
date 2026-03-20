# Implementation Plan: P01-008 B2B Hiyerarşisi ve Sayfa Senkronizasyonu

Bu plan, Sessiz Fan sayfasındaki "Altın Standart" (Reference) yapıyı evrenselleştirerek tüm kategorilere (Örn: Isı Geri Kazanım) otonom olarak yaymayı ve B2B yetkilendirme katmanını entegre etmeyi hedefler.

## Faz 1: Otorite Katmanlarının Analizi ve Ayrıştırılması
- [x] `src/components/category/sections/silent-fan/` altındaki bileşenlerin incelenip "Universal" şablon parametrelerinin belirlenmesi.
- [ ] SEO Otoritesi için gerekli olan "Question-Answer" (FAQ) ve "Problem-Solution" veri yapısının (Schema) `STATIC_CATEGORY_METADATA`'ya eklenmesi.

## Faz 2: Evrensel Bileşenlerin İnşası (Universal UI)
- [ ] `src/components/category/universal/` klasörünün oluşturulması.
- [ ] `UniversalProblemSection.tsx`: Her kategori için metin ve görselleri metadata'dan alan yapı.
- [ ] `UniversalFAQ.tsx`: JSON-LD destekli, dinamik soru-cevap bileşeni.
- [ ] `UniversalHowItWorks.tsx`: Süreç odaklı anlatım şablonu.

## Faz 3: Isı Geri Kazanım (HRV) Sayfasının Restorasyonu
- [ ] `src/config/categoryMetadata.ts` içinde `isi-geri-kazanim-cihazlari` için gerekli olan SEO ve İçerik verisinin (Sessiz Fan standardında) girilmesi.
- [ ] `CategoryPage.tsx` üzerinde bu evrensel bileşenlerin dinamik olarak render edilmesinin sağlanması.

## Faz 4: B2B Hiyerarşi ve Yetkilendirme (P01-008 Core)
- [ ] Kullanıcı rolüne (`user_profiles.role`) göre sayfa üzerindeki bölümlerin görünürlük kontrolü (Örn: B2B kullanıcısına özel "Toplu Alım Şartları" veya "Teknik Katalog" bölümü).
- [ ] `useB2BAuthority` hook'unun oluşturulması.

## Faz 5: Doğrulama ve Mühürleme
- [ ] Isı Geri Kazanım sayfasının Sessiz Fan ile görsel ve SEO uyumunun testi.
- [ ] B2B rolüyle giriş yapıldığında yetki katmanlarının kontrolü.
- [ ] `python registry/registry_sync.py` ile ilerlemenin güncellenmesi.
