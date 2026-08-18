# Dağıtım Atlama Cetveli (Ignored Build Step) — v1.1

> **Kapsam:** Vercel'de hangi değişikliğin build tetikleyeceği.
> **Bekçi:** `src/__tests__/conformance/build-skip-positive-logic.test.ts` (INV-BUILD-SKIP).
> **Betik:** `scripts/vercel-ignore-build.sh`
> **Doğuş sebebi:** T086 — dağıtım tavanının **%47'si israftı** (2026-08-17 ölçümü);
> altı adet salt-Markdown PR'ı tek başına günlük tavanın **%12'sini** yakmıştı. Tavan
> dolunca tüm filo durur, yani bir doküman commit'i kod PR'ının önünü keser.

---

## D1 — Çıkış kodu sezgiye TERSTİR

```
exit 0  →  build ATLANIR   (ignore)
exit 1  →  build ÇALIŞIR   (continue)
```

"Başarı" (0) burada "yapma" demektir. Ters çevirmek **her build'i sessizce atlar** ve
hiçbir kırmızı üretmez — dağıtım "başarılı" görünür, sadece hiçbir şey değişmez.
INV-BUILD-SKIP'in asıl varlık sebebi bu sessiz felaketi imkânsız kılmaktır.

## D2 — POZİTİF mantık, varsayılan "BUILD ET" (DEĞİŞMEZ)

Soru **"hangi değişiklik build'i atlayabilir"** diye kurulmaz. Tersi sorulur:

> **"Bu değişiklik build GEREKTİRİR Mİ?" — bilmiyorsak, GEREKTİRİR.**

Negatif liste ("şunlar tetiklemesin") yazılırsa, listeye eklemeyi unuttuğumuz **her yeni
dosya türü sessizce build'i atlar**. Bu, 2026-08-15 vitrin kazasının kardeşidir: kod/veri
değişti, yüzey değişmedi, hiçbir kapı görmedi. Bu yüzden **tanınmayan her şey build'i
tetikler**; yalnız §D3'te ADIYLA sayılan sınıf atlanır.

## D3 — Build gerektirmeyen sınıf (pozitif liste)

| Desen | Gerekçe |
|---|---|
| `*.md` (her yol) | Ölçüldü (2026-08-18): depoda **hiçbir kod `.md` import etmiyor**, `next.config.mjs`'te MDX/remark yok. Companion doküman üretimi de `.md` yazar — israfın ana kaynağı buydu. |
| `docs/**` | Salt doküman ağacı |
| `.claude/**` · `.agent/**` | Ajan yetenek ağaçları; derlemeye girmez |
| `.github/**` | CI yapılandırması; Vercel çıktısını etkilemez |
| `registry/**` | İş emri kayıtları |
| `LICENSE` | Metin |

**Bilerek DIŞARIDA (build tetikler):** `supabase/migrations/**` — build'i doğrudan
etkilemez, ama önizleme dağıtımı migration'ın vitrine yansımasını görmenin **tek**
yoludur ve bu depoda migration merge'i prod'a **otomatik** uygulanır. Ayrıca
`.gitignore`, `package.json`, tüm yapılandırma ve elbette `src/**`.

**Listeye ekleme kuralı:** yeni bir sınıf eklemek isteyen, "bu dosya türü derlemeye
girmiyor" iddiasını **ölçerek** kanıtlar (import taraması + yapılandırma kontrolü) ve
INV-BUILD-SKIP'e o sınıf için bir assert ekler. Gerekçesiz satır eklenmez.

## D4 — Karşılaştırma tabanı `VERCEL_GIT_PREVIOUS_SHA`, `HEAD^` DEĞİL

Bu değişken **son BAŞARILI dağıtımın** SHA'sıdır — önceki commit değil. Arka arkaya
birkaç commit atlanmışsa `HEAD^` yalnız en son commit'e bakar ve daha önceki, atlanmaması
gereken bir kaynak değişikliğini **göremez** → "kod değişti, deploy olmadı".
Son başarılı dağıtımdan bu yana biriken **tüm** değişiklikler karşılaştırılır.

> Not: `VERCEL_GIT_PREVIOUS_SHA` yalnız Ignored Build Step yapılandırıldığında ortama
> verilir; yoksa (ilk dağıtım) betik **BUILD**'e düşer.

## D5 — Fail-safe: her belirsizlik BUILD'e düşer

