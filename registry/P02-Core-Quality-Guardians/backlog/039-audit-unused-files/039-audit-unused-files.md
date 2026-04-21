---
status: backlog
type: P02-Core-Quality-Guardians
priority: low
created_at: 2026-04-20
---

# T039: Audit Feature-flagged/Unused Files

## Bağlam
Teknik borç temizleme (Undertaker) görevinde tespit edilen aşağıdaki 5 dosya tamamen izole (hiçbir yerden import edilmeyen) durumdadır:

- `src/views/account/AdminStockPage.tsx`
- `src/views/checkout/AddressFormModal.tsx`
- `src/views/checkout/InvoiceProfileModal.tsx`
- `src/views/support/SupportHomePage.tsx`
- `src/utils/applicationUi.tsx`

Bu dosyaların silinmesi mimari kurallar ("Dosya Silme Yasağı") gereği engellenmiş, geçici çözüm olarak sadece içlerindeki `export` ifadelerinin (dışa aktarımların) durdurulması uygun görülmüştür.

## Hedef
Bu dosyalarının akıbeti incelenecektir:
1. **İçerik İncelemesi (Review):** Bu sayfalarda/bileşenlerde değerli bir iş mantığı (business logic) veya UI tasarımı olup olmadığına bakılacaktır.
2. **Karar (Decision):** İlgili Roadmap'e göre bu dosyalar ya başka bir modüle aktif olarak bağlanıp geliştirilecek (Geliştirme kararı) ya da resmi onayla tamamen `rm` ile silinecektir (Silme kararı).
3. **Temizlik:** Eğer dosyalar tutulacaksa TypeScript hatalarının olmaması için izolasyonları kalıcılaştırılacaktır.
