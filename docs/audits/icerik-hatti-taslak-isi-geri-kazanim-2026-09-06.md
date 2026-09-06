# İçerik hattı — TR taslak: VORT HR (merkezi) · VORT HRW MONO (tekil oda) — REC-146 Adım 2b·2, üçüncü grup

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Emir:** OPS pano onayı 2026-09-06 ("üçüncü grup itiraz yok")
**Durum:** **TASLAK — DB'ye YAZILMADI.** Yazım Recep kapısıdır.
**Kaynak:** AVenS fiyat listesi s.66–67 (TR) · Vortice VMC broşürü s.32–63 (EN, **çevrildi**) ·
VORT MONO kataloğu s.3–5 (EN, **çevrildi**)
**Referans biçimi:** `[AVenS s.NN]` · `[VMC s.NN]` = merkezi üniteler broşürü · `[MONO s.NN]` = MONO kataloğu

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — uydurma yok; **yanlış kapsamlı bilgi de vaat ihlalidir**.
* Kararlar — Vitrin 15A **K6** · **K7** · **K1** · Katalog **K7.2** (çeviri) · **K7.5** (tespit kayıtta).
* `systemair-incelemesi-ve-kabuk-v2.md` §3.1 — altı blok.
* `icerik-hatti-seri-metni-tek-model-kusuru-2026-09-06.md` — bu iki aile o listede; taslak düzeltir.

---

## 0 · Mevcut metinler DÜZELTİLİYOR — birinde satış hatası var

| Aile | Bugün DB'de yazan | Ölçülen gerçek |
|---|---|---|
| `vortice-isi-geri-kazanim` | **"Vortice Vort Invisible Mini Top,** tavan arası… 218 mm derinliğe sahip…" | Ailede **5 ürün** var; metin yalnız **birini** anlatıyor, diğer dördü (HR 300 Neti, HR 350 Avel, Avel H, 450 AVEL D) metinde **hiç geçmiyor** |
| `vortice-vort-mono` | "…30 m³/h (maks. 38 m³/h)… **zamanlayıcı veya nem sensörü olmadan**" | Debi aralığı **38–60 m³/h**; ve ailedeki **8 modelin 5'i HCS**, yani **nem sensörlü** |

> **İkincisi düz bir satış hatasıdır, üslup meselesi değil.** Sayfada "nem sensörü olmadan" yazıyor;
> o ailede sattığımız sekiz modelin beşinde **bağıl nem, sıcaklık ve ışık sensörü + uzaktan kumanda**
> var [MONO s.4]. Yani ürünün en güçlü özelliğini, sayfanın kendisi yok sayıyor.

Aralıklar **DB'den** okundu (bizim sattığımız modeller), katalogdan değil.

---

## 1 · VORT HR — Merkezi (kanallı) ısı geri kazanım üniteleri

**DB:** `vortice-isi-geri-kazanim` · **5 ürün** · 120–400 m³/h ·
HR 300 Neti · HR 350 Avel · HR 350 Avel H · HR 450 AVEL D · Invisible Mini Top

### Kimlik cümlesi
> Konutların, ticari işletmelerin ve otel odalarının havalandırmasını tek merkezden yürüten, çift akışlı
> (dual-flow) ısı geri kazanımlı merkezi havalandırma üniteleri. [VMC s.32][AVenS s.67]

### Dört madde
* Zemin, duvar veya asma tavan montajı — modele göre **80 m²'den 240 m²'ye** kadar alan [VMC s.32, s.46, s.58]
* Yüksek verimli ısı eşanjörü; ısının **%90'a yakını** geri kazanılır [VMC s.58]
* **VORT HR 300 NETI: Passive House sertifikalı** [VMC s.32]
* Entalpi eşanjörlü modellerde **hem sıcaklık hem nem** geri kazanılır [VMC s.32, s.46]

### Yapısal bloklar

