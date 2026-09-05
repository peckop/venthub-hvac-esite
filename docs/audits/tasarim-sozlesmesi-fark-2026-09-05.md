# Tasarım Sözleşmesi ↔ Token Katmanı FARK BELGESİ (2026-09-05)

> **Ne bu:** `docs/standards/storefront-design-standard.md` (cetvel) ile onun dayandığı
> **değer SSOT'u** — `src/design-system/tokens.js` + `tailwind.config.js` + `src/index.css` —
> arasındaki farkın ölçümü. **KOD DEĞİŞMEDİ.** Bu belge bir denetim çıktısıdır, emir değildir.
> REC-147 Adım 2 · URUN şeridi · ölçüm ağacı `C:/tmp/vh-urun-rec89`, taban `5a28855c`.
>
> **Kapsam:** storefront = `src/` **eksi admin** — ratchet kapısıyla **aynı** ölçüt
> (`storefront-style-ratchet.test.ts`: `rel.startsWith('admin/') || rel.includes('/admin/')`).
> Admin'in kendi cetveli ve kendi kapıları var; bu belge admin'e **hüküm vermez**, yalnız
> aynı dosyada ölçtüğü admin sayılarını **olgu olarak** kaydeder (F1'de gerekli, çünkü tek
> `.dark` bloğu ikisini birden ilgilendiriyor).

---

## 0. Ölçüm yöntemi (yeniden koşulabilir olsun diye)

Cetvelin kendi dersi: *"ölçüm YÖNTEMİ yazılmamış bir baseline, sonraki ölçümü yanlış alarma
çevirir"* (§5 dipnotu). O yüzden her sayının komutu burada.

| Ne | Nasıl |
|---|---|
| Token kullanım sayısı | `git grep -oE "<desen>" -- "src/**/*.ts" "src/**/*.tsx" ":!src/**/admin/**" ":!src/**/*.test.ts*" \| wc -l` |
| **Neden `-o`** | `grep -c` **satır** sayar, olay değil; aynı satırdaki iki isabet tek görünür |
| Token envanteri | `tokens.js` / `tailwind.config.js` bloklarından anahtar çıkarımı (parantez sayarak, girinti tuzağına düşmeden) |
| Tema kapsaması | `index.css` **tam** ayrıştırma: her `--değişken` tanımı, onu **içeren seçici bağlamıyla** birlikte |
| Ratchet sayaçları | kapının kendi aracıyla: `pnpm vitest run …storefront-style-ratchet.test.ts` |

⚠**İlk ölçümüm yanlıştı, düzeltildi.** Koyu tema bloğunu `\n\}` (sütun-0 kapanış) ile
aradım; blok `@layer base` içinde **girintili** olduğu için evren yanlış çıktı ve
"14/39 dönmüyor" gibi bir sayı verdi. Parantez sayarak yeniden ölçüldü: gerçek sayı **16/16**.
Ölçüt keskindi, **evren** yanlıştı — bu belgedeki sayılar ikinci yöntemle alınmıştır.

---

## 1. ÖNCE İYİ HABER: kopuk referans YOK

| Kontrol | Sonuç |
|---|---|
| `tailwind.config.js`'te `hsl(var(--x))` ile tanımlı renk tokeni | **39** |
| Bunlardan `index.css`'te **tanımsız** olan | **0** |
| Cetvelin §2.1/§2.4/§2.5/§2.8'de **adını verdiği** ölçek | hepsi mevcut (`max-w-page/content/modal/prose`, `rounded-hvac-*`, `text-display`, `elevation-1..5`, `duration-hvac-*`, `ease-hvac-*`, `tracking-hvac-*`, `leading-hvac-*`) |

Yani cetvel **var olmayan bir token'a atıfta bulunmuyor** ve hiçbir Tailwind rengi boş
değişkene bakmıyor. Fark, "eksik" değil **"fazlalık ve dayanaksız gerekçe"** ekseninde.

---

## 2. BULGULAR

