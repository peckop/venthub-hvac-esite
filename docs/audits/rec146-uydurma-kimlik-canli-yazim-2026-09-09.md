# REC-146 · Uydurma kimliğin canlıdan silinmesi — yazım kaydı + denetim kapısının ilk sınavı

**Damga:** 2026-09-09T10:12:22Z · **Şerit:** URUN-KATALOG
**Araç:** `scripts/icerik-hatti/uydurma-kimlik-tek-kural.mjs --yaz` + `CANLI_YAZIM_ONAYI`
**İzin:** Recep'in **kendi sözüyle**, kendi şerit penceremde, **iki kez teyit edildi.**
Akran aktarımına (URUN'ün ilettiği izne) **dayanılmadı** — OPS da aynı hükmü verdi:
*"prod yazımı izni yazan şeridin penceresinde verilir."*

---

## 1. Ne yazıldı

| id | eski | yeni |
|---|---|---|
| `f33627bc…` | `VRT-16076` · `…-16076` · kod `16076` | `VRT-CA-IL-4020-ES-RECT` · `vortice-ca-il-4020-es-rect` · kod **null** |
| `a3a562de…` | `VRT-16077` | `VRT-CA-IL-5035-ES-RECT` |
| `a15d7a50…` | `VRT-16078` | `VRT-CA-IL-6040-ES-RECT` |
| `b86e5502…` | `VRT-16079` | `VRT-CA-IL-7050-ES-RECT` |
| `0456207e…` | `VRT-16080` | `VRT-CA-IL-8060-ES-RECT` |

`16076`–`16080` **kaynakta hiç geçmiyordu** — araç, sözleşme `model_code`'u zorunlu saydığı
için boşluğu ardışık sayıyla doldurmuştu. Kod müşteriye kadar gitmişti.

## 2. ⛔KAPSAM FARKI — yazımdan ÖNCE Recep'e bildirildi

Dökümüm *"yalnız `model_code`; `sku` ve `slug` DURUR"* diyordu. Betik **üç alanı birden**
değiştiriyor. Bu farkı yazımdan önce Recep'e **açıkça** yazdım, bedelini (slug değişimi eski
adresi kırar) ve tavsiyemi (tam temizlik — yarısını yapıp uydurma sayıyı adreste bırakmak
işi ikinci kez açmak olur) söyledim. **Onay ondan sonra geldi.**

**Gerekçe (betiğin kendi tarihçesi):** *"model_code'u boşalt"* daha önce denenmiş ve
**yetmemişti** — üç yüzey `sku`'ya düşüyordu. Uydurma sayı üç alana birden bulaşmıştı.

## 3. Ön koşullar — betik kendi ölçtü, karşılanmadan yazmadı

| ön koşul | sonuç |
|---|---|
| Üç yüzeyde `sku` yedeği kalmamalı (`pdfGenerator` · `jsonld` · `VariantSelector`) | ✓ hiçbiri düşmüyor (URUN onardı, #1148) |
| Yeni kimlik benzersiz olmalı | ✓ 5 kimlik, çakışma **0** |
| Canlı evren kesin sayıyla doğrulanmalı | ✓ 442 ürün |
| Kod kaynakta **geçmemeli** (uydurma kanıtı) | ✓ 5/5, s.26 metninde yok |

## 4. ⭐REC-292 DENETİM KAPISI — İLK GERÇEK SINAV, GEÇTİ

Bu yazım, sabah *"denetim kaydı tutulmuyor"* diye bildirdiğim boşluğun kapandığının
**ilk gerçek sınavıydı.** Beklenti yazımdan önce yazılmıştı: **beş satır; beş yoksa kırmızı.**

`admin_audit_log`, bugün, `products` / `UPDATE` → **TAM BEŞ SATIR**, beş ayrı `row_pk`:

```
10:12:22.344Z  f33627bc…  16076 -> null   VRT-16076 -> VRT-CA-IL-4020-ES-RECT
10:12:22.521Z  a3a562de…  16077 -> null   VRT-16077 -> VRT-CA-IL-5035-ES-RECT
10:12:22.621Z  a15d7a50…  16078 -> null   VRT-16078 -> VRT-CA-IL-6040-ES-RECT
10:12:22.715Z  b86e5502…  16079 -> null   VRT-16079 -> VRT-CA-IL-7050-ES-RECT
10:12:22.840Z  0456207e…  16080 -> null   VRT-16080 -> VRT-CA-IL-8060-ES-RECT
```

`before`/`after` **tam** — eski ve yeni değerin ikisi de kayıtlı. Tetik: `denetim_izi_products_upd`
(yazımdan önce `pg_trigger`'da `tgenabled='O'` ölçülmüştü).

⭐**Sabah kusuru bildiren iş, akşam kanıtını üretti.**

**Kendi hatam, kayda geçsin:** ilk sayım sorgum `created_at` kolonuna baktı ve hata verdi;
tablonun zaman kolonu **`at`**. Şemadan okuyup düzelttim. *Kolon adı varsayılmaz, ölçülür.*

## 5. ⛔DOĞAN BORÇ — eski adresler KIRIK

`slug` değişti; beş eski adres bugün 404 veriyor. **Kalıcı yönlendirme (308) aynı gün inmeli:**

```
vortice-ca-il-4020-es-rect-16076  ->  vortice-ca-il-4020-es-rect
(5035 · 6040 · 7050 · 8060 aynı desen: eski slug = yeni slug + "-" + eski kod)
```

Sahibi **URUN**; OPS bunu **öncelik 1** olarak emretti (10:15Z). Kabul ölçütü: beş eski adres
canlıda **308 + `Location`** yeni adres, yeni adres **200**.
⚠**Ölçümü URUN yapar** — vitrini ben ölçersem ISR tetiklenir ve kanıt bozulur
(aynı sınıf hata bu hafta yaşandı).

## 6. Bu yazımın kapatmadığı şey

- **Kaynakta kodu olmayan 34 ürün** hâlâ yüklenmedi. Kural cetvelde (`product-schema-standard.md`
  **§11.4.2**) ama **koda dökülmedi** — `kimlik-kurali.mjs` değişikliği Recep onayında.
- `csv_kaynak_kapisi.py` **EKSEN 1** artık bu sınıfı yakalar: CSV'de olup kaynakta olmayan kod.
  Yani aynı kusur bir daha sessizce giremez.

## 7. Ders

⭐**Kaçış valfi olmayan zorunlu alan, boşluğu uydurmayla doldurur.**
Sözleşme `model_code`'u zorunlu saydı; kaynağında kodu olmayan ürün gelince araç **uydurdu**,
hiçbir kapı görmedi, kod **müşteriye kadar gitti**. Kök neden bugün ingestor sözleşmesinde
düzeltildi (`2034377`), cetvelde §11.4.1 yanlış önerisiyle birlikte kayda geçti.

İlgili: REC-146 · REC-292 · PR #1148 (render onarımı, önkoşul)
