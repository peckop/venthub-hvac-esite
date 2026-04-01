# 🧠 Brainstorming: P06/011 — Diff-Review Skill (Değişiklik Güvenliği Kontrolü)

## 🚩 Sorun Tanımı
Bir modülde değişiklik yapıldığında, ajanların "yanlışlıkla" sildiği kritik exportlar, gizlice eklenen `any` tipleri veya veritabanı migration'larında unutulan `DROP COLUMN` gibi yıkıcı komutlar, review aşamalarında "gözden kaçabilmektedir". Kodun genel doğruluğunu (`superpowers-review`) analiz etmenin ötesinde, bu tarz spesifik "Tehlikeli Anti-Pattern"lere karşı *statik* ve *robotik* bir duvara (guardrail) ehtiyaç vardır.

## 🛠️ Çözüm Stratejisi (Seçenekler)

**Seçenek 1: Mevcut `superpowers-review` SKILL'ini Prompt Olarak Genişletmek**
- *Artıları:* Ajanın mevcut LLM kapasitesini kullanır. Ekstra script gerektirmez.
- *Eksileri:* LLM'ler büyük diff'lerde "hallucination" yapabilir, `any` tiplerini veya silinen bir export'u gözden kaçırabilir (%100 deterministik değildir).

**Seçenek 2: Yeni bir Python Scripti (Statik Analiz) ile `diff-review` Becerisi Oluşturmak (Önerilen)**
- Git üzerinden `git diff HEAD` (veya staged diff) çıktısını alan bir Python scripti (Örn: `check_diff_rules.py`).
- İçerisinde Regex tabanlı siyah listeler barındırır:
  - `\+.*any` (yeni eklenen any)
  - `\-.*export\s+(const|function|type|interface)\s+` (silinen kritik exportlar)
  - `\+.*DROP\s+(TABLE|COLUMN)` (yıkıcı DB işlemleri)
  - `\+.*console\.log` (çöplük bırakma - linter bunu tutabilir ama çift dikiş olur)
- Bu script sırasıyla `/bitir` workflow'u tetiklendiğinde koşulur. Hata fırlatırsa `/bitir` reddedilir.

## 🏆 Tavsiye Edilen Yaklaşım (Option 2)
Kesin bir "Surgical Threshold" (Cerrahi Eşik) kuralı uyguladığımız için, şansa dayalı bir LLM review'u kabul edilemez.
`diff-review` SKILL'i bağımsız bir Python script'ine yaslanmalı, `SKILL.md` dosyasında bu scriptin nasıl çalıştırılacağı anlatılmalı ve `/bitir` (Finalization) aşamasına `pnpm run lint` gibi zorunlu bir adım olarak eklenmelidir.

## 📌 Kabul Kriterleri (Acceptance)
1. `.agent/skills/diff-review/SKILL.md` dosyası yaratıldı.
2. `check_diff_rules.py` (veya benzeri) bir araç oluşturuldu.
3. Tehlikeli kalıplar (any, DROP, export silme) `git diff` üstünden yakalanıp uyarılıyor.
4. `.agent/workflows/bitir.md` içerisine bu analiz adımı bir engelleyici (Bloklayıcı) olarak yerleştirildi.