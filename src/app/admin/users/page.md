---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\admin\users\page.tsx
skeleton_hash: c5a526e3700ed168
entity_hashes:
  func:Page: c68e4a7cc2b89422
  overview: c697ddf7c92cfa4f
  style_tokens: f00e706f0d7166cc
generated_at: 2026-06-06T21:54:10Z
---

## Genel Bakış
Yönetim panelindeki kullanıcı yönetimi sayfasının Next.js App Router üzerindeki giriş noktasıdır. Tek bir React bileşeni olan Page fonksiyonu, istemci tarafında dinamik olarak yüklediği AdminUsersPage görünümünü render ederek kullanıcı listeleme ve yönetim arayüzünü sunar.

## Fonksiyon Grupları
### Sayfa Giriş Noktası
Rota karşılama sorumluluğunu üstlenen minimal giriş bileşenidir. Dış bağımlılığı olan AdminUsersPage modülünü dinamik olarak yükleyip tarayıcıya taşıyarak kullanıcı yönetim arayüzünün görünür hale gelmesini sağlar.
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül, Next.js App Router yapısı içinde tanımlanmış bir sayfa giriş noktasıdır. Fonksiyon gövdesi kodu sağlanmadığı için aksiyomlar, modülün yapısından ve Next.js App Router varsayımlarından türetilmiştir.

[Aksiyom 1]: Eğer `AdminUsersPage` bileşeni import edilemez veya mevcut değilse, `Page` fonksiyonu çalışırken derleme/runtime hatası oluşur.

[Aksiyom 2]: Eğer Next.js App Router yapısı bu dosyayı `/admin/users` rotasının giriş noktası olarak tanımıyorsa, bu sayfa tarayıcıda hiçbir zaman yüklenemez.

[Aksiyom 3]: Eğer istemci tarafı (client-side) bileşen yükleme mekanizması (örn: `dynamic()` import) çalışır durumda değilse, `AdminUsersPage` render edilmez ve sayfa boş kalır.

[Aksiyom 4]: Eğer `Page` fonksiyonu varsayılan olarak `export default` ile dışa aktarılmıyorsa, Next.js bu dosyayı geçerli bir sayfa bileşeni olarak algılamaz.

---

**Not:** Fonksiyon gövdesi kodu doğrudan sağlanmadığı için, bu aksiyomlar yalnızca Next.js App Router sayfa bileşenlerinin zorunlu yapısal gereksinimlerine dayanmaktadır. Modülün kendi iç mantığına (state yönetimi, veri çekme, hata işleme vb.) dair aksiyomlar, fonksiyon gövdesi olmadan üretilemez.

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Admin kullanıcı yönetim sayfasını render eden üst seviye bir Next.js sayfa bileşenidir. Bu fonksiyon, tarayıcıda `/admin/users` rotasına erişildiğinde çağrılır ve kullanıcı arayüzünün başlangıç noktasını oluşturur.

**Nasıl yapar**: Fonksiyon, herhangi bir mantıksal işlem yapmadan doğrudan `AdminUsersPage` bileşenini döndürür. Bu yapı, Next.js App Router mimarisinde sayfa bileşenlerinin standart kalıbına uygun olarak tasarlanmıştır ve sorumlulukları ayrı tutarak modülerlik sağlar.

**Parametreler**:
- Parametre almamaktadır.

**Dönüş**: `JSX.Element` — `AdminUsersPage` React bileşenini içeren JSX yapısı döndürür.

---

## SABİTLER
- **AdminUsersPage** (call) — `nextDynamic(
  () => import('../../../views/admin/AdminUsersPage'),
  { ssr...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/admin/users/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde hiçbir değişken tanımlanmamıştır)
- **Dönüş**: JSX — `AdminUsersPage` bileşeninin dinamik olarak yüklenmiş halini render eder. `nextDynamic` ile import edilen `AdminUsersPage` çağrısı sonucu elde edilen React bileşeni doğrudan return ile döndürülür.

---

## NODE ID STANDARD

  file: src\app\admin\users\page.tsx
  function: src\app\admin\users\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-center`, `text-slate-400`
- **Layout:** `p-8`
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `animate-pulse`