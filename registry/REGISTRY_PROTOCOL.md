# VentHub Kayıt ve Görev Protokolü (V7 - Multi-Project Pure Hierarchy)

Bu protokol, projenin "Hafızası" (Registry) ve "Motoru" (Superpowers) arasındaki tam senkronizasyonu yönetir.

## 1. Proje Bazlı Hiyerarşi (Hierarchy First)
- **KURAL:** Her görev, ait olduğu projenin klasörü altında açılmalıdır.
- **Dizin Yapısı:** `registry/PXX-Proje-Adi/{active|completed|backlog}/ID-gorev-adi/`
- **Dosya Yapısı:** Klasör içindeki ana görev dosyası, klasör ismiyle birebir aynı olmalıdır.
  - Örn: `020-i18n-refactor/020-i18n-refactor.md`

## 2. Dosya Rolleri ve İsimlendirme
- **Ana Görev Dosyası (`ID-gorev-adi.md`):** Sadece YAML metadata, kısa hedef ve ilerleme (checkbox) takibini içerir.
- **Brainstorm (`brainstorm.md`):** Görevin neden yapıldığı, teknik stratejiler ve riskler burada durur. `/superpowers-brainstorm` çıktısı buraya kaydedilir.
- **Plan (`plan.md`):** Operasyonel uygulama adımları burada durur. `/superpowers-write-plan` çıktısı buraya kaydedilir.
- **Review (`review.md`):** Kod incelemesi çıktısı burada durur. `/superpowers-review` çıktısı buraya kaydedilir. PR açılmadan önce doldurulması zorunludur.

## 3. Atomic Progress (Otomatik İlerleme)
- İlerleme yüzdesi, ana görev dosyasındaki `- [x]` (tamamlanan) vs `- [ ]` (bekleyen) checkbox oranına göre `registry_sync.py` tarafından otomatik hesaplanır.

## 4. Arşivleme Disiplini (Completed)
- Bir görev bittiğinde klasör **tüm artifaktlarıyla (brainstorm, plan vb.)** birlikte `active` dizininden `completed` dizinine taşınır. Hafıza asla bölünmez.

---
*Bu protokol, VentHub V7 mimarisinin sarsılmaz temelidir.*
