---
name: venthub-global-rontgen
description: 'Proje genelini radar ve rontgen komutlarıyla fiziki olarak tarar. Tetikleyicileri:
  rontgen, radar, global scan, linter check. Veritabanı sıfırlama, genel git işlemleri
  veya sadece birim testleri çalıştırmak amacıyla KULLANMAYIN.'
category: audit
metadata:
  triggers:
  - rontgen
  - radar
  - global scan
  - linter check
  inputs:
  - project codebase
  outputs:
  - rontgen-template.json log analysis
depends_on: []
next_steps:
- venthub-enterprise-audit
run_last: false
exclusions: []
---

# VentHub Global Röntgen & Review Skill (ZORUNLU JSON EDİSYONU)

## 🚨 YASAK (HALLUCINATION MÜHRÜ)
> [!CAUTION]
> **ZİHİNSEL TARAMA VE TAHMİN YASAKTIR!**
> Kullanıcı sizden bu skill'i kullanarak inceleme yapmanızı (röntgen, analiz) istediğinde; kafanızdan dosyaların bağlamını düşünüp *"Kodlar temiz görünüyor, sızıntı yok"* demek **kesinlikle yasaktır.** 
> Hiçbir denetim (röntgen) komut çalıştırılmadan ve somut log kanıtı elde edilmeden geçerli sayılamaz.

## 🎯 Çalışma Mantığı ve Zorunlu JSON Formu
Bu Röntgen skill'inin amacı, size tavsiye vermek değil, sizi fiziksel olarak kanıt toplamaya zorlamaktır. `venthub-global-rontgen` komutu geldiğinde **TÜM İŞLEMLERİ BIRAKIP** aşağıdaki adımları ŞU SIRAYLA uygulayacaksınız:

### 1. Şablonu Kopyala (rontgen-template.json)
İlk adım olarak, `.claude/skills/venthub-global-rontgen/rontgen-template.json` dosyasını bir taslak (scratch) olarak kopyalayın (veya okuyun). Göreviniz bu JSON'ı **terminal komutlarının birebir sonuçlarıyla** doldurmaktır. 

### 2. Radarları Çalıştır (Mekanik Tetikleyiciler)
JSON içindeki maddeleri kafanızdan değil, `run_command` üzerinden şu komutları sırayla göndererek doldurun:
- **Lint:** `npm run lint` veya `pnpm run lint`
- **Compiler:** `npx tsc --noEmit`
- **Build:** `npm run build`

### 3. [ZORUNLU] Post-Scan Audit Checklist (Yorumlama ve Çapraz Doğrulama)
> [!CAUTION]
> **YALNIZCA SCRIPT'E GÜVENMEK YASAKTIR!** Yukarıdaki `.py` scriptleri veya derleyiciler 0 hata (PASS) verebilir. Ancak kod mimari olarak delik deşik olabilir. Her röntgen/Mr taramasının ardından şu "Cross-Check" (Yorumlama) aşamasını manuel olarak yapmalısın:

**A. Zorunlu Grep Taramaları (`grep_search` aracıyla):**
- `getProductBySlugOrId` (Sadece legacy katmanda kalmalı, UI/View katmanında BLOCKED sebebidir. Yerine sadece getProductBySlug kullanılmalı.)
- `href="/category` veya `` `/category/` `` (SSOT delinmesidir, `Routes.category` kullanılmalıdır)
- `href="/products` veya `` `/products/` `` (SSOT delinmesidir, `Routes.product` kullanılmalıdır)
- `slug || id` benzeri fallback'ler.

