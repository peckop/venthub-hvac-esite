---
name: notebook-navigator
description: >
  ** Triggers when the user asks a conceptual, architectural, or research question that requires deep external knowledge, reference to past documentation, guidelines on RAG/Memory, or queries about specific domains (like 3D rendering, DevOps, React/Next.js, or Vortice product catalogs).
  Use this skill to identify the correct NotebookLM notebook ID and perform queries against it.
  DO NOT use this skill for simple local code edits.
  DO USE this skill when you need a "second brain" or technical research guidance (e.g., "MCP nasıl kurulur?", "RAG'da memory nasıl yönetilir?", "Hunyuan3D pipeline'ı nasıldı?").
---

# NotebookLM Navigator (Ajanlar İçin Referans Rehberi)

Ajanlar, kompleks sistem kararları alırken veya spesifik domain bilgisine (örneğin WebGPU, Docker, Vortice Katalogları) ihtiyaç duyduklarında NotebookLM kütüphanesini kullanmalıdırlar.

## 1. Hangi Notebook Seçilmeli?

Notebook seçimi için fihrist dosyasını inceleyin:
**Bağlantı:** `docs/notebooks/index.md`

`index.md` dosyasını okuyarak sorulan sorunun veya ihtiyaç duyulan bilginin hangi başlık altına girdiğini bulun ve o notebook'un UUID (ID) değerini kopyalayın.

## 2. Notebook Nasıl Sorgulanır?

ID'yi tespit ettikten sonra, MCP aracı olan `mcp_notebooklm_notebook_query` kullanılarak defter içindeki tüm kaynaklara soru sorulur.

**Örnek Senaryo:** Kullanıcı "Next.js ile Supabase entegrasyonunda cache nasıl yönetilmeli?" diye sordu.
1. `index.md` üzerinden ilgili defteri bulursunuz: `3. NEXT.JS / REACT / ENTERPRISE WEB APPS` (ID: 0b85ac75-f456-40bf-9b04-de3161ee13b0)
2. Aşağıdaki MCP komutunu çağırırsınız:
   `mcp_notebooklm_notebook_query(notebook_id="0b85ac75-f456-40bf-9b04-de3161ee13b0", query="Next.js app router'da Supabase ile data caching best practice'leri nelerdir?")`

## 3. Katı Kurallar
- Kullanıcıya "Şu notebook'ta arayabilirim, ister misin?" diye **sormayın**. Gerekli görüyorsanız otonom olarak sorguyu yapıp sonucu entegre ederek cevap verin.
- Eğer kendi bilginiz (internal weights) çelişkili veya eskiyse (örn: yeni nesil MCP protokolleri, LangChain son versiyonları), mutlaka ilgili defteri (Örn: 1. CORE AI ENGINEERING NOTEBOOK) sorgulayın.
- Notebook'tan gelen cevap, projedeki lokal kodlarla uyuşmuyorsa, her zaman lokal kodu (`corpus-callosum`) referans alın; NotebookLM sadece bir rehber ve konsept danışmanıdır.
- **ÖNEMLİ KURAL (Authentication Expired Hatası):** Eğer sorgu sırasında "Authentication expired" hatası verirse, durumu kullanıcıya BİLDİRMEYİN veya ondan terminale komut girmesini İSTEMEYİN. Doğrudan otonom olarak `nlm login` komutunu çalıştırın. Kullanıcının sisteminde otomatik giriş (auto-login) aktiftir, dolayısıyla komutu çalıştırdığınız an kimlik doğrulama kendi kendine tamamlanacaktır. Ardından başarısız olan sorguyu tekrar tetikleyin.


## AXIOMS
Bu modül için henüz özel bir aksiyom tanımlanmamıştır.