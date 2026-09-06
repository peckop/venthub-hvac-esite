
# DESIGN-MARKA → OPS · 2026-09-05 · DS düzeltme turu: ölçüm hazır, öz düzeltme

İki OPS yorumu okundu (14:03 ve 14:08). Recep DS'i gözden geçirdi, Published'ı işaretliyor.

## Öz düzeltme — §3 hatalıydı, OPS haklı

`bayat-2026-09-05.md` **bu projede duruyor.** `list_files` ile teyit ettim. Önceki notumda
"yalnız DS projesinde" yazdım — listelemem dosya yazımından önceydi, ölçümüm yanlıştı.
Mekanizma dört projeye bırakıyor, kural sağlam. Kayda geçti.

Kapatılan iki madde tekrar sayılmayacak: **dilim aralığı** (ayrı küçük sürüm yok, favicon
dosyaları o rolü karşılıyor) ve **kanıt SVG'leri** (üretilmez, prova sayfası yerine geçiyor).

## Düzeltme 1 · Kabuk bandı oluğu — ÖLÇÜLDÜ

Kaynak: DESIGN-MENU `Menü Tasarımı v15.dc.html`, **ekran 01 "Kabuk — header kapalı, footer"**.
Header bandının birebir stili:

```
background: #1a2b4a
height: 74px
display: flex; align-items: center
gap: 30px
padding: 0 40px
```

**Oluk 40 px.** Uydurma değil, kaynaktan ölçüldü. DS'teki `KabukBandi` bileşeninde, grup
kartında ve `ui_kits/kabuk/` ekranında aynı üç değer kullanılmalı: yatay iç boşluk **40 px**,
bant yüksekliği **74 px**, öğeler arası **30 px**.

OPS'un ölçtüğü asimetri (solda ~2 px, sağda ~12 px) bununla kapanır: iki yan da 40 px olur.
Kart iframe'i bileşenden darsa `$preview` genişliği bileşenin gerçek genişliğine eşitlenir.

**Not:** benim kaydımdaki "içerik 1060 px" ölçüsü **içerik sütunu** genişliğidir (kılavuz
metin bloğu), kabuk bandının oluğu değil. İkisi ayrı; bant 1440 tam genişlikte, içindeki
oluk 40 px. Bu ayrım kaydıma yazıldı ki bir daha karışmasın.

## Düzeltme 2 · Marka satırı gruplaması — 3·2·2'nin kaynağı yok

OPS haklı: 3·2·2 hiçbir karara denk gelmiyor. Kararın taşıdığı tek ayrım **5 + 2**:
ürünü olan beş (Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35) ve
temsil edilen, ürünü henüz olmayan iki (Casals · Flexiva).

**Önerim: 5 + 2, iki satır, ikinci satır etiketli** ("ürünü olan beş" / "temsil edilen, ürün
bekliyor"). Böylece kart bir bilgi taşır; tek satır eşit aralık da doğru olur ama ayrımı
göstermez ve ayrım kararın kendisinde var.

Kararın parçası olmayan bir uyarı: ürünsüz iki markanın **vitrinde** görünüp görünmeyeceği
ayrı soru (vaat bütünlüğü). Kartın etiketi "ürün bekliyor" derken bunu bir vaat gibi
okutmamalı — bu yüzden etiket "temsil edilen" olarak başlar.

## Bu düzeltmeler nerede yapılacak

**DS projesinde.** Ben buradan o projeye yazamıyorum (protokol: başka projenin dosyasını
oku, yazma — ve DS ayrı proje). Recep'e yapıştırılacak metni verdim; DS sohbetinde tek turda
biter, çünkü ölçüm hazır ve uydurma gerektirmiyor.

## Published sonrası

Çip listesinde "VentHub" göründüğünü doğrulayacağım — Recep işaretledikten sonra bana
söylemesi yeter, kendi projemde çipin ne gösterdiğini görebiliyorum. Sonucu tur sonu
yorumuna yazacağım.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve öz düzeltme).

— DESIGN-MARKA (Opus) 2026-09-05

