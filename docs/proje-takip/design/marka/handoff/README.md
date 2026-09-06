
# Handoff: VentHub marka sistemi

## Genel

Bu paket VentHub'ın görsel kimliğini bir kod tabanına uygulamak için hazırlandı: renk ve
tipografi tokenları, işaret (logo) SVG'leri, 16 kategori/senaryo ikonu üç boyda, ve bunların
kullanım kuralları.

Hedef depo: **peckop/venthub-hvac-esite** (branch `master`). Depo düzeni okundu; tokenlar
o düzene uyacak biçimde yazıldı (HSL üçlüsü custom property + Tailwind `hsl(var(--x) /
<alpha-value>)` eşlemesi).

## Bu paketteki dosyalar hakkında

Bu klasör **kod değil, kaynak varlık ve kural** taşır. İçindeki `.css` ve `.js` dosyaları
doğrudan kullanılabilir (token tanımı ve Tailwind eşlemesi); `.svg` dosyaları doğrudan
kopyalanır. Kural metinleri uygulanacak davranışı anlatır, çalıştırılacak kod değildir.

Kimliğin **çizim kaynağı** DESIGN-MARKA projesindeki `1 Venthub Marka Kilavuzu.dc.html`
dosyasıdır — HTML olarak yazılmış bir tasarım referansıdır, üretime kopyalanacak kod değil.
Ekran tasarımları bu paketin kapsamında **değildir**: onlar DESIGN-MENU projesinde
(`Menü Tasarımı v15.dc.html`, `Venthub Ana Sayfa v9.dc.html`) ve ayrı bir devir konusudur.

## Kesinlik

**Yüksek kesinlik (hifi).** Bütün renkler, yazı tipi aileleri, ölçüler ve kurallar karar
verilmiş ve ölçülmüştür. Hex değerleri, HSL üçlüleri ve piksel ölçüleri yuvarlanmadan
kullanılmalıdır. Tek istisna: aşağıdaki "Bilinçli eksikler" bölümünde sayılanlar.

## Dosyalar

| Dosya | Ne |
|---|---|
| `../brand/tokens.css` | Renk · yazı tipi · yarıçap tokenları, HSL üçlüsü |
| `../brand/tailwind-brand.js` | `tailwind.config.js` `theme.extend` eşleme parçası |
| `../brand/README.md` | Palet · yazı tipi rolleri · marka listesi · logo · ikon · kabuk · depoya alma |
| `../brand/logo/` | 7 işaret SVG + yatay kilit parçası + logo README |
| `../brand/icons/` | 144 SVG: 16 ikon × 64/48/24 px × tamrenk/lacivert/koyu |

Paket `brand/` klasörüne **referans verir, kopyalamaz.** Karar (OPS, 5 Eylül): tek değer
dosyası `brand/tokens.css`; aynı içerik design system projesinin kök `styles.css`'i ve depoya
giden dosyadır. Elle çoğaltma yapılmaz — üçüncü bir kopya bayatlama kaynağı olur.

## Tasarım tokenları

Tam liste `../brand/tokens.css` içinde. Özet:

**Marka renkleri**
- `--primary-navy` `#1A2B4A` → `219 48% 20%` — yapı, wordmark, header/footer
- `--brand-cyan` `#0088B0` → `194 100% 35%` — hava, vurgu
- `--action-terracotta` `#D95D0E` → `23 88% 45%` — logo üst dilimi + sayfanın tek ana eylemi

**Kapsamı belli iki vurgu (palet üyesi değil)**
- `--accent-air-green` `#3D7A1E` → `100 61% 30%` — yalnız Hava Arıtma kategori sayfaları
- `--warn-amber` `#F59E0B` → `38 92% 50%` — yalnız arayüz uyarı kutusu

**Yüzey ve kenar**
- `--surface-page` `#F4F4F2` · `--surface-card` `#FFFFFF` · `--surface-inset` `#EEEEEA`
- `--border-hairline` `#E2E2DE` · `--surface-dark` `#0F1723`

**Metin**
- `--text-strong` `#1A2B4A` · `--text-body` `#4A5568` · `--text-muted` `#6B7280`

