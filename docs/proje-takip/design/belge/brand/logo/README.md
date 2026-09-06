
# brand/logo — türev kopya

**Kaynak:** VentHub Design System projesi `31b0824c-8d7e-4a4c-94c7-8c094a1c62b7` → `assets/logo/` (28 SVG).
**Kopya tarihi:** 2026-09-05. **Elle düzenlenmez.** Kılavuz/DS değişince yenilenir; tazeleme DESIGN-MARKA, tetik OPS.

Niçin kopya, niçin referans değil: DS çipi bu projeye `_ds/…/` altında **token ve bileşen** veriyor (renk.css · tipografi.css · yuzey.css · kenar.css · styles.css · _ds_bundle.js), **varlık vermiyor** — `_ds/` altında `assets/` yok. OPS emri #2: "çip dosya veriyorsa kopyalama, referans ver; vermiyorsa #1 emrindeki türev kopya kuralı geçerli." Ölçüm: vermiyor → kopya. Çapraz proje yolu (`/projects/…`) baskıda boş kare çıkarır.

Alınan altı dosya (28'in tamamı değil — belgede kullanılan):

| Dosya | Nerede kullanılır |
|---|---|
| `venthub-isaret-tamrenk.svg` | varsayılan, açık zemin (A4 beyaz) |
| `venthub-isaret-lacivert.svg` | **tek renk baskı ve fotokopi** — ölçüm: kiremit %22,6 / turkuaz %20,7 gri ton, 2 puan fark → **renk kademesi** kaybolur. Düzeltme (2026-09-06): "dört dilim yerine iki blok okunuyor" cümlesi YANLIŞTI, ölçülmeden çıkarsanmıştı — dilimler arasında 25 birim saydam boşluk var, gri tonda dördü de ayrık kalır. Bu dosyanın kullanımı okunurluk düzeltmesi değil **tercih** (tutarlılık) |
| `venthub-isaret-siyah.svg` | faks, tek renk siyah zorunlu çıktı |
| `venthub-isaret-beyaz.svg` | koyu zemin, tek renk |
| `venthub-isaret-tamrenk-koyu.svg` | koyu zemin, tamrenk (K23 dizilimi: kiremit · beyaz · beyaz · turkuaz — ikinci **ve** üçüncü dilim beyaza döner) |
| `venthub-kilit-yatay-lacivert.svg` | antetli kâğıt turu için ayrıldı; belgelerde kullanılmıyor (işaret + canlı Archivo wordmark yan yana duruyor, wordmark metin kalsın diye) |

K23: logo hiçbir yerde elle çizilmez. Kabuğun eski CSS `clip-path` dilim çizimi kaldırıldı; `Belge-Kabugu.dc.html` bu dosyaları `<img>` ile basar.

Kilitler `<text>` + Archivo 700 taşır — kullanan sayfa Archivo'yu yüklemek zorundadır (DS `styles.css` yüklüyor).

