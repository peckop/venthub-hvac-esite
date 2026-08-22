# Bağımlılık Bütünlüğü — Cetvel v1.0

> **Kapsam:** kurulu **doğrudan** bağımlılıkların `peerDependencies` beyanları ile kurulu
> sürümler arasındaki tutarlılık. Tek soru: *bir paketin "ben şu sürümle çalışırım" beyanı,
> depoda gerçekten kurulu olanla uyuşuyor mu?*
> **Zorlayan kapı:** `INV-PEER-1` → `src/__tests__/conformance/peer-dependency-integrity.test.ts`
> **İlk yazım:** 2026-08-19 · **Ölçüm sahibi:** ALTYAPI

---

## 1. Niçin bu cetvel var — ölçülmüş boşluk

2026-08-19'da PRICING şeridi yeni bir kapı yazarken bir çatışmaya çarptı ve ölçtü:

| gerçek | ölçüm |
|---|---|
| `react-day-picker@8.10.1` peer olarak `date-fns@^2.28.0 \|\| ^3.0.0` istiyor | paketin kendi manifesti |
| depoda kurulu | `date-fns@4.1.0` |
| bu çatışma ne zamandır var | `date-fns` 3.6 → 4.1 geçişi **2026-03-17**, commit `06e94058` (`git log -L` ile ölçüldü) |
| `react-day-picker` sürümü | ilk commit'ten beri aynı |

Yani çatışma **beş aydır** oradaydı ve **hiçbir kapı görmedi.** Sebep tek cümleyle:

> Depoda hiçbir yer `npm` çağırmıyor. Her şey `pnpm` kullanıyor ve **pnpm peer çatışmasını
> hata saymaz** — yalnızca uyarır. PRICING'in yeni işi `npm` çağıran **ilk** yer olduğu için
> çatışma ilk kez orada patladı.

Bu, projenin en pahalı hata sınıfının bir örneği: **kusur ne kodda ne veride, hiç ölçülmeyen bir
yüzeyde.** Aynı gün ikinci kez görüldü (sertifika ihtiyacı da yeni değildi, yalnızca ilk kez
birinin gerçekten kontrol etmesiydi).

**Bu cetvelin ilk günündeki getirisi:** kapı yazıldığı anda, bilinen tek ihlalin yanında **iki
tane daha** buldu — biri aynı paketin `react` peer'i (aşağıda §5), biri tamamen yeni bir
`@eslint/js` ↔ `eslint` ana sürüm ayrışması. Yani ölçülmeyen yüzeyde bir değil üç kalem vardı.

## 2. Kural

1. Kurulu her doğrudan bağımlılığın her `peerDependencies` satırı, o peer'in **kurulu** sürümüyle
   uyuşmak zorundadır.
2. Uyuşmayan her satır, kapının **muafiyet listesinde ADIYLA** (paket + peer) ve **ölçümüyle**
   yazılı olmak zorundadır. Yazılı olmayan tek bir ihlal kapıyı kırmızı yapar.
3. Zorunlu (isteğe bağlı olmayan) bir peer **hiç kurulu değilse** bu da ihlaldir.
4. İsteğe bağlı (`peerDependenciesMeta.optional`) bir peer **kurulu değilse** doğru durumdur;
   ama **kuruluysa** sürümü yine denetlenir. "İsteğe bağlı", *"yokluğu serbest"* demektir,
   *"yanlış sürümü serbest"* demek değildir.

## 3. Bu kapı niçin `npm` çağırmıyor

`npm install`/`npm ls` peer denetimini kendisi yapar, ama bu depoda çağıran iş **aynı çatışma
yüzünden** `--legacy-peer-deps` vermek zorunda kaldı — ve o bayrak tam da ölçmek istediğimiz şeyi
susturur. Bir ölçüm aracını, ölçmek istediğin şeyi kapatarak kullanmak ölçüm değildir.

Bu yüzden `INV-PEER-1` kurulu ağacı **doğrudan** okur ve aralık karşılaştırmasını kendisi yapar.

### 3.1 Kurulu sürüm nasıl bulunur (üç kez yanlış kırmızı verdikten sonra yazıldı)

Bu bölüm cetvelde duruyor çünkü üç tuzağın üçü de aynı gün **yanlış kırmızı** üretti:

1. **pnpm katı yerleşim kullanır.** Kök `node_modules/` yalnız *beyan edilmiş* paketleri taşır.
   `@testing-library/dom@10.4.1` kurulu olmasına rağmen kökte **yok**; kök taraması onu
   "kurulu değil" sandı. → *Ölçüm aracının okuduğu yer, ölçümün kapsamıdır.*
2. **`createRequire`'a sembolik bağın kendisini vermek yetmez.** Node üst dizinlere yürürken
   `.pnpm` kutusuna hiç girmez ve kökte arayıp bulamaz. `realpathSync` **şart**.
3. **Bazı paketler `package.json`'ı `exports` ile kapatır** (ölçülen örnek: `three`) →
   `ERR_PACKAGE_PATH_NOT_EXPORTED`. Bu hata paketin **yok** olduğunu değil **var** olduğunu
   kanıtlar; ana girdiden yukarı yürüyüp paketin kendi manifesti bulunur.

