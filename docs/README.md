# 📚 VentHub HVAC Dokümantasyon

Bu klasörde projeye ait tüm dokümantasyon dosyaları bulunmaktadır.

## 📖 Ana Dokümantasyon

### 🗺️ **ROADMAP.md** ⭐
**Tek ve güncel kaynak** (Single Source of Truth)
- Proje yol haritası ve sprint planları
- Operasyonel görev listesi
- QA kontrol listeleri
- Son güncelleme: 2025-09-02

### 🛠️ **OPERATIONS_PLAN.md**
Stok yönetimi ve operasyonel süreçler
- Envanter şeması ve RPC'ler
- Admin UI spesifikasyonları
- Müşteri UX gereksinimleri
- WhatsApp entegrasyonu planı

### 🚀 **DEPLOYMENT.md**
CI/CD süreçleri ve dağıtım rehberi
- GitHub Actions yapılandırması
- Environment variables
- Supabase migrations

### 📱 **WHATSAPP_SETUP_GUIDE.md**
WhatsApp & SMS bildirim sistemi kurulum rehberi
- Twilio hesap kurulumu
- Environment variables
- Test süreçleri
- Troubleshooting

### 📝 **CHANGELOG.md**
Detaylı değişiklik günlüğü
- Sürüm notları
- Bug fix'ler ve özellikler
- Tarihsel gelişim

## 📁 Klasör Yapısı

```
proje/
├── README.md                      # 📄 Ana proje tanıtımı
├── NEXT_STEPS.md                  # ⚡ Kısa vadeli görevler (aktif)
├── VENTHUB_ULTIMATE_PROMPT.md     # 📋 Proje özellikleri
└── docs/
    ├── README.md                  # 📚 Bu dosya
    ├── ROADMAP.md                 # 🎯 Ana yol haritası
    ├── OPERATIONS_PLAN.md         # 🛠️ Operasyon planı
    ├── DEPLOYMENT.md              # 🚀 Dağıtım rehberi
    ├── WHATSAPP_SETUP_GUIDE.md    # 📱 WhatsApp kurulum
    ├── CHANGELOG.md               # 📝 Değişiklik günlüğü
    └── archive/                   # 📦 Arşiv dosyalar
        ├── plan-and-tasklist.md        # Eski plan (original)
        └── plan-and-tasklist-current.md # Eski plan (son hali)
```

## 🎯 Hızlı Erişim

- **Mevcut durumu öğrenmek**: `ROADMAP.md` → "Durum Özeti"
- **Yeni özellik eklemek**: `ROADMAP.md` → Sprint planları
- **Stok sistemi kurulum**: `OPERATIONS_PLAN.md`
- **WhatsApp kurulumu**: `WHATSAPP_SETUP_GUIDE.md`
- **Deploy işlemi**: `DEPLOYMENT.md`
- **Son değişiklikleri görmek**: `CHANGELOG.md`

## ⚠️ Önemli Notlar

- **ROADMAP.md** genel yol haritası ve uzun vadeli planlama için tek kaynak
- **NEXT_STEPS.md** kısa vadeli teknik görevler ve detaylar için aktif olarak kullanılıyor
- Her iki belge senkronize çalışıyor: ROADMAP stratejik, NEXT_STEPS operasyonel
- WhatsApp backend sistemi hazır, sadece Twilio hesabı ve kurumsal numara gerekli
- Deprecated dosyalar `docs/archive/` klasöründe korunuyor

## Yeni Doküman

- HOMEPAGE_ENHANCEMENTS.md — Ana sayfa geliştirmeleri ve etkileşimli bileşen backlog’u (2025-09-05)

## 🔄 Güncel Tutma

Bu dosya otomatik güncellenmez. Yeni dokümantasyon eklendiğinde veya yapı değiştiğinde lütfen bu dosyayı da güncelleyin.

Not: Admin UI standardizasyonu ve toolbar entegrasyonlarının detayları için CHANGELOG.md ve ADMIN_ROADMAP.md dosyalarına bakınız.

Son güncelleme: 2025-09-05
