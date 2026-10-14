# BLG-3 bulgu tablosu — yazıdan yazıya ders aktarımının 1. adımı (BLG-10)

> **Sahibi:** BLOG. **Kart:** BLG-10 (adım 1). **Durum:** TASLAK; yazıldığı gün 2026-10-13. Bağımsız çürütme turundan geçti (aynı gün); sınıf düzeltmeleri §1, §3, §4, §4.1'de.
> **Kapsam:** radyal/aksiyel fan rehberi (BLG-3) tur 1 ile tur 10 arası. Frekans yazısının (BLG-4) bulguları aynı şemayla ayrı bölümdedir (§8).
> **KAYNAK/CETVEL:** [rehber-yazisi-standard.md](../standards/rehber-yazisi-standard.md) v0.7 (R2.2–R2.6, R4.5, R4.6, R5.1 3a–3g, R5.3); kapılar `scripts/rehber/rehber-denetim.mjs` ve `scripts/rehber/alinti-dogrula.mjs`.
> **ÖNCEKİ ÇALIŞMA:** BLG-7 (#1791 kapı onarımı, açık), BLG-10 kartı, depo dışı tur kayıtları (`blog-calisma/f5`).

Bu belgenin tek işi şudur: BLG-3'te doğrulama turlarında bulunan her gerçek bulgu, "hangi kapı ya da cetvel maddesi bunu bir daha yakalar" sorusuna bağlanır. Tuzak kolunun (sabotaj) koyduğu satırlar bulgu sayılmaz, tabloya girmez, §4'te ayrıca sayılır.

## 1. Sınıf kuralı

Her bulguya üç sınıftan biri verilir. Karar cetvelin metnine ve kapı betiklerinin koşusuna dayanır, kelime sezgisine dayanmaz.

Sınıf, bulgunun **hangi önlemle** önlenebileceğini söyler; o önlemin bu yazıda koşulup koşulmadığını söylemez. İkincisi §4.1'deki **köken** tablosunda satır kümeleriyle verilir. (İlk sürümde ikinci sınıfa "uygulanmadı" denmişti; bağımsız çürütme turu bunu ölçümle desteklenmediği için düzeltti: tur 4'ün bulguları 25 Eylül'de doğrulanmış metinde zaten vardı, kontroller koşuldu ve kaçırdı.)

| Sınıf | Ölçüt |
|---|---|
| **mevcut bir kapı yakalayabilirdi** | `rehber-denetim.mjs` ya da `alinti-dogrula.mjs`, taslağa koşunca bulgunun **içeriğini** söylerdi. Betik başka bir sebeple cümleyi işaretliyorsa (ör. tablo satırı eksik) bu sınıf sayılmaz. |
| **cetvelde vardı** | Cetvelde **adıyla** geçen bir kontrol bu kalemi kapsıyor: R5.1 3d "sayının bağlamı (model mi seri mi)", "cümle içindeki her iddia ayrı", "olumsuz iddia için açık ifade"; 3a eşlenmeyen iddia; 3b/3c; R2.4 künye alanları (yayıncı, başlık, belge sayfası, adres, erişim tarihi); R2.5; R2.6 ve 3g (AB/TR takvimi, yürürlük, değişiklik); R4.5; R4.6. |
| **yeniydi** | Cetvelde adıyla geçen bir kontrol yok. "DESTEKSİZ sınıfı zaten kapsar" gibi genel bir gerekçe sınıf b için yeterli sayılmaz. |

**Sınır kuralları** (çürütme turundan sonra açıkça yazıldı; **†** ile işaretli satırlar dar okumada c'ye düşer):

- Hüküm **yazılmış ama eksik ya da yanlışsa** b (R2.6 adım 2 "yalnız paketten yazılır" + 3g); **hiç yazılmamış** kapsam cümlesi c, çünkü cetvelde "kapsam tamlığı" adıyla yok. Bu yüzden satır 46 b, satır 19 c.
- Seri, model ya da üretici kapsamının genellenmesi b (3d "model mi seri mi" ve "cümle içindeki her iddia ayrı"): 9, 10, 30, 35, 47. Olasılığın zorunluluk gibi yazılması ya da kesinlik niteleyicisinin düşmesi c (ifade gücü): 11, 12, 31, 39.
- Kaynaksız teknik iddia b (R2.2 son fıkra "her teknik iddia en az bir kaynağa bağlıdır"): 40. Cetvelin "genel" türü bu fıkrayla çelişir (§6.1, K5).
- Cümle içinde alıntıyla örtülen ama kaynakta olmayan yan iddia b (3d "her iddia ayrı"): 36, 44.

## 2. Tablo (48 gerçek bulgu)

| No | Bulgu | Tur | Alt tip | Sınıf | Önerilen kapı ya da cetvel maddesi | Dayanak |
|---|---|---|---|---|---|---|
| 1 | ADH "tek fanda 120.000 m³/h, 2.200 Pa": alt seri (0160–0560) değeri seri/tek fan diye yazıldı | 1 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | R1 ÇELİŞİYOR-2; [4] s.7 |
| 2 | RDH "tek fanda 90.000 m³/h": alt seri (0180–0560) değeri | 1 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | R1 ÇELİŞİYOR-3; [3] s.7 |
| 3 | AT "65.000 m³/h, 2.500 Pa": aile sayfası değeri; seri sayfası 180.000 m³/h, 1.400 Pa | 1 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | R1 ÇELİŞİYOR-4; [2] s.5, s.7 |
| 4 | "Nicotra fanlarındaki rulmanlar 40.000 saat": değer kayışlı seriye ait; DD için 20.000 saat | 1 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | R1 ÇELİŞİYOR-5; [2] s.85, [5] s.67 |
| 5 | 327/2011 eklerinin entegre fanlar için 2037 tarihi: 2025/2481 ile 2027'ye değişmiş, metin eski tüzüğe dayanıyor | 1 | yürürlük/hüküm | cetvelde vardı | R2.3; R2.6 md.3, R5.1 3g; K2 | R1 BAYAT-1; [8] md.9(1), [11] md.1(4) |
| 6 | "DIN ISO 281-1" standart adı güncel değil; yargı ölçülemedi (KAPALI kaynak) | 1 | standart adı | cetvelde vardı | R2.6 (standart kaydı MEVZUAT'ındır); R5.1 3d BAYAT; yargısız bulgu (hüküm ölçülemedi) | R1 BAYAT-2 |
| 7 | Meta açıklamadaki "güncel verimlilik şartları": BAYAT-1'in türevi | 1 | bağlam (türev) | cetvelde vardı | R2.3 | R1 BAYAT-3 |
| 8 | Ek II koşulu düşmüş: AB md.9(1) ve TR geçici md.1(1) "ilk iki paragrafına uygun olarak" yok (satır 78, 135) | 4 | yürürlük/hüküm | cetvelde vardı | R4.6; R2.6 md.3 (3g); K2 | U5 #8,#17,#18; D 10-11 19:27 (1) |
| 9 | "Üretici eğrileri…" genelleme; kaynak yalnız Nicotra AT kataloğu s.99 | 4 | niceleyici genelleme | cetvelde vardı (sınır †) | R5.1 3d (model mi seri mi, her iddia ayrı); K1 | U5 #2; D 19:27 (2) |
| 10 | "Düşük sıcaklıklı ve temiz havalı … doğrudan tahrik uygundur": kaynak yalnız aksiyel fanlar (DOE s.11) | 4 | niceleyici genelleme | cetvelde vardı (sınır †) | R5.1 3d (model mi seri mi, her iddia ayrı); K1 | U5 #1; D 19:27 (5) |
| 11 | "widely" niteleyicisi düşmüş ("geniş ölçüde", DOE s.21) | 4 | niteleyici kaybı | yeniydi | yok; K4 | U5 #4; D 19:27 (3) |
| 12 | "ister" yazılmış, kaynak "suggest" (önerir): kesinlik fazla | 4 | ifade gücü | yeniydi | yok; K4 | U5 #3; D 19:27 (9) |
| 13 | "bakım aralıklarını uzatır": kaynak "intervals between repairs", anlam kaymış | 4 | anlam kayması | yeniydi | yok (R2.3 yalnız birebir alıntı) | U5 #5; D 19:27 (9) |
| 14 | "bir ABD EPA çalışmasında": çalışmanın kaynak yılı yok (1997 dipnotu) | 4 | bağlam (tarih) | cetvelde vardı | R5.1 3d (BAYAT, tarih bağlamı); R2.3 adım 3 | U5 #6; D 19:27 (9) |
| 15 | "Yeni tüzük 24 Temmuz 2026'dan itibaren uygulanır": "genel olarak" ve hüküm kapsamı eksik | 4 | hüküm kapsamı | cetvelde vardı | R4.6; K2 | U5 #7 |
| 16 | Patlayıcı ortam cümlesi "yalnız … ve yalnız …" kapsam listesi gibi okunuyor | 4 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | U5 #9 |
| 17 | "piyasaya arzına ilişkin": kaynak terimi "piyasaya arz edilmesi veya hizmete sunulması" | 4 | terim sadakati | cetvelde vardı (sınır †) | R2.6 adım 2 (mevzuat iddiası yalnız paketten yazılır); terim alanı (§6.1) | U5 #10 |
| 18 | "Tebliğin esas hükümleri 24 Temmuz 2027'de yürürlüğe girer": Md.12/b kapsamı eksik | 4 | yürürlük kapsamı | cetvelde vardı | R2.6; K2 | U5 #11 |
| 19 | Patlayıcı ortam başlığı altında kapsam dışı cümlesi yok | 4 | kapsam eksik | yeniydi | yok (kapsam tamlığı maddesi yok) | U5 #12 |
| 20 | Kayış gerginliği "16 mm/m" ve "iki aşama" üreticiye özgü ölçüt, genel kural gibi yazılmış | 4 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | U5 #13; D 19:27 (4) |
| 21 | "güncel fiyat ürün sayfasında görünür": canlıda 5 aile sayfasında fiyat yok; cetvel R3 "Fiyat" satırı da aynı kuralı taşıyor | 4 | canlı olgu | yeniydi | BLG-9; K5 | U5 #14; D 19:27 (7); orkestratör ölçümü |
| 22 | "ilgili belgeyi isteyin [7][8]": [8] (tüzük) belge isteme önerisini desteklemiyor | 4 | yanlış kaynağa atıf | cetvelde vardı | R5.1 3d; R2.1 | U5 #15; D 19:27 (6) |
| 23 | "Hayır." tek başına: yanıt "Yürürlükten kalktı; iki sınırlı istisna sürer" olmalı | 4 | yanıt biçimi | cetvelde vardı | R4.6 | U5 #16 |
| 24 | Kaynak [1] sayfa listesi yok (basılı s.3, 4, 6–9, 11, 13, 17–24, 32–34, 80) | 4 | künye (sayfa) | cetvelde vardı | R2.4; K3 | U5 #19; D 19:27 (8) |
| 25 | Seri etiketleri [2], [4], [5] belge metninde yok (dosya adından) | 4 | künye (başlık) | cetvelde vardı | R2.4; K3 | U5 #20,#22,#23 |
| 26 | [3] s.5 (kayışlı bilgi) eksik | 4 | künye (sayfa) | cetvelde vardı | R2.4; K3 | U5 #21 |
| 27 | Erişim tarihleri eski (24.09.2026; yeniden çekim 11.10.2026) | 4 | künye (erişim) | cetvelde vardı | R2.3; K3 | U5 #24–26 |
| 28 | Teknik sorumluluk notu "değerler üretici belgelerinde": örnek varsayım istisnası eksik | 4 | varsayım işareti | cetvelde vardı | R2.5 (örnek varsayım); R3 teknik sorumluluk notu satırı | U5 #27 |
| 29 | "iki nokta arasında gidip gelen kararsız davranış": kaynakta yok (DOE s.32) | 5 | kaynakta yok | cetvelde vardı | R5.1 3c, 3d; K5 | U6 #1; D 10-11 19:41 (1) |
| 30 | SSS "Kayışlı Nicotra fanlarının eğrileri": RZR da kapsanıyor (kaynak başlığı ADH/AT/RDH) | 5 | niceleyici genelleme | cetvelde vardı (sınır †) | R5.1 3d (model mi seri mi, her iddia ayrı); K1 | U6 #2; D 19:41 |
| 31 | "bir üstünlüktür": kaynak "can be an advantage", kesinlik fazla | 5 | ifade gücü | yeniydi | yok; K4 | U6 #3 |
| 32 | TR kaldırma hükmü: "24 Temmuz 2027'de yürürlükten kalkacak" ve Ek II kapsamı | 5 | yürürlük kapsamı | cetvelde vardı | R2.6; K2 | U6 #4 |
| 33 | Kaynak [2] künyesi belge metninde yok ("Centrifugal Fans AT, belt driven, Issue 2.5 EN") | 5 | künye (başlık) | cetvelde vardı | R2.4; K3 | U6 #5 |
| 34 | Kaynak [5] yıl eksik (kapak: Issue 1.3, Kasım 2012) | 5 | künye (yıl) | yeniydi (ölçümde b→c) | R2.4; K3 | U6 #6 |
| 35 | e* ölçü işareti yöntemi yalnız düz kayış için tanımlı (AT s.104), genellendi | 6 | niceleyici genelleme | cetvelde vardı (sınır †) | R5.1 3d (model mi seri mi, her iddia ayrı); K1 | U7 #1; D 19:58 (1) |
| 36 | "fan giriş ve çıkış daralmaları" sistem etkisi olarak kaynakta yok (DOE s.6 yalnız dirsek) | 6 | kaynakta yok | cetvelde vardı (sınır †) | R5.1 3d (cümle içindeki her iddia ayrı); K5 | U7 #2; D 19:58 (2) |
| 37 | Mevzuat ve kaynak künyelerinde madde no eksik ([8] md.1(3), 9, 10; [11] md.1(4); [9] md.1, 10–12, geçici md.1) | 6 | künye (madde) | yeniydi (ölçümde b→c) | R2.4; K3 | U7 #6–#8 |
| 38 | "tüm fanları [radyal] [aksiyel] [duman] kategorilerinde": canlıda radyal fanlar Hücreli Aspiratör ve Plug Fanlar kategorilerinde de var | 7 | niceleyici genelleme | yeniydi | yok (site kapsam iddiası maddesi yok); K1, K5 | DG8 #1; D 20:06 (A) |
| 39 | "Büyük seçilen fan … uzakta çalışır": olasılık zorunluluk gibi yazılmış (DOE s.33) | 7 | ifade gücü (olasılık → zorunluluk) | yeniydi (ölçümde b→c) | R5.1 3d; K4 | DG8 #2; D 20:14 (2) |
| 40 | "her biri teklif edilen fanı ya da kurulumu değiştirir": kaynaksız sentez; cetvel "genel" türünü sınırsız kabul ediyor | 7 | kaynaksız ifade | cetvelde vardı (sınır †) | R2.2 son fıkra ("her teknik iddia kaynağa bağlıdır"); R5.1 3a; K5 ("genel" tür sınırı) | DG8 #3; D 20:06 (E4), 20:14 (3) |
| 41 | "çift logaritmik bir diyagramda gösterilir" (özne-yüklem) | 8 | dil | yeniydi | yok (üslup kapısı yok) | DG9 #1; D 10-12 09:41 (satır 50) |
| 42 | TR: "24 Temmuz 2027'de yürürlüğe girer" cümlesinde o tarihe kadar eski tebliğin yürürlükte kalması yok | 8 | yürürlük durumu | cetvelde vardı | R2.6 | DG9 #2; D 09:41 (satır 82) |
| 43 | "kayışlı fanlarında doğru gerginlik": kayış tipi (kama) belirtilmemiş; doğrulayıcı B PDF görselini açamadı, orkestratör buldu | 8 | niceleyici genelleme | cetvelde vardı | R5.1 3d; K1 | DG9 #3; D 10:02 (kör nokta), 10-11 20:24 |
| 44 | Patlayıcı ortam belge isteme cümlesinde [8] atfı yok (R5.1 3b kapsamı "isteyin" fiilini içermiyor) | 8 | atıfsız öneri (yan cümle) | cetvelde vardı (sınır †) | R5.1 3d (cümle içindeki her iddia ayrı), 3a; 3b cümle düzeyinde kalır, K5 yan cümleye genişletir | DG9 #4; D 09:41 (satır 115) |
| 45 | Kaynak [6] s.44–45 (F400/120 sertifikası) eksik | 8 | künye (sayfa) | cetvelde vardı | R2.4; K3 | DG9 #5; D 09:41 |
| 46 | Patlayıcı ortam: kapsam koşulu eksik ("yalnız o ortamda çalışmak üzere … özel tasarlanıp pazarlanmış") | 9 | kapsam koşulu | cetvelde vardı (sınır †) | R2.6 adım 2, 3g, R4.6; K2 | DG10 #1; D 10-12 10:02 (1) |
| 47 | SSS "AT, ADH ve RDH" verim kuralı [2] ile atfedilmiş; [2] yalnız AT kataloğu | 9 | yanlış kaynağa atıf | cetvelde vardı (sınır †) | R5.1 3d (model mi seri mi, her iddia ayrı); K1 | DG10 #2; D 10:02 (2) |
| 48 | TR "ile düzenlenir" → "düzenlenmiştir": esas hükümler 24.7.2027, o güne kadar önceki tebliğ yürürlükte | 9 | yürürlük durumu | cetvelde vardı | R2.6 | DG10 #3; D 10:02 (3) |

**Dayanak sütunu:** R1–R3 = depo dışı `f5/dogrulama-rapor-N.md`; U5/U6/U7 = depo dışı `f5/uygula-tur5/6/7.py` (#sıra); DG8/9/10 = depo dışı `f5/degisiklik-8/9/10.json` (#sıra); "D hh:mm" = o turun saatli durum kaydı. Bu dosyalar depo dışıdır; depodaki doğrulanabilir karşılığı bu belgedir.

## 3. Sayımlar (yeniden ölçüldü)

| Tur | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Toplam |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Gerçek bulgu | 7 | 0 | 0 | 21 | 6 | 3 | 3 | 5 | 3 | 0 | **48** |

| Sınıf | Satır | Pay |
|---|---|---|
| mevcut bir kapı yakalayabilirdi | 0 | %0 |
| cetvelde vardı | 37 | %77,1 |
| yeniydi | 11 | %22,9 |

Bunların 10'u sınır (†) satırdır (9, 10, 17, 30, 35, 36, 40, 44, 46, 47): dar okumada b 27, c 21 olur (%56 / %44). "Mevcut kapı yakalayabilirdi = 0" her okumada aynıdır. Satır 11 ters yönde sınırdır (c; olumsuz iddia deseni cümlede ateşliyor ama kaynakta açık ifade var, bozulan niteleyici: K4).

| Alt tip | Satır | Pay |
|---|---|---|
| niceleyici genelleme (tek, tüm, yalnız, seri ya da model kapsamı) | 12 | %25,0 |
| künye (sayfa, başlık, yıl, madde no, erişim) | 8 | %16,7 |
| yürürlük ve hüküm kapsamı | 7 | %14,6 |
| ifade gücü, anlam ya da terim kayması | 6 | %12,5 |
| yanlış kaynağa atıf | 2 | %4,2 |
| kaynakta yok | 2 | %4,2 |
| diğer (kapsam eksik, kapsam koşulu, bağlam, canlı olgu, varsayım işareti, standart adı, dil, atıfsız öneri, yanıt biçimi, kaynaksız ifade) | 11 | %22,9 |

Tur 4'ün 21 satırı 27 değişiklik çiftinden gelir: iki künye satırı (25, 27) ve Ek II satırı (8) üçer çifti tek bulguya bağlar. Tur 6'nın 8 çiftinden 3'ü bağlantı metni hizalamasıdır, bulgu sayılmadı; tur 7'nin 5 çiftinden 2'si not niteliğindedir (Vortice atfı, [8] kaldırma satırı), bulgu sayılmadı.

## 4. Yeniden ölçüm: ne ölçüldü, ne bulundu

Araştırmacının sayıları hafızadan ve durum metninden çıkmıştı. Bu belge için şunlar ham dosyadan yeniden ölçüldü:

| Ölçüm | Yöntem | Sonuç |
|---|---|---|
| Bulgu çifti sayısı | `uygula-tur5/6/7.py` ve `degisiklik-8/9/10.json` ayrıştırıldı | tur 4: 27 · tur 5: 6 · tur 6: 8 · tur 7: 5 · tur 8: 5 · tur 9: 3. Araştırmacının tablosuyla uyuyor (§3 notu). |
| Her çiftin eski cümlesi ilgili taslakta var mı | `taslak-turN-11-ekim.md` içinde aranıyor | tur 4–9, 54 çiftin 54'ünde var. |
| Tuzak sayısı | `tuzaklar-N-GIZLI.json` | tur 1–3: 4'er · tur 4: 5 · tur 5–10: 6'şar; toplam 53. |
| Tur 1 rapor dökümü | `dogrulama-rapor-1.md` | 11 satır (DESTEKSİZ 3, ÇELİŞİYOR 5, BAYAT 3); bunların 4'ü tuzak (%40'a yükseltilen dirsek etkisi, [3]→[4] atıf, AT→DD yoğunluk, DD rulman yağlama), 7'si gerçek. Tabloyla uyuyor. |
| `rehber-denetim.mjs` her turun taslağında | `denetle(md, {iddialar})` tur 4–10 taslakları ve iddia tablolarıyla koşuldu | **tur 4: 0 kırmızı**, 27 çiftin 27'sinde kapı çıktısı bulguya değmedi. **Tur 5–10: her turda 2 mevzuat cümlesi** `MEVZUAT-IDDIA-TABLODA-YOK` (aynı iki cümlenin tur tur düzeltilmiş biçimleri). |

**Kapı çıktısının okunuşu.** Tur 5–10'daki iki kırmızı, uzun mevzuat cümlelerinin iddia tablosunda parça parça (başka sözcüklerle, "..." ya da parantezle) girilmiş olmasından gelir; betik tablodaki metni cümlenin alt dizisi olarak arar. Bulgunun içeriğini söylemez. Yalnız tur 5'te bir çift (satır 32, "tebliğin Ek II'sinin ilk iki paragrafına uygun olarak…" cümlesi) bu kırmızıya dolaylı değdi; sebep tablo eksiği olduğu için sınıf **a sayılmadı**. İki ek ölçüm (çürütme turu):

- **Kapı düzeltmeyi cezalandırdı.** Tur 5–10'daki iki kırmızıdan biri satır 17'nin **düzeltilmiş** cümlesidir ("piyasaya arz edilmesi veya hizmete sunulması"); tur 4'te yanlış cümle yeşil, doğru cümle kırmızı çıktı. Sebep yine tablo girdisinin alt dizi eşleşmemesidir; kapı kendi tablosuyla tutarlı olmayan düzeltmeyi hata sayıyor.
- **`MEVZUAT` deseni "tüzük" ve "direktif" içermiyor** (`rehber-denetim.mjs` satır 107: zorunlu, yasak, yönetmelik, mevzuat, kanun, tebliğ). AB tüzüğü cümleleri (satır 5, 8, 15, 23) `ATIFSIZ-IDDIA` ve `MEVZUAT-IDDIA-TABLODA-YOK` kapsamının dışındadır; kapı bu cümleleri hiç görmüyor. Desen genişlese bile bulgunun içeriğini (Ek II koşulu, değişiklik) söylemez: sınıf a değişmez, ama BLG-7 onarımının kapsamıdır (§6, K0b).

**`alinti-dogrula.mjs` (fonksiyon düzeyi).** Ağ yolu koşulmadı; `alintiBul` ve `hukum` yerel kaynak kopyalarıyla tur 4–10 tablolarına koşuldu: tur 4 GECTI 114, INCELE 7, KALDI 0; tur 5–10 INCELE 9–10, KALDI 0. Tur 4'ün INCELE'lerinden üçü satır 8'in üç çiftidir ve çevre metni Ek II koşulunu ekrana basar; satır 32'nin cümlesi için 24/7/2027'yi basar. Betik kanıtı **gösteriyor, hüküm vermiyor** (işaret kelime sezgisinden); §1'in "başka sebeple işaretliyorsa a sayılmaz" kuralı gereği sınıf **a verilmedi**, ama bu satırlar "betik içeriği ekrana basıyordu, kimse hükmetmedi" kümesidir (§7).

**Kapsam sınırı.** Koşu tur 4–9'un 41 satırında yapıldı (tur 10'da bulgu yok). Tur 1'in 7 satırı için tuzaklı doğrulama kopyası (`taslak-dogrulama-kopyasi-1.md`) `f5`te var ve satırların cümleleri içinde; ama tur 1 anındaki 105 satırlık iddia tablosu diskte yok (eldeki `iddialar.json` tur 3 sonrasıdır), bu yüzden orada kapı hükmü ölçülemedi. Kopyaya eldeki tabloyla koşunca 6 kırmızı çıktı: 1'i tuzak, 5'i `IDDIA-KAYNAGI-LISTEDE-YOK` ([11]); bunlar tablo-metin uyuşmazlığıdır, bulgu içeriği değil. "a yok" hükmü tur 1 için kod okumasından gelir.

### 4.1 Köken: kontrol koşuldu mu?

Aşağıdaki tablo her satırı **o satırın cümlesinin 25 Eylül'de doğrulanmış metinde (`f5/taslak.md`, sha256 66b819a57e6d…) olup olmadığına** göre kümeler. Çürütme çalışanı 41 bulgunun eski cümlelerini bu metinde aradı; bu belgenin yazarı beş satırı ham dosyada ayrıca doğruladı (41, 44, 46, 47 ve satır 8'in "ilk iki paragraf" ifadesinin 25 Eylül metninde ve tur 4 metninde bulunmaması; tur 4 metni 25 Eylül metninden 18 fark satırıyla ayrılır).

| Köken | Satırlar | Sayı | Okuma |
|---|---|---|---|
| Tur 1'de yakalandı | 1–7 | 7 | Süreç çalıştı: doğrulama turu bulguyu yazımdan sonra yakaladı. Önlem yazım aşamasında olmalıydı. |
| 25 Eylül metninde vardı, kontroller koşuldu ve kaçırdı | 8–28 (21) ve 29, 30, 31, 32, 34, 36, 37, 38, 39, 40, 42, 43, 45, 48 (14) | 35 | Tur 1–3, 3f ve 3g (MEVZUAT "doğru") koştu; bu cümleler geçti. Sonradan tur 4 (farklı brifle) ve sonraki turlar yakaladı. |
| Düzeltmenin yan ürünü | 33, 35, 41, 44, 46, 47 | 6 | Eski cümle metinde yok, bir düzeltmeyle girdi. R5.1 adım 5 (tam yeniden tur) bunlar için var ve yakaladı. |

Ek: satır 16 ve 30'da düzeltici, doğrulayıcının önerdiği ifadeyi uyguladı ve o ifade sonradan bulgu oldu (tur 1 ifade notu 1 ve 9, tur 3 DESTEKSİZ-2); doğrulayıcı önerisi de kontrol gerektirir.

Bu üç kümenin hiçbiri "yazar cetveli okumadı" demek değildir. En ağırı ikincisidir: 35 bulgu, cetvelde adıyla olan kontroller koşulduktan sonra geçmişti. Üstelik tur 1–3'ün "ifade notu" ve "eşlenmeyen iddia" listelerinde (tur 1: 14 + 11, tur 2: 8 + 3) bulgu sayılmayan kalemlerden en az üçü (14, 22, 40) sonradan bulgu oldu; yani görülüp not düşülen, düzeltilmeyen kalem sonradan bulgu oldu. Bu belgenin "gerçek bulgu" tanımı bu notları saymaz (§5).

**Araştırmacıdan farklar (7 satır).** Araştırmacının sonucu a 0 / b 36 / c 12 idi. İlk yeniden ölçümde 6 satır b→c yapılmıştı; bağımsız çürütme turu (§4.1) sonrası 9, 10, 35 geri b'ye döndü ve dört satır c→b oldu. Net: b 37, c 11.

| Satır | Araştırmacı → bu belge | Neden |
|---|---|---|
| 39 | b → c | Olasılığın zorunluluk gibi yazılması (ifade gücü) adıyla yok; 11, 12, 31 ile aynı sınıf. |
| 34 | b → c | R2.4 künye listesinde yayın yılı yok. |
| 37 | b → c | R2.4 listesinde madde numarası yok; R4.6 yalnız resmî metne atıf ve yürürlük tarihi ister. |
| 6 | c → b | R2.6 standart kaydının sahibini MEVZUAT yazar; 3d BAYAT sınıfı adıyla var. Hüküm ölçülemedi (yargısız bulgu). |
| 17 | c → b | Mevzuat terimi R2.6 adım 2 "yalnız paketten yazılır" kapsamında; paketteki terim "piyasaya arz edilmesi veya hizmete sunulması". |
| 40 | c → b | R2.2 son fıkra: her teknik iddia kaynağa bağlıdır; tur 1 raporu aynı cümleyi E4 olarak işaretlemişti. |
| 44 | c → b | Yan cümlede kaynaksız öneri: 3d "cümle içindeki her iddia ayrı" ve 3a; 3b yalnız cümle düzeyindedir, bu betik açığıdır (K5). |

## 5. Ölçülemeyenler

- **Tur 4–10 ham doğrulayıcı çıktısı diskte yok** (yalnız `metin.md`, `GOREV-A/B/C.md`). Bulguların kaynağı değişiklik dosyaları ve tur özetleridir; hangi doğrulayıcının hangi bulguyu bulduğu bazı satırlarda belirsizdir (50, 82, 115, [6] s.44 ve tur 9'un üç bulgusu).
- **Tuzak yakalama oranı** (tur başına 4–6 tuzak) ham çıktı olmadığı için yeniden ölçülemedi; yalnız tuzak sayısı ölçüldü (53).
- **`alinti-dogrula.mjs` ağ yolu** (kaynak adresini çekme, yönlendirme zinciri, canlı `sonGüncelleme`) koşulmadı; yalnız fonksiyon düzeyi yerel kopyalarla koşuldu (§4). Yönlendirme zinciri ek INCELE verebilir. Bulgu cümlelerinin tabloda sınanacak alıntısı olmaması (en yakın tablo girdisiyle sözcük benzerliği ≤0,1: satır 13, 29) betiğin onları göremeyeceğini söyler, kanıtı koşu değil okumadır.
- **Tur 1 anındaki iddia tablosu** (105 satır) diskte yok; tur 1'in 7 satırı için kapı hükmü onsuz kesinleşmez. R2.6/3g 25 Eylül 12:58'de (v0.6) girdi; satır 5 ve 7'nin tur 1'de hangi cetvel sürümüyle geçtiği saat düzeyinde ölçülemedi (R2.3 v0.3'ten beri var).
- **"Gerçek bulgu" tanımı turlar arasında aynı değil.** Tur 1–3 raporları "ifade notu" ve "eşlenmeyen iddia" listeleri taşır (tur 1: 14 + 11, tur 2: 8 + 3) ve bu belge bunları saymaz; tur 4'ten itibaren aynı türdeki kalemler sayıldı. Tur 2 ve 3'ün "0 gerçek bulgu" değeri bu tanımdan gelir. Ayrıca satır 5 ile 7 aynı kökün, 25 ile 33 aynı künyenin, 8, 32, 42, 48 aynı geçiş hükmü zincirinin halkalarıdır: 48 satır 48 bağımsız bulgu değil, kök sayısı daha düşüktür (41 çiftten türeyen 7 çift/zincir elemanı).
- **Tur 4 brifi** (`tur4-brief.md`) R5.1'de olmayan iki adım taşır: sayfa listesi ve atıfsız cümle taraması. Künye satırlarının (24, 26, 45) tur 1–3'te kapanmaması bu prosedür farkından mı geldiği ölçülemedi.
- **Satır 30 ve 47'nin içeriksel doğruluğu:** kaynak sayfa ortak blok (aynı "Description" metni, tabloda RZR sütunu var); RZR'nin kapsanıp kapsanmadığı ölçülmedi. Satır 6 (DIN ISO 281-1 güncelliği), 38 (canlı sayfa) ve 21 (canlı fiyat) yeniden ölçülmedi.
- **Rehber-denetim'in gerçek akışta koşulup koşulmadığı kayıtlı değil.** Taslak depoya girmediği için CI betiği taslağa koşmaz; cetvel R5.3 "numarasız iddia 0" der, koşu kaydı yoktur. Bu, kapı adayı K0'ın (aşağıda) gerekçesidir.
- **Sınıfı kararsız satırlar:** 6 (kapalı kaynak, standardın güncelliği ölçülemez; hüküm yok), 21 (cetvelin R3 satırı da yanlıştı), 11 (c; olumsuz iddia deseni ateşliyor ama kaynakta açık ifade var, bozulan niteleyici) ve † ile işaretli on satır (§3).
- Tur 1 ve tur 3 asıl dosyaları `f5`te yok; tuzak eşlemesi rapor metninden.

## 6. Kapı ve cetvel adayları (projeksiyon, ölçüm değil)

Adaylar, bulgu satırlarının "Önerilen kapı ya da cetvel maddesi" sütunundaki etiketlerden toplandı. Etiketli satır sayısı bir kapının yakalayacağı sayı **değildir**; kapı yazılıp sabotajla sınanana kadar iddia edilmez.

| Aday | Ne yapar | Etiketli satır | Tur |
|---|---|---|---|
| K0 | Taslağa `rehber-denetim.mjs` koşusunu her turda zorunlu yapar ve çıktısını doğrulama kaydına yazar; uzun mevzuat cümlesi tablo girdisine alt dizi olarak eşleşmediğinde kapı parça parça girişi de kabul eder ya da cümleyi bölmeyi ister | ölçüm bulgusu (satır 32 dolaylı) | 5–10 |
| K0b | `MEVZUAT` deseni "tüzük", "direktif", "regulation" ve karar numarası kalıplarını (ör. 2024/1834, 2014/34/AB) kapsar; atıfsız ya da tabloda eşleşmeyen AB metni cümlesi kırmızı olur. Aynı onarımda "uzun cümle parça parça girilmiş" alt dizi eşleşmesi için K0'daki çözüm uygulanır | ölçüm bulgusu (satır 5, 8, 15, 23 deseni hiç görmüyor) | 1, 4 |
| K1 | Niceleyici ya da seri/model adı taşıyan her tablo satırında kapsam alanı (seri/model adı + kaynak başlığı) zorunlu | 13 | 1, 4, 5, 6, 7, 8, 9 |
| K3 | Künye alanları (başlık, yıl, basılı ve PDF sayfası, madde no, erişim tarihi) kaynak dizini manifestosundan otomatik doldurulur; yazı-liste farkı betikle ölçülür | 8 | 4, 5, 6, 8 |
| K2 | Her tüzük/tebliğ cümlesinde AB ve TR takvimi ayrı alanda, değiştiren tüzük no ve 3g sonucu zorunlu | 6 | 1, 4, 5, 9 |
| K5 | "Genel" tür satırlarında sınırlı liste; site kapsamı ve canlı olgu iddiasında DB + canlı ölçüm alanı; öneri fiillerinde `[n]` zorunlu (R5.1 3b genişletmesi) | 6 | 4, 5, 6, 7, 8 |
| K4 | Kaynak alıntısındaki kesinlik/niteleyici (suggest, can, widely, may, only) Türkçe karşılığıyla sözlükle eşlenir; kesinlik artışı kırmızı | 4 | 4, 5, 7 |

Sınıf **cetvelde vardı** olan 37 satır için kapı yoksa cetvel yetmediğinin kanıtıdır; bunların bağlantısı tablonun son sütunundadır. İlk sürümde bu sınıf "uygulanmadı" diye okunmuştu; §4.1 köken tablosu 35 bulgunun kontroller koşulduktan sonra geçtiğini gösterir. Yani çare "cetveli daha çok uygula" değil, **koşan kontrolün kaçırdığı yeri belirlenimci bir kapıyla kapatmaktır** (K1–K5).

### 6.1 "Yeniydi" sınıfının bağlanacağı yer

Cetvelde adıyla yeri olmayan satırların (sınıf c: BLG-3'te 11, frekansta 5, toplam 16) her biri tek bir yere bağlanır; öncelik sırası kapı > cetvel maddesi > hafıza. Sınıf b satırlarının bağlantısı ana tablonun "Önerilen kapı ya da cetvel maddesi" sütunundadır (K1–K5 etiketleri, §6).

| Satırlar | Bağlanacağı yer | Tür | Sahibi | Ölçüt (kabul) |
|---|---|---|---|---|
| F2, F7 (ve b satırları 9, 10, 30, 35, 47) | **K1:** iddia tablosuna zorunlu `kapsam` alanı (seri/model/ortam/uygulama noktası); "tüm, yalnız, her, tek, en yaygın" gibi niceleyici taşıyan cümlede alıntının aynı kapsamı söylediği gösterilmezse kırmızı. R5.1 3d'ye "kapsam" adıyla alt madde | kapı + cetvel | BLOG | `rehber-denetim.mjs` iddia şeması + INV testi; sabotaj: kapsamı daraltılmış alıntıyla genel cümle kırmızı yanar |
| 11, 12, 31, 39 ve F5, F6 | **K4:** alıntıdaki kesinlik sözcüğü (suggest, can, may, widely, generally, up to, must) ↔ Türkçe karşılığı sözlükle eşlenir; kesinlik artışı ya da azalışı `INCELE`. R2.3'e "kesinlik düzeyi" maddesi | kapı + cetvel | BLOG | `alinti-dogrula.mjs` INCELE kolu; yanlış pozitif ölçümü yapılmadan bloklamaz |
| F8 | R5.1 3d'ye "aralık mı, ayrık değerler mi" alt maddesi (kaynakta 2, 4, 8, 16 kHz yazan yerde "2 ile 16 arasında" yazılmaz) | cetvel (kapı yazılamaz: sözlükle yakalanmaz) | BLOG | doğrulayıcı brifinde açık soru; sabotaj kolunda bu türden tuzak |
| 13 (ve b satırı 17) | **Terim sadakati:** iddia tablosuna `kaynak_terimi` alanı (alıntıdaki terim → yazıdaki terim); mevzuat terimi MEVZUAT paketindekiyle birebir (R2.6 adım 2'ye madde) | cetvel + tablo alanı | BLOG + MEVZUAT | kapı yazılamaz (anlam kayması betikle yakalanmaz); doğrulayıcı 3d çıktısında terim satırı |
| 19 | R2.6 adım 1 paket çıktısına "kapsam dışı koşulları" satırı; yazının mevzuat bölümünde karşılığı yoksa **K2** kırmızı | cetvel + kapı | MEVZUAT + BLOG | MEVZUAT paketi şeması; K2 iddia alanı |
| 34, 37 | R2.4 künye listesine yayın yılı ve mevzuatta madde numarası; **K3** künyeyi kaynak dizini manifestosundan doldurur | cetvel + kapı | BLOG | yazı listesi ↔ manifest farkı betikle 0 |
| 38 | **K5:** site/ürün kapsamı iddiası `canli_olcum` alanı ister (DB sorgusu + canlı sayfa); R4'e "site kapsamı iddiası canlı ölçülür" maddesi | cetvel + kapı | BLOG | ölçüm komutu iddia satırında kayıtlı |
| 21 | BLG-9: R3 "Fiyat" satırı düzeltilir (fiyatın ürün sayfasında görünmesi iddiası canlı ölçüme bağlanır); **K5** canlı olgu alanı | cetvel (BLG-9, OPS onayı) | BLOG | 5 aile sayfasında canlı ölçüm |
| 41 | Dil/üslup (özne-yüklem uyumu): deterministik kapı yazılamaz. **Hafıza:** sage dersi (audience BLOG) + doğrulayıcı brifine satır | hafıza | BLOG | kapı yok, dürüstçe böyle yazılır |

Özet (c sınıfı: BLG-3 11 + frekans 5 = 16): kapıya dönenler 13 (kapı + cetvel maddesi birlikte: K4 6 · K1 2 · K2 1 · K3 2 · K5 2), yalnız cetvel 2 (F8, 13), hafıza 1 (41). Sınıf b için ayrıca (ana tabloda) K5 bu belgenin ürettiği üç ek kural taşır: "genel" tür sınırı (40), yan cümle atfı (44; `rehber-denetim.mjs` ATIFSIZ-IDDIA desenine öneri fiili listesi), standart adı güncelliği MEVZUAT paketinden (6).

## 7. Okuma

- Mevcut kapılar, koşulabilen 41 satırın (tur 4–9) hiçbirinin içeriğine **hüküm vermedi**; `alinti-dogrula.mjs` satır 8 ve 32 için çevre metnini ekrana bastı (INCELE) ama hükmü kelime sezgisine bıraktı, `rehber-denetim.mjs` hiçbir bulguya değmedi. Tur 1'in 7 satırı için hüküm kod okumasına dayanır. BLG-10'un "kapıya dönen ders öncelikli" önermesi bu veriyle ancak **yeni kapılar yazılırsa** tutar. BLG-7 onarımı (#1791) sonrasında aynı koşu yeniden yapılacak; o ölçüm olmadan onarımın bu satırlara etkisi hakkında hüküm verilmez.
- **Asıl ders kontrol sayısı değil, kontrolün gücüdür.** 41 bulgunun 35'i, cetvelde adıyla olan kontroller koştuktan sonra geçti (§4.1); tur 4 farklı bir brifle (sayfa listesi + atıfsız cümle taraması) bu 21 bulguyu bir turda yakaladı. Çare "daha çok doğrulayıcı" değil: belirlenimci kapı (K1–K5) ve, olası ama ölçülemedi (§5), tur 4 brifindeki iki adımın R5.1'e taşınmasıdır. Düzeltmeler 6 yeni bulgu üretti: R5.1 adım 5 (tam yeniden tur) bu yüzden gereklidir.
- Bulguların büyük kısmı üç kalıptan gelir: niceleyici genelleme (%25), künye (%17), yürürlük kapsamı (%15). K1, K3, K2 adayları bu üç kalıbın karşılığıdır.
- İki yazıda aynı kalıplar tekrar etti: kapsam/niceleyici genelleme (BLG-3 13 satır, frekans 3), künye (8 ve 2), yürürlük kapsamı (7 ve 1), kesinlik kayması (K4: 4 ve 3). Bu, kapı adaylarının yazıya özgü değil rehber türüne özgü olduğunu gösterir; örneklem iki yazıdır, küçüktür.
- Bu tablo "tur sayısı ≤3" ölçüsünün tabanıdır: BLG-3 tur 4–10 arasında 7 tam tur gerektirdi. Üçüncü yazıda ölçü, hangi adayların yazıldığına bağlıdır; yazılmayan aday için ölçü verilmez.

## 8. Frekans yazısı (BLG-4) bulguları

Ham kayıt depo dışı `f4` altındaki yedi doğrulama raporudur (tur 1–7, 24–25 Eylül). Salt-okuma çalışan çıkardı; sınıf kuralı §1'dir ve BLG-3 ile aynı biçimde uygulandı: çalışanın "sınır" diye b verdiği iki satır (F2 konum bağlamı, F7 "en yaygın" kapsam genellemesi) sayı bağlamı olmadığı için **c** yapıldı. Satır numaraları "F" önekiyle yazılır.

| No | Bulgu | Tur | Alt tip | Sınıf | Önerilen kapı ya da cetvel maddesi | Dayanak |
|---|---|---|---|---|---|---|
| F1 | FC 51 IP55 (uzaktan montaj kiti değeri) sürücü gövdesinin koruma sınıfı gibi yazıldı (gövde + tablo hücresi) | 1 | bağlam | cetvelde vardı | R5.1 3d (sayının bağlamı); K1 | rapor-1 §2 Ç3–Ç4; [5] s.33, s.35 |
| F2 | Tip B RCD "sürücü çıkışında" yazıldı; kaynak besleme (şebeke) tarafı diyor | 1 | bağlam (konum) | yeniydi | K1 (kapsam alanına uygulama noktası) | rapor-1 §2 Ç5; [1] s.82, s.94 |
| F3 | "sürücülere yönelik IE2 şartı bu değişikliklerle değişmedi": olumsuz iddia, açık ifade yok | 1 | kaynakta yok (olumsuz) | cetvelde vardı | R4.5; R5.1 3d (olumsuz için açık ifade); K5 | rapor-1 §2 D4 |
| F4 | [11] IEC künyesinde başlık kısaltılmış | 2 (3–6'da tekrar) | künye (başlık) | cetvelde vardı | R2.4 (başlık); K3 | rapor-2 §3; **AÇIK, canlıda ölçüldü** |
| F5 | "akım düşürme gerektirir": kaynak "Consider derating" | 3 | ifade gücü | yeniydi | K4 | rapor-3 §4 not b |
| F6 | CT yarı hızın altında "ek hava soğutması gerekebilir": kaynak "must be supplied" (zayıflatma) | 3 | ifade gücü | yeniydi | K4 | rapor-3 §4 not d |
| F7 | "değişken hız sürücülerinin en yaygın türü frekans konvertörüdür": kaynak "en yaygın biçimi"; gövde + SSS | 5 | niceleyici genelleme | yeniydi | K1 | rapor-5 §2 D3 |
| F8 | "FC 51'de bu değer 2 ile 16 kHz arasında seçilebilir": kaynakta 4 ayrık değer | 5 | ifade gücü (aralık/ayrık) | yeniydi | R5.1 3d'ye alt madde (§6.1) | rapor-5 §4 N1 |
| F9 | "Tebliğin maddelerinin çoğu 1 Temmuz 2021'de yürürlüğe girmiştir": sürücü şartı 15 Ağustos 2021'e ertelenmişti; **tur 4 "doğrulandı" dedi, kaçırıldı** | 4 (tur dışında bulundu) | yürürlük/hüküm | cetvelde vardı | R4.6; R2.6 + 3g; K2 | rapor-4 §4 Y7 |
| F10 | FC 102 için kılavuz kapsamı (355–800 kW) yazılmadan FC 102 ailesi (11–90 kW) için PID/kademe genellemesi | 6 | bağlam (kaynak kapsamı, model mi seri mi) | cetvelde vardı | R5.1 3d; K1 | rapor-6 §4 bağlam notları |
| F11 | "ABD Enerji Bakanlığı'nın pompa rehberi": kaynak üç kurumun ortak yayını | 6 | künye (yayıncı) | cetvelde vardı | R2.4 (yayıncı); K3 | rapor-6 §4 |

| Ölçü | Değer |
|---|---|
| Gerçek bulgu | 11 (tur 1: 3 · tur 2: 1 · tur 3: 2 · tur 4: 0 + 1 kaçırılan (F9) · tur 5: 2 · tur 6: 2 · tur 7: 0) |
| Sınıf | mevcut bir kapı yakalayabilirdi 0 · cetvelde vardı 6 · yeniydi 5 (F2 ve F7 sınırda: 3d "her iddia ayrı" geniş okunuşu b yapardı) |
| Tuzak (tabloya girmez) | 26 (7 turda 4, 4, 4, 4, 4, 3, 3); yakalanan 26, çalışanın rapor metninden eşlemesi |
| BLG-3 ile birlikte | 59 gerçek bulgu: kapı 0 · cetvelde vardı 43 (%73) · yeniydi 16 (%27); sınır satırlar (†) dar okumada cetvelde vardı 33, yeniydi 26 |

**Frekans yazısına özgü ölçülemeyenler.**

- Kapı betikleri frekans taslaklarına koşulamadı: tur 1, 2, 3, 5 asıl dosyaları ve her tur için iddia tablosu `f4`te yok. "Kapı 0" hükmü sentetik cümlelerle yapılan betik denemesi ve kod okumasından gelir; BLG-3'teki gibi taslak koşusu değildir. Çalışanın denemesi: olumsuz iddia deseni "gerekmez/gerektirmez" cümlelerini işaretler, F3'teki "değişmedi" fiilini işaretlemez.
- Tur 7 yalnız değişen bölgeleri doğruladı; R5.1 adım 5 ("tüm metin") karşılanmadı, sayı alt sınırdır.
- F9'u bulan kanal kayıtlı değil (tur dışında bulundu).
- Sayılmayan "sınır" kalemler (13): kesinlik ya da kapsam açısından kayıt notu olan ama bulgu sayılmayanlar, en önemlileri: TR tebliğ Ek-I ham metni yok (IE2 sayısal şartı doğrulanamadı, atıf çıkarıldı), 2023/3 değişikliğinin yazıda anılmaması MEVZUAT kararında, FC aile/kategori sayfası iddiası canlı ölçülmedi.
- **Yayındaki frekans yazısında bilinen açık kalem:** F4 (canlıda ölçüldü, 13 Ekim: [11] künyesi "Part 3: EMC requirements (kapsam sayfası)" kısa başlıkla duruyor). İki kayıt notu da canlıda duruyor ("tasarruf ayrıca hesaplanmalıdır" ve kaynaksız "toplam maliyete kurulum da girer" cümlesi); bunlar bulgu sayılmadı. Düzeltme R5.5 uyarınca ayrı revizyon olarak aynı doğrulama akışından geçer; kart ayrıca açılır.
