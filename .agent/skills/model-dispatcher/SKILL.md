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

## 🚀 ZORUNLU KONSOL ÇIKTISI (Mission Control)

Ajan göreve başlarken (`/superpowers-brainstorm` vb. komutlarda) EN TEPEDE aşağıdaki formatta bir pano sunmak zorundadır:

```markdown
> [!MISSION_CONTROL] 
> **Görev:** [Görevin Kısa Tanımı]
> **Zorluk / Risk:** [Düşük | Orta | Yüksek]
> **Önerilen Araç:** [Gemini Flash | Gemini High | Claude Sonnet / Opus]
> 
> **Kota Stratejisi Açıklaması:** 
> - [Eğer Flash öneriliyorsa]: "Bu görev basit olduğu için, haftalık kotalarınızı korumak adına '5 Saatlik Flash' kotasını sömürmenizi tavsiye ediyorum. Lütfen modeli Flash'a alın."
> - [Eğer High/Sonnet öneriliyorsa]: "Bu görev mimari kararlar içerdiğinden 'Haftalık Kota' havuzuna (High/Sonnet) geçmeniz gerekiyor. Flash burada kodu kırabilir."
> 
> **Aksiyon:** 
> "(Mevcut model ile devam ediyorum)" VEYA "(Lütfen modeli değiştirip 'Devam' deyin, bekliyorum...)"
```
