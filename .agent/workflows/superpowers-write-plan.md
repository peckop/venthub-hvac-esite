---
description: Superpowers plan kapısı. Dosyalar ve doğrulama adımlarıyla birlikte küçük adımlardan oluşan bir plan yazar. Kodlamadan önce onay istemelidir.
---

> **Önerilen Model:** Gemini 3.1 Pro (Low) *(Kategori: Low)*


# Superpowers Plan Yaz (Kapı)

## 🕹️ Adım 0: MISSION CONTROL (Model Dispatcher)
Planlamaya SAKIN BAŞLAMA! Önce `.agent/skills/model-dispatcher/SKILL.md` kurallarını oku.
Görevin karmaşıklığını ve senin mevcut modelini (Flash/High/Sonnet) karşılaştırarak ekrana **ZORUNLU olarak [MISSION CONTROL]** panosunu bas.
Eğer mevcut modelin bu planı yazmak için "Zayıf" ise dur ve kullanıcıdan onay/model değişikliği talep et. Sadece "Model Yeterli" veya "Onaylandı" durumunda aşağıdaki adıma geç.

## Görev
Bu görev için plan (kullanıcı tarafından sağlandığı şekliyle):
**{{input}}**

Eğer `{{input}}` boş veya eksikse, kullanıcıdan görevi tek bir cümleyle yeniden belirtmesini iste ve DUR.

## Kurallar
- Kod düzenleme YAPMA.
- Bağlamı anlamak için dosyaları okuyabilirsin, ancak planı oluşturduktan sonra durmalısın.
- Plan adımları küçük olmalı (her biri 2–10 dakika) ve doğrulama komutlarını içermelidir.
- **[ZORUNLU ENTREGASYON ADIMI]:** Registry sisteminde üretilen `superpowers brainstorm` çıktısını (`brainstorm.md`) MUTLAKA okuyup, kendi **Agentic Plan (implementation_plan)** mantığınla harmanlayarak "v2" (22. seviye / fine-state) kapasitesine ulaştıracaksın.
- **[ZORUNLU REVIEW ADIMI]:** Planı tam bitirdin sanıp kullanıcıya sunmadan HEMEN ÖNCE, kendi kendine bir `superpowers review` filtresinden geçireceksin. "Bu plan gerçekten mimariyi kırar mı? Gerçek bir çözüm mü (Anti-hallucination)?" diye kendini denetledikten sonra son (FINE) halini çıkaracaksın.

## Çıktı formatı (tam olarak kullanın)
## Hedef
## Varsayımlar
## Plan
(Her adım şunları içermelidir: Dosyalar, Değişiklik, Doğrulama)
## Riskler ve Azaltmalar
## Geri Dönüş (Rollback) Planı

## Kaydet (Zorunlu)
Yukarıdaki plan içeriğini oluşturduktan sonra, onu AŞAĞIDAKİ kurallara göre ZORUNLU olarak diske yazmalısın:

1. **[ŞARTLI KAYIT KURALI]:** 
   - **Eğer** üzerinde çalıştığın işlem bir Registry göreviyse (örn. `PXX-` gibi bir taslağı varsa), o görevin `.md` dosyasını bul ve `artifacts.plan` yolunu oku. Planı doğrudan o yola kaydet.
   - **Eğer** Registry dışında, bağımsız jenerik bir plan oluşturuyorsan, standart `artifacts/superpowers/plan.md` yolunu kullan. Asla olmayan bir Registry klasörü uydurmaya çalışma.
2. Dosyanın en tepesine MUTLAKA şu standart header bilgisini ekle:
   ```markdown
   # 📋 Implementation Plan: PXX/YYY — Görev Adı
   > **Brainstorm:** `ilgili brainstorm.md dosyasının tam yolu`
   > **Model:** Kullandığın Model (Örn: Flash/High) | **Tarih:** Günün Tarihi
   > **Tahmini Toplam Süre:** ~X dakika (Y adım x Z dk vs)
   ```
3. Sentinel (Anti-Forgery) kalkanını geçebilmek için plan belgesinin en altına kriptografik imzayı atacak olan `write_artifact.py` (veya Sentinel uyumlu tetikleyiciyi) otonom olarak kullanmalısın.
4. Kaydın başarılı olduğunu dosyanın içeriğini okuyarak teyit et.

## Onay
Sor:
**Bu planı ve `artifacts.plan` dizinindeki yerleşimini onaylıyor musunuz? Her şey yolunda görünüyorsa ONAYLANDI (APPROVED) yazarak yanıtlayın.**

Eğer kullanıcı ONAYLANDI (APPROVED) yanıtını verirse:
- Henüz uygulamaya GEÇME.
- Şöyle yanıtla: **"Plan onaylandı. Uygulamayı başlatmak için `/superpowers-execute-plan` komutunu çalıştırın."**
- İşlemi bitir ve kod değiştirmeye geçme.
