---
description: "Sınır Bildirimi ve Alan Kısıtlamaları: UI Primitives Domain"
---

# 🛡️ Domain Boundary: UI Primitives

Bu dosya, projede genel olarak kullanılan tekrar edilebilir araçlar (Button, Input, Modal, Slider vb.) için **Çalışma Sınırı Bildirimidir**. "Bilgilendirme" değil, **ZORUNLU OPERASYON KATMANIDIR**.
Eğer göreviniz buradaki yasaklı alanlara girmeyi gerektiriyorsa, YÖNTEMİNİZ YANLIŞTIR ve görevi bırakmanız gerekir.

## 🟢 İzinli Alanlar (Allowed Paths)
Bu domain altında Ajanın değiştirmesine, dosya eklemesine veya okumasına **İZİN VERİLEN** yollar:
- `src/components/ui/**`
- `tailwind.config.js` (Eğer tasarım token eklenecekse, sadece ilgili kısım)

## 🔴 Yasaklı Alanlar (Forbidden Paths)
Bu domain'in hiçbir şartta **DOKUNAMAYACAĞI** proje modülleri:
- `src/app/**` (UI domaini sayfa veya route seviyesine karışamaz)
- `src/lib/database.types.ts`
- `src/components/admin/**`
- `src/components/checkout/**`

## 🔒 Kurallar (Contracts & Constraints)
- **Modülerlik ve Saf Fonksiyon (Pure Component):** UI bileşenleri dış dünya durumlarına (external state veya global context) bağımlı olmamalı, veriyi `props` üzerinden almalıdır.
- **Tasarım Sistemi Uyumluğu:** Tailwind utility sınıflarından ayrılmak yasaktır. Ek bir CSS dosyası oluşturulamaz.
- **Client/Server Güvenliği:** Hook kullanan interaktif UI bileşenleri dosya başına `\"use client\";` direktifini almalıdır.

> [!CAUTION]
> **Ajanlara Not:** JSON dosyanızdaki `allowed_paths` alanını hazırlarken sadece bu metinde yer alan 🟢 İzinli Alanlara odaklanın. `max_files_changed` bütçenizi bu dosyalara göre ayarlayın. Polisin sizi reddetmemesi için bu sınırlara koşulsuz uymanız gerekmektedir.
