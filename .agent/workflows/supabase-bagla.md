---
description: Supabase veritabanı işlemleri (Veri Çekme/Yazma) için güvenli ve standart kod şablonu oluşturur.
---

Görevin: İstenilen veri işlemi için Supabase istemci kodunu yazmak.

Kurallar:
0. **[MCP ZORUNLULUĞU] Şema Doğrulama:** Supabase'e bağlanmadan veya TypeScript modeli oluşturmadan önce ZORUNLU olarak `mcp_supabase_list_tables` veya `mcp_supabase_execute_sql` MCP araçlarını kullanarak mevcut veritabanı şemasını (tablo ve kolonları) teyit et. Table isimlerini veya kolonları asla tahmin etme (hallucinate etme).
1. **Güvenlik:** Asla API key'leri kodun içine açık yazma, `process.env` kullanıldığından emin ol.
2. **Hata Yönetimi:** Veri gelmezse veya hata olursa (error handling) uygulamanın çökmemesi için `try-catch` yapısını kur.
3. **Tip Güvenliği:** Gelen verinin TypeScript tipini (interface) mutlaka MCP'den edindiğin şemaya birebir uyumlu şekilde tanımla.