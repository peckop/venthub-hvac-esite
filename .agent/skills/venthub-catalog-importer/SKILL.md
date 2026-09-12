---
name: venthub-catalog-importer
description: HVAC katalog PDF'lerinden görsel çoklu-ajanla ürün verisi çıkarıp CSV üretir (Kademe 1).
  ⚠BU DOSYA YALNIZ YÖNLENDİRİCİDİR — çalıştırma mekaniği venthub-pdf-ingestor deposundadır.
  Tetik: katalog oku, pdf scan, hvac catalog import, Vortice/Avensair katalog işleme.
  DB'ye YAZMAZ. Birim test/git branch/db reset için KULLANMA.
when_to_use: 'Kullan: katalog PDF çıkarımı gerektiğinde — ama işi BURADA yapma, ingestor deposuna geç.'
allowed-tools:
- view_file
category: audit
metadata:
  triggers:
  - katalog oku
  - pdf scan
  - hvac catalog import
  inputs:
  - catalog pdf files
  outputs:
  - yönlendirme (asıl çıktı ingestor deposunda üretilir)
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# ⛔ BU DOSYA İÇERİK TAŞIMAZ — kanonik skill başka depoda

**Kanonik yol:**

```
<venthub-pdf-ingestor deposu>/.agent/skills/venthub-catalog-importer/SKILL.md
```

O depo bu deponun **kardeşidir** (aynı üst dizin), yani buradan göreli yol:
`../venthub-pdf-ingestor/.agent/skills/venthub-catalog-importer/SKILL.md`

Tam sözleşme: `venthub-pdf-ingestor/GOREV-katalog-ice-alim.md`

## Niçin burada içerik YOK — ölçülmüş sebep

2026-09-07'de ölçüldü: bu dosyanın eski hâli **2026-06-08 tarihliydi**, ingestor'daki kopya ise
**2026-08-20**. Aradaki fark masum değildi — 20 Ağustos'ta eklenen şu kural burada **yoktu**:

> `model_code` biçimine varsayım koyma — **uzunluk/biçim kısıtı YOK**. Salt sayısal (`11313`),
> alfanümerik (`NS311280`), boşluklu (`ENKEC 155`), uzun/karışık (`253080106XN`) hepsi geçerlidir.

Bu kuralın yokluğu **74 ürünün katalogdan düşmesine** yol açan varsayımın ta kendisiydi. Yani
bayat kopya, düzeltilmiş kuralın yerine **düzeltilmemiş olanı** okutuyordu — ve bu dosyaya on
ayrı belgeden referans veriliyor.

**Alınan karar:** aynı kural iki yerde yaşamayacak. İçerik tek kaynakta (ingestor), burada
yalnız yönlendirme kalacak. Yönlendirme bayatlamaz.

> İki kopya tutmak "yedek" değildir; biri bayatladığı anda **yanlış kuralın kaynağı** olur.

## Katalog işi nerede yapılır

Çıkarım, kaynak PDF'lerin ve `kaynak-dizini/`nin bulunduğu **ingestor deposunda** koşar. Bu
depoda (venthub-hvac) katalog **tüketilir**, üretilmez: CSV → DB yüklemesi Kademe 2'dir ve
`scripts/icerik-hatti/` altındaki betiklerle, Recep kapısından geçerek yapılır.

**Not:** `scripts/visual_ingest_page.py` (ingestor) TERK EDİLMİŞTİR — MIMO servisine bağlıdır ve
o anahtar ölüdür (401, 2026-09-07). Kanonik yol yukarıdaki skill'dir.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
