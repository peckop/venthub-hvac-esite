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
- **[ZORUNLU V8 JSON ZİNCİRİ]:** Geleneksel `.md` metin planları V8 motorunda KESİNLİKLE yasaktır. Ajan aşağıdaki JSON zincirini `registry/schemas` altındaki şemalara harfiyen uyarak üretmeli ve DÜZENLİ OLARAK `python registry/engine.py validate ...` komutuyla sınamalıdır:
  1. `brainstorm.json`
  2. `dispatcher.json` (Karmaşıklığa göre [MISSION CONTROL] model önerisi)
  3. `plan.json` (Adımlar, testler, rollback ve doğrulamalar)

## JSON Pipeline Onayı (Toplu Sunum İlkesi)
Bu zincirdeki (brainstorm, dispatcher, plan) TÜM dosyalar otonom olarak (aralarda kullanıcıya sorulmadan) JSON formatında oluşturulup V8 Motoru'ndan (`✅ Geçerli` çıktısı alarak) geçirilmelidir.
Motor sana `pipeline status` sorgusunda "Artık uygulamaya (Execution) geçebilirsin" manasında bir yanıt verene kadar JSON üretmeye devam et.

## Kaydet ve Sun (Zorunlu)
JSON zinciri bittiğinde, **AI Sistemi Arayüzünde görünebilmesi için** EN SON aşamada `ArtifactType="implementation_plan"` olarak `write_to_file` komutunu kullanarak `implementation_plan.md` vitrinini oluştur.
Bu vitrinin içine mutlaka:
- Yapılacak teknik adımları
- Ve `dispatcher.json`'dan elde ettiğin **[MISSION CONTROL] Model Önerisi ve Alternatiflerini** koy.

## Onay
Vitrin hazırlandıktan sonra kullanıcıya sor:
**Aşağıdaki planı ve seçilen modeli (Mission Control) onaylıyor musunuz? (Modelinizi [Önerilen Model] olarak ayarlamayı unutmayın)**

Eğer kullanıcı ONAYLANDI (APPROVED) yanıtını verirse:
- Henüz uygulamaya GEÇME.
- Sistemi Execution moduna almak için onay al ve sonra kodlamaya geç.
