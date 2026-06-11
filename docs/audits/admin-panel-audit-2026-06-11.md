# Admin Panel Denetimi — 2026-06-11

> **Yöntem:** 6 eksen Antigravity CLI (`agy`, Gemini 3.5 Flash High) ile paralel fan-out edildi
> (her eksen ayrı subagent), ardından bulgular **Claude Code + CodeGraph** ile doğrulandı.
> Yanlış pozitifler ayıklandı, "kritik" iddialar koda karşı sınandı.
>
> **Doğrulama lejantı:** ✅ kodla teyit edildi · ⚠️ doğrulanmalı (silmeden/değiştirmeden önce) · ✏️ agy'nin şiddeti düzeltildi

İnceleme alanı: `src/views/admin/` + `src/components/admin/`

---

## 0. Tema: İki "sistem-dışı" sayfa

`AdminInventoryPage.tsx` ve `AdminWebhookEventsPage.tsx` admin tasarım sisteminin **dışında** kalmış
(eski/parça parça büyüme kalıntısı): light-theme (`bg-white`, `primary-navy`), `adminUi.ts` ortak
sınıfları yok, metinler i18n'siz hardcoded Türkçe, a11y eksik. Birçok eksen bağımsız olarak bu iki
sayfayı işaret etti → en yoğun teknik borç burada.

---

## 1. KRİTİK (RBAC / Audit — güvenlik & satış kapısı)

| # | Durum | Konum | Bulgu | Düzeltme |
|---|-------|-------|-------|----------|
| K1 | ✅✏️ | `AdminInventoryPage.tsx:154` | `hasWriteAccess={true}` hardcoded; dosya `useRole` import etmiyor. **Ama** yazma handler'ları (`onUpdateLocation/Supplier`) boş no-op → aktif veri açığı değil, yanıltıcı UI + gelecek tehlikesi. | `useRole().canWrite('inventory')` bağla; handler'lar gerçek yazınca guard hazır olsun. |
| K2 | ✅ | `CategoryBuilderView.tsx:98` | `handleSave` kategori `authority_content`'i `update` ediyor — **hiçbir `canWrite`/`useRole` guard'ı yok**, audit log da yok. Buton sadece `disabled={saving}`. | `canWrite('categories')` guard + buton pasifleştirme + `logAdminAction`. |
| K3 | ✅ | `AdminProductsPage.tsx:308,331` | Toplu statü değişimi ve toplu silme `logAdminAction` yazmıyor (audit.ts'in 8 caller'ı arasında bu dosya yok). | `logAdminAction` entegre et (before/after). |
| K4 | ✅ | `AdminCouponsPage.tsx:172` · `AdminErrorGroupsPage.tsx:219` | Kupon aktiflik ve hata-grubu statü değişimleri audit log'a yazmıyor. | Kritik mutasyonlara `logAdminAction` ekle. |
| K5 | ⚠️ | Çeşitli (`AdminProductsPage`, `AdminCouponsPage`, `AdminOrdersPage`, `AdminLogisticsPage`, `AdminErrorGroupsPage`) | agy: birçok yazma fonksiyonunun **fonksiyon içi** `if(!hasWriteAccess) return` guard'ı eksik (UI butonu gizli olsa bile fonksiyon korunmamış). | Her yazma fonksiyonunun başına guard; satır bazında teyit edilmeli. |

> **Not (K1–K2):** İstemci guard'ı son savunma değildir. Asıl kapı sunucudaki **RLS**'tir.
> Bu yüzden ayrı bir **RLS kapsama denetimi** (`rls_security_auditor` persona) şart — istemci guard'ı
> kozmetik olabilir ama RLS yoksa gerçek açık oradadır.

---

## 2. ORTA

### Tasarım token / tutarlılık (Eksen 1)
- ✅ `AdminOrdersPage.tsx:534`, `AdminUsersPage.tsx:310` → `min-w-900px` (geçersiz/arbitrary) → `min-w-[900px]` ya da token.
- ✅ `AdminOrdersPage.tsx:689` `max-h-50vh`, `AdminUsersPage.tsx:234` `min-h-50vh` → token / `[..]` formu.
- `AdminWebhookEventsPage.tsx:73`, `BlockEditor.tsx:20` → `adminUi.ts` ortak sınıfları yerine kopya light-theme stiller.

### i18n (Eksen 3)
- `AccessDenied.tsx:20` ("Erişim Engellendi"), `AdminWebhookEventsPage` tüm metinler → sözlüğe taşı.
- `_t('x') || 'Fallback'` kalıbı (sözlükte eksik anahtar): `AdminAuditLogPage.tsx:225`, `AdminCategoriesPage.tsx:361`, `ProductCsvImport.tsx:54`, `AdminToolbar.tsx:263`. → Fallback'leri kaldır, anahtarları sözlüğe ekle.

### a11y (Eksen 4)
- `AdminInventoryPage.tsx:91,104`, `InventoryCsvImport.tsx:285,294`, `ProductFormModal.tsx:144` → ikon butonlara `aria-label`, input'lara `label`/`aria-label`, `focus-visible` halkası.
- `AdminWebhookEventsPage.tsx:97`, `InventoryTable.tsx:77` → `onClick`'li satırlara `role="button"`, `tabIndex={0}`, `onKeyDown`.

---

## 3. ÖLÜ KOD (Eksen 6) — ⚠️ silmeden önce import grep'i

CodeGraph hiçbirinde caller bulamadı (JSX render edge'i CodeGraph'ta görünmeyebilir → silmeden önce
`grep -r "ComponentAdı"` ile import teyidi şart):
- `src/components/admin/InventoryCsvImport.tsx` — ⚠️ 0 caller (ama `logAdminAction` kullanıyor; bağımsız bir özellik yarım kalmış olabilir)
- `src/components/admin/InventoryDetailDrawer.tsx` — ⚠️ 0 caller
- `src/components/admin/dashboard/AbcPieChart.tsx` — ⚠️ 0 caller
- `src/components/admin/dashboard/ActivityHeatmap.tsx` — ⚠️ 0 caller
- `AdminToolbar.tsx:8` — kullanılmayan export'lar (tip).

### Tekrar / teknik borç
- `AdminErrorGroupsPage.tsx` ≈ `AdminErrorsPage.tsx` (~604 satır neredeyse birebir kopya) → ortak bileşene.
- `AdminAuditLogPage` ↔ `AdminErrorsPage` arama-debounce + sayfalama mantığı kopya → ortak `useAdminTableQuery` hook'u.

---

## 4. Önerilen düzeltme sırası

1. **K2, K3, K4** (audit log + CategoryBuilder guard) — ucuz, güvenlik/izlenebilirlik kazancı yüksek.
2. **RLS kapsama denetimi** (ayrı tur, `rls_security_auditor`) — K1/K2/K5'in gerçek riskini belirler.
3. **K1 + iki sistem-dışı sayfa** (`AdminInventoryPage`, `AdminWebhookEventsPage`) — design system + i18n + a11y birlikte refactor.
4. Ölü kod temizliği (import teyidinden sonra) + tekrar eden tabloların ortak hook/bileşene alınması.
5. Kalan i18n fallback'leri ve token ihlalleri (kozmetik, toplu yapılabilir).

---

*Bu rapor agy fan-out + CodeGraph doğrulama hattının ilk ürünüdür. Bulgular dosya:satır kesinliğindedir
ama satır numaraları agy taraması anındaki haldir; uygulamadan önce hedef satırı teyit et.*
