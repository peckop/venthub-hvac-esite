# 🧠 Brainstorming: Registry Engine v6 — Complete, Progress & Dependency Guard

> **Skill:** superpowers-brainstorm | **Model:** Claude Opus 4.6 | **Tarih:** 26.03.2026
> **Yöntem:** Skill şablonu (Goal/Constraints/Context/Risks/Options/Recommendation/Acceptance)

---

## Goal
`manage_registry.py` motoruna 4 yeni yetenek ekleyerek ajanların günlük iş akışını hızlandırmak ve registry bütünlüğünü otomatik korumak:
1. `complete` — Görevi doğrudan mühürle (taşı + progress=%100 + status=Completed)
2. `progress` — İlerleme yüzdesini güncelle (`progress P04 014 50`)
3. `activate` bağımlılık kontrolü — `depends_on` listesindeki görevler tamamlanmadıysa uyar
4. `create-task --description` — Boş MD dosyası yerine anlamlı içerik yaz

## Constraints
- **Dosya:** Tek dosya (`registry/manage_registry.py`, 465 satır Python)
- **Uyumluluk:** `normalize`, `create-task`, `activate`, `dashboard`, `remember`, `recall` komutları kesinlikle kırılmamalı
- **Teknoloji:** Pure Python 3.x, harici bağımlılık yok (sadece stdlib + sqlite3)
- **Sentinel Koruması:** Registry dosyalarına doğrudan erişim sadece bu motor üzerinden (kural korunmalı)
- **Frontmatter Format:** YAML frontmatter'daki `progress: XX%` ve `status: "YYY"` formatı mevcut MD parserla uyumlu olmalı
- **Atomik İşlem:** Her komut ya tamamen başarılı olmalı ya da hiç değişiklik yapmamalı
- **Windows Uyumluluğu:** `shutil.move`, `os.replace` Windows'ta çalışmalı (mevcut retry logic korunmalı)

## Known Context

### Mevcut Motor Yapısı (v5.0)
- **Argparse:** Tek seviye `choices` listesi (satır 376): `normalize`, `activate`, `backlog`, `create-task`, `remember`, `recall`, `dashboard`, `init`, `repair`
- **Frontmatter Parser:** `parse_metadata()` (satır 164-192) — Basit regex tabanlı, `---` blokları arasındaki YAML'ı satır satır parse eder. Self-healing özelliği var (eksik başlığı klasör adından üretir).
- **Görev Taşıma:** `move_task()` (satır 331-372) — Dosya sisteminde klasörü taşır, MD'deki status'ü günceller, ardından `normalize_registry()` çalıştırır.
- **DB Şeması:** `tasks` tablosu: `id, title, project_id, state, status, priority, progress, path, hash, updated_at` — `depends_on` kolonu YOK.
- **Normalizasyon:** `normalize_registry()` (satır 293-329) — `progress >= 100` olan görevleri otomatik `completed/` altına taşır.

### Kritik Dosyalar
- `registry/manage_registry.py` — Ana motor (TEK DEĞİŞECEK DOSYA)
- `registry/registry.db` — SQLite veritabanı
- `registry/PULSE.md` — Otomatik üretilen dashboard
- `registry/P**/backlog|active|completed/*/*.md` — Görev dosyaları

## Risks

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Motor kırılması (tüm ajanlar etkilenir) | Orta | Çok Yüksek | Opsiyon A (minimal değişiklik), git ile geri al |
| Frontmatter bozulma (regex hatalı günceller) | Düşük | Yüksek | `progress` güncellemesini `re.sub` ile cerrahi yap |
| `move_task` ↔ `complete` çakışması | Düşük | Orta | `complete` = `move_task` wrapper'ı, ayrı fonksiyon DEĞİL |
| `depends_on` veri kaynağı belirsizliği | Düşük | Düşük | DB şeması değiştirme, frontmatter'dan oku |
| Windows dosya kilidi (shutil.move) | Düşük | Orta | Mevcut retry logic (satır 54-67) zaten çözüyor |

## Options (3)

