# CI Koşucu Kurulum Cetveli (INV-CI-INSTALL-1)

> **Kapsam:** `.github/workflows/**` içinde ağdan paket/tarayıcı indiren HER adım.
> **Sahip:** EDGE şeridi. **Yürürlük:** 2026-08-19.

## 1. Niçin bu cetvel var

2026-08-19'da filo, kod kusuru olmadan kilitlendi. Belirti "iş kırmızı" değildi —
**iş asılı kaldı ve bütçesini yedi.** Üç bağımsız koşumda ölçüldü:

| Koşum | Adım | Süre | Sonuç |
|---|---|---|---|
| 32225114226 | Install Playwright Chromium | 24dk 28sn | iş bütçesi doldu |
| 32225609438 | Install Playwright Chromium | 24dk 32sn | iş bütçesi doldu |
| 32224496574 | Install Playwright Chromium | 24dk 16sn | iş bütçesi doldu |
| 32229863553 | (sağlıklı karşılaştırma) | **1dk 18sn** | başarılı |

Aynı sınıf `supabase-migrate` işinde de görüldü: "Install PostgreSQL client" adımı
27 dakika asılı kalıp prod migration'ını geciktirdi.

### 1.1 Reçete ile kök sebep aynı şey değildi

İlk teşhis "tarayıcı indirmesi yavaş, önbellek koy" idi. Günlük bunu **çürüttü**:
asılan kısım `--with-deps` bayrağının çağırdığı **apt**'ydi.

```
Ign: http://azure.archive.ubuntu.com/ubuntu noble InRelease     (tekrar tekrar)
Hit: https://archive.ubuntu.com/ubuntu noble InRelease
Get:5 https://archive.ubuntu.com/ubuntu noble-security InRelease
...   24 dakika boyunca TEK SATIR ÇIKTI YOK, sonra iptal
```

Sağlıklı koşumdaki ayrışma: **apt ~70 saniye, tarayıcı indirmesi ~8 saniye.** Yani
`ms-playwright` önbelleği toplam sürenin yalnız 8 saniyesine dokunur ve asılmayı
hiç engellemez. **Ders:** bir reçete ne kadar makul görünürse görünsün, hangi
parçanın asıldığı ÖLÇÜLMEDEN uygulanırsa yanlış yarıya çare yazılır.

## 2. Kurallar

1. **Sınırsız kurulum adımı yasak.** Ağdan indiren her adım `timeout-minutes`
   ilan eder. Bu adımın kendisini öldürür — işin 25 dakikalık bütçesini değil.
2. **Tek deneme yasak.** Kurulum komutu `scripts/ci/retry-bounded.sh <saniye>
   <deneme> -- komut` üzerinden koşar. Geçici ayna/ağ arızası kalıcı kırmızıya
   dönüşmemeli; ama her deneme **sınırlı** olmalı.
3. **apt sertleştirilmeden çağrılmaz.** apt kullanan iş `scripts/ci/apt-hardening.sh`
   çalıştırır: `ForceIPv4`, `Retries 3`, 20 saniyelik http/https zaman aşımı.
   Varsayılan apt'nin zaman aşımı yoktur — sessizce sonsuza kadar bekler.
4. **İki kemer birden.** Betik (kural 2) ve `timeout-minutes` (kural 1) birbirinin
   yedeğidir. Betik bozulursa adım yine sınırlıdır; adım sınırı yanlış ayarlanmışsa
   betik yine tekrar dener.
5. **Sıfırla çıkmak yasak.** Kurulum sarmalayıcısı başarısızlıkta ASLA `0` dönmez.
   (İlk sürüm tam bunu yapıyordu: `if cmd; then …; fi` sonrasında `$?` — POSIX
   gereği — `0`'dır ve üç deneme de düşerken adım yeşil kalıyordu. Davranış
   testiyle yakalandı, varsayımla değil.)

### 2.6 ÖNCE KALDIR, kaldıramıyorsan SINIRLA

Sınırlamak iyidir; hiç çağırmamak daha iyidir. 2026-08-19'da başarılı bir advisor
koşumunun kurulum günlüğü açıldı ve şunu söyledi:

```
The following NEW packages will be installed:  postgresql-client
Need to get 11.6 kB of archives.
```

**Onbir kilobayt.** apt'nin kurduğu tek şey `postgresql-client` META paketiydi —
içinde ikili dosya yok, yalnız işaretçi. Gerçek istemci (`postgresql-client-16`)
koşucu imajında zaten vardı; olmasaydı NEW packages listesinde görünürdü. Yani
saatlerce süren asılmalar, hiçbir şey kurmayan bir tur için ödeniyordu.

