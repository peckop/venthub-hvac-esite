# Geri bildirim 6 — v14 sonrası kısa tur (OPS, 2026-09-04 akşam)

Kaynak: `v14-notlar.md` (DESIGN) + OPS ölçümü (v14 dosyası: 27 kare, 23 EKRAN etiketi; "Ürün Seçici" 0 geçiş,
"Doğru fanı seçin" 9, "Hesaplayıcılar" 27). Numaralar 62'den başlar. Çıktı: `Menü Tasarımı v15.dc.html` (v14 ARSIV),
`Venthub Ana Sayfa v9.dc.html` (v8 ARSIV), `v15-notlar.md`. Erişim/yazma kuralları ve imza aynen.

## 62 — Madde 61 uygulanmadı: "Ürün Seçici" girişi  [UYGULA]
Brief güncellenmeden önce başlandığı için v14'te yok. Uygula: masaüstü header "Hesaplayıcılar" → "Ürün Seçici"
(tüm karelerde); mobil Ürünler menüsü alt bölgesine "Ürün Seçici" satırı (Tüm ürünler · Markalar · Ürün Seçici);
ana sayfa v9'da "Doğru fanı seçin" düğmesi → "Ürün Seçici"; ekran 09'daki düğme "Bu senaryo için ürün seçin".
Açıklama metinlerinde geçen "Hesaplayıcılar" ve "Doğru fanı seçin" ifadeleri de güncellenir.

## 63 — Mobil üst şerit seçimi (madde 52)  [Recep KARARI 16:50: (b) + akıllı dil çipi]
Seçilen: **52b** (sağ üstte yalnız hesap simgesi; dil, hesap yaprağının ilk satırı). 52a "ARSIV" altyazısıyla kalır.
EK HÂL (çiz, tek kare): tarayıcı dili sayfa diline uymadığında hesap simgesinin SOLUNDA küçük çerçeveli "EN" çipi
kendiliğinden belirir (Türkçe sayfada İngilizce tarayıcı → "EN"; İngilizce sayfada Türkçe tarayıcı → "TR"); dokununca
aynı sayfanın diğer dili açılır, çip kaybolur. Uyuşan ziyaretçi çipi hiç görmez. 44×44 hedef. Kod Faz 3 (URUN).
Bu hâl 52b'nin yanına "52b · dil uyuşmazlığı" adıyla; K9 ve K16 buna göre güncellenecek.

## 64 — Design'ın iki sorusuna OPS cevabı  [UYGULA]
- Seçici sayfası mobilde "Hesapla" KİREMİT kalır (K5: sayfanın işini bitiren tek dolu düğme). Masaüstünde de kiremit;
  "değer değiştikçe kendiliğinden" hesaplama Faz 3 kod kararı, çizime girmez.
- Kategori modu: dal sayısı ≥ 2 → VİTRİN; 1 → ANLATIM; 0 → SERİ LİSTESİ. Hava Şartlandırma (2 dal) vitrin; altyazı
  buna göre. K8'e böyle yazılacak.

## 65 — Bayat açıklama metinleri  [DÜZELT]
Altyazı/açıklama metinlerinde hâlâ "kart eylem seti: Ürünü incele + Teklif listesine ekle" ve madde-22 üçlü set
anlatımı var (3 geçiş); düğme kaldırıldı, metin kalmış. Metinler v15'te "kart = tıklanır + Karşılaştır + Teklif
listesine ekle" olarak düzeltilir. "Siparişlerim kalktı" notu kalabilir (tarihçe).

## 66 — Panel görünürlüğü ölçümü (madde 56)  [KAYIT]
Design statik ölçüm 355–399 px verdi; OPS canlı DOM ölçümünü Faz 3 kodunda yapar (kapıya bağlanır). Şimdilik kabul.

## Yapılmayacaklar
Yeni kare yok; 62–65 mevcut karelerde metin ve öğe değişikliği.

