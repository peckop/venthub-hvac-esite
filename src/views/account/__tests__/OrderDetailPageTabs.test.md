---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\views\account\__tests__\OrderDetailPageTabs.test.tsx
skeleton_hash: 0dcee3e7957afde5
entity_hashes:
  overview: 5f6ed09bbad82738
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-08T10:10:59Z
---

## Genel Bakış

Bu dosya, OrderDetailPage bileşeninin sekmeli görünümünü test eden bir Vitest dosyasıdır. React Testing Library ile bileşenin render edilmesi ve kullanıcı etkileşimleri doğrulanır. Dosya izole bir test ortamında çalışır; harici API veya ortam değişkeni kullanmaz, yalnızca yerel mock veriler (sipariş satırı ve sahte navigasyon) ile senaryoları yürütür.

## Dosya Yapısı

Test dosyası fonksiyon içermez; modül-seviyesi tanımlamalardan oluşur:

- **Test Ortamı Kurulumu**: `beforeEach` ile her test öncesi mockNavigasyon ve render işlemleri sıfırlanır
- **Test Senaryoları**: `describe`, `it` blokları içinde bileşenin farklı senaryolara göre davranışı doğrulanır
- **Test Verileri**: `orderRow` sabiti (sipariş kimliği, tutar, durum, tarih alanlarını içeren örnek nesne) ve `mockNavigate` (vi.fn() ile oluşturulmuş sahte navigasyon fonksiyonu)

Dosya, harici bağımlılıktan tamamen arındırılmış izole bir test modülüdür; herhangi bir API çağrısı yapmaz veya ortam değişkeni okumaz.

---

## AXIOMS – Mimari Varsayımlar
Bu test modülünün doğru çalışması için aşağıdaki mimari varsayımların karşılanması gerekmektedir.

[Aksiyom 1]: Eğer Vitest test çalıştırıcısı

---

## FONKSİYON DETAYLARI

---

## SABİTLER
- **mockNavigate** (call) — `vi.fn()`
- **orderRow** (object) — `{
  id: 'ord1',
  total_amount: 250,
  status: 'shipped',
  created_at: n...`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: `__tests__/OrderDetailPageTabs.test.tsx`::anonymous_async_1
- **params**: (yok)
- **ic_degiskenler**:
  - `actual` — `vi.importActual('next/navigation')` sonucu; orijinal next/navigation modülünü tutar
- **Dönüş**: `{ ...actual, useRouter: () => mockNavigate }` — next/navigation modülünü genişleterek useRouter'ı mockNavigate ile değiştiren nesne

---

## NODE ID STANDARD

  file: src\views\account\__tests__\OrderDetailPageTabs.test.tsx

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