---
name: investigate
description: Bir arızanın KÖK SEBEBİNİ hipotez-çürütme disipliniyle bulur; kök sebep
  bulunmadan düzeltme yazılmaz. Kırmızı test, 500, "dün çalışıyordu", sahte bulgu
  şüphesi gibi durumlarda kullanın. Düzeltme uygulamak, kod yazmak ya da PR açmak
  için KULLANMAYIN — bu skill teşhis eder, tedavi etmez.
category: audit
metadata:
  triggers:
  - neden bozuldu
  - kok sebep
  - dun calisiyordu
  - 500 veriyor
  - kirmizi test
  inputs:
  - belirti metni (hata, kirmizi adim, ekran goruntusu)
  outputs:
  - kok sebep + kanit + duzeltme onerisi + regresyon testi onerisi
depends_on: []
next_steps:
- diff-review
run_last: false
exclusions: []
---

# Investigate Skill (Arıza Teşhisi)

## Ne zaman kullanılır

Bir şey bozuk ve **niçin** bozuk olduğu bilinmiyor: kırmızı bir adım, 500 dönen bir sayfa,
"dün çalışıyordu" denen bir davranış, ya da elde tuhaf görünen bir bulgu. Teşhis işidir;
düzeltmeyi bu skill yazmaz.

## ⛔DEMİR KURAL

**Kök sebep bulunmadan düzeltme yazılmaz.** Belirtiyi susturan değişiklik düzeltme değildir.
Kök sebep, "şu satır şu koşulda şu sonucu üretiyor" diye **tek cümleyle** söylenebiliyorsa
bulunmuş sayılır; söylenemiyorsa henüz bulunmamıştır.

Bu kuralın bedeli ölçülmüştür: 2026-09-07 önbellek zehirlenmesi, 09-08 iki tmp, 09-09 üç şeridin
aynı kırmızıya üç ayrı sebep yazması — üçü de "hipotez → ölçüm → reddet" disiplini olmadan yama
denendiği için uzadı.

## Adımlar

### 1. Belirtiyi OLDUĞU GİBİ yaz
Birebir hata metni, hangi komut, hangi ağaç/dizin, hangi damga. Özet geçme: "test kırmızı"
belirti değil, **hangi adım** ve **hangi kol** belirtidir. İş düzeyi değil adım düzeyi.

### 2. Ölçüm evrenini kur — okuduğun şey aracın yazdığı şey mi?
İlk ölçüm daima "ben doğru yere mi bakıyorum" sorusudur.
- Dosya yolları **mutlak** (`C:/...`) ya da scratchpad; `/tmp` yasak (bu makinede iki ayrı
  `/tmp` var: Windows programları `C:/tmp`, bash yerleşikleri `AppData/Local/Temp`).
- Git ölçümü daima `git -C <ağaç>`; hangi ağaçta olduğun beyan edilir.
- Bir komutun yazdığını okumadan önce boyut/damga eşle. Byte sayısı uyuşmuyorsa **DUR**.
- Satır sonu şüphesinde ilk ölçüm `head -1 | cat -A` (LF/CRLF).

### 3. ⛔Arıza anında CANLIYA sorgu YASAK
Arızayı "doğrulamak" için canlı adrese istek atmak, hatalı cevabı **önbelleğe yazar** ve arızayı
kalıcılaştırır (09-07 ölçümü: kırık anda sorgulanan dört adres önbelleğe düştü). Doğrulama
kayıttan, logdan ya da yerel kopyadan yapılır. Canlıya dokunmak gerekiyorsa gerekçesi yazılır ve
**Recep'e sorulur**.

### 4. Hipotezleri LİSTELE, sonra ÇÜRÜT
En az iki, tercihen üç hipotez yaz. Her hipotez için **onu yanlışlayacak** ölçümü tasarla —
doğrulayacak değil. Ayırt edici ölçüm şudur: iki hipotez farklı sonuç veriyorsa ölçüm ayırt
ediyor; ikisi de aynı sonucu veriyorsa ölçüm boştur.

Yararlı ayırt edici sorular: aynı şey **başka ağaçta** da oluyor mu · **master'ın kendi** son
koşumu ne diyor (kırmızı bizim mi) · **sahte veriyle** aynı ölçüm ne veriyor (tesadüf tabanı) ·
**takvim mi değişti, kod mu** (zaman kapısı).

### 5. Kök sebebi tek cümleyle yaz, sonra çıktıyı ver
Çıktı dört parçadır: **kök sebep** · **kanıt** (komut + sayı, ekran metni) · **düzeltme önerisi**
· **regresyon testi önerisi** (bu arıza geri gelirse hangi kol kırmızı verir).

## Kapsam kilidi

İnceleme, belirtinin bulunduğu modülün dışına **çıkmaz**. Çıkmak gerekiyorsa sebebi yazılır ve
kapsam genişlemesi açıkça bildirilir. Başka şeridin dosyası okunur, **yazılmaz**.

## Üç deneme sınırı

Kök sebep bulunduktan sonra denenen düzeltme **üç kez** başarısız olursa DUR. Dördüncüyü deneme;
`ENGELLI` raporu yaz: ne denendi, her denemede ne ölçüldü, hangi hipotezler çürütüldü, ne
öneriyorsun. Dördüncü deneme, teşhisin yanlış olduğunun işaretidir.

## ⛔Kanıtsız kısıt yok

"Erişemiyorum / araç desteklemiyor / yapılamaz" tek başına sonuç değildir. Kısıt iddiası birebir
hata metni, belge alıntısı ya da canlı ölçümle gelir. Kanıt yoksa doğru cümle **"ölçemedim"**dir.
**Ölçemedim ile ihlal ayrı sonuçlardır.**

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