### F1 — ⭐AĞIR: koyu tema **yapılandırılmış ama token katmanında uygulanmamış**; §2.2'nin gerekçesi bugün dayanaksız

**Cetvel ne diyor (§2.2):** ham Tailwind grileri yasak, *çünkü* «tema `darkMode: 'selector'` +
CSS değişkeni ile dönüyor (`index.css` light/dark blokları **aynı değişkeni yeniden tanımlar**);
ham `slate-600` temayla **dönmez** → dark-mode kırığı».

**Ölçülen:**

| Ölçüm | Sayı |
|---|---|
| `tailwind.config.js`'te `darkMode: 'selector'` | var |
| `index.css`'teki **tek** koyu bağlam | `@layer base > .dark` |
| O blokta yeniden tanımlanan değişken | **8** — hepsi `--sidebar-*` (shadcn kalıntısı) |
| **Vitrin** renk tokeni / koyu temada yeniden tanımlı **olmayan** | **16 / 16** |
| **Admin** renk tokeni / koyu temada yeniden tanımlı **olmayan** | **23 / 23** (olgu; hüküm admin cetvelinin) |
| `dark:` yardımcı sınıfı — vitrin / admin | **12** / **0** |

**Fark:** cetvelin yasağı, *token döner / ham gri dönmez* karşıtlığına dayandırılmış.
Bugün **ikisi de dönmüyor**, çünkü hiçbir tasarım token'ı koyu blokta yeniden tanımlanmamış.

**Bu, kuralın yanlış olduğu anlamına GELMEZ.** §2.2'nin ikinci gerekçesi — üç ailenin ton
eğrileri farklı, yan yana kirli görünüyor — ölçümden bağımsız ve ayakta. Sorun **yazılı
gerekçenin bugünkü kodu tarif etmemesi**: cetveli okuyan biri "token'lar zaten tema-farkındalı"
sanır. Koyu tema gerçekten açılacağı gün, 39 değişkenin tamamı için koyu karşılık **yazılmamış**
olduğu o gün keşfedilir.

