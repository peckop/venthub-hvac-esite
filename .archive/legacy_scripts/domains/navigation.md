---
description: "Sınır Bildirimi ve Alan Kısıtlamaları: Navigation Domain"
---

# 🛡️ Domain Boundary: Navigation

Bu dosya, menüler, header, footer ve genel yönlendirme (Navigation) yapılarına hizmet edecek tüm görevler için **Çalışma Sınırı Bildirimidir**. "Bilgilendirme" değil, **ZORUNLU OPERASYON KATMANIDIR**.
Eğer göreviniz buradaki yasaklı alanlara girmeyi gerektiriyorsa, YÖNTEMİNİZ YANLIŞTIR ve görevi bırakmanız gerekir.

## 🟢 İzinli Alanlar (Allowed Paths)
Bu domain altında Ajanın değiştirmesine, dosya eklemesine veya okumasına **İZİN VERİLEN** yollar:
- `src/components/navigation/**`
- `src/components/Footer.tsx`
- `src/components/StickyHeader.tsx`
- `src/hooks/navigation/**`

## 🔴 Yasaklı Alanlar (Forbidden Paths)
Bu domain'in hiçbir şartta **DOKUNAMAYACAĞI** proje modülleri:
- `src/app/checkout/**`
- `src/lib/database.types.ts`
- `src/components/admin/**`

## 🔒 Kurallar (Contracts & Constraints)
- **Responsive Zorunluluğu:** Navigasyon bileşenleri mobil (hamburger menü vb.) ve masaüstü uyumlu olmak zorundadır. Tailwind CSS ile breakpoint'lere tam uyum sağlanmalıdır.
- **İletişim/Dil:** Çeviri dosyalarındaki key adlandırma kuralı `namespace.key_name` dışında bir formatta olamaz.

> [!CAUTION]
> **Ajanlara Not:** JSON dosyanızdaki `allowed_paths` alanını hazırlarken sadece bu metinde yer alan 🟢 İzinli Alanlara odaklanın. `max_files_changed` bütçenizi bu dosyalara göre ayarlayın. Polisin sizi reddetmemesi için bu sınırlara koşulsuz uymanız gerekmektedir.
