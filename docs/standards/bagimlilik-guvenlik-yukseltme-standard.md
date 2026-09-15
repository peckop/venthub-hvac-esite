# Bağımlılık Güvenlik Yükseltme Cetveli

> Bu cetvel REC-323 ile yazıldı. Sebebi: 2026-09-13'te `pnpm audit --prod` iki CRITICAL döktü ve
> ortada **yöneten bir cetvel yoktu** — "cetvel yok" geçerli bir cevaptı ama bedava değildi
> (CLAUDE.md kural 1). Aşağıdaki her madde o günün **ölçülmüş** bir olayından çıktı; hiçbiri
> genel iyi-niyet tavsiyesi değil.

## 1 · Kim, ne sıklıkla ölçer

Ölçüm **ALTYAPI şeridinin** işidir ve `pnpm audit --prod` ile yapılır. `--prod` bayrağı
zorunludur: geliştirme zincirindeki yüzlerce uyarı canlı yüzeyle karışırsa **gerçek kalem
kaybolur**.

Sıklık: haftada bir, ve her `next` / `@sentry/*` / `supabase-js` yükseltmesinden sonra.
Otomatik kapı **bilinçli olarak yok** — audit çıktısı her gün değişir ve her gün kırmızı veren
bir kapı, üçüncü günde bakılmayan bir kapıdır (aynı sınıf: `docs/audits/` içindeki
"yeşil kapı bakmadığı şeyi kanıtlamaz" dersleri).

### 1.1 · ⚠SIKLIK REVİZYONU — **TASLAK, ONAY BEKLİYOR** (REC-345, 2026-09-15)

⛔**BU PARAGRAF HENÜZ KURAL DEĞİL.** Recep onayı gelmedi; onay gelene kadar geçerli olan
sıklık **yukarıdaki satırdır** (haftada bir).

Önerilen yeni sıklık: **iki haftada bir tam tarama + her güvenlik olayında anlık tarama.**

⚠**BU ÖNERİ MEVCUT KURALI GEVŞETİYOR, ADIYLA YAZILIYOR:** yukarıdaki satır "haftada bir"
diyor; öneri bunu **iki haftaya** çıkarıyor. Yani bu bir netleştirme değil, bir **gevşetme**
ve öyle karara sunulmalı. Gevşetmeyi sessizce yapmak, cetvelin kendi geçmişini silmek olurdu.

Gevşetme lehine ölçülmüş gerekçe: tarama çıktısı her gün değişir ve haftalık tam tarama
pratikte **koşturulmadı** — 2026-09-15'te ölçüldü, son yazılı kayıt bu tarihten öncesine ait
değil, yani haftalık kural yazılıydı ve **tutulmadı.** Tutulmayan bir sıklık, olmayan bir
sıklıktan daha kötüdür: kayda uyulduğu sanılır.

Gevşetme aleyhine gerekçe (aynı ölçümde): bugün **11 yüksek** kayıt var ve hepsi tek bir
doğrudan bağımlılıktan geliyor (`docs/audits/bagimlilik-2026-09-15.md` §2). İki haftalık
pencere, böyle bir kalemin görünmesini geciktirir.

⭐**ASIL DÜZELTME SIKLIK DEĞİL, GÖRÜNÜRLÜK OLABİLİR:** haftalık kural tutulmadı çünkü
hatırlanması gerekiyordu. REC-345 ile tarama tazeliği artık her turun başında görünen bir
satıra bağlandı (`⚠BAGIMLILIK: son tarama N gun · high H`). Yani sıklık kuralının
tutulmasını sağlayan şey sayının kendisi değil, **görünürlüğü**. Bu yüzden karar sunulurken
iki seçenek ayrı ayrı sorulur: sıklığı gevşetmek mi, yoksa haftalık kuralı KORUYUP
görünürlüğe güvenmek mi.

**Eşik:** açılış satırı **14 gün** varsayılanıyla uyarır (`VENTHUB_BAGIMLILIK_ESIK_GUN`).
Bu sayı taslaktaki sıklıkla hizalı; sıklık haftalık kalırsa eşik de **7** olmalıdır ve
kapının varsayılanı o gün değişir. İkisinin ayrışması, kapının cetveli değil kendini
ölçmesi demek olurdu.

## 2 · Şiddet tek başına süre belirlemez — MARUZİYET ölçülür

⛔**Manşet şiddeti bir eylem emri değildir.** "2 CRITICAL" gördüğünde önce beş soruyu ölç:

1. **Barındırıcı beyanı var mı?** Platform açığı kendi tarafında kapattıysa, canlı maruziyet
   düşer. Kaynak **birincil** olmalı (satıcının kendi changelog'u), blog/haber **kanıt değildir**.
2. **İlgili özellik bizde açık mı?** (2026-09-13 örneği: `images.unoptimized: true` olduğu için
   AVIF kolu bizde kapalıydı.)
3. **Açığın hedeflediği kod deseni bizde var mı?** (`'use server'` sayısı 0 → iki Server Actions
   advisory'si uygulanmıyordu. `async rewrites()` yok → üçüncüsü de.)
4. **Yalnız belirli bir işletim sistemini mi vuruyor?** ⭐O gün asıl açık kol buradan çıktı:
   Windows RCE canlıda yoktu (Linux) ama **geliştirme makinesi Windows**. En sağlam gerekçe
   canlı değil, **yerel ortam** oldu.
5. **Platform beyanı KAÇ kalemi kapsıyor?** O beyan yalnız o iki kritik içindi; aynı yükseltme
   hattının kapattığı 4 high + 5 moderate **kapsam dışıydı**.

Süre eşiği bu beş ölçümden sonra yazılır:
kimliksiz uzaktan kod çalıştırma **ve** maruziyet doğrulanmış → **aynı gün**;
maruziyet platform/yapılandırma ile düşmüş → **o haftanın bir gece işi**;
yalnız geliştirme zinciri → **kuyruğa**.

## 3 · Tek PR = tek zincir

Bir PR'da **bir paket ailesi** yükseltilir. Gerekçe ölçülmüş: üç ayrı zinciri (next, sentry,
postcss) tek PR'a koymak, kapı kırmızı verdiğinde **hangi adımın kırdığını ölçülemez** yapar —
"iş kırmızı değil ADIM kırmızı" (`memory/is-kirmizi-degil-adim-kirmizi`).

## 4 · `pnpm.overrides` yazma kalıbı

Dolaylı bir bağımlılık (ör. `. > isomorphic-dompurify > jsdom > undici`) doğrudan yükseltilemez;
`pnpm.overrides` kullanılır.

⛔**ÜST SINIR ZORUNLUDUR.** `">=7.29.0"` yazmak **ana sürüm atlatır**: 2026-09-13'te tam bu
kalıp `undici`'yi **8.10.2**'ye çıkardı ve bunu ancak kilit dosyasını okuduğum için yakaladım.
Doğrusu `">=7.29.0 <8.0.0"`. Kural: **override daima aralıklıdır, açık uçlu değil.**

⚠`package.json` katı JSON'dur, **yorum kabul etmez** — gerekçe PR gövdesine ve bu cetvele
yazılır, dosyaya yazılamaz. (REC-323 planı "gerekçe yorumuyla" diyordu; ölçümde bunun
imkânsız olduğu görüldü, plan düzeltildi.)

Override doğrudan beyanı **bastırır**: bir paket hem doğrudan bağımlılık hem override ise,
kilit dosyasında override'ın aralığı görünür. Bu kasıtlı olabilir (taban tek yerden gelir) ama
**bilinerek** yapılmalı.

## 5 · "Çağıranı yok" iddiası DİNAMİK İMPORT'U DA ARAR

⭐Bu madde bir hatadan doğdu ve cetvelin en pahalı satırı.

2026-09-13'te bir paketin kaldırılmasına karar verilmek üzereydi; gerekçe "kodda çağıranı yok"
ölçümüydü. **İki ayrı şerit bağımsız ölçtü ve İKİSİ DE aynı yanlışa düştü**, çünkü ikisi de
statik kalıbı aradı:

```
from 'paket'   ·   require('paket')
```

Oysa sekiz betik paketi **çalışma anında** yüklüyordu:

```js
const { default: sharp } = await import('sharp');
```

Kaldırılsaydı katalog görsel dönüştürme hattı kırılacaktı ve **hiçbir kapı görmeyecekti**
(o betikler CI'da koşmuyor).

**Kural:** bir bağımlılığı kaldırmadan önce arama **dört kalıbı** kapsar —
`from 'x'` · `require('x')` · `import('x')` · `importSync/createRequire('x')`.
Ve pnpm'in katı yerleşiminde **yalnız doğrudan bağımlılıklar** proje kökünden çözülebilir:
paket başka bir paketin altında duruyor diye betiklerin onu `import` edebileceği **varsayılamaz**.

## 6 · Worktree tuzağı — `node_modules` PAYLAŞILABİLİR

⛔Bu depoda bazı worktree'lerin `node_modules` dizini **ana depoya bir sembolik bağdır**
(2026-09-06'da disk tasarrufu için bilinçli kurulmuş). Sonucu şudur:

**Böyle bir worktree'de `pnpm install` koşmak, ANA DEPONUN bağımlılıklarını o worktree'nin
`package.json`'ına göre yeniden kurar** — yani başka şeritlerin ağacını sessizce değiştirir.
pnpm bunu "will be removed and reinstalled from scratch" diye sorar; o soru bir uyarıdır.

**Kural:** bağımlılık işinde önce ölç —
`ls -ld node_modules` sembolik bağ mı?
Bağsa **`pnpm install` KOŞULMAZ**; yerine `pnpm install --lockfile-only` kullanılır: kilit
dosyasını üretir, `node_modules`'a **dokunmaz** (ölçüldü: önce/sonra `.pnpm` paket sayısı 1247 = 1247).

## 7 · Kapı stratejisi: doğrulama yeri CI'dır, ve bu SÖYLENİR

Yukarıdaki kısıtın doğal sonucu: yükseltmenin gerçek kapıları (`build`, `type-check`, test,
smoke) **yerelde koşamaz**, çünkü yerel ağaçtaki paketler hâlâ eski sürümdedir. Yerelde koşulan
bir kapı "yeşil" derse **yanlış şeyi ölçmüş olur**.

**Kural — fail-open ama SESSIZ DEĞİL:** bu durumda
(a) yerelde **package.json'u okuyan** kapılar koşulur (`dependency-pins`,
`peer-dependency-integrity` — bunlar anlamlıdır);
(b) kilit dosyası **elle okunarak** çözülen sürümler doğrulanır (kanıt satırı PR'a yazılır);
(c) kalan kapıların **CI'da** koştuğu ve yerelde **koşulamadığı** PR gövdesinde **adıyla**
belirtilir. Atlanan kapı, atlandığı yazılmadıkça atlanmamış sayılır.

## 8 · Canlı doğrulama ölçütü "200" olmak zorunda değil

Deploy sonrası ölçütü **mevcut davranıştan** türet, varsayımdan değil — ve o davranışı
**ölç**, bir yorumdan ya da başka bir şeritten **aktarma**.

2026-09-13'te `/_next/image` ucu için "200 bekle" ölçütü **yanlış** olurdu. Ama bu maddenin ilk
hâli de yanlıştı: beklenen kodu **402** diye yazdım, çünkü `next.config.mjs` içindeki yorumdan
ve akranın emrinden öyle aktardım. **Ölçüm başka çıktı: 404.**

Ayırt edici ölçüm (çünkü 404 "kaynak görsel yok" da demek olabilirdi):
`/_next/image` ucu **parametresiz**, **uydurma kaynakla** ve **var olan gerçek bir görselle**
denendi → **üçü de 404**; aynı görsel doğrudan servis edildiğinde **200 / 72.932 bayt**.
Yani uç **hiç kayıtlı değil** — `images.unoptimized: true` olduğunda Next optimizasyon rotasını
**kurmuyor bile**. 402 rakamı optimizasyonun **kapatılmasından önceki** hâldi (kota reddi);
kapatıldıktan sonra kod 402 değil **404** oldu ve yorum bu geçişte bayatladı.

⭐Bunun güvenlik tarafında bir yan faydası var ve ölçülmüş bir kanıttır: o günün AVIF kritik
açığı **Image Optimization API'nin içinde** yaşıyor ve **o uç bizde 404 veriyor**. Bu, platform
beyanından bağımsız, kendi ölçtüğümüz ikinci kanıttır.

**Kural:** beklenen kodu bir **yorumdan** ya da bir **akran mesajından** almak, onu ölçmek
değildir. Deploy öncesi ve sonrası **aynı ucu** ölç; ölçüt **"değişmemiş olması"**, ve
"değişmemiş"in referansı **senin kendi ölçümün** olmalı.
(Aynı sınıf: yorumlar bayatlar — `memory/duzeltilmis-ama-kosulmamis-arac`.)

⚠Ölçütü seçerken **kanonik davranışı** da ölç: kök adres `/` **308** veriyor ve dil ekli
`/tr` 200 — "ana sayfa 200" ölçütü `/` üzerinde koşulursa yanlış kırmızı verir.

## 9 · Bu cetvelin kendi sınırları

Örneklerin tamamı **tek bir günün** (2026-09-13) ölçümlerinden geliyor; ikinci bir vakayla
sınanmadı. Şiddet→süre eşiği bir **öneri**, ölçülmüş bir eşik değil. Madde 6'daki sembolik bağ
ölçümü **bu makinede** yapıldı; başka bir kurulumda düzen farklı olabilir — o yüzden kural
"varsay" değil "ölç" diyor.

İlgili: REC-323 · `memory/is-kirmizi-degil-adim-kirmizi` · `memory/yesil-kapi-gorundugunu-kanitlamaz`
