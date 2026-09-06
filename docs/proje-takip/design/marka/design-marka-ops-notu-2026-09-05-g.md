
# DESIGN-MARKA → OPS · 2026-09-05 · DS projesi kurulum planı + iki soru

Recep `VentHub Design System` projesini açtı, tür işaretli, Published kutusu boş (onun kararı).
Design System sekmesi "No cards yet" diyor — kart yok, kurulum başlamadı. Model Opus 5 High.

Recep'in hazırladığı başlatma promptunu inceledim. **İki hata ve altı eksik** buldum; aşağıda
düzeltilmiş hâli var. Ayrıca **bir kural sorusu** çıktı, cevabı kurulumdan önce gerekiyor.

## Kural sorusu — varlık kopyası kaçınılmaz

OPS'un 4. hükmü: *"üç kopya yok; tek değer dosyası `tokens.css` = DS kökü `styles.css` =
depoya giden dosya."* Değerler için bu uygulanabilir — DS kökündeki `styles.css` marka
projesindeki `brand/tokens.css` ile **birebir aynı içerik** olur.

Ama **varlıklar** (172 SVG) için uygulanamaz: design system derleyicisi projenin **kendi**
dosyalarını okuyup tüketicilere paketliyor. SVG'ler DS projesinin içinde fiziksel olarak
bulunmak zorunda, referansla çalışmıyor.

**Önerim:** kural "tek **değer** dosyası" olarak okunur. Varlık kopyası teknik zorunluluk:
- Kaynak: marka projesi `brand/icons/` + `brand/logo/` (172 dosya)
- DS kopyası: `assets/icons/` + `assets/logo/` — **üretilmiş kopya**, elle düzenlenmez
- Kılavuz değişince kopya yenilenir (tazeleme DESIGN-MARKA, tetik OPS — 2. hüküm)
- DS README'sine "bu klasör türevdir, kaynağı marka projesidir" damgası konur

Onaylıyor musunuz, yoksa başka bir yol var mı?

## İkinci soru — bileşen kapsamı yazılı olmalı

Design system yöntemi bileşen envanterini **kaynaktan** almayı şart koşuyor ve şunu açıkça
yasaklıyor: *"bir tasarım sisteminin genelde sahip olduğu bileşenleri (Toast, Avatar, Tabs…)
kaynak tanımlamıyorsa eklemeyin; kaynakta karşılığı olmayan bileşen, tüketicilerin
güvenip tasarımcıların tanımadığı bir uydurmadır."*

Recep'in promptunda bileşen listesi yok. Liste yazılmazsa yöntemin varsayılan seti
(Button, Input, Select, Checkbox, Radio, Switch, Card, Badge, Tag, Tabs, Dialog, Toast,
Tooltip) devreye girer ve markada karşılığı olmayan bileşenler üretilir.

**Kılavuzun gerçekten tanımladığı altı bileşen** (Bölüm C site kabuğu + K5 düğme kuralı):
1. **Dolu kiremit düğme** — sayfada tek, sayfanın işini bitiren eylem (K5)
2. **Çerçeveli düğme** — diğer her eylem
3. **Kart** — yarıçap 0, gölge yok, 1 px kenar
4. **Çip** — filtre ve etiket
5. **Teknik tablo** — IBM Plex Mono değerler, dolu satır kuralı (K7)
6. **Koyu header/footer bandı** — kabuk ekranının parçası

Bunun dışına çıkmayacağım. Ekleme gerekirse DS README'sinde "bilinçli ekleme" olarak
gerekçesiyle yazılır (yöntemin izin verdiği tek yol).

## Recep'in promptundaki iki hata

1. **"144 ikon ve 7 logo"** → logo seti **28 dosya**: işaret 7 · yatay kilit 7 · dikey kilit 7 ·
   favicon 4 · avatar 2 · paylaşım 1. "7 logo" yalnız işaret sürümleri. Toplam varlık **172**.
2. **Bileşen listesi yok** → yukarıdaki madde.

## Altı eksik

3. **Yarıçap 0 / gölge yok** yazılmamış. Yazılmazsa yöntemin varsayılanları (radius, shadow
   ölçeği) devreye girer — sözleşmenin ölçtüğü en belirgin fark bu.
4. **Yazı tipleri** — üçü de Google Fonts (Archivo · Source Serif 4 · IBM Plex Mono, hepsi
   SIL OFL). Yöntem "font dosyalarını projeye kopyala, `@font-face` yaz" diyor ve eksikse
   "en yakın Google Fonts karşılığını bul, ikameyi bildir" istiyor. Burada ikame **yok**,
   aileler gerçek; bağlantıyla yüklenir, binary taşınmaz. Yazılmazsa gereksiz ikame uyarısı
   veya yanlış aile riski var.
5. **Damga** — OPS'un 3. hükmü: DS kökü ve README'ye `kaynak_updatedAt` (kılavuzun son
   değişimi) + `sozlesme_updatedAt`. Promptta yok.
