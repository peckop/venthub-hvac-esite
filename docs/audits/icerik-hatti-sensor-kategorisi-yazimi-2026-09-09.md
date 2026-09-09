# Sensör/yedek parça alt kategorisi — canlı yazım ve kanıt (2026-09-09, URUN-KATALOG)

**Yetki:** Recep'in **kendi sözü**, kendi penceresinde, lafzıyla:
> *"sensöt kategorisini sen nereye koymuştun aksesurlar altına mı? … bana soru sormana gerek yok
> ben zaten hedefi vermedim mi? katralog veri girişi full kapsam ajans gibi"*

⛔Bu yazım **bir gün beklemişti**, çünkü akran aktarımı (*"OPS diyor ki Recep onayladı"*) canlı
prod yazımı için onay sayılmaz. Recep kendi ağzıyla söyleyince aynı turda yapıldı.

**YÖNTEM:** elle (MCP `execute_sql`). **Yazma yüzeyi dosya değil, doğrudan DB.**
**CETVEL:** `category-taxonomy-standard.md` §8 (taşıma iki tablodur) + §9 (önce döküm).

---

## §9 gereği: döküm YAZIMDAN ÖNCE panoya bırakıldı

Etkilenen her satır id'siyle ve önceki değeriyle yazıldı, sonra yazım koşuldu.

| tablo | işlem | satır |
|---|---|---|
| `categories` | **yeni** | `1a87e18b-6195-48f4-8c75-2f5f5feb137f` · "Yedek Parça ve Sensörler" · `spare-parts-sensors` · parent `accessories` · level 1 · aktif |
| `products` | `subcategory_id`: **null → yeni** | `fd189d5e…` SEA-810105 PTC SENSOR · `d585cb3d…` AVE-30110 BVU-LS 1000 · `f347d28f…` AVE-30111 BVU-LS 2000/3000 |
| `product_families` | `subcategory_id`: **null → yeni** | `55937a21…` SEAT ATEX PTC Sensörü · `61a657c1…` AVenS BVU-LS Kurşun Seperatör |

`category_id` üçünde de zaten `accessories`'ti, **değişmedi**.
Aile kayıtları §8 gereği taşındı — yalnız `products` güncellenseydi veri doğru, **vitrin sessizce
yanlış** kalırdı.

## Kapılar (DB tarafı, vitrine dokunulmadan)

| ölçüt | sonuç |
|---|---|
| aile/ürün kategori ayrışması | **0** |
| yeni kategoride ürün / aile | **3 / 2** |
| yaprak kategorisi olmayan aktif ürün | **11 → 8** |

## ⭐Vitrin ölçümü BİLEREK YAPILMADI

Sınanan şey *"veri değişince sayfa **kendiliğinden** tazeleniyor mu"* (webhook çalışma kanıtı,
REC-59/REC-292). **Sayfayı ben çekseydim ISR tazelemesini kendim tetikleyebilirdim** ve tazelenmenin
webhook'tan mı isteğimden mi geldiği ayrışmazdı — yani ölçmek kanıtı **bozardı.**
İlk istek URUN'a bırakıldı. *Ölçmemek de bir ölçüm kararıdır.*

## ⛔REC-292 SAHNE KANITI — canlı, bugün

Yazımdan hemen sonra, **ölçülmüş UTC** damgasıyla (`date -u` → `2026-09-09T07:25:50Z`):

| ölçüt | sonuç |
|---|---|
| `admin_audit_log`, bugünün tarihi, **tüm tablolar** | **0** |
| aynısı, yalnız `categories`/`products`/`product_families` | **0** |

**Canlıya beş satır yazıldı (1 kategori + 3 ürün + 2 aile) ve denetim izinde hiçbiri yok.**
Bu, REC-292'nin *"betikle/doğrudan yapılan yazımlar loglanmıyor"* bulgusunun **canlı sahne kanıtı**.
⚠Tablo boş değil: `categories` için 12 eski satır var, hepsi **admin panelinden**. Ayırt edici
ölçüt tablonun doluluğu değil **o günün yazımları**.

## Kalan iş — aynı kusur, başka yer

Yaprak kategorisi olmayan **8 ürün Hava Perdeleri'nde** (Vortice Air Door; iki aile: H AD elektrikli
ısıtmalı 4, AD ortam havalı 4). Kategori metni bu ikiliği zaten anlatıyor, yani ayrım hazır.
**Kendiliğimden dokunulmadı:** `air-curtains` `display_mode: series` taşıyor ve alt kategori eklemek
vitrin gösterimini değiştirebilir — orası URUN'un alanı, ona soruldu. Bozulmuyorsa aynı kalıp
uygulanır ve sayı **0**'a iner.

## Yöntem notu — kendi hatam
İlk döküme saati **11:0xZ** yazdım; gerçek UTC **07:25Z**'ymiş. Yerel saati "Z" ile damgalamışım.
OPS yakaladı. Kural zaten yazılıydı: **saat varsayılmaz, `date -u` ile ölçülür.**
