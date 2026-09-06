
# DESIGN-MARKA → OPS · 2026-09-05 · DS yayında, çip bağlandı — REC-149 ana amaç kapandı

Recep Published'ı işaretledi ve **org default** yaptı. Doğrulama yaptım.

## Ölçüm — bu projede çip bağlı

Marka Kılavuzu projesinde çip artık **VentHub Design System**. Bağlantı tanımlı:

| Alan | Değer |
|---|---|
| Yol | `_ds/venthub-design-system-31b0824c-8d7e-4a4c-94c7-8c094a1c62b7/` |
| Global ad | `VentHubDesignSystem_31b082` |
| Şablon | `Kabuk` — `templates/kabuk/`, tek tıkla başlangıç |
| `kaynak_updatedAt` | `2026-09-05T13:03:31Z` |
| `karar_updatedAt` | `2026-09-05T12:57:54Z` |
| `sozlesme_updatedAt` | `2026-09-05T11:34:16Z` |

Bağlı sistemin kılavuz metni bugünün üç düzeltmesini de taşıyor: oluk 40 px ve "bandın oluğu
ortalanmış sütundan türetilmez" · marka listesi 5 + 2 etiketli, 3·2·2 kaldırıldı · K22 metin
alfa yasağı + `--text-on-dark-muted` #8FA2BD · turkuazın üç koyu zeminde de küçük metinde
geçmediği ve `#24395C` üstünde muted ink'in 4.45:1 sınırı. Yani REC-149 boyunca alınan
kararlar tüketici tarafına ulaştı.

**Org default:** yeni açılan her proje çipi VentHub açar. Broadsheet varsayılanı düştü —
REC-149'un açılış gerekçesi buydu.

## DS'in kendi projesinde çip seçilemiyor — doğru davranış

Recep DS projesinde çipi ayarlamayı denedi, "Failed to update design systems" aldı. Bu bir
kusur değil: DS projesi sistemin **kaynağı**, tüketicisi değil; kendine bağlanması döngü olur.
Yapılacak bir şey yok.

## Kalan iki proje — çip elle çevrilecek

Org default yalnız **yeni** projeleri etkiliyor; açık projelerin çipi kendiliğinden değişmez.

- **DESIGN-MENU (15A)** `be615496…` — ekran kaynağı; kabuk, ikon ve tokenları artık DS'ten
  alabilir. Şu an Broadsheet.
- **DESIGN-BELGE** `4e491d28…` — kendi kaydında logo dilimlerini kılavuz CSS'inden kopyaladığını
  yazmıştı; DS bağlanınca `assets/logo/` üzerinden tek kaynağa döner (K23).

İkisi de benim şeridim değil, çevirmeyi ben yapamam. Sıra ve zamanlama OPS'ta.

## Bende kalan iş

Kılavuz kaynak, DS türev. Bugünkü üç düzeltme DS metnine girdi, tazeleme gerekmedi. Bundan
sonra kılavuzda karar değişirse DS tazelenir — tetik OPS, uygulama ben.

Kendi projemde artık tüketici kuralı geçerli: yeni DC yazarken dört token CSS + `styles.css` +
`_ds_bundle.js` yüklenir, bileşenler bundle'dan mount edilir, kabuk gerekirse
`templates/kabuk/` kopyalanır. Elle logo çizimi ve elle bileşen kopyası yok. Bu kaydıma yazıldı.

**Kullanılan `/` yeteneği:** bu turda yok (doğrulama).

— DESIGN-MARKA (Opus) 2026-09-05

