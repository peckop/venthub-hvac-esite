---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\DistanceSalesAgreementPage.tsx
skeleton_hash: b87686df266773f0
generated_at: 2026-05-23T22:41:06Z
---

## Genel Bakış
Bu modül, VentHub HVAC platformunun hukuki içerikli sayfaları arasında yer alan mesafeli satış sözleşmesi sayfasını sunan React tabanlı bir görsel bileşendir. Kullanıcıların platformdaki satış süreçlerine ait yasal şart ve koşulları içeren sözleşme metnine erişmesini sağlamak amacıyla geliştirilmiştir.

## Fonksiyon Grupları
### Ana Sözleşme Sayfası Bileşeni
Modülün tek ve ana işlevi olarak, hukuki bölüm altında yayınlanan mesafeli satış sözleşmesi sayfasının tüm görünüm ve içerik sunumunu üstlenir. React bileşeni olarak çalışan bu fonksiyon, sayfanın platformun genel yapısıyla entegre şekilde çalışmasını sağlar.
- DistanceSalesAgreementPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı frontend projesinin legal kategorisinde yer alan mesafeli satış sözleşmesi sayfa modülünün doğru çalışması, projenin temel frontend altyapısı (routing, React runtime, ortak UI bileşenleri, yetkilendirme sistemleri) ile modülün uyumlu çalışmasına ve tüm bağımlılıkların erişilebilir olmasına bağlıdır.

[Aksiyom 1]: Eğer projenin rota (router) yapısında bu modül için tanımlanan path eşleştirmesi yoksa, kullanıcılar mesafeli satış sözleşmesi sayfasına hiçbir şekilde erişemez.
[Aksiyom 2]: Eğer bu sayfanın içe aktarması gereken ortak legal sayfa layout'u veya temel React runtime ortamı erişilebilir değilse, sayfa hiçbir şekilde kullanıcıya render edilemez.
[Aksiyom 3]: Eğer projenin yetkilendirme/erişim kontrol mekanizmasında bu sayfa için erişim kuralları tanımlanmamışsa, ya yetkisiz kullanıcılar sözleşme içeriğine erişebilir ya da yetkili kullanıcılar erişim hakkı olmasına rağmen sayfaya giremez.
[Aksiyom 4]: Eğer bu modül projenin üretim (production) build sürecinde uygulama bundle'ına dahil edilmemişse, canlı ortamda sayfa talepleri 404 bulunamadı hatası ile sonuçlanır.

---

## FONKSIYON DETAYLARI

### DistanceSalesAgreementPage
**Ne yapar**: VentHub HVAC projesinin yasal içerikler grubunda yer alan mesafeli satış sözleşmesi sayfası React bileşenidir. Platform üzerinden gerçekleştirilen tüm online satış işlemleri için kanunen zorunlu tutulan mesafeli satış sözleşmesi metinlerini, yasal uyarıları ve ilgili yönlendirmeleri son kullanıcılara sunan, tek başına çalışan bir görünüm bileşenidir. Sadece sözleşme içeriğini görüntülemekle görevli olup, kullanıcıdan herhangi bir işlem veya veri girişi beklemez.
**Nasıl yapar**: Projenin `src/views/legal/` dizininde konumlanan, React standartlarında yapılandırılmış bir fonksiyonel bileşen olarak çalışır. Projedeki diğer tüm yasal statik sayfalarla aynı mimari yapıyı izler, harici durum (state) bağımlılığı olmadan kendi statik içeriğini yöneterek kullanıcı arayüzünde sorunsuz bir şekilde işlenir. Herhangi bir API çağrısı veya dinamik veri işlemi yapmaz, tüm sözleşme içeriğini bileşen kapsamında barındırarak doğrudan görüntüler.
**Parametreler**:
- Tanımlı herhangi bir giriş parametresi bulunmamaktadır.
**Dönüş**: React.FC (React Fonksiyonel Bileşeni) tipi geçerli bir React node'u döndürür. Bu dönen değer, mesafeli satış sözleşmesi sayfasının tüm arayüz öğelerini ve içeriğini barındırır, tarayıcı DOM'ına işlenmek üzere React tarafından kullanılmak üzere tasarlanmıştır.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\legal\DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `legalConfig` — ../../config/legal konumundan import edilen, hukuki sözleşme metinlerinde kullanılacak sabit işveren ve site verilerini içeren config nesnesi
  - `legalConfig.sellerTitle` — Sözleşmenin "Taraflar" bölümünde satıcı olarak tanımlanan firmanın unvanı
  - `legalConfig.websiteUrl` — Firmanın e-ticaret faaliyetlerini yürüttüğü internet sitesi adresi, sözleşmenin birden fazla bölümünde site tanımı için kullanılır
  - `legalConfig.sellerAddress` — Satıcının genel iletişim amaçlı açık adresi, "Taraflar" bölümündeki iletişim bilgilerinde kullanılır
  - `legalConfig.sellerEmail` — Satıcının resmi iletişim e-posta adresi, hem iletişim bilgilerinde hem de cayma bildirimlerinin gönderileceği adres olarak kullanılır
  - `legalConfig.sellerPhone` — Satıcının iletişim telefon numarası, "Taraflar" bölümündeki iletişim bilgilerinde kullanılır
  - `legalConfig.taxOffice` — Satıcının bağlı olduğu vergi dairesi, "Taraflar" bölümündeki vergi bilgilerinde kullanılır
  - `legalConfig.taxNumber` — Satıcının vergi kimlik numarası, "Taraflar" bölümündeki vergi bilgilerinde kullanılır
  - `legalConfig.deliveryTime` — Sipariş onayından sonra ürünün kargoya verileceği maksimum süre, "Teslimat" bölümünde kullanılır
  - `legalConfig.returnAddress` — Ürün iadelerinin gönderileceği resmi adres, "Cayma Hakkının Kullanımı ve İade" bölümünde kullanılır
  - `legalConfig.cargoCompanies` — İade kargosu için anlaşmalı firma listesi, iade işlemleri bölümünde kullanılır
  - `legalConfig.refundTime` — Cayma bildiriminin ulaşmasından sonra ücret iadesinin yapılacağı maksimum süre, iade işlemleri bölümünde kullanılır
  - `legalConfig.lastUpdated` — Sözleşmenin son güncellenme ve yürürlüğe girme tarihi, "Yürürlük" bölümünde kullanılır
- **Dönüş**: Tüm Mesafeli Satış Sözleşmesi içeriğini ve uyarı metinlerini içeren React JSX elementi

---

## NODE ID STANDARD

  file: src\views\legal\DistanceSalesAgreementPage.tsx
  function: src\views\legal\DistanceSalesAgreementPage.tsx::DistanceSalesAgreementPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementPage