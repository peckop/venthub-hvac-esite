---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx
skeleton_hash: 51959c03f2b8ee36
generated_at: 2026-05-23T22:41:02Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin bilgi merkezi bölümünün ana giriş sayfasını oluşturan React bileşenini barındırır. Proje içindeki tüm belge ve bilgi kaynaklarına kullanıcıların erişebilmesini sağlayan ana arayüzü sunmakla sorumludur. Projenin ilgili rotasında çağrılarak bilgi merkezi bölümünün temelini oluşturur.

## Fonksiyon Grupları
### Ana Bilgi Merkezi Sayfa Bileşeni
Bilgi merkezi bölümünün tüm kullanıcı arayüzünü, içerik düzenini ve temel işlevlerini React frameworkü üzerinden oluşturup kullanıcıya sunmakla sorumlu tek ana bileşendir.
- HubPage

---

## AXIOMS – Mimari Varsayımlar
Bu React tabanlı HubPage bilgi merkezi sayfa bileşeninin doğru şekilde çalışabilmesi, içerik gösterme ve gezinme özelliklerini sorunsuz sunabilmesi için tanımlı sabitlerin ve bağımlı sistemlerin erişilebilir ve geçerli durumda olması zorunludur.

[Aksiyom 1]: Eğer sabit olarak tanımlanan TOPIC_SLUGS geçerli, çözümlenebilir bir ifade olarak tanımlanmamışsa, bilgi merkezi konularına ait yönlendirme linkleri çalışmaz, içerik erişimi bozulur.
[Aksiyom 2]: Eğer TAGS sabiti geçerli bir dizi formatında tanımlanmamış veya boş bırakılmışsa, etiket bazlı içerik filtreleme özelliği çalışmaz, filtreleme arayüzü işlevsiz kalır.
[Aksiyom 3]: Eğer HubPage bileşeninin kullandığı uygulama içi sayfa yönlendirme mekanizması modül tarafından erişilebilir durumda değilse, TOPIC_SLUGS üzerinden konu içeriklerine geçiş yapılamaz, sayfa içi gezinme tamamen devre dışı kalır.
[Aksiyom 4]: Eğer bilgi merkezi içeriklerini sağlayan üst veri kaynağı HubPage tarafından erişilemiyorsa, TAGS ve TOPIC_SLUGS ile eşleşen içerikler sayfada yüklenemez, boş bir bilgi merkezi arayüzü görüntülenir.

---

## FONKSIYON DETAYLARI

### HubPage
**Ne yapar**: VentHub HVAC projesinin bilgi merkezi (knowledge hub) ana sayfa bileşenidir. src/views/knowledge dizininde yer alan bu React bileşeni, platformun genel bilgi içeriklerinin gösterildiği ana arayüzü oluşturmak üzere tasarlanmıştır. Projenin genel domain kapsamında doküman kaynağı olarak kullanılan bu sayfa, kullanıcıların tüm bilgi kaynaklarına erişimini sağlayan ana giriş noktası olarak görev alır.
**Nasıl yapar**: TypeScript ile tanımlanan bu bileşen, React.FC standart dönüş tipiyle React ekosisteminin gereksinimlerine tam uyumlu şekilde çalışır. Sayfa içeriğini doğrudan render ederek bilgi merkeziyle ilgili tüm UI öğelerini, alt bileşenleri ve işlevleri kullanıcıya sunar, kendi içindeki state yapıları veya uygulamadaki global state yönetimi ile arayüzün etkileşimli çalışmasını destekler.
**Parametreler**: Bu fonksiyonel bileşen herhangi bir parametre almaz. Tüm ihtiyaç duyduğu verileri, React tabanlı uygulamadaki global state yönetim sistemlerinden veya kendi içindeki veri çekme işlemlerinden temin eder.
**Dönüş**: React.FC tipinde bir React fonksiyonel bileşeni döndürür. Bu dönen bileşen, React tarafından DOM'a eklenmek üzere kullanılır ve tarayıcıda bilgi merkezi sayfasının arayüzünün görüntülenmesini sağlar.

