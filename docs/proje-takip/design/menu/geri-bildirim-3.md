
# Geri bildirim 3 — v7 üzerine (2026-09-04 sabah)

Kaynak: Recep'in v6/v7 incelemesi + OPS ölçümü (v6 ve v7 dosyaları indirildi, ekran 07/07b/07c metni
çıkarıldı, mobil Ürünler menüsü ekran görüntüsü incelendi). Bu belge geri-bildirim-2'nin devamıdır;
oradaki maddeler geçerli kalır. Numaralar 35'ten başlar.

Onay durumu: 35 Recep KARARI (yapısal, tek başına soruldu ve onaylandı). 36–40 OPS hükmü, Recep gördü.
Design'ın v6 raporundaki iki eklemesi (Otopark çipi konmadı; mekân çiplerinde ikon yok) KABUL — 41.

---

## 35 — Ürün sayfası mimarisi DEĞİŞTİ: kabuk varsayılan, deneyim modülü KATLI PANEL  [RECEP KARARI]

Eski karar (§8, madde 18–23): "sayfa = kabuk + deneyim modülü", modül ilk ekranı doldurur.
Yeni karar: **07c'deki modülsüz kabuk her ürünün varsayılan sayfasıdır.** Deneyim modülü sayfada
katlanabilir bir paneldir; ziyaretçi isterse açar. Sebep: gelen mühendislerin çoğu model kodunu
bilerek gelir ve tabloyu ister; modül kararsız ziyaretçi içindir. İkisi de korunur, hiçbiri ötekini ezmez.

Çizilecek dört hâl (masaüstü 1440×900 + mobil 390):

- **35a Kapalı hâl (varsayılan).** 07c aynen kalır. Teknik tablonun hemen ÜSTÜNE tek satırlık çağrı
  eklenir: çerçeveli (kiremit DEĞİL), tam genişlik, sol tarafta küçük hesap simgesi, metin
  "Bu fan mahalinize yeter mi? Hesaplayın", sağda aşağı ok. Satır 44 px, sayfanın ritmini bozmaz.
  Hava perdesinde metin "Bu perde kapınıza yeter mi? Hesaplayın".
- **35b Açık hâl.** Satıra dokununca aynı yerde 07'deki modül açılır (mekân çipleri → oda girdileri →
  devir → hüküm kutusu). Sayfanın gerisi aşağı kayar, kaybolmaz. Satır başlığı "Hesap" olur, ok yukarı
  bakar, dokununca kapanır. Hüküm kutusundaki iki eylem aynen: "Bu model için teklif iste" (kiremit)
  ve "Teklif listesine ekle" (çerçeveli). Varyant kartları açık hâlde hesaba göre boyanır, kapalı hâlde
  katalog maksimumuna göre nötr durur.
- **35c Dışarıdan dolu geliş.** Seçici sayfasından (madde 32, Hesaplayıcılar altı) ya da teklif
  listesindeki "Hesapla"dan gelen ziyaretçide panel AÇIK ve DOLU gelir; en üstte ince bir bilgi satırı:
  "Seçicideki girdilerinizle hesaplandı · değiştirmek için düzenleyin". Adres `?sku=…&hesap=1` gibi bir
  işaret taşır (şema Faz 3'te kesinleşir, şimdi yalnız görsel).
- **35d Mobil.** Kapalı hâlde çağrı satırı fotoğrafın altında, tablonun üstünde; açık hâlde modül tam
  genişlik, hüküm kutusu ekranın altına yapışık iki düğme ile (kiremit + çerçeveli).

Kural: aksesuar ve sürücü gruplarında çağrı satırı HİÇ görünmez (§8 zaten öyle). Ekran 07 ve 07b'nin
başlıkları "açık hâl örneği" olarak güncellenir; 07c başlığı "varsayılan (kapalı hâl)". Referans dosyası
`referans-canli-urun-sayfasi-v11.html` modülün İÇ mantığı için geçerli kalır, sayfa düzeni için değil.

## 36 — Mobil Ürünler menüsü: alttaki "Teklif iste" ve "Teklif listesi (3)" düğmeleri KALKAR

Menü yön bulma yüzeyidir; "Teklif iste" orada nesnesizdir (hangi ürün?). Hemen altındaki alt sekme
çubuğunda Teklif sekmesi 3 rozetiyle zaten duruyor; aynı iş iki yerde olmaz. Menü yalnız kategori
listesi + madde 37'deki hızlı çıkışlar.

## 37 — Mobil Ürünler menüsünün alt bölgesi: iki sakin satır + koşullu "Son baktıklarınız"

Kategori listesinin altında ince ayırıcı, sonra:
- **"Tüm ürünler"** satırı (sağda gri sayı: 375) → /tr/products. Kategori ağacı ziyaretçinin
  zihnindeki bölmeyle tutmuyorsa kaçış yolu; her zaman görünür, boş hâli yok.
- **"Markalar"** satırı → /tr/brands. HVAC mühendisi çoğu zaman markadan girer (Vortice, SEAT,
  Nicotra Gebhardt, Danfoss, AVenS); markalar sayfası canlıda var. Satırın sağında beş marka logosunun
  tek renk küçük hâli (yalnız süs değil, ne bulacağını söyler).
- **"Son baktıklarınız"** — yalnız cihazda kayıt varsa görünür; tek satır, en fazla 3 çip
  (kategori ya da ürün adı). İlk ziyarette hiç çizilmez, boş kutu yok.

Sayı: 7 kategori + Tüm ürünler + Markalar = 9 satır, mobil ≤9 kuralı tam dolar; başka satır eklenmez.
Hesaplayıcı, teklif, iletişim bu menüye GİRMEZ (alt çubuk ve Hesaplayıcılar yolu var).

**Design'ın "Doğru fanı seçin" önerisine cevap (Recep + OPS, 09-04):** KONMAZ. Teşhis doğru (hangi dala
gireceğini bilmeyen kullanıcı var), ilaç yanlış: "hangi kategori" diye duraksayana fan seçici göstermek cevabı
peşin vermektir; belki hava perdesi ya da ısı geri kazanım arıyor. O tereddüdün yeri menünün ÜSTÜNDEKİ
"Senaryoya göre" sekmesidir (mekân → dal). Fan seçicinin giriş noktaları madde 32'deki üçtür, dördüncüsü olmaz.
Düzeltme (OPS, 09-04 ~09:40): Design'ın 375 ürün sayısı DOĞRU, canlı DB ölçüldü (products = 375); bir önceki
sürümde yazdığım 1.042 görsel satırı sayısıydı, benim hatam.

