---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\support\WarrantyPage.tsx
skeleton_hash: 376a0032fc5a64a2
generated_at: 2026-05-23T22:42:20Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun destek bölümünde yer alan garanti sayfasını oluşturan React tabanlı kullanıcı arayüzü bileşenidir. Kullanıcılara garanti süreçleri, kapsamları ve ilgili bilgilere erişim sunacak arayüzü yüklemekle sorumludur. Destek bölümünün gezinme yapısı içinde garanti ekranını kullanıcılara sunan tek bileşen modülünü barındırır.

## Fonksiyon Grupları
### Ana Garanti Sayfası Bileşeni
Modülün temel sorumluluğu olan garanti sayfasının oluşturulması ve kullanıcıya sunulması için gerekli ana React bileşenini içerir. Tüm sayfa arayüzünü ve işlevselliğini yöneten tek bileşen bu grupta yer alır.
- WarrantyPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı frontend garanti sayfası bileşeninin, HVAC platformu içerisinde sorunsuz çalışması için kendi çalışma zamanı ortamına, tüm proje içi paylaşılan bağımlılıklarına ve erişmesi gereken servislere sürekli erişebilmesi zorunludur.

[Aksiyom 1]: Eğer React 16.8+ sürümü (Hooks desteği içeren temel çalışma zamanı ortamı) yoksa, bu bileşen hiçbir şekilde render edilemez, sayfa yüklenememe hatası oluşur.
[Aksiyom 2]: Eğer bu bileşenin kullanması gereken proje genelindeki paylaşılan UI bileşenleri (header, footer, navigasyon elemanları vb.) erişilemez durumdaysa, WarrantyPage düzeni bozulur, eksik görsel öğelerle kullanıcıya sunulur.
[Aksiyom 3]: Eğer platformun kullanıcı oturum doğrulama (auth) servisine erişim yoksa, yetkili kullanıcı tanımlaması yapılamadığı için kişiye özel garanti verileri çekilemez, ya yetkisiz erişime açık hale gelir ya da hata mesajıyla kullanıcıyı karşılar.
[Aksiyom 4]: Eğer garanti verilerini sunan backend API servisine erişim yoksa, sayfada hiçbir geçerli garanti bilgisi gösterilemez, kullanıcı boş veya hata içeren bir ekranla karşılaşır.
[Aksiyom 5]: Eğer TypeScript derleme sürecinde bu modül için gerekli tüm tip tanımları sağlanmamışsa, proje derlemesi başarısız olur, bu sayfa üretim ortamına aktarılamaz.

---

## FONKSIYON DETAYLARI

### WarrantyPage
**Ne yapar**: VentHub HVAC projesinin destek modülü kapsamında sunulan garanti sayfasını oluşturan ana React bileşenidir. Kullanıcılara HVAC cihazlarının garanti koşulları, garanti sorgulama, garanti talebi oluşturma gibi garanti ile ilgili tüm hizmetleri sunan arayüzü işletir, projenin destek rotasında yüklenen ana sayfa bileşeni olarak görev alır.
**Nasıl yapar**: TypeScript tabanlı React fonksiyonel bileşeni olarak yapılandırılmış, projenin src/views/support/WarrantyPage.tsx dosyasında konumlanmıştır. Kendi kapsamında gerekli state, veri çekme işlemleri ve kullanıcı etkileşimi işleyicilerini yöneterek garanti sayfasının tüm içeriklerini oluşturur, React'in bileşen yaşam döngüsüne uygun olarak sayfa yüklendiğinde gerekli hazırlıkları tamamlayıp arayüzü kullanıcıya sunar.
**Parametreler**:
- Herhangi bir giriş parametresi almaz.
**Dönüş**: React.FC tipinde React fonksiyonel bileşen nesnesi döndürür. Bu döndürülen bileşen, garanti sayfasının tüm DOM yapısını ve işlevselliğini içerir, uygulamanın yönlendirme sistemi tarafından çağrıldığında tarayıcıda ilgili garanti sayfası içeriğinin görüntülenmesini sağlar.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\support\WarrantyPage.tsx::WarrantyPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `router` — Next.js `useRouter` hook'u ile oluşturulan yönlendirme nesnesi, geri butonuna tıklandığında önceki sayfaya dönmek için `router.back()` metodu çağrılır
  - `t` — `useI18n` hook'undan alınan çeviri fonksiyonu, tüm UI metinlerini ilgili dilde getirmek için kullanılır; `t('auth.back')`, `t('support.links.warranty')`, `t('support.warranty.desc1')`, `t('support.warranty.desc2')` anahtarları ile çeviri çağrıları yapılır
  - `ArrowLeft` — lucide-react'ten import edilen ok ikonu bileşeni, geri dönüş butonunda gösterilir
- **Dönüş**: Garanti sayfası arayüzünü oluşturan React JSX yapısı

---

## NODE ID STANDARD

  file: src\views\support\WarrantyPage.tsx
  function: src\views\support\WarrantyPage.tsx::WarrantyPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: WarrantyPage