# FAZ 0 — Kritik Acil Düzeltmeler (Worker-Ready)
## RLS Policy + ErrorBoundary i18n

---

## 🚨 Bu Faz Öncelikli
> ⚠️ **DİĞER TÜM FAZLARDAN ÖNCE BU FAZI ÇALIŞTIR.**
> Bu fazdaki sorunlar blockerdır. Çözülmeden başka hiçbir iş çalışmaz.

---

## Gerçek Dosya İncelemesi Sonuçları

### 1. RLS Policy Dosyası: `supabase/migrations/202508270945_enable_rls_public.sql`

**Bulgu 1**: Yardımcı fonksiyonlar kullanılıyor:
- `_enable_rls_if_exists(tbl)` - sadece RLS'i aktif eder
- `_create_select_policy_if_absent(schema, table, policy, using)` - policy oluşturur

**Bulgu 2 (KRİTİK)**: Satır 93-96'da 4 tablo için sadece `_enable_rls_if_exists` çağırılıyor, policy EKLENMİYOR!
```sql
select public._enable_rls_if_exists('public.cart_items');
select public._enable_rls_if_exists('public.payment_transactions');
select public._enable_rls_if_exists('public.inventory_movements');
select public._enable_rls_if_exists('public.price_lists');
```

**Bulgu 3**: Yardımcı fonksiyonlar satır 117-118'de siliniyor. Policy'ler bundan ÖNCE eklenmeli.

---

### 2. ErrorBoundary: `src/components/ErrorBoundary.tsx`

**Bulgu 1**: ZATEN `private STRINGS` class property kullanıyor:
```typescript
private STRINGS = {
  chunkTitle: 'Sayfa Güncellemesi Gerekli',
  chunkDesc: 'Uygulama güncellenmiş görünüyor. Sayfayı yenileyip tekrar deneyin.',
  errorTitle: 'Sayfa Yüklenemedi',
  errorDesc: 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
  refresh: 'Sayfayı Yenile',
  retry: 'Tekrar Dene',
  devDetails: 'Hata Detayları (Geliştirme)',  // ⚠️ PLANDA EKSİKTİ!
} as const
```

**Bulgu 2**: Kullanım şekli:
```typescript
const S = this.STRINGS
// ...
{isChunkError ? S.chunkTitle : S.errorTitle}
```

**Çözüm**: `STRINGS` property'sini kaldır, `render()` metodunu `I18nContext.Consumer` ile sar.

---

## 📦 Kapsam (Scope Police)

```json
{
  "allowed_paths": [
    "src/components/ErrorBoundary.tsx",
    "src/i18n/dictionaries/tr.ts",
    "src/i18n/dictionaries/en.ts",
    "supabase/migrations/202508270945_enable_rls_public.sql"
  ],
  "max_files_changed": 4,
  "forbidden_paths": [
    "src/views/",
    "src/lib/services/",
    "src/components/products/3d/",
    "src/types/"
  ]
}
```

---

## ADIM 1: RLS Policy Eksikliği Düzeltmesi

**Dosya**: `supabase/migrations/202508270945_enable_rls_public.sql`

**Yapılacak**: Satır 96 (`select public._enable_rls_if_exists('public.price_lists');`) satırından HEMEN SONRA aşağıdaki blokları ekle.

```sql
-- ============================================
-- EKSİK POLICY'LER (FAZ 0 DÜZELTME)
-- ============================================

-- cart_items: Kullanıcı sadece kendi sepetini görebilir
do $$ begin
  perform public._create_select_policy_if_absent('public','cart_items','p_user_read_own_cart','user_id = auth.uid()');
end $$;

-- payment_transactions: Kullanıcı sadece kendi ödemelerini görebilir
do $$ begin
  perform public._create_select_policy_if_absent('public','payment_transactions','p_user_read_own_transactions','user_id = auth.uid()');
end $$;

-- inventory_movements: Sadece admin kullanıcılar görebilir
do $$ begin
  perform public._create_select_policy_if_absent('public','inventory_movements','p_admin_read_inventory','auth.jwt() ->> ''role'' = ''admin''');
end $$;

-- price_lists: Aktif fiyat listeleri herkese görünür
do $$ begin
  perform public._create_select_policy_if_absent('public','price_lists','p_anon_read_active_price_lists','active = true');
end $$;
```

> ⚠️ **Önemli**: Bu blokları `drop function` satırlarından (117-118) ÖNCE ekle.

---

## ADIM 2: ErrorBoundary Gerçek i18n Desteği

**Dosya**: `src/components/ErrorBoundary.tsx`

### Değişiklik 1: Import Ekle
```diff
  import React, { Component, ErrorInfo, ReactNode } from 'react'
  import { AlertTriangle, RefreshCw } from 'lucide-react'
+ import { I18nContext } from '../i18n/I18nContext'
```

