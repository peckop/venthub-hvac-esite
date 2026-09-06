
# DESIGN-MARKA → OPS · 2026-09-05 · doğrulama turu: iki madde geçti, bir aykırılık bulundu

OPS "farklı bulursan yaz, aynıysa tek satır yeter" dedi. **Farklı bir şey buldum**, o yüzden
tam not.

## Geçen iki madde — DS'in ölçümüyle aynı

**1 · Oluk.** `ui_kits/kabuk/index.html` okundu: utility şeridi `padding: 0 40px`, `gap: 30px`;
`KabukBandi` varsayılan `oluk = 40` ile çağrılıyor; header ve footer aynı bandı kullanıyor.
Bandın içinde `max-width: 1060` **yok** — 1060 yalnız `<main>` içindeki içerik sütununda ve
ekranda etiketiyle duruyor ("İçerik sütunu · 1060 px"). Ayrım doğru kurulmuş.

**2 · Marka listesi 5 + 2.** `guidelines/marka-listesi.html`: birinci satır *Ürün grubu olan
markalar* (Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss), ikinci satır *Temsil edilen
markalar* (Casals · Flexiva). Sayı yok, "ürün bekliyor" yok, vaat okunan ifade yok, Storm
yok, yazım veriden ("SEAT", "AVenS"). Kabuk footer'ında da aynı iki satır.

İyi bir ayrıntı: ikinci satır da beş sütunlu ızgarada duruyor, yani Casals ve Flexiva
Vortice ile SEAT'in altına hizalanıyor. İki satır birbirine bağlı okunuyor.

**Logo kullanımı da doğru (K23):** header `venthub-kilit-yatay-tamrenk-koyu.svg`, footer
`venthub-isaret-tamrenk-koyu.svg` — ikisi de dosyadan, koyu sürüm. Elle çizim yok.

## Bulunan aykırılık · K22 — soluk metin alfa ile yapılmış

`ui_kits/kabuk/index.html` ve `components/kabuk/kabuk.card.html` içindeki `monoAlt` stili:

```
{ fontFamily: 'var(--font-mono)', fontSize: 'var(--size-caption)',
  color: 'hsl(var(--text-on-dark))', opacity: 0.72 }
```

Bu marka şeridi metninin stili — koyu bant üzerinde ikincil metin. **K22:** *"Durum alfa ile
anlatılmaz. `opacity` kullanılmaz; soluk hâl için soluk hex + zemin + rozet. Metin daima tam
opaklıkta. İstisna yalnız `<img>` şeritleri."*

Burada `<img>` yok, düz metin var. Beyaz metne `opacity: 0.72` uygulanmış — tam olarak K22'nin
yasakladığı şey. Bugün bayat dosyasıyla gelen bir kural, DS kurulumu ondan önce yazılmıştı;
kurulum hatası değil, **kuralın yeni** olmasından kaynaklı bir kalıntı.

### Değeri ölçtüm ve tek değer dosyasına ekledim

Alfa yerine gerçek hex gerekiyor. Kılavuzun koyu zeminde zaten kullandığı ikincil ink
**`#8FA2BD`**. Ölçüm:

| Zemin | Kontrast | Sonuç |
|---|---|---|
| `#1A2B4A` lacivert bant | **5.42:1** | AA geçer (normal metin) |
| `#0F1723` utility şeridi | **6.92:1** | AA geçer |

`brand/tokens.css`'e eklendi (tek değer dosyası kuralı gereği kaynağa):

```
--text-on-dark-muted: 215 26% 65%;   /* #8FA2BD · koyu zemin ikincil metin — 5.41:1 */
```

DS tarafında yapılacak: `tokens/renk.css`'e aynı satır, ve iki dosyadaki `monoAlt` stilinden
`opacity: 0.72` kalkıp `color: 'hsl(var(--text-on-dark-muted))'` gelmeli.

**Not:** `opacity: 0.72` beyazı %72'ye düşürdüğünde ortaya çıkan renk zemine bağlı ve
ölçülemez; sabit hex hem ölçülebilir hem yazdırılabilir. K22'nin gerekçesi de bu.

## Aynı kalıbı kendi dosyalarımda da aradım

Kılavuz ve prova sayfalarımda metin üzerinde `opacity` kullanmadım — koyu zeminde doğrudan
`#8fa2bd` yazmışım. Yani kural bende zaten uygulanıyordu, tokeni yoktu; şimdi var.

## Sırada

- DS: iki dosyada `opacity` → token değişimi (küçük, tek tur).
- Recep: **Published**. DS kutuyu göremiyor, ben de tüketici projeden ancak işaretlendikten
  sonra doğrulayabiliyorum.
- Açık: `templates/kabuk/` şablonu (13:47 hükmü "AÇ") — DS sıra bekliyor.

**Kullanılan `/` yeteneği:** bu turda yok (doğrulama ve ölçüm).

— DESIGN-MARKA (Opus) 2026-09-05

