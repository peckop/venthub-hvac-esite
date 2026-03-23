# VentHub Bütünlük Kalkanı (Integrity Guard)

Bu beceri, proje üzerindeki kritik ve "tekrarı zor" varlıkların yanlışlıkla silinmesini veya eski versiyonlarla ezilmesini engelleyen bir **Nihai Savunma Hattı**'dır.

## 🚨 KRİTİK VARLIKLAR (Protected Objects)
Aşağıdaki klasörler/dosyalar "Kritik Varlık" (Protected) sınıfındadır:
-   `src/components/products/visual-models/` (3D Modeller ve Orbital Sistemler)
-   `src/components/navigation/` (Kategori Carousel ve Akış Mimarı)
-   `src/types/database.types.ts` (Veritabanı İskeleti)

## 🚧 ZORUNLU EYLEM PROTOKOLLERİ (Hard Rules)

### 1. Snapshot Zorunluluğu (Backup First)
Eğer yukarıdaki kritik dosyalardan herhangi birine dokunulacaksa veya genel bir `git revert / reset / checkout` komutu çalıştırılacaksa; planın (`plan.md`) ilk adımı şu olmak zorundadır:
-   **Komut:** `pnpm run backup:snapshot` (veya manuel kopyalama) yaparak mevcut çalışan dosyaları `artifacts/backups/CURRENT_WORK/` klasörüne kopyala ve diske yaz.

### 2. Zaman Damgası Doğrulaması (Time-Stamp Check)
Dosyaları Git üzerinden geri getirirken; kesinlikle "dün" veya "önceki gün" gibi muğlak ifadelerle değil, `git log` çıktısı üzerinden **Commit Karma Değeri (Hash)** ve **Tam Tarih/Saat** ile doğrulama yapılmalı, bu veri size onaylatılmalıdır.

### 3. Yıkıcı Eylem Koruması (No-Overwrite)
Eğer yapılacak değişiklik mevcut (ve dünkü) bir çalışmayı tamamen silip yerine bir yedek koyacaksa; bu bir "Yıkıcı Eylem" (Destructive Action) olarak işaretlenmeli ve mimari koruma kalkanı pasif edilmeden işlem yapılamamalıdır.

---
*Bu kalkan, AI'nın "hafıza yanılsamalarını" ve Git üzerindeki hatalı geri dönüşlerini engellemek için projenin tam kalbine yerleştirilmiştir.*
