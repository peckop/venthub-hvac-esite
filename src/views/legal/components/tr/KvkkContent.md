---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\KvkkContent.tsx
skeleton_hash: 9493c56aabbbc4b9
entity_hashes:
  func:KvkkContentTr: 08fe9e9e7f4255f0
  overview: 657f6326207d928f
  style_tokens: 06e3f7beac6824a2
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış

`KvkkContent.tsx`, VentHub'ın yasal sayfalarında görüntülenen **KVKK (Kişisel Verilerin Korunması Kanunu) metninin Türkçe karşılığını** sunan bir React bileşenidir. Tek bir presentational bileşen olarak, KVKK aydınlatma metnini tutarlı ve merkezi bir şekilde render eder. Modül, yalnızca statik yasal içeriğin sunumundan sorumludur ve herhangi bir iş mantığı veya veri yönetimi içermez.

## Fonksiyon Grupları

### KVKK İçerik Gösterimi
KVKK kanun metninin Türkçe versiyonunu JSX olarak render eden bileşen.
- `KvkkContentTr`

---

## AXIOMS – Mimari Varsayımlar

Bu modül, parametresiz bir React bileşeni (`KvkkContentTr()`) olup, fonksiyon gövdesi verilmemiştir. Dolayısıyla fonksiyon gövdesinden çıkarılabilecek mimari varsayım bulunmamaktadır.

---

## FONKSİYON DETAYLARI

### KvkkContentTr
**Ne yapar**: Bu fonksiyon, KVKK (Kişisel Verilerin Korunması Kanunu) ile ilgili Türkçe hukuki metin içeriğini render eden bir React fonksiyonel bileşenidir. Kullanıcıya kişisel verilerin işlenmesine ilişkin aydınlatma metnini sunar.

**Nasıl yapar**: Fonksiyon, React fonksiyonel bileşeni olarak tanımlanmıştır. KVKK kapsamında yer alan hukuki ve bilgilendirici metin içeriğini JSX yapısı ile tarayıcıda görüntülenmek üzere döndürür. Bileşen, yasal metin yapısını oluşturmak için divider, paragraph ve liste gibi bileşenleri bir arada kullanarak okunabilir bir içerik düzeni sağlar.

**Parametreler**:
- Bu fonksiyonun herhangi bir parametresi bulunmamaktadır.

**Dönüş**: `React.FC` — KVKK Türkçe aydınlatma metnini içeren React fonksiyonel bileşeni döndürür.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/KvkkContent.tsx::KvkkContentTr
- **params**: () (parametre yok)
- **ic_degiskenler**:
  - `legalConfig.sellerTitle` — legalConfig objesinden şirket unvanını alır; "Veri Sorumlusunun Kimliği" bölümünde <strong> içinde gösterilir
  - `legalConfig.sellerAddress` — legalConfig objesinden şirket fiziksel adresini alır; "Veri Sorumlusunun Kimliği" bölümünde ve "İlgili Kişi Hakları" bölümünde başvuru adresi olarak gösterilir
  - `legalConfig.sellerEmail` — legalConfig objesinden şirket e-posta adresini alır; "Veri Sorumlusunun Kimliği" bölümünde gösterilir
  - `legalConfig.sellerPhone` — legalConfig objesinden şirket telefon numarasını alır; "Veri Sorumlusunun Kimliği" bölümünde gösterilir
  - `legalConfig.taxOffice` — legalConfig objesinden vergi dairesi bilgisini alır; "Veri Sorumlusunun Kimliği" bölümünde / işareti ile gösterilir
  - `legalConfig.taxNumber` — legalConfig objesinden vergi numarasını alır; "Veri Sorumlusunun Kimliği" bölümünde vergi dairesi bilgisinin yanında gösterilir
  - `legalConfig.mersis` — legalConfig objesinden MERSİS numarasını alır; "Veri Sorumlusunun Kimliği" bölümünde gösterilir
  - `legalConfig.retentionOrders` — legalConfig objesinden sipariş ve faturalandırma kayıtlarının saklama süresini alır; "Saklama Süreleri" bölümünde <strong> içinde gösterilir
  - `legalConfig.retentionSupport` — legalConfig objesinden müşteri destek yazışmalarının saklama süresini alır; "Saklama Süreleri" bölümünde gösterilir
  - `legalConfig.retentionMarketing` — legalConfig objesinden pazarlama izin ve kayıtlarının saklama süresini alır; "Saklama Süreleri" bölümünde gösterilir
  - `legalConfig.retentionLogs` — legalConfig objesinden log ve güvenlik kayıtlarının saklama süresini alır; "Saklama Süreleri" bölümünde gösterilir
  - `legalConfig.applicationEmail` — legalConfig objesinden KVKK başvuru e-posta adresini alır; "İlgili Kişi Hakları" bölümünde başvuru yolu olarak gösterilir
  - `legalConfig.lastUpdated` — legalConfig objesinden aydınlatma metninin son güncelleme tarihini alır; "Yürürlük" bölümünde gösterilir
  - `Routes.legal.cerez()` — Çerez Politikası sayfasının rotasını döndüren fonksiyon; Link bileşeninin href prop'unda <Link> içinde kullanılır
- **Dönüş**: `React.FC` — KVKK aydınlatma metnini Türkçe olarak JSX ile render eden React fonksiyonel bileşeni; Fragment (<>...</>) içinde 8 section'dan oluşan statik bilgilendirme JSX'i döndürür

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\KvkkContent.tsx
  function: src\views\legal\components\tr\KvkkContent.tsx::KvkkContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: KvkkContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-primary-navy`, `text-xl`, `text-xs`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`, `underline`