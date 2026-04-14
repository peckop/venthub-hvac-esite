# 📚 VentHub HVAC Dokümantasyon

Bu klasörde projeye ait tüm dokümantasyon dosyaları bulunmaktadır.

## 📖 Ana Dokümantasyon

### 🏗️ **ARCHITECTURE.md** ⭐
**Tek ve güncel kaynak** (Single Source of Truth)
- Mimari standartlar ve kurallar
- Model ve hook yaklaşımları

### 🚀 **DEPLOYMENT.md**
CI/CD süreçleri ve dağıtım rehberi
- Vercel dağıtım yapılandırması
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
└── docs/
    ├── README.md                  # 📚 Bu dosya
    ├── ARCHITECTURE.md            # 🏗️ Ana mimari doküman
    ├── DEPLOYMENT.md              # 🚀 Vercel dağıtım rehberi
    ├── SECURITY_AND_PERF_CHECKLIST.md # 🔐 Güvenlik ve performans rehberi
    ├── SEO_I18N.md                # 🌐 SEO ve i18n standartları
    ├── WHATSAPP_SETUP_GUIDE.md    # 📱 WhatsApp kurulum
    ├── CHANGELOG.md               # 📝 Değişiklik günlüğü
    ├── DESIGN_SYSTEM.md           # 🎨 Tasarım sistemi ve bileşen yapısı
    ├── EMAIL_TEMPLATES.md         # 📧 Email şablonları rehberi
    ├── MANIFESTO.md               # 📜 Proje manifestosu
    ├── MCP_KULLANIM_REHBERI.md    # 🤖 MCP araçları ve JULES ajan rehberi
    └── archive/                   # 📦 Arşiv dosyalar
```

## 🎯 Hızlı Erişim

- **Mimari yapıyı öğrenmek**: `ARCHITECTURE.md`
- **Güvenlik & Performans**: `SECURITY_AND_PERF_CHECKLIST.md`
- **Tasarım Kuralları**: `DESIGN_SYSTEM.md`
- **Değişiklik Günlüğü (Changelog)**: `CHANGELOG.md`
- **Ajanlar ve MCP Yönergesi**: `MCP_KULLANIM_REHBERI.md`
- **Deploy İşlemi**: `DEPLOYMENT.md`

## ⚠️ Önemli Notlar

- Deprecated dosyalar ve eski planlar `docs/archive/` klasöründe korunmaktadır.
- Projede otonom süreçleri (AI Agent workflows) desteklemek için `AGENTS.md` ve `GEMINI.md` kök dizinde bulunmaktadır.

## Yeni Doküman

- HOMEPAGE_ENHANCEMENTS.md — Ana sayfa geliştirmeleri ve etkileşimli bileşen backlog’u (2025-09-07)
- admin-toolbar.md — AdminToolbar kılavuzu: API, düzen, export, kalıcılık planı (2025-09-05)

## 🔄 Güncel Tutma

Bu dosya otomatik güncellenmez. Yeni dokümantasyon eklendiğinde veya yapı değiştiğinde lütfen bu dosyayı da güncelleyin.

Not: Admin UI standardizasyonu ve toolbar entegrasyonlarının detayları için CHANGELOG.md ve ADMIN_ROADMAP.md dosyalarına bakınız.

Son güncelleme: 2025-09-19
