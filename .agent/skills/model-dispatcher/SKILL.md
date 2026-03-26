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

## ⚙️ ÇALIŞMA ALGORİTMASI VE MODEL ÖNERİLERİ

### 🟢 Düşük Sıklet / Rutin İşler (Öneri: GEMINI FLASH)
*Strateji: Neredeyse tüm amelelik işleri için bağımsız 5 saatlik kotayı sömür. Haftalık paketleri asla harcama.*
- CSS / Tailwind ufak stil düzenlemeleri.
- Basit Linter / Unused Vars hatalarının temizliği.
- Sabit metinlerin i18n objelerine (tr.ts) taşınması işlemi.
- README veya Dökümantasyon (PULSE.md) güncellemeleri.
- 1-2 dosyalık risksiz CRUD veya UI güncellemeleri.

### 🟡 Orta Sıklet / Kritik Çözümler (Öneri: GEMINI HIGH)
*Strateji: Flash'ın tıkanacağı veya "Tunnel Vision" (Tünel Görüşü) yaşayabileceği çok dosyalı ve mantıksal işler. (Ortak Haftalık Kotadan harcar, dikkat et).*
- Birden fazla dosyayı kapsayan fonksiyonel bağımlılıklar.
- TSC (Tip uyumsuzluğu) hatalarının derinlemesine onarımı (Örn: `check_integrity.py` 52 Blocker temizliği).
- Gelişmiş Supabase verilerindeki (Join/Relational) mantıkların kurulması.
- Bileşen seviyesi React Lifecycle (useEffect vb.) revizyonları.

### 🔴 Ağır Sıklet / Merkezi Mimari (Öneri: CLAUDE SONNET / OPUS)
*Strateji: "Haftalık" Anthropic paketinden harcar. SADECE BEYİN GEREKTİREN işlerde kullanılmalıdır. Opus'un kotayı çok hızlı yaktığını unutma.*
- Yeni Mimarilerin (ViewModel, Agent Automation, Integrity Scripts) baştan kurgulanması.
- Projenin ana iskelet (Routing, App-Router, State Management) revizyonları.
- Derin matematiksel analiz, fizik tabanlı sistemler veya kompleks Supabase RLS mimarisi inşası.

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

Kullanıcının kotasını korumak ve `Rate Limit` / `Credit Exhaustion` sorunlarını önlemek için aşağıdaki matrisi kullan:

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