**Gövde.** Modele göre iki yapı sunulur: iç ve dış gövdesi **yüksek yoğunluklu (40 kg/m³) genleştirilmiş
polipropilen** olan duvar tipi üniteler [VMC s.46] ve **beyaz boyalı çelik sac** gövdeli asma tavan
ünitesi [VMC s.58]. Asma tavan modelinde tüm ana bileşenlere **ürünün alt yüzünden** erişilir, bu da
bakımı kolaylaştırır. [VMC s.58]

**Çark.** Geriye eğimli kanatlı santrifüj fanlar, doğrudan EC motorlara akuple edilmiştir. [VMC s.46]
VORT HR 450 AVEL D'de **iki adet EC motor** ve harici rotor bulunur. [AVenS s.67]

**Motor.** EC motor. [VMC s.46][AVenS s.67] Doğrudan akuple tasarım kayış-kasnak kaybını ortadan kaldırır.
[VMC s.46]

**Koruma.** Yüksek verimli karşı akışlı ısı eşanjörü. [VMC s.46] Dışarıdan alınan hava **filtrelenerek**
odaya verilir. [MONO s.3] VORT HR 300 NETI **Passive House sertifikasına** sahiptir. [VMC s.32]
Entalpi eşanjörlü modellerde ürün içinde **yoğuşma oluşumu azalır**; bazı durumlarda su tahliyesine
gerek kalmaz. [VMC s.32]

**Kontrol.** Filtre değişim zamanını gösteren **görsel filtre uyarısı** bulunur. [VMC s.59]
*(Kanal bağlantısı, debi kademeleri ve uzaktan kumanda seçenekleri modele göre değişir; kaynakta
aile geneli için tek bir kontrol tanımı yok — bu blok bilerek KISA bırakıldı.)*

**Montaj.** Zemin ve duvar montajı (HR 300 NETI, HR 350/450 AVEL) [VMC s.32, s.46] veya asma tavan
montajı (INVISIBLE MINI TOP) [VMC s.58]. Asma tavan modelinde emiş ve basma bağlantıları **100 ve
125 mm** anma çaplarıyla uyumludur [VMC s.58]; duvar tipi modellerde bağlantı ağızları **150 mm**
anma çapındadır [VMC s.46]. VORT HR 300 NETI **dış ortama kuruluma uygundur**. [AVenS s.67]

---

## 2 · VORT HRW MONO — Tekil oda (desantralize) üniteleri

**DB:** `vortice-vort-mono` · **8 ürün** · 38–60 m³/h ·
HRW 30/40 MONO EVO · 30/40/60 MONO EVO **HCS** · 30/40/60 MONO EVO **HCS Wi-Fi**

### Kimlik cümlesi
> Kanal tesisatı gerektirmeden tek bir odanın havalandırmasını sağlayan, dış duvara gömülü olarak monte
> edilen ısı geri kazanımlı oda tipi havalandırma üniteleri. [AVenS s.66][MONO s.5]

### Dört madde
* Kanal gerekmez — **260–700 mm** kalınlığındaki dış duvarlara monte edilir [MONO s.5]
* **Üç çalışma modu:** taze hava · egzoz · ısı geri kazanımlı havalandırma [AVenS s.66]
* **HCS modellerde** uzaktan kumanda ve bağıl nem, sıcaklık, ışık sensörü [MONO s.4]
* **Wi-Fi modelleri birbiriyle haberleşir** — router ve internet aboneliği gerekmez [MONO s.5]

### Yapısal bloklar

**Gövde.** UV ışınlarına dayanıklı **ABS gövde**. [AVenS s.66] Estetik ön panel her konut ortamına
uyum sağlar. [MONO s.5] Kırmızı kollu, **elle kullanılan kapatma sistemi** vardır ve kapalı olduğunu
gösterir. [MONO s.5]

**Çark.** *(Kaynakta bu aile için çark yapısına dair cümle YOK — **boş bırakıldı**, K7.)*

**Motor.** EC motor, **rulman yataklı**. [AVenS s.66]

