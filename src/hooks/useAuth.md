---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\useAuth.ts
skeleton_hash: a4e9e5fa01c34aa4
generated_at: 2026-05-23T22:29:10Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin React tabanlı kullanıcı arayüzü katmanında kimlik doğrulama işlemlerini merkezi olarak yönetmek üzere tasarlanmış özel bir React hook'unu barındırır. Uygulamanın tüm bileşenleri tarafından tutarlı bir şekilde kullanılabilecek kimlik doğrulama verilerini ve işlevlerini tek bir kaynaktan sunar.

## Fonksiyon Grupları
### Merkezi Kimlik Doğrulama Yönetim Hook'u
Tüm kimlik doğrulama ile ilgili işlevleri, kullanıcı oturum durumunu ve yetkilendirme kontrollerini tek bir yapı altında sarmalayarak uygulamanın her yerinden erişilebilir hale getirir.
- useAuth

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı kimlik doğrulama özel hook'u, uygulamanın güvenli ve kesintisiz auth akışını sürdürebilmesi için üst düzey bağlam sağlayıcılarının, istemci depolama alanlarının ve bağlı rota koruma mekanizmalarının belirlenen standartlarda çalışmasını zorunlu kılar.

[Aksiyom 1]: Eğer uygulama bileşen hiyerarşisinde useAuth hook'unun tükettiği AuthProvider bileşeni, hook'u kullanan her bileşenin üst seviyesinde konumlanmamışsa, useAuth runtime hatası fırlatır, uygulama yüklenemez.
[Aksiyom 2]: Eğer AuthProvider tarafından context üzerinden iletilen oturum durumu, giriş/çıkış ve diğer kimlik doğrulama metodları standart sözleşmelere uygun olarak sunulmuyorsa, useAuth tarafından bu metotlara erişilemez, tüm kimlik doğrulama akışları çalışmaz.
[Aksiyom 3]: Eğer oturum kimlik bilgilerinin saklandığı istemci tarafı depolama alanı okuma/yazma izinlerine sahip değilse, useAuth oturum kalıcılığı sağlayamaz, sayfa yenilemelerinde kullanıcı oturumu beklenmedik şekilde sonlanır.
[Aksiyom 4]: Eğer uygulama içi rota koruma mekanizmaları useAuth tarafından döndürülen yetki ve oturum durumunu doğru şekilde kontrol etmiyorsa, yetkisiz kullanıcılar korumalı kaynaklara erişebilir, uygulama güvenliği ihlal edilir.

---

## FONKSIYON DETAYLARI

### useAuth
**Ne yapar**: React tabanlı HVAC uygulaması için geliştirilmiş özel kimlik doğrulama hook'udur, AuthContext'i güvenli bir şekilde tüketerek tüm kimlik doğrulama ile ilgili durum ve işlemleri kullandığı bileşene sunar. AuthProvider bileşeninin kapsamı dışında çağrıldığında, statik derleme, izole test gibi ortamlarda çalışma zamanı hatalarının oluşmasını engellemek için hiçbir işlem yapmayan güvenli bir geri dönüş nesnesi döndürür.
**Nasıl yapar**: React'in yerleşik useContext hook'u ile tanımlı AuthContext'i çeker ve context'in geçerliliğini kontrol eder. Eğer AuthProvider kapsamı dışında çağrıldığı için context erişilemezse, tüm gerekli özellikleri barındıran ancak hataya sebep olmayan no-op yapıda bir geri dönüş nesnesi iletir. Context erişilebilir olduğu durumda mevcut kimlik doğrulama bağlamını olduğu gibi ilgili bileşene sunar.
**Parametreler**:
- Bu fonksiyon herhangi bir giriş parametresi almaz.
**Dönüş**: Kimlik doğrulama bağlam nesnesi olarak kullanıcı bilgileri, aktif oturum detayları, kullanıcının yetki rolü, tüm kimlik doğrulama işlemlerinin yükleme durumları ve giriş, çıkış gibi işlemleri gerçekleştiren kimlik doğrulama fonksiyonlarını barındıran bir nesne döndürür. AuthProvider dışında çağrılması durumunda çalışma zamanı hatası oluşturmayan no-op özellikli güvenli geri dönüş nesnesi elde edilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\hooks\useAuth.ts::useAuth
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `context` — useContext React hook'u ile import edilen AuthContext'ten alınan, kullanıcı bilgisi, oturum durumu ve yetkilendirme metodlarını barındıran bağlam nesnesi; tanımsız olup olmadığı kontrol edilerek varsayılan güvenli nesne döndürme işlemi tetiklenir
- **Dönüş**: Eğer context tanımsızsa, null değerli user/session/role, false değerli loading/roleLoading ve hata döndüren statik auth metodları içeren varsayılan nesne; tanımlıysa orijinal AuthContext nesnesi döndürülür

---

## NODE ID STANDARD

  file: src\hooks\useAuth.ts
  function: src\hooks\useAuth.ts::useAuth

---

## DISA AKTARILANLAR (EXPORTS)
  export: useAuth