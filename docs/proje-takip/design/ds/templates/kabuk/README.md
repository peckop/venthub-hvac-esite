
# Kabuk şablonu

Tüketici projelerin tek tıkla başlayacağı VentHub kabuğu: koyu utility şeridi + **74 px** koyu
lacivert header + aydınlık gövde + koyu footer. **İçerik alanı boştur** — ekran kaynağı
DESIGN-MENU'dür (K11), şablon yalnız taşıyıcıyı verir.

## Sahiplik — şablon kaynak, kart türev

OPS hükmü (REC-149): **şablon kaynaktır, kart türevdir.** Aynı kabuğu gösteren
`ui_kits/kabuk/index.html` kartı bu dosyanın türevidir ve başına o damga yazılıdır. Kabuk düzeni
değişecekse **önce burası** değişir.

## Tüketici projede

Tek satır düzenlenir: `ds-base.js` içindeki `base`. Bu proje içinde `'../..'` (kök `styles.css` +
`_ds_bundle.js`); tüketici projede bağlı DS ağacını gösterir (`_ds/<klasör>` kökte,
`../_ds/<klasör>` bir düzey altta). Logo yolları da aynı köke bağlıdır: `Kabuk.dc.html` mantık
sınıfındaki `dsKok` alanı — logo **elle çizilmez** (K23), dosyadan gelir.

## Ölçüler ve kurallar (değiştirilmez)

- Bant tam genişlikte; iç oluk **40 px**, yükseklik **74 px**, öğe arası **30 px**
  (Menü v15 ekran 01 ölçümü). Oluk ortalanmış sütundan türetilmez.
- İçerik sütunu **1060 px** — bandın oluğu değil.
- Koyu bantta metin **tam opaklıkta** (K22): soluk ton `--text-on-dark-muted`. Turkuaz küçük metin
  koyu zeminde kullanılmaz (üç koyu zeminde de AA'nın altında).
- Footer marka satırı **5 + 2, etiketli**; sayı ve vaat okunan ifade yazılmaz.
- Düğme etiketi tek satır; sayfada **tek** dolu kiremit eylem (K5) — şablonda kiremit yok, onu
  ekranı kuran koyar.

## Geçerlilik aralığı

Masaüstü artboard (1440). Header satırı ölçülen içerikle ~**900 px'in altına sığmaz**; altındaki
davranış (kırılma noktası, aramanın gizlenmesi, satır sarması) burada **icat edilmez** — mobil
kabuk K19 ile DESIGN-MENU'de kararlaştırıldı.

## Tweaks

`utilityGoster` · `aramaGoster` · `teklifSayaci`. Metin ve renkler doğrudan düzenlenir, tweak
gerektirmez.

