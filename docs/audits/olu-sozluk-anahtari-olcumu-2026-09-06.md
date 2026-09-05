# Ölü Sözlük Anahtarı — Borç Ölçümü (2026-09-06)

> **Ne bu:** i18n sözlüğünde tanımlı olup kaynakta **tüketicisi olmayan** anahtarların
> bugünkü ölçümü. **KOD DEĞİŞMEDİ** (tek istisna: kapının başlığındaki *bayat* dağılım
> satırı düzeltildi — aşağıda F3). REC-133 · URUN şeridi · taban `7b13af63`.
>
> **Kaynak SSOT:** `src/__tests__/conformance/i18n-dead-key.test.ts` (INV-6) — borç listesi
> kapının **içinde** yaşar; bu belge o listeyi **özetler**, yerine geçmez.

---

## 0. Ölçüm yöntemi

| Ne | Nasıl |
|---|---|
| Borç listesi | `DONMUS_BORC` dizisi **parantez sayarak** çıkarıldı (girinti/yorum tuzağına düşmeden), yorumlar silinip yalnız dize girdileri alındı |
| Ad alanı | anahtarın **ilk** segmenti |
| Tarihçe | `git log --follow` + her commit'te aynı sayım |
| Nokta kontrolü | üç anahtar elle sınandı (tam yol + yaprak literali) |

⚠**İlk denemem 0 döndürdü** — parantez sayacını dizinin `[` karakterinin *üstünden*
başlattım, derinlik hemen kapandı ve blok boş çıktı. Sayının 0 gelmesi beni durdurdu;
düzeltildikten sonra 415. **Betiğe "dizi kapanmadıysa hata fırlat" koruması eklendi** —
sessiz 0, yanlış bir "borç bitti" raporuna dönüşebilirdi.

---

## 1. BUGÜNKÜ BORÇ

**415 benzersiz anahtar.**

| Katman | Anahtar | Kimin işi |
|---|---|---|
| `admin.*` | **314** (%76) | **ADMIN şeridi** — kendi cetveli var, bu belge hüküm vermez |
| Vitrin (14 ad alanı) | **101** (%24) | **URUN şeridi** — bizim |

**Vitrin dağılımı:**

| Ad alanı | Adet |
|---|---|
| `common` | 26 |
| `account` | 24 |
| `category` | 19 |
| `auth` | 7 |
| `orders` | 6 |
| `products` | 5 |
| `checkout` · `header` | 3 · 3 |
| `support` · `returns` | 2 · 2 |
| `brands` · `quotes` · `search` · `pdp` | 1 · 1 · 1 · 1 |

---

## 2. ⭐TARİHÇE — borç BÜYÜDÜ, ama gizlemekten değil

| Commit | Tarih | Borç | Ne oldu |
|---|---|---|---|
| `66494956` | 08-23 | **431** | INV-6 kapısı doğdu; ilk ölçüm |
| `bc10ac86` | 08-23 | **355** | Kapının **körlüğü** düzeltildi (ayraçlı şablon) → 76 anahtar aslında CANLIYMIŞ |
| `6b1d3681` | 08-23 | **266** | 89 ölü anahtar **kaldırıldı** (gerçek borç ödemesi) |
| `e1a4b87b` | 08-28 | 266 | değişmedi |
| `480352bd` | 09-03 | **415** | REC-127: kapıya **DOSYA-BAĞI** şartı → **+149** gizli ölü anahtar ORTAYA ÇIKTI |

**Niçin bu tablo önemli:** "borç listesi yalnız küçülebilir" kuralına bakan biri 266→415
artışını görüp **kapının susturulduğunu** sanabilir. Ölçüm bunun tersini söylüyor: liste,
kapı **keskinleştiği** için büyüdü. O 149 anahtar 09-03'ten önce de ölüydü — sadece zayıf
bir ölçüt onları "canlı" sayıyordu (alakasız bir dosyadaki çıplak yaprak adı akladığı için).

**Kuralın gerçek anlamı, açıkça:** liste **canlıya dönen** anahtarı tutamaz (bayatlık testi
bunu zorlar). **Daha keskin ölçümün ortaya çıkardığı** anahtarın eklenmesi meşrudur — ve
tam da bu yüzden her ekleme **sebebiyle birlikte** commit edilmelidir; sayı tek başına
"iyi/kötü" demek değildir.

---

## 3. F3 — kapının başlığındaki dağılım satırı BAYATTI (bu PR'da düzeltildi)

`i18n-dead-key.test.ts` başlığında şu satır duruyordu:

> *Dağılım: admin 200 · pdp 61 · common 47 · category 39 · account 29 · products 21 · diğer 34*

Bu **431-dönemi** (08-23) sayısıdır. Bugün ölçülen: **admin 314 · common 26 · account 24 ·
category 19 · pdp 1**. `pdp` 61'den **1**'e inmiş, `admin` 200'den **314**'e çıkmış.

Sayılar yanlış değil, **eski**. Ama okuyucuyu yanıltıyor: kapının kendi belgesi, kapının
kendi listesini yanlış tarif ediyordu. Aynı sınıf bugün tasarım cetvelinde de görüldü
(§5 özet tablosu bayat). **Ders:** özet sayı, üretildiği ölçümün tarihiyle birlikte yazılmalı.

---

## 4. Nokta kontrolü — üç vitrin anahtarı elle sınandı

| Anahtar | Tam yol isabeti | Sonuç |
|---|---|---|
| `account.addresses.ph.phone` | 0 | ölü ✓ |
| `support.home.subtitle` | 0 | ölü ✓ |
| `returns.created` | **1** → incelendi | **yine de ölü** ✓ |

⚠`returns.created`'in isabeti `t('returns.createdToast')` satırından geliyordu — **alt-dize**
eşleşmesi. Yani kaba `grep` bir anahtarı yanlışlıkla "canlı" gösterebilir; kapı bunu
yapmıyor (tam yol / yaprak + ata şartı). **Ölçüt kaba olursa borç OLDUĞUNDAN AZ görünür.**

---

## 5. Öneri (tek)

**Vitrin tarafındaki 101 anahtar tek dalgada kaldırılabilir** ve bu **kullanıcıya görünmez**:
ölü anahtar tanımı gereği hiçbir yerde render edilmiyor. Yani K8 gerektirmez; riski, yanlışlıkla
canlı bir anahtarı silmektir — ona karşı INV-6'nın kendi bayatlık testi + `tsc` (`en: typeof tr`)
koruyor. Admin'in 314'ü **admin şeridinin** işidir; bu belge oraya karışmaz.

---

## 6. Bu belgenin SINIRI (adıyla)

- **Dinamik anahtarlar** ölçülmez: `t(değişken)` ve ayraçlı/ayraçsız şablonla üretilen
  anahtarlar statik taranamaz. Kapı bunları **kanarya** listesiyle telafi ediyor
  (8 + 3 anahtar); kanarya ölürse "sözlük bozuldu" değil **"kapı körleşti"** demektir.
- Yaprak-adı ekseni **bilerek gevşek** (yanlış-kırmızı vermemek için). Yani gerçek borç,
  ölçülenden **biraz daha büyük** olabilir — asla daha küçük değil.
- Bu bir **ölçüm** belgesidir; anahtar silme işi ayrı iştir.
