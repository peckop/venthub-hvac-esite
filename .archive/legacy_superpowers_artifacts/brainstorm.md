---
description: Superpowers brainstorm. Produces goal/constraints/risks/options/recommendation/acceptance criteria.
---

## Goal
Ajanların VentHub kod tabanındaki işlem gücünü artıran "Workflows" ve "Skills" yönergelerini salt tavsiyeden öteye taşıyarak; MCP (Model Context Protocol) araçlarını (Context7, Supabase, TestSprite, Github vb.) tetikleyen kesin ve emredici promptlar haline getirmek. Otonom yapıyı (Registry'yi) "agent-ic" hale getirmek.

## Constraints
- Ajanların mevcut "Güvenli Bütünlük" (`venthub-auditor`, `AGENTS.md`) kuralları kesinlikle dışına çıkılmayacak.
- Verilecek komutlar ve promptlar, LLM'in halüsinasyon yapmadan hangi tool'u çağırması gerektiğini net bir şekilde (kesin isimlerle örn: `mcp_context7-live_query-docs`) belirtecek.
- Workflow akışını bozmadan sadece aralara "Enjeksiyon (Injection)" yapılacak.

## Known context
- P06 zeka fırtınası ve planlama döngüleri oturmaya başladı.
- Ajanların elinde zaten `context7`, `supabase` gibi sunucular var ama bu sunucuları nasıl dahil edeceklerini (örneğin `/yeni-ozellik` dediğimizde hemen açıp doküman çekmeyi, ya da `/bitir` dediğimizde `manage_registry.py`'yi kendiliğinden invoke etmeyi) bilmiyorlar. 
- Bu iş tamamen `.agent/workflows/*` içindeki markdown belgelerine müdahale etmeyi gerektiriyor.

## Risks
- **Tool Overload (Araç Boğulması):** Ajanlara gereksiz MCP çağrıları yaptırmak, Context Limit'ini (Jeton) şişirebilir.
- **Infinite Loops (Sonsuz Döngü):** MCP araçlarının çıkardığı sonuçlara göre ajanların "Şimdi buradan ne yapmalıyım?" sendromuna girip hedeften şaşması.
- **Senaryo Bozulumu:** `/bitir` komutu gibi hassas workflow'ların akışının bozulması ve işlemi finalize edememesi.

## Options (2–4)
- **Option 1 (Yüzeysel Güncelleme):** Workflow dosyalarının başına sadece "Lütfen MCP imkanlarınızı kullanmaktan çekinmeyin" gibi soft uyarılar yazmak. (Etkisiz)
- **Option 2 (Direktif Bazlı - Tavsiye Edilen):** İlgili adım geldiğinde ajana kesin emirler veren triggerlar yazmak. Örneğin: `Adım 1: context7'nin "resolve-library-id" metodunu kullanarak Nextjs 15 dokümanı ara ve analiz et.`

## Recommendation
**Option 2 (Direktif Bazlı)** tercih edilmelidir. Ajanlar net ve "Call tool X with parameter Y" şekline yakın, deterministik insan talimatlarıyla en iyi performansı gösterirler. Hangi aşamada hangi aracın tetikleneceği `.md` dosyalarında "ZORUNLU ADIM" olarak işaretlenmelidir.

## Acceptance criteria
- `/bitir.md` workflow metninin sonunda `run_command` üzerinden `manage_registry.py remember` ve `manage_registry.py progress` çalıştırılmasını ve onaylanmasını isteyen kesin emirlerin bulunması.
- `/yeni-ozellik.md` workflow başlarında "Kullanılacak teknolojilerin güncel Next.js 15 versiyonu veya x kütüphanesi için context7-live MCP sunucusundan resmi doküman çek. Biliyormuş gibi yapma, son değişiklikleri mutlaka teyit et." tarzında sert uyarıların yer alması.
- `/supabase-bagla.md` için Supabase MCP (örn: şema getirme veya SQL çalıştırma) önerilerinin (tool referanslarıyla) verilmesi.
- `superpowers-plan/SKILL.md` kurallarındaki planlama şablonuna (Plan adımlarında hangi MCP aracıyla ne yapılacağını belirtmek üzerine) bir alt kırılımın eklenmesi.
