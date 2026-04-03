# 📋 Implementation Plan: Tam Ekran Kategori Editörü

## 1. Altyapı ve Rota Hazırlığı
- [ ] `/src/app/admin/categories/[id]/builder/page.tsx` dosyası oluşturulacak.
- [ ] Sayfa, `AdminLayout` sarmalayıcısı içinde ama tam ekran genişliğinde yapılandırılacak.
- **Verify:** `/admin/categories/{any-id}/builder` adresine gidildiğinde boş bir sayfa görünmeli.

## 2. Editör Layout İnşası
- [ ] Sayfa tasarımı iki ana sütuna bölünecek (Sol %40: Editör, Sağ %60: Önizleme).
- [ ] Sol panelde `AuthorityBuilder` bileşeni modernize edilerek yerleştirilecek.
- [ ] Sağ panelde `AuthorityRenderer` bileşeni canlı veriyle beslenecek.
- **Verify:** Blok eklediğimizde sağ tarafta görsel bir değişim anında gözlenmeli.

## 3. Veritabanı ve State Entegrasyonu
- [ ] Sayfa yüklendiğinde `supabase` üzerinden kategori verileri ve `authority_content` çekilecek.
- [ ] "Kaydet" butonu, tüm blok listesini `categories` tablosundaki ilgili satıra JSONB olarak yazacak.
- [ ] Hata yakalama ve `toast` bildirimleri eklenecek.
- **Verify:** Sayfa yenilendiğinde eklenen bloklar geri gelmeli.

## 4. Modal Temizliği ve Yönlendirme
- [ ] `AdminCategoriesPage.tsx` üzerindeki "Düzenle" butonu, modal açmak yerine `/admin/categories/[id]/builder` rotasına yönlendirecek.
- [ ] `CategoryFormModal.tsx` içindeki atıl "Page Builder" sekmesi silinecek.
- **Verify:** Kategoriler listesinde "Düzenle"ye basınca yeni editör sayfası açılmalı.

## 5. İleri Düzey Etkileşimler (UX)
- [ ] Blokların yerini değiştirmek için `event.stopPropagation()` hataları temizlenecek.
- [ ] Sürükle-bırak için temel `framer-motion` desteği eklenecek.
- **Verify:** Bloklar modal kapanmadan veya sayfa donmadan yer değiştirebilmeli.
