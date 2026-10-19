# Ders tekrar vakaları — 2026-10-19

**Şerit:** HARİTA · **Kart:** HRT-70 (OPS emri 19 Ekim) · **Cetvel:** `docs/standards/hafiza-yazma-duzeni-standard.md`, `docs/standards/fleet-mechanism-standard.md`
**Kaynak:** HRT-68 çapalı hafıza ölçümü (12-19 Ekim, salt okuma), OPS bildirimleri, HARİTA kendi PR geçmişi (#1983, #1991, #2018).
**Ne için:** her rolün kurallar dosyasındaki "Aynı ders ikinci kez" bloğunun dayandığı vakaları ve her vakada kontrole çevrilecek şeyi listeler. Kapının tasarımı ve kurulumu ARAÇ'ındır; bu belge yalnız vakayı ve önerilen kontrolü yazar. Bir vakanın burada olması kapı kurulduğu anlamına gelmez.

## Kural

Bir ders ikinci kez çiğnenirse açıklamada kalmaz, otomatik kontrole çevrilir. İkinci çiğneme şöyle sayılır: ders sage'de ya da bir kartta yazılıydı ve aynı sebepten ikinci kez kırmızı CI, kısmi iş ya da geri alınan işlem çıktı. Çiğneyen departman kontrol önerisini OPS'a tek mesajla yazar (hangi ders, hangi iki vaka, önerilen kontrol); OPS ARAÇ'a kart verir.

## Vakalar

| No | Ders | Vaka | Kayıt | Önerilen kontrol | Durum |
|---|---|---|---|---|---|
| 1 | "Tamamına bak": kapsam "tam" denen iş envanterle kanıtlanır, örnekle değil | OPS'ta aynı iş 19 Ekim'de üçüncü kez kısmi yapıldı (OPS bildirimi) | sage `01M5A6ZG8K07QQ67N4E7DZKGJ9` (OPS yazdı, 19 Ekim) | Kartın açıklamasında kapsam "tam" ya da "tamamı" geçiyorsa Done kanıtı envanter dosyası ya da sayım olmalı; yoksa `verify_completion` geçmez | Öneri ARAÇ'a gidecek |
| 2 | Pencere izin kurallarını kendi kopyasındaki `.claude/settings.json`'dan okur; kopya eski daldaysa eski deny satırları geçerli kalır, reddi Recep'in ayarına bağlamadan önce kopyanın `origin/master` farkı ölçülür | 388 yazımında eski dal ayarı yüzünden ret alındı (OPS bildirimi) | sage `01M5A6ZGGK9B672288EGWBMMCY` (OPS yazdı, 19 Ekim) | İzin reddi alındığında kopyanın `origin/master`'a göre bayatlığını ölçen kontrol; tasarım ARAÇ'ın | Tek olay; ikinci çiğneme henüz yok, izleme vakası |
| 3 | Değiştirdiğin dosyayı içeriğiyle okuyan testi itmeden koş | HARİTA: üç ayrı PR'da CI kırmızı, sebep her seferinde değişen dosyayı içeriğiyle okuyan test: #1983 `filo-ortak.md` bayt tavanı (11283 > 10000, `hazir-ozellik-kurulumu` testi), #1991 yeni cetvelde "Son doğrulama" satırı eksik (`belge-tazelik` testi), #2018 setlerdeki dış skill beyansız (`ajan-skill-cozulur` testi). Bu testlerin yerelde koşulup koşulmadığı üç vakada da kayda dayanmıyor, yalnız CI sonucu ölçüldü | GitHub Actions koşuları 38887825141 (#1983), 38898247905 (#1991), 39258725028 (#2018) | Dosya yolundan, o dosyayı içeriğiyle okuyan test dosyalarını bulup koşturan komut; `pnpm test:ilgili` seçicisinin bu üç test türünü yakalayıp yakalamadığı **ölçülmedi**, önce o ölçülür | Ölçüm açık |

## Sınır

- Vaka 1 ve 2'nin ayrıntısı OPS'tadır, burada yeniden ölçülmedi; vaka 3'ün üç CI kırmızısı `gh run view --log-failed` ile ölçüldü.
- Yalnız vaka 1 ve 3 ikinci çiğneme tanımına girer; vaka 2 tek olaydır ve izleme için listede durur.
- Kontrolün kapıya mı kancaya mı çevrileceği ARAÇ'ın kararıdır; kapıyı gevşeten öneri OPS onayıyla geçmez, Recep'e gider (filo-ortak İyileştirme hakkı).
- Kontrolün çıktığı her vaka bu tabloda "Durum" sütunuyla kapatılır; kapanmayan vaka bir sonraki Cuma çürütmesinde yeniden okunur.
