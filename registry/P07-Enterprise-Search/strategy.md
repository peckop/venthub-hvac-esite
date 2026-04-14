# P07 - Enterprise Search & AI RAG Platform

## Vizyon ve Amaç (Epic Vision)
Bu projenin amacı, VentHub platformunu basit bir e-ticaret arama altyapısından, kurum içi ve genel teknik dokümantasyonu (PDF'ler, fan eğrileri, teknik özellikleri) anlayan ve son kullanıcıyla doğrudan etkileşime girebilen **Yapay Zeka Destekli Kurumsal Çekirdek (Enterprise Search & RAG)** seviyesine taşımaktır.

Geleneksel ve eksik olan "anahtar kelime eşleştirme" (keyword matching) sistemi iptal edilerek kullanıcının niyetini anlayan asistan (Ajan) yaklaşımına geçilecektir. 
Örneğin: *"Bana 5000 m3/h debili, çatıda kullanıma uygun sessiz bir fan bul"* veya *"Bu otopark projesi için ne kadarlık bir fan gerekiyor?"* denildiğinde sistemin teknik tabloları yorumlayarak nokta atışı mühendislik sonuçları dönmesi hedeflenmektedir.

## Mimari İşleyiş Sırası ve Tasarım (Data Pipeline & Roadmap)

Aşağıdaki iş akışı, ham PDF verisinden ticari AI ajanına uzanan işleme hattını (Data Pipeline) tarif eder. Alt görevler (Tasks), bu zinciri sağlam bir şekilde inşa etmek için oluşturulacaktır.

### [Faz 0] Zemin Etüdü ve Bağlantılar (Environment Setup) (Görev: 000)
- Eski nesil arama (P00/030 gibi) yapılarının incelenip devre dışı bırakılması veya bu sisteme yedirilmesi.
- PDF scraping/toplama betikleri için zemin etüdünün yapılması.
- API anahtarlarının (OpenRouter, Gemini) ve güvenlik altyapısının projeye (Cloudflare / Supabase Env) bağlanması.

### [Faz 1] Document-to-Image Çevrim Hattı (Sanitization & Conversion)
- Cihaz ve ürün spesifikasyon PDF'lerinin toplanıp yapılandırılması.
- Karmaşık PDF metinlerini, tablolarını ve grafiklerini yapay zekaya "resim" olarak okutabilmek için PDF -> Yüksek Çözünürlüklü PNG toplu dönüştürme (Batch Conversion) modülünün inşası.

### [Faz 2] Vision Tabanlı Teknik Veri Çıkarımı (Structured Extraction)
- `Antigravity / Gemini 1.5 Flash Vision` gibi görsel idraki yüksek ve hızlı modeller kullanılarak PNG'lerin taranması.
- Resimdeki mühendislik tablolarının, fan debi grafiklerinin okunması.
- Alınan bu dağınık verilerin, sisteme kolayca entegre edilecek formatta (JSON yapısal şeması / Technical Specs) çıkarılması.

### [Faz 3] Vektörel Altyapı ve Embeddings (Pinecone / pgVector)
- Çıkarılan bu yapısal ürün bilgilerinin, OpenRouter (Örn: Qwen 8B, Nomic vb.) kullanılarak anlamsal semantik vektörlere (Text Embeddings) dönüştürülmesi.
- Supabase üzerinde PostgreSQL `pgvector` eklentisinin aktif edilmesi. Veritabanının "RAG-ready" (vektörel aramaya hazır) hale getirilmesi.

### [Faz 4] RAG Arama Çekirdeği (Core Search API & Retrieval)
- Anlamsal sorguyu (Semantic Query) yönetecek ana RAG (Retrieval-Augmented Generation) algoritması. 
- Supabase Edge Functions veya Next.js Route Handlers ile "Kosinüs Benzerliği" (Cosine Similarity) motorunun devreye alınması ve response optimizasyonu.

### [Faz 5] Ticari Yapay Zeka Ajanı Arayüzü (AI Shopping Guide)
- Front-end tarafında, kullanıcının mühendislik bazlı sorularını karşılayan modern Chat/Search komponentlerinin geliştirilmesi.
- Bu AI sisteminin hem ürün önerisi (Product Recommendation) hem de teknik kılavuz (Technical Guide) rollerini üstlenerek bir satış mühendisi gibi alışveriş sürecini asiste etmesi.

---

> Üretim Disiplini (No-Plan-No-Code):
> P07 altındaki her bir alt görev yukarıdaki fazları temsil eder. İçerisine girildiğinde mutlaka kendi `brainstorm.json` ve `plan.json` dosyaları doldurulacak; mimari ispat yapılmadan hiçbir koda dokunulmayacaktır.
