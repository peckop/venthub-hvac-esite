---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\admin-resources.ts
skeleton_hash: 9839c181cbaffa2b
entity_hashes:
  overview: 37af4aa504a9ab70
generated_at: 2026-06-19T20:48:01Z
---

## Genel Bakış
Bu modül, VentHub HVAC yönetimi için gerekli olan statik kaynak tanımlarını ve yapılandırma verilerini merkezi bir noktada tutar. Admin panelinin menü yapısı, sayfa başlıkları ve rota bilgileri gibi arayüz verilerini bir sabit aracılığıyla dışa sunar.

## Fonksiyon Grupları
Bu dosyada tanımlı fonksiyon bulunmamaktadır. Modül, yalnızca `ADMIN_RESOURCES` adlı yapılandırma nesnesini ve gerekli modül ithalatlarını içerir. Bu yapılandırma nesnesi, admin panelinin navigasyon ve görünüm yapısını tanımlayan statik bir veri kümesidir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül fonksiyon içermemekte olup, yalnızca `ADMIN_RESOURCES` sabit (array) tanımlamaktadır. Aşağıda bu yapıdan türetilebilecek mimari varsayımlar sunulmuştur.

[Aksiyom 1]: Eğer `ADMIN_RESOURCES` array'i boş veya tanımsız (`undefined`) olursa, admin paneli kaynak erişimleri başarısız olur veya boş liste ile çalışır.

[Aksiyom 2]: Eğer `ADMIN_RESOURCES` array içindeki elemanların yapısı (schema) beklenen formatta değilse (örn: zorunlu alanlar eksikse), kaynak tanımlama hataları oluşur.

[Aksiyom 3]: Eğer `ADMIN_RESOURCES` birden fazla dosya/işlem tarafından import ediliyor ve bu dosya değiştirilirse, tüm bağımlı modüller etkilenir.

[Aksiyom 4]: Eğer `ADMIN_RESOURCES` array'i sıralı (ordered) bir yapıya sahipse ve sıralama değiştirilirse, UI'da kaynak gösterim sırası değişebilir.

---

**Not:** Bu modül bir konfigürasyon/sabit dosyası olup, fonksiyon gövdesi içermediğinden, fonksiyonel aksiyomlar üretilememiştir. Mevcut aksiyomlar sabit yapının varlığından türetilmiştir.

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### AdminResource
- `key: string`
- `labelKey: string`
- `group: 'main' | 'sales' | 'catalog' | 'stock' | 'system'`
- `route: string`
- `icon: LucideIcon`
- `requiredAccess: string`
- `searchable: boolean`
- `searchHintKey?: string`

---

## SABİTLER
- **ADMIN_RESOURCES** (array) — `[
  {
    key: 'orders',
    labelKey: 'admin.menu.orders',
    group: 's...`

---

## AST POINTERS

Bu dosyada **fonksiyon tanımları bulunmamaktadır**.

---

### Dosya Yapısı: `C:\Users\alize\venthub-hvac\src\config\admin-resources.ts`

- **Türü**: Sabit (constant) tanımlama dosyası
- **İçe Aktarımlar**: Kısmi bilgi mevcut (`import {` — tamamlanmamış)
- **Tanımlı Sabitler**:
  - `ADMIN_RESOURCES` — Array (dizi) yapısında, yönetici paneli için kaynak/tanım verisi içeren sabit
- **Fonksiyon Sayısı**: 0
- **Sınıf Sayısı**: 0
- **Çagri İlişkileri**: Yok

---

> **Not**: Bu dosya yalnızca veri tanımı (data definition) içeren bir yapılandırma dosyasıdır. Fonksiyon gövdesi barındırmadığı için AST Pointer oluşturulamamaktadır. `ADMIN_RESOURCES` dizisinin içeriği (eleman yapısı, alan tanımları vb.) dosyanın tam içeriği paylaşıldığında analiz edilebilir.

---

## NODE ID STANDARD

  file: src\config\admin-resources.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: ADMIN_RESOURCES
  export: AdminResource