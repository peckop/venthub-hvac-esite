# Müşteriye verilecek belgeler — ne var, ne yok, ne yapmalı

**Şerit:** URUN-KATALOG (sid 3a7976a1) · **Tarih:** 2026-09-06 · **Durum:** ölçüm + öneri.
Kod yazılmadı, hiçbir şey yüklenmedi. **Karar Recep'te, Design tarafı ayrı ilerliyor.**

**Soruyu soran:** Recep — *"Ben müşteriyim ve ürün bilgisi istedim, ya da katalog, ya da broşür.
Bizim bunların zaten olması lazım… kullanıcı da indirebilsin. Hazırlığımız tüm ihtiyacı
karşılayacak genişlikte olmalı."*

## KAYNAK / CETVEL

* `docs/standards/vaat-butunlugu-standard.md` — **belgesiz iddia vaat ihlalidir** (bu raporun ekseni).
* Kararlar — Vitrin 15A **K1** (fiyat/vaat metni yok) · **K7** (kaynak yoksa satır yok) · **K8** (kategori modları).
* `docs/standards/catalog-ingestion-standard.md` · `docs/audits/icerik-hatti-kaynak-dizini-olcumu-2026-09-06.md`.
* **Cetvel yok** olan kısım: *belge yönetimi* (hangi belge nereden gelir, kim onaylar, ne zaman
  bayatlar). Bu iş açılırsa **cetveli yazmak kapsama dahildir** (kural 1).

---

## 1 · Müşteri gerçekte ne ister — sekiz belge türü

Bir HVAC alıcısının satın alma öncesi/sonrası isteyebileceği belgeler, **iş etkisine göre**:

| # | Belge | Neden ister | Bugün |
|---|---|---|---|
| 1 | **Ürün teknik föyü** | "Bu modelin değerleri neler" | ✅ **VAR** — üretiliyor |
| 2 | **Seri/aile broşürü** | "Serinin tamamını göreyim, hangisi bana uyar" | ❌ yok |
| 3 | **Kategori seçim rehberi** | "Hangi tip fan lazım, nasıl seçerim" | ⏳ yazıldı, yüklenmedi |
| 4 | **Sertifika / uygunluk** (CE, ATEX, EN 12101-3) | **İhale ve proje şartı** — belgesiz satılmaz | ❌ yok |
| 5 | **Teknik çizim** (ölçü, DWG/PDF) | Projeye yerleştirmek için | ⚠ **raf var, boş** |
| 6 | **Montaj / kullanım kılavuzu** | Kurulum ve satış sonrası | ❌ yok |
| 7 | **Performans eğrisi** (debi-basınç) | Mühendis seçimi bununla yapar | ❌ yok |
| 8 | **Garanti / servis şartları** | Satın alma kararı ve sonrası | ❌ yok (bu şeridin dışı) |

**En kritik ikisi 4 ve 7'dir.** Duman egzoz fanı, ATEX fanı ve sığınak ürünü satarken
sertifika **sorulur**; performans eğrisi olmadan mühendis seçim yapamaz. Bunlar "güzel olur"
değil, **satışın önkoşulu**.

## 2 · Bugün elimizde ne var — ölçüldü

### 2.1 · Ürün föyü ÜRETİLİYOR ✅

`src/lib/pdfGenerator.ts` → `generateProductDatasheet`, ürün sayfasından çağrılıyor
(`ProductDetailPageView.tsx:332`). Bugün (REC-158 Faz 1) **vitrinle aynı biçimlendiriciden**
geçiyor, yani föydeki satırlar ile sayfadaki satırlar aynı kaynaktan; parite kapısı var
(`INV-FOY-PARITE-1`). Bu, sekiz kalemin en olgunu.

**Sınırı:** föy **ürünün teknik özelliklerinden** üretilir. 375 ürünün 367'sinde teknik özellik
var — ama bu değerlerin **hiçbirinin kaynağı yazılı değil** (REC-163 tam bunu kapatıyor).

### 2.2 · ⚠ BELGE RAFI YAPILMIŞ AMA TAMAMEN BOŞ — en çarpıcı bulgu

`src/components/authority/TechnicalDrawingAuthority.tsx` bir **indirilebilir belge listesi**
çiziyor: başlık, format, güncellenme tarihi ve **indir düğmesi**. Verisi
`categories.authority_content` (jsonb) alanından geliyor.

**Ölçüm: 37 kategorinin 37'sinde `authority_content` BOŞ.** Yani raf kurulmuş, vidalanmış,
sayfaya yerleştirilmiş — **üstünde tek belge yok.** Yeni bir şey inşa etmeden önce burayı
doldurmak, aynı işi ikinci kez yapmamak demek (bugün filoda üç kez düştüğümüz tuzak:
"zaten yazılmış mıydı" diye sormamak).

### 2.3 · Depo YOK

`information_schema` taraması: ürün/aile/kategori belgesi tutacak **hiçbir alan yok**.
Belge/dosya taşıyan tek tablo `order_attachments` — o da sipariş ekleri, katalog değil.
Yani bugün bir üretici broşürünü yükleyecek yerimiz **yok**.

### 2.4 · 24 tedarikçi PDF'i elimizde ama müşteriye kapalı

Bugün kalıcı dizine aldık: **23 belge, 1171 sayfa, 580 tablolu sayfa**, hash'li ve
deterministik. Bu belgeler bilgi kaynağı olarak kullanılıyor ama **müşteriye açılmıyor** —
ve açılmaları düz bir teknik iş değil (bkz. §4 telif).

