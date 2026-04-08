# 🧠 corpus-callosum: Federatif Global Hafıza Motoru

corpus-callosum, otonom Yapay Zeka ajanlarının (Antigravity, Jules vb.) geçmiş konuşmaları, proje kararlarını ve mimari kuralları **uzun vadeli** hatırlamasını sağlayan, **SQLite ve Numpy tabanlı**, taşınabilir (portable) bir RAG (Retrieval-Augmented Generation) Vektör Veritabanı ve Akıllı Hafıza motorudur.

## Neden corpus-callosum?

Hafıza sistemi, beyin anatomisinden ilham alınarak tasarlanmıştır. Nasıl ki insan beyninde **Corpus Callosum** sağ ve sol lobları birbirine bağlar ve devasa bilgi akışını optimize ederse; bu hafıza motoru da yapay zeka ajanı ile proje verileri arasındaki bağlantıyı sağlar.

## Mimari

Sistem anatomik olarak iki ana parçadan oluşur:

### 1. Beyin Lobları (Lokal Veritabanı)
Her projenin `data/memory.db` konumunda yer alan kendi bağımsız hafızasıdır.
- **Teknoloji:** WAL modunda çalışan yüksek eşzamanlılıklı tamamen izole SQLite Vektör tabanı. Vektör motoru OpenRouter Qwen3 tabanlıdır.
- **Bağımsızlık:** Bu projeyi zipleyip nereye götürürseniz götürün, projenin kendi bilgi ve tecrübe hafızası kaybolmaz.

### 2. Corpus Callosum (Global MCP Sunucusu)
Farklı beyin loblarını (projeleri) birbirine bağlayan, aralarında federatif bir çapraz sorgu (cross-project) imkanı sunan ve Yapay Zeka IDE'si ile doğrudan standart bir API üzerinden konuşan "İletişim Omurgası"dır.
- **Teknoloji:** `mcp_server.py` ve `federation.py`. Python FastMCP standartlarıyla stdio üzerinden asenkron veriyolu açar.
- **Canlı Motor:** `C:\Users\alize\.gemini\antigravity\memory-engine\` dizininde çalışır.
- **Yedek (Can Yeleği):** `global-mcp-backup` klasöründe her zaman güncel kopyası tutulur. Yeni bilgisayara geçişte bu yedek kullanılır.

## MCP Tool'ları (8 Adet)

| Tool | Açıklama |
|------|----------|
| `cc_set_project(name)` | **Oturum başında çağrılır.** Aktif projeyi ayarlar (venthub, qvalidator vb.) |
| `cc_search(query)` | Hafızadan semantik arama yapar. `cross_project=True` ile tüm projeler taranır |
| `cc_remember(content)` | Yeni bilgiyi aktif projenin hafızasına kaydeder |
| `cc_list_projects()` | Kayıtlı tüm projeleri listeler |
| `cc_register(name, ...)` | Yeni bir projeyi federasyona dahil eder |
| `cc_cluster_memories()` | Benzer kayıtları LLM ile birleştirip MACRO-MEMORY oluşturur |
| `cc_reindex()` | Arşivlenmiş/silinen kayıtları fiziksel olarak temizler (VACUUM) |
| `cc_set_project(name)` | Aktif projeyi değiştirir |

## Yeni Proje Ekleme Adımları

1. `cc_register` ile projeyi kaydet (db_path, workspace_root, env_file)
2. Projenin `.env` dosyasına `OPENROUTER_API_KEY=sk-or-v1-...` ekle
3. Oturum başında `cc_set_project("proje_adi")` çağır

## Semantik Çekim (Semantic Gravity) Mantığı

corpus-callosum basit anahtar kelime eşleştirme yapmaz; vektör uzaklıkları hesaplandıktan sonra sonuçlar 5 fizik filtresinden geçer:

1. **Alan Ayırımı (Domain-Awareness):** Her bilgi 5 alandan birine sınıflandırılır (`database`, `frontend`, `planning`, `skill`, `general`).
2. **Aktif İnhibisyon:** Alakasız alanların puanı `x0.3` katsayısıyla baskılanır.
3. **Mesafe Penaltısı (Cross-Project):** Dış projeden gelen bilgi `x0.5` ile normalize edilir. Kendi projenin bilgisi her zaman baskındır.
4. **Zaman Aşımı (Recency Decay):** Yarı ömür 30 gün (`exp(-lambda * gün)`). Eski bilgi doğal olarak kaybolur.
5. **LLM Konsolidasyonu:** Kosinüs benzerliği >= 0.92 olan kayıtlar birleştirilerek `[MACRO]` bellek oluşturulur.

## Kayıtlı Projeler

| Proje | DB Yolu | Workspace |
|-------|---------|-----------|
| venthub | `venthub-hvac/memory-engine/data/memory.db` | `C:\Users\alize\venthub-hvac` |
| qvalidator | `QVALIDATOR/data/memory.db` | `C:\Users\alize\QVALIDATOR` |

---
> ⚠️ **UYARI:** Başka bilgisayara geçişte yapılması gerekenler ve taşıma işlemleri için **`global-mcp-backup/TAHLIYE_VE_KURTARMA_PLANI.md`** belgesini mutlaka inceleyin!
