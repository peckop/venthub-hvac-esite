
# Antetli kâğıt + e-posta imzası — teslim notu · DESIGN-BELGE · 2026-09-06

OPS sırasının **6. adımı** (emir #4'ün hükmü: "KVKK → 6. adım: antetli kâğıt + e-posta imzası, kabuk kimliğiyle, logo dosyadan K23").
`Antetli Kagit v1.dc.html` · `email/imza.html`

## Antetli kâğıt

**Niçin kabuğa bindirilmedi.** `Belge-Kabugu` bir BELGE kimliğidir: belge başlığı, alt başlık, kare kod alanı, "kapalı bekler" şeridi taşır. Antetli kâğıdın bunların hiçbiri yok; taşıdığı tek şey kimlik + künye ve **boş yazı alanı**. Kabuğu buraya bindirmek, kabuğa "başlıksız belge" hâli eklemek olurdu ve K11'in tek şablon kuralını gevşetirdi. Kimlik dizilimi ve ölçüleri kabuğunkiyle **birebir aynı**: 36 px işaret · 11 px boşluk · 22 px wordmark (Archivo 700, −0.03em) · 1 px lacivert alt kural · künye 13 px IBM Plex Mono + 1 px hairline üst kural.

**Ölçülmüş slot kararı:** kimlik `slot="header"`, künye `slot="footer"` — `doc-page` bu iki slot'u **basılan her sayfada** tekrar ediyor. Antetli kâğıdın tanımı bu: ikinci ve üçüncü sayfa da antetli olmalı. Belgelerde başlık akan içerikte duruyor (orada yalnız ilk sayfada olması gerekiyor), künye ise footer slot'unda — fark bilinçli, ikisi aynı kabuktan çıkmıyor.

**Geometri:** A4 210 × 297 mm · kenar boşluğu **20 mm** (belgeler 18 mm; antetlide yazı alanı daha içeride durur) · yazı alanı 170 × 257 mm. İşaret 36 px ≈ 9,5 mm, baskı eşiği ≥6 mm sağlanıyor.

**Yer tutucular (K7):** unvan · adres · telefon · VKN · MERSİS. Gerçek görünümlü sahte numara yazılmadı. Tek dolu değer **`venthub.com.tr`** — emir #3'ün kanonik alan adı hükmü.

**Logo dosyadan (K23):** `brand/logo/venthub-isaret-tamrenk.svg`, `<img>` ile. İkinci dizilim `venthub-kilit-yatay-lacivert.svg` (`kilit` tweak'i) — kilidin kendi `<text>`i Archivo taşıyor, tek dosya isteyen matbaa için. Varsayılan dizilimde wordmark **canlı metin** kalır.

Tweaks: `sayfa` (ilk / ikinci — devam sayfasında üst künye bloğu düşer, K16 deseni: ayrı dosya açılmadı) · `kilit` · `provaCizgileri` (yazı alanı ve ölçü tablosu görünür; varsayılan kapalı, temiz antetli).

## E-posta imzası

**Karar: HTML.** İmza gönderim çıktısıdır, e-posta şablonlarıyla aynı sınıf — K14'ün kuralları birebir geçerli: tablo tabanlı · inline stil · **Arial** (web fontu taşınamaz) · mono etiketler `'Courier New'` · ham hex (istemci CSS değişkeni okumaz). OPS'a sorulmuştu (`sorular-2026-09-06-2.md`), cevap gelmeden çizildi; gerekçe bu.

Genişlik **460 px** (imza gövde metnine yapışır, 600 px kart genişliği değil). Yapıştırma kapsamı dosyadaki tek `<table>`; dış `<html>`/`<body>` yalnız ön izleme.

**Beş kişi alanı yer tutucu:** `{{ad_soyad}}` · `{{unvan}}` · `{{telefon}}` · `{{eposta}}` + künye satırı. **Bu alanların kodda karşılığı YOK** ve olması da gerekmiyor: imza istemci tarafında (Gmail/Outlook) doldurulur, `renderTemplate` motoru bu dosyayı işlemez. Motora bağlanacaksa alan adları kod tarafında açılır.

**Bağlantı rengi `#00708F`** (`--brand-cyan-ink` karşılığı) — ham turkuaz `#0088B0` beyaz üstünde 4,08:1 ile AA'nın altında kalıyor (K25-b). İmzada ölçülen tek renkli metin bu.

**Logo URL'i:** `https://venthub.com.tr/brand/venthub-isaret-tamrenk.svg`. İmzada logo **gömülemez** — istemciler `<img>`i uzak URL'den çeker; dosyanın o yola yayınlanması kod/altyapı tarafının işi. Yayınlanmazsa imza yalnız metinle çalışır (alt metni "VentHub").

## Ölçüm
| Ne | Değer |
|---|---|
| Antetli · ilk sayfa | 1,00 sayfa (boş yazı alanı) · prova kipinde 1,00 |
| Antetli · ham hex | 0 (token) · alfa 0 |
| İmza · ham hex | **kasıtlı** — K14'ün ikinci zorunlu sapması, istemci token okumaz |
| İmza · web fontu | 0 (Arial + Courier New) |
| Uydurma kişi/şirket verisi | 0 |

## Açık kalan
- Kişi ve şirket verisi Recep'ten gelene kadar yer tutucu (K7).
- Logo SVG'sinin `venthub.com.tr/brand/` yoluna yayınlanması → kod tarafı.
- **Kartvizit** OPS emri #5 ile onaylandı; sıra bozulmadan bu adımdan sonra çizilir (85 × 55 mm, ön/arka, iki varyant, 3 mm taşma payı).
- Kâğıt provası (153-9) artık **on altı** belge + antetli.

— DESIGN-BELGE (Opus) 2026-09-06

