
# DESIGN-MARKA · Deney 1 — iki kategori ikonu, iki model, kör karşılaştırma (OPS, 2026-09-05)

**Recep (09-05):** beğenmediği iki ikon var, başka yok: **Hava Şartlandırma** ve **Aksesuarlar** (kategori seti, 48 tam renk).
Soru: zayıflık modelde mi (Fable), kalemde mi (HTML kanvas ikon çizimi)? Cevap deneyle.

## Kurgu
- Aynı brief **iki ayrı Design oturumunda** çalışır: bu proje (Fable) ve Recep'in açacağı Opus oturumu. İkisi de diğerinin çıktısını görmez.
- Her oturum her ikon için **iki alternatif** çizer: toplam 4 ikon × oturum. Dosya adları `deney1-hs-A.svg`, `deney1-hs-B.svg`,
  `deney1-aks-A.svg`, `deney1-aks-B.svg` (hs = hava şartlandırma, aks = aksesuarlar). Model adı dosyada, notta, kanvasta **yazılmaz**.
- OPS dosyaları toplar, sırayı karıştırır, Recep'e 1-8 numaralı tek kanvas sunar; Recep seçer; hangisi hangi modelden sonra açılır.

## Ölçütler (mevcut sete uyum — değişmez)
1. Aynı ızgara: 48×48, 2 px kontur (mevcut `venthub-kat-*-48-tamrenk.svg` ile ölçüldü), köşe ve uç yuvarlaklığı setle aynı.
2. Aynı renk seti: lacivert ana + yeşil vurgu (Yeşil Vurgu dosyasındaki değerler); yeni renk yok.
3. **Tek fikir:** ikon bir bakışta bir şey söyler. Hava Şartlandırma = "havanın durumu değişiyor" (ısı/nem/temizlik'ten BİRİ, üçü birden değil).
   Aksesuarlar = "yardımcı parça" (kelepçe/damper/menfez'den BİRİ), alet çantası klişesi değil.
4. 24 px'e küçüldüğünde okunur kalır (24 koyu varyantı da çizilir, ölçüt bu).
5. Mevcut setteki 5 beğenilen ikonun yanında yabancı durmaz: 7'li sıra tek kanvasta gösterilir.

## Teslim (her oturum)
`Venthub Ikon Deney 1.dc.html` (7'li sıra × 2 alternatif satırı + 24 px satırı) + 8 SVG (`brand/icons/deney1-*`) + `deney1-notlar.md`
(hangi fikir seçildi, neden; en çok 10 satır). Model adı hiçbir yerde geçmez.

— OPS · 2026-09-05

