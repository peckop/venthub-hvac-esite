# Bağımlılık Sürüm Kararları — KAYIT

> **Bu bir belge değil, bir KAPININ VERİSİDİR.** `INV-DEP-KARAR-1`
> (`src/__tests__/conformance/bagimlilik-karar-kaydi.test.ts`) aşağıdaki tabloyu
> `package.json`'daki **gerçek** değerlerle satır satır karşılaştırır. Bir sürüm değişip bu
> tablo güncellenmezse **kapı kırmızı verir**. Yani tabloyu güncel tutan şey hatırlamak değil,
> değişikliğin kendisidir.
>
> Yöneten cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` **§10**.

## 1 · Niçin var — Recep'in ilkesi (2026-09-19)

> *"her yapılanın izi olmalı takip edilebilmeli tetiklenebilmeli .. otonom bir yapıya gelemeyen
> herşey bir gün unutulacak."*

Sürüm kararları tam bu sınıftandı: `next` niçin 15.5.24'te sabitlendi, `undici` niçin üst sınırlı
yazıldı — cevapları PR gövdelerinde ve denetim kayıtlarında dağınık duruyordu. Üç ay sonra biri
sürümü değiştirdiğinde o gerekçelerin **hiçbiri karşısına çıkmayacaktı.** Kayıt bu boşluk için var:
gerekçe artık değişikliğin yolunun üstünde duruyor.

## 2 · Evren — kimler bu tabloda olmak ZORUNDA

Kapı evreni `package.json`'dan **ölçer**, buradan okumaz:

1. `dependencies` / `devDependencies` / `optionalDependencies` içinde **sabit pinlenmiş**
   (aralık işareti taşımayan, doğrudan sürümle yazılmış) her paket. Sabit pin bir tercihtir;
   tercihin gerekçesi olur.
2. `pnpm-workspace.yaml` → `overrides:` içindeki **her** girdi. Override zaten tanımı gereği
   bir müdahaledir. ⚠2026-09-21'e kadar `package.json` → `pnpm.overrides` altındaydı; pnpm 11
   o alanı okumadığı için Dependabot 22 override'ı kilit dosyasından düşürdü ve taşındı
   (cetvel §4.1). Eski yere geri dönüş `INV-DEP-KARAR-1`'de kırmızıdır.

`^` ile yazılmış aralıklar kapsam dışıdır — onlar bilerek akmaya bırakılmıştır, tekil bir karar
değildir. Bu sınır bilinçlidir, muafiyet listesi değildir: gönüllü olarak eklenen satır (evrende
olmasa da) aynı kurallara tabi olur.

### 2.1 · ⭐TAM PİN İSTİSNADIR — Recep kuralı, 2026-09-19

> *"salak saçma gereksiz sebeplerle kendimizi sabitlemeyelim; gerçek bir sebep varsa da bilelim."*

Tam pin (aralıksız, tek sürüm) **varsayılan değil istisnadır.** Gerekçesi **ölçülmemiş** her tam
pin bir **GEVŞETME ADAYI**dır: kaldırılması gerektiği değil, **sınanması gerektiği** anlamına
gelir. Kapı bunları ayrı sayar ve sayı **artamaz** (`GEVSETME_ADAYI_TAVANI`).

⛔"Sebep yok" demek bir **denemeyi** gerektirir, bir çıkarımı değil: ayrı dalda gevşet, derle,
testleri koştur, etkilenen ekranı **görsel olarak** doğrula. Deneme yapılmadan bir pin
gevşetilmez; ama gerekçesi de yazılmadan **KARAR** sayılmaz. İkisinin arası `BORÇ`tur.

## 3 · Sütunlar

| sütun | anlamı |
|---|---|
| **paket** | `package.json`'da yazdığı gibi, birebir |
| **aralık** | kayda geçen değer; `package.json`'daki **gerçek** değere birebir eşit olmalı |
| **tarih** | kararın alındığı gün |
| **durum** | `KARAR` (gerekçe kanıtlı) · `BORÇ` (gerekçe henüz ölçülmedi) |
| **gerekçe** | niçin bu sürüm. `KARAR` satırında **aralıktaki sürüm numarasını içermek zorundadır** — sürüm değişince metin de değişmek zorunda kalsın diye |

⛔**BORÇ satırı uydurma gerekçeye yeğdir.** Bir satırın gerekçesi ölçülmediyse `BORÇ` yazılır.
Borç sayısı teste **dondurulmuştur ve yalnız azalabilir**: yeni bir paket borç olarak doğamaz.

⭐**BU KURAL İLK GÜN BANA UYGULANDI.** Kaydın ilk hâlinde `react` / `react-dom` /
`@types/react` / `@types/react-dom` satırları `KARAR` yazılıydı; gerekçe olarak "React Compiler
RC eşleşmesi" gösteriliyor ve `0ab8b38e1` commit'ine dayandırılıyordu. **Ölçüldü: o commit
React'ten hiç söz etmiyor** (içeriği Supabase CLI pini, `"latest"` temizliği, Node 22 ve git
kancalarıdır). Tam pin aslında `06e940580` adlı ilgisiz bir commit'te, gerekçesiz doğmuş.
Yani gerekçe **çıkarımdı, ölçüm değildi** — tam olarak bu kaydın yasakladığı şey. Dördü de
`BORÇ`a alındı ve doğuş tavanı 16'dan **20**'ye düzeltildi. Tavan **doğduğu anda ölçümle
kurulur**; ondan sonra yalnız azalır. Bu bir gevşetme değil, ilk sayımın düzeltilmesidir.

## 4 · KAYIT

| paket | aralık | tarih | durum | gerekçe |
|---|---|---|---|---|
| next | 15.5.24 | 2026-09-13 | KARAR | REC-323 (commit `193db1437`): 15.5.24 yükseltmesi iki CRITICAL kaydı kapattı. Sabit pin, çünkü Next ana/ara sürümü App Router ve derleme davranışını değiştiriyor; yükseltme kendi başına bir iş olarak ölçülür. |
| react | 19.0.0 | 2026-03-17 | BORÇ | KÖKEN ÖLÇÜLDÜ, GEREKÇE DEĞİL: `06e940580` diff'i React 18→19 GÖÇÜ (`^18.3.1` → `19.0.0`, aynı commit'te `next` ^14.2.35→15.1.0). Tam pin göç anının temkini; sonradan gevşetilmemiş. Bağımsız teknik gerekçe **bulunamadı** → ⭐GEVŞETME ADAYI |
| react-dom | 19.0.0 | 2026-03-17 | BORÇ | `react` ile aynı commit, aynı göç (`06e940580`). Bağımsız teknik gerekçe **bulunamadı** → ⭐GEVŞETME ADAYI |
| react-day-picker | 9.14.0 | 2026-08-19 | KARAR | PR #698: v9 geçişi iki peer bağımlılık ihlalini kapattı ve o sırada tarih filtresinin **hiç çalışmadığı** ölçüldü. 9.14.0 sabit, çünkü v9 API'si tarih seçici bileşenini doğrudan besliyor. |
| @types/react | 19.0.1 | 2026-03-17 | BORÇ | `06e940580`, aynı göç (`^18.3.28` → `19.0.1`). Bağımsız teknik gerekçe **bulunamadı** → ⭐GEVŞETME ADAYI |
| @types/react-dom | 19.0.1 | 2026-03-17 | BORÇ | `06e940580`, aynı göç. Bağımsız teknik gerekçe **bulunamadı** → ⭐GEVŞETME ADAYI |
| eslint-config-next | 15.1.0 | — | BORÇ | — |
| eslint-plugin-react-compiler | 19.1.0-rc.2 | 2026-08-19 | KARAR | RC sürümü (19.1.0-rc.2) semver garantisi taşımaz — iki RC arası kırıcı değişiklik olağandır. Sabit pin zorunludur, aralık yazılamaz. |
| minimatch | 9.0.7 | — | BORÇ | — |
| minimatch@3 | >=3.1.4 | — | BORÇ | — |
| minimatch@9 | 9.0.7 | — | BORÇ | — |
| basic-ftp | >=5.2.0 | — | BORÇ | — |
| glob@10 | >=10.5.0 | — | BORÇ | — |
| @remix-run/router | >=1.23.2 | — | BORÇ | — |
| rollup@4 | >=4.59.0 | — | BORÇ | — |
| rollup | >=4.22.4 | — | BORÇ | — |
| flatted | 3.4.2 | 2026-07-xx | KARAR | Commit `966043401`: yüksek önemde `flatted` güvenlik kaydı kapatıldı. 3.4.2 sabit yazıldı; dolaylı bağımlılık olduğu için doğrudan yükseltilemiyor, override şart. |
| happy-dom | >=20.8.8 | — | BORÇ | — |
| dompurify | >=3.4.0 | 2026-07-xx | KARAR | Commit `39fe49991` (PR #126): XSS ve JSON-LD enjeksiyon açığı kapatıldı. Paket depoya `isomorphic-dompurify` üzerinden dolaylı giriyor, o yüzden override şart; alt sınır 3.4.0. |
| ws | >=8.20.1 | — | BORÇ | — |
| uuid | >=11.1.1 | — | BORÇ | — |
| picomatch | >=2.3.2 | — | BORÇ | — |
| anymatch>picomatch | >=4.0.4 | — | BORÇ | — |
| readdirp>picomatch | >=4.0.4 | — | BORÇ | — |
| lodash | >=4.18.1 | — | BORÇ | — |
| postcss | >=8.5.19 <9.0.0 | 2026-09-16 | KARAR | Commit `8e74d8c5f` XSS kaydını kapattı, REC-326 (`7e7a586d2`) zinciri baştan ölçtü. Alt sınır 8.5.19; üst sınır `<9.0.0` **zorunlu** — cetvel §4, açık uçlu `>=` ana sürüm atlatır. |
| brace-expansion@4 | >=5.0.6 | 2026-09-19 | KARAR | Commit `8e74d8c5f` hizmet-dışı-bırakma (DoS) kayıtlarını kapattı. 2026-09-19 ölçümünde kalan üç kayıt da bu paketin altından geliyor ve **derleme aracında** yaşıyor (`docs/audits/bagimlilik-2026-09-19.md` §2). Alt sınır 5.0.6. |
| brace-expansion@5 | >=5.0.6 | 2026-09-19 | KARAR | `brace-expansion@4` ile aynı karar; ağaçta iki ana sürüm birden bulunduğu için iki ayrı override yazılmak zorunda. Alt sınır 5.0.6. |
| undici | >=7.29.0 <8.0.0 | 2026-09-13 | KARAR | REC-323 (`193db1437`): 7.29.0 CRITICAL kaydı kapattı. ⭐Üst sınır ölçülmüş bir dersten geliyor — açık uçlu yazıldığında `undici` **8.10.2**'ye atladı ve bu ancak kilit dosyası okunarak yakalandı (cetvel §4). |
| sharp | >=0.35.4 | 2026-09-13 | KARAR | REC-323 (`193db1437`): 0.35.4 CRITICAL kaydı kapattı. Aynı işte "sharp'ı kaldır" önerisi **çürütüldü**: sekiz betik paketi `await import('sharp')` ile çalışma anında yüklüyor, kaldırılsaydı katalog görsel hattı kırılacak ve hiçbir kapı görmeyecekti (cetvel §5). |

## 5 · Bu kaydın sınırları — adıyla

- **Gerekçe metninin doğruluğu ölçülmez.** Kapı metnin var olduğunu, yeterince uzun olduğunu ve
  sürüm numarasını içerdiğini ölçer; içeriğinin doğru olduğunu ölçemez. Sürüm numarası bağı,
  metni **değiştirmeden** sürüm değiştirmeyi imkânsız kılar; ama metnin kalitesi insan işidir.
- **BORÇ satırında bu bağ yoktur.** Borçlu bir paketin aralığı değiştiğinde kapı yine kırmızı
  verir (tablo güncellenmek zorundadır), ama değiştiren kişi yalnız sayıyı düzeltip geçebilir.
  Borcun kapatılması bu boşluğu da kapatır.
- **`^` aralıkları kapsam dışıdır** (§2). `@sentry/nextjs` gibi akan bir paketin sürüm kararı
  burada değil, çapalı hafızada duruyor (`01M2WT04K4DJ1N9FSEQ875GKR0`).
- Tarih sütunu `flatted` satırında gün hassasiyetinde ölçülemedi; commit ayını taşıyor.

## 6 · GÜNCELLİK ÖLÇÜMÜ — 2026-09-19 (`pnpm outdated`, yükseltme YAPILMADI)

Recep'in sorusu (2026-09-19, OPS üzerinden): *"belki pek çok paketin sürümünü artırmamız
gerekiyor, belki hiç sürüm kontrolü yapmadık da ondan kopukluklar oldu."* Cevap ölçülmüştür;
**hiçbir paket yükseltilmedi, `pnpm-lock.yaml` değişmedi.**

| Ölçüt | Değer |
|---|---:|
| Toplam bağımlılık | 77 |
| Yeni sürümü olan | **63** |
| Ana sürümü geride (kırıcı geçiş) | **28** |
| — üründe (canlı siteye giren) | 13 |
| — geliştirme araçlarında | 15 |

⭐**Kırıcı geçiş = ana sürüm farkı; `0.x` hatlarında ara sürüm farkı da kırıcı sayılır** (semver
kuralı: `0.x` ana sürüm garantisi vermez). `three` 0.183.2 → 0.186.0 bu yüzden listede.

### Üründe ana sürümü geride olan 13 paket

| paket | kurulu | son | not |
|---|---|---|---|
| `@sentry/nextjs` | 8.55.2 | 10.75.0 | 11 yüksek güvenlik kaydının tamamı bunun altından geliyor (`bagimlilik-2026-09-19.md`); karar 17'ye bağlı, Recep sıralamada sona bıraktı |
| `next` | 15.5.24 | 16.3.5 | tek başına bir iş; App Router davranışı değişir |
| `tailwindcss` | 3.4.19 | 4.3.3 | v4 yapılandırma biçimini tamamen değiştirdi (tasarım token'ları etkilenir) |
| `zod` | 3.25.76 | 4.6.5 | doğrulama şemaları uçtan uca yeniden sınanmalı |
| `framer-motion` | 11.18.2 | 13.4.0 | iki ana sürüm |
| `recharts` | 2.15.4 | 3.10.1 | admin grafikleri |
| `@hookform/resolvers` | 3.10.0 | 5.9.1 | iki ana sürüm; form doğrulama hattı |
| `isomorphic-dompurify` | 3.7.1 | 4.3.0 | XSS temizleyici — güvenlik yüzeyi |
| `react-day-picker` | 9.14.0 | 10.0.1 | 2026-08'de v9'a geçildi, şimdiden v10 çıkmış |
| `tailwind-merge` | 2.6.1 | 3.7.0 | tailwindcss v4 ile birlikte düşünülür |
| `three` | 0.183.2 | 0.186.0 | 3D; görsel doğrulama ister → URUN şeridinin işi |
| `@types/three` | 0.183.1 | 0.186.0 | `three` ile aynı hatta olmalı |
| `lucide-react` | 0.468.0 | 1.47.0 | ikon kitaplığı 1.0'a çıkmış |

⭐**3D kısıtı diye bir şey ÖLÇÜLMEDİ.** `three`, `@react-three/fiber` ve `@react-three/drei`
sabit pinli **değil**, `^` ile yazılı — yani carousel mimarisi için konmuş bir sürüm kilidi
package.json'da **yok**. `@react-three/fiber` ve `drei` zaten güncel; geride olan yalnız `three`
ve tip paketi. (Kısıt kodun içinde olabilir; orası bu ölçümün kapsamı değil.)

### Ürünü etkilemeyen ama görünen kopukluk

`next` 15.5.24 iken `eslint-config-next` **15.1.0** — aynı ana sürüm, ara sürüm geride. Bu bir
geliştirme aracıdır, canlıya girmez; etkisi lint kurallarının Next'in yeni uyarılarını
görmemesidir. Kayıtta **BORÇ** olarak duruyor çünkü niçin geride bırakıldığı ölçülemedi.

### ⭐`react` pini ÜÇ KÜÇÜK SÜRÜM ENGELLİYOR — ve gerekçesi yok

⛔**BU BÖLÜMÜN İLK HÂLİ YANLIŞTI.** *"`react` eskiyen listesinde hiç yok, 19.0.0 bugün son
sürüm, pin hiçbir şeyi engellemiyor"* yazmıştım. Hatanın mekaniği: kendi betiğimin **yalnız
ana-sürüm-geride** çıktısına baktım, `react` orada yoktu (19 → 19 ana sürüm farkı değil) ve
bundan "listede hiç yok" sonucunu çıkardım. **Tam listede vardı.** Ölçüm (`npm view`, aynı gün):

| paket | kurulu | son |
|---|---|---|
| `react` | 19.0.0 | **19.3.0** |
| `react-dom` | 19.0.0 | **19.3.0** |
| `@types/react` | 19.0.1 | **19.3.0** |
| `@types/react-dom` | 19.0.1 | **19.3.0** |

Yani tam pin **üç küçük sürümü engelliyor** ve bunu yapmasının **yazılı hiçbir sebebi yok**
(§4'te dördü de `BORÇ`). Alt küme çıktısından bütün hakkında hüküm kurmak, bu kaydın kendi
kurduğu kapıya düşmektir; hata ilk gün, kendi dosyamda yakalandı ve burada duruyor.

### Node motoru: uyuşmazlık YERELDE, canlıda değil

| yüzey | değer |
|---|---|
| `package.json` `engines.node` | `24.x` |
| GitHub Actions (8 iş akışı) | `24` |
| bu makinedeki yerel Node | **v22.16.0** |

`pnpm` uyarısı (*"Unsupported engine: wanted node 24.x"*) bu makinenin kendi kurulumundan
geliyor; CI ve dağıtım 24 üzerinde koşuyor. Yani **kopukluk canlı tarafta değil, yerel
tezgâhta.** `pnpm build` / `lint` / `test` zaten `scripts/assert-node-major.mjs` ile yerelde
reddediyor — cetvel: `docs/standards/runtime-version-alignment-standard.md`.

### Bu ölçümün sınırı

`pnpm outdated` **kayıt defterinin bugünkü hâlini** söyler; hangi yükseltmenin güvenli olduğunu
söylemez. Yükseltme kararı bu tablodan çıkmaz — her hat kendi PR'ında, cetvel §3 uyarınca
(*bir PR = bir zincir*) ölçülür.

## 7 · KABUL EDİLMİŞ AÇIKLAR — karar 52 (2026-09-21)

> Bu tablo `scripts/hijyen/bagimlilik-denetimi.cjs`'in **verisidir**. CI (`bagimlilik-denetimi.yml`)
> üretim ağacındaki her **yüksek / kritik** kaydı bu listeyle karşılaştırır — **iki yönde**:
> listede olmayan yeni kayıt KIRMIZI, listede kalan ama artık var olmayan kayıt da KIRMIZI.
> Kabul **bilinçli ertelemedir**, görmezden gelme değil: her satır bir **kaldırma şartı** taşır.
> Satır sayısı teste dondurulmuştur (`KABUL_TAVANI`), yalnız azalabilir.

⭐**Hepsinin ortak kökü aynı:** `@sentry/nextjs` → `@sentry/webpack-plugin` — yani **derleme
aracı**; ne sunucu yanıt yolunda ne tarayıcı paketinde (`docs/audits/bagimlilik-2026-09-19.md` §2).
Recep 2026-09-19'da Sentry'yi sıranın **sonuna** koydu (karar 17). O yüzden tek kaldırma şartı
hepsi için aynıdır.

⭐**2026-09-21 — İLK KAPANIŞ, bot eliyle:** Dependabot'un güvenlik grubu (#1285) `brace-expansion`'ı
5.0.6'dan 5.0.12'ye çekti ve üç kaydı (`GHSA-3jxr-9vmj-r5cp`, `GHSA-mh99-v99m-4gvg`,
`GHSA-rgw5-rvv9-x895`) **Sentry'yi beklemeden** kapattı. Denetim kapısı aynı PR'da "BAYAT KABUL"
diye kırmızı verdi — kapanan kayıt listede kalamaz; üç satır silindi, tavan 11 → 8. Kaldırma
şartı "Sentry 10.x" yazıyordu, gerçekte daha erken geldi: şart **yeterli** koşuldu, **gerekli**
değil. Bu yüzden kabul listesi elle değil ölçümle temizlenir.

| GHSA | paket | önem | kabul | gerekçe | kaldırma şartı |
|---|---|---|---|---|---|
| `GHSA-c83g-rgw3-j3cx` | browserslist | high | 2026-09-21 | derleme aracı; girdi bizim `browserslist` yapılandırmamız | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-73wf-gq98-2v4g` | browserslist | high | 2026-09-21 | aynı zincir | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-v2hh-gcrm-f6hx` | fast-uri | high | 2026-09-21 | webpack yapılandırma şeması ayrıştırır, kullanıcı URL'i değil | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-7p8r-x3mc-p8w7` | fast-uri | high | 2026-09-21 | aynı zincir | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-f65p-4m7j-42xc` | fast-uri | high | 2026-09-21 | aynı zincir | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-fph4-wmhf-6fwf` | fast-uri | high | 2026-09-21 | aynı zincir | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-jqff-g426-hqxp` | fast-uri | high | 2026-09-21 | aynı zincir | `@sentry/nextjs` 10.x (karar 17) |
| `GHSA-4c8g-83qw-93j6` | fast-uri | high | 2026-09-21 | aynı zincir | `@sentry/nextjs` 10.x (karar 17) |

## 8 · OVERRIDE KALDIRMA ŞARTI — karar 52

Bir override **geçici bir müdahaledir**; ne zaman kaldırılacağı yazılmazsa kalıcılaşır ve
sebebi unutulur (§6'daki `react` pini bunun tam örneği: göç anının temkini iki ay kilit kaldı).
`KARAR` durumundaki her override için kaldırma şartı burada durur. Şart **ölçülebilir** yazılır:
"artık gerek yok" değil, **hangi komutun ne söylediği**.

`BORÇ` durumundaki override'ların şartı yazılamaz, çünkü niçin konduğu bilinmiyor; önce
gerekçe ölçülür (§4).

| override | kaldırma şartı (ölçüm komutuyla) |
|---|---|
| flatted | `pnpm why flatted` çıktısındaki her tüketici 3.4.2 ve üstünü **kendi aralığıyla** çekiyor |
| dompurify | `isomorphic-dompurify`'nin kendi `dompurify` aralığının tabanı 3.4.0 ve üstü (`pnpm view isomorphic-dompurify dependencies`) |
| postcss | `pnpm why postcss` çıktısındaki her tüketicinin aralığı 8.5.19 ve üstünü zorluyor |
| brace-expansion@4 | `pnpm why brace-expansion` çıktısında 4.x hattını çeken tüketici kalmadı ya da 5.0.6 ve üstünü kendisi çekiyor |
| brace-expansion@5 | aynı ölçüm, 5.x hattı için |
| undici | `jsdom`'un kendi `undici` aralığının tabanı 7.29.0 ve üstü (`pnpm view jsdom dependencies`) |
| sharp | `pnpm why sharp` doğrudan bağımlılık dışında tüketici göstermiyor (doğrudan bağımlılık zaten `^0.35.4` taşıyor, override o zaman tekrar olur) |
