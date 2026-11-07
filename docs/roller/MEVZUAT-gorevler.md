# DÜZENLİ GÖREVLER: MEVZUAT

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`, veri: `scripts/belge/rol-gorevleri.json`); elle düzenleme. Yöneten cetvel: `docs/standards/duzenli-gorevler-standard.md`. Rol kartı: `docs/roller/MEVZUAT.md`.

## Amaç
Ürünlerimize dokunan mevzuat ve standart hükümlerini kanıtlı tutar ve CE uygunluk dosyası taleplerine imzaya hazır taslak çıkarır; bayat ya da kanıtsız hüküm hem yayını hem resmî başvuruyu zora sokar.

## Nasıl
mevzuat-kaydi-standard.md; CE dosyası işinde docs/roller/MEVZUAT-kurallar.md (CE maddeleri) ve ce-uygunluk-dosyasi skill'i (YTN-26)

## Görevler
| Görev | Sıklık | Tetik | Bağlı mı | Çıktı | Eşik |
|---|---|---|---|---|---|
| Mevzuat kaydını (docs/mevzuat/kayit.json) resmî metne karşı yeniden okur: değişen, yürürlüğe giren ya da kaldırılan kalemi bulur, kanıt dosyasını günceller | aylık | istem satırı tazelik: Mevzuat kaydı için istem satırı yok; kayıt tazelik satırı kurulacak (satır tasarımı HARİTA, kanca altyapısı gerekirse ARAÇ) | hayır (kuracak: HARITA) | Değişen kalem listesiyle MEVZUAT kartı; KATALOG, BLOG ve SATIS'ı etkileyen kalem ilgili müdüre kart olarak gider | TASLAK: kayıttaki her kalemin kanıt tarihi 35 günden eski değil; değişen kalem aynı ay içinde kayda işlenir |
| Yaklaşan yürürlük tarihlerini izler (örnek: yeni Makine Emniyeti Yönetmeliği, 20 Ocak 2027) ve etkilenen ürün ailesi için geçiş notu çıkarır | aylık | istem satırı tazelik: Yaklaşan tarih için istem satırı yok; yürürlük tarihi izleme satırı kurulacak (satır tasarımı HARİTA, kanca altyapısı gerekirse ARAÇ) | hayır (kuracak: HARITA) | OPS'a tek mesaj; ürün ailesi × hüküm paketi güncellemesi | TASLAK: yürürlüğe 90 gün kala etkilenen ürün ailesi listesi hazır |
| Kurum ya da müşteri firma CE belgesi isteyince ce-uygunluk-dosyasi skill adımlarını koşar: girdi özeti, beyan taslağı, risk çerçevesi, eksik belge listesi | olay | kart kapısı: CE belgesi talebi kartı açılınca kart kapısı skill adımlarını hatırlatacak; kapı henüz kurulu değil (kuracak: HARİTA) | hayır (kuracak: HARITA) | Depo dışı çalışma klasöründe numaralı belgeler; OPS'a tek mesaj (doldurulamayan alanlar, en çok üç soru) | TASLAK: beyan alanları resmî metindeki alan sayısına eşit; uydurulmuş değer yok; firma ve kişi verisi depoda yok |
| Haftalık öz-değerlendirme (OPS-168 O9): çürütücü haftanın kartlarını ve PR'larını sabit altı soruya karşı okur (kurallar dosyası, "Haftalık öz-değerlendirme"); müdür en çok 3 iyileştirme önerir | haftalık | istem satırı tazelik: .claude/hooks/gorev-tazelik-satiri.cjs istem satırında "öz-değerlendirme: N gün" (7 gün eşik); damga scripts/hijyen/gorev-damga.cjs (ARC-216 A kolu) | evet | OPS'a tek mesaj (O1); onaylanan uygulanır ya da metni HARİTA'ya bırakılır | En çok 3 öneri; aynı hata iki kez döndüyse hafta beklenmez, o gün yapılır |

4 görev, tetiğe bağlı 1. Tetiğin kurulmasını bekleyen: HARITA 3.
