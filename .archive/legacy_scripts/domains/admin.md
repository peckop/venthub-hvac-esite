---
description: "Sınır Bildirimi ve Alan Kısıtlamaları: Admin Domain"
---

# 🛡️ Domain Boundary: Admin

Bu dosya, yönetim paneli (Admin Dashboard) işlemlerine hizmet edecek tüm görevler için **Çalışma Sınırı Bildirimidir**. "Bilgilendirme" değil, **ZORUNLU OPERASYON KATMANIDIR**.
Eğer göreviniz buradaki yasaklı alanlara girmeyi gerektiriyorsa, YÖNTEMİNİZ YANLIŞTIR ve görevi bırakmanız gerekir.

## 🟢 İzinli Alanlar (Allowed Paths)
Bu domain altında Ajanın değiştirmesine, dosya eklemesine veya okumasına **İZİN VERİLEN** yollar:
- `src/app/admin/**`
- `src/components/admin/**`
- `src/hooks/admin/**`
- `src/lib/admin/**`

## 🔴 Yasaklı Alanlar (Forbidden Paths)
Bu domain'in hiçbir şartta **DOKUNAMAYACAĞI** proje modülleri:
- `src/app/(public)/**` veya ana kullanıcıya dönük sayfalar (örn. `src/app/products/**`)
- `src/components/navigation/**` (Kullanıcı tarafı navigasyon)
- `src/lib/database.types.ts`

## 🔒 Kurallar (Contracts & Constraints)
- **Yetkilendirme (AuthZ):** Yönetim paneline eklenen her rota ve API endpoint'i kesinlikle Supabase RLS veya Server-side yetki kontrolünden `(role === 'admin')` geçmelidir.
- **İletişim/Dil:** Admin araçları için çeviriler admin namespace'i altında olmalı veya gerektiğinde hardcode (yalnızca dahili personel içinse ve kurallara uygunsa) kullanılabilir, ancak i18n tercih edilir.
- **Güvenlik Sızıntısı:** Admin sayfalarından public component'lere yetkili data sızdırılamaz.

> [!CAUTION]
> **Ajanlara Not:** JSON dosyanızdaki `allowed_paths` alanını hazırlarken sadece bu metinde yer alan 🟢 İzinli Alanlara odaklanın. `max_files_changed` bütçenizi bu dosyalara göre ayarlayın. Polisin sizi reddetmemesi için bu sınırlara koşulsuz uymanız gerekmektedir.
