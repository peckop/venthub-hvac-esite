---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\config\legal.ts
skeleton_hash: ec3878e5030a15dd
entity_hashes:
  overview: 841e450a0e8713fb
generated_at: 2026-06-19T20:47:53Z
---

## Genel Bakış
VentHub HVAC projesinin `src/config/legal.ts` modülü, platformun yasal süreçleriyle ilgili tüm yapılandırma değerlerini merkezi olarak tutan statik bir yapılandırma dosyasıdır. Sadece projenin temel site adresini `./siteUrl` modülünden import ederek, kullanım koşulları, gizlilik politikası, çerez politikası gibi standart yasal içeriklerin tüm erişim ve ayar değerlerini `legalConfig` adındaki sabit değişken altında toplar. Herhangi bir dinamik mantık veya çalıştırılabilir fonksiyon barındırmayan bu modül, uygulama genelinde kullanılmak üzere sadece sabit yasal yapılandırmaları dışa aktarır.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, VentHub HVAC platformunun yasal uyumluluk süreçlerinde kullanılan sabit yasal konfigürasyon değerlerini barındırır, çalışmasının temeli modül içindeki legalConfig nesnesinin bütünlüğü ve tüm tüketen bileşenler tarafından erişilebilir olmasıdır.

[Aksiyom 1]: Eğer modül içerisindeki legalConfig nesnesi tanımlı değilse, bu modülü içe aktaran tüm ön yüz ve arka yüz bileşenleri yasal konfigürasyon değerlerine erişemez, uygulama içindeki zorunlu yasal bildirimler hiç gösterilemez.
[Aksiyom 2]: Eğer legalConfig nesnesi içindeki zorunlu yasal konfigürasyon alanları (gizlilik politikası bağlantısı, kullanım şartları sürümü, yerel mevzuat uyumluluk bayrakları vb.) eksik kalırsa, kullanıcılara sunulması gereken yasal metinler hatalı veya eksik gösterilir, hukuki uyumsuzluk riski oluşur.
[Aksiyom 3]: Eğer bu modül, uygulamanın yasal metinleri, giriş akışı koşulları gibi değerleri kullanan tüm temel bileşenleri tarafından erişilebilir değilse, kullanıcı platform erişimi, hesap yönetimi gibi temel akışlar kesintiye uğrar, uygulama kısmen veya tamamen işlevsiz kalır.
[Aksiyom 4]: Eğer legalConfig içindeki aktif kullanılan yasal değerler (bağlantılar, sürüm numaraları, uyumluluk bayrakları) güncel değilse, uygulama güncel olmayan yerel regülasyonlara uygun olmayan içerik sunar, hukuki sorumluluk riski ortaya çıkar.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./siteUrl::SITE_URL

---

## INTERFACES

### LegalConfig
- `sellerTitle: string`
- `sellerAddress: string`
- `sellerEmail: string`
- `sellerPhone: string`
- `taxOffice: string`
- `taxNumber: string`
- `mersis: string`
- `websiteUrl: string`
- `deliveryTime: string`
- `shippingFee: string`
- `returnAddress: string`
- `cargoCompanies: string`
- `refundTime: string`
- `retentionOrders: string`
- `retentionSupport: string`
- `retentionMarketing: string`
- `retentionLogs: string`
- `applicationEmail: string`
- `lastUpdated: string`

---

## SABİTLER
- **legalConfig** (object) — `{
  sellerTitle: '[SATICI_UNVAN]',
  sellerAddress: '[SATICI_ADRES]',
  se...`

---

## AST POINTERS
C:\Users\alize\venthub-hvac\src\config\legal.ts dosyasında analiz edilebilir herhangi bir fonksiyon, sınıf veya metod tanımı bulunmamaktadır. Dosyadaki kayıtlı öğeler:
- `SITE_URL` — `./siteUrl` modülünden import edilen sabit site adresi değeri
- `legalConfig` — dosyada tanımlanan yasal yapılandırma nesnesi

---

## NODE ID STANDARD

  file: src\config\legal.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: LegalConfig