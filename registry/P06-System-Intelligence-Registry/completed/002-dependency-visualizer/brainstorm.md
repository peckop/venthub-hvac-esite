# Brainstorm: 002-dependency-visualizer

## 🎯 Hedef
Registry hiyerarşisindeki görevlerin birbirine olan bağlarını (dependencies) analiz ederek, projenin stratejik haritasını görsel bir formatta sunmak. Bu sayede "Hangi iş bitmeden hangisine başlanamaz?" sorusuna anlık cevap üretmek.

## 🛡️ Risk Analizi & Teknik Bariyerler
- **Döngüsel Bağımlılık (Circular Dependency):** A görevi B'yi, B görevi A'yı bekliyorsa sistem sonsuz döngüye girebilir (Kontrol algoritması eklenmeli).
- **Projeler Arası Bağlar:** Bağımlılıklar sadece aynı proje içinde değil, projeler arasında da olabilir (Örn: P05 bir görevin bitmesi için P04'teki bir görevi bekleyebilir).
- **Görselleştirme Kısıtları:** Terminal ortamında (CLI) karmaşık bir grafiği okunaklı sunmak zordur ( ASCII ağaç yapısı veya Mermaid.js kodu tercih edilecek).

## 💡 Mimari Çözüm
- **Graph Engine:** Tüm görevlerin ID'lerini ve `depends_on` listelerini bir "Node-Edge" matrisine dönüştüren Python modülü.
- **Output:** İki farklı çıktı modu: 
  1. `list`: Sıralı bağımlılık listesi.
  2. `mermaid`: GitHub'ın yerleşik olarak render edebildiği Mermaid.js diyagram kodu.
- **Sentinel:** Eğer bir görev tamamlanmadan (completed olmadan) ona bağımlı olan bir görev aktive edilirse uyarı veren bir mantık.

## ✅ Başarı Kriterleri
- `manage_registry.py graph` komutu çalıştırıldığında hata vermeden bir diyagram üretmeli.
- Diyagramda görevlerin statüleri (Backlog/Active/Completed) renklerle veya sembollerle ayrılmalı.
- Döngüsel bağımlılıklar otomatik olarak tespit edilip raporlanmalı.
