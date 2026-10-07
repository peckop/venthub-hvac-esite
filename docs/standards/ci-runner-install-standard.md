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

### 2.9 Paralel arka plan kurulumu (ALT-38f, 2026-10-07)

Kural 1-5 ve 2.8 DEĞİŞMEZ; yalnız kurulumun NEREDE koştuğu değişti. `admin-smoke` işinde `playwright install-deps`, Build ile PARALEL arka planda koşar
(`scripts/ci/arka-plan.sh baslat`); sonucunu Build'ten sonraki `bekle` adımı toplar. Ölçüm (88 başarılı koşu, 2026-10-04..07): adım sıralıyken medyan 15 sn
(p90 23 sn, sağlıklı en uzun 52 sn) ve 3 koşuda (%3,4) 187, 339, 341 sn (ilk deneme 300 sn sınırını doldurdu). Build medyan 166 sn olduğundan adımın onu beklemesi için sebep yoktu.
Paralel yolun canlı ölçümü (PR #1742, 5 koşu): komut arka planda 15-19 sn sürdü, `bekle` adımında bekleme 0 sn, derleme süresi etkilenmedi (derleme 91 sn, önceki 92 sn). Takılma bu koşularda
tetiklenmedi: kuyruğun kesilmesi mekanizma ve test (INV-E2E-HIZLI-3/4) olarak kanıtlı, canlıda ÖLÇÜLMEDİ.

- **Başlatan adım kural 1-2'ye uyar.** Adım `timeout-minutes` ilan eder ve komut `retry-bounded.sh` ile koşar; kapı (INV-CI-INSTALL-1) bu paralel yolu da tarar,
  çünkü komut metni adımın gövdesindedir. Kemer aritmetiği (2.7): 75 sn × 2 + 10 = 160 sn < 4 dk.
- **Sınır 300 sn'den 75 sn'ye indi** (sağlıklı en uzunun 1,4 katı): takılan ilk deneme 75 sn'de kesilir, ikinci deneme geçer; eskiden kuyruk 340 sn'ye çıkıyordu. Sağlıklı süre
  Build'in içinde kaldığı için kuyruk işin süresini uzatmaz. En kötü durumda (iki deneme de takılır) `bekle`, `baslat`tan 240 sn sonrasına kadar bekler.
- **`bekle` en-iyi-çabadır** (`continue-on-error`): 2.8 ile aynı gerekçe, asıl kapı prob. Prob `bekle`den SONRA koşar ve fataldir; eksik kütüphanede iş ADIYLA kırmızıdır
  (sessiz yeşil yok). Prob yarım kurulumu görmesin diye `bekle` probtan ÖNCE gelir (INV-E2E-HIZLI-3 sırayı ölçer).
- **Süreç ölürse yeniden koşar.** Arka plan işlemi sonuç yazmadan ölürse (ör. runner öldürürse) `bekle` komutu ön planda yeniden koşturur ve uyarı verir: mekanizma bozulsa bile
  iş eski sıralı davranışına düşer, paralellik kaybolur, doğruluk kaybolmaz. Süre dolarsa (124) komut ÖLDÜRÜLMEZ: kendi sınırı vardır, kapıyı prob verir.
- **Ne kuruyor.** Günlükte komutun YENİ kurduğu tek şey yazı tipleridir (`fonts-freefont-ttf`, `fonts-ipafont-gothic`, `fonts-unifont`, `fonts-wqy-zenhei` ve xfonts paketleri) ve beş mesa/freetype
  yükseltmesi; Chromium'un çalışma kütüphaneleri koşucu imajında zaten kurulu ("already the newest version"). Adım 2.6'ya göre KALDIRILABİLİR görünür, ama yazı tipi kümesini
  değiştirir: test ortamının yazı tipi kümesi değişirse reflow ve axe ölçümleri etkilenebilir. O karar ayrı bir iştir ve ÖLÇÜLMEDİ; bu işte yalnız adımın maliyeti gizlendi.

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

Paralel yol (2.9) için ek kapılar: `INV-E2E-HIZLI-3` (`e2e-smoke-paralel-kurulum.test.ts`: adım sırası, sınır ve deneme sayısı, `bekle` süresi ve en-iyi-çaba,
probun fatal olması ve `bekle`den sonra gelmesi) ve `INV-E2E-HIZLI-4` (`scripts/ci/__tests__/arka-plan.test.ts`: betik gerçek bash ile, sabotajlı).
