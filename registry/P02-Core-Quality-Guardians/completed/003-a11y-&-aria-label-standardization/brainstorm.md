# Brainstorm: 003 - A11y & ARIA Label Standardization

## 🔍 MEVCUT SORUNLAR
Proje genelinde özellikle "sadece ikon" içeren butonlarda (Sil, Düzenle, Kapat vb.) `aria-label` eksikliği var. Bu durum ekran okuyucu kullanan kullanıcılar için ciddi bir erişilebilirlik engelidir ve Lighthouse skorunu düşürür.

## 🧠 ÇÖZÜM STRATEJİSİ
1. **Zorunlu ARIA:** Sadece ikon içeren tüm butonlara `aria-label` eklenecek.
2. **i18n Entegrasyonu:** ARIA etiketleri de `tr.ts` / `en.ts` sözlüğünden çekilecek.
3. **Standartlaştırma:** `AdminToolbar`, `ColumnsMenu` gibi ortak bileşenler otomatik ARIA etiketlerine kavuşturulacak.

## 🎯 HEDEF
Lighthouse A11y skorunun tüm kritik sayfalarda 90+ seviyesine çıkarılması.