### Opsiyon A: Mevcut Fonksiyonları Genişlet (Minimal İnvaziv) ⭐
- **Özet:** `complete` = `move_task` wrapper'ı + progress güncelle. `progress` = frontmatter'da regex ile güncelle. `activate` = mevcut fonksiyona bağımlılık guard ekle. `create-task` = `--description` parametresi ile MD şablonuna içerik yaz.
- **Değişiklik:** ~50-60 satır ekleme, 0 satır silme
- **Artılar:**
  - En az değişiklik, en düşük kırılma riski
  - Mevcut `move_task` fonksiyonu test edilmiş ve çalışıyor — üzerine inşa etmek güvenli
  - Her yeni komut bağımsız test edilebilir
- **Eksileri:**
  - `move_task`'a bağımlı kalır, ileride darboğaz olabilir
  - `depends_on` kontrolü dosya tabanlı olduğu için DB query kadar hızlı değil
- **Karmaşıklık:** 3/10 | **Risk:** 2/10

### Opsiyon B: RegistryDB'ye Akıllı Komutlar
- **Özet:** Tüm yeni komutları DB seviyesinde uygula — önce DB güncelle, sonra dosya sistemine yansıt. `depends_on` kolonu DB'ye eklensin.
- **Değişiklik:** ~100-120 satır
- **Artılar:**
  - DB merkezi otorite olur, sorgular hızlanır
  - Bağımlılık kontrolü SQL ile yapılır (`SELECT ... WHERE state='completed'`)
  - Gelecekteki özellikler (gantt chart, dependency graph) için altyapı hazır
- **Eksileri:**
  - DB schema migration gerekir (tasks tablosuna `depends_on TEXT` kolonu)
  - `sync_from_filesystem` mantığıyla çakışma riski
  - Test kapsamı büyür
- **Karmaşıklık:** 6/10 | **Risk:** 5/10

### Opsiyon C: CLI Framework Yenileme (Subcommands + Plugin)
- **Özet:** Argparse'ı `subparsers` yapısına geçir, her komutu ayrı fonksiyon modülünde tanımla.
- **Değişiklik:** ~200+ satır (pratik olarak tüm dosya yeniden yapılandırma)
- **Artılar:**
  - Uzun vadede temiz, genişletilebilir
  - Her komut kendi argümanlarına sahip olur
- **Eksileri:**
  - Mevcut tüm ajan çağrıları kırılır (regex/parse tabanlı çağıranlar)
  - Görevin kapsamını çok aşar
  - Kazanç/risk oranı düşük
- **Karmaşıklık:** 9/10 | **Risk:** 8/10

## Recommendation

**Opsiyon A (Minimal İnvaziv)** — Nedenleri:

1. **En az satır değişikliği** (~50 satır) ile 4 yeni özellik kazanılır
2. **Mevcut `move_task` fonksiyonu** zaten çalışıyor ve Windows uyumlu — üzerine inşa etmek güvenli
3. **`depends_on` kontrolü** dosya tabanlı yapılabilir — DB şeması DEĞİŞTİRİLMESİNE GEREK YOK (frontmatter'dan oku, DB'deki `state` kolonuyla karşılaştır)
4. **Geri dönülebilir** — bir şey kırılırsa sadece argparse satırlarını geri al
5. Opsiyon B'nin avantajları (DB-first) gelecekte P06/012+ gibi bir görevle ele alınabilir

### Uygulama Sırası
1. `progress` komutu (en basit, regex ile frontmatter güncelle)
2. `complete` komutu (move_task wrapper + progress=100)
3. `create-task --description` (şablon genişletme)
4. `activate` bağımlılık kontrolü (en karmaşık, frontmatter parse + DB sorgu)

## Acceptance Criteria
- [ ] `python registry/manage_registry.py complete P99 001` → görev `completed/` altına taşınır, progress=%100, status="Completed"
- [ ] `python registry/manage_registry.py progress P04 014 50` → frontmatter'da `progress: 50%` olur, PULSE güncellenir
- [ ] `python registry/manage_registry.py activate P04 015` → `depends_on: ["014"]` varsa ve 014 completed değilse uyarı verir
- [ ] `python registry/manage_registry.py create-task P06 012 -q "Test" --description "Bu görev X yapar"` → MD'de anlamlı hedef ve alt görevler
- [ ] Mevcut komutlar (`normalize`, `dashboard`, `remember`, `recall`) regresyon olmadan çalışıyor
- [ ] `python registry/manage_registry.py --help` → yeni komutlar (complete, progress) listeleniyor
- [ ] Windows'ta `shutil.move` hatasız çalışıyor (mevcut retry logic korunuyor)