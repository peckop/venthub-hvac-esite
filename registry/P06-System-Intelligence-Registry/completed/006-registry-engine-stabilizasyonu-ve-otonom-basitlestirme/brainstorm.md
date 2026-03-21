# 🧠 Brainstorming: Registry Engine Stabilizasyonu (P06-006)

## 🚩 Sorun Tanımı
Mevcut Registry (Kayıt Defteri) motoru, VentHub V7 protokolüne tam uymuyor ve otonom süreçte aşağıdaki "hantallık/hata" döngülerine yol açıyor:
1. **O(n) Tarama Felci:** `sync_from_filesystem` fonksiyonu, her işlemde tüm projeleri ve görevleri (yüzlerce dosya) baştan sona tarıyor. Bu, I/O yükünü artırıyor ve build sürelerini uzatıyor.
2. **Terminal Buffer Overflow:** Gereksiz "Success/Update" logları terminali kilitliyor ve Antigravity motorunun (Agent) sessizce çökmesine neden oluyor.
3. **Zorlamalı/Eksik Otonomluk:** "Eksik Başlık" gibi basit hataları sadece raporluyor, kendi kendine onarmıyor (Self-Healing eksik).
4. **Disiplin Sızıntısı:** Önceki `create-task` yapısı V7 protokolündeki klasör/dosya adı eşleşmesi ve zorunlu YAML metadata şablonuna (artifacts, created_at vb.) uymuyordu.

## 🛠️ Çözüm Stratejisi
1. **Incremental Sync (MD ↔ SQL):** Sadece dosya hash'i veya modifikasyon tarihi değişen dosyaları SQL'e aktaracak bir yapıya geçilmeli.
2. **Silent & Resilient Logging:** Varsayılan log seviyesi düşürülmeli, terminal buffer yükü %90 azaltılmalı. Sadece "Milestone" seviyesindeki değişimler basılmalı.
3. **Autonomous Self-Healing:** Meta veri eksikse klasör adından akıllı tahmin yaparak MD dosyasını OTO-TAMİR etmeli.
4. **V7 Protocol Enforcement:** `manage_registry.py` içindeki tüm dosya oluşturma ve taşıma fonksiyonları, `PXX/active/ID-slug/ID-slug.md` hiyerarşisine %100 sadık kalmalı.

## ⚠️ Riskler
- **Hash Çakışması:** Çok düşük ihtimal ama hash tabanlı senkronizasyonda veri kaybı riski. (Modifikasyon tarihi ile çift kontrol yapılacak).
- **Geriye Dönük Uyumluluk:** Eski (hatalı) klasör yapılarının yeni sistemde "Self-Healing" ile onarılırken veri kaybı yaşamaması.

## 🎯 Nihai Hedef
Antigravity'nin çökmediği, sessiz çalışan ve protokol hatalarını kendi kendine düzelten **Registry Engine v5.0** mimarisi.
