# 🧠 Brainstorming: Global Mimari Mühürleme (P04/006)

## Mevcut Mimari Kopukluk
- **Kategori Sayfaları:** Yeni nesil Gateway mimarisiyle çalışıyor.
- **Navigasyon (Header/Menu):** Eski, bağımsız ve merkezi olmayan veri çekme yöntemlerini kullanıyor.
- **Hiyerarşi Farkı:** Sayfadaki alt kategori listeleme mantığı ile MegaMenu'deki mantık birbiriyle eşleşmiyor.

## Mimari Çözüm: "Single Source of Architecture"
1. **Global Provider:** Uygulamanın en tepesine bir `CategoryProvider` koyarak tüm hiyerarşiyi (Tree) bir kez oluşturup herkese dağıtalım.
2. **Hook Integration:** `MegaMenu`, `StickyHeader` ve `CategoryHubOverlay` bileşenlerini `useCategoryGateway` mantığına (veya yeni global hook'a) bağlayalım.
3. **Metadata Mastery:** Menülerin tasarımı (hangi kategorinin öne çıkacağı vb.) koddan değil, DB'deki `metadata` üzerinden merkezi olarak yönetilsin.

## Karar
P04 reformunu tüm uygulamaya yayarak "İki Farklı Mimari" hissini bitirmeye karar verildi.
