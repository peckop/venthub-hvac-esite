---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-wt-quote\src\i18n\dictionaries\admin\tr.ts
skeleton_hash: 8131ab591337cc96
entity_hashes:
  overview: 0a5c01c3eeb5d320
generated_at: 2026-08-17T11:05:02Z
---

## Genel Bakış
Bu modül, admin panelinin Türkçe arayüz çeviri sözlüğünü tanımlayan statik bir dil kaynak dosyasıdır. Farklı iş alanlarına ait çeviri nesnelerini bir araya getirerek uygulamanın kullanımına sunulan merkezi `admin` sözlüğünü oluşturur. Dosya saf bir veri modülüdür; herhangi bir iş mantığı, fonksiyon veya dış API bağımlılığı içermez ve yalnızca i18n çerçevelesi tarafından derleme zamanında yüklenerek arayüz bileşenlerine çeviri metinleri sağlar.

## Modül Yapısı
Bu modül, erişilebilirlik, denetim, yetkilendirme, kupon, kategori, doğrulama ve genel metinler gibi farklı dil alanlarına karşılık gelen çoklu çeviri dosyasından nesneler import ederek birleştirir ve dışa aktarır. Salt veri ve yapılandırma niteliğinde olduğu için davranışsal mantık, hook veya herhangi bir hesaplama içermez. Ortam değişkeni veya veritabanı/servis bağımlılığı yoktur. Dışa aktarılan `admin` nesnesinin anahtar kümesi bir sözdizimsel sözhedir ve bir öğe eklenip çıkarılması kırıcı değişiklik yaratabilir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, statik bir çeviri sözlüğü veri nesnesidir ve aşağıdaki yapısal ve içeriksel varsayımlara dayanır.

[Aksiyom 1]: Eğer `admin` nesnesi modülde ihracat edilmez veya tanımlı bir `admin` sabiti (object) olarak sunulmazsa, uygulamanın i18n çerçevelesi bu sözlüğü yükleyemez ve tüm admin paneli arayüz metinleri boş/hata durumunda kalır.
[Aksiyom 2]: Eğer `admin` nesnesinin içindeki herhangi bir dil alanı (örn. `common`, `categories`) anahtarı veya değeri eksikse, o alana ait arayüz bileşenleri çeviri anahtarını (key) doğrudan gösterir veya tanımsız metin hatası verir.
[Aksiyom 3]: Eğer modül içeriği geçerli bir TypeScript nesne yapısı ( `{}` ) şeklinde değilse (örn. sondan virgül eksik, sözdizimi hatası), modül derleme zamanında yüklenemez ve i18n çerçevelesi tarafından kullanılamaz.
[Aksiyom 4]: Eğer modülde tanımlanan çeviri anahtarları, uygulama içindeki bileşenlerin beklediği anahtarlarla (örn. `"admin.common.save"`) eşleşmezse, bileşenler doğru metni bulamaz.
[Aksiyom 5]: Eğer bu modül, i18n çerçevelesi tarafından istenen standart `admin` anahtar yapısını (örn. `{ a11y: {...}, common: {...} }`) sağlamazsa, çerçeve modülü tanımlayamaz veya geçersiz kabul edebilir.

**Not:** Bu modül, saf bir veri (data-only) modülüdür. Herhangi bir fonksiyon, iş mantığı veya dış bağımlılık içermez; sadece `admin` adlı nesneyi ihrac eder.

---

## FONKSİYON DETAYLARI

---

## İTHALATLAR (IMPORTS)
- import: ./a11y.tr::a11y
- import: ./audit.tr::audit
- import: ./authority.tr::authority
- import: ./categories.tr::categories
- import: ./common.tr::common
- import: ./confirm.tr::confirm
- import: ./coupons.tr::coupons
- import: ./dashboard.tr::dashboard
- import: ./dataTable.tr::dataTable
- import: ./errorGroups.tr::errorGroups
- import: ./errors.tr::errors
- import: ./inventory.tr::inventory
- import: ./logistics.tr::logistics
- import: ./menu.tr::menu
- import: ./movements.tr::movements
- import: ./orders.tr::orders
- import: ./pricing.tr::pricing
- import: ./products.tr::products
- import: ./purchasing.tr::purchasing
- import: ./returns.tr::returns
- import: ./search.tr::search
- import: ./settings.tr::settings
- import: ./theme.tr::theme
- import: ./titles.tr::titles
- import: ./toolbar.tr::toolbar
- import: ./ui.tr::ui
- import: ./users.tr::users
- import: ./webhooks.tr::webhooks

---

## SABİTLER
- **admin** (object) — `{
  authority,
  pricing,
  categories,
  products,
  purchasing,
  com...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/i18n/dictionaries/admin/tr.ts::(fonksiyon yok)
- **params**: —
- **ic_degiskenler**: —
- **Dönüş**: —

> **Not:** Bu dosyada tanımlı fonksiyon bulunmamaktadır. Dosya, yalnızca dışarıdan import edilen çeviri nesnelerini (`a11y`, `audit`, `authority`, `categories`, `common`, `confirm`, `coupons`, `dashboard`, `dataTable`, `errorGroups`) bir araya getiren ve `admin` sabitinde toplayan bir modül re-export dosyasıdır. Herhangi bir işlevsel kod (fonksiyon gövdesi, metot, callback) içermemektedir.

---

**Toplam fonksiyon sayısı:** 0

**Dosyanın yapısı:**
- 10 adet import如果没有 fonksiyon gövdesi Yok
- `admin` object — import edilen tüm çeviri sözlüklerini bir object literal içinde birleştirir
- Fonksiyon imzası Yok
- Class Yok
- Call ilişkisi Yok

---

## NODE ID STANDARD

  file: src\i18n\dictionaries\admin\tr.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: admin