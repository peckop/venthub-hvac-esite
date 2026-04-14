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
- **Kurulum:** `package.json` içerisinde mri çalıştırılabilir komutu mevcuttur (`pnpm run mri` kullanır). İlk yapılması gereken şey MRI/Knip Config dosyasının (örn: `knip.json` veya benzeri) **exclude/entry ayarlarına bakıp `.agent/**`, `registry/**` vb. klasörlerin çıkarıldığından (temiz scope)** emin olmaktır. Gürültülü raporlar güvenilmezdir.
- **Komut:** `python .agent/skills/venthub-deep-mri/run_mri.py` 
- **Çıktılar:** Analiz raporları klasör yapısı olarak `.agent/reports/` altında toplanacaktır.

## MRI Sonrası Değerlendirme (Post-MRI Audit)
MRI çalıştıktan sonra rapordaki ağırlıklara (.next/analyze) bakarak şu sorular cevaplanmalıdır:
1. Ön Yüz (Product) sayfası **First Load JS** bundle boyutu çok mu ağır (örn: >400kb)? Ağırsa 3D/Galeri gibi kısımlar `next/dynamic` (lazy load) yapılmalı mı?
2. Gereksiz veya Rapordaki "false positive" sonuçları elediğimizde gerçekten kullanılmayan kod var mı?
