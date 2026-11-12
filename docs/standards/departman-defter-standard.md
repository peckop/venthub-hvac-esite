# Departman Defteri Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** Bir departmanın **alanının bugünkü hâlini** (ne yaptık, elimizde ne var, sırada ne var, hangi karar
> alındı) tek yerde tutan "yaşayan defter"in biçimi, tazelik kuralı ve zorlama noktaları.
> **Niçin var:** Aynı iş yeniden yapılıyordu, çünkü alanın haritası Kanban'da, sage'de, ölçüm defterlerinde ve cetvellerde
> dağınıktı (8 Kasım KTL-84: UnoPIM ölçümü kayıtta vardı, emir sıfırdan yazıldı). Recep kararı 9 Kasım (OPS-258): her
> departman alanını yaşayan defterle işletir; üç ay sonra yeni söz gelince departman önce deftere bakar; model
> inisiyatifine bırakılmaz, kanca, CI ve zamanlı ölçüm zorlar.
> **Sahibi:** HARİTA (biçim ve manifest); her defterin içeriğinin sahibi o departmandır.
> **Son doğrulama:** 2026-11-10 (HARİTA; ARC-291 betikleri `scripts/hijyen/defter-kartlari.cjs` ve `defter-envanter.cjs` master'da okundu, D3, D4 ve D8 onlara karşı yazıldı).
> **Kayıt:** OPS-258, HRT-124 (tasarım notu `docs/plans/departman-defter-duzeni-2026-11-09.md`), HRT-125, HRT-129, HRT-131.
> **İlgili:** `belge-yonetimi-standard.md` (başlık bloğu, tazelik), `docs/olcum/README.md` (ölçüm defterleri),
> `fleet-mechanism-standard.md` (kanca, CI), `is-kayit-duzeni-standard.md` (Kanban).

## D1 — Ayrım: hangi bilgi nerede yaşar

| Katman | Sorduğu soru | Yer |
|---|---|---|
| Kanban | Bu iş yapıldı mı, kimde, hangi kanıtla? | Departman panoları |
| sage / hafıza | Bu hatayı daha önce yaptık mı, ders ne? | Depo dışı sage |
| **Defter** | **Alanın bugün durumu ne, elimizde ne var, sırada ne var?** | `docs/defter/` (manifest söyler) |
| Cetvel | Bu iş nasıl yapılır, ölçüt ne? | `docs/standards/` |
| Ölçüm defteri | Bu konu daha önce ölçüldü mü? | `docs/olcum/` |
| Zorlama | Kural çiğnenirse ne olur? | Kanca, CI, zamanlı ölçüm |

Defter ölçüm defterinin kopyası değildir (ona bağlantı verir), iş listesi değildir (kart numarası verir, durumu Kanban'dan
okunur), ders listesi değildir (ders sage'e ve kurallar dosyasına gider).

## D2 — Beş parça

Beşinden biri eksik olan dosya defter değil düz belgedir.

1. **Tek sahip.** Manifestte `sahip` bir rol kodudur. Paylaşılan alanda defteri alanın ana sahibi yazar, ötekiler "Sırada"ya
   madde ekler. Sahipsiz ya da iki sahipli defter manifest testinde kırmızıdır.
2. **Depoda tek yer.** `docs/defter/<ad>.md`; zaten yaşayan bir kayıt (`docs/mevzuat/kayit.json`, bir ölçüm defteri) olduğu
   yerde defter olarak tanıtılabilir (`dosya` o yolu gösterir), taşınmaz. Başka yerde kopyası olmaz.
3. **Güncelleme tetiği.** Manifestte `tetik`: `kart-kapanisi` (izlenen yolu değiştiren PR defteri de değiştirir) ve `sure`
   (`Son doğrulama` eşiği aşılırsa açılış satırı uyarır); depo dışı kaynaklı defterde ek olarak `dis-kaynak`.
4. **Otomatik tutarlılık kontrolü.** Manifestte `olcum`: defterin söylediği ile gerçek arasındaki farkı ölçen komut; salt
   okuma; çıkış 0 tutarlı, 1 sapma, 2 ölçülemedi ("ölçülemedi" asla "tutarlı" sayılmaz). Komut yazılana kadar `durum`
   `kontrolsuz` kalır; yayılımda `aktif` olmak için komut şarttır.
5. **Recep sayfası.** Sayfa el ile yazılmaz, defterden betikle üretilir (`scripts/belge/defter-sayfa.cjs`, HRT-127);
   her kartta `Son doğrulama` görünür, eşiği aşan defter kırmızı çıkar.

## D3 — Defter dosyasının biçimi

Başlık altında `Sahibi:` ve `Son doğrulama: YYYY-MM-DD` satırı. Dört sabit bölüm, bu sırayla: **1 Ne yaptık** (iş, neden,
sonuç, kart no; yeni satır en üste) · **2 Envanter** (alanın tablosu; her satırda son doğrulama tarihi ve satırın dayandığı
yol ya da komut; yolu olmayan satır iddiadır, envantere girmez) · **3 Sırada ve yapılabilecekler** (gerekçe + öncelik +
varsa kart no) · **4 Kararlar** (tarih + karar no + tek cümle; söz tırnaklanmaz). Bölüm başına öneri tavanı 40 satır;
eskiler `docs/archive/` altına tarihçe olarak taşınır.

**İş bölümlerinin kaynağı (ARC-291, HRT-129).** Defterin iş bölümleri, yani **1 Ne yaptık** ve **3 Sırada**, elle yazılmaz;
`defter:<ad>` etiketli Kanban kartlarından betikle üretilir (üretici ARAÇ'ındır, `<ad>` manifestteki `ad`dir). Elle yazılan
yalnız kapsam (başlıktaki alan tanımı) ve **4 Kararlar** bölümüdür; **2 Envanter** ölçümle gelir (D2.4). Defterin işini
taşıyan kart etiketsiz açılmaz: etiketsiz kart bölüme girmez, iş defterde görünmez. Üretici yayındadır (D8); eski elle
yazılmış satırlar yerinde kalır, sahibi taşır ya da siler, yeni satır etiketli karttan gelir.

## D4 — Tazelik

`Son doğrulama` varsayılan eşik **14 gün**; manifestte defter başına değişir (sıra ölçümü gibi çabuk eskiyen alanda daha
kısa, yapı envanterinde daha uzun). Tazelik kaynağı sırası: (1) defterin kendi `Son doğrulama` satırı, (2) dosya adındaki
tarih, (3) git'te son içerik commit'i. `mtime` kullanılmaz (biçim değişikliği bayat defteri taze gösterir).

**Sahte tazelik yasağı:** `Son doğrulama` tek başına ilerleyip gövde değişmediyse kırmızı; izlenen yol değiştiğinde de defter
gövdesi değişmeden tarih ilerletmek geçerli sayılmaz.

**Kaynak izi (ARC-291):** manifestte `kaynakIzi` olan defterde ölçüm takvime göre değil kaynağa göre yenilenir: iz
değişmediyse defter "kaynak değişmedi, son ölçüm X" gösterir ve `sure` tetiği bunu bayat saymaz; ama `Son doğrulama` günü yine
görünür kalır, sahte tazelik yasağı geçerlidir (iz aynı diye tarih tek başına ilerletilmez). İz üretilemediyse "ölçülemedi"dir,
asla "değişmedi" değil; iz değişip yeni ölçüm yoksa "ölçüm bekliyor"dur.

## D5 — Güvenlik: depo herkese açıktır

Deftere ham arama verisi (sorgu, tıklama, sıra), maliyet ve tedarik verisi, sır, kişisel veri girmez. Depo dışı kaynaklı
bilgi (Design, Search Console, UnoPIM) deftere **özet** olarak girer: sayı, tarih, ham dosyanın sha256'sı. Ham veri
ölçümün durduğu yerde kalır, deftere yalnız oraya işaret girer.

## D6 — Manifest

Tek liste: `docs/defter/manifest.json`. Açılış satırı, önceki-çalışma taraması, PR kapısı, rol kartı satırı ve Recep sayfası
**aynı dosyayı** okur; ikinci bir liste tutulmaz. Şema ve alanların anlamı `docs/defter/README.md`'de.

## D7 — Zorlama noktaları ve sahipleri

| Nokta | Ne yapar | Sahip |
|---|---|---|
| Açılış satırı | Rol başına en çok tek satır, yalnız bayat defter varsa; `gorev-tazelik-satiri` kalıbı + ARC-220 susturması; bloklamaz | ARAÇ |
| Önceki-çalışma taraması | Manifest ortak kaynak, dizin taraması yedek; defter çekirdeğe girer | ARAÇ (ARC-288) |
| PR kapısı | İzlenen yol değişti, defter değişmedi → kırmızı; `Defter-gerekmez: <sebep>` istisnası; bot muaf; ilk iki hafta uyarı kipi; manifest yapı testi | ALTYAPI |
| Depo dışı ölçüm | Önce açılış tetikli kalıp (GEO-SEO emsali); zamanlayıcı ve API sırrı Recep kararı (karar 53) | ALTYAPI / OPS |
| Manifest yapı testi, rol kartı satırı, Recep sayfası | Şema, sahip, dosya var, izlenen yol var | HARİTA |
| Kartlardan üretim (D8) | `defter-kartlari.cjs`: 1 ve 3. bölüm blokları; `--kontrol` Kanban'la ayrışmayı söyler; CI yalnız blok biçimini ve `Üretildi:` damgasını ölçer | ARAÇ |
| Envanter ölçümü (D8) | `defter-envanter.cjs`: kaynak izine bakar, iz değişince ölçüm sonucunu 2. bölüm bloğuna yazar | ARAÇ |
| Günlük Sabah özeti (D8) | Her gün `--kontrol` ve envanteri salt okuma kipinde koşar, ayrışmayı defterin sahibine gösterir | OPS (görev), ARAÇ (betik) |

Kanca bloklamaz, defter içeriğinin doğruluğunu yargılamaz, başkasının defterini damgalamaz; bunlar ARAÇ görüşünde
(`docs/audits/departman-defter-kanca-gorusu-2026-11-09.md`) gerekçeleriyle yazılıdır.

## D8 — İşleyiş: kim ne zaman ne koşar (ARC-291, HRT-131)

Tek cümle: **ölçen ve gösteren otomatiktir, yazan sahibidir.** Betikler (`scripts/hijyen/`, ARAÇ'ın) defteri kendiliğinden
değiştirmez; ayrışmayı gösterir, güncellemeyi defterin sahibi yapar.

| Bölüm | Üreten | Okuma kipi (otomatik, salt okuma) | Yazma (sahibin işi) |
|---|---|---|---|
| 1 Ne yaptık, 3 Sırada | `node scripts/hijyen/defter-kartlari.cjs <ad>` (`defter:<ad>` etiketli kartlar) | `--kontrol` (`--hepsi --kontrol` tüm defterler); çıkış hep 0, ölçülemedi ayrı satır, tablo uydurulmaz | `--yaz`: işaretli bloğu günceller |
| 2 Envanter | `node scripts/hijyen/defter-envanter.cjs <ad>` (manifest `kaynakIzi` ve D4) | `--kontrol`, `--iz` | `--yaz`: 2. bölüm bloğunu günceller |
| Kapsam, 4 Kararlar | Elle, sahibi | — | Sahibi |

1. **Günlük kontrol.** Sabah özeti görevi her gün `defter-kartlari.cjs --hepsi --kontrol` ve envanteri okuma kipinde koşar;
   sapmayı (blok bayat, kart eklenmiş, iz değişmiş, ölçülemedi) defterin sahibine gösterir. Hiçbir otomatik koşu defter
   dosyasını yazmaz ve PR açmaz.
2. **Güncelleme sahibin işidir.** Sahibi `--yaz` ile bloğu üretir, kapsam ve kararlar bölümünü elle günceller, küçük bir
   PR açar (gövdede `Kanban:` satırı). İzlenen yolu değiştiren PR defteri de değiştirir (D2.3); `Defter-gerekmez` istisnası
   geçerlidir.
3. **CI'nın sınırı.** Kanban yereldir, CI onu okuyamaz: CI yalnız blok biçimini ve `Üretildi:` damgasının varlığını ölçer.
   Kartla defter arasındaki uyuşmazlığı günlük kontrol ve elle koşu görür; CI'nın yeşili "defter güncel" demek değildir.
4. **Kapsam.** `defter-envanter.cjs` bugün yalnız `yeni-site-gecis` defterinin 2. bölümünü bilir; başka defter kaynak izli
   envanter isterse betiğe okuyucu eklenir (ARAÇ'a kart), cetvel değişmez. Ölçümü olmayan defterin 2. bölümü elle yazılır
   ve D3'ün "yolu olmayan satır iddiadır" kuralına uyar.