**KURAL:** Bir kurulum adımı yazmadan önce sor: *bu araç koşucu imajında zaten var mı?*
Varsa adım silinir ve yerine **fail-closed bir bekçi** konur — araç yoksa gürültülü
düşsün. "Varsayalım ki vardır" demek, bu cetvelin onardığı sınıfın ta kendisidir.

### 2.7 Kemer aritmetiği — dış kemer içtekini KESMEZ

`timeout-minutes`, sarmalayıcının **en kötü** süresinden büyük olmalı:

```
en kötü = sınır × deneme + 10 sn × (deneme − 1)
```

Bu kuralı ilk sürümde yazdım ve **kendim ihlal ettim**: `retry-bounded.sh 300 3`
(en kötü 920 sn = 15,3 dk) yazıp adıma 12 dakika vermiştim — üçüncü deneme hiç
koşamazdı, yani "üç kez dener" iddiası kâğıt üstünde kalıyordu. Kusur ölçümde değil
**aritmetikte**ydi; bu yüzden kapıya ayrı bir iddia olarak girdi.

İkinci kısıt: **adım sınırlarının toplamı iş bütçesini aşmamalı.** Aşarsa sınırlama
işi kurtarmaz, yalnız kimin yaktığını değiştirir. Bu yüzden deneme sayısı 3'ten 2'ye
indi: sağlıklı süre 47 saniyeyken 300 saniyelik sınır zaten 6 kat pay bırakıyor —
üçüncü deneme pay değil kumardı.

### 2.8 Vekili değil ASIL ŞEYİ kapıya koy

Bir kurulum adımının çıkış kodu, yeteneğin **vekilidir** — asıl soru değildir. Asıl
soru "apt geçti mi" değil, "**tarayıcı açılıyor mu**"dur.

2026-08-19'da master'da ölçüldü: `a8854cf7` koşumunda apt iki denemede de 300 saniyeyi
doldurdu, üçüncüsü kesildi, `admin-smoke` KIRMIZI yandı — ama gerekli kütüphaneler
koşucu imajında zaten olabilirdi ve testler pekâlâ koşabilirdi. Kapı yanlış şeyi
soruyordu.

**KURAL:** Kurulum adımı, yeteneğin kendisini ölçen bir adımla eşleşiyorsa
**en-iyi-çaba** olabilir (`continue-on-error`), ama o zaman peşinden **gerçek yetenek
probu** ZORUNLUDUR ve o prob fataldir. Prob olmadan `continue-on-error` yazmak
fail-open'dır; probla birlikte yazmak kapıyı **güçlendirir**, çünkü vekil yerine
asıl şey ölçülür.

Burada uygulanışı: `playwright install-deps` en-iyi-çaba; ardından Chromium'u
gerçekten açıp bir sayfa render eden ~5 saniyelik prob fatal.

## 3. Muafiyetler — ADLA yazılır

| Dosya | Sebep | Kaldırma koşulu |
|---|---|---|
| `.github/workflows/db-advisor.yml` | 2026-08-19'da PRICING şeridinin claim'inde; başka şeridin dosyasına dokunmak protokol ihlali | Dosya EDGE'e döndüğünde ya da PRICING deseni uyguladığında muafiyet SİLİNİR |

> ⚠️ **MUAFİYET YAZARKEN SORULACAK SORU — acıyla öğrenildi.** *Bu dosya yalnız kendi
> işini mi bloke eder, yoksa PAYLAŞILAN bir kaynağı mı tüketir?* Yukarıdaki tek
> muafiyet, yazıldığı gün **tüm filoyu iki saat kilitledi**: `db-advisor.yml`'in
> zaman sınırsız apt adımı asıldı, iş düzeyi `timeout-minutes` de olmadığı için
> GitHub'ın 6 saatlik varsayılanı devreye girdi ve **aynı anda 19 koşum**
> eşzamanlılık yuvalarını tuttu. Herkesin kapısı kuyruğa girdi.
>
> Paylaşılan kaynak tüketen bir dosyada doğru hamle **sessiz muafiyet değil**,
> sahibine acil not + devir talebidir. Muafiyet satırının yanına "paylaşılan kaynak:
> EVET/HAYIR" yazılır. Bu dosya için: **EVET**.

Muafiyet listesi kapının kendi dosyasındadır; süresiz muafiyet yoktur — her satır
bir kaldırma koşuluyla birlikte yazılır.

## 4. Kapı

`src/__tests__/conformance/ci-install-bounded.test.ts` — INV-CI-INSTALL-1.
Kapı, iş akışı dosyalarını okur; ağdan indiren her adımda kural 1 ve 2'yi arar.
Yeni bir iş akışı sınırsız `apt-get` ya da `playwright install` yazarsa kırmızı yanar.
