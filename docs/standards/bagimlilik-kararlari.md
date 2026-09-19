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
2. `pnpm.overrides` içindeki **her** girdi. Override zaten tanımı gereği bir müdahaledir.

`^` ile yazılmış aralıklar kapsam dışıdır — onlar bilerek akmaya bırakılmıştır, tekil bir karar
değildir. Bu sınır bilinçlidir, muafiyet listesi değildir: gönüllü olarak eklenen satır (evrende
olmasa da) aynı kurallara tabi olur.

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

## 4 · KAYIT

| paket | aralık | tarih | durum | gerekçe |
|---|---|---|---|---|
| next | 15.5.24 | 2026-09-13 | KARAR | REC-323 (commit `193db1437`): 15.5.24 yükseltmesi iki CRITICAL kaydı kapattı. Sabit pin, çünkü Next ana/ara sürümü App Router ve derleme davranışını değiştiriyor; yükseltme kendi başına bir iş olarak ölçülür. |
| react | 19.0.0 | 2026-08-19 | KARAR | Commit `0ab8b38e1` akan sürümleri sabitledi. 19.0.0 sabit tutuluyor çünkü React Compiler eklentisi hâlâ RC sürümünde (`eslint-plugin-react-compiler` 19.1.0-rc.2) ve derleyici eşleşmesi yama sürümünde bile ayrı doğrulama ister. |
| react-dom | 19.0.0 | 2026-08-19 | KARAR | `react` ile AYNI sürümde olmak zorunda (React çekirdeği ile DOM sürücüsü ayrışırsa çalışma anında hata verir). 19.0.0, `react` satırıyla birlikte hareket eder. |
| react-day-picker | 9.14.0 | 2026-08-19 | KARAR | PR #698: v9 geçişi iki peer bağımlılık ihlalini kapattı ve o sırada tarih filtresinin **hiç çalışmadığı** ölçüldü. 9.14.0 sabit, çünkü v9 API'si tarih seçici bileşenini doğrudan besliyor. |
| @types/react | 19.0.1 | 2026-08-19 | KARAR | Tip paketleri React ile eşleşmek zorundadır; 19.0.1, `react` 19.0.0 hattının tip karşılığıdır. Akmaya bırakılırsa tip hataları sürüm çözümleme anında doğar. |
| @types/react-dom | 19.0.1 | 2026-08-19 | KARAR | `@types/react` 19.0.1 ile aynı hatta olmak zorunda; ayrışırsa `tsc` iki farklı React tip ağacı görür. |
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

### `react` niçin 19.0.0'da sabit — ve bunun bugün bir bedeli yok

`react` ve `react-dom` **eskiyen listesinde hiç yok**: 19.0.0 bugün son sürüm. Yani sabit pin
şu an hiçbir yükseltmeyi engellemiyor.

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