pnpm'de aynı peer, **isteyen pakete göre farklı sürüme** çözülebilir. Bu yüzden çözümleme
(isteyen, peer) çifti başına yapılır — tek bir küresel "kurulu sürüm" varsayımı yanlıştır.

## 4. Muafiyet rejimi

Muafiyet **ücretsiz değildir**. Kapı üç ayrı testle bunu zorlar:

| test | neyi engeller |
|---|---|
| gerekçe en az 80 karakter **ve** içinde `YYYY-MM-DD` ölçüm tarihi | çıplak muafiyet ("şimdilik geç") |
| her muafiyet **hâlâ gerçek bir ihlali karşılamalı** | **bayat muafiyet** — sorun çözüldükten sonra listede kalıp kapıyı kalıcı olarak kör etmesi |
| ölçüm gerçekten koştu (taranan paket > 20, peer satırı > 50) | **sessiz-boş** tarama: hiçbir şey bulamayan bir bekçi yeşil görünür |

Bayat muafiyet testi bu cetvelin en önemli maddesidir: bir muafiyet, kendisini doğuran ihlal
ortadan kalktığında **silinmeye zorlanır**. Aksi halde muafiyet listesi zamanla kapının kendisini
yer.

## 5. Ölçülemeyen, geçmiş sayılmaz (fail-closed)

Aralık çözücüsü `||` (VEYA) ve boşluk (VE) ayrımını, `^`, `~`, `>=`, `>`, `<`, `<=`, `=`, tam
sürüm ve `*` biçimlerini tanır. Tanımadığı bir jetona rastlarsa (ölçülen örnek: `tailwindcss`
cetvelindeki `insiders` etiketi) sonuç **`olculemedi`** olur ve bu **ayrı bir kırmızıdır**:

- `ihlal` = "ölçtüm, uyuşmuyor"
- `olculemedi` = "bu biçimi okuyamadım"

İkisini aynı kovaya atmak ya da ölçülemeyeni geçmiş saymak bu bekçinin varlık sebebini ortadan
kaldırır. Bir OR dalı okunamıyor ama **başka bir dal karşılıyorsa** sonuç `karsilar`'dır — çözücü
gereksiz yere şikâyet etmez.

## 6. Kapsam sınırı — ADIYLA

Yalnız `package.json`'daki **doğrudan** bağımlılıklar (`dependencies` + `devDependencies`)
taranır. Ölçüldü (2026-08-19): bu **114 peer satırı** eder.

**Geçişli paketlerin peer beyanları bu kapının dışındadır.** Bu bilinçli bir sınırdır, eksiklik
değil: geçişli ağacın peer tutarlılığı pnpm'in çözücüsünün işidir ve depo bunu kilit dosyasıyla
sabitler. Doğrudan bağımlılıklar ise **bizim elimizle** yükseltilir — beş aylık boşluk da tam
orada doğdu.

**Ölçülmeyen kalan:** bu kapı **beyan** uyuşmasını ölçer, **davranış** uyuşmasını ölçmez. Bir
paketin peer beyanı doğru olduğu hâlde çalışma zamanında bozulması mümkündür; tersi de mümkündür
(§7'deki iki muafiyet tam bu durumda). Beyan denetimi, davranış kanıtının yerine geçmez.

## 7. Bugünün muafiyetleri (2026-08-19)

| paket | peer | sınıf |
|---|---|---|
| `react-day-picker@8.10.1` | `date-fns` (kurulu 4.1.0, isteniyor `^2 \|\| ^3`) | **bilinçli borç** — 31 adlandırılmış ithal + 2 locale ölçüldü, **eksik export yok** |
| `react-day-picker@8.10.1` | `react` (kurulu 19.0.0, isteniyor `^16.8 \|\| ^17 \|\| ^18`) | **bilinçli borç** — paket React 19 desteğini hiç beyan etmiyor; admin tarih filtresi çalışıyor ama bu *çökmedi* gözlemi, davranış kanıtı değil |
| `@eslint/js@10.0.1` | `eslint` (kurulu 9.39.4, isteniyor `^10.0.0`) | **iş emri bekleyen taze ayrışma** — `package.json` `@eslint/js`'i tek başına v10'a çıkarmış; doğru onarım iki sürümü aynı ana sürümde hizalamak |

İlk ikisi için v9'a yükseltme kararı **ölçülmüş bir kusur** gerektirir; paketin beyanı tek başına
yetmez (`docs/standards/` genel ilkesi: beyan ≠ ölçüm). Üçüncüsü borç değil, **onarılacak iş**.

## 8. Kapı eklendiğinde kanıt zorunluluğu

Bu cetveli zorlayan test, yazıldığı gün **bilerek bozularak** kanıtlanmıştır: muafiyet listesinden
bir satır çıkarıldığında kapı kırmızı olmalı, bayat bir muafiyet eklendiğinde de kırmızı olmalıdır.
Kanıtlanmamış bir kapı, kapı değildir.
