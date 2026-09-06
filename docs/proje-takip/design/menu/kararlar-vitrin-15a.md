
# Kararlar — Vitrin 15A (Linear karar belgesinin dışa aktarımı, 2026-09-04 13:15)

Bu dosya Linear'daki "Kararlar — Vitrin 15A" belgesinin kopyasıdır. Bir karar oraya yazılmadan verilmiş sayılmaz;
çelişirse Linear kazanır. "Design eklemesi" karar değildir; Recep evet demeden bu listeye girmez.
Gözden geçirme turunda bu maddeler TARTIŞILMAZ; yalnız "şu madde şu maddeyle çelişiyor" ya da "şu madde
ekranda uygulanmamış" denebilir.

## K1 · Ticari model (2026-08-31, Recep)
Site TEKLİF ODAKLIDIR. Fiyat, KDV, sepet, ödeme, stok YOK. Sepet ve satış kipi şirket kurulunca açılır. Bayi fiyatı
hiçbir ekranda geçmez. "Yakında", boş dal, vaat kutusu yok; vitrin yalnız var olanı gösterir.

## K2 · Kimlik (2026-09-02, Marka Kılavuzu projesi)
Logo 14A-3, wordmark "VentHub" (Archivo 700). Palet: lacivert #1A2B4A · turkuaz #0088B0 · kiremit #D95D0E · amber
yalnız uyarı. Yazı tipleri: Archivo (arayüz) · Source Serif 4 (uzun metin) · IBM Plex Mono (kod/teknik değer).
Koyu header + footer, aydınlık gövde. 16 ikon (7 kategori + 9 senaryo); dal ikonu çizilmez.

## K3 · Kategori ağacı ve adresler (2026-09-03, Recep)
Ağaç = 15A: 7 kategori · 26 dal · üçüncü seviye yok (faset). Sığınak üst kategori. Boş dal görünmez. Kategori
adresleri kısa slug'a geçer, `/category/` kalkar; eski adresler 301, hreflang + sitemap + GSC aynı yayında. Ürün
adresi `/tr/products/<seri>` kalır; sayfa MODEL bazlı; model adresleri Faz 3'te ayrı kararla.

## K4 · Menüde olmayanlar (2026-09-03, Recep)
Atıksu Arıtma ve Hava Arıtma menüde, senaryo listesinde ve sayfalarda yer almaz (senaryo listesi 8). Hava Arıtma ürün
gelince ayrı kararla açılır.

## K5 · Kiremit ve düğme kuralı (2026-09-03 → 09-04, Recep)
Her sayfada TEK dolu kiremit, o da sayfanın işini bitiren eylem; diğer her düğme çerçeveli. Tek fiil "Teklif iste"
("Teklif al" yok). Header sağında tek öğe "Teklif (n)" → panel (liste + gönder + Teklif iste / Tekliflerim /
Projelerim / Yeni proje / Favorilerim). Gövde düğmeleri özel etiketli: "Projeniz için teklif iste" (hero), "Bu model
için teklif iste" (ürün), "Teklif talebini gönder" (liste), "Teknik destek iste" (senaryo). Kart eylemleri çerçeveli:
Karşılaştır + Teklif listesine ekle. Eylem asla ince metin bağlantısı olmaz.

## K6 · Ürün sayfası mimarisi (2026-08-25, REC-65; 09-04'te güncellendi — aşağıda)
Ürün sayfası = TEK ŞABLON (kabuk) + ürün grubuna göre DENEYİM MODÜLÜ. Kanal fanı modülü: niyet çipleri → oda
girdileri → devir kaydırıcısı; ihtiyaç çizgisi, YETER/SINIRDA/YETMEZ hükmü, ihtiyaca göre boyanan varyantlar, konuşan
teknik tablo, standart rozeti, göreli ses kıyası. Referans: `referans-canli-urun-sayfasi-v11.html` (modülün İÇ
mantığı; hiçbir özellik sessizce düşmez). Hava perdesi modülü ayrı. Teklif kaydı seçimin kaynağını (sistem önerisi /
kullanıcı) ve girdileri taşır.

## K7 · Teknik alan (2026-09-03, Recep)
Hedef tam veri; ilk aşamada eksik olabilir. Görüntüleme: varsa satır, yoksa satır hiç yok ("—", "belirtilmemiş"
yok). Süzgeçler yalnız dolu alanlardan. Belge düğmeleri (PDF, DXF) yalnız dosya bağlıysa görünür.

## K8 · Sayfa üretim düzeni (2026-09-01, REC-106 + 09-03)
Az sayıda ŞABLON + veri; sayfa başına özel görünüm yok. Kategori sayfası tek şablon üç mod. Ana sayfa blokları
içeriğini DB'den alır. 3D vitrinde tamamen kapalı. Üretim 4 faz, her faz önizleme onayı; canlı görünüm Recep "aç"
diyene kadar değişmez (kod parça parça, bayrak arkasında girer — 09-04 Recep onayı).

