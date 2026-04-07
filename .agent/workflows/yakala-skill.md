---
description: Mevcut oturumdaki tekrarlanabilir bir süreci analiz edip .agent/skills/ altına SKILL.md olarak kaydeder.
---

> **Önerilen Model:** Gemini 3.1 Pro (High) *(Kategori: Medium)*

Bu workflow "Kaptan + Gemi" analojisiyle çalışır: Sen bugün bir şeyi başardın (gemi yola çıktı, limana vardı). Bu workflow o seferi "deniz haritası" olarak kaydeder — bir sonrakinde aynı rotayı kör uçuşsuz yaparsın.

## Ön Koşul
Workflow, mevcut konuşma oturumunda tekrarlanabilir bir sürecin tamamlanmasının ardından çalıştırılır. Kullanıcı `/yakala-skill [açıklama]` veya `bu süreci skill olarak kaydet` dediğinde başla.

---

## Adım 1 — Oturumu Oku ve Süreci Çıkar

Son konuşma geçmişini analiz et ve şu soruları yanıtla:

- **Ne yapıldı?** Hangi tekrarlanabilir süreç tamamlandı?
- **Girdi neydi?** Kullanıcının verdiği parametre veya bağlam neydi?
- **Hangi dosyalara dokunuldu?** allowed_paths listesi oluştur.
- **Kullanıcı seni nerede düzeltti?** Bunlar "kurallara" dönüşecek.
- **Hangi araçlar kullanıldı?** (run_command, view_file, grep_search vb.) → `allowed-tools` listesi.
- **Başarı kriteri ne oldu?** Kapanış anını tespit et.

> ⚠️ Eğer oturumda tekrarlanabilir bir süreç yoksa kullanıcıya söyle ve dur.

---

## Adım 2 — Skill Adı ve Hedef Dizin Belirle

Aşağıdaki kurallarla önerin:

| Kapsam | Hedef |
|---|---|
| Sadece VentHub'a özgü (RLS, migration vb.) | `.agent/skills/<isim>/SKILL.md` |
| Genel proje agnostik süreç | `.agent/skills/<isim>/SKILL.md` (şimdilik hep burası) |

İsim kuralı: `kebab-case`, Türkçe veya İngilizce olabilir, kısa ve açıklayıcı.
Örnekler: `supabase-migration-fixer`, `rls-policy-generator`, `i18n-key-ekle`

Kullanıcıya önerini tek cümleyle sun, onay iste.

---

## Adım 3 — SKILL.md Dosyasını Yaz

Onay alındıktan sonra `.agent/skills/<isim>/SKILL.md` dosyasını şu şablona göre yaz:

```markdown
---
name: <skill-ismi>
description: <tek satır, ne yapar>
when_to_use: >
  Kullan: <hangi durumda tetiklemeli>. Örnekler: '<tetikleyici cümle 1>', '<tetikleyici cümle 2>'.
allowed-tools:
  - <tespit edilen araçlar>
---

# <Skill Başlığı>

<Kısa açıklama — ne zaman neden kullanılır>

## Girdiler
- `$parametre`: Açıklama (yoksa bu bölümü sil)

## Hedef
<Net ve ölçülebilir bir hedef. Örn: "Hatasız migrate.sql çalışıyor, RLS aktif, lint geçiyor.">

## Adımlar

### 1. <Adım Adı>
<Ne yapılacak. Spesifik komutlar dahil.>

**Başarı kriteri:** <Bu adım bitti ve sonrakine geçeceğiz demek için ne görmeliyiz?>

### 2. <Adım Adı>
...

## Kurallar (Kullanıcının Düzeltmelerinden)
- <Kullanıcı seni nerede düzelttiyse buraya yaz>
- <"Şunu YAPMA" veya "Şunu MUTLAKA yap" şeklinde>
```

---

## Adım 4 — Doğrulama

Dosya yazıldıktan sonra:

1. Dosyanın var olduğunu `view_file` ile teyit et.
2. Kullanıcıya şunu söyle:
   - Skill nereye kaydedildi
   - Nasıl tetiklenir (örn: "artık `/rls-policy-generator` diyebilirsiniz")
   - SKILL.md'yi doğrudan düzenleyerek kuralları güncelleyebileceğini hatırlat

---

## Önemli Kısıtlar

- ❌ `registry/` dizinine dokunma — Skill sistemi ayrı, registry ayrı
- ❌ Mevcut bir skill'in adıyla çakışma — önce `.agent/skills/` listesine bak
- ✅ Eğer çakışma varsa kullanıcıya "güncelleme mi yoksa yeni mi?" diye sor
- ✅ Adımlar "kopyala-yapıştır-çalıştır" seviyesinde spesifik olmalı
