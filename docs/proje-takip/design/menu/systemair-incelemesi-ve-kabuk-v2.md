
# Systemair incelemesi + kabuk v2 düzeltmesi — DESIGN, 2026-09-05

Kaynak: systemair.com/tr-tr — kategori sayfası (Kanal Fanları), seri sayfaları (K Dairesel, KE/KT Dikdörtgen, KA Klima
Santrali, KTEX ATEX), shop.systemair.com ürün sayfası (K 315 M EC), aksesuar ve BIM sayfaları. Ürün sayfasının sekmeli
gövdesi istemci tarafında çiziliyor; sekme adları ve içerik bloklarını görebildim, birebir yerleşim ölçemedim.

## 1. Systemair'ın mimarisi — iki katman, iki site

**Seri sayfası (systemair.com):** bir ÜRÜN AİLESİ anlatılır, tek ürün değil. Kalıp her seride aynı:
1. Büyük görsel + seri adı + tek cümle vaat ("Dairesel kanallar için yüksek kaliteli radyal fan")
2. Dört kalın madde: motor tipi · iç/dış mekân · montaj aparatı dahil · pervane teknolojisi
3. Dört başlıklı paragraf: Esneklik · Güvenilirlik · Performans · Aksesuarlar (vaat dili, kalın vurgular)
4. **Yapısal anlatım blokları — sabit sıra:** Kasa · Fan (çark) · Motor · Motor koruması · Kontrol · Montaj.
   Her blok 2–4 cümle, standart atıfları içinde (EN 1751 sınıf C, IP55, korozyon C3, DIN ISO 1940 G6.3).
5. Sayfa sonunda: belgeler, BIM modeli, CAD, "seçim yazılımı" bağlantısı (AirCalc++ / Fan Selector).
6. `?sku=` parametresi: seri sayfası model seçicisiyle tek modele iner; adres seri, model parametre.
   → Bizim REC-65 kararıyla aynı: `/tr/products/<seri>?sku=<model>`. Systemair da böyle çözmüş.

**Webshop ürün sayfası (shop.systemair.com):** tek model, sipariş odaklı. Kısa tanım satırı
("galvaniz çelikten imal, EC DN315, 230V50Hz, 1~"), madde listesi, sonra AYNI yapısal bloklar (Kasa · Çark · Motor …),
teknik tablo, belgeler, aksesuarlar, fiyat ve sepet. Yani anlatım metni seri ile ürün arasında paylaşılıyor.

**Kategori sayfası:** ürün gridi değil, REHBER METNİ. "Kanal Fanları" sayfası: tanım → türler (dairesel / kare /
dikdörtgen, her biri seri adlarıyla bağlantılı) → "Projeniz için doğru kanal fanını bulun" (banyo 6–8 hava
değişimi/sa, yatak odası 1) → gürültü ve yerleşim tavsiyesi → seçici bağlantısı → temizlik/bakım. Uzun, SEO'lu,
mühendise yazılmış.

**Seçici:** ayrı yazılım (Fan Selector, AirCalc++). Kategori ve seri sayfası ona bağlantı verir; sayfanın içinde
hesap yapılmaz.

## 2. Bizde ne var, ne yok — karşılaştırma

| Katman | Systemair | VentHub v15 | Fark |
|---|---|---|---|
| Kategori | rehber metni + tür bağlantıları | vitrin / anlatım / seri listesi (üç mod, ekran 04) | Anlatım modu var ama içerik yok; Systemair'daki "kaç hava değişimi" rehberi bizde ekran 14 (uzun metin) ya da Bilgi Merkezi'nde durabilir |
| Seri | özel anlatım sayfası (6 yapısal blok) | YOK — seri yalnız faset + breadcrumb + kardeş model şeridi (GB1 m.10) | **BOŞLUK.** 40 serimiz var, hiçbirinin anlatım yüzeyi yok. Seri kimliği (SEAT nedir, PP niye) hiçbir yerde anlatılmıyor |
| Ürün — kimlik | seri adı + tek cümle + 4 kalın madde | ad + kod + sertifika çipi + kullanım alanı çipleri | Bizde "4 kalın madde" yok; kod var, vaat yok |
| Ürün — teknik tablo | uzun düz tablo (webshop) | Klasik / Konuşan tablo (m.20) — bizde daha iyi | Konuşan tablo Systemair'da yok; koruyalım |
| Ürün — yapısal anlatım | Kasa · Çark · Motor · Koruma · Kontrol · Montaj (sabit sıra) | "Açıklama" iki serbest paragraf (Source Serif) | **BOŞLUK.** Serbest paragraf mühendise yetmez; sabit başlıklar taranabilir |
| Ürün — belgeler | katalog PDF · teknik veri PDF · kılavuz · CAD · BIM · uygunluk beyanı | üç çerçeveli düğme (katalog, eğri, DXF), "dosya yoksa satır çıkmaz" | Bizde belge tipleri sayılmadı; kılavuz, uygunluk beyanı, ErP fişi yok |
| Ürün — aksesuar | "önerilen liste" + ayrı aksesuar sayfaları (elektrik / mekanik) | üç kart "İlgili aksesuarlar" | Bizde aksesuar-ürün eşlemesi var, aksesuar SINIFI yok |
| Ürün — kontrol | Kontrol bloğu: 0-10 V, 5 kademe, frekans konvertörü | seçici (faz, dönüş, versiyon) | Sürücü eşleşmesi (hangi Danfoss bu fanı sürer) bizde yalnız aksesuar kartı |
| Seçici | ayrı yazılım | ekran 13 tek sayfa + 07 panel (K17) — bizde daha iyi | Systemair'ın seçicisi mühendis için; bizim "sorularla seçelim" (C) rakipte yok |
| Kataloglar | "İndirmeler" sayfası: katalog, broşür, sertifika, BIM | YOK | **BOŞLUK.** 5 markanın katalogları için tek sayfa yok; boşluk listesi v2'ye girer |

