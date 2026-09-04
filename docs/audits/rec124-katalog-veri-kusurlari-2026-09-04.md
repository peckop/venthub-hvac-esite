# REC-124 — katalog veri kusurları: CANLI ÖLÇÜM ve kalan liste

**Tarih:** 2026-09-04 · **Şerit:** URUN · **Yöntem:** salt-okuma SQL (prod), yazım YOK.
**Cetvel:** `docs/standards/catalog-ingestion-standard.md` · `docs/standards/product-schema-standard.md`

---

## 0) Niçin bu belge — emir bileti tekrar etmedi, ölçtü

İş emri REC-124'ün gövdesini tarif ediyordu: *"Frenkans/Inventoru yazımları, DAN-80101 aile,
4 hijyen kalemi."* Biletin kendi **DURUM 2026-09-02** notu ise o kalemlerin çoğunun **yazıldığını**
söylüyor. İkisi çelişiyordu; bu yüzden hiçbir şey yeniden yapılmadan **önce canlı ölçüldü**.

Sonuç: **beş kalem gerçekten kapanmış, üç kalem açık ve ikisi biletin tarif ettiğinden FARKLI.**
Emri olduğu gibi uygulasaydım, kapanmış işi yeniden açar ve açık olanı ıskalardım.

---

## 1) Kapanmış kalemler — canlıdan doğrulandı (yeniden YAPILMAYACAK)

| # | Kalem | Beklenen | Ölçülen (2026-09-04, prod) | Hüküm |
|---|---|---|---|---|
| 1 | `"Frenkans"` yazımı | 0 olmalı | **0** | KAPANDI |
| 2 | `"Inventoru"` yazımı | 0 olmalı | **0** | KAPANDI |
| 3 | **DAN-80101 yanlış ailede** | `danfoss-fc51` olmalı | **`danfoss-fc51`** | KAPANDI |
| 6 | `º` (masculine ordinal) | 0 olmalı | **0** | KAPANDI |
| 9 | Galeri alt metni **başka ürünün SKU'sunu** taşıyor | 0 olmalı | **0 / 1042** alt metinli görsel | KAPANDI |

⚠**9. kalemin ölçüm SINIRI (gizlenmiyor):** ölçüt *"alt metin, BAŞKA bir ürünün SKU dizesini
içeriyor mu"* idi. Bu, biletin bildirdiği vakayı (`AVE-13050` sayfasında `AVE-11300`) tam olarak
yakalayacak ölçüttür ve **sıfır** çıktı. Ama **yanlış görselin doğru görünen bir alt metni**
olsaydı bu ölçüt onu göremezdi — o ayrı bir sorudur (görsel↔ürün eşlemesi), burada
cevaplanmıyor ve cevaplanmış gibi yapılmıyor.

---

## 2) AÇIK kalemler — üçü de ölçülmüş, ikisi biletten FARKLI

### A) Büyük harf normalizasyonu — **23 ürün** (bilet: "m.5", tanım belirsiz)

Adı tamamen büyük harfle girilmiş ürünler. Örnekler:

```
AVE-13032 = 6 KW ELEKTRİKLİ ISITICI
AVE-13033 = 9 KW ELEKTRİKLİ ISITICI
AVE-13034 = 12 KW ELEKTRİKLİ ISITICI
AVE-13037 = 3 KW ELEKTRİKLİ ISITICI
AVE-13038 = 15 KW ELEKTRİKLİ ISITICI
```

**Niçin otomatik düzeltilmiyor — ölçülebilir sebep:** "Başlık Düzeni"ne çevirmek **marka ve birim
kısaltmalarını bozar**. `KW` → `Kw` yanlıştır (doğrusu `kW`); `AVenS`, `SEAT`, `VMC`, `HF/S`,
`BVU-LS` gibi kalemler de büyük harfli olmak ZORUNDA. Yani bu bir dize dönüşümü değil, **sözlük
gerektiren** bir iştir.

**Önerim:** otomatik dönüşüm YOK. 23 kalem **elle** yazılıp tek listede onaya sunulsun.
Sayı küçük (23), risk düşük, ve makine kuralı burada güvenilir değil.
**Kararı gereken:** Recep — "23 adı elle düzeltelim mi, yoksa bu hâliyle kalsın mı".

### B) Çift boşluk — **1 ürün, ve bilettekinden BAŞKA bir ürün**

