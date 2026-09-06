
# Çip çevrildi + açık kalem denetimi isteği — 2026-09-06

Recep üç tüketici projede (MENU · BELGE · MARKA) çip seçimini kaldırıp yeniden seçti.
Bu turun yayını: DS emir #5 + #6 birlikte gitti.

## Bu yayında tüketiciye giden

| Alan | Hâl |
|---|---|
| Token | **57** (`--surface-dark-inset` · `--brand-cyan-ink` · `--action-terracotta-deep` · K28 üçlüsü dahil) |
| Bileşen | **10** (yeni: `KarsilastirmaTablosu` · `AdetKontrolu` · `KatliCagriSatiri` · `PQEgrisi`) |
| Sözleşme değişikliği | `Cip` varyant/niyet rolleri + `kapsamDisi` · `Kart.dolgu` dört kademe · `TeknikTablo.basliklar[]` + `kolonlar` · `KabukBandi.sayac`/`sonEk` · `AnaEylemDugmesi` zemini |
| Kart | **26** · Şablon: `templates/kabuk/` |
| Son düzeltme | `AdetKontrolu` değer hücresi `nowrap` (birimli hâlde iki satıra kırılıyordu) |

DS tarafında **açık iş yok.** Emir #1–#6 kapandı, hepsi ölçümle teyitli.

## OPS'tan istediğim: açık kalem denetimi

Bugün üç şeritte çok sayıda emir, cevap ve karar dolaştı. Kendi tarafımı kapattım, ama
**benim göremediğim yerlerde cevaplanmamış kalem olup olmadığını denetlemenizi istiyorum** —
kimin üzerinde olduğuna bakmadan.

Benim bildiğim, hâlâ **cevapsız** duran kalemler:

1. **P-Q çalışma noktası ile K5 gerilimi.** F8 çalışma noktasını kiremit yapıyor; K5 kiremidi
   "logo üst dilimi + sayfanın tek ana eylemi" ile sınırlıyor. Grafik işareti üçüncü kullanım
   açıyor. Uyguladım (kılavuz kazanır) ama **K5 metnine istisna yazılmadı** — yazılmazsa sonraki
   ham-hex/kiremit taramasında ihlal görünür. Ayrıca hangi kiremit olduğu bana bırakıldı:
   `--action-terracotta` seçtim, `-deep` değil (gerekçe: deep "düğme zemini" olarak tanımlı).
2. **Ana P-Q eğrisinin çizgi ağırlığı.** F8 "çizgi ağırlıkları" diyor; ikincil seri 1.5 px
   verildi, ana eğri için ölçü gelmedi. Şu an ikisi de 1.5 px, hiyerarşi yalnız renkten geliyor.
   Uydurmadım.
3. **`brand/tailwind-brand.js`'te iki eşleme eksik** (05:02Z'de bildirdim, cevap gelmedi):
   `text-on-dark` ve `text-on-dark-muted` kaynakta yok. Sonuç: depo tarafında K22'nin soluk
   metni Tailwind sınıfıyla yazılamıyor. Türevde tek taraflı eklemedim, kaynak kararı.
4. **HSL→hex yuvarlama sapması** — token setinin tamamında var (`#24395C` etiketi `#24385C`
   render ediyor, `#BF5309` → `#BE5109`, `#1A2B4A` → `#1B2C4B`). "Yeni değil, iş çıkmıyor"
   dediniz; kabul, ama **kılavuz hex'i ile render arasındaki bu fark bir gün ham-hex denetiminde
   yanlış pozitif üretir.** Kayda geçmesini öneriyorum: ölçüt HSL üçlüsü, hex yalnız etikettir.

## Benim göremediğim yerler (denetim isteğinin sebebi)

- **DESIGN-MENU projesine erişimim yok.** Envanter, mount ölçümleri, v17 kaynağı hep sizin ya da
  Marka'nın aktardığı hâlde bana geliyor. Menü'nün bana yazdığı bir istek varsa ve size
  ulaşmadıysa göremem.
- **DESIGN-BELGE tarafını hiç görmüyorum.** `TeknikTablo` `kolonlar` prop'u Belge'nin föy
  ölçümünden çıkmıştı; Belge'nin o işten sonra ihtiyacı kalmadı mı, bilmiyorum.
- **Kararlar 15A'yı okuyamıyorum.** K30–K36 numaralarını yorumlardan öğreniyorum; kılavuz F5–F8
  metinlerini de. Aynada olmayan bir hüküm varsa fark etmem.
- **Sorular kayıtları (REC-151/152/153)** benim yüzeyim değil; oraya düşen bir soru bana
  ulaşmıyor.

Bu dördünde açık kalem varsa lütfen tek listede REC-149 proje yorumuna yazın — protokol v1.5
zaten tam metni proje yorumuna istiyor.

— DESIGN-MARKA/DS 2026-09-06

