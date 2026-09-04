# Gözden geçirme turu — brief (OPS, 2026-09-04)

## Amaç
Menü Tasarımı v13 + Ana Sayfa v7 (onaylı, K15) ve sayfa mimarisini TAZE GÖZLE eleştirmek; boşlukları ve zayıf
akışları yazılı bulgu olarak çıkarmak. Bu turda ÇİZİM YOK, YENİ DOSYA YOK. Çıktı tek bir markdown dosyasıdır:
`gozden-gecirme-bulgular-v1.md`.

## Sınırlar (üçü de kesin)
1. `kararlar-vitrin-15a.md` içindeki K1–K16 TARTIŞILMAZ. Bir karar hakkında yalnız iki şey söylenebilir:
   "Kx ile Ky çelişiyor" ya da "Kx ekran NN'de uygulanmamış". "Bence Kx yanlış" bu turun konusu değildir; böyle
   bir görüş varsa dosyanın SONUNDA ayrı "Karar dışı görüşler" başlığında, en fazla beş satır.
2. Her bulgu üç sınıftan BİRİNE girer ve başında etiketi taşır:
   - `[AYKIRI]` — bir ekran bir karara aykırı (Kx numarası + ekran no şart).
   - `[BOŞLUK]` — çizilmesi ya da karar verilmesi gereken bir şey yok (boşluk listesiyle eşleştir; listede yoksa
     "listede yok" yaz).
   - `[İYİLEŞTİRME]` — karar ihlali değil, daha iyi olabilir; ETKİ (ziyaretçi ne kazanır) + BEDEL (ne değişir)
     tek cümleyle.
   Etiketi olmayan bulgu sayılmaz.
3. Konu başlıkları sabit, sırayla; her başlık altında en fazla yedi bulgu, en önemlisi önce:
   a. Ürün sayfası (07/07b/07c/07d) — mühendisin model koduyla gelişi; kararsız ziyaretçinin paneli bulması;
      teknik tablo; eylem bloğu.
   b. Kategori ve dal sayfaları (04/05/06/06b) — kategori sayfasının "üç modu" (K8) ekranlarda okunuyor mu;
      liste şablonu; boş sonuç.
   c. Sayfa mimarisi ve adresler — hangi sayfa hangi şablondan üretilir (K8), kısa slug (K3), arama/senaryo/
      karşılaştırma yollarının kodda olmaması (boşluk listesi B).
   d. Cihaz/ürün seçiminin YERİ (K15 açık konu) — seçici sayfası mı, üründeki panel mi, senaryo sayfası mı;
      üç seçenek için ETKİ/BEDEL, tek öneri.
   e. Menü ve gezinme (01/02/03/12) — mobil ≤9 kuralı (K9); Hesap/Destek yaprakları; giriş yapmamış ziyaretçi.
   f. Boşluk listesi doğrulaması — `bosluk-listesi-2026-09-04.md` A ve B tablolarını depodan (peckop/
      venthub-hvac-esite, `src/app/[lang]/**/page.tsx`) ve canlı sitemap'ten (venthub.com.tr/sitemap.xml, 192
      adres) BAĞIMSIZ say (Kernel ile açıp sayabilirsin); tutmayan satırı yaz. Tutuyorsa "A: 42/47 doğrulandı" gibi tek satır.

## Girdi dosyaları (projede)
- `kararlar-vitrin-15a.md` — kararlar (K1–K16); Linear'daki "Kararlar — Vitrin 15A" belgesinin 13:15 kopyası. Linear'daki daha yeniyse Linear kazanır, farkı yaz.
- `venthub-canli-durum.md` — canlı sitenin gerçeği (katalog sayıları, adresler, kodda ne var).
- `bosluk-listesi-2026-09-04.md` — OPS'un boşluk sayımı (f maddesinde doğrulanacak).
- `Menü Tasarımı v13.dc.html`, `Venthub Ana Sayfa v7.dc.html` — incelenen tasarım.
- `geri-bildirim-3.md`, `geri-bildirim-4.md` — önceki turların kararları (bağlam).
- `referans-canli-urun-sayfasi-v11.html` — ürün modülünün iç mantığı.

## Erişim ve yazma kuralları (bu tur için kesin)
- Supabase: YALNIZ okuma (SELECT). Hiçbir INSERT / UPDATE / DELETE / migration / storage yazımı yok; canlı veritabanı
  değişikliği yalnız Recep'in onayıyla ve Claude Code tarafından yapılır. Bir düzeltme gerekiyorsa bulgu olarak yaz.
- Linear: okumak serbest (Kararlar belgesi, Vizyon, işler, yorumlar). YAZMA yalnız şu biçimde: bulgular dosyası
  bittikten sonra "Vitrin 15A Yeniden Tasarım" projesine TEK yorum ("gözden geçirme v1 hazır, dosya: ..."). Kararlar
  belgesine, işlere ve durumlara yazma; karar belgesini OPS günceller.
- GitHub: okuma. Canlı site: Kernel ile gezmek ve ekran görüntüsüne bakmak serbest; form doldurma, teklif gönderme,
  giriş deneme yok (canlıya kayıt bırakır).
- Ürün fotoğrafları: storage'daki 867 görsele bakıp hangi ürünlerin fotoğrafı "kahraman" olabilir diye ÖNERİ
  yazabilirsin; dosyaları projeye kopyalama bu turda yok (Faz 2 brief'inde olur).

## Gerçekler (varsayma, bunlar ölçüldü)
- Katalog: 375 ürün · 40 seri/aile · 5 marka (Vortice 173, SEAT 81, AVenS 51, Nicotra Gebhardt 35, Danfoss 35).
- Canlı ana sayfanın ham HTML'inde h1 VAR ve sunucuda üretiliyor ("Endüstriyel Havalandırma Katmanları");
  HTML okuma aracı bunu kaçırabiliyor; emin olmak için Kernel ile bak.
- Canlıda müşteri görünümü hâlâ ESKİ tasarım. Yeni kabuğun üç parçası (palet, mobil alt sekme çubuğu, header
  teklif paneli) koda girdi ama kapalı bayrak arkasında; ziyaretçi görmüyor.
- Canlıya Kernel ile bakabiliyorsun; ama canlı ESKİ tasarımdır, görünüm yargısı v13/v7 dosyaları üzerinedir.
  Canlı, yalnız 'kodda/canlıda ne var' sorusu için kaynaktır.

## Çıktı biçimi
```
# Gözden geçirme bulguları v1 — <tarih>
## a. Ürün sayfası
1. [AYKIRI] K5 · ekran 07 — ...
2. [İYİLEŞTİRME] ... ETKİ: ... BEDEL: ...
## b. ...
## f. Boşluk doğrulaması
A: 42/47 doğrulandı; fark: ...
B: 7/7 doğrulandı
## Karar dışı görüşler (en fazla 5 satır)
```
Toplam bulgu ≤ 40. Her bulgu tek paragraf, en fazla üç cümle. Türkçe.
