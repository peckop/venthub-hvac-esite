
# Ürün Seçimi Alternatifleri v3 — notlar (DESIGN-MENU, 2026-09-05)

Brief: geri-bildirim-8 madde 72–76 + geri-bildirim-9 madde 79. v2 ARSIV. Kabuk, kareler ve alternatif kurgusu
DEĞİŞMEDİ — yalnız veri, örnek ve dördüncü hüküm değişti.

## 72 · Örnek mahal değişti
"Kimya laboratuvarı" çıktı, **açık ofis** girdi (motorun bildiği altı mahalden biri: banyo · mutfak · yatak odası ·
salon · ofis · dükkân). Hesap: 90 m² × 3,2 m = 288 m³ × 6 değişim/saat = **1.728 m³/h**. Mekân çipleri de motorun
listesine döndü (Mutfak · Yatak odası · Salon · Banyo · Dükkân). 12 + 3 geçiş düzeltildi.

## 73 · Bütün sayılar `technical_specs`'ten
Ürün SEAT 30 PP → **Vortice Lineo 250 Quiet ES** (`VRT-17175`), çünkü Lineo Quiet ailesinin tamamında P-Q eğrisi var
(katalogda eğri 145 üründe). Adres de gerçek: aile slug'ı **`/tr/products/vortice-lineo-quiet`**, sku `?sku=vrt-17175`
(ikisi de veriden doğrulandı; ürün slug'ı `vortice-lineo-250-quiet-es-17175` ama PDP aile kanonik olduğu için adres
aile slug'ı + sku ile yazılır). Kartlarda ve tabloda yazan her sayı ölçüldü:

| Model | SKU | Debi | Basınç | Ses | Güç | Motor | Hüküm (1.728 m³/h) |
|---|---|---|---|---|---|---|---|
| Lineo 200 Quiet ES | VRT-17174 | 1.145 m³/h | 329,5 Pa | 38,6 dB(A) | 88 W | EC | YETMEZ |
| **Lineo 250 Quiet ES** (sayfanın ürünü) | VRT-17175 | 1.485 m³/h | 367,8 Pa | 39,5 dB(A) | 125 W | EC | YETMEZ |
| **Lineo 315 Quiet ES** | VRT-17176 | 2.630 m³/h | 379,8 Pa | 44,8 dB(A) | 220 W | EC | YETER · ÖNERİLEN |
| Lineo 315 Quiet | VRT-17166 | 2.890 m³/h | 525,7 Pa | 45,4 dB(A) | 360 W | AC | YETER (fazla) |

Uydurma değerler atıldı: 2.304 m³/h → 1.728 · 3.000/4.200/6.000 m³/h → gerçek debiler · 850 Pa → 367,8 Pa ·
66 dB(A) → 39,5 · 1,1 kW trifaze → 125 W monofaze · 315/315 mm → 250/250 · 1.450 dev/dak → kademesiz (EC) ·
"%58 devirde" → tam devirde. Eğri başlığı "trifaze" → "monofaze".

**K7 uygulandı:** "Gövde malzemesi" satırı **Motor tipi**'ne döndü (EC, veride var). "Ağırlık" ilk turda silinmişti;
ölçümde 13,4 kg çıkınca geri kondu. "veri yok" diye hiçbir satır yazılmadı.

## 74 · Dördüncü hüküm: "değerlendirilemedi"
Her akışta (A-2 · B-2 · C-3), sorumluluk satırının hemen üstünde kiremit kesikli çerçeveli blok: gri
**DEĞERLENDİRİLEMEDİ** rozeti + gerçek örnek (`SEA-51352000` — 5.880 m³/h, 704 Pa, 69 dB(A) var, **P-Q eğrisi yok**) +
kural: çalışma noktası bulunamadığı için "uyar / sınırda / uymaz" denmez, hüküm yerine "Bu model için mühendisimize
sorun" satırı gelir; model gizlenmez. Alt satır: eksik olan üründe değil veride (295 fanın 145'inde eğri var).

## 75 · Çerez şeridi
Çizilmedi. İçerik haritasındaki soru kapandı, gerekçe oraya yazıldı.

## 76 · Footer
Marka logoları **kalktı** (10 img → 0). "Markalar" metin bağlantısı Ürünler sütununda duruyor; logo bloğu yalnız
ana sayfada. Düzen "Ürünler · Şirket · Yasal" olarak kaldı, "Nasıl teklif alınır" Şirket sütununda ilk sıra.

## Teslim sonrası iki düzeltme (denetim, 09-05)

**(a) Adres.** İlk yazımda ürün adresi iki başlık satırında eski hâliyle kalmıştı
(`/tr/products/seat?sku=seat-30-pp`) — içerik Lineo'ya geçmiş, adres SEAT'i gösteriyordu. Doğru adres veriden alındı:
`/tr/products/vortice-lineo-quiet?sku=vrt-17175`. Sebep: doğrulama betiğim yalnız büyük harf "SEAT" arıyordu.
**Bundan sonra harf duyarsız aranır.**

**(b) Anlatım metni ve sertifika çipleri.** Sayılar değişmişti ama ürün ANLATIMI eski üründe kalmıştı: "salyangoz gövde,
tek parça polipropilen, kayış-kasnak aktarma, asit buharı gövdeyi yemez" — SEAT PP santrifüj fanın tarifi; sayfanın
ürünü kanal içi EC fan. Aynı ekranda tablo "EC" derken açıklama "kayış-kasnak" diyordu. Ölçüldü ve gerçek metinle
değiştirildi (`products.description_i18n` + `product_families.description`):

- Ürün: "Ultra sessiz çalışan, akustik susturucu gövdeli, 250 mm çaplı kanal tipi karma akışlı havalandırma fanı."
- Seri: "100–315 mm çap, 260–2.890 m³/h; konut ve ticari havalandırma."
- Hesap gerekçesi malzeme iddiasını bıraktı: ofiste ikinci ölçüt **ses** (40 dB(A) eşiği).
- C-3 "neden bu": "akustik susturucu gövde ofis sesini 40 dB eşiğinin altında tutar."

**Doğrulanmamış çipler kalktı.** "UL-94 alev geciktirici" ve "ATEX ops." veride yok (`atex_marking` katalogda yalnız
14 üründe, VRT-17175'te değil; UL-94 hiç yok). Yerine ölçülen alanlar: **ErP uyumlu** (`erp_compliant: true`), **IP44**
(`ip_rating`), **Class II** (`insulation_class`). Teknik tablodaki "Sertifika" satırı **Koruma sınıfı: IP44 · Class II**
oldu. Versiyon seçicisi "Standart / ATEX" → **"ES (EC motor) / Standart (AC)"** (ailenin gerçek varyant ekseni).
Seçicinin mahal çiplerinden "Patlayıcı ortam (ATEX)" kalktı — motor altı mahal biliyor, ATEX onlardan biri değil
(ortam koşulları katlı satırında ATEX kalır, orası koşul sorusu).

**Ağırlık satırı geri geldi:** ölçümde `weight_kg` **13,4** çıktı (ilk yazımda yok sanıp satırı silmiştim).

Harf duyarsız son sayım: polipropilen 0 · salyangoz 0 · kayış-kasnak 0 · asit buharı 0 · çeker ocak 0 · UL-94 0 ·
seat 0. Yalnız ölçülen değer yazılı.

**(c) Seçici eksenleri.** Üç eksen (Dönüş yönü · Faz · Versiyon) SEAT sayfasından olduğu gibi taşınmıştı.
Ölçüm (`vortice-lineo-quiet` ailesinin 12 modeli): dönüş yönü / el yönü anahtarı **hiç yok** (in-line fanda kavram yok),
`phase` **12/12 = 1** ve `voltage_v` **12/12 = 230** (tek değerli alan eksen olmaz). Gerçek iki eksen:
**Çap** (100 · 125 · 150 · 200 · 250 · 315 mm) ve **Motor** (ES = EC / Standart = AC). İki eksen de bu hâliyle çizildi,
altyazı neden faz seçicisinin çizilmediğini söylüyor. Anahtar-değer tablosunda "Faz: Monofaze 230 V" satırı kalıyor —
o bir eksen değil, ölçülmüş bir değer.

**Kök neden (üç düzeltmenin ortak sebebi):** ürünü değiştirirken sayıları veriden yazdım, ama kimlik satırını,
çipleri, anlatım metnini ve seçici eksenlerini eski üründen taşıdım. **Kural:** ürün değişirse aynı turda
kimlik + çip + açıklama + gerekçe + seçici eksenleri de `technical_specs` ve `description_i18n`'den yeniden yazılır;
anahtarı olmayan hiçbir eksen ve tek değerli hiçbir alan seçici olarak çizilmez (K7).

## Değişmeyen
Üç alternatifin kurgusu, v15 kabuğu, 52b şerit + 4 sekme, ortam koşulları katlı satırı (69b), grup sekmesi mantığı,
sorumluluk dili. Menü v15 ve Ana Sayfa v9 dosyalarına dokunulmadı. Design görüşü de değişmedi: **A + C** birlikte,
B kodlanmaz (Recep K18 istişaresi aynı yöne işaret ediyor: tek sayfa seçici, C kural tablosu sonrası).

— DESIGN-MENU (Fable) 2026-09-05

