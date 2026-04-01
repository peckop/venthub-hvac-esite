---
id: "016"
title: "i18n Tam Kilitleme ve Slug Konsolidasyonu"
priority: "High"
status: "Planning"
progress: 0%
project: "P04-Category-Architecture"
created_at: "2026-03-26 12:23:10"
updated_at: "2026-03-26 12:23:10"
artifacts:
  brainstorm: "registry/P04-Category-Architecture/backlog/016-i18n-tam-kilitleme-ve-slug-konsolidasyonu/brainstorm.md"
  plan: "registry/P04-Category-Architecture/backlog/016-i18n-tam-kilitleme-ve-slug-konsolidasyonu/plan.md"
  review: "registry/P04-Category-Architecture/backlog/016-i18n-tam-kilitleme-ve-slug-konsolidasyonu/review.md"
---

# 🛠️ 016: i18n Tam Kilitleme ve Slug Konsolidasyonu

> **Bağımlılık:** P04/015 (SSR Slot Architecture) TAMAMLANMADAN bu göreve başlanamaz.
> **Vizyon Belgesi:** `architectural_vision_brainstorm.md` — Aşama 4 (Son Kilometre)
> **Bu görev, tüm P04 Category Architecture projesinin son mühürleme aşamasıdır.**

## 🎯 Hedefler
- [ ] Tüm View bileşenlerindeki hardcoded user-facing text'leri `useI18n()` altına al
- [ ] Eski Türkçe slugları (`fanlar`, `aksesuarlar`, `hava-perdeleri`) yeni standartlara dönüştür
- [ ] 301 redirect planı hazırla ve `next.config.js` redirects'e ekle (SEO sıralama koruması)
- [ ] Slug geçiş tablosunu oluştur ve DB migration ile kalıcı hale getir
- [ ] DB'deki `categories.slug` alanlarını güncelle (eski → yeni)

## ✅ Alt Görevler
- [ ] 1. Mevcut slug envanteri çıkar (DB'den tüm aktif slugları listele)
- [ ] 2. Yeni slug standardını belirle (İngilizce, kebab-case, tutarlı)
- [ ] 3. `next.config.js` → `redirects()` fonksiyonuna 301 yönlendirme ekle
- [ ] 4. DB Migration: `categories.slug` güncelleme
- [ ] 5. TSX dosyalarındaki hardcoded text'leri tara (grep ile)
- [ ] 6. Her bileşen için `useI18n()` entegrasyonu
- [ ] 7. `tr.ts` ve `en.ts` sözlüklerine eksik key'leri ekle
- [ ] 8. Build + Lint + SEO redirect testi
- [ ] 9. P04 projesini mühürle (tüm görevler completed)

## 🚩 Riskler
- Slug değişikliği Google indeksinde sıralama düşüşüne neden olabilir → 301 redirect ile azalt
- Sözlük dosyaları büyüdükçe bundle boyutu artabilir → tree-shaking kontrolü
- Eski bookmark'lar ve paylaşılmış linklerin kırılması → redirect ile çöz

## 🏁 Başarı Kriterleri
- Hiçbir TSX dosyasında kullanıcıya dönük hardcoded Türkçe/İngilizce metin kalmamalı
- Eski slug'larla yapılan istekler 301 ile yeni slug'a yönlenmeli
- `pnpm run build` → 0 hata
- Tüm P04 görevleri "Completed" statüsünde