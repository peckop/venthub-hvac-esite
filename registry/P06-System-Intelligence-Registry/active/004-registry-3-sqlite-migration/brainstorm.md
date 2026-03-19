# Brainstorm: 004-registry-3-sqlite-migration

## 🧠 Mimari Vizyon: "Yıkılmaz Registry"
Sistemin dosya tabanlı (JSON) yapısını, işlem güvenliği (Transaction) sağlayan SQLite tabanlı bir "Otonom Beyin"e dönüştürmek.

### 🏛️ 1. SQLite Şema Tasarımı
Veritabanı (`registry.db`) içinde şu tablolar yer alacak:

- **`projects`**: Proje bazlı hiyerarşi (P00, P04, P06 vb.)
  - `id` (PK, TEXT), `name` (TEXT), `description` (TEXT), `status` (TEXT)
- **`tasks`**: Tüm görevlerin merkezi deposu
  - `id` (PK, TEXT), `title` (TEXT), `project_id` (FK), `state` (TEXT: backlog|active|completed), `status` (TEXT: TODO|Planning|Executing|Review), `priority` (TEXT), `progress` (INTEGER), `path` (TEXT), `depends_on` (TEXT/JSON), `updated_at` (DATETIME)
- **`task_artifacts`**: Skillerin (superpowers) ürettiği çıktıların (Brainstorm/Plan/Review) özeti/hash değeri.
- **`audit_log`**: Tüm durum değişikliklerinin (move/activate) tarihçesi.

### 🛡️ 2. Veri Güvenliği ve "Güme Gitme" Koruması
Terminal çökmesine ve veri kaybına karşı 3 katmanlı koruma:
1. **Pre-Flight Backup:** Her kritik SQL işleminden önce `registry.db` dosyasının `.bak` kopyası oluşturulur.
2. **Git Snapshot Entegrasyonu:** `manage_registry.py` içine yerel bir `git commit` tetikleyici eklenir. Önemli bir statü değişiminde sistem otonom olarak "Auto-Save" commiti atar.
3. **Atomic Transactions:** SQLite'ın `BEGIN TRANSACTION` ve `COMMIT` özellikleri kullanılarak, bir dosya yazımı yarıda kalırsa verinin "bozulması" (corruption) engellenir.

### 🧩 3. "Sıfır Lint Hatası" Stratejisi
Registry 3.0 kodları (`manage_registry.py`'nin yeni hali) yazılırken:
- `pyre` ve `lint` kurallarına tam uyumlu, tip güvenli (strict typing) kodlama yapılacak.
- `supabase.ts` gibi kritik dosyalardaki `any` kalıntıları temizlenerek CI/CD yeşil ışığa hazırlanacak.

### 🕸️ 4. Otonom Yetenek (Skills) Entegrasyonu
- SQLite içinde skillerin onay durumunu (IsPlanned, IsBrainstormed) tutan flagler olacak.
- "Ready-to-Activate" kontrolü veritabanı seviyesinde yapılacak.
