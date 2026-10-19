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
| 2 | Eski dal ayarı: kopya izin dalından yazım yapılmaz, güncel dal ölçülür | 388 yazımında eski dal ayarı kullanıldı (OPS bildirimi) | sage `01M5A6ZGGK9B672288EGWBMMCY` (OPS yazdı, 19 Ekim) | Yazım ya da ayar uygulamadan önce kaynağın güncel master'a göre bayatlığını ölçen kontrol; tasarım ARAÇ'ın | Öneri ARAÇ'a gidecek |
| 3 | Değiştirdiğin dosyayı okuyan testi itmeden koş | HARİTA: #1983 (kurallar dosyası bayt tavanı), #1991 (yeni cetvelde "Son doğrulama" satırı eksik), #2018 (setlerdeki dış skill beyansız) üç ayrı PR'da CI kırmızı; üçünde de değişen dosyayı içeriğiyle okuyan test yerelde koşulmamıştı | HARİTA durum dosyası, 18-19 Ekim; sage'e ders HRT-61'de yazıldı | Dosya yolundan, o dosyayı okuyan test dosyalarını bulup koşturan komut; `pnpm test:ilgili` seçicisinin içerik okuyan bu üç test türünü yakalayıp yakalamadığı **ölçülmedi**, önce o ölçülür | Ölçüm açık |

## Sınır

- Üç vaka da yalnız anlatıma ve kayda dayanır; vaka 1 ve 2'nin ayrıntısı OPS'tadır, burada yeniden ölçülmedi.
- Kontrolün kapıya mı kancaya mı çevrileceği ARAÇ'ın kararıdır; kapıyı gevşeten öneri OPS onayıyla geçmez, Recep'e gider (filo-ortak İyileştirme hakkı).
- Kontrolün çıktığı her vaka bu tabloda "Durum" sütunuyla kapatılır; kapanmayan vaka bir sonraki Cuma çürütmesinde yeniden okunur.
