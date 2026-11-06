---
name: seo-olcum
description: 'Arama görünürlüğünü ölçer: SERP, sıra, Search Console, Trends, rakip sayfa kıyası; ölçmeden hüküm vermez. Tetik: "SERP ölç", "ilk sayfada mı", "sıra ölç", "rakip sayfa kıyası".'
category: research
metadata:
  kaynak: "GEO-SEO ölçüm yöntemi (yayin-gorunurluk-denetim-standard.md Y2.3, Y2.4); içerik GEO-SEO, biçim YETENEK (YTN-41)"
  sahibi: "GEO-SEO (içerik), YETENEK (yetenek metni)"
---

# SEO ölçümü

> Bu skill **ölçümün sırasını ve sınırlarını** söyler. Rakip sayfa kıyasının yedi adımı `docs/standards/yayin-gorunurluk-denetim-standard.md`
> Y2.4'tedir; burada tekrar yazılmaz. Dizin isteği atmak `dizin-takip` işidir.

Neden var: "rakip önde" ya da "sıramız arttı" gibi cümleler ölçülmeden yazılınca yanlış işi düzelttirir. Bu skill her iddiayı önce aynı aramayı ölçmeye bağlar.

## Ölçüm sırası

0. **Defter.** Yeni ölçümden önce `node scripts/seo/olcum-defteri.mjs --sor "<sorgu>"` ile aynı ölçüm daha önce yapılmış mı bak, ölçümden sonra `--kaydet` ile yaz (cetvel `dizin-sistemleri-standard.md` D8). Ölçüm arşivi depo dışındadır: kullanıcı klasöründeki `VentHub-Olcum-Arsiv/geo-seo`.
1. **SERP.** Chrome'da (claude-in-chrome) `hl=tr gl=tr pws=0` ile tek alım. Kişiselleştirme farkı olabilir; kullanıcının kendi ekranındaki sonuç ayrı bir satırdır, ölçüm yerine geçmez.
2. **Search Console.** `scripts/seo/gsc-sayfa-oku.mjs` ile sayfa verisi. **Arama ve sorgu verisi depoya YAZILMAZ** (P6): kartta ve depo dışı arşivde kalır.
3. **Arama talebi (Trends).** Sayfa API'sine tarayıcıdan gidilir. Çapa terim en az 3 değerli olmalı; değilse çağrı geçersizdir. Düşük hacimde yön okunur, oran okunmaz (karar 326).
4. **Rakip sayfa kıyası.** Y2.4'ün yedi adımı. Y2.3 ajanı (`claude-seo:seo-geo`) bağımsız okur; her bulgu sayfa satırına karşı doğrulanır, cetvelle çelişen öneri "karar çelişkisi" diye ayrılır.

## Kurallar

- **Ölçmeden hüküm yok.** Ölçülmeyen şey "ölçülmedi" diye yazılır, tahmin yazılmaz.
- **Kişi sözü ölçüm sonucu değildir.** "Rakip önde" denirse önce aynı aramayı ölç; marka adlı sorgu genel sorgu sayılmaz.
- **Sıra arttı** yalnız önce/sonra aynı ölçümle yazılır.
- **Depo herkese açıktır:** rakip adı, sorgu ve sıra sayıları, kişi sözü depoya girmez.

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
