---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\en\DistanceSalesAgreementContent.tsx
skeleton_hash: 395cbc61e8d932d7
entity_hashes:
  func:DistanceSalesAgreementContentEn: bfe8e97d806ef01d
  overview: 369140ee20d8846f
  style_tokens: 083693da379aea89
generated_at: 2026-06-16T11:55:18Z
---

## Genel Bakış
Bu modül, mesafe satış sözleşmesinin İngilizce versiyonunu sunan bir React bileşenidir. Yasal zorunluluklar kapsamında, kullanıcılara sözleşme metnini okunabilir bir formatta sunmayı amaçlar.

## Fonksiyon Grupları
### Yasal İçerik Bileşeni
Modülün tek birincil bileşenidir ve mesafe satış sözleşmesinin tam İngilizce metnini render eder.
- DistanceSalesAgreementContentEn

---

## AXIOMS – Mimari Varsayımlar
Bu modül, verilen `lang` parametresine göre dil-duyarlı bir React bileşeni döndüren bir fabrika fonksiyonudur.

[Aksiyom 1]: Eğer `lang` parametresi `DistanceSalesAgreementContentEn` fonksiyonuna sağlanmazsa, bileşenin doğru çalışması için gerekli olan dil bilgisi eksik kalır ve fonksiyon, geçerli bir React bileşeni üretemez.

[Aksiyom 2]: Eğer `lang` parametresi, bileşenin desteklediği diller listesinde (örn: 'en', 'tr') yer almıyorsa, bileşen varsayılan bir dil veya hata durumu göstermek zorunda kalır; bu da beklenmeyen bir davranışa yol açar.

[Aksiyom 3]: Eğer bileşenin rendered ettiği React bileşen ağacı (JSX), `lang` parametresine bağlı olarak metin içeriğini veya diğer locale-dependent elemanları dil-duyarlı şekilde dönüştüremiyorsa, yasal sözleşme içeriği yanlış veya tutarsız bir şekilde görüntülenir.

---

## FONKSİYON DETAYLARI

### DistanceSalesAgreementContentEn

**Ne yapar**: Bu fonksiyon, e-ticaret platformunda yasal olarak zorunlu olan Mesafeli Satış Sözleşmesi'nin İngilizce versiyonunu render eden bir React functional component'tir. Kullanıcılara satın alma sürecinde sunulacak sözleşme içeriğini dil parametresine göre dinamik olarak görüntüler.

**Nasıl yapar**: Fonksiyon, bir React functional component olarak tanımlanmış ve `React.FC<{ lang: string }>` generic tipi ile parametre almaktadır. Component, `lang` prop'unu kullanarak sözleşme içeriğinin dil seçeneğini belirler ve JSX olarak formatlanmış sözleşmenin HTML yapısını döndürür. TSX formatında寫lmış olup, React fragment veya div wrapper içinde yasal metinleri ve maddeleri render eder.

**Parametreler**:
- `lang`: `string` — Component'in dil ayarını belirten prop'tur. Sözleşme içeriğinin hangi dilde gösterileceğini kontrol eder. Bu prop object destructuring ile `props` nesnesinden çıkarılır.

**Dönüş**: `React.JSX.Element` — Mesafeli Satış Sözleşmesi'nin İngilizce içeriğini içeren JSX yapısı. `React.FC` return type'ı olarak belirlenmiştir ve component, sözleşme maddelerini, tarafların hak ve yükümlülüklerini, iptal/iptal koşullarını ve yasal bilgilendirmeleri içeren tam bir HTML yapısı döndürür.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentEn
- **params**: `lang` — 函数签名中声明的语言参数，用于区分显示语言（如 'en'），但在函数体中**未使用**。
- **ic_degiskenler**:
  (无函数内部局部变量。所有数据均通过 `legalConfig` 外部配置对象的属性直接内联在JSX中使用。)
- **Dönüş**: 返回一个 React 函数组件 (`React.FC`)，该组件无条件渲染一组用于展示《远程销售协议》英文条款的 `<section>` HTML元素。

---

## NODE ID STANDARD

  file: src\views\legal\components\en\DistanceSalesAgreementContent.tsx
  function: src\views\legal\components\en\DistanceSalesAgreementContent.tsx::DistanceSalesAgreementContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: DistanceSalesAgreementContentEn

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-sm`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `mb-3`, `mt-2`