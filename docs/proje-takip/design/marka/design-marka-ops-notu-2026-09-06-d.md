
# DESIGN-MARKA → OPS · 2026-09-06 · kabuk kartında marka yazımı ihlali

Recep kabuk bandı kartını gösterdi. **Bir ihlal buldum**, kaynak dosyada doğruladım.

## İhlal · marka adları büyük harfe çevrilmiş

`components/kabuk/kabuk.card.html` içinde marka satırları **elle büyük harf** yazılmış:

```
VORTICE · SEAT · AVENS · NICOTRA GEBHARDT · DANFOSS
CASALS · FLEXIVA
```

Doğrusu veriden gelen yazım:

```
Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss
Casals · Flexiva
```

**Kritik olan "AVenS".** Büyük harfe çevrilince **"AVENS"** oluyor ve camel case kayboluyor —
bu tam olarak `VENTHUB` / `VentHub` ihlaliyle **aynı sınıf** hata. Wordmark kuralımız iç büyük
harfi koruyor; aynı gerekçe marka adları için de geçerli, çünkü yazım veriden gelir
(`src/data/brands.ts`).

Etiketlerin büyük harf olması doğru ("ÜRÜN GRUBU OLAN MARKALAR" — `satirEtiket` stili,
`text-transform: uppercase`). Sorun etiketlerde değil, **marka adlarının kendisinde**: onlar
`monoAlt` ile yazılıyor ve orada dönüşüm yok, yani metin **elle** büyük yazılmış.

## Kuralı netleştirdim

Kaydımda "yazım veriden: SEAT, AVenS" yazılıydı ama yeterince kesin değildi — "Rozetler büyük
harf ve kısa" kuralıyla karışabiliyor. `CLAUDE.md`'ye açık hâli yazıldı:

> Yazım veriden gelir ve **büyük harfe ÇEVRİLMEZ**. `text-transform: uppercase` marka adına
> uygulanmaz. Büyük harf yalnız etiket ve rozetlerde, marka ve ürün adlarında değil.

## Kartın geri kalanı ölçüldü — temiz

| Ölçüt | Durum |
|---|---|
| Bant 74 px · oluk 40 px · öğe arası 30 px | ✓ (kart altyazısında da yazılı) |
| Logo dosyadan (`venthub-kilit-yatay-tamrenk-koyu.svg` header, `-isaret-tamrenk-koyu.svg` footer) | ✓ K23 |
| Etiket ve marka satırı `--text-on-dark-muted` | ✓ K22, alfa yok |
| Sayaç rozeti `--brand-cyan-ink` + beyaz metin | ✓ 5.65 |
| `TR / EN` çerçeveli düğme, `koyuZemin` | ✓ K5 (tek dolu düğme kuralı) |
| Arama alanı beyaz zemin + `--text-muted` | ✓ 4.83 (kart yüzeyi, kapsam doğru) |
| 5 + 2 gruplama, etiketli, sayı yok | ✓ |

## DS'te yapılacak

`kabuk.card.html` iki satır: marka adları veriden gelen yazıma döner. Aynı hata
`ui_kits/kabuk/index.html` ve `templates/kabuk/Kabuk.dc.html` içinde de olabilir — üçü birlikte
taranmalı. Ayrıca `guidelines/marka-listesi.html` kartı bugün doğru yazımı taşıyordu; kabuk
kartıyla arasında ayrışma var, o da ölçülsün.

**Sıra:** DS bu düzeltmeyi yapar → sonra Recep üç projede çipi yeniden seçer. Çip işlemi bu
düzeltmeyi beklesin, yoksa tüketiciler "AVENS" yazımını alır.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve kural netleştirmesi).

— DESIGN-MARKA (Opus) 2026-09-06

