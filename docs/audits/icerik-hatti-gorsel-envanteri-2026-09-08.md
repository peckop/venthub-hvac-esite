# Görsel envanteri — mükerrerler ve "yeni fotoğraf gerekli" listesi (2026-09-08)

**Niçin:** Recep kararı, lafzıyla —
> *"tekrar edenler aynen kalsınlar ama bunarı kaydet bilelim görsel olarak mükkerre olnalar
> ve bunlar yeni foto lazım diye bilelim."*

**YÖNTEM:** elle · araç `scripts/media/gorsel-envanteri.mjs` (bugün yazıldı, salt okuma, tekrar koşulabilir).
**CETVEL:** `docs/standards/product-image-standard.md` — bu ölçümün kolu YOK; kapı REC-284'te.
**Ham veri:** `icerik-hatti-gorsel-envanteri-2026-09-08.json` (aynı dizin).
**SALT OKUMA — canlıya hiçbir yazım yapılmamıştır.**

---

## Ölçüm

| | sayı |
|---|---|
| görsel kaydı | 1042 |
| hash'lenen dosya | 898 |
| boyutu benzersiz olduğu için elenen | 144 |
| mükerrer grup (aynı dosya, birden çok ürün) | **129** |
| — bunlardan kategori içi (meşru varyant paylaşımı) | 126 |
| — **kategori sınırını aşan (şüpheli)** | **3** |
| görselsiz ürün | **103** (hepsi `status=active`) |

⭐**Eleme neden bilgi kaybı değil:** farklı bayt boyutundaki iki dosya birbirinin aynısı olamaz.
144 dosya boyutu benzersiz olduğu için tanım gereği tekildir. Boyut yalnız **eleme** ölçütüdür;
karar hep sha256 ile verilir (boyut eşitliği içerik eşitliği değildir).

## 1. Kategori sınırını aşan üç grup — hepsi AYNI dokuz ürün

| hash | ürün | kategoriler |
|---|---|---|
| `e5ebeadb41e3a5f0` | 9 | heat-recovery-vmc + air-treatment |
| `bac4bcd2c8666dbc` | 9 | heat-recovery-vmc + air-treatment |
| `767e808a589d9668` | 9 | heat-recovery-vmc + air-treatment |

Üç ayrı fotoğraf, aynı dokuz ürüne kopyalanmış:
**AVE-13010 · 13011 · 13013** (ısı geri kazanım — fotoğraf doğru) ve
**AVE-13052 … 13057** (sulu batarya — fotoğraf **yanlış**, REC-282).

⭐**Sabahki bulgu bu taramayla TAM oldu:** kusur *"herhalde başka yerlerde de vardır"* değil,
**tam olarak bu bir grup.** 442 ürünün tamamı tarandı, kategori sınırını aşan başka paylaşım
**yok**. Bu, düzeltmenin sınırını da kesinleştiriyor: 6 ürün, 3 fotoğraf.

## 2. ⭐YENİ BULGU — 103 aktif ürünün hiç görseli yok

Sabahki ölçüm kategori görseline bakıyordu; bu tarama ürün düzeyini de gösterdi.

| kategori | görselsiz aktif ürün |
|---|---|
| `fans` | **86** |
| `air-treatment` | 8 |
| `commercial-ventilation` | 7 |
| `accessories` | 2 |

**86 fan ürünü vitrinde fotoğrafsız duruyor.** Bu, kategori görseli işinden büyük ve bugüne
kadar sayılmamıştı. Kaynak durumu bilinmiyor — ölçülmedi, ölçülmeden tahmin de yazılmayacak.

## 3. Kategori içi paylaşım (126 grup) — kusur DEĞİL

Bir ailenin varyantları (ör. aynı fanın 8 güç seçeneği) aynı fotoğrafı kullanır; bu beklenen
davranıştır. Envanterde **ayrı** listelenir ki "mükerrer" sayısı korkutucu görünmesin:
129'un 126'sı bu türden.

---

## "Yeni fotoğraf gerekli" listesi — 109 ürün

| küme | sayı | durum |
|---|---|---|
| yanlış fotoğraflı sulu batarya | 6 | fotoğraf var ama **başka ürünün**; doğrusu iki kaynakta arandı, yok |
| hiç görseli olmayan aktif ürün | 103 | 86'sı fan |

Tam liste JSON'da (`gorselsiz_urunler`, SKU + ad + kategori + durum).
**Recep kararı gereği hiçbiri silinmedi/değiştirilmedi** — bu belge kaydın kendisidir.

## Sınır — bu envanterin ölçmediği

- Görselin **doğru ürüne ait olup olmadığı**: yalnız *aynı dosya iki üründe mi* sorusunu
  ölçer. Tek bir ürüne yapıştırılmış yanlış fotoğraf (kopya değilse) bu taramada **görünmez**.
- Görselin **nereden geldiği**: kayıt yok, üretilemez (uydurulmayacak).
- Görselin **kalitesi/çerçevelemesi**: Recep'in "merkezleme/orantı" maddesi bu ölçümün dışında.
