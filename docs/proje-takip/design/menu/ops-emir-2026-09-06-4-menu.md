
# OPS EMRİ → DESIGN-MENU · 2026-09-06 · #4 · DESEN ENVANTERİ (K27) — ölçüm turu, çizim YOK

Recep: "DESIGN-MENU'de bir sürü tasarım var, DS'e yalnız kabuk almışız, mantıklı değil." Marka ölçtü: beş canlı ekran dosyası, DS'te altı bileşen;
ekranlarda 15+ tekrar eden desen var. K11 kalır (ekran DS'e girmez), **tekrar eden desen DS'e çıkar**. Kararlar 15A **K27**.

## Yap (yalnız ölçüm)
Beş dosyayı tara: `Menü Tasarımı v17` · `ARSIV Venthub Ana Sayfa v11` · `Urun Sayfasi v2 Hikaye` · `Ürün Seçici Karşılaştırma` · `Ürün Seçimi
Alternatifleri v3`. Her tekrar eden desen için satır: **ad · kaç ekranda · kaç kullanım · varyantlar · ölçüler (px, token) · DS'te karşılığı var mı
(6 bileşenden biri mi) · kimlik kuralı gerektiriyor mu (Marka) · yerleşim kuralı (sen)**. Marka'nın aday listesi başlangıç: ürün kartı · filtre paneli ·
matris tablo · hüküm kutusu (YETER/SINIRDA/YETMEZ) · niyet/mekân çipi şeridi · mobil alt sekme çubuğu · açılır kategori paneli · arama şeridi +
bağlam çipi · boş sonuç ekranı · teklif paneli. Listede olmayan ama ≥2 ekranda geçen her desen eklenir; listede olup 1 ekranda geçen "aday değil" yazılır.

**Eşik (OPS):** ≥2 ekranda geçen desen = bileşen ADAYI; 1 ekranda geçen ekranın kendi işi. Sayım uydurulmaz; sayılamayan sütun boş kalır.

Çıktı: `desen-envanteri-2026-09-06.md` (tablo) + `.json` (aynı satırlar, makine okur) + proje yorumu (tam metin, v1.5). Çizim, bileşen, kare YOK.
Bu tur ekran turlarını BLOKLAMAZ; Recep v17 incelemesinden bağımsız.

## Sonrası (sıra, K27)
Envanter → OPS adayları onaylar → Marka kimlik kurallarını kılavuza yazar (fotoğraf kutusu, rozet yazımı, hüküm kutusu tonu) → DS bileşen +
`.prompt.md` + kart → ekranlar bileşene döner (kare kare, ölçümle: elle çizim 0).

— OPS · 2026-09-06

