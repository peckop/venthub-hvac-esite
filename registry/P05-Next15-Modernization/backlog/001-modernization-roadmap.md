# Project: P05-Next15-Modernization
Next.js 15 ve React 19 ile gelen devrimsel özelliklerin VentHub mimarisine entegrasyonu.

## 🎯 Hedef
Uygulamayı sadece "çalışır" durumdan, Next.js 15'in sunduğu en yeni performans ve güvenlik standartlarını kullanan "premium" bir seviyeye taşımak.

## ✅ Alt Görevler (Modernizasyon Adımları)
1. **[Backlog] 001-Server-Only-Lockdown:** Hassas veritabanı ve servis mantıklarını `server-only` paketi ile frontend'den izole et.
2. **[Backlog] 002-React19-Actions-Migration:** Form yönetimlerini (Giriş, Kayıt, Arama) `useActionState` ve `useFormStatus` ile modernize et.
3. **[Backlog] 003-After-API-Implementation:** Sipariş, loglama ve analitik gibi kullanıcıyı bekletmemesi gereken ağır işlemleri `after()` API'sine taşı.
4. **[Backlog] 004-Partial-Prerendering-PPR:** Kritik sayfalarda (Ürün Detay, Kategori) statik kabuk ve dinamik içerik ayrımını (PPR) devreye al.
5. **[Backlog] 005-Next-Dev-Turbo-Optimization:** Geliştirme ortamını Turbopack ile %100 uyumlu hale getir ve hata ayıklama sürelerini minimize et.

## 🧪 Doğrulama (Success Criteria)
- `pnpm build` sırasında herhangi bir async params veya static/dynamic uyuşmazlığının olmaması.
- Sayfa açılış hızlarında (LCP) PPR sayesinde %30+ iyileşme.
- Sunucu taraflı kodların frontend'e sızmadığının `server-only` ile kanıtlanması.
