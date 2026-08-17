---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\i18n\dictionaries\admin\purchasing.en.ts
skeleton_hash: 19ea5ed4b271682f
entity_hashes:
  overview: 76a765e0fc5704e4
generated_at: 2026-08-17T11:04:29Z
---

## Genel Bakış
Bu modül, satın alma (purchasing) alanına ait arayüz metinlerinin İngilizce çeviri anahtarlarını içeren statik bir uluslararasılaştırma (i18n) sözlük dosyasıdır. Üzerinde herhangi bir mantıksal işlev (fonksiyon) veya dinamik işlem bulunmamakta olup, doğrudan modül ihracatı (export) yoluyla nesne olarak dışa sunulmaktadır.

## Modül Yapısı
### Sözlük Yapısı
Modül, `purchasing` adlı tek bir ana nesne ihracatı içerir. Bu nesne, satın alma ekranları ve bileşenlerinde kullanılacak tüm metin etiketlerini, hata mesajlarını ve başlıkları anahtar-değer çiftleri olarak organize eder.
- purchasing (export edilen ana nesne)

### İçe Aktarma ve Kullanım
Bu dosya doğrudan diğer modüller tarafından içe aktarılmaz. İhracat edilen sözlük nesnesi, uygulama genelindeki merkezi bir i18n yapılandırmasına veya çeviri yönetim sistemine entegre edilerek kullanılır. Bağımlılığı dolaylıdır; fiziksel olarak başka bir modülü çağrılmaz veya harici bir API/veritabanı sorgulanmaz.

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

---

**Açıklama:** Verilen kaynak bir **i18n (uluslararasılaştırma) sözlük dosyasıdır** (`purchasing.en.ts`). Bu dosya:
- Sadece statik bir çeviri nesnesi (`purchasing object`) içerir
- Fonksiyon imzası bulunmamaktadır
- Fonksiyon gövdesi bulunmamaktadır

Bir i18n sözlük dosyası, mimari varsayım gerektiren iş mantığı veya kontrollü akış içermez. Dosya, sadece satınalma modülü için İngilizce dilindeki arayüz metinlerini (label, placeholder, hata mesajları vb.) tanımlayan key-value çiftlerinden oluşur.

Eğer bu dosyanın bağlı olduğu **asıl satınalma modülü** (örn: purchase order creation, stock management vb.) için aksiyom isteniyorsa, ilgili modülün fonksiyon imzaları ve gövdeleri paylaşılmalıdır.

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **purchasing** (object) — `{
  navLabel: 'Purchasing',
  title: 'Purchasing',
  subtitle: 'Manage sup...`

---

## AST POINTERS

Bu dosya (`purchasing.en.ts`) bir i18n sözlük/dictionary dosyasıdır ve **hiçbir fonksiyon içermemektedir**. Dosya yalnızca statik bir çeviri nesnesi olan `purchasing` object sabitini tanımlar.

---

**Toplam Fonksiyon Sayısı: 0**

Dosya yapısı itibarıyla AST Pointer üretilecek herhangi bir fonksiyon gövdesi mevcut değildir. Dosya, yalnızca dil destekli statik metin çevirilerini barındıran bir kaynaktır.

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\purchasing.en.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: purchasing