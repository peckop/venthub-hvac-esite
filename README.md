# 🛰️ VentHub HVAC — Enterprise E-Commerce Platform

HVAC sektörüne özel, B2B/B2C karma satış mimarisi üzerine kurulu premium enterprise e-ticaret platformu.

---

## 🦾 PROJE BELGE MERKEZİ (SCADA BİLGİ KÜTÜPHANESİ)

VentHub sistemine ait tüm işletim, mimari ve otonom kurallar **5 Ciltlik Master Kitaplık** altında birleştirilmiştir. Geliştiriciler ve yapay zeka ajanları için tek geçerli referans noktaları bunlardır:

1. 🧭 **[CİLT 1: Manifesto & Canlı Görev Durumu (PULSE)](file:///c:/Users/alize/venthub-hvac/.archive/legacy_ciltler/01_manifesto_and_pulse.md)**
   * Proje vizyonu, hesaplayıcı mantığı, kullanıcı profilleri ve `PULSE.md` canlı görev yönlendirmesi.
2. 🏗️ **[CİLT 2: Mimari Tasarım & Premium UI Standartları](file:///c:/Users/alize/venthub-hvac/.archive/legacy_ciltler/02_architecture_and_design.md)**
   * Next.js 15 SSR veri akışı, Supabase tiplemeleri, Slot Mimarisi (Anakart-Yuva) ve Typography/Design Scale.
3. 🦾 **[CİLT 3: AI Otonom Çalışma ve Operasyon Protokolleri](file:///c:/Users/alize/venthub-hvac/.archive/legacy_ciltler/03_ai_operating_protocols.md)**
   * AI anayasaları (Gemini/Agents/Claude), No-Plan-No-Code kuralları, Q-Validator V8 Otonom Motor iş akışları ve Model Context Protocol (MCP) aletleri.
4. 🚀 **[CİLT 4: Altyapı, Dağıtım ve Emniyet Protokolleri](file:///c:/Users/alize/venthub-hvac/.archive/legacy_ciltler/04_operations_and_deployment.md)**
   * CI/CD adımları, Vercel yapılandırması, Supabase Advisor emniyet tedbirleri ve Night Shift yönergeleri.
5. 🌡️ **[CİLT 5: HVAC Domain Bilgisi, Entegrasyonlar ve Yerelleştirme](file:///c:/Users/alize/venthub-hvac/.archive/legacy_ciltler/05_domain_knowledge.md)**
   * HVAC mühendislik hesaplama standartları (EN/ASHRAE), WhatsApp stok uyarıları, Resend e-posta şablonları ve SEO/i18n sözlüğü.

---

## 🚀 Modern Enterprise Mimari Yapısı

VentHub HVAC platformu, modern web standartlarını ve maksimum hızı hedefleyen en güncel Next.js 15+ ve React 19 mimarisi üzerine inşa edilmiştir:

*   ⚡ **SSG + PPR (Partial Prerendering):** Dinamik bileşenler (ürün gridleri, filtreleme arayüzleri) `<Suspense>` sınırları ile sarmalanarak kısmi olarak yüklenirken; kritik sayfa kabukları (Hero, layout) statik olarak anında (LCP = 0) render edilir.
*   🌐 **i18n Sub-path Routing:** Uygulama, `src/app/[lang]/` alt-yol kurgusuyla tam çoklu dil desteğine (Türkçe/İngilizce) sahiptir. SEO kalitesi için dinamik kanonik URL'ler ve `sitemap.ts` üzerinde hreflang alternates metadata kurgusu aktiftir.
*   📦 **unstable_cache & On-Demand ISR:** Sayfa verileri RAM/Disk üzerinde izole dil anahtarlarıyla (`getCachedHomeData` & `getCachedProducts`) önbelleğe alınır. Supabase veritabanında bir güncelleme olduğunda, tetiklenen **HMAC doğrulamalı** Supabase Webhook API'si üzerinden ilgili önbellek etiketleri (`tags`) anında temizlenir (Revalidate) ve sayfa anlık güncellenir.
*   🔒 **Güvenli RBAC & Middleware:** Sunucu tarafındaki istek yönlendirmeleri ve yönetici (admin) koruması, sub-path dillerini de destekleyecek şekilde gelişmiş middleware index offset güvenlik katmanıyla denetlenir.

---

## ⚙️ Hızlı Şantiye Komutları

### Yerel Çalıştırma
```bash
pnpm install
pnpm run dev
```

### Otonom Motor & Kalite Kontrolleri
```bash
# Oturumu ve planları otonom senkronize et
python registry/manage_registry.py normalize

# Son kalite testlerini çalıştır (Lint, TSC, Build)
pnpm run lint
pnpm exec tsc -b tsconfig.build.json
pnpm run build
```

---
*Bu tesis, hatasız ve sıfır basınç kayıplı hava akışı için modern standartlarla iklimlendirilmiştir.*