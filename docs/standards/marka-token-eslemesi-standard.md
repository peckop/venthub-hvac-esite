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
