# 🛰️ VentHub HVAC — Enterprise E-Commerce Platform

HVAC sektörüne özel, B2B/B2C karma satış mimarisi üzerine kurulu premium enterprise e-ticaret platformu.

---

## 📊 Teknoloji Yığını & Proje Metrikleri

| Katman | Teknoloji | Sürüm |
|---|---|---|
| Framework | Next.js (App Router, PPR) | **15.5.18** |
| UI Kütüphanesi | React | **19.0.0** |
| 3D Motor | Three.js / React Three Fiber | **0.183.2** / **9.5.0** |
| Animasyon | Framer Motion | **11.13.1** |
| Veritabanı & Auth | Supabase (SSR + JS Client) | **latest** |
| Stil Sistemi | TailwindCSS | **3.4.16** |
| Tip Güvenliği | TypeScript | **5.7.2** |
| Test Altyapısı | Vitest + Testing Library | **4.1.3** |
| Hata Takibi | Sentry | **8.54.0** |
| Paket Yöneticisi | pnpm | — |

> **🤖 AI Otonom Yetenek Sayısı:** Projede **29 adet** uzmanlaşmış `.agent/skills/` yeteneği aktiftir (performans, güvenlik, mimari, i18n, NotebookLM entegrasyonu, multi-agent orkestrasyon vb.).

### 🆕 Son Geliştirmeler
- ⚡ **3D Performans Optimizasyonu:** Canvas frameloop, DPR ve memo direktifleri optimize edildi; wildcard THREE importları seçici (selective) named import'lara dönüştürüldü.
- 📱 **Mobil Performans & Erişilebilirlik:** Ana sayfa mobil performansı ve erişilebilirlik iyileştirmeleri uygulandı.
- 🔧 **CI/CD İyileştirmesi:** Supabase migrate tetikleyicisi yalnızca veritabanı yollarına daraltıldı.
- 🧠 **Skill Değerlendirme Yükseltmesi:** Doğal dil sorguları ile skill eşleştirme kalitesi artırıldı; geçişli bağımlılık çözümlemesi ve daha sıkı kelime tokenizasyonu eklendi.

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

## 🏢 Multi-Tenant SaaS Architecture (Faz 1 — Foundation)
Platform, tek kiracılı (single-tenant) yapısını bozmadan, dinamik ve Edge-safe çözücüler ile **Çoklu Kiracılı (Multi-Tenant) SaaS altyapısına** başarıyla yükseltilmiştir:
*   🏢 **Kiracı İzolasyonu (Tenant Isolation):** Veritabanındaki 21 adet işlem tablosu `tenant_id` kolonu, foreign key indeksleri ve dynamic JWT `jwt_tenant_id()` RPC claim korumasıyla (108+ RLS politikası güncellenerek) %100 sızdırmaz hale getirilmiştir.
*   ⚡ **Edge-Safe Çözümleme (Tenant Resolution):** Edge Runtime üzerinde çalışan ve Vercel Edge Config / Redis destekli dynamic domain ve subdomain çözücü (`tenantResolver.ts`) ile kiracı çözümlenmektedir.
*   🔒 **Güvenli JWT Claims & Auth Sync:** Kullanıcı login/signup akışlarında Supabase Auth üzerinden otomatik kiracı claim enjeksiyonu ve profil eşleştirmesi trigger seviyesinde entegre edilmiştir.
*   📦 **Önbellek ve Realtime İzolasyonu:** ISR/unstable_cache katmanlarında `[key, lang, tenantId]` bazlı veri sızıntı koruması ve WebSocket stok/sipariş kanallarında tam kiracı bazlı yalıtım sağlanmıştır.

## 🔒 İstemci Mimarisi ve Güvenlik Yükseltmesi (Client Architecture & Security Upgrade)
Uygulamanın veri güvenliğini, çoklu kiracı (multi-tenant) izolasyonunu ve gerçek zamanlı haberleşme güvenliğini artırmak için **Supabase Client Factories & Security Upgrade** mimarisi entegre edilmiştir:

*   **Supabase İstemci Fabrikaları (`src/lib/supabase/`)**:
    *   **Browser Client (`client.ts`)**: İstemci tarafı (client-side) singleton nesnesi olup, `createBrowserClient` ile oluşturulur.
    *   **Server Client (`server.ts`)**: Her HTTP isteği için (per-request) `createServerClient` ve Next.js `cookies()` yardımıyla sunucu tarafında çalışan ve çerezleri otomatik yöneten istemcidir.
    *   **Static Client (`static.ts`)**: Çerez erişimi gerektirmeyen statik render (SSG) sınırlarında çalışan, `persistSession: false` yapılandırmalı `createClient` fabrikasıdır.
    *   *Not*: Eski `src/lib/supabase.ts` singleton'ından yapılan toplu exportlar (`export *`) kaldırılmış, servislerin doğrudan kendi dosyalarından ithal edilmesi (direct imports) zorunlu kılınmıştır.

