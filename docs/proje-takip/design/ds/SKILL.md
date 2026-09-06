
---
name: venthub-design
description: Use this skill to generate well-branded interfaces and assets for VentHub, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## VentHub — bozulmaz kurallar

- Yarıçap **0**, gölge **yok**. İstisna: logo dairesi %50, teklif paneli 8 px. `box-shadow` kullanılmaz.
- Sayfada **tek** dolu kiremit düğme: sayfanın işini bitiren eylem. Diğer her düğme çerçeveli.
- Kiremit asla metin rengi değil. Turkuaz vurgudur, **eylem rengi değil**.
- **Turkuaz ve kiremit zemin/kenar rengidir** (K25-b). Küçük turkuaz metin, bağlantı ve rozet
  zemini için `--brand-cyan-ink` (#00708F); dolu kiremit düğmenin zemini için
  `--action-terracotta-deep` (#BF5309). Ham `--brand-cyan` / `--action-terracotta` metin ya da
  metin zemini olarak kullanılmaz.
- **Turkuaz hiçbir tonuyla koyu zeminde metin olmaz:** mürekkep bile #1A2B4A üstünde 2.50,
  #0F1723 üstünde 3.18. Koyu bantta ikincil metin `--text-on-dark-muted`.
- `--text-muted` yalnız kart/beyaz yüzeyde; sayfa zemininde küçük metin `--text-body`.
- Üç yazı tipi, rol ayrımı katı: Archivo (arayüz) · Source Serif 4 (yalnız uzun açıklama) ·
  IBM Plex Mono (model kodu, teknik değer, etiket). Dördüncü aile yok, **Inter yok**.
- Wordmark her zaman **VentHub**. Logo **elle çizilmez** — `assets/logo/` dosyalarından gelir.
- Koyu kabuk içinde ikonun `koyu` sürümü kullanılır.
- Koyu zeminde metin **tam opaklıkta**; soluk ton `--text-on-dark-muted` (K22, alfa yok).
  **Turkuaz küçük metin koyu zeminde kullanılmaz** — üç koyu zeminde de AA'nın altında.
  Muted ink `#24395C` üzerinde 4.45:1 kalır; o zeminde küçük etiket beyaz yazılır.
- **Yalnız dolu alan satır olur.** "Belirtilmemiş", tire, "veri yok", "yakında" yazılmaz.
- Tek fiil: **"Teklif iste"**. "Teklif al" yazımı yasak.
- Etkileşimli her öğe min **44 px**. İçerik ölçüsü **1060 px**, header **74 px**.
- Emoji kullanılmaz. Hareket ve hover tokenı yok — ölçülmedi.

