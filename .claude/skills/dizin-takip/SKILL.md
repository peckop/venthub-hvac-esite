---
name: dizin-takip
description: 'Yayın sonrası dizin isteğini adres × motor tablosuna göre sürer: Google, Bing, Yandex, IndexNow; aynı adrese tekrar istek atmaz. Tetik: "dizin isteği", "dizine ekle", "hangi motorda taranmadı", "IndexNow gönder".'
category: orchestration
metadata:
  kaynak: "GEO-SEO dizin takip düzeni (SEO-84, dizin-sistemleri-standard.md D7); içerik GEO-SEO, biçim YETENEK (YTN-41)"
  sahibi: "GEO-SEO (içerik ve betikler), YETENEK (yetenek metni)"
---

# Dizin takip

> Bu skill **akışı sıralar, kuralı yeniden yazmaz.** Karar tablosu ve eşikler `docs/standards/dizin-sistemleri-standard.md` D7'de,
> yayın sonrası zincir `docs/standards/rehber-yazisi-standard.md` R10'dadır (B11-B12 basamakları). Ayrıntı için oraya bak.

Neden var: dizin isteği kotalıdır (Google günde yaklaşık 10, Yandex 10, Bing 100). Aynı adrese ikinci kez istek atmak kotayı yakar ve hiçbir şey kazandırmaz. Bu yüzden her istek bir defterde izlenir ve yalnız karar tablosu "YAP" ya da "TEKRAR" derse atılır.

## Akış

1. **Durum.** `GSC_SA_ANAHTAR` ortam değişkeni servis hesabı anahtar dosyasını gösterir (yolu ve içeriği depoya yazma). Sonra:
   `node scripts/seo/dizin-takip.mjs --durum --cikti <depo dışı yol>`
   Her adres × motor için bir durum döner: **TAMAM / BEKLE / TEKRAR / YAP / ATLA / ESKI / OLCULEMEDI**. İstek yalnız **YAP** ve **TEKRAR** satırlarına atılır; diğerlerine atılmaz. OLCULEMEDI "taranmadı" demek değildir, ölçemedim demektir.
2. **Motor adımı** (yalnız YAP/TEKRAR olanlar):
   - **Google:** Chrome (claude-in-chrome) ile Search Console. Üstteki "URL'yi denetle" kutusuna TAM `https://` adresi yaz, Enter; sonuç gelince "Dizine eklenmesini iste". 1-3 dakika bekle. Başarı mesajı "Dizine eklenmesi istendi"; "Kota Aşıldı" görünürse dur, yarına bırak.
   - **Bing:** `node scripts/seo/bing-url-gonder.mjs --gonder <adresler>` (günde 100).
   - **Yandex:** webmaster.yandex.com, bu site için indexing/reindex sayfasındaki metin kutusuna adresler satır satır (günde 10).
   - **IndexNow:** `node scripts/seo/degisen-adres-bildir.mjs --taban … --kuyruk … --uygula`.
3. **Kayıt, aynı turda.** Eylemden hemen sonra:
   `node scripts/seo/dizin-takip.mjs --kaydet <google|bing|yandex|indexnow> <istek|gonderim|olcum> <https-adres,adres>`
   `--sonuc` ve `--tarih` isteğe bağlıdır; Yandex'te panel geçmişinden gelen eski kayıt için `--tarih` verilir. Eski kayıtları toplu almak için `--ice-aktar` vardır. Kayıt atlanırsa bir sonraki `--durum` aynı adrese yine YAP der ve kota boşa gider.

## Tuzaklar (ölçülmüş)

- **noindex sayfaya istek atılmaz.** EN yayını kapalıdır; o adresler ATLA kalır.
- **Git Bash yol dönüşümü:** `/tr/...` başlayan argümanı `C:/Program Files/Git/tr/...` yapar. Her zaman TAM `https://` adresi ver.
- **Bing hız sınırı:** art arda çok `GetUrlInfo` çağrısında sınır çıkar; betik bir kez yavaşlayıp yeniden dener, sen elle döngüye alma.
- **Sitemap lastmod bazen yalnız tarihtir;** içerik değişince değişmeyebilir. IndexNow tetiği lastmod'a değil metin farkına bakar.
- **Search Console'da düğme ekran dışında kalabilir.** Dar bölmede "Dizine eklenmesini iste" düğmesi görünmeyebilir; sayfada metni bulup `span.closest('[role=button],button,[jsaction]').click()` ile tıklanır. Canlı test 1-3 dakika sürer; başarı kutusu "Dizine eklenmesi istendi".
- **Birleşmeden sonra kart kapatmadan önce ana ağacı ileri sar:** `git fetch` ardından `node scripts/hijyen/ana-agac-tazelik.cjs --ileri-sar`. Kart kanıt komutları ana ağaçta koşar; ağaç geride kalırsa kanıt kırmızı görünür (6 Kasım'da yaşandı).
- **Bing anahtarı** `BING_WEBMASTER_ANAHTAR_DOSYASI` ortam değişkeniyle gösterilir; yolu ve içeriği depoya yazma.
- **Yasak:** "Düzeltmeyi doğrula" düğmesi, site haritası gönderme, kaldırma isteği. Bu işlerin hiçbiri bu skill'in kapsamında değil.

## Sınır

Bu skill yalnız isteği atar ve kaydeder; yazıyı yayınlamaz, indekslendiğini garanti etmez. Dizine girip girmediğinin ölçümü `seo-olcum` işidir.

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
