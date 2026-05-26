---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\ApplicationCards.tsx
skeleton_hash: 546a8c4566d1ccd8
generated_at: 2026-05-23T22:25:36Z
---

## Genel Bakış
VentHub HVAC platformunun ürünler bölümünde yer alan bu React modülü, ürünlerin farklı uygulama senaryoları ve kullanım alanlarını kart formatında kullanıcılara sunmak üzere tasarlanmıştır. Modül tek ana bileşen üzerinden çalışarak, ürün sayfalarında yer alacak uygulama kartları kümesini render eder ve platformun ürün bölümü görsel-işlevsel bütünlüğüne katkı sağlar.

## Fonksiyon Grupları
### Ana Bileşen
Modülün temel sorumluluğunu yerine getiren, tüm uygulama kartları yapısını oluşturan ve React ortamına sunan tek ana bileşeni barındırır.
- ApplicationCards

---

## AXIOMS – Mimari Varsayımlar
Bu uygulamalara özel kartları render eden React tabanlı bileşen, yalnızca modül içindeki applications dizisinin erişilebilir olması ve React çalışma zamanının mevcut olması koşuluyla doğru şekilde çalışır.

[Aksiyom 1]: Eğer modülün sabiti olan applications dizisi tanımlı değilse veya erişilemez durumdaysa, bileşen hiçbir kart içeriği üretemez ve boş bir çıktı döndürür.
[Aksiyom 2]: Eğer ApplicationCards bileşenini çalıştıracak React uyumlu çalışma zamanı ortamı mevcut değilse, bileşen hiçbir şekilde yüklenemez, initialize edilemez ve sayfada görüntülenemez.
[Aksiyom 3]: Eğer applications dizisi içinde geçersiz elemanlar (null, tanımsız veya uygun tipten olmayan değerler) varsa, bileşen render sırasında çalışma zamanı hatası fırlatır.

---

## FONKSIYON DETAYLARI

### ApplicationCards
**Ne yapar**: VentHub HVAC projesinin Products Hub bölümünde kullanılan uygulama alanı kartları bileşenidir, yüksek performanslı e-ticaret senaryoları için özel olarak optimize edilmiştir. Ürünlerin hangi kullanım alanlarında faaliyet gösterebileceğini görsel olarak kullanıcılara sunmak amacıyla geliştirilmiştir.
**Nasıl yapar**: Next.js'in yerleşik Image bileşenini kullanarak kartlarda yer alan görsellerin yükleme performansını artırır, rafine edilmiş düzen ayarlarıyla farklı ekran boyutlarında tutarlı ve kullanıcı dostu bir görünüm sunar. React tip sistemiyle tip güvenliği sağlanarak projenin bileşen yapısıyla sorunsuz entegre çalışacak şekilde yapılandırılmıştır.
**Parametreler**:
- Herhangi bir giriş parametresi almaz, bağımsız olarak çalışır ve kendi içindeki içeriklerle uygulama alanı kartlarını render eder.
**Dönüş**: React.FC tipinde bir React bileşeni döndürür, bu dönüş değeri sayesinde bileşen projenin ilgili sayfalarında import edilerek kolayca entegre edilebilir ve ekranda gösterilebilir.

---

## INTERFACES

### ApplicationCard
- `id: string`
- `title: string`
- `description: string`
- `icon: React.ReactNode`
- `image: string`
- `href: string`

---

## SABİTLER
- **applications** (array) — `[
    {
        id: 'restoran',
        title: 'Restoran Uygulamaları',
 ...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/products/ApplicationCards.tsx::ApplicationCards
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `applications` — Uygulama kartlarında gösterilecek tüm verileri tutan sabit array, üzerinde map ile iterasyon yapılarak her eleman için ayrı kart oluşturulur
- **Dönüş**: React JSX elementi, ana bölüm kapsamında tüm uygulama kartlarını içeren ana component çıktısı

### [N2_NASIL] AST Pointer: src/components/products/ApplicationCards.tsx::applications.mapCallback
- **params**: [app]
- **ic_degiskenler**:
  - `app.id` — Link componentine benzersiz key olarak atanan uygulama kimliği, 'restoran' değeriyle ilk görüntülenen karttaki Image'e priority özelliği eklemek için kullanılır
  - `app.href` — Link componentinin yönlendireceği rota olarak kullanılan uygulama detay sayfası adresi
  - `app.image` — Next.js Image componenti tarafından yüklenen kart görselinin kaynak adresi
  - `app.title` — Image'in alt metni ve kart başlığı olarak kullanılan uygulama ismi
  - `app.icon` — Kartın üst sol köşesindeki kaplamada gösterilen uygulama kategorisini temsil eden Lucide ikonu
  - `app.description` — Kart içeriğinde açıklama metni olarak kullanılan uygulama tanımı
- **Dönüş**: Tüm içeriği dolu, tek uygulama için oluşturulmuş React JSX Link elementi

---

## NODE ID STANDARD

  file: src\components\products\ApplicationCards.tsx
  function: src\components\products\ApplicationCards.tsx::ApplicationCards

---

## DISA AKTARILANLAR (EXPORTS)
  export: ApplicationCards

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gray-100`, `bg-white`, `bg-white/90`, `border-gray-100`, `text-base`, `text-gray-500`, `text-industrial-gray`, `text-primary-navy`, `text-sm`, `text-xl`
- **Layout:** `absolute`, `backdrop-blur-sm`, `flex`, `flex-1`, `flex-col`, `gap-2`, `gap-6`, `grid`, `grid-cols-1`, `group-hover:opacity-100`, `group-hover:scale-105`, `group-hover:scale-110`, `group-hover:text-primary-navy`, `group-hover:translate-x-1`, `h-10`
- **Responsive:** `lg:`, `sm:` prefix kullanımları