**Yazı tipi**
- `--font-sans` **Archivo** — arayüzün tamamı
- `--font-serif` **Source Serif 4** — yalnız uzun açıklama metni
- `--font-mono` **IBM Plex Mono** — model kodu, belge no, teknik değer, bölüm etiketi

**Yarıçap ve gölge**
- `--radius: 0` — köşe yarıçapı yok
- `--radius-panel: 8px` — tek istisna, teklif paneli
- Gölge yok. Derinlik yüzey tonu + 1 px kenarla anlatılır. `box-shadow` kullanılmaz.

## Davranış kuralları

Bunlar görünüm değil **davranış** kuralları; bileşen mantığına girer.

**Eylem rengi.** Her sayfada **tek dolu kiremit düğme** bulunur, o da sayfanın işini bitiren
eylemdir. Diğer her düğme çerçevelidir. Kiremit asla metin rengi değildir. Bu kural sayfa
düzeyinde denetlenir: aynı görünümde iki dolu kiremit düğme varsa biri yanlıştır.

**Eylem sözlüğü.** Tek fiil: **"Teklif iste"**. "Teklif al" yazımı sistemden kalkmıştır.
Gövde düğmeleri bağlamıyla adlanır ("Projeniz için teklif iste", "Bu model için teklif iste",
"Teklif talebini gönder", "Teknik destek iste"). Eylem asla ince metin bağlantısı olmaz.

**Wordmark.** Her zaman **VentHub** — camel case, Archivo 700, harf aralığı −0.03em.
`VENTHUB` ve `venthub` yazımları yasaktır; büyük harfli etiketin içinde bile camel-case kalır.
İşaret harf ikame etmez.

**Kabuk.** Sitede tek koyu ton lacivert: header ve footer koyu, sayfa gövdesi aydınlık.
Kiremit sayfada tek sıcak noktadır.

**İkon sürümü seçimi.** Koyu lacivert header/footer içinde `koyu` sürüm kullanılır — `tamrenk`
sürüm lacivert üstünde 1.31:1 kontrast verir, okunmaz. Tek renk baskıda `lacivert` sürüm.
Baskıda kategori vurgu rengi kullanılmaz (yeşil ve turkuaz gri dönüşümde 1.29 kat ayrı; tek
renkte vurgu zayıflar).

**Logo hareketi.** Dilimlerin aşağı akışı; yalnız 48 px üstünde, tek 2–3 sn döngü, ilk
görünümde. Favicon, evrak ve baskı **daima statik**.

**En küçük ölçüler.** Ekranda 16 px işaret / 96 px kilit. Baskıda 6 mm işaret / 25 mm kilit.
Koruma alanı: işaret yüksekliğinin yarısı, her yönde.

## Varlıklar

**İşaret (`../brand/logo/`)** — 7 SVG, viewBox 200×200: `tamrenk` · `tamrenk-koyu` (koyu
zeminde lacivert dilim beyaza döner) · `iki-renk` · `tek-renk-lacivert` · `tek-renk-beyaz` ·
`yalniz-turkuaz` · `siyah`. Wordmark **yola çevrilmedi** ve çevrilmez — metin olarak kalır.
`venthub-kilit-yatay.html` kilidin referans parçasıdır.

**İkonlar (`../brand/icons/`)** — 144 SVG. 7 kategori + 9 senaryo, üç boy (64/48/24 px), üç
sürüm. Adlandırma: `venthub-[kat|sen]-[ad]-[px]-[surum].svg`. Alt dallar için ikon **yok** —
22 px'te ayırt edilemiyor; ayrımı ürün fotoğrafı sağlar.

Hangi boyun nerede kullanılacağı uygulama aşamasında görerek kararlaştırılacak (OPS kararı).

**Yazı tipleri** — Archivo (SIL OFL), Source Serif 4 (SIL OFL), IBM Plex Mono (SIL OFL).
Üçü de Google Fonts'ta; ticari kullanım serbest. Font ikilesi yapılmadı, hepsi gerçek aile.
Bu paket font binary'si taşımaz: `next/font/google` ile yüklenir.

## Depoya alma adımları

1. `brand/tokens.css` içeriği `src/index.css`'in `:root` bloğuna girer. Değişen mevcut
   tokenlar: `--brand-cyan` (bugün `#22D3EE`) ve `--primary-navy` (bugün parlak royal mavi).
   `--action-terracotta` yenidir. Mevcut `gold-accent` `#D97706` **dokunulmaz.**
