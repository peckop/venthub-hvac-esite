# Brainstorm: Registry V4 - Dashboard Devrimi (ID: 009)

## 1. Atomic Progress (Alt Görev Yüzdesi)
- **Mantık:** Script dosya içindeki tüm checkbox maddelerini (`- [ ]` ve `- [x]`) sayar.
- **Hesaplama:** `(X / Toplam) * 100`. 
- **Koruma:** Eğer hiç checkbox yoksa, dosya bazlı (Brainstorm:%10, Plan:%30 vb.) mantığa geri döner.
- **Uygulama:** Bu yüzde, Registry dosyasındaki `progress:` alanına otomatik yazılır.

## 2. Unified Dashboard (PULSE.md) Yeni Tasarımı
Dashboard artık 3 ana bölümden oluşacak:

### A) PROJE ÖZETİ (Global Stats)
```text
Toplam Görev: [X] | Aktif: [Y] | Tamamlanan: [Z] | Genel İlerleme: [%XX]
```

### B) MEVCUT DURUM (Tablo)
| ID | Görev | Durum | İlerleme | Öncelik | Bağımlılık |
|---|---|---|---|---|---|
| ... | ... | ... | [BAR] %XX | ... | ... |

### C) KRİTİK UYARILAR (Rogue & Blocking)
- Kaçak operasyonlar ve beklemede olan işler.

## 3. Mimari Karar: "İlerleme Çubuğu" (Progress Bar)
Dashboard'da yüzdelerin yanına basit bir metin tabanlı ilerleme çubuğu ekleyelim: `[████░░░░░░] 40%`. 
*Neden?* Görsel algıyı güçlendirmek ve "Dashboard" hissini pekiştirmek için.

## 4. Kabul Kriterleri (Salat Check)
- [ ] Checkbox sayma zekası çalışıyor mu?
- [ ] Biten işlerin detayları (Öncelik, Yüzde) korunuyor mu?
- [ ] Dashboard'un başında Global Özet var mı?
