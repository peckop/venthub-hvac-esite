# Departman Defteri Standardı (Cetvel) — v0.1 TASLAK

> **Ne yönetir:** Bir departmanın **alanının bugünkü hâlini** (ne yaptık, elimizde ne var, sırada ne var, hangi karar
> alındı) tek yerde tutan "yaşayan defter"in biçimi, tazelik kuralı ve zorlama noktaları.
> **Niçin var:** Aynı iş yeniden yapılıyordu, çünkü alanın haritası Kanban'da, sage'de, ölçüm defterlerinde ve cetvellerde
> dağınıktı (8 Kasım KTL-84: UnoPIM ölçümü kayıtta vardı, emir sıfırdan yazıldı). Recep kararı 9 Kasım (OPS-258): her
> departman alanını yaşayan defterle işletir; üç ay sonra yeni söz gelince departman önce deftere bakar; model
> inisiyatifine bırakılmaz, kanca, CI ve zamanlı ölçüm zorlar.
> **Sahibi:** HARİTA (biçim ve manifest); her defterin içeriğinin sahibi o departmandır.
> **Son doğrulama:** 2026-11-09.
> **Kayıt:** OPS-258, HRT-124 (tasarım notu `docs/plans/departman-defter-duzeni-2026-11-09.md`), HRT-125.
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

## D4 — Tazelik

`Son doğrulama` varsayılan eşik **14 gün**; manifestte defter başına değişir (sıra ölçümü gibi çabuk eskiyen alanda daha
kısa, yapı envanterinde daha uzun). Tazelik kaynağı sırası: (1) defterin kendi `Son doğrulama` satırı, (2) dosya adındaki
tarih, (3) git'te son içerik commit'i. `mtime` kullanılmaz (biçim değişikliği bayat defteri taze gösterir).

**Sahte tazelik yasağı:** `Son doğrulama` tek başına ilerleyip gövde değişmediyse kırmızı; izlenen yol değiştiğinde de defter
gövdesi değişmeden tarih ilerletmek geçerli sayılmaz.

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

Kanca bloklamaz, defter içeriğinin doğruluğunu yargılamaz, başkasının defterini damgalamaz; bunlar ARAÇ görüşünde
(`docs/audits/departman-defter-kanca-gorusu-2026-11-09.md`) gerekçeleriyle yazılıdır.
