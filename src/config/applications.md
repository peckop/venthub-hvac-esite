---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\applications.ts
skeleton_hash: 84fb188054b08725
entity_hashes:
  overview: 2544d4d89196ebc3
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
VentHub HVAC projesinin yapılandırma katmanında yer alan bu modül, statik bir veri deposu olarak görev yapar ve uygulama arayüzünde görüntülenecek kartların tüm meta verilerini `APPLICATION_CARDS` sabit dizisi altında merkezileştirir. Dosya herhangi bir fonksiyon içermeyen, yalnızca üst seviye tanım barındıran bir yapılandırma dosyasıdır; ortam değişkeni okumaz, harici API veya veritabanı sorgulaması yapmaz. Modülün tek amacı, uygulama kartlarına ait icon, başlık, açıklama ve yönlendirme bilgileri gibi sabit verileri projenin tüketen birimleriyle paylaşmaktır.

## Modül Yapısı
Bu dosyada fonksiyon bulunmamaktadır. Modül, yalnızca `APPLICATION_CARDS` adında bir dizi sabiti ve `ApplicationIcon` adlı bir type tanımı içerir. Yapılandırma verileri doğrudan kod içinde statik olarak tanımlanmış olup, çalışma zamanında herhangi bir dönüşüme uğramaz; ilgili bileşenler ve sayfalar tarafından doğrudan içe aktarılarak kullanılır.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, VentHub HVAC projesinin UI katmanı tarafından tüketilen statik bir yapılandırma modülüdür; runtime davranışı içermez ve yalnızca sabit veri sağlar.

**[Aksiyom 1 - Veri Yapısı Sabitliği]:** Eğer `APPLICATION_CARDS` dizisi yapısı (alan adları, alan tipleri veya alan sayısı) bilinçli olarak değiştirilmezse, bu modülü tüketen tüm UI bileşenlerinde render hataları veya tip uyumsuzlukları oluşur.

**[Aksiyom 2 - Export Yükümlülüğü]:** Eğer `APPLICATION_CARDS` sabiti modül tarafından export edilmezse, import eden tüm consumer modüllerde derleme hatası oluşur.

**[Aksiyom 3 - Boş Dizi Yasağı]:** Eğer `APPLICATION_CARDS` boş bir dizi olarak tanımlanırsa (eleman eklenmezse), UI tarafında uygulama kartı listeleme ekranı içeriksiz/hatalı görüntülenir.

**[Aksiyom 4 - Bağımlılıksızlık Garantisi]:** Eğer bu modül dış bir API, ortam değişkeni veya dosya sistemi erişimi eklerse, build sürecinin bağımsızlık prensibi ihlal edilir ve modülün test edilebilirliği azalır.

**[Aksiyom 5 - Eşzamanlı Erişim]:** Bu modül salt okunur (read-only) yapıdadır; eğer consumer bir bileşen `APPLICATION_CARDS` dizisini runtime'da değiştirirse (mutation), diğer tüm tüketen bileşenler tutarsız veri görüntüler.

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

Bu dosya (**applications.ts**) sadece bir yapılandırma dosyasıdır ve **fonksiyon içermemektedir**.

### İçe Aktarımlar
- Yok

### Sabitler
- `APPLICATION_CARDS` — Uygulama kartlarının tanımlandığı dizi (array). Muhtemelen UI'da gösterilen başvuru türlerinin (örn: konut, ticari, endüstriyel) kart bilgilerini (başlık, açıklama, ikon, değer vb.) tutar.

---

## NODE ID STANDARD

  file: src\config\applications.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: ApplicationAccent
  export: ApplicationCard
  export: ApplicationIcon