| Durum | Karar |
|---|---|
| `git` komutu başarısız | BUILD |
| Taban commit klonda yok (sığ klon / force-push) | BUILD |
| Değişen dosya listesi **BOŞ** | BUILD |

Sonuncusu kritik: boş liste "hiçbir şey değişmedi" değil, **"ölçemedim"** olabilir. Boş
kümede "her dosya güvenli" iddiası **vacuous olarak doğrudur** ve kapıyı sessizce açar.

## D6 — Kapı davranışı ölçer, metni değil

INV-BUILD-SKIP betiği **gerçekten çalıştırır** (fixture dosya listesiyle) ve çıkış kodunu
okur. Betiğin metnine bakan bir test, `case` dallarının gerçekte ne yaptığını göremez.
Kapı ayrıca `sh` hiç çalışmazsa **hata fırlatır** — "ölçemedim ama yeşilim" durumunu
imkânsız kılar.

---

## Kurulum — YAPILDI (2026-08-18, sahada doğrulandı)

Ayar **canlı**. Kaynak: **Vercel dashboard** (repo içi yapılandırma dosyası DEĞİL — bkz. D7).

1. Vercel → proje `venthub-hvac-esite` → **Settings** → **Build and Deployment**
   → doğrudan bağlantı: `/peckops-projects/venthub-hvac-esite/settings/build-and-deployment`
2. **Ignored Build Step** → *Behavior*: **Custom**
3. Komut kutusuna **tam olarak** (sondaki `|| exit 1` ZORUNLU — sebebi §D10):

```
sh scripts/vercel-ignore-build.sh || exit 1
```

4. **Save**.

> **DÜZELTME — cetvel iki kişiyi olmayan bir sayfaya gönderdi.** v1.0'da bu adım
> "Settings → **Git**" yazıyordu; orada **Ignored Build Step diye bir alan yok**.
> Recep sayfayı arattı, bulamadı; doğru yer **Build and Deployment**. Kusurun sınıfı
> ölçülmemiş talimatı ölçülmüş gibi yazmaktı — o bölüm zaten "dashboard erişimi bende
> yok" diye işaretliydi, yani **kendi belirsizliğini taşıyordu ama emir kipiyle konuştu.**
> Ders: erişemediğim bir yüzeyin adımını yazarken **adı değil, adı ARAMANIN yolunu** ver
> (ayarın kendi metnini arat), ya da doğrulanana dek "önerilen" diye işaretle.

## D7 — Ayarın TEK kaynağı: dashboard (yapılandırma dosyası ALTERNATİFTİR, EK DEĞİL)

Aynı ayar iki yerden verilebilir:

| Kaynak | Durum |
|---|---|
| **Vercel dashboard** → Ignored Build Step | ✅ **UYGULANAN** (2026-08-18'den beri canlı) |
| Repo kökünde `vercel.json` / `vercel.ts` → `ignoreCommand` | ⚠️ **ALTERNATİF — kurulu DEĞİL** |

**İkisini birden koymak yasak.** Vercel dokümanına göre yapılandırma dosyasındaki
`ignoreCommand` **dashboard ayarını EZER**. Yani dosyayı ekleyen kişi, farkında olmadan
canlı ayarı devre dışı bırakır ve iki kaynak sessizce çelişir — bu deponun bu hafta
iki kez yaşadığı **çift-cetvel** sınıfının aynısı.

Yapılandırma dosyasına **geçilecekse**: önce dashboard *Behavior*'ı **Automatic**'e
çevir, sonra dosyayı ekle. Sıra tersse hangi kaynağın konuştuğu belirsiz kalır.

### Kurulum sonrası ÖLÇÜM — yapıldı (2026-08-18, PR #664)

Deney: içinde **hiç kod değişikliği olmayan**, salt-Markdown bir PR. Dağıtım günlüğünden
ham satırlar:

```
Running "sh scripts/vercel-ignore-build.sh"
ignore-build: VERCEL_GIT_PREVIOUS_SHA yok (ilk dagitim?) -> BUILD
```

**Üç şey birden öğrenildi:**

1. ✅ **Kurulum çalışıyor.** Betik gerçekten koşuyor — dashboard ayarı canlı.
2. ✅ **Vercel kapısı `success` veriyor**, `pending`'de kalmıyor. Yani korkulan
   "doküman PR'ları merge edilemez hale gelir" senaryosu **gerçekleşmedi** ve
   açık doküman PR'ları için bir tehlike yok.
3. ❌ **Atlama ÖNİZLEME dallarında çalışmadı.** `VERCEL_GIT_PREVIOUS_SHA` boş geldi,
   betik güvenli tarafa düşüp build etti.

> **DÜZELTME (aynı gün, 11:46 master dağıtımı).** Yukarıdaki (3)'ü ilk yazdığımda
> *"atlama HİÇ çalışmadı, T086 sıfır tasarruf sağladı"* demiştim. **Fazla genişti.**
> Master (üretim) dağıtımının günlüğü şunu yazıyor:
>
> ```
> ignore-build: build GEREKTIREN degisiklik: src/__tests__/.../currency-not-from-language.test.ts -> BUILD
> ```
>
> Yani **master'da değişken DOLU geliyor** (o dal için son başarılı dağıtım vardır) ve
> betik gerçek bir taban karşılaştırması yapıp doğru kararı veriyor. Çalışmayan yer
> **önizleme dalları**: bu depoda kural *bir-iş-bir-dal* olduğu için her önizleme bir
> dalın ilk dağıtımıdır ve orada böyle bir taban yoktur.
>
> Doğru ifade: **T086 üretim tarafında çalışıyordu, önizleme tarafında hiç çalışmadı.**
> Tasarrufun asıl beklendiği yer önizlemeler olduğu için pratik kazanç yine küçüktü —
> ama "hiç çalışmadı" demek ölçümden fazlasını iddia etmekti.

**(3) niçin sessizdi:** betik doğru davrandı (bilmiyorsan build et), dolayısıyla
hiçbir kırmızı üretmedi. Kapı da göremezdi — bekçi betiği *dosya-listesi kipinde*
koşturuyordu ve **taban çözümü o yoldan hiç geçmiyordu**, yani kapının kapsamı
dışındaydı. Kusurun sınıfı: **ölçülmemiş premis** — "değişken dolu gelir" varsayımı
hiç sınanmamıştı ve gerekçesi (v1'de yazılıydı) kendi başına doğru olduğu için
inandırıcı görünüyordu. *Doğru gerekçe, ölçülmemiş premis.*

> **Hâlâ açık olan yarım:** *gerçekten atlanan* bir build'de kapının ne rapor ettiği
> ölçülmedi — çünkü atlama bir kez bile gerçekleşmedi. Bu düzeltmeden sonraki ilk
> salt-Markdown PR'ı o yarımı kapatacak; günlükte `taban = ... ortak ata` satırı
> aranacak. Sonuç buraya yazılır.

## D8 — Karşılaştırma tabanı bir ZİNCİRDİR, tek değişken değil

| Sıra | Taban | Koşul |
|---|---|---|
| 1 | `VERCEL_GIT_PREVIOUS_SHA` | Yalnız commit **bu klonda gerçekten varsa** |
| 2 | `git merge-base HEAD origin/<varsayılan dal>` | (1) çözülemezse |
| — | *(hiçbiri)* | → **BUILD** |

(1) en doğrusudur: son **başarılı** dağıtımdan bu yana biriken tüm değişiklikleri
kapsar. Ama **yeni bir dalın ilk dağıtımında yoktur** ve bu depoda kural
*bir-iş-bir-dal* olduğu için neredeyse her önizleme dağıtımı öyledir.

(2) dalın **tamamını** kapsar; dalın içindeki eski bir kaynak değişikliği de görülür.

**`HEAD^` yasağı sürüyor** ve gerekçesi değişmedi: yalnız son commit'e bakar, arka
arkaya atlanmış commit'lerden sonra daha eski bir kaynak değişikliğini göremez →
"kod değişti, deploy olmadı". Ortak ata bu tuzağa düşmez.

Zincirin **hangi adımının kazandığı günlüğe yazılır**. Bu tesadüfi bir ayrıntı değil:
yukarıdaki kusur tam olarak "hangi dalın çalıştığını göremediğimiz" için sessiz kaldı.

### Kapı bunu nasıl ölçüyor

INV-BUILD-SKIP artık **gerçek geçici git deposu** kurar (`git init`, commit'ler,
`origin/master`'ı `update-ref` ile yazar — ağ yok) ve betiği o deponun içinde koşturur.
Bilerek bozularak kanıtlandı:

| Sabotaj | Yakalayan assert |
|---|---|
| Zincirin 2. adımını kaldır (v1 davranışı) | *salt-.md dal ATLANIR* → kırmızı |
| `merge-base` yerine `HEAD^` koy | *dalın önceki commit'inde kod varsa BUILD* → kırmızı |

İkincisi önemli: `HEAD^`'i yasaklayan **statik** assert bu sabotajı **yakalamadı**
(sabotaj `git diff HEAD^` değil `git rev-parse HEAD^` yazıyordu). Yakalayan şey
davranış testiydi — metin arayan kapının neyi göremediğinin canlı örneği.

## D10 — Komutun KENDİSİ çuvallayabilir; çıkış kodu sözleşmesi komutta zorlanır

**Kurulan komut (DEĞİŞMEZ):**

```
sh scripts/vercel-ignore-build.sh || exit 1
```

Sondaki `|| exit 1` süs değil, **sözleşmenin zorlanmasıdır**.

**Yaşanmış kusur (2026-08-18, filo çapında):** komut ilk kurulduğunda `|| exit 1` yoktu.
Betik `#660` ile master'a girdiği için **ondan eski tabanlı her dalda dosya yoktu** ve
dağıtım günlüğü şunu yazdı:

```
Running "sh scripts/vercel-ignore-build.sh"
sh: scripts/vercel-ignore-build.sh: No such file or directory
```

`sh` **127** ile çıkar. Vercel bu komuttan yalnız **iki** cevap anlar — `0` atla, `1`
build — ve başka her kodu **dağıtım hatası** sayar. Sonuç: açık 11 PR dalının **10'u**,
kodunda hiçbir kusur olmadan kırmızı verdi.

**Sınıfın adı:** betiğin İÇİNDE çıkış kodu sözleşmesi üç yerde uyarıyla yazılıydı, ama
**komutun kendisinin başarısız olabileceği** hiç hesaba katılmamıştı. Yani sözleşme
korunuyordu — sözleşmeyi çağıran kabuk satırı hariç. *Kapıyı sertleştirirken kapının
kolunu unutmak.*

`|| exit 1` davranışı:

| Betik | Çıkış | Sonuç |
|---|---|---|
| var, "atla" der | 0 | zincir kırılmaz → **ATLA** |
| var, "build" der | 1 | → **BUILD** |
| **yok / patlıyor / sözdizimi hatalı** | 127, 2, … | `\|\|` devreye girer → **BUILD** |

Yani bilinmeyen her hâl güvenli tarafa, yani build'e düşer — betiğin kendi iç tasarımıyla
(D2) aynı yön.

**Bu düzeltmenin alternatifi 10 dalın master alması olurdu:** 10 gönderim, 10 deployment,
ve kotanın bizi o gün zaten iki kez reddettiği bir ortam. Tek satır, sıfır gönderim.

## D9 — Kota reddi bir COMMIT harcar (ölçüldü, tahmin çürüdü)

Bu cetvelin varlık sebebi dağıtım israfı, o yüzden kotanın **gerçek** davranışı buraya yazılır.

**Çürüyen model:** "son dağıtımdan ~20 dk sonra gönderim geçer". Vercel'in kendi
kayıtları bunu reddetti (2026-08-18):

```
06:49 · 06:50 · 06:53 · 06:54 · 06:57 · 07:04 · 07:04   ← 15 dakikada YEDİ dağıtım
...
11:21 geçti (8 dk sonra)   ·   11:33 REDDEDİLDİ (12 dk sonra)
```

Sabit bir aralık bu veriyi açıklayamaz. **Aralık tahminine dayalı plan kurmayın.**

**Asıl operasyonel kural — asimetri buradadır:**

| Olgu | Sonuç |
|---|---|
| Reddedilen deneme **deployment yaratmaz** | Beklemek bedavadır |
| Reddedilen deneme kırmızı bir **commit status** bırakır | Ve o status **depo tarafından yeniden tetiklenemez** |
| Yeni deneme = **yeni commit** | ⇒ **kör tekrar COMMIT harcar** |

Yani "olmadıysa tekrar dene" burada masumca bir davranış değil; her denemenin bedeli
bir commit'tir. Force-push bu depoda yasak olduğu için `--amend` ile kaçamak da yok.

**Bedava prob:** başka bir şeridin açık PR'ında, senin reddinden **sonra** yazılmış bir
`pending`/`success` Vercel status'u ara. Varsa pencere açıktır. Kendi commit'ini
harcamadan ölçmenin bilinen tek yolu budur.

### Geri alma

Ignored Build Step *Behavior*'ı **Automatic**'e çevirmek yeterli; repoda değişiklik
gerekmez. Betik ve bekçi zararsız biçimde durur.
