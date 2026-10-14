# BLG-12 başlık öneri tablosu — yayındaki iki rehber yazısının H2 ve SSS başlıkları

> **Sahibi:** BLOG. **Kart:** BLG-12. **Durum:** ÖNERİ; yazıldığı gün 2026-10-14. **Yayına girmez:** başlık değişikliği Recep onayıyla, OPS üzerinden girer (cetvel R11.5). Bu belge yazının içeriğini ve adresini değiştirmez.
> **KAYNAK/CETVEL:** [rehber-yazisi-standard.md](../standards/rehber-yazisi-standard.md) v0.9 R11 (resmî dayanak, İLKE kuralları, `baslikDenetle` UYARI kolu). Tazelik: Google belgeleri 2026-10-14'te ham HTML'den okundu (R11.1).
> **ÖNCEKİ ÇALIŞMA:** BLG-3 ve frekans yazısının bulgu tablosu (`blg3-bulgu-tablosu-2026-10.md`; başlık kuralı yoktu), BLG-11 R10.

## 1. Neye göre yazıldı

R11'in kuralları İLKE sınıfındadır; Google'ın belgelerinde alt başlık (H2/H3) için konu ifadesi şartı ve sayısal eşik **yoktur** (R11.2). Öneri, okuyucunun başlığı tek başına gördüğü üç yerde anlamlı kalması ilkesine dayanır: içindekiler, sayfa içi bağlantı ve başlığın arama sonucunda bölüm bağlantısı olarak görünebilmesi. Dayanak satırları R11.1'de: başlıklar gezinmeye yardım eder (5), bağlantı metni gideceği yeri anlatır (8), doğal olmayan tekrar doldurmadır (10, 11).

**Üç ölçüt, her satırda uygulandı:**

- Başlık tek başına okunduğunda hangi konudan söz ettiği anlaşılıyor mu (Y2)?
- Konu terimi doğal yerinde mi, aynı ifade başlıkların çoğunda tekrar ediyor mu (Y3)?
- Önerilen başlık, bölümün zaten söylediğinden fazlasını iddia ediyor mu? Edenler önerilmedi (yeni iddia, yeni sayı ve yeni marka yok).

## 2. Ölçüm (bugünkü başlıklar ve öneri, `baslikDenetle`)

**Search Console ile çapraz kontrol (GEO-SEO, 14 Ekim, SEO-49):** iki yazıda adı görünen sorgu 2, öneriyle çelişen başlık yok. Veri çok ince olduğu için bu bir doğrulama değildir; radyal yazısı için henüz hiçbir sorguda gösterim yok. Sorgu cümleleri depoya yazılmaz (P6).

| Yazı | H2 (zorunlu bölümler hariç) | Konu terimi taşıyan | Oran | Ana ifadeyi tekrarlayan | Uyarı |
|---|---|---|---|---|---|
| Frekans konvertörü, bugün | 12 | 2 | 0,17 | 1 (0,08) | BASLIK-KONU-ORANI |
| Frekans konvertörü, öneri | 12 | 6 | 0,50 | 5 (0,42) | yok |
| Radyal ve aksiyel fan, bugün | 13 | 6 | 0,46 | 2 (0,15) | BASLIK-KONU-ORANI |
| Radyal ve aksiyel fan, öneri | 13 | 13 | 1,00 | 2 (0,15) | yok |

Konu terimleri H1'den çıkar: frekans yazısında *freka, konve, fan, pompa*; radyal yazıda *radya, fan, aksiy*. ⚠**Oranlar kolun kendi ölçüsüdür**, okuyucunun anladığı şeyin ölçüsü değildir: eşikler bizimdir (R11.2), iki yazıdaki değerleri ölçüp raporlamak için kullanıldı. Sürücü sözcüğü ön bilgiye `konu_terimleri:` olarak yazılırsa frekans önerisi 9 başlıkla 0,75'e çıkar (aynı cihaz; yazının kendisi "elektronik değişken hız sürücüsü" der). Bu öneriye dahil değil, ön bilgi kararıdır.

## 3. Frekans konvertörü yazısı (`frekans-konvertoru-nedir`)

