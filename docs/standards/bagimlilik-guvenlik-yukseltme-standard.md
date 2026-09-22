# Bağımlılık Güvenlik Yükseltme Cetveli

> Bu cetvel REC-323 ile yazıldı. Sebebi: 2026-09-13'te `pnpm audit --prod` iki CRITICAL döktü ve
> ortada **yöneten bir cetvel yoktu** — "cetvel yok" geçerli bir cevaptı ama bedava değildi
> (CLAUDE.md kural 1). Aşağıdaki her madde o günün **ölçülmüş** bir olayından çıktı; hiçbiri
> genel iyi-niyet tavsiyesi değil.

## 1 · Kim, ne sıklıkla ölçer

Ölçüm **ALTYAPI şeridinin** işidir ve `pnpm audit --prod` ile yapılır. `--prod` bayrağı
zorunludur: geliştirme zincirindeki yüzlerce uyarı canlı yüzeyle karışırsa **gerçek kalem
kaybolur**.

**Sıklık (Recep kararı 13, 2026-09-15 — kendi sözü: *"13 ve 14 evet"*):** **iki haftada bir tam
tarama** (`pnpm outdated` + `pnpm audit --prod` → `docs/audits/bagimlilik-YYYY-MM-DD.md`) **+
her güvenlik olayında anlık tarama.** Ayrıca her `next` / `@sentry/*` / `supabase-js`
yükseltmesinden sonra.

> ⚠**BU SATIR 2026-09-15'te "haftada bir"den GEVŞETİLDİ.** Gevşetme sessizce yapılmadı: iki
> yönün gerekçesi §1.1'de duruyor ve karar Recep'e **gevşetme olarak** sunuldu. ALTYAPI'nın
> önerisi haftalığı korumaktı; karar aksi yönde verildi ve uygulandı. Eski satırın
> silinmemesi kasıtlı — bir kuralın hangi yönde değiştiği, kuralın kendisi kadar bilgidir.

Otomatik kapı **bilinçli olarak yok** — audit çıktısı her gün değişir ve her gün kırmızı veren
bir kapı, üçüncü günde bakılmayan bir kapıdır (aynı sınıf: `docs/audits/` içindeki
"yeşil kapı bakmadığı şeyi kanıtlamaz" dersleri).

### 1.1 · SIKLIK REVİZYONU — **KARAR VERİLDİ** (REC-345, 2026-09-15)

✅**KARAR 13 = EVET.** Recep'in kendi sözü kayda geçti (`REC-345` yorumu, 2026-09-15 08:27Z):
*"13 ve 14 evet"*. Yukarıdaki §1 satırı buna göre güncellendi; **bu paragraf artık taslak
değil, kararın gerekçe kaydıdır.**

⚠**KARAR BİR GEVŞETMEYDİ VE ÖYLE SUNULDU:** §1 "haftada bir" diyordu, yeni satır "iki
haftada bir". Bu bir netleştirme değil **gevşetme**; onay veren kişinin neyi gevşettiğini
bilmesi gerekiyordu, o yüzden karara gevşetme olarak sunuldu. Gevşetmeyi sessizce yapmak,
cetvelin kendi geçmişini silmek olurdu.

⭐**ALTYAPI'NIN ÖNERİSİ AKSİ YÖNDEYDİ VE BU DA KAYDA GEÇİYOR:** öneri haftalığı KORUYUP
görünürlüğe güvenmekti (aşağıdaki gerekçe). Karar aksi yönde verildi; karar Recep'in,
uygulandı. Bir önerinin reddedildiğinin yazılı kalması, bir sonraki tartışmada aynı yolun
ikinci kez önerilmesini engeller.

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
tutulmasını sağlayan şey sayının kendisi değil, **görünürlüğü**. Karar bu iki seçenek ayrı
ayrı sunularak istendi; Recep gevşetmeyi seçti. ⭐**Bu yüzden görünürlük şimdi tek savunma:**
haftalık pencere gitti, yerine iki haftalık pencere ve her turda görünen bir satır geldi. O
satır susarsa kuralı tutan hiçbir şey kalmaz — kapının kendi kapısı (`INV-KANCA-DEFTER-3`)
bu yüzden var.

**Eşik: 14 gün, SABİT** (Recep kararı 13; `VENTHUB_BAGIMLILIK_ESIK_GUN` ile geçici olarak
değiştirilebilir ama varsayılan budur). Sayı kararın sıklığıyla hizalı: **iki hafta = 14
gün.** Sıklık bir gün yeniden değişirse eşik de **aynı commit'te** değişir; ikisinin
ayrışması, kapının cetveli değil kendini ölçmesi demek olurdu.

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

### 4.1 · ⭐OVERRIDE'LAR `pnpm-workspace.yaml`'DA YAŞAR — `package.json`'da DEĞİL (2026-09-21)