*   **Bağımlılık Enjeksiyonu (Dependency Injection - DI) Servis Katmanı (`src/lib/services/`)**:
    *   Tüm servis fonksiyonları artık ilk parametre olarak `supabase: SupabaseClient<Database>` bağımlılığını zorunlu tutmaktadır. Modül düzeyinde statik istemci importları veya varsayılan (default) fallback istemciler tamamen kaldırılmıştır.
    *   **Çağırıcı Kuralları (Caller Conventions)**:
        *   **Client-Side (İstemci Tarafı)**: Bileşenler, hook'lar veya context'ler içinden yapılan servis çağrılarında ilk parametre olarak `supabaseBrowserClient` nesnesi geçilmelidir.
        *   **Server-Side (Sunucu Tarafı)**: Server Component'ler, Server Action'lar veya API rotalarında yapılan servis çağrılarında ilk parametre olarak `createSupabaseServerClient` (istek bazlı) veya `supabaseStaticClient` (statik render durumlarında) nesnesi geçilmelidir.

*   **Middleware Auth Guard**:
    *   Eski `getSession()` ve güvensiz `decodeJwt()` kullanımları tamamen kaldırılmıştır.
    *   Yetkilendirme ve rol doğrulaması, doğrudan Supabase Auth motoru üzerinde çalışan güvenli **`supabase.auth.getClaims()`** fonksiyonu ile claims bazlı RBAC (Role-Based Access Control) şeklinde güncellenmiştir.
    *   Yönlendirmelerde (redirect) `createServerClient` tarafından ayarlanan çerez ve başlıkların kaybolmasını önlemek için **Redirect Cookie/Header Replication** mekanizması eklenmiştir.

*   **Güvenli Çıkış Rota Yönlendiricisi (`src/app/auth/signout/route.ts`)**:
    *   Güvenli çıkış işlemleri için POST endpoint'i olarak tasarlanmıştır.
    *   `supabase.auth.getClaims()` ile aktif oturumu kontrol ettikten sonra `supabase.auth.signOut()` çağırır.
    *   `revalidatePath('/', 'layout')` ile sunucu önbelleklerini temizler ve istemciyi `/auth/login` sayfasına 302 yönlendirmesiyle gönderir.

*   **Realtime Kanal Güvenliği & RLS Migrasyonu**:
    *   WebSocket kanalları üzerinden veri sızıntılarını engellemek için `realtime.messages` tablosunda **Row Level Security (RLS)** aktif edilmiştir.
    *   `supabase/migrations/20260606180000_realtime_messages_rls.sql` migration'ı ile `realtime.messages` üzerinde SELECT ve INSERT işlemleri için sadece kimliği doğrulanmış (`authenticated`) kullanıcının `jwt_tenant_id()` değerinin, realtime kanal topic'i (`realtime.topic()`) içinde eşleştiği durumlara izin veren politikalar (RLS policies) uygulanmıştır.

## 🚀 Modern Enterprise Mimari Yapısı

VentHub HVAC platformu, modern web standartlarını ve maksimum hızı hedefleyen en güncel Next.js 15+ ve React 19 mimarisi üzerine inşa edilmiştir:

*   ⚡ **SSG + PPR (Partial Prerendering):** Dinamik bileşenler (ürün gridleri, filtreleme arayüzleri) `<Suspense>` sınırları ile sarmalanarak kısmi olarak yüklenirken; kritik sayfa kabukları (Hero, layout) statik olarak anında (LCP = 0) render edilir.
*   🌐 **i18n Sub-path Routing:** Uygulama, `src/app/[lang]/` alt-yol kurgusuyla tam çoklu dil desteğine (Türkçe/İngilizce) sahiptir. SEO kalitesi için dinamik kanonik URL'ler ve `sitemap.ts` üzerinde hreflang alternates metadata kurgusu aktiftir.
*   🌐 **Merkezi Rota Yerelleştirme (`useLocalizedRoutes`):** İstemci tarafı yönlendirme işlemlerinde kullanılan `useLocalizedRoutes` hook'u; dil segmetine (`tr`/`en`) duyarlı rota yardımcılarını (`Routes.home()`, `Routes.auth.login()` vb.) dinamik olarak çözümler. Bu sayede statik/sabit yönlendirme yollarının önüne geçilir ve middleware yönlendirmeleriyle senkronize çalışır.
*   ✍️ **Next.js Yazı Tipi Yükleme Yapılandırması (Inter Font & `--font-sans`):** `src/app/layout.tsx` dosyasında Next.js Google Fonts (`next/font/google`) ile yüklenen Inter değişken yazı tipi, `--font-sans` değişkeniyle (`variable: '--font-sans'`) projeye dahil edilir. Bu CSS değişkeni, hem `tailwind.config.js` (`fontFamily.sans` dizisi) hem de `src/index.css` (`html, body` kuralları) ile eşleştirilerek sayfa kayması (CLS) yaşanmadan pürüzsüz yazı tipi sunumu sağlar.
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