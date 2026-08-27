---
domain: general
source_type: doc
namespace_type: module
source_path: C:\tmp\vh-altyapi-t165\src\components\admin\shell\useAdminThemeBodyScope.ts
skeleton_hash: 3a8361a82976c8ca
entity_hashes:
  func:useAdminThemeBodyScope: cd448415a9b4837a
  overview: 3f58a351c987c09f
generated_at: 2026-08-27T08:24:00Z
---

## Genel Bakış

Bu modül, admin panelinin tema yönetiminde kullanılan bir React hook'u içerir. `useAdminThemeBodyScope` fonksiyonu, çözümlenmiş admin teması bilgisini alarak body elementi üzerinde tema scope'u uygular. Modül, shell (kabuk) bileşenleri arasında tema uygulama sorumluluğunu üstlenir.

## Fonksiyon Grupları

### Tema Scope Yönetimi
Body elementine çözümlenmiş admin temasını uygulamakla sorumludur. Admin panelinin genel görünümünün tema ayarlarına göre şekillendirilmesini sağlar.
- useAdminThemeBodyScope

---

## AXIOMS – Mimari Varsayımlar

Bu modül için özel aksiyom tanımlanmamıştır.

**Neden:** Fonksiyon gövdesi verilmemiştir; yalnızca imza (`useAdminThemeBodyScope(themeResolved: AdminThemeResolved) -> void`) mevcuttur. Aksiyomlar yalnızca fonksiyon gövdesinden üretilir. Gövde olmadan modülün iç davranışına ilişkin varsayım üretilemez.

---

## FONKSİYON DETAYLARI

### useAdminThemeBodyScope

**Ne yapar**: Admin temasının çözümlenmiş değerini (`AdminThemeResolved`) `document.body` özniteliği olarak uygular. Bu sayede Radix UI bileşenlerinin `Portal` ile `document.body` altına taşıdığı `Dialog`, `DropdownMenu` gibi katmanlar da tema kapsamı dışında kalmaz ve admin token'larına erişebilir. Tema kaldırıldığında veya tema değeri değiştiğinde önceki durumu geri yükleyerek temiz bir temizlik sağlar.

**Nasıl yapar**: React'in `useEffect` kancasını kullanarak `themeResolved` değeri her değiştiğinde `document.body` üzerinde `ADMIN_THEME_ATTR` adlı veri özniteliğini ayarlar. Efekt başlamadan önce mevcut `body` özniteliğinin değeri `onceki` değişkenine kaydedilir; bu, iç içe geçmiş birden fazla admin yüzeyi (örneğin bir yerleşim içinde başka bir yerleşim) aynı anda mount edildiğinde dıştaki kapsamın içteki çözüldüğünde kaybolmamasını sağlar. Temizlik fonksiyonunda (`return` bloğu) eğer öncesinde bir değer yoksa (`null`) öznitelik tamamen kaldırılır; varsa eski değer geri yüklenir. Bağımlılık dizisi yalnızca `[themeResolved]` içerdiğinden efekt sadece tema değeri değiştiğinde yeniden çalışır.

**Parametreler**:
- `themeResolved`: `AdminThemeResolved` — Uygulanacak çözümlenmiş tema tanımlayıcısı. Admin CSS token'larının `[data-admin-theme]` özniteliği altında tanımlı değerlere karşılık gelen tema kimliğini temsil eder.

**Dönüş**: `void` — Herhangi bir değer döndürmez. Yan etki (side effect) odaklı bir kancadır; `document.body` üzerinde DOM manipülasyonu gerçekleştirir.

---

## İTHALATLAR (IMPORTS)
- import: ./themeCookie::type { AdminThemeResolved }
- import: react::useEffect

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/components/admin/shell/useAdminThemeBodyScope.ts::useAdminThemeBodyScope
- **params**: `themeResolved: AdminThemeResolved` — uygulanacak admin teması çözümü
- **ic_degiskenler**:
  - `body` — `document.body` referansı, tema attribute'unun ekleneceği/silineceği DOM öğesi
  - `onceki` — `body.getAttribute(ADMIN_THEME_ATTR)` sonucu; bileşen mount edilmeden önceki tema attribute değeri, cleanup sırasında geri yüklenmek üzere saklanır
  - `ADMIN_THEME_ATTR` — kaynakta tanımlı olmayan dış sabit; body öğesine yazılan tema attribute adı
- **Dönüş**: yok (void) — useEffect cleanup fonksiyonu döndürür ama bu useEffect'in kendi mekanizmasıdır, fonksiyonun doğrudan dönüşü yoktur

---

## NODE ID STANDARD

  file: src\components\admin\shell\useAdminThemeBodyScope.ts
  function: src\components\admin\shell\useAdminThemeBodyScope.ts::useAdminThemeBodyScope

---

## DISA AKTARILANLAR (EXPORTS)
  export: useAdminThemeBodyScope