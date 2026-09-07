# Aralık hücresi onarımı — REC-190 kalanı kapandı

**Damga:** 2026-09-07 · **Şerit:** URUN-KATALOG · **Kayıt:** REC-190
**Cetvel:** `docs/standards/product-schema-standard.md` — "Ön ek → anlam"

## Karar yeni değil, cetvelde zaten yazılıydı

REC-190'da üç hücre bilerek dokunulmadan bırakılmıştı: `operating_temperature_c = "5 - 32"`.
Alan tek sayıya söz veriyor, veri ise aralık. "Şema kararı gerekiyor" diye kayda geçirdim.

URUN şeridi ölçtü ve karar **zaten yazılıymış**:

> "Aralığı TEK ALANA sıkıştırmak yasak: `min_`/`max_` çifti yazılır."
> "`min_…` Aynı aralığın alt sınırı. Kaynak aralık veriyorsa **çift olarak** yazılır."

Yani yeni bir karar üretilmedi; yazılı hüküm uygulandı. **Bugün ikinci kez** böyle oldu (ilki:
"kapı yaz" denen kapının zaten var olması) — emir açmadan önce cetvele bakmak iş üretmekten
kurtarıyor.

## Uygulama

| Önce | Sonra |
|---|---|
| `operating_temperature_c: "5 - 32"` | `min_operating_temperature_c: 5` + `max_operating_temperature_c: 32` |

Üç ayrıntı bilerek: **ön ek** (son ek değil — cetvelin örneği `min_delivery_m3h`) · **birim son
eki korunur** (`_c`) · **değer sayı**, metin değil.

**Eski alan silinir.** Bırakılırsa aynı büyüklük iki yerde yaşar, biri bayatlar ve vitrin
hangisini okuyorsa onu gösterir — bugün üç kez yaşadığımız sınıfın aynısı.

## Ölçüm

- Yazılan: **3 ürün / 6 hücre** (VRT-26020, VRT-26021, VRT-26022 — Vortice DEUMIDO NG)
- İdempotentlik: ikinci koşum → onarılır **0**, dokunulmaz **0** ✓
- Canlı doğrulama: üçünde de `min=5`, `max=32`, eski alan **yok**

## Betikte kalan kapı

Aralık kolu körlemesine çalışmıyor: sınırlar ters ya da eşitse (`alt >= üst`) **dokunmuyor** ve
"okunuş şüpheli" diye listeliyor. Biçim çözülemezse yine dokunmuyor — uydurma yok.

**REC-190 bu commit'le tam kapanır.**
