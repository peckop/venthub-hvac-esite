---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\adminUi.ts
skeleton_hash: 7306ab1c10b03b3d
generated_at: 2026-05-23T22:33:23Z
---

## Genel Bakış
VentHub HVAC projesinin src/utils dizininde yer alan bu modül, yönetici (admin) arayüzü bileşenlerinde kullanılmak üzere standartlaştırılmış UI sınıfları ve stillerini barındıran basit bir yardımcı dosyasıdır. İçinde herhangi bir fonksiyon, harici bağımlılık veya çalıştırılabilir mantık bulunmaz, sadece yeniden kullanılabilir görsel tanımlarını içerir.

Bu modül herhangi bir ortam değişkeni kullanmaz, harici API'ler ile iletişim kurmaz veya herhangi bir veritabanı tablosunu sorgulamaz. Tamamen yerel olarak tanımladığı yönetici paneli kartları ve seçim alanları için CSS sınıfı ve stili sabitleri, projenin tüm yönetici arayüzü bileşenleri tarafından import edilerek tutarlı bir görsel deneyim sunulmasını sağlar.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, yönetici (admin) arayüzü bileşenlerinin stillendirme ve şablon amaçlı sabitlerini barındırır, bu sabitlerin doğru şekilde kullanılabilmesi için modülün içeriğinin import edildiği UI çalışma zamanı ortamının sabit tipleriyle uyumlu olması gerekmektedir.

[Aksiyom 1]: Eğer bu modüldeki şablon amaçlı sınıf sabitleri (adminCardClass, adminCardPaddedClass) kullanıldığı HTML şablon motoru tarafından işlenemiyorsa, yönetici arayüzündeki kart bileşenleri doğru stillendirilemez, arayüzde görsel bozukluklar oluşur.
[Aksiyom 2]: Eğer adminSelectStyle nesnesinin yapısı, modülün import edildiği UI kütüphanesinin kabul ettiği stillendirme nesnesi formatıyla uyumlu değilse, yönetici arayüzündeki seçim (select) bileşenleri istenilen görsel özelliklere sahip olamaz, kullanıcı deneyimi bozulur.
[Aksiyom 3]: Eğer bu modülün ihraç ettiği tüm sabitler, import edildiği tüm ilgili modüller tarafından doğru şekilde referanslanamıyorsa, ilgili yönetici arayüzü bileşenleri stillendirme verisine erişemez, projede genel görsel tutarsızlıklar meydana gelir.

---



---

## SABİTLER
- **adminCardClass** (template) — ``${glassStrongClass} rounded-[2rem] transition-all duration-500 hover:border-...`
- **adminCardPaddedClass** (template) — ``${adminCardClass} p-8 lg:p-10``
- **adminSelectStyle** (object) — `{ 
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.o...`

---

## AST POINTERS

İncelenen `C:\Users\alize\venthub-hvac\src\utils\adminUi.ts` dosyasında çözümlenebilir herhangi bir fonksiyon tanımı, fonksiyon gövdesi veya çağrılabilir yapı bulunmamaktadır. Dosyada sadece aşağıdaki statik sabitler tanımlanmıştır:
- `adminCardClass` — şablon amaçlı kullanılan sabit
- `adminCardPaddedClass` — şablon amaçlı kullanılan sabit
- `adminSelectStyle` — stil tanımları içeren obje tipinde sabit

---

## NODE ID STANDARD

  file: src\utils\adminUi.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: adminCardClass
  export: adminCardPaddedClass
  export: adminSelectStyle