**Koruma.** **G3 filtre** ile dışarıdan alınan hava filtrelenir. [AVenS s.66] Yüksek verimli
**seramik eşanjör** kullanılır [AVenS s.66]; ısı geri kazanım verimi asgari debide **%90'a kadar**
çıkar. [MONO s.5]

**Kontrol.** **HCS modeller uzaktan kumandalıdır** ve bağıl nem, sıcaklık ile ışık sensörü taşır;
HCS olmayan modellerde kontrol paneli **cihazın üzerindedir**. [AVenS s.66][MONO s.4]
**Wi-Fi modülü**, ürünlerin **yerel MESH ağı üzerinden birbirleriyle** haberleşmesini sağlar; bunun için
router kurmaya ya da internet servis sağlayıcısıyla sözleşme yapmaya **gerek yoktur**, ürünler arasında
kablo çekilmesi de gerekmez. [MONO s.5]

**Montaj.** **260 mm ile 700 mm** arasındaki dış duvarlara monte edilebilir. [MONO s.5] Birden fazla
ürün kurulduğunda **aralarında kablo bağlantısı gerekmez**. [MONO s.5]

---

## 3 · İki aileyi ayıran cümle

> **VORT HR merkezi, VORT HRW MONO tekildir.** VORT HR **kanal tesisatıyla** tüm konutu ya da işletmeyi
> tek cihazdan havalandırır (80–240 m²); VORT HRW MONO **kanal gerektirmez**, dış duvara gömülür ve
> **bir odayı** havalandırır. Seçim yapıyı belirler: yeni yapıda veya tadilatta kanal çekilebiliyorsa
> VORT HR, çekilemiyorsa VORT HRW MONO. [VMC s.32][MONO s.5]

**Sessizlik farkı da buradan gelir:** MONO ünitesinin ses düzeyi 3 metrede birinci hızda **19 dB(A)** —
kaynağın deyişiyle *"bir metreden fısıltı"* düzeyinde [MONO s.5]; fiyat listesi aynı seriyi
**19–49 dB(A)** aralığıyla veriyor [AVenS s.66].

---

## 4 · Kaynakta ve veride bulduklarım (K7.5)

1. **Mevcut MONO metni satılan ürünü yanlış tanıtıyor** ("nem sensörü olmadan"), oysa 8 modelin 5'i
   sensörlü. Bu, seri-metni kusurunun **en pahalı örneği**: diğerlerinde eksik anlatım vardı,
   burada **ürünün ayırt edici özelliği inkâr ediliyor**.
2. **Mevcut merkezi ünite metni tek ürünün adıyla başlıyor** — "Vortice Vort Invisible Mini Top…".
   Aile sayfasında dört ürün daha var ve hiçbiri anılmıyor.
3. **Çark bloğu MONO'da boş bırakıldı** — kaynakta o bilgi yok. "EC motorlu, demek ki şöyle çarkı vardır"
   denilebilirdi; **denilmedi.**
4. **Kontrol bloğu merkezi ailede kısa** — kaynak model bazında konuşuyor, aile geneli için tek bir
   kontrol tanımı vermiyor. Uydurmak yerine kısa bırakıldı.
5. **Fiyat listesi s.67'de dört model için dört ayrı madde var ama hangisinin hangi modele ait olduğu
   sırayla anlaşılıyor**, başlıkla değil. Eşleştirme model adları üzerinden yapıldı; **s.67'nin
   düzeni yanlış okumaya açık** — AVenS hata raporuna eklenebilir.

## 5 · Kapatmadığı

* EN çevirisi (ayrı tur) · sayısal tablolar (birim sözleşmesi ayrı doğrulama ister) · ticari onay.
* **`is_description_manual`** bugün `false`; bu metin yüklenirse **true** yapılmalı.
* Passive House sertifikasının **bizim sattığımız** HR 300 NETI kodunda geçerli olduğu
  **doğrulanmadı** — kaynak seri düzeyinde konuşuyor, kod bazında teyit edilmedi.

---

— URUN-KATALOG (sid 3a7976a1), 2026-09-06
