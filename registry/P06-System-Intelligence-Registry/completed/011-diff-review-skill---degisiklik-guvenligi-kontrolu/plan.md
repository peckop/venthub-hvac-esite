# 📋 Implementation Plan: P06/011 — Diff-Review Skill (Değişiklik Güvenliği Kontrolü)

> **Brainstorm:** `registry/P06-System-Intelligence-Registry/active/011-diff-review-skill---degisiklik-guvenligi-kontrolu/brainstorm.md`
> **Model:** Gemini 3.1 Pro (Low) | **Tarih:** 26.03.2026
> **Tahmini Toplam Süre:** ~45 dakika (4 adım × ~10 dk + test)

## Hedef
Hatalı, "Mühendislik Suçu" sayılacak kalıpların (örn: Type-casting için `any` kullanımı, DB `DROP` komutu, ortak `export` silinmesi) koda sızmasını önlemek. LLM tabanlı bir "review" her zaman kararsız (hallucinate) çalışabildiği için, otonom sürece entegre statik, Regex destekli Python scriptini bir "Duvar (Guard)" olarak kurgulamak.

## Varsayımlar
- Sistemde Git yüklü ve çalışır haldedir.
- `/bitir` workflow'u her commit/PR atılmadan önce çağrılmaktadır.
- Projede Python 3 kuruludur (Zaten registry engine bunu kullanıyor).

## Plan

1. **`diff-review/scripts/check_diff_rules.py` Oluşturulması**
   - **Dosyalar:** `.agent/skills/diff-review/scripts/check_diff_rules.py` (Yeni Klasör ve Dosya)
   - **Değişiklik:** `git diff HEAD` (Hem staged hem de dirty dosyalar) komutu çalıştıran ve diff çıktılarını listeleyen bir script.
   - Eğer `+.*: any` (veya `as any`), `+.*DROP TABLE`, `+.*DROP COLUMN`, `-export ` gibi yasaklı kalıpları regex olarak yakalarsa Exit Code `1` (Fatal Error) fırlatır.
   - **Doğrulama:** Boş bir dosyada `any` yazıp manuel script'i çalıştırarak hata almayı izle.

2. **`.agent/skills/diff-review/SKILL.md` Oluşturulması**
   - **Dosyalar:** `.agent/skills/diff-review/SKILL.md`
   - **Değişiklik:** Ajanın bu scripti kendi kodlarını değerlendirmek veya "güvenli değişiklik" emri aldığında nasıl çağıracağını anlatan kılavuz.
   - **Doğrulama:** `type .agent/skills/diff-review/SKILL.md`

3. **`/bitir` Workflow Entegrasyonu**
   - **Dosyalar:** `.agent/workflows/bitir.md`
   - **Değişiklik:** Kalite denetiminden geçirilen adımların başına (örn: Lint'ten önce veya sonra) `1.5` no'lu adım olarak "Diff Güvenliği Duvarı: `python .agent/skills/diff-review/scripts/check_diff_rules.py` komutunu koş ve 0 hatadan emin ol" eklenmeli.
   - **Doğrulama:** Dosya `grep` veya `view_file` ile incelenip adım numarasının uyuştuğu doğrulanır.

4. **Task (011) Progress ve Kapanış**
   - **Dosyalar:** `registry/manage_registry.py` üzerinden 011 update edilir.
   - **Değişiklik:** Görev tamamlandıktan sonra `manage_registry.py complete P06 011` diyerek işlem arşivlenir.

## Riskler ve Azaltmalar
- **Risk:** Kullanıcı arayüzünde çok meşru bir `export` silme ihtiyacı olursa script bunu hep bloke edebilir.
- **Azaltma:** Script, bir flag (`--force` veya `// diff-ignore` comment flagi) kullanarak bu tür istisnaları teğet geçebilmelidir.

## Geri Dönüş (Rollback) Planı
Eğer Git diff parse mantığı çökerse, `/bitir.md` içinden adım çıkarılır ve eski versiyonlara dönülür.