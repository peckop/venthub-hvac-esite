---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContextDefinition.ts
skeleton_hash: a2d540bab1caba16
entity_hashes:
  overview: bd987590e3d0b068
generated_at: 2026-05-28T22:37:32Z
---

## Genel Bakış

Bu modül, VentHub HVAC projesinde kimlik doğrulama verilerinin uygulama geninde paylaşılmasını sağlayan merkezi bir React Context tanımıdır. Supabase'in `User` ve `Session` tiplerini, uygulama özelinde tanımlanmış `UserRole` rol tipi ile birleştirerek tip güvenli bir `AuthContext` nesnesi oluşturur.

Modül herhangi bir iş mantığı, API çağrısı veya veritabanı sorgusu içermez; yalnızca üst seviye bir bağlam tanımı ve tip aktarımı realizasyonudur. Kimlik doğrulama akışının yürütülmesi (`AuthProvider`, `useAuth` hook'u vb.) bu dosyanın sorumluluğu dışında, ilgili bileşenlerde gerçekleşir.

---

## AXIOMS – Mimari Varsayımlar
Bu modül, React uygulamasında kimlik doğrulama bağlamı (context) tanımı yapmakla yükümlüdür.

[Aksiyom 1]: Eğer React'ten createContext fonksiyonu içe akt

---

## FONKSİYON DETAYLARI

---

## INTERFACES

### AuthError
- `message: string`

### AuthContextType
- `user: User | null`
- `session: Session | null`
- `role: UserRole | null`
- `loading: boolean`
- `roleLoading: boolean`
- `signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error?: AuthError }>`
- `signUp: (email: string, password: string, name: string) => Promise<{ error?: AuthError }>`
- `signOut: () => Promise<void>`
- `resetPassword: (email: string) => Promise<{ error?: AuthError }>`
- `refreshSession: () => Promise<Session | null>`

---

## SABİTLER
- **AuthContext** (call) — `createContext<AuthContextType | undefined>(undefined)`

---

## AST POINTERS

### [N1_NASIL] AST Pointer: src/contexts/AuthContextDefinition.ts::AuthContext
- **params**: `(call) createContext<AuthContextValue | undefined>(undefined)` — createContext çağrısı ile AuthContext oluşturulur, başlangıç değeri `undefined` olarak atanır
- **ic_degiskenler**: yok — dosya sadece context tanımı içerir, fonksiyon gövdesi bulunmamaktadır
- **Dönüş**: `React.Context<AuthContextValue | undefined>` — React Context nesnesi döner;供給cısı olmayan bileşenler `undefined` alır

---

## NODE ID STANDARD

  file: src\contexts\AuthContextDefinition.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthContext
  export: AuthContextType
  export: AuthError