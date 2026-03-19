# Plan: 019 - Typography Authority Audit: Search, Auth, Cart

## 🛠️ Uygulama Adımları

### Faz 1: Auth Pages Typography Audit 🔐
1.  **LoginPage:** `h1` -> `vh-h2`, `p` -> `vh-body`, labels -> `vh-technical` (mini), link -> `vh-link`.
2.  **RegisterPage:** Benzer şekilde tipografi sınıflarını uygula.
3.  **ForgotPasswordPage:** Benzer şekilde tipografi sınıflarını uygula.
4.  **Verify:** Auth akışlarının görsel bütünlüğünü test et.

### Faz 2: Cart Page Typography Audit 🛒
1.  **CartPage:** Başlıkları `vh-h1`, özet başlıklarını `vh-h3` yap.
2.  **CartItems:** Ürün isimlerini `vh-h4` veya `vh-h5` seviyesine çek.
3.  **CartSummary:** Fiyat etiketlerini ve detayları `vh-body` / `vh-technical` ile güncelle.
4.  **Verify:** Sepet sayfasının kurumsal duruşunu kontrol et.

### Faz 3: Search Overlay Typography Audit 🔍
1.  **SearchOverlay:** Arama sonuçlarındaki başlıkları ve kategorileri `vh-body-sm` ve `vh-badge-label` ile standardize et.
2.  **SearchInput:** Placeholder ve input metinlerini `vh-body` seviyesine çek.
3.  **Verify:** Arama sonuçlarının okunabilirliğini teyit et.

## ✅ Doğrulama Kriterleri
- [ ] LoginPage tipografi standartlarına uygun.
- [ ] CartPage tipografi standartlarına uygun.
- [ ] SearchOverlay tipografi standartlarına uygun.
- [ ] Kodda gereksiz `text-gray-X` veya manuel font size tanımları temizlendi.
