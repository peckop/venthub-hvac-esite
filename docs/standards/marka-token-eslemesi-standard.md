# Marka Kılavuzu → Kod Token Eşlemesi Standardı

**Kapsam:** marka kimliğinin (palet, yazı tipi, logo) **koda hangi token olarak indiği** ve
o token'ın **nerede kullanılabileceği**. Kapsam dışı: admin teması (`[data-admin-theme]`,
ADMIN şeridi), 3D malzeme sabitleri, üçüncü taraf marka renkleri (ör. Google G logosu).

**Durum:** REC-129 Faz 1 kapsamında açıldı. Bugün **palet ayağı** yazılı; yazı tipi ve logo
ayakları Design export'u geldiğinde eklenecek. Cetvelin eksik kalması bilinçlidir ve
burada **yazılıdır** — "cetvel yok" demek yerine kapsamı beyan ediyoruz.

---

## 0) Niçin var

REC-129 marka kararlarını kapattı (palet, yazı tipi, logo) ama **kod tarafında karşılığı
olmayan bir kılavuz** kararı uygulamaz. 2026-09-04'te ölçüldü: renk tanımlayan **en az altı
ayrı kaynak** var ve bunlardan biri (`tailwind.config.js`'teki `'warning-orange': '#F59E0B'`)
tam da REC-129'un "uyarı amberi"ni, tema dışında, sabit HEX olarak taşıyor. Kılavuz ile kod
arasında eşleme yazılmazsa karar kâğıtta kalır.

---

## 1) Palet — kapalı karar (REC-129) ve KULLANIM SINIRI (Recep, 2026-09-04)

| Rol | Değer | Nerede kullanılır | Nerede kullanılmaz |
|---|---|---|---|
| Lacivert | `#1A2B4A` | Gövde metni, başlıklar, ikincil eylem | — |
| Turkuaz | `#0088B0` | Vurgu, bağlantı, ikincil yüzey | Normal boy gövde metni |
| **Kiremit** | `#D95D0E` | **Yalnız** logo · **ana eylem düğmesi dolgusu** · o düğmenin **büyük/kalın** yazısı | **Normal boy metin** · gövde · bağlantı |
| **Amber** | `#F59E0B` | **Yalnız** arayüz uyarısı, **yanında koyu yazı/ikon ile** | **Tek başına** anlam taşıyan hiçbir yerde |

**Niçin bu sınır — ölçülmüş sayılarla (WCAG 2.1, beyaz zemin):**

| Renk | Kontrast | Normal metin (4.5) | Büyük/kalın metin + arayüz öğesi (3.0) |
|---|---|---|---|
| Kiremit `#D95D0E` | **3.80** | ✗ | ✓ |
| Turkuaz `#0088B0` | **4.08** | ✗ | ✓ |
| Amber `#F59E0B` | **2.15** | ✗ | ✗ |
| Lacivert (bugünkü `primary-navy`) | 8.83 | ✓ | ✓ |

Sayılar iki bağımsız hesapla doğrulandı. Karar **tonu değiştirmek değil kullanımı
sınırlamak** oldu: 3.0 eşiği büyük/kalın metin ve arayüz öğeleri için geçerli olduğundan
kiremit düğmede meşru; 4.5 gerektiren normal metin laciverde (8.83) bırakılıyor. Böylece
marka sıcaklığı korunur, okunabilirlik payı feda edilmez.

---

### 1.1) AA koyu tonları (K25 / K25-b, 2026-09-06) — palet genişlemesi DEĞİL, düzeltmesi

§1'in tablosu turkuaz ve kiremidi normal boy metinde yasaklıyordu, çünkü ikisi de 4.5
eşiğinin altındaydı. K25/K25-b bu boşluğu **tonu değiştirerek değil, zemini
koyulaştırarak** kapattı: aynı iki rengin AA eşiğini geçen koyu eşleri token'landı.

| Token | Değer | Beyaz metinle | `#F4F4F2` zeminde | Nerede kullanılır |
|---|---|---|---|---|
| `--brand-cyan-ink` | `#00708F` | **5.65** ✓ | 5.13 ✓ | Teklif/Sepet **sayaç rozeti zemini**, metin beyaz |
| `--action-terracotta-deep` | `#BF5309` | **4.71** ✓ | 4.28 | **Ana eylem düğmesi dolgusu** |

Karşılaştırma (aynı hesapla, aynı dalda yeniden koşuldu — §1'in 4.08/3.80 rakamlarını
birebir üretti): turkuaz `#0088B0` → 4.08 · kiremit `#D95D0E` → 3.80. **Yeni marka rengi
açılmadı**, ton üretilmedi, palet genişletilmedi; K25-b'nin verdiği iki değer aynen alındı.

**HSL karşılıkları (çevrim TAM — kanal farkı 0):**
`#00708F` → `193 100% 28%` · `#BF5309` → `24.4 91% 39.2%`.

⚠**`--action-terracotta-deep`in kodda ÇAĞRI YERİ YOK ve bu gizlenmiyor.** K25-b
"`AnaEylemDugmesi` bu tokene geçer" diyor; 2026-09-06'da ölçüldü: `AnaEylemDugmesi` diye
bir bileşen bu depoda **yok** (ad yalnız karar belgesinde geçiyor), ve "ana eylem" işlevini
gören tek bir bileşen de yok — `bg-primary-navy` **72 dosyada 142 kez** doğrudan yazılmış
durumda. `--marka-kiremit` de aynı sebeple bugün **0 kullanımda**. Token yayınlandı;
uygulaması bileşen doğduğunda yapılır. Hangi yüzeye ineceği **karar konusudur**, tahmin
değil — bu yüzden bu dalda uygulanmadı.

**Kapı: `INV-TOKEN-AA-RENK-1`** → `src/__tests__/conformance/tailwind-token-aa-renkleri.test.ts`.

**Ölçülebilen — beş kol:** (1) iki token `index.css`te tanımlı ve HSL biçiminde ·
(2) ⭐HSL değeri çevrilince kapalı kararın HEX'ini veriyor (kanal farkı ≤ 2; dize
karşılaştırması bir hane şaşınca yeşil kalırdı) · (3) `tailwind.config.js` her ikisine
`hsl(var(--…) / <alpha-value>)` ile bağlı — **sabit HEX ile değil** (§2: yeni kaynak
açılamaz) · (4) kullanıcı kodunda değerler **ham HEX** olarak yazılmamış (CLAUDE.md kural 8) ·
(5) ön-koşul + ayırt edicilik kolları (boş evren ve yorum/kod ayrımı kanıtlanıyor).

