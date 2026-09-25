# Rehber yazıları — görsel ihtiyaç listesi (REC-369, 2026-09-25)

> **Niçin:** Recep ilk yazının ön izlemesini gördü: *"blog gibi, daha kaliteli görünmeli, kapak resmi
> bile yok"* (OPS aktarımı, 2026-09-25). Eleştiri metne değil sunuma. Açık kararlar: **134** (kapak ve
> şema görsellerinin kaynağı), **135** (yayın, sunum yükseltmesini bekler mi). Bu liste iki karardan
> bağımsızdır: hangi yazıda hangi görsel gerekir ve çizilecekse veri hangi belgeden gelir.
> **Cetvel:** `docs/standards/rehber-yazisi-standard.md` R3.1 (görsel maddesi, v0.7 taslak).
> **Ölçülen kısıt (BLOG, 2026-09-25, `src/lib/bilgiMerkezi/markdown.ts` satır 93):** bugünkü ayrıştırıcı
> görsel sözdizimini **reddediyor** (`görsel sözdizimi desteklenmiyor` hatası derlemeyi düşürür) ve yazı
> kaydında kapak alanı yok. Görseller şablon işi olmadan metne eklenemez (URUN, karar 134/135'e bağlı).

Numara, yazıdaki kaynak listesinin numarasıdır. "Temsilî", belirli bir model ya da ölçekli çizim değil
demektir; alt metin bunu söyler (R3.1). Her şemadaki sayı ve etiket bir iddiadır; iddia tablosuna satır
olarak girer ve doğrulamadan geçer.

## 1. Frekans konvertörü nedir, fan ve pompada nasıl seçilir? (doğrulandı; yayın karar 120 bekliyor)

| # | Yer (bölüm) | Görsel | Veri kaynağı | Tür |
|---|---|---|---|---|
| K | Kapak | Frekans konvertörü, motor ve fan/pompa hattı | Temsilî; ya da sitede satılan FC 51 / FC 101 / FC 102 ürün fotoğrafı (ürün sayfasında zaten kullanılan görsel) | Kapak |
| Ş1 | Nasıl çalışır? | Blok şema: şebeke → doğrultucu → DC ara devre → evirici → motor; kontrol birimi | [1] Danfoss FC 102 Design Guide MG16Z102, bölüm 11 "Basic Operating Principles of a Drive" (kaynak dizini s.109) | Çizim |
| Ş2 | Fan ve pompada neden kullanılır? | Orantı yasaları eğrisi: debi ∝ n, basınç ∝ n², güç ∝ n³; %80 devirde güç 0,51 noktası işaretli | [2] FC 101 Design Guide (orantı yasaları) + yazıdaki hesap örneği | Grafik |
| Ş3 | Değişken tork ve sabit tork | Tork–devir: değişken tork (karesel) ile sabit tork (düz) eğrileri | [1] VT/CT karakteristiği | Grafik |
| Ş4 | Nasıl çalışır? (anahtarlama frekansı) — isteğe bağlı | PWM darbe dizisi ve oluşan akım dalgası | Temsilî; kavram [1] bölüm 5.1.10 | Çizim |

## 2. Radyal fan mı aksiyel fan mı? (doğrulandı; önizleme hazır)

| # | Yer (bölüm) | Görsel | Veri kaynağı | Tür |
|---|---|---|---|---|
| K | Kapak | Radyal ve aksiyel fan yan yana | Temsilî; ya da sitede satılan Nicotra Gebhardt ve Vortice ürün fotoğrafları | Kapak |
| Ş1 | Radyal ve aksiyel fan nedir? | Hava yolu kesiti: aksiyelde eksene paralel, radyalde radyal yönde | [1] DOE/AMCA Improving Fan System Performance, 2003 | Çizim |
| Ş2 | Radyal fanlarda kanat tipleri | Dört kanat profili: öne eğik, radyal düz, radyal uçlu, geriye eğik havayarı; verim aralıkları etiketli | [1] DOE sourcebook (verim aralıkları yazıdaki tabloyla aynı) | Çizim |
| Ş3 | Fan eğrisi nasıl okunur? | Fan eğrisi + sistem eğrisi + çalışma noktası + kararsız bölge + en yüksek verim noktası | [1] DOE (kavramlar) + [2] Nicotra Gebhardt AT s.5 (çift logaritmik diyagram, sistem eğrisi düz çizgi) | Grafik |
| Ş4 | Montaj fanın performansını nasıl etkiler? | Fan çıkışına yakın dirsek ile uzak dirsek karşılaştırması | [1] DOE "sistem etkisi" | Çizim |

## 3. Sessiz kanal tipi fan nasıl seçilir? (doğrulandı; MEVZUAT 3g sonucu bekleniyor)

| # | Yer (bölüm) | Görsel | Veri kaynağı | Tür |
|---|---|---|---|---|
| K | Kapak | Asma tavan içinde kanal fanı | Temsilî; ya da sitede satılan LINEO QUIET ürün fotoğrafı | Kapak |
| Ş1 | Kanal tipi fan nedir, sessiz olanı neden farklıdır? | Kesit: gövde, ses emici kaplama, Helmholtz rezonatörü, karışık akışlı çark, akış düzelticiler, giriş ağzı | [1] Vortice LINEO kataloğu Aralık 2020, s.6 (kaplama), s.8 (çark, divergent eleman, giriş ağzı) | Çizim |
| Ş2 | Sessiz gövde neyi azaltır, neyi azaltmaz? | Üç ses yolu (emiş ağzı, basma ağzı, gövdeden yayılan) ve LINEO 315 / 315 QUIET çubuk grafiği: 74,5/74,2 · 74,2/72,3 · 49/45,4 dB(A) | [1] s.18 (315 QUIET) ve s.28 (315), 3 m serbest alan | Grafik |
| Ş3 | Hesap örneği | Uzaklık–ses basıncı eğrisi (serbest alanda iki katta −6 dB); 3 m → 26,1, 1,5 m → 32,1 dB(A) işaretli | [2] OSHA OTM Ch.5 formülü + [1] s.18 | Grafik |

## Kapak için ortak not

Kapak hangi kaynaktan gelirse gelsin (karar 134): yazıya özgü olur (aynı görsel iki yazıda kullanılmaz),
hakkı belgelidir, alt metni vardır, `Article` JSON-LD'nin `image` alanını da besler (R6: Google'ın
önerdiği alanlar arasında).
