---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\hooks\__tests__\useRole.effect-stability.test.tsx
skeleton_hash: d7c0429ccb2dafe2
entity_hashes:
  func:AccessEffectHarness: a6a68c25a9adade8
  func:EffectDepHarness: 628e227026e08955
  overview: 262a0070733a53b4
  style_tokens: dd5ed8d0f58dcf57
generated_at: 2026-06-19T06:51:36Z
---

## Genel Bakış

Bu modül, `useRole` hook'unun efekt stabilitesini test etmek için kullanılan iki test harness (test süspan) bileşeni içerir. Test ortamında hook'un yan etkilerinin gereksiz yere tetiklenmediğini doğrulamak amacıyla tasarlanmış yardımcı test araçlarıdır.

## Fonksiyon Grupları

### Test Harness Bileşenleri

Test senaryolarında kullanılmak üzere minimal React bileşenleri sağlar; her biri efekt tetikleme durumunu izlemek için bir geri çağırma alır.

- `EffectDepHarness` — Bağımlılık değişimlerindeki efekt stabilitesini test etmek için kullanılan harness bileşeni
- `AccessEffectHarness` — Erişim (role) değişimlerindeki efekt stabilitesini test etmek için kullanılan harness bileşeni

---

## AXIOMS – Mimari Varsayımlar
Bu modül, test bileşenlerinden oluştuğu için, test edilen modülün (useRole) yan etki davranışlarını doğrulamak üzere tasarlanmıştır. Aşağıdaki varsayımlar, bu test harness bileşenlerinin doğru çalışması için gereklidir.

[Aksiyom 1]: Eğer `onEffect` prop'u sağlanmamışsa veya çağrılamayan bir değer (null, undefined, fonksiyon olmayan bir nesne vb.) olarak verilmişse, `EffectDepHarness` bileşeni yan etkiyi tetikleyemez veya beklenmedik bir hata oluşur.

[Aksiyom 2]: Eğer `onEffect` prop'u sağlanmamışsa veya çağrılamayan bir değer olarak verilmişse, `AccessEffectHarness` bileşeni yan etkiyi tetikleyemez veya beklenmedik bir hata oluşur.

---

## FONKSİYON DETAYLARI

### EffectDepHarness

**Ne yapar**: Bu test harness bileşeni, `useRole` hook'unun `canWrite` değerindeki değişiklikleri izleyerek yan etki (effect) tetikleme davranışını doğrulamak için tasarlanmıştır. Bileşen, `canWrite` izni değiştikten sonra verilen callback fonksiyonunu çalıştırmaktadır.

**Nasıl yapar**: `useRole()` hook'unu çağırarak `canWrite` değerini elde eder. Ardından `React.useEffect` hook'u ile `canWrite` bağımlılık dizisine bağlı bir efekt tanmlar. `canWrite` değeri her değiştiğinde, bağımlılık dizisindeki değişim algılanır ve `onEffect` callback fonksiyonu çalıştırılır. Bileşen herhangi bir JSX render etmediği için `null` döndürür; bu durum bileşeni görünmez bir izleme aracı olarak kullanır.

**Parametreler**:
- `onEffect` — `() => void` — `canWrite` izni değiştiğinde tetiklenmesi istenen callback fonksiyonu; bu fonksiyon herhangi bir parametre almaz ve değer döndürmez

**Dönüş**: `null` — Bileşen herhangi bir arayüz elementi render etmez, görünmez bir test çatısı (harness) olarak görev yapar

### AccessEffectHarness
**Ne yapar**: Geliştirildi ancak detay üretilemedi.

---

## İTHALATLAR (IMPORTS)
- import: ../useRole::useRole
- import: @testing-library/react::render
- import: react::React
- import: vitest::describe
- import: vitest::expect
- import: vitest::it
- import: vitest::vi

---

## AST POINTERS

### [N1_NASIL] AST Pointer: hooks/__tests__/useRole.effect-stability.test.tsx::EffectDepHarness
- **params**: `{ onEffect }: { onEffect: () => void }`
- **ic_degiskenler**:
  - `canWrite` — `useRole()` hook'undan destructure edilen boolean; useEffect dependency'si olarak kullanılır, parent re-render'da yeniden render edilip edilmeyeceğini test eder
- **Dönüş**: `null` — React component, JSX render etmez

---

### [N2_NASIL] AST Pointer: hooks/__tests__/useRole.effect-stability.test.tsx::AccessEffectHarness
- **params**: `{ onEffect }: { onEffect: () => void }`
- **ic_degiskenler**:
  - `canAccess` — `useRole()` hook'undan destructure edilen boolean; useEffect dependency'si olarak kullanılır, parent re-render'da yeniden render edilip edilmeyeceğini test eder
- **Dönüş**: `null` — React component, JSX render etmez

---

### [N3_NASIL] AST Pointer: hooks/__tests__/useRole.effect-stability.test.tsx::(test callback: "canWrite bir useEffect bağımlılığıyken parent re-render efekti TEKRAR çalıştırmaz")
- **params**: (yok)
- **ic_degiskenler**:
  - `onEffect` — `vi.fn()` ile oluşturulan mock fonksiyon; EffectDepHarness'a prop olarak geçirilir, useEffect'in kaç kez çağrıldığını assert etmek için kullanılır
  - `ui` — JSX ifadesi; `<EffectDepHarness onEffect={onEffect} />` bileşeni, render'a parametre olarak verilir
  - `rerender` — `render(ui)` return değerinden destructure edilen fonksiyon; bileşeni aynı prop'larla tekrar render etmek için çağrılır (iki kez)
- **Dönüş**: yok (test callback) — `onEffect` mock'unun `toHaveBeenCalledTimes(1)` ile assert edilmesi yan etkisi

---

### [N4_NASIL] AST Pointer: hooks/__tests__/useRole.effect-stability.test.tsx::(test callback: "canAccess bir useEffect bağımlılığıyken parent re-render efekti TEKRAR çalıştırmaz")
- **params**: (yok)
- **ic_degiskenler**:
  - `onEffect` — `vi.fn()` ile oluşturulan mock fonksiyon; AccessEffectHarness'a prop olarak geçirilir, useEffect'in kaç kez çağrıldığını assert etmek için kullanılır
  - `ui` — JSX ifadesi; `<AccessEffectHarness onEffect={onEffect} />` bileşeni, render'a parametre olarak verilir
  - `rerender` — `render(ui)` return değerinden destructure edilen fonksiyon; bileşeni aynı prop'larla tekrar render etmek için çağrılır (iki kez)
- **Dönüş**: yok (test callback) — `onEffect` mock'unun `toHaveBeenCalledTimes(1)` ile assert edilmesi yan etkisi

---

## NODE ID STANDARD

  file: src\hooks\__tests__\useRole.effect-stability.test.tsx
  function: src\hooks\__tests__\useRole.effect-stability.test.tsx::EffectDepHarness
  function: src\hooks\__tests__\useRole.effect-stability.test.tsx::AccessEffectHarness

---

## DISA AKTARILANLAR (EXPORTS)
  export: AccessEffectHarness
  export: EffectDepHarness

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