**Önerim (tek):** §2.2'nin gerekçe cümlesi **bugünkü hâli anlatacak** biçimde düzeltilsin
(«token'lar tema-farkındalı olacak ŞEKİLDE kurulmuştur; koyu karşılıklar henüz yazılmamıştır»)
ve koyu tema bir iş kalemi olarak açılsın. Cetvel değişikliği benim tek başıma yapacağım şey
değil — cetvelin sahibi karar verir.

---

### F2 — Semantik dört renk **HEX** ile tanımlı (kural 8'in tam yasağı)

`tailwind.config.js`:

| Token | Değer | Vitrinde kullanım |
|---|---|---|
| `success-green` | `#10B981` | **40** |
| `warning-orange` | `#F59E0B` | **18** |
| `gold-accent` | `#D97706` | **4** |
| `silver-accent` | `#9CA3AF` | **0** |

**Fark:** CLAUDE.md **kural 8** ve cetvel §2.3 «HEX renk yasak — CSS custom property (HSL)»
diyor. Yasak **tüketici koda** uygulanıyor (kapı orada bakıyor), ama **token katmanının
kendisi** dört rengi HEX yazmış. Sonuç F1 ile birleşince somutlaşır: bu dördü, koyu tema
yazıldığında **hiçbir koşulda** dönemez — çünkü arkalarında değişken yok.

`silver-accent` **hiç** kullanılmıyor — vitrinde 0 **ve** `src/` genelinde 0 (admin dahil
ölçüldü, "vitrinde yok" ile karıştırılmasın). Ölü token.

**Önerim:** dördü de `hsl(var(--…))` biçimine alınsın; `silver-accent` silinsin. Değer aynı
kalır, davranış değişmez, tema kapısı açılır. (Renk değeri değişmediği için görsel risk yok;
yine de canlıda görünür sınıfa girer → K8.)

---

### F3 — Kaçak değerler **token dosyasına taşınmış** (kural 8'in etrafından dolanma)

`tokens.js` → `maxWidth`: **14** anahtar. Cetvelde rolü olan **4** (`page`, `content`,
`modal`, `prose`). Kalan **10**:

`150px`, `140px`, `120px`, `200px`, `640px`, `92vw`, `90vw`, `55vh`, `280px`, `60%`

Vitrindeki kullanım: `max-w-150px` 3, `max-w-120px` 3, `max-w-92vw` 1, `max-w-90vw` 1,
`max-w-200px` 1, `max-w-55vh` 1, `max-w-280px` 1, `max-w-60%` 1 → **toplam 12**.

⚠`140px` ve `640px` vitrinde **0** — ama «ölü» **DEĞİL**: `src/` genelinde her biri **3**
kullanımda (admin tarafında). Önce "ölü" yazmıştım, kapsamı depo geneline genişletince
düştü. Ders aynı: *vitrinde yok* ile *hiç yok* farklı iki iddiadır.

Aynı sınıf, başka ölçeklerde: `fontSize`'ta `'7px'` (kullanım **1**), `letterSpacing`'te
`'hvac-22'` = 0.22em (kullanım **1**).

**Fark:** kural 8 `w-[92vw]` gibi **arbitrary** değeri yasaklar; kapı da onu arar. Aynı değer
`maxWidth: { '92vw': '92vw' }` diye token dosyasına yazılınca `max-w-92vw` **meşru** olur ve
kapı görmez. Yasak lafzen sağlanıyor, **amacı** sağlanmıyor: ölçek disiplini yok, tek-kullanımlık
ölçü token adı almış. Bu, INV-9'un "keyfî `w/h/text/gap-[...]` ≤ 6" sayacının **neden bu kadar
düşük kalabildiğini** de açıklıyor.

**Önerim:** yeni kaçak değer eklenmesini engelleyen bir kol (token adı **saf sayı/birim**
olamaz: `^\d`, `vw|vh|%` ile biten ad) — mevcut 12 kullanım ratchet borcu olarak sabitlenir,
geçmiş cezalandırılmaz. Kapı **ALTYAPI ağacında** olduğu için yazımı bana ait değil; ölçüm burada.

---

### F4 — Cetvelde **adı geçmeyen** 14 gölge token'ı

`tokens.js` → `boxShadow`: **43** anahtar.

| Sınıf | Sayı | Örnek |
|---|---|---|
| Cetvelin §2.8'de adını verdiği önek (`elevation-*`, `hvac*`, `glow-*`) | **18** | `elevation-3`, `hvac-lg`, `glow-md` |
| `admin-*` (başka cetvel) | **11** | `admin-overlay` |
| **Cetvelde adı geçmeyen** | **14** | `mega-menu`, `mega-menu-viewport`, `login-btn`, `login-btn-hover`, `series-card-hover`, `drawer-left`, `white-glow{,-md,-lg}`, `access-denied-{black,rose}`, `glass`, `inset-deep`, `ring` |

**Fark:** §2.8 «katman derinliği `elevation-1..5`; marka gölgeleri `hvac-*`/`glow-*`» diyor ve
«yeni serbest `shadow-[...]` yasak — yeni ihtiyaç → tokens.js'e ekle» diye bir **kapı** bırakıyor.
O kapıdan 14 **sayfaya-özel** gölge girmiş (bir düğme, bir çekmece, bir mega menü). Sonuç F3 ile
aynı sınıf: yasak sağlanıyor, ölçek disiplini oluşmuyor. Bunlar "yanlış" değil — **rolsüz**.

**Önerim:** §2.8'e üçüncü bir sınıf yazılsın: *bileşene-özel gölge* (adı bileşeni söyler,
merdivenden bağımsızdır). Böylece 14'ü meşrulaşır **ve** sayılabilir hâle gelir; sınırsızlık
"adsız" olmaktan çıkar.

---

### F5 — Token benimseme: dört eksende **legacy hâlâ önde**