---

## TYPE ALIASES

### TopicSlug
```typescript
type TopicSlug = typeof TOPIC_SLUGS[number]
```

---

## SABİTLER
- **TOPIC_SLUGS** (as_expression) — `['hava-perdesi', 'jet-fan', 'hrv'] as const`
- **TAGS** (array) — `[
  { key: 'all', labelKey: 'knowledge.tags.all' },
  { key: 'hava-perdesi'...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::HubPage
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `t` — useI18n hookundan alınan çeviri fonksiyonu, tüm UI metinlerinin çevrilmesi için kullanılır
  - `q` — Arama input değerini tutan state değişkeni, konu araması ve filtrelemede kullanılır
  - `setQ` — q state'ini güncellemek için kullanılan state setter fonksiyonu, arama input değişiminde tetiklenir
  - `activeTag` — Seçili kategori etiketini tutan state değişkeni, konu filtrelemede kullanılır, varsayılan değeri 'all'
  - `setActiveTag` — activeTag state'ini güncellemek için kullanılan state setter fonksiyonu, etiket butonlarına tıklandığında tetiklenir
  - `topics` — useMemo ile önbelleğe alınan işlenmiş konu listesi, her konunun çevrilmiş başlık, özet, okuma süresi ve kategori bilgilerini içerir
  - `filtered` — useMemo ile arama ve etiket filtreleri uygulanmış konu listesi, sayfadaki konu gridinde gösterilir
- **Dönüş**: JSX element, React bileşen çıktısı

---

### [N2_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::TOPIC_SLUGS_map_callback
- **params**: [slug]
- **ic_degiskenler**:
  - `categoryKey` — Konunun kategori anahtarı, slug değerine göre 'comfort', 'safety' veya 'efficiency' olarak atanır, kategori çevirisi için kullanılır
- **Dönüş**: İşlenmiş konu objesi, slug, başlık, özet, okuma süresi ve kategori bilgilerini içerir

---

### [N3_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::filtered_useMemo_callback
- **params**: (parametre yok)
- **ic_degiskenler**:
  - `text` — Arama sorgusunun trimlenmiş ve küçük harfe çevrilmiş hali, arama eşleşmesi kontrolünde kullanılır
- **Dönüş**: Filtreleme koşullarına uyan konulardan oluşan array

---

### [N4_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::topics_filter_callback
- **params**: [tpc]
- **ic_degiskenler**:
  - `matchesText` — Konunun başlık/özetinin arama metniyle eşleşip eşleşmediğini belirten boolean değer
  - `matchesTag` — Konunun aktif kategori etiketiyle eşleşip eşleşmediğini belirten boolean değer
- **Dönüş**: Boolean, her iki filtre koşulunun sağlanıp sağlanmadığını belirtir, konu filtrelemede kullanılır

---

### [N5_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::title_split_map_callback
- **params**: [part, i]
- **ic_degiskenler**: (yok)
- **Dönüş**: React.Fragment, başlığın bölünmüş parçasını sarmalar, ilk parça için satır sonu ekler

---

### [N6_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::TAGS_map_callback
- **params**: [tag]
- **ic_degiskenler**: (yok, tag.key ve tag.labelKey etiket özellikleri okunur)
- **Dönüş**: Kategori filtrelemesi için buton JSX elementi, tıklandığında aktif etiketi günceller

---

### [N7_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\views\knowledge\HubPage.tsx::filtered_map_callback
- **params**: [topic, i]
- **ic_degiskenler**: (topic objesinin tüm özellikleri (slug, category, time, title, summary) okunur)
- **Dönüş**: Animasyonlu konu kartı JSX elementi, ilgili konu detay sayfasına link içerir

---

## NODE ID STANDARD

  file: src\views\knowledge\HubPage.tsx
  function: src\views\knowledge\HubPage.tsx::HubPage

---

## DISA AKTARILANLAR (EXPORTS)
  export: HubPage