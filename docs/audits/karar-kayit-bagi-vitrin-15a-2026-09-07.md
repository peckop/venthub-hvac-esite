# Karar–Kayıt Bağı — Vitrin 15A (2026-09-07, SALT OKUMA ölçüm)

Kaynaklar: `kararlar-vitrin-15a-2026-09-07.md` (docs/proje-takip/linear, 57 "##"/"###" başlık) ·
`docs/proje-takip/linear/is-dagilimi-2026-09-07.json` (22:33 damgalı — scratchpad'deki 15:21 kopyadan
daha taze, bu kullanıldı; **description alanı YOK**, yalnız `title` ile eşleştirildi) ·
`git -C C:/tmp/ops-gun-kapanisi log --since=2026-09-01` (144 satır; **aktif dal
`ops/rec217-vercel-onizleme-kapat`, master DEĞİL** — bkz. SINIR).

## Özet sayılar

| Kalem | Sayı |
|---|---|
| Toplam başlık | 57 |
| Numaralı (Kxx başlıkta) | 41 |
| Numarasız ("K —" / "AÇIK —" / adsız) | 16 |
| Mükerrer numara (aynı numara ≥2 başlıkta) | 4 satır — K18 ×2 (İSTİŞARE + BAŞLIK DÜZELTMESİ), K37-c ×2 (asıl + uygulama notu) |
| Bağlı kayıt VAR (kesin+zayıf toplam) | 22 satır |
| — bunun kesin (K-etiketi tam eşleşme veya belgede açık atıf) | 15 |
| — bunun zayıf/şüpheli (`?REC-nnn`) | 7 |
| KAYIT YOK | 35 satır |
| Kod indi (commit/PR bulundu, kesin+şüpheli) | 10 satır |
| KOD YOK | 47 satır |

*Not: 22+35=57, 10+47=57 (her satır tam olarak bir kovaya düşecek şekilde sayıldı; "zayıf" kayıtlar VAR tarafında, "şüpheli" kod bulguları İNDİ tarafında sayıldı — ayrım tablo hücresinde işaretli).*

## Tam tablo

