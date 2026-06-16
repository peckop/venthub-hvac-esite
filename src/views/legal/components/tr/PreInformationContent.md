---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\tr\PreInformationContent.tsx
skeleton_hash: deecee421012ed19
entity_hashes:
  func:PreInformationContentTr: 98660646f84fea87
  overview: 7175f4ccbd30c8a8
  style_tokens: 5c1748e6c54f7f63
generated_at: 2026-06-16T11:57:25Z
---

## Genel Bakış

Bu modül,VentHub HVAC uygulamasının yasal bilgilendirme bölümünde Türkçe olarak görüntülenen ön bilgilendirme içeriğini sunan bir React bileşenidir. Dil destekli bir yapıya sahiptir ve farklı dil varyantları için ayrı bileşenler olarak tasarlanmıştır.

## Fonksiyon Grupları

### Dil Destekli İçerik Sunumu
Modül, belirli bir dildeki yasal ön bilgilendirme içeriğini render eden tek bir bileşen içerir.
- PreInformationContentTr

---

## AXIOMS – Mimari Varsayımlar

Bu modül için minimum sayıda mimari varsayım tanımlanmıştır, çünkü fonksiyon gövdesine erişim olmayıp yalnızca imza bilgisi mevcuttur.

[Aksiyom 1]: Eğer `lang` prop'u bileşene sağlanmazsa, bileşen tanımsız (`undefined`) dil değerine sahip olur ve içerik gösterimi hatalı çalışır.

[Aksiyom 2]: Eğer `lang` prop'u `"tr"` değerinden farklı bir değer olarak sağlanısa, bileşen yine de Türkçe içerik döndürebilir (bileşin adı `Tr` suffix'i içermektedir).

---

**Not:** Bu modül için yalnızca fonksiyon imzası verildiğinden, bileşenin içinde hangi koşullara göre içerik render ettiği, hangi veri yapılarını beklediği veya hangi alt bileşenleri kullandığı bilinmemektedir. Tam aksiyon kümesi için bileşen gövdesinin analiz edilmesi gereklidir.

---

## FONKSİYON DETAYLARI

### PreInformationContentTr

**Ne yapar**: Bu fonksiyon, yasal bilgilendirme sayfası için Türkçe önbilgi (pre-information) içeriğini gösteren bir React fonksiyonel bileşeni döndürür. VentHub HVAC uygulamasının yasal sayfalarında kullanılmak üzere tasarlanmış, dil destekli bir içerik bileşenidir.

**Nasıl yapar**: Fonksiyon, doğrudan bir `React.FC` (Fonksiyonel Bileşen) tipini döndürür. Bu, React'ta class tabanlı olmayan, fonksiyonel yapıda tanımlanan bileşenler için kullanılan standart bir tiptir. Fonksiyonun `lang` prop'u alması, içeriğin farklı dillere göre (örn: 'tr', 'en') gösterilmesini mümkün kılar. Dosya yapısına (`views/legal/components/tr/`) bakıldığında, bu bileşenin yasal sayfalarda Türkçe diline özgü içerikleri render ettiği anlaşılmaktadır.

**Parametreler**:
- lang: string — Bileşenin hangi dille içerik göstereceğini belirten dil kodu. Bu prop sayesinde bileşen, farklı dil tercihlerine göre içeriğini dinamik olarak değiştirebilir.

**Dönüş**: `React.FC<{ lang: string }>` — Belirtilen `lang` prop'unu kabul eden, React fonksiyonel bileşeni türünde bir bileşen döndürür. Bu bileşen, render edildiğinde yasal önbilgi içeriğini ilgili dilde sunar.

---

## İTHALATLAR (IMPORTS)
- import: @/config/legal::legalConfig
- import: react::React

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/tr/PreInformationContent.tsx::PreInformationContentTr
- **params**: ()
- **ic_degiskenler**: yok
- **Dönüş**: JSX fragment (React element)

---

## NODE ID STANDARD

  file: src\views\legal\components\tr\PreInformationContent.tsx
  function: src\views\legal\components\tr\PreInformationContent.tsx::PreInformationContentTr

---

## DISA AKTARILANLAR (EXPORTS)
  export: PreInformationContentTr

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** `text-industrial-gray`, `text-xl`
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** `font-semibold`, `list-disc`, `mb-3`, `mt-2`, `pl-6`, `space-y-1`