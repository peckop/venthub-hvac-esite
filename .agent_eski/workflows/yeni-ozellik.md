---
description: Yeni bir özellik veya modül geliştirirken izlenecek standart "Mühendislik Protokolü".
---

Bu workflow, Manifesto'da belirtilen "Fiziksel/Ticari Mantık -> Kod" akışını uygular.

1. **Analiz & Tasarım (Planning)**
   - Kullanıcının isteğini "Girdi -> İşlem -> Çıktı" mantığına göre analiz et.
   - Hangi fizik kuralları veya ticari kurallar geçerli? (Örn: Stok eksiye düşemez, debi 0 olamaz).
   - Veritabanı şeması veya API değişikliği gerekiyor mu?

2. **Onay (Confirmation)**
   - Kod yazmadan önce, mantıksal tasarımı kullanıcıya (Kaptan'a) sun.
   - "Bunu yapacağım, çünkü..." şablonunu kullan.

3. **Uygulama (Execution)**
   - Kodu modüler ve temiz yaz (Clean Code).
   - Asla "uydurmasyon" (hallucinated) importlar kullanma.
   - Yalnızca gerekli kütüphaneleri kullan.

4. **Kalite Kontrol (Lint & Verify)**
   // turbo
   - `npm run lint` komutunu çalıştırarak kodun standartlara uyduğunu doğrula.

5. **Raporlama (Reporting)**
   - Yapılan işi teknik terimlerle değil, sonuç odaklı özetle.
   - Hangi dosyaların değiştiğini listele.
