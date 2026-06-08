---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContextDefinition.ts
skeleton_hash: d6530f0fb124bc6c
entity_hashes:
  overview: f2f5edb4e854ff35
generated_at: 2026-06-08T10:09:32Z
---

## Genel Bakış

Bu modül, VentHub HVAC projesinde kimlik doğrulama verilerinin uygulama geninde paylaşılmasını sağlayan merkezi bir React Context tanımıdır. Supabase'in `User` ve `Session` tiplerini, uygulama özelinde tanımlanmış `UserRole` rol tipi ile birleştirerek tip güvenli bir `AuthContext` nesnesi oluşturur. Modül, kimlik doğrulama işlevlerinin (giriş yapma, kayıt olma, çıkış yapma, şifre sıfırlama) ve ilgili durumların (kullanıcı, oturum, rol, yükleme) tanımını sağlar; bu işlevlerin Gerçek zamanlı olarak Supabase Auth API'leri ve veritabanı tablolarını kullanması beklenir.

---

## AXIOMS – Mimari Varsayımlar

Bu modül, bir React Context nesnesi tanımlayan ve dışa aktaran bir tiptir.

[Aksiyom 1]: Eğer `AuthContext` modülde tanımlı değilse veya dışa aktarılmamışsa, uygulama geninde kimlik doğrulama durumu paylaşımı yapılamaz.

[Aksiyom 2]: Eğer `AuthContext` React.createContext tarafından üretilmemiş bir değerse (call edilebilir yapı bozulmuşsa), bileşenler bağlamı tüketemeyecektir.

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
- **params**: (yok — sabit(context) tanımı, fonksiyon değil)
- **ic_degiskenler**: (yok — fonksiyon gövdesi mevcut değil)
- **Dönüş**: `Context<AuthContextType | undefined>` — `createContext` çağrısı sonucu dönen React Context nesnesi

---

## NODE ID STANDARD

  file: src\contexts\AuthContextDefinition.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthContext
  export: AuthContextType
  export: AuthError