**Ölçülmüş olay:** karar 52'nin ilk bot turunda (PR #1278-#1282) Dependabot kilit dosyasını
pnpm 11 ile üretti. pnpm 11 `package.json` içindeki `pnpm` alanını **okumuyor**; dört PR'ın
dördünde kilit dosyasındaki `overrides:` bölümü **tamamen yoktu** — 22 override'ın 22'si düştü.
Sonuç iki kapıda birden görüldü: `ci` kurulumu `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` ile reddetti,
ve `bagimlilik-denetimi.yml` kapattığımız üç açığın (postcss ×2, rollup) **geri geldiğini**
yakaladı. Bot PR'ı birleşseydi güvenlik düzeltmelerimiz sessizce geri alınacaktı.
(Dış kaynak: dependabot-core#16232 — aynı olay başka depolarda da ölçülmüş.)

**Düzeltme ve ölçümü:** override'lar `pnpm-workspace.yaml` → `overrides:` altına taşındı,
`package.json`'dan `pnpm` alanı silindi. pnpm 10 iki yeri de okur; üç ortam da pnpm 10'dur
(Vercel **10.28.0** — derleme günlüğünden, CI `version: 10`, yerel **10.15.0**). Taşıma sonrası
`pnpm install --lockfile-only` kilit dosyasını **içerikte birebir aynı** üretti (satır sonu
normalize sha256 eşit, 22 override yerinde).

**Kural:** override **yalnız** `pnpm-workspace.yaml`'a yazılır. `package.json`'a tek satır
eklemek gerilemeyi geri getirir ve **yerelde fark edilmez** (pnpm 10 iki yeri birleştirir);
yalnız bot'un PR'ında görünür. Bu yüzden `INV-DEP-KARAR-1` eski yeri kırmızıyla tutar.
Override'ı okuyan her kapı tek noktadan okur: `scripts/hijyen/pnpm-overrides.cjs`.

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

---

## 10 · SÜRÜM KARARI GEREKÇESİZ DEĞİŞEMEZ — `INV-DEP-KARAR-1` (2026-09-19, REC-359)

Kayıt: `docs/standards/bagimlilik-kararlari.md` · Kapı:
`src/__tests__/conformance/bagimlilik-karar-kaydi.test.ts`

**Niçin:** Recep'in ilkesi (2026-09-19, birebir): *"her yapılanın izi olmalı takip edilebilmeli
tetiklenebilmeli .. otonom bir yapıya gelemeyen herşey bir gün unutulacak."* Bu cetvelin
kendisi de o sınıftaydı: §4'teki üst sınır kuralı, §3'teki tek-zincir kuralı **yazılıydı** ama
hiçbiri ölçülmüyordu. Yazmak uygulamak değildir.

**Kural:** `package.json`'da **sabit pinlenmiş** her bağımlılığın ve **her** `pnpm.overrides`
girdisinin kayıtta bir satırı olur; satırdaki aralık gerçekle **birebir** eşittir ve `KARAR`
satırının gerekçesi **aralıktaki sürüm numarasını içerir**. Sürüm değişip kayıt güncellenmezse
kapı kırmızı verir. Tetik **cron değil değişikliğin kendisidir** (REC-328).

**§1 ile çelişmez:** §1'deki "otomatik kapı bilinçli olarak yok" hükmü **audit çıktısı**
içindir — o sayı her gün değişir ve her gün kırmızı veren kapı bakılmayan kapıdır. Bu kapı
audit sayısına hiç bakmaz; yalnız **bizim yazdığımız** sürüm ile **bizim yazdığımız** gerekçe
arasındaki tutarlılığı ölçer. O ikisi ancak biz değiştirirsek değişir.

**Gerekçesi ölçülemeyen satır `BORÇ` yazılır, uydurulmaz.** Borç sayısı teste dondurulur ve
yalnız azalabilir; yeni bir paket borç olarak doğamaz.

⚠**KURULUŞ ANINDA ÖLÇÜLEN İHLAL:** §4 "override daima aralıklıdır, açık uçlu değil" diyor.
2026-09-19 ölçümünde 22 override'ın **17'si açık uçlu** (`>=x` biçiminde, üst sınırsız) çıktı —
yani bu cetvelin kendi kuralı bugün 17 yerde çiğneniyor. Kapı bunu **kapatmıyor**, çünkü tek
seferde düzeltmek her birinin ayrı ölçümünü gerektirir; **tavan olarak donduruyor**: sayı
artamaz, yalnız azalabilir. Borcun adı konmuştur, görünürdür ve büyüyemez.

---

## 11 · SÜRÜM TAKİBİNİN TETİĞİ BİZİM HAFIZAMIZ DEĞİL — karar 52 (2026-09-21)

**Karar:** Recep 2026-09-19, ALTYAPI penceresinde ilk elden: *"ops ile konuştuğum konu için bana
soracağın onaya evet diyorum."* OPS penceresindeki gerekçesi: *"sürüm takibini canlı tutmamak
ihmal, çözmezsek tekrar eder."*

**Ölçülmüş boşluk (2026-09-19):** depoda `dependabot.yml` yoktu, Dependabot uyarıları ve güvenlik
güncellemeleri **kapalıydı**, `.github/workflows/` altında hiçbir `pnpm audit` adımı yoktu. §1'deki
iki haftalık tarama kuralının tetiği bir şeridin hatırlamasıydı. Açık depoda **ücretsiz** gelen
yerleşik mekanizma tümüyle kullanılmıyordu — Recep'in 2026-09-16 ilkesinin (*"yama değil
profesyonel araç"*) tam karşılığı.

**Kurulan dört parça:**

| parça | ne yapar | nerede |
|---|---|---|
| Dependabot sürüm güncellemeleri | haftalık, gruplu; tavan 3; React/Next ve 3D **ayrı** grup (görsel doğrulama ister) | `.github/dependabot.yml` |
| Dependabot güvenlik güncellemeleri | güvenlik PR'ları tek grupta | depo ayarı + aynı dosya |
| CI denetimi | kilit dosyası değişince + haftalık: yüksek/kritik her kayıt §7'de kabul edilmiş mi, her kabul gerçek mi | `bagimlilik-denetimi.yml` + `scripts/hijyen/bagimlilik-denetimi.cjs` |
| Kabul + kaldırma şartı | ertelenen her açık ve her override **ne zaman kalkacağını** taşır | `bagimlilik-kararlari.md` §7-§8 |

**§1 ile ilişkisi:** §1'deki "otomatik kapı bilinçli olarak yok" hükmü **her gün** kırmızı veren
kapı içindi. Bu kapı her gün koşmaz: yalnız kilit dosyası değiştiğinde ve haftada bir. Haftalık
kırmızı, kilitli sürüme **sonradan** yayımlanan bir kayıttır — görünmesi gereken şeyin ta kendisi.
Zamanlayıcı kullanımı karar 53 ile açıktır.

**Bot kendiliğinden birleşmez.** Her bot PR'ı merge ritüelinden geçer. Bot bir sabit pini ya da
override'ı değiştirirse `INV-DEP-KARAR-1` kayıt güncellenmeden kırmızı kalır: **bot sürümü
değiştirir, gerekçeyi insan yazar.** Bu kasıtlıdır.

**Maliyet ölçüldü (2026-09-21):** bot dalları `dependabot/...` adını taşır; `scripts/vercel-ignore-build.sh`
`master` dışındaki her dalı atladığı için Vercel'de **sıfır derleme** harcar. Actions dakikası açık
depoda ücretsizdir.

**Sınırları — adıyla:**
- Kabul listesinin iki yönlü eşitliği **kimlik** düzeyindedir (GHSA). Aynı açığın farklı kimlikle
  yeniden yayımlanması yeni kayıt sayılır — doğru davranış, ama gürültü üretebilir.
- ~~Aksiyonlar etiketle sabitli~~ → **§12 ile SHA'ya geçildi (2026-09-22).**
- Bot PR'larının iş akışı gürültüsü ilk haftalarda ölçülecek; tavan ölçüme göre değişir.

## 12 · DIŞ AKSİYON ETİKETLE DEĞİL SHA İLE SABİTLENİR — `INV-AKSIYON-SHA-1` (2026-09-22)

**Karar:** OPS kabulü, 2026-09-22 (ALTYAPI hükmü). Biçim: `uses: sahip/ad@<40 hex SHA> # vX.Y.Z`.
Yerel aksiyonlar (`./...`) kapsam dışı.

**Niçin:** Etiket değiştirilebilir bir işaretçidir; aksiyon deposu ele geçirilirse etiket kötü
commit'e taşınır ve bizim iş akışımız onu **sessizce** koşar (tj-actions/changed-files, Mart 2025:
etiket taşındı, iş akışı sırları loglara döküldü). Repo **PUBLIC** — log herkese açık.
**Ölçülen maruziyet (2026-09-22):** 55 `uses:` satırının **0**'ı SHA'lıydı; üçüncü taraf aksiyon
(`pnpm/action-setup`, `supabase/setup-cli`, `denoland/setup-deno`) ile sır AYNI işte 5 iş
akışında buluşuyordu — en ağırı `deploy-functions.yml`: üretime edge fonksiyonu dağıtan token.

**Güncelleme:** Dependabot SHA'yı ve sürüm yorumunu birlikte günceller. `aksiyonlar` grubu yalnız
küçük/yama sürümleri toplar; ana sürüm her aksiyon için ayrı PR gelir ve ayrı ölçülür
(2026-09-22: #1278 sekiz ana sürümü tek PR'da getirdi, ölçülemeden kapatıldı).

**Bekçi:** `src/__tests__/conformance/aksiyon-sha-pin.test.ts` — dış `uses:` satırı SHA + sürüm
yorumu taşımıyorsa KIRMIZI; sabotaj kolu etiketli satırı yakaladığını kanıtlar.