| # | Karar no | Başlık (≤60 kr) | Tarih | Mükerrer? | Bağlı REC | Kod indi mi | Belge durum ifadesi |
|---|---|---|---|---|---|---|---|
| 1 | K1 | Ticari model — teklif odaklı, fiyat/sepet yok | 2026-08-31 | HAYIR | KAYIT YOK | KOD YOK | — |
| 2 | K2 | Kimlik — logo/palet/tipografi | 2026-09-02 | HAYIR | ?REC-202 (zayıf — başlıkta "K2" etiketi var ama içerik K5'in "tek fiil" konusu, kimlik değil) | KOD YOK | — |
| 3 | K3 | Kategori ağacı ve adresler (15A, 7×26) | 2026-09-03 | HAYIR | REC-191 (K3+K4 etiketli) | ?#1077 (e8b8c2872 — commit mesajı "bağımsız çürütme BLOK verdi, üç iddiam çürüdü"; şüpheli, gerçek durumu doğrulamaz) | — |
| 4 | K4 | Menüde olmayanlar — Atıksu/Hava Arıtma yok | 2026-09-03 | HAYIR | REC-195 (K4 Vitrin) + REC-191 (K3+K4) | ?#1077 (bkz. K3 notu, aynı şüphe) | — |
| 5 | K5 | Kiremit ve düğme kuralı — tek fiil | 2026-09-03→09-04 | HAYIR | REC-196 (K5+K38 etiketli) | KOD YOK | — |
| 6 | K6 | Ürün sayfası mimarisi — kabuk+deneyim modülü | 2026-08-25 (REC-65) | HAYIR | REC-65 (belgede doğrudan atıf) + REC-143 (K6/K18a) | KOD YOK (REC-65 pencere dışı/09-01 öncesi; REC-143 için commit yok) | — |
| 7 | K7 | Teknik alan — dolu satır, "—" yok | 2026-09-03 | HAYIR | KAYIT YOK (git'te "K7.4/K7.6/K7.10" bulundu ama bu Katalog projesinin KENDİ K7.x numaralaması — karışma riski, bu karara ait değil) | KOD YOK | — |
| 8 | K8 | Sayfa üretim düzeni — az şablon, 4 faz | 2026-09-01 (REC-106) | HAYIR | REC-106 (belgede atıf) + REC-162 (K8 PR önizleme) | ?#1053 (f23ec02d2, REC-162 PLAN — commit mesajı "emrin öncülü çürüdü"; ayrıca 3 farklı commit'te "MERGE ETME, K8" notu var (#1042/#1043/#1020) — bunlar K8'i gerekçe göstererek merge'ü ERTELİYOR, K8'in kendisini uygulamıyor) | — |
| 9 | K9 | Apple çizgisi — masaüstü/mobil kabuk | 2026-08-30→09-04 | HAYIR (metinde sonradan değişti ama başlık tekil) | KAYIT YOK | KOD YOK | — |
| 10 | K10 | Liste ve karşılaştırma — Ekran 11 | 2026-09-04 | HAYIR | REC-197 (K10 etiketli) | KOD YOK | — |
| 11 | K11 | Çalışma protokolü — Design tek proje | 2026-09-03 | HAYIR | KAYIT YOK | KOD YOK | — |
| 12 | NUMARASIZ | Ürün sayfası: kabuk varsayılan, katlı panel | 2026-09-04 sabah | N/A | KAYIT YOK (git'te "K12" bulundu ama konusu slug/yönlendirme — NIC-11921 — bu kararla ilgisiz, başka bağlam) | KOD YOK | — |
| 13 | NUMARASIZ | Liste sayfaları MATRİS görünümü, iki katlı | 2026-09-04 sabah | N/A | REC-197 (içerik eşleşmesi: "Tablo/Matris görünümü" ifadesi REC-197 başlığında da var) | KOD YOK | — |
| 14 | NUMARASIZ | Arama sonucu sayfası (ekran 08) | 2026-09-04 öğle | N/A | KAYIT YOK | KOD YOK | — |
| 15 | NUMARASIZ | TASARIM ONAYI: Menü v13 + Ana Sayfa v7 | 2026-09-04 akşamüstü | N/A | KAYIT YOK | KOD YOK | — |
| 16 | NUMARASIZ | Recep kararları 10:40 (REC-59/138/124/settings) | 2026-09-04 10:40 | N/A | REC-59, REC-138, REC-124 (üçü belgede doğrudan adıyla anılıyor) | REC-124: KOD İNDİ #986 + #983 ("31/31 yazıldı" ifadesi eşleşiyor) · REC-138: KOD İNDİ #987 + #985 (konu biraz farklı evrilmiş — anon-yazma nöbetçisi / SSR duman kilidi) · REC-59: KOD YOK (git'te hiç geçmiyor) | "BEKLİYOR" (#981 merge ve YENI_KABUK_GEZINMESI için — belgenin kendi ifadesi) |
| 17 | NUMARASIZ | Faz 1 kabuk önizlemesi (#981) | 2026-09-04 12:30 | N/A | REC-129 (belgede "#981" PR no anılıyor, git'te REC-129 karşılığı bulundu) | KOD İNDİ #981 (e390fa997 — "aynı bayrak, KAPALI") | — |
| 18 | NUMARASIZ | Design'ın erişim ve yazma sınırı | 2026-09-04 13:45 | N/A | KAYIT YOK (REC-140 belgede "ileride değerlendirilir" diye anılıyor, henüz bağlı değil) | KOD YOK | — |
| 19 | NUMARASIZ | Mobil header: Hesap ve dil sağ üste | 2026-09-04 14:00 | N/A | KAYIT YOK | KOD YOK | "K19 ile sonradan değişti" (belge kendi notu, satır 131) |
| 20 | NUMARASIZ | DESIGN şerit adı ve iletişim kanalı | 2026-09-04 14:50 | N/A | KAYIT YOK (süreç kuralı, kod'a bağlanacak nitelikte değil) | KOD YOK | — |
| 21 | NUMARASIZ | Cihaz/ürün seçimi yeri: AYRI SEÇİCİ SAYFASI | 2026-09-04 15:30 | N/A | REC-198 (içerik: "Ürün Seçici" ayrı sayfa /tr/secici) | KOD YOK (REC-198 Backlog, git'te "secici" adresine dair commit yok) | "K15'teki açık konu KAPANDI" (belge kendi notu) |
| 22 | NUMARASIZ | Gözden geçirme v1 kararları (teklif listesi adresi vb.) | 2026-09-04 15:45 | N/A | KAYIT YOK | KOD YOK (git'te "teklif-listesi" adresine dair commit bulunamadı) | — |
| 23 | NUMARASIZ | "Ürün Seçici" kalıcı girişi (header, ad) | 2026-09-04 16:10 | N/A | REC-198 (içerik eşleşmesi, K24 ile örtüşüyor) | Not: K24 (satır 38) altında görünen #1040 commit'i muhtemelen bu kararın da uygulamasıdır ama commit doğrudan "K24" etiketli, bu başlığa değil — çapraz atıf, kesin sayılmadı | "09-05 URUN ölçümü" ile güncellendi (belge kendi notu) |
| 24 | NUMARASIZ | Mobil üst şerit KARARI: 52b + akıllı dil çipi | 2026-09-04 16:50 | N/A | KAYIT YOK | KOD YOK | — |
| 25 | NUMARASIZ | Ürün sayfasındaki hesap paneli | 2026-09-04 17:10 | N/A | KAYIT YOK | KOD YOK | **AÇIK** — "Recep canlı veri görmeden karar vermiyor" (belgenin kendi başlığı) |
| 26 | NUMARASIZ | "İletişim" sekmesi + ürün seçimi alt. çalışma | 2026-09-04 18:30 | N/A | KAYIT YOK | KOD YOK | K19 ile geri alındı ("İletişim sekmesi" kalktı — belge satır 189) |
| 27 | K18 | Ürün Seçici: tek sayfa, grup grup (ilk yazım) | 2026-09-04 akşam | **EVET** (K18 satır 294'te tekrar) | REC-198 (K18 etiketli) | KOD YOK | **"İSTİŞARE — KARAR DEĞİL"** (belgenin kendi başlığı; satır 296'da "K18 KARARDIR" diye düzeltildi) |
| 28 | K19 | Mobil kabuk v2 — Hesap sekmesi, İletişim yaprak | 2026-09-05 sabah | HAYIR | REC-160, REC-167, REC-199, REC-213 (hepsi K19 etiketli) | KOD İNDİ ?#1088 (387a49eb5, REC-**213-A** — tam REC-213 değil, alt-görev; "Ürünler sayfası kategori kapısını geri alıyor" içerik olarak K19'un "Ürünler" kısmına yakın ama farklı odaklı) | — |
| 29 | K20 | Aile anlatımı = ürün sayfası, hikâye akışı | 2026-09-05 | HAYIR | KAYIT YOK | KOD YOK | — |
| 30 | K21 | Ürün değişirse her şey veriden | 2026-09-05 | HAYIR | REC-200 (K21 etiketli) | KOD YOK | — |
| 31 | K18 eki | Ürün Seçici kademeli açılış önkoşulları | 2026-09-05 | HAYIR (etiket "K18 eki", bare "K18" değil — ama ailesi K18) | REC-198 (K18-c etiketi üzerinden) + ?REC-171 (zayıf-orta — "kural tablosu v2/kişi başına debi/ASHRAE 62.1" ifadeleri K18-a notuyla örtüşüyor ama K37-b'ye daha yakın) | KOD YOK | — |
| 32 | K22 | Durum alfa ile anlatılmaz | 2026-09-05 | HAYIR | KAYIT YOK | KOD YOK (Design .dc.html seviyesinde düzeltme, üretim koduna henüz taşınmadı) | — |
| 33 | K23 | Logo elle çizilmez | 2026-09-05 | HAYIR | KAYIT YOK | KOD YOK | — |
| 34 | K23-a | İkon kontur kalınlığı 1.5 | 2026-09-05 | HAYIR | KAYIT YOK | KOD YOK | — |
| 35 | K23-b | Sönükleştirme de dosyadan gelir | 2026-09-05 gece | HAYIR | KAYIT YOK | KOD YOK | — |
| 36 | NUMARASIZ | Tasarım Programı Haritası | 2026-09-05 gece | N/A | KAYIT YOK | KOD YOK | — |
| 37 | K1a | Satış kipi ekranları Menü v17'de (uygulama notu) | 2026-09-05 gece | HAYIR | REC-168 (başlık tam örtüşüyor: "Satış kipine TEK ANAHTARLA geçiş — hide_price + NEXT_PUBLIC_ODEME_ACIK") | KOD İNDİ #1061 (2204fd45a, taslak/docs-only) + #1070 (50f164966, "anahtar bağlandı, davranış bugün AYNI") — anahtar var, kapalı; ekranların kendisi (S1–S6) için ayrı commit yok | — |
| 38 | K24 | Ürün Seçici girişi = header | 2026-09-06 | HAYIR | REC-198 (K24 dahil) — ayrıca commit'in kendi metni "REC (URUN) K24" diyor ama REC numarası YAZMIYOR (belirsiz/eksik atıf) | **KOD İNDİ #1040** (e232bb0a7 — "header'da 'Ürün Seçici' girişi, bayrak arkasında, KAPALI"; en kesin eşleşme bu satırda) | — |
| 39 | K25 | Turkuaz metin rengi değil, `--brand-cyan-ink` | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | K25-b tarafından geri alındı ("ölçümsüzdü", belge satır 249-251) |
| 40 | K25-b | Sayaç/kiremit zemini koyulaşır | 2026-09-06 | HAYIR | KAYIT YOK (REC numarası yok, doğrudan PR) | **KOD İNDİ #1043** (6905d05b5 — "iki AA koyu tonu token'a indi"; ama commit notunda "MERGE ETME, K8" var → K8 gerekçesiyle bilerek MASTER'A ALINMAMIŞ olabilir; master log'unda da bu commit görünüyor, yani fiilen dalda/mirror'da mevcut — SINIR'a bkz.) | — |
| 41 | K26 | Değer emri kaynağa gider, DS türetir | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 42 | K27 | Tekrar eden desen DS'e çıkar | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 43 | K28 | Ham hex ölçütü | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 44 | K29 | Desen envanteri kabul + bileşen sırası | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 45 | K30 | Rozet tonu üç sınıf + `--surface-dark-inset` | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 46 | K31 | Hüküm kutusu tonları — renk eklenmez | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 47 | K31-a | Mobil alt sekme çubuğu hâl renkleri | 2026-09-06 | HAYIR | KAYIT YOK | KOD YOK | — |
| 48 | K32–K35 | Kimlik kuralları F5–F8 (foto/yarıçap/mono/PQ) | 2026-09-06 | HAYIR (tek başlık altında 4 numara BİRLEŞİK — bkz. SINIR) | KAYIT YOK | KOD YOK | — |
| 49 | K18 | BAŞLIK DÜZELTMESİ — K18 KARARDIR | 2026-09-06 | **EVET** (K18 satır 178 ile aynı numara) | REC-198 | KOD YOK | Düzeltme notu: "Kayıt kusuru OPS'ta" (belgenin kendi ifadesi) |
| 50 | K18-c | Ürün Seçici prototipi = ölçüm aracı | 2026-09-06 | HAYIR | REC-198 (K18-c dahil) | KOD YOK (prototip Design projesinde .dc.html; bu repoda commit yok) | — |
| 51 | K37 | Yöntem: dinamik, statik değil | 2026-09-06 | HAYIR | REC-198 (K37 dahil) | KOD YOK | — |
| 52 | K37-a | Recep'in UI iyileştirmeleri (U1/U2/U3) | 2026-09-06 | HAYIR | REC-198 (K37-a dahil) | KOD YOK | "Emir #8 KAPANDI" (belge kendi ifadesi, ayrı bir alt-madde için) |
| 53 | K37-b | Prototip teslimi (emir #10) KABUL + 4 hüküm | 2026-09-06 gece | HAYIR | REC-171 (içerik güçlü örtüşme: "kişi başına debi ASHRAE 62.1", "SINIRDA bandı kaynaklı eşik", "devir ölçekleme") | KOD YOK (REC-171 Backlog, git'te commit yok) | "U3 = RECEP" (yapısal karar bekleniyor, belgenin kendi notu) |
| 54 | K37-c | Recep'in üç hükmü (U3=PANEL, kip anahtarı önce) | 2026-09-07 gece | **EVET** (K37-c satır 318'de tekrar) | KAYIT YOK | KOD YOK | — |
| 55 | K37-c uygulama notu | Kip anahtarı teslim edildi | 2026-09-06 | **EVET** (K37-c ile aynı numara) | KAYIT YOK | KOD YOK (Design ölçümü, DOM/prototip düzeyinde — bu repo commit'i değil) | "Emir #12 madde 2 KAPANDI" (belge kendi ifadesi) |
| 56 | K38 | Satış kipi kimlik hükmü (Sepete Ekle/Ödemeye Geç) | 2026-09-06 | HAYIR | REC-196 (K5+K38 etiketli) | KOD YOK | "K38 uygulandı" (belge kendi notu, ama Design/Marka seviyesinde — kod değil) |
| 57 | K39 | Fiyatsız ürün satış kipinde "Teklif iste" | 2026-09-06 | HAYIR | REC-168 (mekanizma) + REC-169 (vitrin karşılığı) — ikisi de belgede doğrudan adıyla anılıyor | REC-168: KOD İNDİ #1061/#1070 (bkz. K1a) · REC-169: KOD YOK (Backlog) | — |

## SINIR

1. **Linear dökümünde `description` alanı YOK.** `is-dagilimi-2026-09-07.json` kaydı yalnız
   `identifier/title/status/.../labels` taşıyor; eşleştirme SADECE `title` üzerinden yapıldı. Görev
   tanımına yazılan "description/title'ında K-numarası geçiyorsa" ölçütünün description kısmı hiç
   ölçülemedi — description'da geçen ama title'da geçmeyen bağlar bu tabloda YOK sayılmış olabilir
   (yanlış-negatif riski).
2. **Git ölçümü master değil, `ops/rec217-vercel-onizleme-kapat` dalında yapıldı** (aktif checkout).
   `git merge-base --is-ancestor HEAD master` **false** döndü — bu dal master'a henüz karışmamış.
   Karşılaştırma için `origin/master` log'u da çekildi: iki liste neredeyse özdeş (master'da 7 fazla
   commit, bu dalda 1 fazla commit — `df1abdd2c`), yani tabloda kullanılan REC-124/138/129/168/198/
   213-A/24/25-b bulguları her iki dalda da var — ama bu genel bir garanti değil, yalnız bu iki dal
   için doğrulandı. `origin/master` local `master`'dan bile 2 commit ileride (`b645adf53`), yani
   yerel `master` referansı da güncel değil.
3. **K32–K35 tek başlık altında 4 karar numarası taşıyor**; görev "her başlık = bir karar" dediği
   için bu 4 numara TEK satırda birleştirilmiş, tabloda ayrı satır açılmadı — sayım bu yüzden
   "yaklaşık 57-59" aralığının alt ucuna yakın kaldı (57), gerçek K-numarası sayısı bundan fazla.
4. **K-numarası boşlukları var:** metin içinde K12, K13, K14, K15, K16, K17 gibi numaralara atıf
   var (ör. "K12 (katlı panel)", "K16'daki hüküm") ama bu numaraların KENDİ başlığı bu belgede yok —
   büyük olasılıkla bu doküman ilk sürümünde (2026-09-04) sözlü/örtük numaralandırılmış, sonradan
   başlık haline getirilmemiş. Git log'da rastlanan "K12 (URUN): NIC-11921 slug..." gibi kayıtlar
   BAŞKA bir bağlamda K12 kullanıyor (muhtemelen farklı proje/tarih), bu belgenin K12'siyle
   karıştırılmamalı — tabloda bu risk her ilgili satırda ayrıca not edildi.
5. **"Katalog" projesinin kendi K numaralaması var** (K7.4, K7.6, K7.10 gibi) ve bu Vitrin 15A'nın
   K7'siyle numara çakışması yaratıyor (aynı "K7" öneki, farklı doküman/konu). Grep bazlı otomatik
   eşleştirme bu ikisini ayırt edemez; elle okuyarak elendi ama başka satırlarda gözden kaçmış
   olabilir.
6. **Zayıf eşleşmeler (`?REC-nnn`) kesin sayılmadı**, ama "Bağlı kayıt VAR" özet sayısına dahil
   edildi (etiketli olarak) — gerçek/kanıtlı bağ sayısı özet tablodaki "kesin: 15" satırıdır.
7. **Commit mesajı ile gerçek "merge edildi mi" durumu arasında fark olabilir.** Örn. K25-b
   (`#1043`) ve üç ayrı commit "MERGE ETME, K8" notuyla işaretli — bu notun "commit dalda duruyor
   ama bilerek master'a alınmamış" mı yoksa "zaten alındı, not eskimiş" mi olduğu bu ölçümle
   AYRIŞTIRILAMADI (git log tek başına branch/PR merge durumunu kanıtlamaz, yalnız commit'in o
   dalın tarihçesinde var olduğunu gösterir).
8. **REC durumları (Backlog/In Review/Done) bu görevde tek tek doğrulanmadı** — yalnız git log'da
   commit var mı diye bakıldı; "In Review" olan bir REC'in commit'i olsa bile PR henüz merge
   olmamış olabilir (ör. REC-162, REC-168 "In Review" statüsünde, commit'leri var ama bu statü
   PR'ın açık olduğunu gösteriyor olabilir — statü alanı ile commit varlığı çelişebilir, bu
   çelişki çözülmedi).
9. **"Belgenin kendi durum ifadesi" sütunu yalnız metinde açıkça yazılı ifadeler için dolduruldu**
   ("AÇIK", "İSTİŞARE — KARAR DEĞİL", "geri alındı" gibi); ima yoluyla anlaşılan durum değişiklikleri
   (ör. bir kararın sonraki bir kararla sessizce geçersiz kılınması) bazı satırlarda not olarak
   eklendi ama bu yorum niteliğinde, "belgenin kendi ifadesi" kadar kesin değil.
10. **57 başlık sayımı `##` ve `###` seviyelerini birlikte saydı** (K37 ailesi `###` ile yazılmış,
    geri kalanı `##`); görev tanımındaki "yaklaşık 57-59" aralığına düşüyor ama farklı bir sayım
    yöntemi (yalnız `##`) 48 verirdi — hangi yöntemin kastedildiği belirsizdi, ikisi birden
    kullanılan doküman genelinde tutarlı göründüğü için `##`+`###` tercih edildi.
