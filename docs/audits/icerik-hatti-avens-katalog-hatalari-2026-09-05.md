# AVenS Ürün Fiyat Kataloğu 2026 — tespit edilen içerik hataları

**Kim ölçtü:** VentHub içerik hattı (REC-146), 2026-09-05 · **Yöntem:** betikle metin taraması (PyMuPDF), elle değil
**Kaynak dosya:** `avens_fiyat_listesi_2026_HQ.pdf`, 74 sayfa
**Niçin bu rapor var:** VentHub ürün sayfalarının Türkçe anlatımı bu katalogdan türetiliyor. Aşağıdaki
kalemler **birebir kopyalansaydı** vitrinde yanlış bilgi görünecekti. Bizim tarafta düzeltildi;
kaynağın kendisi düzeltilmediği sürece her yeni çıkarımda tekrar edecek.

**Bu belge AVenS'e iletilmek üzere hazırlanmıştır (Recep kararı, 2026-09-05).**

---

## H1 · Dört farklı seri, tek tanıtım cümlesi (yüksek etki)

Sayfa başlıklarında, dört ayrı serinin tanıtım cümlesi **birebir aynı**:

| Sayfa | Seri | Tanıtım cümlesi |
|---|---|---|
| 41 | SEAT SERİSİ | KİMYASALLARA VE AŞINDIRICI GAZLARA (KARŞI) DAYANIKLI SANTRİFÜJ FANLAR |
| 43 | *(başlıkta seri adı yok)* JET | **aynı cümle** |
| 44 | SEAT ATEX SERİSİ | **aynı cümle** |
| 45 | STORM ATEX / JET ATEX | **aynı cümle** |
| 42 | STORM SERİSİ | *farklı* — "DAHA YÜKSEK STATİK BASINCA SAHİP, KİMYASALLARA VE KOROZYONA DAYANIKLI FANLAR" |

**Sorun:** JET, SEAT'ten farklı bir üründür — JET **çatı fanı**, yatay ve dikey montaja uygun (s.43'ün kendi
maddesinde yazıyor). Ama başlık bunu söylemiyor. Ürünleri yan yana listeleyen bir yerde (site, teklif, katalog
dizini) dört seri aynı cümleyle görünür ve **ayırt edilemez**.

**Ek olarak s.43'te seri adı başlıkta yok:** sayfa doğrudan tanıtım cümlesiyle başlıyor; "JET SERİSİ" ibaresi
başlık bloğunda görünmüyor. (Sayfanın gövdesinde geçiyor.)

**Önerimiz:** her serinin tanıtım cümlesi o seriyi ayıran özelliği söylesin. Örnek: JET için
"Çatı ve duvar uygulamaları için, yatay ve dikey montaja uygun santrifüj çatı fanları."

---

## H2 · Sayfa 45: başlık STORM/JET ATEX, gövde metni "SEAT ATEX" diyor (yüksek etki)

Sayfa 45'in başlığı **"STORM ATEX SERİSİ / JET ATEX SERİSİ"**. Aynı sayfanın gövde metni:

> "Patlayıcı ortamlar için tasarlanan **SEAT ATEX Serisi**; ATEX Bölge 2, Kategori 3, Gaz Grup C sınıfında,
> T4 sıcaklık sınıfına sahip, IE3 verimlilik dereceli patlamaya dayanıklı asenkron motoru ile maksimum
> güvenlik, yüksek enerji verimliliği ve uzun ömürlü kullanım sunar."

Betik taraması bu çelişkiyi kataloğun **tek** yerinde buldu (başlıkta geçen seri adıyla gövdede geçen seri adı
karşılaştırıldı; 74 sayfada 1 çelişki).

**Önerimiz:** cümledeki "SEAT ATEX" → "STORM ATEX ve JET ATEX".

---

## H3 · Sayfa 45: performans aralığı STORM'un, JET'in değil (yüksek etki)

Sayfa 45'te verilen aralık:

> "Geniş performans aralığı sayesinde **40–4500 Pa** statik basınç ve **50–5.000 m³/h** debi değerlerinde
> verimli çalışma sağlar"

Bu değerler **sayfa 42'deki STORM aralığının birebir aynısı**. Sayfa 43'te JET için verilen aralık ise farklı:
**200–3.500 m³/h debi ve 2.000 Pa'ya kadar statik basınç**.

Sayfa 45 hem STORM ATEX'i hem JET ATEX'i kapsadığı için, tek aralık verilmesi JET ATEX alıcısına
**yanlış performans** bildirir.

**Önerimiz:** iki seri için iki ayrı aralık satırı; ya da JET ATEX ayrı sayfaya alınsın.

---

## H4 · Sayfa 42: STORM 10 XRM modeli listede, ürün tanımı yok (düşük etki)

`STORM 10 XRM (*)` kodu 61102010 ile fiyat tablosunda yer alıyor; yıldız işaretinin (*) ne anlama geldiği
sayfada **açıklanmamış**. XRM'in diğer STORM 10 modellerinden farkı anlaşılamıyor.

**Önerimiz:** yıldız dipnotu eklensin ya da XRM açılımı yazılsın.

---

## Ölçüm sınırları (bizim tarafımızın şeffaflığı için)

* Tarama **metin düzeyinde**dir; görsel, tablo hizalaması ve fiyat doğruluğu **kontrol edilmedi**.
* "Birden fazla sayfada aynen geçen tanıtım cümlesi" taramasında 10 tekrar bulundu; bunların **8'i
  meşru** (aynı aksesuar notunun kardeş sayfalarda tekrarı, ör. hız anahtarı notu). Hata olarak yalnız
  H1'deki dört-seri-tek-cümle kalemi raporlanmıştır.
* Kataloğun tamamı değil, **anlatım metinleri** tarandı (74 sayfanın 61'inde düz cümle var).

---

*Ölçüm ve rapor: VentHub · 2026-09-05 · sorular için VentHub içerik hattı.*
