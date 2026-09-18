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
| `product_families.description->>'tr'` / `'en'` | aile sayfası gövdesi | ÇİZİLİYOR |
| `product_families.meta_title`, `meta_description` | `<title>`, meta, JSON-LD | ÇİZİLİYOR |
| `products.description_i18n->>'tr'` / `'en'` | ürün sayfası gövdesi | ÇİZİLİYOR |
| `product_families.description->'bloklar_tr'` | blok render (REC-164) | HENÜZ ÇİZİLMİYOR |
| `product_families.description->'maddeler_tr'` | blok render (REC-164) | HENÜZ ÇİZİLMİYOR |

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

**Kapı deseni** (migration guard'larında ve `aile-metni-yaz.mjs` KAPI 5'te aynı desen kullanılır):

```
\*\(|\(\*|\[MANIFEST\]|\[DB\]|\[s\.\s*[0-9]|\mTODO\M
|[Kk]aynakta yok|[Bb]u ürün tipi için geçersiz
|[Kk]aynakta[^.]{0,80}YOKTUR|[Kk]atalo[^.]{0,80}YOKTUR|bilgisi \*\*YOKTUR\*\*
|boş bırakıldı|tutarsızlık notu|[Bb]kz\. yukarı|kaynak başlığı|asıl bloğu|o kısım boş
|birim yazmıyor|doğrulanmalı|tabloda yer almaz
|[Kk]aynakta [^.]{0,80}(verilmem|anlatılm|yazm|açıklan|belirtilmem|bulunmaz)
```

## K3 — Biçim işareti not DEĞİLDİR, dokunulmaz

`---` (yatay ayırıcı) ve satır başındaki boş `>` (blockquote) **markdown biçim işaretidir**.
Karar 45'te 14 ailenin 16 parçasında silinecek başka hiçbir şey yoktu; bunlara **dokunulmadı** ve
migration guard'ı 16 parçanın md5'inin değişmediğini kanıt olarak doğruladı.

Gerekçe: biçim temizliği ayrı bir iştir ve render kararına bağlıdır (markdown mı düz metin mi).
Veri temizliği ile karıştırılırsa "not çıkardım" iddiası ölçülemez hâle gelir.

⚠**Ama `>` işaretinin ardındaki metne bakılır.** `> *DB'deki bugünkü metin V0 sınıfını gövdeye
atfediyor...*` bir nottur (K2/1) ve çıkar; işaretin kendisi biçimdir, gövdesi not olabilir.

## K4 — Bilgi yoksa anahtar hiç yazılmaz

Kaynakta bir blok için veri yoksa doğru davranış **o blok anahtarını hiç yazmamaktır**.
"Kaynakta yok" yazan bir blok, müşteriye hiçbir şey söylemez ve tedarikçinin kataloğunun eksik
olduğunu ilan eder. Karar 45'te metnin tamamı nottan oluşan 5 blok anahtarı kaldırıldı
(`danfoss-fc51` Çark/Gövde/Montaj, `danfoss-fc102` Çark, `vortice-vort-mono` Çark).

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

| Kapı | Nerede | Ne ölçer |
|---|---|---|
| Migration guard 3a | veri onarımı migration'ı | çizilen 6 alanda not deseni = 0 |
| Migration guard 3b | veri onarımı migration'ı | `bloklar_tr` + `maddeler_tr`'de not deseni = 0 (ayrı listeye alınan parçalar adıyla muaf, sayısı sabit) |
| Migration guard 3c | veri onarımı migration'ı | dokunulmaması gereken parçaların md5'i birebir (K3'ün kanıtı) |
| KAPI 5 | `scripts/icerik-hatti/aile-metni-yaz.mjs` | yazma anında K2 deseni — **ALTYAPI şeridinde, karar 42'den devir** |
| Canlı ölçüm | merge sonrası | anon rolüyle `get_family_detail` + `get_product_families_enriched` çıktısında desen = 0 |

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
5. **Çok kiracı (kural 12):** slug birden çok satır döndürürse DURUR, tahmin etmez.
6. **Boş veritabanı:** kayıt yoksa NOTICE ile atlar (kurulum/gölge koşumu kırmızı yanmaz).
7. **Gölgede beş senaryo:** temiz koşum · ikinci koşum (idempotent) · hedef parça elle değişmiş ·
   dokunulmayan kısım elle değişmiş · çok kiracı · boş veritabanı. Her biri çıkış kodu ile ölçülür.
8. **squawk** koşulur (`INV-MIGRATION-3`).
9. **Geri alma yolu** migration yorumuna yazılır; `denetim_izi_*` tetiği önce/sonra kaydını
   `admin_audit_log`'a yazar, o kayıt geri almanın kanıtıdır.

## Ölçüm geçmişi

| Tarih | Ölçüm | Sonuç |
|---|---|---|
| 2026-09-17 | karar 42, çizilen 6 alan | 1 kayıt kirli (`jet-serisi`), onarıldı |
| 2026-09-17/18 | karar 45, `bloklar_tr` + `maddeler_tr` | 38 aile / 274 parça: 215 temiz · 39 not (onarıldı) · 16 biçim (dokunulmadı) · 4 ayrı liste |
