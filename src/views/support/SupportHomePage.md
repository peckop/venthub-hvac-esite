---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\support\SupportHomePage.tsx
skeleton_hash: a7680126eb44d722
generated_at: 2026-05-23T22:42:07Z
---

## Genel Bakış
Bu modül, Venthub HVAC projesinin destek bölümünün ana giriş sayfasını oluşturan React tabanlı ön yüz bileşenini barındırır. Kullanıcıların destek kaynaklarına, yardım araçlarına ve iletişim kanallarına erişmesini sağlayan ana arayüzü hayata geçirmekle sorumludur.

## Fonksiyon Grupları
### Ana Destek Sayfası Bileşeni
Destek bölümünün kullanıcıyla ilk karşılaşılan ana arayüzünü oluşturur, tüm destek içeriklerini bir araya getirerek eksiksiz bir deneyim sunar.
- SupportHomePage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı destek ana sayfası görüntüleme bileşeninin doğru şekilde render edilmesi ve çalışması için projenin frontend derleme ve çalışma zamanı altyapısının belirli zorunlu koşulları sağlaması gerekmektedir.

[Aksiyom 1]: Eğer uygulama çalışma ortamında React runtime ortamı aktif ve erişilebilir değilse, bu fonksiyonel bileşen hiçbir şekilde DOM'a eklenip kullanıcıya sunulamaz, çalışma zamanı hatası oluşur.
[Aksiyom 2]: Eğer uygulamanın rota yönetim (routing) mekanizması bu bileşeni destek ana sayfası için yapılandırılmış rota ile ilişkilendirmediği takdirde, kullanıcı bu sayfaya hiçbir şekilde erişemez.
[Aksiyom 3]: Eğer projenin TypeScript derleyicisi bu TSX modülünü hatasız derleyemiyorsa, modül üretim ortamına aktarılamaz, derleme aşamasında süreç sonlanır.
[Aksiyom 4]: Eğer bu modülün proje içindeki `src/views/support/` dosya yolu, proje derleme yapılandırmasında tanımlı kaynak yolları arasında yer almıyorsa, modül uygulama tarafından import edilemez, hiçbir yerde çağrılamaz.

---

## FONKSIYON DETAYLARI

### SupportHomePage
**Ne yapar**: VentHub HVAC projesinin destek modülünün ana giriş sayfasını oluşturan React fonksiyonel bileşenidir. Genel domain kapsamında yer alan projenin destek süreçlerinin kullanıcıya sunulduğu ana arayüz olarak görev alır, destek sistemiyle ilgili tüm içerik ve alt işlevlerin barındığı ana sayfayı oluşturur.
**Nasıl yapar**: TypeScript ile tanımlanmış bir React bileşeni olarak projenin kaynak kod ağacında `src/views/support` dizini altında konumlanmıştır. Projenin dosya organizasyon standartlarına uygun şekilde destek modülünün ana bileşeni olarak yapılandırılmıştır, yalnızca kendi kapsamındaki React elementlerini render edecek şekilde tasarlanmıştır.
**Parametreler**: Bu fonksiyona herhangi bir parametre aktarılmaz.
**Dönüş**: React.FC türünde bir değer döndürür. Bu dönüş değeri, tarayıcıda render edilebilir React elementlerini barındıran standart React fonksiyonel bileşen nesnesidir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\support\SupportHomePage.tsx::SupportHomePage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hook'undan alınan çeviri fonksiyonu, tüm arayüz metinlerinin yerelleştirilmesi için kullanılır
  - `cards` — destek sayfasında gösterilen yönlendirme kartlarını içeren dizi, her elemanın başlık, açıklama, rota ve ikon alanları bulunur
  - `router` — useRouter hook'undan alınan Next.js yönlendirme nesnesi, geri dönüş butonunda `router.back()` çağrısı için kullanılır
- **Dönüş**: JSX React elementi (Support ana sayfa arayüzü)

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\support\SupportHomePage.tsx::cards_map_callback
- **params**: `{ title, desc, to, icon: Icon }` — döngüdeki tek kart nesnesinin yıkımlanmış alanları
- **ic_degiskenler**:
  - `title` — kartın başlık metni, arayüzde kullanıcılara gösterilir
  - `desc` — kartın açıklama metni, arayüzde kullanıcılara gösterilir
  - `to` — kart tıklandığında yönlendirilecek uygulama rotası
  - `Icon` — kartta gösterilecek Lucide ikon bileşeni
- **Dönüş**: Link sarmalında tek kart JSX bileşeni

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\support\SupportHomePage.tsx::whatsapp_render_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `whatsappLink` — `getSupportLink` fonksiyonu ile oluşturulan WhatsApp iletişim linki, iletişim butonunun href özelliğine atanır
- **Dönüş**: WhatsApp destek bloğu JSX elementi veya link geçersizse null

---

## NODE ID STANDARD

  file: src\views\support\SupportHomePage.tsx
  function: src\views\support\SupportHomePage.tsx::SupportHomePage

---

## DISA AKTARILANLAR (EXPORTS)
  export: SupportHomePage