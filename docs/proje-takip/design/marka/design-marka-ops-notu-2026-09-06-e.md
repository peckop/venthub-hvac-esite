
# DESIGN-MARKA → OPS · 2026-09-06 · kendi kaydımda bayat satır buldum (menü kalemleri)

Recep Menü v15 ekran 01'i (kabuk) gösterdi. Kimlik açısından taradım. **İhlal bulamadım, ama
kendi kaydımın bayat olduğunu buldum.**

## Bayat satır — düzeltildi

`CLAUDE.md` "Site kabuğu" bölümünde şu satır vardı:

> Menü: Kategoriler (açılır panel), Ürünler, arama, hızlı sipariş, favoriler, sepet, hesap.

Üç yerden yanlış:

1. **Sepet yok.** Vitrin teklif odaklı — fiyat, stok, sepet yok (K1). "Sepet" satırı kalıcı bir
   çelişki olarak duruyordu.
2. **Favoriler ve hızlı sipariş menüde değil.** K5: header sağında eylem öğesi **tek**, o da
   "Teklif (n)" → Apple çanta paneli; Favorilerim o panelin içinde.
3. **Kalem adları eski.** Ölçülen son hâl: Ürünler ▾ (açılır panel) · Ürün Seçici ·
   Bilgi Merkezi · arama · TR/EN · İletişim · Teklif (3) · hesap.

Satır düzeltildi ve **sahiplik notu** eklendi: menü kalemleri bilgi mimarisidir, sahibi
DESIGN-MENU (K11), kimlik kaydında liste tutulmaz. Aynı düzeltme
`venthub-proje-ayarlari.md`'ye de girdi.

**Kök neden:** o satır kılavuzun ilk turlarından kalmıştı, menü projesi henüz teklif odaklı
akışa geçmemişti. K1 sepeti kaldırdı, K5 header'ı tek öğeye indirdi, ben kaydı güncellemedim.
Bugün ikinci kez aynı hata sınıfı: dün "Teklif al" çizimlerini, bugün menü satırını
güncellememişim. **Kural metni değişince o kuralın geçtiği her satırı taramıyorum** — bunu
kendi işleyişimde düzeltmem gerekiyor.

## Ekran kimlik açısından temiz

| Ölçüt | Durum |
|---|---|
| Tek koyu ton lacivert, header + footer koyu, gövde aydınlık | ✓ |
| Kiremit sayfada yok (bu ekranda ana eylem yok, doğru) | ✓ |
| Wordmark **VentHub** camel case, header ve footer | ✓ |
| Footer künyesi yer tutucu (`[telefon]` · `[e-posta]` · `[adres]`) | ✓ K7 ruhu — uydurma veri yok |
| "Bu site üzerinden satış yapılmaz; fiyatlandırma proje bazlıdır" | ✓ teklif odaklı akış |
| Mobil alt çubuk 4 sekme (Ana sayfa · Ürünler · Teklif · Hesap) | ✓ K19 |
| Mobil header'da TR/EN çipi | ✓ K19 |
| Dokunma hedefleri ≥44 px görünüyor | ✓ |

## Ölçemediğim iki şey — DESIGN-MENU'ye

1. **Logo dosyadan mı geliyor?** K23 CSS `clip-path` çizimini yasaklıyor; kaydımda "mevcut CSS
   çizimleri Kabuk v2 turunda SVG'ye döner" yazılı. Ekran görüntüsünden ayırt edilemiyor.
   Koyu bantta `venthub-kilit-yatay-tamrenk-koyu.svg` kullanılmalı (dizilim
   kiremit · beyaz · beyaz · turkuaz).
2. **Alt çubuk "Teklif" sayacının rozet rengi.** Turkuaz görünüyor. K25-b: sayaç zemini
   `--brand-cyan-ink` #00708F, metin beyaz (5.65). Ham `--brand-cyan` zemininde beyaz metin
   3.02 verir, geçmez.

İkisi de DESIGN-MENU'nün alanı, ben yazamam. Ölçülmesini öneriyorum.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve bayat satır düzeltmesi).

— DESIGN-MARKA (Opus) 2026-09-06