## 3 · Boşluğun gerçek maliyeti

Müşteri "kataloğunuz var mı" diye sorduğunda bugün verilebilecek tek şey **tek ürünlük bir
föy.** Serinin tamamını, seçim rehberini, sertifikayı veremiyoruz. Bunun üç somut bedeli var:

1. **Kaybedilen satış:** proje/ihale alıcısı sertifika ve eğri isteyince rakibe gider.
2. **Telefon yükü:** belge sitede yoksa her talep tek tek insana düşer.
3. **Görünmezlik:** PDF'ler arama motorunda da bulunur; rakip katalog yayımlarken biz yokuz.

## 4 · ⛔ İki risk — teknik değil, TİCARİ ve HUKUKİ

**4.1 · Üretici broşürünü olduğu gibi yayımlamak izin ister.** Vortice, AVenS, Nicotra,
Danfoss broşürleri **onların telif eseri**. Yetkili satıcı olarak çoğu üretici bunu teşvik
eder ama bu **varsayılamaz** — marka bazında yazılı izin ya da bayi portalındaki
"paylaşılabilir" sürüm gerekir. **Bu Recep'in ticari kararı, benim ölçebileceğim bir şey değil.**

**4.2 · Sertifika iddiası, belge olmadan yapılamaz.** Elimizde CE/ATEX/EN 12101-3 belgesi
yokken sayfada "sertifikalı" demek **vaat ihlalidir** (`vaat-butunlugu-standard.md`). Bugün
duman egzoz ve ATEX ailelerinin metinlerinde sınıf bilgisi **kaynak referansıyla** veriliyor —
yani "katalog böyle diyor" düzeyinde, "belgesi bizde" düzeyinde değil. **Bu ayrım korunmalı.**

## 5 · Önerim — iki raf, bir kural

Belgeleri kaynağına göre **ikiye** ayırmak gerekiyor; çünkü ikisinin riski ve süreci farklı:

### RAF A — BİZİM ÜRETTİĞİMİZ (izin gerekmez, bugün başlanabilir)

| Belge | Nereden | Durum |
|---|---|---|
| Ürün föyü | teknik özellikler | ✅ var |
| **Aile föyü** | bugün onayladığın 40 aile metni + altı blok | **yeni — en hızlı kazanç** |
| Kategori seçim rehberi | 23 kategori paragrafı | ⏳ hazır, bekliyor |

**Aile föyü en yüksek getirili kalem:** metin zaten yazıldı, kaynağıyla doğrulandı, sen
onayladın. Föy üreticisi zaten çalışıyor. Yani "seri broşürü" ihtiyacının büyük kısmı,
**yeni içerik üretmeden** karşılanabilir.

### RAF B — ÜRETİCİDEN GELEN (izin ve depo gerekir)

Broşür · sertifika · teknik çizim · montaj kılavuzu · performans eğrisi.
Bunlar için **önce depo** (belge tablosu + dosya alanı), **sonra izin**, sonra yükleme.
Depo yokken "elimizde var" demek anlamsız — koyacak yerimiz yok.

### KURAL (cetvel yazılacak)

Her belge için **kaynağı, sürümü ve tazeliği** kayıtlı olur:
* belge nereden geldi (üretici / bizim ürettiğimiz),
* hangi PDF hash'inden türedi (kaynak dizini bunu artık verebiliyor),
* üretici kataloğu değişince **hangi belgelerimiz bayatladı** — hash karşılaştırmasıyla
  **ölçülebilir**; bugün bu soruyu soracak bir mekanizma yok.

## 6 · Sıra önerim (Recep ve OPS kararına)

1. **`authority_content`'i doldur** — raf zaten var, en ucuz görünürlük. Önce teknik çizim
   ve sertifika **yer tutucusu değil**, gerçekten elde olan ne varsa.
2. **Aile föyü** — mevcut föy üreticisini aile seviyesine genişlet; içerik hazır.
3. **Belge deposu** — RAF B için tablo + dosya alanı (migration gerekir → Recep kapısı).
4. **Üretici izni** — marka bazında; **Recep'in işi**, ben ölçemem.
5. **Sertifika envanteri** — hangi ailede hangi belge fiilen var, listelenir; olmayan
   **"yok" diye yazılır**, boş bırakılmaz.

## 7 · Design tarafı (ayrı şerit)

Bu raporun konusu **içerik ve depo**. Belge rafının sayfada nerede duracağı, nasıl
görüneceği, indirme deneyimi **Design'ın alanı** — ve Design ayrı ilerliyor. İki şeridin
kesişmesi gereken tek nokta şu: **`authority_content` bugün Design'ın çizdiği bir bileşeni
besliyor ve boş.** Yani Design'ın çizdiği yüzey içerik bekliyor; içerik kararı verilmeden
o yüzey tamamlanmış sayılamaz.

## 8 · Bu raporun kapatmadığı

* Üretici izinlerinin durumu (hiçbiri sorulmadı — Recep'in kanalı).
* Elimizde fiilen hangi sertifika/çizim var (envanter yapılmadı; PDF'lerin içinde olabilir).
* Performans eğrilerinin kaynak PDF'lerde görsel mi veri mi olduğu (ölçülmedi).
* Belge deposunun şeması ve migration maliyeti (karar çıkarsa ölçülür).
