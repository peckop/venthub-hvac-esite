---
domain: general
source_type: doc
namespace_type: module
source_path: C:\Users\alize\venthub-hvac\src\contexts\AuthContextDefinition.ts
skeleton_hash: a2d540bab1caba16
generated_at: 2026-05-23T22:28:43Z
---

## Genel Bakış
Bu modül, VentHub HVAC projesinin kimlik doğrulama akışını desteklemek amacıyla React tabanlı merkezi bir kimlik doğrulama bağlamı (Auth Context) tanımlar. Uygulamanın tüm bileşenlerinde paylaşılacak kullanıcı oturumu, kullanıcı bilgisi ve yetki verilerine erişimi standartlaştırmak için React'in yerleşik createContext utility'sini kullanır.
Supabase'in sunduğu yerleşik kullanıcı ve oturum tipleri ile uygulama özelinde tanımlanmış kullanıcı rolü tipini içe aktararak bağlamın tip güvenliğini garanti eder; herhangi bir ortam değişkeni, harici API çağrısı veya veritabanı sorgusu gerçekleştirmez, yalnızca üst seviye bağlam tanımı ve tip aktarımı işlemlerini içerir.

---

## AXIOMS – Mimari Varsayımlar
Bu TypeScript modülü, uygulama geneline kimlik doğrulama verilerini paylaşmak amacıyla AuthContext nesnesini tanımlar, çalışması için AuthContext'in ait olduğu React Context API'sinin projeye entegre edilmiş ve erişilebilir olması zorunludur.

[Aksiyom 1]: Eğer projeye React Context API entegre edilmemiş ve AuthContext tanımı için erişilebilir kılınmamışsa, AuthContext nesnesi oluşturulamaz ve kimlik doğrulama verileri uygulama geneline paylaşılamaz.
[Aksiyom 2]: Eğer bu modülde tanımlanan AuthContext, bir sağlayıcı (Provider) bileşeni ile uygulama bileşenlerini sarmalayacak şekilde kullanılmazsa, bağlamı tüketen tüm bileşenlerde geçersiz/boş bağlam değeri hatası oluşur.
[Aksiyom 3]: Eğer bu modülün proje içindeki içe aktarma (import) yolları yanlış yapılandırılmışsa, AuthContext nesnesine diğer uygulama modülleri tarafından erişilemez ve uygulama derleme aşamasında hata alır.
[Aksiyom 4]: Eğer kullanılan TypeScript sürümü bu modüldeki AuthContext tanım sözdizimini desteklemiyorsa, modül derlenemez ve uygulama çalıştırılamaz.

---



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

### [N1_NASIL] AST Pointer: C:\Users\alize\venthub-hvac\src\contexts\AuthContextDefinition.ts::AuthContext
- **params**: (createContext çağrısına aktarılan parametreler, sağlanan fonksiyon gövdesi verisi eksikliği nedeniyle tespit edilemedi)
- **ic_degiskenler**: Sağlanan kod bloğunda tanımlı ve kullanılan iç değişken bulunamadı
- **Dönüş**: React'in `createContext` fonksiyonu ile oluşturulmuş tip güvenli React Context nesnesi (AuthContext)

---

## NODE ID STANDARD

  file: src\contexts\AuthContextDefinition.ts

---

## DISA AKTARILANLAR (EXPORTS)
  export: AuthContext
  export: AuthContextType
  export: AuthError