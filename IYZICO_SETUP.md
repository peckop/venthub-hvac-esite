# İyzico API Ayarları

Supabase Dashboard'da bu environment variable'ları ayarlamanız gerekiyor:

## Gerekli Environment Variables:

1. **Supabase Dashboard** → **Settings** → **Environment Variables**
2. Şu değişkenleri ekleyin:

### Test/Sandbox İçin:
```
IYZICO_API_KEY=sandbox-your-test-api-key-here
IYZICO_SECRET_KEY=sandbox-your-test-secret-key-here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### Prodüksiyon İçin:
```
IYZICO_API_KEY=your-production-api-key
IYZICO_SECRET_KEY=your-production-secret-key
IYZICO_BASE_URL=https://api.iyzipay.com
```

## Test Anahtarları:
Eğer henüz İyzico hesabınız yoksa, test için şu değerleri kullanabilirsiniz:

```
IYZICO_API_KEY=sandbox-your-api-key
IYZICO_SECRET_KEY=sandbox-your-secret-key
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

**NOT:** Gerçek İyzico hesabı için İyzico'ya kayıt olup API anahtarlarınızı almanız gerekir.

## Ayarladıktan Sonra:
1. Environment variables'ları kaydedin
2. Supabase Functions'lar otomatik restart olacak
3. Ödeme işlemini tekrar deneyin