## 67 — Soğuk giriş: Google'dan doğrudan ürün/kategori sayfasına düşen ziyaretçi  [YAZ, çizme]
Karar AÇIK (Recep, 17:10): ürün sayfasındaki katlı hesap paneli KALSIN mı, yerine Ürün Seçici'ye bağlantı + dönüşte sonuç şeridi mi? Recep canlı veri görmeden karar vermek istemiyor; DESIGN görüşünü versin.
İstenen: `sogukgiris-oneriler.md` (yazılı, çizim yok). İki bölüm:
- (a) Panel sorusu: kalsın / bağlantı+şerit / üçüncü yol — her biri için ziyaretçi ETKİSİ, tasarım+kod BEDELİ, ölçme yolu (canlıda hangi sayı karar verdirir). Tek öneri + gerekçe.
- (b) Genel: arama motorundan bağlamsız düşen ziyaretçi (ürün sayfası, dal sayfası, arama sonucu) için sayfanın ilk 5 saniyede yapması gerekenler — nerede olduğunu, ne seçebileceğini, kime sorabileceğini nasıl anlar? En fazla 6 öneri, her biri ETKİ/BEDEL, mevcut kararlara (K1, K5, K9, K12, K17) aykırı olan varsa açıkça işaretli. Bu tür 'açıkları' göğüsleyip çözüm sunma alışkanlığı bundan sonra her turun parçası.
Bu madde çizim turunu (62–66) BEKLETMEZ; aynı turda ayrı dosya olarak yazılır.

## 68 — Mobil kısayol düğmeleri ve Destek yaprağı (Recep isteği, 17:20)  [YAZ + 1 kare çiz]
Recep: mobilde Destek'e dokununca içinden seçim çıksın (e-posta · telefon · WhatsApp · yapay zekâ asistanı), açılışı
yaratıcı ve UX'i doğru olsun; başka hangi kısayollar sunulmalı, DESIGN de önersin.
OPS önerileri (Design değerlendirsin, kendi önerilerini eklesin; çıktı `mobil-kisayol-oneriler.md` + Destek yaprağı tek kare):
- Destek yaprağı içeriği: WhatsApp (mesaj) · Ara (telefon) · E-posta · Teknik destek iste (form, K5 dili) · Sor (yapay
  zekâ asistanı — Faz 4'te gelir, o güne kadar ÇİZİLMEZ, K1 "yakında" yasağı). Kargo takibi satış kipine bağlı (K1),
  teklif kipinde yaprakta YOK.
- Her kanalın altında beklenti satırı: "Hafta içi 09–18 · ~10 dk" / "Mesai dışı: sabah döneriz" — hangi kanalın ne
  zaman cevap verdiğini söylemek kanal seçimini kolaylaştırır.
- BAĞLAM TAŞIYAN DESTEK: ürün sayfasından açılan yaprak, WhatsApp/e-posta mesajını ürün koduyla önceden doldurur
  ("SEAT-30 PP hakkında bilgi almak istiyorum"); seçici sonucundan açılırsa girdileri de ekler. Teknik destek formu
  ürünü seçili getirir.
- Açılış biçimi: alt yaprak (sheet) 4–5 büyük satır, simge + ad + beklenti; dokunma ≥44 px; tek dokunuşla kapanır.
  Yelpaze/dairesel açılım gibi gösterişli açılışlar K9 sadeliğine aykırı — Design aksini savunacaksa ETKİ/BEDEL ile
  yazsın.
- Diğer kısayol adayları (Design süzsün): "Karşılaştır (n)" çipi ≥2 ürün seçilince alt çubuğun üstünde belirir;
  "Son baktıklarınız" menü alt bölgesinde (zaten karar); ürün sayfasında yapışık eylem çubuğu (K9) — "Teklif listesine
  ekle" + "Destek"; "yukarı" düğmesi yalnız 2 ekran kaydırınca. Alt çubuğa BEŞİNCİ sekme eklenmez.
- Ölçüt: her kısayol için "kim, hangi sayfada, ne için" cümlesi yoksa kısayol konmaz.
- ADLANDIRMA SORUSU (Recep, 17:35): alt çubuktaki sekmenin adı "Destek" mi "İletişim" mi? Elimizde canlı ölçüm YOK
  (site analitiği kapalı). OPS görüşü: teklif odaklı B2B sitede ziyaretçi "İletişim" kelimesini arar; "Destek" satış
  sonrası yardım çağrışımı yapar ve teklif isteyen mühendisi tereddüte düşürür. Öneri: sekme adı "İletişim", yaprak
  içinde kanallar + "Teknik destek iste". Design kendi görüşünü ve varsa sektör örneklerini yazsın; karar Recep'in.
  Her kısayol adı için aynı test: ziyaretçi bu kelimeyi ARAR mı, yoksa öğrenmesi mi gerekir?
- Linear yorumunda 67 ve 68 dosyalarının adları ayrıca yazılsın; OPS Recep'e oradan iletir.
