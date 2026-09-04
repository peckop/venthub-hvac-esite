# Geri bildirim 5 — gözden geçirme v1 sonrası çizim turu (OPS, 2026-09-04 akşamüstü)

Kaynak: `gozden-gecirme-bulgular-v1.md` (DESIGN) + `gozden-gecirme-eleme-v1.md` (OPS) + Linear "Kararlar — Vitrin 15A"
(bu belge Linear'dan OKUNUR; K17'ye kadar). Numaralar 48'den başlar. Önceki geri bildirimler (1–4) geçerli kalır.
Bu tur ÇİZİM turudur. Yeni dosya adları: `Menü Tasarımı v14.dc.html` (v13 ARSIV), `Venthub Ana Sayfa v8.dc.html` (v7 ARSIV).
İmza kuralı: Linear'a tek yorum, "— DESIGN (Fable) 2026-09-0x".

Erişim ve yazma kuralları geri-bildirim brief'indeki gibi: Supabase yalnız SELECT; Linear'a yalnız tur sonu tek yorum;
karar belgesine yazma; canlıda form/giriş yok.

---

## 48 — Seçici sayfası: YENİ ekran 13 (Recep kararı, K17)  [ÇİZ]
Tek sayfa, Hesaplayıcılar altında (`/tr/hesaplayicilar` ya da `/tr/secici`; adres OPS'ta, görsel için `/tr/secici`).
İçerik: üstte "Nerede kullanacaksınız?" mekân çipleri (8 senaryo ile aynı dil), altında oda girdileri (alan · yükseklik
· kişi/kullanım), sonra "Hesapla" tek kiremit → sonuç bloğu: uyan 3–5 model kartı (K10 kart, üçlü eylem YOK: yalnız
"Ürüne git" çerçeveli + "Teklif listesine ekle" çerçeveli), her kart 07d'ye `?hesap=1` ile düşer. Hava perdesi için
ikinci sekme (giriş genişliği · yükseklik · kapı tipi). Masaüstü 1440 + mobil 390. Giriş noktaları: ana sayfa
"Doğru fanı seçin" çerçeveli düğme, senaryo sayfası (09) "Bu senaryo için fan seçin" çerçeveli düğme, teklif listesi
"Hesapla". Kodda dört hesaplayıcı yolu tek yola iner (Faz 3, kod).

## 49 — Ürün sayfası "aylık elektrik ₺" kutusu (bulgu a.1, K1)  [Recep KARARI 15:45: para birimi KALKAR]
Kutu kWh/ay ve "güç payı %" ile kalır; ₺ ve ₺/kWh hiçbir yerde geçmez. 07 ve 07d'de uygula.

## 50 — v11'den düşen "dönen fan animasyonu" ve "koyu mod" (bulgu a.4, K6)  [Recep KARARI 15:45: DÜŞTÜ]
CLAUDE.md envanterine "Recep onayı: düştü (2026-09-04)" yazılır; çizim değişmez.

## 51 — Teklif listesi adresi (bulgu c.1/c.2, K1)  [Recep KARARI 15:55: EKLE, kaldırma]
Teklif listesi YENİ adres alır: `/tr/teklif-listesi` (EN `/en/quote-list`). Sepet (`/cart`) SİLİNMEZ: satış kipi
açılınca kendi sayfası olarak geri gelir; o güne kadar sitemap'ten çıkar ve teklif listesine yönlenir. Ekran 10
altyazısına yeni adres yazılır. Design tarafında yalnız altyazı; kod Faz 2.

## 52 — Mobil üst şerit: Hesap + dil sağ üst, alt çubuk 4 sekme (bulgu e.1, Recep yönü)  [Recep KARARI 15:45: iki hâl ÇİZ, Recep seçer]
v13'te arama logonun ALTINDA ayrı satır, logonun sağı boş; "sığmaz" itirazı geçersiz. İki artboard:
- 52a: sağ üstte hesap simgesi + "TR | EN"; alt çubuk Ana sayfa · Ürünler · Teklif · Destek.
- 52b: sağ üstte yalnız hesap simgesi; dil, hesap yaprağının ilk satırı; alt çubuk aynı 4 sekme.
Dokunma hedefi ≥ 44 px; ≤ 9 görünen etkileşimli öğe (K9, madde 60 tanımı). Recep birini seçer, K9/K16 ona göre yazılır.

## 53 — Hesap yaprağı K16'ya göre (bulgu e.2)  [ÇİZ]
Girişsiz hâl: (52b'de dil satırı) · "Giriş yapın" çerçeveli · kilitli Tekliflerim / Projelerim (gri, kilit simgesi, bağlantı
değil). Girişli hâl: Tekliflerim · Projelerim · Favorilerim · Profil · Çıkış. "Siparişlerim" KALKAR (K1). Ekran 12'de
iki hâl yan yana.

## 54 — Kategori sayfası ÜÇ MOD (bulgu b.1, K8)  [ÇİZ]
Mod DAL SAYISINDAN türer, bayrak değil: (1) VİTRİN: ≥3 dal → dal kiremitleri + kısa anlatım (04 bugünkü hâl);
(2) ANLATIM: tek dal → senaryo metni + o dalın seri listesi aynı sayfada; (3) SERİ LİSTESİ: dal yok → doğrudan seriler
(06 şablonu, süzgeç açık). Ekran 04'e üç varyant; altyazıda hangi kategorinin hangi moda düştüğü (canlı ağaçtan:
Fanlar vitrin · Hava Perdeleri seri listesi · Isı Geri Kazanım anlatım örnek).

