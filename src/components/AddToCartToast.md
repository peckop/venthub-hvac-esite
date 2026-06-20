---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\AddToCartToast.tsx
skeleton_hash: df3d9a7b91ba0e22
entity_hashes:
  func:AddToCartToast: 581f14d900d31bb4
  overview: 4631aecdd4e1b7b7
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T20:46:34Z
---

## Genel Bakış
Bu modül, kullanıcı sepete bir ürün eklediğinde kısa süreli bir bildirim (toast) gösteren tek bir React bileşenini içerir. Bileşen, bildirimin zamanlamasını, otomatik kaybolmasını ve kapatma eylemini kendi içinde yönetir.

## Fonksiyon Grupları
### Sepete Ekleme Bildirimi
Modül, sepete ekleme işlemi sonrasında kullanıcıya kısa süreli bir bildirim gösteren ana (ve tek) bileşeni tanımlar.
- AddToCartToast

---

## AXIOMS – Mimari Varsayımlar

Bu modül için mimari varsayımlar, yalnızca sağlanan fonksiyon imzaları ve modül sabitlerine dayanılarak çıkarılmıştır.

**[Aksiyom 1]:** `AddToCartToast()` fonksiyonu parametresiz olarak çağrılmalıdır. Eğer geçerli bir React bileşen referansı (fonksiyon) olarak çağrılmazsa, React Rendering Engine hata fırlatır.

**[Aksiyom 2]:** Modül sabit tanımlaması (module-level constant) bulunmamaktadır. Eğer modül genelinde paylaşılan yapılandırma sabitleri gerekliyse, bunlar ayrı bir konfigürasyon kaynağından (örn: ortam değişkenleri, context) sağlanmalıdır; aksi takdirde bileşen sabit değerlerle çalışır.

**[Aksiyom 3]:** Fonksiyon imzasında任何对外接口 (public API) parametresi tanımlanmamıştır. Eğer bileşenin dışarıdan veri alması (örn: ürün adı, eklendi sayısı) gerekiyorsa, bu veriler React Context, Redux, veya prop drilling dış mekanizması ile sağlanmalıdır; aksi takdirde bileşen dış girdi olmadan çalışır.

**[Aksiyom 4]:** Fonksiyon imzasında default değer tanımlanmamıştır. Eğer bileşen varsayılan davranışları (örn: otomatik kapanma süresi, bildirim metni) konfigure edilebilir olacaksa, bunlar bileşen içi sabit değerler veya dış kaynaklardan gelmelidir.

---

## FONKSİYON DETAYLARI

### AddToCartToast
**Ne yapar**: Sepete ekleme işlemi sonrası kullanıcıya gösterilen bir bildirim (toast) bileşenini oluşturur. Bu bildirim, kullanıcının sepete bir ürün eklediğini görsel olarak onaylar.
**Nasıl yapar**: React fonksiyonel bileşeni olarak tanımlanmıştır ve muhtemelen bir UI kütüphanesinden (örneğin, Chakra UI, Material UI) toast mekanizmasını kullanarak bildirim mesajını ve stilini yönetir. İçerisinde sepete eklenen ürünle ilgili kısa bir bilgi veya başarılı ekleme mesajı barındırabilir.
**Parametreler**:
- Bu fonksiyon herhangi bir parametre almaz.
**Dönüş**: React.FC — Sepete ekleme bildirimini temsil eden bir React fonksiyonel bileşeni döndürür.

---

## İTHALATLAR (IMPORTS)
- import: ./AddToCartToastContent::AddToCartToastContent
- import: @/types/ui-models::type { Product }
- import: react::React
- import: sonner::toast

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/AddToCartToast.tsx::AddToCartToast
- **params**: (yok)
- **ic_degiskenler**:
  (dış scope'ta doğrudan değişken yok — tüm mantık `useEffect` içinde)
- **Dönüş**: `null` — Saf controller bileşeni, DOM döndürmez; sadece event listener yönetimi yapar

---

## NODE ID STANDARD

  file: src\components\AddToCartToast.tsx
  function: src\components\AddToCartToast.tsx::AddToCartToast

---

## DISA AKTARILANLAR (EXPORTS)
  export: AddToCartToast

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)