| # | Şimdiki | Önerilen | Gerekçe |
|---|---|---|---|
| H1 | Frekans konvertörü nedir, fan ve pompada nasıl seçilir? | **Değişmez** | Konu adı ve aranan soru birlikte; betimleyici ve abartısız (Y1). |
| 1 | Frekans konvertörü nedir? | **Değişmez** | Konu terimi başlığın kendisi. |
| 2 | Nasıl çalışır? | Frekans konvertörü nasıl çalışır? | Tek başına neyin çalışmasından söz ettiği anlaşılmıyor; içindekide bağlamsız kalır (Y2). Bölüm dört ana kısmı anlatıyor, başlık bunu aşmıyor. |
| 3 | Fan ve pompada neden kullanılır? | Fan ve pompada hız sürücüsü neden kullanılır? | "Neyin kullanıldığı" belli değil. Her başlığa "frekans konvertörü" yazılırsa 12 başlığın 11'i aynı ifadeyi taşır (ölçüldü: tekrar oranı 0,92, `BASLIK-TEKRAR`); bu yüzden aynı cihaz için yazının kendi sözcüğü "sürücü" kullanıldı. **Alternatif:** "Fan ve pompada frekans konvertörü neden kullanılır?" (ölçüldü: konu terimi taşıyan 6/12 = 0,50, ana ifadeyi tekrarlayan 6/12 = 0,50, uyarı yok). "Sürücü" sözcüğünün arama talebi ölçülmedi (R11.5); karar Recep'in. |
| 4 | Yumuşak kalkış | Motorun yumuşak kalkışı | "Yumuşak kalkış" tek başına neye ait olduğunu söylemiyor. Konu terimi eklenmedi; bölüm yıldız/üçgen ve yumuşak yol vericiyi de anıyor, başlık bir kıyas ya da üstünlük iddia etmiyor. |
| 5 | Değişken tork ve sabit tork | Değişken tork ve sabit tork uygulamaları | Mühendis okuyucu için terimler yeterli; "uygulamaları" bölümün yük türlerini (fan, pompa, konveyör) anlattığını söylüyor. Küçük değişiklik. |
| 6 | Seçim: neye bakılır? | Frekans konvertörü seçerken neye bakılır? | "Seçim" neyin seçimi? Aranan ifadeye en yakın bölüm bu; konu terimi doğal yerde (Y2). Başlıktaki iki nokta kaldırıldı. |
| 7 | Danfoss FC 51, FC 101 ve FC 102 karşılaştırması | **Değişmez** | Model adları başlığı tek başına anlamlı kılıyor, Y2'nin istisna cümlesi. ⚠Uyarı kolu bu başlığı "konu terimi yok" sayar (bilinen yanlış pozitif); kırmızı olmadığı için sakıncası yok. |
| 8 | HVAC'a özel işlevler | HVAC uygulamalarına özel sürücü işlevleri | "Neyin işlevleri" belli değil. Bölüm uyku modu, yangın modu ve yerleşik PID gibi sürücü işlevlerini sıralıyor; başlık bunu adıyla söylüyor. |
| 9 | Türkiye'de verimlilik şartı var mı? | Frekans konvertörlerinde verimlilik şartı var mı? | Neyin verimlilik şartı? Konu terimi eklendi. Not: SSS'de "Türkiye'de frekans konvertörleri için verimlilik şartı var mı?" sorusu zaten var; ikisi aynı soruyu iki yerde soruyor. Bu başlık kuralı değil, içerik tekrarıdır; öneri başlığı sorudan ayırıyor, bölümün birleştirilmesi ayrı karar. |
| 10 | Kurulumda dikkat edilecekler | Sürücü kurulumunda dikkat edilecekler | Neyin kurulumu? Konu terimi eklendi. |
| 11 | Güvenlik ve bakım | Sürücü güvenliği ve bakımı | Hangi cihazın güvenliği ve bakımı olduğu tek başına anlaşılmıyor. |
| 12 | İzlenecek yol | Frekans konvertörü seçiminde izlenecek yol | "İzlenecek yol" neyin yolu? Bölüm yük türünün belirlenmesinden kurulum kurallarına kadar seçim ve kurulum adımlarını sıralıyor. |

