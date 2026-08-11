---
name: notebook-navigator
description: Use this skill to identify NotebookLM IDs and execute conceptual, architectural,
  RAG, or research queries requiring deep external domain knowledge. DO NOT use for
  local code changes, unit testing, git branching, formatting markdown tables, or
  styling fonts.
category: intelligence
metadata:
  triggers:
  - notebooklm query
  - ikizden sorgula
  - RAG query
  inputs:
  - query string
  outputs:
  - rag response text
  recovery:
    on_auth_expired: powershell -File .agent/scripts/nlm-headless-refresh.ps1  # oturum öldüyse: nlm login --clear (bkz. gövde)
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# NotebookLM Navigator (Ajanlar İçin Referans Rehberi)

Ajanlar, kompleks sistem kararları alırken veya spesifik domain bilgisine ihtiyaç duyduklarında
NotebookLM kütüphanesini kullanmalıdırlar.

## 1. Defter Dizini (Notebook Index)

Defter envanteri CANLI kaynaktan alınır: her oturumda önce `notebook_list` MCP aracını çağır
(44+ defter; adlar/kaynak sayıları değişir). Bu skill'de statik liste TUTULMAZ — drift eder.

### Kritik sabit ID'ler (sık kullanılan)
| Defter | ID |
|--------|----|
| VentHub Proje Hafızası (dijital ikiz) | `235043eb-970f-4a52-9f39-1d02b2621e9c` |
| Vortice \| 00 - Full Catalog | `0e5d2a83-e94f-433a-90e2-4c45b1e3730a` |
| Vortice \| 07 - TR Distribütör (Avensair) | `e3b18fa3-6310-4067-9873-2deb847d15a8` |
| 3. NEXT.JS / REACT / ENTERPRISE WEB APPS | `0b85ac75-f456-40bf-9b04-de3161ee13b0` |

**Not:** Ürün sorusu → önce Full Catalog, bulamazsan `notebook_list` ile ilgili kategori defterini bul.

## 2. Notebook Nasıl Sorgulanır?

ID'yi tespit ettikten sonra, MCP aracını kullanarak defter içindeki kaynaklara soru sorun:

```
notebook_query(notebook_id="<ID>", query="<soru>")
```

**Örnek:** Kullanıcı "Next.js ile Supabase cache nasıl yönetilmeli?" diye sordu:
1. Tablo → `3. NEXT.JS / REACT / ENTERPRISE WEB APPS` (ID: `0b85ac75-f456-40bf-9b04-de3161ee13b0`)
2. Sorgu: `notebook_query(notebook_id="0b85ac75-...", query="Next.js app router'da Supabase ile data caching best practice'leri nelerdir?")`

**Ürün sorusu:** "Vortice Vort HRI 350 teknik özellikleri?" → Önce `00 - Full Catalog`, bulamazsa ilgili kategori defteri.

## 3. NotebookLM'i İkinci Beyin Olarak Kullanma Kılavuzu (LLM Cognitive Extension)

NotebookLM sadece statik bir doküman arşivi değil, kod tabanının ve mimarinin tamamını saniyeler içinde analiz edebilen dinamik bir **Baş Danışmandır**. Yapay zeka ajanları (LLM) geliştirme yaparken ve kararlar alırken aşağıdaki bilişsel yönergeleri izlemelidir:

### A. Etki Analizi (Impact Analysis)
*   **Kural:** Kod tabanında veya veritabanı şemasında (özellikle RLS politikaları, middleware veya kritik SaaS bileşenlerinde) değişiklik yapmadan önce NotebookLM'e danışın.
*   **Sorgu Kalıbı:** *"X dosyasında/tablosunda yapacağım [değişiklik detayı] değişikliği sistem genelinde hangi bileşenleri, API'leri, ödeme geçitlerini (İyzico vb.) veya Edge Function'ları etkileyebilir? Risk analizini çıkar."*

### B. Proje İlerlemesinin Ölçülmesi (Progress & Complete Evaluation)
*   **Kural:** SaaS Faz 1 (veya aktif faz) hedeflerinin ne kadarının tamamlandığını, geride kalan güvenlik ve mimari açıkları ölçmek için NotebookLM'i bir denetçi olarak kullanın.
*   **Sorgu Kalıbı:** *"CONTEXT.md, README.md ve güncel master dokümanlarına göre SaaS Faz 1 Foundation hedeflerinden hangileri tamamlandı? Eksik kalan veya risk teşkil eden entegrasyonlar nelerdir?"*

