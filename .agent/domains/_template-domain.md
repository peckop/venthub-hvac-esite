---
description: "Sınır Bildirimi ve Alan Kısıtlamaları Şablonu"
---

# 🛡️ Domain Boundary: [Domain Name]

Bu dosya, bu domain'e (örneğin PDP, Checkout, Navigasyon, Admin vb.) hizmet edecek tüm görevler için **Çalışma Sınırı Bildirimidir**. "Bilgilendirme" değil, **ZORUNLU OPERASYON KATMANIDIR**.
Eğer göreviniz buradaki yasaklı alanlara girmeyi gerektiriyorsa, YÖNTEMİNİZ YANLIŞTIR ve görevi bırakmanız gerekir.

## 🟢 İzinli Alanlar (Allowed Paths)
Bu domain altında Ajanın değiştirmesine, dosya eklemesine veya okumasına **İZİN VERİLEN** yollar:
- `src/components/[domain]/**`
- `src/app/[domain]/**`
- `src/lib/[domain]/**`

## 🔴 Yasaklı Alanlar (Forbidden Paths)
Bu domain'in hiçbir şartta **DOKUNAMAYACAĞI** proje modülleri:
- `src/components/navigation/**` (Sadece global menü görevleri dokunabilir)
- `src/lib/database.types.ts`
- `src/hooks/global/**`

## 🔒 Kurallar (Contracts & Constraints)
- **Tasarım Bütünlüğü:** Bu domain'deki değişiklikler global Cart (Sepet) mimarisini etkileyemez.
- **İletişim/Dil:** Çeviri dosyalarındaki key adlandırma kuralı `namespace.key_name` dışında bir formatta olamaz.
- **Dependencies:** Bu domain'e özel dış paket (npm package) eklenemez. Mevcut kütüphaneler (Vite, Radix vb.) kullanılmalıdır.

> [!CAUTION]
> **Ajanlara Not:** JSON dosyanızdaki `allowed_paths` alanını hazırlarken sadece bu metinde yer alan 🟢 İzinli Alanlara odaklanın. `max_files_changed` bütçenizi bu dosyalara göre ayarlayın. Polisin sizi reddetmemesi için bu sınırlara koşulsuz uymanız gerekmektedir.