**B. Kritik Dosya Gözden Geçirmesi (`view_file` ile okuyun):**
- `src/utils/routes.ts` (SSOT'in merkezi burası olmalı)
- `src/middleware.ts` (Edge runtime, JWT vs.)
- `src/app/products/[slug]/page.tsx`
- `src/app/category/[categorySlug]/page.tsx`

**C. Çapraz Doğrulama Soruları (Cevaplanmadan JSON kapatılamaz):**
- `middleware.ts` içindeki login path ile `routes.ts` içerisindeki login path eşleşiyor mu?
- Ürün route'ları kesinlikle ve sadece **slug-only** mi davranıyor?
- `<script type="application/ld+json">` içerisindeki product url sadece slug mı üretiyor?

### 4. Çıktı Üret (Zorunlu JSON Kanıtı)
Tüm komutları ve **Post-Scan Audit Check** (Çapraz Doğrulama) aşamasını tamamladıktan sonra kullanıcıya "Her şey temiz" demek yerine, doldurduğunuz (ve komut sonuçlarını kanıt olarak içeren) **JSON formatını bir Artifact olarak üreterek** sunun.

**Eğer bir komut Exit Code 1 verirse VEYA Cross-Check'te hardcoded SSOT sızıntısı yakalanırsa:**
Bu json objesindeki `"status"` kısmını `FAIL` yapın, `"evidence"` kısmına kanıtı anında yazın ve `overall_ship_status`'u `BLOCKED` yapın. Sorunları kendi inisiyatifinizle gizlemeyin veya "Önemsiz" diye atlamayın!

### 📋 Ekstra Denetim İpuçları (JSON'ı Doldururken Rehber Al)
Komutlarla tarama yaparken radarınızın özellikle şunları yakaladığından emin olun:
1. **[Yeni Kural] SEO ve JSON-LD UUID Sızıntıları:** Artık `<script type="application/ld+json">` içinde `prod.slug || prod.id` mantığı yasaktır! Yalnızca slug kullanılabilir. Ayrıca arama motoru örümceklerinin SEO yapısal verilerini izole görmesini önlemek için her üretilen nesneye `isPartOf: { "@id": "${SITE_URL}/#website" }` şeklinde bir **Canonical URI Düğümü** (Knowledge Graph kuralı) eklenmesi zorunludur.
2. **[Yeni Kural] JWT ile Middleware:** Edge Runtime veritabanı yorgunluğunu sevmez. Rol kontrolü **`app_metadata`** claims üzerinden yapılmalıdır (ör. `supabase.auth.getClaims()` ile `data?.claims?.user_role`). `user_metadata`/`raw_user_meta_data` üzerinden yetki kararı YASAKTIR (kullanıcı düzenleyebilir). DB fetch'i görürsen raporla!
3. **Hardcoded String Yasağı:** `Routes.product(slug)` veya `Routes.category(slug)` gibi kütüphane fonksiyonları varken UI'da `href="/category/{slug}"` yazan her kod BLOCKED nedenidir.
4. **Hydration ve CLS:** Görsellerin (img) boyutu/genişliği boş bırakılamaz. Dinamik veri beklenirken iskelet (Skeleton) yoksa raporla.
5. **Type Any Yasaktır:** Tip esnemelerine tolerans gösterilemez.

### 🏎️ FERRARİ X-RAY STANDARTLARI (KURUMSAL E-TİCARET KATI KURALLARI)
Kullanıcı "Röntgeni Çek" veya "Enterprise düzeyde değerlendir" dediğinde aşağıdaki 3 "Piston ve Şase" kuralını kesinlikle denetim JSON'una dahil et:
- **CSS ve Animasyon Yamaları:** Performansı katleden `framer-motion` kütüphanesi sızıntıları aranmalı. İşe yaramayan veya yavaşlatan animasyonların Vanilla CSS veya Tailwind tabanlı olduğundan emin olunmalı. Gelişigüzel yazılmış karmaşık inline `style={{}}` kodları mimari zaafiyettir, tespit et!
- **State Yönetimi ve "use client" Darboğazı:** E-ticaretin omurgası Server-Side Rendering (SSR) olmalıdır. Bir `layout.tsx` veya koskoca bir `Page` wrapper'ı sırf ufacık bir buton için `"use client"` yapılmışsa, o dosya BLOCKED sebebidir. State'ler yaprak (en alt) izolasyonda tutulmalıdır.
- **Slug ve Rota Disiplini:** Hardcoded `href` içeren her bağlantı, SEO zayıflığıdır. Tüm rotasyonlar `Link` bileşeni üzerinden merkeze bağlı olarak yapılmış mı denetle.

---
**Özet Kural:** 
Sisteme yalan söyleyemezsin. Gözle baktığın hiçbir şeye `PASS` verme, yalnızca `run_command`, `grep_search` verilerine ve terminal loglarına güven!
6. **CORS Wildcard:** Auth endpoint'lerde Access-Control-Allow-Origin: * varsa → BLOCKED.
7. **service_role Sızıntısı:** NEXT_PUBLIC_ prefix'i ile service_role anahtarı kullanılıyorsa → BLOCKED.
8. **Hreflang Kontrolü:** /tr ve /en sayfalar varsa hreflang self-referencing ve reciprocal olmalı.
9. **Veri Bütünlüğü:** UI'da "NaN", "undefined", "[object Object]" kalıntısı → WARNING.
10. **İyzico İdempotency / Replay Guard:** İyzico ödeme akışında (ödeme başlatma ve webhook uçlarında) idempotency/replay guard — `conversationId` + timestamp kontrolü — yoksa → BLOCKED.

### 🛠️ Next.js 15, PPR, Webhook ve Supabase İleri Seviye Röntgen Kuralları (Enrichment v3)
11. **Dinamik PPR ve Suspense Sınırı:** `useSearchParams` hook'u kullanan client bileşenleri (filtreler, arama kutusu vb.), SSR zehirlenmesini engellemek için `<Suspense fallback={<Skeleton />}>` sarmalayıcısına sahip olmalıdır.
12. **Webhook HMAC Doğrulaması:** `/api/webhook/supabase` ve kargo/ödeme webhook uç noktalarında `hmacValid` veya signature hash doğrulaması aranmalıdır.
13. **Alternates Language Sitemap SEO alternates:** `sitemap.ts` üzerinde Türkçe/İngilizce alternatifleri (`alternates: { languages: { tr: '...', en: '...' } }`) bulunmalıdır.
14. **Supabase Altın Üçlü Zinciri:** Migration SQL scriptlerinde `GRANT`, `ENABLE ROW LEVEL SECURITY` ve `CREATE POLICY` zincirinin sırayla uygulandığı denetlenmelidir. `user_metadata` yerine `app_metadata` kullanılmalıdır.
15. **`unstable_cache` Dil İzolasyonu (Cache Collision Guard):** `unstable_cache` kullanımlarında `cache_keys` dizisi içinde `lang` veya `locale` parametresinin dinamik olarak geçildiği denetlenmelidir.
16. **Edge Functions "Black-Box" İzolasyon Taraması:** Sipariş/bildirim Edge Function dosyalarında, veritabanından `user_locale` okumasının yapıldığı ve e-postaların bu dile göre süzüldüğü teyit edilmelidir.
17. **Middleware Offset Koruması:** `src/middleware.ts` içinde salt `segments[0]` kullanımını engelleyerek dil segmentini offset'leyen gelişmiş rota analizi denetlenmelidir.
