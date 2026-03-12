---
description: Superpowers plan kapısı. Dosyalar ve doğrulama adımlarıyla birlikte küçük adımlardan oluşan bir plan yazar. Kodlamadan önce onay istemelidir.
---

# Superpowers Plan Yaz (Kapı)

## Görev
Bu görev için plan (kullanıcı tarafından sağlandığı şekliyle):
**{{input}}**

Eğer `{{input}}` boş veya eksikse, kullanıcıdan görevi tek bir cümleyle yeniden belirtmesini iste ve DUR.

## Kurallar
- Kod düzenleme YAPMA.
- Bağlamı anlamak için dosyaları okuyabilirsin, ancak planı oluşturduktan sonra durmalısın.
- Plan adımları küçük olmalı (her biri 2–10 dakika) ve doğrulama komutlarını içermelidir.

## Çıktı formatı (tam olarak kullanın)
## Hedef
## Varsayımlar
## Plan
(Her adım şunları içermelidir: Dosyalar, Değişiklik, Doğrulama)
## Riskler ve Azaltmalar
## Geri Dönüş (Rollback) Planı

## Kaydet (Zorunlu)
Plan çıktısını şuraya yaz:
- `artifacts/superpowers/plan.md`

Gerekirse klasörü oluştur.
Yazdıktan sonra `artifacts/superpowers/` dizini listeleyerek varlığını doğrula.

## Onay
Sor:
**Bu planı onaylıyor musunuz? Her şey yolunda görünüyorsa ONAYLANDI (APPROVED) yazarak yanıtlayın.**

Eğer kullanıcı ONAYLANDI (APPROVED) yanıtını verirse:
- Henüz uygulamaya GEÇME.
- Şöyle yanıtla: **"Plan onaylandı. Uygulamayı başlatmak için `/superpowers-execute-plan` komutunu çalıştırın."**

## Kaydet (Zorunlu)
Yukarıdaki plan içeriğini oluşturda sonra, onu diske yazmalısın:

1) Tam plan markdown çıktısını kopyala.
2) Çalıştır:

```bash
python .agent/skills/superpowers-workflow/scripts/write_artifact.py --path artifacts/superpowers/plan.md
```

Plan markdown'ını komutun stdin'ine sağla.

Yazdıktan sonra `artifacts/superpowers/` dizini listeleyerek varlığını doğrula.

Komutu çalıştıramıyorsan, bunu açıkça belirt ve kullanıcıya plan çıktısını manuel olarak `artifacts/superpowers/plan.md` dosyasına kopyalayıp yapıştırması için talimat ver.
Bu iş akışında kod değişikliği yapma. Kaydettikten sonra dur.