**Zorunlu bölümler (bu belge önermez, açık nokta):** "Fiyatı belirleyen etkenler", "Sık sorulan sorular", "Kaynaklar", "Teknik sorumluluk notu" başlıkları kapıda birebir aranıyor (R3); değiştirmek `ZORUNLU_BOLUMLER` ve `kalipDenetle`'yi birlikte değiştirir. Bu ayrı karardır (R11.5).

### SSS soruları (H3)

| Şimdiki | Önerilen | Gerekçe |
|---|---|---|
| Frekans konvertörü ile invertör aynı şey mi? | Değişmez | Konu terimi var. |
| Frekans konvertörü ne kadar enerji tasarrufu sağlar? | Değişmez | Konu terimi var. |
| Frekans konvertörü motorda ses yapar mı? | Değişmez | Konu terimi var. |
| Yangın anında sürücü fanı durdurur mu? | Yangın modunda frekans konvertörü fanı durdurur mu? | Cevap "yangın modu" özelliğini anlatıyor ("FC 101'in yangın modu açıldığında…"); "yangın anında" bunu gevşek söylüyor, "sürücü" konu adı değil. |
| Türkiye'de frekans konvertörleri için verimlilik şartı var mı? | Değişmez | Konu terimi var (bkz. H2 satır 9 notu). |
| Doğru teklif için hangi bilgileri paylaşmalıyım? | Frekans konvertörü teklifi için hangi bilgileri paylaşmalıyım? | Konu terimi yok; her yazıda aynı soru olduğu için tek başına ayırt etmiyor. |

## 4. Radyal ve aksiyel fan yazısı (`radyal-fan-mi-aksiyel-fan-mi`)

| # | Şimdiki | Önerilen | Gerekçe |
|---|---|---|---|
| H1 | Radyal fan mı aksiyel fan mı? Fan nasıl seçilir | Radyal fan mı aksiyel fan mı? Fan nasıl seçilir? | Yalnız soru işareti. İçerik ve adres aynı. |
| 1 | Radyal ve aksiyel fan nedir? | **Değişmez** | Konu terimi başlığın kendisi. |
| 2 | Radyal fanlarda kanat tipleri | **Değişmez** | Konu terimi var, bölüm tek başına anlamlı. |
| 3 | Aksiyel fan türleri | **Değişmez** | Aynı. |
| 4 | Kayışlı mı doğrudan tahrikli mi? | Fanlarda kayışlı mı doğrudan tahrikli mi? | Neyin tahriki? Tek başına okunduğunda motor mu fan mı belli değil. |
| 5 | Fan eğrisi nasıl okunur? | **Değişmez** | Konu terimi var. |
| 6 | En yüksek verim noktasına yakın seçin | Fanı en yüksek verim noktasına yakın seçin | Neyi seçin? Başlık emir kipinde ve nesnesiz. |
| 7 | Montaj fanın performansını nasıl etkiler? | **Değişmez** | Konu terimi var. |
| 8 | Hava yoğunluğu ve eğri düzeltmesi | Hava yoğunluğu ve fan eğrisi düzeltmesi | "Eğri" hangi eğri? Bölüm fan eğrilerinin standart yoğunlukla çizildiğini anlatıyor. |
| 9 | Ses değerleri nasıl okunur? | Fan ses değerleri nasıl okunur? | Neyin ses değerleri? |
| 10 | Fanlar için verimlilik mevzuatı | **Değişmez** | Konu terimi var. |
| 11 | Patlayıcı ortam ve duman tahliyesi | Patlayıcı ortam ve duman tahliyesi fanları | Başlık ortamı söylüyor, neyin ortamı belli değil; bölüm bu ortamlara yönelik fanları ve verimlilik tüzüğünün dışında kalmalarını anlatıyor. |
| 12 | Montaj ve bakım | Fan montajı ve bakımı | Tek başına ayırt etmiyor; 7. başlık da "Montaj…" ile başlıyor. |
| 13 | İzlenecek yol | Fan seçiminde izlenecek yol | Neyin yolu? |

