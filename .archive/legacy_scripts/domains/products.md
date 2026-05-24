---
description: "Sınır Bildirimi ve Alan Kısıtlamaları: Products Domain"
---

# 🛡️ Domain Boundary: Products

Bu dosya, ürün kataloğu, ürün detayı ve ürün listeleme (Products) işlemlerine hizmet edecek tüm görevler için **Çalışma Sınırı Bildirimidir**. "Bilgilendirme" değil, **ZORUNLU OPERASYON KATMANIDIR**.
Eğer göreviniz buradaki yasaklı alanlara girmeyi gerektiriyorsa, YÖNTEMİNİZ YANLIŞTIR ve görevi bırakmanız gerekir.

## 🟢 İzinli Alanlar (Allowed Paths)
Bu domain altında Ajanın değiştirmesine, dosya eklemesine veya okumasına **İZİN VERİLEN** yollar:
- `src/app/products/**`
- `src/app/category/**`
- `src/components/product/**`
- `src/components/products/**`
- `src/components/category/**`
- `src/hooks/product/**`

## 🔴 Yasaklı Alanlar (Forbidden Paths)
Bu domain'in hiçbir şartta **DOKUNAMAYACAĞI** proje modülleri:
- `src/components/navigation/**` (Menü işleri Navigation domainine aittir)
- `src/lib/database.types.ts`
- `src/app/admin/**`
- `src/app/checkout/**`

## 🔒 Kurallar (Contracts & Constraints)
- **Performans:** Ürün listeleme ekranlarında Next.js sunucu tarafı render (SSR) işlemleri kullanılmalıdır. Resimler `next/image` ile yüklenmelidir.
- **İletişim/Dil:** Çeviri dosyalarındaki key adlandırma kuralı `namespace.key_name` dışında bir formatta olamaz.
- **Dependencies:** Bu domain'e özel dış paket (npm package) eklenemez.

> [!CAUTION]
> **Ajanlara Not:** JSON dosyanızdaki `allowed_paths` alanını hazırlarken sadece bu metinde yer alan 🟢 İzinli Alanlara odaklanın. `max_files_changed` bütçenizi bu dosyalara göre ayarlayın. Polisin sizi reddetmemesi için bu sınırlara koşulsuz uymanız gerekmektedir.
