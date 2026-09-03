# REC-129 Faz 1 — Kabuk (renk değişkenleri + logo + header/footer) · PLAN v2

> **Durum: PLAN — kod yazılmadı.** v1 bağımsız red-team'den **BLOK** aldı; sekiz iddiadan
> yedisi çürüdü ya da ciddi zayıfladı. Bu v2, çürüyen iddiaları **kaldırıyor** ve BLOK'u
> kaldırmak için gereken minimumu yazıyor. Rapor:
> `docs/plans/red-team-rec129-faz1-2026-09-04.md`
> Merge: Recep onayı.

## KAYNAK/CETVEL

| | |
|---|---|
| **Yöneten cetveller** | `docs/standards/rendering-cache-standard.md` · `docs/standards/storefront-reflow-standard.md` · CLAUDE.md kural 8 |
| **⚠Anılmayan mevcut cetvel (v1'in ihlali)** | [eslint.config.cjs:47-51](../../eslint.config.cjs#L47-L51) — **storefront ve R3F için HEX yasağı zaten KAPSAM DIŞI** yazılı. v1 bunu anmadan tersine çeviriyordu (kural 1 ihlali). |
| **Cetvel EKSİĞİ (bu işin kapsamında)** | "marka kılavuzu → kod token eşlemesi" cetveli YOK |
| **Karne tazeliği** | 2026-09-04, `C:/tmp/vh-urun-rec89`, taban `origin/master@480352bd`. Kontrast sayıları **iki bağımsız hesapla** doğrulandı (red-team + kendi WCAG hesabım). |
| **YÖNTEM** | Şerit (URUN), tek dal, tek PR; plan-challenger her faz planında. |

---

## 1) v1'de YANLIŞ olan üç iddia — düzeltildi

### ⛔1.1 "Depoda VentHub logosu YOK" — **ÇÜRÜDÜ**
Kanıtım `find -iname '*logo*'` idi: **dosya-adı vekili**, marka değil.
Gerçek: [NavBrand.tsx:18-22](../../src/components/navigation/NavBrand.tsx#L18-L22) her sayfada
"VH" marka kilidi render ediyor ve **token tüketiyor** — palet çevrilince kendiliğinden döner.
`public/favicon.svg` ise tam bir VH wordmark, içinde **sabit `#2563eb`** (palet dışı;
`public/**` ESLint ignore'da, hiçbir kapı görmüyor).

**Sonuç:** "Faz 1 ikiye ayrılır" önerisinin v1'deki gerekçesi düştü. Ayrım **yine de
geçerli** ama dar bir sebeple: REC-129'un **yeni** logosu (14A-3 eğik kanatçık, altı sürüm)
Design export'unu bekler; **mevcut** marka kilidi beklemez, paletle birlikte döner.

### ⛔1.2 "index.css HSL bloğu renk SSOT'udur" — **ÇÜRÜDÜ**
En az **altı** kaynak var: `:root` HSL · `.light` sınıfı aynı 12 token'ı yeniden tanımlıyor
([index.css:328-341](../../src/index.css#L328-L341)) · `[data-admin-theme]` 24×2 token ·
`@media (prefers-contrast: more)` · **[tailwind.config.js:77-80](../../tailwind.config.js#L77-L80)'de
4 ham HEX** · favicon.

⭐**Bunlardan biri doğrudan REC-129'un kapalı kararına çarpıyor:**
`'warning-orange': '#F59E0B'` — REC-129'un "uyarı amberi"nin **ta kendisi**, ama sabit HEX
olarak, tema dışında, 19 admin-dışı `.tsx` tarafından tüketiliyor.

### ⛔1.3 "İki farklı lacivert riski" — **ÇÜRÜDÜ, tersi doğru**
Legacy blok **ölü**: `--navy-800/700/600/500`, `--cyan-400/500`, `--amber-400`, `--glass-*`
için `var(--X)` tüketicisi **0** (ölçüldü). Yani çevrilmediğinde iki lacivert doğmaz.
Doğru iş "eşlemek" değil **silmek**.

---

## 2) ⭐AYAKTA KALAN VE KARARA GİDEN BULGU — palet kontrastı

Hedef paletin beyaz üzerindeki kontrast oranları (WCAG 2.1; **kendi hesabımla doğrulandı**):

| Renk | Beyaz üzerinde | AA normal metin (4.5) | AA büyük/bold metin + arayüz öğesi (3.0) |
|---|---|---|---|
| Kiremit `#D95D0E` | **3.80** | ✗ düşer | ✓ geçer |
| Turkuaz `#0088B0` | **4.08** | ✗ düşer | ✓ geçer |
| Amber `#F59E0B` | **2.15** | ✗ | ✗ **düşer** |
| *(bugünkü `primary-navy`)* | *8.83* | ✓ | ✓ |

**Dürüst okuma — "palet AA'yı geçmiyor" demek fazla sert olur:** kiremit **ana eylem
düğmesi** olarak, üzerindeki yazı büyük/kalın ise 3.0 eşiğini geçer ve meşrudur. Sorun
ikisinde:
1. **Amber (2.15)** beyaz üzerinde tek başına anlam taşıyamaz — uyarı ikonu/metni olarak
   kullanılırsa görülmez. Koyu zeminli bir rozet içinde kullanılmalı.
2. Bugünkü 8.83'ten 3.80'e inmek **bilinçli bir takas**: marka sıcaklığı kazanılır,
   okunabilirlik payı daralır. Bu **tasarım kararıdır, benim vereceğim karar değil.**

→ **Recep'e soru olarak gider** (bölüm 6).

---

## 3) ⭐"axe yeşil" kabul ölçütü SAHTE-YEŞİL — v1'in en tehlikeli maddesi

İki bağımsız sebeple bu kapı kontrast gerilemesini **hiçbir koşulda** göremez:
- `vitest.setup.ts` `index.css`'i **import etmiyor** (ölçüldü) → jsdom'da hiç CSS yok.
- axe-core'un `color-contrast` kuralı jsdom'da zaten koşmaz.

**Düzeltme:** kontrast ölçümü **gerçek tarayıcıya** taşınır (`e2e/reflow.e2e.ts` deseni
hazır). Ölçüt "axe yeşil" değil, **hesaplanmış oran sayısı** olur.
Bu, dünkü dersin aynısı: *ayırt etmeyen gösterge ölçüm değildir.*

---

## 4) Kapsam v2

### Faz 1a — tasarımdan bağımsız, şimdi yapılabilir
1. **Ölü legacy renk bloğunu sil** (tüketici 0, ölçüldü).
2. **Renk kaynaklarını sayıya bağla:** `tailwind.config.js`'teki 4 sabit HEX ve
   `favicon.svg`'nin `#2563eb`'si **envantere yazılır**; hangisi token'a çekilecek,
   hangisi kasıtlı kalacak — cetvelde **isim isim** listelenir.
3. **"Marka kılavuzu → kod token eşlemesi" cetvelini yaz.**
4. **Kontrast kapısını tarayıcıya kur** (bölüm 3).

⚠**v1'in "görsel-nötr" iddiası düzeltildi:** ölü blok silmek nötrdür, ama HEX→token çekmek
**piksel değiştirir** (`#38BDF8` ile `--brand-cyan` aynı renk değil). Bu yüzden HEX→token
işi Faz 1a'dan **çıkarıldı**, Faz 1b'ye alındı — orada zaten renkler değişiyor.

**Bu daraltmanın yan faydası:** Faz 1a `StickyHeader`'a hiç dokunmaz → **teklif-modu paketiyle
paralel gidebilir**, sıra çakışması kalmaz (v1'in §5 hükmü artık gereksiz).

### Faz 1b — Design export'una bağlı
Palet değerlerinin çevrilmesi · HEX→token · yeni logo · header/footer kabuğu.

### Kapsam DIŞI (açıkça)
- `src/components/admin/**` ve `[data-admin-theme]` — **ADMIN şeridi.**
- `LoginPage.tsx:201-213` HEX'leri — **Google G logosunun marka renkleri**; token'a çekmek
  marka ihlalidir. "0 gömülü HEX" ölçütü bu yüzden **kaldırıldı**.
- R3F malzeme sabitleri — `className` kabul etmezler; eslint cetveli zaten muaf tutuyor.

---

## 5) Kapılar v2

| Kapı | Ne ölçer | Niçin ölçülebilir |
|---|---|---|
| `INV-PALET-KAYNAK-1` (**yeni**) | Renk tanımlayan kaynakların **sayısı ve yeri** bilinen listeyle aynı mı | Yeni bir renk kaynağı doğarsa kırmızı — liste sayıya bağlı, semantiğe değil |
| Kontrast kapısı (**tarayıcıda**) | Ana eylem / uyarı yüzeylerinin **hesaplanmış oranı** | Gerçek CSS çözülür; jsdom sahte-yeşili yok |
| `tailwind-token-sinif-gecerliligi` (mevcut) | Uydurma token sınıfı | — |

⛔**`INV-PALET-SINIR-1` KALDIRILDI.** "Kiremit yalnız ana eylemde" **semantik** bir kuraldır;
mevcut token kapısının kendi yorumu "yalnız `className` atamalarını okur, `cn()` gömülü
dizeler bilinen boşluk" diyor ve `toneClasses[tone]` dolaylı üretimi bunu kesinleştiriyor.
Ölçülemeyecek kapıyı plana yazmak, yazıldı sanılan ama var olmayan kapı üretir.

---

## 6) Recep'e giden TEK karar sorusu

**Kiremit `#D95D0E` ana eylem rengi olarak beyaz üzerinde 3.80:1 veriyor; bugünkü lacivert
8.83.** Büyük/kalın düğme yazısında standarda uyar, normal boy metinde uymaz; amber `#F59E0B`
(2.15) beyaz üzerinde tek başına kullanılamaz. Palet kapalı karar olduğu için **ben
değiştirmiyorum** — sorulan şey: kiremit yalnız büyük düğme yazısıyla mı sınırlansın, yoksa
ton bir miktar koyulaştırılsın mı?

---

## 7) Kabul ölçütleri v2

1. Renk tanımlayan kaynaklar **sayılmış ve cetvelde listelenmiş**; yeni kaynak doğarsa kapı kırmızı.
2. Ölü legacy blok silinmiş; silme sonrası tüketici sayısı **hâlâ 0** (negatif kontrol).
3. Kontrast oranları **tarayıcıda ölçülmüş sayı** olarak raporda — "axe yeşil" yeterli sayılmaz.
4. Cetvel yazılı ve kapıya bağlı.
5. Beş maddelik merge ritüeli + **Recep onayı**.
