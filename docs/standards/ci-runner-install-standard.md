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

## 3. Muafiyetler — ADLA yazılır

**Şu an muafiyet YOK.** Liste bilerek boş: tek muafiyet (`db-advisor.yml`) yazıldığı
gün filoyu üç kez kilitledi ve 2026-08-19'da kaldırıldı.

> ⚠️ **MUAFİYET YAZARKEN SORULACAK SORU — acıyla öğrenildi.** *Bu dosya yalnız kendi
> işini mi bloke eder, yoksa PAYLAŞILAN bir kaynağı mı tüketir?* `db-advisor.yml`'in
> zaman sınırsız apt adımı asıldı, iş düzeyi `timeout-minutes` de olmadığı için
> GitHub'ın 6 saatlik varsayılanı devreye girdi ve **aynı anda 19 koşum** eşzamanlılık
> yuvalarını tuttu; gün boyunca 34 koşum elle iptal edildi.
>
> İkinci ders: o adımda `continue-on-error: true` VARDI ve yetmedi. **"Hata sayılmıyor"
> ile "kaynak yakmıyor" aynı şey değildir** — iş kırmızı olmuyordu ama yuvayı yine
> saatlerce tutuyordu.
>
> Paylaşılan kaynak tüketen bir dosyada doğru hamle sessiz muafiyet değil, sahibine
> acil not + devir talebidir. Yeni bir muafiyet yazılırsa yanına "paylaşılan kaynak:
> EVET/HAYIR" notu ZORUNLUDUR.

Muafiyet listesi kapının kendi dosyasındadır; süresiz muafiyet yoktur — her satır
bir kaldırma koşuluyla birlikte yazılır.

## 4. Kapı

`src/__tests__/conformance/ci-install-bounded.test.ts` — INV-CI-INSTALL-1.
Kapı, iş akışı dosyalarını okur; ağdan indiren her adımda kural 1 ve 2'yi arar.
Yeni bir iş akışı sınırsız `apt-get` ya da `playwright install` yazarsa kırmızı yanar.
