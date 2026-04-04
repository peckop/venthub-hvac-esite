---
description: "Sınır Bildirimi ve Alan Kısıtlamaları: Checkout Domain"
---

# 🛡️ Domain Boundary: Checkout

Bu dosya, ödeme ve sepetten çıkış (checkout) işlemlerine hizmet edecek tüm görevler için **Çalışma Sınırı Bildirimidir**. "Bilgilendirme" değil, **ZORUNLU OPERASYON KATMANIDIR**.
Eğer göreviniz buradaki yasaklı alanlara girmeyi gerektiriyorsa, YÖNTEMİNİZ YANLIŞTIR ve görevi bırakmanız gerekir.

## 🟢 İzinli Alanlar (Allowed Paths)
Bu domain altında Ajanın değiştirmesine, dosya eklemesine veya okumasına **İZİN VERİLEN** yollar:
- `src/app/checkout/**`
- `src/app/payment-success/**`
- `src/components/checkout/**`
- `src/hooks/checkout/**`
- `src/lib/payment/**`

## 🔴 Yasaklı Alanlar (Forbidden Paths)
Bu domain'in hiçbir şartta **DOKUNAMAYACAĞI** proje modülleri:
- `src/components/navigation/**`
- `src/lib/database.types.ts`
- `src/components/admin/**`
- `src/app/admin/**`

## 🔒 Kurallar (Contracts & Constraints)
- **Güvenlik Bütünlüğü:** Ödeme işlemleri güvenliği tehlikeye atacak şekilde istemci tarafında (client-side) bypass edilemez.
- **İletişim/Dil:** Çeviri dosyalarındaki key adlandırma kuralı `namespace.key_name` dışında bir formatta olamaz.
- **Dependencies:** Bu domain'e özel dış paket (npm package) eklenemez. Mevcut kütüphaneler kullanılmalıdır.

> [!CAUTION]
> **Ajanlara Not:** JSON dosyanızdaki `allowed_paths` alanını hazırlarken sadece bu metinde yer alan 🟢 İzinli Alanlara odaklanın. `max_files_changed` bütçenizi bu dosyalara göre ayarlayın. Polisin sizi reddetmemesi için bu sınırlara koşulsuz uymanız gerekmektedir.
