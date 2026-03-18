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

## 5. Görev Yaşam Döngüsü (The 6-Step Workflow)
Görevler aşağıdaki sırayla ilerlemek zorundadır:
1. **[Backlog] Brainstorming:** `/superpowers-brainstorm` çalıştırılır ve `brainstorm.md` dolgun bir içerikle (riskler, stratejiler) doldurulur.
2. **[Backlog] Planning:** `/superpowers-write-plan` çalıştırılır ve `plan.md` içine doğrulanabilir (`Verify:`) uygulama adımları yazılır.
3. **[Backlog -> Active] Activation:** `python manage_registry.py activate {PROJ} {ID}` çalıştırılır. Dosya içerikleri kontrol edilir ve görev taşınır.
4. **[Active] Implementation:** Görev statüsü `Executing` yapılır. Plan adım adım uygulanır. Her kod değişiminden sonra `Verify:` maddesi doğrulanır.
5. **[Active] Review:** İş bitince `/superpowers-review` çalıştırılır ve `review.md` doldurulur. Lint ve testler (`bitir` workflow) koşulur.
6. **[Active -> Completed] Closing:** `python manage_registry.py task {ID} completed` ile görev arşivlenir ve `PULSE.md` güncellenir.

## 6. Zorunlu Görev Şablonu (Mandatory Template)
Tüm görev dosyaları aşağıdaki standart yapıda olmak zorundadır:

```markdown
---
id: XXX
title: "Görev Başlığı"
priority: "HIGH|MED|LOW|CRIT"
status: "TODO|Planning|Executing|Review|Completed"
progress: 0%
project: "PXX-Proje-Adi"
created_at: "YYYY-MM-DD HH:MM:SS"
updated_at: "YYYY-MM-DD HH:MM:SS"
artifacts:
  brainstorm: "registry/path/to/brainstorm.md"
  plan: "registry/path/to/plan.md"
  review: "registry/path/to/review.md"
---

# 🛠️ XXX: Görev Başlığı
Görevin kısa tanımı ve kapsamı.

## 🎯 Hedefler
- [ ] Hedef 1 (İş değeri odaklı)
- [ ] Hedef 2

## ✅ Alt Görevler
- [ ] Teknik adım 1 (Checkbox zorunludur)
- [ ] Teknik adım 2
```

---
*Bu protokol, VentHub V7 mimarisinin sarsılmaz temelidir.*