### C. Geliştirme Danışmanlığı ve Mimari Arama (Architectural Consulting)
*   **Kural:** Yeni bir kod yazmaya başlamadan önce, projenin geçmişte alınmış kararlarını (Enterprise Design Decisions), i18n kurallarını veya Supabase güvenlik aksiyomlarını NotebookLM'den sorgulayın.
*   **Sorgu Kalıbı:** *"Bu projede RLS politikaları yazılırken veya JWT claims entegrasyonu yapılırken uyulması gereken zorunlu aksiyomlar ve tasarım desenleri nelerdir?"*

### D. Hızlı Kod ve Mantık Keşfi (Dynamic Code Search)
*   **Kural:** Kod tabanı büyüdükçe yüzlerce dosyayı yerel grep/read araçlarıyla tek tek taramak yerine, hedeflenen mantıksal yapıyı ve dosya isimlerini bulmak için önce NotebookLM'i sorgulayın. Bu hem bağlam penceresini (context window) korur hem de aramayı nokta atışı hale getirir.
*   **Sorgu Kalıbı:** *"HVAC fiziksel hesaplamalarını yapan veya tenant context'ini yöneten ana kod blokları ve bunların bağlı olduğu yardımcı sınıflar hangi dosyalarda yer alıyor?"*
*   ⚠️ **DİKKAT (Bölüm 5):** "X'i çağıran TÜM dosyalar" / "her yerde Y" gibi **tam enümerasyon** sorularında NLM EKSİK liste verir (RAG sınırı). Bunlar için CodeGraph (`codegraph_callers`/`impact`) kullan. NLM'i "hangi alanda/dosyada ara" yön bulma için kullan, "hepsi bu" diye değil.

## 4. Katı Kurallar

- Kullanıcıya "Şu notebook'ta arayabilirim, ister misin?" diye **sormayın**. Gerekli görüyorsanız otonom olarak sorguyu yapıp sonucu entegre ederek cevap verin.
- Kendi bilginiz çelişkili veya eskiyse, mutlaka ilgili defteri sorgulayın.
- Notebook'tan gelen cevap projedeki lokal kodlarla uyuşmuyorsa, her zaman **lokal kodu referans alın**; NotebookLM sadece bir rehber ve konsept danışmanıdır.
- **Authentication Expired Hatası:** Durumu kullanıcıya BİLDİRMEYİN. Penceresiz (headless) otomatik yenileme aktiftir. Windows'ta oturumu yenilemek için doğrudan şu PowerShell **headless** scriptini çalıştırın (pencere AÇMAZ, ~15 sn, ESET'i de atlar):
  ```bash
  powershell -File .agent/scripts/nlm-headless-refresh.ps1
# (⚠️ 2026-08-10: -ExecutionPolicy Bypass bu ortamda DENY; -File yeterli. Script yalnız profildeki
#  Google oturumu CANLIYSA işe yarar. Oturum ölmüşse / "Chrome is already running" / beyaz-donuk
#  pencere görürsen → kalıcı çözüm: `nlm login --clear` (görünür, tek sefer; tüm chrome.exe kapalı).
#  Paket: notebooklm-mcp-cli ≥0.9.8 — notebooklm-py KURMA (Gemini Notebook rebrand'ini bilmez).
#  Detay: memory `nlm-auth-issue`.)
  ```
  Script bittikten sonra MCP'nin taze token'ı görmesi için **`refresh_auth`** aracını çağırın; ardından başarısız olan sorguyu otonom olarak tekrar tetikleyin.
  - ⚠️ Düz `nlm login` ÇALIŞTIRMAYIN — bu makinede bozuk/yavaş görünür Chrome penceresi açar (ESET SSL gecikmesi → timeout → beyaz ekran). Daima headless scripti kullanın.
  - **Yedek katmanlar:** Plan A = `nlm-headless-refresh.ps1` (varsayılan, penceresiz). Plan B = `nlm-persistent-login.ps1` (kalıcı profilin Google girişi de düşerse; görünür, ESET bankacılık koruması kapalıyken tek seferlik elle giriş — kalıcı profili tazeler, headless tekrar çalışır). Plan C (son çare) = `nlm-clean-login.ps1` (TEMP profil; çalışır ama headless zincirini tazelemez).

