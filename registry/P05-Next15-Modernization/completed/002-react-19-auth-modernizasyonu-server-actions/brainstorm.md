# Brainstorm: 002-auth-modernization (React 19)

## 🎯 Goal
Giriş sayfası (LoginPage) form yönetimini React 19'un getirdiği `useActionState`, `useFormStatus` mimarisine taşımak ve JSX tip uyumsuzluklarını kalıcı olarak çözmek.

## 🛡️ Constraints & Risks
- **Risk:** `useActionState` kütüphanesinin React 19 Canary/RC sürümlerinde farklı isimlerle (örn: `useFormState`) export edilmiş olabilmesi.
- **Risk:** Lucide ikonlarının React 19 `ReactNode` tipiyle çakışması sonucu oluşan "cannot be used as a JSX component" hatasının devam etmesi.
- **Kısıt:** `Any` casting yöntemi UI/UX standartlarını bozmamalı, sadece tip seviyesinde çözüm sunmalı.

## 💡 Options & Recommendation
- **Öneri:** `src/actions/auth.ts` adında bir Server Action dosyası oluştur. `LoginPage.tsx` içinde `React.useActionState as any` kullanarak React 19'un yeni hook'unu devreye al. İkonlar için `IconAny` ara değişkeni protokolünü (v8) uygula.

## ✅ Acceptance Criteria
- [x] `LoginPage` useActionState ile çalışıyor.
- [x] Tüm ikon hataları (Lucide) `Any` cast ile giderildi.
- [x] Form submit sırasında loading state (isPending) görünür durumda.
