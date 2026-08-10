---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\components\products\3d\core\useDeviceDpr.ts
skeleton_hash: f2522f8b03b35dcf
entity_hashes:
  func:useDeviceDpr: 012742c3009a2a83
  overview: 342ae1b608f7779b
generated_at: 2026-06-20T05:03:09Z
---

## Genel Bakış
Bu modül, kullanıcının cihazının donanım çözünürlük oranını hesaplayarak 3D sahnelerin farklı ekranlarda net ve performanslı görüntülenmesini sağlar. Tek bir React hook olan useDeviceDpr, cihaz DPR'ını alır ve 3D grafik motoru için optimize edilmiş bir piksel yoğunluğu döndürür.

## Fonksiyon Grupları
### Cihaz Çözünürlük Oranı Hesaplama
Bu grup, tarayıcı ve işletim sistemi API'lerini kullanarak gerçek cihaz DPR değerini hesaplar ve 3D grafikler için uygun bir değere dönüştürür.
- useDeviceDpr

---

## AXIOMS – Mimari Varsayımlar
- Bu modül davranışsal mantık içermez (salt veri / konfigürasyon / tip tanımı).
- [Aksiyom 1]: Modülün dışa açtığı yapı (anahtar kümesi / şema) bir sözleşmedir; tüketiciler bu sabit yapıya bağlıdır — kırıcı değişiklik tüm tüketicileri etkiler.
- [Aksiyom 2]: Bir öğe ekleme/çıkarma yapısal-uyumlu olmalı; ilgili tipler ve seçiciler aynı commit'te güncel tutulmalıdır.

---

## FONKSİYON DETAYLARI

### useDeviceDpr
**Ne yapar**: Cihazın piksel oranını (Device Pixel Ratio - DPR) hesaplar ve masaüstü veya mobil için tanımlanmış bir üst sınırla (cap) kısıtlar. Bu, mobil cihazlarda aşırı yüksek DPR'nin oluşturabileceği performans sorunlarını önlemek için kullanılır.

**Nasıl yapar**: Fonksiyon, React'ın `useMemo` hook'u ile sonucu bellekte depolayarak her render'da yeniden hesaplanmasını önler. İlk olarak tarayıcı tarafında olup olmadığını kontrol eder (`typeof window === 'undefined'`) ve sunucu tarafı oluşturumunda 1 döndürür. Ardından, `window.matchMedia('(pointer: coarse)')` sorgusuyla cihazın dokunmatik ekranlı (genellikle mobil) olup olmadığını belirler. Bu duruma göre `desktop` veya `mobile` sınırını seçer. Son olarak, cihazın gerçek `devicePixelRatio` değeri ile bu sınırın minimumunu döndürerek DPR'yi kısıtlar.

**Parametreler**:
- `cap`: `Partial<DprCap>` (isteğe bağlı) — `DprCap` tipinin bir parçası olan bir nesne. `desktop` ve/veya `mobile` özelliklerini içerebilir. Sağlanmazsa, `DEFAULT_CAP` sabitinde tanımlı varsayılan değerler kullanılır (masaüstü için 1.0, mobil için 1.5).

**Dönüş**: `number` — Kısıtlanmış (capped) cihaz piksel oranı. Sunucu tarafında 1, istemci tarafında ise `Math.min(window.devicePixelRatio, selectedCap)` sonucudur.

---

## İTHALATLAR (IMPORTS)
- import: react::useMemo

---

## INTERFACES

### DprCap
- `desktop: number`
- `mobile: number`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\components\products\3d\core\useDeviceDpr.ts::useDeviceDpr
- **params**: `cap?: Partial<DprCap>` — opsiyonel DPR (Device Pixel Ratio) kapasite ayarları nesnesi
- **ic_degiskenler**:
  - `desktop` — masaüstü cihazlar için maksimum DPR limiti; `cap?.desktop` değerinden veya `DEFAULT_CAP.desktop` varsayılanından alınır
  - `mobile` — mobil cihazlar için maksimum DPR limiti; `cap?.mobile` değerinden veya `DEFAULT_CAP.mobile` varsayılanından alınır
  - `coarse` — `window.matchMedia('(pointer: coarse)')` ile kontrol edilen, coarse pointer (dokunmatik ekran) olup olmadığını belirten boolean
  - `limit` — `coarse` durumuna göre `mobile` veya `desktop` limitlerinden birini seçen değişken
  - `device` — `window.devicePixelRatio` değerinden alınan gerçek cihaz DPR'ı, yoksa 1
- **Dönüş**: `number` — hesaplanan DPR değeri (gerçek DPR ile limitin minimumu)

---

## NODE ID STANDARD

  file: src\components\products\3d\core\useDeviceDpr.ts
  function: src\components\products\3d\core\useDeviceDpr.ts::useDeviceDpr

---

## DISA AKTARILANLAR (EXPORTS)
  export: DprCap
  export: useDeviceDpr