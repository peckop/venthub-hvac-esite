# Brainstorm: 002 - Global i18n & Admin Panel Text Migration

## 🧠 ANALİZ
Admin paneli, projenin en yoğun veri girişinin yapıldığı ve hardcoded metinlerin en çok biriktiği alandır. Bu görev, bu teknik borcu temizlemeyi hedefler.

### Mevcut Sorunlar
- **Dil Tutarsızlığı:** Bazı yerler Türkçe, bazı yerler İngilizce (Supabase default hata mesajları gibi).
- **Tip Güvenliği Zafiyeti:** Admin sayfalarında `as any` kullanımı ve RPC sonuçlarının tipleme eksikliği.
- **Kullanıcı Deneyimi:** Formlardaki hata mesajları standardize edilmemiş.

### 💡 ÇÖZÜM YAKLAŞIMLARI
1. **Merkezi Sözlük:** `src/i18n/dictionaries/tr.ts` altında `admin: { ... }` objesi oluşturulmalı.
2. **Atomic Keys:** "Kaydet", "Sil" gibi genel metinler `common` grubunda, "Stok Seviyesi" gibi özele ait olanlar `admin.inventory` grubunda olmalı.
3. **Type-Safe RPC:** Supabase RPC çağrıları için interface'ler tanımlanmalı (`inventory_summary` view'ı gibi).

## 🚩 KRİTİK NOKTALAR
- **Geriye Dönük Uyumluluk:** Hardcoded metinleri silerken yanlışlıkla değişken isimlerini bozmamak.
- **A11y:** i18n taşınırken ARIA etiketlerini de aradan çıkarmak (Örn: `aria-label={t('admin.inventory.tableLabel')}`).

## 🏁 BAŞARI KRİTERLERİ
- Admin panelinde hiçbir `TSX` dosyasında tırnak içinde Türkçe metin kalmamalı.
- `pnpm exec tsc` raporunda admin klasörü altında 0 hata.
- Tüm butonlarda ve formlarda i18n tabanlı tooltip/etiket desteği.
