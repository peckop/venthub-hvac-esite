# Kategori görseli tedarik planı (2026-09-08, URUN-KATALOG)

**Niçin:** OPS istedi — *"16 boş kategori tedarik işi: kaynak planı (marka sitesi / katalog PDF
görseli / üretim) ve süre tahmini yaz, Recep'e onunla gideceğim."*
**Düzeltme:** sayı 16 değil **3** (+2 değişim). Gerekçe: `docs/audits/icerik-hatti-kategori-gorsel-2026-09-08.md` §DÜZELTME.
**YÖNTEM:** elle (ölçüm + plan). Sapma yok.
**CETVEL:** `docs/standards/product-image-standard.md` — **kategori görseli için kol YOK**; bu
planın çıktısı cetvele bir bölüm eklemeyi de kapsar.

---

## 1. İş listesi — 5 kalem (16 değil)

| # | kategori | ürün | marka | ne gerekiyor |
|---|---|---|---|---|
| 1 | `accessories` (ÜST, anasayfada) | 2 | AVenS | görsel YOK — tedarik |
| 2 | `electric-duct-heaters` | 6 | AVenS | görsel YOK — tedarik |
| 3 | `industrial-ceiling-fans` | 7 | Vortice | görsel YOK — tedarik |
| 4 | `fans` (ÜST) | 355 | Nicotra | **değişim** — Recep: "sessiz fan resmi kullanılsın" (bugünkü: santrifüj fan) |
| 5 | `air-curtains` (ÜST) | 8 | — | **değişim** — Recep: "arka planı kirli beyaz"; ayrıca tek yerel PNG'lerden biri |

Kalan 13 boş kategori **pasif** (`is_active=false`) — vitrinde yok, görsel gerekmiyor.
Aktifleşirlerse bu listeye girerler; **kapı bunu ölçmeli** (bugün ölçmüyor).

## 2. Kaynak — ölçüldü, marka başına AYRI

| kaynak | ölçüm | kimler için |
|---|---|---|
| **Vortice katalog PDF'leri** | **23 PDF · 8030 gömülü görsel**, bunların **490'ı ≥400×400**, en büyüğü **3350×4731** | kalem 3 |
| **AVenS katalog PDF'i** | ⛔**HİÇ PDF YOK** (`venthub/markalar/avens/**` altında 0 PDF; yalnız `03-output` CSV'leri var) | kalem 1–2 → **tek yol marka sitesi** |
| marka sitesi | araç mevcut: `scripts/media/avensair-avens-run.mjs` (kibar çekim), `upload-pilot-images.mjs` (yükleme) | kalem 1–2, 4–5 |
| üretim (görsel oluşturma) | ⛔**yetenek YOK** — ne bende ne altyapıda | — |

⭐**Yokluk iddiası iki kez ölçüldü:** ilk sayımda "AVenS'te 0 kullanılabilir görsel" çıktı; eşiksiz
sayım sebebin **0 görsel değil 0 PDF** olduğunu gösterdi. Yokluğun sebebi yanlış okunursa plan da
yanlış olurdu (PDF'ten çıkarmaya çalışırdık).

## 3. Boşluk — kategori görselinin kendi yolu YOK

- Kategori görseli bugün **bir ürünün fotoğrafına** işaret ediyor (`categories.image_url` → storage'daki ürün klasörü).
- Bu üç kategorinin **ürünlerinde de görsel yok** → seçilecek bir şey yok; önce ÜRÜN görseli gelmeli.
- 14 medya betiğinin hepsi **ürün** görseli içindir; kategori görseli yazan/denetleyen betik **yok**.
- İki kategori yerel `/images/products/*.png` gösteriyor, 19'u storage → **kova sözleşmesi iki taşıyıcılı**, kanonik yazılı değil.

## 4. Sıra ve süre — ölçülene dayalı, ölçülmeyen ölçülmemiş diye yazıldı

| adım | iş | süre | dayanak |
|---|---|---|---|
| A | Vortice PDF'lerinden `industrial-ceiling-fans` (destratifikatör) görselini çıkar → 7 ürüne + kategoriye | **yarım gün** | kaynak elde, araç var, ölçüldü (490 görsel) |
| B | AVenS sitesinde kalem 1–2 ürünlerinin görseli **var mı** — ölçüm | **1–2 saat** | ⚠**ÖLÇÜLMEDİ**; site içeriğini bilmiyorum |
| C | B yeşilse: çekim + webp + yükleme (8 ürün) | yarım gün | araç var |
| C′ | B kırmızıysa → **Recep kapısı**: görsel yoksa kategori görselsiz mi kalsın, başka kaynak mı | — | karar |
| D | `fans` + `air-curtains` değişimi — hangi görsel? | — | ⛔**Recep seçer**, "sessiz fan" ve "temiz arka plan" ölçüt değil tercih |
| E | Kova sözleşmesi tek kaynağa + kategori görseli konformans kolu | yarım gün | REC açılacak |

**Toplam gerçekçi tahmin: 1,5–2 gün**, B adımının sonucuna bağlı. Merkezleme/orantı işi (Recep'in
5. maddesi) bu plana **dahil değil** — A–E kapanmadan sıraya girmez.

## 5. Recep'e gidecek üç şey

1. **Karar:** altı sulu batarya ürününün yanlış fotoğrafı (REC-282) — kaldır mı, bekle mi.
2. **Karar:** `fans` ve `air-curtains` için hangi görsel — tercih, ölçüyle çözülmez.
3. **Bilgi:** iş 16 değil 5 kalem; AVenS tarafında kaynak PDF yok, siteye bağlıyız.

**Bu planda canlıya hiçbir yazım yapılmamıştır.**