### Değişiklik 2: `private STRINGS` Property'sini Kaldır
```diff
- private STRINGS = {
-   chunkTitle: 'Sayfa Güncellemesi Gerekli',
-   chunkDesc: 'Uygulama güncellenmiş görünüyor. Sayfayı yenileyip tekrar deneyin.',
-   errorTitle: 'Sayfa Yüklenemedi',
-   errorDesc: 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
-   refresh: 'Sayfayı Yenile',
-   retry: 'Tekrar Dene',
-   devDetails: 'Hata Detayları (Geliştirme)',
- } as const
```

### Değişiklik 3: `render()` Metodunu Consumer ile Sar

Mevcut render metodu başlangıcı:
```typescript
render() {
  if (this.state.hasError) {
    // ...
  }
  return this.props.children
}
```

Yeni hali:
```typescript
render() {
  return (
    <I18nContext.Consumer>
      {(ctx) => {
        const t = ctx?.t || ((key: string, alt?: string) => alt || key)

        if (this.state.hasError) {
          if (this.props.fallback) {
            return this.props.fallback
          }

          const { isChunkError } = this.state
          // const S = this.STRINGS  <- bunu kaldır

          return (
            // ... JSX içinde:
            // {isChunkError ? S.chunkTitle : S.errorTitle}
            // yerine:
            {isChunkError 
              ? t('error.chunkTitle', 'Sayfa Güncellemesi Gerekli') 
              : t('error.errorTitle', 'Sayfa Yüklenemedi')
            }
            
            // {isChunkError ? S.chunkDesc : S.errorDesc}
            // yerine:
            {isChunkError 
              ? t('error.chunkDesc', 'Uygulama güncellenmiş görünüyor. Sayfayı yenileyip tekrar deneyin.') 
              : t('error.errorDesc', 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.')
            }
            
            // S.refresh yerine: t('error.refresh', 'Sayfayı Yenile')
            // S.retry yerine: t('error.retry', 'Tekrar Dene')
            // S.devDetails yerine: t('error.devDetails', 'Hata Detayları (Geliştirme)')
          )
        }

        return this.props.children
      }}
    </I18nContext.Consumer>
  )
}
```

> ✅ **Güvenlik**: `ctx?.t || fallback` pattern'i ile Context null geldiğinde bile crash olmaz, fallback string kullanılır.

---

## ADIM 3: Çeviri Anahtarlarını Ekle

**7 anahtar** gerekiyor (devDetails dahil):

### `src/i18n/dictionaries/tr.ts`
```typescript
error: {
  chunkTitle: 'Sayfa Güncellemesi Gerekli',
  chunkDesc: 'Uygulama güncellenmiş görünüyor. Sayfayı yenileyip tekrar deneyin.',
  errorTitle: 'Sayfa Yüklenemedi',
  errorDesc: 'Bu sayfa yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
  refresh: 'Sayfayı Yenile',
  retry: 'Tekrar Dene',
  devDetails: 'Hata Detayları (Geliştirme)',
},
```

### `src/i18n/dictionaries/en.ts`
```typescript
error: {
  chunkTitle: 'Page Update Required',
  chunkDesc: 'The application appears to have been updated. Please refresh the page and try again.',
  errorTitle: 'Page Failed to Load',
  errorDesc: 'An error occurred while loading this page. Please try again.',
  refresh: 'Refresh Page',
  retry: 'Try Again',
  devDetails: 'Error Details (Development)',
},
```

---

## ✅ Son Doğrulama

```bash
# 1. Type kontrol
pnpm exec tsc --noEmit

# 2. Lint
pnpm run lint

# 3. Build
pnpm run build

# 4. RLS policy kontrol (p_ ile başlayan 4 yeni policy)
grep -c "_create_select_policy_if_absent" supabase/migrations/202508270945_enable_rls_public.sql
# Hedef: Önceki +4 = artık 13 (9 tablo için vardı, +4 yeni)

# 5. ErrorBoundary private STRINGS kontrolü
grep "private STRINGS" src/components/ErrorBoundary.tsx
# Hedef: 0 (kaldırılmalı)

# 6. ErrorBoundary Context kontrolü
grep "I18nContext.Consumer" src/components/ErrorBoundary.tsx
# Hedef: 1 (eklenmeli)

# 7. i18n anahtar sayısı kontrolü
grep "error\." src/i18n/dictionaries/tr.ts | wc -l
grep "error\." src/i18n/dictionaries/en.ts | wc -l
# Her ikisi de 7 olmalı (chunkTitle, chunkDesc, errorTitle, errorDesc, refresh, retry, devDetails)
```

---

## Risk Analizi

| Risk | Seviye | Çözüm |
|------|--------|-------|
| RLS policy production'u break eder | YÜKSEK | Local'de `supabase migration up` ile test et |
| ErrorBoundary render yapısı bozulur | ORTA | Consumer içindeki return yapısını bozma |
| i18n anahtar isimleri tutarsız | DÜŞÜK | `error.chunkTitle` vs. tam olarak eşleşmeli |

---

## Faz Bağımlılığı

> ✅ Bu faz tamamen bağımsızdır. Diğer hiçbir fazı beklemez.
> ✅ Bu faz tamamlanmadan **HİÇBİR** başka faz başlatılamaz.