2. `brand/tailwind-brand.js` `theme.extend`'e birleşir. Admin ölçekleri ve 3D materyal
   renkleri kapsam dışıdır.
3. `src/app/layout.tsx` içindeki `next/font/google` **Inter** tanımı Archivo'ya çevrilir;
   `--font-sans` değişken adı korunur. Source Serif 4 ve IBM Plex Mono eklenir.
4. `brand/icons/` → `public/icons/`, `brand/logo/` → `public/brand/`.
5. Renk dışı tokenlar `src/design-system/tokens.js` düzenini korur.
6. Ham hex koda yazılmaz; `tsx/ts` içinde ham hex yasağı kapısı vitrine genişletilir
   (3D materyal renkleri ve chart karantinası gerekçeli istisna listesinde kalır).

**Statü notu:** bu adımlar **öneri**dir, karar değil (OPS, 5 Eylül). Uygulama sırası ve
"tek seferde mi, sayfa sayfa mı" sorusu yapısaldır, karar Recep'te. Kod tarafı kararı
REC-147 token fark dosyasıyla alınır.

## Bilinçli eksikler

Uydurulmaması için açıkça yazıldı:

- **Boşluk ölçeği.** DESIGN-MENU'nün ölçtüğü tasarım sözleşmesinde 22 değer var ve tek
  sayılar bilinçli; 4'e yuvarlama çizimi bozuyor. Ayrı karar turu bekliyor.
- **Hareket tokenları.** Deponun mevcut `transitionProperty` ölçeği korunur; marka tarafı
  ölçmedi.
- **Nötr ölçeğin tamamı.** Burada yalnız çizimde fiilen kullanılan yüzeyler var. 15 kademeli
  sıcak nötr ölçek sözleşmede ölçüldü, ayrı iş.
- **Belge sistemi.** Kurumsal belge kuralları (A4, ≥12 pt, "kapalı bekler" şeridi, tek renk
  provası) DESIGN-BELGE projesinde. Kılavuza bölüm olarak eklenmesi Recep'in açılışını
  bekliyor.
- **Ekran tasarımları.** DESIGN-MENU'de; bu paket ekran taşımaz.
- **Deponun bugünkü tema kurgusu ölçülmedi.** "Koyu-mod-birincil terk edilir" ifadesi
  ölçülmemiş bir iddiaydı, geri alındı — ölçüm gerekiyor.

## Marka listesi

Yedi marka, bu sıra ve yazımla:
**Vortice · SEAT · AVenS · Nicotra Gebhardt · Danfoss · Casals · Flexiva**

İlk beşinin katalogda ürünü var (173 · 81 · 51 · 35 · 35). Casals ve Flexiva temsil edilen
markalar, ürünü henüz 0. **Storm marka değildir** — SEAT'in ürün serisidir. Yazım veriden
gelir: "SEAT" büyük harf, "AVenS" bu şekilde.

Ürünsüz iki markanın vitrinde görünüp görünmeyeceği ayrı bir sorudur (vaat bütünlüğü kuralı),
kimlik kararı değil.

## Kaynaklar

- **Karar kaydı:** DESIGN-MARKA projesi `CLAUDE.md` — bütün kararların gerekçeli hâli
- **Çizim kaynağı:** `1 Venthub Marka Kilavuzu.dc.html` Bölüm A–E
- **Ölçüm:** `tasarim-sozlesmesi-v1.json` (DESIGN-MENU'nün v15 Menü + v9 Ana Sayfa ölçümü,
  13 çapa, frekans sayılı). Kılavuzla çelişirse **sözleşme kazanır** — ölçümdür.
  Bugün çelişmiyorlar: iki proje birbirinden habersiz aynı üç hex, aynı üç aile, yarıçap 0,
  gölge yok değerlerine varmış.
- **İkon üreteci:** `tools/icons-to-svg.js` — ikon çizimi değişirse 144 SVG tek adımda
  yeniden üretilir
- **Depo:** peckop/venthub-hvac-esite @ master, bkz. `github.md`

— DESIGN-MARKA (Opus) 2026-09-05

