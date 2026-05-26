---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\home\StrategicBrands.tsx
skeleton_hash: c335ec57d52a12da
generated_at: 2026-05-26T11:44:57Z
---

## Genel Bakış  
StrategicBrands.tsx, ana sayfada “Stratejik Markalar” başlıklı bir bölümü oluşturur. Bileşen, dışarıdan gelen çeviri sözlüğü (`dictionary`) ile metinleri yerelleştirir ve bu verileri kullanarak marka kartlarını dinamik olarak renderlar. Tek dışa açık fonksiyon, bu işlevi sağlayan `StrategicBrands` bileşenidir.

## Fonksiyon Grupları  
### Ana Bileşen  
Bu grup, modülün tek işlevini içerir: kullanıcı arayüzünü oluşturmak.  
- StrategicBrands  

Bileşen, `dictionary` prop’u üzerinden çeviri fonksiyonunu (`t`) alır, gerekli metinleri çeker ve JSX ile marka kartlarını ekrana yerleştirir. Böylece dil desteği sağlanır ve bileşen yeniden render edildiğinde güncel çeviriler gösterilir.

---

## AXIOMS – Mimari Varsayımlar
StrategicBrands bileşeni, **`dictionary`** prop’u üzerinden alınan **`t`** adlı çeviri fonksiyonuna dayanır; bu fonksiyonun varlığı ve davranışı bileşenin doğru çalışması için zorunludur.

**Aksiyom 1**: Eğer `dictionary` prop’u **sağlanmazsa**, `t` değişkeni `undefined` olur ve bileşen içinde `t(...)` çağrısı **çalışma zamanında bir `TypeError` üretir**.  

**Aksiyom 2**: Eğer `dictionary` prop’u **fonksiyon değilse** (ör. string, nesne, sayı vb.), `t` bir fonksiyon olmadığı için `t(...)` çağrısı **çalışma zamanında bir `TypeError` üretir**.  

**Aksiyom 3**: Eğer `t` fonksiyonu **bir string anahtar alıp string döndürmezse** (ör. `null`, `undefined`, nesne vb.), JSX içinde beklenmeyen tip ortaya çıkar ve **React render hatası** meydana gelir.  

**Aksiyom 4**: Eğer `t` fonksiyonu **aynı anahtar için tutarsız sonuçlar döndürürse**, bileşenin UI’sı **kararsız ve kullanıcı deneyimi bozulur** (ör. aynı marka kartı farklı dillerde farklı metin gösterir).  

### Domain‑specific kurallar
- `t` **her zaman** bir **string** anahtar (`key: string`) almalı ve **string** (`translated: string`) döndürmelidir.  
- `t` fonksiyonunun **yan etkisi olmamalıdır**; aynı giriş için aynı çıktıyı üretmelidir (deterministik olmalı).  

Bu aksiyomlar, StrategicBrands bileşeninin **çevrim (i18n) fonksiyonuna bağımlılığını** ve bu fonksiyonun eksik, hatalı tipte ya da tutarsız olması durumunda ortaya çıkacak hataları tanımlar.

---

## FONKSIYON DETAYLARI

### StrategicBrands
**Ne yapar**: Bu React işlevsel bileşeni, VentHub HVAC platformunun ana sayfasındaki stratejik markalar bölümünü render eder. Kullanıcıların platformla çalıştığı resmi markaları görmesini sağlayan, duyarlı ve yerelleştirilmiş bir UI bölümü oluşturur.
**Nasıl yapar**: Bileşen, aldığı destructured props içindeki `dictionary` değerini `t` olarak takma adlandırır. Bu prop aracılığıyla uygulamanın i18n çeviri sözlüğüne erişir, bileşenin tüm statik metinlerini yerelleştirir. Standart React render akışını kullanarak marka logoları, isimleri ve ilgili açıklama metinlerini içeren bir container yapısı oluşturur ve ekrana basar.
**Parametreler**:
- dictionary: StrategicBrandsProps["dictionary"] — Bileşene iletilen çeviri sözlüğü veya fonksiyonudur, kod içinde `t` olarak kısaltılır. Yerelleştirilmiş metinler kullanarak bileşenin dil bağımsız çalışmasını sağlar.
**Dönüş**: React.FC<StrategicBrandsProps> tipinde bir bileşen döner, yani belirtilen props tipini alarak geçerli bir React UI elemanı render eder.

---

## INTERFACES

### StrategicBrandsProps
- `dictionary: {`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\components\home\StrategicBrands.tsx::StrategicBrands
- **params**: Bir nesne alır, bu nesnenin `dictionary` özelliği `t` olarak adlandırılır (çeviri/metin verilerini taşır).
- **ic_degiskenler**: 
  - `t` — fonksiyona parametre olarak gelen çeviri/metin verilerini içeren nesne (dictionary).
  - `t.eyebrow` — `t` nesnesinden alınan, bileşenin "eyebrow" metnini temsil eden değer.
  - `t.title` — `t` nesnesinden alınan, bileşenin başlık metnini temsil eden değer.
  - `t.subtitle` — `t` nesnesinden alınan, bileşenin alt başlık metnini temsil eden değer.
- **Dönüş**: JSX öğesi (React bileşeni).

---

## NODE ID STANDARD

  file: src\components\home\StrategicBrands.tsx
  function: src\components\home\StrategicBrands.tsx::StrategicBrands

---

## DISA AKTARILANLAR (EXPORTS)
  export: StrategicBrands