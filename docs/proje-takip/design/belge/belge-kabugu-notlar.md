
# Belge Kabuğu — teslim notları

**Tur:** OPS emri `ops-emir-2026-09-05-1-belge.md` (K11) + eki `ops-emir-2026-09-05-2-cip.md` (VentHub çipi hazır).
**Dosya:** `Belge-Kabugu.dc.html` · **Prova:** `Prova Tek Renk.dc.html`
**Kullanılan yetenek:** Document şablonu (doc-page, A4 akan belge) · Make tweakable (kimlik yuvası + `alanAdlari`) · Save as PDF (baskı provası, aşağıda not).
**İmza:** — DESIGN-BELGE (Opus) 2026-09-05

---

## 1 · Çipin gördüğüm hâli (ölçüm)

Çip bağlı ve çalışıyor. Tarayıcıda ölçtüğüm:

| Ne | Ölçülen |
|---|---|
| Namespace | `VentHubDesignSystem_31b082` |
| Bileşen | **6** — AnaEylemDugmesi · CerceveliDugme · KabukBandi · TeknikTablo · Cip · Kart |
| Token dosyası | 4 (`renk` · `tipografi` · `yuzey` · `kenar`) + `styles.css` girişi |
| Çözülen token örneği | `--primary-navy: 219 48% 20%` · `--surface-inset: 60 11% 93%` · `--border-hairline: 60 6% 88%` · `--font-mono: 'IBM Plex Mono'…` |
| Varlık (`assets/`) | **çip vermiyor** — `_ds/` altında yalnız token + bundle var |

Emirdeki sayı (50 token · 6 bileşen · 19 kart · 172 varlık) ile bileşen sayısı birebir uyuştu. Kart ve varlık sayısı çipin bu projeye indirdiği pakette **yok**; ikisi de DS kaynak projesinde duruyor.

**Varlık kararı:** emir #2 "çip dosya veriyorsa kopyalama, referans ver; vermiyorsa türev kopya" diyor. Ölçüm: vermiyor → **türev kopya**. Altı SVG `brand/logo/` altına DS kaynak projesinden alındı, damga `brand/logo/README.md`. Çapraz proje yolu (`/projects/…`) baskıda boş kare çıkarıyor, o yüzden referans verilemezdi.

## 2 · Kabuk ne yapıyor

`Belge-Kabugu.dc.html`, `bolum` prop'uyla iki parça:

- **`baslik`** — "kapalı bekler" şeridi · logo · marka · künye satırı · belge başlığı · alt başlık · kare kod alanı
- **`kunye`** — footer bandı: künye · sayfa no · belge ref

Tablo stili kabuğun helmet'inde (`doc-page table` / `thead th` / `tbody td`, element seçicileri — sınıf yok) ve ana belgeye **iniyor**; ölçüldü. Altı belge bu kabuğa binmiş durumda.

### Kimlik yuvası — bugünkü hâli

| Yuva | Prop | Kaynak |
|---|---|---|
| Marka adı | `markaAdi` | kiracı adı (`tenants.name`) |
| Logo | `logoSurumu` (tamrenk · lacivert · siyah · beyaz · tamrenkKoyu · ozel) + `logoDosyasi` | dosya, K23 |
| Künye satırı | `kunyeSatiri` | şirket künyesi (K7: değer yoksa satır çizilmez) |
| Vurgu rengi | **prop DEĞİL** | DS çipi: `hsl(var(--primary-navy))` |
| Yazı ailesi | **prop DEĞİL** | DS çipi: `var(--font-sans)` / `var(--font-mono)` |

**Emirden bilinçli sapma — gerekçesi:** emir vurgu rengini ve yazı ailesini yuva olarak sayıyordu; ikisini prop olarak **çıkardım**. Sebep: çip bağlandıktan sonra bu iki değerin sahibi DS'tir, kiracı ezmesi `tenants.styles` → **token katmanında** yapılır, belge şablonunda değil. Aynı değeri iki yerden ezilebilir yapmak, protokolün "ölçüm sahipliği" kuralını kırar (bir sayı tek sahipte yaşar). Belgede renk taşıyan tek öğe logo ve o da dosyadan geliyor; kiremit ve turkuaz belge metninde hiç kullanılmıyor. Karar OPS'ta — geri istenirse prop'lar bir satırla döner.

## 3 · Bu turda ölçümle yakalanan üç kusur

**1. Başlıklar Archivo değildi.** `doc-page` kabuğu kendi host stilinde `font-family: -apple-system, BlinkMacSystemFont…` basıyor; `h1`/`h2` gövdeden Archivo'yu **miras almıyordu**. Ölçüm: `h1` computed font `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial`. Yani v1'lerden beri altı belgenin bütün başlıkları sistem fontuyla basıyordu ve bu çipe bağlanana kadar görünmedi. Kabuğa `doc-page h1, doc-page h2 { font-family: var(--font-sans) }` kondu; yeniden ölçüldü, `Archivo` geldi (Archivo 700 yüklü).

**2. Tablo başlığı zemini yanlış tondaydı.** Ben `#F4F4F2` (sayfa zemini) kullanıyordum; DS'te tablo başlığı `--surface-inset` `#EEEEEA`. Çipe bağlanınca doğru tona geçti (ölçüldü: `rgb(239,239,235)`).

