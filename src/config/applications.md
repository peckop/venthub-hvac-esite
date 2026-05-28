---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\applications.ts
skeleton_hash: 66a67e1c0079217c
entity_hashes:
  overview: f2506fc587bf463a
generated_at: 2026-05-28T22:37:09Z
---

## Genel Bakış
VentHub HVAC projesinin yapılandırma katmanında yer alan bu modül, hiçbir harici kaynağa bağımlılığı olmayan, yalnızca üst seviye kod barındıran statik bir yapılandırma dosyasıdır. Modül, platformun kullanıcı arayüzünde görüntülenecek uygulamalara ait kartların tüm meta verilerini merkezileştiren `APPLICATION_CARDS` adında tek bir sabit barındırır. Hiçbir ortam değişkeni kullanmaz veya herhangi bir harici API/tablo sorgulaması yapmaz, yalnızca sabit uygulama kartı verilerini projenin ilgili bölümleriyle paylaşmak amacıyla oluşturulmuştur.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC sisteminin ilgili tüketen birimleri tarafından kullanılacak uygulama kartı yapılandırmalarını barındıran konfigürasyon modülüdür, doğru çalışabilmesi için sahip olduğu tek sabit dizinin (APPLICATION_CARDS) tüketenlerin beklediği gereksinimlere uygun tanımlanması zorunludur.

[Aksiyom 1]: Eğer APPLICATION_CARDS isimli sabit dizi modül içerisinde tanımlı değilse, bu modülü içe aktaran tüm birimlerde uygulama kartı verisine erişim sağlanamaz, çalışma zamanı hatası oluşur.
[Aksiyom 2]: Eğer APPLICATION_CARDS dizisi, modülü kullanan birimlerin beklediği temel yapıda (her öğenin gerekli tüm özelliklere sahip olması) tanımlanmamışsa, tüketen birimlerde kart listeleme, görüntüleme veya kullanıcı etkileşimi işlemleri başarısız olur.
[Aksiyom 3]: Eğer APPLICATION_CARDS dizisindeki kart öğeleri için benzersiz olması gereken tanımlayıcı özellikleri tekil olacak şekilde ayarlanmamışsa, tüketen birimlerde kart çakışmaları oluşur, yönlendirme, filtreleme gibi işlemler yanlış çalışır.

---

## FONKSİYON DETAYLARI

---

## TYPE ALIASES

### ApplicationIcon
```typescript
type ApplicationIcon = 'building' | 'wind' | 'layers' | 'factory'
```

### ApplicationAccent
```typescript
type ApplicationAccent = 'blue' | 'navy' | 'emerald' | 'gray'
```

### ApplicationCard
```typescript
type ApplicationCard = {
  key: 'parking' | 'air-curtain' | 'heat-recovery' | 'kitchen'
  title: string
  subtitle: string
  href: string
  icon: ApplicationIcon
  accent: ApplicationAccent
  active: boolean
}
```

---

## SABİTLER
- **APPLICATION_CARDS** (array) — `[
  {
    key: 'parking',
    title: 'Otopark Havalandırma',
    subtitle...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src\config\applications.ts::TANIMLANMIŞ FONKSİYON YOK
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `APPLICATION_CARDS` — Dosyada tanımlı tek sabit, dizi (array) türünde, dosya kapsamında herhangi bir işleyen fonksiyon gövdesi tanımlanmamıştır
- **Dönüş**: yok

---

## NODE ID STANDARD

  file: src\config\applications.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: ApplicationAccent
  export: ApplicationCard
  export: ApplicationIcon