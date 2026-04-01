# 📋 Implementation Plan: P06/008 — Registry Engine v6

> **Brainstorm:** `registry/P06/.../008/.../brainstorm.md` — Opsiyon A (Minimal İnvaziv) seçildi
> **Model:** Claude Opus | **Tarih:** 26.03.2026
> **Tahmini Toplam Süre:** ~90 dakika (4 adım × ~20 dk + test)

---

## Hedef
`manage_registry.py`'ye 4 yeni komut ekleyerek registry yönetimini otonom hale getirmek:
1. `progress` — Görev ilerleme yüzdesini güncelle
2. `complete` — Görevi doğrudan mühürle (completed'a taşı)
3. `create-task --description` — Anlamlı içerikle görev oluştur
4. `activate` bağımlılık kontrolü — `depends_on` varsa tamamlanmamış bağımlılıkları uyar

## Varsayımlar
- `manage_registry.py` dosyası şu an 465 satır ve kararlı (stable) durumda
- Mevcut `move_task()` fonksiyonu doğru çalışıyor (üzerine inşa edilebilir)
- `parse_metadata()` frontmatter'dan `depends_on` alanını okuyabilmeli (mevcut parser bunu zaten yapıyor — satır 177-178'de liste parse desteği var)
- Windows üzerinde çalışılıyor (shutil.move retry logic korunmalı)
- Python 3.x, harici bağımlılık yok

## Plan

### Adım 1: `progress` Komutu (En Basit, İzole)
- **Dosyalar:** `registry/manage_registry.py`
- **Değişiklik:**
  - Yeni fonksiyon `update_progress(proj_id, task_id, value)` ekle (~15 satır)
  - Görevin MD dosyasını bul (mevcut `move_task` mantığıyla aynı arama)
  - Frontmatter'da `progress: XX%` satırını regex ile güncelle: `re.sub(r'progress:\s*\d+%?', f'progress: {value}%', content)`
  - `updated_at` alanını da güncelle
  - `normalize_registry()` çağır (PULSE güncellensin)
  - Argparse `choices` listesine `"progress"` ekle
  - Argparse'a üçüncü positional arg (`value`) ekle veya mevcut `task_id` sonrası yeni arg
- **Verify:**
  ```
  python registry/manage_registry.py progress P04 014 25
  # Kontrol: P04/014 MD dosyasındaki progress: 25% olmalı
  grep "progress:" registry/P04-Category-Architecture/active/014-*/014-*.md
  ```

### Adım 2: `complete` Komutu (move_task Wrapper)
- **Dosyalar:** `registry/manage_registry.py`
- **Değişiklik:**
  - Yeni fonksiyon `complete_task(proj_id, task_id)` ekle (~10 satır)
  - Önce `update_progress(proj_id, task_id, 100)` çağır (progress=%100 yap)
  - Sonra `move_task(proj_id, task_id, "completed")` çağır (taşı + status güncelle)
  - Argparse `choices` listesine `"complete"` ekle
- **Verify:**
  ```
  python registry/manage_registry.py complete P99 001
  # Kontrol 1: P99/001 klasörü completed/ altında olmalı
  dir registry\P99-Registry-Test\completed\001-*
  # Kontrol 2: MD'deki progress: 100%, status: "Completed"
  grep "progress:" registry/P99-Registry-Test/completed/001-*/001-*.md
  # Kontrol 3: PULSE.md güncellendi
  grep "P99" registry/PULSE.md
  ```

### Adım 3: `create-task --description` Parametresi
- **Dosyalar:** `registry/manage_registry.py`
- **Değişiklik:**
  - `argparse`'a yeni opsiyonel arg ekle: `--description`, `-d`
  - `create-task` bloğunda (satır 411-461) şablon genişletmesi:
    - `args.description` varsa → "Hedefler" bölümüne açıklamayı yaz
    - `args.description` yoksa → mevcut placeholder davranışı korunsun
  - MD şablonundaki "Görev kapsamını tanımla" → `args.description` ile değiştirilsin
- **Verify:**
  ```
  python registry/manage_registry.py create-task P99 099 -q "Test Görevi" -d "Bu görevin amacı X yapmaktır"
  # Kontrol: MD dosyasında "Bu görevin amacı X yapmaktır" metni olmalı
  type registry\P99-Registry-Test\backlog\099-*\099-*.md
  # Temizlik:
  rmdir /s /q registry\P99-Registry-Test\backlog\099-*
  ```

### Adım 4: `activate` Bağımlılık Kontrolü (En Karmaşık)
- **Dosyalar:** `registry/manage_registry.py`
- **Değişiklik:**
  - `move_task()` fonksiyonunun başına bağımlılık kontrolü ekle (~20 satır)
  - Sadece `target_state == "active"` ise kontrol yap
  - Taşınacak görevin MD'sinden frontmatter'ı oku
  - `depends_on` alanını kontrol et (parse_metadata zaten liste parse ediyor)
  - Her bağımlılık için DB'den `state` sorgula: `SELECT state FROM tasks WHERE id=?`
  - `state != 'completed'` olanlar varsa:
    - Uyarı mesajı yazdır: `"⚠️ BAĞIMLILIK UYARISI: P04/014 henüz tamamlanmadı!"`
    - Taşımayı ENGELLEME — sadece uyar (ajanın kendi kararına bırak)
- **Verify:**
  ```
  # Önce P04/015'in MD'sine depends_on ekle (test için):
  # depends_on: ["014"]
  python registry/manage_registry.py activate P04 015
  # Kontrol: "BAĞIMLILIK UYARISI" mesajı görünmeli (014 henüz completed değil)
  ```

### Adım 5: Regresyon Testi ve Finalize
- **Dosyalar:** Yok (sadece test)
- **Değişiklik:** Yok
- **Verify:**
  ```
  # Mevcut komutların hepsinin çalıştığını doğrula:
  python registry/manage_registry.py normalize
  python registry/manage_registry.py dashboard
  python registry/manage_registry.py recall -l 3
  python registry/manage_registry.py --help
  # Yeni komutların help'te göründüğünü doğrula:
  # choices listesinde: complete, progress
  ```

## Riskler ve Azaltmalar

| Risk | Olasılık | Azaltma |
|------|----------|---------|
| Frontmatter regex bozulması | Düşük | `progress` güncellemesini izole test et, sadece `progress:` satırını hedefle |
| `complete` sırasında dosya kilidi (Windows) | Düşük | Mevcut `safe_write` retry logic'i koruyarak `move_task` kullan |
| Argparse pozisyonel arg çakışması | Orta | `progress` için 3. arg'ı `nargs="?"` ile opsiyonel yap |
| `depends_on` parse hatası | Düşük | `parse_metadata` zaten list parse desteği var (satır 177) |

## Geri Dönüş (Rollback) Planı
```bash
# Tüm değişiklikler tek dosyada (manage_registry.py)
# Herhangi bir sorun olursa:
git checkout -- registry/manage_registry.py
python registry/manage_registry.py normalize
```
Geri dönüş 5 saniye sürer. Risk çok düşük.
