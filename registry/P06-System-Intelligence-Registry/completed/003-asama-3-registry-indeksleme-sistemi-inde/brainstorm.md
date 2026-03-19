# Brainstorm: 003-registry-indexing-system

## 🎯 Goal
Registry sistemindeki yüzlerce Markdown dosyasını (backlog, active, completed) her seferinde yeniden okumak yerine, tek bir `index.json` dosyası üzerinden anlık arama ve metadata erişimi sağlamak.

## 🛡️ Constraints & Risks
- **Veri Bütünlüğü:** İndeks dosyası (`index.json`) ile gerçek `.md` dosyaları arasında senkronizasyon bozulmamalıdır.
- **Performans:** İndeksleme işlemi (re-index) çok uzun sürmemeli (yüzlerce dosya için < 1sn).
- **Format:** İndeks yapısı hem insanlar tarafından okunabilir hem de LLM'ler (Gemini) tarafından kolayca parse edilebilir olmalıdır.
- **Yol Bağımlılığı:** Görevler taşındığında (move/activate) indeks anında güncellenmelidir.

## 💡 Options & Recommendation
- **Option A (In-memory):** Her seferinde tüm dosyaları RAM'e oku. (Yavaş, ölçeklenemez).
- **Option B (SQLite):** Yerel bir veritabanı kullan. (Aşırı karmaşık, `git` ile yönetimi zor).
- **Option C (JSON Index - Önerilen):** `registry/index.json` adında merkezi bir dosya tut. `manage_registry.py` her çalıştığında veya kritik aksiyonlarda bu dosyayı sessizce güncellesin.

### İndeks Yapısı (Taslak):
```json
{
  "tasks": {
    "001": {
      "id": "001",
      "title": "Automated Changelog",
      "path": "registry/P06-System-Intelligence-Registry/completed/001-automated-changelog",
      "status": "Completed",
      "keywords": ["changelog", "generator", "automation"]
    }
  },
  "content_hash": {
    "001": "md5-a1b2c3d4"
  }
}
```

## ✅ Acceptance Criteria
- [ ] `python manage_registry.py search keyword` komutu, sadece dosya adında değil, dosya içeriğinde (brainstorm/plan) de arama yapabilmeli.
- [ ] `index.json` dosyası `git status` içinde görünmeli (projenin bir parçası olarak).
- [ ] İndeksleme işlemi sırasında eksik veya protokol dışı dosyalar için rapor sunulmalı.
