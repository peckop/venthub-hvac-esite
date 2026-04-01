# VentHub Kayıt ve Görev Protokolü (v8 — Linear + JSON Schema)

Bu protokol, projenin "Hafızası" (Registry) ve Görev Yönetimi (Linear) arasındaki senkronizasyonu tanımlar. V8 mimarisi ile kırılgan Regex parsing bırakılmış, endüstri standardı olan **JSON Schema (Draft 2020-12)** doğrulamasına geçilmiştir.

## 1. Proje Yönetimi: Linear Entegrasyonu
- Tüm görevler otonom olarak **Linear** üzerinde de senkronize edilebilir.
- Ajanlar, görev durumunu ilerletirken `mcp_linear_...` araçlarını kullanarak bulutla projeyi bağlar.

## 2. 🛡️ Dörtlü Mühür Sistemi (The Quadruple Seal)
Bir görev kodu mühürlenip (Completed) kapanmadan önce şu 4 istasyondan geçmelidir (Hızlı işler hariç, test ve tsc zorunluluğu sabittir):
1. **Statik Mühür (Lint):** `pnpm run lint` komutuyla 0 hata doğrulanmalı.
2. **Mantıksal Mühür (TSC):** `pnpm exec tsc -b tsconfig.build.json` ile tip güvenliği kanıtlanmalı.
3. **Üretim Mührü (Build):** `pnpm run build` komutu üretim ortamında hatasız çalışmalı.
4. **Hafıza Mührü (JSON Validation):** Artifact dosyaları güncellenip `engine.py` ile validasyondan (%100) geçmeli.

## 3. Kalite Kapıları: Brainstorm → Plan → Review

### Brainstorm (`brainstorm.json`)
- Araştırma yap → JSON çıktısı üret → `registry/schemas/brainstorm.schema.json` ile doğrula.
- Zorunlu alanlar: `goal`, `constraints`, `risks`, `options`, `recommendation`, `traces`

### Plan (`plan.json`)
- Brainstorm kararlarını oku → Adımlı plan yaz → `registry/schemas/plan.schema.json` ile doğrula.
- Zorunlu alanlar: `objective`, `assumptions`, `steps` (her birinde `verify`), `risks`, `rollback`
- **⏸️ ONAY NOKTASI:** Mutlaka kullanıcıya onaya sunulur. Execute moduna sonra geçilir.

### Review (`review.json`)
- Kodu denetle → JSON rapor üret → `registry/schemas/review.schema.json` ile doğrula.
- Zorunlu alanlar: `blockers`, `majors`, `minors`, `nits`, `summary`, `verdict`

## 4. Trivial Fast-Track (İnce İşler Modülü) - YENİ
Yalnızca `typo`, linter hatası, import düzeltmeleri veya ufak bug-fix gerektiren durumlarda karmaşık çapraz denetimi (Cross-validation) devre dışı bırakan özel bir by-pass akışı izlenir.

**CLI Komutu:**
```bash
python registry/engine.py create-task <PROJE> <ID> <BAŞLIK> --trivial
```
Çıktı olarak sadece `trivial.json` üretilir.
Otonom geçerlilik kuralı: `trivial.json` içinde `verification_commands` (ör: `tsc` ve `lint`) denenmiş ve tamamı `all_passed: true` olmuş olmalıdır.

> [!CAUTION]  
> "NO-PLAN-NO-CODE" kuralı sadece Trivial görevlerde esnetilmiştir. Eğer yeni bir modül açılacaksa 6 adımlı tam JSON döngüsü zorunludur.

## 5. Doğrulama Komutları (Engine V8)
```bash
# JSON doğrulama
python registry/engine.py validate <dosya.json>

# Tüm görevi çapraz sorgulama (Trivial ise sadece tek json)
python registry/engine.py cross-validate registry/PXX-Proje/YYY-gorev

# Pipeline ve sonraki adımı görme
python registry/engine.py pipeline status registry/PXX-Proje/YYY-gorev

# Finalize ve Kapatma
python registry/engine.py finalize-task registry/PXX-Proje/YYY-gorev
```

## 6. Eski Sistem (Legacy V7)
`manage_registry.py` (v7 Sentinel Guard) dosyaları `registry/_legacy/` altında tutulmaktadır. Artık işlem yapılmamaktadır.
