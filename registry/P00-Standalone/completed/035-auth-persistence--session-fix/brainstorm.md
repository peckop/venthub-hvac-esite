# 🧠 Beyin Fırtınası: Auth Persistence & Session Fix (035)

## 🔍 Sorun Analizi
Mevcut sistemde tek bir `supabase` istemcisi (`createClient`) kullanılıyor. Bu yapı Next.js 15'in Server Components mimarisiyle uyumlu değil.

**Temel Sorunlar:**
1. **Oturum Kopması (Session Drop):** `middleware.ts` eksikliği nedeniyle JWT token'ları yenilenmiyor.
2. **SSR Anonim İstekler:** Sunucu tarafındaki Supabase istemcisi cookie'lere erişemediği için tüm SSR isteklerini 'anonim' olarak yapıyor.
3. **Next.js 15 Async Cookies:** `cookies()` artık asenkron, mevcut yapı bunu desteklemiyor.

## 💡 Önerilen Çözümler

### 1. Modern Supabase SSR Yapısı
Supabase'in resmi `@supabase/ssr` paketini kullanarak (eğer yüklü değilse ekleyerek) üç farklı istemci yapısına geçmek:
- **Browser Client:** `createBrowserClient` (İstemci tarafı işlemleri için).
- **Server Client:** `createServerClient` (Server Components ve Server Actions için).
- **Middleware Client:** Oturumu her istekte canlı tutmak için.

### 2. Middleware Entegrasyonu
`src/middleware.ts` dosyası oluşturularak `supabase.auth.getUser()` üzerinden her request'te session tazelemesi yapılacak.

### 3. `src/lib/supabase.ts` Uyumluluğu
Mevcut kod tabanını kırmamak için `src/lib/supabase.ts` içindeki `supabase` export'u, çalışma ortamını tespit ederek uygun istemciyi dönecek bir "Proxy" veya "Wrapper" haline getirilecek.

## 🛠️ Teknik Detaylar
- **Paket Kontrolü:** `package.json` içinde `@supabase/ssr` var mı? (Kontrol edildi: EVET)
- **Next.js 15 Adaptasyonu:** `cookies()` çağrılarının `await` edilmesi. (Uygulandı)
- **Auth Listener:** Root layout'ta `onAuthStateChange` dinleyicisi ile cookie senkronizasyonu. (Uygulandı)

## ✅ Doğrulama Kriterleri
- [x] Sayfa yenilendiğinde oturumun korunması.
- [x] Server Component içinde `supabase.auth.getUser()`'ın doğru kullanıcıyı döndürmesi.
- [x] Token süresi dolduğunda middleware'in otomatik yenileme yapması.