⚠**Doldurma sınırı:** öneride 13 başlığın 13'ü "fan" sözcüğünü taşıyor, ama yazının konusu fan; ana ifade ("radyal fan") yalnız 2 başlıkta (0,15). Kolun ölçüsü bunu temiz sayar. Aynı sözcüğün her başlıkta geçmesinin okuyucuya ağır gelip gelmediği bir yargı sorusudur, kapı bunu ölçmez; ağır bulunursa 12 ve 13 numaralı başlıklar (montaj ve bakım, izlenecek yol) en kolay vazgeçilebilir olanlardır, çünkü "Montaj" ve "İzlenecek yol" başlıkları bu yazıda başka bir cihaza karışmıyor.

### SSS soruları (H3)

| Şimdiki | Önerilen | Gerekçe |
|---|---|---|
| Radyal fan mı daha verimli, aksiyel fan mı? | Değişmez | Konu terimi var. |
| Aksiyel fan kanala takılır mı? | Değişmez | Aynı. |
| Fan eğrisindeki verim her devirde geçerli mi? | Değişmez | Aynı. |
| Fazla büyük fan seçmenin zararı ne? | Değişmez | Aynı. |
| 327/2011 sayılı AB tüzüğü hâlâ geçerli mi? | Fanlar için 327/2011 sayılı AB tüzüğü hâlâ geçerli mi? | Tüzüğün neyle ilgili olduğu belli değil; tek başına okunduğunda konu dışı bir soru gibi duruyor. |
| Doğru teklif için hangi bilgileri paylaşmalıyım? | Fan teklifi için hangi bilgileri paylaşmalıyım? | Her yazıda aynı soru; tek başına ayırt etmiyor. |

## 5. Yayına girerse ne olur (maliyet ve risk, ölçülen ve ölçülmeyen)

- **Metin değişir, sha256 değişir (R5.5):** başlık metni yazının parçasıdır; iki yazının onay kaydı yeniden alınır. İddia tablosu değişmez (başlıklara sayı, marka ya da olumsuz iddia eklenmedi); kalıp, atıf ve iç bağlantı kapıları koşar. Başlık-yalnız revizyon için bir tam doğrulama turunun yeterli olup olmadığı **ölçülmedi**; BLG-3'te 10 tur sürmüştü (R10.3 hedefi ≤ 3).
- **Aynı turda yapılabilecek bekleyen iş:** radyal yazısında "dar toleranslarla" → "küçük boşluklarla" terim notu (BLG-3 tur 10'dan kalan, kaynakta "small clearances"; R5 gereği metin değişince tam tur olduğu için ayrı tur açmamak için buraya bağlandı).
- **Çapa adresleri değişir** (içindekiler H2'den üretiliyor, R3): depoda bu iki yazıdaki başlıklara `#çapa` bağlantısı **yok** (git grep, 0 sonuç). Dışarıdan (başka site, kullanıcı yer imi) bağlantı olup olmadığı ölçülemez; eski çapa kırılırsa sayfa yine açılır, yalnız bölüme inmez.
- **`kartOzeti` ve `<title>`:** kart özeti "yazının kendi bölüm başlıklarından" derlendi (kaynak dosyadaki yorum); başlıklar değişirse özet yeniden gözden geçirilir, bu belge özeti değiştirmeyi önermiyor. `<title>` ve meta açıklama bu belgenin kapsamı dışı.
- **Canlıya etkisi ölçülmedi:** başlık değişikliğinin arama gösterimine etkisi bu belgede iddia edilmez. Google'ın belgelerinde alt başlık metninin sıralamaya etkisi yazılı değildir (R11.2); beklenen fayda okuyucu içindir.

## 6. Karar için (Recep)

1. Başlık değişiklikleri kabul edilsin mi, kısmen mi? Frekans yazısında 10 H2 ve 2 SSS sorusu, radyal yazısında 7 H2, H1'e soru işareti ve 2 SSS sorusu değişiyor.
2. "Fiyatı belirleyen etkenler" gibi zorunlu başlıklara konu terimi eklensin mi (kapı ve R3 kalıbı değişir)?
