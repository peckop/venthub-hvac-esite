
# Hangi dosyaya bakmalı?

## Teslim — bakılacak dosya bu
**`Venthub Marka Kilavuzu.dc.html`** — marka kılavuzunun tamamı. Bölüm A logo sistemi ·
B kategori ve senaryo ikonları · C site kabuğu · D dosya listesi · E birleştirme kararları.
Başka bir şeye bakmak zorunda değilsin; kalan dosyalar bunun kaynağı, provası ya da kaydı.

## Provalar — üretilen dosyaların göründüğü yer
| Dosya | Ne gösterir |
|---|---|
| `Venthub Ikon SVG Provasi.dc.html` | 144 ikon SVG'si · **64 / 48 / 24 px** · açık zemin, tek renk lacivert, koyu zemin |
| `logo-svg-provasi.html` | 28 logo SVG'si · işaret, iki kilit dizilimi, favicon, avatar, paylaşım görseli |

## Üretilen varlıklar (klasör)
| Klasör | İçerik |
|---|---|
| `brand/icons/` | 144 SVG — 16 ikon × 64/48/24 px × tamrenk / lacivert / koyu |
| `brand/logo/` | 28 SVG — işaret 7 · yatay kilit 7 · dikey kilit 7 · favicon 4 · avatar 2 · paylaşım 1 |
| `brand/tokens.css` | Renk · yazı tipi · yarıçap tokenları (HSL üçlüsü, depo düzeni) |
| `brand/tailwind-brand.js` | Tailwind `theme.extend` eşleme parçası |
| `brand/README.md` | Paketin kendi kılavuzu (palet, yazı tipi rolleri, marka listesi, depoya alma) |
| `handoff/README.md` | Claude Code devir paketi |

## Karar ve kayıt
| Dosya | Ne |
|---|---|
| `CLAUDE.md` | Bütün kararların kaydı — sohbet sıkışsa bile kaybolmaz |
| `venthub-proje-ayarlari.md` | Diğer projelere yapıştırılacak ayar notu |
| `github.md` | Depo bağlantısı ve ekran haritası |
| `ops-iletisim-protokolu.md` | OPS ↔ Design iletişim kuralları (OPS yazdı) |
| `kararlar-vitrin-15a-2026-09-04.md`* | Linear karar belgesinin kopyası, K1–K19 |
| `venthub-canli-durum.md`* | Canlı katalog ve site gerçeği |
| `tasarim-sozlesmesi-v1.json`* | 15A'nın ölçtüğü token sözleşmesi |

\* OPS yazar, ben değiştirmem.

## Arşiv — silinmez, bakılması gerekmez
`Venthub Logo.dc.html` (logo arama turları) · `Venthub Sessiz Fan Alternatifleri.dc.html` ·
`Venthub Isi Geri Kazanim Alternatifleri.dc.html` · `Venthub Kategori Ikonlari.dc.html` ·
`Venthub Senaryo Ikonlari.dc.html` (ikonların CSS kaynağı, SVG'ler buradan üretiliyor) ·
`Venthub Karsilastirma.dc.html` · `Venthub Yesil Vurgu.dc.html` · `svg/` (eski altı ikon,
geçersiz) · `tools/icons-to-svg.js` (ikon → SVG dönüştürücü) · `marka-deney-brief-1.md`

## OPS notları — tarih sırasıyla
`design-marka-ops-notu-2026-09-05.md` → `-b` → `-c` → `-d` → `-e` → `-f`
`ops-cevap-marka-2026-09-05.md` · `ops-cevap-marka-b-2026-09-05.md` (OPS'un cevapları)

