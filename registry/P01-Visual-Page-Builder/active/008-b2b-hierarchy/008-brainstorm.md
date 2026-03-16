# Superpowers Brainstorm: P01-008 B2B Hiyerarşisi ve Sayfa Standartizasyonu

## 1. Goal (Hedef)
VentHub üzerindeki tüm kategori ve ürün sayfalarının "Sessiz Fan" (Golden Sample) referans sayfa kalitesine ve SEO disiplinine sahip olmasını sağlamak. P01 projesi kapsamında bu yapıyı B2B yetkilendirme katmanıyla birleştirerek otonom, tutarlı ve premium bir deneyim inşa etmek.

## 2. Constraints (Kısıtlamalar)
- **i18n Uyumu:** Tüm içerikler `useI18n` üzerinden yönetilmeli, hardcoded metin yasak.
- **Performans:** Yeni inşa edilecek modüler yapı (Page Builder), 90+ Lighthouse puanını korumalı (LCP ve CLS odaklı).
- **Mevcut Yapı:** `CategoryPage.tsx` ve `STATIC_CATEGORY_METADATA` üzerindeki mevcut yapıya zarar vermeden genişletilmeli.

## 3. Risks (Riskler)
- **Kopya Sayfalar (Consistency Loss):** Manuel kopyala-yapıştır ile oluşturulan yeni sayfaların (Örn: Isı Geri Kazanım) referans standarttan sapması (Şu an yaşanan sorun).
- **Karmaşıklık:** Modüler yapının aşırı esnek olup tasarım disiplininden (Design Tokens) kopması.
- **B2B Yetki Karmaşası:** Hangi kullanıcının hangi "Authoritative" içeriği göreceğinin (Fiyat gizleme, özel teknik dökümanlar) yanlış yönetilmesi.

## 4. Options (Seçenekler)
- **A) Manuel Düzeltme:** Isı Geri Kazanım sayfasını da Sessiz Fan gibi el ile modifiye etmek. (Sürdürülebilir değil).
- **B) Universal Section Architecture (USA):** Sayfa bölümlerini (Problem, FAQ, HowItWorks) veriyle beslenen (JSON-driven) evrensel bileşenlere dönüştürmek.
- **C) Authority Injection:** P01-014 ve 015 katmanlarını (İçerik ve Tasarım) zorunlu kılan bir "Page Schema" oluşturmak.

## 5. Recommendation (Öneri) - SEÇİLEN
**Seçenek B ve C'nin Hibrit Modeli:**
Sessiz Fan sayfasındaki başarılı bölümleri "Universal Components" (Evrensel Bileşenler) haline getirip, bu bileşenlerin içeriğini `registry` veya `supabase` meta-verisinden beslemek. 008 görevi kapsamında bu sayfaların "Kimler tarafından görülebileceğini" (B2B/Public) yetki katmanına bağlamak.

## 6. Acceptance Criteria (Kabul Kriterleri)
- [ ] Isı Geri Kazanım sayfasının, hiçbir kod değişikliği yapmadan sadece metadata ile Sessiz Fan görünümüne/disiplinine kavuşması.
- [ ] "Problem", "FAQ", "Teknik Karşılaştırma" gibi bölümlerin `src/components/ui/category/` altında evrensel şablonlar olarak tanımlanması.
- [ ] B2B kullanıcıları için sayfa üzerindeki "Otorite" katmanlarının (Örn: Özel B2B içerikleri) görünürlük kontrolünün sağlanması.
- [ ] Tüm yeni yapının SEO Metadata (JSON-LD) ile tam entegre çalışması.
