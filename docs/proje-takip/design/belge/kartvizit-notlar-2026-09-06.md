
# Kartvizit — teslim notu · DESIGN-BELGE · 2026-09-06

OPS emri `ops-emir-2026-09-06-5-belge.md` (Recep: "yapılsın"). Sıra bozulmadı: emir "antetli + e-posta imzası bitince" diyordu, o adım önceki turda teslim edildi.
`Kartvizit v1.dc.html` (prova sayfası) · `Kartvizit v1-print.dc.html` (baskı kopyası).

## Ölçü — ölçüldü, mm gerçek
| Ne | Değer | Ölçüm |
|---|---|---|
| Kesim ölçüsü | 85 × 55 mm | 321,3 × 207,9 px ✓ |
| Taşma payı | 3 mm (dört kenar) | — |
| Basılan alan | 91 × 61 mm | 343,9 × 230,5 px (beklenen 343,9 × 230,6) ✓ |
| Kare sayısı | 2 varyant × 2 yüz = **4** | 4 ✓ |
| Kesim işareti | köşe başına 2, kare başına 8 | **32** ✓ |
| Güvenli alan | 6 mm iç boşluk | — |
| Taşan içerik | 0 | ✓ |

Sayfa: A4 **yatay**, kenar 12 mm, 1,09 sayfa (prova sayfası; kartların kendisi tek sayfaya sığıyor, alt bilgi tablosu taşırıyor).

## Kesim çizgisi ayrı katman
`kesimCizgisi` tweak'i kapatılınca **kartın kendisi hiç değişmez**, yalnız 32 işaret düşer. İşaretler taşma alanının kenarına basılıyor (köşelerde 2 mm çizgi, 0,25 mm kalınlık) — kesim hattının üstüne mürekkep gelmiyor. Matbaaya iki hâlde de verilebilir.

## Varyantlar (emir)
- **A · beyaz zemin / lacivert metin** — logo `venthub-isaret-tamrenk.svg`, ikincil metin `--text-body`.
- **B · lacivert zemin / beyaz metin** — logo `venthub-isaret-tamrenk-koyu.svg` (K23 dizilimi: kiremit · beyaz · beyaz · turkuaz), ikincil metin `--text-on-dark-muted` (#8FA2BD).

K22: koyu zeminde soluk metin **alfa ile değil ayrı token** ile yazıldı. Küçük turkuaz metin koyu zeminde kullanılmadı (ölçüm: AA altı) — kartvizitte turkuaz yalnız logonun içindeki dilimde var.

**Kiremit:** yalnız arka yüzde tek vurgu çizgisi (22 × 1,2 mm). Dolgu yapılmadı, metin rengi olarak kullanılmadı (emir + K25-b). Dört kareyi birlikte saydım: kiremit kullanımı 2 (iki arka yüz), ikisi de çizgi.

Logo elle çizilmedi (K23), dördü de `brand/logo/`'dan yüklendi (ölçüldü: `naturalWidth > 0`).

## Alanlar — uydurma yok
Altı yer tutucu: `{{ad_soyad}}` · `{{unvan}}` · `{{telefon}}` · `{{eposta}}` · `[Adres]` · `[Şirket unvanı]`. Gerçek görünümlü sahte isim ya da numara yazılmadı. Tek dolu değer **venthub.com.tr** (emir #3, kanonik alan adı). Şirket unvanı ve adresi antetlideki **aynı** yer tutucudan geliyor — iki yerde iki değer yok (emir).

## Tipografi — belgelerin 10 pt tabanı burada geçmiyor
Ad soyad Archivo 600 · **11 pt** · unvan 8 pt · iletişim bloğu IBM Plex Mono **8 pt**. 85 × 55 mm kartta 10 pt'lik dört satırlık iletişim bloğu sığmıyor; kartvizit yazı ölçüsü ayrı bir sınıf. Ölçüldü: dört satır 85 mm genişliğe taşmadan sığıyor, taşan içerik 0.

## Ham hex — iki eşleşme, ikisi de metin
Kartın stilinde ham hex **0** (renk tokenden). Ölçümde çıkan iki hex (`#1A2B4A` · `#D95D0E`) **baskı notunun metni** içinde: matbaaya "bu iki rengin CMYK karşılığı profille üretilir" derken renk kodunu yazmak zorunlu. Stil değil içerik; kayda geçiyor.

## Baskı dışa aktarımı (emir: yapılabiliyorsa yap, yapılamıyorsa sebep yaz)
**PDF: yapıldı.** `Kartvizit v1-print.dc.html` — kaynak + sürüm damgası (`omelette-print-source`) + renk/animasyon dondurma; `doc-page` baskı geometrisinin sahibi olduğu için `@page` yazılmadı. Dışa aktarım penceresi açıldı; basma işini kullanıcı onaylıyor.

**CMYK: YAPILAMADI. Sebep:** tarayıcı baskı motoru yalnız RGB üretir ve ICC profili gömemez — CMYK dönüşümü matbaanın kendi profiliyle yapılır. Bu bir eksik değil sınır: dönüşümü burada yapmak, matbaanın profilini tahmin etmek olurdu.

Matbaaya verilecek dosyada iki not gerekiyor:
1. Lacivert `#1A2B4A` ve kiremit `#D95D0E` CMYK karşılıkları matbaa profiliyle üretilir, gözle eşleştirilmez.
2. Kesim işaretleri ayrı katmandadır, taşma payı 3 mm.

## Denetimde yakalanan üç kusur (aynı turda düzeltildi, ölçümle doğrulandı)
1. **Kart metni Archivo değil sistem fontunda basıyordu.** `doc-page` kabuğu kendi yazı yığınını basıyor ve miras zinciri orada kesiliyor; bu dosyanın helmet'inde diğer belgelerin taşıdığı `doc-page h1, doc-page h2 { font-family:var(--font-sans) }` satırı yoktu. Eklendi (`doc-page` seçicisi de dahil). Ölçüm: wordmark ve ad artık **Archivo**.
2. **`--weight-wordmark` diye bir token YOK** — doğru ad `--wordmark-weight` (=700). Yanlış ad sessizce 400'e düşürüyordu. Aynı yanlış ad `Antetli Kagit v1` ve `Kesif Raporu v1`'de de yazılıydı; üçü birlikte düzeltildi, tracking de `--wordmark-tracking` tokenine bağlandı. Ölçüm: dört karede wordmark **Archivo 700**.
3. **`src="{{ k.logo }}"` her yüklemede başarısız bir istek doğuruyordu** (ham hole URL sanılıyor). İki tur önce `Antetli Kagit`'te düzeltilen kusur `sc-for` içinde geri gelmişti; dört logo iki `sc-if` dalında **literal** yola bağlandı (`acikZemin` / `koyuZemin` bayrağı). Ölçüm: konsol temiz, dört logo yüklü.

Kural olarak yazılıyor: **şablonda `src` asla hole olmaz** — dosya yolu literal yazılır, seçim bayrakla yapılır.

## Açık kalan
- Kişi verisi Recep'ten gelene kadar yer tutucu (K7).
- Kâğıt provası (153-9) artık on yedi belge + antetli + kartvizit.
- Kartvizit için kâğıt cinsi/gramaj kararı verilmedi — matbaa işi, Design kararı değil; istenirse ölçü sayfasına satır eklenir.

— DESIGN-BELGE (Opus) 2026-09-06

