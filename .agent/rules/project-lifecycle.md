# VentHub HVAC Proje Yaşam Döngüsü Ajan Protokolü (Project Lifecycle Agent Protocol)

Bu kılavuz, VentHub HVAC SaaS projesinin başından sonuna kadar (fikirden teslime) yönetimi, denetimi ve güvenlik kontrolü için 5 farklı ajan reposundan (ECC, claude-code-templates, mattpocock/skills, awesome-skills, superpowers) derlenmiş uçtan uca **otonom iş akışını** tanımlar.

---

## 🛫 Uçtan Uca 4 Aşama Protokolü

```
[ AŞAMA 1: BAŞLANGIÇ ] ──► [ AŞAMA 2: GELİŞTİRME ] ──► [ AŞAMA 3: DENETİM ] ──► [ AŞAMA 4: KAPANIŞ ]
  - /grill-me                 - Git Worktree              - /rls-audit             - /compact
  - /to-prd                   - /tdd                      - /review                - /handoff
  - /to-issues
```

---

## AŞAMA 1: Keşif, Planlama & Görev Bölümü (Initiation & Planning)

Yeni bir özellik veya milestone'a başlarken, Kaptan'ın (kullanıcı) fikirlerini teknik gereksinimlere dökmek için şu iş akışı izlenir:

### 1. Tasarım Sorgulama (`/grill-me`)
*   **Kaynak Repo:** `mattpocock/skills` (`skills/productivity/grill-me/SKILL.md`)
*   **İşlevi:** Ajan, Kaptan'ı tasarım kararları, veritabanı gereksinimleri ve iş kuralları hakkında tek tek ve basit sorularla sorgular (relentless interviewing). Ajan, Kaptan'ın fikirlerindeki eksik noktaları ve bağımlılıkları açığa çıkarana kadar kod yazmaz.
*   **Tetikleyici:** Kullanıcı yeni bir fikir sunduğunda otonom tetiklenir veya kullanıcı `/grill-me` yazar.

### 2. Gereksinim Belgesi Üretimi (`/to-prd`)
*   **Kaynak Repo:** `mattpocock/skills`
*   **İşlevi:** Sorgulama bittikten sonra ajan, konuşulan tüm iş kurallarını teknik olmayan, sade bir Türkçe Ürün Gereksinim Belgesine (PRD) dönüştürür ve `artifacts/superpowers/prd.md` olarak kaydeder.
*   **Tetikleyici:** `/to-prd`

### 3. Görevleri Parçalama (`/to-issues`)
*   **Kaynak Repo:** `mattpocock/skills`
*   **İşlevi:** PRD belgesini dikey, küçük ve doğrulanabilir görev dilimlerine (tasks) bölerek `task.md` dosyasına checklist olarak yazar.
*   **Tetikleyici:** `/to-issues`

---

## AŞAMA 2: İzole Geliştirme & Test (Implementation & TDD)

Kod yazma aşamasında kod kalitesini korumak ve ana projeyi bozmamak için şu kurallar işletilir:

### 1. Çalışma Alanı İzolasyonu (`git-worktrees`)
*   **Kaynak Repo:** `obra/superpowers`
*   **İşlevi:** Ana ajan, her alt görevi çalıştırmak için `invoke_subagent` çağrısında `Workspace: "share"` veya `Workspace: "branch"` kullanarak izole git worktree'leri açar. Böylece geliştirmeler ana dizini kirletmeden yan dalda yapılır.

### 2. Test Güdümlü Geliştirme (`/tdd`)
*   **Kaynak Repo:** `obra/superpowers` & `affaan-m/ECC` (`skills/tdd-workflow/SKILL.md`)
*   **İşlevi:** Kod yazılmadan önce test dosyaları oluşturulur (Red). Ardından testleri geçecek en minimal kod yazılır (Green). Son olarak kod, tasarım token'larına ve standartlara göre temizlenir (Refactor).
*   **Tetikleyici:** Geliştirme ajanları işe başlarken otomatik tetiklenir veya `/tdd` yazılır.

---

## AŞAMA 3: Güvenlik, RLS & Kod Denetimi (Auditing & Code Review)

Yazılan kodların VentHub mimarisine, kiracı sızdırmazlığına ve tasarım kurallarına uygunluğu teslimden önce denetlenir:

### 1. Veritabanı ve RLS Denetimi (`/rls-audit`)
*   **Kaynak Repo:** `davila7/claude-code-templates` & `supabase-security`
*   **İşlevi:** `rls_security_auditor` subagent'ı devreye girer. Yazılan SQL sorgularını ve migration dosyalarını "Golden Triad" kuralına göre denetler. `is_admin_user()` recursion'larını, Storage bucket UUID izolasyonlarını doğrular ve `supabase db advisors` veya MCP denetim raporunu çıkarır.
*   **Tetikleyici:** `/rls-audit` veya migration dosyası değiştiğinde.

### 2. Kod ve Tasarım Gözden Geçirme (`/review`)
*   **Kaynak Repo:** `obra/superpowers` & `sickn33/antigravity-awesome-skills` (`security-auditor`)
*   **İşlevi:** `performance_token_architect` ve `r3f_3d_rendering_expert` subagent'ları yazılan kodun diff'ini inceleyerek; arbitrary tailwind değerlerini, focus-visible uyumluluğunu, Three.js shadows="percentage" ayarlarını denetler ve UAT doğrulama komutlarını çalıştırır.
*   **Tetikleyici:** `/review` veya `task.md` tamamlandığında.

---

## AŞAMA 4: Bellek Yönetimi, Yeni Sohbet & Oturum Kapatma (Handoff & Closure)

Uzun konuşmalarda bellek dolduğunda veya iş tamamlandığında uygulanan adımlar:

### 1. Bellek Dolduğunda Yeni Sohbet & Durum Devri (Handoff)
*   **İşlevi:** Sohbet geçmişi uzadığında ve bağlam penceresi dolduğunda; ajan mevcut durumu, aktif değişkenleri ve sıradaki adımları `artifacts/superpowers/status.md` dosyasına kaydeder. Kaptan'dan yeni bir temiz sohbet başlatmasını rica eder. Ajan yeni sohbette bu dosyayı okuyarak kaldığı yerden devam eder.
*   **Tetikleyici:** Bellek dolduğunda otonom olarak veya manuel olarak `status.md` yazılarak yeni sohbete geçilir.

### 2. Oturum Kapatma ve Nihai Devir (`/handoff`)
*   **Kaynak Repo:** `mattpocock/skills`
*   **İşlevi:** Görev tamamen bittiğinde yapılan işleri, UAT test sonuçlarını ve bir sonraki adıma dair notları içeren çok kısa ve yoğunlaştırılmış bir `handoff.md` dosyası oluşturur. Konuşmayı kapatır ve projeyi Kaptan'a teslim eder.
*   **Tetikleyici:** `/handoff` veya iş tamamlandığında.