## 55 — 07c "kısa kabuk" hâli (bulgu a.5)  [ÇİZ]
Sürücü/aksesuar ürünü: 3 satır tablo, seçici yok, eğri yok, çağrı satırı yok. Boşluk bırakmadan: belge düğmeleri
(varsa), "Uyumlu ürünler" şeridi (aynı aileden 3 kart), teknik tablo daralır. Tek artboard 1440.

## 56 — Panel görünürlüğü (bulgu a.3)  [ÖLÇ + gerekirse KAYDIR]
07c'de "Hesaplayın" çağrı satırı 1440×900 ilk ekranda tamamen görünür olmalı; değilse satır fotoğraf bloğunun
hemen altına alınır. Sayfa üstüne ek işaret KONMAZ (K9). Altyazıya ölçüm sonucu (px) yazılır.

## 57 — Uzun-metin şablonu: YENİ ekran 14 (bulgu c.5)  [ÇİZ]
Source Serif 4 gövde, Archivo başlık, 720 px ölçü, sol içindekiler (masaüstü). Bilgi Merkezi konu sayfası
(`/destek/konular/<slug>`) ve hukuki metinler (`/legal/*`) bu şablondan. Bir örnek: "KVKK Aydınlatma Metni".
Bilgi Merkezi giriş sayfası (`/destek/merkez`) = kart ızgarası (06 kartı, görselsiz), aynı artboard'da ikinci kare.

## 58 — Masaüstü Destek girişi (bulgu e.5)  [ÇİZ]
Header'daki "İletişim" bağlantısı masaüstünde Destek yaprağının karşılığını açar: WhatsApp · Ara · Teknik destek iste
(çerçeveli) · Kargo takibi · İletişim formu. Ekran 12'ye masaüstü yaprak.

## 59 — Küçük düzeltmeler (tek turda)  [UYGULA]
- 06b boş sonuca 08b'deki "süzgeç başına sayı" bloğu (b.4).
- Faset başlıkları Archivo 11 px / 600 / harf aralıklı; Plex Mono yalnız teknik değer (b.5).
- Ekran 05 "ATEX versiyonu mevcut" çipi altyazısı: sertifika faseti, boşsa görünmez (b.3).
- 07 altyazısı: "panel değerleri oturum boyu tutulur" (a.7).
- Ekran 12 "Yeni proje oluştur" → altyazı "ayrı yaprak" (e.3).
- Kartlardaki üçüncü düğme "Ürünü incele" KALKAR; kart = Karşılaştır + Teklif listesine ekle (K5); tıklama alanı kartın
  kendisi.
- Menü alt bölgesi "Tüm ürünler (375)" sayı KALIR (K9 istisnası).
- Ekran 10 altyazısına adres (madde 51 kararı gelince).

## 60 — Kural tanımları (Design uygulamaz, bilsin)
- K9 "≤ 9 etkileşimli öğe" = ekranda GÖRÜNEN, kaydırma dışı öğe sayısı.
- Tüm ürünler sayfası Faz 1–2'de ekran 06 boş süzgeç; marka × kategori haritası Faz 3 (K13).
- Marka sayfası = liste şablonu (06) + marka başlığı bloğu; ayrı artboard İSTENMİYOR, altyazı yeter.
- Şablon tablosu (hangi sayfa hangi şablondan) OPS'ta yazılıyor, K18 olarak gelecek.

## Yapılmayacaklar
- Giriş / kayıt / hesap kabuğu ekranları: Faz 4 (K16), bu turda yok.
- Matris görünümü: Faz 3 (K13), bu turda yok.
- Ana sayfa v8'de içerik değişikliği yok; yalnız 48'deki "Doğru fanı seçin" düğmesinin hedefi ve 52 mobil şerit.

## Çıktı
`Menü Tasarımı v14.dc.html` + `Venthub Ana Sayfa v8.dc.html` + kısa `v14-notlar.md` (her madde: yapıldı / ölçüm / soru).
Toplam yeni artboard: 13 (seçici mobil+masaüstü), 14 (uzun metin + merkez), 52a/52b, 53 iki hâl, 54 üç varyant,
55, 58 → ~11 kare. Bir günde çizilemezse öncelik sırası: 48 → 52 → 53 → 54 → 57 → 55 → 58 → 59.

## 61 — "Ürün Seçici" girişi (Recep, 16:10)  [ÇİZ]
Seçici sayfasının (madde 48) KALICI bir girişi olur, adı "Ürün Seçici" (fan demez; hava perdesi ve ısı geri kazanım da seçilir).
- Masaüstü header: mevcut "Hesaplayıcılar" öğesi "Ürün Seçici" olur (hesaplayıcılar bu sayfada birleşti, madde 48); öğe sayısı değişmez.
- Mobil: Ürünler menüsünün alt bölgesine "Ürün Seçici" satırı (Tüm ürünler · Markalar · Ürün Seçici); ≤9 kuralı görünen öğe sayısıyla ölçülür (madde 60), sığmıyorsa Design öneri yazsın, satırı sessizce düşürmesin.
- Ana sayfadaki "Doğru fanı seçin" düğmesinin adı da "Ürün Seçici" olur; tek ad, tek hedef.
- Geri-bildirim-3 madde 37'deki "Doğru fanı seçin menüye KONMAZ" hükmü bu maddeyle DEĞİŞİR: konmayan fan seçiciydi, konan ürün seçicidir.