## 38 — Kategori satırı davranışı: dokun = kategori sayfası, artı = alt dallar

Üst kategori satırının kendisine dokununca doğrudan kategori sayfası açılır; alt dalları görmek için
sağdaki artı/eksi. İkisi aynı şeyi yapmaz. Açık dal tek olur (bir dal açılınca önceki kapanır).
Artı hedefi 44 px, satırın kendisi de 44 px.

## 39 — Metin: "Nerede kullanacaksınız?" ana sayfa şeridinde YAPILDI, ürün modülünde de aynı olsun

07'deki "Bu fanı nereye takacaksınız?" → "Bu fanı nerede kullanacaksınız?"; 07b'deki
"Bu perdeyi hangi girişe takacaksınız?" → "Bu perdeyi nerede kullanacaksınız?" (giriş sınıfı çipleri
zaten cevabı verir). Aynı iş tek ad.

## 40 — Sürüm damgası ve dosya adı

Yeni dosyalar: `Menü Tasarımı v8.dc.html`, `Venthub Ana Sayfa v6.dc.html`; v7/v5 ARSIV. Eyebrow
"on beş ekran · v8" (07c dahil), giriş paragrafı 35–40'ın ne getirdiğini tek cümlede söyler.

## 41 — Design eklemeleri KABUL (kayıt)

- Otopark çipi konmadı: doğru, ürünsüz dal gösterilmez.
- Mekân çiplerinde ikon yok: doğru, yarım ikonlu şerit bozuk durur; çipler yalnız metin.

---

## Yapılmayacaklar (değişmedi)
- Madde 34 çekmece: FAZ 3 ADAYI, çizilmez.
- Akıllı şeridin liste / ürün / teklif varyantları: Faz 3–4.
- Fiyat hiçbir yüzeyde görünmez; iki kip (Teklif/Satış) ARSIV.

## 47 — Ekran 08 arama sonucu: liste şablonu + arama şeridi (Recep sordu, OPS hükmü, 09-04 öğle) — UYGULA

Design'ın 08 analizi KABUL: arama sonucu ayrı sayfa değil, ekran 06 liste şablonu (süzgeç, sıralama, sayfalama, kart, üçlü eylem) + aramaya özel üst şerit (sorgu, sonuç sayısı, bağlam çipi). 08b boş sonuç artboard'ı eklenir.

OPS eklemeleri:
- **Tam kod eşleşmesi → doğrudan ürün sayfası, YALNIZ tek ürüne denk geliyorsa.** Seri adı ya da birden çok varyant eşleşiyorsa liste gösterilir; aksi hâlde kullanıcı istemediği varyanta iner.
- **08b boş sonuç üç çıkış:** "şunu mu demek istediniz" · "süzgeçleri gevşetin" · "Doğru fanı seçin" (aradığını bulamayan kişi seçicinin müşterisidir).
- **Ürün dışı sonuç ızgaraya karışmaz:** sorgu marka adıyla eşleşiyorsa üst şeritte tek çip ("Vortice marka sayfası →"). Bilgi Merkezi makaleleri bu fazda aramada YOK (Faz 4, kendi araması).
- Kart eylem seti üçlü (tıkla / Karşılaştır / Teklif listesine ekle), listeyle aynı.

