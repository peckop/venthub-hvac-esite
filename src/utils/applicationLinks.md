---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\utils\applicationLinks.ts
skeleton_hash: 57d78bbfb155ef37
entity_hashes:
  func:getCategoryUrlFromTopic: 179f53035c1027b6
  overview: e1865700dc78efd4
generated_at: 2026-06-19T20:48:17Z
---

## Genel Bakış
VentHub HVAC projesinin utility modüllerinden biri olan applicationLinks.ts, uygulama içi bağlantı üretimi ve standartlaştırılması işlemlerini üstlenir. Proje genelinde tutarlı URL formatlarının kullanılmasını sağlamak amacıyla konu etiketlerinden kategori sayfalarına yönlendiren geçerli bağlantılar oluşturmak için tasarlanmıştır.

## Fonksiyon Grupları
### Kategori URL Oluşturma İşlevleri
Konu (topic) kimliklerini işleyerek ilgili kategori sayfalarının erişilebilir uygulama içi bağlantılarını üretmekle sorumludur.
- getCategoryUrlFromTopic

---

## AXIOMS – Mimari Varsayımlar
Bu modül, konu (topic) slug'larını kategori URL'lerine eşlemek için sabit bir eşleşme tablosu kullanır, tüm işlevselliği bu eşleşme tablosunun ve giriş parametrelerinin geçerliliğine bağlıdır.

[Aksiyom 1]: Eğer TOPIC_TO_CATEGORY_URL sabiti tanımlı ve erişilebilir değilse, getCategoryUrlFromTopic fonksiyonu hiçbir şekilde geçerli kategori URL'si döndüremez, tüm konu kaynaklı uygulama içi linkler çalışmaz.
[Aksiyom 2]: Eğer getCategoryUrlFromTopic fonksiyonuna gönderilen topicSlug parametresi string türünde değilse, nesne anahtarı olarak kullanılamaz, fonksiyon çalışma zamanı hatası fırlatır.
[Aksiyom 3]: Eğer işleme alınan topicSlug string değeri, TOPIC_TO_CATEGORY_URL nesnesinde tanımlı anahtarlar arasında mevcut değilse, getCategoryUrlFromTopic fonksiyonu geçersiz veya tanımsız değer döndürür, ilgili link yönlendirmeleri başarısız olur.
[Aksiyom 4]: Eğer TOPIC_TO_CATEGORY_URL nesnesinde tutulan kategori URL değerleri geçerli URL formatına sahip değilse, döndürülen linkler hedef sayfalara yönlendirme yapamaz, kullanıcı deneyimini ve uygulama kararlılığını bozar.

---

## FONKSİYON DETAYLARI

### getCategoryUrlFromTopic
**Ne yapar**: Verilen bir bilgi merkezi topic slug'ı (ör. 'hava-perdesi') için, ilgili ürün kategorisi sayfasının tam URL'ini döndürür. Bu, kullanıcı deneyimini iyileştirmek için önerilen bir geçiş yoludur.

**Nasıl yapar**: Fonksiyon, önceden tanımlı bir nesne olan `TOPIC_TO_CATEGORY_URL` haritasında `topicSlug` parametresini anahtar olarak arar. Haritada eşleşen bir URL varsa onu, yoksa varsayılan olarak `'/products'` adresini döndürür.

**Parametreler**:
- `topicSlug`: `string` — Bilgi merkezi topic slug'ı (ör. 'hava-perdesi')

**Dönüş**: `string` — Tam kategori sayfası URL'i. Slug haritada bulunamazsa varsayılan `/products` adresi döndürülür.

---

## SABİTLER
- **TOPIC_TO_CATEGORY_URL** (object) — `{
    'hava-perdesi': '/category/air-curtains',
    'jet-fan': '/category/j...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/utils/applicationLinks.ts::getCategoryUrlFromTopic
- **params**: [topicSlug: string]
- **ic_degiskenler**:
  - `topicSlug` — Fonksiyona parametre olarak gelen, işlem yapılacak konunun benzersiz URL uyumlu kimliği (slug)
  - `TOPIC_TO_CATEGORY_URL[topicSlug]` — Global tanımlı konu-kategori URL eşleşme nesnesinden, gelen topicSlug değerine karşılık gelen kategori URL'si
  - `'/products'` - Gelen topicSlug için eşleşen kategori URL'si bulunamadığında kullanılacak varsayılan ürünler sayfası URL'si
- **Dönüş**: string — Gelen konu slug'ına ait kategori URL'si veya eşleşme yoksa varsayılan /products URL'si

---

## NODE ID STANDARD

  file: src\utils\applicationLinks.ts
  function: src\utils\applicationLinks.ts::getCategoryUrlFromTopic

---

## DISA AKTARILANLAR (EXPORTS)
  export: getCategoryUrlFromTopic