## 5. AMPİRİK SINIRLAR (2026-06-11 testi — güç/zayıf haritası)

İkiz, **kod→MD snapshot**'ıdır (kaynak doc'lar `generated_at` damgalı; son derleme **2026-06-08**). Aşağıdaki
sınırlar gerçek sorgularla ölçüldü ve cevaplar CodeGraph/koda karşı doğrulandı. **Ton ≠ doğruluk:** NLM her
zaman kesin/özgüvenli tonda ("Röntgen Disiplini ile taradım, KESİN") cevaplar — ton, tazeliği/tamlığı garanti etmez.

### ✅ GÜVENİLİR (NLM'e sor)
- **Tek-sembol kesin yapısal fact:** fonksiyon imzası, interface alanları + tipleri, parametre/dönüş, davranış.
  (MD'de tam AST + interface dump var → birebir doğru. Test: `logAdminAction` imzası 7/7 alan tam isabet.)
- **Mimari desen / "neden" / aksiyom:** RLS aksiyomları, tasarım kuralları, kanonik pattern, geçmiş kararlar.
- **Niteliksel mükerrerlik / teknik borç:** boilerplate tekrarını AST'ten yakalar, ortak-hook önerir
  (test: `useAdminTable` önerisi isabetli; hatta Flash/agy'den daha dikkatli — kör "kopya" demedi).
- **Doküman envanteri / sayım:** doc'u olan dosyaları sayar (test: 17 admin sayfası doğru listelendi).

### ⚠️ GÜVENME → CodeGraph / kod kazanır
- **TAZELİK / DRIFT (sadece commit'lenmemiş pencere):** İkiz "**son commit kadar taze**"dir — pre-commit hook
  değişen dosyaları MD'ye çevirip NLM'e sync eder. Drift YALNIZCA henüz commit'lenmemiş değişiklikler için olur,
  ve o pencerede NLM tam güvenle eski cevabı verir. Test: "CategoryBuilderView'da canWrite guard YOK" dedi —
  aynı gün eklenmiş ama **commit'lenmemişti** → o pencerede yanlış. Commit sonrası kendini düzeltir.
- **Üretilmiş "Nasıl yapar" anlatısı abartabilir:** companion MD'lerin **yapısal/çıkarılmış** kısmı (interface,
  sabit değerleri, param, tip, imza, AST) birebir doğru; ama LLM'in yazdığı **"Nasıl yapar" düzyazısı** bazen
  var olmayan adım uydurur. Test: `orderStatusService.md`, `updateOrderStatus` için kodda OLMAYAN bir "yetki
  kontrolü" adımı anlattı. → Yapısal fact'e güven; davranışsal/akış iddiasını koddan doğrula.
- **Kodbazı-geneli TAM enümerasyon:** "X'i çağıran TÜM dosyalar / her yerde Y" → **EKSİK** liste (RAG retrieval
  sınırı). Test: `logAdminAction` için "4 dosya" dedi; gerçek snapshot'ta 8+, bugün ~12. → `codegraph_callers`/`impact`.
- **Niceliksel metrik:** mükerrerlik %, complexity skoru → "defterde yok" (dürüstçe söyler, veremez). → `fallow`.
- **Canlı durum / kesin güncel sayı:** git, test sonucu, DB tablo/RLS sayısı → çelişen snapshot'lar olabilir
  (test: 26 vs 30 Edge Function, 26 vs 28 tablo). Sayıyı koddan/DB'den (CodeGraph/Supabase) doğrula.

### ALTIN KURAL
"**İmza / desen / neden / envanter**" → NLM güvenilir. "**Var mı? / kaç tane? / hepsini bul? / şu an?**" →
CodeGraph/kod kazanır. Drift + eksik-enümerasyon NLM'in iki kör noktasıdır. Bu, CLAUDE.md'deki
*"çelişirse kod kazanır"* kuralının ampirik kanıtıdır.
