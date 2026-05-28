---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\app\[lang]\legal\kvkk\page.tsx
skeleton_hash: 152440e4335d74fd
entity_hashes:
  func:Page: 02ee67f324c336e5
  overview: 0087da9b3ff4e9df
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-05-28T22:34:58Z
---

## Genel Bakış
Bu modül, KVKK (Kişisel Verilerin Korunması Kanunu) ile ilgili yasal içeriği kullanıcıya sunan bir Next.js sayfasıdır. Modülün tek sorumluluğu, ilgili yasal metni ve bileşenleri düzenleyerek kullanıcılara bilgilendirme sağlamaktır.

## Fonksiyon Grupları
### Sayfa Oluşturma ve Render
Sayfanın görsel çıktısını üretir; KVKK metnini ve gerekli bileşenleri düzenleyerek kullanıcıya sunar.  
- Page

---

## AXIOMS – Mimari Varsayımlar

Bu modül için fonksiyon gövdesi verilmediğinden ve fonksiyon imzasında (`Page()`) herhangi bir parametre veya koşul belirtilmediğinden, sadece fonksiyon imzasına dayalı mimari varsayımlar çıkarılamamaktadır.

**Not:** Fonksiyon imzasında parametre bulunmamakla birlikte, modül Next.js `[lang]` route segment'i kullanmaktadır. Bu dil parametresinin Next.js tarafından otomatik olarak enjekte edildiği varsayılmaktadır. Ancak bu bilgi fonksiyon gövdesinden değil, kaynak yolundan türetildiği için aksiyom olarak raporlanmamaktadır.

---

*Fonksiyon gövdesi sağlandığında, daha spesifik mimari varsayımlar eklenebilir.*

---

## FONKSİYON DETAYLARI

### Page

**Ne yapar**: Next.js uygulamasında KVKK (Kişisel Verilerin Korunması Kanunu) yasal sayfasını render eden üst seviye sayfa bileşenidir. Bu fonksiyon, belirli bir dil parametresi (`[lang]`) ile erişilebilir olan yasal bilgilendirme sayfasının ana giriş noktasıdır.

**Nasıl yapar**: Fonksiyon, doğrudan `PageComponent` adlı bileşeni döndürür. Herhangi bir veri getirme (fetching), state yönetimi veya yan etki içermez. Sayfa ile ilgili tüm iş mantığı, sunum katmanı ve dil desteği gibi sorumluluklar tamamen `PageComponent` bileşenine devredilmiştir. Bu yapı, sayfa tanımını minimal tutarak bileşen hiyerarşisinde net bir ayrım sağlar.

**Parametreler**:

Bu fonksiyon herhangi bir parametre almamaktadır. Next.js App Router yapısı gereği dil bilgisi (`[lang]`) URL segmentinden otomatik olarak işlenir ve ilgili alt bileşenlere iletilir.

**Dönüş**: `JSX.Element` — `PageComponent` bileşeninin render ettiği React JSX yapısını döndürür. Sayfa içeriği, düzeni ve dil destekli metinler bu bileşen tarafından yönetilir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/app/[lang]/legal/kvkk/page.tsx::Page
- **params**: (parametre yok)
- **ic_degiskenler**: (yok)
- **Dönüş**: `<PageComponent />` JSX — import edilen `PageComponent` (views/legal/KVKKPage) bileşenini doğrudan render eden sarmalayıcı sayfa bileşeni; component composition pattern ile sayfa içeriğini alt bileşene devreder

---

## NODE ID STANDARD

  file: src\app\[lang]\legal\kvkk\page.tsx
  function: src\app\[lang]\legal\kvkk\page.tsx::Page

---

## DISA AKTARILANLAR (EXPORTS)
  export: Page

---

## STİL TOKENLERİ

### Arbitrary Değerler (token'a geçirilmemiş)
Yok — tüm stiller token'a geçirilmiş. ✅

### Kullanılan Token'lar (zaten token'a geçirilmiş)
- (yok)

### Tailwind Sınıf Özeti
- **Renkler:** (yok)
- **Layout:** (yok)
- **Varyant/Responsive:** (yok)
- **Yardımcı Sınıflar:** (yok)