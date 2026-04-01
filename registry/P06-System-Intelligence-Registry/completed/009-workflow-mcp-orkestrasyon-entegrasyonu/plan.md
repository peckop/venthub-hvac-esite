# 📋 Implementation Plan: P06/009 — Workflow-MCP Orkestrasyon Entegrasyonu

> **Brainstorm:** `registry/P06-System-Intelligence-Registry/backlog/009-workflow-mcp-orkestrasyon-entegrasyonu/brainstorm.md` — Option 2 (Direktif Bazlı) seçildi
> **Model:** Gemini 3.1 Pro (High) | **Tarih:** 26.03.2026
> **Tahmini Toplam Süre:** ~60 dakika (4 adım × ~15 dk + test)

---

## Hedef
Ajanların halihazırda bağlı olan MCP (Model Context Protocol) sunucularını (Context7, Supabase vb.) spesifik workflow'lar çağrıldığında otonom olarak (manuel emir beklemeden) kullanmalarını sağlayacak "zorunlu talimat setlerini" ilgili `.md` dosyalarına enjekte etmek.

## Varsayımlar
- Ajanlar, `mcp_context7-live_query-docs` veya `mcp_supabase_list_tables` gibi fonksiyonların isimlerini direktiflerde gördüklerinde çağırmayı başarabilirler.
- `bitir`, `yeni-ozellik` ve `supabase-bagla` workflow'ları sistem tarafından zaten başarılı bir şekilde okunmaktadır.
- Projede mevcutta `python registry/manage_registry.py` dosyası hatasız çalışmaktadır.

## Plan

1. **`/bitir.md` Entegrasyonu**
   - **Dosyalar:** `.agent/workflows/bitir.md`
   - **Değişiklik:** En son adıma (Push sonrası) `python registry/manage_registry.py remember` ve ilgili görevi tamamlamak için `python registry/manage_registry.py complete [PROJ_ID] [TASK_ID]` komutlarını çalıştırma zorunluluğu getiren direktif ekle.
   - **Doğrulama:** `cat .agent/workflows/bitir.md` veya `type` yaparak içeriği teyit et.

2. **`/yeni-ozellik.md` Context7 MCP Entegrasyonu**
   - **Dosyalar:** `.agent/workflows/yeni-ozellik.md`
   - **Değişiklik:** "1. Analiz & Tasarım" adımından hemen önce veya içeriğine: "Eklenecek özellik Next.js 15, React 19 veya diğer dış kütüphanelere dayanıyorsa, KOD YAZMAYA BAŞLAMADAN ÖNCE `context7-live` MCP araçlarıyla güncel best-practice dokümanlarını çek." talimatını kesin bir dille yaz.
   - **Doğrulama:** Dosyayı okuyarak değişikliği gözden geçir.

3. **`/supabase-bagla.md` Supabase MCP Entegrasyonu**
   - **Dosyalar:** `.agent/workflows/supabase-bagla.md`
   - **Değişiklik:** "ÖNCE `mcp_supabase_list_tables` veya ilgili Supabase MCP komutlarıyla tabloların güncel şemalarını kesin olarak oku. Tahmin yürütme!" talimatını Kurallar bölümüne 4. Kural olarak ekle.
   - **Doğrulama:** Dosyayı okuyarak kuralın eklendiğini teyit et.

4. **`superpowers-plan` SKILL'inde MCP Bilincinin Oluşturulması**
   - **Dosyalar:** `.agent/skills/superpowers-plan/SKILL.md`
   - **Değişiklik:** `Planning rules` başlığına şu kuralı ekle: "- If the task requires external framework knowledge, explicitly add a step to use `context7-live` MCP. If it touches DB architecture, step 1 should use Supabase MCP tools."
   - **Doğrulama:** Dosyayı okuyarak MCP kelimesinin kurala eklendiğini doğrula.

5. **`superpowers` İş Akışlarının Otonom Registry Sistemine Uyarlanması**
   - **Dosyalar:** `.agent/workflows/superpowers-brainstorm.md` ve `.agent/workflows/superpowers-write-plan.md`
   - **Değişiklik:** Dosyaların "Kaydet" bölümlerindeki `artifacts/superpowers/...` hardcoded yollarını sil veya güncelle. Yerine, "Görev tanımındaki `artifacts:` yollarını bulup doğrudan oraya kaydet. Ayrıca en üste Model, Görev, Tarih başlıklarını daima ekle." emrini koy.
   - **Doğrulama:** Değişikliği dosyaları okuyarak teyit et.

## Riskler ve Azaltmalar
- **Risk:** Ajanın MCP talimatlarını önemsememesi.
- **Azaltma:** Promptlar "ZORUNLUDUR", "ÖNCE BUNU ÇALIŞTIR YOKSA BAŞLAMA" gibi emredici (imperative) dille yazılacak.

## Geri Dönüş (Rollback) Planı
Git aracı ile dosyaları eski `commit` konumlarına geri al (`git checkout HEAD -- .agent/`).