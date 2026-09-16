# ⛔HÜKÜM GERİ ÇEKİLDİ: "8 ürün kaynakta YOK" — YANLIŞTI (REC-212, 2026-09-10)

Bugün erken saatte şu hükmü verdim ve OPS'a bildirdim:

> *"`URUN KAYNAKTA YOK 147` satırı **gerçek**, ölçüm kusuru değil. Bu 8 ürün için kaynak
> **yok**; web kaynağı dizine eklenmeli."*

**Bu hüküm yanlış. Ürünlerin kaynağı elimizde, kaynak dizininde, 42 sayfa.**

## Nasıl çıktı

`data-table`'ı ailelere yayarken bir çağrı RPC hatası verdi (`rpc_code=3`). Sebebi ararken
defterdeki kaynakların durumunu saydım: **60 kaynağın 6'sı `ready` değil, `error`.**
Ve o altının biri: **`2022-11-en-ca-rm-es-radon.pdf`** — tam olarak "kaynağı yok" dediğim
8 ürünün belgesi.

Diskte ve kaynak dizininde ölçtüm: belge **var, 42 sayfa, 20.536 karakter metin**.

## Belgede ne yazıyor (dizin satırından, PDF açılmadan)

**s.23** — `THE RADON-SPECIFIC VORTICE RANGE — VORT CA RM ES`
> Duct exhaust fan · Diameters **100-125-150-160-200 mm** · **IPX7** (immersion watertight)
> · Electronically controlled brushless motors

**s.24** — `VORT CA RM RF ES`
> Rooftop suction unit · Diameters **150-160-200 mm** · **IP45** (suitable for outdoor
> installation) · Electronically controlled brushless motors

Bu, sekiz ürünümüzün tam karşılığıdır.

## Niçin ölçüm onları bulamadı — üç ayrı sebep, üçü de bizim tarafımızda

1. **Kodla arandılar.** `16257`…`16281` **Avensair sipariş kodlarıdır**; bu belge
   **üreticinin** belgesi ve o kodları taşımaz. Kod aramak burada yanlış anahtardı.
2. **Ad ile ikinci eşleme denenmedi.** O kural bende yalnız **kodu OLMAYAN** ürünler için
   çalışıyor. Bu 8 ürünün kodu var → ad araması hiç denenmedi. Kural doğruydu, **kapsamı
   dardı**.
3. **Ad biçimi de tutmazdı:** pakette `CA-RM 100 ES`, belgede `VORT CA RM ES` + çap listesi
   ayrı satırda. Model ile ölçü ayrışmış.

**Defter niçin "yok" dedi:** o kaynak defterde `error` durumunda — defter belgeyi
**hiç okuyamadı**. Dünkü 18/18 sınavı geçerli ama **sorusu kod'du**: kodlar gerçekten
dizinde yok. Ben oradan "ürün kaynakta yok" sonucunu çıkardım. *Ölçüt keskindi, evren
yanlıştı* — ölçtüğüm şey koddu, hüküm verdiğim şey ürün.

## ⭐İLK GERÇEK ÇELİŞKİ ADAYI — IP sınıfı

Kaynak s.23/24 ile paketi karşılaştırdım:

| ürün | pakette | kaynakta | durum |
|---|---|---|---|
| CA-RM 100 / 125 / 150 / 160 / 200 **ES** | IPX7 | **IPX7** | ✅ doğrulandı |
| CA-RM 150 / 160 / 200 **RF ES** | **IPX5** | **IP45** | ⛔**ÇELİŞİYOR** |

`IPX5` ile `IP45` aynı şey değildir: `IPX5` toz derecesini **belirtmez**, `IP45` toz 4 +
su 5 demektir. Çatı fanı dış ortama monte ediliyor; toz derecesi müşteriye görünen bir
vaattir.

Çaplar tutarlı: pakette 97/122/147/157/197 (**gerçek ölçü**), kaynakta 100/125/150/160/200
(**nominal**). Bu bir çelişki değil, iki farklı büyüklük.

**Hüküm vermiyorum, ölçümü bildiriyorum:** üç üründe IP değeri kaynakla uyuşmuyor.
Düzeltme kaynağa uyar; ama vitrinde görünen teknik veri olduğu için yazım Recep'in kapısıdır.

## Ne değişti

- `defter-tablo-uret.mjs`: yalnız `ready` kaynak `-s` ile verilir. `error` kaynağı vermek
  hem RPC'yi reddettiriyor **hem de** defterin körlüğünü bizim hükmümüze taşıyor.
- **Açık iş:** kaynak eşlemesinde ad-ile-ikinci-eşleme, **kodu olan ama kodla bulunamayan**
  ürünlere de genişletilmeli. `URUN KAYNAKTA YOK 147` bu genişletmeden sonra yeniden ölçülecek.
- **Açık iş:** defterdeki 6 `error` kaynağı yeniden yüklenmeli — defter onları okuyamıyor,
  yani o belgelerden gelen her "yok" cevabı **kanıt değil**.

---
> Ölçüm: 2026-09-10 · URUN-KATALOG · PDF açılmadı (dizin satırı okundu) · prod DB yazımı yok
