# Implementation Plan: Registry V4 - Dashboard Devrimi (ID: 009)

## 1. Sync Script Modernizasyonu (registry_sync.py)
- [ ] **Checkbox Sayacı Fonksiyonu:** Dosya içeriğini okuyup `[x]` ve `[ ]` sayısını döndüren fonksiyonu yaz.
- [ ] **Yüzde Hesaplama Mantığı:** Alt görev sayısına göre `progress` değerini hesapla ve Registry metadata'sını güncelle.
- [ ] **Global İstatistik Toplama:** Tüm görevlerin (Aktif+Tamamlanan) toplam ve bitiş sayılarını bellekte tut.

## 2. Dashboard (PULSE.md) Yeniden Tasarımı
- [ ] **Global Stats Header:** Dashboard başına özet bilgisini ekle.
- [ ] **Visual Progress Bar:** Yüzdelerin yanına `[███░░]` şeklinde görsel çubuk ekle.
- [ ] **Unified Table:** "Aktif" ve "Tamamlanan" tablolarını tüm detaylarıyla (Priority, Progress vb.) göster.

## 3. Protokol ve Metadata Güncellemesi
- [ ] `REGISTRY_PROTOCOL.md` (V4) Dashboard ve İlerleme mantığını mühürle.
- [ ] Mevcut görevlere (003-006) örnek alt görevler (checkbox) ekle ki sistemin "atomik" çalıştığını ispatlayalım.

## 4. Doğrulama (Salat Check)
- [ ] `sync` scriptini çalıştır ve `registry/PULSE.md` dosyasını "Dashboard" gözüyle incele.
- [ ] Bir alt görevi `[x]` yapıp Dashboard'un anında güncellendiğini doğrula.
