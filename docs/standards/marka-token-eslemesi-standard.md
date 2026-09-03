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

⚠**`public/**` ESLint ignore'da** — favicon'daki renk hiçbir kapının görüş alanında
değil. Bu, kuralın bilinen kör noktasıdır ve gizlenmiyor.

---

## 3) Kapı — ve ölçemediği şey (gizlenmiyor)

**Ölçülebilen:** paletin **kaynak sayısı ve yeri**. Yeni bir renk kaynağı doğarsa kırmızı.

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
