# Plan: Admin Panel Erisebilirlik Sorunu (003)

## 🎯 Hedef
Admin kullanıcısının login olduktan sonra Dashboard'a yönlendirilip başarılı bir şekilde yetkilendirilmesini sağlamak.

## 🧱 Adımlar

### 1. `AuthContext.tsx` Stabilizasyonu
- **İşlem:** `roleLoading` state'i ekleyerek rol bilgisinin gelip gelmediğini kontrol etmek.
- **Verify:** `useRole` hook'u içinden `roleLoading` bilgisi erişilebilir olacak.

### 2. `AdminLayout.tsx` Koruma Mantığının Güncellenmesi
- **İşlem:** `canAccess` ve `loading` durumunu (authLoading || roleLoading) daha dikkatli incelemek.
- **İşlem:** `loading` durumunda spinner'ı kesin göstermek.
- **Verify:** Manuel refresh yapıldığında admin paneli açılmalı.

### 3. `useRole.ts` Hook'unu `AuthContext` ile Senkron Etmek
- **İşlem:** Rol state'ini daha güvenli bir şekilde sunmak.
- **Verify:** `canAccess` fonksiyonu rol null iken false dönmeli ama loading true iken beklemeli.

### 4. Giriş Sonrası `router.refresh()` ve `revalidatePath` Kontrolü
- **İşlem:** `LoginPage.tsx` içindeki refresh mantığını doğrulamak.
- **Verify:** Login sonrası `/admin` sayfasına geçildiğinde yeni state gelmeli.

---
## 🏁 Sonuç
Tüm adımlar tamamlandığında admin erişim sorunu çözülmüş olacak.
