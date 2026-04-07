---
name: takim-rolleri
description: Paralel ajan orkestrasyon rolleri. Her rol, hangi skill'i kullandığını ve hangi göreve çıkacağını tanımlar.
when_to_use: >
  Kullan: superpowers-execute-plan-parallel workflow'u ile çoklu ajan çalıştırılacaksa.
  Orkestratör ajan, görevi analiz edip uygun rolü seçer ve spawn_subagent.py ile fırlatır.
allowed-tools:
  - view_file
  - grep_search
  - write_to_file
  - multi_replace_file_content
---

# VentHub Takım Rolleri (Ajan Orkestra Haritası)

## Önemli Not — Model Seçimi Bizde Değil
spawn_subagent.py her ajana `gemini --yolo` ile izole oturum açar.
Hangi modelin (Pro/Flash) görevi alacağı Gemini CLI tarafından belirlenir.
Bizim kontrolümüzde olan şey: SKILL kalitesi ve TASK açıklamasının netliği.
**Kural:** "Kim gelirse gelsin doğru yapabilsin" diye yaz.

---

## ROL HARİTASI

### 🔵 ROL: denetci
**Skill:** `paralel-review`
**Ne zaman fırlatılır:** Commit öncesi, kod tamamlandıktan sonra
**Görevi:** Sadece değişen dosyaları incele — tip, güvenlik, performans
**Çıktı:** `artifacts/superpowers/subagents/<id>.log` içinde bulgular listesi

Kullanım:
```powershell
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py \
  --skill paralel-review \
  --task "Şu dosyaları incele: <dosya listesi>. Tip hataları, unused import ve any kullanımı ara."
```

---

### 🟡 ROL: guvenlik-nobet
**Skill:** `supabase-security`
**Ne zaman fırlatılır:** Supabase tablosu/politika değiştiğinde veya migration yazılacağında
**Görevi:** RLS eksikliği, auth.uid() sarmalaması, SELECT * bulguları
**Çıktı:** Log dosyasında güvenlik raporu

Kullanım:
```powershell
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py \
  --skill supabase-security \
  --task "Şu migration/tablo değişikliğini RLS, auth ve sorgu güvenliği açısından denetle: <içerik>"
```

---

### 🟢 ROL: test-yazari
**Skill:** `superpowers-tdd`
**Ne zaman fırlatılır:** Yeni fonksiyon/component eklendiğinde, test coverage arttırılacaksa
**Görevi:** Verilen kod için Vitest/Playwright testi yaz, red-green-refactor döngüsü uygula
**Çıktı:** Test dosyası `<hedef>.test.ts` veya `<hedef>.spec.ts`

Kullanım:
```powershell
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py \
  --skill superpowers-tdd \
  --task "Şu fonksiyon için unit test yaz: <fonksiyon kodu>. Dosyayı <yol>.test.ts olarak kaydet."
```

---

### 🔴 ROL: mimar
**Skill:** `superpowers-plan`
**Ne zaman fırlatılır:** Yeni özellik tasarlanacaksa, mimari karar verilecekse
**Görevi:** Brainstorm → Plan → Acceptance Criteria üret. KOD YAZMA.
**Çıktı:** `artifacts/superpowers/plan.md`

Kullanım:
```powershell
python .agent/skills/superpowers-workflow/scripts/spawn_subagent.py \
  --skill superpowers-plan \
  --task "Şu özellik için plan yaz: <özellik açıklaması>. Plan'ı artifacts/superpowers/plan.md'ye kaydet."
```

---

## ORKESTRASYON PAKETLERİ (Hazır Formüller)

### Paket A — "Commit Öncesi Güvenlik Kalkanı" (2 Ajan)
```
Ajanlar:
  1. denetci    → Tip + kod kalitesi
  2. guvenlik-nobet → RLS + Supabase güvenliği

Ne zaman: Her commit öncesi, özellikle DB dokunulduysa
Beklenen süre: ~3-5 dk paralel (sıralı 8-10dk yerine)
```

### Paket B — "Özellik Tamamlama" (3 Ajan)
```
Ajanlar:
  1. denetci       → Kod kalitesi
  2. test-yazari   → Test coverage
  3. guvenlik-nobet → Güvenlik

Ne zaman: Yeni bir özellik tamamlandığında, merge öncesi
Beklenen süre: ~5-8 dk paralel
```

### Paket C — "Büyük Analiz" (4 Ajan)  
```
Ajanlar:
  1. mimar         → Plan doğrulama
  2. denetci       → Kod kalitesi
  3. test-yazari   → Test coverage
  4. guvenlik-nobet → Güvenlik

Ne zaman: Sprint sonu, büyük refactor, production öncesi
Not: 4 paralel ajan = 4 ayrı gemini --yolo oturumu
```

---

## ÇIKTI TOPLAMA

Tüm ajanlar bitince logları şuradan oku:
```
artifacts/superpowers/subagents/
  ├── paralel-review-YYYYMMDD-HHMMSS-<id>.log
  ├── supabase-security-YYYYMMDD-HHMMSS-<id>.log
  └── ...
```

Her log'un sonunda `---SUBAGENT-RESULT-START---` bloku var — sadece onu oku.
