---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\next.config.mjs
skeleton_hash: bb7b26f4927f7e09
entity_hashes:
  overview: ce293451cf435cb1
generated_at: 2026-06-08T09:00:15Z
---

## Genel Bakış
Bu modül, Next.js uygulamasının temel yapılandırma dosyasıdır. Bundle Analyzer ve Sentry entegrasyonlarını yapılandırarak production build performansı ile hata izleme (error monitoring) altyapısını yönetir. Tüm yapılandırma nesneleri üst seviye değişkenler olarak tanımlanmış olup, dosya kendi başına bir module olarak ihrac edilmektedir.

## Modül Yapısı
### Yapılandırma Bağımlılıkları
Uygulama dış bağımlılıklar olarak `@next/bundle-analyzer` ve `@sentry/nextjs` paketlerini içe aktarır.

### Tanımlı Yapılandırma Nesneleri
- `withBundleAnalyzer`: Bundle Analyzer eklentisini aktive eden sarmalayıcı (wrapper) fonksiyondur
- `nextConfig`: Next.js uygulamasının tüm ayarlarını içeren ana yapılandırma nesnesidir
- Dosya, `nextConfig` nesnesini `withBundleAnalyzer` ile sararak modül ihracatını (export) gerçekleştirir

---

## AXIOMS – Mimari Varsayımlar

Bu modül bir Next.js yapılandırma dosyasıdır (`next.config.mjs`). Aşağıdaki varsayımlar, verilen modül sabitlerine dayanmaktadır:

[Aksiyom 1]: Eğer `withBundleAnalyzer` fonksiyonu (paketi/ithalatı) mevcut değilse veya yüklenemiyorsa, modül yüklenme hatası (import error) ile başarısız olur.

[Aksiyom 2]: Eğer `nextConfig` nesnesi `export default` ile dışa aktarılmıyorsa, Next.js yapılandırma dosyasını okuyamaz ve uygulama başlatılamaz.

[Aksiyom 3]: Eğer `withBundleAnalyzer` bir sarmalayıcı (wrapper) fonksiyonu olarak `nextConfig` nesnesini alacak şekilde çağrılmıyorsa, bundle analizör entegrasyonu çalışır durumda olmaz.

[Aksiyom 4]: Eğer `nextConfig` nesnesi geçerli bir Next.js yapılandırma yapısına (geçerli anahtarlar ve değerler) uymuyorsa, Next.js build veya develop aşamasında yapılandırma hatası verir.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **withBundleAnalyzer** [env-backed] (call) — `bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer:...`
- **nextConfig** (object) — `{
    reactStrictMode: true,
    typedRoutes: true,
    images: {
       ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: next.config.mjs::redirects
- **params**: (yok)
- **ic_degiskenler**: (yok — fonksiyon doğrudan array literal döner)
- **Dönüş**: `Array<{ source: string, destination: string, permanent: boolean }>` — Türkçe kategori slug'larını İngilizce karşılıklarına yönlendiren kalıcı (301) redirect kuralları listesi. Toplam 13 redirect kuralı içerir; her kural bir `source` (eski Türkçe URL paterni, `:path*` wildcard'lı), bir `destination` (yeni İngilizce URL paterni) ve `permanent: true` alanlarından oluşur.

---

## NODE ID STANDARD

  file: next.config.mjs