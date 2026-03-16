---
id: 008
title: "Registry V3.1: Proaktif Bütünlük & Pulse Dashboard"
status: "Completed"
progress: "100%"
priority: "High"
depends_on: [007]
artifacts:
  brainstorm: "artifacts/superpowers/008-brainstorm.md"
  plan: "artifacts/superpowers/008-plan.md"
  review: "artifacts/superpowers/008-review.md"
---

# 008 - Registry V3.1: Proaktif Bütünlük & Pulse Dashboard

## Hedef
Registry sistemini "pasif" bir kayıt defterinden, projenin "otonom denetçisine" dönüştürmek.

## Girdi -> İşlem -> Çıktı
1. **Girdi:** Pasif registry yapısı ve manuel takip ihtiyacı.
2. **İşlem:** Metadata genişletme (`priority`, `depends_on`), Kaçak Operasyon denetimi ve Otomatik `PULSE.md` (Dashboard) üretimi.
3. **Çıktı:** Tek bakışta projenin durumunu gösteren, tutarlılığı denetleyen otonom sistem.

## Kabul Kriterleri (Salat Check)
- [x] `registry/PULSE.md` dosyası her `sync` sonrası otomatik üretiliyor mu?
- [x] "Kaçak Operasyonlar" (Registry'de olmayan artifaktlar) raporlanıyor mu?
- [x] Bağımlılık (`depends_on`) ve Öncelik (`priority`) alanları metadata'da aktif mi?
- [x] Protokol (V3.1) bu yeni kuralları içeriyor mu?
