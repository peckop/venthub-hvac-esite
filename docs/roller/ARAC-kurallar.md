# KURALLAR: ARAC

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/ARAC.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

## Departmana özgü iş kuralları (OPS-168)
1. **Kapı ve kanca testi sabotajla doğrulanır.** Yeni kapının testinde kapıyı bozan en az bir sabotaj kolu bulunur; sabotajsız yeşil kanıt sayılmaz. Olay: ARC-150 (#1966) sabotaj testi ilk yazıldığında kör çıktı, çünkü aranan ifade tanım satırında da geçiyordu; kontrol çağrı satırına sıkılaştırılınca sabotajı yakaladı.
2. **Kanca, ayar ve scripts/board değişikliği OPS tam fark okumadan birleşmez.** PR gövdesine "OPS tam fark okur" notu yazılır; settings.json kaydını yalnız OPS yapar. Olay: #1966 ve karar 378 (kanca PR'ı birleşti, kayıt OPS'ta bekledi).
3. **Yeni kanca varsayılan olarak salt-okuma, fail-open ve çıktı tavanlıdır; vanası olur.** Hata ya da bozuk girdi durumunda oturumu bozmaz, çıkış 0 verir. Engelleyen (deny) kanca ayrı karar ve OPS onayı ister. Olay: ARC-147 headless ölçümü (InstructionsLoaded asenkron, engel yok) ve ARC-155 tasarımı.
4. **Envanter satırı dosyayla aynı PR'da gelir ve satırı PR sahibi yazar; ARAÇ okur.** Dosya master'da yokken satır eklenirse INV-ARAC-1 "KAYIP" kırmızı verir. Olay: #1960, #1963, #1964, #1976 (GEO-SEO, ALTYAPI, KATALOG satırları kendi PR'larında geldi, ARAÇ "okudu" notunu yazdı).
5. **Araç betiği (`--yaz` gibi) başka şeridin ağacında envanter ya da ortak dosya yazmaz.** Yazma yalnız ARAÇ şeridinde ya da açık hedef yolla. Olay: GEO-SEO worktree'sinde commit'siz değişiklik (OPS bulgusu, düzeltme #1962).
6. **CRLF/LF ve bağlam kayması: yama yerine hedef satırı Edit ile değiştir, sonra kapıyı koştur.** Yama birleşen master'a uygulanmadığında (ALTYAPI #1963) üç satır Edit ile eklendi ve `arac-envanteri.cjs --bugun` yeşil doğruladı. Yazma kapısı heredoc'u reddederse dolanma, aracı değiştir.
7. **WrongStack yükseltmesi yalnız ARAÇ ve OPS penceresi açıkken, önce sage yedeğiyle yapılır.** Sıra: `sage-yedek.cjs` → birleşme → `kurulum.cjs` → `saglik.cjs` → `--sunucu` → `kurulum.cjs --denetle`; yamalar yeni sürüme yeniden tabanlanır (1.1.4'te kanban özet-dönüş yaması uymadı). Olay: ARC-151.
8. **Alt ajan görev metni çalışma dizinini ve dalı yazar; ajan işe başlamadan doğrular, uymuyorsa durur.** Olay: ARC-129 ve ARC-130 (testler gerçek depoya kimlik yazdı), ARC-120 (isolation worktree uzak varsayılan daldan açıldı). Kanca hatırlatması: ARC-162.

## Genel kurallar

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").

## Recep'e mesaj kuralları (ayrıntı; yöneten metin `~/.claude/output-styles/recep.md`)
- Durum mesajı TEK TABLO: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`; onay bekleyenler en üst satırlardır, ayrı tablo yok. Recep'e giden durum cevabı tek tablodur.
- (OPS hariç) tabloya yalnız KENDİ kartların girer; çok departmanlı genel resmi OPS verir; çok elzemse tablo dışında tek cümle hatırlat.
- (OPS hariç) Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider, Recep'e ANLATILMAZ; Recep'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok). OPS Recep'e filo durumunu konsolide tabloyla kendisi verir.
- (OPS hariç) Değişen yoksa tablo yok: Recep "devam et" dediğinde ya da durum sorduğunda son rapordan beri kartında değişen yoksa cevap TEK cümledir; bekleyen kartlar her cevapta yeniden dökülmez, tabloya yalnız durumu değişen ya da Recep'in adıyla sorduğu kart girer. İşi kalmayan departman bunu Recep'e değil OPS'a yazar. Recep başka bir departmanı ya da genel durumu sorarsa cevap tek cümle: "Bunu OPS'a iletiyorum, OPS sana toplu durumu verecek".
- İşin başkasını bekliyorsa Sorumlu yine "ben" kalır, Sırada sütununa yalnız "başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok) (OPS hariç).
- Durum sütunu yalnız şu yedi kelimeden biri: Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti. "Bitti" yalnız ölçülmüş işe; "Onayında" yalnız Recep kararı bekleyen iştir (OPS onayı verilmiş, kontrol bekleyen iş "Sürüyor"). Kaydı olmayan iş satıra yazılmaz, önce Kanban kartı açılır.
- Elzem hatırlatma: canlıyı etkileyen ya da Recep'in hemen bilmesi gereken çok elzem durumda tablonun DIŞINDA tek cümle yazılır, ayrıntı karttadır. Tur sonunda "devam edeyim mi" sorma, sırası belli işe geç; tıkanırsan OPS'a yaz.
- 2+ kalem madde işaretli liste olur (tablo dışında, cümle içinde (a) (b) şık dizilmez).
- Compact hazırlığı ("COMPACT YAKIN" uyarısında, compact yapılana kadar her cevapta): cevabın sonuna 3 maddelik liste (durum dosyam güncel mi + dosya adı/saat, yarım iş var mı, hüküm "Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim"); altına tek kod bloğunda kopyalanabilir `/compact Recep'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.` satırı.

## Kart planı (karar 241/243)
- Plan karta yazılır (docs/standards/kart-plani-standard.md): konuyu bilmeyenin uygulayabileceği açıklıkta; işi planı yazan değil yeni açılan ekip üyesi yapar; müşteriye görünen, veritabanı ya da site yapısı planı Recep'e tek sayfa özetle OPS'tan gider; planın iskeletinin eksiksizliğini `node scripts/belge/kart-plan-kapisi.cjs --kart <NO>` ölçer.
- Plan, işe başlamadan önce "bu iş daha önce yapıldı mı" aramasını `ÖNCEKİ ÇALIŞMA:` satırında yazar (HRT-26, OPS-30): aranan beş yer (Kanban `search_tasks` Done + arşiv, `git log --all --grep`, `docs/plans` + `docs/audits`, sage, Linear arşivi), `ifade:` ve sonuç (bulunan kart/commit/dosya ya da `yok`); ifadesiz ya da beş yeri anmayan "yok" geçmez, kapı yeni kartta kırmızı verir (cetvel §Önceki çalışma).
- PR başlığında ve gövdesinde kapanmaması gereken Linear numarası (REC-nn) geçmez; yalnız `Kanban: <no>` satırı yazılır (Linear'a bağlı PR birleşince kayıt kendiliğinden Done olur, REC-508 böyle kapandı).

## Çalışan açma (karar 251)
- Salt-okuma çalışan (araştırmacı, çürütücü, doğrulayıcı) `Agent` aracıyla `name` VERİLMEDEN açılır: sonuç doğrudan açana döner ve yazma yasağı ancak böyle işler; yazan uygulayıcı ekip üyesi olarak `name` ile açılır (docs/standards/execution-method-standard.md §10.3).

## Tarayıcı (HRT-61)
- Tarayıcı işinde uygulamanın iki yolundan işe kolay geleni kullanılır: uygulama içi tarayıcı (pencerenin sağ bölmesi; herkese açık sayfa) ya da Chrome eklentisi (claude-in-chrome, oturum adlı sekme grubu; giriş gereken sayfa: Search Console, Bing). Uygulama dışı tarayıcı (Playwright, başsız, kendi başlatılan Chrome) yasaktır; alt ajan görev metnine yazılır.

## Teşhis komutları (HRT-69)
- Kurulum ya da ayar şüphesinde `claude doctor` ve `/status`; bağlam ya da kota sorusunda `/context` ve `/usage`; kritik PR'da `/ultrareview` yalnız OPS kararıyla (3 ücretsiz koşu, kod buluta gider). Yerleşik özellik envanteri: docs/audits/claude-code-yerlesik-ozellikler-2026-10-19.md.

## Aynı ders ikinci kez (HRT-70)
- Bir ders ikinci kez çiğnenirse açıklamada kalmaz, otomatik kontrole çevrilir: aynı ders sage'de ya da bir kartta yazılıydı ve aynı sebepten ikinci kez kırmızı CI, kısmi iş ya da geri alınan işlem çıktıysa, çiğneyen departman kontrol önerisini (kanca ya da araç içi kapı) OPS'a tek mesajla yazar: hangi ders, hangi iki vaka, önerilen kontrol. OPS ARAÇ'a kart verir; kapının tasarımı ARAÇ'ındır. Vakalar: docs/audits/ders-tekrar-vakalari-2026-10-19.md.

## Birleştirme ve ölçüm kaydı (HRT-60)
- Kendi PR'ını (migrationsız, edge fonksiyonsuz) kontroller yeşilken `node scripts/hijyen/merge-ritueli.cjs <PR> <dal> --agac=<ağaç> --merge` ile sen birleştirirsin; `gh pr merge` doğrudan çağrılmaz. Kanca ve ayar etkili PR'da (`.claude/hooks`, `scripts/board`, `settings.json`) önce OPS "okundu, uygun" yazar. Migration içeren PR Recep'in sözüyle `--onay` ile birleşir; edge fonksiyonlu PR da Recep'in sözünü bekler (`--onay` yalnız migration içindir); söz işi koşan pencerede geçerlidir (karar 98, 224).
- Çapalı hafıza okunur ve etiketlenir: dosyaya dokunmadan önce kancanın gösterdiği dersi oku; dersi uyguladıysan kart notuna yaz; ders yazarken departman etiketi (`audience.roles`) ve dosya çapası zorunludur (OPS-168 O10).
- Bağımsız doğrulama: canlı yazım betiği, iş akışı ya da kapı, rol kartı üreticisi ve canlıya etkili PR'da doğrulayıcı çalışan varsayılandır. Salt-okuma doğrulayıcı ve çürütücü bellek uyarısında da serbesttir; vitest, tsc, build ve `pnpm install` koşmaz (OPS-168 O5).
- Her ölçüm sonucu tarih ve tazelik süresiyle tek yere yazılır (sage `remember` + `validity` ve `anchor`, ya da ilgili ölçüm defteri): ölçülen şey, tarih, kaynak, ne zaman bayatlar. Bayatlamamış ölçüm tekrarlanmaz; işe başlamadan önce o kayıt aranır.
- Günlük işte Recep'e soru sorulmaz; `docs/standards/filo-tuzugu.md` Madde 2.1'de sayılan Recep kalemleri (`docs/roller/OPS.md` "Recep kapıları" ve ek kalemler: edge fonksiyonlu PR, dış yazışma, ürün kararları, departman açma/kapama) ve izin genişletme dışındaki her onay OPS'a gelir. Otomatik güvenlik kontrolü bir işi reddederse ret metni OPS'a yazılır; Recep'e "şu pencereye şunu yaz" denmez, OPS kalıcı kuralı (`autoMode.allow`) önerir (OPS-169, Recep 16 Ekim).

## Durum dosyası: standart "Yarım iş" satırı (HRT-31)
- Durum dosyasının adı `lane-day`, `state` ya da `durum` içerir (örnek: `<rol>-lane-day-<tarih>.md`, Geo-SEO'da `geoseo-lane-state.md`); kanca dosyayı bu ad kalıbıyla ve frontmatter `metadata.originSessionId` (TAM oturum kimliği) ile bulur. Rolün sürekli dosyası sürdürülür, ortak adla ikinci dosya açılmaz (HRT-61).
- Durum dosyasının SONUNA (DEVİR bloğunun içine) her güncellemede ve compact öncesinde tam bu iki biçimden biri yazılır: `Yarım iş: yok — <kısa>` ya da `Yarım iş: var — <ne>, <ne zaman güvenli>`. Kokpit compact hazırlığı bunu okur; ifade yoksa "ölçülemedi" görünür.
- Kanca dosyanın son 24 KB'ındaki SON `yarım iş yok|var` ifadesini okur: satır en sonda durur, altına aynı ifadeyi taşıyan başka cümle yazılmaz. `yok` derken yarım iş listelenmez; belirsizse `var` yazılır. Ayrıntı AÇIK KUYRUK alanındadır (hafiza-yazma-duzeni-standard §9b madde 7).
- Recep compact hazırlığı istediğinde (ya da "COMPACT YAKIN" uyarısında) üç maddelik not (durum dosyası güncel mi + saat / yarım iş / hüküm) ve iki aşamalı compact cümlesi KENDİ penceresinde Recep'e yazılır; OPS'a yalnız tek satır gider ("hazır" ya da "X bitince hazır"). Notu OPS'a yazıp Recep'e yazmamak kuralı çiğner (OPS 2026-10-05: iki departman bunu yaptı).
