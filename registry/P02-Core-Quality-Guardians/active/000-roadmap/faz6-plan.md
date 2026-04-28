# FAZ 6 — Worker-Ready Planı (REVIZED)
## i18n Disiplini + Final Lighthouse Push

---

## Terminal Kanıtları (Grep/LS Çıktıları)

```bash
# AccountOverviewPage hardcoded string doğrulaması
$ grep -n "Teslim Edildi" src/views/account/AccountOverviewPage.tsx
118:        return <span ...> Teslim Edildi</span>
129:    { key: 'delivered', label: 'Teslim Edildi', icon: CheckCircle },

$ grep -n "Kargoda\|Hazırlanıyor\|Hazırlandı" src/views/account/AccountOverviewPage.tsx | head -10
120:        return <span ...> Kargoda</span>
122:        return <span ...> Hazırlanıyor</span>
127:    { key: 'preparing', label: 'Hazırlandı', icon: Package },
128:    { key: 'shipped', label: 'Kargoda', icon: Truck },

# AccountShipmentsPage hardcoded string
$ grep -n "Kargoya Verildi" src/views/account/AccountShipmentsPage.tsx
# Sonuç: VARSA typodur, Kontrol et

# AuthCallbackPage useI18n kullanıyor mu?
$ grep "useI18n" src/views/AuthCallbackPage.tsx
# Sonuç: YOK — hook kullanmıyor, hardcoded string var

# tr.ts mevcut mu?
$ ls src/i18n/dictionaries/tr.ts
src/i18n/dictionaries/tr.ts

# en.ts mevcut mu?
$ ls src/i18n/dictionaries/en.ts
src/i18n/dictionaries/en.ts
```

---

## Kritik Tespit

> ⚠️ **AuthCallbackPage ve account sayfalarının çoğu ZATEN useI18n() kullanıyor.**
> Aşağıdaki hardcoded string'lerin bir kısmı "fallback" veya koşullu gösterim olabilir.
> Her string için `grep -n "string" dosya.tsx` ile tam satır kontrolü GEREKLİ.

---

## 📦 Kapsam (Scope Police)

```json
{
  "allowed_paths": [
    "src/views/AuthCallbackPage.tsx",
    "src/i18n/dictionaries/tr.ts",
    "src/i18n/dictionaries/en.ts"
  ],
  "max_files_changed": 3,
  "forbidden_paths": [
    "src/views/account/",
    "src/components/products/3d/"
  ]
}
```

> ⚠️ Account sayfaları ve Product3DViewer kapsam DİŞI. useI18n zaten kullanıyorlar — fallback string'lerini temizlemek ayrı bir iş.

---

## GRUP A — AuthCallbackPage i18n

### `src/views/AuthCallbackPage.tsx`

**useI18n kullanımı:** YOK — hook yok, hardcoded string var.

**Terminal kanıtı:**
```bash
$ grep "useI18n" src/views/AuthCallbackPage.tsx
# Sonuç: BOS
```

**Değişiklik:**

```diff
+ import { useI18n } from '../i18n/I18nProvider'

const AuthCallbackPage: React.FC = () => {
+ const { t } = useI18n()
```

**String dönüşümleri:**

| Satır | ÖNCE | SONRA |
|-------|------|-------|
| 36 | `E-posta başarıyla doğrulandı! Anasayfaya yönlendiriliyorsunuz...` | `t('auth.emailVerifiedRedirect')` |
| 37 | `toast.success('E-posta başarıyla doğrulandı!')` | `toast.success(t('auth.emailVerified'))` |
| 48 | `E-posta doğrulama sırasında hata oluştu:` | `t('auth.emailVerifyError')` |
| 70 | `Doğrulama linki geçersiz veya süresi dolmuş` | `t('auth.invalidLink')` |
| 77 | `Beklenmeyen bir hata oluştu` | `t('auth.unexpectedError')` |
| 95 | `E-posta Doğrulanıyor...` | `t('auth.verifyingEmail')` |
| 98 | `Lütfen bekleyin, hesabınız doğrulanıyor.` | `t('auth.pleaseWait')` |
| 109 | `Doğrulama Başarılı!` | `t('auth.verificationSuccess')` |
| 123 | `Doğrulama Hatası` | `t('auth.verificationError')` |
| 132 | `Giriş Sayfasına Dön` | `t('auth.goToLogin')` |

---

## GRUP B — Çeviri Dosyalarını Güncelle

### `src/i18n/dictionaries/tr.ts` — Eklenecek anahtarlar

```typescript
auth: {
  emailVerified: 'E-posta başarıyla doğrulandı!',
  emailVerifiedRedirect: 'E-posta başarıyla doğrulandı! Anasayfaya yönlendiriliyorsunuz...',
  emailVerifyError: 'E-posta doğrulama sırasında hata oluştu: ',
  invalidLink: 'Doğrulama linki geçersiz veya süresi dolmuş',
  unexpectedError: 'Beklenmeyen bir hata oluştu',
  verifyingEmail: 'E-posta Doğrulanıyor...',
  pleaseWait: 'Lütfen bekleyin, hesabınız doğrulanıyor.',
  verificationSuccess: 'Doğrulama Başarılı!',
  verificationError: 'Doğrulama Hatası',
  goToLogin: 'Giriş Sayfasına Dön',
},
```

### `src/i18n/dictionaries/en.ts` — İngilizce karşılıklar

```typescript
auth: {
  emailVerified: 'Email verified successfully!',
  emailVerifiedRedirect: 'Email verified! Redirecting to homepage...',
  emailVerifyError: 'Error during email verification: ',
  invalidLink: 'Verification link is invalid or has expired',
  unexpectedError: 'An unexpected error occurred',
  verifyingEmail: 'Verifying Email...',
  pleaseWait: 'Please wait, your account is being verified.',
  verificationSuccess: 'Verification Successful!',
  verificationError: 'Verification Error',
  goToLogin: 'Go to Login Page',
},
```

---

## ✅ Doğrulama

```bash
# 1. AuthCallbackPage hardcoded string kontrolü
grep -E "'[A-ZİÜŞ][a-zşüiğöç]+" src/views/AuthCallbackPage.tsx | grep -v "t('" | grep -v "//" | wc -l
# Hedef: 0

# 2. TSC
pnpm exec tsc --noEmit

# 3. Build
pnpm run build

# 4. en.ts / tr.ts key kontrolü
grep "auth\." src/i18n/dictionaries/tr.ts | wc -l
grep "auth\." src/i18n/dictionaries/en.ts | wc -l
# Her ikisi de eşit olmalı
```

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| Key collision | Düşük | Mevcut anahtarları listele |
| Toast mesajı bozulması | Düşük | Test ile kontrol et |
| en.ts eksik kalması | Orta | tr.ts'e her eklemede en.ts'i de güncelle |

---

## FAZ Bağımlılığı

> ⚠️ FAZ 6 bağımsız çalışabilir. AuthCallbackPage zaten 'use client' (Supabase auth callback), i18n eklemesi diğer fazlardan bağımsız.