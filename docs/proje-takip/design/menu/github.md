
# GitHub kaynağı

repo: peckop/venthub-hvac-esite
branch: master

Bu proje (menü mimarisi ve ana ekran tasarımları) yukarıdaki depoyu **kaynak malzeme** olarak kullanır. Depodaki UI birebir yeniden çizilmez; tasarım kararları depodaki gerçek taksonomi, bileşen yapısı ve tasarım token'larına dayandırılır.

## Last sync

date: 2026-09-05T08:00:33Z

### Updated in this project

- **Boşluk listesi v2** (`bosluk-listesi-v2.md`): `src/app/[lang]/**/page.tsx` bağımsız sayıldı — **47 müşteri yolu** (admin 25 hariç, toplam 73 `page.tsx`); OPS'un sayımıyla tutuyor. Her yol beş hâle bağlandı.
- **Ürün yolu davranışı doğrulandı** (önceki raporumdaki hata düzeltildi): PDP **aile kanonik**, `?sku=` varyant ön seçer ve canonical'a girmez, eski varyant slug'ı **308** ile aileye taşınır. `SeriesLandingView` kodda VAR (HTTP 200) ama veri dalı ölü (`parent_family_id` 0).
- **Belge altyapısı yok:** şemada belge/dosya/katalog tablosu bulunmuyor; tek dosya tablosu `product_images`. Ürün sayfasının belge düğmeleri hiçbir dosyaya bağlanamıyor → Kataloglar sayfası çizilmedi.
- **Alternatifler v3**: bütün sayılar canlı `technical_specs`'ten (Vortice Lineo Quiet ailesi, P-Q eğrisi olan 145 üründen); uydurma değer kalmadı.

### Previous sync

date: 2026-09-03T12:25:42Z

- On ekran ve ana sayfa marka kılavuzu diliyle yeniden çizildi: lacivert #1A2B4A kabuk, aydınlık gövde, Archivo + Source Serif 4 + IBM Plex Mono. Depodaki koyu-mod + Inter kurgusu vitrinde terk edilir.
- 3D kapatıldı: `Category3DIcon` ve `ProductModelRenderer` vitrinde kullanılmaz (Recep kararı, teklif modu tutarlılık paketi).
- Kategori adresleri kısa slug'a geçer (`/tr/fanlar/korozyon-dayanimli`); ürün adresleri `/tr/products/<seri>` kalır.
- Ekranlar sayfa-başına özel görünüm değil, az sayıda şablon olarak çizildi (REC-106).

## Screen map

| Proje ekranı | Depo dosyaları |
|---|---|
| Kategori sayfası | `src/views/category/CategoryLandingView.tsx` |
| Dal / seri sayfası | `src/views/category/CategorySeriesView.tsx` |
| Ürün sayfası | `src/views/ProductDetailPage.tsx` |
| Kategori görseli / 3D | `src/components/products/Category3DIcon.tsx`, `src/components/products/3d/ProductModelRenderer.tsx`, `src/utils/3dModelOffsets.ts` — **vitrinde kapatılıyor** |
| Ana sayfa | (yeni çizim; depoda karşılığı henüz okunmadı) |
| Hero / ürün görselleri | `public/images/products/` — **kullanılmadı**: dosyalar ortam ve render görselleri (gri stüdyo fonu, laboratuvar sahnesi), beyaz fonlu izole ürün fotoğrafı değil. 867 izole görsel Supabase storage'da, Design'ın erişimi yok. |
| Renk / tipografi / radius token'ları | `docs/design_system_config.md`, `src/index.css` |
| Markalar | `src/views/BrandsPage.tsx`, `src/views/BrandDetailPage.tsx` |
| Taksonomi kaynağı (doğrulanacak) | `registry/P04-Category-Architecture/`, `docs/database_schema_master.md` |
| Ürün yolu çözümü (07 / 07c / 07d) | `src/app/[lang]/products/[slug]/page.tsx`, `src/lib/data/productRoute.ts` — **okundu**: aile kanonik, `?sku=` ön seçim, 308 taşıma |
| Seri / aile anlatım yüzeyi | `src/views/category/SeriesLandingView.tsx` — **okundu**: hero + `FamilyCard` ızgarası + TrustSignals + BottomCTA; 15A diline taşınacak |
| Hesap sayfası (K19) | `src/views/account/AccountLayout.tsx`, `src/views/account/ProjectsPage.tsx` — **okundu**: grupların yeniden dizilişi buradan |
| Müşteri yolu envanteri | `src/app/[lang]/**/page.tsx` (47 yol) — `bosluk-listesi-v2.md` |
| Matris sütun doluluk ölçümü (Faz 3, ekran 06 Tablo) | `docs/audits/matris-sutun-doluluk-2026-09-05.md`, `scripts/katalog/` — OPS üretti, okunacak |

Not: ekran eşlemesi dosya adlarından çıkarıldı; **okundu** işaretli satırlar satır satır okundu (09-05), diğerleri henüz değil. Commit sha bilinmiyor (tool tree hash döndürüyor: `6556a6b2d527`), bu yüzden `commit:` satırı yazılmadı.

Veri ölçümü depodan değil, Supabase `venthub-hvac-platform` projesinden SELECT ile yapılır (salt-okuma); sayılar `systemair-olcum-raporu.md` içinde tarih damgasıyla durur.

