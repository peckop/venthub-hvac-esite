# Brainstorm: Registry V3 & Superpowers Sinerjisi (ID: 007)

## 1. Hedef ve Kapsam
Registry (Hafıza) sistemini, projenin "Motoru" olan Superpowers ile tam uyumlu hale getirmek. Hiçbir işin "kayıtsız" (Registry'de açılmadan) başlamamasını garanti altına almak.

## 2. Mimari Kararlar (Mühürlenmiş Kurallar)

### A) "Registry First" (Önce Kayıt) Disiplini
- **Kural:** Bir fikir veya görev, ancak `registry/active/` altında bir ID ve dosya aldıktan sonra "resmi" sayılır.
- **Engelleyici (Blocker):** Eğer bir AI asistan, Registry'de olmayan bir iş için `artifacts/superpowers/` altında bir dosya üretirse, bu "Kaçak Operasyon" sayılır ve derhal durdurulur.

### B) Metadata Yapısı (V3)
Her registry dosyasının başında, makinelerin (scriptlerin) okuyabileceği bir YAML bloğu bulunmalıdır:
```yaml
id: <ID>
title: "<Başlık>"
status: "Pending | Brainstorming | Planning | Executing | Reviewing | Completed"
progress: <Sayım %>
artifacts:
  brainstorm: "path/to/artifact"
  plan: "path/to/artifact"
  review: "path/to/artifact"
```

### C) Otonom Senkronizasyon (Registry-Sync)
- **Araç:** `scripts/tools/registry_sync.py`
- **Girdi:** `artifacts/superpowers/` klasöründeki dosya değişiklikleri.
- **İşlem:** Dosya adı ve içeriğine bakarak (örn: `007-plan.md`), Registry'deki `007-xxx.md` dosyasının metadata kısmını (status ve progress) günceller.

## 3. Riskler ve Tedbirler
- **Çakışma:** Birden fazla AI'nın aynı anda registry güncellemesi. (Tedbir: Atomik dosya yazma ve git lock mekanizması).
- **ID Karmaşası:** ID'lerin birbirini takip etmemesi. (Tedbir: `scripts/tools/next_id.py` gibi küçük bir araç).

## 4. Kabul Kriterleri (Salat Check)
- [ ] `REGISTRY_PROTOCOL.md` (V3) yeni kuralları içerecek şekilde güncellendi.
- [ ] `scripts/tools/registry_sync.py` scripti yazıldı ve test edildi.
- [ ] Tüm aktif görevler (003-006) yeni metadata yapısına kavuşturuldu.
- [ ] "Registry First" kuralı beyin fırtınası mühürlendi.
