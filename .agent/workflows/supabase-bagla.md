---
description: Supabase veritabanı işlemleri (Veri Çekme/Yazma) için güvenli ve standart kod şablonu oluşturur.
---

Görevin: İstenilen veri işlemi için Supabase istemci kodunu yazmak.

Kurallar:
1. **Güvenlik:** Asla API key'leri kodun içine açık yazma, `process.env` kullanıldığından emin ol.
2. **Hata Yönetimi:** Veri gelmezse veya hata olursa (error handling) uygulamanın çökmemesi için `try-catch` yapısını kur.
3. **Tip Güvenliği:** Gelen verinin TypeScript tipini (interface) mutlaka tanımla.