**Sabotajla ölçüldü (2026-09-06), dört yönlü — hepsi KIRMIZI, geri alınca yeşil:**
token silindi → kırmızı (2 kol) · `24.4` → `34.4` kaydırıldı → kırmızı (kanal farkı 30) ·
koda ham `#00708F` yazıldı → kırmızı · tailwind'de `hsl(var(…))` yerine sabit HEX → kırmızı.

⛔**KONTRAST BU KAPININ ÖLÇTÜĞÜ ŞEY DEĞİL.** §3'teki gerekçe aynen geçerli: jsdom'da
ölçülemez. Yukarıdaki 5.65/4.71 sayıları kararın **gerekçesi**, kapının **çıktısı** değil.
"Kapı yeşil" ⇒ "kontrast AA" **demek değildir**; doğrulama gerçek tarayıcıya bağlıdır.

⛔**"Doğru yerde mi kullanılıyor" ölçülmez** — §3'teki semantik-rol sınırı burada da geçerli.

---

## 2) Paletin TEK kaynağı olur

Bugün en az altı kaynak var (ölçüldü, 2026-09-04):
`:root` HSL bloğu · `.light` sınıfı (aynı 12 token'ı yeniden tanımlıyor) ·
`[data-admin-theme]` · `@media (prefers-contrast: more)` ·
`tailwind.config.js`'te 4 sabit HEX · `public/favicon.svg` içinde `#2563eb`.

**Kural:** yeni bir renk kaynağı **açılamaz**. Mevcutlardan hangisinin kalacağı ve
hangisinin token'a çekileceği Faz 1'de **isim isim** listelenir; liste bu cetvele girer.

### 2.1 İsim isim liste (Faz 1, 2026-09-04'te ölçüldü ve uygulandı)

| Kaynak | Karar | Gerekçe |
|---|---|---|
| `src/index.css` `:root` HSL bloğu | **KALIR — SSOT budur** | Palet token'ları (`--marka-lacivert/turkuaz/kiremit/amber`) buraya kondu |
| `src/index.css` "Legacy Variables" HEX bloğu | **13 değişken SİLİNDİ, 2'si kaldı** | Ölçüldü: 13'ünün depoda `var(--…)` kullanımı **sıfır**. Kalan `--navy-900` + `--text-primary` yalnız `select option` kuralında ve tema-bağımsız kalmaları **kasıtlı** (gerekçesi kodda yazılı) |
| `.light` sınıfı | **BU FAZDA DOKUNULMADI** | Yalnız `AdminThemeToggle` referans veriyor — **ADMIN şeridi**, kapsam dışı (cetvel "Kapsam" satırı) |
| `[data-admin-theme]` | **DOKUNULMAZ** | Kapsam dışı, ADMIN |
| `@media (prefers-contrast: more)` | **BU FAZDA DOKUNULMADI** | Erişilebilirlik dalı; palet kararı onu ezmez, ayrı kalem |
| `tailwind.config.js` 4 sabit HEX | **BU FAZDA DOKUNULMADI, kapı ile ÇİTLENDİ** | `INV-PALET-1` paletin **ikinci kez** palet adıyla orada tanımlanmasını engelliyor. Mevcut `'warning-orange': '#F59E0B'` satırının kendisi ayrı bir kalem — kaldırmak kullanan yüzeyleri tarar, bu PR'ın kapsamı değil |
| `public/favicon.svg` `#2563eb` | **DOKUNULMADI** | `public/**` ESLint ignore'da; §2'nin **bilinen kör noktası**, aşağıda zaten yazılı |

**Silinenler (isim isim):** `--navy-800` · `--navy-700` · `--navy-600` · `--navy-500` ·
`--cyan-400` · `--cyan-500` · `--cyan-glow` · `--amber-400` · `--text-secondary` ·
`--text-muted` · `--glass-bg` · `--glass-border` · `--glass-hover`.

⚠**Silmenin kapsamadığı şey (gizlenmiyor):** `#22D3EE` **literali** `index.css` içinde
doğrudan hâlâ geçiyor (~satır 607/641). Değişkeni silmek literali kaldırmaz; o ayrı kalem.

⚠**`public/**` ESLint ignore'da** — favicon'daki renk hiçbir kapının görüş alanında
değil. Bu, kuralın bilinen kör noktasıdır ve gizlenmiyor.

---

## 3) Kapı — ve ölçemediği şey (gizlenmiyor)

**Kapı: `INV-PALET-1`** → `src/__tests__/conformance/marka-palet-tokenlari.test.ts` (2026-09-04).

**Ölçülebilen — dört kol:**
1. Dört token **tanımlı ve HSL biçiminde** (CLAUDE.md kural 8).
2. ⭐Token'ın HSL değeri **çevrilince §1'in HEX'ini veriyor** (kanal farkı ≤ 2). *Niçin dize
   karşılaştırması değil:* `23.3` yerine `33.3` yazılsa dize karşılaştırması yeni değeri
   "beklenen" sayıp yeşil kalırdı; çevrim bunu yakalar.
3. Palet **ikinci bir kaynaktan** (tailwind) palet adıyla tanımlanmamış.
4. Silinen 13 ölü değişken **geri gelmemiş**.

**Sabotajla ölçüldü (2026-09-04), üç yönlü:** kiremit tek hane kaydırıldı → **kırmızı** ·
ölü değişken geri eklendi → **kırmızı** · token tamamen silindi → **kırmızı (2 kol)** ·
geri alınca **yeşil** · tam takımda başka hiçbir kol düşmedi.

⛔**Ölçülemeyen: "kiremit yalnız ana eylemde" kuralı.** "Ana eylem" **semantik** bir roldür;
statik tarama bir token'ın hangi bileşende, hangi rolde kullanıldığını bilmez. Mevcut token
kapısının kendi yorumu da `cn()` içine gömülen dizeleri göremediğini yazıyor, ve
`toneClasses[tone]` gibi dolaylı üretim bunu kesinleştiriyor. Bu yüzden §1'in kullanım
sütunu **kapıya değil incelemeye** bağlıdır.

⛔**Kontrast, jsdom'da ÖLÇÜLEMEZ.** İki bağımsız sebeple: `vitest.setup.ts` `index.css`'i
import etmiyor (ölçüldü) ve axe-core'un `color-contrast` kuralı jsdom'da koşmaz. Yani
"axe yeşil" bu cetvelin hiçbir maddesini doğrulamaz — **sahte-yeşildir.** Kontrast ölçümü
gerçek tarayıcıda yapılır ve rapora **oran sayısı** olarak yazılır.

---

## 4) İlgili

- `docs/standards/vaat-butunlugu-standard.md` — vitrinin ne söyleyebileceği
- `docs/plans/rec129-faz1-kabuk-plani-2026-09-04.md` — Faz 1 planı (1a/1b ayrımı)
- `docs/plans/red-team-rec129-faz1-2026-09-04.md` — planın red-team raporu
- CLAUDE.md kural 8 — design token; ⚠`eslint.config.cjs` storefront ve R3F için HEX
  yasağını **kapsam dışı** tutuyor, bu cetvel onu tersine çevirmez
