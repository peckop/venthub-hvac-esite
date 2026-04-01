# 🧠 Brainstorming: P04/014 — Global Architectural Consolidation & i18n Finalization
> **Skill:** superpowers-brainstorm | **Model:** Antigravity (High) | **Tarih:** 2026-04-01
> **Yöntem:** Skill şablonu (Goal/Constraints... vd.)

## Goal
Kategori mimarisini Registry-bağımlı hardcoded yapıdan kurtarıp, Supabase (Database) kaynaklı `display_mode` otonomisine geçirmek ve Next.js 15 SSR geçişine (P04/015) tam uyumlu zemin hazırlamak.

## Constraints
- Veritabanı Seed (Update) işlemi, mevcut array'leri (showcase, landing) kusursuz capture etmeli ki canlıdaki gösterim temaları bozulmasın.
- `categoryRegistry.ts` kökten silineceği için projede bu listeye bağımlı tüm yerler (örn. `applicationLinks.ts`) Typescript veya Build hatası üretmeden dinamik/statik kurguya geçirilmelidir.
- Veritabanı manipülasyonları "Tahrip Edici Olmayan" (Non-Destructive) Add Column stratejisi ile uygulanmalı.

## Known context
- Şu anda `useCategoryViewModel` (UI Karar Mekanizması), devasa hardcoded array'ler ile hangi sayfanın "Siyah/Zengin (Showcase)" hangisinin "Ürün Bazlı (Landing)" açılacağına kod statik sınırlarıyla karar veriyor. Bu 015 numaralı hedefe göre bir "Anti-Pattern". 
- P04/015'in (Server Components Geçişi) hayata geçebilmesi için bu kararların veri tabanından HTML'e pompalanması bir önşarttır.

## Risks
- Çeşitli bileşenlerdeki `categoryRegistry` importlarının silme sonrasında gözden kaçması halinde `tsc` Linter mühürleme çökme riski.
- `display_mode` default olarak 'series' atanacağı için, DB Update skriptinde yazım hatası yapılan bir ana kategori "Showcase" tasarımından düşüp basit tasarıma yuvarlanabilir. 

## Options (2-4)
- **Option A (JSONB Metadata):** `display_mode` verisini mevcut JSONB `metadata` objesinin altında saklamak. *Dezavantajı:* Gelecekte SSR Query atarken JSON parse maliyeti ve ORM karmaşıklığı yaratır.
- **Option B (Separate TEXT Column):** Supabase `categories` tablosuna açık biçimde `display_mode TEXT` kolon açıp verileri direkt sütuna aktarmak. *Avantajı:* Supabase Server Client ile direkt anahtar okuması sağlar, milisaniyelik performanstır.

## Recommendation
**Option B (Separate TEXT Column)** kesinlikle önerilir. E-Ticaret sistemlerinde görünüm karar vericileri (display logic flag) ana kolon seviyesinde durduğunda SSR ve Edge Network hızı dramatik (olumlu) etkilenir. `useCategoryViewModel` içindeki hardcoded yapıların silinmesi LCP oranını iyileştirecektir.

## Acceptance criteria
1. Supabase `categories` tablosunda `display_mode` (TEXT) kolonu olması ve `showcase/landing` verilerinin Seed / Aktarım edilmiş olması.
2. `categoryRegistry.ts` dosyasının fiziksel olarak yok olması ve sıfır (0) bağımlılık bırakması.
3. `pnpm run build` komutunun "0 Error" vererek Sentinel Quality Gate aşamasını geçmesi.

## 🕵️ Terminal İzleri
- `view_file` ile useCategoryViewModel.ts incelendi.
- `grep_search` komutu ile mevcut bağımlılıklar sorgulandı.
- `run_command` üzerinden pnpm kontrolleri yapıldı.

<!-- ARTIFACT_SIGNATURE:1775041680:e47507d92d23624ac90761a9be10641bb9cabeda72b2648309136ee22145901a -->