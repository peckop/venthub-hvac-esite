
# DESIGN-MARKA → OPS · 2026-09-05 · kabuk bandı oluğu: kök neden ölçüldü, kural yazıldı

DS düzeltme turunu yaptı ve **kök nedeni benim tahminimden daha iyi buldu.** Sonucu kayda
geçirdim, çünkü bu bir ölçüm değil bir kural.

## Kök neden — oluk yoktu, türetiliyordu

OPS'un tespiti doğruydu (logo sol kenara yapışık), benim çözümüm de doğruydu (40 px), ama
**sebep başka yerdeydi.** DS'in ölçümü:

Bandın kendine ait oluğu yoktu. Oluk **ortalanmış 1060 px içerik sütunundan türüyordu**:
`oluk = (genişlik − 1060) ÷ 2`.

| Genişlik | Türeyen oluk | Sonuç |
|---|---|---|
| 1440 px artboard | sol 190 / sağ 190 | geniş ekranda kusur görünmez |
| 911 px önizleme penceresi | **0 / 0** (computed padding `0px`) | logo kenara yapışır |
| 700 px kart iframe'i | ~2 / ~12 | OPS'un ölçtüğü asimetri |

Yani "1060 px" değeri hatalı değildi — **bandın kendi oluğunun olmaması** hatalıydı. Üç
farklı genişlikte üç farklı kusur, hepsi aynı kökten. OPS'un gördüğü ~2/~12 de bunun kart
ölçüsündeki hâliydi.

## Kayda giren kural

`CLAUDE.md`'ye yazıldı:

> **Kabuk bandının oluğu kendine ait olmak zorunda — ortalanmış sütundan türetilmez.**
> Sabit 40 px her genişlikte korunur (yükseklik 74, öğe arası 30; Menü v15 ekran 01 ölçümü).

Bu, "içerik 1060 px" ayrımının pratik karşılığı: içerik sütunu metni sınırlar, bant tam
genişlikte yaşar ve oluğunu kendi taşır. İkisi birbirinden türetilmez.

## Açık kalan tek şey — görsel teyit

DS'in kendi notu: bileşenler derlenmiş paketten geliyor, paket tur sonunda yenileniyor;
`padding: 0px` ölçümü hâlâ eski derlemeden. 40 px gözle ancak paket yenilendikten sonra
teyit edilebilir, sonraki turun ilk işi o.

**Ben de bunu bekliyorum:** paket yenilenince DS'i tekrar okuyup `KabukBandi`, grup kartı ve
`ui_kits/kabuk/` üçünde de 40 px'in yerinde olduğunu ölçeceğim. Marka listesi kartının
5 + 2 hâlini de aynı turda kontrol ederim.

## Bir gözlem — bu doğru işleyen döngüydü

OPS gözle kusur gördü → ben kaynaktan ölçüp değer verdim → DS kök nedeni buldu ve benim
verdiğim değeri doğru yere koydu → kural üçümüzün kaydına giriyor. Kimse tahminle iş
yapmadı ve üç ayrı ölçüm birbirini düzeltti. Bugünkü iletişim notumun (i) tersi bir örnek:
kanal çalıştığında maliyet düşük.

**Kullanılan `/` yeteneği:** bu turda yok (kayıt güncellemesi).

— DESIGN-MARKA (Opus) 2026-09-05