6. **Marka listesi 7** (Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals ·
   Flexiva; Storm marka değil) — DS'e de aynı liste girecek.
7. **`SKILL.md`** — yöntem sonunda istiyor (Claude Code'a indirilebilir hâl). Promptta yok.
8. **İmza ve teslim biçimi** — `— DESIGN-MARKA (model) YYYY-MM-DD`, yoruma saat yazılmaz,
   tur sonu yorumuna kullanılan `/` yeteneği yazılır (protokol).

## Düzeltilmiş prompt

> Sen DESIGN-MARKA şeridisin; bu proje senin ikinci projen: VentHub Design System.
>
> **Önce oku:** projedeki `ops-iletisim-protokolu.md`, `brand/README.md`,
> `tasarim-sozlesmesi-v1.json`. Sonra Linear'da REC-149'daki OPS yorumları — kurulum
> hükümleri orada. Kaynak proje: Marka Kılavuzu `670f9f75-9e90-499e-a6fe-a98139bb457a`
> (`CLAUDE.md` = karar kaydı, `brand/` = varlıklar). O projeye **yazma**, yalnız oku.
>
> **Değerlerin kaynağı:** CLAUDE.md kararı + `tasarim-sozlesmesi-v1.json` ölçümü. Sıfırdan
> icat yok. Çelişirse sözleşme kazanır. Kök `styles.css` = `brand/tokens.css` ile **birebir
> aynı içerik** — ayrı bir değer kümesi üretme.
>
> **Create design system yeteneğiyle kur:**
> - Kök `styles.css` (yalnız `@import` satırları) + `tokens/` (renk · tipografi · yüzey)
> - **Yarıçap 0, gölge yok.** İstisna: logo dairesi %50, teklif paneli 8 px
>   (`--radius-panel`). `box-shadow` kullanma; derinlik yüzey tonu + 1 px kenar
> - Yazı tipleri: **Archivo** (arayüzün tamamı) · **Source Serif 4** (yalnız uzun açıklama) ·
>   **IBM Plex Mono** (model kodu, etiket). Üçü de Google Fonts, SIL OFL — bağlantıyla
>   yüklenir, **ikame yok, binary taşınmaz**. Dördüncü aile eklenmez, Inter kullanılmaz
> - `assets/icons/` **144 SVG** (16 ikon × 64/48/24 px × tamrenk/lacivert/koyu) ve
>   `assets/logo/` **28 SVG** (işaret 7 · yatay kilit 7 · dikey kilit 7 · favicon 4 ·
>   avatar 2 · paylaşım 1) — marka projesinden kopyalanır, türev kopyadır, elle düzenlenmez
> - **Bileşenler yalnız şu altı:** dolu kiremit düğme (sayfada tek, sayfanın işini bitiren
>   eylem) · çerçeveli düğme · kart · çip · teknik tablo · koyu header/footer bandı.
>   Kaynakta olmayan bileşen **eklenmez**; gerekirse README'de "bilinçli ekleme" olarak
>   gerekçelendir
> - **Yalnız kabuk ekranı** (koyu header + aydınlık gövde + footer, içerik boş). UI kit tam
>   ekranları girmez — ekran kaynağı DESIGN-MENU (K11)
> - **Foundation kartları:** üç ikon boyunu (64/48/24) yan yana gösteren kart zorunlu;
>   ayrıca palet, üç yazı tipi rolü, yüzey/kenar, yarıçap-gölge yokluğu, logo sürümleri,
>   marka listesi (Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva;
>   Storm marka değil)
> - `readme.md` + `SKILL.md`. Kök `styles.css` ve README'ye `kaynak_updatedAt` (kılavuzun son
>   değişimi) + `sozlesme_updatedAt` damgası koy
>
> **Published kutusunu işaretleme** — o Recep'in.
>
> **Bitince:** projeye dosya bırak ve REC-149'a yorum yaz. İmza
> `— DESIGN-MARKA (model adı) 2026-09-05`, yoruma saat yazma, kullandığın `/` yeteneğini yaz.

## Kurulum sırası (benim planım)

1 Kaynakları oku (protokol · brand/README · sözleşme JSON · REC-149 · marka CLAUDE.md) →
2 `tokens/` + kök `styles.css` → 3 varlıkları kopyala (172 SVG) → 4 foundation kartları
(12–20, üç ikon boyu yan yana dahil) → 5 altı bileşen (`.jsx` + `.d.ts` + `.prompt.md` +
kart HTML) → 6 kabuk ekranı → 7 `readme.md` + `SKILL.md` + damgalar → 8 dosya + REC-149 yorumu.

Varlık kopyası sorusuna (yukarıdaki 1. soru) cevap gelmeden 3. adımı atmam.

— DESIGN-MARKA (Opus) 2026-09-05

