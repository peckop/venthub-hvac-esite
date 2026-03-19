# Brainstorm: 006 - Dinamik Otorite ve İçerik Yönetimi

## 🎯 Hedef
Kategori sayfalarındaki mühendislik içeriklerini (Authority Sections) koddan (statik i18n) bağımsız hale getirerek veritabanına taşımak ve 017 (Page Builder) projesinin temelini atmak.

## 🧠 Teknik Kararlar ve Mimari

### 1. Veritabanı Katmanı (Supabase)
- **Tablo:** `categories`
- **Yeni Kolon:** `authority_content` (JSONB)
- **Esnek Şema Taslağı:**
```json
{
  "brand": {
    "eyebrow": "Marka Mirası",
    "title": "Vortice Kalitesi",
    "description": "...",
    "badges": ["ISO 9001", "Eurovent"],
    "stats": [{"label": "Yıl Deneyim", "value": "70+"}]
  },
  "technical": {
    "eyebrow": "Mühendislik",
    "title": "Teknik Detaylar",
    "points": [{"title": "...", "desc": "..."}]
  },
  "problem": {
    "title": "...",
    "painPoints": [...],
    "visual": {
      "before": "65dB",
      "after": "25dB",
      "differenceLabel": "Sessizlik Farkı"
    }
  }
}
```

### 2. Frontend Katmanı (Next.js)
- `CategoryAuthoritySection.tsx` bileşeni refactor edilecek.
- Bileşen artık `slug`'a bakmayacak; `authority_content` verisi varsa render edecek.
- i18n anahtarları (`t('...')`) yerine direkt DB'den gelen metinler kullanılacak.

### 3. Migrasyon Stratejisi
- Önce Sessiz Fanlar (`tr.ts`) içeriği SQL ile DB'ye aktarılacak.
- Ardından HRV için yeni içerikler sisteme girilecek.

## 🛡️ Riskler
- **SEO:** Verilerin DB'den gelmesi Next.js Server Component yapısında gecikme yaratmamalı (Prefetching ile çözülecek).
- **Tip Güvenliği:** JSONB alanı için `db-rows.ts` içinde sıkı bir tip tanımı yapılmalı.

## ✅ Karar
Bu yapı, projenin kod yükünü azaltırken esnekliğini artıracak ve 017 Page Builder için gerekli olan "Blok Bazlı İçerik" mantığını sisteme kazandıracaktır.