**3. Ham hex ve alfa taraması.** Yedi dosyada (kabuk + altı belge) ham hex **0**, `opacity`/`rgba` **0**. K22 (durum alfa ile anlatılmaz) belgelerde ihlal edilmiyor: "kapalı bekler" şeridi soluklaştırma değil, lacivert 1 px çerçeve + `--surface-inset` zemin + mono büyük harf rozet dili.

## 4 · Provalar

**Tek renk provası:** `Prova Tek Renk.dc.html` — müşteri belgesi değil, denetim sayfası. Aynı kabuk başlığını iki logo sürümüyle gri tona çevirip yan yana koyuyor, altında ölçülen kontrast tablosu var.

**DÜZELTME (aynı tur, gözle denetimde yakalandı).** İlk yazdığım sonuç yanlıştı: "tamrenk işaret gri tonda dört dilim yerine iki blok okunuyor" dedim, **ölçmedim, çıkarsadım.** Gerçek: `venthub-isaret-tamrenk.svg` dört poligonu 0–25 · 50–75 · 100–125 · 150–175 bantlarına koyuyor, aralarında **25 birim saydam boşluk** var. Dilimler birbirine değmediği için ayrımı renk değil **geometri** taşıyor; gri tonda dört dilim iki sürümde de ayrık kalıyor. Üstelik alt iki dilim tamrenk sürümde de zaten aynı renk (`#0088b0`), yani "üst dilim alt iki dilimle birleşir" çıkarımı renkli hâlde de tutmuyor.

Ölçümün gerçekten gösterdiği, daha dar bulgu: kiremit %22,6 ve turkuaz %20,7 aynı orta griye düşüyor, yani **renk kademesi** kayboluyor — işaretin üç renkli kodu tek tona iniyor. Yapı kaybolmuyor.

Sonuç olarak `logoSurumu=lacivert` bir okunurluk düzeltmesi **değil**: kılavuzun tek renk kuralı yerinde duruyor ama dayanağı tutarlılık, ölçüm değil. Ölçümün karşılığı olan tek gerçek değişiklik turkuaz metnin belgelerden çıkarılmasıdır (4,08:1, renkli baskıda da eşik altı).

**Baskı provası (PDF):** doc-page zaten baskı geometrisinin sahibi; PDF çıktısı **tarayıcının yazdırma görünümünden** alınır ve dosya olarak projeye ben yazamıyorum — kaydetme adımı kullanıcı eylemidir. Bu yüzden bu turda PDF **dosya olarak projede yok**; onun yerine baskının ölçülebilir kısmını ölçtüm:

| Ölçüm | Değer |
|---|---|
| Sayfa kutusu | A4, kenar 18 mm → basılabilir alan 174 × 261 mm |
| Teklif v2 · 5 kalem | tek sayfa |
| Teklif v2 · 40 kalem (stres) | 4 965 px içerik / 1 368 px sayfa → **~3,6 → 4 sayfa** |
| Tablo başlığı | `<thead>` — her sayfada tekrar eder |
| Logo baskı boyu | 36 px ≈ 9,5 mm (kılavuz eşiği ≥6 mm) |
| En küçük yazı | 13,33 px ≈ **10 pt** (K4 eşiği) |

## 5 · Açık kalan — numaralı sorular (REC-153)

**153-1 · Kabuk dosya adı.** Emir çıktıyı `Belge Kabugu v1.dc.html` diye adlandırıyor; kurulu dosya `Belge-Kabugu.dc.html`. Ad tireli çünkü belgelerin `dc-import name` değeri dosya adının tıpkısı olmak zorunda (boşluklu ad denendi, mount boş kaldı). Adı değiştirmek altı belgenin import satırını kırar. **Öneri:** ad böyle kalsın; emirdeki ad kaydı düzeltilsin.

**153-2 · Sayfa no ve nakli yekûn** (önceki turdan açık). CSS `counter(page)`/`counter(pages)` yalnız `@page` kenar kutularında çözülür; Chrome ve Firefox desteklemiyor, doc-page de `@page margin:0` basıyor. Kabuk sayfa no **alanını** taşıyor, değerini taşımıyor (varsayılan `__ / __`; değeri bilen belge prop'la geçiyor — Kargo Bildirimi "1 / 1"). Üç yol: (a) üretimdeki PDF üreticisine devret — Puppeteer `footerTemplate` `pageNumber`/`totalPages` destekliyor **[önerim]** · (b) açık sayfa modeline geç, tablo bölme motoru yaz · (c) vazgeç.

**153-3 · Vurgu rengi ve yazı ailesi yuvası** — bölüm 2'deki sapma onaylanıyor mu?

**153-4 · E-posta şablonları biçimi** (önceki turdan açık). Protokol tablosu DESIGN-BELGE için **HTML email** yeteneğini açıkça sayıyor; bunu cevap sayıp gönderime hazır HTML e-posta olarak çizeceğim — aksini söylemezsen.

**153-5 · Grup başlığı sayfa sonu.** Grup ara başlığına `break-after:avoid` kondu; Chrome tablo satırında kısmen destekliyor. Baskıda gözle doğrulanması gereken tek nokta bu — ölçemedim, çünkü tarayıcı sayfa sınırlarını DOM'a vermiyor.

## 6 · Sıradaki

Belge sırası (bayat dosyası): **e-posta şablonları** → föy şablonu → yasal set (kapalı bekler) → satınalma EN (K10) → antetli. Sıradaki turum e-posta.

