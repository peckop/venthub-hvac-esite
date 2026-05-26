---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\CategoryShowcaseCards.tsx
skeleton_hash: c9323980a66641e5
generated_at: 2026-05-23T22:26:04Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun ürünler bölümünde kullanılan bir React bileşenini barındırmaktadır. Ürün kategorilerini site kullanıcılarına kart formatında sergilemek amacıyla geliştirilmiştir, ürünler sayfasının kategori gösterimi bölümündeki temel yapıyı oluşturur.

## Fonksiyon Grupları
### Ana Sunum Bileşeni
Modülün tek ve ana işlevi olarak tüm kategori kartları sergileme sorumluluğunu üstlenen, React tabanlı kullanıcı arayüzü bileşenidir. Kategori içeriklerinin kullanıcıya sunulması için gerekli tüm görünüm ve temel işlevselliği barındırır.
- CategoryShowcaseCards

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC projesinde ürün kategorilerini kullanıcıya kart formatında sunmak üzere tasarlanmış bir React bileşenidir, çalışması için projenin React çalışma zamanı ortamına, üst bileşenlerden iletilen gerekli iş verilerine ve proje içindeki temel bağımlılıkların erişilebilir olmasına tamamen bağımlıdır.

[Aksiyom 1]: Eğer bu React bileşenini çalıştıracak uygun sürümde React çalışma zamanı ortamı yoksa, bu JSX tabanlı bileşen hiçbir şekilde derlenemez ve çalıştırılamaz, uygulama genelinde çalışma zamanı hatası fırlatır.
[Aksiyom 2]: Eğer bu bileşene üst bileşen tarafından gösterilecek kategori listesi ve her kategori için kart oluşturmak üzere gerekli temel veriler aktarılmazsa, ekranda hiçbir kategori kartı görüntülenemez, ilgili bölüm tamamen boş kalır.
[Aksiyom 3]: Eğer bu bileşenin import etmesi gereken ortak UI bileşenleri, stil dosyaları, statik asset altyapısı veya uygulama içi yönlendirme (routing) sistemi proje içerisinde çalışır/erişilebilir durumda değilse, kategori kartları görüntülenemez, stil kaybı yaşar ya da tıklama sonrası hedef kategori sayfasına yönlendirme işlemi hiç gerçekleşemez.

---

## FONKSIYON DETAYLARI

### CategoryShowcaseCards
**Ne yapar**: VentHub HVAC projesinin ürün bölümünde kullanılan, premium tasarımlı kategori vitrin kartları React bileşenidir. Kullanıcıların ürün kategorilerini kolayca keşfedip erişebilmesi için kart formatında yapılandırılmış bir sunum oluşturur. Next.js Image bileşeniyle resim optimizasyonları yapılarak performans odaklı çalışır, yüksek kaliteli izometrik ürün görselleri kullanarak profesyonel ve tutarlı bir görsel deneyim sunar.
**Nasıl yapar**: İç mantığında Next.js'in yerleşik resim optimizasyon özelliklerini kullanarak görsel yükleme sürelerini kısaltır, cihaz ekran boyutuna ve internet hızına uygun şekilde resimleri sunarak kullanıcı deneyimini iyileştirir. Tüm kategori kartlarında standart izometrik ürün renderları kullanarak modern, bütüncül bir görsel yapı oluşturur, herhangi bir dış bağımlılığa ihtiyaç duymadan bağımsız olarak çalışan bir bileşen olarak yapılandırılmıştır.
**Parametreler**:
- Bu bileşen herhangi bir giriş parametresi almaz, tüm içerik ve yapılandırmasını kendi içinde yönetir.
**Dönüş**: React.FC (React Fonksiyonel Bileşeni) türünde bir değer döndürür. Bu dönüş değeri, tarayıcı DOM'ına eklenerek son kullanıcıya kategorileri sergileyen etkileşimli arayüzü sunan geçerli bir React node'udur.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\CategoryShowcaseCards.tsx::CategoryShowcaseCards
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `Link` — Next.js istemci tarafı yönlendirme bileşeni, her kategori kartını ilgili kategori sayfasına bağlamak için kullanılır
  - `Image` — Next.js resim optimizasyonu sağlayan resim bileşeni, her karttaki ürün görsellerini yüklemek için kullanılır
  - `ChevronRight` — Lucide React kütüphanesinden sağ ok ikonu, kart altındaki "Keşfet" CTA butonlarında yönlendirme göstergesi olarak kullanılır
  - `Routes` — Uygulama rota yapısını yöneten yardımcı nesne, kategori sayfalarının rotalarını oluşturmak için `category` metodu üç kez çağrılır
- **Dönüş**: React JSX elementi, üç kategori ürün kartını içeren bölüm (section) bileşeni

---

## NODE ID STANDARD

  file: src\components\products\CategoryShowcaseCards.tsx
  function: src\components\products\CategoryShowcaseCards.tsx::CategoryShowcaseCards

---

## DISA AKTARILANLAR (EXPORTS)
  export: CategoryShowcaseCards

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
- **shadow:** (yok)
- **height:** `min-h-[140px]`
- **width:** (yok)
- **spacing:** (yok)
- **diğer:** `drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]`

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `bg-gradient-to-b`, `bg-white/5`, `border-slate-600/50`, `border-white/20`, `from-slate-700/80`, `text-center`, `text-cyan-400`, `text-gray-400`, `text-lg`, `text-sm`, `text-white`, `to-slate-900`, `via-slate-800`
- **Layout:** `flex`, `flex-1`, `flex-col`, `from-slate-700/80`, `gap-2`, `gap-5`, `grid`, `grid-cols-1`, `group-hover:scale-105`, `hover:shadow-2xl`, `items-center`, `justify-center`, `md:grid-cols-3`, `overflow-hidden`, `p-5`
- **Responsive:** `md:` prefix kullanımları
