---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\siteUrl.ts
skeleton_hash: 9433c118e7c584d4
entity_hashes:
  func:getSiteUrl: d80f85481d8cb42c
  overview: 90b68bbba66e5b1c
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin konfigürasyon katmanında yer alan site URL yönetimi modülüdür. Uygulama genelinde tutarlı ve çalışma ortamına uygun site adresi kullanımını sağlamak amacıyla tasarlanmıştır. Tüm proje kapsamında ihtiyaç duyulan site URL'sini tek bir merkezden sunarak tutarsız URL tanımlamalarının önüne geçer.

## Fonksiyon Grupları
### Site URL Erişim Fonksiyonları
Uygulamanın tüm bileşenleri için geçerli, ortama uygun site URL'sini güvenli ve erişilebilir hale getirmekle sorumludur.
- getSiteUrl

---

## AXIOMS – Mimari Varsayımlar

Bu modül, uygulama genelinde kullanılmak üzere site URL'sini sağlayan konfigürasyon modülüdür.

[Aksiyom 1]: Eğer `SITE_URL` sabiti modül kapsamında tanımlı/expo edilmemişse, `getSiteUrl()` fonksiyonu geçerli bir URL döndüremez.

[Aksiyom 2]: Eğer `getSiteUrl()` fonksiyonu modül tarafından export edilmemişse, diğer modüller site URL'sine erişemez.

[Aksiyom 3]: Eğer `SITE_URL` içeriği geçerli bir URI formatında değilse (örn: `https://domain.com`), uygulama genelinde geçersiz URL kullanımı oluşur.

[Aksiyom 4]: Eğer `getSiteUrl()` çağrıldığında `SITE_URL`'a karşılık gelen değer `undefined` veya `null` ise,调用 yapan modül geçersiz bir URL ile çalışır.

---

## FONKSİYON DETAYLARI

### getSiteUrl
**Ne yapar**: VentHub HVAC projesinin yapılandırma katmanında yer alan bu fonksiyon, uygulama genelinde kullanılacak merkezi site adresine erişim sağlamak üzere tasarlanmıştır. Tüm modüller arasında tutarlı site URL'si kullanımını desteklemek amacıyla tek bir kaynaktan adres değerini çekmeyi hedefler. Uygulamanın farklı noktalarından site adresine ihtiyaç duyulduğunda merkezi yapılandırmaya erişim imkanı sunar.
**Nasıl yapar**: Proje deposu içerisinde `C:\Users\alize\venthub-hvac\src\config\siteUrl.ts` konumunda tutulan merkezi site URL yapılandırma dosyasına erişerek çalışır. İlgili dosya yolundaki yapılandırma verilerine ulaşan fonksiyon, iç mantığı ile site URL değerini elde ederek uygulamanın ihtiyaç duyduğu alanlara iletmek üzere yapılandırılmıştır. Dönüş tipi ile ilgili belirsizlik nedeniyle iç işleyişinde herhangi bir değer döndürme zorunluluğu bulunmamaktadır.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz, çalışması için herhangi bir harici veri girişi gerekmez.
**Dönüş**: Tanımında dönüş tipi void veya bilinmiyor olarak belirtilen bu fonksiyon, geriye herhangi bir kesin türde değer döndürmesi garantilenmemektedir. Çalışması sonrası hiçbir değer döndürmemesi (void durumu) olası olduğu gibi, henüz türü tanımlanmamış herhangi bir veri türünde değer döndürme ihtimali de bulunmaktadır, bu durum fonksiyonun geliştirme sürecinin devam ettiğine işaret edebilir.

---

## SABİTLER
- **SITE_URL** (call) — `getSiteUrl()`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\config\siteUrl.ts::getSiteUrl
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `process` — Node.js ortam nesnesi, tarayıcı/çalışma zamanı ortamında tanımlı olup olmadığı kontrol edilir, üzerinden ortam değişkenlerine erişilir
  - `process.env.NEXT_PUBLIC_SITE_URL` — Next.js genel site URL ortam değişkeni, tanımlıysa doğrudan dönüş değeri olarak kullanılır
  - `process.env.VERCEL_URL` — Vercel platform dağıtım domaini ortam değişkeni, tanımlıysa HTTPS şeması eklenerek dönüş değeri olarak kullanılır
- **Dönüş**: String tipinde site adresi; öncelikle tanımlıysa NEXT_PUBLIC_SITE_URL, sonra VERCEL_URL'den üretilen URL, hiçbiri yoksa varsayılan `http://localhost:3000` değeri döndürülür

---

## NODE ID STANDARD

  file: src\config\siteUrl.ts
  function: src\config\siteUrl.ts::getSiteUrl

---

## DISA AKTARILANLAR (EXPORTS)
  export: SITE_URL
  export: getSiteUrl