---
name: venthub-deep-mri
description: Deep MRI (Magnetic Resonance Imaging) Diagnostics Engine for VentHub. Works in sequence after Röntgen Pass.
---

# VentHub Deep MRI
Bu skill, VentHub'ın derin performans ve teknik borç tarayıcısıdır. `run_rontgen.py` mimari blokajları (build, lint, type-check, SSOT) çözerken; MRI dead code, unused dependencies, ve bundle size optimizasyonları gibi derin sorunları tarar.

## Kurallar
1. **Röntgenden Sonra:** Röntgen (Health Check) `PASS` vermeden asla MRI çekilemez.
2. **Read-Only Raporlama:** MRI motoru doğrudan kodu değiştirmez (ameliyat yapmaz). Sadece durumu raporlar. Cerrahi müdahale ajan tarafından rapor incelendikten sonra yapılır.
3. **Maliyet:** MRI (Bundle analiz, dead code taraması vb.) röntgene göre daha uzun zaman alır. Bu nedenle her commit öncesi değil, performans testleri veya temizlik sprintleri öncesi çalıştırılmalıdır.

## Kullanım Cihazları
- **Kurulum:** `package.json` içerisinde mri çalıştırılabilir komutu mevcuttur (`pnpm run mri` kullanır).
- **Komut:** `python .agent/skills/venthub-deep-mri/run_mri.py` 
- **Çıktılar:** Analiz raporları klasör yapısı olarak `.agent/reports/` altında toplanacaktır.
