---
name: model-dispatcher
description: Kredi ve kota verimliliğini korumak için, her görevin başında (Planlama ve Brainstorm aşamasında) işin karmaşıklığını ölçerek uygun AI modelini (Flash, High, Sonnet/Opus) öneren "Komuta Kontrol" (Orkestratör) sistemidir.
---

# 🕹️ Model Dispatcher (Orkestratör) Skill - Kota Uyanık Sürüm

Bu yetenek, ajanın "kendi limitlerini ve KULLANICININ HESAP KOTALARINI" bilmesini sağlar. Ajan, görevi analiz ettikten sonra Kullanıcıya (Mimara) bir "Model Vites Değişimi" tavsiyesinde bulunur.

## ⚖️ KOTA EKONOMİSİ VE BİLİNCİ
Ajanlar şu gerçekliğe göre karar vermek ZORUNDADIR:
- **Gemini Flash:** Her 5 saatte bir yenilenen, BİRBİRİNDEN BAĞIMSIZ "bedavaya yakın" kotası vardır.
- **Gemini High (ve Low):** Aynı "Haftalık" pakette eriyen ortak kovalardır.
- **Claude (Sonnet / Opus vb.):** Ayrı bir "Haftalık" pakette eriyen ortak kovalardır. Opus gibi ağır modeller bu ortak kotayı çok daha agresif sömürür.

> **ALTIN KURAL:** Flash'ı (5 saatlik kota) olabildiğince "Amelelik" ve rutin işlerde sömür. Haftalık kotalara (Gemini High, Claude Sonnet) sadece "Cerrahi" veya "Mimari" işlerde dokun!

---

## ⚙️ ÇALIŞMA ALGORİTMASI VE MODEL KADEMELERİ (5 Seviye)

### 🟢 1. Trivial (Çok Düşük Sıklet) - [Öneri: GEMINI 3 FLASH]
*Strateji: Neredeyse tüm amelelik, Linter, Build, ufak CSS işleri için bağımsız 5 saatlik kotayı sömür. Sıfır derin mimari gerektirir.*
- Tip hatalarını hızlı onarma, kullanılmayan değişken silme, format güncelleme.

### 🟡 2. Low (Rutin Kodlama) - [Öneri: GEMINI 3.1 PRO (LOW)]
*Strateji: Mantıksal çıkarım gerektirir ancak context'i dardır ve çok ağır bir "Thinking" sürecine ihtiyaç duymaz. Motor kalitesi yüksektir fakat compute limiti dardır.*
- 1-2 dosya arasında spesifik fonksiyon entegrasyonu.
- Hazır şablonlarda (ör. Registry Workflow) veri modifikasyonları, Argument Parser güncellemeleri.

### 🟠 3. Medium (Orta-İleri Mantık) - [Öneri: GEMINI 3.1 PRO (HIGH)]
*Strateji: Hızlı ve keskin bir akıl yürütme, birden fazla dosyadaki stateleri izlemeyi gerektirir. Flash'ın patlayacağı, Pro Low'un ise context'i nedeniyle tıkanacağı görevler içindir.*
- Karmaşık State/Lifecycle (useEffect vs.) onarımları.
- Kapsamlı ve kritik refactoring işlemleri (Örn: Model eşleştirme asistanının otomasyonu).

### 🔴 4. High (Karmaşık Mimari) - [Öneri: CLAUDE 4.6 SONNET]
*Strateji: "Haftalık" Anthropic paketinden harcar. SADECE derin düşünce gereken yepyeni mimarilerde kapı açar.*
- Relational Veritabanı (Supabase RLS/Join) mantık inşaları ve API katmanı kurgusu.
- App Router üzerinde 3-4 root layout'u sarsan iskelet güncellemeleri.

### 🟣 5. Expert (Uç Nokta / Overkill) - [Öneri: CLAUDE 4.6 OPUS]
*Strateji: En derin zeka. Geniş codebase aramaları, projedeki "kaynağı bulunamayan" kördüğüm bug'lar için saklanır.*
- "Çözülemez" zannedilen kronik framework sorunları veya 100+ dosyayı etkileyecek paradigma devrimleri.

---

## 🗂️ KANONİK MODEL LİSTESİ (Kullanıcının Seçim Panelindeki Gerçek Modeller)

Bütün atamalar KESİNLİKLE sadece aşağıdaki listede yer alan modellerle yapılacaktır. Hayali veya varsayımsal model (Örn: GPT 5 vb.) önermek yasaktır:

1. **Gemini 3.1 Pro (High):** Yüksek akıl yürütme, "Ağır Top", karmaşık mimari ve refactoring işleri için. Pahalı kota.
2. **Gemini 3.1 Pro (Low):** Aynı motorun daha düşük düşünme süreli versiyonu. Orta-Üst düzey işler için dengeli.
3. **Gemini 3 Flash:** En hızlı, en ucuz. Sadece linter temizliği, basit CSS düzeltmeleri veya Build komutu çalıştırmak gibi rutin işler (amelelik) için.
4. **Claude Sonnet 4.6 (Thinking):** Kodlama konusunda piyasadaki en yetenekli akıl yürütme motorlarından biri. Mimari kararlar için zirve model (High maliyet).
5. **Claude Opus 4.6 (Thinking):** En derin akıl yürütme, devasa analizler. Sadece aşırı geniş kapsamlı "Sıfırdan Proje Mimarisi" veya "Çözülemeyen Kronik Bug" durumlarında kullanılmalı (Çok pahalı / Overkill).
6. **GPT-OSS 120B (Medium):** Açık kaynaklı (Open-Weight), ortalama "Chain-of-Thought" yeteneğine sahip, çok güçlü ama maliyet dostu alternatif.

## 🎯 Model Seçim Matrisi (Routing)

Kullanıcının kotasını korumak ve `Rate Limit` / `Credit Exhaustion` sorunlarını önlemek için aşağıdaki otonom referans matrisini kullan:

| Kompleksite / Kademe | Görev Karakteristiği & Örnekler | Risk & Süre | Önerilen Model |
| :--- | :--- | :--- | :--- |
| **`trivial`** | Sadece statik hatalar (Lint/Typo), README metinleri, CSS renk kodu değişimi. | Düşük. 1-2 dosya (<5dk) | **Gemini 3 Flash** |
| **`low`** | Zeka içeren ancak sadece 1-2 lokal dosyayı etkileyen rutin kod yazımı (Component izolasyonu, test). | Orta. İzole (<15dk) | **Gemini 3.1 Pro (Low)** |
| **`medium`** | 3-5 dosyalı state ve Context veri geçişi, kompleks tip onarımı, orta çaplı script inşası. | Yüksek-Orta (<30dk) | **Gemini 3.1 Pro (High)** |
| **`high`** | Sıfırdan Supabase Schema, Workflow-Agent icadı, Root Layout revizesi. | Yüksek. 5+ dosya (<60dk) | **Claude 4.6 Sonnet** |
| **`expert`** | Bulunamayan Memory-Leak veya devasa Monorepo dönüşümleri (Tüm projeye etki). | Kritik Devrim (<2 Saat) | **Claude 4.6 Opus** |

## 🚀 ZORUNLU KONSOL ÇIKTISI (Mission Control)

Ajan göreve veya bir plana/adıma başlarken (`/superpowers-brainstorm` vb. komutlarda veya Execution adımları öncesinde) aşağdaki **katı ve objektif** şablonu kullanmak zorundadır. **Bütün modelleri "ya o ya bu" diye eşit kefeye koymak YASAKTIR.** Görevin ağırlığına göre puanlama (0-100) yapılarak sıralanmalıdır.

```markdown
> [!MISSION_CONTROL] : AŞAMA X VEYA GÖREV Y
> **Görev Özeti:** [Neyin yapılacağı (1-2 cümle)]
> **Risk/Karmaşıklık:** [1 ile 10 arası bir puan, nedenleriyle (Örn: 9/10 - React Hydration riski)]
>
> 🥇 **BİRİNCİL ÖNERİ (En Uygun Model):** [Örn: Claude 3.5 Sonnet / Gemini 3.1 High vs.]
> - **Nedeni:** [Objektif, dürüst ve tamamen o modele has bir yeteneği/farkı net belirten teknik sebep]
> 
> 📊 **ALTERNATİFLER VE UYGUNLUK PUANLARI:**
> - [Model A] **%100** -> (Neden mükemmel uyar / Nerede işe yarar)
> - [Model B] **%85** -> (Hangi konuda hafif zayıf kalabilir)
> - [Model C] **%40** -> (Neden BU GÖREV İÇİN KULLANILMAMALI)
>
> ⚠️ **KOTA / RİSK UYARISI:**
> "Bu adımı sadece X ve Y modeliyle geçmeniz güvenlik açısından elzemdir. Z modelini kullanırsanız syntax kırılmaları yaşanabilir." VEYA "Bu sadece bir 'amelelik' (hammallık) görevidir, pahalı modelleri (Opus/Sonnet) harcamayın, direkt Flash kullanın."
>
> **Aksiyon:**
> Lütfen en uygun modeli seçtiğinizden emin olduktan sonra **ONAYLANDI** yazarak devam komutunu veriniz.
```
