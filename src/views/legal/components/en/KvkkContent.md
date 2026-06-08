---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\legal\components\en\KvkkContent.tsx
skeleton_hash: 2256f29f21af04c8
entity_hashes:
  func:KvkkContentEn: b6b9afca055a94f3
  overview: bd4d754aa0f4c151
  style_tokens: 06e3f7beac6824a2
generated_at: 2026-06-08T10:11:02Z
---

## Genel Bakış
KVKK (Kişisel Verilerin Korunması Kanunu) metinlerinin İngilizce versiyonunu görüntülemek için kullanılan bir bileşen modülüdür. Modül, hukuki içerik sayfasında yer alacak statik metin ve düzeni sağlamakla sorumludur.

## Fonksiyon Grupları

### Hukuki İçerik Gösterimi
KVKK aydınlatma metninin İngilizce çevirisini içeren React bileşenini oluşturur.
- KvkkContentEn

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** 
- Fonksiyon imzası `KvkkContentEn()` olarak parametresiz tanımlanmıştır; herhangi bir input bağımlılığı veya koşul belirlenememektedir.
- Fonksiyon gövdesine erişim olmadığından, içsel iş mantığı çıkarılamamaktadır.
- Modül sabitleri tanımlı değildir.
- Salt React bileşeni olup statik içerik render ettiği varsayılsa da, bu genel bir React bileşeni davranışı olup modüle özgü mimari bir aksiyom değildir.

---

## FONKSİYON DETAYLARI

### KvkkContentEn
**Ne yapar**: KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında İngilizce dilinde yasal bilgilendirme içeriği sunan React bileşenini oluşturur. Bu bileşen, kullanıcıların kişisel verilerinin işlenmesine ilişkin yasal haklarını ve şirketin veri koruma politikalarını görsel olarak sunar.

**Nasıl yapar**: Fonksiyon bir React Functional Component olarak tanımlanmıştır. Hiçbir parametre almaz ve doğrudan JSX yapısı döndürerek KVKK yasal metinlerini düzenli bir şekilde render eder. Bileşen, yasal zorunluluk kapsamında bulunması gereken veri işleme şartları, kullanıcı hakları ve aydınlatma metinlerini yapılandırılmış bir biçimde sunar.

**Parametreler**:
- Fonksiyon herhangi bir parametre almamaktadır (propsless bileşen)

**Dönüş**: `React.FC` — KVKK ile ilgili İngilizce yasal içerik metinlerini içeren React bileşeni döndürür. Bileşen, sayfa üzerinde render edilebilir tam bir arayüz yapısı (JSX) içermektedir.

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/views/legal/components/en/KvkkContent.tsx::KvkkContentEn
- **params**: (parametre yok)
- **ic_degiskenler**: (yok — fonksiyon gövdesinde herhangi bir değişken tanımlanmıyor)
- **Dönüş**: JSX.Element (React Fragment — hukuki bilgilendirme içeriğini JSX olarak döndürür, yasal bilgileri section'lar halinde sunar)

---

## NODE ID STANDARD

  file: src\views\legal\components\en\KvkkContent.tsx
  function: src\views\legal\components\en\KvkkContent.tsx::KvkkContentEn

---

## DISA AKTARILANLAR (EXPORTS)
  export: KvkkContentEn

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