## K9 · Apple çizgisi (2026-08-30; 09-04 somutlaştı)
Nefes alanı, disiplinli tipografi, az/kusursuz öğe, ürün kahraman. Masaüstü menü paneli: 7 büyük kategori kiremiti,
kürasyon sütunu yok, ≤12 öğe. Mobil: alt sekme çubuğu 5 sekme (Ana sayfa · Ürünler · Teklif · Destek · Hesap), Destek
yaprağı (WhatsApp · Ara · Teknik destek · Kargo takibi · İletişim), üstte yalnız logo + arama, yatay kategori çipleri,
ürün sayfasında yapışık eylem çubuğu; ekranda ≤9 etkileşimli öğe, dokunma hedefi ≥44 px.

## K10 · Liste ve karşılaştırma (2026-09-04)
Filtreli liste model kartları gösterir (seri fasette). Sayfalama `?page=`, boş sonuç ekranı, sıralama
debi/basınç/güç/ad. Karşılaştırma ekranı (≤4 model, farklı değer vurgulu) = Ekran 11.

## K11 · Çalışma protokolü (2026-09-03)
Design mevcut dosyanın üzerine yazmaz; eski sürüm "vN ARSIV" olarak kalır. Sitenin tamamı 15A projesinde çizilir;
marka projesi yalnız kimlik kaynağı. Her ekran brief'inden önce bu belge taranır.

## K12 · Ürün sayfası: kabuk varsayılan, deneyim modülü KATLI PANEL (Recep, 2026-09-04)
Modülsüz kabuk (ekran 07c) her ürünün varsayılan sayfasıdır. Deneyim modülü sayfada katlanabilir bir paneldir:
kapalı hâlde teknik tablonun üstünde tek çağrı satırı ("Bu fan mahalinize yeter mi? Hesaplayın"), dokununca aynı
yerde açılır; seçici sayfasından ya da teklif listesindeki "Hesapla"dan gelen ziyaretçide açık ve dolu gelir.
Aksesuar/sürücü gruplarında çağrı satırı hiç görünmez. Sebep: mühendislerin çoğu model kodunu bilerek gelir ve tabloyu
ister; modül kararsız ziyaretçi içindir. Aynı turda: mobil Ürünler menüsünden "Teklif iste" ve "Teklif listesi"
düğmeleri kalkar; menü alt bölgesi = "Tüm ürünler" + "Markalar" + koşullu "Son baktıklarınız" (≤3 çip); kategori
satırına dokun = kategori sayfası, artı = alt dallar; modül metni "nerede kullanacaksınız"; Otopark çipi yok, mekân
çiplerinde ikon yok.

## K13 · Liste sayfaları MATRİS görünümü, iki katlı (Recep, 2026-09-04) — Faz 3
Tüm ürünler sayfası ve her dal/seri sayfası Kart / Tablo / Seri üç görünüm alır, varsayılan Tablo. İki kat: katalog
geneli ORTAK sütunlar; her ürün grubu KENDİ sütunlarıyla kendi içinde matrislenir. Tüm ürünler sayfasının üstünde
marka × kategori haritası (hücrede sayı, dokununca süzer). Sütun kuralı: gruptaki ürünlerin ≥%60'ında doluysa
matrise girer; %30–60 gizlenebilir ikincil; <%30 yalnız ürün sayfasında. Aralık süzgeçleri ve tablo indirme Faz 4.

## K14 · Arama sonucu (ekran 08) = liste şablonu + arama şeridi (2026-09-04)
Arama sonucu ayrı sayfa değil: ekran 06 liste şablonu + aramaya özel üst şerit. 08b boş sonuç: "şunu mu demek
istediniz", "süzgeçleri gevşetin", "Doğru fanı seçin". Tam model kodu YALNIZ tek ürüne denk geliyorsa doğrudan ürün
sayfası. Marka eşleşmesi üst şeritte tek çip; Bilgi Merkezi makaleleri bu fazda aramada yok.

## K15 · TASARIM ONAYI: Menü Tasarımı v13 + Ana Sayfa v7 (Recep, 2026-09-04)
Bu sürüm Faz 1 (kabuk) ve Faz 2 (ana sayfa/menü/adresler) uygulamasının referansıdır. Matris Faz 3'te çizilir.
Açık konuşmalar: cihaz/ürün seçiminin yeri, proje katmanı (klasör mü kapı mı).

## K16 · Faz 1 kabuk önizlemesi (Recep, 2026-09-04 12:30)
Parça parça koda alıp bayrak arkasında ilerleme ONAYLI; görünüm Design fazında gelir. Mobil alt sekme çubuğu kabul.
Teklif: mobilde header'da yok, alt sekme paneli açar; masaüstünde header "Teklif (n)" + panel. Dil seçici KALIR,
yüzen/hareketli OLMAZ: masaüstü header sağ (arama · TR/EN · Teklif(n) · hesap); mobilde Hesap yaprağının en üstünde.
Hesap sekmesi girişsizken ölü kapı değil: yaprak (dil · Giriş yapın · kilitli Tekliflerim/Projelerim).
**Design eksiği (Recep fark etti):** giriş / hesap / Tekliflerim / Projelerim ekranları 15A'da çizilmedi.

