# 🧠 corpus-callosum: Federatif Global Hafıza Motoru

corpus-callosum, otonom Yapay Zeka ajanlarının (Antigravity, Jules vb.) geçmiş konuşmaları, proje kararlarını ve mimari kuralları **uzun vadeli** hatırlamasını sağlayan, **SQLite ve Numpy tabanlı**, taşınabilir (portable) bir RAG (Retrieval-Augmented Generation) Vektör Veritabanı ve Akıllı Hafıza motorudur.

## Neden corpus-callosum?

Hafıza sistemi, beyin anatomisindeki ilham alınarak tasarlanmıştır. Nasıl ki insan beyninde **Corpus Callosum** sağ ve sol lobları birbirine bağlar ve devasa bilgi akışını optimize ederse; bu hafıza motoru da yapay zeka ajanı ile proje verileri arasındaki bağlantıyı sağlar.

## Mantık: Semantik Çekim (Semantic Gravity)

corpus-callosum, basit bir anahtar kelime eşleştirme yapmaz; "Semantik Çekim (Semantic Gravity)" ilkeleriyle işlem yapar. Vektör uzaklıkları hesaplandıktan sonra sonuçlar 4 acımasız fizik filtresinden geçer:
Sistem anatomik olarak iki ana parçadan oluşur:

### 1. Beyin Lobları (Lokal Veritabanı) - Klasör: `memory-engine`
Her projenin `data/memory.db` konumunda yer alan kendi bağımsız hafızasıdır.
- **Teknoloji:** Sadece standart kütüphaneler kullanılarak, WAL modunda çalışan yüksek eşzamanlılıklı tamamen izole SQLite Vektör tabanı. Vektör motoru OpenRouter Qwen3 tabanlıdır.
- **Bağımsızlık:** Bu `memory-engine` klasörünü (yani projeyi) zipleyip nereye götürürseniz götürün, projenin kendi bilgi ve tecrübe hafızası kaybolmaz.

### 2. Corpus Callosum (Global MCP Sunucusu) - Klasör: `global-mcp-backup`
Farklı beyin loblarını (projeleri) birbirine bağlayan, aralarında federatif bir çapraz sorgu (cross-project) imkanı sunan ve Yapay Zeka IDE'si (Cursor, Antigravity) ile doğrudan standart bir API üzerinden konuşan "İletişim Omurgası"dır.
- **Teknoloji:** `mcp_server.py` ve `federation.py` dosyalarıdır. Python'ın FastMCP standartlarıyla stdio üzerinden asenkron veriyolu açar.
- **Konumu:** IDE'nin arka plan klasörlerine (örn. `.gemini` gizli dizinine) veya istediğiniz global bir dizine kurulabilir. Biz bu sistemin hiçbir şekilde yok olmaması ve "yedekli" çalışması için onları `global-mcp-backup` isimli klasörde bir yedek olarak "can yeleği" mantığında her zaman projenin yanında korumaya aldık. Başka bilgisayara geçildiğinde bu can yeleği açılır.

## ⚙️ Nasıl Çalışır? Mekaniği Nedir?
TeleMem Pro Max, basit bir anahtar kelime eşleştirme yapmaz; "Semantik Çekim (Semantic Gravity)" ilkeleriyle işlem yapar. Vektör uzaklıkları hesaplandıktan sonra sonuçlar 4 acımasız fizik filtresinden geçer:

1. **Alan Ayırımı (Domain-Awareness):** 
   Sisteme kaydedilen her bilgi metni otomatik olarak 5 alandan birine sınıflandırılır (`database`, `frontend`, `planning`, `skill`, `general`). 
2. **Aktif İnhibisyon:** 
   Eğer ajan "Supabase RLS ayarları nasıl yapılır?" diye sorarsa sorgu motoru Frontend bilgilerini tamamen bloklamaz; ancak Frontend düğümlerinin puanını `x0.3` katsayısıyla "baskılar". Tıpkı insan beyninin odaklanırken alakasız lobları susturması gibi gürültü kesilir.
3. **Mesafe Penaltısı (Cross-Project Querying):** 
   Ajan "VentHub" projesindeyken, federasyona katılmış başka bir veri tabanından (örn. e-ticaret X projesi) çok benzer bir kod çözümü çekilebilir. Ancak dış projeden gelen bu tecrübe `x0.5` uzaklık katsayısı ile (Penaltı) normalize edilir. Böylece kendi projene ait cevaplar hep `x1.0` ile daha baskındır. Ajan asla başka projenin mimarisini senin projene direkt olarak empoze edemez.
4. **Zaman Aşımı (Recency Decay):** 
   Eski anıların ağırlığı zaman geçtikçe logaritmik bir formülle düşer. Bilginin Yarı ömrü (half-life) 30 gün olarak belirlenmiştir (`exp(-lambda * gün)`). Aynı kod üstüne yazıldıkça yeni bilgi eski bilgiyi doğal bir ezmeyle üsteler, veri kirliliğinden kurtulur.
5. **LLM Konsolidasyonu (Hafıza Temizliği):** 
   Ajan sürekli kod yazarken benzer şeyleri tekrar tekrar ezberlemek isterse şişme olmasın diye LLM motoru bu çok benzer pürüzleri (Kosonüs Benzerliği >= 0.95 olanlar) yakalar; araya yetkili LLM'yi (Flash) sokar ve kendi kendine 2 node içeriğini analiz edip "tek parça rafine bir hafıza" oluşturur. Sistem kendi kendine "Özet" çıkararak hafıza boyutunu kontrol altında tutar.

---
> ⚠️ **UYARI:** Başka bilgisayara geçişte yapılması gerekenler ve taşıma işlemleri için **`global-mcp-backup/TAHLIYE_VE_KURTARMA_PLANI.md`** belgesini mutlaka o an gelmeden önce inceleyin!
