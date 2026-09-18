# Vitrin Metni Standardı

> **Ne yönetir:** Müşterinin gördüğü ürün/aile metinlerinin içine ne girer, ne girmez.
> **Niçin var:** 2026-09-06'da içerik hattı taslağındaki bir editör notu `jet-serisi` ailesinin
> vitrin açıklamasına karıştı ve 11 gün canlıda kaldı (müşteri ekranı + meta description + JSON-LD).
> Karar 42 o tek kaydı onardı ama **cetvel yazılmadı**; karar 45'te aynı deseni taşıyan 274 blok
> parçası ölçüldü. Bu dosya o ölçümün kuralıdır.
> **Sahibi:** URUN şeridi. Yazma betiği kapıları (`scripts/icerik-hatti/**`) ALTYAPI şeridinde.
> **İlgili cetveller:** `catalog-ingestion-standard.md` (kaynak dizini, çıkarım),
> `rendering-cache-standard.md` (hangi sayfa nasıl üretilir), `product-schema-standard.md`.

---

## K1 — Vitrin metni hangi alanlardır

| Alan | Müşteriye nasıl gider | Durum |
|---|---|---|
| `product_families.description->>'tr'` / `'en'` | aile sayfası gövdesi **ve JSON-LD açıklaması** | ÇİZİLİYOR |
| `product_families.meta_title`, `meta_description` | `<title>` ve meta etiketleri | ÇİZİLİYOR |
| `products.description_i18n->>'tr'` / `'en'` | ürün sayfası gövdesi | ÇİZİLİYOR |
| `product_families.description->'bloklar_tr'` | blok render (REC-164) | HENÜZ ÇİZİLMİYOR |
| `product_families.description->'maddeler_tr'` | blok render (REC-164) | HENÜZ ÇİZİLMİYOR |

⚠**JSON-LD'nin kaynağı `meta_*` DEĞİL.** Ölçüldü (2026-09-18, bağımsız çürütücü):
[jsonld.ts](src/lib/seo/jsonld.ts) içinde `meta_title` / `meta_description` **hiç geçmiyor**;
`buildProductGroupJsonLd` açıklamayı `family.description`'tan alıyor. Bu satırın ilk hâli
meta alanlarını JSON-LD'ye bağlıyordu ve yanlıştı.

⚠**"Çizilmiyor" gizli demek değildir.** `bloklar_tr` / `maddeler_tr`, anon (ziyaretçi) rolünün
okuyabildiği `get_family_detail` ve `get_product_families_enriched` RPC'lerinin çıktısında durur.
Kodla süzmek veriyi korumaz; koruma **veri temizliğidir**. (Karar 42 dersi: detay yolu süzüldü,
liste RPC'si aynı jsonb'yi 37 kez sızdırmaya devam etti.)

Bu yüzden K2–K7 **beş alanın hepsi için** geçerlidir, çizilen/çizilmeyen ayrımı yapılmaz.

## K2 — İç editör notu vitrin metninde YASAK

İç editör notu = metni yazan kişinin kendine ya da bir sonraki editöre düştüğü not. Ölçülmüş
biçimleri (2026-09-17/18, 38 aile / 274 parça):

| # | Biçim | Örnek |
|---|---|---|
| 1 | Yıldız-parantez yorum | `*(Kaynakta bu aile için çark cümlesi YOK — boş bırakıldı, K7.)*` |
| 2 | Kaynak eksikliği beyanı | `**Kaynakta yok** — FC-51 için katalogda gövde bilgisi bulunmaz.` |
| 3 | Tip uyumsuzluğu notu | `**Bu ürün tipi için geçersiz.**` |
| 4 | Bilinçli boşluk beyanı | `blok bilinçli olarak boş bırakıldı` |
| 5 | Kaynak göndermesi | `[s.41]`, `[MANIFEST]`, `[DB]`, `bkz. yukarıdaki tutarsızlık notu` |
| 6 | Taslak içi çapraz atıf | `FC101 ile aynı gerekçe`, `Aynı sebep.` |
| 7 | Doğrulama hatırlatması | `Vitrine yazılmadan önce doğrulanmalı.` |
| 8 | Kalan iş işareti | `TODO` |

| 9 | Blockquote-italik not | `> *DB'deki bugünkü metin V0 sınıfını gövdeye atfediyor…*` |

**Kapı deseni** — bugün yalnız **veri onarımı migration'larının guard'larında** kullanılır:

```
\*\(|\(\*|\[MANIFEST\]|\[DB\]|\[s\.\s*[0-9]|\mTODO\M
|\>\s*\*
|[Kk]aynakta yok|[Bb]u ürün tipi için geçersiz
|[Kk]aynakta[^.]{0,80}YOKTUR|[Kk]atalo[^.]{0,80}YOKTUR|bilgisi \*\*YOKTUR\*\*
|boş bırakıldı|tutarsızlık notu|[Bb]kz\. yukarı|kaynak başlığı|asıl bloğu|o kısım boş
|birim yazmıyor|doğrulanmalı|tabloda yer almaz
|[Kk]aynakta [^.]{0,80}(verilmem|anlatılm|yazm|açıklan|belirtilmem|bulunmaz)
```

⛔**YAZMA ANINDAKİ KAPI BU DESENİ KULLANMIYOR — ölçüldü, cetvelin ilk hâli yanlış söylüyordu.**
[aile-metni-yaz.mjs:110](scripts/icerik-hatti/aile-metni-yaz.mjs#L110) yalnız **atıf biçimlerini**
arıyor (`[s.NN]`, `[DB]`, `Kaynak s.NN`); yukarıdaki dokuz biçimin sekizi oradan sessizce geçer.
Karar 42 migration'ı bunu kendi yorumunda zaten yazıyordu. Deseni KAPI 5'e genişletmek
**ALTYAPI şeridinin borcudur** (dosya o şeritte), K8 tablosunda adıyla duruyor.

⚠**`> *` kolu sonradan eklendi ve niçin eklendiği ölçümdür.** İlk hâlinde desen kendi pozitif
kümesinin %10'unu kaçırıyordu: karar 45 planındaki 39 parçanın 4'ünü görmüyordu, çünkü
blockquote-italik biçimin karşılığı yoktu (`\*\(` parantez-yıldız arar, `> *` değil). Bağımsız
çürütücü bunu doğrudan kanıtladı — silinen notun birebir biçimini başka bir parçaya yazdı, guard
kıpırdamadı, migration COMMIT etti. Kol eklendikten sonra aynı kurulum çıkış 3 veriyor.

## K3 — Biçim işareti not DEĞİLDİR, dokunulmaz

`---` (yatay ayırıcı) ve satır başındaki boş `>` (blockquote) **markdown biçim işaretidir**.
Karar 45'te 14 ailenin 16 parçası bu yüzden dokunulmadan bırakıldı; migration guard 3c
**dokunulmaması gereken 20 parçanın** (bu 16 + ayrı listeye alınan 4) md5'inin değişmediğini
kanıt olarak doğruluyor.

⚠**16'nın 14'ü saf biçimdi, 2'si DEĞİLDİ — ölçüldü (bağımsız çürütücü, 2026-09-18).** Cetvelin ilk
hâli "silinecek başka hiçbir şey yoktu" diyordu; iki parçada **dolu** blockquote vardı:
- `vortice-hava-perdesi` / `bloklar_tr.Kontrol` → `> **Isıtıcı aç/kapa komutu bu ailede YOKTUR**
  — kumandadaki o işlev yalnızca AIR DOOR H > modelleri içindir.` Bu **ürün bilgisidir** (K5) ve
  kalır; cümlenin ortasındaki kaçak `>` bir satır kaydırma artığıdır.
- `vortice-lineo` / `bloklar_tr.Gövde` → `> *Sınıflandırma yalnızca kurallara uygun monte edilmiş
  ürün için geçerlidir.*` Katalogdan gelen bir **standart şerhidir**, not değil; kalır.

İkisi de guard 3b'de **adıyla muaf** ve md5'leri 3c'de ölçülür. Muafiyet kör nokta değildir:
içlerinde yeni bir not doğarsa md5 değişir ve 3c kırmızı yanar. Bu, cetvelin kendi içinde
çeliştiği bir noktaydı — K3 "yalnız biçim" derken K5 aynı parçayı ürün bilgisi diye anıyordu.

Gerekçe: biçim temizliği ayrı bir iştir ve render kararına bağlıdır (markdown mı düz metin mi).
Veri temizliği ile karıştırılırsa "not çıkardım" iddiası ölçülemez hâle gelir.

⚠**Ama `>` işaretinin ardındaki metne bakılır.** `> *DB'deki bugünkü metin V0 sınıfını gövdeye
atfediyor...*` bir nottur (K2/1) ve çıkar; işaretin kendisi biçimdir, gövdesi not olabilir.

## K4 — Bilgi yoksa anahtar hiç yazılmaz

Kaynakta bir blok için veri yoksa doğru davranış **o blok anahtarını hiç yazmamaktır**.
"Kaynakta yok" yazan bir blok, müşteriye hiçbir şey söylemez ve tedarikçinin kataloğunun eksik
olduğunu ilan eder. Karar 45'te metnin tamamı nottan oluşan **7 blok anahtarı** kaldırıldı
(`danfoss-fc51` Çark/Gövde/Montaj, `danfoss-fc102` Çark, `vortice-vort-mono` Çark,
`vortice-vortice-bravo-s` Çark ve Motor).

### K4.1 — Olumsuz iddia kaynakta AYNEN geçmiyorsa doğrulanmış sayılmaz

"Motor içermez", "hava hareket ettirmez", "bu modelde yoktur" gibi **olumsuz** cümleler, kaynağın
o şeyden hiç söz etmemesiyle doğrulanamaz. Kaynak cihazın ne **yaptığını** söyler; ne
**içermediğini** söylemez. Kanıt sessizlikse kanıt yoktur.

Ölçülmüş vaka (bağımsız çürütücü, 2026-09-18): `vortice-vortice-bravo-s` için "BRA.VO S bir
sensördür; motor içermez." yazılacaktı. "Sensördür" kısmı destekliydi
(`vort-hr-w-all-100-df.pdf` s.12 "BRA.VO S1 Wireless remote sensor for monitoring temperature,
relative humidity and VOC concentration"; `vortice-brochure-radon-en.pdf` s.40 "an air quality
meter") ama "motor içermez" kısmı kaynakta hiç yoktu — dizinin tamamında BRA.VO ile ilişkili bir
fan/motor/güç verisi geçmiyor. Doğru davranış K4'e dönmekti: kaynak bu aile için çark/motor verisi
vermiyorsa o bloklar **hiç yazılmaz**. Çark bloğunda bırakılacak "hava hareket ettirmez" cümlesi de
aynı kusuru taşıyordu.

⚠Bu, "kaynak doğrulaması yapıldı" raporunun nasıl yanlış olabileceğini gösterir: cümlenin bir
yarısı doğrulanıp diğer yarısı gözden kaçabilir. Doğrulama **cümlenin her iddiası için ayrı**
yapılır ve olumsuz iddia için kaynakta **açık** bir ifade aranır.

## K5 — Ürün bilgisi ile kaynak eksikliği AYRI şeylerdir

Ölçülmüş vaka (`vortice-hava-perdesi` / `bloklar_tr.Kontrol`):

> **Isıtıcı aç/kapa komutu bu ailede YOKTUR** — kumandadaki o işlev yalnızca AIR DOOR H
> modelleri içindir.

Bu cümle **kalır**. Üslubu not gibidir (blockquote + büyük harf vurgu) ama söylediği şey ürünün
özelliğidir, kaynağın eksiği değildir; müşteri için anlamlıdır ve satın alma kararını etkiler.

Ayırt etme sorusu: **eksik olan ÜRÜNDE mi, KAYNAKTA mı?**
Üründe eksikse bilgi → kalır. Kaynakta eksikse not → çıkar.

Aynı mantık "kaynak" kelimesi için de geçerlidir: "ısı kaynağı", "kaynak işlemi", "kaynaklı gövde"
müşteriye anlamlıdır ve **kalır**; yalnız "kaynakta/katalogda + eksiklik fiili" kalıbı nottur.

Bu yüzden K2 deseni `YOKTUR`'u tek başına yakalamaz, yalnız kaynak/katalog göndermesiyle birlikte
yakalar.

## K6 — Doğrulanmamış teknik değer vitrine girmez

Kaynaktan okunmuş ama **birimi, kapsamı ya da doğruluğu belirsiz** değer vitrine yazılmaz; ayrı
listeye alınır ve kaynak doğrulanana kadar bekler. Ölçülmüş vaka
(`vortice-vort-industrial-ventilation-roof` / `bloklar_tr.Gövde`): ölçü tablosu
`⌀A 405, ⌀B 410, ⌀C 357 …` — kaynakta **birim yazmıyor** (büyük olasılıkla mm, ama katalog
söylemiyor). Karar 45 bu parçaya dokunmadı; REC-206 ayrı listesine yazıldı.

Grafikten okunan değer de bu sınıftadır (`jet` 200–3.500 m³/h).

## K7 — Her blok kendi anahtarında durur

Bir bloğun içeriği başka bir bloğun anahtarına yazılmaz. Ölçülmüş yapı hatası
(`danfoss-fc101`, `fc102`, `fc51`): "Kontrol" bloğunun içeriği "Koruma" anahtarına yapışmış ve
üç ailenin hiçbirinde ayrı bir Kontrol anahtarı yok. Bu bir **yapı hatasıdır**, not temizliği
değildir: not çıkarılırsa blok yine yapışık kalır, `fc51`'de blok tamamen boşalır. Onarım yapıyla
birlikte yapılır (REC-206 ayrı liste (i)).

## K8 — Kapılar

| Kapı | Nerede | Ne ölçer | Durum |
|---|---|---|---|
| INV-AILE-VITRIN-METNI-1 | [family.service.vitrin-sozlesmesi.test.ts](src/lib/services/__tests__/family.service.vitrin-sozlesmesi.test.ts) | servis katmanının jsonb'yi `{tr,en}`'e indirdiği — detay **ve** liste yolu ayrı ayrı | ⭐bugün bu işi yapan **tek yinelenen** otomatik kapı |
| Migration guard 3a | veri onarımı migration'ı | çizilen **8** alanda (aile 6 + `products.description_i18n` 2) not deseni = 0 | koşum başına bir kez |
| Migration guard 3b | veri onarımı migration'ı | `bloklar_tr` + `maddeler_tr`'de desen, **adıyla muaf 6 parça dışında** 0 eşleşme | koşum başına bir kez |
| Migration guard 3c | veri onarımı migration'ı | dokunulmaması gereken **20** parçanın md5'i birebir (K3'ün ve muafiyetin kanıtı) | koşum başına bir kez |
| KAPI 5 | [aile-metni-yaz.mjs:110](scripts/icerik-hatti/aile-metni-yaz.mjs#L110) | yazma anında **yalnız atıf biçimleri** (`[s.NN]`, `[DB]`, `Kaynak s.NN`) | ⛔K2'nin dokuz biçiminden sekizi kapı dışı — **ALTYAPI borcu**, karar 42'den devir |
| Canlı ölçüm | merge sonrası, elle | anon rolüyle `get_family_detail` + `get_product_families_enriched` çıktısında desen, **muaf 6 parça dışında** 0 | ⛔kod karşılığı YOK (elle prosedür) |

⚠**Üç migration guard'ı yalnız o migration koşarken bir kez çalışır.** Merge'ten sonra muaf
parçaların içinde yeni bir not doğarsa onu görecek yinelenen bir kapı **yoktur**; "Canlı ölçüm"
satırı bunu üstlenmiş görünüyor ama kod karşılığı yok. Bu boşluk adıyla yazılıdır, kapatılması
ayrı iştir.

⚠**"Canlı ölçüm: desen = 0" ifadesi muafiyeti anmadan yazılırsa tasarım gereği kırmızı yanar** —
muaf 6 parça canlıda deseni taşımaya devam edecek. Cetvelin ilk hâli bu tuzağı taşıyordu.

⚠Son satır ayrı yazılır: **ekranda görünen / sayfaya gömülü / API'den okunabilir üç ayrı
katmandır**, biri ölçülünce diğerleri ölçülmüş sayılmaz.

## K9 — Veri onarımı migration'ının yöntemi

1. **Evren ölçülür ve yazılır** (kaç aile, kaç parça, sınıf dağılımı). Ölçülmeyen parça "temiz"
   sayılmaz.
2. Her parça **kaynak dizinine** karşı doğrulanır (`sayfalar.jsonl`; PDF açılmaz →
   `catalog-ingestion-standard.md` §6.3). Yeni cümle yazılıyorsa kanıt dosya + sayfa olarak
   migration yorumuna girer.
3. **Elle değişiklik kapısı:** her hedef parçanın eski metni birebir gömülür. Parça eski değerdeyse
   uygulanır, zaten hedefteyse NOTICE ile atlanır, **başka bir şeyse EXCEPTION** — bilinmeyen
   metnin üzerine yazılmaz.
4. **Maske md5:** çok parçalı onarımda aile başına tek md5 yetmez (ilk yazma sonrakinin kapısını
   bozar). Dokunulan yollar `#-` ile çıkarıldıktan sonra kalan jsonb'nin md5'i kullanılır; bu değer
   onarım öncesi ve sonrası aynıdır, hem elle değişikliği yakalar hem dosyayı idempotent bırakır.
   ⚠**Dizi tuzağı, kapıya bağlanır — yazılı uyarı yetmez.** Bir jsonb **dizisinden** eleman çıkarmak
   kalan elemanların indeksini kaydırır, bu yüzden aynı kayıtta birden çok dizi yolu varsa çıkarma
   **sırası** sonucu değiştirir. Canlıda ölçüldü:
   `'{"a":["x","y","z"]}' #- '{a,0}' #- '{a,2}'` → `{"a":["y","z"]}` ama ters sıra → `{"a":["y"]}`.
   Karar 45'te ihlal yoktu (iki dizi yolu, ayrı ailelerde) ama dosya yine de "aynı ailede ikinci bir
   dizi yolu varsa DUR" kapısını taşıyor: ön koşul yazıyla değil kapıyla korunur, çünkü 40. parçayı
   ekleyen kişi yorumu okumayabilir. Ayrıca yol parçalarını toplayan her `array_agg`
   **`with ordinality` + `ORDER BY`** ile yazılır — `array_agg` kendiliğinden sıra garantisi vermez
   ve yol parçaları ters gelirse `#-` bambaşka bir şey çıkarır.
5. **Çok kiracı (kural 12):** slug birden çok satır döndürürse DURUR, tahmin etmez.
6. **Boş veritabanı:** kayıt yoksa NOTICE ile atlar (kurulum/gölge koşumu kırmızı yanmaz).
7. **Gölgede yedi senaryo**, her biri çıkış kodu ile ölçülür: (1) temiz koşum · (2) ikinci koşum
   (idempotent) · (3) hedef parça elle değişmiş · (4) dokunulmayan kısım elle değişmiş ·
   (5) çok kiracı (aynı slug iki satır) · (6) boş veritabanı · (7) guard'ın yakalaması gereken bir
   not kurulup **kırmızı yandığının** kanıtlanması (sabotaj kolu — kapı kör değil).
   ⚠**Negatif senaryoda önce KURULUMUN kurulduğu ölçülür**, sonra koşum okunur: karar 45'te çok
   kiracı senaryosunun kurulumu üç kez düştü (NOT NULL → UNIQUE → FK) ve her düşüşte migration
   yeşil yandı; ön koşul ölçülmese "kapı çalışıyor" diye okunacaktı.
   ⚠**"Boş veritabanında kırmızı yanmaz" iddiası yalnız TAM boş veritabanı için doğrudur.** Kısmen
   dolu bir veritabanında (bir aile planın tanımadığı bir slug'a taşınmışsa) ADIM 1/2 zarifçe atlar
   ama guard kırmızı yanar. İddia bu sınırla yazılır.
8. **squawk** koşulur (`INV-MIGRATION-3`).
9. **Geri alma yolu** migration yorumuna yazılır; `denetim_izi_*` tetiği önce/sonra kaydını
   `admin_audit_log`'a yazar, o kayıt geri almanın kanıtıdır.

## Ölçüm geçmişi

| Tarih | Ölçüm | Sonuç |
|---|---|---|
| 2026-09-17 | karar 42, çizilen 8 alan | 1 kayıt kirli (`jet-serisi`), onarıldı |
| 2026-09-17/18 | karar 45, `bloklar_tr` + `maddeler_tr` | 38 aile / 274 parça: **215'te bu desen 0 eşleşme** · 39 not (onarıldı, 7'sinde anahtar kalktı) · 16 dokunulmadı (14 saf biçim + 2 meşru blockquote) · 4 ayrı liste |
| 2026-09-18 | karar 45, bağımsız çürütme | 10 eksen ölçüldü, 8 madde düzeltildi: 1 içerik doğruluğu (bravo-s olumsuz iddia) + 7 cetvel/kapı doğruluğu |

⚠**"215'te desen 0 eşleşme verdi" ile "215 parça temiz" AYNI ŞEY DEĞİL.** Bağımsız çürütücü bu 215
parçayı elle tarayıp **11'inde pozitif kaynak atfı** buldu: sekizi düpedüz atıf ("TR kaynak … olarak
listeler", "kaynak bu ürünleri … olarak tanımlar"), üçü müşterinin göremediği bir tabloya gönderme
("eşleşme tabloda verilir", "katalogda A/B/C/D olarak verilir"). Desen bunları göremez, çünkü
**negatif** kalıbı (`kaynakta … verilmemiştir`) arıyor, pozitifini bilerek dışarıda bırakıyor —
"kaynak" kelimesi müşteriye anlamlı olabildiği için (K5). Bu 11 parça K2 tanımıyla "kendine düşülen
not" olmadığı için 45 kapsamına girmedi; REC-206 ayrı listesine yazıldı. Bir cetvelin "temiz" demesi
her zaman "şu desende eşleşme yok" demektir; desenin görmediği sınıf ayrıca yazılır.