| Eksen | Token kullanımı | LEGACY sayaç (= INV-9 tavanı, bkz. not) |
|---|---|---|
| Konteyner | `max-w-page` **37** | `max-w-7xl` **49** |
| Yarıçap | `rounded-hvac-{sm,md,lg,xl}` **37** (+ `2xl/3xl` **34**) | ham `rounded-xl/2xl/3xl` **375** |
| Gri | (rol token'ları) | ham `slate-*`+`gray-*` **1464** |
| Vurgu | — | ham `blue-*`+`indigo-*` **144** |
| Ağırlık | — | display dışı `font-black` **120** |

**LEGACY sayılar nasıl bilindi:** INV-9 **11/11 yeşil**. Kapının **çift yönlü** kilidi var —
sayaç tavanı aşarsa da, tavanın **altına düşerse** de kırmızı yanıyor. Dolayısıyla yeşil
koşum, her sayacın **tavana eşit** olduğu anlamına gelir. (Bu bir çıkarımdır; doğrudan sayım
değil — ama kapının kendi aracıyla alınmıştır ve yöntemi burada yazılıdır.)

**Ayrıca:** cetvel §5'teki özet tablo **bayat** — 08-18 tavanlarını gösteriyor
(1508 / 391 / 148 / 133), bugünkü tavanlar **1464 / 375 / 144 / 120**. Cetvel bunu zaten
kendisi söylüyor («tavanların otoritesi artık testtir, bu tablo değil»), yani **çelişki
değil**; yine de sayıların tazelenmesi okuyucuyu yanıltmayı bitirir.

---

### F6 — `rounded-hvac-2xl/3xl`: rol tablosunda yok, kullanım **34**

§2.4'ün rol tablosu `sm/md/lg/xl` diyor; satır sonunda «`rounded-hvac-xl` (32px) **ve üstü**»
ifadesi 2xl/3xl'i **örtük** kapsıyor. Kullanım hatırı sayılır (**34**), dolayısıyla bu bir
ihlal değil, **tablo eksiği**. Rol yazılırsa "hangi yüzey 40px ister" sorusu cevaplanmış olur.

---

## 3. ÖZET

| # | Bulgu | Ağırlık | Kime ait |
|---|---|---|---|
| F1 | Koyu tema token katmanında **uygulanmamış**; §2.2 gerekçesi bugünkü kodu tarif etmiyor | ⭐**Ağır** | cetvel sahibi + (koyu tema iş kalemi) |
| F2 | 4 semantik renk **HEX** (kural 8) — biri ölü | Orta | vitrin (K8: canlıda görünür) |
| F3 | 10 kaçak `maxWidth` + `7px` + `hvac-22` token dosyasına taşınmış | Orta | kapı: ALTYAPI · ölçüm: URUN |
| F4 | 14 gölge token'ı cetvelde **rolsüz** | Düşük | cetvel sahibi |
| F5 | Legacy dört eksende önde; §5 özet tablosu bayat | Bilgi | göç dalgaları |
| F6 | `rounded-hvac-2xl/3xl` rol tablosunda yok (kullanım 34) | Düşük | cetvel sahibi |
| — | **Kopuk referans 0 / tanımsız değişken 0** | ✅ | — |

**Bu belge kod değiştirmedi, karar vermedi.** F1 ve F2 canlıda görünür sınıfa girdiği için
uygulama **Recep'in önizleme onayına** bağlıdır (K8). F3'ün kapısı ALTYAPI ağacındadır.

---

## 4. Bu belgenin SINIRI (adıyla)

- Ölçülenler **statik**: token tanımı, ad, sayım. «Sayfa gerçekten doğru görünüyor mu»
  sorusuna **cevap vermez** — o, cetvel §4.2'nin (Playwright görsel katmanı) işidir ve
  hâlâ yazılmamıştır.
- «Rol doğru mu» (§2.3 vurgu hiyerarşisi, §2.5 tipografi rolü) **ölçülmedi**; cetvel §5.1
  bu sınıfı zaten "ÖLÇÜLEMEZ-STATİK" diye adıyla işaretliyor. Bu belge o sınırı **aşmıyor**.
- Admin sayıları yalnız F1'de, **olgu** olarak; admin hakkında hüküm bu belgenin işi değil.
