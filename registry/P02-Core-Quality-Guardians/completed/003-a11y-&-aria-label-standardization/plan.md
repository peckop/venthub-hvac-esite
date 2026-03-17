# Plan: 003 - A11y & ARIA Label Standardization

## 📋 ADIMLAR

### 1. Admin Sayfaları ARIA Güncellemesi
- [ ] `AdminUsersPage` içindeki rol değiştirme ve aksiyon butonlarına `aria-label` ekle.
- [ ] `AdminInventoryPage` içindeki CSV yükleme, export ve ayar butonlarına `aria-label` ekle.
- [ ] `AdminSettingsPage` tab butonlarına ve kaydet butonuna ARIA desteği ver.

### 2. Ortak Bileşenler (Shared Components)
- [ ] `AdminToolbar` arama ve temizleme butonlarını güncelle.
- [ ] `ColumnsMenu` ve `ExportMenu` butonlarını güncelle.

### 3. i18n Sözlük Desteği
- [ ] `tr.ts` içine `admin.a11y` anahtarı altında standart etiketler (Kapat, Sil, Düzenle, Kaydet) ekle.

### 4. Doğrulama
- [ ] Manuel kod kontrolü.
- [ ] Lighthouse testi (yerel ortamda simüle et).

## 🛡️ RİSK YÖNETİMİ
- **UI Kırılması:** ARIA etiketleri sadece meta veri olduğu için görsel bir kırılma riski yoktur.
- **Eksik Çeviri:** Fallback metinleri ile güvenliği sağla.
