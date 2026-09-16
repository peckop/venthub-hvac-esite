# `investigate` skill'i — geçmiş bir vakayla kuru koşu (2026-09-12, REC-307)

**Soru:** 2026-09-08 "iki tmp" vakası bu skill ile **kaç adımda** bulunurdu?

**Cevap: 2. adımda, 5 adımın ikincisinde — ve o adım için gereken ölçüm o gün EKRANDAYDI.**

---

## Vaka, olduğu gibi (kayıt: hafıza `iki-tmp-aracin-ciktisini-okudugundan-emin-ol`)

Aynı Bash komutunda `MSYS_NO_PATHCONV=1` açıkken `curl -o /tmp/aks.html` koştu. curl bir
**Windows** programı: `/tmp` → `C:/tmp/aks.html` (265349 bayt, doğru sayfa). Sonraki `grep`
bash yerleşiğiydi ve aynı yolu MSYS'e çevirdi: `AppData/Local/Temp/aks.html` — üç saat önce
başka bir adımın yazdığı **eski** "Aksesuarlar" sayfası.

Sonuç: *"aynı adrese iki farklı sayfa dönüyor"* diye **sahte ve ciddi** bir bulgu Recep'e
raporlandı, Linear'da High kayıt açıldı, üç şerit 25 dakika kovaladı. Site hiçbir zaman yanlış
sayfa vermedi; gerçek kök sebep başka bir yerdeydi (test seçimi hatası, REC-286).

## Skill ile yürüyüş

| adım | ne derdi | vakada sonuç |
|---|---|---|
| 1 · Belirtiyi olduğu gibi yaz | birebir metin, komut, ağaç, damga | "aynı adres iki farklı sayfa" — yazılırdı |
| **2 · Ölçüm evrenini kur** | **`/tmp` YASAK**, mutlak yol ya da scratchpad | ⛔**Vaka burada hiç doğmazdı**: iki ayrı `/tmp` olduğu için yol mutlak yazılırdı |
| **2 (devam)** | **yazılanı okumadan önce boyut/damga eşle; uyuşmazsa DUR** | ⛔`curl -w size_download` **265349** ↔ `ls` **248237**. Fark ekrandaydı → DUR |
| 3 · Canlıya arıza anında sorgu yasak | doğrulama kayıttan/yerelden | o gün canlıya iki kez gidildi; skill bunu da engellerdi |
| 4 · Hipotezleri çürüt | "iki farklı cevap" olağanüstü iddia; ayırt edici ölçüm ister | hipotez listesi yazılsaydı "okuyucu başka dosyaya bakıyor" ilk üçe girerdi |
| 5 · Kök sebep + kanıt + düzeltme + regresyon | — | gerçek kök sebep (test seçimi) buraya kalırdı |

**Maliyet karşılaştırması:** skill yolunda gereken ek iş **tek komut** (`ls -l`, ya da zaten
basılmış `size_download` satırını okumak). Gerçekleşen maliyet: 3 şerit × 25 dakika + bir High
kayıt + Recep'e giden yanlış bulgunun geri çekilmesi.

## Bu kuru koşunun sınırı — adıyla

Bu bir **masa başı yürüyüşü**, ölçüm değil. Vakayı **sonucunu bilerek** yürüttüm; gerçek bir
teşhiste hangi hipotezin akla geleceği bilinmez. Kuru koşunun gösterdiği tek şey şudur: skill'in
2. adımı, o gün atlanan ölçümü **zorunlu** kılıyor ve gerekli veri zaten ekranda vardı.

Skill'in gerçek etkisi ancak **yeni bir arızada** ölçülebilir. Ölçütü şimdiden yazıyorum:
teşhis raporunda (a) ölçüm evreni beyanı, (b) en az iki çürütülmüş hipotez, (c) kök sebep tek
cümle var mı. Üçü varsa skill koşmuş sayılır; yoksa yazılmış-okunmamış sınıfındadır.
