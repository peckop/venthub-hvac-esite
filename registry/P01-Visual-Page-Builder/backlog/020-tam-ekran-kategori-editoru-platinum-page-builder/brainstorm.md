# 🧠 Brainstorming: Tam Ekran Kategori Editörü (Platinum Page Builder)

## Mevcut Sorunlar
- **Dar Alan:** Modal (açılır pencere) yapısı, 3D modeller ve detaylı teknik özellik girişleri için yetersiz.
- **Kopukluk:** Kaydetme ve önizleme süreçleri modal içinde sağlıklı çalışmıyor.
- **UX Hataları:** Butonların formu submit etmesi, modalın kapanması gibi temel arayüz sorunları.
- **Profesyonellik:** Mevcut yapı bir "kurumsal CMS" hissiyatından uzak.

## Fikirler ve Mimari Çözümler
1. **Rotalama (Routing):**
   - `/admin/categories/[id]/builder` rotası oluşturulacak.
   - Kategoriler listesindeki "Düzenle" butonu modal açmak yerine bu sayfaya yönlendirecek.

2. **Düzenleyici Yapısı (Layout):**
   - **Sol Panel (Sidebar):** Blok ekleme butonları (Hero, Specs, Media vb.) ve mevcut blokların sıralanabilir listesi.
   - **Merkez (Canvas):** Seçili bloğun detaylı ayarları (Başlık, Görsel URL, 3D Model ID).
   - **Sağ Panel (Live Preview):** `AuthorityRenderer` kullanılarak sayfanın o anki halini gösteren canlı önizleme alanı.

3. **Etkileşim (Interactions):**
   - **Drag & Drop:** Blokların yerini değiştirmek için `dnd-kit` veya `framer-motion` kullanılacak.
   - **Auto-Save / Draft:** Yapılan her değişiklik geçici bir state'te tutulacak, "Kaydet" butonu ile tek seferde veritabanına yazılacak.

4. **Veri Modeli:**
   - `categories.authority_content` JSONB alanı tek kaynak (Source of Truth) olacak.
   - Tip güvenliği `AuthorityContent` interface'i ile sıkı tutulacak.

## Karar
Page Builder'ı modal sisteminden tamamen koparıp, bağımsız ve tam ekran bir editör sayfasına taşımaya karar verildi.