## 3. Systemair'dan alınacaklar — kesin

1. **Ürün anlatımı yapısal bloklara döner.** "Açıklama" → sabit altı başlık: **Gövde · Çark · Motor · Koruma ·
   Kontrol · Montaj**; boş olan başlık çizilmez (K7 kuralı). Her başlık 1–3 cümle, standart atfı cümlenin içinde.
   Source Serif kalır (K2). Ürün sayfasının yapışkan bölüm çubuğuna "Yapı" sekmesi girer.
2. **Kimlik bloğuna dört kalın madde.** h1 altına 4 kısa vaat ("PP gövde · asit buharına dayanıklı", "Trifaze 400 V",
   "ATEX Zone 2 opsiyonu", "Dış mekân IP55"). Veriden türer (`technical_specs` + sertifika), elle yazılmaz.
3. **Belge tipleri sayılır, sıra sabit:** Teknik veri sayfası · Katalog · Montaj-kullanım kılavuzu · P-Q eğrisi ·
   CAD (DXF/DWG) · Uygunluk beyanı / ErP fişi · BIM (Faz 4). Olmayan çizilmez.
4. **Seri sayfası açılır** (`/tr/products/<seri>` sku'suz hâl): seri kimliği + 4 madde + yapısal bloklar (seri
   düzeyinde) + model tablosu (kod · debi · basınç · güç · faz, tıklanınca `?sku=`) + belgeler + aksesuarlar.
   Bugün sku'suz adres doğrudan ilk modele düşüyor; seri anlatımı yok. K13 (seri görünümü) ile aynı veri.
5. **Kataloglar / İndirmeler sayfası** (`/tr/kataloglar`): marka × belge tipi ızgarası; süzgeç: marka, kategori,
   belge tipi. Footer Ürünler sütununa "Kataloglar". Hesap/giriş şartı yok.
6. **Kategori anlatım modunda rehber paragrafı** (Systemair "doğru kanal fanını bulun" kalıbı): kaç hava değişimi,
   gürültü-yerleşim, seçiciye bağlantı. Kaynağı Bilgi Merkezi (K14) — kategori sayfası özet + "devamı".

**Alınmayacak:** kategori sayfasının SEO metniyle şişmesi (bizde anlatım modu ≤2 paragraf + devamı bağlantısı);
seçicinin ayrı yazılıma çıkması (K17 tek sayfa); iki ayrı site (kurumsal + webshop) — bizde tek site iki kip.

## 4. Kabuk v2 — OPS itirazları üzerine düzeltme

- **Dil seçimi: OPS haklı, geri çekildi.** Dil ayar değil giriş koşulu; en çok ilk ziyarette, girişsiz lazım. 96 EN
  adresli sitede her sayfada erişilebilir olmalı. **Mobil header sağı: TR/EN çipi + bildirim rozeti**, ikisi 44 px,
  logonun sağı v13'te zaten boş. Recep'in 09-04 yönü (a) ile aynı.
- **Hesap sekmesi: uzlaşı.** Alt çubuk: Ana sayfa · Ürünler · Teklif/Sepet · Hesap.
- **İletişim sekmesi: Recep kararı.** Design "kalksın" diyor (alt çubuk yalnız sayfa açar; İletişim bugün alt panel
  açıyor; Hesap→Destek grubu + header + ürün sayfası "soru sor" ile kaybolmaz). Karşı argüman (satış öncesi güven
  sinyali, girişsiz ziyaretçi) ciddi. İletişim kalırsa Hesap header'dan girilen sayfa olur; mimari aynı, giriş
  noktası değişir. İki hâl de çizilir, tek kare farkı.

## 5. Önerilen sıra (güncel)

1. GB8 + GB9: `bosluk-listesi-v2.md` (47 yol + bu belgedeki 3 yeni boşluk: seri sayfası, kataloglar, yapısal anlatım)
   · Alternatifler v3 (72–76) · içerik haritası (80).
2. Kabuk v2 ayrı dosya, v15 kareleri, iki kip; İletişim/Hesap iki hâl; header TR/EN + bildirim.
3. Ürün sayfası v2: yapısal bloklar + 4 madde + belge tipleri (bu belge §3.1–3.3) — 07c kabuğu üzerine.
4. Seri sayfası + Kataloglar sayfası (§3.4–3.5) — yeni ekranlar.
5. Recep onayıyla Menü v16 + Ana Sayfa v10; K1/K9/K16 yeniden yazılır.

— DESIGN (Fable) 2026-09-05

