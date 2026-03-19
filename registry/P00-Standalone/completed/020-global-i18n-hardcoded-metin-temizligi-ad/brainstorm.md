# Brainstorm: 020 - i18n Standartlaştırma ve Metin Temizliği

## 🧠 Görev Tanımı ve Hedefler
Audit raporunda tespit edilen ~1500+ kritik i18n ihlalinin (Hardcoded Türkçe metinler) sistematik olarak temizlenmesi ve projenin çok dilli yapısına uygun hale getirilmesi.

### Temel Hedefler
- Admin panelindeki (`src/views/admin/*`) tüm hardcoded metinlerin `t()` fonksiyonuna bağlanması.
- Hesaplayıcılar (`src/views/calculators/*`) altındaki teknik metinlerin i18n sistemine taşınması.
- Yeni metinlerin `src/i18n/locales/tr.json` ve `src/i18n/locales/en.json` dosyalarına eklenmesi.

## 🛠️ Teknik Strateji
- **Hiyerarşik Yapı:** Metinler taşınırken sayfa/bileşen bazlı bir hiyerarşi korunmalıdır (Örn: `admin.auditLog.title`).
- **Tip Güvenliği:** `t()` fonksiyonu kullanımında `i18next` standartları veya özel `useTranslation` hook'u zorunludur.
- **Riskler:** Metinlerin yanlış anahtara bağlanması sonucu UI bozulmaları ve eksik İngilizce çeviriler.