| SKU | Ad (bugün) | Önerilen |
|---|---|---|
| `NIC-11907` | `DD 10/10 550W 1F 4P 3V  - 6M061U` | `DD 10/10 550W 1F 4P 3V - 6M061U` |

Biletin 4. kalemi `AVE-80141` idi ve o **kapanmış**. Bu **yeni** bir vaka —
"aynı sınıf kusur tek seferlik değil" demektir; kalıcı çözüm ingest tarafında bir kapı olurdu
(bu belgenin kapsamı değil, ayrı kalem olarak not edildi).

### C) `name_i18n.tr` boş aileler — **7 aile, bilet 2 diyordu**

| Aile slug | `name` (TR metni burada VAR) | `name_i18n.en` |
|---|---|---|
| `avens-bvu-ls` | AVenS BVU-LS Kurşun Seperatör | AVenS BVU-LS Bullet Separator |
| `avens-hiz-anahtarlari` | AVenS Hız Anahtarları | AVenS Speed Switches |
| `avens-hucreli-hf-s` | AVenS Hücreli Aspiratörler HF/S | AVenS Box Extract Fans HF/S |
| `jet-serisi` | JET Serisi | SEAT JET Series Acid-Resistant Fans |
| `storm-serisi` | STORM Serisi | SEAT STORM Series Acid-Resistant Fans |
| `vortice-h-ad-elektrikli` | Vortice H AD Elektrikli Isıtmalı Hava Perdeleri | Vortice AIR DOOR H AD Electrically Heated Air Curtains |
| `vortice-lineo` | Vortice Lineo Kanal Fanları | Vortice Lineo Inline Duct Fans |

Biletin andığı iki aile (`avens-sulu-batarya`, `danfoss-fc51`) listede **YOK** → onlar kapanmış.
Kalan yedisi **aynı sınıf, daha geniş küme**.

**Müşteriye etkisi bugün YOK:** `familyName()` `name_i18n.tr` boşken ham `name`'e düşüyor ve
`name` zaten Türkçe. Yani **kusur görünmez, ama tutarsızdır** — TR yolu sözlükten değil
yedekten besleniyor.

**Önerim:** yedi ailenin `name_i18n.tr` alanı, **bugün `name` içinde ne yazıyorsa onunla**
doldurulsun. Bu bir çeviri işi DEĞİL, mevcut değerin doğru kutuya taşınmasıdır — dolayısıyla
**yeni metin üretilmiyor** ve gözden geçirme yükü doğurmuyor.

⚠**Dikkat — `jet-serisi` ve `storm-serisi` istisna:** bu ikisinde EN adı TR'den **daha uzun**
("SEAT JET Series Acid-Resistant Fans" ↔ "JET Serisi"). TR tarafı eksik BİLGİ taşıyor olabilir
(marka + "asit dayanımlı" niteliği). Kopyalamak bugünkü davranışı değiştirmez ama **eksikliği
kalıcılaştırır**. Bu ikisi için ayrı bir içerik kararı gerekebilir; ölçmedim, uydurmuyorum.

---

## 3) Prod yazımı — bu belge onay İSTEMİYOR, sadece LİSTE sunuyor

Cetvel gereği prod veri yazımı Recep onayı kapısıdır. Bu belge **hiçbir şey yazmadı**
(yalnız `SELECT`). Yazım, yukarıdaki üç kalem için ayrı ayrı karar alındıktan sonra
**tek turda** yapılır ve sayım birebir doğrulanır (REC-110/REC-124'ün 2026-09-02 turundaki gibi).

**Recep'e gidecek üç ayrı soru:**
1. 23 ürün adının büyük harften çıkarılması — elle, sözlük gerektiği için. Yapılsın mı?
2. `NIC-11907` çift boşluğu — düzeltilsin mi? (tek satır, risksiz)
3. Yedi ailenin `name_i18n.tr` alanı `name` değeriyle doldurulsun mu? (`jet-serisi` /
   `storm-serisi` için ek içerik kararı ayrıca sorulmalı)

---

## 4) Bu turun sınıfı

⭐**Bayat bilet, iş emri doğurur.** Emir biletin GÖVDESİNİ tarif ediyordu; biletin kendi
durum notu ise işin çoğunun yapıldığını söylüyordu. Ölçmeden başlansaydı kapanmış beş kalem
yeniden açılır, açık üç kalemin ikisi (farklı ürün, daha geniş küme) **ıskalanırdı**.
