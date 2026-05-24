# 🛡️ GÖREV: SENTINEL ENFORCEMENT & GÜVENLİK KİLİDİ
> [!CAUTION]
> **REGISTRY VE OTONOM SİSTEMLERE MANUEL MÜDAHALE YASAKTIR.**

## 🚨 SIFIR TOLERANS KURALI & KORUNAN VARLIKLAR:
Ajan (Sen), projenin otonom sinir sistemi olan aşağıdaki dizinlere ve dosyalara **Kafana Göre / Standart Dosya Araçlarıyla (rm, replace, vs.) DOKUNAMAZSIN**:

1. `registry/` dizininin tamamı (Görev klasörleri, `PULSE.md` dahil)
2. `.agent/` dizininin tamamı (Skills, Workflows, Scripts)
3. `.gemini/hooks/` dizininin kendisi!

### 🛑 ZORUNLU İŞLEM PROTOKOLÜ:
- **Registry Güncellemeleri:** Eğer bir görev tamamlandıysa veya PXX projeleri değişecekse, BUNU SADECE OTONOM MOTOR İLE YAPACAKSIN: `run_command: python registry/manage_registry.py <komut>`
- Mimar (Kullanıcı) özel bir izin / istisna (`/override` gibi) vermediği sürece dosyaları manuel silmek (rm) MÜHENDİSLİK SUÇUDUR.
- Her büyük işlem veya terminal karmaşasından sonra projenin "Fiziksel Bütünlüğünü" korumak için `python registry/manage_registry.py repair` çalıştırılacaktır.
