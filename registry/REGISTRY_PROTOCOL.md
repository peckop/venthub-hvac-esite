# Q-Validator Kayıt ve Görev Protokolü (v8 — Linear + JSON Schema)

Bu protokol, projenin görev yönetimi (Linear) ve kalite kapıları (JSON Schema) arasındaki senkronizasyonu tanımlar.

## 1. Proje Yönetimi: Linear
- Tüm görevler **Linear** üzerinde takip edilir.
- Proje: `Q-Validator` | Label'lar: `P01-Data`, `P02-Constraint`, `P03-API`, `P04-Research`
- Statü akışı: `Backlog → Todo → In Progress → In Review → Done`
- Ajan, görev oluştururken `mcp_linear_save_issue()`, durum güncellerken `mcp_linear_save_issue(id=..., state=...)` kullanır.

## 2. Kalite Kapıları: Brainstorm → Plan → Review

### Brainstorm (`brainstorm.json`)
- Araştırma yap → JSON çıktısı üret → `registry/schemas/brainstorm.schema.json` ile doğrula.
- Zorunlu alanlar: `goal`, `constraints`, `risks`, `options`, `recommendation`, `traces`
- **Otonom geçiş:** Brainstorm bittikten sonra otomatik olarak Plan adımına geç.

### Plan (`plan.json`)
- Brainstorm kararlarını oku → Adımlı plan yaz → `registry/schemas/plan.schema.json` ile doğrula.
- Zorunlu alanlar: `objective`, `assumptions`, `steps` (her birinde `verify`), `risks`, `rollback`
- **⏸️ ONAY NOKTASI:** Kullanıcıya sor. Onay gelince Execute'a geç.

### Review (`review.json`)
- Kodu denetle → JSON rapor üret → `registry/schemas/review.schema.json` ile doğrula.
- Zorunlu alanlar: `blockers`, `majors`, `minors`, `nits`, `summary`, `verdict`
- Anti-Hallucination: ORM alanları gerçek şemayla doğrulanmalı.
- `verdict: "approved"` → Linear "Done". `verdict: "needs_changes"` → Düzelt, tekrarla.

## 3. Doğrulama Komutu
```bash
python registry/engine.py validate <dosya.json>
```
Deterministik. Regex yok. JSON Schema Draft 2020-12 standardı.

## 4. Otonom Akış (Kullanıcı Sadece 1 Yerde Onay Verir)
```
Görev al → Linear issue oluştur → brainstorm.json yaz → plan.json yaz
→ ⏸️ KULLANICIYA SOR → Kodu yaz → review.json yaz → Linear "Done"
```

## 5. Trivial Fast-Track (Ufak Değişiklikler)
Yalnızca `typo` veya minör iyileştirmeler içeriyorsa karmaşık çapraz denetimi (Cross-validation) devre dışı bırakan özel bir by-pass akışı izlenir. Test ve Lint (Sentinel Guard) bu aşamada **aynı katılıkla** geçerlidir ancak 5 JSON yerine sadece 1 JSON üretilir.
CLI Komutu:
```bash
python registry/engine.py create-task <PROJE> <ID> <BAŞLIK> --trivial
```
Çıktı: `trivial.json`
Otonom geçerlilik kuralı: `trivial.json` içinde `verification_commands` blockları denenmiş ve `all_passed: true` olmuş olmalıdır.

## 6. Lokal Dosya Yapısı
Artifact dosyaları görev klasörlerinde saklanır (git takibi için):
```
registry/PXX-ProjeAdı/
  └── YYY-gorev-adi/
      ├── brainstorm.json
      ├── plan.json
      └── review.json
      (veya sadece trivial.json)
```

## 6. Eski Sistem
`manage_registry.py` (v7 Sentinel Guard) `registry/_legacy/` altında arşivlenmiştir.
